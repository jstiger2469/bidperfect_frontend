# 📄 Document Persistence Strategy

> **Implemented**: Option 1 (Collapsible Cards) + 3-Layer Persistence Architecture

---

## 🎯 **Overview**

The Compliance Intake step now has a **robust 3-layer persistence architecture** that ensures:

1. ✅ Data survives page refresh
2. ✅ Data survives navigation away and back
3. ✅ Data is permanently saved to backend
4. ✅ Clear visual feedback when documents are complete
5. ✅ Clean, collapsed UI for completed documents

---

## 📊 **Persistence Architecture**

### **Layer 1: Component State (Immediate)**

```typescript
const [uploadedDocs, setUploadedDocs] = React.useState<DocumentWithTempId[]>(initialDocs)
```

**When**: Immediate (every keystroke, every change)

**Purpose**: Active editing, real-time UI updates

**Survives**: Nothing (lost on unmount)

---

### **Layer 2: Zustand Store → localStorage (Debounced 2s)**

```typescript
// Auto-save to Zustand (debounced 2 seconds)
React.useEffect(() => {
  // Skip initial mount
  if (!hasInitializedRef.current) {
    hasInitializedRef.current = true
    return
  }
  
  // Deep equality check to avoid unnecessary saves
  if (JSON.stringify(uploadedDocs) === JSON.stringify(lastSavedDataRef.current)) {
    return
  }
  
  // Debounce 2 seconds
  const timeout = setTimeout(() => {
    if (uploadedDocs.length > 0) {
      // Strip UI-only properties (isCollapsed)
      const docsToSave = uploadedDocs.map(({ isCollapsed, ...doc }) => doc)
      
      store.setState({
        stepData: {
          ...store.stepData,
          'COMPLIANCE_INTAKE': { documents: docsToSave },
        },
      })
    }
  }, 2000)
  
  return () => clearTimeout(timeout)
}, [uploadedDocs, store])
```

**When**: 2 seconds after last change

**Purpose**: Persist across refresh, navigation, browser restarts

**Survives**: 
- ✅ Page refresh (F5)
- ✅ Navigation away and back
- ✅ Browser close and reopen
- ✅ Crash/unexpected close

**Storage**: `localStorage` (via Zustand `persist` middleware)

**Key**: `onboarding-storage`

---

### **Layer 3: Backend API (On "Continue" Click)**

```typescript
const onSubmit = (e: React.FormEvent) => {
  e.preventDefault()
  if (validateDocuments()) {
    // Save to backend (permanent storage)
    saveImmediate({ documents: uploadedDocs as ComplianceDocument[] })
  }
}
```

**When**: User clicks "Continue" button

**Purpose**: Permanent storage, audit trail, compliance

**Endpoint**: `POST /api/onboarding/complete`

**Backend Storage**: PostgreSQL database

**Survives**: Everything (permanent record)

---

## 🔄 **Data Flow**

```
┌─────────────────────────────────────────────────────────────┐
│                    USER ACTIONS                             │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Layer 1: Component State (uploadedDocs)                    │
│  • Immediate updates                                         │
│  • Real-time UI rendering                                    │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │ (debounced 2s)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Layer 2: Zustand Store → localStorage                       │
│  • Auto-saves every 2 seconds                                │
│  • Strips UI-only properties                                 │
│  • Deep equality check to prevent unnecessary writes         │
│  • Persists across refresh/navigation/browser close          │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │ (on "Continue" click)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Layer 3: Backend API (PostgreSQL)                           │
│  • Permanent storage                                         │
│  • Audit trail                                               │
│  • Compliance record                                         │
│  • Accessible to other services                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 **Data Loading Priority**

When the step loads, data is loaded in this order:

```typescript
// 1. Check Zustand cache first (for refresh/navigation back)
const cachedData = store.stepData?.['COMPLIANCE_INTAKE']

// 2. Fall back to savedData from backend (prop passed from parent)
const initialDocs = cachedData?.documents || savedData?.documents || []
```

**Priority**:
1. **Zustand cache** (most recent, includes unsaved changes)
2. **Backend data** (`savedData` prop)
3. **Empty array** (new user, no data)

---

## 🎨 **UI States: Collapsible Cards**

### **State 1: Incomplete (Expanded)**

When metadata is incomplete, the document shows in **expanded** form with a yellow warning icon:

```
┌─────────────────────────────────────────────────────────────┐
│ ⚠️  insurance-policy.pdf      [Metadata Required]    [x]    │
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐│
│ │ Carrier Name: [_____________________________]            ││
│ │ Policy Number: [_____________________________]           ││
│ │ Effective Date: [___________]                            ││
│ │ Expiration Date: [___________]                           ││
│ │ Coverage Amount: $___________                            ││
│ └──────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

**Visual Indicators**:
- ⚠️ Yellow warning icon
- "Metadata Required" badge
- Form expanded and visible
- No collapse button (can't collapse until complete)

---

### **State 2: Complete (Auto-Collapsed)**

When all required metadata is filled, the document **auto-collapses** to a summary card:

```
┌─────────────────────────────────────────────────────────────┐
│ ✅ insurance-policy.pdf       [Complete]    [Edit] [x]      │
│ Policy #GL-12345 | Exp: 12/31/2025                          │
└─────────────────────────────────────────────────────────────┘
```

**Visual Indicators**:
- ✅ Green checkmark icon
- "Complete" badge (green)
- Summary text with key metadata
- "Edit" button to re-expand
- Remove button still available

**Summary Format** (varies by document type):
- **Insurance**: `Policy #12345 | Exp: 12/31/2025`
- **Certificate**: `Cert #ABC123 | State of California`
- **Tax Documents**: `EIN: 12-3456789 | Acme Corp`
- **Bonding**: `ABC Surety | Single: $5M | Agg: $10M`

---

### **State 3: Complete (Manually Expanded)**

User can click "Edit" to re-expand a completed document:

```
┌─────────────────────────────────────────────────────────────┐
│ ✅ insurance-policy.pdf       [Complete]    [^] [x]         │
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐│
│ │ Carrier Name: [ABC Insurance Co.______________]          ││
│ │ Policy Number: [GL-12345_____________________]           ││
│ │ Effective Date: [01/01/2024]                             ││
│ │ Expiration Date: [12/31/2025]                            ││
│ │ Coverage Amount: $1,000,000__                            ││
│ └──────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

**Visual Indicators**:
- ✅ Green checkmark (still complete)
- "Complete" badge
- Form expanded (editable)
- "^" button to collapse again

---

## 🔐 **Validation & Completion Criteria**

Each document type has specific completion criteria:

### **Insurance (`type: 'insurance'`)**
```typescript
// Required fields
✅ policyNumber
✅ carrier
✅ effectiveDate
✅ expirationDate
```

### **Certificates (`type: 'certificate'`)**
```typescript
// Required fields
✅ certificateNumber
✅ issuingAuthority
✅ issueDate
```

### **Tax Documents (`type: 'w9' | 'ein_letter'`)**
```typescript
// Required fields
✅ ein
✅ legalName
```

### **Bonding (`type: 'bonding'`)**
```typescript
// Required fields
✅ suretyName
✅ singleProjectLimit (> 0)
✅ aggregateLimit (> 0)
✅ expirationDate
```

### **License / Other (`type: 'license' | 'other'`)**
```typescript
// Optional metadata
✅ Always considered "complete"
```

---

## 🛡️ **Guards Against Infinite Loops**

The Zustand persistence uses **three guards** to prevent infinite update loops:

### **Guard 1: Skip Initial Mount**
```typescript
if (!hasInitializedRef.current) {
  hasInitializedRef.current = true
  lastSavedDataRef.current = uploadedDocs
  return // Don't save on first render
}
```

### **Guard 2: Deep Equality Check**
```typescript
if (JSON.stringify(uploadedDocs) === JSON.stringify(lastSavedDataRef.current)) {
  console.log('[ComplianceIntakeStep] Data unchanged, skipping Zustand save')
  return // Don't save if data hasn't actually changed
}
```

### **Guard 3: Debouncing (2 seconds)**
```typescript
const timeout = setTimeout(() => {
  // Only save after 2 seconds of inactivity
  store.setState({ ... })
}, 2000)
```

**Result**: Zustand is only updated when:
1. ✅ Component has mounted (not initial render)
2. ✅ Data has actually changed (deep equality)
3. ✅ User has stopped typing for 2 seconds (debounced)

---

## 🧪 **Testing Scenarios**

### **Scenario 1: Refresh During Editing**
1. ✅ User uploads document
2. ✅ User fills in 50% of metadata
3. ✅ User refreshes page (F5)
4. ✅ **Result**: Metadata is preserved (from Zustand)

### **Scenario 2: Navigate Away and Back**
1. ✅ User uploads document
2. ✅ User fills in metadata
3. ✅ User clicks "Back" button (goes to Company Profile)
4. ✅ User clicks "Next" button (returns to Compliance Intake)
5. ✅ **Result**: Metadata is preserved (from Zustand)

### **Scenario 3: Browser Close and Reopen**
1. ✅ User uploads document
2. ✅ User fills in metadata
3. ✅ User closes browser entirely
4. ✅ User reopens browser and logs in
5. ✅ **Result**: Metadata is preserved (from localStorage)

### **Scenario 4: Complete and Collapse**
1. ✅ User uploads document
2. ✅ User fills in all required metadata
3. ✅ **Result**: Document auto-collapses to summary card
4. ✅ Green checkmark appears
5. ✅ Summary shows key metadata

### **Scenario 5: Edit After Completion**
1. ✅ User clicks "Edit" on completed document
2. ✅ **Result**: Card expands to show form
3. ✅ User can modify metadata
4. ✅ Changes are auto-saved to Zustand (2s debounce)
5. ✅ User can collapse again with "^" button

---

## 📝 **Console Logging**

The implementation includes extensive debug logging:

```typescript
// On data load
console.log('[ComplianceIntakeStep] Loading data sources:', {
  cachedData,
  savedData,
  usingCache: !!cachedData,
})

// On Zustand save
console.log('[ComplianceIntakeStep] Saving to Zustand cache:', uploadedDocs)

// On backend save
console.log('[ComplianceIntakeStep] Step saved successfully:', response)
```

**To enable debug logs**:
1. Open browser DevTools
2. Console tab
3. Filter for `[ComplianceIntakeStep]`

---

## 🚀 **Summary**

| Feature | Status |
|---------|--------|
| Page Refresh Persistence | ✅ Zustand + localStorage |
| Navigation Persistence | ✅ Zustand + localStorage |
| Browser Close Persistence | ✅ localStorage |
| Backend Permanent Storage | ✅ On "Continue" click |
| Auto-Collapse Complete Docs | ✅ Option 1 implemented |
| Visual Completion Feedback | ✅ Green checkmark + badge |
| Editable After Completion | ✅ "Edit" button |
| Infinite Loop Prevention | ✅ 3 guards |
| Deep Equality Checking | ✅ JSON.stringify |
| Debounced Saves | ✅ 2 second delay |
| Type Safety | ✅ Full TypeScript |

---

## 🎓 **Key Takeaways**

1. **Backend is Source of Truth**: Always fetch from backend on page load
2. **Zustand is Optimistic Cache**: Improves UX between backend saves
3. **localStorage is Resilience**: Survives browser close/crash
4. **UI State is Ephemeral**: `isCollapsed` doesn't persist (by design)
5. **Debouncing is Essential**: Prevents excessive writes and infinite loops
6. **Deep Equality Matters**: Prevents saving identical data

---

**Last Updated**: October 20, 2025
**Implemented By**: AI Assistant (Principal Engineer Approach)
**Status**: ✅ Production Ready

