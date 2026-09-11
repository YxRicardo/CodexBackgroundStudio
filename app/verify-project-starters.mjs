import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {defaults,makeBundle} from './engine.mjs';
import {getAdapter,findTargets,CdpSession} from './core/src/index.mjs';

// Run with the project new-chat page open. Check the deployed package as well
// as computed styles: source-only tests cannot detect an outdated service.
const config=JSON.parse(await fs.readFile(new URL('../data/active-config.json',import.meta.url)));
const active=JSON.parse(await fs.readFile(new URL('../data/active.json',import.meta.url)));
assert.equal(active.targets.codex.css,(await makeBundle(config)).targets.codex.css,
 'Active theme is stale. Restart the Studio service and reapply the active config.');
const [target]=await findTargets(getAdapter('codex'),9335);
assert.ok(target,'No running Codex renderer was found');
const session=await new CdpSession(target).open();
try{
 const cards=await session.evaluate(`(()=>{
  return [...document.querySelectorAll('main.border-l-hairline section[class~="group/home-suggestions"] button[class~="bg-surface"][aria-labelledby]')]
   .filter(e=>e.checkVisibility()).map(e=>{
    const s=getComputedStyle(e),r=e.getBoundingClientRect();
    return {background:s.backgroundColor,blur:s.backdropFilter,border:s.borderColor,rect:{x:r.x,y:r.y,width:r.width,height:r.height}};
   });
 })()`);
 assert.equal(cards.length,4,'Open the project new-chat page with its four starter cards');
 const rgb=[1,3,5].map(n=>parseInt(config.panel.slice(n,n+2),16)).join(', ');
 const expected=config.panelOpacity===100?`rgb(${rgb})`:`rgba(${rgb}, ${config.panelOpacity/100})`;
 for(const card of cards){
  assert.equal(card.background,expected);
  assert.equal(card.blur,`blur(${config.workspaceHeaderBlur??defaults().workspaceHeaderBlur}px)`);
 }
 await fs.mkdir(new URL('../work/',import.meta.url),{recursive:true});
 await fs.writeFile(new URL('../work/project-starters-verification.json',import.meta.url),JSON.stringify({pass:true,cards},null,2));
 const x=Math.min(...cards.map(c=>c.rect.x)),y=Math.min(...cards.map(c=>c.rect.y));
 const right=Math.max(...cards.map(c=>c.rect.x+c.rect.width)),bottom=Math.max(...cards.map(c=>c.rect.y+c.rect.height));
 const shot=await session.send('Page.captureScreenshot',{format:'png',clip:{x,y,width:right-x,height:bottom-y,scale:1}});
 await fs.writeFile(new URL('../work/project-starters-after.png',import.meta.url),Buffer.from(shot.data,'base64'));
 console.log(JSON.stringify({pass:true,count:cards.length,background:expected,blur:cards[0].blur}));
}finally{session.close();}
