import{n as e,t}from"./escHtml-Z0YwDf7L.js";import{Xt as n,Yt as r,Zt as i,i as a}from"./index-CY82xwnt.js";import{a as o,r as s}from"./klubbService-4kqWJyho.js";import{o as c,r as l}from"./kasterService-CQnR08kH.js";import{n as u,r as d,t as f}from"./kaster-2cwCS5i9.js";import{t as p}from"./SearchInput-BwD50MFz.js";import{t as m}from"./AdminLinkBar-DYc0shH2.js";import{t as h}from"./Table-B_UMcRWp.js";var g=`https://placehold.co/200x200/444/888?text=?`,_={searchText:``},v={searchText:``};function y(e){return`
    <a href="#/klubber/${f(e)}" class="thrower-card">
      <img src="${t(e.logourl||g)}" alt="${t(e.navn)}" loading="lazy">
      <div class="thrower-name">${t(e.navn)}</div>
    </a>`}function b(){return`
    <div class="content-page">
      <div class="thrower-list-controls">
        <div class="nc-filter-rad"><span id="club-search-slot"></span></div>
      </div>
      <div id="club-grid" class="thrower-grid"></div>
    </div>`}function x(e,n){return`
    <div class="content-page">
      <div class="club-detail-header">
        <img src="${t(e.logourl||g)}" alt="${t(e.navn)}" class="club-logo-large">
        <h1 class="club-detail-title">${t(e.navn)}</h1>
      </div>
      <h3 class="mb-2">Aktive utøvarar (${n})</h3>
      <div class="nc-filter-rad mb-3"><span id="club-detail-search-slot"></span></div>
      <div id="club-detail-list"></div>
    </div>`}function S(e,t){let n=t.trim().toLowerCase(),i=n?e.filter(e=>d(e).toLowerCase().includes(n)):e;if(!i.length)return r(`Ingen aktive utøvarar funnet.`);let a=document.createElement(`div`);return a.className=`table-responsive`,a.appendChild(h({rows:i,columns:[{label:`#`,render:(e,t)=>String(t+1)},{label:`Utøvar`,render:e=>{let t=document.createElement(`a`);return t.href=`#/kastere/${u(e)}`,t.className=`tl-link`,t.textContent=d(e),t}},{label:`Klasse`,render:e=>e.klasse?.navn??`–`},{label:`Nr.`,render:e=>String(e.medlemsnummer??`–`)}]})),a}async function C(t){t.replaceChildren(i(`Laster klubbar...`));try{let[{data:e,error:r},{data:i}]=await Promise.all([o(),l()]);if(r){t.replaceChildren(n(`Kunne ikkje laste klubbar.`));return}let a=new Map;for(let e of i)e.klubb?.id&&(a.has(e.klubb.id)||a.set(e.klubb.id,[]),a.get(e.klubb.id).push(d(e).toLowerCase()));t.innerHTML=b();let s=t.querySelector(`#club-grid`);function c(){let t=_.searchText.trim().toLowerCase(),n=t?e.filter(e=>e.navn.toLowerCase().includes(t)||(a.get(e.id)??[]).some(e=>e.includes(t))):e;s.innerHTML=n.length?n.map(y).join(``):`<p class="empty-state">Ingen klubbar funnet.</p>`}p({slot:t.querySelector(`#club-search-slot`),placeholder:`Søk på klubbnavn eller utøvar`,state:_,onInput:c}),c(),m(t,{href:`#/klubber/ny`,label:`+ Ny klubb`,variant:`success`,canShow:e=>e.profil?.role===`admin`})}catch(r){e(`renderList`,r),t.replaceChildren(n(`Kunne ikkje laste klubbar.`))}}async function w(t,r){v.searchText=``,t.replaceChildren(i(`Laster klubb...`));try{let[e,{data:i}]=await Promise.all([s(r),c(r)]);if(e.error||!e.data){t.replaceChildren(n(`Kunne ikkje laste klubb.`));return}let o=e.data;a(o.navn),t.innerHTML=x(o,i.length);let l=t.querySelector(`#club-detail-list`);function u(){l.replaceChildren(S(i,v.searchText))}p({slot:t.querySelector(`#club-detail-search-slot`),placeholder:`Søk på utøvar`,state:v,onInput:u}),u(),m(t,{href:`#/klubber/${r}/admin`,label:`Rediger klubb`,variant:`warning`,canShow:e=>e.profil?.role===`admin`||e.profil?.role===`klubbadmin`&&e.clubs.includes(r)})}catch(r){e(`renderDetail`,r),t.replaceChildren(n(`Kunne ikkje laste klubb.`))}}var T=async(e,t)=>{t.id?await w(e,Number(t.id)):await C(e)};export{T as render};