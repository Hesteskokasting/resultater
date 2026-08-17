import{t as e}from"./logError-CTQ3euge.js";import{t}from"./escHtml-CfOHO0aD.js";import{fr as n,i as r,mr as i,pr as a,v as o,x as s,y as c}from"./index-DBNqlYTc.js";import{a as l,r as u}from"./klubbService-3zTTaX6v.js";import{o as d,r as f}from"./kasterService-DIBRsqwT.js";import{t as p}from"./SearchInput-CDoDGwhR.js";import{t as m}from"./AdminLinkBar-DT1NLIsA.js";import{t as h}from"./Table-B_UMcRWp.js";function g(e){let t=new Map;for(let n of e){if(!n.klubb?.id)continue;let e=s(n).toLowerCase(),r=t.get(n.klubb.id);r?r.push(e):t.set(n.klubb.id,[e])}return t}function _(e,t,n){let r=n.trim().toLowerCase();return r?e.filter(e=>e.navn.toLowerCase().includes(r)||(t.get(e.id)??[]).some(e=>e.includes(r))):e}function v(e,t){let n=t.trim().toLowerCase();return n?e.filter(e=>s(e).toLowerCase().includes(n)):e}var y={searchText:``};function b(e,n){return`
    <div class="content-page">
      <div class="club-detail-header">
        <img src="${t(e.logourl||`https://placehold.co/200x200/444/888?text=?`)}" alt="${t(e.navn)}" class="club-logo-large">
        <h1 class="club-detail-title">${t(e.navn)}</h1>
      </div>
      <h3 class="mb-2">Aktive utøvarar (${n})</h3>
      <div class="filter-row mb-3"><span id="club-detail-search-slot"></span></div>
      <div id="club-detail-list"></div>
    </div>`}function x(e,t){let r=v(e,t);if(!r.length)return n(`Ingen aktive utøvarar funnet.`);let i=document.createElement(`div`);return i.className=`table-responsive`,i.appendChild(h({rows:r,columns:[{label:`#`,render:(e,t)=>String(t+1)},{label:`Utøvar`,render:e=>{let t=document.createElement(`a`);return t.href=`#/kastere/${c(e)}`,t.className=`app-link`,t.textContent=s(e),t}},{label:`Klasse`,render:e=>e.klasse?.navn??`–`},{label:`Nr.`,render:e=>String(e.medlemsnummer??`–`)}]})),i}async function S(t,n){y.searchText=``,t.replaceChildren(i(`Laster klubb...`));try{let[e,{data:i}]=await Promise.all([u(n),d(n)]);if(e.error||!e.data){t.replaceChildren(a(`Kunne ikkje laste klubb.`));return}let o=e.data;r(o.navn),t.innerHTML=b(o,i.length);let s=t.querySelector(`#club-detail-list`);function c(){s.replaceChildren(x(i,y.searchText))}p({slot:t.querySelector(`#club-detail-search-slot`),placeholder:`Søk på utøvar`,state:y,onInput:c}),c(),m(t,{href:`#/klubber/${n}/admin`,label:`Rediger klubb`,variant:`warning`,canShow:e=>e.profil?.role===`admin`||e.profil?.role===`klubbadmin`&&e.clubs.includes(n)})}catch(n){e(`klubber.renderDetail`,n),t.replaceChildren(a(`Kunne ikkje laste klubb.`))}}var C={searchText:``};function w(e){return`
    <a href="#/klubber/${o(e)}" class="thrower-card">
      <img src="${t(e.logourl||`https://placehold.co/200x200/444/888?text=?`)}" alt="${t(e.navn)}" loading="lazy">
      <div class="thrower-name">${t(e.navn)}</div>
    </a>`}function T(){return`
    <div class="content-page">
      <div class="thrower-list-controls">
        <div class="filter-row"><span id="club-search-slot"></span></div>
      </div>
      <div id="club-grid" class="thrower-grid"></div>
    </div>`}async function E(t){t.replaceChildren(i(`Laster klubbar...`));try{let[{data:e,error:n},{data:r}]=await Promise.all([l(),f()]);if(n){t.replaceChildren(a(`Kunne ikkje laste klubbar.`));return}let i=g(r);t.innerHTML=T();let o=t.querySelector(`#club-grid`);function s(){let t=_(e,i,C.searchText);o.innerHTML=t.length?t.map(w).join(``):`<p class="empty-state">Ingen klubbar funnet.</p>`}p({slot:t.querySelector(`#club-search-slot`),placeholder:`Søk på klubbnavn eller utøvar`,state:C,onInput:s}),s(),m(t,{href:`#/klubber/ny`,label:`+ Ny klubb`,variant:`success`,canShow:e=>e.profil?.role===`admin`})}catch(n){e(`klubber.renderList`,n),t.replaceChildren(a(`Kunne ikkje laste klubbar.`))}}var D=async(e,t)=>{t.id?await S(e,Number(t.id)):await E(e)};export{D as render};