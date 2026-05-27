import{$ as e,A as t,B as n,C as r,D as i,E as a,G as o,H as s,I as c,J as l,K as u,M as d,O as f,P as p,Q as m,R as h,T as g,V as _,X as v,Y as y,Z as b,_ as x,b as S,d as C,et as w,f as T,g as E,h as D,j as O,k,n as A,o as j,p as M,r as N,s as ee,t as P,tt as F,u as I,v as te,w as L,x as R,z}from"./index-Bsi1D6xh.js";import{t as B}from"./ScoreNumberpad-C-b3sWkY.js";function V(e,{visSpelarliste:t=!0,initNa:n=null,initFormat:r=null}={}){let a=typeof e==`number`?e:e.length,o=typeof e==`number`?[]:e.map((e,t)=>({...e,cupPlassering:t+1})),s=i(a),c=n===a?a:n!=null&&s.some(e=>e.nA===n)?n:s[0]?.nA??a,l=a-c,u=s.filter(e=>f(e.nA).some(e=>e.c3>0)),d=s.filter(e=>!f(e.nA).some(e=>e.c3>0)),p=f(a).length>0,m=(e,t)=>e.map((e,r)=>{let i=e.nA===c&&n!==a,o=t+r;return`
      <div class="form-check">
        <input class="form-check-input" type="radio" name="gruppe-split" id="split-${o}" value="${e.nA}" ${i?`checked`:``}>
        <label class="form-check-label" for="split-${o}">A:${e.nA} — B:${e.nB}</label>
      </div>`}).join(``),h=[];u.length&&h.push(`<div class="text-muted small fw-semibold mb-1">3 spillere per bane (A)</div>${m(u,0)}`),d.length&&(h.length&&h.push(`<hr class="my-2">`),h.push(`<div class="text-muted small fw-semibold mb-1">2 spillere per bane (A)</div>${m(d,u.length)}`)),p&&(h.length&&h.push(`<hr class="my-2">`),h.push(`
      <div class="form-check">
        <input class="form-check-input" type="radio" name="gruppe-split" id="split-ingen" value="${a}" ${n===a?`checked`:``}>
        <label class="form-check-label" for="split-ingen">Ingen gruppeinndeling (alle i A)</label>
      </div>`));let g=h.join(``),_=r?.A??f(c)[0]??null,v=l>=2?r?.B??f(l)[0]??null:null,y=t?`<div id="gruppe-preview">${H(o,c,_?.walkovers??0,v?.walkovers??0)}</div>`:``;return`
    <div id="gruppe-val-wrapper" data-n="${a}">
      <h5 class="mb-3">Velg gruppeinndeling for cup</h5>
      <div class="d-flex gap-3 align-items-start flex-wrap mb-3">
        <div class="card">
          <div class="card-body">
            ${g}
          </div>
        </div>
        <div id="gruppe-paneler" class="d-flex gap-3 flex-wrap">
          <div id="gruppe-panel-a" class="avsl-gruppe-kol">
            ${K(`Gruppe A`,c,`runde1-format-a`,_)}
          </div>
          ${l>=2?`<div id="gruppe-panel-b" class="avsl-gruppe-kol">
            ${K(`Gruppe B`,l,`runde1-format-b`,v)}
          </div>`:``}
        </div>
      </div>
      <div class="mt-3">
        <button id="bekreft-gruppe-btn" class="btn btn-success btn-lg w-100">Bekreft gruppefordeling</button>
      </div>
      ${y}
    </div>
  `}function H(e,t,n=0,r=0){let i=e.slice(0,t),a=e.slice(t);function o(e,t=0){return e.map((e,n)=>{let r=n<t;return`
      <tr>
        <td>${e.cupPlassering}</td>
        <td>${m(String(e.startnummer??``))}</td>
        <td>${m(e.navn??``)}${r?` <span class="badge bg-info text-dark">Walkover</span>`:``}</td>
        <td class="text-center">${e.kamp_poeng??0}</td>
        <td class="text-center">${e.score_poeng??0}</td>
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
    </div>`}function U(e){let t=e.c3>0?3:2;return`${e.walkovers} walkover - ${t} deltakere per bane`}function W(e,t,n,r=null){let i=f(t);return i.length<=1?``:`<div class="d-flex flex-column align-items-start gap-1 mb-2">${i.map((e,t)=>{let i=`${n}-${t}`,a=JSON.stringify(e),o=r?e.walkovers===r.walkovers&&e.c3===r.c3&&e.c2===r.c2:t===0,s=e.c3>0?`btn-outline-success`:`btn-outline-warning`;return`
      <input type="radio" class="btn-check" name="${n}" id="${i}"
        value='${a}' data-oppsett='${a}' autocomplete="off" ${o?`checked`:``}>
      <label class="btn btn-sm ${s}" for="${i}">${U(e)}</label>`}).join(``)}</div>`}function G(e,t,n){return`<div id="struktur-${n}">
    <table class="table table-sm table-bordered mb-0">
      <thead><tr>
        <th>Runde</th><th>Deltakere (w.o.)</th><th>Baner</th><th>Per bane</th>
      </tr></thead>
      <tbody>${(e>=2?a(e,{runde1:t}):[]).map((e,n)=>{let r=e.walkovers??0,i=e.spelarar-r,a=r>0?`${i} <span class="text-muted">(${r} w.o.)</span>`:`${i}`,o;return o=n===0&&t?t.c3>0&&t.c2>0?`2/3`:t.c3>0?`3`:`2`:e.spelarar%e.baner===0?String(e.spelarar/e.baner):`2/3`,`<tr${e.treSpelarar?` class="fw-bold"`:``}>
      <td>${e.runde}</td>
      <td>${a}</td>
      <td>${e.baner}</td>
      <td>${o}</td>
    </tr>`}).join(``)}</tbody>
    </table>
  </div>`}function K(e,t,n,r){let i=n.slice(-1),a=W(e,t,n,r);return`
    <div class="card">
      <div class="card-body">
        <h6 class="fw-bold mb-2">${a?`${e}: Velg format`:`${e} (${t})`}</h6>
        ${a}
        ${G(t,r,i)}
      </div>
    </div>`}function q(e,t,n,i,a,o){let s=n.filter(e=>e.runde_eliminert==null),c=n.length,l=s.length,u=i===1?a?.[t]??null:null,d=u?.walkovers??0,f=(u?u.c3:l%3==0?l/3:0)+(u?u.c2:l%3==0?0:l/2),p=s.slice(d,d+f),h=s.slice(d+f,d+2*f),_=s.slice(d+2*f),v=document.createElement(`div`);v.className=`avsl-dialog-overlay`,document.body.appendChild(v);let y=null,b=!1,x=0,S=0;function C(e){if(!b)return;let t=v.querySelector(`.avsl-dialog-card-wide`);if(!t)return;let n=e.clientX-x,r=e.clientY-S;y={left:n,top:r},t.style.left=`${n}px`,t.style.top=`${r}px`}function w(){b&&(b=!1,document.body.style.userSelect=``)}document.addEventListener(`mousemove`,C),document.addEventListener(`mouseup`,w);function T(){document.removeEventListener(`mousemove`,C),document.removeEventListener(`mouseup`,w)}function E(e){return`<div class="mb-2">
      <div class="small">${m(e.navn??``)}</div>
      <div class="small text-muted">${e.kamp_poeng??0}p (${e.score_poeng??0})</div>
    </div>`}function D(n){let C=s.slice(0,d),w=C.length>0?`<div class="mb-3">
          <strong class="d-block mb-1">Walkovers (går vidare utan kamp):</strong>
          ${C.map(E).join(``)}
        </div>`:``,O=n&&f>0?`<div class="alert alert-info small mb-3 py-2">
          Dette er seedinggrupper, ikkje kampar. Spelarar i same gruppe kan ikkje trekkast mot kvarandre. Kampane blir oppretta når du klikkar «Bekreft og opprett kampar».
        </div>`:``,A=n&&f>0?`<div class="d-flex gap-3 flex-wrap mb-3">
          ${[{label:`Seeding 1`,pool:p},{label:`Seeding 2`,pool:h},..._.length?[{label:`Seeding 3`,pool:_}]:[]].map(({label:e,pool:t})=>`
            <div class="card flex-grow-1">
              <div class="card-body p-2">
                <strong class="d-block mb-2 small text-uppercase">${m(e)}</strong>
                ${t.map(E).join(``)}
              </div>
            </div>`).join(``)}
        </div>`:`<div class="avsl-player-columns mb-3">
          ${s.slice(d).map((e,t)=>`
            <div class="small d-flex justify-content-between gap-2">
              <span>${d+t+1}. ${m(e.navn??``)}</span>
              <span class="text-muted text-nowrap">${e.kamp_poeng??0}p (${e.score_poeng??0})</span>
            </div>`).join(``)}
        </div>`;v.innerHTML=`
      <div class="card p-4 avsl-dialog-card-wide">
        <div class="avsl-dialog-drag-handle mb-3">
          <p class="text-muted small text-uppercase fw-semibold mb-1">Trekning</p>
          <h5 class="mb-1">Gruppe ${m(t)} — Runde ${i}</h5>
          <p class="text-muted small mb-0">${l} av ${c} spelarar igjen</p>
        </div>
        <div class="form-check mb-3">
          <input class="form-check-input" type="checkbox" id="seeding-dlg" ${n?`checked`:``}>
          <label class="form-check-label" for="seeding-dlg">Bruk seeding</label>
        </div>
        ${O}
        ${w}
        ${A}
        <div class="d-flex gap-2">
          <button id="bekreft-gen-btn" class="btn btn-primary">Bekreft og opprett kampar</button>
          <button id="avbryt-gen-btn" class="btn btn-secondary">Avbryt</button>
        </div>
      </div>`;let j=v.querySelector(`.avsl-dialog-card-wide`);y&&(j.style.position=`fixed`,j.style.left=`${y.left}px`,j.style.top=`${y.top}px`,j.style.margin=`0`,j.style.zIndex=`10000`),j.querySelector(`.avsl-dialog-drag-handle`).addEventListener(`mousedown`,e=>{let t=j.getBoundingClientRect();j.style.position=`fixed`,j.style.left=`${t.left}px`,j.style.top=`${t.top}px`,j.style.margin=`0`,j.style.zIndex=`10000`,x=e.clientX-t.left,S=e.clientY-t.top,y={left:t.left,top:t.top},b=!0,document.body.style.userSelect=`none`}),v.querySelector(`#seeding-dlg`).addEventListener(`change`,e=>D(e.target.checked)),v.querySelector(`#avbryt-gen-btn`).addEventListener(`click`,()=>{T(),v.remove()}),v.querySelector(`#bekreft-gen-btn`).addEventListener(`click`,async()=>{let n=v.querySelector(`#seeding-dlg`).checked,c=v.querySelector(`#bekreft-gen-btn`);c.disabled=!0,c.textContent=`Lagrer…`;try{let c=s.map((e,t)=>({kasterid:e.kasterid,plassering:t+1}));if(i===1){let i={A:a?.A??void 0,B:a?.B??void 0};await r(e,[{gruppeNavn:t,spelarar:c,runde1Oppsett:u}],n,a?i:null)}else await g(e,t,n,c);T(),v.remove(),await o()}catch(e){F(`cup:genererRunde`,e),k(`Feil ved generering av runde`,`error`),c.disabled=!1,c.textContent=`Bekreft og opprett kampar`}})}D(!0)}function J(e,t,n,r){let i=t.map(e=>e?.kaster?`${m(e.kaster.fornavn)} ${m(e.kaster.etternavn)}`:`Spelar ?`),a=[],o=document.createElement(`div`);o.className=`avsl-dialog-overlay`,document.body.appendChild(o);function s(){let c=a.length===2?t.find(e=>e.kasterid!=null&&!a.includes(e.kasterid)):null;o.innerHTML=`
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
    `,o.querySelector(`#avbryt-tre-btn`).addEventListener(`click`,()=>o.remove()),o.querySelectorAll(`[data-kasterid]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=Number(e.dataset.kasterid),n=a.indexOf(t);n===-1?a.length<2&&a.push(t):a.splice(n,1),s()})}),o.querySelector(`#bekreft-tre-btn`)?.addEventListener(`click`,async()=>{if(a.length!==2)return;let i=t.find(e=>e.kasterid!=null&&!a.includes(e.kasterid))?.kasterid??null,s=t.map(e=>e.kasterid).filter(e=>e!=null);o.remove();let{error:c}=await d({kampId:e.id,stevneId:n,rundeNummer:e.runde_nummer,rundeNavn:e.runde_navn,allKasterids:s,eliminertId:i,vidareIds:[...a]});if(c){k(`DB-feil ved bekreft`,`error`);return}await r()})}s()}function Y(e){return typeof e!=`object`||!e||Array.isArray(e)?null:e}function X(e){return e.map(e=>({er_bekreftet:e.er_bekreftet,er_walkover:e.er_walkover,runde_nummer:e.runde_nummer,bane_nummer:e.bane_nummer,spelarar:Z(e.spelarar)}))}function Z(e){return e.map(e=>({kasterid:e.kasterid??0,kamp_poeng:e.kamp_poeng??0,score_poeng:e.score_poeng??0,antall_ringer:e.antall_ringer,omgangar:e.omgangar,kaster:e.kaster}))}function ne(n){let r=null,i=null,a=!1,o=new Set;async function d(n,{id:o,isAdmin:s=!1},c=null){i=c,a=s,r&&=(await t(r),null),n.replaceChildren(e(`Laster…`)),await f(n,o)}async function f(e,t){try{let[{data:r},{data:s},{data:d},{data:m},{count:h}]=await Promise.all([u(t),c(t),N(t),A([`A`,`B`]),l(t)]);if(!r){e.replaceChildren(w(`Stevne ikkje funne.`));return}let g=d.filter(e=>e.kasterid!=null),_=s.filter(e=>e.fase===`innledende`),v=s.filter(e=>e.fase===`avsluttende`),y={};for(let e of g)e.startnummer!=null&&(y[e.kasterid]=e.startnummer);let E={};for(let e of s)for(let t of e.spelarar)t.kasterid&&t.kaster&&!E[t.kasterid]&&(E[t.kasterid]=`${t.kaster.fornavn} ${t.kaster.etternavn}`);let j=X(_),P=M(j,g,E,y),F=_.length>0&&_.every(e=>e.er_bekreftet),I=v.length>0,L=g.some(e=>e.gruppe!=null),z=Object.fromEntries(m.map(e=>[e.navn,e.id])),B=Y(r.runde1_format),V={container:e,stevneid:t,stevne:r,stilling:P,startnrMap:y,navnMap:E,innlKampar:_,avslKampar:v,resultat:g,isAdmin:a,harGruppefordeling:L,alleInnlBekrefta:F,harAvslKampar:I,runde1Format:B,pameldingCount:h??0,gruppeNavnMap:z,reload:()=>f(e,t)};a&&i&&(i.innerHTML=x(r,{alleInnlBekrefta:F,harAvslKampar:I,harGruppefordeling:L,harPrekonfigurertFormat:B!=null&&r.stevne_fase!==`avsluttende`}));let H=D(e);if(L){let r=S(P,j,y,{tableId:`stilling-avsl`,harGrupper:!0,harEliminasjon:!0});e.innerHTML=`<div class="px-3 py-2">${te(n.renderKamparHtml(V),r)}</div>`,C(e,`stilling-avsl`,o),T(e),H===`stilling`&&R(e,`stilling`),n.bindKamparEvents(e,V),p(e,t)}else e.innerHTML=`<div class="px-3 py-2">${n.renderSetupHtml(V)}</div>`;i?.querySelector(`#fullfør-turnering-btn`)?.addEventListener(`click`,async()=>{if(!await O({title:`Fullfør turnering`,message:`Vil du fullføre turneringa? Dette kan ikkje angrast.`,danger:!0}))return;let{error:n}=await ee(t,P);if(n){k(`Feil ved lagring av plasseringar`,`error`);return}let{error:r}=await b(t);if(r){k(`Feil ved fullføring av turnering`,`error`);return}await f(e,t)}),n.bindHeaderEvents(i,V)}catch(t){F(`avsluttendeBase.lastOgVis`,t),e.replaceChildren(w(`Kunne ikkje laste avsluttande fase.`))}}function p(e,i){if(r)return;let a=E(i,[`avsluttende`],e,f,()=>{r&&=(t(r),null)});r=s(i,n.channelName(i),a)}return d}var re=ne({channelName:e=>`stevne-avsl-cup-${e}`,renderKamparHtml:e=>{let{avslKampar:t,stilling:n,startnrMap:r,isAdmin:i}=e;return`<div class="d-flex gap-3 flex-wrap">${[...new Set(n.map(e=>e.gruppe?.navn).filter(e=>e!=null))].sort().map(e=>{let a=t.filter(t=>t.gruppe_navn===e),o=n.filter(t=>t.gruppe?.navn===e),s=o.filter(e=>e.runde_eliminert==null).length,c=o.length,l=a.length?Math.max(...a.map(e=>e.runde_nummer)):0,u=a.filter(e=>e.runde_nummer===l),d=u.length>0&&u.every(e=>e.er_bekreftet||e.er_walkover),f=a.some(e=>e.runde_navn===`Semifinale`);return ie(e,a,s,c,l,i&&(a.length===0||d)&&s>1&&!f,r,i)}).join(``)}</div>`},bindKamparEvents:(e,t)=>{!t.isAdmin&&t.avslKampar.length===0||oe(e,t.stevneid,t.avslKampar,t.isAdmin,t.reload,t.startnrMap)},renderSetupHtml:e=>{let{stevne:t,isAdmin:n,runde1Format:r,pameldingCount:i,stilling:a}=e,o=r?.nA??null;if(t.stevne_fase===`avsluttende`)return n?V(a,{visSpelarliste:!0,initNa:o,initFormat:r}):`<p class="text-muted fst-italic">Gruppefordeling er ikkje klar enno.</p>`;if(i>0&&n){let e=a.length>0;return V(e?a:i,{visSpelarliste:e,initNa:o,initFormat:r})}return``},bindHeaderEvents:(e,t)=>{let{container:n,stevneid:r,stevne:i,stilling:a,runde1Format:o,alleInnlBekrefta:s,harGruppefordeling:c,gruppeNavnMap:l,reload:u}=t;if(e?.querySelector(`#start-avsl-btn`)?.addEventListener(`click`,async()=>{if(!s)return;let{error:e}=await y(r,`avsluttende`);if(e){k(`Feil ved oppstart av avsluttande fase`,`error`);return}if(o?.nA!=null){let e=o.nA,t=l.A??null,n=l.B??null,{error:i}=await j(r,a.map((r,i)=>({kasterid:r.kasterid,gruppeid:i<e?t:n??t})));if(i){k(`Feil ved lagring av gruppefordeling`,`error`);return}}await u()}),!c){let e=a.length;function t(e,t){let r=n.querySelector(`input[name="${e}"]:checked`);if(r?.dataset.oppsett)try{return JSON.parse(r.dataset.oppsett)}catch{}return f(t)[0]??null}let o=n.querySelector(`#gruppe-paneler`);o&&o.addEventListener(`change`,r=>{let i=r.target;if(!i.matches(`input[name^="runde1-format"]`))return;let o=parseInt(n.querySelector(`input[name="gruppe-split"]:checked`)?.value??String(e)),s=e-o,c=t(`runde1-format-a`,o),l=t(`runde1-format-b`,s);if(i.name===`runde1-format-a`){let e=n.querySelector(`#struktur-a`);e&&(e.outerHTML=G(o,c,`a`))}else{let e=n.querySelector(`#struktur-b`);e&&(e.outerHTML=G(s,l,`b`))}let u=c?.walkovers??0,d=l?.walkovers??0,f=n.querySelector(`#gruppe-preview`);f&&(f.innerHTML=H(a.map((e,t)=>({...e,cupPlassering:t+1})),o,u,d))}),n.querySelectorAll(`input[name="gruppe-split"]`).forEach(t=>{t.addEventListener(`change`,()=>{let r=parseInt(t.value),i=e-r,s=f(r)[0]??null,c=i>=2?f(i)[0]??null:null;o&&(o.innerHTML=`<div id="gruppe-panel-a" class="avsl-gruppe-kol">
                ${K(`Gruppe A`,r,`runde1-format-a`,s)}
              </div>`+(i>=2?`<div id="gruppe-panel-b" class="avsl-gruppe-kol">
                ${K(`Gruppe B`,i,`runde1-format-b`,c)}
              </div>`:``));let l=s?.walkovers??0,u=c?.walkovers??0,d=n.querySelector(`#gruppe-preview`);d&&(d.innerHTML=H(a.map((e,t)=>({...e,cupPlassering:t+1})),r,l,u))})}),n.querySelector(`#bekreft-gruppe-btn`)?.addEventListener(`click`,async()=>{let o=n.querySelector(`input[name="gruppe-split"]:checked`);if(!o)return;let s=parseInt(o.value),c=e-s,{error:d}=await v(r,{A:t(`runde1-format-a`,s),B:c>=2?t(`runde1-format-b`,c):null,nA:s});if(d){k(`Feil ved lagring av format`,`error`);return}if(i.stevne_fase===`avsluttende`){let e=l.A??null,t=l.B??null,{error:n}=await j(r,a.map((n,r)=>({kasterid:n.kasterid,gruppeid:r<s?e:t??e})));if(n){k(`Feil ved lagring av gruppefordeling`,`error`);return}}await u()})}e?.querySelector(`#endre-gruppeinndeling-btn`)?.addEventListener(`click`,async()=>{await O({title:`Tilbakestill gruppeinndeling`,message:`Gruppefordeling og format vert fjerna.`,danger:!0})&&(await Promise.all([P(r),v(r,null)]),await u())}),c&&n.querySelectorAll(`[data-generer-gruppe]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.genererGruppe??``,n=parseInt(e.dataset.runde??`1`);q(r,t,a.filter(e=>e.gruppe?.navn===t),n,o,u)})})}});function ie(e,t,n,r,i,a,o,s=!0){let c=new Map;for(let e of t)c.has(e.runde_nummer)||c.set(e.runde_nummer,[]),c.get(e.runde_nummer).push(e);let l=[...c.entries()].reverse().map(([e,t])=>{let n=t[0]?.runde_navn??`Runde ${e}`,r=t.filter(e=>!e.er_walkover);return r.length?`
      <h6 class="fw-bold text-center mb-1">${m(n)}</h6>
      <div class="d-flex flex-wrap gap-2 mb-2">
        ${r.map(e=>Q(e,o,s)).join(``)}
      </div>`:``}).join(``),u=i+1,d=a?`<button class="btn btn-success w-100 mt-2"
         data-generer-gruppe="${m(e)}" data-runde="${u}">
         Generer runde ${u}
       </button>`:``;return`
    <div class="avsl-gruppe-kol">
      <h6 class="text-center fw-bold mb-2">Gruppe ${m(e)} (${r} spelarar)</h6>
      ${d}
      ${l}
    </div>`}function Q(e,t,n=!0){let r=e.spelarar.slice().sort((e,n)=>(t[e.kasterid??0]??999)-(t[n.kasterid??0]??999)),i=e=>e?.kaster?`${m(e.kaster.fornavn)} ${m(e.kaster.etternavn)}`:`—`,a=e.er_bekreftet||e.er_walkover,s=n&&e.er_bekreftet&&!e.er_tre_spelarar,c=e.er_walkover?`<tr>
        <td>${t[r[0]?.kasterid??0]??``}</td>
        <td colspan="2">${i(r[0])} <span class="badge bg-secondary">Walkover</span></td>
      </tr>`:r.map(n=>{let a=o(n),c=a>0?a:`—`,l=r.length,u=e.er_bekreftet&&n.kamp_plassering!=null&&n.kamp_plassering>=l,d=e.er_bekreftet&&n.kamp_plassering!=null&&n.kamp_plassering<l,f=u?`kamp-eliminert`:d?`kamp-vidare`:``,p=s?` data-endre-score="${e.id}" class="text-center score-redigerbar"`:` class="text-center"`;return`<tr${f?` class="${f}"`:``}>
          <td class="th-36 text-center">${t[n.kasterid??0]??``}</td>
          <td>${i(n)}</td>
          <td${p}>${c}</td>
        </tr>`}).join(``),l=r.some(e=>(e.omgangar?.length??0)>0),u,d,f,p;if(e.er_tre_spelarar)u=a?`btn-success`:`btn-outline-secondary`,d=a?`Endre plassering`:`Sett plassering`,f=!1,p=``;else{let t=I(e,ae(r),l);u=a?`btn-secondary`:t?`btn-success`:`btn-outline-secondary`,d=a?`Bekreftet`:`Bekreft`,f=a||!t,p=` btn-bekreft`}return`
    <div class="avsl-kamp-block">
      <div class="text-center small fw-semibold text-muted mb-1">Bane ${e.bane_nummer}</div>
      <table class="table table-sm table-bordered mb-0 bg-white">
        <tbody>
          ${c}
          <tr>
            <td colspan="3" class="text-end pe-1">
              ${n&&!e.er_walkover&&!e.er_tre_spelarar?`<button class="btn btn-primary btn-sm" id="plus-${e.id}"${a?` disabled`:``}>+</button> `:``}
              <button class="btn btn-secondary btn-sm" id="scoreboard-${e.id}"
                title="Scoreboard"${a&&!e.er_tre_spelarar?` disabled`:``}>S</button>
              ${n?`<button class="btn ${u} btn-sm${p}" id="bekrft-${e.id}"${f?` disabled`:``}>${d}</button>`:``}
            </td>
          </tr>
        </tbody>
      </table>
    </div>`}function ae(e){return e.map(e=>({kasterid:e.kasterid??0,kamp_poeng:e.kamp_poeng??0,score_poeng:e.score_poeng??0,antall_ringer:e.antall_ringer,omgangar:e.omgangar,kaster:e.kaster}))}function oe(e,t,r,i,a,s){for(let c of r){let r=c.spelarar.slice().sort((e,t)=>(s[e.kasterid??0]??1/0)-(s[t.kasterid??0]??1/0));if(e.querySelector(`#plus-${c.id}`)?.addEventListener(`click`,async()=>{let e=r[0],t=r[1];B(e?.kaster?`${e.kaster.fornavn} ${e.kaster.etternavn}`:`—`,t?.kaster?`${t.kaster.fornavn} ${t.kaster.etternavn}`:`—`,o(e),o(t),async(n,r)=>{let i=[];e?.id&&i.push(z(e.id,n)),t?.id&&i.push(z(t.id,r)),await Promise.all(i),await a()})}),e.querySelector(`#scoreboard-${c.id}`)?.addEventListener(`click`,()=>{window.open(`#/kamp/${c.id}`,`_blank`)}),e.querySelector(`#bekrft-${c.id}`)?.addEventListener(`click`,async e=>{if(c.er_tre_spelarar)J(c,r,t,async()=>{await $(t,c),await a()});else{let n=e.currentTarget;n.disabled=!0,n.textContent=`Lagrer…`;try{await se(t,c,r,a)||(n.disabled=!1,n.textContent=`Bekreft`)}catch{n.disabled=!1,n.textContent=`Bekreft`}}}),i&&c.er_bekreftet&&!c.er_tre_spelarar){let i=r[0],s=r[1],l=i?.kaster?`${i.kaster.fornavn} ${i.kaster.etternavn}`:`—`,u=s?.kaster?`${s.kaster.fornavn} ${s.kaster.etternavn}`:`—`,d=r.map(e=>e.kasterid).filter(e=>e!=null),f=()=>{B(l,u,o(i),o(s),async(e,r)=>{let o=[i?.id,s?.id].filter(e=>e!=null);if(o.length){let{error:e}=await _(o);if(e){k(`DB-feil ved sletting av omgangar`,`error`);return}}let l=[];if(i?.id&&l.push(z(i.id,e)),s?.id&&l.push(z(s.id,r)),(await Promise.all(l)).find(e=>e.error)?.error){k(`DB-feil ved oppdatering av score`,`error`);return}let u=e>=r?i?.kasterid:s?.kasterid,f=e>=r?s?.kasterid:i?.kasterid;await n({stevneId:t,rundeNummer:c.runde_nummer,rundeNavn:c.runde_navn,allKasterids:d,nyVinnarId:u,nyTaparId:f}),await a()})};e.querySelectorAll(`[data-endre-score="${c.id}"]`).forEach(e=>e.addEventListener(`click`,f))}}}async function se(e,t,n,r){let i=n[0],a=n[1],{data:s}=await h(t.id),c=s.find(e=>e.id===i?.id),l=s.find(e=>e.id===a?.id),u=o(c??i),f=o(l??a);if(u===0&&f===0&&!await O({title:`Ingen score registrert`,message:`Vil du bekrefte kampen likevel?`}))return!1;let p=u>=f?i:a,m=u>=f?a:i,g=n.map(e=>e.kasterid).filter(e=>e!=null),_=p?.kasterid==null?[]:[p.kasterid],{error:v}=await d({kampId:t.id,stevneId:e,rundeNummer:t.runde_nummer,rundeNavn:t.runde_navn,allKasterids:g,eliminertId:m?.kasterid??null,vidareIds:_});return v?(k(`DB-feil ved bekreft`,`error`),!1):(await $(e,t),await r(),!0)}async function $(e,t){t.runde_navn!==`Semifinale`||!t.gruppe_navn||await p(e,t.gruppe_navn)&&await L(e,t.gruppe_navn)}export{re as render};