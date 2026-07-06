import{t as e}from"./logError-Cjb5zwtM.js";import{Q as t,Z as n,ft as r,mt as i,n as a,pt as o}from"./index-CBSadyAf.js";import{r as s,t as c}from"./klubbService-CwEcGocL.js";import{o as l,r as u}from"./kasterService-B_2UvLGF.js";import{t as d}from"./LoadingState-BCLCa55U.js";import{t as f}from"./EmptyState-CCOt8lnf.js";import{t as p}from"./AdminLinkBar-DF04C5NF.js";import{t as m}from"./Table-BggEyKS_.js";var h=`https://placehold.co/200x200/444/888?text=?`,g={searchText:``},_={searchText:``};function v(e){return`
    <a href="#/klubber/${r(e)}" class="thrower-card">
      <img src="${n(e.logourl||h)}" alt="${n(e.navn)}" loading="lazy">
      <div class="thrower-name">${n(e.navn)}</div>
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
        <img src="${n(e.logourl||h)}" alt="${n(e.navn)}" class="club-logo-large">
        <h1 class="club-detail-title">${n(e.navn)}</h1>
      </div>
      <h3 class="mb-2">Aktive utøvarar (${t})</h3>
      <div class="nc-filter-rad mb-3">
        <input id="club-detail-search" type="text" class="tl-select" placeholder="Søk på utøvar" value="">
        <button id="club-detail-search-button" class="btn btn-secondary btn-sm">Søk</button>
      </div>
      <div id="club-detail-list"></div>
    </div>`}function x(e,t){let n=t.trim().toLowerCase(),r=n?e.filter(e=>i(e).toLowerCase().includes(n)):e;if(!r.length)return f(`Ingen aktive utøvarar funnet.`);let a=document.createElement(`div`);return a.className=`table-responsive`,a.appendChild(m({rows:r,columns:[{label:`#`,render:(e,t)=>String(t+1)},{label:`Utøvar`,render:e=>{let t=document.createElement(`a`);return t.href=`#/kastere/${o(e)}`,t.className=`tl-link`,t.textContent=i(e),t}},{label:`Klasse`,render:e=>e.klasse?.navn??`–`},{label:`Nr.`,render:e=>String(e.medlemsnummer??`–`)}]})),a}async function S(n){n.replaceChildren(d(`Laster klubbar...`));try{let[{data:e,error:r},{data:a}]=await Promise.all([s(),u()]);if(r){n.replaceChildren(t(`Kunne ikkje laste klubbar.`));return}let o=new Map;for(let e of a)e.klubb?.id&&(o.has(e.klubb.id)||o.set(e.klubb.id,[]),o.get(e.klubb.id).push(i(e).toLowerCase()));n.innerHTML=y();let c=n.querySelector(`#club-grid`),l=n.querySelector(`#club-search`);function d(){let t=g.searchText.trim().toLowerCase(),n=t?e.filter(e=>e.navn.toLowerCase().includes(t)||(o.get(e.id)??[]).some(e=>e.includes(t))):e;c.innerHTML=n.length?n.map(v).join(``):`<p class="empty-state">Ingen klubbar funnet.</p>`}d(),l.addEventListener(`keydown`,e=>{e.key===`Enter`&&(g.searchText=l.value,d())}),n.querySelector(`#club-search-button`).addEventListener(`click`,()=>{g.searchText=l.value,d()}),p(n,{href:`#/klubber/ny`,label:`+ Ny klubb`,variant:`success`,canShow:e=>e.profil?.role===`admin`})}catch(r){e(`renderList`,r),n.replaceChildren(t(`Kunne ikkje laste klubbar.`))}}async function C(n,r){_.searchText=``,n.replaceChildren(d(`Laster klubb...`));try{let[e,{data:i}]=await Promise.all([c(r),l(r)]);if(e.error||!e.data){n.replaceChildren(t(`Kunne ikkje laste klubb.`));return}let o=e.data;a(o.navn),n.innerHTML=b(o,i.length);let s=n.querySelector(`#club-detail-list`),u=n.querySelector(`#club-detail-search`);function d(){s.replaceChildren(x(i,_.searchText))}d(),u.addEventListener(`keydown`,e=>{e.key===`Enter`&&(_.searchText=u.value,d())}),n.querySelector(`#club-detail-search-button`).addEventListener(`click`,()=>{_.searchText=u.value,d()}),p(n,{href:`#/klubber/${r}/admin`,label:`Rediger klubb`,variant:`warning`,canShow:e=>e.profil?.role===`admin`||e.profil?.role===`klubbadmin`&&e.clubs.includes(r)})}catch(r){e(`renderDetail`,r),n.replaceChildren(t(`Kunne ikkje laste klubb.`))}}var w=async(e,t)=>{t.id?await C(e,Number(t.id)):await S(e)};export{w as render};