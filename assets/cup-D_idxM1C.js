import{t as e}from"./logError-DhxY2JQv.js";import{C as t,G as n,J as r,V as i,W as a,Y as o,j as s,p as c,q as l,v as u,y as d}from"./index-pllV3QU0.js";import{t as f}from"./LoadingState-xRmJ3K_t.js";import{C as p,N as m,S as h,a as g,b as _,f as v,k as y,n as b,s as x,x as S,y as C}from"./kampService-Cdqslr0w.js";import{t as w}from"./realtime-NvcShmho.js";import{a as T,i as E,n as D,o as O,r as k,s as A}from"./kampGenereringCupService-BfjHEMX1.js";import{_ as j,b as M,c as ee,d as te,f as N,g as ne,h as P,l as F,m as re,n as ie,r as I,s as L,t as R,u as ae,x as z,y as oe}from"./resultatService-KmIMi6FG.js";import{n as B,t as V}from"./scoreEditor-BuJyxcbe.js";function H(e,{visSpelarliste:t=!0,initNa:n=null,initFormat:r=null}={}){let i=typeof e==`number`?e:e.length,a=typeof e==`number`?[]:e.map((e,t)=>({...e,cupPlassering:t+1})),o=O(i),s=n===i?i:n!=null&&o.some(e=>e.nA===n)?n:o[0]?.nA??i,c=i-s,l=o.filter(e=>A(e.nA).some(e=>e.c3>0)),u=o.filter(e=>!A(e.nA).some(e=>e.c3>0)),d=A(i).length>0,f=(e,t)=>e.map((e,r)=>{let a=e.nA===s&&n!==i,o=t+r;return`
      <div class="form-check">
        <input class="form-check-input" type="radio" name="gruppe-split" id="split-${o}" value="${e.nA}" ${a?`checked`:``}>
        <label class="form-check-label" for="split-${o}">A:${e.nA} — B:${e.nB}</label>
      </div>`}).join(``),p=[];l.length&&p.push(`<div class="text-muted small fw-semibold mb-1">3 spillere per bane (A)</div>${f(l,0)}`),u.length&&(p.length&&p.push(`<hr class="my-2">`),p.push(`<div class="text-muted small fw-semibold mb-1">2 spillere per bane (A)</div>${f(u,l.length)}`)),d&&(p.length&&p.push(`<hr class="my-2">`),p.push(`
      <div class="form-check">
        <input class="form-check-input" type="radio" name="gruppe-split" id="split-ingen" value="${i}" ${n===i?`checked`:``}>
        <label class="form-check-label" for="split-ingen">Alle i A</label>
      </div>`));let m=p.join(``),h=r?.A??A(s)[0]??null,g=c>=2?r?.B??A(c)[0]??null:null,_=t?`<div id="gruppe-preview">${U(a,s,h?.walkovers??0,g?.walkovers??0)}</div>`:``;return`
    <div id="gruppe-val-wrapper" data-n="${i}">
      <h5 class="mb-3">Velg gruppefordeling for cup</h5>
      <div class="d-flex gruppe-layout gap-3 align-items-start mb-3">
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
      ${_}
      <div class="bekreft-banner">
        <button id="bekreft-gruppe-btn" class="btn btn-success btn-lg w-100">Bekreft gruppefordeling</button>
      </div>
    </div>
  `}function U(e,t,n=0,i=0){let a=e.slice(0,t),o=e.slice(t);function s(e,t=0){return e.map((e,n)=>{let i=n<t;return`
      <tr>
        <td>${e.cupPlassering}</td>
        <td>${r(e.navn??``)}${i?` <span class="badge bg-info text-dark">Walkover</span>`:``}</td>
        <td class="text-center">${e.kamp_poeng??0}</td>
        <td class="text-center">${e.score_poeng??0}</td>
      </tr>`}).join(``)}let c=`
    <thead class="org-thead"><tr>
      <th class="th-32">#</th><th>NAMN</th>
      <th class="th-44 text-center">KP</th>
      <th class="th-44 text-center">SP</th>
    </tr></thead>`,l=`
    <table class="table table-bordered table-sm bg-white mb-0">
      ${c}
      <tbody>${s(a,n)}</tbody>
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
    </div>`}function W(e){let t=e.c3>0?3:2;return`${e.walkovers} walkover - ${t} deltakere per bane`}function G(e,t,n,r=null){let i=A(t);return i.length<=1?``:`<div class="d-flex flex-column align-items-start gap-1 mb-2">${i.map((e,t)=>{let i=`${n}-${t}`,a=JSON.stringify(e),o=r?e.walkovers===r.walkovers&&e.c3===r.c3&&e.c2===r.c2:t===0,s=e.c3>0?`btn-outline-success`:`btn-outline-warning`;return`
      <input type="radio" class="btn-check" name="${n}" id="${i}"
        value='${a}' data-oppsett='${a}' autocomplete="off" ${o?`checked`:``}>
      <label class="btn btn-sm ${s}" for="${i}">${W(e)}</label>`}).join(``)}</div>`}function K(e,t,n){return`<div id="struktur-${n}">
    <table class="table table-sm table-bordered mb-0">
      <thead><tr>
        <th>Runde</th><th>Deltakere</th><th>Baner</th><th>Per bane</th>
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
    </div>`}function se(t,n,i,a,o,s){let c=i.filter(e=>e.runde_eliminert==null),l=i.length,d=c.length,f=a===1?o?.[n]??null:null,p=f?.walkovers??0,m=(f?f.c3:d%3==0?d/3:0)+(f?f.c2:d%3==0?0:d/2),h=c.slice(p,p+m),g=c.slice(p+m,p+2*m),_=c.slice(p+2*m),v=document.createElement(`div`);v.className=`avsl-dialog-overlay`,document.body.appendChild(v);let y=null,b=!1,x=0,S=0;function C(e){if(!b)return;let t=v.querySelector(`.avsl-dialog-card-wide`);if(!t)return;let n=e.clientX-x,r=e.clientY-S;y={left:n,top:r},t.style.left=`${n}px`,t.style.top=`${r}px`}function w(){b&&(b=!1,document.body.style.userSelect=``)}document.addEventListener(`mousemove`,C),document.addEventListener(`mouseup`,w);function T(){document.removeEventListener(`mousemove`,C),document.removeEventListener(`mouseup`,w)}function O(e){return`<div class="d-flex justify-content-between gap-2 py-1">
      <span class="small">${r(e.navn??``)}</span>
      <span class="small text-muted text-nowrap">${e.kamp_poeng??0}p (${e.score_poeng??0})</span>
    </div>`}function k(i){let C=c.slice(0,p),w=C.length>0?`<div class="mb-3">
          <strong class="d-block mb-1">Walkovers (går vidare utan kamp):</strong>
          ${C.map(O).join(``)}
        </div>`:``,A=i&&m>0?`<div class="alert alert-info small mb-3 py-2">
          Dette er seedinggrupper, ikkje kampar. Spelarar i same gruppe kan ikkje trekkast mot kvarandre. Kampane blir oppretta når du klikkar «Bekreft og opprett kampar».
        </div>`:``,j=i&&m>0?`<div class="d-flex gap-3 flex-wrap mb-3">
          ${[{label:`Seeding 1`,pool:h},{label:`Seeding 2`,pool:g},..._.length?[{label:`Seeding 3`,pool:_}]:[]].map(({label:e,pool:t})=>`
            <div class="card flex-grow-1">
              <div class="card-body p-2">
                <strong class="d-block mb-2 small text-uppercase">${r(e)}</strong>
                ${t.map(O).join(``)}
              </div>
            </div>`).join(``)}
        </div>`:`<div class="avsl-player-columns mb-3">
          ${c.slice(p).map((e,t)=>`
            <div class="small d-flex justify-content-between gap-2">
              <span>${p+t+1}. ${r(e.navn??``)}</span>
              <span class="text-muted text-nowrap">${e.kamp_poeng??0}p (${e.score_poeng??0})</span>
            </div>`).join(``)}
        </div>`;v.innerHTML=`
      <div class="card avsl-dialog-card-wide">
        <div class="avsl-dialog-drag-handle">
          <p class="text-muted small text-uppercase fw-semibold mb-1">Trekning</p>
          <h5 class="mb-1">Gruppe ${r(n)} — Runde ${a}</h5>
          <p class="text-muted small mb-0">${d} av ${l} spelarar igjen</p>
        </div>
        <div class="avsl-dialog-body">
          <div class="form-check mb-2">
            <input class="form-check-input" type="checkbox" id="seeding-dlg" ${i?`checked`:``}>
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
      </div>`;let M=v.querySelector(`.avsl-dialog-card-wide`);y&&(M.style.position=`fixed`,M.style.left=`${y.left}px`,M.style.top=`${y.top}px`,M.style.margin=`0`,M.style.zIndex=`10000`),M.querySelector(`.avsl-dialog-drag-handle`).addEventListener(`mousedown`,e=>{let t=M.getBoundingClientRect();M.style.position=`fixed`,M.style.left=`${t.left}px`,M.style.top=`${t.top}px`,M.style.margin=`0`,M.style.zIndex=`10000`,x=e.clientX-t.left,S=e.clientY-t.top,y={left:t.left,top:t.top},b=!0,document.body.style.userSelect=`none`}),v.querySelector(`#seeding-dlg`).addEventListener(`change`,e=>k(e.target.checked)),v.querySelector(`#avbryt-gen-btn`).addEventListener(`click`,()=>{T(),v.remove()}),v.querySelector(`#bekreft-gen-btn`).addEventListener(`click`,async()=>{let r=v.querySelector(`#seeding-dlg`).checked,i=v.querySelector(`#bekreft-gen-btn`);i.disabled=!0,i.textContent=`Lagrer…`;try{let e=c.map((e,t)=>({kasterid:e.kasterid,plassering:t+1}));if(a===1){let i={A:o?.A??void 0,B:o?.B??void 0};await D(t,[{gruppeNavn:n,spelarar:e,runde1Oppsett:f}],r,o?i:null)}else await E(t,n,r,e);T(),v.remove(),await s()}catch(t){e(`cup:genererRunde`,t),u(`Feil ved generering av runde`,`error`),i.disabled=!1,i.textContent=`Bekreft og opprett kampar`}})}k(!0)}function ce(e,t,n,r){let i=t.map(e=>z(e,!1)),a=[],o=document.createElement(`div`);o.className=`avsl-dialog-overlay`,document.body.appendChild(o);function s(){let c=a.length===2?t.find(e=>!a.includes(e.rep.kasterid)):null;o.innerHTML=`
      <div class="card p-4 avsl-dialog-card">
        <h5 class="card-title mb-1">Bekreft 3-spelar kamp</h5>
        <p class="text-muted small mb-3">Vel dei to som går vidare. Den gjenverande er eliminert.</p>
        <div class="d-flex flex-column gap-2 mb-3">
          ${t.map((e,t)=>{let n=a.indexOf(e.rep.kasterid),r=n!==-1,o=!!c&&c.rep.kasterid===e.rep.kasterid,s=n===0?`1. plass`:n===1?`2. plass`:``;return`<button
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
    `,o.querySelector(`#avbryt-tre-btn`).addEventListener(`click`,()=>o.remove()),o.querySelectorAll(`[data-kasterid]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=Number(e.dataset.kasterid),n=a.indexOf(t);n===-1?a.length<2&&a.push(t):a.splice(n,1),s()})}),o.querySelector(`#bekreft-tre-btn`)?.addEventListener(`click`,async()=>{if(a.length!==2)return;let i=t.find(e=>!a.includes(e.rep.kasterid))??null,s=a.map(e=>t.find(t=>t.rep.kasterid===e)).filter(e=>e!=null).map(e=>e.members.map(e=>e.kasterid)),c=t.flatMap(e=>e.members.map(e=>e.kasterid));o.remove();let{error:l}=await b({kampId:e.id,stevneId:n,rundeNummer:e.runde_nummer,rundeNavn:e.runde_navn,allKasterids:c,eliminertIds:i?.members.map(e=>e.kasterid)??[],vidareSider:s});if(l){u(`DB-feil ved bekreft`,`error`);return}await r()})}s()}function le(e){return typeof e!=`object`||!e||Array.isArray(e)?null:e}function ue(e){return e.map(e=>({er_bekreftet:e.er_bekreftet,er_walkover:e.er_walkover,runde_nummer:e.runde_nummer,bane_nummer:e.bane_nummer,spelarar:J(e.spelarar)}))}function J(e){return e.map(e=>({kasterid:e.kasterid??0,kamp_poeng:e.kamp_poeng??0,score_poeng:e.score_poeng??0,antall_ringer:e.antall_ringer,omgangar:e.omgangar,kaster:e.kaster}))}function de(r){let i=null,a=null,l=!1,m=new Set;async function h(e,{id:t,isAdmin:n=!1},r=null){a=r,l=n,i&&=(await w(i),null),e.replaceChildren(f(`Laster…`)),await g(e,t)}async function g(i,f){try{let[{data:e},{data:p},{data:h},{data:v},{count:y}]=await Promise.all([t(f),x(f),I(f),ie([`A`,`B`]),s(f)]);if(!e){i.replaceChildren(o(`Stevne ikkje funne.`));return}let b=h.filter(e=>e.kasterid!=null),S=p.filter(e=>e.fase===`innledende`),C=p.filter(e=>e.fase===`avsluttende`),w={},T={},E=new Map;for(let e of b)e.startnummer!=null&&(w[e.kasterid]=e.startnummer,E.set(e.startnummer,(E.get(e.startnummer)??0)+1)),e.posisjon!=null&&(T[e.kasterid]=e.posisjon);let D=[...E.values()].some(e=>e>1),O={};for(let e of p)for(let t of e.spelarar)t.kasterid&&t.kaster&&!O[t.kasterid]&&(O[t.kasterid]=`${t.kaster.fornavn} ${t.kaster.etternavn}`);let k=ue(S),A=N(k,b,O,w,T),P=S.length>0&&S.every(e=>e.er_bekreftet),F=C.length>0,L=P&&(!F||C.every(e=>e.er_bekreftet)),R=b.some(e=>e.gruppe!=null),z=Object.fromEntries(v.map(e=>[e.navn,e.id])),B=le(e.runde1_format),V=y??0;if(e.kategori?.erlagbasert){let{data:e}=await c(f);V=e.length}let H={container:i,stevneid:f,stevne:e,stilling:A,startnrMap:w,posisjonMap:T,erLag:D,navnMap:O,innlKampar:S,avslKampar:C,resultat:b,isAdmin:l,harGruppefordeling:R,alleInnlBekrefta:P,harAvslKampar:F,runde1Format:B,unitCount:V,gruppeNavnMap:z,reload:()=>g(i,f)};l&&a&&(a.innerHTML=ne(e,{allMatchesConfirmed:L,harAvslKampar:F,harGruppefordeling:R,harPrekonfigurertFormat:B!=null&&e.stevne_fase!==`avsluttende`}));let U=re(i);if(R){let e=oe(A,k,w,{tableId:`stilling-avsl`,harGrupper:!0,harEliminasjon:!0,posisjonMap:T,unitLabel:D?`par`:`spelarar`});i.innerHTML=j(r.renderKamparHtml(H),e),ae(i,`stilling-avsl`,m),te(i),U===`stilling`&&M(i,`stilling`),r.bindKamparEvents(i,H),_(i,f)}else i.innerHTML=r.renderSetupHtml(H);a?.querySelector(`#fullfør-turnering-btn`)?.addEventListener(`click`,async()=>{if(!await d({title:`Fullfør turnering`,message:`Vil du fullføre turneringa? Dette kan ikkje angrast.`,danger:!0}))return;let{error:e}=await ee(f,[...A.filter(e=>e.gruppe?.navn===`A`),...A.filter(e=>e.gruppe?.navn===`B`),...A.filter(e=>e.gruppe?.navn!==`A`&&e.gruppe?.navn!==`B`)]);if(e){u(`Feil ved lagring av plasseringar`,`error`);return}let{error:t}=await n(f);if(t){u(`Feil ved fullføring av turnering`,`error`);return}await g(i,f)}),r.bindHeaderEvents(a,H)}catch(t){e(`avsluttendeBase.lastOgVis`,t),i.replaceChildren(o(`Kunne ikkje laste avsluttande fase.`))}}function _(e,t){if(i)return;let n=P(t,[`avsluttende`],e,g,()=>{i&&=(w(i),null)});i=p(t,r.channelName(t),n)}return h}function Y(e,t,n){return y(e.spelarar.filter(e=>e.kasterid!=null),t,n)}function X(e){return e?.members.reduce((e,t)=>e+m(t),0)??0}var fe=de({channelName:e=>`stevne-avsl-cup-${e}`,renderKamparHtml:e=>{let{avslKampar:t,stilling:n,startnrMap:r,posisjonMap:i,erLag:a,isAdmin:o}=e;return`<div class="d-flex gap-3 flex-wrap">${[...new Set(n.map(e=>e.gruppe?.navn).filter(e=>e!=null))].sort().map(e=>{let s=t.filter(t=>t.gruppe_navn===e),c=n.filter(t=>t.gruppe?.navn===e),l=c.filter(e=>e.runde_eliminert==null).length,u=c.length,d=s.length?Math.max(...s.map(e=>e.runde_nummer)):0,f=s.filter(e=>e.runde_nummer===d),p=f.length>0&&f.every(e=>e.er_bekreftet||e.er_walkover),m=s.some(e=>e.runde_navn===`Semifinale`);return pe(e,s,l,u,d,o&&(s.length===0||p)&&l>1&&!m,r,i,a?`par`:`spelarar`,o)}).join(``)}</div>`},bindKamparEvents:(e,t)=>{!t.isAdmin&&t.avslKampar.length===0||ve(e,t.stevneid,t.avslKampar,t.isAdmin,t.reload,t.startnrMap,t.posisjonMap)},renderSetupHtml:e=>{let{stevne:t,isAdmin:n,runde1Format:r,unitCount:i,stilling:a}=e,o=r?.nA??null;if(t.stevne_fase===`avsluttende`)return n?H(a,{visSpelarliste:!0,initNa:o,initFormat:r}):`<p class="text-muted fst-italic">Gruppefordeling er ikkje klar enno.</p>`;if(!n)return``;if(i<2)return`<p class="text-muted fst-italic">${t.kategori?.erlagbasert?`Minst 2 par må vere oppretta før gruppefordelinga kan setjast.`:`Minst 2 spelarar må vere påmelde før gruppefordelinga kan setjast.`}</p>`;let s=a.length>0;return H(s?a:i,{visSpelarliste:s,initNa:o,initFormat:r})},bindHeaderEvents:(e,t)=>{let{container:n,stevneid:r,stevne:o,stilling:s,resultat:c,runde1Format:l,alleInnlBekrefta:f,harGruppefordeling:p,gruppeNavnMap:m,reload:h}=t;if(e?.querySelector(`#start-avsl-btn`)?.addEventListener(`click`,async()=>{if(!f)return;let{error:e}=await i(r,`avsluttende`);if(e){u(`Feil ved oppstart av avsluttande fase`,`error`);return}if(l?.nA!=null){let e=l.nA,{error:t}=await L(r,Z(s,c,e,m.A??null,m.B??null));if(t){u(`Feil ved lagring av gruppefordeling`,`error`);return}}await h()}),!p){let e=parseInt(n.querySelector(`#gruppe-val-wrapper`)?.dataset.n??`0`)||s.length;function t(e,t){let r=n.querySelector(`input[name="${e}"]:checked`);if(r?.dataset.oppsett)try{return JSON.parse(r.dataset.oppsett)}catch{}return A(t)[0]??null}function i(e,t,r){let i=n.querySelector(`#gruppe-preview`);i&&(i.innerHTML=U(s.map((e,t)=>({...e,cupPlassering:t+1})),e,t?.walkovers??0,r?.walkovers??0))}let l=n.querySelector(`#gruppe-paneler`);l&&l.addEventListener(`change`,r=>{let a=r.target;if(!a.matches(`input[name^="runde1-format"]`))return;let o=parseInt(n.querySelector(`input[name="gruppe-split"]:checked`)?.value??String(e)),s=e-o,c=t(`runde1-format-a`,o),l=t(`runde1-format-b`,s);if(a.name===`runde1-format-a`){let e=n.querySelector(`#struktur-a`);e&&(e.outerHTML=K(o,c,`a`))}else{let e=n.querySelector(`#struktur-b`);e&&(e.outerHTML=K(s,l,`b`))}i(o,c,l)}),n.querySelectorAll(`input[name="gruppe-split"]`).forEach(t=>{t.addEventListener(`change`,()=>{let n=parseInt(t.value),r=e-n,a=A(n)[0]??null,o=r>=2?A(r)[0]??null:null;l&&(l.innerHTML=`<div id="gruppe-panel-a" class="avsl-gruppe-kol">
                ${q(`Gruppe A`,n,`runde1-format-a`,a)}
              </div>`+(r>=2?`<div id="gruppe-panel-b" class="avsl-gruppe-kol">
                ${q(`Gruppe B`,r,`runde1-format-b`,o)}
              </div>`:``)),i(n,a,o)})}),n.querySelector(`#bekreft-gruppe-btn`)?.addEventListener(`click`,async()=>{let i=n.querySelector(`input[name="gruppe-split"]:checked`);if(!i)return;let l=parseInt(i.value),d=e-l,{error:f}=await a(r,{A:t(`runde1-format-a`,l),B:d>=2?t(`runde1-format-b`,d):null,nA:l});if(f){u(`Feil ved lagring av format`,`error`);return}if(o.stevne_fase===`avsluttende`){let{error:e}=await L(r,Z(s,c,l,m.A??null,m.B??null));if(e){u(`Feil ved lagring av gruppefordeling`,`error`);return}}u(`Gruppefordeling lagra`,`success`),await h()})}e?.querySelector(`#endre-gruppeinndeling-btn`)?.addEventListener(`click`,async()=>{await d({title:`Tilbakestill gruppeinndeling`,message:`Gruppefordeling og format vert fjerna.`,danger:!0})&&(await Promise.all([R(r),a(r,null)]),await h())}),p&&n.querySelectorAll(`[data-generer-gruppe]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.genererGruppe??``,n=parseInt(e.dataset.runde??`1`);se(r,t,s.filter(e=>e.gruppe?.navn===t),n,l,h)})})}});function Z(e,t,n,r,i){return e.flatMap((e,a)=>{let o=a<n?r:i??r,s=e.startnummer==null?[]:t.filter(t=>t.startnummer===e.startnummer).map(e=>e.kasterid);return(s.length?s:[e.kasterid]).map(e=>({kasterid:e,gruppeid:o}))})}function pe(e,t,n,i,a,o,s,c,l,u=!0){let d=new Map;for(let e of t)d.has(e.runde_nummer)||d.set(e.runde_nummer,[]),d.get(e.runde_nummer).push(e);let f=[...d.entries()].reverse().map(([e,t])=>{let n=t[0]?.runde_navn??`Runde ${e}`,i=t.filter(e=>!e.er_walkover);return i.length?`
      <h6 class="fw-bold text-center mb-1">${r(n)}</h6>
      <div class="d-flex flex-wrap gap-2 mb-2">
        ${i.map(e=>_e(e,s,c,u)).join(``)}
      </div>`:``}).join(``),p=a+1,m=o?`<button class="btn btn-success w-100 mt-2"
         data-generer-gruppe="${r(e)}" data-runde="${p}">
         Generer runde ${p}
       </button>`:``;return`
    <div class="avsl-gruppe-kol">
      <h6 class="text-center fw-bold mb-2">Gruppe ${r(e)} (${i} ${r(l)})</h6>
      ${m}
      ${f}
    </div>`}function me(e,t,n,r){let i=X(t),a=i>0||r.bekrefta&&!r.erTreSpelarar||r.harOmgangar?i:`—`,o=t.rep.kamp_plassering,s=e.er_bekreftet&&o!=null&&o>=n,c=e.er_bekreftet&&o!=null&&o<n,l=s?`kamp-eliminert`:c?`kamp-vidare`:``,u=`text-center fw-semibold avsl-score-cel${r.kanEndreScore?` score-redigerbar`:``}`,d=r.kanEndreScore?` data-endre-score="${e.id}"`:``;return`<tr${l?` class="${l}"`:``}>
    <td>${z(t,!1)}</td>
    <td class="${u}"${d}>${a}</td>
  </tr>`}function Q(e,t,n){return e.er_walkover?`<tr>
        <td colspan="2">${z(t[0]??null,!1)} <span class="badge bg-secondary">Walkover</span></td>
      </tr>`:t.map(r=>me(e,r,t.length,n)).join(``)}function he(e,t,n,r){if(e.er_tre_spelarar)return{klass:r?`btn-secondary`:`btn-outline-secondary`,tekst:r?`Endre plassering`:`Sett plassering`,disabled:!1,ekstraKlass:``};let i=F(e,J(t.map(e=>e.rep)),n);return{klass:r?`btn-secondary`:i?`btn-success`:`btn-outline-secondary`,tekst:r?`Bekreftet`:`Bekreft`,disabled:r||!i,ekstraKlass:` btn-bekreft`}}function ge(e,t,n){return`<tr>
            <td colspan="2" class="text-end pe-1">
              ${!e.er_walkover&&!e.er_tre_spelarar?`<button class="btn btn-primary btn-sm" id="plus-${e.id}"${t?` disabled`:``}>+</button> `:``}
              ${t?``:`<button class="btn btn-secondary btn-sm" id="scoreboard-${e.id}">Scoreboard</button> `}
              <button class="btn ${n.klass} btn-sm${n.ekstraKlass}" id="bekrft-${e.id}"${n.disabled?` disabled`:``}>${n.tekst}</button>
            </td>
          </tr>`}function _e(e,t,n,r=!0){let i=Y(e,t,n),a=e.er_bekreftet||e.er_walkover,o=e.spelarar.some(e=>(e.omgangar?.length??0)>0),s={bekrefta:a,harOmgangar:o,kanEndreScore:r&&e.er_bekreftet&&!e.er_tre_spelarar&&!o,erTreSpelarar:e.er_tre_spelarar},c=r?ge(e,a,he(e,i,o,a)):``;return`
    <div class="avsl-kamp-block">
      <div class="avsl-kamp-header">
        <span class="avsl-kamp-bane">Bane ${e.bane_nummer}</span>
        ${o&&!a?l():``}
      </div>
      <table class="table table-sm table-bordered mb-0">
        <tbody>
          ${Q(e,i,s)}
          ${c}
        </tbody>
      </table>
    </div>`}function ve(t,n,r,i,a,o,s){for(let c of r){let r=Y(c,o,s),l=r[0]??null,d=r[1]??null,f=l?.rep??null,p=d?.rep??null,m=z(l,!1),g=z(d,!1),v=r.flatMap(e=>e.members.map(e=>e.id)),y=async(t,n)=>{let r=[];f?.id&&r.push(C(f.id,t)),p?.id&&r.push(C(p.id,n));for(let e of[l,d])for(let t of e?.members.slice(1)??[])r.push(C(t.id,0));try{return(await Promise.all(r)).find(e=>e.error)??null}catch(t){return e(`cup:skrivSideScore`,t),{error:t}}};if(t.querySelector(`#plus-${c.id}`)?.addEventListener(`click`,()=>{V({side1Name:m,side2Name:g,currentS1:X(l),currentS2:X(d),spelarIds:v,hasOmgangar:c.spelarar.some(e=>(e.omgangar?.length??0)>0),logPrefix:`cup`,onSave:y,onSaved:a})}),t.querySelector(`#scoreboard-${c.id}`)?.addEventListener(`click`,()=>{window.open(`#/kamp/${c.id}`,`_blank`)}),t.querySelector(`#bekrft-${c.id}`)?.addEventListener(`click`,async e=>{if(c.er_tre_spelarar)ce(c,r,n,async()=>{await $(n,c),await a()});else{let t=e.currentTarget;t.disabled=!0,t.textContent=`Lagrer…`;try{await ye(n,c,r,a)||(t.disabled=!1,t.textContent=`Bekreft`)}catch{t.disabled=!1,t.textContent=`Bekreft`}}}),i&&c.er_bekreftet&&!c.er_tre_spelarar){let e=r.flatMap(e=>e.members.map(e=>e.kasterid)),i=()=>{B(m,g,X(l),X(d),async(t,r)=>{if(v.length){let{error:e}=await h(v);if(e){u(`DB-feil ved sletting av omgangar`,`error`);return}}if(await y(t,r)){u(`DB-feil ved oppdatering av score`,`error`);return}let i=t>=r?l:d,o=t>=r?d:l,s=i?.members.map(e=>e.kasterid)??[],f=o?.members.map(e=>e.kasterid)??[],p=[...s.map(e=>({kasterid:e,plassering:1})),...f.map(e=>({kasterid:e,plassering:2}))],{error:m}=await S(c.id,p);if(m){u(`DB-feil ved oppdatering av plassering`,`error`);return}await _({stevneId:n,rundeNummer:c.runde_nummer,rundeNavn:c.runde_navn,allKasterids:e,nyVinnarIds:s,nyTaparIds:f}),await a()})};t.querySelectorAll(`[data-endre-score="${c.id}"]`).forEach(e=>e.addEventListener(`click`,i))}}}async function ye(e,t,n,r){let i=n[0]??null,a=n[1]??null,{data:o}=await v(t.id),s=e=>e?.members.reduce((e,t)=>e+m(o.find(e=>e.id===t.id)??t),0)??0,c=s(i),l=s(a);if(c===0&&l===0&&!await d({title:`Ingen score registrert`,message:`Vil du bekrefte kampen likevel?`}))return!1;let f=c>=l?i:a,p=c>=l?a:i,h=n.flatMap(e=>e.members.map(e=>e.kasterid)),{error:g}=await b({kampId:t.id,stevneId:e,rundeNummer:t.runde_nummer,rundeNavn:t.runde_navn,allKasterids:h,eliminertIds:p?.members.map(e=>e.kasterid)??[],vidareSider:f?[f.members.map(e=>e.kasterid)]:[]});return g?(u(`DB-feil ved bekreft`,`error`),!1):(await $(e,t),await r(),!0)}async function $(e,t){t.runde_navn!==`Semifinale`||!t.gruppe_navn||await g(e,t.gruppe_navn)&&await k(e,t.gruppe_navn)}export{fe as render};