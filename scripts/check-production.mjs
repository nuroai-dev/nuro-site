/** Checks the built Node server locally; all outbound email requests are intercepted. */
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,readFile,rm} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawn} from 'node:child_process';
import {createServer} from 'node:net';
const cwd=fileURLToPath(new URL('..',import.meta.url));
const dir=await mkdtemp(join(tmpdir(),'nuro-server-check-'));
const mock=join(dir,'mock-mail.mjs');
await writeFile(mock,`import {appendFile} from 'node:fs/promises';
globalThis.fetch=async (url,init)=>{
 if(String(url)!=='https://api.resend.com/emails')throw new Error('Unexpected outbound request in test');
 const body=JSON.parse(init.body);await appendFile(process.env.MAIL_CAPTURE,JSON.stringify(body)+'\\n');
 if(body.text.includes('force-mail-failure'))return new Response(JSON.stringify({name:'validation_error',message:'Synthetic mail rejection'}),{status:422,headers:{'Content-Type':'application/json'}});
 return new Response(JSON.stringify({id:'local-mail-test'}),{status:200,headers:{'Content-Type':'application/json'}});
};`);
const socket=createServer();await new Promise(r=>socket.listen(0,'127.0.0.1',r));const port=socket.address().port;await new Promise(r=>socket.close(r));
const base=`http://127.0.0.1:${port}`;
const env={...process.env,HOST:'127.0.0.1',PORT:String(port),WAITLIST_DIR:dir,CONTACT_DIR:dir,RESEND_API_KEY:'re_local_test_only',WAITLIST_EXPORT_TOKEN:'local-export-test-only',CONTACT_TO:'inbox@example.com',CONTACT_FROM:'Nuro Test <sender@example.com>',MAIL_CAPTURE:join(dir,'mail.jsonl')};
let child;let logs='';
async function start(){child=spawn(process.execPath,['--import',mock,'scripts/start.mjs'],{cwd,env,stdio:['ignore','pipe','pipe']});child.stdout.on('data',b=>logs+=b);child.stderr.on('data',b=>logs+=b);for(let i=0;i<80;i++){try{if((await fetch(base+'/')).ok)return;}catch{}if(child.exitCode!==null)throw new Error(logs);await new Promise(r=>setTimeout(r,100));}throw new Error('Server did not start');}
async function stop(){if(child&&child.exitCode===null){const finished=new Promise(r=>child.once('exit',r));child.kill('SIGTERM');await finished;}child=undefined;}
const send=async(path,data,method='POST')=>{const r=await fetch(base+path,{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});return {status:r.status,body:await r.json()};};
try{
 await start();const email='persisted-signup@example.com';const added=await send('/api/waitlist',{email});assert.equal(added.status,200);
 const details={id:added.body.id,editToken:added.body.editToken,roles:['parent'],student_ages:['10-12'],message:''};assert.equal((await send('/api/waitlist',details,'PATCH')).status,200);
 const raw=await readFile(join(dir,'waitlist.jsonl'),'utf8');assert(!raw.includes(added.body.editToken));assert.equal(JSON.parse(raw).roles[0],'parent');
 await stop();await start();assert.equal((await send('/api/waitlist',{email})).status,409);assert.equal((await send('/api/waitlist',{...details,roles:['teacher']},'PATCH')).status,200);
 for(const endpoint of ['/api/waitlist-export','/api/contact-export'])assert.equal((await fetch(base+endpoint)).status,401);
 const contact={name:'Synthetic contact test',email:'reply@example.com',message:'Approved local mock. No real delivery.'};assert.equal((await send('/api/contact',contact)).status,200);
 const mail=JSON.parse((await readFile(env.MAIL_CAPTURE,'utf8')).trim());assert.deepEqual(mail.to,['inbox@example.com']);assert.equal(mail.reply_to,contact.email);assert(mail.text.includes(contact.message));
 assert.equal((await send('/api/contact',{...contact,message:'force-mail-failure'})).status,500);assert.equal((await readFile(join(dir,'contact.jsonl'),'utf8')).trim().split('\n').length,2);
 const exported=await fetch(base+'/api/waitlist-export',{headers:{Authorization:'Bearer '+env.WAITLIST_EXPORT_TOKEN}});assert.equal(exported.status,200);assert((await exported.text()).includes(email));
 await stop();
 const rejected=spawn(process.execPath,['scripts/start.mjs'],{cwd,env:{...env,RESEND_API_KEY:''},stdio:'pipe'});const code=await new Promise(r=>rejected.once('exit',r));assert.equal(code,1);
 console.log('Built server passes: restart persistence, protected edits/exports, Resend request format, mail-failure recovery, missing-production-config guard. No external emails sent.');
}finally{await stop();await rm(dir,{recursive:true,force:true});}
