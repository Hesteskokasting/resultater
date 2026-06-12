import{G as e,W as t,ct as n,g as r,i,nt as a,q as o,ut as s}from"./index-gM0KgVjM.js";import{o as c,r as l}from"./kasterService-DodP1PLk.js";import{t as u}from"./LoadingState-RVZNML7E.js";import{t as d}from"./EmptyState-a5aDhc-8.js";import{g as f,p}from"./kampService-BGXpkTYM.js";import{t as m}from"./Tabs-D6JHD9IR.js";import{o as h}from"./pameldingService-PYUY7Dla.js";function g(e){let t=document.createElement(`div`);return t.innerHTML=e,t}var _={admin:`Administrator`,klubbadmin:`Klubbadministrator`,bruker:`Brukar`};function v(e){return`
    ${e===`avvist`?`<div class="alert alert-warning">Koblingforespørselen din vart avvist. Du kan sende ein ny.</div>`:``}
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">Koble til utøvarprofil</h5>
        <p class="card-text text-muted">Søk etter deg sjølv i registeret og send ein forespørsel. Etter godkjenning kan du melde deg på stevner.</p>
        <input type="search" id="kaster-sok" class="form-control mb-2" placeholder="Søk på navn…">
        <div id="kaster-treff" class="list-group mb-2"></div>
        <div id="kasting-feil" class="alert alert-danger d-none"></div>
      </div>
    </div>`}function y(){return`<div class="alert alert-info mb-4">Koblingforespørselen din ventar på godkjenning frå ein administrator.</div>`}async function b(e){let{data:r,error:i}=await l(e);return i||!r?``:`
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">Kobla til utøvarprofil</h5>
        <p class="mb-1"><strong>${t(n(r))}</strong> · ${t(r.klubb?.navn??``)}</p>
        <a href="#/kastere/${s(r)}" class="btn btn-sm btn-outline-primary mt-1">Sjå profil</a>
      </div>
    </div>`}async function x(e){let{data:n,error:r}=await h(e);return r?`<p class="text-muted">Kunne ikkje laste påmeldingar.</p>`:n.length?`
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
    </div>`:`<p class="empty-state">Ingen påmeldingar enno.</p>`}async function S(e){let{data:r,error:i}=await p(e);if(i){let e=document.createElement(`p`);return e.className=`text-muted`,e.textContent=`Kunne ikkje laste kampar.`,e}let a=r.filter(e=>!e.kamp?.er_walkover),o=await f([...new Set(a.map(e=>e.kamp?.stevneid).filter(e=>e!=null))]),s=a.filter(e=>e.kamp?.stevne?.erfullfort===!1&&!e.kamp?.er_bekreftet).sort((e,t)=>(e.kamp?.runde_nummer??0)-(t.kamp?.runde_nummer??0)),c=a.filter(e=>e.kamp?.er_bekreftet).sort((e,t)=>(e.kamp?.runde_nummer??0)-(t.kamp?.runde_nummer??0)),l=(r,i)=>{let a=r.kamp,s=a?.stevneid,c=s==null?void 0:o[`${s}:${e}`],l=(a?.spelarar??[]).filter(t=>{if(t.kasterid==null||t.kasterid===e)return!1;let n=s==null?void 0:o[`${s}:${t.kasterid}`];return c==null||n==null||n!==c}),u=l.length?l.map(e=>t(n(e.kaster))).join(` / `):`–`;return`<tr>
      <td>R${a?.runde_nummer??``} / B${a?.bane_nummer??``}</td>
      <td>${u}</td>
      <td>${i}</td>
    </tr>`},u=(e,n)=>{if(!e.length)return null;let r=new Map;for(let t of e){let e=t.kamp?.stevneid??`ukjent`,n=t.kamp?.stevne?.navn??``;r.has(e)||r.set(e,{navn:n,kampar:[]}),r.get(e).kampar.push(t)}return[...r.values()].map(({navn:e,kampar:r})=>`
      <p class="fw-semibold mb-1 mt-2">${t(e)}</p>
      <table class="table table-sm mb-3"><thead><tr><th>Runde/Bane</th><th>Motstandar</th><th></th></tr></thead><tbody>
        ${r.map(e=>l(e,n(e))).join(``)}
      </tbody></table>`).join(``)},d=u(s,e=>`<a href="#/kamp/${e.kamp?.id??``}" class="btn btn-sm btn-primary">Scoreboard</a>`),h=u(c,e=>`<a href="#/kamp/${e.kamp?.id??``}" class="btn btn-sm btn-outline-secondary">Sjå kamp</a>`),_=document.createElement(`div`);_.className=`card mb-4`,_.id=`mine-kampar-seksjon`;let v=document.createElement(`div`);v.className=`card-body`;let y=document.createElement(`h5`);return y.className=`card-title`,y.textContent=`Mine kampar`,v.appendChild(y),v.appendChild(m({tabs:[{id:`kommande`,label:`Kommande (${s.length})`,panel:g(d??`<p class="text-muted">Ingen kommande kampar.</p>`)},{id:`ferdige`,label:`Ferdige (${c.length})`,panel:g(h??`<p class="text-muted">Ingen ferdige kampar enno.</p>`)}]})),_.appendChild(v),_}function C(e,i){let a=null,o=null,s=e.querySelector(`#kaster-sok`),l=e.querySelector(`#kaster-treff`),u=e.querySelector(`#kasting-feil`);s.addEventListener(`input`,()=>{a!==null&&clearTimeout(a);let e=s.value.trim().toLowerCase();if(e.length<2){l.innerHTML=``;return}a=setTimeout(async()=>{if(!o){let{data:e}=await c();o=e}let r=o.filter(t=>t.fornavn.toLowerCase().includes(e)||t.etternavn.toLowerCase().includes(e)).slice(0,8);if(!r.length){let e=d(`Ingen treff.`);e.classList.add(`small`),l.replaceChildren(e);return}l.innerHTML=r.map(e=>`<button class="list-group-item list-group-item-action" data-id="${e.id}">
          ${t(n(e))} <span class="text-muted small">· ${t(e.klubb?.navn??``)}</span>
        </button>`).join(``)},300)}),l.addEventListener(`click`,async e=>{let t=e.target.closest(`[data-id]`);if(!t)return;u.classList.add(`d-none`);let{error:n}=await r(i,Number(t.dataset.id));if(n){u.textContent=`Kunne ikkje sende forespørsel.`,u.classList.remove(`d-none`);return}location.reload()})}async function w(n){n.replaceChildren(u(`Laster min side…`));try{let e=await i();if(!e){location.hash=`#/logginn`;return}let{profil:r,user:a}=e,o=r?.kobling_status??`ingen`,s=r?_[r.rolle]:`Ukjent`,c=`
      <div class="minside-container">
        <h2 class="mb-1">Min side</h2>
        <p class="text-muted mb-4">${t(a.email??``)} · <span class="badge bg-secondary">${t(s)}</span></p>`;if(o===`ingen`||o===`avvist`)c+=v(o);else if(o===`venter`)c+=y();else if(o===`godkjent`&&r?.kasterid){let e=r.kasterid,[t,i,o]=await Promise.all([b(e),x(a.id),S(e)]);c+=t+i,c+=`</div>`,n.innerHTML=c,n.querySelector(`.minside-container`).appendChild(o);return}c+=`</div>`,n.innerHTML=c,(o===`ingen`||o===`avvist`)&&C(n,a.id)}catch(t){a(`minside.render`,t),n.replaceChildren(e(`Kunne ikkje laste min side.`))}}export{w as render};