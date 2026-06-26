import{t as e}from"./logError-DhxY2JQv.js";import{c as t,i as n}from"./authService-CcI7FLUE.js";import{J as r,Y as i,Z as a,ft as o,u as s,ut as c}from"./index-pllV3QU0.js";import{o as l,r as u}from"./kasterService-D1rq1bik.js";import{t as d}from"./LoadingState-xRmJ3K_t.js";import{t as f}from"./EmptyState-BvE_0HiD.js";import{g as p,p as m}from"./kampService-Cdqslr0w.js";import{t as h}from"./Tabs-D6JHD9IR.js";function g(e){let t=document.createElement(`div`);return t.innerHTML=e,t}var _={admin:`Administrator`,klubbadmin:`Klubbadministrator`,bruker:`Brukar`};function v(e){return`
    ${e===`avvist`?`<div class="alert alert-warning">Koblingforespørselen din vart avvist. Du kan sende ein ny.</div>`:``}
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">Koble til utøvarprofil</h5>
        <p class="card-text text-muted">Søk etter deg sjølv i registeret og send ein forespørsel. Etter godkjenning kan du melde deg på stevner.</p>
        <input type="search" id="kaster-sok" class="form-control mb-2" placeholder="Søk på navn…">
        <div id="kaster-treff" class="list-group mb-2"></div>
        <div id="kasting-feil" class="alert alert-danger d-none"></div>
      </div>
    </div>`}function y(){return`<div class="alert alert-info mb-4">Koblingforespørselen din ventar på godkjenning frå ein administrator.</div>`}async function b(e){let{data:t,error:n}=await u(e);return n||!t?``:`
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">Kobla til utøvarprofil</h5>
        <p class="mb-1"><strong>${r(c(t))}</strong> · ${r(t.klubb?.navn??``)}</p>
        <a href="#/kastere/${o(t)}" class="btn btn-sm btn-outline-primary mt-1">Sjå profil</a>
      </div>
    </div>`}async function x(e){let{data:t,error:n}=await s(e);return n?`<p class="text-muted">Kunne ikkje laste påmeldingar.</p>`:t.length?`
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">Påmeldingar</h5>
        <table class="table table-sm">
          <thead><tr><th>Stevne</th><th>Dato</th><th></th></tr></thead>
          <tbody>${[...t].sort((e,t)=>(e.stevne?.dato??``).localeCompare(t.stevne?.dato??``)).map(e=>{let t=a(e.stevne?.dato);return`<tr>
      <td><a href="#/stevne/${e.stevne?.id??``}/pamelding">${r(e.stevne?.navn??``)}</a></td>
      <td>${r(t)}</td>
      <td><a href="#/stevne/${e.stevne?.id??``}/pamelding" class="btn btn-sm btn-outline-danger">Meld av</a></td>
    </tr>`}).join(``)}</tbody>
        </table>
      </div>
    </div>`:`<p class="empty-state">Ingen påmeldingar enno.</p>`}async function S(e){let{data:t,error:n}=await m(e);if(n){let e=document.createElement(`p`);return e.className=`text-muted`,e.textContent=`Kunne ikkje laste kampar.`,e}let i=t.filter(e=>!e.kamp?.er_walkover),a=await p([...new Set(i.map(e=>e.kamp?.stevneid).filter(e=>e!=null))]),o=i.filter(e=>e.kamp?.stevne?.erfullfort===!1&&!e.kamp?.er_bekreftet).sort((e,t)=>(e.kamp?.runde_nummer??0)-(t.kamp?.runde_nummer??0)),s=i.filter(e=>e.kamp?.er_bekreftet).sort((e,t)=>(e.kamp?.runde_nummer??0)-(t.kamp?.runde_nummer??0)),l=(t,n)=>{let i=t.kamp,o=i?.stevneid,s=o==null?void 0:a[`${o}:${e}`],l=(i?.spelarar??[]).filter(t=>{if(t.kasterid==null||t.kasterid===e)return!1;let n=o==null?void 0:a[`${o}:${t.kasterid}`];return s==null||n==null||n!==s}),u=l.length?l.map(e=>r(c(e.kaster))).join(` / `):`–`;return`<tr>
      <td>R${i?.runde_nummer??``} / B${i?.bane_nummer??``}</td>
      <td>${u}</td>
      <td>${n}</td>
    </tr>`},u=(e,t)=>{if(!e.length)return null;let n=new Map;for(let t of e){let e=t.kamp?.stevneid??`ukjent`,r=t.kamp?.stevne?.navn??``;n.has(e)||n.set(e,{navn:r,kampar:[]}),n.get(e).kampar.push(t)}return[...n.values()].map(({navn:e,kampar:n})=>`
      <p class="fw-semibold mb-1 mt-2">${r(e)}</p>
      <table class="table table-sm mb-3"><thead><tr><th>Runde/Bane</th><th>Motstandar</th><th></th></tr></thead><tbody>
        ${n.map(e=>l(e,t(e))).join(``)}
      </tbody></table>`).join(``)},d=u(o,e=>`<a href="#/kamp/${e.kamp?.id??``}" class="btn btn-sm btn-primary">Scoreboard</a>`),f=u(s,e=>`<a href="#/kamp/${e.kamp?.id??``}" class="btn btn-sm btn-outline-secondary">Sjå kamp</a>`),_=document.createElement(`div`);_.className=`card mb-4`,_.id=`mine-kampar-seksjon`;let v=document.createElement(`div`);v.className=`card-body`;let y=document.createElement(`h5`);return y.className=`card-title`,y.textContent=`Mine kampar`,v.appendChild(y),v.appendChild(h({tabs:[{id:`kommande`,label:`Kommande (${o.length})`,panel:g(d??`<p class="text-muted">Ingen kommande kampar.</p>`)},{id:`ferdige`,label:`Ferdige (${s.length})`,panel:g(f??`<p class="text-muted">Ingen ferdige kampar enno.</p>`)}]})),_.appendChild(v),_}function C(e,n){let i=null,a=null,o=e.querySelector(`#kaster-sok`),s=e.querySelector(`#kaster-treff`),u=e.querySelector(`#kasting-feil`);o.addEventListener(`input`,()=>{i!==null&&clearTimeout(i);let e=o.value.trim().toLowerCase();if(e.length<2){s.innerHTML=``;return}i=setTimeout(async()=>{if(!a){let{data:e}=await l();a=e}let t=a.filter(t=>t.fornavn.toLowerCase().includes(e)||t.etternavn.toLowerCase().includes(e)).slice(0,8);if(!t.length){let e=f(`Ingen treff.`);e.classList.add(`small`),s.replaceChildren(e);return}s.innerHTML=t.map(e=>`<button class="list-group-item list-group-item-action" data-id="${e.id}">
          ${r(c(e))} <span class="text-muted small">· ${r(e.klubb?.navn??``)}</span>
        </button>`).join(``)},300)}),s.addEventListener(`click`,async e=>{let r=e.target.closest(`[data-id]`);if(!r)return;u.classList.add(`d-none`);let{error:i}=await t(n,Number(r.dataset.id));if(i){u.textContent=`Kunne ikkje sende forespørsel.`,u.classList.remove(`d-none`);return}location.reload()})}async function w(t){t.replaceChildren(d(`Laster min side…`));try{let e=await n();if(!e){location.hash=`#/logginn`;return}let{profil:i,user:a}=e,o=i?.kobling_status??`ingen`,s=i?_[i.rolle]:`Ukjent`,c=`
      <div class="minside-container">
        <h2 class="mb-1">Min side</h2>
        <p class="text-muted mb-4">${r(a.email??``)} · <span class="badge bg-secondary">${r(s)}</span></p>`;if(o===`ingen`||o===`avvist`)c+=v(o);else if(o===`venter`)c+=y();else if(o===`godkjent`&&i?.kasterid){let e=i.kasterid,[n,r,o]=await Promise.all([b(e),x(a.id),S(e)]);c+=n+r,c+=`</div>`,t.innerHTML=c,t.querySelector(`.minside-container`).appendChild(o);return}c+=`</div>`,t.innerHTML=c,(o===`ingen`||o===`avvist`)&&C(t,a.id)}catch(n){e(`minside.render`,n),t.replaceChildren(i(`Kunne ikkje laste min side.`))}}export{w as render};