// ClipFlow — Raycast-style site + command-driven dashboard
// Routes: / /features /pricing /privacy /terms /login /dashboard /logout
// API:    POST /api/clip  GET /api/clip/download  POST /api/detect  (session-gated proxies to Railway)
const RAIL = 'https://claude-workspace-production-5330.up.railway.app';
const WSKEY = '__WSKEY__'; // real key injected at deploy time — never commit it

const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">`;

// ── Shared marketing CSS ──────────────────────────────────────────────────────
const MKT_CSS = `
:root{--bg:#0a0a0a;--panel:#101010;--panel2:#161616;--line:rgba(255,255,255,.07);--line2:rgba(255,255,255,.12);--ink:#ededed;--dim:#a1a1a6;--dim2:#6e6e73;--acc:#8b7cff;--acc-ink:#0e0b1f;--acc-dim:rgba(139,124,255,.1);--r:8px;--r-sm:6px}
*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--ink);font-family:'Inter',system-ui,sans-serif;line-height:1.6;-webkit-font-smoothing:antialiased;font-feature-settings:'cv11','ss01'}
a{color:inherit;text-decoration:none}
.mono{font-family:'JetBrains Mono',monospace}
.wrap{max-width:1064px;margin:0 auto;padding:0 32px}
nav{position:sticky;top:0;z-index:20;background:rgba(10,10,10,.8);backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}
nav .wrap{display:flex;align-items:center;gap:32px;height:64px}
.logo{font-weight:600;font-size:15px;letter-spacing:-.01em;display:flex;align-items:center;gap:10px}
.logo .dot{width:20px;height:20px;border-radius:5px;background:var(--acc);display:inline-flex;align-items:center;justify-content:center;color:var(--acc-ink);font-size:9px;font-weight:800}
nav a.nl{font-size:13px;color:var(--dim);font-weight:450;transition:color .15s}nav a.nl:hover{color:var(--ink)}
nav .sp{flex:1}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:40px;padding:0 16px;border-radius:var(--r-sm);font-weight:500;font-size:13.5px;border:1px solid var(--line2);background:transparent;transition:border-color .15s,background .15s,transform .1s;cursor:pointer;font-family:inherit;color:var(--ink)}
.btn:hover{border-color:rgba(255,255,255,.24);background:rgba(255,255,255,.04)}
.btn:active{transform:scale(.98)}
.btn.acc{background:var(--acc);color:var(--acc-ink);border-color:var(--acc);font-weight:600}
.btn.acc:hover{background:#9c8fff;border-color:#9c8fff}
.btn.go{background:var(--ink);color:#0a0a0a;border-color:var(--ink);font-weight:600}
.btn.go:hover{background:#fff}
kbd{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--dim2);background:var(--panel2);border:1px solid var(--line);border-radius:4px;padding:2px 6px}
a:focus-visible,button:focus-visible,input:focus-visible{outline:2px solid var(--acc);outline-offset:2px}
h1{font-weight:650;font-size:clamp(40px,6.4vw,76px);line-height:1.03;letter-spacing:-.045em}
h1 .grad{color:var(--acc)}
h2{font-weight:600;font-size:clamp(24px,3vw,34px);letter-spacing:-.03em;margin-bottom:16px}
h3{font-size:15px;font-weight:550;margin-bottom:8px;letter-spacing:-.01em}
.kicker{display:inline-flex;align-items:center;gap:8px;font-size:12.5px;font-weight:450;color:var(--dim);border:1px solid var(--line);border-radius:99px;padding:6px 14px;margin-bottom:32px}
.kicker kbd{font-size:10px;padding:1px 5px}
.kicker i{width:5px;height:5px;border-radius:50%;background:var(--acc);display:inline-block}
.eyebrow{font-size:12px;font-weight:550;letter-spacing:.1em;text-transform:uppercase;color:var(--dim2);margin-bottom:16px}
.hero{padding:112px 0 96px;position:relative;text-align:center}
.hero::before{content:'';position:absolute;inset:-64px -50vw 40%;background:radial-gradient(ellipse 44% 50% at 50% 0%,rgba(139,124,255,.055),transparent 70%);pointer-events:none;z-index:-1}
.hero p.sub{color:var(--dim);font-size:clamp(16px,2vw,18px);max-width:560px;margin:24px auto 40px;line-height:1.6;font-weight:400}
.cta{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
section{padding:112px 0;border-top:1px solid var(--line)}
p.lede{color:var(--dim);max-width:520px;margin-bottom:48px;font-size:15px}
.bento{display:grid;grid-template-columns:repeat(6,1fr);gap:16px}
.card{grid-column:span 2;background:var(--panel);border:1px solid var(--line);border-radius:var(--r);padding:24px;transition:border-color .2s}
.card:hover{border-color:var(--line2)}
.card p{color:var(--dim);font-size:13.5px;line-height:1.6}
.card.w3{grid-column:span 3}.card.w6{grid-column:span 6}
.card .step{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--dim2);margin-bottom:16px;font-weight:500}
.card .ic{width:32px;height:32px;border-radius:var(--r-sm);background:var(--panel2);border:1px solid var(--line);display:flex;align-items:center;justify-content:center;margin-bottom:16px}
.card .ic svg{width:15px;height:15px;stroke:var(--dim);fill:none;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
.pill{display:inline-flex;align-items:center;font-size:10.5px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;border-radius:4px;padding:2px 8px}
.pill.q{background:var(--acc-dim);color:var(--acc)}
/* command palette hero mock */
.palette{margin:72px auto 0;max-width:600px;text-align:left;background:var(--panel);border:1px solid var(--line2);border-radius:10px;box-shadow:0 24px 48px -16px rgba(0,0,0,.5);overflow:hidden}
.palette .pin{display:flex;align-items:center;gap:12px;padding:16px;border-bottom:1px solid var(--line)}
.palette .pin svg{width:15px;height:15px;stroke:var(--dim2);fill:none;stroke-width:1.8;stroke-linecap:round;flex:0 0 auto}
.palette .pin .q{font-family:'JetBrains Mono',monospace;font-size:14px;color:var(--ink);min-height:22px}
.palette .pin .caret{display:inline-block;width:7px;height:16px;background:var(--acc);margin-left:2px;vertical-align:text-bottom;animation:blink 1.1s steps(1) infinite}
@keyframes blink{50%{opacity:0}}
.palette .sect{font-size:10.5px;font-weight:550;letter-spacing:.1em;text-transform:uppercase;color:var(--dim2);padding:12px 16px 6px}
.prow{display:flex;align-items:center;gap:12px;padding:10px 16px;font-size:13.5px;transition:background .12s}
.prow.on{background:rgba(255,255,255,.045)}
.prow .pi{width:24px;height:24px;border-radius:5px;background:var(--panel2);border:1px solid var(--line);display:flex;align-items:center;justify-content:center;flex:0 0 auto}
.prow .pi svg{width:12px;height:12px;stroke:var(--dim);fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.prow .pn{font-weight:450}
.prow .pd{color:var(--dim2);font-size:12px}
.prow .sp{flex:1}
.prow kbd{flex:0 0 auto}
.palette .pfoot{display:flex;align-items:center;gap:16px;padding:10px 16px;border-top:1px solid var(--line);font-size:11px;color:var(--dim2)}
.palette .pfoot .sp{flex:1}
/* command cards */
.cmdgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.cmd{background:var(--panel);border:1px solid var(--line);border-radius:var(--r);padding:24px;display:flex;flex-direction:column;gap:16px;transition:border-color .2s,transform .2s}
.cmd:hover{border-color:var(--line2);transform:translateY(-1px)}
.cmd .top{display:flex;align-items:center;gap:12px}
.cmd .pi{width:32px;height:32px;border-radius:var(--r-sm);background:var(--panel2);border:1px solid var(--line);display:flex;align-items:center;justify-content:center}
.cmd .pi svg{width:15px;height:15px;stroke:var(--acc);fill:none;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.cmd .top .sp{flex:1}
.cmd h3{margin:0}
.cmd p{color:var(--dim);font-size:13.5px;line-height:1.65}
/* proof strip */
.proof{display:flex;align-items:center;justify-content:center;gap:48px;flex-wrap:wrap;margin-top:48px}
.proof .lg{font-weight:550;font-size:13px;color:var(--dim2);letter-spacing:.04em}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:0;max-width:760px;margin:64px auto 0;text-align:left}
.stat{padding:8px 32px;border-left:1px solid var(--line2)}
.stat .v{font-size:32px;font-weight:600;letter-spacing:-.03em;line-height:1.1}
.stat .k{font-size:13px;color:var(--dim2);margin-top:8px;line-height:1.5}
/* docs / legal */
.doc{max-width:680px;padding-top:96px;padding-bottom:112px}
.doc h1{font-size:clamp(30px,4vw,42px)}
.doc h2{font-size:18px;margin:40px 0 12px}
.doc p,.doc li{color:var(--dim);font-size:14.5px}
.doc ul{padding-left:22px;margin:12px 0}
.doc li{margin-bottom:8px}
.doc b{color:var(--ink);font-weight:550}
/* pricing */
.price{max-width:400px;margin:56px auto 0;background:var(--panel);border:1px solid var(--line2);border-radius:10px;padding:32px;text-align:left;position:relative}
.price .beta{position:absolute;top:-10px;left:32px;background:var(--acc);color:var(--acc-ink);font-size:10.5px;font-weight:650;letter-spacing:.08em;text-transform:uppercase;border-radius:4px;padding:3px 10px}
.price .amt{font-size:40px;font-weight:650;letter-spacing:-.04em;margin-bottom:24px}
.price .amt span{font-size:14px;color:var(--dim);font-weight:400}
.price ul{list-style:none;margin-bottom:24px}
.price li{padding:10px 0;color:var(--dim);font-size:13.5px;border-bottom:1px solid var(--line);display:flex;gap:12px;align-items:center}
.price li::before{content:'';width:4px;height:4px;border-radius:50%;background:var(--acc);flex:0 0 auto}
/* login */
.field{margin-bottom:16px;text-align:left}
.field label{display:block;font-size:12.5px;font-weight:500;color:var(--dim);margin-bottom:8px}
.field input{width:100%;background:var(--panel);border:1px solid var(--line2);border-radius:var(--r-sm);padding:10px 12px;color:var(--ink);font-size:14px;font-family:inherit}
.field input:focus{border-color:var(--acc);outline:none}
.err{background:rgba(244,63,94,.08);border:1px solid rgba(244,63,94,.25);color:#fda4af;border-radius:var(--r-sm);padding:12px 16px;font-size:13.5px;margin-bottom:16px;text-align:left}
.hint{margin-top:24px;font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--dim2);background:var(--panel);border:1px dashed var(--line2);border-radius:var(--r-sm);padding:12px 16px;line-height:1.8;text-align:left}
footer{border-top:1px solid var(--line);padding:40px 0}
footer .wrap{display:flex;gap:24px;flex-wrap:wrap;font-size:12.5px;color:var(--dim2)}
footer a{color:var(--dim)}footer a:hover{color:var(--ink)}
/* statement */
.statement{text-align:center;max-width:760px;margin:0 auto}
.statement h2{font-size:clamp(30px,4.4vw,52px);font-weight:650;letter-spacing:-.04em;line-height:1.08;margin-bottom:0}
.statement h2 span{color:var(--dim2)}
.vprops{display:grid;grid-template-columns:repeat(4,1fr);gap:0;max-width:880px;margin:72px auto 0;text-align:left}
.vprop{padding:8px 32px;border-left:1px solid var(--line2)}
.vprop b{display:block;font-size:14px;font-weight:600;margin-bottom:4px}
.vprop span{font-size:13px;color:var(--dim2);line-height:1.5}
/* command library */
.lib{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.libc{background:var(--panel);border:1px solid var(--line);border-radius:var(--r);padding:20px;transition:border-color .2s,transform .2s}
.libc:hover{border-color:var(--line2);transform:translateY(-1px)}
.libc .cat{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--dim2);margin-bottom:12px}
.libc h3{margin-bottom:4px}
.libc p{color:var(--dim);font-size:13px;line-height:1.6}
/* split feature */
.split{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center}
.split .copy p{color:var(--dim);font-size:15px;line-height:1.7;margin-bottom:16px}
.split .copy p b{color:var(--ink);font-weight:550}
.spike{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:24px;box-shadow:0 24px 48px -16px rgba(0,0,0,.5)}
.spike .lbl{display:flex;justify-content:space-between;font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--dim2);margin-bottom:16px}
.spike svg{width:100%;height:auto;display:block}
.spike .mark{margin-top:16px;display:flex;align-items:center;gap:10px;font-size:12.5px;color:var(--dim);border:1px solid var(--line);border-radius:var(--r-sm);padding:10px 12px}
.spike .mark i{width:5px;height:5px;border-radius:50%;background:var(--acc);flex:0 0 auto}
.spike .mark kbd{margin-left:auto}
/* personas */
.personas{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.persona{background:var(--panel);border:1px solid var(--line);border-radius:var(--r);padding:24px}
.persona .who{font-family:'JetBrains Mono',monospace;font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--acc);margin-bottom:12px}
.persona h3{margin-bottom:8px}
.persona p{color:var(--dim);font-size:13.5px;line-height:1.65}
/* run-on list */
.runon{max-width:760px;margin:0 auto;text-align:center;font-size:clamp(17px,2.4vw,22px);font-weight:500;letter-spacing:-.01em;line-height:1.7;color:var(--dim2)}
.runon b{color:var(--ink);font-weight:550}
/* faq */
.faq{max-width:680px;margin:0 auto}
.faq details{border-bottom:1px solid var(--line)}
.faq summary{list-style:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:20px 0;font-size:15px;font-weight:550;color:var(--ink)}
.faq summary::-webkit-details-marker{display:none}
.faq summary::after{content:'+';color:var(--dim2);font-size:18px;font-weight:400;transition:transform .15s}
.faq details[open] summary::after{transform:rotate(45deg)}
.faq details p{color:var(--dim);font-size:14px;line-height:1.7;padding:0 0 20px;max-width:600px}
/* community */
.comm{display:grid;grid-template-columns:1fr 1fr;gap:16px;max-width:760px;margin:0 auto}
.commc{background:var(--panel);border:1px solid var(--line);border-radius:var(--r);padding:24px;display:flex;flex-direction:column;gap:8px;transition:border-color .2s}
.commc:hover{border-color:var(--line2)}
.commc .k{font-family:'JetBrains Mono',monospace;font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--dim2)}
.commc b{font-size:15px;font-weight:600}
.commc p{color:var(--dim);font-size:13px;line-height:1.6}
.commc .go{color:var(--acc);font-size:13px;font-weight:500;margin-top:8px}
/* big footer */
.bigfoot{border-top:1px solid var(--line);padding:64px 0 48px}
.bigfoot .cols{display:grid;grid-template-columns:1.4fr 1fr 1fr 1fr;gap:32px;margin-bottom:48px}
.bigfoot .col b{display:block;font-size:12px;font-weight:550;letter-spacing:.06em;text-transform:uppercase;color:var(--dim2);margin-bottom:16px}
.bigfoot .col a{display:block;font-size:13.5px;color:var(--dim);padding:5px 0}
.bigfoot .col a:hover{color:var(--ink)}
.bigfoot .brand p{color:var(--dim2);font-size:13px;line-height:1.6;max-width:240px;margin-top:12px}
.bigfoot .base{display:flex;gap:24px;flex-wrap:wrap;font-size:12.5px;color:var(--dim2);border-top:1px solid var(--line);padding-top:24px}
@media(max-width:900px){.split{grid-template-columns:1fr;gap:40px}.lib,.personas{grid-template-columns:1fr}.vprops{grid-template-columns:repeat(2,1fr);gap:32px 0}.bigfoot .cols{grid-template-columns:1fr 1fr}.comm{grid-template-columns:1fr}}
/* reveal (framer equivalent: opacity 0->1, y 10->0, .25s) */
.rv{opacity:0;transform:translateY(10px);transition:opacity .25s ease,transform .25s ease}
.rv.in{opacity:1;transform:none}
@media(prefers-reduced-motion:reduce){.rv{opacity:1;transform:none;transition:none}.palette .pin .caret{animation:none}}
@media(max-width:820px){.cmdgrid{grid-template-columns:1fr}.stats{grid-template-columns:1fr;gap:32px}.card,.card.w3{grid-column:span 6}}
@media(max-width:640px){nav a.nl{display:none}.stat{border-left:none;padding:0 8px}}
`;

function page(title, body, activeNote = '') {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} — ClipFlow</title>
<meta name="description" content="ClipFlow finds your best Kick.com stream moments and turns them into TikTok-ready clips.">
${FONTS}<meta name="tiktok-developers-site-verification" content="y0q4dNmzX45pmh3mSQtLGJUz8888D7et"><style>${MKT_CSS}</style></head><body>
<nav><div class="wrap">
<a class="logo" href="/"><span class="dot">▶</span>ClipFlow</a>
<a class="nl" href="/features">Features</a>
<a class="nl" href="/pricing">Pricing</a>
<a class="nl" href="/privacy">Privacy</a>
<a class="nl" href="/terms">Terms</a>
<span class="sp"></span>
<a class="btn" href="/login">Log in</a>
<a class="btn acc" href="/dashboard">Open Dashboard</a>
</div></nav>
${body}
<footer class="bigfoot"><div class="wrap">
<div class="cols">
<div class="col brand"><a class="logo" href="/"><span class="dot">▶</span>ClipFlow</a><p>Turns Kick streams into TikTok-ready clips. Detected, cropped, captioned and queued — automatically.</p></div>
<div class="col"><b>Product</b><a href="/features">Features</a><a href="/pricing">Pricing</a><a href="/dashboard">Dashboard</a><a href="/login">Log in</a></div>
<div class="col"><b>Company</b><a href="mailto:evmgmtco@gmail.com">Contact</a><a href="https://x.com/evclaude00">X / Twitter</a></div>
<div class="col"><b>Legal</b><a href="/privacy">Privacy Policy</a><a href="/terms">Terms of Service</a></div>
</div>
<div class="base"><span>© 2026 ClipFlow · operated by EV Management Co</span><span>evmgmtco@gmail.com</span>${activeNote}</div>
</div></footer>
<script>
(function(){
if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
var els=document.querySelectorAll('section .card,section .cmd,section h2,.price,.stat');
els.forEach(function(e,i){e.classList.add('rv');e.style.transitionDelay=(i%3)*70+'ms';});
var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target);}});},{threshold:.12});
els.forEach(function(e){io.observe(e)});
})();
</script>
</body></html>`;
}

// ── Landing page ──────────────────────────────────────────────────────────────
const HOME = page('Turn livestreams into viral TikTok clips instantly', `
<div class="wrap hero">
<div class="kicker"><i></i>Command-first clipping for Kick streamers <kbd>⌘K</kbd></div>
<h1>Turn livestreams into<br><span class="grad">viral TikTok clips</span> instantly</h1>
<p class="sub">ClipFlow watches your Kick stream, cuts vertical highlights with captions, and queues them to TikTok — all from one command bar.</p>
<div class="cta"><a class="btn acc" href="/dashboard">Open Dashboard</a><a class="btn" href="/features">Watch demo</a></div>
<p style="margin-top:16px;font-size:12px;color:var(--dim2)" class="mono">Web app · works with any Kick VOD · no OBS plugins</p>

<div class="palette" role="img" aria-label="The ClipFlow command bar with a command being typed and matching actions listed">
<div class="pin"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><span class="q"><span id="ptyped"></span><span class="caret"></span></span></div>
<div class="sect">Actions</div>
<div class="prow on"><span class="pi"><svg viewBox="0 0 24 24"><path d="M12 3v12"/><path d="m7 8 5-5 5 5"/><path d="M4 21h16"/></svg></span><span class="pn">Upload clip</span><span class="pd">from a Kick VOD link</span><span class="sp"></span><kbd>↵</kbd></div>
<div class="prow"><span class="pi"><svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h10M4 17h7"/></svg></span><span class="pn">Generate caption</span><span class="pd">AI title + hashtags</span><span class="sp"></span><kbd>⌘G</kbd></div>
<div class="prow"><span class="pi"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg></span><span class="pn">Schedule TikTok post</span><span class="pd">queue for peak hours</span><span class="sp"></span><kbd>⌘S</kbd></div>
<div class="prow"><span class="pi"><svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg></span><span class="pn">Find viral clips</span><span class="pd">detect chat spikes in your VOD</span><span class="sp"></span><kbd>⌘F</kbd></div>
<div class="pfoot"><span>ClipFlow</span><span class="sp"></span><span>navigate <kbd>↑</kbd> <kbd>↓</kbd></span><span>run <kbd>↵</kbd></span></div>
</div>
<script>
(function(){
var el=document.getElementById('ptyped');if(!el)return;
if(matchMedia('(prefers-reduced-motion: reduce)').matches){el.textContent='upload clip';return}
var rows=document.querySelectorAll('.palette .prow');
var cmds=['upload clip','generate caption','schedule tiktok post','find viral clips'];
var ci=0,pos=0,del=false;
function tick(){
 var c=cmds[ci];
 el.textContent=c.slice(0,pos);
 rows.forEach(function(r,i){r.classList.toggle('on',i===ci)});
 if(!del){pos++;if(pos>c.length){del=true;setTimeout(tick,1400);return}}
 else{pos--;if(pos===0){del=false;ci=(ci+1)%cmds.length}}
 setTimeout(tick,del?28:55);
}
tick();
})();
</script>
</div>

<section><div class="wrap">
<div class="statement">
<h2>It's not about clipping faster.<br><span>It's about never opening an editor again.</span></h2>
</div>
<div class="vprops">
<div class="vprop"><b>Automatic.</b><span>Highlights found from chat activity, not guesswork.</span></div>
<div class="vprop"><b>Vertical.</b><span>Every clip rendered 9:16, captioned, phone-ready.</span></div>
<div class="vprop"><b>Fast.</b><span>VOD link to finished MP4 in under two minutes.</span></div>
<div class="vprop"><b>Reliable.</b><span>Official Kick, TikTok and Stripe integrations.</span></div>
</div>
</div></section>

<section><div class="wrap">
<div class="eyebrow">Command library</div>
<h2>There's a command for that.</h2>
<p class="lede">Everything ClipFlow does, one keystroke away. No menus, no timelines, no tutorials.</p>
<div class="lib">
<div class="libc"><div class="cat">Clipping</div><h3>Upload clip</h3><p>Paste a Kick VOD link with a start time. ClipFlow downloads only that section and renders it.</p></div>
<div class="libc"><div class="cat">Clipping</div><h3>Find viral clips</h3><p>Scans chat velocity and emote bursts to surface the moments your viewers actually reacted to.</p></div>
<div class="libc"><div class="cat">Clipping</div><h3>Vertical crop</h3><p>Reframes to 9:16 with your camera tracked, so faces stay centered on mobile screens.</p></div>
<div class="libc"><div class="cat">Publishing</div><h3>Generate caption</h3><p>AI-written hook titles and hashtags tuned for TikTok's feed. Edit inline or ship as-is.</p></div>
<div class="libc"><div class="cat">Publishing</div><h3>Schedule post</h3><p>Queue approved clips for the hours your audience is scrolling, via TikTok's official API.</p></div>
<div class="libc"><div class="cat">Publishing</div><h3>Burn captions</h3><p>Word-by-word captions in styles that perform, with profanity handling you control.</p></div>
<div class="libc"><div class="cat">Library</div><h3>Clip library</h3><p>Every highlight stored for 30 days — post an older moment when a game blows up.</p></div>
<div class="libc"><div class="cat">Analytics</div><h3>Track views</h3><p>Views, viral clips and engagement across everything you've posted, in one view.</p></div>
<div class="libc"><div class="cat">Analytics</div><h3>Best time to post</h3><p>Learns when your clips perform and schedules around it automatically.</p></div>
</div>
</div></section>

<section><div class="wrap">
<div class="split">
<div class="copy">
<div class="eyebrow">AI detection</div>
<h2>Your VOD just got smarter.</h2>
<p>You already know when the clip happened — <b>your chat told you.</b> ClipFlow reads chat velocity, emote bursts and viewer spikes across the whole VOD and marks the exact seconds worth posting.</p>
<p>No scrubbing a four-hour stream at 2am. No "I'll clip it tomorrow" that never happens. <b>Open the dashboard, review the suggestions, press enter.</b></p>
</div>
<div class="spike">
<div class="lbl"><span>chat velocity · msgs/10s</span><span>VOD 01:38:00–01:46:00</span></div>
<svg viewBox="0 0 520 140" role="img" aria-label="Chat activity graph with a detected spike">
<g stroke="rgba(255,255,255,.06)"><line x1="0" y1="35" x2="520" y2="35"/><line x1="0" y1="70" x2="520" y2="70"/><line x1="0" y1="105" x2="520" y2="105"/></g>
<path d="M0,118 L40,112 L80,116 L120,108 L160,112 L200,102 L240,108 L280,42 L300,18 L320,38 L360,96 L400,104 L440,100 L480,108 L520,104" fill="none" stroke="#8b7cff" stroke-width="1.5" stroke-linecap="round"/>
<circle cx="300" cy="18" r="3.5" fill="#8b7cff"/>
<line x1="300" y1="18" x2="300" y2="140" stroke="rgba(139,124,255,.3)" stroke-dasharray="3 4"/>
</svg>
<div class="mark"><i></i><span><b style="color:var(--ink);font-weight:550">Highlight detected</b> at 01:42:16 · confidence 0.94</span><kbd>↵ clip</kbd></div>
</div>
</div>
</div></section>

<section><div class="wrap">
<div class="eyebrow">Who it's for</div>
<h2>Built for streamers like you.</h2>
<p class="lede">If you're live on Kick, your best marketing already happened — it's sitting in your VODs.</p>
<div class="personas">
<div class="persona"><div class="who">The grinder</div><h3>Streams daily, posts never</h3><p>Four hours live, five nights a week — and a TikTok that's been quiet for a month. ClipFlow turns every stream into next-day posts without adding a minute to your schedule.</p></div>
<div class="persona"><div class="who">The growth streamer</div><h3>Knows shorts drive discovery</h3><p>TikTok is where new viewers find you; the stream is where they stay. Keep a consistent posting cadence without paying an editor £400 a month.</p></div>
<div class="persona"><div class="who">The variety streamer</div><h3>Every game, one pipeline</h3><p>IRL, gaming, react content — chat spikes look the same everywhere. One workflow that follows whatever you stream next.</p></div>
</div>
</div></section>

<section><div class="wrap" style="text-align:center">
<div class="eyebrow">And the rest</div>
<h2>What else can ClipFlow do?</h2>
<p class="runon" style="margin-top:32px">It finds chat spikes. Crops to <b>9:16</b>. Tracks your camera. Burns <b>word-by-word captions</b>. Writes hook titles. Suggests hashtags. Queues posts for <b>peak hours</b>. Stores clips for 30 days. Tracks views and engagement. <b>And it's just getting started.</b></p>
</div></section>

<section><div class="wrap" style="text-align:center">
<div class="eyebrow">Built on official rails</div>
<h2>Fast pipeline, real integrations</h2>
<div class="proof">
<span class="lg">KICK.COM</span><span class="lg">TikTok API</span><span class="lg">Stripe</span><span class="lg">Cloudflare</span><span class="lg">Railway</span>
</div>
<div class="stats">
<div class="stat"><div class="v">9:16</div><div class="k">vertical, captioned, phone-ready</div></div>
<div class="stat"><div class="v">&lt; 2 min</div><div class="k">from VOD link to rendered MP4</div></div>
<div class="stat"><div class="v">£9.99<span style="font-size:14px;color:var(--dim2)">/mo</span></div><div class="k">vs £400+/mo for a human clipper</div></div>
</div>
</div></section>

<section><div class="wrap">
<div class="eyebrow" style="text-align:center">Questions</div>
<h2 style="text-align:center;margin-bottom:48px">Frequently asked</h2>
<div class="faq">
<details><summary>How does it work without OBS plugins or downloads?</summary><p>ClipFlow works from your public Kick VODs. Paste a VOD link — or let highlight detection scan it — and the pipeline downloads just the section it needs, renders it vertical, and hands you the MP4. Nothing to install, nothing running on your streaming PC.</p></details>
<details><summary>Do I need to connect my TikTok account?</summary><p>Not to make clips. Download and post them yourself from day one. Direct posting and scheduling use TikTok's official Content Posting API, which is currently in review — it unlocks automatically for your account once approved.</p></details>
<details><summary>How good is the highlight detection, really?</summary><p>It reads what your chat already did: message velocity, emote bursts and viewer spikes. Those signals line up with clippable moments far more reliably than scrubbing a timeline — and you always review before anything is posted.</p></details>
<details><summary>What does it cost?</summary><p>One plan: £9.99/month, billed through Stripe. That's less than an hour of a human editor's time. Cancel anytime and keep access until the end of the paid period.</p></details>
<details><summary>Who owns the clips?</summary><p>You do — entirely. ClipFlow processes your stream content solely to make your clips, never sells data or trains AI on your content, and deletes clips after 30 days. Details in our <a href="/privacy" style="color:var(--acc)">Privacy Policy</a>.</p></details>
<details><summary>I'm not on Kick. Will you support other platforms?</summary><p>Kick first, done properly. Other platforms are on the roadmap — email <a href="mailto:evmgmtco@gmail.com" style="color:var(--acc)">evmgmtco@gmail.com</a> and tell us where you stream.</p></details>
</div>
</div></section>

<section><div class="wrap">
<div class="eyebrow" style="text-align:center">Community</div>
<h2 style="text-align:center;margin-bottom:48px">Stay in the loop.</h2>
<div class="comm">
<a class="commc" href="https://x.com/evclaude00"><span class="k">X / Twitter</span><b>@evclaude00</b><p>Build updates, feature drops and clips from the pipeline as they ship.</p><span class="go">Follow →</span></a>
<a class="commc" href="mailto:evmgmtco@gmail.com?subject=ClipFlow%20early%20access&body=My%20Kick%20channel%20is:%20"><span class="k">Early access</span><b>Get onboarded personally</b><p>We're onboarding Kick streamers one at a time while TikTok review completes. Tell us your channel.</p><span class="go">Request access →</span></a>
</div>
</div></section>

<section><div class="wrap hero" style="padding:48px 32px 32px;border:none">
<h2 style="font-size:clamp(30px,4.4vw,52px);letter-spacing:-.04em">Take the short way.</h2>
<p class="sub" style="margin-bottom:32px">Log in, paste a VOD link, get a clip. That's the whole onboarding.</p>
<div class="cta"><a class="btn acc" href="/dashboard">Open Dashboard</a><a class="btn" href="/pricing">See pricing</a></div>
</div></section>`);

// ── Marketing + legal pages (content preserved for TikTok review) ─────────────
const FEATURES = page('Features', `
<div class="wrap hero" style="padding-bottom:24px">
<div class="kicker"><i></i>Features</div>
<h1>Everything between<br>the stream and <span class="grad">the post.</span></h1>
</div>
<section style="border-top:none;padding-top:40px"><div class="wrap"><div class="bento">
<div class="card w3"><div class="ic"><svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg></div><h3>Highlight detection</h3><p>Chat velocity and emote-burst analysis finds the moments your viewers actually reacted to — not random timestamps.</p></div>
<div class="card w3"><div class="ic"><svg viewBox="0 0 24 24"><rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 18h2"/></svg></div><h3>Vertical auto-crop</h3><p>Clips are reframed to 9:16 with your camera tracked, so faces stay centered on mobile screens.</p></div>
<div class="card"><div class="ic"><svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h10M4 17h7"/></svg></div><h3>Auto captions</h3><p>Word-by-word captions in styles that perform on TikTok, with profanity handling you control.</p></div>
<div class="card"><div class="ic"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg></div><h3>Post scheduling</h3><p>Queue approved clips for the hours your audience is on TikTok. One a day or ten — your call.</p></div>
<div class="card"><div class="ic"><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m10 9 5 3-5 3z"/></svg></div><h3>Clip library</h3><p>Every highlight stored for 30 days, so you can post an older moment when a game blows up.</p></div>
<div class="card w6"><div class="ic"><svg viewBox="0 0 24 24"><path d="m21 3-9 9"/><path d="M21 3 14 21l-3-8-8-3z"/></svg></div><h3>TikTok integration <span class="pill q">beta</span></h3><p>Direct posting via TikTok's official Content Posting API. Currently in review — beta users post via one-tap export in the meantime.</p></div>
</div></div></section>`);

const PRICING = page('Pricing', `
<div class="wrap hero">
<div class="kicker"><i></i>Pricing</div>
<h1>One plan.<br><span class="grad">No editors’ fees.</span></h1>
<p class="sub">A human clipper runs £400+/month. Your own time in CapCut costs every evening. ClipFlow is £9.99.</p>
<div class="price">
<span class="beta">Early access</span>
<div class="amt">£9.99<span>/month</span></div>
<ul>
<li>Unlimited stream monitoring</li>
<li>Auto highlight detection</li>
<li>Vertical clips with captions</li>
<li>Clip library (30 days)</li>
<li>TikTok posting (beta)</li>
<li>Cancel anytime</li>
</ul>
<a class="btn acc" href="mailto:evmgmtco@gmail.com?subject=ClipFlow%20early%20access&body=My%20Kick%20channel%20is:%20" style="width:100%">Request early access</a>
<p style="color:var(--dim2);font-size:12.5px;margin-top:16px">ClipFlow is in early access while our TikTok integration completes review. Request access and we'll onboard you personally — you're only billed when your account is live.</p>
</div>
</div>`);

const PRIVACY = page('Privacy Policy', `
<div class="wrap doc">
<div class="eyebrow">Legal</div>
<h1>Privacy Policy</h1>
<p class="mono" style="margin-top:10px">Last updated: 2 July 2026</p>
<h2>Who we are</h2>
<p>ClipFlow ("we", "us") is operated by EV Management Co, United Kingdom. Contact: evmgmtco@gmail.com. This policy explains what personal data we collect when you use clipflow.evmgmtco.workers.dev and the ClipFlow service, and how we handle it.</p>
<h2>Data we collect</h2>
<ul>
<li><b>Account data:</b> your email address and display name when you create an account or request early access.</li>
<li><b>Connected platforms:</b> your public Kick.com channel name, and — if you connect TikTok — the access token TikTok issues us to post on your behalf. We never see or store your TikTok password.</li>
<li><b>Content data:</b> clips generated from your public streams, stored for up to 30 days.</li>
<li><b>Usage data:</b> standard server logs (IP address, browser type, pages visited) kept for security and debugging.</li>
</ul>
<h2>How we use it</h2>
<p>Solely to provide the service: detecting highlights, generating clips, and posting to accounts you explicitly connect. We do not sell personal data, run third-party advertising, or use your content to train AI models.</p>
<h2>Third parties</h2>
<p>We use Cloudflare (hosting), Railway (processing), Stripe (payments — card details go directly to Stripe and never touch our servers), and the official TikTok API (posting, only with your authorisation). Each processes data under its own privacy policy.</p>
<h2>Your rights</h2>
<p>Under UK GDPR you may request access, correction, deletion, or export of your data at any time by emailing evmgmtco@gmail.com. Disconnecting TikTok from your dashboard immediately revokes our posting token. Deleting your account removes your clips and account data within 30 days.</p>
<h2>Data retention & security</h2>
<p>Clips are deleted after 30 days. Account data is kept while your account is active. Data is encrypted in transit (TLS) and access tokens are stored encrypted at rest.</p>
<h2>Changes</h2>
<p>We will post any changes to this policy on this page with an updated date.</p>
</div>`);

const TERMS = page('Terms of Service', `
<div class="wrap doc">
<div class="eyebrow">Legal</div>
<h1>Terms of Service</h1>
<p class="mono" style="margin-top:10px">Last updated: 2 July 2026</p>
<h2>1. The service</h2>
<p>ClipFlow generates short-form clips from your Kick.com streams and, where you connect a TikTok account, posts them on your behalf via TikTok's official API. The service is operated by EV Management Co, United Kingdom.</p>
<h2>2. Your account</h2>
<p>You must be at least 18 and provide accurate information. You are responsible for activity under your account and for keeping your login secure.</p>
<h2>3. Your content</h2>
<p>You retain all rights to your streams and clips. You grant us a limited licence to process your stream content solely to provide the service. You must own or have rights to everything in your streams, and only connect platform accounts you control.</p>
<h2>4. Acceptable use</h2>
<p>You may not use ClipFlow to post content that violates Kick's or TikTok's terms or community guidelines, infringes others' rights, or is unlawful. We may suspend accounts that do.</p>
<h2>5. Billing</h2>
<p>ClipFlow costs £9.99/month, billed via Stripe, starting only when your account is activated. Cancel anytime from your dashboard or by emailing us; access continues to the end of the paid period. Statutory refund rights are unaffected.</p>
<h2>6. Beta features</h2>
<p>Features marked "beta" (including direct TikTok posting) are provided as-is and may change or be unavailable while under platform review.</p>
<h2>7. Liability</h2>
<p>The service is provided "as available". To the maximum extent permitted by law, our liability is limited to the fees you paid in the previous 12 months. Nothing limits liability that cannot be limited under UK law.</p>
<h2>8. Termination & changes</h2>
<p>You may close your account at any time. We may modify these terms with notice on this page; continued use after changes means acceptance.</p>
<h2>9. Contact</h2>
<p>Questions: evmgmtco@gmail.com</p>
</div>`);

function loginPage(err = '') {
  return page('Log in', `
<div class="wrap hero" style="max-width:520px">
<div class="eyebrow">Account</div>
<h1>Log in</h1>
<p class="sub" style="margin-bottom:24px">Access your clip dashboard.</p>
${err ? `<div class="err">${err}</div>` : ''}
<form method="POST" action="/login">
<div class="field"><label for="em">Email</label><input id="em" name="email" type="email" required autocomplete="email"></div>
<div class="field"><label for="pw">Password</label><input id="pw" name="password" type="password" required autocomplete="current-password"></div>
<button class="btn go" type="submit" style="width:100%;cursor:pointer;font-size:15px">Log in</button>
</form>
<div class="hint">Reviewer / demo access:<br>email: demo@clipflow.app<br>password: ClipFlowDemo2026</div>
</div>`);
}

// ── Dashboard: Raycast-style command-driven app ───────────────────────────────
const APP_CSS = `
:root{--bg:#0a0a0a;--surface:#101010;--surface2:#161616;--line:rgba(255,255,255,.07);--line2:rgba(255,255,255,.12);--ink:#ededed;--dim:#a1a1a6;--dim2:#6e6e73;--acc:#8b7cff;--acc-ink:#0e0b1f;--acc-dim:rgba(139,124,255,.1);--ok:#3fb950;--ok-dim:rgba(63,185,80,.1);--warn:#d29922;--warn-dim:rgba(210,153,34,.1);--red:#f85149;--r:8px;--r-sm:6px}
*{margin:0;padding:0;box-sizing:border-box}
body{background:var(--bg);color:var(--ink);font-family:'Inter',system-ui,sans-serif;font-size:13.5px;line-height:1.5;-webkit-font-smoothing:antialiased;font-feature-settings:'cv11';overflow:hidden}
a{color:inherit;text-decoration:none}
button{font-family:inherit;cursor:pointer}
.mono{font-family:'JetBrains Mono',monospace}
kbd{font-family:'JetBrains Mono',monospace;font-size:10.5px;color:var(--dim2);background:var(--surface2);border:1px solid var(--line);border-radius:4px;padding:1px 6px}
a:focus-visible,button:focus-visible,input:focus-visible{outline:2px solid var(--acc);outline-offset:2px}
.shell{display:grid;grid-template-columns:56px 1fr;height:100vh}
/* thin icon sidebar */
.side{border-right:1px solid var(--line);display:flex;flex-direction:column;align-items:center;padding:16px 0;gap:4px;background:var(--bg)}
.side .logo{width:28px;height:28px;border-radius:var(--r-sm);background:var(--acc);display:flex;align-items:center;justify-content:center;color:var(--acc-ink);font-weight:800;font-size:10px;margin-bottom:16px}
.side button.ni{width:36px;height:36px;border-radius:var(--r-sm);border:none;background:transparent;display:flex;align-items:center;justify-content:center;color:var(--dim2);position:relative;transition:background .12s,color .12s}
.side button.ni:hover{background:var(--surface2);color:var(--dim)}
.side button.ni.on{background:var(--surface2);color:var(--ink)}
.side button.ni svg{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.side button.ni .tip{position:absolute;left:46px;top:50%;transform:translateY(-50%);background:var(--surface2);border:1px solid var(--line2);border-radius:var(--r-sm);padding:4px 10px;font-size:12px;color:var(--ink);white-space:nowrap;opacity:0;pointer-events:none;transition:opacity .12s;z-index:40}
.side button.ni:hover .tip{opacity:1}
.side .sp{flex:1}
/* main column */
.main{display:flex;flex-direction:column;min-width:0}
.topbar{display:flex;align-items:center;gap:16px;height:56px;padding:0 24px;border-bottom:1px solid var(--line)}
.cmdbtn{flex:1;max-width:520px;display:flex;align-items:center;gap:10px;background:var(--surface);border:1px solid var(--line);border-radius:var(--r-sm);padding:8px 12px;color:var(--dim2);font-size:13px;transition:border-color .15s;text-align:left}
.cmdbtn:hover{border-color:var(--line2)}
.cmdbtn svg{width:13px;height:13px;stroke:var(--dim2);fill:none;stroke-width:1.8;stroke-linecap:round;flex:0 0 auto}
.cmdbtn .sp{flex:1}
.topbar .tsp{flex:1}
.live{display:inline-flex;align-items:center;gap:8px;font-size:12.5px;color:var(--dim);font-weight:450}
.live i{width:6px;height:6px;border-radius:50%;background:var(--ok)}
.topbar a.out{font-size:12.5px;color:var(--dim);font-weight:450}
.topbar a.out:hover{color:var(--ink)}
/* content grid */
.content{flex:1;display:grid;grid-template-columns:1fr 264px;min-height:0}
.view{overflow-y:auto;padding:32px}
.view h1{font-size:20px;font-weight:600;letter-spacing:-.02em;margin-bottom:4px}
.view .sub{color:var(--dim2);font-size:13px;margin-bottom:32px}
.slab{font-size:11px;font-weight:550;letter-spacing:.1em;text-transform:uppercase;color:var(--dim2);margin:32px 0 12px}
.slab:first-of-type{margin-top:0}
/* quick action cards */
.qgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
.qa{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:16px;text-align:left;display:flex;flex-direction:column;gap:12px;transition:border-color .15s,background .15s}
.qa:hover{border-color:var(--line2);background:var(--surface2)}
.qa:active{transform:scale(.99)}
.qa .pi{width:28px;height:28px;border-radius:var(--r-sm);background:var(--surface2);border:1px solid var(--line);display:flex;align-items:center;justify-content:center}
.qa .pi svg{width:14px;height:14px;stroke:var(--acc);fill:none;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.qa b{font-size:13px;font-weight:550;display:block}
.qa span{font-size:12px;color:var(--dim2);display:block;margin-top:2px}
/* activity feed */
.feed{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);overflow:hidden}
.ev{display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid var(--line);font-size:12.5px}
.ev:last-child{border-bottom:none}
.ev i{width:6px;height:6px;border-radius:50%;flex:0 0 auto}
.ev i.ok{background:var(--ok)}.ev i.acc{background:var(--acc)}.ev i.warn{background:var(--warn)}
.ev .t{color:var(--dim)}
.ev b{color:var(--ink);font-weight:550}
.ev .when{margin-left:auto;color:var(--dim2);font-size:11px;font-family:'JetBrains Mono',monospace;flex:0 0 auto}
/* table */
.tblwrap{border:1px solid var(--line);border-radius:var(--r);overflow:hidden;background:var(--surface)}
table{width:100%;border-collapse:collapse}
th{font-size:10.5px;font-weight:550;letter-spacing:.08em;text-transform:uppercase;color:var(--dim2);text-align:left;padding:10px 16px;border-bottom:1px solid var(--line)}
td{padding:12px 16px;border-bottom:1px solid var(--line);font-size:13px;color:var(--dim);vertical-align:middle}
tr:last-child td{border-bottom:none}
tr:hover td{background:rgba(255,255,255,.015)}
td b{color:var(--ink);font-weight:550}
.thumb{width:32px;height:48px;border-radius:4px;background:var(--surface2);border:1px solid var(--line);display:inline-flex;align-items:center;justify-content:center}
.thumb svg{width:12px;height:12px;stroke:var(--dim2);fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.pill{display:inline-flex;align-items:center;gap:6px;font-size:10.5px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;border-radius:4px;padding:3px 8px}
.pill.ok{background:var(--ok-dim);color:var(--ok)}
.pill.proc{background:var(--acc-dim);color:var(--acc)}
.pill.post{background:var(--surface2);color:var(--dim)}
.pill.warn{background:var(--warn-dim);color:var(--warn)}
.pill i{width:4px;height:4px;border-radius:50%;background:currentColor}
.pill.proc i{animation:pulse 1.2s infinite}
@keyframes pulse{50%{opacity:.35}}
a.dl,button.rowact{color:var(--acc);font-weight:500;font-size:12.5px;background:none;border:none;padding:0}
a.dl:hover,button.rowact:hover{text-decoration:underline}
/* right panel */
.rpanel{border-left:1px solid var(--line);padding:32px 24px;overflow-y:auto}
.rpanel .slab{margin-top:0}
.sysrow{display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--line);font-size:12.5px;color:var(--dim)}
.sysrow:last-child{border-bottom:none}
.sysrow b{color:var(--ink);font-weight:550;font-size:12.5px}
.logline{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--dim2);padding:6px 0;border-bottom:1px solid var(--line);line-height:1.5}
.logline em{color:var(--dim);font-style:normal}
.logline:last-child{border-bottom:none}
/* stats (analytics) */
.stgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px}
.st{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:20px}
.st .k{font-size:12px;color:var(--dim2);font-weight:500}
.st .v{font-size:28px;font-weight:600;letter-spacing:-.03em;margin-top:8px}
.st .d{font-size:11.5px;margin-top:8px;font-weight:500}
.st .d.up{color:var(--ok)}.st .d.fl{color:var(--dim2)}
.chart{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:24px}
.chart svg{width:100%;height:auto;display:block}
/* empty states */
.empty{background:var(--surface);border:1px dashed var(--line2);border-radius:var(--r);padding:48px 24px;text-align:center}
.empty .pi{width:36px;height:36px;border-radius:var(--r-sm);background:var(--surface2);border:1px solid var(--line);display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px}
.empty .pi svg{width:16px;height:16px;stroke:var(--dim);fill:none;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.empty b{display:block;font-size:14px;font-weight:550;margin-bottom:4px}
.empty p{color:var(--dim2);font-size:12.5px;max-width:340px;margin:0 auto 20px}
/* buttons */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:36px;padding:0 14px;border-radius:var(--r-sm);font-weight:500;font-size:13px;border:1px solid var(--line2);background:transparent;transition:border-color .15s,background .15s,transform .1s;color:var(--ink)}
.btn:hover{border-color:rgba(255,255,255,.24);background:rgba(255,255,255,.04)}
.btn:active{transform:scale(.98)}
.btn.acc{background:var(--acc);color:var(--acc-ink);border-color:var(--acc);font-weight:600}
.btn.acc:hover{background:#9c8fff;border-color:#9c8fff}
/* command palette + modals */
.ovl{position:fixed;inset:0;background:rgba(0,0,0,.55);backdrop-filter:blur(2px);display:none;align-items:flex-start;justify-content:center;padding:14vh 24px 24px;z-index:60}
.ovl.show{display:flex}
.pal{width:100%;max-width:560px;background:var(--surface);border:1px solid var(--line2);border-radius:10px;box-shadow:0 24px 48px -12px rgba(0,0,0,.6);overflow:hidden;animation:up .2s cubic-bezier(.2,.8,.3,1)}
@keyframes up{from{opacity:0;transform:translateY(8px) scale(.99)}to{opacity:1;transform:none}}
.pal .pin{display:flex;align-items:center;gap:12px;padding:14px 16px;border-bottom:1px solid var(--line)}
.pal .pin svg{width:14px;height:14px;stroke:var(--dim2);fill:none;stroke-width:1.8;stroke-linecap:round;flex:0 0 auto}
.pal input{flex:1;background:none;border:none;color:var(--ink);font-size:14px;font-family:inherit;outline:none}
.pal input::placeholder{color:var(--dim2)}
.pal .list{max-height:320px;overflow-y:auto;padding:6px 0}
.pal .sect{font-size:10px;font-weight:550;letter-spacing:.1em;text-transform:uppercase;color:var(--dim2);padding:10px 16px 4px}
.prow{display:flex;align-items:center;gap:12px;padding:9px 16px;font-size:13.5px;cursor:pointer}
.prow.on{background:rgba(255,255,255,.045)}
.prow .pi{width:24px;height:24px;border-radius:5px;background:var(--surface2);border:1px solid var(--line);display:flex;align-items:center;justify-content:center;flex:0 0 auto}
.prow .pi svg{width:12px;height:12px;stroke:var(--dim);fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.prow .pn{font-weight:450}
.prow .pd{color:var(--dim2);font-size:11.5px}
.prow .rsp{flex:1}
.pal .pfoot{display:flex;align-items:center;gap:12px;padding:9px 16px;border-top:1px solid var(--line);font-size:11px;color:var(--dim2)}
.pal .pfoot .rsp{flex:1}
.pal .none{padding:28px 16px;text-align:center;color:var(--dim2);font-size:13px}
/* modal (upload flow) */
.modal{width:100%;max-width:504px;background:var(--surface);border:1px solid var(--line2);border-radius:10px;box-shadow:0 24px 48px -12px rgba(0,0,0,.6);animation:up .2s cubic-bezier(.2,.8,.3,1);padding:24px}
.modal h2{font-size:16px;font-weight:600;letter-spacing:-.01em;margin-bottom:4px}
.modal .ms{color:var(--dim2);font-size:12.5px;margin-bottom:20px}
.drop{border:1px dashed var(--line2);border-radius:var(--r-sm);padding:24px;text-align:center;color:var(--dim2);font-size:12.5px;margin-bottom:16px;transition:border-color .15s,background .15s}
.drop.over{border-color:var(--acc);background:var(--acc-dim)}
.drop b{color:var(--dim);display:block;margin-bottom:2px;font-size:13px;font-weight:550}
.field{margin-bottom:16px}
.field label{display:block;font-size:12px;font-weight:500;color:var(--dim);margin-bottom:8px}
.field input{width:100%;background:var(--bg);border:1px solid var(--line2);border-radius:var(--r-sm);padding:9px 12px;color:var(--ink);font-size:13.5px;font-family:inherit}
.field input:focus{border-color:var(--acc);outline:none}
.f2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.chk{display:flex;align-items:center;gap:10px;font-size:13px;color:var(--dim);margin-bottom:20px;cursor:pointer}
.chk input{width:14px;height:14px;accent-color:var(--acc)}
.mrow{display:flex;gap:8px;justify-content:flex-end}
.prog{height:2px;background:var(--surface2);border-radius:99px;overflow:hidden;margin:16px 0 4px;display:none}
.prog.show{display:block}
.prog i{display:block;height:100%;width:40%;background:var(--acc);border-radius:99px;animation:slide 1.2s ease-in-out infinite}
@keyframes slide{0%{transform:translateX(-100%)}100%{transform:translateX(350%)}}
.pstate{font-size:12px;color:var(--dim);font-family:'JetBrains Mono',monospace;display:none}
.pstate.show{display:block}
/* toasts */
#toasts{position:fixed;bottom:24px;right:24px;display:flex;flex-direction:column;gap:8px;z-index:80}
.toast{background:var(--surface2);border:1px solid var(--line2);border-radius:var(--r-sm);padding:12px 16px;font-size:13px;box-shadow:0 16px 32px -8px rgba(0,0,0,.5);animation:up .2s ease;max-width:340px}
.toast.err{border-color:rgba(248,81,73,.4)}
/* stagger-in (framer equivalent) */
.stag{opacity:0;transform:translateY(8px);animation:fadeup .25s ease forwards}
@keyframes fadeup{to{opacity:1;transform:none}}
@media(prefers-reduced-motion:reduce){.stag,.pal,.modal{animation:none;opacity:1;transform:none}.pill.proc i{animation:none}.prog i{animation:none;width:100%}}
@media(max-width:1060px){.content{grid-template-columns:1fr}.rpanel{display:none}.qgrid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:640px){.qgrid{grid-template-columns:1fr}.stgrid{grid-template-columns:1fr}}
`;

const IC = {
  home: '<svg viewBox="0 0 24 24"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1z"/></svg>',
  clips: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m10 9 5 3-5 3z"/></svg>',
  upload: '<svg viewBox="0 0 24 24"><path d="M12 3v12"/><path d="m7 8 5-5 5 5"/><path d="M4 21h16"/></svg>',
  sched: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>',
  chart: '<svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
  cog: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2-1.2L14.2 3h-4l-.4 2.5a7 7 0 0 0-2 1.2l-2.3-1-2 3.4 2 1.5a7 7 0 0 0 0 2.4l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 2 1.2l.4 2.5h4l.4-2.5a7 7 0 0 0 2-1.2l2.3 1 2-3.4-2-1.5c.07-.4.1-.8.1-1.2z"/></svg>',
  cap: '<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h10M4 17h7"/></svg>',
  find: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  send: '<svg viewBox="0 0 24 24"><path d="m21 3-9 9"/><path d="M21 3 14 21l-3-8-8-3z"/></svg>'
};

const DASHBOARD = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Dashboard — ClipFlow</title>${FONTS}<style>${APP_CSS}</style></head><body>
<div class="shell">
<aside class="side">
<a class="logo" href="/">▶</a>
<button class="ni on" data-v="dashboard">${IC.home}<span class="tip">Dashboard</span></button>
<button class="ni" data-v="clips">${IC.clips}<span class="tip">Clips</span></button>
<button class="ni" data-v="upload">${IC.upload}<span class="tip">Upload</span></button>
<button class="ni" data-v="scheduler">${IC.sched}<span class="tip">Scheduler</span></button>
<button class="ni" data-v="analytics">${IC.chart}<span class="tip">Analytics</span></button>
<span class="sp"></span>
<button class="ni" data-v="settings">${IC.cog}<span class="tip">Settings</span></button>
</aside>
<div class="main">
<div class="topbar">
<button class="cmdbtn" id="opencmd">${IC.find}<span>Search actions, clips, analytics…</span><span class="sp"></span><kbd>⌘</kbd><kbd>K</kbd></button>
<span class="tsp"></span>
<span class="live"><i></i>Pipeline online</span>
<a class="out" href="/logout">Log out</a>
</div>
<div class="content">
<main class="view" id="view"></main>
<aside class="rpanel">
<div class="slab">System status</div>
<div class="sysrow"><span>Processing queue</span><b id="sysq">0 jobs</b></div>
<div class="sysrow"><span>Render engine</span><b style="color:var(--ok)">Ready</b></div>
<div class="sysrow"><span>TikTok posting</span><b style="color:var(--warn)">In review</b></div>
<div class="sysrow"><span>Stripe billing</span><b style="color:var(--ok)">Live</b></div>
<div class="slab" style="margin-top:24px">AI activity</div>
<div id="syslog">
<div class="logline"><em>[pipeline]</em> vertical encoder warm · 720×1280</div>
<div class="logline"><em>[detect]</em> chat-velocity model loaded</div>
<div class="logline"><em>[worker]</em> session authenticated</div>
</div>
</aside>
</div>
</div>
</div>

<!-- Command palette -->
<div class="ovl" id="cmdovl" role="dialog" aria-modal="true" aria-label="Command palette">
<div class="pal">
<div class="pin">${IC.find}<input id="cmdin" placeholder="Type a command…" autocomplete="off"></div>
<div class="list" id="cmdlist"></div>
<div class="pfoot"><span>ClipFlow</span><span class="rsp"></span><span>navigate <kbd>↑</kbd> <kbd>↓</kbd></span><span>run <kbd>↵</kbd></span><span>close <kbd>esc</kbd></span></div>
</div>
</div>

<!-- Upload / new clip modal -->
<div class="ovl" id="upovl" role="dialog" aria-modal="true" aria-label="Create clip">
<div class="modal">
<h2>Create a clip</h2>
<div class="ms">Paste a Kick VOD link and pick the moment. ClipFlow renders a vertical, TikTok-ready MP4.</div>
<div class="drop" id="drop"><b>Drop a video file</b>or paste a VOD link below</div>
<div class="field"><label for="cu">Kick VOD URL</label><input id="cu" placeholder="https://kick.com/video/…" autocomplete="off"></div>
<div class="f2">
<div class="field"><label for="cs">Start time</label><input id="cs" placeholder="1:42:16 or seconds" autocomplete="off"></div>
<div class="field"><label for="cd">Duration (s)</label><input id="cd" value="34" autocomplete="off"></div>
</div>
<label class="chk"><input type="checkbox" id="cv" checked>Vertical 9:16 (TikTok format)</label>
<div class="prog" id="prog"><i></i></div>
<div class="pstate" id="pstate">Processing AI highlights…</div>
<div class="mrow"><button class="btn" id="upcancel">Cancel</button><button class="btn acc" id="go">Create clip</button></div>
</div>
</div>

<!-- Detect highlights modal -->
<div class="ovl" id="dtovl" role="dialog" aria-modal="true" aria-label="Find viral clips">
<div class="modal">
<h2>Find viral clips</h2>
<div class="ms">ClipFlow scans the VOD's chat for velocity spikes and emote bursts, and suggests the moments worth clipping.</div>
<div class="field"><label for="du">Kick VOD URL</label><input id="du" placeholder="https://kick.com/video/…" autocomplete="off"></div>
<div class="prog" id="dprog"><i></i></div>
<div class="pstate" id="dpstate">Scanning chat activity…</div>
<div id="dres"></div>
<div class="mrow" style="margin-top:16px"><button class="btn" id="dtcancel">Close</button><button class="btn acc" id="dgo">Detect highlights</button></div>
</div>
</div>

<div id="toasts"></div>
<script>
(function(){
var $=function(id){return document.getElementById(id)};
var reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── state ──
var clips=[
 {title:'"NO WAY he hit that shot"',len:'34s',status:'posted',file:null},
 {title:'"Chat called it 10s early"',len:'28s',status:'ready',file:null},
 {title:'"1v4 clutch, lobby silent"',len:'41s',status:'scheduled',file:null}
];
var feed=[
 {dot:'acc',html:'<b>AI caption generated</b> for "1v4 clutch"',when:'2m'},
 {dot:'ok',html:'<b>Clip processed</b> · 28s vertical render',when:'14m'},
 {dot:'warn',html:'<b>TikTok posting</b> queued — API in review',when:'1h'}
];
var queue=0;

function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function toast(m,err){var t=document.createElement('div');t.className='toast'+(err?' err':'');t.innerHTML=m;$('toasts').appendChild(t);setTimeout(function(){t.remove()},7000)}
function log(m){var d=document.createElement('div');d.className='logline';d.innerHTML=m;var sl=$('syslog');sl.insertBefore(d,sl.firstChild);while(sl.children.length>8)sl.removeChild(sl.lastChild)}
function ts(v){v=String(v).trim();if(!v)return 0;if(v.indexOf(':')<0)return parseFloat(v)||0;return v.split(':').reverse().reduce(function(a,x,i){return a+(parseFloat(x)||0)*Math.pow(60,i)},0)}
function fmt(s){s=Math.max(0,Math.round(s));var h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;return (h?h+':':'')+(h?String(m).padStart(2,'0'):m)+':'+String(x).padStart(2,'0')}
function setQ(n){queue=Math.max(0,n);$('sysq').textContent=queue+(queue===1?' job':' jobs')}

// ── overlays ──
function open(id){$(id).classList.add('show');var inp=$(id).querySelector('input');if(inp)setTimeout(function(){inp.focus()},40)}
function close(id){$(id).classList.remove('show')}
['cmdovl','upovl','dtovl'].forEach(function(id){$(id).addEventListener('click',function(e){if(e.target===$(id))close(id)})});
$('upcancel').addEventListener('click',function(){close('upovl')});
$('dtcancel').addEventListener('click',function(){close('dtovl')});
document.addEventListener('keydown',function(e){
if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();open('cmdovl');renderCmd('')}
if(e.key==='Escape'){close('cmdovl');close('upovl');close('dtovl')}
});
$('opencmd').addEventListener('click',function(){open('cmdovl');renderCmd('')});

// ── views ──
function pillFor(st){if(st==='posted')return '<span class="pill post">Posted</span>';if(st==='scheduled')return '<span class="pill warn">Scheduled</span>';if(st==='processing')return '<span class="pill proc"><i></i>Processing</span>';return '<span class="pill ok">Ready</span>'}
function clipRows(){return clips.map(function(c){
var act=c.file?'<a class="dl" href="/api/clip/download?f='+encodeURIComponent(c.file)+'">Download MP4</a>':'<button class="rowact" disabled style="color:var(--dim2)">—</button>';
return '<tr><td><span class="thumb">${IC.clips}</span></td><td><b>'+esc(c.title)+'</b></td><td class="mono">'+esc(c.len)+'</td><td>'+pillFor(c.status)+'</td><td>'+act+'</td></tr>';
}).join('')}
function clipTable(){return '<div class="tblwrap"><table><thead><tr><th></th><th>Clip</th><th>Length</th><th>Status</th><th></th></tr></thead><tbody id="cliptbl">'+clipRows()+'</tbody></table></div>'}
function feedList(){return '<div class="feed">'+feed.map(function(f){return '<div class="ev"><i class="'+f.dot+'"></i><span class="t">'+f.html+'</span><span class="when">'+esc(f.when)+'</span></div>'}).join('')+'</div>'}
var views={
dashboard:function(){return '<h1>Dashboard</h1><div class="sub">Your pipeline at a glance — clip, caption, queue, post.</div>'
+'<div class="slab">Quick actions</div><div class="qgrid">'
+'<button class="qa" data-act="clip"><span class="pi">${IC.upload}</span><span><b>Create a clip</b><span>Cut a moment from a Kick VOD</span></span></button>'
+'<button class="qa" data-act="detect"><span class="pi">${IC.find}</span><span><b>Find viral clips</b><span>AI scan of chat velocity</span></span></button>'
+'<button class="qa" data-act="caption"><span class="pi">${IC.cap}</span><span><b>Generate caption</b><span>Hook lines + hashtags</span></span></button>'
+'<button class="qa" data-act="schedule"><span class="pi">${IC.send}</span><span><b>Schedule post</b><span>Queue for TikTok</span></span></button>'
+'</div>'
+'<div class="slab">Recent clips</div>'+clipTable()
+'<div class="slab">Activity</div>'+feedList()},
clips:function(){return '<h1>Clips</h1><div class="sub">Everything ClipFlow has rendered for this account.</div>'+clipTable()},
scheduler:function(){return '<h1>Scheduler</h1><div class="sub">Queue clips for automatic TikTok posting.</div>'
+'<div class="empty"><span class="pi">${IC.send}</span><b>TikTok posting is in review</b><p>Direct posting unlocks the moment TikTok approves our Content Posting API application. Your queued clips will post automatically.</p><button class="btn" data-act="clip">Prepare a clip meanwhile</button></div>'},
analytics:function(){return '<h1>Analytics</h1><div class="sub">How your clips perform once posting goes live.</div>'
+'<div class="stgrid">'
+'<div class="st"><div class="k">Clips rendered</div><div class="v">'+clips.length+'</div><div class="d up">pipeline active</div></div>'
+'<div class="st"><div class="k">Queued for TikTok</div><div class="v">'+clips.filter(function(c){return c.status==='scheduled'}).length+'</div><div class="d fl">awaiting API approval</div></div>'
+'<div class="st"><div class="k">Avg clip length</div><div class="v">34s</div><div class="d fl">sweet spot 25–45s</div></div>'
+'</div>'
+'<div class="chart"><svg viewBox="0 0 560 140" role="img" aria-label="Chat velocity example"><polyline points="0,110 40,104 80,108 120,96 160,100 200,88 240,30 280,52 320,92 360,86 400,44 440,70 480,94 520,90 560,84" fill="none" stroke="var(--acc)" stroke-width="2"/><line x1="0" y1="120" x2="560" y2="120" stroke="var(--line2)"/><text x="8" y="134" fill="var(--dim2)" font-size="10" font-family="JetBrains Mono">chat velocity — spikes become clips</text></svg></div>'},
settings:function(){return '<h1>Settings</h1><div class="sub">Account and pipeline configuration.</div>'
+'<div class="tblwrap"><table><tbody>'
+'<tr><td><b>Account</b></td><td class="mono">demo@clipflow.app</td><td></td></tr>'
+'<tr><td><b>Plan</b></td><td>Creator — £9.99/month</td><td><span class="pill ok">Active</span></td></tr>'
+'<tr><td><b>Output format</b></td><td>720×1280 vertical MP4</td><td></td></tr>'
+'<tr><td><b>TikTok connection</b></td><td>Content Posting API</td><td><span class="pill warn">In review</span></td></tr>'
+'</tbody></table></div>'}
};
function show(v){
if(v==='upload'){open('upovl');return}
var fn=views[v]||views.dashboard;
$('view').innerHTML=fn();
document.querySelectorAll('.side .ni').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-v')===v)});
}
document.querySelectorAll('.side .ni').forEach(function(b){b.addEventListener('click',function(){show(b.getAttribute('data-v'))})});
document.addEventListener('click',function(e){
var el=e.target.closest('[data-act]');if(!el)return;
var a=el.getAttribute('data-act');
if(a==='clip')open('upovl');
else if(a==='detect')open('dtovl');
else if(a==='caption')toast('<b>Captions run in the pipeline</b> — every rendered clip gets one automatically.');
else if(a==='schedule')show('scheduler');
});

// ── command palette ──
var CMDS=[
{s:'Clipping',n:'Create a clip',k:'clip upload cut vod',run:function(){close('cmdovl');open('upovl')}},
{s:'Clipping',n:'Find viral clips',k:'detect ai highlight scan chat',run:function(){close('cmdovl');open('dtovl')}},
{s:'Publishing',n:'Schedule TikTok post',k:'schedule queue tiktok post',run:function(){close('cmdovl');show('scheduler')}},
{s:'Navigate',n:'Go to Dashboard',k:'dashboard home',run:function(){close('cmdovl');show('dashboard')}},
{s:'Navigate',n:'Go to Clips',k:'clips library',run:function(){close('cmdovl');show('clips')}},
{s:'Navigate',n:'Go to Analytics',k:'analytics stats performance',run:function(){close('cmdovl');show('analytics')}},
{s:'Navigate',n:'Go to Settings',k:'settings account billing',run:function(){close('cmdovl');show('settings')}},
{s:'Account',n:'Log out',k:'logout sign out',run:function(){location.href='/logout'}}
];
var sel=0,shown=[];
function renderCmd(q){
q=q.toLowerCase().trim();
shown=CMDS.filter(function(c){return !q||c.n.toLowerCase().indexOf(q)>-1||c.k.indexOf(q)>-1});
sel=0;var html='',last='';
shown.forEach(function(c,i){
if(c.s!==last){html+='<div class="sect">'+c.s+'</div>';last=c.s}
html+='<div class="prow'+(i===sel?' on':'')+'" data-i="'+i+'"><span class="pn">'+esc(c.n)+'</span></div>';
});
$('cmdlist').innerHTML=html||'<div class="sect">No matching commands</div>';
}
$('cmdin').addEventListener('input',function(){renderCmd(this.value)});
$('cmdin').addEventListener('keydown',function(e){
if(e.key==='ArrowDown'){e.preventDefault();sel=Math.min(sel+1,shown.length-1)}
else if(e.key==='ArrowUp'){e.preventDefault();sel=Math.max(sel-1,0)}
else if(e.key==='Enter'){e.preventDefault();if(shown[sel])shown[sel].run();return}
else return;
document.querySelectorAll('.prow').forEach(function(r,i){r.classList.toggle('on',i===sel)});
});
$('cmdlist').addEventListener('click',function(e){var r=e.target.closest('.prow');if(r&&shown[+r.getAttribute('data-i')])shown[+r.getAttribute('data-i')].run()});

// ── create clip ──
function prog(id,on){$(id).classList.toggle('show',!!on)}
$('go').addEventListener('click',function(){
var url=$('cu').value.trim();
var start=ts($('cs').value);
var dur=parseFloat($('cd').value)||30;
var vert=$('cv').checked;
if(!url){toast('Paste a Kick VOD URL first.',1);$('cu').focus();return}
if(dur<3||dur>180){toast('Duration must be between 3 and 180 seconds.',1);return}
var go=$('go');go.disabled=true;go.textContent='Rendering…';
$('pstate').classList.add('show');$('pstate').textContent='Downloading VOD section and rendering — long VODs can take a minute or two.';
prog('prog',1);setQ(queue+1);
log('<em>[clip]</em> job started · '+fmt(start)+' +'+Math.round(dur)+'s');
fetch('/api/clip',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:url,start:start,duration:dur,vertical:vert})})
.then(function(r){return r.json().then(function(j){return{s:r.status,j:j}})})
.then(function(x){
go.disabled=false;go.textContent='Create clip';prog('prog',0);setQ(queue-1);
$('pstate').classList.remove('show');
if(x.j&&x.j.ok){
var secs=x.j.durationSec?Math.round(x.j.durationSec)+'s':Math.round(dur)+'s';
clips.unshift({title:'Clip @ '+fmt(start),len:secs,status:'ready',file:x.j.name||null});
feed.unshift({dot:'ok',html:'<b>Clip processed</b> · '+secs+' vertical render',when:'now'});
log('<em>[clip]</em> done · '+secs+(x.j.sizeBytes?' · '+(x.j.sizeBytes/1048576).toFixed(1)+' MB':''));
toast('<b>Clip ready</b> — '+secs+(x.j.sizeBytes?' · '+(x.j.sizeBytes/1048576).toFixed(1)+' MB':'')+'. Find it under Clips.');
close('upovl');show('clips');
}else{
log('<em>[clip]</em> failed');
toast('Clip failed: '+esc((x.j&&x.j.error)||('HTTP '+x.s)),1);
}
})
.catch(function(e){go.disabled=false;go.textContent='Create clip';prog('prog',0);setQ(queue-1);$('pstate').classList.remove('show');toast('Request failed: '+esc(e.message),1)});
});

// ── detect highlights ──
$('dgo').addEventListener('click',function(){
var du=$('du').value.trim();
if(!du){toast('Paste a Kick VOD URL first.',1);$('du').focus();return}
var dgo=$('dgo');dgo.disabled=true;dgo.textContent='Scanning…';
$('dpstate').classList.add('show');$('dpstate').textContent='Scanning the chat replay for velocity spikes — long VODs take a minute.';
prog('dprog',1);$('dres').innerHTML='';
log('<em>[detect]</em> chat scan started');
fetch('/api/detect',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:du,top:5})})
.then(function(r){return r.json().then(function(j){return{s:r.status,j:j}})})
.then(function(x){
dgo.disabled=false;dgo.textContent='Detect highlights';prog('dprog',0);
$('dpstate').classList.remove('show');
if(x.j&&x.j.ok&&x.j.highlights&&x.j.highlights.length){
log('<em>[detect]</em> '+x.j.highlights.length+' peaks from '+(x.j.messages||'?')+' msgs');
toast('<b>Found '+x.j.highlights.length+' highlights</b> from '+(x.j.messages||'?')+' chat messages.');
x.j.highlights.forEach(function(h){
var row=document.createElement('div');
row.style.cssText='display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 12px;border:1px solid var(--line);border-radius:var(--r-sm);margin-bottom:8px;font-size:12.5px;color:var(--dim)';
row.innerHTML='<div><span class="mono" style="color:var(--ink)">'+esc(h.ts)+'</span> · score '+esc(h.score)+' · '+esc(h.msgRate)+' msgs'+(h.emoteRate?' · '+esc(h.emoteRate)+' emotes':'')+'</div>';
var b=document.createElement('button');b.className='btn acc';b.style.height='30px';b.textContent='Cut this';
b.addEventListener('click',function(){
$('cu').value=du;$('cs').value=String(h.suggestStart);$('cd').value=String(h.suggestDuration);
close('dtovl');open('upovl');
toast('Prefilled — hit Create clip.');
});
row.appendChild(b);$('dres').appendChild(row);
});
}else{
log('<em>[detect]</em> failed');
toast('Detection failed: '+esc((x.j&&x.j.error)||('HTTP '+x.s)),1);
}
})
.catch(function(e){dgo.disabled=false;dgo.textContent='Detect highlights';prog('dprog',0);$('dpstate').classList.remove('show');toast('Request failed: '+esc(e.message),1)});
});

// ── drop zone (visual affordance → open URL field) ──
$('drop').addEventListener('click',function(){$('cu').focus()});

setQ(0);
show('dashboard');
})();
</script>
</body></html>`;

// ── Router ────────────────────────────────────────────────────────────────────
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const p = url.pathname;
    const html = (b, status = 200, headers = {}) =>
      new Response(b, { status, headers: { 'Content-Type': 'text/html;charset=UTF-8', ...headers } });
    const authed = (request.headers.get('Cookie') || '').includes('cf_demo=1');

    if (p === '/' ) return html(HOME);
    if (p === '/features') return html(FEATURES);
    if (p === '/pricing') return html(PRICING);
    if (p === '/privacy') return html(PRIVACY);
    if (p === '/terms') return html(TERMS);
    if (p === '/logout') return new Response(null, { status: 302, headers: { 'Location': '/', 'Set-Cookie': 'cf_demo=0; Path=/; Max-Age=0' } });
    if (p === '/dashboard') return authed ? html(DASHBOARD) : new Response(null, { status: 302, headers: { 'Location': '/login' } });
    if (p === '/login') {
      if (request.method === 'POST') {
        const form = await request.formData();
        const ok = (form.get('email') || '').trim().toLowerCase() === 'demo@clipflow.app'
          && (form.get('password') || '') === 'ClipFlowDemo2026';
        if (ok) return new Response(null, { status: 302, headers: { 'Location': '/dashboard', 'Set-Cookie': 'cf_demo=1; Path=/; Max-Age=86400; HttpOnly; Secure' } });
        return html(loginPage('That email or password is not right. Demo credentials are shown below.'), 401);
      }
      return authed ? new Response(null, { status: 302, headers: { 'Location': '/dashboard' } }) : html(loginPage());
    }
    if (p === '/api/clip' && request.method === 'POST') {
      if (!authed) return new Response(JSON.stringify({ ok: false, error: 'Not logged in' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
      const body = await request.text();
      const r = await fetch(RAIL + '/clip', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': WSKEY }, body });
      return new Response(await r.text(), { status: r.status, headers: { 'Content-Type': 'application/json' } });
    }
    if (p === '/api/clip/download') {
      if (!authed) return new Response(null, { status: 302, headers: { 'Location': '/login' } });
      const f = url.searchParams.get('f') || '';
      const r = await fetch(RAIL + '/clip/download/' + encodeURIComponent(f), { headers: { 'x-api-key': WSKEY } });
      if (!r.ok) return new Response('Clip not found', { status: r.status });
      return new Response(r.body, { status: 200, headers: { 'Content-Type': 'video/mp4', 'Content-Disposition': 'attachment; filename="' + f.replace(/[^\w.-]/g, '') + '"' } });
    }
    if (p === '/api/detect' && request.method === 'POST') {
      if (!authed) return new Response(JSON.stringify({ ok: false, error: 'Not logged in' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
      const body = await request.text();
      const r = await fetch(RAIL + '/detect', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': WSKEY }, body });
      return new Response(await r.text(), { status: r.status, headers: { 'Content-Type': 'application/json' } });
    }
    if (['/tiktoky0q4dNmzX45pmh3mSQtLGJUz8888D7et','/tiktoky0q4dNmzX45pmh3mSQtLGJUz8888D7et.txt','/.well-known/tiktoky0q4dNmzX45pmh3mSQtLGJUz8888D7et'].includes(p)) return new Response('tiktok-developers-site-verification=y0q4dNmzX45pmh3mSQtLGJUz8888D7et', { status: 200, headers: { 'Content-Type': 'text/plain' } });
    return html(page('Not found', `<div class="wrap hero"><h1>Page not found</h1><p class="sub">That page does not exist. <a href="/" style="border-bottom:1px solid var(--line)">Back to home</a></p></div>`), 404);
  }
};
