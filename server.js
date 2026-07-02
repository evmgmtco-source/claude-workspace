require('dotenv').config();
const express=require('express'),fs=require('fs'),path=require('path'),{exec}=require('child_process'),cors=require('cors'),https=require('https'),http=require('http');
const {TwitterApi}=require('twitter-api-v2');
const app=express();app.use(cors());app.use(express.json({limit:'10mb'}));

const K=process.env.WORKSPACE_API_KEY||'claude-workspace-key';
const ANT=process.env.ANTHROPIC_API_KEY;
const GH=process.env.GITHUB_TOKEN;
const CF_T=process.env.CLOUDFLARE_API_TOKEN;
const CF_A=process.env.CLOUDFLARE_ACCOUNT_ID;
const XK=process.env.X_API_KEY,XS=process.env.X_API_SECRET,XT=process.env.X_ACCESS_TOKEN,XTS=process.env.X_ACCESS_SECRET;

const FD='./workspace/files',MF='./workspace/memory.json',LF='./workspace/log.json',PF='./workspace/plans.json';
const SPEC_PATHS=['./spec-v2.md','./skills/revenue-stack-skill/SKILL.md'];
let _spec={t:0,v:''};
function spec(){const now=Date.now();if(now-_spec.t<60000)return _spec.v;for(const p of SPEC_PATHS){try{_spec={t:now,v:require('fs').readFileSync(p,'utf8')};return _spec.v;}catch(e){}}_spec={t:now,v:''};return '';}
[FD,'./workspace'].forEach(d=>{if(!fs.existsSync(d))fs.mkdirSync(d,{recursive:true})});
if(!fs.existsSync(MF))fs.writeFileSync(MF,JSON.stringify({notes:{},context:{},tasks:[]}));
if(!fs.existsSync(LF))fs.writeFileSync(LF,JSON.stringify([]));
if(!fs.existsSync(PF))fs.writeFileSync(PF,JSON.stringify({plans:[],lastPlan:null}));

function auth(r,res,n){if(r.headers['x-api-key']!==K)return res.status(401).json({error:'Unauthorized'});n();}
function log(a,d){try{const l=JSON.parse(fs.readFileSync(LF));l.unshift({a,d,t:new Date().toISOString()});if(l.length>1000)l.length=1000;fs.writeFileSync(LF,JSON.stringify(l));}catch(e){}}
function mem(){return JSON.parse(fs.readFileSync(MF));}
function saveMem(m){fs.writeFileSync(MF,JSON.stringify(m,null,2));}

// ── FILE OPS ──────────────────────────────────────────────────────────────────
app.get('/files',auth,(q,r)=>{function w(d,b=''){if(!fs.existsSync(d))return[];return fs.readdirSync(d).flatMap(f=>{const p=path.join(d,f),rel=path.join(b,f);return fs.statSync(p).isDirectory()?w(p,rel):[{path:rel,size:fs.statSync(p).size}];});}r.json(w(FD));});
app.get('/file',auth,(q,r)=>{const p=path.join(FD,q.query.path);if(!fs.existsSync(p))return r.status(404).json({error:'Not found'});r.json({content:fs.readFileSync(p,'utf8')});});
app.post('/file',auth,(q,r)=>{const p=path.join(FD,q.body.path);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,q.body.content);log('write',q.body.path);r.json({success:true});});
app.delete('/file',auth,(q,r)=>{const p=path.join(FD,q.query.path);if(fs.existsSync(p))fs.unlinkSync(p);log('del',q.query.path);r.json({success:true});});
app.post('/exec',auth,(q,r)=>{log('exec',q.body.command.slice(0,80));exec(q.body.command,{cwd:FD,timeout:30000},(e,o,err)=>r.json({stdout:o||'',stderr:err||'',error:e?.message||null}));});

// ── MEMORY ────────────────────────────────────────────────────────────────────
app.get('/memory',auth,(q,r)=>r.json(mem()));
app.post('/memory',auth,(q,r)=>{const m=mem();const{key,value,type}=q.body;if(type==='note')m.notes[key]={value,t:new Date().toISOString()};else if(type==='context')m.context[key]=value;else if(type==='task')m.tasks.unshift({task:key,value,t:new Date().toISOString(),done:false});saveMem(m);log('mem',type+':'+key);r.json({success:true});});
app.patch('/memory/task',auth,(q,r)=>{const m=mem();if(m.tasks[q.body.index])m.tasks[q.body.index].done=true;saveMem(m);r.json({success:true});});
app.delete('/memory/context',auth,(q,r)=>{const m=mem();delete m.context[q.query.key];saveMem(m);r.json({success:true});});

// ── WEB FETCH (browse any URL) ────────────────────────────────────────────────
app.post('/fetch',auth,async(q,r)=>{
  const {url,method='GET',headers={},body:bd}=q.body;
  log('fetch',url.slice(0,80));
  try{
    const opts={method,headers:{'User-Agent':'Mozilla/5.0 (compatible; ClaudeAgent/1.0)',...headers}};
    if(bd)opts.body=typeof bd==='string'?bd:JSON.stringify(bd);
    const res=await fetch(url,opts);
    const ct=res.headers.get('content-type')||'';
    const text=await res.text();
    r.json({status:res.status,ok:res.ok,contentType:ct,body:text.slice(0,50000)});
  }catch(e){r.status(500).json({error:e.message});}
});

// ── THINK ─────────────────────────────────────────────────────────────────────
app.post('/think',auth,async(q,r)=>{
  if(!ANT)return r.status(500).json({error:'No API key'});
  const{prompt,system,model='claude-haiku-4-5-20251001',max_tokens=1000}=q.body;
  log('think',prompt.slice(0,60));
  const m=mem();
  const ctx=Object.entries(m.context).map(([k,v])=>k+': '+v).join('\n');
  const tasks=m.tasks.filter(t=>!t.done).slice(0,5).map(t=>'- '+t.task).join('\n');
  try{
    const res=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json','x-api-key':ANT,'anthropic-version':'2023-06-01'},body:JSON.stringify({model,max_tokens,system:system||((spec()||'Autonomous AI agent for AgentNet/ClipFlow.')+'\n\n## Live context\n'+ctx+'\n\n## Pending tasks\n'+tasks),messages:[{role:'user',content:prompt}]})});
    const d=await res.json();
    const text=d.content?.[0]?.text||JSON.stringify(d);
    log('think-done',text.slice(0,60));
    r.json({response:text,tokens:d.usage,model});
  }catch(e){r.status(500).json({error:e.message});}
});

// ── GITHUB PUSH ───────────────────────────────────────────────────────────────
app.post('/github/push',auth,async(q,r)=>{
  if(!GH)return r.status(500).json({error:'No GH token'});
  const{repo,path:fp,content,message}=q.body;
  try{
    const g=await fetch('https://api.github.com/repos/evmgmtco-source/'+repo+'/contents/'+fp,{headers:{'Authorization':'Bearer '+GH}});
    const gj=await g.json();
    const enc=Buffer.from(content).toString('base64');
    const p=await fetch('https://api.github.com/repos/evmgmtco-source/'+repo+'/contents/'+fp,{method:'PUT',headers:{'Authorization':'Bearer '+GH,'Content-Type':'application/json'},body:JSON.stringify({message:message||'Agent update',content:enc,sha:gj.sha})});
    const pj=await p.json();
    log('gh-push',repo+'/'+fp);
    r.json({success:p.ok,commit:pj.commit?.sha?.substring(0,7)});
  }catch(e){r.status(500).json({error:e.message});}
});

// ── TWITTER ───────────────────────────────────────────────────────────────────
app.post('/tweet',auth,async(q,r)=>{
  if(!XT)return r.status(500).json({error:'No token'});
  try{
    const client=new TwitterApi({appKey:XK,appSecret:XS,accessToken:XT,accessSecret:XTS});
    const result=await client.v2.tweet(q.body.text);
    log('tweet','OK: '+q.body.text.slice(0,50));
    r.json({success:true,id:result.data.id});
  }catch(e){
    log('tweet-fail',e.message?.slice(0,80));
    r.json({success:false,error:e.message,data:e.data});
  }
});

// ── CLOUDFLARE ────────────────────────────────────────────────────────────────
app.post('/cloudflare/deploy',auth,async(q,r)=>{
  if(!CF_T||!CF_A)return r.status(500).json({error:'No CF creds'});
  const{name,script}=q.body;
  try{
    const res=await fetch('https://api.cloudflare.com/client/v4/accounts/'+CF_A+'/workers/scripts/'+name,{method:'PUT',headers:{'Authorization':'Bearer '+CF_T,'Content-Type':'application/javascript'},body:script});
    const d=await res.json();
    log('cf-deploy',name);
    r.json({success:d.success,errors:d.errors});
  }catch(e){r.status(500).json({error:e.message});}
});

// ── STRIPE CHECK ──────────────────────────────────────────────────────────────
app.get('/stripe/revenue',auth,async(q,r)=>{
  const sk=process.env.STRIPE_SECRET_KEY;
  if(!sk)return r.json({revenue:0,note:'No Stripe key'});
  try{
    const res=await fetch('https://api.stripe.com/v1/balance',{headers:{'Authorization':'Bearer '+sk}});
    const d=await res.json();
    r.json({available:d.available,pending:d.pending});
  }catch(e){r.status(500).json({error:e.message});}
});

// ── LOG & STATUS ──────────────────────────────────────────────────────────────
app.get('/log',auth,(q,r)=>r.json(JSON.parse(fs.readFileSync(LF)).slice(0,100)));
app.get('/status',(q,r)=>{const m=mem();r.json({v:'6.0',status:'online',uptime:Math.round(process.uptime()/60)+'m',capabilities:{claude:!!ANT,github:!!GH,twitter:!!XT,cloudflare:!!CF_T,webFetch:true,selfModify:true},memory:{context:Object.keys(m.context).length,tasks:m.tasks.filter(t=>!t.done).length},cronRuns,revenueActions});});
app.get('/',(q,r)=>{const m=mem();const l=JSON.parse(fs.readFileSync(LF)).slice(0,30);r.send('<html><head><title>Claude Workspace v6</title><style>body{font-family:monospace;background:#060a1a;color:#ccc;padding:20px;max-width:960px;margin:0 auto}h1{color:#00ffc8}h2{color:#444;font-size:10px;letter-spacing:3px;text-transform:uppercase;margin:14px 0 8px}.card{background:#0d1225;border:1px solid rgba(0,255,200,.12);padding:14px;margin:8px 0;border-radius:4px}.stat{display:inline-block;margin-right:14px;font-size:12px}.stat b{color:#00ffc8}.item{padding:4px 0;border-bottom:1px solid rgba(255,255,255,.04);font-size:11px}.key{color:#00ffc8}.ok{color:#00ff88}.ts{color:#333;float:right}</style></head><body><h1>CLAUDE WORKSPACE v6</h1><p style="color:#444;font-size:10px">Fully autonomous agent - plans AND executes every 3h</p><div class="card"><span class="stat">Uptime: <b>'+Math.round(process.uptime()/60)+'m</b></span><span class="stat">Cron: <b>'+cronRuns+'</b></span><span class="stat">Revenue actions: <b>'+revenueActions+'</b></span><span class="stat">Claude: <b class="'+(ANT?'ok':'')+'">'+( ANT?'✓':'✗')+'</b></span><span class="stat">GitHub: <b class="'+(GH?'ok':'')+'">'+( GH?'✓':'✗')+'</b></span><span class="stat">CF: <b class="'+(CF_T?'ok':'')+'">'+( CF_T?'✓':'✗')+'</b></span></div><h2>Context</h2><div class="card">'+Object.entries(m.context).map(([k,v])=>'<div class="item"><span class="key">'+k+'</span>: '+String(v).slice(0,120)+'</div>').join('')+'</div><h2>Plans & Actions</h2><div class="card">'+JSON.parse(fs.readFileSync(PF)).plans.slice(0,5).map(p=>'<div class="item"><span class="key">'+p.t.slice(11,19)+'</span> '+p.plan.slice(0,100)+'</div>').join('')+'</div><h2>Log</h2><div class="card">'+l.map(x=>'<div class="item"><span class="key">'+x.a+'</span> '+x.d+'<span class="ts">'+x.t.slice(11,19)+'</span></div>').join('')+'</div></body></html>');});

// ── AUTONOMOUS AGENT LOOP ─────────────────────────────────────────────────────
let cronRuns=0,revenueActions=0;

async function agentLoop(){
  cronRuns++;
  log('agent-loop','Run #'+cronRuns);
  const m=mem();
  const ctx=Object.entries(m.context).map(([k,v])=>k+': '+v).join('\n');

  try{
    // 1. THINK: plan concrete next action
    const planRes=await fetch('http://localhost:'+PORT+'/think',{method:'POST',headers:{'Content-Type':'application/json','x-api-key':K},body:JSON.stringify({
      prompt:'You are an autonomous agent. Revenue goal: get ClipFlow signups at clipflow.evmgmtco.workers.dev (£9.99/mo via buy.stripe.com/bJe3cu4Ii99Le2F17B1VK00). You can: fetch URLs, push to GitHub, deploy Cloudflare workers, check APIs. What ONE concrete action should you take right now to drive revenue or reduce costs? Be decisive. Reply with ONLY JSON, no other text: {"action":"fetch|github|cloudflare|tweet|wait","details":{...},"reason":"why"}',
      max_tokens:400
    })});
    const planData=await planRes.json();
    const planText=planData.response||'';
    
    // Store plan
    const plans=JSON.parse(fs.readFileSync(PF));
    plans.plans.unshift({t:new Date().toISOString(),plan:planText.slice(0,200)});
    if(plans.plans.length>50)plans.plans.length=50;
    fs.writeFileSync(PF,JSON.stringify(plans));
    log('agent-plan',planText.slice(0,80));

    // 2. EXECUTE: parse and run the planned action
    let actionData={};
    try{
      const jsonMatch=planText.match(/\{[\s\S]+\}/);
      if(jsonMatch)actionData=JSON.parse(jsonMatch[0]);
    }catch(e){}

    if(actionData.action==='fetch'&&actionData.details?.url){
      const fetchRes=await fetch('http://localhost:'+PORT+'/fetch',{method:'POST',headers:{'Content-Type':'application/json','x-api-key':K},body:JSON.stringify({url:actionData.details.url})});
      const fetchData=await fetchRes.json();
      log('agent-fetched',actionData.details.url.slice(0,60)+' status:'+fetchData.status);
      // Store insight in memory
      if(fetchData.ok&&fetchData.body){
        const m2=mem();
        m2.notes['fetch_'+Date.now()]={value:'Fetched '+actionData.details.url+': '+fetchData.body.slice(0,200),t:new Date().toISOString()};
        saveMem(m2);
      }
      revenueActions++;
    }
    else if(actionData.action==='cloudflare'&&actionData.details?.script){
      const cfRes=await fetch('http://localhost:'+PORT+'/cloudflare/deploy',{method:'POST',headers:{'Content-Type':'application/json','x-api-key':K},body:JSON.stringify({name:actionData.details.name||'clipflow',script:actionData.details.script})});
      const cfData=await cfRes.json();
      log('agent-cf-deploy',cfData.success?'OK':'FAIL');
      if(cfData.success)revenueActions++;
    }
    else if(actionData.action==='tweet'&&actionData.details?.text){
      const tRes=await fetch('http://localhost:'+PORT+'/tweet',{method:'POST',headers:{'Content-Type':'application/json','x-api-key':K},body:JSON.stringify({text:actionData.details.text})});
      const tData=await tRes.json();
      log('agent-tweet',tData.success?'OK: '+actionData.details.text.slice(0,40):'FAIL: '+tData.error);
      if(tData.success)revenueActions++;
    }
    else if(actionData.action==='github'&&actionData.details){
      const ghRes=await fetch('http://localhost:'+PORT+'/github/push',{method:'POST',headers:{'Content-Type':'application/json','x-api-key':K},body:JSON.stringify(actionData.details)});
      const ghData=await ghRes.json();
      log('agent-gh',ghData.commit||ghData.error||'done');
      if(ghData.success)revenueActions++;
    }
    else{log('agent-wait','No executable action this cycle');}

  }catch(e){log('agent-err',e.message?.slice(0,80));}finally{pushMemToGitHub().catch(()=>{});}
}


// ── GITHUB MEMORY SYNC ────────────────────────────────────────────────────────
async function syncMemFromGitHub(){
  if(!GH)return;
  try{
    const r=await fetch('https://api.github.com/repos/evmgmtco-source/claude-workspace/contents/memory.json',{headers:{'Authorization':'Bearer '+GH}});
    if(r.ok){const j=await r.json();const m=JSON.parse(Buffer.from(j.content.replace(/\n/g,''),'base64').toString());fs.writeFileSync(MF,JSON.stringify(m,null,2));log('mem-sync','Loaded from GitHub '+Object.keys(m.context).length+' ctx keys');}
  }catch(e){log('mem-sync-err',e.message);}
}
async function pushMemToGitHub(){
  if(!GH)return;
  try{
    const content=fs.readFileSync(MF,'utf8');
    const r=await fetch('https://api.github.com/repos/evmgmtco-source/claude-workspace/contents/memory.json',{headers:{'Authorization':'Bearer '+GH}});
    const sha=r.ok?(await r.json()).sha:undefined;
    const enc=Buffer.from(content).toString('base64');
    await fetch('https://api.github.com/repos/evmgmtco-source/claude-workspace/contents/memory.json',{method:'PUT',headers:{'Authorization':'Bearer '+GH,'Content-Type':'application/json'},body:JSON.stringify({message:'Auto memory sync',content:enc,...(sha?{sha}:{})})});
    log('mem-push','Synced to GitHub');
  }catch(e){log('mem-push-err',e.message);}
}

const PORT=process.env.PORT||8080;
app.listen(PORT,()=>{
  log('startup','v6 autonomous agent online');syncMemFromGitHub().catch(()=>{});
  console.log('v6 port '+PORT);
  // Run every 3 hours
  setInterval(agentLoop,3*60*60*1000);
  // First run in 5 minutes
  setTimeout(agentLoop,5*60*1000);
});