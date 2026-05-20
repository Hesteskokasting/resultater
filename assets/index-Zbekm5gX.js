const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/gloppen-CFqTYJ6-.js","assets/innledendeBase-BXIf6ANI.js","assets/ScoreNumberpad-C-b3sWkY.js","assets/nordhordland-D1WBhydP.js","assets/cup-D-jFmYDw.js"])))=>i.map(i=>d[i]);
import{t as e}from"./vendor-3yxEHqvy.js";import{n as t,t as n}from"./xlsx-C8px7JeE.js";import{n as r,t as i}from"./charts-BaCXx3P-.js";(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();function a(e){return[e?.fornavn,e?.etternavn].filter(Boolean).join(` `)}function o(e){return(e??``).toLowerCase().replace(/[æä]/g,`ae`).replace(/[øö]/g,`o`).replace(/å/g,`a`).replace(/[^a-z0-9]+/g,`-`).replace(/^-|-$/g,``)}function s(e){return`${e.id}-`+o(`${e.etternavn??``}-${e.fornavn??``}`)}function c(e){return`${e.id}-`+o(e.navn??``)}function l(e){if(e==null)return`–`;let t=Number(e);return Number.isInteger(t)?String(t):t.toFixed(1)}function u(e){let t=new Map;for(let n of e)t.set(n.id,{navn:n.navn,dato:n.dato,typeNavn:n.stevnetype?.navn??``});return t}function d(e){return[...e].sort((e,t)=>(t.nc_poeng??0)-(e.nc_poeng??0))}function f(e,t,n){let r=[],i=[],a=[];for(let t of e){let e=n.get(t.stevneid??-1)?.typeNavn??``;e===`NC`?r.push(t):e===`SNC`?i.push(t):e===`DNC`&&a.push(t)}let o=d(r).slice(0,t.max_nc_total),s=d(i).slice(0,t.max_snc_total),c=t.max_dnc_total>0?t.max_dnc_total:1/0,l=d(a).slice(0,c);return d([...o,...s,...l]).slice(0,t.maxtotal)}function p(e,t,n){return d(e.filter(e=>n.get(e.stevneid??-1)?.typeNavn===`SNC`)).slice(0,t.max_snc)}function m(e,t,n){return d(e.filter(e=>n.get(e.stevneid??-1)?.typeNavn===`DNC`)).slice(0,t.max_dnc)}function h(e){return e===`SNC`?p:e===`DNC`?m:f}function g(e,t){let n=1;for(let r=0;r<e.length;r++)r>0&&t(e[r])<t(e[r-1])&&(n=r+1),e[r].plassering=n}function _(e,t,n,r,i){let o=u(t),s=h(r),c=i===1?`Klasse 1`:`Klasse 2`,l=e.filter(e=>e.klasse?.navn===c),d=new Map;for(let e of l)e.kasterid==null||e.kaster==null||(d.has(e.kasterid)||d.set(e.kasterid,{kaster:e.kaster,rader:[]}),d.get(e.kasterid).rader.push(e));let f=[];for(let[,e]of d){let t=s(e.rader,n,o),r=t.reduce((e,t)=>e+(t.nc_poeng??0),0),i=[...new Set(t.map(e=>e.klubb?.navn).filter(e=>e!=null))],c=t.map(e=>({...e,_stevne:o.get(e.stevneid??-1)})).sort((e,t)=>(e._stevne?.dato??``).localeCompare(t._stevne?.dato??``));f.push({navn:a(e.kaster),klubb:i.join(` / `),totalPoeng:r,detaljRader:c,plassering:0})}return f.sort((e,t)=>t.totalPoeng-e.totalPoeng||e.navn.localeCompare(t.navn)),g(f,e=>e.totalPoeng),f}function v(e,t,n){let r=u(t),i=e.filter(e=>e.klasse?.navn===`Klasse 1`),a=new Map;for(let e of i)e.kasterid==null||e.kaster==null||(a.has(e.kasterid)||a.set(e.kasterid,{kaster:e.kaster,rader:[]}),a.get(e.kasterid).rader.push(e));let o=new Map,s=new Map;for(let[,e]of a){let t=f(e.rader,n,r),i=new Map;for(let e of t){let t=e.klubb;t&&e.klubbid!=null&&!s.has(e.klubbid)&&s.set(e.klubbid,t),e.klubbid!=null&&i.set(e.klubbid,(i.get(e.klubbid)??0)+(e.nc_poeng??0))}for(let[t,n]of i)o.set(`${e.kaster.id}_${t}`,{kaster:e.kaster,klubbId:t,sum:n})}let c=new Map;for(let[,e]of o)c.has(e.klubbId)||c.set(e.klubbId,{klubb:s.get(e.klubbId),bidragsytere:[]}),c.get(e.klubbId).bidragsytere.push(e);let l=[];for(let[,e]of c){e.bidragsytere.sort((e,t)=>t.sum-e.sum);let t=e.bidragsytere.slice(0,4);l.push({klubb:e.klubb,lagTotal:t.reduce((e,t)=>e+t.sum,0),bidragsytere:t,plassering:0})}return l.sort((e,t)=>t.lagTotal-e.lagTotal),g(l,e=>e.lagTotal),l}var y=e(`https://urtvpewjlevhlevtnvkf.supabase.co`,`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVydHZwZXdqbGV2aGxldnRudmtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0MTA2NDgsImV4cCI6MjA5MDk4NjY0OH0.0kCozO-eFJKZ19uU8F2HOHRcUsJD7HAVpVBl6sKoVbU`);function b(e,t){console.error(`[${e}]`,t)}y.from(`resultat`).select(`
    id, nc_poeng, plassering, kasterid, klubbid, klasseid, stevneid,
    kaster:kasterid(id, fornavn, etternavn),
    klubb:klubbid(id, navn),
    klasse:klasseid(id, navn)
  `),y.from(`stevne`).select(`id, navn, dato, stevnetype:stevnetypeid(id, navn)`);var x=[`NC`,`SNC`,`DNC`];async function S(e){let{data:t,error:n}=await y.from(`antallTellendeNc`).select(`id, year, max_nc_total, max_snc_total, max_dnc_total, maxtotal, max_snc, max_dnc`).eq(`year`,e).maybeSingle();return n&&b(`hentRegler`,n),{data:t,error:n}}async function C(e){let{data:t,error:n}=await y.from(`stevne`).select(`id, navn, dato, stevnetype:stevnetypeid(id, navn)`).gte(`dato`,`${e}-01-01`).lte(`dato`,`${e}-12-31`);if(n)return b(`hentStevnerOgResultater.stevner`,n),{stevner:[],resultater:[],error:n};let r=(t??[]).filter(e=>x.includes(e.stevnetype?.navn??``)),i=r.map(e=>e.id);if(i.length===0)return{stevner:r,resultater:[],error:null};let{data:a,error:o}=await y.from(`resultat`).select(`
      id, nc_poeng, plassering, kasterid, klubbid, klasseid, stevneid,
      kaster:kasterid(id, fornavn, etternavn),
      klubb:klubbid(id, navn),
      klasse:klasseid(id, navn)
    `).in(`stevneid`,i).not(`nc_poeng`,`is`,null).gt(`nc_poeng`,0);return o&&b(`hentStevnerOgResultater.resultater`,o),{stevner:r,resultater:a??[],error:o}}function w(e){return e.length===10?new Date(e+`T12:00:00`):new Date(e)}var T=new Intl.DateTimeFormat(`nb-NO`,{day:`2-digit`,month:`2-digit`,year:`numeric`}),E=new Intl.DateTimeFormat(`nb-NO`,{day:`numeric`,month:`numeric`,year:`numeric`}),D=new Intl.DateTimeFormat(`nb-NO`,{weekday:`long`,day:`numeric`,month:`long`,year:`numeric`});function O(e){return e?T.format(w(e)):``}function ee(e){return e?E.format(w(e)):``}function te(e){return e?D.format(w(e)):``}function ne(e){return e?e.slice(0,5):``}var re=new Intl.NumberFormat(`nb-NO`,{minimumFractionDigits:2,maximumFractionDigits:2});function ie(e){return e==null?`–`:re.format(e)+` %`}function ae(e,r,i=`Data`){let a=n.json_to_sheet(e),o=n.book_new();n.book_append_sheet(o,a,i),t(o,r)}function oe(e,t,n=new Date().getFullYear()){let r=``;for(let i=n;i>=t;i--)r+=`<option value="${i}"${i===e?` selected`:``}>${i}</option>`;return r}function k(e){let t=document.createElement(`p`);return t.className=`feil`,t.textContent=e,t}function A(e=`Laster…`){let t=document.createElement(`p`);return t.className=`laster`,t.textContent=e,t}function j(e){return String(e??``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}y.from(`stevne`).select(`
    id, navn, dato, tid, sted, stevne_fase, antall_runder_innl, erfullfort, klubbid,
    kastemetodeInnl:kastemetode!stevne_innledendekastemetodeid_fkey(id, navn),
    kastemetodeAvsl:kastemetode!stevne_avsluttendekastemetodeid_fkey(id, navn)
  `);async function se(){let e=new Date().toISOString().slice(0,10),{data:t,error:n}=await y.from(`stevne`).select(`id, navn, dato`).lt(`dato`,e).eq(`erfullfort`,!0).order(`dato`,{ascending:!1}).limit(5);return n&&b(`hentSisteResultater`,n),{data:t??[],error:n}}async function ce(){let{data:e,error:t}=await y.from(`stevne`).select(`id, navn, stevne_fase`).in(`stevne_fase`,[`innledende`,`avsluttende`]).order(`dato`,{ascending:!0});return t&&b(`hentLiveStevner`,t),{data:e??[],error:t}}async function le(){let e=new Date().toISOString().slice(0,10),{data:t,error:n}=await y.from(`stevne`).select(`id, navn, dato, innbydelseurl`).gte(`dato`,e).order(`dato`,{ascending:!0}).limit(5);return n&&b(`hentKommendeStevner`,n),{data:t??[],error:n}}async function ue(e){let{data:t,error:n}=await y.from(`stevne`).select(`id, navn, dato, sted, erfullfort, klubbid`).eq(`id`,e).maybeSingle();return n&&b(`hentStevneForPamelding`,n),{data:t,error:n}}async function de(e,t,n,r){let{data:i,error:a}=await y.from(`stevne`).select(`id, navn, dato`).eq(`klubbid`,e).eq(`erfullfort`,!1).neq(`id`,r).gte(`dato`,t).lte(`dato`,n).order(`dato`);return a&&b(`hentRelaterteStevner`,a),{data:i??[],error:a}}async function fe(e){let{data:t,error:n}=await y.from(`stevne`).select(`
      id, navn, dato, tid, sted, stevne_fase, antall_runder_innl, erfullfort, klubbid,
      kastemetodeInnl:kastemetode!stevne_innledendekastemetodeid_fkey(id, navn),
      kastemetodeAvsl:kastemetode!stevne_avsluttendekastemetodeid_fkey(id, navn)
    `).eq(`id`,e).maybeSingle();return n&&b(`hentInfoStevne`,n),{data:t,error:n}}async function pe(e,t){let{error:n}=await y.from(`stevne`).update({stevne_fase:t}).eq(`id`,e);return n&&b(`oppdaterStevneFase`,n),{error:n}}async function me(){let{data:e,error:t}=await y.from(`stevnetype`).select(`id, navn`).order(`navn`);return t&&b(`hentStevnetypar`,t),{data:e??[],error:t}}async function he(){let{data:e,error:t}=await y.from(`kastemetode`).select(`id, navn`).order(`navn`);return t&&b(`hentKastemetodar`,t),{data:e??[],error:t}}async function ge(){let{data:e,error:t}=await y.from(`kategori`).select(`id, navn`).order(`navn`);return t&&b(`hentKategoriar`,t),{data:e??[],error:t}}async function _e(e){let{data:t,error:n}=await y.from(`stevne`).select(`id, navn, sted, dato, tid, klubbid, stevnetypeid, innledendekastemetodeid, avsluttendekastemetodeid, kategoriid, ernm, ernorgesranking, erfullfort, erekskludertfrarekorder, innbydelseurl, resultaturl`).eq(`id`,e).single();return n&&b(`hentStevneForAdmin`,n),{data:t,error:n}}async function ve(e){let{data:t,error:n}=await y.from(`stevne`).insert(e).select(`id`).single();return n&&b(`opprettStevne`,n),{data:t,error:n}}async function ye(e,t){let{data:n,error:r}=await y.from(`stevne`).update(t).eq(`id`,e).select(`id`).single();return r&&b(`oppdaterStevne`,r),{data:n,error:r}}async function be(e){let{error:t}=await y.from(`stevne`).delete().eq(`id`,e);return t&&b(`slettStevne`,t),{error:t}}y.from(`stevne`).select(`
    id, navn, sted, dato, tid, ernm, erfullfort, innbydelseurl, resultaturl,
    klubb:klubbid(id, navn),
    stevnetype:stevnetypeid(id, navn),
    innledende:kastemetode!innledendekastemetodeid(id, navn),
    avsluttende:kastemetode!avsluttendekastemetodeid(id, navn),
    kategori:kategoriid(id, navn)
  `);async function xe(e){let{data:t,error:n}=await y.from(`stevne`).select(`
      id, navn, sted, dato, tid, ernm, erfullfort, innbydelseurl, resultaturl,
      klubb:klubbid(id, navn),
      stevnetype:stevnetypeid(id, navn),
      innledende:kastemetode!innledendekastemetodeid(id, navn),
      avsluttende:kastemetode!avsluttendekastemetodeid(id, navn),
      kategori:kategoriid(id, navn)
    `).gte(`dato`,`${e}-01-01`).lte(`dato`,`${e}-12-31`).order(`dato`);return n&&b(`hentTerminlisteStevner`,n),{data:t??[],error:n}}async function Se(){let[e,t,n,r]=await Promise.all([y.from(`stevnetype`).select(`id, navn`).order(`navn`),y.from(`kastemetode`).select(`id, navn`).order(`navn`),y.from(`klubb`).select(`id, navn`).order(`navn`),y.from(`kategori`).select(`id, navn`).order(`navn`)]),i=e.error??t.error??n.error??r.error??null;return i&&b(`hentFiltervalg`,i),{data:{stevnetyper:e.data??[],kastemetoder:t.data??[],klubber:n.data??[],kategorier:r.data??[]},error:i}}async function Ce(e){let{data:t,error:n}=await y.from(`stevne`).select(`id, navn, stevne_fase, avsluttendekastemetodeid`).eq(`id`,e).single();return n&&b(`hentStevneHeader`,n),{data:t,error:n}}function we(e,t){return y.channel(`stevne-fase-${e}`).on(`postgres_changes`,{event:`UPDATE`,schema:`public`,table:`stevne`,filter:`id=eq.${e}`},e=>t(e.new.stevne_fase)).subscribe()}y.from(`stevne`).select(`id, navn, stevne_fase, erfullfort, runde1_format, avsluttendemetode:avsluttendekastemetodeid(id, navn)`);async function Te(e){let{data:t,error:n}=await y.from(`stevne`).select(`id, navn, stevne_fase, erfullfort, runde1_format, avsluttendemetode:avsluttendekastemetodeid(id, navn)`).eq(`id`,e).maybeSingle();return n&&b(`hentAvsluttendeStevne`,n),{data:t,error:n}}async function Ee(e,t){let{error:n}=await y.from(`stevne`).update({runde1_format:t}).eq(`id`,e);return n&&b(`setRunde1Format`,n),{error:n}}async function De(e){let{count:t,error:n}=await y.from(`pamelding`).select(`id`,{count:`exact`,head:!0}).eq(`stevneid`,e);return n&&b(`hentPameldingCount`,n),{count:t??0,error:n}}async function Oe(e){let{data:t,error:n}=await y.from(`stevne`).select(`id, stevne_fase, antall_runder_innl, innledendekastemetodeid, avsluttendekastemetodeid`).eq(`id`,e).single();return n&&b(`hentStevneInnstillingar`,n),{data:t,error:n}}async function ke(){let{data:e,error:t}=await y.from(`kastemetode`).select(`id, navn, er_innledende, er_avsluttende`).eq(`eraktiv`,!0).order(`navn`);return t&&b(`hentAktiveKastemetodar`,t),{data:e??[],error:t}}async function Ae(e,t){let{error:n}=await y.from(`stevne`).update(t).eq(`id`,e);return n&&b(`oppdaterStevneInnstillingar`,n),{error:n}}async function je(e){let{data:t,error:n}=await y.from(`pamelding`).select(`stevneid`).eq(`bruker_id`,e);return n&&b(`hentPameldteForBruker`,n),new Set((t??[]).map(e=>e.stevneid).filter(e=>e!=null))}async function Me(e){let{data:t,error:n}=await y.from(`stevne`).select(`m:kastemetode!stevne_innledendekastemetodeid_fkey(navn)`).eq(`id`,e).single();n&&b(`hentInnledendeMetodeNamn`,n);let r=t?.m;return{navn:((r&&!Array.isArray(r)?r.navn:null)??``).toLowerCase(),error:n}}async function Ne(e){let{data:t,error:n}=await y.from(`stevne`).select(`m:kastemetode!stevne_avsluttendekastemetodeid_fkey(navn)`).eq(`id`,e).single();n&&b(`hentAvsluttendeMetodeNamn`,n);let r=t?.m;return{navn:((r&&!Array.isArray(r)?r.navn:null)??``).toLowerCase(),error:n}}y.from(`stevne`).select(`id, navn, erfullfort, stevne_fase, antall_runder_innl, kastemetodeInnl:innledendekastemetodeid(id, navn)`);async function Pe(e){let{data:t,error:n}=await y.from(`stevne`).select(`id, navn, erfullfort, stevne_fase, antall_runder_innl, kastemetodeInnl:innledendekastemetodeid(id, navn)`).eq(`id`,e).maybeSingle();return n&&b(`hentInnledendeStevne`,n),{data:t,error:n}}async function Fe(e){let{error:t}=await y.from(`stevne`).update({erfullfort:!0}).eq(`id`,e);return t&&b(`setStevneErfullfort`,t),{error:t}}function Ie(e){return e.length===0?`<p class="empty-state">Ingen data.</p>`:`
    <table class="app-tabell">
      <thead class="app-thead">
        <tr>
          <th class="nc-td-pl">Pl.</th>
          <th>Namn</th>
          <th>Klubb</th>
          <th class="nc-td-poeng">Poeng</th>
        </tr>
      </thead>
      <tbody>${e.slice(0,20).map(e=>`
    <tr>
      <td class="nc-td-pl">${e.plassering}</td>
      <td>${j(e.navn)}</td>
      <td>${j(e.klubb)}</td>
      <td class="nc-td-poeng">${l(e.totalPoeng)}</td>
    </tr>`).join(``)}</tbody>
    </table>`}function Le(e){let t=e.stevne_fase===`avsluttende`?`avsluttende`:`innledende`;return`
    <a class="live-kort" href="#/stevne/${e.id}/${t}">
      <span class="live-prikk"></span>
      <span>LIVE: ${j(e.navn)}</span>
    </a>`}function Re(e){return`
    <div class="stevne-kort">
      <p class="stevne-dato">${te(e.dato)}</p>
      <p class="stevne-navn">${j(e.navn)}</p>
      <a class="stevne-lenke" href="#/stevne/${e.id}/resultat">Vis resultat</a>
    </div>`}function ze(e){let t=e.innbydelseurl?`<a class="stevne-lenke" href="${j(e.innbydelseurl)}" target="_blank" rel="noopener">Innbydelse &#128196;</a>`:`<span class="stevne-lenke-inaktiv">Innbydelse er ikkje klar</span>`;return`
    <div class="stevne-kort">
      <p class="stevne-dato">${te(e.dato)}</p>
      <a class="stevne-navn" href="#/stevne/${e.id}/resultat">${j(e.navn)}</a>
      ${t}
    </div>`}async function Be(e){let t=new Date().getFullYear();e.replaceChildren(A(`Laster framsida...`));let n,r,i,a,o,s;try{let[{data:c,error:l},{data:u,error:d},{data:f,error:p},{stevner:m,resultater:h,error:g},{data:_,error:v}]=await Promise.all([se(),le(),S(t),C(t),ce()]);if(l||d||p||g){e.replaceChildren(k(`Kunne ikkje laste framsida.`));return}n=c,r=u,a=f,s=m,o=h,i=_}catch(t){b(`home.render`,t),e.replaceChildren(k(`Kunne ikkje laste framsida.`));return}let c=a?_(o,s,a,`NC`,1):[];e.innerHTML=`
    <div class="heimeside">
      ${i.length?`<div class="live-banner">${i.map(Le).join(``)}</div>`:``}
      <div class="heimeside-grid">
        <section class="heimeside-nc">
          <h2 class="heimeside-seksjon-tittel">Norgescupen Klasse 1 - Topp 20</h2>
          ${Ie(c)}
          <a class="heimeside-meir-lenke" href="#/norgescupen">Til detaljert liste</a>
        </section>
        <section class="heimeside-resultater">
          <h2 class="heimeside-seksjon-tittel">Siste resultat</h2>
          <div class="stevne-liste">${n.map(Re).join(``)}</div>
          <a class="heimeside-meir-lenke" href="#/terminliste">Vis terminliste</a>
        </section>
        <section class="heimeside-kommende">
          <h2 class="heimeside-seksjon-tittel">Kommande konkurransar</h2>
          <div class="stevne-liste">${r.map(ze).join(``)}</div>
          <a class="heimeside-meir-lenke" href="#/terminliste">Vis terminliste</a>
        </section>
      </div>
    </div>`}async function Ve(e){let{data:t,error:n}=await y.from(`bruker_profil`).select(`rolle, kasterid, kobling_status, kobling_kasterid`).eq(`id`,e).maybeSingle();return n&&b(`hentProfilForBruker`,n),{data:t,error:n}}async function He(e,t){let{error:n}=await y.from(`bruker_profil`).update({kobling_kasterid:t,kobling_status:`venter`}).eq(`id`,e);return n&&b(`sendProfileLinkRequest`,n),{error:n}}async function Ue(){let{data:e,error:t}=await y.from(`bruker_profil`).select(`id, kobling_kasterid`).eq(`kobling_status`,`venter`);return t&&b(`hentVentandeKoblingar`,t),{data:e??[],error:t}}async function We(e){let{data:t,error:n}=await y.rpc(`hent_bruker_epost`,{bruker_ids:e});return n&&b(`hentBrukarEpost`,n),{data:t??[],error:n}}async function Ge(e,t,n){let{error:r}=await y.from(`bruker_profil`).update({kobling_status:n,kasterid:t}).eq(`id`,e);return r&&b(`oppdaterKoblingStatus`,r),{error:r}}async function Ke(){let{data:e,error:t}=await y.from(`bruker_profil`).select(`id, rolle, kobling_status`).order(`opprettet_at`,{ascending:!1});return t&&b(`hentAlleBrukarar`,t),{data:e??[],error:t}}async function qe(e,t){let{error:n}=await y.from(`bruker_profil`).update({rolle:t}).eq(`id`,e);return n&&b(`oppdaterBrukarRolle`,n),{error:n}}async function Je(){let{data:e,error:t}=await y.from(`bruker_profil`).select(`id`).eq(`rolle`,`klubbadmin`);return t&&b(`hentKlubbadminBrukarar`,t),{data:e??[],error:t}}async function Ye(){let{data:e,error:t}=await y.from(`klubbadmin_klubber`).select(`bruker_id, klubbid`);return t&&b(`hentKlubbadminTildelte`,t),{data:e??[],error:t}}async function Xe(e,t){let{error:n}=await y.from(`klubbadmin_klubber`).insert({bruker_id:e,klubbid:t});return n&&b(`leggTilKlubbadminTilgang`,n),{error:n}}async function Ze(e){let{data:t,error:n}=await y.from(`klubbadmin_klubber`).select(`klubbid`).eq(`bruker_id`,e);return n&&b(`hentKlubbadminKlubbarForBruker`,n),{data:(t??[]).map(e=>e.klubbid).filter(e=>e!=null),error:n}}async function Qe(e,t){let{error:n}=await y.from(`klubbadmin_klubber`).delete().eq(`bruker_id`,e).eq(`klubbid`,t);return n&&b(`fjernKlubbadminTilgang`,n),{error:n}}var $e=[`admin`,`klubbadmin`,`bruker`];function et(e){return typeof e==`string`&&$e.includes(e)}function tt(e){return typeof e==`object`&&!!e&&et(e.rolle)}var nt=null;async function rt(){if(nt)return nt;let{data:{session:e}}=await y.auth.getSession();if(!e)return null;let{data:t}=await Ve(e.user.id),n=[];if(t?.rolle===`klubbadmin`){let{data:t}=await Ze(e.user.id);n=t}return nt={user:e.user,profil:tt(t)?t:null,klubber:n},nt}async function M(){return rt()}async function it(){return(await rt())?.profil?.rolle??null}async function N(){return await it()===`admin`}async function at(e=null){let t=await rt();return!t||t.profil?.rolle!==`klubbadmin`?!1:e===null?!0:t.klubber.includes(Number(e))}async function ot(){nt=null,await y.auth.signOut()}async function st(e,t){return y.auth.signInWithPassword({email:e,password:t})}async function ct(e,t){return y.auth.signUp({email:e,password:t})}y.auth.onAuthStateChange(e=>{(e===`SIGNED_OUT`||e===`SIGNED_IN`||e===`TOKEN_REFRESHED`)&&(nt=null),document.dispatchEvent(new CustomEvent(`authStateChanged`,{detail:e}))});function P(e,t,n=`— velg —`){let r=`<option value="">${n}</option>`;for(let n of e??[]){let e=String(n.id)===String(t)?` selected`:``,i=j(n.navn??n.klubbnavn??``);r+=`<option value="${n.id}"${e}>${i}</option>`}return r}var F={kolonne:`dato`,retning:`asc`};function lt(e,t){switch(t){case`navn`:return e.navn??``;case`dato`:return e.dato??``;case`sted`:return e.sted??``;case`metode`:return[e.innledende?.navn,e.avsluttende?.navn].filter(e=>!!e).join(` `);case`organizer`:return e.klubb?.navn??``;case`type`:return e.stevnetype?.navn??``;case`klassifisering`:return e.kategori?.navn??``;default:return``}}function ut(e){return[...e].sort((e,t)=>{let n=lt(e,F.kolonne),r=lt(t,F.kolonne),i=n.localeCompare(r,`nb`);return F.retning===`asc`?i:-i})}var I={ar:new Date().getFullYear(),tekst:``,stevnetypeId:``,kastemetodeId:``,klubbId:``,kategoriId:``},dt=[],ft=null,pt=new Set;function mt(e){return e.filter(e=>{if(I.tekst){let t=I.tekst.toLowerCase();if(![e.navn,e.sted,e.klubb?.navn,e.stevnetype?.navn,e.kategori?.navn,e.innledende?.navn,e.avsluttende?.navn].some(e=>e?.toLowerCase().includes(t)))return!1}if(I.stevnetypeId&&String(e.stevnetype?.id)!==I.stevnetypeId)return!1;if(I.kastemetodeId){let t=I.kastemetodeId;if(!(String(e.innledende?.id)===t||String(e.avsluttende?.id)===t))return!1}return!(I.klubbId&&String(e.klubb?.id)!==I.klubbId||I.kategoriId&&String(e.kategori?.id)!==I.kategoriId)})}function ht(e){ae(e.map(e=>({Dato:e.dato?new Date(e.dato).toLocaleDateString(`nb-NO`):``,Navn:e.navn??``,Sted:e.sted??``,Arrangør:e.klubb?.navn??``,Stevnetype:e.stevnetype?.navn??``,"Kastemetode (innledende)":e.innledende?.navn??``,"Kastemetode (avsluttende)":e.avsluttende?.navn??``,Kategori:e.kategori?.navn??``,NM:e.ernm?`Ja`:`Nei`,InnbydelseUrl:e.innbydelseurl??``})),`terminliste-${I.ar}.xlsx`,`Terminliste`)}var gt=[{id:`navn`,label:`Stevne`},{id:`dato`,label:`Dato`},{id:`sted`,label:`Sted`},{id:`metode`,label:`Metode`},{id:`organizer`,label:`Arrangør`},{id:`type`,label:`Type`},{id:`klassifisering`,label:`Klassifisering`}];function _t(e){return F.kolonne===e?F.retning===`asc`?`<span class="tl-sort-ikon aktiv">↑</span>`:`<span class="tl-sort-ikon aktiv">↓</span>`:`<span class="tl-sort-ikon">↕</span>`}function vt(e){let t=e.dato?new Date(e.dato+`T12:00:00`).toLocaleDateString(`nb-NO`):``,n=[e.innledende?.navn,e.avsluttende?.navn].filter(e=>!!e).join(` \\ `),r=e.ernm?`<span class="tl-nm-merke">NM</span> `:``,i=e.innbydelseurl?`<a href="${j(e.innbydelseurl)}" target="_blank" rel="noopener" class="tl-innbydelse-ikon" title="Innbydelse">📄</a>`:``;return`<tr class="tl-tr">
    <td><a class="tl-lenkje" href="#/stevne/${e.id}/resultat">${r}${j(e.navn??``)}</a></td>
    <td>${t}</td>
    <td>${j(e.sted??``)}</td>
    <td>${j(n)}</td>
    <td>${j(e.klubb?.navn??``)}</td>
    <td>${j(e.stevnetype?.navn??``)}</td>
    <td>${j(e.kategori?.navn??``)}</td>
    <td>${i}</td>
  </tr>`}function yt(e){return e.length===0?`<p class="empty-state">Ingen stevner funnet med valgte filtre.</p>`:`<table class="tl-tabell">${`<thead><tr>
    ${gt.map(e=>`<th class="tl-th" data-kolonne="${e.id}">${e.label}${_t(e.id)}</th>`).join(``)}
    <th class="tl-th">Innbydelse</th>
  </tr></thead>`}${`<tbody>${ut(e).map(vt).join(``)}</tbody>`}</table>`}function bt(e){return window.innerWidth>600?yt(e):St(e)}function xt(e){let t=te(e.dato),n=e.sted?`<p class="tl-detalj">Sted: ${j(e.sted)}</p>`:``,r=e.klubb?`<p class="tl-detalj">Arrangør: ${j(e.klubb.navn??``)}</p>`:``,i=e.stevnetype?`<p class="tl-detalj">Type: ${j(e.stevnetype.navn??``)}</p>`:``,a=e.ernm?`<span class="tl-nm-merke">NM</span>`:``,o=e.innbydelseurl?`<a class="tl-innbydelse-lenke" href="${j(e.innbydelseurl)}" target="_blank" rel="noopener">Innbydelse 📄</a>`:``,s=e.resultaturl?`<a class="stevne-lenke" href="#/stevne/${e.id}/resultat">Vis resultat</a>`:``,c=e.dato&&new Date(e.dato+`T12:00:00`)>new Date,l=ft?.profil?.rolle,u=ft?.profil?.kobling_status===`godkjent`||l===`admin`||l===`klubbadmin`,d=pt.has(e.id),f=u?d?`<a class="stevne-lenke" href="#/stevne/${e.id}/pamelding">Påmeldt ✓</a>`:c&&!e.erfullfort?`<a class="stevne-lenke" href="#/stevne/${e.id}/pamelding">Meld meg på</a>`:``:``;return`
    <div class="stevne-kort tl-kort">
      <a class="tl-navn tl-navn-lenke" href="#/stevne/${e.id}/resultat">${a}${j(e.navn??``)}</a>
      <p class="stevne-dato">${t}</p>
      ${n}${r}${i}
      ${o}${s}${f}
    </div>
  `}function St(e){return e.length===0?`<p class="empty-state">Ingen stevner funnet med valgte filtre.</p>`:`<div class="stevne-liste">${e.map(xt).join(``)}</div>`}async function Ct(e){e.replaceChildren(A(`Laster terminliste…`));try{let[{data:t,error:n},{data:r},i]=await Promise.all([xe(I.ar),Se(),M()]);if(ft=i,pt=i?.user?await je(i.user.id):new Set,n){b(`terminliste.render`,n),e.replaceChildren(k(`Kunne ikkje laste terminliste.`));return}dt=t??[],e.innerHTML=`
      <div class="terminliste">
        <h1 class="tl-tittel">Terminliste ${I.ar}</h1>

        <!-- Desktop-filterrad -->
        <div class="tl-filter-rad">
          <select class="tl-select" id="tl-ar">${oe(I.ar,1983,new Date().getFullYear()+1)}</select>
          <input class="tl-input" id="tl-tekst" type="search" placeholder="Søk..." value="${j(I.tekst)}">
          <select class="tl-select" id="tl-stevnetype">${P(r.stevnetyper,I.stevnetypeId,`Alle typer`)}</select>
          <select class="tl-select" id="tl-kastemetode">${P(r.kastemetoder,I.kastemetodeId,`Alle metoder`)}</select>
          <select class="tl-select" id="tl-arrangorklubb">${P(r.klubber,I.klubbId,`Alle arrangører`)}</select>
          <select class="tl-select" id="tl-kategori">${P(r.kategorier,I.kategoriId,`Alle kategorier`)}</select>
          <button class="tl-excel-knapp" id="tl-excel-desktop">⬇ Excel</button>
        </div>

        <!-- Mobil-rad -->
        <div class="tl-mobil-rad">
          <input class="tl-input" id="tl-tekst-mobil" type="search" placeholder="Søk..." value="${j(I.tekst)}">
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
            <select class="tl-select" id="tl-ar-mobil">${oe(I.ar,1983,new Date().getFullYear()+1)}</select>
          </label>
          <label class="tl-label">Stevnetype
            <select class="tl-select" id="tl-stevnetype-mobil">${P(r.stevnetyper,I.stevnetypeId,`Alle typer`)}</select>
          </label>
          <label class="tl-label">Kastemetode
            <select class="tl-select" id="tl-kastemetode-mobil">${P(r.kastemetoder,I.kastemetodeId,`Alle metoder`)}</select>
          </label>
          <label class="tl-label">Arrangør
            <select class="tl-select" id="tl-arrangorklubb-mobil">${P(r.klubber,I.klubbId,`Alle arrangører`)}</select>
          </label>
          <label class="tl-label">Kategori
            <select class="tl-select" id="tl-kategori-mobil">${P(r.kategorier,I.kategoriId,`Alle kategorier`)}</select>
          </label>
          <div class="tl-bunnark-knapper">
            <button class="tl-tilbakestill-knapp" id="tl-tilbakestill">Tilbakestill</button>
            <button class="tl-bruk-knapp" id="tl-bruk">Bruk filter</button>
          </div>
        </div>
      </div>
    `;function a(){let t=mt(dt);e.querySelector(`.tl-liste-container`).innerHTML=bt(t);let n=e.querySelector(`.tl-antall`);return n&&(n.textContent=`${t.length} stevner`),t}if(a(),i?.profil&&(i.profil.rolle===`admin`||i.profil.rolle===`klubbadmin`)){let t=document.createElement(`div`);t.className=`mb-3 px-2 d-flex gap-2`,t.innerHTML=`<a href="#/stevne/ny" class="btn btn-sm btn-success">+ Nytt stevne</a>`,e.querySelector(`.terminliste`)?.prepend(t)}let o=e.querySelector(`.tl-liste-container`),s=e.querySelector(`#tl-ar`),c=e.querySelector(`#tl-tekst`),l=e.querySelector(`#tl-tekst-mobil`),u=e.querySelector(`#tl-stevnetype`),d=e.querySelector(`#tl-kastemetode`),f=e.querySelector(`#tl-arrangorklubb`),p=e.querySelector(`#tl-kategori`),m=e.querySelector(`#tl-excel-desktop`),h=e.querySelector(`#tl-excel-mobil`),g=e.querySelector(`#tl-filter-aapne`),_=e.querySelector(`#tl-bunnark`),v=e.querySelector(`#tl-bakgrunn`),y=e.querySelector(`#tl-tilbakestill`),x=e.querySelector(`#tl-bruk`),S=e.querySelector(`#tl-ar-mobil`),C=e.querySelector(`#tl-stevnetype-mobil`),w=e.querySelector(`#tl-kastemetode-mobil`),T=e.querySelector(`#tl-arrangorklubb-mobil`),E=e.querySelector(`#tl-kategori-mobil`);o.addEventListener(`click`,e=>{let t=e.target.closest(`[data-kolonne]`);if(!t)return;let n=t.dataset.kolonne;F.kolonne===n?F.retning=F.retning===`asc`?`desc`:`asc`:(F.kolonne=n,F.retning=`asc`),a()});let D=null;window.addEventListener(`resize`,()=>{D!==null&&clearTimeout(D),D=setTimeout(a,200)}),s.addEventListener(`change`,async()=>{I.ar=Number(s.value),e.querySelector(`.tl-tittel`).textContent=`Terminliste ${I.ar}`,e.querySelector(`.tl-liste-container`).replaceChildren(A(`Laster...`));let{data:t,error:n}=await xe(I.ar);if(n){b(`terminliste.arChange`,n),e.querySelector(`.tl-liste-container`).replaceChildren(k(`Feil ved henting.`));return}dt=t??[],a()}),c.addEventListener(`input`,()=>{I.tekst=c.value,a()}),l.addEventListener(`input`,()=>{I.tekst=l.value,c.value=l.value,a()}),u.addEventListener(`change`,()=>{I.stevnetypeId=u.value,a()}),d.addEventListener(`change`,()=>{I.kastemetodeId=d.value,a()}),f.addEventListener(`change`,()=>{I.klubbId=f.value,a()}),p.addEventListener(`change`,()=>{I.kategoriId=p.value,a()});let O=()=>ht(mt(dt));m.addEventListener(`click`,O),h.addEventListener(`click`,O);function ee(){_.classList.add(`aktiv`),v.classList.add(`aktiv`)}function te(){_.classList.remove(`aktiv`),v.classList.remove(`aktiv`)}g.addEventListener(`click`,ee),v.addEventListener(`click`,te),y.addEventListener(`click`,()=>{I.tekst=``,I.stevnetypeId=``,I.kastemetodeId=``,I.klubbId=``,I.kategoriId=``,C.value=``,w.value=``,T.value=``,E.value=``,l.value=``,c.value=``,a()}),x.addEventListener(`click`,async()=>{let t=Number(S.value),n=t!==I.ar;if(I.ar=t,I.stevnetypeId=C.value,I.kastemetodeId=w.value,I.klubbId=T.value,I.kategoriId=E.value,te(),n){e.querySelector(`.tl-tittel`).textContent=`Terminliste ${I.ar}`,e.querySelector(`.tl-liste-container`).replaceChildren(A(`Laster...`));let{data:t,error:n}=await xe(I.ar);if(n){b(`terminliste.brukFilter`,n),e.querySelector(`.tl-liste-container`).replaceChildren(k(`Feil ved henting.`));return}dt=t??[]}a()})}catch(t){b(`terminliste.render`,t),e.replaceChildren(k(`Kunne ikkje laste terminliste.`))}}function wt(e,t){let{triggerSel:n,idAttr:r,detailSel:i,chevronSel:a=`.nc-chevron`,lookupRoot:o}=t,s=o??e;e.querySelectorAll(n).forEach(e=>{e.setAttribute(`tabindex`,`0`),e.setAttribute(`aria-expanded`,`false`)});function c(e){let t=e.getAttribute(`data-${r}`);if(!t)return;let n=s.querySelector(`${i}[data-${r}="${t}"]`);if(!n)return;let o=n.classList.contains(`d-none`);n.classList.toggle(`d-none`),e.setAttribute(`aria-expanded`,String(o));let c=e.querySelector(a);c&&(c.textContent=o?` ▲`:` ▼`)}e.addEventListener(`click`,e=>{let t=e.target.closest(n);t&&c(t)}),e.addEventListener(`keydown`,e=>{if(e.key!==`Enter`&&e.key!==` `)return;let t=e.target.closest(n);t&&(e.preventDefault(),c(t))})}function L(e){let t=document.createElement(`p`);return t.className=`empty-state`,t.textContent=e,t}function Tt(e,t){if(t)for(let[n,r]of Object.entries(t))e.setAttribute(n,r)}function R(e){let{columns:t,rows:n,rowClass:r,rowAttrs:i,detailRow:a,detailRowClass:o=`detalj-rad d-none`,tableClass:s=`app-tabell`,theadClass:c=`app-thead`,showHeader:l=!0}=e,u=document.createElement(`table`);if(u.className=s,l){let e=u.createTHead();e.className=c;let n=e.insertRow();for(let e of t){let t=document.createElement(`th`);t.textContent=e.label,e.thClass&&(t.className=e.thClass),n.appendChild(t)}}let d=u.createTBody();return n.forEach((e,n)=>{let s=d.insertRow(),c=typeof r==`function`?r(e,n):r;c&&(s.className=c),Tt(s,i?.(e,n));for(let r of t){let t=s.insertCell(),i=typeof r.cellClass==`function`?r.cellClass(e,n):r.cellClass;i&&(t.className=i),Tt(t,r.cellAttrs?.(e,n));let a=r.render(e,n);typeof a==`string`?t.textContent=a:t.appendChild(a)}if(a){let r=a(e,n);if(r!==null){let a=d.insertRow();a.className=o,Tt(a,i?.(e,n));let s=a.insertCell();s.colSpan=t.length,s.appendChild(r)}}}),u}var Et=2007,Dt=2024,z={ar:new Date().getFullYear(),cupType:`NC`,klasse:1,visning:`singel`},B={ar:null,regler:null,stevner:[],resultater:[]};async function Ot(e){if(B.ar===e)return!0;try{let[{data:t,error:n},{stevner:r,resultater:i,error:a}]=await Promise.all([S(e),C(e)]);return n||a?!1:(B.ar=e,B.regler=t,B.stevner=r,B.resultater=i,!0)}catch(e){return b(`hentOgBufferData`,e),!1}}function kt(e,t){return t===`SNC`?`Dei ${e.max_snc} beste SNC-stevna er teljande`:t===`DNC`?`Dei ${e.max_dnc} beste DNC-stevna er teljande`:`Dei ${e.maxtotal} beste stevna, herav maks ${e.max_nc_total} NC-stevner og ${e.max_snc_total} SNC-stevner er teljande`}function At(e){return`
    <div class="nc-klasse-tabs nc-visning-tabs">
      <button class="nc-klasse-tab${e===`singel`?` aktiv`:``}" data-visning="singel">Singel</button>
      <button class="nc-klasse-tab${e===`lag`?` aktiv`:``}" data-visning="lag">Lag</button>
    </div>`}function jt(e,t){return`
    <div class="nc-klasse-tabs-wrapper">
      <div class="nc-klasse-tabs">
        <button class="nc-klasse-tab${e===1?` aktiv`:``}" data-klasse="1">Klasse 1</button>
        ${t<=2025?`<button class="nc-klasse-tab${e===2?` aktiv`:``}" data-klasse="2">Klasse 2</button>`:``}
      </div>
      <span class="nc-klikk-hint">Klikk poengsum for å vise detaljer</span>
    </div>`}function Mt(e){let t=document.createDocumentFragment();t.appendChild(document.createTextNode(l(e)));let n=document.createElement(`span`);return n.className=`nc-chevron`,n.textContent=` ▼`,t.appendChild(n),t}function Nt(e){return e.length===0?L(`Ingen resultater funnet.`):R({rows:e,rowClass:`nc-singel-rad`,rowAttrs:(e,t)=>({"data-idx":String(t)}),detailRowClass:`nc-detalj-rad d-none`,detailRow:e=>R({rows:e.detaljRader,tableClass:`detalj-tabell`,theadClass:``,columns:[{label:`Dato`,render:e=>O(e._stevne?.dato)},{label:`Type`,render:e=>e._stevne?.typeNavn??`–`},{label:`Stevne`,render:e=>e._stevne?.navn??`–`},{label:`Pl.`,render:e=>String(e.plassering??`–`)},{label:`Poeng`,render:e=>l(e.nc_poeng)}]}),columns:[{label:`Pl.`,thClass:`nc-td-pl`,cellClass:`nc-td-pl`,render:e=>String(e.plassering)},{label:`Navn`,render:e=>e.navn},{label:`Klubb`,render:e=>e.klubb},{label:`Poeng`,thClass:`nc-td-poeng`,cellClass:`nc-td-poeng nc-poeng-celle`,cellAttrs:(e,t)=>({"data-idx":String(t)}),render:e=>Mt(e.totalPoeng)}]})}function Pt(e){return e.length===0?L(`Ingen lag funnet.`):R({rows:e,rowClass:`nc-lag-rad`,rowAttrs:(e,t)=>({"data-lag-idx":String(t)}),detailRowClass:`nc-lag-detalj-rad d-none`,detailRow:e=>R({rows:e.bidragsytere,tableClass:`detalj-tabell`,showHeader:!1,columns:[{label:``,render:e=>a(e.kaster)},{label:``,cellClass:`nc-td-poeng`,render:e=>l(e.sum)}]}),columns:[{label:`Pl.`,thClass:`nc-td-pl`,cellClass:`nc-td-pl`,render:e=>String(e.plassering)},{label:`Klubb`,render:e=>e.klubb?.navn??`–`},{label:`Poeng`,thClass:`nc-td-poeng`,cellClass:`nc-td-poeng nc-lag-poeng-celle`,cellAttrs:(e,t)=>({"data-lag-idx":String(t)}),render:e=>Mt(e.lagTotal)}]})}function Ft(e,t){return`
    <div class="nc-side">
      <h1 class="nc-hovudtittel">Norgescupen ${e}</h1>
      <div class="nc-filter-rad">
        <select id="nc-ar" class="tl-select">${oe(e,Et)}</select>
        <select id="nc-cuptype" class="tl-select${e<Dt?` d-none`:``}">
          <option value="NC"${t===`NC`?` selected`:``}>NC</option>
          <option value="SNC"${t===`SNC`?` selected`:``}>SNC</option>
          <option value="DNC"${t===`DNC`?` selected`:``}>DNC (Uoffisiell)</option>
        </select>
      </div>
      <div id="nc-visning-tabs-container"></div>
      <div id="nc-content"></div>
    </div>`}async function It(e){if(z.ar=new Date().getFullYear(),z.cupType=`NC`,z.klasse=1,z.visning=`singel`,B={ar:null,regler:null,stevner:[],resultater:[]},e.replaceChildren(A(`Laster Norgescupen...`)),!await Ot(z.ar)){e.replaceChildren(k(`Kunne ikkje laste data for Norgescupen.`));return}e.innerHTML=Ft(z.ar,z.cupType);function t(){let{ar:n,cupType:r,klasse:i,visning:a}=z,{regler:o}=B,s=e.querySelector(`#nc-content`);if(e.querySelector(`.nc-hovudtittel`).textContent=`Norgescupen ${n}`,e.querySelector(`#nc-cuptype`).classList.toggle(`d-none`,n<Dt),e.querySelector(`#nc-visning-tabs-container`).innerHTML=r===`NC`?At(a):``,a===`lag`&&r===`NC`){s.innerHTML=`
        <section>
          <h2 class="nc-seksjon-tittel">NC Lag ${n} (Kun klasse 1)</h2>
          <p class="nc-beskriving">Dei 4 beste poengsummene frå kvar klubb.</p>
          <div class="nc-klikk-hint nc-klikk-hint-rad">Klikk poengsum for å vise detaljar</div>
          <div id="nc-lag-tabell-container"></div>
        </section>`;let e=s.querySelector(`#nc-lag-tabell-container`);if(!o)e.replaceChildren(L(`Ingen data.`));else{let t=v(B.resultater,B.stevner,o);e.replaceChildren(Pt(t)),wt(e,{triggerSel:`.nc-lag-poeng-celle`,idAttr:`lag-idx`,detailSel:`.nc-lag-detalj-rad`,lookupRoot:s})}}else{s.innerHTML=`
        <section id="nc-singel-seksjon">
          <h2 class="nc-seksjon-tittel">${r} Singel ${n} - Klasse ${i}</h2>
          <p class="nc-beskriving">${o?kt(o,r):`Ingen telleregel funnet for ${n}`}</p>
          <div id="nc-klasse-tabs-container">${jt(i,n)}</div>
          <div id="nc-singel-tabell-container"></div>
        </section>`;let e=s.querySelector(`#nc-singel-tabell-container`);if(!o)e.replaceChildren(L(`Ingen data.`));else{let t=_(B.resultater,B.stevner,o,r,i);e.replaceChildren(Nt(t)),wt(e,{triggerSel:`.nc-poeng-celle`,idAttr:`idx`,detailSel:`.nc-detalj-rad`,lookupRoot:s})}s.querySelector(`#nc-singel-seksjon`).addEventListener(`click`,e=>{let n=e.target.closest(`[data-klasse]`);n&&(z.klasse=Number(n.dataset.klasse),t())})}}t(),e.querySelector(`#nc-ar`).addEventListener(`change`,async n=>{if(z.ar=Number(n.target.value),z.klasse=1,z.ar<Dt&&(z.cupType=`NC`,z.visning=`singel`,e.querySelector(`#nc-cuptype`).value=`NC`),e.querySelector(`#nc-content`).replaceChildren(A()),!await Ot(z.ar)){e.querySelector(`#nc-content`).replaceChildren(k(`Feil ved henting av data.`));return}t()}),e.querySelector(`#nc-cuptype`).addEventListener(`change`,e=>{z.cupType=e.target.value,z.klasse=1,z.cupType!==`NC`&&(z.visning=`singel`),t()}),e.querySelector(`#nc-visning-tabs-container`).addEventListener(`click`,e=>{let n=e.target.closest(`[data-visning]`);n&&(z.visning=n.dataset.visning,t())})}y.from(`stevne`).select(`id, navn, dato, stevnetype:stevnetypeid(id, navn), innledendekastemetode:kastemetode!innledendekastemetodeid(navn), avsluttendekastemetode:kastemetode!avsluttendekastemetodeid(navn)`),y.from(`resultat`).select(`
    id, kasterid, klubbid, stevneid,
    antall_ring_xkast, antall_ring_kongelag,
    kaster:kasterid(id, fornavn, etternavn),
    klubb:klubbid(id, navn)
  `);async function Lt(e){let{data:t,error:n}=await y.from(`stevne`).select(`id, navn, dato, stevnetype:stevnetypeid(id, navn), innledendekastemetode:kastemetode!innledendekastemetodeid(navn), avsluttendekastemetode:kastemetode!avsluttendekastemetodeid(navn)`).eq(`ernorgesranking`,!0).gte(`dato`,`${e}-01-01`).lte(`dato`,`${e}-12-31`);if(n)return b(`hentStevnerOgResultater.stevner`,n),{stevner:[],resultater:[],error:n};let r=t??[],i=r.map(e=>e.id);if(i.length===0)return{stevner:r,resultater:[],error:null};let{data:a,error:o}=await y.from(`resultat`).select(`
      id, kasterid, klubbid, stevneid,
      antall_ring_xkast, antall_ring_kongelag,
      kaster:kasterid(id, fornavn, etternavn),
      klubb:klubbid(id, navn)
    `).in(`stevneid`,i);return o?(b(`hentStevnerOgResultater.resultater`,o),{stevner:r,resultater:[],error:o}):{stevner:r,resultater:(a??[]).filter(e=>e.antall_ring_xkast!=null||e.antall_ring_kongelag!=null),error:null}}function Rt(e){let t=new Map;for(let n of e)t.set(n.id,{navn:n.navn,dato:n.dato,typeNamn:n.stevnetype?.navn??``,innledMetode:n.innledendekastemetode?.navn??null,avslMetode:n.avsluttendekastemetode?.navn??null});return t}function zt(e,t){let n=(t?.innledMetode??``).toLowerCase(),r=(t?.avslMetode??``).toLowerCase(),i=e=>n===e||r===e,a={_stevne:t},o=[];return e.antall_ring_xkast!=null&&(i(`minimatch`)?o.push({...a,prosent:e.antall_ring_xkast/60*100,metodeNamn:`Minimatch`,antallRing:e.antall_ring_xkast}):i(`halvmatch`)?o.push({...a,prosent:e.antall_ring_xkast,metodeNamn:`Halvmatch`,antallRing:e.antall_ring_xkast}):i(`heilmatch`)&&o.push({...a,prosent:e.antall_ring_xkast/200*100,metodeNamn:`Heilmatch`,antallRing:e.antall_ring_xkast})),e.antall_ring_kongelag!=null&&o.push({...a,prosent:e.antall_ring_kongelag/40*100,metodeNamn:`Kongelag`,antallRing:e.antall_ring_kongelag}),o}function Bt(e){let t=1;for(let n=0;n<e.length;n++)n>0&&e[n].snittProsent<e[n-1].snittProsent&&(t=n+1),e[n].plassering=t}function Vt(e,t){let n=new Map;for(let r of e){if(r.kasterid==null)continue;let e=zt(r,r.stevneid==null?void 0:t.get(r.stevneid));if(e.length){n.has(r.kasterid)||n.set(r.kasterid,{kaster:r.kaster,klubb:r.klubb,rader:[]});for(let t of e)n.get(r.kasterid).rader.push(t)}}let r=[],i=[];for(let[,e]of n){let{rader:t}=e,n=[...t].sort((e,t)=>t.prosent-e.prosent),o=n.slice(0,5),s=Math.round(o.reduce((e,t)=>e+t.prosent,0)/o.length*100)/100,c=t.length,l=c>=5,u={navn:a(e.kaster),klubb:e.klubb?.navn??`–`,antallStevner:c,snittProsent:s,erGyldig:l,detaljRader:n};l?r.push(u):i.push(u)}return r.sort((e,t)=>t.snittProsent-e.snittProsent||e.navn.localeCompare(t.navn)),i.sort((e,t)=>t.snittProsent-e.snittProsent||e.navn.localeCompare(t.navn)),Bt(r),[...r,...i]}var Ht=2018,V={ar:new Date().getFullYear(),sokeTekst:``,infoSynleg:!1},H={ar:null,stevner:[],resultater:[]};async function Ut(e){if(H.ar===e)return!0;try{let{stevner:t,resultater:n,error:r}=await Lt(e);return r?!1:(H.ar=e,H.stevner=t,H.resultater=n,!0)}catch(e){return b(`hentOgBufferData`,e),!1}}function Wt(){let e=Rt(H.stevner);ae(Vt(H.resultater,e).map(e=>({Plass:e.erGyldig?e.plassering:`–`,Kaster:e.navn,Klubb:e.klubb,"Snitt %":e.snittProsent,"Antal stevner":e.antallStevner})),`norgesranking-${V.ar}.xlsx`,`Norgesranking`)}function Gt(e){return`
    <div id="nr-info-seksjon"${e?``:` class="d-none"`}>
      <p class="nc-info-tekst">
        Norgesranking er ein konkurranse som pågår innanfor eit kalenderår, dvs. 1. januar – 31. desember.
        <strong>Dei 5 beste prosentane er teljande.</strong>
      </p>
      <p class="nc-info-tekst">
        For å få eit gyldig årsresultat skal kasteren minst ha vore gjennom 5 rankingrunder.
      </p>
      <p class="nc-info-tekst nc-info-tekst--advarsel">
        Resultater merket med rødt er ikkje gyldig (mindre enn 5 runder).
      </p>
    </div>`}function Kt(e,t){let n=t.trim().toLowerCase(),r=n?e.filter(e=>e.navn.toLowerCase().includes(n)||e.klubb.toLowerCase().includes(n)):e;return r.length===0?L(`Ingen resultater funnet.`):R({rows:r,rowClass:e=>e.erGyldig?`nc-singel-rad`:`nc-singel-rad nc-rad--ugyldig`,rowAttrs:(e,t)=>({"data-idx":String(t)}),detailRowClass:`nc-detalj-rad d-none`,detailRow:e=>R({rows:e.detaljRader,tableClass:`detalj-tabell`,theadClass:``,columns:[{label:`Dato`,render:e=>O(e._stevne?.dato)},{label:`Type`,render:e=>e._stevne?.typeNamn??`–`},{label:`Stevne`,render:e=>e._stevne?.navn??`–`},{label:`Metode`,render:e=>e.metodeNamn},{label:`Ring`,render:e=>String(e.antallRing)},{label:`%Ring`,render:e=>ie(e.prosent)}]}),columns:[{label:`Pl.`,thClass:`nc-td-pl`,cellClass:`nc-td-pl`,render:e=>e.erGyldig?String(e.plassering??`–`):`–`},{label:`Navn`,render:e=>e.navn},{label:`Klubb`,render:e=>e.klubb},{label:`Stevner`,thClass:`nc-td-sentrum`,cellClass:`nc-td-sentrum`,render:e=>String(e.antallStevner)},{label:`%Snitt`,thClass:`nc-td-poeng`,cellClass:`nc-td-poeng nc-poeng-celle`,cellAttrs:(e,t)=>({"data-idx":String(t)}),render:e=>{let t=document.createDocumentFragment();t.appendChild(document.createTextNode(ie(e.snittProsent)));let n=document.createElement(`span`);return n.className=`nc-chevron`,n.textContent=` ▼`,t.appendChild(n),t}}]})}function qt(e){return`
    <div class="nc-side">
      <h1 class="nc-hovudtittel">Norgesranking ${e}</h1>
      <div class="nc-info-knapp-rad">
        <button id="nr-info-knapp" class="btn btn-sm btn-outline-secondary">Vis info</button>
      </div>
      <hr>
      ${Gt(!1)}
      <hr>
      <div class="nc-filter-rad">
        <select id="nr-ar" class="tl-select">${oe(e,Ht)}</select>
        <input id="nr-sok" type="text" class="tl-select" placeholder="Søk på navn/klubb..." value="">
        <button class="tl-excel-knapp" id="nr-excel">⬇ Excel</button>
      </div>
      <div class="nc-klikk-hint-rad">
        <span class="nc-klikk-hint">Klikk prosent for å vise detaljer</span>
      </div>
      <div id="nr-tabell-container"></div>
    </div>`}async function Jt(e){V.ar=new Date().getFullYear(),V.sokeTekst=``,V.infoSynleg=!1,H={ar:null,stevner:[],resultater:[]},e.replaceChildren(A(`Laster Norgesranking…`));try{if(!await Ut(V.ar)){e.replaceChildren(k(`Kunne ikkje laste data for Norgesranking.`));return}e.innerHTML=qt(V.ar);function t(){let t=Rt(H.stevner),n=Vt(H.resultater,t),r=e.querySelector(`#nr-tabell-container`),i=document.createElement(`div`);i.id=`nr-tabell-inner`,i.appendChild(Kt(n,V.sokeTekst)),r.replaceChildren(i),wt(i,{triggerSel:`.nc-poeng-celle`,idAttr:`idx`,detailSel:`.nc-detalj-rad`})}t();let n=e.querySelector(`#nr-ar`),r=e.querySelector(`#nr-sok`),i=e.querySelector(`#nr-excel`),a=e.querySelector(`#nr-info-knapp`);n.addEventListener(`change`,async()=>{V.ar=Number(n.value),V.sokeTekst=``,r.value=``,e.querySelector(`.nc-hovudtittel`).textContent=`Norgesranking ${V.ar}`,e.querySelector(`#nr-tabell-container`).replaceChildren(A(`Laster...`));try{if(!await Ut(V.ar)){e.querySelector(`#nr-tabell-container`).replaceChildren(k(`Feil ved henting av data.`));return}t()}catch(t){b(`norgesranking.arChange`,t),e.querySelector(`#nr-tabell-container`).replaceChildren(k(`Feil ved henting av data.`))}}),r.addEventListener(`input`,()=>{V.sokeTekst=r.value,t()}),i.addEventListener(`click`,Wt),a.addEventListener(`click`,()=>{V.infoSynleg=!V.infoSynleg,e.querySelector(`#nr-info-seksjon`).classList.toggle(`d-none`,!V.infoSynleg),a.textContent=V.infoSynleg?`Skjul info`:`Vis info`})}catch(t){b(`norgesranking.render`,t),e.replaceChildren(k(`Kunne ikkje laste Norgesranking.`))}}y.from(`kaster`).select(`id, fornavn, etternavn, avatarurl, medlemsnummer, klasse:klasseid(id, navn)`),y.from(`kaster`).select(`id, fornavn, etternavn, eraktiv, avatarurl, klubb:klubbid(id, navn)`),y.from(`kaster`).select(`id, fornavn, etternavn, eraktiv, avatarurl, medlemsnummer, klubbid, klubb:klubbid(id, navn), klasse:klasseid(id, navn)`),y.from(`kaster`).select(`id, fornavn, etternavn, klubb:klubbid(navn)`),y.from(`resultat`).select(`
  id, plassering, poeng_kongelag, poeng_xkast, antall_ring_kongelag, antall_ring_xkast,
  klubb:klubbid(id, navn),
  stevne:stevneid(id, navn, dato, stevnetype:stevnetypeid(id, navn), innledendekastemetode:kastemetode!stevne_innledendekastemetodeid_fkey(navn), avsluttendekastemetode:kastemetode!stevne_avsluttendekastemetodeid_fkey(navn))
`);var Yt=null,Xt=null,Zt=new Map,Qt=new Map,$t=new Map;async function en(e){if(Zt.has(e))return Zt.get(e);let{data:t,error:n}=await y.from(`kaster`).select(`id, fornavn, etternavn, avatarurl, medlemsnummer, klasse:klasseid(id, navn)`).eq(`klubbid`,e).eq(`eraktiv`,!0).order(`etternavn`).order(`fornavn`);n&&b(`hentKlubbMedlemmar`,n);let r={data:t??[],error:n};return Zt.set(e,r),r}async function tn(){if(Yt)return{data:Yt,error:null};let{data:e,error:t}=await y.from(`kaster`).select(`id, fornavn, etternavn, eraktiv, avatarurl, klubb:klubbid(id, navn)`).eq(`eraktiv`,!0).order(`etternavn`).order(`fornavn`);return t&&b(`hentKastereListeAktive`,t),Yt=e??[],{data:Yt,error:t}}async function nn(){if(Xt)return{data:Xt,error:null};let{data:e,error:t}=await y.from(`kaster`).select(`id, fornavn, etternavn, eraktiv, avatarurl, klubb:klubbid(id, navn)`).order(`etternavn`).order(`fornavn`);return t&&b(`hentKastereListeAlle`,t),Xt=e??[],{data:Xt,error:t}}async function rn(e){if(Qt.has(e))return Qt.get(e);let[t,n]=await Promise.all([y.from(`kaster`).select(`id, fornavn, etternavn, eraktiv, avatarurl, medlemsnummer, klubbid, klubb:klubbid(id, navn), klasse:klasseid(id, navn)`).eq(`id`,e).single(),y.from(`resultat`).select(`
        id, plassering, poeng_kongelag, poeng_xkast, antall_ring_kongelag, antall_ring_xkast,
        klubb:klubbid(id, navn),
        stevne:stevneid(id, navn, dato, stevnetype:stevnetypeid(id, navn), innledendekastemetode:kastemetode!stevne_innledendekastemetodeid_fkey(navn), avsluttendekastemetode:kastemetode!stevne_avsluttendekastemetodeid_fkey(navn))
      `).eq(`kasterid`,e)]),r=t.error||n.error;r&&b(`hentKasterDetalj`,r);let i=(n.data??[]).filter(e=>e.stevne?.dato).sort((e,t)=>(t.stevne?.dato??``).localeCompare(e.stevne?.dato??``)),a={kaster:t.data,resultater:i,error:r};return Qt.set(e,a),a}async function an(e){let{data:t,error:n}=await y.from(`kaster`).select(`id, fornavn, etternavn, eraktiv, avatarurl, klubb:klubbid(id, navn)`).in(`klubbid`,e).eq(`eraktiv`,!0).order(`etternavn`).order(`fornavn`);return n&&b(`hentKastereForKlubbar`,n),{data:t??[],error:n}}async function on(e){if($t.has(e))return $t.get(e);let{data:t,error:n}=await y.from(`kaster`).select(`id, fornavn, etternavn, klubb:klubbid(navn)`).eq(`id`,e).single();n&&b(`hentKasterForKobling`,n);let r={data:t,error:n};return $t.set(e,r),r}async function sn(){let{data:e,error:t}=await y.from(`klasse`).select(`id, navn`).order(`navn`);return t&&b(`hentKlassar`,t),{data:e??[],error:t}}async function cn(){let{data:e,error:t}=await y.from(`kjonn`).select(`id, navn`).order(`id`);return t&&b(`hentKjonn`,t),{data:e??[],error:t}}async function ln(e){if(!e.length)return{data:[],error:null};let{data:t,error:n}=await y.from(`kaster`).select(`id, fornavn, etternavn, klubb:klubbid(navn)`).in(`id`,e);return n&&b(`hentKastereByIds`,n),{data:t??[],error:n}}async function un(e){let{data:t,error:n}=await y.from(`kaster`).select(`id, fornavn, etternavn, kjonnid, klasseid, klubbid, epost, telefon, medlemsnummer, eraktiv`).eq(`id`,e).single();return n&&b(`hentKasterForAdmin`,n),{data:t,error:n}}async function dn(e){let{data:t,error:n}=await y.from(`kaster`).insert(e).select(`id`).single();return n&&b(`opprettKaster`,n),{data:t,error:n}}async function fn(e,t){let{data:n,error:r}=await y.from(`kaster`).update(t).eq(`id`,e).select(`id`).single();return r&&b(`oppdaterKaster`,r),{data:n,error:r}}async function pn(e){let{error:t}=await y.from(`kaster`).delete().eq(`id`,e);return t&&b(`slettKaster`,t),{error:t}}var mn=24,hn=`https://placehold.co/200x200/444/888?text=?`,U={visAlle:!1,sokeTekst:``,side:1};function gn(e){let t=a(e);return`
    <a href="#/kastere/${s(e)}" class="kaster-kort">
      <img src="${j(e.avatarurl||hn)}" alt="${j(t)}" loading="lazy">
      <div class="kaster-navn">${j(t)}</div>
      <div class="kaster-klubb">${j(e.klubb?.navn??`–`)}</div>
    </a>`}function _n(){return`
    <div class="nc-side">
      <div class="kaster-liste-kontroller">
        <div class="nc-filter-rad">
          <input id="kaster-sok" type="search" class="tl-select" placeholder="Søk på navn/klubb" value="">
        </div>
        <div class="mt-2">
          <label class="kaster-checkbox-label">
            <input type="checkbox" id="kaster-berre-aktive" checked>
            Vis berre aktive utøvarar
          </label>
        </div>
      </div>
      <div id="kaster-sideinfo" class="my-2"></div>
      <div id="kaster-paginering-topp"></div>
      <div id="kaster-grid" class="kaster-grid"></div>
      <div id="kaster-paginering-botn"></div>
    </div>`}function vn(e,t){if(t<=1)return``;let n=(t,n,r)=>`<button class="btn btn-sm ${n===e?`btn-primary`:`btn-outline-secondary`} pag-knapp"
      data-side="${n}" ${r?`disabled`:``}>${t}</button>`;return`
    <div class="kaster-paginering">
      ${n(`«`,1,e===1)}
      ${n(`‹`,e-1,e===1)}
      <span class="pag-info">side ${e} av ${t}</span>
      ${n(`›`,e+1,e===t)}
      ${n(`»`,t,e===t)}
    </div>`}async function yn(e){U.side=1,e.replaceChildren(A(`Laster utøvarar...`));try{let t=await tn();if(t.error){e.replaceChildren(k(`Kunne ikkje laste utøvarar.`));return}let n=t.data;e.innerHTML=_n();let r=e.querySelector(`#kaster-grid`),i=e.querySelector(`#kaster-sideinfo`),o=e.querySelector(`#kaster-paginering-topp`),s=e.querySelector(`#kaster-paginering-botn`),c=e.querySelector(`#kaster-sok`),l=e.querySelector(`#kaster-berre-aktive`);function u(){let e=U.sokeTekst.trim().toLowerCase(),t=n;e&&(t=t.filter(t=>a(t).toLowerCase().includes(e)||(t.klubb?.navn??``).toLowerCase().includes(e)));let c=t.length,l=Math.max(1,Math.ceil(c/mn));U.side>l&&(U.side=1);let u=(U.side-1)*mn,d=t.slice(u,u+mn);i.innerHTML=`side ${U.side} av ${l}`;let f=vn(U.side,l);o.innerHTML=f,s.innerHTML=f,r.innerHTML=d.map(gn).join(``)}u(),c.addEventListener(`input`,()=>{U.sokeTekst=c.value,U.side=1,u()}),l.addEventListener(`change`,async()=>{U.visAlle=!l.checked,U.side=1;let{data:e,error:t}=U.visAlle?await nn():await tn();t||(n=e),u()}),e.addEventListener(`click`,t=>{let n=t.target.closest(`.pag-knapp`);!n||n.disabled||(U.side=Number(n.dataset.side),u(),e.querySelector(`.nc-side`)?.scrollIntoView({behavior:`smooth`}))}),M().then(t=>{if(!t?.profil||t.profil.rolle!==`admin`&&t.profil.rolle!==`klubbadmin`)return;let n=document.createElement(`div`);n.className=`mb-2 px-2`,n.innerHTML=`<a href="#/kaster/ny" class="btn btn-sm btn-success">+ Ny utøvar</a>`,e.querySelector(`.nc-side`)?.prepend(n)})}catch(t){b(`renderListe`,t),e.replaceChildren(k(`Kunne ikkje laste utøvarar.`))}}var bn=2017,xn={kongelag:40,minimatch:60,halvmatch:100,heilmatch:200};function Sn(e){return e?parseInt(e.substring(0,4)):null}function Cn(e){return e.length?Math.round(e.reduce((e,t)=>e+t,0)/e.length):null}function wn(e,t){let n=(e.stevne?.innledendekastemetode?.navn??``).toLowerCase(),r=(e.stevne?.avsluttendekastemetode?.navn??``).toLowerCase();return n===t||r===t}function Tn(e){return[{label:`Kongelag`,rader:e.filter(e=>e.poeng_kongelag!=null),poengFn:e=>e.poeng_kongelag,ringFn:e=>e.antall_ring_kongelag,maxRing:xn.kongelag},{label:`Minimatch`,rader:e.filter(e=>e.poeng_xkast!=null&&wn(e,`minimatch`)),poengFn:e=>e.poeng_xkast,ringFn:e=>e.antall_ring_xkast,maxRing:xn.minimatch},{label:`Halvmatch`,rader:e.filter(e=>e.poeng_xkast!=null&&wn(e,`halvmatch`)),poengFn:e=>e.poeng_xkast,ringFn:e=>e.antall_ring_xkast,maxRing:xn.halvmatch},{label:`Heilmatch`,rader:e.filter(e=>e.poeng_xkast!=null&&wn(e,`heilmatch`)),poengFn:e=>e.poeng_xkast,ringFn:e=>e.antall_ring_xkast,maxRing:xn.heilmatch}].map(({label:e,rader:t,poengFn:n,ringFn:r,maxRing:i})=>{let a=t.length?Math.max(...t.map(e=>n(e))):null,o=Cn(t.map(e=>n(e))),s=t.filter(e=>r(e)!=null&&(Sn(e.stevne?.dato)??0)>=2017);return{label:e,rekord:a,snittPoeng:o,snittProsent:s.length?Math.round(s.reduce((e,t)=>e+r(t)/i*100,0)/s.length*100)/100:null}})}function En(e,t){let n=new Map;for(let r of e)r.klubb?.id&&r.klubb.id!==t&&n.set(r.klubb.id,r.klubb.navn);return[...n.values()]}function Dn(e,t,n){return t===`plassering`?e.plassering??null:n===`kongelag`?e.antall_ring_kongelag==null?null:Math.round(e.antall_ring_kongelag/xn.kongelag*1e4)/100:wn(e,n)?e.antall_ring_xkast==null?null:Math.round(e.antall_ring_xkast/xn[n]*1e4)/100:null}function On(e,t,n,r,i){let a=[...e].filter(e=>{let a=Sn(e.stevne?.dato);return r&&(a??0)<r||i&&(a??0)>i?!1:Dn(e,t,n)!=null}).sort((e,t)=>(e.stevne?.dato??``).localeCompare(t.stevne?.dato??``));return{labels:a.map(e=>O(e.stevne?.dato)),stevneNamn:a.map(e=>e.stevne?.navn??``),verdiar:a.map(e=>Dn(e,t,n))}}i.register(...r);var W={aktiv:`resultater`,ar:`alle`,stevnetype:`alle`,grafMetrikk:`plassering`,grafMetode:`kongelag`,grafFra:null,grafTil:null},kn=null;function An(){kn&&=(kn.destroy(),null)}function jn(e,t){let n=j(a(e)),r=e.medlemsnummer?` ${e.medlemsnummer}`:``,i=[...new Set(t.map(e=>Sn(e.stevne?.dato)).filter(e=>e!==null))].sort((e,t)=>t-e),o=[...new Map(t.map(e=>e.stevne?.stevnetype).filter(e=>e!=null).map(e=>[e.id,e.navn])).entries()].sort((e,t)=>e[1].localeCompare(t[1])),s=W.grafMetrikk===`prosent`?``:` d-none`;return`
    <div class="nc-side">
      <div class="mb-3">
        <a href="#/kastere" class="btn btn-sm btn-outline-secondary">← Tilbake</a>
      </div>
      <h1 class="kaster-detalj-tittel">${n}${j(r)}</h1>
      <p class="kaster-detalj-klubb">${j(e.klubb?.navn??`–`)}</p>

      <div class="kaster-tab-rad">
        <button class="btn btn-sm kaster-tab-knapp${W.aktiv===`resultater`?` active`:``}" data-tab="resultater">Resultat</button>
        <button class="btn btn-sm kaster-tab-knapp${W.aktiv===`statistikk`?` active`:``}" data-tab="statistikk">Statistikk</button>
        <button class="btn btn-sm kaster-tab-knapp${W.aktiv===`graf`?` active`:``}" data-tab="graf">Vis graf</button>
      </div>
      <hr>

      <div id="kd-tab-resultater" class="kd-tab${W.aktiv===`resultater`?``:` kd-skjult`}">
        <div class="nc-filter-rad mb-3">
          <select id="kd-ar" class="tl-select">
            <option value="alle">Vel årstal</option>
            ${i.map(e=>`<option value="${e}"${W.ar==String(e)?` selected`:``}>${e}</option>`).join(``)}
          </select>
          <select id="kd-type" class="tl-select">
            <option value="alle">Alle stevnetypar</option>
            ${o.map(([e,t])=>`<option value="${e}">${j(t)}</option>`).join(``)}
          </select>
        </div>
        <div id="kd-resultat-tabell"></div>
      </div>

      <div id="kd-tab-statistikk" class="kd-tab${W.aktiv===`statistikk`?``:` kd-skjult`}">
        <div id="kd-stat-innhald"></div>
      </div>

      <div id="kd-tab-graf" class="kd-tab${W.aktiv===`graf`?``:` kd-skjult`}">
        <div class="nc-filter-rad mb-3">
          <select id="kd-graf-metrikk" class="tl-select">
            <option value="plassering"${W.grafMetrikk===`plassering`?` selected`:``}>Plassering</option>
            <option value="prosent"${W.grafMetrikk===`prosent`?` selected`:``}>% Ring (frå 2017)</option>
          </select>
          <select id="kd-graf-metode" class="tl-select${s}">
            <option value="kongelag"${W.grafMetode===`kongelag`?` selected`:``}>Kongelag</option>
            <option value="minimatch"${W.grafMetode===`minimatch`?` selected`:``}>Minimatch</option>
            <option value="halvmatch"${W.grafMetode===`halvmatch`?` selected`:``}>Halvmatch</option>
            <option value="heilmatch"${W.grafMetode===`heilmatch`?` selected`:``}>Heilmatch</option>
          </select>
          <select id="kd-graf-fra" class="tl-select">
            <option value="">Frå år</option>
            ${i.map(e=>`<option value="${e}"${W.grafFra==String(e)?` selected`:``}>${e}</option>`).join(``)}
          </select>
          <select id="kd-graf-til" class="tl-select">
            <option value="">Til år</option>
            ${i.map(e=>`<option value="${e}"${W.grafTil==String(e)?` selected`:``}>${e}</option>`).join(``)}
          </select>
        </div>
        <div class="kaster-graf-wrapper">
          <canvas id="kd-graf-canvas"></canvas>
        </div>
      </div>
    </div>`}function Mn(e,t,n){let r=e;t!==`alle`&&(r=r.filter(e=>String(Sn(e.stevne?.dato))===t)),n!==`alle`&&(r=r.filter(e=>String(e.stevne?.stevnetype?.id)===n));let i=r.length,a=`
    <div class="kaster-resultat-info">
      <span>Antal: <strong>${i}</strong></span>
      <span class="kaster-resultat-hint">Antal ringar i parentes (frå ${bn})</span>
    </div>`;if(!i)return a+`<p class="empty-state">Ingen resultat funnet.</p>`;let o=(e,t)=>e==null?``:t==null?`${e}`:`${e} (${t})`;return a+`
    <div class="table-responsive">
      <table class="app-tabell">
        <thead class="app-thead">
          <tr>
            <th>Dato</th><th>Stevne</th><th>Type</th><th>Klubb</th>
            <th>Pl.</th><th>Kongelag</th><th>X-kast</th>
          </tr>
        </thead>
        <tbody>${r.map(e=>{let t=e.stevne,n=t?.id?`<a href="#/stevne/${t.id}/resultat" class="tl-lenkje">${j(t.navn??``)}</a>`:j(t?.navn??`–`);return`
      <tr>
        <td class="text-nowrap">${O(t?.dato)}</td>
        <td>${n}</td>
        <td>${j(t?.stevnetype?.navn??`–`)}</td>
        <td>${j(e.klubb?.navn??`–`)}</td>
        <td class="text-center fw-bold">${e.plassering??`–`}</td>
        <td class="text-center">${o(e.poeng_kongelag,e.antall_ring_kongelag)}</td>
        <td class="text-center">${o(e.poeng_xkast,e.antall_ring_xkast)}</td>
      </tr>`}).join(``)}</tbody>
      </table>
    </div>`}function Nn(e,t){let n=Tn(e),r=En(e,t.klubb?.id??null);return`
    <div class="kaster-stat-grid">
      <div>
        <h4>Statistikk</h4>
        <table class="app-tabell">
          <thead class="app-thead">
            <tr>
              <th></th><th>Rekord</th><th>Snitt Poeng</th><th>% Ring (frå ${bn})</th>
            </tr>
          </thead>
          <tbody>${n.map(({label:e,rekord:t,snittPoeng:n,snittProsent:r})=>`
    <tr>
      <td>${e}</td>
      <td class="text-center">${t??`–`}</td>
      <td class="text-center">${n??`–`}</td>
      <td class="text-center">${r==null?`–`:ie(r)}</td>
    </tr>`).join(``)}</tbody>
        </table>
      </div>
      ${r.length?`<div class="kaster-tidlegare-klubbar">
        <h4 class="kaster-tidlegare-tittel">Tidlegare klubbar</h4>
        <ul class="list-unstyled">${r.map(e=>`<li>${j(e)}</li>`).join(``)}</ul>
      </div>`:``}
    </div>`}function Pn(e,t){An();let{labels:n,stevneNamn:r,verdiar:a}=On(t,W.grafMetrikk,W.grafMetode,W.grafFra?Number(W.grafFra):null,W.grafTil?Number(W.grafTil):null);if(!a.length){let t=e.parentElement;if(t){let e=L(`Ingen data for valt filter.`);e.classList.add(`pt-3`),t.replaceChildren(e)}return}let o=W.grafMetrikk===`plassering`,s=o?`Plassering`:`% Ring`;kn=new i(e,{type:`line`,data:{labels:n,datasets:[{label:s,data:a,borderColor:`#4e8fc7`,backgroundColor:`rgba(78,143,199,0.15)`,pointBackgroundColor:`#4e8fc7`,pointRadius:4,tension:.1,fill:!1}]},options:{responsive:!0,maintainAspectRatio:!1,scales:{x:{ticks:{maxTicksLimit:14,maxRotation:45,color:`#ccc`},grid:{color:`rgba(255,255,255,0.08)`}},y:{reverse:o,ticks:{color:`#ccc`},grid:{color:`rgba(255,255,255,0.08)`},title:{display:!0,text:s,color:`#ccc`}}},plugins:{legend:{display:!1},tooltip:{callbacks:{title:e=>r[e[0].dataIndex]??n[e[0].dataIndex]??``,label:e=>`${s}: ${e.raw}`}}}}})}async function Fn(e,t){W.aktiv=`resultater`,W.ar=`alle`,W.stevnetype=`alle`,W.grafMetrikk=`plassering`,W.grafMetode=`kongelag`,W.grafFra=null,W.grafTil=null,An(),e.replaceChildren(A(`Laster utøvar...`));try{let{kaster:n,resultater:r,error:i}=await rn(t);if(i||!n){e.replaceChildren(k(`Kunne ikkje laste utøvar.`));return}let a=n;e.innerHTML=jn(a,r);let o=e.querySelector(`#kd-ar`),s=e.querySelector(`#kd-type`),c=e.querySelector(`#kd-graf-metode`);function l(){e.querySelector(`#kd-resultat-tabell`).innerHTML=Mn(r,W.ar,W.stevnetype)}function u(){e.querySelector(`#kd-stat-innhald`).innerHTML=Nn(r,a)}function d(){let t=e.querySelector(`#kd-graf-canvas`);t&&Pn(t,r)}function f(t){W.aktiv=t,e.querySelectorAll(`.kaster-tab-knapp`).forEach(e=>{e.classList.toggle(`active`,e.dataset.tab===t)}),e.querySelectorAll(`.kd-tab`).forEach(e=>{e.classList.toggle(`kd-skjult`,e.id!==`kd-tab-${t}`)}),t===`statistikk`&&u(),t===`graf`&&d()}l(),o.addEventListener(`change`,()=>{W.ar=o.value,l()}),s.addEventListener(`change`,()=>{W.stevnetype=s.value,l()}),e.querySelectorAll(`.kaster-tab-knapp`).forEach(e=>{e.addEventListener(`click`,()=>f(e.dataset.tab??``))});let p=e.querySelector(`#kd-graf-metrikk`);p.addEventListener(`change`,()=>{W.grafMetrikk=p.value,c.classList.toggle(`d-none`,p.value!==`prosent`),d()}),c.addEventListener(`change`,()=>{W.grafMetode=c.value,d()});let m=e.querySelector(`#kd-graf-fra`),h=e.querySelector(`#kd-graf-til`);m.addEventListener(`change`,()=>{W.grafFra=m.value||null,d()}),h.addEventListener(`change`,()=>{W.grafTil=h.value||null,d()}),M().then(n=>{if(!n?.profil||!(n.profil.rolle===`admin`||n.profil.rolle===`klubbadmin`&&n.klubber.includes(a.klubbid??-1)))return;let r=document.createElement(`div`);r.className=`mb-2 px-2`,r.innerHTML=`<a href="#/kaster/${t}/admin" class="btn btn-sm btn-warning">Rediger utøvar</a>`,e.querySelector(`.nc-side`)?.prepend(r)})}catch(t){b(`renderDetalj`,t),e.replaceChildren(k(`Kunne ikkje laste utøvar.`))}}var In=async(e,t)=>{An(),t.id?await Fn(e,Number(t.id)):await yn(e)},Ln=null;async function Rn(){if(Ln)return Ln;let{data:e,error:t}=await y.from(`klubb`).select(`id, navn, logourl`).eq(`eraktiv`,!0).order(`navn`);return t&&b(`hentKlubbar`,t),Ln={data:e??[],error:t},Ln}async function zn(e){let{data:t,error:n}=await y.from(`klubb`).select(`id, navn, logourl`).eq(`id`,e).single();return n&&b(`hentKlubbById`,n),{data:t,error:n}}async function Bn(e){let{data:t,error:n}=await y.from(`klubb`).select(`id, navn, kortnavn, logourl, eraktiv`).eq(`id`,e).single();return n&&b(`hentKlubbForAdmin`,n),{data:t,error:n}}async function Vn(e,t){let{error:n}=await y.from(`klubb`).update(t).eq(`id`,e);return n&&b(`oppdaterKlubb`,n),{error:n}}var Hn=`https://placehold.co/200x200/444/888?text=?`,Un={sokeTekst:``},Wn={sokeTekst:``};function Gn(e){return`
    <a href="#/klubber/${c(e)}" class="kaster-kort">
      <img src="${j(e.logourl||Hn)}" alt="${j(e.navn)}" loading="lazy">
      <div class="kaster-navn">${j(e.navn)}</div>
    </a>`}function Kn(){return`
    <div class="nc-side">
      <div class="kaster-liste-kontroller">
        <div class="nc-filter-rad">
          <input id="klubb-sok" type="text" class="tl-select" placeholder="Søk på klubbnavn eller utøvar" value="">
          <button id="klubb-sok-knapp" class="btn btn-secondary btn-sm">Søk</button>
        </div>
      </div>
      <div id="klubb-grid" class="kaster-grid"></div>
    </div>`}function qn(e,t){return`
    <div class="nc-side">
      <div class="mb-3">
        <a href="#/klubber" class="btn btn-sm btn-outline-secondary">← Tilbake</a>
      </div>
      <div class="klubb-detalj-header">
        <img src="${j(e.logourl||Hn)}" alt="${j(e.navn)}" class="klubb-logo-stor">
        <h1 class="klubb-detalj-tittel">${j(e.navn)}</h1>
      </div>
      <h3 class="mb-2">Aktive utøvarar (${t})</h3>
      <div class="nc-filter-rad mb-3">
        <input id="klubb-detalj-sok" type="text" class="tl-select" placeholder="Søk på utøvar" value="">
        <button id="klubb-detalj-sok-knapp" class="btn btn-secondary btn-sm">Søk</button>
      </div>
      <div id="klubb-detalj-liste"></div>
    </div>`}function Jn(e,t){let n=t.trim().toLowerCase(),r=n?e.filter(e=>a(e).toLowerCase().includes(n)):e;if(!r.length)return L(`Ingen aktive utøvarar funnet.`);let i=document.createElement(`div`);return i.className=`table-responsive`,i.appendChild(R({rows:r,columns:[{label:`#`,render:(e,t)=>String(t+1)},{label:`Utøvar`,render:e=>{let t=document.createElement(`a`);return t.href=`#/kastere/${s(e)}`,t.className=`tl-lenkje`,t.textContent=a(e),t}},{label:`Klasse`,render:e=>e.klasse?.navn??`–`},{label:`Nr.`,render:e=>String(e.medlemsnummer??`–`)}]})),i}async function Yn(e){e.replaceChildren(A(`Laster klubbar...`));try{let[{data:t,error:n},{data:r}]=await Promise.all([Rn(),tn()]);if(n){e.replaceChildren(k(`Kunne ikkje laste klubbar.`));return}let i=new Map;for(let e of r)e.klubb?.id&&(i.has(e.klubb.id)||i.set(e.klubb.id,[]),i.get(e.klubb.id).push(a(e).toLowerCase()));e.innerHTML=Kn();let o=e.querySelector(`#klubb-grid`),s=e.querySelector(`#klubb-sok`);function c(){let e=Un.sokeTekst.trim().toLowerCase(),n=e?t.filter(t=>t.navn.toLowerCase().includes(e)||(i.get(t.id)??[]).some(t=>t.includes(e))):t;o.innerHTML=n.length?n.map(Gn).join(``):`<p class="empty-state">Ingen klubbar funnet.</p>`}c(),s.addEventListener(`keydown`,e=>{e.key===`Enter`&&(Un.sokeTekst=s.value,c())}),e.querySelector(`#klubb-sok-knapp`).addEventListener(`click`,()=>{Un.sokeTekst=s.value,c()}),M().then(t=>{if(t?.profil?.rolle!==`admin`)return;let n=document.createElement(`div`);n.className=`mb-2 px-2`,n.innerHTML=`<a href="#/klubber/ny" class="btn btn-sm btn-success">+ Ny klubb</a>`,e.querySelector(`.nc-side`)?.prepend(n)})}catch(t){b(`renderListe`,t),e.replaceChildren(k(`Kunne ikkje laste klubbar.`))}}async function Xn(e,t){Wn.sokeTekst=``,e.replaceChildren(A(`Laster klubb...`));try{let[n,{data:r}]=await Promise.all([zn(t),en(t)]);if(n.error||!n.data){e.replaceChildren(k(`Kunne ikkje laste klubb.`));return}let i=n.data;e.innerHTML=qn(i,r.length);let a=e.querySelector(`#klubb-detalj-liste`),o=e.querySelector(`#klubb-detalj-sok`);function s(){a.replaceChildren(Jn(r,Wn.sokeTekst))}s(),o.addEventListener(`keydown`,e=>{e.key===`Enter`&&(Wn.sokeTekst=o.value,s())}),e.querySelector(`#klubb-detalj-sok-knapp`).addEventListener(`click`,()=>{Wn.sokeTekst=o.value,s()}),M().then(n=>{if(!n?.profil||!(n.profil.rolle===`admin`||n.profil.rolle===`klubbadmin`&&n.klubber.includes(t)))return;let r=document.createElement(`div`);r.className=`mb-2 px-2`,r.innerHTML=`<a href="#/klubber/${t}/admin" class="btn btn-sm btn-warning">Rediger klubb</a>`,e.querySelector(`.nc-side`)?.prepend(r)})}catch(t){b(`renderDetalj`,t),e.replaceChildren(k(`Kunne ikkje laste klubb.`))}}var Zn=async(e,t)=>{t.id?await Xn(e,Number(t.id)):await Yn(e)};y.from(`kaster_rekorder`).select(`metode, poeng, kasterid, fornavn, etternavn, kjonn_navn, klubb_navn, stevne_id, stevne_navn, ar`);var Qn=null;async function $n(){if(Qn)return{data:Qn,error:null};let{data:e,error:t}=await y.from(`kaster_rekorder`).select(`metode, poeng, kasterid, fornavn, etternavn, kjonn_navn, klubb_navn, stevne_id, stevne_navn, ar`);return t?(b(`hentAlleRekorder`,t),{data:[],error:t}):(Qn=e,{data:e,error:null})}var er=[{verdi:`kongelag`,label:`Kongelag`,maxPoeng:200},{verdi:`minimatch`,label:`Minimatch`,maxPoeng:300},{verdi:`halvmatch`,label:`Halvmatch`,maxPoeng:500},{verdi:`heilmatch`,label:`Heilmatch`,maxPoeng:1e3}],G={metode:`kongelag`,kjonn:`alle`,sokeTekst:``};function tr(e){return(e.kjonn_navn??``).toLowerCase().includes(`dame`)}function nr(e){let t=G.sokeTekst.trim().toLowerCase(),n=e.filter(e=>{if(e.metode!==G.metode||G.kjonn===`damer`&&!tr(e)||G.kjonn===`herrer`&&tr(e))return!1;if(t){let n=a({fornavn:e.fornavn??``,etternavn:e.etternavn??``}).toLowerCase(),r=(e.klubb_navn??``).toLowerCase();if(!n.includes(t)&&!r.includes(t))return!1}return!0});n.sort((e,t)=>(t.poeng??0)-(e.poeng??0));let r=1;return n.map((e,t)=>(t>0&&(e.poeng??0)<(n[t-1].poeng??0)&&(r=t+1),{...e,plassering:r}))}function rr(e){if(!e.length)return L(`Ingen rekorder funnet.`);let t=document.createElement(`div`);return t.className=`rek-tabell-wrapper`,t.appendChild(R({rows:e,rowClass:e=>tr(e)?`rek-dame-rad`:void 0,columns:[{label:`Pl.`,thClass:`rek-th-pl`,render:e=>String(e.plassering)},{label:`Navn`,render:e=>{let t=s({id:e.kasterid??0,fornavn:e.fornavn??``,etternavn:e.etternavn??``}),n=document.createElement(`a`);return n.href=`#/kastere/${t}`,n.className=`tl-lenkje`,n.textContent=a({fornavn:e.fornavn??``,etternavn:e.etternavn??``}),n}},{label:`Klubb`,render:e=>e.klubb_navn??`–`},{label:`Poeng`,thClass:`rek-th-poeng`,render:e=>{if(!e.stevne_id)return String(e.poeng??`–`);let t=document.createElement(`span`);return t.className=`rek-poeng-celle`,t.title=e.stevne_navn??``,t.dataset.stevneid=String(e.stevne_id),t.textContent=String(e.poeng??`–`),t}},{label:`År`,thClass:`rek-th-ar`,render:e=>String(e.ar??`–`)}]})),t}function ir(){return`
    <div class="nc-side">
      <h1 class="rek-tittel">Rekorder</h1>
      <p id="rek-maks-tekst" class="rek-maks-tekst"></p>
      <div class="nc-filter-rad">
        <select id="rek-metode" class="tl-select">${er.map(e=>`<option value="${e.verdi}"${e.verdi===G.metode?` selected`:``}>${j(e.label)}</option>`).join(``)}</select>
        <select id="rek-kjonn" class="tl-select">
          <option value="alle">Alle</option>
          <option value="herrer">Herrer</option>
          <option value="damer">Damer</option>
        </select>
        <input id="rek-sok" type="text" class="tl-select" placeholder="Søk på etternavn/klubb" value="">
      </div>
      <div id="rek-tabell-container"></div>
    </div>`}async function ar(e){G.metode=`kongelag`,G.kjonn=`alle`,G.sokeTekst=``,e.replaceChildren(A(`Laster rekorder…`));try{let{data:t,error:n}=await $n();if(n){e.replaceChildren(k(`Kunne ikkje laste rekorder.`));return}e.innerHTML=ir();function r(){let t=er.find(e=>e.verdi===G.metode);e.querySelector(`#rek-maks-tekst`).textContent=`(Maks poengsum: ${t.maxPoeng})`}function i(){e.querySelector(`#rek-tabell-container`).replaceChildren(rr(nr(t)))}r(),i(),e.querySelector(`#rek-metode`).addEventListener(`change`,e=>{G.metode=e.target.value,r(),i()}),e.querySelector(`#rek-kjonn`).addEventListener(`change`,e=>{G.kjonn=e.target.value,i()}),e.querySelector(`#rek-sok`).addEventListener(`input`,e=>{G.sokeTekst=e.target.value,i()}),e.addEventListener(`click`,e=>{let t=e.target.closest(`.rek-poeng-celle`);t?.dataset.stevneid&&(location.hash=`#/stevne/${t.dataset.stevneid}/resultat`)})}catch(t){b(`rekorder.render`,t),e.replaceChildren(k(`Kunne ikkje laste rekorder.`))}}y.from(`resultat`).select(`id, klasseid, kaster:kasterid(id, fornavn, etternavn), klubb:klubbid(id, navn), stevne:stevneid(id, dato)`);var or=new Map,sr=null,cr=[1,3,4,13,16,21,23,24,27,29,32];async function lr(){if(sr)return sr;let{data:e,error:t}=await y.from(`kjonn`).select(`id, navn`);return t&&b(`hentKjonnIder`,t),sr=e??[],sr}function ur(e,t){let n=t===`damer`?`dame`:`herre`;return e.find(e=>e.navn.toLowerCase().includes(n))?.id}async function dr(e,t){let n=`${e.id}-${t}`;if(or.has(n))return or.get(n);let r=y.from(`stevne`).select(`id, dato`).eq(`ernm`,!0).eq(`kategoriid`,e.id);e.kjonnFilter===`historisk`&&e.aapentFraAr!=null&&(r=t===`open`?r.gte(`dato`,`${e.aapentFraAr}-01-01`):r.lt(`dato`,`${e.aapentFraAr}-01-01`));let{data:i,error:a}=await r;if(a)return b(`hentNmData.stevner`,a),{data:[],error:a};let o=(i??[]).map(e=>e.id);if(!o.length){let e={data:[],error:null};return or.set(n,e),e}let s=e.kjonnFilter===`historisk`&&t!==`open`||e.kjonnFilter===`alltid`&&t!==`alle`,c=s?`kaster:kasterid!inner(id, fornavn, etternavn)`:`kaster:kasterid(id, fornavn, etternavn)`,l=y.from(`resultat`).select(`id, klasseid, ${c}, klubb:klubbid(id, navn), stevne:stevneid(id, dato)`).eq(`plassering`,1).in(`stevneid`,o).in(`klasseid`,cr).or(`gruppeid.is.null,gruppeid.neq.2`);if(s){let e=ur(await lr(),t);e&&(l=l.eq(`kaster.kjonnid`,e))}e.kjonnFilter===`historisk`&&t===`open`&&(l=l.eq(`klasseid`,1));let{data:u,error:d}=await l;if(d)return b(`hentNmData.resultater`,d),{data:[],error:d};let f={data:u??[],error:null};return or.set(n,f),f}var fr=[{id:1,navn:`Singel`,kjonnFilter:`historisk`,fraaAr:1985,aapentFraAr:2013,merknad:`(åpen klasse fra 2013)`},{id:2,navn:`Par`,kjonnFilter:`historisk`,fraaAr:1987,aapentFraAr:2009,merknad:`(åpen klasse fra 2009)`},{id:3,navn:`Mix`,kjonnFilter:!1,fraaAr:1986,merknad:`(NM Mix 2011 ble ikke arrangert)`},{id:4,navn:`Lag`,kjonnFilter:!1,fraaAr:2016},{id:7,navn:`X-kast`,kjonnFilter:`historisk`,fraaAr:2009,aapentFraAr:2013,merknad:`(åpen klasse fra 2013)`},{id:9,navn:`Hesteskogolf`,kjonnFilter:`alltid`,fraaAr:2006},{id:10,navn:`Kongelag`,kjonnFilter:!1,fraaAr:2023}],K={kategoriId:1,kjonn:`open`};function pr(e){return e?parseInt(e.substring(0,4)):null}function mr(e){return e===`alltid`?`alle`:`open`}function hr(e,t){return t===`herrer`?`${e} Herrer`:t===`damer`?`${e} Damer`:e}function gr(e){let t=new Map;for(let n of e){let e=`${n.stevne?.id}-${n.klasseid}`;t.has(e)||t.set(e,{ar:pr(n.stevne?.dato),stevneId:n.stevne?.id,kastere:[],klubb:n.klubb}),n.kaster&&t.get(e).kastere.push(n.kaster)}return[...t.values()].sort((e,t)=>(t.ar??0)-(e.ar??0))}function _r(e){if(!e.length)return L(`Ingen vinnere funnet.`);function t(e){let t=document.createElement(`a`);return t.href=`#/kastere/${s(e)}`,t.className=`tl-lenkje`,t.textContent=a(e),t}let n=document.createElement(`div`);return n.className=`nm-tabell-wrapper`,n.appendChild(R({rows:e,columns:[{label:`År`,thClass:`nm-td-ar`,cellClass:`nm-td-ar`,render:({ar:e,stevneId:t})=>{if(!t)return String(e??`–`);let n=document.createElement(`a`);return n.href=`#/stevne/${t}/resultat`,n.className=`tl-lenkje`,n.textContent=String(e??`–`),n}},{label:`Navn`,render:({kastere:e})=>{if(!e.length)return`–`;let n=document.createDocumentFragment();return e.forEach((e,r)=>{r>0&&n.appendChild(document.createTextNode(` og `)),n.appendChild(t(e))}),n}},{label:`Klubb`,render:({klubb:e})=>e?.navn??`–`}]})),n}function vr(e,t){let n=`Norgesmestere ${e.fraaAr} - ${t}`,r=fr.map(e=>`<option value="${e.id}"${e.id===K.kategoriId?` selected`:``}>${j(e.navn)}</option>`).join(``),i=``;return e.kjonnFilter===`historisk`?i=`
      <select id="nm-kjonn" class="tl-select">
        <option value="open"${K.kjonn===`open`?` selected`:``}>Åpen klasse</option>
        <option value="herrer"${K.kjonn===`herrer`?` selected`:``}>Herrer</option>
        <option value="damer"${K.kjonn===`damer`?` selected`:``}>Damer</option>
      </select>`:e.kjonnFilter===`alltid`&&(i=`
      <select id="nm-kjonn" class="tl-select">
        <option value="alle"${K.kjonn===`alle`?` selected`:``}>Alle</option>
        <option value="herrer"${K.kjonn===`herrer`?` selected`:``}>Herrer</option>
        <option value="damer"${K.kjonn===`damer`?` selected`:``}>Damer</option>
      </select>`),`
    <div class="nc-side">
      <div class="nc-filter-rad">
        <select id="nm-kategori" class="tl-select">${r}</select>
        ${i}
      </div>
      <h1 class="nm-tittel">${j(n)}</h1>
      <h2 id="nm-undertittel" class="nm-undertittel">${j(hr(e.navn,K.kjonn))}</h2>
      <p class="nm-merknad">${e.merknad?j(e.merknad):``}</p>
      <div id="nm-tabell-container"></div>
    </div>`}async function yr(e){e.replaceChildren(A(`Laster NM-vinnere…`));let t=fr.find(e=>e.id===K.kategoriId);try{let{data:n,error:r}=await dr(t,K.kjonn);if(r){b(`nmvinnere.renderKategori`,r),e.replaceChildren(k(`Kunne ikkje laste NM-vinnere.`));return}e.innerHTML=vr(t,n.reduce((e,t)=>Math.max(e,pr(t.stevne?.dato)??0),0)||new Date().getFullYear()),e.querySelector(`#nm-tabell-container`).replaceChildren(_r(gr(n)));let i=e.querySelector(`#nm-kategori`);i.addEventListener(`change`,async()=>{K.kategoriId=Number(i.value),K.kjonn=mr(fr.find(e=>e.id===K.kategoriId).kjonnFilter),await yr(e)});let a=e.querySelector(`#nm-kjonn`);a?.addEventListener(`change`,async()=>{K.kjonn=a.value,await yr(e)})}catch(t){b(`nmvinnere.renderKategori`,t),e.replaceChildren(k(`Kunne ikkje laste NM-vinnere.`))}}async function br(e){K.kategoriId=1,K.kjonn=mr(fr[0].kjonnFilter),await yr(e)}function xr({tabs:e,activeId:t}){if(!e.length)return document.createElement(`div`);let n=Math.max(e.findIndex(e=>e.id===(t??``)),0),r=document.createElement(`div`),i=document.createElement(`ul`);i.className=`nav nav-tabs mb-3`,i.setAttribute(`role`,`tablist`);let a=[],o=[];e.forEach((e,t)=>{let r=t===n,s=document.createElement(`li`);s.className=`nav-item`,s.setAttribute(`role`,`presentation`);let c=document.createElement(`button`);c.type=`button`,c.className=`nav-link`+(r?` active`:``),c.id=`tab-${e.id}`,c.setAttribute(`role`,`tab`),c.setAttribute(`aria-selected`,String(r)),c.setAttribute(`aria-controls`,`tabpanel-${e.id}`),c.setAttribute(`tabindex`,r?`0`:`-1`),c.textContent=e.label,s.appendChild(c),i.appendChild(s),a.push(c);let l=document.createElement(`div`);l.id=`tabpanel-${e.id}`,l.setAttribute(`role`,`tabpanel`),l.setAttribute(`aria-labelledby`,`tab-${e.id}`),r||l.classList.add(`d-none`),l.appendChild(e.panel),o.push(l)});function s(e){n=e,a.forEach((t,n)=>{let r=n===e;t.classList.toggle(`active`,r),t.setAttribute(`aria-selected`,String(r)),t.setAttribute(`tabindex`,r?`0`:`-1`)}),o.forEach((t,n)=>{t.classList.toggle(`d-none`,n!==e)})}return a.forEach((e,t)=>{e.addEventListener(`click`,()=>s(t))}),i.addEventListener(`keydown`,t=>{if(t.key!==`ArrowLeft`&&t.key!==`ArrowRight`)return;t.preventDefault();let r=t.key===`ArrowRight`?(n+1)%e.length:(n-1+e.length)%e.length;s(r),a[r].focus()}),r.appendChild(i),o.forEach(e=>r.appendChild(e)),r}function Sr(e){let t=document.createElement(`div`);return t.innerHTML=e,t}async function Cr(e){let t=await M();if(t){e.innerHTML=`
      <div class="container py-4 konto-container">
        <p>Du er allereie innlogga som <strong>${j(t.user.email)}</strong>.</p>
        <a href="#/minside" class="btn btn-primary">Gå til Min side</a>
      </div>`;return}let n=Sr(`
    <form id="logginn-skjema">
      <div class="mb-3">
        <label class="form-label" for="li-epost">E-post</label>
        <input type="email" class="form-control" id="li-epost" required autocomplete="email">
      </div>
      <div class="mb-3">
        <label class="form-label" for="li-passord">Passord</label>
        <input type="password" class="form-control" id="li-passord" required autocomplete="current-password">
      </div>
      <div id="li-feil" class="alert alert-danger d-none"></div>
      <button type="submit" class="btn btn-primary w-100">Logg inn</button>
    </form>`),r=Sr(`
    <form id="registrer-skjema">
      <div class="mb-3">
        <label class="form-label" for="reg-epost">E-post</label>
        <input type="email" class="form-control" id="reg-epost" required autocomplete="email">
      </div>
      <div class="mb-3">
        <label class="form-label" for="reg-passord">Passord</label>
        <input type="password" class="form-control" id="reg-passord" required autocomplete="new-password" minlength="8">
      </div>
      <div class="mb-3">
        <label class="form-label" for="reg-passord2">Gjenta passord</label>
        <input type="password" class="form-control" id="reg-passord2" required autocomplete="new-password" minlength="8">
      </div>
      <div id="reg-feil" class="alert alert-danger d-none"></div>
      <div id="reg-suksess" class="alert alert-success d-none">
        Konto oppretta! Du kan no logge inn.
      </div>
      <button type="submit" class="btn btn-success w-100">Opprett konto</button>
    </form>`),i=document.createElement(`div`);i.className=`container py-4 konto-container`;let a=document.createElement(`h2`);a.className=`mb-4`,a.textContent=`Konto`,i.appendChild(a),i.appendChild(xr({tabs:[{id:`logginn`,label:`Logg inn`,panel:n},{id:`registrer`,label:`Registrer ny konto`,panel:r}]})),e.replaceChildren(i),e.querySelector(`#logginn-skjema`).addEventListener(`submit`,async t=>{t.preventDefault();let n=t.target,r=e.querySelector(`#li-feil`);r.classList.add(`d-none`);let i=n.querySelector(`[type=submit]`);i.disabled=!0;let{error:a}=await st(e.querySelector(`#li-epost`).value.trim(),e.querySelector(`#li-passord`).value);if(a){r.textContent=a.message===`Invalid login credentials`?`Feil e-post eller passord.`:a.message,r.classList.remove(`d-none`),i.disabled=!1;return}let o=new URLSearchParams(location.hash.split(`?`)[1]??``).get(`redirect`);o?location.hash=`#${o}`:location.hash=await N()?`#/admin`:`#/minside`}),e.querySelector(`#registrer-skjema`).addEventListener(`submit`,async t=>{t.preventDefault();let n=t.target,r=e.querySelector(`#reg-feil`),i=e.querySelector(`#reg-suksess`);r.classList.add(`d-none`),i.classList.add(`d-none`);let a=e.querySelector(`#reg-passord`).value;if(a!==e.querySelector(`#reg-passord2`).value){r.textContent=`Passorda er ikkje like.`,r.classList.remove(`d-none`);return}let o=n.querySelector(`[type=submit]`);o.disabled=!0;let s=e.querySelector(`#reg-epost`).value.trim(),{error:c}=await ct(s,a);if(c){r.textContent=c.message,r.classList.remove(`d-none`),o.disabled=!1;return}await st(s,a),location.hash=`#/minside`})}y.from(`pamelding`).select(`id, stevne:stevneid(id, navn, dato)`),y.from(`pamelding`).select(`id, kasterid, kaster:kasterid(id, fornavn, etternavn, klubb:klubbid(navn))`),y.from(`pamelding`).select(`id, kasterid, er_bekreftet`);async function wr(e){let{data:t,error:n}=await y.from(`pamelding`).select(`id, stevne:stevneid(id, navn, dato)`).eq(`bruker_id`,e).limit(50);return n&&b(`hentMinePameldingar`,n),{data:t??[],error:n}}async function Tr(e){let{data:t,error:n}=await y.from(`pamelding`).select(`id, kasterid, kaster:kasterid(id, fornavn, etternavn, klubb:klubbid(navn))`).eq(`stevneid`,e).order(`id`);return n&&b(`hentPameldingarForStevne`,n),{data:t??[],error:n}}async function Er(e,t,n){let{error:r}=await y.from(`pamelding`).insert({stevneid:e,kasterid:t,bruker_id:n});return r&&b(`meldPaStevne`,r),{error:r}}async function Dr(e){let{error:t}=await y.from(`pamelding`).delete().eq(`id`,e);return t&&b(`fjernPamelding`,t),{error:t}}async function Or(e){let{count:t,error:n}=await y.from(`pamelding`).select(`id`,{count:`exact`,head:!0}).eq(`stevneid`,e);return n&&b(`hentAntallPameldingar`,n),t??0}async function kr(e){let{count:t,error:n}=await y.from(`pamelding`).select(`id`,{count:`exact`,head:!0}).eq(`stevneid`,e).eq(`er_bekreftet`,!1);return n&&b(`hentAntallUbekrefta`,n),t??0}async function Ar(e){let{data:t,error:n}=await y.from(`pamelding`).select(`id, kasterid, er_bekreftet`).eq(`stevneid`,e).order(`id`);return n&&b(`hentPameldingStatusForStevne`,n),{data:t??[],error:n}}async function jr(e,t){let n=await M(),{error:r}=await y.from(`pamelding`).insert({stevneid:e,kasterid:t,...n?.user?{bruker_id:n.user.id}:{}});return r&&b(`leggTilPameldingAdmin`,r),{error:r}}async function Mr(e,t){let{error:n}=await y.from(`pamelding`).update({er_bekreftet:!0}).eq(`stevneid`,e).eq(`kasterid`,t);return n&&b(`bekreftPameldingForKaster`,n),{error:n}}async function Nr(e,t){let{error:n}=await y.from(`pamelding`).delete().eq(`stevneid`,e).eq(`kasterid`,t);return n&&b(`fjernPameldingForKaster`,n),{error:n}}function Pr(e,t){return e===t?[1.5,1.5]:e>t?[2,+(t>=11)]:[+(e>=11),2]}function Fr(e,t){let n=e??[];if(n.some(e=>e.posisjon!=null))return[n.find(e=>e.posisjon===1)??null,n.find(e=>e.posisjon===2)??null];let r=[...n].sort((e,n)=>(t[e.kasterid]??1/0)-(t[n.kasterid]??1/0));return[r[0]??null,r[1]??null]}function Ir(e){return e?.omgangar?.length?e.omgangar.reduce((e,t)=>e+(t.score??0),0):e?.score_poeng??0}y.from(`kamp_spelar`).select(`
  id, kasterid, posisjon,
  kamp:kampid(
    id, stevneid, fase, runde_nummer, bane_nummer, er_bekreftet, er_walkover,
    stevne:stevneid(id, navn, erfullfort),
    spelarar:kamp_spelar(
      id, kasterid, posisjon,
      kaster:kasterid(id, fornavn, etternavn)
    )
  )
`);async function Lr(e){let{data:t,error:n}=await y.from(`kamp_spelar`).select(`
      id, kasterid, posisjon,
      kamp:kampid(
        id, stevneid, fase, runde_nummer, bane_nummer, er_bekreftet, er_walkover,
        stevne:stevneid(id, navn, erfullfort),
        spelarar:kamp_spelar(
          id, kasterid, posisjon,
          kaster:kasterid(id, fornavn, etternavn)
        )
      )
    `).eq(`kasterid`,e);return n&&b(`hentMineKampar`,n),{data:t??[],error:n}}y.from(`kamp`).select(`
    id, stevneid, fase, runde_nummer, runde_navn, bane_nummer,
    er_bekreftet, er_walkover, er_tre_spelarar,
    stevne:stevneid(navn),
    spelarar:kamp_spelar(
      id, kasterid, posisjon, score_poeng, kamp_poeng, antall_ringer,
      kaster:kasterid(id, fornavn, etternavn)
    )
  `),y.from(`kamp`).select(`
  id, stevneid, runde_nummer, bane_nummer, er_bekreftet, er_walkover, fase,
  spelarar:kamp_spelar(
    id, kasterid, score_poeng, kamp_poeng, antall_ringer, posisjon,
    kaster:kasterid(id, fornavn, etternavn, klubb:klubbid(kortnavn, navn)),
    omgangar:kamp_omgang(score, antall_ringer)
  )
`);async function Rr(e){let{data:t,error:n}=await y.from(`kamp`).select(`
      id, stevneid, runde_nummer, bane_nummer, er_bekreftet, er_walkover, fase,
      spelarar:kamp_spelar(
        id, kasterid, score_poeng, kamp_poeng, antall_ringer, posisjon,
        kaster:kasterid(id, fornavn, etternavn, klubb:klubbid(kortnavn, navn)),
        omgangar:kamp_omgang(score, antall_ringer)
      )
    `).eq(`stevneid`,e).eq(`fase`,`innledende`).order(`runde_nummer`).order(`bane_nummer`);return n&&b(`hentInnledendeKamper`,n),{data:t??[],error:n}}async function zr(e){if(!e.length)return!1;let{data:t,error:n}=await y.from(`kamp_omgang`).select(`id`).in(`kamp_spelar_id`,e).limit(1);return n&&b(`harKampOmgangar`,n),(t?.length??0)>0}async function Br(e){if(!e.length)return{error:null};let{error:t}=await y.from(`kamp_omgang`).delete().in(`kamp_spelar_id`,e);return t&&b(`slettKampOmgangar`,t),{error:t}}async function Vr(e,t,n){let r=n===void 0?{score_poeng:t}:{score_poeng:t,kamp_poeng:n},{error:i}=await y.from(`kamp_spelar`).update(r).eq(`id`,e);return i&&b(`oppdaterKampSpelarScoreRask`,i),{error:i}}async function Hr(e){let{data:t,error:n}=await y.from(`kamp`).select(`
      id, stevneid, fase, runde_nummer, runde_navn, bane_nummer,
      er_bekreftet, er_walkover, er_tre_spelarar,
      stevne:stevneid(navn),
      spelarar:kamp_spelar(
        id, kasterid, posisjon, score_poeng, kamp_poeng, antall_ringer,
        kaster:kasterid(id, fornavn, etternavn)
      )
    `).eq(`id`,e).maybeSingle();return n&&b(`hentKamp`,n),{data:t,error:n}}async function Ur(e,t){if(!t.length)return new Map;let{data:n,error:r}=await y.from(`resultat`).select(`kasterid, hcp`).eq(`stevneid`,e).in(`kasterid`,t);return r&&b(`hentHcp`,r),new Map((n??[]).filter(e=>e.kasterid!=null).map(e=>[e.kasterid,e.hcp??0]))}async function Wr(e,t){let{data:n,error:r}=await y.from(`kamp`).select(`id`).eq(`stevneid`,e).eq(`bane_nummer`,t).eq(`er_bekreftet`,!1).eq(`er_walkover`,!1).order(`runde_nummer`).limit(1).maybeSingle();return r&&b(`hentNesteKampOrganisator`,r),{data:n,error:r}}async function Gr(e,t){let{data:n,error:r}=await y.from(`kamp_spelar`).select(`kampid`).eq(`kasterid`,t);if(r)return b(`hentNesteKampDeltakar:minekampar`,r),{data:null,error:r};let i=(n??[]).map(e=>e.kampid).filter(e=>e!=null);if(!i.length)return{data:null,error:null};let{data:a,error:o}=await y.from(`kamp`).select(`id`).in(`id`,i).eq(`stevneid`,e).eq(`er_bekreftet`,!1).eq(`er_walkover`,!1).order(`runde_nummer`).limit(1).maybeSingle();return o&&b(`hentNesteKampDeltakar`,o),{data:a,error:o}}async function Kr(e,t){let{data:n}=await y.from(`kamp_spelar`).select(`id`).eq(`kampid`,e).eq(`kasterid`,t).maybeSingle();return!!n}async function qr(e){let{kampId:t,p1:n,p2:r,hcp1:i,hcp2:a,erWalkover:o=!1}=e,s=0,c=0,l=0,u=0;if(o)s=21;else{let e=[n?.spelarId,r?.spelarId].filter(e=>e!=null),{data:t,error:o}=await y.from(`kamp_omgang`).select(`kamp_spelar_id, score, antall_ringer`).in(`kamp_spelar_id`,e);if(o)return b(`bekreftInnledendeKamp:omgangar`,o),{error:o};if(t?.length)for(let e of t)e.kamp_spelar_id===n?.spelarId?(s+=e.score??0,l+=e.antall_ringer??0):(c+=e.score??0,u+=e.antall_ringer??0);else{let{data:t}=await y.from(`kamp_spelar`).select(`id, score_poeng`).in(`id`,e),i=Object.fromEntries((t??[]).map(e=>[e.id,e.score_poeng??0]));s=n?i[n.spelarId]??n.scorePoeng:0,c=r?i[r.spelarId]??r.scorePoeng:0}s+=i,c+=a}let[d,f]=Pr(s,c),p=[];if(n&&p.push(y.from(`kamp_spelar`).update({score_poeng:s,kamp_poeng:d,antall_ringer:l}).eq(`id`,n.spelarId)),r&&p.push(y.from(`kamp_spelar`).update({score_poeng:c,kamp_poeng:f,antall_ringer:u}).eq(`id`,r.spelarId)),p.length){let e=(await Promise.all(p)).find(e=>e.error)?.error;if(e)return b(`bekreftInnledendeKamp:spelarar`,e),{error:e}}let{error:m}=await y.from(`kamp`).update({er_bekreftet:!0}).eq(`id`,t);return m&&b(`bekreftInnledendeKamp:kamp`,m),{error:m}}async function Jr(e){let{kampId:t,stevneId:n,rundeNavn:r,rundeNummer:i,p1:a,p2:o,orderedKasterids:s}=e,{error:c}=await y.from(`kamp`).update({er_bekreftet:!0}).eq(`id`,t);if(c)return b(`bekreftAvsluttendeKamp:kamp`,c),{error:c};let l=null;if(s?.length===3)l=s[2];else{let e=[a?.spelarId,o?.spelarId].filter(e=>e!=null),{data:t}=await y.from(`kamp_omgang`).select(`kamp_spelar_id, score`).in(`kamp_spelar_id`,e),n={};for(let e of t??[])e.kamp_spelar_id!=null&&(n[e.kamp_spelar_id]=(n[e.kamp_spelar_id]??0)+(e.score??0));l=(a?n[a.spelarId]??a.scorePoeng:0)>=(o?n[o.spelarId]??o.scorePoeng:0)?o?.kasterid??null:a?.kasterid??null}if(l==null)return{error:null};let u=r===`Finale`,d=r===`Bronsefinale`,f=u||d?{runde_eliminert:i,plassering:u?2:4}:{runde_eliminert:i},{error:p}=await y.from(`resultat`).update(f).eq(`stevneid`,n).eq(`kasterid`,l);if(p)return b(`bekreftAvsluttendeKamp:eliminert`,p),{error:p};if(u||d){let e=s?s[0]:l===o?.kasterid?a?.kasterid:o?.kasterid;if(e!=null){let{error:t}=await y.from(`resultat`).update({plassering:u?1:3}).eq(`stevneid`,n).eq(`kasterid`,e);if(t)return b(`bekreftAvsluttendeKamp:vinnar`,t),{error:t}}}return{error:null}}y.from(`kamp`).select(`
  id, fase, runde_nummer, bane_nummer, gruppe_navn, runde_navn,
  er_bekreftet, er_walkover, er_tre_spelarar,
  spelarar:kamp_spelar(
    id, kasterid, posisjon, score_poeng, kamp_poeng, antall_ringer,
    kaster:kasterid(fornavn, etternavn),
    omgangar:kamp_omgang(score, antall_ringer)
  )
`),y.from(`kamp_spelar`).select(`id, kasterid, score_poeng, antall_ringer, omgangar:kamp_omgang(score, antall_ringer)`);async function Yr(e){let{data:t,error:n}=await y.from(`kamp`).select(`
      id, fase, runde_nummer, bane_nummer, gruppe_navn, runde_navn,
      er_bekreftet, er_walkover, er_tre_spelarar,
      spelarar:kamp_spelar(
        id, kasterid, posisjon, score_poeng, kamp_poeng, antall_ringer,
        kaster:kasterid(fornavn, etternavn),
        omgangar:kamp_omgang(score, antall_ringer)
      )
    `).eq(`stevneid`,e).order(`runde_nummer`).order(`bane_nummer`);return n&&b(`hentAvsluttendeKamper`,n),{data:t??[],error:n}}async function Xr(e){let{data:t,error:n}=await y.from(`kamp_spelar`).select(`id, kasterid, score_poeng, antall_ringer, omgangar:kamp_omgang(score, antall_ringer)`).eq(`kampid`,e);return n&&b(`hentKampSpelarar`,n),{data:t??[],error:n}}async function Zr(e,t){let{data:n,error:r}=await y.from(`kamp`).select(`er_bekreftet`).eq(`stevneid`,e).eq(`gruppe_navn`,t).eq(`runde_navn`,`Semifinale`);return r&&b(`harAlleSemifinalarBekrefta`,r),!!(n?.length&&n.every(e=>e.er_bekreftet))}async function Qr(e){let{kampId:t,stevneId:n,rundeNummer:r,rundeNavn:i,allKasterids:a,eliminertId:o,vidareIds:s}=e,c=i===`Finale`||i===`Bronsefinale`,{error:l}=await y.from(`kamp`).update({er_bekreftet:!0}).eq(`id`,t);if(l)return b(`bekreftCupKamp:kamp`,l),{error:l};if(!o)return{error:null};if(c){let{error:e}=await y.from(`resultat`).update({runde_eliminert:null,plassering:null}).eq(`stevneid`,n).in(`kasterid`,a);if(e)return b(`bekreftCupKamp:reset`,e),{error:e}}else{let{error:e}=await y.from(`resultat`).update({runde_eliminert:null}).eq(`stevneid`,n).eq(`runde_eliminert`,r).in(`kasterid`,a);if(e)return b(`bekreftCupKamp:reset`,e),{error:e}}let u=c?{runde_eliminert:r,plassering:i===`Finale`?2:4}:{runde_eliminert:r},{error:d}=await y.from(`resultat`).update(u).eq(`stevneid`,n).eq(`kasterid`,o);if(d)return b(`bekreftCupKamp:eliminert`,d),{error:d};if(i===`Finale`&&s.length>0){let{error:e}=await y.from(`resultat`).update({plassering:1}).eq(`stevneid`,n).eq(`kasterid`,s[0]);if(e)return b(`bekreftCupKamp:vinnar`,e),{error:e}}if(i===`Bronsefinale`&&s.length>0){let{error:e}=await y.from(`resultat`).update({plassering:3,runde_eliminert:r}).eq(`stevneid`,n).eq(`kasterid`,s[0]);if(e)return b(`bekreftCupKamp:bronsefinale`,e),{error:e}}return{error:null}}async function $r(e){let{stevneId:t,rundeNummer:n,rundeNavn:r,allKasterids:i,nyVinnarId:a,nyTaparId:o}=e,s=r===`Finale`;if(s||r===`Bronsefinale`){let{error:e}=await y.from(`resultat`).update({runde_eliminert:null,plassering:null}).eq(`stevneid`,t).in(`kasterid`,i);if(e)return b(`oppdaterVinnarTapar:reset`,e),{error:e};if(o){let{error:e}=await y.from(`resultat`).update({runde_eliminert:n,plassering:s?2:4}).eq(`stevneid`,t).eq(`kasterid`,o);if(e)return b(`oppdaterVinnarTapar:tapar`,e),{error:e}}let r=s?{plassering:1}:{runde_eliminert:n,plassering:3};if(a){let{error:e}=await y.from(`resultat`).update(r).eq(`stevneid`,t).eq(`kasterid`,a);if(e)return b(`oppdaterVinnarTapar:vinnar`,e),{error:e}}}else{let{error:e}=await y.from(`resultat`).update({runde_eliminert:null}).eq(`stevneid`,t).eq(`runde_eliminert`,n).in(`kasterid`,i);if(e)return b(`oppdaterVinnarTapar:reset`,e),{error:e};if(o){let{error:e}=await y.from(`resultat`).update({runde_eliminert:n}).eq(`stevneid`,t).eq(`kasterid`,o);if(e)return b(`oppdaterVinnarTapar:tapar`,e),{error:e}}}return{error:null}}y.from(`kamp_omgang`).select(`id, kamp_spelar_id, omgang, score, antall_ringer`);async function ei(e){if(!e.length)return{data:[],error:null};let{data:t,error:n}=await y.from(`kamp_omgang`).select(`id, kamp_spelar_id, omgang, score, antall_ringer`).in(`kamp_spelar_id`,e).order(`omgang`);return n&&b(`hentKampOmgangar`,n),{data:t??[],error:n}}async function ti(e){if(!e.length)return{error:null};let{error:t}=await y.from(`kamp_omgang`).insert(e);return t&&b(`lagreKampOmgang`,t),{error:t}}async function ni(e){let{error:t}=await y.from(`kamp`).update({er_bekreftet:!1}).eq(`id`,e);return t&&b(`unbekreftKamp`,t),{error:t}}async function ri(e,t){if(!e.length)return{error:null};let{error:n}=await y.from(`kamp_omgang`).delete().in(`kamp_spelar_id`,e).gte(`omgang`,t);return n&&b(`slettKampOmgangarFra`,n),{error:n}}function ii(e,t,n){return y.channel(`neste-kamp-${t}`).on(`postgres_changes`,{event:`INSERT`,schema:`public`,table:`kamp`,filter:`stevneid=eq.${e}`},e=>{n(e.new)}).subscribe()}function ai(e,t,n){return y.channel(t).on(`postgres_changes`,{event:`*`,schema:`public`,table:`kamp_omgang`},n).on(`postgres_changes`,{event:`*`,schema:`public`,table:`kamp`},t=>{(t.new?.stevneid??t.old?.stevneid)===e&&n()}).subscribe()}function oi(e,t,n,r){return y.channel(`scoreboard-kamp-${e}`).on(`postgres_changes`,{event:`*`,schema:`public`,table:`kamp_omgang`},async e=>{let r=e.new,i=e.old,a=r.kamp_spelar_id??i.kamp_spelar_id;(!a||t.includes(a))&&await n()}).on(`postgres_changes`,{event:`UPDATE`,schema:`public`,table:`kamp`,filter:`id=eq.${e}`},async e=>{e.new?.er_bekreftet&&await r()}).subscribe()}function si(e){let t=document.createElement(`div`);return t.innerHTML=e,t}var ci={admin:`Administrator`,klubbadmin:`Klubbadministrator`,bruker:`Brukar`};function li(e){return`
    ${e===`avvist`?`<div class="alert alert-warning">Koblingforespørselen din vart avvist. Du kan sende ein ny.</div>`:``}
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">Koble til utøvarprofil</h5>
        <p class="card-text text-muted">Søk etter deg sjølv i registeret og send ein forespørsel. Etter godkjenning kan du melde deg på stevner.</p>
        <input type="search" id="kaster-sok" class="form-control mb-2" placeholder="Søk på navn…">
        <div id="kaster-treff" class="list-group mb-2"></div>
        <div id="kasting-feil" class="alert alert-danger d-none"></div>
      </div>
    </div>`}function ui(){return`<div class="alert alert-info mb-4">Koblingforespørselen din ventar på godkjenning frå ein administrator.</div>`}async function di(e){let{data:t,error:n}=await on(e);return n||!t?``:`
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">Kobla til utøvarprofil</h5>
        <p class="mb-1"><strong>${j(a(t))}</strong> · ${j(t.klubb?.navn??``)}</p>
        <a href="#/kastere/${s(t)}" class="btn btn-sm btn-outline-primary mt-1">Sjå profil</a>
      </div>
    </div>`}async function fi(e){let{data:t,error:n}=await wr(e);return n?`<p class="text-muted">Kunne ikkje laste påmeldingar.</p>`:t.length?`
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">Påmeldingar</h5>
        <table class="table table-sm">
          <thead><tr><th>Stevne</th><th>Dato</th><th></th></tr></thead>
          <tbody>${[...t].sort((e,t)=>(e.stevne?.dato??``).localeCompare(t.stevne?.dato??``)).map(e=>{let t=O(e.stevne?.dato);return`<tr>
      <td><a href="#/stevne/${e.stevne?.id??``}/pamelding">${j(e.stevne?.navn??``)}</a></td>
      <td>${j(t)}</td>
      <td><a href="#/stevne/${e.stevne?.id??``}/pamelding" class="btn btn-sm btn-outline-danger">Meld av</a></td>
    </tr>`}).join(``)}</tbody>
        </table>
      </div>
    </div>`:`<p class="empty-state">Ingen påmeldingar enno.</p>`}async function pi(e){let{data:t,error:n}=await Lr(e);if(n){let e=document.createElement(`p`);return e.className=`text-muted`,e.textContent=`Kunne ikkje laste kampar.`,e}let r=t.filter(e=>!e.kamp?.er_walkover),i=r.filter(e=>e.kamp?.stevne?.erfullfort===!1&&!e.kamp?.er_bekreftet).sort((e,t)=>(e.kamp?.runde_nummer??0)-(t.kamp?.runde_nummer??0)),a=r.filter(e=>e.kamp?.er_bekreftet).sort((e,t)=>(e.kamp?.runde_nummer??0)-(t.kamp?.runde_nummer??0)),o=(t,n)=>{let r=t.kamp,i=(r?.spelarar??[]).find(t=>t.kasterid!==e),a=i?.kaster?j(`${i.kaster.fornavn} ${i.kaster.etternavn}`):`–`;return`<tr>
      <td>R${r?.runde_nummer??``} / B${r?.bane_nummer??``}</td>
      <td>${a}</td>
      <td>${n}</td>
    </tr>`},s=(e,t)=>{if(!e.length)return null;let n=new Map;for(let t of e){let e=t.kamp?.stevneid??`ukjent`,r=t.kamp?.stevne?.navn??``;n.has(e)||n.set(e,{navn:r,kampar:[]}),n.get(e).kampar.push(t)}return[...n.values()].map(({navn:e,kampar:n})=>`
      <p class="fw-semibold mb-1 mt-2">${j(e)}</p>
      <table class="table table-sm mb-3"><thead><tr><th>Runde/Bane</th><th>Motstandar</th><th></th></tr></thead><tbody>
        ${n.map(e=>o(e,t(e))).join(``)}
      </tbody></table>`).join(``)},c=s(i,e=>`<a href="#/kamp/${e.kamp?.id??``}" class="btn btn-sm btn-primary">Scoreboard</a>`),l=s(a,e=>`<a href="#/kamp/${e.kamp?.id??``}" class="btn btn-sm btn-outline-secondary">Sjå kamp</a>`),u=document.createElement(`div`);u.className=`card mb-4`,u.id=`mine-kampar-seksjon`;let d=document.createElement(`div`);d.className=`card-body`;let f=document.createElement(`h5`);return f.className=`card-title`,f.textContent=`Mine kampar`,d.appendChild(f),d.appendChild(xr({tabs:[{id:`kommande`,label:`Kommande (${i.length})`,panel:si(c??`<p class="text-muted">Ingen kommande kampar.</p>`)},{id:`ferdige`,label:`Ferdige (${a.length})`,panel:si(l??`<p class="text-muted">Ingen ferdige kampar enno.</p>`)}]})),u.appendChild(d),u}function mi(e,t){let n=null,r=null,i=e.querySelector(`#kaster-sok`),o=e.querySelector(`#kaster-treff`),s=e.querySelector(`#kasting-feil`);i.addEventListener(`input`,()=>{n!==null&&clearTimeout(n);let e=i.value.trim().toLowerCase();if(e.length<2){o.innerHTML=``;return}n=setTimeout(async()=>{if(!r){let{data:e}=await tn();r=e}let t=r.filter(t=>t.fornavn.toLowerCase().includes(e)||t.etternavn.toLowerCase().includes(e)).slice(0,8);if(!t.length){let e=L(`Ingen treff.`);e.classList.add(`small`),o.replaceChildren(e);return}o.innerHTML=t.map(e=>`<button class="list-group-item list-group-item-action" data-id="${e.id}">
          ${j(a(e))} <span class="text-muted small">· ${j(e.klubb?.navn??``)}</span>
        </button>`).join(``)},300)}),o.addEventListener(`click`,async e=>{let n=e.target.closest(`[data-id]`);if(!n)return;s.classList.add(`d-none`);let{error:r}=await He(t,Number(n.dataset.id));if(r){s.textContent=`Kunne ikkje sende forespørsel.`,s.classList.remove(`d-none`);return}location.reload()})}async function hi(e){e.replaceChildren(A(`Laster min side…`));try{let t=await M();if(!t){location.hash=`#/logginn`;return}let{profil:n,user:r}=t,i=n?.kobling_status??`ingen`,a=n?ci[n.rolle]:`Ukjent`,o=`
      <div class="minside-container">
        <h2 class="mb-1">Min side</h2>
        <p class="text-muted mb-4">${j(r.email??``)} · <span class="badge bg-secondary">${j(a)}</span></p>`;if(i===`ingen`||i===`avvist`)o+=li(i);else if(i===`venter`)o+=ui();else if(i===`godkjent`&&n?.kasterid){let t=n.kasterid,[i,a,s]=await Promise.all([di(t),fi(r.id),pi(t)]);o+=i+a,o+=`</div>`,e.innerHTML=o,e.querySelector(`.minside-container`).appendChild(s);return}o+=`</div>`,e.innerHTML=o,(i===`ingen`||i===`avvist`)&&mi(e,r.id)}catch(t){b(`minside.render`,t),e.replaceChildren(k(`Kunne ikkje laste min side.`))}}function q(e){return e&&typeof e==`object`&&`message`in e?String(e.message):`Ukjend feil`}function J(e,t){return`<div class="mb-3"><label class="form-label fw-semibold">${j(e)}</label>${t}</div>`}function gi(e,t){let n=e.querySelector(`.admin-feil`);n||(n=document.createElement(`div`),n.className=`alert alert-danger admin-feil mt-3 d-none`,e.querySelector(`form`)?.append(n)),n.textContent=t,n.classList.remove(`d-none`),n.scrollIntoView({behavior:`smooth`,block:`nearest`})}function _i(e,t){let n=e.querySelector(`.admin-suksess`);n||(n=document.createElement(`div`),n.className=`alert alert-success admin-suksess mt-3 d-none`,e.querySelector(`form`)?.append(n)),n.textContent=t,n.classList.remove(`d-none`);let r=n;setTimeout(()=>{r.classList.add(`d-none`)},4e3)}var vi=[`kobling`,`brukarar`,`klubbadmin`],yi={kobling:`Koblingforespørslar`,brukarar:`Brukarar`,klubbadmin:`Klubbadmin-tilgang`};async function bi(e){e.innerHTML=`
    <div class="container py-4 admin-skjema-xl">
      <h2 class="mb-3">Administrasjon</h2>
      <ul class="nav nav-tabs mb-4" id="admin-faner">
        ${vi.map((e,t)=>`<li class="nav-item">
          <button class="nav-link${t===0?` active`:``}" data-fane="${e}">${yi[e]}</button>
        </li>`).join(``)}
      </ul>
      <div id="admin-innhald"></div>
    </div>`;let t=e.querySelector(`#admin-innhald`);async function n(n){e.querySelectorAll(`[data-fane]`).forEach(e=>{e.classList.toggle(`active`,e.dataset.fane===n)}),A(`Laster...`),n===`kobling`&&await xi(t),n===`brukarar`&&await Si(t),n===`klubbadmin`&&await Ci(t)}e.querySelector(`#admin-faner`).addEventListener(`click`,e=>{let t=e.target.closest(`[data-fane]`);t?.dataset.fane&&n(t.dataset.fane)}),n(`kobling`)}async function xi(e){let{data:t,error:n}=await Ue();if(n){e.innerHTML=`<div class="alert alert-danger">${j(q(n))}</div>`;return}if(!t.length){e.replaceChildren(L(`Ingen ventande forespørslar.`));return}let r=t.map(e=>e.id),i=t.map(e=>e.kobling_kasterid).filter(e=>e!==null),[{data:a},{data:o}]=await Promise.all([We(r),ln(i)]),s=Object.fromEntries((a??[]).map(e=>[e.id,e.epost])),c=new Map((o??[]).map(e=>[e.id,e]));e.innerHTML=`<table class="table table-hover">
    <thead><tr><th>E-post</th><th>Vil koblast til</th><th>Handling</th></tr></thead>
    <tbody>
      ${t.map(e=>{let t=e.kobling_kasterid?c.get(e.kobling_kasterid):null,n=t?.klubb,r=t?`${j(t.fornavn)} ${j(t.etternavn)} (${j(n?.navn??``)})`:`—`;return`<tr data-id="${e.id}" data-kasterid="${e.kobling_kasterid??``}">
          <td>${j(s[e.id]??e.id)}</td>
          <td>${r}</td>
          <td>
            <button class="btn btn-sm btn-success me-1 godkjenn-knapp">Godkjenn</button>
            <button class="btn btn-sm btn-outline-danger avvis-knapp">Avvis</button>
          </td>
        </tr>`}).join(``)}
    </tbody>
  </table>`,e.querySelectorAll(`.godkjenn-knapp`).forEach(t=>{t.addEventListener(`click`,async()=>{let n=t.closest(`tr`),r=n.dataset.kasterid?Number(n.dataset.kasterid):null,{error:i}=await Ge(n.dataset.id,r,`godkjent`);if(i){e.innerHTML=`<div class="alert alert-danger">${j(q(i))}</div>`;return}xi(e)})}),e.querySelectorAll(`.avvis-knapp`).forEach(t=>{t.addEventListener(`click`,async()=>{let{error:n}=await Ge(t.closest(`tr`).dataset.id,null,`avvist`);if(n){e.innerHTML=`<div class="alert alert-danger">${j(q(n))}</div>`;return}xi(e)})})}async function Si(e){let{data:t,error:n}=await Ke();if(n){e.innerHTML=`<div class="alert alert-danger">${j(q(n))}</div>`;return}if(!t.length){e.replaceChildren(L(`Ingen brukarar.`));return}let{data:r}=await We(t.map(e=>e.id)),i=Object.fromEntries((r??[]).map(e=>[e.id,e.epost])),a=[`bruker`,`klubbadmin`,`admin`].map(e=>`<option value="${e}">${e}</option>`).join(``);e.innerHTML=`
    <div id="brukar-feil" class="alert alert-danger d-none"></div>
    <table class="table table-hover">
      <thead><tr><th>E-post</th><th>Rolle</th><th>Kobling</th><th></th></tr></thead>
      <tbody>
        ${t.map(e=>`<tr data-id="${e.id}">
          <td>${j(i[e.id]??e.id)}</td>
          <td>
            <select class="form-select form-select-sm rolle-vel sel-auto">
              ${a}
            </select>
          </td>
          <td><span class="badge bg-secondary">${j(e.kobling_status)}</span></td>
          <td><button class="btn btn-sm btn-primary lagre-rolle">Lagre</button></td>
        </tr>`).join(``)}
      </tbody>
    </table>`,t.forEach(t=>{let n=e.querySelector(`tr[data-id="${t.id}"]`);n&&(n.querySelector(`.rolle-vel`).value=t.rolle)}),e.querySelectorAll(`.lagre-rolle`).forEach(t=>{t.addEventListener(`click`,async()=>{let n=t.closest(`tr`),r=n.querySelector(`.rolle-vel`).value,i=e.querySelector(`#brukar-feil`);i.classList.add(`d-none`);let{error:a}=await qe(n.dataset.id,r);a?(i.textContent=q(a),i.classList.remove(`d-none`)):(t.textContent=`✓`,setTimeout(()=>{t.textContent=`Lagre`},2e3))})})}async function Ci(e){let t,n,r;try{let e=await Promise.all([Je(),Rn(),Ye()]);t=e[0].data,n=e[1].data,r=e[2].data}catch(t){b(`admin._visKlubbadmin`,t),e.innerHTML=`<div class="alert alert-danger">Kunne ikkje laste data.</div>`;return}if(!t.length){e.replaceChildren(L(`Ingen brukarar med rolle "klubbadmin".`));return}let{data:i}=await We(t.map(e=>e.id)),a=Object.fromEntries((i??[]).map(e=>[e.id,e.epost])),o={};r.forEach(e=>{o[e.bruker_id]||(o[e.bruker_id]=new Set),o[e.bruker_id].add(e.klubbid)});let s=n.map(e=>`<option value="${e.id}">${j(e.navn)}</option>`).join(``);e.innerHTML=`
    <div id="ka-feil" class="alert alert-danger d-none"></div>
    ${t.map(e=>{let t=[...o[e.id]??[]].map(e=>{let t=n.find(t=>t.id===e);return t?`<span class="badge bg-primary me-1" data-kid="${e}">${j(t.navn)} <button class="btn-close btn-close-white btn-close-xs fjern-klubb"></button></span>`:``}).join(``);return`<div class="card mb-3" data-bruker="${e.id}">
        <div class="card-body">
          <h6 class="card-title mb-2">${j(a[e.id]??e.id)}</h6>
          <div class="ka-klubbar mb-2">${t||`<span class="text-muted small">Ingen klubbar tildelt</span>`}</div>
          <div class="d-flex gap-2">
            <select class="form-select form-select-sm legg-til-vel sel-auto">
              <option value="">Legg til klubb…</option>
              ${s}
            </select>
            <button class="btn btn-sm btn-success legg-til-knapp">Legg til</button>
          </div>
        </div>
      </div>`}).join(``)}`,e.querySelectorAll(`.legg-til-knapp`).forEach(t=>{t.addEventListener(`click`,async()=>{let n=t.closest(`[data-bruker]`),r=n.querySelector(`.legg-til-vel`),i=Number(r.value);if(!i)return;let a=e.querySelector(`#ka-feil`);a.classList.add(`d-none`);let{error:o}=await Xe(n.dataset.bruker,i);if(o){a.textContent=q(o),a.classList.remove(`d-none`);return}Ci(e)})}),e.querySelectorAll(`.fjern-klubb`).forEach(t=>{t.addEventListener(`click`,async n=>{n.stopPropagation();let r=t.closest(`[data-kid]`),i=t.closest(`[data-bruker]`),a=e.querySelector(`#ka-feil`);a.classList.add(`d-none`);let{error:o}=await Qe(i.dataset.bruker,Number(r.dataset.kid));if(o){a.textContent=q(o),a.classList.remove(`d-none`);return}Ci(e)})})}var Y=null,wi=null,Ti=null,Ei=null;function Di(){return Y||(Y=document.createElement(`div`),Y.className=`modal`,Y.style.display=`none`,Y.setAttribute(`role`,`alertdialog`),Y.setAttribute(`aria-modal`,`true`),Y.setAttribute(`aria-labelledby`,`cd-title`),Y.setAttribute(`aria-describedby`,`cd-message`),Y.innerHTML=`
    <div class="modal-dialog modal-dialog-centered modal-sm">
      <div class="modal-content">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title" id="cd-title"></h5>
        </div>
        <div class="modal-body pt-2">
          <p class="mb-0" id="cd-message"></p>
        </div>
        <div class="modal-footer border-0 pt-0">
          <button type="button" class="btn btn-secondary" id="cd-cancel"></button>
          <button type="button" class="btn btn-primary" id="cd-confirm"></button>
        </div>
      </div>
    </div>
  `,document.body.appendChild(Y),Y.querySelector(`#cd-cancel`).addEventListener(`click`,()=>{Ai(!1)}),Y.querySelector(`#cd-confirm`).addEventListener(`click`,()=>{Ai(!0)}),Y)}function Oi(e){wi=document.createElement(`div`),wi.className=`modal-backdrop show`,document.body.appendChild(wi),document.body.classList.add(`modal-open`),e.style.display=`block`,e.classList.add(`show`),e.querySelector(`#cd-confirm`)?.focus(),Ei=e=>{e.key===`Escape`&&(e.preventDefault(),Ai(!1))},document.addEventListener(`keydown`,Ei)}function ki(e){e.classList.remove(`show`),e.style.display=`none`,wi?.remove(),wi=null,document.body.classList.remove(`modal-open`),Ei&&=(document.removeEventListener(`keydown`,Ei),null)}function Ai(e){if(!Y||!Ti)return;let t=Ti;Ti=null,ki(Y),t(e)}function X(e){let{title:t,message:n,confirmText:r=`OK`,cancelText:i=`Avbryt`,danger:a=!1}=e,o=Di();o.querySelector(`#cd-title`).textContent=t,o.querySelector(`#cd-message`).textContent=n,o.querySelector(`#cd-cancel`).textContent=i;let s=o.querySelector(`#cd-confirm`);return s.textContent=r,s.className=`btn ${a?`btn-danger`:`btn-primary`}`,new Promise(e=>{Ti=e,Oi(o)})}function Z(e){if(!e||typeof e!=`string`)return null;let t=Number(e);return Number.isFinite(t)?t:null}async function ji(e,{id:t}={}){e.replaceChildren(A());let n=[],r=[],i=[],a=[];try{let e=await Promise.all([Rn(),me(),he(),ge()]);n=e[0].data,r=e[1].data,i=e[2].data,a=e[3].data}catch(t){b(`stevneadmin.render`,t),e.replaceChildren(k(`Kunne ikkje laste skjema.`));return}let o=null;if(t){let{data:n,error:r}=await _e(t);if(r||!n){e.replaceChildren(k(`Stevne ikkje funne.`));return}if(o=n,!await N()&&!await at(o.klubbid??void 0)){e.replaceChildren(k(`Ingen tilgang til dette stevnet.`));return}}let s=t?`Rediger stevne: ${j(o?.navn??``)}`:`Nytt stevne`,c=o??{},l=c.dato??``,u=c.tid?c.tid.slice(0,5):``,d=P(n,c.klubbid),f=P(r,c.stevnetypeid),p=P(i,c.innledendekastemetodeid),m=P(i,c.avsluttendekastemetodeid),h=P(a,c.kategoriid);e.innerHTML=`
    <div class="container py-4 admin-skjema-lg">
      <h2 class="mb-4">${s}</h2>
      <form id="stevne-skjema">
        ${J(`Namn*`,`<input type="text" class="form-control" name="navn" value="${j(c.navn)}" required>`)}
        ${J(`Stad`,`<input type="text" class="form-control" name="sted" value="${j(c.sted)}">`)}
        ${J(`Dato`,`<input type="date" class="form-control" name="dato" value="${l}">`)}
        ${J(`Tid`,`<input type="time" class="form-control" name="tid" value="${u}">`)}
        ${J(`Arrangørklubb`,`<select class="form-select" name="klubbid">${d}</select>`)}
        ${J(`Stevnetype`,`<select class="form-select" name="stevnetypeid">${f}</select>`)}
        ${J(`Innleiande kastemetode`,`<select class="form-select" name="innledendekastemetodeid">${p}</select>`)}
        ${J(`Avsluttande kastemetode`,`<select class="form-select" name="avsluttendekastemetodeid">${m}</select>`)}
        ${J(`Kategori`,`<select class="form-select" name="kategoriid">${h}</select>`)}
        <div class="mb-3 d-flex gap-4 flex-wrap">
          <div class="form-check"><input class="form-check-input" type="checkbox" name="ernm" id="ernm"${c.ernm?` checked`:``}><label class="form-check-label" for="ernm">Er NM</label></div>
          <div class="form-check"><input class="form-check-input" type="checkbox" name="ernorgesranking" id="ernr"${c.ernorgesranking?` checked`:``}><label class="form-check-label" for="ernr">Er Norgesranking</label></div>
          <div class="form-check"><input class="form-check-input" type="checkbox" name="erfullfort" id="erfullfort"${c.erfullfort?` checked`:``}><label class="form-check-label" for="erfullfort">Er fullført</label></div>
          <div class="form-check"><input class="form-check-input" type="checkbox" name="erekskludertfrarekorder" id="ekskl"${c.erekskludertfrarekorder?` checked`:``}><label class="form-check-label" for="ekskl">Ekskl. frå rekorder</label></div>
        </div>
        ${J(`Innbydelses-URL`,`<input type="url" class="form-control" name="innbydelseurl" value="${j(c.innbydelseurl)}">`)}
        ${J(`Resultat-URL`,`<input type="url" class="form-control" name="resultaturl" value="${j(c.resultaturl)}">`)}
        <div class="d-flex gap-2 mt-4">
          <button type="submit" class="btn btn-primary">Lagre</button>
          ${t?`<button type="button" id="slett-knapp" class="btn btn-outline-danger ms-auto">Slett stevne</button>`:``}
        </div>
      </form>
    </div>`,e.querySelector(`#stevne-skjema`).addEventListener(`submit`,async n=>{n.preventDefault();let r=new FormData(n.target),i={navn:r.get(`navn`).trim(),sted:r.get(`sted`).trim()||null,dato:r.get(`dato`)||null,tid:r.get(`tid`)||null,klubbid:Z(r.get(`klubbid`)),stevnetypeid:Z(r.get(`stevnetypeid`)),innledendekastemetodeid:Z(r.get(`innledendekastemetodeid`)),avsluttendekastemetodeid:Z(r.get(`avsluttendekastemetodeid`)),kategoriid:Z(r.get(`kategoriid`)),ernm:r.get(`ernm`)===`on`,ernorgesranking:r.get(`ernorgesranking`)===`on`,erfullfort:r.get(`erfullfort`)===`on`,erekskludertfrarekorder:r.get(`erekskludertfrarekorder`)===`on`,innbydelseurl:r.get(`innbydelseurl`).trim()||null,resultaturl:r.get(`resultaturl`).trim()||null},{data:a,error:o}=t?await ye(t,i):await ve(i);if(o){gi(e,q(o));return}_i(e,`Stevnet er lagra.`),t||setTimeout(()=>{location.hash=`#/stevne/${a.id}/admin`},1500)}),e.querySelector(`#slett-knapp`)?.addEventListener(`click`,async()=>{if(!await X({title:`Slett stevne`,message:`Slett «${o?.navn}»? Dette kan ikkje angrast.`,danger:!0}))return;let{error:n}=await be(t);if(n){gi(e,q(n));return}location.hash=`#/terminliste`})}async function Mi(e,{id:t}={}){e.replaceChildren(A());let n=[],r=[],i=[];try{let e=await Promise.all([Rn(),sn(),cn()]);n=e[0].data,r=e[1].data,i=e[2].data}catch(t){b(`kasteradmin.render`,t),e.replaceChildren(k(`Kunne ikkje laste skjema.`));return}let a=null;if(t){let{data:n,error:r}=await un(t);if(r||!n){e.replaceChildren(k(`Utøvar ikkje funne.`));return}if(a=n,!await N()&&!await at(a.klubbid??void 0)){e.replaceChildren(k(`Ingen tilgang til denne utøvaren.`));return}}let o=t?`Rediger utøvar: ${a?`${j(a.fornavn)} ${j(a.etternavn)}`:``}`:`Ny utøvar`,s=a??{};e.innerHTML=`
    <div class="container py-4 admin-skjema-md">
      <h2 class="mb-4">${o}</h2>
      <form id="kaster-skjema">
        ${J(`Fornavn*`,`<input type="text" class="form-control" name="fornavn" value="${j(s.fornavn)}" required>`)}
        ${J(`Etternavn*`,`<input type="text" class="form-control" name="etternavn" value="${j(s.etternavn)}" required>`)}
        ${J(`Kjønn*`,`<select class="form-select" name="kjonnid">${P(i,s.kjonnid)}</select>`)}
        ${J(`Klubb`,`<select class="form-select" name="klubbid"><option value="">— vel —</option>${n.map(e=>`<option value="${e.id}"${e.id===s.klubbid?` selected`:``}>${j(e.navn)}</option>`).join(``)}</select>`)}
        ${J(`Klasse`,`<select class="form-select" name="klasseid">${P(r,s.klasseid)}</select>`)}
        ${J(`E-post`,`<input type="email" class="form-control" name="epost" value="${j(s.epost)}">`)}
        ${J(`Telefon`,`<input type="tel" class="form-control" name="telefon" value="${j(s.telefon)}">`)}
        ${J(`Medlemsnummer`,`<input type="number" class="form-control" name="medlemsnummer" value="${s.medlemsnummer??``}">`)}
        <div class="mb-3 form-check">
          <input class="form-check-input" type="checkbox" name="eraktiv" id="eraktiv"${s.eraktiv===!1?``:` checked`}>
          <label class="form-check-label" for="eraktiv">Er aktiv</label>
        </div>
        <div class="d-flex gap-2 mt-4">
          <button type="submit" class="btn btn-primary">Lagre</button>
          ${t?`<button type="button" id="slett-knapp" class="btn btn-outline-danger ms-auto">Slett utøvar</button>`:``}
        </div>
      </form>
    </div>`,e.querySelector(`#kaster-skjema`).addEventListener(`submit`,async n=>{n.preventDefault();let r=new FormData(n.target),i={fornavn:r.get(`fornavn`).trim(),etternavn:r.get(`etternavn`).trim(),kjonnid:Z(r.get(`kjonnid`)),klubbid:Z(r.get(`klubbid`)),klasseid:Z(r.get(`klasseid`)),epost:r.get(`epost`).trim()||null,telefon:r.get(`telefon`).trim()||null,medlemsnummer:r.get(`medlemsnummer`)?Number(r.get(`medlemsnummer`)):null,eraktiv:r.get(`eraktiv`)===`on`},{data:a,error:o}=t?await fn(t,i):await dn(i);if(o){gi(e,q(o));return}_i(e,`Utøvaren er lagra.`),t||setTimeout(()=>{location.hash=`#/kaster/${a.id}/admin`},1500)}),e.querySelector(`#slett-knapp`)?.addEventListener(`click`,async()=>{if(!await X({title:`Slett utøvar`,message:`Slett «${a?.fornavn} ${a?.etternavn}»? Dette kan ikkje angrast.`,danger:!0}))return;let{error:n}=await pn(t);if(n){gi(e,q(n));return}location.hash=`#/kastere`})}async function Ni(e,{id:t}={}){if(!t){e.replaceChildren(k(`Manglande ID.`));return}e.replaceChildren(A());let{data:n,error:r}=await Bn(t);if(r||!n){e.replaceChildren(k(`Klubb ikkje funne.`));return}if(!await N()&&!await at(t)){e.replaceChildren(k(`Ingen tilgang til denne klubben.`));return}e.innerHTML=`
    <div class="container py-4 admin-skjema-sm">
      <h2 class="mb-4">Rediger klubb: ${j(n.navn)}</h2>
      <form id="klubb-skjema">
        ${J(`Namn*`,`<input type="text" class="form-control" name="navn" value="${j(n.navn)}" required>`)}
        ${J(`Kortnavn`,`<input type="text" class="form-control" name="kortnavn" value="${j(n.kortnavn)}">`)}
        ${J(`Logo-URL`,`<input type="url" class="form-control" name="logourl" value="${j(n.logourl)}">`)}
        <div class="mb-3 form-check">
          <input class="form-check-input" type="checkbox" name="eraktiv" id="eraktiv"${n.eraktiv?` checked`:``}>
          <label class="form-check-label" for="eraktiv">Er aktiv</label>
        </div>
        <button type="submit" class="btn btn-primary mt-2">Lagre</button>
      </form>
    </div>`,e.querySelector(`#klubb-skjema`).addEventListener(`submit`,async n=>{n.preventDefault();let r=new FormData(n.target),{error:i}=await Vn(t,{navn:r.get(`navn`).trim(),kortnavn:r.get(`kortnavn`).trim(),logourl:r.get(`logourl`).trim()||null,eraktiv:r.get(`eraktiv`)===`on`});if(i){gi(e,q(i));return}_i(e,`Klubben er lagra.`)})}function Pi(e,t,n,r,i,a){return e?!n&&!t?`<div class="alert alert-warning">
      Du må <a href="#/minside">koble kontoen din til ein utøvarprofil</a> for å melde deg på.
    </div>`:i?`<div class="alert alert-secondary">Dette stevnet er fullført. Påmelding er stengt.</div>`:n&&r?`
      <div class="alert alert-success d-flex justify-content-between align-items-center">
        <span>Du er påmeldt</span>
        <button id="avmeld-knapp" class="btn btn-sm btn-outline-danger">Meld av</button>
      </div>`:n?`
      <form id="pamelding-skjema" class="card p-3 mb-3">
        <h5 class="mb-3">Meld deg på</h5>
        <div id="pm-feil" class="alert alert-danger d-none"></div>
        <button type="submit" class="btn btn-primary">Meld på</button>
      </form>`:``:`<div class="alert alert-info">
      <a href="#/logginn?redirect=/stevne/${a}/pamelding">Logg inn</a> for å melde deg på.
    </div>`}function Fi(e,t,n,r){if(!e||t)return``;let i=new Set(n.map(e=>e.kasterid));return`
    <form id="admin-pamelding-skjema" class="card p-3 mb-3 border-warning">
      <h5 class="mb-3">Meld på klubbmedlem</h5>
      <div class="mb-3">
        <label class="form-label">Utøvar</label>
        <select class="form-select" name="admin_kasterid" required>
          <option value="">— vel utøvar —</option>${r.filter(e=>!i.has(e.id)).map(e=>`<option value="${e.id}">${j(e.etternavn)}, ${j(e.fornavn)} — ${j(e.klubb?.navn??``)}</option>`).join(``)}
        </select>
      </div>
      <div id="admin-pm-feil" class="alert alert-danger d-none"></div>
      <button type="submit" class="btn btn-warning">Meld på</button>
    </form>`}function Ii(e){return e.length?`
    <div class="mt-4 mb-3">
      <h5>Andre stevner same helg (same arrangør)</h5>
      <ul class="list-unstyled">${e.map(e=>{let t=e.dato?O(e.dato):``;return`<li><a href="#/stevne/${e.id}/pamelding">${j(e.navn??``)} — ${t}</a></li>`}).join(``)}</ul>
    </div>`:``}function Li(e,t){if(!e.length)return`<p class="empty-state">Ingen påmeldingar enno.</p>`;let n=e.map(e=>`<tr>
    <td>${e.kaster?`<a href="#/kastere/${e.kaster.id}">${j(e.kaster.fornavn)} ${j(e.kaster.etternavn)}</a>`:`—`}</td>
    <td>${j(e.kaster?.klubb?.navn??``)}</td>
    ${t?`<td><button class="btn btn-sm btn-outline-danger fjern-pm" data-id="${e.id}">Fjern</button></td>`:``}
  </tr>`).join(``);return`<table class="table table-sm">
    <thead><tr><th>Namn</th><th>Klubb</th>${t?`<th></th>`:``}</tr></thead>
    <tbody>${n}</tbody>
  </table>`}function Ri(e,t,n,r,i,a){e.querySelector(`#pamelding-skjema`)?.addEventListener(`submit`,async n=>{n.preventDefault();let o=e.querySelector(`#pm-feil`);if(o.classList.add(`d-none`),r==null)return;let{error:s}=await Er(a,r,i);if(s){o.textContent=`Feil ved påmelding.`,o.classList.remove(`d-none`);return}zi(e,t)});let o=e.querySelector(`#admin-pamelding-skjema`);o?.addEventListener(`submit`,async n=>{n.preventDefault();let r=e.querySelector(`#admin-pm-feil`);r.classList.add(`d-none`);let s=new FormData(o),c=Number(s.get(`admin_kasterid`));if(!c){r.textContent=`Vel ein utøvar.`,r.classList.remove(`d-none`);return}let{error:l}=await Er(a,c,i);if(l){r.textContent=`Feil ved påmelding.`,r.classList.remove(`d-none`);return}zi(e,t)}),e.querySelector(`#avmeld-knapp`)?.addEventListener(`click`,async()=>{if(r==null)return;let i=n.find(e=>e.kasterid===r);if(!i||!await X({title:`Avmeld`,message:`Vil du melde deg av?`}))return;let{error:a}=await Dr(i.id);a||zi(e,t)}),e.querySelectorAll(`.fjern-pm`).forEach(n=>{n.addEventListener(`click`,async()=>{if(!await X({title:`Fjern påmelding`,message:`Fjern påmelding?`}))return;let r=Number(n.dataset.id);if(!r)return;let{error:i}=await Dr(r);i||zi(e,t)})})}async function zi(e,t={}){let n=t.id;if(!n){e.replaceChildren(k(`Manglande stevne-ID.`));return}let r=Number(n);e.replaceChildren(A(`Laster påmelding…`));try{let[n,i]=await Promise.all([M(),ue(r)]);if(i.error||!i.data){e.replaceChildren(k(`Stevnet finst ikkje.`));return}let a=i.data,o=n?.profil?.rolle===`admin`,s=n?.profil?.rolle===`klubbadmin`,c=o||s,l=a.dato?{fraDato:new Date(new Date(a.dato+`T12:00:00`).getTime()-2*864e5).toISOString().slice(0,10),tilDato:new Date(new Date(a.dato+`T12:00:00`).getTime()+2*864e5).toISOString().slice(0,10)}:null,u=c?o?tn():n&&n.klubber.length?an(n.klubber):Promise.resolve({data:[],error:null}):Promise.resolve({data:[],error:null}),[d,f,p]=await Promise.all([Tr(r),a.klubbid!=null&&l?de(a.klubbid,l.fraDato,l.tilDato,r):Promise.resolve({data:[],error:null}),u]),m=d.data,h=f.data,g=p.data,_=n?.profil?.kasterid??null,v=n?.profil?.kobling_status===`godkjent`,y=_!=null&&m.some(e=>e.kasterid===_),b=a.dato?O(a.dato):``;e.innerHTML=`
      <div class="container py-4 pm-side">
        <h2 class="mb-1">${j(a.navn??``)}</h2>
        <p class="text-muted mb-4">${b}${a.sted?` · `+j(a.sted):``}</p>
        ${Pi(n,c,v,y,a.erfullfort??!1,r)}
        ${Fi(c,a.erfullfort??!1,m,g)}
        ${Ii(h)}
        <h5 class="mt-4 mb-2">Påmeldingar (${m.length})</h5>
        ${Li(m,c)}
      </div>`,n&&Ri(e,t,m,_,n.user.id,r)}catch(t){b(`pamelding.render`,t),e.replaceChildren(k(`Kunne ikkje laste påmelding.`))}}async function Bi(e){await y.removeChannel(e)}var Vi=null;function Hi(){return Vi||(Vi=document.createElement(`div`),Vi.id=`toast-container`,document.body.appendChild(Vi)),Vi}function Q(e,t=`info`){let n=document.createElement(`div`);n.className=`toast-item toast-${t}`,n.textContent=e,n.addEventListener(`click`,()=>n.remove()),Hi().appendChild(n),setTimeout(()=>{n.remove()},4e3)}async function Ui(e,t,n,r,i){let{pointValues:a,erArrangor:o=!1,erDeltakar:s=!1,onBekreft:c=null,onKampBekreft:l,omgangEl:u=null,p3ks:d=null,hcp1:f=0,hcp2:p=0}=i;if(d&&t.er_tre_spelarar)return qi(e,t,n,r,d,{pointValues:a,erArrangor:o,erDeltakar:s,onBekreft:c,onKampBekreft:l,omgangEl:u});let m=[],h=null,g=null,_=t.er_bekreftet||t.er_walkover,v=o||s&&!t.er_bekreftet;await x(),O();let y=[n?.id,r?.id].filter(e=>e!=null),b=oi(t.id,y,async()=>{await x(),O()},async()=>{t.er_bekreftet=!0,await x(),O(),await l?.()});window.addEventListener(`hashchange`,()=>void Bi(b),{once:!0});async function x(){let e=[n?.id,r?.id].filter(e=>e!=null);if(!e.length)return;let{data:i}=await ei(e),a={};for(let e of i)a[e.omgang]||(a[e.omgang]={omgang:e.omgang,s1:0,s2:0,r1:0,r2:0}),e.kamp_spelar_id===n?.id?(a[e.omgang].s1=e.score??0,a[e.omgang].r1=e.antall_ringer??0):(a[e.omgang].s2=e.score??0,a[e.omgang].r2=e.antall_ringer??0);m=Object.values(a).sort((e,t)=>e.omgang-t.omgang);let[o,s]=C();_=T(o,s)||t.er_bekreftet||t.er_walkover}function S(){return[m.reduce((e,t)=>e+t.s1,0),m.reduce((e,t)=>e+t.s2,0)]}function C(){let[e,t]=S();return[e+f,t+p]}function w(){return[m.reduce((e,t)=>e+t.r1,0),m.reduce((e,t)=>e+t.r2,0)]}function T(e,n){return t.fase===`innledende`?e>=21||n>=21:e>=21&&e-n>=2||n>=21&&n-e>=2}function E(){return m.length>0?m[m.length-1].omgang+1:1}function D(e,t){let n=new Set,r=new Set;return e!==null&&(a.forEach(t=>{t!==e&&n.add(t)}),[1,2,4].includes(e)?a.forEach(e=>r.add(e)):[1,2,4].forEach(e=>r.add(e))),t!==null&&(a.forEach(e=>{e!==t&&r.add(e)}),[1,2,4].includes(t)?a.forEach(e=>n.add(e)):[1,2,4].forEach(e=>n.add(e))),{p1Dis:n,p2Dis:r}}function O(){e.innerHTML=``;let[i,a]=C(),[l,d]=w(),f=E(),{p1Dis:p,p2Dis:y}=D(h,g),b=v&&!_&&(h!==null||g!==null),x=_&&!t.er_bekreftet&&(o||s)&&!!c,S=m.length*2;u&&(u.textContent=t.er_bekreftet?`Fullført`:_?`Ferdig`:`Omgang ${f}`);let T=$(`div`,null,`sb-wrap`);if(T.appendChild(ee(Wi(n,`Spelar 1`),i,l,S,h,p,!v,1)),T.appendChild(ee(Wi(r,`Spelar 2`),a,d,S,g,y,!v,2)),e.appendChild(T),v){let t=$(`div`,null,`sb-angre-rad`);m.length>0&&t.appendChild(Gi(m.map(e=>e.omgang),ne));let n=$(`button`,`↩`,`sb-angre-btn`);n.title=`Angre val for denne omgangen`,n.disabled=h===null&&g===null,n.addEventListener(`click`,()=>{h=null,g=null,O()}),t.appendChild(n),e.appendChild(t)}if(x)e.appendChild(Ki(()=>c()));else if(v){let t=$(`button`,`Neste omgang`,`sb-neste-btn`);t.disabled=!b,t.addEventListener(`click`,async()=>{t.disabled=!0,t.textContent=`Lagrer…`,await te()}),e.appendChild(t)}e.querySelectorAll(`[data-spelar]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=parseInt(e.dataset.spelar??`0`),n=parseInt(e.dataset.val??`0`);t===1?h=n:g=n,O()})})}function ee(e,t,n,r,i,o,s,c){let l=$(`div`,null,`sb-spelar-panel`);l.appendChild($(`div`,e,`sb-spelar-navn`)),l.appendChild($(`div`,String(t),`sb-score`));let u=r>0?Math.round(n/r*100):0;if(l.appendChild($(`p`,`Ring: ${n} av ${r} ( ${u}% )`,`sb-ringer-info`)),!s){let e=$(`div`,null,`sb-knappar`);for(let t of a){let n=$(`button`,String(t),`sb-poeng-btn`);n.dataset.spelar=String(c),n.dataset.val=String(t),o.has(t)&&(n.disabled=!0),i===t&&n.classList.add(`sb-valgt`),e.appendChild(n)}l.appendChild(e)}return l}async function te(){let e=E(),t=h??0,i=g??0,a=t===6?2:+(t===3||t===4),o=i===6?2:+(i===3||i===4),s=[];n?.id&&s.push({kamp_spelar_id:n.id,omgang:e,score:t,antall_ringer:a}),r?.id&&s.push({kamp_spelar_id:r.id,omgang:e,score:i,antall_ringer:o});let{error:c}=await ti(s);if(c){Q(`Feil ved lagring`,`error`);return}m.push({omgang:e,s1:t,s2:i,r1:a,r2:o}),h=null,g=null;let[l,u]=C();T(l,u)&&(_=!0),O()}async function ne(e){if(!await X({title:`Slett omgangar`,message:`Slett omgang ${e} og alle etter? Dette kan ikkje angrast.`,danger:!0}))return;let{error:i}=await ri([n?.id,r?.id].filter(e=>e!=null),e);if(i){Q(`Feil ved sletting`,`error`);return}if(t.er_bekreftet){let{error:e}=await ni(t.id);if(e){Q(`Feil ved oppdatering av kampstatus`,`error`);return}t.er_bekreftet=!1}m=m.filter(t=>t.omgang<e),h=null,g=null;let[a,o]=C();_=T(a,o),O()}}function $(e,t,n){let r=document.createElement(e);return t!=null&&(r.textContent=t),n&&(r.className=n),r}function Wi(e,t=`Spelar`){return e?.kaster?`${e.kaster.fornavn} ${e.kaster.etternavn}`:t}function Gi(e,t){let n=$(`div`,null,`sb-omg-btns`);for(let r of e){let e=$(`button`,String(r),`sb-omg-btn`);e.title=`Slett frå omgang ${r}`,e.addEventListener(`click`,()=>t(r)),n.appendChild(e)}return n}function Ki(e){let t=$(`button`,`Bekreft kamp`,`sb-neste-btn sb-neste-btn--bekreft`);return t.addEventListener(`click`,async()=>{t.disabled=!0,t.textContent=`Lagrar…`,await e()}),t}async function qi(e,t,n,r,i,a){let{pointValues:o,erArrangor:s=!1,erDeltakar:c=!1,onBekreft:l=null,onKampBekreft:u,omgangEl:d=null}=a,f=s||c&&!t.er_bekreftet,p=[n,r,i].filter(e=>e!=null),m=p.map(e=>e.id).filter(e=>e!=null),h=[],g=[],_=[null,null,null];function v(e){return h.filter(t=>t.kamp_spelar_id===p[e]?.id).reduce((e,t)=>e+(t.score??0),0)}function y(){if(!h.length)return[];let e=Math.max(...h.map(e=>e.omgang)),t=new Set([0,1,2].filter(e=>p[e])),n=[],r=[0,0,0];for(let i=1;i<=e;i++){for(let e of t){let t=h.find(t=>t.kamp_spelar_id===p[e].id&&t.omgang===i);t&&(r[e]+=t.score??0)}let e=!0;for(;e&&t.size>1;){e=!1;for(let i of[...t]){let a=[...t].filter(e=>e!==i),o=Math.min(...a.map(e=>r[e]));if(r[i]>=21&&r[i]-o>=2){n.push(i),t.delete(i),e=!0;break}}}}return t.size===1&&n.length===2&&n.push([...t][0]),n}async function b(){if(!m.length)return;let{data:e}=await ei(m);h=e,g=y()}await b();let x=oi(t.id,m,async()=>{await b(),C()},async()=>{t.er_bekreftet=!0,await b(),C(),await u?.()});window.addEventListener(`hashchange`,()=>void Bi(x),{once:!0});function S(e){let t=p.map(()=>new Set),n=e.filter(e=>_[e]!==null);if(!n.length)return t;let r=n.some(e=>[1,2,4].includes(_[e])),i=n.some(e=>[3,6].includes(_[e]));for(let n of e)_[n]===null?r?o.forEach(e=>t[n].add(e)):i&&[1,2,4].forEach(e=>t[n].add(e)):o.forEach(e=>{e!==_[n]&&t[n].add(e)});return t}function C(){e.innerHTML=``;let n=p.map((e,t)=>v(t)),r=[0,1,2].filter(e=>p[e]&&!g.includes(e)),i=g.length===p.length,a=h.length?Math.max(...h.map(e=>e.omgang)):0,s=S(r);d&&(d.textContent=t.er_bekreftet?`Fullført`:i?`Ferdig`:`Omgang ${a+1}`);let c=$(`div`,null,`sb-wrap sb-wrap--3p`);if(p.forEach((e,r)=>{let a=g.includes(r),l=a?g.indexOf(r)+1:null,u=$(`div`,null,`sb-spelar-panel${a?` sb-spelar-panel--vann`:``}`);if(u.appendChild($(`div`,Wi(e),`sb-spelar-navn`)),u.appendChild($(`div`,String(n[r]),`sb-score`)),l&&u.appendChild($(`div`,`${l}. plass`,`sb-plass-badge`)),!a&&f&&!i&&!t.er_bekreftet){let e=$(`div`,null,`sb-knappar`);for(let t of o){let n=$(`button`,String(t),`sb-poeng-btn`);n.dataset.spelar=String(r),n.dataset.val=String(t),_[r]===t&&n.classList.add(`sb-valgt`),s[r]?.has(t)&&(n.disabled=!0),e.appendChild(n)}u.appendChild(e)}c.appendChild(u)}),e.appendChild(c),f&&!i&&!t.er_bekreftet){let t=$(`div`,null,`sb-angre-rad`);if(h.length>0){let e=[...new Set(h.map(e=>e.omgang))].sort((e,t)=>e-t);t.appendChild(Gi(e,T))}let n=$(`button`,`↩`,`sb-angre-btn`);n.title=`Angre val for denne omgangen`,n.disabled=r.every(e=>_[e]===null),n.addEventListener(`click`,()=>{_=[null,null,null],C()}),t.appendChild(n),e.appendChild(t);let i=r.some(e=>_[e]!==null),a=$(`button`,`Neste omgang`,`sb-neste-btn`);a.disabled=!i,a.addEventListener(`click`,w),e.appendChild(a)}i&&!t.er_bekreftet&&l&&f?e.appendChild(Ki(()=>l(g.map(e=>p[e].kasterid)))):t.er_bekreftet&&e.appendChild($(`div`,`Kamp fullført`,`alert alert-success mt-2`)),e.querySelectorAll(`[data-spelar]`).forEach(e=>{e.addEventListener(`click`,()=>{_[parseInt(e.dataset.spelar??`0`)]=parseInt(e.dataset.val??`0`),C()})})}async function w(){let e=[0,1,2].filter(e=>p[e]&&!g.includes(e)),t=h.length?Math.max(...h.map(e=>e.omgang))+1:1,{error:n}=await ti(e.map(e=>{let n=_[e]??0;return{kamp_spelar_id:p[e].id,omgang:t,score:n,antall_ringer:n===6?2:+(n===3||n===4)}}));if(n){Q(`Feil ved lagring`,`error`);return}_=[null,null,null],await b(),C()}async function T(e){if(!await X({title:`Slett omgangar`,message:`Slett omgang ${e} og alle etter? Dette kan ikkje angrast.`,danger:!0}))return;let{error:n}=await ri(m,e);if(n){Q(`Feil ved sletting`,`error`);return}if(t.er_bekreftet){let{error:e}=await ni(t.id);if(e){Q(`Feil ved oppdatering av kampstatus`,`error`);return}t.er_bekreftet=!1}_=[null,null,null],await b(),C()}C()}var Ji=[1,2,3,4,6];async function Yi(e,{id:t}){let n=t;e.replaceChildren(A(`Laster…`));let r,i;try{let[t,a]=await Promise.all([Hr(n),M()]);if(!t.data){e.replaceChildren(k(`Kamp ikkje funne.`));return}r=t.data,i=a}catch(t){b(`render:kamp`,t),e.replaceChildren(k(`Feil ved lasting av kamp.`));return}let a=(r.spelarar??[]).map(e=>e.kasterid).filter(e=>e!=null),o=await Ur(r.stevneid,a),s=document.querySelector(`.topp-header`);s&&s.classList.add(`skjult`),e.classList.add(`sb-fullskjerm-modus`),window.addEventListener(`hashchange`,()=>{s&&s.classList.remove(`skjult`),e.classList.remove(`sb-fullskjerm-modus`)},{once:!0});let c=r.spelarar??[],l=i?.profil?.kasterid??null,u=i?.profil?.rolle??null,d=u===`admin`||u===`klubbadmin`,f=l!=null&&c.some(e=>e.kasterid===l),p=c.find(e=>e.posisjon===1)??c[0]??null,m=c.find(e=>e.posisjon===2)??c[1]??null,h=r.er_tre_spelarar?c.find(e=>e.posisjon===3)??c[2]??null:null,g=p?o.get(p.kasterid)??0:0,_=m?o.get(m.kasterid)??0:0,v=r.stevne?.navn??``;function y(e,t,n){return`
      <div class="sb-kamp-wrapper">
        <div class="sb-kamp-topbar">
          <div class="sb-kamp-topbar-venstre">
            <button class="sb-tilbake-btn" aria-label="Tilbake">←</button>
            <span class="sb-kamp-stevnenavn">${j(v)}</span>
          </div>
          <div${n?` id="${n}"`:``} class="sb-kamp-topbar-midten">${e}</div>
          <div class="sb-kamp-topbar-høgre">
            <span class="sb-kamp-info-full">Runde ${r.runde_nummer} - Bane ${r.bane_nummer}</span>
            <span class="sb-kamp-info-kort">R${r.runde_nummer} - B${r.bane_nummer}</span>
          </div>
        </div>
        ${t}
      </div>
    `}e.innerHTML=y(`Omgang 1`,`<div id="sb-container" class="sb-page"></div>`,`sb-omgang-tittel`),e.addEventListener(`click`,e=>{e.target.closest(`.sb-tilbake-btn`)&&(history.length>1?history.back():window.close())});let x=e.querySelector(`#sb-container`),S=e.querySelector(`#sb-omgang-tittel`);async function C(){if(d){let{data:e}=await Wr(r.stevneid,r.bane_nummer??0);return e}if(l==null)return null;let{data:e}=await Gr(r.stevneid,l);return e}async function w(e){return e.er_walkover?!1:d?e.bane_nummer===r.bane_nummer:l==null?!1:Kr(e.id,l)}function T(){sessionStorage.setItem(`ventar-neste-${n}`,`1`),e.innerHTML=y(`Fullført`,`<div class="sb-ventar-innhald">
        <div class="alert alert-success mb-3"><strong>Kampen er ferdig!</strong></div>
        <div class="alert alert-info">Ventar på neste kamp…</div>
      </div>`);let t=ii(r.stevneid,n,async e=>{await w(e)&&(await Bi(t),location.hash=`#/kamp/${e.id}`)});window.addEventListener(`hashchange`,()=>{sessionStorage.removeItem(`ventar-neste-${n}`),Bi(t)},{once:!0})}async function E(){let n=await C();n?location.hash=`#/kamp/${n.id}`:d||f?T():Yi(e,{id:t})}function D(t){e.querySelector(`.sb-feil-banner`)?.remove();let n=document.createElement(`div`);n.className=`sb-feil-banner alert alert-danger m-2`,n.textContent=t,e.prepend(n)}async function O(e){let t={p1:p?{spelarId:p.id,kasterid:p.kasterid,scorePoeng:p.score_poeng}:null,p2:m?{spelarId:m.id,kasterid:m.kasterid,scorePoeng:m.score_poeng}:null};if(r.fase===`avsluttende`){let{error:i}=await Jr({kampId:n,stevneId:r.stevneid,rundeNavn:r.runde_navn,rundeNummer:r.runde_nummer,...t,orderedKasterids:e??null});if(i){D(`Feil ved bekreftelse av kamp.`);return}}else{let{error:e}=await qr({kampId:n,...t,hcp1:g,hcp2:_,erWalkover:r.er_walkover});if(e){D(`Feil ved bekreftelse av kamp.`);return}}await E()}if(r.er_bekreftet&&sessionStorage.getItem(`ventar-neste-${n}`)){await E();return}x&&await Ui(x,r,p,m,{pointValues:Ji,erArrangor:d,erDeltakar:f,onBekreft:O,onKampBekreft:d||f?E:void 0,omgangEl:S,p3ks:h,hcp1:g,hcp2:_})}function Xi(e,t,n){let r=(t??[]).filter(t=>t.spelarar?.some(t=>t.kasterid===e)).sort((e,t)=>e.runde_nummer-t.runde_nummer);return r.length?r.map(t=>{let r=t.spelarar?.find(t=>t.kasterid===e),i=t.spelarar?.find(t=>t.kasterid!==e),a=t.er_walkover&&(!i||!i.kaster),o=a?`Walkover`:i?.kaster?`${j(i.kaster.fornavn)} ${j(i.kaster.etternavn)}`:`—`,s=a?``:i?.kasterid?n[i.kasterid]??``:``,c=s?`${o} (${s})`:o,l=`${a?21:Ir(r)} - ${a?0:Ir(i)}`;return`<tr>
      <td class="text-center">${t.runde_nummer}</td>
      <td class="text-center">${t.bane_nummer??``}</td>
      <td>${c}</td>
      <td class="text-center">${l}</td>
    </tr>`}).join(``):`<tr><td colspan="4" class="text-muted small fst-italic text-center">Ingen kampar</td></tr>`}function Zi(e,t,n,r={}){if(e.er_bekreftet)return!1;if(e.er_walkover)return!0;if(n)return!1;let i=r[t[0]?.kasterid]??0,a=r[t[1]?.kasterid]??0,o=Ir(t[0]),s=t[1]?Ir(t[1]):0;return o+i>=21||s+a>=21}function Qi(e,t){return`
    <div class="org-hovud-innhald">
      <div class="org-tab-knappar btn-group w-100 mb-2">
        <button class="btn btn-primary org-tab-btn" data-tab="kamper">Kampar</button>
        <button class="btn btn-outline-primary org-tab-btn" data-tab="stilling">Stilling</button>
      </div>
      <div class="d-flex gap-3 align-items-start org-innhald-rad">
        <div class="flex-grow-1 org-kampar-panel">${e}</div>
        <div class="org-stilling-kol">${t}</div>
      </div>
    </div>`}function $i(e){return e.querySelector(`.org-hovud-innhald`)?.classList.contains(`org-vis-stilling`)?`stilling`:`kampar`}function ea(e,t){let n=e.querySelector(`.org-hovud-innhald`);n&&(n.classList.toggle(`org-vis-stilling`,t===`stilling`),e.querySelectorAll(`.org-tab-btn`).forEach(e=>{let n=e.dataset.tab===t;e.classList.toggle(`btn-primary`,n),e.classList.toggle(`btn-outline-primary`,!n)}))}function ta(e){let t=e.querySelector(`.org-hovud-innhald`);t&&e.querySelectorAll(`.org-tab-btn`).forEach(n=>{n.addEventListener(`click`,()=>{let r=n.dataset.tab===`stilling`;t.classList.toggle(`org-vis-stilling`,r),e.querySelectorAll(`.org-tab-btn`).forEach(e=>{e.classList.toggle(`btn-primary`,e.dataset.tab===n.dataset.tab),e.classList.toggle(`btn-outline-primary`,e.dataset.tab!==n.dataset.tab)})})})}function na(e,t,n,r={}){let{tableId:i=`stilling-tabell`,isAdmin:a=!1,stevneid:o=null,harHcp:s=!1,harGrupper:c=!1,harEliminasjon:l=!1,harAntallKamper:u=!1}=r,d=5+(+!!s+ +!!u),f=u?`th-32`:`th-28`,p=new Map;for(let t of e){let e=c?t.gruppe?.navn??`_`:`_`;p.has(e)||p.set(e,[]),p.get(e).push(t)}let m=p.size>1||!p.has(`_`),h=u?`${e.length} spelarar`:`Stilling`,g=[...p.entries()].sort(([e],[t])=>e===`_`?1:t===`_`?-1:e.localeCompare(t)).flatMap(([e,r])=>(m&&e!==`_`?`<tr><td colspan="${d}" class="fw-semibold ps-2">Gruppe ${j(e)}</td></tr>`:``)+r.map((e,r)=>{let i=l&&e.runde_eliminert!=null,c=e.hcp??0,f=s?a?`<td class="stilling-tal stilling-hcp-celle" data-kasterid="${e.kasterid}" data-stevneid="${o}">${c>0?c:`—`}</td>`:`<td class="stilling-tal">${c>0?c:`—`}</td>`:``,p=u?`<td class="stilling-tal">${e.antall_kamper??0}</td>`:``;return`
        <tr data-kasterid="${e.kasterid}" class="stilling-spelar-rad">
          <td${i?` class="avsl-elim-plass"`:``}>${r+1}</td>
          <td>${e.startnummer??``}</td>
          <td>${j(e.navn??`Spelar ${e.kasterid}`)}</td>
          ${p}
          <td class="stilling-tal">${e.kamp_poeng??0}</td>
          <td class="stilling-tal">${e.score_poeng??0}</td>
          ${f}
        </tr>
        <tr class="stilling-detalj" data-kasterid="${e.kasterid}" hidden>
          <td colspan="${d}" class="p-0">
            <table class="stilling-detalj-tabell table table-sm table-bordered mb-0">
              <thead><tr>
                <th class="text-center">Runde</th>
                <th class="text-center">Bane</th>
                <th>Motstandar</th>
                <th class="text-center">Resultat</th>
              </tr></thead>
              <tbody>${Xi(e.kasterid,t,n)}</tbody>
            </table>
          </td>
        </tr>`}).join(``)).join(``);return`
    <div>
      <h6 class="text-center fw-bold mb-1">${h}</h6>
      <table id="${i}" class="table table-sm kamp-tabell mb-0">
        <thead class="org-thead">
          <tr>
            <th class="${f}">#</th>
            <th class="${f}">S</th>
            <th>NAMN</th>
            ${u?`<th class="th-50 stilling-tal">ANT.</th>`:``}
            <th class="th-44 stilling-tal">KP</th>
            <th class="th-44 stilling-tal">SP</th>
            ${s?`<th class="th-44 stilling-tal">HCP</th>`:``}
          </tr>
        </thead>
        <tbody>${g}</tbody>
      </table>
    </div>`}function ra(e,t,n=new Set){let r=e.querySelector(`#${t}`);if(!r)return;n.forEach(e=>{let t=r.querySelector(`tr.stilling-detalj[data-kasterid="${e}"]`),n=r.querySelector(`tr.stilling-spelar-rad[data-kasterid="${e}"]`);t&&t.removeAttribute(`hidden`),n&&(n.classList.add(`stilling-aktiv`),n.setAttribute(`aria-expanded`,`true`))}),r.querySelectorAll(`tr.stilling-spelar-rad`).forEach(e=>{e.setAttribute(`tabindex`,`0`),e.hasAttribute(`aria-expanded`)||e.setAttribute(`aria-expanded`,`false`)});function i(e){let t=e.dataset.kasterid;if(!t)return;let i=r.querySelector(`tr.stilling-detalj[data-kasterid="${t}"]`);if(!i)return;let a=!!i.hidden;i.hidden=!a,e.classList.toggle(`stilling-aktiv`,a),e.setAttribute(`aria-expanded`,String(a)),a?n.add(t):n.delete(t)}r.addEventListener(`click`,e=>{let t=e.target.closest(`tr.stilling-spelar-rad`);t&&i(t)}),r.addEventListener(`keydown`,e=>{if(e.key!==`Enter`&&e.key!==` `)return;let t=e.target.closest(`tr.stilling-spelar-rad`);t&&(e.preventDefault(),i(t))})}function ia(e,t,n,r,i){return function(){let a=location.hash;t.some(t=>a===`#/stevne/${e}/${t}`)?r(n,e):i()}}function aa(e,t){return`
    ${t?`<button id="neste-runde-btn" class="btn btn-sm btn-warning">Generer neste runde</button>`:``}
    <button id="fullfør-turnering-btn" class="btn btn-sm btn-danger"${e.erfullfort?` disabled`:``}>Fullfør turnering</button>
    <button id="test-autofullfør-btn" class="btn btn-sm btn-outline-warning">TEST: Autofullfør</button>
  `}function oa(e,t){let{alleInnlBekrefta:n,harAvslKampar:r,harGruppefordeling:i,harPrekonfigurertFormat:a=!1}=t,o=e.stevne_fase,s=``;return o===`avsluttende`?i&&i&&!r&&(s=`<button id="endre-gruppeinndeling-btn" class="btn btn-sm btn-outline-secondary">Endre gruppeinndeling</button>`):s=n?`
        <button id="start-avsl-btn" class="btn btn-sm btn-success">Start avsluttande fase</button>
        ${a?`<button id="endre-gruppeinndeling-btn" class="btn btn-sm btn-outline-secondary">Endre gruppefordeling</button>`:``}`:`<span class="badge bg-warning text-dark">Innledande fase er ikkje ferdig</span>`,`
    ${s}
    <button id="fullfør-turnering-btn" class="btn btn-sm btn-danger"${e.erfullfort?` disabled`:``}>Fullfør turnering</button>
  `}function sa(e,t){let n={},r=new Set;for(let i of e){let[,e]=i.er_walkover?Fr(i.spelarar,t):[null,null];for(let a of i.spelarar??[])!a.kasterid||!a.kaster||i.er_walkover&&a.kasterid===e?.kasterid||(r.add(a.kasterid),n[a.kasterid]||(n[a.kasterid]={kasterid:a.kasterid,navn:`${a.kaster.fornavn} ${a.kaster.etternavn}`,startnummer:t[a.kasterid]??null,kamp_poeng:0,score_poeng:0,antall_kamper:0}),i.er_bekreftet&&(n[a.kasterid].kamp_poeng+=a.kamp_poeng,n[a.kasterid].score_poeng+=a.score_poeng,n[a.kasterid].antall_kamper+=1))}return{spelMap:n,ekteKasterids:r}}function ca(e,t){let n=t.filter(e=>e.er_bekreftet);return[...e].sort((e,t)=>{let r=e.runde_eliminert==null;if(r!==(t.runde_eliminert==null))return r?-1:1;if(!r){let n=(t.runde_eliminert??0)-(e.runde_eliminert??0);if(n!==0)return n;let r=e.plassering??1/0,i=t.plassering??1/0;if(r!==i)return r-i}if(t.kamp_poeng!==e.kamp_poeng)return(t.kamp_poeng??0)-(e.kamp_poeng??0);if(t.score_poeng!==e.score_poeng)return(t.score_poeng??0)-(e.score_poeng??0);let i=0,a=0;for(let r of n){let n=r.spelarar?.find(t=>t.kasterid===e.kasterid),o=r.spelarar?.find(e=>e.kasterid===t.kasterid);n&&o&&(i+=n.kamp_poeng??0,a+=o.kamp_poeng??0)}if(i!==a)return a-i;let o=e=>n.flatMap(t=>t.spelarar?.filter(t=>t.kasterid===e)??[]).map(e=>Ir(e)).sort((e,t)=>t-e),s=o(e.kasterid),c=o(t.kasterid);for(let e=0;e<Math.min(s.length,c.length);e++)if(c[e]!==s[e])return c[e]-s[e];return(e.startnummer??1/0)-(t.startnummer??1/0)})}function la(){return crypto.randomUUID()}async function ua(e,t,n){let{data:r,error:i}=await y.from(`pamelding`).select(`id, kasterid, kaster(klubbid)`).eq(`stevneid`,e).order(`id`);if(i)throw Error(`Feil ved henting av påmelding: `+i.message);if(!r?.length)throw Error(`Ingen spelarar påmelde.`);for(let e=r.length-1;e>0;e--){let t=Math.floor(Math.random()*(e+1));[r[e],r[t]]=[r[t],r[e]]}let a=r.length,o={},s=r.map((t,n)=>{o[n+1]=t.kasterid;let r=t.kaster?.klubbid??null;return{stevneid:e,kasterid:t.kasterid,klubbid:r,startnummer:n+1}});await y.from(`resultat`).delete().eq(`stevneid`,e);let{error:c}=await y.from(`resultat`).insert(s);if(c)throw Error(`Feil ved lagring av startnummer: `+c.message);return t.toLowerCase().includes(`gloppen`)?da(e,o,a,n):fa(e,o,a)}async function da(e,t,n,r){let i=(n%2==0?n:n+1)/2,a=0;for(let o=1;o<=r;o++){let r=[],s=[];for(let t=1;t<=i;t++){let a=(t-1+o-1)%i+1,c=(t-1+2*(o-1))%i+1+i,l=c>n;r.push({match_id:la(),stevneid:e,fase:`innledende`,runde_nummer:o,bane_nummer:t,er_bekreftet:!1,er_walkover:l}),s.push({p1Pos:a,p2Pos:c,erWalkover:l})}let{data:c,error:l}=await y.from(`kamp`).insert(r).select(`id, bane_nummer`);if(l)throw Error(`Feil ved innsetting av kampar (runde ${o}): `+l.message);let u=Object.fromEntries(c.map(e=>[e.bane_nummer,e.id])),d=[];for(let e=0;e<i;e++){let n=u[e+1],{p1Pos:r,p2Pos:i,erWalkover:a}=s[e];d.push({kampid:n,kasterid:t[r],posisjon:1,score_poeng:0,kamp_poeng:0,antall_ringer:0}),a||d.push({kampid:n,kasterid:t[i],posisjon:2,score_poeng:0,kamp_poeng:0,antall_ringer:0})}let{error:f}=await y.from(`kamp_spelar`).insert(d);if(f)throw Error(`Feil ved innsetting av spelarar (runde ${o}): `+f.message);a+=c.length}return a}async function fa(e,t,n){let r=[],i=[],a=1;for(let t=1;t<=n;t+=2){let o=t+1>n;r.push({match_id:la(),stevneid:e,fase:`innledende`,runde_nummer:1,bane_nummer:a,er_bekreftet:!1,er_walkover:o}),i.push({p1Pos:t,p2Pos:o?null:t+1,erWalkover:o}),a++}let{data:o,error:s}=await y.from(`kamp`).insert(r).select(`id, bane_nummer`);if(s)throw Error(`Feil ved innsetting av Swiss runde 1: `+s.message);let c=Object.fromEntries(o.map(e=>[e.bane_nummer,e.id])),l=[];for(let e=0;e<i.length;e++){let n=c[e+1],{p1Pos:r,p2Pos:a,erWalkover:o}=i[e];l.push({kampid:n,kasterid:t[r],posisjon:1,score_poeng:0,kamp_poeng:0,antall_ringer:0}),o||l.push({kampid:n,kasterid:t[a],posisjon:2,score_poeng:0,kamp_poeng:0,antall_ringer:0})}let{error:u}=await y.from(`kamp_spelar`).insert(l);if(u)throw Error(`Feil ved innsetting av Swiss spelarar: `+u.message);return o.length}async function pa(e){let{data:t,error:n}=await y.from(`kamp`).select(`id, runde_nummer, er_bekreftet, er_walkover, spelarar:kamp_spelar(kasterid, kamp_poeng, score_poeng, posisjon)`).eq(`stevneid`,e).eq(`fase`,`innledende`).order(`runde_nummer`);if(n)throw Error(`Feil ved henting av kampar: `+n.message);let r=t,i=Math.max(...t.map(e=>e.runde_nummer))+1,a=new Set;for(let e of r)for(let t of e.spelarar??[])t.kasterid!=null&&a.add(t.kasterid);let o=[...a],s={};for(let e of o)s[e]=o.filter(t=>t!==e);for(let e of r){let t=(e.spelarar??[]).filter(e=>e.kasterid!=null);if(t.length===2){let e=t[0].kasterid,n=t[1].kasterid;s[e]=s[e].filter(e=>e!==n),s[n]=s[n].filter(t=>t!==e)}}let c={};for(let e of o)c[e]=0;for(let e of t){if(!e.er_walkover)continue;let t=(e.spelarar??[]).find(e=>e.posisjon===1);t?.kasterid!=null&&(c[t.kasterid]=(c[t.kasterid]??0)+1)}let l=ca(o.map(e=>{let n=0,i=0;for(let t of r){let r=(t.spelarar??[]).find(t=>t.kasterid===e);r&&(n+=r.kamp_poeng??0,i+=0)}for(let n of t){let t=(n.spelarar??[]).find(t=>t.kasterid===e);t&&(i+=t.score_poeng??0)}return{kasterid:e,kamp_poeng:n,score_poeng:i}}),r);function u(e){for(let t=e.length-1;t>=0;t--)if((c[e[t].kasterid]??0)<1)return e[t];return null}function d(e,t){if(e.length===0)return t;if(e.length%2==1){let n=u(e);return n?(c[n.kasterid]++,t.push({p1:n.kasterid,p2:null,erWalkover:!0}),d(e.filter(e=>e.kasterid!==n.kasterid),t)||(c[n.kasterid]--,t.pop(),null)):null}for(let n=0;n<e.length;n++){let r=e[n];for(let i=n+1;i<e.length;i++){let n=e[i];if(s[r.kasterid]?.includes(n.kasterid)){t.push({p1:r.kasterid,p2:n.kasterid,erWalkover:!1});let i=d(e.filter(e=>e.kasterid!==r.kasterid&&e.kasterid!==n.kasterid),t);if(i)return i;t.pop()}}}return null}let f=d(l,[]);if(!f)throw Error(`Paring er ikkje mogleg. Alle moglege motstandarar er allereie spela.`);f.sort((e,t)=>!!e.erWalkover-+!!t.erWalkover);let p=f.map((t,n)=>({match_id:la(),stevneid:e,fase:`innledende`,runde_nummer:i,bane_nummer:n+1,er_bekreftet:!1,er_walkover:t.erWalkover})),{data:m,error:h}=await y.from(`kamp`).insert(p).select(`id, bane_nummer`);if(h)throw Error(`Feil ved innsetting av ny Swiss-runde: `+h.message);let g=Object.fromEntries(m.map(e=>[e.bane_nummer,e.id])),_=[];for(let e=0;e<f.length;e++){let{p1:t,p2:n,erWalkover:r}=f[e],i=g[e+1];_.push({kampid:i,kasterid:t,posisjon:1,score_poeng:0,kamp_poeng:0,antall_ringer:0}),r||_.push({kampid:i,kasterid:n,posisjon:2,score_poeng:0,kamp_poeng:0,antall_ringer:0})}let{error:v}=await y.from(`kamp_spelar`).insert(_);if(v)throw Error(`Feil ved innsetting av Swiss spelarar: `+v.message);return{rundeNummer:i,antallKampar:m.length}}async function ma(e,{id:t,isAdmin:n=!1},r=null){e.replaceChildren(A());try{let[i,a,o]=await Promise.all([fe(t),Or(t),M()]);if(i.error||!i.data){e.replaceChildren(k(`Stevne ikkje funne.`));return}let s=i.data,c=s.stevne_fase??null,l=c===null||c===`ikke_startet`,u=s.kastemetodeInnl?.navn??`—`,d=u.toLowerCase().includes(`gloppen`);if(r&&l&&n){r.innerHTML=`<button id="start-stevne-btn" class="btn btn-sm btn-success">Start stevne</button>`;let e=r.querySelector(`#start-stevne-btn`);e.addEventListener(`click`,async()=>{if(a<2){Q(`Stevnet må ha minst 2 spelarar for å startast.`,`error`);return}if(d&&!s.antall_runder_innl){Q(`Du må setje antal rundar for innledande fase. Gå til Innstillingar for å endre.`,`error`);return}let n=await kr(t);if(n>0&&!await X({title:`Ubekrefta spelarar`,message:`${n} spelar(ar) er ikkje bekrefta. Vil du starte stevnet likevel?`}))return;e.disabled=!0,e.textContent=`Starter…`;try{await ua(t,u,s.antall_runder_innl??1)}catch(t){Q(`Feil ved kampgenerering: `+(t instanceof Error?t.message:String(t)),`error`),e.disabled=!1,e.textContent=`Start stevne`;return}let{error:r}=await pe(t,`innledende`);if(r){Q(`Feil ved oppdatering av fase.`,`error`),e.disabled=!1,e.textContent=`Start stevne`;return}location.hash=`#/stevne/${t}/innledende`})}e.innerHTML=`
      <div class="card mb-3 org-max-480">
        <div class="card-body">
          <table class="table table-sm mb-0">
            <tbody>
              <tr><th>Stad</th><td>${j(s.sted??`—`)}</td></tr>
              <tr><th>Dato</th><td>${s.dato?ee(s.dato):`—`}</td></tr>
              <tr><th>Tid</th><td>${s.tid?ne(s.tid):`—`}</td></tr>
              <tr><th>Kastemetode innledande</th><td>${j(u)}</td></tr>
              <tr><th>Kastemetode avsluttande</th><td>${j(s.kastemetodeAvsl?.navn??`—`)}</td></tr>
              <tr><th>Antal rundar innledande</th><td>${s.antall_runder_innl??`—`}</td></tr>
              <tr><th>Påmelde spelarar</th><td>${a}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <div id="info-handling-knapper" class="mb-3 d-flex gap-2 flex-wrap"></div>`;let f=e.querySelector(`#info-handling-knapper`),p=s.erfullfort??!1;if(o?.profil?.kobling_status===`godkjent`&&!p){let e=document.createElement(`a`);e.href=`#/stevne/${t}/pamelding`,e.className=`btn btn-sm btn-primary`,e.textContent=`Meld deg på`,f.appendChild(e)}let m=document.createElement(`a`);m.href=`#/stevne/${t}/pamelding`,m.className=`btn btn-sm btn-outline-secondary`,m.textContent=`Sjå påmeldingar`,f.appendChild(m)}catch(t){b(`stevne-info.render`,t),e.replaceChildren(k(`Kunne ikkje laste info.`))}}function ha(e){return[...e].sort((e,t)=>{let n=(e.klubb?.navn??``).localeCompare(t.klubb?.navn??``,`nb`);if(n!==0)return n;let r=(e.etternavn??``).localeCompare(t.etternavn??``,`nb`);return r===0?(e.fornavn??``).localeCompare(t.fornavn??``,`nb`):r})}function ga(e,t,n){let r=t.toLowerCase();return e.filter(e=>n.has(e.id)?!1:!r||a(e).toLowerCase().includes(r)||(e.klubb?.navn??``).toLowerCase().includes(r))}function _a(e){let t=document.createElement(`div`);t.className=`d-flex flex-column flex-grow-1`;let n=document.createElement(`h6`);n.textContent=e,n.className=`fw-bold mb-1`;let r=document.createElement(`div`);r.className=`border rounded deltaker-tabell-wrapper flex-grow-1 overflow-auto`;let i=document.createElement(`table`);return i.className=`table table-sm table-hover table-bordered mb-0`,r.appendChild(i),t.appendChild(n),t.appendChild(r),{kolonne:t,tabell:i,tittelEl:n}}function va(e,t,n,r,i){let o=document.createElement(`tr`),s=document.createElement(`td`);if(s.className=`text-center th-40`,t){let e=document.createElement(`span`);e.className=`text-success fw-bold`,e.textContent=`✓`,s.appendChild(e)}else if(!i){let t=document.createElement(`button`);t.textContent=`✓`,t.className=`btn btn-outline-danger btn-sm rounded-circle p-0 lh-1 deltaker-bekreft-btn`,t.title=`Bekreft spelar`,t.addEventListener(`click`,t=>{t.stopPropagation(),r(e)}),s.appendChild(t)}let c=document.createElement(`td`);c.textContent=a(e);let l=document.createElement(`td`);l.textContent=e.klubb?.navn??``;let u=document.createElement(`td`);if(u.className=`text-center th-40`,!i){let t=document.createElement(`button`);t.innerHTML=`&times;`,t.className=`btn btn-danger btn-sm rounded-circle p-0 lh-1 deltaker-fjern-btn`,t.title=`Fjern spelar`,t.addEventListener(`click`,t=>{t.stopPropagation(),n(e)}),u.appendChild(t)}return o.appendChild(s),o.appendChild(c),o.appendChild(l),o.appendChild(u),o}function ya(e,t,n){let r=document.createElement(`tr`),i=document.createElement(`td`);i.textContent=a(e);let o=document.createElement(`td`);return o.textContent=e.klubb?.navn??`Ingen klubb`,n||(r.classList.add(`deltaker-rad`),r.addEventListener(`click`,()=>t(e))),r.appendChild(i),r.appendChild(o),r}function ba(e,t){let n=document.createElement(`tr`),r=document.createElement(`td`);return r.className=`text-center text-muted fst-italic py-3`,r.textContent=e,r.colSpan=t,n.appendChild(r),n}async function xa(e,{id:t,isAdmin:n=!1}){e.replaceChildren(A());try{let[r,i,a]=await Promise.all([Ce(t),tn(),Ar(t)]);if(r.error||!r.data){e.replaceChildren(k(`Stevne ikkje funne.`));return}if(i.error){e.replaceChildren(k(`Kunne ikkje laste kasterliste.`));return}let o=r.data.stevne_fase??null,s=n&&(o===null||o===`ikke_startet`),c=i.data,l=new Map;for(let e of a.data)e.kasterid!=null&&l.set(e.kasterid,e.er_bekreftet??!1);e.innerHTML=`
      <div>
        ${s?``:`<div class="alert alert-warning py-2">Spelarar kan ikkje endrast etter at stevnet er starta.</div>`}
        <div class="row g-3" id="spelarar-layout"></div>
      </div>`;let u=e.querySelector(`#spelarar-layout`),d=document.createElement(`div`);d.className=`col-md-6 d-flex flex-column`;let f=document.createElement(`input`);f.type=`text`,f.placeholder=`Søk etter navn eller klubb…`,f.className=`form-control mb-2`;let{kolonne:p,tabell:m}=_a(`Tilgjengelege spelarar`);d.appendChild(f),d.appendChild(p),u.appendChild(d);let h=document.createElement(`div`);h.className=`col-md-6 d-flex flex-column`;let g=document.createElement(`input`);g.type=`text`,g.className=`form-control mb-2 deltaker-search-spacer`,g.tabIndex=-1,g.disabled=!0;let{kolonne:_,tabell:v,tittelEl:y}=_a(`Påmelde spelarar`);h.appendChild(g),h.appendChild(_),u.appendChild(h);function b(){v.innerHTML=``;let e=ha(c.filter(e=>l.has(e.id)));if(y.textContent=`Påmelde spelarar: ${e.length}`,!e.length){v.appendChild(ba(`Ingen spelarar påmelde`,4));return}for(let n of e)v.appendChild(va(n,l.get(n.id)??!1,async e=>{let{error:n}=await Nr(t,e.id);if(n){Q(`Feil ved fjerning: `+(n instanceof Error?n.message:String(n)),`error`);return}l.delete(e.id),b(),x()},async e=>{let{error:n}=await Mr(t,e.id);if(n){Q(`Feil ved bekreftelse: `+(n instanceof Error?n.message:String(n)),`error`);return}l.set(e.id,!0),b()},!s))}function x(){let e=ha(ga(c,f.value,l));if(m.innerHTML=``,!e.length){m.appendChild(ba(`Ingen spelarar funne`,2));return}for(let n of e)m.appendChild(ya(n,async e=>{let{error:n}=await jr(t,e.id);if(n){Q(`Feil ved innmelding: `+(n instanceof Error?n.message:String(n)),`error`);return}l.set(e.id,!1),b(),x()},!s))}f.addEventListener(`input`,x),b(),x()}catch(t){b(`stevne-deltakere.render`,t),e.replaceChildren(k(`Kunne ikkje laste deltakarliste.`))}}var Sa=`modulepreload`,Ca=function(e){return`/`+e},wa={},Ta=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e=document.getElementsByTagName(`link`),i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}r=o(t.map(t=>{if(t=Ca(t,n),t in wa)return;wa[t]=!0;let r=t.endsWith(`.css`),i=r?`[rel="stylesheet"]`:``;if(n)for(let n=e.length-1;n>=0;n--){let i=e[n];if(i.href===t&&(!r||i.rel===`stylesheet`))return}else if(document.querySelector(`link[href="${t}"]${i}`))return;let o=document.createElement(`link`);if(o.rel=r?`stylesheet`:Sa,r||(o.as=`script`),o.crossOrigin=``,o.href=t,a&&o.setAttribute(`nonce`,a),document.head.appendChild(o),r)return new Promise((e,n)=>{o.addEventListener(`load`,e),o.addEventListener(`error`,()=>n(Error(`Unable to preload CSS for ${t}`)))})}))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})};async function Ea(e,{id:t,isAdmin:n=!1},r=null){e.replaceChildren(A());let{navn:i,error:a}=await Me(t);if(a){e.replaceChildren(k(`Stevne ikkje funne.`));return}if(i.includes(`gloppen`)){let{render:i}=await Ta(async()=>{let{render:e}=await import(`./gloppen-CFqTYJ6-.js`);return{render:e}},__vite__mapDeps([0,1,2]));await i(e,{id:t,isAdmin:n},r)}else if(i.includes(`nordhordland`)){let{render:i}=await Ta(async()=>{let{render:e}=await import(`./nordhordland-D1WBhydP.js`);return{render:e}},__vite__mapDeps([3,1,2]));await i(e,{id:t,isAdmin:n},r)}else if(i.includes(`x-kast`)||i.includes(`minimatch`)||i.includes(`halvmatch`)||i.includes(`heilmatch`)){let{render:i}=await Ta(async()=>{let{render:e}=await import(`./xkast-OUiYU6Xu.js`);return{render:e}},[]);await i(e,{id:t,isAdmin:n},r)}else e.replaceChildren(k(`Ukjend innledande kastemetode: ${i||`(ikkje sett)`}`))}async function Da(e,{id:t,isAdmin:n=!1},r=null){e.replaceChildren(A());let{navn:i,error:a}=await Ne(t);if(a){e.replaceChildren(k(`Stevne ikkje funne.`));return}if(i.includes(`cup`)){let{render:i}=await Ta(async()=>{let{render:e}=await import(`./cup-D-jFmYDw.js`);return{render:e}},__vite__mapDeps([4,2]));await i(e,{id:t,isAdmin:n},r)}else if(i.includes(`kongelag`)){let{render:i}=await Ta(async()=>{let{render:e}=await import(`./kongelag-DGOCY8EW.js`);return{render:e}},[]);await i(e,{id:t,isAdmin:n},r)}else if(i.includes(`nordhordland`)){let{render:i}=await Ta(async()=>{let{render:e}=await import(`./nordhordland-D_SA8BGy.js`);return{render:e}},[]);await i(e,{id:t,isAdmin:n},r)}else e.replaceChildren(k(`Ukjend avsluttande kastemetode: ${i||`(ikkje sett)`}`))}y.from(`kamp`).select(`id, er_walkover, spelarar:kamp_spelar(id, kasterid)`);function Oa(){let e=Math.floor(Math.random()*27),t=Math.floor(Math.random()*27);return e<21&&t<21?Math.random()<.5?[Math.floor(Math.random()*6)+21,t]:[e,Math.floor(Math.random()*6)+21]:[e,t]}async function ka(e){let{data:t,error:n}=await y.from(`kamp`).select(`id, er_walkover, spelarar:kamp_spelar(id, kasterid)`).eq(`stevneid`,e).eq(`fase`,`innledende`).eq(`er_bekreftet`,!1);if(n){b(`autoFullforInnledendeKamper`,n);return}if(t?.length)for(let e of t){let[t,n]=e.spelarar??[],[r,i]=e.er_walkover?[21,0]:Oa(),[a,o]=Pr(r,i);try{let s=[y.from(`kamp`).update({er_bekreftet:!0}).eq(`id`,e.id)];t&&s.push(y.from(`kamp_spelar`).update({score_poeng:r,kamp_poeng:a}).eq(`id`,t.id)),n&&s.push(y.from(`kamp_spelar`).update({score_poeng:i,kamp_poeng:o}).eq(`id`,n.id)),await Promise.all(s)}catch(e){b(`autoFullforInnledendeKamper:update`,e)}}}async function Aa(e,t){let{data:n,error:r}=await y.from(`kamp`).select(`id`).eq(`stevneid`,e).eq(`fase`,t);if(r){b(`slettKamperForFase:kamp`,r);return}let i=(n??[]).map(e=>e.id);if(!i.length)return;let{data:a,error:o}=await y.from(`kamp_spelar`).select(`id`).in(`kampid`,i);if(o){b(`slettKamperForFase:spelar`,o);return}let s=(a??[]).map(e=>e.id);if(s.length){let{error:e}=await y.from(`kamp_omgang`).delete().in(`kamp_spelar_id`,s);if(e){b(`slettKamperForFase:omgang`,e);return}let{error:t}=await y.from(`kamp_spelar`).delete().in(`kampid`,i);if(t){b(`slettKamperForFase:spelarDel`,t);return}}let{error:c}=await y.from(`kamp`).delete().in(`id`,i);c&&b(`slettKamperForFase:kampDel`,c)}async function ja(e){await Aa(e,`avsluttende`),await Aa(e,`innledende`);let{error:t}=await y.from(`resultat`).delete().eq(`stevneid`,e);if(t){b(`nullstillStevne:resultat`,t);return}let{error:n}=await y.from(`stevne`).update({stevne_fase:`ikke_startet`,runde1_format:null}).eq(`id`,e);n&&b(`nullstillStevne:stevne`,n)}async function Ma(e,{id:t}){e.replaceChildren(A());try{let[n,r]=await Promise.all([Oe(t),ke()]);if(n.error||!n.data){e.replaceChildren(k(`Stevne ikkje funne.`));return}let i=n.data,a=r.data,o=a.filter(e=>e.er_innledende),s=a.filter(e=>e.er_avsluttende);function c(e,t){return e.map(e=>`<option value="${e.id}"${e.id===t?` selected`:``}>${j(e.navn)}</option>`).join(``)}e.innerHTML=`
      <div>
        <h4 class="mb-3">Innstillingar</h4>
        <form id="innstillingar-form" class="org-max-480">
          <div class="mb-3">
            <label class="form-label fw-semibold">Kastemetode innledande</label>
            <select id="innl-metode" class="form-select">
              <option value="">— Ikkje vald —</option>
              ${c(o,i.innledendekastemetodeid)}
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold">Kastemetode avsluttande</label>
            <select id="avsl-metode" class="form-select">
              <option value="">— Ikkje vald —</option>
              ${c(s,i.avsluttendekastemetodeid)}
            </select>
          </div>
          <div class="mb-4">
            <label class="form-label fw-semibold">Antal rundar innledande</label>
            <input id="antall-rundar" type="number" min="1" class="form-control"
              value="${i.antall_runder_innl??``}" placeholder="t.d. 6">
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
      </div>`,e.querySelector(`#innstillingar-form`).addEventListener(`submit`,async n=>{n.preventDefault();let r=e.querySelector(`#innl-metode`).value||null,i=e.querySelector(`#avsl-metode`).value||null,a=e.querySelector(`#antall-rundar`).value,{error:o}=await Ae(t,{innledendekastemetodeid:r?Number(r):null,avsluttendekastemetodeid:i?Number(i):null,antall_runder_innl:a?Number(a):null});if(o){b(`stevne-innstillingar.lagre`,o),Q(`Feil ved lagring: `+(o instanceof Error?o.message:String(o)),`error`);return}let s=e.querySelector(`#lagre-status`);s.classList.remove(`d-none`),setTimeout(()=>{s.classList.add(`d-none`)},2e3)}),e.querySelector(`#nullstill-btn`).addEventListener(`click`,async n=>{let r=n.currentTarget;await X({title:`Nullstill stevne`,message:`Dette slettar alle kampar og resultat og set stevnet tilbake til starttilstanden. Er du sikker?`,danger:!0})&&(r.disabled=!0,await ja(t),await Ma(e,{id:t}))})}catch(t){b(`stevne-innstillingar.render`,t),e.replaceChildren(k(`Kunne ikkje laste innstillingar.`))}}y.from(`stevne`).select(`
    id, navn, sted, dato, erfullfort, resultaturl, juryleder, klubbid,
    stevnetype:stevnetypeid(navn),
    kategori:kategoriid(navn),
    kontakt:kontaktkasterid(fornavn, etternavn),
    innledende:innledendekastemetodeid(navn),
    avsluttende:avsluttendekastemetodeid(navn)
  `),y.from(`resultat`).select(`
    plassering, nc_poeng,
    kaster:kasterid(id, fornavn, etternavn),
    klubb:klubbid(navn),
    klasse:klasseid(navn),
    gruppe:gruppeid(navn)
  `);async function Na(e){let{data:t,error:n}=await y.from(`stevne`).select(`
      id, navn, sted, dato, erfullfort, resultaturl, juryleder, klubbid,
      stevnetype:stevnetypeid(navn),
      kategori:kategoriid(navn),
      kontakt:kontaktkasterid(fornavn, etternavn),
      innledende:innledendekastemetodeid(navn),
      avsluttende:avsluttendekastemetodeid(navn)
    `).eq(`id`,e).maybeSingle();return n&&b(`hentStevneMedDetaljer`,n),{data:t,error:n}}y.from(`resultat`).select(`kasterid, startnummer, hcp`);async function Pa(e){let{data:t,error:n}=await y.from(`resultat`).select(`kasterid, startnummer, hcp`).eq(`stevneid`,e);return n&&b(`hentResultatForInnledende`,n),{data:t??[],error:n}}async function Fa(e,t,n){let{error:r}=await y.from(`resultat`).update({hcp:n}).eq(`stevneid`,e).eq(`kasterid`,t);return r&&b(`oppdaterResultatHcp`,r),{error:r}}y.from(`resultat`).select(`
  kasterid, startnummer, plassering, runde_eliminert,
  kamp_poeng_innl, score_poeng_innl,
  gruppe:gruppeid(id, navn)
`);async function Ia(e){let{data:t,error:n}=await y.from(`resultat`).select(`
      kasterid, startnummer, plassering, runde_eliminert,
      kamp_poeng_innl, score_poeng_innl,
      gruppe:gruppeid(id, navn)
    `).eq(`stevneid`,e);return n&&b(`hentResultatForAvsluttende`,n),{data:t??[],error:n}}async function La(e){let{data:t,error:n}=await y.from(`gruppe`).select(`id, navn`).in(`navn`,e);return n&&b(`hentGrupper`,n),{data:t??[],error:n}}async function Ra(e,t){if(!t.length)return{error:null};let n=(await Promise.all(t.map(t=>y.from(`resultat`).update({gruppeid:t.gruppeid}).eq(`stevneid`,e).eq(`kasterid`,t.kasterid)))).find(e=>e.error)?.error??null;return n&&b(`setGruppeInndeling`,n),{error:n}}async function za(e){let{error:t}=await y.from(`resultat`).update({gruppeid:null}).eq(`stevneid`,e);return t&&b(`clearGruppeInndeling`,t),{error:t}}async function Ba(e){let{data:t,error:n}=await y.from(`resultat`).select(`
      plassering, nc_poeng,
      kaster:kasterid(id, fornavn, etternavn),
      klubb:klubbid(navn),
      klasse:klasseid(navn),
      gruppe:gruppeid(navn)
    `).eq(`stevneid`,e).order(`plassering`);return n&&b(`hentResultaterForStevne`,n),{data:t??[],error:n}}function Va(e,t){let n=new Map;for(let r of e){let e=r.gruppe?.navn??`–`,i=r.klasse?.navn??null,a=t?`${i??``}|${e}`:e,o=t?`${i?i+` `:``}${e}`:e;n.has(a)||n.set(a,{label:o,rader:[]}),n.get(a).rader.push(r)}return[...n.values()].sort((e,t)=>e.label.localeCompare(t.label,`nb`))}function Ha(e){let t=e.rader.map(e=>`
    <div class="res-rad">
      <span class="res-pl">${e.plassering??`–`}.</span>
      <div class="res-info">
        <span class="res-navn">${j(a(e.kaster)||`–`)}</span>
        <span class="res-klubb">${j(e.klubb?.navn??`–`)}</span>
      </div>
    </div>`).join(``);return`
    <div class="res-gruppe">
      <h2 class="res-gruppe-tittel">${j(e.label)}</h2>
      <div class="res-gruppe-rader">${t}</div>
    </div>`}function Ua(e){let t=e.rader.map(e=>{let t=e.kaster,n=t?`<a href="#/kastere/${s(t)}" class="res-kaster-lenke">${j(a(t))}</a>`:`–`;return`
      <tr>
        <td class="res-td-pl">${e.plassering??`–`}</td>
        <td class="res-td-navn">${n}</td>
        <td class="res-td-klubb">${j(e.klubb?.navn??`–`)}</td>
        <td class="res-td-nc">${e.nc_poeng==null?``:e.nc_poeng}</td>
      </tr>`}).join(``);return`
    <div class="res-tabell-seksjon">
      <table class="res-tabell">
        <thead>
          <tr class="res-thead-gruppe">
            <td colspan="4" class="res-td-gruppe-header">${j(e.label)}</td>
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
    </div>`}async function Wa(e,{id:t}){e.replaceChildren(A(`Laster resultat…`));try{let[n,r]=await Promise.all([Na(t),Ba(t)]);if(n.error||!n.data){e.replaceChildren(k(`Kunne ikkje laste stevnet.`));return}if(r.error){e.replaceChildren(k(`Kunne ikkje laste resultat.`));return}let i=n.data,a=r.data;if(!a.length){e.replaceChildren(L(i.erfullfort?`Ingen resultat registrert.`:`Turneringa er ikkje avslutta enno.`));return}let o=Va(a,(i.dato?new Date(i.dato+`T12:00:00`).getFullYear():9999)<2026),s=a.length;e.innerHTML=`
      <div class="res-side">
        <div class="res-felles">
          ${i.resultaturl?.startsWith(`http`)?`<a class="res-pdf-lenke" href="${j(i.resultaturl)}" target="_blank" rel="noopener">Resultat som pdf 📄</a>`:``}
          ${i.juryleder?`<p class="res-klassifisering">Juryleder: ${j(i.juryleder)}</p>`:``}
          <p class="res-antall"><strong>Antall deltakarar: ${s}</strong></p>
        </div>
        <div class="res-mobil-blokk">
          ${o.map(Ha).join(``)}
        </div>
        <div class="res-desktop-blokk">
          ${o.map(Ua).join(``)}
        </div>
      </div>`}catch(t){b(`stevne-resultat.render`,t),e.replaceChildren(k(`Kunne ikkje laste resultat.`))}}var Ga=[{key:`info`,label:`Info`,adminOnly:!1},{key:`deltakere`,label:`Deltakere`,adminOnly:!0},{key:`innledende`,label:`Innledande`,adminOnly:!1},{key:`avsluttende`,label:`Avsluttande`,adminOnly:!1},{key:`resultat`,label:`Sluttresultat`,adminOnly:!1},{key:`innstillinger`,label:`Innstillingar`,adminOnly:!0}],Ka=new Set(Ga.filter(e=>e.adminOnly).map(e=>e.key)),qa={info:ma,deltakere:xa,innledende:Ea,avsluttende:Da,innstillinger:Ma,resultat:Wa},Ja={ikke_startet:`<span class="badge bg-secondary">Ikkje starta</span>`,innledende:`<span class="badge bg-primary">Innledande fase</span>`,avsluttende:`<span class="badge bg-success">Avsluttande fase</span>`};function Ya(e,t,n,r){return`<ul class="nav nav-tabs mb-3">${Ga.filter(e=>n||!e.adminOnly).filter(e=>e.key!==`avsluttende`||r).map(({key:n,label:r})=>`
      <li class="nav-item">
        <a class="nav-link${t===n?` active`:``}"
           href="#/stevne/${e}/${n}">${r}</a>
      </li>`).join(``)}</ul>`}var Xa=null;async function Za(e,{id:t,tab:n=`info`}){Xa&&=(await Bi(Xa),null),e.replaceChildren(A());try{let{data:r,error:i}=await Ce(t);if(i||!r){e.replaceChildren(k(`Stevne ikkje funne.`));return}let a=await N()||await at(),o=r.avsluttendekastemetodeid!=null,s=!a&&Ka.has(n)?`info`:n,c=Ja[r.stevne_fase??`ikke_startet`]??``;e.innerHTML=`
      <div class="org-shell py-3 px-3">
        ${Ya(t,s,a,o)}
        <div class="org-fase-header d-flex align-items-center gap-2 mb-3">
          <h5 class="mb-0 flex-grow-1">${j(r.navn)} <span id="fase-badge">${c}</span></h5>
          <div id="org-banner-knappar"></div>
        </div>
        <div id="org-subside"></div>
      </div>`;let l=e.querySelector(`#org-banner-knappar`),u=e.querySelector(`#org-subside`);await(qa[s]??ma)(u,{id:t,isAdmin:a},l),Xa=we(t,t=>{let n=e.querySelector(`#fase-badge`);n&&(n.innerHTML=Ja[t??`ikke_startet`]??``)})}catch(t){b(`stevne.render`,t),e.replaceChildren(k(`Kunne ikkje laste stevnet.`))}}var Qa=document.getElementById(`app`);function $a(e,t){return async(n,r)=>{if(!await M()){location.hash=`#/logginn`;return}if(e===`admin`&&!await N()){n.replaceChildren(k(`Ingen tilgang.`));return}if(e===`klubbadmin`&&!await N()&&!await at()){n.replaceChildren(k(`Ingen tilgang.`));return}await t(n,r)}}var eo=[{pattern:/^\/logginn$/,side:Cr,params:()=>({})},{pattern:/^\/minside$/,side:$a(`bruker`,hi),params:()=>({})},{pattern:/^\/admin$/,side:$a(`admin`,bi),params:()=>({})},{pattern:/^\/stevne\/ny$/,side:$a(`klubbadmin`,ji),params:()=>({})},{pattern:/^\/stevne\/(\d+)\/admin$/,side:$a(`klubbadmin`,ji),params:e=>({id:e[1]})},{pattern:/^\/kamp\/(\d+)$/,side:Yi,params:e=>({id:Number(e[1])})},{pattern:/^\/stevne\/(\d+)\/pamelding$/,side:zi,params:e=>({id:e[1]})},{pattern:/^\/stevne\/(\d+)(?:\/([^/]*))?$/,side:Za,params:e=>({id:Number(e[1]),tab:e[2]??`info`})},{pattern:/^\/kaster\/ny$/,side:$a(`klubbadmin`,Mi),params:()=>({})},{pattern:/^\/kaster\/(\d+)\/admin$/,side:$a(`klubbadmin`,Mi),params:e=>({id:e[1]})},{pattern:/^\/klubber\/(\d+)\/admin$/,side:$a(`klubbadmin`,Ni),params:e=>({id:e[1]})},{pattern:/^\/terminliste$/,side:Ct,params:()=>({})},{pattern:/^\/norgescupen$/,side:It,params:()=>({})},{pattern:/^\/norgesranking$/,side:Jt,params:()=>({})},{pattern:/^\/rekorder$/,side:ar,params:()=>({})},{pattern:/^\/nmvinnere$/,side:br,params:()=>({})},{pattern:/^\/kastere\/(\d+)(-[^/]*)?$/,side:In,params:e=>({id:e[1]})},{pattern:/^\/kastere$/,side:In,params:()=>({})},{pattern:/^\/klubber\/(\d+)(-[^/]*)?$/,side:Zn,params:e=>({id:e[1]})},{pattern:/^\/klubber$/,side:Zn,params:()=>({})},{pattern:/^\/?$/,side:Be,params:()=>({})}];function to(){let e=location.hash.replace(/^#/,``)||`/`;for(let t of eo){let n=e.match(t.pattern);if(n){t.side(Qa,t.params(n));return}}Qa.replaceChildren(k(`Side ikkje funne.`))}async function no(){let e=await M(),t=document.getElementById(`meny-logginn-item`),n=document.getElementById(`meny-minside-item`),r=document.getElementById(`meny-admin-item`),i=document.getElementById(`meny-loggut-item`);if(e){t.classList.add(`d-none`);let a=e.profil?.rolle===`admin`;n.classList.toggle(`d-none`,a),r.classList.toggle(`d-none`,!a),i.classList.remove(`d-none`)}else t.classList.remove(`d-none`),n.classList.add(`d-none`),r.classList.add(`d-none`),i.classList.add(`d-none`)}window.addEventListener(`hashchange`,to),document.addEventListener(`DOMContentLoaded`,()=>{document.getElementById(`menyLoggUtKnapp`).addEventListener(`click`,async()=>{await ot(),location.hash=`#/`}),no(),to()}),document.addEventListener(`authStateChanged`,()=>{no()});export{Xr as A,De as B,X as C,zr as D,Zr as E,Pr as F,A as G,Ee as H,Fr as I,y as J,k as K,Ir as L,$r as M,Br as N,Yr as O,ai as P,Te as R,Bi as S,qr as T,Fe as U,pe as V,j as W,aa as _,Fa as a,ca as b,pa as c,ta as d,sa as f,Qi as g,oa as h,Pa as i,Vr as j,Rr as k,Zi as l,ia as m,La as n,Ra as o,$i as p,b as q,Ia as r,ka as s,za as t,ra as u,na as v,Qr as w,Q as x,ea as y,Pe as z};