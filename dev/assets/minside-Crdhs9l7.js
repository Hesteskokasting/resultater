import{t as e}from"./dist-DIpltt4c.js";import{n as t,t as n}from"./logError-ByTg738k.js";import{Bt as r,C as i,D as a,E as o,F as s,G as c,L as l,S as u,U as d,Zn as f,_r as p,ar as m,b as h,bn as g,f as _,g as v,gr as y,h as b,ir as x,nt as S,p as C,qt as w,r as T,s as E,t as D,vr as O}from"./index-ScyQGOLm.js";import{d as k,r as A}from"./kasterService-y8FvzW53.js";import{t as ee}from"./SearchSelect-fxcUpWhz.js";import{n as te,r as ne,t as re}from"./accountService-vuWqDOXj.js";import{c as j,d as M}from"./kampService-CozzZPkC.js";import{n as N,t as P}from"./groupBy-Bg_SEHjk.js";import{t as F}from"./navigationService-Dbfo1qDo.js";import{n as I}from"./ScoreboardButton-cO_q_Bk1.js";function L(e,t,n){let r=(e?.spelarar??[]).filter(e=>e.kasterid!=null),i={};for(let t of r){let r=e?.stevneid==null?void 0:n[`${e.stevneid}:${t.kasterid}`];r!=null&&(i[t.kasterid]=r)}let a=f(r,i),o=a.findIndex(e=>e.members.some(e=>e.kasterid===t));return{mine:o===-1?[]:a[o]?.members??[],others:a.filter((e,t)=>t!==o).map(e=>e.members)}}function ie(e){return!e?.length||e.every(e=>e.kaster==null)}function R(e,t){return x({rep:e[0],members:e},t)}function ae(e,t,n){let r=e?.er_bekreftet??!1,{mine:i,others:a}=L(e,t,n);if(e?.er_walkover)return{kind:`walkover`};if(r&&(e?.er_tre_spelarar||a.length>1)){let e=i.find(e=>e.kasterid===t)?.kamp_plassering;return e==null?{kind:`unknown`}:{kind:`placement`,placement:e}}let o=a[0];return!i.length||!o?.length?{kind:`unknown`}:{kind:`score`,me:R(i,r),them:R(o,r),confirmed:r}}function oe(e){return`
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
    </div>`}function z(){return`
    <div class="alert alert-info mb-4">
      <p class="mb-1">Koblingforespørselen din<span id="pending-name"></span> ventar på godkjenning frå ein administrator.</p>
      <p class="mb-1 small">Mens du ventar kan du klikke deg inn på dei forskjellige sidene for å gjere deg kjent med det nye systemet.</p>
      <p class="mb-0 small">Feil kobling? Send e-post til <a href="mailto:kontakt@hesteskokasting.no">kontakt@hesteskokasting.no</a></p>
    </div>`}function B(e,t){let n=e.querySelector(`#pending-name`);!n||t==null||(async()=>{let{data:e}=await k(t);e&&(n.textContent=` for ${u(e)}`)})()}function V(e,t){let n=e.querySelector(`#thrower-error`),r=[],o=null;o=ee({slot:e.querySelector(`#thrower-search-slot`),loadItems:async()=>{let{data:e}=await A();return r=e.map(e=>({id:e.id,label:i(e),sublabel:e.klubb?.navn??null})),r},placeholder:`Søk på navn…`,onSelect:e=>{e!=null&&(async()=>{n.classList.add(`d-none`);let i=r.find(t=>t.id===e),s=i?i.label+(i.sublabel?` (${i.sublabel})`:``):``;if(!await v({title:`Er dette deg?`,message:`Send koblingforespørsel for ${s}?`,confirmText:`Send forespørsel`})){o?.setValue(null);return}let{error:c}=await S(t,e);if(c){n.textContent=`Kunne ikkje sende forespørsel.`,n.classList.remove(`d-none`);return}a(),await T()})()}})}function H(e,t){return t.status===`godkjent`&&t.profil?.kasterid!=null?t.profil.kasterid:t.status===`venter`?(e.innerHTML=z(),B(e,t.profil?.kobling_kasterid??null),null):(e.innerHTML=oe(t.status),V(e,t.user.id),null)}function U(e,t,n){let r=H(e,t);return r==null?null:(e.innerHTML=`
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
    </div>`).join(``)}</div>`}var se={win:`Vunne`,loss:`Tapt`,draw:`Uavgjort`,neutral:``};function Y(e,t,n=se[t]){return`<span class="result-badge result-badge--${t}"${n?` title="${_(n)}"`:``}>${e}</span>`}function ce(e){return e==null?``:`<span class="match-grid__rings" title="Ringar">${e}</span>`}function le(e){let t=e.map(e=>e.map(e=>_(u(e.kaster))).filter(Boolean).map(e=>`<span class="match-grid__name-line">${e}</span>`).join(``)).filter(Boolean);return t.length?t.map(e=>`<span class="match-grid__side">${e}</span>`).join(``):`–`}async function ue(e){let[{data:t,error:n},r]=await Promise.all([j(e),w(e)]);if(n){let e=document.createElement(`p`);return e.className=`text-muted`,e.textContent=`Kunne ikkje laste kampar.`,e}let i=t,a=[...new Set(i.map(e=>e.kamp?.stevneid).filter(e=>e!=null))],o=await M(a),s=i.filter(e=>e.kamp?.stevne?.erfullfort===!1).sort((e,t)=>K(e)-K(t)||(e.kamp?.runde_nummer??0)-(t.kamp?.runde_nummer??0)),c=i.filter(e=>e.kamp?.stevne?.erfullfort===!0).sort((e,t)=>(t.kamp?.stevne?.dato??``).localeCompare(e.kamp?.stevne?.dato??``)||K(e)-K(t)||(e.kamp?.runde_nummer??0)-(t.kamp?.runde_nummer??0)),l=e=>(e.kamp?.spelarar??[]).some(e=>(e.omgangar?.length??0)>0),d=t=>{let n=ae(t.kamp,e,o);switch(n.kind){case`walkover`:return Y(`21 – 0`,`win`,`Vunne på walkover`);case`placement`:return Y(`${n.placement}. plass`,n.placement>=3?`loss`:`win`,`Plassering i kampen: ${n.placement}`);case`score`:{let{me:e,them:t}=n;return n.confirmed?Y(`${e} – ${t}`,e>t?`win`:e<t?`loss`:`draw`):Y(`${e} – ${t}`,`neutral`,`Ikkje stadfesta`)}default:return Y(`–`,`neutral`)}},f=e=>{let t=e.kamp;return t?.er_walkover?``:t?.er_bekreftet??!1?l(e)?I(t?.id??``,F(),`scoreboard-btn--stats`):``:I(t?.id??``,F(),`scoreboard-btn--touch`)},p=t=>{let n=t.kamp,{others:r}=L(n,e,o),i=n?.er_walkover&&ie(r[0]);return{slot:`<span class="match-grid__round">R${n?.runde_nummer??``} /</span> B${n?.bane_nummer??``}`,name:i?`<span class="match-grid__bye">Walkover</span>`:le(r),result:d(t),stats:f(t)}},m=e=>J([`<span class="visually-hidden">Runde og bane</span>`,`Motstandar`,`Resultat`,``],e.map(e=>p(e))),h=e=>{let t=G.map(({key:t,label:n})=>({label:n,matches:e.filter(e=>e.kamp?.fase===t)})).filter(e=>e.matches.length),n=e.filter(e=>!G.some(t=>t.key===e.kamp?.fase));return[...t.map(({label:e,matches:t})=>`
      <p class="match-grid__phase">${_(q(t[0],e))}</p>
      ${m(t)}`),...n.length?[m(n)]:[]].join(``)},g=e=>e.length?[...P(e,e=>e.kamp?.stevneid??`unknown`).values()].map(e=>`
      <p class="match-grid__stevne">${_(e[0]?.kamp?.stevne?.navn??``)}</p>
      ${h(e)}`).join(``):null,v=g(s),y=g(c),b=r.data.filter(e=>e.fase===`innledende`),x=b.filter(e=>e.stevne?.erfullfort===!1).sort((e,t)=>(e.bane_nummer??0)-(t.bane_nummer??0)),S=b.filter(e=>e.stevne?.erfullfort===!0).sort((e,t)=>(t.stevne?.dato??``).localeCompare(e.stevne?.dato??``)||(e.bane_nummer??0)-(t.bane_nummer??0)),C=e=>`#/stevne/${e.stevneid}/innledende`,T=t=>{let n=t.deltakarar.find(t=>t.kasterid===e),r=t.deltakarar.filter(t=>t.kasterid!==e).map(e=>_(u(e.kaster))),i=t.er_bekreftet??!1;return{slot:`B${t.bane_nummer??``}`,name:r.length?r.join(` / `):`–`,result:i?Y(n?.poeng==null?`–`:String(n.poeng),`neutral`):`<a href="${C(t)}" class="btn btn-sm btn-primary">Opne bane</a>`,stats:i?ce(n?.antall_ringer):``}},E=e=>e.length?[...P(e,e=>e.stevneid??`unknown`).values()].map(e=>`
      <p class="match-grid__stevne">${_(`${e[0]?.stevne?.navn??``} – X-kast`)}</p>
      ${J([`<span class="visually-hidden">Bane</span>`,`Medspelarar`,`Poeng`,`<span class="visually-hidden">Ringar</span>`],e.map(e=>T(e)))}`).join(``):null,D=E(x),O=E(S),k=[v,D].filter(Boolean).join(``),A=[y,O].filter(Boolean).join(``);return N({tabs:[{id:`active`,label:`Aktive (${s.length+x.length})`,panel:W(k||`<p class="text-muted">Ingen aktive kampar.</p>`)},{id:`completed`,label:`Ferdige (${c.length+S.length})`,panel:W(A||`<p class="text-muted">Ingen ferdige kampar enno.</p>`)}]})}async function de(e,t){let n=U(e,t,`Kampar / X-kast`);if(!n)return;let r=await ue(n.throwerId);n.slot.replaceChildren(r)}async function fe(e){let{data:t,error:n}=await g(e),r=new Map;if(n){let e=document.createElement(`p`);return e.className=`text-muted`,e.textContent=`Kunne ikkje laste påmeldingar.`,{node:e,registeredMap:r}}let i=t.filter(e=>e.stevne?.erfullfort!==!0);if(!i.length)return{node:y(`Ingen påmeldingar enno.`),registeredMap:r};let a=[...i].sort((e,t)=>(e.stevne?.dato??``).localeCompare(t.stevne?.dato??``)),o=document.createElement(`div`);o.className=`stevne-card-list`;for(let e of a){let t=e.stevne,n=t?.id;n!=null&&r.set(n,e.id),t&&o.appendChild(E(t,{href:n==null?`#`:`#/stevne/${n}/info`,registrationSlotId:n??void 0}))}return{node:o,registeredMap:r}}async function pe(e,t){let n=U(e,t,`Påmeldingar`);if(!n)return;let{node:r,registeredMap:i}=await fe(n.throwerId);n.slot.replaceChildren(r),C(e,n.throwerId,i)}async function me(e){let{data:r,error:i}=await t.from(`bruker_profil`).select(`varsle_stevne_start, varsle_kamp_opprettet`).eq(`id`,e).maybeSingle();return i&&n(`getNotificationPreferences`,i),{data:r,error:i}}async function he(e,r,i){let a=r===`varsle_stevne_start`?{varsle_stevne_start:i}:{varsle_kamp_opprettet:i},{error:o}=await t.from(`bruker_profil`).update(a).eq(`id`,e);return o&&n(`updateNotificationPreference`,o),{error:o}}function ge(e){return`
    <div class="form-check form-switch mb-2">
      <input class="form-check-input" type="checkbox" role="switch" id="varsle-stevne-start"${e.varsle_stevne_start?` checked`:``}>
      <label class="form-check-label" for="varsle-stevne-start">Varsle når eit stevne startar</label>
    </div>
    <div class="form-check form-switch">
      <input class="form-check-input" type="checkbox" role="switch" id="varsle-kamp-opprettet"${e.varsle_kamp_opprettet?` checked`:``}>
      <label class="form-check-label" for="varsle-kamp-opprettet">Varsle når kampar for meg blir oppretta</label>
    </div>`}function _e(e,t){for(let[n,i]of[[`varsle-stevne-start`,`varsle_stevne_start`],[`varsle-kamp-opprettet`,`varsle_kamp_opprettet`]]){let a=e.querySelector(`#${n}`);a&&a.addEventListener(`change`,async()=>{let e=a.checked;a.disabled=!0,e&&await c();let{error:n}=await he(t,i,e);a.disabled=!1,n&&(a.checked=!e,b(`Kunne ikkje lagre varslingsinnstilling: ${r(n)}`,`error`))})}}async function ve(t,n){let r=e.isNativePlatform();if(t.innerHTML=`
    ${r?`
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
    </div>`,!r)return;let i=t.querySelector(`[data-slot="notifications"]`),{data:a}=await me(n.user.id);if(!a){i.innerHTML=`<p class="text-muted">Kunne ikkje laste varslingsinnstillingar.</p>`;return}i.innerHTML=ge(a),_e(t,n.user.id)}var X=`Resultater og statistikk for koblet utøver blir ikkje slettet.`;async function ye(e){let{data:t,error:n}=await k(e);return n||!t?``:`
    <h5 class="card-title">Kontoen er koblet til utøvarprofil</h5>
    <p class="mb-1"><strong>${_(u(t))}</strong> · ${_(t.klubb?.navn??``)}</p>
    <a href="#/kastere/${h(t)}" class="btn btn-sm btn-outline-primary mt-1">Vis profil</a>`}function be(e){let t=e?`Bytt passord`:`Opprett passord`;return`
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
    </form>`}function xe(e,t){return`
    <p class="card-text text-muted">Alle kontoar som er kobla til utøvarprofilen din.</p>
    <table class="table table-sm align-middle linked-accounts-table">
      <thead><tr><th>E-post</th><th>Oppretta</th><th></th></tr></thead>
      <tbody>${e.map(e=>{let n=e.id===t?`<span class="badge bg-secondary">deg</span>`:`<button class="btn btn-sm btn-outline-primary" data-login-email="${_(e.epost)}">Logg inn</button>`;return`<tr>
      <td class="linked-accounts-table__email">${_(e.epost)}</td>
      <td class="linked-accounts-table__date">${_(m(e.opprettet_at))}</td>
      <td class="text-end linked-accounts-table__actions">${n}</td>
    </tr>`}).join(``)}</tbody>
    </table>`}function Se(e){e.querySelector(`#password-form`).addEventListener(`submit`,async t=>{t.preventDefault();let i=t.target,a=e.querySelector(`#ko-password-error`);a.classList.add(`d-none`);let o=e.querySelector(`#ko-password`).value;if(o!==e.querySelector(`#ko-password2`).value){a.textContent=`Passorda er ikkje like.`,a.classList.remove(`d-none`);return}let s=i.querySelector(`[type=submit]`);s.disabled=!0;let{error:c}=await l(o);if(s.disabled=!1,c){n(`minsideKonto.updatePassword`,c),a.textContent=`Kunne ikkje endre passord: ${r(c)}`,a.classList.remove(`d-none`);return}b(`Passordet er endra.`,`success`),i.reset()})}function Z(e){e.querySelector(`[data-slot="accounts"]`).addEventListener(`click`,async e=>{let t=e.target.closest(`[data-login-email]`);t&&(await s(),location.hash=`#/logginn?email=${encodeURIComponent(t.dataset.loginEmail)}`)})}function Ce(e,t){e.querySelector(`#delete-own-account`).addEventListener(`click`,async()=>{if(!await v({title:`Slette kontoen?`,message:`Innloggingskontoen ${t.user.email??``} vert sletta permanent. ${X}`,confirmText:`Slett konto`,danger:!0}))return;let{error:e}=await re(t.user.id);if(e){b(`Kunne ikkje slette kontoen: ${r(e)}`,`error`);return}try{await s()}catch{}location.hash=`#/logginn`})}async function we(e,t){let r=t.status===`godkjent`?t.profil?.kasterid??null:null,i=r!=null,a=t.user.identities?.some(e=>e.provider===`email`)??!0;if(e.innerHTML=`
    ${i?`<div class="card mb-4"><div class="card-body" data-slot="thrower"><div class="skeleton-block skeleton-block--card"></div></div></div>`:``}
    <div class="card mb-4"><div class="card-body">${be(a)}</div></div>
    ${i?`
      <div class="card mb-4"><div class="card-body">
        <h5 class="card-title">Innloggingskontoar</h5>
        <div data-slot="accounts"><div class="skeleton-block skeleton-block--card"></div></div>
      </div></div>`:``}
    <div class="card mb-4"><div class="card-body">
      <h5 class="card-title">Slett kontoen min</h5>
      <p class="card-text text-muted">${X}</p>
      <button type="button" class="btn btn-danger" id="delete-own-account">Slett kontoen min</button>
    </div></div>`,Se(e),Ce(e,t),r==null)return;Z(e);let o=e.querySelector(`[data-slot="thrower"]`),s=e.querySelector(`[data-slot="accounts"]`);try{let[e,n]=await Promise.all([ye(r),te()]);o.innerHTML=e,s.innerHTML=n.error?`<p class="text-muted">Kunne ikkje laste kontoar.</p>`:xe(n.data,t.user.id)}catch(e){n(`minsideKonto.render`,e),s.innerHTML=`<p class="text-muted">Kunne ikkje laste kontoar.</p>`}}var Q=[{key:`kampar`,label:`Kampar`},{key:`pameldingar`,label:`Påmeldingar`},{key:`innstillingar`,label:`Innstillingar`},{key:`konto`,label:`Konto`}],Te=new Set([`innstillingar`,`konto`]),Ee={kampar:de,pameldingar:pe,innstillingar:ve,konto:we};function De(e,t){return`<ul class="nav nav-underline mypage-nav mb-3">${e.map(({key:e,label:n})=>`
      <li class="nav-item">
        <a class="nav-link${t===e?` active`:``}"
           href="#/minside/${e}">${n}</a>
      </li>`).join(``)}</ul>`}async function $(e,t){D(()=>$(e,t));let r=String(t.tab??`kampar`);e.replaceChildren(O(`Laster min side…`));try{let t=await o();if(!t){location.hash=`#/logginn`;return}let{profil:n,user:i}=t,a=n?.kobling_status??`ingen`,s=d(n?.role),c=s?Q.filter(e=>Te.has(e.key)):Q,l=r===`varslingar`?`innstillingar`:r,u=c.find(e=>e.key===l);if(!u&&s){location.replace(`#/admin`);return}let f=u?.key??`kampar`;e.innerHTML=`
      <div class="mypage-container">
        <div class="mypage-head">
          <div>
            <h2 class="mb-1">Min side</h2>
            <p class="text-muted mb-0">${_(i.email??``)}</p>
          </div>
          <div data-slot="logout"></div>
        </div>
        ${De(c,f)}
        <div id="minside-subpage"></div>
      </div>`,e.querySelector(`[data-slot="logout"]`).appendChild(ne());let p=e.querySelector(`#minside-subpage`);await Ee[f](p,{user:i,profil:n,status:a})}catch(t){n(`minside.render`,t),e.replaceChildren(p(`Kunne ikkje laste min side.`))}}export{$ as render};