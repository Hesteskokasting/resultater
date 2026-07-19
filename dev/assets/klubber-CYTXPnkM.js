import{t as e}from"./logError-D5z16FyH.js";import{Ct as t,Lt as n,Rt as r,St as i,r as a,zt as o}from"./index-DtEMUua3.js";import{r as s,t as c}from"./klubbService-CaXvOdL5.js";import{o as l,r as u}from"./kasterService-B3gLOC11.js";import{t as d}from"./LoadingState-BWi0wPLz.js";import{t as f}from"./EmptyState-B1E_7OzB.js";import{t as p}from"./AdminLinkBar-Cp93svQc.js";import{t as m}from"./SearchInput-BLUeXGg6.js";import{t as h}from"./Table-BMdVKjzY.js";var g=`https://placehold.co/200x200/444/888?text=?`,_={searchText:``},v={searchText:``};function y(e){return`
    <a href="#/klubber/${n(e)}" class="thrower-card">
      <img src="${i(e.logourl||g)}" alt="${i(e.navn)}" loading="lazy">
      <div class="thrower-name">${i(e.navn)}</div>
    </a>`}function b(){return`
    <div class="content-page">
      <div class="thrower-list-controls">
        <div class="nc-filter-rad"><span id="club-search-slot"></span></div>
      </div>
      <div id="club-grid" class="thrower-grid"></div>
    </div>`}function x(e,t){return`
    <div class="content-page">
      <div class="club-detail-header">
        <img src="${i(e.logourl||g)}" alt="${i(e.navn)}" class="club-logo-large">
        <h1 class="club-detail-title">${i(e.navn)}</h1>
      </div>
      <h3 class="mb-2">Aktive utøvarar (${t})</h3>
      <div class="nc-filter-rad mb-3"><span id="club-detail-search-slot"></span></div>
      <div id="club-detail-list"></div>
    </div>`}function S(e,t){let n=t.trim().toLowerCase(),i=n?e.filter(e=>o(e).toLowerCase().includes(n)):e;if(!i.length)return f(`Ingen aktive utøvarar funnet.`);let a=document.createElement(`div`);return a.className=`table-responsive`,a.appendChild(h({rows:i,columns:[{label:`#`,render:(e,t)=>String(t+1)},{label:`Utøvar`,render:e=>{let t=document.createElement(`a`);return t.href=`#/kastere/${r(e)}`,t.className=`tl-link`,t.textContent=o(e),t}},{label:`Klasse`,render:e=>e.klasse?.navn??`–`},{label:`Nr.`,render:e=>String(e.medlemsnummer??`–`)}]})),a}async function C(n){n.replaceChildren(d(`Laster klubbar...`));try{let[{data:e,error:r},{data:i}]=await Promise.all([s(),u()]);if(r){n.replaceChildren(t(`Kunne ikkje laste klubbar.`));return}let a=new Map;for(let e of i)e.klubb?.id&&(a.has(e.klubb.id)||a.set(e.klubb.id,[]),a.get(e.klubb.id).push(o(e).toLowerCase()));n.innerHTML=b();let c=n.querySelector(`#club-grid`);function l(){let t=_.searchText.trim().toLowerCase(),n=t?e.filter(e=>e.navn.toLowerCase().includes(t)||(a.get(e.id)??[]).some(e=>e.includes(t))):e;c.innerHTML=n.length?n.map(y).join(``):`<p class="empty-state">Ingen klubbar funnet.</p>`}m({slot:n.querySelector(`#club-search-slot`),placeholder:`Søk på klubbnavn eller utøvar`,state:_,onInput:l}),l(),p(n,{href:`#/klubber/ny`,label:`+ Ny klubb`,variant:`success`,canShow:e=>e.profil?.role===`admin`})}catch(r){e(`renderList`,r),n.replaceChildren(t(`Kunne ikkje laste klubbar.`))}}async function w(n,r){v.searchText=``,n.replaceChildren(d(`Laster klubb...`));try{let[e,{data:i}]=await Promise.all([c(r),l(r)]);if(e.error||!e.data){n.replaceChildren(t(`Kunne ikkje laste klubb.`));return}let o=e.data;a(o.navn),n.innerHTML=x(o,i.length);let s=n.querySelector(`#club-detail-list`);function u(){s.replaceChildren(S(i,v.searchText))}m({slot:n.querySelector(`#club-detail-search-slot`),placeholder:`Søk på utøvar`,state:v,onInput:u}),u(),p(n,{href:`#/klubber/${r}/admin`,label:`Rediger klubb`,variant:`warning`,canShow:e=>e.profil?.role===`admin`||e.profil?.role===`klubbadmin`&&e.clubs.includes(r)})}catch(r){e(`renderDetail`,r),n.replaceChildren(t(`Kunne ikkje laste klubb.`))}}var T=async(e,t)=>{t.id?await w(e,Number(t.id)):await C(e)};export{T as render};