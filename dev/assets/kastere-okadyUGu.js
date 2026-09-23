const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/charts-CgrTDfr8.js","assets/rolldown-runtime-DK3Fl9T5.js"])))=>i.map(i=>d[i]);
import{t as e}from"./preload-helper-tDRSoqHn.js";import{t}from"./logError-ByTg738k.js";import{S as n,_r as r,b as i,f as a,gr as o,i as s,or as c,vr as l,yr as u}from"./index-DSCLt71t.js";import{i as d,l as f,r as p}from"./kasterService-BN8H2rLx.js";import{t as m}from"./SearchInput-CDoDGwhR.js";import{t as h}from"./AdminLinkBar-DnnShfRb.js";import{t as g}from"./formatPercent-BwRoJDn7.js";var _=2017,v={kongelag:40,minimatch:60,halvmatch:100,heilmatch:200};function y(e){return e.length?Math.round(e.reduce((e,t)=>e+t,0)/e.length):null}function b(e,t){let n=t.direction===`asc`?1:-1;return[...e].sort((e,r)=>{if(t.column===`plassering`){let t=e.plassering,i=r.plassering;return t==null&&i==null?0:t==null?1:i==null?-1:(t-i)*n}return(e.stevne?.dato??``).localeCompare(r.stevne?.dato??``)*n})}function x(e,t){return e.column===t?{column:t,direction:e.direction===`asc`?`desc`:`asc`}:{column:t,direction:t===`plassering`?`asc`:`desc`}}function S(e){return{years:[...new Set(e.map(e=>o(e.stevne?.dato)).filter(e=>e!==null))].sort((e,t)=>t-e),types:[...new Map(e.map(e=>e.stevne?.stevnetype).filter(e=>e!=null).map(e=>[e.id,e.navn])).entries()].sort((e,t)=>e[1].localeCompare(t[1]))}}function C(e,t,n){return e.filter(e=>!(t!==`alle`&&String(o(e.stevne?.dato))!==t||n!==`alle`&&String(e.stevne?.stevnetype?.id)!==n))}function w(e,t){let n=(e.stevne?.innledendekastemetode?.navn??``).toLowerCase(),r=(e.stevne?.avsluttendekastemetode?.navn??``).toLowerCase();return n===t||r===t}function T(e){return[{label:`Kongelag`,rader:e.filter(e=>e.poeng_kongelag!=null),poengFn:e=>e.poeng_kongelag,ringFn:e=>e.antall_ring_kongelag,maxRing:v.kongelag},...[`minimatch`,`halvmatch`,`heilmatch`].map(t=>({label:t.charAt(0).toUpperCase()+t.slice(1),rader:e.filter(e=>e.poeng_xkast!=null&&w(e,t)),poengFn:e=>e.poeng_xkast,ringFn:e=>e.antall_ring_xkast,maxRing:v[t]}))].map(({label:e,rader:t,poengFn:n,ringFn:r,maxRing:i})=>{let a=t.length?Math.max(...t.map(e=>n(e))):null,s=y(t.map(e=>n(e))),c=t.filter(e=>r(e)!=null&&(o(e.stevne?.dato)??0)>=2017);return{label:e,rekord:a,snittPoeng:s,snittProsent:c.length?Math.round(c.reduce((e,t)=>e+r(t)/i*100,0)/c.length*100)/100:null}})}function E(e,t){let n=new Map;for(let r of e)r.klubb?.id&&r.klubb.id!==t&&n.set(r.klubb.id,r.klubb.navn);return[...n.values()]}function D(e,t,n){return t===`plassering`?e.plassering??null:n===`kongelag`?e.antall_ring_kongelag==null?null:Math.round(e.antall_ring_kongelag/v.kongelag*1e4)/100:w(e,n)?e.antall_ring_xkast==null?null:Math.round(e.antall_ring_xkast/v[n]*1e4)/100:null}function O(e,t,n,r,i){let a=[...e].filter(e=>{let a=o(e.stevne?.dato);return r&&(a??0)<r||i&&(a??0)>i?!1:D(e,t,n)!=null}).sort((e,t)=>(e.stevne?.dato??``).localeCompare(t.stevne?.dato??``));return{labels:a.map(e=>c(e.stevne?.dato)),stevneNamn:a.map(e=>e.stevne?.navn??``),verdiar:a.map(e=>D(e,t,n))}}var k={active:`resultater`,year:`alle`,tournamentType:`alle`,resultSort:{column:`dato`,direction:`desc`},chartMetric:`plassering`,chartMethod:`kongelag`,chartFrom:null,chartTo:null},A=!1,j=null;function M(){j&&=(j.destroy(),null)}function N(e,t){let r=a(n(e)),i=e.medlemsnummer?` ${e.medlemsnummer}`:``,{years:o,types:s}=S(t),c=k.chartMetric===`prosent`?``:` d-none`;return`
    <div class="content-page">
      <h1 class="thrower-detail-title">${r}${a(i)}</h1>
      <p class="thrower-detail-club">${a(e.klubb?.navn??`–`)}</p>

      <div class="thrower-tab-row">
        <button class="btn btn-sm thrower-tab-button${k.active===`resultater`?` active`:``}" data-tab="resultater">Resultat</button>
        <button class="btn btn-sm thrower-tab-button${k.active===`statistikk`?` active`:``}" data-tab="statistikk">Statistikk</button>
        <button class="btn btn-sm thrower-tab-button${k.active===`graf`?` active`:``}" data-tab="graf">Vis graf</button>
      </div>
      <hr>

      <div id="kd-tab-resultater" class="kd-tab${k.active===`resultater`?``:` kd-hidden`}">
        <div class="filter-row mb-3">
          <select id="kd-year" class="app-select">
            <option value="alle">Vel årstal</option>
            ${o.map(e=>`<option value="${e}"${k.year==String(e)?` selected`:``}>${e}</option>`).join(``)}
          </select>
          <select id="kd-type" class="app-select">
            <option value="alle">Alle stevnetypar</option>
            ${s.map(([e,t])=>`<option value="${e}">${a(t)}</option>`).join(``)}
          </select>
        </div>
        <div id="kd-result-table"></div>
      </div>

      <div id="kd-tab-statistikk" class="kd-tab${k.active===`statistikk`?``:` kd-hidden`}">
        <div id="kd-statistics-content"></div>
      </div>

      <div id="kd-tab-graf" class="kd-tab${k.active===`graf`?``:` kd-hidden`}">
        <div class="filter-row mb-3">
          <select id="kd-chart-metric" class="app-select">
            <option value="plassering"${k.chartMetric===`plassering`?` selected`:``}>Plassering</option>
            <option value="prosent"${k.chartMetric===`prosent`?` selected`:``}>% Ring (frå 2017)</option>
          </select>
          <select id="kd-chart-method" class="app-select${c}">
            <option value="kongelag"${k.chartMethod===`kongelag`?` selected`:``}>Kongelag</option>
            <option value="minimatch"${k.chartMethod===`minimatch`?` selected`:``}>Minimatch</option>
            <option value="halvmatch"${k.chartMethod===`halvmatch`?` selected`:``}>Halvmatch</option>
            <option value="heilmatch"${k.chartMethod===`heilmatch`?` selected`:``}>Heilmatch</option>
          </select>
          <select id="kd-chart-from" class="app-select">
            <option value="">Frå år</option>
            ${o.map(e=>`<option value="${e}"${k.chartFrom==String(e)?` selected`:``}>${e}</option>`).join(``)}
          </select>
          <select id="kd-chart-to" class="app-select">
            <option value="">Til år</option>
            ${o.map(e=>`<option value="${e}"${k.chartTo==String(e)?` selected`:``}>${e}</option>`).join(``)}
          </select>
        </div>
        <div class="thrower-chart-wrapper">
          <canvas id="kd-chart-canvas"></canvas>
        </div>
      </div>
    </div>`}function P(e,t,n){return t==null?``:`<span class="kd-round-chip">${e} ${n==null?`${t}`:`${t} (${n})`}</span>`}function F(e,t){return`<span class="kd-sort-icon${e?` kd-sort-icon--active`:``}" aria-hidden="true">${e?t===`asc`?`↑`:`↓`:`↕`}</span>`}function I(e,t,n){let r=n.column===e,i=n.direction===`asc`?`stigande`:`synkande`,a=r?`Sortert etter ${t}, ${i}. Vel for å snu.`:`Sorter etter ${t}`;return`<button type="button" class="kd-sort-btn${r?` kd-sort-btn--active`:``}" data-sort="${e}" aria-pressed="${r}" aria-label="${a}">${t}${F(r,n.direction)}</button>`}function L(e,t,n,r){let i=C(e,t,n),o=i.length,s=`
    <div class="thrower-result-info">
      <span>Antal: <strong>${o}</strong></span>
      <span class="thrower-result-hint">Antal ringar i parentes (frå ${_})</span>
    </div>`;if(!o)return s+`<p class="empty-state">Ingen resultat funnet.</p>`;let l=`
    <div class="kd-res-head">
      <div class="kd-res-head__date">Sortér: ${I(`dato`,`Dato`,r)}</div>
      <span class="kd-res-head__label kd-res-head__label--name">Stevne</span>
      <span class="kd-res-head__label kd-res-head__label--type">Type</span>
      <span class="kd-res-head__label kd-res-head__label--klubb">Klubb</span>
      <span class="kd-res-head__label kd-res-head__label--chips">Rundar</span>
      <div class="kd-res-head__pl">${I(`plassering`,`Pl.`,r)}</div>
    </div>`,u=b(i,r).map(e=>{let t=e.stevne,n=t?.id?`<a href="#/stevne/${t.id}/resultat" class="kd-res-row__name">${a(t.navn??``)}</a>`:`<span class="kd-res-row__name">${a(t?.navn??`–`)}</span>`,r=P(`X-kast`,e.poeng_xkast,e.antall_ring_xkast)+P(`Kongelag`,e.poeng_kongelag,e.antall_ring_kongelag),i=e.plassering==null?`<span class="kd-res-row__pl kd-res-row__pl--empty">–</span>`:`<span class="kd-res-row__pl">${e.plassering}</span>`;return`
      <div class="kd-res-row">
        ${n}
        <div class="kd-res-row__meta">
          <span class="kd-res-row__date">${c(t?.dato)}</span>
          <span class="kd-res-row__type">${a(t?.stevnetype?.navn??`–`)}</span>
          <span class="kd-res-row__klubb">${a(e.klubb?.navn??`–`)}</span>
        </div>
        <div class="kd-res-row__chips">${r}</div>
        ${i}
      </div>`}).join(``);return s+l+`<div class="kd-res-list">${u}</div>`}function R(e,t){let n=T(e),r=E(e,t.klubb?.id??null);return`
    <div class="thrower-stat-grid">
      <div>
        <h4>Statistikk</h4>
        <table class="app-table">
          <thead class="app-thead">
            <tr>
              <th></th><th>Rekord</th><th>Snitt Poeng</th><th>% Ring (frå ${_})</th>
            </tr>
          </thead>
          <tbody>${n.map(({label:e,rekord:t,snittPoeng:n,snittProsent:r})=>`
    <tr>
      <td>${e}</td>
      <td class="text-center">${t??`–`}</td>
      <td class="text-center">${n??`–`}</td>
      <td class="text-center">${r==null?`–`:g(r)}</td>
    </tr>`).join(``)}</tbody>
        </table>
      </div>
      ${r.length?`<div class="thrower-previous-clubs">
        <h4 class="thrower-previous-title">Tidlegare klubbar</h4>
        <ul class="list-unstyled">${r.map(e=>`<li>${a(e)}</li>`).join(``)}</ul>
      </div>`:``}
    </div>`}async function z(t,n){M();let{labels:i,stevneNamn:a,verdiar:o}=O(n,k.chartMetric,k.chartMethod,k.chartFrom?Number(k.chartFrom):null,k.chartTo?Number(k.chartTo):null);if(!o.length){let e=t.parentElement;if(e){let t=r(`Ingen data for valt filter.`);t.classList.add(`pt-3`),e.replaceChildren(t)}return}let{Chart:s,registerables:c}=await e(async()=>{let{Chart:e,registerables:t}=await import(`./charts-CgrTDfr8.js`).then(e=>e.t);return{Chart:e,registerables:t}},__vite__mapDeps([0,1]));A||=(s.register(...c),!0);let l=k.chartMetric===`plassering`,u=l?`Plassering`:`% Ring`;j=new s(t,{type:`line`,data:{labels:i,datasets:[{label:u,data:o,borderColor:`#4e8fc7`,backgroundColor:`rgba(78,143,199,0.15)`,pointBackgroundColor:`#4e8fc7`,pointRadius:4,tension:.1,fill:!1}]},options:{responsive:!0,maintainAspectRatio:!1,scales:{x:{ticks:{maxTicksLimit:14,maxRotation:45,color:`#ccc`},grid:{color:`rgba(255,255,255,0.08)`}},y:{reverse:l,ticks:{color:`#ccc`},grid:{color:`rgba(255,255,255,0.08)`},title:{display:!0,text:u,color:`#ccc`}}},plugins:{legend:{display:!1},tooltip:{callbacks:{title:e=>{let t=e[0]?.dataIndex;return t==null?``:a[t]??i[t]??``},label:e=>`${u}: ${String(e.raw)}`}}}}})}async function B(e,r){k.active=`resultater`,k.year=`alle`,k.tournamentType=`alle`,k.resultSort={column:`dato`,direction:`desc`},k.chartMetric=`plassering`,k.chartMethod=`kongelag`,k.chartFrom=null,k.chartTo=null,e.replaceChildren(u(`Laster utøvar...`));try{let{kaster:t,resultater:i,error:a}=await f(r);if(a||!t){e.replaceChildren(l(`Kunne ikkje laste utøvar.`));return}let o=t;s(n(o)),e.innerHTML=N(o,i);let c=e.querySelector(`#kd-year`),u=e.querySelector(`#kd-type`),d=e.querySelector(`#kd-chart-method`),p=e.querySelector(`#kd-result-table`);function m(){p.innerHTML=L(i,k.year,k.tournamentType,k.resultSort)}p.addEventListener(`click`,e=>{let t=e.target.closest(`[data-sort]`);t&&(k.resultSort=x(k.resultSort,t.dataset.sort),m())});function g(){e.querySelector(`#kd-statistics-content`).innerHTML=R(i,o)}function _(){let t=e.querySelector(`#kd-chart-canvas`);t&&z(t,i)}function v(t){k.active=t,e.querySelectorAll(`.thrower-tab-button`).forEach(e=>{e.classList.toggle(`active`,e.dataset.tab===t)}),e.querySelectorAll(`.kd-tab`).forEach(e=>{e.classList.toggle(`kd-hidden`,e.id!==`kd-tab-${t}`)}),t===`statistikk`&&g(),t===`graf`&&_()}m(),c.addEventListener(`change`,()=>{k.year=c.value,m()}),u.addEventListener(`change`,()=>{k.tournamentType=u.value,m()}),e.querySelectorAll(`.thrower-tab-button`).forEach(e=>{e.addEventListener(`click`,()=>v(e.dataset.tab??``))});let y=e.querySelector(`#kd-chart-metric`);y.addEventListener(`change`,()=>{k.chartMetric=y.value,d.classList.toggle(`d-none`,y.value!==`prosent`),_()}),d.addEventListener(`change`,()=>{k.chartMethod=d.value,_()});let b=e.querySelector(`#kd-chart-from`),S=e.querySelector(`#kd-chart-to`);b.addEventListener(`change`,()=>{k.chartFrom=b.value||null,_()}),S.addEventListener(`change`,()=>{k.chartTo=S.value||null,_()}),h(e,{href:`#/kaster/${r}/admin`,label:`Rediger utøvar`,variant:`warning`,canShow:e=>e.profil?.role===`admin`||e.profil?.role===`klubbadmin`&&e.clubs.includes(o.klubbid??-1)})}catch(n){t(`kastere.renderDetail`,n),e.replaceChildren(l(`Kunne ikkje laste utøvar.`))}}var V=24,H=`https://placehold.co/200x200/444/888?text=?`,U={showAll:!1,searchText:``,page:1};function W(e){let t=n(e);return`
    <a href="#/kastere/${i(e)}" class="thrower-card">
      <img src="${a(e.avatarurl||H)}" alt="${a(t)}" loading="lazy">
      <div class="thrower-name">${a(t)}</div>
      <div class="thrower-club">${a(e.klubb?.navn??`–`)}</div>
    </a>`}function G(){return`
    <div class="content-page">
      <div class="thrower-list-controls">
        <div class="filter-row"><span id="thrower-search-slot"></span></div>
        <div class="mt-2">
          <label class="thrower-checkbox-label">
            <input type="checkbox" id="thrower-active-only"${U.showAll?``:` checked`}>
            Vis berre aktive utøvarar
          </label>
        </div>
      </div>
      <div id="thrower-page-info" class="my-2"></div>
      <div id="thrower-pagination-top"></div>
      <div id="thrower-grid" class="thrower-grid"></div>
      <div id="thrower-pagination-bottom"></div>
    </div>`}function K(e,t){if(t<=1)return``;let n=(t,n,r)=>`<button class="btn btn-sm ${n===e?`btn-primary`:`btn-outline-secondary`} pag-button"
      data-page="${n}" ${r?`disabled`:``}>${t}</button>`;return`
    <div class="thrower-pagination">
      ${n(`«`,1,e===1)}
      ${n(`‹`,e-1,e===1)}
      <span class="pag-info">side ${e} av ${t}</span>
      ${n(`›`,e+1,e===t)}
      ${n(`»`,t,e===t)}
    </div>`}async function q(e){e.replaceChildren(u(`Laster utøvarar...`));try{let t=U.showAll?await d():await p();if(t.error){e.replaceChildren(l(`Kunne ikkje laste utøvarar.`));return}let r=t.data;e.innerHTML=G();let i=e.querySelector(`#thrower-grid`),a=e.querySelector(`#thrower-page-info`),o=e.querySelector(`#thrower-pagination-top`),s=e.querySelector(`#thrower-pagination-bottom`),c=e.querySelector(`#thrower-active-only`);function u(){let e=U.searchText.trim().toLowerCase(),t=r;e&&(t=t.filter(t=>n(t).toLowerCase().includes(e)||(t.klubb?.navn??``).toLowerCase().includes(e)));let c=t.length,l=Math.max(1,Math.ceil(c/V));U.page>l&&(U.page=1);let u=(U.page-1)*V,d=t.slice(u,u+V);a.innerHTML=`side ${U.page} av ${l}`;let f=K(U.page,l);o.innerHTML=f,s.innerHTML=f,i.innerHTML=d.map(e=>W(e)).join(``)}m({slot:e.querySelector(`#thrower-search-slot`),placeholder:`Søk på navn/klubb`,state:U,onInput:()=>{U.page=1,u()}}),u(),c.addEventListener(`change`,async()=>{U.showAll=!c.checked,U.page=1;let{data:e,error:t}=U.showAll?await d():await p();t||(r=e),u()}),e.addEventListener(`click`,t=>{let n=t.target.closest(`.pag-button`);!n||n.disabled||(U.page=Number(n.dataset.page),u(),e.querySelector(`.content-page`)?.scrollIntoView({behavior:`smooth`}))}),h(e,{href:`#/kaster/ny`,label:`+ Ny utøvar`,variant:`success`,canShow:e=>e.profil?.role===`admin`||e.profil?.role===`klubbadmin`})}catch(n){t(`kastere.renderList`,n),e.replaceChildren(l(`Kunne ikkje laste utøvarar.`))}}var J=async(e,t)=>{M(),t.id?await B(e,Number(t.id)):await q(e)};export{J as render};