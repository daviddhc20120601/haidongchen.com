async function s(a){const o=`/data/${a}.json`,t=await fetch(o);if(!t.ok)throw new Error(`Failed to load ${a} data: ${t.status} ${t.statusText}`);return t.json()}export{s as g};
