import{B as e,D as t,G as n,L as r,V as i,W as a,b as o,nt as s,t as c}from"./index-DBpCd5l1.js";import{t as l}from"./LoadingState-RVZNML7E.js";import{t as u}from"./ConfirmDialog-DNGrXiEY.js";import{i as d}from"./kamp-CpbenSSn.js";import{C as f,S as p,a as m,b as h,f as g,n as _,s as v,x as y,y as b}from"./kampService-BhvBB1aA.js";import{t as x}from"./realtime-Du29nLXl.js";import{a as S,i as C,n as w,o as T,r as E,s as D}from"./kampGenereringCupService-Bdqy8nJV.js";import{_ as O,b as k,c as A,d as j,f as M,g as N,h as P,l as F,n as I,p as L,r as R,t as z,u as B,v as V,x as H}from"./resultatService-063NuPR7.js";import{n as U,t as W}from"./LivePill-C1AxE8Dw.js";function G(e,{visSpelarliste:t=!0,initNa:n=null,initFormat:r=null}={}){let i=typeof e==`number`?e:e.length,a=typeof e==`number`?[]:e.map((e,t)=>({...e,cupPlassering:t+1})),o=T(i),s=n===i?i:n!=null&&o.some(e=>e.nA===n)?n:o[0]?.nA??i,c=i-s,l=o.filter(e=>D(e.nA).some(e=>e.c3>0)),u=o.filter(e=>!D(e.nA).some(e=>e.c3>0)),d=D(i).length>0,f=(e,t)=>e.map((e,r)=>{let a=e.nA===s&&n!==i,o=t+r;return`
      <div class="form-check">
        <input class="form-check-input" type="radio" name="gruppe-split" id="split-${o}" value="${e.nA}" ${a?`checked`:``}>
        <label class="form-check-label" for="split-${o}">A:${e.nA} — B:${e.nB}</label>
      </div>`}).join(``),p=[];l.length&&p.push(`<div class="text-muted small fw-semibold mb-1">3 spillere per bane (A)</div>${f(l,0)}`),u.length&&(p.length&&p.push(`<hr class="my-2">`),p.push(`<div class="text-muted small fw-semibold mb-1">2 spillere per bane (A)</div>${f(u,l.length)}`)),d&&(p.length&&p.push(`<hr class="my-2">`),p.push(`
      <div class="form-check">
        <input class="form-check-input" type="radio" name="gruppe-split" id="split-ingen" value="${i}" ${n===i?`checked`:``}>
        <label class="form-check-label" for="split-ingen">Ingen gruppeinndeling (alle i A)</label>
      </div>`));let m=p.join(``),h=r?.A??D(s)[0]??null,g=c>=2?r?.B??D(c)[0]??null:null,_=t?`<div id="gruppe-preview">${K(a,s,h?.walkovers??0,g?.walkovers??0)}</div>`:``;return`
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
            ${X(`Gruppe A`,s,`runde1-format-a`,h)}
          </div>
          ${c>=2?`<div id="gruppe-panel-b" class="avsl-gruppe-kol">
            ${X(`Gruppe B`,c,`runde1-format-b`,g)}
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
    </div>`}function q(e){let t=e.c3>0?3:2;return`${e.walkovers} walkover - ${t} deltakere per bane`}function J(e,t,n,r=null){let i=D(t);return i.length<=1?``:`<div class="d-flex flex-column align-items-start gap-1 mb-2">${i.map((e,t)=>{let i=`${n}-${t}`,a=JSON.stringify(e),o=r?e.walkovers===r.walkovers&&e.c3===r.c3&&e.c2===r.c2:t===0,s=e.c3>0?`btn-outline-success`:`btn-outline-warning`;return`
      <input type="radio" class="btn-check" name="${n}" id="${i}"
        value='${a}' data-oppsett='${a}' autocomplete="off" ${o?`checked`:``}>
      <label class="btn btn-sm ${s}" for="${i}">${q(e)}</label>`}).join(``)}</div>`}function Y(e,t,n){return`<div id="struktur-${n}">
    <table class="table table-sm table-bordered mb-0">
      <thead><tr>
        <th>Runde</th><th>Deltakere (w.o.)</th><th>Baner</th><th>Per bane</th>
      </tr></thead>
      <tbody>${(e>=2?S(e,{runde1:t}):[]).map((e,n)=>{let r=e.walkovers??0,i=e.spelarar-r,a=r>0?`${i} <span class="text-muted">(${r} w.o.)</span>`:`${i}`,o;return o=n===0&&t?t.c3>0&&t.c2>0?`2/3`:t.c3>0?`3`:`2`:e.spelarar%e.baner===0?String(e.spelarar/e.baner):`2/3`,`<tr${e.treSpelarar?` class="fw-bold"`:``}>
      <td>${e.runde}</td>
      <td>${a}</td>
      <td>${e.baner}</td>
      <td>${o}</td>
    </tr>`}).join(``)}</tbody>
    </table>
  </div>`}function X(e,t,n,r){let i=n.slice(-1),a=J(e,t,n,r);return`
    <div class="card">
      <div class="card-body">
        <h6 class="fw-bold mb-2">${a?`${e}: Velg format`:`${e} (${t})`}</h6>
        ${a}
        ${Y(t,r,i)}
      </div>
    </div>`}function Z(e,t,n,r,i,o){let l=n.filter(e=>e.runde_eliminert==null),u=n.length,d=l.length,f=r===1?i?.[t]??null:null,p=f?.walkovers??0,m=(f?f.c3:d%3==0?d/3:0)+(f?f.c2:d%3==0?0:d/2),h=l.slice(p,p+m),g=l.slice(p+m,p+2*m),_=l.slice(p+2*m),v=document.createElement(`div`);v.className=`avsl-dialog-overlay`,document.body.appendChild(v);let y=null,b=!1,x=0,S=0;function T(e){if(!b)return;let t=v.querySelector(`.avsl-dialog-card-wide`);if(!t)return;let n=e.clientX-x,r=e.clientY-S;y={left:n,top:r},t.style.left=`${n}px`,t.style.top=`${r}px`}function E(){b&&(b=!1,document.body.style.userSelect=``)}document.addEventListener(`mousemove`,T),document.addEventListener(`mouseup`,E);function D(){document.removeEventListener(`mousemove`,T),document.removeEventListener(`mouseup`,E)}function O(e){return`<div class="d-flex justify-content-between gap-2 py-1">
      <span class="small">${a(e.navn??``)}</span>
      <span class="small text-muted text-nowrap">${e.kamp_poeng??0}p (${e.score_poeng??0})</span>
    </div>`}function k(n){let T=l.slice(0,p),E=T.length>0?`<div class="mb-3">
          <strong class="d-block mb-1">Walkovers (går vidare utan kamp):</strong>
          ${T.map(O).join(``)}
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
      </div>`;let M=v.querySelector(`.avsl-dialog-card-wide`);y&&(M.style.position=`fixed`,M.style.left=`${y.left}px`,M.style.top=`${y.top}px`,M.style.margin=`0`,M.style.zIndex=`10000`),M.querySelector(`.avsl-dialog-drag-handle`).addEventListener(`mousedown`,e=>{let t=M.getBoundingClientRect();M.style.position=`fixed`,M.style.left=`${t.left}px`,M.style.top=`${t.top}px`,M.style.margin=`0`,M.style.zIndex=`10000`,x=e.clientX-t.left,S=e.clientY-t.top,y={left:t.left,top:t.top},b=!0,document.body.style.userSelect=`none`}),v.querySelector(`#seeding-dlg`).addEventListener(`change`,e=>k(e.target.checked)),v.querySelector(`#avbryt-gen-btn`).addEventListener(`click`,()=>{D(),v.remove()}),v.querySelector(`#bekreft-gen-btn`).addEventListener(`click`,async()=>{let n=v.querySelector(`#seeding-dlg`).checked,a=v.querySelector(`#bekreft-gen-btn`);a.disabled=!0,a.textContent=`Lagrer…`;try{let a=l.map((e,t)=>({kasterid:e.kasterid,plassering:t+1}));if(r===1){let r={A:i?.A??void 0,B:i?.B??void 0};await w(e,[{gruppeNavn:t,spelarar:a,runde1Oppsett:f}],n,i?r:null)}else await C(e,t,n,a);D(),v.remove(),await o()}catch(e){s(`cup:genererRunde`,e),c(`Feil ved generering av runde`,`error`),a.disabled=!1,a.textContent=`Bekreft og opprett kampar`}})}k(!0)}function Q(e,t,n,r){let i=t.map(e=>e?.kaster?`${a(e.kaster.fornavn)} ${a(e.kaster.etternavn)}`:`Spelar ?`),o=[],s=document.createElement(`div`);s.className=`avsl-dialog-overlay`,document.body.appendChild(s);function l(){let a=o.length===2?t.find(e=>e.kasterid!=null&&!o.includes(e.kasterid)):null;s.innerHTML=`
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
    `,s.querySelector(`#avbryt-tre-btn`).addEventListener(`click`,()=>s.remove()),s.querySelectorAll(`[data-kasterid]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=Number(e.dataset.kasterid),n=o.indexOf(t);n===-1?o.length<2&&o.push(t):o.splice(n,1),l()})}),s.querySelector(`#bekreft-tre-btn`)?.addEventListener(`click`,async()=>{if(o.length!==2)return;let i=t.find(e=>e.kasterid!=null&&!o.includes(e.kasterid))?.kasterid??null,a=t.map(e=>e.kasterid).filter(e=>e!=null);s.remove();let{error:l}=await _({kampId:e.id,stevneId:n,rundeNummer:e.runde_nummer,rundeNavn:e.runde_navn,allKasterids:a,eliminertId:i,vidareIds:[...o]});if(l){c(`DB-feil ved bekreft`,`error`);return}await r()})}l()}function ee(e){return typeof e!=`object`||!e||Array.isArray(e)?null:e}function te(e){return e.map(e=>({er_bekreftet:e.er_bekreftet,er_walkover:e.er_walkover,runde_nummer:e.runde_nummer,bane_nummer:e.bane_nummer,spelarar:ne(e.spelarar)}))}function ne(e){return e.map(e=>({kasterid:e.kasterid??0,kamp_poeng:e.kamp_poeng??0,score_poeng:e.score_poeng??0,antall_ringer:e.antall_ringer,omgangar:e.omgangar,kaster:e.kaster}))}function re(e){let r=null,a=null,d=!1,p=new Set;async function m(e,{id:t,isAdmin:n=!1},i=null){a=i,d=n,r&&=(await x(r),null),e.replaceChildren(l(`Laster…`)),await h(e,t)}async function h(r,l){try{let[{data:s},{data:f},{data:m},{data:_},{count:y}]=await Promise.all([o(l),v(l),R(l),I([`A`,`B`]),t(l)]);if(!s){r.replaceChildren(n(`Stevne ikkje funne.`));return}let b=m.filter(e=>e.kasterid!=null),x=f.filter(e=>e.fase===`innledende`),S=f.filter(e=>e.fase===`avsluttende`),C={};for(let e of b)e.startnummer!=null&&(C[e.kasterid]=e.startnummer);let w={};for(let e of f)for(let t of e.spelarar)t.kasterid&&t.kaster&&!w[t.kasterid]&&(w[t.kasterid]=`${t.kaster.fornavn} ${t.kaster.etternavn}`);let T=te(x),E=L(T,b,w,C),D=x.length>0&&x.every(e=>e.er_bekreftet),A=S.length>0,N=b.some(e=>e.gruppe!=null),z=Object.fromEntries(_.map(e=>[e.navn,e.id])),B=ee(s.runde1_format),U={container:r,stevneid:l,stevne:s,stilling:E,startnrMap:C,navnMap:w,innlKampar:x,avslKampar:S,resultat:b,isAdmin:d,harGruppefordeling:N,alleInnlBekrefta:D,harAvslKampar:A,runde1Format:B,pameldingCount:y??0,gruppeNavnMap:z,reload:()=>h(r,l)};d&&a&&(a.innerHTML=O(s,{alleInnlBekrefta:D,harAvslKampar:A,harGruppefordeling:N,harPrekonfigurertFormat:B!=null&&s.stevne_fase!==`avsluttende`}));let W=P(r);if(N){let t=k(E,T,C,{tableId:`stilling-avsl`,harGrupper:!0,harEliminasjon:!0});r.innerHTML=V(e.renderKamparHtml(U),t),j(r,`stilling-avsl`,p),M(r),W===`stilling`&&H(r,`stilling`),e.bindKamparEvents(r,U),g(r,l)}else r.innerHTML=e.renderSetupHtml(U);a?.querySelector(`#fullfør-turnering-btn`)?.addEventListener(`click`,async()=>{if(!await u({title:`Fullfør turnering`,message:`Vil du fullføre turneringa? Dette kan ikkje angrast.`,danger:!0}))return;let{error:e}=await F(l,[...E.filter(e=>e.gruppe?.navn===`A`),...E.filter(e=>e.gruppe?.navn===`B`),...E.filter(e=>e.gruppe?.navn!==`A`&&e.gruppe?.navn!==`B`)]);if(e){c(`Feil ved lagring av plasseringar`,`error`);return}let{error:t}=await i(l);if(t){c(`Feil ved fullføring av turnering`,`error`);return}await h(r,l)}),e.bindHeaderEvents(a,U)}catch(e){s(`avsluttendeBase.lastOgVis`,e),r.replaceChildren(n(`Kunne ikkje laste avsluttande fase.`))}}function g(t,n){if(r)return;let i=N(n,[`avsluttende`],t,h,()=>{r&&=(x(r),null)});r=f(n,e.channelName(n),i)}return m}var ie=re({channelName:e=>`stevne-avsl-cup-${e}`,renderKamparHtml:e=>{let{avslKampar:t,stilling:n,startnrMap:r,isAdmin:i}=e;return`<div class="d-flex gap-3 flex-wrap">${[...new Set(n.map(e=>e.gruppe?.navn).filter(e=>e!=null))].sort().map(e=>{let a=t.filter(t=>t.gruppe_navn===e),o=n.filter(t=>t.gruppe?.navn===e),s=o.filter(e=>e.runde_eliminert==null).length,c=o.length,l=a.length?Math.max(...a.map(e=>e.runde_nummer)):0,u=a.filter(e=>e.runde_nummer===l),d=u.length>0&&u.every(e=>e.er_bekreftet||e.er_walkover),f=a.some(e=>e.runde_navn===`Semifinale`);return ae(e,a,s,c,l,i&&(a.length===0||d)&&s>1&&!f,r,i)}).join(``)}</div>`},bindKamparEvents:(e,t)=>{!t.isAdmin&&t.avslKampar.length===0||ce(e,t.stevneid,t.avslKampar,t.isAdmin,t.reload,t.startnrMap)},renderSetupHtml:e=>{let{stevne:t,isAdmin:n,runde1Format:r,pameldingCount:i,stilling:a}=e,o=r?.nA??null;if(t.stevne_fase===`avsluttende`)return n?G(a,{visSpelarliste:!0,initNa:o,initFormat:r}):`<p class="text-muted fst-italic">Gruppefordeling er ikkje klar enno.</p>`;if(i>0&&n){let e=a.length>0;return G(e?a:i,{visSpelarliste:e,initNa:o,initFormat:r})}return``},bindHeaderEvents:(t,n)=>{let{container:i,stevneid:a,stevne:o,stilling:s,runde1Format:l,alleInnlBekrefta:d,harGruppefordeling:f,gruppeNavnMap:p,reload:m}=n;if(t?.querySelector(`#start-avsl-btn`)?.addEventListener(`click`,async()=>{if(!d)return;let{error:e}=await r(a,`avsluttende`);if(e){c(`Feil ved oppstart av avsluttande fase`,`error`);return}if(l?.nA!=null){let e=l.nA,t=p.A??null,n=p.B??null,{error:r}=await A(a,s.map((r,i)=>({kasterid:r.kasterid,gruppeid:i<e?t:n??t})));if(r){c(`Feil ved lagring av gruppefordeling`,`error`);return}}await m()}),!f){let t=parseInt(i.querySelector(`#gruppe-val-wrapper`)?.dataset.n??`0`)||s.length;function n(e,t){let n=i.querySelector(`input[name="${e}"]:checked`);if(n?.dataset.oppsett)try{return JSON.parse(n.dataset.oppsett)}catch{}return D(t)[0]??null}let r=i.querySelector(`#gruppe-paneler`);r&&r.addEventListener(`change`,e=>{let r=e.target;if(!r.matches(`input[name^="runde1-format"]`))return;let a=parseInt(i.querySelector(`input[name="gruppe-split"]:checked`)?.value??String(t)),o=t-a,c=n(`runde1-format-a`,a),l=n(`runde1-format-b`,o);if(r.name===`runde1-format-a`){let e=i.querySelector(`#struktur-a`);e&&(e.outerHTML=Y(a,c,`a`))}else{let e=i.querySelector(`#struktur-b`);e&&(e.outerHTML=Y(o,l,`b`))}let u=c?.walkovers??0,d=l?.walkovers??0,f=i.querySelector(`#gruppe-preview`);f&&(f.innerHTML=K(s.map((e,t)=>({...e,cupPlassering:t+1})),a,u,d))}),i.querySelectorAll(`input[name="gruppe-split"]`).forEach(e=>{e.addEventListener(`change`,()=>{let n=parseInt(e.value),a=t-n,o=D(n)[0]??null,c=a>=2?D(a)[0]??null:null;r&&(r.innerHTML=`<div id="gruppe-panel-a" class="avsl-gruppe-kol">
                ${X(`Gruppe A`,n,`runde1-format-a`,o)}
              </div>`+(a>=2?`<div id="gruppe-panel-b" class="avsl-gruppe-kol">
                ${X(`Gruppe B`,a,`runde1-format-b`,c)}
              </div>`:``));let l=o?.walkovers??0,u=c?.walkovers??0,d=i.querySelector(`#gruppe-preview`);d&&(d.innerHTML=K(s.map((e,t)=>({...e,cupPlassering:t+1})),n,l,u))})}),i.querySelector(`#bekreft-gruppe-btn`)?.addEventListener(`click`,async()=>{let r=i.querySelector(`input[name="gruppe-split"]:checked`);if(!r)return;let l=parseInt(r.value),u=t-l,{error:d}=await e(a,{A:n(`runde1-format-a`,l),B:u>=2?n(`runde1-format-b`,u):null,nA:l});if(d){c(`Feil ved lagring av format`,`error`);return}if(o.stevne_fase===`avsluttende`){let e=p.A??null,t=p.B??null,{error:n}=await A(a,s.map((n,r)=>({kasterid:n.kasterid,gruppeid:r<l?e:t??e})));if(n){c(`Feil ved lagring av gruppefordeling`,`error`);return}}c(`Gruppefordeling lagra`,`success`),await m()})}t?.querySelector(`#endre-gruppeinndeling-btn`)?.addEventListener(`click`,async()=>{await u({title:`Tilbakestill gruppeinndeling`,message:`Gruppefordeling og format vert fjerna.`,danger:!0})&&(await Promise.all([z(a),e(a,null)]),await m())}),f&&i.querySelectorAll(`[data-generer-gruppe]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.genererGruppe??``,n=parseInt(e.dataset.runde??`1`);Z(a,t,s.filter(e=>e.gruppe?.navn===t),n,l,m)})})}});function ae(e,t,n,r,i,o,s,c=!0){let l=new Map;for(let e of t)l.has(e.runde_nummer)||l.set(e.runde_nummer,[]),l.get(e.runde_nummer).push(e);let u=[...l.entries()].reverse().map(([e,t])=>{let n=t[0]?.runde_navn??`Runde ${e}`,r=t.filter(e=>!e.er_walkover);return r.length?`
      <h6 class="fw-bold text-center mb-1">${a(n)}</h6>
      <div class="d-flex flex-wrap gap-2 mb-2">
        ${r.map(e=>oe(e,s,c)).join(``)}
      </div>`:``}).join(``),d=i+1,f=o?`<button class="btn btn-success w-100 mt-2"
         data-generer-gruppe="${a(e)}" data-runde="${d}">
         Generer runde ${d}
       </button>`:``;return`
    <div class="avsl-gruppe-kol">
      <h6 class="text-center fw-bold mb-2">Gruppe ${a(e)} (${r} spelarar)</h6>
      ${f}
      ${u}
    </div>`}function oe(e,t,n=!0){let r=e.spelarar.slice().sort((e,n)=>(t[e.kasterid??0]??999)-(t[n.kasterid??0]??999)),i=e=>e?.kaster?`${a(e.kaster.fornavn)} ${a(e.kaster.etternavn)}`:`—`,o=e.er_bekreftet||e.er_walkover,s=r.some(e=>(e.omgangar?.length??0)>0),c=s&&!o,l=n&&e.er_bekreftet&&!e.er_tre_spelarar&&!s,u=e.er_walkover?`<tr>
        <td colspan="2">${i(r[0])} <span class="badge bg-secondary">Walkover</span></td>
      </tr>`:r.map(t=>{let n=d(t),a=n>0||o||s?n:`—`,c=r.length,u=e.er_bekreftet&&t.kamp_plassering!=null&&t.kamp_plassering>=c,f=e.er_bekreftet&&t.kamp_plassering!=null&&t.kamp_plassering<c,p=u?`kamp-eliminert`:f?`kamp-vidare`:``,m=`text-center fw-semibold avsl-score-cel${l?` score-redigerbar`:``}`,h=l?` data-endre-score="${e.id}"`:``;return`<tr${p?` class="${p}"`:``}>
          <td>${i(t)}</td>
          <td class="${m}"${h}>${a}</td>
        </tr>`}).join(``),f,p,m,h;if(e.er_tre_spelarar)f=o?`btn-secondary`:`btn-outline-secondary`,p=o?`Endre plassering`:`Sett plassering`,m=!1,h=``;else{let t=B(e,se(r),s);f=o?`btn-secondary`:t?`btn-success`:`btn-outline-secondary`,p=o?`Bekreftet`:`Bekreft`,m=o||!t,h=` btn-bekreft`}let g=c?W():``,_=n?`<tr>
            <td colspan="2" class="text-end pe-1">
              ${!e.er_walkover&&!e.er_tre_spelarar?`<button class="btn btn-primary btn-sm" id="plus-${e.id}"${o?` disabled`:``}>+</button> `:``}
              ${o?``:`<button class="btn btn-secondary btn-sm" id="scoreboard-${e.id}">Score</button> `}
              <button class="btn ${f} btn-sm${h}" id="bekrft-${e.id}"${m?` disabled`:``}>${p}</button>
            </td>
          </tr>`:``;return`
    <div class="avsl-kamp-block">
      <div class="avsl-kamp-header">
        <span class="avsl-kamp-bane">Bane ${e.bane_nummer}</span>
        ${g}
      </div>
      <table class="table table-sm table-bordered mb-0">
        <tbody>
          ${u}
          ${_}
        </tbody>
      </table>
    </div>`}function se(e){return e.map(e=>({kasterid:e.kasterid??0,kamp_poeng:e.kamp_poeng??0,score_poeng:e.score_poeng??0,antall_ringer:e.antall_ringer,omgangar:e.omgangar,kaster:e.kaster}))}function ce(e,t,n,r,i,a){for(let o of n){let n=o.spelarar.slice().sort((e,t)=>(a[e.kasterid??0]??1/0)-(a[t.kasterid??0]??1/0));if(e.querySelector(`#plus-${o.id}`)?.addEventListener(`click`,async()=>{let e=n[0],t=n[1];U(e?.kaster?`${e.kaster.fornavn} ${e.kaster.etternavn}`:`—`,t?.kaster?`${t.kaster.fornavn} ${t.kaster.etternavn}`:`—`,d(e),d(t),async(n,r)=>{let a=[];e?.id&&a.push(b(e.id,n)),t?.id&&a.push(b(t.id,r)),await Promise.all(a),await i()})}),e.querySelector(`#scoreboard-${o.id}`)?.addEventListener(`click`,()=>{window.open(`#/kamp/${o.id}`,`_blank`)}),e.querySelector(`#bekrft-${o.id}`)?.addEventListener(`click`,async e=>{if(o.er_tre_spelarar)Q(o,n,t,async()=>{await $(t,o),await i()});else{let r=e.currentTarget;r.disabled=!0,r.textContent=`Lagrer…`;try{await le(t,o,n,i)||(r.disabled=!1,r.textContent=`Bekreft`)}catch{r.disabled=!1,r.textContent=`Bekreft`}}}),r&&o.er_bekreftet&&!o.er_tre_spelarar){let r=n[0],a=n[1],s=r?.kaster?`${r.kaster.fornavn} ${r.kaster.etternavn}`:`—`,l=a?.kaster?`${a.kaster.fornavn} ${a.kaster.etternavn}`:`—`,u=n.map(e=>e.kasterid).filter(e=>e!=null),f=()=>{U(s,l,d(r),d(a),async(e,n)=>{let s=[r?.id,a?.id].filter(e=>e!=null);if(s.length){let{error:e}=await p(s);if(e){c(`DB-feil ved sletting av omgangar`,`error`);return}}let l=[];if(r?.id&&l.push(b(r.id,e)),a?.id&&l.push(b(a.id,n)),(await Promise.all(l)).find(e=>e.error)?.error){c(`DB-feil ved oppdatering av score`,`error`);return}let d=e>=n?r?.kasterid:a?.kasterid,f=e>=n?a?.kasterid:r?.kasterid,m=[];d!=null&&m.push({kasterid:d,plassering:1}),f!=null&&m.push({kasterid:f,plassering:2});let{error:g}=await y(o.id,m);if(g){c(`DB-feil ved oppdatering av plassering`,`error`);return}await h({stevneId:t,rundeNummer:o.runde_nummer,rundeNavn:o.runde_navn,allKasterids:u,nyVinnarId:d,nyTaparId:f}),await i()})};e.querySelectorAll(`[data-endre-score="${o.id}"]`).forEach(e=>e.addEventListener(`click`,f))}}}async function le(e,t,n,r){let i=n[0],a=n[1],{data:o}=await g(t.id),s=o.find(e=>e.id===i?.id),l=o.find(e=>e.id===a?.id),f=d(s??i),p=d(l??a);if(f===0&&p===0&&!await u({title:`Ingen score registrert`,message:`Vil du bekrefte kampen likevel?`}))return!1;let m=f>=p?i:a,h=f>=p?a:i,v=n.map(e=>e.kasterid).filter(e=>e!=null),y=m?.kasterid==null?[]:[m.kasterid],{error:b}=await _({kampId:t.id,stevneId:e,rundeNummer:t.runde_nummer,rundeNavn:t.runde_navn,allKasterids:v,eliminertId:h?.kasterid??null,vidareIds:y});return b?(c(`DB-feil ved bekreft`,`error`),!1):(await $(e,t),await r(),!0)}async function $(e,t){t.runde_navn!==`Semifinale`||!t.gruppe_navn||await m(e,t.gruppe_navn)&&await E(e,t.gruppe_navn)}export{ie as render};