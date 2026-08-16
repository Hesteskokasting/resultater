import{n as e,r as t,t as n}from"./escHtml-Z0YwDf7L.js";import{Xt as r,Yt as i,Zt as a,d as o,y as s}from"./index-CY82xwnt.js";import{t as c}from"./fetchAllRows-CYe7NsMC.js";import{r as l}from"./kaster-2cwCS5i9.js";import{a as u,i as d,n as f,r as p,t as m}from"./RankingList-Dv2ywQdY.js";function h(e){if(e==null)return`–`;let t=Number(e);return Number.isInteger(t)?String(t):t.toFixed(1)}function g(e){let t=new Map;for(let n of e)t.set(n.id,{navn:n.navn,dato:n.dato,typeNavn:n.stevnetype?.navn??``});return t}function _(e){return[...e].sort((e,t)=>(t.nc_poeng??0)-(e.nc_poeng??0))}function v(e,t,n){let r=[],i=[],a=[];for(let t of e){let e=n.get(t.stevneid??-1)?.typeNavn??``;e===`NC`?r.push(t):e===`SNC`?i.push(t):e===`DNC`&&a.push(t)}let o=_(r).slice(0,t.max_nc_total),s=_(i).slice(0,t.max_snc_total),c=t.max_dnc_total>0?t.max_dnc_total:1/0,l=_(a).slice(0,c);return _([...o,...s,...l]).slice(0,t.maxtotal)}function y(e,t,n){return _(e.filter(e=>n.get(e.stevneid??-1)?.typeNavn===`SNC`)).slice(0,t.max_snc)}function b(e,t,n){return _(e.filter(e=>n.get(e.stevneid??-1)?.typeNavn===`DNC`)).slice(0,t.max_dnc)}function x(e){return e===`SNC`?y:e===`DNC`?b:v}function S(e){let t=new Map;for(let n of e)n.kasterid!=null&&n.kaster!=null&&(t.has(n.kasterid)||t.set(n.kasterid,{kaster:n.kaster,rader:[]}),t.get(n.kasterid).rader.push(n));return t}function C(e,t,n,r,i,a){let o=g(t),s=x(r),c=i===1?`Klasse 1`:`Klasse 2`,d=S(a?e.filter(e=>e.klasse?.navn===c):e),f=[];for(let[,e]of d){let t=s(e.rader,n,o),r=t.reduce((e,t)=>e+(t.nc_poeng??0),0),i=[...new Set(t.map(e=>e.klubb?.navn).filter(e=>e!=null))],a=t.map(e=>({...e,_stevne:o.get(e.stevneid??-1)})).sort((e,t)=>(e._stevne?.dato??``).localeCompare(t._stevne?.dato??``));f.push({navn:l(e.kaster),klubb:i.join(` / `),totalPoeng:r,detaljRader:a,plassering:0})}return f.sort((e,t)=>t.totalPoeng-e.totalPoeng||e.navn.localeCompare(t.navn)),u(f,e=>e.totalPoeng),f}function w(e,t,n,r){let i=g(t),a=S(r?e.filter(e=>e.klasse?.navn===`Klasse 1`):e),o=new Map,s=new Map;for(let[,e]of a){let t=v(e.rader,n,i),r=new Map;for(let e of t){let t=e.klubb;t&&e.klubbid!=null&&!s.has(e.klubbid)&&s.set(e.klubbid,t),e.klubbid!=null&&r.set(e.klubbid,(r.get(e.klubbid)??0)+(e.nc_poeng??0))}for(let[t,n]of r)o.set(`${e.kaster.id}_${t}`,{kaster:e.kaster,klubbId:t,sum:n})}let c=new Map;for(let[,e]of o)c.has(e.klubbId)||c.set(e.klubbId,{klubb:s.get(e.klubbId),bidragsytere:[]}),c.get(e.klubbId).bidragsytere.push(e);let l=[];for(let[,e]of c){e.bidragsytere.sort((e,t)=>t.sum-e.sum);let t=e.bidragsytere.slice(0,4);l.push({klubb:e.klubb,lagTotal:t.reduce((e,t)=>e+t.sum,0),bidragsytere:t,plassering:0})}return l.sort((e,t)=>t.lagTotal-e.lagTotal),u(l,e=>e.lagTotal),l}t.from(`resultat`).select(`
    id, nc_poeng, plassering, kasterid, klubbid, klasseid, stevneid,
    kaster:kasterid(id, fornavn, etternavn),
    klubb:klubbid(id, navn),
    klasse:klasseid(id, navn)
  `),t.from(`stevne`).select(`id, navn, dato, stevnetype:stevnetypeid(id, navn)`);var T=[`NC`,`SNC`,`DNC`];async function E(n){let{data:r,error:i}=await t.from(`antallTellendeNc`).select(`id, year, max_nc_total, max_snc_total, max_dnc_total, maxtotal, max_snc, max_dnc`).eq(`year`,n).maybeSingle();return i&&e(`getRules`,i),{data:r,error:i}}async function D(n){let{data:r,error:i}=await c((e,r)=>t.from(`resultat`).select(`
      id, nc_poeng, plassering, kasterid, klubbid, klasseid, stevneid,
      kaster:kasterid(id, fornavn, etternavn),
      klubb:klubbid(id, navn),
      klasse:klasseid(id, navn),
      stevne:stevneid!inner(id, navn, dato, stevnetype:stevnetypeid(id, navn))
    `).gte(`stevne.dato`,`${n}-01-01`).lte(`stevne.dato`,`${n}-12-31`).not(`nc_poeng`,`is`,null).gt(`nc_poeng`,0).order(`id`).range(e,r));if(i)return e(`getTournamentsAndResults`,i),{stevner:[],resultater:[],error:i};let a=new Map,o=[];for(let{stevne:e,...t}of r)T.includes(e.stevnetype?.navn??``)&&(a.has(e.id)||a.set(e.id,e),o.push(t));return{stevner:[...a.values()],resultater:o,error:null}}var O=2007,k=2024,A={year:new Date().getFullYear(),cupType:`NC`,classNum:1,view:`singel`},j={year:null,rules:null,tournaments:[],results:[]};async function M(t){if(j.year===t)return!0;try{let[{data:e,error:n},{stevner:r,resultater:i,error:a}]=await Promise.all([E(t),D(t)]);return n||a?!1:(j.year=t,j.rules=e,j.tournaments=r,j.results=i,!0)}catch(t){return e(`fetchAndBufferData`,t),!1}}function N(e,t){return t===`SNC`?`Dei ${e.max_snc} beste SNC-stevna er teljande`:t===`DNC`?`Dei ${e.max_dnc} beste DNC-stevna er teljande`:`Dei ${e.maxtotal} beste stevna, herav maks ${e.max_nc_total} NC-stevner og ${e.max_snc_total} SNC-stevner er teljande`}var P=`
  <p class="info-tip__tittel">NC Lag</p>
  <p>Kun klasse 1. Dei 4 beste poengsummene frå kvar klubb er teljande.</p>`;function F(e,t,r){return`
    <p class="info-tip__tittel">${n(t)} Singel ${r}</p>
    <p>${n(e?N(e,t):`Ingen telleregel funnet for ${r}`)}</p>`}function I(e){return`
    <div class="nc-class-tabs nc-view-tabs">
      <button class="nc-class-tab${e===`singel`?` active`:``}" data-view="singel">Singel</button>
      <button class="nc-class-tab${e===`lag`?` active`:``}" data-view="lag">Lag</button>
    </div>`}function L(e,t){return`
    <div class="nc-class-tabs-wrapper">
      ${t<=2025?`<div class="nc-class-tabs">
        <button class="nc-class-tab${e===1?` active`:``}" data-class="1">Klasse 1</button>
        <button class="nc-class-tab${e===2?` active`:``}" data-class="2">Klasse 2</button>
      </div>`:``}
      <span class="nc-click-hint">Klikk ein kastar for å vise detaljar</span>
    </div>`}function R(e){return p(e,{idPrefix:`nc-singel`,placement:e=>String(e.plassering),name:e=>e.navn,club:e=>e.klubb,mainLabel:`POENG`,main:e=>h(e.totalPoeng),detail:e=>f([{label:`Dato`,value:e=>o(e._stevne?.dato)},{label:`Type`,value:e=>e._stevne?.typeNavn??`–`},{label:`Stevne`,value:e=>e._stevne?.navn??`–`},{label:`Pl.`,cellClass:`res-tal`,value:e=>String(e.plassering??`–`)},{label:`Poeng`,cellClass:`res-tal`,value:e=>h(e.nc_poeng)}],e.detaljRader)})}function z(e){return p(e,{idPrefix:`nc-lag`,placement:e=>String(e.plassering),nameLabel:`KLUBB`,name:e=>e.klubb?.navn??`–`,meta:e=>`${e.bidragsytere.length} kastarar`,mainLabel:`POENG`,main:e=>h(e.lagTotal),detail:e=>f([{label:`Kastar`,value:e=>l(e.kaster)},{label:`Poeng`,cellClass:`res-tal`,value:e=>h(e.sum)}],e.bidragsytere)})}function B(e,t){return`
    <div class="content-page res-side">
      <h1 class="nc-main-title">
        <span id="nc-title-text">Norgescupen ${e}</span><span id="nc-info-slot"></span>
      </h1>
      <div class="nc-filter-rad nc-filter-rad--smal">
        <select id="nc-year" class="tl-select">${s(e,O)}</select>
        <select id="nc-cuptype" class="tl-select${e<k?` d-none`:``}">
          <option value="NC"${t===`NC`?` selected`:``}>NC</option>
          <option value="SNC"${t===`SNC`?` selected`:``}>SNC</option>
          <option value="DNC"${t===`DNC`?` selected`:``}>DNC (Uoffisiell)</option>
        </select>
      </div>
      <div id="nc-view-tabs-container"></div>
      <div id="nc-content"></div>
    </div>`}async function V(e){if(A.year=new Date().getFullYear(),A.cupType=`NC`,A.classNum=1,A.view=`singel`,j={year:null,rules:null,tournaments:[],results:[]},e.replaceChildren(a(`Laster Norgescupen...`)),!await M(A.year)){e.replaceChildren(r(`Kunne ikkje laste data for Norgescupen.`));return}e.innerHTML=B(A.year,A.cupType);let t=d({slot:e.querySelector(`#nc-info-slot`),label:`Om denne lista`,html:``});function n(){let{year:r,cupType:a,classNum:o,view:s}=A,{rules:c}=j,l=e.querySelector(`#nc-content`);if(e.querySelector(`#nc-title-text`).textContent=`Norgescupen ${r}`,e.querySelector(`#nc-cuptype`).classList.toggle(`d-none`,r<k),e.querySelector(`#nc-view-tabs-container`).innerHTML=a===`NC`?I(s):``,s===`lag`&&a===`NC`){t.setHtml(P),l.innerHTML=`
        <section>
          <div class="nc-click-hint nc-click-hint-row">Klikk ein klubb for å vise detaljar</div>
          <div id="nc-team-table-container"></div>
        </section>`;let e=l.querySelector(`#nc-team-table-container`),n=c?w(j.results,j.tournaments,c,r<2026):[];n.length?(e.innerHTML=z(n),m(e)):e.replaceChildren(i(c?`Ingen lag funnet.`:`Ingen data.`))}else{t.setHtml(F(c,a,r)),l.innerHTML=`
        <section id="nc-single-section">
          <div id="nc-class-tabs-container">${L(o,r)}</div>
          <div id="nc-single-table-container"></div>
        </section>`;let e=l.querySelector(`#nc-single-table-container`),s=c?C(j.results,j.tournaments,c,a,o,r<2026):[];s.length?(e.innerHTML=R(s),m(e)):e.replaceChildren(i(c?`Ingen resultater funnet.`:`Ingen data.`)),l.querySelector(`#nc-single-section`).addEventListener(`click`,e=>{let t=e.target.closest(`[data-class]`);t&&(A.classNum=Number(t.dataset.class),n())})}}n(),e.querySelector(`#nc-year`).addEventListener(`change`,async t=>{if(A.year=Number(t.target.value),A.classNum=1,A.year<k&&(A.cupType=`NC`,A.view=`singel`,e.querySelector(`#nc-cuptype`).value=`NC`),e.querySelector(`#nc-content`).replaceChildren(a()),!await M(A.year)){e.querySelector(`#nc-content`).replaceChildren(r(`Feil ved henting av data.`));return}n()}),e.querySelector(`#nc-cuptype`).addEventListener(`change`,e=>{A.cupType=e.target.value,A.classNum=1,A.cupType!==`NC`&&(A.view=`singel`),n()}),e.querySelector(`#nc-view-tabs-container`).addEventListener(`click`,e=>{let t=e.target.closest(`[data-view]`);t&&(A.view=t.dataset.view,n())})}export{V as render};