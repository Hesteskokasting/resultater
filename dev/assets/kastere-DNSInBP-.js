const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/charts-CvwF72J3.js","assets/rolldown-runtime-lhHHWwHU.js"])))=>i.map(i=>d[i]);
import{t as e}from"./logError-D5z16FyH.js";import{Bt as t,Ct as n,Et as r,Ht as i,kt as a,r as o,wt as s,zt as c}from"./index-CP0vkUTu.js";import{c as l,i as u,r as d}from"./kasterService-B3gLOC11.js";import{t as f}from"./LoadingState-BWi0wPLz.js";import{t as p}from"./EmptyState-B1E_7OzB.js";import{t as m}from"./AdminLinkBar-D6k8v8MB.js";import{t as h}from"./SearchInput-BLUeXGg6.js";var g=24,_=`https://placehold.co/200x200/444/888?text=?`,v={showAll:!1,searchText:``,page:1};function y(e){let r=t(e);return`
    <a href="#/kastere/${c(e)}" class="thrower-card">
      <img src="${n(e.avatarurl||_)}" alt="${n(r)}" loading="lazy">
      <div class="thrower-name">${n(r)}</div>
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
    </div>`}async function S(n){n.replaceChildren(f(`Laster utøvarar...`));try{let e=v.showAll?await u():await d();if(e.error){n.replaceChildren(s(`Kunne ikkje laste utøvarar.`));return}let r=e.data;n.innerHTML=b();let i=n.querySelector(`#thrower-grid`),a=n.querySelector(`#thrower-page-info`),o=n.querySelector(`#thrower-pagination-top`),c=n.querySelector(`#thrower-pagination-bottom`),l=n.querySelector(`#thrower-active-only`);function f(){let e=v.searchText.trim().toLowerCase(),n=r;e&&(n=n.filter(n=>t(n).toLowerCase().includes(e)||(n.klubb?.navn??``).toLowerCase().includes(e)));let s=n.length,l=Math.max(1,Math.ceil(s/g));v.page>l&&(v.page=1);let u=(v.page-1)*g,d=n.slice(u,u+g);a.innerHTML=`side ${v.page} av ${l}`;let f=x(v.page,l);o.innerHTML=f,c.innerHTML=f,i.innerHTML=d.map(y).join(``)}h({slot:n.querySelector(`#thrower-search-slot`),placeholder:`Søk på navn/klubb`,state:v,onInput:()=>{v.page=1,f()}}),f(),l.addEventListener(`change`,async()=>{v.showAll=!l.checked,v.page=1;let{data:e,error:t}=v.showAll?await u():await d();t||(r=e),f()}),n.addEventListener(`click`,e=>{let t=e.target.closest(`.pag-button`);!t||t.disabled||(v.page=Number(t.dataset.page),f(),n.querySelector(`.content-page`)?.scrollIntoView({behavior:`smooth`}))}),m(n,{href:`#/kaster/ny`,label:`+ Ny utøvar`,variant:`success`,canShow:e=>e.profil?.role===`admin`||e.profil?.role===`klubbadmin`})}catch(t){e(`renderList`,t),n.replaceChildren(s(`Kunne ikkje laste utøvarar.`))}}var C=2017,w={kongelag:40,minimatch:60,halvmatch:100,heilmatch:200};function T(e){return e?parseInt(e.substring(0,4)):null}function E(e){return e.length?Math.round(e.reduce((e,t)=>e+t,0)/e.length):null}function D(e,t){let n=(e.stevne?.innledendekastemetode?.navn??``).toLowerCase(),r=(e.stevne?.avsluttendekastemetode?.navn??``).toLowerCase();return n===t||r===t}function O(e){return[{label:`Kongelag`,rader:e.filter(e=>e.poeng_kongelag!=null),poengFn:e=>e.poeng_kongelag,ringFn:e=>e.antall_ring_kongelag,maxRing:w.kongelag},...[`minimatch`,`halvmatch`,`heilmatch`].map(t=>({label:t.charAt(0).toUpperCase()+t.slice(1),rader:e.filter(e=>e.poeng_xkast!=null&&D(e,t)),poengFn:e=>e.poeng_xkast,ringFn:e=>e.antall_ring_xkast,maxRing:w[t]}))].map(({label:e,rader:t,poengFn:n,ringFn:r,maxRing:i})=>{let a=t.length?Math.max(...t.map(e=>n(e))):null,o=E(t.map(e=>n(e))),s=t.filter(e=>r(e)!=null&&(T(e.stevne?.dato)??0)>=2017);return{label:e,rekord:a,snittPoeng:o,snittProsent:s.length?Math.round(s.reduce((e,t)=>e+r(t)/i*100,0)/s.length*100)/100:null}})}function k(e,t){let n=new Map;for(let r of e)r.klubb?.id&&r.klubb.id!==t&&n.set(r.klubb.id,r.klubb.navn);return[...n.values()]}function A(e,t,n){return t===`plassering`?e.plassering??null:n===`kongelag`?e.antall_ring_kongelag==null?null:Math.round(e.antall_ring_kongelag/w.kongelag*1e4)/100:D(e,n)?e.antall_ring_xkast==null?null:Math.round(e.antall_ring_xkast/w[n]*1e4)/100:null}function j(e,t,n,i,a){let o=[...e].filter(e=>{let r=T(e.stevne?.dato);return i&&(r??0)<i||a&&(r??0)>a?!1:A(e,t,n)!=null}).sort((e,t)=>(e.stevne?.dato??``).localeCompare(t.stevne?.dato??``));return{labels:o.map(e=>r(e.stevne?.dato)),stevneNamn:o.map(e=>e.stevne?.navn??``),verdiar:o.map(e=>A(e,t,n))}}var M=!1,N={active:`resultater`,year:`alle`,tournamentType:`alle`,chartMetric:`plassering`,chartMethod:`kongelag`,chartFrom:null,chartTo:null},P=null;function F(){P&&=(P.destroy(),null)}function I(e,r){let i=n(t(e)),a=e.medlemsnummer?` ${e.medlemsnummer}`:``,o=[...new Set(r.map(e=>T(e.stevne?.dato)).filter(e=>e!==null))].sort((e,t)=>t-e),s=[...new Map(r.map(e=>e.stevne?.stevnetype).filter(e=>e!=null).map(e=>[e.id,e.navn])).entries()].sort((e,t)=>e[1].localeCompare(t[1])),c=N.chartMetric===`prosent`?``:` d-none`;return`
    <div class="content-page">
      <h1 class="thrower-detail-title">${i}${n(a)}</h1>
      <p class="thrower-detail-club">${n(e.klubb?.navn??`–`)}</p>

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
            ${o.map(e=>`<option value="${e}"${N.year==String(e)?` selected`:``}>${e}</option>`).join(``)}
          </select>
          <select id="kd-type" class="tl-select">
            <option value="alle">Alle stevnetypar</option>
            ${s.map(([e,t])=>`<option value="${e}">${n(t)}</option>`).join(``)}
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
          <select id="kd-chart-method" class="tl-select${c}">
            <option value="kongelag"${N.chartMethod===`kongelag`?` selected`:``}>Kongelag</option>
            <option value="minimatch"${N.chartMethod===`minimatch`?` selected`:``}>Minimatch</option>
            <option value="halvmatch"${N.chartMethod===`halvmatch`?` selected`:``}>Halvmatch</option>
            <option value="heilmatch"${N.chartMethod===`heilmatch`?` selected`:``}>Heilmatch</option>
          </select>
          <select id="kd-chart-from" class="tl-select">
            <option value="">Frå år</option>
            ${o.map(e=>`<option value="${e}"${N.chartFrom==String(e)?` selected`:``}>${e}</option>`).join(``)}
          </select>
          <select id="kd-chart-to" class="tl-select">
            <option value="">Til år</option>
            ${o.map(e=>`<option value="${e}"${N.chartTo==String(e)?` selected`:``}>${e}</option>`).join(``)}
          </select>
        </div>
        <div class="thrower-chart-wrapper">
          <canvas id="kd-chart-canvas"></canvas>
        </div>
      </div>
    </div>`}function L(e,t,i){let a=e;t!==`alle`&&(a=a.filter(e=>String(T(e.stevne?.dato))===t)),i!==`alle`&&(a=a.filter(e=>String(e.stevne?.stevnetype?.id)===i));let o=a.length,s=`
    <div class="thrower-result-info">
      <span>Antal: <strong>${o}</strong></span>
      <span class="thrower-result-hint">Antal ringar i parentes (frå ${C})</span>
    </div>`;if(!o)return s+`<p class="empty-state">Ingen resultat funnet.</p>`;let c=(e,t)=>e==null?``:t==null?`${e}`:`${e} (${t})`;return s+`
    <div class="table-responsive">
      <table class="app-table">
        <thead class="app-thead">
          <tr>
            <th>Dato</th><th>Stevne</th><th>Type</th><th>Klubb</th>
            <th>Pl.</th><th>Kongelag</th><th>X-kast</th>
          </tr>
        </thead>
        <tbody>${a.map(e=>{let t=e.stevne,i=t?.id?`<a href="#/stevne/${t.id}/resultat" class="tl-link">${n(t.navn??``)}</a>`:n(t?.navn??`–`);return`
      <tr>
        <td class="text-nowrap">${r(t?.dato)}</td>
        <td>${i}</td>
        <td>${n(t?.stevnetype?.navn??`–`)}</td>
        <td>${n(e.klubb?.navn??`–`)}</td>
        <td class="text-center fw-bold">${e.plassering??`–`}</td>
        <td class="text-center">${c(e.poeng_kongelag,e.antall_ring_kongelag)}</td>
        <td class="text-center">${c(e.poeng_xkast,e.antall_ring_xkast)}</td>
      </tr>`}).join(``)}</tbody>
      </table>
    </div>`}function R(e,t){let r=O(e),i=k(e,t.klubb?.id??null);return`
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
      <td class="text-center">${r==null?`–`:a(r)}</td>
    </tr>`).join(``)}</tbody>
        </table>
      </div>
      ${i.length?`<div class="thrower-previous-clubs">
        <h4 class="thrower-previous-title">Tidlegare klubbar</h4>
        <ul class="list-unstyled">${i.map(e=>`<li>${n(e)}</li>`).join(``)}</ul>
      </div>`:``}
    </div>`}async function z(e,t){F();let{labels:n,stevneNamn:r,verdiar:a}=j(t,N.chartMetric,N.chartMethod,N.chartFrom?Number(N.chartFrom):null,N.chartTo?Number(N.chartTo):null);if(!a.length){let t=e.parentElement;if(t){let e=p(`Ingen data for valt filter.`);e.classList.add(`pt-3`),t.replaceChildren(e)}return}let{Chart:o,registerables:s}=await i(async()=>{let{Chart:e,registerables:t}=await import(`./charts-CvwF72J3.js`).then(e=>e.t);return{Chart:e,registerables:t}},__vite__mapDeps([0,1]));M||=(o.register(...s),!0);let c=N.chartMetric===`plassering`,l=c?`Plassering`:`% Ring`;P=new o(e,{type:`line`,data:{labels:n,datasets:[{label:l,data:a,borderColor:`#4e8fc7`,backgroundColor:`rgba(78,143,199,0.15)`,pointBackgroundColor:`#4e8fc7`,pointRadius:4,tension:.1,fill:!1}]},options:{responsive:!0,maintainAspectRatio:!1,scales:{x:{ticks:{maxTicksLimit:14,maxRotation:45,color:`#ccc`},grid:{color:`rgba(255,255,255,0.08)`}},y:{reverse:c,ticks:{color:`#ccc`},grid:{color:`rgba(255,255,255,0.08)`},title:{display:!0,text:l,color:`#ccc`}}},plugins:{legend:{display:!1},tooltip:{callbacks:{title:e=>{let t=e[0]?.dataIndex;return t==null?``:r[t]??n[t]??``},label:e=>`${l}: ${e.raw}`}}}}})}async function B(n,r){N.active=`resultater`,N.year=`alle`,N.tournamentType=`alle`,N.chartMetric=`plassering`,N.chartMethod=`kongelag`,N.chartFrom=null,N.chartTo=null,F(),n.replaceChildren(f(`Laster utøvar...`));try{let{kaster:e,resultater:i,error:a}=await l(r);if(a||!e){n.replaceChildren(s(`Kunne ikkje laste utøvar.`));return}let c=e;o(t(c)),n.innerHTML=I(c,i);let u=n.querySelector(`#kd-year`),d=n.querySelector(`#kd-type`),f=n.querySelector(`#kd-chart-method`);function p(){n.querySelector(`#kd-result-table`).innerHTML=L(i,N.year,N.tournamentType)}function h(){n.querySelector(`#kd-statistics-content`).innerHTML=R(i,c)}function g(){let e=n.querySelector(`#kd-chart-canvas`);e&&z(e,i)}function _(e){N.active=e,n.querySelectorAll(`.thrower-tab-button`).forEach(t=>{t.classList.toggle(`active`,t.dataset.tab===e)}),n.querySelectorAll(`.kd-tab`).forEach(t=>{t.classList.toggle(`kd-hidden`,t.id!==`kd-tab-${e}`)}),e===`statistikk`&&h(),e===`graf`&&g()}p(),u.addEventListener(`change`,()=>{N.year=u.value,p()}),d.addEventListener(`change`,()=>{N.tournamentType=d.value,p()}),n.querySelectorAll(`.thrower-tab-button`).forEach(e=>{e.addEventListener(`click`,()=>_(e.dataset.tab??``))});let v=n.querySelector(`#kd-chart-metric`);v.addEventListener(`change`,()=>{N.chartMetric=v.value,f.classList.toggle(`d-none`,v.value!==`prosent`),g()}),f.addEventListener(`change`,()=>{N.chartMethod=f.value,g()});let y=n.querySelector(`#kd-chart-from`),b=n.querySelector(`#kd-chart-to`);y.addEventListener(`change`,()=>{N.chartFrom=y.value||null,g()}),b.addEventListener(`change`,()=>{N.chartTo=b.value||null,g()}),m(n,{href:`#/kaster/${r}/admin`,label:`Rediger utøvar`,variant:`warning`,canShow:e=>e.profil?.role===`admin`||e.profil?.role===`klubbadmin`&&e.clubs.includes(c.klubbid??-1)})}catch(t){e(`renderDetail`,t),n.replaceChildren(s(`Kunne ikkje laste utøvar.`))}}var V=async(e,t)=>{F(),t.id?await B(e,Number(t.id)):await S(e)};export{V as render};