import{n as e,t}from"./logError-BO7RC_Nh.js";import{A as n,F as r,It as i,Jt as a,O as o,P as s,Rt as c,U as l,V as u,W as d,c as f,h as p,k as m,n as h,o as g,s as _,t as v,tt as y}from"./index-f4GJwwSh.js";import{d as b,r as x}from"./kasterService-Dbuq1Ip6.js";import{t as S}from"./LoadingState-C6NB62Ct.js";import{n as ee,r as C}from"./kaster-CGWDYFbf.js";import{t as w}from"./EmptyState-CCNgsnix.js";import{t as T}from"./SearchInput-BwD50MFz.js";import{n as E,t as D}from"./accountService-B2SUOG7y.js";import{f as O,l as k}from"./kampService-ZDYne52X.js";import{t as A}from"./Tabs-DZCBJPb0.js";import{t as j,u as te}from"./navigationService-1PJBQtpV.js";function ne(e){return`
    ${e===`avvist`?`<div class="alert alert-warning">Koblingforespørselen din vart avvist. Du kan sende ein ny.</div>`:``}
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">Koble til utøvarprofil</h5>
        <p class="card-text text-muted">Søk etter deg sjølv i registeret og send ein forespørsel. Etter godkjenning kan du melde deg på stevner.</p>
        <span id="thrower-search-slot"></span>
        <div id="thrower-matches" class="list-group mb-2"></div>
        <div id="thrower-error" class="alert alert-danger d-none"></div>
      </div>
    </div>`}function M(){return`<div class="alert alert-info mb-4">Koblingforespørselen din ventar på godkjenning frå ein administrator.</div>`}function N(e,t){let n=null,i=null,a=e.querySelector(`#thrower-matches`),o=e.querySelector(`#thrower-error`);T({slot:e.querySelector(`#thrower-search-slot`),placeholder:`Søk på navn…`,variant:`form`,onInput:e=>{n!==null&&clearTimeout(n);let t=e.trim().toLowerCase();if(t.length<2){a.innerHTML=``;return}n=setTimeout(async()=>{if(!i){let{data:e}=await x();i=e}let e=i.filter(e=>e.fornavn.toLowerCase().includes(t)||e.etternavn.toLowerCase().includes(t)).slice(0,8);if(!e.length){let e=w(`Ingen treff.`);e.classList.add(`small`),a.replaceChildren(e);return}a.innerHTML=e.map(e=>`<button class="list-group-item list-group-item-action" data-id="${e.id}">
            ${_(C(e))} <span class="text-muted small">· ${_(e.klubb?.navn??``)}</span>
          </button>`).join(``)},300)}}),a.addEventListener(`click`,async e=>{let n=e.target.closest(`[data-id]`);if(!n)return;o.classList.add(`d-none`);let{error:i}=await y(t,Number(n.dataset.id));if(i){o.textContent=`Kunne ikkje sende forespørsel.`,o.classList.remove(`d-none`);return}r(),await h()})}function P(e,t){return t.status===`godkjent`&&t.profil?.kasterid!=null?t.profil.kasterid:t.status===`venter`?(e.innerHTML=M(),null):(e.innerHTML=ne(t.status),N(e,t.user.id),null)}function F(e,t,n){let r=P(e,t);return r==null?null:(e.innerHTML=`
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">${_(n)}</h5>
        <div data-slot="content"><div class="skeleton-block skeleton-block--card"></div></div>
      </div>
    </div>`,{throwerId:r,slot:e.querySelector(`[data-slot="content"]`)})}function I(e){let t=document.createElement(`div`);return t.innerHTML=e,t}var L=[{key:`innledende`,label:`Innleiande`},{key:`avsluttende`,label:`Avsluttande`}];function R(e){let t=L.findIndex(t=>t.key===e.kamp?.fase);return t===-1?L.length:t}function z(e,t,n,r){let i=n==null?void 0:r[`${n}:${t}`];return e.filter(e=>{if(e.kasterid==null||e.kasterid===t)return!1;let a=n==null?void 0:r[`${n}:${e.kasterid}`];return i==null||a==null||a!==i})}function B(e,t,n){return`<table class="table table-sm mb-3">
      <thead><tr><th>Bane</th><th>Medspelarar</th><th></th></tr></thead>
      <tbody>${e.map(e=>{let r=e.deltakarar.filter(e=>e.kasterid!==t).map(e=>_(C(e.kaster)));return`<tr>
      <td>B${e.bane_nummer??``}</td>
      <td>${r.length?r.join(` / `):`–`}</td>
      <td>${n(e)}</td>
    </tr>`}).join(``)}</tbody>
    </table>`}function V(e,t,n){if(!e.length)return null;let r=new Map;for(let t of e){let e=t.stevneid??`unknown`;r.has(e)||r.set(e,{name:`${t.stevne?.navn??``} – X-kast`,courts:[]}),r.get(e).courts.push(t)}return[...r.values()].map(({name:e,courts:r})=>`
      <p class="fw-semibold mb-1 mt-2">${_(e)}</p>
      ${B(r,t,n)}`).join(``)}async function H(e){let[{data:t,error:n},r]=await Promise.all([k(e),te(e)]);if(n){let e=document.createElement(`p`);return e.className=`text-muted`,e.textContent=`Kunne ikkje laste kampar.`,e}let i=t.filter(e=>!e.kamp?.er_walkover),a=await O([...new Set(i.map(e=>e.kamp?.stevneid).filter(e=>e!=null))]),o=i.filter(e=>e.kamp?.stevne?.erfullfort===!1).sort((e,t)=>(e.kamp?.runde_nummer??0)-(t.kamp?.runde_nummer??0)),s=i.filter(e=>e.kamp?.stevne?.erfullfort===!0).sort((e,t)=>(t.kamp?.stevne?.dato??``).localeCompare(e.kamp?.stevne?.dato??``)||R(e)-R(t)||(e.kamp?.runde_nummer??0)-(t.kamp?.runde_nummer??0)),c=(t,n)=>{let r=t.kamp,i=r?.stevneid,o=z(r?.spelarar??[],e,i,a),s=o.length?o.map(e=>_(C(e.kaster))).join(` / `):`–`;return`<tr>
      <td>R${r?.runde_nummer??``} / B${r?.bane_nummer??``}</td>
      <td>${s}</td>
      <td>${n}</td>
    </tr>`},l=(e,t)=>`
      <table class="table table-sm mb-3"><thead><tr><th>Runde/Bane</th><th>Motstandar</th><th></th></tr></thead><tbody>
        ${e.map(e=>c(e,t(e))).join(``)}
      </tbody></table>`,u=(e,t)=>{let n=L.map(({key:t,label:n})=>({label:n,matches:e.filter(e=>e.kamp?.fase===t)})).filter(e=>e.matches.length),r=n.reduce((e,t)=>e+t.matches.length,0)===e.length;return n.length<2||!r?l(e,t):n.map(({label:e,matches:n})=>`
      <p class="text-muted small mb-1">${e}</p>
      ${l(n,t)}`).join(``)},d=(e,t,n=!1)=>{if(!e.length)return null;let r=new Map;for(let t of e){let e=t.kamp?.stevneid??`unknown`,n=t.kamp?.stevne?.navn??``;r.has(e)||r.set(e,{name:n,matches:[]}),r.get(e).matches.push(t)}return[...r.values()].map(({name:e,matches:r})=>`
      <p class="fw-semibold mb-1 mt-2">${_(e)}</p>
      ${n?u(r,t):l(r,t)}`).join(``)},f=d(o,t=>{if(!t.kamp?.er_bekreftet)return`<a href="#/kamp/${t.kamp?.id??``}" class="btn btn-sm btn-primary"${j()}>Scoreboard</a>`;let n=t.kamp.stevneid,r=t.kamp.spelarar?.find(t=>t.kasterid===e)?.score_poeng,i=z(t.kamp.spelarar??[],e,n,a)[0]?.score_poeng;return r==null||i==null?`–`:`<span class="fw-semibold">${r} – ${i}</span>`}),p=d(s,e=>`<a href="#/kamp/${e.kamp?.id??``}" class="btn btn-sm btn-outline-secondary"${j()}>Vis</a>`,!0),m=r.data.filter(e=>e.fase===`innledende`),h=m.filter(e=>e.stevne?.erfullfort===!1).sort((e,t)=>(e.bane_nummer??0)-(t.bane_nummer??0)),g=m.filter(e=>e.stevne?.erfullfort===!0).sort((e,t)=>(t.stevne?.dato??``).localeCompare(e.stevne?.dato??``)||(e.bane_nummer??0)-(t.bane_nummer??0)),v=e=>`#/stevne/${e.stevneid}/innledende`,y=V(h,e,t=>{if(!t.er_bekreftet)return`<a href="${v(t)}" class="btn btn-sm btn-primary">Opne bane</a>`;let n=t.deltakarar.find(t=>t.kasterid===e)?.poeng;return n==null?`–`:`<span class="fw-semibold">${n}</span>`}),b=V(g,e,e=>`<a href="${v(e)}" class="btn btn-sm btn-outline-secondary">Vis</a>`),x=[f,y].filter(Boolean).join(``),S=[p,b].filter(Boolean).join(``);return A({tabs:[{id:`active`,label:`Aktive (${o.length+h.length})`,panel:I(x||`<p class="text-muted">Ingen aktive kampar.</p>`)},{id:`completed`,label:`Ferdige (${s.length+g.length})`,panel:I(S||`<p class="text-muted">Ingen ferdige kampar enno.</p>`)}]})}async function U(e,t){let n=F(e,t,`Mine kampar og banar`);if(!n)return;let r=await H(n.throwerId);n.slot.replaceChildren(r)}async function W(e){let{data:t,error:n}=await p(e),r=new Map;if(n){let e=document.createElement(`p`);return e.className=`text-muted`,e.textContent=`Kunne ikkje laste påmeldingar.`,{node:e,registeredMap:r}}let i=t.filter(e=>e.stevne?.erfullfort!==!0);if(!i.length)return{node:w(`Ingen påmeldingar enno.`),registeredMap:r};let a=[...i].sort((e,t)=>(e.stevne?.dato??``).localeCompare(t.stevne?.dato??``)),o=document.createElement(`div`);o.className=`stevne-kort-liste`;for(let e of a){let t=e.stevne?.id;t!=null&&r.set(t,e.id),o.appendChild(g({title:e.stevne?.navn??``,href:t==null?`#`:`#/stevne/${t}/info`,date:c(e.stevne?.dato),status:`upcoming`,registrationSlotId:t??void 0}))}return{node:o,registeredMap:r}}async function G(e,t){let n=F(e,t,`Påmeldingar`);if(!n)return;let{node:r,registeredMap:i}=await W(n.throwerId);n.slot.replaceChildren(r),f(e,n.throwerId,t.user.id,i)}async function K(n){let{data:r,error:i}=await e.from(`bruker_profil`).select(`varsle_stevne_start, varsle_kamp_opprettet`).eq(`id`,n).maybeSingle();return i&&t(`getNotificationPreferences`,i),{data:r,error:i}}async function q(n,r,i){let a=r===`varsle_stevne_start`?{varsle_stevne_start:i}:{varsle_kamp_opprettet:i},{error:o}=await e.from(`bruker_profil`).update(a).eq(`id`,n);return o&&t(`updateNotificationPreference`,o),{error:o}}function J(e){return`
    <div class="form-check form-switch mb-2">
      <input class="form-check-input" type="checkbox" role="switch" id="varsle-stevne-start"${e.varsle_stevne_start?` checked`:``}>
      <label class="form-check-label" for="varsle-stevne-start">Varsle når eit stevne startar</label>
    </div>
    <div class="form-check form-switch">
      <input class="form-check-input" type="checkbox" role="switch" id="varsle-kamp-opprettet"${e.varsle_kamp_opprettet?` checked`:``}>
      <label class="form-check-label" for="varsle-kamp-opprettet">Varsle når kampar for meg blir oppretta</label>
    </div>`}function Y(e,t){for(let[n,r]of[[`varsle-stevne-start`,`varsle_stevne_start`],[`varsle-kamp-opprettet`,`varsle_kamp_opprettet`]]){let i=e.querySelector(`#${n}`);i&&i.addEventListener(`change`,async()=>{let e=i.checked;i.disabled=!0,e&&await d();let{error:n}=await q(t,r,e);i.disabled=!1,n&&(i.checked=!e,m(`Kunne ikkje lagre varslingsinnstilling: ${o(n)}`,`error`))})}}async function X(e,t){let n=a.isNativePlatform();if(e.innerHTML=`
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
    </div>`,!n)return;let r=e.querySelector(`[data-slot="notifications"]`),{data:i}=await K(t.user.id);if(!i){r.innerHTML=`<p class="text-muted">Kunne ikkje laste varslingsinnstillingar.</p>`;return}r.innerHTML=J(i),Y(e,t.user.id)}var Z=`Resultater og statistikk for koblet utøver blir ikkje slettet.`;async function re(e){let{data:t,error:n}=await b(e);return n||!t?``:`
    <h5 class="card-title">Kontoen er koblet til utøvarprofil</h5>
    <p class="mb-1"><strong>${_(C(t))}</strong> · ${_(t.klubb?.navn??``)}</p>
    <a href="#/kastere/${ee(t)}" class="btn btn-sm btn-outline-primary mt-1">Vis profil</a>`}function ie(e){let t=e?`Bytt passord`:`Opprett passord`;return`
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
    </form>`}function ae(e,t){return`
    <p class="card-text text-muted">Alle kontoar som er kobla til utøvarprofilen din.</p>
    <table class="table table-sm align-middle linked-accounts-table">
      <thead><tr><th>E-post</th><th>Oppretta</th><th></th></tr></thead>
      <tbody>${e.map(e=>{let n=e.id===t?`<span class="badge bg-secondary">deg</span>`:`<button class="btn btn-sm btn-outline-primary" data-login-email="${_(e.epost)}">Logg inn</button>`;return`<tr>
      <td class="linked-accounts-table__email">${_(e.epost)}</td>
      <td class="linked-accounts-table__date">${_(c(e.opprettet_at))}</td>
      <td class="text-end linked-accounts-table__actions">${n}</td>
    </tr>`}).join(``)}</tbody>
    </table>`}function oe(e){e.querySelector(`#password-form`).addEventListener(`submit`,async n=>{n.preventDefault();let r=n.target,i=e.querySelector(`#ko-password-error`);i.classList.add(`d-none`);let a=e.querySelector(`#ko-password`).value;if(a!==e.querySelector(`#ko-password2`).value){i.textContent=`Passorda er ikkje like.`,i.classList.remove(`d-none`);return}let s=r.querySelector(`[type=submit]`);s.disabled=!0;let{error:c}=await l(a);if(s.disabled=!1,c){t(`minsideKonto.updatePassword`,c),i.textContent=`Kunne ikkje endre passord: ${o(c)}`,i.classList.remove(`d-none`);return}m(`Passordet er endra.`,`success`),r.reset()})}function se(e){e.querySelector(`[data-slot="accounts"]`).addEventListener(`click`,async e=>{let t=e.target.closest(`[data-login-email]`);t&&(await u(),location.hash=`#/logginn?email=${encodeURIComponent(t.dataset.loginEmail)}`)})}function ce(e,t){e.querySelector(`#delete-own-account`).addEventListener(`click`,async()=>{if(!await n({title:`Slette kontoen?`,message:`Innloggingskontoen ${t.user.email??``} vert sletta permanent. ${Z}`,confirmText:`Slett konto`,danger:!0}))return;let{error:e}=await D(t.user.id);if(e){m(`Kunne ikkje slette kontoen: ${o(e)}`,`error`);return}try{await u()}catch{}location.hash=`#/logginn`})}async function le(e,n){let r=n.status===`godkjent`?n.profil?.kasterid??null:null,i=r!=null,a=n.user.identities?.some(e=>e.provider===`email`)??!0;if(e.innerHTML=`
    ${i?`<div class="card mb-4"><div class="card-body" data-slot="thrower"><div class="skeleton-block skeleton-block--card"></div></div></div>`:``}
    <div class="card mb-4"><div class="card-body">${ie(a)}</div></div>
    ${i?`
      <div class="card mb-4"><div class="card-body">
        <h5 class="card-title">Innloggingskontoar</h5>
        <div data-slot="accounts"><div class="skeleton-block skeleton-block--card"></div></div>
      </div></div>`:``}
    <div class="card mb-4"><div class="card-body">
      <h5 class="card-title">Slett kontoen min</h5>
      <p class="card-text text-muted">${Z}</p>
      <button type="button" class="btn btn-danger" id="delete-own-account">Slett kontoen min</button>
    </div></div>`,oe(e),ce(e,n),r==null)return;se(e);let o=e.querySelector(`[data-slot="thrower"]`),s=e.querySelector(`[data-slot="accounts"]`);try{let[e,t]=await Promise.all([re(r),E()]);o.innerHTML=e,s.innerHTML=t.error?`<p class="text-muted">Kunne ikkje laste kontoar.</p>`:ae(t.data,n.user.id)}catch(e){t(`minsideKonto.render`,e),s.innerHTML=`<p class="text-muted">Kunne ikkje laste kontoar.</p>`}}var Q=[{key:`kampar`,label:`Kampar`},{key:`pameldingar`,label:`Påmeldingar`},{key:`innstillingar`,label:`Innstillingar`},{key:`konto`,label:`Konto`}],ue=new Set(Q.map(e=>e.key)),de={kampar:U,pameldingar:G,innstillingar:X,konto:le};function fe(e){return`<ul class="nav nav-underline mypage-nav mb-3">${Q.map(({key:t,label:n})=>`
      <li class="nav-item">
        <a class="nav-link${e===t?` active`:``}"
           href="#/minside/${t}">${n}</a>
      </li>`).join(``)}</ul>`}async function $(e,n){v(()=>$(e,n));let r=String(n.tab??`kampar`);e.replaceChildren(S(`Laster min side…`));try{let t=await s();if(!t){location.hash=`#/logginn`;return}let{profil:n,user:i}=t,a=n?.kobling_status??`ingen`,o=r===`varslingar`?`innstillingar`:r,c=ue.has(o)?o:`kampar`;e.innerHTML=`
      <div class="mypage-container">
        <h2 class="mb-1">Min side</h2>
        <p class="text-muted mb-3">${_(i.email??``)}</p>
        ${fe(c)}
        <div id="minside-subpage"></div>
      </div>`;let l=e.querySelector(`#minside-subpage`);await de[c](l,{user:i,profil:n,status:a})}catch(n){t(`minside.render`,n),e.replaceChildren(i(`Kunne ikkje laste min side.`))}}export{$ as render};