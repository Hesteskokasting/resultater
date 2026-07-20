import{n as e,t}from"./logError-D5z16FyH.js";import{C as n,Ct as r,D as i,E as a,F as o,Ht as s,I as c,K as l,N as u,Rt as d,S as f,St as p,Tt as m,d as h,i as g,n as _,t as v,w as y,zt as b}from"./index-BckkKJXl.js";import{r as x,u as S}from"./kasterService-B3gLOC11.js";import{t as C}from"./LoadingState-BWi0wPLz.js";import{t as ee}from"./EmptyState-B1E_7OzB.js";import{d as te,m as w}from"./kampService-CnBu9jM9.js";import{t as T}from"./SearchInput-BLUeXGg6.js";import{t as E}from"./Tabs-BIv0oqoM.js";import{t as D}from"./navigationService-CzwnKJ_F.js";function O(e){return`
    ${e===`avvist`?`<div class="alert alert-warning">Koblingforespørselen din vart avvist. Du kan sende ein ny.</div>`:``}
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">Koble til utøvarprofil</h5>
        <p class="card-text text-muted">Søk etter deg sjølv i registeret og send ein forespørsel. Etter godkjenning kan du melde deg på stevner.</p>
        <span id="thrower-search-slot"></span>
        <div id="thrower-matches" class="list-group mb-2"></div>
        <div id="thrower-error" class="alert alert-danger d-none"></div>
      </div>
    </div>`}function k(){return`<div class="alert alert-info mb-4">Koblingforespørselen din ventar på godkjenning frå ein administrator.</div>`}function A(e,t){let n=null,r=null,a=e.querySelector(`#thrower-matches`),o=e.querySelector(`#thrower-error`);T({slot:e.querySelector(`#thrower-search-slot`),placeholder:`Søk på navn…`,variant:`form`,onInput:e=>{n!==null&&clearTimeout(n);let t=e.trim().toLowerCase();if(t.length<2){a.innerHTML=``;return}n=setTimeout(async()=>{if(!r){let{data:e}=await x();r=e}let e=r.filter(e=>e.fornavn.toLowerCase().includes(t)||e.etternavn.toLowerCase().includes(t)).slice(0,8);if(!e.length){let e=ee(`Ingen treff.`);e.classList.add(`small`),a.replaceChildren(e);return}a.innerHTML=e.map(e=>`<button class="list-group-item list-group-item-action" data-id="${e.id}">
            ${p(b(e))} <span class="text-muted small">· ${p(e.klubb?.navn??``)}</span>
          </button>`).join(``)},300)}}),a.addEventListener(`click`,async e=>{let n=e.target.closest(`[data-id]`);if(!n)return;o.classList.add(`d-none`);let{error:r}=await l(t,Number(n.dataset.id));if(r){o.textContent=`Kunne ikkje sende forespørsel.`,o.classList.remove(`d-none`);return}i(),await _()})}function j(e,t){return t.status===`godkjent`&&t.profil?.kasterid!=null?t.profil.kasterid:t.status===`venter`?(e.innerHTML=k(),null):(e.innerHTML=O(t.status),A(e,t.user.id),null)}function M(e,t,n){let r=j(e,t);return r==null?null:(e.innerHTML=`
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">${p(n)}</h5>
        <div data-slot="content"><div class="skeleton-block skeleton-block--card"></div></div>
      </div>
    </div>`,{throwerId:r,slot:e.querySelector(`[data-slot="content"]`)})}function N(e){let t=document.createElement(`div`);return t.innerHTML=e,t}var P=[{key:`innledende`,label:`Innleiande`},{key:`avsluttende`,label:`Avsluttande`}];function F(e){let t=P.findIndex(t=>t.key===e.kamp?.fase);return t===-1?P.length:t}function I(e,t,n,r){let i=n==null?void 0:r[`${n}:${t}`];return e.filter(e=>{if(e.kasterid==null||e.kasterid===t)return!1;let a=n==null?void 0:r[`${n}:${e.kasterid}`];return i==null||a==null||a!==i})}async function L(e){let{data:t,error:n}=await te(e);if(n){let e=document.createElement(`p`);return e.className=`text-muted`,e.textContent=`Kunne ikkje laste kampar.`,e}let r=t.filter(e=>!e.kamp?.er_walkover),i=await w([...new Set(r.map(e=>e.kamp?.stevneid).filter(e=>e!=null))]),a=r.filter(e=>e.kamp?.stevne?.erfullfort===!1).sort((e,t)=>(e.kamp?.runde_nummer??0)-(t.kamp?.runde_nummer??0)),o=r.filter(e=>e.kamp?.stevne?.erfullfort===!0).sort((e,t)=>(t.kamp?.stevne?.dato??``).localeCompare(e.kamp?.stevne?.dato??``)||F(e)-F(t)||(e.kamp?.runde_nummer??0)-(t.kamp?.runde_nummer??0)),s=(t,n)=>{let r=t.kamp,a=r?.stevneid,o=I(r?.spelarar??[],e,a,i),s=o.length?o.map(e=>p(b(e.kaster))).join(` / `):`–`;return`<tr>
      <td>R${r?.runde_nummer??``} / B${r?.bane_nummer??``}</td>
      <td>${s}</td>
      <td>${n}</td>
    </tr>`},c=(e,t)=>`
      <table class="table table-sm mb-3"><thead><tr><th>Runde/Bane</th><th>Motstandar</th><th></th></tr></thead><tbody>
        ${e.map(e=>s(e,t(e))).join(``)}
      </tbody></table>`,l=(e,t)=>{let n=P.map(({key:t,label:n})=>({label:n,matches:e.filter(e=>e.kamp?.fase===t)})).filter(e=>e.matches.length),r=n.reduce((e,t)=>e+t.matches.length,0)===e.length;return n.length<2||!r?c(e,t):n.map(({label:e,matches:n})=>`
      <p class="text-muted small mb-1">${e}</p>
      ${c(n,t)}`).join(``)},u=(e,t,n=!1)=>{if(!e.length)return null;let r=new Map;for(let t of e){let e=t.kamp?.stevneid??`unknown`,n=t.kamp?.stevne?.navn??``;r.has(e)||r.set(e,{name:n,matches:[]}),r.get(e).matches.push(t)}return[...r.values()].map(({name:e,matches:r})=>`
      <p class="fw-semibold mb-1 mt-2">${p(e)}</p>
      ${n?l(r,t):c(r,t)}`).join(``)},d=u(a,t=>{if(!t.kamp?.er_bekreftet)return`<a href="#/kamp/${t.kamp?.id??``}" class="btn btn-sm btn-primary"${D()}>Scoreboard</a>`;let n=t.kamp.stevneid,r=t.kamp.spelarar?.find(t=>t.kasterid===e)?.score_poeng,a=I(t.kamp.spelarar??[],e,n,i)[0]?.score_poeng;return r==null||a==null?`–`:`<span class="fw-semibold">${r} – ${a}</span>`}),f=u(o,e=>`<a href="#/kamp/${e.kamp?.id??``}" class="btn btn-sm btn-outline-secondary"${D()}>Vis</a>`,!0);return E({tabs:[{id:`active`,label:`Aktive (${a.length})`,panel:N(d??`<p class="text-muted">Ingen aktive kampar.</p>`)},{id:`completed`,label:`Ferdige (${o.length})`,panel:N(f??`<p class="text-muted">Ingen ferdige kampar enno.</p>`)}]})}async function R(e,t){let n=M(e,t,`Mine kampar`);if(!n)return;let r=await L(n.throwerId);n.slot.replaceChildren(r)}async function z(e){let{data:t,error:n}=await h(e),r=new Map;if(n)return{html:`<p class="text-muted">Kunne ikkje laste påmeldingar.</p>`,registeredMap:r};let i=t.filter(e=>e.stevne?.erfullfort!==!0);return i.length?{html:`
      <table class="table table-sm">
        <thead><tr><th>Stevne</th><th>Dato</th><th></th></tr></thead>
        <tbody>${[...i].sort((e,t)=>(e.stevne?.dato??``).localeCompare(t.stevne?.dato??``)).map(e=>{let t=m(e.stevne?.dato),n=e.stevne?.id;return n!=null&&r.set(n,e.id),`<tr>
      <td><a href="#/stevne/${n??``}/pamelding">${p(e.stevne?.navn??``)}</a></td>
      <td>${p(t)}</td>
      <td>${n==null?``:`<span data-registration-slot="${n}"></span>`}</td>
    </tr>`}).join(``)}</tbody>
      </table>`,registeredMap:r}:{html:`<p class="empty-state">Ingen påmeldingar enno.</p>`,registeredMap:r}}async function ne(e,t){let n=M(e,t,`Påmeldingar`);if(!n)return;let{html:r,registeredMap:i}=await z(n.throwerId);n.slot.innerHTML=r,g(e,n.throwerId,t.user.id,i)}async function B(n){let{data:r,error:i}=await e.from(`bruker_profil`).select(`varsle_stevne_start, varsle_kamp_opprettet`).eq(`id`,n).maybeSingle();return i&&t(`getNotificationPreferences`,i),{data:r,error:i}}async function V(n,r,i){let a=r===`varsle_stevne_start`?{varsle_stevne_start:i}:{varsle_kamp_opprettet:i},{error:o}=await e.from(`bruker_profil`).update(a).eq(`id`,n);return o&&t(`updateNotificationPreference`,o),{error:o}}function H(e){return`
    <div class="form-check form-switch mb-2">
      <input class="form-check-input" type="checkbox" role="switch" id="varsle-stevne-start"${e.varsle_stevne_start?` checked`:``}>
      <label class="form-check-label" for="varsle-stevne-start">Varsle når eit stevne startar</label>
    </div>
    <div class="form-check form-switch">
      <input class="form-check-input" type="checkbox" role="switch" id="varsle-kamp-opprettet"${e.varsle_kamp_opprettet?` checked`:``}>
      <label class="form-check-label" for="varsle-kamp-opprettet">Varsle når kampar for meg blir oppretta</label>
    </div>`}function U(e,t){for(let[r,i]of[[`varsle-stevne-start`,`varsle_stevne_start`],[`varsle-kamp-opprettet`,`varsle_kamp_opprettet`]]){let a=e.querySelector(`#${r}`);a&&a.addEventListener(`change`,async()=>{let e=a.checked;a.disabled=!0,e&&await c();let{error:r}=await V(t,i,e);a.disabled=!1,r&&(a.checked=!e,n(`Kunne ikkje lagre varslingsinnstilling: ${f(r)}`,`error`))})}}async function W(e,t){let n=s.isNativePlatform();if(e.innerHTML=`
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
    </div>`,!n)return;let r=e.querySelector(`[data-slot="notifications"]`),{data:i}=await B(t.user.id);if(!i){r.innerHTML=`<p class="text-muted">Kunne ikkje laste varslingsinnstillingar.</p>`;return}r.innerHTML=H(i),U(e,t.user.id)}async function G(){let{data:n,error:r}=await e.rpc(`hent_kobla_kontoar`);return r&&t(`getLinkedAccounts`,r),{data:n??[],error:r}}async function K(n){let{error:r}=await e.rpc(`slett_brukarkonto`,{target_id:n});return r&&t(`deleteUserAccount`,r),{error:r}}var q=`Resultater og statistikk for koblet utøver blir ikkje slettet.`;async function J(e){let{data:t,error:n}=await S(e);return n||!t?``:`
    <h5 class="card-title">Kontoen er koblet til utøvarprofil</h5>
    <p class="mb-1"><strong>${p(b(t))}</strong> · ${p(t.klubb?.navn??``)}</p>
    <a href="#/kastere/${d(t)}" class="btn btn-sm btn-outline-primary mt-1">Vis profil</a>`}function Y(e){let t=e?`Bytt passord`:`Opprett passord`;return`
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
    </form>`}function X(e,t){return`
    <p class="card-text text-muted">Alle kontoar som er kobla til utøvarprofilen din.</p>
    <table class="table table-sm align-middle linked-accounts-table">
      <thead><tr><th>E-post</th><th>Oppretta</th><th></th></tr></thead>
      <tbody>${e.map(e=>{let n=e.id===t?`<span class="badge bg-secondary">deg</span>`:`<button class="btn btn-sm btn-outline-primary" data-login-email="${p(e.epost)}">Logg inn</button>`;return`<tr>
      <td class="linked-accounts-table__email">${p(e.epost)}</td>
      <td class="linked-accounts-table__date">${p(m(e.opprettet_at))}</td>
      <td class="text-end linked-accounts-table__actions">${n}</td>
    </tr>`}).join(``)}</tbody>
    </table>`}function Z(e){e.querySelector(`#password-form`).addEventListener(`submit`,async r=>{r.preventDefault();let i=r.target,a=e.querySelector(`#ko-password-error`);a.classList.add(`d-none`);let s=e.querySelector(`#ko-password`).value;if(s!==e.querySelector(`#ko-password2`).value){a.textContent=`Passorda er ikkje like.`,a.classList.remove(`d-none`);return}let c=i.querySelector(`[type=submit]`);c.disabled=!0;let{error:l}=await o(s);if(c.disabled=!1,l){t(`minsideKonto.updatePassword`,l),a.textContent=`Kunne ikkje endre passord: ${f(l)}`,a.classList.remove(`d-none`);return}n(`Passordet er endra.`,`success`),i.reset()})}function re(e){e.querySelector(`[data-slot="accounts"]`).addEventListener(`click`,async e=>{let t=e.target.closest(`[data-login-email]`);t&&(await u(),location.hash=`#/logginn?email=${encodeURIComponent(t.dataset.loginEmail)}`)})}function ie(e,t){e.querySelector(`#delete-own-account`).addEventListener(`click`,async()=>{if(!await y({title:`Slette kontoen?`,message:`Innloggingskontoen ${t.user.email??``} vert sletta permanent. ${q}`,confirmText:`Slett konto`,danger:!0}))return;let{error:e}=await K(t.user.id);if(e){n(`Kunne ikkje slette kontoen: ${f(e)}`,`error`);return}try{await u()}catch{}location.hash=`#/logginn`})}async function ae(e,n){let r=n.status===`godkjent`?n.profil?.kasterid??null:null,i=r!=null,a=n.user.identities?.some(e=>e.provider===`email`)??!0;if(e.innerHTML=`
    ${i?`<div class="card mb-4"><div class="card-body" data-slot="thrower"><div class="skeleton-block skeleton-block--card"></div></div></div>`:``}
    <div class="card mb-4"><div class="card-body">${Y(a)}</div></div>
    ${i?`
      <div class="card mb-4"><div class="card-body">
        <h5 class="card-title">Innloggingskontoar</h5>
        <div data-slot="accounts"><div class="skeleton-block skeleton-block--card"></div></div>
      </div></div>`:``}
    <div class="card mb-4"><div class="card-body">
      <h5 class="card-title">Slett kontoen min</h5>
      <p class="card-text text-muted">${q}</p>
      <button type="button" class="btn btn-danger" id="delete-own-account">Slett kontoen min</button>
    </div></div>`,Z(e),ie(e,n),r==null)return;re(e);let o=e.querySelector(`[data-slot="thrower"]`),s=e.querySelector(`[data-slot="accounts"]`);try{let[e,t]=await Promise.all([J(r),G()]);o.innerHTML=e,s.innerHTML=t.error?`<p class="text-muted">Kunne ikkje laste kontoar.</p>`:X(t.data,n.user.id)}catch(e){t(`minsideKonto.render`,e),s.innerHTML=`<p class="text-muted">Kunne ikkje laste kontoar.</p>`}}var Q=[{key:`kampar`,label:`Kampar`},{key:`pameldingar`,label:`Påmeldingar`},{key:`innstillingar`,label:`Innstillingar`},{key:`konto`,label:`Konto`}],oe=new Set(Q.map(e=>e.key)),se={kampar:R,pameldingar:ne,innstillingar:W,konto:ae};function ce(e){return`<ul class="nav nav-underline mypage-nav mb-3">${Q.map(({key:t,label:n})=>`
      <li class="nav-item">
        <a class="nav-link${e===t?` active`:``}"
           href="#/minside/${t}">${n}</a>
      </li>`).join(``)}</ul>`}async function $(e,n){v(()=>$(e,n));let i=String(n.tab??`kampar`);e.replaceChildren(C(`Laster min side…`));try{let t=await a();if(!t){location.hash=`#/logginn`;return}let{profil:n,user:r}=t,o=n?.kobling_status??`ingen`,s=i===`varslingar`?`innstillingar`:i,c=oe.has(s)?s:`kampar`;e.innerHTML=`
      <div class="mypage-container">
        <h2 class="mb-1">Min side</h2>
        <p class="text-muted mb-3">${p(r.email??``)}</p>
        ${ce(c)}
        <div id="minside-subpage"></div>
      </div>`;let l=e.querySelector(`#minside-subpage`);await se[c](l,{user:r,profil:n,status:o})}catch(n){t(`minside.render`,n),e.replaceChildren(r(`Kunne ikkje laste min side.`))}}export{$ as render};