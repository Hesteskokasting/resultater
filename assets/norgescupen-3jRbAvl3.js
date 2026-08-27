import{n as e,t}from"./logError-ByTg738k.js";import{$n as n,S as r,dr as i,f as a,lr as o,ur as s}from"./index-BvGIsWRi.js";import{r as c}from"./dropdown-CAqitdco.js";import{t as l}from"./fetchAllRows-CYe7NsMC.js";import{t as u}from"./klasse-D9YhVdn2.js";import{t as d}from"./placements-BkOKWPKO.js";import{a as f,i as p,n as m,o as h,r as g,t as _}from"./truncate-CzalIHli.js";var v=2024;function y(e){e.year<2024&&(e.cupType=`NC`),e.cupType!==`NC`&&(e.view=`singel`)}function b(e){if(e==null)return`–`;let t=Number(e);return Number.isInteger(t)?String(t):t.toFixed(1)}function x(e){let t=new Map;for(let n of e)t.set(n.id,{navn:n.navn,dato:n.dato,typeNavn:n.stevnetype?.navn??``});return t}function S(e){return[...e].sort((e,t)=>(t.nc_poeng??0)-(e.nc_poeng??0))}function C(e,t,n){let r=[],i=[],a=[];for(let t of e){let e=n.get(t.stevneid??-1)?.typeNavn??``;e===`NC`?r.push(t):e===`SNC`?i.push(t):e===`DNC`&&a.push(t)}let o=S(r).slice(0,t.max_nc_total),s=S(i).slice(0,t.max_snc_total),c=t.max_dnc_total>0?t.max_dnc_total:1/0,l=S(a).slice(0,c);return S([...o,...s,...l]).slice(0,t.maxtotal)}function w(e,t,n){return S(e.filter(e=>n.get(e.stevneid??-1)?.typeNavn===`SNC`)).slice(0,t.max_snc)}function T(e,t,n){return S(e.filter(e=>n.get(e.stevneid??-1)?.typeNavn===`DNC`)).slice(0,t.max_dnc)}function E(e){return e===`SNC`?w:e===`DNC`?T:C}function D(e){let t=new Map;for(let n of e)n.kasterid!=null&&n.kaster!=null&&(t.has(n.kasterid)||t.set(n.kasterid,{kaster:n.kaster,rader:[]}),t.get(n.kasterid).rader.push(n));return t}function O(e,t,n,i,a,o){let s=x(t),c=E(i),l=a===1?`Klasse 1`:`Klasse 2`,f=D(u(o)?e.filter(e=>e.klasse?.navn===l):e),p=[];for(let[,e]of f){let t=c(e.rader,n,s),i=t.reduce((e,t)=>e+(t.nc_poeng??0),0),a=[...new Set(t.map(e=>e.klubb?.navn).filter(e=>e!=null))],o=t.map(e=>({...e,_stevne:s.get(e.stevneid??-1)})).sort((e,t)=>(t.nc_poeng??0)-(e.nc_poeng??0)||(e._stevne?.dato??``).localeCompare(t._stevne?.dato??``));p.push({navn:r(e.kaster),klubb:a.join(` / `),totalPoeng:i,detaljRader:o,plassering:0})}return p.sort((e,t)=>t.totalPoeng-e.totalPoeng||e.navn.localeCompare(t.navn)),d(p,e=>e.totalPoeng),p}function k(e,t,n,r){let i=x(t),a=D(u(r)?e.filter(e=>e.klasse?.navn===`Klasse 1`):e),o=new Map,s=new Map;for(let[,e]of a){let t=C(e.rader,n,i),r=new Map;for(let e of t){let t=e.klubb;t&&e.klubbid!=null&&!s.has(e.klubbid)&&s.set(e.klubbid,t),e.klubbid!=null&&r.set(e.klubbid,(r.get(e.klubbid)??0)+(e.nc_poeng??0))}for(let[t,n]of r)o.set(`${e.kaster.id}_${t}`,{kaster:e.kaster,klubbId:t,sum:n})}let c=new Map;for(let[,e]of o)c.has(e.klubbId)||c.set(e.klubbId,{klubb:s.get(e.klubbId),bidragsytere:[]}),c.get(e.klubbId).bidragsytere.push(e);let l=[];for(let[,e]of c){e.bidragsytere.sort((e,t)=>t.sum-e.sum);let t=e.bidragsytere.slice(0,4);l.push({klubb:e.klubb,lagTotal:t.reduce((e,t)=>e+t.sum,0),bidragsytere:t,plassering:0})}return l.sort((e,t)=>t.lagTotal-e.lagTotal),d(l,e=>e.lagTotal),l}e.from(`resultat`).select(`
    id, nc_poeng, plassering, snc_plassering, kasterid, klubbid, klasseid, stevneid,
    kaster:kasterid(id, fornavn, etternavn),
    klubb:klubbid(id, navn),
    klasse:klasseid(id, navn)
  `),e.from(`stevne`).select(`id, navn, dato, stevnetype:stevnetypeid(id, navn)`);var A=[`NC`,`SNC`,`DNC`];async function j(n){let{data:r,error:i}=await e.from(`antallTellendeNc`).select(`id, year, max_nc_total, max_snc_total, max_dnc_total, maxtotal, max_snc, max_dnc`).eq(`year`,n).maybeSingle();return i&&t(`getRules`,i),{data:r,error:i}}async function M(n){let{data:r,error:i}=await l((t,r)=>e.from(`resultat`).select(`
      id, nc_poeng, plassering, snc_plassering, kasterid, klubbid, klasseid, stevneid,
      kaster:kasterid(id, fornavn, etternavn),
      klubb:klubbid(id, navn),
      klasse:klasseid(id, navn),
      stevne:stevneid!inner(id, navn, dato, stevnetype:stevnetypeid(id, navn))
    `).gte(`stevne.dato`,`${n}-01-01`).lte(`stevne.dato`,`${n}-12-31`).not(`nc_poeng`,`is`,null).gt(`nc_poeng`,0).order(`id`).range(t,r));if(i)return t(`getTournamentsAndResults`,i),{stevner:[],resultater:[],error:i};let a=new Map,o=[];for(let{stevne:e,...t}of r)A.includes(e.stevnetype?.navn??``)&&(a.has(e.id)||a.set(e.id,e),o.push(t));return{stevner:[...a.values()],resultater:o,error:null}}var N=h(async e=>{try{let[{data:t,error:n},{stevner:r,resultater:i,error:a}]=await Promise.all([j(e),M(e)]);return n||a?null:{rules:t,tournaments:r,results:i}}catch(e){return t(`loadCupYear`,e),null}}),P=N.clear,F=N.get,I=2007,L=15,R={year:new Date().getFullYear(),cupType:`NC`,classNum:1,view:`singel`},z={rules:null,tournaments:[],results:[]};function B(e,t){return t===`SNC`?`Dei ${e.max_snc} beste SNC-stevna er teljande`:t===`DNC`?`Dei ${e.max_dnc} beste DNC-stevna er teljande`:`Dei ${e.maxtotal} beste stevna, herav maks ${e.max_nc_total} NC-stevner og ${e.max_snc_total} SNC-stevner er teljande`}var V=`
  <p class="info-tip__tittel">NC Lag</p>
  <p>Kun klasse 1. Dei 4 beste poengsummene frå kvar klubb er teljande.</p>`;function H(e,t,n){return`
    <p class="info-tip__tittel">${a(t)} Singel ${n}</p>
    <p>${a(e?B(e,t):`Ingen telleregel funnet for ${n}`)}</p>`}function U(e){return`
    <div class="nc-class-tabs nc-view-tabs">
      <button class="nc-class-tab${e===`singel`?` active`:``}" data-view="singel">Singel</button>
      <button class="nc-class-tab${e===`lag`?` active`:``}" data-view="lag">Lag</button>
    </div>`}function W(e,t){return`
    <div class="nc-class-tabs-wrapper">
      ${u(t)?`<div class="nc-class-tabs">
        <button class="nc-class-tab${e===1?` active`:``}" data-class="1">Klasse 1</button>
        <button class="nc-class-tab${e===2?` active`:``}" data-class="2">Klasse 2</button>
      </div>`:``}
      <span class="click-hint">Klikk ein kastar for å vise detaljar</span>
    </div>`}function G(e){return p(e,{idPrefix:`nc-singel`,placement:e=>String(e.plassering),name:e=>e.navn,club:e=>e.klubb,mainLabel:`POENG`,main:e=>b(e.totalPoeng),detail:e=>g([{label:`Dato`,cellClass:`rank-detalj-nowrap`,value:e=>n(e._stevne?.dato)},{label:`Type`,value:e=>e._stevne?.typeNavn??`–`},{label:`Stevne`,value:e=>_(e._stevne?.navn??`–`,L),title:e=>e._stevne?.navn??``},{label:`Pl.`,cellClass:`res-tal`,value:e=>String(e.snc_plassering??e.plassering??`–`)},{label:`Poeng`,cellClass:`res-tal`,value:e=>b(e.nc_poeng)}],e.detaljRader)})}function K(e){return p(e,{idPrefix:`nc-lag`,placement:e=>String(e.plassering),nameLabel:`KLUBB`,name:e=>e.klubb?.navn??`–`,meta:e=>`${e.bidragsytere.length} kastarar`,mainLabel:`POENG`,main:e=>b(e.lagTotal),detail:e=>g([{label:`Kastar`,value:e=>r(e.kaster)},{label:`Poeng`,cellClass:`res-tal`,value:e=>b(e.sum)}],e.bidragsytere)})}function q(e,t){return`
    <div class="content-page res-side">
      <h1 class="page-title">
        <span id="nc-title-text">Norgescupen ${e}</span><span id="nc-info-slot"></span>
      </h1>
      <div class="filter-row filter-row--smal">
        <select id="nc-year" class="app-select">${c(e,I)}</select>
        <select id="nc-cuptype" class="app-select${e<2024?` d-none`:``}">
          <option value="NC"${t===`NC`?` selected`:``}>NC</option>
          <option value="SNC"${t===`SNC`?` selected`:``}>SNC</option>
          <option value="DNC"${t===`DNC`?` selected`:``}>DNC (Uoffisiell)</option>
        </select>
      </div>
      <div id="nc-view-tabs-container"></div>
      <div id="nc-content"></div>
    </div>`}async function J(e){R.year=new Date().getFullYear(),R.cupType=`NC`,R.classNum=1,R.view=`singel`,P(),e.replaceChildren(i(`Laster Norgescupen...`));let t=await F(R.year);if(!t){e.replaceChildren(s(`Kunne ikkje laste data for Norgescupen.`));return}z=t,e.innerHTML=q(R.year,R.cupType);let n=f({slot:e.querySelector(`#nc-info-slot`),label:`Om denne lista`,html:``});function r(){let{year:t,cupType:i,classNum:a,view:s}=R,{rules:c}=z,l=e.querySelector(`#nc-content`);if(e.querySelector(`#nc-title-text`).textContent=`Norgescupen ${t}`,e.querySelector(`#nc-cuptype`).classList.toggle(`d-none`,t<v),e.querySelector(`#nc-view-tabs-container`).innerHTML=i===`NC`?U(s):``,s===`lag`&&i===`NC`){n.setHtml(V),l.innerHTML=`
        <section>
          <div class="click-hint click-hint-row">Klikk ein klubb for å vise detaljar</div>
          <div id="nc-team-table-container"></div>
        </section>`;let e=l.querySelector(`#nc-team-table-container`),r=c?k(z.results,z.tournaments,c,t):[];r.length?(e.innerHTML=K(r),m(e)):e.replaceChildren(o(c?`Ingen lag funnet.`:`Ingen data.`))}else{n.setHtml(H(c,i,t)),l.innerHTML=`
        <section id="nc-single-section">
          <div id="nc-class-tabs-container">${W(a,t)}</div>
          <div id="nc-single-table-container"></div>
        </section>`;let e=l.querySelector(`#nc-single-table-container`),s=c?O(z.results,z.tournaments,c,i,a,t):[];s.length?(e.innerHTML=G(s),m(e)):e.replaceChildren(o(c?`Ingen resultater funnet.`:`Ingen data.`)),l.querySelector(`#nc-single-section`).addEventListener(`click`,e=>{let t=e.target.closest(`[data-class]`);t&&(R.classNum=Number(t.dataset.class),r())})}}r(),e.querySelector(`#nc-year`).addEventListener(`change`,async t=>{R.year=Number(t.target.value),R.classNum=1,y(R),e.querySelector(`#nc-cuptype`).value=R.cupType,e.querySelector(`#nc-content`).replaceChildren(i());let n=await F(R.year);if(!n){e.querySelector(`#nc-content`).replaceChildren(s(`Feil ved henting av data.`));return}z=n,r()}),e.querySelector(`#nc-cuptype`).addEventListener(`change`,e=>{R.cupType=e.target.value,R.classNum=1,y(R),r()}),e.querySelector(`#nc-view-tabs-container`).addEventListener(`click`,e=>{let t=e.target.closest(`[data-view]`);t&&(R.view=t.dataset.view,r())})}export{J as render};