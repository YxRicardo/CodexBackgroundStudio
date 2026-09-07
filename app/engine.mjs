import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateThemePackage} from './core/src/index.mjs';
import {isValidBase64} from './core/src/theme/base64.mjs';
export const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const region=()=>({type:'gradient',color:'#eef7ff',color2:'#dcecff',image:null,opacity:100,wash:'#eef7ff',washOpacity:65,blur:0,x:80,y:50,fit:'cover',zoom:100});
export const defaults=()=>({schema:1,name:'Azure glow',mode:'light',menuBg:'#98bce2',menuInk:'#203653',ink:'#203653',muted:'#576c85',accent:'#6e60b7',sidebarInk:'#e5f4ff',panel:'#f8fcff',panelOpacity:94,codeOpacity:92,replyOpacity:0,userMessageOpacity:0,workspaceHeaderWash:'#f8fcff',workspaceHeaderOverlay:84,workspaceHeaderBlur:18,sync:true,home:region(),chat:{...region(),washOpacity:80},sidebar:{...region(),type:'gradient',color:'#193657',color2:'#122743',wash:'#142a49',washOpacity:35}});
const color=v=>typeof v==='string'&&/^#[0-9a-f]{6}$/i.test(v);
export function validate(c){
 if(!c||c.schema!==1)throw Error('不支持的预设格式');
 c=structuredClone(c);c.menuBg??=defaults().menuBg;c.menuInk??=defaults().menuInk;
 c.userMessageOpacity??=defaults().userMessageOpacity;c.replyOpacity??=defaults().replyOpacity;c.sidebarShared??=false;c.sidebarOverlay??=0;c.sidebarBlur??=0;
 c.workspaceHeaderWash??=defaults().workspaceHeaderWash;c.workspaceHeaderOverlay??=defaults().workspaceHeaderOverlay;c.workspaceHeaderBlur??=defaults().workspaceHeaderBlur;
 if(typeof c.sidebarShared!=='boolean'||!Number.isFinite(c.sidebarOverlay)||c.sidebarOverlay<0||c.sidebarOverlay>100||!Number.isFinite(c.sidebarBlur)||c.sidebarBlur<0||c.sidebarBlur>30)throw Error('共用背景参数无效');
 if(!color(c.workspaceHeaderWash)||!Number.isFinite(c.workspaceHeaderOverlay)||c.workspaceHeaderOverlay<0||c.workspaceHeaderOverlay>100||!Number.isFinite(c.workspaceHeaderBlur)||c.workspaceHeaderBlur<0||c.workspaceHeaderBlur>30)throw Error('顶部工作空间毛玻璃参数无效');
 if(typeof c.name!=='string'||!c.name.trim()||c.name.length>60)throw Error('名称需要 1–60 个字符');
 if(!['light','dark'].includes(c.mode)||typeof c.sync!=='boolean')throw Error('主题模式无效');
 for(const k of ['ink','muted','accent','sidebarInk','panel','menuBg','menuInk'])if(!color(c[k]))throw Error('颜色无效: '+k);
 const num=(v,a,b)=>typeof v==='number'&&Number.isFinite(v)&&v>=a&&v<=b;
 for(const k of ['panelOpacity','codeOpacity','replyOpacity','userMessageOpacity'])if(!num(c[k],0,100))throw Error('透明度无效');
 for(const key of ['home','chat','sidebar']){
  const r=c[key]; if(!r||!['solid','gradient','image'].includes(r.type)||!['cover','contain'].includes(r.fit))throw Error('背景类型无效');
  for(const k of ['color','color2','wash'])if(!color(r[k]))throw Error('背景颜色无效');
  for(const k of ['opacity','washOpacity','x','y'])if(!num(r[k],0,100))throw Error('滑块参数无效: '+k);
  if(!num(r.zoom,100,180)||!num(r.blur,0,30))throw Error('缩放或模糊无效');
  if(r.image!==null){
   if(typeof r.image!=='string'||r.image.length>8*1024*1024+32)throw Error('仅支持最大 6MB 的 PNG/JPEG/WebP 图片');
   const comma=r.image.indexOf(','),prefix=r.image.slice(0,comma),encoded=r.image.slice(comma+1);
   if(!['data:image/png;base64','data:image/jpeg;base64','data:image/webp;base64'].includes(prefix)||!isValidBase64(encoded))throw Error('图片编码无效，仅支持 PNG/JPEG/WebP');
   const bytes=Buffer.from(encoded,'base64');
   if(bytes.length>6*1024*1024)throw Error('图片不能超过 6MB');
   const png=bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
   const jpg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
   const webp=bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP';
   if(!(png||jpg||webp))throw Error('图片内容无效');
  }
 }
 return structuredClone(c);
}
export const rgba=(hex,a)=>`rgba(${[1,3,5].map(n=>parseInt(hex.slice(n,n+2),16)).join(',')},${a})`;
export function regionCSS(selector,r,imageId){
 const background=r.type==='solid'?r.color:r.type==='gradient'?`linear-gradient(155deg,${r.color},${r.color2})`:`var(--codedrobe-image-${imageId},none)`;
 return `${selector}{position:relative;isolation:isolate;background:${r.color}!important;overflow:hidden!important;}
 ${selector}::before{content:"";position:absolute;inset:0;z-index:-2;pointer-events:none;background-image:${r.type==='solid'?'none':background};background-color:${r.color};background-size:${r.fit};background-position:${r.x}% ${r.y}%;background-repeat:no-repeat;opacity:${r.opacity/100};filter:blur(${r.blur}px);transform:scale(${r.zoom/100});}
 ${selector}::after{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;background:${rgba(r.wash,r.washOpacity/100)};}`;
}
export async function makeBundle(input){
 const c=validate(input), images={};
 for(const k of ['home','chat','sidebar']){
  const r=k==='chat'&&c.sync?c.home:c[k];
  if(!r.image)continue;
  const data=r.image;
  const [,mime,base64]=data.match(/^data:([^;]+);base64,(.*)$/s);
  images[k]={filename:k+'.'+({ 'image/png':'png','image/jpeg':'jpg','image/webp':'webp'}[mime]),mimeType:mime,base64};
 }
 const h='html.codedrobe-host-codex',m=`${h} main.border-l-hairline:has([data-testid='app-shell-header-context-menu-surface'])`,s=`${h} aside.app-shell-left-panel`;
 const shell=`${h} div:has(>aside.app-shell-left-panel):has(main.border-l-hairline)`;
 const shared=c.sidebarShared?`${regionCSS(shell,c.sync?c.home:c.chat,'chat')}
 ${regionCSS(`${shell}:has(.dream-home)`,c.home,'home')}
 ${m},${m}:has(.dream-home){background:transparent!important;}
 ${m}::before,${m}::after,${m}:has(.dream-home)::before,${m}:has(.dream-home)::after{content:none!important;}
 ${s}{background:${rgba(c.sidebar.wash,c.sidebarOverlay/100)}!important;backdrop-filter:blur(${c.sidebarBlur}px);}
 ${s}::before,${s}::after{content:none!important;}`:'';
 const panel=rgba(c.panel,c.panelOpacity/100),line=rgba(c.ink,.18);
 const css=`${h}{color-scheme:${c.mode}!important;
 --color-token-bg-primary:${c.home.color}!important;--color-token-main-surface-primary:${c.home.color}!important;
 --color-token-bg-secondary:${panel}!important;--color-token-bg-tertiary:${rgba(c.panel,.8)}!important;
 --color-token-side-bar-background:${c.sidebar.color}!important;
 --color-token-foreground:${c.ink}!important;--color-token-text-primary:${c.ink}!important;
 --color-token-text-secondary:${c.muted}!important;--color-token-text-tertiary:${c.muted}!important;
 --color-token-description-foreground:${c.muted}!important;--color-token-icon-foreground:${c.muted}!important;
 --color-token-input-background:${panel}!important;--color-token-input-foreground:${c.ink}!important;--color-token-input-placeholder-foreground:${c.muted}!important;
 --color-token-input-border:${line}!important;--color-token-border:${line}!important;--color-token-border-default:${line}!important;
 --color-token-button-background:${c.accent}!important;--color-token-button-foreground:${c.panel}!important;
 --color-token-link:${c.accent}!important;--color-token-text-link-foreground:${c.accent}!important;--color-token-primary:${c.accent}!important;
 --color-token-focus-border:${c.accent}!important;--color-token-menu-background:${c.panel}!important;--color-token-dropdown-background:${c.panel}!important;
 --color-token-dropdown-foreground:${c.ink}!important;--color-token-menu-border:${line}!important;
 --color-token-list-hover-background:${rgba(c.accent,.12)}!important;--color-token-list-active-selection-background:${rgba(c.accent,.22)}!important;
 --color-token-text-code-block-background:${rgba(c.panel,c.codeOpacity/100)}!important;}
 ${h} body{background:${c.sidebar.color}!important;color:${c.ink}!important;}
 ${h} [class*="_ApplicationMenuTopBar_"]{background:${c.menuBg}!important;color:${c.menuInk}!important;}
 ${h} [class*="_ApplicationMenuTopBar_"] :is(button,[role="menuitem"],svg){color:${c.menuInk}!important;}
 ${h} [class*="_ApplicationMenuTopBar_"] button:not(:disabled):is(:hover,:focus-visible,[aria-expanded="true"]){background-color:${rgba(c.menuInk,.12)}!important;}
 ${regionCSS(m,c.sync?c.home:c.chat,'chat')}
 /* Paint the home artwork on the shell, outside the scrolling content's gutters and fade mask. */
 ${regionCSS(`${m}:has(.dream-home)`,c.home,'home')}
 ${h} .dream-home{background:transparent!important;}
 ${h} .dream-home::before,${h} .dream-home::after{content:none!important;}
 /* ChatGPT Chat does not receive .dream-home, but it uses the same native top
    fade as Work. Its opaque token color appears as a white strip on artwork. */
 ${m} [class*="_MainContentTopFade_"]{background-image:none!important;}
 ${m} [role="main"]{background:transparent!important;}
 ${regionCSS(s,c.sidebar,'sidebar')}
 ${s}{color:${c.sidebarInk}!important;--color-token-foreground:${c.sidebarInk}!important;--color-token-text-primary:${c.sidebarInk}!important;--color-token-text-secondary:${c.sidebarInk}!important;--color-token-text-tertiary:${c.sidebarInk}!important;--color-token-input-placeholder-foreground:${c.sidebarInk}!important;}
 ${s} :is(a,button,div,p,span,svg){color:${c.sidebarInk}!important;}
 @layer base{${s} button[class~="!text-tertiary"],${s} button[class*="!text-token-input-placeholder-foreground"]{color:${c.sidebarInk}!important;opacity:1!important;}}
 ${s} [role="status"].bg-token-main-surface-primary{background:${c.panel}!important;color:${c.ink}!important;}
 ${s} [role="status"].bg-token-main-surface-primary :is(div,p,span,svg,button){color:${c.ink}!important;}
 /* The workspace title bar gets its own adjustable frosted-glass surface. */
 ${m}>header,${h} header.app-header-tint{background:${rgba(c.workspaceHeaderWash,c.workspaceHeaderOverlay/100)}!important;color:${c.ink}!important;backdrop-filter:blur(${c.workspaceHeaderBlur}px);-webkit-backdrop-filter:blur(${c.workspaceHeaderBlur}px);}
 ${h} .composer-surface-chrome{background:${panel}!important;border-color:${line}!important;color:${c.ink}!important;}
 ${m} [class*="_ComposerLayoutRoot_"]:has(.ProseMirror[contenteditable="true"]){background:${panel}!important;}
 /* ChatGPT Chat ships an additional nearly-opaque body inside the composer.
    Let the configured root panel be the single glass layer in that layout. */
 ${m} [class*="_ComposerLayoutBody_"]:has(.ProseMirror[contenteditable="true"]){background:transparent!important;}
 ${m}:has(.dream-home) [class*="_ComposerLayoutRoot_"]:has(.ProseMirror[contenteditable="true"]){background:transparent!important;}
 ${m}:has(.dream-home) [class*="_ComposerLayoutBody_"]:has(.ProseMirror[contenteditable="true"]){background:${panel}!important;}
 /* Scheduled tasks and Plugins share a sticky search tray. Remove its native
    opaque surface/fade and let the search field use the configured glass. */
 ${m} .sticky.z-30.bg-surface:has(input.bg-transparent){background:transparent!important;}
 ${m} .sticky.z-30.bg-surface:has(input.bg-transparent)::after{background:none!important;}
 ${m} div:has(>input.bg-transparent){background:${panel}!important;border-color:${line}!important;}
 ${h} .composer-surface-chrome :is(textarea,.ProseMirror){color:${c.ink}!important;caret-color:${c.accent};}
 ${m} [data-markdown-text-style="assistant-message"]{background-color:${rgba(c.panel,c.replyOpacity/100)}!important;border-radius:10px;}
 ${m} [data-markdown-text-tone="user-message"]{background-color:${rgba(c.panel,c.userMessageOpacity/100)}!important;border-radius:10px;}
 ${h} :is(pre,table,blockquote){background:${rgba(c.panel,c.codeOpacity/100)}!important;border-color:${line}!important;}
 ${h} .sticky.bottom-0>.pointer-events-none.absolute>.bg-gradient-to-t.from-token-main-surface-primary{background-image:none!important;}
 ${m}:not(:has(.dream-home)) .sticky.bottom-0>.pointer-events-none.absolute.inset-x-0.bottom-0.bg-gradient-to-t.from-surface{background-image:none!important;}
 #codedrobe-codex-skin-chrome{display:none!important;pointer-events:none!important;}
 ${shared}`;
 const bundle={format:'codedrobe-theme',schemaVersion:1,theme:{id:'codex-background-studio',displayName:c.name,version:`1.0.${Date.now()}`},targets:{codex:{css,options:{rendererProfile:'codex-theme-v1'}}}};
 if(Object.keys(images).length)bundle.assets={images};
 return validateThemePackage(bundle);
}
