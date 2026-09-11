import assert from 'node:assert/strict';
import test from 'node:test';
import {defaults, validate, makeBundle} from './engine.mjs';

test('old looks gain independent settings glass without mutating the input', () => {
  const old=defaults();
  for(const key of ['settingsWash','settingsOverlay','settingsBlur'])delete old[key];
  old.panel='#102030';
  const migrated=validate(old);
  assert.equal(migrated.settingsWash,'#102030');
  assert.equal(migrated.settingsOverlay,65);
  assert.equal(migrated.settingsBlur,12);
  assert.equal(old.settingsOverlay,undefined);
  assert.deepEqual(validate(JSON.parse(JSON.stringify(migrated))),migrated);
});

test('settings glass rejects invalid imported values and accepts endpoints', async () => {
  for(const [key,value] of [['settingsWash','red'],['settingsOverlay',-1],['settingsOverlay',101],['settingsOverlay','65'],['settingsBlur',31],['settingsBlur',NaN]]){
    assert.throws(()=>validate({...defaults(),[key]:value}),/设置界面/);
  }
  for(const value of [0,100])await makeBundle({...defaults(),settingsOverlay:value,settingsBlur:value?30:0});
});
