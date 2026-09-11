import assert from 'node:assert/strict';
import {defaults,validate,makeBundle} from './engine.mjs';
import {getAdapter,findTargets,CdpSession} from './core/src/index.mjs';
const old=defaults();delete old.chatMaxWidth;assert.equal(validate(old).chatMaxWidth,null);
for(const value of [479,2401,NaN,'1000',1000.5])assert.throws(()=>validate({...defaults(),chatMaxWidth:value}));
const [target]=await findTargets(getAdapter('codex'),9335);const s=await new CdpSession(target).open();
try{
 const results=[];
 for(const width of [480,1000,2400]){
  const css=(await makeBundle({...defaults(),chatMaxWidth:width})).targets.codex.css.split('\n')[0];
  const result=await s.evaluate(`(()=>{const style=document.createElement('style');style.textContent=${JSON.stringify(css)};document.head.append(style);try{const e=document.querySelector('[data-markdown-text-style="assistant-message"]');return {token:getComputedStyle(e).getPropertyValue('--thread-content-max-width'),width:e.getBoundingClientRect().width,viewport:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth}}finally{style.remove()}})()`);
  assert.equal(result.token,String(width)+'px');assert.equal(result.overflow,false);results.push({setting:width,...result});
 }
 assert.ok(results[1].width>results[0].width);console.log(JSON.stringify({pass:true,results},null,2));
}finally{s.close()}
