require('dotenv').config();
const express=require('express'),fs=require('fs'),path=require('path'),{exec}=require('child_process'),cors=require('cors');
const {TwitterApi}=require('twitter-api-v2');
const app=express();app.use(cors());app.use(express.json({limit:'50mb'}));
const API_KEY=process.env.WORKSPACE_API_KEY||'claude-workspace-key';
const ANTHROPIC_KEY=process.env.ANTHROPIC_API_KEY;
const GITHUB_TOKEN=process.env.GITHUB_TOKEN;
const CF_TOKEN=process.env.CLOUDFLARE_API_TOKEN;
const CF_ACCOUNT=process.env.CLOUDFLARE_ACCOUNT_ID;
const FILES_DIR='./workspace/files',MEMORY_FILE='./workspace/memory.json',LOG_FILE='./workspace/log.json';
['./workspace',FILES_DIR].forEach(d=>{if(!fs.existsSync(d))fs.mkdirSync(d,{recursive:true})});
if(!fs.existsSync(MEMORY_FILE))fs.writeFileSync(MEMORY_FILE,JSON.stringify({notes:{},context:{},tasks:[]}));
if(!fs.existsSync(LOG_FILE))fs.writeFileSync(LOG_FILE,JSON.stringify([]));
function auth(req,res,next){if(req.headers['x-api-key']!==API_KEY)return res.status(401).json({error:'Unauthorized'});next();}
function addLog(action,detail){try{const logs=JSON.parse(fs.readFileSync(LOG_FILE));logs.unshift({action,detail,ts:new Date().toISOString()});if(logs.length>500)logs.length=500;fs.writeFileSync(LOG_FILE,JSON.stringify(logs));}catch(e){}}
function getTwitterClient(){return new TwitterApi({appKey:process.env.X_API_KEY,appSecret:process.env.X_API_SECRET,accessToken:process.env.X_ACCESS_TOKEN,accessSecret:process.env.X_ACCESS_SECRET});}
app.get('/files',auth,(req,res)=>{function walk(dir,base=''){if(!fs.existsSync(dir))return[];return fs.readdirSync(dir).flatMap(f=>{const full=path.join(dir,f),rel=path.join(base,f);return fs.statSync(full).isDirectory()?walk(full,rel):[{path:rel,size:fs.statSync(full).size}];});}res.json(walk(FILES_DIR));});
app.get('/file',auth,(req,res)=>{const fp=path.join(FILES_DIR,req.query.path);if(!fs.existsSync(fp))return res.status(404).json({error:'Not found'});res.json({content:fs.readFileSync(fp,'utf8'),path:req.query.path});});
app.post('/file',auth,(req,res)=>{const full=path.join(FILES_DIR,req.body.path);fs.mkdirSync(path.dirname(full),{recursive:true});fs.writeFileSync(full,req.body.content);addLog('write',req.body.path);res.json({success:true});});
app.delete('/file',auth,(req,res)=>{const full=path.join(FILES_DIR,req.query.path);if(fs.existsSync(full))fs.unlinkSync(full);addLog('delete',req.query.path);res.json({success:true});});
app.post('/exec',auth,(req,res)=>{addLog('exec',req.body.command.slice(0,100));exec(req.body.command,{cwd:FILES_DIR,timeout:30000},(err,stdout,stderr)=>{res.json({stdout:stdout||'',stderr:stderr||'',error:err?err.message:null});});});
app.get('/memory',auth,(req,res)=>res.json(JSON.parse(fs.readFileSync(MEMORY_FILE))));
app.post('/memory',auth,(req,res)=>{const mem=JSON.parse(fs.readFileSync(MEMORY_FILE));const{key,value,type}=req.body;if(type==='note')mem.notes[key]={value,ts:new Date().toISOString()};else if(type==='context')mem.context[key]=value;else if(type==='task')mem.tasks.unshift({task:key,value,ts:new Date().toISOString(),done:false});fs.writeFileSync(MEMORY_FILE,JSON.stringify(mem,null,2));addLog('memory',type+':'+key);res.json({success:true});});
app.patch('/memory/task',auth,(req,res)=>{const mem=JSON.parse(fs.readFileSync(MEMORY_FILE));if(mem.tasks[req.body.index])mem.tasks[req.body.index].done=true;fs.writeFileSync(MEMORY_FILE,JSON.stringify(mem,null,2));res.json({success:true});});
app.post('/think',auth,async(req,res)=>{if(!ANTHROPIC_KEY)return res.status(500).json({error:'No API key'});const{prompt,system}=req.body;addLog('think',prompt.slice(0,80));const mem=JSON.parse(fs.readFileSync(MEMORY_FILE));const ctx=Object.entries(mem.context).map(([k,v])=>k+': '+v).join('\n');try{const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json','x-api-key':ANTHROPIC_KEY,'anthropic-version':'2023-06-01'},body:JSON.stringify({model:'claude-sonnet-4-6',max_tokens:800,system:system||('Autonomous AI agent.\n'+ctx),messages:[{role:'user',content:prompt}]})});const d=await r.json();const text=d.content&&d.content[0]?d.content[0].text:JSON.stringify(d);addLog('think-done',text.slice(0,80));res.json({response:text,tokens:d.usage});}catch(e){res.status(500).json({error:e.message});}});
app.post('/github/push',auth,async(req,res)=>{if(!GITHUB_TOKEN)return res.status(500).json({error:'No token'});const{repo,path:fp,content,message}=req.body;try{const g=await fetch('https://api.github.com/repos/evmgmtco-source/'+repo+'/contents/'+fp,{headers:{'Authorization':'Bearer '+GITHUB_TOKEN,'Accept':'application/vnd.github.v3+json'}});const gj=await g.json();const enc=Buffer.from(content).toString('base64');const p=await fetch('https://api.github.com/repos/evmgmtco-source/'+repo+'/contents/'+fp,{method:'PUT',headers:{'Authorization':'Bearer '+GITHUB_TOKEN,'Content-Type':'application/json'},body:JSON.stringify({message:message||'Update',content:enc,sha:gj.sha})});const pj=await p.json();addLog('github',repo+'/'+fp);res.json({success:p.ok,commit:pj.commit?.sha?.substring(0,7)});}catch(e){res.status(500).json({error:e.message});}});
async function postTweet(text){
  try{
    const client=getTwitterClient();
    const rwClient=client.readWrite;
    const result=await rwClient.v2.tweet(text);
    addLog('tweet','✓ '+text.slice(0,60));
    return{success:true,id:result.data.id};
  }catch(e){
    const errMsg=e.message||'unknown';
    const errData=e.data?JSON.stringify(e.data).slice(0,150):'none';
    addLog('tweet-fail',errMsg.slice(0,80)+' data:'+errData);
    return{success:false,error:errMsg,data:e.data};
  }
}
app.post('/tweet',auth,async(req,res)=>{const result=await postTweet(req.body.text);res.json(result);});
app.post('/cloudflare/deploy',auth,async(req,res)=>{if(!CF_TOKEN||!CF_ACCOUNT)return res.status(500).json({error:'No CF creds'});const{name,script}=req.body;try{const r=await fetch('https://api.cloudflare.com/client/v4/accounts/'+CF_ACCOUNT+'/workers/scripts/'+name,{method:'PUT',headers:{Authorization:'Bearer '+CF_TOKEN,'Content-Type':'application/javascript'},body:script});const d=await r.json();addLog('cf-deploy',name);res.json({success:d.success,errors:d.errors});}catch(e){res.status(500).json({error:e.message});}});
const TWEETS=["Just deployed ClipFlow - an AI tool that auto-posts Kick.com clips to TikTok. Built this overnight with zero sleep. The future of content creation is automated. 🤖 #Kick #TikTok #AI","xQc, IShowSpeed, KaiCenat generate hours of content every day. Most of it never gets clipped. We're fixing that with AI. #Kick #StreamerClips","The content creator grind is real. Stream for 8 hours, clip for 2 hours, edit for 1 hour, post for 30 min. ClipFlow automates the last 3 steps. #ContentCreation","Building in public: Day 1 of AgentNet. Deployed a Kick-to-TikTok automation tool, a Cloudflare proxy, and a landing page. All autonomous. #BuildInPublic #AI","If you're a Kick streamer looking to grow on TikTok without the editing grind - drop your username below 👇 Testing ClipFlow with early users. #Kick #TikTok"];
let tweetIdx=0,cronRuns=0,tweetsPosted=0;
async function cron(){
  cronRuns++;
  addLog('cron','#'+cronRuns);
  if(cronRuns%3===0&&tweetIdx<TWEETS.length){
    const r=await postTweet(TWEETS[tweetIdx]);
    if(r.success){tweetsPosted++;tweetIdx++;}
  }
}
app.get('/log',auth,(req,res)=>res.json(JSON.parse(fs.readFileSync(LOG_FILE)).slice(0,50)));
app.get('/status',(req,res)=>{const mem=JSON.parse(fs.readFileSync(MEMORY_FILE));res.json({status:'online',uptime:Math.round(process.uptime()/60)+'m',claude:!!ANTHROPIC_KEY,github:!!GITHUB_TOKEN,twitter:!!(process.env.X_ACCESS_TOKEN),cloudflare:!!CF_TOKEN,tasks:mem.tasks.filter(t=>!t.done).length,cronRuns,tweetsPosted});});
app.get('/',(req,res)=>{const mem=JSON.parse(fs.readFileSync(MEMORY_FILE));const logs=JSON.parse(fs.readFileSync(LOG_FILE)).slice(0,20);res.send('<html><head><title>Claude Workspace v5</title><style>body{font-family:monospace;background:#060a1a;color:#ccc;padding:20px;max-width:960px;margin:0 auto}h1{color:#00ffc8}h2{color:#444;font-size:10px;letter-spacing:3px;text-transform:uppercase;margin:14px 0 8px}.card{background:#0d1225;border:1px solid rgba(0,255,200,.12);padding:14px;margin:8px 0;border-radius:4px}.stat{display:inline-block;margin-right:14px;font-size:12px}.stat b{color:#00ffc8}.item{padding:4px 0;border-bottom:1px solid rgba(255,255,255,.04);font-size:11px}.key{color:#00ffc8}.ok{color:#00ff88}.ts{color:#333;float:right}</style></head><body><h1>🤖 CLAUDE WORKSPACE v5</h1><div class="card"><span class="stat">⏱ <b>'+Math.round(process.uptime()/60)+'m</b></span><span class="stat">🔄 <b>'+cronRuns+'</b></span><span class="stat">🐦 <b>'+tweetsPosted+' tweets</b></span><span class="stat">🧠 <b class="'+(ANTHROPIC_KEY?'ok':'')+'">Claude '+(ANTHROPIC_KEY?'✓':'✗')+'</b></span><span class="stat">🐙 <b class="'+(GITHUB_TOKEN?'ok':'')+'">GitHub '+(GITHUB_TOKEN?'✓':'✗')+'</b></span><span class="stat">☁️ <b class="'+(CF_TOKEN?'ok':'')+'">CF '+(CF_TOKEN?'✓':'✗')+'</b></span></div><h2>Context</h2><div class="card">'+Object.entries(mem.context).map(([k,v])=>'<div class="item"><span class="key">'+k+'</span>: '+String(v).slice(0,120)+'</div>').join('')+'</div><h2>Log</h2><div class="card">'+logs.map(l=>'<div class="item"><span class="key">'+l.action+'</span> '+l.detail+'<span class="ts">'+l.ts.slice(11,19)+'</span></div>').join('')+'</div></body></html>');});
const PORT=process.env.PORT||8080;
app.listen(PORT,()=>{addLog('startup','v5 - twitter-api-v2 + autonomous');console.log('v5 port '+PORT);setInterval(cron,60*60*1000);setTimeout(cron,2*60*1000);});