import {createApiClient} from './api-client.mjs';
const $=id=>document.getElementById(id),api=createApiClient(document.querySelector('meta[name="studio-token"]').content);
let config,base,presets=[],region='home',page='home',timer,applying=false,pending=false,hasApplied=false;
function say(text,error=false){$('message').textContent=text;$('message').style.color=error?'#b65048':'#577467';}
async function run(fn){try{await fn();}catch(e){say(e.message,true);}}
const clone=v=>structuredClone(v);
function slider(id,label,min,max,step=1,unit='%'){return `<label class="slider"><div><span>${label}</span><output id="${id}Value"></output></div><input aria-label="${label}" id="${id}" type="range" min="${min}" max="${max}" step="${step}" data-unit="${unit}"></label>`;}
$('imageSliders').innerHTML=slider('x','水平位置',0,100)+slider('y','垂直位置',0,100)+slider('zoom','画面缩放',100,180)+slider('blur','图片模糊',0,30,1,'px');
$('washSliders').innerHTML=slider('opacity','背景不透明度',0,100)+slider('washOpacity','遮罩强度',0,100);
$('globalSliders').innerHTML=slider('panelOpacity','输入框不透明度',0,100)+slider('codeOpacity','代码块不透明度',0,100);
for(const [id,label]of Object.entries({menuBg:'顶部菜单栏背景',menuInk:'顶部菜单栏文字',ink:'主要文字',muted:'次要文字',accent:'强调色',sidebarInk:'侧栏文字',panel:'输入框 / 代码块'})){$('globalColors').insertAdjacentHTML('beforeend',`<div class="color-row"><label>${label}<input aria-label="${label}" id="${id}" type="color"></label></div>`);}
$('sharedSliders').innerHTML=slider('sidebarOverlay','侧栏遮罩强度',0,100)+slider('sidebarBlur','毛玻璃模糊',0,30,1,'px');
$('sidebarShared').onchange=()=>{config.sidebarShared=$('sidebarShared').checked;changed();};
for(const k of ['sidebarOverlay','sidebarBlur'])$(k).oninput=()=>{config[k]=Number($(k).value);changed();};
function fill(){
 config.sidebarShared??=false;config.sidebarOverlay??=0;config.sidebarBlur??=0;
 $('sidebarShared').checked=config.sidebarShared;$('sidebarOverlay').value=config.sidebarOverlay;$('sidebarBlur').value=config.sidebarBlur;
 $('sharedWrap').hidden=region!=='sidebar';
 config.menuBg??=base.menuBg;config.menuInk??=base.menuInk;
 $('name').value=config.name;$('sync').checked=config.sync;
 $('regionControls').hidden=region==='global';$('globalControls').hidden=region!=='global';$('syncWrap').hidden=region!=='chat';
 const r=region==='global'?config:config[region];
 for(const k of region==='global'?['mode','menuBg','menuInk','ink','muted','accent','sidebarInk','panel','panelOpacity','codeOpacity']:['type','color','color2','fit','x','y','zoom','blur','wash','opacity','washOpacity'])$(k).value=r[k];
 $('controlTitle').textContent={home:'首页背景',chat:'对话背景',sidebar:'侧栏背景',global:'配色与面板'}[region];
 document.querySelectorAll('#regions button').forEach(b=>b.classList.toggle('selected',b.dataset.region===region));
 visibility();preview();
}
function visibility(){
 if(region!=='global'){
  const r=config[region];$('sharedSettings').hidden=!config.sidebarShared;$('regionFields').hidden=(region==='chat'&&config.sync)||(region==='sidebar'&&config.sidebarShared);$('uploadBox').hidden=r.type!=='image';$('imageControls').hidden=r.type!=='image';$('color2Wrap').hidden=r.type!=='gradient';
 }
 document.querySelectorAll('input[type=range]').forEach(i=>$(i.id+'Value').textContent=i.value+i.dataset.unit);
}
const rgba=(c,a)=>`rgba(${[1,3,5].map(n=>parseInt(c.slice(n,n+2),16)).join(',')},${a})`;
function paint(el,r){el.style.background=r.color;const art=el.querySelector('.art');Object.assign(art.style,{backgroundColor:r.color,backgroundImage:r.type==='image'?`url("${r.image||'/hero.png'}")`:r.type==='gradient'?`linear-gradient(155deg,${r.color},${r.color2})`:'none',backgroundSize:r.fit,backgroundPosition:`${r.x}% ${r.y}%`,backgroundRepeat:'no-repeat',opacity:r.opacity/100,filter:`blur(${r.blur}px)`,transform:`scale(${r.zoom/100})`});el.querySelector('.wash').style.background=rgba(r.wash,r.washOpacity/100);}
function preview(){
 $('menuPreview').style.background=config.menuBg;$('menuPreview').style.color=config.menuInk;
 const mainRegion=page==='home'||config.sync?config.home:config.chat;
 paint($('mockSidebar'),config.sidebar);paint($('mockMain'),mainRegion);
 $('mock').classList.toggle('shared',config.sidebarShared);
 if(config.sidebarShared){paint($('mock'),mainRegion);$('mockMain').style.background='transparent';$('mockSidebar').style.background=rgba(config.sidebar.wash,config.sidebarOverlay/100);}else{$('mock').style.background='';}
 $('mockSidebar').style.backdropFilter=config.sidebarShared?'blur('+config.sidebarBlur+'px)':'none';
 $('mockSidebar').style.color=config.sidebarInk;$('mockMain').style.color=config.ink;
 $('sampleHome').hidden=page!=='home';$('sampleChat').hidden=page!=='chat';
 document.querySelectorAll('#previewTabs button').forEach(b=>b.classList.toggle('selected',b.dataset.page===page));
 const panel=rgba(config.panel,config.panelOpacity/100);document.querySelector('.mock-header').style.background=panel;document.querySelector('.mock-composer').style.background=panel;
 document.querySelector('.mock-composer b').style.background=config.accent;document.querySelector('.mock-composer b').style.color=config.panel;document.querySelector('pre').style.background=rgba(config.panel,config.codeOpacity/100);
}
function changed(){visibility();preview();say('预览已更新 · 尚未应用');if($('live').checked&&hasApplied){clearTimeout(timer);timer=setTimeout(applyNow,650);}}
async function applyNow(){
 if(applying){pending=true;return;}applying=true;$('apply').disabled=true;const draft=clone(config);say('正在应用并验证…');
 try{const result=await api('apply',{config:draft});hasApplied=true;say('已应用到 Codex · 版本 '+result.version);await check();}
 catch(e){$('live').checked=false;say(e.message,true);pending=false;}
 finally{applying=false;$('apply').disabled=false;if(pending){pending=false;applyNow();}}
}
for(const k of ['type','color','color2','fit','x','y','zoom','blur','wash','opacity','washOpacity'])$(k).addEventListener('input',()=>{config[region][k]=$(k).type==='range'?Number($(k).value):$(k).value;changed();});
for(const k of ['mode','menuBg','menuInk','ink','muted','accent','sidebarInk','panel','panelOpacity','codeOpacity'])$(k).addEventListener('input',()=>{config[k]=$(k).type==='range'?Number($(k).value):$(k).value;changed();});
$('name').oninput=()=>{config.name=$('name').value;changed();};$('sync').onchange=()=>{config.sync=$('sync').checked;changed();};
$('regions').onclick=e=>{const b=e.target.closest('button');if(!b)return;region=b.dataset.region;if(region==='home'||region==='chat')page=region;fill();};
$('previewTabs').onclick=e=>{const b=e.target.closest('button');if(b){page=b.dataset.page;preview();}};
$('imageFile').onchange=()=>run(async()=>{const file=$('imageFile').files[0];if(!file)return;if(file.size>6*1024*1024)throw Error('图片不能超过 6MB');const targetRegion=region;const reader=new FileReader();const data=await new Promise((resolve,reject)=>{reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(Error('图片读取失败'));reader.readAsDataURL(file);});await new Promise((resolve,reject)=>{const image=new Image();image.onload=resolve;image.onerror=()=>reject(Error('图片无法解码'));image.src=data;});config[targetRegion].image=data;$('imageFile').value='';changed();});
$('resetImage').onclick=()=>{config[region].image=null;changed();};
async function check(){const s=await api('status');$('connection').textContent=s.connected?(s.compatible?'Codex 已连接':'当前页面不兼容'):'Codex 未连接';$('dot').style.background=s.connected&&s.compatible?'#5b967c':'#c9a367';$('connection').title=s.lastError||'';return s;}
$('check').onclick=()=>run(check);$('apply').onclick=()=>{clearTimeout(timer);applyNow();};$('live').onchange=()=>{if($('live').checked&&!hasApplied)say('请先点击「应用到 Codex」，之后滑块会自动更新。');};
$('connect').onclick=()=>run(async()=>{say('正在连接 Codex，必要时会重新启动应用…');await api('connect');await check();say('连接检测完成，请点击应用。');});
$('save').onclick=()=>run(async()=>{await api('save',{config});say('草稿已保存到 D:\\Codex_Background\\data');});
function cancelLive(){clearTimeout(timer);pending=false;$('live').checked=false;}
$('undo').onclick=()=>run(async()=>{cancelLive();await api('undo');config=(await api('config')).config;fill();say('已撤销上一次应用。');});
function refreshPresets(){const p=$('preset');while(p.options.length>4)p.remove(4);for(const item of presets)p.add(new Option(item.name,item.id));}
$('savePreset').onclick=()=>run(async()=>{const j=await api('preset',{config});presets=j.presets;refreshPresets();$('preset').value=presets.at(-1).id;say('已收藏当前方案。');});
$('deletePreset').onclick=()=>run(async()=>{if(!presets.some(p=>p.id===$('preset').value))throw Error('请先选择一个自定义预设');presets=(await api('delete-preset',{id:$('preset').value})).presets;refreshPresets();say('自定义预设已删除。');});
$('preset').onchange=()=>{const id=$('preset').value;if(!id)return;cancelLive();config=clone(presets.find(x=>x.id===id)?.config||base);
 if(id==='night'){Object.assign(config,{name:'深海夜色',mode:'dark',ink:'#e2edf6',muted:'#9aaec3',accent:'#85bfb3',panel:'#1a2b40',sidebarInk:'#c7deed'});for(const k of ['home','chat','sidebar'])Object.assign(config[k],{type:'gradient',color:'#152b43',color2:'#0c1729',wash:'#132337',washOpacity:20});}
 if(id==='paper'){Object.assign(config,{name:'暖纸留白',ink:'#534b40',muted:'#8b7f6d',accent:'#9c7154',panel:'#fffaf1',sidebarInk:'#625747'});for(const k of ['home','chat','sidebar'])Object.assign(config[k],{type:'solid',color:k==='sidebar'?'#e8dfcf':'#f5efe3',wash:'#f5efe3',washOpacity:0});}
 fill();say('预设已载入预览，点击应用后生效。');};
$('import').onclick=()=>$('importFile').click();$('importFile').onchange=()=>run(async()=>{const f=$('importFile').files[0];if(!f)return;if(f.size>28*1024*1024)throw Error('文件过大');const j=await api('import',{value:JSON.parse(await f.text())});cancelLive();config=j.config;fill();$('importFile').value='';say('方案已导入预览，点击应用后生效。');});
$('export').onclick=()=>run(async()=>{const j=await api('export',{config});say('已导出主题包及可编辑 JSON：'+j.editable);});
for(const [id,action]of [['original','original'],['restore','restore'],['pause','pause']])$(id).onclick=()=>run(async()=>{cancelLive();const r=await api(action);if(r.ok===false)throw Error('渲染层未能移除：'+(r.result?.renderer?.message||'请连接 Codex 后重试'));if(id==='original'){config=(await api('config')).config;fill();}say(r.message||({original:'已恢复接管前主题。',pause:'已停止自动保持；当前页面效果暂时保留。'}[id]));await check();});
$('verify').onclick=()=>run(async()=>{const j=await api('verify');say(j.results.every(x=>x.result?.pass)?'当前页面验证通过。':'验证发现问题，请检查页面兼容性。',!j.results.every(x=>x.result?.pass));});
await run(async()=>{const j=await api('config');config=j.config;base=j.defaults;presets=j.presets;refreshPresets();fill();await check();});
