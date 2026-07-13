import{n as e,t}from"./logError-D5z16FyH.js";import{C as n,D as r,E as i,F as a,G as o,Lt as s,M as c,P as l,Rt as u,S as d,St as f,Vt as p,d as m,i as h,n as g,t as _,w as v,wt as y,xt as b}from"./index-C84QzxMz.js";import{r as x,u as S}from"./kasterService-B3gLOC11.js";import{t as C}from"./LoadingState-BWi0wPLz.js";import{t as ee}from"./EmptyState-B1E_7OzB.js";import{d as te,m as ne}from"./kampService-CnBu9jM9.js";import{t as w}from"./Tabs-B8ddqDpf.js";function T(e){return`
    ${e===`avvist`?`<div class="alert alert-warning">Koblingforespørselen din vart avvist. Du kan sende ein ny.</div>`:``}
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">Koble til utøvarprofil</h5>
        <p class="card-text text-muted">Søk etter deg sjølv i registeret og send ein forespørsel. Etter godkjenning kan du melde deg på stevner.</p>
        <input type="search" id="thrower-search" class="form-control mb-2" placeholder="Søk på navn…">
        <div id="thrower-matches" class="list-group mb-2"></div>
        <div id="thrower-error" class="alert alert-danger d-none"></div>
      </div>
    </div>`}function E(){return`<div class="alert alert-info mb-4">Koblingforespørselen din ventar på godkjenning frå ein administrator.</div>`}function D(e,t){let n=null,i=null,a=e.querySelector(`#thrower-search`),s=e.querySelector(`#thrower-matches`),c=e.querySelector(`#thrower-error`);a.addEventListener(`input`,()=>{n!==null&&clearTimeout(n);let e=a.value.trim().toLowerCase();if(e.length<2){s.innerHTML=``;return}n=setTimeout(async()=>{if(!i){let{data:e}=await x();i=e}let t=i.filter(t=>t.fornavn.toLowerCase().includes(e)||t.etternavn.toLowerCase().includes(e)).slice(0,8);if(!t.length){let e=ee(`Ingen treff.`);e.classList.add(`small`),s.replaceChildren(e);return}s.innerHTML=t.map(e=>`<button class="list-group-item list-group-item-action" data-id="${e.id}">
          ${b(u(e))} <span class="text-muted small">· ${b(e.klubb?.navn??``)}</span>
        </button>`).join(``)},300)}),s.addEventListener(`click`,async e=>{let n=e.target.closest(`[data-id]`);if(!n)return;c.classList.add(`d-none`);let{error:i}=await o(t,Number(n.dataset.id));if(i){c.textContent=`Kunne ikkje sende forespørsel.`,c.classList.remove(`d-none`);return}r(),await g()})}function O(e,t){return t.status===`godkjent`&&t.profil?.kasterid!=null?t.profil.kasterid:t.status===`venter`?(e.innerHTML=E(),null):(e.innerHTML=T(t.status),D(e,t.user.id),null)}function k(e){let t=document.createElement(`div`);return t.innerHTML=e,t}var A=[{key:`innledende`,label:`Innleiande`},{key:`avsluttende`,label:`Avsluttande`}];function j(e){let t=A.findIndex(t=>t.key===e.kamp?.fase);return t===-1?A.length:t}function M(e,t,n,r){let i=n==null?void 0:r[`${n}:${t}`];return e.filter(e=>{if(e.kasterid==null||e.kasterid===t)return!1;let a=n==null?void 0:r[`${n}:${e.kasterid}`];return i==null||a==null||a!==i})}async function N(e){let{data:t,error:n}=await te(e);if(n){let e=document.createElement(`p`);return e.className=`text-muted`,e.textContent=`Kunne ikkje laste kampar.`,e}let r=t.filter(e=>!e.kamp?.er_walkover),i=await ne([...new Set(r.map(e=>e.kamp?.stevneid).filter(e=>e!=null))]),a=r.filter(e=>e.kamp?.stevne?.erfullfort===!1).sort((e,t)=>(e.kamp?.runde_nummer??0)-(t.kamp?.runde_nummer??0)),o=r.filter(e=>e.kamp?.stevne?.erfullfort===!0).sort((e,t)=>(t.kamp?.stevne?.dato??``).localeCompare(e.kamp?.stevne?.dato??``)||j(e)-j(t)||(e.kamp?.runde_nummer??0)-(t.kamp?.runde_nummer??0)),s=(t,n)=>{let r=t.kamp,a=r?.stevneid,o=M(r?.spelarar??[],e,a,i),s=o.length?o.map(e=>b(u(e.kaster))).join(` / `):`–`;return`<tr>
      <td>R${r?.runde_nummer??``} / B${r?.bane_nummer??``}</td>
      <td>${s}</td>
      <td>${n}</td>
    </tr>`},c=(e,t)=>`
      <table class="table table-sm mb-3"><thead><tr><th>Runde/Bane</th><th>Motstandar</th><th></th></tr></thead><tbody>
        ${e.map(e=>s(e,t(e))).join(``)}
      </tbody></table>`,l=(e,t)=>{let n=A.map(({key:t,label:n})=>({label:n,matches:e.filter(e=>e.kamp?.fase===t)})).filter(e=>e.matches.length),r=n.reduce((e,t)=>e+t.matches.length,0)===e.length;return n.length<2||!r?c(e,t):n.map(({label:e,matches:n})=>`
      <p class="text-muted small mb-1">${e}</p>
      ${c(n,t)}`).join(``)},d=(e,t,n=!1)=>{if(!e.length)return null;let r=new Map;for(let t of e){let e=t.kamp?.stevneid??`unknown`,n=t.kamp?.stevne?.navn??``;r.has(e)||r.set(e,{name:n,matches:[]}),r.get(e).matches.push(t)}return[...r.values()].map(({name:e,matches:r})=>`
      <p class="fw-semibold mb-1 mt-2">${b(e)}</p>
      ${n?l(r,t):c(r,t)}`).join(``)},f=d(a,t=>{if(!t.kamp?.er_bekreftet)return`<a href="#/kamp/${t.kamp?.id??``}" class="btn btn-sm btn-primary" target="_blank" rel="noopener">Scoreboard</a>`;let n=t.kamp.stevneid,r=t.kamp.spelarar?.find(t=>t.kasterid===e)?.score_poeng,a=M(t.kamp.spelarar??[],e,n,i)[0]?.score_poeng;return r==null||a==null?`–`:`<span class="fw-semibold">${r} – ${a}</span>`}),p=d(o,e=>`<a href="#/kamp/${e.kamp?.id??``}" class="btn btn-sm btn-outline-secondary" target="_blank" rel="noopener">Vis</a>`,!0);return w({tabs:[{id:`active`,label:`Aktive (${a.length})`,panel:k(f??`<p class="text-muted">Ingen aktive kampar.</p>`)},{id:`completed`,label:`Ferdige (${o.length})`,panel:k(p??`<p class="text-muted">Ingen ferdige kampar enno.</p>`)}]})}async function P(e,t){let n=O(e,t);if(n==null)return;e.innerHTML=`
    <div class="card mb-4" id="my-matches-section">
      <div class="card-body">
        <h5 class="card-title">Mine kampar</h5>
        <div class="skeleton-block skeleton-block--card" data-slot="content"></div>
      </div>
    </div>`;let r=e.querySelector(`[data-slot="content"]`),i=await N(n);r.replaceWith(i)}async function F(e){let{data:t,error:n}=await m(e),r=new Map;if(n)return{html:`<p class="text-muted">Kunne ikkje laste påmeldingar.</p>`,registeredMap:r};let i=t.filter(e=>e.stevne?.erfullfort!==!0);return i.length?{html:`
      <table class="table table-sm">
        <thead><tr><th>Stevne</th><th>Dato</th><th></th></tr></thead>
        <tbody>${[...i].sort((e,t)=>(e.stevne?.dato??``).localeCompare(t.stevne?.dato??``)).map(e=>{let t=y(e.stevne?.dato),n=e.stevne?.id;return n!=null&&r.set(n,e.id),`<tr>
      <td><a href="#/stevne/${n??``}/pamelding">${b(e.stevne?.navn??``)}</a></td>
      <td>${b(t)}</td>
      <td>${n==null?``:`<span data-registration-slot="${n}"></span>`}</td>
    </tr>`}).join(``)}</tbody>
      </table>`,registeredMap:r}:{html:`<p class="empty-state">Ingen påmeldingar enno.</p>`,registeredMap:r}}async function I(e,t){let n=O(e,t);if(n==null)return;e.innerHTML=`
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">Påmeldingar</h5>
        <div data-slot="content"><div class="skeleton-block skeleton-block--card"></div></div>
      </div>
    </div>`;let r=e.querySelector(`[data-slot="content"]`),{html:i,registeredMap:a}=await F(n);r.innerHTML=i,h(e,n,t.user.id,a)}async function L(n){let{data:r,error:i}=await e.from(`bruker_profil`).select(`varsle_stevne_start, varsle_kamp_opprettet`).eq(`id`,n).maybeSingle();return i&&t(`getNotificationPreferences`,i),{data:r,error:i}}async function R(n,r,i){let a=r===`varsle_stevne_start`?{varsle_stevne_start:i}:{varsle_kamp_opprettet:i},{error:o}=await e.from(`bruker_profil`).update(a).eq(`id`,n);return o&&t(`updateNotificationPreference`,o),{error:o}}function z(e){return`
    <div class="form-check form-switch mb-2">
      <input class="form-check-input" type="checkbox" role="switch" id="varsle-stevne-start"${e.varsle_stevne_start?` checked`:``}>
      <label class="form-check-label" for="varsle-stevne-start">Varsle når eit stevne startar</label>
    </div>
    <div class="form-check form-switch">
      <input class="form-check-input" type="checkbox" role="switch" id="varsle-kamp-opprettet"${e.varsle_kamp_opprettet?` checked`:``}>
      <label class="form-check-label" for="varsle-kamp-opprettet">Varsle når kampar for meg blir oppretta</label>
    </div>`}function re(e,t){for(let[r,i]of[[`varsle-stevne-start`,`varsle_stevne_start`],[`varsle-kamp-opprettet`,`varsle_kamp_opprettet`]]){let o=e.querySelector(`#${r}`);o&&o.addEventListener(`change`,async()=>{let e=o.checked;o.disabled=!0,e&&await a();let{error:r}=await R(t,i,e);o.disabled=!1,r&&(o.checked=!e,n(`Kunne ikkje lagre varslingsinnstilling: ${d(r)}`,`error`))})}}async function B(e,t){let n=p.isNativePlatform();if(e.innerHTML=`
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
    </div>`,!n)return;let r=e.querySelector(`[data-slot="notifications"]`),{data:i}=await L(t.user.id);if(!i){r.innerHTML=`<p class="text-muted">Kunne ikkje laste varslingsinnstillingar.</p>`;return}r.innerHTML=z(i),re(e,t.user.id)}async function V(){let{data:n,error:r}=await e.rpc(`hent_kobla_kontoar`);return r&&t(`getLinkedAccounts`,r),{data:n??[],error:r}}async function H(n){let{error:r}=await e.rpc(`slett_brukarkonto`,{target_id:n});return r&&t(`deleteUserAccount`,r),{error:r}}var U=`Resultater og statistikk for koblet utøver blir ikkje slettet.`;async function W(e){let{data:t,error:n}=await S(e);return n||!t?``:`
    <h5 class="card-title">Kontoen er koblet til utøvarprofil</h5>
    <p class="mb-1"><strong>${b(u(t))}</strong> · ${b(t.klubb?.navn??``)}</p>
    <a href="#/kastere/${s(t)}" class="btn btn-sm btn-outline-primary mt-1">Vis profil</a>`}function G(e){let t=e?`Bytt passord`:`Opprett passord`;return`
    <h5 class="card-title">${t}</h5>
    ${e?``:`<p class="card-text text-muted">Du er innlogga med Google. Opprettar du eit passord, kan du også logge inn med e-post og passord.</p>`}
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
    </form>`}function K(e,t){return`
    <p class="card-text text-muted">Alle kontoar som er kobla til utøvarprofilen din.</p>
    <table class="table table-sm align-middle linked-accounts-table">
      <thead><tr><th>E-post</th><th>Oppretta</th><th></th></tr></thead>
      <tbody>${e.map(e=>{let n=e.id===t?`<span class="badge bg-secondary">deg</span>`:`<button class="btn btn-sm btn-outline-primary" data-login-email="${b(e.epost)}">Logg inn</button>
         <button class="btn btn-sm btn-outline-danger" data-delete-id="${e.id}" data-email="${b(e.epost)}">Slett</button>`;return`<tr>
      <td class="linked-accounts-table__email">${b(e.epost)}</td>
      <td class="linked-accounts-table__date">${b(y(e.opprettet_at))}</td>
      <td class="text-end linked-accounts-table__actions">${n}</td>
    </tr>`}).join(``)}</tbody>
    </table>`}function q(e){e.querySelector(`#password-form`).addEventListener(`submit`,async r=>{r.preventDefault();let i=r.target,a=e.querySelector(`#ko-password-error`);a.classList.add(`d-none`);let o=e.querySelector(`#ko-password`).value;if(o!==e.querySelector(`#ko-password2`).value){a.textContent=`Passorda er ikkje like.`,a.classList.remove(`d-none`);return}let s=i.querySelector(`[type=submit]`);s.disabled=!0;let{error:c}=await l(o);if(s.disabled=!1,c){t(`minsideKonto.updatePassword`,c),a.textContent=`Kunne ikkje endre passord: ${d(c)}`,a.classList.remove(`d-none`);return}n(`Passordet er endra.`,`success`),i.reset()})}async function J(e,t){if(!await v({title:`Slette kontoen?`,message:`Innloggingskontoen ${t} vert sletta permanent. ${U}`,confirmText:`Slett konto`,danger:!0}))return!1;let{error:r}=await H(e);return r?(n(`Kunne ikkje slette kontoen: ${d(r)}`,`error`),!1):!0}function Y(e,t){e.querySelector(`[data-slot="accounts"]`).addEventListener(`click`,async r=>{let i=r.target,a=i.closest(`[data-login-email]`);if(a){await c(),location.hash=`#/logginn?email=${encodeURIComponent(a.dataset.loginEmail)}`;return}let o=i.closest(`[data-delete-id]`);o&&await J(o.dataset.deleteId,o.dataset.email??``)&&(n(`Kontoen er sletta.`,`success`),await Z(e,t))})}function X(e,t){e.querySelector(`#delete-own-account`).addEventListener(`click`,async()=>{if(await J(t.user.id,t.user.email??``)){try{await c()}catch{}location.hash=`#/logginn`}})}async function Z(e,n){let r=n.status===`godkjent`?n.profil?.kasterid??null:null,i=r!=null,a=n.user.identities?.some(e=>e.provider===`email`)??!0;if(e.innerHTML=`
    ${i?`<div class="card mb-4"><div class="card-body" data-slot="thrower"><div class="skeleton-block skeleton-block--card"></div></div></div>`:``}
    <div class="card mb-4"><div class="card-body">${G(a)}</div></div>
    ${i?`
      <div class="card mb-4"><div class="card-body">
        <h5 class="card-title">Innloggingskontoar</h5>
        <div data-slot="accounts"><div class="skeleton-block skeleton-block--card"></div></div>
      </div></div>`:``}
    <div class="card mb-4"><div class="card-body">
      <h5 class="card-title">Slett kontoen min</h5>
      <p class="card-text text-muted">${U}</p>
      <button type="button" class="btn btn-danger" id="delete-own-account">Slett kontoen min</button>
    </div></div>`,q(e),X(e,n),r==null)return;Y(e,n);let o=e.querySelector(`[data-slot="thrower"]`),s=e.querySelector(`[data-slot="accounts"]`);try{let[e,t]=await Promise.all([W(r),V()]);o.innerHTML=e,s.innerHTML=t.error?`<p class="text-muted">Kunne ikkje laste kontoar.</p>`:K(t.data,n.user.id)}catch(e){t(`minsideKonto.render`,e),s.innerHTML=`<p class="text-muted">Kunne ikkje laste kontoar.</p>`}}var Q=[{key:`kampar`,label:`Kampar`},{key:`pameldingar`,label:`Påmeldingar`},{key:`innstillingar`,label:`Innstillingar`},{key:`konto`,label:`Konto`}],ie=new Set(Q.map(e=>e.key)),ae={kampar:P,pameldingar:I,innstillingar:B,konto:Z};function oe(e){return`<ul class="nav nav-underline mypage-nav mb-3">${Q.map(({key:t,label:n})=>`
      <li class="nav-item">
        <a class="nav-link${e===t?` active`:``}"
           href="#/minside/${t}">${n}</a>
      </li>`).join(``)}</ul>`}async function $(e,n){_(()=>$(e,n));let r=String(n.tab??`kampar`);e.replaceChildren(C(`Laster min side…`));try{let t=await i();if(!t){location.hash=`#/logginn`;return}let{profil:n,user:a}=t,o=n?.kobling_status??`ingen`,s=r===`varslingar`?`innstillingar`:r,c=ie.has(s)?s:`kampar`;e.innerHTML=`
      <div class="mypage-container">
        <h2 class="mb-1">Min side</h2>
        <p class="text-muted mb-3">${b(a.email??``)}</p>
        ${oe(c)}
        <div id="minside-subpage"></div>
      </div>`;let l=e.querySelector(`#minside-subpage`);await ae[c](l,{user:a,profil:n,status:o})}catch(n){t(`minside.render`,n),e.replaceChildren(f(`Kunne ikkje laste min side.`))}}export{$ as render};