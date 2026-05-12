import{t as e}from"./vendor-3yxEHqvy.js";import{n as t,t as n}from"./xlsx-C8px7JeE.js";import{n as r,t as i}from"./charts-BaCXx3P-.js";(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var a=e(`https://urtvpewjlevhlevtnvkf.supabase.co`,`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVydHZwZXdqbGV2aGxldnRudmtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0MTA2NDgsImV4cCI6MjA5MDk4NjY0OH0.0kCozO-eFJKZ19uU8F2HOHRcUsJD7HAVpVBl6sKoVbU`);function o(e){return[e?.fornavn,e?.etternavn].filter(Boolean).join(` `)}function s(e){return(e??``).toLowerCase().replace(/[æä]/g,`ae`).replace(/[øö]/g,`o`).replace(/å/g,`a`).replace(/[^a-z0-9]+/g,`-`).replace(/^-|-$/g,``)}function c(e){return`${e.id}-`+s(`${e.etternavn??``}-${e.fornavn??``}`)}function l(e){return`${e.id}-`+s(e.navn??``)}var u=[`NC`,`SNC`,`DNC`];function d(e){if(e==null)return`–`;let t=Number(e);return Number.isInteger(t)?String(t):t.toFixed(1)}async function f(e){let{data:t,error:n}=await a.from(`antallTellendeNc`).select(`*`).eq(`year`,e).maybeSingle();return{data:t,error:n}}async function p(e){let{data:t,error:n}=await a.from(`stevne`).select(`id, navn, dato, stevnetype:stevnetypeid(id, navn)`).gte(`dato`,`${e}-01-01`).lte(`dato`,`${e}-12-31`);if(n)return{stevner:[],resultater:[],error:n};let r=(t??[]).filter(e=>u.includes(e.stevnetype?.navn)),i=r.map(e=>e.id);if(i.length===0)return{stevner:r,resultater:[],error:null};let{data:o,error:s}=await a.from(`resultat`).select(`
      id, nc_poeng, plassering, kasterid, klubbid, klasseid, stevneid,
      kaster:kasterid(id, fornavn, etternavn),
      klubb:klubbid(id, navn),
      klasse:klasseid(id, navn)
    `).in(`stevneid`,i).not(`nc_poeng`,`is`,null).gt(`nc_poeng`,0);return{stevner:r,resultater:o??[],error:s}}function m(e){let t=new Map;for(let n of e)t.set(n.id,{navn:n.navn,dato:n.dato,typeNavn:n.stevnetype?.navn??``});return t}function h(e){return[...e].sort((e,t)=>t.nc_poeng-e.nc_poeng)}function g(e,t,n){let r=[],i=[],a=[];for(let t of e){let e=n.get(t.stevneid)?.typeNavn??``;e===`NC`?r.push(t):e===`SNC`?i.push(t):e===`DNC`&&a.push(t)}let o=h(r).slice(0,t.max_nc_total),s=h(i).slice(0,t.max_snc_total),c=t.max_dnc_total>0?t.max_dnc_total:1/0,l=h(a).slice(0,c);return h([...o,...s,...l]).slice(0,t.maxtotal)}function _(e,t,n){return h(e.filter(e=>n.get(e.stevneid)?.typeNavn===`SNC`)).slice(0,t.max_snc)}function v(e,t,n){return h(e.filter(e=>n.get(e.stevneid)?.typeNavn===`DNC`)).slice(0,t.max_dnc)}function y(e){return e===`SNC`?_:e===`DNC`?v:g}function b(e,t){let n=1;for(let r=0;r<e.length;r++)r>0&&e[r][t]<e[r-1][t]&&(n=r+1),e[r].plassering=n}function x(e,t,n,r,i){let a=m(t),s=y(r),c=i===1?`Klasse 1`:`Klasse 2`,l=e.filter(e=>e.klasse?.navn===c),u=new Map;for(let e of l)u.has(e.kasterid)||u.set(e.kasterid,{kaster:e.kaster,rader:[]}),u.get(e.kasterid).rader.push(e);let d=[];for(let[,e]of u){let t=s(e.rader,n,a),r=t.reduce((e,t)=>e+t.nc_poeng,0),i=[...new Set(t.map(e=>e.klubb?.navn).filter(Boolean))],c=t.map(e=>({...e,_stevne:a.get(e.stevneid)})).sort((e,t)=>(e._stevne?.dato??``).localeCompare(t._stevne?.dato??``));d.push({navn:o(e.kaster),klubb:i.join(` / `),totalPoeng:r,detaljRader:c})}return d.sort((e,t)=>t.totalPoeng-e.totalPoeng||e.navn.localeCompare(t.navn)),b(d,`totalPoeng`),d}function S(e,t,n){let r=m(t),i=e.filter(e=>e.klasse?.navn===`Klasse 1`),a=new Map;for(let e of i)a.has(e.kasterid)||a.set(e.kasterid,{kaster:e.kaster,rader:[]}),a.get(e.kasterid).rader.push(e);let o=new Map,s=new Map;for(let[,e]of a){let t=g(e.rader,n,r),i=new Map;for(let e of t)e.klubb&&!s.has(e.klubbid)&&s.set(e.klubbid,e.klubb),i.set(e.klubbid,(i.get(e.klubbid)??0)+e.nc_poeng);for(let[t,n]of i)o.set(`${e.kaster.id}_${t}`,{kaster:e.kaster,klubbId:t,sum:n})}let c=new Map;for(let[,e]of o)c.has(e.klubbId)||c.set(e.klubbId,{klubb:s.get(e.klubbId),bidragsytere:[]}),c.get(e.klubbId).bidragsytere.push(e);let l=[];for(let[,e]of c){e.bidragsytere.sort((e,t)=>t.sum-e.sum);let t=e.bidragsytere.slice(0,4);l.push({klubb:e.klubb,lagTotal:t.reduce((e,t)=>e+t.sum,0),bidragsytere:t})}return l.sort((e,t)=>t.lagTotal-e.lagTotal),b(l,`lagTotal`),l}var C=new Intl.DateTimeFormat(`nb-NO`,{day:`2-digit`,month:`2-digit`,year:`numeric`}),w=new Intl.DateTimeFormat(`nb-NO`,{day:`numeric`,month:`numeric`,year:`numeric`}),ee=new Intl.DateTimeFormat(`nb-NO`,{weekday:`long`,day:`numeric`,month:`long`,year:`numeric`});function te(e){return e.length===10?new Date(e+`T12:00:00`):new Date(e)}function T(e){return e?C.format(te(e)):``}function E(e){return e?w.format(te(e)):``}function D(e){return e?ee.format(te(e)):``}function ne(e){return e?e.slice(0,5):``}function re(e,r,i=`Data`){if(!window.XLSX){alert(`SheetJS ikkje lasta`);return}let a=n.json_to_sheet(e),o=n.book_new();n.book_append_sheet(o,a,i),t(o,r)}function ie(e,t,n=new Date().getFullYear()){let r=``;for(let i=n;i>=t;i--)r+=`<option value="${i}"${i===e?` selected`:``}>${i}</option>`;return r}function ae(){return new Date().toISOString().slice(0,10)}async function oe(){let{data:e,error:t}=await a.from(`stevne`).select(`id, navn, dato`).lt(`dato`,ae()).order(`dato`,{ascending:!1}).limit(5);return{data:e??[],error:t}}async function se(){let{data:e,error:t}=await a.from(`stevne`).select(`id, navn, stevne_fase`).in(`stevne_fase`,[`innledende`,`avsluttende`]).order(`dato`,{ascending:!0});return{data:e??[],error:t}}async function ce(){let{data:e,error:t}=await a.from(`stevne`).select(`id, navn, dato, innbydelseurl`).gte(`dato`,ae()).order(`dato`,{ascending:!0}).limit(5);return{data:e??[],error:t}}function le(e){return e.length===0?`<p class="nc-ingen">Ingen data.</p>`:`
    <table class="nc-tabell">
      <thead class="nc-thead">
        <tr>
          <th class="nc-td-pl">Pl.</th>
          <th>Navn</th>
          <th>Klubb</th>
          <th class="nc-td-poeng">Poeng</th>
        </tr>
      </thead>
      <tbody>${e.slice(0,20).map(e=>`
    <tr>
      <td class="nc-td-pl">${e.plassering}</td>
      <td>${e.navn}</td>
      <td>${e.klubb}</td>
      <td class="nc-td-poeng">${d(e.totalPoeng)}</td>
    </tr>`).join(``)}</tbody>
    </table>`}function ue(e){let t=e.stevne_fase===`avsluttende`?`avsluttende`:`innledende`;return`
    <a class="live-kort" href="#/stevne/${e.id}/live/${t}">
      <span class="live-prikk"></span>
      <span>LIVE: ${e.navn}</span>
    </a>`}function de(e){return`
    <div class="stevne-kort">
      <p class="stevne-dato">${D(e.dato)}</p>
      <p class="stevne-navn">${e.navn}</p>
      <a class="stevne-lenke" href="#/resultat/${e.id}">Vis resultat</a>
    </div>`}function fe(e){let t=e.innbydelseurl?`<a class="stevne-lenke" href="${e.innbydelseurl}" target="_blank" rel="noopener">Innbydelse &#128196;</a>`:`<span class="stevne-lenke-inaktiv">Innbydelse er ikke klar</span>`;return`
    <div class="stevne-kort">
      <p class="stevne-dato">${D(e.dato)}</p>
      <a class="stevne-navn" href="#/resultat/${e.id}">${e.navn}</a>
      ${t}
      
    </div>`}async function pe(e){let t=new Date().getFullYear();e.innerHTML=`<p class="laster">Laster...</p>`;let[{data:n,error:r},{data:i,error:a},{data:o,error:s},{stevner:c,resultater:l,error:u},{data:d}]=await Promise.all([oe(),ce(),f(t),p(t),se()]);if(r||a||s||u){e.innerHTML=`<p class="feil">Kunne ikkje laste framsida.</p>`;return}let m=o?x(l,c,o,`NC`,1):[];e.innerHTML=`
    <div class="heimeside">
      ${d.length?`<div class="live-banner">${d.map(ue).join(``)}</div>`:``}
      <div class="heimeside-grid">
        <section class="heimeside-nc">
          <h2 class="heimeside-seksjon-tittel">Norgescupen Klasse 1 - Topp 20</h2>
          ${le(m)}
          <a class="heimeside-meir-lenke" href="#/norgescupen">Til detaljert liste</a>
        </section>
        <section class="heimeside-resultater">
          <h2 class="heimeside-seksjon-tittel">Siste resultater</h2>
          <div class="stevne-liste">${n.map(de).join(``)}</div>
          <a class="heimeside-meir-lenke" href="#/terminliste">Vis terminliste</a>
        </section>
        <section class="heimeside-kommende">
          <h2 class="heimeside-seksjon-tittel">Kommende konkurranser</h2>
          <div class="stevne-liste">${i.map(fe).join(``)}</div>
          <a class="heimeside-meir-lenke" href="#/terminliste">Vis terminliste</a>
        </section>
      </div>
    </div>`}var me=null;async function he(){if(me)return me;let{data:{session:e}}=await a.auth.getSession();if(!e)return null;let{data:t}=await a.from(`bruker_profil`).select(`rolle, kasterid, kobling_status, kobling_kasterid`).eq(`id`,e.user.id).maybeSingle(),n=[];if(t?.rolle===`klubbadmin`){let{data:t}=await a.from(`klubbadmin_klubber`).select(`klubbid`).eq(`bruker_id`,e.user.id);n=(t??[]).map(e=>e.klubbid)}return me={user:e.user,profil:t??null,klubber:n},me}async function O(){return he()}async function ge(){return(await he())?.profil?.rolle??null}async function _e(){return await ge()===`admin`}async function ve(e=null){let t=await he();return!t||t.profil?.rolle!==`klubbadmin`?!1:e===null?!0:t.klubber.includes(Number(e))}async function ye(){me=null,await a.auth.signOut()}a.auth.onAuthStateChange(e=>{(e===`SIGNED_OUT`||e===`SIGNED_IN`||e===`TOKEN_REFRESHED`)&&(me=null),document.dispatchEvent(new CustomEvent(`authStateChanged`,{detail:e}))});async function be(e){let{data:t,error:n}=await a.from(`stevne`).select(`
      id, navn, sted, dato, erfullfort, resultaturl, juryleder,
      stevnetype:stevnetypeid(navn),
      kategori:kategoriid(navn),
      kontakt:kontaktkasterid(fornavn, etternavn),
      innledende:innledendekastemetodeid(navn),
      avsluttende:avsluttendekastemetodeid(navn)
    `).eq(`id`,e).single();return{data:t,error:n}}async function xe(e){let{data:t,error:n}=await a.from(`resultat`).select(`
      plassering, nc_poeng,
      kaster:kasterid(fornavn, etternavn),
      klubb:klubbid(navn),
      klasse:klasseid(navn),
      gruppe:gruppeid(navn)
    `).eq(`stevneid`,e).order(`plassering`);return{data:t,error:n}}function Se(e,t){let n=new Map;for(let r of e){let e=r.gruppe?.navn??`–`,i=r.klasse?.navn,a=t?`${i??``}|${e}`:e,o=t?`${i?i+` `:``}${e}`:e;n.has(a)||n.set(a,{label:o,rader:[]}),n.get(a).rader.push(r)}return[...n.values()].sort((e,t)=>e.label.localeCompare(t.label,`nb`))}function Ce(e,t){return[e?.navn,t?.navn].filter(Boolean).join(` \\ `)}function we(e){return e?`${e.fornavn??``} ${e.etternavn??``}`.trim():`–`}function Te(e){let t=e.rader.map(e=>`
    <div class="res-rad">
      <span class="res-pl">${e.plassering??`–`}.</span>
      <div class="res-info">
        <span class="res-navn">${we(e.kaster)}</span>
        <span class="res-klubb">${e.klubb?.navn??`–`}</span>
      </div>
    </div>
  `).join(``);return`
    <div class="res-gruppe">
      <h2 class="res-gruppe-tittel">${e.label}</h2>
      <div class="res-gruppe-rader">${t}</div>
    </div>
  `}function Ee(e){let t=e.rader.map(e=>`
    <tr>
      <td class="res-td-pl">${e.plassering??`–`}</td>
      <td class="res-td-navn"><a href="#" class="res-kaster-lenke">${we(e.kaster)}</a></td>
      <td class="res-td-klubb">${e.klubb?.navn??`–`}</td>
      <td class="res-td-nc">${e.nc_poeng==null?``:e.nc_poeng}</td>
    </tr>
  `).join(``);return`
    <div class="res-tabell-seksjon">
      <table class="res-tabell">
        <thead>
          <tr class="res-thead-gruppe">
            <td colspan="4" class="res-td-gruppe-header">${e.label}</td>
          </tr>
          <tr class="res-thead-kolonner">
            <th class="res-td-pl">Pl</th>
            <th class="res-td-navn">NAVN</th>
            <th class="res-td-klubb">KLUBB</th>
            <th class="res-td-nc">NC</th>
          </tr>
        </thead>
        <tbody>${t}</tbody>
      </table>
    </div>
  `}async function De(e,t){let n=t?.id??``;e.innerHTML=`<p class="laster">Laster resultat...</p>`;let[{data:r,error:i},{data:a,error:o}]=await Promise.all([be(n),xe(n)]);if(i||!r){e.innerHTML=`<p class="feil">Kunne ikke laste stevne.</p>`;return}if(o){e.innerHTML=`<p class="feil">Kunne ikke laste resultater.</p>`;return}let s=(r.dato?new Date(r.dato+`T12:00:00`).getFullYear():9999)<2026,c=Se(a??[],s),l=(a??[]).length,u=r.kontakt?we(r.kontakt):null,d=r.resultaturl?`<a class="res-pdf-lenke" href="${r.resultaturl}" target="_blank" rel="noopener">Resultat som pdf 📄</a>`:``,f=Ce(r.innledende,r.avsluttende),p=[r.stevnetype?.navn,r.kategori?.navn].filter(Boolean).join(` `);e.innerHTML=`
    <div class="res-side">

      <!-- Mobil-header (skjult på desktop) -->
      <div class="res-mobil-blokk">
        ${`
    <div class="res-mobil-info">
      <h1 class="res-tittel">${r.navn}</h1>
      <p class="res-dato-sted">${D(r.dato)}${r.sted?`, `+r.sted:``}</p>
      ${f?`<p class="res-klassifisering">${f}</p>`:``}
      ${p?`<p class="res-klassifisering">${p}</p>`:``}
      ${u?`<p class="res-klassifisering">Kontaktperson: ${u}</p>`:``}
    </div>
  `}
      </div>

      <!-- Desktop-infotabell (skjult på mobil) -->
      <div class="res-desktop-blokk">
        ${`
    <table class="res-info-tabell">
      <tbody>
        <tr>
          <td class="res-info-label">Stevne</td>
          <td class="res-info-verdi">${r.navn}</td>
          <td class="res-info-label">Sted</td>
          <td class="res-info-verdi res-sted-verdi">${r.sted??``}</td>
          <td class="res-info-label">Dato</td>
          <td class="res-info-verdi">${D(r.dato)}</td>
        </tr>
        <tr>
          <td class="res-info-label">Kastemetode</td>
          <td class="res-info-verdi">${f}</td>
          <td class="res-info-label">Type/Kategori</td>
          <td class="res-info-verdi">${p}</td>
          <td class="res-info-label">Kontaktperson</td>
          <td class="res-info-verdi">${u??``}</td>
        </tr>
        ${r.juryleder?`
        <tr>
          <td class="res-info-label"></td><td></td><td></td><td></td>
          <td class="res-info-label">Juryleder</td>
          <td class="res-info-verdi">${r.juryleder}</td>
        </tr>`:``}
      </tbody>
    </table>
  `}
      </div>

      <!-- Felles: PDF-lenke og antall -->
      <div class="res-felles">
        ${d}
        <p class="res-antall"><strong>Antall deltakere: ${l}</strong></p>
      </div>

      <!-- Mobil-resultater -->
      <div class="res-mobil-blokk">
        ${c.map(Te).join(``)}
      </div>

      <!-- Desktop-resultater -->
      <div class="res-desktop-blokk">
        ${c.map(Ee).join(``)}
      </div>

    </div>
  `,O().then(t=>{if(!t?.profil)return;let i=e.querySelector(`.res-felles`);if(i){if(t.profil.rolle===`admin`||t.profil.rolle===`klubbadmin`&&t.klubber.includes(r.klubbid)){let e=document.createElement(`div`);e.className=`mb-2 d-flex gap-2 flex-wrap`,e.innerHTML=`
        <a href="#/stevne/${n}/organizer" class="btn btn-sm btn-warning">Administrer stevne</a>
        <a href="#/stevne/${n}/pamelding" class="btn btn-sm btn-outline-info">Vis påmeldingar</a>`,i.prepend(e)}else if(t.profil.kobling_status===`godkjent`&&!r.erfullfort){let e=document.createElement(`div`);e.className=`mb-2`,e.innerHTML=`<a href="#/stevne/${n}/pamelding" class="btn btn-sm btn-primary">Meld meg på</a>`,i.prepend(e)}}})}async function Oe(e){return a.from(`stevne`).select(`
      id, navn, sted, dato, tid, ernm, erfullfort, innbydelseurl, resultaturl,
      klubb:klubbid(id, navn),
      stevnetype:stevnetypeid(id, navn),
      innledende:kastemetode!innledendekastemetodeid(id, navn),
      avsluttende:kastemetode!avsluttendekastemetodeid(id, navn),
      kategori:kategoriid(id, navn)
    `).gte(`dato`,`${e}-01-01`).lte(`dato`,`${e}-12-31`).order(`dato`)}async function ke(){let[e,t,n,r]=await Promise.all([a.from(`stevnetype`).select(`id, navn`).order(`navn`),a.from(`kastemetode`).select(`id, navn`).order(`navn`),a.from(`klubb`).select(`id, navn`).order(`navn`),a.from(`kategori`).select(`id, navn`).order(`navn`)]);return{stevnetyper:e.data??[],kastemetoder:t.data??[],klubber:n.data??[],kategorier:r.data??[]}}async function Ae(e){let{data:t}=await a.from(`pamelding`).select(`stevneid`).eq(`bruker_id`,e);return new Set((t??[]).map(e=>e.stevneid))}var k={kolonne:`dato`,retning:`asc`};function je(e,t){switch(t){case`navn`:return e.navn??``;case`dato`:return e.dato??``;case`sted`:return e.sted??``;case`metode`:return[e.innledende?.navn,e.avsluttende?.navn].filter(Boolean).join(` `);case`arrangør`:return e.klubb?.navn??``;case`type`:return e.stevnetype?.navn??``;case`klassifisering`:return e.kategori?.navn??``;default:return``}}function Me(e){return[...e].sort((e,t)=>{let n=je(e,k.kolonne),r=je(t,k.kolonne),i=n.localeCompare(r,`nb`);return k.retning===`asc`?i:-i})}var A={ar:new Date().getFullYear(),tekst:``,stevnetypeId:``,kastemetodeId:``,klubbId:``,kategoriId:``},Ne=[],Pe=null,Fe=new Set;function Ie(e){return e.filter(e=>{if(A.tekst){let t=A.tekst.toLowerCase();if(![e.navn,e.sted,e.klubb?.navn,e.stevnetype?.navn,e.kategori?.navn,e.innledende?.navn,e.avsluttende?.navn].some(e=>e?.toLowerCase().includes(t)))return!1}if(A.stevnetypeId&&String(e.stevnetype?.id)!==A.stevnetypeId)return!1;if(A.kastemetodeId){let t=A.kastemetodeId;if(!(String(e.innledende?.id)===t||String(e.avsluttende?.id)===t))return!1}return!(A.klubbId&&String(e.klubb?.id)!==A.klubbId||A.kategoriId&&String(e.kategori?.id)!==A.kategoriId)})}function Le(e){re(e.map(e=>({Dato:e.dato?new Date(e.dato).toLocaleDateString(`nb-NO`):``,Navn:e.navn??``,Sted:e.sted??``,Arrangør:e.klubb?.navn??``,Stevnetype:e.stevnetype?.navn??``,"Kastemetode (innledende)":e.innledende?.navn??``,"Kastemetode (avsluttende)":e.avsluttende?.navn??``,Kategori:e.kategori?.navn??``,NM:e.ernm?`Ja`:`Nei`,InnbydelseUrl:e.innbydelseurl??``})),`terminliste-${A.ar}.xlsx`,`Terminliste`)}function j(e,t,n){let r=`<option value="">${n}</option>`;for(let n of e)r+=`<option value="${n.id}" ${String(n.id)===String(t)?`selected`:``}>${n.navn??n.klubbnavn}</option>`;return r}var Re=[{id:`navn`,label:`Stevne`},{id:`dato`,label:`Dato`},{id:`sted`,label:`Sted`},{id:`metode`,label:`Metode`},{id:`arrangør`,label:`Arrangør`},{id:`type`,label:`Type`},{id:`klassifisering`,label:`Klassifisering`}];function ze(e){return k.kolonne===e?k.retning===`asc`?`<span class="tl-sort-ikon aktiv">↑</span>`:`<span class="tl-sort-ikon aktiv">↓</span>`:`<span class="tl-sort-ikon">↕</span>`}function Be(e){let t=e.dato?new Date(e.dato+`T12:00:00`).toLocaleDateString(`nb-NO`):``,n=[e.innledende?.navn,e.avsluttende?.navn].filter(Boolean).join(` \\ `),r=e.ernm?`<span class="tl-nm-merke">NM</span> `:``,i=e.innbydelseurl?`<a href="${e.innbydelseurl}" target="_blank" rel="noopener" class="tl-innbydelse-ikon" title="Innbydelse">📄</a>`:``;return`<tr class="tl-tr">
    <td><a class="tl-lenkje" href="#/resultat/${e.id}">${r}${e.navn??``}</a></td>
    <td>${t}</td>
    <td>${e.sted??``}</td>
    <td>${n}</td>
    <td>${e.klubb?.navn??``}</td>
    <td>${e.stevnetype?.navn??``}</td>
    <td>${e.kategori?.navn??``}</td>
    <td>${i}</td>
  </tr>`}function Ve(e){return e.length===0?`<p class="laster">Ingen stevner funnet med valgte filtre.</p>`:`<table class="tl-tabell">${`<thead><tr>
    ${Re.map(e=>`<th class="tl-th" data-kolonne="${e.id}">${e.label}${ze(e.id)}</th>`).join(``)}
    <th class="tl-th">Innbydelse</th>
  </tr></thead>`}${`<tbody>${Me(e).map(Be).join(``)}</tbody>`}</table>`}function He(e){return window.innerWidth>600?Ve(e):We(e)}function Ue(e){let t=D(e.dato),n=e.sted?`<p class="tl-detalj">Sted: ${e.sted}</p>`:``,r=e.klubb?`<p class="tl-detalj">Arrangør: ${e.klubb.navn}</p>`:``,i=e.stevnetype?`<p class="tl-detalj">Type: ${e.stevnetype.navn}</p>`:``,a=e.ernm?`<span class="tl-nm-merke">NM</span>`:``,o=e.innbydelseurl?`<a class="tl-innbydelse-lenke" href="${e.innbydelseurl}" target="_blank" rel="noopener">Innbydelse 📄</a>`:``,s=e.resultaturl?`<a class="stevne-lenke" href="#/resultat/${e.id}">Vis resultat</a>`:``,c=e.dato&&new Date(e.dato+`T12:00:00`)>new Date,l=Pe?.profil?.rolle,u=Pe?.profil?.kobling_status===`godkjent`||l===`admin`||l===`klubbadmin`,d=Fe.has(e.id),f=u?d?`<a class="stevne-lenke" href="#/stevne/${e.id}/pamelding">Påmeldt ✓</a>`:c&&!e.erfullfort?`<a class="stevne-lenke" href="#/stevne/${e.id}/pamelding">Meld meg på</a>`:``:``;return`
    <div class="stevne-kort tl-kort">
      <a class="tl-navn tl-navn-lenke" href="#/resultat/${e.id}">${a}${e.navn}</a>
      <p class="stevne-dato">${t}</p>
      ${n}${r}${i}
      ${o}${s}${f}
    </div>
  `}function We(e){return e.length===0?`<p class="laster">Ingen stevner funnet med valgte filtre.</p>`:`<div class="stevne-liste">${e.map(Ue).join(``)}</div>`}async function Ge(e){e.innerHTML=`<p class="laster">Laster terminliste...</p>`;let[{data:t,error:n},r,i]=await Promise.all([Oe(A.ar),ke(),O()]);if(Pe=i,Fe=i?.user?await Ae(i.user.id):new Set,n){e.innerHTML=`<p class="feil">Kunne ikke laste terminliste.</p>`;return}Ne=t??[];function a(){let t=Ie(Ne);e.querySelector(`.tl-liste-container`).innerHTML=He(t);let n=e.querySelector(`.tl-antall`);return n&&(n.textContent=`${t.length} stevner`),t}e.innerHTML=`
    <div class="terminliste">
      <h1 class="tl-tittel">Terminliste ${A.ar}</h1>

      <!-- Desktop-filterrad -->
      <div class="tl-filter-rad">
        <select class="tl-select" id="tl-ar">${ie(A.ar,1983,new Date().getFullYear()+1)}</select>
        <input class="tl-input" id="tl-tekst" type="search" placeholder="Søk..." value="${A.tekst}">
        <select class="tl-select" id="tl-stevnetype">${j(r.stevnetyper,A.stevnetypeId,`Alle typer`)}</select>
        <select class="tl-select" id="tl-kastemetode">${j(r.kastemetoder,A.kastemetodeId,`Alle metoder`)}</select>
        <select class="tl-select" id="tl-arrangorklubb">${j(r.klubber,A.klubbId,`Alle arrangører`)}</select>
        <select class="tl-select" id="tl-kategori">${j(r.kategorier,A.kategoriId,`Alle kategorier`)}</select>
        <button class="tl-excel-knapp" id="tl-excel-desktop">⬇ Excel</button>
      </div>

      <!-- Mobil-rad -->
      <div class="tl-mobil-rad">
        <input class="tl-input" id="tl-tekst-mobil" type="search" placeholder="Søk..." value="${A.tekst}">
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
          <select class="tl-select" id="tl-ar-mobil">${ie(A.ar,1983,new Date().getFullYear()+1)}</select>
        </label>
        <label class="tl-label">Stevnetype
          <select class="tl-select" id="tl-stevnetype-mobil">${j(r.stevnetyper,A.stevnetypeId,`Alle typer`)}</select>
        </label>
        <label class="tl-label">Kastemetode
          <select class="tl-select" id="tl-kastemetode-mobil">${j(r.kastemetoder,A.kastemetodeId,`Alle metoder`)}</select>
        </label>
        <label class="tl-label">Arrangør
          <select class="tl-select" id="tl-arrangorklubb-mobil">${j(r.klubber,A.klubbId,`Alle arrangører`)}</select>
        </label>
        <label class="tl-label">Kategori
          <select class="tl-select" id="tl-kategori-mobil">${j(r.kategorier,A.kategoriId,`Alle kategorier`)}</select>
        </label>
        <div class="tl-bunnark-knapper">
          <button class="tl-tilbakestill-knapp" id="tl-tilbakestill">Tilbakestill</button>
          <button class="tl-bruk-knapp" id="tl-bruk">Bruk filter</button>
        </div>
      </div>
    </div>
  `,a(),e.querySelector(`.tl-liste-container`).addEventListener(`click`,e=>{let t=e.target.closest(`[data-kolonne]`);if(!t)return;let n=t.dataset.kolonne;k.kolonne===n?k.retning=k.retning===`asc`?`desc`:`asc`:(k.kolonne=n,k.retning=`asc`),a()});let o;window.addEventListener(`resize`,()=>{clearTimeout(o),o=setTimeout(a,200)}),O().then(t=>{if(!t?.profil||t.profil.rolle!==`admin`&&t.profil.rolle!==`klubbadmin`)return;let n=document.createElement(`div`);n.className=`mb-3 px-2 d-flex gap-2`,n.innerHTML=`<a href="#/stevne/ny" class="btn btn-sm btn-success">+ Nytt stevne</a>`,e.querySelector(`.terminliste`)?.prepend(n)}),e.querySelector(`#tl-ar`).addEventListener(`change`,async t=>{A.ar=Number(t.target.value),e.querySelector(`.tl-tittel`).textContent=`Terminliste ${A.ar}`,e.querySelector(`.tl-liste-container`).innerHTML=`<p class="laster">Laster...</p>`;let{data:n,error:r}=await Oe(A.ar);if(r){e.querySelector(`.tl-liste-container`).innerHTML=`<p class="feil">Feil ved henting.</p>`;return}Ne=n??[],a()}),e.querySelector(`#tl-tekst`).addEventListener(`input`,e=>{A.tekst=e.target.value,a()}),e.querySelector(`#tl-tekst-mobil`).addEventListener(`input`,t=>{A.tekst=t.target.value;let n=e.querySelector(`#tl-tekst`);n&&(n.value=t.target.value),a()}),e.querySelector(`#tl-stevnetype`).addEventListener(`change`,e=>{A.stevnetypeId=e.target.value,a()}),e.querySelector(`#tl-kastemetode`).addEventListener(`change`,e=>{A.kastemetodeId=e.target.value,a()}),e.querySelector(`#tl-arrangorklubb`).addEventListener(`change`,e=>{A.klubbId=e.target.value,a()}),e.querySelector(`#tl-kategori`).addEventListener(`change`,e=>{A.kategoriId=e.target.value,a()});let s=()=>Le(Ie(Ne));e.querySelector(`#tl-excel-desktop`).addEventListener(`click`,s),document.querySelector(`#tl-excel-mobil`).addEventListener(`click`,s);let c=document.querySelector(`#tl-bunnark`),l=document.querySelector(`#tl-bakgrunn`);function u(){c.classList.add(`aktiv`),l.classList.add(`aktiv`)}function d(){c.classList.remove(`aktiv`),l.classList.remove(`aktiv`)}document.querySelector(`#tl-filter-aapne`).addEventListener(`click`,u),l.addEventListener(`click`,d),document.querySelector(`#tl-tilbakestill`).addEventListener(`click`,()=>{A.tekst=``,A.stevnetypeId=``,A.kastemetodeId=``,A.klubbId=``,A.kategoriId=``,[`#tl-stevnetype-mobil`,`#tl-kastemetode-mobil`,`#tl-arrangorklubb-mobil`,`#tl-kategori-mobil`].forEach(e=>{let t=document.querySelector(e);t&&(t.value=``)}),document.querySelector(`#tl-tekst-mobil`).value=``;let t=e.querySelector(`#tl-tekst`);t&&(t.value=``),a()}),document.querySelector(`#tl-bruk`).addEventListener(`click`,async()=>{let t=Number(document.querySelector(`#tl-ar-mobil`).value),n=t!==A.ar;if(A.ar=t,A.stevnetypeId=document.querySelector(`#tl-stevnetype-mobil`).value,A.kastemetodeId=document.querySelector(`#tl-kastemetode-mobil`).value,A.klubbId=document.querySelector(`#tl-arrangorklubb-mobil`).value,A.kategoriId=document.querySelector(`#tl-kategori-mobil`).value,d(),n){e.querySelector(`.tl-tittel`).textContent=`Terminliste ${A.ar}`,e.querySelector(`.tl-liste-container`).innerHTML=`<p class="laster">Laster...</p>`;let{data:t,error:n}=await Oe(A.ar);if(n){e.querySelector(`.tl-liste-container`).innerHTML=`<p class="feil">Feil ved henting.</p>`;return}Ne=t??[]}a()})}var Ke=2007,qe=2024,M={ar:new Date().getFullYear(),cupType:`NC`,klasse:1,visning:`singel`},N={ar:null,regler:null,stevner:[],resultater:[]};async function Je(e){if(N.ar===e)return null;let[{data:t,error:n},{stevner:r,resultater:i,error:a}]=await Promise.all([f(e),p(e)]);return n||a?n||a:(N.ar=e,N.regler=t,N.stevner=r,N.resultater=i,null)}function Ye(e,t){return e?t===`SNC`?`Dei ${e.max_snc} beste SNC-stevna er teljande`:t===`DNC`?`Dei ${e.max_dnc} beste DNC-stevna er teljande`:`Dei ${e.maxtotal} beste stevna, herav maks ${e.max_nc_total} NC-stevner og ${e.max_snc_total} SNC-stevner er teljande`:``}function Xe(e){return`
    <div class="nc-klasse-tabs" style="margin-bottom:12px">
      <button class="nc-klasse-tab${e===`singel`?` aktiv`:``}" data-visning="singel">Singel</button>
      <button class="nc-klasse-tab${e===`lag`?` aktiv`:``}" data-visning="lag">Lag</button>
    </div>`}function Ze(e,t){return`
    <div class="nc-klasse-tabs-wrapper">
      <div class="nc-klasse-tabs">
        <button class="nc-klasse-tab${e===1?` aktiv`:``}" data-klasse="1">Klasse 1</button>
        ${t<=2025?`<button class="nc-klasse-tab${e===2?` aktiv`:``}" data-klasse="2">Klasse 2</button>`:``}
      </div>
      <span class="nc-klikk-hint">Klikk poengsum for å vise detaljer</span>
    </div>`}function Qe(e){return e.length===0?`<p class="nc-ingen">Ingen resultater funnet.</p>`:`
    <table class="nc-tabell">
      <thead class="nc-thead">
        <tr>
          <th class="nc-td-pl">Pl.</th>
          <th>Navn</th>
          <th>Klubb</th>
          <th class="nc-td-poeng">Poeng</th>
        </tr>
      </thead>
      <tbody>${e.map((e,t)=>{let n=e.detaljRader.map(e=>`
      <tr>
        <td>${T(e._stevne?.dato)}</td>
        <td>${e._stevne?.typeNavn??`–`}</td>
        <td>${e._stevne?.navn??`–`}</td>
        <td>${e.plassering??`–`}</td>
        <td>${d(e.nc_poeng)}</td>
      </tr>`).join(``);return`
      <tr class="nc-singel-rad">
        <td class="nc-td-pl">${e.plassering}</td>
        <td>${e.navn}</td>
        <td>${e.klubb}</td>
        <td class="nc-td-poeng nc-poeng-celle" data-idx="${t}">${d(e.totalPoeng)}<span class="nc-chevron"> ▼</span></td>
      </tr>
      <tr class="nc-detalj-rad" data-idx="${t}" style="display:none">
        <td colspan="4">
          <table class="nc-detalj-tabell">
            <thead><tr><th>Dato</th><th>Type</th><th>Stevne</th><th>Pl.</th><th>Poeng</th></tr></thead>
            <tbody>${n}</tbody>
          </table>
        </td>
      </tr>`}).join(``)}</tbody>
    </table>`}function $e(e){return e.length===0?`<p class="nc-ingen">Ingen lag funnet.</p>`:`
    <table class="nc-tabell">
      <thead class="nc-thead">
        <tr>
          <th class="nc-td-pl">Pl.</th>
          <th>Klubb</th>
          <th class="nc-td-poeng">Poeng</th>
        </tr>
      </thead>
      <tbody>${e.map((e,t)=>{let n=e.bidragsytere.map(e=>`<tr><td>${o(e.kaster)}</td><td class="nc-td-poeng">${d(e.sum)}</td></tr>`).join(``);return`
      <tr class="nc-lag-rad">
        <td class="nc-td-pl">${e.plassering}</td>
        <td>${e.klubb?.navn??`–`}</td>
        <td class="nc-td-poeng nc-lag-poeng-celle" data-lag-idx="${t}">${d(e.lagTotal)}<span class="nc-chevron"> ▼</span></td>
      </tr>
      <tr class="nc-lag-detalj-rad" data-lag-idx="${t}" style="display:none">
        <td colspan="3">
          <table class="nc-detalj-tabell">
            <tbody>${n}</tbody>
          </table>
        </td>
      </tr>`}).join(``)}</tbody>
    </table>`}function et(e,t){return`
    <div class="nc-side">
      <h1 class="nc-hovudtittel">Norgescupen ${e}</h1>
      <div class="nc-filter-rad">
        <select id="nc-ar" class="tl-select">${ie(e,Ke)}</select>
        <select id="nc-cuptype" class="tl-select"${e<qe?` style="display:none"`:``}>
          <option value="NC"${t===`NC`?` selected`:``}>NC</option>
          <option value="SNC"${t===`SNC`?` selected`:``}>SNC</option>
          <option value="DNC"${t===`DNC`?` selected`:``}>DNC (Uoffisiell)</option>
        </select>
      </div>
      <div id="nc-visning-tabs-container"></div>
      <div id="nc-content"></div>
    </div>`}async function tt(e){if(M.ar=new Date().getFullYear(),M.cupType=`NC`,M.klasse=1,M.visning=`singel`,N={ar:null,regler:null,stevner:[],resultater:[]},e.innerHTML=`<p class="laster">Laster Norgescupen...</p>`,await Je(M.ar)){e.innerHTML=`<p class="feil">Kunne ikkje laste data for Norgescupen.</p>`;return}e.innerHTML=et(M.ar,M.cupType);function t(){let{ar:n,cupType:r,klasse:i,visning:a}=M,{regler:o}=N,s=e.querySelector(`#nc-content`);if(e.querySelector(`.nc-hovudtittel`).textContent=`Norgescupen ${n}`,e.querySelector(`#nc-cuptype`).style.display=n>=qe?``:`none`,e.querySelector(`#nc-visning-tabs-container`).innerHTML=r===`NC`?Xe(a):``,a===`lag`&&r===`NC`)if(s.innerHTML=`
        <section>
          <h2 class="nc-seksjon-tittel">NC Lag ${n} (Kun klasse 1)</h2>
          <p class="nc-beskriving">Dei 4 beste poengsummene frå kvar klubb.</p>
          <div class="nc-klikk-hint" style="text-align:right;margin-bottom:4px">Klikk poengsum for å vise detaljar</div>
          <div id="nc-lag-tabell-container"></div>
        </section>`,!o)s.querySelector(`#nc-lag-tabell-container`).innerHTML=`<p class="nc-ingen">Ingen data.</p>`;else{let e=S(N.resultater,N.stevner,o);s.querySelector(`#nc-lag-tabell-container`).innerHTML=$e(e),s.querySelector(`#nc-lag-tabell-container`).addEventListener(`click`,e=>{let t=e.target.closest(`.nc-lag-poeng-celle`);if(!t)return;let n=t.dataset.lagIdx,r=s.querySelector(`.nc-lag-detalj-rad[data-lag-idx="${n}"]`);if(!r)return;let i=r.style.display===`none`;r.style.display=i?``:`none`,t.querySelector(`.nc-chevron`).textContent=i?` ▲`:` ▼`})}else{if(s.innerHTML=`
        <section id="nc-singel-seksjon">
          <h2 class="nc-seksjon-tittel">${r} Singel ${n} - Klasse ${i}</h2>
          <p class="nc-beskriving">${o?Ye(o,r):`Ingen telleregel funnet for ${n}`}</p>
          <div id="nc-klasse-tabs-container">${Ze(i,n)}</div>
          <div id="nc-singel-tabell-container"></div>
        </section>`,!o)s.querySelector(`#nc-singel-tabell-container`).innerHTML=`<p class="nc-ingen">Ingen data.</p>`;else{let e=x(N.resultater,N.stevner,o,r,i);s.querySelector(`#nc-singel-tabell-container`).innerHTML=Qe(e),s.querySelector(`#nc-singel-tabell-container`).addEventListener(`click`,e=>{let t=e.target.closest(`.nc-poeng-celle`);if(!t)return;let n=t.dataset.idx,r=s.querySelector(`.nc-detalj-rad[data-idx="${n}"]`);if(!r)return;let i=r.style.display===`none`;r.style.display=i?``:`none`,t.querySelector(`.nc-chevron`).textContent=i?` ▲`:` ▼`})}s.querySelector(`#nc-singel-seksjon`).addEventListener(`click`,e=>{let n=e.target.closest(`[data-klasse]`);n&&(M.klasse=Number(n.dataset.klasse),t())})}}t(),e.querySelector(`#nc-ar`).addEventListener(`change`,async n=>{if(M.ar=Number(n.target.value),M.klasse=1,M.ar<qe&&(M.cupType=`NC`,M.visning=`singel`,e.querySelector(`#nc-cuptype`).value=`NC`),e.querySelector(`#nc-content`).innerHTML=`<p class="laster">Laster...</p>`,await Je(M.ar)){e.querySelector(`#nc-content`).innerHTML=`<p class="feil">Feil ved henting av data.</p>`;return}t()}),e.querySelector(`#nc-cuptype`).addEventListener(`change`,e=>{M.cupType=e.target.value,M.klasse=1,M.cupType!==`NC`&&(M.visning=`singel`),t()}),e.querySelector(`#nc-visning-tabs-container`).addEventListener(`click`,e=>{let n=e.target.closest(`[data-visning]`);n&&(M.visning=n.dataset.visning,t())})}var nt=2018,rt=5,P={ar:new Date().getFullYear(),sokeTekst:``,infoSynleg:!0},F={ar:null,stevner:[],resultater:[]},it=new Intl.NumberFormat(`nb-NO`,{minimumFractionDigits:2,maximumFractionDigits:2});function at(e){return e==null?`–`:it.format(e)+` %`}function ot(e){return[e?.fornavn,e?.etternavn].filter(Boolean).join(` `)}function st(e,t){let n=(t?.innledMetode??``).toLowerCase(),r=(t?.avslMetode??``).toLowerCase(),i=e=>n===e||r===e,a=[];return e.antall_ring_xkast!=null&&(i(`minimatch`)?a.push({prosent:e.antall_ring_xkast/60*100,metodeNavn:`Minimatch`,antallRing:e.antall_ring_xkast}):i(`halvmatch`)?a.push({prosent:e.antall_ring_xkast,metodeNavn:`Halvmatch`,antallRing:e.antall_ring_xkast}):i(`heilmatch`)&&a.push({prosent:e.antall_ring_xkast/200*100,metodeNavn:`Heilmatch`,antallRing:e.antall_ring_xkast})),e.antall_ring_kongelag!=null&&a.push({prosent:e.antall_ring_kongelag/40*100,metodeNavn:`Kongelag`,antallRing:e.antall_ring_kongelag}),a}async function ct(e){let{data:t,error:n}=await a.from(`stevne`).select(`id, navn, dato, stevnetype:stevnetypeid(id, navn), innledendekastemetode:innledendekastemetodeid(navn), avsluttendekastemetode:avsluttendekastemetodeid(navn)`).eq(`ernorgesranking`,!0).gte(`dato`,`${e}-01-01`).lte(`dato`,`${e}-12-31`);if(n)return{stevner:[],resultater:[],error:n};let r=t??[],i=r.map(e=>e.id);if(i.length===0)return{stevner:r,resultater:[],error:null};let{data:o,error:s}=await a.from(`resultat`).select(`
      id, kasterid, klubbid, stevneid,
      antall_ring_xkast, antall_ring_kongelag,
      kaster:kasterid(id, fornavn, etternavn),
      klubb:klubbid(id, navn)
    `).in(`stevneid`,i);return s?{stevner:r,resultater:[],error:s}:{stevner:r,resultater:(o??[]).filter(e=>e.antall_ring_xkast!=null||e.antall_ring_kongelag!=null),error:null}}async function lt(e){if(F.ar===e)return null;let{stevner:t,resultater:n,error:r}=await ct(e);return r||(F.ar=e,F.stevner=t,F.resultater=n,null)}function ut(){let e=new Map;for(let t of F.stevner)e.set(t.id,{navn:t.navn,dato:t.dato,typeNavn:t.stevnetype?.navn??``,innledMetode:t.innledendekastemetode?.navn??null,avslMetode:t.avsluttendekastemetode?.navn??null});return e}function dt(e){let t=1;for(let n=0;n<e.length;n++)n>0&&e[n].snittProsent<e[n-1].snittProsent&&(t=n+1),e[n].plassering=t}function ft(e,t){let n=new Map;for(let r of e){let e=st(r,t.get(r.stevneid));if(!e.length)continue;n.has(r.kasterid)||n.set(r.kasterid,{kaster:r.kaster,klubb:r.klubb,rader:[]});let i=t.get(r.stevneid);for(let t of e)n.get(r.kasterid).rader.push({...t,stevneid:r.stevneid,_stevne:i})}let r=[],i=[];for(let[,e]of n){let{rader:t}=e,n=[...t].sort((e,t)=>t.prosent-e.prosent),a=n.slice(0,rt),o=Math.round(a.reduce((e,t)=>e+t.prosent,0)/a.length*100)/100,s=t.length,c=s>=rt,l={navn:ot(e.kaster),klubb:e.klubb?.navn??`–`,antallStevner:s,snittProsent:o,erGyldig:c,detaljRader:n};c?r.push(l):i.push(l)}return r.sort((e,t)=>t.snittProsent-e.snittProsent||e.navn.localeCompare(t.navn)),i.sort((e,t)=>t.snittProsent-e.snittProsent||e.navn.localeCompare(t.navn)),dt(r),[...r,...i]}function pt(){let e=ut();re(ft(F.resultater,e).map(e=>({Plass:e.erGyldig?e.plassering:`–`,Kaster:e.navn,Klubb:e.klubb,"Snitt %":e.snittProsent,"Antal stevner":e.antallStevner})),`norgesranking-${P.ar}.xlsx`,`Norgesranking`)}function mt(e){return`
    <div id="nr-info-seksjon"${e?``:` style="display:none"`}>
      <p style="text-align:center;margin-bottom:4px">
        Norgesranking er ein konkurranse som pågår innanfor eit kalenderår, dvs. 1. januar – 31. desember.
        <strong>Dei ${rt} beste prosentane er teljande.</strong>
      </p>
      <p style="text-align:center;margin-bottom:4px">
        For å få eit gyldig årsresultat skal kasteren minst ha vore gjennom ${rt} rankingrunder.
      </p>
      <p style="text-align:center;color:#dc3545;margin-bottom:0">
        Resultater merket med rødt er ikkje gyldig (mindre enn ${rt} runder).
      </p>
    </div>`}function ht(e,t){let n=t.trim().toLowerCase(),r=n?e.filter(e=>e.navn.toLowerCase().includes(n)||e.klubb.toLowerCase().includes(n)):e;return r.length===0?`<p class="nc-ingen">Ingen resultater funnet.</p>`:`
    <table class="nc-tabell">
      <thead class="nc-thead">
        <tr>
          <th class="nc-td-pl">Pl.</th>
          <th>Navn</th>
          <th>Klubb</th>
          <th style="text-align:center">Stevner</th>
          <th class="nc-td-poeng">%Snitt</th>
        </tr>
      </thead>
      <tbody>${r.map((e,t)=>{let n=e.detaljRader.map(e=>`
      <tr>
        <td>${T(e._stevne?.dato)}</td>
        <td>${e._stevne?.typeNavn??`–`}</td>
        <td>${e._stevne?.navn??`–`}</td>
        <td>${e.metodeNavn}</td>
        <td>${e.antallRing}</td>
        <td>${at(e.prosent)}</td>
      </tr>`).join(``);return`
      <tr class="nc-singel-rad"${e.erGyldig?``:` style="color:#dc3545"`}>
        <td class="nc-td-pl">${e.erGyldig?e.plassering:`–`}</td>
        <td>${e.navn}</td>
        <td>${e.klubb}</td>
        <td style="text-align:center">${e.antallStevner}</td>
        <td class="nc-td-poeng nc-poeng-celle" style="white-space:nowrap" data-idx="${t}">${at(e.snittProsent)}<span class="nc-chevron"> ▼</span></td>
      </tr>
      <tr class="nc-detalj-rad" data-idx="${t}" style="display:none">
        <td colspan="5">
          <table class="nc-detalj-tabell">
            <thead><tr><th>Dato</th><th>Type</th><th>Stevne</th><th>Metode</th><th>Ring</th><th>%Ring</th></tr></thead>
            <tbody>${n}</tbody>
          </table>
        </td>
      </tr>`}).join(``)}</tbody>
    </table>`}function gt(e){return`
    <div class="nc-side">
      <h1 class="nc-hovudtittel">Norgesranking ${e}</h1>
      <div style="text-align:center;margin-bottom:8px">
        <button id="nr-info-knapp" class="btn btn-sm btn-outline-secondary">Vis info</button>
      </div>
      <hr>
      ${mt(!1)}
      <hr>
      <div class="nc-filter-rad" style="margin-bottom:12px">
        <select id="nr-ar" class="tl-select">${ie(e,nt)}</select>
        <input id="nr-sok" type="text" class="tl-select" placeholder="Søk på navn/klubb..." value="">
        <button class="tl-excel-knapp" id="nr-excel">⬇ Excel</button>
      </div>
      <div style="text-align:right;margin-bottom:4px">
        <span class="nc-klikk-hint">Klikk prosent for å vise detaljer</span>
      </div>
      <div id="nr-tabell-container"></div>
    </div>`}async function _t(e){if(P.ar=new Date().getFullYear(),P.sokeTekst=``,P.infoSynleg=!0,F={ar:null,stevner:[],resultater:[]},e.innerHTML=`<p class="laster">Laster Norgesranking...</p>`,await lt(P.ar)){e.innerHTML=`<p class="feil">Kunne ikkje laste data for Norgesranking.</p>`;return}e.innerHTML=gt(P.ar);function t(){let t=ut(),n=ft(F.resultater,t),r=e.querySelector(`#nr-tabell-container`);r.innerHTML=`<div id="nr-tabell-inner">${ht(n,P.sokeTekst)}</div>`;let i=r.querySelector(`#nr-tabell-inner`);i.addEventListener(`click`,e=>{let t=e.target.closest(`.nc-poeng-celle`);if(!t)return;let n=t.dataset.idx,r=i.querySelector(`.nc-detalj-rad[data-idx="${n}"]`);if(!r)return;let a=r.style.display===`none`;r.style.display=a?``:`none`,t.querySelector(`.nc-chevron`).textContent=a?` ▲`:` ▼`})}t(),e.querySelector(`#nr-ar`).addEventListener(`change`,async n=>{if(P.ar=Number(n.target.value),P.sokeTekst=``,e.querySelector(`#nr-sok`).value=``,e.querySelector(`.nc-hovudtittel`).textContent=`Norgesranking ${P.ar}`,e.querySelector(`#nr-tabell-container`).innerHTML=`<p class="laster">Laster...</p>`,await lt(P.ar)){e.querySelector(`#nr-tabell-container`).innerHTML=`<p class="feil">Feil ved henting av data.</p>`;return}t()}),e.querySelector(`#nr-sok`).addEventListener(`input`,e=>{P.sokeTekst=e.target.value,t()}),e.querySelector(`#nr-excel`).addEventListener(`click`,pt),e.querySelector(`#nr-info-knapp`).addEventListener(`click`,()=>{P.infoSynleg=!P.infoSynleg,e.querySelector(`#nr-info-seksjon`).style.display=P.infoSynleg?``:`none`,e.querySelector(`#nr-info-knapp`).textContent=P.infoSynleg?`Skjul info`:`Vis info`})}i.register(...r);var vt=24,yt=`https://placehold.co/200x200/444/888?text=?`,bt=2017,xt={kongelag:40,minimatch:60,halvmatch:100,heilmatch:200},I={visAlle:!1,sokeTekst:``,side:1},L={aktiv:`resultater`,ar:`alle`,stevnetype:`alle`,grafMetrikk:`plassering`,grafMetode:`kongelag`,grafFra:null,grafTil:null},St=null,Ct=null,wt=new Map,Tt=null,Et=new Intl.NumberFormat(`nb-NO`,{minimumFractionDigits:2,maximumFractionDigits:2});function Dt(e){return e==null?`–`:Et.format(e)+` %`}function Ot(e){return e?parseInt(e.substring(0,4)):null}function kt(e){return e.length?Math.round(e.reduce((e,t)=>e+t,0)/e.length):null}function At(){Tt&&=(Tt.destroy(),null)}async function jt(e){if(e&&St)return St;if(!e&&Ct)return Ct;let t=a.from(`kaster`).select(`id, fornavn, etternavn, eraktiv, avatarurl, klubb:klubbid(id, navn)`).order(`etternavn`).order(`fornavn`);e&&(t=t.eq(`eraktiv`,!0));let{data:n,error:r}=await t,i={data:n??[],error:r};return e?St=i:Ct=i,i}async function Mt(e){if(wt.has(e))return wt.get(e);let[t,n]=await Promise.all([a.from(`kaster`).select(`id, fornavn, etternavn, eraktiv, avatarurl, medlemsnummer, klubb:klubbid(id, navn), klasse:klasseid(id, navn)`).eq(`id`,e).single(),a.from(`resultat`).select(`
        id, plassering,
        poeng_kongelag, poeng_xkast,
        antall_ring_kongelag, antall_ring_xkast,
        klubb:klubbid(id, navn),
        stevne:stevneid(id, navn, dato, stevnetype:stevnetypeid(id, navn), kategori:kategoriid(id, navn), innledendekastemetode:innledendekastemetodeid(navn), avsluttendekastemetode:avsluttendekastemetodeid(navn))
      `).eq(`kasterid`,e)]),r={kaster:t.data,resultater:(n.data??[]).filter(e=>e.stevne?.dato).sort((e,t)=>t.stevne.dato.localeCompare(e.stevne.dato)),error:t.error||n.error};return wt.set(e,r),r}function Nt(e,t){let n=(e.stevne?.innledendekastemetode?.navn??``).toLowerCase(),r=(e.stevne?.avsluttendekastemetode?.navn??``).toLowerCase();return n===t||r===t}function Pt(e){return[{label:`Kongelag`,rader:e.filter(e=>e.poeng_kongelag!=null),poengFn:e=>e.poeng_kongelag,ringFn:e=>e.antall_ring_kongelag,maxRing:xt.kongelag},{label:`Minimatch`,rader:e.filter(e=>e.poeng_xkast!=null&&Nt(e,`minimatch`)),poengFn:e=>e.poeng_xkast,ringFn:e=>e.antall_ring_xkast,maxRing:xt.minimatch},{label:`Halvmatch`,rader:e.filter(e=>e.poeng_xkast!=null&&Nt(e,`halvmatch`)),poengFn:e=>e.poeng_xkast,ringFn:e=>e.antall_ring_xkast,maxRing:xt.halvmatch},{label:`Heilmatch`,rader:e.filter(e=>e.poeng_xkast!=null&&Nt(e,`heilmatch`)),poengFn:e=>e.poeng_xkast,ringFn:e=>e.antall_ring_xkast,maxRing:xt.heilmatch}].map(({label:e,rader:t,poengFn:n,ringFn:r,maxRing:i})=>{let a=t.length?Math.max(...t.map(e=>n(e))):null,o=kt(t.map(e=>n(e))),s=t.filter(e=>r(e)!=null&&Ot(e.stevne?.dato)>=bt);return{label:e,rekord:a,snittPoeng:o,snittProsent:s.length?Math.round(s.reduce((e,t)=>e+r(t)/i*100,0)/s.length*100)/100:null}})}function Ft(e,t){let n=new Map;for(let r of e)r.klubb?.id&&r.klubb.id!==t&&n.set(r.klubb.id,r.klubb.navn);return[...n.values()]}function It(e,t,n){return t===`plassering`?e.plassering??null:n===`kongelag`?e.antall_ring_kongelag==null?null:Math.round(e.antall_ring_kongelag/xt.kongelag*1e4)/100:Nt(e,n)?e.antall_ring_xkast==null?null:Math.round(e.antall_ring_xkast/xt[n]*1e4)/100:null}function Lt(e,t,n,r,i){let a=[...e].filter(e=>{let a=Ot(e.stevne?.dato);return r&&a<r||i&&a>i?!1:It(e,t,n)!=null}).sort((e,t)=>e.stevne.dato.localeCompare(t.stevne.dato));return{labels:a.map(e=>T(e.stevne.dato)),stevneNamn:a.map(e=>e.stevne.navn),verdiar:a.map(e=>It(e,t,n))}}function Rt(e){let t=`#/kastere/${c(e)}`,n=e.avatarurl||yt,r=o(e);return`
    <a href="${t}" class="kaster-kort">
      <img src="${n}" alt="${r}" loading="lazy">
      <div class="kaster-namn">${r}</div>
      <div class="kaster-klubb">${e.klubb?.navn??`–`}</div>
    </a>`}function zt(){return`
    <div class="nc-side">
      <div class="kaster-liste-kontroller">
        <div class="nc-filter-rad">
          <input id="kaster-sok" type="search" class="tl-select" placeholder="Søk på navn/klubb" value="">
        </div>
        <div style="margin-top:8px">
          <label class="kaster-checkbox-label">
            <input type="checkbox" id="kaster-berre-aktive" checked>
            Vis bare aktive utøvere
          </label>
        </div>
      </div>
      <div id="kaster-sideinfo" style="margin:8px 0"></div>
      <div id="kaster-paginering-topp"></div>
      <div id="kaster-grid" class="kaster-grid"></div>
      <div id="kaster-paginering-botn"></div>
    </div>`}function Bt(e,t){if(t<=1)return``;let n=(t,n,r)=>`<button class="btn btn-sm ${n===e?`btn-primary`:`btn-outline-secondary`} pag-knapp"
      data-side="${n}" ${r?`disabled`:``}>${t}</button>`;return`
    <div class="kaster-paginering">
      ${n(`«`,1,e===1)}
      ${n(`‹`,e-1,e===1)}
      <span class="pag-info">side ${e} av ${t}</span>
      ${n(`›`,e+1,e===t)}
      ${n(`»`,t,e===t)}
    </div>`}function Vt(e,t){let n=o(e),r=e.medlemsnummer?` ${e.medlemsnummer}`:``,i=[...new Set(t.map(e=>Ot(e.stevne?.dato)).filter(Boolean))].sort((e,t)=>t-e),a=[...new Map(t.map(e=>e.stevne?.stevnetype).filter(Boolean).map(e=>[e.id,e.navn])).entries()].sort((e,t)=>e[1].localeCompare(t[1]));return`
    <div class="nc-side">
      <div style="margin-bottom:12px">
        <a href="#/kastere" class="btn btn-sm btn-outline-secondary">← Tilbake</a>
      </div>
      <h1 style="font-size:1.8rem;font-weight:bold;margin-bottom:4px;line-height:1.2">${n}${r}</h1>
      <p style="font-size:1.1rem;color:#aaa;margin-bottom:12px">${e.klubb?.navn??`–`}</p>

      <div class="kaster-tab-rad">
        <button class="btn btn-sm kaster-tab-knapp${L.aktiv===`resultater`?` active`:``}" data-tab="resultater">Resultater</button>
        <button class="btn btn-sm kaster-tab-knapp${L.aktiv===`statistikk`?` active`:``}" data-tab="statistikk">Statistikk</button>
        <button class="btn btn-sm kaster-tab-knapp${L.aktiv===`graf`?` active`:``}" data-tab="graf">Vis graf</button>
      </div>
      <hr>

      <div id="kd-tab-resultater" class="kd-tab${L.aktiv===`resultater`?``:` kd-skjult`}">
        <div class="nc-filter-rad" style="margin-bottom:10px">
          <select id="kd-ar" class="tl-select">
            <option value="alle">Velg årstall</option>
            ${i.map(e=>`<option value="${e}"${L.ar==e?` selected`:``}>${e}</option>`).join(``)}
          </select>
          <select id="kd-type" class="tl-select">
            <option value="alle">Alle stevnetyper</option>
            ${a.map(([e,t])=>`<option value="${e}">${t}</option>`).join(``)}
          </select>
        </div>
        <div id="kd-resultat-tabell"></div>
      </div>

      <div id="kd-tab-statistikk" class="kd-tab${L.aktiv===`statistikk`?``:` kd-skjult`}">
        <div id="kd-stat-innhald"></div>
      </div>

      <div id="kd-tab-graf" class="kd-tab${L.aktiv===`graf`?``:` kd-skjult`}">
        <div class="nc-filter-rad" style="margin-bottom:10px;flex-wrap:wrap;gap:8px">
          <select id="kd-graf-metrikk" class="tl-select">
            <option value="plassering"${L.grafMetrikk===`plassering`?` selected`:``}>Plassering</option>
            <option value="prosent"${L.grafMetrikk===`prosent`?` selected`:``}>% Ring (fra 2017)</option>
          </select>
          <select id="kd-graf-metode" class="tl-select"${L.grafMetrikk===`prosent`?``:` style="display:none"`}>
            <option value="kongelag"${L.grafMetode===`kongelag`?` selected`:``}>Kongelag</option>
            <option value="minimatch"${L.grafMetode===`minimatch`?` selected`:``}>Minimatch</option>
            <option value="halvmatch"${L.grafMetode===`halvmatch`?` selected`:``}>Halvmatch</option>
            <option value="heilmatch"${L.grafMetode===`heilmatch`?` selected`:``}>Heilmatch</option>
          </select>
          <select id="kd-graf-fra" class="tl-select">
            <option value="">Fra år</option>
            ${i.map(e=>`<option value="${e}"${L.grafFra==e?` selected`:``}>${e}</option>`).join(``)}
          </select>
          <select id="kd-graf-til" class="tl-select">
            <option value="">Til år</option>
            ${i.map(e=>`<option value="${e}"${L.grafTil==e?` selected`:``}>${e}</option>`).join(``)}
          </select>
        </div>
        <div style="position:relative;height:320px">
          <canvas id="kd-graf-canvas"></canvas>
        </div>
      </div>
    </div>`}function Ht(e,t,n){let r=e;t!==`alle`&&(r=r.filter(e=>Ot(e.stevne?.dato)==t)),n!==`alle`&&(r=r.filter(e=>String(e.stevne?.stevnetype?.id)===String(n)));let i=r.length,a=`
    <div style="display:flex;justify-content:space-between;margin-bottom:6px">
      <span>Antall: <strong>${i}</strong></span>
      <span style="color:#aaa;font-size:0.85em">Antall ringer i parentes (fra ${bt})</span>
    </div>`;if(!i)return a+`<p class="nc-ingen">Ingen resultater funnet.</p>`;let o=(e,t)=>e==null?``:t==null?`${e}`:`${e} (${t})`;return a+`
    <div style="overflow-x:auto">
      <table class="nc-tabell">
        <thead class="nc-thead">
          <tr>
            <th>Dato</th><th>Stevne</th><th>Type</th><th>Klubb</th>
            <th>Pl.</th><th>Kongelag</th><th>X-kast</th>
          </tr>
        </thead>
        <tbody>${r.map(e=>{let t=e.stevne,n=t?.id?`<a href="#/resultat/${t.id}" class="tl-lenkje">${t.navn}</a>`:t?.navn??`–`;return`
      <tr>
        <td style="white-space:nowrap">${T(t?.dato)}</td>
        <td>${n}</td>
        <td>${t?.stevnetype?.navn??`–`}</td>
        <td>${e.klubb?.navn??`–`}</td>
        <td style="text-align:center;font-weight:bold">${e.plassering??`–`}</td>
        <td style="text-align:center">${o(e.poeng_kongelag,e.antall_ring_kongelag)}</td>
        <td style="text-align:center">${o(e.poeng_xkast,e.antall_ring_xkast)}</td>
      </tr>`}).join(``)}</tbody>
      </table>
    </div>`}function Ut(e,t){let n=Pt(e),r=Ft(e,t.klubb?.id);return`
    <div style="display:flex;flex-wrap:wrap;gap:32px;align-items:flex-start">
      <div>
        <h4>Statistikk</h4>
        <table class="nc-tabell">
          <thead class="nc-thead">
            <tr>
              <th></th><th>Rekord</th><th>Snitt Poeng</th><th>% Ring (fra ${bt})</th>
            </tr>
          </thead>
          <tbody>${n.map(({label:e,rekord:t,snittPoeng:n,snittProsent:r})=>`
    <tr>
      <td>${e}</td>
      <td style="text-align:center">${t??`–`}</td>
      <td style="text-align:center">${n??`–`}</td>
      <td style="text-align:center">${r==null?`–`:Dt(r)}</td>
    </tr>`).join(``)}</tbody>
        </table>
      </div>
      ${r.length?`<div style="margin-top:20px">
        <h4 style="color:#6ba4d4">Tidligere klubber</h4>
        <ul style="list-style:none;padding:0;margin:0">${r.map(e=>`<li>${e}</li>`).join(``)}</ul>
      </div>`:``}
    </div>`}function Wt(e,t){At();let{labels:n,stevneNamn:r,verdiar:a}=Lt(t,L.grafMetrikk,L.grafMetode,L.grafFra?Number(L.grafFra):null,L.grafTil?Number(L.grafTil):null);if(!a.length){e.parentElement.innerHTML=`<p class="nc-ingen" style="padding-top:20px">Ingen data for valt filter.</p>`;return}let o=L.grafMetrikk===`plassering`,s=o?`Plassering`:`% Ring`;Tt=new i(e,{type:`line`,data:{labels:n,datasets:[{label:s,data:a,borderColor:`#4e8fc7`,backgroundColor:`rgba(78,143,199,0.15)`,pointBackgroundColor:`#4e8fc7`,pointRadius:4,tension:.1,fill:!1}]},options:{responsive:!0,maintainAspectRatio:!1,scales:{x:{ticks:{maxTicksLimit:14,maxRotation:45,color:`#ccc`},grid:{color:`rgba(255,255,255,0.08)`}},y:{reverse:o,ticks:{color:`#ccc`},grid:{color:`rgba(255,255,255,0.08)`},title:{display:!0,text:s,color:`#ccc`}}},plugins:{legend:{display:!1},tooltip:{callbacks:{title:e=>r[e[0].dataIndex]??n[e[0].dataIndex],label:e=>`${s}: ${e.raw}`}}}}})}async function Gt(e){I.side=1,e.innerHTML=`<p class="laster">Laster utøvere...</p>`;let t=await jt(!0);if(t.error){e.innerHTML=`<p class="feil">Kunne ikkje laste utøvere.</p>`;return}let n=t.data;e.innerHTML=zt();function r(){let t=I.sokeTekst.trim().toLowerCase(),r=n;t&&(r=r.filter(e=>o(e).toLowerCase().includes(t)||(e.klubb?.navn??``).toLowerCase().includes(t)));let i=r.length,a=Math.max(1,Math.ceil(i/vt));I.side>a&&(I.side=1);let s=(I.side-1)*vt,c=r.slice(s,s+vt);e.querySelector(`#kaster-sideinfo`).innerHTML=`side ${I.side} av ${a}`;let l=Bt(I.side,a);e.querySelector(`#kaster-paginering-topp`).innerHTML=l,e.querySelector(`#kaster-paginering-botn`).innerHTML=l,e.querySelector(`#kaster-grid`).innerHTML=c.map(Rt).join(``)}r(),e.querySelector(`#kaster-sok`).addEventListener(`input`,e=>{I.sokeTekst=e.target.value,I.side=1,r()}),e.querySelector(`#kaster-berre-aktive`).addEventListener(`change`,async e=>{I.visAlle=!e.target.checked,I.side=1;let{data:t,error:i}=await jt(!I.visAlle);i||(n=t),r()}),e.addEventListener(`click`,t=>{let n=t.target.closest(`.pag-knapp`);!n||n.disabled||(I.side=Number(n.dataset.side),r(),e.querySelector(`.nc-side`).scrollIntoView({behavior:`smooth`}))}),O().then(t=>{if(!t?.profil||t.profil.rolle!==`admin`&&t.profil.rolle!==`klubbadmin`)return;let n=document.createElement(`div`);n.className=`mb-2 px-2`,n.innerHTML=`<a href="#/kaster/ny" class="btn btn-sm btn-success">+ Ny utøvar</a>`,e.querySelector(`.nc-side`)?.prepend(n)})}async function Kt(e,t){L.aktiv=`resultater`,L.ar=`alle`,L.stevnetype=`alle`,L.grafMetrikk=`plassering`,L.grafMetode=`kongelag`,L.grafFra=null,L.grafTil=null,At(),e.innerHTML=`<p class="laster">Laster utøver...</p>`;let{kaster:n,resultater:r,error:i}=await Mt(t);if(i||!n){e.innerHTML=`<p class="feil">Kunne ikkje laste utøver.</p>`;return}e.innerHTML=Vt(n,r);function a(){e.querySelector(`#kd-resultat-tabell`).innerHTML=Ht(r,L.ar,L.stevnetype)}function o(){e.querySelector(`#kd-stat-innhald`).innerHTML=Ut(r,n)}function s(){let t=e.querySelector(`#kd-graf-canvas`);t&&Wt(t,r)}function c(t){L.aktiv=t,e.querySelectorAll(`.kaster-tab-knapp`).forEach(e=>{e.classList.toggle(`active`,e.dataset.tab===t)}),e.querySelectorAll(`.kd-tab`).forEach(e=>{e.classList.toggle(`kd-skjult`,e.id!==`kd-tab-${t}`)}),t===`statistikk`&&o(),t===`graf`&&s()}a(),e.querySelector(`#kd-ar`).addEventListener(`change`,e=>{L.ar=e.target.value,a()}),e.querySelector(`#kd-type`).addEventListener(`change`,e=>{L.stevnetype=e.target.value,a()}),e.querySelectorAll(`.kaster-tab-knapp`).forEach(e=>{e.addEventListener(`click`,()=>c(e.dataset.tab))}),e.querySelector(`#kd-graf-metrikk`).addEventListener(`change`,t=>{L.grafMetrikk=t.target.value;let n=e.querySelector(`#kd-graf-metode`);n.style.display=t.target.value===`prosent`?``:`none`,s()}),e.querySelector(`#kd-graf-metode`).addEventListener(`change`,e=>{L.grafMetode=e.target.value,s()}),e.querySelector(`#kd-graf-fra`).addEventListener(`change`,e=>{L.grafFra=e.target.value||null,s()}),e.querySelector(`#kd-graf-til`).addEventListener(`change`,e=>{L.grafTil=e.target.value||null,s()}),O().then(r=>{if(!r?.profil||!(r.profil.rolle===`admin`||r.profil.rolle===`klubbadmin`&&r.klubber.includes(n.klubbid)))return;let i=document.createElement(`div`);i.className=`mb-2 px-2`,i.innerHTML=`<a href="#/kaster/${t}/admin" class="btn btn-sm btn-warning">Rediger utøvar</a>`,e.querySelector(`.nc-side`)?.prepend(i)})}async function qt(e,t={}){At(),t.id?await Kt(e,Number(t.id)):await Gt(e)}var Jt=`https://placehold.co/200x200/444/888?text=?`,Yt={sokeTekst:``},Xt={sokeTekst:``},Zt=null,Qt=null,$t=new Map;async function en(){if(Zt)return Zt;let{data:e,error:t}=await a.from(`klubb`).select(`id, navn, logourl`).eq(`eraktiv`,!0).order(`navn`);return Zt={data:e??[],error:t},Zt}async function tn(){if(Qt)return Qt;let{data:e}=await a.from(`kaster`).select(`id, fornavn, etternavn, klubb:klubbid(id)`).eq(`eraktiv`,!0);return Qt=e??[],Qt}async function nn(e){if($t.has(e))return $t.get(e);let{data:t,error:n}=await a.from(`kaster`).select(`id, fornavn, etternavn, avatarurl, medlemsnummer, klasse:klasseid(id, navn)`).eq(`klubbid`,e).eq(`eraktiv`,!0).order(`etternavn`).order(`fornavn`),r={data:t??[],error:n};return $t.set(e,r),r}function rn(e){return`
    <a href="${`#/klubber/${l(e)}`}" class="kaster-kort">
      <img src="${e.logourl||Jt}" alt="${e.navn}" loading="lazy">
      <div class="kaster-namn">${e.navn}</div>
    </a>`}function an(){return`
    <div class="nc-side">
      <div class="kaster-liste-kontroller">
        <div class="nc-filter-rad">
          <input id="klubb-sok" type="text" class="tl-select" placeholder="Søk på klubbnavn eller utøver" value="">
          <button id="klubb-sok-knapp" class="btn btn-secondary btn-sm">Søk</button>
        </div>
      </div>
      <div id="klubb-grid" class="kaster-grid"></div>
    </div>`}function on(e,t){return`
    <div class="nc-side">
      <div style="margin-bottom:12px">
        <a href="#/klubber" class="btn btn-sm btn-outline-secondary">← Tilbake</a>
      </div>
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px">
        <img src="${e.logourl||Jt}" alt="${e.navn}"
          style="width:80px;height:80px;object-fit:contain;background:#ddd;border-radius:4px">
        <h1 style="font-size:1.8rem;font-weight:bold;margin:0">${e.navn}</h1>
      </div>
      <h3 style="margin-bottom:8px">Aktive utøvere (${t})</h3>
      <div class="nc-filter-rad" style="margin-bottom:12px">
        <input id="klubb-detalj-sok" type="text" class="tl-select" placeholder="Søk på utøver" value="">
        <button id="klubb-detalj-sok-knapp" class="btn btn-secondary btn-sm">Søk</button>
      </div>
      <div id="klubb-detalj-liste"></div>
    </div>`}function sn(e,t){let n=t.trim().toLowerCase(),r=n?e.filter(e=>o(e).toLowerCase().includes(n)):e;return r.length?`
    <div style="overflow-x:auto">
      <table class="nc-tabell">
        <thead class="nc-thead">
          <tr><th>#</th><th>Utøver</th><th>Klasse</th><th>Nr.</th></tr>
        </thead>
        <tbody>${r.map((e,t)=>`
    <tr>
      <td>${t+1}</td>
      <td><a href="#/kastere/${c(e)}" class="tl-lenkje">${o(e)}</a></td>
      <td>${e.klasse?.navn??`–`}</td>
      <td>${e.medlemsnummer??`–`}</td>
    </tr>`).join(``)}</tbody>
      </table>
    </div>`:`<p class="nc-ingen">Ingen aktive utøvere funnet.</p>`}async function cn(e){e.innerHTML=`<p class="laster">Laster klubbar...</p>`;let[{data:t,error:n},r]=await Promise.all([en(),tn()]);if(n){e.innerHTML=`<p class="feil">Kunne ikkje laste klubbar.</p>`;return}let i=new Map;for(let e of r)e.klubb?.id&&(i.has(e.klubb.id)||i.set(e.klubb.id,[]),i.get(e.klubb.id).push(o(e).toLowerCase()));e.innerHTML=an();function a(){let n=Yt.sokeTekst.trim().toLowerCase(),r=n?t.filter(e=>e.navn.toLowerCase().includes(n)||(i.get(e.id)??[]).some(e=>e.includes(n))):t;e.querySelector(`#klubb-grid`).innerHTML=r.length?r.map(rn).join(``):`<p class="nc-ingen">Ingen klubbar funnet.</p>`}a(),e.querySelector(`#klubb-sok`).addEventListener(`keydown`,e=>{e.key===`Enter`&&(Yt.sokeTekst=e.target.value,a())}),e.querySelector(`#klubb-sok-knapp`).addEventListener(`click`,()=>{Yt.sokeTekst=e.querySelector(`#klubb-sok`).value,a()}),O().then(t=>{if(!t?.profil||t.profil.rolle!==`admin`)return;let n=document.createElement(`div`);n.className=`mb-2 px-2`,n.innerHTML=`<a href="#/klubber/ny" class="btn btn-sm btn-success">+ Ny klubb</a>`,e.querySelector(`.nc-side`)?.prepend(n)})}async function ln(e,t){Xt.sokeTekst=``,e.innerHTML=`<p class="laster">Laster klubb...</p>`;let[n,r]=await Promise.all([a.from(`klubb`).select(`id, navn, logourl`).eq(`id`,t).single(),nn(t)]);if(n.error||!n.data){e.innerHTML=`<p class="feil">Kunne ikkje laste klubb.</p>`;return}let i=n.data,{data:o}=r;e.innerHTML=on(i,o.length);function s(){e.querySelector(`#klubb-detalj-liste`).innerHTML=sn(o,Xt.sokeTekst)}s(),e.querySelector(`#klubb-detalj-sok`).addEventListener(`keydown`,e=>{e.key===`Enter`&&(Xt.sokeTekst=e.target.value,s())}),e.querySelector(`#klubb-detalj-sok-knapp`).addEventListener(`click`,()=>{Xt.sokeTekst=e.querySelector(`#klubb-detalj-sok`).value,s()}),O().then(n=>{if(!n?.profil||!(n.profil.rolle===`admin`||n.profil.rolle===`klubbadmin`&&n.klubber.includes(i.id)))return;let r=document.createElement(`div`);r.className=`mb-2 px-2`,r.innerHTML=`<a href="#/klubber/${t}/admin" class="btn btn-sm btn-warning">Rediger klubb</a>`,e.querySelector(`.nc-side`)?.prepend(r)})}async function un(e,t={}){t.id?await ln(e,Number(t.id)):await cn(e)}var dn=[{verdi:`kongelag`,label:`Kongelag`,maxPoeng:200},{verdi:`minimatch`,label:`Minimatch`,maxPoeng:300},{verdi:`halvmatch`,label:`Halvmatch`,maxPoeng:500},{verdi:`heilmatch`,label:`Heilmatch`,maxPoeng:1e3}],R={metode:`kongelag`,kjønn:`alle`,sokeTekst:``},fn=null;function pn(e){return(e.kjonn_navn??``).toLowerCase().includes(`dame`)}function mn(e){return[e.fornavn,e.etternavn].filter(Boolean).join(` `)}function hn(e){return String(e??``).replace(/&/g,`&amp;`).replace(/"/g,`&quot;`)}async function gn(){if(fn)return fn;let{data:e,error:t}=await a.from(`kaster_rekorder`).select(`*`);return fn={data:e??[],error:t},fn}function _n(e){let t=R.sokeTekst.trim().toLowerCase(),n=e.filter(e=>{if(e.metode!==R.metode||R.kjønn===`damer`&&!pn(e)||R.kjønn===`herrer`&&pn(e))return!1;if(t){let n=mn(e).toLowerCase(),r=(e.klubb_namn??e.klubb_navn??``).toLowerCase();if(!n.includes(t)&&!r.includes(t))return!1}return!0});n.sort((e,t)=>t.poeng-e.poeng);let r=1;for(let e=0;e<n.length;e++)e>0&&n[e].poeng<n[e-1].poeng&&(r=e+1),n[e].plassering=r;return n}function vn(e){return e.length?`
    <div style="overflow-x:auto">
      <table class="nc-tabell">
        <thead class="nc-thead">
          <tr>
            <th style="width:40px">Pl.</th>
            <th>Navn</th>
            <th>Klubb</th>
            <th style="width:80px">Poeng</th>
            <th style="width:55px">År</th>
          </tr>
        </thead>
        <tbody>${e.map(e=>{let t=c({id:e.kasterid,fornavn:e.fornavn,etternavn:e.etternavn}),n=pn(e)?` class="rek-dame-rad"`:``,r=e.klubb_namn??e.klubb_navn??`–`,i=e.stevne_id?`<span class="rek-poeng-celle" title="${hn(e.stevne_namn??e.stevne_navn)}" data-stevneid="${e.stevne_id}">${e.poeng}</span>`:e.poeng;return`
      <tr${n}>
        <td>${e.plassering}</td>
        <td><a href="#/kastere/${t}" class="tl-lenkje">${mn(e)}</a></td>
        <td>${r}</td>
        <td>${i}</td>
        <td>${e.ar??`–`}</td>
      </tr>`}).join(``)}</tbody>
      </table>
    </div>`:`<p class="nc-ingen">Ingen rekorder funnet.</p>`}function yn(){return`
    <div class="nc-side">
      <h1 style="text-align:center;font-size:1.4rem;font-weight:bold;margin-bottom:4px">Rekorder</h1>
      <p id="rek-maks-tekst" style="text-align:center;font-size:0.85rem;color:#555;margin-bottom:14px"></p>
      <div class="nc-filter-rad">
        <select id="rek-metode" class="tl-select">${dn.map(e=>`<option value="${e.verdi}"${e.verdi===R.metode?` selected`:``}>${e.label}</option>`).join(``)}</select>
        <select id="rek-kjønn" class="tl-select">
          <option value="alle">Alle</option>
          <option value="herrer">Herrer</option>
          <option value="damer">Damer</option>
        </select>
        <input id="rek-sok" type="text" class="tl-select" placeholder="Søk på etternavn/klubb" value="">
      </div>
      <div id="rek-tabell-container"></div>
    </div>`}async function bn(e){R.metode=`kongelag`,R.kjønn=`alle`,R.sokeTekst=``,e.innerHTML=`<p class="laster">Laster rekorder...</p>`;let{data:t,error:n}=await gn();if(n){e.innerHTML=`<p class="feil">Kunne ikkje laste rekorder.</p>`;return}e.innerHTML=yn();function r(){let t=dn.find(e=>e.verdi===R.metode);e.querySelector(`#rek-maks-tekst`).textContent=`(Maks poengsum: ${t.maxPoeng})`}function i(){let n=_n(t);e.querySelector(`#rek-tabell-container`).innerHTML=vn(n)}r(),i(),e.querySelector(`#rek-metode`).addEventListener(`change`,e=>{R.metode=e.target.value,r(),i()}),e.querySelector(`#rek-kjønn`).addEventListener(`change`,e=>{R.kjønn=e.target.value,i()}),e.querySelector(`#rek-sok`).addEventListener(`input`,e=>{R.sokeTekst=e.target.value,i()}),e.addEventListener(`click`,e=>{let t=e.target.closest(`.rek-poeng-celle`);t?.dataset.stevneid&&(location.hash=`#/resultat/${t.dataset.stevneid}`)})}var xn=[{id:1,namn:`Singel`,kjonnFilter:`historisk`,fraaAr:1985,aapentFraAr:2013,merknad:`(åpen klasse fra 2013)`},{id:2,namn:`Par`,kjonnFilter:`historisk`,fraaAr:1987,aapentFraAr:2009,merknad:`(åpen klasse fra 2009)`},{id:3,namn:`Mix`,kjonnFilter:!1,fraaAr:1986,merknad:`(NM Mix 2011 ble ikke arrangert)`},{id:4,namn:`Lag`,kjonnFilter:!1,fraaAr:2016},{id:7,namn:`X-kast`,kjonnFilter:`historisk`,fraaAr:2009,aapentFraAr:2013,merknad:`(åpen klasse fra 2013)`},{id:9,namn:`Hesteskogolf`,kjonnFilter:`alltid`,fraaAr:2006},{id:10,namn:`Kongelag`,kjonnFilter:!1,fraaAr:2023}],Sn=[1,3,4,13,16,21,23,24,27,29,32],z={kategoriId:1,kjonn:`open`},Cn=new Map,wn=null;function Tn(e){return e?parseInt(e.substring(0,4)):null}function En(e){let t=[e?.fornavn,e?.etternavn].filter(Boolean).join(` `);return`<a href="#/kastere/${c(e)}" class="tl-lenkje">${t}</a>`}function Dn(e){return e===`alltid`?`alle`:`open`}function On(e,t){return t===`herrer`?`${e} Herrer`:t===`damer`?`${e} Damer`:e}async function kn(){if(wn)return wn;let{data:e}=await a.from(`kjonn`).select(`id, navn`);return wn=e??[],wn}function An(e,t){let n=t===`damer`?`dame`:`herre`;return e.find(e=>e.navn.toLowerCase().includes(n))?.id}async function jn(e,t){let n=`${e.id}-${t}`;if(Cn.has(n))return Cn.get(n);let r=a.from(`stevne`).select(`id, dato`).eq(`ernm`,!0).eq(`kategoriid`,e.id);e.kjonnFilter===`historisk`&&(r=t===`open`?r.gte(`dato`,`${e.aapentFraAr}-01-01`):r.lt(`dato`,`${e.aapentFraAr}-01-01`));let{data:i,error:o}=await r;if(o)return{data:[],error:o};let s=(i??[]).map(e=>e.id);if(!s.length){let e={data:[],error:null};return Cn.set(n,e),e}let c=e.kjonnFilter===`historisk`&&t!==`open`||e.kjonnFilter===`alltid`&&t!==`alle`,l=c?`kaster:kasterid!inner(id, fornavn, etternavn)`:`kaster:kasterid(id, fornavn, etternavn)`,u=a.from(`resultat`).select(`
      id, klasseid,
      ${l},
      klubb:klubbid(id, navn),
      stevne:stevneid(id, dato)
    `).eq(`plassering`,1).in(`stevneid`,s).in(`klasseid`,Sn).or(`gruppeid.is.null,gruppeid.neq.2`);if(c){let e=An(await kn(),t);e&&(u=u.eq(`kaster.kjonnid`,e))}e.kjonnFilter===`historisk`&&t===`open`&&(u=u.eq(`klasseid`,1));let{data:d,error:f}=await u,p={data:d??[],error:f};return f||Cn.set(n,p),p}function Mn(e){let t=new Map;for(let n of e){let e=`${n.stevne?.id}-${n.klasseid}`;t.has(e)||t.set(e,{ar:Tn(n.stevne?.dato),stevneId:n.stevne?.id,kastere:[],klubb:n.klubb}),n.kaster&&t.get(e).kastere.push(n.kaster)}return[...t.values()].sort((e,t)=>(t.ar??0)-(e.ar??0))}function Nn(e){return e.length?`
    <div style="overflow-x:auto">
      <table class="nc-tabell">
        <thead class="nc-thead">
          <tr>
            <th>År</th>
            <th>Navn</th>
            <th>Klubb</th>
          </tr>
        </thead>
        <tbody>${e.map(({ar:e,stevneId:t,kastere:n,klubb:r})=>{let i=n.map(En).join(` og `)||`–`;return`
      <tr>
        <td style="width:60px">${t?`<a href="#/resultat/${t}" class="tl-lenkje">${e??`–`}</a>`:e??`–`}</td>
        <td>${i}</td>
        <td>${r?.navn??`–`}</td>
      </tr>`}).join(``)}</tbody>
      </table>
    </div>`:`<p class="nc-ingen">Ingen vinnere funnet.</p>`}function Pn(e,t){let n=`Norgesmestere ${e.fraaAr} - ${t}`,r=xn.map(e=>`<option value="${e.id}"${e.id===z.kategoriId?` selected`:``}>${e.namn}</option>`).join(``),i=``;e.kjonnFilter===`historisk`?i=`
      <select id="nm-kjonn" class="tl-select">
        <option value="open"${z.kjonn===`open`?` selected`:``}>Åpen klasse</option>
        <option value="herrer"${z.kjonn===`herrer`?` selected`:``}>Herrer</option>
        <option value="damer"${z.kjonn===`damer`?` selected`:``}>Damer</option>
      </select>`:e.kjonnFilter===`alltid`&&(i=`
      <select id="nm-kjonn" class="tl-select">
        <option value="alle"${z.kjonn===`alle`?` selected`:``}>Alle</option>
        <option value="herrer"${z.kjonn===`herrer`?` selected`:``}>Herrer</option>
        <option value="damer"${z.kjonn===`damer`?` selected`:``}>Damer</option>
      </select>`);let a=e.merknad?`<p style="text-align:center;font-size:0.85rem;color:#aaa;margin-bottom:12px">${e.merknad}</p>`:`<div style="margin-bottom:12px"></div>`;return`
    <div class="nc-side">
      <div class="nc-filter-rad">
        <select id="nm-kategori" class="tl-select">${r}</select>
        ${i}
      </div>
      <h1 style="text-align:center;font-size:1.6rem;font-weight:bold;margin:16px 0 4px">${n}</h1>
      <h2 id="nm-undertittel" style="text-align:center;font-size:1.1rem;font-weight:600;margin-bottom:2px">${On(e.namn,z.kjonn)}</h2>
      ${a}
      <div id="nm-tabell-container"></div>
    </div>`}async function Fn(e){e.innerHTML=`<p class="laster">Laster NM-vinnere...</p>`;let t=xn.find(e=>e.id===z.kategoriId),{data:n,error:r}=await jn(t,z.kjonn);if(r){e.innerHTML=`<p class="feil">Kunne ikkje laste NM-vinnere.</p>`;return}e.innerHTML=Pn(t,n.reduce((e,t)=>Math.max(e,Tn(t.stevne?.dato)??0),0)||new Date().getFullYear()),e.querySelector(`#nm-tabell-container`).innerHTML=Nn(Mn(n)),e.querySelector(`#nm-kategori`).addEventListener(`change`,async t=>{z.kategoriId=Number(t.target.value),z.kjonn=Dn(xn.find(e=>e.id===z.kategoriId)?.kjonnFilter),await Fn(e)});let i=e.querySelector(`#nm-kjonn`);i&&i.addEventListener(`change`,async t=>{z.kjonn=t.target.value,await Fn(e)})}async function In(e){z.kategoriId=1,z.kjonn=Dn(xn[0].kjonnFilter),await Fn(e)}async function Ln(e){let t=await O();if(t){e.innerHTML=`
      <div class="container py-4" style="max-width:480px">
        <p>Du er allereie innlogga som <strong>${t.user.email}</strong>.</p>
        <a href="#/minside" class="btn btn-primary">Gå til Min side</a>
      </div>`;return}e.innerHTML=`
    <div class="container py-4" style="max-width:480px">
      <h2 class="mb-4">Konto</h2>
      <ul class="nav nav-tabs mb-3" id="logginn-faner">
        <li class="nav-item">
          <button class="nav-link active" data-fane="logginn">Logg inn</button>
        </li>
        <li class="nav-item">
          <button class="nav-link" data-fane="registrer">Registrer ny konto</button>
        </li>
      </ul>

      <!-- Logg inn -->
      <div id="fane-logginn">
        <form id="logginn-skjema">
          <div class="mb-3">
            <label class="form-label">E-post</label>
            <input type="email" class="form-control" id="li-epost" required autocomplete="email">
          </div>
          <div class="mb-3">
            <label class="form-label">Passord</label>
            <input type="password" class="form-control" id="li-passord" required autocomplete="current-password">
          </div>
          <div id="li-feil" class="alert alert-danger d-none"></div>
          <button type="submit" class="btn btn-primary w-100">Logg inn</button>
        </form>
      </div>

      <!-- Registrer -->
      <div id="fane-registrer" style="display:none">
        <form id="registrer-skjema">
          <div class="mb-3">
            <label class="form-label">E-post</label>
            <input type="email" class="form-control" id="reg-epost" required autocomplete="email">
          </div>
          <div class="mb-3">
            <label class="form-label">Passord</label>
            <input type="password" class="form-control" id="reg-passord" required autocomplete="new-password" minlength="8">
          </div>
          <div class="mb-3">
            <label class="form-label">Gjenta passord</label>
            <input type="password" class="form-control" id="reg-passord2" required autocomplete="new-password" minlength="8">
          </div>
          <div id="reg-feil" class="alert alert-danger d-none"></div>
          <div id="reg-suksess" class="alert alert-success d-none">
            Konto oppretta! Du kan no logge inn.
          </div>
          <button type="submit" class="btn btn-success w-100">Opprett konto</button>
        </form>
      </div>
    </div>`,e.querySelectorAll(`[data-fane]`).forEach(t=>{t.addEventListener(`click`,()=>{e.querySelectorAll(`[data-fane]`).forEach(e=>e.classList.remove(`active`)),t.classList.add(`active`),e.querySelector(`#fane-logginn`).style.display=t.dataset.fane===`logginn`?``:`none`,e.querySelector(`#fane-registrer`).style.display=t.dataset.fane===`registrer`?``:`none`})}),e.querySelector(`#logginn-skjema`).addEventListener(`submit`,async t=>{t.preventDefault();let n=e.querySelector(`#li-feil`);n.classList.add(`d-none`);let r=t.target.querySelector(`[type=submit]`);r.disabled=!0;let{error:i}=await a.auth.signInWithPassword({email:e.querySelector(`#li-epost`).value.trim(),password:e.querySelector(`#li-passord`).value});if(i){n.textContent=i.message===`Invalid login credentials`?`Feil e-post eller passord.`:i.message,n.classList.remove(`d-none`),r.disabled=!1;return}let o=new URLSearchParams(location.hash.split(`?`)[1]??``).get(`redirect`);o?location.hash=`#${o}`:location.hash=await _e()?`#/admin`:`#/minside`}),e.querySelector(`#registrer-skjema`).addEventListener(`submit`,async t=>{t.preventDefault();let n=e.querySelector(`#reg-feil`),r=e.querySelector(`#reg-suksess`);n.classList.add(`d-none`),r.classList.add(`d-none`);let i=e.querySelector(`#reg-passord`).value;if(i!==e.querySelector(`#reg-passord2`).value){n.textContent=`Passorda er ikkje like.`,n.classList.remove(`d-none`);return}let o=t.target.querySelector(`[type=submit]`);o.disabled=!0;let{error:s}=await a.auth.signUp({email:e.querySelector(`#reg-epost`).value.trim(),password:i});if(s){n.textContent=s.message,n.classList.remove(`d-none`),o.disabled=!1;return}await a.auth.signInWithPassword({email:e.querySelector(`#reg-epost`).value.trim(),password:i}),location.hash=`#/minside`})}var Rn={admin:`Administrator`,klubbadmin:`Klubbadministrator`,bruker:`Brukar`};async function zn(e){e.innerHTML=`<p class="laster" style="text-align:center;margin-top:40px;">Laster…</p>`;let t=await O();if(!t){location.hash=`#/logginn`;return}let{profil:n,user:r}=t,i=`
    <div class="container py-4" style="max-width:640px">
      <h2 class="mb-1">Min side</h2>
      <p class="text-muted mb-4">${r.email} · <span class="badge bg-secondary">${Rn[n?.rolle]??`Ukjent`}</span></p>`,a=n?.kobling_status??`ingen`;a===`ingen`||a===`avvist`?(a===`avvist`&&(i+=`<div class="alert alert-warning">Koblingforespørselen din vart avvist. Du kan sende ein ny.</div>`),i+=`
      <div class="card mb-4">
        <div class="card-body">
          <h5 class="card-title">Koble til utøvarprofil</h5>
          <p class="card-text text-muted">Søk etter deg sjølv i registeret og send ein forespørsel. Etter godkjenning kan du melde deg på stevner.</p>
          <input type="search" id="kaster-sok" class="form-control mb-2" placeholder="Søk på namn…">
          <div id="kaster-treff" class="list-group mb-2"></div>
          <div id="kasting-feil" class="alert alert-danger d-none"></div>
        </div>
      </div>`):a===`venter`?i+=`<div class="alert alert-info mb-4">Koblingforespørselen din ventar på godkjenning frå ein administrator.</div>`:a===`godkjent`&&n?.kasterid&&(i+=await Bn(n.kasterid),i+=await Vn(r.id),i+=await Hn(n.kasterid)),i+=`</div>`,e.innerHTML=i,(a===`ingen`||a===`avvist`)&&Wn(e,r.id),a===`godkjent`&&n?.kasterid&&Un(e,n.kasterid)}async function Bn(e){let{data:t}=await a.from(`kaster`).select(`id, fornavn, etternavn, klubb:klubbid(navn)`).eq(`id`,e).single();return t?`
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">Kobla til utøvarprofil</h5>
        <p class="mb-1"><strong>${`${t.fornavn} ${t.etternavn}`}</strong> · ${t.klubb?.navn??``}</p>
        <a href="#/kastere/${t.id}" class="btn btn-sm btn-outline-primary mt-1">Sjå profil</a>
      </div>
    </div>`:``}async function Vn(e){let{data:t}=await a.from(`pamelding`).select(`id, stevne:stevneid(id, navn, dato)`).eq(`bruker_id`,e).order(`stevneid`,{ascending:!0}).limit(50);return t?.length?`
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">Påmeldingar</h5>
        <table class="table table-sm"><thead><tr><th>Stevne</th><th>Dato</th><th></th></tr></thead>
        <tbody>${[...t].sort((e,t)=>(e.stevne?.dato?new Date(e.stevne.dato):0)-(t.stevne?.dato?new Date(t.stevne.dato):0)).map(e=>{let t=e.stevne?.dato?new Date(e.stevne.dato+`T12:00:00`).toLocaleDateString(`nb-NO`):``;return`<tr>
      <td><a href="#/stevne/${e.stevne?.id}/pamelding">${e.stevne?.navn??``}</a></td>
      <td>${t}</td>
      <td><a href="#/stevne/${e.stevne?.id}/pamelding" class="btn btn-sm btn-outline-danger">Meld av</a></td>
    </tr>`}).join(``)}</tbody></table>
      </div>
    </div>`:`<p class="text-muted">Ingen påmeldingar enno.</p>`}async function Hn(e){let{data:t}=await a.from(`kamp_spelar`).select(`
      id, kasterid, posisjon,
      kamp:kampid(
        id, stevneid, fase, runde_nummer, bane_nummer, er_bekreftet, er_walkover,
        stevne:stevneid(id, navn, erfullfort),
        spelarar:kamp_spelar(
          id, kasterid, posisjon,
          kaster:kasterid(id, fornavn, etternavn)
        )
      )
    `).eq(`kasterid`,e),n=(t??[]).filter(e=>!e.kamp?.er_walkover),r=n.filter(e=>e.kamp?.stevne?.erfullfort===!1&&!e.kamp?.er_bekreftet).sort((e,t)=>(e.kamp?.runde_nummer??0)-(t.kamp?.runde_nummer??0)),i=n.filter(e=>e.kamp?.er_bekreftet).sort((e,t)=>(e.kamp?.runde_nummer??0)-(t.kamp?.runde_nummer??0)),o=(t,n)=>{let r=t.kamp,i=(r?.spelarar??[]).find(t=>t.kasterid!==e),a=i?.kaster?`${i.kaster.fornavn} ${i.kaster.etternavn}`:`–`;return`<tr>
      <td>R${r?.runde_nummer??``} / B${r?.bane_nummer??``}</td>
      <td>${a}</td>
      <td>${n}</td>
    </tr>`},s=(e,t)=>{if(!e.length)return null;let n=new Map;for(let t of e){let e=t.kamp?.stevneid??`ukjent`,r=t.kamp?.stevne?.navn??``;n.has(e)||n.set(e,{namn:r,kampar:[]}),n.get(e).kampar.push(t)}return[...n.values()].map(({namn:e,kampar:n})=>`
      <p class="fw-semibold mb-1 mt-2">${e}</p>
      <table class="table table-sm mb-3"><thead><tr><th>Runde/Bane</th><th>Motstandar</th><th></th></tr></thead><tbody>
        ${n.map(e=>o(e,t(e))).join(``)}
      </tbody></table>`).join(``)},c=s(r,e=>`<a href="#/kamp/${e.kamp.id}" class="btn btn-sm btn-primary">Scoreboard</a>`),l=s(i,e=>`<a href="#/kamp/${e.kamp.id}" class="btn btn-sm btn-outline-secondary">Sjå kamp</a>`);return`
    <div class="card mb-4" id="mine-kampar-seksjon" data-kasterid="${e}">
      <div class="card-body">
        <h5 class="card-title">Mine kampar</h5>
        <ul class="nav nav-tabs mb-3" id="kampfaner">
          <li class="nav-item">
            <button class="nav-link active" data-fane="kommande">Kommande (${r.length})</button>
          </li>
          <li class="nav-item">
            <button class="nav-link" data-fane="ferdige">Ferdige (${i.length})</button>
          </li>
        </ul>
        <div id="fane-kommande">
          ${c??`<p class="text-muted">Ingen kommande kampar.</p>`}
        </div>
        <div id="fane-ferdige" class="d-none">
          ${l??`<p class="text-muted">Ingen ferdige kampar enno.</p>`}
        </div>
      </div>
    </div>`}function Un(e,t){e.querySelectorAll(`[data-fane]`).forEach(t=>{t.addEventListener(`click`,()=>{e.querySelectorAll(`[data-fane]`).forEach(e=>e.classList.remove(`active`)),t.classList.add(`active`);let n=t.dataset.fane;e.querySelector(`#fane-kommande`).classList.toggle(`d-none`,n!==`kommande`),e.querySelector(`#fane-ferdige`).classList.toggle(`d-none`,n!==`ferdige`)})})}function Wn(e,t){let n=null;e.querySelector(`#kaster-sok`).addEventListener(`input`,t=>{clearTimeout(n);let r=t.target.value.trim(),i=e.querySelector(`#kaster-treff`);if(r.length<2){i.innerHTML=``;return}n=setTimeout(async()=>{let{data:e}=await a.from(`kaster`).select(`id, fornavn, etternavn, klubb:klubbid(navn)`).or(`fornavn.ilike.%${r}%,etternavn.ilike.%${r}%`).limit(8);if(!e?.length){i.innerHTML=`<p class="text-muted small">Ingen treff.</p>`;return}i.innerHTML=e.map(e=>`<button class="list-group-item list-group-item-action" data-id="${e.id}">
          ${e.fornavn} ${e.etternavn} <span class="text-muted small">· ${e.klubb?.navn??``}</span>
        </button>`).join(``)},300)}),e.querySelector(`#kaster-treff`).addEventListener(`click`,async n=>{let r=n.target.closest(`[data-id]`);if(!r)return;let i=e.querySelector(`#kasting-feil`);i.classList.add(`d-none`);let{error:o}=await a.from(`bruker_profil`).update({kobling_kasterid:Number(r.dataset.id),kobling_status:`venter`}).eq(`id`,t);if(o){i.textContent=`Kunne ikkje sende forespørsel: `+o.message,i.classList.remove(`d-none`);return}location.reload()})}var Gn=[`kobling`,`brukarar`,`klubbadmin`],Kn={kobling:`Koblingforespørslar`,brukarar:`Brukarar`,klubbadmin:`Klubbadmin-tilgang`};async function qn(e){e.innerHTML=`
    <div class="container py-4" style="max-width:860px">
      <h2 class="mb-3">Administrasjon</h2>
      <ul class="nav nav-tabs mb-4" id="admin-faner">
        ${Gn.map((e,t)=>`<li class="nav-item">
          <button class="nav-link${t===0?` active`:``}" data-fane="${e}">${Kn[e]}</button>
        </li>`).join(``)}
      </ul>
      <div id="admin-innhald"></div>
    </div>`;let t=e.querySelector(`#admin-innhald`);async function n(n){e.querySelectorAll(`[data-fane]`).forEach(e=>{e.classList.toggle(`active`,e.dataset.fane===n)}),t.innerHTML=`<p class="laster">Laster…</p>`,n===`kobling`&&await Jn(t),n===`brukarar`&&await Xn(t),n===`klubbadmin`&&await Zn(t)}e.querySelector(`#admin-faner`).addEventListener(`click`,e=>{let t=e.target.closest(`[data-fane]`);t&&n(t.dataset.fane)}),n(`kobling`)}async function Jn(e){let{data:t,error:n}=await a.from(`bruker_profil`).select(`id, kobling_kasterid, kaster:kobling_kasterid(id, fornavn, etternavn, klubb:klubbid(navn))`).eq(`kobling_status`,`venter`);if(n){e.innerHTML=`<div class="alert alert-danger">${n.message}</div>`;return}if(!t?.length){e.innerHTML=`<p class="text-muted">Ingen ventande forespørslar.</p>`;return}let r=t.map(e=>e.id),{data:i}=await a.rpc(`hent_bruker_epost`,{bruker_ids:r}),o=Object.fromEntries((i??[]).map(e=>[e.id,e.epost]));e.innerHTML=`<table class="table table-hover">
    <thead><tr><th>E-post</th><th>Vil koblast til</th><th>Handling</th></tr></thead>
    <tbody>
      ${t.map(e=>{let t=e.kaster,n=t?`${t.fornavn} ${t.etternavn} (${t.klubb?.navn??``})`:`—`;return`<tr data-id="${e.id}" data-kasterid="${e.kobling_kasterid}">
          <td>${o[e.id]??e.id}</td>
          <td>${n}</td>
          <td>
            <button class="btn btn-sm btn-success me-1 godkjenn-knapp">Godkjenn</button>
            <button class="btn btn-sm btn-outline-danger avvis-knapp">Avvis</button>
          </td>
        </tr>`}).join(``)}
    </tbody>
  </table>`,e.querySelectorAll(`.godkjenn-knapp`).forEach(t=>{t.addEventListener(`click`,async()=>{let n=t.closest(`tr`);await Yn(n.dataset.id,n.dataset.kasterid,`godkjent`),Jn(e)})}),e.querySelectorAll(`.avvis-knapp`).forEach(t=>{t.addEventListener(`click`,async()=>{await Yn(t.closest(`tr`).dataset.id,null,`avvist`),Jn(e)})})}async function Yn(e,t,n){await a.from(`bruker_profil`).update({kobling_status:n,kasterid:t?Number(t):null}).eq(`id`,e)}async function Xn(e){let{data:t,error:n}=await a.from(`bruker_profil`).select(`id, rolle, kobling_status`).order(`opprettet_at`,{ascending:!1});if(n){e.innerHTML=`<div class="alert alert-danger">${n.message}</div>`;return}if(!t?.length){e.innerHTML=`<p class="text-muted">Ingen brukarar.</p>`;return}let r=t.map(e=>e.id),{data:i}=await a.rpc(`hent_bruker_epost`,{bruker_ids:r}),o=Object.fromEntries((i??[]).map(e=>[e.id,e.epost])),s=[`bruker`,`klubbadmin`,`admin`].map(e=>`<option value="${e}">${e}</option>`).join(``);e.innerHTML=`
    <div id="brukar-feil" class="alert alert-danger d-none"></div>
    <table class="table table-hover">
      <thead><tr><th>E-post</th><th>Rolle</th><th>Kobling</th><th></th></tr></thead>
      <tbody>
        ${t.map(e=>`<tr data-id="${e.id}">
          <td>${o[e.id]??e.id}</td>
          <td>
            <select class="form-select form-select-sm rolle-vel" style="width:auto">
              ${s}
            </select>
          </td>
          <td><span class="badge bg-secondary">${e.kobling_status}</span></td>
          <td><button class="btn btn-sm btn-primary lagre-rolle">Lagre</button></td>
        </tr>`).join(``)}
      </tbody>
    </table>`,t.forEach(t=>{let n=e.querySelector(`tr[data-id="${t.id}"]`);n&&(n.querySelector(`.rolle-vel`).value=t.rolle)}),e.querySelectorAll(`.lagre-rolle`).forEach(t=>{t.addEventListener(`click`,async()=>{let n=t.closest(`tr`),r=n.querySelector(`.rolle-vel`).value,i=e.querySelector(`#brukar-feil`);i.classList.add(`d-none`);let{error:o}=await a.from(`bruker_profil`).update({rolle:r}).eq(`id`,n.dataset.id);o?(i.textContent=o.message,i.classList.remove(`d-none`)):(t.textContent=`✓`,setTimeout(()=>{t.textContent=`Lagre`},2e3))})})}async function Zn(e){let[{data:t},{data:n},{data:r}]=await Promise.all([a.from(`bruker_profil`).select(`id`).eq(`rolle`,`klubbadmin`),a.from(`klubb`).select(`id, navn`).eq(`eraktiv`,!0).order(`navn`),a.from(`klubbadmin_klubber`).select(`bruker_id, klubbid`)]);if(!t?.length){e.innerHTML=`<p class="text-muted">Ingen brukarar med rolle "klubbadmin".</p>`;return}let i=t.map(e=>e.id),{data:o}=await a.rpc(`hent_bruker_epost`,{bruker_ids:i}),s=Object.fromEntries((o??[]).map(e=>[e.id,e.epost])),c={};r?.forEach(e=>{c[e.bruker_id]||(c[e.bruker_id]=new Set),c[e.bruker_id].add(e.klubbid)});let l=(n??[]).map(e=>`<option value="${e.id}">${e.navn}</option>`).join(``);e.innerHTML=`
    <div id="ka-feil" class="alert alert-danger d-none"></div>
    ${t.map(e=>{let t=[...c[e.id]??[]].map(e=>{let t=(n??[]).find(t=>t.id===e);return t?`<span class="badge bg-primary me-1" data-kid="${e}">${t.navn} <button class="btn-close btn-close-white btn-sm fjern-klubb" style="font-size:.6rem"></button></span>`:``}).join(``);return`<div class="card mb-3" data-bruker="${e.id}">
        <div class="card-body">
          <h6 class="card-title mb-2">${s[e.id]??e.id}</h6>
          <div class="ka-klubbar mb-2">${t||`<span class="text-muted small">Ingen klubbar tildelt</span>`}</div>
          <div class="d-flex gap-2">
            <select class="form-select form-select-sm legg-til-vel" style="width:auto">
              <option value="">Legg til klubb…</option>
              ${l}
            </select>
            <button class="btn btn-sm btn-success legg-til-knapp">Legg til</button>
          </div>
        </div>
      </div>`}).join(``)}`,e.querySelectorAll(`.legg-til-knapp`).forEach(t=>{t.addEventListener(`click`,async()=>{let n=t.closest(`[data-bruker]`),r=n.querySelector(`.legg-til-vel`),i=Number(r.value);if(!i)return;let o=e.querySelector(`#ka-feil`);o.classList.add(`d-none`);let{error:s}=await a.from(`klubbadmin_klubber`).insert({bruker_id:n.dataset.bruker,klubbid:i});if(s){o.textContent=s.message,o.classList.remove(`d-none`);return}Zn(e)})}),e.querySelectorAll(`.fjern-klubb`).forEach(t=>{t.addEventListener(`click`,async n=>{n.stopPropagation();let r=t.closest(`[data-kid]`),i=t.closest(`[data-bruker]`),o=e.querySelector(`#ka-feil`);o.classList.add(`d-none`);let{error:s}=await a.from(`klubbadmin_klubber`).delete().eq(`bruker_id`,i.dataset.bruker).eq(`klubbid`,Number(r.dataset.kid));if(s){o.textContent=s.message,o.classList.remove(`d-none`);return}Zn(e)})})}function B(e,t){return`<div class="mb-3"><label class="form-label fw-semibold">${e}</label>${t}</div>`}function Qn(e,t){let n=e.querySelector(`.admin-feil`);n||(n=document.createElement(`div`),n.className=`alert alert-danger admin-feil mt-3`,e.querySelector(`form`)?.append(n)),n.textContent=t,n.style.display=``,n.scrollIntoView({behavior:`smooth`,block:`nearest`})}function $n(e,t){let n=e.querySelector(`.admin-suksess`);n||(n=document.createElement(`div`),n.className=`alert alert-success admin-suksess mt-3`,e.querySelector(`form`)?.append(n)),n.textContent=t,n.style.display=``,setTimeout(()=>{n.style.display=`none`},4e3)}async function er(e,{id:t}={}){e.innerHTML=`<p class="laster" style="text-align:center;margin-top:40px;">Laster…</p>`;let[{data:n},{data:r},{data:i},{data:o}]=await Promise.all([a.from(`klubb`).select(`id, navn`).eq(`eraktiv`,!0).order(`navn`),a.from(`stevnetype`).select(`id, navn`).order(`navn`),a.from(`kastemetode`).select(`id, navn`).order(`navn`),a.from(`kategori`).select(`id, navn`).order(`navn`)]),s=null;if(t){let{data:n}=await a.from(`stevne`).select(`*`).eq(`id`,t).single();if(s=n,!await _e()&&!await ve(s?.klubbid)){e.innerHTML=`<p class="feil" style="text-align:center;margin-top:40px;">Ingen tilgang til dette stevnet.</p>`;return}}let c=t?`Rediger stevne: ${s?.navn??``}`:`Nytt stevne`,l=s??{},u=l.dato??``,d=l.tid?l.tid.slice(0,5):``,f=tr(n,l.klubbid),p=tr(r,l.stevnetypeid),m=tr(i,l.innledendekastemetodeid),h=tr(i,l.avsluttendekastemetodeid),g=tr(o,l.kategoriid);e.innerHTML=`
    <div class="container py-4" style="max-width:640px">
      <h2 class="mb-4">${c}</h2>
      <form id="stevne-skjema">
        ${B(`Namn*`,`<input type="text" class="form-control" name="navn" value="${rr(l.navn)}" required>`)}
        ${B(`Stad`,`<input type="text" class="form-control" name="sted" value="${rr(l.sted)}">`)}
        ${B(`Dato`,`<input type="date" class="form-control" name="dato" value="${u}">`)}
        ${B(`Tid`,`<input type="time" class="form-control" name="tid" value="${d}">`)}
        ${B(`Arrangørklubb`,`<select class="form-select" name="klubbid">${f}</select>`)}
        ${B(`Stevnetype`,`<select class="form-select" name="stevnetypeid">${p}</select>`)}
        ${B(`Innleiande kastemetode`,`<select class="form-select" name="innledendekastemetodeid">${m}</select>`)}
        ${B(`Avsluttande kastemetode`,`<select class="form-select" name="avsluttendekastemetodeid">${h}</select>`)}
        ${B(`Kategori`,`<select class="form-select" name="kategoriid">${g}</select>`)}
        <div class="mb-3 d-flex gap-4 flex-wrap">
          <div class="form-check"><input class="form-check-input" type="checkbox" name="ernm" id="ernm"${l.ernm?` checked`:``}><label class="form-check-label" for="ernm">Er NM</label></div>
          <div class="form-check"><input class="form-check-input" type="checkbox" name="ernorgesranking" id="ernr"${l.ernorgesranking?` checked`:``}><label class="form-check-label" for="ernr">Er Norgesranking</label></div>
          <div class="form-check"><input class="form-check-input" type="checkbox" name="erfullfort" id="erfullfort"${l.erfullfort?` checked`:``}><label class="form-check-label" for="erfullfort">Er fullført</label></div>
          <div class="form-check"><input class="form-check-input" type="checkbox" name="erekskludertfrarekorder" id="ekskl"${l.erekskludertfrarekorder?` checked`:``}><label class="form-check-label" for="ekskl">Ekskl. frå rekorder</label></div>
        </div>
        ${B(`Innbydelses-URL`,`<input type="url" class="form-control" name="innbydelseurl" value="${rr(l.innbydelseurl)}">`)}
        ${B(`Resultat-URL`,`<input type="url" class="form-control" name="resultaturl" value="${rr(l.resultaturl)}">`)}
        <div class="d-flex gap-2 mt-4">
          <button type="submit" class="btn btn-primary">Lagre</button>
          ${t?`<button type="button" id="slett-knapp" class="btn btn-outline-danger ms-auto">Slett stevne</button>`:``}
        </div>
      </form>
    </div>`,e.querySelector(`#stevne-skjema`).addEventListener(`submit`,async n=>{n.preventDefault();let r=new FormData(n.target),i={navn:r.get(`navn`).trim(),sted:r.get(`sted`).trim()||null,dato:r.get(`dato`)||null,tid:r.get(`tid`)||null,klubbid:nr(r.get(`klubbid`)),stevnetypeid:nr(r.get(`stevnetypeid`)),innledendekastemetodeid:nr(r.get(`innledendekastemetodeid`)),avsluttendekastemetodeid:nr(r.get(`avsluttendekastemetodeid`)),kategoriid:nr(r.get(`kategoriid`)),ernm:r.get(`ernm`)===`on`,ernorgesranking:r.get(`ernorgesranking`)===`on`,erfullfort:r.get(`erfullfort`)===`on`,erekskludertfrarekorder:r.get(`erekskludertfrarekorder`)===`on`,innbydelseurl:r.get(`innbydelseurl`).trim()||null,resultaturl:r.get(`resultaturl`).trim()||null},{data:o,error:s}=t?await a.from(`stevne`).update(i).eq(`id`,t).select(`id`).single():await a.from(`stevne`).insert(i).select(`id`).single();if(s){Qn(e,s.message);return}$n(e,`Stevnet er lagra.`),t||setTimeout(()=>{location.hash=`#/stevne/${o.id}/admin`},1500)}),e.querySelector(`#slett-knapp`)?.addEventListener(`click`,async()=>{if(!confirm(`Slett stevnet «${s?.navn}»? Dette kan ikkje angrast.`))return;let{error:n}=await a.from(`stevne`).delete().eq(`id`,t);if(n){Qn(e,n.message);return}location.hash=`#/terminliste`})}function tr(e,t){return`<option value="">— vel —</option>`+(e??[]).map(e=>`<option value="${e.id}"${e.id===t?` selected`:``}>${e.navn}</option>`).join(``)}function nr(e){return e?Number(e):null}function rr(e){return(e??``).replace(/"/g,`&quot;`)}async function ir(e,{id:t}={}){e.innerHTML=`<p class="laster" style="text-align:center;margin-top:40px;">Laster…</p>`;let[{data:n},{data:r},{data:i}]=await Promise.all([a.from(`klubb`).select(`id, navn`).eq(`eraktiv`,!0).order(`navn`),a.from(`klasse`).select(`id, navn`).order(`navn`),a.from(`kjonn`).select(`id, navn`).order(`id`)]),o=null;if(t){let{data:n}=await a.from(`kaster`).select(`*`).eq(`id`,t).single();if(o=n,!await _e()&&!await ve(o?.klubbid)){e.innerHTML=`<p class="feil" style="text-align:center;margin-top:40px;">Ingen tilgang til denne utøvaren.</p>`;return}}let s=t?`Rediger utøvar: ${o?`${o.fornavn} ${o.etternavn}`:``}`:`Ny utøvar`,c=o??{};e.innerHTML=`
    <div class="container py-4" style="max-width:560px">
      <h2 class="mb-4">${s}</h2>
      <form id="kaster-skjema">
        ${B(`Fornamn*`,`<input type="text" class="form-control" name="fornavn" value="${sr(c.fornavn)}" required>`)}
        ${B(`Etternamn*`,`<input type="text" class="form-control" name="etternavn" value="${sr(c.etternavn)}" required>`)}
        ${B(`Kjønn*`,`<select class="form-select" name="kjonnid">${ar(i,c.kjonnid)}</select>`)}
        ${B(`Klubb`,`<select class="form-select" name="klubbid"><option value="">— vel —</option>${(n??[]).map(e=>`<option value="${e.id}"${e.id===c.klubbid?` selected`:``}>${e.navn}</option>`).join(``)}</select>`)}
        ${B(`Klasse`,`<select class="form-select" name="klasseid">${ar(r,c.klasseid)}</select>`)}
        ${B(`E-post`,`<input type="email" class="form-control" name="epost" value="${sr(c.epost)}">`)}
        ${B(`Telefon`,`<input type="tel" class="form-control" name="telefon" value="${sr(c.telefon)}">`)}
        ${B(`Medlemsnummer`,`<input type="number" class="form-control" name="medlemsnummer" value="${c.medlemsnummer??``}">`)}
        <div class="mb-3 form-check">
          <input class="form-check-input" type="checkbox" name="eraktiv" id="eraktiv"${c.eraktiv===!1?``:` checked`}>
          <label class="form-check-label" for="eraktiv">Er aktiv</label>
        </div>
        <div class="d-flex gap-2 mt-4">
          <button type="submit" class="btn btn-primary">Lagre</button>
          ${t?`<button type="button" id="slett-knapp" class="btn btn-outline-danger ms-auto">Slett utøvar</button>`:``}
        </div>
      </form>
    </div>`,e.querySelector(`#kaster-skjema`).addEventListener(`submit`,async n=>{n.preventDefault();let r=new FormData(n.target),i={fornavn:r.get(`fornavn`).trim(),etternavn:r.get(`etternavn`).trim(),kjonnid:or(r.get(`kjonnid`)),klubbid:or(r.get(`klubbid`)),klasseid:or(r.get(`klasseid`)),epost:r.get(`epost`).trim()||null,telefon:r.get(`telefon`).trim()||null,medlemsnummer:r.get(`medlemsnummer`)?Number(r.get(`medlemsnummer`)):null,eraktiv:r.get(`eraktiv`)===`on`},{data:o,error:s}=t?await a.from(`kaster`).update(i).eq(`id`,t).select(`id`).single():await a.from(`kaster`).insert(i).select(`id`).single();if(s){Qn(e,s.message);return}$n(e,`Utøvaren er lagra.`),t||setTimeout(()=>{location.hash=`#/kaster/${o.id}/admin`},1500)}),e.querySelector(`#slett-knapp`)?.addEventListener(`click`,async()=>{if(!confirm(`Slett utøvaren «${o?.fornavn} ${o?.etternavn}»? Dette kan ikkje angrast.`))return;let{error:n}=await a.from(`kaster`).delete().eq(`id`,t);if(n){Qn(e,n.message);return}location.hash=`#/kastere`})}function ar(e,t){return`<option value="">— vel —</option>`+(e??[]).map(e=>`<option value="${e.id}"${e.id===t?` selected`:``}>${e.navn}</option>`).join(``)}function or(e){return e?Number(e):null}function sr(e){return(e??``).replace(/"/g,`&quot;`)}async function cr(e,{id:t}={}){if(!t){e.innerHTML=`<p class="feil" style="text-align:center;margin-top:40px;">Manglande ID.</p>`;return}e.innerHTML=`<p class="laster" style="text-align:center;margin-top:40px;">Laster…</p>`;let{data:n}=await a.from(`klubb`).select(`*`).eq(`id`,t).single();if(!n){e.innerHTML=`<p class="feil" style="text-align:center;margin-top:40px;">Klubb ikkje funne.</p>`;return}if(!await _e()&&!await ve(Number(t))){e.innerHTML=`<p class="feil" style="text-align:center;margin-top:40px;">Ingen tilgang til denne klubben.</p>`;return}e.innerHTML=`
    <div class="container py-4" style="max-width:520px">
      <h2 class="mb-4">Rediger klubb: ${n.navn}</h2>
      <form id="klubb-skjema">
        ${B(`Namn*`,`<input type="text" class="form-control" name="navn" value="${lr(n.navn)}" required>`)}
        ${B(`Kortnamn`,`<input type="text" class="form-control" name="kortnavn" value="${lr(n.kortnavn)}">`)}
        ${B(`Logo-URL`,`<input type="url" class="form-control" name="logourl" value="${lr(n.logourl)}">`)}
        <div class="mb-3 form-check">
          <input class="form-check-input" type="checkbox" name="eraktiv" id="eraktiv"${n.eraktiv?` checked`:``}>
          <label class="form-check-label" for="eraktiv">Er aktiv</label>
        </div>
        <button type="submit" class="btn btn-primary mt-2">Lagre</button>
      </form>
    </div>`,e.querySelector(`#klubb-skjema`).addEventListener(`submit`,async n=>{n.preventDefault();let r=new FormData(n.target),{error:i}=await a.from(`klubb`).update({navn:r.get(`navn`).trim(),kortnavn:r.get(`kortnavn`).trim(),logourl:r.get(`logourl`).trim()||null,eraktiv:r.get(`eraktiv`)===`on`}).eq(`id`,t);if(i){Qn(e,i.message);return}$n(e,`Klubben er lagra.`)})}function lr(e){return(e??``).replace(/"/g,`&quot;`)}async function ur(e,{id:t}={}){if(!t){e.innerHTML=`<p class="feil" style="text-align:center;margin-top:40px;">Manglande stevne-ID.</p>`;return}e.innerHTML=`<p class="laster" style="text-align:center;margin-top:40px;">Laster…</p>`;let n=await O(),r=n?.profil?.rolle===`admin`,i=n?.profil?.rolle===`klubbadmin`,o=r||i,{data:s}=await a.from(`stevne`).select(`id, navn, dato, sted, erfullfort, klubbid`).eq(`id`,t).single();if(!s){e.innerHTML=`<p class="feil" style="text-align:center;margin-top:40px;">Stevnet finst ikkje.</p>`;return}let c=s.dato?new Date(new Date(s.dato+`T12:00:00`).getTime()-2*864e5).toISOString().slice(0,10):null,l=s.dato?new Date(new Date(s.dato+`T12:00:00`).getTime()+2*864e5).toISOString().slice(0,10):null,u=[a.from(`pamelding`).select(`id, kasterid, kaster:kasterid(id, fornavn, etternavn, klubb:klubbid(navn))`).eq(`stevneid`,t).order(`id`)];s.klubbid&&c&&u.push(a.from(`stevne`).select(`id, navn, dato`).eq(`klubbid`,s.klubbid).eq(`erfullfort`,!1).neq(`id`,t).gte(`dato`,c).lte(`dato`,l).order(`dato`)),o&&(r?u.push(a.from(`kaster`).select(`id, fornavn, etternavn, klubb:klubbid(navn)`).eq(`eraktiv`,!0).order(`etternavn`)):n.klubber.length&&u.push(a.from(`kaster`).select(`id, fornavn, etternavn, klubb:klubbid(navn)`).in(`klubbid`,n.klubber).eq(`eraktiv`,!0).order(`etternavn`)));let d=await Promise.all(u),f=d[0].data??[],p=[],m=[],h=1;s.klubbid&&c&&(p=d[h++]?.data??[]),o&&(m=d[h]?.data??[]);let g=s.dato?T(s.dato):``,_=n?.profil?.kobling_status===`godkjent`,v=n?.profil?.kasterid,y=f.some(e=>e.kasterid===v),b=``;n?!_&&!o?b=`<div class="alert alert-warning">
      Du må <a href="#/minside">koble kontoen din til ein utøvarprofil</a> for å melde deg på.
    </div>`:s.erfullfort?b=`<div class="alert alert-secondary">Dette stevnet er fullført. Påmelding er stengt.</div>`:_&&y?b=`
      <div class="alert alert-success d-flex justify-content-between align-items-center">
        <span>Du er påmeldt</span>
        <button id="avmeld-knapp" class="btn btn-sm btn-outline-danger">Meld av</button>
      </div>`:_&&!s.erfullfort&&(b=`
      <form id="pamelding-skjema" class="card p-3 mb-3">
        <h5 class="mb-3">Meld deg på</h5>
        <div id="pm-feil" class="alert alert-danger d-none"></div>
        <button type="submit" class="btn btn-primary">Meld på</button>
      </form>`):b=`<div class="alert alert-info">
      <a href="#/logginn?redirect=/stevne/${t}/pamelding">Logg inn</a> for å melde deg på.
    </div>`;let x=``;if(o&&!s.erfullfort){let e=new Set(f.map(e=>e.kasterid));x=`
      <form id="admin-pamelding-skjema" class="card p-3 mb-3 border-warning">
        <h5 class="mb-3">Meld på klubbmedlem</h5>
        <div class="mb-3">
          <label class="form-label">Utøvar</label>
          <select class="form-select" name="admin_kasterid" required>
            <option value="">— vel utøvar —</option>${m.filter(t=>!e.has(t.id)).map(e=>`<option value="${e.id}">${e.etternavn}, ${e.fornavn} — ${e.klubb?.navn??``}</option>`).join(``)}
          </select>
        </div>
        <div id="admin-pm-feil" class="alert alert-danger d-none"></div>
        <button type="submit" class="btn btn-warning">Meld på</button>
      </form>`}let S=p.length?`
    <div class="mt-4 mb-3">
      <h5>Andre stevner same helg (same arrangør)</h5>
      <ul class="list-unstyled">
        ${p.map(e=>{let t=e.dato?T(e.dato):``;return`<li><a href="#/stevne/${e.id}/pamelding">${e.navn} — ${t}</a></li>`}).join(``)}
      </ul>
    </div>`:``,C=f.length?`<table class="table table-sm">
        <thead><tr><th>Namn</th><th>Klubb</th>${o?`<th></th>`:``}</tr></thead>
        <tbody>
          ${f.map(e=>`<tr>
            <td>${e.kaster?`<a href="#/kastere/${e.kaster.id}">${e.kaster.fornavn} ${e.kaster.etternavn}</a>`:`—`}</td>
            <td>${e.kaster?.klubb?.navn??``}</td>
            ${o?`<td><button class="btn btn-sm btn-outline-danger fjern-pm" data-id="${e.id}">Fjern</button></td>`:``}
          </tr>`).join(``)}
        </tbody>
      </table>`:`<p class="text-muted">Ingen påmeldingar enno.</p>`;e.innerHTML=`
    <div class="container py-4" style="max-width:720px">
      <h2 class="mb-1">${s.navn}</h2>
      <p class="text-muted mb-4">${g}${s.sted?` · `+s.sted:``}</p>
      ${b}
      ${x}
      ${S}
      <h5 class="mt-4 mb-2">Påmeldingar (${f.length})</h5>
      ${C}
    </div>`,e.querySelector(`#pamelding-skjema`)?.addEventListener(`submit`,async r=>{r.preventDefault();let i=e.querySelector(`#pm-feil`);i.classList.add(`d-none`);let{error:o}=await a.from(`pamelding`).insert({stevneid:Number(t),kasterid:v,bruker_id:n.user.id});if(o){i.textContent=o.message,i.classList.remove(`d-none`);return}ur(e,{id:t})}),e.querySelector(`#admin-pamelding-skjema`)?.addEventListener(`submit`,async r=>{r.preventDefault();let i=new FormData(r.target),o=e.querySelector(`#admin-pm-feil`);o.classList.add(`d-none`);let s=Number(i.get(`admin_kasterid`));if(!s){o.textContent=`Vel ein utøvar.`,o.classList.remove(`d-none`);return}let{error:c}=await a.from(`pamelding`).insert({stevneid:Number(t),kasterid:s,bruker_id:n.user.id});if(c){o.textContent=c.message,o.classList.remove(`d-none`);return}ur(e,{id:t})}),e.querySelector(`#avmeld-knapp`)?.addEventListener(`click`,async()=>{let n=f.find(e=>e.kasterid===v);!n||!confirm(`Vil du melde deg av?`)||(await a.from(`pamelding`).delete().eq(`id`,n.id),ur(e,{id:t}))}),e.querySelectorAll(`.fjern-pm`).forEach(n=>{n.addEventListener(`click`,async()=>{confirm(`Fjern påmelding?`)&&(await a.from(`pamelding`).delete().eq(`id`,Number(n.dataset.id)),ur(e,{id:t}))})})}function dr(e,t){return e===t?[1.5,1.5]:e>t?[2,+(t>=11)]:[+(e>=11),2]}function fr(e,t){let n=e??[];if(n.some(e=>e.posisjon!=null))return[n.find(e=>e.posisjon===1)??null,n.find(e=>e.posisjon===2)??null];let r=[...n].sort((e,n)=>(t[e.kasterid]??1/0)-(t[n.kasterid]??1/0));return[r[0]??null,r[1]??null]}function V(e){return e?.omgangar?.length?e.omgangar.reduce((e,t)=>e+(t.score??0),0):e?.score_poeng??0}function pr(e){return e?.omgangar?.length?e.omgangar.reduce((e,t)=>e+(t.antall_ringer??0),0):e?.antall_ringer??0}var H=[1,2,3,4,6];async function mr(e,t,n,r,{erArrangor:i=!1,erDeltakar:o=!1,onBekreft:s=null,omgangEl:c=null,p3ks:l=null,hcp1:u=0,hcp2:d=0}={}){if(l&&t.er_tre_spelarar)return hr(e,t,n,r,l,{erArrangor:i,erDeltakar:o,onBekreft:s,omgangEl:c});let f=[],p=null,m=null,h=t.er_bekreftet,g=i||o&&!t.er_bekreftet;await y(),E();let _=[n?.id,r?.id].filter(Boolean),v=a.channel(`scoreboard-kamp-${t.id}`).on(`postgres_changes`,{event:`*`,schema:`public`,table:`kamp_omgang`},async e=>{let t=e.new?.kamp_spelar_id??e.old?.kamp_spelar_id;(!t||_.includes(t))&&(await y(),E())}).on(`postgres_changes`,{event:`UPDATE`,schema:`public`,table:`kamp`,filter:`id=eq.${t.id}`},async e=>{e.new?.er_bekreftet&&(t.er_bekreftet=!0,await y(),E())}).subscribe();window.addEventListener(`hashchange`,()=>{a.removeChannel(v)},{once:!0});async function y(){let e=[n?.id,r?.id].filter(Boolean);if(!e.length)return;let{data:i}=await a.from(`kamp_omgang`).select(`id, kamp_spelar_id, omgang, score, antall_ringer`).in(`kamp_spelar_id`,e).order(`omgang`),o={};for(let e of i??[])o[e.omgang]||(o[e.omgang]={omgang:e.omgang,s1:0,s2:0,r1:0,r2:0}),e.kamp_spelar_id===n?.id?(o[e.omgang].s1=e.score??0,o[e.omgang].r1=e.antall_ringer??0):(o[e.omgang].s2=e.score??0,o[e.omgang].r2=e.antall_ringer??0);f=Object.values(o).sort((e,t)=>e.omgang-t.omgang);let[s,c]=x();h=C(s,c)||t.er_bekreftet}function b(){return[f.reduce((e,t)=>e+t.s1,0),f.reduce((e,t)=>e+t.s2,0)]}function x(){let[e,t]=b();return[e+u,t+d]}function S(){return[f.reduce((e,t)=>e+t.r1,0),f.reduce((e,t)=>e+t.r2,0)]}function C(e,n){return t.fase===`innledende`?e>=21||n>=21:e>=21&&e-n>=2||n>=21&&n-e>=2}function w(){return f.length>0?f[f.length-1].omgang+1:1}function ee(e,t){let n=new Set,r=new Set;return e!==null&&(H.forEach(t=>{t!==e&&n.add(t)}),[1,2,4].includes(e)?H.forEach(e=>r.add(e)):[1,2,4].forEach(e=>r.add(e))),t!==null&&(H.forEach(e=>{e!==t&&r.add(e)}),[1,2,4].includes(t)?H.forEach(e=>n.add(e)):[1,2,4].forEach(e=>n.add(e))),{p1Dis:n,p2Dis:r}}function te(){return n?.kaster?`${n.kaster.fornavn} ${n.kaster.etternavn}`:`Spelar 1`}function T(){return r?.kaster?`${r.kaster.fornavn} ${r.kaster.etternavn}`:`Spelar 2`}function E(){e.innerHTML=``;let[n,r]=x(),[a,l]=S(),u=w(),{p1Dis:d,p2Dis:_}=ee(p,m),v=g&&!h&&(p!==null||m!==null),y=h&&!t.er_bekreftet&&(i||o)&&!!s,b=f.length*2;c&&(c.textContent=t.er_bekreftet?`Fullført`:h?`Ferdig`:`Omgang ${u}`);let C=U(`div`,null,`sb-wrap`);if(C.appendChild(D(te(),n,a,b,p,d,!g,1)),C.appendChild(D(T(),r,l,b,m,_,!g,2)),e.appendChild(C),g){let t=U(`div`,null,`sb-angre-rad`);if(f.length>0){let e=U(`div`,null,`sb-omg-btns`);for(let t of f){let n=U(`button`,String(t.omgang),`sb-omg-btn`);n.title=`Slett frå omgang ${t.omgang}`,n.addEventListener(`click`,()=>re(t.omgang)),e.appendChild(n)}t.appendChild(e)}let n=U(`button`,`↩`,`sb-angre-btn`);n.title=`Angre val for denne omgangen`,n.disabled=p===null&&m===null,n.addEventListener(`click`,()=>{p=null,m=null,E()}),t.appendChild(n),e.appendChild(t)}if(y){let t=U(`button`,`Bekreft kamp`,`sb-neste-btn sb-neste-btn--bekreft`);t.addEventListener(`click`,async()=>{t.disabled=!0,t.textContent=`Lagrar…`,await s()}),e.appendChild(t)}else if(g){let t=U(`button`,`Neste omgang`,`sb-neste-btn`);t.disabled=!v,t.addEventListener(`click`,ne),e.appendChild(t)}e.querySelectorAll(`[data-spelar]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=parseInt(e.dataset.spelar),n=parseInt(e.dataset.val);t===1?p=n:m=n,E()})})}function D(e,t,n,r,i,a,o,s){let c=U(`div`,null,`sb-spelar-panel`);c.appendChild(U(`div`,e,`sb-spelar-namn`)),c.appendChild(U(`div`,String(t),`sb-score`));let l=r>0?Math.round(n/r*100):0;if(c.appendChild(U(`p`,`Ring: ${n} av ${r} ( ${l}% )`,`sb-ringer-info`)),!o){let e=U(`div`,null,`sb-knappar`);for(let t of H){let n=U(`button`,String(t),`sb-poeng-btn`);n.dataset.spelar=String(s),n.dataset.val=String(t),a.has(t)&&(n.disabled=!0),i===t&&n.classList.add(`sb-valgt`),e.appendChild(n)}c.appendChild(e)}return c}async function ne(){let e=w(),t=p??0,i=m??0,o=t===6?2:+(t===3||t===4),s=i===6?2:+(i===3||i===4),c=[];n?.id&&c.push({kamp_spelar_id:n.id,omgang:e,score:t,antall_ringer:o}),r?.id&&c.push({kamp_spelar_id:r.id,omgang:e,score:i,antall_ringer:s});let{error:l}=await a.from(`kamp_omgang`).insert(c);if(l){alert(`Feil ved lagring: `+l.message);return}f.push({omgang:e,s1:t,s2:i,r1:o,r2:s}),p=null,m=null;let[u,d]=x();C(u,d)&&(h=!0),E()}async function re(e){if(!confirm(`Slett omgang ${e} og alle etter? Dette kan ikkje angrast.`))return;let t=[n?.id,r?.id].filter(Boolean),{error:i}=await a.from(`kamp_omgang`).delete().in(`kamp_spelar_id`,t).gte(`omgang`,e);if(i){alert(`Feil ved sletting: `+i.message);return}f=f.filter(t=>t.omgang<e),p=null,m=null;let[o,s]=x();h=C(o,s),E()}}function U(e,t,n){let r=document.createElement(e);return t!=null&&(r.textContent=t),n&&(r.className=n),r}async function hr(e,t,n,r,i,{erArrangor:o,erDeltakar:s,onBekreft:c,omgangEl:l}){let u=o||s&&!t.er_bekreftet,d=[n,r,i].filter(Boolean),f=d.map(e=>e.id).filter(Boolean),p=[],m=[],h=[null,null,null];function g(e){return p.filter(t=>t.kamp_spelar_id===d[e]?.id).reduce((e,t)=>e+(t.score??0),0)}function _(e){return e?.kaster?`${e.kaster.fornavn} ${e.kaster.etternavn}`:`Spelar`}function v(){if(!p.length)return[];let e=Math.max(...p.map(e=>e.omgang)),t=new Set([0,1,2].filter(e=>d[e])),n=[],r=[0,0,0];for(let i=1;i<=e;i++){for(let e of t){let t=p.find(t=>t.kamp_spelar_id===d[e].id&&t.omgang===i);t&&(r[e]+=t.score??0)}let e=!0;for(;e&&t.size>1;){e=!1;for(let i of[...t]){let a=[...t].filter(e=>e!==i),o=Math.min(...a.map(e=>r[e]));if(r[i]>=21&&r[i]-o>=2){n.push(i),t.delete(i),e=!0;break}}}}return t.size===1&&n.length===2&&n.push([...t][0]),n}async function y(){if(!f.length)return;let{data:e}=await a.from(`kamp_omgang`).select(`id, kamp_spelar_id, omgang, score, antall_ringer`).in(`kamp_spelar_id`,f).order(`omgang`);p=e??[],m=v()}await y();let b=a.channel(`scoreboard-kamp3-${t.id}`).on(`postgres_changes`,{event:`*`,schema:`public`,table:`kamp_omgang`},async e=>{let t=e.new?.kamp_spelar_id??e.old?.kamp_spelar_id;(!t||f.includes(t))&&(await y(),S())}).on(`postgres_changes`,{event:`UPDATE`,schema:`public`,table:`kamp`,filter:`id=eq.${t.id}`},async e=>{e.new?.er_bekreftet&&(t.er_bekreftet=!0,await y(),S())}).subscribe();window.addEventListener(`hashchange`,()=>a.removeChannel(b),{once:!0});function x(e){let t=d.map(()=>new Set),n=e.filter(e=>h[e]!==null);if(!n.length)return t;let r=n.some(e=>[1,2,4].includes(h[e])),i=n.some(e=>[3,6].includes(h[e]));for(let n of e)h[n]===null?r?H.forEach(e=>t[n].add(e)):i&&[1,2,4].forEach(e=>t[n].add(e)):H.forEach(e=>{e!==h[n]&&t[n].add(e)});return t}function S(){e.innerHTML=``;let n=d.map((e,t)=>g(t)),r=[0,1,2].filter(e=>d[e]&&!m.includes(e)),i=m.length===d.length,a=p.length?Math.max(...p.map(e=>e.omgang)):0,o=x(r);l&&(l.textContent=t.er_bekreftet?`Fullført`:i?`Ferdig`:`Omgang ${a+1}`);let s=U(`div`,null,`sb-wrap sb-wrap--3p`);if(d.forEach((e,r)=>{let a=m.includes(r),c=a?m.indexOf(r)+1:null,l=U(`div`,null,`sb-spelar-panel${a?` sb-spelar-panel--vann`:``}`);if(l.appendChild(U(`div`,_(e),`sb-spelar-namn`)),l.appendChild(U(`div`,String(n[r]),`sb-score`)),c&&l.appendChild(U(`div`,`${c}. plass`,`sb-plass-badge`)),!a&&u&&!i&&!t.er_bekreftet){let e=U(`div`,null,`sb-knappar`);for(let t of H){let n=U(`button`,String(t),`sb-poeng-btn`);n.dataset.spelar=String(r),n.dataset.val=String(t),h[r]===t&&n.classList.add(`sb-valgt`),o[r].has(t)&&(n.disabled=!0),e.appendChild(n)}l.appendChild(e)}s.appendChild(l)}),e.appendChild(s),u&&!i&&!t.er_bekreftet){let t=U(`div`,null,`sb-angre-rad`);if(p.length>0){let e=U(`div`,null,`sb-omg-btns`),n=[...new Set(p.map(e=>e.omgang))].sort((e,t)=>e-t);for(let t of n){let n=U(`button`,String(t),`sb-omg-btn`);n.title=`Slett frå omgang ${t}`,n.addEventListener(`click`,()=>w(t)),e.appendChild(n)}t.appendChild(e)}let n=U(`button`,`↩`,`sb-angre-btn`);n.title=`Angre val for denne omgangen`,n.disabled=r.every(e=>h[e]===null),n.addEventListener(`click`,()=>{h=[null,null,null],S()}),t.appendChild(n),e.appendChild(t);let i=r.some(e=>h[e]!==null),a=U(`button`,`Neste omgang`,`sb-neste-btn`);a.disabled=!i,a.addEventListener(`click`,C),e.appendChild(a)}if(i&&!t.er_bekreftet&&c&&u){let t=U(`button`,`Bekreft kamp`,`sb-neste-btn sb-neste-btn--bekreft`);t.addEventListener(`click`,async()=>{t.disabled=!0,t.textContent=`Lagrar…`,await c(m.map(e=>d[e].kasterid))}),e.appendChild(t)}else t.er_bekreftet&&e.appendChild(U(`div`,`Kamp fullført`,`alert alert-success mt-2`));e.querySelectorAll(`[data-spelar]`).forEach(e=>{e.addEventListener(`click`,()=>{h[parseInt(e.dataset.spelar)]=parseInt(e.dataset.val),S()})})}async function C(){let e=[0,1,2].filter(e=>d[e]&&!m.includes(e)),t=p.length?Math.max(...p.map(e=>e.omgang))+1:1,n=e.map(e=>{let n=h[e]??0;return{kamp_spelar_id:d[e].id,omgang:t,score:n,antall_ringer:n===6?2:+(n===3||n===4)}}),{error:r}=await a.from(`kamp_omgang`).insert(n);if(r){alert(`Feil: `+r.message);return}h=[null,null,null],await y(),S()}async function w(e){if(!confirm(`Slett omgang ${e} og alle etter? Dette kan ikkje angrast.`))return;let{error:t}=await a.from(`kamp_omgang`).delete().in(`kamp_spelar_id`,f).gte(`omgang`,e);if(t){alert(`Feil: `+t.message);return}h=[null,null,null],await y(),S()}S()}async function gr(e,{id:t}={}){let n=Number(t);e.innerHTML=`<p style="text-align:center;margin-top:40px;">Laster…</p>`;let[{data:r},i]=await Promise.all([a.from(`kamp`).select(`
        id, stevneid, fase, runde_nummer, bane_nummer, er_bekreftet, er_walkover, er_tre_spelarar,
        stevne:stevneid(navn),
        spelarar:kamp_spelar(
          id, kasterid, posisjon, score_poeng, kamp_poeng, antall_ringer,
          kaster:kasterid(id, fornavn, etternavn)
        )
      `).eq(`id`,n).single(),O()]);if(!r){e.innerHTML=`<p style="text-align:center;margin-top:40px;color:red;">Kamp ikkje funne.</p>`;return}let o=(r.spelarar??[]).map(e=>e.kasterid).filter(Boolean),{data:s}=o.length?await a.from(`resultat`).select(`kasterid, hcp`).eq(`stevneid`,r.stevneid).in(`kasterid`,o):{data:[]},c=Object.fromEntries((s??[]).map(e=>[e.kasterid,e.hcp??0])),l=document.querySelector(`.topp-header`);l&&(l.style.display=`none`),e.classList.add(`sb-fullskjerm-modus`),window.addEventListener(`hashchange`,()=>{l&&(l.style.display=``),e.classList.remove(`sb-fullskjerm-modus`)},{once:!0});let u=r.spelarar??[],d=i?.profil?.kasterid??null,f=i?.profil?.rolle??null,p=f===`admin`||f===`klubbadmin`,m=!!d&&u.some(e=>e.kasterid===d),h=u.find(e=>e.posisjon===1)??u[0]??null,g=u.find(e=>e.posisjon===2)??u[1]??null,_=r.er_tre_spelarar?u.find(e=>e.posisjon===3)??u[2]??null:null,v=c[h?.kasterid]??0,y=c[g?.kasterid]??0,b=r.stevne?.navn??``;function x(e,t,{midtenId:n=null}={}){return`
      <div class="sb-kamp-wrapper">
        <div class="sb-kamp-topbar">
          <div class="sb-kamp-topbar-venstre">
            <button class="sb-tilbake-btn" aria-label="Tilbake">←</button>
            <span class="sb-kamp-stevnenavn">${b}</span>
          </div>
          <div${n?` id="${n}"`:``} class="sb-kamp-topbar-midten">${e}</div>
          <div class="sb-kamp-topbar-høgre">
            <span class="sb-kamp-info-full">Runde ${r.runde_nummer} - Bane ${r.bane_nummer}</span>
            <span class="sb-kamp-info-kort">R${r.runde_nummer} - B${r.bane_nummer}</span>
          </div>
        </div>
        ${t}
      </div>
    `}e.innerHTML=x(`Omgang 1`,`<div id="sb-container" class="sb-page"></div>`,{midtenId:`sb-omgang-tittel`}),e.addEventListener(`click`,e=>{e.target.closest(`.sb-tilbake-btn`)&&history.back()});let S=e.querySelector(`#sb-container`),C=e.querySelector(`#sb-omgang-tittel`);async function w(){if(p){let{data:e}=await a.from(`kamp`).select(`id`).eq(`stevneid`,r.stevneid).eq(`bane_nummer`,r.bane_nummer).eq(`er_bekreftet`,!1).eq(`er_walkover`,!1).order(`runde_nummer`).limit(1).maybeSingle();return e}let{data:e}=await a.from(`kamp_spelar`).select(`kampid`).eq(`kasterid`,d),t=(e??[]).map(e=>e.kampid);if(!t.length)return null;let{data:n}=await a.from(`kamp`).select(`id`).in(`id`,t).eq(`stevneid`,r.stevneid).eq(`er_bekreftet`,!1).eq(`er_walkover`,!1).order(`runde_nummer`).limit(1).maybeSingle();return n}async function ee(e){if(e.er_walkover)return!1;if(p)return e.bane_nummer===r.bane_nummer;let{data:t}=await a.from(`kamp_spelar`).select(`id`).eq(`kampid`,e.id).eq(`kasterid`,d).maybeSingle();return!!t}function te(){sessionStorage.setItem(`ventar-neste-${n}`,`1`),e.innerHTML=x(`Fullført`,`<div style="padding:20px">
        <div class="alert alert-success mb-3"><strong>Kampen er ferdig!</strong></div>
        <div class="alert alert-info">Ventar på neste kamp…</div>
      </div>`);let t=a.channel(`neste-kamp-${n}`).on(`postgres_changes`,{event:`INSERT`,schema:`public`,table:`kamp`,filter:`stevneid=eq.${r.stevneid}`},async e=>{await ee(e.new)&&(a.removeChannel(t),location.hash=`#/kamp/${e.new.id}`)}).subscribe();window.addEventListener(`hashchange`,()=>{sessionStorage.removeItem(`ventar-neste-${n}`),a.removeChannel(t)},{once:!0})}async function T(){let n=await w();n?location.hash=`#/kamp/${n.id}`:p||m?te():gr(e,{id:t})}async function E(e=null){r.fase===`avsluttende`?await ne(e):await D(),await T()}async function D(){let e=[h?.id,g?.id].filter(Boolean),{data:t}=await a.from(`kamp_omgang`).select(`kamp_spelar_id, score, antall_ringer`).in(`kamp_spelar_id`,e),r=0,i=0,o=0,s=0;for(let e of t??[])e.kamp_spelar_id===h?.id?(r+=e.score??0,o+=e.antall_ringer??0):(i+=e.score??0,s+=e.antall_ringer??0);let[c,l]=dr(r+v,i+y);[h?.kasterid,g?.kasterid].filter(Boolean);let u=[];if(h?.id&&u.push(a.from(`kamp_spelar`).update({score_poeng:r+v,kamp_poeng:c,antall_ringer:o}).eq(`id`,h.id)),g?.id&&u.push(a.from(`kamp_spelar`).update({score_poeng:i+y,kamp_poeng:l,antall_ringer:s}).eq(`id`,g.id)),u.length){let e=(await Promise.all(u)).find(e=>e.error)?.error;if(e){alert(`Feil ved lagring av spelarpoeng: `+e.message);return}}let{error:d}=await a.from(`kamp`).update({er_bekreftet:!0}).eq(`id`,n);if(d){alert(`Feil ved bekreftelse: `+d.message);return}}async function ne(e){await a.from(`kamp`).update({er_bekreftet:!0}).eq(`id`,n);let t=null;if(e?.length===3)t=e[2];else{let e=[h?.id,g?.id].filter(Boolean),{data:n}=await a.from(`kamp_omgang`).select(`kamp_spelar_id, score`).in(`kamp_spelar_id`,e),r={};(n??[]).forEach(e=>{r[e.kamp_spelar_id]=(r[e.kamp_spelar_id]??0)+(e.score??0)}),t=(r[h?.id]??h?.score_poeng??0)>=(r[g?.id]??g?.score_poeng??0)?g?.kasterid:h?.kasterid}if(t&&r.stevneid){let{count:n}=await a.from(`resultat`).select(`kasterid`,{count:`exact`,head:!0}).eq(`stevneid`,r.stevneid).is(`runde_eliminert`,null),i=r.runde_navn===`Finale`||r.runde_navn===`Bronsefinale`?{runde_eliminert:r.runde_nummer,plassering:r.runde_navn===`Finale`?2:4}:{runde_eliminert:r.runde_nummer};if(await a.from(`resultat`).update(i).eq(`stevneid`,r.stevneid).eq(`kasterid`,t),r.runde_navn===`Finale`){let n=e?e[0]:t===g?.kasterid?h?.kasterid:g?.kasterid;n&&await a.from(`resultat`).update({plassering:1}).eq(`stevneid`,r.stevneid).eq(`kasterid`,n)}if(r.runde_navn===`Bronsefinale`){let n=e?e[0]:t===g?.kasterid?h?.kasterid:g?.kasterid;n&&await a.from(`resultat`).update({plassering:3}).eq(`stevneid`,r.stevneid).eq(`kasterid`,n)}}}if(r.er_bekreftet&&sessionStorage.getItem(`ventar-neste-${n}`)){await T();return}await mr(S,r,h,g,{erArrangor:p,erDeltakar:m,onBekreft:E,omgangEl:C,p3ks:_,hcp1:v,hcp2:y})}var _r=[{nøkkel:`info`,label:`Info`},{nøkkel:`spillere`,label:`Spelarar`},{nøkkel:`innledende`,label:`Innledande`},{nøkkel:`avsluttende`,label:`Avsluttande`},{nøkkel:`innstillinger`,label:`Innstillingar`}],vr=new Set([`innstillinger`]);function yr(e,t,n=!0,r=`organizer`){return`<ul class="nav nav-tabs mb-3">${_r.filter(e=>n||!vr.has(e.nøkkel)).map(({nøkkel:n,label:i})=>`
      <li class="nav-item">
        <a class="nav-link${t===n?` active`:``}"
           href="#/stevne/${e}/${r}/${n}">${i}</a>
      </li>`).join(``)}</ul>`}function br(e){let t=[...e];for(let e=t.length-1;e>0;e--){let n=Math.floor(Math.random()*(e+1));[t[e],t[n]]=[t[n],t[e]]}return t}function xr(e){return e===2||e===4?!0:e<2?!1:e%3==0?xr(Math.floor(e/3)*2):e%2==0?xr(e/2):!1}function Sr(e){return e%3==0?{c3:e/3,c2:0}:e%2==0?{c3:0,c2:e/2}:{c3:0,c2:0}}function W(e){if(e<2)return[];let t=[],n=Math.floor(e/2);for(let r=e%3;r<=n&&r<=3&&t.filter(e=>e.c2===0).length<2;r+=3){let n=(e-r)/3;if(n<1)break;xr(r+2*n)&&t.push({walkovers:r,c3:n,c2:0})}for(let r=e%2;r<=n&&r<=3&&t.filter(e=>e.c3===0).length<2;r+=2){let n=(e-r)/2;if(n<1)break;let i=r+n;!t.some(e=>e.walkovers===r&&e.c3===0&&e.c2===n)&&xr(i)&&t.push({walkovers:r,c3:0,c2:n})}return t.sort((e,t)=>e.walkovers-t.walkovers||t.c3-e.c3),t}function Cr(e){return e===2?!0:W(e).length>0}function wr(e){let t=Math.ceil(e*.5),n=Math.floor(e*.8),r=[];for(let i=n;i>=t;i--){let t=e-i;t>=2&&Cr(i)&&Cr(t)&&r.push({nA:i,nB:t})}return r}function Tr(e,{runde1:t=null,walkovers1:n=null}={}){let r=[],i=e,a=1,o=!0;for(;i>2;){let e,s,c;if(o){let r=t;!r&&n!==null&&(r={walkovers:n,c3:Math.floor((i-n)/3),c2:0}),r||=W(i)[0]??{walkovers:i%3,c3:Math.floor(i/3),c2:0},c=r.walkovers,e=r.c3,s=r.c2,o=!1}else{let t=Sr(i);e=t.c3,s=t.c2,c=0}let l=e*2+s+c;r.push({runde:a,spelarar:i,baner:e+s,treSpelarar:e>0,walkovers:c,vidare:l}),i=l,a++}return r}function Er(e,{medSeeding:t=!0,isRunde1:n=!1,walkoverTall:r=null,runde1Oppsett:i=null}={}){let a=[],o=[...e];if(n){let e=i?.walkovers??r??o.length%3;if(e>0){let t=o.slice(0,e);o=o.slice(e);for(let e of t)a.push({spelarar:[e.kasterid],erWalkover:!0,erTreSpelarar:!1})}}let s=o.length,c,l;if(i&&n)c=i.c3,l=i.c2;else if(n)c=Math.floor(s/3),l=0;else{let e=Sr(s);c=e.c3,l=e.c2}let u=c+l;if(t&&u>0){let e=br(o.slice(0,u)),t=br(o.slice(u,2*u)),n=br(o.slice(2*u)),r=0;for(let i=0;i<u;i++){let o=i<c,s=[e[i],t[i]];o&&n[r]&&s.push(n[r++]),a.push({spelarar:s.map(e=>e.kasterid),erWalkover:!1,erTreSpelarar:o})}}else{let e=br(o),t=0;for(let n=0;n<c;n++)a.push({spelarar:e.slice(t,t+3).map(e=>e.kasterid),erWalkover:!1,erTreSpelarar:!0}),t+=3;for(let n=0;n<l;n++)a.push({spelarar:e.slice(t,t+2).map(e=>e.kasterid),erWalkover:!1,erTreSpelarar:!1}),t+=2}return a}function Dr(e,t,n){let r=(t??[]).filter(t=>t.spelarar?.some(t=>t.kasterid===e)).sort((e,t)=>e.runde_nummer-t.runde_nummer);return r.length?r.map(t=>{let r=t.spelarar?.find(t=>t.kasterid===e),i=t.spelarar?.find(t=>t.kasterid!==e),a=t.er_walkover&&(!i||!i.kaster),o=a?`Walkover`:i?.kaster?`${i.kaster.fornavn} ${i.kaster.etternavn}`:`—`,s=a?``:i?.kasterid?n[i.kasterid]??``:``,c=s?`${o} (${s})`:o,l=a?21:V(r),u=a?0:V(i);t.er_bekreftet||t.er_walkover;let d=`${l} - ${u}`;return`<tr>
      <td class="text-center">${t.runde_nummer}</td>
      <td class="text-center">${t.bane_nummer??``}</td>
      <td>${c}</td>
      <td class="text-center">${d}</td>
    </tr>`}).join(``):`<tr><td colspan="4" class="text-muted small fst-italic text-center">Ingen kampar</td></tr>`}function Or(e,t){let n=e.querySelector(`#${t}`);n&&n.addEventListener(`click`,e=>{let t=e.target.closest(`tr[data-kasterid]`);if(!t||t.classList.contains(`stilling-detalj`))return;let r=t.dataset.kasterid,i=n.querySelector(`tr.stilling-detalj[data-kasterid="${r}"]`);if(!i)return;let a=i.hidden;n.querySelectorAll(`tr.stilling-detalj`).forEach(e=>{e.hidden=!0}),n.querySelectorAll(`tr[data-kasterid]`).forEach(e=>e.classList.remove(`stilling-aktiv`)),a&&(i.hidden=!1,t.classList.add(`stilling-aktiv`))})}function kr(e,t,n,r,i){return function(){let a=location.hash;t.some(t=>a===`#/stevne/${e}/organizer/${t}`||a===`#/stevne/${e}/live/${t}`)?r(n,e):i()}}function Ar(e,t,n){return`
    ${n?`<button id="neste-runde-btn" class="btn btn-sm btn-warning">Generer neste runde</button>`:``}
    <button id="fullfor-btn" class="btn btn-sm btn-primary"${e.erfullfort||!t?` disabled`:``}>Start avsluttande fase</button>
    <button id="fullfør-turnering-btn" class="btn btn-sm btn-danger"${e.erfullfort?` disabled`:``}>Fullfør turnering</button>
    <button id="test-autofullfør-btn" class="btn btn-sm btn-outline-warning">TEST: Autofullfør</button>
  `}function jr(e,t){let{alleInnlBekrefta:n,harAvslKampar:r,harGruppefordeling:i,harPrekonfigurertFormat:a=!1}=t,o=e.stevne_fase,s=``;return o===`avsluttende`?i&&i&&!r&&(s=`<button id="endre-gruppeinndeling-btn" class="btn btn-sm btn-outline-secondary">Endre gruppeinndeling</button>`):s=n?`
        <button id="start-avsl-btn" class="btn btn-sm btn-success">Start avsluttande fase</button>
        ${a?`<button id="endre-gruppeinndeling-btn" class="btn btn-sm btn-outline-secondary">Endre gruppefordeling</button>`:``}`:`<span class="badge bg-warning text-dark">Innledande fase er ikkje ferdig</span>`,`
    ${s}
    <button id="fullfør-turnering-btn" class="btn btn-sm btn-danger"${e.erfullfort?` disabled`:``}>Fullfør turnering</button>
  `}function Mr(e,t){let n={},r=new Set;for(let i of e){let[,e]=i.er_walkover?fr(i.spelarar,t):[];for(let a of i.spelarar??[])!a.kasterid||!a.kaster||i.er_walkover&&a.kasterid===e?.kasterid||(r.add(a.kasterid),n[a.kasterid]||(n[a.kasterid]={kasterid:a.kasterid,namn:`${a.kaster.fornavn} ${a.kaster.etternavn}`,startnummer:t[a.kasterid]??null,kamp_poeng:0,score_poeng:0,antall_kamper:0}),i.er_bekreftet&&(n[a.kasterid].kamp_poeng+=a.kamp_poeng,n[a.kasterid].score_poeng+=a.score_poeng,n[a.kasterid].antall_kamper+=1))}return{spelMap:n,ekteKasterids:r}}function Nr(e,t){let n=t.filter(e=>e.er_bekreftet);return[...e].sort((e,t)=>{let r=e.runde_eliminert==null;if(r!==(t.runde_eliminert==null))return r?-1:1;if(!r){let n=(t.runde_eliminert??0)-(e.runde_eliminert??0);if(n!==0)return n;let r=e.plassering??1/0,i=t.plassering??1/0;if(r!==i)return r-i}if(t.kamp_poeng!==e.kamp_poeng)return t.kamp_poeng-e.kamp_poeng;if(t.score_poeng!==e.score_poeng)return t.score_poeng-e.score_poeng;let i=0,a=0;for(let r of n){let n=r.spelarar?.find(t=>t.kasterid===e.kasterid),o=r.spelarar?.find(e=>e.kasterid===t.kasterid);n&&o&&(i+=n.kamp_poeng??0,a+=o.kamp_poeng??0)}if(i!==a)return a-i;let o=e=>n.flatMap(t=>t.spelarar?.filter(t=>t.kasterid===e)??[]).map(e=>V(e)).sort((e,t)=>t-e),s=o(e.kasterid),c=o(t.kasterid);for(let e=0;e<Math.min(s.length,c.length);e++)if(c[e]!==s[e])return c[e]-s[e];return(e.startnummer??1/0)-(t.startnummer??1/0)})}function Pr(){return crypto.randomUUID()}async function Fr(e,t,n){let{data:r,error:i}=await a.from(`pamelding`).select(`id, kasterid`).eq(`stevneid`,e).order(`id`);if(i)throw Error(`Feil ved henting av påmelding: `+i.message);if(!r?.length)throw Error(`Ingen spelarar påmelde.`);for(let e=r.length-1;e>0;e--){let t=Math.floor(Math.random()*(e+1));[r[e],r[t]]=[r[t],r[e]]}let o=r.length,s={},c=r.map((t,n)=>(s[n+1]=t.kasterid,{stevneid:e,kasterid:t.kasterid,startnummer:n+1}));await a.from(`resultat`).delete().eq(`stevneid`,e);let{error:l}=await a.from(`resultat`).insert(c);if(l)throw Error(`Feil ved lagring av startnummer: `+l.message);let u=t.toLowerCase().includes(`gloppen`),d=0;return d=u?await Ir(e,s,o,n):await Lr(e,s,o),d}async function Ir(e,t,n,r){let i=(n%2==0?n:n+1)/2,o=0;for(let s=1;s<=r;s++){let r=[],c=[];for(let t=1;t<=i;t++){let a=(t-1+s-1)%i+1,o=(t-1+2*(s-1))%i+1+i,l=o>n;r.push({match_id:Pr(),stevneid:e,fase:`innledende`,runde_nummer:s,bane_nummer:t,er_bekreftet:!1,er_walkover:l}),c.push({p1Pos:a,p2Pos:o,erWalkover:l})}let{data:l,error:u}=await a.from(`kamp`).insert(r).select(`id, bane_nummer`);if(u)throw Error(`Feil ved innsetting av kampar (runde ${s}): `+u.message);let d=Object.fromEntries(l.map(e=>[e.bane_nummer,e.id])),f=[];for(let e=0;e<i;e++){let n=d[e+1],{p1Pos:r,p2Pos:i,erWalkover:a}=c[e];f.push({kampid:n,kasterid:t[r],posisjon:1,score_poeng:0,kamp_poeng:0,antall_ringer:0}),a||f.push({kampid:n,kasterid:t[i],posisjon:2,score_poeng:0,kamp_poeng:0,antall_ringer:0})}let{error:p}=await a.from(`kamp_spelar`).insert(f);if(p)throw Error(`Feil ved innsetting av spelarar (runde ${s}): `+p.message);o+=l.length}return o}async function Lr(e,t,n){let r=[],i=[],o=1;for(let t=1;t<=n;t+=2){let a=t+1>n;r.push({match_id:Pr(),stevneid:e,fase:`innledende`,runde_nummer:1,bane_nummer:o,er_bekreftet:!1,er_walkover:a}),i.push({p1Pos:t,p2Pos:a?null:t+1,erWalkover:a}),o++}let{data:s,error:c}=await a.from(`kamp`).insert(r).select(`id, bane_nummer`);if(c)throw Error(`Feil ved innsetting av Swiss runde 1: `+c.message);let l=Object.fromEntries(s.map(e=>[e.bane_nummer,e.id])),u=[];for(let e=0;e<i.length;e++){let n=l[e+1],{p1Pos:r,p2Pos:a,erWalkover:o}=i[e];u.push({kampid:n,kasterid:t[r],posisjon:1,score_poeng:0,kamp_poeng:0,antall_ringer:0}),o||u.push({kampid:n,kasterid:t[a],posisjon:2,score_poeng:0,kamp_poeng:0,antall_ringer:0})}let{error:d}=await a.from(`kamp_spelar`).insert(u);if(d)throw Error(`Feil ved innsetting av Swiss spelarar: `+d.message);return s.length}async function Rr(e){let{data:t,error:n}=await a.from(`kamp`).select(`
      id, runde_nummer, er_bekreftet, er_walkover,
      spelarar:kamp_spelar(id, kasterid, kamp_poeng, score_poeng, posisjon)
    `).eq(`stevneid`,e).eq(`fase`,`innledende`).order(`runde_nummer`);if(n)throw Error(`Feil ved henting av kampar: `+n.message);let r=Math.max(...t.map(e=>e.runde_nummer))+1,i=new Set;for(let e of t)for(let t of e.spelarar??[])t.kasterid&&i.add(t.kasterid);let o=[...i],s={};for(let e of o)s[e]=o.filter(t=>t!==e);for(let e of t){let t=(e.spelarar??[]).filter(e=>e.kasterid);if(t.length===2){let[e,n]=[t[0].kasterid,t[1].kasterid];s[e]=s[e].filter(e=>e!==n),s[n]=s[n].filter(t=>t!==e)}}let c={};for(let e of o)c[e]=0;for(let e of t){if(!e.er_walkover)continue;let t=(e.spelarar??[]).find(e=>e.posisjon===1);t?.kasterid&&(c[t.kasterid]=(c[t.kasterid]??0)+1)}let l=Nr(o.map(e=>{let n=0,r=0;for(let i of t){let t=(i.spelarar??[]).find(t=>t.kasterid===e);t&&(n+=t.kamp_poeng??0,r+=t.score_poeng??0)}return{kasterid:e,kamp_poeng:n,score_poeng:r}}),t);function u(e){for(let t=e.length-1;t>=0;t--)if((c[e[t].kasterid]??0)<1)return e[t];return null}function d(e,t){if(e.length===0)return t;if(e.length%2==1){let n=u(e);return n?(c[n.kasterid]++,t.push({p1:n.kasterid,p2:null,erWalkover:!0}),d(e.filter(e=>e.kasterid!==n.kasterid),t)||(c[n.kasterid]--,t.pop(),null)):null}for(let n=0;n<e.length;n++){let r=e[n];for(let i=n+1;i<e.length;i++){let n=e[i];if(s[r.kasterid]?.includes(n.kasterid)){t.push({p1:r.kasterid,p2:n.kasterid,erWalkover:!1});let i=d(e.filter(e=>e.kasterid!==r.kasterid&&e.kasterid!==n.kasterid),t);if(i)return i;t.pop()}}}return null}let f=d(l,[]);if(!f)throw Error(`Paring er ikkje mogleg. Alle moglege motstandarar er allereie spela.`);f.sort((e,t)=>!!e.erWalkover-+!!t.erWalkover);let p=f.map((t,n)=>({match_id:Pr(),stevneid:e,fase:`innledende`,runde_nummer:r,bane_nummer:n+1,er_bekreftet:!1,er_walkover:t.erWalkover})),{data:m,error:h}=await a.from(`kamp`).insert(p).select(`id, bane_nummer`);if(h)throw Error(`Feil ved innsetting av ny Swiss-runde: `+h.message);let g=Object.fromEntries(m.map(e=>[e.bane_nummer,e.id])),_=[];for(let e=0;e<f.length;e++){let{p1:t,p2:n,erWalkover:r}=f[e],i=g[e+1];_.push({kampid:i,kasterid:t,posisjon:1,score_poeng:0,kamp_poeng:0,antall_ringer:0}),r||_.push({kampid:i,kasterid:n,posisjon:2,score_poeng:0,kamp_poeng:0,antall_ringer:0})}let{error:v}=await a.from(`kamp_spelar`).insert(_);if(v)throw Error(`Feil ved innsetting av Swiss spelarar: `+v.message);return{rundeNummer:r,antallKampar:m.length}}async function zr(e,t,n,r,i=0,o=null){let s=t.map(()=>Pr()),c=i,l=t.map((t,i)=>({match_id:s[i],stevneid:e,fase:`avsluttende`,runde_nummer:n,gruppe_navn:r??null,bane_nummer:t.erWalkover?null:++c,er_bekreftet:!1,er_walkover:t.erWalkover,er_tre_spelarar:t.erTreSpelarar,runde_navn:o})),{data:u,error:d}=await a.from(`kamp`).insert(l).select(`id, match_id`);if(d)throw Error(`Feil ved innsetting av cup-kampar: `+d.message);let f=Object.fromEntries(u.map(e=>[e.match_id,e.id])),p=[];for(let e=0;e<t.length;e++){let n=f[s[e]];t[e].spelarar.forEach((e,t)=>{p.push({kampid:n,kasterid:e,posisjon:t+1,score_poeng:0,kamp_poeng:0,antall_ringer:0})})}let{error:m}=await a.from(`kamp_spelar`).insert(p);if(m)throw Error(`Feil ved innsetting av cup-spelarar: `+m.message);return u.length}async function Br(e){let{data:t}=await a.from(`resultat`).select(`kasterid, gruppeid, gruppe:gruppeid(navn), plassering, kamp_poeng_innl, score_poeng_innl, startnummer`).eq(`stevneid`,e).is(`runde_eliminert`,null);return t??[]}async function Vr(e,t,n,r=null){let i=[`A`,`B`,`C`],o=0;for(let s of t){let t=Er(s.spelarar,{medSeeding:n,isRunde1:!0,runde1Oppsett:s.runde1Oppsett??null}),{data:c}=await a.from(`kamp`).select(`bane_nummer`).eq(`stevneid`,e).eq(`fase`,`avsluttende`).eq(`runde_nummer`,1).not(`bane_nummer`,`is`,null).order(`bane_nummer`,{ascending:!1}).limit(1),l=c?.[0]?.bane_nummer??0,u=0;if(r&&s.gruppeNavn){let e=i.indexOf(s.gruppeNavn);for(let t=0;t<e;t++){let e=r[i[t]];e&&(u+=(e.c3??0)+(e.c2??0))}}let d=Math.max(l,u),f=s.spelarar.length===4;o+=await zr(e,t,1,s.gruppeNavn,d,f?`Semifinale`:null)}return o}async function Hr(e,t,n){let{data:r}=await a.from(`kamp`).select(`runde_nummer`).eq(`stevneid`,e).eq(`fase`,`avsluttende`).eq(`gruppe_navn`,t).order(`runde_nummer`,{ascending:!1}).limit(1),i=(r?.[0]?.runde_nummer??0)+1,o=(await Br(e)).filter(e=>e.gruppe?.navn===t);o.sort((e,t)=>(t.kamp_poeng_innl??0)-(e.kamp_poeng_innl??0)||(t.score_poeng_innl??0)-(e.score_poeng_innl??0)||(e.startnummer??0)-(t.startnummer??0));let s=o.map((e,t)=>({kasterid:e.kasterid,plassering:t+1})),c=s.length===4,l=Er(s,{medSeeding:n,isRunde1:!1}),{data:u}=await a.from(`kamp`).select(`bane_nummer`).eq(`stevneid`,e).eq(`fase`,`avsluttende`).eq(`runde_nummer`,i).not(`bane_nummer`,`is`,null).order(`bane_nummer`,{ascending:!1}).limit(1),d=u?.[0]?.bane_nummer??0,f=l.map(()=>Pr()),p=d,m=l.map((n,r)=>({match_id:f[r],stevneid:e,fase:`avsluttende`,runde_nummer:i,gruppe_navn:t,bane_nummer:n.erWalkover?null:++p,er_bekreftet:!1,er_walkover:n.erWalkover,er_tre_spelarar:n.erTreSpelarar,runde_navn:c?`Semifinale`:null})),{data:h,error:g}=await a.from(`kamp`).insert(m).select(`id, match_id`);if(g)throw Error(`Feil: `+g.message);let _=Object.fromEntries(h.map(e=>[e.match_id,e.id])),v=[];for(let e=0;e<l.length;e++){let t=_[f[e]];l[e].spelarar.forEach((e,n)=>{v.push({kampid:t,kasterid:e,posisjon:n+1,score_poeng:0,kamp_poeng:0,antall_ringer:0})})}let{error:y}=await a.from(`kamp_spelar`).insert(v);if(y)throw Error(`Feil: `+y.message);return{rundeNummer:i,antallKampar:h.length}}async function Ur(e,t){let{data:n}=await a.from(`kamp`).select(`
      id, runde_nummer,
      spelarar:kamp_spelar(id, kasterid, score_poeng, posisjon,
        omgangar:kamp_omgang(score))
    `).eq(`stevneid`,e).eq(`fase`,`avsluttende`).eq(`gruppe_navn`,t).eq(`runde_navn`,`Semifinale`).eq(`er_bekreftet`,!0);if(!n?.length)throw Error(`Semifinalane er ikkje bekrefta.`);let r=n[0].runde_nummer+1,i=[],o=[];for(let e of n){let t=[...e.spelarar??[]].sort((e,t)=>{let n=e.omgangar?.length?e.omgangar.reduce((e,t)=>e+(t.score??0),0):e.score_poeng??0;return(t.omgangar?.length?t.omgangar.reduce((e,t)=>e+(t.score??0),0):t.score_poeng??0)-n});t[0]&&i.push(t[0].kasterid),t[1]&&o.push(t[1].kasterid)}let{data:s}=await a.from(`kamp`).select(`bane_nummer`).eq(`stevneid`,e).eq(`fase`,`avsluttende`).eq(`runde_nummer`,r).not(`bane_nummer`,`is`,null).order(`bane_nummer`,{ascending:!1}).limit(1),c=s?.[0]?.bane_nummer??0,l={match_id:Pr(),stevneid:e,fase:`avsluttende`,runde_nummer:r,gruppe_navn:t,bane_nummer:c+1,runde_navn:`Finale`,er_bekreftet:!1,er_walkover:!1,er_tre_spelarar:!1},u={match_id:Pr(),stevneid:e,fase:`avsluttende`,runde_nummer:r,gruppe_navn:t,bane_nummer:c+2,runde_navn:`Bronsefinale`,er_bekreftet:!1,er_walkover:!1,er_tre_spelarar:!1},{data:d,error:f}=await a.from(`kamp`).insert([l,u]).select(`id, runde_navn`);if(f)throw Error(`Feil: `+f.message);let p=d.find(e=>e.runde_navn===`Finale`)?.id,m=d.find(e=>e.runde_navn===`Bronsefinale`)?.id,h=[...i.map((e,t)=>({kampid:p,kasterid:e,posisjon:t+1,score_poeng:0,kamp_poeng:0,antall_ringer:0})),...o.map((e,t)=>({kampid:m,kasterid:e,posisjon:t+1,score_poeng:0,kamp_poeng:0,antall_ringer:0}))],{error:g}=await a.from(`kamp_spelar`).insert(h);if(g)throw Error(`Feil: `+g.message);for(let t of o)await a.from(`resultat`).update({runde_eliminert:n[0].runde_nummer,plassering:3}).eq(`stevneid`,e).eq(`kasterid`,t)}async function Wr(e,{id:t}={},n=null){let r=Number(t);e.innerHTML=`<p class="laster">Laster…</p>`;let[{data:i},{count:o}]=await Promise.all([a.from(`stevne`).select(`
        id, navn, dato, tid, sted, stevne_fase, antall_runder_innl,
        kastemetodeInnl:innledendekastemetodeid(id, navn),
        kastemetodeAvsl:avsluttendekastemetodeid(id, navn)
      `).eq(`id`,r).single(),a.from(`pamelding`).select(`id`,{count:`exact`,head:!0}).eq(`stevneid`,r)]);if(!i){e.innerHTML=`<p class="feil">Stevne ikkje funne.</p>`;return}let s=i.stevne_fase??null,c=s===null||s===`ikke_startet`,l=i.kastemetodeInnl?.navn??`—`,u=l.toLowerCase().includes(`gloppen`);n&&c&&(n.innerHTML=`<button id="start-stevne-btn" class="btn btn-sm btn-success">Start stevne</button>`,n.querySelector(`#start-stevne-btn`).addEventListener(`click`,async()=>{if((o??0)<2){alert(`Stevnet må ha minst 2 spelarar for å startast.`);return}if(u&&!i.antall_runder_innl){alert(`Du må setje antal rundar for innledande fase (Gloppen-metoden krev dette).
Gå til Innstillingar for å endre.`);return}let{count:e}=await a.from(`pamelding`).select(`id`,{count:`exact`,head:!0}).eq(`stevneid`,r).eq(`er_bekreftet`,!1);if(e>0&&!confirm(`${e} spelar(ar) er ikkje bekrefta. Vil du starte stevnet likevel?`))return;try{await Fr(r,l,i.antall_runder_innl??1)}catch(e){alert(`Feil ved kampgenerering: `+e.message);return}let{error:t}=await a.from(`stevne`).update({stevne_fase:`innledende`}).eq(`id`,r);if(t){alert(`Feil ved oppdatering av fase: `+t.message);return}location.hash=`#/stevne/${r}/organizer/innledende`})),e.innerHTML=`
    <div class="card mb-3 org-max-480">
      <div class="card-body">
        <table class="table table-sm mb-0">
          <tbody>
            <tr><th>Stad</th><td>${i.sted??`—`}</td></tr>
            <tr><th>Dato</th><td>${i.dato?E(i.dato):`—`}</td></tr>
            <tr><th>Tid</th><td>${i.tid?ne(i.tid):`—`}</td></tr>
            <tr><th>Kastemetode innledande</th><td>${l}</td></tr>
            <tr><th>Kastemetode avsluttande</th><td>${i.kastemetodeAvsl?.navn??`—`}</td></tr>
            <tr><th>Antal rundar innledande</th><td>${i.antall_runder_innl??`—`}</td></tr>
            <tr><th>Påmelde spelarar</th><td>${o??0}</td></tr>
          </tbody>
        </table>
      </div>
    </div>`}var Gr=[];async function Kr(){let{data:e,error:t}=await a.from(`kaster`).select(`*, klubb(navn)`).eq(`eraktiv`,!0);return t?(console.error(`Feil ved henting av kastere:`,t),[]):(Gr=e,e)}function qr(e){return`${e.fornavn} ${e.etternavn}`}function Jr(e){return[...e].sort((e,t)=>{let n=(e.klubbid||``).toString(),r=(t.klubbid||``).toString();if(n!==r)return n.localeCompare(r);let i=(e.etternavn||``).localeCompare(t.etternavn||``);return i===0?(e.fornavn||``).localeCompare(t.fornavn||``):i})}function Yr(e,t,n){let r=t.toLowerCase();return e.filter(e=>n.has(e.id)?!1:!r||qr(e).toLowerCase().includes(r)||e.klubb?.navn?.toLowerCase().includes(r))}function Xr(e){let t=document.createElement(`div`);t.className=`d-flex flex-column flex-grow-1`;let n=document.createElement(`h6`);n.textContent=e,n.className=`fw-bold mb-1`;let r=document.createElement(`div`);r.className=`border rounded deltaker-tabell-wrapper flex-grow-1 overflow-auto`;let i=document.createElement(`table`);return i.className=`table table-sm table-hover table-bordered mb-0`,r.appendChild(i),t.appendChild(n),t.appendChild(r),{column:t,table:i,titleEl:n}}function Zr(e,t,n,r,i=!1){let a=document.createElement(`tr`),o=document.createElement(`td`);o.textContent=qr(e);let s=document.createElement(`td`);s.textContent=e.klubb?.navn??``;let c=document.createElement(`td`);if(c.className=`text-center th-40`,t){let e=document.createElement(`span`);e.className=`text-success fw-bold`,e.textContent=`✓`,c.appendChild(e)}else if(!i){let t=document.createElement(`button`);t.textContent=`✓`,t.className=`btn btn-outline-danger btn-sm rounded-circle p-0 lh-1 deltaker-bekreft-btn`,t.title=`Bekreft spelar`,t.addEventListener(`click`,t=>{t.stopPropagation(),r(e)}),c.appendChild(t)}let l=document.createElement(`td`);if(l.className=`text-center th-40`,!i){let t=document.createElement(`button`);t.innerHTML=`&times;`,t.className=`btn btn-danger btn-sm rounded-circle p-0 lh-1 deltaker-fjern-btn`,t.title=`Fjern spelar`,t.addEventListener(`click`,t=>{t.stopPropagation(),n(e)}),l.appendChild(t)}return a.appendChild(c),a.appendChild(o),a.appendChild(s),a.appendChild(l),a}function Qr(e,t,n=!1){let r=document.createElement(`tr`),i=document.createElement(`td`);i.textContent=qr(e);let a=document.createElement(`td`);return a.textContent=e.klubb?.navn??`Ingen klubb`,n||(r.classList.add(`deltaker-rad`),r.addEventListener(`click`,()=>t(e))),r.appendChild(i),r.appendChild(a),r}function $r(e){let t=document.createElement(`tr`),n=document.createElement(`td`);return n.className=`text-center text-muted fst-italic py-3`,n.textContent=e,n.colSpan=4,t.appendChild(n),t}async function ei(e,{id:t,isAdmin:n=!1}={},r=null){let i=Number(t);e.innerHTML=`<p class="laster">Laster…</p>`;let[{data:o},{data:s}]=await Promise.all([a.from(`stevne`).select(`id, navn, stevne_fase`).eq(`id`,i).single(),a.from(`pamelding`).select(`id, kasterid, er_bekreftet, kaster:kasterid(id, fornavn, etternavn, klubbid, klubb:klubbid(navn))`).eq(`stevneid`,i).order(`id`)]);if(await Kr(),!o){e.innerHTML=`<p class="feil">Stevne ikkje funne.</p>`;return}let c=o.stevne_fase??null,l=n&&(c===null||c===`ikke_startet`),u=Gr,d=new Map((s??[]).map(e=>[e.kasterid,e.er_bekreftet]));e.innerHTML=`
    <div>
      ${l?``:`<div class="alert alert-warning py-2">Spelarar kan ikkje endrast etter at stevnet er starta.</div>`}
      <div class="row g-3" id="spelarar-layout"></div>
    </div>
  `;let f=e.querySelector(`#spelarar-layout`),p=document.createElement(`div`);p.className=`col-md-6 d-flex flex-column`;let m=document.createElement(`input`);m.type=`text`,m.placeholder=`Søk etter namn eller klubb…`,m.className=`form-control mb-2`;let{column:h,table:g}=Xr(`Tilgjengelege spelarar`);p.appendChild(m),p.appendChild(h),f.appendChild(p);let _=document.createElement(`div`);_.className=`col-md-6 d-flex flex-column`;let v=document.createElement(`input`);v.type=`text`,v.className=`form-control mb-2 deltaker-søk-spacer`,v.tabIndex=-1,v.disabled=!0;let{column:y,table:b,titleEl:x}=Xr(`Påmelde spelarar`);_.appendChild(v),_.appendChild(y),f.appendChild(_);function S(){b.innerHTML=``;let e=Jr(u.filter(e=>d.has(e.id)));if(x.textContent=`Påmelde spelarar: ${e.length}`,!e.length){b.appendChild($r(`Ingen spelarar påmelde`));return}for(let t of e)b.appendChild(Zr(t,d.get(t.id),async e=>{await ni(i,e.id),d.delete(e.id),S(),C()},async e=>{await ri(i,e.id),d.set(e.id,!0),S()},!l))}function C(){let e=Jr(Yr(u,m.value,d));if(g.innerHTML=``,!e.length){g.appendChild($r(`Ingen spelarar funne`));return}for(let t of e)g.appendChild(Qr(t,async e=>{await ti(i,e.id),d.set(e.id,!1),S(),C()},!l))}m.addEventListener(`input`,C),S(),C()}async function ti(e,t){let{data:{user:n}}=await a.auth.getUser(),{error:r}=await a.from(`pamelding`).insert({stevneid:e,kasterid:t,...n?{bruker_id:n.id}:{}});r&&alert(`Feil ved innmelding: `+r.message)}async function ni(e,t){let{error:n}=await a.from(`pamelding`).delete().eq(`stevneid`,e).eq(`kasterid`,t);n&&alert(`Feil ved fjerning: `+n.message)}async function ri(e,t){let{error:n}=await a.from(`pamelding`).update({er_bekreftet:!0}).eq(`stevneid`,e).eq(`kasterid`,t);n&&alert(`Feil ved bekreftelse: `+n.message)}function ii(e,t,n,r,i){let a=n,o=r,s=0,c=document.createElement(`div`);c.className=`np-overlay`;function l(){c.innerHTML=``;let n=window.matchMedia(`(max-width: 767px)`).matches,r=!n||s===0,u=!n||s===1,d=G(`button`,`X`,`np-lukk-btn`);d.addEventListener(`click`,()=>document.body.removeChild(c)),c.appendChild(d);let f=G(`button`,`Lagre`,`np-lagre-btn`);f.addEventListener(`click`,()=>{document.body.removeChild(c),i(a,o)}),c.appendChild(f);let p=G(`div`,null,`np-wrap`);if(c.appendChild(p),r){let t=ai(e,a);p.appendChild(t),oi(t,()=>a,e=>{a=e})}if(u){let e=ai(t,o);p.appendChild(e),oi(e,()=>o,e=>{o=e})}if(n){let e=G(`button`,s===0?`Neste →`:`← Tilbake`,`np-nav-btn`);e.addEventListener(`click`,()=>{s^=1,l()}),c.appendChild(e)}}l(),document.body.appendChild(c)}function ai(e,t){let n=G(`div`,null,`np-pad`);n.appendChild(G(`h3`,e,`np-namn`));let r=G(`div`,String(t),`np-score`);r.dataset.scoreEl=`1`,n.appendChild(r);let i=G(`button`,`Reset`,`np-reset-btn`);i.disabled=t===0,i.dataset.resetBtn=`1`,n.appendChild(i);let a=G(`div`,null,`np-grid`);for(let e=1;e<=9;e++){let t=G(`button`,String(e),`np-num-btn`);t.dataset.val=String(e),a.appendChild(t)}a.appendChild(document.createElement(`div`));let o=G(`button`,`0`,`np-num-btn`);return o.dataset.val=`0`,a.appendChild(o),a.appendChild(document.createElement(`div`)),n.appendChild(a),n}function oi(e,t,n){let r=e.querySelector(`[data-score-el]`),i=e.querySelector(`[data-reset-btn]`);for(let a of e.querySelectorAll(`[data-val]`))a.addEventListener(`click`,()=>{let e=t(),o=e===0?Number(a.dataset.val):parseInt(String(e)+a.dataset.val);n(o),r.textContent=o,i.disabled=!1});i.addEventListener(`click`,()=>{n(0),r.textContent=`0`,i.disabled=!0})}function G(e,t,n){let r=document.createElement(e);return t!=null&&(r.textContent=t),n&&(r.className=n),r}function si(){let e=Math.floor(Math.random()*27),t=Math.floor(Math.random()*27);return e<21&&t<21?Math.random()<.5?[Math.floor(Math.random()*6)+21,t]:[e,Math.floor(Math.random()*6)+21]:[e,t]}async function ci(e){let{data:t}=await a.from(`kamp`).select(`id, er_walkover, spelarar:kamp_spelar(id, kasterid)`).eq(`stevneid`,e).eq(`fase`,`innledende`).eq(`er_bekreftet`,!1);if(!t?.length)return;let n=new Set;for(let e of t){let t=e.spelarar??[];if(e.er_walkover){await a.from(`kamp`).update({er_bekreftet:!0}).eq(`id`,e.id);for(let e of t)e.kasterid&&n.add(e.kasterid)}else{let[r,i]=t,[o,s]=si(),[c,l]=dr(o,s),u=[a.from(`kamp`).update({er_bekreftet:!0}).eq(`id`,e.id)];r&&(u.push(a.from(`kamp_spelar`).update({score_poeng:o,kamp_poeng:c}).eq(`id`,r.id)),r.kasterid&&n.add(r.kasterid)),i&&(u.push(a.from(`kamp_spelar`).update({score_poeng:s,kamp_poeng:l}).eq(`id`,i.id)),i.kasterid&&n.add(i.kasterid)),await Promise.all(u)}}}async function li(e,t){let{data:n}=await a.from(`kamp`).select(`id`).eq(`stevneid`,e).eq(`fase`,t),r=(n??[]).map(e=>e.id);if(!r.length)return;let{data:i}=await a.from(`kamp_spelar`).select(`id`).in(`kampid`,r),o=(i??[]).map(e=>e.id);o.length&&(await a.from(`kamp_omgang`).delete().in(`kamp_spelar_id`,o),await a.from(`kamp_spelar`).delete().in(`kampid`,r)),await a.from(`kamp`).delete().in(`id`,r)}async function ui(e){await li(e,`avsluttende`),await li(e,`innledende`),await a.from(`resultat`).delete().eq(`stevneid`,e),await a.from(`stevne`).update({stevne_fase:`ikke_startet`,runde1_format:null}).eq(`id`,e)}function di(){let e=document.createElement(`div`);e.className=`header`;let t=document.createElement(`div`);t.className=`title`;let n=document.createElement(`div`);n.className=`main-title`,n.textContent=`STARTKORT`;let r=document.createElement(`div`);return r.className=`subtitle`,r.textContent=`GLOPPEN-METODEN`,t.appendChild(n),t.appendChild(r),e.appendChild(t),e}function fi(e,t,n,r){let i=document.createElement(`table`);i.className=`info-table`;let a=document.createElement(`tr`);a.appendChild(K(`Navn:`)),a.appendChild(K(t,`value`,`player-name`)),a.appendChild(K(`Startnr.`)),a.appendChild(K(e,`value`,`player-id`)),i.appendChild(a);let o=document.createElement(`tr`);o.appendChild(K(`Klubb:`)),o.appendChild(K(n,`value`,`player-club`)),o.appendChild(K(`Klasse/Gruppe`)),o.appendChild(K(``,`value`,null)),i.appendChild(o);let s=document.createElement(`tr`);return s.appendChild(K(`Stevne:`)),s.appendChild(K(r,`value`,`tournament-name`)),s.appendChild(K(``)),s.appendChild(K(``)),i.appendChild(s),i}function K(e,t,n,r){let i=document.createElement(`td`);return t&&(i.className=t),n&&(i.id=n),r&&(i.title=r),i.textContent=e,i}function pi(e){let t=document.createElement(`table`);t.className=`rounds-table`;let n=document.createElement(`thead`),r=document.createElement(`tr`);r.appendChild(q(`BANE`,2,1,`small`)),r.appendChild(q(`RUNDE`,2,1,`small`)),r.appendChild(q(`POENG`,2,1,`small allow-wrap`)),r.appendChild(q(`SKÅR`,2,1,`small`)),r.appendChild(q(`MOTSTANDAR`,1,3,`wide`)),n.appendChild(r);let i=document.createElement(`tr`);i.appendChild(q(`NR.`,1,1,`small`)),i.appendChild(q(`NAVN`,1,1,`wide`)),i.appendChild(q(`SKÅR`,1,1,`small`)),n.appendChild(i),t.appendChild(n);let a=mi(e);t.appendChild(a);let o=document.createElement(`tfoot`),s=document.createElement(`tr`);return s.appendChild(J(`SUM`,2)),s.appendChild(J(``)),s.appendChild(J(``)),s.appendChild(J(`SIGN`)),s.appendChild(J(``,5)),o.appendChild(s),t.appendChild(o),t}function mi(e){let t=document.createElement(`tbody`);t.id=`rounds-body`;let n=e.length;for(let r=0;r<n;r++){let n=e[r]||{},i=document.createElement(`tr`);i.className=`round-row`,i.id=`round-row-${r+1}`,i.appendChild(J(n.court===void 0?``:n.court,1,`court-round-${r+1}`,`small`)),i.appendChild(J(r+1,1,`round-${r+1}`,`small`)),i.appendChild(J(n.matchPoints??``,1,`match-points-round-${r+1}`,`small`)),i.appendChild(J(n.playerScore??``,1,`score-points-round-${r+1}`,`small`)),i.appendChild(J(n.opponentId===void 0?``:n.opponentId,1,`opponent-nr-round-${r+1}`,`small`)),i.appendChild(J(n.opponentName===void 0?``:n.opponentName,1,`opponent-name-round-${r+1}`,`wide`)),i.appendChild(J(n.opponentScore??``,1,`opp-score-round-${r+1}`,`small`)),t.appendChild(i)}return t}function q(e,t=1,n=1){let r=document.createElement(`th`);return typeof e==`string`&&e.includes(`
`)?r.innerHTML=e.replace(/\n/g,`<br>`):r.textContent=e,n>1&&(r.colSpan=n),t>1&&(r.rowSpan=t),arguments.length>3&&arguments[3]&&arguments[3].split(/\s+/).forEach(e=>{e&&r.classList.add(e)}),r}function J(e,t=1,n=null){let r=document.createElement(`td`);return r.textContent=e,t>1&&(r.colSpan=t),n&&(r.id=n),arguments.length>3&&arguments[3]&&arguments[3].split(/\s+/).forEach(e=>{e&&r.classList.add(e)}),r}function hi(){let e=document.createElement(`div`);return e.className=`notes`,e.innerHTML=`
        <div>Ved under 10 i skår, for eksempel 7 - skriv 07</div>
        <div>Unngå rettingar/overstrykningar - ved feilskriving - kontakt domar</div>
        <div class="wo">Møter du W.O. fører du 2kp og 21sp (nytt frå 2011)</div>
    `,e}function gi(){let e=document.createElement(`table`);return e.className=`cup-table`,e.innerHTML=`
        <tr>
          <td colspan="8">CUP:</td>
        </tr>
        <tr>
          <td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td>
        </tr>
        <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    `,e}function _i(e,t,n,r,i){let a=document.createElement(`div`);return a.className=`startcard`,a.appendChild(di()),a.appendChild(fi(e,t,n,r)),a.appendChild(pi(i)),a.appendChild(hi()),a.appendChild(gi()),a}var vi=new URL(`data:text/css;base64,LyogVHZpbmcgbGlnZ2VuZGUgQTQgdmVkIHV0c2tyaWZ0ICovCkBwYWdlIHsKICBzaXplOiBBNCBsYW5kc2NhcGU7CiAgbWFyZ2luOiAxY207Cn0KCmJvZHkgewogIGZvbnQtZmFtaWx5OiBBcmlhbCwgc2Fucy1zZXJpZjsKICBiYWNrZ3JvdW5kOiAjZmZmOwogIG1hcmdpbjogMDsKICBwYWRkaW5nOiAwOwp9CgovKiBTdGFydGtvcnQtc3RpbCBmb3IgdG8gQTUgc3TDpWVuZGUgcGVyIEE0IGxpZ2dlbmRlICovCi5zdGFydGNhcmQgewogIHdpZHRoOiA0OCU7ICAgICAgLyogTGl0dCBtaW5kcmUgZW5uIGhhbHZwYXJ0ZW4gZm9yIG1hcmdpbiAqLwogIGhlaWdodDogOTAlOyAgICAgLyogSnVzdGVyIGV0dGVyIGJlaG92ICovCiAgZGlzcGxheTogaW5saW5lLWJsb2NrOwogIHZlcnRpY2FsLWFsaWduOiB0b3A7CiAgYm94LXNpemluZzogYm9yZGVyLWJveDsKICBwYWdlLWJyZWFrLWluc2lkZTogYXZvaWQ7CiAgbWFyZ2luOiAxJTsKfQoKLmhlYWRlciB7CiAgZGlzcGxheTogZmxleDsKICBhbGlnbi1pdGVtczogY2VudGVyOwogIG1hcmdpbi1ib3R0b206IDEycHg7CiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7CiAgZ2FwOiAxNnB4Owp9Ci5sb2dvIHsKICB3aWR0aDogODBweDsKICBoZWlnaHQ6IDgwcHg7CiAgZmxleC1zaHJpbms6IDA7Cn0KLmxvZ28gaW1nIHsKICB3aWR0aDogNzBweDsKICBoZWlnaHQ6IDcwcHg7Cn0KLnRpdGxlIHsKICBmbGV4OiAxOwogIGRpc3BsYXk6IGZsZXg7CiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsKICBhbGlnbi1pdGVtczogY2VudGVyOwogIGp1c3RpZnktY29udGVudDogY2VudGVyOwogIHRleHQtYWxpZ246IGNlbnRlcjsKfQoubWFpbi10aXRsZSB7CiAgZm9udC1zaXplOiAyZW07CiAgZm9udC13ZWlnaHQ6IGJvbGQ7CiAgbGV0dGVyLXNwYWNpbmc6IDJweDsKfQouc3VidGl0bGUgewogIGZvbnQtc2l6ZTogMS4xZW07CiAgbWFyZ2luLXRvcDogMnB4OwogIGxldHRlci1zcGFjaW5nOiAxcHg7Cn0KCi5pbmZvLXRhYmxlIHsKICB3aWR0aDogMTAwJTsKICBib3JkZXItY29sbGFwc2U6IGNvbGxhcHNlOwogIG1hcmdpbi1ib3R0b206IDEwcHg7Cn0KLmluZm8tdGFibGUgdGQgewogIHBhZGRpbmc6IDJweCA2cHg7CiAgZm9udC1zaXplOiAxZW07Cn0KLmluZm8tdGFibGUgLnZhbHVlIHsKICBib3JkZXItYm90dG9tOiAxcHggc29saWQgIzAwMDsKICBtaW4td2lkdGg6IDgwcHg7Cn0KCi5yb3VuZHMtdGFibGUgewogIHdpZHRoOiAxMDAlOwogIGJvcmRlci1jb2xsYXBzZTogY29sbGFwc2U7CiAgbWFyZ2luLWJvdHRvbTogMTBweDsKICBmb250LXNpemU6IDAuOTVlbTsKfQoucm91bmRzLXRhYmxlIHRoLCAucm91bmRzLXRhYmxlIHRkIHsKICBib3JkZXI6IDFweCBzb2xpZCAjMDAwOwogIHRleHQtYWxpZ246IGNlbnRlcjsKICBoZWlnaHQ6IDM2cHg7CiAgbWluLWhlaWdodDogMzBweDsKICBtYXgtaGVpZ2h0OiA0NHB4OwogIHBhZGRpbmc6IDJweCA0cHg7CiAgYm94LXNpemluZzogYm9yZGVyLWJveDsKICB2ZXJ0aWNhbC1hbGlnbjogbWlkZGxlOwogIGZvbnQtc2l6ZTogMC45NWVtOwogIG92ZXJmbG93OiB2aXNpYmxlOwogIHRleHQtb3ZlcmZsb3c6IGluaXRpYWw7Cn0KCi5yb3VuZHMtdGFibGUgdGggewogIHdoaXRlLXNwYWNlOiBwcmUtbGluZTsKfQoKLnJvdW5kcy10YWJsZSB0aC5hbGxvdy13cmFwIHsKICB3aGl0ZS1zcGFjZTogcHJlLWxpbmU7Cn0KCi5yb3VuZHMtdGFibGUgdGQgewogIHdoaXRlLXNwYWNlOiBub3dyYXA7Cn0KCi8qIFNtYWxsIGNvbHVtbnM6IEJBTkUsIFJVTkRFLCBLQU1QIFBPRU5HLCBTS8OFUiwgTlIuLCBTS8OFUiAob3Bwb25lbnQpICovCi5yb3VuZHMtdGFibGUgdGguc21hbGwsIC5yb3VuZHMtdGFibGUgdGQuc21hbGwgewogIHdpZHRoOiA0MHB4OwogIG1pbi13aWR0aDogMzJweDsKICBtYXgtd2lkdGg6IDU2cHg7Cn0KCi8qIFdpZGVyIGNvbHVtbiBmb3IgTkFWTiAqLwoucm91bmRzLXRhYmxlIHRoLndpZGUsIC5yb3VuZHMtdGFibGUgdGQud2lkZSB7CiAgd2lkdGg6IDIxNnB4OwogIG1pbi13aWR0aDogMTIwcHg7CiAgbWF4LXdpZHRoOiAyNDBweDsKICB3aGl0ZS1zcGFjZTogbm93cmFwOwogIG92ZXJmbG93OiB2aXNpYmxlOwogIHRleHQtb3ZlcmZsb3c6IGluaXRpYWw7Cn0KLnJvdW5kcy10YWJsZSB0aCB7CiAgYmFja2dyb3VuZDogI2Y1ZjVmNTsKICBmb250LXdlaWdodDogYm9sZDsKfQoucm91bmRzLXRhYmxlIHRmb290IHRkIHsKICBmb250LXdlaWdodDogYm9sZDsKICBib3JkZXItdG9wOiAycHggc29saWQgIzAwMDsKfQoKLm5vdGVzIHsKICBmb250LXNpemU6IDAuOTVlbTsKICBtYXJnaW46IDEwcHggMCA2cHggMDsKfQoubm90ZXMgLndvIHsKICBmb250LXdlaWdodDogYm9sZDsKICBtYXJnaW4tdG9wOiAycHg7Cn0KCkBtZWRpYSAobWF4LXdpZHRoOiA3MDBweCkgewogIC5yb3VuZHMtdGFibGUgdGgsCiAgLnJvdW5kcy10YWJsZSB0ZCB7CiAgICBmb250LXNpemU6IDAuN2VtOwogIH0KfQoKLmN1cC10YWJsZSB7CiAgd2lkdGg6IDEwMCU7CiAgYm9yZGVyLWNvbGxhcHNlOiBjb2xsYXBzZTsKICBtYXJnaW4tdG9wOiA4cHg7Cn0KLmN1cC10YWJsZSB0ZCB7CiAgYm9yZGVyOiAxcHggc29saWQgIzAwMDsKICB0ZXh0LWFsaWduOiBjZW50ZXI7CiAgd2lkdGg6IDMycHg7CiAgaGVpZ2h0OiAyNHB4OwogIGZvbnQtc2l6ZTogMWVtOwp9Ci5jdXAtdGFibGUgdHI6Zmlyc3QtY2hpbGQgdGQgewogIGJvcmRlcjogbm9uZTsKICB0ZXh0LWFsaWduOiBsZWZ0OwogIGZvbnQtd2VpZ2h0OiBib2xkOwogIGJhY2tncm91bmQ6ICNmZmY7Cn0KCi5hbGlnbi1sZWZ0IHsKICB0ZXh0LWFsaWduOiBsZWZ0ICFpbXBvcnRhbnQ7Cn0=`,``+import.meta.url).href;function yi(e,t,n,r,i){let a=[...n.keys()].sort((e,t)=>e-t),o=i.map(e=>({startnummer:e.startnummer??``,namn:e.namn,klubb:bi(e.kasterid,t),roundInfos:xi(e.kasterid,a,n,r)})).sort((e,t)=>(e.startnummer??1/0)-(t.startnummer??1/0)),s=window.open(``,`_blank`);if(!s){alert(`Kunne ikkje opne utskriftsvindu.`);return}s.document.title=`Startkort – ${e.namn}`;let c=s.document.createElement(`link`);c.rel=`stylesheet`,c.href=vi,s.document.head.appendChild(c),o.forEach(t=>{let n=_i(t.startnummer,t.namn,t.klubb,e.namn,t.roundInfos);s.document.body.appendChild(n)}),s.document.close(),c.onload=()=>{setTimeout(()=>{s.focus(),s.print()},50)}}function bi(e,t){for(let n of t){let t=n.spelarar?.find(t=>t.kasterid===e);if(t?.kaster?.klubb)return t.kaster.klubb.kortnavn||t.kaster.klubb.navn||``}return``}function xi(e,t,n,r){return t.map(t=>{let i=(n.get(t)??[]).find(t=>t.spelarar?.some(t=>t.kasterid===e));if(!i)return{court:``,opponentId:``,opponentName:``};let a=i.spelarar?.find(t=>t.kasterid!==e);return i.er_walkover&&!a?.kaster?{court:i.bane_nummer??``,matchPoints:`2`,playerScore:`21`,opponentId:`-`,opponentName:`Walkover`,opponentScore:`-`}:{court:i.bane_nummer??``,opponentId:a?.kasterid?r[a.kasterid]??``:``,opponentName:a?.kaster?`${a.kaster.fornavn} ${a.kaster.etternavn}`:``}})}var Si=null,Y=null,X=!1,Ci=!1;async function wi(e,{id:t,isAdmin:n=!1}={},r=null){Y=r,X=n,Ci=!1,Si&&=(a.removeChannel(Si),null),e.innerHTML=`<p class="laster">Laster…</p>`,await Z(e,Number(t))}async function Z(e,t){let[{data:n},{data:r},{data:i}]=await Promise.all([a.from(`stevne`).select(`
      id, navn, erfullfort,
      kastemetode:innledendekastemetodeid(id, navn)
    `).eq(`id`,t).single(),a.from(`kamp`).select(`
        id, stevneid, runde_nummer, bane_nummer, er_bekreftet, er_walkover, fase,
        spelarar:kamp_spelar(
          id, kasterid, score_poeng, kamp_poeng, antall_ringer, posisjon,
          kaster:kasterid(id, fornavn, etternavn, klubb:klubbid(kortnavn, navn)),
          omgangar:kamp_omgang(score, antall_ringer)
        )
      `).eq(`stevneid`,t).eq(`fase`,`innledende`).order(`runde_nummer`).order(`bane_nummer`),a.from(`resultat`).select(`kasterid, startnummer, hcp`).eq(`stevneid`,t)]);if(!n){e.innerHTML=`<p class="feil">Stevne ikkje funne.</p>`;return}let o=n.kastemetode?.navn??``,s=!o.toLowerCase().includes(`gloppen`),c=o.toLowerCase().includes(`nordhordland`),l=Object.fromEntries((i??[]).map(e=>[e.kasterid,e.startnummer])),u=Object.fromEntries((i??[]).filter(e=>e.hcp>0).map(e=>[e.kasterid,e.hcp])),d=(r??[]).sort((e,t)=>e.runde_nummer-t.runde_nummer||e.bane_nummer-t.bane_nummer),f=new Map;for(let e of d)f.has(e.runde_nummer)||f.set(e.runde_nummer,[]),f.get(e.runde_nummer).push(e);let{spelMap:p,ekteKasterids:m}=Mr(d,l);for(let e of i??[])p[e.kasterid]&&(p[e.kasterid].hcp=e.hcp??0);let h=Nr(Object.values(p).filter(e=>m.has(e.kasterid)),d),g=d.length>0&&d.every(e=>e.er_bekreftet),_=f.size?Math.max(...f.keys()):0,v=c&&f.size>1,y=v?`<button class="btn btn-sm btn-outline-secondary" id="toggle-rundar-btn">${Ci?`Skjul tidlegare rundar`:`Vis alle rundar (${f.size})`}</button>`:``,b=X&&!s?`<button class="btn btn-sm btn-outline-info" id="startkort-btn">Startkort</button>`:``;Y.innerHTML=(X?Ar(n,g,s):``)+b+y,e.innerHTML=`
    <div class="d-flex gap-3 align-items-start">
      <div class="flex-grow-1">
        ${[...(v&&!Ci?new Map([[_,f.get(_)??[]]]):f).entries()].map(([e,t])=>Ei(e,t,l,X,u)).join(``)}
      </div>
      <div class="org-stilling-sidebar">
        ${Oi(h,d,l,X,t)}
      </div>
    </div>
  `,Or(e,`stilling-innl`),X&&e.querySelectorAll(`.stilling-hcp-celle`).forEach(n=>{n.addEventListener(`click`,async r=>{r.stopPropagation();let o=Number(n.dataset.kasterid),s=Number(n.dataset.stevneid),c=(i??[]).find(e=>e.kasterid===o)?.hcp??0,l=prompt(`Sett HCP for spelar:`,String(c));if(l===null)return;let u=parseInt(l,10);if(isNaN(u)||u<0){alert(`Ugyldig HCP-verdi`);return}let{error:d}=await a.from(`resultat`).update({hcp:u}).eq(`stevneid`,s).eq(`kasterid`,o);if(d){alert(`Feil ved lagring: `+d.message);return}await Z(e,t)})}),Y.querySelector(`#startkort-btn`)?.addEventListener(`click`,()=>{yi(n,d,f,l,h)}),Y.querySelector(`#toggle-rundar-btn`)?.addEventListener(`click`,()=>{Ci=!Ci,Z(e,t)}),Y?.querySelector(`#fullfor-btn`)?.addEventListener(`click`,()=>Ai(e,t)),Y?.querySelector(`#fullfør-turnering-btn`)?.addEventListener(`click`,async()=>{if(!confirm(`Vil du fullføre turneringa? Dette kan ikkje angrast.`))return;let{error:n}=await a.from(`stevne`).update({erfullfort:!0}).eq(`id`,t);if(n){alert(`Feil: `+n.message);return}await Z(e,t)}),Y?.querySelector(`#test-autofullfør-btn`)?.addEventListener(`click`,async n=>{confirm(`Autofullfør alle ubekreftede innledande kamper?`)&&(n.currentTarget.disabled=!0,await ci(t),await Z(e,t))}),s&&Y?.querySelector(`#neste-runde-btn`)?.addEventListener(`click`,async()=>{if(!g){alert(`Noen kamper er ikke bekreftet!`);return}try{let{rundeNummer:n}=await Rr(t);await Z(e,t)}catch(e){alert(`Feil: `+e.message)}});for(let n of d)if(e.querySelector(`#plus-${n.id}`)?.addEventListener(`click`,async()=>{let[r,i]=fr(n.spelarar,l),o=[r?.id,i?.id].filter(Boolean),s=!1;if(o.length){let{data:e}=await a.from(`kamp_omgang`).select(`id`).in(`kamp_spelar_id`,o).limit(1);s=(e?.length??0)>0}s&&!confirm(`Dette sletter detaljar for denne kampen. Er du sikker på at du vil fortsette?`)||ii(r?.kaster?`${r.kaster.fornavn} ${r.kaster.etternavn}`:`—`,i?.kaster?`${i.kaster.fornavn} ${i.kaster.etternavn}`:`—`,V(r),V(i),async(n,c)=>{s&&o.length&&await a.from(`kamp_omgang`).delete().in(`kamp_spelar_id`,o);let l=[];r&&l.push(a.from(`kamp_spelar`).update({score_poeng:n}).eq(`id`,r.id)),i&&l.push(a.from(`kamp_spelar`).update({score_poeng:c}).eq(`id`,i.id)),await Promise.all(l),await Z(e,t)})}),e.querySelector(`#scoreboard-${n.id}`)?.addEventListener(`click`,()=>{location.hash=`#/kamp/${n.id}`}),e.querySelector(`#bekrft-${n.id}`)?.addEventListener(`click`,()=>ki(e,t,n,l,u)),X&&n.er_bekreftet){let[r,i]=fr(n.spelarar,l),o=r?.kaster?`${r.kaster.fornavn} ${r.kaster.etternavn}`:`—`,s=i?.kaster?`${i.kaster.fornavn} ${i.kaster.etternavn}`:`—`,c=()=>{ii(o,s,r?.score_poeng??0,i?.score_poeng??0,async(n,o)=>{let[s,c]=dr(n,o),l=[];r&&l.push(a.from(`kamp_spelar`).update({score_poeng:n,kamp_poeng:s}).eq(`id`,r.id)),i&&l.push(a.from(`kamp_spelar`).update({score_poeng:o,kamp_poeng:c}).eq(`id`,i.id));let u=(await Promise.all(l)).find(e=>e.error)?.error;if(u){alert(`DB-feil: `+u.message);return}await Z(e,t)})};e.querySelectorAll(`[data-endre-score="${n.id}"]`).forEach(e=>e.addEventListener(`click`,c))}Ti(e,t)}function Ti(e,t){if(Si)return;let n=kr(t,[`innledende`],e,Z,()=>{a.removeChannel(Si),Si=null});Si=a.channel(`stevne-innl-${t}`).on(`postgres_changes`,{event:`*`,schema:`public`,table:`kamp_omgang`},n).on(`postgres_changes`,{event:`*`,schema:`public`,table:`kamp`},e=>{(e.new?.stevneid??e.old?.stevneid)===t&&n()}).subscribe()}function Ei(e,t,n,r,i={}){return`
    <div class="mb-3">
      <h6 class="text-center fw-bold mb-1">Runde ${e}</h6>
      <table class="table table-bordered table-sm mb-0 bg-white">
        <thead class="table-dark">
          <tr>
            <th class="th-36 text-center">B</th>
            <th>P1</th>
            <th class="th-48 text-center">S1</th>
            <th class="th-48 text-center">S2</th>
            <th>P2</th>
            ${r?`<th class="th-148"></th>`:`<th class="th-48"></th>`}
          </tr>
        </thead>
        <tbody>
          ${t.map(e=>Di(e,n,r,i)).join(``)}
        </tbody>
      </table>
    </div>`}function Di(e,t,n=!0,r={}){let[i,a]=fr(e.spelarar,t),o=i?.kasterid?t[i.kasterid]??``:``,s=a?.kasterid?t[a.kasterid]??``:``,c=i?.kaster?`${i.kaster.fornavn} ${i.kaster.etternavn}`:`—`,l=e.er_walkover&&!a?.kaster,u=l?`Walkover`:a?.kaster?`${a.kaster.fornavn} ${a.kaster.etternavn}`:`—`,d=o?`${c} (${o})`:c,f=l?s?`Walkover (${s})`:`Walkover`:s?`${u} (${s})`:u,p=(i?.omgangar?.length??0)>0,m=(a?.omgangar?.length??0)>0,h=p||m,g=r[i?.kasterid]??0,_=r[a?.kasterid]??0,v=e.er_bekreftet?i?.score_poeng??0:V(i)+(p?g:0),y=e.er_bekreftet?a?.score_poeng??0:V(a)+(m?_:0),b=e.er_walkover&&!e.er_bekreftet,x=b?21:v,S=b?0:y,C=e.er_bekreftet||e.er_walkover||h||v>0||y>0,w=!e.er_bekreftet&&(e.er_walkover||!h&&(x+g>=21||S+_>=21)),ee=e.er_bekreftet||w?`btn-success`:`btn-outline-secondary`,te=e.er_bekreftet||!w?` disabled`:``,T=e.er_bekreftet&&!h?` disabled`:``,E=n&&e.er_bekreftet?` data-endre-score="${e.id}" class="text-center score-redigerbar"`:` class="text-center"`;return`
    <tr>
      <td class="text-center">${e.bane_nummer??``}</td>
      <td>${d}</td>
      <td${E}>${C?x:``}</td>
      <td${E}>${C?S:``}</td>
      <td>${f}</td>
      <td class="text-end pe-2">
        ${n?`<button class="btn btn-primary btn-sm" id="plus-${e.id}"${e.er_bekreftet?` disabled`:``}>+</button>`:``}
        <button class="btn btn-secondary btn-sm" id="scoreboard-${e.id}" data-bane="${e.bane_nummer??``}" title="Scoreboard"${T}>S</button>
        ${n?`<button class="btn ${ee} btn-sm" id="bekrft-${e.id}"${te}>Bekreft</button>`:``}
      </td>
    </tr>`}function Oi(e,t,n,r=!1,i=null){let a=r||e.some(e=>(e.hcp??0)>0),o=a?7:6;return`
    <div>
      <h6 class="text-center fw-bold mb-1">${e.length} spelarar</h6>
      <table id="stilling-innl" class="table table-bordered table-sm mb-0 bg-white">
        <thead class="table-dark">
          <tr>
            <th class="th-32">#</th>
            <th class="th-32">S</th>
            <th>NAMN</th>
            <th class="th-50 text-center">ANT.</th>
            <th class="th-44 text-center">KP</th>
            <th class="th-44 text-center">SP</th>
            ${a?`<th class="th-44 text-center">HCP</th>`:``}
          </tr>
        </thead>
        <tbody>
          ${e.map((e,s)=>{let c=e.hcp??0,l=a?r?`<td class="text-center stilling-hcp-celle" data-kasterid="${e.kasterid}" data-stevneid="${i}">${c>0?c:`—`}</td>`:`<td class="text-center">${c>0?c:`—`}</td>`:``;return`
            <tr data-kasterid="${e.kasterid}" class="stilling-spelar-rad">
              <td>${s+1}</td>
              <td>${e.startnummer??``}</td>
              <td>${e.namn}</td>
              <td class="text-center">${e.antall_kamper}</td>
              <td class="text-center">${e.kamp_poeng}</td>
              <td class="text-center">${e.score_poeng}</td>
              ${l}
            </tr>
            <tr class="stilling-detalj" data-kasterid="${e.kasterid}" hidden>
              <td colspan="${o}" class="p-0">
                <table class="stilling-detalj-tabell table table-sm table-bordered mb-0">
                  <thead><tr>
                    <th class="text-center">Runde</th>
                    <th class="text-center">Bane</th>
                    <th>Motstandar</th>
                    <th class="text-center">Resultat</th>
                  </tr></thead>
                  <tbody>${Dr(e.kasterid,t,n)}</tbody>
                </table>
              </td>
            </tr>`}).join(``)}
        </tbody>
      </table>
    </div>`}async function ki(e,t,n,r,i={}){let{data:o,error:s}=await a.from(`kamp_spelar`).select(`
      id, kasterid, score_poeng, antall_ringer, posisjon,
      omgangar:kamp_omgang(score, antall_ringer)
    `).eq(`kampid`,n.id);if(s){alert(`Feil ved henting av kampdata: `+s.message);return}let[c,l]=fr(o??[],r),u=i[c?.kasterid]??0,d=i[l?.kasterid]??0,f=(c?.omgangar?.length??0)>0,p=(l?.omgangar?.length??0)>0,m=n.er_walkover?21:V(c)+(f?u:0),h=n.er_walkover?0:V(l)+(p?d:0),g=n.er_walkover?0:pr(c),[_,v]=dr(m,h),y=[];c&&y.push(a.from(`kamp_spelar`).update({score_poeng:m,kamp_poeng:_,antall_ringer:g}).eq(`id`,c.id)),l&&y.push(a.from(`kamp_spelar`).update({score_poeng:h,kamp_poeng:v,antall_ringer:0}).eq(`id`,l.id));let b=(await Promise.all(y)).find(e=>e.error)?.error;if(b){alert(`DB-feil: `+b.message);return}let{error:x}=await a.from(`kamp`).update({er_bekreftet:!0}).eq(`id`,n.id);if(x){alert(`DB-feil: `+x.message);return}await Z(e,t)}async function Ai(e,t){if(!confirm(`Start avsluttande fase?`))return;let{error:n}=await a.from(`stevne`).update({stevne_fase:`avsluttende`}).eq(`id`,t);if(n){alert(`Feil: `+n.message);return}location.hash=`#/stevne/${t}/organizer/avsluttende`}function ji(e,{visSpelarliste:t=!0,initNa:n=null,initFormat:r=null}={}){let i=typeof e==`number`?e:e.length,a=typeof e==`number`?[]:e.map((e,t)=>({...e,cupPlassering:t+1})),o=wr(i),s=n===i?i:n!=null&&o.some(e=>e.nA===n)?n:o[0]?.nA??i,c=i-s,l=o.filter(e=>W(e.nA).some(e=>e.c3>0)),u=o.filter(e=>!W(e.nA).some(e=>e.c3>0)),d=W(i).length>0,f=(e,t)=>e.map((e,r)=>{let a=e.nA===s&&n!==i,o=t+r;return`
      <div class="form-check">
        <input class="form-check-input" type="radio" name="gruppe-split" id="split-${o}" value="${e.nA}" ${a?`checked`:``}>
        <label class="form-check-label" for="split-${o}">A:${e.nA} — B:${e.nB}</label>
      </div>`}).join(``),p=[];l.length&&p.push(`<div class="text-muted small fw-semibold mb-1">3 spillere per bane (A)</div>${f(l,0)}`),u.length&&(p.length&&p.push(`<hr class="my-2">`),p.push(`<div class="text-muted small fw-semibold mb-1">2 spillere per bane (A)</div>${f(u,l.length)}`)),d&&(p.length&&p.push(`<hr class="my-2">`),p.push(`
      <div class="form-check">
        <input class="form-check-input" type="radio" name="gruppe-split" id="split-ingen" value="${i}" ${n===i?`checked`:``}>
        <label class="form-check-label" for="split-ingen">Ingen gruppeinndeling (alle i A)</label>
      </div>`));let m=p.join(``),h=r?.A??W(s)[0]??null,g=c>=2?r?.B??W(c)[0]??null:null,_=t?`<div id="gruppe-preview">${Mi(a,s,h?.walkovers??0,g?.walkovers??0)}</div>`:``;return`
    <div id="gruppe-val-wrapper" data-n="${i}">
      <h5 class="mb-3">Velg gruppeinndeling for cup</h5>
      <div class="d-flex gap-3 align-items-start flex-wrap mb-3">
        <div class="card">
          <div class="card-body">
            ${m}
          </div>
        </div>
        <div id="gruppe-paneler" class="d-flex gap-3 flex-wrap">
          <div id="gruppe-panel-a" class="avsl-gruppe-kol">
            ${Ii(`Gruppe A`,s,`runde1-format-a`,h)}
          </div>
          ${c>=2?`<div id="gruppe-panel-b" class="avsl-gruppe-kol">
            ${Ii(`Gruppe B`,c,`runde1-format-b`,g)}
          </div>`:``}
        </div>
      </div>
      ${_}
      <div class="mt-3 d-flex justify-content-end">
        <button id="bekreft-gruppe-btn" class="btn btn-primary">Bekreft val</button>
      </div>
    </div>
  `}function Mi(e,t,n=0,r=0){let i=e.slice(0,t),a=e.slice(t);function o(e,t=0){return e.map((e,n)=>{let r=n<t;return`
      <tr>
        <td>${e.cupPlassering}</td>
        <td>${e.startnummer??``}</td>
        <td>${e._namn??``}${r?` <span class="badge bg-info text-dark">Walkover</span>`:``}</td>
        <td class="text-center">${e.kamp_poeng_innl??0}</td>
        <td class="text-center">${e.score_poeng_innl??0}</td>
      </tr>`}).join(``)}let s=`
    <thead class="table-dark"><tr>
      <th class="th-32">#</th><th class="th-36">S</th><th>NAMN</th>
      <th class="th-44 text-center">KP</th>
      <th class="th-44 text-center">SP</th>
    </tr></thead>`,c=`
    <table class="table table-bordered table-sm bg-white mb-0">
      ${s}
      <tbody>${o(i,n)}</tbody>
    </table>`,l=a.length?`
    <table class="table table-bordered table-sm bg-white mb-0">
      ${s}
      <tbody>${o(a,r)}</tbody>
    </table>`:``;return`
    <div class="d-flex gap-3 flex-wrap">
      <div class="avsl-gruppe-kol">
        <h6 class="fw-bold text-center">GRUPPE A (${i.length})</h6>
        ${c}
      </div>
      ${a.length?`<div class="avsl-gruppe-kol">
        <h6 class="fw-bold text-center">GRUPPE B (${a.length})</h6>
        ${l}
      </div>`:``}
    </div>`}function Ni(e){let t=e.c3>0?3:2;return`${e.walkovers} walkover - ${t} deltakere per bane`}function Pi(e,t,n,r=null){let i=W(t);return i.length<=1?``:`<div class="d-flex flex-column align-items-start gap-1 mb-2">${i.map((e,t)=>{let i=`${n}-${t}`,a=JSON.stringify(e),o=r?e.walkovers===r.walkovers&&e.c3===r.c3&&e.c2===r.c2:t===0,s=e.c3>0?`btn-outline-success`:`btn-outline-warning`;return`
      <input type="radio" class="btn-check" name="${n}" id="${i}"
        value='${a}' data-oppsett='${a}' autocomplete="off" ${o?`checked`:``}>
      <label class="btn btn-sm ${s}" for="${i}">${Ni(e)}</label>`}).join(``)}</div>`}function Fi(e,t,n){return`<div id="struktur-${n}">
    <table class="table table-sm table-bordered mb-0">
      <thead><tr>
        <th>Runde</th><th>Deltakere (w.o.)</th><th>Baner</th><th>Per bane</th>
      </tr></thead>
      <tbody>${(e>=2?Tr(e,{runde1:t}):[]).map((e,n)=>{let r=e.walkovers??0,i=e.spelarar-r,a=r>0?`${i} <span class="text-muted">(${r} w.o.)</span>`:`${i}`,o;return o=n===0&&t?t.c3>0&&t.c2>0?`2/3`:t.c3>0?`3`:`2`:e.spelarar%e.baner===0?String(e.spelarar/e.baner):`2/3`,`<tr${e.treSpelarar?` class="fw-bold"`:``}>
      <td>${e.runde}</td>
      <td>${a}</td>
      <td>${e.baner}</td>
      <td>${o}</td>
    </tr>`}).join(``)}</tbody>
    </table>
  </div>`}function Ii(e,t,n,r){let i=n.slice(-1),a=Pi(e,t,n,r);return`
    <div class="card">
      <div class="card-body">
        <h6 class="fw-bold mb-2">${a?`${e}: Velg format`:`${e} (${t})`}</h6>
        ${a}
        ${Fi(t,r,i)}
      </div>
    </div>`}var Li=null,Ri=null,zi=!1;async function Bi(e,{id:t,isAdmin:n=!1}={},r=null){Ri=r,zi=n,Li&&=(a.removeChannel(Li),null),e.innerHTML=`<p class="laster">Laster…</p>`,await Q(e,Number(t))}async function Q(e,t){let[{data:n},{data:r},{data:i},{data:o},{count:s}]=await Promise.all([a.from(`stevne`).select(`
      id, navn, stevne_fase, erfullfort, runde1_format,
      avsluttendemetode:avsluttendekastemetodeid(id, navn)
    `).eq(`id`,t).single(),a.from(`kamp`).select(`
      id, fase, runde_nummer, bane_nummer, gruppe_navn, runde_navn,
      er_bekreftet, er_walkover, er_tre_spelarar,
      spelarar:kamp_spelar(id, kasterid, posisjon, score_poeng, kamp_poeng, antall_ringer,
        kaster:kasterid(fornavn, etternavn),
        omgangar:kamp_omgang(score, antall_ringer))
    `).eq(`stevneid`,t).order(`runde_nummer`).order(`bane_nummer`),a.from(`resultat`).select(`
      kasterid, startnummer, plassering, runde_eliminert,
      kamp_poeng_innl, score_poeng_innl,
      gruppe:gruppeid(id, navn)
    `).eq(`stevneid`,t),a.from(`gruppe`).select(`id, navn`).in(`navn`,[`A`,`B`]),a.from(`pamelding`).select(`id`,{count:`exact`,head:!0}).eq(`stevneid`,t)]);if(!n){e.innerHTML=`<p class="feil">Stevne ikkje funne.</p>`;return}let c=(r??[]).filter(e=>e.fase===`innledende`),l=(r??[]).filter(e=>e.fase===`avsluttende`),u=c.length>0&&c.every(e=>e.er_bekreftet),d=l.length>0,f=(i??[]).some(e=>e.gruppe!=null),p=(i??[]).filter(e=>e.runde_eliminert==null),m=Object.fromEntries((o??[]).map(e=>[e.navn,e.id])),h=Object.fromEntries((i??[]).map(e=>[e.kasterid,e.startnummer])),g={};for(let e of r??[])for(let t of e.spelarar??[])t.kasterid&&t.kaster&&!g[t.kasterid]&&(g[t.kasterid]=`${t.kaster.fornavn} ${t.kaster.etternavn}`);let _=(i??[]).map(e=>({...e,_namn:g[e.kasterid]??`Spelar ${e.kasterid}`})),v=Nr(_.map(e=>({...e,kamp_poeng:e.kamp_poeng_innl??0,score_poeng:e.score_poeng_innl??0})),c),y=n.runde1_format?.nA??null,b=n.runde1_format!=null&&n.stevne_fase!==`avsluttende`,x=s??0;zi&&(Ri.innerHTML=jr(n,{alleInnlBekrefta:u,harAvslKampar:d,harGruppefordeling:f,harPrekonfigurertFormat:b})),e.innerHTML=`
    <div class="px-3 py-2">
      ${f?Vi(l,v,h,zi):``}
      ${!f&&n.stevne_fase===`avsluttende`?zi?ji(v,{visSpelarliste:!0,initNa:y,initFormat:n.runde1_format}):`<p class="text-muted fst-italic">Gruppefordeling er ikkje klar enno.</p>`:``}
      ${!f&&n.stevne_fase!==`avsluttende`&&x>0&&zi?ji(x,{visSpelarliste:!1,initNa:y,initFormat:n.runde1_format}):``}
    </div>
  `,Or(e,`stilling-avsl`),Ki(e,t,n,u,f,d,v,o??[],m,l),f&&($i(e,t),d&&qi(e,t,l,h,_,p.length),Qi(e))}function Vi(e,t,n,r=!0){return`
    <div class="avsl-hovudinnhald">
      <div class="avsl-tab-knappar btn-group w-100">
        <button class="btn btn-primary avsl-tab-btn" data-tab="kamper">Kamper</button>
        <button class="btn btn-outline-primary avsl-tab-btn" data-tab="resultat">Resultat</button>
      </div>
      <div class="d-flex gap-3 align-items-start avsl-innhald-rad">
        <div class="d-flex gap-3 flex-grow-1 flex-wrap avsl-kampar-panel">${[...new Set(t.map(e=>e.gruppe?.navn).filter(Boolean))].sort().map(i=>{let a=e.filter(e=>e.gruppe_navn===i),o=t.filter(e=>e.gruppe?.navn===i),s=o.filter(e=>e.runde_eliminert==null).length,c=o.length,l=a.length?Math.max(...a.map(e=>e.runde_nummer)):0,u=a.filter(e=>e.runde_nummer===l),d=u.length>0&&u.every(e=>e.er_bekreftet||e.er_walkover),f=a.some(e=>e.runde_navn===`Semifinale`);return Hi(i,a,s,c,l,r&&(a.length===0||d)&&s>1&&!f,n,r)}).join(``)}</div>
        <div class="avsl-stilling-kol">${Wi(t,e,n)}</div>
      </div>
    </div>`}function Hi(e,t,n,r,i,a,o,s=!0){let c=new Map;for(let e of t)c.has(e.runde_nummer)||c.set(e.runde_nummer,[]),c.get(e.runde_nummer).push(e);let l=[...c.entries()].reverse().map(([e,t])=>{let n=t[0]?.runde_navn??`Runde ${e}`,r=t.filter(e=>!e.er_walkover);return r.length?`
      <h6 class="fw-bold text-center mb-1">${n}</h6>
      <div class="d-flex flex-wrap gap-2 mb-2">
        ${r.map(e=>Ui(e,o,s)).join(``)}
      </div>`:``}).join(``),u=i+1;return`
    <div class="avsl-gruppe-kol">
      <h6 class="text-center fw-bold mb-2">Gruppe ${e} (${r} spelarar)</h6>
      ${a?`<button class="btn btn-success w-100 mt-2"
         data-generer-gruppe="${e}" data-runde="${u}">
         Generer runde ${u}
       </button>`:``}
      ${l}
    </div>`}function Ui(e,t,n=!0){let r=(e.spelarar??[]).sort((e,n)=>(t[e.kasterid]??999)-(t[n.kasterid]??999)),i=e=>e?.kaster?`${e.kaster.fornavn} ${e.kaster.etternavn}`:`—`,a=e.er_walkover?`<tr>
        <td>${t[r[0]?.kasterid]??``}</td>
        <td colspan="2">${i(r[0])} <span class="badge bg-secondary">Walkover</span></td>
      </tr>`:r.map(n=>{let r=V(n),a=e.er_bekreftet||r>0?r:`0`;return`<tr>
          <td class="th-36">${t[n.kasterid]??``}</td>
          <td>${i(n)}</td>
          <td class="text-end">${a}</td>
        </tr>`}).join(``),o=e.er_bekreftet||e.er_walkover,s=(e.omgangar??[]).length>0,c=o?`btn-success`:`btn-outline-secondary`,l=e.er_tre_spelarar?o?`Endre plassering`:`Sett plassering`:`Bekreft`,u=o&&!e.er_tre_spelarar||!o&&s;return`
    <div class="avsl-kamp-block">
      <div class="text-center small fw-semibold text-muted mb-1">Bane ${e.bane_nummer}</div>
      <table class="table table-sm table-bordered mb-0 bg-white">
        <tbody>
          ${a}
          <tr class="">
            <td colspan="3" class="text-end pe-1">
              ${n&&!e.er_walkover&&!e.er_tre_spelarar?`<button class="btn btn-primary btn-sm" id="plus-${e.id}"${o?` disabled`:``}>+</button> `:``}
              <button class="btn btn-secondary btn-sm" id="scoreboard-${e.id}"
                title="Scoreboard"${o&&!e.er_tre_spelarar?` disabled`:``}>S</button>
              ${n?`<button class="btn ${c} btn-sm" id="bekrft-${e.id}"${u?` disabled`:``}>${l}</button>`:``}
            </td>
          </tr>
        </tbody>
      </table>
    </div>`}function Wi(e,t,n){let r=new Map;for(let t of e){let e=t.gruppe?.navn??`_`;r.has(e)||r.set(e,[]),r.get(e).push(t)}let i=r.size>1||!r.has(`_`);return`
    <div>
      <h6 class="text-center fw-bold mb-1">Stilling</h6>
      <table id="stilling-avsl" class="table table-bordered table-sm mb-0 bg-white">
        <thead class="table-dark">
          <tr>
            <th class="th-28">#</th>
            <th class="th-28">S</th>
            <th>NAMN</th>
            <th class="th-44 text-center">KP</th>
            <th class="th-44 text-center">SP</th>
          </tr>
        </thead>
        <tbody>${[...r.entries()].flatMap(([e,r])=>{let a=r.filter(e=>e.runde_eliminert==null).length;return(i&&e!==`_`?`<tr class=""><td colspan="5" class="fw-semibold ps-2">Gruppe ${e}</td></tr>`:``)+r.map((e,r)=>{let i=e.runde_eliminert!=null;return(i&&r===a?`<tr><td colspan="5" class="avsl-elim-separator"></td></tr>`:``)+`<tr data-kasterid="${e.kasterid}" class="stilling-spelar-rad">
        <td${i?` class="avsl-elim-plass"`:``}>${r+1}</td>
        <td>${e.startnummer??``}</td>
        <td>${e._namn??`Spelar ${e.kasterid}`}</td>
        <td class="text-center">${e.kamp_poeng_innl??0}</td>
        <td class="text-center">${e.score_poeng_innl??0}</td>
      </tr>
      <tr class="stilling-detalj" data-kasterid="${e.kasterid}" hidden>
        <td colspan="5" class="p-0">
          <table class="stilling-detalj-tabell table table-sm table-bordered mb-0">
            <thead><tr>
              <th class="text-center">Runde</th>
              <th class="text-center">Bane</th>
              <th>Motstandar</th>
              <th class="text-center">Resultat</th>
            </tr></thead>
            <tbody>${Dr(e.kasterid,t,n)}</tbody>
          </table>
        </td>
      </tr>`}).join(``)}).join(``)}</tbody>
      </table>
    </div>`}function Gi(e,t,n,r,i,a,o){let s=r.filter(e=>e.runde_eliminert==null),c=r.length,l=s.length,u=a===1?o?.[n]??null:null,d=u?.walkovers??0,f=(u?u.c3:l%3==0?l/3:0)+(u?u.c2:l%3==0?0:l/2),p=s.slice(d,d+f),m=s.slice(d+f,d+2*f),h=s.slice(d+2*f),g=document.createElement(`div`);g.className=`avsl-dialog-overlay`,document.body.appendChild(g);function _(r){let i=r&&f>0?[{label:`Seeding 1`,pool:p},{label:`Seeding 2`,pool:m},...h.length?[{label:`Seeding 3`,pool:h}]:[]].map(({label:e,pool:t})=>`
          <div class="flex-grow-1">
            <strong class="d-block mb-1">${e}</strong>
            ${t.map(e=>`<div class="small">${e._namn??``} — ${e.kamp_poeng_innl??0}p (${e.score_poeng_innl??0})</div>`).join(``)}
          </div>`).join(``):s.map((e,t)=>`<div class="small">${t+1}. ${e._namn??``} — ${e.kamp_poeng_innl??0}p (${e.score_poeng_innl??0})</div>`).join(``);g.innerHTML=`
      <div class="card p-4 avsl-dialog-card-wide">
        <h5 class="mb-1">Gruppe ${n} — Runde ${a}</h5>
        <p class="text-muted small mb-2">${l} av ${c} spelarar igjen</p>
        <div class="form-check mb-3">
          <input class="form-check-input" type="checkbox" id="seeding-dlg" ${r?`checked`:``}>
          <label class="form-check-label" for="seeding-dlg">Bruk seeding</label>
        </div>
        <div class="d-flex gap-3 flex-wrap mb-3">${i}</div>
        <div class="d-flex gap-2">
          <button id="bekreft-gen-btn" class="btn btn-primary">Bekreft og opprett kampar</button>
          <button id="avbryt-gen-btn" class="btn btn-secondary">Avbryt</button>
        </div>
      </div>`,g.querySelector(`#seeding-dlg`).addEventListener(`change`,e=>_(e.target.checked)),g.querySelector(`#avbryt-gen-btn`).addEventListener(`click`,()=>g.remove()),g.querySelector(`#bekreft-gen-btn`).addEventListener(`click`,async()=>{let r=g.querySelector(`#seeding-dlg`).checked;g.remove();try{a===1?await Vr(t,[{gruppeNavn:n,spelarar:s.map((e,t)=>({kasterid:e.kasterid,plassering:t+1})),runde1Oppsett:u}],r,o):await Hr(t,n,r),await Q(e,t)}catch(e){alert(`Feil: `+e.message)}})}_(!0)}function Ki(e,t,n,r,i,o,s,c,l,u){if(Ri?.querySelector(`#start-avsl-btn`)?.addEventListener(`click`,async()=>{if(!r)return;let{error:n}=await a.from(`stevne`).update({stevne_fase:`avsluttende`}).eq(`id`,t);if(n){alert(`Feil: `+n.message);return}await Q(e,t)}),!i){let r=parseInt(e.querySelector(`#gruppe-val-wrapper`)?.dataset.n??`0`)||s.length,i=[...s];function o(t,n){let r=e.querySelector(`input[name="${t}"]:checked`);if(r?.dataset.oppsett)try{return JSON.parse(r.dataset.oppsett)}catch{}return W(n)[0]??null}let c=e.querySelector(`#gruppe-paneler`);c&&c.addEventListener(`change`,t=>{if(!t.target.matches(`input[name^="runde1-format"]`))return;let n=parseInt(e.querySelector(`input[name="gruppe-split"]:checked`)?.value??r),a=r-n,s=o(`runde1-format-a`,n),c=o(`runde1-format-b`,a);if(t.target.name===`runde1-format-a`){let t=e.querySelector(`#struktur-a`);t&&(t.outerHTML=Fi(n,s,`a`))}else{let t=e.querySelector(`#struktur-b`);t&&(t.outerHTML=Fi(a,c,`b`))}let l=s?.walkovers??0,u=c?.walkovers??0,d=e.querySelector(`#gruppe-preview`);d&&(d.innerHTML=Mi(i.map((e,t)=>({...e,cupPlassering:t+1})),n,l,u))}),e.querySelectorAll(`input[name="gruppe-split"]`).forEach(t=>{t.addEventListener(`change`,()=>{let n=parseInt(t.value),a=r-n,o=i.map((e,t)=>({...e,cupPlassering:t+1})),s=W(n)[0]??null,l=a>=2?W(a)[0]??null:null;c&&(c.innerHTML=`<div id="gruppe-panel-a" class="avsl-gruppe-kol">
              ${Ii(`Gruppe A`,n,`runde1-format-a`,s)}
            </div>`+(a>=2?`<div id="gruppe-panel-b" class="avsl-gruppe-kol">
              ${Ii(`Gruppe B`,a,`runde1-format-b`,l)}
            </div>`:``));let u=s?.walkovers??0,d=l?.walkovers??0,f=e.querySelector(`#gruppe-preview`);f&&(f.innerHTML=Mi(o,n,u,d))})}),e.querySelector(`#bekreft-gruppe-btn`)?.addEventListener(`click`,async()=>{let s=e.querySelector(`input[name="gruppe-split"]:checked`);if(!s)return;let c=parseInt(s.value),u=r-c,d=o(`runde1-format-a`,c),f=u>=2?o(`runde1-format-b`,u):null,{error:p}=await a.from(`stevne`).update({runde1_format:{A:d,B:f,nA:c}}).eq(`id`,t);if(p){alert(`Feil: `+p.message);return}if(n.stevne_fase===`avsluttende`){let e=l.A??null,n=l.B??null,r=i.map((r,i)=>{let o=i<c;return a.from(`resultat`).update({gruppeid:o?e:n??e}).eq(`stevneid`,t).eq(`kasterid`,r.kasterid)}),o=(await Promise.all(r)).find(e=>e.error)?.error;if(o){alert(`Feil: `+o.message);return}}await Q(e,t)})}Ri?.querySelector(`#endre-gruppeinndeling-btn`)?.addEventListener(`click`,async()=>{confirm(`Tilbakestill gruppeinndelinga? Gruppefordeling og format vert fjerna.`)&&(await Promise.all([a.from(`resultat`).update({gruppeid:null}).eq(`stevneid`,t),a.from(`stevne`).update({runde1_format:null}).eq(`id`,t)]),await Q(e,t))}),i&&e.querySelectorAll(`[data-generer-gruppe]`).forEach(r=>{r.addEventListener(`click`,()=>{let i=r.dataset.genererGruppe,a=parseInt(r.dataset.runde);Gi(e,t,i,s.filter(e=>e.gruppe?.navn===i),u,a,n.runde1_format)})}),Ri?.querySelector(`#fullfør-turnering-btn`)?.addEventListener(`click`,async()=>{if(!confirm(`Vil du fullføre turneringa? Dette kan ikkje angrast.`))return;let{error:n}=await a.from(`stevne`).update({erfullfort:!0}).eq(`id`,t);if(n){alert(`Feil: `+n.message);return}await Q(e,t)})}function qi(e,t,n,r,i,o){for(let s of n){let n=(s.spelarar??[]).sort((e,t)=>e.posisjon-t.posisjon);e.querySelector(`#plus-${s.id}`)?.addEventListener(`click`,async()=>{let r=n[0],i=n[1];ii(r?.kaster?`${r.kaster.fornavn} ${r.kaster.etternavn}`:`—`,i?.kaster?`${i.kaster.fornavn} ${i.kaster.etternavn}`:`—`,V(r),V(i),async(n,o)=>{let s=[];r&&s.push(a.from(`kamp_spelar`).update({score_poeng:n}).eq(`id`,r.id)),i&&s.push(a.from(`kamp_spelar`).update({score_poeng:o}).eq(`id`,i.id)),await Promise.all(s),await Q(e,t)})}),e.querySelector(`#scoreboard-${s.id}`)?.addEventListener(`click`,()=>{location.hash=`#/kamp/${s.id}`}),e.querySelector(`#bekrft-${s.id}`)?.addEventListener(`click`,()=>{s.er_tre_spelarar?Yi(e,s,n,t,r,i,o):Ji(e,t,s,n,o)})}}async function Ji(e,t,n,r,i){let o=r[0],s=r[1],{data:c}=await a.from(`kamp_spelar`).select(`id, kasterid, score_poeng, antall_ringer, omgangar:kamp_omgang(score, antall_ringer)`).eq(`kampid`,n.id),l=c?.find(e=>e.id===o?.id),u=c?.find(e=>e.id===s?.id),d=V(l??o),f=V(u??s);if(d===0&&f===0&&!confirm(`Ingen score registrert. Vil du bekrefte kampen likevel?`))return;let p=d>=f?o:s,m=d>=f?s:o;await Zi(t,n,r,p?.kasterid?[p.kasterid]:[],m?.kasterid??null,i),await Xi(t,n),await Q(e,t)}function Yi(e,t,n,r,i,a,o){let s=n.map(e=>e?.kaster?`${e.kaster.fornavn} ${e.kaster.etternavn}`:`Spelar ${e?.posisjon}`),c=[],l=document.createElement(`div`);l.className=`avsl-dialog-overlay`,document.body.appendChild(l);function u(){let i=c.length===2?n.find(e=>!c.includes(e.kasterid)):null;l.innerHTML=`
      <div class="card p-4 avsl-dialog-card">
        <h5 class="card-title mb-1">Bekreft 3-spelar kamp</h5>
        <p class="text-muted small mb-3">Vel dei to som går vidare. Den gjenverande er eliminert.</p>
        <div class="d-flex flex-column gap-2 mb-3">
          ${n.map((e,t)=>{let n=c.indexOf(e.kasterid),r=n!==-1,a=!!i&&i.kasterid===e.kasterid,o=n===0?`1. plass`:n===1?`2. plass`:``;return`<button
              class="btn ${r?`btn-success`:a?`btn-outline-danger`:`btn-outline-secondary`} text-start d-flex justify-content-between align-items-center"
              data-kasterid="${e.kasterid}"
              ${a?`disabled`:``}
            ><span>${s[t]}</span>${o?`<span class="badge bg-success-subtle text-success-emphasis">${o}</span>`:a?`<span class="badge bg-danger">Eliminert</span>`:``}</button>`}).join(``)}
        </div>
        <div class="d-flex gap-2">
          <button id="bekreft-tre-btn" class="btn btn-success" ${c.length===2?``:`disabled`}>Bekreft</button>
          <button id="avbryt-tre-btn" class="btn btn-secondary">Avbryt</button>
        </div>
      </div>
    `,l.querySelector(`#avbryt-tre-btn`).addEventListener(`click`,()=>l.remove()),l.querySelectorAll(`[data-kasterid]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=Number(e.dataset.kasterid),n=c.indexOf(t);n===-1?c.length<2&&c.push(t):c.splice(n,1),u()})}),l.querySelector(`#bekreft-tre-btn`)?.addEventListener(`click`,async()=>{if(c.length!==2)return;let i=n.find(e=>!c.includes(e.kasterid))?.kasterid;l.remove(),await Zi(r,t,n,[...c],i,o),await Xi(r,t),await Q(e,r)})}u()}async function Xi(e,t){if(t.runde_navn!==`Semifinale`||!t.gruppe_navn)return;let{data:n}=await a.from(`kamp`).select(`er_bekreftet`).eq(`stevneid`,e).eq(`gruppe_navn`,t.gruppe_navn).eq(`runde_navn`,`Semifinale`);n?.every(e=>e.er_bekreftet)&&await Ur(e,t.gruppe_navn)}async function Zi(e,t,n,r,i,o){if(await a.from(`kamp`).update({er_bekreftet:!0}).eq(`id`,t.id),!i)return;let s=t.runde_navn===`Finale`||t.runde_navn===`Bronsefinale`,c=n.map(e=>e.kasterid).filter(Boolean);s?await a.from(`resultat`).update({runde_eliminert:null,plassering:null}).eq(`stevneid`,e).in(`kasterid`,c):await a.from(`resultat`).update({runde_eliminert:null}).eq(`stevneid`,e).eq(`runde_eliminert`,t.runde_nummer).in(`kasterid`,c);let l=s?{runde_eliminert:t.runde_nummer,plassering:t.runde_navn===`Finale`?2:4}:{runde_eliminert:t.runde_nummer};await a.from(`resultat`).update(l).eq(`stevneid`,e).eq(`kasterid`,i),t.runde_navn===`Finale`&&r.length>0&&await a.from(`resultat`).update({plassering:1}).eq(`stevneid`,e).eq(`kasterid`,r[0]),t.runde_navn===`Bronsefinale`&&r.length>0&&await a.from(`resultat`).update({plassering:3,runde_eliminert:t.runde_nummer}).eq(`stevneid`,e).eq(`kasterid`,r[0])}function Qi(e){let t=e.querySelector(`.avsl-hovudinnhald`);t&&e.querySelectorAll(`.avsl-tab-btn`).forEach(n=>{n.addEventListener(`click`,()=>{let r=n.dataset.tab===`resultat`;t.classList.toggle(`avsl-vis-resultat`,r),e.querySelectorAll(`.avsl-tab-btn`).forEach(e=>{e.classList.toggle(`btn-primary`,e.dataset.tab===n.dataset.tab),e.classList.toggle(`btn-outline-primary`,e.dataset.tab!==n.dataset.tab)})})})}function $i(e,t){if(Li)return;let n=kr(t,[`avsluttende`],e,Q,()=>{a.removeChannel(Li),Li=null});Li=a.channel(`stevne-avsl-${t}`).on(`postgres_changes`,{event:`*`,schema:`public`,table:`kamp_omgang`},n).on(`postgres_changes`,{event:`*`,schema:`public`,table:`kamp`},e=>{(e.new?.stevneid??e.old?.stevneid)===t&&n()}).subscribe()}async function ea(e,{id:t}={}){let n=Number(t);e.innerHTML=`<p class="laster">Laster…</p>`;let[{data:r},{data:i}]=await Promise.all([a.from(`stevne`).select(`id, stevne_fase, antall_runder_innl, innledendekastemetodeid, avsluttendekastemetodeid`).eq(`id`,n).single(),a.from(`kastemetode`).select(`id, navn, er_innledende, er_avsluttende`).eq(`eraktiv`,!0).order(`navn`)]);if(!r){e.innerHTML=`<p class="feil">Stevne ikkje funne.</p>`;return}let o=(i??[]).filter(e=>e.er_innledende),s=(i??[]).filter(e=>e.er_avsluttende);function c(e,t){return e.map(e=>`<option value="${e.id}"${e.id===t?` selected`:``}>${e.navn}</option>`).join(``)}e.innerHTML=`
    <div>
      <h4 class="mb-3">Innstillingar</h4>
      <form id="innstillingar-form" class="org-max-480">
        <div class="mb-3">
          <label class="form-label fw-semibold">Kastemetode innledande</label>
          <select id="innl-metode" class="form-select">
            <option value="">— Ikkje vald —</option>
            ${c(o,r.innledendekastemetodeid)}
          </select>
        </div>
        <div class="mb-3">
          <label class="form-label fw-semibold">Kastemetode avsluttande</label>
          <select id="avsl-metode" class="form-select">
            <option value="">— Ikkje vald —</option>
            ${c(s,r.avsluttendekastemetodeid)}
          </select>
        </div>
        <div class="mb-4">
          <label class="form-label fw-semibold">Antal rundar innledande</label>
          <input id="antall-rundar" type="number" min="1" class="form-control"
            value="${r.antall_runder_innl??``}" placeholder="t.d. 6">
        </div>
        <button type="submit" class="btn btn-primary">Lagre</button>
        <span id="lagre-status" class="ms-3 text-success d-none">Lagra ✓</span>
        <hr class="my-4">
        <div class="border border-danger rounded p-3">
          <h6 class="text-danger mb-2">Farleg sone</h6>
          <p class="text-muted small mb-2">Slettar alle kampar og resultat, og set stevnet tilbake til starttilstanden.</p>
          <button type="button" id="nullstill-btn" class="btn btn-danger">Start på nytt!</button>
        </div>
      </form>
    </div>
  `,e.querySelector(`#innstillingar-form`).addEventListener(`submit`,async t=>{t.preventDefault();let r=e.querySelector(`#innl-metode`).value||null,i=e.querySelector(`#avsl-metode`).value||null,o=e.querySelector(`#antall-rundar`).value,s=o?Number(o):null,{error:c}=await a.from(`stevne`).update({innledendekastemetodeid:r?Number(r):null,avsluttendekastemetodeid:i?Number(i):null,antall_runder_innl:s}).eq(`id`,n);if(c){alert(`Feil ved lagring: `+c.message);return}let l=e.querySelector(`#lagre-status`);l.classList.remove(`d-none`),setTimeout(()=>{l.classList.add(`d-none`)},2e3)}),e.querySelector(`#nullstill-btn`).addEventListener(`click`,async r=>{confirm(`Er du sikker? Dette slettar alle kampar og resultat og set stevnet tilbake til starttilstanden.`)&&(r.currentTarget.disabled=!0,await ui(n),await ea(e,{id:t}))})}var ta={ikke_startet:`<span class="badge bg-secondary">Ikkje starta</span>`,innledende:`<span class="badge bg-primary">Innledande fase</span>`,avsluttende:`<span class="badge bg-success">Avsluttande fase</span>`},na=null,ra={info:Wr,spillere:ei,innledende:wi,avsluttende:Bi,innstillinger:ea};async function ia(e,{id:t,tab:n=`info`,basePath:r=`organizer`}={}){na&&=(a.removeChannel(na),null);let i=Number(t);e.innerHTML=`<p class="laster">Laster…</p>`;let{data:o}=await a.from(`stevne`).select(`id, navn, stevne_fase`).eq(`id`,i).single();if(!o){e.innerHTML=`<p class="feil">Stevne ikkje funne.</p>`;return}let s=r===`organizer`||await _e()||await ve(),c=!s&&n===`innstillinger`?`info`:n,l=ta[o.stevne_fase??`ikke_startet`]??``;e.innerHTML=`
    <div class="org-shell py-3 px-3">
      ${yr(i,c,s,r)}
      <div class="org-fase-header d-flex align-items-center gap-2 mb-3">
        <h5 class="mb-0 flex-grow-1">${o.navn} <span id="fase-badge">${l}</span></h5>
        <div id="org-banner-knappar"></div>
      </div>
      <div id="org-subside"></div>
    </div>`;let u=e.querySelector(`#org-banner-knappar`),d=e.querySelector(`#org-subside`);await(ra[c]??Wr)(d,{id:String(i),isAdmin:s},u),na=a.channel(`stevne-fase-${i}`).on(`postgres_changes`,{event:`UPDATE`,schema:`public`,table:`stevne`,filter:`id=eq.${i}`},t=>{let n=e.querySelector(`#fase-badge`);n&&(n.innerHTML=ta[t.new?.stevne_fase??`ikke_startet`]??``)}).subscribe()}var aa=document.getElementById(`app`);function $(e,t){return async(n,r)=>{if(!await O()){location.hash=`#/logginn`;return}if(e===`admin`&&!await _e()){n.innerHTML=`<p class="feil" style="text-align:center;margin-top:40px;">Ingen tilgang.</p>`;return}if(e===`klubbadmin`&&!await _e()&&!await ve()){n.innerHTML=`<p class="feil" style="text-align:center;margin-top:40px;">Ingen tilgang.</p>`;return}await t(n,r)}}var oa=[{mønster:/^\/logginn$/,side:Ln,params:()=>({})},{mønster:/^\/minside$/,side:$(`bruker`,zn),params:()=>({})},{mønster:/^\/admin$/,side:$(`admin`,qn),params:()=>({})},{mønster:/^\/stevne\/ny$/,side:$(`klubbadmin`,er),params:()=>({})},{mønster:/^\/stevne\/(\d+)\/admin$/,side:$(`klubbadmin`,er),params:e=>({id:e[1]})},{mønster:/^\/kamp\/(\d+)$/,side:gr,params:e=>({id:e[1]})},{mønster:/^\/stevne\/(\d+)\/organizer(?:\/([^/]*))?$/,side:$(`klubbadmin`,ia),params:e=>({id:e[1],tab:e[2]??`info`,basePath:`organizer`})},{mønster:/^\/stevne\/(\d+)\/live(?:\/([^/]*))?$/,side:ia,params:e=>({id:e[1],tab:e[2]??`info`,basePath:`live`})},{mønster:/^\/stevne\/(\d+)\/pamelding$/,side:ur,params:e=>({id:e[1]})},{mønster:/^\/kaster\/ny$/,side:$(`klubbadmin`,ir),params:()=>({})},{mønster:/^\/kaster\/(\d+)\/admin$/,side:$(`klubbadmin`,ir),params:e=>({id:e[1]})},{mønster:/^\/klubber\/(\d+)\/admin$/,side:$(`klubbadmin`,cr),params:e=>({id:e[1]})},{mønster:/^\/resultat\/(\d+)$/,side:De,params:e=>({id:e[1]})},{mønster:/^\/terminliste$/,side:Ge,params:()=>({})},{mønster:/^\/norgescupen$/,side:tt,params:()=>({})},{mønster:/^\/norgesranking$/,side:_t,params:()=>({})},{mønster:/^\/rekorder$/,side:bn,params:()=>({})},{mønster:/^\/nmvinnere$/,side:In,params:()=>({})},{mønster:/^\/kastere\/(\d+)(-[^/]*)?$/,side:qt,params:e=>({id:e[1]})},{mønster:/^\/kastere$/,side:qt,params:()=>({})},{mønster:/^\/klubber\/(\d+)(-[^/]*)?$/,side:un,params:e=>({id:e[1]})},{mønster:/^\/klubber$/,side:un,params:()=>({})},{mønster:/^\/?$/,side:pe,params:()=>({})}];function sa(){let e=location.hash.replace(/^#/,``)||`/`;for(let t of oa){let n=e.match(t.mønster);if(n){t.side(aa,t.params(n));return}}aa.innerHTML=`<p style="text-align:center;margin-top:40px;color:#666;">Side ikke funnet.</p>`}async function ca(){let e=await O(),t=document.getElementById(`meny-logginn-item`),n=document.getElementById(`meny-minside-item`),r=document.getElementById(`meny-admin-item`),i=document.getElementById(`meny-loggut-item`);if(e){t.style.display=`none`;let a=e.profil?.rolle===`admin`;n.style.display=a?`none`:``,r.style.display=a?``:`none`,i.style.display=``}else t.style.display=``,n.style.display=`none`,r.style.display=`none`,i.style.display=`none`}window.addEventListener(`hashchange`,sa),document.addEventListener(`DOMContentLoaded`,()=>{document.getElementById(`menyLoggUtKnapp`).addEventListener(`click`,async()=>{await ye(),location.hash=`#/`}),ca(),sa()}),document.addEventListener(`authStateChanged`,()=>{ca()});