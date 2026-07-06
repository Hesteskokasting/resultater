import{t as e}from"./logError-Cjb5zwtM.js";import{r as t,u as n}from"./authService-g9wEk7o1.js";import{Q as r,Z as i,et as a,mt as o,pt as s,t as c,u as l}from"./index-CBSadyAf.js";import{r as u,u as d}from"./kasterService-B_2UvLGF.js";import{t as f}from"./LoadingState-BCLCa55U.js";import{t as p}from"./EmptyState-CCOt8lnf.js";import{d as m,m as h}from"./kampService-ChfQLXja.js";import{t as g}from"./Tabs-DOu_JrHI.js";function _(e){let t=document.createElement(`div`);return t.innerHTML=e,t}var v={admin:`Administrator`,klubbadmin:`Klubbadministrator`,bruker:`Brukar`};function y(e){return`
    ${e===`avvist`?`<div class="alert alert-warning">Koblingforespørselen din vart avvist. Du kan sende ein ny.</div>`:``}
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">Koble til utøvarprofil</h5>
        <p class="card-text text-muted">Søk etter deg sjølv i registeret og send ein forespørsel. Etter godkjenning kan du melde deg på stevner.</p>
        <input type="search" id="thrower-search" class="form-control mb-2" placeholder="Søk på navn…">
        <div id="thrower-matches" class="list-group mb-2"></div>
        <div id="thrower-error" class="alert alert-danger d-none"></div>
      </div>
    </div>`}function b(){return`<div class="alert alert-info mb-4">Koblingforespørselen din ventar på godkjenning frå ein administrator.</div>`}async function x(e){let{data:t,error:n}=await d(e);return n||!t?``:`
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">Kobla til utøvarprofil</h5>
        <p class="mb-1"><strong>${i(o(t))}</strong> · ${i(t.klubb?.navn??``)}</p>
        <a href="#/kastere/${s(t)}" class="btn btn-sm btn-outline-primary mt-1">Sjå profil</a>
      </div>
    </div>`}async function S(e){let{data:t,error:n}=await l(e);return n?`<p class="text-muted">Kunne ikkje laste påmeldingar.</p>`:t.length?`
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">Påmeldingar</h5>
        <table class="table table-sm">
          <thead><tr><th>Stevne</th><th>Dato</th><th></th></tr></thead>
          <tbody>${[...t].sort((e,t)=>(e.stevne?.dato??``).localeCompare(t.stevne?.dato??``)).map(e=>{let t=a(e.stevne?.dato);return`<tr>
      <td><a href="#/stevne/${e.stevne?.id??``}/pamelding">${i(e.stevne?.navn??``)}</a></td>
      <td>${i(t)}</td>
      <td><a href="#/stevne/${e.stevne?.id??``}/pamelding" class="btn btn-sm btn-outline-danger">Meld av</a></td>
    </tr>`}).join(``)}</tbody>
        </table>
      </div>
    </div>`:`<p class="empty-state">Ingen påmeldingar enno.</p>`}function C(e,t,n,r){let i=n==null?void 0:r[`${n}:${t}`];return e.filter(e=>{if(e.kasterid==null||e.kasterid===t)return!1;let a=n==null?void 0:r[`${n}:${e.kasterid}`];return i==null||a==null||a!==i})}async function w(e){let{data:t,error:n}=await m(e);if(n){let e=document.createElement(`p`);return e.className=`text-muted`,e.textContent=`Kunne ikkje laste kampar.`,e}let r=t.filter(e=>!e.kamp?.er_walkover),a=await h([...new Set(r.map(e=>e.kamp?.stevneid).filter(e=>e!=null))]),s=r.filter(e=>e.kamp?.stevne?.erfullfort===!1).sort((e,t)=>(e.kamp?.runde_nummer??0)-(t.kamp?.runde_nummer??0)),c=r.filter(e=>e.kamp?.stevne?.erfullfort===!0).sort((e,t)=>(e.kamp?.runde_nummer??0)-(t.kamp?.runde_nummer??0)),l=(t,n)=>{let r=t.kamp,s=r?.stevneid,c=C(r?.spelarar??[],e,s,a),l=c.length?c.map(e=>i(o(e.kaster))).join(` / `):`–`;return`<tr>
      <td>R${r?.runde_nummer??``} / B${r?.bane_nummer??``}</td>
      <td>${l}</td>
      <td>${n}</td>
    </tr>`},u=(e,t)=>{if(!e.length)return null;let n=new Map;for(let t of e){let e=t.kamp?.stevneid??`unknown`,r=t.kamp?.stevne?.navn??``;n.has(e)||n.set(e,{name:r,matches:[]}),n.get(e).matches.push(t)}return[...n.values()].map(({name:e,matches:n})=>`
      <p class="fw-semibold mb-1 mt-2">${i(e)}</p>
      <table class="table table-sm mb-3"><thead><tr><th>Runde/Bane</th><th>Motstandar</th><th></th></tr></thead><tbody>
        ${n.map(e=>l(e,t(e))).join(``)}
      </tbody></table>`).join(``)},d=u(s,t=>{if(!t.kamp?.er_bekreftet)return`<a href="#/kamp/${t.kamp?.id??``}" class="btn btn-sm btn-primary" target="_blank" rel="noopener">Scoreboard</a>`;let n=t.kamp.stevneid,r=t.kamp.spelarar?.find(t=>t.kasterid===e)?.score_poeng,i=C(t.kamp.spelarar??[],e,n,a)[0]?.score_poeng;return r==null||i==null?`–`:`<span class="fw-semibold">${r} – ${i}</span>`}),f=u(c,e=>`<a href="#/kamp/${e.kamp?.id??``}" class="btn btn-sm btn-outline-secondary">Sjå kamp</a>`),p=document.createElement(`div`);p.className=`card mb-4`,p.id=`my-matches-section`;let v=document.createElement(`div`);v.className=`card-body`;let y=document.createElement(`h5`);return y.className=`card-title`,y.textContent=`Mine kampar`,v.appendChild(y),v.appendChild(g({tabs:[{id:`active`,label:`Aktive (${s.length})`,panel:_(d??`<p class="text-muted">Ingen aktive kampar.</p>`)},{id:`completed`,label:`Ferdige (${c.length})`,panel:_(f??`<p class="text-muted">Ingen ferdige kampar enno.</p>`)}]})),p.appendChild(v),p}function T(e,t){let r=null,a=null,s=e.querySelector(`#thrower-search`),c=e.querySelector(`#thrower-matches`),l=e.querySelector(`#thrower-error`);s.addEventListener(`input`,()=>{r!==null&&clearTimeout(r);let e=s.value.trim().toLowerCase();if(e.length<2){c.innerHTML=``;return}r=setTimeout(async()=>{if(!a){let{data:e}=await u();a=e}let t=a.filter(t=>t.fornavn.toLowerCase().includes(e)||t.etternavn.toLowerCase().includes(e)).slice(0,8);if(!t.length){let e=p(`Ingen treff.`);e.classList.add(`small`),c.replaceChildren(e);return}c.innerHTML=t.map(e=>`<button class="list-group-item list-group-item-action" data-id="${e.id}">
          ${i(o(e))} <span class="text-muted small">· ${i(e.klubb?.navn??``)}</span>
        </button>`).join(``)},300)}),c.addEventListener(`click`,async e=>{let r=e.target.closest(`[data-id]`);if(!r)return;l.classList.add(`d-none`);let{error:i}=await n(t,Number(r.dataset.id));if(i){l.textContent=`Kunne ikkje sende forespørsel.`,l.classList.remove(`d-none`);return}location.reload()})}async function E(n){c(()=>E(n)),n.replaceChildren(f(`Laster min side…`));try{let e=await t();if(!e){location.hash=`#/logginn`;return}let{profil:r,user:a}=e,o=r?.kobling_status??`ingen`,s=r?v[r.role]:`Ukjent`,c=`
      <div class="mypage-container">
        <h2 class="mb-1">Min side</h2>
        <p class="text-muted mb-4">${i(a.email??``)} · <span class="badge bg-secondary">${i(s)}</span></p>`;if(o===`ingen`||o===`avvist`)c+=y(o);else if(o===`venter`)c+=b();else if(o===`godkjent`&&r?.kasterid){let e=r.kasterid,[t,i,o]=await Promise.all([x(e),S(a.id),w(e)]);c+=t+i,c+=`</div>`,n.innerHTML=c,n.querySelector(`.mypage-container`).appendChild(o);return}c+=`</div>`,n.innerHTML=c,(o===`ingen`||o===`avvist`)&&T(n,a.id)}catch(t){e(`minside.render`,t),n.replaceChildren(r(`Kunne ikkje laste min side.`))}}export{E as render};