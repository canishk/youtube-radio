# ==========================================

# Stage 1 - Frontend Build

# ==========================================



FROM node:24-bookworm AS frontend-builder



WORKDIR /build/frontend



COPY frontend/package*.json ./



RUN npm ci



COPY frontend/ .



RUN npm run build





# ==========================================

# Stage 2 - Runtime

# ==========================================



FROM python:3.14-slim



ENV PYTHONUNBUFFERED=1 \

    APP_ENV=production \

    DATABASE_URL=sqlite:////app/data/u_tube_radio.db



RUN apt-get update && apt-get install -y nginx supervisor && rm -rf /var/lib/apt/lists/*



WORKDIR /app



# Backend



COPY backend /app/backend



RUN pip install --no-cache-dir -r /app/backend/requirements.txt



# Frontend build artifacts



COPY --from=frontend-builder /build/frontend/dist /var/www/u-tube-radio



# Nginx

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf



# Supervisor

COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf



# Entrypoint



COPY docker/docker-entrypoint.sh /docker-entrypoint.sh



RUN chmod +x /docker-entrypoint.sh



# Persistent database volume



RUN mkdir -p /app/data



VOLUME ["/app/data"]



EXPOSE 80



HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \

  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1/api/health')"



ENTRYPOINT ["/docker-entrypoint.sh"]

