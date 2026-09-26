import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {buildLaunchArgs, quoteWindowsArgument, startDiscoveredApp} from './core/src/runtime/launcher.mjs';
import codex from './core/src/adapters/codex.mjs';

test('Windows activation arguments preserve spaces, quotes, and trailing backslashes', () => {
  assert.equal(quoteWindowsArgument('a b'), '"a b"');
  assert.equal(quoteWindowsArgument('a"b'), '"a\\"b"');
  assert.equal(quoteWindowsArgument('C:\\a b\\'), '"C:\\a b\\\\"');
  assert.equal(quoteWindowsArgument(''), '""');
});

test('failed process creation rejects instead of crashing with an unhandled error', async () => {
  await assert.rejects(startDiscoveredApp({executable: path.join(os.tmpdir(), 'missing-studio-app', 'app.exe')}, []), /ENOENT/);
});

test('only the main app renderer is themed, excluding Owl utility windows and webviews', () => {
  assert.equal(codex.matchTarget({type:'page',url:'app://-/index.html'}),true);
  for(const url of ['app://-/index.html?initialRoute=%2Favatar-overlay','app://-/detached-window.html?initialRoute=%2Fdetached-window','https://chatgpt.com/']) {
    assert.equal(codex.matchTarget({type:'page',url}),false);
  }
  assert.equal(codex.matchTarget({type:'webview',url:'app://-/index.html'}),false);
});

test('Owl launch preserves the existing profile; legacy and explicit profiles still work', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'studio-launch-'));
  const oldAppData = process.env.APPDATA;
  process.env.APPDATA = root;
  try {
    const options = {adapter: {id: 'codex'}, executable: path.join(root, 'ChatGPT.exe'), port: 9335, platform: 'win32'};
    const flags = ['--remote-debugging-address=127.0.0.1', '--remote-debugging-port=9335'];
    assert.deepEqual(await buildLaunchArgs(options), flags);
    await fs.writeFile(path.join(root, 'owl-shell-runtime.json'), '{}');
    const profile = path.join(root, 'Codex', 'web', 'Codex');
    await fs.mkdir(profile, {recursive: true});
    await fs.writeFile(path.join(profile, 'Preferences'), 'existing state');
    assert.deepEqual(await buildLaunchArgs(options), [...flags, `--user-data-dir=${profile}`]);
    assert.equal(await fs.readFile(path.join(profile, 'Preferences'), 'utf8'), 'existing state');
    const custom = path.join(root, 'custom');
    assert.deepEqual(await buildLaunchArgs({...options, profilePath: custom}), [...flags, `--user-data-dir=${custom}`]);
    assert.deepEqual(await buildLaunchArgs({...options, adapter: {id: 'other'}}), flags);
    delete process.env.APPDATA;
    await assert.rejects(buildLaunchArgs(options), /APPDATA/);
  } finally {
    if (oldAppData === undefined) delete process.env.APPDATA;
    else process.env.APPDATA = oldAppData;
    await fs.rm(root, {recursive: true, force: true});
  }
});
