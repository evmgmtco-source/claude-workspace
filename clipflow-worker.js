// ClipFlow — multi-page site (TikTok review compliant)
// Routes: / /features /pricing /privacy /terms /login /dashboard /logout
// API:    POST /api/clip  GET /api/clip/download  (session-gated proxies to the Railway clip pipeline)
const RAIL = 'https://claude-workspace-production-5330.up.railway.app';
const WSKEY = 'claude-ws-8feae020-secret';
const BRAND = {
  css: `
:root{--bg:#0e1512;--panel:#141d18;--line:rgba(83,252,24,.14);--ink:#e8f2ea;--dim:#93a89a;--kick:#53fc18;--tt-c:#25f4ee;--tt-p:#fe2c55;--r:10px}
*{margin:0;padding:0;box-sizing:border-box}
body{background:var(--bg);color:var(--ink);font-family:'Archivo',system-ui,sans-serif;line-height:1.6;-webkit-font-smoothing:antialiased}
a{color:inherit;text-decoration:none}
.mono{font-family:'Space Mono',monospace}
.wrap{max-width:1060px;margin:0 auto;padding:0 24px}
nav{position:sticky;top:0;background:rgba(14,21,18,.92);backdrop-filter:blur(8px);border-bottom:1px solid var(--line);z-index:10}
nav .wrap{display:flex;align-items:center;gap:26px;height:62px}
.logo{font-weight:900;font-size:19px;letter-spacing:-.5px}.logo b{color:var(--kick)}
nav a.nl{font-size:14px;color:var(--dim)}nav a.nl:hover{color:var(--ink)}
nav .sp{flex:1}
.btn{display:inline-block;padding:11px 22px;border-radius:var(--r);font-weight:700;font-size:14px;border:1px solid var(--line);transition:transform .15s}
.btn:hover{transform:translateY(-1px)}
.btn.go{background:var(--kick);color:#08130a;border:none}
h1{font-weight:900;font-size:clamp(34px,6vw,58px);line-height:1.05;letter-spacing:-1.5px}
h2{font-weight:900;font-size:clamp(24px,3.5vw,34px);letter-spacing:-.8px;margin-bottom:14px}
h3{font-size:17px;font-weight:700;margin-bottom:6px}
.eyebrow{font-family:'Space Mono',monospace;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:var(--kick);margin-bottom:14px}
.hero{padding:84px 0 60px}
.hero p.sub{color:var(--dim);font-size:18px;max-width:560px;margin:18px 0 30px}
.strip{display:flex;align-items:center;gap:0;margin:54px 0 10px;overflow-x:auto;padding-bottom:8px}
.node{flex:0 0 auto;background:var(--panel);border:1px solid var(--line);border-radius:var(--r);padding:16px 20px;min-width:168px}
.node .tag{font-family:'Space Mono',monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px}
.node .t1{font-weight:700;font-size:14px}
.node .t2{color:var(--dim);font-size:12px}
.node.k .tag{color:var(--kick)}.node.f .tag{color:var(--ink)}.node.t .tag{background:linear-gradient(90deg,var(--tt-c),var(--tt-p));-webkit-background-clip:text;background-clip:text;color:transparent}
.node.t{border-color:rgba(254,44,85,.25)}
.flow{flex:0 0 auto;width:56px;height:2px;background:linear-gradient(90deg,var(--kick),var(--tt-c));position:relative;opacity:.7}
.flow::after{content:'';position:absolute;right:-1px;top:-3px;border:4px solid transparent;border-left-color:var(--tt-c)}
section{padding:56px 0;border-top:1px solid var(--line)}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:16px;margin-top:26px}
.card{background:var(--panel);border:1px solid var(--line);border-radius:var(--r);padding:22px}
.card p{color:var(--dim);font-size:14px}
.step{font-family:'Space Mono',monospace;color:var(--kick);font-size:12px;margin-bottom:10px}
.price{background:var(--panel);border:1px solid var(--line);border-radius:var(--r);padding:34px;max-width:420px;margin-top:26px}
.price .amt{font-weight:900;font-size:44px}.price .amt span{font-size:16px;color:var(--dim);font-weight:400}
.price ul{list-style:none;margin:18px 0 24px}.price li{padding:7px 0;color:var(--dim);font-size:14px;border-bottom:1px solid var(--line)}
.price li::before{content:'✓ ';color:var(--kick)}
.beta{display:inline-block;font-family:'Space Mono',monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;border:1px solid rgba(254,44,85,.4);color:var(--tt-p);border-radius:20px;padding:4px 12px;margin-bottom:14px}
footer{border-top:1px solid var(--line);padding:38px 0;margin-top:60px}
footer .wrap{display:flex;flex-wrap:wrap;gap:22px;align-items:center;color:var(--dim);font-size:13px}
footer a{color:var(--ink);border-bottom:1px solid var(--line)}
.doc{padding:60px 0;max-width:760px}
.doc h2{margin-top:34px;font-size:20px}
.doc p,.doc li{color:var(--dim);font-size:15px;margin:10px 0}
.doc ul{padding-left:22px}
.field{margin-bottom:16px}
.field label{display:block;font-size:13px;color:var(--dim);margin-bottom:6px}
.field input{width:100%;padding:12px 14px;background:var(--bg);border:1px solid var(--line);border-radius:var(--r);color:var(--ink);font-size:15px;font-family:inherit}
.field input:focus{outline:2px solid var(--kick);outline-offset:1px}
.hint{font-family:'Space Mono',monospace;font-size:12px;color:var(--dim);background:var(--bg);border:1px dashed var(--line);border-radius:var(--r);padding:12px;margin-top:16px}
.err{color:var(--tt-p);font-size:14px;margin-bottom:14px}
table{width:100%;border-collapse:collapse;margin-top:14px;font-size:14px}
th{font-family:'Space Mono',monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--dim);text-align:left;padding:10px 12px;border-bottom:1px solid var(--line)}
td{padding:12px;border-bottom:1px solid var(--line)}
.pill{font-size:11px;padding:3px 10px;border-radius:20px;font-weight:700}
.pill.ok{background:rgba(83,252,24,.12);color:var(--kick)}
.pill.q{background:rgba(37,244,238,.1);color:var(--tt-c)}
@media(prefers-reduced-motion:no-preference){.hero h1,.hero .sub,.hero .cta{animation:up .5s ease both}.hero .sub{animation-delay:.08s}.hero .cta{animation-delay:.16s}@keyframes up{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}}
`,
  fonts: `<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;700;900&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">`
};

function page(title, body, activeNote = '') {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} — ClipFlow</title>
<meta name="description" content="ClipFlow finds your best Kick.com stream moments and turns them into TikTok-ready clips.">
${BRAND.fonts}<meta name="tiktok-developers-site-verification" content="y0q4dNmzX45pmh3mSQtLGJUz8888D7et"><style>${BRAND.css}</style></head><body>
<nav><div class="wrap">
<a class="logo" href="/">Clip<b>Flow</b></a>
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
</body></html>`;
}

const HOME = page('Clip once. Post everywhere.', `
<div class="wrap hero">
<div class="eyebrow">For Kick.com streamers</div>
<h1>You stream.<br>Your TikTok posts itself.</h1>
<p class="sub">Kick’s clip button gives you a raw horizontal moment — then the real work starts: scrubbing VODs, cropping to 9:16, captioning, uploading, timing the post. ClipFlow does that whole pipeline, not just the clip.</p>
<div class="cta"><a class="btn go" href="/pricing">See pricing</a> &nbsp; <a class="btn" href="/features">How it works</a></div>
<div class="strip" role="img" aria-label="A clip travels from your Kick stream, through ClipFlow, to TikTok">
<div class="node k"><div class="tag">Kick.com</div><div class="t1">Live stream</div><div class="t2">chat spikes at 01:42:16</div></div>
<div class="flow"></div>
<div class="node f"><div class="tag">ClipFlow</div><div class="t1">Clip cut + captioned</div><div class="t2">9:16 · 34s · auto-titled</div></div>
<div class="flow"></div>
<div class="node t"><div class="tag">TikTok</div><div class="t1">Ready to post</div><div class="t2">scheduled for peak hours</div></div>
</div>
</div>
<section><div class="wrap">
<h2>Built for streamers, not editors</h2>
<div class="grid">
<div class="card"><div class="step">STEP 1</div><h3>Connect your Kick channel</h3><p>Paste your channel name. ClipFlow starts monitoring your streams and chat activity — no downloads, no OBS plugins.</p></div>
<div class="card"><div class="step">STEP 2</div><h3>Highlights get detected</h3><p>Chat velocity, emote bursts and viewer spikes mark your best moments. Each one is cut to a vertical 9:16 clip with captions.</p></div>
<div class="card"><div class="step">STEP 3</div><h3>Review and post to TikTok</h3><p>Approve clips from your dashboard and post them to your connected TikTok account, on your schedule.</p></div>
</div>
</div></section><section><div class="wrap">
<h2>“Why not just use Kick’s free clip button?”</h2>
<div class="grid">
<div class="card"><h3>Kick’s clip button</h3><p>A raw horizontal clip of the last minute — if you remembered to press it live. Then you download it, crop it, caption it, and upload it yourself. The button is free; your evening isn’t.</p></div>
<div class="card"><h3>A human clipper</h3><p>Streamers with momentum pay editors £400–£1,500 a month to do exactly this pipeline. It works — it’s just 50–150× the price of ClipFlow.</p></div>
<div class="card"><h3>ClipFlow</h3><p>Highlights found from your VOD, cut vertical with captions, and queued to TikTok for £9.99/month. Less than an hour of an editor’s time — every month, on autopilot.</p></div>
</div>
</div></section>`);

const FEATURES = page('Features', `
<div class="wrap hero">
<div class="eyebrow">Features</div>
<h1>Everything between<br>the stream and the post.</h1>
</div>
<section><div class="wrap"><div class="grid">
<div class="card"><h3>Highlight detection</h3><p>Chat velocity and emote-burst analysis finds the moments your viewers actually reacted to — not random timestamps.</p></div>
<div class="card"><h3>Vertical auto-crop</h3><p>Clips are reframed to 9:16 with your camera tracked, so faces stay centered on mobile screens.</p></div>
<div class="card"><h3>Auto captions</h3><p>Word-by-word captions rendered in styles that perform on TikTok, with profanity handling you control.</p></div>
<div class="card"><h3>Post scheduling</h3><p>Queue approved clips to post at the hours your audience is on TikTok. One clip a day or ten — your call.</p></div>
<div class="card"><h3>Clip library</h3><p>Every detected highlight is stored for 30 days so you can go back and post an older moment when a game blows up.</p></div>
<div class="card"><h3>TikTok integration <span class="pill q">beta</span></h3><p>Direct posting via TikTok's official Content Posting API. Currently in review — beta users post via one-tap export in the meantime.</p></div>
</div></div></section>`);

const PRICING = page('Pricing', `
<div class="wrap hero">
<div class="eyebrow">Pricing</div>
<h1>One plan. No editors' fees.</h1>
<p class="sub" style="margin-top:14px">A human clipper runs £400+/month. Your own time in CapCut costs every evening. ClipFlow is £9.99.</p>
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
<a class="btn go" href="mailto:evmgmtco@gmail.com?subject=ClipFlow%20early%20access&body=My%20Kick%20channel%20is:%20">Request early access</a>
<p style="color:var(--dim);font-size:12px;margin-top:14px">ClipFlow is in early access while our TikTok integration completes review. Request access and we'll onboard you personally — you're only billed when your account is live.</p>
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
:root{--bg:#0b0f0d;--surface:#111613;--surface2:#161c18;--line:rgba(255,255,255,.07);--line2:rgba(255,255,255,.12);--ink:#eef3ef;--dim:#8b978e;--dim2:#5f6b62;--kick:#53fc18;--kick-dim:rgba(83,252,24,.12);--tt-c:#25f4ee;--tt-p:#fe2c55;--red:#ff5c5c;--r:12px;--r-sm:8px}
*{margin:0;padding:0;box-sizing:border-box}
body{background:var(--bg);color:var(--ink);font-family:'Archivo',system-ui,sans-serif;font-size:14px;line-height:1.5;-webkit-font-smoothing:antialiased}
a{color:inherit;text-decoration:none}
.mono{font-family:'Space Mono',monospace}
.shell{display:flex;min-height:100vh}
.side{width:224px;flex:0 0 224px;border-right:1px solid var(--line);padding:20px 12px;display:flex;flex-direction:column;gap:2px;position:sticky;top:0;height:100vh}
.side .logo{font-weight:900;font-size:17px;letter-spacing:-.4px;padding:6px 10px 18px}.side .logo b{color:var(--kick)}
.side .lbl{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--dim2);padding:14px 10px 6px;font-family:'Space Mono',monospace}
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
.phead h1{font-size:22px;font-weight:700;letter-spacing:-.4px}
.phead p{color:var(--dim);font-size:13px;margin-top:2px}
.btn{display:inline-flex;align-items:center;gap:8px;padding:9px 16px;border-radius:var(--r-sm);font-weight:600;font-size:13.5px;border:1px solid var(--line2);background:var(--surface);color:var(--ink);cursor:pointer;font-family:inherit;transition:border-color .12s,background .12s}
.btn:hover{border-color:var(--dim2)}
.btn.go{background:var(--kick);border-color:var(--kick);color:#08130a}
.btn.go:hover{filter:brightness(1.06)}
.btn:disabled{opacity:.55;cursor:default}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;margin-bottom:28px}
.stat{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:18px 20px}
.stat .k{font-size:12px;color:var(--dim);margin-bottom:8px}
.stat .v{font-size:26px;font-weight:700;letter-spacing:-.6px}
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
th{font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:var(--dim2);text-align:left;padding:12px 20px;border-bottom:1px solid var(--line);font-weight:600}
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
    if (['/tiktoky0q4dNmzX45pmh3mSQtLGJUz8888D7et','/tiktoky0q4dNmzX45pmh3mSQtLGJUz8888D7et.txt','/.well-known/tiktoky0q4dNmzX45pmh3mSQtLGJUz8888D7et'].includes(p)) return new Response('tiktok-developers-site-verification=y0q4dNmzX45pmh3mSQtLGJUz8888D7et', { status: 200, headers: { 'Content-Type': 'text/plain' } });
        return html(page('Not found', `<div class="wrap hero"><h1>Page not found</h1><p class="sub">That page does not exist. <a href="/" style="border-bottom:1px solid var(--line)">Back to home</a></p></div>`), 404);
  }
};
