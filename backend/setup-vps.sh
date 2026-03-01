#!/usr/bin/env bash
set -euo pipefail

echo "[1/7] Installing base packages"
sudo apt update
sudo apt install -y curl git nginx mysql-server python3

echo "[2/7] Installing Node.js 20 + PM2"
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2

echo "[3/7] Checking repository files"
[ -f package.json ] || { echo "package.json missing in current directory"; exit 1; }
[ -f backend/server.js ] || { echo "backend/server.js missing"; exit 1; }


echo "[4/7] Installing node dependencies"
npm install

echo "[5/7] Preparing env"
[ -f backend/.env ] || cp backend/.env.example backend/.env

echo "[6/7] Starting API with PM2"
pm2 start backend/server.js --name republicnodes-api || pm2 restart republicnodes-api
pm2 save

echo "[7/7] Done"
echo "Now configure MySQL DB/user, import backend/schema.sql, and set backend/.env values."
