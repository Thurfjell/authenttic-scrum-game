sudo apt update && sudo apt install nginx -y && \
sudo tee /etc/systemd/system/my-node-app.service > /dev/null <<EOF
[Unit]
Description=DJ Scrum Game
After=network.target
[Service]
ExecStart=/usr/bin/node /home/youruser/app/server.js
Restart=always
User=youruser
Environment=NODE_ENV=production
WorkingDirectory=/home/youruser/app
[Install]
WantedBy=multi-user.target
EOF
sudo systemctl daemon-reexec && \
sudo systemctl daemon-reload && \
sudo systemctl enable --now my-node-app && \
sudo tee /etc/nginx/sites-available/nodeapp > /dev/null <<EOF
server {
    listen 80;
    server_name example.com;
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
    }
}
EOF
sudo ln -s /etc/nginx/sites-available/nodeapp /etc/nginx/sites-enabled/ && \
sudo nginx -t && sudo systemctl reload nginx
