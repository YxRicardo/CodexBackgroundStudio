// Run with Codex Settings > General open. Never changes native settings values.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {getAdapter,findTargets,CdpSession,captureScreenshot} from './core/src/index.mjs';
import {SETTINGS_SURFACE,defaults,makeBundle} from './engine.mjs';

const adapter=getAdapter('codex');
const [target]=await findTargets(adapter,9335);
const session=await new CdpSession(target).open();
const probe=()=>session.evaluate(`(()=>{
 const e=document.querySelector(${JSON.stringify(SETTINGS_SURFACE)});
 if(!e)return null;
 const style=getComputedStyle(e),scroll=e.querySelector('.scrollbar-stable.overflow-y-auto.p-panel');
 const r=e.getBoundingClientRect();
 return {background:style.backgroundColor,blur:style.backdropFilter,opacity:style.opacity,
   rect:[r.x,r.y,r.width,r.height],scrollable:scroll.scrollHeight>scroll.clientHeight,
   cards:[...e.querySelectorAll('[style*="--color-background-panel"]')].map(x=>getComputedStyle(x).backgroundColor),
   controls:[...e.querySelectorAll('button')].map(x=>({disabled:x.disabled,checked:x.getAttribute('aria-checked'),opacity:getComputedStyle(x).opacity})),
   overflow:document.documentElement.scrollWidth>innerWidth};
})()`);
const results=[];
try{
 const before=await probe();assert.ok(before,'Open the native settings page first');
 for(const opacity of [0,37,100]){
   const css=(await makeBundle({...defaults(),settingsWash:'#123456',settingsOverlay:opacity,settingsBlur:opacity?12:0})).targets.codex.css;
   // Isolate the settings rule from the complete bundle to preserve the user's look.
   const start=css.indexOf(SETTINGS_SURFACE),rule=css.slice(start,css.indexOf('}',start)+1);
   await session.evaluate(`(()=>{let s=document.getElementById('studio-settings-verification');if(!s){s=document.createElement('style');s.id='studio-settings-verification';document.head.append(s)}s.textContent=${JSON.stringify(rule)}})()`);
   const actual=await probe();
   assert.equal(actual.background,opacity===100?'rgb(18, 52, 86)':`rgba(18, 52, 86, ${opacity/100})`);
   assert.equal(actual.blur,`blur(${opacity?12:0}px)`);
   assert.equal(actual.opacity,'1');
   assert.ok(actual.cards.length>0);
   assert.ok(actual.cards.every(c=>c==='rgba(0, 0, 0, 0)'));
   assert.deepEqual(actual.rect,before.rect);
   assert.deepEqual(actual.controls,before.controls);
   assert.equal(actual.overflow,false);
   results.push({overlay:opacity,...actual});
 }
}finally{
 await session.evaluate(`document.getElementById('studio-settings-verification')?.remove()`);
 session.close();
}
await fs.writeFile(new URL('../work/settings-verification.json',import.meta.url),JSON.stringify(results,null,2));
await captureScreenshot({adapter,port:9335,output:new URL('../work/settings-after.png',import.meta.url).pathname.replace(/^\/([A-Z]:)/,'$1')});
console.log(JSON.stringify({pass:true,opacities:results.map(r=>r.overlay),cards:results[0].cards.length,controls:results[0].controls.length}));
