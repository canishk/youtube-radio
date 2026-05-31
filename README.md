# U-Tube Radio

A small personal project that serves a lightweight radio powered by YouTube videos. This repository contains a Python/FastAPI backend and a Vite + React frontend.

## Quick Start

- **Backend (API)**

  1. Open a terminal and enter the backend folder:

	  ```powershell
	  cd backend
	  ```

  2. Create and activate a virtual environment:

	  ```powershell
	  python -m venv .venv
	  (Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned) ; (& .venv\Scripts\Activate.ps1)
	  ```

	  Or on macOS / Linux:

	  ```bash
	  python3 -m venv .venv
	  source .venv/bin/activate
	  ```

  3. Install Python dependencies:

	  ```bash
	  pip install -r requirements.txt
	  ```

  4. Copy the example env and populate secrets:

	  ```bash
	  # Unix
	  cp .env.example .env

	  # Windows (PowerShell)
	  Copy-Item .env.example .env
	  ```

	  Edit `backend/.env` and fill in `YOUTUBE_API_KEY` and `ADMIN_ACCESS_KEY`.

  5. Run the API:

	  ```bash
	  uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
	  ```

- **Frontend (Development)**

  1. From the project root open a terminal and run:

	  ```bash
	  cd frontend
	  npm install
	  npm run dev
	  ```

  2. The frontend expects the API to be reachable at `http://127.0.0.1:8000` by default. You can change the backend URL in `frontend/src/services/api.js`.

## Environment variables

- `APP_NAME` — application display name (example: `U-Tube Radio`)
- `APP_ENV` — runtime environment (development/production)
- `API_VERSION` — API version string
- `YOUTUBE_API_KEY` — (required) Google API key for YouTube Data API v3
- `ADMIN_ACCESS_KEY` — (required) simple admin key used by the admin login endpoint

An example file is provided at `backend/.env.example` — copy it to `backend/.env` and replace placeholders with your real values.

## Notes

- The backend currently uses a local SQLite database file by default (`u_tube_radio.db`) defined in `backend/app/db/database.py`.
- Keep sensitive keys out of version control. Do not commit your real `backend/.env`.

## License

See the `LICENSE` file included in this repository.

**Deployment**

A quick summary for deploying to a Linux server. Detailed steps and templates are in [deployment/README.md](deployment/README.md).

- Clone the repo on the server (example path `/opt/u-tube-radio`) and run the deployment helpers from the `deployment/` folder.

	```bash
	# on the server (replace <owner>/<repo>)
	# HTTPS
	sudo git clone https://github.com/canishk/youtube-radio.git /opt/u-tube-radio

	# or SSH
	sudo git clone git@github.com:canishk/youtube-radio.git /opt/u-tube-radio

	cd /opt/u-tube-radio/deployment
	```

- Backend (systemd + venv)

	```bash
	sudo bash ./setup_backend.sh /opt/u-tube-radio/backend
	# copy the service file and enable it
	sudo cp ./uvicorn.service /etc/systemd/system/u-tube-radio.service
	sudo systemctl daemon-reload
	sudo systemctl enable --now u-tube-radio.service
	sudo journalctl -u u-tube-radio -f
	```

	Edit `/opt/u-tube-radio/backend/.env` and fill `YOUTUBE_API_KEY` and `ADMIN_ACCESS_KEY` before starting the service.

- Frontend (build & static files)

	```bash
	sudo bash ./setup_frontend.sh /opt/u-tube-radio/frontend
	# enable nginx site (Debian/Ubuntu example)
	sudo cp ./nginx.u-tube-radio /etc/nginx/sites-available/u-tube-radio
	sudo ln -s /etc/nginx/sites-available/u-tube-radio /etc/nginx/sites-enabled/
	sudo nginx -t
	sudo systemctl reload nginx
	```

- Security & cleanup

	- Set correct ownership and permissions (example): `sudo chown -R www-data:www-data /opt/u-tube-radio`
	- Open firewall for HTTP/HTTPS: `sudo ufw allow 'Nginx Full'`
	- Obtain TLS certs (e.g. `certbot --nginx`) and update `server_name` in [deployment/nginx.u-tube-radio](deployment/nginx.u-tube-radio).
	- Keep `backend/.env` out of git; `.gitignore` already includes it.
 