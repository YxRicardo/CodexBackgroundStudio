import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateThemePackage} from './core/src/index.mjs';
import {isValidBase64} from './core/src/theme/base64.mjs';
export const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
// Match the native settings navigation and its own scrolling surface.
export const SETTINGS_SURFACE='html.codedrobe-host-codex:has(aside.app-shell-left-panel nav.sidebar-navigation) main:has([data-testid="app-shell-header-context-menu-surface"]) [class~="electron:bg-surface"]:has(> .scrollbar-stable.overflow-y-auto.p-panel)';
export const region=()=>({type:'gradient',color:'#eef7ff',color2:'#dcecff',image:null,opacity:100,wash:'#eef7ff',washOpacity:65,blur:0,x:80,y:50,fit:'cover',zoom:100,flipX:false});
export const defaults=()=>({schema:1,settingsWash:'#f8fcff',settingsOverlay:65,settingsBlur:12,chatMaxWidth:null,name:'Azure glow',mode:'light',menuBg:'#98bce2',menuInk:'#203653',ink:'#203653',muted:'#576c85',accent:'#6e60b7',sidebarInk:'#e5f4ff',panel:'#f8fcff',panelOpacity:94,codeOpacity:92,replyOpacity:0,userMessageOpacity:0,workspaceHeaderWash:'#f8fcff',workspaceHeaderOverlay:84,workspaceHeaderBlur:18,sync:true,home:region(),chat:{...region(),washOpacity:80},sidebar:{...region(),type:'gradient',color:'#193657',color2:'#122743',wash:'#142a49',washOpacity:35}});
const color=v=>typeof v==='string'&&/^#[0-9a-f]{6}$/i.test(v);
export function validate(c){
 if(!c||c.schema!==1)throw Error('不支持的预设格式');
 c=structuredClone(c);
 c.userMessageWash??=c.panel;c.replyWash??=c.panel;
 c.userInk??=c.ink;c.assistantInk??=c.ink;
 c.settingsWash??=c.panel??'#f8fcff';c.settingsOverlay??=65;c.settingsBlur??=12;
 if(!color(c.settingsWash)||!Number.isFinite(c.settingsOverlay)||c.settingsOverlay<0||c.settingsOverlay>100||!Number.isFinite(c.settingsBlur)||c.settingsBlur<0||c.settingsBlur>30)throw Error('设置界面遮罩参数无效');
 c.chatMaxWidth??=null;
 if(c.chatMaxWidth!==null&&(!Number.isInteger(c.chatMaxWidth)||c.chatMaxWidth<480||c.chatMaxWidth>2400))throw Error('对话最大宽度需要为 480–2400 的整数');c.menuBg??=defaults().menuBg;c.menuInk??=defaults().menuInk;
 c.userMessageOpacity??=defaults().userMessageOpacity;c.replyOpacity??=defaults().replyOpacity;c.sidebarShared??=false;c.sidebarOverlay??=0;c.sidebarBlur??=0;
 c.workspaceHeaderWash??=defaults().workspaceHeaderWash;c.workspaceHeaderOverlay??=defaults().workspaceHeaderOverlay;c.workspaceHeaderBlur??=defaults().workspaceHeaderBlur;
 if(typeof c.sidebarShared!=='boolean'||!Number.isFinite(c.sidebarOverlay)||c.sidebarOverlay<0||c.sidebarOverlay>100||!Number.isFinite(c.sidebarBlur)||c.sidebarBlur<0||c.sidebarBlur>30)throw Error('共用背景参数无效');
 if(!color(c.workspaceHeaderWash)||!Number.isFinite(c.workspaceHeaderOverlay)||c.workspaceHeaderOverlay<0||c.workspaceHeaderOverlay>100||!Number.isFinite(c.workspaceHeaderBlur)||c.workspaceHeaderBlur<0||c.workspaceHeaderBlur>30)throw Error('顶部工作空间毛玻璃参数无效');
 if(typeof c.name!=='string'||!c.name.trim()||c.name.length>60)throw Error('名称需要 1–60 个字符');
 if(!['light','dark'].includes(c.mode)||typeof c.sync!=='boolean')throw Error('主题模式无效');
 for(const k of ['ink','userInk','assistantInk','userMessageWash','replyWash','muted','accent','sidebarInk','panel','menuBg','menuInk'])if(!color(c[k]))throw Error('颜色无效: '+k);
 const num=(v,a,b)=>typeof v==='number'&&Number.isFinite(v)&&v>=a&&v<=b;
 for(const k of ['panelOpacity','codeOpacity','replyOpacity','userMessageOpacity'])if(!num(c[k],0,100))throw Error('透明度无效');
 for(const key of ['home','chat','sidebar']){
  const r=c[key]; if(!r||!['solid','gradient','image'].includes(r.type)||!['cover','contain'].includes(r.fit))throw Error('背景类型无效');
  r.flipX??=false;
  if(typeof r.flipX!=='boolean')throw Error('图片翻转参数无效');
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
 ${selector}::before{content:"";position:absolute;inset:0;z-index:-2;pointer-events:none;background-image:${r.type==='solid'?'none':background};background-color:${r.color};background-size:${r.fit};background-position:${r.x}% ${r.y}%;background-repeat:no-repeat;opacity:${r.opacity/100};filter:blur(${r.blur}px);transform:scaleX(${r.flipX?-1:1}) scale(${r.zoom/100});}
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
 const h='html.codedrobe-host-codex',mainAnchor=`main:has([data-testid='app-shell-header-context-menu-surface'])`,m=`${h} ${mainAnchor}`,s=`${h} aside.app-shell-left-panel`;
 // Select the full-width flex row that directly owns the sidebar and the main
 // clip. Keep :has() calls sequential: CSS forbids nesting :has() inside
 // another :has(), and newer Codex Chromium releases reject such rules.
 const shell=`${h} div:has(>aside.app-shell-left-panel):has(>div>main)`;
 const shared=c.sidebarShared?`${regionCSS(shell,c.sync?c.home:c.chat,'chat')}
 ${regionCSS(`${shell}:has(.dream-home)`,c.home,'home')}
 ${shell} ${mainAnchor}{background:transparent!important;}
 ${shell} ${mainAnchor}::before,${shell} ${mainAnchor}::after{content:none!important;}
 ${s}{background:${rgba(c.sidebar.wash,c.sidebarOverlay/100)}!important;backdrop-filter:blur(${c.sidebarBlur}px);}
 ${s}::before,${s}::after{content:none!important;}`:'';
 const panel=rgba(c.panel,c.panelOpacity/100),line=rgba(c.ink,.18);
 const rightPanel=`${m} aside[data-app-shell-focus-area="right-panel"]`;
 // The launcher has an empty tab strip and no mounted feature panel.
 const rightLauncher=`${rightPanel}:has([data-app-shell-tab-strip-controller="right"]):not(:has([role="tab"],[data-app-shell-tab-panel-controller="right"]))`;
 const rightTabs=`${m} [data-app-shell-tab-row]:has([data-app-shell-tab-strip-controller="right"])`;
 const rightToolbar=`${m} [data-app-shell-tab-panel-controller="right"] .h-toolbar-pane:not([data-app-shell-tab-row])`;
 const pinnedSummary=`${h} .bg-surface-elevated-secondary.rounded-3xl:has([data-slot="thread-summary-panel-item-button"])`;
 const homeSuggestionCards=`${m} section[class~="group/home-suggestions"] button[class~="bg-surface"][aria-labelledby]`;
 const chromeWash=rgba(c.workspaceHeaderWash,c.workspaceHeaderOverlay/100);
 const chromeWashSoft=rgba(c.workspaceHeaderWash,c.workspaceHeaderOverlay/200);
 const widthCSS=c.chatMaxWidth===null?'':`${m},${m} [class*="--thread-content-max-width:"]:not(aside[data-app-shell-focus-area="right-panel"] *){--thread-content-max-width:${c.chatMaxWidth}px!important;}`;
 const css=`${widthCSS}
 /* The existing wallpaper sits behind this settings surface. Paint one wash,
    and clear only the native settings-card token, preserving control states. */
 ${SETTINGS_SURFACE}{background:${rgba(c.settingsWash,c.settingsOverlay/100)}!important;backdrop-filter:blur(${c.settingsBlur}px);-webkit-backdrop-filter:blur(${c.settingsBlur}px);--color-background-panel:transparent;}
 ${h}{color-scheme:${c.mode}!important;
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
 /* The fixed header spans both the workspace and an open details sidebar.
    Put glass on its flexible workspace section only, so controls rendered in
    the sidebar section (such as Enter fullscreen) remain crisp. */
 ${m}>header,${m} header.app-header-tint{background:transparent!important;color:${c.ink}!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;}
 ${m}>header>div[class~="flex-1"],${m} header.app-header-tint>div[class~="flex-1"]{position:relative;background:transparent!important;}
 ${m}>header>div[class~="flex-1"]::before,${m} header.app-header-tint>div[class~="flex-1"]::before{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;background:radial-gradient(ellipse 88% 145% at 50% -35%,${chromeWash} 0%,${chromeWashSoft} 66%,transparent 100%);-webkit-mask-image:radial-gradient(ellipse 88% 145% at 50% -35%,#000 0%,rgba(0,0,0,.72) 66%,transparent 100%);mask-image:radial-gradient(ellipse 88% 145% at 50% -35%,#000 0%,rgba(0,0,0,.72) 66%,transparent 100%);backdrop-filter:blur(${c.workspaceHeaderBlur}px);-webkit-backdrop-filter:blur(${c.workspaceHeaderBlur}px);}
 /* Edge-scroll mode paints opaque native toolbar groups above the glass.
    Clear the group surfaces only; button hover/focus backgrounds stay native. */
 ${m} header [data-app-shell-header-toolbar]>div{background:transparent!important;}
 /* Native panel wrappers share this dedicated token. Keep general surface and
    component theme tokens intact so terminal, file tree and WebView content
    retain their own backgrounds. The main shell already owns the wallpaper. */
 ${rightPanel}{--app-shell-panel-background:transparent!important;}
 ${rightTabs},${rightToolbar}{background:${chromeWash}!important;backdrop-filter:blur(${c.workspaceHeaderBlur}px);-webkit-backdrop-filter:blur(${c.workspaceHeaderBlur}px);}
 /* Only the initial launcher is clear; opening any feature restores its wash. */
 ${rightLauncher} [data-app-shell-tab-row],${rightLauncher} .bg-surface{background:transparent!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;}
 /* Newer Codex places each launcher's wash on a wrapper around its button. */
 ${rightLauncher} .bg-primary-soft-alpha{background-color:var(--color-background-primary-ghost-hover)!important;}
 /* Each native tab paints an opaque base and a separate selected/hover wash.
    Let the row own the glass, and retain the native state layer as a tint. */
 ${rightTabs} [data-app-shell-tab-controller="right"] [data-tab-id][class~="group/tab"]{background:transparent!important;--app-shell-tab-background:${rgba(c.ink,.10)}!important;}
 /* Only tab-strip chrome: preserve selected/hovered tabs and button states.
    Native overflow fades and the pinned add-tab tray otherwise paint solid strips. */
 ${rightTabs} [data-app-shell-tab-strip-controller="right"] .sticky>.bg-surface{background:transparent!important;}
 ${rightTabs} [data-app-shell-tab-strip-controller="right"]>.sticky::after{background-image:none!important;}
 /* Match the observed summary card through its item slots. The card owns the
    only wash; native sticky section headers and their top fillers must not
    paint an opaque elevated surface over it. */
 ${pinnedSummary}{background:${panel}!important;border-color:${line}!important;backdrop-filter:blur(${c.workspaceHeaderBlur}px);-webkit-backdrop-filter:blur(${c.workspaceHeaderBlur}px);}
 ${pinnedSummary} header.bg-surface-elevated-secondary,${pinnedSummary} header.bg-surface-elevated-secondary::before{background:transparent!important;}
 /* The project new-chat page renders its four starter choices as home
    suggestion cards. Give those native cards the configured panel wash too;
    the section and accessibility attributes keep the rule off ordinary
    workspace buttons and the compact suggestion-list variant. */
 ${homeSuggestionCards}{background:${panel}!important;border-color:${line}!important;backdrop-filter:blur(${c.workspaceHeaderBlur}px);-webkit-backdrop-filter:blur(${c.workspaceHeaderBlur}px);}
 ${h} .composer-surface-chrome{background:${panel}!important;border-color:${line}!important;color:${c.ink}!important;}
 /* Keep the native rounded composer body as the only painted surface.  The
    outer layout root is rectangular in ChatGPT's new-chat view; painting it
    as well creates a visible second, square overlay around the composer. */
 ${m} [class*="_ComposerLayoutRoot_"]:has(.ProseMirror[contenteditable="true"]){background:transparent!important;}
 ${m} [class*="_ComposerLayoutBody_"]:has(.ProseMirror[contenteditable="true"]){background:${panel}!important;border-color:${line}!important;}
 /* Scheduled tasks and Plugins share a sticky search tray. Remove its native
    opaque surface/fade and let the search field use the configured glass. */
 ${m} .sticky.z-30.bg-surface:has(input.bg-transparent){background:transparent!important;}
 ${m} .sticky.z-30.bg-surface:has(input.bg-transparent)::after{background:none!important;}
 ${m} div:has(>input.bg-transparent){background:${panel}!important;border-color:${line}!important;}
 /* Both choice and free-text requests use this native outer card. Paint once
    here, including the title and footer; tinting the radio group's parent
    leaves the opaque elevated card behind it and misses free-text requests. */
 ${h} [data-codex-composer-request-navigation]{background:${panel}!important;border-color:${line}!important;}
 ${h} .composer-surface-chrome :is(textarea,.ProseMirror){color:${c.ink}!important;caret-color:${c.accent};}
 ${m} [data-markdown-text-style="assistant-message"]{background-color:${rgba(c.replyWash,c.replyOpacity/100)}!important;border-radius:10px;}
 /* Override native message tones at the root; preserve link and syntax colors. */
 ${m} [data-markdown-text-style="assistant-message"]{color:${c.assistantInk}!important;--color-text-primary:${c.assistantInk}!important;}
 ${m} [data-markdown-text-tone="user-message"]{color:${c.userInk}!important;--color-text-primary:${c.userInk}!important;}
 /* Markdown files open in the right-side CodeMirror panel. Reuse the reply
    wash exactly so the editor stays readable and follows the same opacity
    control without painting terminals or non-Markdown file panels. */
 ${m} .cm-editor:has(.file-editor-heading,.cm-markdown-list-item,.cm-markdown-code-line){background-color:${rgba(c.panel,c.replyOpacity/100)}!important;}
 /* The native bubble owns the only user-message background, including its padding. */
 ${m} .bg-user-message{background-color:${rgba(c.userMessageWash,c.userMessageOpacity/100)}!important;}
 ${m} [data-markdown-text-tone="user-message"]{background-color:transparent!important;}
 ${h} :is(pre,table,blockquote){background:${rgba(c.panel,c.codeOpacity/100)}!important;border-color:${line}!important;}
 ${h} .sticky.bottom-0>.pointer-events-none.absolute>.bg-gradient-to-t.from-token-main-surface-primary{background-image:none!important;}
 ${m}:not(:has(.dream-home)) .sticky.bottom-0>.pointer-events-none.absolute.inset-x-0.bottom-0.bg-gradient-to-t.from-surface{background-image:none!important;}
 #codedrobe-codex-skin-chrome{display:none!important;pointer-events:none!important;}
 ${shared}`;
 const bundle={format:'codedrobe-theme',schemaVersion:1,theme:{id:'codex-background-studio',displayName:c.name,version:`1.0.${Date.now()}`},targets:{codex:{css,options:{rendererProfile:'codex-theme-v1'}}}};
 if(Object.keys(images).length)bundle.assets={images};
 return validateThemePackage(bundle);
}
