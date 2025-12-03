# Visas.Guide File Server for Developer Agent

A secure Node.js/Express file server that enables the Developer Agent to access and modify project files on AWS EC2.

## Features

- **File Operations**: List, read, search, and write files
- **Security**: Token-based authentication, path validation, rate limiting
- **Backup System**: Automatic backups before changes, version history, restore capability
- **Full Backups**: Create and manage full project backups

## Installation

### 1. Upload to EC2

```bash
# From your local machine
scp -r ec2-file-server ubuntu@your-ec2-ip:/home/ubuntu/
```

### 2. Install Dependencies

```bash
ssh ubuntu@your-ec2-ip
cd /home/ubuntu/ec2-file-server
npm install
npm run build
```

### 3. Configure Environment

```bash
cp .env.example .env
nano .env
```

Update these values:
- `FILE_SERVER_SECRET`: Generate a secure secret (use `openssl rand -base64 32`)
- `PROJECT_ROOT`: Path to your visas.guide project (e.g., `/var/www/visas.guide`)
- `ALLOWED_ORIGINS`: Your domain(s)

### 4. Create Required Directories

```bash
sudo mkdir -p /var/backups/visas-guide
sudo mkdir -p /var/log/visas-guide-file-server
sudo chown -R ubuntu:ubuntu /var/backups/visas-guide
sudo chown -R ubuntu:ubuntu /var/log/visas-guide-file-server
```

### 5. Setup Systemd Service

Create `/etc/systemd/system/visas-file-server.service`:

```ini
[Unit]
Description=Visas.Guide File Server
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/ec2-file-server
ExecStart=/usr/bin/node dist/index.js
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=visas-file-server
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable visas-file-server
sudo systemctl start visas-file-server
```

### 6. Configure Nginx Proxy (Optional but Recommended)

Add to your Nginx config:

```nginx
location /file-server/ {
    proxy_pass http://localhost:3001/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_cache_bypass $http_upgrade;
}
```

### 7. Configure Supabase Secrets

In your Supabase dashboard, add these secrets:
- `FILE_SERVER_URL`: `https://visas.guide/file-server` (or `http://localhost:3001` for testing)
- `FILE_SERVER_SECRET`: The same secret you set in `.env`

## API Endpoints

### Files

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/files/list?path=` | List files in directory |
| GET | `/api/files/read?path=` | Read file content |
| GET | `/api/files/search?q=&path=` | Search for text in files |
| POST | `/api/files/write` | Write/update a file |
| GET | `/api/files/info?path=` | Get file metadata |

### Backups

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/backup/list?path=` | List backups for a file |
| GET | `/api/backup/get?path=&id=` | Get backup content |
| POST | `/api/backup/restore` | Restore a backup |
| POST | `/api/backup/full` | Create full project backup |
| GET | `/api/backup/full/list` | List full backups |

## Security Features

1. **Token Authentication**: All API requests require `Authorization: Bearer <token>`
2. **Path Validation**: Prevents directory traversal attacks
3. **Forbidden Paths**: Blocks access to `.env`, `.git`, `node_modules`, etc.
4. **File Type Restrictions**: Only allows code/config file types
5. **Rate Limiting**: Configurable request limits
6. **CORS**: Restricted to allowed origins
7. **Helmet**: Security headers

## Backup System

- **Automatic Backups**: Created before any file write
- **Version History**: Keeps last 50 backups per file
- **Full Backups**: Zip archives of entire project
- **Restore**: Revert to any previous version

## Monitoring

Check service status:
```bash
sudo systemctl status visas-file-server
```

View logs:
```bash
sudo journalctl -u visas-file-server -f
# or
tail -f /var/log/visas-guide-file-server/app.log
```

## Troubleshooting

### Connection Refused
- Check if service is running: `sudo systemctl status visas-file-server`
- Check port: `netstat -tlnp | grep 3001`

### Permission Denied
- Ensure ubuntu user owns project directory
- Check file permissions

### CORS Errors
- Verify `ALLOWED_ORIGINS` in `.env`
- Check Nginx proxy configuration
