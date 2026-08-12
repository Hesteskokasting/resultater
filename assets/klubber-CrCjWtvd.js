import{t as e}from"./logError-CB4-2Lin.js";import{Lt as t,c as n,i as r}from"./index-Baps7_Vw.js";import{t as i}from"./LoadingState-C6NB62Ct.js";import{a,r as o}from"./klubbService-BuTqcngo.js";import{o as s,r as c}from"./kasterService-D9jqvobU.js";import{t as l}from"./EmptyState-CCNgsnix.js";import{n as u,r as d,t as f}from"./kaster-2cwCS5i9.js";import{t as p}from"./SearchInput-BwD50MFz.js";import{t as m}from"./AdminLinkBar-CkZILg0E.js";import{t as h}from"./Table-B_UMcRWp.js";var g=`https://placehold.co/200x200/444/888?text=?`,_={searchText:``},v={searchText:``};function y(e){return`
    <a href="#/klubber/${f(e)}" class="thrower-card">
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
    </div>`}function S(e,t){let n=t.trim().toLowerCase(),r=n?e.filter(e=>d(e).toLowerCase().includes(n)):e;if(!r.length)return l(`Ingen aktive utøvarar funnet.`);let i=document.createElement(`div`);return i.className=`table-responsive`,i.appendChild(h({rows:r,columns:[{label:`#`,render:(e,t)=>String(t+1)},{label:`Utøvar`,render:e=>{let t=document.createElement(`a`);return t.href=`#/kastere/${u(e)}`,t.className=`tl-link`,t.textContent=d(e),t}},{label:`Klasse`,render:e=>e.klasse?.navn??`–`},{label:`Nr.`,render:e=>String(e.medlemsnummer??`–`)}]})),i}async function C(n){n.replaceChildren(i(`Laster klubbar...`));try{let[{data:e,error:r},{data:i}]=await Promise.all([a(),c()]);if(r){n.replaceChildren(t(`Kunne ikkje laste klubbar.`));return}let o=new Map;for(let e of i)e.klubb?.id&&(o.has(e.klubb.id)||o.set(e.klubb.id,[]),o.get(e.klubb.id).push(d(e).toLowerCase()));n.innerHTML=b();let s=n.querySelector(`#club-grid`);function l(){let t=_.searchText.trim().toLowerCase(),n=t?e.filter(e=>e.navn.toLowerCase().includes(t)||(o.get(e.id)??[]).some(e=>e.includes(t))):e;s.innerHTML=n.length?n.map(y).join(``):`<p class="empty-state">Ingen klubbar funnet.</p>`}p({slot:n.querySelector(`#club-search-slot`),placeholder:`Søk på klubbnavn eller utøvar`,state:_,onInput:l}),l(),m(n,{href:`#/klubber/ny`,label:`+ Ny klubb`,variant:`success`,canShow:e=>e.profil?.role===`admin`})}catch(r){e(`renderList`,r),n.replaceChildren(t(`Kunne ikkje laste klubbar.`))}}async function w(n,a){v.searchText=``,n.replaceChildren(i(`Laster klubb...`));try{let[e,{data:i}]=await Promise.all([o(a),s(a)]);if(e.error||!e.data){n.replaceChildren(t(`Kunne ikkje laste klubb.`));return}let c=e.data;r(c.navn),n.innerHTML=x(c,i.length);let l=n.querySelector(`#club-detail-list`);function u(){l.replaceChildren(S(i,v.searchText))}p({slot:n.querySelector(`#club-detail-search-slot`),placeholder:`Søk på utøvar`,state:v,onInput:u}),u(),m(n,{href:`#/klubber/${a}/admin`,label:`Rediger klubb`,variant:`warning`,canShow:e=>e.profil?.role===`admin`||e.profil?.role===`klubbadmin`&&e.clubs.includes(a)})}catch(r){e(`renderDetail`,r),n.replaceChildren(t(`Kunne ikkje laste klubb.`))}}var T=async(e,t)=>{t.id?await w(e,Number(t.id)):await C(e)};export{T as render};