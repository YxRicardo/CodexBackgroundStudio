import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFile,spawn} from 'node:child_process';
import {promisify} from 'node:util';
import {ROOT,defaults,validate,makeBundle} from './engine.mjs';
import {createConnectionMonitor,createDiagnosticLog} from './connection-monitor.mjs';
import {listCdpTargets} from './core/src/cdp/session.mjs';
import {getAdapter,probeApp,applyTheme,verifyTheme,watchTheme,resolveThemeTarget,restoreSkin,launchApp,findRunningPids} from './core/src/index.mjs';
const exec=promisify(execFile),adapter=getAdapter('codex'),port=9335,HTTP_PORT=47831,token=crypto.randomBytes(32).toString('hex');
const data=path.join(ROOT,'data');await fs.mkdir(data,{recursive:true});
const autoStartScript=path.join(ROOT,'EnableBackgroundAutoStart.ps1'),disableAutoStartScript=path.join(ROOT,'DisableBackgroundAutoStart.ps1');
const read=async(name,fallback)=>{try{return JSON.parse(await fs.readFile(path.join(data,name),'utf8'));}catch(e){if(e.code==='ENOENT')return fallback;throw e;}};
const write=async(name,value)=>{const dest=path.join(data,name);await fs.writeFile(dest+'.tmp',JSON.stringify(value,null,2));await fs.rename(dest+'.tmp',dest);};
let config=validate(await read('config.json',defaults())),active=await read('active.json',null),previous=await read('previous.json',null),enabled=await read('enabled.json',false),watch=null,watchDone=null,lastError=null,chain=Promise.resolve();
let activeConfig=await read('active-config.json',config);
const diagnosticLog=createDiagnosticLog(path.join(ROOT,'work','connection-diagnostics.jsonl'));
let restarting=false;
const serial=fn=>{const job=chain.then(fn);chain=job.catch(()=>{});return job;};
async function stopWatch(){if(watch){watch.abort();await watchDone;watch=null;watchDone=null;}}
async function startWatch(bundle){await stopWatch();const ctrl=new AbortController();watch=ctrl;watchDone=watchTheme({adapter,targetTheme:resolveThemeTarget(bundle,'codex'),port,signal:ctrl.signal,onEvent:e=>{if(e.type==='error')lastError=e.message;else if(e.type==='injected')lastError=null;}}).catch(e=>{lastError=e.message;});}
async function autoStartStatus(){
 try{
  const {stdout}=await exec('powershell.exe',['-NoProfile','-ExecutionPolicy','Bypass','-File',autoStartScript,'-CheckOnly'],{windowsHide:true});
  return {enabled:Boolean(JSON.parse(stdout).enabled)};
 }catch(e){return {enabled:false,error:e.message};}
}
// watchTheme retries injection when CDP returns. Monitoring is read-only and
// deliberately avoids renderer evaluation (a busy renderer is not a dead app).
const monitorConnection=createConnectionMonitor({
 isEnabled:()=>enabled&&active&&!restarting,
 findPids:()=>findRunningPids(adapter),
 probe:async()=>{const targets=await listCdpTargets(port,1500);if(!targets.some(target=>adapter.matchTarget(target)))throw Error('No matching Codex target; waiting for connection.');},
 log:diagnosticLog,
});
function restartService(){
 if(restarting)return {ok:true,restarting:true};
 restarting=true;
 /* Reply before closing the listener so the control page can show feedback.
    The replacement process starts only after the port is released. */
 setTimeout(async()=>{
  try{await stopWatch();}
  finally{server.close(()=>{const child=spawn(process.execPath,[path.join(ROOT,'app','server.mjs')],{cwd:ROOT,detached:true,stdio:'ignore',windowsHide:true});child.unref();});}
 },120);
 return {ok:true,restarting:true};
}
async function apply(bundle,nextConfig){
 const targetTheme=resolveThemeTarget(bundle,'codex');
 const checks=await probeApp({adapter,targetTheme,port,timeoutMs:2500});
 if(!checks.some(x=>x.result?.compatible))throw Error('当前 Codex 页面不兼容，未应用。');
 await exec('powershell.exe',['-NoProfile','-ExecutionPolicy','Bypass','-File',path.join(ROOT,'app/legacy.ps1'),'-BackupPath',path.join(data,'before-studio.codedrobe-theme')],{windowsHide:true});
 const old=active||await read('before-studio.codedrobe-theme',await read('original.codedrobe-theme',null));
 await stopWatch();
 try{
  const results=await applyTheme({adapter,targetTheme,port,timeoutMs:5000});
  if(!results.some(x=>x.result?.pass)||results.some(x=>x.result?.pass===false))throw Error('主题验证失败，正在恢复上一方案');
  previous={bundle:old,config:activeConfig};await write('previous.json',previous);
  active=bundle;config=nextConfig||config;enabled=true;
  activeConfig=config;await write('active-config.json',activeConfig);await write('active.json',active);await write('config.json',config);await write('enabled.json',true);await startWatch(active);
  return {ok:true,version:bundle.theme.version,results};
 }catch(e){if(old){try{await applyTheme({adapter,targetTheme:resolveThemeTarget(old,'codex'),port,timeoutMs:5000});await startWatch(old);}catch(re){e.message+='；回退失败：'+re.message;}}throw e;}
}
async function body(req){let n=0,parts=[];for await(const b of req){n+=b.length;if(n>28*1024*1024)throw Error('数据超过 28MB');parts.push(b);}return JSON.parse(Buffer.concat(parts).toString()||'{}');}
async function status(){const autoStart=await autoStartStatus();try{const checks=await probeApp({adapter,port,timeoutMs:1400});return {connected:true,compatible:checks.some(x=>x.result?.compatible),enabled,autoStart,theme:active?.theme||null,lastError};}catch(e){return {connected:false,compatible:false,enabled,autoStart,lastError:e.message};}}
async function api(route,b){
 switch(route){
  case '/api/status':return status();
  case '/api/restart':return restartService();
 case '/api/connect':{const s=await status();if(s.connected)return s;await diagnosticLog({type:'manual-connect',action:'launch-or-restart'});await launchApp({adapter,port,restartExisting:true,timeoutMs:30000});return status();}
 case '/api/config':return {config,defaults:defaults(),presets:await read('presets.json',[])};
 case '/api/save':config=validate(b.config);await write('config.json',config);return {ok:true};
 case '/api/apply':return apply(await makeBundle(b.config),validate(b.config));
 case '/api/undo':{if(!previous?.bundle)throw Error('暂无可撤销的应用');const p=previous;return apply(p.bundle,p.config);}
 case '/api/original':{const old=await read('before-studio.codedrobe-theme',await read('original.codedrobe-theme',null));return apply(old,defaults());}
 case '/api/restore':{await stopWatch();enabled=false;await write('enabled.json',false);await exec('powershell.exe',['-NoProfile','-ExecutionPolicy','Bypass','-File',path.join(ROOT,'app/legacy.ps1'),'-BackupPath',path.join(data,'before-studio.codedrobe-theme')],{windowsHide:true});const result=await restoreSkin({adapter,port,timeoutMs:2500});return {ok:result.renderer.restored,result,message:result.host?.changed?'基础配色已还原，请完全退出并重开 Codex 后检查。':'已移除主题层。'};}
 case '/api/autostart-enable':{
  if(!active)throw Error('请先应用一个背景方案，再启用开机恢复。');
  await exec('powershell.exe',['-NoProfile','-ExecutionPolicy','Bypass','-File',autoStartScript],{windowsHide:true});
  enabled=true;await write('enabled.json',true);await startWatch(active);
  return {ok:true,autoStart:await autoStartStatus()};
 }
 case '/api/autostart-disable':{
  await exec('powershell.exe',['-NoProfile','-ExecutionPolicy','Bypass','-File',disableAutoStartScript],{windowsHide:true});
  return {ok:true,autoStart:await autoStartStatus()};
 }
 case '/api/preset':{const c=validate(b.config),ps=await read('presets.json',[]),id=crypto.randomUUID();ps.push({id,name:c.name,config:c});await write('presets.json',ps);return {ok:true,presets:ps};}
 case '/api/delete-preset':{const ps=(await read('presets.json',[])).filter(x=>x.id!==b.id);await write('presets.json',ps);return {ok:true,presets:ps};}
 case '/api/import':{const c=validate(b.value.studioConfig||b.value);return {ok:true,config:c};}
 case '/api/export':{const c=validate(b.config),bundle=await makeBundle(c);const stem='theme-'+Date.now(),file=stem+'.codedrobe-theme',editable=stem+'.json';const serialized=JSON.stringify(bundle);if(Buffer.byteLength(serialized)>30*1024*1024)throw Error('主题包超过 30MB，请缩小图片');await fs.writeFile(path.join(ROOT,'exports',file),serialized);await fs.writeFile(path.join(ROOT,'exports',editable),JSON.stringify(c,null,2));return {ok:true,file,path:path.join(ROOT,'exports',file),editable:path.join(ROOT,'exports',editable)};}
 case '/api/verify':{if(!active)throw Error('请先应用主题');return {ok:true,results:await verifyTheme({adapter,targetTheme:resolveThemeTarget(active,'codex'),port,timeoutMs:2500})};}
 case '/api/pause':await stopWatch();enabled=false;await write('enabled.json',false);return {ok:true};
 default:throw Error('未知操作');
 }
}
const server=http.createServer(async(req,res)=>{
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Cache-Control','no-store');
 try{
  if(req.headers.host!==`127.0.0.1:${HTTP_PORT}`)throw Error('无效主机');
  const url=new URL(req.url,`http://127.0.0.1:${HTTP_PORT}`);
  if(url.pathname.startsWith('/api/')){
   if(req.method!=='POST'||req.headers['x-studio-token']!==token||req.headers.origin&&req.headers.origin!==`http://127.0.0.1:${HTTP_PORT}`) {res.writeHead(403,{'Content-Type':'application/json; charset=utf-8'});return res.end(JSON.stringify({error:'页面连接已过期，请刷新后重试。',code:'SESSION_EXPIRED'}));}
   const b=await body(req),readonly=['/api/status','/api/config','/api/verify'];const result=readonly.includes(url.pathname)?await api(url.pathname,b):await serial(()=>api(url.pathname,b));
   res.setHeader('Content-Type','application/json; charset=utf-8');return res.end(JSON.stringify(result));
  }
  const files={'/':'index.html','/ui.js':'ui.js','/style.css':'style.css','/api-client.mjs':'api-client.mjs'};
  if(!files[url.pathname]){res.writeHead(404);return res.end();}
  const file=files[url.pathname];res.setHeader('Content-Type',file.endsWith('.css')?'text/css':/\.m?js$/.test(file)?'text/javascript':'text/html; charset=utf-8');
  let content=await fs.readFile(path.join(ROOT,'app',file),'utf8');if(file==='index.html')content=content.replace('__TOKEN__',token);res.end(content);
 }catch(e){res.writeHead(400,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify({error:e.message}));}
});
server.on('error',e=>{console.error(e.message);process.exit(1);});
server.listen(HTTP_PORT,'127.0.0.1',async()=>{await write('server.json',{pid:process.pid,port:HTTP_PORT,root:ROOT});console.log('Background Studio http://127.0.0.1:'+HTTP_PORT);await diagnosticLog({type:'service-start',policy:'never-auto-restart'});if(enabled&&active)await startWatch(active);const timer=setInterval(()=>monitorConnection(),5000);timer.unref();});
