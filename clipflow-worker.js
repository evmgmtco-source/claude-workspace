// ClipFlow — multi-page site (TikTok review compliant)
// Routes: / /features /pricing /privacy /terms /login /dashboard /logout
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
${BRAND.fonts}<style>${BRAND.css}</style></head><body>
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
<h1>Your best stream moments,<br>clipped for TikTok.</h1>
<p class="sub">ClipFlow watches your Kick streams, finds the moments chat went wild, and turns them into vertical, caption-ready clips for TikTok. You stream — the highlights handle themselves.</p>
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

const DASHBOARD = page('Dashboard', `
<div class="wrap" style="padding:48px 24px 20px">
<div class="eyebrow">Dashboard · demo account</div>
<h1 style="font-size:34px">Welcome back, Demo</h1>
<div class="grid" style="margin-top:26px">
<div class="card"><div class="tag mono" style="font-size:10px;letter-spacing:2px;color:var(--kick);text-transform:uppercase">Kick channel</div><h3 style="margin-top:8px">demo_streamer <span class="pill ok">connected</span></h3><p>Monitoring live streams</p></div>
<div class="card"><div class="tag mono" style="font-size:10px;letter-spacing:2px;color:var(--tt-c);text-transform:uppercase">TikTok account</div><h3 style="margin-top:8px">@demostreamer <span class="pill q">beta</span></h3><p>Posting via official API (in review)</p></div>
<div class="card"><div class="tag mono" style="font-size:10px;letter-spacing:2px;color:var(--dim);text-transform:uppercase">This week</div><h3 style="margin-top:8px">7 clips · 3 posted</h3><p>Next scheduled post: 19:00 today</p></div>
</div>
</div>
<section><div class="wrap">
<h2>Recent clips</h2>
<table>
<tr><th>Clip</th><th>Detected</th><th>Length</th><th>Status</th></tr>
<tr><td>"NO WAY he hit that shot"</td><td class="mono">Tue 01:42:16</td><td>34s</td><td><span class="pill ok">Posted</span></td></tr>
<tr><td>"Chat called it 10 seconds early"</td><td class="mono">Tue 00:58:03</td><td>28s</td><td><span class="pill ok">Posted</span></td></tr>
<tr><td>"1v4 clutch, full lobby silent"</td><td class="mono">Mon 22:15:47</td><td>41s</td><td><span class="pill q">Scheduled 19:00</span></td></tr>
<tr><td>"New sub raid reaction"</td><td class="mono">Mon 21:03:12</td><td>22s</td><td><span class="pill q">Awaiting review</span></td></tr>
</table>
<p style="margin-top:22px"><a class="btn" href="/logout">Log out</a></p>
</div></section>`);

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
    return html(page('Not found', `<div class="wrap hero"><h1>Page not found</h1><p class="sub">That page does not exist. <a href="/" style="border-bottom:1px solid var(--line)">Back to home</a></p></div>`), 404);
  }
};
