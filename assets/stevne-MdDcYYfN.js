const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/gloppen-DgHAL3SQ.js","assets/index-DfQSuSl0.js","assets/vendor-3yxEHqvy.js","assets/rolldown-runtime-lhHHWwHU.js","assets/index-BvF18F-H.css","assets/innledendeBase-BSv886bp.js","assets/ConfirmDialog-3D8QuJxP.js","assets/LivePill-BONVuM0F.js","assets/createEl-CcdmiJqp.js","assets/LoadingState-RVZNML7E.js","assets/resultatService-DTs_fmqb.js","assets/Table-DSqyRM9K.js","assets/kamp-Bpd8LcU6.js","assets/kampService-NpECm-uf.js","assets/testDataService-qfr5e0CS.js","assets/realtime-BQZ3if1e.js","assets/nordhordland-Dgx0lzFq.js","assets/kampGenereringInnledendeService-CIhcNJra.js","assets/xkast-3KDUu5S9.js","assets/cup-B6H9rsha.js","assets/kampGenereringCupService-D-LYk1yR.js","assets/pameldingService-Ds3jr0Zv.js","assets/kongelag-CvFrFpxw.js","assets/nordhordland-ClgYp7_S.js"])))=>i.map(i=>d[i]);
import{$ as e,C as t,G as n,L as r,M as i,N as a,R as o,S as s,U as c,W as l,Y as u,Z as d,_ as f,ct as p,i as m,n as h,nt as g,r as _,rt as v,t as y,ut as b,y as x}from"./index-DfQSuSl0.js";import{o as S}from"./kasterService-CxrReyjb.js";import{t as C}from"./LoadingState-RVZNML7E.js";import{t as w}from"./EmptyState-a5aDhc-8.js";import{t as T}from"./ConfirmDialog-3D8QuJxP.js";import{t as E}from"./realtime-BQZ3if1e.js";import{t as D}from"./Tabs-D6JHD9IR.js";import{a as O,f as k,i as A,l as ee,p as te,r as j,s as M,t as ne,u as N}from"./pameldingService-Ds3jr0Zv.js";import{a as P,o as F}from"./resultatService-DTs_fmqb.js";import{t as I}from"./kampGenereringInnledendeService-CIhcNJra.js";import{n as re}from"./testDataService-qfr5e0CS.js";function L(e){if(e instanceof Error)return e.message;if(typeof e==`object`&&e&&`message`in e){let t=e.message;if(typeof t==`string`)return t}return String(e)}async function R(e,{id:t,isAdmin:i=!1},a=null){e.replaceChildren(C());try{let[o,c,f]=await Promise.all([s(t),A(t),m()]);if(o.error||!o.data){e.replaceChildren(n(`Stevne ikkje funne.`));return}let p=o.data,h=p.stevne_fase??null,g=h===null||h===`ikke_startet`,_=p.kastemetodeInnl?.navn??`—`,v=_.toLowerCase().includes(`gloppen`),b=p.kategori?.erlagbasert??!1;if(a&&g&&i){a.innerHTML=`<button id="start-stevne-btn" class="btn btn-sm btn-success">Start stevne</button>`;let e=a.querySelector(`#start-stevne-btn`);e.addEventListener(`click`,async()=>{if(b?c<4:c<2){y(b?`Stevnet treng minst 2 par (4 spelarar) for å startast.`:`Stevnet må ha minst 2 spelarar for å startast.`,`error`);return}if(v&&!p.antall_runder_innl){y(`Du må setje antal rundar for innledande fase. Gå til Innstillingar for å endre.`,`error`);return}let n=await O(t);if(n>0&&!await T({title:`Ubekrefta spelarar`,message:`${n} spelar(ar) er ikkje bekrefta. Vil du starte stevnet likevel?`}))return;e.disabled=!0,e.textContent=`Starter…`;try{await I(t,_,p.antall_runder_innl??1,b)}catch(t){y(`Feil ved kampgenerering: `+L(t),`error`),e.disabled=!1,e.textContent=`Start stevne`;return}let{error:i}=await r(t,`innledende`);if(i){y(`Feil ved oppdatering av fase.`,`error`),e.disabled=!1,e.textContent=`Start stevne`;return}location.hash=`#/stevne/${t}/innledende`})}e.innerHTML=`
      <div class="card mb-3 org-max-480">
        <div class="card-body">
          <table class="table table-sm mb-0">
            <tbody>
              <tr><th>Stad</th><td>${l(p.sted??`—`)}</td></tr>
              <tr><th>Dato</th><td>${p.dato?u(p.dato):`—`}</td></tr>
              <tr><th>Tid</th><td>${p.tid?d(p.tid):`—`}</td></tr>
              <tr><th>Kastemetode innledande</th><td>${l(_)}</td></tr>
              <tr><th>Kastemetode avsluttande</th><td>${l(p.kastemetodeAvsl?.navn??`—`)}</td></tr>
              <tr><th>Antal rundar innledande</th><td>${p.antall_runder_innl??`—`}</td></tr>
              <tr><th>Påmelde spelarar</th><td>${c}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <div id="info-handling-knapper" class="mb-3 d-flex gap-2 flex-wrap"></div>`;let x=e.querySelector(`#info-handling-knapper`),S=p.erfullfort??!1;if(f?.profil?.kobling_status===`godkjent`&&!S){let e=document.createElement(`a`);e.href=`#/stevne/${t}/pamelding`,e.className=`btn btn-sm btn-primary`,e.textContent=`Meld deg på`,x.appendChild(e)}let C=document.createElement(`a`);C.href=`#/stevne/${t}/pamelding`,C.className=`btn btn-sm btn-outline-secondary`,C.textContent=`Sjå påmeldingar`,x.appendChild(C)}catch(t){g(`stevne-info.render`,t),e.replaceChildren(n(`Kunne ikkje laste info.`))}}var ie=1,ae=2;function z(e){return[e?.fornavn??``,e?.etternavn?e.etternavn.charAt(0).toUpperCase()+`.`:``].filter(Boolean).join(` `)}function B(e){let t=document.createElement(`div`);return t.appendChild(C()),{element:t,refresh:()=>{V(t,e)}}}async function V(e,t){let{stevneId:r,isAdmin:i,erMix:a,getPameldtIds:o,alleSpelarar:s}=t,c=o(),{data:l,error:u}=await ee(r);if(u){g(`createParTab`,u),e.replaceChildren(n(`Kunne ikkje laste par.`));return}let d=new Set(l.flatMap(e=>[e.sideA.kasterid,e.sideB.kasterid]));t.onPairsChanged?.(d);let f=s.filter(e=>c.has(e.id)&&!d.has(e.id)),m=null,h=null,_=null,v=document.createElement(`div`);v.className=`row g-3`;let b=document.createElement(`div`);b.className=`col-md-6 d-flex flex-column`;let x=document.createElement(`h6`);x.className=`fw-bold mb-1`;let S=document.createElement(`div`);S.className=`border rounded par-spelarar-liste flex-grow-1 overflow-auto`;function w(){let e=f.filter(e=>e.id!==m?.id&&e.id!==h?.id);if(x.textContent=`Spelarar utan par: ${e.length}`,S.innerHTML=``,!e.length){let e=document.createElement(`p`);e.className=`text-muted fst-italic text-center py-3 mb-0`,e.textContent=`Ingen fleire spelarar å tilordne`,S.appendChild(e);return}for(let t of e){let e=document.createElement(`div`);e.className=`par-spelar-kort px-2 py-1 border-bottom`,e.textContent=p(t),i&&(e.draggable=!0,e.setAttribute(`tabindex`,`0`),e.dataset.kasterid=String(t.id),e.addEventListener(`dragstart`,n=>{_=t.id,n.dataTransfer?.setData(`text/plain`,String(t.id)),e.classList.add(`opacity-50`)}),e.addEventListener(`dragend`,()=>{_=null,e.classList.remove(`opacity-50`)})),S.appendChild(e)}}b.appendChild(x),b.appendChild(S);let T=document.createElement(`div`);T.className=`col-md-6 d-flex flex-column`;let E=document.createElement(`h6`);E.className=`fw-bold mb-1`;let D=document.createElement(`div`);D.className=`flex-grow-1`;function O(e){let t=document.createElement(`div`);t.className=`par-slot border rounded px-2 py-2 text-center flex-grow-1`;let n=a?e===`A`?`Side A (kvinne)`:`Side B (mann)`:`Side ${e}`;t.setAttribute(`aria-label`,n);function r(){let r=e===`A`?m:h;t.textContent=r?z(r):n,t.classList.toggle(`par-slot--filled`,r!=null)}return r(),t.addEventListener(`dragover`,e=>{e.preventDefault(),t.classList.add(`par-slot--hover`)}),t.addEventListener(`dragleave`,()=>t.classList.remove(`par-slot--hover`)),t.addEventListener(`drop`,n=>{n.preventDefault(),t.classList.remove(`par-slot--hover`);let i=_??Number(n.dataTransfer?.getData(`text/plain`));if(!i||e===`A`&&h?.id===i||e===`B`&&m?.id===i)return;let o=s.find(e=>e.id===i);if(o){if(a){if(e===`A`&&o.kjonnid!==ae){y(`Mix: Side A må vere ei kvinne`,`error`);return}if(e===`B`&&o.kjonnid!==ie){y(`Mix: Side B må vere ein mann`,`error`);return}}e===`A`?m=o:h=o,r(),w(),j()}}),t}let A=document.createElement(`button`);A.type=`button`,A.className=`btn btn-primary btn-sm w-100 d-none mt-2`,A.textContent=`Opprett par`;function j(){A.classList.toggle(`d-none`,m==null||h==null)}A.addEventListener(`click`,async()=>{if(!m||!h)return;A.disabled=!0;let{error:n}=await k(r,m.id,h.id);if(A.disabled=!1,n){y(`Feil ved oppretting av par: `+L(n),`error`);return}e.replaceChildren(C()),V(e,t)});function M(n){if(E.textContent=`Antal par: ${n.length}`,D.innerHTML=``,!n.length){let e=document.createElement(`p`);e.className=`text-muted fst-italic py-2 mb-0`,e.textContent=`Ingen par oppretta enno`,D.appendChild(e);return}for(let a of n){let n=document.createElement(`div`);n.className=`par-rad d-flex justify-content-between align-items-center border rounded px-2 py-1 mb-1`;let o=document.createElement(`span`);if(o.textContent=`${z(a.sideA.kaster)} / ${z(a.sideB.kaster)}`,n.appendChild(o),i){let i=document.createElement(`button`);i.type=`button`,i.innerHTML=`&times;`,i.className=`btn btn-danger btn-sm rounded-circle p-0 lh-1 deltaker-fjern-btn`,i.title=`Slett par`,i.addEventListener(`click`,async()=>{i.disabled=!0;let{error:n}=await te(r,a.lag_id);if(n){y(`Feil ved sletting: `+L(n),`error`),i.disabled=!1;return}e.replaceChildren(C()),V(e,t)}),n.appendChild(i)}D.appendChild(n)}}if(i){let e=document.createElement(`div`);e.className=`d-flex gap-2 mb-1`,e.appendChild(O(`A`)),e.appendChild(O(`B`));let t=document.createElement(`div`);t.className=`mb-3`,t.appendChild(e),t.appendChild(A),T.appendChild(t)}T.appendChild(E),T.appendChild(D),v.appendChild(b),v.appendChild(T),e.replaceChildren(v),w(),M(l)}function H(e){return[...e].sort((e,t)=>{let n=(e.klubb?.navn??``).localeCompare(t.klubb?.navn??``,`nb`);if(n!==0)return n;let r=(e.etternavn??``).localeCompare(t.etternavn??``,`nb`);return r===0?(e.fornavn??``).localeCompare(t.fornavn??``,`nb`):r})}function U(e,t,n){let r=t.toLowerCase();return e.filter(e=>n.has(e.id)?!1:!r||p(e).toLowerCase().includes(r)||(e.klubb?.navn??``).toLowerCase().includes(r))}function W(e){let t=document.createElement(`div`);t.className=`d-flex flex-column flex-grow-1`;let n=document.createElement(`h6`);n.textContent=e,n.className=`fw-bold mb-1`;let r=document.createElement(`div`);r.className=`border rounded deltaker-tabell-wrapper flex-grow-1 overflow-auto`;let i=document.createElement(`table`);return i.className=`table table-sm table-hover table-bordered mb-0`,r.appendChild(i),t.appendChild(n),t.appendChild(r),{kolonne:t,tabell:i,tittelEl:n}}function G(e,t,n,r,i){let a=document.createElement(`tr`),o=document.createElement(`td`);if(o.className=`text-center th-40`,t){let e=document.createElement(`span`);e.className=`text-success fw-bold`,e.textContent=`✓`,o.appendChild(e)}else if(!i){let t=document.createElement(`button`);t.textContent=`✓`,t.className=`btn btn-outline-danger btn-sm rounded-circle p-0 lh-1 deltaker-bekreft-btn`,t.title=`Bekreft spelar`,t.addEventListener(`click`,t=>{t.stopPropagation(),r(e)}),o.appendChild(t)}let s=document.createElement(`td`);s.textContent=p(e);let c=document.createElement(`td`);c.textContent=e.klubb?.navn??``;let l=document.createElement(`td`);if(l.className=`text-center th-40`,!i){let t=document.createElement(`button`);t.innerHTML=`&times;`,t.className=`btn btn-danger btn-sm rounded-circle p-0 lh-1 deltaker-fjern-btn`,t.title=`Fjern spelar`,t.addEventListener(`click`,t=>{t.stopPropagation(),n(e)}),l.appendChild(t)}return a.appendChild(o),a.appendChild(s),a.appendChild(c),a.appendChild(l),a}function K(e,t,n){let r=document.createElement(`tr`),i=document.createElement(`td`);i.textContent=p(e);let a=document.createElement(`td`);return a.textContent=e.klubb?.navn??`Ingen klubb`,n||(r.classList.add(`deltaker-rad`),r.addEventListener(`click`,()=>t(e))),r.appendChild(i),r.appendChild(a),r}function q(e,t){let n=document.createElement(`tr`),r=document.createElement(`td`);return r.className=`text-center text-muted fst-italic py-3`,r.textContent=e,r.colSpan=t,n.appendChild(r),n}async function J(e,{id:t,isAdmin:r=!1}){e.replaceChildren(C());try{let[a,o,s]=await Promise.all([i(t),S(),M(t)]);if(a.error||!a.data){e.replaceChildren(n(`Stevne ikkje funne.`));return}if(o.error){e.replaceChildren(n(`Kunne ikkje laste kasterliste.`));return}let c=a.data.stevne_fase??null,l=r&&(c===null||c===`ikke_startet`),u=a.data.kategori?.erlagbasert??!1,d=o.data,f=new Map,p=new Set;for(let e of s.data)e.kasterid!=null&&(f.set(e.kasterid,e.er_bekreftet??!1),e.lag_id!=null&&p.add(e.kasterid));let m=!0,h=document.createElement(`div`);if(!l){let e=document.createElement(`div`);e.className=`alert alert-warning py-2`,e.textContent=`Spelarar kan ikkje endrast etter at stevnet er starta.`,h.appendChild(e)}let g=document.createElement(`div`);g.className=`row g-3`;let _=document.createElement(`div`);_.className=`col-md-6 d-flex flex-column`;let v=document.createElement(`input`);v.type=`text`,v.placeholder=`Søk etter navn eller klubb…`,v.className=`form-control mb-2`;let{kolonne:b,tabell:x}=W(`Tilgjengelege spelarar`);_.appendChild(v),_.appendChild(b);let C=document.createElement(`div`);C.className=`col-md-6 d-flex flex-column`;let w=document.createElement(`input`);w.type=`text`,w.className=`form-control mb-2 deltaker-search-spacer`,w.tabIndex=-1,w.disabled=!0;let{kolonne:T,tabell:E,tittelEl:O}=W(`Påmelde spelarar`);C.appendChild(w),C.appendChild(T);function k(){E.innerHTML=``;let e=H(d.filter(e=>f.has(e.id)));if(O.textContent=`Påmelde spelarar: ${e.length}`,!e.length){E.appendChild(q(`Ingen spelarar påmelde`,4));return}for(let n of e)E.appendChild(G(n,f.get(n.id)??!1,async e=>{if(p.has(e.id)){y(`Kan ikkje fjerne spelar som er i eit par. Slett paret fyrst.`,`error`);return}let{error:n}=await j(t,e.id);if(n){y(`Feil ved fjerning: `+L(n),`error`);return}f.delete(e.id),m=!0,k(),A()},async e=>{let{error:n}=await ne(t,e.id);if(n){y(`Feil ved bekreftelse: `+L(n),`error`);return}f.set(e.id,!0),k()},!l))}function A(){let e=H(U(d,v.value,f));if(x.innerHTML=``,!e.length){x.appendChild(q(`Ingen spelarar funne`,2));return}for(let n of e)x.appendChild(K(n,async e=>{let{error:n}=await N(t,e.id);if(n){y(`Feil ved innmelding: `+L(n),`error`);return}f.set(e.id,!1),m=!0,k(),A()},!l))}if(g.appendChild(_),g.appendChild(C),u){let e=B({stevneId:t,isAdmin:l,erMix:(a.data.kategori?.navn??``).toLowerCase().includes(`mix`),getPameldtIds:()=>new Set(f.keys()),alleSpelarar:d,onPairsChanged:e=>{p.clear();for(let t of e)p.add(t)}});h.appendChild(D({tabs:[{id:`spelarar`,label:`Spelarar`,panel:g},{id:`pairs`,label:`Administrer par`,panel:e.element}],onChange:t=>{t===`pairs`&&m&&(m=!1,e.refresh())}}))}else h.appendChild(g);e.replaceChildren(h),v.addEventListener(`input`,A),k(),A()}catch(t){g(`stevne-deltakere.render`,t),e.replaceChildren(n(`Kunne ikkje laste deltakarliste.`))}}async function oe(r,{id:i,isAdmin:a=!1},o=null){r.replaceChildren(C());let{navn:s,error:c}=await t(i);if(c){r.replaceChildren(n(`Stevne ikkje funne.`));return}if(s.includes(`gloppen`)){let{render:t}=await e(async()=>{let{render:e}=await import(`./gloppen-DgHAL3SQ.js`);return{render:e}},__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]));await t(r,{id:i,isAdmin:a},o)}else if(s.includes(`nordhordland`)){let{render:t}=await e(async()=>{let{render:e}=await import(`./nordhordland-Dgx0lzFq.js`);return{render:e}},__vite__mapDeps([16,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,17]));await t(r,{id:i,isAdmin:a},o)}else if(s.includes(`x-kast`)||s.includes(`minimatch`)||s.includes(`halvmatch`)||s.includes(`heilmatch`)){let{render:t}=await e(async()=>{let{render:e}=await import(`./xkast-3KDUu5S9.js`);return{render:e}},__vite__mapDeps([18,1,2,3,4]));await t(r,{id:i,isAdmin:a},o)}else r.replaceChildren(n(`Ukjend innledande kastemetode: ${s||`(ikkje sett)`}`))}async function se(t,{id:r,isAdmin:i=!1},a=null){t.replaceChildren(C());let{navn:o,error:s}=await x(r);if(s){t.replaceChildren(n(`Stevne ikkje funne.`));return}if(o.includes(`cup`)){let{render:n}=await e(async()=>{let{render:e}=await import(`./cup-B6H9rsha.js`);return{render:e}},__vite__mapDeps([19,1,2,3,4,6,7,8,9,10,11,12,20,13,21,15]));await n(t,{id:r,isAdmin:i},a)}else if(o.includes(`kongelag`)){let{render:n}=await e(async()=>{let{render:e}=await import(`./kongelag-CvFrFpxw.js`);return{render:e}},__vite__mapDeps([22,1,2,3,4]));await n(t,{id:r,isAdmin:i},a)}else if(o.includes(`nordhordland`)){let{render:n}=await e(async()=>{let{render:e}=await import(`./nordhordland-ClgYp7_S.js`);return{render:e}},__vite__mapDeps([23,1,2,3,4]));await n(t,{id:r,isAdmin:i},a)}else t.replaceChildren(n(`Ukjend avsluttande kastemetode: ${o||`(ikkje sett)`}`))}async function Y(e,{id:t}){e.replaceChildren(C());try{let[r,i]=await Promise.all([a(t),f()]);if(r.error||!r.data){e.replaceChildren(n(`Stevne ikkje funne.`));return}let s=r.data,c=i.data,u=c.filter(e=>e.er_innledende),d=c.filter(e=>e.er_avsluttende);function p(e,t){return e.map(e=>`<option value="${e.id}"${e.id===t?` selected`:``}>${l(e.navn)}</option>`).join(``)}e.innerHTML=`
      <div>
        <div class="mb-3">
          <a href="#/stevne/${t}/rediger" class="btn btn-outline-secondary btn-sm">Rediger stevne</a>
        </div>
        <h4 class="mb-3">Innstillingar</h4>
        <form id="innstillingar-form" class="org-max-480">
          <div class="mb-3">
            <label class="form-label fw-semibold">Kastemetode innledande</label>
            <select id="innl-metode" class="form-select">
              <option value="">— Ikkje vald —</option>
              ${p(u,s.innledendekastemetodeid)}
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold">Kastemetode avsluttande</label>
            <select id="avsl-metode" class="form-select">
              <option value="">— Ikkje vald —</option>
              ${p(d,s.avsluttendekastemetodeid)}
            </select>
          </div>
          <div class="mb-4">
            <label class="form-label fw-semibold">Antal rundar innledande</label>
            <input id="antall-rundar" type="number" min="1" class="form-control"
              value="${s.antall_runder_innl??``}" placeholder="t.d. 6">
          </div>
          <button type="submit" class="btn btn-primary">Lagre</button>
          <span id="lagre-status" class="ms-3 text-success d-none">Lagra ✓</span>
          <hr class="my-4">
          <div class="border border-danger rounded p-3">
            <h6 class="text-danger mb-2">Farleg sone</h6>
            <p class="text-muted small mb-2">Slettar alle kampar og resultat, og set stevnet tilbake til starttilstanden.</p>
            <button type="button" id="nullstill-btn" class="btn btn-danger">Start på nytt!</button>
          </div>
        </form>
      </div>`,e.querySelector(`#innstillingar-form`).addEventListener(`submit`,async n=>{n.preventDefault();let r=e.querySelector(`#innl-metode`).value||null,i=e.querySelector(`#avsl-metode`).value||null,a=e.querySelector(`#antall-rundar`).value,{error:s}=await o(t,{innledendekastemetodeid:r?Number(r):null,avsluttendekastemetodeid:i?Number(i):null,antall_runder_innl:a?Number(a):null});if(s){g(`stevne-innstillingar.lagre`,s),y(`Feil ved lagring: `+L(s),`error`);return}let c=e.querySelector(`#lagre-status`);c.classList.remove(`d-none`),setTimeout(()=>{c.classList.add(`d-none`)},2e3)}),e.querySelector(`#nullstill-btn`).addEventListener(`click`,async n=>{let r=n.currentTarget;await T({title:`Nullstill stevne`,message:`Dette slettar alle kampar og resultat og set stevnet tilbake til starttilstanden. Er du sikker?`,danger:!0})&&(r.disabled=!0,await re(t),await Y(e,{id:t}))})}catch(t){g(`stevne-innstillingar.render`,t),e.replaceChildren(n(`Kunne ikkje laste innstillingar.`))}}function ce(e,t){let n=new Map;for(let r of e){let e=r.gruppe?.navn??`–`,i=r.klasse?.navn??null,a=t?`${i??``}|${e}`:e,o=t?`${i?i+` `:``}${e}`:e;n.has(a)||n.set(a,{label:o,rader:[]}),n.get(a).rader.push(r)}return[...n.values()].sort((e,t)=>e.label.localeCompare(t.label,`nb`))}function le(e){let t=e.rader.map(e=>`
    <div class="res-rad">
      <span class="res-pl">${e.plassering??`–`}.</span>
      <div class="res-info">
        <span class="res-navn">${l(p(e.kaster)||`–`)}</span>
        <span class="res-klubb">${l(e.klubb?.navn??`–`)}</span>
      </div>
    </div>`).join(``);return`
    <div class="res-gruppe">
      <h2 class="res-gruppe-tittel">${l(e.label)}</h2>
      <div class="res-gruppe-rader">${t}</div>
    </div>`}function ue(e){let t=e.rader.map(e=>{let t=e.kaster,n=t?`<a href="#/kastere/${b(t)}" class="res-kaster-lenke">${l(p(t))}</a>`:`–`;return`
      <tr>
        <td class="res-td-pl">${e.plassering??`–`}</td>
        <td class="res-td-navn">${n}</td>
        <td class="res-td-klubb">${l(e.klubb?.navn??`–`)}</td>
        <td class="res-td-nc">${e.nc_poeng==null?``:e.nc_poeng}</td>
      </tr>`}).join(``);return`
    <div class="res-tabell-seksjon">
      <table class="res-tabell">
        <thead>
          <tr class="res-thead-gruppe">
            <td colspan="4" class="res-td-gruppe-header">${l(e.label)}</td>
          </tr>
          <tr class="res-thead-kolonner">
            <th class="res-td-pl">Pl</th>
            <th class="res-td-navn">NAVN</th>
            <th class="res-td-klubb">KLUBB</th>
            <th class="res-td-nc">NC</th>
          </tr>
        </thead>
        <tbody>${t}</tbody>
      </table>
    </div>`}async function de(e,{id:t}){e.replaceChildren(C(`Laster resultat…`));try{let[r,i]=await Promise.all([F(t),P(t)]);if(r.error||!r.data){e.replaceChildren(n(`Kunne ikkje laste stevnet.`));return}if(i.error){e.replaceChildren(n(`Kunne ikkje laste resultat.`));return}let a=r.data,o=i.data;if(!o.length){e.replaceChildren(w(a.erfullfort?`Ingen resultat registrert.`:`Turneringa er ikkje avslutta enno.`));return}let s=ce(o,(a.dato?new Date(a.dato+`T12:00:00`).getFullYear():9999)<2026),c=o.length;e.innerHTML=`
      <div class="res-side">
        <div class="res-felles">
          ${a.resultaturl?.startsWith(`http`)?`<a class="res-pdf-lenke" href="${l(a.resultaturl)}" target="_blank" rel="noopener">Resultat som pdf 📄</a>`:``}
          ${a.juryleder?`<p class="res-klassifisering">Juryleder: ${l(a.juryleder)}</p>`:``}
          <p class="res-antall"><strong>Antall deltakarar: ${c}</strong></p>
        </div>
        <div class="res-mobil-blokk">
          ${s.map(le).join(``)}
        </div>
        <div class="res-desktop-blokk">
          ${s.map(ue).join(``)}
        </div>
      </div>`}catch(t){g(`stevne-resultat.render`,t),e.replaceChildren(n(`Kunne ikkje laste resultat.`))}}v.from(`kamp`).select(`
  id,
  er_walkover,
  er_tre_spelarar,
  spelarar:kamp_spelar(
    id,
    kasterid,
    score_poeng,
    omgangar:kamp_omgang(score, antall_ringer),
    kaster:kasterid(id, fornavn, etternavn)
  )
`);async function fe(e){let{data:t,error:n}=await v.from(`kamp`).select(`
      id,
      er_walkover,
      er_tre_spelarar,
      spelarar:kamp_spelar(
        id,
        kasterid,
        score_poeng,
        omgangar:kamp_omgang(score, antall_ringer),
        kaster:kasterid(id, fornavn, etternavn)
      )
    `).eq(`stevneid`,e).eq(`er_bekreftet`,!0).eq(`er_walkover`,!1);return n&&g(`hentKamperForStats`,n),{data:t??[],error:n}}async function pe(e){let{data:t,error:n}=await v.from(`resultat`).select(`kasterid, posisjon`).eq(`stevneid`,e);n&&g(`hentPosisjonForStevne`,n);let r=new Map;for(let e of t??[])e.kasterid!=null&&e.posisjon!=null&&r.set(e.kasterid,e.posisjon);return r}function me(e,t,n){let r=n.get(e.kasterid)??null;return t.filter(t=>t.kasterid!==e.kasterid&&(n.get(t.kasterid)??null)===r).reduce((e,t)=>e+t.score_poeng,0)}function he(e,t){let n=new Map;for(let r of e){if(r.er_walkover)continue;let e=r.spelarar;for(let r of e){let i=me(r,e,t);n.has(r.kasterid)||n.set(r.kasterid,{kasterid:r.kasterid,navn:p(r.kaster),matchCount:0,shoesThrown:0,ringers:0,ringerPct:0,doubleRingers:0,score4:0,score3:0,score2:0,score1:0,score0:0,scoreDiff:0});let a=n.get(r.kasterid);r.omgangar.length>0&&a.matchCount++,a.scoreDiff+=r.score_poeng-i;for(let e of r.omgangar)a.shoesThrown+=2,e.antall_ringer!=null&&(a.ringers+=e.antall_ringer),e.antall_ringer===2&&a.doubleRingers++,e.score===4?a.score4++:e.score===3?a.score3++:e.score===2?a.score2++:e.score===1?a.score1++:e.score===0&&a.score0++}}let r=[...n.values()].filter(e=>e.shoesThrown>0);for(let e of r)e.ringerPct=e.shoesThrown>0?e.ringers/e.shoesThrown*100:0;return r.sort((e,t)=>t.shoesThrown-e.shoesThrown)}function ge(e){return e>0?`+${e}`:String(e)}function X(e){return`
    <div class="stats-tabell-wrap">
      <table class="stats-tabell">
        <thead>
          <tr>
            <th class="stats-th-namn">Namn</th>
            <th class="stats-th-num">K</th>
            <th class="stats-th-num">Sko</th>
            <th class="stats-th-num stats-th-ringer">R</th>
            <th class="stats-th-num stats-th-ringer">R%</th>
            <th class="stats-th-num">6p</th>
            <th class="stats-th-num">4p</th>
            <th class="stats-th-num">3p</th>
            <th class="stats-th-num">2p</th>
            <th class="stats-th-num">1p</th>
            <th class="stats-th-num">0p</th>
            <th class="stats-th-diff">±</th>
          </tr>
        </thead>
        <tbody>${e.map(e=>`
    <tr>
      <td class="stats-td-namn">${l(e.navn)}</td>
      <td class="stats-td-num">${e.matchCount}</td>
      <td class="stats-td-num">${e.shoesThrown}</td>
      <td class="stats-td-num stats-td-ringer">${e.ringers}</td>
      <td class="stats-td-num stats-td-ringer">${e.ringerPct.toFixed(1)}%</td>
      <td class="stats-td-num">${e.doubleRingers}</td>
      <td class="stats-td-num">${e.score4}</td>
      <td class="stats-td-num">${e.score3}</td>
      <td class="stats-td-num">${e.score2}</td>
      <td class="stats-td-num">${e.score1}</td>
      <td class="stats-td-num">${e.score0}</td>
      <td class="stats-td-diff ${e.scoreDiff>=0?`stats-td-pos`:`stats-td-neg`}">${ge(e.scoreDiff)}</td>
    </tr>`).join(``)}</tbody>
      </table>
    </div>`}function _e(e){let t=!1,n=0,r=0;e.addEventListener(`mousedown`,i=>{t=!0,e.classList.add(`is-grabbing`),n=i.pageX-e.offsetLeft,r=e.scrollLeft}),e.addEventListener(`mouseleave`,()=>{t=!1,e.classList.remove(`is-grabbing`)}),e.addEventListener(`mouseup`,()=>{t=!1,e.classList.remove(`is-grabbing`)}),e.addEventListener(`mousemove`,i=>{t&&(i.preventDefault(),e.scrollLeft=r-(i.pageX-e.offsetLeft-n))})}function ve(e,t){let n=[...e.querySelectorAll(`tr`)],r=n[0];if(!r)return;let i=[...r.cells].slice(0,t).map(e=>e.offsetWidth);for(let e of n){let n=0;for(let r=0;r<t&&r<e.cells.length;r++){let a=e.cells[r];a&&(a.classList.add(`stats-col-sticky`),r===t-1&&a.classList.add(`stats-col-sticky-last`),a.style.setProperty(`--col-left`,`${n}px`),n+=i[r]??0)}}}async function ye(e,{id:t}){e.replaceChildren(C(`Laster statistikk…`));try{let[{data:r,error:i},a]=await Promise.all([fe(t),pe(t)]);if(i){e.replaceChildren(n(`Kunne ikkje laste statistikk.`));return}let o=he(r,a);if(!o.length){e.replaceChildren(w(`Ingen bekrefte kampar enno.`));return}e.innerHTML=`<div class="stats-side">${X(o)}</div>`;let s=e.querySelector(`.stats-tabell-wrap`),c=e.querySelector(`.stats-tabell`);s&&_e(s),c&&ve(c,1)}catch(t){g(`stevne-stats.render`,t),e.replaceChildren(n(`Kunne ikkje laste statistikk.`))}}var Z=[{key:`info`,label:`Info`,adminOnly:!1},{key:`deltakere`,label:`Deltakere`,adminOnly:!0},{key:`innledende`,label:`Innledande`,adminOnly:!1},{key:`avsluttende`,label:`Avsluttande`,adminOnly:!1},{key:`resultat`,label:`Sluttresultat`,adminOnly:!1},{key:`innstillinger`,label:`Innstillingar`,adminOnly:!0},{key:`stats`,label:`Statistikk`,adminOnly:!1}],be=new Set(Z.filter(e=>e.adminOnly).map(e=>e.key)),xe={info:R,deltakere:J,innledende:oe,avsluttende:se,innstillinger:Y,resultat:de,stats:ye},Q={ikke_startet:`<span class="badge bg-secondary">Ikkje starta</span>`,innledende:`<span class="badge bg-primary">Innledande fase</span>`,avsluttende:`<span class="badge bg-success">Avsluttande fase</span>`};function Se(e,t,n,r){return`<ul class="nav nav-tabs mb-3">${Z.filter(e=>n||!e.adminOnly).filter(e=>e.key!==`avsluttende`||r).map(({key:n,label:r})=>`
      <li class="nav-item">
        <a class="nav-link${t===n?` active`:``}"
           href="#/stevne/${e}/${n}">${r}</a>
      </li>`).join(``)}</ul>`}var $=null;async function Ce(e,t){let r=Number(t.id),a=String(t.tab??`info`);$&&=(await E($),null),e.replaceChildren(C());try{let{data:t,error:o}=await i(r);if(o||!t){e.replaceChildren(n(`Stevne ikkje funne.`));return}let s=await h()||await _(),u=t.avsluttendekastemetodeid!=null,d=!s&&be.has(a)?`info`:a,f=Q[t.stevne_fase??`ikke_startet`]??``;e.innerHTML=`
      <div class="org-shell py-3 px-3">
        ${Se(r,d,s,u)}
        <div class="org-fase-header d-flex align-items-center gap-2 mb-3">
          <h5 class="mb-0 flex-grow-1">${l(t.navn)} <span id="fase-badge">${f}</span></h5>
          <div id="org-banner-knappar"></div>
        </div>
        <div id="org-subside"></div>
      </div>`;let p=e.querySelector(`#org-banner-knappar`),m=e.querySelector(`#org-subside`);await(xe[d]??R)(m,{id:r,isAdmin:s},p),$=c(r,t=>{let n=e.querySelector(`#fase-badge`);n&&(n.innerHTML=Q[t??`ikke_startet`]??``)})}catch(t){g(`stevne.render`,t),e.replaceChildren(n(`Kunne ikkje laste stevnet.`))}}export{Ce as render};