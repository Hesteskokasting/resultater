import{t as e}from"./logError-DhxY2JQv.js";import{i as t}from"./authService-CcI7FLUE.js";import{J as n,M as r,Q as i,X as a,Y as o,nt as s,t as c,w as l,z as u}from"./index-pllV3QU0.js";import{t as d}from"./LoadingState-xRmJ3K_t.js";import{t as f}from"./buildDropdownOptions-BRFGPdcK.js";var p={kolonne:`dato`,retning:`asc`};function m(e,t){switch(t){case`navn`:return e.navn??``;case`dato`:return e.dato??``;case`sted`:return e.sted??``;case`metode`:return[e.innledende?.navn,e.avsluttende?.navn].filter(e=>!!e).join(` `);case`organizer`:return e.klubb?.navn??``;case`type`:return e.stevnetype?.navn??``;case`klassifisering`:return e.kategori?.navn??``;default:return``}}function h(e){return[...e].sort((e,t)=>{let n=m(e,p.kolonne),r=m(t,p.kolonne),i=n.localeCompare(r,`nb`);return p.retning===`asc`?i:-i})}var g={ar:new Date().getFullYear(),tekst:``,stevnetypeId:``,kastemetodeId:``,klubbId:``,kategoriId:``},_=[],v=null,y=new Map;function b(e){return e.filter(e=>{if(g.tekst){let t=g.tekst.toLowerCase();if(![e.navn,e.sted,e.klubb?.navn,e.stevnetype?.navn,e.kategori?.navn,e.innledende?.navn,e.avsluttende?.navn].some(e=>e?.toLowerCase().includes(t)))return!1}if(g.stevnetypeId&&String(e.stevnetype?.id)!==g.stevnetypeId)return!1;if(g.kastemetodeId){let t=g.kastemetodeId;if(!(String(e.innledende?.id)===t||String(e.avsluttende?.id)===t))return!1}return!(g.klubbId&&String(e.klubb?.id)!==g.klubbId||g.kategoriId&&String(e.kategori?.id)!==g.kategoriId)})}async function x(e){await s(e.map(e=>({Dato:e.dato?new Date(e.dato).toLocaleDateString(`nb-NO`):``,Navn:e.navn??``,Sted:e.sted??``,Arrangør:e.klubb?.navn??``,Stevnetype:e.stevnetype?.navn??``,"Kastemetode (innledende)":e.innledende?.navn??``,"Kastemetode (avsluttende)":e.avsluttende?.navn??``,Kategori:e.kategori?.navn??``,NM:e.ernm?`Ja`:`Nei`,InnbydelseUrl:e.innbydelseurl??``})),`terminliste-${g.ar}.xlsx`,`Terminliste`)}var S=[{id:`navn`,label:`Stevne`},{id:`dato`,label:`Dato`},{id:`sted`,label:`Sted`},{id:`metode`,label:`Metode`},{id:`organizer`,label:`Arrangør`},{id:`type`,label:`Type`},{id:`klassifisering`,label:`Klassifisering`}];function C(e){return p.kolonne===e?p.retning===`asc`?`<span class="tl-sort-ikon aktiv">↑</span>`:`<span class="tl-sort-ikon aktiv">↓</span>`:`<span class="tl-sort-ikon">↕</span>`}function w(e){let t=e.dato?new Date(e.dato+`T12:00:00`).toLocaleDateString(`nb-NO`):``,r=[e.innledende?.navn,e.avsluttende?.navn].filter(e=>!!e).join(` \\ `),i=e.ernm?`<span class="tl-nm-merke">NM</span> `:``,a=e.innbydelseurl?`<a href="${n(e.innbydelseurl)}" target="_blank" rel="noopener" class="tl-innbydelse-ikon" title="Innbydelse">📄</a>`:``;return`<tr class="tl-tr">
    <td><a class="tl-lenkje" href="#/stevne/${e.id}/resultat">${i}${n(e.navn??``)}</a></td>
    <td>${t}</td>
    <td>${n(e.sted??``)}</td>
    <td>${n(r)}</td>
    <td>${n(e.klubb?.navn??``)}</td>
    <td>${n(e.stevnetype?.navn??``)}</td>
    <td>${n(e.kategori?.navn??``)}</td>
    <td>${a}</td>
  </tr>`}function T(e){return e.length===0?`<p class="empty-state">Ingen stevner funnet med valgte filtre.</p>`:`<table class="tl-tabell">${`<thead><tr>
    ${S.map(e=>`<th class="tl-th" data-kolonne="${e.id}">${e.label}${C(e.id)}</th>`).join(``)}
    <th class="tl-th">Innbydelse</th>
  </tr></thead>`}${`<tbody>${h(e).map(w).join(``)}</tbody>`}</table>`}function E(e){return window.innerWidth>600?T(e):O(e)}function D(e){let t=i(e.dato),r=e.sted?`<p class="tl-detalj">Sted: ${n(e.sted)}</p>`:``,a=e.klubb?`<p class="tl-detalj">Arrangør: ${n(e.klubb.navn??``)}</p>`:``,o=e.stevnetype?`<p class="tl-detalj">Type: ${n(e.stevnetype.navn??``)}</p>`:``,s=e.ernm?`<span class="tl-nm-merke">NM</span>`:``,c=e.innbydelseurl?`<a class="tl-innbydelse-lenke" href="${n(e.innbydelseurl)}" target="_blank" rel="noopener">Innbydelse 📄</a>`:``,l=e.resultaturl?`<a class="stevne-lenke" href="#/stevne/${e.id}/resultat">Vis resultat</a>`:``,u=e.dato&&new Date(e.dato+`T12:00:00`)>new Date,d=e.stevne_fase===null||e.stevne_fase===`ikke_startet`,f=v?.profil?.kobling_status===`godkjent`&&u&&d&&!e.erfullfort?`<span data-pm-slot="${e.id}"></span>`:``;return`
    <div class="stevne-kort tl-kort">
      <a class="tl-navn tl-navn-lenke" href="#/stevne/${e.id}/resultat">${s}${n(e.navn??``)}</a>
      <p class="stevne-dato">${t}</p>
      ${r}${a}${o}
      ${c}${l}${f}
    </div>
  `}function O(e){return e.length===0?`<p class="empty-state">Ingen stevner funnet med valgte filtre.</p>`:`<div class="stevne-liste">${e.map(D).join(``)}</div>`}async function k(i){i.replaceChildren(d(`Laster terminliste…`));try{let[{data:s,error:m},{data:h},S]=await Promise.all([u(g.ar),l(),t()]);if(v=S,y=S?.profil?.kasterid==null?new Map:await r(S.profil.kasterid),m){e(`terminliste.render`,m),i.replaceChildren(o(`Kunne ikkje laste terminliste.`));return}_=s??[];function C(e){return{ar:`<select class="tl-select" id="tl-ar${e}">${a(g.ar,1983,new Date().getFullYear()+1)}</select>`,stevnetype:`<select class="tl-select" id="tl-stevnetype${e}">${f(h.stevnetyper,g.stevnetypeId,`Alle typer`)}</select>`,kastemetode:`<select class="tl-select" id="tl-kastemetode${e}">${f(h.kastemetoder,g.kastemetodeId,`Alle metoder`)}</select>`,arrangor:`<select class="tl-select" id="tl-arrangorklubb${e}">${f(h.klubber,g.klubbId,`Alle arrangører`)}</select>`,kategori:`<select class="tl-select" id="tl-kategori${e}">${f(h.kategorier,g.kategoriId,`Alle kategorier`)}</select>`}}let w=C(``),T=C(`-mobil`);i.innerHTML=`
      <div class="terminliste">
        <h1 class="tl-tittel">Terminliste ${g.ar}</h1>

        <!-- Desktop-filterrad -->
        <div class="tl-filter-rad">
          ${w.ar}
          <input class="tl-input" id="tl-tekst" type="search" placeholder="Søk..." value="${n(g.tekst)}">
          ${w.stevnetype}
          ${w.kastemetode}
          ${w.arrangor}
          ${w.kategori}
          <button class="tl-excel-knapp" id="tl-excel-desktop">⬇ Excel</button>
        </div>

        <!-- Mobil-rad -->
        <div class="tl-mobil-rad">
          <input class="tl-input" id="tl-tekst-mobil" type="search" placeholder="Søk..." value="${n(g.tekst)}">
          <button class="tl-filter-knapp" id="tl-filter-aapne">Filter ≡</button>
          <button class="tl-excel-knapp" id="tl-excel-mobil">⬇ Excel</button>
        </div>

        <p class="tl-antall"></p>

        <div class="tl-liste-container"></div>
      </div>

      <!-- Bunnark for mobilfiltre -->
      <div class="tl-bunnark-bakgrunn" id="tl-bakgrunn"></div>
      <div class="tl-bunnark" id="tl-bunnark">
        <div class="tl-bunnark-innhold">
          <h2 class="tl-bunnark-tittel">Filtre</h2>
          <label class="tl-label">År
            ${T.ar}
          </label>
          <label class="tl-label">Stevnetype
            ${T.stevnetype}
          </label>
          <label class="tl-label">Kastemetode
            ${T.kastemetode}
          </label>
          <label class="tl-label">Arrangør
            ${T.arrangor}
          </label>
          <label class="tl-label">Kategori
            ${T.kategori}
          </label>
          <div class="tl-bunnark-knapper">
            <button class="tl-tilbakestill-knapp" id="tl-tilbakestill">Tilbakestill</button>
            <button class="tl-bruk-knapp" id="tl-bruk">Bruk filter</button>
          </div>
        </div>
      </div>
    `;function D(){let e=b(_),t=i.querySelector(`.tl-liste-container`);t.innerHTML=E(e);let n=i.querySelector(`.tl-antall`);n&&(n.textContent=`${e.length} stevner`);let r=v?.profil?.kasterid,a=v?.user.id;return r!=null&&a&&c(t,r,a,y),e}if(D(),S?.profil&&(S.profil.rolle===`admin`||S.profil.rolle===`klubbadmin`)){let e=document.createElement(`div`);e.className=`mb-3 px-2 d-flex gap-2`,e.innerHTML=`<a href="#/stevne/ny" class="btn btn-sm btn-success">+ Nytt stevne</a>`,i.querySelector(`.terminliste`)?.prepend(e)}let O=i.querySelector(`.tl-liste-container`),k=i.querySelector(`#tl-ar`),A=i.querySelector(`#tl-tekst`),j=i.querySelector(`#tl-tekst-mobil`),M=i.querySelector(`#tl-stevnetype`),N=i.querySelector(`#tl-kastemetode`),P=i.querySelector(`#tl-arrangorklubb`),F=i.querySelector(`#tl-kategori`),I=i.querySelector(`#tl-excel-desktop`),L=i.querySelector(`#tl-excel-mobil`),R=i.querySelector(`#tl-filter-aapne`),z=i.querySelector(`#tl-bunnark`),B=i.querySelector(`#tl-bakgrunn`),V=i.querySelector(`#tl-tilbakestill`),H=i.querySelector(`#tl-bruk`),U=i.querySelector(`#tl-ar-mobil`),W=i.querySelector(`#tl-stevnetype-mobil`),G=i.querySelector(`#tl-kastemetode-mobil`),K=i.querySelector(`#tl-arrangorklubb-mobil`),q=i.querySelector(`#tl-kategori-mobil`);O.addEventListener(`click`,e=>{let t=e.target.closest(`[data-kolonne]`);if(!t)return;let n=t.dataset.kolonne;p.kolonne===n?p.retning=p.retning===`asc`?`desc`:`asc`:(p.kolonne=n,p.retning=`asc`),D()});let J=null;window.addEventListener(`resize`,()=>{J!==null&&clearTimeout(J),J=setTimeout(D,200)});async function Y(t){i.querySelector(`.tl-tittel`).textContent=`Terminliste ${g.ar}`,i.querySelector(`.tl-liste-container`).replaceChildren(d(`Laster...`));let{data:n,error:r}=await u(g.ar);return r?(e(t,r),i.querySelector(`.tl-liste-container`).replaceChildren(o(`Feil ved henting.`)),!1):(_=n??[],!0)}k.addEventListener(`change`,async()=>{g.ar=Number(k.value),await Y(`terminliste.arChange`)&&D()}),A.addEventListener(`input`,()=>{g.tekst=A.value,D()}),j.addEventListener(`input`,()=>{g.tekst=j.value,A.value=j.value,D()}),M.addEventListener(`change`,()=>{g.stevnetypeId=M.value,D()}),N.addEventListener(`change`,()=>{g.kastemetodeId=N.value,D()}),P.addEventListener(`change`,()=>{g.klubbId=P.value,D()}),F.addEventListener(`change`,()=>{g.kategoriId=F.value,D()});let X=()=>x(b(_));I.addEventListener(`click`,X),L.addEventListener(`click`,X);function Z(){z.classList.add(`aktiv`),B.classList.add(`aktiv`)}function Q(){z.classList.remove(`aktiv`),B.classList.remove(`aktiv`)}R.addEventListener(`click`,Z),B.addEventListener(`click`,Q),V.addEventListener(`click`,()=>{g.tekst=``,g.stevnetypeId=``,g.kastemetodeId=``,g.klubbId=``,g.kategoriId=``,W.value=``,G.value=``,K.value=``,q.value=``,j.value=``,A.value=``,D()}),H.addEventListener(`click`,async()=>{let e=Number(U.value),t=e!==g.ar;g.ar=e,g.stevnetypeId=W.value,g.kastemetodeId=G.value,g.klubbId=K.value,g.kategoriId=q.value,Q(),!(t&&!await Y(`terminliste.brukFilter`))&&D()})}catch(t){e(`terminliste.render`,t),i.replaceChildren(o(`Kunne ikkje laste terminliste.`))}}export{k as render};