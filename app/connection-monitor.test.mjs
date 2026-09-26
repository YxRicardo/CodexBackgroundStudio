import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {createConnectionMonitor,createDiagnosticLog} from './connection-monitor.mjs';

test('transient and prolonged failures retry and recover with bounded logging',async()=>{
 const events=[];let time=0,fail=true,probes=0;
 const tick=createConnectionMonitor({isEnabled:()=>true,findPids:async()=>[123],probe:async()=>{probes++;if(fail)throw Error('timeout');},log:async e=>events.push(e),now:()=>time});
 for(let i=0;i<25;i++){await tick();time+=5000;}
 assert.equal(probes,25);
 assert.equal(events.filter(e=>e.type==='connection-failed').length,3);
 fail=false;await tick();await tick();
 const recovered=events.filter(e=>e.type==='connection-recovered');
 assert.equal(recovered.length,1);assert.equal(recovered[0].failures,25);
 assert.equal(recovered[0].durationMs,125000);
 assert.ok(events.filter(e=>e.type==='connection-failed').every(e=>e.action==='wait-and-retry'));
});

test('disabled or absent app is not probed; process replacements are recorded',async()=>{
 let enabled=false,pids=[],probes=0;const events=[];
 const tick=createConnectionMonitor({isEnabled:()=>enabled,findPids:async()=>pids,probe:async()=>{probes++;},log:async e=>events.push(e)});
 await tick();assert.equal(events.length,0);
 enabled=true;await tick();await tick();assert.equal(probes,0);
 pids=[12];await tick();pids=[34];await tick();
 assert.deepEqual(events.filter(e=>e.type==='process-change').at(-1),{type:'process-change',previousPids:[12],pids:[34]});
});

test('slow checks do not overlap and monitor resumes after errors',async()=>{
 let release,calls=0;const events=[];
 const tick=createConnectionMonitor({isEnabled:()=>true,findPids:async()=>{calls++;if(calls===1)await new Promise(r=>release=r);if(calls===2)throw Error('enumeration failed');return [1];},probe:async()=>{},log:async e=>events.push(e)});
 const first=tick();await tick();assert.equal(calls,1);release();await first;
 await tick();await tick();assert.equal(calls,3);assert.ok(events.some(e=>e.type==='monitor-error'));
});

test('diagnostic log serializes concurrent writes and rotates',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'studio-diagnostics-'));
 try{
  const file=path.join(dir,'events.jsonl'),log=createDiagnosticLog(file,{maxBytes:1});
  await Promise.all([log({type:'first'}),log({type:'second'})]);
  assert.equal(JSON.parse(await fs.readFile(file+'.1','utf8')).type,'first');
  assert.equal(JSON.parse(await fs.readFile(file,'utf8')).type,'second');
 }finally{await fs.rm(dir,{recursive:true,force:true});}
});

test('forced launch is limited to manual connect and the sign-in recovery callback',async()=>{
 const source=await fs.readFile(new URL('./server.mjs',import.meta.url),'utf8');
 const calls=source.split('\n').filter(line=>line.includes('await launchApp('));
 assert.equal(calls.length,1);assert.ok(calls[0].includes("case '/api/connect'"));
 const recovery=source.split('\n').filter(line=>line.includes('return launchApp('));
 assert.equal(recovery.length,1);assert.ok(recovery[0].includes('launch:()=>serial('));
 assert.ok(source.includes('if(signIn)await recoverAtSignIn('));
});
