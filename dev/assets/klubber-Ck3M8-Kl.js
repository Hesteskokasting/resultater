import{t as e}from"./logError-D5z16FyH.js";import{Bt as t,Tt as n,Vt as r,r as i,wt as a,zt as o}from"./index-DVHt6_kn.js";import{r as s,t as c}from"./klubbService-CaXvOdL5.js";import{o as l,r as u}from"./kasterService-B3gLOC11.js";import{t as d}from"./LoadingState-BWi0wPLz.js";import{t as f}from"./EmptyState-B1E_7OzB.js";import{t as p}from"./AdminLinkBar-BynOOqfH.js";import{t as m}from"./SearchInput-BLUeXGg6.js";import{t as h}from"./Table-BMdVKjzY.js";var g=`https://placehold.co/200x200/444/888?text=?`,_={searchText:``},v={searchText:``};function y(e){return`
    <a href="#/klubber/${o(e)}" class="thrower-card">
      <img src="${a(e.logourl||g)}" alt="${a(e.navn)}" loading="lazy">
      <div class="thrower-name">${a(e.navn)}</div>
    </a>`}function b(){return`
    <div class="content-page">
      <div class="thrower-list-controls">
        <div class="nc-filter-rad"><span id="club-search-slot"></span></div>
      </div>
      <div id="club-grid" class="thrower-grid"></div>
    </div>`}function x(e,t){return`
    <div class="content-page">
      <div class="club-detail-header">
        <img src="${a(e.logourl||g)}" alt="${a(e.navn)}" class="club-logo-large">
        <h1 class="club-detail-title">${a(e.navn)}</h1>
      </div>
      <h3 class="mb-2">Aktive utøvarar (${t})</h3>
      <div class="nc-filter-rad mb-3"><span id="club-detail-search-slot"></span></div>
      <div id="club-detail-list"></div>
    </div>`}function S(e,n){let i=n.trim().toLowerCase(),a=i?e.filter(e=>r(e).toLowerCase().includes(i)):e;if(!a.length)return f(`Ingen aktive utøvarar funnet.`);let o=document.createElement(`div`);return o.className=`table-responsive`,o.appendChild(h({rows:a,columns:[{label:`#`,render:(e,t)=>String(t+1)},{label:`Utøvar`,render:e=>{let n=document.createElement(`a`);return n.href=`#/kastere/${t(e)}`,n.className=`tl-link`,n.textContent=r(e),n}},{label:`Klasse`,render:e=>e.klasse?.navn??`–`},{label:`Nr.`,render:e=>String(e.medlemsnummer??`–`)}]})),o}async function C(t){t.replaceChildren(d(`Laster klubbar...`));try{let[{data:e,error:i},{data:a}]=await Promise.all([s(),u()]);if(i){t.replaceChildren(n(`Kunne ikkje laste klubbar.`));return}let o=new Map;for(let e of a)e.klubb?.id&&(o.has(e.klubb.id)||o.set(e.klubb.id,[]),o.get(e.klubb.id).push(r(e).toLowerCase()));t.innerHTML=b();let c=t.querySelector(`#club-grid`);function l(){let t=_.searchText.trim().toLowerCase(),n=t?e.filter(e=>e.navn.toLowerCase().includes(t)||(o.get(e.id)??[]).some(e=>e.includes(t))):e;c.innerHTML=n.length?n.map(y).join(``):`<p class="empty-state">Ingen klubbar funnet.</p>`}m({slot:t.querySelector(`#club-search-slot`),placeholder:`Søk på klubbnavn eller utøvar`,state:_,onInput:l}),l(),p(t,{href:`#/klubber/ny`,label:`+ Ny klubb`,variant:`success`,canShow:e=>e.profil?.role===`admin`})}catch(r){e(`renderList`,r),t.replaceChildren(n(`Kunne ikkje laste klubbar.`))}}async function w(t,r){v.searchText=``,t.replaceChildren(d(`Laster klubb...`));try{let[e,{data:a}]=await Promise.all([c(r),l(r)]);if(e.error||!e.data){t.replaceChildren(n(`Kunne ikkje laste klubb.`));return}let o=e.data;i(o.navn),t.innerHTML=x(o,a.length);let s=t.querySelector(`#club-detail-list`);function u(){s.replaceChildren(S(a,v.searchText))}m({slot:t.querySelector(`#club-detail-search-slot`),placeholder:`Søk på utøvar`,state:v,onInput:u}),u(),p(t,{href:`#/klubber/${r}/admin`,label:`Rediger klubb`,variant:`warning`,canShow:e=>e.profil?.role===`admin`||e.profil?.role===`klubbadmin`&&e.clubs.includes(r)})}catch(r){e(`renderDetail`,r),t.replaceChildren(n(`Kunne ikkje laste klubb.`))}}var T=async(e,t)=>{t.id?await w(e,Number(t.id)):await C(e)};export{T as render};