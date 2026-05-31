Deployment scripts and templates for Linux

Overview
- `setup_backend.sh` — copy backend to a target directory, create a venv and install dependencies. It will not enable the systemd unit automatically; follow the steps below.
- `uvicorn.service` — systemd unit template. Copy to `/etc/systemd/system/u-tube-radio.service` and enable it.
- `setup_frontend.sh` — builds the frontend and copies the `dist` output to `/var/www/u-tube-radio`.
- `nginx.u-tube-radio` — example nginx site config that serves static files and proxies `/api/` to the backend.

Typical install steps (example)

1. Clone the repository on the server (example path `/opt/u-tube-radio`).

	```bash
	# HTTPS (replace <owner>/<repo> with your repo)
	sudo git clone https://github.com/canishk/youtube-radio.git /opt/u-tube-radio

	# or SSH
	sudo git clone git@github.com:canishk/youtube-radio.git /opt/u-tube-radio
	```

2. Backend

```bash
cd /opt/u-tube-radio/deployment
sudo bash ./setup_backend.sh /opt/u-tube-radio/backend

# as root
sudo cp ./uvicorn.service /etc/systemd/system/u-tube-radio.service
sudo systemctl daemon-reload
sudo systemctl enable --now u-tube-radio.service
sudo journalctl -u u-tube-radio -f
```

Edit `/opt/u-tube-radio/backend/.env` before starting the service.

3. Frontend

```bash
cd /opt/u-tube-radio/deployment
sudo bash ./setup_frontend.sh /opt/u-tube-radio/frontend
```

4. Nginx

Copy the nginx site file and enable it (Debian/Ubuntu example):

```bash
sudo cp ./nginx.u-tube-radio /etc/nginx/sites-available/u-tube-radio
sudo ln -s /etc/nginx/sites-available/u-tube-radio /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Customization
- Update `uvicorn.service` `WorkingDirectory` and `ExecStart` paths if you install to a different location.
- Set `server_name` in `nginx.u-tube-radio` and configure TLS (e.g. certbot).

Security
- Keep `backend/.env` out of version control. See repository root `.gitignore`.
