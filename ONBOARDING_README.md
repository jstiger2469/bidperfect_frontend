# BidPerfect Onboarding Wizard

Production-grade multi-step onboarding flow for BidPerfect's federal contracting platform.

## 🎯 Overview

A sleek, accessible onboarding wizard that guides users through 8 stages:
1. **Account Verified** (blocking) - Email verification & MFA setup
2. **Org Choice** (blocking) - Create/join organization with domain verification
3. **Company Profile** (blocking) - Legal info, address, NAICS codes, federal IDs
4. **Compliance Intake** (blocking) - W-9, insurance, certifications upload with OCR
5. **Integrations** (optional) - Connect Drive, Email, eSign, Accounting
6. **Team** (optional) - Invite team members with roles
7. **First RFP** (optional) - Upload RFP or try sample
8. **Done** - Success screen with confetti 🎉

## 🏗️ Architecture

```
app/(app)/onboarding/
  └── page.tsx                    # Main router with query param navigation

app/api/onboarding/
  ├── state/route.ts              # GET /api/onboarding/state
  └── complete/route.ts           # POST /api/onboarding/complete

components/onboarding/
  ├── OnboardingLayout.tsx        # Left rail + header + progress
  └── steps/
      ├── AccountVerifiedStep.tsx
      ├── OrgChoiceStep.tsx
      ├── CompanyProfileStep.tsx
      ├── ComplianceIntakeStep.tsx
      ├── IntegrationsStep.tsx
      ├── TeamStep.tsx
      ├── FirstRfpStep.tsx
      └── DoneStep.tsx

lib/
  ├── onboarding-types.ts         # Types, Zod schemas, step config
  └── useOnboarding.ts            # React Query hooks + debounced save
```

## 🚀 Features

### ✅ Core Functionality
- **Query param routing**: `/onboarding?step=COMPANY_PROFILE`
- **Save-on-blur**: Debounced auto-save (300ms) with toast notifications
- **Progress tracking**: Visual progress bar + completion status
- **Step validation**: Zod schemas enforce required fields
- **Locked/unlocked states**: Can't skip required steps
- **Invite flow support**: `?invite=TOKEN` pre-fills org & role

### ✨ UX/UI Polish
- **Glass-morphism design**: Frosted cards with backdrop blur
- **Accessibility**: ARIA labels, keyboard nav, focus management
- **Animations**: Framer Motion step transitions + confetti on completion
- **Loading states**: Skeletons, spinners, optimistic UI
- **Error handling**: Toast notifications with retry actions
- **Responsive**: Mobile-first design with sticky left rail
- **beforeunload persistence**: Auto-saves progress before tab close (sendBeacon)

### 🔒 Validation & Data
- **Client validation**: Zod schemas with real-time feedback
- **Debounced saves**: Reduces API calls, shows "Saving..." indicator
- **Idempotent retries**: Safe to retry failed saves
- **Optimistic updates**: React Query cache invalidation

## 📋 Step Details

### 1. Account Verified
- Clerk email verification status
- MFA toggle (UI only, backend TBD)
- Continue button disabled until email verified

### 2. Org Choice
- **Create mode**: Org name + verified domains (for auto-join)
- **Join mode**: Invitation code input
- **Invite flow**: Pre-filled org name, role (read-only)

### 3. Company Profile
- Legal name, DBA, website
- Full US address with state dropdown
- NAICS codes (typeahead-ready, multi-select)
- Federal IDs: UEI, CAGE, EIN (optional)
- Tooltips for each field

### 4. Compliance Intake
- Upload W-9, EIN letter, certificates, insurance, licenses
- Drag-and-drop file zones per document type
- OCR parsing (backend stub, UI shows parsed data preview)
- Mark documents as verified

### 5. Integrations
- Drive (Google/Microsoft)
- Email (Gmail/Microsoft 365)
- eSign (DocuSign/Adobe)
- Accounting (QuickBooks)
- "Skip for now" button

### 6. Team
- Email + role (Admin/Member/Viewer)
- Dynamic form array (add/remove)
- Send invites or skip

### 7. First RFP
- Upload RFP (PDF/DOCX/ZIP)
- Try sample RFP
- Skip option

### 8. Done
- Confetti animation
- What's Next checklist
- CTAs: "Go to Dashboard" / "Upload First RFP"

## 🔌 API Integration

### Backend Endpoints (To Implement)

#### GET `/api/onboarding/state`
Returns current onboarding state:
```typescript
{
  state: {
    currentStep: 'COMPANY_PROFILE',
    completedSteps: ['ACCOUNT_VERIFIED', 'ORG_CHOICE'],
    requiredSteps: ['ACCOUNT_VERIFIED', 'ORG_CHOICE', 'COMPANY_PROFILE', 'COMPLIANCE_INTAKE'],
    progress: 25,
    org?: { id, name, role },
    company?: { id, legalName },
    invite?: { token, orgName, role, email }
  },
  user: {
    id: 'user_123',
    email: 'user@example.com',
    emailVerified: true,
    mfaEnabled: false
  }
}
```

#### POST `/api/onboarding/complete`
Saves step progress:
```typescript
Request:
{
  step: 'COMPANY_PROFILE',
  payload: {
    legalName: 'Acme Inc',
    address: { ... },
    naicsCodes: ['236220'],
    // ... rest of step data
  }
}

Response:
{
  ok: true,
  nextStep: 'COMPLIANCE_INTAKE',
  state: { ... updated state },
  errors?: { field: 'message' } // validation errors
}
```

### Current Implementation
- API routes return **mock data**
- Replace with real backend calls in:
  - `app/api/onboarding/state/route.ts`
  - `app/api/onboarding/complete/route.ts`

## 🧪 Testing

### React Testing Library Tests
```bash
npm run test
```

**Test Coverage Needed:**
- [ ] Left rail renders all steps with correct statuses
- [ ] Each step validates required fields
- [ ] Continue button enables/disables based on validation
- [ ] Save-on-blur debounces correctly
- [ ] Error toasts show on API failure with retry action
- [ ] Invite flow pre-fills org details

### Playwright Smoke Tests
```bash
npm run test:e2e
```

**Test Scenarios:**
- [ ] Self-serve: Complete all blocking steps → see Done screen
- [ ] Invite link: Lands in ORG_CHOICE → pre-filled org name
- [ ] Incomplete: Navigate away → middleware redirects back (server-side)
- [ ] Skip optional: Mark integrations/team/RFP as skipped → still proceed

## 🔧 Development

### Prerequisites
```bash
# Install dependencies
npm install zod react-hook-form @hookform/resolvers/zod
npm install @radix-ui/react-switch @radix-ui/react-tooltip
npm install react-confetti sonner
```

### Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Run Development Server
```bash
npm run dev
# Navigate to http://localhost:3000/onboarding
```

### Add New Step
1. Define type in `lib/onboarding-types.ts`:
   ```typescript
   export const NewStepSchema = z.object({ ... })
   ```
2. Add to `ONBOARDING_STEPS` array
3. Create component in `components/onboarding/steps/NewStep.tsx`
4. Add case to `renderStep()` in `onboarding/page.tsx`
5. Update API route to handle new step

## 📦 Dependencies

| Package | Purpose |
|---------|---------|
| `zod` | Schema validation |
| `react-hook-form` | Form state management |
| `@hookform/resolvers/zod` | Zod + RHF integration |
| `@tanstack/react-query` | Data fetching & caching |
| `framer-motion` | Step transitions |
| `react-confetti` | Done screen celebration |
| `sonner` | Toast notifications |
| `@radix-ui/*` | Accessible UI primitives |

## 🐛 Known Issues & TODOs

### Backend Integration
- [ ] Wire GET `/api/onboarding/state` to backend
- [ ] Wire POST `/api/onboarding/complete` to backend
- [ ] Implement OCR parsing for uploaded documents
- [ ] Add MFA setup flow (currently UI only)
- [ ] NAICS code typeahead/search
- [ ] Verified domain confirmation emails

### Middleware Guard
- [ ] Server-side redirect if onboarding incomplete:
  ```typescript
  // middleware.ts
  if (!onboardingComplete && !pathname.startsWith('/onboarding')) {
    return NextResponse.redirect('/onboarding')
  }
  ```

### Testing
- [ ] Write RTL unit tests for each step
- [ ] Write Playwright smoke tests
- [ ] Add accessibility audits (axe-core)

### UX Enhancements
- [x] beforeunload save (sendBeacon) - **IMPLEMENTED**
- [ ] Add "Save & Exit" explicit button (in addition to auto-save)
- [ ] Show estimated time remaining per step
- [ ] Add step-specific help tooltips
- [ ] Keyboard shortcuts (Cmd+Enter to continue)
- [ ] Dark mode support

## 🎨 Design System

### Colors
- Primary: Blue (`blue-500`, `blue-600`)
- Success: Green (`green-500`, `green-600`)
- Warning: Orange (`orange-500`, `orange-600`)
- Error: Red (`red-500`, `red-600`)
- Glass: `bg-white/60 backdrop-blur-sm`

### Typography
- Headings: `font-semibold text-gray-900`
- Body: `text-gray-600`
- Labels: `text-sm font-medium`

### Spacing
- Card padding: `p-6`
- Form gaps: `space-y-4`
- Section gaps: `space-y-6`

## 🤝 Contributing

1. Follow existing component patterns
2. Use Zod for all form validation
3. Add ARIA labels for accessibility
4. Test keyboard navigation
5. Add loading states for async actions
6. Show error toasts with retry actions

## 📝 License

Proprietary - BidPerfect Inc.

