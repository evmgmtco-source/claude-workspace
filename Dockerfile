# Auto-generated: node + python3 + ffmpeg + yt-dlp for the workspace social pipeline
FROM node:20-slim

# System deps: python3, ffmpeg, and curl (to fetch yt-dlp)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-venv \
    ffmpeg \
    curl \
    ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# Install yt-dlp (standalone binary, most reliable + self-updating)
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
 && chmod a+rx /usr/local/bin/yt-dlp \
 && yt-dlp --version

WORKDIR /app

# Install node deps first for layer caching
COPY package*.json ./
RUN npm install --omit=dev

# Copy the rest of the app
COPY . .

EXPOSE 8080
CMD ["node", "server.js"]
