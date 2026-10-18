import{n as e,t}from"./logError-BkXRFcqp.js";import{Bt as n,En as r,Hn as i,It as a,Jn as o,Qt as s,Rn as c,Sr as l,Ut as u,Vn as d,Xn as f,_ as p,cr as m,f as h,ft as g,g as _,kt as v,on as y,qn as b,tr as x,u as S,xr as C}from"./index-D6KMvqKH.js";import{_ as w,r as T,t as E}from"./kampService-D5WcNwrZ.js";import{t as D}from"./navigation-DSwGXsno.js";import{t as O}from"./groupBy-Bg_SEHjk.js";import{t as k}from"./ScoreboardButton-_ewnHFUz.js";import{a as A,d as j,f as M,l as ee,m as N,n as te,p as ne,r as re,u as P}from"./stevne-9qntX5JN.js";import{C as ie,D as ae,E as oe,O as se,S as ce,T as le,_ as ue,b as de,g as fe,k as F,v as I,x as pe,y as me}from"./padInput-DtzMhw4n.js";import{n as he,r as ge,t as L}from"./kampScoreEditor-vYtAluMs.js";function R(e,{showPlayerList:t=!0,initNa:n=null,initFormat:r=null}={}){let i=typeof e==`number`?e:e.length,a=typeof e==`number`?[]:e.map((e,t)=>({...e,cupPlassering:t+1})),o=M(i),s=n===i?i:n!=null&&o.some(e=>e.nA===n)?n:o[0]?.nA??i,c=i-s,l=o.filter(e=>N(e.nA).some(e=>e.c3>0)),u=o.filter(e=>!N(e.nA).some(e=>e.c3>0)),d=N(i).length>0,f=(e,t)=>e.map((e,r)=>{let a=e.nA===s&&n!==i,o=t+r;return`
      <div class="form-check">
        <input class="form-check-input" type="radio" name="group-split" id="split-${o}" value="${e.nA}" ${a?`checked`:``}>
        <label class="form-check-label" for="split-${o}">A:${e.nA} — B:${e.nB}</label>
      </div>`}).join(``),p=[];l.length&&p.push(`<div class="text-muted small fw-semibold mb-1">3 spillere per bane (A)</div>${f(l,0)}`),u.length&&(p.length&&p.push(`<hr class="my-2">`),p.push(`<div class="text-muted small fw-semibold mb-1">2 spillere per bane (A)</div>${f(u,l.length)}`)),d&&(p.length&&p.push(`<hr class="my-2">`),p.push(`
      <div class="form-check">
        <input class="form-check-input" type="radio" name="group-split" id="split-none" value="${i}" ${n===i?`checked`:``}>
        <label class="form-check-label" for="split-none">Alle i A</label>
      </div>`));let m=p.join(``),h=r?.A??N(s)[0]??null,g=c>=2?r?.B??N(c)[0]??null:null,_=t?`<div id="group-preview">${B(a,s,h?.walkovers??0,g?.walkovers??0)}</div>`:``;return`
    <div id="group-assignment-wrapper" data-n="${i}">
      <h5 class="mb-3">Velg gruppefordeling for cup</h5>
      <div class="d-flex group-layout gap-3 align-items-start mb-3">
        <div class="card">
          <div class="card-body">
            ${m}
          </div>
        </div>
        <div id="group-panels" class="d-flex gap-3 flex-wrap">
          <div id="group-panel-a" class="final-group-col">
            ${H(`Gruppe A`,s,`round1-format-a`,h)}
          </div>
          ${c>=2?`<div id="group-panel-b" class="final-group-col">
            ${H(`Gruppe B`,c,`round1-format-b`,g)}
          </div>`:``}
        </div>
      </div>
      ${_}
      <div class="confirm-banner">
        <button id="confirm-group-btn" class="btn btn-success btn-lg w-100">Bekreft gruppefordeling</button>
      </div>
    </div>
  `}function _e(e,t,n,r){let i=parseInt(e.querySelector(`#group-assignment-wrapper`)?.dataset.n??`0`)||t.length,a=t.map((e,t)=>({...e,cupPlassering:t+1})),o=e.querySelector(`#group-panels`);function s(t,n){let r=e.querySelector(`input[name="${t}"]:checked`);if(r?.dataset.oppsett)try{return JSON.parse(r.dataset.oppsett)}catch{}return N(n)[0]??null}function c(){return parseInt(e.querySelector(`input[name="group-split"]:checked`)?.value??String(i))}function l(t,n,r){let i=e.querySelector(`#group-preview`);i&&(i.innerHTML=B(a,t,n?.walkovers??0,r?.walkovers??0))}function u(){let t=e.querySelector(`input[name="group-split"]:checked`);if(!t)return null;let n=parseInt(t.value),r=i-n;return{nA:n,nB:r,setupA:s(`round1-format-a`,n),setupB:r>=2?s(`round1-format-b`,r):null}}let d=e.querySelector(`#confirm-group-btn`);function f(){let e=u();if(!r||!e)return!1;let{saved:t}=r;return e.nA===t.nA&&z(e.setupA,t.A??null)&&z(e.setupB,t.B??null)}function p(){if(!d)return;let e=f();d.disabled=e&&!!r?.blocked,d.textContent=e?r?.blocked??`Start`:`Bekreft gruppefordeling`}return e.querySelector(`#group-assignment-wrapper`)?.addEventListener(`change`,p),p(),o?.addEventListener(`change`,t=>{let n=t.target;if(!n.matches(`input[name^="round1-format"]`))return;let r=c(),a=i-r,o=s(`round1-format-a`,r),u=s(`round1-format-b`,a);if(n.name===`round1-format-a`){let t=e.querySelector(`#structure-a`);t&&(t.outerHTML=V(r,o,`a`))}else{let t=e.querySelector(`#structure-b`);t&&(t.outerHTML=V(a,u,`b`))}l(r,o,u)}),e.querySelectorAll(`input[name="group-split"]`).forEach(e=>{e.addEventListener(`change`,()=>{let t=parseInt(e.value),n=i-t,r=N(t)[0]??null,a=n>=2?N(n)[0]??null:null;o&&(o.innerHTML=`<div id="group-panel-a" class="final-group-col">
            ${H(`Gruppe A`,t,`round1-format-a`,r)}
          </div>`+(n>=2?`<div id="group-panel-b" class="final-group-col">
            ${H(`Gruppe B`,n,`round1-format-b`,a)}
          </div>`:``)),l(t,r,a)})}),d?.addEventListener(`click`,()=>{let e=u();e&&(r&&f()?r.onStart():n(e))}),{setBlocked:e=>{r&&(r.blocked=e),p()}}}function z(e,t){return e?.walkovers===t?.walkovers&&e?.c3===t?.c3&&e?.c2===t?.c2}function B(e,t,n=0,r=0){let i=e.slice(0,t),a=e.slice(t),o=e.some(e=>e.poeng_xkast!=null);function s(e,t=0){return e.map((e,n)=>{let r=n<t,i=o?e.antall_ring_xkast??0:e.kamp_poeng??0,a=o?e.poeng_xkast??0:e.score_poeng??0;return`
      <tr>
        <td>${e.cupPlassering}</td>
        <td>${h(e.navn??``)}${r?` <span class="badge bg-info text-dark">Walkover</span>`:``}</td>
        <td class="text-center">${i}</td>
        <td class="text-center">${a}</td>
      </tr>`}).join(``)}let c=`
    <thead class="stevne-thead"><tr>
      <th class="th-32">#</th><th>NAMN</th>
      <th class="th-44 text-center">${o?`R`:`KP`}</th>
      <th class="th-44 text-center">${o?`X`:`SP`}</th>
    </tr></thead>`,l=`
    <table class="table table-bordered table-sm bg-white mb-0">
      ${c}
      <tbody>${s(i,n)}</tbody>
    </table>`,u=a.length?`
    <table class="table table-bordered table-sm bg-white mb-0">
      ${c}
      <tbody>${s(a,r)}</tbody>
    </table>`:``;return`
    <div class="d-flex gap-3 flex-wrap">
      <div class="avsl-gruppe-kol">
        <h6 class="fw-bold text-center">GRUPPE A (${i.length})</h6>
        ${l}
      </div>
      ${a.length?`<div class="avsl-gruppe-kol">
        <h6 class="fw-bold text-center">GRUPPE B (${a.length})</h6>
        ${u}
      </div>`:``}
    </div>`}function ve(e){let t=e.c3>0?3:2;return`${e.walkovers} walkover - ${t} deltakere per bane`}function ye(e,t,n,r=null){let i=N(t);return i.length<=1?``:`<div class="d-flex flex-column align-items-start gap-1 mb-2">${i.map((e,t)=>{let i=`${n}-${t}`,a=JSON.stringify(e),o=r?e.walkovers===r.walkovers&&e.c3===r.c3&&e.c2===r.c2:t===0,s=e.c3>0?`btn-outline-success`:`btn-outline-warning`;return`
      <input type="radio" class="btn-check" name="${n}" id="${i}"
        value='${a}' data-oppsett='${a}' autocomplete="off" ${o?`checked`:``}>
      <label class="btn btn-sm ${s}" for="${i}">${ve(e)}</label>`}).join(``)}</div>`}function V(e,t,n){return`<div id="structure-${n}">
    <table class="table table-sm table-bordered mb-0">
      <thead><tr>
        <th>Runde</th><th>Deltakere</th><th>Baner</th><th>Per bane</th>
      </tr></thead>
      <tbody>${(e>=2?j(e,{runde1:t}):[]).map((e,n)=>{let r=e.walkovers??0,i=e.players-r,a=r>0?`${i} <span class="text-muted">(${r} w.o.)</span>`:`${i}`,o;return o=n===0&&t?t.c3>0&&t.c2>0?`2/3`:t.c3>0?`3`:`2`:e.players%e.lanes===0?String(e.players/e.lanes):`2/3`,`<tr${e.threePlayers?` class="fw-bold"`:``}>
      <td>${e.runde}</td>
      <td>${a}</td>
      <td>${e.lanes}</td>
      <td>${o}</td>
    </tr>`}).join(``)}</tbody>
    </table>
  </div>`}function H(e,t,n,r){let i=n.slice(-1),a=ye(e,t,n,r);return`
    <div class="card">
      <div class="card-body">
        <h6 class="fw-bold mb-2">${a?`${e}: Velg format`:`${e} (${t})`}</h6>
        ${a}
        ${V(t,r,i)}
      </div>
    </div>`}function U(){return crypto.randomUUID()}async function W(t){let{data:n,error:r}=await e.from(`resultat`).select(`kasterid, startnummer, posisjon`).eq(`stevneid`,t);if(r)throw Error(`Feil ved henting av resultat: `+r.message);let i={},a={};for(let e of n??[])e.kasterid!=null&&e.startnummer!=null&&(i[e.kasterid]=e.startnummer,(a[e.startnummer]??=[]).push({kasterid:e.kasterid,posisjon:e.posisjon}));let o={};for(let[e,t]of Object.entries(a))t.sort((e,t)=>(e.posisjon??1/0)-(t.posisjon??1/0)||e.kasterid-t.kasterid),o[Number(e)]=t.map(e=>e.kasterid);return{kasteridToSnr:i,snrToMembers:o}}function be(e,t){let n=e.kasteridToSnr[t];return(n==null?void 0:e.snrToMembers[n])??[t]}function G(e,t,n,r,i,a=0,o=null,s=U){let c=a;return t.map(t=>({match:{match_id:s(),stevneid:e,fase:`avsluttende`,runde_nummer:n,gruppe_navn:r??null,bane_nummer:t.isWalkover?null:++c,er_bekreftet:t.isWalkover,er_walkover:t.isWalkover,er_tre_spelarar:t.isThreePlayers,runde_navn:o},playerKasterids:t.players.flatMap(e=>be(i,Number(e)))}))}async function K(t){if(t.length===0)return 0;let n=t.map(e=>({match_id:e.match.match_id,stevneid:e.match.stevneid,fase:e.match.fase,runde_nummer:e.match.runde_nummer,gruppe_navn:e.match.gruppe_navn??null,bane_nummer:e.match.bane_nummer??null,er_bekreftet:e.match.er_bekreftet??!1,er_walkover:e.match.er_walkover??!1,er_tre_spelarar:e.match.er_tre_spelarar??!1,runde_navn:e.match.runde_navn??null,players:e.playerKasterids.map(e=>({kasterid:e}))})),{data:r,error:i}=await e.rpc(`insert_avsluttende_matches`,{p_matches:n});if(i)throw Error(`Feil ved innsetting av cup-kampar: `+i.message);return r??0}async function xe(e,t,n,r,i,a=0,o=null){return K(G(e,t,n,r,i,a,o))}function Se(e,t,n){if(!e||!t)return 0;let r=n.indexOf(t),i=0;for(let t of n.slice(0,r)){let n=e[t];n&&(i+=(n.c3??0)+(n.c2??0))}return i}async function Ce(e,t,n,r=null){let i=[`A`,`B`,`C`],a=await W(e),o=await q(e,1),s=[];for(let c of t){let t=P(c.spelarar,{medSeeding:n,isRunde1:!0,runde1Oppsett:c.runde1Oppsett??null}),l=Math.max(o,Se(r,c.groupName,i)),u=c.spelarar.length===4,d=G(e,t,1,c.groupName,a,l,u?`Semifinale`:null);s.push(...d);for(let{match:e}of d)e.bane_nummer!=null&&e.bane_nummer>o&&(o=e.bane_nummer)}return K(s)}async function q(t,n){let{data:r}=await e.from(`kamp`).select(`bane_nummer`).eq(`stevneid`,t).eq(`fase`,`avsluttende`).eq(`runde_nummer`,n).not(`bane_nummer`,`is`,null).order(`bane_nummer`,{ascending:!1}).limit(1);return r?.[0]?.bane_nummer??0}async function we(t,n,r,i){let{data:a}=await e.from(`kamp`).select(`runde_nummer`).eq(`stevneid`,t).eq(`fase`,`avsluttende`).eq(`gruppe_navn`,n).order(`runde_nummer`,{ascending:!1}).limit(1),o=(a?.[0]?.runde_nummer??0)+1,s=i.length===4,c=P(i,{medSeeding:r,isRunde1:!1}),l=await q(t,o);return{roundNumber:o,matchCount:await xe(t,c,o,n,await W(t),l,s?`Semifinale`:null)}}async function Te(t,n){let{data:r}=await e.from(`kamp`).select(`id, runde_nummer, spelarar:kamp_spelar(id, kasterid, score_poeng, omgangar:kamp_omgang(score))`).eq(`stevneid`,t).eq(`fase`,`avsluttende`).eq(`gruppe_navn`,n).eq(`runde_navn`,`Semifinale`).eq(`er_bekreftet`,!0);if(!r?.length)throw Error(`Semifinalane er ikkje bekrefta.`);let i=await W(t),a=r,o=a[0].runde_nummer+1,s=[],c=[];for(let e of a){let t=new Map;for(let n of e.spelarar??[]){if(n.kasterid==null)continue;let e=i.kasteridToSnr[n.kasterid]??`kaster-${n.kasterid}`,r=t.get(e)??{kasterids:[],score:0};r.kasterids.push(n.kasterid),r.score+=n.omgangar?.length?n.omgangar.reduce((e,t)=>e+(t.score??0),0):n.score_poeng??0,t.set(e,r)}let n=[...t.values()].sort((e,t)=>t.score-e.score);n[0]&&s.push(n[0].kasterids),n[1]&&c.push(n[1].kasterids)}let l=await q(t,o);await K([{match:{match_id:U(),stevneid:t,fase:`avsluttende`,runde_nummer:o,gruppe_navn:n,bane_nummer:l+1,runde_navn:`Finale`,er_bekreftet:!1,er_walkover:!1,er_tre_spelarar:!1},playerKasterids:s.flat()},{match:{match_id:U(),stevneid:t,fase:`avsluttende`,runde_nummer:o,gruppe_navn:n,bane_nummer:l+2,runde_navn:`Bronsefinale`,er_bekreftet:!1,er_walkover:!1,er_tre_spelarar:!1},playerKasterids:c.flat()}])}function Ee(e,n,r,i,a,o){let s=r.filter(e=>e.runde_eliminert==null),c=r.length,l=s.length,u=r.some(e=>e.poeng_xkast!=null),d=e=>u?`${e.poeng_xkast??0}p (${e.antall_ring_xkast??0})`:`${e.kamp_poeng??0}p (${e.score_poeng??0})`,f=i===1?a?.[n]??null:null,p=f?.walkovers??0,m=(f?f.c3:l%3==0?l/3:0)+(f?f.c2:l%3==0?0:l/2),g=s.slice(p,p+m),v=s.slice(p+m,p+2*m),y=s.slice(p+2*m),b=document.createElement(`div`);b.className=`final-dialog-overlay`,document.body.appendChild(b);let x=null,S=!1,C=0,w=0;function T(e){if(!S)return;let t=b.querySelector(`.final-dialog-card-wide`);if(!t)return;let n=e.clientX-C,r=e.clientY-w;x={left:n,top:r},t.style.left=`${n}px`,t.style.top=`${r}px`}function E(){S&&(S=!1,document.body.style.userSelect=``)}document.addEventListener(`mousemove`,T),document.addEventListener(`mouseup`,E);function D(){document.removeEventListener(`mousemove`,T),document.removeEventListener(`mouseup`,E)}function O(e){return`<div class="d-flex justify-content-between gap-2 py-1">
      <span class="small">${h(e.navn??``)}</span>
      <span class="small text-muted text-nowrap">${d(e)}</span>
    </div>`}function k(r){let u=s.slice(0,p),T=u.length>0?`<div class="mb-3">
          <strong class="d-block mb-1">Walkovers (går vidare utan kamp):</strong>
          ${u.map(e=>O(e)).join(``)}
        </div>`:``,E=r===!0&&m>0?`<div class="alert alert-info small mb-3 py-2">
          Dette er seedinggrupper, ikkje kampar. Spelarar i same gruppe kan ikkje trekkast mot kvarandre. Kampane blir oppretta når du klikkar «Bekreft og opprett kampar».
        </div>`:``,A=r===!0&&m>0?`<div class="d-flex gap-3 flex-wrap mb-3">
          ${[{label:`Seeding 1`,pool:g},{label:`Seeding 2`,pool:v},...y.length?[{label:`Seeding 3`,pool:y}]:[]].map(({label:e,pool:t})=>`
            <div class="card flex-grow-1">
              <div class="card-body p-2">
                <strong class="d-block mb-2 small text-uppercase">${h(e)}</strong>
                ${t.map(e=>O(e)).join(``)}
              </div>
            </div>`).join(``)}
        </div>`:`<div class="final-player-columns mb-3">
          ${s.slice(p).map((e,t)=>`
            <div class="small d-flex justify-content-between gap-2">
              <span>${p+t+1}. ${h(e.navn??``)}</span>
              <span class="text-muted text-nowrap">${d(e)}</span>
            </div>`).join(``)}
        </div>`;b.innerHTML=`
      <div class="card final-dialog-card-wide">
        <div class="final-dialog-drag-handle">
          <p class="text-muted small text-uppercase fw-semibold mb-1">Trekning</p>
          <h5 class="mb-1">Gruppe ${h(n)} — Runde ${i}</h5>
          <p class="text-muted small mb-0">${l} av ${c} spelarar igjen</p>
        </div>
        <div class="final-dialog-body">
          <div class="mb-3">
            <span class="form-label fw-semibold d-block mb-1">Bruk seeding</span>
            <div class="form-check form-check-inline">
              <input class="form-check-input" type="radio" name="seeding-dlg" id="seeding-ja" value="ja" ${r===!0?`checked`:``}>
              <label class="form-check-label" for="seeding-ja">Ja</label>
            </div>
            <div class="form-check form-check-inline">
              <input class="form-check-input" type="radio" name="seeding-dlg" id="seeding-nei" value="nei" ${r===!1?`checked`:``}>
              <label class="form-check-label" for="seeding-nei">Nei</label>
            </div>
          </div>
          ${E}
          ${T}
          ${A}
        </div>
        <div class="final-dialog-footer">
          <div class="d-flex gap-2">
            <button id="bekreft-gen-btn" class="btn btn-primary" ${r===null?`disabled`:``}>Bekreft og opprett kampar</button>
            <button id="avbryt-gen-btn" class="btn btn-secondary">Avbryt</button>
          </div>
        </div>
      </div>`;let j=b.querySelector(`.final-dialog-card-wide`);x&&(j.style.position=`fixed`,j.style.left=`${x.left}px`,j.style.top=`${x.top}px`,j.style.margin=`0`,j.style.zIndex=`10000`),j.querySelector(`.final-dialog-drag-handle`).addEventListener(`mousedown`,e=>{let t=j.getBoundingClientRect();j.style.position=`fixed`,j.style.left=`${t.left}px`,j.style.top=`${t.top}px`,j.style.margin=`0`,j.style.zIndex=`10000`,C=e.clientX-t.left,w=e.clientY-t.top,x={left:t.left,top:t.top},S=!0,document.body.style.userSelect=`none`}),b.querySelector(`#seeding-ja`).addEventListener(`change`,()=>k(!0)),b.querySelector(`#seeding-nei`).addEventListener(`change`,()=>k(!1)),b.querySelector(`#avbryt-gen-btn`).addEventListener(`click`,()=>{D(),b.remove()}),b.querySelector(`#bekreft-gen-btn`).addEventListener(`click`,async()=>{if(r===null)return;let c=b.querySelector(`#bekreft-gen-btn`);c.disabled=!0,c.textContent=`Lagrer…`;try{let t=s.map((e,t)=>({kasterid:e.kasterid,plassering:t+1}));if(i===1){let i={A:a?.A??void 0,B:a?.B??void 0};await Ce(e,[{groupName:n,spelarar:t,runde1Oppsett:f}],r,a?i:null)}else await we(e,n,r,t);D(),b.remove(),await o()}catch(e){t(`cup:genererRunde`,e),_(`Feil ved generering av runde`,`error`),c.disabled=!1,c.textContent=`Bekreft og opprett kampar`}})}k(null)}function De(e,t,n){let r=t.map(e=>F(e,!1)),i=[],a=document.createElement(`div`);a.className=`final-dialog-overlay`,document.body.appendChild(a);function o(){let s=i.length===2?t.find(e=>!i.includes(e.rep.kasterid)):null;a.innerHTML=`
      <div class="card p-4 final-dialog-card">
        <h5 class="card-title mb-1">Bekreft 3-spelar kamp</h5>
        <p class="text-muted small mb-3">Vel dei to som går vidare. Den gjenverande er utslått.</p>
        <div class="d-flex flex-column gap-2 mb-3">
          ${t.map((e,t)=>{let n=i.indexOf(e.rep.kasterid),a=n!==-1,o=!!s&&s.rep.kasterid===e.rep.kasterid,c=n===0?`1. plass`:n===1?`2. plass`:``;return`<button
              class="btn ${a?`btn-success`:o?`btn-outline-danger`:`btn-outline-secondary`} text-start d-flex justify-content-between align-items-center"
              data-kasterid="${e.rep.kasterid}"
              ${o?`disabled`:``}
            ><span>${r[t]}</span>${c?`<span class="badge bg-success-subtle text-success-emphasis">${c}</span>`:o?`<span class="badge bg-danger">Utslått</span>`:``}</button>`}).join(``)}
        </div>
        <div class="d-flex gap-2">
          <button id="bekreft-tre-btn" class="btn btn-success" ${i.length===2?``:`disabled`}>Bekreft</button>
          <button id="avbryt-tre-btn" class="btn btn-secondary">Avbryt</button>
        </div>
      </div>
    `,a.querySelector(`#avbryt-tre-btn`).addEventListener(`click`,()=>a.remove()),a.querySelectorAll(`[data-kasterid]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=Number(e.dataset.kasterid),n=i.indexOf(t);n===-1?i.length<2&&i.push(t):i.splice(n,1),o()})}),a.querySelector(`#bekreft-tre-btn`)?.addEventListener(`click`,async()=>{if(i.length!==2)return;if(e.spelarar.some(e=>(e.omgangar?.length??0)>0)){a.hidden=!0;let e=await L();if(a.hidden=!1,!e)return}let r=t.find(e=>!i.includes(e.rep.kasterid))??null,o=i.map(e=>t.find(t=>t.rep.kasterid===e)).filter(e=>e!=null).map(e=>e.members.map(e=>e.kasterid));a.remove();let{error:s}=await E({kampId:e.id,sides:t.map(e=>w(e,{baseScore:0})),outcome:{type:`cup-ranked`,eliminatedIds:r?.members.map(e=>e.kasterid)??[],advancingSides:o,deleteRounds:!0}});if(s){_(`DB-feil ved bekreft`,`error`);return}await n()})}o()}var J=`Ein cupkamp kan ikkje ende uavgjort.`;function Y(e,t,n,r){let i=n>=r?e:t,a=n>=r?t:e,o=i?.members.map(e=>e.kasterid)??[],s=a?.members.map(e=>e.kasterid)??[];return{winnerIds:o,loserIds:s,placements:[...o.map(e=>({kasterid:e,plassering:1})),...s.map(e=>({kasterid:e,plassering:2}))]}}async function Oe(e){let{kamp:t,sides:n,s1:r,s2:i}=e;if(r===i)return{error:Error(J)};let a=n[0]??null,o=n[1]??null,{winnerIds:s,loserIds:c}=Y(a,o,r,i);return E({kampId:t.id,sides:[w(a,{baseScore:r}),w(o,{baseScore:i})],outcome:{type:`cup-ranked`,eliminatedIds:c,advancingSides:s.length?[s]:[],deleteRounds:!0}})}function ke(e){return e.map(e=>({er_bekreftet:e.er_bekreftet,er_walkover:e.er_walkover,runde_nummer:e.runde_nummer,bane_nummer:e.bane_nummer,spelarar:Ae(e.spelarar)}))}function Ae(e){return e.map(e=>({kasterid:e.kasterid??0,kamp_poeng:e.kamp_poeng??0,score_poeng:e.score_poeng??0,antall_ringer:e.antall_ringer,omgangar:e.omgangar,kaster:e.kaster}))}function je(e){let n=null,a=!1,s=new Set,c=new Set,u=pe(e.channelName,[`avsluttende`],c,_),p=null,m=0;async function h(e,{id:t,isAdmin:r=!1},i=null){n=i,a=r,await u.stop(),e.replaceChildren(l(`Laster…`)),await _(e,t)}async function _(e,n){try{let t=m,[{data:a},{data:o},{data:s},{data:c},{count:l}]=await Promise.all([g(n),T(n),i(n),d([`A`,`B`]),v(n)]);if(!a){e.replaceChildren(C(`Stevne ikkje funne.`));return}let u=a.kategori?.erlagbasert?(await r(n)).data.length:null;if(t!==m)return;p={stevne:a,rawMatches:o,rawResults:s,rawGroups:c,registrationCount:l,pairCount:u},b(e,n,p)}catch(n){t(`avsluttendeBase.loadAndRender`,n),e.replaceChildren(C(`Kunne ikkje laste avsluttande fase.`))}}function y(e,n,r,i){let a=p?.rawMatches.find(e=>e.id===r);if(p&&a){try{i(a),m++,b(e,n,p)}catch(e){t(`avsluttendeBase.showSaved`,e)}u.start(e,n)()}}function b(t,r,i){let{stevne:l,rawMatches:d,rawResults:p,rawGroups:m,registrationCount:h,pairCount:g}=i;c.clear();for(let e of d)for(let t of e.spelarar)c.add(t.id);let v=p.filter(e=>e.kasterid!=null),b=d.filter(e=>e.fase===`innledende`),x=d.filter(e=>e.fase===`avsluttende`),{startNumberMap:S,positionMap:C,isTeam:w}=ee(v),T={};for(let e of d)for(let t of e.spelarar)t.kasterid&&t.kaster&&!T[t.kasterid]&&(T[t.kasterid]=`${t.kaster.fornavn} ${t.kaster.etternavn}`);for(let e of v)e.kaster&&!T[e.kasterid]&&(T[e.kasterid]=`${e.kaster.fornavn} ${e.kaster.etternavn}`);let E=ke(b),D=o(E,v,T,S,C),O=b.length>0&&b.every(e=>e.er_bekreftet),k=x.length>0,j=(b.length>0||k)&&b.every(e=>e.er_bekreftet)&&x.every(e=>e.er_bekreftet),M=v.some(e=>e.gruppe!=null),N=Object.fromEntries(m.map(e=>[e.navn,e.id])),P=ne(l.runde1_format),F={container:t,stevneid:r,stevne:l,standings:D,startNumberMap:S,positionMap:C,isTeam:w,nameMap:T,initialMatches:b,finalMatches:x,results:v,isAdmin:a,hasGroupAssignment:M,allInitialConfirmed:O,hasFinalMatches:k,round1Format:P,unitCount:g??h??0,groupNameMap:N,reload:()=>_(t,r),showSaved:(e,n)=>y(t,r,e,n)};se(n,e.bannerMeta(F)),a&&n&&(n.innerHTML=re(ce(l,{allMatchesConfirmed:j,hasFinalMatches:k,hasGroupAssignment:M,hasPreconfiguredFormat:P!=null&&l.stevne_fase!==`avsluttende`})),te(n));let I=ie(t);if(M){let n=oe(D,E,S,{tableId:`standing-final`,hasGroups:!0,hasElimination:!0,positionMap:C,unitLabel:w?`par`:`spelarar`});t.innerHTML=le(e.renderMatchesHtml(F),n),me(t,`standing-final`,s),de(t),I===`standing`&&ae(t,`standing`),e.bindMatchEvents(t,F),u.start(t,r)}else t.innerHTML=e.renderSetupHtml(F);n&&(fe(n,{title:`Autofullfør kampar`,message:`Autofullfør alle ubekrefta avsluttande kampar?`},async()=>{await A(r),await _(t,r)}),ue(n,r,()=>f(D),()=>_(t,r))),e.bindHeaderEvents(n,F)}return h}function X(e,t,n){let r=e.spelarar.filter(e=>e.kasterid!=null);return x(r,t,n)}function Z(e,t){return m(e,t.er_bekreftet)}var Q=je({channelName:e=>`stevne-avsl-cup-${e}`,renderMatchesHtml:e=>{let{finalMatches:t,standings:n,startNumberMap:r,positionMap:i,isTeam:a,isAdmin:o}=e;return`<div class="d-flex gap-3 flex-wrap">${[...new Set(n.map(e=>e.gruppe?.navn).filter(e=>e!=null))].sort().map(e=>{let s=t.filter(t=>t.gruppe_navn===e),c=n.filter(t=>t.gruppe?.navn===e),l=c.filter(e=>e.runde_eliminert==null).length,u=c.length,d=s.length?Math.max(...s.map(e=>e.runde_nummer)):0,f=s.filter(e=>e.runde_nummer===d),p=f.length>0&&f.every(e=>e.er_bekreftet||e.er_walkover),m=s.some(e=>e.runde_navn===`Semifinale`),h=o&&(s.length===0||p)&&l>1&&!m,g=f.length>0&&f.every(e=>e.runde_navn===`Semifinale`),_=s.some(e=>e.runde_navn===`Finale`);return Ne(e,s,l,u,d,h,o&&g&&p&&!_,r,i,a?`par`:`spelarar`,o)}).join(``)}</div>`},bindMatchEvents:(e,t)=>{(t.isAdmin||t.finalMatches.length!==0)&&Re(e,t.finalMatches,t.isAdmin,t.reload,t.showSaved,t.startNumberMap,t.positionMap)},renderSetupHtml:e=>{let{stevne:t,isAdmin:n,round1Format:r,unitCount:i,standings:a}=e,o=r?.nA??null;if(t.stevne_fase===`avsluttende`)return n?R(a,{showPlayerList:!0,initNa:o,initFormat:r}):`<p class="text-muted fst-italic">Gruppefordeling er ikkje klar enno.</p>`;if(!n)return``;if(i<2)return`<p class="text-muted fst-italic">${t.kategori?.erlagbasert?`Minst 2 par må vere oppretta før gruppefordelinga kan setjast.`:`Minst 2 spelarar må vere påmelde før gruppefordelinga kan setjast.`}</p>`;let s=a.length>0;return R(s?a:i,{showPlayerList:s,initNa:o,initFormat:r})},bannerMeta:({standings:e,round1Format:t,unitCount:n})=>{let r=e.filter(e=>e.gruppe?.navn===`A`).length,i=e.filter(e=>e.gruppe?.navn===`B`).length;return r||i?`Cup - A:${r} - B:${i}`:t?.nA==null?`Cup`:`Cup - A:${t.nA} - B:${(e.length||n)-t.nA}`},bindHeaderEvents:(e,r)=>{let{container:i,stevneid:o,stevne:l,standings:d,results:f,round1Format:m,allInitialConfirmed:h,hasGroupAssignment:g,groupNameMap:v,reload:x}=r,S=y(l.kastemetodeInnl?.navn??``),C=l.stevne_fase===`avsluttende`;async function w(){if(!C){let{error:e}=await n(o,`avsluttende`);if(e){_(`Feil ved oppstart av avsluttande fase`,`error`);return}}if(m?.nA!=null){let e=m.nA,t=v.A??null,n=v.B??null,r=Me(d,f,e,t,n),{error:i}=await b(o,r);if(i){_(`Feil ved lagring av gruppefordeling: `+u(i),`error`);return}}await x()}let T=!C&&S&&l.stevne_fase===`innledende`,E=m?.nA==null?void 0:{saved:m,onStart:w,blocked:!C&&(l.stevne_fase!==`innledende`||S||!h)?`Innleiande rundar er ikkje fullført`:void 0};if(!g){let e=_e(i,d,async({nA:e,setupA:t,setupB:n})=>{let{error:r}=await a(o,{A:t,B:n,nA:e});if(r){_(`Feil ved lagring av format: `+u(r),`error`);return}if(_(`Gruppefordeling lagra`,`success`),D(`fra`)===`info`&&(l.stevne_fase??`ikke_startet`)===`ikke_startet`){location.hash=`#/stevne/${o}/info`;return}await x()},E);E&&T&&s(o).then(({data:t})=>{t&&e.setBlocked(void 0)})}e?.querySelector(`#edit-group-assignment-btn`)?.addEventListener(`click`,async()=>{await p({title:`Tilbakestill gruppefordeling`,message:`Gruppefordeling og format vert fjerna.`,danger:!0})&&(await Promise.all([c(o),a(o,null)]),await x())}),g&&(i.querySelectorAll(`[data-generate-group]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.generateGroup??``,n=parseInt(e.dataset.runde??`1`),r=d.filter(e=>e.gruppe?.navn===t);Ee(o,t,r,n,m,x)})}),i.querySelectorAll(`[data-generate-finale-group]`).forEach(e=>{e.addEventListener(`click`,async()=>{let n=e.dataset.generateFinaleGroup??``;e.disabled=!0,e.textContent=`Genererer…`;try{await Te(o,n),await x()}catch(n){t(`cup:genererFinale`,n),_(`Feil ved generering av finale`,`error`),e.disabled=!1,e.textContent=`Generer finale`}})}))}});function Me(e,t,n,r,i){return e.flatMap((e,a)=>{let o=a<n?r:i??r,s=e.startnummer==null?[]:t.filter(t=>t.startnummer===e.startnummer).map(e=>e.kasterid);return(s.length?s:[e.kasterid]).map(e=>({kasterid:e,gruppeid:o}))})}function Ne(e,t,n,r,i,a,o,s,c,l,u=!0){let d=[...O(t,e=>e.runde_nummer)].reverse().map(([e,t])=>{let n=t[0]?.runde_navn??`Runde ${e}`,r=t.filter(e=>!e.er_walkover);return r.length?`
      <h6 class="fw-bold text-center mb-1">${h(n)}</h6>
      <div class="d-flex flex-wrap gap-2 mb-2">
        ${r.map(e=>Ie(e,s,c,u)).join(``)}
      </div>`:``}).join(``),f=i+1,p=a?`<button class="btn btn-success w-100 mt-2"
         data-generate-group="${h(e)}" data-runde="${f}">
         Generer runde ${f}
       </button>`:``,m=o?`<button class="btn btn-success w-100 mt-2" data-generate-finale-group="${h(e)}">
         Generer finale
       </button>`:``;return`
    <div class="final-group-col">
      <h6 class="text-center fw-bold mb-2">Gruppe ${h(e)} (${r} ${h(l)})</h6>
      ${p}
      ${m}
      ${d}
    </div>`}function Pe(e,t,n,r){let i=Z(t,e),a=i>0||r.isConfirmed&&!r.isThreeSides||r.hasRounds?i:`—`,o=t.rep.kamp_plassering,s=e.er_bekreftet&&o!=null&&o>=n,c=e.er_bekreftet&&o!=null&&o<n,l=s?` cup-row--tapar`:c?` cup-row--vinnar`:``,u=`cup-row__score${r.canEditScore?` score-editable`:``}`,d=r.canEditScore?` data-endre-score="${e.id}"`:``;return`<div class="cup-row${l}">
      <span class="cup-row__name">${F(t,!1)}</span>
      <span class="${u}"${d}>${a}</span>
    </div>`}function Fe(e,t,n){return e.er_walkover?`<div class="cup-row">
        <span class="cup-row__name">${F(t[0]??null,!1)} <span class="badge bg-secondary">Walkover</span></span>
        <span class="cup-row__score">—</span>
      </div>`:t.map(r=>Pe(e,r,t.length,n)).join(``)}function Ie(e,t,n,r=!0){let i=X(e,t,n),a=e.er_bekreftet||e.er_walkover,o=e.spelarar.some(e=>(e.omgangar?.length??0)>0),s={isConfirmed:a,hasRounds:o,canEditScore:r&&!e.er_tre_spelarar&&!e.er_walkover&&(!e.er_bekreftet||!o),isThreeSides:e.er_tre_spelarar},c=r&&(!a||o)?k(e.id):``,l=r&&e.er_tre_spelarar?`<div class="cup-card__footer">
          <button class="btn ${a?`btn-secondary`:`btn-outline-secondary`} btn-sm" id="bekrft-${e.id}">${a?`Endre plassering`:`Sett plassering`}</button>
        </div>`:``;return`
    <div class="cup-card">
      <div class="cup-card__header">
        <span class="cup-card__lane">Bane ${e.bane_nummer}</span>
        ${c}
        ${o&&!a?S(`cup-card__live`):``}
      </div>
      <div class="cup-card__rows">${Fe(e,i,s)}</div>
      ${l}
    </div>`}function Le(e,t){return e===t?J:null}function Re(e,t,n,r,i,a,o){I(e);for(let s of t){let t=X(s,a,o),c=t[0]??null,l=t[1]??null,u=F(c,!1),d=F(l,!1),f=t.flatMap(e=>e.members.map(e=>e.id)),p=()=>{he({side1Name:u,side2Name:d,currentS1:Z(c,s),currentS2:Z(l,s),baneLabel:`Bane ${s.bane_nummer??`?`}`,rundeLabel:s.runde_navn??`Runde ${s.runde_nummer}`,playerIds:f,hasRounds:s.spelarar.some(e=>(e.omgangar?.length??0)>0),roundsClearedBySave:!0,logPrefix:`cup`,validate:Le,onSaved:async(e,n)=>{let a=await $(s,t,e,n,i);return a||r(),a}})};if(e.querySelector(`#bekrft-${s.id}`)?.addEventListener(`click`,()=>{De(s,t,r)}),n&&!s.er_tre_spelarar&&!s.er_walkover){let n=s.er_bekreftet?()=>{ge([{name:u,score:Z(c,s)},{name:d,score:Z(l,s)}],([e=0,n=0])=>$(s,t,e,n,i),{baneLabel:`Bane ${s.bane_nummer??`?`}`,rundeLabel:s.runde_navn??`Runde ${s.runde_nummer}`})}:p;e.querySelectorAll(`[data-endre-score="${s.id}"]`).forEach(e=>e.addEventListener(`click`,n))}}}async function $(e,t,n,r,i){let{error:a,stored:o}=await Oe({kamp:e,sides:t,s1:n,s2:r});if(a)return _(u(a),`error`),!1;let{placements:s}=Y(t[0]??null,t[1]??null,n,r);return i(e.id,e=>{e.er_bekreftet=!0;for(let t of e.spelarar){let e=o?.get(t.id);e&&(t.score_poeng=e.score_poeng,t.kamp_poeng=e.kamp_poeng,t.antall_ringer=e.antall_ringer),t.omgangar=[],t.kamp_plassering=s.find(e=>e.kasterid===t.kasterid)?.plassering??t.kamp_plassering}}),!0}export{Q as render};