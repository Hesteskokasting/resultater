import{t as e}from"./logError-D5z16FyH.js";import{It as t,Lt as n,Rt as r,St as i,r as a,xt as o}from"./index-BKVpNZfr.js";import{r as s,t as c}from"./klubbService-CaXvOdL5.js";import{o as l,r as u}from"./kasterService-B3gLOC11.js";import{t as d}from"./LoadingState-BWi0wPLz.js";import{t as f}from"./EmptyState-B1E_7OzB.js";import{t as p}from"./AdminLinkBar-BLpmi5v0.js";import{t as m}from"./SearchInput-BLUeXGg6.js";import{t as h}from"./Table-BMdVKjzY.js";var g=`https://placehold.co/200x200/444/888?text=?`,_={searchText:``},v={searchText:``};function y(e){return`
    <a href="#/klubber/${t(e)}" class="thrower-card">
      <img src="${o(e.logourl||g)}" alt="${o(e.navn)}" loading="lazy">
      <div class="thrower-name">${o(e.navn)}</div>
    </a>`}function b(){return`
    <div class="content-page">
      <div class="thrower-list-controls">
        <div class="nc-filter-rad"><span id="club-search-slot"></span></div>
      </div>
      <div id="club-grid" class="thrower-grid"></div>
    </div>`}function x(e,t){return`
    <div class="content-page">
      <div class="club-detail-header">
        <img src="${o(e.logourl||g)}" alt="${o(e.navn)}" class="club-logo-large">
        <h1 class="club-detail-title">${o(e.navn)}</h1>
      </div>
      <h3 class="mb-2">Aktive utøvarar (${t})</h3>
      <div class="nc-filter-rad mb-3"><span id="club-detail-search-slot"></span></div>
      <div id="club-detail-list"></div>
    </div>`}function S(e,t){let i=t.trim().toLowerCase(),a=i?e.filter(e=>r(e).toLowerCase().includes(i)):e;if(!a.length)return f(`Ingen aktive utøvarar funnet.`);let o=document.createElement(`div`);return o.className=`table-responsive`,o.appendChild(h({rows:a,columns:[{label:`#`,render:(e,t)=>String(t+1)},{label:`Utøvar`,render:e=>{let t=document.createElement(`a`);return t.href=`#/kastere/${n(e)}`,t.className=`tl-link`,t.textContent=r(e),t}},{label:`Klasse`,render:e=>e.klasse?.navn??`–`},{label:`Nr.`,render:e=>String(e.medlemsnummer??`–`)}]})),o}async function C(t){t.replaceChildren(d(`Laster klubbar...`));try{let[{data:e,error:n},{data:a}]=await Promise.all([s(),u()]);if(n){t.replaceChildren(i(`Kunne ikkje laste klubbar.`));return}let o=new Map;for(let e of a)e.klubb?.id&&(o.has(e.klubb.id)||o.set(e.klubb.id,[]),o.get(e.klubb.id).push(r(e).toLowerCase()));t.innerHTML=b();let c=t.querySelector(`#club-grid`);function l(){let t=_.searchText.trim().toLowerCase(),n=t?e.filter(e=>e.navn.toLowerCase().includes(t)||(o.get(e.id)??[]).some(e=>e.includes(t))):e;c.innerHTML=n.length?n.map(y).join(``):`<p class="empty-state">Ingen klubbar funnet.</p>`}m({slot:t.querySelector(`#club-search-slot`),placeholder:`Søk på klubbnavn eller utøvar`,state:_,onInput:l}),l(),p(t,{href:`#/klubber/ny`,label:`+ Ny klubb`,variant:`success`,canShow:e=>e.profil?.role===`admin`})}catch(n){e(`renderList`,n),t.replaceChildren(i(`Kunne ikkje laste klubbar.`))}}async function w(t,n){v.searchText=``,t.replaceChildren(d(`Laster klubb...`));try{let[e,{data:r}]=await Promise.all([c(n),l(n)]);if(e.error||!e.data){t.replaceChildren(i(`Kunne ikkje laste klubb.`));return}let o=e.data;a(o.navn),t.innerHTML=x(o,r.length);let s=t.querySelector(`#club-detail-list`);function u(){s.replaceChildren(S(r,v.searchText))}m({slot:t.querySelector(`#club-detail-search-slot`),placeholder:`Søk på utøvar`,state:v,onInput:u}),u(),p(t,{href:`#/klubber/${n}/admin`,label:`Rediger klubb`,variant:`warning`,canShow:e=>e.profil?.role===`admin`||e.profil?.role===`klubbadmin`&&e.clubs.includes(n)})}catch(n){e(`renderDetail`,n),t.replaceChildren(i(`Kunne ikkje laste klubb.`))}}var T=async(e,t)=>{t.id?await w(e,Number(t.id)):await C(e)};export{T as render};