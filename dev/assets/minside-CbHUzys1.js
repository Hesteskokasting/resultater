import{t as e}from"./dist-DIpltt4c.js";import{n as t,t as n}from"./logError-ByTg738k.js";import{C as r,D as i,E as a,Jt as o,K as s,L as c,Qn as l,S as u,Vt as d,W as f,_r as p,ar as m,b as h,f as g,g as _,h as v,or as y,p as b,r as x,rt as S,s as C,t as w,vr as T,xn as E,yr as D,z as O}from"./index-DSCLt71t.js";import{d as k,r as A}from"./kasterService-BN8H2rLx.js";import{t as j}from"./SearchSelect-Cs-6ANXn.js";import{n as M,r as ee,t as te}from"./accountService-WNbuVeXr.js";import{c as ne,d as N}from"./kampService-ZYPkN8qZ.js";import{n as P,t as F}from"./groupBy-Bg_SEHjk.js";import{t as I}from"./navigationService-Dbfo1qDo.js";import{n as L}from"./ScoreboardButton-cO_q_Bk1.js";function R(e,t,n){let r=(e?.spelarar??[]).filter(e=>e.kasterid!=null),i={};for(let t of r){let r=e?.stevneid==null?void 0:n[`${e.stevneid}:${t.kasterid}`];r!=null&&(i[t.kasterid]=r)}let a=l(r,i),o=a.findIndex(e=>e.members.some(e=>e.kasterid===t));return{mine:o===-1?[]:a[o]?.members??[],others:a.filter((e,t)=>t!==o).map(e=>e.members)}}function re(e){return!e?.length||e.every(e=>e.kaster==null)}function z(e,t){return m({rep:e[0],members:e},t)}function ie(e,t,n){let r=e?.er_bekreftet??!1,{mine:i,others:a}=R(e,t,n);if(e?.er_walkover)return{kind:`walkover`};if(r&&(e?.er_tre_spelarar||a.length>1)){let e=i.find(e=>e.kasterid===t)?.kamp_plassering;return e==null?{kind:`unknown`}:{kind:`placement`,placement:e}}let o=a[0];return!i.length||!o?.length?{kind:`unknown`}:{kind:`score`,me:z(i,r),them:z(o,r),confirmed:r}}function ae(e){return`
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
    </div>`}function oe(){return`
    <div class="alert alert-info mb-4">
      <p class="mb-1">Koblingforespørselen din<span id="pending-name"></span> ventar på godkjenning frå ein administrator.</p>
      <p class="mb-1 small">Mens du ventar kan du klikke deg inn på dei forskjellige sidene for å gjere deg kjent med det nye systemet.</p>
      <p class="mb-0 small">Feil kobling? Send e-post til <a href="mailto:kontakt@hesteskokasting.no">kontakt@hesteskokasting.no</a></p>
    </div>`}function B(e,t){let n=e.querySelector(`#pending-name`);!n||t==null||(async()=>{let{data:e}=await k(t);e&&(n.textContent=` for ${u(e)}`)})()}function V(e,t){let n=e.querySelector(`#thrower-error`),a=[],o=null;o=j({slot:e.querySelector(`#thrower-search-slot`),loadItems:async()=>{let{data:e}=await A();return a=e.map(e=>({id:e.id,label:r(e),sublabel:e.klubb?.navn??null})),a},placeholder:`Søk på navn…`,onSelect:e=>{e!=null&&(async()=>{n.classList.add(`d-none`);let r=a.find(t=>t.id===e),s=r?r.label+(r.sublabel?` (${r.sublabel})`:``):``;if(!await _({title:`Er dette deg?`,message:`Send koblingforespørsel for ${s}?`,confirmText:`Send forespørsel`})){o?.setValue(null);return}let{error:c}=await S(t,e);if(c){n.textContent=`Kunne ikkje sende forespørsel.`,n.classList.remove(`d-none`);return}i(),await x()})()}})}function H(e,t){return t.status===`godkjent`&&t.profil?.kasterid!=null?t.profil.kasterid:t.status===`venter`?(e.innerHTML=oe(),B(e,t.profil?.kobling_kasterid??null),null):(e.innerHTML=ae(t.status),V(e,t.user.id),null)}function U(e,t,n){let r=H(e,t);return r==null?null:(e.innerHTML=`
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">${g(n)}</h5>
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
    </div>`).join(``)}</div>`}var se={win:`Vunne`,loss:`Tapt`,draw:`Uavgjort`,neutral:``};function Y(e,t,n=se[t]){return`<span class="result-badge result-badge--${t}"${n?` title="${g(n)}"`:``}>${e}</span>`}function ce(e){return e==null?``:`<span class="match-grid__rings" title="Ringar">${e}</span>`}function le(e){let t=e.map(e=>e.map(e=>g(u(e.kaster))).filter(Boolean).map(e=>`<span class="match-grid__name-line">${e}</span>`).join(``)).filter(Boolean);return t.length?t.map(e=>`<span class="match-grid__side">${e}</span>`).join(``):`–`}async function ue(e){let[{data:t,error:n},r]=await Promise.all([ne(e),o(e)]);if(n){let e=document.createElement(`p`);return e.className=`text-muted`,e.textContent=`Kunne ikkje laste kampar.`,e}let i=t,a=[...new Set(i.map(e=>e.kamp?.stevneid).filter(e=>e!=null))],s=await N(a),c=i.filter(e=>e.kamp?.stevne?.erfullfort===!1).sort((e,t)=>K(e)-K(t)||(e.kamp?.runde_nummer??0)-(t.kamp?.runde_nummer??0)),l=i.filter(e=>e.kamp?.stevne?.erfullfort===!0).sort((e,t)=>(t.kamp?.stevne?.dato??``).localeCompare(e.kamp?.stevne?.dato??``)||K(e)-K(t)||(e.kamp?.runde_nummer??0)-(t.kamp?.runde_nummer??0)),d=e=>(e.kamp?.spelarar??[]).some(e=>(e.omgangar?.length??0)>0),f=t=>{let n=ie(t.kamp,e,s);switch(n.kind){case`walkover`:return Y(`21 – 0`,`win`,`Vunne på walkover`);case`placement`:return Y(`${n.placement}. plass`,n.placement>=3?`loss`:`win`,`Plassering i kampen: ${n.placement}`);case`score`:{let{me:e,them:t}=n;return n.confirmed?Y(`${e} – ${t}`,e>t?`win`:e<t?`loss`:`draw`):Y(`${e} – ${t}`,`neutral`,`Ikkje stadfesta`)}default:return Y(`–`,`neutral`)}},p=e=>{let t=e.kamp;return t?.er_walkover?``:t?.er_bekreftet??!1?d(e)?L(t?.id??``,I(),`scoreboard-btn--stats`):``:L(t?.id??``,I(),`scoreboard-btn--touch`)},m=t=>{let n=t.kamp,{others:r}=R(n,e,s),i=n?.er_walkover&&re(r[0]);return{slot:`<span class="match-grid__round">R${n?.runde_nummer??``} /</span> B${n?.bane_nummer??``}`,name:i?`<span class="match-grid__bye">Walkover</span>`:le(r),result:f(t),stats:p(t)}},h=e=>J([`<span class="visually-hidden">Runde og bane</span>`,`Motstandar`,`Resultat`,``],e.map(e=>m(e))),_=e=>{let t=G.map(({key:t,label:n})=>({label:n,matches:e.filter(e=>e.kamp?.fase===t)})).filter(e=>e.matches.length),n=e.filter(e=>!G.some(t=>t.key===e.kamp?.fase));return[...t.map(({label:e,matches:t})=>`
      <p class="match-grid__phase">${g(q(t[0],e))}</p>
      ${h(t)}`),...n.length?[h(n)]:[]].join(``)},v=e=>e.length?[...F(e,e=>e.kamp?.stevneid??`unknown`).values()].map(e=>`
      <p class="match-grid__stevne">${g(e[0]?.kamp?.stevne?.navn??``)}</p>
      ${_(e)}`).join(``):null,y=v(c),b=v(l),x=r.data.filter(e=>e.fase===`innledende`),S=x.filter(e=>e.stevne?.erfullfort===!1).sort((e,t)=>(e.bane_nummer??0)-(t.bane_nummer??0)),C=x.filter(e=>e.stevne?.erfullfort===!0).sort((e,t)=>(t.stevne?.dato??``).localeCompare(e.stevne?.dato??``)||(e.bane_nummer??0)-(t.bane_nummer??0)),w=e=>`#/stevne/${e.stevneid}/innledende`,T=t=>{let n=t.deltakarar.find(t=>t.kasterid===e),r=t.deltakarar.filter(t=>t.kasterid!==e).map(e=>g(u(e.kaster))),i=t.er_bekreftet??!1;return{slot:`B${t.bane_nummer??``}`,name:r.length?r.join(` / `):`–`,result:i?Y(n?.poeng==null?`–`:String(n.poeng),`neutral`):`<a href="${w(t)}" class="btn btn-sm btn-primary">Opne bane</a>`,stats:i?ce(n?.antall_ringer):``}},E=e=>e.length?[...F(e,e=>e.stevneid??`unknown`).values()].map(e=>`
      <p class="match-grid__stevne">${g(`${e[0]?.stevne?.navn??``} – X-kast`)}</p>
      ${J([`<span class="visually-hidden">Bane</span>`,`Medspelarar`,`Poeng`,`<span class="visually-hidden">Ringar</span>`],e.map(e=>T(e)))}`).join(``):null,D=E(S),O=E(C),k=[y,D].filter(Boolean).join(``),A=[b,O].filter(Boolean).join(``);return P({tabs:[{id:`active`,label:`Aktive (${c.length+S.length})`,panel:W(k||`<p class="text-muted">Ingen aktive kampar.</p>`)},{id:`completed`,label:`Ferdige (${l.length+C.length})`,panel:W(A||`<p class="text-muted">Ingen ferdige kampar enno.</p>`)}]})}async function de(e,t){let n=U(e,t,`Kampar / X-kast`);if(!n)return;let r=await ue(n.throwerId);n.slot.replaceChildren(r)}async function fe(e){let{data:t,error:n}=await E(e),r=new Map;if(n){let e=document.createElement(`p`);return e.className=`text-muted`,e.textContent=`Kunne ikkje laste påmeldingar.`,{node:e,registeredMap:r}}let i=t.filter(e=>e.stevne?.erfullfort!==!0);if(!i.length)return{node:p(`Ingen påmeldingar enno.`),registeredMap:r};let a=[...i].sort((e,t)=>(e.stevne?.dato??``).localeCompare(t.stevne?.dato??``)),o=document.createElement(`div`);o.className=`stevne-card-list`;for(let e of a){let t=e.stevne,n=t?.id;n!=null&&r.set(n,e.id),t&&o.appendChild(C(t,{href:n==null?`#`:`#/stevne/${n}/info`,registrationSlotId:n??void 0}))}return{node:o,registeredMap:r}}async function pe(e,t){let n=U(e,t,`Påmeldingar`);if(!n)return;let{node:r,registeredMap:i}=await fe(n.throwerId);n.slot.replaceChildren(r),b(e,n.throwerId,i)}async function me(e){let{data:r,error:i}=await t.from(`bruker_profil`).select(`varsle_stevne_start, varsle_kamp_opprettet`).eq(`id`,e).maybeSingle();return i&&n(`getNotificationPreferences`,i),{data:r,error:i}}async function he(e,r,i){let a=r===`varsle_stevne_start`?{varsle_stevne_start:i}:{varsle_kamp_opprettet:i},{error:o}=await t.from(`bruker_profil`).update(a).eq(`id`,e);return o&&n(`updateNotificationPreference`,o),{error:o}}function ge(e){return`
    <div class="form-check form-switch mb-2">
      <input class="form-check-input" type="checkbox" role="switch" id="varsle-stevne-start"${e.varsle_stevne_start?` checked`:``}>
      <label class="form-check-label" for="varsle-stevne-start">Varsle når eit stevne startar</label>
    </div>
    <div class="form-check form-switch">
      <input class="form-check-input" type="checkbox" role="switch" id="varsle-kamp-opprettet"${e.varsle_kamp_opprettet?` checked`:``}>
      <label class="form-check-label" for="varsle-kamp-opprettet">Varsle når kampar for meg blir oppretta</label>
    </div>`}function _e(e,t){for(let[n,r]of[[`varsle-stevne-start`,`varsle_stevne_start`],[`varsle-kamp-opprettet`,`varsle_kamp_opprettet`]]){let i=e.querySelector(`#${n}`);i&&i.addEventListener(`change`,async()=>{let e=i.checked;i.disabled=!0,e&&await s();let{error:n}=await he(t,r,e);i.disabled=!1,n&&(i.checked=!e,v(`Kunne ikkje lagre varslingsinnstilling: ${d(n)}`,`error`))})}}async function ve(t,n){let r=e.isNativePlatform();if(t.innerHTML=`
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
    <p class="mb-1"><strong>${g(u(t))}</strong> · ${g(t.klubb?.navn??``)}</p>
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
      <tbody>${e.map(e=>{let n=e.id===t?`<span class="badge bg-secondary">deg</span>`:`<button class="btn btn-sm btn-outline-primary" data-login-email="${g(e.epost)}">Logg inn</button>`;return`<tr>
      <td class="linked-accounts-table__email">${g(e.epost)}</td>
      <td class="linked-accounts-table__date">${g(y(e.opprettet_at))}</td>
      <td class="text-end linked-accounts-table__actions">${n}</td>
    </tr>`}).join(``)}</tbody>
    </table>`}function Se(e){e.querySelector(`#password-form`).addEventListener(`submit`,async t=>{t.preventDefault();let r=t.target,i=e.querySelector(`#ko-password-error`);i.classList.add(`d-none`);let a=e.querySelector(`#ko-password`).value;if(a!==e.querySelector(`#ko-password2`).value){i.textContent=`Passorda er ikkje like.`,i.classList.remove(`d-none`);return}let o=r.querySelector(`[type=submit]`);o.disabled=!0;let{error:s}=await O(a);if(o.disabled=!1,s){n(`minsideKonto.updatePassword`,s),i.textContent=`Kunne ikkje endre passord: ${d(s)}`,i.classList.remove(`d-none`);return}v(`Passordet er endra.`,`success`),r.reset()})}function Z(e){e.querySelector(`[data-slot="accounts"]`).addEventListener(`click`,async e=>{let t=e.target.closest(`[data-login-email]`);t&&(await c(),location.hash=`#/logginn?email=${encodeURIComponent(t.dataset.loginEmail)}`)})}function Ce(e,t){e.querySelector(`#delete-own-account`).addEventListener(`click`,async()=>{if(!await _({title:`Slette kontoen?`,message:`Innloggingskontoen ${t.user.email??``} vert sletta permanent. ${X}`,confirmText:`Slett konto`,danger:!0}))return;let{error:e}=await te(t.user.id);if(e){v(`Kunne ikkje slette kontoen: ${d(e)}`,`error`);return}try{await c()}catch{}location.hash=`#/logginn`})}async function we(e,t){let r=t.status===`godkjent`?t.profil?.kasterid??null:null,i=r!=null,a=t.user.identities?.some(e=>e.provider===`email`)??!0;if(e.innerHTML=`
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
    </div></div>`,Se(e),Ce(e,t),r==null)return;Z(e);let o=e.querySelector(`[data-slot="thrower"]`),s=e.querySelector(`[data-slot="accounts"]`);try{let[e,n]=await Promise.all([ye(r),M()]);o.innerHTML=e,s.innerHTML=n.error?`<p class="text-muted">Kunne ikkje laste kontoar.</p>`:xe(n.data,t.user.id)}catch(e){n(`minsideKonto.render`,e),s.innerHTML=`<p class="text-muted">Kunne ikkje laste kontoar.</p>`}}var Q=[{key:`kampar`,label:`Kampar`},{key:`pameldingar`,label:`Påmeldingar`},{key:`innstillingar`,label:`Innstillingar`},{key:`konto`,label:`Konto`}],Te=new Set([`innstillingar`,`konto`]),Ee={kampar:de,pameldingar:pe,innstillingar:ve,konto:we};function De(e,t){return`<ul class="nav nav-underline mypage-nav mb-3">${e.map(({key:e,label:n})=>`
      <li class="nav-item">
        <a class="nav-link${t===e?` active`:``}"
           href="#/minside/${e}">${n}</a>
      </li>`).join(``)}</ul>`}async function $(e,t){w(()=>$(e,t));let r=String(t.tab??`kampar`);e.replaceChildren(D(`Laster min side…`));try{let t=await a();if(!t){location.hash=`#/logginn`;return}let{profil:n,user:i}=t,o=n?.kobling_status??`ingen`,s=f(n?.role),c=s?Q.filter(e=>Te.has(e.key)):Q,l=r===`varslingar`?`innstillingar`:r,u=c.find(e=>e.key===l);if(!u&&s){location.replace(`#/admin`);return}let d=u?.key??`kampar`;e.innerHTML=`
      <div class="mypage-container">
        <div class="mypage-head">
          <div>
            <h2 class="mb-1">Min side</h2>
            <p class="text-muted mb-0">${g(i.email??``)}</p>
          </div>
          <div data-slot="logout"></div>
        </div>
        ${De(c,d)}
        <div id="minside-subpage"></div>
      </div>`,e.querySelector(`[data-slot="logout"]`).appendChild(ee());let p=e.querySelector(`#minside-subpage`);await Ee[d](p,{user:i,profil:n,status:o})}catch(t){n(`minside.render`,t),e.replaceChildren(T(`Kunne ikkje laste min side.`))}}export{$ as render};