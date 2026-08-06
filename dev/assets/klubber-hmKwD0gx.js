import{t as e}from"./logError-BO7RC_Nh.js";import{It as t,r as n,s as r}from"./index-DGqE6WFf.js";import{o as i,r as a}from"./kasterService-BMY5rO_4.js";import{t as o}from"./LoadingState-C6NB62Ct.js";import{a as s,r as c}from"./klubbService-Haapdsx7.js";import{n as l,r as u,t as d}from"./kaster-CGWDYFbf.js";import{t as f}from"./EmptyState-CCNgsnix.js";import{t as p}from"./SearchInput-BwD50MFz.js";import{t as m}from"./AdminLinkBar-Bu_y6jql.js";import{t as h}from"./Table-B_UMcRWp.js";var g=`https://placehold.co/200x200/444/888?text=?`,_={searchText:``},v={searchText:``};function y(e){return`
    <a href="#/klubber/${d(e)}" class="thrower-card">
      <img src="${r(e.logourl||g)}" alt="${r(e.navn)}" loading="lazy">
      <div class="thrower-name">${r(e.navn)}</div>
    </a>`}function b(){return`
    <div class="content-page">
      <div class="thrower-list-controls">
        <div class="nc-filter-rad"><span id="club-search-slot"></span></div>
      </div>
      <div id="club-grid" class="thrower-grid"></div>
    </div>`}function x(e,t){return`
    <div class="content-page">
      <div class="club-detail-header">
        <img src="${r(e.logourl||g)}" alt="${r(e.navn)}" class="club-logo-large">
        <h1 class="club-detail-title">${r(e.navn)}</h1>
      </div>
      <h3 class="mb-2">Aktive utøvarar (${t})</h3>
      <div class="nc-filter-rad mb-3"><span id="club-detail-search-slot"></span></div>
      <div id="club-detail-list"></div>
    </div>`}function S(e,t){let n=t.trim().toLowerCase(),r=n?e.filter(e=>u(e).toLowerCase().includes(n)):e;if(!r.length)return f(`Ingen aktive utøvarar funnet.`);let i=document.createElement(`div`);return i.className=`table-responsive`,i.appendChild(h({rows:r,columns:[{label:`#`,render:(e,t)=>String(t+1)},{label:`Utøvar`,render:e=>{let t=document.createElement(`a`);return t.href=`#/kastere/${l(e)}`,t.className=`tl-link`,t.textContent=u(e),t}},{label:`Klasse`,render:e=>e.klasse?.navn??`–`},{label:`Nr.`,render:e=>String(e.medlemsnummer??`–`)}]})),i}async function C(n){n.replaceChildren(o(`Laster klubbar...`));try{let[{data:e,error:r},{data:i}]=await Promise.all([s(),a()]);if(r){n.replaceChildren(t(`Kunne ikkje laste klubbar.`));return}let o=new Map;for(let e of i)e.klubb?.id&&(o.has(e.klubb.id)||o.set(e.klubb.id,[]),o.get(e.klubb.id).push(u(e).toLowerCase()));n.innerHTML=b();let c=n.querySelector(`#club-grid`);function l(){let t=_.searchText.trim().toLowerCase(),n=t?e.filter(e=>e.navn.toLowerCase().includes(t)||(o.get(e.id)??[]).some(e=>e.includes(t))):e;c.innerHTML=n.length?n.map(y).join(``):`<p class="empty-state">Ingen klubbar funnet.</p>`}p({slot:n.querySelector(`#club-search-slot`),placeholder:`Søk på klubbnavn eller utøvar`,state:_,onInput:l}),l(),m(n,{href:`#/klubber/ny`,label:`+ Ny klubb`,variant:`success`,canShow:e=>e.profil?.role===`admin`})}catch(r){e(`renderList`,r),n.replaceChildren(t(`Kunne ikkje laste klubbar.`))}}async function w(r,a){v.searchText=``,r.replaceChildren(o(`Laster klubb...`));try{let[e,{data:o}]=await Promise.all([c(a),i(a)]);if(e.error||!e.data){r.replaceChildren(t(`Kunne ikkje laste klubb.`));return}let s=e.data;n(s.navn),r.innerHTML=x(s,o.length);let l=r.querySelector(`#club-detail-list`);function u(){l.replaceChildren(S(o,v.searchText))}p({slot:r.querySelector(`#club-detail-search-slot`),placeholder:`Søk på utøvar`,state:v,onInput:u}),u(),m(r,{href:`#/klubber/${a}/admin`,label:`Rediger klubb`,variant:`warning`,canShow:e=>e.profil?.role===`admin`||e.profil?.role===`klubbadmin`&&e.clubs.includes(a)})}catch(n){e(`renderDetail`,n),r.replaceChildren(t(`Kunne ikkje laste klubb.`))}}var T=async(e,t)=>{t.id?await w(e,Number(t.id)):await C(e)};export{T as render};