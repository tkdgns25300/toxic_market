#!/bin/bash
cd /home/ubuntu/toxic-market-place
authbind --deep pm2 start "npm run start" --name index.ts