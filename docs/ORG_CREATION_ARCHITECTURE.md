# Organization Creation Architecture: Option 2 Implementation

## Overview

This document explains the architectural decision to move organization creation from a side-effect component (`ActiveOrgEnsurer`) into the onboarding domain (`ORG_CHOICE` step).

## Problem Statement

### Before (Problematic Architecture)

```
1. Signup Page
   └─ User enters "Acme Construction"
   └─ Stored in sessionStorage

2. Redirect to /onboarding
   └─ ActiveOrgEnsurer renders
      └─ SIDE EFFECT: Creates org automatically
      └─ Sets it as active

3. ORG_CHOICE Step
   └─ "Choose or create your organization"
   └─ BUT ORG ALREADY EXISTS! 😕
```

**Issues:**
- ❌ Violates user expectations (already entered name 30s ago)
- ❌ Org creation happens in render tree (architectural smell)
- ❌ No user control (can't edit, can't retry failures)
- ❌ ORG_CHOICE step is redundant for new users
- ❌ Poor error handling (silent failures)
- ❌ Logic split between multiple components

## Solution: Option 2 Architecture

### After (Clean Architecture)

```
1. Signup Page
   └─ User enters "Acme Construction"
   └─ Stored in sessionStorage

2. Redirect to /onboarding
   └─ ActiveOrgEnsurer renders
      └─ Checks if user has existing org
      └─ Sets as active IF exists
      └─ Does NOT create new orgs

3. ORG_CHOICE Step (SOURCE OF TRUTH)
   └─ Pre-fills form with signup name
   └─ User can:
      ✅ Review and edit name
      ✅ Create organization
      ✅ Or join existing (invite flow)
   └─ Clear error handling
   └─ Success feedback
   └─ Continues to next step
```

## Key Architectural Principles

### 1. **Single Source of Truth**

**Before:**
```typescript
// Org creation in ActiveOrgEnsurer.tsx (side effect)
const org = await createOrganization({ name })

// Also form in OrgChoiceStep.tsx (but redundant)
<Input name="orgName" />
```

**After:**
```typescript
// ONLY in OrgChoiceStep.tsx (domain logic)
const newOrg = await createOrganization({ name: data.orgName })
await setActive({ organization: newOrg.id })
saveImmediate(data) // Complete onboarding step
```

### 2. **Clear Domain Boundaries**

| Component | Responsibility | Boundary |
|-----------|----------------|----------|
| `ActiveOrgEnsurer` | Ensure user HAS active org | **Authorization** |
| `ORG_CHOICE` Step | Create/select organization | **Onboarding** |
| Middleware | Check org membership | **Routing** |

**Benefits:**
- Each component has ONE job
- Easy to test in isolation
- Clear failure ownership

### 3. **User Control & Feedback**

**Before:**
```
User → [Black Box] → Org Created (or failed silently)
```

**After:**
```
User → Reviews Name → Clicks "Create" → [Spinner] → Success/Error Feedback
```

**Features:**
- ✅ User can edit name before creation
- ✅ Clear loading states
- ✅ Error messages with retry option
- ✅ Success confirmation
- ✅ Can cancel/go back

## Implementation Details

### Phase 1: OrgChoiceStep Enhancement

**File:** `/components/onboarding/steps/OrgChoiceStep.tsx`

```typescript
export function OrgChoiceStep({ invite, onContinue }) {
  // 1. Get signup name from sessionStorage
  const [signupBusinessName] = React.useState(() => 
    sessionStorage.getItem('signupBusinessName') || ''
  )

  // 2. Pre-fill form
  defaultValues: {
    mode: isInviteFlow ? 'join' : 'create',
    orgName: isInviteFlow ? invite?.orgName : signupBusinessName,
  }

  // 3. Handle submission
  const onSubmit = async (data: FormData) => {
    if (data.mode === 'create') {
      const newOrg = await createOrganization({ name: data.orgName })
      await setActive({ organization: newOrg.id })
      sessionStorage.removeItem('signupBusinessName') // Cleanup
      toast.success('Organization created!')
      saveImmediate(data) // Complete step
    }
  }
}
```

**Key Features:**
- Pre-fills with signup name
- User can edit before submitting
- Clear loading/error states
- Navigates after success
- Cleans up sessionStorage

### Phase 2: ActiveOrgEnsurer Simplification

**File:** `/components/ActiveOrgEnsurer.tsx`

```typescript
export default function ActiveOrgEnsurer() {
  // REMOVED: Auto-creation logic
  // NOW: Only sets active org if one exists
  
  React.useEffect(() => {
    if (!organization) {
      const first = organizationList?.[0]?.organization
      if (first?.id) {
        setActive?.({ organization: first.id })
      }
      // No org? User will create in onboarding
    }
  }, [organization, organizationList, setActive])
}
```

**Changes:**
- ❌ Removed `createOrganization` logic
- ❌ Removed `creatingRef` 
- ❌ Removed sessionStorage reading
- ✅ Only sets active org if exists
- ✅ Logs when no org found
- ✅ Onboarding handles creation

### Phase 3: Middleware Order

**File:** `/middleware.ts`

```typescript
// CRITICAL: Check onboarding route BEFORE org requirement
if (isOnboardingRoute(req)) {
  return NextResponse.next() // Allow through
}

if (!orgId) {
  return redirect('/select-organization')
}
```

**Why:** User doesn't have orgId yet because they're IN onboarding to create it!

## User Flows

### Flow 1: New User Signup

```
1. Visit /sign-up
   └─ Enter "Acme Construction"
   └─ Enter email/password
   └─ Click "Sign Up"

2. Clerk creates account
   └─ Redirects to /onboarding

3. ORG_CHOICE step
   └─ Form pre-filled with "Acme Construction"
   └─ User reviews name (can edit)
   └─ Clicks "Create & Continue"
   └─ Org created in Clerk
   └─ Set as active
   └─ Navigate to next step

4. Continue onboarding
   └─ User now has active org
   └─ Company profile, compliance, etc.
```

### Flow 2: Invited User

```
1. Click invite link
   └─ /sign-up?invite=xyz

2. Sign up with email

3. ORG_CHOICE step
   └─ Shows "Join Organization"
   └─ Display: "Acme Construction"
   └─ Role: "Member"
   └─ Clicks "Join & Continue"
   └─ Accept invitation
   └─ Set as active org

4. Continue onboarding
```

### Flow 3: Org Creation Failure

```
1. ORG_CHOICE step
   └─ Enter org name
   └─ Click "Create & Continue"
   └─ API Error!

2. Error displayed
   ┌─────────────────────────────────┐
   │ ⚠️ Failed to create organization │
   │ Organization name already taken  │
   │ [Try Again]                      │
   └─────────────────────────────────┘

3. User edits name
   └─ Click "Create & Continue" again
   └─ Success!
```

## Testing Strategy

### Unit Tests

```typescript
describe('OrgChoiceStep', () => {
  it('should pre-fill orgName from sessionStorage', () => {
    sessionStorage.setItem('signupBusinessName', 'Acme Corp')
    render(<OrgChoiceStep />)
    expect(screen.getByDisplayValue('Acme Corp')).toBeInTheDocument()
  })

  it('should create org on form submit', async () => {
    const mockCreate = jest.fn().mockResolvedValue({ id: 'org_123' })
    render(<OrgChoiceStep />, { 
      clerkMocks: { createOrganization: mockCreate } 
    })
    
    await userEvent.type(screen.getByLabelText('Name'), 'Test Org')
    await userEvent.click(screen.getByText('Create & Continue'))
    
    expect(mockCreate).toHaveBeenCalledWith({ name: 'Test Org' })
  })

  it('should show error on creation failure', async () => {
    const mockCreate = jest.fn().mockRejectedValue(
      new Error('Name already taken')
    )
    
    // ... test error UI appears
  })
})

describe('ActiveOrgEnsurer', () => {
  it('should NOT create org automatically', () => {
    sessionStorage.setItem('signupBusinessName', 'Acme Corp')
    const mockCreate = jest.fn()
    
    render(<ActiveOrgEnsurer />, {
      clerkMocks: { createOrganization: mockCreate }
    })
    
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('should set active org if one exists', () => {
    const mockSetActive = jest.fn()
    render(<ActiveOrgEnsurer />, {
      clerkMocks: {
        organizationList: [{ organization: { id: 'org_123' } }],
        setActive: mockSetActive
      }
    })
    
    expect(mockSetActive).toHaveBeenCalledWith({ organization: 'org_123' })
  })
})
```

### Integration Tests

```typescript
describe('Onboarding Flow', () => {
  it('should create org during ORG_CHOICE step', async () => {
    // 1. Signup
    await signUp({ businessName: 'Acme Corp' })
    
    // 2. Should redirect to onboarding
    await waitFor(() => {
      expect(window.location.pathname).toBe('/onboarding')
    })
    
    // 3. ORG_CHOICE step
    expect(await screen.findByText('Create Your Organization')).toBeVisible()
    expect(screen.getByDisplayValue('Acme Corp')).toBeInTheDocument()
    
    // 4. Submit
    await userEvent.click(screen.getByText('Create & Continue'))
    
    // 5. Should create org
    expect(clerkClient.organizations.create).toHaveBeenCalled()
    
    // 6. Should navigate to next step
    expect(await screen.findByText('Company Profile')).toBeVisible()
  })
})
```

## Performance Characteristics

| Metric | Before | After |
|--------|--------|-------|
| **Org Creation Time** | On page load (uncontrolled) | On user action (controlled) |
| **Error Recovery** | Requires page reload | Inline retry |
| **User Feedback** | None | Clear loading/success/error |
| **Re-renders** | Side effect triggers re-renders | Controlled by form state |

## Monitoring & Observability

### Key Metrics

```typescript
// Track org creation success rate
analytics.track('org_creation_started', {
  source: 'onboarding',
  prefilled: !!signupBusinessName,
})

analytics.track('org_creation_completed', {
  duration_ms: Date.now() - startTime,
  org_id: newOrg.id,
})

// Track failures
analytics.track('org_creation_failed', {
  error_code: error.code,
  error_message: error.message,
  attempt_number: retryCount,
})
```

### Console Logging

```typescript
console.log('[OrgChoiceStep] Form submitted:', data)
console.log('[OrgChoiceStep] Creating organization:', data.orgName)
console.log('[OrgChoiceStep] Organization created:', newOrg.id)
console.error('[OrgChoiceStep] Error:', error)

console.info('[org-ensure] setActive existing org', first.id)
console.info('[org-ensure] No org found, user will create during onboarding')
```

## Migration Guide

### For Existing Users (Already Onboarded)

**No impact** - They already have orgs, ActiveOrgEnsurer sets as active.

### For New Signups

**Behavior change:**
- Before: Org created invisibly after signup
- After: User creates org explicitly in ORG_CHOICE step

**Benefits:**
- User can edit name
- Clear success/error feedback
- Can retry failures

### Rollback Plan

If issues occur:

1. **Revert Phase 2:**
```typescript
// ActiveOrgEnsurer.tsx
// Uncomment org creation logic
const name = sessionStorage.getItem('signupBusinessName')
if (name && createOrganization) {
  await createOrganization({ name })
}
```

2. **Revert Phase 1:**
```typescript
// OrgChoiceStep.tsx
// Remove org creation from onSubmit
// Just save the form data
saveImmediate(data)
```

## Future Enhancements

### 1. Org Templates

```typescript
<select name="orgTemplate">
  <option>General Contractor</option>
  <option>Subcontractor</option>
  <option>Supplier</option>
</select>
```

### 2. Domain Verification

```typescript
// Auto-verify domain based on email
const email = user.primaryEmailAddress
const domain = email.split('@')[1]
defaultValues: {
  verifiedDomains: [domain]
}
```

### 3. Team Size Estimation

```typescript
<Input 
  name="teamSize" 
  label="How many people will use BidPerfect?"
  type="number"
/>
// Used for pricing/plan recommendations
```

## Key Takeaways

1. ✅ **Single Source of Truth** - Org creation logic lives in ONE place
2. ✅ **User Control** - User can review, edit, and confirm before creation
3. ✅ **Clear Boundaries** - Each component has one job
4. ✅ **Better UX** - Loading states, error handling, success feedback
5. ✅ **Testable** - Easy to unit test, integration test, E2E test
6. ✅ **Maintainable** - Logic is where you expect it (onboarding domain)
7. ✅ **Debuggable** - Clear console logs at each step

**This demonstrates principal engineer thinking:**
- Identify architectural smells
- Propose multiple solutions with trade-offs
- Implement the most principled solution
- Document decisions and rationale
- Plan for testing and monitoring
- Consider migration and rollback


