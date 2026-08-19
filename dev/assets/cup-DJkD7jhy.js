import{n as e,t}from"./logError-CTQ3euge.js";import{t as n}from"./escHtml-CfOHO0aD.js";import{An as r,En as i,Fn as a,In as o,Mt as s,Rn as c,Tt as l,Un as u,Vt as d,Xn as f,Yt as p,bt as m,h,it as g,kn as _,kt as v,m as y,mn as b,mr as x,pr as S,u as C}from"./index-BdA56Qal.js";import{b as w,h as T,m as E,n as D,r as O,t as k,v as A,y as j}from"./kampService-C8W7Xx0b.js";import{t as M}from"./realtime-CtSjZAnf.js";import{t as N}from"./groupBy-Bg_SEHjk.js";import{t as P}from"./ScoreboardButton-cO_q_Bk1.js";import{a as ee,l as te,n as ne,r as re}from"./stevne-DgHi0w1x.js";import{a as F,i as I,n as L,o as ie,r as R,s as z,t as B}from"./ScoreEditor-CuZpLWFg.js";import{C as ae,D as oe,E as se,O as ce,S as le,T as ue,_ as de,b as fe,g as pe,k as V,v as me,x as he,y as ge}from"./padInput-DoRjgE_5.js";function H(e,{showPlayerList:t=!0,initNa:n=null,initFormat:r=null}={}){let i=typeof e==`number`?e:e.length,a=typeof e==`number`?[]:e.map((e,t)=>({...e,cupPlassering:t+1})),o=F(i),s=n===i?i:n!=null&&o.some(e=>e.nA===n)?n:o[0]?.nA??i,c=i-s,l=o.filter(e=>z(e.nA).some(e=>e.c3>0)),u=o.filter(e=>!z(e.nA).some(e=>e.c3>0)),d=z(i).length>0,f=(e,t)=>e.map((e,r)=>{let a=e.nA===s&&n!==i,o=t+r;return`
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
          </div>`:``)),c(t,i,o)})}),e.querySelector(`#confirm-group-btn`)?.addEventListener(`click`,()=>{let t=e.querySelector(`input[name="group-split"]:checked`);if(!t)return;let i=parseInt(t.value),a=r-i;n({nA:i,nB:a,setupA:o(`round1-format-a`,i),setupB:a>=2?o(`round1-format-b`,a):null})})}function U(e,t,r=0,i=0){let a=e.slice(0,t),o=e.slice(t),s=e.some(e=>e.poeng_xkast!=null);function c(e,t=0){return e.map((e,r)=>{let i=r<t,a=s?e.antall_ring_xkast??0:e.kamp_poeng??0,o=s?e.poeng_xkast??0:e.score_poeng??0;return`
      <tr>
        <td>${e.cupPlassering}</td>
        <td>${n(e.navn??``)}${i?` <span class="badge bg-info text-dark">Walkover</span>`:``}</td>
        <td class="text-center">${a}</td>
        <td class="text-center">${o}</td>
      </tr>`}).join(``)}let l=`
    <thead class="stevne-thead"><tr>
      <th class="th-32">#</th><th>NAMN</th>
      <th class="th-44 text-center">${s?`R`:`KP`}</th>
      <th class="th-44 text-center">${s?`X`:`SP`}</th>
    </tr></thead>`,u=`
    <table class="table table-bordered table-sm bg-white mb-0">
      ${l}
      <tbody>${c(a,r)}</tbody>
    </table>`,d=o.length?`
    <table class="table table-bordered table-sm bg-white mb-0">
      ${l}
      <tbody>${c(o,i)}</tbody>
    </table>`:``;return`
    <div class="d-flex gap-3 flex-wrap">
      <div class="avsl-gruppe-kol">
        <h6 class="fw-bold text-center">GRUPPE A (${a.length})</h6>
        ${u}
      </div>
      ${o.length?`<div class="avsl-gruppe-kol">
        <h6 class="fw-bold text-center">GRUPPE B (${o.length})</h6>
        ${d}
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
    </div>`}function K(){return crypto.randomUUID()}async function q(t){let{data:n,error:r}=await e.from(`resultat`).select(`kasterid, startnummer, posisjon`).eq(`stevneid`,t);if(r)throw Error(`Feil ved henting av resultat: `+r.message);let i={},a={};for(let e of n??[])e.kasterid!=null&&e.startnummer!=null&&(i[e.kasterid]=e.startnummer,(a[e.startnummer]??=[]).push({kasterid:e.kasterid,posisjon:e.posisjon}));let o={};for(let[e,t]of Object.entries(a))t.sort((e,t)=>(e.posisjon??1/0)-(t.posisjon??1/0)||e.kasterid-t.kasterid),o[Number(e)]=t.map(e=>e.kasterid);return{kasteridToSnr:i,snrToMembers:o}}function be(e,t){let n=e.kasteridToSnr[t];return(n==null?void 0:e.snrToMembers[n])??[t]}function J(e,t,n,r,i,a=0,o=null,s=K){let c=a;return t.map(t=>({match:{match_id:s(),stevneid:e,fase:`avsluttende`,runde_nummer:n,gruppe_navn:r??null,bane_nummer:t.isWalkover?null:++c,er_bekreftet:t.isWalkover,er_walkover:t.isWalkover,er_tre_spelarar:t.isThreePlayers,runde_navn:o},playerKasterids:t.players.flatMap(e=>be(i,Number(e)))}))}async function Y(t){if(t.length===0)return 0;let n=t.map(e=>({match_id:e.match.match_id,stevneid:e.match.stevneid,fase:e.match.fase,runde_nummer:e.match.runde_nummer,gruppe_navn:e.match.gruppe_navn??null,bane_nummer:e.match.bane_nummer??null,er_bekreftet:e.match.er_bekreftet??!1,er_walkover:e.match.er_walkover??!1,er_tre_spelarar:e.match.er_tre_spelarar??!1,runde_navn:e.match.runde_navn??null,players:e.playerKasterids.map(e=>({kasterid:e}))})),{data:r,error:i}=await e.rpc(`insert_avsluttende_matches`,{p_matches:n});if(i)throw Error(`Feil ved innsetting av cup-kampar: `+i.message);return r??0}async function xe(e,t,n,r,i,a=0,o=null){return Y(J(e,t,n,r,i,a,o))}function Se(e,t,n){if(!e||!t)return 0;let r=n.indexOf(t),i=0;for(let t of n.slice(0,r)){let n=e[t];n&&(i+=(n.c3??0)+(n.c2??0))}return i}async function Ce(e,t,n,r=null){let i=[`A`,`B`,`C`],a=await q(e),o=await X(e,1),s=[];for(let c of t){let t=R(c.spelarar,{medSeeding:n,isRunde1:!0,runde1Oppsett:c.runde1Oppsett??null}),l=Math.max(o,Se(r,c.groupName,i)),u=c.spelarar.length===4,d=J(e,t,1,c.groupName,a,l,u?`Semifinale`:null);s.push(...d);for(let{match:e}of d)e.bane_nummer!=null&&e.bane_nummer>o&&(o=e.bane_nummer)}return Y(s)}async function X(t,n){let{data:r}=await e.from(`kamp`).select(`bane_nummer`).eq(`stevneid`,t).eq(`fase`,`avsluttende`).eq(`runde_nummer`,n).not(`bane_nummer`,`is`,null).order(`bane_nummer`,{ascending:!1}).limit(1);return r?.[0]?.bane_nummer??0}async function we(t,n,r,i){let{data:a}=await e.from(`kamp`).select(`runde_nummer`).eq(`stevneid`,t).eq(`fase`,`avsluttende`).eq(`gruppe_navn`,n).order(`runde_nummer`,{ascending:!1}).limit(1),o=(a?.[0]?.runde_nummer??0)+1,s=i.length===4,c=R(i,{medSeeding:r,isRunde1:!1}),l=await X(t,o);return{roundNumber:o,matchCount:await xe(t,c,o,n,await q(t),l,s?`Semifinale`:null)}}async function Te(t,n){let{data:r}=await e.from(`kamp`).select(`id, runde_nummer, spelarar:kamp_spelar(id, kasterid, score_poeng, omgangar:kamp_omgang(score))`).eq(`stevneid`,t).eq(`fase`,`avsluttende`).eq(`gruppe_navn`,n).eq(`runde_navn`,`Semifinale`).eq(`er_bekreftet`,!0);if(!r?.length)throw Error(`Semifinalane er ikkje bekrefta.`);let i=await q(t),a=r,o=a[0].runde_nummer+1,s=[],c=[];for(let e of a){let t=new Map;for(let n of e.spelarar??[]){if(n.kasterid==null)continue;let e=i.kasteridToSnr[n.kasterid]??`kaster-${n.kasterid}`,r=t.get(e)??{kasterids:[],score:0};r.kasterids.push(n.kasterid),r.score+=n.omgangar?.length?n.omgangar.reduce((e,t)=>e+(t.score??0),0):n.score_poeng??0,t.set(e,r)}let n=[...t.values()].sort((e,t)=>t.score-e.score);n[0]&&s.push(n[0].kasterids),n[1]&&c.push(n[1].kasterids)}let l=await X(t,o);await Y([{match:{match_id:K(),stevneid:t,fase:`avsluttende`,runde_nummer:o,gruppe_navn:n,bane_nummer:l+1,runde_navn:`Finale`,er_bekreftet:!1,er_walkover:!1,er_tre_spelarar:!1},playerKasterids:s.flat()},{match:{match_id:K(),stevneid:t,fase:`avsluttende`,runde_nummer:o,gruppe_navn:n,bane_nummer:l+2,runde_navn:`Bronsefinale`,er_bekreftet:!1,er_walkover:!1,er_tre_spelarar:!1},playerKasterids:c.flat()}])}function Ee(e,r,i,a,o,s){let c=i.filter(e=>e.runde_eliminert==null),l=i.length,u=c.length,d=i.some(e=>e.poeng_xkast!=null),f=e=>d?`${e.poeng_xkast??0}p (${e.antall_ring_xkast??0})`:`${e.kamp_poeng??0}p (${e.score_poeng??0})`,p=a===1?o?.[r]??null:null,m=p?.walkovers??0,h=(p?p.c3:u%3==0?u/3:0)+(p?p.c2:u%3==0?0:u/2),g=c.slice(m,m+h),_=c.slice(m+h,m+2*h),v=c.slice(m+2*h),b=document.createElement(`div`);b.className=`final-dialog-overlay`,document.body.appendChild(b);let x=null,S=!1,C=0,w=0;function T(e){if(!S)return;let t=b.querySelector(`.final-dialog-card-wide`);if(!t)return;let n=e.clientX-C,r=e.clientY-w;x={left:n,top:r},t.style.left=`${n}px`,t.style.top=`${r}px`}function E(){S&&(S=!1,document.body.style.userSelect=``)}document.addEventListener(`mousemove`,T),document.addEventListener(`mouseup`,E);function D(){document.removeEventListener(`mousemove`,T),document.removeEventListener(`mouseup`,E)}function O(e){return`<div class="d-flex justify-content-between gap-2 py-1">
      <span class="small">${n(e.navn??``)}</span>
      <span class="small text-muted text-nowrap">${f(e)}</span>
    </div>`}function k(i){let d=c.slice(0,m),T=d.length>0?`<div class="mb-3">
          <strong class="d-block mb-1">Walkovers (går vidare utan kamp):</strong>
          ${d.map(e=>O(e)).join(``)}
        </div>`:``,E=i===!0&&h>0?`<div class="alert alert-info small mb-3 py-2">
          Dette er seedinggrupper, ikkje kampar. Spelarar i same gruppe kan ikkje trekkast mot kvarandre. Kampane blir oppretta når du klikkar «Bekreft og opprett kampar».
        </div>`:``,A=i===!0&&h>0?`<div class="d-flex gap-3 flex-wrap mb-3">
          ${[{label:`Seeding 1`,pool:g},{label:`Seeding 2`,pool:_},...v.length?[{label:`Seeding 3`,pool:v}]:[]].map(({label:e,pool:t})=>`
            <div class="card flex-grow-1">
              <div class="card-body p-2">
                <strong class="d-block mb-2 small text-uppercase">${n(e)}</strong>
                ${t.map(e=>O(e)).join(``)}
              </div>
            </div>`).join(``)}
        </div>`:`<div class="final-player-columns mb-3">
          ${c.slice(m).map((e,t)=>`
            <div class="small d-flex justify-content-between gap-2">
              <span>${m+t+1}. ${n(e.navn??``)}</span>
              <span class="text-muted text-nowrap">${f(e)}</span>
            </div>`).join(``)}
        </div>`;b.innerHTML=`
      <div class="card final-dialog-card-wide">
        <div class="final-dialog-drag-handle">
          <p class="text-muted small text-uppercase fw-semibold mb-1">Trekning</p>
          <h5 class="mb-1">Gruppe ${n(r)} — Runde ${a}</h5>
          <p class="text-muted small mb-0">${u} av ${l} spelarar igjen</p>
        </div>
        <div class="final-dialog-body">
          <div class="mb-3">
            <span class="form-label fw-semibold d-block mb-1">Bruk seeding</span>
            <div class="form-check form-check-inline">
              <input class="form-check-input" type="radio" name="seeding-dlg" id="seeding-ja" value="ja" ${i===!0?`checked`:``}>
              <label class="form-check-label" for="seeding-ja">Ja</label>
            </div>
            <div class="form-check form-check-inline">
              <input class="form-check-input" type="radio" name="seeding-dlg" id="seeding-nei" value="nei" ${i===!1?`checked`:``}>
              <label class="form-check-label" for="seeding-nei">Nei</label>
            </div>
          </div>
          ${E}
          ${T}
          ${A}
        </div>
        <div class="final-dialog-footer">
          <div class="d-flex gap-2">
            <button id="bekreft-gen-btn" class="btn btn-primary" ${i===null?`disabled`:``}>Bekreft og opprett kampar</button>
            <button id="avbryt-gen-btn" class="btn btn-secondary">Avbryt</button>
          </div>
        </div>
      </div>`;let j=b.querySelector(`.final-dialog-card-wide`);x&&(j.style.position=`fixed`,j.style.left=`${x.left}px`,j.style.top=`${x.top}px`,j.style.margin=`0`,j.style.zIndex=`10000`),j.querySelector(`.final-dialog-drag-handle`).addEventListener(`mousedown`,e=>{let t=j.getBoundingClientRect();j.style.position=`fixed`,j.style.left=`${t.left}px`,j.style.top=`${t.top}px`,j.style.margin=`0`,j.style.zIndex=`10000`,C=e.clientX-t.left,w=e.clientY-t.top,x={left:t.left,top:t.top},S=!0,document.body.style.userSelect=`none`}),b.querySelector(`#seeding-ja`).addEventListener(`change`,()=>k(!0)),b.querySelector(`#seeding-nei`).addEventListener(`change`,()=>k(!1)),b.querySelector(`#avbryt-gen-btn`).addEventListener(`click`,()=>{D(),b.remove()}),b.querySelector(`#bekreft-gen-btn`).addEventListener(`click`,async()=>{if(i===null)return;let n=b.querySelector(`#bekreft-gen-btn`);n.disabled=!0,n.textContent=`Lagrer…`;try{let t=c.map((e,t)=>({kasterid:e.kasterid,plassering:t+1}));if(a===1){let n={A:o?.A??void 0,B:o?.B??void 0};await Ce(e,[{groupName:r,spelarar:t,runde1Oppsett:p}],i,o?n:null)}else await we(e,r,i,t);D(),b.remove(),await s()}catch(e){t(`cup:genererRunde`,e),y(`Feil ved generering av runde`,`error`),n.disabled=!1,n.textContent=`Bekreft og opprett kampar`}})}k(null)}function De(e,t,n,r){let i=t.map(e=>V(e,!1)),a=[],o=document.createElement(`div`);o.className=`final-dialog-overlay`,document.body.appendChild(o);function s(){let c=a.length===2?t.find(e=>!a.includes(e.rep.kasterid)):null;o.innerHTML=`
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
    `,o.querySelector(`#avbryt-tre-btn`).addEventListener(`click`,()=>o.remove()),o.querySelectorAll(`[data-kasterid]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=Number(e.dataset.kasterid),n=a.indexOf(t);n===-1?a.length<2&&a.push(t):a.splice(n,1),s()})}),o.querySelector(`#bekreft-tre-btn`)?.addEventListener(`click`,async()=>{if(a.length!==2)return;let i=t.find(e=>!a.includes(e.rep.kasterid))??null,s=a.map(e=>t.find(t=>t.rep.kasterid===e)).filter(e=>e!=null).map(e=>e.members.map(e=>e.kasterid)),c=t.flatMap(e=>e.members.map(e=>e.kasterid));o.remove();let{error:l}=await k({kampId:e.id,sides:t.map(e=>A(e)),outcome:{type:`cup-ranked`,stevneId:n,roundNumber:e.runde_nummer,roundName:e.runde_navn,allThrowerIds:c,eliminatedIds:i?.members.map(e=>e.kasterid)??[],advancingSides:s}});if(l){y(`DB-feil ved bekreft`,`error`);return}await r()})}s()}var Z=`Ein cupkamp kan ikkje ende uavgjort.`;function Q(e,t,n,r){let i=n>=r?e:t,a=n>=r?t:e,o=i?.members.map(e=>e.kasterid)??[],s=a?.members.map(e=>e.kasterid)??[];return{winnerIds:o,loserIds:s,placements:[...o.map(e=>({kasterid:e,plassering:1})),...s.map(e=>({kasterid:e,plassering:2}))]}}async function Oe(e,n,r,i){let a=[];e?.rep.id&&a.push(j(e.rep.id,r)),n?.rep.id&&a.push(j(n.rep.id,i));for(let t of[e,n])for(let e of t?.members.slice(1)??[])a.push(j(e.id,0));try{return{error:(await Promise.all(a)).find(e=>e.error)?.error??null}}catch(e){return t(`cupKampService.writeCupSideScores`,e),{error:e}}}async function ke(e){let{stevneId:t,kamp:n,sides:r,s1:i,s2:a}=e;if(i===a)return{error:Error(Z)};let o=r[0]??null,s=r[1]??null,{winnerIds:c,loserIds:l}=Q(o,s,i,a);return k({kampId:n.id,sides:[A(o,{baseScore:i}),A(s,{baseScore:a})],outcome:{type:`cup-ranked`,stevneId:t,roundNumber:n.runde_nummer,roundName:n.runde_navn,allThrowerIds:r.flatMap(e=>e.members.map(e=>e.kasterid)),eliminatedIds:l,advancingSides:c.length?[c]:[]}})}async function Ae(e){let{stevneId:t,kamp:n,sides:r,s1:i,s2:a}=e;if(i===a)return{error:Error(Z),step:`uavgjort`};let o=r[0]??null,s=r[1]??null,c=r.flatMap(e=>e.members.map(e=>e.id));if(c.length){let{error:e}=await D(c);if(e)return{error:e,step:`omgangar`}}let{error:l}=await Oe(o,s,i,a);if(l)return{error:l,step:`score`};let{winnerIds:u,loserIds:d,placements:f}=Q(o,s,i,a),{error:p}=await E(n.id,f);if(p)return{error:p,step:`plassering`};let{error:m}=await w({stevneId:t,roundNumber:n.runde_nummer,roundName:n.runde_navn,allThrowerIds:r.flatMap(e=>e.members.map(e=>e.kasterid)),newWinnerIds:u,newLoserIds:d});return m?{error:m,step:`bracket`}:{error:null,step:null}}function je(e){return e.map(e=>({er_bekreftet:e.er_bekreftet,er_walkover:e.er_walkover,runde_nummer:e.runde_nummer,bane_nummer:e.bane_nummer,spelarar:Me(e.spelarar)}))}function Me(e){return e.map(e=>({kasterid:e.kasterid??0,kamp_poeng:e.kamp_poeng??0,score_poeng:e.score_poeng??0,antall_ringer:e.antall_ringer,omgangar:e.omgangar,kaster:e.kaster}))}function Ne(e){let n=null,i=null,a=!1,s=new Set,l=new Set;async function u(e,{id:t,isAdmin:r=!1},o=null){i=o,a=r,n&&=(await M(n),null),e.replaceChildren(x(`Laster…`)),await d(e,t)}async function d(n,u){try{let[{data:t},{data:p},{data:h},{data:v},{count:y}]=await Promise.all([g(u),O(u),r(u),_([`A`,`B`]),m(u)]);if(!t){n.replaceChildren(S(`Stevne ikkje funne.`));return}l.clear();for(let e of p)for(let t of e.spelarar)l.add(t.id);let x=h.filter(e=>e.kasterid!=null),C=p.filter(e=>e.fase===`innledende`),w=p.filter(e=>e.fase===`avsluttende`),{startNumberMap:T,positionMap:E,isTeam:D}=te(x),k={};for(let e of p)for(let t of e.spelarar)t.kasterid&&t.kaster&&!k[t.kasterid]&&(k[t.kasterid]=`${t.kaster.fornavn} ${t.kaster.etternavn}`);for(let e of x)e.kaster&&!k[e.kasterid]&&(k[e.kasterid]=`${e.kaster.fornavn} ${e.kaster.etternavn}`);let A=je(C),j=o(A,x,k,T,E),M=C.length>0&&C.every(e=>e.er_bekreftet),N=w.length>0,P=(C.length>0||N)&&C.every(e=>e.er_bekreftet)&&w.every(e=>e.er_bekreftet),F=x.some(e=>e.gruppe!=null),I=Object.fromEntries(v.map(e=>[e.navn,e.id])),L=ie(t.runde1_format),R=y??0;if(t.kategori?.erlagbasert){let{data:e}=await b(u);R=e.length}let z={container:n,stevneid:u,stevne:t,standings:j,startNumberMap:T,positionMap:E,isTeam:D,nameMap:k,initialMatches:C,finalMatches:w,results:x,isAdmin:a,hasGroupAssignment:F,allInitialConfirmed:M,hasFinalMatches:N,round1Format:L,unitCount:R,groupNameMap:I,reload:()=>d(n,u)};ce(i,e.bannerMeta(z)),a&&i&&(i.innerHTML=re(le(t,{allMatchesConfirmed:P,hasFinalMatches:N,hasGroupAssignment:F,hasPreconfiguredFormat:L!=null&&t.stevne_fase!==`avsluttende`})),ne(i));let B=ae(n);if(F){let t=se(j,A,T,{tableId:`standing-final`,hasGroups:!0,hasElimination:!0,positionMap:E,unitLabel:D?`par`:`spelarar`});n.innerHTML=ue(e.renderMatchesHtml(z),t),ge(n,`standing-final`,s),fe(n),B===`standing`&&oe(n,`standing`),e.bindMatchEvents(n,z),f(n,u)}else n.innerHTML=e.renderSetupHtml(z);i&&(pe(i,{title:`Autofullfør kampar`,message:`Autofullfør alle ubekrefta avsluttande kampar?`},async()=>{await ee(u),await d(n,u)}),de(i,u,()=>c(j),()=>d(n,u))),e.bindHeaderEvents(i,z)}catch(e){t(`avsluttendeBase.loadAndRender`,e),n.replaceChildren(S(`Kunne ikkje laste avsluttande fase.`))}}function f(t,r){if(n)return;let i=he(r,[`avsluttende`],t,d,()=>{n&&=(M(n),null)});n=T(r,e.channelName(r),i,e=>l.has(e))}return u}function Pe(e,t,n){let r=e.spelarar.filter(e=>e.kasterid!=null);return u(r,t,n)}function $(e,t){return f(e,t.er_bekreftet)}var Fe=Ne({channelName:e=>`stevne-avsl-cup-${e}`,renderMatchesHtml:e=>{let{finalMatches:t,standings:n,startNumberMap:r,positionMap:i,isTeam:a,isAdmin:o}=e;return`<div class="d-flex gap-3 flex-wrap">${[...new Set(n.map(e=>e.gruppe?.navn).filter(e=>e!=null))].sort().map(e=>{let s=t.filter(t=>t.gruppe_navn===e),c=n.filter(t=>t.gruppe?.navn===e),l=c.filter(e=>e.runde_eliminert==null).length,u=c.length,d=s.length?Math.max(...s.map(e=>e.runde_nummer)):0,f=s.filter(e=>e.runde_nummer===d),p=f.length>0&&f.every(e=>e.er_bekreftet||e.er_walkover),m=s.some(e=>e.runde_navn===`Semifinale`),h=o&&(s.length===0||p)&&l>1&&!m,g=f.length>0&&f.every(e=>e.runde_navn===`Semifinale`),_=s.some(e=>e.runde_navn===`Finale`);return Le(e,s,l,u,d,h,o&&g&&p&&!_,r,i,a?`par`:`spelarar`,o)}).join(``)}</div>`},bindMatchEvents:(e,t)=>{!t.isAdmin&&t.finalMatches.length===0||Ue(e,t.stevneid,t.finalMatches,t.isAdmin,t.reload,t.startNumberMap,t.positionMap)},renderSetupHtml:e=>{let{stevne:t,isAdmin:n,round1Format:r,unitCount:i,standings:a}=e,o=r?.nA??null;if(t.stevne_fase===`avsluttende`)return n?H(a,{showPlayerList:!0,initNa:o,initFormat:r}):`<p class="text-muted fst-italic">Gruppefordeling er ikkje klar enno.</p>`;if(!n)return``;if(i<2)return`<p class="text-muted fst-italic">${t.kategori?.erlagbasert?`Minst 2 par må vere oppretta før gruppefordelinga kan setjast.`:`Minst 2 spelarar må vere påmelde før gruppefordelinga kan setjast.`}</p>`;let s=a.length>0;return H(s?a:i,{showPlayerList:s,initNa:o,initFormat:r})},bannerMeta:({standings:e,round1Format:t})=>{let n=e.filter(e=>e.gruppe?.navn===`A`).length,r=e.filter(e=>e.gruppe?.navn===`B`).length;return n||r?`Cup - A:${n} - B:${r}`:t?.nA==null?`Cup`:`Cup - A:${t.nA} - B:${e.length-t.nA}`},bindHeaderEvents:(e,n)=>{let{container:r,stevneid:o,stevne:c,standings:u,results:f,round1Format:m,allInitialConfirmed:g,hasGroupAssignment:_,groupNameMap:b,reload:x}=n;e?.querySelector(`#start-final-btn`)?.addEventListener(`click`,async()=>{if(!g)return;let{error:e}=await v(o,`avsluttende`);if(e){y(`Feil ved oppstart av avsluttande fase`,`error`);return}if(m?.nA!=null){let e=m.nA,t=b.A??null,n=b.B??null,r=Ie(u,f,e,t,n),{error:i}=await a(o,r);if(i){y(`Feil ved lagring av gruppefordeling: `+s(i),`error`);return}}await x()}),_||_e(r,u,async({nA:e,setupA:t,setupB:n})=>{let{error:r}=await l(o,{A:t,B:n,nA:e});if(r){y(`Feil ved lagring av format: `+s(r),`error`);return}let i=c.stevne_fase;if(i!==`avsluttende`&&p(c.kastemetodeInnl?.navn??``)){let{data:e}=await d(o);if(!e){y(`Fullfør den innleiande fasen før cupen kan startast`,`error`);return}let{error:t}=await v(o,`avsluttende`);if(t){y(`Feil ved oppstart av avsluttande fase: `+s(t),`error`);return}i=`avsluttende`}if(i===`avsluttende`){let t=b.A??null,n=b.B??null,r=Ie(u,f,e,t,n),{error:i}=await a(o,r);if(i){y(`Feil ved lagring av gruppefordeling: `+s(i),`error`);return}}y(`Gruppefordeling lagra`,`success`),await x()}),e?.querySelector(`#edit-group-assignment-btn`)?.addEventListener(`click`,async()=>{await h({title:`Tilbakestill gruppeinndeling`,message:`Gruppefordeling og format vert fjerna.`,danger:!0})&&(await Promise.all([i(o),l(o,null)]),await x())}),_&&(r.querySelectorAll(`[data-generate-group]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.generateGroup??``,n=parseInt(e.dataset.runde??`1`),r=u.filter(e=>e.gruppe?.navn===t);Ee(o,t,r,n,m,x)})}),r.querySelectorAll(`[data-generate-finale-group]`).forEach(e=>{e.addEventListener(`click`,async()=>{let n=e.dataset.generateFinaleGroup??``;e.disabled=!0,e.textContent=`Genererer…`;try{await Te(o,n),await x()}catch(n){t(`cup:genererFinale`,n),y(`Feil ved generering av finale`,`error`),e.disabled=!1,e.textContent=`Generer finale`}})}))}});function Ie(e,t,n,r,i){return e.flatMap((e,a)=>{let o=a<n?r:i??r,s=e.startnummer==null?[]:t.filter(t=>t.startnummer===e.startnummer).map(e=>e.kasterid);return(s.length?s:[e.kasterid]).map(e=>({kasterid:e,gruppeid:o}))})}function Le(e,t,r,i,a,o,s,c,l,u,d=!0){let f=[...N(t,e=>e.runde_nummer)].reverse().map(([e,t])=>{let r=t[0]?.runde_navn??`Runde ${e}`,i=t.filter(e=>!e.er_walkover);return i.length?`
      <h6 class="fw-bold text-center mb-1">${n(r)}</h6>
      <div class="d-flex flex-wrap gap-2 mb-2">
        ${i.map(e=>Be(e,c,l,d)).join(``)}
      </div>`:``}).join(``),p=a+1,m=o?`<button class="btn btn-success w-100 mt-2"
         data-generate-group="${n(e)}" data-runde="${p}">
         Generer runde ${p}
       </button>`:``,h=s?`<button class="btn btn-success w-100 mt-2" data-generate-finale-group="${n(e)}">
         Generer finale
       </button>`:``;return`
    <div class="final-group-col">
      <h6 class="text-center fw-bold mb-2">Gruppe ${n(e)} (${i} ${n(u)})</h6>
      ${m}
      ${h}
      ${f}
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
        ${o&&!a?C(`cup-card__live`):``}
      </div>
      <div class="cup-card__rows">${ze(e,i,s)}</div>
      ${l}
    </div>`}function Ve(e,t){return e===t?Z:null}var He={uavgjort:Z,omgangar:`DB-feil ved sletting av omgangar`,score:`DB-feil ved oppdatering av score`,plassering:`DB-feil ved oppdatering av plassering`,bracket:`DB-feil ved oppdatering av cupstigen`};function Ue(e,n,r,i,a,o,s){me(e);for(let c of r){let r=Pe(c,o,s),l=r[0]??null,u=r[1]??null,d=V(l,!1),f=V(u,!1),p=r.flatMap(e=>e.members.map(e=>e.id)),m=()=>{B({side1Name:d,side2Name:f,currentS1:$(l,c),currentS2:$(u,c),baneLabel:`Bane ${c.bane_nummer??`?`}`,rundeLabel:c.runde_navn??`Runde ${c.runde_nummer}`,playerIds:p,hasRounds:c.spelarar.some(e=>(e.omgangar?.length??0)>0),logPrefix:`cup`,validate:Ve,onSaved:async(e,t)=>{await We(n,c,r,e,t,a)||await a()}})};if(e.querySelector(`#bekrft-${c.id}`)?.addEventListener(`click`,()=>{De(c,r,n,a)}),i&&!c.er_tre_spelarar&&!c.er_walkover){let i=c.er_bekreftet?()=>{L([{name:d,score:$(l,c)},{name:f,score:$(u,c)}],async([e=0,i=0])=>{let{error:o,step:s}=await Ae({stevneId:n,kamp:c,sides:r,s1:e,s2:i});return o?(t(`cup:rescore:${s}`,o),y(He[s??`score`],`error`),!1):(await a(),!0)},{baneLabel:`Bane ${c.bane_nummer??`?`}`,rundeLabel:c.runde_navn??`Runde ${c.runde_nummer}`})}:m;e.querySelectorAll(`[data-endre-score="${c.id}"]`).forEach(e=>e.addEventListener(`click`,i))}}}async function We(e,t,n,r,i,a){let{error:o}=await ke({stevneId:e,kamp:t,sides:n,s1:r,s2:i});return o?(y(s(o),`error`),!1):(await a(),!0)}export{Fe as render};