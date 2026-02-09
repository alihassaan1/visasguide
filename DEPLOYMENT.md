# AWS EC2 Deployment Guide for visas.guide

This guide covers deploying the visas.guide React application to an AWS EC2 instance.

## Prerequisites

- AWS EC2 instance (Ubuntu 22.04 LTS recommended)
- Domain `visas.guide` with DNS access
- SSH access to your EC2 instance

## Step 1: Build the Application

On your local machine:

```bash
npm install
npm run build
```

This creates a `dist/` folder with production-ready static files.

## Step 2: EC2 Instance Setup

SSH into your EC2 instance:

```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### Install Required Software

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Nginx
sudo apt install nginx -y

# Install Certbot for SSL
sudo apt install certbot python3-certbot-nginx -y
```

## Step 3: Upload Build Files

From your local machine, upload the dist folder:

```bash
scp -i your-key.pem -r dist/* ubuntu@your-ec2-ip:/tmp/visas-guide/
```

On the EC2 instance, move files to web directory:

```bash
sudo mkdir -p /var/www/visas.guide
sudo mv /tmp/visas-guide/* /var/www/visas.guide/
sudo chown -R www-data:www-data /var/www/visas.guide
```

## Step 4: Configure Nginx

Create Nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/visas.guide
```

Add this configuration:

```nginx
# ── Bot user-agent map (place OUTSIDE the server block) ──
map $http_user_agent $is_bot {
    default                         0;
    "~*googlebot"                   1;
    "~*bingbot"                     1;
    "~*yandex"                      1;
    "~*baiduspider"                 1;
    "~*facebookexternalhit"         1;
    "~*twitterbot"                  1;
    "~*rogerbot"                    1;
    "~*linkedinbot"                 1;
    "~*embedly"                     1;
    "~*quora link preview"          1;
    "~*showyoubot"                  1;
    "~*outbrain"                    1;
    "~*pinterest"                   1;
    "~*slackbot"                    1;
    "~*vkShare"                     1;
    "~*W3C_Validator"               1;
    "~*whatsapp"                    1;
    "~*applebot"                    1;
    "~*duckduckbot"                 1;
    "~*Sogou"                       1;
    "~*Semrush"                     1;
    "~*AhrefsBot"                   1;
}

server {
    listen 80;
    server_name visas.guide www.visas.guide;
    root /var/www/visas.guide;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/javascript application/json;

    # ── Prerendering for SEO bots ──
    # Proxies bot requests to a prerender service (e.g., Prerender.io)
    # so crawlers receive fully-rendered HTML instead of a JS shell.
    # Sign up at https://prerender.io and set your token below.
    #
    # To enable: replace YOUR_PRERENDER_TOKEN with your actual token
    # and uncomment the location block below.
    
    set $prerender 0;
    if ($is_bot) {
        set $prerender 1;
    }
    # Don't prerender static assets or API calls
    if ($uri ~* "\.(js|css|xml|less|png|jpg|jpeg|gif|pdf|doc|txt|ico|rss|zip|mp3|rar|exe|wmv|doc|avi|ppt|mpg|mpeg|tif|wav|mov|psd|ai|xls|mp4|m4a|swf|dat|dmg|iso|flv|m4v|torrent|ttf|woff|woff2|svg|eot)$") {
        set $prerender 0;
    }

    location / {
        if ($prerender = 1) {
            # Option A: Prerender.io (recommended, managed service)
            # rewrite .* /https://visas.guide$request_uri? break;
            # proxy_pass https://service.prerender.io;
            # proxy_set_header X-Prerender-Token YOUR_PRERENDER_TOKEN;
            
            # Option B: Self-hosted Prerender (run on same EC2 or separate instance)
            # proxy_pass http://localhost:3000;
            # proxy_set_header X-Prerender-Token none;
            
            # Until prerender is configured, serve static files normally
            rewrite .* /index.html break;
        }
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Sitemap and robots.txt
    location = /sitemap.xml {
        try_files $uri =404;
    }

    location = /robots.txt {
        try_files $uri =404;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/visas.guide /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Remove default site
sudo nginx -t  # Test configuration
sudo systemctl reload nginx
```

## Step 5: Configure DNS

In your domain registrar (or Route 53):

1. Create an **A Record**:
   - Name: `@` (or blank)
   - Value: Your EC2 public IP
   - TTL: 300

2. Create a **CNAME Record** for www:
   - Name: `www`
   - Value: `visas.guide`
   - TTL: 300

Wait for DNS propagation (5-30 minutes).

## Step 6: Install SSL Certificate

```bash
sudo certbot --nginx -d visas.guide -d www.visas.guide
```

Follow the prompts:
- Enter your email
- Agree to terms
- Choose to redirect HTTP to HTTPS (recommended)

Certbot auto-renews. Test with:

```bash
sudo certbot renew --dry-run
```

## Step 7: Configure Firewall

```bash
# Allow HTTP, HTTPS, and SSH
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

## Step 8: Verify Deployment

Test these URLs:
- https://visas.guide
- https://visas.guide/countries
- https://visas.guide/blog
- https://visas.guide/sitemap.xml
- https://visas.guide/robots.txt

## Updating the Site

To deploy updates:

```bash
# Local: Build new version
npm run build

# Upload to EC2
scp -i your-key.pem -r dist/* ubuntu@your-ec2-ip:/tmp/visas-guide-update/

# On EC2: Deploy update
sudo rm -rf /var/www/visas.guide/*
sudo mv /tmp/visas-guide-update/* /var/www/visas.guide/
sudo chown -R www-data:www-data /var/www/visas.guide
sudo systemctl reload nginx
```

## Troubleshooting

### 404 on page refresh
Ensure Nginx `try_files $uri $uri/ /index.html;` is configured correctly.

### SSL certificate issues
```bash
sudo certbot certificates  # Check status
sudo certbot renew --force-renewal  # Force renew
```

### Check Nginx logs
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Test Nginx config
```bash
sudo nginx -t
```

## Environment Notes

- **Supabase**: Already configured with project `awiytryceqehqapytfgn`
- **Edge Functions**: Deployed automatically via Lovable
- **Analytics**: Google Analytics configured in admin settings
- **Sitemap**: Static at `/sitemap.xml`, dynamic at Supabase edge function

## Security Checklist

- [ ] SSL certificate installed and auto-renewing
- [ ] HTTP redirects to HTTPS
- [ ] Security headers configured
- [ ] Firewall enabled (UFW)
- [ ] Regular system updates scheduled
- [ ] Nginx access logs monitored

## Performance Checklist

- [ ] Gzip compression enabled
- [ ] Static asset caching configured
- [ ] Images optimized
- [ ] DNS propagated globally
