import assert from 'node:assert/strict';
import {getAdapter,findTargets,CdpSession} from './core/src/index.mjs';

const [target]=await findTargets(getAdapter('codex'),9335);
assert.ok(target,'No Codex renderer');
const session=await new CdpSession(target).open();
try{
  const results=await session.evaluate(`(()=>{
    const source=document.querySelector('header:has([data-app-shell-header-toolbar])');
    if(!source)throw Error('No conversation toolbar');
    const fixture=document.createElement('main');
    fixture.className='border-l-hairline';
    fixture.inert=true;
    fixture.style.cssText='position:fixed!important;left:-10000px!important;top:0;width:1600px;height:100px;visibility:hidden;';
    const header=source.cloneNode(true);
    header.style.cssText='position:relative!important;left:0!important;width:100%;';
    fixture.append(header);document.body.append(fixture);
    try{
      const results=[];
      const title=header.querySelector('[data-app-shell-header-toolbar] button.truncate');
      if(!title)throw Error('No title button');
      for(const width of [900,1600,2050]){
        fixture.style.width=width+'px';
        for(const length of [2,12,32]){
          title.textContent='测'.repeat(length);
          for(const edge of ['false','true']){
            header.dataset.appShellHeaderEdgeScroll=edge;
            const groups=[...header.querySelector('[data-app-shell-header-toolbar]').children];
            results.push({width,length,edge,backgrounds:groups.map(e=>getComputedStyle(e).backgroundColor),blur:getComputedStyle(header.querySelector('[data-testid="app-shell-header-context-menu-surface"]'),'::before').backdropFilter});
          }
        }
      }
      return results;
    }finally{fixture.remove();}
  })()`);
  for(const result of results){
    assert.ok(result.backgrounds.every(value=>value==='rgba(0, 0, 0, 0)'),JSON.stringify(result));
    assert.match(result.blur,/^blur\(/);
  }
  console.log(JSON.stringify({pass:true,cases:results.length,widths:[900,1600,2050],titleLengths:[2,12,32],edgeScroll:[false,true]}));
}finally{session.close();}
