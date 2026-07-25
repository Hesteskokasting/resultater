import{t as e}from"./logError-D5z16FyH.js";import{Bt as t,Ct as n,Et as r,Ft as i,It as a,Mt as o,Nt as s,Pt as c,jt as l,wt as u}from"./index-BErz4npm.js";import{t as d}from"./LoadingState-BWi0wPLz.js";import{t as f}from"./EmptyState-B1E_7OzB.js";import{t as p}from"./Table-BMdVKjzY.js";import{t as m}from"./expandableRows-Ceb191m9.js";var h=2007,g=2024,_={year:new Date().getFullYear(),cupType:`NC`,classNum:1,view:`singel`},v={year:null,rules:null,tournaments:[],results:[]};async function y(t){if(v.year===t)return!0;try{let[{data:e,error:n},{stevner:r,resultater:i,error:a}]=await Promise.all([o(t),s(t)]);return n||a?!1:(v.year=t,v.rules=e,v.tournaments=r,v.results=i,!0)}catch(t){return e(`fetchAndBufferData`,t),!1}}function b(e,t){return t===`SNC`?`Dei ${e.max_snc} beste SNC-stevna er teljande`:t===`DNC`?`Dei ${e.max_dnc} beste DNC-stevna er teljande`:`Dei ${e.maxtotal} beste stevna, herav maks ${e.max_nc_total} NC-stevner og ${e.max_snc_total} SNC-stevner er teljande`}function x(e){return`
    <div class="nc-class-tabs nc-view-tabs">
      <button class="nc-class-tab${e===`singel`?` active`:``}" data-view="singel">Singel</button>
      <button class="nc-class-tab${e===`lag`?` active`:``}" data-view="lag">Lag</button>
    </div>`}function S(e,t){return`
    <div class="nc-class-tabs-wrapper">
      ${t<=2025?`<div class="nc-class-tabs">
        <button class="nc-class-tab${e===1?` active`:``}" data-class="1">Klasse 1</button>
        <button class="nc-class-tab${e===2?` active`:``}" data-class="2">Klasse 2</button>
      </div>`:``}
      <span class="nc-click-hint">Klikk poengsum for å vise detaljer</span>
    </div>`}function C(e){let t=document.createDocumentFragment();t.appendChild(document.createTextNode(a(e)));let n=document.createElement(`span`);return n.className=`nc-chevron`,n.textContent=` ▼`,t.appendChild(n),t}function w(e){return e.length===0?f(`Ingen resultater funnet.`):p({rows:e,rowClass:`nc-single-row`,rowAttrs:(e,t)=>({"data-idx":String(t)}),detailRowClass:`nc-detail-row d-none`,detailRow:e=>p({rows:e.detaljRader,tableClass:`detalj-tabell`,theadClass:``,columns:[{label:`Dato`,render:e=>r(e._stevne?.dato)},{label:`Type`,render:e=>e._stevne?.typeNavn??`–`},{label:`Stevne`,render:e=>e._stevne?.navn??`–`},{label:`Pl.`,render:e=>String(e.plassering??`–`)},{label:`Poeng`,render:e=>a(e.nc_poeng)}]}),columns:[{label:`Pl.`,thClass:`nc-td-pl`,cellClass:`nc-td-pl`,render:e=>String(e.plassering)},{label:`Navn`,render:e=>e.navn},{label:`Klubb`,render:e=>e.klubb},{label:`Poeng`,thClass:`nc-td-points`,cellClass:`nc-td-points nc-points-cell`,cellAttrs:(e,t)=>({"data-idx":String(t)}),render:e=>C(e.totalPoeng)}]})}function T(e){return e.length===0?f(`Ingen lag funnet.`):p({rows:e,rowClass:`nc-team-row`,rowAttrs:(e,t)=>({"data-team-idx":String(t)}),detailRowClass:`nc-team-detail-row d-none`,detailRow:e=>p({rows:e.bidragsytere,tableClass:`detalj-tabell`,showHeader:!1,columns:[{label:``,render:e=>t(e.kaster)},{label:``,cellClass:`nc-td-points`,render:e=>a(e.sum)}]}),columns:[{label:`Pl.`,thClass:`nc-td-pl`,cellClass:`nc-td-pl`,render:e=>String(e.plassering)},{label:`Klubb`,render:e=>e.klubb?.navn??`–`},{label:`Poeng`,thClass:`nc-td-points`,cellClass:`nc-td-points nc-team-points-cell`,cellAttrs:(e,t)=>({"data-team-idx":String(t)}),render:e=>C(e.lagTotal)}]})}function E(e,t){return`
    <div class="content-page">
      <h1 class="nc-main-title">Norgescupen ${e}</h1>
      <div class="nc-filter-rad">
        <select id="nc-year" class="tl-select">${l(e,h)}</select>
        <select id="nc-cuptype" class="tl-select${e<g?` d-none`:``}">
          <option value="NC"${t===`NC`?` selected`:``}>NC</option>
          <option value="SNC"${t===`SNC`?` selected`:``}>SNC</option>
          <option value="DNC"${t===`DNC`?` selected`:``}>DNC (Uoffisiell)</option>
        </select>
      </div>
      <div id="nc-view-tabs-container"></div>
      <div id="nc-content"></div>
    </div>`}async function D(e){if(_.year=new Date().getFullYear(),_.cupType=`NC`,_.classNum=1,_.view=`singel`,v={year:null,rules:null,tournaments:[],results:[]},e.replaceChildren(d(`Laster Norgescupen...`)),!await y(_.year)){e.replaceChildren(u(`Kunne ikkje laste data for Norgescupen.`));return}e.innerHTML=E(_.year,_.cupType);function t(){let{year:r,cupType:a,classNum:o,view:s}=_,{rules:l}=v,u=e.querySelector(`#nc-content`);if(e.querySelector(`.nc-main-title`).textContent=`Norgescupen ${r}`,e.querySelector(`#nc-cuptype`).classList.toggle(`d-none`,r<g),e.querySelector(`#nc-view-tabs-container`).innerHTML=a===`NC`?x(s):``,s===`lag`&&a===`NC`){u.innerHTML=`
        <section>
          <h2 class="nc-section-title">NC Lag ${r} (Kun klasse 1)</h2>
          <p class="nc-description">Dei 4 beste poengsummene frå kvar klubb.</p>
          <div class="nc-click-hint nc-click-hint-row">Klikk poengsum for å vise detaljar</div>
          <div id="nc-team-table-container"></div>
        </section>`;let e=u.querySelector(`#nc-team-table-container`);if(!l)e.replaceChildren(f(`Ingen data.`));else{let t=i(v.results,v.tournaments,l,r<2026);e.replaceChildren(T(t)),m(e,{triggerSel:`.nc-team-points-cell`,idAttr:`team-idx`,detailSel:`.nc-team-detail-row`,lookupRoot:u})}}else{u.innerHTML=`
        <section id="nc-single-section">
          <h2 class="nc-section-title">${n(a)} Singel ${r}${r<=2025?` - Klasse ${o}`:``}</h2>
          <p class="nc-description">${l?b(l,a):`Ingen telleregel funnet for ${r}`}</p>
          <div id="nc-class-tabs-container">${S(o,r)}</div>
          <div id="nc-single-table-container"></div>
        </section>`;let e=u.querySelector(`#nc-single-table-container`);if(!l)e.replaceChildren(f(`Ingen data.`));else{let t=c(v.results,v.tournaments,l,a,o,r<2026);e.replaceChildren(w(t)),m(e,{triggerSel:`.nc-points-cell`,idAttr:`idx`,detailSel:`.nc-detail-row`,lookupRoot:u})}u.querySelector(`#nc-single-section`).addEventListener(`click`,e=>{let n=e.target.closest(`[data-class]`);n&&(_.classNum=Number(n.dataset.class),t())})}}t(),e.querySelector(`#nc-year`).addEventListener(`change`,async n=>{if(_.year=Number(n.target.value),_.classNum=1,_.year<g&&(_.cupType=`NC`,_.view=`singel`,e.querySelector(`#nc-cuptype`).value=`NC`),e.querySelector(`#nc-content`).replaceChildren(d()),!await y(_.year)){e.querySelector(`#nc-content`).replaceChildren(u(`Feil ved henting av data.`));return}t()}),e.querySelector(`#nc-cuptype`).addEventListener(`change`,e=>{_.cupType=e.target.value,_.classNum=1,_.cupType!==`NC`&&(_.view=`singel`),t()}),e.querySelector(`#nc-view-tabs-container`).addEventListener(`click`,e=>{let n=e.target.closest(`[data-view]`);n&&(_.view=n.dataset.view,t())})}export{D as render};