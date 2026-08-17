import{n as e,t}from"./logError-DE4meABt.js";import{_ as n,b as r,dr as i,fr as a,i as o,ur as s,v as c}from"./index-C5SiCpc_.js";import{a as l,r as u}from"./klubbService-Dj0rmPbi.js";import{o as d,r as f}from"./kasterService-D2LNpl7e.js";import{t as p}from"./SearchInput-CDoDGwhR.js";import{t as m}from"./AdminLinkBar-DCa-ya9I.js";import{t as h}from"./Table-B_UMcRWp.js";function g(e){let t=new Map;for(let n of e){if(!n.klubb?.id)continue;let e=r(n).toLowerCase(),i=t.get(n.klubb.id);i?i.push(e):t.set(n.klubb.id,[e])}return t}function _(e,t,n){let r=n.trim().toLowerCase();return r?e.filter(e=>e.navn.toLowerCase().includes(r)||(t.get(e.id)??[]).some(e=>e.includes(r))):e}function v(e,t){let n=t.trim().toLowerCase();return n?e.filter(e=>r(e).toLowerCase().includes(n)):e}var y={searchText:``};function b(t,n){return`
    <div class="content-page">
      <div class="club-detail-header">
        <img src="${e(t.logourl||`https://placehold.co/200x200/444/888?text=?`)}" alt="${e(t.navn)}" class="club-logo-large">
        <h1 class="club-detail-title">${e(t.navn)}</h1>
      </div>
      <h3 class="mb-2">Aktive utøvarar (${n})</h3>
      <div class="filter-row mb-3"><span id="club-detail-search-slot"></span></div>
      <div id="club-detail-list"></div>
    </div>`}function x(e,t){let n=v(e,t);if(!n.length)return s(`Ingen aktive utøvarar funnet.`);let i=document.createElement(`div`);return i.className=`table-responsive`,i.appendChild(h({rows:n,columns:[{label:`#`,render:(e,t)=>String(t+1)},{label:`Utøvar`,render:e=>{let t=document.createElement(`a`);return t.href=`#/kastere/${c(e)}`,t.className=`app-link`,t.textContent=r(e),t}},{label:`Klasse`,render:e=>e.klasse?.navn??`–`},{label:`Nr.`,render:e=>String(e.medlemsnummer??`–`)}]})),i}async function S(e,n){y.searchText=``,e.replaceChildren(a(`Laster klubb...`));try{let[t,{data:r}]=await Promise.all([u(n),d(n)]);if(t.error||!t.data){e.replaceChildren(i(`Kunne ikkje laste klubb.`));return}let a=t.data;o(a.navn),e.innerHTML=b(a,r.length);let s=e.querySelector(`#club-detail-list`);function c(){s.replaceChildren(x(r,y.searchText))}p({slot:e.querySelector(`#club-detail-search-slot`),placeholder:`Søk på utøvar`,state:y,onInput:c}),c(),m(e,{href:`#/klubber/${n}/admin`,label:`Rediger klubb`,variant:`warning`,canShow:e=>e.profil?.role===`admin`||e.profil?.role===`klubbadmin`&&e.clubs.includes(n)})}catch(n){t(`klubber.renderDetail`,n),e.replaceChildren(i(`Kunne ikkje laste klubb.`))}}var C={searchText:``};function w(t){return`
    <a href="#/klubber/${n(t)}" class="thrower-card">
      <img src="${e(t.logourl||`https://placehold.co/200x200/444/888?text=?`)}" alt="${e(t.navn)}" loading="lazy">
      <div class="thrower-name">${e(t.navn)}</div>
    </a>`}function T(){return`
    <div class="content-page">
      <div class="thrower-list-controls">
        <div class="filter-row"><span id="club-search-slot"></span></div>
      </div>
      <div id="club-grid" class="thrower-grid"></div>
    </div>`}async function E(e){e.replaceChildren(a(`Laster klubbar...`));try{let[{data:t,error:n},{data:r}]=await Promise.all([l(),f()]);if(n){e.replaceChildren(i(`Kunne ikkje laste klubbar.`));return}let a=g(r);e.innerHTML=T();let o=e.querySelector(`#club-grid`);function s(){let e=_(t,a,C.searchText);o.innerHTML=e.length?e.map(w).join(``):`<p class="empty-state">Ingen klubbar funnet.</p>`}p({slot:e.querySelector(`#club-search-slot`),placeholder:`Søk på klubbnavn eller utøvar`,state:C,onInput:s}),s(),m(e,{href:`#/klubber/ny`,label:`+ Ny klubb`,variant:`success`,canShow:e=>e.profil?.role===`admin`})}catch(n){t(`klubber.renderList`,n),e.replaceChildren(i(`Kunne ikkje laste klubbar.`))}}var D=async(e,t)=>{t.id?await S(e,Number(t.id)):await E(e)};export{D as render};