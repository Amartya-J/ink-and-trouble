import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const root=resolve(process.env.SERVE_DIST==='1'?'dist':'.');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.json':'application/json'};
const server=http.createServer(async(req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const path=resolve(root,'.'+pathname+(pathname.endsWith('/')?'index.html':''));if(!path.startsWith(root+sep)||pathname.split('/').some(p=>p.startsWith('.'))){res.writeHead(403);res.end('Forbidden');return;}if(!(await stat(path)).isFile())throw Error();res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(await readFile(path));}catch{res.writeHead(404);res.end('Not found');}});
server.listen(Number(process.env.PORT)||4173,'127.0.0.1',()=>console.log('Ink & Trouble → http://localhost:'+(process.env.PORT||4173)));
