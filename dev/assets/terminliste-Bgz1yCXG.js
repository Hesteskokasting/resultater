import{t as e}from"./logError-D5z16FyH.js";import{Ct as t,E as n,St as r,Tt as i,X as a,at as o,i as s,kt as c,st as l,t as u,xt as d}from"./index-BKVpNZfr.js";import{t as f}from"./LoadingState-BWi0wPLz.js";import{t as p}from"./buildDropdownOptions-CFJztUGf.js";import{t as m}from"./SearchInput-BLUeXGg6.js";var h={column:`dato`,direction:`asc`};function g(e,t){switch(t){case`navn`:return e.navn??``;case`dato`:return e.dato??``;case`sted`:return e.sted??``;case`metode`:return[e.innledende?.navn,e.avsluttende?.navn].filter(e=>!!e).join(` `);case`organizer`:return e.klubb?.navn??``;case`type`:return e.stevnetype?.navn??``;case`klassifisering`:return e.kategori?.navn??``;default:return``}}function _(e){return[...e].sort((e,t)=>{let n=g(e,h.column),r=g(t,h.column),i=n.localeCompare(r,`nb`);return h.direction===`asc`?i:-i})}var v={year:new Date().getFullYear(),searchText:``,tournamentTypeId:``,throwingMethodId:``,clubId:``,categoryId:``},y=[],b=null,x=new Map;function S(e){return e.filter(e=>{if(v.searchText){let t=v.searchText.toLowerCase();if(![e.navn,e.sted,e.klubb?.navn,e.stevnetype?.navn,e.kategori?.navn,e.innledende?.navn,e.avsluttende?.navn].some(e=>e?.toLowerCase().includes(t)))return!1}if(v.tournamentTypeId&&String(e.stevnetype?.id)!==v.tournamentTypeId)return!1;if(v.throwingMethodId){let t=v.throwingMethodId;if(!(String(e.innledende?.id)===t||String(e.avsluttende?.id)===t))return!1}return!(v.clubId&&String(e.klubb?.id)!==v.clubId||v.categoryId&&String(e.kategori?.id)!==v.categoryId)})}async function C(e){await t(e.map(e=>({Dato:e.dato?new Date(e.dato).toLocaleDateString(`nb-NO`):``,Navn:e.navn??``,Sted:e.sted??``,Arrangør:e.klubb?.navn??``,Stevnetype:e.stevnetype?.navn??``,"Kastemetode (innledende)":e.innledende?.navn??``,"Kastemetode (avsluttende)":e.avsluttende?.navn??``,Kategori:e.kategori?.navn??``,NM:e.ernm?`Ja`:`Nei`,InnbydelseUrl:e.innbydelseurl??``})),`terminliste-${v.year}.xlsx`,`Terminliste`)}var w=[{id:`navn`,label:`Stevne`},{id:`dato`,label:`Dato`},{id:`sted`,label:`Sted`},{id:`metode`,label:`Metode`},{id:`organizer`,label:`Arrangør`},{id:`type`,label:`Type`},{id:`klassifisering`,label:`Klassifisering`}];function T(e){return h.column===e?h.direction===`asc`?`<span class="tl-sort-icon active">↑</span>`:`<span class="tl-sort-icon active">↓</span>`:`<span class="tl-sort-icon">↕</span>`}function E(e){let t=e.dato?new Date(e.dato+`T12:00:00`).toLocaleDateString(`nb-NO`):``,n=[e.innledende?.navn,e.avsluttende?.navn].filter(e=>!!e).join(` \\ `),r=e.ernm?`<span class="tl-nm-merke">NM</span> `:``,i=e.innbydelseurl?`<a href="${d(e.innbydelseurl)}" target="_blank" rel="noopener" class="tl-invitation-icon" title="Innbydelse">📄</a>`:``;return`<tr class="tl-tr">
    <td><a class="tl-link" href="#/stevne/${e.id}/resultat">${r}${d(e.navn??``)}</a></td>
    <td>${t}</td>
    <td>${d(e.sted??``)}</td>
    <td>${d(n)}</td>
    <td>${d(e.klubb?.navn??``)}</td>
    <td>${d(e.stevnetype?.navn??``)}</td>
    <td>${d(e.kategori?.navn??``)}</td>
    <td>${i}</td>
  </tr>`}function D(e){return e.length===0?`<p class="empty-state">Ingen stevner funnet med valgte filtre.</p>`:`<table class="tl-table">${`<thead><tr>
    ${w.map(e=>`<th class="tl-th" data-column="${e.id}">${e.label}${T(e.id)}</th>`).join(``)}
    <th class="tl-th">Innbydelse</th>
  </tr></thead>`}${`<tbody>${_(e).map(E).join(``)}</tbody>`}</table>`}function O(e){return window.innerWidth>600?D(e):A(e)}function k(e){let t=i(e.dato),n=e.sted?`<p class="tl-detail">Sted: ${d(e.sted)}</p>`:``,r=e.klubb?`<p class="tl-detail">Arrangør: ${d(e.klubb.navn??``)}</p>`:``,a=e.stevnetype?`<p class="tl-detail">Type: ${d(e.stevnetype.navn??``)}</p>`:``,o=e.ernm?`<span class="tl-nm-merke">NM</span>`:``,s=e.innbydelseurl?`<a class="tl-invitation-link" href="${d(e.innbydelseurl)}" target="_blank" rel="noopener">Innbydelse 📄</a>`:``,c=e.resultaturl?`<a class="tournament-link" href="#/stevne/${e.id}/resultat">Vis resultat</a>`:``,l=e.dato&&new Date(e.dato+`T12:00:00`)>new Date,u=e.stevne_fase===null||e.stevne_fase===`ikke_startet`,f=b?.profil?.kobling_status===`godkjent`&&l&&u&&!e.erfullfort?`<span data-registration-slot="${e.id}"></span>`:``;return`
    <div class="tournament-card tl-kort">
      <a class="tl-name tl-name-link" href="#/stevne/${e.id}/resultat">${o}${d(e.navn??``)}</a>
      <p class="tournament-date">${t}</p>
      ${n}${r}${a}
      ${s}${c}${f}
    </div>
  `}function A(e){return e.length===0?`<p class="empty-state">Ingen stevner funnet med valgte filtre.</p>`:`<div class="tournament-list">${e.map(k).join(``)}</div>`}async function j(t){u(()=>j(t)),t.replaceChildren(f(`Laster terminliste…`));try{let[{data:i,error:u},{data:d},g]=await Promise.all([l(v.year),a(),n()]);if(b=g,x=g?.profil?.kasterid==null?new Map:await o(g.profil.kasterid),u){e(`terminliste.render`,u),t.replaceChildren(r(`Kunne ikkje laste terminliste.`));return}y=i??[];function _(e){return{year:`<select class="tl-select" id="tl-year${e}">${c(v.year,1983,new Date().getFullYear()+1)}</select>`,tournamentType:`<select class="tl-select" id="tl-tournamenttype${e}">${p(d.stevnetyper,v.tournamentTypeId,`Alle typer`)}</select>`,throwingMethod:`<select class="tl-select" id="tl-throwingmethod${e}">${p(d.kastemetoder,v.throwingMethodId,`Alle metoder`)}</select>`,organizer:`<select class="tl-select" id="tl-organizer${e}">${p(d.klubber,v.clubId,`Alle arrangører`)}</select>`,category:`<select class="tl-select" id="tl-category${e}">${p(d.kategorier,v.categoryId,`Alle kategorier`)}</select>`}}let w=_(``),T=_(`-mobil`);t.innerHTML=`
      <div class="terminliste">
        <h1 class="tl-title">Terminliste ${v.year}</h1>

        <!-- Desktop filter row -->
        <div class="tl-filter-row">
          ${w.year}
          <span id="tl-text-slot"></span>
          ${w.tournamentType}
          ${w.throwingMethod}
          ${w.organizer}
          ${w.category}
          <button class="tl-excel-button" id="tl-excel-desktop">⬇ Excel</button>
        </div>

        <!-- Mobile row -->
        <div class="tl-mobile-row">
          <span id="tl-text-mobile-slot"></span>
          <button class="tl-filter-button" id="tl-filter-open">Filter ≡</button>
          <button class="tl-excel-button" id="tl-excel-mobile">⬇ Excel</button>
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
            ${T.year}
          </label>
          <label class="tl-label">Stevnetype
            ${T.tournamentType}
          </label>
          <label class="tl-label">Kastemetode
            ${T.throwingMethod}
          </label>
          <label class="tl-label">Arrangør
            ${T.organizer}
          </label>
          <label class="tl-label">Kategori
            ${T.category}
          </label>
          <div class="tl-sheet-buttons">
            <button class="tl-reset-button" id="tl-reset">Tilbakestill</button>
            <button class="tl-apply-button" id="tl-apply">Bruk filter</button>
          </div>
        </div>
      </div>
    `;function E(){let e=S(y),n=t.querySelector(`.tl-list-container`);if(!n)return e;n.innerHTML=O(e);let r=t.querySelector(`.tl-count`);r&&(r.textContent=`${e.length} stevner`);let i=b?.profil?.kasterid,a=b?.user.id;return i!=null&&a&&s(n,i,a,x),e}if(E(),g?.profil&&(g.profil.role===`admin`||g.profil.role===`klubbadmin`)){let e=document.createElement(`div`);e.className=`mb-3 px-2 d-flex gap-2`,e.innerHTML=`<a href="#/stevne/ny" class="btn btn-sm btn-success">+ Nytt stevne</a>`,t.querySelector(`.terminliste`)?.prepend(e)}let D=m({slot:t.querySelector(`#tl-text-slot`),state:v,onInput:()=>E()}),k=m({slot:t.querySelector(`#tl-text-mobile-slot`),state:v,onInput:()=>E()}),A=t.querySelector(`.tl-list-container`),j=t.querySelector(`#tl-year`),M=t.querySelector(`#tl-tournamenttype`),N=t.querySelector(`#tl-throwingmethod`),P=t.querySelector(`#tl-organizer`),F=t.querySelector(`#tl-category`),I=t.querySelector(`#tl-excel-desktop`),L=t.querySelector(`#tl-excel-mobile`),R=t.querySelector(`#tl-filter-open`),z=t.querySelector(`#tl-sheet`),B=t.querySelector(`#tl-backdrop`),V=t.querySelector(`#tl-reset`),H=t.querySelector(`#tl-apply`),U=t.querySelector(`#tl-year-mobil`),W=t.querySelector(`#tl-tournamenttype-mobil`),G=t.querySelector(`#tl-throwingmethod-mobil`),K=t.querySelector(`#tl-organizer-mobil`),q=t.querySelector(`#tl-category-mobil`);A.addEventListener(`click`,e=>{let t=e.target.closest(`[data-column]`);if(!t)return;let n=t.dataset.column;h.column===n?h.direction=h.direction===`asc`?`desc`:`asc`:(h.column=n,h.direction=`asc`),E()});let J=null;function Y(){if(!t.querySelector(`.tl-list-container`)){window.removeEventListener(`resize`,Y);return}J!==null&&clearTimeout(J),J=setTimeout(E,200)}window.addEventListener(`resize`,Y);async function X(n){t.querySelector(`.tl-title`).textContent=`Terminliste ${v.year}`,t.querySelector(`.tl-list-container`).replaceChildren(f(`Laster...`));let{data:i,error:a}=await l(v.year);return a?(e(n,a),t.querySelector(`.tl-list-container`).replaceChildren(r(`Feil ved henting.`)),!1):(y=i??[],!0)}j.addEventListener(`change`,async()=>{v.year=Number(j.value),await X(`terminliste.yearChange`)&&E()}),M.addEventListener(`change`,()=>{v.tournamentTypeId=M.value,E()}),N.addEventListener(`change`,()=>{v.throwingMethodId=N.value,E()}),P.addEventListener(`change`,()=>{v.clubId=P.value,E()}),F.addEventListener(`change`,()=>{v.categoryId=F.value,E()});let Z=()=>C(S(y));I.addEventListener(`click`,Z),L.addEventListener(`click`,Z);function Q(){z.classList.add(`active`),B.classList.add(`active`)}function $(){z.classList.remove(`active`),B.classList.remove(`active`)}R.addEventListener(`click`,Q),B.addEventListener(`click`,$),V.addEventListener(`click`,()=>{v.searchText=``,v.tournamentTypeId=``,v.throwingMethodId=``,v.clubId=``,v.categoryId=``,W.value=``,G.value=``,K.value=``,q.value=``,k.value=``,D.value=``,E()}),H.addEventListener(`click`,async()=>{let e=Number(U.value),t=e!==v.year;v.year=e,v.tournamentTypeId=W.value,v.throwingMethodId=G.value,v.clubId=K.value,v.categoryId=q.value,$(),!(t&&!await X(`terminliste.applyFilter`))&&E()})}catch(n){e(`terminliste.render`,n),t.replaceChildren(r(`Kunne ikkje laste terminliste.`))}}export{j as render};