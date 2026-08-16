import{n as e,r as t,t as n}from"./escHtml-Z0YwDf7L.js";import{$t as r,B as i,D as a,H as o,K as s,V as c,Xt as l,Yt as u,Zt as d,b as f,d as p,et as m,mt as h,nt as g,q as _,r as v,rt as y,s as b,t as x}from"./index-CY82xwnt.js";import{d as S,r as C}from"./kasterService-CQnR08kH.js";import{t as w}from"./SearchSelect-9z2eJz8A.js";import{i as T,n as E,r as D}from"./kaster-2cwCS5i9.js";import{n as O,r as k,t as A}from"./accountService-VUSGyQhz.js";import{I as j,O as ee,f as te,l as M}from"./kampService-DkSYNJOZ.js";import{t as N}from"./Tabs-DZCBJPb0.js";import{t as P,u as F}from"./navigationService-B7jb4P4S.js";import{n as I}from"./ScoreboardButton-cO_q_Bk1.js";function L(e){return`
    ${e===`avvist`?`<div class="alert alert-warning">Koblingforespørselen din vart avvist. Du kan sende ein ny.</div>`:``}
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">Koble til utøvarprofil</h5>
        <p class="card-text text-muted">Søk etter deg sjølv i registeret og send ein forespørsel. Etter godkjenning kan du melde deg på stevner.</p>
        <span id="thrower-search-slot"></span>
        <div id="thrower-error" class="alert alert-danger d-none mt-2"></div>
      </div>
    </div>`}function ne(){return`
    <div class="alert alert-info mb-4">
      <p class="mb-1">Koblingforespørselen din<span id="pending-name"></span> ventar på godkjenning.</p>
      <p class="mb-0 small">Feil kobling? Send e-post til <a href="mailto:kontakt@hesteskokasting.no">kontakt@hesteskokasting.no</a></p>
    </div>`}function re(e,t){let n=e.querySelector(`#pending-name`);!n||t==null||(async()=>{let{data:e}=await S(t);e&&(n.textContent=` for ${D(e)}`)})()}function ie(e,t){let n=e.querySelector(`#thrower-error`),r=[],i=null;i=w({slot:e.querySelector(`#thrower-search-slot`),loadItems:async()=>{let{data:e}=await C();return r=e.map(e=>({id:e.id,label:T(e),sublabel:e.klubb?.navn??null})),r},placeholder:`Søk på navn…`,onSelect:e=>{e!=null&&(async()=>{n.classList.add(`d-none`);let a=r.find(t=>t.id===e),s=a?a.label+(a.sublabel?` (${a.sublabel})`:``):``;if(!await o({title:`Er dette deg?`,message:`Send koblingforespørsel for ${s}?`,confirmText:`Send forespørsel`})){i?.setValue(null);return}let{error:c}=await h(t,e);if(c){n.textContent=`Kunne ikkje sende forespørsel.`,n.classList.remove(`d-none`);return}_(),await v()})()}})}function ae(e,t){return t.status===`godkjent`&&t.profil?.kasterid!=null?t.profil.kasterid:t.status===`venter`?(e.innerHTML=ne(),re(e,t.profil?.kobling_kasterid??null),null):(e.innerHTML=L(t.status),ie(e,t.user.id),null)}function R(e,t,r){let i=ae(e,t);return i==null?null:(e.innerHTML=`
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">${n(r)}</h5>
        <div data-slot="content"><div class="skeleton-block skeleton-block--card"></div></div>
      </div>
    </div>`,{throwerId:i,slot:e.querySelector(`[data-slot="content"]`)})}function z(e){let t=document.createElement(`div`);return t.innerHTML=e,t}var B=[{key:`innledende`,label:`Innleiande`},{key:`avsluttende`,label:`Avsluttande`}];function V(e){let t=B.findIndex(t=>t.key===e.kamp?.fase);return t===-1?B.length:t}function H(e,t){let n=e.kamp?.stevne;return(e.kamp?.fase===`innledende`?n?.metodeInnl?.navn:n?.metodeAvsl?.navn)??t}function U(e,t){let n=e[3]?e[3]:`<span class="visually-hidden">Statistikk</span>`;return`<div class="match-grid" role="table">${`<div class="match-grid__head" role="row">
      <span role="columnheader">${e[0]}</span>
      <span role="columnheader">${e[1]}</span>
      <span role="columnheader" class="match-grid__result">${e[2]}</span>
      <span role="columnheader" class="match-grid__stats">${n}</span>
    </div>`}${t.map(e=>`<div class="match-grid__row" role="row">
      <span class="match-grid__slot" role="cell">${e.slot}</span>
      <span class="match-grid__name" role="cell">${e.name}</span>
      <span class="match-grid__result" role="cell">${e.result}</span>
      <span class="match-grid__stats" role="cell">${e.stats}</span>
    </div>`).join(``)}</div>`}var W={win:`Vunne`,loss:`Tapt`,draw:`Uavgjort`,neutral:``};function G(e,t,r=W[t]){return`<span class="result-badge result-badge--${t}"${r?` title="${n(r)}"`:``}>${e}</span>`}function K(e){return e==null?``:`<span class="match-grid__rings" title="Ringar">${e}</span>`}function q(e,t,n){let r=e.kamp,i=(r?.spelarar??[]).filter(e=>e.kasterid!=null),a={};for(let e of i){let t=r?.stevneid==null?void 0:n[`${r.stevneid}:${e.kasterid}`];t!=null&&(a[e.kasterid]=t)}let o=ee(i,a),s=o.findIndex(e=>e.members.some(e=>e.kasterid===t));return{mine:s===-1?[]:o[s]?.members??[],others:o.filter((e,t)=>t!==s).map(e=>e.members)}}function J(e){return!e?.length||e.every(e=>e.kaster==null)}function oe(e){let t=e.flat().map(e=>n(D(e.kaster))).filter(Boolean);return t.length?t.join(` / `):`–`}function Y(e,t){return j({rep:e[0],members:e},t)}async function se(e){let[{data:t,error:r},i]=await Promise.all([M(e),F(e)]);if(r){let e=document.createElement(`p`);return e.className=`text-muted`,e.textContent=`Kunne ikkje laste kampar.`,e}let a=t,o=[...new Set(a.map(e=>e.kamp?.stevneid).filter(e=>e!=null))],s=await te(o),c=a.filter(e=>e.kamp?.stevne?.erfullfort===!1).sort((e,t)=>V(e)-V(t)||(e.kamp?.runde_nummer??0)-(t.kamp?.runde_nummer??0)),l=a.filter(e=>e.kamp?.stevne?.erfullfort===!0).sort((e,t)=>(t.kamp?.stevne?.dato??``).localeCompare(e.kamp?.stevne?.dato??``)||V(e)-V(t)||(e.kamp?.runde_nummer??0)-(t.kamp?.runde_nummer??0)),u=e=>(e.kamp?.spelarar??[]).some(e=>(e.omgangar?.length??0)>0),d=t=>{let n=t.kamp,r=n?.er_bekreftet??!1,{mine:i,others:a}=q(t,e,s);if(n?.er_walkover)return!J(a[0])&&Y(a[0],!0)>Y(i,!0)?G(`0 – 21`,`loss`,`Tapt på walkover`):G(`21 – 0`,`win`,`Vunne på walkover`);if(r&&(n?.er_tre_spelarar||a.length>1)){let t=i.find(t=>t.kasterid===e)?.kamp_plassering;return t==null?G(`–`,`neutral`):G(`${t}. plass`,t>=3?`loss`:`win`,`Plassering i kampen: ${t}`)}let o=a[0];if(!i.length||!o?.length)return G(`–`,`neutral`);let c=Y(i,r),l=Y(o,r);if(!r)return G(`${c} – ${l}`,`neutral`,`Ikkje stadfesta`);let u=c>l?`win`:c<l?`loss`:`draw`;return G(`${c} – ${l}`,u)},f=e=>{let t=e.kamp;return t?.er_walkover?``:t?.er_bekreftet??!1?u(e)?I(t?.id??``,P(),`scoreboard-btn--stats`):``:I(t?.id??``,P(),`scoreboard-btn--touch`)},p=t=>{let n=t.kamp,{others:r}=q(t,e,s),i=n?.er_walkover&&J(r[0]);return{slot:`<span class="match-grid__round">R${n?.runde_nummer??``} /</span> B${n?.bane_nummer??``}`,name:i?`<span class="match-grid__bye">Walkover</span>`:oe(r),result:d(t),stats:f(t)}},m=e=>U([`R / B`,`Motstandar`,`Resultat`,``],e.map(p)),h=e=>{let t=B.map(({key:t,label:n})=>({label:n,matches:e.filter(e=>e.kamp?.fase===t)})).filter(e=>e.matches.length),r=e.filter(e=>!B.some(t=>t.key===e.kamp?.fase));return[...t.map(({label:e,matches:t})=>`
      <p class="match-grid__phase">${n(H(t[0],e))}</p>
      ${m(t)}`),...r.length?[m(r)]:[]].join(``)},g=e=>{if(!e.length)return null;let t=new Map;for(let n of e){let e=n.kamp?.stevneid??`unknown`,r=n.kamp?.stevne?.navn??``;t.has(e)||t.set(e,{name:r,matches:[]}),t.get(e).matches.push(n)}return[...t.values()].map(({name:e,matches:t})=>`
      <p class="match-grid__stevne">${n(e)}</p>
      ${h(t)}`).join(``)},_=g(c),v=g(l),y=i.data.filter(e=>e.fase===`innledende`),b=y.filter(e=>e.stevne?.erfullfort===!1).sort((e,t)=>(e.bane_nummer??0)-(t.bane_nummer??0)),x=y.filter(e=>e.stevne?.erfullfort===!0).sort((e,t)=>(t.stevne?.dato??``).localeCompare(e.stevne?.dato??``)||(e.bane_nummer??0)-(t.bane_nummer??0)),S=e=>`#/stevne/${e.stevneid}/innledende`,C=t=>{let r=t.deltakarar.find(t=>t.kasterid===e),i=t.deltakarar.filter(t=>t.kasterid!==e).map(e=>n(D(e.kaster))),a=t.er_bekreftet??!1;return{slot:`B${t.bane_nummer??``}`,name:i.length?i.join(` / `):`–`,result:a?G(r?.poeng==null?`–`:String(r.poeng),`neutral`):`<a href="${S(t)}" class="btn btn-sm btn-primary">Opne bane</a>`,stats:a?K(r?.antall_ringer):``}},w=e=>{if(!e.length)return null;let t=new Map;for(let n of e){let e=n.stevneid??`unknown`;t.has(e)||t.set(e,{name:`${n.stevne?.navn??``} – X-kast`,courts:[]}),t.get(e).courts.push(n)}return[...t.values()].map(({name:e,courts:t})=>`
      <p class="match-grid__stevne">${n(e)}</p>
      ${U([`Bane`,`Medspelarar`,`Poeng`,`R`],t.map(C))}`).join(``)},T=w(b),E=w(x),O=[_,T].filter(Boolean).join(``),k=[v,E].filter(Boolean).join(``);return N({tabs:[{id:`active`,label:`Aktive (${c.length+b.length})`,panel:z(O||`<p class="text-muted">Ingen aktive kampar.</p>`)},{id:`completed`,label:`Ferdige (${l.length+x.length})`,panel:z(k||`<p class="text-muted">Ingen ferdige kampar enno.</p>`)}]})}async function ce(e,t){let n=R(e,t,`Kampar / X-kast`);if(!n)return;let r=await se(n.throwerId);n.slot.replaceChildren(r)}async function le(e){let{data:t,error:n}=await a(e),r=new Map;if(n){let e=document.createElement(`p`);return e.className=`text-muted`,e.textContent=`Kunne ikkje laste påmeldingar.`,{node:e,registeredMap:r}}let i=t.filter(e=>e.stevne?.erfullfort!==!0);if(!i.length)return{node:u(`Ingen påmeldingar enno.`),registeredMap:r};let o=[...i].sort((e,t)=>(e.stevne?.dato??``).localeCompare(t.stevne?.dato??``)),s=document.createElement(`div`);s.className=`stevne-kort-liste`;for(let e of o){let t=e.stevne,n=t?.id;n!=null&&r.set(n,e.id),t&&s.appendChild(b(t,{href:n==null?`#`:`#/stevne/${n}/info`,registrationSlotId:n??void 0}))}return{node:s,registeredMap:r}}async function ue(e,t){let n=R(e,t,`Påmeldingar`);if(!n)return;let{node:r,registeredMap:i}=await le(n.throwerId);n.slot.replaceChildren(r),f(e,n.throwerId,i)}async function de(n){let{data:r,error:i}=await t.from(`bruker_profil`).select(`varsle_stevne_start, varsle_kamp_opprettet`).eq(`id`,n).maybeSingle();return i&&e(`getNotificationPreferences`,i),{data:r,error:i}}async function fe(n,r,i){let a=r===`varsle_stevne_start`?{varsle_stevne_start:i}:{varsle_kamp_opprettet:i},{error:o}=await t.from(`bruker_profil`).update(a).eq(`id`,n);return o&&e(`updateNotificationPreference`,o),{error:o}}function pe(e){return`
    <div class="form-check form-switch mb-2">
      <input class="form-check-input" type="checkbox" role="switch" id="varsle-stevne-start"${e.varsle_stevne_start?` checked`:``}>
      <label class="form-check-label" for="varsle-stevne-start">Varsle når eit stevne startar</label>
    </div>
    <div class="form-check form-switch">
      <input class="form-check-input" type="checkbox" role="switch" id="varsle-kamp-opprettet"${e.varsle_kamp_opprettet?` checked`:``}>
      <label class="form-check-label" for="varsle-kamp-opprettet">Varsle når kampar for meg blir oppretta</label>
    </div>`}function me(e,t){for(let[n,r]of[[`varsle-stevne-start`,`varsle_stevne_start`],[`varsle-kamp-opprettet`,`varsle_kamp_opprettet`]]){let a=e.querySelector(`#${n}`);a&&a.addEventListener(`change`,async()=>{let e=a.checked;a.disabled=!0,e&&await y();let{error:n}=await fe(t,r,e);a.disabled=!1,n&&(a.checked=!e,c(`Kunne ikkje lagre varslingsinnstilling: ${i(n)}`,`error`))})}}async function he(e,t){let n=r.isNativePlatform();if(e.innerHTML=`
    ${n?`
      <div class="card mb-4">
        <div class="card-body">
          <h5 class="card-title">Varslingar</h5>
          <div data-slot="notifications"><div class="skeleton-block skeleton-block--card"></div></div>
        </div>
      </div>`:``}
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">Innstillingar</h5>
        <p class="text-muted mb-0">Fleire innstillingar kjem her seinare.</p>
      </div>
    </div>`,!n)return;let i=e.querySelector(`[data-slot="notifications"]`),{data:a}=await de(t.user.id);if(!a){i.innerHTML=`<p class="text-muted">Kunne ikkje laste varslingsinnstillingar.</p>`;return}i.innerHTML=pe(a),me(e,t.user.id)}var X=`Resultater og statistikk for koblet utøver blir ikkje slettet.`;async function Z(e){let{data:t,error:r}=await S(e);return r||!t?``:`
    <h5 class="card-title">Kontoen er koblet til utøvarprofil</h5>
    <p class="mb-1"><strong>${n(D(t))}</strong> · ${n(t.klubb?.navn??``)}</p>
    <a href="#/kastere/${E(t)}" class="btn btn-sm btn-outline-primary mt-1">Vis profil</a>`}function ge(e){let t=e?`Bytt passord`:`Opprett passord`;return`
    <h5 class="card-title">${t}</h5>
    ${e?``:`<p class="card-text text-muted">Du er innlogga med Google eller Apple. Opprettar du eit passord, kan du også logge inn med e-post og passord.</p>`}
    <form id="password-form">
      <div class="mb-3">
        <label class="form-label" for="ko-password">Nytt passord</label>
        <input type="password" class="form-control" id="ko-password" required autocomplete="new-password" minlength="8">
      </div>
      <div class="mb-3">
        <label class="form-label" for="ko-password2">Gjenta nytt passord</label>
        <input type="password" class="form-control" id="ko-password2" required autocomplete="new-password" minlength="8">
      </div>
      <div id="ko-password-error" class="alert alert-danger d-none"></div>
      <button type="submit" class="btn btn-primary">${t}</button>
    </form>`}function _e(e,t){return`
    <p class="card-text text-muted">Alle kontoar som er kobla til utøvarprofilen din.</p>
    <table class="table table-sm align-middle linked-accounts-table">
      <thead><tr><th>E-post</th><th>Oppretta</th><th></th></tr></thead>
      <tbody>${e.map(e=>{let r=e.id===t?`<span class="badge bg-secondary">deg</span>`:`<button class="btn btn-sm btn-outline-primary" data-login-email="${n(e.epost)}">Logg inn</button>`;return`<tr>
      <td class="linked-accounts-table__email">${n(e.epost)}</td>
      <td class="linked-accounts-table__date">${n(p(e.opprettet_at))}</td>
      <td class="text-end linked-accounts-table__actions">${r}</td>
    </tr>`}).join(``)}</tbody>
    </table>`}function ve(t){t.querySelector(`#password-form`).addEventListener(`submit`,async n=>{n.preventDefault();let r=n.target,a=t.querySelector(`#ko-password-error`);a.classList.add(`d-none`);let o=t.querySelector(`#ko-password`).value;if(o!==t.querySelector(`#ko-password2`).value){a.textContent=`Passorda er ikkje like.`,a.classList.remove(`d-none`);return}let s=r.querySelector(`[type=submit]`);s.disabled=!0;let{error:l}=await g(o);if(s.disabled=!1,l){e(`minsideKonto.updatePassword`,l),a.textContent=`Kunne ikkje endre passord: ${i(l)}`,a.classList.remove(`d-none`);return}c(`Passordet er endra.`,`success`),r.reset()})}function ye(e){e.querySelector(`[data-slot="accounts"]`).addEventListener(`click`,async e=>{let t=e.target.closest(`[data-login-email]`);t&&(await m(),location.hash=`#/logginn?email=${encodeURIComponent(t.dataset.loginEmail)}`)})}function be(e,t){e.querySelector(`#delete-own-account`).addEventListener(`click`,async()=>{if(!await o({title:`Slette kontoen?`,message:`Innloggingskontoen ${t.user.email??``} vert sletta permanent. ${X}`,confirmText:`Slett konto`,danger:!0}))return;let{error:e}=await A(t.user.id);if(e){c(`Kunne ikkje slette kontoen: ${i(e)}`,`error`);return}try{await m()}catch{}location.hash=`#/logginn`})}async function xe(t,n){let r=n.status===`godkjent`?n.profil?.kasterid??null:null,i=r!=null,a=n.user.identities?.some(e=>e.provider===`email`)??!0;if(t.innerHTML=`
    ${i?`<div class="card mb-4"><div class="card-body" data-slot="thrower"><div class="skeleton-block skeleton-block--card"></div></div></div>`:``}
    <div class="card mb-4"><div class="card-body">${ge(a)}</div></div>
    ${i?`
      <div class="card mb-4"><div class="card-body">
        <h5 class="card-title">Innloggingskontoar</h5>
        <div data-slot="accounts"><div class="skeleton-block skeleton-block--card"></div></div>
      </div></div>`:``}
    <div class="card mb-4"><div class="card-body">
      <h5 class="card-title">Slett kontoen min</h5>
      <p class="card-text text-muted">${X}</p>
      <button type="button" class="btn btn-danger" id="delete-own-account">Slett kontoen min</button>
    </div></div>`,ve(t),be(t,n),r==null)return;ye(t);let o=t.querySelector(`[data-slot="thrower"]`),s=t.querySelector(`[data-slot="accounts"]`);try{let[e,t]=await Promise.all([Z(r),O()]);o.innerHTML=e,s.innerHTML=t.error?`<p class="text-muted">Kunne ikkje laste kontoar.</p>`:_e(t.data,n.user.id)}catch(t){e(`minsideKonto.render`,t),s.innerHTML=`<p class="text-muted">Kunne ikkje laste kontoar.</p>`}}var Q=[{key:`kampar`,label:`Kampar`},{key:`pameldingar`,label:`Påmeldingar`},{key:`innstillingar`,label:`Innstillingar`},{key:`konto`,label:`Konto`}],Se=new Set(Q.map(e=>e.key)),Ce={kampar:ce,pameldingar:ue,innstillingar:he,konto:xe};function we(e){return`<ul class="nav nav-underline mypage-nav mb-3">${Q.map(({key:t,label:n})=>`
      <li class="nav-item">
        <a class="nav-link${e===t?` active`:``}"
           href="#/minside/${t}">${n}</a>
      </li>`).join(``)}</ul>`}async function $(t,r){x(()=>$(t,r));let i=String(r.tab??`kampar`);t.replaceChildren(d(`Laster min side…`));try{let e=await s();if(!e){location.hash=`#/logginn`;return}let{profil:r,user:a}=e,o=r?.kobling_status??`ingen`,c=i===`varslingar`?`innstillingar`:i,l=Se.has(c)?c:`kampar`;t.innerHTML=`
      <div class="mypage-container">
        <div class="mypage-head">
          <div>
            <h2 class="mb-1">Min side</h2>
            <p class="text-muted mb-0">${n(a.email??``)}</p>
          </div>
          <div data-slot="logout"></div>
        </div>
        ${we(l)}
        <div id="minside-subpage"></div>
      </div>`,t.querySelector(`[data-slot="logout"]`).appendChild(k());let u=t.querySelector(`#minside-subpage`);await Ce[l](u,{user:a,profil:r,status:o})}catch(n){e(`minside.render`,n),t.replaceChildren(l(`Kunne ikkje laste min side.`))}}export{$ as render};