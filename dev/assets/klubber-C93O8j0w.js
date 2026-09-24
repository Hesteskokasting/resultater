import{t as e}from"./logError-ByTg738k.js";import{H as t,S as n,_r as r,b as i,f as a,gr as o,i as s,vr as c,y as l}from"./index-ScyQGOLm.js";import{a as u,n as d,r as f}from"./klubbService-pPakrKDt.js";import{o as p,r as m}from"./kasterService-y8FvzW53.js";import{t as h}from"./SearchInput-CDoDGwhR.js";import{t as g}from"./AdminLinkBar-DZ-MO_7O.js";import{t as _}from"./Table-B_UMcRWp.js";function v(e){let t=new Map;for(let r of e){if(!r.klubb?.id)continue;let e=n(r).toLowerCase(),i=t.get(r.klubb.id);i?i.push(e):t.set(r.klubb.id,[e])}return t}function y(e,t,n){let r=n.trim().toLowerCase();return r?e.filter(e=>e.navn.toLowerCase().includes(r)||(t.get(e.id)??[]).some(e=>e.includes(r))):e}function b(e,t){let r=t.trim().toLowerCase();return r?e.filter(e=>n(e).toLowerCase().includes(r)):e}var x={searchText:``};function S(e,t){return`
    <div class="content-page">
      <div class="club-detail-header">
        <img src="${a(e.logourl||`https://placehold.co/200x200/444/888?text=?`)}" alt="${a(e.navn)}" class="club-logo-large">
        <h1 class="club-detail-title">${a(e.navn)}</h1>
      </div>
      <h3 class="mb-2">Aktive utøvarar (${t})</h3>
      <div class="filter-row mb-3"><span id="club-detail-search-slot"></span></div>
      <div id="club-detail-list"></div>
    </div>`}function C(e,t){let r=b(e,t);if(!r.length)return o(`Ingen aktive utøvarar funnet.`);let a=document.createElement(`div`);return a.className=`table-responsive`,a.appendChild(_({rows:r,columns:[{label:`#`,render:(e,t)=>String(t+1)},{label:`Utøvar`,render:e=>{let t=document.createElement(`a`);return t.href=`#/kastere/${i(e)}`,t.className=`app-link`,t.textContent=n(e),t}},{label:`Klasse`,render:e=>e.klasse?.navn??`–`},{label:`Nr.`,render:e=>String(e.medlemsnummer??`–`)}]})),a}async function w(n,i){x.searchText=``,n.replaceChildren(c(`Laster klubb...`));try{let[e,{data:a}]=await Promise.all([f(i),p(i)]);if(e.error||!e.data){n.replaceChildren(r(`Kunne ikkje laste klubb.`));return}let o=e.data;s(o.navn),n.innerHTML=S(o,a.length);let c=n.querySelector(`#club-detail-list`);function l(){c.replaceChildren(C(a,x.searchText))}h({slot:n.querySelector(`#club-detail-search-slot`),placeholder:`Søk på utøvar`,state:x,onInput:l}),l(),g(n,{href:`#/klubber/${i}/admin`,label:`Rediger klubb`,variant:`warning`,canShow:e=>t(e,i)})}catch(t){e(`klubber.renderDetail`,t),n.replaceChildren(r(`Kunne ikkje laste klubb.`))}}var T={showAll:!1,searchText:``};function E(e){return`
    <a href="#/klubber/${l(e)}" class="thrower-card">
      <img src="${a(e.logourl||`https://placehold.co/200x200/444/888?text=?`)}" alt="${a(e.navn)}" loading="lazy">
      <div class="thrower-name">${a(e.navn)}</div>
    </a>`}function D(){return`
    <div class="content-page">
      <div class="thrower-list-controls">
        <div class="filter-row"><span id="club-search-slot"></span></div>
        <div class="mt-2">
          <label class="thrower-checkbox-label">
            <input type="checkbox" id="club-active-only"${T.showAll?``:` checked`}>
            Vis berre aktive klubbar
          </label>
        </div>
      </div>
      <div id="club-grid" class="thrower-grid"></div>
    </div>`}function O(){return T.showAll?d():u()}async function k(t){t.replaceChildren(c(`Laster klubbar...`));try{let[{data:e,error:n},{data:i}]=await Promise.all([O(),m()]);if(n){t.replaceChildren(r(`Kunne ikkje laste klubbar.`));return}let a=v(i);t.innerHTML=D();let o=e,s=t.querySelector(`#club-grid`),c=t.querySelector(`#club-active-only`);function l(){let e=y(o,a,T.searchText);s.innerHTML=e.length?e.map(e=>E(e)).join(``):`<p class="empty-state">Ingen klubbar funnet.</p>`}h({slot:t.querySelector(`#club-search-slot`),placeholder:`Søk på klubbnavn eller utøvar`,state:T,onInput:l}),l(),c.addEventListener(`change`,async()=>{T.showAll=!c.checked;let{data:e,error:t}=await O();t||(o=e),l()}),g(t,{href:`#/klubber/ny`,label:`+ Ny klubb`,variant:`success`,canShow:e=>e.profil?.role===`admin`})}catch(n){e(`klubber.renderList`,n),t.replaceChildren(r(`Kunne ikkje laste klubbar.`))}}var A=async(e,t)=>{t.id?await w(e,Number(t.id)):await k(e)};export{A as render};