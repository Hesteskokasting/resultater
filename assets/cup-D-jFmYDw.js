import{A as e,B as t,C as n,E as r,G as i,H as a,J as o,K as s,L as c,M as l,N as u,O as d,P as f,R as p,S as m,U as h,V as g,W as _,b as v,d as ee,g as y,h as b,j as x,l as S,m as C,n as te,o as w,p as ne,q as T,r as re,t as E,u as D,v as O,w as k,x as A,y as ie}from"./index-Zbekm5gX.js";import{t as j}from"./ScoreNumberpad-C-b3sWkY.js";function M(e){let t=[...e];for(let e=t.length-1;e>0;e--){let n=Math.floor(Math.random()*(e+1));[t[e],t[n]]=[t[n],t[e]]}return t}function N(e){return e===2||e===4?!0:e<2?!1:e%3==0?N(Math.floor(e/3)*2):e%2==0?N(e/2):!1}function P(e){return e%3==0?{c3:e/3,c2:0}:e%2==0?{c3:0,c2:e/2}:{c3:0,c2:0}}function F(e){if(e<2)return[];let t=[],n=Math.floor(e/2);for(let r=e%3;r<=n&&r<=3&&t.filter(e=>e.c2===0).length<2;r+=3){let n=(e-r)/3;if(n<1)break;N(r+2*n)&&t.push({walkovers:r,c3:n,c2:0})}for(let r=e%2;r<=n&&r<=3&&t.filter(e=>e.c3===0).length<2;r+=2){let n=(e-r)/2;if(n<1)break;let i=r+n;!t.some(e=>e.walkovers===r&&e.c3===0&&e.c2===n)&&N(i)&&t.push({walkovers:r,c3:0,c2:n})}return t.sort((e,t)=>e.walkovers-t.walkovers||t.c3-e.c3),t}function I(e){return e===2?!0:F(e).length>0}function L(e){let t=Math.ceil(e*.5),n=Math.floor(e*.8),r=[];for(let i=n;i>=t;i--){let t=e-i;t>=2&&I(i)&&I(t)&&r.push({nA:i,nB:t})}return r}function R(e,{runde1:t=null,walkovers1:n=null}={}){let r=[],i=e,a=1,o=!0;for(;i>2;){let e,s,c;if(o){let r=t;!r&&n!==null&&(r={walkovers:n,c3:Math.floor((i-n)/3),c2:0}),r||=F(i)[0]??{walkovers:i%3,c3:Math.floor(i/3),c2:0},c=r.walkovers,e=r.c3,s=r.c2,o=!1}else{let t=P(i);e=t.c3,s=t.c2,c=0}let l=e*2+s+c;r.push({runde:a,spelarar:i,baner:e+s,treSpelarar:e>0,walkovers:c,vidare:l}),i=l,a++}return r}function z(e,{medSeeding:t=!0,isRunde1:n=!1,walkoverTall:r=null,runde1Oppsett:i=null}={}){let a=[],o=[...e];if(n){let e=i?.walkovers??r??o.length%3;if(e>0){let t=o.slice(0,e);o=o.slice(e);for(let e of t)a.push({spelarar:[e.kasterid],erWalkover:!0,erTreSpelarar:!1})}}let s=o.length,c,l;if(i&&n)c=i.c3,l=i.c2;else if(n)c=Math.floor(s/3),l=0;else{let e=P(s);c=e.c3,l=e.c2}let u=c+l;if(t&&u>0){let e=M(o.slice(0,u)),t=M(o.slice(u,2*u)),n=M(o.slice(2*u)),r=0;for(let i=0;i<u;i++){let o=i<c,s=[e[i],t[i]];o&&n[r]&&s.push(n[r++]),a.push({spelarar:s.map(e=>e.kasterid),erWalkover:!1,erTreSpelarar:o})}}else{let e=M(o),t=0;for(let n=0;n<c;n++)a.push({spelarar:e.slice(t,t+3).map(e=>e.kasterid),erWalkover:!1,erTreSpelarar:!0}),t+=3;for(let n=0;n<l;n++)a.push({spelarar:e.slice(t,t+2).map(e=>e.kasterid),erWalkover:!1,erTreSpelarar:!1}),t+=2}return a}function B(e,{visSpelarliste:t=!0,initNa:n=null,initFormat:r=null}={}){let i=typeof e==`number`?e:e.length,a=typeof e==`number`?[]:e.map((e,t)=>({...e,cupPlassering:t+1})),o=L(i),s=n===i?i:n!=null&&o.some(e=>e.nA===n)?n:o[0]?.nA??i,c=i-s,l=o.filter(e=>F(e.nA).some(e=>e.c3>0)),u=o.filter(e=>!F(e.nA).some(e=>e.c3>0)),d=F(i).length>0,f=(e,t)=>e.map((e,r)=>{let a=e.nA===s&&n!==i,o=t+r;return`
      <div class="form-check">
        <input class="form-check-input" type="radio" name="gruppe-split" id="split-${o}" value="${e.nA}" ${a?`checked`:``}>
        <label class="form-check-label" for="split-${o}">A:${e.nA} — B:${e.nB}</label>
      </div>`}).join(``),p=[];l.length&&p.push(`<div class="text-muted small fw-semibold mb-1">3 spillere per bane (A)</div>${f(l,0)}`),u.length&&(p.length&&p.push(`<hr class="my-2">`),p.push(`<div class="text-muted small fw-semibold mb-1">2 spillere per bane (A)</div>${f(u,l.length)}`)),d&&(p.length&&p.push(`<hr class="my-2">`),p.push(`
      <div class="form-check">
        <input class="form-check-input" type="radio" name="gruppe-split" id="split-ingen" value="${i}" ${n===i?`checked`:``}>
        <label class="form-check-label" for="split-ingen">Ingen gruppeinndeling (alle i A)</label>
      </div>`));let m=p.join(``),h=r?.A??F(s)[0]??null,g=c>=2?r?.B??F(c)[0]??null:null,_=t?`<div id="gruppe-preview">${V(a,s,h?.walkovers??0,g?.walkovers??0)}</div>`:``;return`
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
            ${U(`Gruppe A`,s,`runde1-format-a`,h)}
          </div>
          ${c>=2?`<div id="gruppe-panel-b" class="avsl-gruppe-kol">
            ${U(`Gruppe B`,c,`runde1-format-b`,g)}
          </div>`:``}
        </div>
      </div>
      <div class="mt-3">
        <button id="bekreft-gruppe-btn" class="btn btn-success btn-lg w-100">Bekreft gruppefordeling</button>
      </div>
      ${_}
    </div>
  `}function V(e,t,n=0,r=0){let i=e.slice(0,t),a=e.slice(t);function o(e,t=0){return e.map((e,n)=>{let r=n<t;return`
      <tr>
        <td>${e.cupPlassering}</td>
        <td>${_(String(e.startnummer??``))}</td>
        <td>${_(e.navn??``)}${r?` <span class="badge bg-info text-dark">Walkover</span>`:``}</td>
        <td class="text-center">${e.kamp_poeng_innl??0}</td>
        <td class="text-center">${e.score_poeng_innl??0}</td>
      </tr>`}).join(``)}let s=`
    <thead class="org-thead"><tr>
      <th class="th-32">#</th><th class="th-36">S</th><th>NAMN</th>
      <th class="th-44 text-center">KP</th>
      <th class="th-44 text-center">SP</th>
    </tr></thead>`,c=`
    <table class="table table-bordered table-sm bg-white mb-0">
      ${s}
      <tbody>${o(i,n)}</tbody>
    </table>`,l=a.length?`
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
        ${l}
      </div>`:``}
    </div>`}function ae(e){let t=e.c3>0?3:2;return`${e.walkovers} walkover - ${t} deltakere per bane`}function oe(e,t,n,r=null){let i=F(t);return i.length<=1?``:`<div class="d-flex flex-column align-items-start gap-1 mb-2">${i.map((e,t)=>{let i=`${n}-${t}`,a=JSON.stringify(e),o=r?e.walkovers===r.walkovers&&e.c3===r.c3&&e.c2===r.c2:t===0,s=e.c3>0?`btn-outline-success`:`btn-outline-warning`;return`
      <input type="radio" class="btn-check" name="${n}" id="${i}"
        value='${a}' data-oppsett='${a}' autocomplete="off" ${o?`checked`:``}>
      <label class="btn btn-sm ${s}" for="${i}">${ae(e)}</label>`}).join(``)}</div>`}function H(e,t,n){return`<div id="struktur-${n}">
    <table class="table table-sm table-bordered mb-0">
      <thead><tr>
        <th>Runde</th><th>Deltakere (w.o.)</th><th>Baner</th><th>Per bane</th>
      </tr></thead>
      <tbody>${(e>=2?R(e,{runde1:t}):[]).map((e,n)=>{let r=e.walkovers??0,i=e.spelarar-r,a=r>0?`${i} <span class="text-muted">(${r} w.o.)</span>`:`${i}`,o;return o=n===0&&t?t.c3>0&&t.c2>0?`2/3`:t.c3>0?`3`:`2`:e.spelarar%e.baner===0?String(e.spelarar/e.baner):`2/3`,`<tr${e.treSpelarar?` class="fw-bold"`:``}>
      <td>${e.runde}</td>
      <td>${a}</td>
      <td>${e.baner}</td>
      <td>${o}</td>
    </tr>`}).join(``)}</tbody>
    </table>
  </div>`}function U(e,t,n,r){let i=n.slice(-1),a=oe(e,t,n,r);return`
    <div class="card">
      <div class="card-body">
        <h6 class="fw-bold mb-2">${a?`${e}: Velg format`:`${e} (${t})`}</h6>
        ${a}
        ${H(t,r,i)}
      </div>
    </div>`}function W(){return crypto.randomUUID()}async function G(e,t,n,r,i=0,a=null){let s=t.map(()=>W()),c=i,l=t.map((t,i)=>({match_id:s[i],stevneid:e,fase:`avsluttende`,runde_nummer:n,gruppe_navn:r??null,bane_nummer:t.erWalkover?null:++c,er_bekreftet:!1,er_walkover:t.erWalkover,er_tre_spelarar:t.erTreSpelarar,runde_navn:a})),{data:u,error:d}=await o.from(`kamp`).insert(l).select(`id, match_id`);if(d)throw Error(`Feil ved innsetting av cup-kampar: `+d.message);let f=Object.fromEntries(u.map(e=>[e.match_id,e.id])),p=[];for(let e=0;e<t.length;e++){let n=f[s[e]];t[e].spelarar.forEach((e,t)=>{p.push({kampid:n,kasterid:e,posisjon:t+1,score_poeng:0,kamp_poeng:0,antall_ringer:0})})}let{error:m}=await o.from(`kamp_spelar`).insert(p);if(m)throw Error(`Feil ved innsetting av cup-spelarar: `+m.message);return u.length}async function K(e){let{data:t}=await o.from(`resultat`).select(`kasterid, gruppeid, gruppe:gruppeid(navn), plassering, kamp_poeng_innl, score_poeng_innl, startnummer`).eq(`stevneid`,e).is(`runde_eliminert`,null);return t??[]}async function se(e,t,n,r=null){let i=[`A`,`B`,`C`],a=0;for(let s of t){let t=z(s.spelarar,{medSeeding:n,isRunde1:!0,runde1Oppsett:s.runde1Oppsett??null}),{data:c}=await o.from(`kamp`).select(`bane_nummer`).eq(`stevneid`,e).eq(`fase`,`avsluttende`).eq(`runde_nummer`,1).not(`bane_nummer`,`is`,null).order(`bane_nummer`,{ascending:!1}).limit(1),l=c?.[0]?.bane_nummer??0,u=0;if(r&&s.gruppeNavn){let e=i.indexOf(s.gruppeNavn);for(let t=0;t<e;t++){let e=r[i[t]];e&&(u+=(e.c3??0)+(e.c2??0))}}let d=Math.max(l,u),f=s.spelarar.length===4;a+=await G(e,t,1,s.gruppeNavn,d,f?`Semifinale`:null)}return a}async function ce(e,t,n){let{data:r}=await o.from(`kamp`).select(`runde_nummer`).eq(`stevneid`,e).eq(`fase`,`avsluttende`).eq(`gruppe_navn`,t).order(`runde_nummer`,{ascending:!1}).limit(1),i=(r?.[0]?.runde_nummer??0)+1,a=(await K(e)).filter(e=>e.gruppe?.navn===t);a.sort((e,t)=>(t.kamp_poeng_innl??0)-(e.kamp_poeng_innl??0)||(t.score_poeng_innl??0)-(e.score_poeng_innl??0)||(e.startnummer??0)-(t.startnummer??0));let s=a.map((e,t)=>({kasterid:e.kasterid,plassering:t+1})),c=s.length===4,l=z(s,{medSeeding:n,isRunde1:!1}),{data:u}=await o.from(`kamp`).select(`bane_nummer`).eq(`stevneid`,e).eq(`fase`,`avsluttende`).eq(`runde_nummer`,i).not(`bane_nummer`,`is`,null).order(`bane_nummer`,{ascending:!1}).limit(1);return{rundeNummer:i,antallKampar:await G(e,l,i,t,u?.[0]?.bane_nummer??0,c?`Semifinale`:null)}}async function le(e,t){let{data:n}=await o.from(`kamp`).select(`id, runde_nummer, spelarar:kamp_spelar(id, kasterid, score_poeng, posisjon, omgangar:kamp_omgang(score))`).eq(`stevneid`,e).eq(`fase`,`avsluttende`).eq(`gruppe_navn`,t).eq(`runde_navn`,`Semifinale`).eq(`er_bekreftet`,!0);if(!n?.length)throw Error(`Semifinalane er ikkje bekrefta.`);let r=n,i=r[0].runde_nummer+1,a=[],s=[];for(let e of r){let t=[...e.spelarar??[]].sort((e,t)=>{let n=e.omgangar?.length?e.omgangar.reduce((e,t)=>e+(t.score??0),0):e.score_poeng??0;return(t.omgangar?.length?t.omgangar.reduce((e,t)=>e+(t.score??0),0):t.score_poeng??0)-n});t[0]&&a.push(t[0].kasterid),t[1]&&s.push(t[1].kasterid)}let{data:c}=await o.from(`kamp`).select(`bane_nummer`).eq(`stevneid`,e).eq(`fase`,`avsluttende`).eq(`runde_nummer`,i).not(`bane_nummer`,`is`,null).order(`bane_nummer`,{ascending:!1}).limit(1),l=c?.[0]?.bane_nummer??0,u={match_id:W(),stevneid:e,fase:`avsluttende`,runde_nummer:i,gruppe_navn:t,bane_nummer:l+1,runde_navn:`Finale`,er_bekreftet:!1,er_walkover:!1,er_tre_spelarar:!1},d={match_id:W(),stevneid:e,fase:`avsluttende`,runde_nummer:i,gruppe_navn:t,bane_nummer:l+2,runde_navn:`Bronsefinale`,er_bekreftet:!1,er_walkover:!1,er_tre_spelarar:!1},{data:f,error:p}=await o.from(`kamp`).insert([u,d]).select(`id, runde_navn`);if(p)throw Error(`Feil: `+p.message);let m=f,h=m.find(e=>e.runde_navn===`Finale`).id,g=m.find(e=>e.runde_navn===`Bronsefinale`).id,_=[...a.filter(e=>e!=null).map((e,t)=>({kampid:h,kasterid:e,posisjon:t+1,score_poeng:0,kamp_poeng:0,antall_ringer:0})),...s.filter(e=>e!=null).map((e,t)=>({kampid:g,kasterid:e,posisjon:t+1,score_poeng:0,kamp_poeng:0,antall_ringer:0}))],{error:v}=await o.from(`kamp_spelar`).insert(_);if(v)throw Error(`Feil: `+v.message);for(let t of s)t!=null&&await o.from(`resultat`).update({runde_eliminert:r[0].runde_nummer,plassering:3}).eq(`stevneid`,e).eq(`kasterid`,t)}function ue(e,t,n,r,i,a){let o=n.filter(e=>e.runde_eliminert==null),s=n.length,c=o.length,l=r===1?i?.[t]??null:null,u=l?.walkovers??0,d=(l?l.c3:c%3==0?c/3:0)+(l?l.c2:c%3==0?0:c/2),f=o.slice(u,u+d),p=o.slice(u+d,u+2*d),m=o.slice(u+2*d),h=document.createElement(`div`);h.className=`avsl-dialog-overlay`,document.body.appendChild(h);function g(n){let u=n&&d>0?[{label:`Seeding 1`,pool:f},{label:`Seeding 2`,pool:p},...m.length?[{label:`Seeding 3`,pool:m}]:[]].map(({label:e,pool:t})=>`
          <div class="flex-grow-1">
            <strong class="d-block mb-1">${_(e)}</strong>
            ${t.map(e=>`<div class="small">${_(e.navn)} — ${e.kamp_poeng_innl??0}p (${e.score_poeng_innl??0})</div>`).join(``)}
          </div>`).join(``):o.map((e,t)=>`<div class="small">${t+1}. ${_(e.navn)} — ${e.kamp_poeng_innl??0}p (${e.score_poeng_innl??0})</div>`).join(``);h.innerHTML=`
      <div class="card p-4 avsl-dialog-card-wide">
        <h5 class="mb-1">Gruppe ${_(t)} — Runde ${r}</h5>
        <p class="text-muted small mb-2">${c} av ${s} spelarar igjen</p>
        <div class="form-check mb-3">
          <input class="form-check-input" type="checkbox" id="seeding-dlg" ${n?`checked`:``}>
          <label class="form-check-label" for="seeding-dlg">Bruk seeding</label>
        </div>
        <div class="d-flex gap-3 flex-wrap mb-3">${u}</div>
        <div class="d-flex gap-2">
          <button id="bekreft-gen-btn" class="btn btn-primary">Bekreft og opprett kampar</button>
          <button id="avbryt-gen-btn" class="btn btn-secondary">Avbryt</button>
        </div>
      </div>`,h.querySelector(`#seeding-dlg`).addEventListener(`change`,e=>g(e.target.checked)),h.querySelector(`#avbryt-gen-btn`).addEventListener(`click`,()=>h.remove()),h.querySelector(`#bekreft-gen-btn`).addEventListener(`click`,async()=>{let n=h.querySelector(`#seeding-dlg`).checked,s=h.querySelector(`#bekreft-gen-btn`);s.disabled=!0,s.textContent=`Lagrer…`;try{if(r===1){let r=o.map((e,t)=>({kasterid:e.kasterid,plassering:t+1})),a={A:i?.A??void 0,B:i?.B??void 0};await se(e,[{gruppeNavn:t,spelarar:r,runde1Oppsett:l}],n,i?a:null)}else await ce(e,t,n);h.remove(),await a()}catch(e){T(`cup:genererRunde`,e),A(`Feil ved generering av runde`,`error`),s.disabled=!1,s.textContent=`Bekreft og opprett kampar`}})}g(!0)}function de(e,t,n,r){let i=t.map(e=>e?.kaster?`${_(e.kaster.fornavn)} ${_(e.kaster.etternavn)}`:`Spelar ${e?.posisjon??`?`}`),a=[],o=document.createElement(`div`);o.className=`avsl-dialog-overlay`,document.body.appendChild(o);function s(){let c=a.length===2?t.find(e=>e.kasterid!=null&&!a.includes(e.kasterid)):null;o.innerHTML=`
      <div class="card p-4 avsl-dialog-card">
        <h5 class="card-title mb-1">Bekreft 3-spelar kamp</h5>
        <p class="text-muted small mb-3">Vel dei to som går vidare. Den gjenverande er eliminert.</p>
        <div class="d-flex flex-column gap-2 mb-3">
          ${t.map((e,t)=>{let n=e.kasterid==null?-1:a.indexOf(e.kasterid),r=n!==-1,o=!!c&&c.kasterid===e.kasterid,s=n===0?`1. plass`:n===1?`2. plass`:``;return`<button
              class="btn ${r?`btn-success`:o?`btn-outline-danger`:`btn-outline-secondary`} text-start d-flex justify-content-between align-items-center"
              data-kasterid="${e.kasterid}"
              ${o?`disabled`:``}
            ><span>${i[t]}</span>${s?`<span class="badge bg-success-subtle text-success-emphasis">${s}</span>`:o?`<span class="badge bg-danger">Eliminert</span>`:``}</button>`}).join(``)}
        </div>
        <div class="d-flex gap-2">
          <button id="bekreft-tre-btn" class="btn btn-success" ${a.length===2?``:`disabled`}>Bekreft</button>
          <button id="avbryt-tre-btn" class="btn btn-secondary">Avbryt</button>
        </div>
      </div>
    `,o.querySelector(`#avbryt-tre-btn`).addEventListener(`click`,()=>o.remove()),o.querySelectorAll(`[data-kasterid]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=Number(e.dataset.kasterid),n=a.indexOf(t);n===-1?a.length<2&&a.push(t):a.splice(n,1),s()})}),o.querySelector(`#bekreft-tre-btn`)?.addEventListener(`click`,async()=>{if(a.length!==2)return;let i=t.find(e=>e.kasterid!=null&&!a.includes(e.kasterid))?.kasterid??null,s=t.map(e=>e.kasterid).filter(e=>e!=null);o.remove();let{error:c}=await k({kampId:e.id,stevneId:n,rundeNummer:e.runde_nummer,rundeNavn:e.runde_navn,allKasterids:s,eliminertId:i,vidareIds:[...a]});if(c){A(`DB-feil ved bekreft`,`error`);return}await r()})}s()}function fe(e){return typeof e!=`object`||!e||Array.isArray(e)?null:e}function q(e){return e.map(e=>({...e,score_poeng:e.score_poeng??0,kamp_poeng:e.kamp_poeng??0}))}var J=null,Y=null,X=!1,Z=new Set;async function pe(e,{id:t,isAdmin:n=!1},r=null){Y=r,X=n,J&&=(await m(J),null),e.replaceChildren(i(`Laster…`)),await Q(e,t)}async function Q(e,n){let[{data:r},{data:i},{data:a},{data:o},{count:c}]=await Promise.all([p(n),d(n),re(n),te([`A`,`B`]),t(n)]);if(!r){e.replaceChildren(s(`Stevne ikkje funne.`));return}let l=a.filter(e=>e.kasterid!=null),u=o,f=i.filter(e=>e.fase===`innledende`),m=i.filter(e=>e.fase===`avsluttende`),h=f.length>0&&f.every(e=>e.er_bekreftet),g=m.length>0,_=l.some(e=>e.gruppe!=null),y=Object.fromEntries(u.map(e=>[e.navn,e.id])),x={};for(let e of l)e.startnummer!=null&&(x[e.kasterid]=e.startnummer);let S={};for(let e of i)for(let t of e.spelarar)t.kasterid&&t.kaster&&!S[t.kasterid]&&(S[t.kasterid]=`${t.kaster.fornavn} ${t.kaster.etternavn}`);let C=l.map(e=>({...e,navn:S[e.kasterid]??`Spelar ${e.kasterid}`})),w=v(C.map(e=>({kasterid:e.kasterid,navn:e.navn,startnummer:e.startnummer,plassering:e.plassering,runde_eliminert:e.runde_eliminert,kamp_poeng:e.kamp_poeng_innl??0,score_poeng:e.score_poeng_innl??0,gruppe:e.gruppe?{navn:e.gruppe.navn}:null})),f),T=new Map(w.map((e,t)=>[e.kasterid,t])),E=[...C].sort((e,t)=>(T.get(e.kasterid)??1/0)-(T.get(t.kasterid)??1/0)),O=fe(r.runde1_format),k=O?.nA??null,A=O!=null&&r.stevne_fase!==`avsluttende`,j=c;X&&Y&&(Y.innerHTML=b(r,{alleInnlBekrefta:h,harAvslKampar:g,harGruppefordeling:_,harPrekonfigurertFormat:A}));let M=ne(e);e.innerHTML=`
    <div class="px-3 py-2">
      ${_?me(m,w,x,X):``}
      ${!_&&r.stevne_fase===`avsluttende`?X?B(E,{visSpelarliste:!0,initNa:k,initFormat:O}):`<p class="text-muted fst-italic">Gruppefordeling er ikkje klar enno.</p>`:``}
      ${!_&&r.stevne_fase!==`avsluttende`&&j>0&&X?B(j,{visSpelarliste:!1,initNa:k,initFormat:O}):``}
    </div>
  `,D(e,`stilling-avsl`,Z),ve(e,n,r,O,h,_,E,u,y,w),_&&(xe(e,n),g&&ye(e,n,m,C,X),ee(e),M===`stilling`&&ie(e,`stilling`))}function me(e,t,n,r=!0){let i=[...new Set(t.map(e=>e.gruppe?.navn).filter(e=>e!=null))].sort(),a=Object.fromEntries(t.map(e=>[e.kasterid,e]));return y(`<div class="d-flex gap-3 flex-wrap">${i.map(i=>{let o=e.filter(e=>e.gruppe_navn===i),s=t.filter(e=>e.gruppe?.navn===i),c=s.filter(e=>e.runde_eliminert==null).length,l=s.length,u=o.length?Math.max(...o.map(e=>e.runde_nummer)):0,d=o.filter(e=>e.runde_nummer===u),f=d.length>0&&d.every(e=>e.er_bekreftet||e.er_walkover),p=o.some(e=>e.runde_navn===`Semifinale`);return ge(i,o,c,l,u,r&&(o.length===0||f)&&c>1&&!p,n,r,a)}).join(``)}</div>`,O(t,he(e),n,{tableId:`stilling-avsl`,harGrupper:!0,harEliminasjon:!0}))}function he(e){return e.map(e=>({...e,spelarar:q(e.spelarar)}))}function ge(e,t,n,r,i,a,o,s=!0,c={}){let l=new Map;for(let e of t)l.has(e.runde_nummer)||l.set(e.runde_nummer,[]),l.get(e.runde_nummer).push(e);let u=[...l.entries()].reverse().map(([e,t])=>{let n=t[0]?.runde_navn??`Runde ${e}`,r=t.filter(e=>!e.er_walkover);return r.length?`
      <h6 class="fw-bold text-center mb-1">${_(n)}</h6>
      <div class="d-flex flex-wrap gap-2 mb-2">
        ${r.map(e=>_e(e,o,s,c)).join(``)}
      </div>`:``}).join(``),d=i+1,f=a?`<button class="btn btn-success w-100 mt-2"
         data-generer-gruppe="${_(e)}" data-runde="${d}">
         Generer runde ${d}
       </button>`:``;return`
    <div class="avsl-gruppe-kol">
      <h6 class="text-center fw-bold mb-2">Gruppe ${_(e)} (${r} spelarar)</h6>
      ${f}
      ${u}
    </div>`}function _e(e,t,n=!0,r={}){let i=e.spelarar.slice().sort((e,n)=>(t[e.kasterid??0]??999)-(t[n.kasterid??0]??999)),a=e=>e?.kaster?`${_(e.kaster.fornavn)} ${_(e.kaster.etternavn)}`:`—`,o=e.er_bekreftet||e.er_walkover,s=n&&e.er_bekreftet&&!e.er_tre_spelarar,l=e.er_walkover?`<tr>
        <td>${t[i[0]?.kasterid??0]??``}</td>
        <td colspan="2">${a(i[0])} <span class="badge bg-secondary">Walkover</span></td>
      </tr>`:i.map(n=>{let i=c(n),o=i>0?i:`—`,l=e.er_bekreftet&&r[n.kasterid??0]?.runde_eliminert===e.runde_nummer,u=e.er_bekreftet&&!l,d=l?`kamp-eliminert`:u?`kamp-vidare`:``,f=s?` data-endre-score="${e.id}" class="text-center score-redigerbar"`:` class="text-center"`;return`<tr${d?` class="${d}"`:``}>
          <td class="th-36 text-center">${t[n.kasterid??0]??``}</td>
          <td>${a(n)}</td>
          <td${f}>${o}</td>
        </tr>`}).join(``),u=i.some(e=>(e.omgangar?.length??0)>0),d,f,p,m;if(e.er_tre_spelarar)d=o?`btn-success`:`btn-outline-secondary`,f=o?`Endre plassering`:`Sett plassering`,p=!1,m=``;else{let t=S(e,q(i),u);d=o?`btn-secondary`:t?`btn-success`:`btn-outline-secondary`,f=o?`Bekreftet`:`Bekreft`,p=o||!t,m=` btn-bekreft`}return`
    <div class="avsl-kamp-block">
      <div class="text-center small fw-semibold text-muted mb-1">Bane ${e.bane_nummer}</div>
      <table class="table table-sm table-bordered mb-0 bg-white">
        <tbody>
          ${l}
          <tr>
            <td colspan="3" class="text-end pe-1">
              ${n&&!e.er_walkover&&!e.er_tre_spelarar?`<button class="btn btn-primary btn-sm" id="plus-${e.id}"${o?` disabled`:``}>+</button> `:``}
              <button class="btn btn-secondary btn-sm" id="scoreboard-${e.id}"
                title="Scoreboard"${o&&!e.er_tre_spelarar?` disabled`:``}>S</button>
              ${n?`<button class="btn ${d} btn-sm${m}" id="bekrft-${e.id}"${p?` disabled`:``}>${f}</button>`:``}
            </td>
          </tr>
        </tbody>
      </table>
    </div>`}function ve(e,t,r,i,o,s,c,l,u,d){if(Y?.querySelector(`#start-avsl-btn`)?.addEventListener(`click`,async()=>{if(!o)return;let{error:n}=await g(t,`avsluttende`);if(n){A(`Feil ved oppstart av avsluttande fase`,`error`);return}if(i?.nA!=null){let e=i.nA,n=u.A??null,r=u.B??null,{error:a}=await w(t,d.map((t,i)=>({kasterid:t.kasterid,gruppeid:i<e?n:r??n})));if(a){A(`Feil ved lagring av gruppefordeling`,`error`);return}}await Q(e,t)}),!s){let n=parseInt(e.querySelector(`#gruppe-val-wrapper`)?.dataset.n??`0`)||c.length,i=[...c];function o(t,n){let r=e.querySelector(`input[name="${t}"]:checked`);if(r?.dataset.oppsett)try{return JSON.parse(r.dataset.oppsett)}catch{}return F(n)[0]??null}let s=e.querySelector(`#gruppe-paneler`);s&&s.addEventListener(`change`,t=>{let r=t.target;if(!r.matches(`input[name^="runde1-format"]`))return;let a=parseInt(e.querySelector(`input[name="gruppe-split"]:checked`)?.value??String(n)),s=n-a,c=o(`runde1-format-a`,a),l=o(`runde1-format-b`,s);if(r.name===`runde1-format-a`){let t=e.querySelector(`#struktur-a`);t&&(t.outerHTML=H(a,c,`a`))}else{let t=e.querySelector(`#struktur-b`);t&&(t.outerHTML=H(s,l,`b`))}let u=c?.walkovers??0,d=l?.walkovers??0,f=e.querySelector(`#gruppe-preview`);f&&(f.innerHTML=V(i.map((e,t)=>({...e,cupPlassering:t+1})),a,u,d))}),e.querySelectorAll(`input[name="gruppe-split"]`).forEach(t=>{t.addEventListener(`change`,()=>{let r=parseInt(t.value),a=n-r,o=i.map((e,t)=>({...e,cupPlassering:t+1})),c=F(r)[0]??null,l=a>=2?F(a)[0]??null:null;s&&(s.innerHTML=`<div id="gruppe-panel-a" class="avsl-gruppe-kol">
              ${U(`Gruppe A`,r,`runde1-format-a`,c)}
            </div>`+(a>=2?`<div id="gruppe-panel-b" class="avsl-gruppe-kol">
              ${U(`Gruppe B`,a,`runde1-format-b`,l)}
            </div>`:``));let u=c?.walkovers??0,d=l?.walkovers??0,f=e.querySelector(`#gruppe-preview`);f&&(f.innerHTML=V(o,r,u,d))})}),e.querySelector(`#bekreft-gruppe-btn`)?.addEventListener(`click`,async()=>{let s=e.querySelector(`input[name="gruppe-split"]:checked`);if(!s)return;let c=parseInt(s.value),l=n-c,{error:d}=await a(t,{A:o(`runde1-format-a`,c),B:l>=2?o(`runde1-format-b`,l):null,nA:c});if(d){A(`Feil ved lagring av format`,`error`);return}if(r.stevne_fase===`avsluttende`){let e=u.A??null,n=u.B??null,{error:r}=await w(t,i.map((t,r)=>({kasterid:t.kasterid,gruppeid:r<c?e:n??e})));if(r){A(`Feil ved lagring av gruppefordeling`,`error`);return}}await Q(e,t)})}Y?.querySelector(`#endre-gruppeinndeling-btn`)?.addEventListener(`click`,async()=>{await n({title:`Tilbakestill gruppeinndeling`,message:`Gruppefordeling og format vert fjerna.`,danger:!0})&&(await Promise.all([E(t),a(t,null)]),await Q(e,t))}),s&&e.querySelectorAll(`[data-generer-gruppe]`).forEach(n=>{n.addEventListener(`click`,()=>{let r=n.dataset.genererGruppe??``,a=parseInt(n.dataset.runde??`1`);ue(t,r,c.filter(e=>e.gruppe?.navn===r),a,i,()=>Q(e,t))})}),Y?.querySelector(`#fullfør-turnering-btn`)?.addEventListener(`click`,async()=>{if(!await n({title:`Fullfør turnering`,message:`Vil du fullføre turneringa? Dette kan ikkje angrast.`,danger:!0}))return;let{error:r}=await h(t);if(r){A(`Feil ved fullføring av turnering`,`error`);return}await Q(e,t)})}function ye(e,t,n,r,i=!1){for(let r of n){let n=r.spelarar.slice().sort((e,t)=>(e.posisjon??0)-(t.posisjon??0));if(e.querySelector(`#plus-${r.id}`)?.addEventListener(`click`,async()=>{let r=n[0],i=n[1];j(r?.kaster?`${r.kaster.fornavn} ${r.kaster.etternavn}`:`—`,i?.kaster?`${i.kaster.fornavn} ${i.kaster.etternavn}`:`—`,c(r),c(i),async(n,a)=>{let o=[];r?.id&&o.push(x(r.id,n)),i?.id&&o.push(x(i.id,a)),await Promise.all(o),await Q(e,t)})}),e.querySelector(`#scoreboard-${r.id}`)?.addEventListener(`click`,()=>{window.open(`#/kamp/${r.id}`,`_blank`)}),e.querySelector(`#bekrft-${r.id}`)?.addEventListener(`click`,async i=>{if(r.er_tre_spelarar)de(r,n,t,async()=>{await $(t,r),await Q(e,t)});else{let a=i.currentTarget;a.disabled=!0,a.textContent=`Lagrer…`,await be(e,t,r,n)||(a.disabled=!1,a.textContent=`Bekreft`)}}),i&&r.er_bekreftet&&!r.er_tre_spelarar){let i=n[0],a=n[1],o=i?.kaster?`${i.kaster.fornavn} ${i.kaster.etternavn}`:`—`,s=a?.kaster?`${a.kaster.fornavn} ${a.kaster.etternavn}`:`—`,d=n.map(e=>e.kasterid).filter(e=>e!=null),f=()=>{j(o,s,c(i),c(a),async(n,o)=>{let s=[i?.id,a?.id].filter(e=>e!=null);if(s.length){let{error:e}=await u(s);if(e){A(`DB-feil ved sletting av omgangar`,`error`);return}}let c=[];if(i?.id&&c.push(x(i.id,n)),a?.id&&c.push(x(a.id,o)),(await Promise.all(c)).find(e=>e.error)?.error){A(`DB-feil ved oppdatering av score`,`error`);return}let f=n>=o?i?.kasterid:a?.kasterid,p=n>=o?a?.kasterid:i?.kasterid;await l({stevneId:t,rundeNummer:r.runde_nummer,rundeNavn:r.runde_navn,allKasterids:d,nyVinnarId:f,nyTaparId:p}),await Q(e,t)})};e.querySelectorAll(`[data-endre-score="${r.id}"]`).forEach(e=>e.addEventListener(`click`,f))}}}async function be(t,r,i,a){let o=a[0],s=a[1],{data:l}=await e(i.id),u=l.find(e=>e.id===o?.id),d=l.find(e=>e.id===s?.id),f=c(u??o),p=c(d??s);if(f===0&&p===0&&!await n({title:`Ingen score registrert`,message:`Vil du bekrefte kampen likevel?`}))return!1;let m=f>=p?o:s,h=f>=p?s:o,g=a.map(e=>e.kasterid).filter(e=>e!=null),_=m?.kasterid==null?[]:[m.kasterid],{error:v}=await k({kampId:i.id,stevneId:r,rundeNummer:i.runde_nummer,rundeNavn:i.runde_navn,allKasterids:g,eliminertId:h?.kasterid??null,vidareIds:_});return v?(A(`DB-feil ved bekreft`,`error`),!1):(await $(r,i),await Q(t,r),!0)}async function $(e,t){t.runde_navn!==`Semifinale`||!t.gruppe_navn||await r(e,t.gruppe_navn)&&await le(e,t.gruppe_navn)}function xe(e,t){if(J)return;let n=C(t,[`avsluttende`],e,Q,()=>{J&&=(m(J),null)});J=f(t,`stevne-avsl-cup-${t}`,n)}export{pe as render};