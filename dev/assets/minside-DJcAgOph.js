import{n as e,t}from"./logError-CTQ3euge.js";import{t as n}from"./escHtml-CfOHO0aD.js";import{$n as r,E as i,I as a,Mt as o,P as s,R as c,S as l,T as u,Un as d,Xn as f,Y as p,f as m,fn as h,fr as g,gr as _,h as v,m as y,mr as b,pr as x,r as S,s as C,t as w,x as T,y as E,zt as D}from"./index-BvHOwV9o.js";import{d as O,r as k}from"./kasterService-DIBRsqwT.js";import{t as A}from"./SearchSelect-BJcy-3Sw.js";import{n as j,r as M,t as ee}from"./accountService-DHi5gSRR.js";import{c as te,d as N}from"./kampService-BlbHkFyy.js";import{n as P,t as F}from"./groupBy-Bg_SEHjk.js";import{t as I}from"./navigationService-B6SgMoKM.js";import{n as L}from"./ScoreboardButton-cO_q_Bk1.js";function R(e,t,n){let r=(e?.spelarar??[]).filter(e=>e.kasterid!=null),i={};for(let t of r){let r=e?.stevneid==null?void 0:n[`${e.stevneid}:${t.kasterid}`];r!=null&&(i[t.kasterid]=r)}let a=d(r,i),o=a.findIndex(e=>e.members.some(e=>e.kasterid===t));return{mine:o===-1?[]:a[o]?.members??[],others:a.filter((e,t)=>t!==o).map(e=>e.members)}}function ne(e){return!e?.length||e.every(e=>e.kaster==null)}function z(e,t){return f({rep:e[0],members:e},t)}function re(e,t,n){let r=e?.er_bekreftet??!1,{mine:i,others:a}=R(e,t,n);if(e?.er_walkover)return{kind:`walkover`};if(r&&(e?.er_tre_spelarar||a.length>1)){let e=i.find(e=>e.kasterid===t)?.kamp_plassering;return e==null?{kind:`unknown`}:{kind:`placement`,placement:e}}let o=a[0];return!i.length||!o?.length?{kind:`unknown`}:{kind:`score`,me:z(i,r),them:z(o,r),confirmed:r}}function ie(e){return`
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
    </div>`}function B(e,t){let n=e.querySelector(`#pending-name`);!n||t==null||(async()=>{let{data:e}=await O(t);e&&(n.textContent=` for ${T(e)}`)})()}function V(e,t){let n=e.querySelector(`#thrower-error`),r=[],a=null;a=A({slot:e.querySelector(`#thrower-search-slot`),loadItems:async()=>{let{data:e}=await k();return r=e.map(e=>({id:e.id,label:l(e),sublabel:e.klubb?.navn??null})),r},placeholder:`Søk på navn…`,onSelect:e=>{e!=null&&(async()=>{n.classList.add(`d-none`);let o=r.find(t=>t.id===e),s=o?o.label+(o.sublabel?` (${o.sublabel})`:``):``;if(!await v({title:`Er dette deg?`,message:`Send koblingforespørsel for ${s}?`,confirmText:`Send forespørsel`})){a?.setValue(null);return}let{error:c}=await p(t,e);if(c){n.textContent=`Kunne ikkje sende forespørsel.`,n.classList.remove(`d-none`);return}i(),await S()})()}})}function H(e,t){return t.status===`godkjent`&&t.profil?.kasterid!=null?t.profil.kasterid:t.status===`venter`?(e.innerHTML=ae(),B(e,t.profil?.kobling_kasterid??null),null):(e.innerHTML=ie(t.status),V(e,t.user.id),null)}function U(e,t,r){let i=H(e,t);return i==null?null:(e.innerHTML=`
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">${n(r)}</h5>
        <div data-slot="content"><div class="skeleton-block skeleton-block--card"></div></div>
      </div>
    </div>`,{throwerId:i,slot:e.querySelector(`[data-slot="content"]`)})}function W(e){let t=document.createElement(`div`);return t.innerHTML=e,t}var G=[{key:`innledende`,label:`Innleiande`},{key:`avsluttende`,label:`Avsluttande`}];function K(e){let t=G.findIndex(t=>t.key===e.kamp?.fase);return t===-1?G.length:t}function q(e,t){let n=e.kamp?.stevne;return(e.kamp?.fase===`innledende`?n?.metodeInnl?.navn:n?.metodeAvsl?.navn)??t}function J(e,t){let n=e[3]?e[3]:`<span class="visually-hidden">Statistikk</span>`;return`<div class="match-grid" role="table">${`<div class="match-grid__head" role="row">
      <span role="columnheader">${e[0]}</span>
      <span role="columnheader">${e[1]}</span>
      <span role="columnheader" class="match-grid__result">${e[2]}</span>
      <span role="columnheader" class="match-grid__stats">${n}</span>
    </div>`}${t.map(e=>`<div class="match-grid__row" role="row">
      <span class="match-grid__slot" role="cell">${e.slot}</span>
      <span class="match-grid__name" role="cell">${e.name}</span>
      <span class="match-grid__result" role="cell">${e.result}</span>
      <span class="match-grid__stats" role="cell">${e.stats}</span>
    </div>`).join(``)}</div>`}var oe={win:`Vunne`,loss:`Tapt`,draw:`Uavgjort`,neutral:``};function Y(e,t,r=oe[t]){return`<span class="result-badge result-badge--${t}"${r?` title="${n(r)}"`:``}>${e}</span>`}function se(e){return e==null?``:`<span class="match-grid__rings" title="Ringar">${e}</span>`}function ce(e){let t=e.flat().map(e=>n(T(e.kaster))).filter(Boolean);return t.length?t.join(` / `):`–`}async function le(e){let[{data:t,error:r},i]=await Promise.all([te(e),D(e)]);if(r){let e=document.createElement(`p`);return e.className=`text-muted`,e.textContent=`Kunne ikkje laste kampar.`,e}let a=t,o=[...new Set(a.map(e=>e.kamp?.stevneid).filter(e=>e!=null))],s=await N(o),c=a.filter(e=>e.kamp?.stevne?.erfullfort===!1).sort((e,t)=>K(e)-K(t)||(e.kamp?.runde_nummer??0)-(t.kamp?.runde_nummer??0)),l=a.filter(e=>e.kamp?.stevne?.erfullfort===!0).sort((e,t)=>(t.kamp?.stevne?.dato??``).localeCompare(e.kamp?.stevne?.dato??``)||K(e)-K(t)||(e.kamp?.runde_nummer??0)-(t.kamp?.runde_nummer??0)),u=e=>(e.kamp?.spelarar??[]).some(e=>(e.omgangar?.length??0)>0),d=t=>{let n=re(t.kamp,e,s);switch(n.kind){case`walkover`:return Y(`21 – 0`,`win`,`Vunne på walkover`);case`placement`:return Y(`${n.placement}. plass`,n.placement>=3?`loss`:`win`,`Plassering i kampen: ${n.placement}`);case`score`:{let{me:e,them:t}=n;return n.confirmed?Y(`${e} – ${t}`,e>t?`win`:e<t?`loss`:`draw`):Y(`${e} – ${t}`,`neutral`,`Ikkje stadfesta`)}default:return Y(`–`,`neutral`)}},f=e=>{let t=e.kamp;return t?.er_walkover?``:t?.er_bekreftet??!1?u(e)?L(t?.id??``,I(),`scoreboard-btn--stats`):``:L(t?.id??``,I(),`scoreboard-btn--touch`)},p=t=>{let n=t.kamp,{others:r}=R(n,e,s),i=n?.er_walkover&&ne(r[0]);return{slot:`<span class="match-grid__round">R${n?.runde_nummer??``} /</span> B${n?.bane_nummer??``}`,name:i?`<span class="match-grid__bye">Walkover</span>`:ce(r),result:d(t),stats:f(t)}},m=e=>J([`R / B`,`Motstandar`,`Resultat`,``],e.map(e=>p(e))),h=e=>{let t=G.map(({key:t,label:n})=>({label:n,matches:e.filter(e=>e.kamp?.fase===t)})).filter(e=>e.matches.length),r=e.filter(e=>!G.some(t=>t.key===e.kamp?.fase));return[...t.map(({label:e,matches:t})=>`
      <p class="match-grid__phase">${n(q(t[0],e))}</p>
      ${m(t)}`),...r.length?[m(r)]:[]].join(``)},g=e=>e.length?[...F(e,e=>e.kamp?.stevneid??`unknown`).values()].map(e=>`
      <p class="match-grid__stevne">${n(e[0]?.kamp?.stevne?.navn??``)}</p>
      ${h(e)}`).join(``):null,_=g(c),v=g(l),y=i.data.filter(e=>e.fase===`innledende`),b=y.filter(e=>e.stevne?.erfullfort===!1).sort((e,t)=>(e.bane_nummer??0)-(t.bane_nummer??0)),x=y.filter(e=>e.stevne?.erfullfort===!0).sort((e,t)=>(t.stevne?.dato??``).localeCompare(e.stevne?.dato??``)||(e.bane_nummer??0)-(t.bane_nummer??0)),S=e=>`#/stevne/${e.stevneid}/innledende`,C=t=>{let r=t.deltakarar.find(t=>t.kasterid===e),i=t.deltakarar.filter(t=>t.kasterid!==e).map(e=>n(T(e.kaster))),a=t.er_bekreftet??!1;return{slot:`B${t.bane_nummer??``}`,name:i.length?i.join(` / `):`–`,result:a?Y(r?.poeng==null?`–`:String(r.poeng),`neutral`):`<a href="${S(t)}" class="btn btn-sm btn-primary">Opne bane</a>`,stats:a?se(r?.antall_ringer):``}},w=e=>e.length?[...F(e,e=>e.stevneid??`unknown`).values()].map(e=>`
      <p class="match-grid__stevne">${n(`${e[0]?.stevne?.navn??``} – X-kast`)}</p>
      ${J([`Bane`,`Medspelarar`,`Poeng`,`R`],e.map(e=>C(e)))}`).join(``):null,E=w(b),O=w(x),k=[_,E].filter(Boolean).join(``),A=[v,O].filter(Boolean).join(``);return P({tabs:[{id:`active`,label:`Aktive (${c.length+b.length})`,panel:W(k||`<p class="text-muted">Ingen aktive kampar.</p>`)},{id:`completed`,label:`Ferdige (${l.length+x.length})`,panel:W(A||`<p class="text-muted">Ingen ferdige kampar enno.</p>`)}]})}async function ue(e,t){let n=U(e,t,`Kampar / X-kast`);if(!n)return;let r=await le(n.throwerId);n.slot.replaceChildren(r)}async function de(e){let{data:t,error:n}=await h(e),r=new Map;if(n){let e=document.createElement(`p`);return e.className=`text-muted`,e.textContent=`Kunne ikkje laste påmeldingar.`,{node:e,registeredMap:r}}let i=t.filter(e=>e.stevne?.erfullfort!==!0);if(!i.length)return{node:g(`Ingen påmeldingar enno.`),registeredMap:r};let a=[...i].sort((e,t)=>(e.stevne?.dato??``).localeCompare(t.stevne?.dato??``)),o=document.createElement(`div`);o.className=`stevne-kort-liste`;for(let e of a){let t=e.stevne,n=t?.id;n!=null&&r.set(n,e.id),t&&o.appendChild(C(t,{href:n==null?`#`:`#/stevne/${n}/info`,registrationSlotId:n??void 0}))}return{node:o,registeredMap:r}}async function fe(e,t){let n=U(e,t,`Påmeldingar`);if(!n)return;let{node:r,registeredMap:i}=await de(n.throwerId);n.slot.replaceChildren(r),m(e,n.throwerId,i)}async function pe(n){let{data:r,error:i}=await e.from(`bruker_profil`).select(`varsle_stevne_start, varsle_kamp_opprettet`).eq(`id`,n).maybeSingle();return i&&t(`getNotificationPreferences`,i),{data:r,error:i}}async function me(n,r,i){let a=r===`varsle_stevne_start`?{varsle_stevne_start:i}:{varsle_kamp_opprettet:i},{error:o}=await e.from(`bruker_profil`).update(a).eq(`id`,n);return o&&t(`updateNotificationPreference`,o),{error:o}}function he(e){return`
    <div class="form-check form-switch mb-2">
      <input class="form-check-input" type="checkbox" role="switch" id="varsle-stevne-start"${e.varsle_stevne_start?` checked`:``}>
      <label class="form-check-label" for="varsle-stevne-start">Varsle når eit stevne startar</label>
    </div>
    <div class="form-check form-switch">
      <input class="form-check-input" type="checkbox" role="switch" id="varsle-kamp-opprettet"${e.varsle_kamp_opprettet?` checked`:``}>
      <label class="form-check-label" for="varsle-kamp-opprettet">Varsle når kampar for meg blir oppretta</label>
    </div>`}function ge(e,t){for(let[n,r]of[[`varsle-stevne-start`,`varsle_stevne_start`],[`varsle-kamp-opprettet`,`varsle_kamp_opprettet`]]){let i=e.querySelector(`#${n}`);i&&i.addEventListener(`change`,async()=>{let e=i.checked;i.disabled=!0,e&&await c();let{error:n}=await me(t,r,e);i.disabled=!1,n&&(i.checked=!e,y(`Kunne ikkje lagre varslingsinnstilling: ${o(n)}`,`error`))})}}async function _e(e,t){let n=_.isNativePlatform();if(e.innerHTML=`
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
    </div>`,!n)return;let r=e.querySelector(`[data-slot="notifications"]`),{data:i}=await pe(t.user.id);if(!i){r.innerHTML=`<p class="text-muted">Kunne ikkje laste varslingsinnstillingar.</p>`;return}r.innerHTML=he(i),ge(e,t.user.id)}var X=`Resultater og statistikk for koblet utøver blir ikkje slettet.`;async function ve(e){let{data:t,error:r}=await O(e);return r||!t?``:`
    <h5 class="card-title">Kontoen er koblet til utøvarprofil</h5>
    <p class="mb-1"><strong>${n(T(t))}</strong> · ${n(t.klubb?.navn??``)}</p>
    <a href="#/kastere/${E(t)}" class="btn btn-sm btn-outline-primary mt-1">Vis profil</a>`}function ye(e){let t=e?`Bytt passord`:`Opprett passord`;return`
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
      <tbody>${e.map(e=>{let i=e.id===t?`<span class="badge bg-secondary">deg</span>`:`<button class="btn btn-sm btn-outline-primary" data-login-email="${n(e.epost)}">Logg inn</button>`;return`<tr>
      <td class="linked-accounts-table__email">${n(e.epost)}</td>
      <td class="linked-accounts-table__date">${n(r(e.opprettet_at))}</td>
      <td class="text-end linked-accounts-table__actions">${i}</td>
    </tr>`}).join(``)}</tbody>
    </table>`}function xe(e){e.querySelector(`#password-form`).addEventListener(`submit`,async n=>{n.preventDefault();let r=n.target,i=e.querySelector(`#ko-password-error`);i.classList.add(`d-none`);let s=e.querySelector(`#ko-password`).value;if(s!==e.querySelector(`#ko-password2`).value){i.textContent=`Passorda er ikkje like.`,i.classList.remove(`d-none`);return}let c=r.querySelector(`[type=submit]`);c.disabled=!0;let{error:l}=await a(s);if(c.disabled=!1,l){t(`minsideKonto.updatePassword`,l),i.textContent=`Kunne ikkje endre passord: ${o(l)}`,i.classList.remove(`d-none`);return}y(`Passordet er endra.`,`success`),r.reset()})}function Se(e){e.querySelector(`[data-slot="accounts"]`).addEventListener(`click`,async e=>{let t=e.target.closest(`[data-login-email]`);t&&(await s(),location.hash=`#/logginn?email=${encodeURIComponent(t.dataset.loginEmail)}`)})}function Z(e,t){e.querySelector(`#delete-own-account`).addEventListener(`click`,async()=>{if(!await v({title:`Slette kontoen?`,message:`Innloggingskontoen ${t.user.email??``} vert sletta permanent. ${X}`,confirmText:`Slett konto`,danger:!0}))return;let{error:e}=await ee(t.user.id);if(e){y(`Kunne ikkje slette kontoen: ${o(e)}`,`error`);return}try{await s()}catch{}location.hash=`#/logginn`})}async function Ce(e,n){let r=n.status===`godkjent`?n.profil?.kasterid??null:null,i=r!=null,a=n.user.identities?.some(e=>e.provider===`email`)??!0;if(e.innerHTML=`
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
      </li>`).join(``)}</ul>`}async function $(e,r){w(()=>$(e,r));let i=String(r.tab??`kampar`);e.replaceChildren(b(`Laster min side…`));try{let t=await u();if(!t){location.hash=`#/logginn`;return}let{profil:r,user:a}=t,o=r?.kobling_status??`ingen`,s=i===`varslingar`?`innstillingar`:i,c=we.has(s)?s:`kampar`;e.innerHTML=`
      <div class="mypage-container">
        <div class="mypage-head">
          <div>
            <h2 class="mb-1">Min side</h2>
            <p class="text-muted mb-0">${n(a.email??``)}</p>
          </div>
          <div data-slot="logout"></div>
        </div>
        ${Ee(c)}
        <div id="minside-subpage"></div>
      </div>`,e.querySelector(`[data-slot="logout"]`).appendChild(M());let l=e.querySelector(`#minside-subpage`);await Te[c](l,{user:a,profil:r,status:o})}catch(n){t(`minside.render`,n),e.replaceChildren(x(`Kunne ikkje laste min side.`))}}export{$ as render};