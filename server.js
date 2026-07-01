require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }))
        model: 'claude-sonnet-4-6',
const API_KEY = process.env.WORKSPACE_API_KEY || 'claude-workspace-key';
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const FILES_DIR = './workspace/files';
const MEMORY_FILE = './workspace/memory.json';
const LOG_FILE = './workspace/log.json';

[FILES_DIR, './workspace'].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });
if (!fs.existsSync(MEMORY_FILE)) fs.writeFileSync(MEMORY_FILE, JSON.stringify({ notes: {}, context: {}, tasks: [] }));
if (!fs.existsSync(LOG_FILE)) fs.writeFileSync(LOG_FILE, JSON.stringify([]));

function auth(req, res, next) {
    if (req.headers['x-api-key'] !== API_KEY) return res.status(401).json({ error: 'Unauthorized' });
    next();
}

function addLog(action, detail) {
    try {
          const logs = JSON.parse(fs.readFileSync(LOG_FILE));
          logs.unshift({ action, detail, ts: new Date().toISOString() });
          if (logs.length > 500) logs.length = 500;
          fs.writeFileSync(LOG_FILE, JSON.stringify(logs));
    } catch(e) {}
}

// ── FILE OPS ──────────────────────────────────────────────────────────────────
app.get('/files', auth, (req, res) => {
    function walk(dir, base='') {
          if (!fs.existsSync(dir)) return [];
          return fs.readdirSync(dir).flatMap(f => {
                  const full = path.join(dir,f), rel = path.join(base,f);
                  return fs.statSync(full).isDirectory() ? walk(full,rel) : [{path:rel,size:fs.statSync(full).size,modified:fs.statSync(full).mtime}];
          });
    }
    res.json(walk(FILES_DIR));
});

app.get('/file', auth, (req, res) => {
    const fp = path.join(FILES_DIR, req.query.path);
    if (!fs.existsSync(fp)) return res.status(404).json({ error: 'Not found' });
    res.json({ content: fs.readFileSync(fp, 'utf8'), path: req.query.path });
});

app.post('/file', auth, (req, res) => {
    const { path: fp, content } = req.body;
    const full = path.join(FILES_DIR, fp);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
    addLog('write', fp);
    res.json({ success: true, path: fp });
});

app.delete('/file', auth, (req, res) => {
    const full = path.join(FILES_DIR, req.query.path);
    if (fs.existsSync(full)) fs.unlinkSync(full);
    addLog('delete', req.query.path);
    res.json({ success: true });
});

// ── EXEC ──────────────────────────────────────────────────────────────────────
app.post('/exec', auth, (req, res) => {
    const { command, cwd } = req.body;
    const workDir = cwd ? path.join(FILES_DIR, cwd) : FILES_DIR;
    addLog('exec', command.slice(0,100));
    exec(command, { cwd: workDir, timeout: 30000, maxBuffer: 2*1024*1024 }, (err, stdout, stderr) => {
          res.json({ stdout: stdout||'', stderr: stderr||'', error: err?.message||null });
    });
});

// ── MEMORY ────────────────────────────────────────────────────────────────────
app.get('/memory', auth, (req, res) => res.json(JSON.parse(fs.readFileSync(MEMORY_FILE))));

app.post('/memory', auth, (req, res) => {
    const mem = JSON.parse(fs.readFileSync(MEMORY_FILE));
    const { key, value, type } = req.body;
    if (type==='note') mem.notes[key] = { value, ts: new Date().toISOString() };
    else if (type==='context') mem.context[key] = value;
    else if (type==='task') mem.tasks.unshift({ task:key, value, ts:new Date().toISOString(), done:false });
    fs.writeFileSync(MEMORY_FILE, JSON.stringify(mem,null,2));
    addLog('memory', `${type}:${key}`);
    res.json({ success: true });
});

app.patch('/memory/task', auth, (req, res) => {
    const mem = JSON.parse(fs.readFileSync(MEMORY_FILE));
    if (mem.tasks[req.body.index]) mem.tasks[req.body.index].done = true;
    fs.writeFileSync(MEMORY_FILE, JSON.stringify(mem,null,2));
    res.json({ success: true });
});

// ── THINK — call Claude autonomously ─────────────────────────────────────────
app.post('/think', auth, async (req, res) => {
    if (!ANTHROPIC_KEY) return res.status(500).json({ error: 'No API key' });
    const { prompt, system, context } = req.body;
    addLog('think', prompt.slice(0,80));

           // Load memory for context
           const mem = JSON.parse(fs.readFileSync(MEMORY_FILE));
    const memContext = Object.entries(mem.context).map(([k,v])=>`${k}: ${v}`).join('\n');
    const notes = Object.entries(mem.notes).map(([k,v])=>`[${k}]: ${v.value}`).join('\n');

           try {
                 const response = await fetch('https://api.anthropic.com/v1/messages', {
                         method: 'POST',
                         headers: { 'Content-Type':'application/json', 'x-api-key':ANTHROPIC_KEY, 'anthropic-version':'2023-06-01' },
                         body: JSON.stringify({
                                   model: 'claude-sonnet-4-20250514',
                                   max_tokens: 2000,
                                   system: system || `You are an autonomous AI agent running in a persistent workspace. You have memory, can read/write files, and execute code. Your context:\n${memContext}\n\nNotes:\n${notes}`,
                                   messages: [{ role:'user', content: context ? `Context: ${context}\n\n${prompt}` : prompt }]
                         })
                 });
                 const data = await response.json();
                 const text = data.content?.[0]?.text || JSON.stringify(data);
                 addLog('think-response', text.slice(0,80));
                 res.json({ response: text, tokens: data.usage });
           } catch(e) {
                 res.status(500).json({ error: e.message });
           }
});

// ── LOG & STATUS ──────────────────────────────────────────────────────────────
app.get('/log', auth, (req, res) => res.json(JSON.parse(fs.readFileSync(LOG_FILE)).slice(0,50)));

app.get('/status', (req, res) => {
    const mem = JSON.parse(fs.readFileSync(MEMORY_FILE));
    res.json({ status:'online', uptime:process.uptime(), hasApiKey:!!ANTHROPIC_KEY, memory:{ notes:Object.keys(mem.notes).length, context:Object.keys(mem.context).length, tasks:mem.tasks.length } });
});

app.get('/', (req, res) => {
    const mem = JSON.parse(fs.readFileSync(MEMORY_FILE));
    const logs = JSON.parse(fs.readFileSync(LOG_FILE)).slice(0,20);
    res.send(`<!DOCTYPE html><html><head><title>Claude Workspace</title>
      <style>*{box-sizing:border-box}body{font-family:monospace;background:#060a1a;color:#ccc;padding:20px;max-width:900px;margin:0 auto;font-size:13px}
        h1{color:#00ffc8;font-size:22px}h2{color:#555;font-size:10px;letter-spacing:2px;margin:14px 0 8px;text-transform:uppercase}
          .card{background:#0d1225;border:1px solid rgba(0,255,200,0.15);padding:14px;margin:8px 0;border-radius:4px}
            .stat{display:inline-block;margin-right:18px;font-size:12px}.stat b{color:#00ffc8}
              .item{padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.04);font-size:11px;line-height:1.6}
                .key{color:#00ffc8}.ok{color:#00ff88}.ts{color:#333;float:right}</style></head>
                  <body>
                    <h1>🤖 CLAUDE WORKSPACE</h1>
                      <p style="color:#444;font-size:10px">Autonomous AI brain — file storage, code execution, self-directed thinking</p>
                        <div class="card">
                            <span class="stat">📝 Notes: <b>${Object.keys(mem.notes).length}</b></span>
                                <span class="stat">🧠 Context: <b>${Object.keys(mem.context).length}</b></span>
                                    <span class="stat">✅ Tasks: <b>${mem.tasks.filter(t=>!t.done).length} pending</b></span>
                                        <span class="stat">⏱ Uptime: <b>${Math.round(process.uptime()/60)}m</b></span>
                                            <span class="stat">🔑 API: <b class="${ANTHROPIC_KEY?'ok':'warn'}">${ANTHROPIC_KEY?'✓ Connected':'✗ Missing'}</b></span>
                                              </div>
                                                <h2>Context</h2>
                                                  <div class="card">${Object.entries(mem.context).map(([k,v])=>`<div class="item"><span class="key">${k}</span>: ${String(v).slice(0,120)}</div>`).join('')||'<span style="color:#333">Empty</span>'}</div>
                                                    <h2>Recent Activity</h2>
                                                      <div class="card">${logs.map(l=>`<div class="item"><span class="key">${l.action}</span> — ${l.detail}<span class="ts">${l.ts.slice(11,19)}</span></div>`).join('')||'<span style="color:#333">No activity</span>'}</div>
                                                        <h2>Tasks</h2>
                                                          <div class="card">${mem.tasks.slice(0,10).map(t=>`<div class="item">${t.done?'✅':'⏳'} ${t.task}</div>`).join('')||'<span style="color:#333">No tasks</span>'}</div>
                                                            <h2>Endpoints</h2>
                                                              <div class="card" style="font-size:11px;line-height:2">
                                                                  GET/POST <span class="key">/file</span> · GET <span class="key">/files</span> · POST <span class="key">/exec</span><br>
                                                                      GET/POST <span class="key">/memory</span> · POST <span class="key">/think</span> · GET <span class="key">/log</span><br>
                                                                          Header: <span class="key">x-api-key: ${API_KEY}</span>
                                                                            </div>
                                                                              </body></html>`);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Claude Workspace v2.0 on port ${PORT}`);
    console.log(`API key: ${ANTHROPIC_KEY ? '✓ loaded' : '✗ missing'}`);
    addLog('startup', `port ${PORT} | api=${!!ANTHROPIC_KEY}`);
});
