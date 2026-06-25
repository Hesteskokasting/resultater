import{t as e}from"./logError-DhxY2JQv.js";import{J as t,Y as n,ft as r,pt as i,ut as a}from"./index-D1GzXyr3.js";import{r as o,t as s}from"./klubbService-avZCVzgk.js";import{o as c,u as l}from"./kasterService-D1rq1bik.js";import{t as u}from"./LoadingState-xRmJ3K_t.js";import{t as d}from"./EmptyState-BvE_0HiD.js";import{t as f}from"./AdminLinkBar-Bn6_UCBr.js";import{t as p}from"./Table-DSqyRM9K.js";var m=`https://placehold.co/200x200/444/888?text=?`,h={sokeTekst:``},g={sokeTekst:``};function _(e){return`
    <a href="#/klubber/${i(e)}" class="kaster-kort">
      <img src="${t(e.logourl||m)}" alt="${t(e.navn)}" loading="lazy">
      <div class="kaster-navn">${t(e.navn)}</div>
    </a>`}function v(){return`
    <div class="content-page">
      <div class="kaster-liste-kontroller">
        <div class="nc-filter-rad">
          <input id="klubb-sok" type="text" class="tl-select" placeholder="Søk på klubbnavn eller utøvar" value="">
          <button id="klubb-sok-knapp" class="btn btn-secondary btn-sm">Søk</button>
        </div>
      </div>
      <div id="klubb-grid" class="kaster-grid"></div>
    </div>`}function y(e,n){return`
    <div class="content-page">
      <div class="mb-3">
        <a href="#/klubber" class="btn btn-sm btn-outline-secondary">← Tilbake</a>
      </div>
      <div class="klubb-detalj-header">
        <img src="${t(e.logourl||m)}" alt="${t(e.navn)}" class="klubb-logo-stor">
        <h1 class="klubb-detalj-tittel">${t(e.navn)}</h1>
      </div>
      <h3 class="mb-2">Aktive utøvarar (${n})</h3>
      <div class="nc-filter-rad mb-3">
        <input id="klubb-detalj-sok" type="text" class="tl-select" placeholder="Søk på utøvar" value="">
        <button id="klubb-detalj-sok-knapp" class="btn btn-secondary btn-sm">Søk</button>
      </div>
      <div id="klubb-detalj-liste"></div>
    </div>`}function b(e,t){let n=t.trim().toLowerCase(),i=n?e.filter(e=>a(e).toLowerCase().includes(n)):e;if(!i.length)return d(`Ingen aktive utøvarar funnet.`);let o=document.createElement(`div`);return o.className=`table-responsive`,o.appendChild(p({rows:i,columns:[{label:`#`,render:(e,t)=>String(t+1)},{label:`Utøvar`,render:e=>{let t=document.createElement(`a`);return t.href=`#/kastere/${r(e)}`,t.className=`tl-lenkje`,t.textContent=a(e),t}},{label:`Klasse`,render:e=>e.klasse?.navn??`–`},{label:`Nr.`,render:e=>String(e.medlemsnummer??`–`)}]})),o}async function x(t){t.replaceChildren(u(`Laster klubbar...`));try{let[{data:e,error:r},{data:i}]=await Promise.all([o(),c()]);if(r){t.replaceChildren(n(`Kunne ikkje laste klubbar.`));return}let s=new Map;for(let e of i)e.klubb?.id&&(s.has(e.klubb.id)||s.set(e.klubb.id,[]),s.get(e.klubb.id).push(a(e).toLowerCase()));t.innerHTML=v();let l=t.querySelector(`#klubb-grid`),u=t.querySelector(`#klubb-sok`);function d(){let t=h.sokeTekst.trim().toLowerCase(),n=t?e.filter(e=>e.navn.toLowerCase().includes(t)||(s.get(e.id)??[]).some(e=>e.includes(t))):e;l.innerHTML=n.length?n.map(_).join(``):`<p class="empty-state">Ingen klubbar funnet.</p>`}d(),u.addEventListener(`keydown`,e=>{e.key===`Enter`&&(h.sokeTekst=u.value,d())}),t.querySelector(`#klubb-sok-knapp`).addEventListener(`click`,()=>{h.sokeTekst=u.value,d()}),f(t,{href:`#/klubber/ny`,label:`+ Ny klubb`,variant:`success`,canShow:e=>e.profil?.rolle===`admin`})}catch(r){e(`renderListe`,r),t.replaceChildren(n(`Kunne ikkje laste klubbar.`))}}async function S(t,r){g.sokeTekst=``,t.replaceChildren(u(`Laster klubb...`));try{let[e,{data:i}]=await Promise.all([s(r),l(r)]);if(e.error||!e.data){t.replaceChildren(n(`Kunne ikkje laste klubb.`));return}let a=e.data;t.innerHTML=y(a,i.length);let o=t.querySelector(`#klubb-detalj-liste`),c=t.querySelector(`#klubb-detalj-sok`);function u(){o.replaceChildren(b(i,g.sokeTekst))}u(),c.addEventListener(`keydown`,e=>{e.key===`Enter`&&(g.sokeTekst=c.value,u())}),t.querySelector(`#klubb-detalj-sok-knapp`).addEventListener(`click`,()=>{g.sokeTekst=c.value,u()}),f(t,{href:`#/klubber/${r}/admin`,label:`Rediger klubb`,variant:`warning`,canShow:e=>e.profil?.rolle===`admin`||e.profil?.rolle===`klubbadmin`&&e.klubber.includes(r)})}catch(r){e(`renderDetalj`,r),t.replaceChildren(n(`Kunne ikkje laste klubb.`))}}var C=async(e,t)=>{t.id?await S(e,Number(t.id)):await x(e)};export{C as render};