const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/charts-qQqpzAio.js","assets/rolldown-runtime-DK3Fl9T5.js"])))=>i.map(i=>d[i]);
import{t as e}from"./preload-helper-tDRSoqHn.js";import{n as t,t as n}from"./escHtml-Z0YwDf7L.js";import{Xt as r,Yt as i,Zt as a,d as o,g as s,i as c}from"./index-CY82xwnt.js";import{i as l,l as u,r as d}from"./kasterService-CQnR08kH.js";import{n as f,r as p}from"./kaster-2cwCS5i9.js";import{t as m}from"./SearchInput-BwD50MFz.js";import{t as h}from"./AdminLinkBar-DYc0shH2.js";var g=24,_=`https://placehold.co/200x200/444/888?text=?`,v={showAll:!1,searchText:``,page:1};function y(e){let t=p(e);return`
    <a href="#/kastere/${f(e)}" class="thrower-card">
      <img src="${n(e.avatarurl||_)}" alt="${n(t)}" loading="lazy">
      <div class="thrower-name">${n(t)}</div>
      <div class="thrower-club">${n(e.klubb?.navn??`–`)}</div>
    </a>`}function b(){return`
    <div class="content-page">
      <div class="thrower-list-controls">
        <div class="nc-filter-rad"><span id="thrower-search-slot"></span></div>
        <div class="mt-2">
          <label class="thrower-checkbox-label">
            <input type="checkbox" id="thrower-active-only"${v.showAll?``:` checked`}>
            Vis berre aktive utøvarar
          </label>
        </div>
      </div>
      <div id="thrower-page-info" class="my-2"></div>
      <div id="thrower-pagination-top"></div>
      <div id="thrower-grid" class="thrower-grid"></div>
      <div id="thrower-pagination-bottom"></div>
    </div>`}function x(e,t){if(t<=1)return``;let n=(t,n,r)=>`<button class="btn btn-sm ${n===e?`btn-primary`:`btn-outline-secondary`} pag-button"
      data-page="${n}" ${r?`disabled`:``}>${t}</button>`;return`
    <div class="thrower-pagination">
      ${n(`«`,1,e===1)}
      ${n(`‹`,e-1,e===1)}
      <span class="pag-info">side ${e} av ${t}</span>
      ${n(`›`,e+1,e===t)}
      ${n(`»`,t,e===t)}
    </div>`}async function S(e){e.replaceChildren(a(`Laster utøvarar...`));try{let t=v.showAll?await l():await d();if(t.error){e.replaceChildren(r(`Kunne ikkje laste utøvarar.`));return}let n=t.data;e.innerHTML=b();let i=e.querySelector(`#thrower-grid`),a=e.querySelector(`#thrower-page-info`),o=e.querySelector(`#thrower-pagination-top`),s=e.querySelector(`#thrower-pagination-bottom`),c=e.querySelector(`#thrower-active-only`);function u(){let e=v.searchText.trim().toLowerCase(),t=n;e&&(t=t.filter(t=>p(t).toLowerCase().includes(e)||(t.klubb?.navn??``).toLowerCase().includes(e)));let r=t.length,c=Math.max(1,Math.ceil(r/g));v.page>c&&(v.page=1);let l=(v.page-1)*g,u=t.slice(l,l+g);a.innerHTML=`side ${v.page} av ${c}`;let d=x(v.page,c);o.innerHTML=d,s.innerHTML=d,i.innerHTML=u.map(y).join(``)}m({slot:e.querySelector(`#thrower-search-slot`),placeholder:`Søk på navn/klubb`,state:v,onInput:()=>{v.page=1,u()}}),u(),c.addEventListener(`change`,async()=>{v.showAll=!c.checked,v.page=1;let{data:e,error:t}=v.showAll?await l():await d();t||(n=e),u()}),e.addEventListener(`click`,t=>{let n=t.target.closest(`.pag-button`);!n||n.disabled||(v.page=Number(n.dataset.page),u(),e.querySelector(`.content-page`)?.scrollIntoView({behavior:`smooth`}))}),h(e,{href:`#/kaster/ny`,label:`+ Ny utøvar`,variant:`success`,canShow:e=>e.profil?.role===`admin`||e.profil?.role===`klubbadmin`})}catch(n){t(`renderList`,n),e.replaceChildren(r(`Kunne ikkje laste utøvarar.`))}}var C=2017,w={kongelag:40,minimatch:60,halvmatch:100,heilmatch:200};function T(e){return e?parseInt(e.substring(0,4)):null}function E(e){return e.length?Math.round(e.reduce((e,t)=>e+t,0)/e.length):null}function D(e,t){let n=t.direction===`asc`?1:-1;return[...e].sort((e,r)=>{if(t.column===`plassering`){let t=e.plassering,i=r.plassering;return t==null&&i==null?0:t==null?1:i==null?-1:(t-i)*n}return(e.stevne?.dato??``).localeCompare(r.stevne?.dato??``)*n})}function O(e,t){let n=(e.stevne?.innledendekastemetode?.navn??``).toLowerCase(),r=(e.stevne?.avsluttendekastemetode?.navn??``).toLowerCase();return n===t||r===t}function k(e){return[{label:`Kongelag`,rader:e.filter(e=>e.poeng_kongelag!=null),poengFn:e=>e.poeng_kongelag,ringFn:e=>e.antall_ring_kongelag,maxRing:w.kongelag},...[`minimatch`,`halvmatch`,`heilmatch`].map(t=>({label:t.charAt(0).toUpperCase()+t.slice(1),rader:e.filter(e=>e.poeng_xkast!=null&&O(e,t)),poengFn:e=>e.poeng_xkast,ringFn:e=>e.antall_ring_xkast,maxRing:w[t]}))].map(({label:e,rader:t,poengFn:n,ringFn:r,maxRing:i})=>{let a=t.length?Math.max(...t.map(e=>n(e))):null,o=E(t.map(e=>n(e))),s=t.filter(e=>r(e)!=null&&(T(e.stevne?.dato)??0)>=2017);return{label:e,rekord:a,snittPoeng:o,snittProsent:s.length?Math.round(s.reduce((e,t)=>e+r(t)/i*100,0)/s.length*100)/100:null}})}function A(e,t){let n=new Map;for(let r of e)r.klubb?.id&&r.klubb.id!==t&&n.set(r.klubb.id,r.klubb.navn);return[...n.values()]}function j(e,t,n){return t===`plassering`?e.plassering??null:n===`kongelag`?e.antall_ring_kongelag==null?null:Math.round(e.antall_ring_kongelag/w.kongelag*1e4)/100:O(e,n)?e.antall_ring_xkast==null?null:Math.round(e.antall_ring_xkast/w[n]*1e4)/100:null}function M(e,t,n,r,i){let a=[...e].filter(e=>{let a=T(e.stevne?.dato);return r&&(a??0)<r||i&&(a??0)>i?!1:j(e,t,n)!=null}).sort((e,t)=>(e.stevne?.dato??``).localeCompare(t.stevne?.dato??``));return{labels:a.map(e=>o(e.stevne?.dato)),stevneNamn:a.map(e=>e.stevne?.navn??``),verdiar:a.map(e=>j(e,t,n))}}var N=!1,P={active:`resultater`,year:`alle`,tournamentType:`alle`,resultSort:{column:`dato`,direction:`desc`},chartMetric:`plassering`,chartMethod:`kongelag`,chartFrom:null,chartTo:null},F=null;function I(){F&&=(F.destroy(),null)}function L(e,t){let r=n(p(e)),i=e.medlemsnummer?` ${e.medlemsnummer}`:``,a=[...new Set(t.map(e=>T(e.stevne?.dato)).filter(e=>e!==null))].sort((e,t)=>t-e),o=[...new Map(t.map(e=>e.stevne?.stevnetype).filter(e=>e!=null).map(e=>[e.id,e.navn])).entries()].sort((e,t)=>e[1].localeCompare(t[1])),s=P.chartMetric===`prosent`?``:` d-none`;return`
    <div class="content-page">
      <h1 class="thrower-detail-title">${r}${n(i)}</h1>
      <p class="thrower-detail-club">${n(e.klubb?.navn??`–`)}</p>

      <div class="thrower-tab-row">
        <button class="btn btn-sm thrower-tab-button${P.active===`resultater`?` active`:``}" data-tab="resultater">Resultat</button>
        <button class="btn btn-sm thrower-tab-button${P.active===`statistikk`?` active`:``}" data-tab="statistikk">Statistikk</button>
        <button class="btn btn-sm thrower-tab-button${P.active===`graf`?` active`:``}" data-tab="graf">Vis graf</button>
      </div>
      <hr>

      <div id="kd-tab-resultater" class="kd-tab${P.active===`resultater`?``:` kd-hidden`}">
        <div class="nc-filter-rad mb-3">
          <select id="kd-year" class="tl-select">
            <option value="alle">Vel årstal</option>
            ${a.map(e=>`<option value="${e}"${P.year==String(e)?` selected`:``}>${e}</option>`).join(``)}
          </select>
          <select id="kd-type" class="tl-select">
            <option value="alle">Alle stevnetypar</option>
            ${o.map(([e,t])=>`<option value="${e}">${n(t)}</option>`).join(``)}
          </select>
        </div>
        <div id="kd-result-table"></div>
      </div>

      <div id="kd-tab-statistikk" class="kd-tab${P.active===`statistikk`?``:` kd-hidden`}">
        <div id="kd-statistics-content"></div>
      </div>

      <div id="kd-tab-graf" class="kd-tab${P.active===`graf`?``:` kd-hidden`}">
        <div class="nc-filter-rad mb-3">
          <select id="kd-chart-metric" class="tl-select">
            <option value="plassering"${P.chartMetric===`plassering`?` selected`:``}>Plassering</option>
            <option value="prosent"${P.chartMetric===`prosent`?` selected`:``}>% Ring (frå 2017)</option>
          </select>
          <select id="kd-chart-method" class="tl-select${s}">
            <option value="kongelag"${P.chartMethod===`kongelag`?` selected`:``}>Kongelag</option>
            <option value="minimatch"${P.chartMethod===`minimatch`?` selected`:``}>Minimatch</option>
            <option value="halvmatch"${P.chartMethod===`halvmatch`?` selected`:``}>Halvmatch</option>
            <option value="heilmatch"${P.chartMethod===`heilmatch`?` selected`:``}>Heilmatch</option>
          </select>
          <select id="kd-chart-from" class="tl-select">
            <option value="">Frå år</option>
            ${a.map(e=>`<option value="${e}"${P.chartFrom==String(e)?` selected`:``}>${e}</option>`).join(``)}
          </select>
          <select id="kd-chart-to" class="tl-select">
            <option value="">Til år</option>
            ${a.map(e=>`<option value="${e}"${P.chartTo==String(e)?` selected`:``}>${e}</option>`).join(``)}
          </select>
        </div>
        <div class="thrower-chart-wrapper">
          <canvas id="kd-chart-canvas"></canvas>
        </div>
      </div>
    </div>`}function R(e,t,n){return t==null?``:`<span class="kd-round-chip">${e} ${n==null?`${t}`:`${t} (${n})`}</span>`}function z(e,t){return`<span class="kd-sort-icon${e?` kd-sort-icon--active`:``}" aria-hidden="true">${e?t===`asc`?`↑`:`↓`:`↕`}</span>`}function B(e,t,n){let r=n.column===e,i=n.direction===`asc`?`stigande`:`synkande`,a=r?`Sortert etter ${t}, ${i}. Vel for å snu.`:`Sorter etter ${t}`;return`<button type="button" class="kd-sort-btn${r?` kd-sort-btn--active`:``}" data-sort="${e}" aria-pressed="${r}" aria-label="${a}">${t}${z(r,n.direction)}</button>`}function V(e,t,r,i){let a=e;t!==`alle`&&(a=a.filter(e=>String(T(e.stevne?.dato))===t)),r!==`alle`&&(a=a.filter(e=>String(e.stevne?.stevnetype?.id)===r));let s=a.length,c=`
    <div class="thrower-result-info">
      <span>Antal: <strong>${s}</strong></span>
      <span class="thrower-result-hint">Antal ringar i parentes (frå ${C})</span>
    </div>`;if(!s)return c+`<p class="empty-state">Ingen resultat funnet.</p>`;let l=`
    <div class="kd-res-head">
      <div class="kd-res-head__date">Sortér: ${B(`dato`,`Dato`,i)}</div>
      <span class="kd-res-head__label kd-res-head__label--name">Stevne</span>
      <span class="kd-res-head__label kd-res-head__label--type">Type</span>
      <span class="kd-res-head__label kd-res-head__label--klubb">Klubb</span>
      <span class="kd-res-head__label kd-res-head__label--chips">Rundar</span>
      <div class="kd-res-head__pl">${B(`plassering`,`Pl.`,i)}</div>
    </div>`,u=D(a,i).map(e=>{let t=e.stevne,r=t?.id?`<a href="#/stevne/${t.id}/resultat" class="kd-res-row__name">${n(t.navn??``)}</a>`:`<span class="kd-res-row__name">${n(t?.navn??`–`)}</span>`,i=R(`X-kast`,e.poeng_xkast,e.antall_ring_xkast)+R(`Kongelag`,e.poeng_kongelag,e.antall_ring_kongelag),a=e.plassering==null?`<span class="kd-res-row__pl kd-res-row__pl--empty">–</span>`:`<span class="kd-res-row__pl">${e.plassering}</span>`;return`
      <div class="kd-res-row">
        ${r}
        <div class="kd-res-row__meta">
          <span class="kd-res-row__date">${o(t?.dato)}</span>
          <span class="kd-res-row__type">${n(t?.stevnetype?.navn??`–`)}</span>
          <span class="kd-res-row__klubb">${n(e.klubb?.navn??`–`)}</span>
        </div>
        <div class="kd-res-row__chips">${i}</div>
        ${a}
      </div>`}).join(``);return c+l+`<div class="kd-res-list">${u}</div>`}function H(e,t){let r=k(e),i=A(e,t.klubb?.id??null);return`
    <div class="thrower-stat-grid">
      <div>
        <h4>Statistikk</h4>
        <table class="app-table">
          <thead class="app-thead">
            <tr>
              <th></th><th>Rekord</th><th>Snitt Poeng</th><th>% Ring (frå ${C})</th>
            </tr>
          </thead>
          <tbody>${r.map(({label:e,rekord:t,snittPoeng:n,snittProsent:r})=>`
    <tr>
      <td>${e}</td>
      <td class="text-center">${t??`–`}</td>
      <td class="text-center">${n??`–`}</td>
      <td class="text-center">${r==null?`–`:s(r)}</td>
    </tr>`).join(``)}</tbody>
        </table>
      </div>
      ${i.length?`<div class="thrower-previous-clubs">
        <h4 class="thrower-previous-title">Tidlegare klubbar</h4>
        <ul class="list-unstyled">${i.map(e=>`<li>${n(e)}</li>`).join(``)}</ul>
      </div>`:``}
    </div>`}async function U(t,n){I();let{labels:r,stevneNamn:a,verdiar:o}=M(n,P.chartMetric,P.chartMethod,P.chartFrom?Number(P.chartFrom):null,P.chartTo?Number(P.chartTo):null);if(!o.length){let e=t.parentElement;if(e){let t=i(`Ingen data for valt filter.`);t.classList.add(`pt-3`),e.replaceChildren(t)}return}let{Chart:s,registerables:c}=await e(async()=>{let{Chart:e,registerables:t}=await import(`./charts-qQqpzAio.js`).then(e=>e.t);return{Chart:e,registerables:t}},__vite__mapDeps([0,1]));N||=(s.register(...c),!0);let l=P.chartMetric===`plassering`,u=l?`Plassering`:`% Ring`;F=new s(t,{type:`line`,data:{labels:r,datasets:[{label:u,data:o,borderColor:`#4e8fc7`,backgroundColor:`rgba(78,143,199,0.15)`,pointBackgroundColor:`#4e8fc7`,pointRadius:4,tension:.1,fill:!1}]},options:{responsive:!0,maintainAspectRatio:!1,scales:{x:{ticks:{maxTicksLimit:14,maxRotation:45,color:`#ccc`},grid:{color:`rgba(255,255,255,0.08)`}},y:{reverse:l,ticks:{color:`#ccc`},grid:{color:`rgba(255,255,255,0.08)`},title:{display:!0,text:u,color:`#ccc`}}},plugins:{legend:{display:!1},tooltip:{callbacks:{title:e=>{let t=e[0]?.dataIndex;return t==null?``:a[t]??r[t]??``},label:e=>`${u}: ${String(e.raw)}`}}}}})}async function W(e,n){P.active=`resultater`,P.year=`alle`,P.tournamentType=`alle`,P.resultSort={column:`dato`,direction:`desc`},P.chartMetric=`plassering`,P.chartMethod=`kongelag`,P.chartFrom=null,P.chartTo=null,I(),e.replaceChildren(a(`Laster utøvar...`));try{let{kaster:t,resultater:i,error:a}=await u(n);if(a||!t){e.replaceChildren(r(`Kunne ikkje laste utøvar.`));return}let o=t;c(p(o)),e.innerHTML=L(o,i);let s=e.querySelector(`#kd-year`),l=e.querySelector(`#kd-type`),d=e.querySelector(`#kd-chart-method`),f=e.querySelector(`#kd-result-table`);function m(){f.innerHTML=V(i,P.year,P.tournamentType,P.resultSort)}f.addEventListener(`click`,e=>{let t=e.target.closest(`[data-sort]`);if(!t)return;let n=t.dataset.sort;P.resultSort=P.resultSort.column===n?{column:n,direction:P.resultSort.direction===`asc`?`desc`:`asc`}:{column:n,direction:n===`plassering`?`asc`:`desc`},m()});function g(){e.querySelector(`#kd-statistics-content`).innerHTML=H(i,o)}function _(){let t=e.querySelector(`#kd-chart-canvas`);t&&U(t,i)}function v(t){P.active=t,e.querySelectorAll(`.thrower-tab-button`).forEach(e=>{e.classList.toggle(`active`,e.dataset.tab===t)}),e.querySelectorAll(`.kd-tab`).forEach(e=>{e.classList.toggle(`kd-hidden`,e.id!==`kd-tab-${t}`)}),t===`statistikk`&&g(),t===`graf`&&_()}m(),s.addEventListener(`change`,()=>{P.year=s.value,m()}),l.addEventListener(`change`,()=>{P.tournamentType=l.value,m()}),e.querySelectorAll(`.thrower-tab-button`).forEach(e=>{e.addEventListener(`click`,()=>v(e.dataset.tab??``))});let y=e.querySelector(`#kd-chart-metric`);y.addEventListener(`change`,()=>{P.chartMetric=y.value,d.classList.toggle(`d-none`,y.value!==`prosent`),_()}),d.addEventListener(`change`,()=>{P.chartMethod=d.value,_()});let b=e.querySelector(`#kd-chart-from`),x=e.querySelector(`#kd-chart-to`);b.addEventListener(`change`,()=>{P.chartFrom=b.value||null,_()}),x.addEventListener(`change`,()=>{P.chartTo=x.value||null,_()}),h(e,{href:`#/kaster/${n}/admin`,label:`Rediger utøvar`,variant:`warning`,canShow:e=>e.profil?.role===`admin`||e.profil?.role===`klubbadmin`&&e.clubs.includes(o.klubbid??-1)})}catch(n){t(`renderDetail`,n),e.replaceChildren(r(`Kunne ikkje laste utøvar.`))}}var G=async(e,t)=>{I(),t.id?await W(e,Number(t.id)):await S(e)};export{G as render};