const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/charts-CgrTDfr8.js","assets/rolldown-runtime-DK3Fl9T5.js"])))=>i.map(i=>d[i]);
import{t as e}from"./preload-helper-tDRSoqHn.js";import{t}from"./logError-ByTg738k.js";import{H as n,S as r,U as i,_r as a,ar as o,b as s,f as c,gr as l,hr as u,i as d,vr as f}from"./index-ScyQGOLm.js";import{i as p,l as m,r as h}from"./kasterService-y8FvzW53.js";import{t as g}from"./SearchInput-CDoDGwhR.js";import{t as _}from"./AdminLinkBar-DZ-MO_7O.js";import{t as v}from"./formatPercent-BwRoJDn7.js";var y=2017,b={kongelag:40,minimatch:60,halvmatch:100,heilmatch:200};function x(e){return e.length?Math.round(e.reduce((e,t)=>e+t,0)/e.length):null}function S(e,t){let n=t.direction===`asc`?1:-1;return[...e].sort((e,r)=>{if(t.column===`plassering`){let t=e.plassering,i=r.plassering;return t==null&&i==null?0:t==null?1:i==null?-1:(t-i)*n}return(e.stevne?.dato??``).localeCompare(r.stevne?.dato??``)*n})}function C(e,t){return e.column===t?{column:t,direction:e.direction===`asc`?`desc`:`asc`}:{column:t,direction:t===`plassering`?`asc`:`desc`}}function w(e){return{years:[...new Set(e.map(e=>u(e.stevne?.dato)).filter(e=>e!==null))].sort((e,t)=>t-e),types:[...new Map(e.map(e=>e.stevne?.stevnetype).filter(e=>e!=null).map(e=>[e.id,e.navn])).entries()].sort((e,t)=>e[1].localeCompare(t[1]))}}function T(e,t,n){return e.filter(e=>!(t!==`alle`&&String(u(e.stevne?.dato))!==t||n!==`alle`&&String(e.stevne?.stevnetype?.id)!==n))}function E(e,t){let n=(e.stevne?.innledendekastemetode?.navn??``).toLowerCase(),r=(e.stevne?.avsluttendekastemetode?.navn??``).toLowerCase();return n===t||r===t}function D(e){return[{label:`Kongelag`,rader:e.filter(e=>e.poeng_kongelag!=null),poengFn:e=>e.poeng_kongelag,ringFn:e=>e.antall_ring_kongelag,maxRing:b.kongelag},...[`minimatch`,`halvmatch`,`heilmatch`].map(t=>({label:t.charAt(0).toUpperCase()+t.slice(1),rader:e.filter(e=>e.poeng_xkast!=null&&E(e,t)),poengFn:e=>e.poeng_xkast,ringFn:e=>e.antall_ring_xkast,maxRing:b[t]}))].map(({label:e,rader:t,poengFn:n,ringFn:r,maxRing:i})=>{let a=t.length?Math.max(...t.map(e=>n(e))):null,o=x(t.map(e=>n(e))),s=t.filter(e=>r(e)!=null&&(u(e.stevne?.dato)??0)>=2017);return{label:e,rekord:a,snittPoeng:o,snittProsent:s.length?Math.round(s.reduce((e,t)=>e+r(t)/i*100,0)/s.length*100)/100:null}})}function O(e,t){let n=new Map;for(let r of e)r.klubb?.id&&r.klubb.id!==t&&n.set(r.klubb.id,r.klubb.navn);return[...n.values()]}function k(e,t,n){return t===`plassering`?e.plassering??null:n===`kongelag`?e.antall_ring_kongelag==null?null:Math.round(e.antall_ring_kongelag/b.kongelag*1e4)/100:E(e,n)?e.antall_ring_xkast==null?null:Math.round(e.antall_ring_xkast/b[n]*1e4)/100:null}function A(e,t,n,r,i){let a=[...e].filter(e=>{let a=u(e.stevne?.dato);return r&&(a??0)<r||i&&(a??0)>i?!1:k(e,t,n)!=null}).sort((e,t)=>(e.stevne?.dato??``).localeCompare(t.stevne?.dato??``));return{labels:a.map(e=>o(e.stevne?.dato)),stevneNamn:a.map(e=>e.stevne?.navn??``),verdiar:a.map(e=>k(e,t,n))}}var j={active:`resultater`,year:`alle`,tournamentType:`alle`,resultSort:{column:`dato`,direction:`desc`},chartMetric:`plassering`,chartMethod:`kongelag`,chartFrom:null,chartTo:null},M=!1,N=null;function P(){N&&=(N.destroy(),null)}function F(e,t){let n=c(r(e)),i=e.medlemsnummer?` ${e.medlemsnummer}`:``,{years:a,types:o}=w(t),s=j.chartMetric===`prosent`?``:` d-none`;return`
    <div class="content-page">
      <h1 class="thrower-detail-title">${n}${c(i)}</h1>
      <p class="thrower-detail-club">${c(e.klubb?.navn??`–`)}</p>

      <div class="thrower-tab-row">
        <button class="btn btn-sm thrower-tab-button${j.active===`resultater`?` active`:``}" data-tab="resultater">Resultat</button>
        <button class="btn btn-sm thrower-tab-button${j.active===`statistikk`?` active`:``}" data-tab="statistikk">Statistikk</button>
        <button class="btn btn-sm thrower-tab-button${j.active===`graf`?` active`:``}" data-tab="graf">Vis graf</button>
      </div>
      <hr>

      <div id="kd-tab-resultater" class="kd-tab${j.active===`resultater`?``:` kd-hidden`}">
        <div class="filter-row mb-3">
          <select id="kd-year" class="app-select">
            <option value="alle">Vel årstal</option>
            ${a.map(e=>`<option value="${e}"${j.year==String(e)?` selected`:``}>${e}</option>`).join(``)}
          </select>
          <select id="kd-type" class="app-select">
            <option value="alle">Alle stevnetypar</option>
            ${o.map(([e,t])=>`<option value="${e}">${c(t)}</option>`).join(``)}
          </select>
        </div>
        <div id="kd-result-table"></div>
      </div>

      <div id="kd-tab-statistikk" class="kd-tab${j.active===`statistikk`?``:` kd-hidden`}">
        <div id="kd-statistics-content"></div>
      </div>

      <div id="kd-tab-graf" class="kd-tab${j.active===`graf`?``:` kd-hidden`}">
        <div class="filter-row mb-3">
          <select id="kd-chart-metric" class="app-select">
            <option value="plassering"${j.chartMetric===`plassering`?` selected`:``}>Plassering</option>
            <option value="prosent"${j.chartMetric===`prosent`?` selected`:``}>% Ring (frå 2017)</option>
          </select>
          <select id="kd-chart-method" class="app-select${s}">
            <option value="kongelag"${j.chartMethod===`kongelag`?` selected`:``}>Kongelag</option>
            <option value="minimatch"${j.chartMethod===`minimatch`?` selected`:``}>Minimatch</option>
            <option value="halvmatch"${j.chartMethod===`halvmatch`?` selected`:``}>Halvmatch</option>
            <option value="heilmatch"${j.chartMethod===`heilmatch`?` selected`:``}>Heilmatch</option>
          </select>
          <select id="kd-chart-from" class="app-select">
            <option value="">Frå år</option>
            ${a.map(e=>`<option value="${e}"${j.chartFrom==String(e)?` selected`:``}>${e}</option>`).join(``)}
          </select>
          <select id="kd-chart-to" class="app-select">
            <option value="">Til år</option>
            ${a.map(e=>`<option value="${e}"${j.chartTo==String(e)?` selected`:``}>${e}</option>`).join(``)}
          </select>
        </div>
        <div class="thrower-chart-wrapper">
          <canvas id="kd-chart-canvas"></canvas>
        </div>
      </div>
    </div>`}function I(e,t,n){return t==null?``:`<span class="kd-round-chip">${e} ${n==null?`${t}`:`${t} (${n})`}</span>`}function L(e,t){return`<span class="kd-sort-icon${e?` kd-sort-icon--active`:``}" aria-hidden="true">${e?t===`asc`?`↑`:`↓`:`↕`}</span>`}function R(e,t,n){let r=n.column===e,i=n.direction===`asc`?`stigande`:`synkande`,a=r?`Sortert etter ${t}, ${i}. Vel for å snu.`:`Sorter etter ${t}`;return`<button type="button" class="kd-sort-btn${r?` kd-sort-btn--active`:``}" data-sort="${e}" aria-pressed="${r}" aria-label="${a}">${t}${L(r,n.direction)}</button>`}function z(e,t,n,r){let i=T(e,t,n),a=i.length,s=`
    <div class="thrower-result-info">
      <span>Antal: <strong>${a}</strong></span>
      <span class="thrower-result-hint">Antal ringar i parentes (frå ${y})</span>
    </div>`;if(!a)return s+`<p class="empty-state">Ingen resultat funnet.</p>`;let l=`
    <div class="kd-res-head">
      <div class="kd-res-head__date">Sortér: ${R(`dato`,`Dato`,r)}</div>
      <span class="kd-res-head__label kd-res-head__label--name">Stevne</span>
      <span class="kd-res-head__label kd-res-head__label--type">Type</span>
      <span class="kd-res-head__label kd-res-head__label--klubb">Klubb</span>
      <span class="kd-res-head__label kd-res-head__label--chips">Rundar</span>
      <div class="kd-res-head__pl">${R(`plassering`,`Pl.`,r)}</div>
    </div>`,u=S(i,r).map(e=>{let t=e.stevne,n=t?.id?`<a href="#/stevne/${t.id}/resultat" class="kd-res-row__name">${c(t.navn??``)}</a>`:`<span class="kd-res-row__name">${c(t?.navn??`–`)}</span>`,r=I(`X-kast`,e.poeng_xkast,e.antall_ring_xkast)+I(`Kongelag`,e.poeng_kongelag,e.antall_ring_kongelag),i=e.plassering==null?`<span class="kd-res-row__pl kd-res-row__pl--empty">–</span>`:`<span class="kd-res-row__pl">${e.plassering}</span>`;return`
      <div class="kd-res-row">
        ${n}
        <div class="kd-res-row__meta">
          <span class="kd-res-row__date">${o(t?.dato)}</span>
          <span class="kd-res-row__type">${c(t?.stevnetype?.navn??`–`)}</span>
          <span class="kd-res-row__klubb">${c(e.klubb?.navn??`–`)}</span>
        </div>
        <div class="kd-res-row__chips">${r}</div>
        ${i}
      </div>`}).join(``);return s+l+`<div class="kd-res-list">${u}</div>`}function B(e,t){let n=D(e),r=O(e,t.klubb?.id??null);return`
    <div class="thrower-stat-grid">
      <div>
        <h4>Statistikk</h4>
        <table class="app-table">
          <thead class="app-thead">
            <tr>
              <th></th><th>Rekord</th><th>Snitt Poeng</th><th>% Ring (frå ${y})</th>
            </tr>
          </thead>
          <tbody>${n.map(({label:e,rekord:t,snittPoeng:n,snittProsent:r})=>`
    <tr>
      <td>${e}</td>
      <td class="text-center">${t??`–`}</td>
      <td class="text-center">${n??`–`}</td>
      <td class="text-center">${r==null?`–`:v(r)}</td>
    </tr>`).join(``)}</tbody>
        </table>
      </div>
      ${r.length?`<div class="thrower-previous-clubs">
        <h4 class="thrower-previous-title">Tidlegare klubbar</h4>
        <ul class="list-unstyled">${r.map(e=>`<li>${c(e)}</li>`).join(``)}</ul>
      </div>`:``}
    </div>`}async function V(t,n){P();let{labels:r,stevneNamn:i,verdiar:a}=A(n,j.chartMetric,j.chartMethod,j.chartFrom?Number(j.chartFrom):null,j.chartTo?Number(j.chartTo):null);if(!a.length){let e=t.parentElement;if(e){let t=l(`Ingen data for valt filter.`);t.classList.add(`pt-3`),e.replaceChildren(t)}return}let{Chart:o,registerables:s}=await e(async()=>{let{Chart:e,registerables:t}=await import(`./charts-CgrTDfr8.js`).then(e=>e.t);return{Chart:e,registerables:t}},__vite__mapDeps([0,1]));M||=(o.register(...s),!0);let c=j.chartMetric===`plassering`,u=c?`Plassering`:`% Ring`;N=new o(t,{type:`line`,data:{labels:r,datasets:[{label:u,data:a,borderColor:`#4e8fc7`,backgroundColor:`rgba(78,143,199,0.15)`,pointBackgroundColor:`#4e8fc7`,pointRadius:4,tension:.1,fill:!1}]},options:{responsive:!0,maintainAspectRatio:!1,scales:{x:{ticks:{maxTicksLimit:14,maxRotation:45,color:`#ccc`},grid:{color:`rgba(255,255,255,0.08)`}},y:{reverse:c,ticks:{color:`#ccc`},grid:{color:`rgba(255,255,255,0.08)`},title:{display:!0,text:u,color:`#ccc`}}},plugins:{legend:{display:!1},tooltip:{callbacks:{title:e=>{let t=e[0]?.dataIndex;return t==null?``:i[t]??r[t]??``},label:e=>`${u}: ${String(e.raw)}`}}}}})}async function H(e,i){j.active=`resultater`,j.year=`alle`,j.tournamentType=`alle`,j.resultSort={column:`dato`,direction:`desc`},j.chartMetric=`plassering`,j.chartMethod=`kongelag`,j.chartFrom=null,j.chartTo=null,e.replaceChildren(f(`Laster utøvar...`));try{let{kaster:t,resultater:o,error:s}=await m(i);if(s||!t){e.replaceChildren(a(`Kunne ikkje laste utøvar.`));return}let c=t;d(r(c)),e.innerHTML=F(c,o);let l=e.querySelector(`#kd-year`),u=e.querySelector(`#kd-type`),f=e.querySelector(`#kd-chart-method`),p=e.querySelector(`#kd-result-table`);function h(){p.innerHTML=z(o,j.year,j.tournamentType,j.resultSort)}p.addEventListener(`click`,e=>{let t=e.target.closest(`[data-sort]`);t&&(j.resultSort=C(j.resultSort,t.dataset.sort),h())});function g(){e.querySelector(`#kd-statistics-content`).innerHTML=B(o,c)}function v(){let t=e.querySelector(`#kd-chart-canvas`);t&&V(t,o)}function y(t){j.active=t,e.querySelectorAll(`.thrower-tab-button`).forEach(e=>{e.classList.toggle(`active`,e.dataset.tab===t)}),e.querySelectorAll(`.kd-tab`).forEach(e=>{e.classList.toggle(`kd-hidden`,e.id!==`kd-tab-${t}`)}),t===`statistikk`&&g(),t===`graf`&&v()}h(),l.addEventListener(`change`,()=>{j.year=l.value,h()}),u.addEventListener(`change`,()=>{j.tournamentType=u.value,h()}),e.querySelectorAll(`.thrower-tab-button`).forEach(e=>{e.addEventListener(`click`,()=>y(e.dataset.tab??``))});let b=e.querySelector(`#kd-chart-metric`);b.addEventListener(`change`,()=>{j.chartMetric=b.value,f.classList.toggle(`d-none`,b.value!==`prosent`),v()}),f.addEventListener(`change`,()=>{j.chartMethod=f.value,v()});let x=e.querySelector(`#kd-chart-from`),S=e.querySelector(`#kd-chart-to`);x.addEventListener(`change`,()=>{j.chartFrom=x.value||null,v()}),S.addEventListener(`change`,()=>{j.chartTo=S.value||null,v()}),_(e,{href:`#/kaster/${i}/admin`,label:`Rediger utøvar`,variant:`warning`,canShow:e=>n(e,c.klubbid)})}catch(n){t(`kastere.renderDetail`,n),e.replaceChildren(a(`Kunne ikkje laste utøvar.`))}}var U=24,W=`https://placehold.co/200x200/444/888?text=?`,G={showAll:!1,searchText:``,page:1};function K(e){let t=r(e);return`
    <a href="#/kastere/${s(e)}" class="thrower-card">
      <img src="${c(e.avatarurl||W)}" alt="${c(t)}" loading="lazy">
      <div class="thrower-name">${c(t)}</div>
      <div class="thrower-club">${c(e.klubb?.navn??`–`)}</div>
    </a>`}function q(){return`
    <div class="content-page">
      <div class="thrower-list-controls">
        <div class="filter-row"><span id="thrower-search-slot"></span></div>
        <div class="mt-2">
          <label class="thrower-checkbox-label">
            <input type="checkbox" id="thrower-active-only"${G.showAll?``:` checked`}>
            Vis berre aktive utøvarar
          </label>
        </div>
      </div>
      <div id="thrower-page-info" class="my-2"></div>
      <div id="thrower-pagination-top"></div>
      <div id="thrower-grid" class="thrower-grid"></div>
      <div id="thrower-pagination-bottom"></div>
    </div>`}function J(e,t){if(t<=1)return``;let n=(t,n,r)=>`<button class="btn btn-sm ${n===e?`btn-primary`:`btn-outline-secondary`} pag-button"
      data-page="${n}" ${r?`disabled`:``}>${t}</button>`;return`
    <div class="thrower-pagination">
      ${n(`«`,1,e===1)}
      ${n(`‹`,e-1,e===1)}
      <span class="pag-info">side ${e} av ${t}</span>
      ${n(`›`,e+1,e===t)}
      ${n(`»`,t,e===t)}
    </div>`}async function Y(e){e.replaceChildren(f(`Laster utøvarar...`));try{let t=G.showAll?await p():await h();if(t.error){e.replaceChildren(a(`Kunne ikkje laste utøvarar.`));return}let n=t.data;e.innerHTML=q();let o=e.querySelector(`#thrower-grid`),s=e.querySelector(`#thrower-page-info`),c=e.querySelector(`#thrower-pagination-top`),l=e.querySelector(`#thrower-pagination-bottom`),u=e.querySelector(`#thrower-active-only`);function d(){let e=G.searchText.trim().toLowerCase(),t=n;e&&(t=t.filter(t=>r(t).toLowerCase().includes(e)||(t.klubb?.navn??``).toLowerCase().includes(e)));let i=t.length,a=Math.max(1,Math.ceil(i/U));G.page>a&&(G.page=1);let u=(G.page-1)*U,d=t.slice(u,u+U);s.innerHTML=`side ${G.page} av ${a}`;let f=J(G.page,a);c.innerHTML=f,l.innerHTML=f,o.innerHTML=d.map(e=>K(e)).join(``)}g({slot:e.querySelector(`#thrower-search-slot`),placeholder:`Søk på navn/klubb`,state:G,onInput:()=>{G.page=1,d()}}),d(),u.addEventListener(`change`,async()=>{G.showAll=!u.checked,G.page=1;let{data:e,error:t}=G.showAll?await p():await h();t||(n=e),d()}),e.addEventListener(`click`,t=>{let n=t.target.closest(`.pag-button`);!n||n.disabled||(G.page=Number(n.dataset.page),d(),e.querySelector(`.content-page`)?.scrollIntoView({behavior:`smooth`}))}),_(e,{href:`#/kaster/ny`,label:`+ Ny utøvar`,variant:`success`,canShow:e=>i(e.profil?.role)})}catch(n){t(`kastere.renderList`,n),e.replaceChildren(a(`Kunne ikkje laste utøvarar.`))}}var X=async(e,t)=>{P(),t.id?await H(e,Number(t.id)):await Y(e)};export{X as render};