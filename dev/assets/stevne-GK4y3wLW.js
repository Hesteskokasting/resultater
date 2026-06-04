const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/gloppen-C-9Z_yLy.js","assets/index-Cl2DyGyW.js","assets/vendor-3yxEHqvy.js","assets/rolldown-runtime-lhHHWwHU.js","assets/index-B12VKaLv.css","assets/innledendeBase-CC0TqyGE.js","assets/ConfirmDialog-DNGrXiEY.js","assets/LivePill-C1AxE8Dw.js","assets/LoadingState-RVZNML7E.js","assets/resultatService-Ce2dQQh8.js","assets/Table-BBE7tcG_.js","assets/kamp-CpbenSSn.js","assets/kampService-CK4JEknu.js","assets/testDataService-ChcwNuwA.js","assets/realtime-CnmYgNku.js","assets/nordhordland-DzfVtKiG.js","assets/kampGenereringInnledendeService-DAflwuua.js","assets/xkast-DrQVr2Lf.js","assets/cup--ZCBpdjr.js","assets/kampGenereringCupService-CPEHjN_r.js","assets/kongelag-DYfHuxBe.js","assets/nordhordland-CXw4sWtP.js"])))=>i.map(i=>d[i]);
import{$ as e,C as t,G as n,L as r,M as i,N as a,R as o,S as s,U as c,W as l,Y as u,Z as d,_ as f,ct as p,i as m,n as h,nt as g,r as _,rt as v,st as y,t as b,y as x}from"./index-Cl2DyGyW.js";import{o as S}from"./kasterService-DfAYwvbI.js";import{t as C}from"./LoadingState-RVZNML7E.js";import{t as w}from"./EmptyState-a5aDhc-8.js";import{t as T}from"./ConfirmDialog-DNGrXiEY.js";import{t as E}from"./realtime-CnmYgNku.js";import{a as D,i as O,l as k,r as A,s as ee,t as te}from"./pameldingService-CScfGENg.js";import{a as ne,o as re}from"./resultatService-Ce2dQQh8.js";import{t as j}from"./kampGenereringInnledendeService-DAflwuua.js";import{n as M}from"./testDataService-ChcwNuwA.js";async function N(e,{id:t,isAdmin:i=!1},a=null){e.replaceChildren(C());try{let[o,c,f]=await Promise.all([s(t),O(t),m()]);if(o.error||!o.data){e.replaceChildren(n(`Stevne ikkje funne.`));return}let p=o.data,h=p.stevne_fase??null,g=h===null||h===`ikke_startet`,_=p.kastemetodeInnl?.navn??`—`,v=_.toLowerCase().includes(`gloppen`);if(a&&g&&i){a.innerHTML=`<button id="start-stevne-btn" class="btn btn-sm btn-success">Start stevne</button>`;let e=a.querySelector(`#start-stevne-btn`);e.addEventListener(`click`,async()=>{if(c<2){b(`Stevnet må ha minst 2 spelarar for å startast.`,`error`);return}if(v&&!p.antall_runder_innl){b(`Du må setje antal rundar for innledande fase. Gå til Innstillingar for å endre.`,`error`);return}let n=await D(t);if(n>0&&!await T({title:`Ubekrefta spelarar`,message:`${n} spelar(ar) er ikkje bekrefta. Vil du starte stevnet likevel?`}))return;e.disabled=!0,e.textContent=`Starter…`;try{await j(t,_,p.antall_runder_innl??1)}catch(t){b(`Feil ved kampgenerering: `+(t instanceof Error?t.message:String(t)),`error`),e.disabled=!1,e.textContent=`Start stevne`;return}let{error:i}=await r(t,`innledende`);if(i){b(`Feil ved oppdatering av fase.`,`error`),e.disabled=!1,e.textContent=`Start stevne`;return}location.hash=`#/stevne/${t}/innledende`})}e.innerHTML=`
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
      <div id="info-handling-knapper" class="mb-3 d-flex gap-2 flex-wrap"></div>`;let y=e.querySelector(`#info-handling-knapper`),x=p.erfullfort??!1;if(f?.profil?.kobling_status===`godkjent`&&!x){let e=document.createElement(`a`);e.href=`#/stevne/${t}/pamelding`,e.className=`btn btn-sm btn-primary`,e.textContent=`Meld deg på`,y.appendChild(e)}let S=document.createElement(`a`);S.href=`#/stevne/${t}/pamelding`,S.className=`btn btn-sm btn-outline-secondary`,S.textContent=`Sjå påmeldingar`,y.appendChild(S)}catch(t){g(`stevne-info.render`,t),e.replaceChildren(n(`Kunne ikkje laste info.`))}}function P(e){return[...e].sort((e,t)=>{let n=(e.klubb?.navn??``).localeCompare(t.klubb?.navn??``,`nb`);if(n!==0)return n;let r=(e.etternavn??``).localeCompare(t.etternavn??``,`nb`);return r===0?(e.fornavn??``).localeCompare(t.fornavn??``,`nb`):r})}function F(e,t,n){let r=t.toLowerCase();return e.filter(e=>n.has(e.id)?!1:!r||y(e).toLowerCase().includes(r)||(e.klubb?.navn??``).toLowerCase().includes(r))}function I(e){let t=document.createElement(`div`);t.className=`d-flex flex-column flex-grow-1`;let n=document.createElement(`h6`);n.textContent=e,n.className=`fw-bold mb-1`;let r=document.createElement(`div`);r.className=`border rounded deltaker-tabell-wrapper flex-grow-1 overflow-auto`;let i=document.createElement(`table`);return i.className=`table table-sm table-hover table-bordered mb-0`,r.appendChild(i),t.appendChild(n),t.appendChild(r),{kolonne:t,tabell:i,tittelEl:n}}function L(e,t,n,r,i){let a=document.createElement(`tr`),o=document.createElement(`td`);if(o.className=`text-center th-40`,t){let e=document.createElement(`span`);e.className=`text-success fw-bold`,e.textContent=`✓`,o.appendChild(e)}else if(!i){let t=document.createElement(`button`);t.textContent=`✓`,t.className=`btn btn-outline-danger btn-sm rounded-circle p-0 lh-1 deltaker-bekreft-btn`,t.title=`Bekreft spelar`,t.addEventListener(`click`,t=>{t.stopPropagation(),r(e)}),o.appendChild(t)}let s=document.createElement(`td`);s.textContent=y(e);let c=document.createElement(`td`);c.textContent=e.klubb?.navn??``;let l=document.createElement(`td`);if(l.className=`text-center th-40`,!i){let t=document.createElement(`button`);t.innerHTML=`&times;`,t.className=`btn btn-danger btn-sm rounded-circle p-0 lh-1 deltaker-fjern-btn`,t.title=`Fjern spelar`,t.addEventListener(`click`,t=>{t.stopPropagation(),n(e)}),l.appendChild(t)}return a.appendChild(o),a.appendChild(s),a.appendChild(c),a.appendChild(l),a}function R(e,t,n){let r=document.createElement(`tr`),i=document.createElement(`td`);i.textContent=y(e);let a=document.createElement(`td`);return a.textContent=e.klubb?.navn??`Ingen klubb`,n||(r.classList.add(`deltaker-rad`),r.addEventListener(`click`,()=>t(e))),r.appendChild(i),r.appendChild(a),r}function z(e,t){let n=document.createElement(`tr`),r=document.createElement(`td`);return r.className=`text-center text-muted fst-italic py-3`,r.textContent=e,r.colSpan=t,n.appendChild(r),n}async function B(e,{id:t,isAdmin:r=!1}){e.replaceChildren(C());try{let[a,o,s]=await Promise.all([i(t),S(),ee(t)]);if(a.error||!a.data){e.replaceChildren(n(`Stevne ikkje funne.`));return}if(o.error){e.replaceChildren(n(`Kunne ikkje laste kasterliste.`));return}let c=a.data.stevne_fase??null,l=r&&(c===null||c===`ikke_startet`),u=o.data,d=new Map;for(let e of s.data)e.kasterid!=null&&d.set(e.kasterid,e.er_bekreftet??!1);e.innerHTML=`
      <div>
        ${l?``:`<div class="alert alert-warning py-2">Spelarar kan ikkje endrast etter at stevnet er starta.</div>`}
        <div class="row g-3" id="spelarar-layout"></div>
      </div>`;let f=e.querySelector(`#spelarar-layout`),p=document.createElement(`div`);p.className=`col-md-6 d-flex flex-column`;let m=document.createElement(`input`);m.type=`text`,m.placeholder=`Søk etter navn eller klubb…`,m.className=`form-control mb-2`;let{kolonne:h,tabell:g}=I(`Tilgjengelege spelarar`);p.appendChild(m),p.appendChild(h),f.appendChild(p);let _=document.createElement(`div`);_.className=`col-md-6 d-flex flex-column`;let v=document.createElement(`input`);v.type=`text`,v.className=`form-control mb-2 deltaker-search-spacer`,v.tabIndex=-1,v.disabled=!0;let{kolonne:y,tabell:x,tittelEl:C}=I(`Påmelde spelarar`);_.appendChild(v),_.appendChild(y),f.appendChild(_);function w(){x.innerHTML=``;let e=P(u.filter(e=>d.has(e.id)));if(C.textContent=`Påmelde spelarar: ${e.length}`,!e.length){x.appendChild(z(`Ingen spelarar påmelde`,4));return}for(let n of e)x.appendChild(L(n,d.get(n.id)??!1,async e=>{let{error:n}=await A(t,e.id);if(n){b(`Feil ved fjerning: `+(n instanceof Error?n.message:String(n)),`error`);return}d.delete(e.id),w(),T()},async e=>{let{error:n}=await te(t,e.id);if(n){b(`Feil ved bekreftelse: `+(n instanceof Error?n.message:String(n)),`error`);return}d.set(e.id,!0),w()},!l))}function T(){let e=P(F(u,m.value,d));if(g.innerHTML=``,!e.length){g.appendChild(z(`Ingen spelarar funne`,2));return}for(let n of e)g.appendChild(R(n,async e=>{let{error:n}=await k(t,e.id);if(n){b(`Feil ved innmelding: `+(n instanceof Error?n.message:String(n)),`error`);return}d.set(e.id,!1),w(),T()},!l))}m.addEventListener(`input`,T),w(),T()}catch(t){g(`stevne-deltakere.render`,t),e.replaceChildren(n(`Kunne ikkje laste deltakarliste.`))}}async function V(r,{id:i,isAdmin:a=!1},o=null){r.replaceChildren(C());let{navn:s,error:c}=await t(i);if(c){r.replaceChildren(n(`Stevne ikkje funne.`));return}if(s.includes(`gloppen`)){let{render:t}=await e(async()=>{let{render:e}=await import(`./gloppen-C-9Z_yLy.js`);return{render:e}},__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14]));await t(r,{id:i,isAdmin:a},o)}else if(s.includes(`nordhordland`)){let{render:t}=await e(async()=>{let{render:e}=await import(`./nordhordland-DzfVtKiG.js`);return{render:e}},__vite__mapDeps([15,1,2,3,4,5,6,7,8,9,10,11,12,13,14,16]));await t(r,{id:i,isAdmin:a},o)}else if(s.includes(`x-kast`)||s.includes(`minimatch`)||s.includes(`halvmatch`)||s.includes(`heilmatch`)){let{render:t}=await e(async()=>{let{render:e}=await import(`./xkast-DrQVr2Lf.js`);return{render:e}},__vite__mapDeps([17,1,2,3,4]));await t(r,{id:i,isAdmin:a},o)}else r.replaceChildren(n(`Ukjend innledande kastemetode: ${s||`(ikkje sett)`}`))}async function H(t,{id:r,isAdmin:i=!1},a=null){t.replaceChildren(C());let{navn:o,error:s}=await x(r);if(s){t.replaceChildren(n(`Stevne ikkje funne.`));return}if(o.includes(`cup`)){let{render:n}=await e(async()=>{let{render:e}=await import(`./cup--ZCBpdjr.js`);return{render:e}},__vite__mapDeps([18,1,2,3,4,6,7,8,9,10,11,19,12,14]));await n(t,{id:r,isAdmin:i},a)}else if(o.includes(`kongelag`)){let{render:n}=await e(async()=>{let{render:e}=await import(`./kongelag-DYfHuxBe.js`);return{render:e}},__vite__mapDeps([20,1,2,3,4]));await n(t,{id:r,isAdmin:i},a)}else if(o.includes(`nordhordland`)){let{render:n}=await e(async()=>{let{render:e}=await import(`./nordhordland-CXw4sWtP.js`);return{render:e}},__vite__mapDeps([21,1,2,3,4]));await n(t,{id:r,isAdmin:i},a)}else t.replaceChildren(n(`Ukjend avsluttande kastemetode: ${o||`(ikkje sett)`}`))}async function U(e,{id:t}){e.replaceChildren(C());try{let[r,i]=await Promise.all([a(t),f()]);if(r.error||!r.data){e.replaceChildren(n(`Stevne ikkje funne.`));return}let s=r.data,c=i.data,u=c.filter(e=>e.er_innledende),d=c.filter(e=>e.er_avsluttende);function p(e,t){return e.map(e=>`<option value="${e.id}"${e.id===t?` selected`:``}>${l(e.navn)}</option>`).join(``)}e.innerHTML=`
      <div>
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
      </div>`,e.querySelector(`#innstillingar-form`).addEventListener(`submit`,async n=>{n.preventDefault();let r=e.querySelector(`#innl-metode`).value||null,i=e.querySelector(`#avsl-metode`).value||null,a=e.querySelector(`#antall-rundar`).value,{error:s}=await o(t,{innledendekastemetodeid:r?Number(r):null,avsluttendekastemetodeid:i?Number(i):null,antall_runder_innl:a?Number(a):null});if(s){g(`stevne-innstillingar.lagre`,s),b(`Feil ved lagring: `+(s instanceof Error?s.message:String(s)),`error`);return}let c=e.querySelector(`#lagre-status`);c.classList.remove(`d-none`),setTimeout(()=>{c.classList.add(`d-none`)},2e3)}),e.querySelector(`#nullstill-btn`).addEventListener(`click`,async n=>{let r=n.currentTarget;await T({title:`Nullstill stevne`,message:`Dette slettar alle kampar og resultat og set stevnet tilbake til starttilstanden. Er du sikker?`,danger:!0})&&(r.disabled=!0,await M(t),await U(e,{id:t}))})}catch(t){g(`stevne-innstillingar.render`,t),e.replaceChildren(n(`Kunne ikkje laste innstillingar.`))}}function W(e,t){let n=new Map;for(let r of e){let e=r.gruppe?.navn??`–`,i=r.klasse?.navn??null,a=t?`${i??``}|${e}`:e,o=t?`${i?i+` `:``}${e}`:e;n.has(a)||n.set(a,{label:o,rader:[]}),n.get(a).rader.push(r)}return[...n.values()].sort((e,t)=>e.label.localeCompare(t.label,`nb`))}function G(e){let t=e.rader.map(e=>`
    <div class="res-rad">
      <span class="res-pl">${e.plassering??`–`}.</span>
      <div class="res-info">
        <span class="res-navn">${l(y(e.kaster)||`–`)}</span>
        <span class="res-klubb">${l(e.klubb?.navn??`–`)}</span>
      </div>
    </div>`).join(``);return`
    <div class="res-gruppe">
      <h2 class="res-gruppe-tittel">${l(e.label)}</h2>
      <div class="res-gruppe-rader">${t}</div>
    </div>`}function K(e){let t=e.rader.map(e=>{let t=e.kaster,n=t?`<a href="#/kastere/${p(t)}" class="res-kaster-lenke">${l(y(t))}</a>`:`–`;return`
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
    </div>`}async function q(e,{id:t}){e.replaceChildren(C(`Laster resultat…`));try{let[r,i]=await Promise.all([re(t),ne(t)]);if(r.error||!r.data){e.replaceChildren(n(`Kunne ikkje laste stevnet.`));return}if(i.error){e.replaceChildren(n(`Kunne ikkje laste resultat.`));return}let a=r.data,o=i.data;if(!o.length){e.replaceChildren(w(a.erfullfort?`Ingen resultat registrert.`:`Turneringa er ikkje avslutta enno.`));return}let s=W(o,(a.dato?new Date(a.dato+`T12:00:00`).getFullYear():9999)<2026),c=o.length;e.innerHTML=`
      <div class="res-side">
        <div class="res-felles">
          ${a.resultaturl?.startsWith(`http`)?`<a class="res-pdf-lenke" href="${l(a.resultaturl)}" target="_blank" rel="noopener">Resultat som pdf 📄</a>`:``}
          ${a.juryleder?`<p class="res-klassifisering">Juryleder: ${l(a.juryleder)}</p>`:``}
          <p class="res-antall"><strong>Antall deltakarar: ${c}</strong></p>
        </div>
        <div class="res-mobil-blokk">
          ${s.map(G).join(``)}
        </div>
        <div class="res-desktop-blokk">
          ${s.map(K).join(``)}
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
`);async function J(e){let{data:t,error:n}=await v.from(`kamp`).select(`
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
    `).eq(`stevneid`,e).eq(`er_bekreftet`,!0).eq(`er_walkover`,!1);return n&&g(`hentKamperForStats`,n),{data:t??[],error:n}}function Y(e){let t=new Map;for(let n of e){if(n.er_walkover)continue;let e=n.spelarar;for(let n of e){let r=e.filter(e=>e.kasterid!==n.kasterid).reduce((e,t)=>e+t.score_poeng,0);t.has(n.kasterid)||t.set(n.kasterid,{kasterid:n.kasterid,navn:y(n.kaster),matchCount:0,shoesThrown:0,ringers:0,ringerPct:0,doubleRingers:0,score4:0,score3:0,score2:0,score1:0,score0:0,scoreDiff:0});let i=t.get(n.kasterid);n.omgangar.length>0&&i.matchCount++,i.scoreDiff+=n.score_poeng-r;for(let e of n.omgangar)i.shoesThrown+=2,e.antall_ringer!=null&&(i.ringers+=e.antall_ringer),e.antall_ringer===2&&i.doubleRingers++,e.score===4?i.score4++:e.score===3?i.score3++:e.score===2?i.score2++:e.score===1?i.score1++:e.score===0&&i.score0++}}let n=[...t.values()].filter(e=>e.shoesThrown>0);for(let e of n)e.ringerPct=e.shoesThrown>0?e.ringers/e.shoesThrown*100:0;return n.sort((e,t)=>t.shoesThrown-e.shoesThrown)}function ie(e){return e>0?`+${e}`:String(e)}function ae(e){return`
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
      <td class="stats-td-diff ${e.scoreDiff>=0?`stats-td-pos`:`stats-td-neg`}">${ie(e.scoreDiff)}</td>
    </tr>`).join(``)}</tbody>
      </table>
    </div>`}function oe(e){let t=!1,n=0,r=0;e.addEventListener(`mousedown`,i=>{t=!0,e.classList.add(`is-grabbing`),n=i.pageX-e.offsetLeft,r=e.scrollLeft}),e.addEventListener(`mouseleave`,()=>{t=!1,e.classList.remove(`is-grabbing`)}),e.addEventListener(`mouseup`,()=>{t=!1,e.classList.remove(`is-grabbing`)}),e.addEventListener(`mousemove`,i=>{t&&(i.preventDefault(),e.scrollLeft=r-(i.pageX-e.offsetLeft-n))})}function se(e,t){let n=[...e.querySelectorAll(`tr`)];if(!n.length)return;let r=[...n[0].cells].slice(0,t).map(e=>e.offsetWidth);for(let e of n){let n=0;for(let i=0;i<t&&i<e.cells.length;i++){let a=e.cells[i];a.classList.add(`stats-col-sticky`),i===t-1&&a.classList.add(`stats-col-sticky-last`),a.style.setProperty(`--col-left`,`${n}px`),n+=r[i]}}}async function ce(e,{id:t}){e.replaceChildren(C(`Laster statistikk…`));try{let{data:r,error:i}=await J(t);if(i){e.replaceChildren(n(`Kunne ikkje laste statistikk.`));return}let a=Y(r);if(!a.length){e.replaceChildren(w(`Ingen bekrefte kampar enno.`));return}e.innerHTML=`<div class="stats-side">${ae(a)}</div>`;let o=e.querySelector(`.stats-tabell-wrap`),s=e.querySelector(`.stats-tabell`);o&&oe(o),s&&se(s,1)}catch(t){g(`stevne-stats.render`,t),e.replaceChildren(n(`Kunne ikkje laste statistikk.`))}}var X=[{key:`info`,label:`Info`,adminOnly:!1},{key:`deltakere`,label:`Deltakere`,adminOnly:!0},{key:`innledende`,label:`Innledande`,adminOnly:!1},{key:`avsluttende`,label:`Avsluttande`,adminOnly:!1},{key:`resultat`,label:`Sluttresultat`,adminOnly:!1},{key:`innstillinger`,label:`Innstillingar`,adminOnly:!0},{key:`stats`,label:`Statistikk`,adminOnly:!1}],Z=new Set(X.filter(e=>e.adminOnly).map(e=>e.key)),le={info:N,deltakere:B,innledende:V,avsluttende:H,innstillinger:U,resultat:q,stats:ce},Q={ikke_startet:`<span class="badge bg-secondary">Ikkje starta</span>`,innledende:`<span class="badge bg-primary">Innledande fase</span>`,avsluttende:`<span class="badge bg-success">Avsluttande fase</span>`};function ue(e,t,n,r){return`<ul class="nav nav-tabs mb-3">${X.filter(e=>n||!e.adminOnly).filter(e=>e.key!==`avsluttende`||r).map(({key:n,label:r})=>`
      <li class="nav-item">
        <a class="nav-link${t===n?` active`:``}"
           href="#/stevne/${e}/${n}">${r}</a>
      </li>`).join(``)}</ul>`}var $=null;async function de(e,t){let r=Number(t.id),a=String(t.tab??`info`);$&&=(await E($),null),e.replaceChildren(C());try{let{data:t,error:o}=await i(r);if(o||!t){e.replaceChildren(n(`Stevne ikkje funne.`));return}let s=await h()||await _(),u=t.avsluttendekastemetodeid!=null,d=!s&&Z.has(a)?`info`:a,f=Q[t.stevne_fase??`ikke_startet`]??``;e.innerHTML=`
      <div class="org-shell py-3 px-3">
        ${ue(r,d,s,u)}
        <div class="org-fase-header d-flex align-items-center gap-2 mb-3">
          <h5 class="mb-0 flex-grow-1">${l(t.navn)} <span id="fase-badge">${f}</span></h5>
          <div id="org-banner-knappar"></div>
        </div>
        <div id="org-subside"></div>
      </div>`;let p=e.querySelector(`#org-banner-knappar`),m=e.querySelector(`#org-subside`);await(le[d]??N)(m,{id:r,isAdmin:s},p),$=c(r,t=>{let n=e.querySelector(`#fase-badge`);n&&(n.innerHTML=Q[t??`ikke_startet`]??``)})}catch(t){g(`stevne.render`,t),e.replaceChildren(n(`Kunne ikkje laste stevnet.`))}}export{de as render};