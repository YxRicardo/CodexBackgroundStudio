// Run against Codex's Chromium renderer: runtime/node.exe app/verify-question-card.mjs
// Fixtures preserve the native outer card and choice-group hierarchy observed
// on Windows. They contain no conversation content and never submit responses.
import assert from 'node:assert/strict';
import {defaults,makeBundle} from './engine.mjs';
import {getAdapter,findTargets,CdpSession} from './core/src/index.mjs';

const [target]=await findTargets(getAdapter('codex'),9335);
assert.ok(target,'A running Codex renderer on port 9335 is required');
const session=await new CdpSession(target).open();
try {
 const results=[];
 for(const opacity of [0,37,100]) {
  const config={...defaults(),panel:'#123456',panelOpacity:opacity};
  const css=(await makeBundle(config)).targets.codex.css;
  const result=await session.evaluate(`(()=>{
   const frame=document.createElement('iframe');
   frame.style.cssText='position:fixed;left:-10000px;width:800px;height:600px;visibility:hidden';
   document.body.append(frame);
   try {
    const d=frame.contentDocument;
    d.documentElement.className='codedrobe-host-codex';
    const native=d.createElement('style');
    native.textContent='.bg-surface-elevated-secondary{background:rgb(243,249,255)}.border{border:1px solid rgba(32,54,83,.14)}';
    d.head.append(native);
    d.body.innerHTML='<main class="border-l-hairline"><header data-testid="app-shell-header-context-menu-surface"></header><div class="isolate mb-2"><div id="choice" class="flex flex-col overflow-hidden rounded-3xl border border-default bg-surface-elevated-secondary text-default @container/request-card" tabindex="0" data-codex-composer-request-navigation="true"><div><div>Question</div><div class="flex flex-col gap-3 pt-1 pb-2"><div>Title</div><div id="options-parent" class="flex flex-col gap-1 px-2"><div role="radiogroup"><button role="radio" aria-checked="false">Option</button></div><div data-request-input-other-row="true"><div contenteditable="true" role="textbox">Response</div></div></div></div></div></div></div><div id="composer" class="composer-surface-chrome border">Composer</div><div id="unrelated" class="bg-surface-elevated-secondary border">Unrelated surface</div></main>';
    const free=d.getElementById('choice').cloneNode(true);
    free.id='free';free.querySelector('[role="radiogroup"]').remove();
    free.querySelector('#options-parent').removeAttribute('id');
    d.querySelector('main').append(free);
    const style=d.createElement('style');style.textContent=${JSON.stringify(css)};d.head.append(style);
    const read=id=>{const s=frame.contentWindow.getComputedStyle(d.getElementById(id));return {background:s.backgroundColor,border:s.borderColor};};
    return {choice:read('choice'),free:read('free'),composer:read('composer'),inner:read('options-parent'),unrelated:read('unrelated')};
   } finally {frame.remove();}
  })()`);
  assert.deepEqual(result.choice,result.composer);
  assert.deepEqual(result.free,result.composer);
  assert.equal(result.inner.background,'rgba(0, 0, 0, 0)');
  assert.equal(result.unrelated.background,'rgb(243, 249, 255)');
  results.push({opacity,...result});
 }
 const live=await session.evaluate(`(()=>{
  const cards=[...document.querySelectorAll('[data-codex-composer-request-navigation]')].filter(e=>e.checkVisibility({opacityProperty:true,visibilityProperty:true}));
  return cards.map(e=>({background:getComputedStyle(e).backgroundColor,border:getComputedStyle(e).borderColor,hasOptions:!!e.querySelector('[role="radiogroup"]')}));
 })()`);
 console.log(JSON.stringify({pass:true,fixtureCases:results,liveCards:live},null,2));
} finally {session.close();}
