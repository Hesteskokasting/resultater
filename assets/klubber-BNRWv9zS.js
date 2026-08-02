import{t as e}from"./logError-D5z16FyH.js";import{a as t,r as n,wt as r}from"./index-CApPqR2n.js";import{r as i,t as a}from"./klubbService-CaXvOdL5.js";import{o,r as s}from"./kasterService-B3gLOC11.js";import{n as c,r as l,t as u}from"./kaster-D1SjB08R.js";import{t as d}from"./LoadingState-CllUVMAe.js";import{t as f}from"./EmptyState-17a_4X87.js";import{t as p}from"./AdminLinkBar-C2TV03th.js";import{t as m}from"./SearchInput-DiKTgjds.js";import{t as h}from"./Table-BggEyKS_.js";var g=`https://placehold.co/200x200/444/888?text=?`,_={searchText:``},v={searchText:``};function y(e){return`
    <a href="#/klubber/${u(e)}" class="thrower-card">
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
    </div>`}function S(e,t){let n=t.trim().toLowerCase(),r=n?e.filter(e=>l(e).toLowerCase().includes(n)):e;if(!r.length)return f(`Ingen aktive utøvarar funnet.`);let i=document.createElement(`div`);return i.className=`table-responsive`,i.appendChild(h({rows:r,columns:[{label:`#`,render:(e,t)=>String(t+1)},{label:`Utøvar`,render:e=>{let t=document.createElement(`a`);return t.href=`#/kastere/${c(e)}`,t.className=`tl-link`,t.textContent=l(e),t}},{label:`Klasse`,render:e=>e.klasse?.navn??`–`},{label:`Nr.`,render:e=>String(e.medlemsnummer??`–`)}]})),i}async function C(t){t.replaceChildren(d(`Laster klubbar...`));try{let[{data:e,error:n},{data:a}]=await Promise.all([i(),s()]);if(n){t.replaceChildren(r(`Kunne ikkje laste klubbar.`));return}let o=new Map;for(let e of a)e.klubb?.id&&(o.has(e.klubb.id)||o.set(e.klubb.id,[]),o.get(e.klubb.id).push(l(e).toLowerCase()));t.innerHTML=b();let c=t.querySelector(`#club-grid`);function u(){let t=_.searchText.trim().toLowerCase(),n=t?e.filter(e=>e.navn.toLowerCase().includes(t)||(o.get(e.id)??[]).some(e=>e.includes(t))):e;c.innerHTML=n.length?n.map(y).join(``):`<p class="empty-state">Ingen klubbar funnet.</p>`}m({slot:t.querySelector(`#club-search-slot`),placeholder:`Søk på klubbnavn eller utøvar`,state:_,onInput:u}),u(),p(t,{href:`#/klubber/ny`,label:`+ Ny klubb`,variant:`success`,canShow:e=>e.profil?.role===`admin`})}catch(n){e(`renderList`,n),t.replaceChildren(r(`Kunne ikkje laste klubbar.`))}}async function w(t,i){v.searchText=``,t.replaceChildren(d(`Laster klubb...`));try{let[e,{data:s}]=await Promise.all([a(i),o(i)]);if(e.error||!e.data){t.replaceChildren(r(`Kunne ikkje laste klubb.`));return}let c=e.data;n(c.navn),t.innerHTML=x(c,s.length);let l=t.querySelector(`#club-detail-list`);function u(){l.replaceChildren(S(s,v.searchText))}m({slot:t.querySelector(`#club-detail-search-slot`),placeholder:`Søk på utøvar`,state:v,onInput:u}),u(),p(t,{href:`#/klubber/${i}/admin`,label:`Rediger klubb`,variant:`warning`,canShow:e=>e.profil?.role===`admin`||e.profil?.role===`klubbadmin`&&e.clubs.includes(i)})}catch(n){e(`renderDetail`,n),t.replaceChildren(r(`Kunne ikkje laste klubb.`))}}var T=async(e,t)=>{t.id?await w(e,Number(t.id)):await C(e)};export{T as render};