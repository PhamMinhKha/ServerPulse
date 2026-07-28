# ServerPulse

ServerPulse is a lightweight web application for monitoring NAS or VPS server health in real time.

For the Vietnamese guide, see [README.vi.md](./README.vi.md).

## Features

- Monitor CPU usage
- Monitor RAM usage
- Monitor download speed
- Monitor upload speed
- Monitor disk usage by mount point or partition

## 1. Requirements

Make sure the server has:
- Node.js 18 or newer
- npm

Quick check:

```bash
node -v
npm -v
```

## 2. Install on the server

### Option 1: Upload the source code

Copy the entire `ServerPulse` project folder to your server, then move into the project directory:

```bash
cd /path-to/ServerPulse
```

Install dependencies:

```bash
npm install
```

Start the application:

```bash
npm start
```

By default, the app runs on port `3000`.

Open it in your browser:

```text
http://YOUR-SERVER-IP:3000
```

### Option 2: Clone from Git

If you publish this project to a Git repository:

```bash
git clone <repo-url>
cd ServerPulse
npm install
npm start
```

## 3. Run on a custom port

The app supports the `PORT` environment variable.

Linux / macOS:

```bash
PORT=8080 npm start
```

Then visit:

```text
http://YOUR-SERVER-IP:8080
```

## 4. Run in the background with PM2

If you want the app to restart automatically after crashes or reboots:

```bash
npm install -g pm2
cd /path-to/ServerPulse
pm2 start server.js --name serverpulse
pm2 save
pm2 startup
```

Check status:

```bash
pm2 status
pm2 logs serverpulse
```

## 5. Open the firewall port

If your server uses a firewall, open the port used by the app.

Example with UFW for port `3000`:

```bash
sudo ufw allow 3000/tcp
sudo ufw reload
```

## 6. Reverse proxy with Nginx

If you want to access the app through a domain without showing port `3000`, place Nginx in front of it.

Example config:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

After saving the config:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 7. Metrics shown by the app

ServerPulse reads live system information, including:
- CPU
- RAM
- Network download/upload throughput
- Disk usage and mount points

Notes:
- Download/upload speed is calculated from the byte delta between sampling intervals.
- Disk information depends on what the operating system exposes.
- On some NAS devices, permissions or container environments may hide some network interfaces or mount points.

## 8. Project structure

```text
ServerPulse/
├── public/
│   ├── app.js
│   ├── index.html
│   └── styles.css
├── server.js
├── package.json
├── README.md
└── README.vi.md
```

## 9. Quick start

```bash
npm install
npm start
```

Open:

```text
http://localhost:3000
```

## 10. Possible next improvements

- Historical charts for CPU, RAM, and network
- Alerts when CPU, RAM, or disk usage crosses thresholds
- User authentication
- Store metrics in a database
- Docker or docker-compose support
