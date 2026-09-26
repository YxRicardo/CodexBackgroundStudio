import test from 'node:test';
import assert from 'node:assert/strict';
import {recoverAtSignIn} from './signin-recovery.mjs';

function fixture(overrides={}){
 const events=[];let launches=0,waits=0;
 return {events,get launches(){return launches;},get waits(){return waits;},options:{isEnabled:async()=>true,findPids:async()=>[123],probe:async()=>{throw Error('offline');},launch:async()=>{launches++;},log:async e=>events.push(e),wait:async()=>{waits++;},...overrides}};
}
test('sign-in leaves Codex closed until the user opens it',async()=>{
 let polls=0,probes=0;
 const f=fixture({findPids:async()=>++polls<=20?[]:[123],probe:async()=>{probes++;throw Error('offline');}});
 await recoverAtSignIn(f.options);
 assert.equal(f.waits,26);assert.equal(probes,7);assert.equal(f.launches,1);
});
test('Codex never opened means no launch or probe',async()=>{
 let polls=0;
 const f=fixture({isEnabled:async()=>polls<20,findPids:async()=>{polls++;return [];},probe:async()=>assert.fail('absent app probed')});
 await recoverAtSignIn(f.options);assert.equal(f.launches,0);assert.equal(f.waits,20);
});
test('closing Codex during startup does not reopen it',async()=>{
 let polls=0;
 const f=fixture({findPids:async()=>++polls<=6?[123]:[]});
 await recoverAtSignIn(f.options);assert.equal(f.launches,0);
});
test('sign-in connects once after startup grace period when CDP is missing',async()=>{
 const f=fixture();await recoverAtSignIn(f.options);
 assert.equal(f.launches,1);assert.equal(f.waits,6);assert.equal(f.events.at(-1).type,'signin-recovery-complete');
});
test('Codex becoming ready during startup is never restarted',async()=>{
 let calls=0;const f=fixture({probe:async()=>{if(++calls<3)throw Error('starting');}});
 await recoverAtSignIn(f.options);assert.equal(f.launches,0);assert.equal(f.waits,2);
});
test('disabled recovery and cancellation during startup do not launch',async()=>{
 for(const after of [0,2,6]){
  let checks=0;const f=fixture({isEnabled:async()=>++checks<=after});
  await recoverAtSignIn(f.options);assert.equal(f.launches,0);
 }
});
test('failed launch is logged without a restart loop',async()=>{
 let calls=0;const f=fixture({launch:async()=>{calls++;throw Error('launch failed');}});
 await recoverAtSignIn(f.options);assert.equal(calls,1);assert.equal(f.events.at(-1).type,'signin-recovery-failed');
});
