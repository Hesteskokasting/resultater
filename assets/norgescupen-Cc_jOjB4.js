import{t as e}from"./logError-Cjb5zwtM.js";import{$ as t,Q as n,ct as r,dt as i,ht as a,lt as o,ot as s,st as c,tt as l,ut as u}from"./index-DzG_3Qd6.js";import{t as d}from"./LoadingState-DU0ZcPlb.js";import{t as f}from"./EmptyState-DXltqcjg.js";import{t as p}from"./Table-DKAMtDIe.js";import{t as m}from"./expandableRows-CT17yEcT.js";var h=2007,g=2024,_={year:new Date().getFullYear(),cupType:`NC`,classNum:1,view:`singel`},v={year:null,rules:null,tournaments:[],results:[]};async function y(t){if(v.year===t)return!0;try{let[{data:e,error:n},{stevner:i,resultater:a,error:o}]=await Promise.all([c(t),r(t)]);return n||o?!1:(v.year=t,v.rules=e,v.tournaments=i,v.results=a,!0)}catch(t){return e(`fetchAndBufferData`,t),!1}}function b(e,t){return t===`SNC`?`Dei ${e.max_snc} beste SNC-stevna er teljande`:t===`DNC`?`Dei ${e.max_dnc} beste DNC-stevna er teljande`:`Dei ${e.maxtotal} beste stevna, herav maks ${e.max_nc_total} NC-stevner og ${e.max_snc_total} SNC-stevner er teljande`}function x(e){return`
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
    </div>`}function C(e){let t=document.createDocumentFragment();t.appendChild(document.createTextNode(i(e)));let n=document.createElement(`span`);return n.className=`nc-chevron`,n.textContent=` ▼`,t.appendChild(n),t}function w(e){return e.length===0?f(`Ingen resultater funnet.`):p({rows:e,rowClass:`nc-single-row`,rowAttrs:(e,t)=>({"data-idx":String(t)}),detailRowClass:`nc-detail-row d-none`,detailRow:e=>p({rows:e.detaljRader,tableClass:`detalj-tabell`,theadClass:``,columns:[{label:`Dato`,render:e=>l(e._stevne?.dato)},{label:`Type`,render:e=>e._stevne?.typeNavn??`–`},{label:`Stevne`,render:e=>e._stevne?.navn??`–`},{label:`Pl.`,render:e=>String(e.plassering??`–`)},{label:`Poeng`,render:e=>i(e.nc_poeng)}]}),columns:[{label:`Pl.`,thClass:`nc-td-pl`,cellClass:`nc-td-pl`,render:e=>String(e.plassering)},{label:`Navn`,render:e=>e.navn},{label:`Klubb`,render:e=>e.klubb},{label:`Poeng`,thClass:`nc-td-points`,cellClass:`nc-td-points nc-points-cell`,cellAttrs:(e,t)=>({"data-idx":String(t)}),render:e=>C(e.totalPoeng)}]})}function T(e){return e.length===0?f(`Ingen lag funnet.`):p({rows:e,rowClass:`nc-team-row`,rowAttrs:(e,t)=>({"data-team-idx":String(t)}),detailRowClass:`nc-team-detail-row d-none`,detailRow:e=>p({rows:e.bidragsytere,tableClass:`detalj-tabell`,showHeader:!1,columns:[{label:``,render:e=>a(e.kaster)},{label:``,cellClass:`nc-td-points`,render:e=>i(e.sum)}]}),columns:[{label:`Pl.`,thClass:`nc-td-pl`,cellClass:`nc-td-pl`,render:e=>String(e.plassering)},{label:`Klubb`,render:e=>e.klubb?.navn??`–`},{label:`Poeng`,thClass:`nc-td-points`,cellClass:`nc-td-points nc-team-points-cell`,cellAttrs:(e,t)=>({"data-team-idx":String(t)}),render:e=>C(e.lagTotal)}]})}function E(e,t){return`
    <div class="content-page">
      <h1 class="nc-main-title">Norgescupen ${e}</h1>
      <div class="nc-filter-rad">
        <select id="nc-year" class="tl-select">${s(e,h)}</select>
        <select id="nc-cuptype" class="tl-select${e<g?` d-none`:``}">
          <option value="NC"${t===`NC`?` selected`:``}>NC</option>
          <option value="SNC"${t===`SNC`?` selected`:``}>SNC</option>
          <option value="DNC"${t===`DNC`?` selected`:``}>DNC (Uoffisiell)</option>
        </select>
      </div>
      <div id="nc-view-tabs-container"></div>
      <div id="nc-content"></div>
    </div>`}async function D(e){if(_.year=new Date().getFullYear(),_.cupType=`NC`,_.classNum=1,_.view=`singel`,v={year:null,rules:null,tournaments:[],results:[]},e.replaceChildren(d(`Laster Norgescupen...`)),!await y(_.year)){e.replaceChildren(t(`Kunne ikkje laste data for Norgescupen.`));return}e.innerHTML=E(_.year,_.cupType);function r(){let{year:t,cupType:i,classNum:a,view:s}=_,{rules:c}=v,l=e.querySelector(`#nc-content`);if(e.querySelector(`.nc-main-title`).textContent=`Norgescupen ${t}`,e.querySelector(`#nc-cuptype`).classList.toggle(`d-none`,t<g),e.querySelector(`#nc-view-tabs-container`).innerHTML=i===`NC`?x(s):``,s===`lag`&&i===`NC`){l.innerHTML=`
        <section>
          <h2 class="nc-section-title">NC Lag ${t} (Kun klasse 1)</h2>
          <p class="nc-description">Dei 4 beste poengsummene frå kvar klubb.</p>
          <div class="nc-click-hint nc-click-hint-row">Klikk poengsum for å vise detaljar</div>
          <div id="nc-team-table-container"></div>
        </section>`;let e=l.querySelector(`#nc-team-table-container`);if(!c)e.replaceChildren(f(`Ingen data.`));else{let n=u(v.results,v.tournaments,c,t<2026);e.replaceChildren(T(n)),m(e,{triggerSel:`.nc-team-points-cell`,idAttr:`team-idx`,detailSel:`.nc-team-detail-row`,lookupRoot:l})}}else{l.innerHTML=`
        <section id="nc-single-section">
          <h2 class="nc-section-title">${n(i)} Singel ${t}${t<=2025?` - Klasse ${a}`:``}</h2>
          <p class="nc-description">${c?b(c,i):`Ingen telleregel funnet for ${t}`}</p>
          <div id="nc-class-tabs-container">${S(a,t)}</div>
          <div id="nc-single-table-container"></div>
        </section>`;let e=l.querySelector(`#nc-single-table-container`);if(!c)e.replaceChildren(f(`Ingen data.`));else{let n=o(v.results,v.tournaments,c,i,a,t<2026);e.replaceChildren(w(n)),m(e,{triggerSel:`.nc-points-cell`,idAttr:`idx`,detailSel:`.nc-detail-row`,lookupRoot:l})}l.querySelector(`#nc-single-section`).addEventListener(`click`,e=>{let t=e.target.closest(`[data-class]`);t&&(_.classNum=Number(t.dataset.class),r())})}}r(),e.querySelector(`#nc-year`).addEventListener(`change`,async n=>{if(_.year=Number(n.target.value),_.classNum=1,_.year<g&&(_.cupType=`NC`,_.view=`singel`,e.querySelector(`#nc-cuptype`).value=`NC`),e.querySelector(`#nc-content`).replaceChildren(d()),!await y(_.year)){e.querySelector(`#nc-content`).replaceChildren(t(`Feil ved henting av data.`));return}r()}),e.querySelector(`#nc-cuptype`).addEventListener(`change`,e=>{_.cupType=e.target.value,_.classNum=1,_.cupType!==`NC`&&(_.view=`singel`),r()}),e.querySelector(`#nc-view-tabs-container`).addEventListener(`click`,e=>{let t=e.target.closest(`[data-view]`);t&&(_.view=t.dataset.view,r())})}export{D as render};