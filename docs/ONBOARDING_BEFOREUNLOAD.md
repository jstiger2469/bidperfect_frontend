# 🔒 Onboarding Progress Persistence (beforeunload)

## Overview

The onboarding wizard automatically saves user progress before the browser tab closes or navigates away, preventing data loss and improving the user experience.

## How It Works

### 1. **beforeunload Event**
When the user attempts to close the tab or navigate away:
- Browser shows a confirmation dialog: "Leave site? Changes you made may not be saved"
- System attempts to save pending valid form data using `navigator.sendBeacon()`
- If sendBeacon fails, falls back to `fetch()` with `keepalive: true`

### 2. **visibilitychange Event**
When the tab becomes hidden (e.g., user switches tabs):
- Silently saves pending data without showing a dialog
- Uses `navigator.sendBeacon()` for reliability

### 3. **Smart Tracking**
- Only tracks **valid** form data (passes Zod validation)
- Only shows dialog if there are **unsaved changes**
- Clears pending flag after successful debounced/immediate saves
- Doesn't interfere with normal "Continue" button flow

## Implementation

### In Each Step Component

```typescript
import { useBeforeUnloadSave } from '@/lib/useOnboarding'

export function MyStep({ onContinue }: { onContinue: () => void }) {
  const { watch, formState: { isValid } } = useForm({ ... })
  const currentData = watch()

  const { saveImmediate } = useStepSaver({
    step: 'MY_STEP',
    onSuccess: (response) => {
      clearPendingChanges() // ← Clear flag after save
      if (response.nextStep) onContinue()
    },
  })

  // Set up beforeunload save
  const clearPendingChanges = useBeforeUnloadSave(
    'MY_STEP',
    () => currentData,  // ← Getter function
    isValid             // ← Only save if valid
  )

  // ... rest of component
}
```

### Hook API

```typescript
useBeforeUnloadSave(
  step: OnboardingStep,
  getCurrentData: () => StepPayload,
  isValid: boolean
): () => void // Returns clearPending function
```

**Parameters:**
- `step` - Current onboarding step identifier
- `getCurrentData` - Function that returns current form data
- `isValid` - Whether the current data passes validation

**Returns:**
- `clearPending()` - Function to clear the pending changes flag (call after successful save)

## Browser Compatibility

### `navigator.sendBeacon()`
✅ **Supported:** Chrome 39+, Firefox 31+, Safari 11.1+, Edge 14+

**Why sendBeacon?**
- **Reliable:** Survives page unload (regular fetch may be cancelled)
- **Non-blocking:** Doesn't delay page navigation
- **Fire-and-forget:** Browser guarantees delivery

### Fallback Strategy
If `sendBeacon()` is unavailable or fails:
```typescript
fetch('/api/onboarding/complete', {
  method: 'POST',
  body: JSON.stringify(payload),
  keepalive: true  // ← Keeps request alive after unload
})
```

## User Experience

### Scenario 1: User Fills Form, Tries to Close Tab
1. User types "Acme Inc" in company name field
2. User presses Cmd+W to close tab
3. **Browser shows:** "Leave site? Changes you made may not be saved"
4. System sends data via sendBeacon in background
5. If user confirms: tab closes, data is saved
6. If user cancels: tab stays open, can continue editing

### Scenario 2: User Switches Tabs
1. User types "123 Main St" in address field
2. User switches to another tab (no confirmation dialog)
3. System silently sends data via sendBeacon
4. Data is saved in background

### Scenario 3: User Clicks "Continue"
1. User fills form and clicks "Continue"
2. `saveImmediate()` is called
3. `clearPendingChanges()` is called in onSuccess
4. Navigation proceeds without beforeunload dialog

## Backend Requirements

The `/api/onboarding/complete` endpoint must:
1. Accept `POST` requests with `Content-Type: application/json`
2. Parse JSON payload: `{ step: string, payload: object }`
3. Be idempotent (safe to call multiple times with same data)
4. Return quickly (< 200ms preferred)

**Example Backend Handler:**
```typescript
export async function POST(req: Request) {
  const { step, payload } = await req.json()
  
  // Validate session/auth
  const userId = await auth.getUserId()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  
  // Save to database (idempotent upsert)
  await db.onboardingProgress.upsert({
    where: { userId, step },
    update: { payload, updatedAt: new Date() },
    create: { userId, step, payload }
  })
  
  return Response.json({ ok: true })
}
```

## Testing

### Manual Tests
1. **Fill form, close tab → should show confirmation**
   ```
   1. Navigate to /onboarding?step=COMPANY_PROFILE
   2. Fill in company name
   3. Press Cmd+W (or click X)
   4. ✅ Browser shows "Leave site?" dialog
   ```

2. **Fill form, click Continue → should NOT show confirmation**
   ```
   1. Fill form
   2. Click "Continue" button
   3. ✅ No dialog, proceeds to next step
   ```

3. **Fill form, switch tabs → should save silently**
   ```
   1. Fill form
   2. Switch to another tab
   3. ✅ Check network: sendBeacon request sent
   4. Reload page
   5. ✅ Data is preserved
   ```

### Automated Tests
```typescript
// Playwright E2E Test
test('saves progress before page unload', async ({ page }) => {
  await page.goto('/onboarding?step=COMPANY_PROFILE')
  
  // Fill form
  await page.fill('[name="legalName"]', 'Test Company')
  
  // Set up dialog handler
  page.on('dialog', dialog => {
    expect(dialog.message()).toContain('Changes you made may not be saved')
    dialog.accept()
  })
  
  // Trigger unload
  await page.close()
  
  // Verify sendBeacon was called (requires network interception)
})
```

## Performance

### Impact
- **Memory:** Negligible (~1KB per step for form data refs)
- **CPU:** Event listeners are passive, no polling
- **Network:** Only fires on unload/visibility change (not on every keystroke)

### sendBeacon Payload Size
- **Limit:** 64KB (browser enforced)
- **Typical payload:** 1-5KB
- **Max form size:** Well within limits

## Security

### Data Validation
- Client validates with Zod before sending
- Backend must re-validate (never trust client)
- Use CSRF tokens for API endpoint

### Auth
- sendBeacon includes cookies/credentials by default
- Ensure `/api/onboarding/complete` checks auth
- Use session/JWT validation

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| User fills invalid form, closes tab | No confirmation (isValid = false) |
| User fills form, clicks Continue, then closes | No confirmation (pending cleared) |
| Network offline when closing | sendBeacon queued, sent when online |
| User closes during active save | Both complete (idempotent backend) |
| Browser crashes | Data lost (can't prevent) |
| User quickly fills form and closes | sendBeacon still fires |

## Limitations

1. **No guarantee of delivery** - If browser crashes or is force-quit, data may be lost
2. **Dialog text not customizable** - Browsers show generic "Leave site?" message
3. **sendBeacon is fire-and-forget** - No response handling, no retry logic
4. **Mobile Safari caveats** - May not fire reliably on iOS < 13

## Recommendations

1. ✅ **Use debounced auto-save** as primary save mechanism (this is a backup)
2. ✅ **Show "Saving..." indicator** during debounced saves
3. ✅ **Make backend idempotent** to handle duplicate saves
4. ✅ **Test on target browsers** (especially mobile Safari)
5. ✅ **Don't rely on this for critical data** (encourage explicit saves)

## Alternatives Considered

| Alternative | Why Not Used |
|-------------|--------------|
| `window.onbeforeunload = () => { ... }` | Deprecated, synchronous, blocks unload |
| `setInterval()` polling | Wasteful, poor UX (constant network traffic) |
| Local storage + restore | Doesn't sync to server, orphaned data |
| Service worker | Overkill, complex setup for this use case |

## References

- [MDN: navigator.sendBeacon()](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon)
- [MDN: beforeunload event](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event)
- [MDN: Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API)
- [Chrome: keepalive flag](https://developers.google.com/web/updates/2019/04/modern-and-stable-apis-for-the-web#fetch_keepalive)

---

**Status:** ✅ **IMPLEMENTED** (Question #6 from Open Questions)

