import{t as e}from"./logError-DhxY2JQv.js";import{G as t,H as n,J as r,K as i,M as a,X as o,Y as s,_ as c,f as l,v as u,w as d}from"./index-C7fZNAx-.js";import{t as f}from"./LoadingState-xRmJ3K_t.js";import{C as p,N as m,S as h,a as g,b as _,f as v,k as y,n as b,s as x,x as S,y as C}from"./kampService-Cdqslr0w.js";import{t as w}from"./realtime-NvcShmho.js";import{a as T,i as E,n as D,o as O,r as k,s as A}from"./kampGenereringCupService-BfjHEMX1.js";import{S as j,_ as M,b as ee,c as N,d as te,f as ne,g as P,h as F,l as I,n as L,p as R,r as re,t as z,u as B,v as ie,x as ae}from"./resultatService-DjQb2HvJ.js";import{t as V}from"./ScoreNumberpad-DfwYrTN0.js";function H(e,{visSpelarliste:t=!0,initNa:n=null,initFormat:r=null}={}){let i=typeof e==`number`?e:e.length,a=typeof e==`number`?[]:e.map((e,t)=>({...e,cupPlassering:t+1})),o=O(i),s=n===i?i:n!=null&&o.some(e=>e.nA===n)?n:o[0]?.nA??i,c=i-s,l=o.filter(e=>A(e.nA).some(e=>e.c3>0)),u=o.filter(e=>!A(e.nA).some(e=>e.c3>0)),d=A(i).length>0,f=(e,t)=>e.map((e,r)=>{let a=e.nA===s&&n!==i,o=t+r;return`
      <div class="form-check">
        <input class="form-check-input" type="radio" name="gruppe-split" id="split-${o}" value="${e.nA}" ${a?`checked`:``}>
        <label class="form-check-label" for="split-${o}">A:${e.nA} — B:${e.nB}</label>
      </div>`}).join(``),p=[];l.length&&p.push(`<div class="text-muted small fw-semibold mb-1">3 spillere per bane (A)</div>${f(l,0)}`),u.length&&(p.length&&p.push(`<hr class="my-2">`),p.push(`<div class="text-muted small fw-semibold mb-1">2 spillere per bane (A)</div>${f(u,l.length)}`)),d&&(p.length&&p.push(`<hr class="my-2">`),p.push(`
      <div class="form-check">
        <input class="form-check-input" type="radio" name="gruppe-split" id="split-ingen" value="${i}" ${n===i?`checked`:``}>
        <label class="form-check-label" for="split-ingen">Ingen gruppeinndeling (alle i A)</label>
      </div>`));let m=p.join(``),h=r?.A??A(s)[0]??null,g=c>=2?r?.B??A(c)[0]??null:null,_=t?`<div id="gruppe-preview">${U(a,s,h?.walkovers??0,g?.walkovers??0)}</div>`:``;return`
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
            ${q(`Gruppe A`,s,`runde1-format-a`,h)}
          </div>
          ${c>=2?`<div id="gruppe-panel-b" class="avsl-gruppe-kol">
            ${q(`Gruppe B`,c,`runde1-format-b`,g)}
          </div>`:``}
        </div>
      </div>
      <div class="mt-3">
        <button id="bekreft-gruppe-btn" class="btn btn-success btn-lg w-100">Bekreft gruppefordeling</button>
      </div>
      ${_}
    </div>
  `}function U(e,t,n=0,r=0){let i=e.slice(0,t),a=e.slice(t);function o(e,t=0){return e.map((e,n)=>{let r=n<t;return`
      <tr>
        <td>${e.cupPlassering}</td>
        <td>${s(String(e.startnummer??``))}</td>
        <td>${s(e.navn??``)}${r?` <span class="badge bg-info text-dark">Walkover</span>`:``}</td>
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
      <tbody>${o(i,n)}</tbody>
    </table>`,u=a.length?`
    <table class="table table-bordered table-sm bg-white mb-0">
      ${c}
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
      <label class="btn btn-sm ${s}" for="${i}">${W(e)}</label>`}).join(``)}</div>`}function K(e,t,n){return`<div id="struktur-${n}">
    <table class="table table-sm table-bordered mb-0">
      <thead><tr>
        <th>Runde</th><th>Deltakere (w.o.)</th><th>Baner</th><th>Per bane</th>
      </tr></thead>
      <tbody>${(e>=2?T(e,{runde1:t}):[]).map((e,n)=>{let r=e.walkovers??0,i=e.spelarar-r,a=r>0?`${i} <span class="text-muted">(${r} w.o.)</span>`:`${i}`,o;return o=n===0&&t?t.c3>0&&t.c2>0?`2/3`:t.c3>0?`3`:`2`:e.spelarar%e.baner===0?String(e.spelarar/e.baner):`2/3`,`<tr${e.treSpelarar?` class="fw-bold"`:``}>
      <td>${e.runde}</td>
      <td>${a}</td>
      <td>${e.baner}</td>
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
    </div>`}function oe(t,n,r,i,a,o){let l=r.filter(e=>e.runde_eliminert==null),u=r.length,d=l.length,f=i===1?a?.[n]??null:null,p=f?.walkovers??0,m=(f?f.c3:d%3==0?d/3:0)+(f?f.c2:d%3==0?0:d/2),h=l.slice(p,p+m),g=l.slice(p+m,p+2*m),_=l.slice(p+2*m),v=document.createElement(`div`);v.className=`avsl-dialog-overlay`,document.body.appendChild(v);let y=null,b=!1,x=0,S=0;function C(e){if(!b)return;let t=v.querySelector(`.avsl-dialog-card-wide`);if(!t)return;let n=e.clientX-x,r=e.clientY-S;y={left:n,top:r},t.style.left=`${n}px`,t.style.top=`${r}px`}function w(){b&&(b=!1,document.body.style.userSelect=``)}document.addEventListener(`mousemove`,C),document.addEventListener(`mouseup`,w);function T(){document.removeEventListener(`mousemove`,C),document.removeEventListener(`mouseup`,w)}function O(e){return`<div class="d-flex justify-content-between gap-2 py-1">
      <span class="small">${s(e.navn??``)}</span>
      <span class="small text-muted text-nowrap">${e.kamp_poeng??0}p (${e.score_poeng??0})</span>
    </div>`}function k(r){let C=l.slice(0,p),w=C.length>0?`<div class="mb-3">
          <strong class="d-block mb-1">Walkovers (går vidare utan kamp):</strong>
          ${C.map(O).join(``)}
        </div>`:``,A=r&&m>0?`<div class="alert alert-info small mb-3 py-2">
          Dette er seedinggrupper, ikkje kampar. Spelarar i same gruppe kan ikkje trekkast mot kvarandre. Kampane blir oppretta når du klikkar «Bekreft og opprett kampar».
        </div>`:``,j=r&&m>0?`<div class="d-flex gap-3 flex-wrap mb-3">
          ${[{label:`Seeding 1`,pool:h},{label:`Seeding 2`,pool:g},..._.length?[{label:`Seeding 3`,pool:_}]:[]].map(({label:e,pool:t})=>`
            <div class="card flex-grow-1">
              <div class="card-body p-2">
                <strong class="d-block mb-2 small text-uppercase">${s(e)}</strong>
                ${t.map(O).join(``)}
              </div>
            </div>`).join(``)}
        </div>`:`<div class="avsl-player-columns mb-3">
          ${l.slice(p).map((e,t)=>`
            <div class="small d-flex justify-content-between gap-2">
              <span>${p+t+1}. ${s(e.navn??``)}</span>
              <span class="text-muted text-nowrap">${e.kamp_poeng??0}p (${e.score_poeng??0})</span>
            </div>`).join(``)}
        </div>`;v.innerHTML=`
      <div class="card avsl-dialog-card-wide">
        <div class="avsl-dialog-drag-handle">
          <p class="text-muted small text-uppercase fw-semibold mb-1">Trekning</p>
          <h5 class="mb-1">Gruppe ${s(n)} — Runde ${i}</h5>
          <p class="text-muted small mb-0">${d} av ${u} spelarar igjen</p>
        </div>
        <div class="avsl-dialog-body">
          <div class="form-check mb-2">
            <input class="form-check-input" type="checkbox" id="seeding-dlg" ${r?`checked`:``}>
            <label class="form-check-label" for="seeding-dlg">Bruk seeding</label>
          </div>
          ${A}
          ${w}
          ${j}
        </div>
        <div class="avsl-dialog-footer">
          <div class="d-flex gap-2">
            <button id="bekreft-gen-btn" class="btn btn-primary">Bekreft og opprett kampar</button>
            <button id="avbryt-gen-btn" class="btn btn-secondary">Avbryt</button>
          </div>
        </div>
      </div>`;let M=v.querySelector(`.avsl-dialog-card-wide`);y&&(M.style.position=`fixed`,M.style.left=`${y.left}px`,M.style.top=`${y.top}px`,M.style.margin=`0`,M.style.zIndex=`10000`),M.querySelector(`.avsl-dialog-drag-handle`).addEventListener(`mousedown`,e=>{let t=M.getBoundingClientRect();M.style.position=`fixed`,M.style.left=`${t.left}px`,M.style.top=`${t.top}px`,M.style.margin=`0`,M.style.zIndex=`10000`,x=e.clientX-t.left,S=e.clientY-t.top,y={left:t.left,top:t.top},b=!0,document.body.style.userSelect=`none`}),v.querySelector(`#seeding-dlg`).addEventListener(`change`,e=>k(e.target.checked)),v.querySelector(`#avbryt-gen-btn`).addEventListener(`click`,()=>{T(),v.remove()}),v.querySelector(`#bekreft-gen-btn`).addEventListener(`click`,async()=>{let r=v.querySelector(`#seeding-dlg`).checked,s=v.querySelector(`#bekreft-gen-btn`);s.disabled=!0,s.textContent=`Lagrer…`;try{let e=l.map((e,t)=>({kasterid:e.kasterid,plassering:t+1}));if(i===1){let i={A:a?.A??void 0,B:a?.B??void 0};await D(t,[{gruppeNavn:n,spelarar:e,runde1Oppsett:f}],r,a?i:null)}else await E(t,n,r,e);T(),v.remove(),await o()}catch(t){e(`cup:genererRunde`,t),c(`Feil ved generering av runde`,`error`),s.disabled=!1,s.textContent=`Bekreft og opprett kampar`}})}k(!0)}function se(e,t,n,r){let i=t.map(e=>j(e,!1)),a=[],o=document.createElement(`div`);o.className=`avsl-dialog-overlay`,document.body.appendChild(o);function s(){let l=a.length===2?t.find(e=>!a.includes(e.rep.kasterid)):null;o.innerHTML=`
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
    `,o.querySelector(`#avbryt-tre-btn`).addEventListener(`click`,()=>o.remove()),o.querySelectorAll(`[data-kasterid]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=Number(e.dataset.kasterid),n=a.indexOf(t);n===-1?a.length<2&&a.push(t):a.splice(n,1),s()})}),o.querySelector(`#bekreft-tre-btn`)?.addEventListener(`click`,async()=>{if(a.length!==2)return;let i=t.find(e=>!a.includes(e.rep.kasterid))??null,s=a.map(e=>t.find(t=>t.rep.kasterid===e)).filter(e=>e!=null).map(e=>e.members.map(e=>e.kasterid)),l=t.flatMap(e=>e.members.map(e=>e.kasterid));o.remove();let{error:u}=await b({kampId:e.id,stevneId:n,rundeNummer:e.runde_nummer,rundeNavn:e.runde_navn,allKasterids:l,eliminertIds:i?.members.map(e=>e.kasterid)??[],vidareSider:s});if(u){c(`DB-feil ved bekreft`,`error`);return}await r()})}s()}function ce(e){return typeof e!=`object`||!e||Array.isArray(e)?null:e}function le(e){return e.map(e=>({er_bekreftet:e.er_bekreftet,er_walkover:e.er_walkover,runde_nummer:e.runde_nummer,bane_nummer:e.bane_nummer,spelarar:J(e.spelarar)}))}function J(e){return e.map(e=>({kasterid:e.kasterid??0,kamp_poeng:e.kamp_poeng??0,score_poeng:e.score_poeng??0,antall_ringer:e.antall_ringer,omgangar:e.omgangar,kaster:e.kaster}))}function ue(t){let n=null,r=null,s=!1,m=new Set;async function h(e,{id:t,isAdmin:i=!1},a=null){r=a,s=i,n&&=(await w(n),null),e.replaceChildren(f(`Laster…`)),await g(e,t)}async function g(n,f){try{let[{data:e},{data:p},{data:h},{data:v},{count:y}]=await Promise.all([d(f),x(f),re(f),L([`A`,`B`]),a(f)]);if(!e){n.replaceChildren(o(`Stevne ikkje funne.`));return}let b=h.filter(e=>e.kasterid!=null),S=p.filter(e=>e.fase===`innledende`),C=p.filter(e=>e.fase===`avsluttende`),w={},T={},E=new Map;for(let e of b)e.startnummer!=null&&(w[e.kasterid]=e.startnummer,E.set(e.startnummer,(E.get(e.startnummer)??0)+1)),e.posisjon!=null&&(T[e.kasterid]=e.posisjon);let D=[...E.values()].some(e=>e>1),O={};for(let e of p)for(let t of e.spelarar)t.kasterid&&t.kaster&&!O[t.kasterid]&&(O[t.kasterid]=`${t.kaster.fornavn} ${t.kaster.etternavn}`);let k=le(S),A=R(k,b,O,w,T),j=S.length>0&&S.every(e=>e.er_bekreftet),N=C.length>0,P=b.some(e=>e.gruppe!=null),z=Object.fromEntries(v.map(e=>[e.navn,e.id])),B=ce(e.runde1_format),V=y??0;if(e.kategori?.erlagbasert){let{data:e}=await l(f);V=e.length}let H={container:n,stevneid:f,stevne:e,stilling:A,startnrMap:w,posisjonMap:T,erLag:D,navnMap:O,innlKampar:S,avslKampar:C,resultat:b,isAdmin:s,harGruppefordeling:P,alleInnlBekrefta:j,harAvslKampar:N,runde1Format:B,unitCount:V,gruppeNavnMap:z,reload:()=>g(n,f)};s&&r&&(r.innerHTML=M(e,{alleInnlBekrefta:j,harAvslKampar:N,harGruppefordeling:P,harPrekonfigurertFormat:B!=null&&e.stevne_fase!==`avsluttende`}));let U=F(n);if(P){let e=ee(A,k,w,{tableId:`stilling-avsl`,harGrupper:!0,harEliminasjon:!0,posisjonMap:T,unitLabel:D?`par`:`spelarar`});n.innerHTML=ie(t.renderKamparHtml(H),e),te(n,`stilling-avsl`,m),ne(n),U===`stilling`&&ae(n,`stilling`),t.bindKamparEvents(n,H),_(n,f)}else n.innerHTML=t.renderSetupHtml(H);r?.querySelector(`#fullfør-turnering-btn`)?.addEventListener(`click`,async()=>{if(!await u({title:`Fullfør turnering`,message:`Vil du fullføre turneringa? Dette kan ikkje angrast.`,danger:!0}))return;let{error:e}=await I(f,[...A.filter(e=>e.gruppe?.navn===`A`),...A.filter(e=>e.gruppe?.navn===`B`),...A.filter(e=>e.gruppe?.navn!==`A`&&e.gruppe?.navn!==`B`)]);if(e){c(`Feil ved lagring av plasseringar`,`error`);return}let{error:t}=await i(f);if(t){c(`Feil ved fullføring av turnering`,`error`);return}await g(n,f)}),t.bindHeaderEvents(r,H)}catch(t){e(`avsluttendeBase.lastOgVis`,t),n.replaceChildren(o(`Kunne ikkje laste avsluttande fase.`))}}function _(e,r){if(n)return;let i=P(r,[`avsluttende`],e,g,()=>{n&&=(w(n),null)});n=p(r,t.channelName(r),i)}return h}function Y(e,t,n){return y(e.spelarar.filter(e=>e.kasterid!=null),t,n)}function X(e){return e?.members.reduce((e,t)=>e+m(t),0)??0}var de=ue({channelName:e=>`stevne-avsl-cup-${e}`,renderKamparHtml:e=>{let{avslKampar:t,stilling:n,startnrMap:r,posisjonMap:i,erLag:a,isAdmin:o}=e;return`<div class="d-flex gap-3 flex-wrap">${[...new Set(n.map(e=>e.gruppe?.navn).filter(e=>e!=null))].sort().map(e=>{let s=t.filter(t=>t.gruppe_navn===e),c=n.filter(t=>t.gruppe?.navn===e),l=c.filter(e=>e.runde_eliminert==null).length,u=c.length,d=s.length?Math.max(...s.map(e=>e.runde_nummer)):0,f=s.filter(e=>e.runde_nummer===d),p=f.length>0&&f.every(e=>e.er_bekreftet||e.er_walkover),m=s.some(e=>e.runde_navn===`Semifinale`);return fe(e,s,l,u,d,o&&(s.length===0||p)&&l>1&&!m,r,i,a?`par`:`spelarar`,o)}).join(``)}</div>`},bindKamparEvents:(e,t)=>{!t.isAdmin&&t.avslKampar.length===0||Q(e,t.stevneid,t.avslKampar,t.isAdmin,t.reload,t.startnrMap,t.posisjonMap)},renderSetupHtml:e=>{let{stevne:t,isAdmin:n,runde1Format:r,unitCount:i,stilling:a}=e,o=r?.nA??null;if(t.stevne_fase===`avsluttende`)return n?H(a,{visSpelarliste:!0,initNa:o,initFormat:r}):`<p class="text-muted fst-italic">Gruppefordeling er ikkje klar enno.</p>`;if(!n)return``;if(i<2)return`<p class="text-muted fst-italic">${t.kategori?.erlagbasert?`Minst 2 par må vere oppretta før gruppefordelinga kan setjast.`:`Minst 2 spelarar må vere påmelde før gruppefordelinga kan setjast.`}</p>`;let s=a.length>0;return H(s?a:i,{visSpelarliste:s,initNa:o,initFormat:r})},bindHeaderEvents:(e,r)=>{let{container:i,stevneid:a,stevne:o,stilling:s,resultat:l,runde1Format:d,alleInnlBekrefta:f,harGruppefordeling:p,gruppeNavnMap:m,reload:h}=r;if(e?.querySelector(`#start-avsl-btn`)?.addEventListener(`click`,async()=>{if(!f)return;let{error:e}=await n(a,`avsluttende`);if(e){c(`Feil ved oppstart av avsluttande fase`,`error`);return}if(d?.nA!=null){let e=d.nA,{error:t}=await N(a,Z(s,l,e,m.A??null,m.B??null));if(t){c(`Feil ved lagring av gruppefordeling`,`error`);return}}await h()}),!p){let e=parseInt(i.querySelector(`#gruppe-val-wrapper`)?.dataset.n??`0`)||s.length;function n(e,t){let n=i.querySelector(`input[name="${e}"]:checked`);if(n?.dataset.oppsett)try{return JSON.parse(n.dataset.oppsett)}catch{}return A(t)[0]??null}function r(e,t,n){let r=i.querySelector(`#gruppe-preview`);r&&(r.innerHTML=U(s.map((e,t)=>({...e,cupPlassering:t+1})),e,t?.walkovers??0,n?.walkovers??0))}let u=i.querySelector(`#gruppe-paneler`);u&&u.addEventListener(`change`,t=>{let a=t.target;if(!a.matches(`input[name^="runde1-format"]`))return;let o=parseInt(i.querySelector(`input[name="gruppe-split"]:checked`)?.value??String(e)),s=e-o,c=n(`runde1-format-a`,o),l=n(`runde1-format-b`,s);if(a.name===`runde1-format-a`){let e=i.querySelector(`#struktur-a`);e&&(e.outerHTML=K(o,c,`a`))}else{let e=i.querySelector(`#struktur-b`);e&&(e.outerHTML=K(s,l,`b`))}r(o,c,l)}),i.querySelectorAll(`input[name="gruppe-split"]`).forEach(t=>{t.addEventListener(`change`,()=>{let n=parseInt(t.value),i=e-n,a=A(n)[0]??null,o=i>=2?A(i)[0]??null:null;u&&(u.innerHTML=`<div id="gruppe-panel-a" class="avsl-gruppe-kol">
                ${q(`Gruppe A`,n,`runde1-format-a`,a)}
              </div>`+(i>=2?`<div id="gruppe-panel-b" class="avsl-gruppe-kol">
                ${q(`Gruppe B`,i,`runde1-format-b`,o)}
              </div>`:``)),r(n,a,o)})}),i.querySelector(`#bekreft-gruppe-btn`)?.addEventListener(`click`,async()=>{let r=i.querySelector(`input[name="gruppe-split"]:checked`);if(!r)return;let u=parseInt(r.value),d=e-u,{error:f}=await t(a,{A:n(`runde1-format-a`,u),B:d>=2?n(`runde1-format-b`,d):null,nA:u});if(f){c(`Feil ved lagring av format`,`error`);return}if(o.stevne_fase===`avsluttende`){let{error:e}=await N(a,Z(s,l,u,m.A??null,m.B??null));if(e){c(`Feil ved lagring av gruppefordeling`,`error`);return}}c(`Gruppefordeling lagra`,`success`),await h()})}e?.querySelector(`#endre-gruppeinndeling-btn`)?.addEventListener(`click`,async()=>{await u({title:`Tilbakestill gruppeinndeling`,message:`Gruppefordeling og format vert fjerna.`,danger:!0})&&(await Promise.all([z(a),t(a,null)]),await h())}),p&&i.querySelectorAll(`[data-generer-gruppe]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.genererGruppe??``,n=parseInt(e.dataset.runde??`1`);oe(a,t,s.filter(e=>e.gruppe?.navn===t),n,d,h)})})}});function Z(e,t,n,r,i){return e.flatMap((e,a)=>{let o=a<n?r:i??r,s=e.startnummer==null?[]:t.filter(t=>t.startnummer===e.startnummer).map(e=>e.kasterid);return(s.length?s:[e.kasterid]).map(e=>({kasterid:e,gruppeid:o}))})}function fe(e,t,n,r,i,a,o,c,l,u=!0){let d=new Map;for(let e of t)d.has(e.runde_nummer)||d.set(e.runde_nummer,[]),d.get(e.runde_nummer).push(e);let f=[...d.entries()].reverse().map(([e,t])=>{let n=t[0]?.runde_navn??`Runde ${e}`,r=t.filter(e=>!e.er_walkover);return r.length?`
      <h6 class="fw-bold text-center mb-1">${s(n)}</h6>
      <div class="d-flex flex-wrap gap-2 mb-2">
        ${r.map(e=>_e(e,o,c,u)).join(``)}
      </div>`:``}).join(``),p=i+1,m=a?`<button class="btn btn-success w-100 mt-2"
         data-generer-gruppe="${s(e)}" data-runde="${p}">
         Generer runde ${p}
       </button>`:``;return`
    <div class="avsl-gruppe-kol">
      <h6 class="text-center fw-bold mb-2">Gruppe ${s(e)} (${r} ${s(l)})</h6>
      ${m}
      ${f}
    </div>`}function pe(e,t,n,r){let i=X(t),a=i>0||r.bekrefta||r.harOmgangar?i:`—`,o=t.rep.kamp_plassering,s=e.er_bekreftet&&o!=null&&o>=n,c=e.er_bekreftet&&o!=null&&o<n,l=s?`kamp-eliminert`:c?`kamp-vidare`:``,u=`text-center fw-semibold avsl-score-cel${r.kanEndreScore?` score-redigerbar`:``}`,d=r.kanEndreScore?` data-endre-score="${e.id}"`:``;return`<tr${l?` class="${l}"`:``}>
    <td>${j(t,!1)}</td>
    <td class="${u}"${d}>${a}</td>
  </tr>`}function me(e,t,n){return e.er_walkover?`<tr>
        <td colspan="2">${j(t[0]??null,!1)} <span class="badge bg-secondary">Walkover</span></td>
      </tr>`:t.map(r=>pe(e,r,t.length,n)).join(``)}function he(e,t,n,r){if(e.er_tre_spelarar)return{klass:r?`btn-secondary`:`btn-outline-secondary`,tekst:r?`Endre plassering`:`Sett plassering`,disabled:!1,ekstraKlass:``};let i=B(e,J(t.map(e=>e.rep)),n);return{klass:r?`btn-secondary`:i?`btn-success`:`btn-outline-secondary`,tekst:r?`Bekreftet`:`Bekreft`,disabled:r||!i,ekstraKlass:` btn-bekreft`}}function ge(e,t,n){return`<tr>
            <td colspan="2" class="text-end pe-1">
              ${!e.er_walkover&&!e.er_tre_spelarar?`<button class="btn btn-primary btn-sm" id="plus-${e.id}"${t?` disabled`:``}>+</button> `:``}
              ${t?``:`<button class="btn btn-secondary btn-sm" id="scoreboard-${e.id}">Score</button> `}
              <button class="btn ${n.klass} btn-sm${n.ekstraKlass}" id="bekrft-${e.id}"${n.disabled?` disabled`:``}>${n.tekst}</button>
            </td>
          </tr>`}function _e(e,t,n,i=!0){let a=Y(e,t,n),o=e.er_bekreftet||e.er_walkover,s=e.spelarar.some(e=>(e.omgangar?.length??0)>0),c={bekrefta:o,harOmgangar:s,kanEndreScore:i&&e.er_bekreftet&&!e.er_tre_spelarar&&!s},l=i?ge(e,o,he(e,a,s,o)):``;return`
    <div class="avsl-kamp-block">
      <div class="avsl-kamp-header">
        <span class="avsl-kamp-bane">Bane ${e.bane_nummer}</span>
        ${s&&!o?r():``}
      </div>
      <table class="table table-sm table-bordered mb-0">
        <tbody>
          ${me(e,a,c)}
          ${l}
        </tbody>
      </table>
    </div>`}function Q(t,n,r,i,a,o,s){for(let l of r){let r=Y(l,o,s),u=r[0]??null,d=r[1]??null,f=u?.rep??null,p=d?.rep??null,m=j(u,!1),g=j(d,!1),v=async(t,n)=>{let r=[];f?.id&&r.push(C(f.id,t)),p?.id&&r.push(C(p.id,n));for(let e of[u,d])for(let t of e?.members.slice(1)??[])r.push(C(t.id,0));try{return(await Promise.all(r)).find(e=>e.error)??null}catch(t){return e(`cup:skrivSideScore`,t),{error:t}}};if(t.querySelector(`#plus-${l.id}`)?.addEventListener(`click`,async()=>{V(m,g,X(u),X(d),async(e,t)=>{if(await v(e,t)){c(`DB-feil ved oppdatering av score`,`error`);return}await a()})}),t.querySelector(`#scoreboard-${l.id}`)?.addEventListener(`click`,()=>{window.open(`#/kamp/${l.id}`,`_blank`)}),t.querySelector(`#bekrft-${l.id}`)?.addEventListener(`click`,async e=>{if(l.er_tre_spelarar)se(l,r,n,async()=>{await $(n,l),await a()});else{let t=e.currentTarget;t.disabled=!0,t.textContent=`Lagrer…`;try{await ve(n,l,r,a)||(t.disabled=!1,t.textContent=`Bekreft`)}catch{t.disabled=!1,t.textContent=`Bekreft`}}}),i&&l.er_bekreftet&&!l.er_tre_spelarar){let e=r.flatMap(e=>e.members.map(e=>e.kasterid)),i=()=>{V(m,g,X(u),X(d),async(t,i)=>{let o=r.flatMap(e=>e.members.map(e=>e.id));if(o.length){let{error:e}=await h(o);if(e){c(`DB-feil ved sletting av omgangar`,`error`);return}}if(await v(t,i)){c(`DB-feil ved oppdatering av score`,`error`);return}let s=t>=i?u:d,f=t>=i?d:u,p=s?.members.map(e=>e.kasterid)??[],m=f?.members.map(e=>e.kasterid)??[],g=[...p.map(e=>({kasterid:e,plassering:1})),...m.map(e=>({kasterid:e,plassering:2}))],{error:y}=await S(l.id,g);if(y){c(`DB-feil ved oppdatering av plassering`,`error`);return}await _({stevneId:n,rundeNummer:l.runde_nummer,rundeNavn:l.runde_navn,allKasterids:e,nyVinnarIds:p,nyTaparIds:m}),await a()})};t.querySelectorAll(`[data-endre-score="${l.id}"]`).forEach(e=>e.addEventListener(`click`,i))}}}async function ve(e,t,n,r){let i=n[0]??null,a=n[1]??null,{data:o}=await v(t.id),s=e=>e?.members.reduce((e,t)=>e+m(o.find(e=>e.id===t.id)??t),0)??0,l=s(i),d=s(a);if(l===0&&d===0&&!await u({title:`Ingen score registrert`,message:`Vil du bekrefte kampen likevel?`}))return!1;let f=l>=d?i:a,p=l>=d?a:i,h=n.flatMap(e=>e.members.map(e=>e.kasterid)),{error:g}=await b({kampId:t.id,stevneId:e,rundeNummer:t.runde_nummer,rundeNavn:t.runde_navn,allKasterids:h,eliminertIds:p?.members.map(e=>e.kasterid)??[],vidareSider:f?[f.members.map(e=>e.kasterid)]:[]});return g?(c(`DB-feil ved bekreft`,`error`),!1):(await $(e,t),await r(),!0)}async function $(e,t){t.runde_navn!==`Semifinale`||!t.gruppe_navn||await g(e,t.gruppe_navn)&&await k(e,t.gruppe_navn)}export{de as render};