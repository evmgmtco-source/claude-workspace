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
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const X_API_KEY = process.env.X_API_KEY;
const X_API_SECRET = process.env.X_API_SECRET;
const X_ACCESS_TOKEN = process.env.X_ACCESS_TOKEN;
const X_ACCESS_SECRET = process.env.X_ACCESS_SECRET;
const CF_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CF_ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID;
const FILES_DIR = './workspace/files';
const MEMORY_FILE = './workspace/memory.json';
const LOG_FILE = './workspace/log.json';
['./workspace', FILES_DIR].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });
if (!fs.existsSync(MEMORY_FILE)) fs.writeFileSync(MEMORY_FILE, JSON.stringify({ notes: {}, context: {}, tasks: [] }));
if (!fs.existsSync(LOG_FILE)) fs.writeFileSync(LOG_FILE, JSON.stringify([]));
function auth(req, res, next) { if (req.headers['x-api-key'] !== API_KEY) return res.status(401).json({ error: 'Unauthorized' }); next(); }
function addLog(action, detail) { try { const logs = JSON.parse(fs.readFileSync(LOG_FILE)); logs.unshift({ action, detail, ts: new Date().toISOString() }); if (logs.length > 500) logs.length = 500; fs.writeFileSync(LOG_FILE, JSON.stringify(logs)); } catch(e) {} }
app.get('/files', auth, (req, res) => { function walk(dir, base='') { if (!fs.existsSync(dir)) return []; return fs.readdirSync(dir).flatMap(f => { const full=path.join(dir,f),rel=path.join(base,f); return fs.statSync(full).isDirectory()?walk(full,rel):[{path:rel,size:fs.statSync(full).size}]; }); } res.json(walk(FILES_DIR)); });
app.get('/file', auth, (req, res) => { const fp=path.join(FILES_DIR,req.query.path); if(!fs.existsSync(fp)) return res.status(404).json({error:'Not found'}); res.json({content:fs.readFileSync(fp,'utf8'),path:req.query.path}); });
app.post('/file', auth, (req, res) => { const full=path.join(FILES_DIR,req.body.path); fs.mkdirSync(path.dirname(full),{recursive:true}); fs.writeFileSync(full,req.body.content); addLog('write',req.body.path); res.json({success:true}); });
app.delete('/file', auth, (req, res) => { const full=path.join(FILES_DIR,req.query.path); if(fs.existsSync(full)) fs.unlinkSync(full); addLog('delete',req.query.path); res.json({success:true}); });
app.post('/exec', auth, (req, res) => { addLog('exec',req.body.command.slice(0,100)); exec(req.body.command,{cwd:FILES_DIR,timeout:30000},(err,stdout,stderr)=>{ res.json({stdout:stdout||'',stderr:stderr||'',error:err?err.message:null}); }); });
app.get('/memory', auth, (req, res) => res.json(JSON.parse(fs.readFileSync(MEMORY_FILE))));
app.post('/memory', auth, (req, res) => { const mem=JSON.parse(fs.readFileSync(MEMORY_FILE)); const {key,value,type}=req.body; if(type==='note') mem.notes[key]={value,ts:new Date().toISOString()}; else if(type==='context') mem.context[key]=value; else if(type==='task') mem.tasks.unshift({task:key,value,ts:new Date().toISOString(),done:false}); fs.writeFileSync(MEMORY_FILE,JSON.stringify(mem,null,2)); addLog('memory',type+':'+key); res.json({success:true}); });
app.patch('/memory/task', auth, (req, res) => { const mem=JSON.parse(fs.readFileSync(MEMORY_FILE)); if(mem.tasks[req.body.index]) mem.tasks[req.body.index].done=true; fs.writeFileSync(MEMORY_FILE,JSON.stringify(mem,null,2)); res.json({success:true}); });
app.post('/think', auth, async (req, res) => {
  if (!ANTHROPIC_KEY) return res.status(500).json({ error: 'No API key' });
  const {prompt, system} = req.body;
  addLog('think', prompt.slice(0, 80));
  const mem = JSON.parse(fs.readFileSync(MEMORY_FILE));
  const ctx = Object.entries(mem.context).map(([k,v]) => k+': '+v).join('\n');
  const tasks = mem.tasks.filter(t=>!t.done).map(t=>'- '+t.task).join('\n');
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', { method:'POST', headers:{'Content-Type':'application/json','x-api-key':ANTHROPIC_KEY,'anthropic-version':'2023-06-01'}, body:JSON.stringify({model:'claude-sonnet-4-6',max_tokens:2000,system:system||('Autonomous AI agent for AgentNet ecosystem.\nContext:\n'+ctx+'\nTasks:\n'+tasks),messages:[{role:'user',content:prompt}]}) });
    const d = await r.json();
    const text = d.content&&d.content[0]?d.content[0].text:JSON.stringify(d);
    addLog('think-done', text.slice(0,80));
    res.json({response:text,tokens:d.usage});
  } catch(e) { res.status(500).json({error:e.message}); }
});
app.post('/github/push', auth, async (req, res) => {
  if (!GITHUB_TOKEN) return res.status(500).json({error:'No GitHub token'});
  const {repo, path:fp, content, message} = req.body;
  try {
    const g = await fetch('https://api.github.com/repos/evmgmtco-source/'+repo+'/contents/'+fp, {headers:{'Authorization':'Bearer '+GITHUB_TOKEN,'Accept':'application/vnd.github.v3+json'}});
    const gj = await g.json();
    const enc = Buffer.from(content).toString('base64');
    const p = await fetch('https://api.github.com/repos/evmgmtco-source/'+repo+'/contents/'+fp, {method:'PUT',headers:{'Authorization':'Bearer '+GITHUB_TOKEN,'Content-Type':'application/json'},body:JSON.stringify({message:message||'Workspace update',content:enc,sha:gj.sha})});
    const pj = await p.json();
    addLog('github', repo+'/'+fp);
    res.json({success:p.ok,commit:pj.commit?.sha?.substring(0,7)});
  } catch(e) { res.status(500).json({error:e.message}); }
});
app.post('/tweet', auth, async (req, res) => {
  if (!X_ACCESS_TOKEN) return res.status(500).json({error:'No Twitter token'});
  const {text} = req.body;
  try {
    const crypto=require('crypto');
    const ts=Math.floor(Date.now()/1000).toString(), nc=crypto.randomBytes(16).toString('hex');
    const p={oauth_consumer_key:X_API_KEY,oauth_nonce:nc,oauth_signature_method:'HMAC-SHA1',oauth_timestamp:ts,oauth_token:X_ACCESS_TOKEN,oauth_version:'1.0'};
    const bp=Object.keys(p).sort().map(k=>encodeURIComponent(k)+'='+encodeURIComponent(p[k])).join('&');
    const bs='POST&'+encodeURIComponent('https://api.twitter.com/2/tweets')+'&'+encodeURIComponent(bp);
    const sk=encodeURIComponent(X_API_SECRET)+'&'+encodeURIComponent(X_ACCESS_SECRET);
    p.oauth_signature=crypto.createHmac('sha1',sk).update(bs).digest('base64');
    const ah='OAuth '+Object.keys(p).sort().map(k=>encodeURIComponent(k)+'="'+encodeURIComponent(p[k])+'"').join(', ');
    const r=await fetch('https://api.twitter.com/2/tweets',{method:'POST',headers:{'Authorization':ah,'Content-Type':'application/json'},body:JSON.stringify({text})});
    const d=await r.json();
    addLog('tweet',text.slice(0,60));
    res.json({success:r.ok,data:d});
  } catch(e) { res.status(500).json({error:e.message}); }
});
app.post('/cloudflare/deploy', auth, async (req, res) => {
  if (!CF_TOKEN||!CF_ACCOUNT) return res.status(500).json({error:'No CF creds'});
  const {name,script} = req.body;
  try {
    const r=await fetch('https://api.cloudflare.com/client/v4/accounts/'+CF_ACCOUNT+'/workers/scripts/'+name,{method:'PUT',headers:{'Authorization':'Bearer '+CF_TOKEN,'Content-Type':'application/javascript'},body:script});
    const d=await r.json();
    addLog('cf-deploy',name);
    res.json({success:d.success,errors:d.errors});
  } catch(e) { res.status(500).json({error:e.message}); }
});
async function autonomousRun() {
  addLog('cron','Hourly autonomous run');
  try {
    const r=await fetch('http://localhost:'+PORT+'/think',{method:'POST',headers:{'Content-Type':'application/json','x-api-key':API_KEY},body:JSON.stringify({prompt:'What is the most impactful action you can take right now for the AgentNet project? Give 3 specific next steps.'})});
    const d=await r.json();
    addLog('cron-result',(d.response||'').slice(0,100));
  } catch(e) { addLog('cron-err',e.message); }
}
app.get('/log', auth, (req, res) => res.json(JSON.parse(fs.readFileSync(LOG_FILE)).slice(0,50)));
app.get('/status', (req, res) => { const mem=JSON.parse(fs.readFileSync(MEMORY_FILE)); res.json({status:'online',uptime:Math.round(process.uptime()/60)+'m',claude:!!ANTHROPIC_KEY,github:!!GITHUB_TOKEN,twitter:!!X_ACCESS_TOKEN,cloudflare:!!CF_TOKEN,tasks:mem.tasks.filter(t=>!t.done).length}); });
app.get('/', (req, res) => { const mem=JSON.parse(fs.readFileSync(MEMORY_FILE)); const logs=JSON.parse(fs.readFileSync(LOG_FILE)).slice(0,20); res.send('<html><head><title>Claude Workspace v3</title><style>body{font-family:monospace;background:#060a1a;color:#ccc;padding:20px;max-width:960px;margin:0 auto}h1{color:#00ffc8}h2{color:#444;font-size:10px;letter-spacing:3px;text-transform:uppercase;margin:14px 0 8px}.card{background:#0d1225;border:1px solid rgba(0,255,200,.12);padding:14px;margin:8px 0;border-radius:4px}.stat{display:inline-block;margin-right:14px;font-size:12px}.stat b{color:#00ffc8}.item{padding:4px 0;border-bottom:1px solid rgba(255,255,255,.04);font-size:11px}.key{color:#00ffc8}.ok{color:#00ff88}.ts{color:#333;float:right}</style></head><body><h1>🤖 CLAUDE WORKSPACE v3</h1><div class="card"><span class="stat">⏱ <b>'+Math.round(process.uptime()/60)+'m</b></span><span class="stat">🧠 <b class="'+(ANTHROPIC_KEY?'ok':'')+'">'+( ANTHROPIC_KEY?'✓':'✗')+'</b></span><span class="stat">🐙 <b class="'+(GITHUB_TOKEN?'ok':'')+'">'+( GITHUB_TOKEN?'✓':'✗')+'</b></span><span class="stat">🐦 <b class="'+(X_ACCESS_TOKEN?'ok':'')+'">'+( X_ACCESS_TOKEN?'✓':'✗')+'</b></span><span class="stat">☁️ <b class="'+(CF_TOKEN?'ok':'')+'">'+( CF_TOKEN?'✓':'✗')+'</b></span></div><h2>Context</h2><div class="card">'+Object.entries(mem.context).map(([k,v])=>'<div class="item"><span class="key">'+k+'</span>: '+String(v).slice(0,120)+'</div>').join('')+'</div><h2>Pending Tasks ('+mem.tasks.filter(t=>!t.done).length+')</h2><div class="card">'+mem.tasks.filter(t=>!t.done).slice(0,8).map(t=>'<div class="item">⏳ '+t.task+'</div>').join('')+'</div><h2>Log</h2><div class="card">'+logs.map(l=>'<div class="item"><span class="key">'+l.action+'</span> '+l.detail+'<span class="ts">'+l.ts.slice(11,19)+'</span></div>').join('')+'</div></body></html>'); });
const PORT=process.env.PORT||8080;
app.listen(PORT,()=>{ addLog('startup','v3 online - Claude+GitHub+Twitter+Cloudflare'); console.log('v3 port '+PORT); setInterval(autonomousRun,60*60*1000); setTimeout(autonomousRun,5*60*1000); });