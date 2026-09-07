export function createApiClient(initialToken,{fetchImpl=globalThis.fetch,readToken=html=>new DOMParser().parseFromString(html,'text/html').querySelector('meta[name="studio-token"]')?.content}={}){
 let token=initialToken,refreshing=null;
 async function refresh(){
  refreshing??=(async()=>{
   const response=await fetchImpl('/',{cache:'no-store'});
   if(!response.ok)throw Error('无法更新页面连接，请稍后重试。');
   const next=readToken(await response.text());
   if(!/^[0-9a-f]{64}$/.test(next??''))throw Error('连接已失效，请刷新调节器页面。');
   token=next;
  })().finally(()=>{refreshing=null;});
  return refreshing;
 }
 return async function api(action,data={}){
  const payload=JSON.stringify(data);
  const send=()=>fetchImpl('/api/'+action,{method:'POST',headers:{'Content-Type':'application/json','X-Studio-Token':token},body:payload});
  let response=await send();
  // A rejected authentication check runs before any operation. Retry it once
  // using the same-origin page's fresh token, keeping the user's draft intact.
  if(response.status===403){await refresh();response=await send();}
  const raw=await response.text();let result;
  try{result=JSON.parse(raw);}catch{
   if(response.status===403)throw Error('连接已失效，请刷新调节器页面后重试。');
   throw Error(response.ok?'服务返回了无法识别的数据，请重试。':`请求失败（${response.status}），请检查本地服务。`);
  }
  if(!response.ok||result.error)throw Error(result.error||`操作失败（${response.status}）`);
  return result;
 };
}
