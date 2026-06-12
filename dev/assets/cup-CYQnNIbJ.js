import{B as e,D as t,G as n,L as r,V as i,W as a,b as o,nt as s,t as c}from"./index-gM0KgVjM.js";import{t as l}from"./LoadingState-RVZNML7E.js";import{t as u}from"./ConfirmDialog-3D8QuJxP.js";import{r as d,s as f}from"./kamp-Bpd8LcU6.js";import{C as p,S as m,a as h,b as g,f as _,n as v,s as y,x as b,y as x}from"./kampService-BGXpkTYM.js";import{t as S}from"./realtime-yLqeh8oj.js";import{a as C,i as w,n as T,o as E,r as D,s as O}from"./kampGenereringCupService-k0nHVfPe.js";import{l as k}from"./pameldingService-PYUY7Dla.js";import{S as A,_ as j,b as M,c as N,d as ee,f as P,g as F,h as I,l as L,n as R,p as te,r as ne,t as z,u as B,v as V,x as H}from"./resultatService-DUDZlB2M.js";import{n as U,t as W}from"./LivePill-BTyzkGe4.js";function G(e,{visSpelarliste:t=!0,initNa:n=null,initFormat:r=null}={}){let i=typeof e==`number`?e:e.length,a=typeof e==`number`?[]:e.map((e,t)=>({...e,cupPlassering:t+1})),o=E(i),s=n===i?i:n!=null&&o.some(e=>e.nA===n)?n:o[0]?.nA??i,c=i-s,l=o.filter(e=>O(e.nA).some(e=>e.c3>0)),u=o.filter(e=>!O(e.nA).some(e=>e.c3>0)),d=O(i).length>0,f=(e,t)=>e.map((e,r)=>{let a=e.nA===s&&n!==i,o=t+r;return`
      <div class="form-check">
        <input class="form-check-input" type="radio" name="gruppe-split" id="split-${o}" value="${e.nA}" ${a?`checked`:``}>
        <label class="form-check-label" for="split-${o}">A:${e.nA} — B:${e.nB}</label>
      </div>`}).join(``),p=[];l.length&&p.push(`<div class="text-muted small fw-semibold mb-1">3 spillere per bane (A)</div>${f(l,0)}`),u.length&&(p.length&&p.push(`<hr class="my-2">`),p.push(`<div class="text-muted small fw-semibold mb-1">2 spillere per bane (A)</div>${f(u,l.length)}`)),d&&(p.length&&p.push(`<hr class="my-2">`),p.push(`
      <div class="form-check">
        <input class="form-check-input" type="radio" name="gruppe-split" id="split-ingen" value="${i}" ${n===i?`checked`:``}>
        <label class="form-check-label" for="split-ingen">Ingen gruppeinndeling (alle i A)</label>
      </div>`));let m=p.join(``),h=r?.A??O(s)[0]??null,g=c>=2?r?.B??O(c)[0]??null:null,_=t?`<div id="gruppe-preview">${K(a,s,h?.walkovers??0,g?.walkovers??0)}</div>`:``;return`
    <div id="gruppe-val-wrapper" data-n="${i}">
      <h5 class="mb-3">Velg gruppeinndeling for cup</h5>
      <div class="d-flex flex-column flex-lg-row gap-3 align-items-start mb-3">
        <div class="card">
          <div class="card-body">
            ${m}
          </div>
        </div>
        <div id="gruppe-paneler" class="d-flex gap-3 flex-wrap">
          <div id="gruppe-panel-a" class="avsl-gruppe-kol">
            ${J(`Gruppe A`,s,`runde1-format-a`,h)}
          </div>
          ${c>=2?`<div id="gruppe-panel-b" class="avsl-gruppe-kol">
            ${J(`Gruppe B`,c,`runde1-format-b`,g)}
          </div>`:``}
        </div>
      </div>
      <div class="mt-3">
        <button id="bekreft-gruppe-btn" class="btn btn-success btn-lg w-100">Bekreft gruppefordeling</button>
      </div>
      ${_}
    </div>
  `}function K(e,t,n=0,r=0){let i=e.slice(0,t),o=e.slice(t);function s(e,t=0){return e.map((e,n)=>{let r=n<t;return`
      <tr>
        <td>${e.cupPlassering}</td>
        <td>${a(String(e.startnummer??``))}</td>
        <td>${a(e.navn??``)}${r?` <span class="badge bg-info text-dark">Walkover</span>`:``}</td>
        <td class="text-center">${e.kamp_poeng??0}</td>
        <td class="text-center">${e.score_poeng??0}</td>
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
    </div>`}function re(e){let t=e.c3>0?3:2;return`${e.walkovers} walkover - ${t} deltakere per bane`}function ie(e,t,n,r=null){let i=O(t);return i.length<=1?``:`<div class="d-flex flex-column align-items-start gap-1 mb-2">${i.map((e,t)=>{let i=`${n}-${t}`,a=JSON.stringify(e),o=r?e.walkovers===r.walkovers&&e.c3===r.c3&&e.c2===r.c2:t===0,s=e.c3>0?`btn-outline-success`:`btn-outline-warning`;return`
      <input type="radio" class="btn-check" name="${n}" id="${i}"
        value='${a}' data-oppsett='${a}' autocomplete="off" ${o?`checked`:``}>
      <label class="btn btn-sm ${s}" for="${i}">${re(e)}</label>`}).join(``)}</div>`}function q(e,t,n){return`<div id="struktur-${n}">
    <table class="table table-sm table-bordered mb-0">
      <thead><tr>
        <th>Runde</th><th>Deltakere (w.o.)</th><th>Baner</th><th>Per bane</th>
      </tr></thead>
      <tbody>${(e>=2?C(e,{runde1:t}):[]).map((e,n)=>{let r=e.walkovers??0,i=e.spelarar-r,a=r>0?`${i} <span class="text-muted">(${r} w.o.)</span>`:`${i}`,o;return o=n===0&&t?t.c3>0&&t.c2>0?`2/3`:t.c3>0?`3`:`2`:e.spelarar%e.baner===0?String(e.spelarar/e.baner):`2/3`,`<tr${e.treSpelarar?` class="fw-bold"`:``}>
      <td>${e.runde}</td>
      <td>${a}</td>
      <td>${e.baner}</td>
      <td>${o}</td>
    </tr>`}).join(``)}</tbody>
    </table>
  </div>`}function J(e,t,n,r){let i=n.slice(-1),a=ie(e,t,n,r);return`
    <div class="card">
      <div class="card-body">
        <h6 class="fw-bold mb-2">${a?`${e}: Velg format`:`${e} (${t})`}</h6>
        ${a}
        ${q(t,r,i)}
      </div>
    </div>`}function ae(e,t,n,r,i,o){let l=n.filter(e=>e.runde_eliminert==null),u=n.length,d=l.length,f=r===1?i?.[t]??null:null,p=f?.walkovers??0,m=(f?f.c3:d%3==0?d/3:0)+(f?f.c2:d%3==0?0:d/2),h=l.slice(p,p+m),g=l.slice(p+m,p+2*m),_=l.slice(p+2*m),v=document.createElement(`div`);v.className=`avsl-dialog-overlay`,document.body.appendChild(v);let y=null,b=!1,x=0,S=0;function C(e){if(!b)return;let t=v.querySelector(`.avsl-dialog-card-wide`);if(!t)return;let n=e.clientX-x,r=e.clientY-S;y={left:n,top:r},t.style.left=`${n}px`,t.style.top=`${r}px`}function E(){b&&(b=!1,document.body.style.userSelect=``)}document.addEventListener(`mousemove`,C),document.addEventListener(`mouseup`,E);function D(){document.removeEventListener(`mousemove`,C),document.removeEventListener(`mouseup`,E)}function O(e){return`<div class="d-flex justify-content-between gap-2 py-1">
      <span class="small">${a(e.navn??``)}</span>
      <span class="small text-muted text-nowrap">${e.kamp_poeng??0}p (${e.score_poeng??0})</span>
    </div>`}function k(n){let C=l.slice(0,p),E=C.length>0?`<div class="mb-3">
          <strong class="d-block mb-1">Walkovers (går vidare utan kamp):</strong>
          ${C.map(O).join(``)}
        </div>`:``,A=n&&m>0?`<div class="alert alert-info small mb-3 py-2">
          Dette er seedinggrupper, ikkje kampar. Spelarar i same gruppe kan ikkje trekkast mot kvarandre. Kampane blir oppretta når du klikkar «Bekreft og opprett kampar».
        </div>`:``,j=n&&m>0?`<div class="d-flex gap-3 flex-wrap mb-3">
          ${[{label:`Seeding 1`,pool:h},{label:`Seeding 2`,pool:g},..._.length?[{label:`Seeding 3`,pool:_}]:[]].map(({label:e,pool:t})=>`
            <div class="card flex-grow-1">
              <div class="card-body p-2">
                <strong class="d-block mb-2 small text-uppercase">${a(e)}</strong>
                ${t.map(O).join(``)}
              </div>
            </div>`).join(``)}
        </div>`:`<div class="avsl-player-columns mb-3">
          ${l.slice(p).map((e,t)=>`
            <div class="small d-flex justify-content-between gap-2">
              <span>${p+t+1}. ${a(e.navn??``)}</span>
              <span class="text-muted text-nowrap">${e.kamp_poeng??0}p (${e.score_poeng??0})</span>
            </div>`).join(``)}
        </div>`;v.innerHTML=`
      <div class="card avsl-dialog-card-wide">
        <div class="avsl-dialog-drag-handle">
          <p class="text-muted small text-uppercase fw-semibold mb-1">Trekning</p>
          <h5 class="mb-1">Gruppe ${a(t)} — Runde ${r}</h5>
          <p class="text-muted small mb-0">${d} av ${u} spelarar igjen</p>
        </div>
        <div class="avsl-dialog-body">
          <div class="form-check mb-2">
            <input class="form-check-input" type="checkbox" id="seeding-dlg" ${n?`checked`:``}>
            <label class="form-check-label" for="seeding-dlg">Bruk seeding</label>
          </div>
          ${A}
          ${E}
          ${j}
        </div>
        <div class="avsl-dialog-footer">
          <div class="d-flex gap-2">
            <button id="bekreft-gen-btn" class="btn btn-primary">Bekreft og opprett kampar</button>
            <button id="avbryt-gen-btn" class="btn btn-secondary">Avbryt</button>
          </div>
        </div>
      </div>`;let M=v.querySelector(`.avsl-dialog-card-wide`);y&&(M.style.position=`fixed`,M.style.left=`${y.left}px`,M.style.top=`${y.top}px`,M.style.margin=`0`,M.style.zIndex=`10000`),M.querySelector(`.avsl-dialog-drag-handle`).addEventListener(`mousedown`,e=>{let t=M.getBoundingClientRect();M.style.position=`fixed`,M.style.left=`${t.left}px`,M.style.top=`${t.top}px`,M.style.margin=`0`,M.style.zIndex=`10000`,x=e.clientX-t.left,S=e.clientY-t.top,y={left:t.left,top:t.top},b=!0,document.body.style.userSelect=`none`}),v.querySelector(`#seeding-dlg`).addEventListener(`change`,e=>k(e.target.checked)),v.querySelector(`#avbryt-gen-btn`).addEventListener(`click`,()=>{D(),v.remove()}),v.querySelector(`#bekreft-gen-btn`).addEventListener(`click`,async()=>{let n=v.querySelector(`#seeding-dlg`).checked,a=v.querySelector(`#bekreft-gen-btn`);a.disabled=!0,a.textContent=`Lagrer…`;try{let a=l.map((e,t)=>({kasterid:e.kasterid,plassering:t+1}));if(r===1){let r={A:i?.A??void 0,B:i?.B??void 0};await T(e,[{gruppeNavn:t,spelarar:a,runde1Oppsett:f}],n,i?r:null)}else await w(e,t,n,a);D(),v.remove(),await o()}catch(e){s(`cup:genererRunde`,e),c(`Feil ved generering av runde`,`error`),a.disabled=!1,a.textContent=`Bekreft og opprett kampar`}})}k(!0)}function oe(e,t,n,r){let i=t.map(e=>A(e,!1)),a=[],o=document.createElement(`div`);o.className=`avsl-dialog-overlay`,document.body.appendChild(o);function s(){let l=a.length===2?t.find(e=>!a.includes(e.rep.kasterid)):null;o.innerHTML=`
      <div class="card p-4 avsl-dialog-card">
        <h5 class="card-title mb-1">Bekreft 3-spelar kamp</h5>
        <p class="text-muted small mb-3">Vel dei to som går vidare. Den gjenverande er eliminert.</p>
        <div class="d-flex flex-column gap-2 mb-3">
          ${t.map((e,t)=>{let n=a.indexOf(e.rep.kasterid),r=n!==-1,o=!!l&&l.rep.kasterid===e.rep.kasterid,s=n===0?`1. plass`:n===1?`2. plass`:``;return`<button
              class="btn ${r?`btn-success`:o?`btn-outline-danger`:`btn-outline-secondary`} text-start d-flex justify-content-between align-items-center"
              data-kasterid="${e.rep.kasterid}"
              ${o?`disabled`:``}
            ><span>${i[t]}</span>${s?`<span class="badge bg-success-subtle text-success-emphasis">${s}</span>`:o?`<span class="badge bg-danger">Eliminert</span>`:``}</button>`}).join(``)}
        </div>
        <div class="d-flex gap-2">
          <button id="bekreft-tre-btn" class="btn btn-success" ${a.length===2?``:`disabled`}>Bekreft</button>
          <button id="avbryt-tre-btn" class="btn btn-secondary">Avbryt</button>
        </div>
      </div>
    `,o.querySelector(`#avbryt-tre-btn`).addEventListener(`click`,()=>o.remove()),o.querySelectorAll(`[data-kasterid]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=Number(e.dataset.kasterid),n=a.indexOf(t);n===-1?a.length<2&&a.push(t):a.splice(n,1),s()})}),o.querySelector(`#bekreft-tre-btn`)?.addEventListener(`click`,async()=>{if(a.length!==2)return;let i=t.find(e=>!a.includes(e.rep.kasterid))??null,s=a.map(e=>t.find(t=>t.rep.kasterid===e)).filter(e=>e!=null).map(e=>e.members.map(e=>e.kasterid)),l=t.flatMap(e=>e.members.map(e=>e.kasterid));o.remove();let{error:u}=await v({kampId:e.id,stevneId:n,rundeNummer:e.runde_nummer,rundeNavn:e.runde_navn,allKasterids:l,eliminertIds:i?.members.map(e=>e.kasterid)??[],vidareSider:s});if(u){c(`DB-feil ved bekreft`,`error`);return}await r()})}s()}function se(e){return typeof e!=`object`||!e||Array.isArray(e)?null:e}function ce(e){return e.map(e=>({er_bekreftet:e.er_bekreftet,er_walkover:e.er_walkover,runde_nummer:e.runde_nummer,bane_nummer:e.bane_nummer,spelarar:Y(e.spelarar)}))}function Y(e){return e.map(e=>({kasterid:e.kasterid??0,kamp_poeng:e.kamp_poeng??0,score_poeng:e.score_poeng??0,antall_ringer:e.antall_ringer,omgangar:e.omgangar,kaster:e.kaster}))}function le(e){let r=null,a=null,d=!1,f=new Set;async function m(e,{id:t,isAdmin:n=!1},i=null){a=i,d=n,r&&=(await S(r),null),e.replaceChildren(l(`Laster…`)),await h(e,t)}async function h(r,l){try{let[{data:s},{data:p},{data:m},{data:_},{count:v}]=await Promise.all([o(l),y(l),ne(l),R([`A`,`B`]),t(l)]);if(!s){r.replaceChildren(n(`Stevne ikkje funne.`));return}let b=m.filter(e=>e.kasterid!=null),x=p.filter(e=>e.fase===`innledende`),S=p.filter(e=>e.fase===`avsluttende`),C={},w={},T=new Map;for(let e of b)e.startnummer!=null&&(C[e.kasterid]=e.startnummer,T.set(e.startnummer,(T.get(e.startnummer)??0)+1)),e.posisjon!=null&&(w[e.kasterid]=e.posisjon);let E=[...T.values()].some(e=>e>1),D={};for(let e of p)for(let t of e.spelarar)t.kasterid&&t.kaster&&!D[t.kasterid]&&(D[t.kasterid]=`${t.kaster.fornavn} ${t.kaster.etternavn}`);let O=ce(x),A=te(O,b,D,C,w),N=x.length>0&&x.every(e=>e.er_bekreftet),F=S.length>0,z=b.some(e=>e.gruppe!=null),B=Object.fromEntries(_.map(e=>[e.navn,e.id])),U=se(s.runde1_format),W=v??0;if(s.kategori?.erlagbasert){let{data:e}=await k(l);W=e.length}let G={container:r,stevneid:l,stevne:s,stilling:A,startnrMap:C,posisjonMap:w,erLag:E,navnMap:D,innlKampar:x,avslKampar:S,resultat:b,isAdmin:d,harGruppefordeling:z,alleInnlBekrefta:N,harAvslKampar:F,runde1Format:U,unitCount:W,gruppeNavnMap:B,reload:()=>h(r,l)};d&&a&&(a.innerHTML=j(s,{alleInnlBekrefta:N,harAvslKampar:F,harGruppefordeling:z,harPrekonfigurertFormat:U!=null&&s.stevne_fase!==`avsluttende`}));let K=I(r);if(z){let t=M(A,O,C,{tableId:`stilling-avsl`,harGrupper:!0,harEliminasjon:!0,posisjonMap:w,unitLabel:E?`par`:`spelarar`});r.innerHTML=V(e.renderKamparHtml(G),t),ee(r,`stilling-avsl`,f),P(r),K===`stilling`&&H(r,`stilling`),e.bindKamparEvents(r,G),g(r,l)}else r.innerHTML=e.renderSetupHtml(G);a?.querySelector(`#fullfør-turnering-btn`)?.addEventListener(`click`,async()=>{if(!await u({title:`Fullfør turnering`,message:`Vil du fullføre turneringa? Dette kan ikkje angrast.`,danger:!0}))return;let{error:e}=await L(l,[...A.filter(e=>e.gruppe?.navn===`A`),...A.filter(e=>e.gruppe?.navn===`B`),...A.filter(e=>e.gruppe?.navn!==`A`&&e.gruppe?.navn!==`B`)]);if(e){c(`Feil ved lagring av plasseringar`,`error`);return}let{error:t}=await i(l);if(t){c(`Feil ved fullføring av turnering`,`error`);return}await h(r,l)}),e.bindHeaderEvents(a,G)}catch(e){s(`avsluttendeBase.lastOgVis`,e),r.replaceChildren(n(`Kunne ikkje laste avsluttande fase.`))}}function g(t,n){if(r)return;let i=F(n,[`avsluttende`],t,h,()=>{r&&=(S(r),null)});r=p(n,e.channelName(n),i)}return m}function X(e,t,n){return d(e.spelarar.filter(e=>e.kasterid!=null),t,n)}function Z(e){return e?.members.reduce((e,t)=>e+f(t),0)??0}var ue=le({channelName:e=>`stevne-avsl-cup-${e}`,renderKamparHtml:e=>{let{avslKampar:t,stilling:n,startnrMap:r,posisjonMap:i,erLag:a,isAdmin:o}=e;return`<div class="d-flex gap-3 flex-wrap">${[...new Set(n.map(e=>e.gruppe?.navn).filter(e=>e!=null))].sort().map(e=>{let s=t.filter(t=>t.gruppe_navn===e),c=n.filter(t=>t.gruppe?.navn===e),l=c.filter(e=>e.runde_eliminert==null).length,u=c.length,d=s.length?Math.max(...s.map(e=>e.runde_nummer)):0,f=s.filter(e=>e.runde_nummer===d),p=f.length>0&&f.every(e=>e.er_bekreftet||e.er_walkover),m=s.some(e=>e.runde_navn===`Semifinale`);return de(e,s,l,u,d,o&&(s.length===0||p)&&l>1&&!m,r,i,a?`par`:`spelarar`,o)}).join(``)}</div>`},bindKamparEvents:(e,t)=>{!t.isAdmin&&t.avslKampar.length===0||_e(e,t.stevneid,t.avslKampar,t.isAdmin,t.reload,t.startnrMap,t.posisjonMap)},renderSetupHtml:e=>{let{stevne:t,isAdmin:n,runde1Format:r,unitCount:i,stilling:a}=e,o=r?.nA??null;if(t.stevne_fase===`avsluttende`)return n?G(a,{visSpelarliste:!0,initNa:o,initFormat:r}):`<p class="text-muted fst-italic">Gruppefordeling er ikkje klar enno.</p>`;if(!n)return``;if(i<2)return`<p class="text-muted fst-italic">${t.kategori?.erlagbasert?`Minst 2 par må vere oppretta før gruppefordelinga kan setjast.`:`Minst 2 spelarar må vere påmelde før gruppefordelinga kan setjast.`}</p>`;let s=a.length>0;return G(s?a:i,{visSpelarliste:s,initNa:o,initFormat:r})},bindHeaderEvents:(t,n)=>{let{container:i,stevneid:a,stevne:o,stilling:s,resultat:l,runde1Format:d,alleInnlBekrefta:f,harGruppefordeling:p,gruppeNavnMap:m,reload:h}=n;if(t?.querySelector(`#start-avsl-btn`)?.addEventListener(`click`,async()=>{if(!f)return;let{error:e}=await r(a,`avsluttende`);if(e){c(`Feil ved oppstart av avsluttande fase`,`error`);return}if(d?.nA!=null){let e=d.nA,{error:t}=await N(a,Q(s,l,e,m.A??null,m.B??null));if(t){c(`Feil ved lagring av gruppefordeling`,`error`);return}}await h()}),!p){let t=parseInt(i.querySelector(`#gruppe-val-wrapper`)?.dataset.n??`0`)||s.length;function n(e,t){let n=i.querySelector(`input[name="${e}"]:checked`);if(n?.dataset.oppsett)try{return JSON.parse(n.dataset.oppsett)}catch{}return O(t)[0]??null}function r(e,t,n){let r=i.querySelector(`#gruppe-preview`);r&&(r.innerHTML=K(s.map((e,t)=>({...e,cupPlassering:t+1})),e,t?.walkovers??0,n?.walkovers??0))}let u=i.querySelector(`#gruppe-paneler`);u&&u.addEventListener(`change`,e=>{let a=e.target;if(!a.matches(`input[name^="runde1-format"]`))return;let o=parseInt(i.querySelector(`input[name="gruppe-split"]:checked`)?.value??String(t)),s=t-o,c=n(`runde1-format-a`,o),l=n(`runde1-format-b`,s);if(a.name===`runde1-format-a`){let e=i.querySelector(`#struktur-a`);e&&(e.outerHTML=q(o,c,`a`))}else{let e=i.querySelector(`#struktur-b`);e&&(e.outerHTML=q(s,l,`b`))}r(o,c,l)}),i.querySelectorAll(`input[name="gruppe-split"]`).forEach(e=>{e.addEventListener(`change`,()=>{let n=parseInt(e.value),i=t-n,a=O(n)[0]??null,o=i>=2?O(i)[0]??null:null;u&&(u.innerHTML=`<div id="gruppe-panel-a" class="avsl-gruppe-kol">
                ${J(`Gruppe A`,n,`runde1-format-a`,a)}
              </div>`+(i>=2?`<div id="gruppe-panel-b" class="avsl-gruppe-kol">
                ${J(`Gruppe B`,i,`runde1-format-b`,o)}
              </div>`:``)),r(n,a,o)})}),i.querySelector(`#bekreft-gruppe-btn`)?.addEventListener(`click`,async()=>{let r=i.querySelector(`input[name="gruppe-split"]:checked`);if(!r)return;let u=parseInt(r.value),d=t-u,{error:f}=await e(a,{A:n(`runde1-format-a`,u),B:d>=2?n(`runde1-format-b`,d):null,nA:u});if(f){c(`Feil ved lagring av format`,`error`);return}if(o.stevne_fase===`avsluttende`){let{error:e}=await N(a,Q(s,l,u,m.A??null,m.B??null));if(e){c(`Feil ved lagring av gruppefordeling`,`error`);return}}c(`Gruppefordeling lagra`,`success`),await h()})}t?.querySelector(`#endre-gruppeinndeling-btn`)?.addEventListener(`click`,async()=>{await u({title:`Tilbakestill gruppeinndeling`,message:`Gruppefordeling og format vert fjerna.`,danger:!0})&&(await Promise.all([z(a),e(a,null)]),await h())}),p&&i.querySelectorAll(`[data-generer-gruppe]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.genererGruppe??``,n=parseInt(e.dataset.runde??`1`);ae(a,t,s.filter(e=>e.gruppe?.navn===t),n,d,h)})})}});function Q(e,t,n,r,i){return e.flatMap((e,a)=>{let o=a<n?r:i??r,s=e.startnummer==null?[]:t.filter(t=>t.startnummer===e.startnummer).map(e=>e.kasterid);return(s.length?s:[e.kasterid]).map(e=>({kasterid:e,gruppeid:o}))})}function de(e,t,n,r,i,o,s,c,l,u=!0){let d=new Map;for(let e of t)d.has(e.runde_nummer)||d.set(e.runde_nummer,[]),d.get(e.runde_nummer).push(e);let f=[...d.entries()].reverse().map(([e,t])=>{let n=t[0]?.runde_navn??`Runde ${e}`,r=t.filter(e=>!e.er_walkover);return r.length?`
      <h6 class="fw-bold text-center mb-1">${a(n)}</h6>
      <div class="d-flex flex-wrap gap-2 mb-2">
        ${r.map(e=>ge(e,s,c,u)).join(``)}
      </div>`:``}).join(``),p=i+1,m=o?`<button class="btn btn-success w-100 mt-2"
         data-generer-gruppe="${a(e)}" data-runde="${p}">
         Generer runde ${p}
       </button>`:``;return`
    <div class="avsl-gruppe-kol">
      <h6 class="text-center fw-bold mb-2">Gruppe ${a(e)} (${r} ${a(l)})</h6>
      ${m}
      ${f}
    </div>`}function fe(e,t,n,r){let i=Z(t),a=i>0||r.bekrefta||r.harOmgangar?i:`—`,o=t.rep.kamp_plassering,s=e.er_bekreftet&&o!=null&&o>=n,c=e.er_bekreftet&&o!=null&&o<n,l=s?`kamp-eliminert`:c?`kamp-vidare`:``,u=`text-center fw-semibold avsl-score-cel${r.kanEndreScore?` score-redigerbar`:``}`,d=r.kanEndreScore?` data-endre-score="${e.id}"`:``;return`<tr${l?` class="${l}"`:``}>
    <td>${A(t,!1)}</td>
    <td class="${u}"${d}>${a}</td>
  </tr>`}function pe(e,t,n){return e.er_walkover?`<tr>
        <td colspan="2">${A(t[0]??null,!1)} <span class="badge bg-secondary">Walkover</span></td>
      </tr>`:t.map(r=>fe(e,r,t.length,n)).join(``)}function me(e,t,n,r){if(e.er_tre_spelarar)return{klass:r?`btn-secondary`:`btn-outline-secondary`,tekst:r?`Endre plassering`:`Sett plassering`,disabled:!1,ekstraKlass:``};let i=B(e,Y(t.map(e=>e.rep)),n);return{klass:r?`btn-secondary`:i?`btn-success`:`btn-outline-secondary`,tekst:r?`Bekreftet`:`Bekreft`,disabled:r||!i,ekstraKlass:` btn-bekreft`}}function he(e,t,n){return`<tr>
            <td colspan="2" class="text-end pe-1">
              ${!e.er_walkover&&!e.er_tre_spelarar?`<button class="btn btn-primary btn-sm" id="plus-${e.id}"${t?` disabled`:``}>+</button> `:``}
              ${t?``:`<button class="btn btn-secondary btn-sm" id="scoreboard-${e.id}">Score</button> `}
              <button class="btn ${n.klass} btn-sm${n.ekstraKlass}" id="bekrft-${e.id}"${n.disabled?` disabled`:``}>${n.tekst}</button>
            </td>
          </tr>`}function ge(e,t,n,r=!0){let i=X(e,t,n),a=e.er_bekreftet||e.er_walkover,o=e.spelarar.some(e=>(e.omgangar?.length??0)>0),s={bekrefta:a,harOmgangar:o,kanEndreScore:r&&e.er_bekreftet&&!e.er_tre_spelarar&&!o},c=r?he(e,a,me(e,i,o,a)):``;return`
    <div class="avsl-kamp-block">
      <div class="avsl-kamp-header">
        <span class="avsl-kamp-bane">Bane ${e.bane_nummer}</span>
        ${o&&!a?W():``}
      </div>
      <table class="table table-sm table-bordered mb-0">
        <tbody>
          ${pe(e,i,s)}
          ${c}
        </tbody>
      </table>
    </div>`}function _e(e,t,n,r,i,a,o){for(let l of n){let n=X(l,a,o),u=n[0]??null,d=n[1]??null,f=u?.rep??null,p=d?.rep??null,h=A(u,!1),_=A(d,!1),v=async(e,t)=>{let n=[];f?.id&&n.push(x(f.id,e)),p?.id&&n.push(x(p.id,t));for(let e of[u,d])for(let t of e?.members.slice(1)??[])n.push(x(t.id,0));try{return(await Promise.all(n)).find(e=>e.error)??null}catch(e){return s(`cup:skrivSideScore`,e),{error:e}}};if(e.querySelector(`#plus-${l.id}`)?.addEventListener(`click`,async()=>{U(h,_,Z(u),Z(d),async(e,t)=>{if(await v(e,t)){c(`DB-feil ved oppdatering av score`,`error`);return}await i()})}),e.querySelector(`#scoreboard-${l.id}`)?.addEventListener(`click`,()=>{window.open(`#/kamp/${l.id}`,`_blank`)}),e.querySelector(`#bekrft-${l.id}`)?.addEventListener(`click`,async e=>{if(l.er_tre_spelarar)oe(l,n,t,async()=>{await $(t,l),await i()});else{let r=e.currentTarget;r.disabled=!0,r.textContent=`Lagrer…`;try{await ve(t,l,n,i)||(r.disabled=!1,r.textContent=`Bekreft`)}catch{r.disabled=!1,r.textContent=`Bekreft`}}}),r&&l.er_bekreftet&&!l.er_tre_spelarar){let r=n.flatMap(e=>e.members.map(e=>e.kasterid)),a=()=>{U(h,_,Z(u),Z(d),async(e,a)=>{let o=n.flatMap(e=>e.members.map(e=>e.id));if(o.length){let{error:e}=await m(o);if(e){c(`DB-feil ved sletting av omgangar`,`error`);return}}if(await v(e,a)){c(`DB-feil ved oppdatering av score`,`error`);return}let s=e>=a?u:d,f=e>=a?d:u,p=s?.members.map(e=>e.kasterid)??[],h=f?.members.map(e=>e.kasterid)??[],_=[...p.map(e=>({kasterid:e,plassering:1})),...h.map(e=>({kasterid:e,plassering:2}))],{error:y}=await b(l.id,_);if(y){c(`DB-feil ved oppdatering av plassering`,`error`);return}await g({stevneId:t,rundeNummer:l.runde_nummer,rundeNavn:l.runde_navn,allKasterids:r,nyVinnarIds:p,nyTaparIds:h}),await i()})};e.querySelectorAll(`[data-endre-score="${l.id}"]`).forEach(e=>e.addEventListener(`click`,a))}}}async function ve(e,t,n,r){let i=n[0]??null,a=n[1]??null,{data:o}=await _(t.id),s=e=>e?.members.reduce((e,t)=>e+f(o.find(e=>e.id===t.id)??t),0)??0,l=s(i),d=s(a);if(l===0&&d===0&&!await u({title:`Ingen score registrert`,message:`Vil du bekrefte kampen likevel?`}))return!1;let p=l>=d?i:a,m=l>=d?a:i,h=n.flatMap(e=>e.members.map(e=>e.kasterid)),{error:g}=await v({kampId:t.id,stevneId:e,rundeNummer:t.runde_nummer,rundeNavn:t.runde_navn,allKasterids:h,eliminertIds:m?.members.map(e=>e.kasterid)??[],vidareSider:p?[p.members.map(e=>e.kasterid)]:[]});return g?(c(`DB-feil ved bekreft`,`error`),!1):(await $(e,t),await r(),!0)}async function $(e,t){t.runde_navn!==`Semifinale`||!t.gruppe_navn||await h(e,t.gruppe_navn)&&await D(e,t.gruppe_navn)}export{ue as render};