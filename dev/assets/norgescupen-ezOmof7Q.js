import{t as e}from"./logError-Cjb5zwtM.js";import{Q as t,at as n,ct as r,et as i,lt as a,mt as o,ot as s,st as c,ut as l}from"./index-CBSadyAf.js";import{t as u}from"./LoadingState-BCLCa55U.js";import{t as d}from"./EmptyState-CCOt8lnf.js";import{t as f}from"./Table-BggEyKS_.js";import{t as p}from"./expandableRows-Ceb191m9.js";var m=2007,h=2024,g={year:new Date().getFullYear(),cupType:`NC`,classNum:1,view:`singel`},_={year:null,rules:null,tournaments:[],results:[]};async function v(t){if(_.year===t)return!0;try{let[{data:e,error:n},{stevner:r,resultater:i,error:a}]=await Promise.all([s(t),c(t)]);return n||a?!1:(_.year=t,_.rules=e,_.tournaments=r,_.results=i,!0)}catch(t){return e(`fetchAndBufferData`,t),!1}}function y(e,t){return t===`SNC`?`Dei ${e.max_snc} beste SNC-stevna er teljande`:t===`DNC`?`Dei ${e.max_dnc} beste DNC-stevna er teljande`:`Dei ${e.maxtotal} beste stevna, herav maks ${e.max_nc_total} NC-stevner og ${e.max_snc_total} SNC-stevner er teljande`}function b(e){return`
    <div class="nc-class-tabs nc-view-tabs">
      <button class="nc-class-tab${e===`singel`?` active`:``}" data-view="singel">Singel</button>
      <button class="nc-class-tab${e===`lag`?` active`:``}" data-view="lag">Lag</button>
    </div>`}function x(e,t){return`
    <div class="nc-class-tabs-wrapper">
      <div class="nc-class-tabs">
        <button class="nc-class-tab${e===1?` active`:``}" data-class="1">Klasse 1</button>
        ${t<=2025?`<button class="nc-class-tab${e===2?` active`:``}" data-class="2">Klasse 2</button>`:``}
      </div>
      <span class="nc-click-hint">Klikk poengsum for å vise detaljer</span>
    </div>`}function S(e){let t=document.createDocumentFragment();t.appendChild(document.createTextNode(l(e)));let n=document.createElement(`span`);return n.className=`nc-chevron`,n.textContent=` ▼`,t.appendChild(n),t}function C(e){return e.length===0?d(`Ingen resultater funnet.`):f({rows:e,rowClass:`nc-single-row`,rowAttrs:(e,t)=>({"data-idx":String(t)}),detailRowClass:`nc-detail-row d-none`,detailRow:e=>f({rows:e.detaljRader,tableClass:`detalj-tabell`,theadClass:``,columns:[{label:`Dato`,render:e=>i(e._stevne?.dato)},{label:`Type`,render:e=>e._stevne?.typeNavn??`–`},{label:`Stevne`,render:e=>e._stevne?.navn??`–`},{label:`Pl.`,render:e=>String(e.plassering??`–`)},{label:`Poeng`,render:e=>l(e.nc_poeng)}]}),columns:[{label:`Pl.`,thClass:`nc-td-pl`,cellClass:`nc-td-pl`,render:e=>String(e.plassering)},{label:`Navn`,render:e=>e.navn},{label:`Klubb`,render:e=>e.klubb},{label:`Poeng`,thClass:`nc-td-points`,cellClass:`nc-td-points nc-points-cell`,cellAttrs:(e,t)=>({"data-idx":String(t)}),render:e=>S(e.totalPoeng)}]})}function w(e){return e.length===0?d(`Ingen lag funnet.`):f({rows:e,rowClass:`nc-team-row`,rowAttrs:(e,t)=>({"data-team-idx":String(t)}),detailRowClass:`nc-team-detail-row d-none`,detailRow:e=>f({rows:e.bidragsytere,tableClass:`detalj-tabell`,showHeader:!1,columns:[{label:``,render:e=>o(e.kaster)},{label:``,cellClass:`nc-td-points`,render:e=>l(e.sum)}]}),columns:[{label:`Pl.`,thClass:`nc-td-pl`,cellClass:`nc-td-pl`,render:e=>String(e.plassering)},{label:`Klubb`,render:e=>e.klubb?.navn??`–`},{label:`Poeng`,thClass:`nc-td-points`,cellClass:`nc-td-points nc-team-points-cell`,cellAttrs:(e,t)=>({"data-team-idx":String(t)}),render:e=>S(e.lagTotal)}]})}function T(e,t){return`
    <div class="content-page">
      <h1 class="nc-main-title">Norgescupen ${e}</h1>
      <div class="nc-filter-rad">
        <select id="nc-year" class="tl-select">${n(e,m)}</select>
        <select id="nc-cuptype" class="tl-select${e<h?` d-none`:``}">
          <option value="NC"${t===`NC`?` selected`:``}>NC</option>
          <option value="SNC"${t===`SNC`?` selected`:``}>SNC</option>
          <option value="DNC"${t===`DNC`?` selected`:``}>DNC (Uoffisiell)</option>
        </select>
      </div>
      <div id="nc-view-tabs-container"></div>
      <div id="nc-content"></div>
    </div>`}async function E(e){if(g.year=new Date().getFullYear(),g.cupType=`NC`,g.classNum=1,g.view=`singel`,_={year:null,rules:null,tournaments:[],results:[]},e.replaceChildren(u(`Laster Norgescupen...`)),!await v(g.year)){e.replaceChildren(t(`Kunne ikkje laste data for Norgescupen.`));return}e.innerHTML=T(g.year,g.cupType);function n(){let{year:t,cupType:i,classNum:o,view:s}=g,{rules:c}=_,l=e.querySelector(`#nc-content`);if(e.querySelector(`.nc-main-title`).textContent=`Norgescupen ${t}`,e.querySelector(`#nc-cuptype`).classList.toggle(`d-none`,t<h),e.querySelector(`#nc-view-tabs-container`).innerHTML=i===`NC`?b(s):``,s===`lag`&&i===`NC`){l.innerHTML=`
        <section>
          <h2 class="nc-section-title">NC Lag ${t} (Kun klasse 1)</h2>
          <p class="nc-description">Dei 4 beste poengsummene frå kvar klubb.</p>
          <div class="nc-click-hint nc-click-hint-row">Klikk poengsum for å vise detaljar</div>
          <div id="nc-team-table-container"></div>
        </section>`;let e=l.querySelector(`#nc-team-table-container`);if(!c)e.replaceChildren(d(`Ingen data.`));else{let t=a(_.results,_.tournaments,c);e.replaceChildren(w(t)),p(e,{triggerSel:`.nc-team-points-cell`,idAttr:`team-idx`,detailSel:`.nc-team-detail-row`,lookupRoot:l})}}else{l.innerHTML=`
        <section id="nc-single-section">
          <h2 class="nc-section-title">${i} Singel ${t} - Klasse ${o}</h2>
          <p class="nc-description">${c?y(c,i):`Ingen telleregel funnet for ${t}`}</p>
          <div id="nc-class-tabs-container">${x(o,t)}</div>
          <div id="nc-single-table-container"></div>
        </section>`;let e=l.querySelector(`#nc-single-table-container`);if(!c)e.replaceChildren(d(`Ingen data.`));else{let t=r(_.results,_.tournaments,c,i,o);e.replaceChildren(C(t)),p(e,{triggerSel:`.nc-points-cell`,idAttr:`idx`,detailSel:`.nc-detail-row`,lookupRoot:l})}l.querySelector(`#nc-single-section`).addEventListener(`click`,e=>{let t=e.target.closest(`[data-class]`);t&&(g.classNum=Number(t.dataset.class),n())})}}n(),e.querySelector(`#nc-year`).addEventListener(`change`,async r=>{if(g.year=Number(r.target.value),g.classNum=1,g.year<h&&(g.cupType=`NC`,g.view=`singel`,e.querySelector(`#nc-cuptype`).value=`NC`),e.querySelector(`#nc-content`).replaceChildren(u()),!await v(g.year)){e.querySelector(`#nc-content`).replaceChildren(t(`Feil ved henting av data.`));return}n()}),e.querySelector(`#nc-cuptype`).addEventListener(`change`,e=>{g.cupType=e.target.value,g.classNum=1,g.cupType!==`NC`&&(g.view=`singel`),n()}),e.querySelector(`#nc-view-tabs-container`).addEventListener(`click`,e=>{let t=e.target.closest(`[data-view]`);t&&(g.view=t.dataset.view,n())})}export{E as render};