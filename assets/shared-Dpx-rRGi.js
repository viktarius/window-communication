(function(){"use strict";let s={};onconnect=function(a){const n=a.ports[0];n.onmessage=e=>{const t=e.data;switch(t.type){case"sync":s[t.id].isActive=!0;break;case"data":s[t.id]={isActive:!0,point:t.point,port:n};const o=Object.entries(s).map(([,{port:r}])=>r),c=Object.entries(s).reduce((r,[i,{point:p}])=>(r.push({id:i,point:p}),r),[]);o.forEach(r=>{r.postMessage(c)});break}}},setInterval(()=>{let a=!1;s=Object.fromEntries(Object.entries(s).filter(([,{isActive:e}])=>(e||(a=!0),e)).map(([e,t])=>[e,{...t,isActive:!1}]));const n=Object.entries(s).map(([,{port:e}])=>e);if(n.forEach(e=>{e.postMessage("sync")}),a){const e=Object.entries(s).reduce((t,[o,{point:c}])=>(t.push({id:o,point:c}),t),[]);n.forEach(t=>{t.postMessage(e)})}},200)})();
