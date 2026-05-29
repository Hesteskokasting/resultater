import{$ as e,A as t,B as n,C as r,D as i,E as a,H as o,I as s,K as c,M as l,O as u,P as d,Q as f,R as p,T as m,U as h,V as g,X as _,Y as v,Z as y,_ as b,b as x,d as S,et as C,f as w,g as T,h as E,j as D,k as O,n as k,nt as A,o as j,p as M,q as N,r as P,s as F,t as I,tt as L,u as R,v as z,w as B,x as V,z as H}from"./index-qbVhMqMH.js";import{t as U}from"./ScoreNumberpad-C-b3sWkY.js";function W(e,{visSpelarliste:t=!0,initNa:n=null,initFormat:r=null}={}){let a=typeof e==`number`?e:e.length,o=typeof e==`number`?[]:e.map((e,t)=>({...e,cupPlassering:t+1})),s=i(a),c=n===a?a:n!=null&&s.some(e=>e.nA===n)?n:s[0]?.nA??a,l=a-c,d=s.filter(e=>u(e.nA).some(e=>e.c3>0)),f=s.filter(e=>!u(e.nA).some(e=>e.c3>0)),p=u(a).length>0,m=(e,t)=>e.map((e,r)=>{let i=e.nA===c&&n!==a,o=t+r;return`
      <div class="form-check">
        <input class="form-check-input" type="radio" name="gruppe-split" id="split-${o}" value="${e.nA}" ${i?`checked`:``}>
        <label class="form-check-label" for="split-${o}">A:${e.nA} — B:${e.nB}</label>
      </div>`}).join(``),h=[];d.length&&h.push(`<div class="text-muted small fw-semibold mb-1">3 spillere per bane (A)</div>${m(d,0)}`),f.length&&(h.length&&h.push(`<hr class="my-2">`),h.push(`<div class="text-muted small fw-semibold mb-1">2 spillere per bane (A)</div>${m(f,d.length)}`)),p&&(h.length&&h.push(`<hr class="my-2">`),h.push(`
      <div class="form-check">
        <input class="form-check-input" type="radio" name="gruppe-split" id="split-ingen" value="${a}" ${n===a?`checked`:``}>
        <label class="form-check-label" for="split-ingen">Ingen gruppeinndeling (alle i A)</label>
      </div>`));let g=h.join(``),_=r?.A??u(c)[0]??null,v=l>=2?r?.B??u(l)[0]??null:null,y=t?`<div id="gruppe-preview">${G(o,c,_?.walkovers??0,v?.walkovers??0)}</div>`:``;return`
    <div id="gruppe-val-wrapper" data-n="${a}">
      <h5 class="mb-3">Velg gruppeinndeling for cup</h5>
      <div class="d-flex flex-column flex-lg-row gap-3 align-items-start mb-3">
        <div class="card">
          <div class="card-body">
            ${g}
          </div>
        </div>
        <div id="gruppe-paneler" class="d-flex gap-3 flex-wrap">
          <div id="gruppe-panel-a" class="avsl-gruppe-kol">
            ${Y(`Gruppe A`,c,`runde1-format-a`,_)}
          </div>
          ${l>=2?`<div id="gruppe-panel-b" class="avsl-gruppe-kol">
            ${Y(`Gruppe B`,l,`runde1-format-b`,v)}
          </div>`:``}
        </div>
      </div>
      <div class="mt-3">
        <button id="bekreft-gruppe-btn" class="btn btn-success btn-lg w-100">Bekreft gruppefordeling</button>
      </div>
      ${y}
    </div>
  `}function G(t,n,r=0,i=0){let a=t.slice(0,n),o=t.slice(n);function s(t,n=0){return t.map((t,r)=>{let i=r<n;return`
      <tr>
        <td>${t.cupPlassering}</td>
        <td>${e(String(t.startnummer??``))}</td>
        <td>${e(t.navn??``)}${i?` <span class="badge bg-info text-dark">Walkover</span>`:``}</td>
        <td class="text-center">${t.kamp_poeng??0}</td>
        <td class="text-center">${t.score_poeng??0}</td>
      </tr>`}).join(``)}let c=`
    <thead class="org-thead"><tr>
      <th class="th-32">#</th><th class="th-36">S</th><th>NAMN</th>
      <th class="th-44 text-center">KP</th>
      <th class="th-44 text-center">SP</th>
    </tr></thead>`,l=`
    <table class="table table-bordered table-sm bg-white mb-0">
      ${c}
      <tbody>${s(a,r)}</tbody>
    </table>`,u=o.length?`
    <table class="table table-bordered table-sm bg-white mb-0">
      ${c}
      <tbody>${s(o,i)}</tbody>
    </table>`:``;return`
    <div class="d-flex gap-3 flex-wrap">
      <div class="avsl-gruppe-kol">
        <h6 class="fw-bold text-center">GRUPPE A (${a.length})</h6>
        ${l}
      </div>
      ${o.length?`<div class="avsl-gruppe-kol">
        <h6 class="fw-bold text-center">GRUPPE B (${o.length})</h6>
        ${u}
      </div>`:``}
    </div>`}function K(e){let t=e.c3>0?3:2;return`${e.walkovers} walkover - ${t} deltakere per bane`}function q(e,t,n,r=null){let i=u(t);return i.length<=1?``:`<div class="d-flex flex-column align-items-start gap-1 mb-2">${i.map((e,t)=>{let i=`${n}-${t}`,a=JSON.stringify(e),o=r?e.walkovers===r.walkovers&&e.c3===r.c3&&e.c2===r.c2:t===0,s=e.c3>0?`btn-outline-success`:`btn-outline-warning`;return`
      <input type="radio" class="btn-check" name="${n}" id="${i}"
        value='${a}' data-oppsett='${a}' autocomplete="off" ${o?`checked`:``}>
      <label class="btn btn-sm ${s}" for="${i}">${K(e)}</label>`}).join(``)}</div>`}function J(e,t,n){return`<div id="struktur-${n}">
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
  </div>`}function Y(e,t,n,r){let i=n.slice(-1),a=q(e,t,n,r);return`
    <div class="card">
      <div class="card-body">
        <h6 class="fw-bold mb-2">${a?`${e}: Velg format`:`${e} (${t})`}</h6>
        ${a}
        ${J(t,r,i)}
      </div>
    </div>`}function X(t,n,i,a,o,s){let c=i.filter(e=>e.runde_eliminert==null),l=i.length,u=c.length,d=a===1?o?.[n]??null:null,f=d?.walkovers??0,p=(d?d.c3:u%3==0?u/3:0)+(d?d.c2:u%3==0?0:u/2),h=c.slice(f,f+p),g=c.slice(f+p,f+2*p),_=c.slice(f+2*p),v=document.createElement(`div`);v.className=`avsl-dialog-overlay`,document.body.appendChild(v);let y=null,b=!1,x=0,S=0;function C(e){if(!b)return;let t=v.querySelector(`.avsl-dialog-card-wide`);if(!t)return;let n=e.clientX-x,r=e.clientY-S;y={left:n,top:r},t.style.left=`${n}px`,t.style.top=`${r}px`}function w(){b&&(b=!1,document.body.style.userSelect=``)}document.addEventListener(`mousemove`,C),document.addEventListener(`mouseup`,w);function T(){document.removeEventListener(`mousemove`,C),document.removeEventListener(`mouseup`,w)}function E(t){return`<div class="d-flex justify-content-between gap-2 py-1">
      <span class="small">${e(t.navn??``)}</span>
      <span class="small text-muted text-nowrap">${t.kamp_poeng??0}p (${t.score_poeng??0})</span>
    </div>`}function D(i){let C=c.slice(0,f),w=C.length>0?`<div class="mb-3">
          <strong class="d-block mb-1">Walkovers (går vidare utan kamp):</strong>
          ${C.map(E).join(``)}
        </div>`:``,k=i&&p>0?`<div class="alert alert-info small mb-3 py-2">
          Dette er seedinggrupper, ikkje kampar. Spelarar i same gruppe kan ikkje trekkast mot kvarandre. Kampane blir oppretta når du klikkar «Bekreft og opprett kampar».
        </div>`:``,j=i&&p>0?`<div class="d-flex gap-3 flex-wrap mb-3">
          ${[{label:`Seeding 1`,pool:h},{label:`Seeding 2`,pool:g},..._.length?[{label:`Seeding 3`,pool:_}]:[]].map(({label:t,pool:n})=>`
            <div class="card flex-grow-1">
              <div class="card-body p-2">
                <strong class="d-block mb-2 small text-uppercase">${e(t)}</strong>
                ${n.map(E).join(``)}
              </div>
            </div>`).join(``)}
        </div>`:`<div class="avsl-player-columns mb-3">
          ${c.slice(f).map((t,n)=>`
            <div class="small d-flex justify-content-between gap-2">
              <span>${f+n+1}. ${e(t.navn??``)}</span>
              <span class="text-muted text-nowrap">${t.kamp_poeng??0}p (${t.score_poeng??0})</span>
            </div>`).join(``)}
        </div>`;v.innerHTML=`
      <div class="card avsl-dialog-card-wide">
        <div class="avsl-dialog-drag-handle">
          <p class="text-muted small text-uppercase fw-semibold mb-1">Trekning</p>
          <h5 class="mb-1">Gruppe ${e(n)} — Runde ${a}</h5>
          <p class="text-muted small mb-0">${u} av ${l} spelarar igjen</p>
        </div>
        <div class="avsl-dialog-body">
          <div class="form-check mb-2">
            <input class="form-check-input" type="checkbox" id="seeding-dlg" ${i?`checked`:``}>
            <label class="form-check-label" for="seeding-dlg">Bruk seeding</label>
          </div>
          ${k}
          ${w}
          ${j}
        </div>
        <div class="avsl-dialog-footer">
          <div class="d-flex gap-2">
            <button id="bekreft-gen-btn" class="btn btn-primary">Bekreft og opprett kampar</button>
            <button id="avbryt-gen-btn" class="btn btn-secondary">Avbryt</button>
          </div>
        </div>
      </div>`;let M=v.querySelector(`.avsl-dialog-card-wide`);y&&(M.style.position=`fixed`,M.style.left=`${y.left}px`,M.style.top=`${y.top}px`,M.style.margin=`0`,M.style.zIndex=`10000`),M.querySelector(`.avsl-dialog-drag-handle`).addEventListener(`mousedown`,e=>{let t=M.getBoundingClientRect();M.style.position=`fixed`,M.style.left=`${t.left}px`,M.style.top=`${t.top}px`,M.style.margin=`0`,M.style.zIndex=`10000`,x=e.clientX-t.left,S=e.clientY-t.top,y={left:t.left,top:t.top},b=!0,document.body.style.userSelect=`none`}),v.querySelector(`#seeding-dlg`).addEventListener(`change`,e=>D(e.target.checked)),v.querySelector(`#avbryt-gen-btn`).addEventListener(`click`,()=>{T(),v.remove()}),v.querySelector(`#bekreft-gen-btn`).addEventListener(`click`,async()=>{let e=v.querySelector(`#seeding-dlg`).checked,i=v.querySelector(`#bekreft-gen-btn`);i.disabled=!0,i.textContent=`Lagrer…`;try{let i=c.map((e,t)=>({kasterid:e.kasterid,plassering:t+1}));if(a===1){let a={A:o?.A??void 0,B:o?.B??void 0};await r(t,[{gruppeNavn:n,spelarar:i,runde1Oppsett:d}],e,o?a:null)}else await m(t,n,e,i);T(),v.remove(),await s()}catch(e){A(`cup:genererRunde`,e),O(`Feil ved generering av runde`,`error`),i.disabled=!1,i.textContent=`Bekreft og opprett kampar`}})}D(!0)}function Z(t,n,r,i){let a=n.map(t=>t?.kaster?`${e(t.kaster.fornavn)} ${e(t.kaster.etternavn)}`:`Spelar ?`),o=[],s=document.createElement(`div`);s.className=`avsl-dialog-overlay`,document.body.appendChild(s);function c(){let e=o.length===2?n.find(e=>e.kasterid!=null&&!o.includes(e.kasterid)):null;s.innerHTML=`
      <div class="card p-4 avsl-dialog-card">
        <h5 class="card-title mb-1">Bekreft 3-spelar kamp</h5>
        <p class="text-muted small mb-3">Vel dei to som går vidare. Den gjenverande er eliminert.</p>
        <div class="d-flex flex-column gap-2 mb-3">
          ${n.map((t,n)=>{let r=t.kasterid==null?-1:o.indexOf(t.kasterid),i=r!==-1,s=!!e&&e.kasterid===t.kasterid,c=r===0?`1. plass`:r===1?`2. plass`:``;return`<button
              class="btn ${i?`btn-success`:s?`btn-outline-danger`:`btn-outline-secondary`} text-start d-flex justify-content-between align-items-center"
              data-kasterid="${t.kasterid}"
              ${s?`disabled`:``}
            ><span>${a[n]}</span>${c?`<span class="badge bg-success-subtle text-success-emphasis">${c}</span>`:s?`<span class="badge bg-danger">Eliminert</span>`:``}</button>`}).join(``)}
        </div>
        <div class="d-flex gap-2">
          <button id="bekreft-tre-btn" class="btn btn-success" ${o.length===2?``:`disabled`}>Bekreft</button>
          <button id="avbryt-tre-btn" class="btn btn-secondary">Avbryt</button>
        </div>
      </div>
    `,s.querySelector(`#avbryt-tre-btn`).addEventListener(`click`,()=>s.remove()),s.querySelectorAll(`[data-kasterid]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=Number(e.dataset.kasterid),n=o.indexOf(t);n===-1?o.length<2&&o.push(t):o.splice(n,1),c()})}),s.querySelector(`#bekreft-tre-btn`)?.addEventListener(`click`,async()=>{if(o.length!==2)return;let e=n.find(e=>e.kasterid!=null&&!o.includes(e.kasterid))?.kasterid??null,a=n.map(e=>e.kasterid).filter(e=>e!=null);s.remove();let{error:c}=await l({kampId:t.id,stevneId:r,rundeNummer:t.runde_nummer,rundeNavn:t.runde_navn,allKasterids:a,eliminertId:e,vidareIds:[...o]});if(c){O(`DB-feil ved bekreft`,`error`);return}await i()})}c()}function Q(e){return typeof e!=`object`||!e||Array.isArray(e)?null:e}function ee(e){return e.map(e=>({er_bekreftet:e.er_bekreftet,er_walkover:e.er_walkover,runde_nummer:e.runde_nummer,bane_nummer:e.bane_nummer,spelarar:te(e.spelarar)}))}function te(e){return e.map(e=>({kasterid:e.kasterid??0,kamp_poeng:e.kamp_poeng??0,score_poeng:e.score_poeng??0,antall_ringer:e.antall_ringer,omgangar:e.omgangar,kaster:e.kaster}))}function ne(e){let n=null,r=null,i=!1,a=new Set;async function o(e,{id:a,isAdmin:o=!1},s=null){r=s,i=o,n&&=(await t(n),null),e.replaceChildren(C(`Laster…`)),await c(e,a)}async function c(t,n){try{let[{data:o},{data:u},{data:d},{data:p},{count:m}]=await Promise.all([N(n),s(n),P(n),k([`A`,`B`]),v(n)]);if(!o){t.replaceChildren(L(`Stevne ikkje funne.`));return}let h=d.filter(e=>e.kasterid!=null),g=u.filter(e=>e.fase===`innledende`),_=u.filter(e=>e.fase===`avsluttende`),y={};for(let e of h)e.startnummer!=null&&(y[e.kasterid]=e.startnummer);let C={};for(let e of u)for(let t of e.spelarar)t.kasterid&&t.kaster&&!C[t.kasterid]&&(C[t.kasterid]=`${t.kaster.fornavn} ${t.kaster.etternavn}`);let T=ee(g),A=M(T,h,C,y),j=g.length>0&&g.every(e=>e.er_bekreftet),I=_.length>0,R=h.some(e=>e.gruppe!=null),B=Object.fromEntries(p.map(e=>[e.navn,e.id])),H=Q(o.runde1_format),U={container:t,stevneid:n,stevne:o,stilling:A,startnrMap:y,navnMap:C,innlKampar:g,avslKampar:_,resultat:h,isAdmin:i,harGruppefordeling:R,alleInnlBekrefta:j,harAvslKampar:I,runde1Format:H,pameldingCount:m??0,gruppeNavnMap:B,reload:()=>c(t,n)};i&&r&&(r.innerHTML=b(o,{alleInnlBekrefta:j,harAvslKampar:I,harGruppefordeling:R,harPrekonfigurertFormat:H!=null&&o.stevne_fase!==`avsluttende`}));let W=E(t);if(R){let r=x(A,T,y,{tableId:`stilling-avsl`,harGrupper:!0,harEliminasjon:!0});t.innerHTML=`<div class="px-3 py-2">${z(e.renderKamparHtml(U),r)}</div>`,S(t,`stilling-avsl`,a),w(t),W===`stilling`&&V(t,`stilling`),e.bindKamparEvents(t,U),l(t,n)}else t.innerHTML=`<div class="px-3 py-2">${e.renderSetupHtml(U)}</div>`;r?.querySelector(`#fullfør-turnering-btn`)?.addEventListener(`click`,async()=>{if(!await D({title:`Fullfør turnering`,message:`Vil du fullføre turneringa? Dette kan ikkje angrast.`,danger:!0}))return;let{error:e}=await F(n,[...A.filter(e=>e.gruppe?.navn===`A`),...A.filter(e=>e.gruppe?.navn===`B`),...A.filter(e=>e.gruppe?.navn!==`A`&&e.gruppe?.navn!==`B`)]);if(e){O(`Feil ved lagring av plasseringar`,`error`);return}let{error:r}=await f(n);if(r){O(`Feil ved fullføring av turnering`,`error`);return}await c(t,n)}),e.bindHeaderEvents(r,U)}catch(e){A(`avsluttendeBase.lastOgVis`,e),t.replaceChildren(L(`Kunne ikkje laste avsluttande fase.`))}}function l(r,i){if(n)return;let a=T(i,[`avsluttende`],r,c,()=>{n&&=(t(n),null)});n=h(i,e.channelName(i),a)}return o}var re=ne({channelName:e=>`stevne-avsl-cup-${e}`,renderKamparHtml:e=>{let{avslKampar:t,stilling:n,startnrMap:r,isAdmin:i}=e;return`<div class="d-flex gap-3 flex-wrap">${[...new Set(n.map(e=>e.gruppe?.navn).filter(e=>e!=null))].sort().map(e=>{let a=t.filter(t=>t.gruppe_navn===e),o=n.filter(t=>t.gruppe?.navn===e),s=o.filter(e=>e.runde_eliminert==null).length,c=o.length,l=a.length?Math.max(...a.map(e=>e.runde_nummer)):0,u=a.filter(e=>e.runde_nummer===l),d=u.length>0&&u.every(e=>e.er_bekreftet||e.er_walkover),f=a.some(e=>e.runde_navn===`Semifinale`);return ie(e,a,s,c,l,i&&(a.length===0||d)&&s>1&&!f,r,i)}).join(``)}</div>`},bindKamparEvents:(e,t)=>{!t.isAdmin&&t.avslKampar.length===0||se(e,t.stevneid,t.avslKampar,t.isAdmin,t.reload,t.startnrMap)},renderSetupHtml:e=>{let{stevne:t,isAdmin:n,runde1Format:r,pameldingCount:i,stilling:a}=e,o=r?.nA??null;if(t.stevne_fase===`avsluttende`)return n?W(a,{visSpelarliste:!0,initNa:o,initFormat:r}):`<p class="text-muted fst-italic">Gruppefordeling er ikkje klar enno.</p>`;if(i>0&&n){let e=a.length>0;return W(e?a:i,{visSpelarliste:e,initNa:o,initFormat:r})}return``},bindHeaderEvents:(e,t)=>{let{container:n,stevneid:r,stevne:i,stilling:a,runde1Format:o,alleInnlBekrefta:s,harGruppefordeling:c,gruppeNavnMap:l,reload:d}=t;if(e?.querySelector(`#start-avsl-btn`)?.addEventListener(`click`,async()=>{if(!s)return;let{error:e}=await _(r,`avsluttende`);if(e){O(`Feil ved oppstart av avsluttande fase`,`error`);return}if(o?.nA!=null){let e=o.nA,t=l.A??null,n=l.B??null,{error:i}=await j(r,a.map((r,i)=>({kasterid:r.kasterid,gruppeid:i<e?t:n??t})));if(i){O(`Feil ved lagring av gruppefordeling`,`error`);return}}await d()}),!c){let e=parseInt(n.querySelector(`#gruppe-val-wrapper`)?.dataset.n??`0`)||a.length;function t(e,t){let r=n.querySelector(`input[name="${e}"]:checked`);if(r?.dataset.oppsett)try{return JSON.parse(r.dataset.oppsett)}catch{}return u(t)[0]??null}let o=n.querySelector(`#gruppe-paneler`);o&&o.addEventListener(`change`,r=>{let i=r.target;if(!i.matches(`input[name^="runde1-format"]`))return;let o=parseInt(n.querySelector(`input[name="gruppe-split"]:checked`)?.value??String(e)),s=e-o,c=t(`runde1-format-a`,o),l=t(`runde1-format-b`,s);if(i.name===`runde1-format-a`){let e=n.querySelector(`#struktur-a`);e&&(e.outerHTML=J(o,c,`a`))}else{let e=n.querySelector(`#struktur-b`);e&&(e.outerHTML=J(s,l,`b`))}let u=c?.walkovers??0,d=l?.walkovers??0,f=n.querySelector(`#gruppe-preview`);f&&(f.innerHTML=G(a.map((e,t)=>({...e,cupPlassering:t+1})),o,u,d))}),n.querySelectorAll(`input[name="gruppe-split"]`).forEach(t=>{t.addEventListener(`change`,()=>{let r=parseInt(t.value),i=e-r,s=u(r)[0]??null,c=i>=2?u(i)[0]??null:null;o&&(o.innerHTML=`<div id="gruppe-panel-a" class="avsl-gruppe-kol">
                ${Y(`Gruppe A`,r,`runde1-format-a`,s)}
              </div>`+(i>=2?`<div id="gruppe-panel-b" class="avsl-gruppe-kol">
                ${Y(`Gruppe B`,i,`runde1-format-b`,c)}
              </div>`:``));let l=s?.walkovers??0,d=c?.walkovers??0,f=n.querySelector(`#gruppe-preview`);f&&(f.innerHTML=G(a.map((e,t)=>({...e,cupPlassering:t+1})),r,l,d))})}),n.querySelector(`#bekreft-gruppe-btn`)?.addEventListener(`click`,async()=>{let o=n.querySelector(`input[name="gruppe-split"]:checked`);if(!o)return;let s=parseInt(o.value),c=e-s,{error:u}=await y(r,{A:t(`runde1-format-a`,s),B:c>=2?t(`runde1-format-b`,c):null,nA:s});if(u){O(`Feil ved lagring av format`,`error`);return}if(i.stevne_fase===`avsluttende`){let e=l.A??null,t=l.B??null,{error:n}=await j(r,a.map((n,r)=>({kasterid:n.kasterid,gruppeid:r<s?e:t??e})));if(n){O(`Feil ved lagring av gruppefordeling`,`error`);return}}O(`Gruppefordeling lagra`,`success`),await d()})}e?.querySelector(`#endre-gruppeinndeling-btn`)?.addEventListener(`click`,async()=>{await D({title:`Tilbakestill gruppeinndeling`,message:`Gruppefordeling og format vert fjerna.`,danger:!0})&&(await Promise.all([I(r),y(r,null)]),await d())}),c&&n.querySelectorAll(`[data-generer-gruppe]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.genererGruppe??``,n=parseInt(e.dataset.runde??`1`);X(r,t,a.filter(e=>e.gruppe?.navn===t),n,o,d)})})}});function ie(t,n,r,i,a,o,s,c=!0){let l=new Map;for(let e of n)l.has(e.runde_nummer)||l.set(e.runde_nummer,[]),l.get(e.runde_nummer).push(e);let u=[...l.entries()].reverse().map(([t,n])=>{let r=n[0]?.runde_navn??`Runde ${t}`,i=n.filter(e=>!e.er_walkover);return i.length?`
      <h6 class="fw-bold text-center mb-1">${e(r)}</h6>
      <div class="d-flex flex-wrap gap-2 mb-2">
        ${i.map(e=>ae(e,s,c)).join(``)}
      </div>`:``}).join(``),d=a+1,f=o?`<button class="btn btn-success w-100 mt-2"
         data-generer-gruppe="${e(t)}" data-runde="${d}">
         Generer runde ${d}
       </button>`:``;return`
    <div class="avsl-gruppe-kol">
      <h6 class="text-center fw-bold mb-2">Gruppe ${e(t)} (${i} spelarar)</h6>
      ${f}
      ${u}
    </div>`}function ae(t,n,r=!0){let i=t.spelarar.slice().sort((e,t)=>(n[e.kasterid??0]??999)-(n[t.kasterid??0]??999)),a=t=>t?.kaster?`${e(t.kaster.fornavn)} ${e(t.kaster.etternavn)}`:`—`,o=t.er_bekreftet||t.er_walkover,s=i.some(e=>(e.omgangar?.length??0)>0),l=r&&t.er_bekreftet&&!t.er_tre_spelarar&&!s,u=t.er_walkover?`<tr>
        <td>${n[i[0]?.kasterid??0]??``}</td>
        <td colspan="2">${a(i[0])} <span class="badge bg-secondary">Walkover</span></td>
      </tr>`:i.map(e=>{let r=c(e),o=r>0?r:`—`,s=i.length,u=t.er_bekreftet&&e.kamp_plassering!=null&&e.kamp_plassering>=s,d=t.er_bekreftet&&e.kamp_plassering!=null&&e.kamp_plassering<s,f=u?`kamp-eliminert`:d?`kamp-vidare`:``,p=l?` data-endre-score="${t.id}" class="text-center score-redigerbar"`:` class="text-center"`;return`<tr${f?` class="${f}"`:``}>
          <td class="th-36 text-center">${n[e.kasterid??0]??``}</td>
          <td>${a(e)}</td>
          <td${p}>${o}</td>
        </tr>`}).join(``),d,f,p,m;if(t.er_tre_spelarar)d=o?`btn-secondary`:`btn-outline-secondary`,f=o?`Endre plassering`:`Sett plassering`,p=!1,m=``;else{let e=R(t,oe(i),s);d=o?`btn-secondary`:e?`btn-success`:`btn-outline-secondary`,f=o?`Bekreftet`:`Bekreft`,p=o||!e,m=` btn-bekreft`}return`
    <div class="avsl-kamp-block">
      <div class="text-center small fw-semibold text-muted mb-1">Bane ${t.bane_nummer}</div>
      <table class="table table-sm table-bordered mb-0 bg-white">
        <tbody>
          ${u}
          <tr>
            <td colspan="3" class="text-end pe-1">
              ${r&&!t.er_walkover&&!t.er_tre_spelarar?`<button class="btn btn-primary btn-sm" id="plus-${t.id}"${o?` disabled`:``}>+</button> `:``}
              <button class="btn btn-secondary btn-sm" id="scoreboard-${t.id}"
                title="Scoreboard"${o&&!t.er_tre_spelarar&&!s?` disabled`:``}>S</button>
              ${r?`<button class="btn ${d} btn-sm${m}" id="bekrft-${t.id}"${p?` disabled`:``}>${f}</button>`:``}
            </td>
          </tr>
        </tbody>
      </table>
    </div>`}function oe(e){return e.map(e=>({kasterid:e.kasterid??0,kamp_poeng:e.kamp_poeng??0,score_poeng:e.score_poeng??0,antall_ringer:e.antall_ringer,omgangar:e.omgangar,kaster:e.kaster}))}function se(e,t,r,i,a,s){for(let l of r){let r=l.spelarar.slice().sort((e,t)=>(s[e.kasterid??0]??1/0)-(s[t.kasterid??0]??1/0));if(e.querySelector(`#plus-${l.id}`)?.addEventListener(`click`,async()=>{let e=r[0],t=r[1];U(e?.kaster?`${e.kaster.fornavn} ${e.kaster.etternavn}`:`—`,t?.kaster?`${t.kaster.fornavn} ${t.kaster.etternavn}`:`—`,c(e),c(t),async(n,r)=>{let i=[];e?.id&&i.push(H(e.id,n)),t?.id&&i.push(H(t.id,r)),await Promise.all(i),await a()})}),e.querySelector(`#scoreboard-${l.id}`)?.addEventListener(`click`,()=>{window.open(`#/kamp/${l.id}`,`_blank`)}),e.querySelector(`#bekrft-${l.id}`)?.addEventListener(`click`,async e=>{if(l.er_tre_spelarar)Z(l,r,t,async()=>{await $(t,l),await a()});else{let n=e.currentTarget;n.disabled=!0,n.textContent=`Lagrer…`;try{await ce(t,l,r,a)||(n.disabled=!1,n.textContent=`Bekreft`)}catch{n.disabled=!1,n.textContent=`Bekreft`}}}),i&&l.er_bekreftet&&!l.er_tre_spelarar){let i=r[0],s=r[1],u=i?.kaster?`${i.kaster.fornavn} ${i.kaster.etternavn}`:`—`,d=s?.kaster?`${s.kaster.fornavn} ${s.kaster.etternavn}`:`—`,f=r.map(e=>e.kasterid).filter(e=>e!=null),p=()=>{U(u,d,c(i),c(s),async(e,r)=>{let c=[i?.id,s?.id].filter(e=>e!=null);if(c.length){let{error:e}=await o(c);if(e){O(`DB-feil ved sletting av omgangar`,`error`);return}}let u=[];if(i?.id&&u.push(H(i.id,e)),s?.id&&u.push(H(s.id,r)),(await Promise.all(u)).find(e=>e.error)?.error){O(`DB-feil ved oppdatering av score`,`error`);return}let d=e>=r?i?.kasterid:s?.kasterid,p=e>=r?s?.kasterid:i?.kasterid,m=[];d!=null&&m.push({kasterid:d,plassering:1}),p!=null&&m.push({kasterid:p,plassering:2});let{error:h}=await g(l.id,m);if(h){O(`DB-feil ved oppdatering av plassering`,`error`);return}await n({stevneId:t,rundeNummer:l.runde_nummer,rundeNavn:l.runde_navn,allKasterids:f,nyVinnarId:d,nyTaparId:p}),await a()})};e.querySelectorAll(`[data-endre-score="${l.id}"]`).forEach(e=>e.addEventListener(`click`,p))}}}async function ce(e,t,n,r){let i=n[0],a=n[1],{data:o}=await p(t.id),s=o.find(e=>e.id===i?.id),u=o.find(e=>e.id===a?.id),d=c(s??i),f=c(u??a);if(d===0&&f===0&&!await D({title:`Ingen score registrert`,message:`Vil du bekrefte kampen likevel?`}))return!1;let m=d>=f?i:a,h=d>=f?a:i,g=n.map(e=>e.kasterid).filter(e=>e!=null),_=m?.kasterid==null?[]:[m.kasterid],{error:v}=await l({kampId:t.id,stevneId:e,rundeNummer:t.runde_nummer,rundeNavn:t.runde_navn,allKasterids:g,eliminertId:h?.kasterid??null,vidareIds:_});return v?(O(`DB-feil ved bekreft`,`error`),!1):(await $(e,t),await r(),!0)}async function $(e,t){t.runde_navn!==`Semifinale`||!t.gruppe_navn||await d(e,t.gruppe_navn)&&await B(e,t.gruppe_navn)}export{re as render};