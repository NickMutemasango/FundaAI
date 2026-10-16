import {claudePayload} from './claude.mjs';
import {randomUUID} from 'node:crypto';
const limits={beginner:60,intermediate:85,advanced:110};
const schema={type:'object',properties:{title:{type:'string'},summary:{type:'string'},paragraphs:{type:'array',items:{type:'string'},minItems:1,maxItems:3},vocabulary:{type:'array',minItems:3,maxItems:3,items:{type:'object',properties:{word:{type:'string'},meaning:{type:'string'}},required:['word','meaning'],additionalProperties:false}}},required:['title','summary','paragraphs','vocabulary'],additionalProperties:false};
export function createStoryService({stories,apiKey,model,fetchImpl}){
 const generated=new Map();
 function prune(){for(const [id,item] of generated)if(item.expires<Date.now())generated.delete(id);}
 function getStory(id){prune();return stories.find(x=>x.id===id)||generated.get(id)?.story;}
 async function generate(body){
  if(!body||!['shona','ndebele'].includes(body.language)||!Object.hasOwn(limits,body.level))return {status:400,data:{error:'Choose Shona or Ndebele and a valid reading level.'}};
  if(!apiKey)return {status:503,data:{error:'Story generation needs ANTHROPIC_API_KEY configured in Render.'}};
  prune();if(generated.size>=200)return {status:429,data:{error:'Story storage is full for now. Try again later.'}};
  try{
   const response=await fetchImpl('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'x-api-key':apiKey,'anthropic-version':'2023-06-01','Content-Type':'application/json'},signal:AbortSignal.timeout(30000),body:JSON.stringify(claudePayload({model,store:false,max_output_tokens:1400,instructions:`Write one original, child-friendly short story in ${body.language==='shona'?'Shona':'Zimbabwean Ndebele'} at ${body.level} reading level. Use everyday situations and a clear beginning and ending. Keep the story between 25 and ${limits[body.level]} words, in one to three short paragraphs. Beginners need very simple sentences; intermediate learners can have a little more detail; advanced learners can have richer vocabulary but still a short story. Title and paragraphs must be in the selected language. Give a short English summary and three vocabulary words appearing in the story with simple English meanings. Do not label the language as reviewed or verified. Use a fresh plot each time. Return the required JSON.`,input:JSON.stringify({language:body.language,level:body.level,variation:randomUUID()}),text:{format:{type:'json_schema',name:'short_story',strict:true,schema}}}))});
   if(!response.ok)return {status:response.status===429?429:502,data:{error:'The AI could not write a story right now. Please retry.'}};
   const data=await response.json();if(data.stop_reason!=='end_turn')throw Error();
   const output=(data.content||[]).filter(x=>x.type==='text').map(x=>x.text).join('');
   const s=JSON.parse(output);const valid=(x,max)=>typeof x==='string'&&x.trim()&&x.length<=max;
   if(!valid(s.title,100)||!valid(s.summary,250)||!Array.isArray(s.paragraphs)||s.paragraphs.length<1||s.paragraphs.length>3||s.paragraphs.some(x=>!valid(x,1800))||!Array.isArray(s.vocabulary)||s.vocabulary.length!==3||s.vocabulary.some(x=>!valid(x.word,80)||!valid(x.meaning,200)))throw Error();
   const words=s.paragraphs.join(' ').trim().split(/\s+/).length;
   if(words<15||words>limits[body.level])return {status:502,data:{error:'The AI story did not meet the short-length limit. Please generate again.'}};
   const story={id:'generated-'+randomUUID(),language:body.language,level:body.level,title:s.title,summary:s.summary,paragraphs:s.paragraphs,vocabulary:s.vocabulary,minutes:1,generated:true,wordCount:words};
   generated.set(story.id,{story,expires:Date.now()+60*60*1000});
   return {status:200,data:{story}};
  }catch(error){return {status:error.name==='TimeoutError'?504:502,data:{error:'The AI could not finish a short story. Please retry.'}};}
 }
 return {getStory,generate};
}
