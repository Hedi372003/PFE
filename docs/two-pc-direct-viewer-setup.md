# Two-PC Direct Viewer Setup

This setup uses:

- **Admin PC**: backend + frontend admin app
- **Robot PC**: portable robot client

## 1. Find the admin PC IP

On the admin PC:

```powershell
ipconfig
```

Look for the IPv4 address on your local network, for example:

```text
192.168.1.50
```

Use that value below as `ADMIN_PC_IP`.

## 2. Configure the backend on the admin PC

Create or edit `backend/.env`:

```env
PORT=5000
DATABASE_URL=postgresql://pfe_user:pfe_password@localhost:55432/telepresence_db
JWT_SECRET=supersecretkey
CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173,http://ADMIN_PC_IP:5173
WS_PATH=/ws
SIGNALING_PORT=5002
SIGNALING_HOST=0.0.0.0
```

Then start the backend:

```powershell
cd backend
node server.js
```

## 3. Configure the admin frontend on the admin PC

Create or edit `frontend/.env`:

```env
VITE_DEV_PORT=5173
VITE_DEV_API_PROXY_TARGET=http://ADMIN_PC_IP:5000
VITE_API_BASE_URL=http://ADMIN_PC_IP:5000
VITE_ROBOT_SIGNALING_URL=ws://ADMIN_PC_IP:5002
VITE_WS_URL=ws://ADMIN_PC_IP:5000/ws?role=admin
```

Then start the frontend:

```powershell
cd frontend
npm run dev
```

Open the admin app on the admin PC:

```text
http://127.0.0.1:5173
```

## 4. Move the robot app to the robot PC

Copy the folder:

```text
robot-portable
```

to the second PC.

On the robot PC:

```powershell
cd robot-portable
py -3 -m pip install -r requirements.txt
copy .env.example .env
```

Edit `.env`:

```env
WEB_HOST=0.0.0.0
WEB_PORT=5003
ROBOT_SIGNALING_URL=ws://ADMIN_PC_IP:5002
```

Then start the robot app:

```powershell
py -3 server.py
```

Open the robot connection page on the robot PC:

```text
http://127.0.0.1:5003/camera
```

## 5. Test the connection

1. Open the robot page first on the robot PC.
2. Allow camera and microphone.
3. On the admin PC, open the Robot Control page.
4. Click **Start Viewer**.

## 6. If it still does not connect

Check these:

- Port `5002` is open on the admin PC firewall.
- The robot PC can reach `ws://ADMIN_PC_IP:5002`.
- The robot page is connected before the admin clicks Start Viewer.
- You restarted the old backend process after the refactor.
- Both PCs are on the same LAN.
