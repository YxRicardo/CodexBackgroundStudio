import assert from 'node:assert/strict';
import test from 'node:test';
import {defaults, makeBundle} from './engine.mjs';

test('workspace glass fades at the edges of the main split-header section', async () => {
  const bundle=await makeBundle(defaults());
  const css=bundle.targets.codex.css;

  assert.match(css,/main\.border-l-hairline[^,{]*>header,[^{]*main\.border-l-hairline[^,{]* header\.app-header-tint\{[^}]*backdrop-filter:none!important/);
  assert.match(css,/main\.border-l-hairline[^,{]*>header>div\[class~="flex-1"\],[^{]*main\.border-l-hairline[^,{]* header\.app-header-tint>div\[class~="flex-1"\]\{[^}]*background:transparent!important/);
  assert.match(css,/main\.border-l-hairline[^,{]*>header>div\[class~="flex-1"\]::before,[^{]*main\.border-l-hairline[^,{]* header\.app-header-tint>div\[class~="flex-1"\]::before\{[^}]*radial-gradient\([^}]*rgba\(248,252,255,0\.84\)[^}]*rgba\(248,252,255,0\.42\)[^}]*transparent 100%\)[^}]*backdrop-filter:blur\(18px\)/);
  assert.match(css,/-webkit-mask-image:radial-gradient\([^}]*rgba\(0,0,0,\.72\)[^}]*transparent 100%\)/);
  assert.doesNotMatch(css,/html\.codedrobe-host-codex header\.app-header-tint\{/);
});

test('agent choice questions use the same translucent panel as the composer', async () => {
  const bundle=await makeBundle(defaults());
  const css=bundle.targets.codex.css;

  assert.match(css,/html\.codedrobe-host-codex \[data-codex-composer-request-navigation\]\{background:rgba\(248,252,255,0\.94\)!important;border-color:rgba\(32,54,83,0\.18\)!important;/);
  assert.doesNotMatch(css,/form:has\(\[role="radiogroup"\]\)|div:has\(>\[role="radiogroup"\]\)|data-testid\*="request-user-input"/);
});

test('Markdown file editor uses the same wash strength as assistant replies', async () => {
  const config=defaults();
  config.replyOpacity=37;
  const css=(await makeBundle(config)).targets.codex.css;

  assert.match(css,/\[data-markdown-text-style="assistant-message"\]\{background-color:rgba\(248,252,255,0\.37\)!important/);
  assert.match(css,/\.cm-editor:has\(\.file-editor-heading,\.cm-markdown-list-item,\.cm-markdown-code-line\)\{background-color:rgba\(248,252,255,0\.37\)!important/);
  assert.doesNotMatch(css,/\.cm-editor\{background-color:/);
});

test('the rounded composer body is the only painted new-chat overlay', async () => {
  const bundle=await makeBundle(defaults());
  const css=bundle.targets.codex.css;

  assert.match(css,/_ComposerLayoutRoot_.*?\{background:transparent!important;/);
  assert.match(css,/_ComposerLayoutBody_.*?\{background:rgba\(248,252,255,0\.94\)!important;border-color:rgba\(32,54,83,0\.18\)!important;/);
  assert.doesNotMatch(css,/:has\(\.dream-home\) \[class\*="_ComposerLayoutRoot_"\]/);
});

test('pinned summary popover uses the configured translucent panel wash', async () => {
  const bundle=await makeBundle(defaults());
  const css=bundle.targets.codex.css;

  assert.match(css,/\.bg-surface-elevated-secondary\.rounded-3xl:has\(\[data-slot="thread-summary-panel-item-button"\]\)\{background:rgba\(248,252,255,0\.94\)!important;border-color:rgba\(32,54,83,0\.18\)!important;backdrop-filter:blur\(18px\)/);
  assert.match(css,/header\.bg-surface-elevated-secondary::before\{background:transparent!important/);
  assert.doesNotMatch(css,/data-app-shell-pinned-summary|data-testid\*="pinned-summary"/);
});

test('project new-chat starter cards use the configured translucent panel wash', async () => {
  const bundle=await makeBundle(defaults());
  const css=bundle.targets.codex.css;

  assert.match(css,/section\[class~="group\/home-suggestions"\] button\[class~="bg-surface"\]\[aria-labelledby\]\{background:rgba\(248,252,255,0\.94\)!important;border-color:rgba\(32,54,83,0\.18\)!important;backdrop-filter:blur\(18px\)/);
  assert.doesNotMatch(css,/Explore and understand code|home\.newChatPageSuggestions|codex-explore/);
});

test('background images can be flipped horizontally without changing their asset', async () => {
  const config=defaults();
  config.home.flipX=true;
  const css=(await makeBundle(config)).targets.codex.css;

  assert.match(css,/transform:scaleX\(-1\) scale\(1\)/);
  assert.equal(config.home.flipX,true);
});

test('shared background uses the full-width sidebar and main parent with valid :has()', async () => {
  const config=defaults();
  config.sidebarShared=true;
  const css=(await makeBundle(config)).targets.codex.css;

  assert.match(css,/html\.codedrobe-host-codex div:has\(>aside\.app-shell-left-panel\):has\(>div>main\.border-l-hairline\)\{/);
  assert.doesNotMatch(css,/div:has\(>main\.border-l-hairline:has\(/);
  assert.doesNotMatch(css,/div:has\([^)]*:has\(/);
  assert.match(css,/div:has\(>aside\.app-shell-left-panel\):has\(>div>main\.border-l-hairline\) main\.border-l-hairline[^,{]*::before,[^{]*div:has\(>aside\.app-shell-left-panel\):has\(>div>main\.border-l-hairline\) main\.border-l-hairline[^,{]*::after\{content:none/);
});
