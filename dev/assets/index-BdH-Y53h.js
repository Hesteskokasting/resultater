const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/gloppen-CKTkwsKt.js","assets/_innledendeBase-_IwqV7TB.js","assets/ScoreNumberpad-DYEk7r3I.js","assets/nordhordland-DhYIBI9D.js","assets/cup-Ci3J--6B.js"])))=>i.map(i=>d[i]);
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
    `).in(`stevneid`,i).not(`nc_poeng`,`is`,null).gt(`nc_poeng`,0);return o&&b(`hentStevnerOgResultater.resultater`,o),{stevner:r,resultater:a??[],error:o}}function w(e){return e.length===10?new Date(e+`T12:00:00`):new Date(e)}var ee=new Intl.DateTimeFormat(`nb-NO`,{day:`2-digit`,month:`2-digit`,year:`numeric`}),te=new Intl.DateTimeFormat(`nb-NO`,{day:`numeric`,month:`numeric`,year:`numeric`}),T=new Intl.DateTimeFormat(`nb-NO`,{weekday:`long`,day:`numeric`,month:`long`,year:`numeric`});function E(e){return e?ee.format(w(e)):``}function ne(e){return e?te.format(w(e)):``}function D(e){return e?T.format(w(e)):``}function re(e){return e?e.slice(0,5):``}function ie(e,r,i=`Data`){let a=n.json_to_sheet(e),o=n.book_new();n.book_append_sheet(o,a,i),t(o,r)}function ae(e,t,n=new Date().getFullYear()){let r=``;for(let i=n;i>=t;i--)r+=`<option value="${i}"${i===e?` selected`:``}>${i}</option>`;return r}function O(e){let t=document.createElement(`p`);return t.className=`feil`,t.textContent=e,t}function k(e=`Laster…`){let t=document.createElement(`p`);return t.className=`laster`,t.textContent=e,t}function A(e){return String(e??``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}y.from(`stevne`).select(`
    id, navn, dato, tid, sted, stevne_fase, antall_runder_innl, erfullfort, klubbid,
    kastemetodeInnl:kastemetode!stevne_innledendekastemetodeid_fkey(id, navn),
    kastemetodeAvsl:kastemetode!stevne_avsluttendekastemetodeid_fkey(id, navn)
  `);async function oe(){let e=new Date().toISOString().slice(0,10),{data:t,error:n}=await y.from(`stevne`).select(`id, navn, dato`).lt(`dato`,e).eq(`erfullfort`,!0).order(`dato`,{ascending:!1}).limit(5);return n&&b(`hentSisteResultater`,n),{data:t??[],error:n}}async function se(){let{data:e,error:t}=await y.from(`stevne`).select(`id, navn, stevne_fase`).in(`stevne_fase`,[`innledende`,`avsluttende`]).order(`dato`,{ascending:!0});return t&&b(`hentLiveStevner`,t),{data:e??[],error:t}}async function ce(){let e=new Date().toISOString().slice(0,10),{data:t,error:n}=await y.from(`stevne`).select(`id, navn, dato, innbydelseurl`).gte(`dato`,e).order(`dato`,{ascending:!0}).limit(5);return n&&b(`hentKommendeStevner`,n),{data:t??[],error:n}}async function le(e){let{data:t,error:n}=await y.from(`stevne`).select(`id, navn, dato, sted, erfullfort, klubbid`).eq(`id`,e).maybeSingle();return n&&b(`hentStevneForPamelding`,n),{data:t,error:n}}async function ue(e,t,n,r){let{data:i,error:a}=await y.from(`stevne`).select(`id, navn, dato`).eq(`klubbid`,e).eq(`erfullfort`,!1).neq(`id`,r).gte(`dato`,t).lte(`dato`,n).order(`dato`);return a&&b(`hentRelaterteStevner`,a),{data:i??[],error:a}}async function de(e){let{data:t,error:n}=await y.from(`stevne`).select(`
      id, navn, dato, tid, sted, stevne_fase, antall_runder_innl, erfullfort, klubbid,
      kastemetodeInnl:kastemetode!stevne_innledendekastemetodeid_fkey(id, navn),
      kastemetodeAvsl:kastemetode!stevne_avsluttendekastemetodeid_fkey(id, navn)
    `).eq(`id`,e).maybeSingle();return n&&b(`hentInfoStevne`,n),{data:t,error:n}}async function fe(e,t){let{error:n}=await y.from(`stevne`).update({stevne_fase:t}).eq(`id`,e);return n&&b(`oppdaterStevneFase`,n),{error:n}}async function pe(){let{data:e,error:t}=await y.from(`stevnetype`).select(`id, navn`).order(`navn`);return t&&b(`hentStevnetypar`,t),{data:e??[],error:t}}async function me(){let{data:e,error:t}=await y.from(`kastemetode`).select(`id, navn`).order(`navn`);return t&&b(`hentKastemetodar`,t),{data:e??[],error:t}}async function he(){let{data:e,error:t}=await y.from(`kategori`).select(`id, navn`).order(`navn`);return t&&b(`hentKategoriar`,t),{data:e??[],error:t}}async function ge(e){let{data:t,error:n}=await y.from(`stevne`).select(`id, navn, sted, dato, tid, klubbid, stevnetypeid, innledendekastemetodeid, avsluttendekastemetodeid, kategoriid, ernm, ernorgesranking, erfullfort, erekskludertfrarekorder, innbydelseurl, resultaturl`).eq(`id`,e).single();return n&&b(`hentStevneForAdmin`,n),{data:t,error:n}}async function _e(e){let{data:t,error:n}=await y.from(`stevne`).insert(e).select(`id`).single();return n&&b(`opprettStevne`,n),{data:t,error:n}}async function ve(e,t){let{data:n,error:r}=await y.from(`stevne`).update(t).eq(`id`,e).select(`id`).single();return r&&b(`oppdaterStevne`,r),{data:n,error:r}}async function ye(e){let{error:t}=await y.from(`stevne`).delete().eq(`id`,e);return t&&b(`slettStevne`,t),{error:t}}y.from(`stevne`).select(`
    id, navn, sted, dato, tid, ernm, erfullfort, innbydelseurl, resultaturl,
    klubb:klubbid(id, navn),
    stevnetype:stevnetypeid(id, navn),
    innledende:kastemetode!innledendekastemetodeid(id, navn),
    avsluttende:kastemetode!avsluttendekastemetodeid(id, navn),
    kategori:kategoriid(id, navn)
  `);async function be(e){let{data:t,error:n}=await y.from(`stevne`).select(`
      id, navn, sted, dato, tid, ernm, erfullfort, innbydelseurl, resultaturl,
      klubb:klubbid(id, navn),
      stevnetype:stevnetypeid(id, navn),
      innledende:kastemetode!innledendekastemetodeid(id, navn),
      avsluttende:kastemetode!avsluttendekastemetodeid(id, navn),
      kategori:kategoriid(id, navn)
    `).gte(`dato`,`${e}-01-01`).lte(`dato`,`${e}-12-31`).order(`dato`);return n&&b(`hentTerminlisteStevner`,n),{data:t??[],error:n}}async function xe(){let[e,t,n,r]=await Promise.all([y.from(`stevnetype`).select(`id, navn`).order(`navn`),y.from(`kastemetode`).select(`id, navn`).order(`navn`),y.from(`klubb`).select(`id, navn`).order(`navn`),y.from(`kategori`).select(`id, navn`).order(`navn`)]),i=e.error??t.error??n.error??r.error??null;return i&&b(`hentFiltervalg`,i),{data:{stevnetyper:e.data??[],kastemetoder:t.data??[],klubber:n.data??[],kategorier:r.data??[]},error:i}}async function Se(e){let{data:t,error:n}=await y.from(`stevne`).select(`id, navn, stevne_fase, avsluttendekastemetodeid`).eq(`id`,e).single();return n&&b(`hentStevneHeader`,n),{data:t,error:n}}function Ce(e,t){return y.channel(`stevne-fase-${e}`).on(`postgres_changes`,{event:`UPDATE`,schema:`public`,table:`stevne`,filter:`id=eq.${e}`},e=>t(e.new.stevne_fase)).subscribe()}y.from(`stevne`).select(`id, navn, stevne_fase, erfullfort, runde1_format, avsluttendemetode:avsluttendekastemetodeid(id, navn)`);async function we(e){let{data:t,error:n}=await y.from(`stevne`).select(`id, navn, stevne_fase, erfullfort, runde1_format, avsluttendemetode:avsluttendekastemetodeid(id, navn)`).eq(`id`,e).maybeSingle();return n&&b(`hentAvsluttendeStevne`,n),{data:t,error:n}}async function Te(e,t){let{error:n}=await y.from(`stevne`).update({runde1_format:t}).eq(`id`,e);return n&&b(`setRunde1Format`,n),{error:n}}async function Ee(e){let{count:t,error:n}=await y.from(`pamelding`).select(`id`,{count:`exact`,head:!0}).eq(`stevneid`,e);return n&&b(`hentPameldingCount`,n),{count:t??0,error:n}}async function De(e){let{data:t,error:n}=await y.from(`stevne`).select(`id, stevne_fase, antall_runder_innl, innledendekastemetodeid, avsluttendekastemetodeid`).eq(`id`,e).single();return n&&b(`hentStevneInnstillingar`,n),{data:t,error:n}}async function Oe(){let{data:e,error:t}=await y.from(`kastemetode`).select(`id, navn, er_innledende, er_avsluttende`).eq(`eraktiv`,!0).order(`navn`);return t&&b(`hentAktiveKastemetodar`,t),{data:e??[],error:t}}async function ke(e,t){let{error:n}=await y.from(`stevne`).update(t).eq(`id`,e);return n&&b(`oppdaterStevneInnstillingar`,n),{error:n}}async function Ae(e){let{data:t,error:n}=await y.from(`pamelding`).select(`stevneid`).eq(`bruker_id`,e);return n&&b(`hentPameldteForBruker`,n),new Set((t??[]).map(e=>e.stevneid).filter(e=>e!=null))}async function je(e){let{data:t,error:n}=await y.from(`stevne`).select(`m:kastemetode!stevne_innledendekastemetodeid_fkey(navn)`).eq(`id`,e).single();n&&b(`hentInnledendeMetodeNamn`,n);let r=t?.m;return{navn:((r&&!Array.isArray(r)?r.navn:null)??``).toLowerCase(),error:n}}async function Me(e){let{data:t,error:n}=await y.from(`stevne`).select(`m:kastemetode!stevne_avsluttendekastemetodeid_fkey(navn)`).eq(`id`,e).single();n&&b(`hentAvsluttendeMetodeNamn`,n);let r=t?.m;return{navn:((r&&!Array.isArray(r)?r.navn:null)??``).toLowerCase(),error:n}}y.from(`stevne`).select(`id, navn, erfullfort, stevne_fase, antall_runder_innl, kastemetodeInnl:innledendekastemetodeid(id, navn)`);async function Ne(e){let{data:t,error:n}=await y.from(`stevne`).select(`id, navn, erfullfort, stevne_fase, antall_runder_innl, kastemetodeInnl:innledendekastemetodeid(id, navn)`).eq(`id`,e).maybeSingle();return n&&b(`hentInnledendeStevne`,n),{data:t,error:n}}async function Pe(e){let{error:t}=await y.from(`stevne`).update({erfullfort:!0}).eq(`id`,e);return t&&b(`setStevneErfullfort`,t),{error:t}}function Fe(e){return e.length===0?`<p class="empty-state">Ingen data.</p>`:`
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
      <td>${A(e.navn)}</td>
      <td>${A(e.klubb)}</td>
      <td class="nc-td-poeng">${l(e.totalPoeng)}</td>
    </tr>`).join(``)}</tbody>
    </table>`}function Ie(e){let t=e.stevne_fase===`avsluttende`?`avsluttende`:`innledende`;return`
    <a class="live-kort" href="#/stevne/${e.id}/${t}">
      <span class="live-prikk"></span>
      <span>LIVE: ${A(e.navn)}</span>
    </a>`}function Le(e){return`
    <div class="stevne-kort">
      <p class="stevne-dato">${D(e.dato)}</p>
      <p class="stevne-navn">${A(e.navn)}</p>
      <a class="stevne-lenke" href="#/stevne/${e.id}/resultat">Vis resultat</a>
    </div>`}function Re(e){let t=e.innbydelseurl?`<a class="stevne-lenke" href="${A(e.innbydelseurl)}" target="_blank" rel="noopener">Innbydelse &#128196;</a>`:`<span class="stevne-lenke-inaktiv">Innbydelse er ikkje klar</span>`;return`
    <div class="stevne-kort">
      <p class="stevne-dato">${D(e.dato)}</p>
      <a class="stevne-navn" href="#/stevne/${e.id}/resultat">${A(e.navn)}</a>
      ${t}
    </div>`}async function ze(e){let t=new Date().getFullYear();e.replaceChildren(k(`Laster framsida...`));let n,r,i,a,o,s;try{let[{data:c,error:l},{data:u,error:d},{data:f,error:p},{stevner:m,resultater:h,error:g},{data:_,error:v}]=await Promise.all([oe(),ce(),S(t),C(t),se()]);if(l||d||p||g){e.replaceChildren(O(`Kunne ikkje laste framsida.`));return}n=c,r=u,a=f,s=m,o=h,i=_}catch(t){b(`home.render`,t),e.replaceChildren(O(`Kunne ikkje laste framsida.`));return}let c=a?_(o,s,a,`NC`,1):[];e.innerHTML=`
    <div class="heimeside">
      ${i.length?`<div class="live-banner">${i.map(Ie).join(``)}</div>`:``}
      <div class="heimeside-grid">
        <section class="heimeside-nc">
          <h2 class="heimeside-seksjon-tittel">Norgescupen Klasse 1 - Topp 20</h2>
          ${Fe(c)}
          <a class="heimeside-meir-lenke" href="#/norgescupen">Til detaljert liste</a>
        </section>
        <section class="heimeside-resultater">
          <h2 class="heimeside-seksjon-tittel">Siste resultat</h2>
          <div class="stevne-liste">${n.map(Le).join(``)}</div>
          <a class="heimeside-meir-lenke" href="#/terminliste">Vis terminliste</a>
        </section>
        <section class="heimeside-kommende">
          <h2 class="heimeside-seksjon-tittel">Kommande konkurransar</h2>
          <div class="stevne-liste">${r.map(Re).join(``)}</div>
          <a class="heimeside-meir-lenke" href="#/terminliste">Vis terminliste</a>
        </section>
      </div>
    </div>`}async function Be(e){let{data:t,error:n}=await y.from(`bruker_profil`).select(`rolle, kasterid, kobling_status, kobling_kasterid`).eq(`id`,e).maybeSingle();return n&&b(`hentProfilForBruker`,n),{data:t,error:n}}async function Ve(e,t){let{error:n}=await y.from(`bruker_profil`).update({kobling_kasterid:t,kobling_status:`venter`}).eq(`id`,e);return n&&b(`sendProfileLinkRequest`,n),{error:n}}async function He(){let{data:e,error:t}=await y.from(`bruker_profil`).select(`id, kobling_kasterid`).eq(`kobling_status`,`venter`);return t&&b(`hentVentandeKoblingar`,t),{data:e??[],error:t}}async function Ue(e){let{data:t,error:n}=await y.rpc(`hent_bruker_epost`,{bruker_ids:e});return n&&b(`hentBrukarEpost`,n),{data:t??[],error:n}}async function We(e,t,n){let{error:r}=await y.from(`bruker_profil`).update({kobling_status:n,kasterid:t}).eq(`id`,e);return r&&b(`oppdaterKoblingStatus`,r),{error:r}}async function Ge(){let{data:e,error:t}=await y.from(`bruker_profil`).select(`id, rolle, kobling_status`).order(`opprettet_at`,{ascending:!1});return t&&b(`hentAlleBrukarar`,t),{data:e??[],error:t}}async function Ke(e,t){let{error:n}=await y.from(`bruker_profil`).update({rolle:t}).eq(`id`,e);return n&&b(`oppdaterBrukarRolle`,n),{error:n}}async function qe(){let{data:e,error:t}=await y.from(`bruker_profil`).select(`id`).eq(`rolle`,`klubbadmin`);return t&&b(`hentKlubbadminBrukarar`,t),{data:e??[],error:t}}async function Je(){let{data:e,error:t}=await y.from(`klubbadmin_klubber`).select(`bruker_id, klubbid`);return t&&b(`hentKlubbadminTildelte`,t),{data:e??[],error:t}}async function Ye(e,t){let{error:n}=await y.from(`klubbadmin_klubber`).insert({bruker_id:e,klubbid:t});return n&&b(`leggTilKlubbadminTilgang`,n),{error:n}}async function Xe(e){let{data:t,error:n}=await y.from(`klubbadmin_klubber`).select(`klubbid`).eq(`bruker_id`,e);return n&&b(`hentKlubbadminKlubbarForBruker`,n),{data:(t??[]).map(e=>e.klubbid).filter(e=>e!=null),error:n}}async function Ze(e,t){let{error:n}=await y.from(`klubbadmin_klubber`).delete().eq(`bruker_id`,e).eq(`klubbid`,t);return n&&b(`fjernKlubbadminTilgang`,n),{error:n}}var Qe=[`admin`,`klubbadmin`,`bruker`];function $e(e){return typeof e==`string`&&Qe.includes(e)}function et(e){return typeof e==`object`&&!!e&&$e(e.rolle)}var tt=null;async function nt(){if(tt)return tt;let{data:{session:e}}=await y.auth.getSession();if(!e)return null;let{data:t}=await Be(e.user.id),n=[];if(t?.rolle===`klubbadmin`){let{data:t}=await Xe(e.user.id);n=t}return tt={user:e.user,profil:et(t)?t:null,klubber:n},tt}async function j(){return nt()}async function rt(){return(await nt())?.profil?.rolle??null}async function M(){return await rt()===`admin`}async function it(e=null){let t=await nt();return!t||t.profil?.rolle!==`klubbadmin`?!1:e===null?!0:t.klubber.includes(Number(e))}async function at(){tt=null,await y.auth.signOut()}async function ot(e,t){return y.auth.signInWithPassword({email:e,password:t})}async function st(e,t){return y.auth.signUp({email:e,password:t})}y.auth.onAuthStateChange(e=>{(e===`SIGNED_OUT`||e===`SIGNED_IN`||e===`TOKEN_REFRESHED`)&&(tt=null),document.dispatchEvent(new CustomEvent(`authStateChanged`,{detail:e}))});function N(e,t,n=`— velg —`){let r=`<option value="">${n}</option>`;for(let n of e??[]){let e=String(n.id)===String(t)?` selected`:``,i=A(n.navn??n.klubbnavn??``);r+=`<option value="${n.id}"${e}>${i}</option>`}return r}var P={kolonne:`dato`,retning:`asc`};function ct(e,t){switch(t){case`navn`:return e.navn??``;case`dato`:return e.dato??``;case`sted`:return e.sted??``;case`metode`:return[e.innledende?.navn,e.avsluttende?.navn].filter(e=>!!e).join(` `);case`organizer`:return e.klubb?.navn??``;case`type`:return e.stevnetype?.navn??``;case`klassifisering`:return e.kategori?.navn??``;default:return``}}function lt(e){return[...e].sort((e,t)=>{let n=ct(e,P.kolonne),r=ct(t,P.kolonne),i=n.localeCompare(r,`nb`);return P.retning===`asc`?i:-i})}var F={ar:new Date().getFullYear(),tekst:``,stevnetypeId:``,kastemetodeId:``,klubbId:``,kategoriId:``},ut=[],dt=null,ft=new Set;function pt(e){return e.filter(e=>{if(F.tekst){let t=F.tekst.toLowerCase();if(![e.navn,e.sted,e.klubb?.navn,e.stevnetype?.navn,e.kategori?.navn,e.innledende?.navn,e.avsluttende?.navn].some(e=>e?.toLowerCase().includes(t)))return!1}if(F.stevnetypeId&&String(e.stevnetype?.id)!==F.stevnetypeId)return!1;if(F.kastemetodeId){let t=F.kastemetodeId;if(!(String(e.innledende?.id)===t||String(e.avsluttende?.id)===t))return!1}return!(F.klubbId&&String(e.klubb?.id)!==F.klubbId||F.kategoriId&&String(e.kategori?.id)!==F.kategoriId)})}function mt(e){ie(e.map(e=>({Dato:e.dato?new Date(e.dato).toLocaleDateString(`nb-NO`):``,Navn:e.navn??``,Sted:e.sted??``,Arrangør:e.klubb?.navn??``,Stevnetype:e.stevnetype?.navn??``,"Kastemetode (innledende)":e.innledende?.navn??``,"Kastemetode (avsluttende)":e.avsluttende?.navn??``,Kategori:e.kategori?.navn??``,NM:e.ernm?`Ja`:`Nei`,InnbydelseUrl:e.innbydelseurl??``})),`terminliste-${F.ar}.xlsx`,`Terminliste`)}var ht=[{id:`navn`,label:`Stevne`},{id:`dato`,label:`Dato`},{id:`sted`,label:`Sted`},{id:`metode`,label:`Metode`},{id:`organizer`,label:`Arrangør`},{id:`type`,label:`Type`},{id:`klassifisering`,label:`Klassifisering`}];function gt(e){return P.kolonne===e?P.retning===`asc`?`<span class="tl-sort-ikon aktiv">↑</span>`:`<span class="tl-sort-ikon aktiv">↓</span>`:`<span class="tl-sort-ikon">↕</span>`}function _t(e){let t=e.dato?new Date(e.dato+`T12:00:00`).toLocaleDateString(`nb-NO`):``,n=[e.innledende?.navn,e.avsluttende?.navn].filter(e=>!!e).join(` \\ `),r=e.ernm?`<span class="tl-nm-merke">NM</span> `:``,i=e.innbydelseurl?`<a href="${A(e.innbydelseurl)}" target="_blank" rel="noopener" class="tl-innbydelse-ikon" title="Innbydelse">📄</a>`:``;return`<tr class="tl-tr">
    <td><a class="tl-lenkje" href="#/stevne/${e.id}/resultat">${r}${A(e.navn??``)}</a></td>
    <td>${t}</td>
    <td>${A(e.sted??``)}</td>
    <td>${A(n)}</td>
    <td>${A(e.klubb?.navn??``)}</td>
    <td>${A(e.stevnetype?.navn??``)}</td>
    <td>${A(e.kategori?.navn??``)}</td>
    <td>${i}</td>
  </tr>`}function vt(e){return e.length===0?`<p class="empty-state">Ingen stevner funnet med valgte filtre.</p>`:`<table class="tl-tabell">${`<thead><tr>
    ${ht.map(e=>`<th class="tl-th" data-kolonne="${e.id}">${e.label}${gt(e.id)}</th>`).join(``)}
    <th class="tl-th">Innbydelse</th>
  </tr></thead>`}${`<tbody>${lt(e).map(_t).join(``)}</tbody>`}</table>`}function yt(e){return window.innerWidth>600?vt(e):xt(e)}function bt(e){let t=D(e.dato),n=e.sted?`<p class="tl-detalj">Sted: ${A(e.sted)}</p>`:``,r=e.klubb?`<p class="tl-detalj">Arrangør: ${A(e.klubb.navn??``)}</p>`:``,i=e.stevnetype?`<p class="tl-detalj">Type: ${A(e.stevnetype.navn??``)}</p>`:``,a=e.ernm?`<span class="tl-nm-merke">NM</span>`:``,o=e.innbydelseurl?`<a class="tl-innbydelse-lenke" href="${A(e.innbydelseurl)}" target="_blank" rel="noopener">Innbydelse 📄</a>`:``,s=e.resultaturl?`<a class="stevne-lenke" href="#/stevne/${e.id}/resultat">Vis resultat</a>`:``,c=e.dato&&new Date(e.dato+`T12:00:00`)>new Date,l=dt?.profil?.rolle,u=dt?.profil?.kobling_status===`godkjent`||l===`admin`||l===`klubbadmin`,d=ft.has(e.id),f=u?d?`<a class="stevne-lenke" href="#/stevne/${e.id}/pamelding">Påmeldt ✓</a>`:c&&!e.erfullfort?`<a class="stevne-lenke" href="#/stevne/${e.id}/pamelding">Meld meg på</a>`:``:``;return`
    <div class="stevne-kort tl-kort">
      <a class="tl-navn tl-navn-lenke" href="#/stevne/${e.id}/resultat">${a}${A(e.navn??``)}</a>
      <p class="stevne-dato">${t}</p>
      ${n}${r}${i}
      ${o}${s}${f}
    </div>
  `}function xt(e){return e.length===0?`<p class="empty-state">Ingen stevner funnet med valgte filtre.</p>`:`<div class="stevne-liste">${e.map(bt).join(``)}</div>`}async function St(e){e.replaceChildren(k(`Laster terminliste…`));try{let[{data:t,error:n},{data:r},i]=await Promise.all([be(F.ar),xe(),j()]);if(dt=i,ft=i?.user?await Ae(i.user.id):new Set,n){b(`terminliste.render`,n),e.replaceChildren(O(`Kunne ikkje laste terminliste.`));return}ut=t??[],e.innerHTML=`
      <div class="terminliste">
        <h1 class="tl-tittel">Terminliste ${F.ar}</h1>

        <!-- Desktop-filterrad -->
        <div class="tl-filter-rad">
          <select class="tl-select" id="tl-ar">${ae(F.ar,1983,new Date().getFullYear()+1)}</select>
          <input class="tl-input" id="tl-tekst" type="search" placeholder="Søk..." value="${A(F.tekst)}">
          <select class="tl-select" id="tl-stevnetype">${N(r.stevnetyper,F.stevnetypeId,`Alle typer`)}</select>
          <select class="tl-select" id="tl-kastemetode">${N(r.kastemetoder,F.kastemetodeId,`Alle metoder`)}</select>
          <select class="tl-select" id="tl-arrangorklubb">${N(r.klubber,F.klubbId,`Alle arrangører`)}</select>
          <select class="tl-select" id="tl-kategori">${N(r.kategorier,F.kategoriId,`Alle kategorier`)}</select>
          <button class="tl-excel-knapp" id="tl-excel-desktop">⬇ Excel</button>
        </div>

        <!-- Mobil-rad -->
        <div class="tl-mobil-rad">
          <input class="tl-input" id="tl-tekst-mobil" type="search" placeholder="Søk..." value="${A(F.tekst)}">
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
            <select class="tl-select" id="tl-ar-mobil">${ae(F.ar,1983,new Date().getFullYear()+1)}</select>
          </label>
          <label class="tl-label">Stevnetype
            <select class="tl-select" id="tl-stevnetype-mobil">${N(r.stevnetyper,F.stevnetypeId,`Alle typer`)}</select>
          </label>
          <label class="tl-label">Kastemetode
            <select class="tl-select" id="tl-kastemetode-mobil">${N(r.kastemetoder,F.kastemetodeId,`Alle metoder`)}</select>
          </label>
          <label class="tl-label">Arrangør
            <select class="tl-select" id="tl-arrangorklubb-mobil">${N(r.klubber,F.klubbId,`Alle arrangører`)}</select>
          </label>
          <label class="tl-label">Kategori
            <select class="tl-select" id="tl-kategori-mobil">${N(r.kategorier,F.kategoriId,`Alle kategorier`)}</select>
          </label>
          <div class="tl-bunnark-knapper">
            <button class="tl-tilbakestill-knapp" id="tl-tilbakestill">Tilbakestill</button>
            <button class="tl-bruk-knapp" id="tl-bruk">Bruk filter</button>
          </div>
        </div>
      </div>
    `;function a(){let t=pt(ut);e.querySelector(`.tl-liste-container`).innerHTML=yt(t);let n=e.querySelector(`.tl-antall`);return n&&(n.textContent=`${t.length} stevner`),t}if(a(),i?.profil&&(i.profil.rolle===`admin`||i.profil.rolle===`klubbadmin`)){let t=document.createElement(`div`);t.className=`mb-3 px-2 d-flex gap-2`,t.innerHTML=`<a href="#/stevne/ny" class="btn btn-sm btn-success">+ Nytt stevne</a>`,e.querySelector(`.terminliste`)?.prepend(t)}let o=e.querySelector(`.tl-liste-container`),s=e.querySelector(`#tl-ar`),c=e.querySelector(`#tl-tekst`),l=e.querySelector(`#tl-tekst-mobil`),u=e.querySelector(`#tl-stevnetype`),d=e.querySelector(`#tl-kastemetode`),f=e.querySelector(`#tl-arrangorklubb`),p=e.querySelector(`#tl-kategori`),m=e.querySelector(`#tl-excel-desktop`),h=e.querySelector(`#tl-excel-mobil`),g=e.querySelector(`#tl-filter-aapne`),_=e.querySelector(`#tl-bunnark`),v=e.querySelector(`#tl-bakgrunn`),y=e.querySelector(`#tl-tilbakestill`),x=e.querySelector(`#tl-bruk`),S=e.querySelector(`#tl-ar-mobil`),C=e.querySelector(`#tl-stevnetype-mobil`),w=e.querySelector(`#tl-kastemetode-mobil`),ee=e.querySelector(`#tl-arrangorklubb-mobil`),te=e.querySelector(`#tl-kategori-mobil`);o.addEventListener(`click`,e=>{let t=e.target.closest(`[data-kolonne]`);if(!t)return;let n=t.dataset.kolonne;P.kolonne===n?P.retning=P.retning===`asc`?`desc`:`asc`:(P.kolonne=n,P.retning=`asc`),a()});let T=null;window.addEventListener(`resize`,()=>{T!==null&&clearTimeout(T),T=setTimeout(a,200)}),s.addEventListener(`change`,async()=>{F.ar=Number(s.value),e.querySelector(`.tl-tittel`).textContent=`Terminliste ${F.ar}`,e.querySelector(`.tl-liste-container`).replaceChildren(k(`Laster...`));let{data:t,error:n}=await be(F.ar);if(n){b(`terminliste.arChange`,n),e.querySelector(`.tl-liste-container`).replaceChildren(O(`Feil ved henting.`));return}ut=t??[],a()}),c.addEventListener(`input`,()=>{F.tekst=c.value,a()}),l.addEventListener(`input`,()=>{F.tekst=l.value,c.value=l.value,a()}),u.addEventListener(`change`,()=>{F.stevnetypeId=u.value,a()}),d.addEventListener(`change`,()=>{F.kastemetodeId=d.value,a()}),f.addEventListener(`change`,()=>{F.klubbId=f.value,a()}),p.addEventListener(`change`,()=>{F.kategoriId=p.value,a()});let E=()=>mt(pt(ut));m.addEventListener(`click`,E),h.addEventListener(`click`,E);function ne(){_.classList.add(`aktiv`),v.classList.add(`aktiv`)}function D(){_.classList.remove(`aktiv`),v.classList.remove(`aktiv`)}g.addEventListener(`click`,ne),v.addEventListener(`click`,D),y.addEventListener(`click`,()=>{F.tekst=``,F.stevnetypeId=``,F.kastemetodeId=``,F.klubbId=``,F.kategoriId=``,C.value=``,w.value=``,ee.value=``,te.value=``,l.value=``,c.value=``,a()}),x.addEventListener(`click`,async()=>{let t=Number(S.value),n=t!==F.ar;if(F.ar=t,F.stevnetypeId=C.value,F.kastemetodeId=w.value,F.klubbId=ee.value,F.kategoriId=te.value,D(),n){e.querySelector(`.tl-tittel`).textContent=`Terminliste ${F.ar}`,e.querySelector(`.tl-liste-container`).replaceChildren(k(`Laster...`));let{data:t,error:n}=await be(F.ar);if(n){b(`terminliste.brukFilter`,n),e.querySelector(`.tl-liste-container`).replaceChildren(O(`Feil ved henting.`));return}ut=t??[]}a()})}catch(t){b(`terminliste.render`,t),e.replaceChildren(O(`Kunne ikkje laste terminliste.`))}}function Ct(e,t){let{triggerSel:n,idAttr:r,detailSel:i,chevronSel:a=`.nc-chevron`,lookupRoot:o}=t,s=o??e;e.querySelectorAll(n).forEach(e=>{e.setAttribute(`tabindex`,`0`),e.setAttribute(`aria-expanded`,`false`)});function c(e){let t=e.getAttribute(`data-${r}`);if(!t)return;let n=s.querySelector(`${i}[data-${r}="${t}"]`);if(!n)return;let o=n.classList.contains(`d-none`);n.classList.toggle(`d-none`),e.setAttribute(`aria-expanded`,String(o));let c=e.querySelector(a);c&&(c.textContent=o?` ▲`:` ▼`)}e.addEventListener(`click`,e=>{let t=e.target.closest(n);t&&c(t)}),e.addEventListener(`keydown`,e=>{if(e.key!==`Enter`&&e.key!==` `)return;let t=e.target.closest(n);t&&(e.preventDefault(),c(t))})}function I(e){let t=document.createElement(`p`);return t.className=`empty-state`,t.textContent=e,t}function wt(e,t){if(t)for(let[n,r]of Object.entries(t))e.setAttribute(n,r)}function L(e){let{columns:t,rows:n,rowClass:r,rowAttrs:i,detailRow:a,detailRowClass:o=`detalj-rad d-none`,tableClass:s=`app-tabell`,theadClass:c=`app-thead`,showHeader:l=!0}=e,u=document.createElement(`table`);if(u.className=s,l){let e=u.createTHead();e.className=c;let n=e.insertRow();for(let e of t){let t=document.createElement(`th`);t.textContent=e.label,e.thClass&&(t.className=e.thClass),n.appendChild(t)}}let d=u.createTBody();return n.forEach((e,n)=>{let s=d.insertRow(),c=typeof r==`function`?r(e,n):r;c&&(s.className=c),wt(s,i?.(e,n));for(let r of t){let t=s.insertCell(),i=typeof r.cellClass==`function`?r.cellClass(e,n):r.cellClass;i&&(t.className=i),wt(t,r.cellAttrs?.(e,n));let a=r.render(e,n);typeof a==`string`?t.textContent=a:t.appendChild(a)}if(a){let r=a(e,n);if(r!==null){let a=d.insertRow();a.className=o,wt(a,i?.(e,n));let s=a.insertCell();s.colSpan=t.length,s.appendChild(r)}}}),u}var Tt=2007,Et=2024,R={ar:new Date().getFullYear(),cupType:`NC`,klasse:1,visning:`singel`},z={ar:null,regler:null,stevner:[],resultater:[]};async function Dt(e){if(z.ar===e)return!0;try{let[{data:t,error:n},{stevner:r,resultater:i,error:a}]=await Promise.all([S(e),C(e)]);return n||a?!1:(z.ar=e,z.regler=t,z.stevner=r,z.resultater=i,!0)}catch(e){return b(`hentOgBufferData`,e),!1}}function Ot(e,t){return t===`SNC`?`Dei ${e.max_snc} beste SNC-stevna er teljande`:t===`DNC`?`Dei ${e.max_dnc} beste DNC-stevna er teljande`:`Dei ${e.maxtotal} beste stevna, herav maks ${e.max_nc_total} NC-stevner og ${e.max_snc_total} SNC-stevner er teljande`}function kt(e){return`
    <div class="nc-klasse-tabs nc-visning-tabs">
      <button class="nc-klasse-tab${e===`singel`?` aktiv`:``}" data-visning="singel">Singel</button>
      <button class="nc-klasse-tab${e===`lag`?` aktiv`:``}" data-visning="lag">Lag</button>
    </div>`}function At(e,t){return`
    <div class="nc-klasse-tabs-wrapper">
      <div class="nc-klasse-tabs">
        <button class="nc-klasse-tab${e===1?` aktiv`:``}" data-klasse="1">Klasse 1</button>
        ${t<=2025?`<button class="nc-klasse-tab${e===2?` aktiv`:``}" data-klasse="2">Klasse 2</button>`:``}
      </div>
      <span class="nc-klikk-hint">Klikk poengsum for å vise detaljer</span>
    </div>`}function jt(e){let t=document.createDocumentFragment();t.appendChild(document.createTextNode(l(e)));let n=document.createElement(`span`);return n.className=`nc-chevron`,n.textContent=` ▼`,t.appendChild(n),t}function Mt(e){return e.length===0?I(`Ingen resultater funnet.`):L({rows:e,rowClass:`nc-singel-rad`,rowAttrs:(e,t)=>({"data-idx":String(t)}),detailRowClass:`nc-detalj-rad d-none`,detailRow:e=>L({rows:e.detaljRader,tableClass:`detalj-tabell`,theadClass:``,columns:[{label:`Dato`,render:e=>E(e._stevne?.dato)},{label:`Type`,render:e=>e._stevne?.typeNavn??`–`},{label:`Stevne`,render:e=>e._stevne?.navn??`–`},{label:`Pl.`,render:e=>String(e.plassering??`–`)},{label:`Poeng`,render:e=>l(e.nc_poeng)}]}),columns:[{label:`Pl.`,thClass:`nc-td-pl`,cellClass:`nc-td-pl`,render:e=>String(e.plassering)},{label:`Navn`,render:e=>e.navn},{label:`Klubb`,render:e=>e.klubb},{label:`Poeng`,thClass:`nc-td-poeng`,cellClass:`nc-td-poeng nc-poeng-celle`,cellAttrs:(e,t)=>({"data-idx":String(t)}),render:e=>jt(e.totalPoeng)}]})}function Nt(e){return e.length===0?I(`Ingen lag funnet.`):L({rows:e,rowClass:`nc-lag-rad`,rowAttrs:(e,t)=>({"data-lag-idx":String(t)}),detailRowClass:`nc-lag-detalj-rad d-none`,detailRow:e=>L({rows:e.bidragsytere,tableClass:`detalj-tabell`,showHeader:!1,columns:[{label:``,render:e=>a(e.kaster)},{label:``,cellClass:`nc-td-poeng`,render:e=>l(e.sum)}]}),columns:[{label:`Pl.`,thClass:`nc-td-pl`,cellClass:`nc-td-pl`,render:e=>String(e.plassering)},{label:`Klubb`,render:e=>e.klubb?.navn??`–`},{label:`Poeng`,thClass:`nc-td-poeng`,cellClass:`nc-td-poeng nc-lag-poeng-celle`,cellAttrs:(e,t)=>({"data-lag-idx":String(t)}),render:e=>jt(e.lagTotal)}]})}function Pt(e,t){return`
    <div class="nc-side">
      <h1 class="nc-hovudtittel">Norgescupen ${e}</h1>
      <div class="nc-filter-rad">
        <select id="nc-ar" class="tl-select">${ae(e,Tt)}</select>
        <select id="nc-cuptype" class="tl-select${e<Et?` d-none`:``}">
          <option value="NC"${t===`NC`?` selected`:``}>NC</option>
          <option value="SNC"${t===`SNC`?` selected`:``}>SNC</option>
          <option value="DNC"${t===`DNC`?` selected`:``}>DNC (Uoffisiell)</option>
        </select>
      </div>
      <div id="nc-visning-tabs-container"></div>
      <div id="nc-content"></div>
    </div>`}async function Ft(e){if(R.ar=new Date().getFullYear(),R.cupType=`NC`,R.klasse=1,R.visning=`singel`,z={ar:null,regler:null,stevner:[],resultater:[]},e.replaceChildren(k(`Laster Norgescupen...`)),!await Dt(R.ar)){e.replaceChildren(O(`Kunne ikkje laste data for Norgescupen.`));return}e.innerHTML=Pt(R.ar,R.cupType);function t(){let{ar:n,cupType:r,klasse:i,visning:a}=R,{regler:o}=z,s=e.querySelector(`#nc-content`);if(e.querySelector(`.nc-hovudtittel`).textContent=`Norgescupen ${n}`,e.querySelector(`#nc-cuptype`).classList.toggle(`d-none`,n<Et),e.querySelector(`#nc-visning-tabs-container`).innerHTML=r===`NC`?kt(a):``,a===`lag`&&r===`NC`){s.innerHTML=`
        <section>
          <h2 class="nc-seksjon-tittel">NC Lag ${n} (Kun klasse 1)</h2>
          <p class="nc-beskriving">Dei 4 beste poengsummene frå kvar klubb.</p>
          <div class="nc-klikk-hint nc-klikk-hint-rad">Klikk poengsum for å vise detaljar</div>
          <div id="nc-lag-tabell-container"></div>
        </section>`;let e=s.querySelector(`#nc-lag-tabell-container`);if(!o)e.replaceChildren(I(`Ingen data.`));else{let t=v(z.resultater,z.stevner,o);e.replaceChildren(Nt(t)),Ct(e,{triggerSel:`.nc-lag-poeng-celle`,idAttr:`lag-idx`,detailSel:`.nc-lag-detalj-rad`,lookupRoot:s})}}else{s.innerHTML=`
        <section id="nc-singel-seksjon">
          <h2 class="nc-seksjon-tittel">${r} Singel ${n} - Klasse ${i}</h2>
          <p class="nc-beskriving">${o?Ot(o,r):`Ingen telleregel funnet for ${n}`}</p>
          <div id="nc-klasse-tabs-container">${At(i,n)}</div>
          <div id="nc-singel-tabell-container"></div>
        </section>`;let e=s.querySelector(`#nc-singel-tabell-container`);if(!o)e.replaceChildren(I(`Ingen data.`));else{let t=_(z.resultater,z.stevner,o,r,i);e.replaceChildren(Mt(t)),Ct(e,{triggerSel:`.nc-poeng-celle`,idAttr:`idx`,detailSel:`.nc-detalj-rad`,lookupRoot:s})}s.querySelector(`#nc-singel-seksjon`).addEventListener(`click`,e=>{let n=e.target.closest(`[data-klasse]`);n&&(R.klasse=Number(n.dataset.klasse),t())})}}t(),e.querySelector(`#nc-ar`).addEventListener(`change`,async n=>{if(R.ar=Number(n.target.value),R.klasse=1,R.ar<Et&&(R.cupType=`NC`,R.visning=`singel`,e.querySelector(`#nc-cuptype`).value=`NC`),e.querySelector(`#nc-content`).replaceChildren(k()),!await Dt(R.ar)){e.querySelector(`#nc-content`).replaceChildren(O(`Feil ved henting av data.`));return}t()}),e.querySelector(`#nc-cuptype`).addEventListener(`change`,e=>{R.cupType=e.target.value,R.klasse=1,R.cupType!==`NC`&&(R.visning=`singel`),t()}),e.querySelector(`#nc-visning-tabs-container`).addEventListener(`click`,e=>{let n=e.target.closest(`[data-visning]`);n&&(R.visning=n.dataset.visning,t())})}y.from(`stevne`).select(`id, navn, dato, stevnetype:stevnetypeid(id, navn), innledendekastemetode:kastemetode!innledendekastemetodeid(navn), avsluttendekastemetode:kastemetode!avsluttendekastemetodeid(navn)`),y.from(`resultat`).select(`
    id, kasterid, klubbid, stevneid,
    antall_ring_xkast, antall_ring_kongelag,
    kaster:kasterid(id, fornavn, etternavn),
    klubb:klubbid(id, navn)
  `);async function It(e){let{data:t,error:n}=await y.from(`stevne`).select(`id, navn, dato, stevnetype:stevnetypeid(id, navn), innledendekastemetode:kastemetode!innledendekastemetodeid(navn), avsluttendekastemetode:kastemetode!avsluttendekastemetodeid(navn)`).eq(`ernorgesranking`,!0).gte(`dato`,`${e}-01-01`).lte(`dato`,`${e}-12-31`);if(n)return b(`hentStevnerOgResultater.stevner`,n),{stevner:[],resultater:[],error:n};let r=t??[],i=r.map(e=>e.id);if(i.length===0)return{stevner:r,resultater:[],error:null};let{data:a,error:o}=await y.from(`resultat`).select(`
      id, kasterid, klubbid, stevneid,
      antall_ring_xkast, antall_ring_kongelag,
      kaster:kasterid(id, fornavn, etternavn),
      klubb:klubbid(id, navn)
    `).in(`stevneid`,i);return o?(b(`hentStevnerOgResultater.resultater`,o),{stevner:r,resultater:[],error:o}):{stevner:r,resultater:(a??[]).filter(e=>e.antall_ring_xkast!=null||e.antall_ring_kongelag!=null),error:null}}var Lt=2018,Rt=5,zt=new Intl.NumberFormat(`nb-NO`,{minimumFractionDigits:2,maximumFractionDigits:2}),B={ar:new Date().getFullYear(),sokeTekst:``,infoSynleg:!1},V={ar:null,stevner:[],resultater:[]};function Bt(e){return e==null?`–`:zt.format(e)+` %`}async function Vt(e){if(V.ar===e)return!0;try{let{stevner:t,resultater:n,error:r}=await It(e);return r?!1:(V.ar=e,V.stevner=t,V.resultater=n,!0)}catch(e){return b(`hentOgBufferData`,e),!1}}function Ht(){let e=new Map;for(let t of V.stevner)e.set(t.id,{navn:t.navn,dato:t.dato,typeNamn:t.stevnetype?.navn??``,innledMetode:t.innledendekastemetode?.navn??null,avslMetode:t.avsluttendekastemetode?.navn??null});return e}function Ut(e,t){let n=(t?.innledMetode??``).toLowerCase(),r=(t?.avslMetode??``).toLowerCase(),i=e=>n===e||r===e,a={_stevne:t},o=[];return e.antall_ring_xkast!=null&&(i(`minimatch`)?o.push({...a,prosent:e.antall_ring_xkast/60*100,metodeNamn:`Minimatch`,antallRing:e.antall_ring_xkast}):i(`halvmatch`)?o.push({...a,prosent:e.antall_ring_xkast,metodeNamn:`Halvmatch`,antallRing:e.antall_ring_xkast}):i(`heilmatch`)&&o.push({...a,prosent:e.antall_ring_xkast/200*100,metodeNamn:`Heilmatch`,antallRing:e.antall_ring_xkast})),e.antall_ring_kongelag!=null&&o.push({...a,prosent:e.antall_ring_kongelag/40*100,metodeNamn:`Kongelag`,antallRing:e.antall_ring_kongelag}),o}function Wt(e){let t=1;for(let n=0;n<e.length;n++)n>0&&e[n].snittProsent<e[n-1].snittProsent&&(t=n+1),e[n].plassering=t}function Gt(e,t){let n=new Map;for(let r of e){if(r.kasterid==null)continue;let e=Ut(r,r.stevneid==null?void 0:t.get(r.stevneid));if(e.length){n.has(r.kasterid)||n.set(r.kasterid,{kaster:r.kaster,klubb:r.klubb,rader:[]});for(let t of e)n.get(r.kasterid).rader.push(t)}}let r=[],i=[];for(let[,e]of n){let{rader:t}=e,n=[...t].sort((e,t)=>t.prosent-e.prosent),o=n.slice(0,Rt),s=Math.round(o.reduce((e,t)=>e+t.prosent,0)/o.length*100)/100,c=t.length,l=c>=Rt,u={navn:a(e.kaster),klubb:e.klubb?.navn??`–`,antallStevner:c,snittProsent:s,erGyldig:l,detaljRader:n};l?r.push(u):i.push(u)}return r.sort((e,t)=>t.snittProsent-e.snittProsent||e.navn.localeCompare(t.navn)),i.sort((e,t)=>t.snittProsent-e.snittProsent||e.navn.localeCompare(t.navn)),Wt(r),[...r,...i]}function Kt(){let e=Ht();ie(Gt(V.resultater,e).map(e=>({Plass:e.erGyldig?e.plassering:`–`,Kaster:e.navn,Klubb:e.klubb,"Snitt %":e.snittProsent,"Antal stevner":e.antallStevner})),`norgesranking-${B.ar}.xlsx`,`Norgesranking`)}function qt(e){return`
    <div id="nr-info-seksjon"${e?``:` class="d-none"`}>
      <p class="nc-info-tekst">
        Norgesranking er ein konkurranse som pågår innanfor eit kalenderår, dvs. 1. januar – 31. desember.
        <strong>Dei ${Rt} beste prosentane er teljande.</strong>
      </p>
      <p class="nc-info-tekst">
        For å få eit gyldig årsresultat skal kasteren minst ha vore gjennom ${Rt} rankingrunder.
      </p>
      <p class="nc-info-tekst nc-info-tekst--advarsel">
        Resultater merket med rødt er ikkje gyldig (mindre enn ${Rt} runder).
      </p>
    </div>`}function Jt(e,t){let n=t.trim().toLowerCase(),r=n?e.filter(e=>e.navn.toLowerCase().includes(n)||e.klubb.toLowerCase().includes(n)):e;return r.length===0?I(`Ingen resultater funnet.`):L({rows:r,rowClass:e=>e.erGyldig?`nc-singel-rad`:`nc-singel-rad nc-rad--ugyldig`,rowAttrs:(e,t)=>({"data-idx":String(t)}),detailRowClass:`nc-detalj-rad d-none`,detailRow:e=>L({rows:e.detaljRader,tableClass:`detalj-tabell`,theadClass:``,columns:[{label:`Dato`,render:e=>E(e._stevne?.dato)},{label:`Type`,render:e=>e._stevne?.typeNamn??`–`},{label:`Stevne`,render:e=>e._stevne?.navn??`–`},{label:`Metode`,render:e=>e.metodeNamn},{label:`Ring`,render:e=>String(e.antallRing)},{label:`%Ring`,render:e=>Bt(e.prosent)}]}),columns:[{label:`Pl.`,thClass:`nc-td-pl`,cellClass:`nc-td-pl`,render:e=>e.erGyldig?String(e.plassering??`–`):`–`},{label:`Navn`,render:e=>e.navn},{label:`Klubb`,render:e=>e.klubb},{label:`Stevner`,thClass:`nc-td-sentrum`,cellClass:`nc-td-sentrum`,render:e=>String(e.antallStevner)},{label:`%Snitt`,thClass:`nc-td-poeng`,cellClass:`nc-td-poeng nc-poeng-celle`,cellAttrs:(e,t)=>({"data-idx":String(t)}),render:e=>{let t=document.createDocumentFragment();t.appendChild(document.createTextNode(Bt(e.snittProsent)));let n=document.createElement(`span`);return n.className=`nc-chevron`,n.textContent=` ▼`,t.appendChild(n),t}}]})}function Yt(e){return`
    <div class="nc-side">
      <h1 class="nc-hovudtittel">Norgesranking ${e}</h1>
      <div class="nc-info-knapp-rad">
        <button id="nr-info-knapp" class="btn btn-sm btn-outline-secondary">Vis info</button>
      </div>
      <hr>
      ${qt(!1)}
      <hr>
      <div class="nc-filter-rad">
        <select id="nr-ar" class="tl-select">${ae(e,Lt)}</select>
        <input id="nr-sok" type="text" class="tl-select" placeholder="Søk på navn/klubb..." value="">
        <button class="tl-excel-knapp" id="nr-excel">⬇ Excel</button>
      </div>
      <div class="nc-klikk-hint-rad">
        <span class="nc-klikk-hint">Klikk prosent for å vise detaljer</span>
      </div>
      <div id="nr-tabell-container"></div>
    </div>`}async function Xt(e){B.ar=new Date().getFullYear(),B.sokeTekst=``,B.infoSynleg=!1,V={ar:null,stevner:[],resultater:[]},e.replaceChildren(k(`Laster Norgesranking…`));try{if(!await Vt(B.ar)){e.replaceChildren(O(`Kunne ikkje laste data for Norgesranking.`));return}e.innerHTML=Yt(B.ar);function t(){let t=Ht(),n=Gt(V.resultater,t),r=e.querySelector(`#nr-tabell-container`),i=document.createElement(`div`);i.id=`nr-tabell-inner`,i.appendChild(Jt(n,B.sokeTekst)),r.replaceChildren(i),Ct(i,{triggerSel:`.nc-poeng-celle`,idAttr:`idx`,detailSel:`.nc-detalj-rad`})}t();let n=e.querySelector(`#nr-ar`),r=e.querySelector(`#nr-sok`),i=e.querySelector(`#nr-excel`),a=e.querySelector(`#nr-info-knapp`);n.addEventListener(`change`,async()=>{B.ar=Number(n.value),B.sokeTekst=``,r.value=``,e.querySelector(`.nc-hovudtittel`).textContent=`Norgesranking ${B.ar}`,e.querySelector(`#nr-tabell-container`).replaceChildren(k(`Laster...`));try{if(!await Vt(B.ar)){e.querySelector(`#nr-tabell-container`).replaceChildren(O(`Feil ved henting av data.`));return}t()}catch(t){b(`norgesranking.arChange`,t),e.querySelector(`#nr-tabell-container`).replaceChildren(O(`Feil ved henting av data.`))}}),r.addEventListener(`input`,()=>{B.sokeTekst=r.value,t()}),i.addEventListener(`click`,Kt),a.addEventListener(`click`,()=>{B.infoSynleg=!B.infoSynleg,e.querySelector(`#nr-info-seksjon`).classList.toggle(`d-none`,!B.infoSynleg),a.textContent=B.infoSynleg?`Skjul info`:`Vis info`})}catch(t){b(`norgesranking.render`,t),e.replaceChildren(O(`Kunne ikkje laste Norgesranking.`))}}y.from(`kaster`).select(`id, fornavn, etternavn, avatarurl, medlemsnummer, klasse:klasseid(id, navn)`),y.from(`kaster`).select(`id, fornavn, etternavn, eraktiv, avatarurl, klubb:klubbid(id, navn)`),y.from(`kaster`).select(`id, fornavn, etternavn, eraktiv, avatarurl, medlemsnummer, klubbid, klubb:klubbid(id, navn), klasse:klasseid(id, navn)`),y.from(`kaster`).select(`id, fornavn, etternavn, klubb:klubbid(navn)`),y.from(`resultat`).select(`
  id, plassering, poeng_kongelag, poeng_xkast, antall_ring_kongelag, antall_ring_xkast,
  klubb:klubbid(id, navn),
  stevne:stevneid(id, navn, dato, stevnetype:stevnetypeid(id, navn), innledendekastemetode:kastemetode!stevne_innledendekastemetodeid_fkey(navn), avsluttendekastemetode:kastemetode!stevne_avsluttendekastemetodeid_fkey(navn))
`);var Zt=null,Qt=null,$t=new Map,en=new Map,tn=new Map;async function nn(e){if($t.has(e))return $t.get(e);let{data:t,error:n}=await y.from(`kaster`).select(`id, fornavn, etternavn, avatarurl, medlemsnummer, klasse:klasseid(id, navn)`).eq(`klubbid`,e).eq(`eraktiv`,!0).order(`etternavn`).order(`fornavn`);n&&b(`hentKlubbMedlemmar`,n);let r={data:t??[],error:n};return $t.set(e,r),r}async function rn(){if(Zt)return{data:Zt,error:null};let{data:e,error:t}=await y.from(`kaster`).select(`id, fornavn, etternavn, eraktiv, avatarurl, klubb:klubbid(id, navn)`).eq(`eraktiv`,!0).order(`etternavn`).order(`fornavn`);return t&&b(`hentKastereListeAktive`,t),Zt=e??[],{data:Zt,error:t}}async function an(){if(Qt)return{data:Qt,error:null};let{data:e,error:t}=await y.from(`kaster`).select(`id, fornavn, etternavn, eraktiv, avatarurl, klubb:klubbid(id, navn)`).order(`etternavn`).order(`fornavn`);return t&&b(`hentKastereListeAlle`,t),Qt=e??[],{data:Qt,error:t}}async function on(e){if(en.has(e))return en.get(e);let[t,n]=await Promise.all([y.from(`kaster`).select(`id, fornavn, etternavn, eraktiv, avatarurl, medlemsnummer, klubbid, klubb:klubbid(id, navn), klasse:klasseid(id, navn)`).eq(`id`,e).single(),y.from(`resultat`).select(`
        id, plassering, poeng_kongelag, poeng_xkast, antall_ring_kongelag, antall_ring_xkast,
        klubb:klubbid(id, navn),
        stevne:stevneid(id, navn, dato, stevnetype:stevnetypeid(id, navn), innledendekastemetode:kastemetode!stevne_innledendekastemetodeid_fkey(navn), avsluttendekastemetode:kastemetode!stevne_avsluttendekastemetodeid_fkey(navn))
      `).eq(`kasterid`,e)]),r=t.error||n.error;r&&b(`hentKasterDetalj`,r);let i=(n.data??[]).filter(e=>e.stevne?.dato).sort((e,t)=>(t.stevne?.dato??``).localeCompare(e.stevne?.dato??``)),a={kaster:t.data,resultater:i,error:r};return en.set(e,a),a}async function sn(e){let{data:t,error:n}=await y.from(`kaster`).select(`id, fornavn, etternavn, eraktiv, avatarurl, klubb:klubbid(id, navn)`).in(`klubbid`,e).eq(`eraktiv`,!0).order(`etternavn`).order(`fornavn`);return n&&b(`hentKastereForKlubbar`,n),{data:t??[],error:n}}async function cn(e){if(tn.has(e))return tn.get(e);let{data:t,error:n}=await y.from(`kaster`).select(`id, fornavn, etternavn, klubb:klubbid(navn)`).eq(`id`,e).single();n&&b(`hentKasterForKobling`,n);let r={data:t,error:n};return tn.set(e,r),r}async function ln(){let{data:e,error:t}=await y.from(`klasse`).select(`id, navn`).order(`navn`);return t&&b(`hentKlassar`,t),{data:e??[],error:t}}async function un(){let{data:e,error:t}=await y.from(`kjonn`).select(`id, navn`).order(`id`);return t&&b(`hentKjonn`,t),{data:e??[],error:t}}async function dn(e){if(!e.length)return{data:[],error:null};let{data:t,error:n}=await y.from(`kaster`).select(`id, fornavn, etternavn, klubb:klubbid(navn)`).in(`id`,e);return n&&b(`hentKastereByIds`,n),{data:t??[],error:n}}async function fn(e){let{data:t,error:n}=await y.from(`kaster`).select(`id, fornavn, etternavn, kjonnid, klasseid, klubbid, epost, telefon, medlemsnummer, eraktiv`).eq(`id`,e).single();return n&&b(`hentKasterForAdmin`,n),{data:t,error:n}}async function pn(e){let{data:t,error:n}=await y.from(`kaster`).insert(e).select(`id`).single();return n&&b(`opprettKaster`,n),{data:t,error:n}}async function mn(e,t){let{data:n,error:r}=await y.from(`kaster`).update(t).eq(`id`,e).select(`id`).single();return r&&b(`oppdaterKaster`,r),{data:n,error:r}}async function hn(e){let{error:t}=await y.from(`kaster`).delete().eq(`id`,e);return t&&b(`slettKaster`,t),{error:t}}var gn=24,_n=`https://placehold.co/200x200/444/888?text=?`,H={visAlle:!1,sokeTekst:``,side:1};function vn(e){let t=a(e);return`
    <a href="#/kastere/${s(e)}" class="kaster-kort">
      <img src="${A(e.avatarurl||_n)}" alt="${A(t)}" loading="lazy">
      <div class="kaster-navn">${A(t)}</div>
      <div class="kaster-klubb">${A(e.klubb?.navn??`–`)}</div>
    </a>`}function yn(){return`
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
    </div>`}function bn(e,t){if(t<=1)return``;let n=(t,n,r)=>`<button class="btn btn-sm ${n===e?`btn-primary`:`btn-outline-secondary`} pag-knapp"
      data-side="${n}" ${r?`disabled`:``}>${t}</button>`;return`
    <div class="kaster-paginering">
      ${n(`«`,1,e===1)}
      ${n(`‹`,e-1,e===1)}
      <span class="pag-info">side ${e} av ${t}</span>
      ${n(`›`,e+1,e===t)}
      ${n(`»`,t,e===t)}
    </div>`}async function xn(e){H.side=1,e.replaceChildren(k(`Laster utøvarar...`));try{let t=await rn();if(t.error){e.replaceChildren(O(`Kunne ikkje laste utøvarar.`));return}let n=t.data;e.innerHTML=yn();let r=e.querySelector(`#kaster-grid`),i=e.querySelector(`#kaster-sideinfo`),o=e.querySelector(`#kaster-paginering-topp`),s=e.querySelector(`#kaster-paginering-botn`),c=e.querySelector(`#kaster-sok`),l=e.querySelector(`#kaster-berre-aktive`);function u(){let e=H.sokeTekst.trim().toLowerCase(),t=n;e&&(t=t.filter(t=>a(t).toLowerCase().includes(e)||(t.klubb?.navn??``).toLowerCase().includes(e)));let c=t.length,l=Math.max(1,Math.ceil(c/gn));H.side>l&&(H.side=1);let u=(H.side-1)*gn,d=t.slice(u,u+gn);i.innerHTML=`side ${H.side} av ${l}`;let f=bn(H.side,l);o.innerHTML=f,s.innerHTML=f,r.innerHTML=d.map(vn).join(``)}u(),c.addEventListener(`input`,()=>{H.sokeTekst=c.value,H.side=1,u()}),l.addEventListener(`change`,async()=>{H.visAlle=!l.checked,H.side=1;let{data:e,error:t}=H.visAlle?await an():await rn();t||(n=e),u()}),e.addEventListener(`click`,t=>{let n=t.target.closest(`.pag-knapp`);!n||n.disabled||(H.side=Number(n.dataset.side),u(),e.querySelector(`.nc-side`)?.scrollIntoView({behavior:`smooth`}))}),j().then(t=>{if(!t?.profil||t.profil.rolle!==`admin`&&t.profil.rolle!==`klubbadmin`)return;let n=document.createElement(`div`);n.className=`mb-2 px-2`,n.innerHTML=`<a href="#/kaster/ny" class="btn btn-sm btn-success">+ Ny utøvar</a>`,e.querySelector(`.nc-side`)?.prepend(n)})}catch(t){b(`renderListe`,t),e.replaceChildren(O(`Kunne ikkje laste utøvarar.`))}}i.register(...r);var Sn=2017,Cn={kongelag:40,minimatch:60,halvmatch:100,heilmatch:200},U={aktiv:`resultater`,ar:`alle`,stevnetype:`alle`,grafMetrikk:`plassering`,grafMetode:`kongelag`,grafFra:null,grafTil:null},wn=null,Tn=new Intl.NumberFormat(`nb-NO`,{minimumFractionDigits:2,maximumFractionDigits:2});function En(e){return e==null?`–`:Tn.format(e)+` %`}function Dn(e){return e?parseInt(e.substring(0,4)):null}function On(e){return e.length?Math.round(e.reduce((e,t)=>e+t,0)/e.length):null}function kn(){wn&&=(wn.destroy(),null)}function An(e,t){let n=(e.stevne?.innledendekastemetode?.navn??``).toLowerCase(),r=(e.stevne?.avsluttendekastemetode?.navn??``).toLowerCase();return n===t||r===t}function jn(e){return[{label:`Kongelag`,rader:e.filter(e=>e.poeng_kongelag!=null),poengFn:e=>e.poeng_kongelag,ringFn:e=>e.antall_ring_kongelag,maxRing:Cn.kongelag},{label:`Minimatch`,rader:e.filter(e=>e.poeng_xkast!=null&&An(e,`minimatch`)),poengFn:e=>e.poeng_xkast,ringFn:e=>e.antall_ring_xkast,maxRing:Cn.minimatch},{label:`Halvmatch`,rader:e.filter(e=>e.poeng_xkast!=null&&An(e,`halvmatch`)),poengFn:e=>e.poeng_xkast,ringFn:e=>e.antall_ring_xkast,maxRing:Cn.halvmatch},{label:`Heilmatch`,rader:e.filter(e=>e.poeng_xkast!=null&&An(e,`heilmatch`)),poengFn:e=>e.poeng_xkast,ringFn:e=>e.antall_ring_xkast,maxRing:Cn.heilmatch}].map(({label:e,rader:t,poengFn:n,ringFn:r,maxRing:i})=>{let a=t.length?Math.max(...t.map(e=>n(e))):null,o=On(t.map(e=>n(e))),s=t.filter(e=>r(e)!=null&&(Dn(e.stevne?.dato)??0)>=Sn);return{label:e,rekord:a,snittPoeng:o,snittProsent:s.length?Math.round(s.reduce((e,t)=>e+r(t)/i*100,0)/s.length*100)/100:null}})}function Mn(e,t){let n=new Map;for(let r of e)r.klubb?.id&&r.klubb.id!==t&&n.set(r.klubb.id,r.klubb.navn);return[...n.values()]}function Nn(e,t,n){return t===`plassering`?e.plassering??null:n===`kongelag`?e.antall_ring_kongelag==null?null:Math.round(e.antall_ring_kongelag/Cn.kongelag*1e4)/100:An(e,n)?e.antall_ring_xkast==null?null:Math.round(e.antall_ring_xkast/Cn[n]*1e4)/100:null}function Pn(e,t,n,r,i){let a=[...e].filter(e=>{let a=Dn(e.stevne?.dato);return r&&(a??0)<r||i&&(a??0)>i?!1:Nn(e,t,n)!=null}).sort((e,t)=>(e.stevne?.dato??``).localeCompare(t.stevne?.dato??``));return{labels:a.map(e=>E(e.stevne?.dato)),stevneNamn:a.map(e=>e.stevne?.navn??``),verdiar:a.map(e=>Nn(e,t,n))}}function Fn(e,t){let n=A(a(e)),r=e.medlemsnummer?` ${e.medlemsnummer}`:``,i=[...new Set(t.map(e=>Dn(e.stevne?.dato)).filter(e=>e!==null))].sort((e,t)=>t-e),o=[...new Map(t.map(e=>e.stevne?.stevnetype).filter(e=>e!=null).map(e=>[e.id,e.navn])).entries()].sort((e,t)=>e[1].localeCompare(t[1])),s=U.grafMetrikk===`prosent`?``:` d-none`;return`
    <div class="nc-side">
      <div class="mb-3">
        <a href="#/kastere" class="btn btn-sm btn-outline-secondary">← Tilbake</a>
      </div>
      <h1 class="kaster-detalj-tittel">${n}${A(r)}</h1>
      <p class="kaster-detalj-klubb">${A(e.klubb?.navn??`–`)}</p>

      <div class="kaster-tab-rad">
        <button class="btn btn-sm kaster-tab-knapp${U.aktiv===`resultater`?` active`:``}" data-tab="resultater">Resultat</button>
        <button class="btn btn-sm kaster-tab-knapp${U.aktiv===`statistikk`?` active`:``}" data-tab="statistikk">Statistikk</button>
        <button class="btn btn-sm kaster-tab-knapp${U.aktiv===`graf`?` active`:``}" data-tab="graf">Vis graf</button>
      </div>
      <hr>

      <div id="kd-tab-resultater" class="kd-tab${U.aktiv===`resultater`?``:` kd-skjult`}">
        <div class="nc-filter-rad mb-3">
          <select id="kd-ar" class="tl-select">
            <option value="alle">Vel årstal</option>
            ${i.map(e=>`<option value="${e}"${U.ar==String(e)?` selected`:``}>${e}</option>`).join(``)}
          </select>
          <select id="kd-type" class="tl-select">
            <option value="alle">Alle stevnetypar</option>
            ${o.map(([e,t])=>`<option value="${e}">${A(t)}</option>`).join(``)}
          </select>
        </div>
        <div id="kd-resultat-tabell"></div>
      </div>

      <div id="kd-tab-statistikk" class="kd-tab${U.aktiv===`statistikk`?``:` kd-skjult`}">
        <div id="kd-stat-innhald"></div>
      </div>

      <div id="kd-tab-graf" class="kd-tab${U.aktiv===`graf`?``:` kd-skjult`}">
        <div class="nc-filter-rad mb-3">
          <select id="kd-graf-metrikk" class="tl-select">
            <option value="plassering"${U.grafMetrikk===`plassering`?` selected`:``}>Plassering</option>
            <option value="prosent"${U.grafMetrikk===`prosent`?` selected`:``}>% Ring (frå 2017)</option>
          </select>
          <select id="kd-graf-metode" class="tl-select${s}">
            <option value="kongelag"${U.grafMetode===`kongelag`?` selected`:``}>Kongelag</option>
            <option value="minimatch"${U.grafMetode===`minimatch`?` selected`:``}>Minimatch</option>
            <option value="halvmatch"${U.grafMetode===`halvmatch`?` selected`:``}>Halvmatch</option>
            <option value="heilmatch"${U.grafMetode===`heilmatch`?` selected`:``}>Heilmatch</option>
          </select>
          <select id="kd-graf-fra" class="tl-select">
            <option value="">Frå år</option>
            ${i.map(e=>`<option value="${e}"${U.grafFra==String(e)?` selected`:``}>${e}</option>`).join(``)}
          </select>
          <select id="kd-graf-til" class="tl-select">
            <option value="">Til år</option>
            ${i.map(e=>`<option value="${e}"${U.grafTil==String(e)?` selected`:``}>${e}</option>`).join(``)}
          </select>
        </div>
        <div class="kaster-graf-wrapper">
          <canvas id="kd-graf-canvas"></canvas>
        </div>
      </div>
    </div>`}function In(e,t,n){let r=e;t!==`alle`&&(r=r.filter(e=>String(Dn(e.stevne?.dato))===t)),n!==`alle`&&(r=r.filter(e=>String(e.stevne?.stevnetype?.id)===n));let i=r.length,a=`
    <div class="kaster-resultat-info">
      <span>Antal: <strong>${i}</strong></span>
      <span class="kaster-resultat-hint">Antal ringar i parentes (frå ${Sn})</span>
    </div>`;if(!i)return a+`<p class="empty-state">Ingen resultat funnet.</p>`;let o=(e,t)=>e==null?``:t==null?`${e}`:`${e} (${t})`;return a+`
    <div class="table-responsive">
      <table class="app-tabell">
        <thead class="app-thead">
          <tr>
            <th>Dato</th><th>Stevne</th><th>Type</th><th>Klubb</th>
            <th>Pl.</th><th>Kongelag</th><th>X-kast</th>
          </tr>
        </thead>
        <tbody>${r.map(e=>{let t=e.stevne,n=t?.id?`<a href="#/stevne/${t.id}/resultat" class="tl-lenkje">${A(t.navn??``)}</a>`:A(t?.navn??`–`);return`
      <tr>
        <td class="text-nowrap">${E(t?.dato)}</td>
        <td>${n}</td>
        <td>${A(t?.stevnetype?.navn??`–`)}</td>
        <td>${A(e.klubb?.navn??`–`)}</td>
        <td class="text-center fw-bold">${e.plassering??`–`}</td>
        <td class="text-center">${o(e.poeng_kongelag,e.antall_ring_kongelag)}</td>
        <td class="text-center">${o(e.poeng_xkast,e.antall_ring_xkast)}</td>
      </tr>`}).join(``)}</tbody>
      </table>
    </div>`}function Ln(e,t){let n=jn(e),r=Mn(e,t.klubb?.id??null);return`
    <div class="kaster-stat-grid">
      <div>
        <h4>Statistikk</h4>
        <table class="app-tabell">
          <thead class="app-thead">
            <tr>
              <th></th><th>Rekord</th><th>Snitt Poeng</th><th>% Ring (frå ${Sn})</th>
            </tr>
          </thead>
          <tbody>${n.map(({label:e,rekord:t,snittPoeng:n,snittProsent:r})=>`
    <tr>
      <td>${e}</td>
      <td class="text-center">${t??`–`}</td>
      <td class="text-center">${n??`–`}</td>
      <td class="text-center">${r==null?`–`:En(r)}</td>
    </tr>`).join(``)}</tbody>
        </table>
      </div>
      ${r.length?`<div class="kaster-tidlegare-klubbar">
        <h4 class="kaster-tidlegare-tittel">Tidlegare klubbar</h4>
        <ul class="list-unstyled">${r.map(e=>`<li>${A(e)}</li>`).join(``)}</ul>
      </div>`:``}
    </div>`}function Rn(e,t){kn();let{labels:n,stevneNamn:r,verdiar:a}=Pn(t,U.grafMetrikk,U.grafMetode,U.grafFra?Number(U.grafFra):null,U.grafTil?Number(U.grafTil):null);if(!a.length){let t=e.parentElement;if(t){let e=I(`Ingen data for valt filter.`);e.classList.add(`pt-3`),t.replaceChildren(e)}return}let o=U.grafMetrikk===`plassering`,s=o?`Plassering`:`% Ring`;wn=new i(e,{type:`line`,data:{labels:n,datasets:[{label:s,data:a,borderColor:`#4e8fc7`,backgroundColor:`rgba(78,143,199,0.15)`,pointBackgroundColor:`#4e8fc7`,pointRadius:4,tension:.1,fill:!1}]},options:{responsive:!0,maintainAspectRatio:!1,scales:{x:{ticks:{maxTicksLimit:14,maxRotation:45,color:`#ccc`},grid:{color:`rgba(255,255,255,0.08)`}},y:{reverse:o,ticks:{color:`#ccc`},grid:{color:`rgba(255,255,255,0.08)`},title:{display:!0,text:s,color:`#ccc`}}},plugins:{legend:{display:!1},tooltip:{callbacks:{title:e=>r[e[0].dataIndex]??n[e[0].dataIndex]??``,label:e=>`${s}: ${e.raw}`}}}}})}async function zn(e,t){U.aktiv=`resultater`,U.ar=`alle`,U.stevnetype=`alle`,U.grafMetrikk=`plassering`,U.grafMetode=`kongelag`,U.grafFra=null,U.grafTil=null,kn(),e.replaceChildren(k(`Laster utøvar...`));try{let{kaster:n,resultater:r,error:i}=await on(t);if(i||!n){e.replaceChildren(O(`Kunne ikkje laste utøvar.`));return}let a=n;e.innerHTML=Fn(a,r);let o=e.querySelector(`#kd-ar`),s=e.querySelector(`#kd-type`),c=e.querySelector(`#kd-graf-metode`);function l(){e.querySelector(`#kd-resultat-tabell`).innerHTML=In(r,U.ar,U.stevnetype)}function u(){e.querySelector(`#kd-stat-innhald`).innerHTML=Ln(r,a)}function d(){let t=e.querySelector(`#kd-graf-canvas`);t&&Rn(t,r)}function f(t){U.aktiv=t,e.querySelectorAll(`.kaster-tab-knapp`).forEach(e=>{e.classList.toggle(`active`,e.dataset.tab===t)}),e.querySelectorAll(`.kd-tab`).forEach(e=>{e.classList.toggle(`kd-skjult`,e.id!==`kd-tab-${t}`)}),t===`statistikk`&&u(),t===`graf`&&d()}l(),o.addEventListener(`change`,()=>{U.ar=o.value,l()}),s.addEventListener(`change`,()=>{U.stevnetype=s.value,l()}),e.querySelectorAll(`.kaster-tab-knapp`).forEach(e=>{e.addEventListener(`click`,()=>f(e.dataset.tab??``))});let p=e.querySelector(`#kd-graf-metrikk`);p.addEventListener(`change`,()=>{U.grafMetrikk=p.value,c.classList.toggle(`d-none`,p.value!==`prosent`),d()}),c.addEventListener(`change`,()=>{U.grafMetode=c.value,d()});let m=e.querySelector(`#kd-graf-fra`),h=e.querySelector(`#kd-graf-til`);m.addEventListener(`change`,()=>{U.grafFra=m.value||null,d()}),h.addEventListener(`change`,()=>{U.grafTil=h.value||null,d()}),j().then(n=>{if(!n?.profil||!(n.profil.rolle===`admin`||n.profil.rolle===`klubbadmin`&&n.klubber.includes(a.klubbid??-1)))return;let r=document.createElement(`div`);r.className=`mb-2 px-2`,r.innerHTML=`<a href="#/kaster/${t}/admin" class="btn btn-sm btn-warning">Rediger utøvar</a>`,e.querySelector(`.nc-side`)?.prepend(r)})}catch(t){b(`renderDetalj`,t),e.replaceChildren(O(`Kunne ikkje laste utøvar.`))}}var Bn=async(e,t)=>{kn(),t.id?await zn(e,Number(t.id)):await xn(e)},Vn=null;async function Hn(){if(Vn)return Vn;let{data:e,error:t}=await y.from(`klubb`).select(`id, navn, logourl`).eq(`eraktiv`,!0).order(`navn`);return t&&b(`hentKlubbar`,t),Vn={data:e??[],error:t},Vn}async function Un(e){let{data:t,error:n}=await y.from(`klubb`).select(`id, navn, logourl`).eq(`id`,e).single();return n&&b(`hentKlubbById`,n),{data:t,error:n}}async function Wn(e){let{data:t,error:n}=await y.from(`klubb`).select(`id, navn, kortnavn, logourl, eraktiv`).eq(`id`,e).single();return n&&b(`hentKlubbForAdmin`,n),{data:t,error:n}}async function Gn(e,t){let{error:n}=await y.from(`klubb`).update(t).eq(`id`,e);return n&&b(`oppdaterKlubb`,n),{error:n}}var Kn=`https://placehold.co/200x200/444/888?text=?`,qn={sokeTekst:``},Jn={sokeTekst:``};function Yn(e){return`
    <a href="#/klubber/${c(e)}" class="kaster-kort">
      <img src="${A(e.logourl||Kn)}" alt="${A(e.navn)}" loading="lazy">
      <div class="kaster-navn">${A(e.navn)}</div>
    </a>`}function Xn(){return`
    <div class="nc-side">
      <div class="kaster-liste-kontroller">
        <div class="nc-filter-rad">
          <input id="klubb-sok" type="text" class="tl-select" placeholder="Søk på klubbnavn eller utøvar" value="">
          <button id="klubb-sok-knapp" class="btn btn-secondary btn-sm">Søk</button>
        </div>
      </div>
      <div id="klubb-grid" class="kaster-grid"></div>
    </div>`}function Zn(e,t){return`
    <div class="nc-side">
      <div class="mb-3">
        <a href="#/klubber" class="btn btn-sm btn-outline-secondary">← Tilbake</a>
      </div>
      <div class="klubb-detalj-header">
        <img src="${A(e.logourl||Kn)}" alt="${A(e.navn)}" class="klubb-logo-stor">
        <h1 class="klubb-detalj-tittel">${A(e.navn)}</h1>
      </div>
      <h3 class="mb-2">Aktive utøvarar (${t})</h3>
      <div class="nc-filter-rad mb-3">
        <input id="klubb-detalj-sok" type="text" class="tl-select" placeholder="Søk på utøvar" value="">
        <button id="klubb-detalj-sok-knapp" class="btn btn-secondary btn-sm">Søk</button>
      </div>
      <div id="klubb-detalj-liste"></div>
    </div>`}function Qn(e,t){let n=t.trim().toLowerCase(),r=n?e.filter(e=>a(e).toLowerCase().includes(n)):e;if(!r.length)return I(`Ingen aktive utøvarar funnet.`);let i=document.createElement(`div`);return i.className=`table-responsive`,i.appendChild(L({rows:r,columns:[{label:`#`,render:(e,t)=>String(t+1)},{label:`Utøvar`,render:e=>{let t=document.createElement(`a`);return t.href=`#/kastere/${s(e)}`,t.className=`tl-lenkje`,t.textContent=a(e),t}},{label:`Klasse`,render:e=>e.klasse?.navn??`–`},{label:`Nr.`,render:e=>String(e.medlemsnummer??`–`)}]})),i}async function $n(e){e.replaceChildren(k(`Laster klubbar...`));try{let[{data:t,error:n},{data:r}]=await Promise.all([Hn(),rn()]);if(n){e.replaceChildren(O(`Kunne ikkje laste klubbar.`));return}let i=new Map;for(let e of r)e.klubb?.id&&(i.has(e.klubb.id)||i.set(e.klubb.id,[]),i.get(e.klubb.id).push(a(e).toLowerCase()));e.innerHTML=Xn();let o=e.querySelector(`#klubb-grid`),s=e.querySelector(`#klubb-sok`);function c(){let e=qn.sokeTekst.trim().toLowerCase(),n=e?t.filter(t=>t.navn.toLowerCase().includes(e)||(i.get(t.id)??[]).some(t=>t.includes(e))):t;o.innerHTML=n.length?n.map(Yn).join(``):`<p class="empty-state">Ingen klubbar funnet.</p>`}c(),s.addEventListener(`keydown`,e=>{e.key===`Enter`&&(qn.sokeTekst=s.value,c())}),e.querySelector(`#klubb-sok-knapp`).addEventListener(`click`,()=>{qn.sokeTekst=s.value,c()}),j().then(t=>{if(t?.profil?.rolle!==`admin`)return;let n=document.createElement(`div`);n.className=`mb-2 px-2`,n.innerHTML=`<a href="#/klubber/ny" class="btn btn-sm btn-success">+ Ny klubb</a>`,e.querySelector(`.nc-side`)?.prepend(n)})}catch(t){b(`renderListe`,t),e.replaceChildren(O(`Kunne ikkje laste klubbar.`))}}async function er(e,t){Jn.sokeTekst=``,e.replaceChildren(k(`Laster klubb...`));try{let[n,{data:r}]=await Promise.all([Un(t),nn(t)]);if(n.error||!n.data){e.replaceChildren(O(`Kunne ikkje laste klubb.`));return}let i=n.data;e.innerHTML=Zn(i,r.length);let a=e.querySelector(`#klubb-detalj-liste`),o=e.querySelector(`#klubb-detalj-sok`);function s(){a.replaceChildren(Qn(r,Jn.sokeTekst))}s(),o.addEventListener(`keydown`,e=>{e.key===`Enter`&&(Jn.sokeTekst=o.value,s())}),e.querySelector(`#klubb-detalj-sok-knapp`).addEventListener(`click`,()=>{Jn.sokeTekst=o.value,s()}),j().then(n=>{if(!n?.profil||!(n.profil.rolle===`admin`||n.profil.rolle===`klubbadmin`&&n.klubber.includes(t)))return;let r=document.createElement(`div`);r.className=`mb-2 px-2`,r.innerHTML=`<a href="#/klubber/${t}/admin" class="btn btn-sm btn-warning">Rediger klubb</a>`,e.querySelector(`.nc-side`)?.prepend(r)})}catch(t){b(`renderDetalj`,t),e.replaceChildren(O(`Kunne ikkje laste klubb.`))}}var tr=async(e,t)=>{t.id?await er(e,Number(t.id)):await $n(e)};y.from(`kaster_rekorder`).select(`metode, poeng, kasterid, fornavn, etternavn, kjonn_navn, klubb_navn, stevne_id, stevne_navn, ar`);var nr=null;async function rr(){if(nr)return{data:nr,error:null};let{data:e,error:t}=await y.from(`kaster_rekorder`).select(`metode, poeng, kasterid, fornavn, etternavn, kjonn_navn, klubb_navn, stevne_id, stevne_navn, ar`);return t?(b(`hentAlleRekorder`,t),{data:[],error:t}):(nr=e,{data:e,error:null})}var ir=[{verdi:`kongelag`,label:`Kongelag`,maxPoeng:200},{verdi:`minimatch`,label:`Minimatch`,maxPoeng:300},{verdi:`halvmatch`,label:`Halvmatch`,maxPoeng:500},{verdi:`heilmatch`,label:`Heilmatch`,maxPoeng:1e3}],W={metode:`kongelag`,kjonn:`alle`,sokeTekst:``};function ar(e){return(e.kjonn_navn??``).toLowerCase().includes(`dame`)}function or(e){let t=W.sokeTekst.trim().toLowerCase(),n=e.filter(e=>{if(e.metode!==W.metode||W.kjonn===`damer`&&!ar(e)||W.kjonn===`herrer`&&ar(e))return!1;if(t){let n=a({fornavn:e.fornavn??``,etternavn:e.etternavn??``}).toLowerCase(),r=(e.klubb_navn??``).toLowerCase();if(!n.includes(t)&&!r.includes(t))return!1}return!0});n.sort((e,t)=>(t.poeng??0)-(e.poeng??0));let r=1;return n.map((e,t)=>(t>0&&(e.poeng??0)<(n[t-1].poeng??0)&&(r=t+1),{...e,plassering:r}))}function sr(e){if(!e.length)return I(`Ingen rekorder funnet.`);let t=document.createElement(`div`);return t.className=`rek-tabell-wrapper`,t.appendChild(L({rows:e,rowClass:e=>ar(e)?`rek-dame-rad`:void 0,columns:[{label:`Pl.`,thClass:`rek-th-pl`,render:e=>String(e.plassering)},{label:`Navn`,render:e=>{let t=s({id:e.kasterid??0,fornavn:e.fornavn??``,etternavn:e.etternavn??``}),n=document.createElement(`a`);return n.href=`#/kastere/${t}`,n.className=`tl-lenkje`,n.textContent=a({fornavn:e.fornavn??``,etternavn:e.etternavn??``}),n}},{label:`Klubb`,render:e=>e.klubb_navn??`–`},{label:`Poeng`,thClass:`rek-th-poeng`,render:e=>{if(!e.stevne_id)return String(e.poeng??`–`);let t=document.createElement(`span`);return t.className=`rek-poeng-celle`,t.title=e.stevne_navn??``,t.dataset.stevneid=String(e.stevne_id),t.textContent=String(e.poeng??`–`),t}},{label:`År`,thClass:`rek-th-ar`,render:e=>String(e.ar??`–`)}]})),t}function cr(){return`
    <div class="nc-side">
      <h1 class="rek-tittel">Rekorder</h1>
      <p id="rek-maks-tekst" class="rek-maks-tekst"></p>
      <div class="nc-filter-rad">
        <select id="rek-metode" class="tl-select">${ir.map(e=>`<option value="${e.verdi}"${e.verdi===W.metode?` selected`:``}>${A(e.label)}</option>`).join(``)}</select>
        <select id="rek-kjonn" class="tl-select">
          <option value="alle">Alle</option>
          <option value="herrer">Herrer</option>
          <option value="damer">Damer</option>
        </select>
        <input id="rek-sok" type="text" class="tl-select" placeholder="Søk på etternavn/klubb" value="">
      </div>
      <div id="rek-tabell-container"></div>
    </div>`}async function lr(e){W.metode=`kongelag`,W.kjonn=`alle`,W.sokeTekst=``,e.replaceChildren(k(`Laster rekorder…`));try{let{data:t,error:n}=await rr();if(n){e.replaceChildren(O(`Kunne ikkje laste rekorder.`));return}e.innerHTML=cr();function r(){let t=ir.find(e=>e.verdi===W.metode);e.querySelector(`#rek-maks-tekst`).textContent=`(Maks poengsum: ${t.maxPoeng})`}function i(){e.querySelector(`#rek-tabell-container`).replaceChildren(sr(or(t)))}r(),i(),e.querySelector(`#rek-metode`).addEventListener(`change`,e=>{W.metode=e.target.value,r(),i()}),e.querySelector(`#rek-kjonn`).addEventListener(`change`,e=>{W.kjonn=e.target.value,i()}),e.querySelector(`#rek-sok`).addEventListener(`input`,e=>{W.sokeTekst=e.target.value,i()}),e.addEventListener(`click`,e=>{let t=e.target.closest(`.rek-poeng-celle`);t?.dataset.stevneid&&(location.hash=`#/stevne/${t.dataset.stevneid}/resultat`)})}catch(t){b(`rekorder.render`,t),e.replaceChildren(O(`Kunne ikkje laste rekorder.`))}}y.from(`resultat`).select(`id, klasseid, kaster:kasterid(id, fornavn, etternavn), klubb:klubbid(id, navn), stevne:stevneid(id, dato)`);var ur=new Map,dr=null,fr=[1,3,4,13,16,21,23,24,27,29,32];async function pr(){if(dr)return dr;let{data:e,error:t}=await y.from(`kjonn`).select(`id, navn`);return t&&b(`hentKjonnIder`,t),dr=e??[],dr}function mr(e,t){let n=t===`damer`?`dame`:`herre`;return e.find(e=>e.navn.toLowerCase().includes(n))?.id}async function hr(e,t){let n=`${e.id}-${t}`;if(ur.has(n))return ur.get(n);let r=y.from(`stevne`).select(`id, dato`).eq(`ernm`,!0).eq(`kategoriid`,e.id);e.kjonnFilter===`historisk`&&e.aapentFraAr!=null&&(r=t===`open`?r.gte(`dato`,`${e.aapentFraAr}-01-01`):r.lt(`dato`,`${e.aapentFraAr}-01-01`));let{data:i,error:a}=await r;if(a)return b(`hentNmData.stevner`,a),{data:[],error:a};let o=(i??[]).map(e=>e.id);if(!o.length){let e={data:[],error:null};return ur.set(n,e),e}let s=e.kjonnFilter===`historisk`&&t!==`open`||e.kjonnFilter===`alltid`&&t!==`alle`,c=s?`kaster:kasterid!inner(id, fornavn, etternavn)`:`kaster:kasterid(id, fornavn, etternavn)`,l=y.from(`resultat`).select(`id, klasseid, ${c}, klubb:klubbid(id, navn), stevne:stevneid(id, dato)`).eq(`plassering`,1).in(`stevneid`,o).in(`klasseid`,fr).or(`gruppeid.is.null,gruppeid.neq.2`);if(s){let e=mr(await pr(),t);e&&(l=l.eq(`kaster.kjonnid`,e))}e.kjonnFilter===`historisk`&&t===`open`&&(l=l.eq(`klasseid`,1));let{data:u,error:d}=await l;if(d)return b(`hentNmData.resultater`,d),{data:[],error:d};let f={data:u??[],error:null};return ur.set(n,f),f}var gr=[{id:1,navn:`Singel`,kjonnFilter:`historisk`,fraaAr:1985,aapentFraAr:2013,merknad:`(åpen klasse fra 2013)`},{id:2,navn:`Par`,kjonnFilter:`historisk`,fraaAr:1987,aapentFraAr:2009,merknad:`(åpen klasse fra 2009)`},{id:3,navn:`Mix`,kjonnFilter:!1,fraaAr:1986,merknad:`(NM Mix 2011 ble ikke arrangert)`},{id:4,navn:`Lag`,kjonnFilter:!1,fraaAr:2016},{id:7,navn:`X-kast`,kjonnFilter:`historisk`,fraaAr:2009,aapentFraAr:2013,merknad:`(åpen klasse fra 2013)`},{id:9,navn:`Hesteskogolf`,kjonnFilter:`alltid`,fraaAr:2006},{id:10,navn:`Kongelag`,kjonnFilter:!1,fraaAr:2023}],G={kategoriId:1,kjonn:`open`};function _r(e){return e?parseInt(e.substring(0,4)):null}function vr(e){return e===`alltid`?`alle`:`open`}function yr(e,t){return t===`herrer`?`${e} Herrer`:t===`damer`?`${e} Damer`:e}function br(e){let t=new Map;for(let n of e){let e=`${n.stevne?.id}-${n.klasseid}`;t.has(e)||t.set(e,{ar:_r(n.stevne?.dato),stevneId:n.stevne?.id,kastere:[],klubb:n.klubb}),n.kaster&&t.get(e).kastere.push(n.kaster)}return[...t.values()].sort((e,t)=>(t.ar??0)-(e.ar??0))}function xr(e){if(!e.length)return I(`Ingen vinnere funnet.`);function t(e){let t=document.createElement(`a`);return t.href=`#/kastere/${s(e)}`,t.className=`tl-lenkje`,t.textContent=a(e),t}let n=document.createElement(`div`);return n.className=`nm-tabell-wrapper`,n.appendChild(L({rows:e,columns:[{label:`År`,thClass:`nm-td-ar`,cellClass:`nm-td-ar`,render:({ar:e,stevneId:t})=>{if(!t)return String(e??`–`);let n=document.createElement(`a`);return n.href=`#/stevne/${t}/resultat`,n.className=`tl-lenkje`,n.textContent=String(e??`–`),n}},{label:`Navn`,render:({kastere:e})=>{if(!e.length)return`–`;let n=document.createDocumentFragment();return e.forEach((e,r)=>{r>0&&n.appendChild(document.createTextNode(` og `)),n.appendChild(t(e))}),n}},{label:`Klubb`,render:({klubb:e})=>e?.navn??`–`}]})),n}function Sr(e,t){let n=`Norgesmestere ${e.fraaAr} - ${t}`,r=gr.map(e=>`<option value="${e.id}"${e.id===G.kategoriId?` selected`:``}>${A(e.navn)}</option>`).join(``),i=``;return e.kjonnFilter===`historisk`?i=`
      <select id="nm-kjonn" class="tl-select">
        <option value="open"${G.kjonn===`open`?` selected`:``}>Åpen klasse</option>
        <option value="herrer"${G.kjonn===`herrer`?` selected`:``}>Herrer</option>
        <option value="damer"${G.kjonn===`damer`?` selected`:``}>Damer</option>
      </select>`:e.kjonnFilter===`alltid`&&(i=`
      <select id="nm-kjonn" class="tl-select">
        <option value="alle"${G.kjonn===`alle`?` selected`:``}>Alle</option>
        <option value="herrer"${G.kjonn===`herrer`?` selected`:``}>Herrer</option>
        <option value="damer"${G.kjonn===`damer`?` selected`:``}>Damer</option>
      </select>`),`
    <div class="nc-side">
      <div class="nc-filter-rad">
        <select id="nm-kategori" class="tl-select">${r}</select>
        ${i}
      </div>
      <h1 class="nm-tittel">${A(n)}</h1>
      <h2 id="nm-undertittel" class="nm-undertittel">${A(yr(e.navn,G.kjonn))}</h2>
      <p class="nm-merknad">${e.merknad?A(e.merknad):``}</p>
      <div id="nm-tabell-container"></div>
    </div>`}async function Cr(e){e.replaceChildren(k(`Laster NM-vinnere…`));let t=gr.find(e=>e.id===G.kategoriId);try{let{data:n,error:r}=await hr(t,G.kjonn);if(r){b(`nmvinnere.renderKategori`,r),e.replaceChildren(O(`Kunne ikkje laste NM-vinnere.`));return}e.innerHTML=Sr(t,n.reduce((e,t)=>Math.max(e,_r(t.stevne?.dato)??0),0)||new Date().getFullYear()),e.querySelector(`#nm-tabell-container`).replaceChildren(xr(br(n)));let i=e.querySelector(`#nm-kategori`);i.addEventListener(`change`,async()=>{G.kategoriId=Number(i.value),G.kjonn=vr(gr.find(e=>e.id===G.kategoriId).kjonnFilter),await Cr(e)});let a=e.querySelector(`#nm-kjonn`);a?.addEventListener(`change`,async()=>{G.kjonn=a.value,await Cr(e)})}catch(t){b(`nmvinnere.renderKategori`,t),e.replaceChildren(O(`Kunne ikkje laste NM-vinnere.`))}}async function wr(e){G.kategoriId=1,G.kjonn=vr(gr[0].kjonnFilter),await Cr(e)}function Tr({tabs:e,activeId:t}){if(!e.length)return document.createElement(`div`);let n=Math.max(e.findIndex(e=>e.id===(t??``)),0),r=document.createElement(`div`),i=document.createElement(`ul`);i.className=`nav nav-tabs mb-3`,i.setAttribute(`role`,`tablist`);let a=[],o=[];e.forEach((e,t)=>{let r=t===n,s=document.createElement(`li`);s.className=`nav-item`,s.setAttribute(`role`,`presentation`);let c=document.createElement(`button`);c.type=`button`,c.className=`nav-link`+(r?` active`:``),c.id=`tab-${e.id}`,c.setAttribute(`role`,`tab`),c.setAttribute(`aria-selected`,String(r)),c.setAttribute(`aria-controls`,`tabpanel-${e.id}`),c.setAttribute(`tabindex`,r?`0`:`-1`),c.textContent=e.label,s.appendChild(c),i.appendChild(s),a.push(c);let l=document.createElement(`div`);l.id=`tabpanel-${e.id}`,l.setAttribute(`role`,`tabpanel`),l.setAttribute(`aria-labelledby`,`tab-${e.id}`),r||l.classList.add(`d-none`),l.appendChild(e.panel),o.push(l)});function s(e){n=e,a.forEach((t,n)=>{let r=n===e;t.classList.toggle(`active`,r),t.setAttribute(`aria-selected`,String(r)),t.setAttribute(`tabindex`,r?`0`:`-1`)}),o.forEach((t,n)=>{t.classList.toggle(`d-none`,n!==e)})}return a.forEach((e,t)=>{e.addEventListener(`click`,()=>s(t))}),i.addEventListener(`keydown`,t=>{if(t.key!==`ArrowLeft`&&t.key!==`ArrowRight`)return;t.preventDefault();let r=t.key===`ArrowRight`?(n+1)%e.length:(n-1+e.length)%e.length;s(r),a[r].focus()}),r.appendChild(i),o.forEach(e=>r.appendChild(e)),r}function Er(e){let t=document.createElement(`div`);return t.innerHTML=e,t}async function Dr(e){let t=await j();if(t){e.innerHTML=`
      <div class="container py-4 konto-container">
        <p>Du er allereie innlogga som <strong>${A(t.user.email)}</strong>.</p>
        <a href="#/minside" class="btn btn-primary">Gå til Min side</a>
      </div>`;return}let n=Er(`
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
    </form>`),r=Er(`
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
    </form>`),i=document.createElement(`div`);i.className=`container py-4 konto-container`;let a=document.createElement(`h2`);a.className=`mb-4`,a.textContent=`Konto`,i.appendChild(a),i.appendChild(Tr({tabs:[{id:`logginn`,label:`Logg inn`,panel:n},{id:`registrer`,label:`Registrer ny konto`,panel:r}]})),e.replaceChildren(i),e.querySelector(`#logginn-skjema`).addEventListener(`submit`,async t=>{t.preventDefault();let n=t.target,r=e.querySelector(`#li-feil`);r.classList.add(`d-none`);let i=n.querySelector(`[type=submit]`);i.disabled=!0;let{error:a}=await ot(e.querySelector(`#li-epost`).value.trim(),e.querySelector(`#li-passord`).value);if(a){r.textContent=a.message===`Invalid login credentials`?`Feil e-post eller passord.`:a.message,r.classList.remove(`d-none`),i.disabled=!1;return}let o=new URLSearchParams(location.hash.split(`?`)[1]??``).get(`redirect`);o?location.hash=`#${o}`:location.hash=await M()?`#/admin`:`#/minside`}),e.querySelector(`#registrer-skjema`).addEventListener(`submit`,async t=>{t.preventDefault();let n=t.target,r=e.querySelector(`#reg-feil`),i=e.querySelector(`#reg-suksess`);r.classList.add(`d-none`),i.classList.add(`d-none`);let a=e.querySelector(`#reg-passord`).value;if(a!==e.querySelector(`#reg-passord2`).value){r.textContent=`Passorda er ikkje like.`,r.classList.remove(`d-none`);return}let o=n.querySelector(`[type=submit]`);o.disabled=!0;let s=e.querySelector(`#reg-epost`).value.trim(),{error:c}=await st(s,a);if(c){r.textContent=c.message,r.classList.remove(`d-none`),o.disabled=!1;return}await ot(s,a),location.hash=`#/minside`})}y.from(`pamelding`).select(`id, stevne:stevneid(id, navn, dato)`),y.from(`pamelding`).select(`id, kasterid, kaster:kasterid(id, fornavn, etternavn, klubb:klubbid(navn))`),y.from(`pamelding`).select(`id, kasterid, er_bekreftet`);async function Or(e){let{data:t,error:n}=await y.from(`pamelding`).select(`id, stevne:stevneid(id, navn, dato)`).eq(`bruker_id`,e).limit(50);return n&&b(`hentMinePameldingar`,n),{data:t??[],error:n}}async function kr(e){let{data:t,error:n}=await y.from(`pamelding`).select(`id, kasterid, kaster:kasterid(id, fornavn, etternavn, klubb:klubbid(navn))`).eq(`stevneid`,e).order(`id`);return n&&b(`hentPameldingarForStevne`,n),{data:t??[],error:n}}async function Ar(e,t,n){let{error:r}=await y.from(`pamelding`).insert({stevneid:e,kasterid:t,bruker_id:n});return r&&b(`meldPaStevne`,r),{error:r}}async function jr(e){let{error:t}=await y.from(`pamelding`).delete().eq(`id`,e);return t&&b(`fjernPamelding`,t),{error:t}}async function Mr(e){let{count:t,error:n}=await y.from(`pamelding`).select(`id`,{count:`exact`,head:!0}).eq(`stevneid`,e);return n&&b(`hentAntallPameldingar`,n),t??0}async function Nr(e){let{count:t,error:n}=await y.from(`pamelding`).select(`id`,{count:`exact`,head:!0}).eq(`stevneid`,e).eq(`er_bekreftet`,!1);return n&&b(`hentAntallUbekrefta`,n),t??0}async function Pr(e){let{data:t,error:n}=await y.from(`pamelding`).select(`id, kasterid, er_bekreftet`).eq(`stevneid`,e).order(`id`);return n&&b(`hentPameldingStatusForStevne`,n),{data:t??[],error:n}}async function Fr(e,t){let n=await j(),{error:r}=await y.from(`pamelding`).insert({stevneid:e,kasterid:t,...n?.user?{bruker_id:n.user.id}:{}});return r&&b(`leggTilPameldingAdmin`,r),{error:r}}async function Ir(e,t){let{error:n}=await y.from(`pamelding`).update({er_bekreftet:!0}).eq(`stevneid`,e).eq(`kasterid`,t);return n&&b(`bekreftPameldingForKaster`,n),{error:n}}async function Lr(e,t){let{error:n}=await y.from(`pamelding`).delete().eq(`stevneid`,e).eq(`kasterid`,t);return n&&b(`fjernPameldingForKaster`,n),{error:n}}function Rr(e,t){return e===t?[1.5,1.5]:e>t?[2,+(t>=11)]:[+(e>=11),2]}function zr(e,t){let n=e??[];if(n.some(e=>e.posisjon!=null))return[n.find(e=>e.posisjon===1)??null,n.find(e=>e.posisjon===2)??null];let r=[...n].sort((e,n)=>(t[e.kasterid]??1/0)-(t[n.kasterid]??1/0));return[r[0]??null,r[1]??null]}function Br(e){return e?.omgangar?.length?e.omgangar.reduce((e,t)=>e+(t.score??0),0):e?.score_poeng??0}y.from(`kamp_spelar`).select(`
  id, kasterid, posisjon,
  kamp:kampid(
    id, stevneid, fase, runde_nummer, bane_nummer, er_bekreftet, er_walkover,
    stevne:stevneid(id, navn, erfullfort),
    spelarar:kamp_spelar(
      id, kasterid, posisjon,
      kaster:kasterid(id, fornavn, etternavn)
    )
  )
`);async function Vr(e){let{data:t,error:n}=await y.from(`kamp_spelar`).select(`
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
`);async function Hr(e){let{data:t,error:n}=await y.from(`kamp`).select(`
      id, stevneid, runde_nummer, bane_nummer, er_bekreftet, er_walkover, fase,
      spelarar:kamp_spelar(
        id, kasterid, score_poeng, kamp_poeng, antall_ringer, posisjon,
        kaster:kasterid(id, fornavn, etternavn, klubb:klubbid(kortnavn, navn)),
        omgangar:kamp_omgang(score, antall_ringer)
      )
    `).eq(`stevneid`,e).eq(`fase`,`innledende`).order(`runde_nummer`).order(`bane_nummer`);return n&&b(`hentInnledendeKamper`,n),{data:t??[],error:n}}async function Ur(e){if(!e.length)return!1;let{data:t,error:n}=await y.from(`kamp_omgang`).select(`id`).in(`kamp_spelar_id`,e).limit(1);return n&&b(`harKampOmgangar`,n),(t?.length??0)>0}async function Wr(e){if(!e.length)return{error:null};let{error:t}=await y.from(`kamp_omgang`).delete().in(`kamp_spelar_id`,e);return t&&b(`slettKampOmgangar`,t),{error:t}}async function Gr(e,t,n){let r=n===void 0?{score_poeng:t}:{score_poeng:t,kamp_poeng:n},{error:i}=await y.from(`kamp_spelar`).update(r).eq(`id`,e);return i&&b(`oppdaterKampSpelarScoreRask`,i),{error:i}}async function Kr(e){let{data:t,error:n}=await y.from(`kamp`).select(`
      id, stevneid, fase, runde_nummer, runde_navn, bane_nummer,
      er_bekreftet, er_walkover, er_tre_spelarar,
      stevne:stevneid(navn),
      spelarar:kamp_spelar(
        id, kasterid, posisjon, score_poeng, kamp_poeng, antall_ringer,
        kaster:kasterid(id, fornavn, etternavn)
      )
    `).eq(`id`,e).maybeSingle();return n&&b(`hentKamp`,n),{data:t,error:n}}async function qr(e,t){if(!t.length)return new Map;let{data:n,error:r}=await y.from(`resultat`).select(`kasterid, hcp`).eq(`stevneid`,e).in(`kasterid`,t);return r&&b(`hentHcp`,r),new Map((n??[]).filter(e=>e.kasterid!=null).map(e=>[e.kasterid,e.hcp??0]))}async function Jr(e,t){let{data:n,error:r}=await y.from(`kamp`).select(`id`).eq(`stevneid`,e).eq(`bane_nummer`,t).eq(`er_bekreftet`,!1).eq(`er_walkover`,!1).order(`runde_nummer`).limit(1).maybeSingle();return r&&b(`hentNesteKampOrganisator`,r),{data:n,error:r}}async function Yr(e,t){let{data:n,error:r}=await y.from(`kamp_spelar`).select(`kampid`).eq(`kasterid`,t);if(r)return b(`hentNesteKampDeltakar:minekampar`,r),{data:null,error:r};let i=(n??[]).map(e=>e.kampid).filter(e=>e!=null);if(!i.length)return{data:null,error:null};let{data:a,error:o}=await y.from(`kamp`).select(`id`).in(`id`,i).eq(`stevneid`,e).eq(`er_bekreftet`,!1).eq(`er_walkover`,!1).order(`runde_nummer`).limit(1).maybeSingle();return o&&b(`hentNesteKampDeltakar`,o),{data:a,error:o}}async function Xr(e,t){let{data:n}=await y.from(`kamp_spelar`).select(`id`).eq(`kampid`,e).eq(`kasterid`,t).maybeSingle();return!!n}async function Zr(e){let{kampId:t,p1:n,p2:r,hcp1:i,hcp2:a,erWalkover:o=!1}=e,s=0,c=0,l=0,u=0;if(o)s=21;else{let e=[n?.spelarId,r?.spelarId].filter(e=>e!=null),{data:t,error:o}=await y.from(`kamp_omgang`).select(`kamp_spelar_id, score, antall_ringer`).in(`kamp_spelar_id`,e);if(o)return b(`bekreftInnledendeKamp:omgangar`,o),{error:o};if(t?.length)for(let e of t)e.kamp_spelar_id===n?.spelarId?(s+=e.score??0,l+=e.antall_ringer??0):(c+=e.score??0,u+=e.antall_ringer??0);else{let{data:t}=await y.from(`kamp_spelar`).select(`id, score_poeng`).in(`id`,e),i=Object.fromEntries((t??[]).map(e=>[e.id,e.score_poeng??0]));s=n?i[n.spelarId]??n.scorePoeng:0,c=r?i[r.spelarId]??r.scorePoeng:0}s+=i,c+=a}let[d,f]=Rr(s,c),p=[];if(n&&p.push(y.from(`kamp_spelar`).update({score_poeng:s,kamp_poeng:d,antall_ringer:l}).eq(`id`,n.spelarId)),r&&p.push(y.from(`kamp_spelar`).update({score_poeng:c,kamp_poeng:f,antall_ringer:u}).eq(`id`,r.spelarId)),p.length){let e=(await Promise.all(p)).find(e=>e.error)?.error;if(e)return b(`bekreftInnledendeKamp:spelarar`,e),{error:e}}let{error:m}=await y.from(`kamp`).update({er_bekreftet:!0}).eq(`id`,t);return m&&b(`bekreftInnledendeKamp:kamp`,m),{error:m}}async function Qr(e){let{kampId:t,stevneId:n,rundeNavn:r,rundeNummer:i,p1:a,p2:o,orderedKasterids:s}=e,{error:c}=await y.from(`kamp`).update({er_bekreftet:!0}).eq(`id`,t);if(c)return b(`bekreftAvsluttendeKamp:kamp`,c),{error:c};let l=null;if(s?.length===3)l=s[2];else{let e=[a?.spelarId,o?.spelarId].filter(e=>e!=null),{data:t}=await y.from(`kamp_omgang`).select(`kamp_spelar_id, score`).in(`kamp_spelar_id`,e),n={};for(let e of t??[])e.kamp_spelar_id!=null&&(n[e.kamp_spelar_id]=(n[e.kamp_spelar_id]??0)+(e.score??0));l=(a?n[a.spelarId]??a.scorePoeng:0)>=(o?n[o.spelarId]??o.scorePoeng:0)?o?.kasterid??null:a?.kasterid??null}if(l==null)return{error:null};let u=r===`Finale`,d=r===`Bronsefinale`,f=u||d?{runde_eliminert:i,plassering:u?2:4}:{runde_eliminert:i},{error:p}=await y.from(`resultat`).update(f).eq(`stevneid`,n).eq(`kasterid`,l);if(p)return b(`bekreftAvsluttendeKamp:eliminert`,p),{error:p};if(u||d){let e=s?s[0]:l===o?.kasterid?a?.kasterid:o?.kasterid;if(e!=null){let{error:t}=await y.from(`resultat`).update({plassering:u?1:3}).eq(`stevneid`,n).eq(`kasterid`,e);if(t)return b(`bekreftAvsluttendeKamp:vinnar`,t),{error:t}}}return{error:null}}y.from(`kamp`).select(`
  id, fase, runde_nummer, bane_nummer, gruppe_navn, runde_navn,
  er_bekreftet, er_walkover, er_tre_spelarar,
  spelarar:kamp_spelar(
    id, kasterid, posisjon, score_poeng, kamp_poeng, antall_ringer,
    kaster:kasterid(fornavn, etternavn),
    omgangar:kamp_omgang(score, antall_ringer)
  )
`),y.from(`kamp_spelar`).select(`id, kasterid, score_poeng, antall_ringer, omgangar:kamp_omgang(score, antall_ringer)`);async function $r(e){let{data:t,error:n}=await y.from(`kamp`).select(`
      id, fase, runde_nummer, bane_nummer, gruppe_navn, runde_navn,
      er_bekreftet, er_walkover, er_tre_spelarar,
      spelarar:kamp_spelar(
        id, kasterid, posisjon, score_poeng, kamp_poeng, antall_ringer,
        kaster:kasterid(fornavn, etternavn),
        omgangar:kamp_omgang(score, antall_ringer)
      )
    `).eq(`stevneid`,e).order(`runde_nummer`).order(`bane_nummer`);return n&&b(`hentAvsluttendeKamper`,n),{data:t??[],error:n}}async function ei(e){let{data:t,error:n}=await y.from(`kamp_spelar`).select(`id, kasterid, score_poeng, antall_ringer, omgangar:kamp_omgang(score, antall_ringer)`).eq(`kampid`,e);return n&&b(`hentKampSpelarar`,n),{data:t??[],error:n}}async function ti(e,t){let{data:n,error:r}=await y.from(`kamp`).select(`er_bekreftet`).eq(`stevneid`,e).eq(`gruppe_navn`,t).eq(`runde_navn`,`Semifinale`);return r&&b(`harAlleSemifinalarBekrefta`,r),!!(n?.length&&n.every(e=>e.er_bekreftet))}async function ni(e){let{kampId:t,stevneId:n,rundeNummer:r,rundeNavn:i,allKasterids:a,eliminertId:o,vidareIds:s}=e,c=i===`Finale`||i===`Bronsefinale`,{error:l}=await y.from(`kamp`).update({er_bekreftet:!0}).eq(`id`,t);if(l)return b(`bekreftCupKamp:kamp`,l),{error:l};if(!o)return{error:null};if(c){let{error:e}=await y.from(`resultat`).update({runde_eliminert:null,plassering:null}).eq(`stevneid`,n).in(`kasterid`,a);if(e)return b(`bekreftCupKamp:reset`,e),{error:e}}else{let{error:e}=await y.from(`resultat`).update({runde_eliminert:null}).eq(`stevneid`,n).eq(`runde_eliminert`,r).in(`kasterid`,a);if(e)return b(`bekreftCupKamp:reset`,e),{error:e}}let u=c?{runde_eliminert:r,plassering:i===`Finale`?2:4}:{runde_eliminert:r},{error:d}=await y.from(`resultat`).update(u).eq(`stevneid`,n).eq(`kasterid`,o);if(d)return b(`bekreftCupKamp:eliminert`,d),{error:d};if(i===`Finale`&&s.length>0){let{error:e}=await y.from(`resultat`).update({plassering:1}).eq(`stevneid`,n).eq(`kasterid`,s[0]);if(e)return b(`bekreftCupKamp:vinnar`,e),{error:e}}if(i===`Bronsefinale`&&s.length>0){let{error:e}=await y.from(`resultat`).update({plassering:3,runde_eliminert:r}).eq(`stevneid`,n).eq(`kasterid`,s[0]);if(e)return b(`bekreftCupKamp:bronsefinale`,e),{error:e}}return{error:null}}async function ri(e){let{stevneId:t,rundeNummer:n,rundeNavn:r,allKasterids:i,nyVinnarId:a,nyTaparId:o}=e,s=r===`Finale`;if(s||r===`Bronsefinale`){let{error:e}=await y.from(`resultat`).update({runde_eliminert:null,plassering:null}).eq(`stevneid`,t).in(`kasterid`,i);if(e)return b(`oppdaterVinnarTapar:reset`,e),{error:e};if(o){let{error:e}=await y.from(`resultat`).update({runde_eliminert:n,plassering:s?2:4}).eq(`stevneid`,t).eq(`kasterid`,o);if(e)return b(`oppdaterVinnarTapar:tapar`,e),{error:e}}let r=s?{plassering:1}:{runde_eliminert:n,plassering:3};if(a){let{error:e}=await y.from(`resultat`).update(r).eq(`stevneid`,t).eq(`kasterid`,a);if(e)return b(`oppdaterVinnarTapar:vinnar`,e),{error:e}}}else{let{error:e}=await y.from(`resultat`).update({runde_eliminert:null}).eq(`stevneid`,t).eq(`runde_eliminert`,n).in(`kasterid`,i);if(e)return b(`oppdaterVinnarTapar:reset`,e),{error:e};if(o){let{error:e}=await y.from(`resultat`).update({runde_eliminert:n}).eq(`stevneid`,t).eq(`kasterid`,o);if(e)return b(`oppdaterVinnarTapar:tapar`,e),{error:e}}}return{error:null}}y.from(`kamp_omgang`).select(`id, kamp_spelar_id, omgang, score, antall_ringer`);async function ii(e){if(!e.length)return{data:[],error:null};let{data:t,error:n}=await y.from(`kamp_omgang`).select(`id, kamp_spelar_id, omgang, score, antall_ringer`).in(`kamp_spelar_id`,e).order(`omgang`);return n&&b(`hentKampOmgangar`,n),{data:t??[],error:n}}async function ai(e){if(!e.length)return{error:null};let{error:t}=await y.from(`kamp_omgang`).insert(e);return t&&b(`lagreKampOmgang`,t),{error:t}}async function oi(e){let{error:t}=await y.from(`kamp`).update({er_bekreftet:!1}).eq(`id`,e);return t&&b(`unbekreftKamp`,t),{error:t}}async function si(e,t){if(!e.length)return{error:null};let{error:n}=await y.from(`kamp_omgang`).delete().in(`kamp_spelar_id`,e).gte(`omgang`,t);return n&&b(`slettKampOmgangarFra`,n),{error:n}}function ci(e,t,n){return y.channel(`neste-kamp-${t}`).on(`postgres_changes`,{event:`INSERT`,schema:`public`,table:`kamp`,filter:`stevneid=eq.${e}`},e=>{n(e.new)}).subscribe()}function li(e,t,n){return y.channel(t).on(`postgres_changes`,{event:`*`,schema:`public`,table:`kamp_omgang`},n).on(`postgres_changes`,{event:`*`,schema:`public`,table:`kamp`},t=>{(t.new?.stevneid??t.old?.stevneid)===e&&n()}).subscribe()}function ui(e,t,n,r){return y.channel(`scoreboard-kamp-${e}`).on(`postgres_changes`,{event:`*`,schema:`public`,table:`kamp_omgang`},async e=>{let r=e.new,i=e.old,a=r.kamp_spelar_id??i.kamp_spelar_id;(!a||t.includes(a))&&await n()}).on(`postgres_changes`,{event:`UPDATE`,schema:`public`,table:`kamp`,filter:`id=eq.${e}`},async e=>{e.new?.er_bekreftet&&await r()}).subscribe()}function di(e){let t=document.createElement(`div`);return t.innerHTML=e,t}var fi={admin:`Administrator`,klubbadmin:`Klubbadministrator`,bruker:`Brukar`};function pi(e){return`
    ${e===`avvist`?`<div class="alert alert-warning">Koblingforespørselen din vart avvist. Du kan sende ein ny.</div>`:``}
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">Koble til utøvarprofil</h5>
        <p class="card-text text-muted">Søk etter deg sjølv i registeret og send ein forespørsel. Etter godkjenning kan du melde deg på stevner.</p>
        <input type="search" id="kaster-sok" class="form-control mb-2" placeholder="Søk på navn…">
        <div id="kaster-treff" class="list-group mb-2"></div>
        <div id="kasting-feil" class="alert alert-danger d-none"></div>
      </div>
    </div>`}function mi(){return`<div class="alert alert-info mb-4">Koblingforespørselen din ventar på godkjenning frå ein administrator.</div>`}async function hi(e){let{data:t,error:n}=await cn(e);return n||!t?``:`
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">Kobla til utøvarprofil</h5>
        <p class="mb-1"><strong>${A(a(t))}</strong> · ${A(t.klubb?.navn??``)}</p>
        <a href="#/kastere/${s(t)}" class="btn btn-sm btn-outline-primary mt-1">Sjå profil</a>
      </div>
    </div>`}async function gi(e){let{data:t,error:n}=await Or(e);return n?`<p class="text-muted">Kunne ikkje laste påmeldingar.</p>`:t.length?`
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">Påmeldingar</h5>
        <table class="table table-sm">
          <thead><tr><th>Stevne</th><th>Dato</th><th></th></tr></thead>
          <tbody>${[...t].sort((e,t)=>(e.stevne?.dato??``).localeCompare(t.stevne?.dato??``)).map(e=>{let t=E(e.stevne?.dato);return`<tr>
      <td><a href="#/stevne/${e.stevne?.id??``}/pamelding">${A(e.stevne?.navn??``)}</a></td>
      <td>${A(t)}</td>
      <td><a href="#/stevne/${e.stevne?.id??``}/pamelding" class="btn btn-sm btn-outline-danger">Meld av</a></td>
    </tr>`}).join(``)}</tbody>
        </table>
      </div>
    </div>`:`<p class="empty-state">Ingen påmeldingar enno.</p>`}async function _i(e){let{data:t,error:n}=await Vr(e);if(n){let e=document.createElement(`p`);return e.className=`text-muted`,e.textContent=`Kunne ikkje laste kampar.`,e}let r=t.filter(e=>!e.kamp?.er_walkover),i=r.filter(e=>e.kamp?.stevne?.erfullfort===!1&&!e.kamp?.er_bekreftet).sort((e,t)=>(e.kamp?.runde_nummer??0)-(t.kamp?.runde_nummer??0)),a=r.filter(e=>e.kamp?.er_bekreftet).sort((e,t)=>(e.kamp?.runde_nummer??0)-(t.kamp?.runde_nummer??0)),o=(t,n)=>{let r=t.kamp,i=(r?.spelarar??[]).find(t=>t.kasterid!==e),a=i?.kaster?A(`${i.kaster.fornavn} ${i.kaster.etternavn}`):`–`;return`<tr>
      <td>R${r?.runde_nummer??``} / B${r?.bane_nummer??``}</td>
      <td>${a}</td>
      <td>${n}</td>
    </tr>`},s=(e,t)=>{if(!e.length)return null;let n=new Map;for(let t of e){let e=t.kamp?.stevneid??`ukjent`,r=t.kamp?.stevne?.navn??``;n.has(e)||n.set(e,{navn:r,kampar:[]}),n.get(e).kampar.push(t)}return[...n.values()].map(({navn:e,kampar:n})=>`
      <p class="fw-semibold mb-1 mt-2">${A(e)}</p>
      <table class="table table-sm mb-3"><thead><tr><th>Runde/Bane</th><th>Motstandar</th><th></th></tr></thead><tbody>
        ${n.map(e=>o(e,t(e))).join(``)}
      </tbody></table>`).join(``)},c=s(i,e=>`<a href="#/kamp/${e.kamp?.id??``}" class="btn btn-sm btn-primary">Scoreboard</a>`),l=s(a,e=>`<a href="#/kamp/${e.kamp?.id??``}" class="btn btn-sm btn-outline-secondary">Sjå kamp</a>`),u=document.createElement(`div`);u.className=`card mb-4`,u.id=`mine-kampar-seksjon`;let d=document.createElement(`div`);d.className=`card-body`;let f=document.createElement(`h5`);return f.className=`card-title`,f.textContent=`Mine kampar`,d.appendChild(f),d.appendChild(Tr({tabs:[{id:`kommande`,label:`Kommande (${i.length})`,panel:di(c??`<p class="text-muted">Ingen kommande kampar.</p>`)},{id:`ferdige`,label:`Ferdige (${a.length})`,panel:di(l??`<p class="text-muted">Ingen ferdige kampar enno.</p>`)}]})),u.appendChild(d),u}function vi(e,t){let n=null,r=null,i=e.querySelector(`#kaster-sok`),o=e.querySelector(`#kaster-treff`),s=e.querySelector(`#kasting-feil`);i.addEventListener(`input`,()=>{n!==null&&clearTimeout(n);let e=i.value.trim().toLowerCase();if(e.length<2){o.innerHTML=``;return}n=setTimeout(async()=>{if(!r){let{data:e}=await rn();r=e}let t=r.filter(t=>t.fornavn.toLowerCase().includes(e)||t.etternavn.toLowerCase().includes(e)).slice(0,8);if(!t.length){let e=I(`Ingen treff.`);e.classList.add(`small`),o.replaceChildren(e);return}o.innerHTML=t.map(e=>`<button class="list-group-item list-group-item-action" data-id="${e.id}">
          ${A(a(e))} <span class="text-muted small">· ${A(e.klubb?.navn??``)}</span>
        </button>`).join(``)},300)}),o.addEventListener(`click`,async e=>{let n=e.target.closest(`[data-id]`);if(!n)return;s.classList.add(`d-none`);let{error:r}=await Ve(t,Number(n.dataset.id));if(r){s.textContent=`Kunne ikkje sende forespørsel.`,s.classList.remove(`d-none`);return}location.reload()})}async function yi(e){e.replaceChildren(k(`Laster min side…`));try{let t=await j();if(!t){location.hash=`#/logginn`;return}let{profil:n,user:r}=t,i=n?.kobling_status??`ingen`,a=n?fi[n.rolle]:`Ukjent`,o=`
      <div class="minside-container">
        <h2 class="mb-1">Min side</h2>
        <p class="text-muted mb-4">${A(r.email??``)} · <span class="badge bg-secondary">${A(a)}</span></p>`;if(i===`ingen`||i===`avvist`)o+=pi(i);else if(i===`venter`)o+=mi();else if(i===`godkjent`&&n?.kasterid){let t=n.kasterid,[i,a,s]=await Promise.all([hi(t),gi(r.id),_i(t)]);o+=i+a,o+=`</div>`,e.innerHTML=o,e.querySelector(`.minside-container`).appendChild(s);return}o+=`</div>`,e.innerHTML=o,(i===`ingen`||i===`avvist`)&&vi(e,r.id)}catch(t){b(`minside.render`,t),e.replaceChildren(O(`Kunne ikkje laste min side.`))}}function K(e){return e&&typeof e==`object`&&`message`in e?String(e.message):`Ukjend feil`}function q(e,t){return`<div class="mb-3"><label class="form-label fw-semibold">${A(e)}</label>${t}</div>`}function bi(e,t){let n=e.querySelector(`.admin-feil`);n||(n=document.createElement(`div`),n.className=`alert alert-danger admin-feil mt-3 d-none`,e.querySelector(`form`)?.append(n)),n.textContent=t,n.classList.remove(`d-none`),n.scrollIntoView({behavior:`smooth`,block:`nearest`})}function xi(e,t){let n=e.querySelector(`.admin-suksess`);n||(n=document.createElement(`div`),n.className=`alert alert-success admin-suksess mt-3 d-none`,e.querySelector(`form`)?.append(n)),n.textContent=t,n.classList.remove(`d-none`);let r=n;setTimeout(()=>{r.classList.add(`d-none`)},4e3)}var Si=[`kobling`,`brukarar`,`klubbadmin`],Ci={kobling:`Koblingforespørslar`,brukarar:`Brukarar`,klubbadmin:`Klubbadmin-tilgang`};async function wi(e){e.innerHTML=`
    <div class="container py-4 admin-skjema-xl">
      <h2 class="mb-3">Administrasjon</h2>
      <ul class="nav nav-tabs mb-4" id="admin-faner">
        ${Si.map((e,t)=>`<li class="nav-item">
          <button class="nav-link${t===0?` active`:``}" data-fane="${e}">${Ci[e]}</button>
        </li>`).join(``)}
      </ul>
      <div id="admin-innhald"></div>
    </div>`;let t=e.querySelector(`#admin-innhald`);async function n(n){e.querySelectorAll(`[data-fane]`).forEach(e=>{e.classList.toggle(`active`,e.dataset.fane===n)}),k(`Laster...`),n===`kobling`&&await Ti(t),n===`brukarar`&&await Ei(t),n===`klubbadmin`&&await Di(t)}e.querySelector(`#admin-faner`).addEventListener(`click`,e=>{let t=e.target.closest(`[data-fane]`);t?.dataset.fane&&n(t.dataset.fane)}),n(`kobling`)}async function Ti(e){let{data:t,error:n}=await He();if(n){e.innerHTML=`<div class="alert alert-danger">${A(K(n))}</div>`;return}if(!t.length){e.replaceChildren(I(`Ingen ventande forespørslar.`));return}let r=t.map(e=>e.id),i=t.map(e=>e.kobling_kasterid).filter(e=>e!==null),[{data:a},{data:o}]=await Promise.all([Ue(r),dn(i)]),s=Object.fromEntries((a??[]).map(e=>[e.id,e.epost])),c=new Map((o??[]).map(e=>[e.id,e]));e.innerHTML=`<table class="table table-hover">
    <thead><tr><th>E-post</th><th>Vil koblast til</th><th>Handling</th></tr></thead>
    <tbody>
      ${t.map(e=>{let t=e.kobling_kasterid?c.get(e.kobling_kasterid):null,n=t?.klubb,r=t?`${A(t.fornavn)} ${A(t.etternavn)} (${A(n?.navn??``)})`:`—`;return`<tr data-id="${e.id}" data-kasterid="${e.kobling_kasterid??``}">
          <td>${A(s[e.id]??e.id)}</td>
          <td>${r}</td>
          <td>
            <button class="btn btn-sm btn-success me-1 godkjenn-knapp">Godkjenn</button>
            <button class="btn btn-sm btn-outline-danger avvis-knapp">Avvis</button>
          </td>
        </tr>`}).join(``)}
    </tbody>
  </table>`,e.querySelectorAll(`.godkjenn-knapp`).forEach(t=>{t.addEventListener(`click`,async()=>{let n=t.closest(`tr`),r=n.dataset.kasterid?Number(n.dataset.kasterid):null,{error:i}=await We(n.dataset.id,r,`godkjent`);if(i){e.innerHTML=`<div class="alert alert-danger">${A(K(i))}</div>`;return}Ti(e)})}),e.querySelectorAll(`.avvis-knapp`).forEach(t=>{t.addEventListener(`click`,async()=>{let{error:n}=await We(t.closest(`tr`).dataset.id,null,`avvist`);if(n){e.innerHTML=`<div class="alert alert-danger">${A(K(n))}</div>`;return}Ti(e)})})}async function Ei(e){let{data:t,error:n}=await Ge();if(n){e.innerHTML=`<div class="alert alert-danger">${A(K(n))}</div>`;return}if(!t.length){e.replaceChildren(I(`Ingen brukarar.`));return}let{data:r}=await Ue(t.map(e=>e.id)),i=Object.fromEntries((r??[]).map(e=>[e.id,e.epost])),a=[`bruker`,`klubbadmin`,`admin`].map(e=>`<option value="${e}">${e}</option>`).join(``);e.innerHTML=`
    <div id="brukar-feil" class="alert alert-danger d-none"></div>
    <table class="table table-hover">
      <thead><tr><th>E-post</th><th>Rolle</th><th>Kobling</th><th></th></tr></thead>
      <tbody>
        ${t.map(e=>`<tr data-id="${e.id}">
          <td>${A(i[e.id]??e.id)}</td>
          <td>
            <select class="form-select form-select-sm rolle-vel sel-auto">
              ${a}
            </select>
          </td>
          <td><span class="badge bg-secondary">${A(e.kobling_status)}</span></td>
          <td><button class="btn btn-sm btn-primary lagre-rolle">Lagre</button></td>
        </tr>`).join(``)}
      </tbody>
    </table>`,t.forEach(t=>{let n=e.querySelector(`tr[data-id="${t.id}"]`);n&&(n.querySelector(`.rolle-vel`).value=t.rolle)}),e.querySelectorAll(`.lagre-rolle`).forEach(t=>{t.addEventListener(`click`,async()=>{let n=t.closest(`tr`),r=n.querySelector(`.rolle-vel`).value,i=e.querySelector(`#brukar-feil`);i.classList.add(`d-none`);let{error:a}=await Ke(n.dataset.id,r);a?(i.textContent=K(a),i.classList.remove(`d-none`)):(t.textContent=`✓`,setTimeout(()=>{t.textContent=`Lagre`},2e3))})})}async function Di(e){let t,n,r;try{let e=await Promise.all([qe(),Hn(),Je()]);t=e[0].data,n=e[1].data,r=e[2].data}catch(t){b(`admin._visKlubbadmin`,t),e.innerHTML=`<div class="alert alert-danger">Kunne ikkje laste data.</div>`;return}if(!t.length){e.replaceChildren(I(`Ingen brukarar med rolle "klubbadmin".`));return}let{data:i}=await Ue(t.map(e=>e.id)),a=Object.fromEntries((i??[]).map(e=>[e.id,e.epost])),o={};r.forEach(e=>{o[e.bruker_id]||(o[e.bruker_id]=new Set),o[e.bruker_id].add(e.klubbid)});let s=n.map(e=>`<option value="${e.id}">${A(e.navn)}</option>`).join(``);e.innerHTML=`
    <div id="ka-feil" class="alert alert-danger d-none"></div>
    ${t.map(e=>{let t=[...o[e.id]??[]].map(e=>{let t=n.find(t=>t.id===e);return t?`<span class="badge bg-primary me-1" data-kid="${e}">${A(t.navn)} <button class="btn-close btn-close-white btn-close-xs fjern-klubb"></button></span>`:``}).join(``);return`<div class="card mb-3" data-bruker="${e.id}">
        <div class="card-body">
          <h6 class="card-title mb-2">${A(a[e.id]??e.id)}</h6>
          <div class="ka-klubbar mb-2">${t||`<span class="text-muted small">Ingen klubbar tildelt</span>`}</div>
          <div class="d-flex gap-2">
            <select class="form-select form-select-sm legg-til-vel sel-auto">
              <option value="">Legg til klubb…</option>
              ${s}
            </select>
            <button class="btn btn-sm btn-success legg-til-knapp">Legg til</button>
          </div>
        </div>
      </div>`}).join(``)}`,e.querySelectorAll(`.legg-til-knapp`).forEach(t=>{t.addEventListener(`click`,async()=>{let n=t.closest(`[data-bruker]`),r=n.querySelector(`.legg-til-vel`),i=Number(r.value);if(!i)return;let a=e.querySelector(`#ka-feil`);a.classList.add(`d-none`);let{error:o}=await Ye(n.dataset.bruker,i);if(o){a.textContent=K(o),a.classList.remove(`d-none`);return}Di(e)})}),e.querySelectorAll(`.fjern-klubb`).forEach(t=>{t.addEventListener(`click`,async n=>{n.stopPropagation();let r=t.closest(`[data-kid]`),i=t.closest(`[data-bruker]`),a=e.querySelector(`#ka-feil`);a.classList.add(`d-none`);let{error:o}=await Ze(i.dataset.bruker,Number(r.dataset.kid));if(o){a.textContent=K(o),a.classList.remove(`d-none`);return}Di(e)})})}var J=null,Oi=null,ki=null,Ai=null;function ji(){return J||(J=document.createElement(`div`),J.className=`modal`,J.style.display=`none`,J.setAttribute(`role`,`alertdialog`),J.setAttribute(`aria-modal`,`true`),J.setAttribute(`aria-labelledby`,`cd-title`),J.setAttribute(`aria-describedby`,`cd-message`),J.innerHTML=`
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
  `,document.body.appendChild(J),J.querySelector(`#cd-cancel`).addEventListener(`click`,()=>{Pi(!1)}),J.querySelector(`#cd-confirm`).addEventListener(`click`,()=>{Pi(!0)}),J)}function Mi(e){Oi=document.createElement(`div`),Oi.className=`modal-backdrop show`,document.body.appendChild(Oi),document.body.classList.add(`modal-open`),e.style.display=`block`,e.classList.add(`show`),e.querySelector(`#cd-confirm`)?.focus(),Ai=e=>{e.key===`Escape`&&(e.preventDefault(),Pi(!1))},document.addEventListener(`keydown`,Ai)}function Ni(e){e.classList.remove(`show`),e.style.display=`none`,Oi?.remove(),Oi=null,document.body.classList.remove(`modal-open`),Ai&&=(document.removeEventListener(`keydown`,Ai),null)}function Pi(e){if(!J||!ki)return;let t=ki;ki=null,Ni(J),t(e)}function Y(e){let{title:t,message:n,confirmText:r=`OK`,cancelText:i=`Avbryt`,danger:a=!1}=e,o=ji();o.querySelector(`#cd-title`).textContent=t,o.querySelector(`#cd-message`).textContent=n,o.querySelector(`#cd-cancel`).textContent=i;let s=o.querySelector(`#cd-confirm`);return s.textContent=r,s.className=`btn ${a?`btn-danger`:`btn-primary`}`,new Promise(e=>{ki=e,Mi(o)})}function X(e){if(!e||typeof e!=`string`)return null;let t=Number(e);return Number.isFinite(t)?t:null}async function Fi(e,{id:t}={}){e.replaceChildren(k());let n=[],r=[],i=[],a=[];try{let e=await Promise.all([Hn(),pe(),me(),he()]);n=e[0].data,r=e[1].data,i=e[2].data,a=e[3].data}catch(t){b(`stevneadmin.render`,t),e.replaceChildren(O(`Kunne ikkje laste skjema.`));return}let o=null;if(t){let{data:n,error:r}=await ge(t);if(r||!n){e.replaceChildren(O(`Stevne ikkje funne.`));return}if(o=n,!await M()&&!await it(o.klubbid??void 0)){e.replaceChildren(O(`Ingen tilgang til dette stevnet.`));return}}let s=t?`Rediger stevne: ${A(o?.navn??``)}`:`Nytt stevne`,c=o??{},l=c.dato??``,u=c.tid?c.tid.slice(0,5):``,d=N(n,c.klubbid),f=N(r,c.stevnetypeid),p=N(i,c.innledendekastemetodeid),m=N(i,c.avsluttendekastemetodeid),h=N(a,c.kategoriid);e.innerHTML=`
    <div class="container py-4 admin-skjema-lg">
      <h2 class="mb-4">${s}</h2>
      <form id="stevne-skjema">
        ${q(`Namn*`,`<input type="text" class="form-control" name="navn" value="${A(c.navn)}" required>`)}
        ${q(`Stad`,`<input type="text" class="form-control" name="sted" value="${A(c.sted)}">`)}
        ${q(`Dato`,`<input type="date" class="form-control" name="dato" value="${l}">`)}
        ${q(`Tid`,`<input type="time" class="form-control" name="tid" value="${u}">`)}
        ${q(`Arrangørklubb`,`<select class="form-select" name="klubbid">${d}</select>`)}
        ${q(`Stevnetype`,`<select class="form-select" name="stevnetypeid">${f}</select>`)}
        ${q(`Innleiande kastemetode`,`<select class="form-select" name="innledendekastemetodeid">${p}</select>`)}
        ${q(`Avsluttande kastemetode`,`<select class="form-select" name="avsluttendekastemetodeid">${m}</select>`)}
        ${q(`Kategori`,`<select class="form-select" name="kategoriid">${h}</select>`)}
        <div class="mb-3 d-flex gap-4 flex-wrap">
          <div class="form-check"><input class="form-check-input" type="checkbox" name="ernm" id="ernm"${c.ernm?` checked`:``}><label class="form-check-label" for="ernm">Er NM</label></div>
          <div class="form-check"><input class="form-check-input" type="checkbox" name="ernorgesranking" id="ernr"${c.ernorgesranking?` checked`:``}><label class="form-check-label" for="ernr">Er Norgesranking</label></div>
          <div class="form-check"><input class="form-check-input" type="checkbox" name="erfullfort" id="erfullfort"${c.erfullfort?` checked`:``}><label class="form-check-label" for="erfullfort">Er fullført</label></div>
          <div class="form-check"><input class="form-check-input" type="checkbox" name="erekskludertfrarekorder" id="ekskl"${c.erekskludertfrarekorder?` checked`:``}><label class="form-check-label" for="ekskl">Ekskl. frå rekorder</label></div>
        </div>
        ${q(`Innbydelses-URL`,`<input type="url" class="form-control" name="innbydelseurl" value="${A(c.innbydelseurl)}">`)}
        ${q(`Resultat-URL`,`<input type="url" class="form-control" name="resultaturl" value="${A(c.resultaturl)}">`)}
        <div class="d-flex gap-2 mt-4">
          <button type="submit" class="btn btn-primary">Lagre</button>
          ${t?`<button type="button" id="slett-knapp" class="btn btn-outline-danger ms-auto">Slett stevne</button>`:``}
        </div>
      </form>
    </div>`,e.querySelector(`#stevne-skjema`).addEventListener(`submit`,async n=>{n.preventDefault();let r=new FormData(n.target),i={navn:r.get(`navn`).trim(),sted:r.get(`sted`).trim()||null,dato:r.get(`dato`)||null,tid:r.get(`tid`)||null,klubbid:X(r.get(`klubbid`)),stevnetypeid:X(r.get(`stevnetypeid`)),innledendekastemetodeid:X(r.get(`innledendekastemetodeid`)),avsluttendekastemetodeid:X(r.get(`avsluttendekastemetodeid`)),kategoriid:X(r.get(`kategoriid`)),ernm:r.get(`ernm`)===`on`,ernorgesranking:r.get(`ernorgesranking`)===`on`,erfullfort:r.get(`erfullfort`)===`on`,erekskludertfrarekorder:r.get(`erekskludertfrarekorder`)===`on`,innbydelseurl:r.get(`innbydelseurl`).trim()||null,resultaturl:r.get(`resultaturl`).trim()||null},{data:a,error:o}=t?await ve(t,i):await _e(i);if(o){bi(e,K(o));return}xi(e,`Stevnet er lagra.`),t||setTimeout(()=>{location.hash=`#/stevne/${a.id}/admin`},1500)}),e.querySelector(`#slett-knapp`)?.addEventListener(`click`,async()=>{if(!await Y({title:`Slett stevne`,message:`Slett «${o?.navn}»? Dette kan ikkje angrast.`,danger:!0}))return;let{error:n}=await ye(t);if(n){bi(e,K(n));return}location.hash=`#/terminliste`})}async function Ii(e,{id:t}={}){e.replaceChildren(k());let n=[],r=[],i=[];try{let e=await Promise.all([Hn(),ln(),un()]);n=e[0].data,r=e[1].data,i=e[2].data}catch(t){b(`kasteradmin.render`,t),e.replaceChildren(O(`Kunne ikkje laste skjema.`));return}let a=null;if(t){let{data:n,error:r}=await fn(t);if(r||!n){e.replaceChildren(O(`Utøvar ikkje funne.`));return}if(a=n,!await M()&&!await it(a.klubbid??void 0)){e.replaceChildren(O(`Ingen tilgang til denne utøvaren.`));return}}let o=t?`Rediger utøvar: ${a?`${A(a.fornavn)} ${A(a.etternavn)}`:``}`:`Ny utøvar`,s=a??{};e.innerHTML=`
    <div class="container py-4 admin-skjema-md">
      <h2 class="mb-4">${o}</h2>
      <form id="kaster-skjema">
        ${q(`Fornavn*`,`<input type="text" class="form-control" name="fornavn" value="${A(s.fornavn)}" required>`)}
        ${q(`Etternavn*`,`<input type="text" class="form-control" name="etternavn" value="${A(s.etternavn)}" required>`)}
        ${q(`Kjønn*`,`<select class="form-select" name="kjonnid">${N(i,s.kjonnid)}</select>`)}
        ${q(`Klubb`,`<select class="form-select" name="klubbid"><option value="">— vel —</option>${n.map(e=>`<option value="${e.id}"${e.id===s.klubbid?` selected`:``}>${A(e.navn)}</option>`).join(``)}</select>`)}
        ${q(`Klasse`,`<select class="form-select" name="klasseid">${N(r,s.klasseid)}</select>`)}
        ${q(`E-post`,`<input type="email" class="form-control" name="epost" value="${A(s.epost)}">`)}
        ${q(`Telefon`,`<input type="tel" class="form-control" name="telefon" value="${A(s.telefon)}">`)}
        ${q(`Medlemsnummer`,`<input type="number" class="form-control" name="medlemsnummer" value="${s.medlemsnummer??``}">`)}
        <div class="mb-3 form-check">
          <input class="form-check-input" type="checkbox" name="eraktiv" id="eraktiv"${s.eraktiv===!1?``:` checked`}>
          <label class="form-check-label" for="eraktiv">Er aktiv</label>
        </div>
        <div class="d-flex gap-2 mt-4">
          <button type="submit" class="btn btn-primary">Lagre</button>
          ${t?`<button type="button" id="slett-knapp" class="btn btn-outline-danger ms-auto">Slett utøvar</button>`:``}
        </div>
      </form>
    </div>`,e.querySelector(`#kaster-skjema`).addEventListener(`submit`,async n=>{n.preventDefault();let r=new FormData(n.target),i={fornavn:r.get(`fornavn`).trim(),etternavn:r.get(`etternavn`).trim(),kjonnid:X(r.get(`kjonnid`)),klubbid:X(r.get(`klubbid`)),klasseid:X(r.get(`klasseid`)),epost:r.get(`epost`).trim()||null,telefon:r.get(`telefon`).trim()||null,medlemsnummer:r.get(`medlemsnummer`)?Number(r.get(`medlemsnummer`)):null,eraktiv:r.get(`eraktiv`)===`on`},{data:a,error:o}=t?await mn(t,i):await pn(i);if(o){bi(e,K(o));return}xi(e,`Utøvaren er lagra.`),t||setTimeout(()=>{location.hash=`#/kaster/${a.id}/admin`},1500)}),e.querySelector(`#slett-knapp`)?.addEventListener(`click`,async()=>{if(!await Y({title:`Slett utøvar`,message:`Slett «${a?.fornavn} ${a?.etternavn}»? Dette kan ikkje angrast.`,danger:!0}))return;let{error:n}=await hn(t);if(n){bi(e,K(n));return}location.hash=`#/kastere`})}async function Li(e,{id:t}={}){if(!t){e.replaceChildren(O(`Manglande ID.`));return}e.replaceChildren(k());let{data:n,error:r}=await Wn(t);if(r||!n){e.replaceChildren(O(`Klubb ikkje funne.`));return}if(!await M()&&!await it(t)){e.replaceChildren(O(`Ingen tilgang til denne klubben.`));return}e.innerHTML=`
    <div class="container py-4 admin-skjema-sm">
      <h2 class="mb-4">Rediger klubb: ${A(n.navn)}</h2>
      <form id="klubb-skjema">
        ${q(`Namn*`,`<input type="text" class="form-control" name="navn" value="${A(n.navn)}" required>`)}
        ${q(`Kortnavn`,`<input type="text" class="form-control" name="kortnavn" value="${A(n.kortnavn)}">`)}
        ${q(`Logo-URL`,`<input type="url" class="form-control" name="logourl" value="${A(n.logourl)}">`)}
        <div class="mb-3 form-check">
          <input class="form-check-input" type="checkbox" name="eraktiv" id="eraktiv"${n.eraktiv?` checked`:``}>
          <label class="form-check-label" for="eraktiv">Er aktiv</label>
        </div>
        <button type="submit" class="btn btn-primary mt-2">Lagre</button>
      </form>
    </div>`,e.querySelector(`#klubb-skjema`).addEventListener(`submit`,async n=>{n.preventDefault();let r=new FormData(n.target),{error:i}=await Gn(t,{navn:r.get(`navn`).trim(),kortnavn:r.get(`kortnavn`).trim(),logourl:r.get(`logourl`).trim()||null,eraktiv:r.get(`eraktiv`)===`on`});if(i){bi(e,K(i));return}xi(e,`Klubben er lagra.`)})}function Ri(e,t,n,r,i,a){return e?!n&&!t?`<div class="alert alert-warning">
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
    </div>`}function zi(e,t,n,r){if(!e||t)return``;let i=new Set(n.map(e=>e.kasterid));return`
    <form id="admin-pamelding-skjema" class="card p-3 mb-3 border-warning">
      <h5 class="mb-3">Meld på klubbmedlem</h5>
      <div class="mb-3">
        <label class="form-label">Utøvar</label>
        <select class="form-select" name="admin_kasterid" required>
          <option value="">— vel utøvar —</option>${r.filter(e=>!i.has(e.id)).map(e=>`<option value="${e.id}">${A(e.etternavn)}, ${A(e.fornavn)} — ${A(e.klubb?.navn??``)}</option>`).join(``)}
        </select>
      </div>
      <div id="admin-pm-feil" class="alert alert-danger d-none"></div>
      <button type="submit" class="btn btn-warning">Meld på</button>
    </form>`}function Bi(e){return e.length?`
    <div class="mt-4 mb-3">
      <h5>Andre stevner same helg (same arrangør)</h5>
      <ul class="list-unstyled">${e.map(e=>{let t=e.dato?E(e.dato):``;return`<li><a href="#/stevne/${e.id}/pamelding">${A(e.navn??``)} — ${t}</a></li>`}).join(``)}</ul>
    </div>`:``}function Vi(e,t){if(!e.length)return`<p class="empty-state">Ingen påmeldingar enno.</p>`;let n=e.map(e=>`<tr>
    <td>${e.kaster?`<a href="#/kastere/${e.kaster.id}">${A(e.kaster.fornavn)} ${A(e.kaster.etternavn)}</a>`:`—`}</td>
    <td>${A(e.kaster?.klubb?.navn??``)}</td>
    ${t?`<td><button class="btn btn-sm btn-outline-danger fjern-pm" data-id="${e.id}">Fjern</button></td>`:``}
  </tr>`).join(``);return`<table class="table table-sm">
    <thead><tr><th>Namn</th><th>Klubb</th>${t?`<th></th>`:``}</tr></thead>
    <tbody>${n}</tbody>
  </table>`}function Hi(e,t,n,r,i,a){e.querySelector(`#pamelding-skjema`)?.addEventListener(`submit`,async n=>{n.preventDefault();let o=e.querySelector(`#pm-feil`);if(o.classList.add(`d-none`),r==null)return;let{error:s}=await Ar(a,r,i);if(s){o.textContent=`Feil ved påmelding.`,o.classList.remove(`d-none`);return}Ui(e,t)});let o=e.querySelector(`#admin-pamelding-skjema`);o?.addEventListener(`submit`,async n=>{n.preventDefault();let r=e.querySelector(`#admin-pm-feil`);r.classList.add(`d-none`);let s=new FormData(o),c=Number(s.get(`admin_kasterid`));if(!c){r.textContent=`Vel ein utøvar.`,r.classList.remove(`d-none`);return}let{error:l}=await Ar(a,c,i);if(l){r.textContent=`Feil ved påmelding.`,r.classList.remove(`d-none`);return}Ui(e,t)}),e.querySelector(`#avmeld-knapp`)?.addEventListener(`click`,async()=>{if(r==null)return;let i=n.find(e=>e.kasterid===r);if(!i||!await Y({title:`Avmeld`,message:`Vil du melde deg av?`}))return;let{error:a}=await jr(i.id);a||Ui(e,t)}),e.querySelectorAll(`.fjern-pm`).forEach(n=>{n.addEventListener(`click`,async()=>{if(!await Y({title:`Fjern påmelding`,message:`Fjern påmelding?`}))return;let r=Number(n.dataset.id);if(!r)return;let{error:i}=await jr(r);i||Ui(e,t)})})}async function Ui(e,t={}){let n=t.id;if(!n){e.replaceChildren(O(`Manglande stevne-ID.`));return}let r=Number(n);e.replaceChildren(k(`Laster påmelding…`));try{let[n,i]=await Promise.all([j(),le(r)]);if(i.error||!i.data){e.replaceChildren(O(`Stevnet finst ikkje.`));return}let a=i.data,o=n?.profil?.rolle===`admin`,s=n?.profil?.rolle===`klubbadmin`,c=o||s,l=a.dato?{fraDato:new Date(new Date(a.dato+`T12:00:00`).getTime()-2*864e5).toISOString().slice(0,10),tilDato:new Date(new Date(a.dato+`T12:00:00`).getTime()+2*864e5).toISOString().slice(0,10)}:null,u=c?o?rn():n&&n.klubber.length?sn(n.klubber):Promise.resolve({data:[],error:null}):Promise.resolve({data:[],error:null}),[d,f,p]=await Promise.all([kr(r),a.klubbid!=null&&l?ue(a.klubbid,l.fraDato,l.tilDato,r):Promise.resolve({data:[],error:null}),u]),m=d.data,h=f.data,g=p.data,_=n?.profil?.kasterid??null,v=n?.profil?.kobling_status===`godkjent`,y=_!=null&&m.some(e=>e.kasterid===_),b=a.dato?E(a.dato):``;e.innerHTML=`
      <div class="container py-4 pm-side">
        <h2 class="mb-1">${A(a.navn??``)}</h2>
        <p class="text-muted mb-4">${b}${a.sted?` · `+A(a.sted):``}</p>
        ${Ri(n,c,v,y,a.erfullfort??!1,r)}
        ${zi(c,a.erfullfort??!1,m,g)}
        ${Bi(h)}
        <h5 class="mt-4 mb-2">Påmeldingar (${m.length})</h5>
        ${Vi(m,c)}
      </div>`,n&&Hi(e,t,m,_,n.user.id,r)}catch(t){b(`pamelding.render`,t),e.replaceChildren(O(`Kunne ikkje laste påmelding.`))}}async function Wi(e){await y.removeChannel(e)}var Gi=null;function Ki(){return Gi||(Gi=document.createElement(`div`),Gi.id=`toast-container`,document.body.appendChild(Gi)),Gi}function Z(e,t=`info`){let n=document.createElement(`div`);n.className=`toast-item toast-${t}`,n.textContent=e,n.addEventListener(`click`,()=>n.remove()),Ki().appendChild(n),setTimeout(()=>{n.remove()},4e3)}async function qi(e,t,n,r,i){let{pointValues:a,erArrangor:o=!1,erDeltakar:s=!1,onBekreft:c=null,omgangEl:l=null,p3ks:u=null,hcp1:d=0,hcp2:f=0}=i;if(u&&t.er_tre_spelarar)return Zi(e,t,n,r,u,{pointValues:a,erArrangor:o,erDeltakar:s,onBekreft:c,omgangEl:l});let p=[],m=null,h=null,g=t.er_bekreftet||t.er_walkover,_=o||s&&!t.er_bekreftet;await b(),T();let v=[n?.id,r?.id].filter(e=>e!=null),y=ui(t.id,v,async()=>{await b(),T()},async()=>{t.er_bekreftet=!0,await b(),T()});window.addEventListener(`hashchange`,()=>void Wi(y),{once:!0});async function b(){let e=[n?.id,r?.id].filter(e=>e!=null);if(!e.length)return;let{data:i}=await ii(e),a={};for(let e of i)a[e.omgang]||(a[e.omgang]={omgang:e.omgang,s1:0,s2:0,r1:0,r2:0}),e.kamp_spelar_id===n?.id?(a[e.omgang].s1=e.score??0,a[e.omgang].r1=e.antall_ringer??0):(a[e.omgang].s2=e.score??0,a[e.omgang].r2=e.antall_ringer??0);p=Object.values(a).sort((e,t)=>e.omgang-t.omgang);let[o,s]=S();g=w(o,s)||t.er_bekreftet||t.er_walkover}function x(){return[p.reduce((e,t)=>e+t.s1,0),p.reduce((e,t)=>e+t.s2,0)]}function S(){let[e,t]=x();return[e+d,t+f]}function C(){return[p.reduce((e,t)=>e+t.r1,0),p.reduce((e,t)=>e+t.r2,0)]}function w(e,n){return t.fase===`innledende`?e>=21||n>=21:e>=21&&e-n>=2||n>=21&&n-e>=2}function ee(){return p.length>0?p[p.length-1].omgang+1:1}function te(e,t){let n=new Set,r=new Set;return e!==null&&(a.forEach(t=>{t!==e&&n.add(t)}),[1,2,4].includes(e)?a.forEach(e=>r.add(e)):[1,2,4].forEach(e=>r.add(e))),t!==null&&(a.forEach(e=>{e!==t&&r.add(e)}),[1,2,4].includes(t)?a.forEach(e=>n.add(e)):[1,2,4].forEach(e=>n.add(e))),{p1Dis:n,p2Dis:r}}function T(){e.innerHTML=``;let[i,a]=S(),[u,d]=C(),f=ee(),{p1Dis:v,p2Dis:y}=te(m,h),b=_&&!g&&(m!==null||h!==null),x=g&&!t.er_bekreftet&&(o||s)&&!!c,w=p.length*2;l&&(l.textContent=t.er_bekreftet?`Fullført`:g?`Ferdig`:`Omgang ${f}`);let re=Q(`div`,null,`sb-wrap`);if(re.appendChild(E(Ji(n,`Spelar 1`),i,u,w,m,v,!_,1)),re.appendChild(E(Ji(r,`Spelar 2`),a,d,w,h,y,!_,2)),e.appendChild(re),_){let t=Q(`div`,null,`sb-angre-rad`);p.length>0&&t.appendChild(Yi(p.map(e=>e.omgang),D));let n=Q(`button`,`↩`,`sb-angre-btn`);n.title=`Angre val for denne omgangen`,n.disabled=m===null&&h===null,n.addEventListener(`click`,()=>{m=null,h=null,T()}),t.appendChild(n),e.appendChild(t)}if(x)e.appendChild(Xi(()=>c()));else if(_){let t=Q(`button`,`Neste omgang`,`sb-neste-btn`);t.disabled=!b,t.addEventListener(`click`,ne),e.appendChild(t)}e.querySelectorAll(`[data-spelar]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=parseInt(e.dataset.spelar??`0`),n=parseInt(e.dataset.val??`0`);t===1?m=n:h=n,T()})})}function E(e,t,n,r,i,o,s,c){let l=Q(`div`,null,`sb-spelar-panel`);l.appendChild(Q(`div`,e,`sb-spelar-navn`)),l.appendChild(Q(`div`,String(t),`sb-score`));let u=r>0?Math.round(n/r*100):0;if(l.appendChild(Q(`p`,`Ring: ${n} av ${r} ( ${u}% )`,`sb-ringer-info`)),!s){let e=Q(`div`,null,`sb-knappar`);for(let t of a){let n=Q(`button`,String(t),`sb-poeng-btn`);n.dataset.spelar=String(c),n.dataset.val=String(t),o.has(t)&&(n.disabled=!0),i===t&&n.classList.add(`sb-valgt`),e.appendChild(n)}l.appendChild(e)}return l}async function ne(){let e=ee(),t=m??0,i=h??0,a=t===6?2:+(t===3||t===4),o=i===6?2:+(i===3||i===4),s=[];n?.id&&s.push({kamp_spelar_id:n.id,omgang:e,score:t,antall_ringer:a}),r?.id&&s.push({kamp_spelar_id:r.id,omgang:e,score:i,antall_ringer:o});let{error:c}=await ai(s);if(c){Z(`Feil ved lagring`,`error`);return}p.push({omgang:e,s1:t,s2:i,r1:a,r2:o}),m=null,h=null;let[l,u]=S();w(l,u)&&(g=!0),T()}async function D(e){if(!await Y({title:`Slett omgangar`,message:`Slett omgang ${e} og alle etter? Dette kan ikkje angrast.`,danger:!0}))return;let{error:i}=await si([n?.id,r?.id].filter(e=>e!=null),e);if(i){Z(`Feil ved sletting`,`error`);return}if(t.er_bekreftet){let{error:e}=await oi(t.id);if(e){Z(`Feil ved oppdatering av kampstatus`,`error`);return}t.er_bekreftet=!1}p=p.filter(t=>t.omgang<e),m=null,h=null;let[a,o]=S();g=w(a,o),T()}}function Q(e,t,n){let r=document.createElement(e);return t!=null&&(r.textContent=t),n&&(r.className=n),r}function Ji(e,t=`Spelar`){return e?.kaster?`${e.kaster.fornavn} ${e.kaster.etternavn}`:t}function Yi(e,t){let n=Q(`div`,null,`sb-omg-btns`);for(let r of e){let e=Q(`button`,String(r),`sb-omg-btn`);e.title=`Slett frå omgang ${r}`,e.addEventListener(`click`,()=>t(r)),n.appendChild(e)}return n}function Xi(e){let t=Q(`button`,`Bekreft kamp`,`sb-neste-btn sb-neste-btn--bekreft`);return t.addEventListener(`click`,async()=>{t.disabled=!0,t.textContent=`Lagrar…`,await e()}),t}async function Zi(e,t,n,r,i,a){let{pointValues:o,erArrangor:s=!1,erDeltakar:c=!1,onBekreft:l=null,omgangEl:u=null}=a,d=s||c&&!t.er_bekreftet,f=[n,r,i].filter(e=>e!=null),p=f.map(e=>e.id).filter(e=>e!=null),m=[],h=[],g=[null,null,null];function _(e){return m.filter(t=>t.kamp_spelar_id===f[e]?.id).reduce((e,t)=>e+(t.score??0),0)}function v(){if(!m.length)return[];let e=Math.max(...m.map(e=>e.omgang)),t=new Set([0,1,2].filter(e=>f[e])),n=[],r=[0,0,0];for(let i=1;i<=e;i++){for(let e of t){let t=m.find(t=>t.kamp_spelar_id===f[e].id&&t.omgang===i);t&&(r[e]+=t.score??0)}let e=!0;for(;e&&t.size>1;){e=!1;for(let i of[...t]){let a=[...t].filter(e=>e!==i),o=Math.min(...a.map(e=>r[e]));if(r[i]>=21&&r[i]-o>=2){n.push(i),t.delete(i),e=!0;break}}}}return t.size===1&&n.length===2&&n.push([...t][0]),n}async function y(){if(!p.length)return;let{data:e}=await ii(p);m=e,h=v()}await y();let b=ui(t.id,p,async()=>{await y(),S()},async()=>{t.er_bekreftet=!0,await y(),S()});window.addEventListener(`hashchange`,()=>void Wi(b),{once:!0});function x(e){let t=f.map(()=>new Set),n=e.filter(e=>g[e]!==null);if(!n.length)return t;let r=n.some(e=>[1,2,4].includes(g[e])),i=n.some(e=>[3,6].includes(g[e]));for(let n of e)g[n]===null?r?o.forEach(e=>t[n].add(e)):i&&[1,2,4].forEach(e=>t[n].add(e)):o.forEach(e=>{e!==g[n]&&t[n].add(e)});return t}function S(){e.innerHTML=``;let n=f.map((e,t)=>_(t)),r=[0,1,2].filter(e=>f[e]&&!h.includes(e)),i=h.length===f.length,a=m.length?Math.max(...m.map(e=>e.omgang)):0,s=x(r);u&&(u.textContent=t.er_bekreftet?`Fullført`:i?`Ferdig`:`Omgang ${a+1}`);let c=Q(`div`,null,`sb-wrap sb-wrap--3p`);if(f.forEach((e,r)=>{let a=h.includes(r),l=a?h.indexOf(r)+1:null,u=Q(`div`,null,`sb-spelar-panel${a?` sb-spelar-panel--vann`:``}`);if(u.appendChild(Q(`div`,Ji(e),`sb-spelar-navn`)),u.appendChild(Q(`div`,String(n[r]),`sb-score`)),l&&u.appendChild(Q(`div`,`${l}. plass`,`sb-plass-badge`)),!a&&d&&!i&&!t.er_bekreftet){let e=Q(`div`,null,`sb-knappar`);for(let t of o){let n=Q(`button`,String(t),`sb-poeng-btn`);n.dataset.spelar=String(r),n.dataset.val=String(t),g[r]===t&&n.classList.add(`sb-valgt`),s[r]?.has(t)&&(n.disabled=!0),e.appendChild(n)}u.appendChild(e)}c.appendChild(u)}),e.appendChild(c),d&&!i&&!t.er_bekreftet){let t=Q(`div`,null,`sb-angre-rad`);if(m.length>0){let e=[...new Set(m.map(e=>e.omgang))].sort((e,t)=>e-t);t.appendChild(Yi(e,w))}let n=Q(`button`,`↩`,`sb-angre-btn`);n.title=`Angre val for denne omgangen`,n.disabled=r.every(e=>g[e]===null),n.addEventListener(`click`,()=>{g=[null,null,null],S()}),t.appendChild(n),e.appendChild(t);let i=r.some(e=>g[e]!==null),a=Q(`button`,`Neste omgang`,`sb-neste-btn`);a.disabled=!i,a.addEventListener(`click`,C),e.appendChild(a)}i&&!t.er_bekreftet&&l&&d?e.appendChild(Xi(()=>l(h.map(e=>f[e].kasterid)))):t.er_bekreftet&&e.appendChild(Q(`div`,`Kamp fullført`,`alert alert-success mt-2`)),e.querySelectorAll(`[data-spelar]`).forEach(e=>{e.addEventListener(`click`,()=>{g[parseInt(e.dataset.spelar??`0`)]=parseInt(e.dataset.val??`0`),S()})})}async function C(){let e=[0,1,2].filter(e=>f[e]&&!h.includes(e)),t=m.length?Math.max(...m.map(e=>e.omgang))+1:1,{error:n}=await ai(e.map(e=>{let n=g[e]??0;return{kamp_spelar_id:f[e].id,omgang:t,score:n,antall_ringer:n===6?2:+(n===3||n===4)}}));if(n){Z(`Feil ved lagring`,`error`);return}g=[null,null,null],await y(),S()}async function w(e){if(!await Y({title:`Slett omgangar`,message:`Slett omgang ${e} og alle etter? Dette kan ikkje angrast.`,danger:!0}))return;let{error:n}=await si(p,e);if(n){Z(`Feil ved sletting`,`error`);return}if(t.er_bekreftet){let{error:e}=await oi(t.id);if(e){Z(`Feil ved oppdatering av kampstatus`,`error`);return}t.er_bekreftet=!1}g=[null,null,null],await y(),S()}S()}var Qi=[1,2,3,4,6];async function $i(e,{id:t}){let n=t;e.replaceChildren(k(`Laster…`));let r,i;try{let[t,a]=await Promise.all([Kr(n),j()]);if(!t.data){e.replaceChildren(O(`Kamp ikkje funne.`));return}r=t.data,i=a}catch(t){b(`render:kamp`,t),e.replaceChildren(O(`Feil ved lasting av kamp.`));return}let a=(r.spelarar??[]).map(e=>e.kasterid).filter(e=>e!=null),o=await qr(r.stevneid,a),s=document.querySelector(`.topp-header`);s&&s.classList.add(`skjult`),e.classList.add(`sb-fullskjerm-modus`),window.addEventListener(`hashchange`,()=>{s&&s.classList.remove(`skjult`),e.classList.remove(`sb-fullskjerm-modus`)},{once:!0});let c=r.spelarar??[],l=i?.profil?.kasterid??null,u=i?.profil?.rolle??null,d=u===`admin`||u===`klubbadmin`,f=l!=null&&c.some(e=>e.kasterid===l),p=c.find(e=>e.posisjon===1)??c[0]??null,m=c.find(e=>e.posisjon===2)??c[1]??null,h=r.er_tre_spelarar?c.find(e=>e.posisjon===3)??c[2]??null:null,g=p?o.get(p.kasterid)??0:0,_=m?o.get(m.kasterid)??0:0,v=r.stevne?.navn??``;function y(e,t,n){return`
      <div class="sb-kamp-wrapper">
        <div class="sb-kamp-topbar">
          <div class="sb-kamp-topbar-venstre">
            <button class="sb-tilbake-btn" aria-label="Tilbake">←</button>
            <span class="sb-kamp-stevnenavn">${A(v)}</span>
          </div>
          <div${n?` id="${n}"`:``} class="sb-kamp-topbar-midten">${e}</div>
          <div class="sb-kamp-topbar-høgre">
            <span class="sb-kamp-info-full">Runde ${r.runde_nummer} - Bane ${r.bane_nummer}</span>
            <span class="sb-kamp-info-kort">R${r.runde_nummer} - B${r.bane_nummer}</span>
          </div>
        </div>
        ${t}
      </div>
    `}e.innerHTML=y(`Omgang 1`,`<div id="sb-container" class="sb-page"></div>`,`sb-omgang-tittel`),e.addEventListener(`click`,e=>{e.target.closest(`.sb-tilbake-btn`)&&(history.length>1?history.back():window.close())});let x=e.querySelector(`#sb-container`),S=e.querySelector(`#sb-omgang-tittel`);async function C(){if(d){let{data:e}=await Jr(r.stevneid,r.bane_nummer??0);return e}if(l==null)return null;let{data:e}=await Yr(r.stevneid,l);return e}async function w(e){return e.er_walkover?!1:d?e.bane_nummer===r.bane_nummer:l==null?!1:Xr(e.id,l)}function ee(){sessionStorage.setItem(`ventar-neste-${n}`,`1`),e.innerHTML=y(`Fullført`,`<div class="sb-ventar-innhald">
        <div class="alert alert-success mb-3"><strong>Kampen er ferdig!</strong></div>
        <div class="alert alert-info">Ventar på neste kamp…</div>
      </div>`);let t=ci(r.stevneid,n,async e=>{await w(e)&&(await Wi(t),location.hash=`#/kamp/${e.id}`)});window.addEventListener(`hashchange`,()=>{sessionStorage.removeItem(`ventar-neste-${n}`),Wi(t)},{once:!0})}async function te(){let n=await C();n?location.hash=`#/kamp/${n.id}`:d||f?ee():$i(e,{id:t})}function T(t){e.querySelector(`.sb-feil-banner`)?.remove();let n=document.createElement(`div`);n.className=`sb-feil-banner alert alert-danger m-2`,n.textContent=t,e.prepend(n)}async function E(e){let t={p1:p?{spelarId:p.id,kasterid:p.kasterid,scorePoeng:p.score_poeng}:null,p2:m?{spelarId:m.id,kasterid:m.kasterid,scorePoeng:m.score_poeng}:null};if(r.fase===`avsluttende`){let{error:i}=await Qr({kampId:n,stevneId:r.stevneid,rundeNavn:r.runde_navn,rundeNummer:r.runde_nummer,...t,orderedKasterids:e??null});if(i){T(`Feil ved bekreftelse av kamp.`);return}}else{let{error:e}=await Zr({kampId:n,...t,hcp1:g,hcp2:_,erWalkover:r.er_walkover});if(e){T(`Feil ved bekreftelse av kamp.`);return}}await te()}if(r.er_bekreftet&&sessionStorage.getItem(`ventar-neste-${n}`)){await te();return}x&&await qi(x,r,p,m,{pointValues:Qi,erArrangor:d,erDeltakar:f,onBekreft:E,omgangEl:S,p3ks:h,hcp1:g,hcp2:_})}function ea(e,t,n){let r=(t??[]).filter(t=>t.spelarar?.some(t=>t.kasterid===e)).sort((e,t)=>e.runde_nummer-t.runde_nummer);return r.length?r.map(t=>{let r=t.spelarar?.find(t=>t.kasterid===e),i=t.spelarar?.find(t=>t.kasterid!==e),a=t.er_walkover&&(!i||!i.kaster),o=a?`Walkover`:i?.kaster?`${A(i.kaster.fornavn)} ${A(i.kaster.etternavn)}`:`—`,s=a?``:i?.kasterid?n[i.kasterid]??``:``,c=s?`${o} (${s})`:o,l=`${a?21:Br(r)} - ${a?0:Br(i)}`;return`<tr>
      <td class="text-center">${t.runde_nummer}</td>
      <td class="text-center">${t.bane_nummer??``}</td>
      <td>${c}</td>
      <td class="text-center">${l}</td>
    </tr>`}).join(``):`<tr><td colspan="4" class="text-muted small fst-italic text-center">Ingen kampar</td></tr>`}function ta(e,t,n,r={}){if(e.er_bekreftet)return!1;if(e.er_walkover)return!0;if(n)return!1;let i=r[t[0]?.kasterid]??0,a=r[t[1]?.kasterid]??0,o=Br(t[0]),s=t[1]?Br(t[1]):0;return o+i>=21||s+a>=21}function na(e,t){return`
    <div class="org-hovud-innhald">
      <div class="org-tab-knappar btn-group w-100 mb-2">
        <button class="btn btn-primary org-tab-btn" data-tab="kamper">Kampar</button>
        <button class="btn btn-outline-primary org-tab-btn" data-tab="stilling">Stilling</button>
      </div>
      <div class="d-flex gap-3 align-items-start org-innhald-rad">
        <div class="flex-grow-1 org-kampar-panel">${e}</div>
        <div class="org-stilling-kol">${t}</div>
      </div>
    </div>`}function ra(e){let t=e.querySelector(`.org-hovud-innhald`);t&&e.querySelectorAll(`.org-tab-btn`).forEach(n=>{n.addEventListener(`click`,()=>{let r=n.dataset.tab===`stilling`;t.classList.toggle(`org-vis-stilling`,r),e.querySelectorAll(`.org-tab-btn`).forEach(e=>{e.classList.toggle(`btn-primary`,e.dataset.tab===n.dataset.tab),e.classList.toggle(`btn-outline-primary`,e.dataset.tab!==n.dataset.tab)})})})}function ia(e,t,n,r={}){let{tableId:i=`stilling-tabell`,isAdmin:a=!1,stevneid:o=null,harHcp:s=!1,harGrupper:c=!1,harEliminasjon:l=!1,harAntallKamper:u=!1}=r,d=5+(+!!s+ +!!u),f=u?`th-32`:`th-28`,p=new Map;for(let t of e){let e=c?t.gruppe?.navn??`_`:`_`;p.has(e)||p.set(e,[]),p.get(e).push(t)}let m=p.size>1||!p.has(`_`),h=u?`${e.length} spelarar`:`Stilling`,g=[...p.entries()].sort(([e],[t])=>e===`_`?1:t===`_`?-1:e.localeCompare(t)).flatMap(([e,r])=>(m&&e!==`_`?`<tr><td colspan="${d}" class="fw-semibold ps-2">Gruppe ${A(e)}</td></tr>`:``)+r.map((e,r)=>{let i=l&&e.runde_eliminert!=null,c=e.hcp??0,f=s?a?`<td class="text-center stilling-hcp-celle" data-kasterid="${e.kasterid}" data-stevneid="${o}">${c>0?c:`—`}</td>`:`<td class="text-center">${c>0?c:`—`}</td>`:``,p=u?`<td class="text-center">${e.antall_kamper??0}</td>`:``;return`
        <tr data-kasterid="${e.kasterid}" class="stilling-spelar-rad">
          <td${i?` class="avsl-elim-plass"`:``}>${r+1}</td>
          <td>${e.startnummer??``}</td>
          <td>${A(e.navn??`Spelar ${e.kasterid}`)}</td>
          ${p}
          <td class="text-center">${e.kamp_poeng??0}</td>
          <td class="text-center">${e.score_poeng??0}</td>
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
              <tbody>${ea(e.kasterid,t,n)}</tbody>
            </table>
          </td>
        </tr>`}).join(``)).join(``);return`
    <div>
      <h6 class="text-center fw-bold mb-1">${h}</h6>
      <table id="${i}" class="table table-bordered table-sm mb-0 bg-white">
        <thead class="org-thead">
          <tr>
            <th class="${f}">#</th>
            <th class="${f}">S</th>
            <th>NAMN</th>
            ${u?`<th class="th-50 text-center">ANT.</th>`:``}
            <th class="th-44 text-center">KP</th>
            <th class="th-44 text-center">SP</th>
            ${s?`<th class="th-44 text-center">HCP</th>`:``}
          </tr>
        </thead>
        <tbody>${g}</tbody>
      </table>
    </div>`}function aa(e,t,n=new Set){let r=e.querySelector(`#${t}`);if(!r)return;n.forEach(e=>{let t=r.querySelector(`tr.stilling-detalj[data-kasterid="${e}"]`),n=r.querySelector(`tr.stilling-spelar-rad[data-kasterid="${e}"]`);t&&t.removeAttribute(`hidden`),n&&(n.classList.add(`stilling-aktiv`),n.setAttribute(`aria-expanded`,`true`))}),r.querySelectorAll(`tr.stilling-spelar-rad`).forEach(e=>{e.setAttribute(`tabindex`,`0`),e.hasAttribute(`aria-expanded`)||e.setAttribute(`aria-expanded`,`false`)});function i(e){let t=e.dataset.kasterid;if(!t)return;let i=r.querySelector(`tr.stilling-detalj[data-kasterid="${t}"]`);if(!i)return;let a=!!i.hidden;i.hidden=!a,e.classList.toggle(`stilling-aktiv`,a),e.setAttribute(`aria-expanded`,String(a)),a?n.add(t):n.delete(t)}r.addEventListener(`click`,e=>{let t=e.target.closest(`tr.stilling-spelar-rad`);t&&i(t)}),r.addEventListener(`keydown`,e=>{if(e.key!==`Enter`&&e.key!==` `)return;let t=e.target.closest(`tr.stilling-spelar-rad`);t&&(e.preventDefault(),i(t))})}function oa(e,t,n,r,i){return function(){let a=location.hash;t.some(t=>a===`#/stevne/${e}/${t}`)?r(n,e):i()}}function sa(e,t){return`
    ${t?`<button id="neste-runde-btn" class="btn btn-sm btn-warning">Generer neste runde</button>`:``}
    <button id="fullfør-turnering-btn" class="btn btn-sm btn-danger"${e.erfullfort?` disabled`:``}>Fullfør turnering</button>
    <button id="test-autofullfør-btn" class="btn btn-sm btn-outline-warning">TEST: Autofullfør</button>
  `}function ca(e,t){let{alleInnlBekrefta:n,harAvslKampar:r,harGruppefordeling:i,harPrekonfigurertFormat:a=!1}=t,o=e.stevne_fase,s=``;return o===`avsluttende`?i&&i&&!r&&(s=`<button id="endre-gruppeinndeling-btn" class="btn btn-sm btn-outline-secondary">Endre gruppeinndeling</button>`):s=n?`
        <button id="start-avsl-btn" class="btn btn-sm btn-success">Start avsluttande fase</button>
        ${a?`<button id="endre-gruppeinndeling-btn" class="btn btn-sm btn-outline-secondary">Endre gruppefordeling</button>`:``}`:`<span class="badge bg-warning text-dark">Innledande fase er ikkje ferdig</span>`,`
    ${s}
    <button id="fullfør-turnering-btn" class="btn btn-sm btn-danger"${e.erfullfort?` disabled`:``}>Fullfør turnering</button>
  `}function la(e,t){let n={},r=new Set;for(let i of e){let[,e]=i.er_walkover?zr(i.spelarar,t):[null,null];for(let a of i.spelarar??[])!a.kasterid||!a.kaster||i.er_walkover&&a.kasterid===e?.kasterid||(r.add(a.kasterid),n[a.kasterid]||(n[a.kasterid]={kasterid:a.kasterid,navn:`${a.kaster.fornavn} ${a.kaster.etternavn}`,startnummer:t[a.kasterid]??null,kamp_poeng:0,score_poeng:0,antall_kamper:0}),i.er_bekreftet&&(n[a.kasterid].kamp_poeng+=a.kamp_poeng,n[a.kasterid].score_poeng+=a.score_poeng,n[a.kasterid].antall_kamper+=1))}return{spelMap:n,ekteKasterids:r}}function ua(e,t){let n=t.filter(e=>e.er_bekreftet);return[...e].sort((e,t)=>{let r=e.runde_eliminert==null;if(r!==(t.runde_eliminert==null))return r?-1:1;if(!r){let n=(t.runde_eliminert??0)-(e.runde_eliminert??0);if(n!==0)return n;let r=e.plassering??1/0,i=t.plassering??1/0;if(r!==i)return r-i}if(t.kamp_poeng!==e.kamp_poeng)return(t.kamp_poeng??0)-(e.kamp_poeng??0);if(t.score_poeng!==e.score_poeng)return(t.score_poeng??0)-(e.score_poeng??0);let i=0,a=0;for(let r of n){let n=r.spelarar?.find(t=>t.kasterid===e.kasterid),o=r.spelarar?.find(e=>e.kasterid===t.kasterid);n&&o&&(i+=n.kamp_poeng??0,a+=o.kamp_poeng??0)}if(i!==a)return a-i;let o=e=>n.flatMap(t=>t.spelarar?.filter(t=>t.kasterid===e)??[]).map(e=>Br(e)).sort((e,t)=>t-e),s=o(e.kasterid),c=o(t.kasterid);for(let e=0;e<Math.min(s.length,c.length);e++)if(c[e]!==s[e])return c[e]-s[e];return(e.startnummer??1/0)-(t.startnummer??1/0)})}function da(){return crypto.randomUUID()}async function fa(e,t,n){let{data:r,error:i}=await y.from(`pamelding`).select(`id, kasterid, kaster(klubbid)`).eq(`stevneid`,e).order(`id`);if(i)throw Error(`Feil ved henting av påmelding: `+i.message);if(!r?.length)throw Error(`Ingen spelarar påmelde.`);for(let e=r.length-1;e>0;e--){let t=Math.floor(Math.random()*(e+1));[r[e],r[t]]=[r[t],r[e]]}let a=r.length,o={},s=r.map((t,n)=>{o[n+1]=t.kasterid;let r=t.kaster?.klubbid??null;return{stevneid:e,kasterid:t.kasterid,klubbid:r,startnummer:n+1}});await y.from(`resultat`).delete().eq(`stevneid`,e);let{error:c}=await y.from(`resultat`).insert(s);if(c)throw Error(`Feil ved lagring av startnummer: `+c.message);return t.toLowerCase().includes(`gloppen`)?pa(e,o,a,n):ma(e,o,a)}async function pa(e,t,n,r){let i=(n%2==0?n:n+1)/2,a=0;for(let o=1;o<=r;o++){let r=[],s=[];for(let t=1;t<=i;t++){let a=(t-1+o-1)%i+1,c=(t-1+2*(o-1))%i+1+i,l=c>n;r.push({match_id:da(),stevneid:e,fase:`innledende`,runde_nummer:o,bane_nummer:t,er_bekreftet:!1,er_walkover:l}),s.push({p1Pos:a,p2Pos:c,erWalkover:l})}let{data:c,error:l}=await y.from(`kamp`).insert(r).select(`id, bane_nummer`);if(l)throw Error(`Feil ved innsetting av kampar (runde ${o}): `+l.message);let u=Object.fromEntries(c.map(e=>[e.bane_nummer,e.id])),d=[];for(let e=0;e<i;e++){let n=u[e+1],{p1Pos:r,p2Pos:i,erWalkover:a}=s[e];d.push({kampid:n,kasterid:t[r],posisjon:1,score_poeng:0,kamp_poeng:0,antall_ringer:0}),a||d.push({kampid:n,kasterid:t[i],posisjon:2,score_poeng:0,kamp_poeng:0,antall_ringer:0})}let{error:f}=await y.from(`kamp_spelar`).insert(d);if(f)throw Error(`Feil ved innsetting av spelarar (runde ${o}): `+f.message);a+=c.length}return a}async function ma(e,t,n){let r=[],i=[],a=1;for(let t=1;t<=n;t+=2){let o=t+1>n;r.push({match_id:da(),stevneid:e,fase:`innledende`,runde_nummer:1,bane_nummer:a,er_bekreftet:!1,er_walkover:o}),i.push({p1Pos:t,p2Pos:o?null:t+1,erWalkover:o}),a++}let{data:o,error:s}=await y.from(`kamp`).insert(r).select(`id, bane_nummer`);if(s)throw Error(`Feil ved innsetting av Swiss runde 1: `+s.message);let c=Object.fromEntries(o.map(e=>[e.bane_nummer,e.id])),l=[];for(let e=0;e<i.length;e++){let n=c[e+1],{p1Pos:r,p2Pos:a,erWalkover:o}=i[e];l.push({kampid:n,kasterid:t[r],posisjon:1,score_poeng:0,kamp_poeng:0,antall_ringer:0}),o||l.push({kampid:n,kasterid:t[a],posisjon:2,score_poeng:0,kamp_poeng:0,antall_ringer:0})}let{error:u}=await y.from(`kamp_spelar`).insert(l);if(u)throw Error(`Feil ved innsetting av Swiss spelarar: `+u.message);return o.length}async function ha(e){let{data:t,error:n}=await y.from(`kamp`).select(`id, runde_nummer, er_bekreftet, er_walkover, spelarar:kamp_spelar(kasterid, kamp_poeng, score_poeng, posisjon)`).eq(`stevneid`,e).eq(`fase`,`innledende`).order(`runde_nummer`);if(n)throw Error(`Feil ved henting av kampar: `+n.message);let r=t,i=Math.max(...t.map(e=>e.runde_nummer))+1,a=new Set;for(let e of r)for(let t of e.spelarar??[])t.kasterid!=null&&a.add(t.kasterid);let o=[...a],s={};for(let e of o)s[e]=o.filter(t=>t!==e);for(let e of r){let t=(e.spelarar??[]).filter(e=>e.kasterid!=null);if(t.length===2){let e=t[0].kasterid,n=t[1].kasterid;s[e]=s[e].filter(e=>e!==n),s[n]=s[n].filter(t=>t!==e)}}let c={};for(let e of o)c[e]=0;for(let e of t){if(!e.er_walkover)continue;let t=(e.spelarar??[]).find(e=>e.posisjon===1);t?.kasterid!=null&&(c[t.kasterid]=(c[t.kasterid]??0)+1)}let l=ua(o.map(e=>{let n=0,i=0;for(let t of r){let r=(t.spelarar??[]).find(t=>t.kasterid===e);r&&(n+=r.kamp_poeng??0,i+=0)}for(let n of t){let t=(n.spelarar??[]).find(t=>t.kasterid===e);t&&(i+=t.score_poeng??0)}return{kasterid:e,kamp_poeng:n,score_poeng:i}}),r);function u(e){for(let t=e.length-1;t>=0;t--)if((c[e[t].kasterid]??0)<1)return e[t];return null}function d(e,t){if(e.length===0)return t;if(e.length%2==1){let n=u(e);return n?(c[n.kasterid]++,t.push({p1:n.kasterid,p2:null,erWalkover:!0}),d(e.filter(e=>e.kasterid!==n.kasterid),t)||(c[n.kasterid]--,t.pop(),null)):null}for(let n=0;n<e.length;n++){let r=e[n];for(let i=n+1;i<e.length;i++){let n=e[i];if(s[r.kasterid]?.includes(n.kasterid)){t.push({p1:r.kasterid,p2:n.kasterid,erWalkover:!1});let i=d(e.filter(e=>e.kasterid!==r.kasterid&&e.kasterid!==n.kasterid),t);if(i)return i;t.pop()}}}return null}let f=d(l,[]);if(!f)throw Error(`Paring er ikkje mogleg. Alle moglege motstandarar er allereie spela.`);f.sort((e,t)=>!!e.erWalkover-+!!t.erWalkover);let p=f.map((t,n)=>({match_id:da(),stevneid:e,fase:`innledende`,runde_nummer:i,bane_nummer:n+1,er_bekreftet:!1,er_walkover:t.erWalkover})),{data:m,error:h}=await y.from(`kamp`).insert(p).select(`id, bane_nummer`);if(h)throw Error(`Feil ved innsetting av ny Swiss-runde: `+h.message);let g=Object.fromEntries(m.map(e=>[e.bane_nummer,e.id])),_=[];for(let e=0;e<f.length;e++){let{p1:t,p2:n,erWalkover:r}=f[e],i=g[e+1];_.push({kampid:i,kasterid:t,posisjon:1,score_poeng:0,kamp_poeng:0,antall_ringer:0}),r||_.push({kampid:i,kasterid:n,posisjon:2,score_poeng:0,kamp_poeng:0,antall_ringer:0})}let{error:v}=await y.from(`kamp_spelar`).insert(_);if(v)throw Error(`Feil ved innsetting av Swiss spelarar: `+v.message);return{rundeNummer:i,antallKampar:m.length}}async function ga(e,{id:t,isAdmin:n=!1},r=null){e.replaceChildren(k());try{let[i,a,o]=await Promise.all([de(t),Mr(t),j()]);if(i.error||!i.data){e.replaceChildren(O(`Stevne ikkje funne.`));return}let s=i.data,c=s.stevne_fase??null,l=c===null||c===`ikke_startet`,u=s.kastemetodeInnl?.navn??`—`,d=u.toLowerCase().includes(`gloppen`);r&&l&&n&&(r.innerHTML=`<button id="start-stevne-btn" class="btn btn-sm btn-success">Start stevne</button>`,r.querySelector(`#start-stevne-btn`).addEventListener(`click`,async()=>{if(a<2){Z(`Stevnet må ha minst 2 spelarar for å startast.`,`error`);return}if(d&&!s.antall_runder_innl){Z(`Du må setje antal rundar for innledande fase. Gå til Innstillingar for å endre.`,`error`);return}let e=await Nr(t);if(e>0&&!await Y({title:`Ubekrefta spelarar`,message:`${e} spelar(ar) er ikkje bekrefta. Vil du starte stevnet likevel?`}))return;try{await fa(t,u,s.antall_runder_innl??1)}catch(e){Z(`Feil ved kampgenerering: `+(e instanceof Error?e.message:String(e)),`error`);return}let{error:n}=await fe(t,`innledende`);if(n){Z(`Feil ved oppdatering av fase.`,`error`);return}location.hash=`#/stevne/${t}/innledende`})),e.innerHTML=`
      <div class="card mb-3 org-max-480">
        <div class="card-body">
          <table class="table table-sm mb-0">
            <tbody>
              <tr><th>Stad</th><td>${A(s.sted??`—`)}</td></tr>
              <tr><th>Dato</th><td>${s.dato?ne(s.dato):`—`}</td></tr>
              <tr><th>Tid</th><td>${s.tid?re(s.tid):`—`}</td></tr>
              <tr><th>Kastemetode innledande</th><td>${A(u)}</td></tr>
              <tr><th>Kastemetode avsluttande</th><td>${A(s.kastemetodeAvsl?.navn??`—`)}</td></tr>
              <tr><th>Antal rundar innledande</th><td>${s.antall_runder_innl??`—`}</td></tr>
              <tr><th>Påmelde spelarar</th><td>${a}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <div id="info-handling-knapper" class="mb-3 d-flex gap-2 flex-wrap"></div>`;let f=e.querySelector(`#info-handling-knapper`),p=s.erfullfort??!1;if(o?.profil?.kobling_status===`godkjent`&&!p){let e=document.createElement(`a`);e.href=`#/stevne/${t}/pamelding`,e.className=`btn btn-sm btn-primary`,e.textContent=`Meld deg på`,f.appendChild(e)}let m=document.createElement(`a`);m.href=`#/stevne/${t}/pamelding`,m.className=`btn btn-sm btn-outline-secondary`,m.textContent=`Sjå påmeldingar`,f.appendChild(m)}catch(t){b(`stevne-info.render`,t),e.replaceChildren(O(`Kunne ikkje laste info.`))}}function _a(e){return[...e].sort((e,t)=>{let n=(e.klubb?.navn??``).localeCompare(t.klubb?.navn??``,`nb`);if(n!==0)return n;let r=(e.etternavn??``).localeCompare(t.etternavn??``,`nb`);return r===0?(e.fornavn??``).localeCompare(t.fornavn??``,`nb`):r})}function va(e,t,n){let r=t.toLowerCase();return e.filter(e=>n.has(e.id)?!1:!r||a(e).toLowerCase().includes(r)||(e.klubb?.navn??``).toLowerCase().includes(r))}function ya(e){let t=document.createElement(`div`);t.className=`d-flex flex-column flex-grow-1`;let n=document.createElement(`h6`);n.textContent=e,n.className=`fw-bold mb-1`;let r=document.createElement(`div`);r.className=`border rounded deltaker-tabell-wrapper flex-grow-1 overflow-auto`;let i=document.createElement(`table`);return i.className=`table table-sm table-hover table-bordered mb-0`,r.appendChild(i),t.appendChild(n),t.appendChild(r),{kolonne:t,tabell:i,tittelEl:n}}function ba(e,t,n,r,i){let o=document.createElement(`tr`),s=document.createElement(`td`);if(s.className=`text-center th-40`,t){let e=document.createElement(`span`);e.className=`text-success fw-bold`,e.textContent=`✓`,s.appendChild(e)}else if(!i){let t=document.createElement(`button`);t.textContent=`✓`,t.className=`btn btn-outline-danger btn-sm rounded-circle p-0 lh-1 deltaker-bekreft-btn`,t.title=`Bekreft spelar`,t.addEventListener(`click`,t=>{t.stopPropagation(),r(e)}),s.appendChild(t)}let c=document.createElement(`td`);c.textContent=a(e);let l=document.createElement(`td`);l.textContent=e.klubb?.navn??``;let u=document.createElement(`td`);if(u.className=`text-center th-40`,!i){let t=document.createElement(`button`);t.innerHTML=`&times;`,t.className=`btn btn-danger btn-sm rounded-circle p-0 lh-1 deltaker-fjern-btn`,t.title=`Fjern spelar`,t.addEventListener(`click`,t=>{t.stopPropagation(),n(e)}),u.appendChild(t)}return o.appendChild(s),o.appendChild(c),o.appendChild(l),o.appendChild(u),o}function xa(e,t,n){let r=document.createElement(`tr`),i=document.createElement(`td`);i.textContent=a(e);let o=document.createElement(`td`);return o.textContent=e.klubb?.navn??`Ingen klubb`,n||(r.classList.add(`deltaker-rad`),r.addEventListener(`click`,()=>t(e))),r.appendChild(i),r.appendChild(o),r}function Sa(e,t){let n=document.createElement(`tr`),r=document.createElement(`td`);return r.className=`text-center text-muted fst-italic py-3`,r.textContent=e,r.colSpan=t,n.appendChild(r),n}async function Ca(e,{id:t,isAdmin:n=!1}){e.replaceChildren(k());try{let[r,i,a]=await Promise.all([Se(t),rn(),Pr(t)]);if(r.error||!r.data){e.replaceChildren(O(`Stevne ikkje funne.`));return}if(i.error){e.replaceChildren(O(`Kunne ikkje laste kasterliste.`));return}let o=r.data.stevne_fase??null,s=n&&(o===null||o===`ikke_startet`),c=i.data,l=new Map;for(let e of a.data)e.kasterid!=null&&l.set(e.kasterid,e.er_bekreftet??!1);e.innerHTML=`
      <div>
        ${s?``:`<div class="alert alert-warning py-2">Spelarar kan ikkje endrast etter at stevnet er starta.</div>`}
        <div class="row g-3" id="spelarar-layout"></div>
      </div>`;let u=e.querySelector(`#spelarar-layout`),d=document.createElement(`div`);d.className=`col-md-6 d-flex flex-column`;let f=document.createElement(`input`);f.type=`text`,f.placeholder=`Søk etter navn eller klubb…`,f.className=`form-control mb-2`;let{kolonne:p,tabell:m}=ya(`Tilgjengelege spelarar`);d.appendChild(f),d.appendChild(p),u.appendChild(d);let h=document.createElement(`div`);h.className=`col-md-6 d-flex flex-column`;let g=document.createElement(`input`);g.type=`text`,g.className=`form-control mb-2 deltaker-search-spacer`,g.tabIndex=-1,g.disabled=!0;let{kolonne:_,tabell:v,tittelEl:y}=ya(`Påmelde spelarar`);h.appendChild(g),h.appendChild(_),u.appendChild(h);function b(){v.innerHTML=``;let e=_a(c.filter(e=>l.has(e.id)));if(y.textContent=`Påmelde spelarar: ${e.length}`,!e.length){v.appendChild(Sa(`Ingen spelarar påmelde`,4));return}for(let n of e)v.appendChild(ba(n,l.get(n.id)??!1,async e=>{let{error:n}=await Lr(t,e.id);if(n){Z(`Feil ved fjerning: `+(n instanceof Error?n.message:String(n)),`error`);return}l.delete(e.id),b(),x()},async e=>{let{error:n}=await Ir(t,e.id);if(n){Z(`Feil ved bekreftelse: `+(n instanceof Error?n.message:String(n)),`error`);return}l.set(e.id,!0),b()},!s))}function x(){let e=_a(va(c,f.value,l));if(m.innerHTML=``,!e.length){m.appendChild(Sa(`Ingen spelarar funne`,2));return}for(let n of e)m.appendChild(xa(n,async e=>{let{error:n}=await Fr(t,e.id);if(n){Z(`Feil ved innmelding: `+(n instanceof Error?n.message:String(n)),`error`);return}l.set(e.id,!1),b(),x()},!s))}f.addEventListener(`input`,x),b(),x()}catch(t){b(`stevne-deltakere.render`,t),e.replaceChildren(O(`Kunne ikkje laste deltakarliste.`))}}var wa=`modulepreload`,Ta=function(e){return`/dev/`+e},Ea={},Da=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e=document.getElementsByTagName(`link`),i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}r=o(t.map(t=>{if(t=Ta(t,n),t in Ea)return;Ea[t]=!0;let r=t.endsWith(`.css`),i=r?`[rel="stylesheet"]`:``;if(n)for(let n=e.length-1;n>=0;n--){let i=e[n];if(i.href===t&&(!r||i.rel===`stylesheet`))return}else if(document.querySelector(`link[href="${t}"]${i}`))return;let o=document.createElement(`link`);if(o.rel=r?`stylesheet`:wa,r||(o.as=`script`),o.crossOrigin=``,o.href=t,a&&o.setAttribute(`nonce`,a),document.head.appendChild(o),r)return new Promise((e,n)=>{o.addEventListener(`load`,e),o.addEventListener(`error`,()=>n(Error(`Unable to preload CSS for ${t}`)))})}))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})};async function Oa(e,{id:t,isAdmin:n=!1},r=null){e.replaceChildren(k());let{navn:i,error:a}=await je(t);if(a){e.replaceChildren(O(`Stevne ikkje funne.`));return}if(i.includes(`gloppen`)){let{render:i}=await Da(async()=>{let{render:e}=await import(`./gloppen-CKTkwsKt.js`);return{render:e}},__vite__mapDeps([0,1,2]));await i(e,{id:t,isAdmin:n},r)}else if(i.includes(`nordhordland`)){let{render:i}=await Da(async()=>{let{render:e}=await import(`./nordhordland-DhYIBI9D.js`);return{render:e}},__vite__mapDeps([3,1,2]));await i(e,{id:t,isAdmin:n},r)}else if(i.includes(`x-kast`)||i.includes(`minimatch`)||i.includes(`halvmatch`)||i.includes(`heilmatch`)){let{render:i}=await Da(async()=>{let{render:e}=await import(`./xkast-B8Z107jY.js`);return{render:e}},[]);await i(e,{id:t,isAdmin:n},r)}else e.replaceChildren(O(`Ukjend innledande kastemetode: ${i||`(ikkje sett)`}`))}async function ka(e,{id:t,isAdmin:n=!1},r=null){e.replaceChildren(k());let{navn:i,error:a}=await Me(t);if(a){e.replaceChildren(O(`Stevne ikkje funne.`));return}if(i.includes(`cup`)){let{render:i}=await Da(async()=>{let{render:e}=await import(`./cup-Ci3J--6B.js`);return{render:e}},__vite__mapDeps([4,2]));await i(e,{id:t,isAdmin:n},r)}else if(i.includes(`kongelag`)){let{render:i}=await Da(async()=>{let{render:e}=await import(`./kongelag-C5epeD03.js`);return{render:e}},[]);await i(e,{id:t,isAdmin:n},r)}else if(i.includes(`nordhordland`)){let{render:i}=await Da(async()=>{let{render:e}=await import(`./nordhordland-0FUVmjne.js`);return{render:e}},[]);await i(e,{id:t,isAdmin:n},r)}else e.replaceChildren(O(`Ukjend avsluttande kastemetode: ${i||`(ikkje sett)`}`))}y.from(`kamp`).select(`id, er_walkover, spelarar:kamp_spelar(id, kasterid)`);function Aa(){let e=Math.floor(Math.random()*27),t=Math.floor(Math.random()*27);return e<21&&t<21?Math.random()<.5?[Math.floor(Math.random()*6)+21,t]:[e,Math.floor(Math.random()*6)+21]:[e,t]}async function ja(e){let{data:t,error:n}=await y.from(`kamp`).select(`id, er_walkover, spelarar:kamp_spelar(id, kasterid)`).eq(`stevneid`,e).eq(`fase`,`innledende`).eq(`er_bekreftet`,!1);if(n){b(`autoFullforInnledendeKamper`,n);return}if(t?.length)for(let e of t){let[t,n]=e.spelarar??[],[r,i]=e.er_walkover?[21,0]:Aa(),[a,o]=Rr(r,i);try{let s=[y.from(`kamp`).update({er_bekreftet:!0}).eq(`id`,e.id)];t&&s.push(y.from(`kamp_spelar`).update({score_poeng:r,kamp_poeng:a}).eq(`id`,t.id)),n&&s.push(y.from(`kamp_spelar`).update({score_poeng:i,kamp_poeng:o}).eq(`id`,n.id)),await Promise.all(s)}catch(e){b(`autoFullforInnledendeKamper:update`,e)}}}async function Ma(e,t){let{data:n,error:r}=await y.from(`kamp`).select(`id`).eq(`stevneid`,e).eq(`fase`,t);if(r){b(`slettKamperForFase:kamp`,r);return}let i=(n??[]).map(e=>e.id);if(!i.length)return;let{data:a,error:o}=await y.from(`kamp_spelar`).select(`id`).in(`kampid`,i);if(o){b(`slettKamperForFase:spelar`,o);return}let s=(a??[]).map(e=>e.id);if(s.length){let{error:e}=await y.from(`kamp_omgang`).delete().in(`kamp_spelar_id`,s);if(e){b(`slettKamperForFase:omgang`,e);return}let{error:t}=await y.from(`kamp_spelar`).delete().in(`kampid`,i);if(t){b(`slettKamperForFase:spelarDel`,t);return}}let{error:c}=await y.from(`kamp`).delete().in(`id`,i);c&&b(`slettKamperForFase:kampDel`,c)}async function Na(e){await Ma(e,`avsluttende`),await Ma(e,`innledende`);let{error:t}=await y.from(`resultat`).delete().eq(`stevneid`,e);if(t){b(`nullstillStevne:resultat`,t);return}let{error:n}=await y.from(`stevne`).update({stevne_fase:`ikke_startet`,runde1_format:null}).eq(`id`,e);n&&b(`nullstillStevne:stevne`,n)}async function Pa(e,{id:t}){e.replaceChildren(k());try{let[n,r]=await Promise.all([De(t),Oe()]);if(n.error||!n.data){e.replaceChildren(O(`Stevne ikkje funne.`));return}let i=n.data,a=r.data,o=a.filter(e=>e.er_innledende),s=a.filter(e=>e.er_avsluttende);function c(e,t){return e.map(e=>`<option value="${e.id}"${e.id===t?` selected`:``}>${A(e.navn)}</option>`).join(``)}e.innerHTML=`
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
      </div>`,e.querySelector(`#innstillingar-form`).addEventListener(`submit`,async n=>{n.preventDefault();let r=e.querySelector(`#innl-metode`).value||null,i=e.querySelector(`#avsl-metode`).value||null,a=e.querySelector(`#antall-rundar`).value,{error:o}=await ke(t,{innledendekastemetodeid:r?Number(r):null,avsluttendekastemetodeid:i?Number(i):null,antall_runder_innl:a?Number(a):null});if(o){b(`stevne-innstillingar.lagre`,o),Z(`Feil ved lagring: `+(o instanceof Error?o.message:String(o)),`error`);return}let s=e.querySelector(`#lagre-status`);s.classList.remove(`d-none`),setTimeout(()=>{s.classList.add(`d-none`)},2e3)}),e.querySelector(`#nullstill-btn`).addEventListener(`click`,async n=>{let r=n.currentTarget;await Y({title:`Nullstill stevne`,message:`Dette slettar alle kampar og resultat og set stevnet tilbake til starttilstanden. Er du sikker?`,danger:!0})&&(r.disabled=!0,await Na(t),await Pa(e,{id:t}))})}catch(t){b(`stevne-innstillingar.render`,t),e.replaceChildren(O(`Kunne ikkje laste innstillingar.`))}}y.from(`stevne`).select(`
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
  `);async function Fa(e){let{data:t,error:n}=await y.from(`stevne`).select(`
      id, navn, sted, dato, erfullfort, resultaturl, juryleder, klubbid,
      stevnetype:stevnetypeid(navn),
      kategori:kategoriid(navn),
      kontakt:kontaktkasterid(fornavn, etternavn),
      innledende:innledendekastemetodeid(navn),
      avsluttende:avsluttendekastemetodeid(navn)
    `).eq(`id`,e).maybeSingle();return n&&b(`hentStevneMedDetaljer`,n),{data:t,error:n}}y.from(`resultat`).select(`kasterid, startnummer, hcp`);async function Ia(e){let{data:t,error:n}=await y.from(`resultat`).select(`kasterid, startnummer, hcp`).eq(`stevneid`,e);return n&&b(`hentResultatForInnledende`,n),{data:t??[],error:n}}async function La(e,t,n){let{error:r}=await y.from(`resultat`).update({hcp:n}).eq(`stevneid`,e).eq(`kasterid`,t);return r&&b(`oppdaterResultatHcp`,r),{error:r}}y.from(`resultat`).select(`
  kasterid, startnummer, plassering, runde_eliminert,
  kamp_poeng_innl, score_poeng_innl,
  gruppe:gruppeid(id, navn)
`);async function Ra(e){let{data:t,error:n}=await y.from(`resultat`).select(`
      kasterid, startnummer, plassering, runde_eliminert,
      kamp_poeng_innl, score_poeng_innl,
      gruppe:gruppeid(id, navn)
    `).eq(`stevneid`,e);return n&&b(`hentResultatForAvsluttende`,n),{data:t??[],error:n}}async function za(e){let{data:t,error:n}=await y.from(`gruppe`).select(`id, navn`).in(`navn`,e);return n&&b(`hentGrupper`,n),{data:t??[],error:n}}async function Ba(e,t){if(!t.length)return{error:null};let n=(await Promise.all(t.map(t=>y.from(`resultat`).update({gruppeid:t.gruppeid}).eq(`stevneid`,e).eq(`kasterid`,t.kasterid)))).find(e=>e.error)?.error??null;return n&&b(`setGruppeInndeling`,n),{error:n}}async function Va(e){let{error:t}=await y.from(`resultat`).update({gruppeid:null}).eq(`stevneid`,e);return t&&b(`clearGruppeInndeling`,t),{error:t}}async function Ha(e){let{data:t,error:n}=await y.from(`resultat`).select(`
      plassering, nc_poeng,
      kaster:kasterid(id, fornavn, etternavn),
      klubb:klubbid(navn),
      klasse:klasseid(navn),
      gruppe:gruppeid(navn)
    `).eq(`stevneid`,e).order(`plassering`);return n&&b(`hentResultaterForStevne`,n),{data:t??[],error:n}}function Ua(e,t){let n=new Map;for(let r of e){let e=r.gruppe?.navn??`–`,i=r.klasse?.navn??null,a=t?`${i??``}|${e}`:e,o=t?`${i?i+` `:``}${e}`:e;n.has(a)||n.set(a,{label:o,rader:[]}),n.get(a).rader.push(r)}return[...n.values()].sort((e,t)=>e.label.localeCompare(t.label,`nb`))}function Wa(e){let t=e.rader.map(e=>`
    <div class="res-rad">
      <span class="res-pl">${e.plassering??`–`}.</span>
      <div class="res-info">
        <span class="res-navn">${A(a(e.kaster)||`–`)}</span>
        <span class="res-klubb">${A(e.klubb?.navn??`–`)}</span>
      </div>
    </div>`).join(``);return`
    <div class="res-gruppe">
      <h2 class="res-gruppe-tittel">${A(e.label)}</h2>
      <div class="res-gruppe-rader">${t}</div>
    </div>`}function Ga(e){let t=e.rader.map(e=>{let t=e.kaster,n=t?`<a href="#/kastere/${s(t)}" class="res-kaster-lenke">${A(a(t))}</a>`:`–`;return`
      <tr>
        <td class="res-td-pl">${e.plassering??`–`}</td>
        <td class="res-td-navn">${n}</td>
        <td class="res-td-klubb">${A(e.klubb?.navn??`–`)}</td>
        <td class="res-td-nc">${e.nc_poeng==null?``:e.nc_poeng}</td>
      </tr>`}).join(``);return`
    <div class="res-tabell-seksjon">
      <table class="res-tabell">
        <thead>
          <tr class="res-thead-gruppe">
            <td colspan="4" class="res-td-gruppe-header">${A(e.label)}</td>
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
    </div>`}async function Ka(e,{id:t}){e.replaceChildren(k(`Laster resultat…`));try{let[n,r]=await Promise.all([Fa(t),Ha(t)]);if(n.error||!n.data){e.replaceChildren(O(`Kunne ikkje laste stevnet.`));return}if(r.error){e.replaceChildren(O(`Kunne ikkje laste resultat.`));return}let i=n.data,a=r.data;if(!a.length){e.replaceChildren(I(i.erfullfort?`Ingen resultat registrert.`:`Turneringa er ikkje avslutta enno.`));return}let o=Ua(a,(i.dato?new Date(i.dato+`T12:00:00`).getFullYear():9999)<2026),s=a.length;e.innerHTML=`
      <div class="res-side">
        <div class="res-felles">
          ${i.resultaturl?.startsWith(`http`)?`<a class="res-pdf-lenke" href="${A(i.resultaturl)}" target="_blank" rel="noopener">Resultat som pdf 📄</a>`:``}
          ${i.juryleder?`<p class="res-klassifisering">Juryleder: ${A(i.juryleder)}</p>`:``}
          <p class="res-antall"><strong>Antall deltakarar: ${s}</strong></p>
        </div>
        <div class="res-mobil-blokk">
          ${o.map(Wa).join(``)}
        </div>
        <div class="res-desktop-blokk">
          ${o.map(Ga).join(``)}
        </div>
      </div>`}catch(t){b(`stevne-resultat.render`,t),e.replaceChildren(O(`Kunne ikkje laste resultat.`))}}var qa=[{key:`info`,label:`Info`,adminOnly:!1},{key:`deltakere`,label:`Deltakere`,adminOnly:!0},{key:`innledende`,label:`Innledande`,adminOnly:!1},{key:`avsluttende`,label:`Avsluttande`,adminOnly:!1},{key:`resultat`,label:`Sluttresultat`,adminOnly:!1},{key:`innstillinger`,label:`Innstillingar`,adminOnly:!0}],Ja=new Set(qa.filter(e=>e.adminOnly).map(e=>e.key)),Ya={info:ga,deltakere:Ca,innledende:Oa,avsluttende:ka,innstillinger:Pa,resultat:Ka},Xa={ikke_startet:`<span class="badge bg-secondary">Ikkje starta</span>`,innledende:`<span class="badge bg-primary">Innledande fase</span>`,avsluttende:`<span class="badge bg-success">Avsluttande fase</span>`};function Za(e,t,n,r){return`<ul class="nav nav-tabs mb-3">${qa.filter(e=>n||!e.adminOnly).filter(e=>e.key!==`avsluttende`||r).map(({key:n,label:r})=>`
      <li class="nav-item">
        <a class="nav-link${t===n?` active`:``}"
           href="#/stevne/${e}/${n}">${r}</a>
      </li>`).join(``)}</ul>`}var Qa=null;async function $a(e,{id:t,tab:n=`info`}){Qa&&=(await Wi(Qa),null),e.replaceChildren(k());try{let{data:r,error:i}=await Se(t);if(i||!r){e.replaceChildren(O(`Stevne ikkje funne.`));return}let a=await M()||await it(),o=r.avsluttendekastemetodeid!=null,s=!a&&Ja.has(n)?`info`:n,c=Xa[r.stevne_fase??`ikke_startet`]??``;e.innerHTML=`
      <div class="org-shell py-3 px-3">
        ${Za(t,s,a,o)}
        <div class="org-fase-header d-flex align-items-center gap-2 mb-3">
          <h5 class="mb-0 flex-grow-1">${A(r.navn)} <span id="fase-badge">${c}</span></h5>
          <div id="org-banner-knappar"></div>
        </div>
        <div id="org-subside"></div>
      </div>`;let l=e.querySelector(`#org-banner-knappar`),u=e.querySelector(`#org-subside`);await(Ya[s]??ga)(u,{id:t,isAdmin:a},l),Qa=Ce(t,t=>{let n=e.querySelector(`#fase-badge`);n&&(n.innerHTML=Xa[t??`ikke_startet`]??``)})}catch(t){b(`stevne.render`,t),e.replaceChildren(O(`Kunne ikkje laste stevnet.`))}}{let e=document.querySelector(`.header-versjon`);if(e){e.textContent+=` [DEV]`;let t=document.createElement(`span`);t.className=`dev-banner`,t.textContent=`TEST`,e.after(t)}}var eo=document.getElementById(`app`);function $(e,t){return async(n,r)=>{if(!await j()){location.hash=`#/logginn`;return}if(e===`admin`&&!await M()){n.replaceChildren(O(`Ingen tilgang.`));return}if(e===`klubbadmin`&&!await M()&&!await it()){n.replaceChildren(O(`Ingen tilgang.`));return}await t(n,r)}}var to=[{pattern:/^\/logginn$/,side:Dr,params:()=>({})},{pattern:/^\/minside$/,side:$(`bruker`,yi),params:()=>({})},{pattern:/^\/admin$/,side:$(`admin`,wi),params:()=>({})},{pattern:/^\/stevne\/ny$/,side:$(`klubbadmin`,Fi),params:()=>({})},{pattern:/^\/stevne\/(\d+)\/admin$/,side:$(`klubbadmin`,Fi),params:e=>({id:e[1]})},{pattern:/^\/kamp\/(\d+)$/,side:$i,params:e=>({id:Number(e[1])})},{pattern:/^\/stevne\/(\d+)\/pamelding$/,side:Ui,params:e=>({id:e[1]})},{pattern:/^\/stevne\/(\d+)(?:\/([^/]*))?$/,side:$a,params:e=>({id:Number(e[1]),tab:e[2]??`info`})},{pattern:/^\/kaster\/ny$/,side:$(`klubbadmin`,Ii),params:()=>({})},{pattern:/^\/kaster\/(\d+)\/admin$/,side:$(`klubbadmin`,Ii),params:e=>({id:e[1]})},{pattern:/^\/klubber\/(\d+)\/admin$/,side:$(`klubbadmin`,Li),params:e=>({id:e[1]})},{pattern:/^\/terminliste$/,side:St,params:()=>({})},{pattern:/^\/norgescupen$/,side:Ft,params:()=>({})},{pattern:/^\/norgesranking$/,side:Xt,params:()=>({})},{pattern:/^\/rekorder$/,side:lr,params:()=>({})},{pattern:/^\/nmvinnere$/,side:wr,params:()=>({})},{pattern:/^\/kastere\/(\d+)(-[^/]*)?$/,side:Bn,params:e=>({id:e[1]})},{pattern:/^\/kastere$/,side:Bn,params:()=>({})},{pattern:/^\/klubber\/(\d+)(-[^/]*)?$/,side:tr,params:e=>({id:e[1]})},{pattern:/^\/klubber$/,side:tr,params:()=>({})},{pattern:/^\/?$/,side:ze,params:()=>({})}];function no(){let e=location.hash.replace(/^#/,``)||`/`;for(let t of to){let n=e.match(t.pattern);if(n){t.side(eo,t.params(n));return}}eo.replaceChildren(O(`Side ikkje funne.`))}async function ro(){let e=await j(),t=document.getElementById(`meny-logginn-item`),n=document.getElementById(`meny-minside-item`),r=document.getElementById(`meny-admin-item`),i=document.getElementById(`meny-loggut-item`);if(e){t.classList.add(`d-none`);let a=e.profil?.rolle===`admin`;n.classList.toggle(`d-none`,a),r.classList.toggle(`d-none`,!a),i.classList.remove(`d-none`)}else t.classList.remove(`d-none`),n.classList.add(`d-none`),r.classList.add(`d-none`),i.classList.add(`d-none`)}window.addEventListener(`hashchange`,no),document.addEventListener(`DOMContentLoaded`,()=>{document.getElementById(`menyLoggUtKnapp`).addEventListener(`click`,async()=>{await at(),location.hash=`#/`}),ro(),no()}),document.addEventListener(`authStateChanged`,()=>{ro()});export{ri as A,Te as B,Zr as C,Hr as D,$r as E,Br as F,b as G,A as H,we as I,y as K,Ne as L,li as M,Rr as N,ei as O,zr as P,Ee as R,ni as S,Ur as T,k as U,Pe as V,O as W,ia as _,La as a,Wi as b,ha as c,ra as d,la as f,sa as g,na as h,Ia as i,Wr as j,Gr as k,ta as l,ca as m,za as n,Ba as o,oa as p,Ra as r,ja as s,Va as t,aa as u,ua as v,ti as w,Y as x,Z as y,fe as z};