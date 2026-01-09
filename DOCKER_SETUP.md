# Portfolio Docker Setup

## Build Docker Image

```bash
docker build -t portfolio:latest .
```

## Run with Docker

```bash
docker run -p 3000:3000 \
  -e CLOUDINARY_CLOUD_NAME=your-cloud-name \
  -e CLOUDINARY_API_KEY=your-api-key \
  -e CLOUDINARY_API_SECRET=your-api-secret \
  portfolio:latest
```

## Run with Docker Compose

1. Create a `.env` file:

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

2. Run:

```bash
docker-compose up -d
```

## Deploy to Dokploy

1. Push to GitHub
2. In Dokploy:
   - Create new application
   - Connect GitHub repo
   - Select this folder as root directory
   - Add environment variables in Dokploy dashboard:
     - `CLOUDINARY_CLOUD_NAME`
     - `CLOUDINARY_API_KEY`
     - `CLOUDINARY_API_SECRET`
   - Deploy

The app will be available at your domain on port 3000.

## Files Created

- **Dockerfile**: Multi-stage build for optimal image size
- **.dockerignore**: Excludes unnecessary files from Docker build
- **docker-compose.yml**: Local development with docker-compose

## Notes

- Image is based on Alpine Linux (small & fast)
- Uses Node 18 (you can change to 20 if needed)
- Health checks included for monitoring
- Auto-restart on failure
