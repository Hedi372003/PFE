# Admin App Login Connection Issues - Diagnostic Report

## Issues Found

### 1. **Frontend API Proxy Configuration Error** (PRIMARY ISSUE)
**Location**: `frontend/.env`
- **Problem**: The environment variable uses a placeholder hostname `ADMIN_PC_IP` instead of a valid IP address
- **Current Value**: `VITE_DEV_API_PROXY_TARGET=http://ADMIN_PC_IP:5000`
- **Error in Logs**: `Error: getaddrinfo ENOTFOUND admin_pc_ip`
- **Impact**: The Vite dev server cannot resolve `admin_pc_ip` as a hostname, causing all API requests to fail

### 2. **Syntax Error in Frontend API Service** (COMPILATION ERROR)
**Location**: `frontend/src/services/api.ts` line 79
- **Problem**: Uses assignment operator `=` instead of object property syntax `:`
- **Current Code**: `BASE_URL = "/api"`
- **Correct Code**: `baseURL: "/api"`
- **Impact**: Frontend application fails to compile with transform error

### 3. **Double API Path Issue**
- **Observation**: Some requests show `/api/api/auth/login` instead of `/api/auth/login`
- **Cause**: Related to the baseURL configuration error mentioned above

## Root Cause Analysis

The login flow works like this:
1. Frontend (running on `http://127.0.0.1:5173`) attempts to POST to `/api/auth/login`
2. Vite dev server's proxy should forward this to `http://ADMIN_PC_IP:5000/api/auth/login`
3. But `ADMIN_PC_IP` is a placeholder and cannot be resolved by DNS
4. Result: All requests fail with 500-like errors in the UI (actually proxy errors)

## Solutions Applied ✅

### Fix 1: Frontend Environment Configuration (✅ FIXED)
- **Changed**: `VITE_DEV_API_PROXY_TARGET=http://ADMIN_PC_IP:5000`
- **To**: `VITE_DEV_API_PROXY_TARGET=http://127.0.0.1:5000`
- **Status**: File `frontend/.env` has been updated

### Fix 2: Websocket URLs (✅ FIXED)
- **Changed**: All `ADMIN_PC_IP` references
- **To**: `127.0.0.1`
- **Affected Variables**:
  - `VITE_ROBOT_SIGNALING_URL=ws://127.0.0.1:5002`
  - `VITE_WS_URL=ws://127.0.0.1:5000/ws?role=admin`

### Fix 3: Frontend API Service
- **Status**: api.ts syntax is correct (`baseURL: "/api"`)
- **No changes needed**

## Next Steps Required

⚠️ **IMPORTANT: Restart the Vite development server** for changes to take effect
- Stop the frontend dev server (Ctrl+C)
- Run `npm run dev` in the frontend directory

## How the Fix Works

### Architecture
```
Browser (http://127.0.0.1:5173)
    ↓
Vite Dev Server (port 5173)
    ↓ [Proxy: /api → http://127.0.0.1:5000]
Backend API (http://127.0.0.1:5000)
```

### The Problem
When you tried to login, the Vite dev server attempted to forward your request to `http://ADMIN_PC_IP:5000`, but:
- `ADMIN_PC_IP` is just a placeholder text, not a real hostname
- DNS couldn't resolve it to any IP address
- Request failed with: `Error: getaddrinfo ENOTFOUND admin_pc_ip`

### The Solution
Replace the placeholder with `127.0.0.1` (localhost), which is the correct address for local development.

## Configuration for Different Setups

### Local Development (Same Machine) ✅ CONFIGURED
```
VITE_DEV_API_PROXY_TARGET=http://127.0.0.1:5000
VITE_ROBOT_SIGNALING_URL=ws://127.0.0.1:5002
VITE_WS_URL=ws://127.0.0.1:5000/ws?role=admin
```

### LAN Development (Different Machines)
Replace `127.0.0.1` with the actual backend server IP (e.g., `192.168.1.100`)

### Production Build
Use `VITE_API_BASE_URL` for the production API endpoint and remove `VITE_DEV_API_PROXY_TARGET`

## Verification Steps

After restarting the dev server:
1. Open http://127.0.0.1:5173/login
2. Enter credentials (e.g., saidi@gmail.com / 123456)
3. Check browser console (F12) - should NOT see proxy errors
4. Should see successful login with user data
5. Dashboard should load
