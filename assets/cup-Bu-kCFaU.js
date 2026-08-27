import{n as e,t}from"./logError-ByTg738k.js";import{An as n,At as r,Dn as i,Et as a,Ht as o,In as s,Ln as c,Nt as l,Wn as u,Xt as d,Zn as f,at as p,dr as m,f as h,g,h as _,hn as v,jn as y,u as b,ur as x,xt as S,zn as C}from"./index-BvGIsWRi.js";import{b as w,h as T,m as E,n as D,r as O,t as k,v as A,y as j}from"./kampService-DuNwNlvp.js";import{t as M}from"./realtime-07s7ItoM.js";import{t as N}from"./groupBy-Bg_SEHjk.js";import{t as P}from"./ScoreboardButton-cO_q_Bk1.js";import{a as ee,l as te,n as ne,r as re}from"./stevne-BYYzunPx.js";import{a as F,i as I,n as L,o as ie,r as R,s as z,t as B}from"./kampScoreEditor-BTUcr5NR.js";import{C as ae,D as oe,E as se,O as ce,S as le,T as ue,_ as de,b as fe,g as pe,k as V,v as me,x as he,y as ge}from"./padInput-2eg82s-9.js";function H(e,{showPlayerList:t=!0,initNa:n=null,initFormat:r=null}={}){let i=typeof e==`number`?e:e.length,a=typeof e==`number`?[]:e.map((e,t)=>({...e,cupPlassering:t+1})),o=F(i),s=n===i?i:n!=null&&o.some(e=>e.nA===n)?n:o[0]?.nA??i,c=i-s,l=o.filter(e=>z(e.nA).some(e=>e.c3>0)),u=o.filter(e=>!z(e.nA).some(e=>e.c3>0)),d=z(i).length>0,f=(e,t)=>e.map((e,r)=>{let a=e.nA===s&&n!==i,o=t+r;return`
      <div class="form-check">
        <input class="form-check-input" type="radio" name="group-split" id="split-${o}" value="${e.nA}" ${a?`checked`:``}>
        <label class="form-check-label" for="split-${o}">A:${e.nA} — B:${e.nB}</label>
      </div>`}).join(``),p=[];l.length&&p.push(`<div class="text-muted small fw-semibold mb-1">3 spillere per bane (A)</div>${f(l,0)}`),u.length&&(p.length&&p.push(`<hr class="my-2">`),p.push(`<div class="text-muted small fw-semibold mb-1">2 spillere per bane (A)</div>${f(u,l.length)}`)),d&&(p.length&&p.push(`<hr class="my-2">`),p.push(`
      <div class="form-check">
        <input class="form-check-input" type="radio" name="group-split" id="split-none" value="${i}" ${n===i?`checked`:``}>
        <label class="form-check-label" for="split-ingen">Alle i A</label>
      </div>`));let m=p.join(``),h=r?.A??z(s)[0]??null,g=c>=2?r?.B??z(c)[0]??null:null,_=t?`<div id="group-preview">${U(a,s,h?.walkovers??0,g?.walkovers??0)}</div>`:``;return`
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
            ${G(`Gruppe A`,s,`round1-format-a`,h)}
          </div>
          ${c>=2?`<div id="group-panel-b" class="final-group-col">
            ${G(`Gruppe B`,c,`round1-format-b`,g)}
          </div>`:``}
        </div>
      </div>
      ${_}
      <div class="confirm-banner">
        <button id="confirm-group-btn" class="btn btn-success btn-lg w-100">Bekreft gruppefordeling</button>
      </div>
    </div>
  `}function _e(e,t,n){let r=parseInt(e.querySelector(`#group-assignment-wrapper`)?.dataset.n??`0`)||t.length,i=t.map((e,t)=>({...e,cupPlassering:t+1})),a=e.querySelector(`#group-panels`);function o(t,n){let r=e.querySelector(`input[name="${t}"]:checked`);if(r?.dataset.oppsett)try{return JSON.parse(r.dataset.oppsett)}catch{}return z(n)[0]??null}function s(){return parseInt(e.querySelector(`input[name="group-split"]:checked`)?.value??String(r))}function c(t,n,r){let a=e.querySelector(`#group-preview`);a&&(a.innerHTML=U(i,t,n?.walkovers??0,r?.walkovers??0))}a?.addEventListener(`change`,t=>{let n=t.target;if(!n.matches(`input[name^="round1-format"]`))return;let i=s(),a=r-i,l=o(`round1-format-a`,i),u=o(`round1-format-b`,a);if(n.name===`round1-format-a`){let t=e.querySelector(`#structure-a`);t&&(t.outerHTML=W(i,l,`a`))}else{let t=e.querySelector(`#structure-b`);t&&(t.outerHTML=W(a,u,`b`))}c(i,l,u)}),e.querySelectorAll(`input[name="group-split"]`).forEach(e=>{e.addEventListener(`change`,()=>{let t=parseInt(e.value),n=r-t,i=z(t)[0]??null,o=n>=2?z(n)[0]??null:null;a&&(a.innerHTML=`<div id="group-panel-a" class="final-group-col">
            ${G(`Gruppe A`,t,`round1-format-a`,i)}
          </div>`+(n>=2?`<div id="group-panel-b" class="final-group-col">
            ${G(`Gruppe B`,n,`round1-format-b`,o)}
          </div>`:``)),c(t,i,o)})}),e.querySelector(`#confirm-group-btn`)?.addEventListener(`click`,()=>{let t=e.querySelector(`input[name="group-split"]:checked`);if(!t)return;let i=parseInt(t.value),a=r-i;n({nA:i,nB:a,setupA:o(`round1-format-a`,i),setupB:a>=2?o(`round1-format-b`,a):null})})}function U(e,t,n=0,r=0){let i=e.slice(0,t),a=e.slice(t),o=e.some(e=>e.poeng_xkast!=null);function s(e,t=0){return e.map((e,n)=>{let r=n<t,i=o?e.antall_ring_xkast??0:e.kamp_poeng??0,a=o?e.poeng_xkast??0:e.score_poeng??0;return`
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
    </div>`}function ve(e){let t=e.c3>0?3:2;return`${e.walkovers} walkover - ${t} deltakere per bane`}function ye(e,t,n,r=null){let i=z(t);return i.length<=1?``:`<div class="d-flex flex-column align-items-start gap-1 mb-2">${i.map((e,t)=>{let i=`${n}-${t}`,a=JSON.stringify(e),o=r?e.walkovers===r.walkovers&&e.c3===r.c3&&e.c2===r.c2:t===0,s=e.c3>0?`btn-outline-success`:`btn-outline-warning`;return`
      <input type="radio" class="btn-check" name="${n}" id="${i}"
        value='${a}' data-oppsett='${a}' autocomplete="off" ${o?`checked`:``}>
      <label class="btn btn-sm ${s}" for="${i}">${ve(e)}</label>`}).join(``)}</div>`}function W(e,t,n){return`<div id="structure-${n}">
    <table class="table table-sm table-bordered mb-0">
      <thead><tr>
        <th>Runde</th><th>Deltakere</th><th>Baner</th><th>Per bane</th>
      </tr></thead>
      <tbody>${(e>=2?I(e,{runde1:t}):[]).map((e,n)=>{let r=e.walkovers??0,i=e.players-r,a=r>0?`${i} <span class="text-muted">(${r} w.o.)</span>`:`${i}`,o;return o=n===0&&t?t.c3>0&&t.c2>0?`2/3`:t.c3>0?`3`:`2`:e.players%e.lanes===0?String(e.players/e.lanes):`2/3`,`<tr${e.threePlayers?` class="fw-bold"`:``}>
      <td>${e.runde}</td>
      <td>${a}</td>
      <td>${e.lanes}</td>
      <td>${o}</td>
    </tr>`}).join(``)}</tbody>
    </table>
  </div>`}function G(e,t,n,r){let i=n.slice(-1),a=ye(e,t,n,r);return`
    <div class="card">
      <div class="card-body">
        <h6 class="fw-bold mb-2">${a?`${e}: Velg format`:`${e} (${t})`}</h6>
        ${a}
        ${W(t,r,i)}
      </div>
    </div>`}function K(){return crypto.randomUUID()}async function q(t){let{data:n,error:r}=await e.from(`resultat`).select(`kasterid, startnummer, posisjon`).eq(`stevneid`,t);if(r)throw Error(`Feil ved henting av resultat: `+r.message);let i={},a={};for(let e of n??[])e.kasterid!=null&&e.startnummer!=null&&(i[e.kasterid]=e.startnummer,(a[e.startnummer]??=[]).push({kasterid:e.kasterid,posisjon:e.posisjon}));let o={};for(let[e,t]of Object.entries(a))t.sort((e,t)=>(e.posisjon??1/0)-(t.posisjon??1/0)||e.kasterid-t.kasterid),o[Number(e)]=t.map(e=>e.kasterid);return{kasteridToSnr:i,snrToMembers:o}}function be(e,t){let n=e.kasteridToSnr[t];return(n==null?void 0:e.snrToMembers[n])??[t]}function J(e,t,n,r,i,a=0,o=null,s=K){let c=a;return t.map(t=>({match:{match_id:s(),stevneid:e,fase:`avsluttende`,runde_nummer:n,gruppe_navn:r??null,bane_nummer:t.isWalkover?null:++c,er_bekreftet:t.isWalkover,er_walkover:t.isWalkover,er_tre_spelarar:t.isThreePlayers,runde_navn:o},playerKasterids:t.players.flatMap(e=>be(i,Number(e)))}))}async function Y(t){if(t.length===0)return 0;let n=t.map(e=>({match_id:e.match.match_id,stevneid:e.match.stevneid,fase:e.match.fase,runde_nummer:e.match.runde_nummer,gruppe_navn:e.match.gruppe_navn??null,bane_nummer:e.match.bane_nummer??null,er_bekreftet:e.match.er_bekreftet??!1,er_walkover:e.match.er_walkover??!1,er_tre_spelarar:e.match.er_tre_spelarar??!1,runde_navn:e.match.runde_navn??null,players:e.playerKasterids.map(e=>({kasterid:e}))})),{data:r,error:i}=await e.rpc(`insert_avsluttende_matches`,{p_matches:n});if(i)throw Error(`Feil ved innsetting av cup-kampar: `+i.message);return r??0}async function xe(e,t,n,r,i,a=0,o=null){return Y(J(e,t,n,r,i,a,o))}function Se(e,t,n){if(!e||!t)return 0;let r=n.indexOf(t),i=0;for(let t of n.slice(0,r)){let n=e[t];n&&(i+=(n.c3??0)+(n.c2??0))}return i}async function Ce(e,t,n,r=null){let i=[`A`,`B`,`C`],a=await q(e),o=await X(e,1),s=[];for(let c of t){let t=R(c.spelarar,{medSeeding:n,isRunde1:!0,runde1Oppsett:c.runde1Oppsett??null}),l=Math.max(o,Se(r,c.groupName,i)),u=c.spelarar.length===4,d=J(e,t,1,c.groupName,a,l,u?`Semifinale`:null);s.push(...d);for(let{match:e}of d)e.bane_nummer!=null&&e.bane_nummer>o&&(o=e.bane_nummer)}return Y(s)}async function X(t,n){let{data:r}=await e.from(`kamp`).select(`bane_nummer`).eq(`stevneid`,t).eq(`fase`,`avsluttende`).eq(`runde_nummer`,n).not(`bane_nummer`,`is`,null).order(`bane_nummer`,{ascending:!1}).limit(1);return r?.[0]?.bane_nummer??0}async function we(t,n,r,i){let{data:a}=await e.from(`kamp`).select(`runde_nummer`).eq(`stevneid`,t).eq(`fase`,`avsluttende`).eq(`gruppe_navn`,n).order(`runde_nummer`,{ascending:!1}).limit(1),o=(a?.[0]?.runde_nummer??0)+1,s=i.length===4,c=R(i,{medSeeding:r,isRunde1:!1}),l=await X(t,o);return{roundNumber:o,matchCount:await xe(t,c,o,n,await q(t),l,s?`Semifinale`:null)}}async function Te(t,n){let{data:r}=await e.from(`kamp`).select(`id, runde_nummer, spelarar:kamp_spelar(id, kasterid, score_poeng, omgangar:kamp_omgang(score))`).eq(`stevneid`,t).eq(`fase`,`avsluttende`).eq(`gruppe_navn`,n).eq(`runde_navn`,`Semifinale`).eq(`er_bekreftet`,!0);if(!r?.length)throw Error(`Semifinalane er ikkje bekrefta.`);let i=await q(t),a=r,o=a[0].runde_nummer+1,s=[],c=[];for(let e of a){let t=new Map;for(let n of e.spelarar??[]){if(n.kasterid==null)continue;let e=i.kasteridToSnr[n.kasterid]??`kaster-${n.kasterid}`,r=t.get(e)??{kasterids:[],score:0};r.kasterids.push(n.kasterid),r.score+=n.omgangar?.length?n.omgangar.reduce((e,t)=>e+(t.score??0),0):n.score_poeng??0,t.set(e,r)}let n=[...t.values()].sort((e,t)=>t.score-e.score);n[0]&&s.push(n[0].kasterids),n[1]&&c.push(n[1].kasterids)}let l=await X(t,o);await Y([{match:{match_id:K(),stevneid:t,fase:`avsluttende`,runde_nummer:o,gruppe_navn:n,bane_nummer:l+1,runde_navn:`Finale`,er_bekreftet:!1,er_walkover:!1,er_tre_spelarar:!1},playerKasterids:s.flat()},{match:{match_id:K(),stevneid:t,fase:`avsluttende`,runde_nummer:o,gruppe_navn:n,bane_nummer:l+2,runde_navn:`Bronsefinale`,er_bekreftet:!1,er_walkover:!1,er_tre_spelarar:!1},playerKasterids:c.flat()}])}function Ee(e,n,r,i,a,o){let s=r.filter(e=>e.runde_eliminert==null),c=r.length,l=s.length,u=r.some(e=>e.poeng_xkast!=null),d=e=>u?`${e.poeng_xkast??0}p (${e.antall_ring_xkast??0})`:`${e.kamp_poeng??0}p (${e.score_poeng??0})`,f=i===1?a?.[n]??null:null,p=f?.walkovers??0,m=(f?f.c3:l%3==0?l/3:0)+(f?f.c2:l%3==0?0:l/2),g=s.slice(p,p+m),v=s.slice(p+m,p+2*m),y=s.slice(p+2*m),b=document.createElement(`div`);b.className=`final-dialog-overlay`,document.body.appendChild(b);let x=null,S=!1,C=0,w=0;function T(e){if(!S)return;let t=b.querySelector(`.final-dialog-card-wide`);if(!t)return;let n=e.clientX-C,r=e.clientY-w;x={left:n,top:r},t.style.left=`${n}px`,t.style.top=`${r}px`}function E(){S&&(S=!1,document.body.style.userSelect=``)}document.addEventListener(`mousemove`,T),document.addEventListener(`mouseup`,E);function D(){document.removeEventListener(`mousemove`,T),document.removeEventListener(`mouseup`,E)}function O(e){return`<div class="d-flex justify-content-between gap-2 py-1">
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
      </div>`;let j=b.querySelector(`.final-dialog-card-wide`);x&&(j.style.position=`fixed`,j.style.left=`${x.left}px`,j.style.top=`${x.top}px`,j.style.margin=`0`,j.style.zIndex=`10000`),j.querySelector(`.final-dialog-drag-handle`).addEventListener(`mousedown`,e=>{let t=j.getBoundingClientRect();j.style.position=`fixed`,j.style.left=`${t.left}px`,j.style.top=`${t.top}px`,j.style.margin=`0`,j.style.zIndex=`10000`,C=e.clientX-t.left,w=e.clientY-t.top,x={left:t.left,top:t.top},S=!0,document.body.style.userSelect=`none`}),b.querySelector(`#seeding-ja`).addEventListener(`change`,()=>k(!0)),b.querySelector(`#seeding-nei`).addEventListener(`change`,()=>k(!1)),b.querySelector(`#avbryt-gen-btn`).addEventListener(`click`,()=>{D(),b.remove()}),b.querySelector(`#bekreft-gen-btn`).addEventListener(`click`,async()=>{if(r===null)return;let c=b.querySelector(`#bekreft-gen-btn`);c.disabled=!0,c.textContent=`Lagrer…`;try{let t=s.map((e,t)=>({kasterid:e.kasterid,plassering:t+1}));if(i===1){let i={A:a?.A??void 0,B:a?.B??void 0};await Ce(e,[{groupName:n,spelarar:t,runde1Oppsett:f}],r,a?i:null)}else await we(e,n,r,t);D(),b.remove(),await o()}catch(e){t(`cup:genererRunde`,e),_(`Feil ved generering av runde`,`error`),c.disabled=!1,c.textContent=`Bekreft og opprett kampar`}})}k(null)}function De(e,t,n,r){let i=t.map(e=>V(e,!1)),a=[],o=document.createElement(`div`);o.className=`final-dialog-overlay`,document.body.appendChild(o);function s(){let c=a.length===2?t.find(e=>!a.includes(e.rep.kasterid)):null;o.innerHTML=`
      <div class="card p-4 final-dialog-card">
        <h5 class="card-title mb-1">Bekreft 3-spelar kamp</h5>
        <p class="text-muted small mb-3">Vel dei to som går vidare. Den gjenverande er utslått.</p>
        <div class="d-flex flex-column gap-2 mb-3">
          ${t.map((e,t)=>{let n=a.indexOf(e.rep.kasterid),r=n!==-1,o=!!c&&c.rep.kasterid===e.rep.kasterid,s=n===0?`1. plass`:n===1?`2. plass`:``;return`<button
              class="btn ${r?`btn-success`:o?`btn-outline-danger`:`btn-outline-secondary`} text-start d-flex justify-content-between align-items-center"
              data-kasterid="${e.rep.kasterid}"
              ${o?`disabled`:``}
            ><span>${i[t]}</span>${s?`<span class="badge bg-success-subtle text-success-emphasis">${s}</span>`:o?`<span class="badge bg-danger">Utslått</span>`:``}</button>`}).join(``)}
        </div>
        <div class="d-flex gap-2">
          <button id="bekreft-tre-btn" class="btn btn-success" ${a.length===2?``:`disabled`}>Bekreft</button>
          <button id="avbryt-tre-btn" class="btn btn-secondary">Avbryt</button>
        </div>
      </div>
    `,o.querySelector(`#avbryt-tre-btn`).addEventListener(`click`,()=>o.remove()),o.querySelectorAll(`[data-kasterid]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=Number(e.dataset.kasterid),n=a.indexOf(t);n===-1?a.length<2&&a.push(t):a.splice(n,1),s()})}),o.querySelector(`#bekreft-tre-btn`)?.addEventListener(`click`,async()=>{if(a.length!==2)return;let i=t.find(e=>!a.includes(e.rep.kasterid))??null,s=a.map(e=>t.find(t=>t.rep.kasterid===e)).filter(e=>e!=null).map(e=>e.members.map(e=>e.kasterid)),c=t.flatMap(e=>e.members.map(e=>e.kasterid));o.remove();let{error:l}=await k({kampId:e.id,sides:t.map(e=>A(e)),outcome:{type:`cup-ranked`,stevneId:n,roundNumber:e.runde_nummer,roundName:e.runde_navn,allThrowerIds:c,eliminatedIds:i?.members.map(e=>e.kasterid)??[],advancingSides:s}});if(l){_(`DB-feil ved bekreft`,`error`);return}await r()})}s()}var Z=`Ein cupkamp kan ikkje ende uavgjort.`;function Q(e,t,n,r){let i=n>=r?e:t,a=n>=r?t:e,o=i?.members.map(e=>e.kasterid)??[],s=a?.members.map(e=>e.kasterid)??[];return{winnerIds:o,loserIds:s,placements:[...o.map(e=>({kasterid:e,plassering:1})),...s.map(e=>({kasterid:e,plassering:2}))]}}async function Oe(e,n,r,i){let a=[];e?.rep.id&&a.push(j(e.rep.id,r)),n?.rep.id&&a.push(j(n.rep.id,i));for(let t of[e,n])for(let e of t?.members.slice(1)??[])a.push(j(e.id,0));try{return{error:(await Promise.all(a)).find(e=>e.error)?.error??null}}catch(e){return t(`cupKampService.writeCupSideScores`,e),{error:e}}}async function ke(e){let{stevneId:t,kamp:n,sides:r,s1:i,s2:a}=e;if(i===a)return{error:Error(Z)};let o=r[0]??null,s=r[1]??null,{winnerIds:c,loserIds:l}=Q(o,s,i,a);return k({kampId:n.id,sides:[A(o,{baseScore:i}),A(s,{baseScore:a})],outcome:{type:`cup-ranked`,stevneId:t,roundNumber:n.runde_nummer,roundName:n.runde_navn,allThrowerIds:r.flatMap(e=>e.members.map(e=>e.kasterid)),eliminatedIds:l,advancingSides:c.length?[c]:[]}})}async function Ae(e){let{stevneId:t,kamp:n,sides:r,s1:i,s2:a}=e;if(i===a)return{error:Error(Z),step:`uavgjort`};let o=r[0]??null,s=r[1]??null,c=r.flatMap(e=>e.members.map(e=>e.id));if(c.length){let{error:e}=await D(c);if(e)return{error:e,step:`omgangar`}}let{error:l}=await Oe(o,s,i,a);if(l)return{error:l,step:`score`};let{winnerIds:u,loserIds:d,placements:f}=Q(o,s,i,a),{error:p}=await E(n.id,f);if(p)return{error:p,step:`plassering`};let{error:m}=await w({stevneId:t,roundNumber:n.runde_nummer,roundName:n.runde_navn,allThrowerIds:r.flatMap(e=>e.members.map(e=>e.kasterid)),newWinnerIds:u,newLoserIds:d});return m?{error:m,step:`bracket`}:{error:null,step:null}}function je(e){return e.map(e=>({er_bekreftet:e.er_bekreftet,er_walkover:e.er_walkover,runde_nummer:e.runde_nummer,bane_nummer:e.bane_nummer,spelarar:Me(e.spelarar)}))}function Me(e){return e.map(e=>({kasterid:e.kasterid??0,kamp_poeng:e.kamp_poeng??0,score_poeng:e.score_poeng??0,antall_ringer:e.antall_ringer,omgangar:e.omgangar,kaster:e.kaster}))}function Ne(e){let r=null,i=null,a=!1,o=new Set,s=new Set;async function l(e,{id:t,isAdmin:n=!1},o=null){i=o,a=n,r&&=(await M(r),null),e.replaceChildren(m(`Laster…`)),await u(e,t)}async function u(r,l){try{let[{data:t},{data:f},{data:m},{data:h},{count:g}]=await Promise.all([p(l),O(l),y(l),n([`A`,`B`]),S(l)]);if(!t){r.replaceChildren(x(`Stevne ikkje funne.`));return}s.clear();for(let e of f)for(let t of e.spelarar)s.add(t.id);let _=m.filter(e=>e.kasterid!=null),b=f.filter(e=>e.fase===`innledende`),w=f.filter(e=>e.fase===`avsluttende`),{startNumberMap:T,positionMap:E,isTeam:D}=te(_),k={};for(let e of f)for(let t of e.spelarar)t.kasterid&&t.kaster&&!k[t.kasterid]&&(k[t.kasterid]=`${t.kaster.fornavn} ${t.kaster.etternavn}`);for(let e of _)e.kaster&&!k[e.kasterid]&&(k[e.kasterid]=`${e.kaster.fornavn} ${e.kaster.etternavn}`);let A=je(b),j=c(A,_,k,T,E),M=b.length>0&&b.every(e=>e.er_bekreftet),N=w.length>0,P=(b.length>0||N)&&b.every(e=>e.er_bekreftet)&&w.every(e=>e.er_bekreftet),F=_.some(e=>e.gruppe!=null),I=Object.fromEntries(h.map(e=>[e.navn,e.id])),L=ie(t.runde1_format),R=g??0;if(t.kategori?.erlagbasert){let{data:e}=await v(l);R=e.length}let z={container:r,stevneid:l,stevne:t,standings:j,startNumberMap:T,positionMap:E,isTeam:D,nameMap:k,initialMatches:b,finalMatches:w,results:_,isAdmin:a,hasGroupAssignment:F,allInitialConfirmed:M,hasFinalMatches:N,round1Format:L,unitCount:R,groupNameMap:I,reload:()=>u(r,l)};ce(i,e.bannerMeta(z)),a&&i&&(i.innerHTML=re(le(t,{allMatchesConfirmed:P,hasFinalMatches:N,hasGroupAssignment:F,hasPreconfiguredFormat:L!=null&&t.stevne_fase!==`avsluttende`})),ne(i));let B=ae(r);if(F){let t=se(j,A,T,{tableId:`standing-final`,hasGroups:!0,hasElimination:!0,positionMap:E,unitLabel:D?`par`:`spelarar`});r.innerHTML=ue(e.renderMatchesHtml(z),t),ge(r,`standing-final`,o),fe(r),B===`standing`&&oe(r,`standing`),e.bindMatchEvents(r,z),d(r,l)}else r.innerHTML=e.renderSetupHtml(z);i&&(pe(i,{title:`Autofullfør kampar`,message:`Autofullfør alle ubekrefta avsluttande kampar?`},async()=>{await ee(l),await u(r,l)}),de(i,l,()=>C(j),()=>u(r,l))),e.bindHeaderEvents(i,z)}catch(e){t(`avsluttendeBase.loadAndRender`,e),r.replaceChildren(x(`Kunne ikkje laste avsluttande fase.`))}}function d(t,n){if(r)return;let i=he(n,[`avsluttende`],t,u,()=>{r&&=(M(r),null)});r=T(n,e.channelName(n),i,e=>s.has(e))}return l}function Pe(e,t,n){let r=e.spelarar.filter(e=>e.kasterid!=null);return u(r,t,n)}function $(e,t){return f(e,t.er_bekreftet)}var Fe=Ne({channelName:e=>`stevne-avsl-cup-${e}`,renderMatchesHtml:e=>{let{finalMatches:t,standings:n,startNumberMap:r,positionMap:i,isTeam:a,isAdmin:o}=e;return`<div class="d-flex gap-3 flex-wrap">${[...new Set(n.map(e=>e.gruppe?.navn).filter(e=>e!=null))].sort().map(e=>{let s=t.filter(t=>t.gruppe_navn===e),c=n.filter(t=>t.gruppe?.navn===e),l=c.filter(e=>e.runde_eliminert==null).length,u=c.length,d=s.length?Math.max(...s.map(e=>e.runde_nummer)):0,f=s.filter(e=>e.runde_nummer===d),p=f.length>0&&f.every(e=>e.er_bekreftet||e.er_walkover),m=s.some(e=>e.runde_navn===`Semifinale`),h=o&&(s.length===0||p)&&l>1&&!m,g=f.length>0&&f.every(e=>e.runde_navn===`Semifinale`),_=s.some(e=>e.runde_navn===`Finale`);return Le(e,s,l,u,d,h,o&&g&&p&&!_,r,i,a?`par`:`spelarar`,o)}).join(``)}</div>`},bindMatchEvents:(e,t)=>{!t.isAdmin&&t.finalMatches.length===0||Ue(e,t.stevneid,t.finalMatches,t.isAdmin,t.reload,t.startNumberMap,t.positionMap)},renderSetupHtml:e=>{let{stevne:t,isAdmin:n,round1Format:r,unitCount:i,standings:a}=e,o=r?.nA??null;if(t.stevne_fase===`avsluttende`)return n?H(a,{showPlayerList:!0,initNa:o,initFormat:r}):`<p class="text-muted fst-italic">Gruppefordeling er ikkje klar enno.</p>`;if(!n)return``;if(i<2)return`<p class="text-muted fst-italic">${t.kategori?.erlagbasert?`Minst 2 par må vere oppretta før gruppefordelinga kan setjast.`:`Minst 2 spelarar må vere påmelde før gruppefordelinga kan setjast.`}</p>`;let s=a.length>0;return H(s?a:i,{showPlayerList:s,initNa:o,initFormat:r})},bannerMeta:({standings:e,round1Format:t})=>{let n=e.filter(e=>e.gruppe?.navn===`A`).length,r=e.filter(e=>e.gruppe?.navn===`B`).length;return n||r?`Cup - A:${n} - B:${r}`:t?.nA==null?`Cup`:`Cup - A:${t.nA} - B:${e.length-t.nA}`},bindHeaderEvents:(e,n)=>{let{container:c,stevneid:u,stevne:f,standings:p,results:m,round1Format:h,allInitialConfirmed:v,hasGroupAssignment:y,groupNameMap:b,reload:x}=n;e?.querySelector(`#start-final-btn`)?.addEventListener(`click`,async()=>{if(!v)return;let{error:e}=await r(u,`avsluttende`);if(e){_(`Feil ved oppstart av avsluttande fase`,`error`);return}if(h?.nA!=null){let e=h.nA,t=b.A??null,n=b.B??null,r=Ie(p,m,e,t,n),{error:i}=await s(u,r);if(i){_(`Feil ved lagring av gruppefordeling: `+l(i),`error`);return}}await x()}),y||_e(c,p,async({nA:e,setupA:t,setupB:n})=>{let{error:i}=await a(u,{A:t,B:n,nA:e});if(i){_(`Feil ved lagring av format: `+l(i),`error`);return}let c=f.stevne_fase;if(c!==`avsluttende`&&d(f.kastemetodeInnl?.navn??``)){let{data:e}=await o(u);if(!e){_(`Fullfør den innleiande fasen før cupen kan startast`,`error`);return}let{error:t}=await r(u,`avsluttende`);if(t){_(`Feil ved oppstart av avsluttande fase: `+l(t),`error`);return}c=`avsluttende`}if(c===`avsluttende`){let t=b.A??null,n=b.B??null,r=Ie(p,m,e,t,n),{error:i}=await s(u,r);if(i){_(`Feil ved lagring av gruppefordeling: `+l(i),`error`);return}}_(`Gruppefordeling lagra`,`success`),await x()}),e?.querySelector(`#edit-group-assignment-btn`)?.addEventListener(`click`,async()=>{await g({title:`Tilbakestill gruppeinndeling`,message:`Gruppefordeling og format vert fjerna.`,danger:!0})&&(await Promise.all([i(u),a(u,null)]),await x())}),y&&(c.querySelectorAll(`[data-generate-group]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.generateGroup??``,n=parseInt(e.dataset.runde??`1`),r=p.filter(e=>e.gruppe?.navn===t);Ee(u,t,r,n,h,x)})}),c.querySelectorAll(`[data-generate-finale-group]`).forEach(e=>{e.addEventListener(`click`,async()=>{let n=e.dataset.generateFinaleGroup??``;e.disabled=!0,e.textContent=`Genererer…`;try{await Te(u,n),await x()}catch(n){t(`cup:genererFinale`,n),_(`Feil ved generering av finale`,`error`),e.disabled=!1,e.textContent=`Generer finale`}})}))}});function Ie(e,t,n,r,i){return e.flatMap((e,a)=>{let o=a<n?r:i??r,s=e.startnummer==null?[]:t.filter(t=>t.startnummer===e.startnummer).map(e=>e.kasterid);return(s.length?s:[e.kasterid]).map(e=>({kasterid:e,gruppeid:o}))})}function Le(e,t,n,r,i,a,o,s,c,l,u=!0){let d=[...N(t,e=>e.runde_nummer)].reverse().map(([e,t])=>{let n=t[0]?.runde_navn??`Runde ${e}`,r=t.filter(e=>!e.er_walkover);return r.length?`
      <h6 class="fw-bold text-center mb-1">${h(n)}</h6>
      <div class="d-flex flex-wrap gap-2 mb-2">
        ${r.map(e=>Be(e,s,c,u)).join(``)}
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
    </div>`}function Re(e,t,n,r){let i=$(t,e),a=i>0||r.isConfirmed&&!r.isThreeSides||r.hasRounds?i:`—`,o=t.rep.kamp_plassering,s=e.er_bekreftet&&o!=null&&o>=n,c=e.er_bekreftet&&o!=null&&o<n,l=s?` cup-row--tapar`:c?` cup-row--vinnar`:``,u=`cup-row__score${r.canEditScore?` score-editable`:``}`,d=r.canEditScore?` data-endre-score="${e.id}"`:``;return`<div class="cup-row${l}">
      <span class="cup-row__name">${V(t,!1)}</span>
      <span class="${u}"${d}>${a}</span>
    </div>`}function ze(e,t,n){return e.er_walkover?`<div class="cup-row">
        <span class="cup-row__name">${V(t[0]??null,!1)} <span class="badge bg-secondary">Walkover</span></span>
        <span class="cup-row__score">—</span>
      </div>`:t.map(r=>Re(e,r,t.length,n)).join(``)}function Be(e,t,n,r=!0){let i=Pe(e,t,n),a=e.er_bekreftet||e.er_walkover,o=e.spelarar.some(e=>(e.omgangar?.length??0)>0),s={isConfirmed:a,hasRounds:o,canEditScore:r&&!e.er_tre_spelarar&&!e.er_walkover&&(!e.er_bekreftet||!o),isThreeSides:e.er_tre_spelarar},c=r&&!(a&&!o)?P(e.id):``,l=r&&e.er_tre_spelarar?`<div class="cup-card__footer">
          <button class="btn ${a?`btn-secondary`:`btn-outline-secondary`} btn-sm" id="bekrft-${e.id}">${a?`Endre plassering`:`Sett plassering`}</button>
        </div>`:``;return`
    <div class="cup-card">
      <div class="cup-card__header">
        <span class="cup-card__lane">Bane ${e.bane_nummer}</span>
        ${c}
        ${o&&!a?b(`cup-card__live`):``}
      </div>
      <div class="cup-card__rows">${ze(e,i,s)}</div>
      ${l}
    </div>`}function Ve(e,t){return e===t?Z:null}var He={uavgjort:Z,omgangar:`DB-feil ved sletting av omgangar`,score:`DB-feil ved oppdatering av score`,plassering:`DB-feil ved oppdatering av plassering`,bracket:`DB-feil ved oppdatering av cupstigen`};function Ue(e,n,r,i,a,o,s){me(e);for(let c of r){let r=Pe(c,o,s),l=r[0]??null,u=r[1]??null,d=V(l,!1),f=V(u,!1),p=r.flatMap(e=>e.members.map(e=>e.id)),m=()=>{B({side1Name:d,side2Name:f,currentS1:$(l,c),currentS2:$(u,c),baneLabel:`Bane ${c.bane_nummer??`?`}`,rundeLabel:c.runde_navn??`Runde ${c.runde_nummer}`,playerIds:p,hasRounds:c.spelarar.some(e=>(e.omgangar?.length??0)>0),logPrefix:`cup`,validate:Ve,onSaved:async(e,t)=>{await We(n,c,r,e,t,a)||await a()}})};if(e.querySelector(`#bekrft-${c.id}`)?.addEventListener(`click`,()=>{De(c,r,n,a)}),i&&!c.er_tre_spelarar&&!c.er_walkover){let i=c.er_bekreftet?()=>{L([{name:d,score:$(l,c)},{name:f,score:$(u,c)}],async([e=0,i=0])=>{let{error:o,step:s}=await Ae({stevneId:n,kamp:c,sides:r,s1:e,s2:i});return o?(t(`cup:rescore:${s}`,o),_(He[s??`score`],`error`),!1):(await a(),!0)},{baneLabel:`Bane ${c.bane_nummer??`?`}`,rundeLabel:c.runde_navn??`Runde ${c.runde_nummer}`})}:m;e.querySelectorAll(`[data-endre-score="${c.id}"]`).forEach(e=>e.addEventListener(`click`,i))}}}async function We(e,t,n,r,i,a){let{error:o}=await ke({stevneId:e,kamp:t,sides:n,s1:r,s2:i});return o?(_(l(o),`error`),!1):(await a(),!0)}export{Fe as render};