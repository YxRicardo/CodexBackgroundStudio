import {createApiClient} from './api-client.mjs';
const english={
 '为你的 Codex，留一片喜欢的风景':'A view you will love, for your Codex.',
 '正在检查连接…':'Checking connection…','重新检测':'Check again','语言':'Language',
 '你的工作空间':'YOUR WORKSPACE','调出':'Set','你的氛围。':'the mood.','颜色、光影与画面，':'Color, light, and imagery—','都由你来决定。':'all yours to shape.',
 '首页背景':'Home background','对话背景':'Chat background','侧栏背景':'Sidebar background','配色与面板':'Colors & panels',
 '收藏的风景':'SAVED LOOKS','选择预设…':'Choose a preset…','澄蓝浮光':'Azure glow','深海夜色':'Deep sea night','暖纸留白':'Warm paper',
 '＋ 收藏当前方案':'＋ Save current look','删除选中的自定义预设':'Delete selected custom preset','● 全部保存在本机':'● Stored locally',
 '先看见，再应用。':'See it before you apply it.','首页':'Home','对话':'Chat','文件　编辑　视图　帮助':'File  Edit  View  Help',
 '＋ 新任务':'＋ New task','⌕ 搜索':'⌕ Search','▦ 项目':'▦ Projects','最近任务':'RECENT TASKS','我的灵感空间':'My inspiration space','一段新的开始':'A fresh start','探索更多可能':'Explore more',
 '我的工作空间':'My workspace','◧　←　→　　文件　编辑　视图　帮助':'◧  ←  →    File  Edit  View  Help','＋ \u00a0 自动':'＋ \u00a0 Auto','＋   自动 ↑':'＋   Auto ↑','PNG / JPG / WebP · 最大 6MB':'PNG / JPG / WebP · max 6 MB','顶部菜单栏颜色预览':'Top menu color preview',
 '今天，想创造些什么？':'What would you like to create today?','让灵感从这里开始。':'Start where inspiration strikes.','写一个小工具':'Build a small tool','探索一个想法':'Explore an idea',
 '让工作空间变得更舒服。':'Make this workspace more comfortable.','从你喜欢的颜色开始':'Start with colors you love','选择一张图片，留一点光。':'Choose an image. Let in some light.','清晰的文字，也可以和风景共存。':'Clear text can live with a great view.',
 '这是一段用于预览的示例内容。':'Sample content for preview only.','描述你的下一个想法…':'Describe your next idea…','自动':'Auto',
 '◉ 示例预览 · 不读取你的对话':'◉ Sample preview · your chats are never read','实际效果以 Codex 页面为准':'Actual appearance depends on Codex',
 '01 / 选择区域':'01 / PICK A REGION','首页与对话可以拥有不同风景。':'Home and chat can have different looks.','02 / 保持清晰':'02 / KEEP IT CLEAR','增加遮罩强度，让文字更易读。':'Increase the overlay to improve readability.',
 '方案名称':'Look name','与主界面共用背景':'Share the main background','壁纸连续铺满侧栏和主界面。遮罩为 0、模糊为 0 时完全透明。':'Use one continuous wallpaper across the sidebar and main area. With overlay and blur at 0, it is fully transparent.',
 '跟随首页的全部背景设置':'Use all home background settings','背景类型':'Background type','图片':'Image','纯色':'Solid color','渐变':'Gradient','选择一张喜欢的图片':'Choose an image you love','使用内置图片':'Use built-in image','底色':'Base color','渐变末端':'Gradient end','图片适配':'Image fit','填满画面':'Fill frame','完整显示':'Show whole image','水平翻转图片':'Flip image horizontally','遮罩颜色':'Overlay color','色彩模式':'Color mode','浅色':'Light','深色':'Dark',
 '模式调整控件的明暗表现；文字和背景颜色可分别选择。':'The mode adjusts control contrast; text and background colors are chosen independently.','调整后自动应用到 Codex':'Automatically apply changes to Codex','首次使用请先点「应用到 Codex」。':'For first use, select “Apply to Codex”.','自动应用每次操作结束后合并更新。':'Automatic updates are merged after each adjustment.',
 '随心调整，准备好后再应用。':'Adjust freely, then apply when ready.','导入':'Import','导出':'Export','撤销应用':'Undo apply','保存草稿':'Save draft','应用到 Codex ↗':'Apply to Codex ↗',
 '恢复与运行管理':'Recovery & runtime','连接 Codex（必要时重启）':'Connect Codex (restart if needed)','恢复接管前主题':'Restore pre-studio theme','恢复 Codex 原生外观':'Restore native Codex appearance','启用开机恢复':'Enable sign-in recovery','禁用开机恢复':'Disable sign-in recovery','停止自动保持':'Stop automatic persistence','验证当前应用':'Verify current apply',
 '正在检查开机恢复状态…':'Checking sign-in recovery…','开机恢复：已启用':'Sign-in recovery: enabled','开机恢复：未启用':'Sign-in recovery: disabled','已启用开机恢复；登录后会恢复当前已应用的方案。':'Sign-in recovery enabled. Your current applied look will be restored after sign-in.','已禁用开机恢复；当前会话不受影响。':'Sign-in recovery disabled. Your current session is unaffected.','开机恢复会在当前 Windows 用户登录后启动本地服务，并在下次打开 Codex 时恢复已应用的方案。停止自动保持会暂停主题恢复；禁用开机恢复还会删除 Windows 登录启动项。':'Sign-in recovery starts the local service after this Windows user signs in, then restores the applied look when Codex next opens. Stopping persistence pauses theme recovery; disabling sign-in recovery also removes the Windows startup entry.','重启后台服务':'Restart background service','后台正在重启，页面将自动刷新…':'Restarting the background service; this page will refresh…',
 '水平位置':'Horizontal position','垂直位置':'Vertical position','画面缩放':'Image scale','图片模糊':'Image blur','背景不透明度':'Background opacity','遮罩强度':'Overlay strength','输入框不透明度':'Composer opacity','代码块不透明度':'Code block opacity','回复背景不透明度':'Reply background opacity','用户消息背景不透明度':'User message background opacity','顶部菜单栏背景':'Top menu background','顶部菜单栏文字':'Top menu text','主要文字':'Primary text','次要文字':'Secondary text','强调色':'Accent color','侧栏文字':'Sidebar text','输入框 / 代码块 / 消息':'Composer / code block / messages','侧栏遮罩颜色':'Sidebar overlay color','侧栏遮罩强度':'Sidebar overlay strength','毛玻璃模糊':'Frosted-glass blur','顶部工作空间':'WORKSPACE HEADER','调整工作空间标题栏及右侧面板标签栏、工具栏的遮罩和毛玻璃效果。遮罩和模糊均为 0 时完全透明。':'Adjust the workspace header and right panel tab and tool bars. Set overlay and blur to 0 for full transparency.','顶部工作空间遮罩颜色':'Workspace header overlay color','顶部工作空间遮罩强度':'Workspace header overlay strength','顶部工作空间毛玻璃模糊':'Workspace header frosted-glass blur',
 '预览已更新 · 尚未应用':'Preview updated · not applied yet','正在应用并验证…':'Applying and verifying…','已应用到 Codex · 版本 ':'Applied to Codex · version ','请先点击「应用到 Codex」，之后滑块会自动更新。':'Select “Apply to Codex” first; sliders will then update automatically.','图片不能超过 6MB':'Image cannot exceed 6 MB','图片读取失败':'Could not read image','图片无法解码':'Could not decode image','当前页面不兼容':'Current page is incompatible','Codex 已连接':'Codex connected','Codex 未连接':'Codex not connected','正在连接 Codex，必要时会重新启动应用…':'Connecting Codex; the app may restart if needed…','连接检测完成，请点击应用。':'Connection check complete. Select Apply.','草稿已保存到 D:\\Codex_Background\\data':'Draft saved to D:\\Codex_Background\\data','已撤销上一次应用。':'Last apply undone.','已收藏当前方案。':'Current look saved.','请先选择一个自定义预设':'Choose a custom preset first','自定义预设已删除。':'Custom preset deleted.','预设已载入预览，点击应用后生效。':'Preset loaded into preview. Select Apply to use it.','文件过大':'File is too large','方案已导入预览，点击应用后生效。':'Look imported into preview. Select Apply to use it.','已导出主题包及可编辑 JSON：':'Theme package and editable JSON exported:','当前页面验证通过。':'Current page verification passed.','验证发现问题，请检查页面兼容性。':'Verification found an issue. Check page compatibility.'
};
english['PNG / JPG / WebP · 最大 6MB；超限 PNG/JPG 自动压缩']='PNG / JPG / WebP · max 6 MB; large PNGs and JPEGs are compressed automatically';
const chinese=Object.fromEntries(Object.entries(english).map(([zh,en])=>[en,zh]));
let locale=localStorage.getItem('background-studio-language')||'en';
const t=text=>(locale==='en'?english[text]:chinese[text])||text;
function translatePage(){
 document.documentElement.lang=locale==='en'?'en':'zh-CN';$('language').value=locale;
 const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let node;
 while(node=walker.nextNode()){const raw=node.nodeValue,trimmed=raw.trim(),next=t(trimmed);if(trimmed&&next!==trimmed)node.nodeValue=raw.replace(trimmed,next);}
 document.querySelectorAll('[aria-label]').forEach(el=>{const value=el.getAttribute('aria-label');el.setAttribute('aria-label',t(value));});
}
const $=id=>document.getElementById(id),api=createApiClient(document.querySelector('meta[name="studio-token"]').content);
let config,base,presets=[],region='home',page='home',timer,applying=false,pending=false,hasApplied=false;
const MAX_IMAGE_BYTES=6*1024*1024;
function say(text,error=false){$('message').textContent=t(text);$('message').style.color=error?'#b65048':'#577467';}
async function run(fn){try{await fn();}catch(e){say(e.message,true);}}
const clone=v=>structuredClone(v);
const readAsDataUrl=file=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(Error('图片读取失败'));reader.readAsDataURL(file);});
const loadImage=file=>new Promise((resolve,reject)=>{const url=URL.createObjectURL(file),image=new Image();image.onload=()=>{URL.revokeObjectURL(url);resolve(image);};image.onerror=()=>{URL.revokeObjectURL(url);reject(Error('图片无法解码'));};image.src=url;});
const canvasJpeg=(canvas,quality)=>new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(Error('图片转换失败')),'image/jpeg',quality));
async function compressLargeImage(file,matte){
 const image=await loadImage(file);let width=image.naturalWidth,height=image.naturalHeight;
 // Keep reducing quality first, then resolution. JPEG has no alpha channel, so transparent pixels use the selected base colour.
 for(let scalePass=0;scalePass<7;scalePass++){
  const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(width));canvas.height=Math.max(1,Math.round(height));
  const context=canvas.getContext('2d');context.fillStyle=matte;context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(image,0,0,canvas.width,canvas.height);
  for(const quality of [.92,.84,.76,.68,.6,.52]){const jpeg=await canvasJpeg(canvas,quality);if(jpeg.size<=MAX_IMAGE_BYTES)return jpeg;}
  width*=.82;height*=.82;
 }
 throw Error('图片压缩后仍超过 6MB，请选择尺寸更小的图片');
}
function slider(id,label,min,max,step=1,unit='%'){return `<label class="slider"><div><span>${label}</span><output id="${id}Value"></output></div><input aria-label="${label}" id="${id}" type="range" min="${min}" max="${max}" step="${step}" data-unit="${unit}"></label>`;}
$('imageSliders').innerHTML=slider('x','水平位置',0,100)+slider('y','垂直位置',0,100)+slider('zoom','画面缩放',100,180)+slider('blur','图片模糊',0,30,1,'px');
$('imageControls').insertAdjacentHTML('afterbegin','<label class="toggle"><input id="flipX" type="checkbox">水平翻转图片</label>');
document.querySelector('.recovery-panel')?.insertAdjacentHTML('beforeend','<button id="restartService">重启后台服务</button>');
$('washSliders').innerHTML=slider('opacity','背景不透明度',0,100)+slider('washOpacity','遮罩强度',0,100);
$('globalSliders').innerHTML=slider('panelOpacity','输入框不透明度',0,100)+slider('codeOpacity','代码块不透明度',0,100)+slider('replyOpacity','回复背景不透明度',0,100)+slider('userMessageOpacity','用户消息背景不透明度',0,100);
for(const [id,label]of Object.entries({menuBg:'顶部菜单栏背景',menuInk:'顶部菜单栏文字',ink:'主要文字',muted:'次要文字',accent:'强调色',sidebarInk:'侧栏文字',panel:'输入框 / 代码块 / 消息'})){$('globalColors').insertAdjacentHTML('beforeend',`<div class="color-row"><label>${label}<input aria-label="${label}" id="${id}" type="color"></label></div>`);}
$('sharedSliders').innerHTML=slider('sidebarOverlay','侧栏遮罩强度',0,100)+slider('sidebarBlur','毛玻璃模糊',0,30,1,'px');
$('workspaceHeaderSliders').innerHTML=slider('workspaceHeaderOverlay','顶部工作空间遮罩强度',0,100)+slider('workspaceHeaderBlur','顶部工作空间毛玻璃模糊',0,30,1,'px');
$('sidebarShared').onchange=()=>{config.sidebarShared=$('sidebarShared').checked;changed();};
$('sidebarWash').oninput=()=>{config.sidebar.wash=$('sidebarWash').value;changed();};
for(const k of ['sidebarOverlay','sidebarBlur'])$(k).oninput=()=>{config[k]=Number($(k).value);changed();};
$('workspaceHeaderWash').oninput=()=>{config.workspaceHeaderWash=$('workspaceHeaderWash').value;changed();};
for(const k of ['workspaceHeaderOverlay','workspaceHeaderBlur'])$(k).oninput=()=>{config[k]=Number($(k).value);changed();};
function fill(){
 config.userMessageOpacity??=0;config.replyOpacity??=0;config.sidebarShared??=false;config.sidebarOverlay??=0;config.sidebarBlur??=0;config.workspaceHeaderWash??=base.workspaceHeaderWash;config.workspaceHeaderOverlay??=base.workspaceHeaderOverlay;config.workspaceHeaderBlur??=base.workspaceHeaderBlur;
 $('sidebarShared').checked=config.sidebarShared;$('sidebarWash').value=config.sidebar.wash;$('sidebarOverlay').value=config.sidebarOverlay;$('sidebarBlur').value=config.sidebarBlur;
 $('workspaceHeaderWash').value=config.workspaceHeaderWash;$('workspaceHeaderOverlay').value=config.workspaceHeaderOverlay;$('workspaceHeaderBlur').value=config.workspaceHeaderBlur;
 $('sharedWrap').hidden=region!=='sidebar';
 config.menuBg??=base.menuBg;config.menuInk??=base.menuInk;
 $('name').value=config.name;$('sync').checked=config.sync;
 $('regionControls').hidden=region==='global';$('globalControls').hidden=region!=='global';$('syncWrap').hidden=region!=='chat';
 const r=region==='global'?config:config[region];
 for(const k of region==='global'?['mode','menuBg','menuInk','ink','muted','accent','sidebarInk','panel','panelOpacity','codeOpacity','replyOpacity','userMessageOpacity']:['type','color','color2','fit','x','y','zoom','blur','wash','opacity','washOpacity'])$(k).value=r[k];
 if(region!=='global')$('flipX').checked=Boolean(r.flipX);
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
const paint=(el,r)=>{
 el.style.background=r.color;const art=el.querySelector('.art');
 let image='none';if(r.type==='gradient')image='linear-gradient(155deg,'+r.color+','+r.color2+')';else if(r.type==='image'&&r.image)image='url("'+r.image+'")';
 Object.assign(art.style,{backgroundColor:r.color,backgroundImage:image,backgroundSize:r.fit,backgroundPosition:r.x+'% '+r.y+'%',backgroundRepeat:'no-repeat',opacity:r.opacity/100,filter:'blur('+r.blur+'px)',transform:'scaleX('+(r.flipX?-1:1)+') scale('+(r.zoom/100)+')'});
 el.querySelector('.wash').style.background=rgba(r.wash,r.washOpacity/100);
};
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
 document.querySelector('.user-bubble').style.backgroundColor=rgba(config.panel,config.userMessageOpacity/100);
 $('sampleReply').style.backgroundColor=rgba(config.panel,config.replyOpacity/100);
 const panel=rgba(config.panel,config.panelOpacity/100),header=document.querySelector('.mock-header');header.style.background=rgba(config.workspaceHeaderWash,config.workspaceHeaderOverlay/100);header.style.backdropFilter=`blur(${config.workspaceHeaderBlur}px)`;header.style.webkitBackdropFilter=`blur(${config.workspaceHeaderBlur}px)`;document.querySelector('.mock-composer').style.background=panel;
 document.querySelector('.mock-composer b').style.background=config.accent;document.querySelector('.mock-composer b').style.color=config.panel;document.querySelector('pre').style.background=rgba(config.panel,config.codeOpacity/100);
}
function changed(){visibility();preview();say('预览已更新 · 尚未应用');if($('live').checked&&hasApplied){clearTimeout(timer);timer=setTimeout(applyNow,650);}}
async function applyNow(){
 if(applying){pending=true;return;}applying=true;$('apply').disabled=true;const draft=clone(config);say('正在应用并验证…');
 try{const result=await api('apply',{config:draft});hasApplied=true;say(t('已应用到 Codex · 版本 ')+result.version);await check();}
 catch(e){$('live').checked=false;say(e.message,true);pending=false;}
 finally{applying=false;$('apply').disabled=false;if(pending){pending=false;applyNow();}}
}
for(const k of ['type','color','color2','fit','x','y','zoom','blur','wash','opacity','washOpacity'])$(k).addEventListener('input',()=>{config[region][k]=$(k).type==='range'?Number($(k).value):$(k).value;changed();});
$('flipX').onchange=()=>{config[region].flipX=$('flipX').checked;changed();};
for(const k of ['mode','menuBg','menuInk','ink','muted','accent','sidebarInk','panel','panelOpacity','codeOpacity','replyOpacity','userMessageOpacity'])$(k).addEventListener('input',()=>{config[k]=$(k).type==='range'?Number($(k).value):$(k).value;changed();});
$('name').oninput=()=>{config.name=$('name').value;changed();};$('sync').onchange=()=>{config.sync=$('sync').checked;changed();};
$('regions').onclick=e=>{const b=e.target.closest('button');if(!b)return;region=b.dataset.region;if(region==='home'||region==='chat')page=region;fill();};
$('previewTabs').onclick=e=>{const b=e.target.closest('button');if(b){page=b.dataset.page;preview();}};
$('imageFile').onchange=()=>run(async()=>{let file=$('imageFile').files[0];if(!file)return;const targetRegion=region;let compressed=false,sourceWasPng=false;
 if(file.size>MAX_IMAGE_BYTES){
  sourceWasPng=file.type==='image/png'||/\.png$/i.test(file.name);
  const sourceWasJpeg=file.type==='image/jpeg'||/\.jpe?g$/i.test(file.name);
  if(!sourceWasPng&&!sourceWasJpeg)throw Error('图片不能超过 6MB');
  file=await compressLargeImage(file,config[targetRegion].color);compressed=true;
 }
 const data=await readAsDataUrl(file);await new Promise((resolve,reject)=>{const image=new Image();image.onload=resolve;image.onerror=()=>reject(Error('图片无法解码'));image.src=data;});config[targetRegion].image=data;$('imageFile').value='';changed();
 if(compressed){const size=(file.size/1024/1024).toFixed(1),action=sourceWasPng?'转换为 JPEG':'已压缩';say(locale==='en'?`Large ${sourceWasPng?'PNG converted to JPEG':'JPEG compressed'} (${size} MB).`:`超出限制的图片${action}（${size} MB）。`);}
});
$('resetImage').onclick=()=>{config[region].image=null;changed();};
async function check(){const s=await api('status');$('connection').textContent=t(s.connected?(s.compatible?'Codex 已连接':'当前页面不兼容'):'Codex 未连接');$('dot').style.background=s.connected&&s.compatible?'#5b967c':'#c9a367';$('connection').title=s.lastError||'';$('autoStartStatus').textContent=t(s.autoStart?.enabled?'开机恢复：已启用':'开机恢复：未启用');$('enableAutoStart').disabled=Boolean(s.autoStart?.enabled);$('disableAutoStart').disabled=!s.autoStart?.enabled;return s;}
$('check').onclick=()=>run(check);$('apply').onclick=()=>{clearTimeout(timer);applyNow();};$('live').onchange=()=>{if($('live').checked&&!hasApplied)say('请先点击「应用到 Codex」，之后滑块会自动更新。');};
$('restartService')?.addEventListener('click',()=>run(async()=>{await api('restart');say('后台正在重启，页面将自动刷新…');setTimeout(()=>location.reload(),900);}));
$('language').onchange=()=>{locale=$('language').value;localStorage.setItem('background-studio-language',locale);fill();translatePage();};
$('connect').onclick=()=>run(async()=>{say('正在连接 Codex，必要时会重新启动应用…');await api('connect');await check();say('连接检测完成，请点击应用。');});
$('enableAutoStart').onclick=()=>run(async()=>{await api('autostart-enable');await check();say('已启用开机恢复；登录后会恢复当前已应用的方案。');});
$('disableAutoStart').onclick=()=>run(async()=>{await api('autostart-disable');await check();say('已禁用开机恢复；当前会话不受影响。');});
$('save').onclick=()=>run(async()=>{await api('save',{config});say('草稿已保存到 D:\\Codex_Background\\data');});
function cancelLive(){clearTimeout(timer);pending=false;$('live').checked=false;}
$('undo').onclick=()=>run(async()=>{cancelLive();await api('undo');config=(await api('config')).config;fill();say('已撤销上一次应用。');});
function refreshPresets(){const p=$('preset');while(p.options.length>4)p.remove(4);for(const item of presets)p.add(new Option(item.name,item.id));}
$('savePreset').onclick=()=>run(async()=>{const j=await api('preset',{config});presets=j.presets;refreshPresets();$('preset').value=presets.at(-1).id;say('已收藏当前方案。');});
$('deletePreset').onclick=()=>run(async()=>{if(!presets.some(p=>p.id===$('preset').value))throw Error('请先选择一个自定义预设');presets=(await api('delete-preset',{id:$('preset').value})).presets;refreshPresets();say('自定义预设已删除。');});
$('preset').onchange=()=>{const id=$('preset').value;if(!id)return;cancelLive();config=clone(presets.find(x=>x.id===id)?.config||base);
 if(id==='night'){Object.assign(config,{name:t('深海夜色'),mode:'dark',ink:'#e2edf6',muted:'#9aaec3',accent:'#85bfb3',panel:'#1a2b40',sidebarInk:'#c7deed'});for(const k of ['home','chat','sidebar'])Object.assign(config[k],{type:'gradient',color:'#152b43',color2:'#0c1729',wash:'#132337',washOpacity:20});}
 if(id==='paper'){Object.assign(config,{name:t('暖纸留白'),ink:'#534b40',muted:'#8b7f6d',accent:'#9c7154',panel:'#fffaf1',sidebarInk:'#625747'});for(const k of ['home','chat','sidebar'])Object.assign(config[k],{type:'solid',color:k==='sidebar'?'#e8dfcf':'#f5efe3',wash:'#f5efe3',washOpacity:0});}
 fill();say('预设已载入预览，点击应用后生效。');};
$('import').onclick=()=>$('importFile').click();$('importFile').onchange=()=>run(async()=>{const f=$('importFile').files[0];if(!f)return;if(f.size>28*1024*1024)throw Error('文件过大');const j=await api('import',{value:JSON.parse(await f.text())});cancelLive();config=j.config;fill();$('importFile').value='';say('方案已导入预览，点击应用后生效。');});
$('export').onclick=()=>run(async()=>{const j=await api('export',{config});say('已导出主题包及可编辑 JSON：'+j.editable);});
for(const [id,action]of [['original','original'],['restore','restore'],['pause','pause']])$(id).onclick=()=>run(async()=>{cancelLive();const r=await api(action);if(r.ok===false)throw Error('渲染层未能移除：'+(r.result?.renderer?.message||'请连接 Codex 后重试'));if(id==='original'){config=(await api('config')).config;fill();}say(r.message||({original:'已恢复接管前主题。',pause:'已停止自动保持；当前页面效果暂时保留。'}[id]));await check();});
$('verify').onclick=()=>run(async()=>{const j=await api('verify');say(j.results.every(x=>x.result?.pass)?'当前页面验证通过。':'验证发现问题，请检查页面兼容性。',!j.results.every(x=>x.result?.pass));});
await run(async()=>{const j=await api('config');config=j.config;base=j.defaults;presets=j.presets;refreshPresets();fill();translatePage();await check();});
