import{t as e}from"./logError-D5z16FyH.js";import{$ as t,Et as n,Mt as r,O as i,Ot as a,Tt as o,Wt as s,a as c,ct as l,i as u,t as d,ut as f,wt as p}from"./index-DVHt6_kn.js";import{t as m}from"./LoadingState-BWi0wPLz.js";import{t as h}from"./EmptyState-B1E_7OzB.js";import{t as g}from"./buildDropdownOptions-0Tsskn_s.js";import{t as _}from"./SearchInput-BLUeXGg6.js";var v={column:`dato`,direction:`asc`};function y(e,t){switch(t){case`navn`:return e.navn??``;case`dato`:return e.dato??``;case`sted`:return e.sted??``;case`metode`:return[e.innledende?.navn,e.avsluttende?.navn].filter(e=>!!e).join(` `);case`organizer`:return e.klubb?.navn??``;case`type`:return e.stevnetype?.navn??``;case`klassifisering`:return e.kategori?.navn??``;default:return``}}function b(e){return[...e].sort((e,t)=>{let n=y(e,v.column),r=y(t,v.column),i=n.localeCompare(r,`nb`);return v.direction===`asc`?i:-i})}var x={year:new Date().getFullYear(),searchText:``,tournamentTypeId:``,throwingMethodId:``,clubId:``,categoryId:``},S=[],C=null,w=new Map;function T(e){return e.filter(e=>{if(x.searchText){let t=x.searchText.toLowerCase();if(![e.navn,e.sted,e.klubb?.navn,e.stevnetype?.navn,e.kategori?.navn,e.innledende?.navn,e.avsluttende?.navn].some(e=>e?.toLowerCase().includes(t)))return!1}if(x.tournamentTypeId&&String(e.stevnetype?.id)!==x.tournamentTypeId)return!1;if(x.throwingMethodId){let t=x.throwingMethodId;if(!(String(e.innledende?.id)===t||String(e.avsluttende?.id)===t))return!1}return!(x.clubId&&String(e.klubb?.id)!==x.clubId||x.categoryId&&String(e.kategori?.id)!==x.categoryId)})}async function E(e){await n(e.map(e=>({Dato:e.dato?new Date(e.dato).toLocaleDateString(`nb-NO`):``,Navn:e.navn??``,Sted:e.sted??``,Arrangør:e.klubb?.navn??``,Stevnetype:e.stevnetype?.navn??``,"Kastemetode (innledende)":e.innledende?.navn??``,"Kastemetode (avsluttende)":e.avsluttende?.navn??``,Kategori:e.kategori?.navn??``,NM:e.ernm?`Ja`:`Nei`})),`terminliste-${x.year}.xlsx`,`Terminliste`)}var D=[{id:`navn`,label:`Stevne`},{id:`dato`,label:`Dato`},{id:`sted`,label:`Sted`},{id:`metode`,label:`Metode`},{id:`organizer`,label:`Arrangør`},{id:`type`,label:`Type`},{id:`klassifisering`,label:`Klassifisering`}];function O(e){return v.column===e?v.direction===`asc`?`<span class="tl-sort-icon active">↑</span>`:`<span class="tl-sort-icon active">↓</span>`:`<span class="tl-sort-icon">↕</span>`}function k(e){let t=e.dato?new Date(e.dato+`T12:00:00`).toLocaleDateString(`nb-NO`):``,n=[e.innledende?.navn,e.avsluttende?.navn].filter(e=>!!e).join(` \\ `),r=e.ernm?`<span class="tl-nm-merke">NM</span> `:``;return`<tr class="tl-tr">
    <td><a class="tl-link" href="#/stevne/${e.id}/resultat">${r}${p(e.navn??``)}</a></td>
    <td>${t}</td>
    <td>${p(e.sted??``)}</td>
    <td>${p(n)}</td>
    <td>${p(e.klubb?.navn??``)}</td>
    <td>${p(e.stevnetype?.navn??``)}</td>
    <td>${p(e.kategori?.navn??``)}</td>
  </tr>`}function A(e){return e.length===0?`<p class="empty-state">Ingen stevner funnet med valgte filtre.</p>`:`<table class="tl-table">${`<thead><tr>
    ${D.map(e=>`<th class="tl-th" data-column="${e.id}">${e.label}${O(e.id)}</th>`).join(``)}
  </tr></thead>`}${`<tbody>${b(e).map(k).join(``)}</tbody>`}</table>`}function j(e){return window.innerWidth>600?A(e):N(e)}function M(e){let t=(e.stevne_fase===`innledende`||e.stevne_fase===`avsluttende`)&&!e.erfullfort,n=e.dato?new Date(e.dato+`T12:00:00`)>new Date:!1,r=e.stevne_fase===null||e.stevne_fase===`ikke_startet`,i=C?.profil?.kobling_status===`godkjent`&&n&&r&&!e.erfullfort,o=[];return e.sted&&o.push(`Sted: ${e.sted}`),e.klubb?.navn&&o.push(`Arrangør: ${e.klubb.navn}`),e.stevnetype?.navn&&o.push(`Type: ${e.stevnetype.navn}`),u({title:e.navn??``,href:`#/stevne/${e.id}/resultat`,date:a(e.dato),status:t?`live`:n?`upcoming`:`done`,meta:o,badge:e.ernm?`NM`:void 0,registrationSlotId:i?e.id:void 0})}function N(e){if(e.length===0)return h(`Ingen stevner funnet med valgte filtre.`);let t=document.createElement(`div`);return t.className=`stevne-kort-liste`,e.forEach(e=>t.appendChild(M(e))),t}async function P(n){d(()=>P(n)),n.replaceChildren(m(`Laster terminliste…`));try{let[{data:a,error:u},{data:d},p]=await Promise.all([f(x.year),t(),i()]);if(C=p,w=p?.profil?.kasterid==null?new Map:await l(p.profil.kasterid),u){e(`terminliste.render`,u),n.replaceChildren(o(`Kunne ikkje laste terminliste.`));return}S=a??[];let h=s.isNativePlatform(),y=h?``:`<button class="tl-excel-button" id="tl-excel-desktop">⬇ Excel</button>`,b=h?``:`<button class="tl-excel-button" id="tl-excel-mobile">⬇ Excel</button>`;function D(e){return{year:`<select class="tl-select" id="tl-year${e}">${r(x.year,1983,new Date().getFullYear()+1)}</select>`,tournamentType:`<select class="tl-select" id="tl-tournamenttype${e}">${g(d.stevnetyper,x.tournamentTypeId,`Alle typer`)}</select>`,throwingMethod:`<select class="tl-select" id="tl-throwingmethod${e}">${g(d.kastemetoder,x.throwingMethodId,`Alle metoder`)}</select>`,organizer:`<select class="tl-select" id="tl-organizer${e}">${g(d.klubber,x.clubId,`Alle arrangører`)}</select>`,category:`<select class="tl-select" id="tl-category${e}">${g(d.kategorier,x.categoryId,`Alle kategorier`)}</select>`}}let O=D(``),k=D(`-mobil`);n.innerHTML=`
      <div class="terminliste">
        <h1 class="tl-title">Terminliste ${x.year}</h1>

        <!-- Desktop filter row -->
        <div class="tl-filter-row">
          ${O.year}
          <span id="tl-text-slot"></span>
          ${O.tournamentType}
          ${O.throwingMethod}
          ${O.organizer}
          ${O.category}
          ${y}
        </div>

        <!-- Mobile row -->
        <div class="tl-mobile-row">
          <span id="tl-text-mobile-slot"></span>
          <button class="tl-filter-button" id="tl-filter-open">Filter ≡</button>
          ${b}
        </div>

        <p class="tl-count"></p>

        <div class="tl-list-container"></div>
      </div>

      <!-- Bottom sheet for mobile filters -->
      <div class="tl-sheet-backdrop" id="tl-backdrop"></div>
      <div class="tl-sheet" id="tl-sheet">
        <div class="tl-sheet-content">
          <h2 class="tl-sheet-title">Filtre</h2>
          <label class="tl-label">År
            ${k.year}
          </label>
          <label class="tl-label">Stevnetype
            ${k.tournamentType}
          </label>
          <label class="tl-label">Kastemetode
            ${k.throwingMethod}
          </label>
          <label class="tl-label">Arrangør
            ${k.organizer}
          </label>
          <label class="tl-label">Kategori
            ${k.category}
          </label>
          <div class="tl-sheet-buttons">
            <button class="tl-reset-button" id="tl-reset">Tilbakestill</button>
            <button class="tl-apply-button" id="tl-apply">Bruk filter</button>
          </div>
        </div>
      </div>
    `;function A(){let e=T(S),t=n.querySelector(`.tl-list-container`);if(!t)return e;let r=j(e);typeof r==`string`?t.innerHTML=r:t.replaceChildren(r);let i=n.querySelector(`.tl-count`);i&&(i.textContent=`${e.length} stevner`);let a=C?.profil?.kasterid,o=C?.user.id;return a!=null&&o&&c(t,a,o,w),e}if(A(),p?.profil&&(p.profil.role===`admin`||p.profil.role===`klubbadmin`)){let e=document.createElement(`div`);e.className=`mb-3 px-2 d-flex gap-2`,e.innerHTML=`<a href="#/stevne/ny" class="btn btn-sm btn-success">+ Nytt stevne</a>`,n.querySelector(`.terminliste`)?.prepend(e)}let M=_({slot:n.querySelector(`#tl-text-slot`),state:x,onInput:()=>A()}),N=_({slot:n.querySelector(`#tl-text-mobile-slot`),state:x,onInput:()=>A()}),P=n.querySelector(`.tl-list-container`),F=n.querySelector(`#tl-year`),I=n.querySelector(`#tl-tournamenttype`),L=n.querySelector(`#tl-throwingmethod`),R=n.querySelector(`#tl-organizer`),z=n.querySelector(`#tl-category`),B=n.querySelector(`#tl-filter-open`),V=n.querySelector(`#tl-sheet`),H=n.querySelector(`#tl-backdrop`),U=n.querySelector(`#tl-reset`),W=n.querySelector(`#tl-apply`),G=n.querySelector(`#tl-year-mobil`),K=n.querySelector(`#tl-tournamenttype-mobil`),q=n.querySelector(`#tl-throwingmethod-mobil`),J=n.querySelector(`#tl-organizer-mobil`),Y=n.querySelector(`#tl-category-mobil`);P.addEventListener(`click`,e=>{let t=e.target.closest(`[data-column]`);if(!t)return;let n=t.dataset.column;v.column===n?v.direction=v.direction===`asc`?`desc`:`asc`:(v.column=n,v.direction=`asc`),A()});let X=null;function Z(){if(!n.querySelector(`.tl-list-container`)){window.removeEventListener(`resize`,Z);return}X!==null&&clearTimeout(X),X=setTimeout(A,200)}window.addEventListener(`resize`,Z);async function Q(t){n.querySelector(`.tl-title`).textContent=`Terminliste ${x.year}`,n.querySelector(`.tl-list-container`).replaceChildren(m(`Laster...`));let{data:r,error:i}=await f(x.year);return i?(e(t,i),n.querySelector(`.tl-list-container`).replaceChildren(o(`Feil ved henting.`)),!1):(S=r??[],!0)}if(F.addEventListener(`change`,async()=>{x.year=Number(F.value),await Q(`terminliste.yearChange`)&&A()}),I.addEventListener(`change`,()=>{x.tournamentTypeId=I.value,A()}),L.addEventListener(`change`,()=>{x.throwingMethodId=L.value,A()}),R.addEventListener(`change`,()=>{x.clubId=R.value,A()}),z.addEventListener(`change`,()=>{x.categoryId=z.value,A()}),!h){let e=()=>E(T(S));n.querySelector(`#tl-excel-desktop`).addEventListener(`click`,e),n.querySelector(`#tl-excel-mobile`).addEventListener(`click`,e)}function ee(){V.classList.add(`active`),H.classList.add(`active`)}function $(){V.classList.remove(`active`),H.classList.remove(`active`)}B.addEventListener(`click`,ee),H.addEventListener(`click`,$),U.addEventListener(`click`,()=>{x.searchText=``,x.tournamentTypeId=``,x.throwingMethodId=``,x.clubId=``,x.categoryId=``,K.value=``,q.value=``,J.value=``,Y.value=``,N.value=``,M.value=``,A()}),W.addEventListener(`click`,async()=>{let e=Number(G.value),t=e!==x.year;x.year=e,x.tournamentTypeId=K.value,x.throwingMethodId=q.value,x.clubId=J.value,x.categoryId=Y.value,$(),!(t&&!await Q(`terminliste.applyFilter`))&&A()})}catch(t){e(`terminliste.render`,t),n.replaceChildren(o(`Kunne ikkje laste terminliste.`))}}export{P as render};