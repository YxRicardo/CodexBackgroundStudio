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

test('agent choice questions use the same translucent panel as the composer', async () => {
  const bundle=await makeBundle(defaults());
  const css=bundle.targets.codex.css;

  assert.match(css,/html\.codedrobe-host-codex \[data-codex-composer-request-navigation\]\{background:rgba\(248,252,255,0\.94\)!important;border-color:rgba\(32,54,83,0\.18\)!important;/);
  assert.doesNotMatch(css,/form:has\(\[role="radiogroup"\]\)|div:has\(>\[role="radiogroup"\]\)|data-testid\*="request-user-input"/);
});

test('pinned summary popover uses the configured translucent panel wash', async () => {
  const bundle=await makeBundle(defaults());
  const css=bundle.targets.codex.css;

  assert.match(css,/\.bg-surface-elevated-secondary\.rounded-3xl:has\(\[data-slot="thread-summary-panel-item-button"\]\)\{background:rgba\(248,252,255,0\.94\)!important;border-color:rgba\(32,54,83,0\.18\)!important;backdrop-filter:blur\(18px\)/);
  assert.match(css,/header\.bg-surface-elevated-secondary::before\{background:transparent!important/);
  assert.doesNotMatch(css,/data-app-shell-pinned-summary|data-testid\*="pinned-summary"/);
});

test('background images can be flipped horizontally without changing their asset', async () => {
  const config=defaults();
  config.home.flipX=true;
  const css=(await makeBundle(config)).targets.codex.css;

  assert.match(css,/transform:scaleX\(-1\) scale\(1\)/);
  assert.equal(config.home.flipX,true);
});
