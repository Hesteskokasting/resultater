import{G as e,K as t,at as n,ct as r,et as i,it as a,nt as o,ot as s,q as c,tt as l}from"./index-Da1LWJ6B.js";import{t as u}from"./LoadingState-RVZNML7E.js";import{t as d}from"./EmptyState-a5aDhc-8.js";import{t as f}from"./Table-DSqyRM9K.js";import{t as p}from"./expandableRows-BLkqpXZZ.js";var m=2007,h=2024,g={ar:new Date().getFullYear(),cupType:`NC`,klasse:1,visning:`singel`},_={ar:null,regler:null,stevner:[],resultater:[]};async function v(e){if(_.ar===e)return!0;try{let[{data:t,error:n},{stevner:r,resultater:a,error:o}]=await Promise.all([i(e),l(e)]);return n||o?!1:(_.ar=e,_.regler=t,_.stevner=r,_.resultater=a,!0)}catch(e){return o(`hentOgBufferData`,e),!1}}function y(e,t){return t===`SNC`?`Dei ${e.max_snc} beste SNC-stevna er teljande`:t===`DNC`?`Dei ${e.max_dnc} beste DNC-stevna er teljande`:`Dei ${e.maxtotal} beste stevna, herav maks ${e.max_nc_total} NC-stevner og ${e.max_snc_total} SNC-stevner er teljande`}function b(e){return`
    <div class="nc-klasse-tabs nc-visning-tabs">
      <button class="nc-klasse-tab${e===`singel`?` aktiv`:``}" data-visning="singel">Singel</button>
      <button class="nc-klasse-tab${e===`lag`?` aktiv`:``}" data-visning="lag">Lag</button>
    </div>`}function x(e,t){return`
    <div class="nc-klasse-tabs-wrapper">
      <div class="nc-klasse-tabs">
        <button class="nc-klasse-tab${e===1?` aktiv`:``}" data-klasse="1">Klasse 1</button>
        ${t<=2025?`<button class="nc-klasse-tab${e===2?` aktiv`:``}" data-klasse="2">Klasse 2</button>`:``}
      </div>
      <span class="nc-klikk-hint">Klikk poengsum for å vise detaljer</span>
    </div>`}function S(e){let t=document.createDocumentFragment();t.appendChild(document.createTextNode(s(e)));let n=document.createElement(`span`);return n.className=`nc-chevron`,n.textContent=` ▼`,t.appendChild(n),t}function C(e){return e.length===0?d(`Ingen resultater funnet.`):f({rows:e,rowClass:`nc-singel-rad`,rowAttrs:(e,t)=>({"data-idx":String(t)}),detailRowClass:`nc-detalj-rad d-none`,detailRow:e=>f({rows:e.detaljRader,tableClass:`detalj-tabell`,theadClass:``,columns:[{label:`Dato`,render:e=>c(e._stevne?.dato)},{label:`Type`,render:e=>e._stevne?.typeNavn??`–`},{label:`Stevne`,render:e=>e._stevne?.navn??`–`},{label:`Pl.`,render:e=>String(e.plassering??`–`)},{label:`Poeng`,render:e=>s(e.nc_poeng)}]}),columns:[{label:`Pl.`,thClass:`nc-td-pl`,cellClass:`nc-td-pl`,render:e=>String(e.plassering)},{label:`Navn`,render:e=>e.navn},{label:`Klubb`,render:e=>e.klubb},{label:`Poeng`,thClass:`nc-td-poeng`,cellClass:`nc-td-poeng nc-poeng-celle`,cellAttrs:(e,t)=>({"data-idx":String(t)}),render:e=>S(e.totalPoeng)}]})}function w(e){return e.length===0?d(`Ingen lag funnet.`):f({rows:e,rowClass:`nc-lag-rad`,rowAttrs:(e,t)=>({"data-lag-idx":String(t)}),detailRowClass:`nc-lag-detalj-rad d-none`,detailRow:e=>f({rows:e.bidragsytere,tableClass:`detalj-tabell`,showHeader:!1,columns:[{label:``,render:e=>r(e.kaster)},{label:``,cellClass:`nc-td-poeng`,render:e=>s(e.sum)}]}),columns:[{label:`Pl.`,thClass:`nc-td-pl`,cellClass:`nc-td-pl`,render:e=>String(e.plassering)},{label:`Klubb`,render:e=>e.klubb?.navn??`–`},{label:`Poeng`,thClass:`nc-td-poeng`,cellClass:`nc-td-poeng nc-lag-poeng-celle`,cellAttrs:(e,t)=>({"data-lag-idx":String(t)}),render:e=>S(e.lagTotal)}]})}function T(e,n){return`
    <div class="nc-side">
      <h1 class="nc-hovudtittel">Norgescupen ${e}</h1>
      <div class="nc-filter-rad">
        <select id="nc-ar" class="tl-select">${t(e,m)}</select>
        <select id="nc-cuptype" class="tl-select${e<h?` d-none`:``}">
          <option value="NC"${n===`NC`?` selected`:``}>NC</option>
          <option value="SNC"${n===`SNC`?` selected`:``}>SNC</option>
          <option value="DNC"${n===`DNC`?` selected`:``}>DNC (Uoffisiell)</option>
        </select>
      </div>
      <div id="nc-visning-tabs-container"></div>
      <div id="nc-content"></div>
    </div>`}async function E(t){if(g.ar=new Date().getFullYear(),g.cupType=`NC`,g.klasse=1,g.visning=`singel`,_={ar:null,regler:null,stevner:[],resultater:[]},t.replaceChildren(u(`Laster Norgescupen...`)),!await v(g.ar)){t.replaceChildren(e(`Kunne ikkje laste data for Norgescupen.`));return}t.innerHTML=T(g.ar,g.cupType);function r(){let{ar:e,cupType:i,klasse:o,visning:s}=g,{regler:c}=_,l=t.querySelector(`#nc-content`);if(t.querySelector(`.nc-hovudtittel`).textContent=`Norgescupen ${e}`,t.querySelector(`#nc-cuptype`).classList.toggle(`d-none`,e<h),t.querySelector(`#nc-visning-tabs-container`).innerHTML=i===`NC`?b(s):``,s===`lag`&&i===`NC`){l.innerHTML=`
        <section>
          <h2 class="nc-seksjon-tittel">NC Lag ${e} (Kun klasse 1)</h2>
          <p class="nc-beskriving">Dei 4 beste poengsummene frå kvar klubb.</p>
          <div class="nc-klikk-hint nc-klikk-hint-rad">Klikk poengsum for å vise detaljar</div>
          <div id="nc-lag-tabell-container"></div>
        </section>`;let t=l.querySelector(`#nc-lag-tabell-container`);if(!c)t.replaceChildren(d(`Ingen data.`));else{let e=a(_.resultater,_.stevner,c);t.replaceChildren(w(e)),p(t,{triggerSel:`.nc-lag-poeng-celle`,idAttr:`lag-idx`,detailSel:`.nc-lag-detalj-rad`,lookupRoot:l})}}else{l.innerHTML=`
        <section id="nc-singel-seksjon">
          <h2 class="nc-seksjon-tittel">${i} Singel ${e} - Klasse ${o}</h2>
          <p class="nc-beskriving">${c?y(c,i):`Ingen telleregel funnet for ${e}`}</p>
          <div id="nc-klasse-tabs-container">${x(o,e)}</div>
          <div id="nc-singel-tabell-container"></div>
        </section>`;let t=l.querySelector(`#nc-singel-tabell-container`);if(!c)t.replaceChildren(d(`Ingen data.`));else{let e=n(_.resultater,_.stevner,c,i,o);t.replaceChildren(C(e)),p(t,{triggerSel:`.nc-poeng-celle`,idAttr:`idx`,detailSel:`.nc-detalj-rad`,lookupRoot:l})}l.querySelector(`#nc-singel-seksjon`).addEventListener(`click`,e=>{let t=e.target.closest(`[data-klasse]`);t&&(g.klasse=Number(t.dataset.klasse),r())})}}r(),t.querySelector(`#nc-ar`).addEventListener(`change`,async n=>{if(g.ar=Number(n.target.value),g.klasse=1,g.ar<h&&(g.cupType=`NC`,g.visning=`singel`,t.querySelector(`#nc-cuptype`).value=`NC`),t.querySelector(`#nc-content`).replaceChildren(u()),!await v(g.ar)){t.querySelector(`#nc-content`).replaceChildren(e(`Feil ved henting av data.`));return}r()}),t.querySelector(`#nc-cuptype`).addEventListener(`change`,e=>{g.cupType=e.target.value,g.klasse=1,g.cupType!==`NC`&&(g.visning=`singel`),r()}),t.querySelector(`#nc-visning-tabs-container`).addEventListener(`click`,e=>{let t=e.target.closest(`[data-visning]`);t&&(g.visning=t.dataset.visning,r())})}export{E as render};