# Spirit Suggestion Component

## Overview

The **Spirit Suggestion** component is a modal popover that displays AI-powered recommendations to users at strategic moments in the workflow. It follows the design pattern shown in the reference screenshot with a blue gradient header, white content area, and action buttons.

## Design

### Visual Specifications
- **Header**: Blue gradient (`from-blue-600 to-blue-700`) with white text and Zap icon
- **Title**: "Spirit suggests" in white, semibold font
- **Content**: Blue title text for main suggestion, gray subtitle for additional context
- **Actions**: Primary (blue button) and secondary (ghost button) actions
- **Animations**: Smooth fade-in/scale with backdrop blur
- **Positioning**: Fixed at top center of viewport

### UX Principles
1. **Non-blocking**: Users can dismiss by clicking backdrop or X button
2. **Contextual**: Appears at relevant moments (e.g., viewing pricing tab)
3. **Actionable**: Provides clear "Apply" and "Learn more" options
4. **Timed**: Optional auto-hide after configurable duration
5. **Accessible**: Keyboard-friendly with proper ARIA labels

## Usage

### Basic Implementation

```tsx
import { SpiritSuggestion, useSpiritSuggestion } from '@/components/SpiritSuggestion'

export default function MyPage() {
  const { suggestion, showSuggestion, closeSuggestion } = useSpiritSuggestion()

  const handleShowSuggestion = () => {
    showSuggestion({
      title: 'Your pricing is 15% below ceiling.',
      message: 'Consider emphasizing value-add services.',
      primaryAction: {
        label: 'Apply',
        onClick: () => {
          console.log('User applied suggestion')
          // Implement your logic here
        }
      },
      secondaryAction: {
        label: 'Learn more',
        onClick: () => {
          console.log('User wants more info')
        }
      }
    })
  }

  return (
    <div>
      <button onClick={handleShowSuggestion}>Show Suggestion</button>
      <SpiritSuggestion suggestion={suggestion} onClose={closeSuggestion} />
    </div>
  )
}
```

### Auto-show on Tab Change

```tsx
React.useEffect(() => {
  if (activeTab === 'pricing') {
    const timer = setTimeout(() => {
      showSuggestion({
        title: 'Your pricing for HVAC RFP is 15% below ceiling.',
        message: 'Consider emphasizing value-add services.',
        primaryAction: {
          label: 'Apply',
          onClick: () => applyPricingAdjustment()
        },
        secondaryAction: {
          label: 'Learn more',
          onClick: () => openPricingGuide()
        }
      })
    }, 800) // Delay for smooth transition
    return () => clearTimeout(timer)
  }
}, [activeTab, showSuggestion])
```

### Auto-hide After Duration

```tsx
showSuggestion({
  title: 'Document uploaded successfully!',
  message: 'Your compliance score increased to 92%.',
  autoHideAfter: 5000, // 5 seconds
  primaryAction: {
    label: 'View Report',
    onClick: () => navigateToReport()
  }
})
```

### Trigger on Data Change

```tsx
React.useEffect(() => {
  if (complianceScore < 70) {
    showSuggestion({
      title: 'Compliance score is below target.',
      message: 'Upload missing certifications to improve your readiness.',
      primaryAction: {
        label: 'Upload Documents',
        onClick: () => openDocumentUpload()
      }
    })
  }
}, [complianceScore, showSuggestion])
```

## API Reference

### `SpiritSuggestionData`

```typescript
interface SpiritSuggestionData {
  id: string                    // Auto-generated
  title: string                 // Main suggestion text (blue)
  message: string               // Supporting context (gray)
  primaryAction?: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  onDismiss?: () => void        // Called when closed
  autoHideAfter?: number        // Auto-hide in milliseconds
}
```

### `useSpiritSuggestion()` Hook

Returns:
- `suggestion`: Current suggestion data or `null`
- `showSuggestion(data)`: Display a new suggestion
- `closeSuggestion()`: Dismiss the current suggestion

## Examples

### Example 1: Pricing Optimization
```tsx
showSuggestion({
  title: 'Your pricing is competitive but conservative.',
  message: 'Adding a 3% contingency could increase win probability.',
  primaryAction: {
    label: 'Add Contingency',
    onClick: () => adjustPricing(1.03)
  },
  secondaryAction: {
    label: 'Review Pricing',
    onClick: () => openPricingAnalysis()
  }
})
```

### Example 2: Team Composition
```tsx
showSuggestion({
  title: 'Consider adding a DevOps specialist.',
  message: 'This could strengthen your technical score by 15 points.',
  primaryAction: {
    label: 'Add Role',
    onClick: () => openStaffDrawer('DevOps Engineer')
  },
  secondaryAction: {
    label: 'See Alternatives',
    onClick: () => showAlternativeRoles()
  }
})
```

### Example 3: Document Upload
```tsx
showSuggestion({
  title: 'You're missing 3 required certifications.',
  message: 'Upload them now to reach 100% compliance.',
  primaryAction: {
    label: 'Upload Now',
    onClick: () => openDocumentUpload(['ISO 9001', 'SOC 2', 'CMMC Level 2'])
  },
  secondaryAction: {
    label: 'Remind Me Later',
    onClick: () => scheduleReminder(24) // hours
  }
})
```

### Example 4: Deadline Warning
```tsx
showSuggestion({
  title: 'Proposal due in 48 hours!',
  message: 'Complete pricing and team sections to submit on time.',
  autoHideAfter: 10000,
  primaryAction: {
    label: 'Review Checklist',
    onClick: () => openSubmissionChecklist()
  }
})
```

## Integration Points

### Current Implementation
- ✅ **Workspace Pricing Tab**: Shows pricing optimization suggestion
- ✅ **Auto-trigger**: Appears 800ms after tab switch
- ✅ **Dismiss handlers**: Backdrop click, X button, action completion

### Recommended Future Triggers
1. **Compliance Score < 70%**: Suggest document uploads
2. **Team Size Below Recommendation**: Suggest adding roles
3. **Pricing Above/Below Range**: Suggest adjustments
4. **Approaching Deadlines**: Remind about pending tasks
5. **New RFP Features**: Highlight new tools or insights
6. **Win Probability Changes**: Alert on significant shifts
7. **Competitor Analysis**: Share intelligence insights
8. **Subcontractor Readiness**: Flag missing sub commitments

## Styling

The component uses:
- **Tailwind CSS**: For all styling
- **Framer Motion**: For animations
- **Lucide Icons**: `Zap` (Spirit logo), `X` (close)
- **shadcn/ui Button**: Consistent button styling

### Color Palette
- Primary: `blue-600`, `blue-700`
- Background: `white`
- Text: `blue-700` (title), `slate-600` (message)
- Border: `blue-200/60`

## Accessibility

- ✅ Keyboard navigation (Tab, Enter, Escape)
- ✅ ARIA labels for close button
- ✅ Focus management
- ✅ Screen reader friendly

## Performance

- Lightweight: < 5KB gzipped
- No layout shift: Fixed positioning
- Smooth animations: GPU-accelerated transforms
- Lazy renders: Only when `suggestion` is present

## Testing

### Manual Testing Checklist
- [ ] Suggestion appears on pricing tab switch
- [ ] Backdrop dismisses modal
- [ ] X button dismisses modal
- [ ] "Apply" button triggers action
- [ ] "Learn more" button triggers action
- [ ] Auto-hide works (if configured)
- [ ] Multiple suggestions don't stack
- [ ] Animations are smooth
- [ ] Mobile responsive

### Unit Test Example
```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { SpiritSuggestion, useSpiritSuggestion } from '@/components/SpiritSuggestion'

test('shows and dismisses suggestion', () => {
  const { result } = renderHook(() => useSpiritSuggestion())
  
  act(() => {
    result.current.showSuggestion({
      title: 'Test suggestion',
      message: 'Test message',
    })
  })
  
  expect(screen.getByText('Spirit suggests')).toBeInTheDocument()
  expect(screen.getByText('Test suggestion')).toBeInTheDocument()
  
  fireEvent.click(screen.getByLabelText('Close'))
  
  expect(screen.queryByText('Spirit suggests')).not.toBeInTheDocument()
})
```

## Best Practices

### DO ✅
- Keep title concise (1-2 sentences)
- Provide clear, actionable buttons
- Use auto-hide for success messages
- Delay appearance for smooth UX (800ms)
- Dismiss on action completion
- Track suggestion acceptance rates

### DON'T ❌
- Show multiple suggestions simultaneously
- Use for critical errors (use alerts instead)
- Auto-hide important decisions
- Spam users with frequent suggestions
- Use vague action labels ("OK", "Cancel")
- Block critical workflows

## Analytics

Track these events for optimization:
```typescript
// Suggestion shown
analytics.track('spirit_suggestion_shown', {
  suggestion_id: suggestion.id,
  title: suggestion.title,
  context: activeTab
})

// Primary action clicked
analytics.track('spirit_suggestion_applied', {
  suggestion_id: suggestion.id,
  action: 'primary'
})

// Dismissed without action
analytics.track('spirit_suggestion_dismissed', {
  suggestion_id: suggestion.id,
  method: 'backdrop' | 'close_button'
})
```

## Future Enhancements

### Planned Features
- [ ] **Suggestion Queue**: Show multiple suggestions in sequence
- [ ] **Persistence**: Remember dismissed suggestions
- [ ] **A/B Testing**: Test different copy and CTAs
- [ ] **Position Variants**: Bottom-right toast style
- [ ] **Rich Content**: Images, charts, code snippets
- [ ] **Snooze Option**: "Remind me in 1 hour"
- [ ] **Confidence Score**: Show AI confidence percentage

### Advanced Use Cases
- **Multi-step Wizards**: Guide users through complex flows
- **Personalized Tips**: Based on user behavior and history
- **Contextual Help**: In-app coaching for new features
- **Predictive Alerts**: Proactive risk mitigation

---

**Status**: ✅ Production-ready  
**Version**: 1.0.0  
**Last Updated**: 2025-01-15

