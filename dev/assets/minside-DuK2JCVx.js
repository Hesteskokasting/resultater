import{n as e,r as t,t as n}from"./logError-DE4meABt.js";import{Bn as r,F as i,It as a,Jn as o,K as s,M as c,P as l,T as u,Zn as d,b as f,d as p,dr as m,fr as h,kt as g,ln as _,m as v,mr as y,p as b,r as x,s as S,t as C,ur as w,v as T,w as E,x as D}from"./index-C5SiCpc_.js";import{d as O,r as k}from"./kasterService-D2LNpl7e.js";import{t as A}from"./SearchSelect-DttCgL1T.js";import{n as j,r as M,t as N}from"./accountService-CYZ6ZF-U.js";import{f as P,l as ee}from"./kampService-BuJQm37d.js";import{t as F}from"./Tabs-DZCBJPb0.js";import{t as I}from"./navigationService-DZMdN0MH.js";import{n as L}from"./ScoreboardButton-cO_q_Bk1.js";import{t as R}from"./groupBy-BwgwJVkt.js";function z(e,t,n){let i=(e?.spelarar??[]).filter(e=>e.kasterid!=null),a={};for(let t of i){let r=e?.stevneid==null?void 0:n[`${e.stevneid}:${t.kasterid}`];r!=null&&(a[t.kasterid]=r)}let o=r(i,a),s=o.findIndex(e=>e.members.some(e=>e.kasterid===t));return{mine:s===-1?[]:o[s]?.members??[],others:o.filter((e,t)=>t!==s).map(e=>e.members)}}function te(e){return!e?.length||e.every(e=>e.kaster==null)}function B(e,t){return o({rep:e[0],members:e},t)}function ne(e,t,n){let r=e?.er_bekreftet??!1,{mine:i,others:a}=z(e,t,n);if(e?.er_walkover)return{kind:`walkover`};if(r&&(e?.er_tre_spelarar||a.length>1)){let e=i.find(e=>e.kasterid===t)?.kamp_plassering;return e==null?{kind:`unknown`}:{kind:`placement`,placement:e}}let o=a[0];return!i.length||!o?.length?{kind:`unknown`}:{kind:`score`,me:B(i,r),them:B(o,r),confirmed:r}}function re(e){return`
    ${e===`avvist`?`<div class="alert alert-warning">Koblingforespørselen din vart avvist. Du kan sende ein ny.</div>`:``}
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">Koble til utøvarprofil</h5>
        <p class="card-text text-muted">Søk etter deg sjølv i registeret og send ein forespørsel. Etter godkjenning kan du melde deg på stevner.</p>
        <span id="thrower-search-slot"></span>
        <div id="thrower-error" class="alert alert-danger d-none mt-2"></div>
      </div>
    </div>`}function ie(){return`
    <div class="alert alert-info mb-4">
      <p class="mb-1">Koblingforespørselen din<span id="pending-name"></span> ventar på godkjenning.</p>
      <p class="mb-0 small">Feil kobling? Send e-post til <a href="mailto:kontakt@hesteskokasting.no">kontakt@hesteskokasting.no</a></p>
    </div>`}function ae(e,t){let n=e.querySelector(`#pending-name`);!n||t==null||(async()=>{let{data:e}=await O(t);e&&(n.textContent=` for ${f(e)}`)})()}function V(e,t){let n=e.querySelector(`#thrower-error`),r=[],i=null;i=A({slot:e.querySelector(`#thrower-search-slot`),loadItems:async()=>{let{data:e}=await k();return r=e.map(e=>({id:e.id,label:D(e),sublabel:e.klubb?.navn??null})),r},placeholder:`Søk på navn…`,onSelect:e=>{e!=null&&(async()=>{n.classList.add(`d-none`);let a=r.find(t=>t.id===e),o=a?a.label+(a.sublabel?` (${a.sublabel})`:``):``;if(!await v({title:`Er dette deg?`,message:`Send koblingforespørsel for ${o}?`,confirmText:`Send forespørsel`})){i?.setValue(null);return}let{error:c}=await s(t,e);if(c){n.textContent=`Kunne ikkje sende forespørsel.`,n.classList.remove(`d-none`);return}u(),await x()})()}})}function H(e,t){return t.status===`godkjent`&&t.profil?.kasterid!=null?t.profil.kasterid:t.status===`venter`?(e.innerHTML=ie(),ae(e,t.profil?.kobling_kasterid??null),null):(e.innerHTML=re(t.status),V(e,t.user.id),null)}function U(t,n,r){let i=H(t,n);return i==null?null:(t.innerHTML=`
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">${e(r)}</h5>
        <div data-slot="content"><div class="skeleton-block skeleton-block--card"></div></div>
      </div>
    </div>`,{throwerId:i,slot:t.querySelector(`[data-slot="content"]`)})}function W(e){let t=document.createElement(`div`);return t.innerHTML=e,t}var G=[{key:`innledende`,label:`Innleiande`},{key:`avsluttende`,label:`Avsluttande`}];function K(e){let t=G.findIndex(t=>t.key===e.kamp?.fase);return t===-1?G.length:t}function q(e,t){let n=e.kamp?.stevne;return(e.kamp?.fase===`innledende`?n?.metodeInnl?.navn:n?.metodeAvsl?.navn)??t}function J(e,t){let n=e[3]?e[3]:`<span class="visually-hidden">Statistikk</span>`;return`<div class="match-grid" role="table">${`<div class="match-grid__head" role="row">
      <span role="columnheader">${e[0]}</span>
      <span role="columnheader">${e[1]}</span>
      <span role="columnheader" class="match-grid__result">${e[2]}</span>
      <span role="columnheader" class="match-grid__stats">${n}</span>
    </div>`}${t.map(e=>`<div class="match-grid__row" role="row">
      <span class="match-grid__slot" role="cell">${e.slot}</span>
      <span class="match-grid__name" role="cell">${e.name}</span>
      <span class="match-grid__result" role="cell">${e.result}</span>
      <span class="match-grid__stats" role="cell">${e.stats}</span>
    </div>`).join(``)}</div>`}var oe={win:`Vunne`,loss:`Tapt`,draw:`Uavgjort`,neutral:``};function Y(t,n,r=oe[n]){return`<span class="result-badge result-badge--${n}"${r?` title="${e(r)}"`:``}>${t}</span>`}function se(e){return e==null?``:`<span class="match-grid__rings" title="Ringar">${e}</span>`}function ce(t){let n=t.flat().map(t=>e(f(t.kaster))).filter(Boolean);return n.length?n.join(` / `):`–`}async function le(t){let[{data:n,error:r},i]=await Promise.all([ee(t),a(t)]);if(r){let e=document.createElement(`p`);return e.className=`text-muted`,e.textContent=`Kunne ikkje laste kampar.`,e}let o=n,s=[...new Set(o.map(e=>e.kamp?.stevneid).filter(e=>e!=null))],c=await P(s),l=o.filter(e=>e.kamp?.stevne?.erfullfort===!1).sort((e,t)=>K(e)-K(t)||(e.kamp?.runde_nummer??0)-(t.kamp?.runde_nummer??0)),u=o.filter(e=>e.kamp?.stevne?.erfullfort===!0).sort((e,t)=>(t.kamp?.stevne?.dato??``).localeCompare(e.kamp?.stevne?.dato??``)||K(e)-K(t)||(e.kamp?.runde_nummer??0)-(t.kamp?.runde_nummer??0)),d=e=>(e.kamp?.spelarar??[]).some(e=>(e.omgangar?.length??0)>0),p=e=>{let n=ne(e.kamp,t,c);switch(n.kind){case`walkover`:return Y(`21 – 0`,`win`,`Vunne på walkover`);case`placement`:return Y(`${n.placement}. plass`,n.placement>=3?`loss`:`win`,`Plassering i kampen: ${n.placement}`);case`score`:{let{me:e,them:t}=n;return n.confirmed?Y(`${e} – ${t}`,e>t?`win`:e<t?`loss`:`draw`):Y(`${e} – ${t}`,`neutral`,`Ikkje stadfesta`)}default:return Y(`–`,`neutral`)}},m=e=>{let t=e.kamp;return t?.er_walkover?``:t?.er_bekreftet??!1?d(e)?L(t?.id??``,I(),`scoreboard-btn--stats`):``:L(t?.id??``,I(),`scoreboard-btn--touch`)},h=e=>{let n=e.kamp,{others:r}=z(n,t,c),i=n?.er_walkover&&te(r[0]);return{slot:`<span class="match-grid__round">R${n?.runde_nummer??``} /</span> B${n?.bane_nummer??``}`,name:i?`<span class="match-grid__bye">Walkover</span>`:ce(r),result:p(e),stats:m(e)}},g=e=>J([`R / B`,`Motstandar`,`Resultat`,``],e.map(h)),_=t=>{let n=G.map(({key:e,label:n})=>({label:n,matches:t.filter(t=>t.kamp?.fase===e)})).filter(e=>e.matches.length),r=t.filter(e=>!G.some(t=>t.key===e.kamp?.fase));return[...n.map(({label:t,matches:n})=>`
      <p class="match-grid__phase">${e(q(n[0],t))}</p>
      ${g(n)}`),...r.length?[g(r)]:[]].join(``)},v=t=>t.length?[...R(t,e=>e.kamp?.stevneid??`unknown`).values()].map(t=>`
      <p class="match-grid__stevne">${e(t[0]?.kamp?.stevne?.navn??``)}</p>
      ${_(t)}`).join(``):null,y=v(l),b=v(u),x=i.data.filter(e=>e.fase===`innledende`),S=x.filter(e=>e.stevne?.erfullfort===!1).sort((e,t)=>(e.bane_nummer??0)-(t.bane_nummer??0)),C=x.filter(e=>e.stevne?.erfullfort===!0).sort((e,t)=>(t.stevne?.dato??``).localeCompare(e.stevne?.dato??``)||(e.bane_nummer??0)-(t.bane_nummer??0)),w=e=>`#/stevne/${e.stevneid}/innledende`,T=n=>{let r=n.deltakarar.find(e=>e.kasterid===t),i=n.deltakarar.filter(e=>e.kasterid!==t).map(t=>e(f(t.kaster))),a=n.er_bekreftet??!1;return{slot:`B${n.bane_nummer??``}`,name:i.length?i.join(` / `):`–`,result:a?Y(r?.poeng==null?`–`:String(r.poeng),`neutral`):`<a href="${w(n)}" class="btn btn-sm btn-primary">Opne bane</a>`,stats:a?se(r?.antall_ringer):``}},E=t=>t.length?[...R(t,e=>e.stevneid??`unknown`).values()].map(t=>`
      <p class="match-grid__stevne">${e(`${t[0]?.stevne?.navn??``} – X-kast`)}</p>
      ${J([`Bane`,`Medspelarar`,`Poeng`,`R`],t.map(T))}`).join(``):null,D=E(S),O=E(C),k=[y,D].filter(Boolean).join(``),A=[b,O].filter(Boolean).join(``);return F({tabs:[{id:`active`,label:`Aktive (${l.length+S.length})`,panel:W(k||`<p class="text-muted">Ingen aktive kampar.</p>`)},{id:`completed`,label:`Ferdige (${u.length+C.length})`,panel:W(A||`<p class="text-muted">Ingen ferdige kampar enno.</p>`)}]})}async function ue(e,t){let n=U(e,t,`Kampar / X-kast`);if(!n)return;let r=await le(n.throwerId);n.slot.replaceChildren(r)}async function de(e){let{data:t,error:n}=await _(e),r=new Map;if(n){let e=document.createElement(`p`);return e.className=`text-muted`,e.textContent=`Kunne ikkje laste påmeldingar.`,{node:e,registeredMap:r}}let i=t.filter(e=>e.stevne?.erfullfort!==!0);if(!i.length)return{node:w(`Ingen påmeldingar enno.`),registeredMap:r};let a=[...i].sort((e,t)=>(e.stevne?.dato??``).localeCompare(t.stevne?.dato??``)),o=document.createElement(`div`);o.className=`stevne-kort-liste`;for(let e of a){let t=e.stevne,n=t?.id;n!=null&&r.set(n,e.id),t&&o.appendChild(S(t,{href:n==null?`#`:`#/stevne/${n}/info`,registrationSlotId:n??void 0}))}return{node:o,registeredMap:r}}async function fe(e,t){let n=U(e,t,`Påmeldingar`);if(!n)return;let{node:r,registeredMap:i}=await de(n.throwerId);n.slot.replaceChildren(r),p(e,n.throwerId,i)}async function pe(e){let{data:r,error:i}=await t.from(`bruker_profil`).select(`varsle_stevne_start, varsle_kamp_opprettet`).eq(`id`,e).maybeSingle();return i&&n(`getNotificationPreferences`,i),{data:r,error:i}}async function me(e,r,i){let a=r===`varsle_stevne_start`?{varsle_stevne_start:i}:{varsle_kamp_opprettet:i},{error:o}=await t.from(`bruker_profil`).update(a).eq(`id`,e);return o&&n(`updateNotificationPreference`,o),{error:o}}function he(e){return`
    <div class="form-check form-switch mb-2">
      <input class="form-check-input" type="checkbox" role="switch" id="varsle-stevne-start"${e.varsle_stevne_start?` checked`:``}>
      <label class="form-check-label" for="varsle-stevne-start">Varsle når eit stevne startar</label>
    </div>
    <div class="form-check form-switch">
      <input class="form-check-input" type="checkbox" role="switch" id="varsle-kamp-opprettet"${e.varsle_kamp_opprettet?` checked`:``}>
      <label class="form-check-label" for="varsle-kamp-opprettet">Varsle når kampar for meg blir oppretta</label>
    </div>`}function ge(e,t){for(let[n,r]of[[`varsle-stevne-start`,`varsle_stevne_start`],[`varsle-kamp-opprettet`,`varsle_kamp_opprettet`]]){let a=e.querySelector(`#${n}`);a&&a.addEventListener(`change`,async()=>{let e=a.checked;a.disabled=!0,e&&await i();let{error:n}=await me(t,r,e);a.disabled=!1,n&&(a.checked=!e,b(`Kunne ikkje lagre varslingsinnstilling: ${g(n)}`,`error`))})}}async function _e(e,t){let n=y.isNativePlatform();if(e.innerHTML=`
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
    </div>`,!n)return;let r=e.querySelector(`[data-slot="notifications"]`),{data:i}=await pe(t.user.id);if(!i){r.innerHTML=`<p class="text-muted">Kunne ikkje laste varslingsinnstillingar.</p>`;return}r.innerHTML=he(i),ge(e,t.user.id)}var X=`Resultater og statistikk for koblet utøver blir ikkje slettet.`;async function ve(t){let{data:n,error:r}=await O(t);return r||!n?``:`
    <h5 class="card-title">Kontoen er koblet til utøvarprofil</h5>
    <p class="mb-1"><strong>${e(f(n))}</strong> · ${e(n.klubb?.navn??``)}</p>
    <a href="#/kastere/${T(n)}" class="btn btn-sm btn-outline-primary mt-1">Vis profil</a>`}function ye(e){let t=e?`Bytt passord`:`Opprett passord`;return`
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
    </form>`}function be(t,n){return`
    <p class="card-text text-muted">Alle kontoar som er kobla til utøvarprofilen din.</p>
    <table class="table table-sm align-middle linked-accounts-table">
      <thead><tr><th>E-post</th><th>Oppretta</th><th></th></tr></thead>
      <tbody>${t.map(t=>{let r=t.id===n?`<span class="badge bg-secondary">deg</span>`:`<button class="btn btn-sm btn-outline-primary" data-login-email="${e(t.epost)}">Logg inn</button>`;return`<tr>
      <td class="linked-accounts-table__email">${e(t.epost)}</td>
      <td class="linked-accounts-table__date">${e(d(t.opprettet_at))}</td>
      <td class="text-end linked-accounts-table__actions">${r}</td>
    </tr>`}).join(``)}</tbody>
    </table>`}function xe(e){e.querySelector(`#password-form`).addEventListener(`submit`,async t=>{t.preventDefault();let r=t.target,i=e.querySelector(`#ko-password-error`);i.classList.add(`d-none`);let a=e.querySelector(`#ko-password`).value;if(a!==e.querySelector(`#ko-password2`).value){i.textContent=`Passorda er ikkje like.`,i.classList.remove(`d-none`);return}let o=r.querySelector(`[type=submit]`);o.disabled=!0;let{error:s}=await l(a);if(o.disabled=!1,s){n(`minsideKonto.updatePassword`,s),i.textContent=`Kunne ikkje endre passord: ${g(s)}`,i.classList.remove(`d-none`);return}b(`Passordet er endra.`,`success`),r.reset()})}function Se(e){e.querySelector(`[data-slot="accounts"]`).addEventListener(`click`,async e=>{let t=e.target.closest(`[data-login-email]`);t&&(await c(),location.hash=`#/logginn?email=${encodeURIComponent(t.dataset.loginEmail)}`)})}function Z(e,t){e.querySelector(`#delete-own-account`).addEventListener(`click`,async()=>{if(!await v({title:`Slette kontoen?`,message:`Innloggingskontoen ${t.user.email??``} vert sletta permanent. ${X}`,confirmText:`Slett konto`,danger:!0}))return;let{error:e}=await N(t.user.id);if(e){b(`Kunne ikkje slette kontoen: ${g(e)}`,`error`);return}try{await c()}catch{}location.hash=`#/logginn`})}async function Ce(e,t){let r=t.status===`godkjent`?t.profil?.kasterid??null:null,i=r!=null,a=t.user.identities?.some(e=>e.provider===`email`)??!0;if(e.innerHTML=`
    ${i?`<div class="card mb-4"><div class="card-body" data-slot="thrower"><div class="skeleton-block skeleton-block--card"></div></div></div>`:``}
    <div class="card mb-4"><div class="card-body">${ye(a)}</div></div>
    ${i?`
      <div class="card mb-4"><div class="card-body">
        <h5 class="card-title">Innloggingskontoar</h5>
        <div data-slot="accounts"><div class="skeleton-block skeleton-block--card"></div></div>
      </div></div>`:``}
    <div class="card mb-4"><div class="card-body">
      <h5 class="card-title">Slett kontoen min</h5>
      <p class="card-text text-muted">${X}</p>
      <button type="button" class="btn btn-danger" id="delete-own-account">Slett kontoen min</button>
    </div></div>`,xe(e),Z(e,t),r==null)return;Se(e);let o=e.querySelector(`[data-slot="thrower"]`),s=e.querySelector(`[data-slot="accounts"]`);try{let[e,n]=await Promise.all([ve(r),j()]);o.innerHTML=e,s.innerHTML=n.error?`<p class="text-muted">Kunne ikkje laste kontoar.</p>`:be(n.data,t.user.id)}catch(e){n(`minsideKonto.render`,e),s.innerHTML=`<p class="text-muted">Kunne ikkje laste kontoar.</p>`}}var Q=[{key:`kampar`,label:`Kampar`},{key:`pameldingar`,label:`Påmeldingar`},{key:`innstillingar`,label:`Innstillingar`},{key:`konto`,label:`Konto`}],we=new Set(Q.map(e=>e.key)),Te={kampar:ue,pameldingar:fe,innstillingar:_e,konto:Ce};function Ee(e){return`<ul class="nav nav-underline mypage-nav mb-3">${Q.map(({key:t,label:n})=>`
      <li class="nav-item">
        <a class="nav-link${e===t?` active`:``}"
           href="#/minside/${t}">${n}</a>
      </li>`).join(``)}</ul>`}async function $(t,r){C(()=>$(t,r));let i=String(r.tab??`kampar`);t.replaceChildren(h(`Laster min side…`));try{let n=await E();if(!n){location.hash=`#/logginn`;return}let{profil:r,user:a}=n,o=r?.kobling_status??`ingen`,s=i===`varslingar`?`innstillingar`:i,c=we.has(s)?s:`kampar`;t.innerHTML=`
      <div class="mypage-container">
        <div class="mypage-head">
          <div>
            <h2 class="mb-1">Min side</h2>
            <p class="text-muted mb-0">${e(a.email??``)}</p>
          </div>
          <div data-slot="logout"></div>
        </div>
        ${Ee(c)}
        <div id="minside-subpage"></div>
      </div>`,t.querySelector(`[data-slot="logout"]`).appendChild(M());let l=t.querySelector(`#minside-subpage`);await Te[c](l,{user:a,profil:r,status:o})}catch(e){n(`minside.render`,e),t.replaceChildren(m(`Kunne ikkje laste min side.`))}}export{$ as render};