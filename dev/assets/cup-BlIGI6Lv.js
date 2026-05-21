import{A as e,B as t,C as n,E as r,F as i,G as a,H as o,I as s,J as c,K as l,M as u,N as d,O as f,P as p,T as m,U as h,W as g,X as _,Y as v,_ as y,b,d as ee,f as x,g as S,h as C,n as w,o as T,p as E,q as D,r as te,s as O,t as k,u as A,v as j,w as M,x as N,z as P}from"./index-DJ_qKlqo.js";import{t as F}from"./ScoreNumberpad-C-b3sWkY.js";function I(e){let t=[...e];for(let e=t.length-1;e>0;e--){let n=Math.floor(Math.random()*(e+1));[t[e],t[n]]=[t[n],t[e]]}return t}function L(e){return e===2||e===4?!0:e<2?!1:e%3==0?L(Math.floor(e/3)*2):e%2==0?L(e/2):!1}function R(e){return e%3==0?{c3:e/3,c2:0}:e%2==0?{c3:0,c2:e/2}:{c3:0,c2:0}}function z(e){if(e<2)return[];let t=[],n=Math.floor(e/2);for(let r=e%3;r<=n&&r<=3&&t.filter(e=>e.c2===0).length<2;r+=3){let n=(e-r)/3;if(n<1)break;L(r+2*n)&&t.push({walkovers:r,c3:n,c2:0})}for(let r=e%2;r<=n&&r<=3&&t.filter(e=>e.c3===0).length<2;r+=2){let n=(e-r)/2;if(n<1)break;let i=r+n;!t.some(e=>e.walkovers===r&&e.c3===0&&e.c2===n)&&L(i)&&t.push({walkovers:r,c3:0,c2:n})}return t.sort((e,t)=>e.walkovers-t.walkovers||t.c3-e.c3),t}function B(e){return e===2?!0:z(e).length>0}function V(e){let t=Math.ceil(e*.5),n=Math.floor(e*.8),r=[];for(let i=n;i>=t;i--){let t=e-i;t>=2&&B(i)&&B(t)&&r.push({nA:i,nB:t})}return r}function H(e,{runde1:t=null,walkovers1:n=null}={}){let r=[],i=e,a=1,o=!0;for(;i>2;){let e,s,c;if(o){let r=t;!r&&n!==null&&(r={walkovers:n,c3:Math.floor((i-n)/3),c2:0}),r||=z(i)[0]??{walkovers:i%3,c3:Math.floor(i/3),c2:0},c=r.walkovers,e=r.c3,s=r.c2,o=!1}else{let t=R(i);e=t.c3,s=t.c2,c=0}let l=e*2+s+c;r.push({runde:a,spelarar:i,baner:e+s,treSpelarar:e>0,walkovers:c,vidare:l}),i=l,a++}return r}function U(e,{medSeeding:t=!0,isRunde1:n=!1,walkoverTall:r=null,runde1Oppsett:i=null}={}){let a=[],o=[...e];if(n){let e=i?.walkovers??r??o.length%3;if(e>0){let t=o.slice(0,e);o=o.slice(e);for(let e of t)a.push({spelarar:[e.kasterid],erWalkover:!0,erTreSpelarar:!1})}}let s=o.length,c,l;if(i&&n)c=i.c3,l=i.c2;else if(n)c=Math.floor(s/3),l=0;else{let e=R(s);c=e.c3,l=e.c2}let u=c+l;if(t&&u>0){let e=I(o.slice(0,u)),t=I(o.slice(u,2*u)),n=I(o.slice(2*u)),r=0;for(let i=0;i<u;i++){let o=i<c,s=[e[i],t[i]];o&&n[r]&&s.push(n[r++]),a.push({spelarar:s.map(e=>e.kasterid),erWalkover:!1,erTreSpelarar:o})}}else{let e=I(o),t=0;for(let n=0;n<c;n++)a.push({spelarar:e.slice(t,t+3).map(e=>e.kasterid),erWalkover:!1,erTreSpelarar:!0}),t+=3;for(let n=0;n<l;n++)a.push({spelarar:e.slice(t,t+2).map(e=>e.kasterid),erWalkover:!1,erTreSpelarar:!1}),t+=2}return a}function W(e,{visSpelarliste:t=!0,initNa:n=null,initFormat:r=null}={}){let i=typeof e==`number`?e:e.length,a=typeof e==`number`?[]:e.map((e,t)=>({...e,cupPlassering:t+1})),o=V(i),s=n===i?i:n!=null&&o.some(e=>e.nA===n)?n:o[0]?.nA??i,c=i-s,l=o.filter(e=>z(e.nA).some(e=>e.c3>0)),u=o.filter(e=>!z(e.nA).some(e=>e.c3>0)),d=z(i).length>0,f=(e,t)=>e.map((e,r)=>{let a=e.nA===s&&n!==i,o=t+r;return`
      <div class="form-check">
        <input class="form-check-input" type="radio" name="gruppe-split" id="split-${o}" value="${e.nA}" ${a?`checked`:``}>
        <label class="form-check-label" for="split-${o}">A:${e.nA} — B:${e.nB}</label>
      </div>`}).join(``),p=[];l.length&&p.push(`<div class="text-muted small fw-semibold mb-1">3 spillere per bane (A)</div>${f(l,0)}`),u.length&&(p.length&&p.push(`<hr class="my-2">`),p.push(`<div class="text-muted small fw-semibold mb-1">2 spillere per bane (A)</div>${f(u,l.length)}`)),d&&(p.length&&p.push(`<hr class="my-2">`),p.push(`
      <div class="form-check">
        <input class="form-check-input" type="radio" name="gruppe-split" id="split-ingen" value="${i}" ${n===i?`checked`:``}>
        <label class="form-check-label" for="split-ingen">Ingen gruppeinndeling (alle i A)</label>
      </div>`));let m=p.join(``),h=r?.A??z(s)[0]??null,g=c>=2?r?.B??z(c)[0]??null:null,_=t?`<div id="gruppe-preview">${G(a,s,h?.walkovers??0,g?.walkovers??0)}</div>`:``;return`
    <div id="gruppe-val-wrapper" data-n="${i}">
      <h5 class="mb-3">Velg gruppeinndeling for cup</h5>
      <div class="d-flex gap-3 align-items-start flex-wrap mb-3">
        <div class="card">
          <div class="card-body">
            ${m}
          </div>
        </div>
        <div id="gruppe-paneler" class="d-flex gap-3 flex-wrap">
          <div id="gruppe-panel-a" class="avsl-gruppe-kol">
            ${Y(`Gruppe A`,s,`runde1-format-a`,h)}
          </div>
          ${c>=2?`<div id="gruppe-panel-b" class="avsl-gruppe-kol">
            ${Y(`Gruppe B`,c,`runde1-format-b`,g)}
          </div>`:``}
        </div>
      </div>
      <div class="mt-3">
        <button id="bekreft-gruppe-btn" class="btn btn-success btn-lg w-100">Bekreft gruppefordeling</button>
      </div>
      ${_}
    </div>
  `}function G(e,t,n=0,r=0){let i=e.slice(0,t),a=e.slice(t);function o(e,t=0){return e.map((e,n)=>{let r=n<t;return`
      <tr>
        <td>${e.cupPlassering}</td>
        <td>${l(String(e.startnummer??``))}</td>
        <td>${l(e.navn??``)}${r?` <span class="badge bg-info text-dark">Walkover</span>`:``}</td>
        <td class="text-center">${e.kamp_poeng??0}</td>
        <td class="text-center">${e.score_poeng??0}</td>
      </tr>`}).join(``)}let s=`
    <thead class="org-thead"><tr>
      <th class="th-32">#</th><th class="th-36">S</th><th>NAMN</th>
      <th class="th-44 text-center">KP</th>
      <th class="th-44 text-center">SP</th>
    </tr></thead>`,c=`
    <table class="table table-bordered table-sm bg-white mb-0">
      ${s}
      <tbody>${o(i,n)}</tbody>
    </table>`,u=a.length?`
    <table class="table table-bordered table-sm bg-white mb-0">
      ${s}
      <tbody>${o(a,r)}</tbody>
    </table>`:``;return`
    <div class="d-flex gap-3 flex-wrap">
      <div class="avsl-gruppe-kol">
        <h6 class="fw-bold text-center">GRUPPE A (${i.length})</h6>
        ${c}
      </div>
      ${a.length?`<div class="avsl-gruppe-kol">
        <h6 class="fw-bold text-center">GRUPPE B (${a.length})</h6>
        ${u}
      </div>`:``}
    </div>`}function K(e){let t=e.c3>0?3:2;return`${e.walkovers} walkover - ${t} deltakere per bane`}function q(e,t,n,r=null){let i=z(t);return i.length<=1?``:`<div class="d-flex flex-column align-items-start gap-1 mb-2">${i.map((e,t)=>{let i=`${n}-${t}`,a=JSON.stringify(e),o=r?e.walkovers===r.walkovers&&e.c3===r.c3&&e.c2===r.c2:t===0,s=e.c3>0?`btn-outline-success`:`btn-outline-warning`;return`
      <input type="radio" class="btn-check" name="${n}" id="${i}"
        value='${a}' data-oppsett='${a}' autocomplete="off" ${o?`checked`:``}>
      <label class="btn btn-sm ${s}" for="${i}">${K(e)}</label>`}).join(``)}</div>`}function J(e,t,n){return`<div id="struktur-${n}">
    <table class="table table-sm table-bordered mb-0">
      <thead><tr>
        <th>Runde</th><th>Deltakere (w.o.)</th><th>Baner</th><th>Per bane</th>
      </tr></thead>
      <tbody>${(e>=2?H(e,{runde1:t}):[]).map((e,n)=>{let r=e.walkovers??0,i=e.spelarar-r,a=r>0?`${i} <span class="text-muted">(${r} w.o.)</span>`:`${i}`,o;return o=n===0&&t?t.c3>0&&t.c2>0?`2/3`:t.c3>0?`3`:`2`:e.spelarar%e.baner===0?String(e.spelarar/e.baner):`2/3`,`<tr${e.treSpelarar?` class="fw-bold"`:``}>
      <td>${e.runde}</td>
      <td>${a}</td>
      <td>${e.baner}</td>
      <td>${o}</td>
    </tr>`}).join(``)}</tbody>
    </table>
  </div>`}function Y(e,t,n,r){let i=n.slice(-1),a=q(e,t,n,r);return`
    <div class="card">
      <div class="card-body">
        <h6 class="fw-bold mb-2">${a?`${e}: Velg format`:`${e} (${t})`}</h6>
        ${a}
        ${J(t,r,i)}
      </div>
    </div>`}function X(){return crypto.randomUUID()}async function Z(e,t,n,r,i=0,a=null){let o=t.map(()=>X()),s=i,c=t.map((t,i)=>({match_id:o[i],stevneid:e,fase:`avsluttende`,runde_nummer:n,gruppe_navn:r??null,bane_nummer:t.erWalkover?null:++s,er_bekreftet:!1,er_walkover:t.erWalkover,er_tre_spelarar:t.erTreSpelarar,runde_navn:a})),{data:l,error:u}=await _.from(`kamp`).insert(c).select(`id, match_id`);if(u)throw Error(`Feil ved innsetting av cup-kampar: `+u.message);let d=Object.fromEntries(l.map(e=>[e.match_id,e.id])),f=[];for(let e=0;e<t.length;e++){let n=d[o[e]];t[e].spelarar.forEach((e,t)=>{f.push({kampid:n,kasterid:e,posisjon:t+1,score_poeng:0,kamp_poeng:0,antall_ringer:0})})}let{error:p}=await _.from(`kamp_spelar`).insert(f);if(p)throw Error(`Feil ved innsetting av cup-spelarar: `+p.message);return l.length}async function ne(e,t,n,r=null){let i=[`A`,`B`,`C`],a=0;for(let o of t){let t=U(o.spelarar,{medSeeding:n,isRunde1:!0,runde1Oppsett:o.runde1Oppsett??null}),{data:s}=await _.from(`kamp`).select(`bane_nummer`).eq(`stevneid`,e).eq(`fase`,`avsluttende`).eq(`runde_nummer`,1).not(`bane_nummer`,`is`,null).order(`bane_nummer`,{ascending:!1}).limit(1),c=s?.[0]?.bane_nummer??0,l=0;if(r&&o.gruppeNavn){let e=i.indexOf(o.gruppeNavn);for(let t=0;t<e;t++){let e=r[i[t]];e&&(l+=(e.c3??0)+(e.c2??0))}}let u=Math.max(c,l),d=o.spelarar.length===4;a+=await Z(e,t,1,o.gruppeNavn,u,d?`Semifinale`:null)}return a}async function re(e,t,n,r){let{data:i}=await _.from(`kamp`).select(`runde_nummer`).eq(`stevneid`,e).eq(`fase`,`avsluttende`).eq(`gruppe_navn`,t).order(`runde_nummer`,{ascending:!1}).limit(1),a=(i?.[0]?.runde_nummer??0)+1,o=r,s=o.length===4,c=U(o,{medSeeding:n,isRunde1:!1}),{data:l}=await _.from(`kamp`).select(`bane_nummer`).eq(`stevneid`,e).eq(`fase`,`avsluttende`).eq(`runde_nummer`,a).not(`bane_nummer`,`is`,null).order(`bane_nummer`,{ascending:!1}).limit(1);return{rundeNummer:a,antallKampar:await Z(e,c,a,t,l?.[0]?.bane_nummer??0,s?`Semifinale`:null)}}async function ie(e,t){let{data:n}=await _.from(`kamp`).select(`id, runde_nummer, spelarar:kamp_spelar(id, kasterid, score_poeng, posisjon, omgangar:kamp_omgang(score))`).eq(`stevneid`,e).eq(`fase`,`avsluttende`).eq(`gruppe_navn`,t).eq(`runde_navn`,`Semifinale`).eq(`er_bekreftet`,!0);if(!n?.length)throw Error(`Semifinalane er ikkje bekrefta.`);let r=n,i=r[0].runde_nummer+1,a=[],o=[];for(let e of r){let t=[...e.spelarar??[]].sort((e,t)=>{let n=e.omgangar?.length?e.omgangar.reduce((e,t)=>e+(t.score??0),0):e.score_poeng??0;return(t.omgangar?.length?t.omgangar.reduce((e,t)=>e+(t.score??0),0):t.score_poeng??0)-n});t[0]&&a.push(t[0].kasterid),t[1]&&o.push(t[1].kasterid)}let{data:s}=await _.from(`kamp`).select(`bane_nummer`).eq(`stevneid`,e).eq(`fase`,`avsluttende`).eq(`runde_nummer`,i).not(`bane_nummer`,`is`,null).order(`bane_nummer`,{ascending:!1}).limit(1),c=s?.[0]?.bane_nummer??0,l={match_id:X(),stevneid:e,fase:`avsluttende`,runde_nummer:i,gruppe_navn:t,bane_nummer:c+1,runde_navn:`Finale`,er_bekreftet:!1,er_walkover:!1,er_tre_spelarar:!1},u={match_id:X(),stevneid:e,fase:`avsluttende`,runde_nummer:i,gruppe_navn:t,bane_nummer:c+2,runde_navn:`Bronsefinale`,er_bekreftet:!1,er_walkover:!1,er_tre_spelarar:!1},{data:d,error:f}=await _.from(`kamp`).insert([l,u]).select(`id, runde_navn`);if(f)throw Error(`Feil: `+f.message);let p=d,m=p.find(e=>e.runde_navn===`Finale`).id,h=p.find(e=>e.runde_navn===`Bronsefinale`).id,g=[...a.filter(e=>e!=null).map((e,t)=>({kampid:m,kasterid:e,posisjon:t+1,score_poeng:0,kamp_poeng:0,antall_ringer:0})),...o.filter(e=>e!=null).map((e,t)=>({kampid:h,kasterid:e,posisjon:t+1,score_poeng:0,kamp_poeng:0,antall_ringer:0}))],{error:v}=await _.from(`kamp_spelar`).insert(g);if(v)throw Error(`Feil: `+v.message)}function ae(e,t,r,i,a,o){let s=r.filter(e=>e.runde_eliminert==null),c=r.length,u=s.length,d=i===1?a?.[t]??null:null,f=d?.walkovers??0,p=(d?d.c3:u%3==0?u/3:0)+(d?d.c2:u%3==0?0:u/2),m=s.slice(f,f+p),h=s.slice(f+p,f+2*p),g=s.slice(f+2*p),_=document.createElement(`div`);_.className=`avsl-dialog-overlay`,document.body.appendChild(_);function y(r){let f=r&&p>0?[{label:`Seeding 1`,pool:m},{label:`Seeding 2`,pool:h},...g.length?[{label:`Seeding 3`,pool:g}]:[]].map(({label:e,pool:t})=>`
          <div class="flex-grow-1">
            <strong class="d-block mb-1">${l(e)}</strong>
            ${t.map(e=>`<div class="small">${l(e.navn??``)} — ${e.kamp_poeng??0}p (${e.score_poeng??0})</div>`).join(``)}
          </div>`).join(``):s.map((e,t)=>`<div class="small">${t+1}. ${l(e.navn??``)} — ${e.kamp_poeng??0}p (${e.score_poeng??0})</div>`).join(``);_.innerHTML=`
      <div class="card p-4 avsl-dialog-card-wide">
        <h5 class="mb-1">Gruppe ${l(t)} — Runde ${i}</h5>
        <p class="text-muted small mb-2">${u} av ${c} spelarar igjen</p>
        <div class="form-check mb-3">
          <input class="form-check-input" type="checkbox" id="seeding-dlg" ${r?`checked`:``}>
          <label class="form-check-label" for="seeding-dlg">Bruk seeding</label>
        </div>
        <div class="d-flex gap-3 flex-wrap mb-3">${f}</div>
        <div class="d-flex gap-2">
          <button id="bekreft-gen-btn" class="btn btn-primary">Bekreft og opprett kampar</button>
          <button id="avbryt-gen-btn" class="btn btn-secondary">Avbryt</button>
        </div>
      </div>`,_.querySelector(`#seeding-dlg`).addEventListener(`change`,e=>y(e.target.checked)),_.querySelector(`#avbryt-gen-btn`).addEventListener(`click`,()=>_.remove()),_.querySelector(`#bekreft-gen-btn`).addEventListener(`click`,async()=>{let r=_.querySelector(`#seeding-dlg`).checked,c=_.querySelector(`#bekreft-gen-btn`);c.disabled=!0,c.textContent=`Lagrer…`;try{let n=s.map((e,t)=>({kasterid:e.kasterid,plassering:t+1}));if(i===1){let i={A:a?.A??void 0,B:a?.B??void 0};await ne(e,[{gruppeNavn:t,spelarar:n,runde1Oppsett:d}],r,a?i:null)}else await re(e,t,r,n);_.remove(),await o()}catch(e){v(`cup:genererRunde`,e),n(`Feil ved generering av runde`,`error`),c.disabled=!1,c.textContent=`Bekreft og opprett kampar`}})}y(!0)}function oe(e,t,i,a){let o=t.map(e=>e?.kaster?`${l(e.kaster.fornavn)} ${l(e.kaster.etternavn)}`:`Spelar ${e?.posisjon??`?`}`),s=[],c=document.createElement(`div`);c.className=`avsl-dialog-overlay`,document.body.appendChild(c);function u(){let l=s.length===2?t.find(e=>e.kasterid!=null&&!s.includes(e.kasterid)):null;c.innerHTML=`
      <div class="card p-4 avsl-dialog-card">
        <h5 class="card-title mb-1">Bekreft 3-spelar kamp</h5>
        <p class="text-muted small mb-3">Vel dei to som går vidare. Den gjenverande er eliminert.</p>
        <div class="d-flex flex-column gap-2 mb-3">
          ${t.map((e,t)=>{let n=e.kasterid==null?-1:s.indexOf(e.kasterid),r=n!==-1,i=!!l&&l.kasterid===e.kasterid,a=n===0?`1. plass`:n===1?`2. plass`:``;return`<button
              class="btn ${r?`btn-success`:i?`btn-outline-danger`:`btn-outline-secondary`} text-start d-flex justify-content-between align-items-center"
              data-kasterid="${e.kasterid}"
              ${i?`disabled`:``}
            ><span>${o[t]}</span>${a?`<span class="badge bg-success-subtle text-success-emphasis">${a}</span>`:i?`<span class="badge bg-danger">Eliminert</span>`:``}</button>`}).join(``)}
        </div>
        <div class="d-flex gap-2">
          <button id="bekreft-tre-btn" class="btn btn-success" ${s.length===2?``:`disabled`}>Bekreft</button>
          <button id="avbryt-tre-btn" class="btn btn-secondary">Avbryt</button>
        </div>
      </div>
    `,c.querySelector(`#avbryt-tre-btn`).addEventListener(`click`,()=>c.remove()),c.querySelectorAll(`[data-kasterid]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=Number(e.dataset.kasterid),n=s.indexOf(t);n===-1?s.length<2&&s.push(t):s.splice(n,1),u()})}),c.querySelector(`#bekreft-tre-btn`)?.addEventListener(`click`,async()=>{if(s.length!==2)return;let o=t.find(e=>e.kasterid!=null&&!s.includes(e.kasterid))?.kasterid??null,l=t.map(e=>e.kasterid).filter(e=>e!=null);c.remove();let{error:u}=await r({kampId:e.id,stevneId:i,rundeNummer:e.runde_nummer,rundeNavn:e.runde_navn,allKasterids:l,eliminertId:o,vidareIds:[...s]});if(u){n(`DB-feil ved bekreft`,`error`);return}await a()})}u()}function se(e){return typeof e!=`object`||!e||Array.isArray(e)?null:e}function ce(e){return e.map(e=>({er_bekreftet:e.er_bekreftet,er_walkover:e.er_walkover,runde_nummer:e.runde_nummer,bane_nummer:e.bane_nummer,spelarar:le(e.spelarar)}))}function le(e){return e.map(e=>({kasterid:e.kasterid??0,kamp_poeng:e.kamp_poeng??0,score_poeng:e.score_poeng??0,posisjon:e.posisjon,antall_ringer:e.antall_ringer,omgangar:e.omgangar,kaster:e.kaster}))}function ue(r){let i=null,l=null,u=!1,d=new Set;async function f(e,{id:t,isAdmin:n=!1},r=null){l=r,u=n,i&&=(await M(i),null),e.replaceChildren(D(`Laster…`)),await p(e,t)}async function p(i,s){try{let[{data:f},{data:g},{data:_},{data:v},{count:S}]=await Promise.all([t(s),e(s),te(s),w([`A`,`B`]),o(s)]);if(!f){i.replaceChildren(c(`Stevne ikkje funne.`));return}let T=_.filter(e=>e.kasterid!=null),D=g.filter(e=>e.fase===`innledende`),k=g.filter(e=>e.fase===`avsluttende`),A={};for(let e of T)e.startnummer!=null&&(A[e.kasterid]=e.startnummer);let M={};for(let e of g)for(let t of e.spelarar)t.kasterid&&t.kaster&&!M[t.kasterid]&&(M[t.kasterid]=`${t.kaster.fornavn} ${t.kaster.etternavn}`);let P=ce(D),F=E(P,T,M,A),I=D.length>0&&D.every(e=>e.er_bekreftet),L=k.length>0,R=T.some(e=>e.gruppe!=null),z=Object.fromEntries(v.map(e=>[e.navn,e.id])),B=se(f.runde1_format),V={container:i,stevneid:s,stevne:f,stilling:F,startnrMap:A,navnMap:M,innlKampar:D,avslKampar:k,resultat:T,isAdmin:u,harGruppefordeling:R,alleInnlBekrefta:I,harAvslKampar:L,runde1Format:B,pameldingCount:S??0,gruppeNavnMap:z,reload:()=>p(i,s)};u&&l&&(l.innerHTML=y(f,{alleInnlBekrefta:I,harAvslKampar:L,harGruppefordeling:R,harPrekonfigurertFormat:B!=null&&f.stevne_fase!==`avsluttende`}));let H=C(i);if(R){let e=b(F,P,A,{tableId:`stilling-avsl`,harGrupper:!0,harEliminasjon:!0});i.innerHTML=`<div class="px-3 py-2">${j(r.renderKamparHtml(V),e)}</div>`,ee(i,`stilling-avsl`,d),x(i),H===`stilling`&&N(i,`stilling`),r.bindKamparEvents(i,V),h(i,s)}else i.innerHTML=`<div class="px-3 py-2">${r.renderSetupHtml(V)}</div>`;l?.querySelector(`#fullfør-turnering-btn`)?.addEventListener(`click`,async()=>{if(!await m({title:`Fullfør turnering`,message:`Vil du fullføre turneringa? Dette kan ikkje angrast.`,danger:!0}))return;let{error:e}=await O(s,F);if(e){n(`Feil ved lagring av plasseringar`,`error`);return}let{error:t}=await a(s);if(t){n(`Feil ved fullføring av turnering`,`error`);return}await p(i,s)}),r.bindHeaderEvents(l,V)}catch(e){v(`avsluttendeBase.lastOgVis`,e),i.replaceChildren(c(`Kunne ikkje laste avsluttande fase.`))}}function h(e,t){if(i)return;let n=S(t,[`avsluttende`],e,p,()=>{i&&=(M(i),null)});i=s(t,r.channelName(t),n)}return f}var Q=ue({channelName:e=>`stevne-avsl-cup-${e}`,renderKamparHtml:e=>{let{avslKampar:t,stilling:n,startnrMap:r,isAdmin:i}=e;return`<div class="d-flex gap-3 flex-wrap">${[...new Set(n.map(e=>e.gruppe?.navn).filter(e=>e!=null))].sort().map(e=>{let a=t.filter(t=>t.gruppe_navn===e),o=n.filter(t=>t.gruppe?.navn===e),s=o.filter(e=>e.runde_eliminert==null).length,c=o.length,l=a.length?Math.max(...a.map(e=>e.runde_nummer)):0,u=a.filter(e=>e.runde_nummer===l),d=u.length>0&&u.every(e=>e.er_bekreftet||e.er_walkover),f=a.some(e=>e.runde_navn===`Semifinale`);return de(e,a,s,c,l,i&&(a.length===0||d)&&s>1&&!f,r,i)}).join(``)}</div>`},bindKamparEvents:(e,t)=>{!t.isAdmin&&t.avslKampar.length===0||me(e,t.stevneid,t.avslKampar,t.isAdmin,t.reload)},renderSetupHtml:e=>{let{stevne:t,isAdmin:n,runde1Format:r,pameldingCount:i,stilling:a}=e,o=r?.nA??null;return t.stevne_fase===`avsluttende`?n?W(a,{visSpelarliste:!0,initNa:o,initFormat:r}):`<p class="text-muted fst-italic">Gruppefordeling er ikkje klar enno.</p>`:i>0&&n?W(i,{visSpelarliste:!1,initNa:o,initFormat:r}):``},bindHeaderEvents:(e,t)=>{let{container:r,stevneid:i,stevne:a,stilling:o,runde1Format:s,alleInnlBekrefta:c,harGruppefordeling:l,gruppeNavnMap:u,reload:d}=t;if(e?.querySelector(`#start-avsl-btn`)?.addEventListener(`click`,async()=>{if(!c)return;let{error:e}=await h(i,`avsluttende`);if(e){n(`Feil ved oppstart av avsluttande fase`,`error`);return}if(s?.nA!=null){let e=s.nA,t=u.A??null,r=u.B??null,{error:a}=await T(i,o.map((n,i)=>({kasterid:n.kasterid,gruppeid:i<e?t:r??t})));if(a){n(`Feil ved lagring av gruppefordeling`,`error`);return}}await d()}),!l){let e=o.length;function t(e,t){let n=r.querySelector(`input[name="${e}"]:checked`);if(n?.dataset.oppsett)try{return JSON.parse(n.dataset.oppsett)}catch{}return z(t)[0]??null}let s=r.querySelector(`#gruppe-paneler`);s&&s.addEventListener(`change`,n=>{let i=n.target;if(!i.matches(`input[name^="runde1-format"]`))return;let a=parseInt(r.querySelector(`input[name="gruppe-split"]:checked`)?.value??String(e)),s=e-a,c=t(`runde1-format-a`,a),l=t(`runde1-format-b`,s);if(i.name===`runde1-format-a`){let e=r.querySelector(`#struktur-a`);e&&(e.outerHTML=J(a,c,`a`))}else{let e=r.querySelector(`#struktur-b`);e&&(e.outerHTML=J(s,l,`b`))}let u=c?.walkovers??0,d=l?.walkovers??0,f=r.querySelector(`#gruppe-preview`);f&&(f.innerHTML=G(o.map((e,t)=>({...e,cupPlassering:t+1})),a,u,d))}),r.querySelectorAll(`input[name="gruppe-split"]`).forEach(t=>{t.addEventListener(`change`,()=>{let n=parseInt(t.value),i=e-n,a=z(n)[0]??null,c=i>=2?z(i)[0]??null:null;s&&(s.innerHTML=`<div id="gruppe-panel-a" class="avsl-gruppe-kol">
                ${Y(`Gruppe A`,n,`runde1-format-a`,a)}
              </div>`+(i>=2?`<div id="gruppe-panel-b" class="avsl-gruppe-kol">
                ${Y(`Gruppe B`,i,`runde1-format-b`,c)}
              </div>`:``));let l=a?.walkovers??0,u=c?.walkovers??0,d=r.querySelector(`#gruppe-preview`);d&&(d.innerHTML=G(o.map((e,t)=>({...e,cupPlassering:t+1})),n,l,u))})}),r.querySelector(`#bekreft-gruppe-btn`)?.addEventListener(`click`,async()=>{let s=r.querySelector(`input[name="gruppe-split"]:checked`);if(!s)return;let c=parseInt(s.value),l=e-c,{error:f}=await g(i,{A:t(`runde1-format-a`,c),B:l>=2?t(`runde1-format-b`,l):null,nA:c});if(f){n(`Feil ved lagring av format`,`error`);return}if(a.stevne_fase===`avsluttende`){let e=u.A??null,t=u.B??null,{error:r}=await T(i,o.map((n,r)=>({kasterid:n.kasterid,gruppeid:r<c?e:t??e})));if(r){n(`Feil ved lagring av gruppefordeling`,`error`);return}}await d()})}e?.querySelector(`#endre-gruppeinndeling-btn`)?.addEventListener(`click`,async()=>{await m({title:`Tilbakestill gruppeinndeling`,message:`Gruppefordeling og format vert fjerna.`,danger:!0})&&(await Promise.all([k(i),g(i,null)]),await d())}),l&&r.querySelectorAll(`[data-generer-gruppe]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.genererGruppe??``,n=parseInt(e.dataset.runde??`1`);ae(i,t,o.filter(e=>e.gruppe?.navn===t),n,s,d)})})}});function de(e,t,n,r,i,a,o,s=!0){let c=new Map;for(let e of t)c.has(e.runde_nummer)||c.set(e.runde_nummer,[]),c.get(e.runde_nummer).push(e);let u=[...c.entries()].reverse().map(([e,t])=>{let n=t[0]?.runde_navn??`Runde ${e}`,r=t.filter(e=>!e.er_walkover);return r.length?`
      <h6 class="fw-bold text-center mb-1">${l(n)}</h6>
      <div class="d-flex flex-wrap gap-2 mb-2">
        ${r.map(e=>fe(e,o,s)).join(``)}
      </div>`:``}).join(``),d=i+1,f=a?`<button class="btn btn-success w-100 mt-2"
         data-generer-gruppe="${l(e)}" data-runde="${d}">
         Generer runde ${d}
       </button>`:``;return`
    <div class="avsl-gruppe-kol">
      <h6 class="text-center fw-bold mb-2">Gruppe ${l(e)} (${r} spelarar)</h6>
      ${f}
      ${u}
    </div>`}function fe(e,t,n=!0){let r=e.spelarar.slice().sort((e,n)=>(t[e.kasterid??0]??999)-(t[n.kasterid??0]??999)),i=e=>e?.kaster?`${l(e.kaster.fornavn)} ${l(e.kaster.etternavn)}`:`—`,a=e.er_bekreftet||e.er_walkover,o=n&&e.er_bekreftet&&!e.er_tre_spelarar,s=e.er_walkover?`<tr>
        <td>${t[r[0]?.kasterid??0]??``}</td>
        <td colspan="2">${i(r[0])} <span class="badge bg-secondary">Walkover</span></td>
      </tr>`:r.map(n=>{let a=P(n),s=a>0?a:`—`,c=r.length,l=e.er_bekreftet&&n.kamp_plassering!=null&&n.kamp_plassering>=c,u=e.er_bekreftet&&n.kamp_plassering!=null&&n.kamp_plassering<c,d=l?`kamp-eliminert`:u?`kamp-vidare`:``,f=o?` data-endre-score="${e.id}" class="text-center score-redigerbar"`:` class="text-center"`;return`<tr${d?` class="${d}"`:``}>
          <td class="th-36 text-center">${t[n.kasterid??0]??``}</td>
          <td>${i(n)}</td>
          <td${f}>${s}</td>
        </tr>`}).join(``),c=r.some(e=>(e.omgangar?.length??0)>0),u,d,f,p;if(e.er_tre_spelarar)u=a?`btn-success`:`btn-outline-secondary`,d=a?`Endre plassering`:`Sett plassering`,f=!1,p=``;else{let t=A(e,pe(r),c);u=a?`btn-secondary`:t?`btn-success`:`btn-outline-secondary`,d=a?`Bekreftet`:`Bekreft`,f=a||!t,p=` btn-bekreft`}return`
    <div class="avsl-kamp-block">
      <div class="text-center small fw-semibold text-muted mb-1">Bane ${e.bane_nummer}</div>
      <table class="table table-sm table-bordered mb-0 bg-white">
        <tbody>
          ${s}
          <tr>
            <td colspan="3" class="text-end pe-1">
              ${n&&!e.er_walkover&&!e.er_tre_spelarar?`<button class="btn btn-primary btn-sm" id="plus-${e.id}"${a?` disabled`:``}>+</button> `:``}
              <button class="btn btn-secondary btn-sm" id="scoreboard-${e.id}"
                title="Scoreboard"${a&&!e.er_tre_spelarar?` disabled`:``}>S</button>
              ${n?`<button class="btn ${u} btn-sm${p}" id="bekrft-${e.id}"${f?` disabled`:``}>${d}</button>`:``}
            </td>
          </tr>
        </tbody>
      </table>
    </div>`}function pe(e){return e.map(e=>({kasterid:e.kasterid??0,kamp_poeng:e.kamp_poeng??0,score_poeng:e.score_poeng??0,posisjon:e.posisjon,antall_ringer:e.antall_ringer,omgangar:e.omgangar,kaster:e.kaster}))}function me(e,t,r,a,o){for(let s of r){let r=s.spelarar.slice().sort((e,t)=>(e.posisjon??0)-(t.posisjon??0));if(e.querySelector(`#plus-${s.id}`)?.addEventListener(`click`,async()=>{let e=r[0],t=r[1];F(e?.kaster?`${e.kaster.fornavn} ${e.kaster.etternavn}`:`—`,t?.kaster?`${t.kaster.fornavn} ${t.kaster.etternavn}`:`—`,P(e),P(t),async(n,r)=>{let i=[];e?.id&&i.push(d(e.id,n)),t?.id&&i.push(d(t.id,r)),await Promise.all(i),await o()})}),e.querySelector(`#scoreboard-${s.id}`)?.addEventListener(`click`,()=>{window.open(`#/kamp/${s.id}`,`_blank`)}),e.querySelector(`#bekrft-${s.id}`)?.addEventListener(`click`,async e=>{if(s.er_tre_spelarar)oe(s,r,t,async()=>{await $(t,s),await o()});else{let n=e.currentTarget;n.disabled=!0,n.textContent=`Lagrer…`;try{await he(t,s,r,o)||(n.disabled=!1,n.textContent=`Bekreft`)}catch{n.disabled=!1,n.textContent=`Bekreft`}}}),a&&s.er_bekreftet&&!s.er_tre_spelarar){let a=r[0],c=r[1],l=a?.kaster?`${a.kaster.fornavn} ${a.kaster.etternavn}`:`—`,u=c?.kaster?`${c.kaster.fornavn} ${c.kaster.etternavn}`:`—`,f=r.map(e=>e.kasterid).filter(e=>e!=null),m=()=>{F(l,u,P(a),P(c),async(e,r)=>{let l=[a?.id,c?.id].filter(e=>e!=null);if(l.length){let{error:e}=await i(l);if(e){n(`DB-feil ved sletting av omgangar`,`error`);return}}let u=[];if(a?.id&&u.push(d(a.id,e)),c?.id&&u.push(d(c.id,r)),(await Promise.all(u)).find(e=>e.error)?.error){n(`DB-feil ved oppdatering av score`,`error`);return}let m=e>=r?a?.kasterid:c?.kasterid,h=e>=r?c?.kasterid:a?.kasterid;await p({stevneId:t,rundeNummer:s.runde_nummer,rundeNavn:s.runde_navn,allKasterids:f,nyVinnarId:m,nyTaparId:h}),await o()})};e.querySelectorAll(`[data-endre-score="${s.id}"]`).forEach(e=>e.addEventListener(`click`,m))}}}async function he(e,t,i,a){let o=i[0],s=i[1],{data:c}=await u(t.id),l=c.find(e=>e.id===o?.id),d=c.find(e=>e.id===s?.id),f=P(l??o),p=P(d??s);if(f===0&&p===0&&!await m({title:`Ingen score registrert`,message:`Vil du bekrefte kampen likevel?`}))return!1;let h=f>=p?o:s,g=f>=p?s:o,_=i.map(e=>e.kasterid).filter(e=>e!=null),v=h?.kasterid==null?[]:[h.kasterid],{error:y}=await r({kampId:t.id,stevneId:e,rundeNummer:t.runde_nummer,rundeNavn:t.runde_navn,allKasterids:_,eliminertId:g?.kasterid??null,vidareIds:v});return y?(n(`DB-feil ved bekreft`,`error`),!1):(await $(e,t),await a(),!0)}async function $(e,t){t.runde_navn!==`Semifinale`||!t.gruppe_navn||await f(e,t.gruppe_navn)&&await ie(e,t.gruppe_navn)}export{Q as render};