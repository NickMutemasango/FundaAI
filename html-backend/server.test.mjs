import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createApp} from './server.mjs';
import {Readable} from 'node:stream';
// Exercise the actual HTTP handler in memory so tests need no network permissions.
let currentServer;
async function running(options,fn){currentServer=createApp({apiOnly:false,...options});try{await fn('http://localhost:3000');}finally{currentServer.close();}}
async function fetch(url,options={}) {
 const parsed=new URL(url);const headers={host:parsed.host};for(const [k,v] of Object.entries(options.headers||{}))headers[k.toLowerCase()]=v;
 const req=Readable.from(options.body?[Buffer.from(options.body)]:[]);Object.assign(req,{url:parsed.pathname+parsed.search,method:options.method||'GET',headers,socket:{remoteAddress:'127.0.0.1'}});
 return new Promise((resolve,reject)=>{let status=200;const responseHeaders={};const res={headersSent:false,setHeader(k,v){responseHeaders[k]=v;},writeHead(code,h){status=code;Object.assign(responseHeaders,h);this.headersSent=true;},end(data){resolve(new Response(status===204?null:data,{status,headers:responseHeaders}));}};Promise.resolve(currentServer.listeners('request')[0](req,res)).catch(reject);});
}
const post=(base,body,headers={})=>fetch(base+'/api/chat',{method:'POST',headers:{'Content-Type':'application/json',...headers},body:typeof body==='string'?body:JSON.stringify(body)});
const question={passageId:'shona-beginner',question:'Where does Tariro live?'};
test('static pages served; secrets and server source never public',()=>running({apiKey:''},async base=>{for(const file of ['/.env','/.env.example','/server.mjs','/package.json','/server.test.mjs','/../.env','/%2e%2e/.env'])assert.equal((await fetch(base+file)).status,404);const health=await(await fetch(base+'/api/health')).json();assert.equal(health.aiConfigured,false);assert.equal((await post(base,question)).status,503);}));
test('valid question uses authoritative passage, parses output, hides key',()=>running({apiKey:'test-secret',fetchImpl:async(url,options)=>{assert.equal(url,'https://api.anthropic.com/v1/messages');assert.equal(options.headers['x-api-key'],'test-secret');const payload=JSON.parse(options.body);assert.equal(payload.messages[0].role,'user');assert.equal(payload.store,undefined);assert.equal(payload.max_tokens,600);const input=JSON.parse(payload.messages[0].content);assert.equal(input.story.title,'Zuva raTariro');assert.equal(input.story.paragraphs.length,2);assert.equal(input.story.question,undefined);assert.equal(input.question,question.question);return Response.json({stop_reason:'end_turn',content:[{type:'text',text:'Tariro lives in Harare.'}]});}},async base=>{const res=await post(base,{...question,paragraphs:['fake story']});assert.equal(res.status,200);assert.deepEqual(await res.json(),{answer:'Tariro lives in Harare.'});}));
test('invalid requests and untrusted origins rejected before AI call',()=>running({apiKey:'test',fetchImpl:()=>{throw new Error('Must not call');}},async base=>{for(const body of [null,[],{}, {...question,question:' '},{...question,question:'x'.repeat(1001)},'{'])assert.equal((await post(base,body)).status,400);assert.equal((await post(base,{...question,passageId:'missing'})).status,404);assert.equal((await post(base,question,{Origin:'https://untrusted.example'})).status,403);assert.equal((await post(base,'x'.repeat(9000))).status,413);assert.equal((await fetch(base+'/api/chat')).status,405);assert.equal((await post(base,question,{'Content-Type':'text/plain'})).status,415);}));
test('request limit blocks repeated AI calls',()=>running({apiKey:'',limit:1},async base=>{assert.equal((await post(base,question)).status,503);const res=await post(base,question);assert.equal(res.status,429);assert.equal(res.headers.get('retry-after'),'60');}));
test('provider errors never expose sensitive upstream details',()=>running({apiKey:'test',fetchImpl:async()=>Response.json({error:'sensitive upstream detail'},{status:401})},async base=>{const res=await post(base,question);assert.equal(res.status,502);assert(!(await res.text()).includes('sensitive'));}));
test('timeout and empty answers are handled',async()=>{await running({apiKey:'test',fetchImpl:async()=>{throw new DOMException('timed out','TimeoutError');}},async base=>assert.equal((await post(base,question)).status,504));await running({apiKey:'test',fetchImpl:async()=>Response.json({stop_reason:'end_turn',content:[]})},async base=>assert.equal((await post(base,question)).status,502));});
test('separate local frontend: preflight and errors include exact allowed origin',()=>running({apiKey:'',frontendOrigins:'http://localhost:5500,http://127.0.0.1:5500',apiOnly:true},async base=>{
 const origin='http://localhost:5500';
 const preflight=await fetch(base+'/api/chat',{method:'OPTIONS',headers:{Origin:origin,'Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'content-type'}});
 assert.equal(preflight.status,204);assert.equal(preflight.headers.get('access-control-allow-origin'),origin);assert.equal(preflight.headers.get('access-control-allow-methods'),'POST');
 const res=await post(base,question,{Origin:origin});assert.equal(res.status,503);assert.equal(res.headers.get('access-control-allow-origin'),origin);
 assert.equal((await post(base,question,{Origin:'http://localhost:5501'})).status,403);
 assert.equal((await post(base,question,{Origin:'null'})).status,403);
 assert.equal((await fetch(base+'/')).status,404);assert.equal((await fetch(base+'/app.js')).status,404);assert.equal((await fetch(base+'/api/health')).status,200);
}));
test('submission files: null origin allowed only when explicitly configured',()=>running({apiKey:'',frontendOrigins:'null',apiOnly:true},async base=>{
 const res=await fetch(base+'/api/chat',{method:'OPTIONS',headers:{Origin:'null','Access-Control-Request-Method':'POST'}});
 assert.equal(res.status,204);assert.equal(res.headers.get('access-control-allow-origin'),'null');
 const answer=await post(base,question,{Origin:'null'});assert.equal(answer.status,503);assert.equal(answer.headers.get('access-control-allow-origin'),'null');
 assert.equal((await post(base,question,{Origin:'https://untrusted.example'})).status,403);
}));
test('AI quiz: wrong answers stay, correct answers advance, five completes, key stays hidden',()=>running({apiKey:'test',frontendOrigins:'null',fetchImpl:async(url,options)=>{
 const payload=JSON.parse(options.body);assert.equal(payload.output_config.format.type,'json_schema');assert.equal(payload.messages[0].role,'user');assert.equal(payload.store,undefined);const input=JSON.parse(payload.messages[0].content);assert.equal(input.paragraphs.length,2);
 const number=input.previousQuestions.length+1;
 return Response.json({stop_reason:'end_turn',content:[{type:'text',text:JSON.stringify({prompt:`Passage question ${number}?`,options:['Harare','Bulawayo','Mutare'],correctIndex:0,explanation:'The passage says Harare.'})}]});
}},async base=>{
 const call=async(path,body)=>{const res=await fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json',Origin:'null'},body:JSON.stringify(body)});return {status:res.status,body:await res.json()};};
 const pre=await fetch(base+'/api/quiz',{method:'OPTIONS',headers:{Origin:'null'}});assert.equal(pre.status,204);
 let r=await call('/api/quiz',{passageId:'shona-beginner'});assert.equal(r.status,200);let q=r.body.question;assert.equal(q.number,1);assert.equal(q.total,5);assert.equal(q.correctIndex,undefined);assert.equal(q.explanation,undefined);
 const wrong=await call('/api/quiz/answer',{token:q.token,answer:1});assert.equal(wrong.body.correct,false);assert.equal(wrong.body.question,undefined);
 assert.equal((await call('/api/quiz/answer',{token:q.token,answer:8})).status,400);
 assert.equal((await call('/api/quiz/answer',{token:q.token.slice(0,-6)+'broken',answer:0})).status,410);
 for(let n=1;n<=5;n++){r=await call('/api/quiz/answer',{token:q.token,answer:0});assert.equal(r.status,200);assert.equal(r.body.correct,true);if(n<5){q=r.body.question;assert.equal(q.number,n+1);}else{assert.equal(r.body.complete,true);assert.equal(r.body.completed,5);assert.equal(r.body.question,undefined);}}
}));
test('AI quiz fails clearly without key and rejects malformed generated answers',async()=>{
 await running({apiKey:''},async base=>{const res=await fetch(base+'/api/quiz',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({passageId:'shona-beginner'})});assert.equal(res.status,503);});
 await running({apiKey:'test',fetchImpl:async()=>Response.json({content:[{type:'text',text:'{"prompt":"bad"}'}]})},async base=>{const res=await fetch(base+'/api/quiz',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({passageId:'shona-beginner'})});assert.equal(res.status,502);});
});
test('short story generation preserves language/level and feeds new passage to quiz and chat',()=>running({apiKey:'test',frontendOrigins:'null',fetchImpl:async(url,options)=>{
 const payload=JSON.parse(options.body);
 let text;
 if(payload.output_config?.format.schema.properties.paragraphs) {assert(payload.system.includes('60 words'));text=JSON.stringify({title:'Nyaya itsva',summary:'A short new story.',paragraphs:['Tariro anomuka mangwanani achienda kuchikoro neshamwari yake. Vanofamba pamwe vachitaura nezvemabhuku avo. Kusvika kuchikoro vanogara pasi votanga kuverenga.'],vocabulary:[{word:'mangwanani',meaning:'Morning'},{word:'kuchikoro',meaning:'To school'},{word:'mabhuku',meaning:'Books'}]});}
 else if(payload.output_config?.format.schema.properties.prompt){const data=JSON.parse(payload.messages[0].content);assert.equal(data.title,'Nyaya itsva');assert(data.paragraphs[0].startsWith('Tariro anomuka'));text=JSON.stringify({prompt:'Who goes to school?',options:['Tariro','A farmer','No one'],correctIndex:0,explanation:'The story names Tariro.'});}
 else{assert.equal(JSON.parse(payload.messages[0].content).story.title,'Nyaya itsva');text='Tariro goes to school.';}
 return Response.json({stop_reason:'end_turn',content:[{type:'text',text}]});
}},async base=>{
 const call=async(path,body)=>{const r=await fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json',Origin:'null'},body:JSON.stringify(body)});return {status:r.status,body:await r.json()};};
 const generated=await call('/api/stories/generate',{language:'shona',level:'beginner'});assert.equal(generated.status,200);const s=generated.body.story;assert.equal(s.language,'shona');assert.equal(s.level,'beginner');assert(s.wordCount<=60);assert(s.id.startsWith('generated-'));assert.equal(s.question,undefined);
 const quiz=await call('/api/quiz',{passageId:s.id});assert.equal(quiz.status,200);assert.equal(quiz.body.question.prompt,'Who goes to school?');
 const chat=await call('/api/chat',{passageId:s.id,question:'Who goes to school?'});assert.equal(chat.status,200);assert.equal(chat.body.answer,'Tariro goes to school.');
 assert.equal((await call('/api/stories/generate',{language:'english',level:'beginner'})).status,400);
 assert.equal((await call('/api/stories/generate',{language:'ndebele',level:'expert'})).status,400);
 const pre=await fetch(base+'/api/stories/generate',{method:'OPTIONS',headers:{Origin:'null'}});assert.equal(pre.status,204);
}));
test('story generation enforces short limits for every level and handles missing API key',async()=>{
 for(const [level,max] of [['beginner',60],['intermediate',85],['advanced',110]]){
 await running({apiKey:'test',fetchImpl:async(url,options)=>{const payload=JSON.parse(options.body);assert(payload.system.includes(`${max} words`));return Response.json({stop_reason:'end_turn',content:[{type:'text',text:JSON.stringify({title:'Indaba',summary:'A draft.',paragraphs:[Array(max+1).fill('word').join(' ')],vocabulary:[{word:'word',meaning:'A word'},{word:'next',meaning:'Next'},{word:'last',meaning:'Last'}]})}]});}},async base=>{const r=await fetch(base+'/api/stories/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({language:'ndebele',level})});assert.equal(r.status,502);});}
 await running({apiKey:''},async base=>{const r=await fetch(base+'/api/stories/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({language:'shona',level:'beginner'})});assert.equal(r.status,503);});
});
test('Claude requests use Anthropic headers and reject truncated output',()=>running({apiKey:'test-secret',fetchImpl:async(url,options)=>{assert.equal(url,'https://api.anthropic.com/v1/messages');assert.equal(options.headers['x-api-key'],'test-secret');assert.equal(options.headers['anthropic-version'],'2023-06-01');assert.equal(options.headers.Authorization,undefined);const body=JSON.parse(options.body);assert.equal(body.max_tokens,1000);assert.equal(body.model,'claude-haiku-4-5-20251001');assert.equal(body.output_config.format.schema.properties.options.maxItems,undefined);return Response.json({stop_reason:'max_tokens',content:[{type:'text',text:'partial'}]});}},async base=>{const r=await fetch(base+'/api/quiz',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({passageId:'shona-beginner'})});assert.equal(r.status,502);}));
