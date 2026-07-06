const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/charts-Ck9TrQRO.js","assets/rolldown-runtime-lhHHWwHU.js"])))=>i.map(i=>d[i]);
import{t as e}from"./logError-Bwe5P2rH.js";import{Q as t,Z as n,et as r,gt as i,mt as a,n as o,pt as s,rt as c}from"./index-CZ8oTelb.js";import{c as l,i as u,r as d}from"./kasterService-CqrAEXWz.js";import{t as f}from"./LoadingState-VoeU7wjv.js";import{t as p}from"./EmptyState-D9n6SQus.js";import{t as m}from"./AdminLinkBar-BhEnlzIA.js";var h=24,g=`https://placehold.co/200x200/444/888?text=?`,_={showAll:!1,searchText:``,page:1};function v(e){let t=a(e);return`
    <a href="#/kastere/${s(e)}" class="thrower-card">
      <img src="${n(e.avatarurl||g)}" alt="${n(t)}" loading="lazy">
      <div class="thrower-name">${n(t)}</div>
      <div class="thrower-club">${n(e.klubb?.navn??`–`)}</div>
    </a>`}function y(){return`
    <div class="content-page">
      <div class="thrower-list-controls">
        <div class="nc-filter-rad">
          <input id="thrower-search" type="search" class="tl-select" placeholder="Søk på navn/klubb" value="">
        </div>
        <div class="mt-2">
          <label class="thrower-checkbox-label">
            <input type="checkbox" id="thrower-active-only" checked>
            Vis berre aktive utøvarar
          </label>
        </div>
      </div>
      <div id="thrower-page-info" class="my-2"></div>
      <div id="thrower-pagination-top"></div>
      <div id="thrower-grid" class="thrower-grid"></div>
      <div id="thrower-pagination-bottom"></div>
    </div>`}function b(e,t){if(t<=1)return``;let n=(t,n,r)=>`<button class="btn btn-sm ${n===e?`btn-primary`:`btn-outline-secondary`} pag-button"
      data-page="${n}" ${r?`disabled`:``}>${t}</button>`;return`
    <div class="thrower-pagination">
      ${n(`«`,1,e===1)}
      ${n(`‹`,e-1,e===1)}
      <span class="pag-info">side ${e} av ${t}</span>
      ${n(`›`,e+1,e===t)}
      ${n(`»`,t,e===t)}
    </div>`}async function x(n){_.page=1,n.replaceChildren(f(`Laster utøvarar...`));try{let e=await d();if(e.error){n.replaceChildren(t(`Kunne ikkje laste utøvarar.`));return}let r=e.data;n.innerHTML=y();let i=n.querySelector(`#thrower-grid`),o=n.querySelector(`#thrower-page-info`),s=n.querySelector(`#thrower-pagination-top`),c=n.querySelector(`#thrower-pagination-bottom`),l=n.querySelector(`#thrower-search`),f=n.querySelector(`#thrower-active-only`);function p(){let e=_.searchText.trim().toLowerCase(),t=r;e&&(t=t.filter(t=>a(t).toLowerCase().includes(e)||(t.klubb?.navn??``).toLowerCase().includes(e)));let n=t.length,l=Math.max(1,Math.ceil(n/h));_.page>l&&(_.page=1);let u=(_.page-1)*h,d=t.slice(u,u+h);o.innerHTML=`side ${_.page} av ${l}`;let f=b(_.page,l);s.innerHTML=f,c.innerHTML=f,i.innerHTML=d.map(v).join(``)}p(),l.addEventListener(`input`,()=>{_.searchText=l.value,_.page=1,p()}),f.addEventListener(`change`,async()=>{_.showAll=!f.checked,_.page=1;let{data:e,error:t}=_.showAll?await u():await d();t||(r=e),p()}),n.addEventListener(`click`,e=>{let t=e.target.closest(`.pag-button`);!t||t.disabled||(_.page=Number(t.dataset.page),p(),n.querySelector(`.content-page`)?.scrollIntoView({behavior:`smooth`}))}),m(n,{href:`#/kaster/ny`,label:`+ Ny utøvar`,variant:`success`,canShow:e=>e.profil?.role===`admin`||e.profil?.role===`klubbadmin`})}catch(r){e(`renderList`,r),n.replaceChildren(t(`Kunne ikkje laste utøvarar.`))}}var S=2017,C={kongelag:40,minimatch:60,halvmatch:100,heilmatch:200};function w(e){return e?parseInt(e.substring(0,4)):null}function T(e){return e.length?Math.round(e.reduce((e,t)=>e+t,0)/e.length):null}function E(e,t){let n=(e.stevne?.innledendekastemetode?.navn??``).toLowerCase(),r=(e.stevne?.avsluttendekastemetode?.navn??``).toLowerCase();return n===t||r===t}function D(e){return[{label:`Kongelag`,rader:e.filter(e=>e.poeng_kongelag!=null),poengFn:e=>e.poeng_kongelag,ringFn:e=>e.antall_ring_kongelag,maxRing:C.kongelag},{label:`Minimatch`,rader:e.filter(e=>e.poeng_xkast!=null&&E(e,`minimatch`)),poengFn:e=>e.poeng_xkast,ringFn:e=>e.antall_ring_xkast,maxRing:C.minimatch},{label:`Halvmatch`,rader:e.filter(e=>e.poeng_xkast!=null&&E(e,`halvmatch`)),poengFn:e=>e.poeng_xkast,ringFn:e=>e.antall_ring_xkast,maxRing:C.halvmatch},{label:`Heilmatch`,rader:e.filter(e=>e.poeng_xkast!=null&&E(e,`heilmatch`)),poengFn:e=>e.poeng_xkast,ringFn:e=>e.antall_ring_xkast,maxRing:C.heilmatch}].map(({label:e,rader:t,poengFn:n,ringFn:r,maxRing:i})=>{let a=t.length?Math.max(...t.map(e=>n(e))):null,o=T(t.map(e=>n(e))),s=t.filter(e=>r(e)!=null&&(w(e.stevne?.dato)??0)>=2017);return{label:e,rekord:a,snittPoeng:o,snittProsent:s.length?Math.round(s.reduce((e,t)=>e+r(t)/i*100,0)/s.length*100)/100:null}})}function O(e,t){let n=new Map;for(let r of e)r.klubb?.id&&r.klubb.id!==t&&n.set(r.klubb.id,r.klubb.navn);return[...n.values()]}function k(e,t,n){return t===`plassering`?e.plassering??null:n===`kongelag`?e.antall_ring_kongelag==null?null:Math.round(e.antall_ring_kongelag/C.kongelag*1e4)/100:E(e,n)?e.antall_ring_xkast==null?null:Math.round(e.antall_ring_xkast/C[n]*1e4)/100:null}function A(e,t,n,i,a){let o=[...e].filter(e=>{let r=w(e.stevne?.dato);return i&&(r??0)<i||a&&(r??0)>a?!1:k(e,t,n)!=null}).sort((e,t)=>(e.stevne?.dato??``).localeCompare(t.stevne?.dato??``));return{labels:o.map(e=>r(e.stevne?.dato)),stevneNamn:o.map(e=>e.stevne?.navn??``),verdiar:o.map(e=>k(e,t,n))}}var j=!1,M={active:`resultater`,year:`alle`,tournamentType:`alle`,chartMetric:`plassering`,chartMethod:`kongelag`,chartFrom:null,chartTo:null},N=null;function P(){N&&=(N.destroy(),null)}function F(e,t){let r=n(a(e)),i=e.medlemsnummer?` ${e.medlemsnummer}`:``,o=[...new Set(t.map(e=>w(e.stevne?.dato)).filter(e=>e!==null))].sort((e,t)=>t-e),s=[...new Map(t.map(e=>e.stevne?.stevnetype).filter(e=>e!=null).map(e=>[e.id,e.navn])).entries()].sort((e,t)=>e[1].localeCompare(t[1])),c=M.chartMetric===`prosent`?``:` d-none`;return`
    <div class="content-page">
      <div class="mb-3">
        <a href="#/kastere" class="btn btn-sm btn-outline-secondary">← Tilbake</a>
      </div>
      <h1 class="thrower-detail-title">${r}${n(i)}</h1>
      <p class="thrower-detail-club">${n(e.klubb?.navn??`–`)}</p>

      <div class="thrower-tab-row">
        <button class="btn btn-sm thrower-tab-button${M.active===`resultater`?` active`:``}" data-tab="resultater">Resultat</button>
        <button class="btn btn-sm thrower-tab-button${M.active===`statistikk`?` active`:``}" data-tab="statistikk">Statistikk</button>
        <button class="btn btn-sm thrower-tab-button${M.active===`graf`?` active`:``}" data-tab="graf">Vis graf</button>
      </div>
      <hr>

      <div id="kd-tab-resultater" class="kd-tab${M.active===`resultater`?``:` kd-hidden`}">
        <div class="nc-filter-rad mb-3">
          <select id="kd-year" class="tl-select">
            <option value="alle">Vel årstal</option>
            ${o.map(e=>`<option value="${e}"${M.year==String(e)?` selected`:``}>${e}</option>`).join(``)}
          </select>
          <select id="kd-type" class="tl-select">
            <option value="alle">Alle stevnetypar</option>
            ${s.map(([e,t])=>`<option value="${e}">${n(t)}</option>`).join(``)}
          </select>
        </div>
        <div id="kd-result-table"></div>
      </div>

      <div id="kd-tab-statistikk" class="kd-tab${M.active===`statistikk`?``:` kd-hidden`}">
        <div id="kd-statistics-content"></div>
      </div>

      <div id="kd-tab-graf" class="kd-tab${M.active===`graf`?``:` kd-hidden`}">
        <div class="nc-filter-rad mb-3">
          <select id="kd-chart-metric" class="tl-select">
            <option value="plassering"${M.chartMetric===`plassering`?` selected`:``}>Plassering</option>
            <option value="prosent"${M.chartMetric===`prosent`?` selected`:``}>% Ring (frå 2017)</option>
          </select>
          <select id="kd-chart-method" class="tl-select${c}">
            <option value="kongelag"${M.chartMethod===`kongelag`?` selected`:``}>Kongelag</option>
            <option value="minimatch"${M.chartMethod===`minimatch`?` selected`:``}>Minimatch</option>
            <option value="halvmatch"${M.chartMethod===`halvmatch`?` selected`:``}>Halvmatch</option>
            <option value="heilmatch"${M.chartMethod===`heilmatch`?` selected`:``}>Heilmatch</option>
          </select>
          <select id="kd-chart-from" class="tl-select">
            <option value="">Frå år</option>
            ${o.map(e=>`<option value="${e}"${M.chartFrom==String(e)?` selected`:``}>${e}</option>`).join(``)}
          </select>
          <select id="kd-chart-to" class="tl-select">
            <option value="">Til år</option>
            ${o.map(e=>`<option value="${e}"${M.chartTo==String(e)?` selected`:``}>${e}</option>`).join(``)}
          </select>
        </div>
        <div class="thrower-chart-wrapper">
          <canvas id="kd-chart-canvas"></canvas>
        </div>
      </div>
    </div>`}function I(e,t,i){let a=e;t!==`alle`&&(a=a.filter(e=>String(w(e.stevne?.dato))===t)),i!==`alle`&&(a=a.filter(e=>String(e.stevne?.stevnetype?.id)===i));let o=a.length,s=`
    <div class="thrower-result-info">
      <span>Antal: <strong>${o}</strong></span>
      <span class="thrower-result-hint">Antal ringar i parentes (frå ${S})</span>
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
    </div>`}function L(e,t){let r=D(e),i=O(e,t.klubb?.id??null);return`
    <div class="thrower-stat-grid">
      <div>
        <h4>Statistikk</h4>
        <table class="app-table">
          <thead class="app-thead">
            <tr>
              <th></th><th>Rekord</th><th>Snitt Poeng</th><th>% Ring (frå ${S})</th>
            </tr>
          </thead>
          <tbody>${r.map(({label:e,rekord:t,snittPoeng:n,snittProsent:r})=>`
    <tr>
      <td>${e}</td>
      <td class="text-center">${t??`–`}</td>
      <td class="text-center">${n??`–`}</td>
      <td class="text-center">${r==null?`–`:c(r)}</td>
    </tr>`).join(``)}</tbody>
        </table>
      </div>
      ${i.length?`<div class="thrower-previous-clubs">
        <h4 class="thrower-previous-title">Tidlegare klubbar</h4>
        <ul class="list-unstyled">${i.map(e=>`<li>${n(e)}</li>`).join(``)}</ul>
      </div>`:``}
    </div>`}async function R(e,t){P();let{labels:n,stevneNamn:r,verdiar:a}=A(t,M.chartMetric,M.chartMethod,M.chartFrom?Number(M.chartFrom):null,M.chartTo?Number(M.chartTo):null);if(!a.length){let t=e.parentElement;if(t){let e=p(`Ingen data for valt filter.`);e.classList.add(`pt-3`),t.replaceChildren(e)}return}let{Chart:o,registerables:s}=await i(async()=>{let{Chart:e,registerables:t}=await import(`./charts-Ck9TrQRO.js`).then(e=>e.t);return{Chart:e,registerables:t}},__vite__mapDeps([0,1]));j||=(o.register(...s),!0);let c=M.chartMetric===`plassering`,l=c?`Plassering`:`% Ring`;N=new o(e,{type:`line`,data:{labels:n,datasets:[{label:l,data:a,borderColor:`#4e8fc7`,backgroundColor:`rgba(78,143,199,0.15)`,pointBackgroundColor:`#4e8fc7`,pointRadius:4,tension:.1,fill:!1}]},options:{responsive:!0,maintainAspectRatio:!1,scales:{x:{ticks:{maxTicksLimit:14,maxRotation:45,color:`#ccc`},grid:{color:`rgba(255,255,255,0.08)`}},y:{reverse:c,ticks:{color:`#ccc`},grid:{color:`rgba(255,255,255,0.08)`},title:{display:!0,text:l,color:`#ccc`}}},plugins:{legend:{display:!1},tooltip:{callbacks:{title:e=>{let t=e[0]?.dataIndex;return t==null?``:r[t]??n[t]??``},label:e=>`${l}: ${e.raw}`}}}}})}async function z(n,r){M.active=`resultater`,M.year=`alle`,M.tournamentType=`alle`,M.chartMetric=`plassering`,M.chartMethod=`kongelag`,M.chartFrom=null,M.chartTo=null,P(),n.replaceChildren(f(`Laster utøvar...`));try{let{kaster:e,resultater:i,error:s}=await l(r);if(s||!e){n.replaceChildren(t(`Kunne ikkje laste utøvar.`));return}let c=e;o(a(c)),n.innerHTML=F(c,i);let u=n.querySelector(`#kd-year`),d=n.querySelector(`#kd-type`),f=n.querySelector(`#kd-chart-method`);function p(){n.querySelector(`#kd-result-table`).innerHTML=I(i,M.year,M.tournamentType)}function h(){n.querySelector(`#kd-statistics-content`).innerHTML=L(i,c)}function g(){let e=n.querySelector(`#kd-chart-canvas`);e&&R(e,i)}function _(e){M.active=e,n.querySelectorAll(`.thrower-tab-button`).forEach(t=>{t.classList.toggle(`active`,t.dataset.tab===e)}),n.querySelectorAll(`.kd-tab`).forEach(t=>{t.classList.toggle(`kd-hidden`,t.id!==`kd-tab-${e}`)}),e===`statistikk`&&h(),e===`graf`&&g()}p(),u.addEventListener(`change`,()=>{M.year=u.value,p()}),d.addEventListener(`change`,()=>{M.tournamentType=d.value,p()}),n.querySelectorAll(`.thrower-tab-button`).forEach(e=>{e.addEventListener(`click`,()=>_(e.dataset.tab??``))});let v=n.querySelector(`#kd-chart-metric`);v.addEventListener(`change`,()=>{M.chartMetric=v.value,f.classList.toggle(`d-none`,v.value!==`prosent`),g()}),f.addEventListener(`change`,()=>{M.chartMethod=f.value,g()});let y=n.querySelector(`#kd-chart-from`),b=n.querySelector(`#kd-chart-to`);y.addEventListener(`change`,()=>{M.chartFrom=y.value||null,g()}),b.addEventListener(`change`,()=>{M.chartTo=b.value||null,g()}),m(n,{href:`#/kaster/${r}/admin`,label:`Rediger utøvar`,variant:`warning`,canShow:e=>e.profil?.role===`admin`||e.profil?.role===`klubbadmin`&&e.clubs.includes(c.klubbid??-1)})}catch(r){e(`renderDetail`,r),n.replaceChildren(t(`Kunne ikkje laste utøvar.`))}}var B=async(e,t)=>{P(),t.id?await z(e,Number(t.id)):await x(e)};export{B as render};