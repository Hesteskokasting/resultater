import{F as e,G as t,J as n,K as r,O as i,Q as a,W as o,i as s,nt as c,x as l}from"./index-D-FxIV0h.js";import{t as u}from"./LoadingState-RVZNML7E.js";import{t as d}from"./buildDropdownOptions-C1Oi-scW.js";var f={kolonne:`dato`,retning:`asc`};function p(e,t){switch(t){case`navn`:return e.navn??``;case`dato`:return e.dato??``;case`sted`:return e.sted??``;case`metode`:return[e.innledende?.navn,e.avsluttende?.navn].filter(e=>!!e).join(` `);case`organizer`:return e.klubb?.navn??``;case`type`:return e.stevnetype?.navn??``;case`klassifisering`:return e.kategori?.navn??``;default:return``}}function m(e){return[...e].sort((e,t)=>{let n=p(e,f.kolonne),r=p(t,f.kolonne),i=n.localeCompare(r,`nb`);return f.retning===`asc`?i:-i})}var h={ar:new Date().getFullYear(),tekst:``,stevnetypeId:``,kastemetodeId:``,klubbId:``,kategoriId:``},g=[],_=null,v=new Set;function y(e){return e.filter(e=>{if(h.tekst){let t=h.tekst.toLowerCase();if(![e.navn,e.sted,e.klubb?.navn,e.stevnetype?.navn,e.kategori?.navn,e.innledende?.navn,e.avsluttende?.navn].some(e=>e?.toLowerCase().includes(t)))return!1}if(h.stevnetypeId&&String(e.stevnetype?.id)!==h.stevnetypeId)return!1;if(h.kastemetodeId){let t=h.kastemetodeId;if(!(String(e.innledende?.id)===t||String(e.avsluttende?.id)===t))return!1}return!(h.klubbId&&String(e.klubb?.id)!==h.klubbId||h.kategoriId&&String(e.kategori?.id)!==h.kategoriId)})}async function b(e){await a(e.map(e=>({Dato:e.dato?new Date(e.dato).toLocaleDateString(`nb-NO`):``,Navn:e.navn??``,Sted:e.sted??``,Arrangør:e.klubb?.navn??``,Stevnetype:e.stevnetype?.navn??``,"Kastemetode (innledende)":e.innledende?.navn??``,"Kastemetode (avsluttende)":e.avsluttende?.navn??``,Kategori:e.kategori?.navn??``,NM:e.ernm?`Ja`:`Nei`,InnbydelseUrl:e.innbydelseurl??``})),`terminliste-${h.ar}.xlsx`,`Terminliste`)}var x=[{id:`navn`,label:`Stevne`},{id:`dato`,label:`Dato`},{id:`sted`,label:`Sted`},{id:`metode`,label:`Metode`},{id:`organizer`,label:`Arrangør`},{id:`type`,label:`Type`},{id:`klassifisering`,label:`Klassifisering`}];function S(e){return f.kolonne===e?f.retning===`asc`?`<span class="tl-sort-ikon aktiv">↑</span>`:`<span class="tl-sort-ikon aktiv">↓</span>`:`<span class="tl-sort-ikon">↕</span>`}function C(e){let t=e.dato?new Date(e.dato+`T12:00:00`).toLocaleDateString(`nb-NO`):``,n=[e.innledende?.navn,e.avsluttende?.navn].filter(e=>!!e).join(` \\ `),r=e.ernm?`<span class="tl-nm-merke">NM</span> `:``,i=e.innbydelseurl?`<a href="${o(e.innbydelseurl)}" target="_blank" rel="noopener" class="tl-innbydelse-ikon" title="Innbydelse">📄</a>`:``;return`<tr class="tl-tr">
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
  `}function D(e){return e.length===0?`<p class="empty-state">Ingen stevner funnet med valgte filtre.</p>`:`<div class="stevne-liste">${e.map(E).join(``)}</div>`}async function O(n){n.replaceChildren(u(`Laster terminliste…`));try{let[{data:a,error:p},{data:m},x]=await Promise.all([e(h.ar),l(),s()]);if(_=x,v=x?.user?await i(x.user.id):new Set,p){c(`terminliste.render`,p),n.replaceChildren(t(`Kunne ikkje laste terminliste.`));return}g=a??[];function S(e){return{ar:`<select class="tl-select" id="tl-ar${e}">${r(h.ar,1983,new Date().getFullYear()+1)}</select>`,stevnetype:`<select class="tl-select" id="tl-stevnetype${e}">${d(m.stevnetyper,h.stevnetypeId,`Alle typer`)}</select>`,kastemetode:`<select class="tl-select" id="tl-kastemetode${e}">${d(m.kastemetoder,h.kastemetodeId,`Alle metoder`)}</select>`,arrangor:`<select class="tl-select" id="tl-arrangorklubb${e}">${d(m.klubber,h.klubbId,`Alle arrangører`)}</select>`,kategori:`<select class="tl-select" id="tl-kategori${e}">${d(m.kategorier,h.kategoriId,`Alle kategorier`)}</select>`}}let C=S(``),w=S(`-mobil`);n.innerHTML=`
      <div class="terminliste">
        <h1 class="tl-tittel">Terminliste ${h.ar}</h1>

        <!-- Desktop-filterrad -->
        <div class="tl-filter-rad">
          ${C.ar}
          <input class="tl-input" id="tl-tekst" type="search" placeholder="Søk..." value="${o(h.tekst)}">
          ${C.stevnetype}
          ${C.kastemetode}
          ${C.arrangor}
          ${C.kategori}
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
            ${w.ar}
          </label>
          <label class="tl-label">Stevnetype
            ${w.stevnetype}
          </label>
          <label class="tl-label">Kastemetode
            ${w.kastemetode}
          </label>
          <label class="tl-label">Arrangør
            ${w.arrangor}
          </label>
          <label class="tl-label">Kategori
            ${w.kategori}
          </label>
          <div class="tl-bunnark-knapper">
            <button class="tl-tilbakestill-knapp" id="tl-tilbakestill">Tilbakestill</button>
            <button class="tl-bruk-knapp" id="tl-bruk">Bruk filter</button>
          </div>
        </div>
      </div>
    `;function E(){let e=y(g);n.querySelector(`.tl-liste-container`).innerHTML=T(e);let t=n.querySelector(`.tl-antall`);return t&&(t.textContent=`${e.length} stevner`),e}if(E(),x?.profil&&(x.profil.rolle===`admin`||x.profil.rolle===`klubbadmin`)){let e=document.createElement(`div`);e.className=`mb-3 px-2 d-flex gap-2`,e.innerHTML=`<a href="#/stevne/ny" class="btn btn-sm btn-success">+ Nytt stevne</a>`,n.querySelector(`.terminliste`)?.prepend(e)}let D=n.querySelector(`.tl-liste-container`),O=n.querySelector(`#tl-ar`),k=n.querySelector(`#tl-tekst`),A=n.querySelector(`#tl-tekst-mobil`),j=n.querySelector(`#tl-stevnetype`),M=n.querySelector(`#tl-kastemetode`),N=n.querySelector(`#tl-arrangorklubb`),P=n.querySelector(`#tl-kategori`),F=n.querySelector(`#tl-excel-desktop`),I=n.querySelector(`#tl-excel-mobil`),L=n.querySelector(`#tl-filter-aapne`),R=n.querySelector(`#tl-bunnark`),z=n.querySelector(`#tl-bakgrunn`),B=n.querySelector(`#tl-tilbakestill`),V=n.querySelector(`#tl-bruk`),H=n.querySelector(`#tl-ar-mobil`),U=n.querySelector(`#tl-stevnetype-mobil`),W=n.querySelector(`#tl-kastemetode-mobil`),G=n.querySelector(`#tl-arrangorklubb-mobil`),K=n.querySelector(`#tl-kategori-mobil`);D.addEventListener(`click`,e=>{let t=e.target.closest(`[data-kolonne]`);if(!t)return;let n=t.dataset.kolonne;f.kolonne===n?f.retning=f.retning===`asc`?`desc`:`asc`:(f.kolonne=n,f.retning=`asc`),E()});let q=null;window.addEventListener(`resize`,()=>{q!==null&&clearTimeout(q),q=setTimeout(E,200)});async function J(r){n.querySelector(`.tl-tittel`).textContent=`Terminliste ${h.ar}`,n.querySelector(`.tl-liste-container`).replaceChildren(u(`Laster...`));let{data:i,error:a}=await e(h.ar);return a?(c(r,a),n.querySelector(`.tl-liste-container`).replaceChildren(t(`Feil ved henting.`)),!1):(g=i??[],!0)}O.addEventListener(`change`,async()=>{h.ar=Number(O.value),await J(`terminliste.arChange`)&&E()}),k.addEventListener(`input`,()=>{h.tekst=k.value,E()}),A.addEventListener(`input`,()=>{h.tekst=A.value,k.value=A.value,E()}),j.addEventListener(`change`,()=>{h.stevnetypeId=j.value,E()}),M.addEventListener(`change`,()=>{h.kastemetodeId=M.value,E()}),N.addEventListener(`change`,()=>{h.klubbId=N.value,E()}),P.addEventListener(`change`,()=>{h.kategoriId=P.value,E()});let Y=()=>b(y(g));F.addEventListener(`click`,Y),I.addEventListener(`click`,Y);function X(){R.classList.add(`aktiv`),z.classList.add(`aktiv`)}function Z(){R.classList.remove(`aktiv`),z.classList.remove(`aktiv`)}L.addEventListener(`click`,X),z.addEventListener(`click`,Z),B.addEventListener(`click`,()=>{h.tekst=``,h.stevnetypeId=``,h.kastemetodeId=``,h.klubbId=``,h.kategoriId=``,U.value=``,W.value=``,G.value=``,K.value=``,A.value=``,k.value=``,E()}),V.addEventListener(`click`,async()=>{let e=Number(H.value),t=e!==h.ar;h.ar=e,h.stevnetypeId=U.value,h.kastemetodeId=W.value,h.klubbId=G.value,h.kategoriId=K.value,Z(),!(t&&!await J(`terminliste.brukFilter`))&&E()})}catch(e){c(`terminliste.render`,e),n.replaceChildren(t(`Kunne ikkje laste terminliste.`))}}export{O as render};