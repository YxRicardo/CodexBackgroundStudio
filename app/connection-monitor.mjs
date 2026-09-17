import fs from 'node:fs/promises';
import path from 'node:path';

// No launcher dependency: an unattended connection check must never stop an app.
export function createConnectionMonitor({isEnabled,findPids,probe,log,now=Date.now}){
 let busy=false,lastPids='',state=null,failures=0,failedAt=null,lastReport=0;
 return async function tick(){
  if(busy||!isEnabled())return;
  busy=true;
  try{
   const pids=(await findPids()).sort((a,b)=>a-b),key=pids.join(',');
   if(key!==lastPids){await log({type:'process-change',previousPids:lastPids?lastPids.split(',').map(Number):[],pids});lastPids=key;}
   if(!pids.length){
    if(state!=='absent')await log({type:'app-absent'});
    state='absent';failures=0;failedAt=null;return;
   }
   try{await probe();}
   catch(error){
    failures++;failedAt??=now();
    if(state!=='disconnected'||now()-lastReport>=60000){
     await log({type:'connection-failed',pids,failures,durationMs:now()-failedAt,message:String(error.message).slice(0,500),action:'wait-and-retry'});
     lastReport=now();
    }
    state='disconnected';return;
   }
   if(state!=='connected')await log({type:state==='disconnected'?'connection-recovered':'connected',pids,failures,durationMs:failedAt===null?0:now()-failedAt});
   state='connected';failures=0;failedAt=null;
  }catch(error){await log({type:'monitor-error',message:String(error.message).slice(0,500)});}
  finally{busy=false;}
 };
}

export function createDiagnosticLog(file,{maxBytes=1024*1024}={}){
 let pending=Promise.resolve();
 return event=>{
  pending=pending.then(async()=>{
   await fs.mkdir(path.dirname(file),{recursive:true});
   const size=await fs.stat(file).then(s=>s.size).catch(e=>{if(e.code==='ENOENT')return 0;throw e;});
   if(size>=maxBytes){
    await fs.rm(file+'.1',{force:true});
    await fs.rename(file,file+'.1');
   }
   await fs.appendFile(file,JSON.stringify({time:new Date().toISOString(),servicePid:process.pid,...event})+'\n');
  }).catch(error=>console.error('Connection diagnostic log:',error.message));
  return pending;
 };
}
