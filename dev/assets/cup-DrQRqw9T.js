import{n as e,r as t,t as n}from"./logError-DE4meABt.js";import{Bn as r,Cn as i,Dn as a,En as o,Et as s,Fn as c,Jn as l,Kn as u,Kt as d,Mn as f,Nn as p,Rt as m,St as h,_t as g,dn as _,dr as v,fr as y,kt as b,l as x,m as S,p as C,tt as w}from"./index-C5SiCpc_.js";import{S as T,_ as E,b as D,g as O,n as k,o as A,r as j,t as M,w as N}from"./kampService-BuJQm37d.js";import{n as P}from"./navigation-CqyQLA72.js";import{t as F}from"./ScoreboardButton-cO_q_Bk1.js";import{t as I}from"./groupBy-BwgwJVkt.js";import{a as ee,l as te,n as ne,r as re}from"./stevne-D4GLuerV.js";import{a as L,i as R,n as z,o as ie,r as B,s as V,t as ae}from"./ScoreEditor-BgMf6k1D.js";import{C as oe,D as se,E as ce,O as le,S as ue,T as de,_ as fe,b as pe,g as me,k as H,v as he,x as ge,y as _e}from"./padInput-Dnwu2Ei4.js";function U(e,{showPlayerList:t=!0,initNa:n=null,initFormat:r=null}={}){let i=typeof e==`number`?e:e.length,a=typeof e==`number`?[]:e.map((e,t)=>({...e,cupPlassering:t+1})),o=L(i),s=n===i?i:n!=null&&o.some(e=>e.nA===n)?n:o[0]?.nA??i,c=i-s,l=o.filter(e=>V(e.nA).some(e=>e.c3>0)),u=o.filter(e=>!V(e.nA).some(e=>e.c3>0)),d=V(i).length>0,f=(e,t)=>e.map((e,r)=>{let a=e.nA===s&&n!==i,o=t+r;return`
      <div class="form-check">
        <input class="form-check-input" type="radio" name="group-split" id="split-${o}" value="${e.nA}" ${a?`checked`:``}>
        <label class="form-check-label" for="split-${o}">A:${e.nA} — B:${e.nB}</label>
      </div>`}).join(``),p=[];l.length&&p.push(`<div class="text-muted small fw-semibold mb-1">3 spillere per bane (A)</div>${f(l,0)}`),u.length&&(p.length&&p.push(`<hr class="my-2">`),p.push(`<div class="text-muted small fw-semibold mb-1">2 spillere per bane (A)</div>${f(u,l.length)}`)),d&&(p.length&&p.push(`<hr class="my-2">`),p.push(`
      <div class="form-check">
        <input class="form-check-input" type="radio" name="group-split" id="split-none" value="${i}" ${n===i?`checked`:``}>
        <label class="form-check-label" for="split-ingen">Alle i A</label>
      </div>`));let m=p.join(``),h=r?.A??V(s)[0]??null,g=c>=2?r?.B??V(c)[0]??null:null,_=t?`<div id="group-preview">${W(a,s,h?.walkovers??0,g?.walkovers??0)}</div>`:``;return`
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
            ${K(`Gruppe A`,s,`round1-format-a`,h)}
          </div>
          ${c>=2?`<div id="group-panel-b" class="final-group-col">
            ${K(`Gruppe B`,c,`round1-format-b`,g)}
          </div>`:``}
        </div>
      </div>
      ${_}
      <div class="confirm-banner">
        <button id="confirm-group-btn" class="btn btn-success btn-lg w-100">Bekreft gruppefordeling</button>
      </div>
    </div>
  `}function ve(e,t,n){let r=parseInt(e.querySelector(`#group-assignment-wrapper`)?.dataset.n??`0`)||t.length,i=t.map((e,t)=>({...e,cupPlassering:t+1})),a=e.querySelector(`#group-panels`);function o(t,n){let r=e.querySelector(`input[name="${t}"]:checked`);if(r?.dataset.oppsett)try{return JSON.parse(r.dataset.oppsett)}catch{}return V(n)[0]??null}function s(){return parseInt(e.querySelector(`input[name="group-split"]:checked`)?.value??String(r))}function c(t,n,r){let a=e.querySelector(`#group-preview`);a&&(a.innerHTML=W(i,t,n?.walkovers??0,r?.walkovers??0))}a?.addEventListener(`change`,t=>{let n=t.target;if(!n.matches(`input[name^="round1-format"]`))return;let i=s(),a=r-i,l=o(`round1-format-a`,i),u=o(`round1-format-b`,a);if(n.name===`round1-format-a`){let t=e.querySelector(`#structure-a`);t&&(t.outerHTML=G(i,l,`a`))}else{let t=e.querySelector(`#structure-b`);t&&(t.outerHTML=G(a,u,`b`))}c(i,l,u)}),e.querySelectorAll(`input[name="group-split"]`).forEach(e=>{e.addEventListener(`change`,()=>{let t=parseInt(e.value),n=r-t,i=V(t)[0]??null,o=n>=2?V(n)[0]??null:null;a&&(a.innerHTML=`<div id="group-panel-a" class="final-group-col">
            ${K(`Gruppe A`,t,`round1-format-a`,i)}
          </div>`+(n>=2?`<div id="group-panel-b" class="final-group-col">
            ${K(`Gruppe B`,n,`round1-format-b`,o)}
          </div>`:``)),c(t,i,o)})}),e.querySelector(`#confirm-group-btn`)?.addEventListener(`click`,()=>{let t=e.querySelector(`input[name="group-split"]:checked`);if(!t)return;let i=parseInt(t.value),a=r-i;n({nA:i,nB:a,setupA:o(`round1-format-a`,i),setupB:a>=2?o(`round1-format-b`,a):null})})}function W(t,n,r=0,i=0){let a=t.slice(0,n),o=t.slice(n),s=t.some(e=>e.poeng_xkast!=null);function c(t,n=0){return t.map((t,r)=>{let i=r<n,a=s?t.antall_ring_xkast??0:t.kamp_poeng??0,o=s?t.poeng_xkast??0:t.score_poeng??0;return`
      <tr>
        <td>${t.cupPlassering}</td>
        <td>${e(t.navn??``)}${i?` <span class="badge bg-info text-dark">Walkover</span>`:``}</td>
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
    </div>`}function ye(e){let t=e.c3>0?3:2;return`${e.walkovers} walkover - ${t} deltakere per bane`}function be(e,t,n,r=null){let i=V(t);return i.length<=1?``:`<div class="d-flex flex-column align-items-start gap-1 mb-2">${i.map((e,t)=>{let i=`${n}-${t}`,a=JSON.stringify(e),o=r?e.walkovers===r.walkovers&&e.c3===r.c3&&e.c2===r.c2:t===0,s=e.c3>0?`btn-outline-success`:`btn-outline-warning`;return`
      <input type="radio" class="btn-check" name="${n}" id="${i}"
        value='${a}' data-oppsett='${a}' autocomplete="off" ${o?`checked`:``}>
      <label class="btn btn-sm ${s}" for="${i}">${ye(e)}</label>`}).join(``)}</div>`}function G(e,t,n){return`<div id="structure-${n}">
    <table class="table table-sm table-bordered mb-0">
      <thead><tr>
        <th>Runde</th><th>Deltakere</th><th>Baner</th><th>Per bane</th>
      </tr></thead>
      <tbody>${(e>=2?R(e,{runde1:t}):[]).map((e,n)=>{let r=e.walkovers??0,i=e.players-r,a=r>0?`${i} <span class="text-muted">(${r} w.o.)</span>`:`${i}`,o;return o=n===0&&t?t.c3>0&&t.c2>0?`2/3`:t.c3>0?`3`:`2`:e.players%e.lanes===0?String(e.players/e.lanes):`2/3`,`<tr${e.threePlayers?` class="fw-bold"`:``}>
      <td>${e.runde}</td>
      <td>${a}</td>
      <td>${e.lanes}</td>
      <td>${o}</td>
    </tr>`}).join(``)}</tbody>
    </table>
  </div>`}function K(e,t,n,r){let i=n.slice(-1),a=be(e,t,n,r);return`
    <div class="card">
      <div class="card-body">
        <h6 class="fw-bold mb-2">${a?`${e}: Velg format`:`${e} (${t})`}</h6>
        ${a}
        ${G(t,r,i)}
      </div>
    </div>`}function q(){return crypto.randomUUID()}async function J(e){let{data:n,error:r}=await t.from(`resultat`).select(`kasterid, startnummer, posisjon`).eq(`stevneid`,e);if(r)throw Error(`Feil ved henting av resultat: `+r.message);let i={},a={};for(let e of n??[])e.kasterid!=null&&e.startnummer!=null&&(i[e.kasterid]=e.startnummer,(a[e.startnummer]??=[]).push({kasterid:e.kasterid,posisjon:e.posisjon}));let o={};for(let[e,t]of Object.entries(a))t.sort((e,t)=>(e.posisjon??1/0)-(t.posisjon??1/0)||e.kasterid-t.kasterid),o[Number(e)]=t.map(e=>e.kasterid);return{kasteridToSnr:i,snrToMembers:o}}function xe(e,t){let n=e.kasteridToSnr[t];return(n==null?void 0:e.snrToMembers[n])??[t]}function Y(e,t,n,r,i,a=0,o=null,s=q){let c=a;return t.map(t=>({match:{match_id:s(),stevneid:e,fase:`avsluttende`,runde_nummer:n,gruppe_navn:r??null,bane_nummer:t.isWalkover?null:++c,er_bekreftet:t.isWalkover,er_walkover:t.isWalkover,er_tre_spelarar:t.isThreePlayers,runde_navn:o},playerKasterids:t.players.flatMap(e=>xe(i,Number(e)))}))}async function X(e){if(e.length===0)return 0;let n=e.map(e=>({match_id:e.match.match_id,stevneid:e.match.stevneid,fase:e.match.fase,runde_nummer:e.match.runde_nummer,gruppe_navn:e.match.gruppe_navn??null,bane_nummer:e.match.bane_nummer??null,er_bekreftet:e.match.er_bekreftet??!1,er_walkover:e.match.er_walkover??!1,er_tre_spelarar:e.match.er_tre_spelarar??!1,runde_navn:e.match.runde_navn??null,players:e.playerKasterids.map(e=>({kasterid:e}))})),{data:r,error:i}=await t.rpc(`insert_avsluttende_matches`,{p_matches:n});if(i)throw Error(`Feil ved innsetting av cup-kampar: `+i.message);return r??0}async function Se(e,t,n,r,i,a=0,o=null){return X(Y(e,t,n,r,i,a,o))}function Ce(e,t,n){if(!e||!t)return 0;let r=n.indexOf(t),i=0;for(let t of n.slice(0,r)){let n=e[t];n&&(i+=(n.c3??0)+(n.c2??0))}return i}async function we(e,t,n,r=null){let i=[`A`,`B`,`C`],a=await J(e),o=await Z(e,1),s=[];for(let c of t){let t=B(c.spelarar,{medSeeding:n,isRunde1:!0,runde1Oppsett:c.runde1Oppsett??null}),l=Math.max(o,Ce(r,c.groupName,i)),u=c.spelarar.length===4,d=Y(e,t,1,c.groupName,a,l,u?`Semifinale`:null);s.push(...d);for(let{match:e}of d)e.bane_nummer!=null&&e.bane_nummer>o&&(o=e.bane_nummer)}return X(s)}async function Z(e,n){let{data:r}=await t.from(`kamp`).select(`bane_nummer`).eq(`stevneid`,e).eq(`fase`,`avsluttende`).eq(`runde_nummer`,n).not(`bane_nummer`,`is`,null).order(`bane_nummer`,{ascending:!1}).limit(1);return r?.[0]?.bane_nummer??0}async function Te(e,n,r,i){let{data:a}=await t.from(`kamp`).select(`runde_nummer`).eq(`stevneid`,e).eq(`fase`,`avsluttende`).eq(`gruppe_navn`,n).order(`runde_nummer`,{ascending:!1}).limit(1),o=(a?.[0]?.runde_nummer??0)+1,s=i.length===4,c=B(i,{medSeeding:r,isRunde1:!1}),l=await Z(e,o);return{roundNumber:o,matchCount:await Se(e,c,o,n,await J(e),l,s?`Semifinale`:null)}}async function Ee(e,n){let{data:r}=await t.from(`kamp`).select(`id, runde_nummer, spelarar:kamp_spelar(id, kasterid, score_poeng, omgangar:kamp_omgang(score))`).eq(`stevneid`,e).eq(`fase`,`avsluttende`).eq(`gruppe_navn`,n).eq(`runde_navn`,`Semifinale`).eq(`er_bekreftet`,!0);if(!r?.length)throw Error(`Semifinalane er ikkje bekrefta.`);let i=await J(e),a=r,o=a[0].runde_nummer+1,s=[],c=[];for(let e of a){let t=new Map;for(let n of e.spelarar??[]){if(n.kasterid==null)continue;let e=i.kasteridToSnr[n.kasterid]??`kaster-${n.kasterid}`,r=t.get(e)??{kasterids:[],score:0};r.kasterids.push(n.kasterid),r.score+=n.omgangar?.length?n.omgangar.reduce((e,t)=>e+(t.score??0),0):n.score_poeng??0,t.set(e,r)}let n=[...t.values()].sort((e,t)=>t.score-e.score);n[0]&&s.push(n[0].kasterids),n[1]&&c.push(n[1].kasterids)}let l=await Z(e,o);await X([{match:{match_id:q(),stevneid:e,fase:`avsluttende`,runde_nummer:o,gruppe_navn:n,bane_nummer:l+1,runde_navn:`Finale`,er_bekreftet:!1,er_walkover:!1,er_tre_spelarar:!1},playerKasterids:s.flat()},{match:{match_id:q(),stevneid:e,fase:`avsluttende`,runde_nummer:o,gruppe_navn:n,bane_nummer:l+2,runde_navn:`Bronsefinale`,er_bekreftet:!1,er_walkover:!1,er_tre_spelarar:!1},playerKasterids:c.flat()}])}function De(t,r,i,a,o,s){let c=i.filter(e=>e.runde_eliminert==null),l=i.length,u=c.length,d=i.some(e=>e.poeng_xkast!=null),f=e=>d?`${e.poeng_xkast??0}p (${e.antall_ring_xkast??0})`:`${e.kamp_poeng??0}p (${e.score_poeng??0})`,p=a===1?o?.[r]??null:null,m=p?.walkovers??0,h=(p?p.c3:u%3==0?u/3:0)+(p?p.c2:u%3==0?0:u/2),g=c.slice(m,m+h),_=c.slice(m+h,m+2*h),v=c.slice(m+2*h),y=document.createElement(`div`);y.className=`final-dialog-overlay`,document.body.appendChild(y);let b=null,x=!1,S=0,w=0;function T(e){if(!x)return;let t=y.querySelector(`.final-dialog-card-wide`);if(!t)return;let n=e.clientX-S,r=e.clientY-w;b={left:n,top:r},t.style.left=`${n}px`,t.style.top=`${r}px`}function E(){x&&(x=!1,document.body.style.userSelect=``)}document.addEventListener(`mousemove`,T),document.addEventListener(`mouseup`,E);function D(){document.removeEventListener(`mousemove`,T),document.removeEventListener(`mouseup`,E)}function O(t){return`<div class="d-flex justify-content-between gap-2 py-1">
      <span class="small">${e(t.navn??``)}</span>
      <span class="small text-muted text-nowrap">${f(t)}</span>
    </div>`}function k(i){let d=c.slice(0,m),T=d.length>0?`<div class="mb-3">
          <strong class="d-block mb-1">Walkovers (går vidare utan kamp):</strong>
          ${d.map(O).join(``)}
        </div>`:``,E=i===!0&&h>0?`<div class="alert alert-info small mb-3 py-2">
          Dette er seedinggrupper, ikkje kampar. Spelarar i same gruppe kan ikkje trekkast mot kvarandre. Kampane blir oppretta når du klikkar «Bekreft og opprett kampar».
        </div>`:``,A=i===!0&&h>0?`<div class="d-flex gap-3 flex-wrap mb-3">
          ${[{label:`Seeding 1`,pool:g},{label:`Seeding 2`,pool:_},...v.length?[{label:`Seeding 3`,pool:v}]:[]].map(({label:t,pool:n})=>`
            <div class="card flex-grow-1">
              <div class="card-body p-2">
                <strong class="d-block mb-2 small text-uppercase">${e(t)}</strong>
                ${n.map(O).join(``)}
              </div>
            </div>`).join(``)}
        </div>`:`<div class="final-player-columns mb-3">
          ${c.slice(m).map((t,n)=>`
            <div class="small d-flex justify-content-between gap-2">
              <span>${m+n+1}. ${e(t.navn??``)}</span>
              <span class="text-muted text-nowrap">${f(t)}</span>
            </div>`).join(``)}
        </div>`;y.innerHTML=`
      <div class="card final-dialog-card-wide">
        <div class="final-dialog-drag-handle">
          <p class="text-muted small text-uppercase fw-semibold mb-1">Trekning</p>
          <h5 class="mb-1">Gruppe ${e(r)} — Runde ${a}</h5>
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
      </div>`;let j=y.querySelector(`.final-dialog-card-wide`);b&&(j.style.position=`fixed`,j.style.left=`${b.left}px`,j.style.top=`${b.top}px`,j.style.margin=`0`,j.style.zIndex=`10000`),j.querySelector(`.final-dialog-drag-handle`).addEventListener(`mousedown`,e=>{let t=j.getBoundingClientRect();j.style.position=`fixed`,j.style.left=`${t.left}px`,j.style.top=`${t.top}px`,j.style.margin=`0`,j.style.zIndex=`10000`,S=e.clientX-t.left,w=e.clientY-t.top,b={left:t.left,top:t.top},x=!0,document.body.style.userSelect=`none`}),y.querySelector(`#seeding-ja`).addEventListener(`change`,()=>k(!0)),y.querySelector(`#seeding-nei`).addEventListener(`change`,()=>k(!1)),y.querySelector(`#avbryt-gen-btn`).addEventListener(`click`,()=>{D(),y.remove()}),y.querySelector(`#bekreft-gen-btn`).addEventListener(`click`,async()=>{if(i===null)return;let e=y.querySelector(`#bekreft-gen-btn`);e.disabled=!0,e.textContent=`Lagrer…`;try{let e=c.map((e,t)=>({kasterid:e.kasterid,plassering:t+1}));if(a===1){let n={A:o?.A??void 0,B:o?.B??void 0};await we(t,[{groupName:r,spelarar:e,runde1Oppsett:p}],i,o?n:null)}else await Te(t,r,i,e);D(),y.remove(),await s()}catch(t){n(`cup:genererRunde`,t),C(`Feil ved generering av runde`,`error`),e.disabled=!1,e.textContent=`Bekreft og opprett kampar`}})}k(null)}function Oe(e,t,n,r){let i=t.map(e=>H(e,!1)),a=[],o=document.createElement(`div`);o.className=`final-dialog-overlay`,document.body.appendChild(o);function s(){let c=a.length===2?t.find(e=>!a.includes(e.rep.kasterid)):null;o.innerHTML=`
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
    `,o.querySelector(`#avbryt-tre-btn`).addEventListener(`click`,()=>o.remove()),o.querySelectorAll(`[data-kasterid]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=Number(e.dataset.kasterid),n=a.indexOf(t);n===-1?a.length<2&&a.push(t):a.splice(n,1),s()})}),o.querySelector(`#bekreft-tre-btn`)?.addEventListener(`click`,async()=>{if(a.length!==2)return;let i=t.find(e=>!a.includes(e.rep.kasterid))??null,s=a.map(e=>t.find(t=>t.rep.kasterid===e)).filter(e=>e!=null).map(e=>e.members.map(e=>e.kasterid)),c=t.flatMap(e=>e.members.map(e=>e.kasterid));o.remove();let{error:l}=await M({kampId:e.id,sides:t.map(D),outcome:{type:`cup-ranked`,stevneId:n,roundNumber:e.runde_nummer,roundName:e.runde_navn,allThrowerIds:c,eliminatedIds:i?.members.map(e=>e.kasterid)??[],advancingSides:s}});if(l){C(`DB-feil ved bekreft`,`error`);return}await r()})}s()}var Q=`Ein cupkamp kan ikkje ende uavgjort.`;function ke(e,t,n,r){let i=n>=r?e:t,a=n>=r?t:e,o=i?.members.map(e=>e.kasterid)??[],s=a?.members.map(e=>e.kasterid)??[];return{winnerIds:o,loserIds:s,placements:[...o.map(e=>({kasterid:e,plassering:1})),...s.map(e=>({kasterid:e,plassering:2}))]}}async function Ae(e,t,r,i){let a=[];e?.rep.id&&a.push(T(e.rep.id,r)),t?.rep.id&&a.push(T(t.rep.id,i));for(let n of[e,t])for(let e of n?.members.slice(1)??[])a.push(T(e.id,0));try{return{error:(await Promise.all(a)).find(e=>e.error)?.error??null}}catch(e){return n(`cupKampService.writeCupSideScores`,e),{error:e}}}async function je(e,t,n){let{data:r}=await A(e),i=e=>e?.members.reduce((e,t)=>{let n=r.find(e=>e.id===t.id);return e+u(n??t,!1)},0)??0;return{s1:i(t),s2:i(n)}}async function Me(e){let{stevneId:t,kamp:n,sides:r,s1:i,s2:a}=e;if(i===a)return{error:Error(Q)};let o=r[0]??null,s=r[1]??null,{winnerIds:c,loserIds:l}=ke(o,s,i,a);return M({kampId:n.id,sides:[D(o),D(s)],outcome:{type:`cup-ranked`,stevneId:t,roundNumber:n.runde_nummer,roundName:n.runde_navn,allThrowerIds:r.flatMap(e=>e.members.map(e=>e.kasterid)),eliminatedIds:l,advancingSides:c.length?[c]:[]}})}async function Ne(e){let{stevneId:t,kamp:n,sides:r,s1:i,s2:a}=e;if(i===a)return{error:Error(Q),step:`uavgjort`};let o=r[0]??null,s=r[1]??null,c=r.flatMap(e=>e.members.map(e=>e.id));if(c.length){let{error:e}=await k(c);if(e)return{error:e,step:`omgangar`}}let{error:l}=await Ae(o,s,i,a);if(l)return{error:l,step:`score`};let{winnerIds:u,loserIds:d,placements:f}=ke(o,s,i,a),{error:p}=await O(n.id,f);if(p)return{error:p,step:`plassering`};let{error:m}=await N({stevneId:t,roundNumber:n.runde_nummer,roundName:n.runde_navn,allThrowerIds:r.flatMap(e=>e.members.map(e=>e.kasterid)),newWinnerIds:u,newLoserIds:d});return m?{error:m,step:`bracket`}:{error:null,step:null}}function Pe(e){return e.map(e=>({er_bekreftet:e.er_bekreftet,er_walkover:e.er_walkover,runde_nummer:e.runde_nummer,bane_nummer:e.bane_nummer,spelarar:Fe(e.spelarar)}))}function Fe(e){return e.map(e=>({kasterid:e.kasterid??0,kamp_poeng:e.kamp_poeng??0,score_poeng:e.score_poeng??0,antall_ringer:e.antall_ringer,omgangar:e.omgangar,kaster:e.kaster}))}function Ie(e){let t=null,r=null,i=!1,s=new Set,l=new Set;async function u(e,{id:n,isAdmin:a=!1},o=null){r=o,i=a,t&&=(await P(t),null),e.replaceChildren(y(`Laster…`)),await d(e,n)}async function d(t,u){try{let[{data:n},{data:m},{data:h},{data:y},{count:b}]=await Promise.all([w(u),j(u),a(u),o([`A`,`B`]),g(u)]);if(!n){t.replaceChildren(v(`Stevne ikkje funne.`));return}l.clear();for(let e of m)for(let t of e.spelarar)l.add(t.id);let x=h.filter(e=>e.kasterid!=null),S=m.filter(e=>e.fase===`innledende`),C=m.filter(e=>e.fase===`avsluttende`),{startNumberMap:T,positionMap:E,isTeam:D}=te(x),O={};for(let e of m)for(let t of e.spelarar)t.kasterid&&t.kaster&&!O[t.kasterid]&&(O[t.kasterid]=`${t.kaster.fornavn} ${t.kaster.etternavn}`);for(let e of x)e.kaster&&!O[e.kasterid]&&(O[e.kasterid]=`${e.kaster.fornavn} ${e.kaster.etternavn}`);let k=Pe(S),A=p(k,x,O,T,E),M=S.length>0&&S.every(e=>e.er_bekreftet),N=C.length>0,P=(S.length>0||N)&&S.every(e=>e.er_bekreftet)&&C.every(e=>e.er_bekreftet),F=x.some(e=>e.gruppe!=null),I=Object.fromEntries(y.map(e=>[e.navn,e.id])),L=ie(n.runde1_format),R=b??0;if(n.kategori?.erlagbasert){let{data:e}=await _(u);R=e.length}let z={container:t,stevneid:u,stevne:n,standings:A,startNumberMap:T,positionMap:E,isTeam:D,nameMap:O,initialMatches:S,finalMatches:C,results:x,isAdmin:i,hasGroupAssignment:F,allInitialConfirmed:M,hasFinalMatches:N,round1Format:L,unitCount:R,groupNameMap:I,reload:()=>d(t,u)};le(r,e.bannerMeta(z)),i&&r&&(r.innerHTML=re(ue(n,{allMatchesConfirmed:P,hasFinalMatches:N,hasGroupAssignment:F,hasPreconfiguredFormat:L!=null&&n.stevne_fase!==`avsluttende`})),ne(r));let B=oe(t);if(F){let n=ce(A,k,T,{tableId:`standing-final`,hasGroups:!0,hasElimination:!0,positionMap:E,unitLabel:D?`par`:`spelarar`});t.innerHTML=de(e.renderMatchesHtml(z),n),_e(t,`standing-final`,s),pe(t),B===`standing`&&se(t,`standing`),e.bindMatchEvents(t,z),f(t,u)}else t.innerHTML=e.renderSetupHtml(z);r&&(me(r,{title:`Autofullfør kampar`,message:`Autofullfør alle ubekrefta avsluttande kampar?`},async()=>{await ee(u),await d(t,u)}),fe(r,u,()=>c(A),()=>d(t,u))),e.bindHeaderEvents(r,z)}catch(e){n(`avsluttendeBase.loadAndRender`,e),t.replaceChildren(v(`Kunne ikkje laste avsluttande fase.`))}}function f(n,r){if(t)return;let i=ge(r,[`avsluttende`],n,d,()=>{t&&=(P(t),null)});t=E(r,e.channelName(r),i,e=>l.has(e))}return u}function Le(e,t,n){let i=e.spelarar.filter(e=>e.kasterid!=null);return r(i,t,n)}function $(e,t){return l(e,t.er_bekreftet)}var Re=Ie({channelName:e=>`stevne-avsl-cup-${e}`,renderMatchesHtml:e=>{let{finalMatches:t,standings:n,startNumberMap:r,positionMap:i,isTeam:a,isAdmin:o}=e;return`<div class="d-flex gap-3 flex-wrap">${[...new Set(n.map(e=>e.gruppe?.navn).filter(e=>e!=null))].sort().map(e=>{let s=t.filter(t=>t.gruppe_navn===e),c=n.filter(t=>t.gruppe?.navn===e),l=c.filter(e=>e.runde_eliminert==null).length,u=c.length,d=s.length?Math.max(...s.map(e=>e.runde_nummer)):0,f=s.filter(e=>e.runde_nummer===d),p=f.length>0&&f.every(e=>e.er_bekreftet||e.er_walkover),m=s.some(e=>e.runde_navn===`Semifinale`),h=o&&(s.length===0||p)&&l>1&&!m,g=f.length>0&&f.every(e=>e.runde_navn===`Semifinale`),_=s.some(e=>e.runde_navn===`Finale`);return Be(e,s,l,u,d,h,o&&g&&p&&!_,r,i,a?`par`:`spelarar`,o)}).join(``)}</div>`},bindMatchEvents:(e,t)=>{!t.isAdmin&&t.finalMatches.length===0||Ke(e,t.stevneid,t.finalMatches,t.isAdmin,t.reload,t.startNumberMap,t.positionMap)},renderSetupHtml:e=>{let{stevne:t,isAdmin:n,round1Format:r,unitCount:i,standings:a}=e,o=r?.nA??null;if(t.stevne_fase===`avsluttende`)return n?U(a,{showPlayerList:!0,initNa:o,initFormat:r}):`<p class="text-muted fst-italic">Gruppefordeling er ikkje klar enno.</p>`;if(!n)return``;if(i<2)return`<p class="text-muted fst-italic">${t.kategori?.erlagbasert?`Minst 2 par må vere oppretta før gruppefordelinga kan setjast.`:`Minst 2 spelarar må vere påmelde før gruppefordelinga kan setjast.`}</p>`;let s=a.length>0;return U(s?a:i,{showPlayerList:s,initNa:o,initFormat:r})},bannerMeta:({standings:e,round1Format:t})=>{let n=e.filter(e=>e.gruppe?.navn===`A`).length,r=e.filter(e=>e.gruppe?.navn===`B`).length;return n||r?`Cup - A:${n} - B:${r}`:t?.nA==null?`Cup`:`Cup - A:${t.nA} - B:${e.length-t.nA}`},bindHeaderEvents:(e,t)=>{let{container:r,stevneid:a,stevne:o,standings:c,results:l,round1Format:u,allInitialConfirmed:p,hasGroupAssignment:g,groupNameMap:_,reload:v}=t;e?.querySelector(`#start-final-btn`)?.addEventListener(`click`,async()=>{if(!p)return;let{error:e}=await s(a,`avsluttende`);if(e){C(`Feil ved oppstart av avsluttande fase`,`error`);return}if(u?.nA!=null){let e=u.nA,t=_.A??null,n=_.B??null,r=ze(c,l,e,t,n),{error:i}=await f(a,r);if(i){C(`Feil ved lagring av gruppefordeling: `+b(i),`error`);return}}await v()}),g||ve(r,c,async({nA:e,setupA:t,setupB:n})=>{let{error:r}=await h(a,{A:t,B:n,nA:e});if(r){C(`Feil ved lagring av format: `+b(r),`error`);return}let i=o.stevne_fase;if(i!==`avsluttende`&&d(o.kastemetodeInnl?.navn??``)){let{data:e}=await m(a);if(!e){C(`Fullfør den innleiande fasen før cupen kan startast`,`error`);return}let{error:t}=await s(a,`avsluttende`);if(t){C(`Feil ved oppstart av avsluttande fase: `+b(t),`error`);return}i=`avsluttende`}if(i===`avsluttende`){let t=_.A??null,n=_.B??null,r=ze(c,l,e,t,n),{error:i}=await f(a,r);if(i){C(`Feil ved lagring av gruppefordeling: `+b(i),`error`);return}}C(`Gruppefordeling lagra`,`success`),await v()}),e?.querySelector(`#edit-group-assignment-btn`)?.addEventListener(`click`,async()=>{await S({title:`Tilbakestill gruppeinndeling`,message:`Gruppefordeling og format vert fjerna.`,danger:!0})&&(await Promise.all([i(a),h(a,null)]),await v())}),g&&(r.querySelectorAll(`[data-generate-group]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.generateGroup??``,n=parseInt(e.dataset.runde??`1`),r=c.filter(e=>e.gruppe?.navn===t);De(a,t,r,n,u,v)})}),r.querySelectorAll(`[data-generate-finale-group]`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=e.dataset.generateFinaleGroup??``;e.disabled=!0,e.textContent=`Genererer…`;try{await Ee(a,t),await v()}catch(t){n(`cup:genererFinale`,t),C(`Feil ved generering av finale`,`error`),e.disabled=!1,e.textContent=`Generer finale`}})}))}});function ze(e,t,n,r,i){return e.flatMap((e,a)=>{let o=a<n?r:i??r,s=e.startnummer==null?[]:t.filter(t=>t.startnummer===e.startnummer).map(e=>e.kasterid);return(s.length?s:[e.kasterid]).map(e=>({kasterid:e,gruppeid:o}))})}function Be(t,n,r,i,a,o,s,c,l,u,d=!0){let f=[...I(n,e=>e.runde_nummer)].reverse().map(([t,n])=>{let r=n[0]?.runde_navn??`Runde ${t}`,i=n.filter(e=>!e.er_walkover);return i.length?`
      <h6 class="fw-bold text-center mb-1">${e(r)}</h6>
      <div class="d-flex flex-wrap gap-2 mb-2">
        ${i.map(e=>Ue(e,c,l,d)).join(``)}
      </div>`:``}).join(``),p=a+1,m=o?`<button class="btn btn-success w-100 mt-2"
         data-generate-group="${e(t)}" data-runde="${p}">
         Generer runde ${p}
       </button>`:``,h=s?`<button class="btn btn-success w-100 mt-2" data-generate-finale-group="${e(t)}">
         Generer finale
       </button>`:``;return`
    <div class="final-group-col">
      <h6 class="text-center fw-bold mb-2">Gruppe ${e(t)} (${i} ${e(u)})</h6>
      ${m}
      ${h}
      ${f}
    </div>`}function Ve(e,t,n,r){let i=$(t,e),a=i>0||r.isConfirmed&&!r.isThreeSides||r.hasRounds?i:`—`,o=t.rep.kamp_plassering,s=e.er_bekreftet&&o!=null&&o>=n,c=e.er_bekreftet&&o!=null&&o<n,l=s?` cup-row--tapar`:c?` cup-row--vinnar`:``,u=`cup-row__score${r.canEditScore?` score-editable`:``}`,d=r.canEditScore?` data-endre-score="${e.id}"`:``;return`<div class="cup-row${l}">
      <span class="cup-row__name">${H(t,!1)}</span>
      <span class="${u}"${d}>${a}</span>
    </div>`}function He(e,t,n){return e.er_walkover?`<div class="cup-row">
        <span class="cup-row__name">${H(t[0]??null,!1)} <span class="badge bg-secondary">Walkover</span></span>
        <span class="cup-row__score">—</span>
      </div>`:t.map(r=>Ve(e,r,t.length,n)).join(``)}function Ue(e,t,n,r=!0){let i=Le(e,t,n),a=e.er_bekreftet||e.er_walkover,o=e.spelarar.some(e=>(e.omgangar?.length??0)>0),s={isConfirmed:a,hasRounds:o,canEditScore:r&&!e.er_tre_spelarar&&!e.er_walkover&&(!e.er_bekreftet||!o),isThreeSides:e.er_tre_spelarar},c=r&&!(a&&!o)?F(e.id):``,l=r&&e.er_tre_spelarar?`<div class="cup-card__footer">
          <button class="btn ${a?`btn-secondary`:`btn-outline-secondary`} btn-sm" id="bekrft-${e.id}">${a?`Endre plassering`:`Sett plassering`}</button>
        </div>`:``;return`
    <div class="cup-card">
      <div class="cup-card__header">
        <span class="cup-card__lane">Bane ${e.bane_nummer}</span>
        ${c}
        ${o&&!a?x(`cup-card__live`):``}
      </div>
      <div class="cup-card__rows">${He(e,i,s)}</div>
      ${l}
    </div>`}function We(e,t){return e===t?Q:null}var Ge={uavgjort:Q,omgangar:`DB-feil ved sletting av omgangar`,score:`DB-feil ved oppdatering av score`,plassering:`DB-feil ved oppdatering av plassering`,bracket:`DB-feil ved oppdatering av cupstigen`};function Ke(e,t,r,i,a,o,s){he(e);for(let c of r){let r=Le(c,o,s),l=r[0]??null,u=r[1]??null,d=H(l,!1),f=H(u,!1),p=r.flatMap(e=>e.members.map(e=>e.id)),m=()=>{ae({side1Name:d,side2Name:f,currentS1:$(l,c),currentS2:$(u,c),baneLabel:`Bane ${c.bane_nummer??`?`}`,rundeLabel:c.runde_navn??`Runde ${c.runde_nummer}`,playerIds:p,hasRounds:c.spelarar.some(e=>(e.omgangar?.length??0)>0),logPrefix:`cup`,validate:We,onSave:(e,t)=>Ae(l,u,e,t),onSaved:async()=>{await qe(t,c,r,a)||await a()}})};if(e.querySelector(`#bekrft-${c.id}`)?.addEventListener(`click`,()=>{Oe(c,r,t,a)}),i&&!c.er_tre_spelarar&&!c.er_walkover){let i=c.er_bekreftet?()=>{z([{name:d,score:$(l,c)},{name:f,score:$(u,c)}],async([e=0,i=0])=>{let{error:o,step:s}=await Ne({stevneId:t,kamp:c,sides:r,s1:e,s2:i});return o?(n(`cup:rescore:${s}`,o),C(Ge[s??`score`],`error`),!1):(await a(),!0)},{baneLabel:`Bane ${c.bane_nummer??`?`}`,rundeLabel:c.runde_navn??`Runde ${c.runde_nummer}`})}:m;e.querySelectorAll(`[data-endre-score="${c.id}"]`).forEach(e=>e.addEventListener(`click`,i))}}}async function qe(e,t,n,r){let{s1:i,s2:a}=await je(t.id,n[0]??null,n[1]??null),{error:o}=await Me({stevneId:e,kamp:t,sides:n,s1:i,s2:a});return o?(C(b(o),`error`),!1):(await r(),!0)}export{Re as render};