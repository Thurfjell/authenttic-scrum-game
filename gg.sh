#!/bin/bash

USER=youruser
HOST=your.server.com
REMOTE_PATH=/home/youruser/app

echo "→ Syncing files..."
rsync -av --delete ./app/ $USER@$HOST:$REMOTE_PATH/

echo "→ Restarting app..."
ssh $USER@$HOST "sudo systemctl restart my-node-app"

echo "✅ Deploy complete."
