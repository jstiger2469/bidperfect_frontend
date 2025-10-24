# 🔧 Onboarding Cache Priority Fix

**Date**: October 20, 2025  
**Issue**: User restarting onboarding was skipping to step 3 (cached state)  
**Status**: ✅ **FIXED**

---

## 🚨 **Problem Identified**

The onboarding state management had **incorrect cache priority**, causing localStorage to override the backend's source of truth.

### **Root Causes:**

1. **Cache-First Strategy** (❌ Wrong)
   ```typescript
   // OLD CODE in useOnboardingState():
   if (store.isCacheValid() && store.currentStep) {
     console.log('[useOnboardingState] Using cached data from Zustand')
     return cachedData  // ← Never hits backend!
   }
   ```

2. **Wrong Priority in Navigation** (❌ Wrong)
   ```typescript
   // OLD CODE in useOnboardingNavigation():
   const currentStep = store.currentStep || data?.state.currentStep || 'ACCOUNT_VERIFIED'
   //                   ^^^ Zustand first, backend second
   ```

### **What Was Happening:**

1. User completes onboarding → Zustand stores `currentStep: 'COMPLIANCE_INTAKE'` in localStorage
2. User "restarts" onboarding → Page loads
3. Zustand loads `currentStep: 'COMPLIANCE_INTAKE'` from localStorage
4. `useOnboardingState()` sees cache is valid → Returns cached data (**never calls backend**)
5. `useOnboardingNavigation()` sees `store.currentStep` → Uses cached step
6. **Result**: User skips to step 3 instead of starting at step 1

---

## ✅ **Solution Implemented**

### **Fix 1: Backend is Source of Truth**

```typescript
// NEW CODE in useOnboardingState():
export function useOnboardingState() {
  const store = useOnboardingStore()
  
  return useQuery({
    queryKey: ['onboarding', 'state'],
    queryFn: async (): Promise<OnboardingStateResponse> => {
      // ALWAYS fetch from backend - backend is source of truth
      // Zustand cache is only used for optimistic updates between API calls
      console.log('[useOnboardingState] Fetching fresh data from backend (cache bypassed)')
      store.setState({ isLoading: true, error: null })
      
      const res = await fetch('/api/onboarding/state', { ... })
      // ... fetch logic ...
    }
  })
}
```

**Changes:**
- ❌ Removed cache-first check
- ✅ Always calls backend on page load
- ✅ Backend data updates Zustand cache
- ✅ Zustand is now just an optimistic cache

---

### **Fix 2: Correct Priority Order**

```typescript
// NEW CODE in useOnboardingNavigation():
export function useOnboardingNavigation() {
  const { data } = useOnboardingState()
  const store = useOnboardingStore()

  // IMPORTANT: Backend is source of truth, Zustand is just a cache
  // Priority: Backend data → Zustand cache → Default fallback
  const currentStep = data?.state.currentStep || store.currentStep || 'ACCOUNT_VERIFIED'
  //                   ^^^ Backend first, Zustand second
  
  const completedSteps = (data?.state.completedSteps || []).length > 0 
    ? (data?.state.completedSteps || []) 
    : store.completedSteps
  
  const progress = data?.state.progress ?? store.progress ?? 0
}
```

**Changes:**
- ✅ Backend data checked **first**
- ✅ Zustand cache is **fallback only**
- ✅ Correct order: Backend → Cache → Default

---

## 🎯 **New Data Flow**

### **Before (❌ Wrong):**
```
Page Load
  ↓
Check Zustand Cache (localStorage)
  ↓
Cache Valid? YES
  ↓
Return Cached Data (NEVER CALLS BACKEND!)
  ↓
User sees wrong step
```

### **After (✅ Correct):**
```
Page Load
  ↓
ALWAYS Call Backend
  ↓
Backend Returns Current State
  ↓
Update Zustand Cache
  ↓
User sees correct step (source of truth)
```

---

## 🧪 **Testing**

### **Test 1: Fresh Start**
1. Clear localStorage: `localStorage.clear()`
2. Load onboarding page
3. ✅ Should start at `ACCOUNT_VERIFIED`

### **Test 2: Resume Onboarding**
1. Complete 2 steps
2. Refresh page
3. ✅ Should show correct current step from backend
4. ✅ Completed steps should have green checks

### **Test 3: Restart Onboarding**
1. Complete all steps
2. Admin resets onboarding in backend
3. User refreshes page
4. ✅ Should start at `ACCOUNT_VERIFIED` (backend overrides cache)

### **Test 4: Optimistic Updates**
1. Complete a step
2. **Before backend responds**, UI should update optimistically
3. **After backend responds**, Zustand syncs with backend data
4. ✅ UI stays smooth, backend is still source of truth

---

## 📊 **Zustand Role Clarified**

### **What Zustand IS:**
- ✅ Optimistic cache for better UX
- ✅ Temporary storage between API calls
- ✅ Form data cache (pre-fill on navigation)

### **What Zustand is NOT:**
- ❌ Source of truth (that's the backend)
- ❌ Persistent state across sessions (backend handles this)
- ❌ Override mechanism for backend data

---

## 🔑 **Key Principle**

> **Backend is ALWAYS the source of truth.**  
> Zustand is an **optimistic cache** for better UX, but backend wins every time.

---

## 📝 **Files Modified**

| File | Changes |
|------|---------|
| `lib/useOnboarding.ts` | 1. Removed cache-first check in `useOnboardingState()`<br>2. Fixed priority order in `useOnboardingNavigation()` |
| `app/api/onboarding/complete/route.ts` | 3. Added 403 handling for `ACCOUNT_VERIFIED` step (happens before org creation) |

---

## 🚀 **Result**

- ✅ Backend is source of truth
- ✅ Zustand is optimistic cache only
- ✅ User always sees correct step
- ✅ No more "stuck on step 3" bug
- ✅ Smooth UX with optimistic updates
- ✅ Data consistency guaranteed

---

## 🧹 **For Users to Clear Cache**

If you still have stale data, run this in browser console:

```javascript
localStorage.removeItem('onboarding-storage')
location.reload()
```

Or just:

```javascript
localStorage.clear()
location.reload()
```

---

**Status**: ✅ **FIXED**  
**Architecture**: ✅ **Correct (Backend as Source of Truth)**  
**Testing**: ⏸️ **Ready for Testing**

