import assert from 'node:assert/strict';
import {defaults,validate,makeBundle} from './engine.mjs';
import {getAdapter,findTargets,CdpSession} from './core/src/index.mjs';

const old={...defaults(),ink:'#123456'};
assert.equal(validate(old).userInk,old.ink);
assert.equal(validate(old).assistantInk,old.ink);
assert.equal(old.userInk,undefined);
for(const key of ['userInk','assistantInk'])assert.throws(()=>validate({...old,[key]:'red'}));
const config={...old,userInk:'#13579b',assistantInk:'#975321'};
const css=(await makeBundle(config)).targets.codex.css;
const [target]=await findTargets(getAdapter('codex'),9335);
const session=await new CdpSession(target).open();
try{
 const results=await session.evaluate(`(()=>{
  const root=document.documentElement,original=root.className;
  const style=document.createElement('style');style.textContent=${JSON.stringify(css)};
  document.head.append(style);
  try{return ['light','dark'].map(mode=>{
   root.classList.remove('light','dark');root.classList.add(mode);
   return {mode,messages:['[data-markdown-text-tone="user-message"]','[data-markdown-text-style="assistant-message"]'].map(selector=>{
    const el=document.querySelector(selector);if(!el)throw Error('Open a conversation with both message roles');
    return [el,...el.querySelectorAll('p')].map(node=>getComputedStyle(node).color);
   })};
  });}finally{style.remove();root.className=original;}
 })()`);
 for(const result of results){
  assert.ok(result.messages[0].every(color=>color==='rgb(19, 87, 155)'),JSON.stringify(result));
  assert.ok(result.messages[1].every(color=>color==='rgb(151, 83, 33)'),JSON.stringify(result));
 }
 console.log(JSON.stringify({pass:true,results},null,2));
}finally{session.close();}
