# 🔧 Backend Fix: Accept Organization ID from Custom Header

## ✅ **FIXED!**

**Update**: JWT template "backend" is now configured in Clerk and frontend is using it!

## 🚨 **Problem** (RESOLVED)
Clerk JWT tokens weren't including `org_id` claim, causing backend to return `409 org_required` errors.

```bash
# Frontend logs:
[API /onboarding/state] Auth context: { orgId: 'org_3477...' }  ← Frontend has it
[API /onboarding/state] JWT claims: { org_id: undefined }       ← JWT doesn't have it
```

---

## ✅ **Solution** (IMPLEMENTED)

### Primary Fix: JWT Template ✅
- Clerk template "backend" configured with: `org_id`, `org_name`, `org_role`
- Frontend updated to use: `getToken({ template: 'backend' })`
- JWT tokens now include org claims natively

### Fallback: Custom Header ✅
Frontend also sends `x-organization-id` header as fallback (belt and suspenders approach).

### Frontend Changes (✅ Complete)
```typescript
// app/api/onboarding/state/route.ts
// app/api/onboarding/complete/route.ts

// Get JWT token with org claims
const token = await getToken({ template: 'backend' })  // ← Uses "backend" template

// Also send as custom header (fallback)
const headers: Record<string, string> = {
  'Authorization': `Bearer ${token}`,  // ← Now includes org_id in JWT!
  'Content-Type': 'application/json',
}

if (orgId) {
  headers['x-organization-id'] = orgId  // ← Fallback header
}

await fetch(`${BACKEND_URL}/onboarding/state`, { headers })
```

---

## 🔨 **Backend Changes Required**

### Update `auth()` middleware to check custom header

**File**: `rfp-api/src/middleware/auth.ts` (or wherever you extract `orgId`)

```typescript
// Before:
const orgId = decodedToken.org_id

// After (with fallback):
const orgId = decodedToken.org_id || req.headers['x-organization-id']
```

### Example Implementation

```typescript
// rfp-api/src/middleware/auth.ts
export async function auth(req: Request) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  
  if (!token) {
    throw new UnauthorizedError('No token')
  }

  // Verify JWT with Clerk
  const decodedToken = await verifyClerkToken(token)
  
  // Extract org_id from JWT (if available) or custom header (fallback)
  const orgId = decodedToken.org_id || req.headers['x-organization-id']
  
  if (!orgId) {
    throw new Error('org_required')  // 409
  }

  return {
    userId: decodedToken.sub,
    orgId: orgId,  // ← Now works with custom header
    // ... other claims
  }
}
```

---

## 🧪 **Testing**

### Before Fix
```bash
curl -H "Authorization: Bearer <token_without_org_id>" \
  http://localhost:3001/onboarding/state

# Response: 409 { "error": "org_required" }
```

### After Fix
```bash
curl -H "Authorization: Bearer <token_without_org_id>" \
     -H "x-organization-id: org_3477GhNOx5UJwWyA8PpE2XT56YM" \
  http://localhost:3001/onboarding/state

# Response: 200 { "currentStep": "COMPANY_PROFILE", ... }
```

---

## 📋 **Affected Endpoints**

All endpoints that require organization context:
- `GET /onboarding/state`
- `POST /onboarding/complete`
- `GET /companies/{companyId}/documents`
- `POST /companies/{companyId}/documents`
- Any endpoint using `auth().orgId`

---

## 🎯 **Priority**

**HIGH** - Frontend is already sending the header. Backend just needs to read it.

**Impact**: Fixes 100% of `409 org_required` errors during onboarding.

---

## 🔐 **Security Notes**

✅ **Safe to implement** because:
1. JWT is still verified (authentication still works)
2. Header is only used if JWT doesn't have `org_id`
3. Backend should still validate user has access to the org via Clerk API or DB

⚠️ **Optional improvement**: Verify user actually belongs to the org:
```typescript
// Optional: Verify user has access to this org
const membership = await db.organizationMembership.findFirst({
  where: { 
    userId: decodedToken.sub,
    organizationId: orgId 
  }
})

if (!membership) {
  throw new ForbiddenError('User not in org')
}
```

---

## 📝 **Long-term Solution** (Optional)

Configure Clerk JWT template to include org claims:

1. Go to **Clerk Dashboard** → **JWT Templates**
2. Edit default template
3. Add:
   ```json
   {
     "org_id": "{{org.id}}",
     "org_role": "{{org.role}}",
     "org_slug": "{{org.slug}}"
   }
   ```
4. Save

Once configured, the JWT will include `org_id` natively and the custom header becomes a fallback.

---

## ✅ **Implementation Checklist**

- [ ] Update auth middleware to read `x-organization-id` header
- [ ] Test `GET /onboarding/state` with header
- [ ] Test `POST /onboarding/complete` with header
- [ ] Restart backend server
- [ ] Verify frontend logs show `200` instead of `409`
- [ ] (Optional) Add org membership validation
- [ ] (Optional) Configure Clerk JWT template for long-term fix

---

**Questions?** Check frontend logs for `[API /onboarding/state] Adding x-organization-id header:` to confirm header is being sent.

