// Read-only renderer checks. Detached fixture documents never enter the app DOM.
import assert from 'node:assert/strict';
import {getAdapter,findTargets,CdpSession,captureScreenshot} from './core/src/index.mjs';
import {buildProbeExpression} from './core/src/runtime/renderer-payload.mjs';

const adapter=getAdapter('codex');
const target=(await findTargets(adapter,9335)).find(t=>t.url==='app://-/index.html');
assert.ok(target,'Open the main Codex window first');
const session=await new CdpSession(target).open();
try {
  const probe=buildProbeExpression(adapter);
  const fixtures=await session.evaluate(`(() => {
    const check=new Function('document','getComputedStyle','innerWidth','innerHeight','return '+${JSON.stringify(probe)});
    return ['main-surface','border-l-hairline','_MainContentSurface_newhash_2',null].map(cls=>{
      const doc=new DOMParser().parseFromString('<main id="hidden"></main><div><aside class="app-shell-left-panel"></aside><div><main id="shell"></main></div></div>','text/html');
      const shell=doc.getElementById('shell');
      if(cls){shell.className=cls;shell.innerHTML='<header><div data-testid="app-shell-header-context-menu-surface"></div></header>'}
      for(const node of doc.querySelectorAll('*'))node.getBoundingClientRect=()=>({width:100,height:100});
      const result=check(doc,()=>({display:'block',visibility:'visible'}),1000,800);
      const selected=doc.querySelector("main:has([data-testid='app-shell-header-context-menu-surface'])");
      return {cls,compatible:result.compatible,correctMain:selected===shell,invalid:result.rootInvalidSelectors};
    });
  })()`);
  for(const f of fixtures){assert.equal(f.compatible,f.cls!==null);assert.equal(f.correctMain,f.cls!==null);assert.deepEqual(f.invalid,[])}
  const live=await session.evaluate(`(() => {
    const main=document.querySelector("main:has([data-testid='app-shell-header-context-menu-surface'])");
    const shell=document.querySelector('div:has(>aside.app-shell-left-panel):has(>div>main)');
    const chrome=document.getElementById('codedrobe-codex-skin-chrome');
    const r=main.getBoundingClientRect(),c=chrome.style;
    return {mainCount:document.querySelectorAll("main:has([data-testid='app-shell-header-context-menu-surface'])").length,
      shellOwnsMain:shell===main.parentElement.parentElement,
      chromeAligned:c.left===Math.round(r.left)+'px'&&c.top===Math.round(r.top)+'px'&&c.width===Math.round(r.width)+'px',
      wallpaper:[main,shell].some(n=>getComputedStyle(n,'::before').backgroundImage!=='none'),
      overflow:document.documentElement.scrollWidth>innerWidth};
  })()`);
  assert.equal(live.mainCount,1);assert.equal(live.shellOwnsMain,true);assert.equal(live.chromeAligned,true);assert.equal(live.wallpaper,true);assert.equal(live.overflow,false);
  console.log(JSON.stringify({pass:true,fixtures,live},null,2));
} finally {session.close()}
await captureScreenshot({adapter,port:9335,output:new URL('../work/compatibility-after.png',import.meta.url).pathname.replace(/^\/([A-Z]:)/,'$1')});
