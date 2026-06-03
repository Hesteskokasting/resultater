import{G as e,W as t,ct as n,g as r,i,nt as a,q as o,st as s}from"./index-CK1EzvEs.js";import{o as c,r as l}from"./kasterService-DxeHrfgV.js";import{t as u}from"./LoadingState-RVZNML7E.js";import{t as d}from"./EmptyState-a5aDhc-8.js";import{p as f}from"./kampService-f05Z1UJP.js";import{t as p}from"./Tabs-Cp2ZiQNF.js";import{o as m}from"./pameldingService-4H0okK4c.js";function h(e){let t=document.createElement(`div`);return t.innerHTML=e,t}var g={admin:`Administrator`,klubbadmin:`Klubbadministrator`,bruker:`Brukar`};function _(e){return`
    ${e===`avvist`?`<div class="alert alert-warning">Koblingforespørselen din vart avvist. Du kan sende ein ny.</div>`:``}
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">Koble til utøvarprofil</h5>
        <p class="card-text text-muted">Søk etter deg sjølv i registeret og send ein forespørsel. Etter godkjenning kan du melde deg på stevner.</p>
        <input type="search" id="kaster-sok" class="form-control mb-2" placeholder="Søk på navn…">
        <div id="kaster-treff" class="list-group mb-2"></div>
        <div id="kasting-feil" class="alert alert-danger d-none"></div>
      </div>
    </div>`}function v(){return`<div class="alert alert-info mb-4">Koblingforespørselen din ventar på godkjenning frå ein administrator.</div>`}async function y(e){let{data:r,error:i}=await l(e);return i||!r?``:`
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">Kobla til utøvarprofil</h5>
        <p class="mb-1"><strong>${t(s(r))}</strong> · ${t(r.klubb?.navn??``)}</p>
        <a href="#/kastere/${n(r)}" class="btn btn-sm btn-outline-primary mt-1">Sjå profil</a>
      </div>
    </div>`}async function b(e){let{data:n,error:r}=await m(e);return r?`<p class="text-muted">Kunne ikkje laste påmeldingar.</p>`:n.length?`
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">Påmeldingar</h5>
        <table class="table table-sm">
          <thead><tr><th>Stevne</th><th>Dato</th><th></th></tr></thead>
          <tbody>${[...n].sort((e,t)=>(e.stevne?.dato??``).localeCompare(t.stevne?.dato??``)).map(e=>{let n=o(e.stevne?.dato);return`<tr>
      <td><a href="#/stevne/${e.stevne?.id??``}/pamelding">${t(e.stevne?.navn??``)}</a></td>
      <td>${t(n)}</td>
      <td><a href="#/stevne/${e.stevne?.id??``}/pamelding" class="btn btn-sm btn-outline-danger">Meld av</a></td>
    </tr>`}).join(``)}</tbody>
        </table>
      </div>
    </div>`:`<p class="empty-state">Ingen påmeldingar enno.</p>`}async function x(e){let{data:n,error:r}=await f(e);if(r){let e=document.createElement(`p`);return e.className=`text-muted`,e.textContent=`Kunne ikkje laste kampar.`,e}let i=n.filter(e=>!e.kamp?.er_walkover),a=i.filter(e=>e.kamp?.stevne?.erfullfort===!1&&!e.kamp?.er_bekreftet).sort((e,t)=>(e.kamp?.runde_nummer??0)-(t.kamp?.runde_nummer??0)),o=i.filter(e=>e.kamp?.er_bekreftet).sort((e,t)=>(e.kamp?.runde_nummer??0)-(t.kamp?.runde_nummer??0)),s=(n,r)=>{let i=n.kamp,a=(i?.spelarar??[]).find(t=>t.kasterid!==e),o=a?.kaster?t(`${a.kaster.fornavn} ${a.kaster.etternavn}`):`–`;return`<tr>
      <td>R${i?.runde_nummer??``} / B${i?.bane_nummer??``}</td>
      <td>${o}</td>
      <td>${r}</td>
    </tr>`},c=(e,n)=>{if(!e.length)return null;let r=new Map;for(let t of e){let e=t.kamp?.stevneid??`ukjent`,n=t.kamp?.stevne?.navn??``;r.has(e)||r.set(e,{navn:n,kampar:[]}),r.get(e).kampar.push(t)}return[...r.values()].map(({navn:e,kampar:r})=>`
      <p class="fw-semibold mb-1 mt-2">${t(e)}</p>
      <table class="table table-sm mb-3"><thead><tr><th>Runde/Bane</th><th>Motstandar</th><th></th></tr></thead><tbody>
        ${r.map(e=>s(e,n(e))).join(``)}
      </tbody></table>`).join(``)},l=c(a,e=>`<a href="#/kamp/${e.kamp?.id??``}" class="btn btn-sm btn-primary">Scoreboard</a>`),u=c(o,e=>`<a href="#/kamp/${e.kamp?.id??``}" class="btn btn-sm btn-outline-secondary">Sjå kamp</a>`),d=document.createElement(`div`);d.className=`card mb-4`,d.id=`mine-kampar-seksjon`;let m=document.createElement(`div`);m.className=`card-body`;let g=document.createElement(`h5`);return g.className=`card-title`,g.textContent=`Mine kampar`,m.appendChild(g),m.appendChild(p({tabs:[{id:`kommande`,label:`Kommande (${a.length})`,panel:h(l??`<p class="text-muted">Ingen kommande kampar.</p>`)},{id:`ferdige`,label:`Ferdige (${o.length})`,panel:h(u??`<p class="text-muted">Ingen ferdige kampar enno.</p>`)}]})),d.appendChild(m),d}function S(e,n){let i=null,a=null,o=e.querySelector(`#kaster-sok`),l=e.querySelector(`#kaster-treff`),u=e.querySelector(`#kasting-feil`);o.addEventListener(`input`,()=>{i!==null&&clearTimeout(i);let e=o.value.trim().toLowerCase();if(e.length<2){l.innerHTML=``;return}i=setTimeout(async()=>{if(!a){let{data:e}=await c();a=e}let n=a.filter(t=>t.fornavn.toLowerCase().includes(e)||t.etternavn.toLowerCase().includes(e)).slice(0,8);if(!n.length){let e=d(`Ingen treff.`);e.classList.add(`small`),l.replaceChildren(e);return}l.innerHTML=n.map(e=>`<button class="list-group-item list-group-item-action" data-id="${e.id}">
          ${t(s(e))} <span class="text-muted small">· ${t(e.klubb?.navn??``)}</span>
        </button>`).join(``)},300)}),l.addEventListener(`click`,async e=>{let t=e.target.closest(`[data-id]`);if(!t)return;u.classList.add(`d-none`);let{error:i}=await r(n,Number(t.dataset.id));if(i){u.textContent=`Kunne ikkje sende forespørsel.`,u.classList.remove(`d-none`);return}location.reload()})}async function C(n){n.replaceChildren(u(`Laster min side…`));try{let e=await i();if(!e){location.hash=`#/logginn`;return}let{profil:r,user:a}=e,o=r?.kobling_status??`ingen`,s=r?g[r.rolle]:`Ukjent`,c=`
      <div class="minside-container">
        <h2 class="mb-1">Min side</h2>
        <p class="text-muted mb-4">${t(a.email??``)} · <span class="badge bg-secondary">${t(s)}</span></p>`;if(o===`ingen`||o===`avvist`)c+=_(o);else if(o===`venter`)c+=v();else if(o===`godkjent`&&r?.kasterid){let e=r.kasterid,[t,i,o]=await Promise.all([y(e),b(a.id),x(e)]);c+=t+i,c+=`</div>`,n.innerHTML=c,n.querySelector(`.minside-container`).appendChild(o);return}c+=`</div>`,n.innerHTML=c,(o===`ingen`||o===`avvist`)&&S(n,a.id)}catch(t){a(`minside.render`,t),n.replaceChildren(e(`Kunne ikkje laste min side.`))}}export{C as render};