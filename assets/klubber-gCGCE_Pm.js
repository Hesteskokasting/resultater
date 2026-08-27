import{t as e}from"./logError-ByTg738k.js";import{S as t,b as n,dr as r,f as i,i as a,lr as o,ur as s,y as c}from"./index-BvGIsWRi.js";import{a as l,r as u}from"./klubbService-pPakrKDt.js";import{o as d,r as f}from"./kasterService-BN8H2rLx.js";import{t as p}from"./SearchInput-CDoDGwhR.js";import{t as m}from"./AdminLinkBar-C84izVBS.js";import{t as h}from"./Table-B_UMcRWp.js";function g(e){let n=new Map;for(let r of e){if(!r.klubb?.id)continue;let e=t(r).toLowerCase(),i=n.get(r.klubb.id);i?i.push(e):n.set(r.klubb.id,[e])}return n}function _(e,t,n){let r=n.trim().toLowerCase();return r?e.filter(e=>e.navn.toLowerCase().includes(r)||(t.get(e.id)??[]).some(e=>e.includes(r))):e}function v(e,n){let r=n.trim().toLowerCase();return r?e.filter(e=>t(e).toLowerCase().includes(r)):e}var y={searchText:``};function b(e,t){return`
    <div class="content-page">
      <div class="club-detail-header">
        <img src="${i(e.logourl||`https://placehold.co/200x200/444/888?text=?`)}" alt="${i(e.navn)}" class="club-logo-large">
        <h1 class="club-detail-title">${i(e.navn)}</h1>
      </div>
      <h3 class="mb-2">Aktive utøvarar (${t})</h3>
      <div class="filter-row mb-3"><span id="club-detail-search-slot"></span></div>
      <div id="club-detail-list"></div>
    </div>`}function x(e,r){let i=v(e,r);if(!i.length)return o(`Ingen aktive utøvarar funnet.`);let a=document.createElement(`div`);return a.className=`table-responsive`,a.appendChild(h({rows:i,columns:[{label:`#`,render:(e,t)=>String(t+1)},{label:`Utøvar`,render:e=>{let r=document.createElement(`a`);return r.href=`#/kastere/${n(e)}`,r.className=`app-link`,r.textContent=t(e),r}},{label:`Klasse`,render:e=>e.klasse?.navn??`–`},{label:`Nr.`,render:e=>String(e.medlemsnummer??`–`)}]})),a}async function S(t,n){y.searchText=``,t.replaceChildren(r(`Laster klubb...`));try{let[e,{data:r}]=await Promise.all([u(n),d(n)]);if(e.error||!e.data){t.replaceChildren(s(`Kunne ikkje laste klubb.`));return}let i=e.data;a(i.navn),t.innerHTML=b(i,r.length);let o=t.querySelector(`#club-detail-list`);function c(){o.replaceChildren(x(r,y.searchText))}p({slot:t.querySelector(`#club-detail-search-slot`),placeholder:`Søk på utøvar`,state:y,onInput:c}),c(),m(t,{href:`#/klubber/${n}/admin`,label:`Rediger klubb`,variant:`warning`,canShow:e=>e.profil?.role===`admin`||e.profil?.role===`klubbadmin`&&e.clubs.includes(n)})}catch(n){e(`klubber.renderDetail`,n),t.replaceChildren(s(`Kunne ikkje laste klubb.`))}}var C={searchText:``};function w(e){return`
    <a href="#/klubber/${c(e)}" class="thrower-card">
      <img src="${i(e.logourl||`https://placehold.co/200x200/444/888?text=?`)}" alt="${i(e.navn)}" loading="lazy">
      <div class="thrower-name">${i(e.navn)}</div>
    </a>`}function T(){return`
    <div class="content-page">
      <div class="thrower-list-controls">
        <div class="filter-row"><span id="club-search-slot"></span></div>
      </div>
      <div id="club-grid" class="thrower-grid"></div>
    </div>`}async function E(t){t.replaceChildren(r(`Laster klubbar...`));try{let[{data:e,error:n},{data:r}]=await Promise.all([l(),f()]);if(n){t.replaceChildren(s(`Kunne ikkje laste klubbar.`));return}let i=g(r);t.innerHTML=T();let a=t.querySelector(`#club-grid`);function o(){let t=_(e,i,C.searchText);a.innerHTML=t.length?t.map(e=>w(e)).join(``):`<p class="empty-state">Ingen klubbar funnet.</p>`}p({slot:t.querySelector(`#club-search-slot`),placeholder:`Søk på klubbnavn eller utøvar`,state:C,onInput:o}),o(),m(t,{href:`#/klubber/ny`,label:`+ Ny klubb`,variant:`success`,canShow:e=>e.profil?.role===`admin`})}catch(n){e(`klubber.renderList`,n),t.replaceChildren(s(`Kunne ikkje laste klubbar.`))}}var D=async(e,t)=>{t.id?await S(e,Number(t.id)):await E(e)};export{D as render};