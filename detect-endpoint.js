// detect-endpoint.js
// Mounts POST /detect on the workspace Express app.
// In server.js:  require('./detect-endpoint')(app);
//
// POST /detect                  (x-api-key required)
// body: { url, top? }
// resp: { ok, video, messages, highlights: [{t, ts, score, msgRate, emoteRate, suggestStart, suggestDuration}] }

const { detectHighlights } = require('./detect-pipeline');

module.exports = function mountDetectEndpoint(app) {
  const KEY = process.env.WORKSPACE_API_KEY;
  const auth = (req, res, next) => {
    if (!KEY || req.headers['x-api-key'] !== KEY) {
      return res.status(401).json({ ok: false, error: 'Unauthorized' });
    }
    next();
  };

  app.post('/detect', auth, async (req, res) => {
    const { url, top = 5 } = req.body || {};
    if (!url) return res.status(400).json({ ok: false, error: 'url is required' });
    try {
      const result = await detectHighlights({ url, top: Math.min(Number(top) || 5, 10) });
      res.json(result);
    } catch (e) {
      res.status(500).json({ ok: false, error: e.message });
    }
  });
};
