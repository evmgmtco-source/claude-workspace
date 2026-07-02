export default {
  async fetch(request) {
    const cors = { 'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET,OPTIONS','Access-Control-Allow-Headers':'*' };
    if (request.method === 'OPTIONS') return new Response(null,{headers:cors});
    const u = new URL(request.url);
    let target = u.searchParams.get('url');
    if (!target) {
      const p = u.pathname.replace(/^\/+/,'');
      if (!p) return new Response(JSON.stringify({usage:'/api/v1/video/{uuid} or ?url=https://kick.com/...'}),{headers:{...cors,'content-type':'application/json'}});
      target = 'https://kick.com/' + p;
    }
    if (!/^https:\/\/kick\.com\//.test(target)) return new Response('bad target',{status:400,headers:cors});
    const upstream = await fetch(target, { headers: {
      'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      'Accept':'application/json, text/plain, */*','Accept-Language':'en-US,en;q=0.9','Referer':'https://kick.com/'
    }});
    const body = await upstream.text();
    return new Response(body,{status:upstream.status,headers:{...cors,'content-type':upstream.headers.get('content-type')||'application/json','x-upstream-status':String(upstream.status)}});
  }
}
