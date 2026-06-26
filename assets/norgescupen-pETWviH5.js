import{t as e}from"./logError-DhxY2JQv.js";import{X as t,Y as n,Z as r,at as i,ct as a,it as o,ot as s,st as c,ut as l}from"./index-C_tXKeOg.js";import{t as u}from"./LoadingState-xRmJ3K_t.js";import{t as d}from"./EmptyState-BvE_0HiD.js";import{t as f}from"./Table-DSqyRM9K.js";import{t as p}from"./expandableRows-ECRCQeHx.js";var m=2007,h=2024,g={ar:new Date().getFullYear(),cupType:`NC`,klasse:1,visning:`singel`},_={ar:null,regler:null,stevner:[],resultater:[]};async function v(t){if(_.ar===t)return!0;try{let[{data:e,error:n},{stevner:r,resultater:a,error:s}]=await Promise.all([o(t),i(t)]);return n||s?!1:(_.ar=t,_.regler=e,_.stevner=r,_.resultater=a,!0)}catch(t){return e(`hentOgBufferData`,t),!1}}function y(e,t){return t===`SNC`?`Dei ${e.max_snc} beste SNC-stevna er teljande`:t===`DNC`?`Dei ${e.max_dnc} beste DNC-stevna er teljande`:`Dei ${e.maxtotal} beste stevna, herav maks ${e.max_nc_total} NC-stevner og ${e.max_snc_total} SNC-stevner er teljande`}function b(e){return`
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
    </div>`}function S(e){let t=document.createDocumentFragment();t.appendChild(document.createTextNode(a(e)));let n=document.createElement(`span`);return n.className=`nc-chevron`,n.textContent=` ▼`,t.appendChild(n),t}function C(e){return e.length===0?d(`Ingen resultater funnet.`):f({rows:e,rowClass:`nc-singel-rad`,rowAttrs:(e,t)=>({"data-idx":String(t)}),detailRowClass:`nc-detalj-rad d-none`,detailRow:e=>f({rows:e.detaljRader,tableClass:`detalj-tabell`,theadClass:``,columns:[{label:`Dato`,render:e=>r(e._stevne?.dato)},{label:`Type`,render:e=>e._stevne?.typeNavn??`–`},{label:`Stevne`,render:e=>e._stevne?.navn??`–`},{label:`Pl.`,render:e=>String(e.plassering??`–`)},{label:`Poeng`,render:e=>a(e.nc_poeng)}]}),columns:[{label:`Pl.`,thClass:`nc-td-pl`,cellClass:`nc-td-pl`,render:e=>String(e.plassering)},{label:`Navn`,render:e=>e.navn},{label:`Klubb`,render:e=>e.klubb},{label:`Poeng`,thClass:`nc-td-poeng`,cellClass:`nc-td-poeng nc-poeng-celle`,cellAttrs:(e,t)=>({"data-idx":String(t)}),render:e=>S(e.totalPoeng)}]})}function w(e){return e.length===0?d(`Ingen lag funnet.`):f({rows:e,rowClass:`nc-lag-rad`,rowAttrs:(e,t)=>({"data-lag-idx":String(t)}),detailRowClass:`nc-lag-detalj-rad d-none`,detailRow:e=>f({rows:e.bidragsytere,tableClass:`detalj-tabell`,showHeader:!1,columns:[{label:``,render:e=>l(e.kaster)},{label:``,cellClass:`nc-td-poeng`,render:e=>a(e.sum)}]}),columns:[{label:`Pl.`,thClass:`nc-td-pl`,cellClass:`nc-td-pl`,render:e=>String(e.plassering)},{label:`Klubb`,render:e=>e.klubb?.navn??`–`},{label:`Poeng`,thClass:`nc-td-poeng`,cellClass:`nc-td-poeng nc-lag-poeng-celle`,cellAttrs:(e,t)=>({"data-lag-idx":String(t)}),render:e=>S(e.lagTotal)}]})}function T(e,n){return`
    <div class="content-page">
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
    </div>`}async function E(e){if(g.ar=new Date().getFullYear(),g.cupType=`NC`,g.klasse=1,g.visning=`singel`,_={ar:null,regler:null,stevner:[],resultater:[]},e.replaceChildren(u(`Laster Norgescupen...`)),!await v(g.ar)){e.replaceChildren(n(`Kunne ikkje laste data for Norgescupen.`));return}e.innerHTML=T(g.ar,g.cupType);function t(){let{ar:n,cupType:r,klasse:i,visning:a}=g,{regler:o}=_,l=e.querySelector(`#nc-content`);if(e.querySelector(`.nc-hovudtittel`).textContent=`Norgescupen ${n}`,e.querySelector(`#nc-cuptype`).classList.toggle(`d-none`,n<h),e.querySelector(`#nc-visning-tabs-container`).innerHTML=r===`NC`?b(a):``,a===`lag`&&r===`NC`){l.innerHTML=`
        <section>
          <h2 class="nc-seksjon-tittel">NC Lag ${n} (Kun klasse 1)</h2>
          <p class="nc-beskriving">Dei 4 beste poengsummene frå kvar klubb.</p>
          <div class="nc-klikk-hint nc-klikk-hint-rad">Klikk poengsum for å vise detaljar</div>
          <div id="nc-lag-tabell-container"></div>
        </section>`;let e=l.querySelector(`#nc-lag-tabell-container`);if(!o)e.replaceChildren(d(`Ingen data.`));else{let t=s(_.resultater,_.stevner,o);e.replaceChildren(w(t)),p(e,{triggerSel:`.nc-lag-poeng-celle`,idAttr:`lag-idx`,detailSel:`.nc-lag-detalj-rad`,lookupRoot:l})}}else{l.innerHTML=`
        <section id="nc-singel-seksjon">
          <h2 class="nc-seksjon-tittel">${r} Singel ${n} - Klasse ${i}</h2>
          <p class="nc-beskriving">${o?y(o,r):`Ingen telleregel funnet for ${n}`}</p>
          <div id="nc-klasse-tabs-container">${x(i,n)}</div>
          <div id="nc-singel-tabell-container"></div>
        </section>`;let e=l.querySelector(`#nc-singel-tabell-container`);if(!o)e.replaceChildren(d(`Ingen data.`));else{let t=c(_.resultater,_.stevner,o,r,i);e.replaceChildren(C(t)),p(e,{triggerSel:`.nc-poeng-celle`,idAttr:`idx`,detailSel:`.nc-detalj-rad`,lookupRoot:l})}l.querySelector(`#nc-singel-seksjon`).addEventListener(`click`,e=>{let n=e.target.closest(`[data-klasse]`);n&&(g.klasse=Number(n.dataset.klasse),t())})}}t(),e.querySelector(`#nc-ar`).addEventListener(`change`,async r=>{if(g.ar=Number(r.target.value),g.klasse=1,g.ar<h&&(g.cupType=`NC`,g.visning=`singel`,e.querySelector(`#nc-cuptype`).value=`NC`),e.querySelector(`#nc-content`).replaceChildren(u()),!await v(g.ar)){e.querySelector(`#nc-content`).replaceChildren(n(`Feil ved henting av data.`));return}t()}),e.querySelector(`#nc-cuptype`).addEventListener(`change`,e=>{g.cupType=e.target.value,g.klasse=1,g.cupType!==`NC`&&(g.visning=`singel`),t()}),e.querySelector(`#nc-visning-tabs-container`).addEventListener(`click`,e=>{let n=e.target.closest(`[data-visning]`);n&&(g.visning=n.dataset.visning,t())})}export{E as render};