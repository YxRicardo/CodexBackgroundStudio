import assert from 'node:assert/strict';
import test from 'node:test';
import {defaults, makeBundle} from './engine.mjs';

test('workspace glass is limited to the main section of the split header', async () => {
  const bundle=await makeBundle(defaults());
  const css=bundle.targets.codex.css;

  assert.match(css,/main\.border-l-hairline[^,{]*>header,[^{]*main\.border-l-hairline[^,{]* header\.app-header-tint\{[^}]*backdrop-filter:none!important/);
  assert.match(css,/main\.border-l-hairline[^,{]*>header>div\[class~="flex-1"\],[^{]*main\.border-l-hairline[^,{]* header\.app-header-tint>div\[class~="flex-1"\]\{[^}]*backdrop-filter:blur\(18px\)/);
  assert.doesNotMatch(css,/html\.codedrobe-host-codex header\.app-header-tint\{/);
});
