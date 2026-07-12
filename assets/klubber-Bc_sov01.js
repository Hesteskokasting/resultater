import{t as e}from"./logError-D5z16FyH.js";import{It as t,Lt as n,Rt as r,St as i,r as a,xt as o}from"./index-C8EkUnbh.js";import{r as s,t as c}from"./klubbService-CaXvOdL5.js";import{o as l,r as u}from"./kasterService-B3gLOC11.js";import{t as d}from"./LoadingState-BWi0wPLz.js";import{t as f}from"./EmptyState-B1E_7OzB.js";import{t as p}from"./AdminLinkBar-DIQRkQgH.js";import{t as m}from"./Table-D4Wwa0v2.js";var h=`https://placehold.co/200x200/444/888?text=?`,g={searchText:``},_={searchText:``};function v(e){return`
    <a href="#/klubber/${t(e)}" class="thrower-card">
      <img src="${o(e.logourl||h)}" alt="${o(e.navn)}" loading="lazy">
      <div class="thrower-name">${o(e.navn)}</div>
    </a>`}function y(){return`
    <div class="content-page">
      <div class="thrower-list-controls">
        <div class="nc-filter-rad">
          <input id="club-search" type="text" class="tl-select" placeholder="Søk på klubbnavn eller utøvar" value="">
          <button id="club-search-button" class="btn btn-secondary btn-sm">Søk</button>
        </div>
      </div>
      <div id="club-grid" class="thrower-grid"></div>
    </div>`}function b(e,t){return`
    <div class="content-page">
      <div class="mb-3">
        <a href="#/klubber" class="btn btn-sm btn-outline-secondary">← Tilbake</a>
      </div>
      <div class="club-detail-header">
        <img src="${o(e.logourl||h)}" alt="${o(e.navn)}" class="club-logo-large">
        <h1 class="club-detail-title">${o(e.navn)}</h1>
      </div>
      <h3 class="mb-2">Aktive utøvarar (${t})</h3>
      <div class="nc-filter-rad mb-3">
        <input id="club-detail-search" type="text" class="tl-select" placeholder="Søk på utøvar" value="">
        <button id="club-detail-search-button" class="btn btn-secondary btn-sm">Søk</button>
      </div>
      <div id="club-detail-list"></div>
    </div>`}function x(e,t){let i=t.trim().toLowerCase(),a=i?e.filter(e=>r(e).toLowerCase().includes(i)):e;if(!a.length)return f(`Ingen aktive utøvarar funnet.`);let o=document.createElement(`div`);return o.className=`table-responsive`,o.appendChild(m({rows:a,columns:[{label:`#`,render:(e,t)=>String(t+1)},{label:`Utøvar`,render:e=>{let t=document.createElement(`a`);return t.href=`#/kastere/${n(e)}`,t.className=`tl-link`,t.textContent=r(e),t}},{label:`Klasse`,render:e=>e.klasse?.navn??`–`},{label:`Nr.`,render:e=>String(e.medlemsnummer??`–`)}]})),o}async function S(t){t.replaceChildren(d(`Laster klubbar...`));try{let[{data:e,error:n},{data:a}]=await Promise.all([s(),u()]);if(n){t.replaceChildren(i(`Kunne ikkje laste klubbar.`));return}let o=new Map;for(let e of a)e.klubb?.id&&(o.has(e.klubb.id)||o.set(e.klubb.id,[]),o.get(e.klubb.id).push(r(e).toLowerCase()));t.innerHTML=y();let c=t.querySelector(`#club-grid`),l=t.querySelector(`#club-search`);function d(){let t=g.searchText.trim().toLowerCase(),n=t?e.filter(e=>e.navn.toLowerCase().includes(t)||(o.get(e.id)??[]).some(e=>e.includes(t))):e;c.innerHTML=n.length?n.map(v).join(``):`<p class="empty-state">Ingen klubbar funnet.</p>`}d(),l.addEventListener(`keydown`,e=>{e.key===`Enter`&&(g.searchText=l.value,d())}),t.querySelector(`#club-search-button`).addEventListener(`click`,()=>{g.searchText=l.value,d()}),p(t,{href:`#/klubber/ny`,label:`+ Ny klubb`,variant:`success`,canShow:e=>e.profil?.role===`admin`})}catch(n){e(`renderList`,n),t.replaceChildren(i(`Kunne ikkje laste klubbar.`))}}async function C(t,n){_.searchText=``,t.replaceChildren(d(`Laster klubb...`));try{let[e,{data:r}]=await Promise.all([c(n),l(n)]);if(e.error||!e.data){t.replaceChildren(i(`Kunne ikkje laste klubb.`));return}let o=e.data;a(o.navn),t.innerHTML=b(o,r.length);let s=t.querySelector(`#club-detail-list`),u=t.querySelector(`#club-detail-search`);function d(){s.replaceChildren(x(r,_.searchText))}d(),u.addEventListener(`keydown`,e=>{e.key===`Enter`&&(_.searchText=u.value,d())}),t.querySelector(`#club-detail-search-button`).addEventListener(`click`,()=>{_.searchText=u.value,d()}),p(t,{href:`#/klubber/${n}/admin`,label:`Rediger klubb`,variant:`warning`,canShow:e=>e.profil?.role===`admin`||e.profil?.role===`klubbadmin`&&e.clubs.includes(n)})}catch(n){e(`renderDetail`,n),t.replaceChildren(i(`Kunne ikkje laste klubb.`))}}var w=async(e,t)=>{t.id?await C(e,Number(t.id)):await S(e)};export{w as render};