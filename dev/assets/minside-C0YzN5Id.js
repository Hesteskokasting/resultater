import{n as e,t}from"./logError-D5z16FyH.js";import{Bt as n,Dt as r,E as i,F as a,J as o,L as s,O as c,R as l,T as u,Tt as d,Vt as f,Wt as p,a as m,i as h,k as g,n as _,p as v,t as y,w as b,wt as x}from"./index-DVHt6_kn.js";import{r as S,u as C}from"./kasterService-B3gLOC11.js";import{t as w}from"./LoadingState-BWi0wPLz.js";import{t as T}from"./EmptyState-B1E_7OzB.js";import{d as ee,m as te}from"./kampService-CnBu9jM9.js";import{t as E}from"./SearchInput-BLUeXGg6.js";import{t as D}from"./Tabs-BIv0oqoM.js";import{t as O}from"./navigationService-BDaEjsIC.js";function k(e){return`
    ${e===`avvist`?`<div class="alert alert-warning">Koblingforespørselen din vart avvist. Du kan sende ein ny.</div>`:``}
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">Koble til utøvarprofil</h5>
        <p class="card-text text-muted">Søk etter deg sjølv i registeret og send ein forespørsel. Etter godkjenning kan du melde deg på stevner.</p>
        <span id="thrower-search-slot"></span>
        <div id="thrower-matches" class="list-group mb-2"></div>
        <div id="thrower-error" class="alert alert-danger d-none"></div>
      </div>
    </div>`}function A(){return`<div class="alert alert-info mb-4">Koblingforespørselen din ventar på godkjenning frå ein administrator.</div>`}function j(e,t){let n=null,r=null,i=e.querySelector(`#thrower-matches`),a=e.querySelector(`#thrower-error`);E({slot:e.querySelector(`#thrower-search-slot`),placeholder:`Søk på navn…`,variant:`form`,onInput:e=>{n!==null&&clearTimeout(n);let t=e.trim().toLowerCase();if(t.length<2){i.innerHTML=``;return}n=setTimeout(async()=>{if(!r){let{data:e}=await S();r=e}let e=r.filter(e=>e.fornavn.toLowerCase().includes(t)||e.etternavn.toLowerCase().includes(t)).slice(0,8);if(!e.length){let e=T(`Ingen treff.`);e.classList.add(`small`),i.replaceChildren(e);return}i.innerHTML=e.map(e=>`<button class="list-group-item list-group-item-action" data-id="${e.id}">
            ${x(f(e))} <span class="text-muted small">· ${x(e.klubb?.navn??``)}</span>
          </button>`).join(``)},300)}}),i.addEventListener(`click`,async e=>{let n=e.target.closest(`[data-id]`);if(!n)return;a.classList.add(`d-none`);let{error:r}=await o(t,Number(n.dataset.id));if(r){a.textContent=`Kunne ikkje sende forespørsel.`,a.classList.remove(`d-none`);return}g(),await _()})}function M(e,t){return t.status===`godkjent`&&t.profil?.kasterid!=null?t.profil.kasterid:t.status===`venter`?(e.innerHTML=A(),null):(e.innerHTML=k(t.status),j(e,t.user.id),null)}function N(e,t,n){let r=M(e,t);return r==null?null:(e.innerHTML=`
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">${x(n)}</h5>
        <div data-slot="content"><div class="skeleton-block skeleton-block--card"></div></div>
      </div>
    </div>`,{throwerId:r,slot:e.querySelector(`[data-slot="content"]`)})}function P(e){let t=document.createElement(`div`);return t.innerHTML=e,t}var F=[{key:`innledende`,label:`Innleiande`},{key:`avsluttende`,label:`Avsluttande`}];function I(e){let t=F.findIndex(t=>t.key===e.kamp?.fase);return t===-1?F.length:t}function L(e,t,n,r){let i=n==null?void 0:r[`${n}:${t}`];return e.filter(e=>{if(e.kasterid==null||e.kasterid===t)return!1;let a=n==null?void 0:r[`${n}:${e.kasterid}`];return i==null||a==null||a!==i})}async function R(e){let{data:t,error:n}=await ee(e);if(n){let e=document.createElement(`p`);return e.className=`text-muted`,e.textContent=`Kunne ikkje laste kampar.`,e}let r=t.filter(e=>!e.kamp?.er_walkover),i=await te([...new Set(r.map(e=>e.kamp?.stevneid).filter(e=>e!=null))]),a=r.filter(e=>e.kamp?.stevne?.erfullfort===!1).sort((e,t)=>(e.kamp?.runde_nummer??0)-(t.kamp?.runde_nummer??0)),o=r.filter(e=>e.kamp?.stevne?.erfullfort===!0).sort((e,t)=>(t.kamp?.stevne?.dato??``).localeCompare(e.kamp?.stevne?.dato??``)||I(e)-I(t)||(e.kamp?.runde_nummer??0)-(t.kamp?.runde_nummer??0)),s=(t,n)=>{let r=t.kamp,a=r?.stevneid,o=L(r?.spelarar??[],e,a,i),s=o.length?o.map(e=>x(f(e.kaster))).join(` / `):`–`;return`<tr>
      <td>R${r?.runde_nummer??``} / B${r?.bane_nummer??``}</td>
      <td>${s}</td>
      <td>${n}</td>
    </tr>`},c=(e,t)=>`
      <table class="table table-sm mb-3"><thead><tr><th>Runde/Bane</th><th>Motstandar</th><th></th></tr></thead><tbody>
        ${e.map(e=>s(e,t(e))).join(``)}
      </tbody></table>`,l=(e,t)=>{let n=F.map(({key:t,label:n})=>({label:n,matches:e.filter(e=>e.kamp?.fase===t)})).filter(e=>e.matches.length),r=n.reduce((e,t)=>e+t.matches.length,0)===e.length;return n.length<2||!r?c(e,t):n.map(({label:e,matches:n})=>`
      <p class="text-muted small mb-1">${e}</p>
      ${c(n,t)}`).join(``)},u=(e,t,n=!1)=>{if(!e.length)return null;let r=new Map;for(let t of e){let e=t.kamp?.stevneid??`unknown`,n=t.kamp?.stevne?.navn??``;r.has(e)||r.set(e,{name:n,matches:[]}),r.get(e).matches.push(t)}return[...r.values()].map(({name:e,matches:r})=>`
      <p class="fw-semibold mb-1 mt-2">${x(e)}</p>
      ${n?l(r,t):c(r,t)}`).join(``)},d=u(a,t=>{if(!t.kamp?.er_bekreftet)return`<a href="#/kamp/${t.kamp?.id??``}" class="btn btn-sm btn-primary"${O()}>Scoreboard</a>`;let n=t.kamp.stevneid,r=t.kamp.spelarar?.find(t=>t.kasterid===e)?.score_poeng,a=L(t.kamp.spelarar??[],e,n,i)[0]?.score_poeng;return r==null||a==null?`–`:`<span class="fw-semibold">${r} – ${a}</span>`}),p=u(o,e=>`<a href="#/kamp/${e.kamp?.id??``}" class="btn btn-sm btn-outline-secondary"${O()}>Vis</a>`,!0);return D({tabs:[{id:`active`,label:`Aktive (${a.length})`,panel:P(d??`<p class="text-muted">Ingen aktive kampar.</p>`)},{id:`completed`,label:`Ferdige (${o.length})`,panel:P(p??`<p class="text-muted">Ingen ferdige kampar enno.</p>`)}]})}async function z(e,t){let n=N(e,t,`Mine kampar`);if(!n)return;let r=await R(n.throwerId);n.slot.replaceChildren(r)}async function B(e){let{data:t,error:n}=await v(e),i=new Map;if(n){let e=document.createElement(`p`);return e.className=`text-muted`,e.textContent=`Kunne ikkje laste påmeldingar.`,{node:e,registeredMap:i}}let a=t.filter(e=>e.stevne?.erfullfort!==!0);if(!a.length)return{node:T(`Ingen påmeldingar enno.`),registeredMap:i};let o=[...a].sort((e,t)=>(e.stevne?.dato??``).localeCompare(t.stevne?.dato??``)),s=document.createElement(`div`);s.className=`stevne-kort-liste`;for(let e of o){let t=e.stevne?.id;t!=null&&i.set(t,e.id),s.appendChild(h({title:e.stevne?.navn??``,href:t==null?`#`:`#/stevne/${t}/info`,date:r(e.stevne?.dato),status:`upcoming`,registrationSlotId:t??void 0}))}return{node:s,registeredMap:i}}async function ne(e,t){let n=N(e,t,`Påmeldingar`);if(!n)return;let{node:r,registeredMap:i}=await B(n.throwerId);n.slot.replaceChildren(r),m(e,n.throwerId,t.user.id,i)}async function V(n){let{data:r,error:i}=await e.from(`bruker_profil`).select(`varsle_stevne_start, varsle_kamp_opprettet`).eq(`id`,n).maybeSingle();return i&&t(`getNotificationPreferences`,i),{data:r,error:i}}async function H(n,r,i){let a=r===`varsle_stevne_start`?{varsle_stevne_start:i}:{varsle_kamp_opprettet:i},{error:o}=await e.from(`bruker_profil`).update(a).eq(`id`,n);return o&&t(`updateNotificationPreference`,o),{error:o}}function U(e){return`
    <div class="form-check form-switch mb-2">
      <input class="form-check-input" type="checkbox" role="switch" id="varsle-stevne-start"${e.varsle_stevne_start?` checked`:``}>
      <label class="form-check-label" for="varsle-stevne-start">Varsle når eit stevne startar</label>
    </div>
    <div class="form-check form-switch">
      <input class="form-check-input" type="checkbox" role="switch" id="varsle-kamp-opprettet"${e.varsle_kamp_opprettet?` checked`:``}>
      <label class="form-check-label" for="varsle-kamp-opprettet">Varsle når kampar for meg blir oppretta</label>
    </div>`}function W(e,t){for(let[n,r]of[[`varsle-stevne-start`,`varsle_stevne_start`],[`varsle-kamp-opprettet`,`varsle_kamp_opprettet`]]){let i=e.querySelector(`#${n}`);i&&i.addEventListener(`change`,async()=>{let e=i.checked;i.disabled=!0,e&&await l();let{error:n}=await H(t,r,e);i.disabled=!1,n&&(i.checked=!e,u(`Kunne ikkje lagre varslingsinnstilling: ${b(n)}`,`error`))})}}async function G(e,t){let n=p.isNativePlatform();if(e.innerHTML=`
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
    </div>`,!n)return;let r=e.querySelector(`[data-slot="notifications"]`),{data:i}=await V(t.user.id);if(!i){r.innerHTML=`<p class="text-muted">Kunne ikkje laste varslingsinnstillingar.</p>`;return}r.innerHTML=U(i),W(e,t.user.id)}async function K(){let{data:n,error:r}=await e.rpc(`hent_kobla_kontoar`);return r&&t(`getLinkedAccounts`,r),{data:n??[],error:r}}async function q(n){let{error:r}=await e.rpc(`slett_brukarkonto`,{target_id:n});return r&&t(`deleteUserAccount`,r),{error:r}}var J=`Resultater og statistikk for koblet utøver blir ikkje slettet.`;async function Y(e){let{data:t,error:r}=await C(e);return r||!t?``:`
    <h5 class="card-title">Kontoen er koblet til utøvarprofil</h5>
    <p class="mb-1"><strong>${x(f(t))}</strong> · ${x(t.klubb?.navn??``)}</p>
    <a href="#/kastere/${n(t)}" class="btn btn-sm btn-outline-primary mt-1">Vis profil</a>`}function X(e){let t=e?`Bytt passord`:`Opprett passord`;return`
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
    </form>`}function Z(e,t){return`
    <p class="card-text text-muted">Alle kontoar som er kobla til utøvarprofilen din.</p>
    <table class="table table-sm align-middle linked-accounts-table">
      <thead><tr><th>E-post</th><th>Oppretta</th><th></th></tr></thead>
      <tbody>${e.map(e=>{let n=e.id===t?`<span class="badge bg-secondary">deg</span>`:`<button class="btn btn-sm btn-outline-primary" data-login-email="${x(e.epost)}">Logg inn</button>`;return`<tr>
      <td class="linked-accounts-table__email">${x(e.epost)}</td>
      <td class="linked-accounts-table__date">${x(r(e.opprettet_at))}</td>
      <td class="text-end linked-accounts-table__actions">${n}</td>
    </tr>`}).join(``)}</tbody>
    </table>`}function re(e){e.querySelector(`#password-form`).addEventListener(`submit`,async n=>{n.preventDefault();let r=n.target,i=e.querySelector(`#ko-password-error`);i.classList.add(`d-none`);let a=e.querySelector(`#ko-password`).value;if(a!==e.querySelector(`#ko-password2`).value){i.textContent=`Passorda er ikkje like.`,i.classList.remove(`d-none`);return}let o=r.querySelector(`[type=submit]`);o.disabled=!0;let{error:c}=await s(a);if(o.disabled=!1,c){t(`minsideKonto.updatePassword`,c),i.textContent=`Kunne ikkje endre passord: ${b(c)}`,i.classList.remove(`d-none`);return}u(`Passordet er endra.`,`success`),r.reset()})}function ie(e){e.querySelector(`[data-slot="accounts"]`).addEventListener(`click`,async e=>{let t=e.target.closest(`[data-login-email]`);t&&(await a(),location.hash=`#/logginn?email=${encodeURIComponent(t.dataset.loginEmail)}`)})}function ae(e,t){e.querySelector(`#delete-own-account`).addEventListener(`click`,async()=>{if(!await i({title:`Slette kontoen?`,message:`Innloggingskontoen ${t.user.email??``} vert sletta permanent. ${J}`,confirmText:`Slett konto`,danger:!0}))return;let{error:e}=await q(t.user.id);if(e){u(`Kunne ikkje slette kontoen: ${b(e)}`,`error`);return}try{await a()}catch{}location.hash=`#/logginn`})}async function oe(e,n){let r=n.status===`godkjent`?n.profil?.kasterid??null:null,i=r!=null,a=n.user.identities?.some(e=>e.provider===`email`)??!0;if(e.innerHTML=`
    ${i?`<div class="card mb-4"><div class="card-body" data-slot="thrower"><div class="skeleton-block skeleton-block--card"></div></div></div>`:``}
    <div class="card mb-4"><div class="card-body">${X(a)}</div></div>
    ${i?`
      <div class="card mb-4"><div class="card-body">
        <h5 class="card-title">Innloggingskontoar</h5>
        <div data-slot="accounts"><div class="skeleton-block skeleton-block--card"></div></div>
      </div></div>`:``}
    <div class="card mb-4"><div class="card-body">
      <h5 class="card-title">Slett kontoen min</h5>
      <p class="card-text text-muted">${J}</p>
      <button type="button" class="btn btn-danger" id="delete-own-account">Slett kontoen min</button>
    </div></div>`,re(e),ae(e,n),r==null)return;ie(e);let o=e.querySelector(`[data-slot="thrower"]`),s=e.querySelector(`[data-slot="accounts"]`);try{let[e,t]=await Promise.all([Y(r),K()]);o.innerHTML=e,s.innerHTML=t.error?`<p class="text-muted">Kunne ikkje laste kontoar.</p>`:Z(t.data,n.user.id)}catch(e){t(`minsideKonto.render`,e),s.innerHTML=`<p class="text-muted">Kunne ikkje laste kontoar.</p>`}}var Q=[{key:`kampar`,label:`Kampar`},{key:`pameldingar`,label:`Påmeldingar`},{key:`innstillingar`,label:`Innstillingar`},{key:`konto`,label:`Konto`}],se=new Set(Q.map(e=>e.key)),ce={kampar:z,pameldingar:ne,innstillingar:G,konto:oe};function le(e){return`<ul class="nav nav-underline mypage-nav mb-3">${Q.map(({key:t,label:n})=>`
      <li class="nav-item">
        <a class="nav-link${e===t?` active`:``}"
           href="#/minside/${t}">${n}</a>
      </li>`).join(``)}</ul>`}async function $(e,n){y(()=>$(e,n));let r=String(n.tab??`kampar`);e.replaceChildren(w(`Laster min side…`));try{let t=await c();if(!t){location.hash=`#/logginn`;return}let{profil:n,user:i}=t,a=n?.kobling_status??`ingen`,o=r===`varslingar`?`innstillingar`:r,s=se.has(o)?o:`kampar`;e.innerHTML=`
      <div class="mypage-container">
        <h2 class="mb-1">Min side</h2>
        <p class="text-muted mb-3">${x(i.email??``)}</p>
        ${le(s)}
        <div id="minside-subpage"></div>
      </div>`;let l=e.querySelector(`#minside-subpage`);await ce[s](l,{user:i,profil:n,status:a})}catch(n){t(`minside.render`,n),e.replaceChildren(d(`Kunne ikkje laste min side.`))}}export{$ as render};