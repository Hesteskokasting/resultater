import{G as e,W as t,ct as n,dt as r,nt as i,ut as a}from"./index-BogKy9jL.js";import{r as o,t as s}from"./klubbService-D7G0Rm2V.js";import{o as c,u as l}from"./kasterService-g2LXrNMc.js";import{t as u}from"./LoadingState-RVZNML7E.js";import{t as d}from"./EmptyState-a5aDhc-8.js";import{t as f}from"./AdminLinkBar-JtlvwZjH.js";import{t as p}from"./Table-D0IvfmoN.js";var m=`https://placehold.co/200x200/444/888?text=?`,h={sokeTekst:``},g={sokeTekst:``};function _(e){return`
    <a href="#/klubber/${r(e)}" class="kaster-kort">
      <img src="${t(e.logourl||m)}" alt="${t(e.navn)}" loading="lazy">
      <div class="kaster-navn">${t(e.navn)}</div>
    </a>`}function v(){return`
    <div class="nc-side">
      <div class="kaster-liste-kontroller">
        <div class="nc-filter-rad">
          <input id="klubb-sok" type="text" class="tl-select" placeholder="Søk på klubbnavn eller utøvar" value="">
          <button id="klubb-sok-knapp" class="btn btn-secondary btn-sm">Søk</button>
        </div>
      </div>
      <div id="klubb-grid" class="kaster-grid"></div>
    </div>`}function y(e,n){return`
    <div class="nc-side">
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
    </div>`}function b(e,t){let r=t.trim().toLowerCase(),i=r?e.filter(e=>n(e).toLowerCase().includes(r)):e;if(!i.length)return d(`Ingen aktive utøvarar funnet.`);let o=document.createElement(`div`);return o.className=`table-responsive`,o.appendChild(p({rows:i,columns:[{label:`#`,render:(e,t)=>String(t+1)},{label:`Utøvar`,render:e=>{let t=document.createElement(`a`);return t.href=`#/kastere/${a(e)}`,t.className=`tl-lenkje`,t.textContent=n(e),t}},{label:`Klasse`,render:e=>e.klasse?.navn??`–`},{label:`Nr.`,render:e=>String(e.medlemsnummer??`–`)}]})),o}async function x(t){t.replaceChildren(u(`Laster klubbar...`));try{let[{data:r,error:i},{data:a}]=await Promise.all([o(),c()]);if(i){t.replaceChildren(e(`Kunne ikkje laste klubbar.`));return}let s=new Map;for(let e of a)e.klubb?.id&&(s.has(e.klubb.id)||s.set(e.klubb.id,[]),s.get(e.klubb.id).push(n(e).toLowerCase()));t.innerHTML=v();let l=t.querySelector(`#klubb-grid`),u=t.querySelector(`#klubb-sok`);function d(){let e=h.sokeTekst.trim().toLowerCase(),t=e?r.filter(t=>t.navn.toLowerCase().includes(e)||(s.get(t.id)??[]).some(t=>t.includes(e))):r;l.innerHTML=t.length?t.map(_).join(``):`<p class="empty-state">Ingen klubbar funnet.</p>`}d(),u.addEventListener(`keydown`,e=>{e.key===`Enter`&&(h.sokeTekst=u.value,d())}),t.querySelector(`#klubb-sok-knapp`).addEventListener(`click`,()=>{h.sokeTekst=u.value,d()}),f(t,{href:`#/klubber/ny`,label:`+ Ny klubb`,variant:`success`,canShow:e=>e.profil?.rolle===`admin`})}catch(n){i(`renderListe`,n),t.replaceChildren(e(`Kunne ikkje laste klubbar.`))}}async function S(t,n){g.sokeTekst=``,t.replaceChildren(u(`Laster klubb...`));try{let[r,{data:i}]=await Promise.all([s(n),l(n)]);if(r.error||!r.data){t.replaceChildren(e(`Kunne ikkje laste klubb.`));return}let a=r.data;t.innerHTML=y(a,i.length);let o=t.querySelector(`#klubb-detalj-liste`),c=t.querySelector(`#klubb-detalj-sok`);function u(){o.replaceChildren(b(i,g.sokeTekst))}u(),c.addEventListener(`keydown`,e=>{e.key===`Enter`&&(g.sokeTekst=c.value,u())}),t.querySelector(`#klubb-detalj-sok-knapp`).addEventListener(`click`,()=>{g.sokeTekst=c.value,u()}),f(t,{href:`#/klubber/${n}/admin`,label:`Rediger klubb`,variant:`warning`,canShow:e=>e.profil?.rolle===`admin`||e.profil?.rolle===`klubbadmin`&&e.klubber.includes(n)})}catch(n){i(`renderDetalj`,n),t.replaceChildren(e(`Kunne ikkje laste klubb.`))}}var C=async(e,t)=>{t.id?await S(e,Number(t.id)):await x(e)};export{C as render};