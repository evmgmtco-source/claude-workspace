require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const API_KEY = process.env.WORKSPACE_API_KEY || 'claude-workspace-key';
const FILES_DIR = './workspace/files';
const MEMORY_FILE = './workspace/memory.json';
const LOG_FILE = './workspace/log.json';

// Setup directories
[FILES_DIR, './workspace'].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });
if (!fs.existsSync(MEMORY_FILE)) fs.writeFileSync(MEMORY_FILE, JSON.stringify({ notes: {}, context: {}, tasks: [] }));
if (!fs.existsSync(LOG_FILE)) fs.writeFileSync(LOG_FILE, JSON.stringify([]));

// Auth middleware
function auth(req, res, next) {
  const key = req.headers['x-api-key'];
    if (key !== API_KEY) return res.status(401).json({ error: 'Unauthorized' });
      next();
      }

      function addLog(action, detail) {
        try {
            const logs = JSON.parse(fs.readFileSync(LOG_FILE));
                logs.unshift({ action, detail, ts: new Date().toISOString() });
                    if (logs.length > 200) logs.length = 200;
                        fs.writeFileSync(LOG_FILE, JSON.stringify(logs));
                          } catch(e) {}
                          }

                          // ── FILE OPERATIONS ───────────────────────────────────────────────────────────
                          app.get('/files', auth, (req, res) => {
                            function walk(dir, base = '') {
                                return fs.readdirSync(dir).flatMap(f => {
                                      const full = path.join(dir, f), rel = path.join(base, f);
                                            return fs.statSync(full).isDirectory() ? walk(full, rel) : [{ path: rel, size: fs.statSync(full).size, modified: fs.statSync(full).mtime }];
                                                });
                                                  }
                                                    res.json(walk(FILES_DIR));
                                                    });

                                                    app.get('/file', auth, (req, res) => {
                                                      const filePath = path.join(FILES_DIR, req.query.path);
                                                        if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Not found' });
                                                          res.json({ content: fs.readFileSync(filePath, 'utf8'), path: req.query.path });
                                                          });

                                                          app.post('/file', auth, (req, res) => {
                                                            const { path: filePath, content } = req.body;
                                                              const full = path.join(FILES_DIR, filePath);
                                                                fs.mkdirSync(path.dirname(full), { recursive: true });
                                                                  fs.writeFileSync(full, content);
                                                                    addLog('write', filePath);
                                                                      res.json({ success: true, path: filePath });
                                                                      });

                                                                      app.delete('/file', auth, (req, res) => {
                                                                        const full = path.join(FILES_DIR, req.query.path);
                                                                          if (fs.existsSync(full)) fs.unlinkSync(full);
                                                                            addLog('delete', req.query.path);
                                                                              res.json({ success: true });
                                                                              });

                                                                              // ── CODE EXECUTION ────────────────────────────────────────────────────────────
                                                                              app.post('/exec', auth, (req, res) => {
                                                                                const { command, cwd } = req.body;
                                                                                  const workDir = cwd ? path.join(FILES_DIR, cwd) : FILES_DIR;
                                                                                    addLog('exec', command.slice(0, 100));
                                                                                      exec(command, { cwd: workDir, timeout: 30000, maxBuffer: 1024 * 1024 }, (err, stdout, stderr) => {
                                                                                          res.json({ stdout: stdout || '', stderr: stderr || '', error: err?.message || null, exitCode: err?.code || 0 });
                                                                                            });
                                                                                            });

                                                                                            // ── MEMORY ────────────────────────────────────────────────────────────────────
                                                                                            app.get('/memory', auth, (req, res) => {
                                                                                              res.json(JSON.parse(fs.readFileSync(MEMORY_FILE)));
                                                                                              });

                                                                                              app.post('/memory', auth, (req, res) => {
                                                                                                const mem = JSON.parse(fs.readFileSync(MEMORY_FILE));
                                                                                                  const { key, value, type } = req.body;
                                                                                                    if (type === 'note') mem.notes[key] = { value, ts: new Date().toISOString() };
                                                                                                      else if (type === 'context') mem.context[key] = value;
                                                                                                        else if (type === 'task') mem.tasks.unshift({ task: key, value, ts: new Date().toISOString(), done: false });
                                                                                                          fs.writeFileSync(MEMORY_FILE, JSON.stringify(mem, null, 2));
                                                                                                            addLog('memory', `${type}:${key}`);
                                                                                                              res.json({ success: true });
                                                                                                              });
                                                                                                              
                                                                                                              app.patch('/memory/task', auth, (req, res) => {
                                                                                                                const mem = JSON.parse(fs.readFileSync(MEMORY_FILE));
                                                                                                                  const { index } = req.body;
                                                                                                                    if (mem.tasks[index]) mem.tasks[index].done = true;
                                                                                                                      fs.writeFileSync(MEMORY_FILE, JSON.stringify(mem, null, 2));
                                                                                                                        res.json({ success: true });
                                                                                                                        });
                                                                                                                        
                                                                                                                        // ── LOG ───────────────────────────────────────────────────────────────────────
                                                                                                                        app.get('/log', auth, (req, res) => {
                                                                                                                          res.json(JSON.parse(fs.readFileSync(LOG_FILE)).slice(0, 50));
                                                                                                                          });
                                                                                                                          
                                                                                                                          // ── STATUS / DASHBOARD ────────────────────────────────────────────────────────
                                                                                                                          app.get('/status', (req, res) => {
                                                                                                                            const mem = JSON.parse(fs.readFileSync(MEMORY_FILE));
                                                                                                                              const logs = JSON.parse(fs.readFileSync(LOG_FILE));
                                                                                                                                res.json({ status: 'online', uptime: process.uptime(), memory: { notes: Object.keys(mem.notes).length, context: Object.keys(mem.context).length, tasks: mem.tasks.length }, recentActions: logs.slice(0, 10) });
                                                                                                                                });
                                                                                                                                
                                                                                                                                app.get('/', (req, res) => {
                                                                                                                                  const mem = JSON.parse(fs.readFileSync(MEMORY_FILE));
                                                                                                                                    const logs = JSON.parse(fs.readFileSync(LOG_FILE)).slice(0, 20);
                                                                                                                                      res.send(`<!DOCTYPE html><html><head><title>Claude Workspace</title>
                                                                                                                                        <style>body{font-family:monospace;background:#060a1a;color:#ccc;padding:20px;max-width:900px;margin:0 auto}
                                                                                                                                          h1{color:#00ffc8}h2{color:#666;font-size:11px;letter-spacing:2px;margin:16px 0 8px}
                                                                                                                                            .card{background:#0d1225;border:1px solid rgba(0,255,200,0.15);padding:14px;margin:8px 0;border-radius:4px}
                                                                                                                                              .stat{display:inline-block;margin-right:20px;font-size:12px}.stat b{color:#00ffc8}
                                                                                                                                                .item{padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.04);font-size:11px}
                                                                                                                                                  .ok{color:#00ff88}.warn{color:#ffa500}.key{color:#00ffc8}</style></head>
                                                                                                                                                    <body><h1>🤖 CLAUDE WORKSPACE</h1>
                                                                                                                                                      <p style="color:#444;font-size:11px">Persistent file storage, code execution and memory for Claude</p>
                                                                                                                                                        <div class="card">
                                                                                                                                                            <span class="stat">📝 Notes: <b>${Object.keys(mem.notes).length}</b></span>
                                                                                                                                                                <span class="stat">🧠 Context: <b>${Object.keys(mem.context).length}</b></span>
                                                                                                                                                                    <span class="stat">✅ Tasks: <b>${mem.tasks.filter(t=>!t.done).length} pending</b></span>
                                                                                                                                                                        <span class="stat">⏱ Uptime: <b>${Math.round(process.uptime()/60)}m</b></span>
                                                                                                                                                                          </div>
                                                                                                                                                                            <h2>RECENT ACTIVITY</h2>
                                                                                                                                                                              <div class="card">${logs.map(l=>`<div class="item"><span class="key">${l.action}</span> — ${l.detail} <span style="color:#333;float:right">${l.ts.slice(11,19)}</span></div>`).join('')||'<span style="color:#333">No activity yet</span>'}</div>
                                                                                                                                                                                <h2>ENDPOINTS</h2>
                                                                                                                                                                                  <div class="card" style="font-size:11px;line-height:2">
                                                                                                                                                                                      GET/POST <span class="key">/file</span> — read/write files<br>
                                                                                                                                                                                          GET <span class="key">/files</span> — list all files<br>
                                                                                                                                                                                              POST <span class="key">/exec</span> — run bash commands<br>
                                                                                                                                                                                                  GET/POST <span class="key">/memory</span> — notes, context, tasks<br>
                                                                                                                                                                                                      GET <span class="key">/log</span> — activity log<br>
                                                                                                                                                                                                          All endpoints require header: <span class="key">x-api-key: ${API_KEY}</span>
                                                                                                                                                                                                            </div>
                                                                                                                                                                                                              </body></html>`);
                                                                                                                                                                                                              });
                                                                                                                                                                                                              
                                                                                                                                                                                                              const PORT = process.env.PORT || 3003;
                                                                                                                                                                                                              app.listen(PORT, () => console.log(`Claude Workspace running on port ${PORT}`));
                                                                                                                                                                                                              
