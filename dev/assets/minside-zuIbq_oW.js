import{n as e,t}from"./logError-ByTg738k.js";import{$n as n,B as r,C as i,D as a,E as o,Gn as s,I as c,Pt as l,Qn as u,R as d,S as f,Vt as p,Z as m,b as h,dr as g,f as _,fr as v,g as y,h as b,hr as x,mn as S,p as C,r as w,s as T,t as E,ur as D}from"./index-BzkBRoPl.js";import{d as O,r as k}from"./kasterService-BN8H2rLx.js";import{t as A}from"./SearchSelect-AmUwjtH-.js";import{n as j,r as M,t as ee}from"./accountService-D0hNAxVd.js";import{c as te,d as N}from"./kampService-DoJ0DGE2.js";import{n as P,t as F}from"./groupBy-Bg_SEHjk.js";import{t as I}from"./navigationService-DLn3eBNG.js";import{n as L}from"./ScoreboardButton-cO_q_Bk1.js";function R(e,t,n){let r=(e?.spelarar??[]).filter(e=>e.kasterid!=null),i={};for(let t of r){let r=e?.stevneid==null?void 0:n[`${e.stevneid}:${t.kasterid}`];r!=null&&(i[t.kasterid]=r)}let a=s(r,i),o=a.findIndex(e=>e.members.some(e=>e.kasterid===t));return{mine:o===-1?[]:a[o]?.members??[],others:a.filter((e,t)=>t!==o).map(e=>e.members)}}function ne(e){return!e?.length||e.every(e=>e.kaster==null)}function z(e,t){return u({rep:e[0],members:e},t)}function re(e,t,n){let r=e?.er_bekreftet??!1,{mine:i,others:a}=R(e,t,n);if(e?.er_walkover)return{kind:`walkover`};if(r&&(e?.er_tre_spelarar||a.length>1)){let e=i.find(e=>e.kasterid===t)?.kamp_plassering;return e==null?{kind:`unknown`}:{kind:`placement`,placement:e}}let o=a[0];return!i.length||!o?.length?{kind:`unknown`}:{kind:`score`,me:z(i,r),them:z(o,r),confirmed:r}}function ie(e){return`
    ${e===`avvist`?`<div class="alert alert-warning">Koblingforespørselen din vart avvist. Du kan sende ein ny.</div>`:``}
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">Koble til utøvarprofil</h5>
        <p class="card-text text-muted">Søk etter deg sjølv i registeret og send ein forespørsel. Ein administrator godkjenner koblinga manuelt, så det kan ta litt tid.</p>
        <p class="card-text text-muted">Etter godkjenning kan du melde deg på stevne, sjå dine eigne kampar og få varsel når eit stevne startar.</p>
        <span id="thrower-search-slot"></span>
        <div id="thrower-error" class="alert alert-danger d-none mt-2"></div>
        <p class="card-text text-muted small mt-3 mb-0">Har du ikkje delteke på eit stevne før? Ta
           kontakt med klubben din — eller send e-post til
           <a href="mailto:kontakt@hesteskokasting.no">kontakt@hesteskokasting.no</a>, så hjelper vi deg.</p>
      </div>
    </div>`}function ae(){return`
    <div class="alert alert-info mb-4">
      <p class="mb-1">Koblingforespørselen din<span id="pending-name"></span> ventar på godkjenning frå ein administrator.</p>
      <p class="mb-1 small">Mens du ventar kan du klikke deg inn på dei forskjellige sidene for å gjere deg kjent med det nye systemet.</p>
      <p class="mb-0 small">Feil kobling? Send e-post til <a href="mailto:kontakt@hesteskokasting.no">kontakt@hesteskokasting.no</a></p>
    </div>`}function B(e,t){let n=e.querySelector(`#pending-name`);!n||t==null||(async()=>{let{data:e}=await O(t);e&&(n.textContent=` for ${f(e)}`)})()}function V(e,t){let n=e.querySelector(`#thrower-error`),r=[],o=null;o=A({slot:e.querySelector(`#thrower-search-slot`),loadItems:async()=>{let{data:e}=await k();return r=e.map(e=>({id:e.id,label:i(e),sublabel:e.klubb?.navn??null})),r},placeholder:`Søk på navn…`,onSelect:e=>{e!=null&&(async()=>{n.classList.add(`d-none`);let i=r.find(t=>t.id===e),s=i?i.label+(i.sublabel?` (${i.sublabel})`:``):``;if(!await y({title:`Er dette deg?`,message:`Send koblingforespørsel for ${s}?`,confirmText:`Send forespørsel`})){o?.setValue(null);return}let{error:c}=await m(t,e);if(c){n.textContent=`Kunne ikkje sende forespørsel.`,n.classList.remove(`d-none`);return}a(),await w()})()}})}function H(e,t){return t.status===`godkjent`&&t.profil?.kasterid!=null?t.profil.kasterid:t.status===`venter`?(e.innerHTML=ae(),B(e,t.profil?.kobling_kasterid??null),null):(e.innerHTML=ie(t.status),V(e,t.user.id),null)}function U(e,t,n){let r=H(e,t);return r==null?null:(e.innerHTML=`
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">${_(n)}</h5>
        <div data-slot="content"><div class="skeleton-block skeleton-block--card"></div></div>
      </div>
    </div>`,{throwerId:r,slot:e.querySelector(`[data-slot="content"]`)})}function W(e){let t=document.createElement(`div`);return t.innerHTML=e,t}var G=[{key:`innledende`,label:`Innleiande`},{key:`avsluttende`,label:`Avsluttande`}];function K(e){let t=G.findIndex(t=>t.key===e.kamp?.fase);return t===-1?G.length:t}function q(e,t){let n=e.kamp?.stevne;return(e.kamp?.fase===`innledende`?n?.metodeInnl?.navn:n?.metodeAvsl?.navn)??t}function J(e,t){let n=e[3]?e[3]:`<span class="visually-hidden">Statistikk</span>`;return`<div class="match-grid" role="table">${`<div class="match-grid__head" role="row">
      <span role="columnheader">${e[0]}</span>
      <span role="columnheader">${e[1]}</span>
      <span role="columnheader" class="match-grid__result">${e[2]}</span>
      <span role="columnheader" class="match-grid__stats">${n}</span>
    </div>`}${t.map(e=>`<div class="match-grid__row" role="row">
      <span class="match-grid__slot" role="cell">${e.slot}</span>
      <span class="match-grid__name" role="cell">${e.name}</span>
      <span class="match-grid__result" role="cell">${e.result}</span>
      <span class="match-grid__stats" role="cell">${e.stats}</span>
    </div>`).join(``)}</div>`}var oe={win:`Vunne`,loss:`Tapt`,draw:`Uavgjort`,neutral:``};function Y(e,t,n=oe[t]){return`<span class="result-badge result-badge--${t}"${n?` title="${_(n)}"`:``}>${e}</span>`}function se(e){return e==null?``:`<span class="match-grid__rings" title="Ringar">${e}</span>`}function ce(e){let t=e.map(e=>e.map(e=>_(f(e.kaster))).filter(Boolean).map(e=>`<span class="match-grid__name-line">${e}</span>`).join(``)).filter(Boolean);return t.length?t.map(e=>`<span class="match-grid__side">${e}</span>`).join(``):`–`}async function le(e){let[{data:t,error:n},r]=await Promise.all([te(e),p(e)]);if(n){let e=document.createElement(`p`);return e.className=`text-muted`,e.textContent=`Kunne ikkje laste kampar.`,e}let i=t,a=[...new Set(i.map(e=>e.kamp?.stevneid).filter(e=>e!=null))],o=await N(a),s=i.filter(e=>e.kamp?.stevne?.erfullfort===!1).sort((e,t)=>K(e)-K(t)||(e.kamp?.runde_nummer??0)-(t.kamp?.runde_nummer??0)),c=i.filter(e=>e.kamp?.stevne?.erfullfort===!0).sort((e,t)=>(t.kamp?.stevne?.dato??``).localeCompare(e.kamp?.stevne?.dato??``)||K(e)-K(t)||(e.kamp?.runde_nummer??0)-(t.kamp?.runde_nummer??0)),l=e=>(e.kamp?.spelarar??[]).some(e=>(e.omgangar?.length??0)>0),u=t=>{let n=re(t.kamp,e,o);switch(n.kind){case`walkover`:return Y(`21 – 0`,`win`,`Vunne på walkover`);case`placement`:return Y(`${n.placement}. plass`,n.placement>=3?`loss`:`win`,`Plassering i kampen: ${n.placement}`);case`score`:{let{me:e,them:t}=n;return n.confirmed?Y(`${e} – ${t}`,e>t?`win`:e<t?`loss`:`draw`):Y(`${e} – ${t}`,`neutral`,`Ikkje stadfesta`)}default:return Y(`–`,`neutral`)}},d=e=>{let t=e.kamp;return t?.er_walkover?``:t?.er_bekreftet??!1?l(e)?L(t?.id??``,I(),`scoreboard-btn--stats`):``:L(t?.id??``,I(),`scoreboard-btn--touch`)},m=t=>{let n=t.kamp,{others:r}=R(n,e,o),i=n?.er_walkover&&ne(r[0]);return{slot:`<span class="match-grid__round">R${n?.runde_nummer??``} /</span> B${n?.bane_nummer??``}`,name:i?`<span class="match-grid__bye">Walkover</span>`:ce(r),result:u(t),stats:d(t)}},h=e=>J([`<span class="visually-hidden">Runde og bane</span>`,`Motstandar`,`Resultat`,``],e.map(e=>m(e))),g=e=>{let t=G.map(({key:t,label:n})=>({label:n,matches:e.filter(e=>e.kamp?.fase===t)})).filter(e=>e.matches.length),n=e.filter(e=>!G.some(t=>t.key===e.kamp?.fase));return[...t.map(({label:e,matches:t})=>`
      <p class="match-grid__phase">${_(q(t[0],e))}</p>
      ${h(t)}`),...n.length?[h(n)]:[]].join(``)},v=e=>e.length?[...F(e,e=>e.kamp?.stevneid??`unknown`).values()].map(e=>`
      <p class="match-grid__stevne">${_(e[0]?.kamp?.stevne?.navn??``)}</p>
      ${g(e)}`).join(``):null,y=v(s),b=v(c),x=r.data.filter(e=>e.fase===`innledende`),S=x.filter(e=>e.stevne?.erfullfort===!1).sort((e,t)=>(e.bane_nummer??0)-(t.bane_nummer??0)),C=x.filter(e=>e.stevne?.erfullfort===!0).sort((e,t)=>(t.stevne?.dato??``).localeCompare(e.stevne?.dato??``)||(e.bane_nummer??0)-(t.bane_nummer??0)),w=e=>`#/stevne/${e.stevneid}/innledende`,T=t=>{let n=t.deltakarar.find(t=>t.kasterid===e),r=t.deltakarar.filter(t=>t.kasterid!==e).map(e=>_(f(e.kaster))),i=t.er_bekreftet??!1;return{slot:`B${t.bane_nummer??``}`,name:r.length?r.join(` / `):`–`,result:i?Y(n?.poeng==null?`–`:String(n.poeng),`neutral`):`<a href="${w(t)}" class="btn btn-sm btn-primary">Opne bane</a>`,stats:i?se(n?.antall_ringer):``}},E=e=>e.length?[...F(e,e=>e.stevneid??`unknown`).values()].map(e=>`
      <p class="match-grid__stevne">${_(`${e[0]?.stevne?.navn??``} – X-kast`)}</p>
      ${J([`<span class="visually-hidden">Bane</span>`,`Medspelarar`,`Poeng`,`<span class="visually-hidden">Ringar</span>`],e.map(e=>T(e)))}`).join(``):null,D=E(S),O=E(C),k=[y,D].filter(Boolean).join(``),A=[b,O].filter(Boolean).join(``);return P({tabs:[{id:`active`,label:`Aktive (${s.length+S.length})`,panel:W(k||`<p class="text-muted">Ingen aktive kampar.</p>`)},{id:`completed`,label:`Ferdige (${c.length+C.length})`,panel:W(A||`<p class="text-muted">Ingen ferdige kampar enno.</p>`)}]})}async function ue(e,t){let n=U(e,t,`Kampar / X-kast`);if(!n)return;let r=await le(n.throwerId);n.slot.replaceChildren(r)}async function de(e){let{data:t,error:n}=await S(e),r=new Map;if(n){let e=document.createElement(`p`);return e.className=`text-muted`,e.textContent=`Kunne ikkje laste påmeldingar.`,{node:e,registeredMap:r}}let i=t.filter(e=>e.stevne?.erfullfort!==!0);if(!i.length)return{node:D(`Ingen påmeldingar enno.`),registeredMap:r};let a=[...i].sort((e,t)=>(e.stevne?.dato??``).localeCompare(t.stevne?.dato??``)),o=document.createElement(`div`);o.className=`stevne-card-list`;for(let e of a){let t=e.stevne,n=t?.id;n!=null&&r.set(n,e.id),t&&o.appendChild(T(t,{href:n==null?`#`:`#/stevne/${n}/info`,registrationSlotId:n??void 0}))}return{node:o,registeredMap:r}}async function fe(e,t){let n=U(e,t,`Påmeldingar`);if(!n)return;let{node:r,registeredMap:i}=await de(n.throwerId);n.slot.replaceChildren(r),C(e,n.throwerId,i)}async function pe(n){let{data:r,error:i}=await e.from(`bruker_profil`).select(`varsle_stevne_start, varsle_kamp_opprettet`).eq(`id`,n).maybeSingle();return i&&t(`getNotificationPreferences`,i),{data:r,error:i}}async function me(n,r,i){let a=r===`varsle_stevne_start`?{varsle_stevne_start:i}:{varsle_kamp_opprettet:i},{error:o}=await e.from(`bruker_profil`).update(a).eq(`id`,n);return o&&t(`updateNotificationPreference`,o),{error:o}}function he(e){return`
    <div class="form-check form-switch mb-2">
      <input class="form-check-input" type="checkbox" role="switch" id="varsle-stevne-start"${e.varsle_stevne_start?` checked`:``}>
      <label class="form-check-label" for="varsle-stevne-start">Varsle når eit stevne startar</label>
    </div>
    <div class="form-check form-switch">
      <input class="form-check-input" type="checkbox" role="switch" id="varsle-kamp-opprettet"${e.varsle_kamp_opprettet?` checked`:``}>
      <label class="form-check-label" for="varsle-kamp-opprettet">Varsle når kampar for meg blir oppretta</label>
    </div>`}function ge(e,t){for(let[n,i]of[[`varsle-stevne-start`,`varsle_stevne_start`],[`varsle-kamp-opprettet`,`varsle_kamp_opprettet`]]){let a=e.querySelector(`#${n}`);a&&a.addEventListener(`change`,async()=>{let e=a.checked;a.disabled=!0,e&&await r();let{error:n}=await me(t,i,e);a.disabled=!1,n&&(a.checked=!e,b(`Kunne ikkje lagre varslingsinnstilling: ${l(n)}`,`error`))})}}async function _e(e,t){let n=x.isNativePlatform();if(e.innerHTML=`
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
    </div>`,!n)return;let r=e.querySelector(`[data-slot="notifications"]`),{data:i}=await pe(t.user.id);if(!i){r.innerHTML=`<p class="text-muted">Kunne ikkje laste varslingsinnstillingar.</p>`;return}r.innerHTML=he(i),ge(e,t.user.id)}var X=`Resultater og statistikk for koblet utøver blir ikkje slettet.`;async function ve(e){let{data:t,error:n}=await O(e);return n||!t?``:`
    <h5 class="card-title">Kontoen er koblet til utøvarprofil</h5>
    <p class="mb-1"><strong>${_(f(t))}</strong> · ${_(t.klubb?.navn??``)}</p>
    <a href="#/kastere/${h(t)}" class="btn btn-sm btn-outline-primary mt-1">Vis profil</a>`}function ye(e){let t=e?`Bytt passord`:`Opprett passord`;return`
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
    </form>`}function be(e,t){return`
    <p class="card-text text-muted">Alle kontoar som er kobla til utøvarprofilen din.</p>
    <table class="table table-sm align-middle linked-accounts-table">
      <thead><tr><th>E-post</th><th>Oppretta</th><th></th></tr></thead>
      <tbody>${e.map(e=>{let r=e.id===t?`<span class="badge bg-secondary">deg</span>`:`<button class="btn btn-sm btn-outline-primary" data-login-email="${_(e.epost)}">Logg inn</button>`;return`<tr>
      <td class="linked-accounts-table__email">${_(e.epost)}</td>
      <td class="linked-accounts-table__date">${_(n(e.opprettet_at))}</td>
      <td class="text-end linked-accounts-table__actions">${r}</td>
    </tr>`}).join(``)}</tbody>
    </table>`}function xe(e){e.querySelector(`#password-form`).addEventListener(`submit`,async n=>{n.preventDefault();let r=n.target,i=e.querySelector(`#ko-password-error`);i.classList.add(`d-none`);let a=e.querySelector(`#ko-password`).value;if(a!==e.querySelector(`#ko-password2`).value){i.textContent=`Passorda er ikkje like.`,i.classList.remove(`d-none`);return}let o=r.querySelector(`[type=submit]`);o.disabled=!0;let{error:s}=await d(a);if(o.disabled=!1,s){t(`minsideKonto.updatePassword`,s),i.textContent=`Kunne ikkje endre passord: ${l(s)}`,i.classList.remove(`d-none`);return}b(`Passordet er endra.`,`success`),r.reset()})}function Se(e){e.querySelector(`[data-slot="accounts"]`).addEventListener(`click`,async e=>{let t=e.target.closest(`[data-login-email]`);t&&(await c(),location.hash=`#/logginn?email=${encodeURIComponent(t.dataset.loginEmail)}`)})}function Z(e,t){e.querySelector(`#delete-own-account`).addEventListener(`click`,async()=>{if(!await y({title:`Slette kontoen?`,message:`Innloggingskontoen ${t.user.email??``} vert sletta permanent. ${X}`,confirmText:`Slett konto`,danger:!0}))return;let{error:e}=await ee(t.user.id);if(e){b(`Kunne ikkje slette kontoen: ${l(e)}`,`error`);return}try{await c()}catch{}location.hash=`#/logginn`})}async function Ce(e,n){let r=n.status===`godkjent`?n.profil?.kasterid??null:null,i=r!=null,a=n.user.identities?.some(e=>e.provider===`email`)??!0;if(e.innerHTML=`
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
    </div></div>`,xe(e),Z(e,n),r==null)return;Se(e);let o=e.querySelector(`[data-slot="thrower"]`),s=e.querySelector(`[data-slot="accounts"]`);try{let[e,t]=await Promise.all([ve(r),j()]);o.innerHTML=e,s.innerHTML=t.error?`<p class="text-muted">Kunne ikkje laste kontoar.</p>`:be(t.data,n.user.id)}catch(e){t(`minsideKonto.render`,e),s.innerHTML=`<p class="text-muted">Kunne ikkje laste kontoar.</p>`}}var Q=[{key:`kampar`,label:`Kampar`},{key:`pameldingar`,label:`Påmeldingar`},{key:`innstillingar`,label:`Innstillingar`},{key:`konto`,label:`Konto`}],we=new Set(Q.map(e=>e.key)),Te={kampar:ue,pameldingar:fe,innstillingar:_e,konto:Ce};function Ee(e){return`<ul class="nav nav-underline mypage-nav mb-3">${Q.map(({key:t,label:n})=>`
      <li class="nav-item">
        <a class="nav-link${e===t?` active`:``}"
           href="#/minside/${t}">${n}</a>
      </li>`).join(``)}</ul>`}async function $(e,n){E(()=>$(e,n));let r=String(n.tab??`kampar`);e.replaceChildren(v(`Laster min side…`));try{let t=await o();if(!t){location.hash=`#/logginn`;return}let{profil:n,user:i}=t,a=n?.kobling_status??`ingen`,s=r===`varslingar`?`innstillingar`:r,c=we.has(s)?s:`kampar`;e.innerHTML=`
      <div class="mypage-container">
        <div class="mypage-head">
          <div>
            <h2 class="mb-1">Min side</h2>
            <p class="text-muted mb-0">${_(i.email??``)}</p>
          </div>
          <div data-slot="logout"></div>
        </div>
        ${Ee(c)}
        <div id="minside-subpage"></div>
      </div>`,e.querySelector(`[data-slot="logout"]`).appendChild(M());let l=e.querySelector(`#minside-subpage`);await Te[c](l,{user:i,profil:n,status:a})}catch(n){t(`minside.render`,n),e.replaceChildren(g(`Kunne ikkje laste min side.`))}}export{$ as render};