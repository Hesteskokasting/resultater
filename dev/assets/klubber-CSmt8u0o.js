import{t as e}from"./logError-ByTg738k.js";import{S as t,b as n,dr as r,f as i,i as a,lr as o,ur as s,y as c}from"./index-BSSvcWYo.js";import{a as l,n as u,r as d}from"./klubbService-pPakrKDt.js";import{o as f,r as p}from"./kasterService-BN8H2rLx.js";import{t as m}from"./SearchInput-CDoDGwhR.js";import{t as h}from"./AdminLinkBar-CFEe7wKc.js";import{t as g}from"./Table-B_UMcRWp.js";function _(e){let n=new Map;for(let r of e){if(!r.klubb?.id)continue;let e=t(r).toLowerCase(),i=n.get(r.klubb.id);i?i.push(e):n.set(r.klubb.id,[e])}return n}function v(e,t,n){let r=n.trim().toLowerCase();return r?e.filter(e=>e.navn.toLowerCase().includes(r)||(t.get(e.id)??[]).some(e=>e.includes(r))):e}function y(e,n){let r=n.trim().toLowerCase();return r?e.filter(e=>t(e).toLowerCase().includes(r)):e}var b={searchText:``};function x(e,t){return`
    <div class="content-page">
      <div class="club-detail-header">
        <img src="${i(e.logourl||`https://placehold.co/200x200/444/888?text=?`)}" alt="${i(e.navn)}" class="club-logo-large">
        <h1 class="club-detail-title">${i(e.navn)}</h1>
      </div>
      <h3 class="mb-2">Aktive utøvarar (${t})</h3>
      <div class="filter-row mb-3"><span id="club-detail-search-slot"></span></div>
      <div id="club-detail-list"></div>
    </div>`}function S(e,r){let i=y(e,r);if(!i.length)return o(`Ingen aktive utøvarar funnet.`);let a=document.createElement(`div`);return a.className=`table-responsive`,a.appendChild(g({rows:i,columns:[{label:`#`,render:(e,t)=>String(t+1)},{label:`Utøvar`,render:e=>{let r=document.createElement(`a`);return r.href=`#/kastere/${n(e)}`,r.className=`app-link`,r.textContent=t(e),r}},{label:`Klasse`,render:e=>e.klasse?.navn??`–`},{label:`Nr.`,render:e=>String(e.medlemsnummer??`–`)}]})),a}async function C(t,n){b.searchText=``,t.replaceChildren(r(`Laster klubb...`));try{let[e,{data:r}]=await Promise.all([d(n),f(n)]);if(e.error||!e.data){t.replaceChildren(s(`Kunne ikkje laste klubb.`));return}let i=e.data;a(i.navn),t.innerHTML=x(i,r.length);let o=t.querySelector(`#club-detail-list`);function c(){o.replaceChildren(S(r,b.searchText))}m({slot:t.querySelector(`#club-detail-search-slot`),placeholder:`Søk på utøvar`,state:b,onInput:c}),c(),h(t,{href:`#/klubber/${n}/admin`,label:`Rediger klubb`,variant:`warning`,canShow:e=>e.profil?.role===`admin`||e.profil?.role===`klubbadmin`&&e.clubs.includes(n)})}catch(n){e(`klubber.renderDetail`,n),t.replaceChildren(s(`Kunne ikkje laste klubb.`))}}var w={showAll:!1,searchText:``};function T(e){return`
    <a href="#/klubber/${c(e)}" class="thrower-card">
      <img src="${i(e.logourl||`https://placehold.co/200x200/444/888?text=?`)}" alt="${i(e.navn)}" loading="lazy">
      <div class="thrower-name">${i(e.navn)}</div>
    </a>`}function E(){return`
    <div class="content-page">
      <div class="thrower-list-controls">
        <div class="filter-row"><span id="club-search-slot"></span></div>
        <div class="mt-2">
          <label class="thrower-checkbox-label">
            <input type="checkbox" id="club-active-only"${w.showAll?``:` checked`}>
            Vis berre aktive klubbar
          </label>
        </div>
      </div>
      <div id="club-grid" class="thrower-grid"></div>
    </div>`}function D(){return w.showAll?u():l()}async function O(t){t.replaceChildren(r(`Laster klubbar...`));try{let[{data:e,error:n},{data:r}]=await Promise.all([D(),p()]);if(n){t.replaceChildren(s(`Kunne ikkje laste klubbar.`));return}let i=_(r);t.innerHTML=E();let a=e,o=t.querySelector(`#club-grid`),c=t.querySelector(`#club-active-only`);function l(){let e=v(a,i,w.searchText);o.innerHTML=e.length?e.map(e=>T(e)).join(``):`<p class="empty-state">Ingen klubbar funnet.</p>`}m({slot:t.querySelector(`#club-search-slot`),placeholder:`Søk på klubbnavn eller utøvar`,state:w,onInput:l}),l(),c.addEventListener(`change`,async()=>{w.showAll=!c.checked;let{data:e,error:t}=await D();t||(a=e),l()}),h(t,{href:`#/klubber/ny`,label:`+ Ny klubb`,variant:`success`,canShow:e=>e.profil?.role===`admin`})}catch(n){e(`klubber.renderList`,n),t.replaceChildren(s(`Kunne ikkje laste klubbar.`))}}var k=async(e,t)=>{t.id?await C(e,Number(t.id)):await O(e)};export{k as render};