import{G as e,W as t,i as n,lt as r,nt as i,st as a,ut as o}from"./index-CzhAeihs.js";import{r as s,t as c}from"./klubbService-1CKkptaQ.js";import{o as l,u}from"./kasterService-BXW4g7DC.js";import{t as d}from"./LoadingState-RVZNML7E.js";import{t as f}from"./EmptyState-a5aDhc-8.js";import{t as p}from"./Table-BBE7tcG_.js";var m=`https://placehold.co/200x200/444/888?text=?`,h={sokeTekst:``},g={sokeTekst:``};function _(e){return`
    <a href="#/klubber/${o(e)}" class="kaster-kort">
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
    </div>`}function b(e,t){let n=t.trim().toLowerCase(),i=n?e.filter(e=>a(e).toLowerCase().includes(n)):e;if(!i.length)return f(`Ingen aktive utøvarar funnet.`);let o=document.createElement(`div`);return o.className=`table-responsive`,o.appendChild(p({rows:i,columns:[{label:`#`,render:(e,t)=>String(t+1)},{label:`Utøvar`,render:e=>{let t=document.createElement(`a`);return t.href=`#/kastere/${r(e)}`,t.className=`tl-lenkje`,t.textContent=a(e),t}},{label:`Klasse`,render:e=>e.klasse?.navn??`–`},{label:`Nr.`,render:e=>String(e.medlemsnummer??`–`)}]})),o}async function x(t){t.replaceChildren(d(`Laster klubbar...`));try{let[{data:r,error:i},{data:o}]=await Promise.all([s(),l()]);if(i){t.replaceChildren(e(`Kunne ikkje laste klubbar.`));return}let c=new Map;for(let e of o)e.klubb?.id&&(c.has(e.klubb.id)||c.set(e.klubb.id,[]),c.get(e.klubb.id).push(a(e).toLowerCase()));t.innerHTML=v();let u=t.querySelector(`#klubb-grid`),d=t.querySelector(`#klubb-sok`);function f(){let e=h.sokeTekst.trim().toLowerCase(),t=e?r.filter(t=>t.navn.toLowerCase().includes(e)||(c.get(t.id)??[]).some(t=>t.includes(e))):r;u.innerHTML=t.length?t.map(_).join(``):`<p class="empty-state">Ingen klubbar funnet.</p>`}f(),d.addEventListener(`keydown`,e=>{e.key===`Enter`&&(h.sokeTekst=d.value,f())}),t.querySelector(`#klubb-sok-knapp`).addEventListener(`click`,()=>{h.sokeTekst=d.value,f()}),n().then(e=>{if(e?.profil?.rolle!==`admin`)return;let n=document.createElement(`div`);n.className=`mb-2 px-2`,n.innerHTML=`<a href="#/klubber/ny" class="btn btn-sm btn-success">+ Ny klubb</a>`,t.querySelector(`.nc-side`)?.prepend(n)})}catch(n){i(`renderListe`,n),t.replaceChildren(e(`Kunne ikkje laste klubbar.`))}}async function S(t,r){g.sokeTekst=``,t.replaceChildren(d(`Laster klubb...`));try{let[i,{data:a}]=await Promise.all([c(r),u(r)]);if(i.error||!i.data){t.replaceChildren(e(`Kunne ikkje laste klubb.`));return}let o=i.data;t.innerHTML=y(o,a.length);let s=t.querySelector(`#klubb-detalj-liste`),l=t.querySelector(`#klubb-detalj-sok`);function d(){s.replaceChildren(b(a,g.sokeTekst))}d(),l.addEventListener(`keydown`,e=>{e.key===`Enter`&&(g.sokeTekst=l.value,d())}),t.querySelector(`#klubb-detalj-sok-knapp`).addEventListener(`click`,()=>{g.sokeTekst=l.value,d()}),n().then(e=>{if(!e?.profil||!(e.profil.rolle===`admin`||e.profil.rolle===`klubbadmin`&&e.klubber.includes(r)))return;let n=document.createElement(`div`);n.className=`mb-2 px-2`,n.innerHTML=`<a href="#/klubber/${r}/admin" class="btn btn-sm btn-warning">Rediger klubb</a>`,t.querySelector(`.nc-side`)?.prepend(n)})}catch(n){i(`renderDetalj`,n),t.replaceChildren(e(`Kunne ikkje laste klubb.`))}}var C=async(e,t)=>{t.id?await S(e,Number(t.id)):await x(e)};export{C as render};