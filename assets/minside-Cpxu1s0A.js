import{n as e,t}from"./logError-CB4-2Lin.js";import{A as n,F as r,G as i,H as a,I as o,Lt as s,W as c,Yt as l,c as u,g as d,j as f,k as p,l as m,nt as h,r as g,s as _,t as v,zt as y}from"./index-HV6oZghK.js";import{t as b}from"./LoadingState-C6NB62Ct.js";import{d as x,r as S}from"./kasterService-CGoztUaG.js";import{n as C,r as w}from"./kaster-CGWDYFbf.js";import{t as T}from"./EmptyState-CCNgsnix.js";import{t as E}from"./SearchInput-BwD50MFz.js";import{n as D,t as O}from"./accountService-BWtrr2u0.js";import{f as k,l as A}from"./kampService-BOB7VeHW.js";import{t as j}from"./Tabs-DZCBJPb0.js";import{t as M,u as ee}from"./navigationService-s6JE-CcQ.js";import{n as te}from"./ScoreboardButton-cO_q_Bk1.js";function ne(e){return`
    ${e===`avvist`?`<div class="alert alert-warning">Koblingforespørselen din vart avvist. Du kan sende ein ny.</div>`:``}
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">Koble til utøvarprofil</h5>
        <p class="card-text text-muted">Søk etter deg sjølv i registeret og send ein forespørsel. Etter godkjenning kan du melde deg på stevner.</p>
        <span id="thrower-search-slot"></span>
        <div id="thrower-matches" class="list-group mb-2"></div>
        <div id="thrower-error" class="alert alert-danger d-none"></div>
      </div>
    </div>`}function re(){return`<div class="alert alert-info mb-4">Koblingforespørselen din ventar på godkjenning frå ein administrator.</div>`}function N(e,t){let n=null,r=null,i=e.querySelector(`#thrower-matches`),a=e.querySelector(`#thrower-error`);E({slot:e.querySelector(`#thrower-search-slot`),placeholder:`Søk på navn…`,variant:`form`,onInput:e=>{n!==null&&clearTimeout(n);let t=e.trim().toLowerCase();if(t.length<2){i.innerHTML=``;return}n=setTimeout(async()=>{if(!r){let{data:e}=await S();r=e}let e=r.filter(e=>e.fornavn.toLowerCase().includes(t)||e.etternavn.toLowerCase().includes(t)).slice(0,8);if(!e.length){let e=T(`Ingen treff.`);e.classList.add(`small`),i.replaceChildren(e);return}i.innerHTML=e.map(e=>`<button class="list-group-item list-group-item-action" data-id="${e.id}">
            ${u(w(e))} <span class="text-muted small">· ${u(e.klubb?.navn??``)}</span>
          </button>`).join(``)},300)}}),i.addEventListener(`click`,async e=>{let n=e.target.closest(`[data-id]`);if(!n)return;a.classList.add(`d-none`);let{error:r}=await h(t,Number(n.dataset.id));if(r){a.textContent=`Kunne ikkje sende forespørsel.`,a.classList.remove(`d-none`);return}o(),await g()})}function P(e,t){return t.status===`godkjent`&&t.profil?.kasterid!=null?t.profil.kasterid:t.status===`venter`?(e.innerHTML=re(),null):(e.innerHTML=ne(t.status),N(e,t.user.id),null)}function F(e,t,n){let r=P(e,t);return r==null?null:(e.innerHTML=`
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">${u(n)}</h5>
        <div data-slot="content"><div class="skeleton-block skeleton-block--card"></div></div>
      </div>
    </div>`,{throwerId:r,slot:e.querySelector(`[data-slot="content"]`)})}function I(e){let t=document.createElement(`div`);return t.innerHTML=e,t}var L=[{key:`innledende`,label:`Innleiande`},{key:`avsluttende`,label:`Avsluttande`}];function R(e){let t=L.findIndex(t=>t.key===e.kamp?.fase);return t===-1?L.length:t}function z(e,t,n,r){let i=n==null?void 0:r[`${n}:${t}`];return e.filter(e=>{if(e.kasterid==null||e.kasterid===t)return!1;let a=n==null?void 0:r[`${n}:${e.kasterid}`];return i==null||a==null||a!==i})}function B(e,t,n){return`<table class="table table-sm mb-3">
      <thead><tr><th>Bane</th><th>Medspelarar</th><th></th></tr></thead>
      <tbody>${e.map(e=>{let r=e.deltakarar.filter(e=>e.kasterid!==t).map(e=>u(w(e.kaster)));return`<tr>
      <td>B${e.bane_nummer??``}</td>
      <td>${r.length?r.join(` / `):`–`}</td>
      <td>${n(e)}</td>
    </tr>`}).join(``)}</tbody>
    </table>`}function V(e,t,n){if(!e.length)return null;let r=new Map;for(let t of e){let e=t.stevneid??`unknown`;r.has(e)||r.set(e,{name:`${t.stevne?.navn??``} – X-kast`,courts:[]}),r.get(e).courts.push(t)}return[...r.values()].map(({name:e,courts:r})=>`
      <p class="fw-semibold mb-1 mt-2">${u(e)}</p>
      ${B(r,t,n)}`).join(``)}async function H(e){let[{data:t,error:n},r]=await Promise.all([A(e),ee(e)]);if(n){let e=document.createElement(`p`);return e.className=`text-muted`,e.textContent=`Kunne ikkje laste kampar.`,e}let i=t.filter(e=>!e.kamp?.er_walkover),a=[...new Set(i.map(e=>e.kamp?.stevneid).filter(e=>e!=null))],o=await k(a),s=i.filter(e=>e.kamp?.stevne?.erfullfort===!1).sort((e,t)=>(e.kamp?.runde_nummer??0)-(t.kamp?.runde_nummer??0)),c=i.filter(e=>e.kamp?.stevne?.erfullfort===!0).sort((e,t)=>(t.kamp?.stevne?.dato??``).localeCompare(e.kamp?.stevne?.dato??``)||R(e)-R(t)||(e.kamp?.runde_nummer??0)-(t.kamp?.runde_nummer??0)),l=(t,n)=>{let r=t.kamp,i=r?.stevneid,a=z(r?.spelarar??[],e,i,o),s=a.length?a.map(e=>u(w(e.kaster))).join(` / `):`–`;return`<tr>
      <td>R${r?.runde_nummer??``} / B${r?.bane_nummer??``}</td>
      <td>${s}</td>
      <td>${n}</td>
    </tr>`},d=(e,t)=>`
      <table class="table table-sm mb-3"><thead><tr><th>Runde/Bane</th><th>Motstandar</th><th></th></tr></thead><tbody>
        ${e.map(e=>l(e,t(e))).join(``)}
      </tbody></table>`,f=(e,t)=>{let n=L.map(({key:t,label:n})=>({label:n,matches:e.filter(e=>e.kamp?.fase===t)})).filter(e=>e.matches.length),r=n.reduce((e,t)=>e+t.matches.length,0)===e.length;return n.length<2||!r?d(e,t):n.map(({label:e,matches:n})=>`
      <p class="text-muted small mb-1">${e}</p>
      ${d(n,t)}`).join(``)},p=(e,t,n=!1)=>{if(!e.length)return null;let r=new Map;for(let t of e){let e=t.kamp?.stevneid??`unknown`,n=t.kamp?.stevne?.navn??``;r.has(e)||r.set(e,{name:n,matches:[]}),r.get(e).matches.push(t)}return[...r.values()].map(({name:e,matches:r})=>`
      <p class="fw-semibold mb-1 mt-2">${u(e)}</p>
      ${n?f(r,t):d(r,t)}`).join(``)},m=p(s,t=>{if(!t.kamp?.er_bekreftet)return te(t.kamp?.id??``,M(),`scoreboard-btn--touch`);let n=t.kamp.stevneid,r=t.kamp.spelarar?.find(t=>t.kasterid===e)?.score_poeng,i=z(t.kamp.spelarar??[],e,n,o)[0]?.score_poeng;return r==null||i==null?`–`:`<span class="fw-semibold">${r} – ${i}</span>`}),h=p(c,e=>`<a href="#/kamp/${e.kamp?.id??``}" class="btn btn-sm btn-outline-secondary"${M()}>Vis</a>`,!0),g=r.data.filter(e=>e.fase===`innledende`),_=g.filter(e=>e.stevne?.erfullfort===!1).sort((e,t)=>(e.bane_nummer??0)-(t.bane_nummer??0)),v=g.filter(e=>e.stevne?.erfullfort===!0).sort((e,t)=>(t.stevne?.dato??``).localeCompare(e.stevne?.dato??``)||(e.bane_nummer??0)-(t.bane_nummer??0)),y=e=>`#/stevne/${e.stevneid}/innledende`,b=V(_,e,t=>{if(!t.er_bekreftet)return`<a href="${y(t)}" class="btn btn-sm btn-primary">Opne bane</a>`;let n=t.deltakarar.find(t=>t.kasterid===e)?.poeng;return n==null?`–`:`<span class="fw-semibold">${n}</span>`}),x=V(v,e,e=>`<a href="${y(e)}" class="btn btn-sm btn-outline-secondary">Vis</a>`),S=[m,b].filter(Boolean).join(``),C=[h,x].filter(Boolean).join(``);return j({tabs:[{id:`active`,label:`Aktive (${s.length+_.length})`,panel:I(S||`<p class="text-muted">Ingen aktive kampar.</p>`)},{id:`completed`,label:`Ferdige (${c.length+v.length})`,panel:I(C||`<p class="text-muted">Ingen ferdige kampar enno.</p>`)}]})}async function U(e,t){let n=F(e,t,`Mine kampar og banar`);if(!n)return;let r=await H(n.throwerId);n.slot.replaceChildren(r)}async function W(e){let{data:t,error:n}=await d(e),r=new Map;if(n){let e=document.createElement(`p`);return e.className=`text-muted`,e.textContent=`Kunne ikkje laste påmeldingar.`,{node:e,registeredMap:r}}let i=t.filter(e=>e.stevne?.erfullfort!==!0);if(!i.length)return{node:T(`Ingen påmeldingar enno.`),registeredMap:r};let a=[...i].sort((e,t)=>(e.stevne?.dato??``).localeCompare(t.stevne?.dato??``)),o=document.createElement(`div`);o.className=`stevne-kort-liste`;for(let e of a){let t=e.stevne?.id;t!=null&&r.set(t,e.id),o.appendChild(_({title:e.stevne?.navn??``,href:t==null?`#`:`#/stevne/${t}/info`,date:y(e.stevne?.dato),status:`upcoming`,registrationSlotId:t??void 0}))}return{node:o,registeredMap:r}}async function G(e,t){let n=F(e,t,`Påmeldingar`);if(!n)return;let{node:r,registeredMap:i}=await W(n.throwerId);n.slot.replaceChildren(r),m(e,n.throwerId,t.user.id,i)}async function K(n){let{data:r,error:i}=await e.from(`bruker_profil`).select(`varsle_stevne_start, varsle_kamp_opprettet`).eq(`id`,n).maybeSingle();return i&&t(`getNotificationPreferences`,i),{data:r,error:i}}async function q(n,r,i){let a=r===`varsle_stevne_start`?{varsle_stevne_start:i}:{varsle_kamp_opprettet:i},{error:o}=await e.from(`bruker_profil`).update(a).eq(`id`,n);return o&&t(`updateNotificationPreference`,o),{error:o}}function J(e){return`
    <div class="form-check form-switch mb-2">
      <input class="form-check-input" type="checkbox" role="switch" id="varsle-stevne-start"${e.varsle_stevne_start?` checked`:``}>
      <label class="form-check-label" for="varsle-stevne-start">Varsle når eit stevne startar</label>
    </div>
    <div class="form-check form-switch">
      <input class="form-check-input" type="checkbox" role="switch" id="varsle-kamp-opprettet"${e.varsle_kamp_opprettet?` checked`:``}>
      <label class="form-check-label" for="varsle-kamp-opprettet">Varsle når kampar for meg blir oppretta</label>
    </div>`}function Y(e,t){for(let[r,a]of[[`varsle-stevne-start`,`varsle_stevne_start`],[`varsle-kamp-opprettet`,`varsle_kamp_opprettet`]]){let o=e.querySelector(`#${r}`);o&&o.addEventListener(`change`,async()=>{let e=o.checked;o.disabled=!0,e&&await i();let{error:r}=await q(t,a,e);o.disabled=!1,r&&(o.checked=!e,n(`Kunne ikkje lagre varslingsinnstilling: ${p(r)}`,`error`))})}}async function ie(e,t){let n=l.isNativePlatform();if(e.innerHTML=`
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
    </div>`,!n)return;let r=e.querySelector(`[data-slot="notifications"]`),{data:i}=await K(t.user.id);if(!i){r.innerHTML=`<p class="text-muted">Kunne ikkje laste varslingsinnstillingar.</p>`;return}r.innerHTML=J(i),Y(e,t.user.id)}var X=`Resultater og statistikk for koblet utøver blir ikkje slettet.`;async function ae(e){let{data:t,error:n}=await x(e);return n||!t?``:`
    <h5 class="card-title">Kontoen er koblet til utøvarprofil</h5>
    <p class="mb-1"><strong>${u(w(t))}</strong> · ${u(t.klubb?.navn??``)}</p>
    <a href="#/kastere/${C(t)}" class="btn btn-sm btn-outline-primary mt-1">Vis profil</a>`}function oe(e){let t=e?`Bytt passord`:`Opprett passord`;return`
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
    </form>`}function se(e,t){return`
    <p class="card-text text-muted">Alle kontoar som er kobla til utøvarprofilen din.</p>
    <table class="table table-sm align-middle linked-accounts-table">
      <thead><tr><th>E-post</th><th>Oppretta</th><th></th></tr></thead>
      <tbody>${e.map(e=>{let n=e.id===t?`<span class="badge bg-secondary">deg</span>`:`<button class="btn btn-sm btn-outline-primary" data-login-email="${u(e.epost)}">Logg inn</button>`;return`<tr>
      <td class="linked-accounts-table__email">${u(e.epost)}</td>
      <td class="linked-accounts-table__date">${u(y(e.opprettet_at))}</td>
      <td class="text-end linked-accounts-table__actions">${n}</td>
    </tr>`}).join(``)}</tbody>
    </table>`}function ce(e){e.querySelector(`#password-form`).addEventListener(`submit`,async r=>{r.preventDefault();let i=r.target,a=e.querySelector(`#ko-password-error`);a.classList.add(`d-none`);let o=e.querySelector(`#ko-password`).value;if(o!==e.querySelector(`#ko-password2`).value){a.textContent=`Passorda er ikkje like.`,a.classList.remove(`d-none`);return}let s=i.querySelector(`[type=submit]`);s.disabled=!0;let{error:l}=await c(o);if(s.disabled=!1,l){t(`minsideKonto.updatePassword`,l),a.textContent=`Kunne ikkje endre passord: ${p(l)}`,a.classList.remove(`d-none`);return}n(`Passordet er endra.`,`success`),i.reset()})}function le(e){e.querySelector(`[data-slot="accounts"]`).addEventListener(`click`,async e=>{let t=e.target.closest(`[data-login-email]`);t&&(await a(),location.hash=`#/logginn?email=${encodeURIComponent(t.dataset.loginEmail)}`)})}function ue(e,t){e.querySelector(`#delete-own-account`).addEventListener(`click`,async()=>{if(!await f({title:`Slette kontoen?`,message:`Innloggingskontoen ${t.user.email??``} vert sletta permanent. ${X}`,confirmText:`Slett konto`,danger:!0}))return;let{error:e}=await O(t.user.id);if(e){n(`Kunne ikkje slette kontoen: ${p(e)}`,`error`);return}try{await a()}catch{}location.hash=`#/logginn`})}async function Z(e,n){let r=n.status===`godkjent`?n.profil?.kasterid??null:null,i=r!=null,a=n.user.identities?.some(e=>e.provider===`email`)??!0;if(e.innerHTML=`
    ${i?`<div class="card mb-4"><div class="card-body" data-slot="thrower"><div class="skeleton-block skeleton-block--card"></div></div></div>`:``}
    <div class="card mb-4"><div class="card-body">${oe(a)}</div></div>
    ${i?`
      <div class="card mb-4"><div class="card-body">
        <h5 class="card-title">Innloggingskontoar</h5>
        <div data-slot="accounts"><div class="skeleton-block skeleton-block--card"></div></div>
      </div></div>`:``}
    <div class="card mb-4"><div class="card-body">
      <h5 class="card-title">Slett kontoen min</h5>
      <p class="card-text text-muted">${X}</p>
      <button type="button" class="btn btn-danger" id="delete-own-account">Slett kontoen min</button>
    </div></div>`,ce(e),ue(e,n),r==null)return;le(e);let o=e.querySelector(`[data-slot="thrower"]`),s=e.querySelector(`[data-slot="accounts"]`);try{let[e,t]=await Promise.all([ae(r),D()]);o.innerHTML=e,s.innerHTML=t.error?`<p class="text-muted">Kunne ikkje laste kontoar.</p>`:se(t.data,n.user.id)}catch(e){t(`minsideKonto.render`,e),s.innerHTML=`<p class="text-muted">Kunne ikkje laste kontoar.</p>`}}var Q=[{key:`kampar`,label:`Kampar`},{key:`pameldingar`,label:`Påmeldingar`},{key:`innstillingar`,label:`Innstillingar`},{key:`konto`,label:`Konto`}],de=new Set(Q.map(e=>e.key)),fe={kampar:U,pameldingar:G,innstillingar:ie,konto:Z};function pe(e){return`<ul class="nav nav-underline mypage-nav mb-3">${Q.map(({key:t,label:n})=>`
      <li class="nav-item">
        <a class="nav-link${e===t?` active`:``}"
           href="#/minside/${t}">${n}</a>
      </li>`).join(``)}</ul>`}async function $(e,n){v(()=>$(e,n));let i=String(n.tab??`kampar`);e.replaceChildren(b(`Laster min side…`));try{let t=await r();if(!t){location.hash=`#/logginn`;return}let{profil:n,user:a}=t,o=n?.kobling_status??`ingen`,s=i===`varslingar`?`innstillingar`:i,c=de.has(s)?s:`kampar`;e.innerHTML=`
      <div class="mypage-container">
        <h2 class="mb-1">Min side</h2>
        <p class="text-muted mb-3">${u(a.email??``)}</p>
        ${pe(c)}
        <div id="minside-subpage"></div>
      </div>`;let l=e.querySelector(`#minside-subpage`);await fe[c](l,{user:a,profil:n,status:o})}catch(n){t(`minside.render`,n),e.replaceChildren(s(`Kunne ikkje laste min side.`))}}export{$ as render};