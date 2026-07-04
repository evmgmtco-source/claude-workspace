// ClipFlow — multi-page site (TikTok review compliant)
// Routes: / /features /pricing /privacy /terms /login /dashboard /logout
// API:    POST /api/clip  GET /api/clip/download  (session-gated proxies to the Railway clip pipeline)
const RAIL = 'https://claude-workspace-production-5330.up.railway.app';
const WSKEY = 'claude-ws-8feae020-secret';
const BRAND = {
  css: `
:root{--bg:#0a0a0c;--panel:#101014;--panel2:#16161c;--line:rgba(255,255,255,.08);--line2:rgba(255,255,255,.14);--ink:#f4f4f5;--dim:#9d9da8;--dim2:#6b6b76;--kick:#53fc18;--kick-dim:rgba(83,252,24,.1);--tt-c:#25f4ee;--tt-p:#fe2c55;--r:12px}
*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--ink);font-family:'Inter',system-ui,sans-serif;line-height:1.6;-webkit-font-smoothing:antialiased;font-feature-settings:'cv11','ss01'}
a{color:inherit;text-decoration:none}
.mono{font-family:'JetBrains Mono',monospace}
.wrap{max-width:1120px;margin:0 auto;padding:0 24px}
nav{position:sticky;top:0;z-index:20;background:rgba(10,10,12,.72);backdrop-filter:blur(14px) saturate(1.4);border-bottom:1px solid var(--line)}
nav .wrap{display:flex;align-items:center;gap:28px;height:64px}
.logo{font-weight:800;font-size:18px;letter-spacing:-.5px;display:flex;align-items:center;gap:8px}
.logo .dot{width:22px;height:22px;border-radius:7px;background:linear-gradient(135deg,var(--kick),#2dd865);display:inline-flex;align-items:center;justify-content:center;color:#08130a;font-size:12px;font-weight:900}
nav a.nl{font-size:13.5px;color:var(--dim);font-weight:500;transition:color .15s}nav a.nl:hover{color:var(--ink)}
nav .sp{flex:1}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;padding:0 22px;border-radius:99px;font-weight:600;font-size:14px;border:1px solid var(--line2);background:rgba(255,255,255,.03);transition:transform .15s,border-color .15s,background .15s;cursor:pointer;font-family:inherit;color:var(--ink)}
.btn:hover{transform:translateY(-1px);border-color:var(--dim2);background:rgba(255,255,255,.06)}
.btn.go{background:var(--ink);color:#0a0a0c;border-color:var(--ink);font-weight:700}
.btn.go:hover{background:#fff}
.btn.grn{background:var(--kick);color:#08130a;border-color:var(--kick);font-weight:700}
a:focus-visible,button:focus-visible{outline:2px solid var(--kick);outline-offset:2px}
h1{font-weight:800;font-size:clamp(38px,6.5vw,72px);line-height:1.02;letter-spacing:-.035em}
h1 .grad{background:linear-gradient(92deg,var(--kick) 0%,var(--tt-c) 55%,var(--tt-p) 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
h2{font-weight:700;font-size:clamp(26px,3.5vw,40px);letter-spacing:-.03em;margin-bottom:12px}
h3{font-size:16px;font-weight:600;margin-bottom:6px;letter-spacing:-.01em}
.kicker{display:inline-flex;align-items:center;gap:8px;font-size:12.5px;font-weight:600;color:var(--dim);border:1px solid var(--line);background:var(--panel);border-radius:99px;padding:7px 16px;margin-bottom:26px}
.kicker i{width:6px;height:6px;border-radius:50%;background:var(--kick);display:inline-block;box-shadow:0 0 10px var(--kick)}
.eyebrow{font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--kick);margin-bottom:14px}
.hero{padding:96px 0 72px;position:relative;text-align:center}
.hero::before{content:'';position:absolute;inset:-64px -50vw 0;background:radial-gradient(ellipse 50% 42% at 50% 0%,rgba(83,252,24,.09),transparent 65%),radial-gradient(ellipse 34% 30% at 72% 6%,rgba(37,244,238,.05),transparent 70%);pointer-events:none;z-index:-1}
.hero p.sub{color:var(--dim);font-size:clamp(16px,2vw,19px);max-width:600px;margin:22px auto 34px;line-height:1.65}
.cta{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
.strip{display:flex;align-items:center;justify-content:center;gap:0;margin:60px auto 0;overflow-x:auto;padding-bottom:8px;max-width:820px}
.node{flex:0 0 auto;background:var(--panel);border:1px solid var(--line);border-radius:var(--r);padding:14px 18px;min-width:160px;text-align:left}
.node .tag{font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;margin-bottom:5px}
.node .t1{font-weight:600;font-size:13.5px}
.node .t2{color:var(--dim2);font-size:12px}
.node.k .tag{color:var(--kick)}.node.f .tag{color:var(--ink)}.node.t .tag{background:linear-gradient(90deg,var(--tt-c),var(--tt-p));-webkit-background-clip:text;background-clip:text;color:transparent}
.flow{flex:0 0 auto;width:48px;height:1px;background:linear-gradient(90deg,var(--dim2),var(--line2));position:relative}
.flow::after{content:'';position:absolute;right:0;top:-3px;border:3.5px solid transparent;border-left-color:var(--dim2)}
.preview{margin:64px auto 0;max-width:960px;background:linear-gradient(180deg,rgba(255,255,255,.05),rgba(255,255,255,.015));border:1px solid var(--line2);border-radius:18px;padding:8px;box-shadow:0 0 0 1px rgba(83,252,24,.06),0 30px 80px rgba(0,0,0,.55),0 0 120px rgba(83,252,24,.05);text-align:left}
.preview .pv-bar{display:flex;gap:6px;padding:8px 10px 12px}
.preview .pv-bar i{width:9px;height:9px;border-radius:50%;background:var(--line2);display:block}
.pv{display:grid;grid-template-columns:180px 1fr;background:var(--bg);border:1px solid var(--line);border-radius:12px;overflow:hidden;min-height:300px}
.pv-side{border-right:1px solid var(--line);padding:16px 10px;font-size:12.5px;color:var(--dim)}
.pv-side .l{font-weight:800;color:var(--ink);margin:0 0 14px 8px;font-size:13px}.pv-side .l b{color:var(--kick)}
.pv-side div.i{padding:7px 10px;border-radius:7px;margin-bottom:2px;font-weight:500}
.pv-side div.i.on{background:var(--panel2);color:var(--ink)}
.pv-main{padding:18px}
.pv-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px}
.pv-stat{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:12px}
.pv-stat .k{font-size:10.5px;color:var(--dim2)}.pv-stat .v{font-size:20px;font-weight:800;letter-spacing:-.02em}
.pv-row{display:flex;justify-content:space-between;align-items:center;border:1px solid var(--line);border-radius:10px;padding:10px 14px;margin-bottom:7px;font-size:12.5px;color:var(--dim2)}
.pv-row b{color:var(--ink);font-weight:600}
@media(max-width:640px){.pv{grid-template-columns:1fr}.pv-side{display:none}.pv-stats{grid-template-columns:repeat(2,1fr)}}
section{padding:88px 0;border-top:1px solid var(--line)}
section .lede{color:var(--dim);font-size:16px;max-width:560px;margin-bottom:8px}
.bento{display:grid;grid-template-columns:repeat(6,1fr);gap:14px;margin-top:36px}
.card{background:linear-gradient(180deg,var(--panel2),var(--panel));border:1px solid var(--line);border-radius:16px;padding:26px;position:relative;overflow:hidden;transition:transform .25s ease,border-color .25s ease;grid-column:span 2}
.card:hover{transform:translateY(-3px);border-color:var(--line2)}
.card.w3{grid-column:span 3}.card.w4{grid-column:span 4}.card.w6{grid-column:span 6}
.card::before{content:'';position:absolute;top:0;left:24px;right:24px;height:1px;background:linear-gradient(90deg,transparent,rgba(83,252,24,.35),transparent);opacity:0;transition:opacity .25s}
.card:hover::before{opacity:1}
.card p{color:var(--dim);font-size:14px;line-height:1.6}
.card .ic{width:36px;height:36px;border-radius:10px;background:var(--kick-dim);display:flex;align-items:center;justify-content:center;margin-bottom:16px}
.card .ic svg{width:17px;height:17px;stroke:var(--kick);stroke-width:1.8;fill:none;stroke-linecap:round;stroke-linejoin:round}
.step{font-size:11px;font-weight:800;letter-spacing:.16em;color:var(--kick);margin-bottom:12px}
@media(max-width:820px){.bento{grid-template-columns:1fr 1fr}.card,.card.w3,.card.w4,.card.w6{grid-column:span 2}}
.price{background:linear-gradient(var(--panel2),var(--panel2)) padding-box,linear-gradient(135deg,var(--kick),var(--tt-c) 60%,var(--tt-p)) border-box;border:1px solid transparent;border-radius:20px;padding:38px;max-width:440px;margin:36px auto 0;text-align:left}
.price .amt{font-weight:800;font-size:52px;letter-spacing:-.04em}.price .amt span{font-size:15px;color:var(--dim);font-weight:500;letter-spacing:0}
.price ul{list-style:none;margin:20px 0 26px}.price li{padding:9px 0;color:var(--dim);font-size:14px;border-bottom:1px solid var(--line);display:flex;gap:10px;align-items:center}
.price li::before{content:'';width:16px;height:16px;flex:0 0 16px;border-radius:50%;background:var(--kick-dim) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2353fc18' stroke-width='3' stroke-linecap='round'%3E%3Cpath d='m5 13 4 4 10-10'/%3E%3C/svg%3E") center/9px no-repeat}
.beta{display:inline-block;font-size:10.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;background:linear-gradient(90deg,var(--tt-c),var(--tt-p));-webkit-background-clip:text;background-clip:text;color:transparent;border:1px solid rgba(254,44,85,.3);border-radius:99px;padding:5px 14px;margin-bottom:16px}
footer{border-top:1px solid var(--line);padding:44px 0}
footer .wrap{display:flex;flex-wrap:wrap;gap:24px;align-items:center;color:var(--dim2);font-size:13px}
footer a{color:var(--dim);transition:color .15s}footer a:hover{color:var(--ink)}
.doc{padding:72px 0;max-width:760px;text-align:left}
.doc h1{font-size:clamp(30px,4vw,44px)}
.doc h2{margin-top:36px;font-size:19px}
.doc p,.doc li{color:var(--dim);font-size:15px;margin:10px 0}
.doc ul{padding-left:22px}
.field{margin-bottom:16px;text-align:left}
.field label{display:block;font-size:13px;color:var(--dim);margin-bottom:6px;font-weight:500}
.field input{width:100%;padding:13px 15px;background:var(--panel);border:1px solid var(--line2);border-radius:10px;color:var(--ink);font-size:15px;font-family:inherit;transition:border-color .15s}
.field input:focus{outline:none;border-color:var(--kick)}
.hint{font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--dim);background:var(--panel);border:1px dashed var(--line2);border-radius:10px;padding:14px;margin-top:18px;text-align:left}
.err{color:var(--tt-p);font-size:14px;margin-bottom:14px}
.pill{font-size:11px;padding:3px 10px;border-radius:99px;font-weight:600}
.pill.ok{background:var(--kick-dim);color:var(--kick)}
.pill.q{background:rgba(37,244,238,.1);color:var(--tt-c)}
.rv{opacity:1}
@media(prefers-reduced-motion:no-preference){
.hero .kicker,.hero h1,.hero .sub,.hero .cta{animation:up .55s cubic-bezier(.16,1,.3,1) both}.hero h1{animation-delay:.06s}.hero .sub{animation-delay:.12s}.hero .cta{animation-delay:.18s}
.hero .strip{animation:up .6s cubic-bezier(.16,1,.3,1) both;animation-delay:.26s}
.hero .preview{animation:pin .8s cubic-bezier(.16,1,.3,1) both;animation-delay:.32s}
@keyframes up{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
@keyframes pin{from{opacity:0;transform:translateY(28px) scale(.985)}to{opacity:1;transform:none}}
.rv{opacity:0;transform:translateY(18px);transition:opacity .55s cubic-bezier(.16,1,.3,1),transform .55s cubic-bezier(.16,1,.3,1)}
.rv.in{opacity:1;transform:none}
}
`,
  fonts: `<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">`
};

function page(title, body, activeNote = '') {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} — ClipFlow</title>
<meta name="description" content="ClipFlow finds your best Kick.com stream moments and turns them into TikTok-ready clips.">
${BRAND.fonts}<meta name="tiktok-developers-site-verification" content="y0q4dNmzX45pmh3mSQtLGJUz8888D7et"><style>${BRAND.css}</style></head><body>
<nav><div class="wrap">
<a class="logo" href="/"><span class="dot">▶</span>ClipFlow</a>
<a class="nl" href="/features">Features</a>
<a class="nl" href="/pricing">Pricing</a>
<a class="nl" href="/privacy">Privacy</a>
<a class="nl" href="/terms">Terms</a>
<span class="sp"></span>
<a class="btn" href="/login">Log in</a>
</div></nav>
${body}
<footer><div class="wrap">
<span>© 2026 ClipFlow · operated by EV Management Co</span>
<a href="/privacy">Privacy Policy</a>
<a href="/terms">Terms of Service</a>
<a href="mailto:evmgmtco@gmail.com">Contact: evmgmtco@gmail.com</a>
${activeNote}
</div></footer>
<script>
(function(){
if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
var els=document.querySelectorAll('section .card,section h2,.price');
els.forEach(function(e,i){e.classList.add('rv');e.style.transitionDelay=(i%3)*70+'ms';});
var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target);}});},{threshold:.12});
els.forEach(function(e){io.observe(e)});
})();
</script>
</body></html>`;
}

const HOME = page('Clip once. Post everywhere.', `
<div class="wrap hero">
<div class="kicker"><i></i>Built for Kick.com streamers</div>
<h1>You stream.<br>Your TikTok <span class="grad">posts itself.</span></h1>
<p class="sub">Kick’s clip button gives you a raw horizontal moment — then the real work starts: scrubbing VODs, cropping to 9:16, captioning, uploading, timing the post. ClipFlow does the whole pipeline.</p>
<div class="cta"><a class="btn grn" href="/pricing">Get started — £9.99/mo</a><a class="btn" href="/features">How it works</a></div>
<div class="strip" role="img" aria-label="A clip travels from your Kick stream, through ClipFlow, to TikTok">
<div class="node k"><div class="tag">Kick.com</div><div class="t1">Live stream</div><div class="t2">chat spikes at 01:42:16</div></div>
<div class="flow"></div>
<div class="node f"><div class="tag">ClipFlow</div><div class="t1">Clip cut + captioned</div><div class="t2">9:16 · 34s · auto-titled</div></div>
<div class="flow"></div>
<div class="node t"><div class="tag">TikTok</div><div class="t1">Ready to post</div><div class="t2">scheduled for peak hours</div></div>
</div>
<div class="preview" role="img" aria-label="Preview of the ClipFlow dashboard showing weekly stats and recent clips">
<div class="pv-bar"><i></i><i></i><i></i></div>
<div class="pv">
<div class="pv-side"><div class="l">Clip<b>Flow</b></div><div class="i on">Dashboard</div><div class="i">Clips</div><div class="i">Editor</div><div class="i">Posting</div><div class="i">Analytics</div></div>
<div class="pv-main">
<div class="pv-stats">
<div class="pv-stat"><div class="k">Clips this week</div><div class="v">7</div></div>
<div class="pv-stat"><div class="k">Posted to TikTok</div><div class="v">3</div></div>
<div class="pv-stat"><div class="k">Scheduled</div><div class="v">1</div></div>
</div>
<div class="pv-row"><b>"NO WAY he hit that shot"</b><span>34s · Posted</span></div>
<div class="pv-row"><b>"Chat called it 10s early"</b><span>28s · Posted</span></div>
<div class="pv-row"><b>"1v4 clutch, lobby silent"</b><span>41s · Scheduled 19:00</span></div>
</div>
</div>
</div>
</div>
<section><div class="wrap">
<div class="eyebrow">How it works</div>
<h2>Built for streamers, not editors</h2>
<p class="lede">Three steps between going live and going viral. No CapCut, no OBS plugins, no evenings lost to timelines.</p>
<div class="bento">
<div class="card"><div class="step">01</div><h3>Connect your Kick channel</h3><p>Paste your channel name. ClipFlow starts monitoring your streams and chat activity — no downloads, no OBS plugins.</p></div>
<div class="card"><div class="step">02</div><h3>Highlights get detected</h3><p>Chat velocity, emote bursts and viewer spikes mark your best moments. Each one is cut to a vertical 9:16 clip with captions.</p></div>
<div class="card"><div class="step">03</div><h3>Review and post to TikTok</h3><p>Approve clips from your dashboard and post them to your connected TikTok account, on your schedule.</p></div>
</div>
</div></section>
<section><div class="wrap">
<div class="eyebrow">The alternative</div>
<h2>“Why not just use Kick’s free clip button?”</h2>
<div class="bento">
<div class="card w3"><h3>Kick’s clip button</h3><p>A raw horizontal clip of the last minute — if you remembered to press it live. Then you download it, crop it, caption it, and upload it yourself. The button is free; your evening isn’t.</p></div>
<div class="card w3"><h3>A human clipper</h3><p>Streamers with momentum pay editors £400–£1,500 a month to do exactly this pipeline. It works — it’s just 50–150× the price of ClipFlow.</p></div>
<div class="card w6" style="border-color:rgba(83,252,24,.25)"><h3 style="color:var(--kick)">ClipFlow</h3><p>Highlights found from your VOD, cut vertical with captions, and queued to TikTok for £9.99/month. Less than an hour of an editor’s time — every month, on autopilot.</p></div>
</div>
</div></section>`);

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
<a class="btn grn" href="mailto:evmgmtco@gmail.com?subject=ClipFlow%20early%20access&body=My%20Kick%20channel%20is:%20" style="width:100%">Request early access</a>
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

// ── Dashboard: Linear-style app shell (per CLAUDE.md) ─────────────────────────
const APP_CSS = `
:root{--bg:#0a0a0c;--surface:#101014;--surface2:#16161c;--line:rgba(255,255,255,.07);--line2:rgba(255,255,255,.13);--ink:#f4f4f5;--dim:#9d9da8;--dim2:#63636e;--kick:#53fc18;--kick-dim:rgba(83,252,24,.1);--tt-c:#25f4ee;--tt-p:#fe2c55;--red:#ff5c5c;--r:14px;--r-sm:9px}
*{margin:0;padding:0;box-sizing:border-box}
body{background:var(--bg);color:var(--ink);font-family:'Inter',system-ui,sans-serif;font-size:14px;line-height:1.5;-webkit-font-smoothing:antialiased;font-feature-settings:'cv11'}
a{color:inherit;text-decoration:none}
.mono{font-family:'JetBrains Mono',monospace}
.shell{display:flex;min-height:100vh}
.side{width:224px;flex:0 0 224px;border-right:1px solid var(--line);padding:20px 12px;display:flex;flex-direction:column;gap:2px;position:sticky;top:0;height:100vh}
.side .logo{font-weight:900;font-size:17px;letter-spacing:-.4px;padding:6px 10px 18px}.side .logo b{color:var(--kick)}
.side .lbl{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--dim2);padding:14px 10px 6px;font-weight:700}
.ni{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:var(--r-sm);color:var(--dim);font-weight:500;cursor:pointer;border:none;background:none;width:100%;text-align:left;font-size:14px;font-family:inherit;transition:background .12s,color .12s}
.ni:hover{background:var(--surface2);color:var(--ink)}
.ni.on{background:var(--surface2);color:var(--ink)}
.ni.on svg{stroke:var(--kick)}
.ni svg{width:16px;height:16px;stroke:currentColor;stroke-width:1.8;fill:none;stroke-linecap:round;stroke-linejoin:round;flex:0 0 16px}
.side .foot{margin-top:auto;border-top:1px solid var(--line);padding-top:12px}
.side .user{display:flex;align-items:center;gap:10px;padding:8px 10px}
.side .av{width:28px;height:28px;border-radius:50%;background:var(--kick-dim);color:var(--kick);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px}
.side .un{font-size:13px;font-weight:600}.side .ue{font-size:11px;color:var(--dim2)}
.main{flex:1;min-width:0;padding:32px 40px 64px;max-width:1120px}
.phead{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:28px}
.phead h1{font-size:23px;font-weight:800;letter-spacing:-.025em}
.phead p{color:var(--dim);font-size:13px;margin-top:2px}
.btn{display:inline-flex;align-items:center;gap:8px;padding:9px 16px;border-radius:var(--r-sm);font-weight:600;font-size:13.5px;border:1px solid var(--line2);background:var(--surface);color:var(--ink);cursor:pointer;font-family:inherit;transition:border-color .12s,background .12s}
.btn:hover{border-color:var(--dim2)}
.btn.go{background:var(--kick);border-color:var(--kick);color:#08130a}
.btn.go:hover{filter:brightness(1.06)}
.btn:disabled{opacity:.55;cursor:default}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;margin-bottom:28px}
.stat{background:linear-gradient(180deg,var(--surface2),var(--surface));border:1px solid var(--line);border-radius:var(--r);padding:18px 20px}
.stat .k{font-size:12px;color:var(--dim);margin-bottom:8px}
.stat .v{font-size:28px;font-weight:800;letter-spacing:-.03em}
.stat .d{font-size:12px;color:var(--dim2);margin-top:4px}
.panel{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:24px;margin-bottom:28px}
.panel h2{font-size:15px;font-weight:700;margin-bottom:4px}
.panel .sub{color:var(--dim);font-size:13px;margin-bottom:18px}
.frow{display:flex;gap:14px;flex-wrap:wrap}
.field{margin-bottom:14px;flex:1;min-width:160px}
.field.full{flex:1 1 100%}
.field label{display:block;font-size:12px;color:var(--dim);margin-bottom:6px;font-weight:500}
.field input[type=text],.field input[type=url]{width:100%;padding:10px 12px;background:var(--bg);border:1px solid var(--line2);border-radius:var(--r-sm);color:var(--ink);font-size:14px;font-family:inherit;transition:border-color .12s}
.field input:focus{outline:none;border-color:var(--kick)}
.check{display:flex;gap:8px;align-items:center;color:var(--dim);font-size:13px;cursor:pointer;user-select:none;padding:10px 0}
.check input{accent-color:var(--kick)}
.tbl-wrap{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);overflow:hidden}
table{width:100%;border-collapse:collapse;font-size:13.5px}
th{font-size:10.5px;letter-spacing:1.2px;text-transform:uppercase;color:var(--dim2);text-align:left;padding:12px 20px;border-bottom:1px solid var(--line);font-weight:700}
td{padding:14px 20px;border-bottom:1px solid var(--line)}
tr:last-child td{border-bottom:none}
tr.row:hover td{background:var(--surface2)}
.pill{display:inline-block;font-size:11px;padding:3px 10px;border-radius:20px;font-weight:600}
.pill.ok{background:var(--kick-dim);color:var(--kick)}
.pill.q{background:rgba(37,244,238,.1);color:var(--tt-c)}
.pill.err{background:rgba(255,92,92,.12);color:var(--red)}
.dl{color:var(--kick);font-weight:600;font-size:13px;border-bottom:1px solid transparent}
.dl:hover{border-bottom-color:var(--kick)}
.empty{padding:56px 24px;text-align:center;color:var(--dim)}
.empty .ic{width:40px;height:40px;border-radius:50%;background:var(--surface2);display:flex;align-items:center;justify-content:center;margin:0 auto 14px}
.empty .ic svg{width:18px;height:18px;stroke:var(--dim);stroke-width:1.8;fill:none;stroke-linecap:round}
.empty h3{font-size:14px;color:var(--ink);font-weight:600;margin-bottom:4px}
.empty p{font-size:13px;max-width:340px;margin:0 auto}
.spin{display:inline-block;width:13px;height:13px;border:2px solid rgba(8,19,10,.3);border-top-color:#08130a;border-radius:50%;animation:sp .7s linear infinite;vertical-align:-2px}
@keyframes sp{to{transform:rotate(360deg)}}
#toasts{position:fixed;bottom:24px;right:24px;display:flex;flex-direction:column;gap:10px;z-index:50}
.toast{background:var(--surface2);border:1px solid var(--line2);border-left:3px solid var(--kick);border-radius:var(--r-sm);padding:12px 16px;font-size:13px;min-width:260px;max-width:360px;box-shadow:0 8px 24px rgba(0,0,0,.4);animation:tin .2s ease}
.toast.err{border-left-color:var(--red)}
@keyframes tin{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@media(max-width:860px){.side{display:none}.main{padding:24px 20px}}
.main{position:relative}
.main::before{content:'';position:absolute;top:0;left:0;right:0;height:220px;background:radial-gradient(ellipse 55% 100% at 50% 0%,rgba(83,252,24,.045),transparent 70%);pointer-events:none}
.stat{transition:transform .18s ease,border-color .18s ease}
.stat:hover{transform:translateY(-2px);border-color:var(--line2)}
.btn{min-height:40px}
.btn:active{transform:scale(.98)}
.ni{min-height:38px}
button:focus-visible,a:focus-visible,input:focus-visible{outline:2px solid var(--kick);outline-offset:2px}
.field input:focus-visible{outline:none;border-color:var(--kick)}
@media(prefers-reduced-motion:no-preference){
.stats .stat,.panel,.tbl-wrap{animation:din .45s ease both}
.stats .stat:nth-child(2){animation-delay:.05s}.stats .stat:nth-child(3){animation-delay:.1s}.stats .stat:nth-child(4){animation-delay:.15s}
.panel{animation-delay:.12s}.tbl-wrap{animation-delay:.2s}
@keyframes din{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
}
@media(prefers-reduced-motion:reduce){.spin{animation-duration:1.5s}}
`;
const ICONS = {
  home:'<svg viewBox="0 0 24 24"><path d="M3 10.5 12 4l9 6.5"/><path d="M5 9.5V20h14V9.5"/></svg>',
  clips:'<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m10 9 5 3-5 3z"/></svg>',
  editor:'<svg viewBox="0 0 24 24"><path d="M6 3v18M18 3v18M3 8h6M15 8h6M3 16h6M15 16h6"/></svg>',
  import:'<svg viewBox="0 0 24 24"><path d="M12 3v12m0 0 4-4m-4 4-4-4"/><path d="M4 17v3h16v-3"/></svg>',
  posting:'<svg viewBox="0 0 24 24"><path d="m21 3-9 9"/><path d="M21 3 14 21l-3-8-8-3z"/></svg>',
  analytics:'<svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
  settings:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.6a7 7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 2 1.2L10 21h4l.5-2.6a7 7 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2z"/></svg>'
};
const NAV = [['dashboard','Dashboard','home'],['clips','Clips','clips'],['editor','Editor','editor'],['import','Import','import'],['posting','Posting','posting'],['analytics','Analytics','analytics'],['settings','Settings','settings']];
const DASHBOARD = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Dashboard — ClipFlow</title>
${BRAND.fonts}<meta name="tiktok-developers-site-verification" content="y0q4dNmzX45pmh3mSQtLGJUz8888D7et"><style>${APP_CSS}</style></head><body>
<div class="shell">
<aside class="side">
<a class="logo" href="/">Clip<b>Flow</b></a>
<div class="lbl">Workspace</div>
${NAV.map(([id,label,ic])=>`<button class="ni${id==='dashboard'?' on':''}" data-nav="${id}">${ICONS[ic]}${label}</button>`).join('\n')}
<div class="foot">
<div class="user"><div class="av">D</div><div><div class="un">Demo</div><div class="ue">demo@clipflow.app</div></div></div>
<a class="ni" href="/logout"><svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/></svg>Log out</a>
</div>
</aside>
<main class="main">
<div id="view-dashboard">
<div class="phead"><div><h1>Dashboard</h1><p>Your Kick channel at a glance.</p></div><button class="btn go" id="newclip">+ New clip</button></div>
<div class="stats">
<div class="stat"><div class="k">Clips this week</div><div class="v">7</div><div class="d">+3 vs last week</div></div>
<div class="stat"><div class="k">Posted to TikTok</div><div class="v">3</div><div class="d">via official API (beta)</div></div>
<div class="stat"><div class="k">Scheduled</div><div class="v">1</div><div class="d">next at 19:00 today</div></div>
<div class="stat"><div class="k">Kick channel</div><div class="v" style="font-size:18px;padding-top:5px">demo_streamer</div><div class="d"><span class="pill ok">connected</span></div></div>
</div>
<div class="panel" id="clipper">
<h2>Create a clip</h2>
<p class="sub">Paste a Kick VOD or m3u8 URL and ClipFlow handles the part that eats your evenings: the vertical crop, the render, the TikTok-ready file. No CapCut, no timeline scrubbing.</p>
<div class="field full"><label for="cu">Source URL (Kick VOD / m3u8)</label><input id="cu" type="url" placeholder="https://stream.kick.com/.../master.m3u8"></div>
<div class="frow">
<div class="field"><label for="cs">Start (sec or mm:ss)</label><input id="cs" type="text" value="0"></div>
<div class="field"><label for="cd">Duration (3–180s)</label><input id="cd" type="text" value="30"></div>
<div class="field"><label>&nbsp;</label><label class="check"><input id="cv" type="checkbox" checked> Vertical 9:16 crop</label></div>
</div>
<button id="cgo" class="btn go">Cut clip</button>
</div>
<div class="panel" id="detector" style="margin-top:16px">
<h2>Detected highlights</h2>
<p class="sub">Paste a Kick VOD URL and ClipFlow scans the chat replay for the moments your viewers went off — message-rate spikes and emote bursts, scored against the stream's own baseline.</p>
<div class="field full"><label for="du">Kick VOD URL</label><input id="du" type="url" placeholder="https://kick.com/video/…"></div>
<button id="dgo" class="btn go">Detect highlights</button>
<div id="dres" style="margin-top:14px"></div>
</div>
<h2 style="font-size:15px;font-weight:700;margin-bottom:12px">Recent clips</h2>
<div class="tbl-wrap"><table id="cliptbl">
<thead><tr><th>Clip</th><th>Detected</th><th>Length</th><th>Status</th><th></th></tr></thead>
<tbody>
<tr class="row"><td>"NO WAY he hit that shot"</td><td class="mono">Tue 01:42:16</td><td>34s</td><td><span class="pill ok">Posted</span></td><td></td></tr>
<tr class="row"><td>"Chat called it 10 seconds early"</td><td class="mono">Tue 00:58:03</td><td>28s</td><td><span class="pill ok">Posted</span></td><td></td></tr>
<tr class="row"><td>"1v4 clutch, full lobby silent"</td><td class="mono">Mon 22:15:47</td><td>41s</td><td><span class="pill q">Scheduled 19:00</span></td><td></td></tr>
<tr class="row"><td>"New sub raid reaction"</td><td class="mono">Mon 21:03:12</td><td>22s</td><td><span class="pill q">Awaiting review</span></td><td></td></tr>
</tbody>
</table></div>
</div>
<div id="view-other" style="display:none">
<div class="phead"><div><h1 id="oh">Clips</h1><p id="op"></p></div></div>
<div class="tbl-wrap"><div class="empty">
<div class="ic"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></div>
<h3 id="oeh">Nothing here yet</h3>
<p id="oep">This section is coming soon in early access. Your clips and settings will live here.</p>
</div></div>
</div>
</main>
</div>
<div id="toasts"></div>
<script>
(function(){
var TITLES={clips:['Clips','Every highlight ClipFlow has cut for you.'],editor:['Editor','Trim, reframe and caption clips before posting.'],import:['Import','Bring in Kick VODs and live streams.'],posting:['Posting','Your TikTok export and scheduling queue.'],analytics:['Analytics','How your clips perform after posting.'],settings:['Settings','Channel, account and billing preferences.']};
var vd=document.getElementById('view-dashboard'),vo=document.getElementById('view-other');
document.querySelectorAll('.ni[data-nav]').forEach(function(b){b.addEventListener('click',function(){
document.querySelectorAll('.ni[data-nav]').forEach(function(x){x.classList.remove('on')});b.classList.add('on');
var id=b.getAttribute('data-nav');
if(id==='dashboard'){vd.style.display='';vo.style.display='none';return;}
vd.style.display='none';vo.style.display='';
document.getElementById('oh').textContent=TITLES[id][0];document.getElementById('op').textContent=TITLES[id][1];
document.getElementById('oeh').textContent='Nothing in '+TITLES[id][0].toLowerCase()+' yet';
});});
function toast(m,err){var t=document.createElement('div');t.className='toast'+(err?' err':'');t.textContent=m;document.getElementById('toasts').appendChild(t);setTimeout(function(){t.remove()},6000);}
var go=document.getElementById('cgo');
document.getElementById('newclip').addEventListener('click',function(){document.getElementById('clipper').scrollIntoView({behavior:'smooth'});document.getElementById('cu').focus();});
function ts(v){v=String(v).trim();if(!v)return 0;if(v.indexOf(':')<0)return parseFloat(v)||0;return v.split(':').reverse().reduce(function(a,x,i){return a+(parseFloat(x)||0)*Math.pow(60,i)},0);}
go.addEventListener('click',function(){
var url=document.getElementById('cu').value.trim();
var start=ts(document.getElementById('cs').value);
var dur=parseFloat(document.getElementById('cd').value)||30;
var vert=document.getElementById('cv').checked;
if(!url){toast('Paste a source URL first.',1);document.getElementById('cu').focus();return;}
if(dur<3||dur>180){toast('Duration must be between 3 and 180 seconds.',1);return;}
go.disabled=true;go.innerHTML='<span class="spin"></span> Cutting\u2026';
toast('Cutting your clip \u2014 long VODs can take a minute or two.');
fetch('/api/clip',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:url,start:start,duration:dur,vertical:vert})})
.then(function(r){return r.json().then(function(j){return{s:r.status,j:j}})})
.then(function(x){
go.disabled=false;go.textContent='Cut clip';
if(x.j&&x.j.ok){
var secs=x.j.durationSec?Math.round(x.j.durationSec)+'s':Math.round(dur)+'s';
var tb=document.querySelector('#cliptbl tbody');
var tr=document.createElement('tr');tr.className='row';
tr.innerHTML='<td>New clip</td><td class="mono">just now</td><td>'+secs+'</td><td><span class="pill ok">Ready</span></td><td><a class="dl" href="/api/clip/download?f='+encodeURIComponent(x.j.name)+'">Download MP4</a></td>';
tb.insertBefore(tr,tb.firstChild);
toast('Clip ready \u2014 '+secs+(x.j.sizeBytes?' \u00b7 '+(x.j.sizeBytes/1048576).toFixed(1)+' MB':''));
}else{toast('Clip failed: '+((x.j&&x.j.error)||('HTTP '+x.s)),1);}
})
.catch(function(e){go.disabled=false;go.textContent='Cut clip';toast('Request failed: '+e.message,1);});
});
var dgo=document.getElementById('dgo');
dgo.addEventListener('click',function(){
var du=document.getElementById('du').value.trim();
if(!du){toast('Paste a Kick VOD URL first.',1);return;}
dgo.disabled=true;dgo.innerHTML='<span class="spin"></span> Scanning chat…';
toast('Scanning the chat replay — long VODs take a minute.');
fetch('/api/detect',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:du,top:5})})
.then(function(r){return r.json().then(function(j){return{s:r.status,j:j}})})
.then(function(x){
dgo.disabled=false;dgo.textContent='Detect highlights';
var box=document.getElementById('dres');box.innerHTML='';
if(x.j&&x.j.ok&&x.j.highlights&&x.j.highlights.length){
toast('Found '+x.j.highlights.length+' highlights from '+x.j.messages+' chat messages.');
x.j.highlights.forEach(function(h){
var row=document.createElement('div');
row.style.cssText='display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 12px;border:1px solid var(--line);border-radius:10px;margin-bottom:8px';
row.innerHTML='<div><span class="mono">'+h.ts+'</span> · score '+h.score+' · '+h.msgRate+' msgs'+(h.emoteRate?' · '+h.emoteRate+' emotes':'')+'</div>';
var b=document.createElement('button');b.className='btn go';b.textContent='Cut this';
b.addEventListener('click',function(){
document.getElementById('cu').value=du;
document.getElementById('cs').value=String(h.suggestStart);
document.getElementById('cd').value=String(h.suggestDuration);
document.getElementById('clipper').scrollIntoView({behavior:'smooth'});
toast('Prefilled — hit Cut clip.');
});
row.appendChild(b);box.appendChild(row);
});
}else{toast('Detection failed: '+((x.j&&x.j.error)||('HTTP '+x.s)),1);}
})
.catch(function(e){dgo.disabled=false;dgo.textContent='Detect highlights';toast('Request failed: '+e.message,1);});
});
})();
</script>
</body></html>`;

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
