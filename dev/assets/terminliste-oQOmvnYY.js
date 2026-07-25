import{t as e}from"./logError-D5z16FyH.js";import{Ct as t,D as n,Dt as r,Q as i,Tt as a,Ut as o,i as s,jt as c,lt as l,st as u,t as d,wt as f}from"./index-BErz4npm.js";import{t as p}from"./LoadingState-BWi0wPLz.js";import{t as m}from"./buildDropdownOptions-BTLW0QPo.js";import{t as h}from"./SearchInput-BLUeXGg6.js";var g={column:`dato`,direction:`asc`};function _(e,t){switch(t){case`navn`:return e.navn??``;case`dato`:return e.dato??``;case`sted`:return e.sted??``;case`metode`:return[e.innledende?.navn,e.avsluttende?.navn].filter(e=>!!e).join(` `);case`organizer`:return e.klubb?.navn??``;case`type`:return e.stevnetype?.navn??``;case`klassifisering`:return e.kategori?.navn??``;default:return``}}function v(e){return[...e].sort((e,t)=>{let n=_(e,g.column),r=_(t,g.column),i=n.localeCompare(r,`nb`);return g.direction===`asc`?i:-i})}var y={year:new Date().getFullYear(),searchText:``,tournamentTypeId:``,throwingMethodId:``,clubId:``,categoryId:``},b=[],x=null,S=new Map;function C(e){return e.filter(e=>{if(y.searchText){let t=y.searchText.toLowerCase();if(![e.navn,e.sted,e.klubb?.navn,e.stevnetype?.navn,e.kategori?.navn,e.innledende?.navn,e.avsluttende?.navn].some(e=>e?.toLowerCase().includes(t)))return!1}if(y.tournamentTypeId&&String(e.stevnetype?.id)!==y.tournamentTypeId)return!1;if(y.throwingMethodId){let t=y.throwingMethodId;if(!(String(e.innledende?.id)===t||String(e.avsluttende?.id)===t))return!1}return!(y.clubId&&String(e.klubb?.id)!==y.clubId||y.categoryId&&String(e.kategori?.id)!==y.categoryId)})}async function w(e){await a(e.map(e=>({Dato:e.dato?new Date(e.dato).toLocaleDateString(`nb-NO`):``,Navn:e.navn??``,Sted:e.sted??``,Arrangør:e.klubb?.navn??``,Stevnetype:e.stevnetype?.navn??``,"Kastemetode (innledende)":e.innledende?.navn??``,"Kastemetode (avsluttende)":e.avsluttende?.navn??``,Kategori:e.kategori?.navn??``,NM:e.ernm?`Ja`:`Nei`,InnbydelseUrl:e.innbydelseurl??``})),`terminliste-${y.year}.xlsx`,`Terminliste`)}var T=[{id:`navn`,label:`Stevne`},{id:`dato`,label:`Dato`},{id:`sted`,label:`Sted`},{id:`metode`,label:`Metode`},{id:`organizer`,label:`Arrangør`},{id:`type`,label:`Type`},{id:`klassifisering`,label:`Klassifisering`}];function E(e){return g.column===e?g.direction===`asc`?`<span class="tl-sort-icon active">↑</span>`:`<span class="tl-sort-icon active">↓</span>`:`<span class="tl-sort-icon">↕</span>`}function D(e){let n=e.dato?new Date(e.dato+`T12:00:00`).toLocaleDateString(`nb-NO`):``,r=[e.innledende?.navn,e.avsluttende?.navn].filter(e=>!!e).join(` \\ `),i=e.ernm?`<span class="tl-nm-merke">NM</span> `:``,a=e.innbydelseurl?`<a href="${t(e.innbydelseurl)}" target="_blank" rel="noopener" class="tl-invitation-icon" title="Innbydelse">📄</a>`:``;return`<tr class="tl-tr">
    <td><a class="tl-link" href="#/stevne/${e.id}/resultat">${i}${t(e.navn??``)}</a></td>
    <td>${n}</td>
    <td>${t(e.sted??``)}</td>
    <td>${t(r)}</td>
    <td>${t(e.klubb?.navn??``)}</td>
    <td>${t(e.stevnetype?.navn??``)}</td>
    <td>${t(e.kategori?.navn??``)}</td>
    <td>${a}</td>
  </tr>`}function O(e){return e.length===0?`<p class="empty-state">Ingen stevner funnet med valgte filtre.</p>`:`<table class="tl-table">${`<thead><tr>
    ${T.map(e=>`<th class="tl-th" data-column="${e.id}">${e.label}${E(e.id)}</th>`).join(``)}
    <th class="tl-th">Innbydelse</th>
  </tr></thead>`}${`<tbody>${v(e).map(D).join(``)}</tbody>`}</table>`}function k(e){return window.innerWidth>600?O(e):j(e)}function A(e){let n=r(e.dato),i=e.sted?`<p class="tl-detail">Sted: ${t(e.sted)}</p>`:``,a=e.klubb?`<p class="tl-detail">Arrangør: ${t(e.klubb.navn??``)}</p>`:``,o=e.stevnetype?`<p class="tl-detail">Type: ${t(e.stevnetype.navn??``)}</p>`:``,s=e.ernm?`<span class="tl-nm-merke">NM</span>`:``,c=e.innbydelseurl?`<a class="tl-invitation-link" href="${t(e.innbydelseurl)}" target="_blank" rel="noopener">Innbydelse 📄</a>`:``,l=e.resultaturl?`<a class="tournament-link" href="#/stevne/${e.id}/resultat">Vis resultat</a>`:``,u=e.dato&&new Date(e.dato+`T12:00:00`)>new Date,d=e.stevne_fase===null||e.stevne_fase===`ikke_startet`,f=x?.profil?.kobling_status===`godkjent`&&u&&d&&!e.erfullfort?`<span data-registration-slot="${e.id}"></span>`:``;return`
    <div class="tournament-card tl-kort">
      <a class="tl-name tl-name-link" href="#/stevne/${e.id}/resultat">${s}${t(e.navn??``)}</a>
      <p class="tournament-date">${n}</p>
      ${i}${a}${o}
      ${c}${l}${f}
    </div>
  `}function j(e){return e.length===0?`<p class="empty-state">Ingen stevner funnet med valgte filtre.</p>`:`<div class="tournament-list">${e.map(A).join(``)}</div>`}async function M(t){d(()=>M(t)),t.replaceChildren(p(`Laster terminliste…`));try{let[{data:r,error:a},{data:d},_]=await Promise.all([l(y.year),i(),n()]);if(x=_,S=_?.profil?.kasterid==null?new Map:await u(_.profil.kasterid),a){e(`terminliste.render`,a),t.replaceChildren(f(`Kunne ikkje laste terminliste.`));return}b=r??[];let v=o.isNativePlatform(),T=v?``:`<button class="tl-excel-button" id="tl-excel-desktop">⬇ Excel</button>`,E=v?``:`<button class="tl-excel-button" id="tl-excel-mobile">⬇ Excel</button>`;function D(e){return{year:`<select class="tl-select" id="tl-year${e}">${c(y.year,1983,new Date().getFullYear()+1)}</select>`,tournamentType:`<select class="tl-select" id="tl-tournamenttype${e}">${m(d.stevnetyper,y.tournamentTypeId,`Alle typer`)}</select>`,throwingMethod:`<select class="tl-select" id="tl-throwingmethod${e}">${m(d.kastemetoder,y.throwingMethodId,`Alle metoder`)}</select>`,organizer:`<select class="tl-select" id="tl-organizer${e}">${m(d.klubber,y.clubId,`Alle arrangører`)}</select>`,category:`<select class="tl-select" id="tl-category${e}">${m(d.kategorier,y.categoryId,`Alle kategorier`)}</select>`}}let O=D(``),A=D(`-mobil`);t.innerHTML=`
      <div class="terminliste">
        <h1 class="tl-title">Terminliste ${y.year}</h1>

        <!-- Desktop filter row -->
        <div class="tl-filter-row">
          ${O.year}
          <span id="tl-text-slot"></span>
          ${O.tournamentType}
          ${O.throwingMethod}
          ${O.organizer}
          ${O.category}
          ${T}
        </div>

        <!-- Mobile row -->
        <div class="tl-mobile-row">
          <span id="tl-text-mobile-slot"></span>
          <button class="tl-filter-button" id="tl-filter-open">Filter ≡</button>
          ${E}
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
            ${A.year}
          </label>
          <label class="tl-label">Stevnetype
            ${A.tournamentType}
          </label>
          <label class="tl-label">Kastemetode
            ${A.throwingMethod}
          </label>
          <label class="tl-label">Arrangør
            ${A.organizer}
          </label>
          <label class="tl-label">Kategori
            ${A.category}
          </label>
          <div class="tl-sheet-buttons">
            <button class="tl-reset-button" id="tl-reset">Tilbakestill</button>
            <button class="tl-apply-button" id="tl-apply">Bruk filter</button>
          </div>
        </div>
      </div>
    `;function j(){let e=C(b),n=t.querySelector(`.tl-list-container`);if(!n)return e;n.innerHTML=k(e);let r=t.querySelector(`.tl-count`);r&&(r.textContent=`${e.length} stevner`);let i=x?.profil?.kasterid,a=x?.user.id;return i!=null&&a&&s(n,i,a,S),e}if(j(),_?.profil&&(_.profil.role===`admin`||_.profil.role===`klubbadmin`)){let e=document.createElement(`div`);e.className=`mb-3 px-2 d-flex gap-2`,e.innerHTML=`<a href="#/stevne/ny" class="btn btn-sm btn-success">+ Nytt stevne</a>`,t.querySelector(`.terminliste`)?.prepend(e)}let M=h({slot:t.querySelector(`#tl-text-slot`),state:y,onInput:()=>j()}),N=h({slot:t.querySelector(`#tl-text-mobile-slot`),state:y,onInput:()=>j()}),P=t.querySelector(`.tl-list-container`),F=t.querySelector(`#tl-year`),I=t.querySelector(`#tl-tournamenttype`),L=t.querySelector(`#tl-throwingmethod`),R=t.querySelector(`#tl-organizer`),z=t.querySelector(`#tl-category`),B=t.querySelector(`#tl-filter-open`),V=t.querySelector(`#tl-sheet`),H=t.querySelector(`#tl-backdrop`),U=t.querySelector(`#tl-reset`),W=t.querySelector(`#tl-apply`),G=t.querySelector(`#tl-year-mobil`),K=t.querySelector(`#tl-tournamenttype-mobil`),q=t.querySelector(`#tl-throwingmethod-mobil`),J=t.querySelector(`#tl-organizer-mobil`),Y=t.querySelector(`#tl-category-mobil`);P.addEventListener(`click`,e=>{let t=e.target.closest(`[data-column]`);if(!t)return;let n=t.dataset.column;g.column===n?g.direction=g.direction===`asc`?`desc`:`asc`:(g.column=n,g.direction=`asc`),j()});let X=null;function Z(){if(!t.querySelector(`.tl-list-container`)){window.removeEventListener(`resize`,Z);return}X!==null&&clearTimeout(X),X=setTimeout(j,200)}window.addEventListener(`resize`,Z);async function Q(n){t.querySelector(`.tl-title`).textContent=`Terminliste ${y.year}`,t.querySelector(`.tl-list-container`).replaceChildren(p(`Laster...`));let{data:r,error:i}=await l(y.year);return i?(e(n,i),t.querySelector(`.tl-list-container`).replaceChildren(f(`Feil ved henting.`)),!1):(b=r??[],!0)}if(F.addEventListener(`change`,async()=>{y.year=Number(F.value),await Q(`terminliste.yearChange`)&&j()}),I.addEventListener(`change`,()=>{y.tournamentTypeId=I.value,j()}),L.addEventListener(`change`,()=>{y.throwingMethodId=L.value,j()}),R.addEventListener(`change`,()=>{y.clubId=R.value,j()}),z.addEventListener(`change`,()=>{y.categoryId=z.value,j()}),!v){let e=()=>w(C(b));t.querySelector(`#tl-excel-desktop`).addEventListener(`click`,e),t.querySelector(`#tl-excel-mobile`).addEventListener(`click`,e)}function ee(){V.classList.add(`active`),H.classList.add(`active`)}function $(){V.classList.remove(`active`),H.classList.remove(`active`)}B.addEventListener(`click`,ee),H.addEventListener(`click`,$),U.addEventListener(`click`,()=>{y.searchText=``,y.tournamentTypeId=``,y.throwingMethodId=``,y.clubId=``,y.categoryId=``,K.value=``,q.value=``,J.value=``,Y.value=``,N.value=``,M.value=``,j()}),W.addEventListener(`click`,async()=>{let e=Number(G.value),t=e!==y.year;y.year=e,y.tournamentTypeId=K.value,y.throwingMethodId=q.value,y.clubId=J.value,y.categoryId=Y.value,$(),!(t&&!await Q(`terminliste.applyFilter`))&&j()})}catch(n){e(`terminliste.render`,n),t.replaceChildren(f(`Kunne ikkje laste terminliste.`))}}export{M as render};