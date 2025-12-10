# Crypto Trading Platform - Complete VPS Deployment Guide

**Project:** Nakamotoshi Crypto Trading Platform  
**Domain:** nakamotoshi.online  
**Server:** Ubuntu VPS (103.74.92.174)  
**Date:** December 10, 2025  

---

## Table of Contents

1. [Overview](#1-overview)
2. [Server Requirements](#2-server-requirements)
3. [Initial Server Setup](#3-initial-server-setup)
4. [Installing Prerequisites](#4-installing-prerequisites)
5. [PostgreSQL Database Setup](#5-postgresql-database-setup)
6. [Application Deployment](#6-application-deployment)
7. [Nginx Reverse Proxy Configuration](#7-nginx-reverse-proxy-configuration)
8. [SSL Certificate Setup](#8-ssl-certificate-setup)
9. [PM2 Process Manager Configuration](#9-pm2-process-manager-configuration)
10. [Admin User Setup](#10-admin-user-setup)
11. [Challenges Faced & Solutions](#11-challenges-faced--solutions)
12. [Final Configuration Summary](#12-final-configuration-summary)
13. [Maintenance Commands](#13-maintenance-commands)
14. [Troubleshooting Guide](#14-troubleshooting-guide)

---

## 1. Overview

This document provides a comprehensive guide for deploying the Crypto Trading Platform to a production Ubuntu VPS server. The platform is a full-stack application built with:

- **Frontend:** React 18 + Vite + TailwindCSS + shadcn/ui
- **Backend:** Express.js + TypeScript
- **Database:** PostgreSQL with Drizzle ORM
- **Process Manager:** PM2
- **Web Server:** Nginx (reverse proxy)
- **SSL:** Let's Encrypt (Certbot)

---

## 2. Server Requirements

### Minimum Specifications
- **OS:** Ubuntu 20.04 LTS or later
- **RAM:** 2GB minimum (4GB recommended for builds)
- **Storage:** 20GB SSD
- **CPU:** 1 vCPU minimum

### Required Ports
- **22** - SSH access
- **80** - HTTP (redirects to HTTPS)
- **443** - HTTPS
- **5000** - Application port (internal only)

---

## 3. Initial Server Setup

### Step 1: Connect to Server via SSH
```bash
ssh root@103.74.92.174
```

### Step 2: Update System Packages
```bash
sudo apt update && sudo apt upgrade -y
```

### Step 3: Set Timezone (Optional)
```bash
sudo timedatectl set-timezone UTC
```

---

## 4. Installing Prerequisites

### Step 1: Install Node.js 20.x
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Verify installation:
```bash
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

### Step 2: Install PostgreSQL
```bash
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

Verify PostgreSQL is running:
```bash
sudo systemctl status postgresql
```

### Step 3: Install Nginx
```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Step 4: Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

### Step 5: Install Certbot (SSL)
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### Step 6: Install Git
```bash
sudo apt install git -y
```

---

## 5. PostgreSQL Database Setup

### Step 1: Create Database User
```bash
sudo -u postgres psql
```

In PostgreSQL prompt:
```sql
CREATE USER crypto_user WITH PASSWORD 'MACt08140615640Tt';
CREATE DATABASE crypto_trading_db OWNER crypto_user;
GRANT ALL PRIVILEGES ON DATABASE crypto_trading_db TO crypto_user;
\q
```

**Important Note on Passwords:**
- Avoid special characters like `+`, `/`, `@`, `#` in database passwords
- These characters break URL parsing in connection strings
- Use only alphanumeric characters and underscores

### Step 2: Verify Database Connection
```bash
sudo -u postgres psql -d crypto_trading_db -c "\dt"
```

---

## 6. Application Deployment

### Step 1: Create Application Directory
```bash
sudo mkdir -p /var/www/crypto-trading
cd /var/www/crypto-trading
```

### Step 2: Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/crypto-trading.git .
```

Or pull latest changes:
```bash
git pull origin main
```

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Create Environment File
```bash
nano .env
```

Add the following content:
```env
DATABASE_URL=postgresql://crypto_user:MACt08140615640Tt@localhost:5432/crypto_trading_db
PGHOST=localhost
PGPORT=5432
PGUSER=crypto_user
PGPASSWORD=MACt08140615640Tt
PGDATABASE=crypto_trading_db
SESSION_SECRET=your-secure-session-secret-here
NODE_ENV=production
PORT=5000
```

### Step 5: Run Database Migrations
```bash
npm run db:push
```

Expected output:
```
[✓] Pulling schema from database...
[✓] Changes applied
```

### Step 6: Build the Application

**Important:** If the build gets "Killed" due to memory issues, add swap space first:
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

Then build:
```bash
npm run build
```

Expected output:
```
vite v7.1.12 building for production...
✓ 2845 modules transformed.
../dist/public/index.html    0.79 kB
../dist/public/assets/...    (various files)
✓ built in 21.17s
dist/index.js  122.1kb
```

---

## 7. Nginx Reverse Proxy Configuration

### Step 1: Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/crypto-trading
```

Add the following content:
```nginx
server {
    listen 80;
    server_name nakamotoshi.online www.nakamotoshi.online;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Step 2: Enable the Site
```bash
sudo ln -s /etc/nginx/sites-available/crypto-trading /etc/nginx/sites-enabled/
```

### Step 3: Remove Default Site (Optional)
```bash
sudo rm /etc/nginx/sites-enabled/default
```

### Step 4: Test and Reload Nginx
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 8. SSL Certificate Setup

### Prerequisites
- Domain DNS must be pointing to server IP
- Ports 80 and 443 must be open

### Step 1: Obtain SSL Certificate
```bash
sudo certbot --nginx -d nakamotoshi.online -d www.nakamotoshi.online
```

Follow the prompts:
1. Enter email address
2. Agree to terms (Y)
3. Choose to redirect HTTP to HTTPS (recommended)

### Step 2: Verify Auto-Renewal
```bash
sudo certbot renew --dry-run
```

---

## 9. PM2 Process Manager Configuration

### Step 1: Start Application with Environment Variables
```bash
cd /var/www/crypto-trading
export NODE_ENV=production
export DATABASE_URL="postgresql://crypto_user:MACt08140615640Tt@localhost:5432/crypto_trading_db"
pm2 start dist/index.js --name crypto-trading -i 1
```

### Step 2: Save PM2 Configuration
```bash
pm2 save
```

### Step 3: Setup PM2 Startup Script
```bash
pm2 startup systemd
```
Run the command it outputs.

### Step 4: Verify Application Status
```bash
pm2 status
pm2 logs crypto-trading --lines 20
```

---

## 10. Admin User Setup

### Step 1: Generate Password Hash
Use bcryptjs to hash the admin password. The hash for password `MAC_T08140615640_Tt` is:
```
$2b$10$Iyfix/B4O9MAg6dRASevd.hP9akbTUi6gbBX9raMU9xd5umaEK0..
```

### Step 2: Insert Admin User
```bash
sudo -u postgres psql -d crypto_trading_db -c "INSERT INTO admins (email, password, permissions, created_at) VALUES ('admin@admin.com', '\$2b\$10\$Iyfix/B4O9MAg6dRASevd.hP9akbTUi6gbBX9raMU9xd5umaEK0..', '[\"all\"]', NOW());"
```

### Step 3: Verify Admin User
```bash
sudo -u postgres psql -d crypto_trading_db -c "SELECT id, email FROM admins;"
```

### Admin Login Credentials
- **URL:** https://nakamotoshi.online/admin
- **Email:** admin@admin.com
- **Password:** MAC_T08140615640_Tt

---

## 11. Challenges Faced & Solutions

### Challenge 1: Database Connection String URL Parsing Error

**Error:**
```
TypeError: Invalid URL
code: 'ERR_INVALID_URL'
input: 'postgresql://crypto_user:HGhOwL+YQ/eXlgIJkdTkBfUG+U+L4ibi@localhost:5432/crypto_trading_db'
```

**Cause:** Database password contained special characters (`+` and `/`) that break URL parsing.

**Solution:** Changed the PostgreSQL password to one without special characters:
```bash
sudo -u postgres psql -c "ALTER USER crypto_user WITH PASSWORD 'MACt08140615640Tt';"
```

**Lesson Learned:** Always use alphanumeric passwords for database connection strings, or properly URL-encode special characters:
- `+` becomes `%2B`
- `/` becomes `%2F`
- `@` becomes `%40`

---

### Challenge 2: PM2 Not Reading Updated .env File

**Error:** After updating .env file, PM2 continued using old environment variables.

**Cause:** PM2 caches environment variables and doesn't automatically reload .env files.

**Solution:** Delete and restart PM2 with exported environment variables:
```bash
pm2 delete crypto-trading
export NODE_ENV=production
export DATABASE_URL="postgresql://crypto_user:MACt08140615640Tt@localhost:5432/crypto_trading_db"
pm2 start dist/index.js --name crypto-trading -i 1
```

---

### Challenge 3: Build Process Killed (Out of Memory)

**Error:**
```
npm run build
...
Killed
```

**Cause:** VPS didn't have enough RAM for the Vite build process.

**Solution:** Added swap space:
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

---

### Challenge 4: App Running in Development Mode

**Error:** Blank page with Vite errors in logs:
```
[vite] (client) Pre-transform error: Failed to load url /src/main.tsx
```

**Cause:** `NODE_ENV` was not set to `production`, causing the app to try running Vite dev server.

**Solution:** Set `NODE_ENV=production` before starting PM2:
```bash
export NODE_ENV=production
pm2 start dist/index.js --name crypto-trading -i 1
```

---

### Challenge 5: 502 Bad Gateway from Nginx

**Error:** Browser showed "502 Bad Gateway nginx/1.18.0 (Ubuntu)"

**Cause:** Nginx was configured to proxy to port 3000, but the app was running on port 5000.

**Solution:** Updated Nginx configuration:
```bash
sudo nano /etc/nginx/sites-available/crypto-trading
# Change: proxy_pass http://127.0.0.1:3000;
# To:     proxy_pass http://127.0.0.1:5000;
sudo nginx -t
sudo systemctl reload nginx
```

---

### Challenge 6: Admin Table Column Mismatch

**Error:**
```
ERROR: column "is_active" of relation "admins" does not exist
```

**Cause:** SQL insert statement included a column that didn't exist in the actual database schema.

**Solution:** Checked actual table structure and adjusted SQL:
```bash
sudo -u postgres psql -d crypto_trading_db -c "\d admins"
```

Used correct columns:
```sql
INSERT INTO admins (email, password, permissions, created_at) VALUES (...);
```

---

### Challenge 7: Admin Login Returns 500 Error

**Error:** Login attempts returned "Login failed" with 500 status.

**Cause:** Database connection was failing due to the URL parsing error.

**Solution:** Fixed the DATABASE_URL with a simple password and restarted PM2 with proper environment variables.

---

## 12. Final Configuration Summary

### Server Details
- **IP Address:** 103.74.92.174
- **Domain:** nakamotoshi.online
- **SSL:** Let's Encrypt (auto-renewing)

### Application Configuration
- **Port:** 5000 (internal)
- **Node Environment:** production
- **Process Manager:** PM2 (cluster mode, 1 instance)

### Database Configuration
- **Host:** localhost
- **Port:** 5432
- **Database:** crypto_trading_db
- **User:** crypto_user
- **Password:** MACt08140615640Tt

### File Locations
- **Application:** /var/www/crypto-trading
- **Nginx Config:** /etc/nginx/sites-available/crypto-trading
- **PM2 Logs:** /root/.pm2/logs/
- **Environment File:** /var/www/crypto-trading/.env

---

## 13. Maintenance Commands

### Application Management
```bash
# View app status
pm2 status

# View logs
pm2 logs crypto-trading --lines 50

# Restart app
pm2 restart crypto-trading

# Stop app
pm2 stop crypto-trading

# Delete app
pm2 delete crypto-trading
```

### Database Management
```bash
# Connect to database
sudo -u postgres psql -d crypto_trading_db

# View users
sudo -u postgres psql -d crypto_trading_db -c "SELECT id, username, first_name FROM users;"

# View admins
sudo -u postgres psql -d crypto_trading_db -c "SELECT id, email FROM admins;"
```

### Nginx Management
```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx

# View Nginx logs
sudo tail -f /var/log/nginx/error.log
```

### Updating the Application
```bash
cd /var/www/crypto-trading
git pull origin main
npm install
npm run build
pm2 restart crypto-trading
```

---

## 14. Troubleshooting Guide

### Issue: App not responding
1. Check PM2 status: `pm2 status`
2. Check logs: `pm2 logs crypto-trading --lines 30`
3. Verify port: `curl http://localhost:5000`

### Issue: 502 Bad Gateway
1. Verify app is running: `pm2 status`
2. Check Nginx config: `sudo nginx -t`
3. Verify port match between Nginx and app

### Issue: Database connection errors
1. Verify PostgreSQL is running: `sudo systemctl status postgresql`
2. Test connection: `sudo -u postgres psql -d crypto_trading_db`
3. Check DATABASE_URL in environment

### Issue: SSL certificate issues
1. Check certificate status: `sudo certbot certificates`
2. Renew manually: `sudo certbot renew`
3. Check Nginx config: `sudo nginx -t`

### Issue: Build fails (Killed)
1. Check memory: `free -h`
2. Add swap if needed
3. Retry build

---

## Document Information

**Created:** December 10, 2025  
**Author:** Replit Agent  
**Version:** 1.0  
**Platform:** Nakamotoshi Crypto Trading Platform  

---

*This document serves as a complete reference for deploying and maintaining the Crypto Trading Platform on a production VPS server.*
