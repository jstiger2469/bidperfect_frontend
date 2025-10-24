# Quick Implementation Guide: Add beforeunload to All Steps

## Current Status
✅ **Implemented in:** `CompanyProfileStep.tsx`  
⏳ **Pending:** 7 other step components

## How to Add to Each Step (3-Minute Checklist)

### 1. Import the Hook
```typescript
import { useStepSaver, useBeforeUnloadSave } from '@/lib/useOnboarding'
//                     ^^^^^^^^^^^^^^^^^^^^^ Add this
```

### 2. Set Up the Hook
```typescript
export function MyStep({ onContinue }: Props) {
  const { watch, formState: { isValid } } = useForm({ ... })
  const currentData = watch()

  const { saveImmediate } = useStepSaver({
    step: 'MY_STEP',
    onSuccess: (response) => {
      clearPendingChanges() // ← ADD THIS LINE
      if (response.nextStep) onContinue()
    },
  })

  // ADD THESE 4 LINES
  const clearPendingChanges = useBeforeUnloadSave(
    'MY_STEP',           // ← Your step name
    () => currentData,   // ← Getter function
    isValid              // ← From formState
  )

  // ... rest of component
}
```

### 3. That's It!
No other changes needed. The hook automatically:
- Tracks valid form data
- Shows browser dialog on unload
- Sends data via sendBeacon
- Clears flag after successful save

---

## Step-by-Step Checklist

### ✅ CompanyProfileStep.tsx
**Status:** DONE  
**Lines changed:** 3

### ⏳ AccountVerifiedStep.tsx
**Estimated time:** 3 minutes  
**Current code:**
```typescript
const { saveDebounced, saveImmediate, isSaving } = useStepSaver({
  step: 'ACCOUNT_VERIFIED',
  onSuccess: (response) => {
    if (response.nextStep) {
      onContinue()
    }
  },
})
```

**Updated code:**
```typescript
import { useStepSaver, useBeforeUnloadSave } from '@/lib/useOnboarding'

const { saveDebounced, saveImmediate, isSaving } = useStepSaver({
  step: 'ACCOUNT_VERIFIED',
  onSuccess: (response) => {
    clearPendingChanges() // ← ADD
    if (response.nextStep) {
      onContinue()
    }
  },
})

const clearPendingChanges = useBeforeUnloadSave(
  'ACCOUNT_VERIFIED',
  () => currentData,
  isValid
)
```

### ⏳ OrgChoiceStep.tsx
**Estimated time:** 3 minutes  
**Steps:** Same as above, replace `'ACCOUNT_VERIFIED'` with `'ORG_CHOICE'`

### ⏳ ComplianceIntakeStep.tsx
**Estimated time:** 3 minutes  
**Special case:** Uses `uploadedDocs` state instead of form
```typescript
const clearPendingChanges = useBeforeUnloadSave(
  'COMPLIANCE_INTAKE',
  () => ({ documents: uploadedDocs }),
  uploadedDocs.length > 0 && hasRequiredDocs
)
```

### ⏳ IntegrationsStep.tsx
**Estimated time:** 3 minutes  
**Note:** Optional step, but still useful

### ⏳ TeamStep.tsx
**Estimated time:** 3 minutes  
**Note:** Optional step, but still useful

### ⏳ FirstRfpStep.tsx
**Estimated time:** 3 minutes  
**Special case:** Uses mode + fileId/sampleId
```typescript
const clearPendingChanges = useBeforeUnloadSave(
  'FIRST_RFP',
  () => ({ mode, fileId, sampleId }),
  mode !== 'skip'
)
```

### ⏳ DoneStep.tsx
**Status:** SKIP (no form to save)

---

## Bulk Implementation Script

If you want to add this to all steps at once:

```bash
# Run this from frontend/ directory
for file in components/onboarding/steps/*Step.tsx; do
  echo "Processing $file..."
  # Add import
  sed -i '' 's/useStepSaver/useStepSaver, useBeforeUnloadSave/g' "$file"
  # (Manual: add hook call and clearPendingChanges)
done
```

**Note:** Auto-replacement is tricky due to varying component structures. Recommend manual implementation per the checklist above.

---

## Testing After Implementation

### Quick Test (Per Step)
1. Navigate to step
2. Fill in one field
3. Try to close tab (Cmd+W or click X)
4. ✅ See "Leave site?" dialog
5. Click "Stay"
6. Click "Continue" button
7. ✅ Should NOT see dialog on next step

### Full Flow Test
```bash
npm run test:e2e -- onboarding.spec.ts
```

---

## Total Effort
- **7 components remaining**
- **~3 minutes per component**
- **~20 minutes total**

---

## Bonus: Optional Hook Parameters

For advanced use cases, you can extend the hook:

```typescript
// Example: Custom save delay before unload
const clearPendingChanges = useBeforeUnloadSave(
  'COMPANY_PROFILE',
  () => currentData,
  isValid,
  {
    debounceMs: 500,      // Wait 500ms before marking as pending
    showDialog: true,     // Show browser dialog (default: true)
    logToConsole: true,   // Debug logging (default: false)
  }
)
```

**Current implementation:** No optional params (keeps it simple)  
**Future enhancement:** Could add if needed

---

**Questions?** See `/docs/ONBOARDING_BEFOREUNLOAD.md` for full documentation.

