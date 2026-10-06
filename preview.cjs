// Lokale Vorschau: node preview.cjs, danach http://localhost:8765
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const port=Number(process.argv[2]||8765);
http.createServer((req,res)=>{
  const name = decodeURIComponent(req.url.split('?')[0]).replace(/^\//,'') || 'mathe_abenteuer_version_4.html';
  if(!['mathe_abenteuer_version_4.html','app.js','themen.js','aufgaben.js','etappen.js','belohnungen.js','belohnungen.css','statistik.js','statistik.css'].includes(name)) {res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css'})[path.extname(name)]+'; charset=utf-8');
  res.setHeader('Cache-Control','no-store');
  res.end(fs.readFileSync(path.join(__dirname,name)));
}).listen(port,'127.0.0.1',()=>console.log(`Vorschau: http://localhost:${port}`));
