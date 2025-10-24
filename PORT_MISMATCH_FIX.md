# 🔧 Port Mismatch Fix - October 22, 2025

## 🔴 **Problem: 404 Errors on All API Routes**

### **Symptoms**
```
POST http://localhost:3000/api/onboarding/complete
[HTTP/1.1 404 Not Found 775ms]

GET http://localhost:3000/api/onboarding/state
[HTTP/1.1 404 Not Found 2871ms]
```

**All API routes** were returning 404, even though they existed and were working before.

---

## 🔍 **Root Cause: Port Mismatch**

Looking at the terminal logs revealed the issue:

```
⚠ Port 3000 is in use by process 62979, using available port 3001 instead.
  ▲ Next.js 15.4.4 (Turbopack)
  - Local:        http://localhost:3001
```

**What happened:**
1. **Old zombie process** was still running on port 3000 (process ID 62979)
2. **New dev server** started on port 3001 instead
3. **Browser/frontend** was still trying to call port 3000 (the zombie process)
4. **Zombie process** didn't have the API routes compiled, so it returned 404

**Evidence in logs:**
```
[middleware] Onboarding route /onboarding/state - allowing through
GET /onboarding/state 404 in 2871ms
```

Notice that:
- Middleware logs appeared ✅ (middleware was running)
- **NO API route handler logs** ❌ (no `[API /onboarding/state] Auth context:` logs)
- This meant the API routes weren't compiled in the zombie process

---

## ✅ **Fix: Kill Zombie Process and Restart**

### **Step 1: Kill all Next.js processes**
```bash
lsof -ti:3000 | xargs kill -9
pkill -9 -f "next dev"
```

### **Step 2: Restart dev server**
```bash
cd /Users/jarredstiger/projects/finalboss/frontend
npm run dev
```

### **Step 3: Verify it's running on port 3000**
```bash
lsof -ti:3000
# Should return a process ID
```

---

## 🛡️ **Prevention: How to Avoid This**

### **If you see port warning:**
```
⚠ Port 3000 is in use by process 62979, using available port 3001 instead.
```

**Stop immediately** and run:
```bash
lsof -ti:3000 | xargs kill -9
npm run dev
```

### **Quick kill script** (add to `package.json`):
```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "dev:clean": "lsof -ti:3000 | xargs kill -9 || true && npm run dev"
  }
}
```

Then you can always run:
```bash
npm run dev:clean
```

---

## 📊 **How to Diagnose Port Issues**

### **Check what's running on port 3000:**
```bash
lsof -ti:3000
```

### **See full process details:**
```bash
lsof -i:3000
```

### **Kill specific port:**
```bash
lsof -ti:3000 | xargs kill -9
```

### **Kill all Next.js processes:**
```bash
pkill -9 -f "next dev"
```

---

## ✅ **Current Status**

✅ **FIXED!** Server is now running correctly on port 3000.

You can now:
1. Refresh your browser (`Cmd+Shift+R`)
2. Try clicking "Continue" on the Company Profile step
3. API calls should now work

---

## 🎯 **Expected Behavior After Fix**

When you click "Continue" on the Company Profile step, you should see in terminal:

```
[middleware] API route /api/onboarding/complete - userId: user_... - allowing through
[API /onboarding/complete] Auth context: { userId: '...', orgId: '...' }
[API /onboarding/complete] Calling backend - step: COMPANY_PROFILE orgId: ...
POST /api/onboarding/complete 200 in 500ms
```

If you still see just:
```
[middleware] Onboarding route /onboarding/complete - allowing through
POST /onboarding/complete 404 in 100ms
```

Then the API routes still aren't compiled. Try:
```bash
rm -rf .next
npm run dev
```

