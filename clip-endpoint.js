// clip-endpoint.js
// Mounts POST /clip on the workspace Express app.
// In server.js:  require('./clip-endpoint')(app);
//
// POST /clip
// body: { url, start, end?, duration?, vertical?, precise? }
// resp: { ok, file, sizeBytes, durationSec, source }  (file saved under /data/clips)

const { cutClip } = require('./clip-pipeline');

module.exports = function mountClipEndpoint(app, { outDir = process.env.CLIP_OUT_DIR || '/data/clips' } = {}) {
  app.post('/clip', async (req, res) => {
    const { url, start = 0, end, duration, vertical = false, precise = false } = req.body || {};
    if (!url) return res.status(400).json({ ok: false, error: 'url is required' });
    if (end == null && duration == null) {
      return res.status(400).json({ ok: false, error: 'end or duration is required' });
    }
    try {
      const result = await cutClip({ url, start, end, duration, vertical, precise, outDir });
      res.json({ ok: true, ...result });
    } catch (e) {
      res.status(500).json({ ok: false, error: e.message });
    }
  });
};
