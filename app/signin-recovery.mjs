// This runs once for the Windows sign-in launcher, never for normal reconnects.
export async function recoverAtSignIn({isEnabled,findPids,probe,launch,log,wait=ms=>new Promise(resolve=>setTimeout(resolve,ms))}){
 let attempt=0;
 while(attempt<6){
  if(!await isEnabled())return;
  if(!(await findPids()).length){
   attempt=0;
   await wait(2500);
   continue;
  }
  try{await probe();await log({type:'signin-recovery-ready'});return;}catch{}
  attempt++;
  await wait(2500);
 }
 if(!await isEnabled())return;
 try{
  // Recheck after the grace period before requesting a single restart.
  try{await probe();await log({type:'signin-recovery-ready'});return;}catch{}
  if(!(await findPids()).length)return;
  await log({type:'signin-recovery-connect',action:'launch-or-restart'});
  await launch();
  await log({type:'signin-recovery-complete'});
 }catch(error){await log({type:'signin-recovery-failed',message:String(error.message).slice(0,500)});}
}
