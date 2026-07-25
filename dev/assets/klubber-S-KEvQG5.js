import{t as e}from"./logError-D5z16FyH.js";import{Bt as t,Ct as n,Rt as r,r as i,wt as a,zt as o}from"./index-BErz4npm.js";import{r as s,t as c}from"./klubbService-CaXvOdL5.js";import{o as l,r as u}from"./kasterService-B3gLOC11.js";import{t as d}from"./LoadingState-BWi0wPLz.js";import{t as f}from"./EmptyState-B1E_7OzB.js";import{t as p}from"./AdminLinkBar-N9c1Lnay.js";import{t as m}from"./SearchInput-BLUeXGg6.js";import{t as h}from"./Table-BMdVKjzY.js";var g=`https://placehold.co/200x200/444/888?text=?`,_={searchText:``},v={searchText:``};function y(e){return`
    <a href="#/klubber/${r(e)}" class="thrower-card">
      <img src="${n(e.logourl||g)}" alt="${n(e.navn)}" loading="lazy">
      <div class="thrower-name">${n(e.navn)}</div>
    </a>`}function b(){return`
    <div class="content-page">
      <div class="thrower-list-controls">
        <div class="nc-filter-rad"><span id="club-search-slot"></span></div>
      </div>
      <div id="club-grid" class="thrower-grid"></div>
    </div>`}function x(e,t){return`
    <div class="content-page">
      <div class="club-detail-header">
        <img src="${n(e.logourl||g)}" alt="${n(e.navn)}" class="club-logo-large">
        <h1 class="club-detail-title">${n(e.navn)}</h1>
      </div>
      <h3 class="mb-2">Aktive utøvarar (${t})</h3>
      <div class="nc-filter-rad mb-3"><span id="club-detail-search-slot"></span></div>
      <div id="club-detail-list"></div>
    </div>`}function S(e,n){let r=n.trim().toLowerCase(),i=r?e.filter(e=>t(e).toLowerCase().includes(r)):e;if(!i.length)return f(`Ingen aktive utøvarar funnet.`);let a=document.createElement(`div`);return a.className=`table-responsive`,a.appendChild(h({rows:i,columns:[{label:`#`,render:(e,t)=>String(t+1)},{label:`Utøvar`,render:e=>{let n=document.createElement(`a`);return n.href=`#/kastere/${o(e)}`,n.className=`tl-link`,n.textContent=t(e),n}},{label:`Klasse`,render:e=>e.klasse?.navn??`–`},{label:`Nr.`,render:e=>String(e.medlemsnummer??`–`)}]})),a}async function C(n){n.replaceChildren(d(`Laster klubbar...`));try{let[{data:e,error:r},{data:i}]=await Promise.all([s(),u()]);if(r){n.replaceChildren(a(`Kunne ikkje laste klubbar.`));return}let o=new Map;for(let e of i)e.klubb?.id&&(o.has(e.klubb.id)||o.set(e.klubb.id,[]),o.get(e.klubb.id).push(t(e).toLowerCase()));n.innerHTML=b();let c=n.querySelector(`#club-grid`);function l(){let t=_.searchText.trim().toLowerCase(),n=t?e.filter(e=>e.navn.toLowerCase().includes(t)||(o.get(e.id)??[]).some(e=>e.includes(t))):e;c.innerHTML=n.length?n.map(y).join(``):`<p class="empty-state">Ingen klubbar funnet.</p>`}m({slot:n.querySelector(`#club-search-slot`),placeholder:`Søk på klubbnavn eller utøvar`,state:_,onInput:l}),l(),p(n,{href:`#/klubber/ny`,label:`+ Ny klubb`,variant:`success`,canShow:e=>e.profil?.role===`admin`})}catch(t){e(`renderList`,t),n.replaceChildren(a(`Kunne ikkje laste klubbar.`))}}async function w(t,n){v.searchText=``,t.replaceChildren(d(`Laster klubb...`));try{let[e,{data:r}]=await Promise.all([c(n),l(n)]);if(e.error||!e.data){t.replaceChildren(a(`Kunne ikkje laste klubb.`));return}let o=e.data;i(o.navn),t.innerHTML=x(o,r.length);let s=t.querySelector(`#club-detail-list`);function u(){s.replaceChildren(S(r,v.searchText))}m({slot:t.querySelector(`#club-detail-search-slot`),placeholder:`Søk på utøvar`,state:v,onInput:u}),u(),p(t,{href:`#/klubber/${n}/admin`,label:`Rediger klubb`,variant:`warning`,canShow:e=>e.profil?.role===`admin`||e.profil?.role===`klubbadmin`&&e.clubs.includes(n)})}catch(n){e(`renderDetail`,n),t.replaceChildren(a(`Kunne ikkje laste klubb.`))}}var T=async(e,t)=>{t.id?await w(e,Number(t.id)):await C(e)};export{T as render};