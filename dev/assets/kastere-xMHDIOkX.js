const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/charts-CvwF72J3.js","assets/rolldown-runtime-lhHHWwHU.js"])))=>i.map(i=>d[i]);
import{t as e}from"./logError-D5z16FyH.js";import{At as t,Bt as n,Dt as r,Tt as i,Ut as a,Vt as o,r as s,wt as c}from"./index-DVHt6_kn.js";import{c as l,i as u,r as d}from"./kasterService-B3gLOC11.js";import{t as f}from"./LoadingState-BWi0wPLz.js";import{t as p}from"./EmptyState-B1E_7OzB.js";import{t as m}from"./AdminLinkBar-BynOOqfH.js";import{t as h}from"./SearchInput-BLUeXGg6.js";var g=24,_=`https://placehold.co/200x200/444/888?text=?`,v={showAll:!1,searchText:``,page:1};function y(e){let t=o(e);return`
    <a href="#/kastere/${n(e)}" class="thrower-card">
      <img src="${c(e.avatarurl||_)}" alt="${c(t)}" loading="lazy">
      <div class="thrower-name">${c(t)}</div>
      <div class="thrower-club">${c(e.klubb?.navn??`–`)}</div>
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
    </div>`}async function S(t){t.replaceChildren(f(`Laster utøvarar...`));try{let e=v.showAll?await u():await d();if(e.error){t.replaceChildren(i(`Kunne ikkje laste utøvarar.`));return}let n=e.data;t.innerHTML=b();let r=t.querySelector(`#thrower-grid`),a=t.querySelector(`#thrower-page-info`),s=t.querySelector(`#thrower-pagination-top`),c=t.querySelector(`#thrower-pagination-bottom`),l=t.querySelector(`#thrower-active-only`);function f(){let e=v.searchText.trim().toLowerCase(),t=n;e&&(t=t.filter(t=>o(t).toLowerCase().includes(e)||(t.klubb?.navn??``).toLowerCase().includes(e)));let i=t.length,l=Math.max(1,Math.ceil(i/g));v.page>l&&(v.page=1);let u=(v.page-1)*g,d=t.slice(u,u+g);a.innerHTML=`side ${v.page} av ${l}`;let f=x(v.page,l);s.innerHTML=f,c.innerHTML=f,r.innerHTML=d.map(y).join(``)}h({slot:t.querySelector(`#thrower-search-slot`),placeholder:`Søk på navn/klubb`,state:v,onInput:()=>{v.page=1,f()}}),f(),l.addEventListener(`change`,async()=>{v.showAll=!l.checked,v.page=1;let{data:e,error:t}=v.showAll?await u():await d();t||(n=e),f()}),t.addEventListener(`click`,e=>{let n=e.target.closest(`.pag-button`);!n||n.disabled||(v.page=Number(n.dataset.page),f(),t.querySelector(`.content-page`)?.scrollIntoView({behavior:`smooth`}))}),m(t,{href:`#/kaster/ny`,label:`+ Ny utøvar`,variant:`success`,canShow:e=>e.profil?.role===`admin`||e.profil?.role===`klubbadmin`})}catch(n){e(`renderList`,n),t.replaceChildren(i(`Kunne ikkje laste utøvarar.`))}}var C=2017,w={kongelag:40,minimatch:60,halvmatch:100,heilmatch:200};function T(e){return e?parseInt(e.substring(0,4)):null}function E(e){return e.length?Math.round(e.reduce((e,t)=>e+t,0)/e.length):null}function D(e,t){let n=(e.stevne?.innledendekastemetode?.navn??``).toLowerCase(),r=(e.stevne?.avsluttendekastemetode?.navn??``).toLowerCase();return n===t||r===t}function O(e){return[{label:`Kongelag`,rader:e.filter(e=>e.poeng_kongelag!=null),poengFn:e=>e.poeng_kongelag,ringFn:e=>e.antall_ring_kongelag,maxRing:w.kongelag},...[`minimatch`,`halvmatch`,`heilmatch`].map(t=>({label:t.charAt(0).toUpperCase()+t.slice(1),rader:e.filter(e=>e.poeng_xkast!=null&&D(e,t)),poengFn:e=>e.poeng_xkast,ringFn:e=>e.antall_ring_xkast,maxRing:w[t]}))].map(({label:e,rader:t,poengFn:n,ringFn:r,maxRing:i})=>{let a=t.length?Math.max(...t.map(e=>n(e))):null,o=E(t.map(e=>n(e))),s=t.filter(e=>r(e)!=null&&(T(e.stevne?.dato)??0)>=2017);return{label:e,rekord:a,snittPoeng:o,snittProsent:s.length?Math.round(s.reduce((e,t)=>e+r(t)/i*100,0)/s.length*100)/100:null}})}function k(e,t){let n=new Map;for(let r of e)r.klubb?.id&&r.klubb.id!==t&&n.set(r.klubb.id,r.klubb.navn);return[...n.values()]}function A(e,t,n){return t===`plassering`?e.plassering??null:n===`kongelag`?e.antall_ring_kongelag==null?null:Math.round(e.antall_ring_kongelag/w.kongelag*1e4)/100:D(e,n)?e.antall_ring_xkast==null?null:Math.round(e.antall_ring_xkast/w[n]*1e4)/100:null}function j(e,t,n,i,a){let o=[...e].filter(e=>{let r=T(e.stevne?.dato);return i&&(r??0)<i||a&&(r??0)>a?!1:A(e,t,n)!=null}).sort((e,t)=>(e.stevne?.dato??``).localeCompare(t.stevne?.dato??``));return{labels:o.map(e=>r(e.stevne?.dato)),stevneNamn:o.map(e=>e.stevne?.navn??``),verdiar:o.map(e=>A(e,t,n))}}var M=!1,N={active:`resultater`,year:`alle`,tournamentType:`alle`,chartMetric:`plassering`,chartMethod:`kongelag`,chartFrom:null,chartTo:null},P=null;function F(){P&&=(P.destroy(),null)}function I(e,t){let n=c(o(e)),r=e.medlemsnummer?` ${e.medlemsnummer}`:``,i=[...new Set(t.map(e=>T(e.stevne?.dato)).filter(e=>e!==null))].sort((e,t)=>t-e),a=[...new Map(t.map(e=>e.stevne?.stevnetype).filter(e=>e!=null).map(e=>[e.id,e.navn])).entries()].sort((e,t)=>e[1].localeCompare(t[1])),s=N.chartMetric===`prosent`?``:` d-none`;return`
    <div class="content-page">
      <h1 class="thrower-detail-title">${n}${c(r)}</h1>
      <p class="thrower-detail-club">${c(e.klubb?.navn??`–`)}</p>

      <div class="thrower-tab-row">
        <button class="btn btn-sm thrower-tab-button${N.active===`resultater`?` active`:``}" data-tab="resultater">Resultat</button>
        <button class="btn btn-sm thrower-tab-button${N.active===`statistikk`?` active`:``}" data-tab="statistikk">Statistikk</button>
        <button class="btn btn-sm thrower-tab-button${N.active===`graf`?` active`:``}" data-tab="graf">Vis graf</button>
      </div>
      <hr>

      <div id="kd-tab-resultater" class="kd-tab${N.active===`resultater`?``:` kd-hidden`}">
        <div class="nc-filter-rad mb-3">
          <select id="kd-year" class="tl-select">
            <option value="alle">Vel årstal</option>
            ${i.map(e=>`<option value="${e}"${N.year==String(e)?` selected`:``}>${e}</option>`).join(``)}
          </select>
          <select id="kd-type" class="tl-select">
            <option value="alle">Alle stevnetypar</option>
            ${a.map(([e,t])=>`<option value="${e}">${c(t)}</option>`).join(``)}
          </select>
        </div>
        <div id="kd-result-table"></div>
      </div>

      <div id="kd-tab-statistikk" class="kd-tab${N.active===`statistikk`?``:` kd-hidden`}">
        <div id="kd-statistics-content"></div>
      </div>

      <div id="kd-tab-graf" class="kd-tab${N.active===`graf`?``:` kd-hidden`}">
        <div class="nc-filter-rad mb-3">
          <select id="kd-chart-metric" class="tl-select">
            <option value="plassering"${N.chartMetric===`plassering`?` selected`:``}>Plassering</option>
            <option value="prosent"${N.chartMetric===`prosent`?` selected`:``}>% Ring (frå 2017)</option>
          </select>
          <select id="kd-chart-method" class="tl-select${s}">
            <option value="kongelag"${N.chartMethod===`kongelag`?` selected`:``}>Kongelag</option>
            <option value="minimatch"${N.chartMethod===`minimatch`?` selected`:``}>Minimatch</option>
            <option value="halvmatch"${N.chartMethod===`halvmatch`?` selected`:``}>Halvmatch</option>
            <option value="heilmatch"${N.chartMethod===`heilmatch`?` selected`:``}>Heilmatch</option>
          </select>
          <select id="kd-chart-from" class="tl-select">
            <option value="">Frå år</option>
            ${i.map(e=>`<option value="${e}"${N.chartFrom==String(e)?` selected`:``}>${e}</option>`).join(``)}
          </select>
          <select id="kd-chart-to" class="tl-select">
            <option value="">Til år</option>
            ${i.map(e=>`<option value="${e}"${N.chartTo==String(e)?` selected`:``}>${e}</option>`).join(``)}
          </select>
        </div>
        <div class="thrower-chart-wrapper">
          <canvas id="kd-chart-canvas"></canvas>
        </div>
      </div>
    </div>`}function L(e,t,n){let i=e;t!==`alle`&&(i=i.filter(e=>String(T(e.stevne?.dato))===t)),n!==`alle`&&(i=i.filter(e=>String(e.stevne?.stevnetype?.id)===n));let a=i.length,o=`
    <div class="thrower-result-info">
      <span>Antal: <strong>${a}</strong></span>
      <span class="thrower-result-hint">Antal ringar i parentes (frå ${C})</span>
    </div>`;if(!a)return o+`<p class="empty-state">Ingen resultat funnet.</p>`;let s=(e,t)=>e==null?``:t==null?`${e}`:`${e} (${t})`;return o+`
    <div class="table-responsive">
      <table class="app-table">
        <thead class="app-thead">
          <tr>
            <th>Dato</th><th>Stevne</th><th>Type</th><th>Klubb</th>
            <th>Pl.</th><th>Kongelag</th><th>X-kast</th>
          </tr>
        </thead>
        <tbody>${i.map(e=>{let t=e.stevne,n=t?.id?`<a href="#/stevne/${t.id}/resultat" class="tl-link">${c(t.navn??``)}</a>`:c(t?.navn??`–`);return`
      <tr>
        <td class="text-nowrap">${r(t?.dato)}</td>
        <td>${n}</td>
        <td>${c(t?.stevnetype?.navn??`–`)}</td>
        <td>${c(e.klubb?.navn??`–`)}</td>
        <td class="text-center fw-bold">${e.plassering??`–`}</td>
        <td class="text-center">${s(e.poeng_kongelag,e.antall_ring_kongelag)}</td>
        <td class="text-center">${s(e.poeng_xkast,e.antall_ring_xkast)}</td>
      </tr>`}).join(``)}</tbody>
      </table>
    </div>`}function R(e,n){let r=O(e),i=k(e,n.klubb?.id??null);return`
    <div class="thrower-stat-grid">
      <div>
        <h4>Statistikk</h4>
        <table class="app-table">
          <thead class="app-thead">
            <tr>
              <th></th><th>Rekord</th><th>Snitt Poeng</th><th>% Ring (frå ${C})</th>
            </tr>
          </thead>
          <tbody>${r.map(({label:e,rekord:n,snittPoeng:r,snittProsent:i})=>`
    <tr>
      <td>${e}</td>
      <td class="text-center">${n??`–`}</td>
      <td class="text-center">${r??`–`}</td>
      <td class="text-center">${i==null?`–`:t(i)}</td>
    </tr>`).join(``)}</tbody>
        </table>
      </div>
      ${i.length?`<div class="thrower-previous-clubs">
        <h4 class="thrower-previous-title">Tidlegare klubbar</h4>
        <ul class="list-unstyled">${i.map(e=>`<li>${c(e)}</li>`).join(``)}</ul>
      </div>`:``}
    </div>`}async function z(e,t){F();let{labels:n,stevneNamn:r,verdiar:i}=j(t,N.chartMetric,N.chartMethod,N.chartFrom?Number(N.chartFrom):null,N.chartTo?Number(N.chartTo):null);if(!i.length){let t=e.parentElement;if(t){let e=p(`Ingen data for valt filter.`);e.classList.add(`pt-3`),t.replaceChildren(e)}return}let{Chart:o,registerables:s}=await a(async()=>{let{Chart:e,registerables:t}=await import(`./charts-CvwF72J3.js`).then(e=>e.t);return{Chart:e,registerables:t}},__vite__mapDeps([0,1]));M||=(o.register(...s),!0);let c=N.chartMetric===`plassering`,l=c?`Plassering`:`% Ring`;P=new o(e,{type:`line`,data:{labels:n,datasets:[{label:l,data:i,borderColor:`#4e8fc7`,backgroundColor:`rgba(78,143,199,0.15)`,pointBackgroundColor:`#4e8fc7`,pointRadius:4,tension:.1,fill:!1}]},options:{responsive:!0,maintainAspectRatio:!1,scales:{x:{ticks:{maxTicksLimit:14,maxRotation:45,color:`#ccc`},grid:{color:`rgba(255,255,255,0.08)`}},y:{reverse:c,ticks:{color:`#ccc`},grid:{color:`rgba(255,255,255,0.08)`},title:{display:!0,text:l,color:`#ccc`}}},plugins:{legend:{display:!1},tooltip:{callbacks:{title:e=>{let t=e[0]?.dataIndex;return t==null?``:r[t]??n[t]??``},label:e=>`${l}: ${e.raw}`}}}}})}async function B(t,n){N.active=`resultater`,N.year=`alle`,N.tournamentType=`alle`,N.chartMetric=`plassering`,N.chartMethod=`kongelag`,N.chartFrom=null,N.chartTo=null,F(),t.replaceChildren(f(`Laster utøvar...`));try{let{kaster:e,resultater:r,error:a}=await l(n);if(a||!e){t.replaceChildren(i(`Kunne ikkje laste utøvar.`));return}let c=e;s(o(c)),t.innerHTML=I(c,r);let u=t.querySelector(`#kd-year`),d=t.querySelector(`#kd-type`),f=t.querySelector(`#kd-chart-method`);function p(){t.querySelector(`#kd-result-table`).innerHTML=L(r,N.year,N.tournamentType)}function h(){t.querySelector(`#kd-statistics-content`).innerHTML=R(r,c)}function g(){let e=t.querySelector(`#kd-chart-canvas`);e&&z(e,r)}function _(e){N.active=e,t.querySelectorAll(`.thrower-tab-button`).forEach(t=>{t.classList.toggle(`active`,t.dataset.tab===e)}),t.querySelectorAll(`.kd-tab`).forEach(t=>{t.classList.toggle(`kd-hidden`,t.id!==`kd-tab-${e}`)}),e===`statistikk`&&h(),e===`graf`&&g()}p(),u.addEventListener(`change`,()=>{N.year=u.value,p()}),d.addEventListener(`change`,()=>{N.tournamentType=d.value,p()}),t.querySelectorAll(`.thrower-tab-button`).forEach(e=>{e.addEventListener(`click`,()=>_(e.dataset.tab??``))});let v=t.querySelector(`#kd-chart-metric`);v.addEventListener(`change`,()=>{N.chartMetric=v.value,f.classList.toggle(`d-none`,v.value!==`prosent`),g()}),f.addEventListener(`change`,()=>{N.chartMethod=f.value,g()});let y=t.querySelector(`#kd-chart-from`),b=t.querySelector(`#kd-chart-to`);y.addEventListener(`change`,()=>{N.chartFrom=y.value||null,g()}),b.addEventListener(`change`,()=>{N.chartTo=b.value||null,g()}),m(t,{href:`#/kaster/${n}/admin`,label:`Rediger utøvar`,variant:`warning`,canShow:e=>e.profil?.role===`admin`||e.profil?.role===`klubbadmin`&&e.clubs.includes(c.klubbid??-1)})}catch(n){e(`renderDetail`,n),t.replaceChildren(i(`Kunne ikkje laste utøvar.`))}}var V=async(e,t)=>{F(),t.id?await B(e,Number(t.id)):await S(e)};export{V as render};