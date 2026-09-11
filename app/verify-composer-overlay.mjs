import assert from 'node:assert/strict';
import {getAdapter,findTargets,CdpSession} from './core/src/index.mjs';

const [target]=await findTargets(getAdapter('codex'),9335);
assert.ok(target,'No running Codex renderer was found');
const session=await new CdpSession(target).open();

try{
  const result=await session.evaluate(`(()=>{
    const editor=document.querySelector('.ProseMirror[contenteditable="true"]');
    if(!editor)return {found:false};
    const describe=element=>{
      if(!element)return null;
      const style=getComputedStyle(element),rect=element.getBoundingClientRect();
      return {
        className:element.className,
        backgroundColor:style.backgroundColor,
        borderRadius:style.borderRadius,
        width:rect.width,
        height:rect.height
      };
    };
    return {
      found:true,
      root:describe(editor.closest('[class*="_ComposerLayoutRoot_"]')),
      body:describe(editor.closest('[class*="_ComposerLayoutBody_"]')),
      chrome:describe(editor.closest('.composer-surface-chrome'))
    };
  })()`);

  assert.equal(result.found,true,'The visible composer editor was not found');
  assert.ok(result.root,'ComposerLayoutRoot was not found');
  assert.ok(result.body,'ComposerLayoutBody was not found');
  assert.equal(result.root.backgroundColor,'rgba(0, 0, 0, 0)');
  assert.notEqual(result.body.backgroundColor,'rgba(0, 0, 0, 0)');
  assert.notEqual(result.body.borderRadius,'0px');
  console.log(JSON.stringify({pass:true,...result},null,2));
}finally{
  session.close();
}
