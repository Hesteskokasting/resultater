import{A as e,B as t,E as n,F as r,G as i,H as a,I as o,K as s,M as c,O as l,R as u,S as d,U as f,V as p,W as m,_ as h,b as g,d as _,h as v,j as y,k as b,l as x,m as ee,n as te,o as S,p as C,r as w,t as T,u as ne,v as re,w as E,x as D,y as O,z as k}from"./index-EarZDql9.js";import{t as A}from"./ScoreNumberpad-DYEk7r3I.js";function j(e){let t=[...e];for(let e=t.length-1;e>0;e--){let n=Math.floor(Math.random()*(e+1));[t[e],t[n]]=[t[n],t[e]]}return t}function M(e){return e===2||e===4?!0:e<2?!1:e%3==0?M(Math.floor(e/3)*2):e%2==0?M(e/2):!1}function N(e){return e%3==0?{c3:e/3,c2:0}:e%2==0?{c3:0,c2:e/2}:{c3:0,c2:0}}function P(e){if(e<2)return[];let t=[],n=Math.floor(e/2);for(let r=e%3;r<=n&&r<=3&&t.filter(e=>e.c2===0).length<2;r+=3){let n=(e-r)/3;if(n<1)break;M(r+2*n)&&t.push({walkovers:r,c3:n,c2:0})}for(let r=e%2;r<=n&&r<=3&&t.filter(e=>e.c3===0).length<2;r+=2){let n=(e-r)/2;if(n<1)break;let i=r+n;!t.some(e=>e.walkovers===r&&e.c3===0&&e.c2===n)&&M(i)&&t.push({walkovers:r,c3:0,c2:n})}return t.sort((e,t)=>e.walkovers-t.walkovers||t.c3-e.c3),t}function F(e){return e===2?!0:P(e).length>0}function ie(e){let t=Math.ceil(e*.5),n=Math.floor(e*.8),r=[];for(let i=n;i>=t;i--){let t=e-i;t>=2&&F(i)&&F(t)&&r.push({nA:i,nB:t})}return r}function I(e,{runde1:t=null,walkovers1:n=null}={}){let r=[],i=e,a=1,o=!0;for(;i>2;){let e,s,c;if(o){let r=t;!r&&n!==null&&(r={walkovers:n,c3:Math.floor((i-n)/3),c2:0}),r||=P(i)[0]??{walkovers:i%3,c3:Math.floor(i/3),c2:0},c=r.walkovers,e=r.c3,s=r.c2,o=!1}else{let t=N(i);e=t.c3,s=t.c2,c=0}let l=e*2+s+c;r.push({runde:a,spelarar:i,baner:e+s,treSpelarar:e>0,walkovers:c,vidare:l}),i=l,a++}return r}function L(e,{medSeeding:t=!0,isRunde1:n=!1,walkoverTall:r=null,runde1Oppsett:i=null}={}){let a=[],o=[...e];if(n){let e=i?.walkovers??r??o.length%3;if(e>0){let t=o.slice(0,e);o=o.slice(e);for(let e of t)a.push({spelarar:[e.kasterid],erWalkover:!0,erTreSpelarar:!1})}}let s=o.length,c,l;if(i&&n)c=i.c3,l=i.c2;else if(n)c=Math.floor(s/3),l=0;else{let e=N(s);c=e.c3,l=e.c2}let u=c+l;if(t&&u>0){let e=j(o.slice(0,u)),t=j(o.slice(u,2*u)),n=j(o.slice(2*u)),r=0;for(let i=0;i<u;i++){let o=i<c,s=[e[i],t[i]];o&&n[r]&&s.push(n[r++]),a.push({spelarar:s.map(e=>e.kasterid),erWalkover:!1,erTreSpelarar:o})}}else{let e=j(o),t=0;for(let n=0;n<c;n++)a.push({spelarar:e.slice(t,t+3).map(e=>e.kasterid),erWalkover:!1,erTreSpelarar:!0}),t+=3;for(let n=0;n<l;n++)a.push({spelarar:e.slice(t,t+2).map(e=>e.kasterid),erWalkover:!1,erTreSpelarar:!1}),t+=2}return a}function R(e,{visSpelarliste:t=!0,initNa:n=null,initFormat:r=null}={}){let i=typeof e==`number`?e:e.length,a=typeof e==`number`?[]:e.map((e,t)=>({...e,cupPlassering:t+1})),o=ie(i),s=n===i?i:n!=null&&o.some(e=>e.nA===n)?n:o[0]?.nA??i,c=i-s,l=o.filter(e=>P(e.nA).some(e=>e.c3>0)),u=o.filter(e=>!P(e.nA).some(e=>e.c3>0)),d=P(i).length>0,f=(e,t)=>e.map((e,r)=>{let a=e.nA===s&&n!==i,o=t+r;return`
      <div class="form-check">
        <input class="form-check-input" type="radio" name="gruppe-split" id="split-${o}" value="${e.nA}" ${a?`checked`:``}>
        <label class="form-check-label" for="split-${o}">A:${e.nA} — B:${e.nB}</label>
      </div>`}).join(``),p=[];l.length&&p.push(`<div class="text-muted small fw-semibold mb-1">3 spillere per bane (A)</div>${f(l,0)}`),u.length&&(p.length&&p.push(`<hr class="my-2">`),p.push(`<div class="text-muted small fw-semibold mb-1">2 spillere per bane (A)</div>${f(u,l.length)}`)),d&&(p.length&&p.push(`<hr class="my-2">`),p.push(`
      <div class="form-check">
        <input class="form-check-input" type="radio" name="gruppe-split" id="split-ingen" value="${i}" ${n===i?`checked`:``}>
        <label class="form-check-label" for="split-ingen">Ingen gruppeinndeling (alle i A)</label>
      </div>`));let m=p.join(``),h=r?.A??P(s)[0]??null,g=c>=2?r?.B??P(c)[0]??null:null,_=t?`<div id="gruppe-preview">${z(a,s,h?.walkovers??0,g?.walkovers??0)}</div>`:``;return`
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
            ${V(`Gruppe A`,s,`runde1-format-a`,h)}
          </div>
          ${c>=2?`<div id="gruppe-panel-b" class="avsl-gruppe-kol">
            ${V(`Gruppe B`,c,`runde1-format-b`,g)}
          </div>`:``}
        </div>
      </div>
      <div class="mt-3">
        <button id="bekreft-gruppe-btn" class="btn btn-success btn-lg w-100">Bekreft gruppefordeling</button>
      </div>
      ${_}
    </div>
  `}function z(e,t,n=0,r=0){let i=e.slice(0,t),o=e.slice(t);function s(e,t=0){return e.map((e,n)=>{let r=n<t;return`
      <tr>
        <td>${e.cupPlassering}</td>
        <td>${a(String(e.startnummer??``))}</td>
        <td>${a(e.navn??``)}${r?` <span class="badge bg-info text-dark">Walkover</span>`:``}</td>
        <td class="text-center">${e.kamp_poeng_innl??0}</td>
        <td class="text-center">${e.score_poeng_innl??0}</td>
      </tr>`}).join(``)}let c=`
    <thead class="org-thead"><tr>
      <th class="th-32">#</th><th class="th-36">S</th><th>NAMN</th>
      <th class="th-44 text-center">KP</th>
      <th class="th-44 text-center">SP</th>
    </tr></thead>`,l=`
    <table class="table table-bordered table-sm bg-white mb-0">
      ${c}
      <tbody>${s(i,n)}</tbody>
    </table>`,u=o.length?`
    <table class="table table-bordered table-sm bg-white mb-0">
      ${c}
      <tbody>${s(o,r)}</tbody>
    </table>`:``;return`
    <div class="d-flex gap-3 flex-wrap">
      <div class="avsl-gruppe-kol">
        <h6 class="fw-bold text-center">GRUPPE A (${i.length})</h6>
        ${l}
      </div>
      ${o.length?`<div class="avsl-gruppe-kol">
        <h6 class="fw-bold text-center">GRUPPE B (${o.length})</h6>
        ${u}
      </div>`:``}
    </div>`}function ae(e){let t=e.c3>0?3:2;return`${e.walkovers} walkover - ${t} deltakere per bane`}function oe(e,t,n,r=null){let i=P(t);return i.length<=1?``:`<div class="d-flex flex-column align-items-start gap-1 mb-2">${i.map((e,t)=>{let i=`${n}-${t}`,a=JSON.stringify(e),o=r?e.walkovers===r.walkovers&&e.c3===r.c3&&e.c2===r.c2:t===0,s=e.c3>0?`btn-outline-success`:`btn-outline-warning`;return`
      <input type="radio" class="btn-check" name="${n}" id="${i}"
        value='${a}' data-oppsett='${a}' autocomplete="off" ${o?`checked`:``}>
      <label class="btn btn-sm ${s}" for="${i}">${ae(e)}</label>`}).join(``)}</div>`}function B(e,t,n){return`<div id="struktur-${n}">
    <table class="table table-sm table-bordered mb-0">
      <thead><tr>
        <th>Runde</th><th>Deltakere (w.o.)</th><th>Baner</th><th>Per bane</th>
      </tr></thead>
      <tbody>${(e>=2?I(e,{runde1:t}):[]).map((e,n)=>{let r=e.walkovers??0,i=e.spelarar-r,a=r>0?`${i} <span class="text-muted">(${r} w.o.)</span>`:`${i}`,o;return o=n===0&&t?t.c3>0&&t.c2>0?`2/3`:t.c3>0?`3`:`2`:e.spelarar%e.baner===0?String(e.spelarar/e.baner):`2/3`,`<tr${e.treSpelarar?` class="fw-bold"`:``}>
      <td>${e.runde}</td>
      <td>${a}</td>
      <td>${e.baner}</td>
      <td>${o}</td>
    </tr>`}).join(``)}</tbody>
    </table>
  </div>`}function V(e,t,n,r){let i=n.slice(-1),a=oe(e,t,n,r);return`
    <div class="card">
      <div class="card-body">
        <h6 class="fw-bold mb-2">${a?`${e}: Velg format`:`${e} (${t})`}</h6>
        ${a}
        ${B(t,r,i)}
      </div>
    </div>`}function H(){return crypto.randomUUID()}async function U(e,t,n,r,i=0,a=null){let o=t.map(()=>H()),c=i,l=t.map((t,i)=>({match_id:o[i],stevneid:e,fase:`avsluttende`,runde_nummer:n,gruppe_navn:r??null,bane_nummer:t.erWalkover?null:++c,er_bekreftet:!1,er_walkover:t.erWalkover,er_tre_spelarar:t.erTreSpelarar,runde_navn:a})),{data:u,error:d}=await s.from(`kamp`).insert(l).select(`id, match_id`);if(d)throw Error(`Feil ved innsetting av cup-kampar: `+d.message);let f=Object.fromEntries(u.map(e=>[e.match_id,e.id])),p=[];for(let e=0;e<t.length;e++){let n=f[o[e]];t[e].spelarar.forEach((e,t)=>{p.push({kampid:n,kasterid:e,posisjon:t+1,score_poeng:0,kamp_poeng:0,antall_ringer:0})})}let{error:m}=await s.from(`kamp_spelar`).insert(p);if(m)throw Error(`Feil ved innsetting av cup-spelarar: `+m.message);return u.length}async function W(e){let{data:t}=await s.from(`resultat`).select(`kasterid, gruppeid, gruppe:gruppeid(navn), plassering, kamp_poeng_innl, score_poeng_innl, startnummer`).eq(`stevneid`,e).is(`runde_eliminert`,null);return t??[]}async function G(e,t,n,r=null){let i=[`A`,`B`,`C`],a=0;for(let o of t){let t=L(o.spelarar,{medSeeding:n,isRunde1:!0,runde1Oppsett:o.runde1Oppsett??null}),{data:c}=await s.from(`kamp`).select(`bane_nummer`).eq(`stevneid`,e).eq(`fase`,`avsluttende`).eq(`runde_nummer`,1).not(`bane_nummer`,`is`,null).order(`bane_nummer`,{ascending:!1}).limit(1),l=c?.[0]?.bane_nummer??0,u=0;if(r&&o.gruppeNavn){let e=i.indexOf(o.gruppeNavn);for(let t=0;t<e;t++){let e=r[i[t]];e&&(u+=(e.c3??0)+(e.c2??0))}}let d=Math.max(l,u),f=o.spelarar.length===4;a+=await U(e,t,1,o.gruppeNavn,d,f?`Semifinale`:null)}return a}async function K(e,t,n){let{data:r}=await s.from(`kamp`).select(`runde_nummer`).eq(`stevneid`,e).eq(`fase`,`avsluttende`).eq(`gruppe_navn`,t).order(`runde_nummer`,{ascending:!1}).limit(1),i=(r?.[0]?.runde_nummer??0)+1,a=(await W(e)).filter(e=>e.gruppe?.navn===t);a.sort((e,t)=>(t.kamp_poeng_innl??0)-(e.kamp_poeng_innl??0)||(t.score_poeng_innl??0)-(e.score_poeng_innl??0)||(e.startnummer??0)-(t.startnummer??0));let o=a.map((e,t)=>({kasterid:e.kasterid,plassering:t+1})),c=o.length===4,l=L(o,{medSeeding:n,isRunde1:!1}),{data:u}=await s.from(`kamp`).select(`bane_nummer`).eq(`stevneid`,e).eq(`fase`,`avsluttende`).eq(`runde_nummer`,i).not(`bane_nummer`,`is`,null).order(`bane_nummer`,{ascending:!1}).limit(1);return{rundeNummer:i,antallKampar:await U(e,l,i,t,u?.[0]?.bane_nummer??0,c?`Semifinale`:null)}}async function se(e,t){let{data:n}=await s.from(`kamp`).select(`id, runde_nummer, spelarar:kamp_spelar(id, kasterid, score_poeng, posisjon, omgangar:kamp_omgang(score))`).eq(`stevneid`,e).eq(`fase`,`avsluttende`).eq(`gruppe_navn`,t).eq(`runde_navn`,`Semifinale`).eq(`er_bekreftet`,!0);if(!n?.length)throw Error(`Semifinalane er ikkje bekrefta.`);let r=n,i=r[0].runde_nummer+1,a=[],o=[];for(let e of r){let t=[...e.spelarar??[]].sort((e,t)=>{let n=e.omgangar?.length?e.omgangar.reduce((e,t)=>e+(t.score??0),0):e.score_poeng??0;return(t.omgangar?.length?t.omgangar.reduce((e,t)=>e+(t.score??0),0):t.score_poeng??0)-n});t[0]&&a.push(t[0].kasterid),t[1]&&o.push(t[1].kasterid)}let{data:c}=await s.from(`kamp`).select(`bane_nummer`).eq(`stevneid`,e).eq(`fase`,`avsluttende`).eq(`runde_nummer`,i).not(`bane_nummer`,`is`,null).order(`bane_nummer`,{ascending:!1}).limit(1),l=c?.[0]?.bane_nummer??0,u={match_id:H(),stevneid:e,fase:`avsluttende`,runde_nummer:i,gruppe_navn:t,bane_nummer:l+1,runde_navn:`Finale`,er_bekreftet:!1,er_walkover:!1,er_tre_spelarar:!1},d={match_id:H(),stevneid:e,fase:`avsluttende`,runde_nummer:i,gruppe_navn:t,bane_nummer:l+2,runde_navn:`Bronsefinale`,er_bekreftet:!1,er_walkover:!1,er_tre_spelarar:!1},{data:f,error:p}=await s.from(`kamp`).insert([u,d]).select(`id, runde_navn`);if(p)throw Error(`Feil: `+p.message);let m=f,h=m.find(e=>e.runde_navn===`Finale`).id,g=m.find(e=>e.runde_navn===`Bronsefinale`).id,_=[...a.filter(e=>e!=null).map((e,t)=>({kampid:h,kasterid:e,posisjon:t+1,score_poeng:0,kamp_poeng:0,antall_ringer:0})),...o.filter(e=>e!=null).map((e,t)=>({kampid:g,kasterid:e,posisjon:t+1,score_poeng:0,kamp_poeng:0,antall_ringer:0}))],{error:v}=await s.from(`kamp_spelar`).insert(_);if(v)throw Error(`Feil: `+v.message);for(let t of o)t!=null&&await s.from(`resultat`).update({runde_eliminert:r[0].runde_nummer,plassering:3}).eq(`stevneid`,e).eq(`kasterid`,t)}function ce(e,t,n,r,o,s){let c=n.filter(e=>e.runde_eliminert==null),l=n.length,u=c.length,d=r===1?o?.[t]??null:null,f=d?.walkovers??0,p=(d?d.c3:u%3==0?u/3:0)+(d?d.c2:u%3==0?0:u/2),m=c.slice(f,f+p),h=c.slice(f+p,f+2*p),g=c.slice(f+2*p),_=document.createElement(`div`);_.className=`avsl-dialog-overlay`,document.body.appendChild(_);function v(n){let f=n&&p>0?[{label:`Seeding 1`,pool:m},{label:`Seeding 2`,pool:h},...g.length?[{label:`Seeding 3`,pool:g}]:[]].map(({label:e,pool:t})=>`
          <div class="flex-grow-1">
            <strong class="d-block mb-1">${a(e)}</strong>
            ${t.map(e=>`<div class="small">${a(e.navn)} — ${e.kamp_poeng_innl??0}p (${e.score_poeng_innl??0})</div>`).join(``)}
          </div>`).join(``):c.map((e,t)=>`<div class="small">${t+1}. ${a(e.navn)} — ${e.kamp_poeng_innl??0}p (${e.score_poeng_innl??0})</div>`).join(``);_.innerHTML=`
      <div class="card p-4 avsl-dialog-card-wide">
        <h5 class="mb-1">Gruppe ${a(t)} — Runde ${r}</h5>
        <p class="text-muted small mb-2">${u} av ${l} spelarar igjen</p>
        <div class="form-check mb-3">
          <input class="form-check-input" type="checkbox" id="seeding-dlg" ${n?`checked`:``}>
          <label class="form-check-label" for="seeding-dlg">Bruk seeding</label>
        </div>
        <div class="d-flex gap-3 flex-wrap mb-3">${f}</div>
        <div class="d-flex gap-2">
          <button id="bekreft-gen-btn" class="btn btn-primary">Bekreft og opprett kampar</button>
          <button id="avbryt-gen-btn" class="btn btn-secondary">Avbryt</button>
        </div>
      </div>`,_.querySelector(`#seeding-dlg`).addEventListener(`change`,e=>v(e.target.checked)),_.querySelector(`#avbryt-gen-btn`).addEventListener(`click`,()=>_.remove()),_.querySelector(`#bekreft-gen-btn`).addEventListener(`click`,async()=>{let n=_.querySelector(`#seeding-dlg`).checked;_.remove();try{if(r===1){let r=c.map((e,t)=>({kasterid:e.kasterid,plassering:t+1})),i={A:o?.A??void 0,B:o?.B??void 0};await G(e,[{gruppeNavn:t,spelarar:r,runde1Oppsett:d}],n,o?i:null)}else await K(e,t,n);await s()}catch(e){i(`cup:genererRunde`,e),O(`Feil ved generering av runde`,`error`)}})}v(!0)}function q(e,t,n,r){let i=t.map(e=>e?.kaster?`${a(e.kaster.fornavn)} ${a(e.kaster.etternavn)}`:`Spelar ${e?.posisjon??`?`}`),o=[],s=document.createElement(`div`);s.className=`avsl-dialog-overlay`,document.body.appendChild(s);function c(){let a=o.length===2?t.find(e=>e.kasterid!=null&&!o.includes(e.kasterid)):null;s.innerHTML=`
      <div class="card p-4 avsl-dialog-card">
        <h5 class="card-title mb-1">Bekreft 3-spelar kamp</h5>
        <p class="text-muted small mb-3">Vel dei to som går vidare. Den gjenverande er eliminert.</p>
        <div class="d-flex flex-column gap-2 mb-3">
          ${t.map((e,t)=>{let n=e.kasterid==null?-1:o.indexOf(e.kasterid),r=n!==-1,s=!!a&&a.kasterid===e.kasterid,c=n===0?`1. plass`:n===1?`2. plass`:``;return`<button
              class="btn ${r?`btn-success`:s?`btn-outline-danger`:`btn-outline-secondary`} text-start d-flex justify-content-between align-items-center"
              data-kasterid="${e.kasterid}"
              ${s?`disabled`:``}
            ><span>${i[t]}</span>${c?`<span class="badge bg-success-subtle text-success-emphasis">${c}</span>`:s?`<span class="badge bg-danger">Eliminert</span>`:``}</button>`}).join(``)}
        </div>
        <div class="d-flex gap-2">
          <button id="bekreft-tre-btn" class="btn btn-success" ${o.length===2?``:`disabled`}>Bekreft</button>
          <button id="avbryt-tre-btn" class="btn btn-secondary">Avbryt</button>
        </div>
      </div>
    `,s.querySelector(`#avbryt-tre-btn`).addEventListener(`click`,()=>s.remove()),s.querySelectorAll(`[data-kasterid]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=Number(e.dataset.kasterid),n=o.indexOf(t);n===-1?o.length<2&&o.push(t):o.splice(n,1),c()})}),s.querySelector(`#bekreft-tre-btn`)?.addEventListener(`click`,async()=>{if(o.length!==2)return;let i=t.find(e=>e.kasterid!=null&&!o.includes(e.kasterid))?.kasterid??null,a=t.map(e=>e.kasterid).filter(e=>e!=null);s.remove();let{error:c}=await d({kampId:e.id,stevneId:n,rundeNummer:e.runde_nummer,rundeNavn:e.runde_navn,allKasterids:a,eliminertId:i,vidareIds:[...o]});if(c){O(`DB-feil ved bekreft`,`error`);return}await r()})}c()}function le(e){return typeof e!=`object`||!e||Array.isArray(e)?null:e}function J(e){return e.map(e=>({...e,score_poeng:e.score_poeng??0,kamp_poeng:e.kamp_poeng??0}))}var Y=null,X=null,Z=!1,ue=new Set;async function de(e,{id:t,isAdmin:n=!1},r=null){X=r,Z=n,Y&&=(await g(Y),null),e.replaceChildren(f(`Laster…`)),await Q(e,t)}async function Q(e,t){let[{data:r},{data:i},{data:a},{data:s},{count:c}]=await Promise.all([o(t),n(t),w(t),te([`A`,`B`]),u(t)]);if(!r){e.replaceChildren(m(`Stevne ikkje funne.`));return}let l=a.filter(e=>e.kasterid!=null),d=s,f=i.filter(e=>e.fase===`innledende`),p=i.filter(e=>e.fase===`avsluttende`),h=f.length>0&&f.every(e=>e.er_bekreftet),g=p.length>0,v=l.some(e=>e.gruppe!=null),y=Object.fromEntries(d.map(e=>[e.navn,e.id])),b={};for(let e of l)e.startnummer!=null&&(b[e.kasterid]=e.startnummer);let x={};for(let e of i)for(let t of e.spelarar)t.kasterid&&t.kaster&&!x[t.kasterid]&&(x[t.kasterid]=`${t.kaster.fornavn} ${t.kaster.etternavn}`);let S=l.map(e=>({...e,navn:x[e.kasterid]??`Spelar ${e.kasterid}`})),C=re(S.map(e=>({kasterid:e.kasterid,navn:e.navn,startnummer:e.startnummer,plassering:e.plassering,runde_eliminert:e.runde_eliminert,kamp_poeng:e.kamp_poeng_innl??0,score_poeng:e.score_poeng_innl??0,gruppe:e.gruppe?{navn:e.gruppe.navn}:null})),f),T=new Map(C.map((e,t)=>[e.kasterid,t])),E=[...S].sort((e,t)=>(T.get(e.kasterid)??1/0)-(T.get(t.kasterid)??1/0)),D=le(r.runde1_format),O=D?.nA??null,k=D!=null&&r.stevne_fase!==`avsluttende`,A=c;Z&&X&&(X.innerHTML=ee(r,{alleInnlBekrefta:h,harAvslKampar:g,harGruppefordeling:v,harPrekonfigurertFormat:k})),e.innerHTML=`
    <div class="px-3 py-2">
      ${v?fe(p,C,b,Z):``}
      ${!v&&r.stevne_fase===`avsluttende`?Z?R(E,{visSpelarliste:!0,initNa:O,initFormat:D}):`<p class="text-muted fst-italic">Gruppefordeling er ikkje klar enno.</p>`:``}
      ${!v&&r.stevne_fase!==`avsluttende`&&A>0&&Z?R(A,{visSpelarliste:!1,initNa:O,initFormat:D}):``}
    </div>
  `,ne(e,`stilling-avsl`,ue),ge(e,t,r,D,h,v,E,d,y,C),v&&(ye(e,t),g&&_e(e,t,p,S,Z),_(e))}function fe(e,t,n,r=!0){let i=[...new Set(t.map(e=>e.gruppe?.navn).filter(e=>e!=null))].sort(),a=Object.fromEntries(t.map(e=>[e.kasterid,e]));return v(`<div class="d-flex gap-3 flex-wrap">${i.map(i=>{let o=e.filter(e=>e.gruppe_navn===i),s=t.filter(e=>e.gruppe?.navn===i),c=s.filter(e=>e.runde_eliminert==null).length,l=s.length,u=o.length?Math.max(...o.map(e=>e.runde_nummer)):0,d=o.filter(e=>e.runde_nummer===u),f=d.length>0&&d.every(e=>e.er_bekreftet||e.er_walkover),p=o.some(e=>e.runde_navn===`Semifinale`);return me(i,o,c,l,u,r&&(o.length===0||f)&&c>1&&!p,n,r,a)}).join(``)}</div>`,h(t,pe(e),n,{tableId:`stilling-avsl`,harGrupper:!0,harEliminasjon:!0}))}function pe(e){return e.map(e=>({...e,spelarar:J(e.spelarar)}))}function me(e,t,n,r,i,o,s,c=!0,l={}){let u=new Map;for(let e of t)u.has(e.runde_nummer)||u.set(e.runde_nummer,[]),u.get(e.runde_nummer).push(e);let d=[...u.entries()].reverse().map(([e,t])=>{let n=t[0]?.runde_navn??`Runde ${e}`,r=t.filter(e=>!e.er_walkover);return r.length?`
      <h6 class="fw-bold text-center mb-1">${a(n)}</h6>
      <div class="d-flex flex-wrap gap-2 mb-2">
        ${r.map(e=>he(e,s,c,l)).join(``)}
      </div>`:``}).join(``),f=i+1,p=o?`<button class="btn btn-success w-100 mt-2"
         data-generer-gruppe="${a(e)}" data-runde="${f}">
         Generer runde ${f}
       </button>`:``;return`
    <div class="avsl-gruppe-kol">
      <h6 class="text-center fw-bold mb-2">Gruppe ${a(e)} (${r} spelarar)</h6>
      ${p}
      ${d}
    </div>`}function he(e,t,n=!0,i={}){let o=e.spelarar.slice().sort((e,n)=>(t[e.kasterid??0]??999)-(t[n.kasterid??0]??999)),s=e=>e?.kaster?`${a(e.kaster.fornavn)} ${a(e.kaster.etternavn)}`:`—`,c=e.er_bekreftet||e.er_walkover,l=n&&e.er_bekreftet&&!e.er_tre_spelarar,u=e.er_walkover?`<tr>
        <td>${t[o[0]?.kasterid??0]??``}</td>
        <td colspan="2">${s(o[0])} <span class="badge bg-secondary">Walkover</span></td>
      </tr>`:o.map(n=>{let a=r(n),o=a>0?a:`—`,c=e.er_bekreftet&&i[n.kasterid??0]?.runde_eliminert===e.runde_nummer,u=e.er_bekreftet&&!c,d=c?`kamp-eliminert`:u?`kamp-vidare`:``,f=l?` data-endre-score="${e.id}" class="text-center score-redigerbar"`:` class="text-center"`;return`<tr${d?` class="${d}"`:``}>
          <td class="th-36 text-center">${t[n.kasterid??0]??``}</td>
          <td>${s(n)}</td>
          <td${f}>${o}</td>
        </tr>`}).join(``),d=o.some(e=>(e.omgangar?.length??0)>0),f,p,m,h;if(e.er_tre_spelarar)f=c?`btn-success`:`btn-outline-secondary`,p=c?`Endre plassering`:`Sett plassering`,m=!1,h=``;else{let t=x(e,J(o),d);f=c?`btn-secondary`:t?`btn-success`:`btn-outline-secondary`,p=c?`Bekreftet`:`Bekreft`,m=c||!t,h=` btn-bekreft`}return`
    <div class="avsl-kamp-block">
      <div class="text-center small fw-semibold text-muted mb-1">Bane ${e.bane_nummer}</div>
      <table class="table table-sm table-bordered mb-0 bg-white">
        <tbody>
          ${u}
          <tr>
            <td colspan="3" class="text-end pe-1">
              ${n&&!e.er_walkover&&!e.er_tre_spelarar?`<button class="btn btn-primary btn-sm" id="plus-${e.id}"${c?` disabled`:``}>+</button> `:``}
              <button class="btn btn-secondary btn-sm" id="scoreboard-${e.id}"
                title="Scoreboard"${c&&!e.er_tre_spelarar?` disabled`:``}>S</button>
              ${n?`<button class="btn ${f} btn-sm${h}" id="bekrft-${e.id}"${m?` disabled`:``}>${p}</button>`:``}
            </td>
          </tr>
        </tbody>
      </table>
    </div>`}function ge(e,n,r,i,a,o,s,c,l,u){if(X?.querySelector(`#start-avsl-btn`)?.addEventListener(`click`,async()=>{if(!a)return;let{error:t}=await k(n,`avsluttende`);if(t){O(`Feil ved oppstart av avsluttande fase`,`error`);return}if(i?.nA!=null){let e=i.nA,t=l.A??null,r=l.B??null,{error:a}=await S(n,u.map((n,i)=>({kasterid:n.kasterid,gruppeid:i<e?t:r??t})));if(a){O(`Feil ved lagring av gruppefordeling`,`error`);return}}await Q(e,n)}),!o){let i=parseInt(e.querySelector(`#gruppe-val-wrapper`)?.dataset.n??`0`)||s.length,a=[...s];function o(t,n){let r=e.querySelector(`input[name="${t}"]:checked`);if(r?.dataset.oppsett)try{return JSON.parse(r.dataset.oppsett)}catch{}return P(n)[0]??null}let c=e.querySelector(`#gruppe-paneler`);c&&c.addEventListener(`change`,t=>{let n=t.target;if(!n.matches(`input[name^="runde1-format"]`))return;let r=parseInt(e.querySelector(`input[name="gruppe-split"]:checked`)?.value??String(i)),s=i-r,c=o(`runde1-format-a`,r),l=o(`runde1-format-b`,s);if(n.name===`runde1-format-a`){let t=e.querySelector(`#struktur-a`);t&&(t.outerHTML=B(r,c,`a`))}else{let t=e.querySelector(`#struktur-b`);t&&(t.outerHTML=B(s,l,`b`))}let u=c?.walkovers??0,d=l?.walkovers??0,f=e.querySelector(`#gruppe-preview`);f&&(f.innerHTML=z(a.map((e,t)=>({...e,cupPlassering:t+1})),r,u,d))}),e.querySelectorAll(`input[name="gruppe-split"]`).forEach(t=>{t.addEventListener(`change`,()=>{let n=parseInt(t.value),r=i-n,o=a.map((e,t)=>({...e,cupPlassering:t+1})),s=P(n)[0]??null,l=r>=2?P(r)[0]??null:null;c&&(c.innerHTML=`<div id="gruppe-panel-a" class="avsl-gruppe-kol">
              ${V(`Gruppe A`,n,`runde1-format-a`,s)}
            </div>`+(r>=2?`<div id="gruppe-panel-b" class="avsl-gruppe-kol">
              ${V(`Gruppe B`,r,`runde1-format-b`,l)}
            </div>`:``));let u=s?.walkovers??0,d=l?.walkovers??0,f=e.querySelector(`#gruppe-preview`);f&&(f.innerHTML=z(o,n,u,d))})}),e.querySelector(`#bekreft-gruppe-btn`)?.addEventListener(`click`,async()=>{let s=e.querySelector(`input[name="gruppe-split"]:checked`);if(!s)return;let c=parseInt(s.value),u=i-c,{error:d}=await t(n,{A:o(`runde1-format-a`,c),B:u>=2?o(`runde1-format-b`,u):null,nA:c});if(d){O(`Feil ved lagring av format`,`error`);return}if(r.stevne_fase===`avsluttende`){let e=l.A??null,t=l.B??null,{error:r}=await S(n,a.map((n,r)=>({kasterid:n.kasterid,gruppeid:r<c?e:t??e})));if(r){O(`Feil ved lagring av gruppefordeling`,`error`);return}}await Q(e,n)})}X?.querySelector(`#endre-gruppeinndeling-btn`)?.addEventListener(`click`,async()=>{await D({title:`Tilbakestill gruppeinndeling`,message:`Gruppefordeling og format vert fjerna.`,danger:!0})&&(await Promise.all([T(n),t(n,null)]),await Q(e,n))}),o&&e.querySelectorAll(`[data-generer-gruppe]`).forEach(t=>{t.addEventListener(`click`,()=>{let r=t.dataset.genererGruppe??``,a=parseInt(t.dataset.runde??`1`);ce(n,r,s.filter(e=>e.gruppe?.navn===r),a,i,()=>Q(e,n))})}),X?.querySelector(`#fullfør-turnering-btn`)?.addEventListener(`click`,async()=>{if(!await D({title:`Fullfør turnering`,message:`Vil du fullføre turneringa? Dette kan ikkje angrast.`,danger:!0}))return;let{error:t}=await p(n);if(t){O(`Feil ved fullføring av turnering`,`error`);return}await Q(e,n)})}function _e(t,n,i,a,o=!1){for(let a of i){let i=a.spelarar.slice().sort((e,t)=>(e.posisjon??0)-(t.posisjon??0));if(t.querySelector(`#plus-${a.id}`)?.addEventListener(`click`,async()=>{let e=i[0],a=i[1];A(e?.kaster?`${e.kaster.fornavn} ${e.kaster.etternavn}`:`—`,a?.kaster?`${a.kaster.fornavn} ${a.kaster.etternavn}`:`—`,r(e),r(a),async(r,i)=>{let o=[];e?.id&&o.push(b(e.id,r)),a?.id&&o.push(b(a.id,i)),await Promise.all(o),await Q(t,n)})}),t.querySelector(`#scoreboard-${a.id}`)?.addEventListener(`click`,()=>{window.open(`#/kamp/${a.id}`,`_blank`)}),t.querySelector(`#bekrft-${a.id}`)?.addEventListener(`click`,()=>{a.er_tre_spelarar?q(a,i,n,async()=>{await $(n,a),await Q(t,n)}):ve(t,n,a,i)}),o&&a.er_bekreftet&&!a.er_tre_spelarar){let o=i[0],s=i[1],c=o?.kaster?`${o.kaster.fornavn} ${o.kaster.etternavn}`:`—`,l=s?.kaster?`${s.kaster.fornavn} ${s.kaster.etternavn}`:`—`,u=i.map(e=>e.kasterid).filter(e=>e!=null),d=()=>{A(c,l,r(o),r(s),async(r,i)=>{let c=[o?.id,s?.id].filter(e=>e!=null);if(c.length){let{error:e}=await y(c);if(e){O(`DB-feil ved sletting av omgangar`,`error`);return}}let l=[];if(o?.id&&l.push(b(o.id,r)),s?.id&&l.push(b(s.id,i)),(await Promise.all(l)).find(e=>e.error)?.error){O(`DB-feil ved oppdatering av score`,`error`);return}let d=r>=i?o?.kasterid:s?.kasterid,f=r>=i?s?.kasterid:o?.kasterid;await e({stevneId:n,rundeNummer:a.runde_nummer,rundeNavn:a.runde_navn,allKasterids:u,nyVinnarId:d,nyTaparId:f}),await Q(t,n)})};t.querySelectorAll(`[data-endre-score="${a.id}"]`).forEach(e=>e.addEventListener(`click`,d))}}}async function ve(e,t,n,i){let a=i[0],o=i[1],{data:s}=await l(n.id),c=s.find(e=>e.id===a?.id),u=s.find(e=>e.id===o?.id),f=r(c??a),p=r(u??o);if(f===0&&p===0&&!await D({title:`Ingen score registrert`,message:`Vil du bekrefte kampen likevel?`}))return;let m=f>=p?a:o,h=f>=p?o:a,g=i.map(e=>e.kasterid).filter(e=>e!=null),_=m?.kasterid==null?[]:[m.kasterid],{error:v}=await d({kampId:n.id,stevneId:t,rundeNummer:n.runde_nummer,rundeNavn:n.runde_navn,allKasterids:g,eliminertId:h?.kasterid??null,vidareIds:_});if(v){O(`DB-feil ved bekreft`,`error`);return}await $(t,n),await Q(e,t)}async function $(e,t){t.runde_navn!==`Semifinale`||!t.gruppe_navn||await E(e,t.gruppe_navn)&&await se(e,t.gruppe_navn)}function ye(e,t){if(Y)return;let n=C(t,[`avsluttende`],e,Q,()=>{Y&&=(g(Y),null)});Y=c(t,`stevne-avsl-cup-${t}`,n)}export{de as render};