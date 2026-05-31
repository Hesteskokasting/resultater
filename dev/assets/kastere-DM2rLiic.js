const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/charts-Jm4tnWOA.js","assets/rolldown-runtime-lhHHWwHU.js"])))=>i.map(i=>d[i]);
import{$ as e,G as t,W as n,X as r,ct as i,i as a,nt as o,q as s,st as c}from"./index-Djo1GFw6.js";import{o as l,s as u,t as d}from"./kasterService-Belo17QT.js";import{t as f}from"./LoadingState-RVZNML7E.js";import{t as p}from"./EmptyState-a5aDhc-8.js";var m=24,h=`https://placehold.co/200x200/444/888?text=?`,g={visAlle:!1,sokeTekst:``,side:1};function _(e){let t=c(e);return`
    <a href="#/kastere/${i(e)}" class="kaster-kort">
      <img src="${n(e.avatarurl||h)}" alt="${n(t)}" loading="lazy">
      <div class="kaster-navn">${n(t)}</div>
      <div class="kaster-klubb">${n(e.klubb?.navn??`–`)}</div>
    </a>`}function v(){return`
    <div class="nc-side">
      <div class="kaster-liste-kontroller">
        <div class="nc-filter-rad">
          <input id="kaster-sok" type="search" class="tl-select" placeholder="Søk på navn/klubb" value="">
        </div>
        <div class="mt-2">
          <label class="kaster-checkbox-label">
            <input type="checkbox" id="kaster-berre-aktive" checked>
            Vis berre aktive utøvarar
          </label>
        </div>
      </div>
      <div id="kaster-sideinfo" class="my-2"></div>
      <div id="kaster-paginering-topp"></div>
      <div id="kaster-grid" class="kaster-grid"></div>
      <div id="kaster-paginering-botn"></div>
    </div>`}function y(e,t){if(t<=1)return``;let n=(t,n,r)=>`<button class="btn btn-sm ${n===e?`btn-primary`:`btn-outline-secondary`} pag-knapp"
      data-side="${n}" ${r?`disabled`:``}>${t}</button>`;return`
    <div class="kaster-paginering">
      ${n(`«`,1,e===1)}
      ${n(`‹`,e-1,e===1)}
      <span class="pag-info">side ${e} av ${t}</span>
      ${n(`›`,e+1,e===t)}
      ${n(`»`,t,e===t)}
    </div>`}async function b(e){g.side=1,e.replaceChildren(f(`Laster utøvarar...`));try{let n=await l();if(n.error){e.replaceChildren(t(`Kunne ikkje laste utøvarar.`));return}let r=n.data;e.innerHTML=v();let i=e.querySelector(`#kaster-grid`),o=e.querySelector(`#kaster-sideinfo`),s=e.querySelector(`#kaster-paginering-topp`),d=e.querySelector(`#kaster-paginering-botn`),f=e.querySelector(`#kaster-sok`),p=e.querySelector(`#kaster-berre-aktive`);function h(){let e=g.sokeTekst.trim().toLowerCase(),t=r;e&&(t=t.filter(t=>c(t).toLowerCase().includes(e)||(t.klubb?.navn??``).toLowerCase().includes(e)));let n=t.length,a=Math.max(1,Math.ceil(n/m));g.side>a&&(g.side=1);let l=(g.side-1)*m,u=t.slice(l,l+m);o.innerHTML=`side ${g.side} av ${a}`;let f=y(g.side,a);s.innerHTML=f,d.innerHTML=f,i.innerHTML=u.map(_).join(``)}h(),f.addEventListener(`input`,()=>{g.sokeTekst=f.value,g.side=1,h()}),p.addEventListener(`change`,async()=>{g.visAlle=!p.checked,g.side=1;let{data:e,error:t}=g.visAlle?await u():await l();t||(r=e),h()}),e.addEventListener(`click`,t=>{let n=t.target.closest(`.pag-knapp`);!n||n.disabled||(g.side=Number(n.dataset.side),h(),e.querySelector(`.nc-side`)?.scrollIntoView({behavior:`smooth`}))}),a().then(t=>{if(!t?.profil||t.profil.rolle!==`admin`&&t.profil.rolle!==`klubbadmin`)return;let n=document.createElement(`div`);n.className=`mb-2 px-2`,n.innerHTML=`<a href="#/kaster/ny" class="btn btn-sm btn-success">+ Ny utøvar</a>`,e.querySelector(`.nc-side`)?.prepend(n)})}catch(n){o(`renderListe`,n),e.replaceChildren(t(`Kunne ikkje laste utøvarar.`))}}var x=2017,S={kongelag:40,minimatch:60,halvmatch:100,heilmatch:200};function C(e){return e?parseInt(e.substring(0,4)):null}function w(e){return e.length?Math.round(e.reduce((e,t)=>e+t,0)/e.length):null}function T(e,t){let n=(e.stevne?.innledendekastemetode?.navn??``).toLowerCase(),r=(e.stevne?.avsluttendekastemetode?.navn??``).toLowerCase();return n===t||r===t}function E(e){return[{label:`Kongelag`,rader:e.filter(e=>e.poeng_kongelag!=null),poengFn:e=>e.poeng_kongelag,ringFn:e=>e.antall_ring_kongelag,maxRing:S.kongelag},{label:`Minimatch`,rader:e.filter(e=>e.poeng_xkast!=null&&T(e,`minimatch`)),poengFn:e=>e.poeng_xkast,ringFn:e=>e.antall_ring_xkast,maxRing:S.minimatch},{label:`Halvmatch`,rader:e.filter(e=>e.poeng_xkast!=null&&T(e,`halvmatch`)),poengFn:e=>e.poeng_xkast,ringFn:e=>e.antall_ring_xkast,maxRing:S.halvmatch},{label:`Heilmatch`,rader:e.filter(e=>e.poeng_xkast!=null&&T(e,`heilmatch`)),poengFn:e=>e.poeng_xkast,ringFn:e=>e.antall_ring_xkast,maxRing:S.heilmatch}].map(({label:e,rader:t,poengFn:n,ringFn:r,maxRing:i})=>{let a=t.length?Math.max(...t.map(e=>n(e))):null,o=w(t.map(e=>n(e))),s=t.filter(e=>r(e)!=null&&(C(e.stevne?.dato)??0)>=2017);return{label:e,rekord:a,snittPoeng:o,snittProsent:s.length?Math.round(s.reduce((e,t)=>e+r(t)/i*100,0)/s.length*100)/100:null}})}function D(e,t){let n=new Map;for(let r of e)r.klubb?.id&&r.klubb.id!==t&&n.set(r.klubb.id,r.klubb.navn);return[...n.values()]}function O(e,t,n){return t===`plassering`?e.plassering??null:n===`kongelag`?e.antall_ring_kongelag==null?null:Math.round(e.antall_ring_kongelag/S.kongelag*1e4)/100:T(e,n)?e.antall_ring_xkast==null?null:Math.round(e.antall_ring_xkast/S[n]*1e4)/100:null}function k(e,t,n,r,i){let a=[...e].filter(e=>{let a=C(e.stevne?.dato);return r&&(a??0)<r||i&&(a??0)>i?!1:O(e,t,n)!=null}).sort((e,t)=>(e.stevne?.dato??``).localeCompare(t.stevne?.dato??``));return{labels:a.map(e=>s(e.stevne?.dato)),stevneNamn:a.map(e=>e.stevne?.navn??``),verdiar:a.map(e=>O(e,t,n))}}var A=!1,j={aktiv:`resultater`,ar:`alle`,stevnetype:`alle`,grafMetrikk:`plassering`,grafMetode:`kongelag`,grafFra:null,grafTil:null},M=null;function N(){M&&=(M.destroy(),null)}function P(e,t){let r=n(c(e)),i=e.medlemsnummer?` ${e.medlemsnummer}`:``,a=[...new Set(t.map(e=>C(e.stevne?.dato)).filter(e=>e!==null))].sort((e,t)=>t-e),o=[...new Map(t.map(e=>e.stevne?.stevnetype).filter(e=>e!=null).map(e=>[e.id,e.navn])).entries()].sort((e,t)=>e[1].localeCompare(t[1])),s=j.grafMetrikk===`prosent`?``:` d-none`;return`
    <div class="nc-side">
      <div class="mb-3">
        <a href="#/kastere" class="btn btn-sm btn-outline-secondary">← Tilbake</a>
      </div>
      <h1 class="kaster-detalj-tittel">${r}${n(i)}</h1>
      <p class="kaster-detalj-klubb">${n(e.klubb?.navn??`–`)}</p>

      <div class="kaster-tab-rad">
        <button class="btn btn-sm kaster-tab-knapp${j.aktiv===`resultater`?` active`:``}" data-tab="resultater">Resultat</button>
        <button class="btn btn-sm kaster-tab-knapp${j.aktiv===`statistikk`?` active`:``}" data-tab="statistikk">Statistikk</button>
        <button class="btn btn-sm kaster-tab-knapp${j.aktiv===`graf`?` active`:``}" data-tab="graf">Vis graf</button>
      </div>
      <hr>

      <div id="kd-tab-resultater" class="kd-tab${j.aktiv===`resultater`?``:` kd-skjult`}">
        <div class="nc-filter-rad mb-3">
          <select id="kd-ar" class="tl-select">
            <option value="alle">Vel årstal</option>
            ${a.map(e=>`<option value="${e}"${j.ar==String(e)?` selected`:``}>${e}</option>`).join(``)}
          </select>
          <select id="kd-type" class="tl-select">
            <option value="alle">Alle stevnetypar</option>
            ${o.map(([e,t])=>`<option value="${e}">${n(t)}</option>`).join(``)}
          </select>
        </div>
        <div id="kd-resultat-tabell"></div>
      </div>

      <div id="kd-tab-statistikk" class="kd-tab${j.aktiv===`statistikk`?``:` kd-skjult`}">
        <div id="kd-stat-innhald"></div>
      </div>

      <div id="kd-tab-graf" class="kd-tab${j.aktiv===`graf`?``:` kd-skjult`}">
        <div class="nc-filter-rad mb-3">
          <select id="kd-graf-metrikk" class="tl-select">
            <option value="plassering"${j.grafMetrikk===`plassering`?` selected`:``}>Plassering</option>
            <option value="prosent"${j.grafMetrikk===`prosent`?` selected`:``}>% Ring (frå 2017)</option>
          </select>
          <select id="kd-graf-metode" class="tl-select${s}">
            <option value="kongelag"${j.grafMetode===`kongelag`?` selected`:``}>Kongelag</option>
            <option value="minimatch"${j.grafMetode===`minimatch`?` selected`:``}>Minimatch</option>
            <option value="halvmatch"${j.grafMetode===`halvmatch`?` selected`:``}>Halvmatch</option>
            <option value="heilmatch"${j.grafMetode===`heilmatch`?` selected`:``}>Heilmatch</option>
          </select>
          <select id="kd-graf-fra" class="tl-select">
            <option value="">Frå år</option>
            ${a.map(e=>`<option value="${e}"${j.grafFra==String(e)?` selected`:``}>${e}</option>`).join(``)}
          </select>
          <select id="kd-graf-til" class="tl-select">
            <option value="">Til år</option>
            ${a.map(e=>`<option value="${e}"${j.grafTil==String(e)?` selected`:``}>${e}</option>`).join(``)}
          </select>
        </div>
        <div class="kaster-graf-wrapper">
          <canvas id="kd-graf-canvas"></canvas>
        </div>
      </div>
    </div>`}function F(e,t,r){let i=e;t!==`alle`&&(i=i.filter(e=>String(C(e.stevne?.dato))===t)),r!==`alle`&&(i=i.filter(e=>String(e.stevne?.stevnetype?.id)===r));let a=i.length,o=`
    <div class="kaster-resultat-info">
      <span>Antal: <strong>${a}</strong></span>
      <span class="kaster-resultat-hint">Antal ringar i parentes (frå ${x})</span>
    </div>`;if(!a)return o+`<p class="empty-state">Ingen resultat funnet.</p>`;let c=(e,t)=>e==null?``:t==null?`${e}`:`${e} (${t})`;return o+`
    <div class="table-responsive">
      <table class="app-tabell">
        <thead class="app-thead">
          <tr>
            <th>Dato</th><th>Stevne</th><th>Type</th><th>Klubb</th>
            <th>Pl.</th><th>Kongelag</th><th>X-kast</th>
          </tr>
        </thead>
        <tbody>${i.map(e=>{let t=e.stevne,r=t?.id?`<a href="#/stevne/${t.id}/resultat" class="tl-lenkje">${n(t.navn??``)}</a>`:n(t?.navn??`–`);return`
      <tr>
        <td class="text-nowrap">${s(t?.dato)}</td>
        <td>${r}</td>
        <td>${n(t?.stevnetype?.navn??`–`)}</td>
        <td>${n(e.klubb?.navn??`–`)}</td>
        <td class="text-center fw-bold">${e.plassering??`–`}</td>
        <td class="text-center">${c(e.poeng_kongelag,e.antall_ring_kongelag)}</td>
        <td class="text-center">${c(e.poeng_xkast,e.antall_ring_xkast)}</td>
      </tr>`}).join(``)}</tbody>
      </table>
    </div>`}function I(e,t){let i=E(e),a=D(e,t.klubb?.id??null);return`
    <div class="kaster-stat-grid">
      <div>
        <h4>Statistikk</h4>
        <table class="app-tabell">
          <thead class="app-thead">
            <tr>
              <th></th><th>Rekord</th><th>Snitt Poeng</th><th>% Ring (frå ${x})</th>
            </tr>
          </thead>
          <tbody>${i.map(({label:e,rekord:t,snittPoeng:n,snittProsent:i})=>`
    <tr>
      <td>${e}</td>
      <td class="text-center">${t??`–`}</td>
      <td class="text-center">${n??`–`}</td>
      <td class="text-center">${i==null?`–`:r(i)}</td>
    </tr>`).join(``)}</tbody>
        </table>
      </div>
      ${a.length?`<div class="kaster-tidlegare-klubbar">
        <h4 class="kaster-tidlegare-tittel">Tidlegare klubbar</h4>
        <ul class="list-unstyled">${a.map(e=>`<li>${n(e)}</li>`).join(``)}</ul>
      </div>`:``}
    </div>`}async function L(t,n){N();let{labels:r,stevneNamn:i,verdiar:a}=k(n,j.grafMetrikk,j.grafMetode,j.grafFra?Number(j.grafFra):null,j.grafTil?Number(j.grafTil):null);if(!a.length){let e=t.parentElement;if(e){let t=p(`Ingen data for valt filter.`);t.classList.add(`pt-3`),e.replaceChildren(t)}return}let{Chart:o,registerables:s}=await e(async()=>{let{Chart:e,registerables:t}=await import(`./charts-Jm4tnWOA.js`).then(e=>e.t);return{Chart:e,registerables:t}},__vite__mapDeps([0,1]));A||=(o.register(...s),!0);let c=j.grafMetrikk===`plassering`,l=c?`Plassering`:`% Ring`;M=new o(t,{type:`line`,data:{labels:r,datasets:[{label:l,data:a,borderColor:`#4e8fc7`,backgroundColor:`rgba(78,143,199,0.15)`,pointBackgroundColor:`#4e8fc7`,pointRadius:4,tension:.1,fill:!1}]},options:{responsive:!0,maintainAspectRatio:!1,scales:{x:{ticks:{maxTicksLimit:14,maxRotation:45,color:`#ccc`},grid:{color:`rgba(255,255,255,0.08)`}},y:{reverse:c,ticks:{color:`#ccc`},grid:{color:`rgba(255,255,255,0.08)`},title:{display:!0,text:l,color:`#ccc`}}},plugins:{legend:{display:!1},tooltip:{callbacks:{title:e=>i[e[0].dataIndex]??r[e[0].dataIndex]??``,label:e=>`${l}: ${e.raw}`}}}}})}async function R(e,n){j.aktiv=`resultater`,j.ar=`alle`,j.stevnetype=`alle`,j.grafMetrikk=`plassering`,j.grafMetode=`kongelag`,j.grafFra=null,j.grafTil=null,N(),e.replaceChildren(f(`Laster utøvar...`));try{let{kaster:r,resultater:i,error:o}=await d(n);if(o||!r){e.replaceChildren(t(`Kunne ikkje laste utøvar.`));return}let s=r;e.innerHTML=P(s,i);let c=e.querySelector(`#kd-ar`),l=e.querySelector(`#kd-type`),u=e.querySelector(`#kd-graf-metode`);function f(){e.querySelector(`#kd-resultat-tabell`).innerHTML=F(i,j.ar,j.stevnetype)}function p(){e.querySelector(`#kd-stat-innhald`).innerHTML=I(i,s)}function m(){let t=e.querySelector(`#kd-graf-canvas`);t&&L(t,i)}function h(t){j.aktiv=t,e.querySelectorAll(`.kaster-tab-knapp`).forEach(e=>{e.classList.toggle(`active`,e.dataset.tab===t)}),e.querySelectorAll(`.kd-tab`).forEach(e=>{e.classList.toggle(`kd-skjult`,e.id!==`kd-tab-${t}`)}),t===`statistikk`&&p(),t===`graf`&&m()}f(),c.addEventListener(`change`,()=>{j.ar=c.value,f()}),l.addEventListener(`change`,()=>{j.stevnetype=l.value,f()}),e.querySelectorAll(`.kaster-tab-knapp`).forEach(e=>{e.addEventListener(`click`,()=>h(e.dataset.tab??``))});let g=e.querySelector(`#kd-graf-metrikk`);g.addEventListener(`change`,()=>{j.grafMetrikk=g.value,u.classList.toggle(`d-none`,g.value!==`prosent`),m()}),u.addEventListener(`change`,()=>{j.grafMetode=u.value,m()});let _=e.querySelector(`#kd-graf-fra`),v=e.querySelector(`#kd-graf-til`);_.addEventListener(`change`,()=>{j.grafFra=_.value||null,m()}),v.addEventListener(`change`,()=>{j.grafTil=v.value||null,m()}),a().then(t=>{if(!t?.profil||!(t.profil.rolle===`admin`||t.profil.rolle===`klubbadmin`&&t.klubber.includes(s.klubbid??-1)))return;let r=document.createElement(`div`);r.className=`mb-2 px-2`,r.innerHTML=`<a href="#/kaster/${n}/admin" class="btn btn-sm btn-warning">Rediger utøvar</a>`,e.querySelector(`.nc-side`)?.prepend(r)})}catch(n){o(`renderDetalj`,n),e.replaceChildren(t(`Kunne ikkje laste utøvar.`))}}var z=async(e,t)=>{N(),t.id?await R(e,Number(t.id)):await b(e)};export{z as render};