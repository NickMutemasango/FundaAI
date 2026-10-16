// Keep the app's common prompt format separate from Anthropic's wire format.
function schemaForClaude(value){
 if(Array.isArray(value))return value.map(schemaForClaude);
 if(!value||typeof value!=='object')return value;
 return Object.fromEntries(Object.entries(value).filter(([key])=>!['minItems','maxItems','minimum','maximum','minLength','maxLength'].includes(key)).map(([key,item])=>[key,schemaForClaude(item)]));
}
export function claudePayload(prompt){
 const body={model:prompt.model,max_tokens:prompt.max_output_tokens,system:prompt.instructions,messages:[{role:'user',content:prompt.input}]};
 if(prompt.text?.format?.schema)body.output_config={format:{type:'json_schema',schema:schemaForClaude(prompt.text.format.schema)}};
 return body;
}
