import{t as e}from"./logError-Bwe5P2rH.js";import{G as t,H as n,J as r,K as i,Q as a,S as o,X as s,Z as c,f as l,k as u,x as d}from"./index-BL9bjKeu.js";import{t as f}from"./LoadingState-VoeU7wjv.js";import{E as p,P as m,a as h,b as g,k as _,l as v,n as y,o as b,t as x,w as S,y as C}from"./kampService-oaBplmk_.js";import{n as w}from"./navigation-BsCaGkBZ.js";import{a as T,i as E,n as D,o as O,r as k,s as A}from"./kampGenereringCupService-xg4qdo2X.js";import{b as j,c as M,d as ee,g as te,h as N,l as P,m as F,n as ne,p as I,r as re,s as L,t as R,u as ie,v as ae,x as z,y as oe}from"./resultatService-DRn-rKc6.js";import{n as B,t as V}from"./scoreEditor-CpPNkCwo.js";function H(e,{showPlayerList:t=!0,initNa:n=null,initFormat:r=null}={}){let i=typeof e==`number`?e:e.length,a=typeof e==`number`?[]:e.map((e,t)=>({...e,cupPlassering:t+1})),o=O(i),s=n===i?i:n!=null&&o.some(e=>e.nA===n)?n:o[0]?.nA??i,c=i-s,l=o.filter(e=>A(e.nA).some(e=>e.c3>0)),u=o.filter(e=>!A(e.nA).some(e=>e.c3>0)),d=A(i).length>0,f=(e,t)=>e.map((e,r)=>{let a=e.nA===s&&n!==i,o=t+r;return`
      <div class="form-check">
        <input class="form-check-input" type="radio" name="group-split" id="split-${o}" value="${e.nA}" ${a?`checked`:``}>
        <label class="form-check-label" for="split-${o}">A:${e.nA} — B:${e.nB}</label>
      </div>`}).join(``),p=[];l.length&&p.push(`<div class="text-muted small fw-semibold mb-1">3 spillere per bane (A)</div>${f(l,0)}`),u.length&&(p.length&&p.push(`<hr class="my-2">`),p.push(`<div class="text-muted small fw-semibold mb-1">2 spillere per bane (A)</div>${f(u,l.length)}`)),d&&(p.length&&p.push(`<hr class="my-2">`),p.push(`
      <div class="form-check">
        <input class="form-check-input" type="radio" name="group-split" id="split-none" value="${i}" ${n===i?`checked`:``}>
        <label class="form-check-label" for="split-ingen">Alle i A</label>
      </div>`));let m=p.join(``),h=r?.A??A(s)[0]??null,g=c>=2?r?.B??A(c)[0]??null:null,_=t?`<div id="group-preview">${U(a,s,h?.walkovers??0,g?.walkovers??0)}</div>`:``;return`
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
            ${q(`Gruppe A`,s,`round1-format-a`,h)}
          </div>
          ${c>=2?`<div id="group-panel-b" class="final-group-col">
            ${q(`Gruppe B`,c,`round1-format-b`,g)}
          </div>`:``}
        </div>
      </div>
      ${_}
      <div class="confirm-banner">
        <button id="confirm-group-btn" class="btn btn-success btn-lg w-100">Bekreft gruppefordeling</button>
      </div>
    </div>
  `}function U(e,t,n=0,r=0){let i=e.slice(0,t),a=e.slice(t);function o(e,t=0){return e.map((e,n)=>{let r=n<t;return`
      <tr>
        <td>${e.cupPlassering}</td>
        <td>${c(e.navn??``)}${r?` <span class="badge bg-info text-dark">Walkover</span>`:``}</td>
        <td class="text-center">${e.kamp_poeng??0}</td>
        <td class="text-center">${e.score_poeng??0}</td>
      </tr>`}).join(``)}let s=`
    <thead class="org-thead"><tr>
      <th class="th-32">#</th><th>NAMN</th>
      <th class="th-44 text-center">KP</th>
      <th class="th-44 text-center">SP</th>
    </tr></thead>`,l=`
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
        ${l}
      </div>
      ${a.length?`<div class="avsl-gruppe-kol">
        <h6 class="fw-bold text-center">GRUPPE B (${a.length})</h6>
        ${u}
      </div>`:``}
    </div>`}function W(e){let t=e.c3>0?3:2;return`${e.walkovers} walkover - ${t} deltakere per bane`}function G(e,t,n,r=null){let i=A(t);return i.length<=1?``:`<div class="d-flex flex-column align-items-start gap-1 mb-2">${i.map((e,t)=>{let i=`${n}-${t}`,a=JSON.stringify(e),o=r?e.walkovers===r.walkovers&&e.c3===r.c3&&e.c2===r.c2:t===0,s=e.c3>0?`btn-outline-success`:`btn-outline-warning`;return`
      <input type="radio" class="btn-check" name="${n}" id="${i}"
        value='${a}' data-oppsett='${a}' autocomplete="off" ${o?`checked`:``}>
      <label class="btn btn-sm ${s}" for="${i}">${W(e)}</label>`}).join(``)}</div>`}function K(e,t,n){return`<div id="structure-${n}">
    <table class="table table-sm table-bordered mb-0">
      <thead><tr>
        <th>Runde</th><th>Deltakere</th><th>Baner</th><th>Per bane</th>
      </tr></thead>
      <tbody>${(e>=2?T(e,{runde1:t}):[]).map((e,n)=>{let r=e.walkovers??0,i=e.players-r,a=r>0?`${i} <span class="text-muted">(${r} w.o.)</span>`:`${i}`,o;return o=n===0&&t?t.c3>0&&t.c2>0?`2/3`:t.c3>0?`3`:`2`:e.players%e.lanes===0?String(e.players/e.lanes):`2/3`,`<tr${e.threePlayers?` class="fw-bold"`:``}>
      <td>${e.runde}</td>
      <td>${a}</td>
      <td>${e.lanes}</td>
      <td>${o}</td>
    </tr>`}).join(``)}</tbody>
    </table>
  </div>`}function q(e,t,n,r){let i=n.slice(-1),a=G(e,t,n,r);return`
    <div class="card">
      <div class="card-body">
        <h6 class="fw-bold mb-2">${a?`${e}: Velg format`:`${e} (${t})`}</h6>
        ${a}
        ${K(t,r,i)}
      </div>
    </div>`}function se(t,n,r,i,a,o){let s=r.filter(e=>e.runde_eliminert==null),l=r.length,u=s.length,f=i===1?a?.[n]??null:null,p=f?.walkovers??0,m=(f?f.c3:u%3==0?u/3:0)+(f?f.c2:u%3==0?0:u/2),h=s.slice(p,p+m),g=s.slice(p+m,p+2*m),_=s.slice(p+2*m),v=document.createElement(`div`);v.className=`final-dialog-overlay`,document.body.appendChild(v);let y=null,b=!1,x=0,S=0;function C(e){if(!b)return;let t=v.querySelector(`.final-dialog-card-wide`);if(!t)return;let n=e.clientX-x,r=e.clientY-S;y={left:n,top:r},t.style.left=`${n}px`,t.style.top=`${r}px`}function w(){b&&(b=!1,document.body.style.userSelect=``)}document.addEventListener(`mousemove`,C),document.addEventListener(`mouseup`,w);function T(){document.removeEventListener(`mousemove`,C),document.removeEventListener(`mouseup`,w)}function O(e){return`<div class="d-flex justify-content-between gap-2 py-1">
      <span class="small">${c(e.navn??``)}</span>
      <span class="small text-muted text-nowrap">${e.kamp_poeng??0}p (${e.score_poeng??0})</span>
    </div>`}function k(r){let C=s.slice(0,p),w=C.length>0?`<div class="mb-3">
          <strong class="d-block mb-1">Walkovers (går vidare utan kamp):</strong>
          ${C.map(O).join(``)}
        </div>`:``,A=r===!0&&m>0?`<div class="alert alert-info small mb-3 py-2">
          Dette er seedinggrupper, ikkje kampar. Spelarar i same gruppe kan ikkje trekkast mot kvarandre. Kampane blir oppretta når du klikkar «Bekreft og opprett kampar».
        </div>`:``,j=r===!0&&m>0?`<div class="d-flex gap-3 flex-wrap mb-3">
          ${[{label:`Seeding 1`,pool:h},{label:`Seeding 2`,pool:g},..._.length?[{label:`Seeding 3`,pool:_}]:[]].map(({label:e,pool:t})=>`
            <div class="card flex-grow-1">
              <div class="card-body p-2">
                <strong class="d-block mb-2 small text-uppercase">${c(e)}</strong>
                ${t.map(O).join(``)}
              </div>
            </div>`).join(``)}
        </div>`:`<div class="final-player-columns mb-3">
          ${s.slice(p).map((e,t)=>`
            <div class="small d-flex justify-content-between gap-2">
              <span>${p+t+1}. ${c(e.navn??``)}</span>
              <span class="text-muted text-nowrap">${e.kamp_poeng??0}p (${e.score_poeng??0})</span>
            </div>`).join(``)}
        </div>`;v.innerHTML=`
      <div class="card final-dialog-card-wide">
        <div class="final-dialog-drag-handle">
          <p class="text-muted small text-uppercase fw-semibold mb-1">Trekning</p>
          <h5 class="mb-1">Gruppe ${c(n)} — Runde ${i}</h5>
          <p class="text-muted small mb-0">${u} av ${l} spelarar igjen</p>
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
          ${A}
          ${w}
          ${j}
        </div>
        <div class="final-dialog-footer">
          <div class="d-flex gap-2">
            <button id="bekreft-gen-btn" class="btn btn-primary" ${r===null?`disabled`:``}>Bekreft og opprett kampar</button>
            <button id="avbryt-gen-btn" class="btn btn-secondary">Avbryt</button>
          </div>
        </div>
      </div>`;let M=v.querySelector(`.final-dialog-card-wide`);y&&(M.style.position=`fixed`,M.style.left=`${y.left}px`,M.style.top=`${y.top}px`,M.style.margin=`0`,M.style.zIndex=`10000`),M.querySelector(`.final-dialog-drag-handle`).addEventListener(`mousedown`,e=>{let t=M.getBoundingClientRect();M.style.position=`fixed`,M.style.left=`${t.left}px`,M.style.top=`${t.top}px`,M.style.margin=`0`,M.style.zIndex=`10000`,x=e.clientX-t.left,S=e.clientY-t.top,y={left:t.left,top:t.top},b=!0,document.body.style.userSelect=`none`}),v.querySelector(`#seeding-ja`).addEventListener(`change`,()=>k(!0)),v.querySelector(`#seeding-nei`).addEventListener(`change`,()=>k(!1)),v.querySelector(`#avbryt-gen-btn`).addEventListener(`click`,()=>{T(),v.remove()}),v.querySelector(`#bekreft-gen-btn`).addEventListener(`click`,async()=>{if(r===null)return;let c=v.querySelector(`#bekreft-gen-btn`);c.disabled=!0,c.textContent=`Lagrer…`;try{let e=s.map((e,t)=>({kasterid:e.kasterid,plassering:t+1}));if(i===1){let i={A:a?.A??void 0,B:a?.B??void 0};await D(t,[{groupName:n,spelarar:e,runde1Oppsett:f}],r,a?i:null)}else await E(t,n,r,e);T(),v.remove(),await o()}catch(t){e(`cup:genererRunde`,t),d(`Feil ved generering av runde`,`error`),c.disabled=!1,c.textContent=`Bekreft og opprett kampar`}})}k(null)}function ce(e,t,n,r){let i=t.map(e=>z(e,!1)),a=[],o=document.createElement(`div`);o.className=`final-dialog-overlay`,document.body.appendChild(o);function s(){let c=a.length===2?t.find(e=>!a.includes(e.rep.kasterid)):null;o.innerHTML=`
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
    `,o.querySelector(`#avbryt-tre-btn`).addEventListener(`click`,()=>o.remove()),o.querySelectorAll(`[data-kasterid]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=Number(e.dataset.kasterid),n=a.indexOf(t);n===-1?a.length<2&&a.push(t):a.splice(n,1),s()})}),o.querySelector(`#bekreft-tre-btn`)?.addEventListener(`click`,async()=>{if(a.length!==2)return;let i=t.find(e=>!a.includes(e.rep.kasterid))??null,s=a.map(e=>t.find(t=>t.rep.kasterid===e)).filter(e=>e!=null).map(e=>e.members.map(e=>e.kasterid)),c=t.flatMap(e=>e.members.map(e=>e.kasterid));o.remove();let{error:l}=await y({kampId:e.id,stevneId:n,roundNumber:e.runde_nummer,roundName:e.runde_navn,allThrowerIds:c,eliminatedIds:i?.members.map(e=>e.kasterid)??[],advancingSides:s});if(l){d(`DB-feil ved bekreft`,`error`);return}await r()})}s()}function le(e){return typeof e!=`object`||!e||Array.isArray(e)?null:e}function ue(e){return e.map(e=>({er_bekreftet:e.er_bekreftet,er_walkover:e.er_walkover,runde_nummer:e.runde_nummer,bane_nummer:e.bane_nummer,spelarar:J(e.spelarar)}))}function J(e){return e.map(e=>({kasterid:e.kasterid??0,kamp_poeng:e.kamp_poeng??0,score_poeng:e.score_poeng??0,antall_ringer:e.antall_ringer,omgangar:e.omgangar,kaster:e.kaster}))}function de(t){let r=null,s=null,c=!1,p=new Set;async function m(e,{id:t,isAdmin:n=!1},i=null){s=i,c=n,r&&=(await w(r),null),e.replaceChildren(f(`Laster…`)),await h(e,t)}async function h(r,f){try{let[{data:e},{data:m},{data:g},{data:v},{count:y}]=await Promise.all([u(f),b(f),re(f),ne([`A`,`B`]),n(f)]);if(!e){r.replaceChildren(a(`Stevne ikkje funne.`));return}let x=g.filter(e=>e.kasterid!=null),S=m.filter(e=>e.fase===`innledende`),C=m.filter(e=>e.fase===`avsluttende`),w={},T={},E=new Map;for(let e of x)e.startnummer!=null&&(w[e.kasterid]=e.startnummer,E.set(e.startnummer,(E.get(e.startnummer)??0)+1)),e.posisjon!=null&&(T[e.kasterid]=e.posisjon);let D=[...E.values()].some(e=>e>1),O={};for(let e of m)for(let t of e.spelarar)t.kasterid&&t.kaster&&!O[t.kasterid]&&(O[t.kasterid]=`${t.kaster.fornavn} ${t.kaster.etternavn}`);let k=ue(S),A=ee(k,x,O,w,T),F=S.length>0&&S.every(e=>e.er_bekreftet),I=C.length>0,L=(S.length>0||I)&&S.every(e=>e.er_bekreftet)&&C.every(e=>e.er_bekreftet),R=x.some(e=>e.gruppe!=null),z=Object.fromEntries(v.map(e=>[e.navn,e.id])),B=le(e.runde1_format),V=y??0;if(e.kategori?.erlagbasert){let{data:e}=await l(f);V=e.length}let H={container:r,stevneid:f,stevne:e,standings:A,startNumberMap:w,positionMap:T,isTeam:D,nameMap:O,initialMatches:S,finalMatches:C,results:x,isAdmin:c,hasGroupAssignment:R,allInitialConfirmed:F,hasFinalMatches:I,round1Format:B,unitCount:V,groupNameMap:z,reload:()=>h(r,f)};c&&s&&(s.innerHTML=te(e,{allMatchesConfirmed:L,hasFinalMatches:I,hasGroupAssignment:R,hasPreconfiguredFormat:B!=null&&e.stevne_fase!==`avsluttende`}));let U=N(r);if(R){let e=oe(A,k,w,{tableId:`standing-final`,hasGroups:!0,hasElimination:!0,positionMap:T,unitLabel:D?`par`:`spelarar`});r.innerHTML=ae(t.renderMatchesHtml(H),e),P(r,`standing-final`,p),ie(r),U===`standing`&&j(r,`standing`),t.bindMatchEvents(r,H),_(r,f)}else r.innerHTML=t.renderSetupHtml(H);s?.querySelector(`#complete-tournament-btn`)?.addEventListener(`click`,async()=>{if(!await o({title:`Fullfør turnering`,message:`Vil du fullføre turneringa? Dette kan ikkje angrast.`,danger:!0}))return;let{error:e}=await M(f,[...A.filter(e=>e.gruppe?.navn===`A`),...A.filter(e=>e.gruppe?.navn===`B`),...A.filter(e=>e.gruppe?.navn!==`A`&&e.gruppe?.navn!==`B`)]);if(e){d(`Feil ved lagring av plasseringar`,`error`);return}let{error:t}=await i(f);if(t){d(`Feil ved fullføring av turnering`,`error`);return}await h(r,f)}),t.bindHeaderEvents(s,H)}catch(t){e(`avsluttendeBase.loadAndRender`,t),r.replaceChildren(a(`Kunne ikkje laste avsluttande fase.`))}}function _(e,n){if(r)return;let i=F(n,[`avsluttende`],e,h,()=>{r&&=(w(r),null)});r=g(n,t.channelName(n),i)}return m}function Y(e,t,n){return _(e.spelarar.filter(e=>e.kasterid!=null),t,n)}function X(e){return e?.members.reduce((e,t)=>e+m(t),0)??0}var fe=de({channelName:e=>`stevne-avsl-cup-${e}`,renderMatchesHtml:e=>{let{finalMatches:t,standings:n,startNumberMap:r,positionMap:i,isTeam:a,isAdmin:o}=e;return`<div class="d-flex gap-3 flex-wrap">${[...new Set(n.map(e=>e.gruppe?.navn).filter(e=>e!=null))].sort().map(e=>{let s=t.filter(t=>t.gruppe_navn===e),c=n.filter(t=>t.gruppe?.navn===e),l=c.filter(e=>e.runde_eliminert==null).length,u=c.length,d=s.length?Math.max(...s.map(e=>e.runde_nummer)):0,f=s.filter(e=>e.runde_nummer===d),p=f.length>0&&f.every(e=>e.er_bekreftet||e.er_walkover),m=s.some(e=>e.runde_navn===`Semifinale`);return pe(e,s,l,u,d,o&&(s.length===0||p)&&l>1&&!m,r,i,a?`par`:`spelarar`,o)}).join(``)}</div>`},bindMatchEvents:(e,t)=>{!t.isAdmin&&t.finalMatches.length===0||ve(e,t.stevneid,t.finalMatches,t.isAdmin,t.reload,t.startNumberMap,t.positionMap)},renderSetupHtml:e=>{let{stevne:t,isAdmin:n,round1Format:r,unitCount:i,standings:a}=e,o=r?.nA??null;if(t.stevne_fase===`avsluttende`)return n?H(a,{showPlayerList:!0,initNa:o,initFormat:r}):`<p class="text-muted fst-italic">Gruppefordeling er ikkje klar enno.</p>`;if(!n)return``;if(i<2)return`<p class="text-muted fst-italic">${t.kategori?.erlagbasert?`Minst 2 par må vere oppretta før gruppefordelinga kan setjast.`:`Minst 2 spelarar må vere påmelde før gruppefordelinga kan setjast.`}</p>`;let s=a.length>0;return H(s?a:i,{showPlayerList:s,initNa:o,initFormat:r})},bindHeaderEvents:(e,n)=>{let{container:i,stevneid:a,stevne:s,standings:c,results:l,round1Format:u,allInitialConfirmed:f,hasGroupAssignment:p,groupNameMap:m,reload:h}=n;if(e?.querySelector(`#start-final-btn`)?.addEventListener(`click`,async()=>{if(!f)return;let{error:e}=await r(a,`avsluttende`);if(e){d(`Feil ved oppstart av avsluttande fase`,`error`);return}if(u?.nA!=null){let e=u.nA,{error:t}=await L(a,Z(c,l,e,m.A??null,m.B??null));if(t){d(`Feil ved lagring av gruppefordeling`,`error`);return}}await h()}),!p){let e=parseInt(i.querySelector(`#group-assignment-wrapper`)?.dataset.n??`0`)||c.length;function n(e,t){let n=i.querySelector(`input[name="${e}"]:checked`);if(n?.dataset.oppsett)try{return JSON.parse(n.dataset.oppsett)}catch{}return A(t)[0]??null}function r(e,t,n){let r=i.querySelector(`#group-preview`);r&&(r.innerHTML=U(c.map((e,t)=>({...e,cupPlassering:t+1})),e,t?.walkovers??0,n?.walkovers??0))}let o=i.querySelector(`#group-panels`);o&&o.addEventListener(`change`,t=>{let a=t.target;if(!a.matches(`input[name^="round1-format"]`))return;let o=parseInt(i.querySelector(`input[name="group-split"]:checked`)?.value??String(e)),s=e-o,c=n(`round1-format-a`,o),l=n(`round1-format-b`,s);if(a.name===`round1-format-a`){let e=i.querySelector(`#structure-a`);e&&(e.outerHTML=K(o,c,`a`))}else{let e=i.querySelector(`#structure-b`);e&&(e.outerHTML=K(s,l,`b`))}r(o,c,l)}),i.querySelectorAll(`input[name="group-split"]`).forEach(t=>{t.addEventListener(`change`,()=>{let n=parseInt(t.value),i=e-n,a=A(n)[0]??null,s=i>=2?A(i)[0]??null:null;o&&(o.innerHTML=`<div id="group-panel-a" class="final-group-col">
                ${q(`Gruppe A`,n,`round1-format-a`,a)}
              </div>`+(i>=2?`<div id="group-panel-b" class="final-group-col">
                ${q(`Gruppe B`,i,`round1-format-b`,s)}
              </div>`:``)),r(n,a,s)})}),i.querySelector(`#confirm-group-btn`)?.addEventListener(`click`,async()=>{let r=i.querySelector(`input[name="group-split"]:checked`);if(!r)return;let o=parseInt(r.value),u=e-o,{error:f}=await t(a,{A:n(`round1-format-a`,o),B:u>=2?n(`round1-format-b`,u):null,nA:o});if(f){d(`Feil ved lagring av format`,`error`);return}if(s.stevne_fase===`avsluttende`){let{error:e}=await L(a,Z(c,l,o,m.A??null,m.B??null));if(e){d(`Feil ved lagring av gruppefordeling`,`error`);return}}d(`Gruppefordeling lagra`,`success`),await h()})}e?.querySelector(`#edit-group-assignment-btn`)?.addEventListener(`click`,async()=>{await o({title:`Tilbakestill gruppeinndeling`,message:`Gruppefordeling og format vert fjerna.`,danger:!0})&&(await Promise.all([R(a),t(a,null)]),await h())}),p&&i.querySelectorAll(`[data-generate-group]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.generateGroup??``,n=parseInt(e.dataset.runde??`1`);se(a,t,c.filter(e=>e.gruppe?.navn===t),n,u,h)})})}});function Z(e,t,n,r,i){return e.flatMap((e,a)=>{let o=a<n?r:i??r,s=e.startnummer==null?[]:t.filter(t=>t.startnummer===e.startnummer).map(e=>e.kasterid);return(s.length?s:[e.kasterid]).map(e=>({kasterid:e,gruppeid:o}))})}function pe(e,t,n,r,i,a,o,s,l,u=!0){let d=new Map;for(let e of t)d.has(e.runde_nummer)||d.set(e.runde_nummer,[]),d.get(e.runde_nummer).push(e);let f=[...d.entries()].reverse().map(([e,t])=>{let n=t[0]?.runde_navn??`Runde ${e}`,r=t.filter(e=>!e.er_walkover);return r.length?`
      <h6 class="fw-bold text-center mb-1">${c(n)}</h6>
      <div class="d-flex flex-wrap gap-2 mb-2">
        ${r.map(e=>_e(e,o,s,u)).join(``)}
      </div>`:``}).join(``),p=i+1,m=a?`<button class="btn btn-success w-100 mt-2"
         data-generate-group="${c(e)}" data-runde="${p}">
         Generer runde ${p}
       </button>`:``;return`
    <div class="final-group-col">
      <h6 class="text-center fw-bold mb-2">Gruppe ${c(e)} (${r} ${c(l)})</h6>
      ${m}
      ${f}
    </div>`}function me(e,t,n,r){let i=X(t),a=i>0||r.isConfirmed&&!r.isThreeSides||r.hasRounds?i:`—`,o=t.rep.kamp_plassering,s=e.er_bekreftet&&o!=null&&o>=n,c=e.er_bekreftet&&o!=null&&o<n,l=s?`match-eliminated`:c?`match-advancing`:``,u=`text-center fw-semibold final-score-cell${r.canEditScore?` score-editable`:``}`,d=r.canEditScore?` data-endre-score="${e.id}"`:``;return`<tr${l?` class="${l}"`:``}>
    <td>${z(t,!1)}</td>
    <td class="${u}"${d}>${a}</td>
  </tr>`}function Q(e,t,n){return e.er_walkover?`<tr>
        <td colspan="2">${z(t[0]??null,!1)} <span class="badge bg-secondary">Walkover</span></td>
      </tr>`:t.map(r=>me(e,r,t.length,n)).join(``)}function he(e,t,n,r){if(e.er_tre_spelarar)return{css:r?`btn-secondary`:`btn-outline-secondary`,text:r?`Endre plassering`:`Sett plassering`,disabled:!1,extraCss:``};let i=I(e,J(t.map(e=>e.rep)),n);return{css:r?`btn-secondary`:i?`btn-success`:`btn-outline-secondary`,text:r?`Bekreftet`:`Bekreft`,disabled:r||!i,extraCss:` btn-confirm`}}function ge(e,t,n){return`<tr>
            <td colspan="2" class="text-end pe-1">
              ${!e.er_walkover&&!e.er_tre_spelarar?`<button class="btn btn-primary btn-sm" id="plus-${e.id}"${t?` disabled`:``}>+</button> `:``}
              ${t?``:`<button class="btn btn-secondary btn-sm" id="scoreboard-${e.id}">Scoreboard</button> `}
              <button class="btn ${n.css} btn-sm${n.extraCss}" id="bekrft-${e.id}"${n.disabled?` disabled`:``}>${n.text}</button>
            </td>
          </tr>`}function _e(e,t,n,r=!0){let i=Y(e,t,n),a=e.er_bekreftet||e.er_walkover,o=e.spelarar.some(e=>(e.omgangar?.length??0)>0),c={isConfirmed:a,hasRounds:o,canEditScore:r&&e.er_bekreftet&&!e.er_tre_spelarar&&!o,isThreeSides:e.er_tre_spelarar},l=r?ge(e,a,he(e,i,o,a)):``;return`
    <div class="final-match-block">
      <div class="final-match-header">
        <span class="final-match-lane">Bane ${e.bane_nummer}</span>
        ${o&&!a?s():``}
      </div>
      <table class="table table-sm table-bordered mb-0">
        <tbody>
          ${Q(e,i,c)}
          ${l}
        </tbody>
      </table>
    </div>`}function ve(t,n,r,i,a,o,s){for(let c of r){let r=Y(c,o,s),l=r[0]??null,u=r[1]??null,f=l?.rep??null,m=u?.rep??null,g=z(l,!1),_=z(u,!1),v=r.flatMap(e=>e.members.map(e=>e.id)),y=async(t,n)=>{let r=[];f?.id&&r.push(S(f.id,t)),m?.id&&r.push(S(m.id,n));for(let e of[l,u])for(let t of e?.members.slice(1)??[])r.push(S(t.id,0));try{return(await Promise.all(r)).find(e=>e.error)??null}catch(t){return e(`cup:writeSideScore`,t),{error:t}}};if(t.querySelector(`#plus-${c.id}`)?.addEventListener(`click`,()=>{V({side1Name:g,side2Name:_,currentS1:X(l),currentS2:X(u),playerIds:v,hasRounds:c.spelarar.some(e=>(e.omgangar?.length??0)>0),logPrefix:`cup`,onSave:y,onSaved:a})}),t.querySelector(`#scoreboard-${c.id}`)?.addEventListener(`click`,()=>{window.open(`#/kamp/${c.id}`,`_blank`)}),t.querySelector(`#bekrft-${c.id}`)?.addEventListener(`click`,async e=>{if(c.er_tre_spelarar)ce(c,r,n,async()=>{await $(n,c),await a()});else{let t=e.currentTarget;t.disabled=!0,t.textContent=`Lagrer…`;try{await ye(n,c,r,a)||(t.disabled=!1,t.textContent=`Bekreft`)}catch{t.disabled=!1,t.textContent=`Bekreft`}}}),i&&c.er_bekreftet&&!c.er_tre_spelarar){let e=r.flatMap(e=>e.members.map(e=>e.kasterid)),i=()=>{B(g,_,X(l),X(u),async(t,r)=>{if(v.length){let{error:e}=await h(v);if(e){d(`DB-feil ved sletting av omgangar`,`error`);return}}if(await y(t,r)){d(`DB-feil ved oppdatering av score`,`error`);return}let i=t>=r?l:u,o=t>=r?u:l,s=i?.members.map(e=>e.kasterid)??[],f=o?.members.map(e=>e.kasterid)??[],m=[...s.map(e=>({kasterid:e,plassering:1})),...f.map(e=>({kasterid:e,plassering:2}))],{error:g}=await C(c.id,m);if(g){d(`DB-feil ved oppdatering av plassering`,`error`);return}await p({stevneId:n,roundNumber:c.runde_nummer,roundName:c.runde_navn,allThrowerIds:e,newWinnerIds:s,newLoserIds:f}),await a()})};t.querySelectorAll(`[data-endre-score="${c.id}"]`).forEach(e=>e.addEventListener(`click`,i))}}}async function ye(e,t,n,r){let i=n[0]??null,a=n[1]??null,{data:s}=await v(t.id),c=e=>e?.members.reduce((e,t)=>e+m(s.find(e=>e.id===t.id)??t),0)??0,l=c(i),u=c(a);if(l===0&&u===0&&!await o({title:`Ingen score registrert`,message:`Vil du bekrefte kampen likevel?`}))return!1;let f=l>=u?i:a,p=l>=u?a:i,h=n.flatMap(e=>e.members.map(e=>e.kasterid)),{error:g}=await y({kampId:t.id,stevneId:e,roundNumber:t.runde_nummer,roundName:t.runde_navn,allThrowerIds:h,eliminatedIds:p?.members.map(e=>e.kasterid)??[],advancingSides:f?[f.members.map(e=>e.kasterid)]:[]});return g?(d(`DB-feil ved bekreft`,`error`),!1):(await $(e,t),await r(),!0)}async function $(e,t){t.runde_navn!==`Semifinale`||!t.gruppe_navn||await x(e,t.gruppe_navn)&&await k(e,t.gruppe_navn)}export{fe as render};