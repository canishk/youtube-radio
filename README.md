# U-Tube Radio

A mood-driven online radio built with FastAPI and React. Songs play through the YouTube IFrame API; categories, sessions, and playback history are stored in SQLite.

## Docker install (recommended)

Run the full stack (nginx + API + built frontend) with Docker Compose.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/) (included with Docker Desktop)

### Setup

1. Clone the repository and go to the project root.

2. Create your environment file:

   ```bash
   cp backend/.env.example backend/.env
   ```

   Edit `backend/.env` and set:

   - `YOUTUBE_API_KEY` — Google API key with YouTube Data API v3 enabled
   - `ADMIN_ACCESS_KEY` — secret for the admin login endpoint
   - `GROQ_API_KEY` — optional; enables AI metadata suggestions in admin

3. Start the app:

   ```bash
   docker compose up --build -d
   ```

4. Open [http://localhost:8080](http://localhost:8080)

### Useful commands

```bash
# Follow logs
docker compose logs -f

# Stop containers (data volume is kept)
docker compose down

# Rebuild after code changes
docker compose up --build -d

# Remove containers and the database volume
docker compose down -v
```

### Data persistence

SQLite lives in the named Docker volume `u-tube-radio-data`, mounted at `/app/data` inside the container. The entrypoint sets `DATABASE_URL=sqlite:////app/data/u_tube_radio.db` automatically. Recreating the container does not delete your database unless you run `docker compose down -v`.

### Health check

The container exposes port 80 internally. Compose maps it to **8080** on the host. Verify the API:

```bash
curl http://localhost:8080/api/health
```

Expected: `{"status":"healthy"}`

---

## Local development

For frontend hot-reload and backend `--reload`, run services separately.

### Backend

```bash
cd backend
python -m venv .venv

# Windows PowerShell
.\.venv\Scripts\Activate.ps1

# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env   # fill in secrets
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Local dev uses `sqlite:///./u_tube_radio.db` in the backend folder unless you set `DATABASE_URL` in `.env`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The dev server proxies `/api` to `http://127.0.0.1:8000` (see `frontend/vite.config.js`).

---

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `YOUTUBE_API_KEY` | Yes | YouTube Data API v3 key |
| `ADMIN_ACCESS_KEY` | Yes | Admin login secret |
| `GROQ_API_KEY` | No | Groq API key for admin metadata suggestions |
| `APP_NAME` | No | Display name (default: `U-Tube Radio`) |
| `APP_ENV` | No | `development` or `production` (Docker defaults to `production`) |
| `API_VERSION` | No | API version string |
| `DATABASE_URL` | No | SQLAlchemy URL; Docker sets `sqlite:////app/data/u_tube_radio.db` |

Copy `backend/.env.example` to `backend/.env` for local dev or Docker Compose (`env_file` in `docker-compose.yml`). Never commit real secrets.

---

## Bare-metal deployment

For systemd + host nginx without Docker, see [deployment/README.md](deployment/README.md).

---

## License

See [LICENSE](LICENSE).
