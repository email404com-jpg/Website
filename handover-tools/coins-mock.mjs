import http from "node:http";
const bal = {}; const seen = new Set();
http.createServer((req,res)=>{ let b=""; req.on("data",d=>b+=d); req.on("end",()=>{
 const u=new URL(req.url,"http://x"); const m=u.pathname.match(/users\/([^/]+)\/(balance|adjust)$/);
 console.log(req.method,u.pathname,req.headers.authorization,b); res.setHeader("content-type","application/json");
 if(!m||req.headers.authorization!=="Bearer testkey"){res.statusCode=404;return res.end("{}");}
 const id=m[1]; bal[id]??=12450;
 if(m[2]==="balance") return res.end(JSON.stringify({user_id:id,balance:{coins:bal[id]}}));
 const j=JSON.parse(b); if(seen.has(j.idempotency_key)) return res.end(JSON.stringify({duplicate:true}));
 seen.add(j.idempotency_key); bal[id]+=j.amount; res.end(JSON.stringify({ok:true,balance:bal[id]}));
});}).listen(3200);
