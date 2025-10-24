# 🚀 Onboarding Quick Start Guide

**Goal:** Get onboarding working in 10 minutes

---

## ✅ Prerequisites

1. **Backend running:**
   ```bash
   cd rfp-api
   npm run dev
   # Should see: Server listening at http://localhost:3001
   ```

2. **Dependencies installed:**
   ```bash
   cd frontend
   npm install zustand lodash.isequal @types/lodash.isequal
   ```

3. **Environment variables:**
   ```bash
   # frontend/.env.local
   NEXT_PUBLIC_API_URL=http://localhost:3001
   NEXT_PUBLIC_ENABLE_ONBOARDING_GUARD=true
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```

---

## 🎯 Test It

### 1. Start Frontend
```bash
cd frontend
npm run dev
# Open http://localhost:3000
```

### 2. Sign Up
- Go to http://localhost:3000/sign-up
- Enter email + password
- Verify email (check inbox or use Clerk Dashboard)

### 3. Create Organization
- After email verification → redirect to org selection
- Click "Create Organization"
- Enter name → Submit

### 4. Complete Onboarding
- Should auto-redirect to `/onboarding`
- Complete each step:
  - ✅ Account Verified (auto-complete if email verified)
  - ✅ Organization Choice (should show existing org)
  - ✅ Company Profile (fill in legal name + address)
  - ✅ Compliance Intake (upload documents - currently simulated)
  
### 5. Verify Completion
- After last step → redirect to `/dashboard`
- Try accessing `/dashboard` directly → should NOT redirect to onboarding
- Check cookie: `onboarding_complete=true` in DevTools → Application → Cookies

---

## 🔍 Verify Backend Integration

### Check Zustand Cache
Open browser console:
```javascript
// Import store
const store = useOnboardingStore.getState()

// Check cache
console.log('Current step:', store.currentStep)
console.log('Completed steps:', store.completedSteps)
console.log('Cache valid?', store.isCacheValid())
console.log('Step data:', store.stepData)
```

### Check Backend API
```bash
# Get your Clerk token from browser DevTools → Network → any request → Authorization header
TOKEN="your_clerk_token_here"

# Test state endpoint
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/onboarding/state

# Should return:
# {"state":{"currentStep":"ORG_CHOICE",...},"user":{...}}
```

### Check Database
```bash
# Connect to PostgreSQL
psql $DATABASE_URL

# Check onboarding state
SELECT * FROM onboarding_state WHERE user_id = 'user_xxx';

# Check step data
SELECT * FROM onboarding_step_data WHERE user_id = 'user_xxx';
```

---

## 🐛 Troubleshooting

### Issue: "Failed to fetch onboarding state"
**Solution:**
1. Check backend is running: `curl http://localhost:3001/health`
2. Check `NEXT_PUBLIC_API_URL` in `.env.local`
3. Check browser console for errors
4. Check backend logs for errors

### Issue: "Unauthorized (401)"
**Solution:**
1. Verify you're signed in (check Clerk UI)
2. Check Clerk token in Network tab → Authorization header
3. Verify backend has correct `CLERK_SECRET_KEY`
4. Try signing out and back in

### Issue: Infinite redirect to /onboarding
**Solution:**
1. Check middleware excludes `/onboarding/*` paths
2. Check `onboarding_complete` cookie is set
3. Clear cookies and try again
4. Check backend returns `currentStep: "DONE"` when complete

### Issue: Data not persisting
**Solution:**
1. Check backend logs for errors
2. Verify PostgreSQL connection (check `DATABASE_URL`)
3. Check migration was applied: `cd rfp-api && npx prisma migrate status`
4. Check browser DevTools → Application → Session Storage → `onboarding-storage`

### Issue: Validation errors
**Solution:**
1. Check field requirements in backend docs
2. Example: ZIP code must be 5+ digits
3. Example: UEI must be exactly 12 alphanumeric characters
4. See `rfp-api/src/types/onboarding.ts` for Zod schemas

---

## 📊 Verify It's Working

### ✅ Checklist
- [ ] Sign up new user → redirects to /onboarding
- [ ] Complete all steps → redirects to /dashboard
- [ ] Navigate back to step → data persists (pre-filled)
- [ ] Log out → log back in → resumes from last step
- [ ] Check PostgreSQL → data saved in `onboarding_state` table
- [ ] Check cookie → `onboarding_complete=true` set
- [ ] Access /dashboard directly → no redirect (onboarding complete)

---

## 📝 Next Steps

1. **Add document upload endpoint** (see backend docs)
2. **Add NAICS code typeahead** (see backend docs)
3. **Add monitoring** (Sentry, DataDog, etc.)
4. **Add analytics** (PostHog, Mixpanel, etc.)
5. **Add unit tests** (see `BACKEND_INTEGRATION_COMPLETE.md`)

---

## 🎉 Success!

If all checks pass, your onboarding system is working! 🚀

**What you have:**
- ✅ Zustand cache for instant UI updates
- ✅ Backend PostgreSQL for permanent storage
- ✅ Cookies for middleware checks
- ✅ Optimistic updates for better UX
- ✅ Error handling for all failure modes
- ✅ Deep integration with Clerk auth

**Next:** Read `BACKEND_INTEGRATION_COMPLETE.md` for detailed docs

---

**Questions?** Check:
- `BACKEND_INTEGRATION_COMPLETE.md` (frontend integration)
- `rfp-api/ONBOARDING_IMPLEMENTATION_COMPLETE.md` (backend API)
- `rfp-api/FRONTEND_ONBOARDING_GUIDE.md` (API contracts)
- `rfp-api/CLERK_WEBHOOK_SETUP.md` (webhook setup)

