import{n as e,t}from"./logError-CTQ3euge.js";import{t as n}from"./escHtml-CfOHO0aD.js";import{$n as r,dr as i,fr as a,mr as o,pr as s,x as c}from"./index-DBNqlYTc.js";import{t as l}from"./fetchAllRows-CYe7NsMC.js";import{t as u}from"./klasse-D9YhVdn2.js";import{t as d}from"./tildelPlassering-BkOKWPKO.js";import{a as f,i as p,n as m,r as h,t as g}from"./RankingList-COXRo5VA.js";var _=2024;function v(e){e.year<2024&&(e.cupType=`NC`),e.cupType!==`NC`&&(e.view=`singel`)}function y(e){if(e==null)return`–`;let t=Number(e);return Number.isInteger(t)?String(t):t.toFixed(1)}function b(e){let t=new Map;for(let n of e)t.set(n.id,{navn:n.navn,dato:n.dato,typeNavn:n.stevnetype?.navn??``});return t}function x(e){return[...e].sort((e,t)=>(t.nc_poeng??0)-(e.nc_poeng??0))}function S(e,t,n){let r=[],i=[],a=[];for(let t of e){let e=n.get(t.stevneid??-1)?.typeNavn??``;e===`NC`?r.push(t):e===`SNC`?i.push(t):e===`DNC`&&a.push(t)}let o=x(r).slice(0,t.max_nc_total),s=x(i).slice(0,t.max_snc_total),c=t.max_dnc_total>0?t.max_dnc_total:1/0,l=x(a).slice(0,c);return x([...o,...s,...l]).slice(0,t.maxtotal)}function C(e,t,n){return x(e.filter(e=>n.get(e.stevneid??-1)?.typeNavn===`SNC`)).slice(0,t.max_snc)}function w(e,t,n){return x(e.filter(e=>n.get(e.stevneid??-1)?.typeNavn===`DNC`)).slice(0,t.max_dnc)}function T(e){return e===`SNC`?C:e===`DNC`?w:S}function E(e){let t=new Map;for(let n of e)n.kasterid!=null&&n.kaster!=null&&(t.has(n.kasterid)||t.set(n.kasterid,{kaster:n.kaster,rader:[]}),t.get(n.kasterid).rader.push(n));return t}function D(e,t,n,r,i,a){let o=b(t),s=T(r),l=i===1?`Klasse 1`:`Klasse 2`,f=E(u(a)?e.filter(e=>e.klasse?.navn===l):e),p=[];for(let[,e]of f){let t=s(e.rader,n,o),r=t.reduce((e,t)=>e+(t.nc_poeng??0),0),i=[...new Set(t.map(e=>e.klubb?.navn).filter(e=>e!=null))],a=t.map(e=>({...e,_stevne:o.get(e.stevneid??-1)})).sort((e,t)=>(e._stevne?.dato??``).localeCompare(t._stevne?.dato??``));p.push({navn:c(e.kaster),klubb:i.join(` / `),totalPoeng:r,detaljRader:a,plassering:0})}return p.sort((e,t)=>t.totalPoeng-e.totalPoeng||e.navn.localeCompare(t.navn)),d(p,e=>e.totalPoeng),p}function O(e,t,n,r){let i=b(t),a=E(u(r)?e.filter(e=>e.klasse?.navn===`Klasse 1`):e),o=new Map,s=new Map;for(let[,e]of a){let t=S(e.rader,n,i),r=new Map;for(let e of t){let t=e.klubb;t&&e.klubbid!=null&&!s.has(e.klubbid)&&s.set(e.klubbid,t),e.klubbid!=null&&r.set(e.klubbid,(r.get(e.klubbid)??0)+(e.nc_poeng??0))}for(let[t,n]of r)o.set(`${e.kaster.id}_${t}`,{kaster:e.kaster,klubbId:t,sum:n})}let c=new Map;for(let[,e]of o)c.has(e.klubbId)||c.set(e.klubbId,{klubb:s.get(e.klubbId),bidragsytere:[]}),c.get(e.klubbId).bidragsytere.push(e);let l=[];for(let[,e]of c){e.bidragsytere.sort((e,t)=>t.sum-e.sum);let t=e.bidragsytere.slice(0,4);l.push({klubb:e.klubb,lagTotal:t.reduce((e,t)=>e+t.sum,0),bidragsytere:t,plassering:0})}return l.sort((e,t)=>t.lagTotal-e.lagTotal),d(l,e=>e.lagTotal),l}e.from(`resultat`).select(`
    id, nc_poeng, plassering, kasterid, klubbid, klasseid, stevneid,
    kaster:kasterid(id, fornavn, etternavn),
    klubb:klubbid(id, navn),
    klasse:klasseid(id, navn)
  `),e.from(`stevne`).select(`id, navn, dato, stevnetype:stevnetypeid(id, navn)`);var k=[`NC`,`SNC`,`DNC`];async function A(n){let{data:r,error:i}=await e.from(`antallTellendeNc`).select(`id, year, max_nc_total, max_snc_total, max_dnc_total, maxtotal, max_snc, max_dnc`).eq(`year`,n).maybeSingle();return i&&t(`getRules`,i),{data:r,error:i}}async function j(n){let{data:r,error:i}=await l((t,r)=>e.from(`resultat`).select(`
      id, nc_poeng, plassering, kasterid, klubbid, klasseid, stevneid,
      kaster:kasterid(id, fornavn, etternavn),
      klubb:klubbid(id, navn),
      klasse:klasseid(id, navn),
      stevne:stevneid!inner(id, navn, dato, stevnetype:stevnetypeid(id, navn))
    `).gte(`stevne.dato`,`${n}-01-01`).lte(`stevne.dato`,`${n}-12-31`).not(`nc_poeng`,`is`,null).gt(`nc_poeng`,0).order(`id`).range(t,r));if(i)return t(`getTournamentsAndResults`,i),{stevner:[],resultater:[],error:i};let a=new Map,o=[];for(let{stevne:e,...t}of r)k.includes(e.stevnetype?.navn??``)&&(a.has(e.id)||a.set(e.id,e),o.push(t));return{stevner:[...a.values()],resultater:o,error:null}}var M=f(async e=>{try{let[{data:t,error:n},{stevner:r,resultater:i,error:a}]=await Promise.all([A(e),j(e)]);return n||a?null:{rules:t,tournaments:r,results:i}}catch(e){return t(`loadCupYear`,e),null}}),N=M.clear,P=M.get,F=2007,I={year:new Date().getFullYear(),cupType:`NC`,classNum:1,view:`singel`},L={rules:null,tournaments:[],results:[]};function R(e,t){return t===`SNC`?`Dei ${e.max_snc} beste SNC-stevna er teljande`:t===`DNC`?`Dei ${e.max_dnc} beste DNC-stevna er teljande`:`Dei ${e.maxtotal} beste stevna, herav maks ${e.max_nc_total} NC-stevner og ${e.max_snc_total} SNC-stevner er teljande`}var z=`
  <p class="info-tip__tittel">NC Lag</p>
  <p>Kun klasse 1. Dei 4 beste poengsummene frå kvar klubb er teljande.</p>`;function B(e,t,r){return`
    <p class="info-tip__tittel">${n(t)} Singel ${r}</p>
    <p>${n(e?R(e,t):`Ingen telleregel funnet for ${r}`)}</p>`}function V(e){return`
    <div class="nc-class-tabs nc-view-tabs">
      <button class="nc-class-tab${e===`singel`?` active`:``}" data-view="singel">Singel</button>
      <button class="nc-class-tab${e===`lag`?` active`:``}" data-view="lag">Lag</button>
    </div>`}function H(e,t){return`
    <div class="nc-class-tabs-wrapper">
      ${u(t)?`<div class="nc-class-tabs">
        <button class="nc-class-tab${e===1?` active`:``}" data-class="1">Klasse 1</button>
        <button class="nc-class-tab${e===2?` active`:``}" data-class="2">Klasse 2</button>
      </div>`:``}
      <span class="click-hint">Klikk ein kastar for å vise detaljar</span>
    </div>`}function U(e){return h(e,{idPrefix:`nc-singel`,placement:e=>String(e.plassering),name:e=>e.navn,club:e=>e.klubb,mainLabel:`POENG`,main:e=>y(e.totalPoeng),detail:e=>m([{label:`Dato`,value:e=>r(e._stevne?.dato)},{label:`Type`,value:e=>e._stevne?.typeNavn??`–`},{label:`Stevne`,value:e=>e._stevne?.navn??`–`},{label:`Pl.`,cellClass:`res-tal`,value:e=>String(e.plassering??`–`)},{label:`Poeng`,cellClass:`res-tal`,value:e=>y(e.nc_poeng)}],e.detaljRader)})}function W(e){return h(e,{idPrefix:`nc-lag`,placement:e=>String(e.plassering),nameLabel:`KLUBB`,name:e=>e.klubb?.navn??`–`,meta:e=>`${e.bidragsytere.length} kastarar`,mainLabel:`POENG`,main:e=>y(e.lagTotal),detail:e=>m([{label:`Kastar`,value:e=>c(e.kaster)},{label:`Poeng`,cellClass:`res-tal`,value:e=>y(e.sum)}],e.bidragsytere)})}function G(e,t){return`
    <div class="content-page res-side">
      <h1 class="page-title">
        <span id="nc-title-text">Norgescupen ${e}</span><span id="nc-info-slot"></span>
      </h1>
      <div class="filter-row filter-row--smal">
        <select id="nc-year" class="app-select">${i(e,F)}</select>
        <select id="nc-cuptype" class="app-select${e<2024?` d-none`:``}">
          <option value="NC"${t===`NC`?` selected`:``}>NC</option>
          <option value="SNC"${t===`SNC`?` selected`:``}>SNC</option>
          <option value="DNC"${t===`DNC`?` selected`:``}>DNC (Uoffisiell)</option>
        </select>
      </div>
      <div id="nc-view-tabs-container"></div>
      <div id="nc-content"></div>
    </div>`}async function K(e){I.year=new Date().getFullYear(),I.cupType=`NC`,I.classNum=1,I.view=`singel`,N(),e.replaceChildren(o(`Laster Norgescupen...`));let t=await P(I.year);if(!t){e.replaceChildren(s(`Kunne ikkje laste data for Norgescupen.`));return}L=t,e.innerHTML=G(I.year,I.cupType);let n=p({slot:e.querySelector(`#nc-info-slot`),label:`Om denne lista`,html:``});function r(){let{year:t,cupType:i,classNum:o,view:s}=I,{rules:c}=L,l=e.querySelector(`#nc-content`);if(e.querySelector(`#nc-title-text`).textContent=`Norgescupen ${t}`,e.querySelector(`#nc-cuptype`).classList.toggle(`d-none`,t<_),e.querySelector(`#nc-view-tabs-container`).innerHTML=i===`NC`?V(s):``,s===`lag`&&i===`NC`){n.setHtml(z),l.innerHTML=`
        <section>
          <div class="click-hint click-hint-row">Klikk ein klubb for å vise detaljar</div>
          <div id="nc-team-table-container"></div>
        </section>`;let e=l.querySelector(`#nc-team-table-container`),r=c?O(L.results,L.tournaments,c,t):[];r.length?(e.innerHTML=W(r),g(e)):e.replaceChildren(a(c?`Ingen lag funnet.`:`Ingen data.`))}else{n.setHtml(B(c,i,t)),l.innerHTML=`
        <section id="nc-single-section">
          <div id="nc-class-tabs-container">${H(o,t)}</div>
          <div id="nc-single-table-container"></div>
        </section>`;let e=l.querySelector(`#nc-single-table-container`),s=c?D(L.results,L.tournaments,c,i,o,t):[];s.length?(e.innerHTML=U(s),g(e)):e.replaceChildren(a(c?`Ingen resultater funnet.`:`Ingen data.`)),l.querySelector(`#nc-single-section`).addEventListener(`click`,e=>{let t=e.target.closest(`[data-class]`);t&&(I.classNum=Number(t.dataset.class),r())})}}r(),e.querySelector(`#nc-year`).addEventListener(`change`,async t=>{I.year=Number(t.target.value),I.classNum=1,v(I),e.querySelector(`#nc-cuptype`).value=I.cupType,e.querySelector(`#nc-content`).replaceChildren(o());let n=await P(I.year);if(!n){e.querySelector(`#nc-content`).replaceChildren(s(`Feil ved henting av data.`));return}L=n,r()}),e.querySelector(`#nc-cuptype`).addEventListener(`change`,e=>{I.cupType=e.target.value,I.classNum=1,v(I),r()}),e.querySelector(`#nc-view-tabs-container`).addEventListener(`click`,e=>{let t=e.target.closest(`[data-view]`);t&&(I.view=t.dataset.view,r())})}export{K as render};