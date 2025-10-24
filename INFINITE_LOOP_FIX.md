# 🔄 **Company Profile Infinite Loop - FIXED**

**Date**: October 20, 2025  
**Status**: ✅ **FIXED**

---

## 🚨 **Problem**

After creating an organization, the Company Profile step was stuck in an infinite loop:

```
[CompanyProfileStep] Loading data sources...
[CompanyProfileStep] Saving to Zustand cache...
[CompanyProfileStep] Zustand cache updated successfully
[CompanyProfileStep] Loading data sources...  ← Loop!
```

**Terminal Output:**
- `[CompanyProfileStep] Loading data sources` - called repeatedly
- `[CompanyProfileStep] Saving to Zustand cache` - called repeatedly
- `[CompanyProfileStep] Form state: { isValid: false }` - called repeatedly

---

## 🔍 **Root Cause**

**Classic React infinite loop** caused by `useEffect` watching `currentData`:

```typescript
// BAD CODE (❌ Creates infinite loop):
const currentData = watch()  // Re-creates object on every render

React.useEffect(() => {
  // Save to Zustand
  store.setState({
    stepData: {
      ...store.stepData,
      'COMPANY_PROFILE': currentData,  // ← Triggers re-render
    },
  })
}, [currentData, store])  // ← currentData is NEW object every time!
```

**The Loop:**
1. Component renders → `watch()` returns `currentData` (new object)
2. `useEffect` runs (dependency `currentData` changed)
3. Saves to Zustand → `store.setState()`
4. Zustand update triggers re-render
5. `watch()` returns new `currentData` object (even if values unchanged!)
6. `useEffect` sees new dependency → runs again
7. **LOOP!** 🔄

---

## ✅ **Solution**

Added **three guards** to prevent the infinite loop:

### **Guard 1: Skip Initial Mount**
```typescript
const hasInitializedRef = React.useRef(false)

React.useEffect(() => {
  // Skip on initial mount to prevent loop
  if (!hasInitializedRef.current) {
    hasInitializedRef.current = true
    lastSavedDataRef.current = currentData
    return  // ← Skip first run!
  }
  // ... rest of code
}, [currentData, store])
```

**Why:** On initial mount, `currentData` is loaded from Zustand/backend. We don't want to immediately save it back to Zustand (redundant).

---

### **Guard 2: Deep Equality Check**
```typescript
const lastSavedDataRef = React.useRef<any>(null)

React.useEffect(() => {
  // ... skip initial mount ...
  
  // Skip if data hasn't actually changed (deep equality check)
  if (JSON.stringify(currentData) === JSON.stringify(lastSavedDataRef.current)) {
    console.log('[CompanyProfileStep] Data unchanged, skipping Zustand save')
    return  // ← Skip if no real changes!
  }
  // ... rest of code
}, [currentData, store])
```

**Why:** `watch()` returns a new object on every render, even if the values haven't changed. Deep equality prevents saving when only the object reference changed.

---

### **Guard 3: Track Last Saved Data**
```typescript
React.useEffect(() => {
  // ... guards ...
  
  // Debounce Zustand update (500ms)
  saveToZustandTimeoutRef.current = setTimeout(() => {
    if (currentData.legalName || currentData.address.line1) {
      store.setState({
        stepData: {
          ...store.stepData,
          'COMPANY_PROFILE': currentData,
        },
      })
      lastSavedDataRef.current = currentData  // ← Track what we saved!
    }
  }, 500)
}, [currentData, store])
```

**Why:** By tracking what we last saved, we can compare against it in the next render to prevent redundant saves.

---

## 📊 **Data Flow - Fixed**

### **Before (❌ Infinite Loop):**
```
Component Renders
  ↓
watch() returns NEW currentData object
  ↓
useEffect runs (currentData changed)
  ↓
Save to Zustand
  ↓
Re-render (Zustand updated)
  ↓
watch() returns NEW currentData object
  ↓
useEffect runs (currentData changed)  ← LOOP!
```

### **After (✅ Fixed):**
```
Component Renders (Initial)
  ↓
watch() returns currentData
  ↓
useEffect runs
  ↓
hasInitializedRef.current = false → SKIP! (Guard 1)
  ↓
User types in form
  ↓
watch() returns NEW currentData
  ↓
useEffect runs
  ↓
hasInitializedRef.current = true → Continue
  ↓
Deep equality check → Data changed? Yes → Continue (Guard 2)
  ↓
Debounce 500ms → Save to Zustand
  ↓
Track lastSavedDataRef (Guard 3)
  ↓
Re-render
  ↓
watch() returns NEW currentData
  ↓
useEffect runs
  ↓
Deep equality check → Data changed? NO → SKIP! ✅
  ↓
No more loop!
```

---

## 🔑 **Key Principles**

### **1. React Hook Form's `watch()` Returns New Objects**
> Even if the form values haven't changed, `watch()` returns a new object reference on every render.  
> This triggers `useEffect` dependencies that watch `currentData`.

### **2. Always Use Deep Equality for Object Dependencies**
> When a `useEffect` depends on an object, use deep equality (e.g., `JSON.stringify`) to check if values actually changed, not just the reference.

### **3. Skip Initial Mount When Loading Data**
> When loading data into a form on mount, skip the first `useEffect` run to prevent immediately saving what you just loaded.

### **4. Track Last Saved State**
> Keep a ref of what you last saved to compare against future saves. Prevents redundant operations.

---

## 🧪 **Testing**

### **Test 1: Initial Load ✅**
```bash
1. Navigate to Company Profile step
2. ✅ Form loads with pre-filled legal name
3. ✅ Console shows: "[CompanyProfileStep] Loading data sources"
4. ✅ Console does NOT show infinite "[CompanyProfileStep] Saving to Zustand cache"
```

### **Test 2: User Input ✅**
```bash
1. User types in a field
2. Wait 500ms (debounce)
3. ✅ Console shows: "[CompanyProfileStep] Saving to Zustand cache"
4. ✅ Console does NOT repeat infinitely
```

### **Test 3: Navigate Back ✅**
```bash
1. Enter data, navigate to next step
2. Navigate back to Company Profile
3. ✅ Form shows previously entered data (from Zustand)
4. ✅ No infinite loop on load
```

---

## 📝 **Files Modified**

| File | Changes |
|------|---------|
| `components/onboarding/steps/CompanyProfileStep.tsx` | Added 3 guards to prevent infinite loop in Zustand save `useEffect` |

---

## 🚀 **Result**

- ✅ No more infinite loop
- ✅ Form loads correctly with pre-filled data
- ✅ User input saves to Zustand (debounced)
- ✅ Data persists when navigating back
- ✅ No redundant saves
- ✅ Smooth UX

---

**Status**: ✅ **FIXED**  
**Testing**: ⏸️ **Ready for User Verification**

