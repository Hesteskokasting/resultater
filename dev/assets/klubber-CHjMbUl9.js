import{t as e}from"./logError-BkXRFcqp.js";import{C as t,Sr as n,U as r,b as i,br as a,f as o,i as s,x as c,xr as l}from"./index-D6KMvqKH.js";import{a as u,n as d,r as f}from"./klubbService-B5pJ_Snb.js";import{o as p,r as m}from"./kasterService-D2Ihl5lb.js";import{t as h}from"./SearchInput-CDoDGwhR.js";import{t as g}from"./AdminLinkBar-DxB29VBo.js";import{t as _}from"./Table-B_UMcRWp.js";function v(e){let n=new Map;for(let r of e){if(!r.klubb?.id)continue;let e=t(r).toLowerCase(),i=n.get(r.klubb.id);i?i.push(e):n.set(r.klubb.id,[e])}return n}function y(e,t,n){let r=n.trim().toLowerCase();return r?e.filter(e=>e.navn.toLowerCase().includes(r)||(t.get(e.id)??[]).some(e=>e.includes(r))):e}function b(e,n){let r=n.trim().toLowerCase();return r?e.filter(e=>t(e).toLowerCase().includes(r)):e}var x={searchText:``};function S(e,t){return`
    <div class="content-page">
      <div class="club-detail-header">
        <img src="${o(e.logourl||`https://placehold.co/200x200/444/888?text=?`)}" alt="${o(e.navn)}" class="club-logo-large">
        <h1 class="club-detail-title">${o(e.navn)}</h1>
      </div>
      <h3 class="mb-2">Aktive utøvarar (${t})</h3>
      <div class="filter-row mb-3"><span id="club-detail-search-slot"></span></div>
      <div id="club-detail-list"></div>
    </div>`}function C(e,n){let r=b(e,n);if(!r.length)return a(`Ingen aktive utøvarar funnet.`);let i=document.createElement(`div`);return i.className=`table-responsive`,i.appendChild(_({rows:r,columns:[{label:`#`,render:(e,t)=>String(t+1)},{label:`Utøvar`,render:e=>{let n=document.createElement(`a`);return n.href=`#/kastere/${c(e)}`,n.className=`app-link`,n.textContent=t(e),n}},{label:`Klasse`,render:e=>e.klasse?.navn??`–`},{label:`Nr.`,render:e=>String(e.medlemsnummer??`–`)}]})),i}async function w(t,i){x.searchText=``,t.replaceChildren(n(`Laster klubb...`));try{let[e,{data:n}]=await Promise.all([f(i),p(i)]);if(e.error||!e.data){t.replaceChildren(l(`Kunne ikkje laste klubb.`));return}let a=e.data;s(a.navn),t.innerHTML=S(a,n.length);let o=t.querySelector(`#club-detail-list`);function c(){o.replaceChildren(C(n,x.searchText))}h({slot:t.querySelector(`#club-detail-search-slot`),placeholder:`Søk på utøvar`,state:x,onInput:c}),c(),g(t,{href:`#/klubber/${i}/admin`,label:`Rediger klubb`,variant:`warning`,canShow:e=>r(e,i)})}catch(n){e(`klubber.renderDetail`,n),t.replaceChildren(l(`Kunne ikkje laste klubb.`))}}var T={showAll:!1,searchText:``};function E(e){return`
    <a href="#/klubber/${i(e)}" class="thrower-card">
      <img src="${o(e.logourl||`https://placehold.co/200x200/444/888?text=?`)}" alt="${o(e.navn)}" loading="lazy">
      <div class="thrower-name">${o(e.navn)}</div>
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
    </div>`}function O(){return T.showAll?d():u()}async function k(t){t.replaceChildren(n(`Laster klubbar...`));try{let[{data:e,error:n},{data:r}]=await Promise.all([O(),m()]);if(n){t.replaceChildren(l(`Kunne ikkje laste klubbar.`));return}let i=v(r);t.innerHTML=D();let a=e,o=t.querySelector(`#club-grid`),s=t.querySelector(`#club-active-only`);function c(){let e=y(a,i,T.searchText);o.innerHTML=e.length?e.map(e=>E(e)).join(``):`<p class="empty-state">Ingen klubbar funnet.</p>`}h({slot:t.querySelector(`#club-search-slot`),placeholder:`Søk på klubbnavn eller utøvar`,state:T,onInput:c}),c(),s.addEventListener(`change`,async()=>{T.showAll=!s.checked;let{data:e,error:t}=await O();t||(a=e),c()}),g(t,{href:`#/klubber/ny`,label:`+ Ny klubb`,variant:`success`,canShow:e=>e.profil?.role===`admin`})}catch(n){e(`klubber.renderList`,n),t.replaceChildren(l(`Kunne ikkje laste klubbar.`))}}var A=async(e,t)=>{t.id?await w(e,Number(t.id)):await k(e)};export{A as render};