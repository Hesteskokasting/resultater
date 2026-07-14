import{t as e}from"./logError-D5z16FyH.js";import{Ct as t,E as n,St as r,Tt as i,X as a,at as o,i as s,kt as c,st as l,t as u,xt as d}from"./index-DkhyRBHD.js";import{t as f}from"./LoadingState-BWi0wPLz.js";import{t as p}from"./buildDropdownOptions-Dh-QiDQO.js";var m={column:`dato`,direction:`asc`};function h(e,t){switch(t){case`navn`:return e.navn??``;case`dato`:return e.dato??``;case`sted`:return e.sted??``;case`metode`:return[e.innledende?.navn,e.avsluttende?.navn].filter(e=>!!e).join(` `);case`organizer`:return e.klubb?.navn??``;case`type`:return e.stevnetype?.navn??``;case`klassifisering`:return e.kategori?.navn??``;default:return``}}function g(e){return[...e].sort((e,t)=>{let n=h(e,m.column),r=h(t,m.column),i=n.localeCompare(r,`nb`);return m.direction===`asc`?i:-i})}var _={year:new Date().getFullYear(),text:``,tournamentTypeId:``,throwingMethodId:``,clubId:``,categoryId:``},v=[],y=null,b=new Map;function x(e){return e.filter(e=>{if(_.text){let t=_.text.toLowerCase();if(![e.navn,e.sted,e.klubb?.navn,e.stevnetype?.navn,e.kategori?.navn,e.innledende?.navn,e.avsluttende?.navn].some(e=>e?.toLowerCase().includes(t)))return!1}if(_.tournamentTypeId&&String(e.stevnetype?.id)!==_.tournamentTypeId)return!1;if(_.throwingMethodId){let t=_.throwingMethodId;if(!(String(e.innledende?.id)===t||String(e.avsluttende?.id)===t))return!1}return!(_.clubId&&String(e.klubb?.id)!==_.clubId||_.categoryId&&String(e.kategori?.id)!==_.categoryId)})}async function S(e){await t(e.map(e=>({Dato:e.dato?new Date(e.dato).toLocaleDateString(`nb-NO`):``,Navn:e.navn??``,Sted:e.sted??``,Arrangør:e.klubb?.navn??``,Stevnetype:e.stevnetype?.navn??``,"Kastemetode (innledende)":e.innledende?.navn??``,"Kastemetode (avsluttende)":e.avsluttende?.navn??``,Kategori:e.kategori?.navn??``,NM:e.ernm?`Ja`:`Nei`,InnbydelseUrl:e.innbydelseurl??``})),`terminliste-${_.year}.xlsx`,`Terminliste`)}var C=[{id:`navn`,label:`Stevne`},{id:`dato`,label:`Dato`},{id:`sted`,label:`Sted`},{id:`metode`,label:`Metode`},{id:`organizer`,label:`Arrangør`},{id:`type`,label:`Type`},{id:`klassifisering`,label:`Klassifisering`}];function w(e){return m.column===e?m.direction===`asc`?`<span class="tl-sort-icon active">↑</span>`:`<span class="tl-sort-icon active">↓</span>`:`<span class="tl-sort-icon">↕</span>`}function T(e){let t=e.dato?new Date(e.dato+`T12:00:00`).toLocaleDateString(`nb-NO`):``,n=[e.innledende?.navn,e.avsluttende?.navn].filter(e=>!!e).join(` \\ `),r=e.ernm?`<span class="tl-nm-merke">NM</span> `:``,i=e.innbydelseurl?`<a href="${d(e.innbydelseurl)}" target="_blank" rel="noopener" class="tl-invitation-icon" title="Innbydelse">📄</a>`:``;return`<tr class="tl-tr">
    <td><a class="tl-link" href="#/stevne/${e.id}/resultat">${r}${d(e.navn??``)}</a></td>
    <td>${t}</td>
    <td>${d(e.sted??``)}</td>
    <td>${d(n)}</td>
    <td>${d(e.klubb?.navn??``)}</td>
    <td>${d(e.stevnetype?.navn??``)}</td>
    <td>${d(e.kategori?.navn??``)}</td>
    <td>${i}</td>
  </tr>`}function E(e){return e.length===0?`<p class="empty-state">Ingen stevner funnet med valgte filtre.</p>`:`<table class="tl-table">${`<thead><tr>
    ${C.map(e=>`<th class="tl-th" data-column="${e.id}">${e.label}${w(e.id)}</th>`).join(``)}
    <th class="tl-th">Innbydelse</th>
  </tr></thead>`}${`<tbody>${g(e).map(T).join(``)}</tbody>`}</table>`}function D(e){return window.innerWidth>600?E(e):k(e)}function O(e){let t=i(e.dato),n=e.sted?`<p class="tl-detail">Sted: ${d(e.sted)}</p>`:``,r=e.klubb?`<p class="tl-detail">Arrangør: ${d(e.klubb.navn??``)}</p>`:``,a=e.stevnetype?`<p class="tl-detail">Type: ${d(e.stevnetype.navn??``)}</p>`:``,o=e.ernm?`<span class="tl-nm-merke">NM</span>`:``,s=e.innbydelseurl?`<a class="tl-invitation-link" href="${d(e.innbydelseurl)}" target="_blank" rel="noopener">Innbydelse 📄</a>`:``,c=e.resultaturl?`<a class="tournament-link" href="#/stevne/${e.id}/resultat">Vis resultat</a>`:``,l=e.dato&&new Date(e.dato+`T12:00:00`)>new Date,u=e.stevne_fase===null||e.stevne_fase===`ikke_startet`,f=y?.profil?.kobling_status===`godkjent`&&l&&u&&!e.erfullfort?`<span data-registration-slot="${e.id}"></span>`:``;return`
    <div class="tournament-card tl-kort">
      <a class="tl-name tl-name-link" href="#/stevne/${e.id}/resultat">${o}${d(e.navn??``)}</a>
      <p class="tournament-date">${t}</p>
      ${n}${r}${a}
      ${s}${c}${f}
    </div>
  `}function k(e){return e.length===0?`<p class="empty-state">Ingen stevner funnet med valgte filtre.</p>`:`<div class="tournament-list">${e.map(O).join(``)}</div>`}async function A(t){u(()=>A(t)),t.replaceChildren(f(`Laster terminliste…`));try{let[{data:i,error:u},{data:h},g]=await Promise.all([l(_.year),a(),n()]);if(y=g,b=g?.profil?.kasterid==null?new Map:await o(g.profil.kasterid),u){e(`terminliste.render`,u),t.replaceChildren(r(`Kunne ikkje laste terminliste.`));return}v=i??[];function C(e){return{year:`<select class="tl-select" id="tl-year${e}">${c(_.year,1983,new Date().getFullYear()+1)}</select>`,tournamentType:`<select class="tl-select" id="tl-tournamenttype${e}">${p(h.stevnetyper,_.tournamentTypeId,`Alle typer`)}</select>`,throwingMethod:`<select class="tl-select" id="tl-throwingmethod${e}">${p(h.kastemetoder,_.throwingMethodId,`Alle metoder`)}</select>`,organizer:`<select class="tl-select" id="tl-organizer${e}">${p(h.klubber,_.clubId,`Alle arrangører`)}</select>`,category:`<select class="tl-select" id="tl-category${e}">${p(h.kategorier,_.categoryId,`Alle kategorier`)}</select>`}}let w=C(``),T=C(`-mobil`);t.innerHTML=`
      <div class="terminliste">
        <h1 class="tl-title">Terminliste ${_.year}</h1>

        <!-- Desktop filter row -->
        <div class="tl-filter-row">
          ${w.year}
          <input class="tl-input" id="tl-text" type="search" placeholder="Søk..." value="${d(_.text)}">
          ${w.tournamentType}
          ${w.throwingMethod}
          ${w.organizer}
          ${w.category}
          <button class="tl-excel-button" id="tl-excel-desktop">⬇ Excel</button>
        </div>

        <!-- Mobile row -->
        <div class="tl-mobile-row">
          <input class="tl-input" id="tl-text-mobile" type="search" placeholder="Søk..." value="${d(_.text)}">
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
    `;function E(){let e=x(v),n=t.querySelector(`.tl-list-container`);if(!n)return e;n.innerHTML=D(e);let r=t.querySelector(`.tl-count`);r&&(r.textContent=`${e.length} stevner`);let i=y?.profil?.kasterid,a=y?.user.id;return i!=null&&a&&s(n,i,a,b),e}if(E(),g?.profil&&(g.profil.role===`admin`||g.profil.role===`klubbadmin`)){let e=document.createElement(`div`);e.className=`mb-3 px-2 d-flex gap-2`,e.innerHTML=`<a href="#/stevne/ny" class="btn btn-sm btn-success">+ Nytt stevne</a>`,t.querySelector(`.terminliste`)?.prepend(e)}let O=t.querySelector(`.tl-list-container`),k=t.querySelector(`#tl-year`),A=t.querySelector(`#tl-text`),j=t.querySelector(`#tl-text-mobile`),M=t.querySelector(`#tl-tournamenttype`),N=t.querySelector(`#tl-throwingmethod`),P=t.querySelector(`#tl-organizer`),F=t.querySelector(`#tl-category`),I=t.querySelector(`#tl-excel-desktop`),L=t.querySelector(`#tl-excel-mobile`),R=t.querySelector(`#tl-filter-open`),z=t.querySelector(`#tl-sheet`),B=t.querySelector(`#tl-backdrop`),V=t.querySelector(`#tl-reset`),H=t.querySelector(`#tl-apply`),U=t.querySelector(`#tl-year-mobil`),W=t.querySelector(`#tl-tournamenttype-mobil`),G=t.querySelector(`#tl-throwingmethod-mobil`),K=t.querySelector(`#tl-organizer-mobil`),q=t.querySelector(`#tl-category-mobil`);O.addEventListener(`click`,e=>{let t=e.target.closest(`[data-column]`);if(!t)return;let n=t.dataset.column;m.column===n?m.direction=m.direction===`asc`?`desc`:`asc`:(m.column=n,m.direction=`asc`),E()});let J=null;function Y(){if(!t.querySelector(`.tl-list-container`)){window.removeEventListener(`resize`,Y);return}J!==null&&clearTimeout(J),J=setTimeout(E,200)}window.addEventListener(`resize`,Y);async function X(n){t.querySelector(`.tl-title`).textContent=`Terminliste ${_.year}`,t.querySelector(`.tl-list-container`).replaceChildren(f(`Laster...`));let{data:i,error:a}=await l(_.year);return a?(e(n,a),t.querySelector(`.tl-list-container`).replaceChildren(r(`Feil ved henting.`)),!1):(v=i??[],!0)}k.addEventListener(`change`,async()=>{_.year=Number(k.value),await X(`terminliste.yearChange`)&&E()}),A.addEventListener(`input`,()=>{_.text=A.value,E()}),j.addEventListener(`input`,()=>{_.text=j.value,A.value=j.value,E()}),M.addEventListener(`change`,()=>{_.tournamentTypeId=M.value,E()}),N.addEventListener(`change`,()=>{_.throwingMethodId=N.value,E()}),P.addEventListener(`change`,()=>{_.clubId=P.value,E()}),F.addEventListener(`change`,()=>{_.categoryId=F.value,E()});let Z=()=>S(x(v));I.addEventListener(`click`,Z),L.addEventListener(`click`,Z);function Q(){z.classList.add(`active`),B.classList.add(`active`)}function $(){z.classList.remove(`active`),B.classList.remove(`active`)}R.addEventListener(`click`,Q),B.addEventListener(`click`,$),V.addEventListener(`click`,()=>{_.text=``,_.tournamentTypeId=``,_.throwingMethodId=``,_.clubId=``,_.categoryId=``,W.value=``,G.value=``,K.value=``,q.value=``,j.value=``,A.value=``,E()}),H.addEventListener(`click`,async()=>{let e=Number(U.value),t=e!==_.year;_.year=e,_.tournamentTypeId=W.value,_.throwingMethodId=G.value,_.clubId=K.value,_.categoryId=q.value,$(),!(t&&!await X(`terminliste.applyFilter`))&&E()})}catch(n){e(`terminliste.render`,n),t.replaceChildren(r(`Kunne ikkje laste terminliste.`))}}export{A as render};