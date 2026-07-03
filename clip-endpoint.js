// clip-endpoint.js
// Mounts POST /clip and GET /clip/download/:name on the workspace Express app.
// In server.js:  require('./clip-endpoint')(app);
//
// POST /clip                    (x-api-key required)
// body: { url, start, end?, duration?, vertical?, precise? }
// resp: { ok, file, name, sizeBytes, durationSec, source }
//
// GET /clip/download/:name      (x-api-key required)
// Streams a previously produced clip as video/mp4.

const fs = require('fs');
const path = require('path');
const { cutClip } = require('./clip-pipeline');

module.exports = function mountClipEndpoint(app, { outDir = process.env.CLIP_OUT_DIR || '/data/clips' } = {}) {
  const KEY = process.env.WORKSPACE_API_KEY;
  const auth = (req, res, next) => {
    if (!KEY || req.headers['x-api-key'] !== KEY) {
      return res.status(401).json({ ok: false, error: 'Unauthorized' });
    }
    next();
  };

  app.post('/clip', auth, async (req, res) => {
    const { url, start = 0, end, duration, vertical = false, precise = false } = req.body || {};
    if (!url) return res.status(400).json({ ok: false, error: 'url is required' });
    if (end == null && duration == null) {
      return res.status(400).json({ ok: false, error: 'end or duration is required' });
    }
    try {
      const result = await cutClip({ url, start, end, duration, vertical, precise, outDir });
      const name = result.file ? path.basename(result.file) : null;
      res.json({ ok: true, ...result, name });
    } catch (e) {
      res.status(500).json({ ok: false, error: e.message });
    }
  });

  app.get('/clip/download/:name', auth, (req, res) => {
    const name = path.basename(req.params.name);
    if (!/^[\w.-]+\.mp4$/.test(name)) return res.status(400).json({ ok: false, error: 'Bad filename' });
    const p = path.join(outDir, name);
    if (!fs.existsSync(p)) return res.status(404).json({ ok: false, error: 'Not found' });
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', 'attachment; filename="' + name + '"');
    fs.createReadStream(p).pipe(res);
  });
};
