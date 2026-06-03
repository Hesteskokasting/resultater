import{F as e,G as t,J as n,K as r,O as i,Q as a,W as o,i as s,nt as c,x as l}from"./index-DA8gCsLN.js";import{t as u}from"./LoadingState-RVZNML7E.js";import{t as d}from"./buildDropdownOptions-BEXvVorJ.js";var f={kolonne:`dato`,retning:`asc`};function p(e,t){switch(t){case`navn`:return e.navn??``;case`dato`:return e.dato??``;case`sted`:return e.sted??``;case`metode`:return[e.innledende?.navn,e.avsluttende?.navn].filter(e=>!!e).join(` `);case`organizer`:return e.klubb?.navn??``;case`type`:return e.stevnetype?.navn??``;case`klassifisering`:return e.kategori?.navn??``;default:return``}}function m(e){return[...e].sort((e,t)=>{let n=p(e,f.kolonne),r=p(t,f.kolonne),i=n.localeCompare(r,`nb`);return f.retning===`asc`?i:-i})}var h={ar:new Date().getFullYear(),tekst:``,stevnetypeId:``,kastemetodeId:``,klubbId:``,kategoriId:``},g=[],_=null,v=new Set;function y(e){return e.filter(e=>{if(h.tekst){let t=h.tekst.toLowerCase();if(![e.navn,e.sted,e.klubb?.navn,e.stevnetype?.navn,e.kategori?.navn,e.innledende?.navn,e.avsluttende?.navn].some(e=>e?.toLowerCase().includes(t)))return!1}if(h.stevnetypeId&&String(e.stevnetype?.id)!==h.stevnetypeId)return!1;if(h.kastemetodeId){let t=h.kastemetodeId;if(!(String(e.innledende?.id)===t||String(e.avsluttende?.id)===t))return!1}return!(h.klubbId&&String(e.klubb?.id)!==h.klubbId||h.kategoriId&&String(e.kategori?.id)!==h.kategoriId)})}async function b(e){await a(e.map(e=>({Dato:e.dato?new Date(e.dato).toLocaleDateString(`nb-NO`):``,Navn:e.navn??``,Sted:e.sted??``,Arrangør:e.klubb?.navn??``,Stevnetype:e.stevnetype?.navn??``,"Kastemetode (innledende)":e.innledende?.navn??``,"Kastemetode (avsluttende)":e.avsluttende?.navn??``,Kategori:e.kategori?.navn??``,NM:e.ernm?`Ja`:`Nei`,InnbydelseUrl:e.innbydelseurl??``})),`terminliste-${h.ar}.xlsx`,`Terminliste`)}var x=[{id:`navn`,label:`Stevne`},{id:`dato`,label:`Dato`},{id:`sted`,label:`Sted`},{id:`metode`,label:`Metode`},{id:`organizer`,label:`Arrangør`},{id:`type`,label:`Type`},{id:`klassifisering`,label:`Klassifisering`}];function S(e){return f.kolonne===e?f.retning===`asc`?`<span class="tl-sort-ikon aktiv">↑</span>`:`<span class="tl-sort-ikon aktiv">↓</span>`:`<span class="tl-sort-ikon">↕</span>`}function C(e){let t=e.dato?new Date(e.dato+`T12:00:00`).toLocaleDateString(`nb-NO`):``,n=[e.innledende?.navn,e.avsluttende?.navn].filter(e=>!!e).join(` \\ `),r=e.ernm?`<span class="tl-nm-merke">NM</span> `:``,i=e.innbydelseurl?`<a href="${o(e.innbydelseurl)}" target="_blank" rel="noopener" class="tl-innbydelse-ikon" title="Innbydelse">📄</a>`:``;return`<tr class="tl-tr">
    <td><a class="tl-lenkje" href="#/stevne/${e.id}/resultat">${r}${o(e.navn??``)}</a></td>
    <td>${t}</td>
    <td>${o(e.sted??``)}</td>
    <td>${o(n)}</td>
    <td>${o(e.klubb?.navn??``)}</td>
    <td>${o(e.stevnetype?.navn??``)}</td>
    <td>${o(e.kategori?.navn??``)}</td>
    <td>${i}</td>
  </tr>`}function w(e){return e.length===0?`<p class="empty-state">Ingen stevner funnet med valgte filtre.</p>`:`<table class="tl-tabell">${`<thead><tr>
    ${x.map(e=>`<th class="tl-th" data-kolonne="${e.id}">${e.label}${S(e.id)}</th>`).join(``)}
    <th class="tl-th">Innbydelse</th>
  </tr></thead>`}${`<tbody>${m(e).map(C).join(``)}</tbody>`}</table>`}function T(e){return window.innerWidth>600?w(e):D(e)}function E(e){let t=n(e.dato),r=e.sted?`<p class="tl-detalj">Sted: ${o(e.sted)}</p>`:``,i=e.klubb?`<p class="tl-detalj">Arrangør: ${o(e.klubb.navn??``)}</p>`:``,a=e.stevnetype?`<p class="tl-detalj">Type: ${o(e.stevnetype.navn??``)}</p>`:``,s=e.ernm?`<span class="tl-nm-merke">NM</span>`:``,c=e.innbydelseurl?`<a class="tl-innbydelse-lenke" href="${o(e.innbydelseurl)}" target="_blank" rel="noopener">Innbydelse 📄</a>`:``,l=e.resultaturl?`<a class="stevne-lenke" href="#/stevne/${e.id}/resultat">Vis resultat</a>`:``,u=e.dato&&new Date(e.dato+`T12:00:00`)>new Date,d=_?.profil?.rolle,f=_?.profil?.kobling_status===`godkjent`||d===`admin`||d===`klubbadmin`,p=v.has(e.id),m=f?p?`<a class="stevne-lenke" href="#/stevne/${e.id}/pamelding">Påmeldt ✓</a>`:u&&!e.erfullfort?`<a class="stevne-lenke" href="#/stevne/${e.id}/pamelding">Meld meg på</a>`:``:``;return`
    <div class="stevne-kort tl-kort">
      <a class="tl-navn tl-navn-lenke" href="#/stevne/${e.id}/resultat">${s}${o(e.navn??``)}</a>
      <p class="stevne-dato">${t}</p>
      ${r}${i}${a}
      ${c}${l}${m}
    </div>
  `}function D(e){return e.length===0?`<p class="empty-state">Ingen stevner funnet med valgte filtre.</p>`:`<div class="stevne-liste">${e.map(E).join(``)}</div>`}async function O(n){n.replaceChildren(u(`Laster terminliste…`));try{let[{data:a,error:p},{data:m},x]=await Promise.all([e(h.ar),l(),s()]);if(_=x,v=x?.user?await i(x.user.id):new Set,p){c(`terminliste.render`,p),n.replaceChildren(t(`Kunne ikkje laste terminliste.`));return}g=a??[],n.innerHTML=`
      <div class="terminliste">
        <h1 class="tl-tittel">Terminliste ${h.ar}</h1>

        <!-- Desktop-filterrad -->
        <div class="tl-filter-rad">
          <select class="tl-select" id="tl-ar">${r(h.ar,1983,new Date().getFullYear()+1)}</select>
          <input class="tl-input" id="tl-tekst" type="search" placeholder="Søk..." value="${o(h.tekst)}">
          <select class="tl-select" id="tl-stevnetype">${d(m.stevnetyper,h.stevnetypeId,`Alle typer`)}</select>
          <select class="tl-select" id="tl-kastemetode">${d(m.kastemetoder,h.kastemetodeId,`Alle metoder`)}</select>
          <select class="tl-select" id="tl-arrangorklubb">${d(m.klubber,h.klubbId,`Alle arrangører`)}</select>
          <select class="tl-select" id="tl-kategori">${d(m.kategorier,h.kategoriId,`Alle kategorier`)}</select>
          <button class="tl-excel-knapp" id="tl-excel-desktop">⬇ Excel</button>
        </div>

        <!-- Mobil-rad -->
        <div class="tl-mobil-rad">
          <input class="tl-input" id="tl-tekst-mobil" type="search" placeholder="Søk..." value="${o(h.tekst)}">
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
            <select class="tl-select" id="tl-ar-mobil">${r(h.ar,1983,new Date().getFullYear()+1)}</select>
          </label>
          <label class="tl-label">Stevnetype
            <select class="tl-select" id="tl-stevnetype-mobil">${d(m.stevnetyper,h.stevnetypeId,`Alle typer`)}</select>
          </label>
          <label class="tl-label">Kastemetode
            <select class="tl-select" id="tl-kastemetode-mobil">${d(m.kastemetoder,h.kastemetodeId,`Alle metoder`)}</select>
          </label>
          <label class="tl-label">Arrangør
            <select class="tl-select" id="tl-arrangorklubb-mobil">${d(m.klubber,h.klubbId,`Alle arrangører`)}</select>
          </label>
          <label class="tl-label">Kategori
            <select class="tl-select" id="tl-kategori-mobil">${d(m.kategorier,h.kategoriId,`Alle kategorier`)}</select>
          </label>
          <div class="tl-bunnark-knapper">
            <button class="tl-tilbakestill-knapp" id="tl-tilbakestill">Tilbakestill</button>
            <button class="tl-bruk-knapp" id="tl-bruk">Bruk filter</button>
          </div>
        </div>
      </div>
    `;function S(){let e=y(g);n.querySelector(`.tl-liste-container`).innerHTML=T(e);let t=n.querySelector(`.tl-antall`);return t&&(t.textContent=`${e.length} stevner`),e}if(S(),x?.profil&&(x.profil.rolle===`admin`||x.profil.rolle===`klubbadmin`)){let e=document.createElement(`div`);e.className=`mb-3 px-2 d-flex gap-2`,e.innerHTML=`<a href="#/stevne/ny" class="btn btn-sm btn-success">+ Nytt stevne</a>`,n.querySelector(`.terminliste`)?.prepend(e)}let C=n.querySelector(`.tl-liste-container`),w=n.querySelector(`#tl-ar`),E=n.querySelector(`#tl-tekst`),D=n.querySelector(`#tl-tekst-mobil`),O=n.querySelector(`#tl-stevnetype`),k=n.querySelector(`#tl-kastemetode`),A=n.querySelector(`#tl-arrangorklubb`),j=n.querySelector(`#tl-kategori`),M=n.querySelector(`#tl-excel-desktop`),N=n.querySelector(`#tl-excel-mobil`),P=n.querySelector(`#tl-filter-aapne`),F=n.querySelector(`#tl-bunnark`),I=n.querySelector(`#tl-bakgrunn`),L=n.querySelector(`#tl-tilbakestill`),R=n.querySelector(`#tl-bruk`),z=n.querySelector(`#tl-ar-mobil`),B=n.querySelector(`#tl-stevnetype-mobil`),V=n.querySelector(`#tl-kastemetode-mobil`),H=n.querySelector(`#tl-arrangorklubb-mobil`),U=n.querySelector(`#tl-kategori-mobil`);C.addEventListener(`click`,e=>{let t=e.target.closest(`[data-kolonne]`);if(!t)return;let n=t.dataset.kolonne;f.kolonne===n?f.retning=f.retning===`asc`?`desc`:`asc`:(f.kolonne=n,f.retning=`asc`),S()});let W=null;window.addEventListener(`resize`,()=>{W!==null&&clearTimeout(W),W=setTimeout(S,200)}),w.addEventListener(`change`,async()=>{h.ar=Number(w.value),n.querySelector(`.tl-tittel`).textContent=`Terminliste ${h.ar}`,n.querySelector(`.tl-liste-container`).replaceChildren(u(`Laster...`));let{data:r,error:i}=await e(h.ar);if(i){c(`terminliste.arChange`,i),n.querySelector(`.tl-liste-container`).replaceChildren(t(`Feil ved henting.`));return}g=r??[],S()}),E.addEventListener(`input`,()=>{h.tekst=E.value,S()}),D.addEventListener(`input`,()=>{h.tekst=D.value,E.value=D.value,S()}),O.addEventListener(`change`,()=>{h.stevnetypeId=O.value,S()}),k.addEventListener(`change`,()=>{h.kastemetodeId=k.value,S()}),A.addEventListener(`change`,()=>{h.klubbId=A.value,S()}),j.addEventListener(`change`,()=>{h.kategoriId=j.value,S()});let G=()=>b(y(g));M.addEventListener(`click`,G),N.addEventListener(`click`,G);function K(){F.classList.add(`aktiv`),I.classList.add(`aktiv`)}function q(){F.classList.remove(`aktiv`),I.classList.remove(`aktiv`)}P.addEventListener(`click`,K),I.addEventListener(`click`,q),L.addEventListener(`click`,()=>{h.tekst=``,h.stevnetypeId=``,h.kastemetodeId=``,h.klubbId=``,h.kategoriId=``,B.value=``,V.value=``,H.value=``,U.value=``,D.value=``,E.value=``,S()}),R.addEventListener(`click`,async()=>{let r=Number(z.value),i=r!==h.ar;if(h.ar=r,h.stevnetypeId=B.value,h.kastemetodeId=V.value,h.klubbId=H.value,h.kategoriId=U.value,q(),i){n.querySelector(`.tl-tittel`).textContent=`Terminliste ${h.ar}`,n.querySelector(`.tl-liste-container`).replaceChildren(u(`Laster...`));let{data:r,error:i}=await e(h.ar);if(i){c(`terminliste.brukFilter`,i),n.querySelector(`.tl-liste-container`).replaceChildren(t(`Feil ved henting.`));return}g=r??[]}S()})}catch(e){c(`terminliste.render`,e),n.replaceChildren(t(`Kunne ikkje laste terminliste.`))}}export{O as render};