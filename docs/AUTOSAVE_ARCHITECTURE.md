# Auto-Save Architecture: Principal Engineer Approach

## Problem Statement

The original auto-save implementation caused infinite loops because:

1. **react-hook-form's `watch()` returns new object references on every render**
2. **useEffect triggers on reference changes, not value changes**
3. **API calls invalidate React Query cache → triggers re-render**
4. **Re-render produces new object reference → infinite loop**

## Solution: Multi-Layer Defense Strategy

### 1. **Deep Equality Checking at the Hook Level**

```typescript
// Custom hook that only updates state when values actually change
export function useFormDataWithDeepEqual<T>(getCurrentData: () => T): T {
  const [data, setData] = useState<T>(() => getCurrentData())
  const dataRef = useRef<T>(data)
  
  useEffect(() => {
    const currentData = getCurrentData()
    // Only update if values changed, not just references
    if (!deepEqual(dataRef.current, currentData)) {
      dataRef.current = currentData
      setData(currentData)
    }
  })
  
  return data
}
```

**Why this works:**
- Ref preserves previous value across renders
- Deep comparison checks actual data, not references
- Only triggers state update when values truly change

### 2. **Deduplication at the Save Level**

```typescript
// Track last saved payload to prevent duplicate API calls
const lastSavedPayloadRef = useRef<string | null>(null)

const saveDebounced = useCallback((payload: StepPayload) => {
  const payloadStr = JSON.stringify(payload)
  
  // Skip if payload hasn't changed since last save
  if (payloadStr === lastSavedPayloadRef.current) {
    return
  }
  
  // Debounce + Save logic
  // ...
  lastSavedPayloadRef.current = payloadStr
}, [mutation])
```

**Why this works:**
- Serializes payload for comparison
- Skips API call if data hasn't changed
- Works in conjunction with debouncing

### 3. **Proper Debouncing**

```typescript
const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

// Clear existing timeout before setting new one
if (saveTimeoutRef.current) {
  clearTimeout(saveTimeoutRef.current)
}

saveTimeoutRef.current = setTimeout(() => {
  // Double-check before API call
  if (currentPayloadStr !== lastSavedPayloadRef.current) {
    lastSavedPayloadRef.current = currentPayloadStr
    mutation.mutate(payload)
  }
}, 300)
```

**Why this works:**
- 300ms delay allows user to finish typing
- Clears previous timeout to prevent stacking
- Final check before API call prevents race conditions

## Component Usage Pattern

```typescript
export function AccountVerifiedStep({ emailVerified, onContinue }) {
  const { watch, setValue } = useForm({ ... })
  const { saveDebounced, saveImmediate } = useStepSaver({ ... })
  
  // 1. Use deep equality wrapper
  const currentData = useFormDataWithDeepEqual(() => watch())
  
  // 2. Auto-save on actual changes
  React.useEffect(() => {
    if (isValid) {
      saveDebounced(currentData) // Protected by deduplication
    }
  }, [currentData, isValid, saveDebounced])
  
  // 3. Explicit save on button click
  const onSubmit = (data: FormData) => {
    saveImmediate(data)
  }
}
```

## Key Engineering Principles Applied

### 1. **Separation of Concerns**
- **Hook layer**: Handles form state diffing
- **Save layer**: Handles API request deduplication
- **Component layer**: Orchestrates the two

### 2. **Defense in Depth**
- Multiple layers prevent infinite loops even if one fails
- Deep equality + Deduplication + Debouncing

### 3. **Performance Optimization**
- Avoid unnecessary re-renders
- Skip redundant API calls
- Minimize serialization overhead

### 4. **User Experience**
- 300ms debounce feels instant but saves resources
- Silent auto-save doesn't interrupt flow
- Explicit save provides control

### 5. **Type Safety**
- Generic `useFormDataWithDeepEqual<T>` works with any form
- Proper TypeScript types throughout
- No `any` types in critical paths

## Common Pitfalls to Avoid

### ❌ **Including Unstable Dependencies**
```typescript
// BAD: saveDebounced changes on every render
useEffect(() => {
  saveDebounced(data)
}, [data, saveDebounced]) // saveDebounced not stable!
```

**Why it fails:** Even with useCallback, if dependencies change, you get a new function reference.

**Solution:** Use deduplication inside the save function, not in dependencies.

### ❌ **Watching Entire Form Object**
```typescript
// BAD: watch() returns new object every render
const data = watch()
useEffect(() => {
  save(data)
}, [data]) // Infinite loop!
```

**Why it fails:** Object references change even if values don't.

**Solution:** Use `useFormDataWithDeepEqual` wrapper.

### ❌ **No Deduplication**
```typescript
// BAD: Saves even when data hasn't changed
useEffect(() => {
  api.save(data)
}, [data])
```

**Why it fails:** Deep equal triggers saved, but values might be identical.

**Solution:** Track last saved payload with serialization comparison.

## Testing Strategy

### Unit Tests
```typescript
describe('useFormDataWithDeepEqual', () => {
  it('should not update when object reference changes but values stay same', () => {
    // Test deep equality logic
  })
  
  it('should update when values actually change', () => {
    // Test change detection
  })
})
```

### Integration Tests
```typescript
describe('Auto-save', () => {
  it('should only call API once for identical saves', () => {
    // Test deduplication
  })
  
  it('should debounce rapid changes', () => {
    // Test 300ms debouncing
  })
})
```

## Performance Characteristics

- **Memory**: O(1) - Fixed refs and state
- **CPU**: O(n) - Linear deep equality check
- **Network**: Minimal - Deduplicated requests
- **Render**: Optimized - Only on actual changes

## Future Improvements

1. **Selective Field Watching**: Only watch changed fields
2. **Diff-Based Payloads**: Send only changed fields to API
3. **Optimistic Updates**: Update UI before API response
4. **Conflict Resolution**: Handle concurrent edits
5. **Compression**: For large payloads

## Conclusion

This multi-layer approach provides:
✅ No infinite loops
✅ Minimal API calls
✅ Optimal performance
✅ Great UX
✅ Type safety
✅ Maintainable code

By thinking like a principal engineer, we've built a robust, scalable auto-save system that handles edge cases gracefully.

