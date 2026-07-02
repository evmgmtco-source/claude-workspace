PASTE_TEST_123// clip-pipeline.js
// Clip-cutting pipeline: resolve → download → ffmpeg segment → output file
// Designed for the Claude Workspace server (Railway). Requires yt-dlp + ffmpeg
// (both installed in the Docker image).
//
// Usage:
//   const { cutClip } = require('./clip-pipeline');
//   const out = await cutClip({
//     url: 'https://kick.com/someclip',   // or Twitch/YouTube — anything yt-dlp supports
//     start: '00:01:23',                  // seconds or HH:MM:SS
//     end: '00:01:53',                    // optional if duration given
//     duration: 30,                       // optional alternative to end
//     outDir: '/data/clips',              // defaults to ./clips
//     format: 'mp4',
//     vertical: false                     // true = 9:16 crop for TikTok/Shorts
//   });
//   // → { file, sizeBytes, durationSec, source }

const { execFile } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const run = promisify(execFile);

const YTDLP = process.env.YTDLP_PATH || 'yt-dlp';
const FFMPEG = process.env.FFMPEG_PATH || 'ffmpeg';
const FFPROBE = process.env.FFPROBE_PATH || 'ffprobe';

// ---------- helpers ----------

function toSeconds(t) {
  if (t == null) return null;
  if (typeof t === 'number') return t;
  const parts = String(t).split(':').map(Number);
  if (parts.some(isNaN)) throw new Error(`Bad timestamp: ${t}`);
  return parts.reduce((acc, p) => acc * 60 + p, 0);
}

function tmpName(ext) {
  return path.join(require('os').tmpdir(), `clip-${crypto.randomBytes(6).toString('hex')}.${ext}`);
}

// ---------- 1. resolve ----------

async function resolveSource(url) {
  const { stdout } = await run(YTDLP, [
    '--no-warnings',
    '--no-playlist',
    '-J',
    url
  ], { maxBuffer: 50 * 1024 * 1024 });

  const info = JSON.parse(stdout);
  return {
    id: info.id,
    title: info.title || 'clip',
    duration: info.duration || null,
    extractor: info.extractor,
    directUrl: info.url || null,
    original: url
  };
}

// ---------- 2. download ----------

async function downloadSource(url) {
  const out = tmpName('mp4');
  await run(YTDLP, [
    '--no-warnings',
    '--no-playlist',
    '-f', 'bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]/b',
    '--merge-output-format', 'mp4',
    '-o', out,
    url
  ], { maxBuffer: 10 * 1024 * 1024 });stsSync(out)) throw new Error('yt-dlp did not produce an output file');
  return out;
}

// ---------- 3. ffmpeg segment ----------

async function cutSegment(srcFile, { start = 0, end, duration, outFile, precise = true, vertical = false }) {
  const s = toSeconds(start) ?? 0;
  const d = duration != null ? toSeconds(duration)
          : end != null ? toSeconds(end) - s
          : null;
  if (d == null || d <= 0) throw new Error('Provide end or duration (> start)');

  const args = ['-y', '-ss', String(s), '-i', srcFile, '-t', String(d)];

  if (precise || vertical) {
    if (vertical) {
      args.push('-vf', "crop=ih*9/16:ih,scale=1080:1920");
    }
    args.push('-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20',
              '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart');
  } else {
    args.push('-c', 'copy');
  }
  args.push(outFile);

  await run(FFMPEG, args, { maxBuffer: 10 * 1024 * 1024 });
  return outFile;
}

async function probeDuration(file) {
  try {
    const { stdout } = await run(FFPROBE, [
      '-v', 'error', '-show_entries', 'format=duration',
      '-of', 'default=nw=1:nk=1', file
    ]);
    return parseFloat(stdout.trim()) || null;
  } catch { return null; }
}

// ---------- pipeline ----------

async function cutClip({ url, start = 0, end, duration, outDir = './clips', format = 'mp4', precise = true, vertical = false, keepSource = false }) {
  if (!url) throw new Error('url is required');
  fs.mkdirSync(outDir, { recursive: true });

  const source = await resolveSource(url);
  const srcFile = await downloadSource(url);

  const safeTitle = (source.title || 'clip').replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '_').slice(0, 60);
  const outFile = path.join(outDir, `${safeTitle}_${Date.now()}.${format}`);

  try {
    await cutSegment(srcFile, { start, end, duration, outFile, precise, vertical });
  } finally {
    if (!keepSource) fs.rmSync(srcFile, { force: true });
  }

  return {
    file: outFile,
    sizeBytes: fs.statSync(outFile).size,
    durationSec: await probeDuration(outFile),
    source
  };
}

module.exports = { cutClip, resolveSource, downloadSource, cutSegment };

// CLI: node clip-pipeline.js <url> <start> <end|duration> [--vertical]
if (require.main === module) {
  const [url, start, endOrDur] = process.argv.slice(2);
  const vertical = process.argv.includes('--vertical');
  cutClip({ url, start, end: endOrDur, vertical })
    .then(r => console.log(JSON.stringify(r, null, 2)))
    .catch(e => { console.error(e.message); process.exit(1); });
}
