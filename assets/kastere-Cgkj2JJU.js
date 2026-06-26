const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/charts-DOFOLNDj.js","assets/rolldown-runtime-lhHHWwHU.js"])))=>i.map(i=>d[i]);
import{t as e}from"./logError-DhxY2JQv.js";import{J as t,Y as n,Z as r,et as i,ft as a,rt as o,ut as s}from"./index-C_tXKeOg.js";import{o as c,s as l,t as u}from"./kasterService-D1rq1bik.js";import{t as d}from"./LoadingState-xRmJ3K_t.js";import{t as f}from"./EmptyState-BvE_0HiD.js";import{t as p}from"./AdminLinkBar-DwNpHsnl.js";var m=24,h=`https://placehold.co/200x200/444/888?text=?`,g={visAlle:!1,sokeTekst:``,side:1};function _(e){let n=s(e);return`
    <a href="#/kastere/${a(e)}" class="kaster-kort">
      <img src="${t(e.avatarurl||h)}" alt="${t(n)}" loading="lazy">
      <div class="kaster-navn">${t(n)}</div>
      <div class="kaster-klubb">${t(e.klubb?.navn??`–`)}</div>
    </a>`}function v(){return`
    <div class="content-page">
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
    </div>`}async function b(t){g.side=1,t.replaceChildren(d(`Laster utøvarar...`));try{let e=await c();if(e.error){t.replaceChildren(n(`Kunne ikkje laste utøvarar.`));return}let r=e.data;t.innerHTML=v();let i=t.querySelector(`#kaster-grid`),a=t.querySelector(`#kaster-sideinfo`),o=t.querySelector(`#kaster-paginering-topp`),u=t.querySelector(`#kaster-paginering-botn`),d=t.querySelector(`#kaster-sok`),f=t.querySelector(`#kaster-berre-aktive`);function h(){let e=g.sokeTekst.trim().toLowerCase(),t=r;e&&(t=t.filter(t=>s(t).toLowerCase().includes(e)||(t.klubb?.navn??``).toLowerCase().includes(e)));let n=t.length,c=Math.max(1,Math.ceil(n/m));g.side>c&&(g.side=1);let l=(g.side-1)*m,d=t.slice(l,l+m);a.innerHTML=`side ${g.side} av ${c}`;let f=y(g.side,c);o.innerHTML=f,u.innerHTML=f,i.innerHTML=d.map(_).join(``)}h(),d.addEventListener(`input`,()=>{g.sokeTekst=d.value,g.side=1,h()}),f.addEventListener(`change`,async()=>{g.visAlle=!f.checked,g.side=1;let{data:e,error:t}=g.visAlle?await l():await c();t||(r=e),h()}),t.addEventListener(`click`,e=>{let n=e.target.closest(`.pag-knapp`);!n||n.disabled||(g.side=Number(n.dataset.side),h(),t.querySelector(`.content-page`)?.scrollIntoView({behavior:`smooth`}))}),p(t,{href:`#/kaster/ny`,label:`+ Ny utøvar`,variant:`success`,canShow:e=>e.profil?.rolle===`admin`||e.profil?.rolle===`klubbadmin`})}catch(r){e(`renderListe`,r),t.replaceChildren(n(`Kunne ikkje laste utøvarar.`))}}var x=2017,S={kongelag:40,minimatch:60,halvmatch:100,heilmatch:200};function C(e){return e?parseInt(e.substring(0,4)):null}function w(e){return e.length?Math.round(e.reduce((e,t)=>e+t,0)/e.length):null}function T(e,t){let n=(e.stevne?.innledendekastemetode?.navn??``).toLowerCase(),r=(e.stevne?.avsluttendekastemetode?.navn??``).toLowerCase();return n===t||r===t}function E(e){return[{label:`Kongelag`,rader:e.filter(e=>e.poeng_kongelag!=null),poengFn:e=>e.poeng_kongelag,ringFn:e=>e.antall_ring_kongelag,maxRing:S.kongelag},{label:`Minimatch`,rader:e.filter(e=>e.poeng_xkast!=null&&T(e,`minimatch`)),poengFn:e=>e.poeng_xkast,ringFn:e=>e.antall_ring_xkast,maxRing:S.minimatch},{label:`Halvmatch`,rader:e.filter(e=>e.poeng_xkast!=null&&T(e,`halvmatch`)),poengFn:e=>e.poeng_xkast,ringFn:e=>e.antall_ring_xkast,maxRing:S.halvmatch},{label:`Heilmatch`,rader:e.filter(e=>e.poeng_xkast!=null&&T(e,`heilmatch`)),poengFn:e=>e.poeng_xkast,ringFn:e=>e.antall_ring_xkast,maxRing:S.heilmatch}].map(({label:e,rader:t,poengFn:n,ringFn:r,maxRing:i})=>{let a=t.length?Math.max(...t.map(e=>n(e))):null,o=w(t.map(e=>n(e))),s=t.filter(e=>r(e)!=null&&(C(e.stevne?.dato)??0)>=2017);return{label:e,rekord:a,snittPoeng:o,snittProsent:s.length?Math.round(s.reduce((e,t)=>e+r(t)/i*100,0)/s.length*100)/100:null}})}function D(e,t){let n=new Map;for(let r of e)r.klubb?.id&&r.klubb.id!==t&&n.set(r.klubb.id,r.klubb.navn);return[...n.values()]}function O(e,t,n){return t===`plassering`?e.plassering??null:n===`kongelag`?e.antall_ring_kongelag==null?null:Math.round(e.antall_ring_kongelag/S.kongelag*1e4)/100:T(e,n)?e.antall_ring_xkast==null?null:Math.round(e.antall_ring_xkast/S[n]*1e4)/100:null}function k(e,t,n,i,a){let o=[...e].filter(e=>{let r=C(e.stevne?.dato);return i&&(r??0)<i||a&&(r??0)>a?!1:O(e,t,n)!=null}).sort((e,t)=>(e.stevne?.dato??``).localeCompare(t.stevne?.dato??``));return{labels:o.map(e=>r(e.stevne?.dato)),stevneNamn:o.map(e=>e.stevne?.navn??``),verdiar:o.map(e=>O(e,t,n))}}var A=!1,j={aktiv:`resultater`,ar:`alle`,stevnetype:`alle`,grafMetrikk:`plassering`,grafMetode:`kongelag`,grafFra:null,grafTil:null},M=null;function N(){M&&=(M.destroy(),null)}function P(e,n){let r=t(s(e)),i=e.medlemsnummer?` ${e.medlemsnummer}`:``,a=[...new Set(n.map(e=>C(e.stevne?.dato)).filter(e=>e!==null))].sort((e,t)=>t-e),o=[...new Map(n.map(e=>e.stevne?.stevnetype).filter(e=>e!=null).map(e=>[e.id,e.navn])).entries()].sort((e,t)=>e[1].localeCompare(t[1])),c=j.grafMetrikk===`prosent`?``:` d-none`;return`
    <div class="content-page">
      <div class="mb-3">
        <a href="#/kastere" class="btn btn-sm btn-outline-secondary">← Tilbake</a>
      </div>
      <h1 class="kaster-detalj-tittel">${r}${t(i)}</h1>
      <p class="kaster-detalj-klubb">${t(e.klubb?.navn??`–`)}</p>

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
            ${o.map(([e,n])=>`<option value="${e}">${t(n)}</option>`).join(``)}
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
          <select id="kd-graf-metode" class="tl-select${c}">
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
    </div>`}function F(e,n,i){let a=e;n!==`alle`&&(a=a.filter(e=>String(C(e.stevne?.dato))===n)),i!==`alle`&&(a=a.filter(e=>String(e.stevne?.stevnetype?.id)===i));let o=a.length,s=`
    <div class="kaster-resultat-info">
      <span>Antal: <strong>${o}</strong></span>
      <span class="kaster-resultat-hint">Antal ringar i parentes (frå ${x})</span>
    </div>`;if(!o)return s+`<p class="empty-state">Ingen resultat funnet.</p>`;let c=(e,t)=>e==null?``:t==null?`${e}`:`${e} (${t})`;return s+`
    <div class="table-responsive">
      <table class="app-tabell">
        <thead class="app-thead">
          <tr>
            <th>Dato</th><th>Stevne</th><th>Type</th><th>Klubb</th>
            <th>Pl.</th><th>Kongelag</th><th>X-kast</th>
          </tr>
        </thead>
        <tbody>${a.map(e=>{let n=e.stevne,i=n?.id?`<a href="#/stevne/${n.id}/resultat" class="tl-lenkje">${t(n.navn??``)}</a>`:t(n?.navn??`–`);return`
      <tr>
        <td class="text-nowrap">${r(n?.dato)}</td>
        <td>${i}</td>
        <td>${t(n?.stevnetype?.navn??`–`)}</td>
        <td>${t(e.klubb?.navn??`–`)}</td>
        <td class="text-center fw-bold">${e.plassering??`–`}</td>
        <td class="text-center">${c(e.poeng_kongelag,e.antall_ring_kongelag)}</td>
        <td class="text-center">${c(e.poeng_xkast,e.antall_ring_xkast)}</td>
      </tr>`}).join(``)}</tbody>
      </table>
    </div>`}function I(e,n){let r=E(e),a=D(e,n.klubb?.id??null);return`
    <div class="kaster-stat-grid">
      <div>
        <h4>Statistikk</h4>
        <table class="app-tabell">
          <thead class="app-thead">
            <tr>
              <th></th><th>Rekord</th><th>Snitt Poeng</th><th>% Ring (frå ${x})</th>
            </tr>
          </thead>
          <tbody>${r.map(({label:e,rekord:t,snittPoeng:n,snittProsent:r})=>`
    <tr>
      <td>${e}</td>
      <td class="text-center">${t??`–`}</td>
      <td class="text-center">${n??`–`}</td>
      <td class="text-center">${r==null?`–`:i(r)}</td>
    </tr>`).join(``)}</tbody>
        </table>
      </div>
      ${a.length?`<div class="kaster-tidlegare-klubbar">
        <h4 class="kaster-tidlegare-tittel">Tidlegare klubbar</h4>
        <ul class="list-unstyled">${a.map(e=>`<li>${t(e)}</li>`).join(``)}</ul>
      </div>`:``}
    </div>`}async function L(e,t){N();let{labels:n,stevneNamn:r,verdiar:i}=k(t,j.grafMetrikk,j.grafMetode,j.grafFra?Number(j.grafFra):null,j.grafTil?Number(j.grafTil):null);if(!i.length){let t=e.parentElement;if(t){let e=f(`Ingen data for valt filter.`);e.classList.add(`pt-3`),t.replaceChildren(e)}return}let{Chart:a,registerables:s}=await o(async()=>{let{Chart:e,registerables:t}=await import(`./charts-DOFOLNDj.js`).then(e=>e.t);return{Chart:e,registerables:t}},__vite__mapDeps([0,1]));A||=(a.register(...s),!0);let c=j.grafMetrikk===`plassering`,l=c?`Plassering`:`% Ring`;M=new a(e,{type:`line`,data:{labels:n,datasets:[{label:l,data:i,borderColor:`#4e8fc7`,backgroundColor:`rgba(78,143,199,0.15)`,pointBackgroundColor:`#4e8fc7`,pointRadius:4,tension:.1,fill:!1}]},options:{responsive:!0,maintainAspectRatio:!1,scales:{x:{ticks:{maxTicksLimit:14,maxRotation:45,color:`#ccc`},grid:{color:`rgba(255,255,255,0.08)`}},y:{reverse:c,ticks:{color:`#ccc`},grid:{color:`rgba(255,255,255,0.08)`},title:{display:!0,text:l,color:`#ccc`}}},plugins:{legend:{display:!1},tooltip:{callbacks:{title:e=>{let t=e[0]?.dataIndex;return t==null?``:r[t]??n[t]??``},label:e=>`${l}: ${e.raw}`}}}}})}async function R(t,r){j.aktiv=`resultater`,j.ar=`alle`,j.stevnetype=`alle`,j.grafMetrikk=`plassering`,j.grafMetode=`kongelag`,j.grafFra=null,j.grafTil=null,N(),t.replaceChildren(d(`Laster utøvar...`));try{let{kaster:e,resultater:i,error:a}=await u(r);if(a||!e){t.replaceChildren(n(`Kunne ikkje laste utøvar.`));return}let o=e;t.innerHTML=P(o,i);let s=t.querySelector(`#kd-ar`),c=t.querySelector(`#kd-type`),l=t.querySelector(`#kd-graf-metode`);function d(){t.querySelector(`#kd-resultat-tabell`).innerHTML=F(i,j.ar,j.stevnetype)}function f(){t.querySelector(`#kd-stat-innhald`).innerHTML=I(i,o)}function m(){let e=t.querySelector(`#kd-graf-canvas`);e&&L(e,i)}function h(e){j.aktiv=e,t.querySelectorAll(`.kaster-tab-knapp`).forEach(t=>{t.classList.toggle(`active`,t.dataset.tab===e)}),t.querySelectorAll(`.kd-tab`).forEach(t=>{t.classList.toggle(`kd-skjult`,t.id!==`kd-tab-${e}`)}),e===`statistikk`&&f(),e===`graf`&&m()}d(),s.addEventListener(`change`,()=>{j.ar=s.value,d()}),c.addEventListener(`change`,()=>{j.stevnetype=c.value,d()}),t.querySelectorAll(`.kaster-tab-knapp`).forEach(e=>{e.addEventListener(`click`,()=>h(e.dataset.tab??``))});let g=t.querySelector(`#kd-graf-metrikk`);g.addEventListener(`change`,()=>{j.grafMetrikk=g.value,l.classList.toggle(`d-none`,g.value!==`prosent`),m()}),l.addEventListener(`change`,()=>{j.grafMetode=l.value,m()});let _=t.querySelector(`#kd-graf-fra`),v=t.querySelector(`#kd-graf-til`);_.addEventListener(`change`,()=>{j.grafFra=_.value||null,m()}),v.addEventListener(`change`,()=>{j.grafTil=v.value||null,m()}),p(t,{href:`#/kaster/${r}/admin`,label:`Rediger utøvar`,variant:`warning`,canShow:e=>e.profil?.rolle===`admin`||e.profil?.rolle===`klubbadmin`&&e.klubber.includes(o.klubbid??-1)})}catch(r){e(`renderDetalj`,r),t.replaceChildren(n(`Kunne ikkje laste utøvar.`))}}var z=async(e,t)=>{N(),t.id?await R(e,Number(t.id)):await b(e)};export{z as render};