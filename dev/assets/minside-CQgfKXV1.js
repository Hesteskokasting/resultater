import{t as e}from"./dist-Ck9YJ66N.js";import{n as t,t as n}from"./logError-Cjb5zwtM.js";import{f as r,r as i,u as a}from"./authService-9qLZxJYd.js";import{$ as o,Q as s,ht as c,mt as l,t as u,tt as d,u as f,x as p}from"./index-BxVUje1N.js";import{r as m,u as h}from"./kasterService-CGwZfLdY.js";import{t as g}from"./LoadingState-DU0ZcPlb.js";import{t as _}from"./EmptyState-DXltqcjg.js";import{d as v,m as y}from"./kampService-C_WXpEG0.js";import{t as b}from"./Tabs-BJyEwSRZ.js";import{t as x}from"./errorMessage-yUE0tzTK.js";async function S(e){let{data:r,error:i}=await t.from(`bruker_profil`).select(`varsle_stevne_start, varsle_kamp_opprettet`).eq(`id`,e).maybeSingle();return i&&n(`getNotificationPreferences`,i),{data:r,error:i}}async function C(e,r,i){let a=r===`varsle_stevne_start`?{varsle_stevne_start:i}:{varsle_kamp_opprettet:i},{error:o}=await t.from(`bruker_profil`).update(a).eq(`id`,e);return o&&n(`updateNotificationPreference`,o),{error:o}}function w(e){let t=document.createElement(`div`);return t.innerHTML=e,t}var T={admin:`Administrator`,klubbadmin:`Klubbadministrator`,bruker:`Brukar`};function E(e){return`
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">Varslingar</h5>
        <div class="form-check form-switch mb-2">
          <input class="form-check-input" type="checkbox" role="switch" id="varsle-stevne-start"${e.varsle_stevne_start?` checked`:``}>
          <label class="form-check-label" for="varsle-stevne-start">Varsle når eit stevne startar</label>
        </div>
        <div class="form-check form-switch">
          <input class="form-check-input" type="checkbox" role="switch" id="varsle-kamp-opprettet"${e.varsle_kamp_opprettet?` checked`:``}>
          <label class="form-check-label" for="varsle-kamp-opprettet">Varsle når kampar for meg blir oppretta</label>
        </div>
      </div>
    </div>`}function D(e){return`
    ${e===`avvist`?`<div class="alert alert-warning">Koblingforespørselen din vart avvist. Du kan sende ein ny.</div>`:``}
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">Koble til utøvarprofil</h5>
        <p class="card-text text-muted">Søk etter deg sjølv i registeret og send ein forespørsel. Etter godkjenning kan du melde deg på stevner.</p>
        <input type="search" id="thrower-search" class="form-control mb-2" placeholder="Søk på navn…">
        <div id="thrower-matches" class="list-group mb-2"></div>
        <div id="thrower-error" class="alert alert-danger d-none"></div>
      </div>
    </div>`}function O(){return`<div class="alert alert-info mb-4">Koblingforespørselen din ventar på godkjenning frå ein administrator.</div>`}async function k(e){let{data:t,error:n}=await h(e);return n||!t?``:`
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">Kobla til utøvarprofil</h5>
        <p class="mb-1"><strong>${s(c(t))}</strong> · ${s(t.klubb?.navn??``)}</p>
        <a href="#/kastere/${l(t)}" class="btn btn-sm btn-outline-primary mt-1">Sjå profil</a>
      </div>
    </div>`}async function A(e){let{data:t,error:n}=await f(e);return n?`<p class="text-muted">Kunne ikkje laste påmeldingar.</p>`:t.length?`
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">Påmeldingar</h5>
        <table class="table table-sm">
          <thead><tr><th>Stevne</th><th>Dato</th><th></th></tr></thead>
          <tbody>${[...t].sort((e,t)=>(e.stevne?.dato??``).localeCompare(t.stevne?.dato??``)).map(e=>{let t=d(e.stevne?.dato);return`<tr>
      <td><a href="#/stevne/${e.stevne?.id??``}/pamelding">${s(e.stevne?.navn??``)}</a></td>
      <td>${s(t)}</td>
      <td><a href="#/stevne/${e.stevne?.id??``}/pamelding" class="btn btn-sm btn-outline-danger">Meld av</a></td>
    </tr>`}).join(``)}</tbody>
        </table>
      </div>
    </div>`:`<p class="empty-state">Ingen påmeldingar enno.</p>`}function j(e,t,n,r){let i=n==null?void 0:r[`${n}:${t}`];return e.filter(e=>{if(e.kasterid==null||e.kasterid===t)return!1;let a=n==null?void 0:r[`${n}:${e.kasterid}`];return i==null||a==null||a!==i})}async function M(e){let{data:t,error:n}=await v(e);if(n){let e=document.createElement(`p`);return e.className=`text-muted`,e.textContent=`Kunne ikkje laste kampar.`,e}let r=t.filter(e=>!e.kamp?.er_walkover),i=await y([...new Set(r.map(e=>e.kamp?.stevneid).filter(e=>e!=null))]),a=r.filter(e=>e.kamp?.stevne?.erfullfort===!1).sort((e,t)=>(e.kamp?.runde_nummer??0)-(t.kamp?.runde_nummer??0)),o=r.filter(e=>e.kamp?.stevne?.erfullfort===!0).sort((e,t)=>(e.kamp?.runde_nummer??0)-(t.kamp?.runde_nummer??0)),l=(t,n)=>{let r=t.kamp,a=r?.stevneid,o=j(r?.spelarar??[],e,a,i),l=o.length?o.map(e=>s(c(e.kaster))).join(` / `):`–`;return`<tr>
      <td>R${r?.runde_nummer??``} / B${r?.bane_nummer??``}</td>
      <td>${l}</td>
      <td>${n}</td>
    </tr>`},u=(e,t)=>{if(!e.length)return null;let n=new Map;for(let t of e){let e=t.kamp?.stevneid??`unknown`,r=t.kamp?.stevne?.navn??``;n.has(e)||n.set(e,{name:r,matches:[]}),n.get(e).matches.push(t)}return[...n.values()].map(({name:e,matches:n})=>`
      <p class="fw-semibold mb-1 mt-2">${s(e)}</p>
      <table class="table table-sm mb-3"><thead><tr><th>Runde/Bane</th><th>Motstandar</th><th></th></tr></thead><tbody>
        ${n.map(e=>l(e,t(e))).join(``)}
      </tbody></table>`).join(``)},d=u(a,t=>{if(!t.kamp?.er_bekreftet)return`<a href="#/kamp/${t.kamp?.id??``}" class="btn btn-sm btn-primary" target="_blank" rel="noopener">Scoreboard</a>`;let n=t.kamp.stevneid,r=t.kamp.spelarar?.find(t=>t.kasterid===e)?.score_poeng,a=j(t.kamp.spelarar??[],e,n,i)[0]?.score_poeng;return r==null||a==null?`–`:`<span class="fw-semibold">${r} – ${a}</span>`}),f=u(o,e=>`<a href="#/kamp/${e.kamp?.id??``}" class="btn btn-sm btn-outline-secondary" target="_blank" rel="noopener">Sjå kamp</a>`),p=document.createElement(`div`);p.className=`card mb-4`,p.id=`my-matches-section`;let m=document.createElement(`div`);m.className=`card-body`;let h=document.createElement(`h5`);return h.className=`card-title`,h.textContent=`Mine kampar`,m.appendChild(h),m.appendChild(b({tabs:[{id:`active`,label:`Aktive (${a.length})`,panel:w(d??`<p class="text-muted">Ingen aktive kampar.</p>`)},{id:`completed`,label:`Ferdige (${o.length})`,panel:w(f??`<p class="text-muted">Ingen ferdige kampar enno.</p>`)}]})),p.appendChild(m),p}function N(e,t){let n=null,i=null,a=e.querySelector(`#thrower-search`),o=e.querySelector(`#thrower-matches`),l=e.querySelector(`#thrower-error`);a.addEventListener(`input`,()=>{n!==null&&clearTimeout(n);let e=a.value.trim().toLowerCase();if(e.length<2){o.innerHTML=``;return}n=setTimeout(async()=>{if(!i){let{data:e}=await m();i=e}let t=i.filter(t=>t.fornavn.toLowerCase().includes(e)||t.etternavn.toLowerCase().includes(e)).slice(0,8);if(!t.length){let e=_(`Ingen treff.`);e.classList.add(`small`),o.replaceChildren(e);return}o.innerHTML=t.map(e=>`<button class="list-group-item list-group-item-action" data-id="${e.id}">
          ${s(c(e))} <span class="text-muted small">· ${s(e.klubb?.navn??``)}</span>
        </button>`).join(``)},300)}),o.addEventListener(`click`,async e=>{let n=e.target.closest(`[data-id]`);if(!n)return;l.classList.add(`d-none`);let{error:i}=await r(t,Number(n.dataset.id));if(i){l.textContent=`Kunne ikkje sende forespørsel.`,l.classList.remove(`d-none`);return}location.reload()})}function P(e,t){for(let[n,r]of[[`varsle-stevne-start`,`varsle_stevne_start`],[`varsle-kamp-opprettet`,`varsle_kamp_opprettet`]]){let i=e.querySelector(`#${n}`);i&&i.addEventListener(`change`,async()=>{let e=i.checked;i.disabled=!0,e&&await a();let{error:n}=await C(t,r,e);i.disabled=!1,n&&(i.checked=!e,p(`Kunne ikkje lagre varslingsinnstilling: ${x(n)}`,`error`))})}}async function F(t){u(()=>F(t)),t.replaceChildren(g(`Laster min side…`));try{let n=await i();if(!n){location.hash=`#/logginn`;return}let{profil:r,user:a}=n,o=r?.kobling_status??`ingen`,c=r?T[r.role]:`Ukjent`,l=e.isNativePlatform()?(await S(a.id)).data:null,u=`
      <div class="mypage-container">
        <h2 class="mb-1">Min side</h2>
        <p class="text-muted mb-4">${s(a.email??``)} · <span class="badge bg-secondary">${s(c)}</span></p>`;if(l&&(u+=E(l)),o===`ingen`||o===`avvist`)u+=D(o);else if(o===`venter`)u+=O();else if(o===`godkjent`&&r?.kasterid){let e=r.kasterid,[n,i,o]=await Promise.all([k(e),A(a.id),M(e)]);u+=n+i,u+=`</div>`,t.innerHTML=u,t.querySelector(`.mypage-container`).appendChild(o),l&&P(t,a.id);return}u+=`</div>`,t.innerHTML=u,(o===`ingen`||o===`avvist`)&&N(t,a.id),l&&P(t,a.id)}catch(e){n(`minside.render`,e),t.replaceChildren(o(`Kunne ikkje laste min side.`))}}export{F as render};