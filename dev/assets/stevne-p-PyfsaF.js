const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/gloppen-A3yA8kNB.js","assets/logError-BO7RC_Nh.js","assets/vendor-C-D82lIT.js","assets/rolldown-runtime-DK3Fl9T5.js","assets/roundInfoBuilder-BlrpvzVS.js","assets/kampService-Dgr8rFtc.js","assets/verifiedWrite-B5unhhqf.js","assets/innledendeBase-BILvqpr6.js","assets/index-D57jhPR5.js","assets/index-CjOETccm.css","assets/LoadingState-C6NB62Ct.js","assets/navigation-CLFdaq7c.js","assets/LivePill-Bwfk6OSo.js","assets/omgangValidation-C3prvMZ3.js","assets/kaster-CGWDYFbf.js","assets/Table-B_UMcRWp.js","assets/navigationService-CGlIigY9.js","assets/testDataService-DHv-yM7S.js","assets/scoreEditor-pOeExMZz.js","assets/ScoreNumberpad-BqTXeh5F.js","assets/createEl-C9Xo-o-q.js","assets/nordhordland-CvKYFee9.js","assets/kampGenereringInnledendeService-Cil6faeO.js","assets/kastemetode-BcDmg9po.js","assets/xkastKongelagService-D4xJiqn9.js","assets/xkast-BXCtpnYo.js","assets/xkastKongelagView-CU821JB0.js","assets/EmptyState-CCNgsnix.js","assets/cup-uhKW6qA-.js","assets/kongelag-D_luO0jL.js","assets/nordhordland-hgyZI4gW.js"])))=>i.map(i=>d[i]);
import{n as e,t}from"./logError-BO7RC_Nh.js";import{A as n,Bt as r,C as i,D as a,Dt as o,E as s,Ft as c,Gt as l,Ht as u,I as d,It as f,L as p,O as m,P as h,Pt as g,St as _,T as v,Tt as y,Vt as b,Wt as x,_ as S,b as C,bt as w,d as T,f as E,ft as D,h as O,k,kt as A,l as ee,lt as j,nt as te,o as ne,ot as re,p as ie,pt as ae,qt as M,r as oe,s as N,t as P,u as se,v as ce,w as le,x as ue,y as de,zt as fe}from"./index-D57jhPR5.js";import{r as pe,s as me,t as he}from"./kasterService-BMY5rO_4.js";import{t as F}from"./LoadingState-C6NB62Ct.js";import{a as ge}from"./klubbService-Haapdsx7.js";import{t as _e}from"./buildDropdownOptions-B5qulxI0.js";import{t as I}from"./formNum-HGeagI_O.js";import{n as ve,r as ye,t as be}from"./kastemetode-BcDmg9po.js";import{t as L}from"./EmptyState-CCNgsnix.js";import{t as xe}from"./SearchInput-BwD50MFz.js";import{n as Se,r as R}from"./kaster-CGWDYFbf.js";import{o as Ce}from"./kampService-Dgr8rFtc.js";import{n as we,t as Te}from"./navigation-CLFdaq7c.js";import{t as Ee}from"./Tabs-DZCBJPb0.js";import{t as De}from"./LivePill-Bwfk6OSo.js";import{d as Oe,f as ke,p as Ae,u as je}from"./omgangValidation-C3prvMZ3.js";import{g as Me,h as Ne,i as Pe}from"./xkastKongelagService-D4xJiqn9.js";import{t as Fe}from"./kampGenereringInnledendeService-Cil6faeO.js";import{n as Ie,t as Le}from"./roundInfoBuilder-BlrpvzVS.js";import{r as Re}from"./testDataService-DHv-yM7S.js";function ze(e,t){return t?`Fullført`:e===`avsluttende`?`Avsluttande fase ${De()}`:e===`innledende`?`Innleiande fase ${De()}`:`Ikkje starta`}async function z(e,{id:a,isAdmin:o=!1},s=null){P(()=>z(e,{id:a,isAdmin:o},s)),e.replaceChildren(F());try{let[t,c,l,u]=await Promise.all([D(a),de(a),S(a),h()]);if(t.error||!t.data){e.replaceChildren(f(`Stevne ikkje funne.`));return}let d=t.data,p=d.stevne_fase??null,_=p===null||p===`ikke_startet`,v=d.kastemetodeInnl?.navn??`—`,y=v.toLowerCase().includes(`gloppen`),b=d.kategori?.erlagbasert??!1,C=(d.kategori?.navn??``).toLowerCase(),w=C.includes(`par`)||C.includes(`mix`),T=!d.kastemetodeInnl&&be(d.kastemetodeAvsl?.navn??``);if(s&&_&&o){s.innerHTML=`<button id="start-stevne-btn" class="btn btn-sm btn-success">Start stevne</button>`;let e=s.querySelector(`#start-stevne-btn`);e.addEventListener(`click`,async()=>{if(!d.kastemetodeInnl&&!T){k(`Du må velje kastemetode for innleiande fase. Gå til Innstillingar for å endre.`,`error`);return}if(b?c<4:c<2){k(b?`Stevnet treng minst 2 par (4 spelarar) for å startast.`:`Stevnet må ha minst 2 spelarar for å startast.`,`error`);return}if(y&&!d.antall_runder_innl){k(`Du må setje antal rundar for innleiande fase. Gå til Innstillingar for å endre.`,`error`);return}let t=await i(a);if(t>0&&!await n({title:`Ubekrefta spelarar`,message:`${t} spelar(ar) er ikkje bekrefta. Vil du starte stevnet likevel?`}))return;if(e.disabled=!0,e.textContent=`Starter…`,T){let{error:t}=await g(a,`avsluttende`);if(t){k(`Feil ved oppdatering av fase.`,`error`),e.disabled=!1,e.textContent=`Start stevne`;return}let{error:n}=await Pe(a);if(n){k(`Feil ved generering av Kongelag-banar: `+m(n),`error`),e.disabled=!1,e.textContent=`Start stevne`;return}location.hash=`#/stevne/${a}/avsluttende`;return}try{await Fe(a,v,d.antall_runder_innl??1,b)}catch(t){k(`Feil ved kampgenerering: `+m(t),`error`),e.disabled=!1,e.textContent=`Start stevne`;return}let{error:r}=await g(a,`innledende`);if(r){k(`Feil ved oppdatering av fase.`,`error`),e.disabled=!1,e.textContent=`Start stevne`;return}location.hash=`#/stevne/${a}/innledende`})}e.innerHTML=`
      <div class="card mb-3 org-max-480">
        <div class="card-body">
          <table class="table table-sm mb-0">
            <tbody>
              <tr><th>Status</th><td>${ze(d.stevne_fase,d.erfullfort)}</td></tr>
              <tr><th>Stad</th><td>${N(d.sted??`—`)}</td></tr>
              <tr><th>Dato</th><td>${d.dato?r(d.dato):`—`}</td></tr>
              <tr><th>Tid</th><td>${d.tid?x(d.tid):`—`}</td></tr>
              <tr><th>Kategori</th><td>${N(d.kategori?.navn??`—`)}</td></tr>
              <tr><th>Kastemetode innleiande</th><td>${N(v)}</td></tr>
              <tr><th>Kastemetode avsluttande</th><td>${N(d.kastemetodeAvsl?.navn??`—`)}</td></tr>
              <tr><th>Antal rundar innleiande</th><td>${d.antall_runder_innl??`—`}</td></tr>
              <tr><th>Påmelde ${w?`par`:`spelarar`}</th><td>${w?l:c}</td></tr>
              ${d.snc_hovudstevne_id==null?``:`<tr><th>SNC-runde</th><td><a href="#/stevne/${d.snc_hovudstevne_id}/info">Sjå alle lokale stevne</a></td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
      <div id="info-handling-knapper" class="mb-3 d-flex gap-2 flex-wrap"></div>`;let E=e.querySelector(`#info-handling-knapper`);if(u?.profil?.kobling_status===`godkjent`&&_){let t=u.profil.kasterid;if(t===null)return;let n=(await O(a,t)).data;E.appendChild(ee({tournamentId:a,throwerId:t,userId:u.user.id,isRegistered:n!==null,registrationId:n?.id,onAction:()=>{z(e,{id:a,isAdmin:o},s)}}))}let A=document.createElement(`a`);A.href=`#/stevne/${a}/pamelding`,A.className=`btn btn-sm btn-outline-secondary`,A.textContent=`Sjå påmeldingar`,E.appendChild(A);let j=document.createElement(`button`);j.type=`button`,j.className=`btn btn-sm btn-outline-secondary`,j.textContent=`Oppdater`,j.addEventListener(`click`,()=>{z(e,{id:a,isAdmin:o},s)}),E.appendChild(j)}catch(n){t(`stevne-info.render`,n),e.replaceChildren(f(`Kunne ikkje laste info.`))}}var B=null,V=null,Be=null,Ve=[];function H(){return`serial`in navigator}function He(){return B!==null}function Ue(e){Be=e}function We(){V&&navigator.serial.removeEventListener(`disconnect`,V),V=e=>{B!==null&&(B=null,V=null,Be?.())},navigator.serial.addEventListener(`disconnect`,V)}async function Ge(){if(!H()||B)return!1;let e=(await navigator.serial.getPorts())[0];if(!e)return!1;try{return await e.open({baudRate:9600}),B=e,We(),!0}catch{return!1}}async function Ke(){if(!H())throw Error(`Web Serial API is not supported in this browser.`);if(B)return;let e=Ve.length>0?{filters:Ve}:void 0,t=await navigator.serial.requestPort(e);await t.open({baudRate:9600}),B=t,We()}async function qe(){if(B){V&&=(navigator.serial.removeEventListener(`disconnect`,V),null);try{await B.close()}catch(e){t(`receiptPrinterService.disconnect`,e)}finally{B=null}}}async function Je(){let e=B;await qe();try{await e?.forget()}catch(e){t(`receiptPrinterService.forget`,e)}}async function Ye(e){if(!B)throw Error(`Ingen printar tilkopla. Koble til ein printar fyrst.`);let t=B.writable;if(!t)throw Error(`Printerport er ikkje i skrivemodus.`);let n=t.getWriter();try{await n.write(e)}finally{n.releaseLock()}}var Xe=0,Ze=10,U=27,Qe=29;function W(...e){return new Uint8Array(e)}function $e(){return W(U,64)}function G(e){return W(U,97,e===`center`?1:e===`right`?2:0)}function K(e){return W(U,33,e?8:0)}function et(e,t){return W(Qe,33,e-1<<4|t-1)}function q(e){let t=e.replace(/æ/g,`ae`).replace(/ø/g,`oe`).replace(/å/g,`aa`).replace(/Æ/g,`Ae`).replace(/Ø/g,`Oe`).replace(/Å/g,`Aa`).replace(/[\x00-\x1F\x7F]/g,` `).slice(0,32),n=new Uint8Array(t.length+1);for(let e=0;e<t.length;e++)n[e]=t.charCodeAt(e)&255;return n[t.length]=Ze,n}function J(){return q(`-`.repeat(32))}function tt(){return W(Qe,86,65,Xe)}function nt(...e){let t=e.reduce((e,t)=>e+t.length,0),n=new Uint8Array(t),r=0;for(let t of e)n.set(t,r),r+=t.length;return n}function Y(e,t){return String(e??``).slice(0,t).padStart(t)}function X(e,t){return String(e??``).slice(0,t).padEnd(t)}function rt(e){let t=[],n=(...e)=>t.push(...e);n($e()),n(J()),n(G(`center`),K(!0)),n(q(`STARTKORT - GLOPPEN`)),n(K(!1),G(`left`)),n(q(e.stevneNavn)),n(J()),n(et(1,2)),n(q(e.namn??``)),n(et(1,1));let r=`Nr:${e.startnummer}`;return n(q(`${r}  ${`Klubb:${e.klubb}`.slice(0,32-r.length-2)}`)),n(J()),n(K(!0)),n(q(`${X(`Rnd`,3)} ${X(`Bane`,4)} ${X(`Mot#`,4)}  ${X(`Motstandar`,17)}`)),n(K(!1)),e.roundInfos.forEach((e,t)=>{let r=Y(t+1,3),i=Y(e.court??``,4),a=Y(e.opponentId??``,4),o=X(e.opponentName??``,17);n(q(`${r} ${i} ${a}  ${o}`))}),n(J()),n(G(`center`)),n(q(``)),n(q(`Lykke til!`)),n(q(``)),n(q(``)),n(q(``)),n(G(`left`)),n(tt()),nt(...t)}function it(e){let{tournamentId:t,tournamentName:n,isTeam:r,onStateChange:i}=e,a=document.createElement(`div`);a.className=`d-flex align-items-center gap-2 mb-2`;let o=null;function s(){o=null}async function c(){if(o)return o;let[e,n,i]=await Promise.all([Ce(t),je(t),r?ce(t):Promise.resolve({data:[],error:null})]);if(e.error)return k(`Feil ved lasting av kampdata`,`error`),null;if(n.error)return k(`Feil ved lasting av resultatdata`,`error`),null;let a={};for(let e of n.data)e.kasterid!=null&&(a[e.kasterid]=e.startnummer??0);let s=[],c=new Map;for(let t of e.data){let e={spelarar:t.spelarar,er_walkover:t.er_walkover,bane_nummer:t.bane_nummer};s.push(e);let n=c.get(t.runde_nummer)??[];n.push(e),c.set(t.runde_nummer,n)}return o={allMatchesPrint:s,roundMap:c,startNumberMap:a,sortedRounds:[...c.keys()].sort((e,t)=>e-t),pairs:i.data},o}function l(){return He()?async e=>{let t=await c();if(!t)return;let r=t.pairs.find(t=>t.sideA.kasterid===e.id||t.sideB.kasterid===e.id),i;if(r){let t=(r.sideA.kasterid===e.id?r.sideB:r.sideA).kaster,n=t?`${t.fornavn??``} ${t.etternavn??``}`.trim():``;i=`${R(e)} / ${n}`}else i=R(e);let a=t.startNumberMap[e.id]??``,o=Le(e.id,t.sortedRounds,t.roundMap,t.startNumberMap),s=Ie(e.id,t.allMatchesPrint),l=rt({startnummer:a,namn:i,klubb:s,roundInfos:o,stevneNavn:n});try{await Ye(l)}catch(e){k(`Feil ved utskrift: `+m(e),`error`)}}:null}if(!H()){let e=document.createElement(`small`);return e.className=`text-muted`,e.textContent=`Kvitteringsprintar ikkje tilgjengeleg i denne nettlesaren (bruk Chrome/Edge).`,a.appendChild(e),{element:a,getPrintHandler:()=>null,invalidateMatchData:s}}let u=document.createElement(`span`),d=document.createElement(`span`);d.textContent=`Printer`;let f=document.createElement(`span`);f.className=`d-flex align-items-center gap-1 small`,f.appendChild(u),f.appendChild(d);let p=document.createElement(`button`);p.textContent=`Koble til kvitteringsprintar`,p.className=`btn btn-sm btn-outline-secondary`;let h=document.createElement(`button`);h.textContent=`Koble frå`,h.className=`btn btn-sm btn-outline-warning d-none`;function g(){let e=He();u.textContent=`●`,u.className=e?`text-success`:`text-muted`,p.classList.toggle(`d-none`,e),h.classList.toggle(`d-none`,!e)}return Ue(()=>{g(),i()}),p.addEventListener(`click`,async()=>{p.disabled=!0;try{await Ke(),g(),i()}catch(e){p.disabled=!1,e instanceof Error&&e.name!==`NotFoundError`&&k(`Feil ved tilkopling: `+m(e),`error`)}}),h.addEventListener(`click`,async()=>{h.disabled=!0,await Je(),g(),i(),h.disabled=!1}),a.appendChild(f),a.appendChild(p),a.appendChild(h),g(),Ge().then(e=>{e&&(g(),i())}),{element:a,getPrintHandler:l,invalidateMatchData:s}}function at({title:e=`Fjern`,onClick:t}){let n=document.createElement(`button`);return n.type=`button`,n.innerHTML=`&times;`,n.className=`btn btn-sm rounded-circle p-0 lh-1 remove-btn`,n.title=e,n.addEventListener(`click`,e=>{e.stopPropagation(),t()}),n}function Z(e){let{formatTitle:t,emptyText:n,onRowClick:r,isDraggable:i,onDragStart:a,onDragEnd:o,renderLeading:s,renderTrailing:c,clubFallback:l}=e,u=s!=null,d=c??[],f=+!!u+2+d.length,p=document.createElement(`div`);p.className=`d-flex flex-column flex-grow-1`;let m=document.createElement(`h6`);m.className=`fw-bold mb-1`;let h=document.createElement(`div`);h.className=`participant-table-wrapper border rounded overflow-auto`;let g=document.createElement(`table`);g.className=`table table-sm table-hover mb-0`;let _=document.createElement(`tbody`);g.appendChild(_),h.appendChild(g),p.appendChild(m),p.appendChild(h);function v(e){let t=document.createElement(`td`);return t.className=`text-center th-40`,e&&t.appendChild(e),t}function y(e){let t=document.createElement(`tr`);u&&t.appendChild(v(s(e)));let n=document.createElement(`td`);n.textContent=R(e),t.appendChild(n);let c=document.createElement(`td`);c.textContent=e.klubb?.navn??l??``,t.appendChild(c);for(let n of d)t.appendChild(v(n(e)));return r&&(t.classList.add(`participant-row`),t.addEventListener(`click`,()=>r(e))),i&&(t.draggable=!0,t.dataset.kasterid=String(e.id),t.addEventListener(`dragstart`,n=>{n.dataTransfer?.setData(`text/plain`,String(e.id)),a?.(e,t)}),t.addEventListener(`dragend`,()=>o?.(e,t))),t}function b(e){if(m.textContent=t(e.length),_.replaceChildren(),!e.length){let e=document.createElement(`tr`),t=document.createElement(`td`);t.className=`text-center text-muted fst-italic py-3`,t.textContent=n,t.colSpan=f,e.appendChild(t),_.appendChild(e);return}for(let t of e)_.appendChild(y(t))}return{element:p,setPlayers:b}}var ot=0;function st(e){let{tournamentId:t,onCreated:n}=e,r=`np${++ot}`,i=[],a=!1,o=!1,s=document.createElement(`button`);s.type=`button`,s.className=`btn btn-link btn-sm text-decoration-none align-self-start px-0 mt-2`,s.textContent=`+ Ny spelar`;let c=document.createElement(`div`);c.className=`card card-body p-3 mb-2 d-none`,c.innerHTML=`
    <div class="d-flex justify-content-between align-items-center mb-2">
      <h6 class="fw-bold mb-0">Ny spelar</h6>
      <button type="button" class="btn-close" aria-label="Lukk"></button>
    </div>
    <form novalidate>
      <div class="row g-2">
        <div class="col-6">
          <label class="form-label small mb-1" for="${r}-fornavn">Fornamn</label>
          <input class="form-control form-control-sm" id="${r}-fornavn" type="text"
                 autocomplete="off" required>
        </div>
        <div class="col-6">
          <label class="form-label small mb-1" for="${r}-etternavn">Etternamn</label>
          <input class="form-control form-control-sm" id="${r}-etternavn" type="text"
                 autocomplete="off" required>
        </div>
        <div class="col-6">
          <label class="form-label small mb-1" for="${r}-klubb">Klubb</label>
          <select class="form-select form-select-sm" id="${r}-klubb"></select>
        </div>
        <div class="col-6">
          <label class="form-label small mb-1" for="${r}-kjonn">Kjønn</label>
          <select class="form-select form-select-sm" id="${r}-kjonn" required></select>
        </div>
      </div>
      <div class="d-flex align-items-center gap-3 mt-3">
        <button type="submit" class="btn btn-primary btn-sm" disabled>Opprett og meld på</button>
        <button type="button" class="btn btn-link btn-sm text-decoration-none px-0">Avbryt</button>
        <span class="text-muted small ms-auto">Lagrast i spelarregisteret</span>
      </div>
    </form>`;let l=c.querySelector(`form`),u=c.querySelector(`.btn-close`),d=c.querySelector(`#${r}-fornavn`),f=c.querySelector(`#${r}-etternavn`),p=c.querySelector(`#${r}-klubb`),h=c.querySelector(`#${r}-kjonn`),g=l.querySelector(`button[type="submit"]`),_=l.querySelector(`button[type="button"]`);function v(){return d.value.trim()!==``&&f.value.trim()!==``&&I(h.value)!==null}function y(){g.disabled=o||!a||!v()}function b(e){o=e;for(let t of[d,f,p,h,_,u])t.disabled=e;y()}function x(){l.reset(),y()}function S(){c.classList.add(`d-none`),s.classList.remove(`d-none`),x()}async function C(){if(a)return;let[e,t]=await Promise.all([ge(),me()]);if(e.error||t.error){k(`Kunne ikkje laste klubbar og kjønn.`,`error`),S();return}i=e.data,p.innerHTML=_e(i,null,`— vel —`),h.innerHTML=_e(t.data,null,`— vel —`),a=!0,y()}async function w(){c.classList.remove(`d-none`),s.classList.add(`d-none`),await C(),d.focus()}s.addEventListener(`click`,()=>void w()),u.addEventListener(`click`,S),_.addEventListener(`click`,S);for(let e of[d,f,h])e.addEventListener(`input`,y);return c.addEventListener(`keydown`,e=>{e.key===`Escape`&&!o&&(e.stopPropagation(),S(),s.focus())}),l.addEventListener(`submit`,async e=>{if(e.preventDefault(),o||!v())return;let r=d.value.trim(),a=f.value.trim(),c=I(h.value),l=I(p.value);if(c===null)return;b(!0);let{data:u,error:g}=await he({fornavn:r,etternavn:a,kjonnid:c,klubbid:l,klasseid:null,epost:null,telefon:null,medlemsnummer:null,eraktiv:!0});if(g||!u){k(`Kunne ikkje opprette spelar: `+m(g),`error`),b(!1);return}let{error:_}=await se(t,u.id);_&&k(`Spelaren blei oppretta, men ikkje meldt på: `+m(_),`error`);let y=l===null?null:i.find(e=>e.id===l)??null;n({id:u.id,fornavn:r,etternavn:a,eraktiv:!0,avatarurl:null,kjonnid:c,klubb:y&&{id:y.id,navn:y.navn}},!_),b(!1),S(),s.focus()}),{element:c,toggle:s}}function ct(e){let{canEdit:t,tournamentId:n,onRegistered:r,refreshLists:i,onCreated:a}=e,o=document.createElement(`div`);o.className=`col-md-6 d-flex flex-column participant-column`;let s=xe({placeholder:`Søk etter navn eller klubb…`,variant:`form`}),c=Z({formatTitle:()=>`Tilgjengelege spelarar`,emptyText:`Ingen spelarar funne`,clubFallback:`Ingen klubb`,onRowClick:t?async e=>{let{error:t}=await se(n,e.id);if(t){k(`Feil ved innmelding: `+m(t),`error`);return}r(e.id),i()}:void 0});if(o.appendChild(s),t){let e=st({tournamentId:n,onCreated:a});o.appendChild(e.element),o.appendChild(c.element),o.appendChild(e.toggle)}else o.appendChild(c.element);return{element:o,searchInput:s,table:c}}function lt(e){let{isStarted:t,canEdit:n,tournamentId:r,registeredMap:i,pairedIds:a,printerBanner:o,onConfirmed:c,onRemoved:l,refreshRegisteredList:u,refreshBothLists:d}=e,f=document.createElement(`div`);if(f.className=`${t?`col-12`:`col-md-6`} d-flex flex-column participant-column`,!t){let e=document.createElement(`input`);e.type=`text`,e.className=`form-control mb-2 participant-search-spacer`,e.tabIndex=-1,e.disabled=!0,f.appendChild(e)}let p=o?e=>{let t=o.getPrintHandler();if(!t)return null;let n=document.createElement(`button`);return n.textContent=`🖨`,n.className=`btn btn-outline-secondary btn-sm p-0 lh-1 participant-print-btn`,n.title=`Skriv ut startkort`,n.addEventListener(`click`,n=>{n.stopPropagation(),t(e)}),n}:null,h=Z({formatTitle:e=>`Påmelde spelarar: ${e}`,emptyText:`Ingen spelarar påmelde`,renderLeading:e=>{if(i.get(e.id)??!1){let e=document.createElement(`span`);return e.className=`text-success fw-bold`,e.textContent=`✓`,e}if(!n)return null;let t=document.createElement(`button`);return t.textContent=`✓`,t.className=`btn btn-outline-danger btn-sm rounded-circle p-0 lh-1 participant-confirm-btn`,t.title=`Bekreft spelar`,t.addEventListener(`click`,async t=>{t.stopPropagation();let{error:n}=await T(r,e.id);if(n){k(`Feil ved bekreftelse: `+m(n),`error`);return}c(e.id),u()}),t},renderTrailing:[e=>n?at({title:`Fjern spelar`,onClick:async()=>{if(a.has(e.id)){k(`Kan ikkje fjerne spelar som er i eit par. Slett paret fyrst.`,`error`);return}let{error:t}=await s(r,e.id);if(t){k(`Feil ved fjerning: `+m(t),`error`);return}l(e.id),d()}}):null,...p?[p]:[]]});return f.appendChild(h.element),{element:f,table:h}}var ut=1,dt=2;function ft(e){let t=document.createElement(`div`);return t.appendChild(F()),{element:t,refresh:()=>{Q(t,e)}}}async function Q(e,n){let{tournamentId:r,isAdmin:i,isMix:a,getRegisteredIds:o,allThrowers:s}=n,c=o(),{data:l,error:u}=await ce(r);if(u){t(`createPairTab`,u),e.replaceChildren(f(`Kunne ikkje laste par.`));return}let d=new Set(l.flatMap(e=>[e.sideA.kasterid,e.sideB.kasterid]));n.onPairsChanged?.(d);let p=s.filter(e=>c.has(e.id)&&!d.has(e.id)),h=null,g=null,_=null,v=document.createElement(`div`);v.className=`row g-3`;let y=document.createElement(`div`);y.className=`col-md-6 d-flex flex-column participant-column`;let b=xe({placeholder:`Søk spelar…`,variant:`form`,onInput:()=>S()}),x=Z({formatTitle:e=>`Spelarar utan par: ${e}`,emptyText:`Ingen fleire spelarar å tilordne`,isDraggable:i,onDragStart:(e,t)=>{_=e.id,t.classList.add(`opacity-50`)},onDragEnd:(e,t)=>{_=null,t.classList.remove(`opacity-50`)}});function S(){let e=b.value.toLowerCase(),t=p.filter(t=>t.id===h?.id||t.id===g?.id?!1:!e||R(t).toLowerCase().includes(e)||(t.klubb?.navn??``).toLowerCase().includes(e));x.setPlayers(t)}y.appendChild(b),y.appendChild(x.element);let C=document.createElement(`div`);C.className=`col-md-6 d-flex flex-column participant-column`;let w=document.createElement(`h6`);w.className=`fw-bold mb-1`;let T=document.createElement(`div`);T.className=`flex-grow-1`;function D(e){let t=document.createElement(`div`);t.className=`pair-slot border rounded px-2 py-2 text-center`;let n=a?e===`A`?`Side A (kvinne)`:`Side B (mann)`:`Side ${e}`;t.setAttribute(`aria-label`,n);function r(){let r=e===`A`?h:g;t.textContent=r?R(r):n,t.classList.toggle(`pair-slot--filled`,r!=null)}return r(),t.addEventListener(`dragover`,e=>{e.preventDefault(),t.classList.add(`pair-slot--hover`)}),t.addEventListener(`dragleave`,()=>t.classList.remove(`pair-slot--hover`)),t.addEventListener(`drop`,n=>{n.preventDefault(),t.classList.remove(`pair-slot--hover`);let i=_??Number(n.dataTransfer?.getData(`text/plain`));if(!i||e===`A`&&g?.id===i||e===`B`&&h?.id===i)return;let o=s.find(e=>e.id===i);if(o){if(a){if(e===`A`&&o.kjonnid!==dt){k(`Mix: Side A må vere ei kvinne`,`error`);return}if(e===`B`&&o.kjonnid!==ut){k(`Mix: Side B må vere ein mann`,`error`);return}}e===`A`?h=o:g=o,r(),S(),A()}}),t}let O=document.createElement(`button`);O.type=`button`,O.className=`btn btn-primary btn-sm w-100 d-none mt-2`,O.textContent=`Opprett par`;function A(){O.classList.toggle(`d-none`,h==null||g==null)}O.addEventListener(`click`,async()=>{if(!h||!g)return;O.disabled=!0;let{error:t}=await E(r,h.id,g.id);if(O.disabled=!1,t){k(`Feil ved oppretting av par: `+m(t),`error`);return}e.replaceChildren(F()),Q(e,n)});function ee(t){if(w.textContent=`Antal par: ${t.length}`,T.innerHTML=``,!t.length){let e=document.createElement(`p`);e.className=`text-muted fst-italic py-2 mb-0`,e.textContent=`Ingen par oppretta enno`,T.appendChild(e);return}for(let a of t){let t=document.createElement(`div`);t.className=`pair-row pair-grid-row mb-1`;let o=document.createElement(`span`);o.className=`pair-cell border rounded px-2 py-1`,o.textContent=R(a.sideA.kaster);let s=document.createElement(`span`);if(s.className=`pair-cell border rounded px-2 py-1`,s.textContent=R(a.sideB.kaster),t.appendChild(o),t.appendChild(s),i){let i=at({title:`Slett par`,onClick:async()=>{i.disabled=!0;let{error:t}=await ie(r,a.lag_id);if(t){k(`Feil ved sletting: `+m(t),`error`),i.disabled=!1;return}e.replaceChildren(F()),Q(e,n)}});t.appendChild(i)}T.appendChild(t)}}if(i){let e=document.createElement(`div`);e.className=`pair-grid-row mb-2`,e.appendChild(D(`A`)),e.appendChild(D(`B`)),C.appendChild(e),C.appendChild(O)}else{let e=document.createElement(`div`);e.className=`form-control mb-2 participant-search-spacer`,C.appendChild(e)}C.appendChild(w),C.appendChild(T),v.appendChild(y),v.appendChild(C),e.replaceChildren(v),S(),ee(l)}function pt(e){let t=new Map,n=new Set;for(let r of e)r.kasterid!=null&&(t.set(r.kasterid,r.er_bekreftet??!1),r.lag_id!=null&&n.add(r.kasterid));return{registeredMap:t,pairedIds:n}}function mt(e){return[...e].sort((e,t)=>{let n=(e.klubb?.navn??``).localeCompare(t.klubb?.navn??``,`nb`);if(n!==0)return n;let r=(e.etternavn??``).localeCompare(t.etternavn??``,`nb`);return r===0?(e.fornavn??``).localeCompare(t.fornavn??``,`nb`):r})}function ht(e,t,n){let r=t.toLowerCase();return e.filter(e=>n.has(e.id)?!1:!r||R(e).toLowerCase().includes(r)||(e.klubb?.navn??``).toLowerCase().includes(r))}async function gt(e){let[t,n,r,i]=await Promise.all([y(e),pe(),C(e),ae(e)]);return t.error||!t.data?{ok:!1,error:`Stevne ikkje funne.`}:n.error?{ok:!1,error:`Kunne ikkje laste kasterliste.`}:{ok:!0,data:{stevne:t.data,throwers:n.data,registration:r.data,isGloppen:!i.error&&i.navn.includes(`gloppen`)}}}async function _t(e,{id:n,isAdmin:r=!1}){e.replaceChildren(F()),Ue(null);try{let t=await gt(n);if(!t.ok){e.replaceChildren(f(t.error));return}let{stevne:i,throwers:o,registration:s,isGloppen:c}=t.data,l=i.stevne_fase??null,u=r&&(l===null||l===`ikke_startet`),d=l!==null&&l!==`ikke_startet`,p=i.kategori?.erlagbasert??!1,{registeredMap:m,pairedIds:h}=pt(s),g=!0,_=document.createElement(`div`),v;r&&c&&d&&(v=it({tournamentId:n,tournamentName:i.navn,isTeam:p,onStateChange:()=>S()}),_.appendChild(v.element));let y=document.createElement(`div`);y.className=`row g-3`;let b=null;d||(b=ct({canEdit:u,tournamentId:n,onRegistered:e=>{m.set(e,!1),g=!0,v?.invalidateMatchData()},refreshLists:()=>{S(),w()},onCreated:(e,t)=>{o.push(e),t&&(m.set(e.id,!1),g=!0,v?.invalidateMatchData()),S(),w()}}),y.appendChild(b.element));let x=lt({isStarted:d,canEdit:u,tournamentId:n,registeredMap:m,pairedIds:h,printerBanner:v,onConfirmed:e=>m.set(e,!0),onRemoved:e=>{m.delete(e),g=!0,v?.invalidateMatchData()},refreshRegisteredList:()=>S(),refreshBothLists:()=>{S(),w()}});y.appendChild(x.element);function S(){x.table.setPlayers(mt(o.filter(e=>m.has(e.id))))}function w(){b&&b.table.setPlayers(mt(ht(o,b.searchInput.value,m)))}if(p){let e=ft({tournamentId:n,isAdmin:u,isMix:(i.kategori?.navn??``).toLowerCase().includes(`mix`),getRegisteredIds:()=>new Set(m.keys()),allThrowers:o,onPairsChanged:e=>{h.clear();for(let t of e)h.add(t)}});_.appendChild(Ee({tabs:[{id:`players`,label:`Spelarar`,panel:y},{id:`pairs`,label:`Administrer par`,panel:e.element}],onChange:t=>{t===`pairs`&&g&&(g=!1,e.refresh())}}))}else _.appendChild(y);e.replaceChildren(_),b?.searchInput.addEventListener(`input`,w),S(),w();async function T(){let{data:e,error:t}=await C(n);if(t)return;let{registeredMap:r,pairedIds:i}=pt(e);m.clear(),r.forEach((e,t)=>m.set(t,e)),h.clear(),i.forEach(e=>h.add(e)),g=!0,v?.invalidateMatchData(),S(),w()}let E=a(n,()=>{T()});Te(()=>{we(E)}),P(()=>{T()})}catch(n){t(`stevne-deltakere.render`,n),e.replaceChildren(f(`Kunne ikkje laste deltakarliste.`))}}async function vt(e,{id:t,isAdmin:n=!1},r=null){e.replaceChildren(F());let{navn:i,error:a}=await ae(t);if(a){e.replaceChildren(f(`Stevne ikkje funne.`));return}if(i.includes(`gloppen`)){let{render:i}=await M(async()=>{let{render:e}=await import(`./gloppen-A3yA8kNB.js`);return{render:e}},__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]));await i(e,{id:t,isAdmin:n},r)}else if(i.includes(`nordhordland`)){let{render:i}=await M(async()=>{let{render:e}=await import(`./nordhordland-CvKYFee9.js`);return{render:e}},__vite__mapDeps([21,1,2,3,8,6,9,22,23,13,14,5,15,16,24,7,10,11,12,17,18,19,20]));await i(e,{id:t,isAdmin:n},r)}else if(ve(i)){let{render:i}=await M(async()=>{let{render:e}=await import(`./xkast-BXCtpnYo.js`);return{render:e}},__vite__mapDeps([25,24,1,2,3,8,6,9,23,13,14,5,15,16,26,20,10,27,11,17,19]));await i(e,{id:t,isAdmin:n},r)}else e.replaceChildren(f(`Ukjend innleiande kastemetode: ${i||`(ikkje sett)`}`))}async function yt(e,{id:t,isAdmin:n=!1},r=null){e.replaceChildren(F());let{navn:i,error:a}=await j(t);if(a){e.replaceChildren(f(`Stevne ikkje funne.`));return}if(i.includes(`cup`)){let{render:i}=await M(async()=>{let{render:e}=await import(`./cup-uhKW6qA-.js`);return{render:e}},__vite__mapDeps([28,1,2,3,8,6,9,10,23,5,11,12,13,14,15,16,24,19,20,18]));await i(e,{id:t,isAdmin:n},r)}else if(i.includes(`kongelag`)){let{render:i}=await M(async()=>{let{render:e}=await import(`./kongelag-D_luO0jL.js`);return{render:e}},__vite__mapDeps([29,8,2,3,1,6,9,20,24,23,13,14,5,15,16,26,10,27,11,17,19]));await i(e,{id:t,isAdmin:n},r)}else if(i.includes(`nordhordland`)){let{render:i}=await M(async()=>{let{render:e}=await import(`./nordhordland-hgyZI4gW.js`);return{render:e}},__vite__mapDeps([30,8,2,3,1,6,9]));await i(e,{id:t,isAdmin:n},r)}else e.replaceChildren(f(`Ukjend avsluttande kastemetode: ${i||`(ikkje sett)`}`))}async function bt(e,{id:r}){P(()=>bt(e,{id:r})),e.replaceChildren(F());try{let[i,a]=await Promise.all([o(r),re()]);if(i.error||!i.data){e.replaceChildren(f(`Stevne ikkje funne.`));return}let s=i.data,l=a.data,u=s.er_snc_hovudstevne===!0,d=s.snc_hovudstevne_id,p=d!=null,h=p?` disabled`:``,g=l.filter(e=>e.er_innledende&&(!u||ve(e.navn))),_=l.filter(e=>e.er_avsluttende&&(!u||be(e.navn)));function v(e,t){return e.map(e=>`<option value="${e.id}"${e.id===t?` selected`:``}>${N(e.navn)}</option>`).join(``)}e.innerHTML=`
      <div>
        <div class="mb-3">
          <a href="#/stevne/${r}/rediger" class="btn btn-outline-secondary btn-sm">Rediger stevne</a>
        </div>
        <h4 class="mb-3">Innstillingar</h4>
        <form id="innstillingar-form" class="org-max-480">
          <div class="mb-3">
            <label class="form-label fw-semibold">Kastemetode innleiande</label>
            <select id="innl-metode" class="form-select"${h}>
              <option value="">— Ikkje vald —</option>
              ${v(g,s.innledendekastemetodeid)}
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold">Kastemetode avsluttande</label>
            <select id="avsl-metode" class="form-select"${h}>
              <option value="">— Ikkje vald —</option>
              ${v(_,s.avsluttendekastemetodeid)}
            </select>
          </div>
          ${p?`<p class="form-text mb-3">Kastemetoden kjem frå
                   <a href="#/stevne/${d}/innstillinger">SNC-hovudstevnet</a>
                   og kan berre endrast der.</p>`:``}
          <div class="mb-3">
            <label class="form-label fw-semibold">Antal rundar innleiande</label>
            <input id="antall-rundar" type="number" min="1" class="form-control"
              value="${s.antall_runder_innl??``}" placeholder="t.d. 6">
          </div>
          ${u?`<p class="form-text mb-4">Kastemetoden gjeld heile SNC-runden og blir arva av alle lokalstevna. Banar blir sette på kvart lokalstevne.</p>`:`<div class="mb-4">
            <label class="form-label fw-semibold">Tilgjengelege banar (X-kast/Kongelag)</label>
            <input id="tilgjengelege-banar" type="number" min="1" class="form-control"
              value="${s.tilgjengelige_baner??``}" placeholder="Valfritt — utan verdi blir det éi pulje">
          </div>`}
          <button type="submit" class="btn btn-primary">Lagre</button>
          <span id="lagre-status" class="ms-3 text-success d-none">Lagra ✓</span>
          ${u?``:`<hr class="my-4">
          <div class="border border-danger rounded p-3">
            <h6 class="text-danger mb-2">Farleg sone</h6>
            <p class="text-muted small mb-2">Slettar alle kampar og resultat, og set stevnet tilbake til starttilstanden.</p>
            <button type="button" id="nullstill-btn" class="btn btn-danger">Start på nytt!</button>
          </div>`}
        </form>
      </div>`;let y=e.querySelector(`#innl-metode`),b=e.querySelector(`#antall-rundar`);function x(){let e=g.find(e=>e.id===Number(y.value)),t=e!=null&&ye(e.navn);b.disabled=!t,t||(b.value=``),b.placeholder=t?`t.d. 6`:`Berre for Gloppen/NHM`}x(),y.addEventListener(`change`,x),e.querySelector(`#innstillingar-form`).addEventListener(`submit`,async n=>{n.preventDefault();let i=e.querySelector(`#innl-metode`).value||null,a=e.querySelector(`#avsl-metode`).value||null,o=e.querySelector(`#antall-rundar`).value,l=e.querySelector(`#tilgjengelege-banar`),{error:u}=await c(r,{innledendekastemetodeid:p?s.innledendekastemetodeid:i?Number(i):null,avsluttendekastemetodeid:p?s.avsluttendekastemetodeid:a?Number(a):null,antall_runder_innl:o?Number(o):null,tilgjengelige_baner:l?.value?Number(l.value):null});if(u){t(`stevne-innstillingar.lagre`,u),k(`Feil ved lagring: `+m(u),`error`);return}let d=e.querySelector(`#lagre-status`);d.classList.remove(`d-none`),setTimeout(()=>{d.classList.add(`d-none`)},2e3)}),e.querySelector(`#nullstill-btn`)?.addEventListener(`click`,async t=>{let i=t.currentTarget;if(!await n({title:`Nullstill stevne`,message:`Dette slettar alle kampar og resultat og set stevnet tilbake til starttilstanden. Er du sikker?`,danger:!0}))return;i.disabled=!0;let{error:a}=await Re(r);if(a){k(`Feil ved nullstilling: `+m(a),`error`),i.disabled=!1;return}await bt(e,{id:r})})}catch(n){t(`stevne-innstillingar.render`,n),e.replaceChildren(f(`Kunne ikkje laste innstillingar.`))}}var xt=new Set([`NC`,`SNC`,`DNC`]),St=new Set([`Gloppen`,`Nordhordlandsmetoden`]);function Ct(e){let t=new Set,n=[];for(let r of e){let e=r.klubb?.navn??`–`;t.has(e)||(t.add(e),n.push(e))}return n.map(N).join(` / `)}function wt(e){let t=new Map,n=0;for(let r of e){let e=r.startnummer==null?`_${n++}`:r.startnummer,i=t.get(e)??[];i.push(r),t.set(e,i)}return[...t.values()]}function Tt(e,t){let n=new Map;for(let r of e){let e=r.gruppe?.navn??`–`,i=r.klasse?.navn??null,a=t?`${i??``}|${e}`:e,o=t?`${i?i+` `:``}${e}`:e;n.has(a)||n.set(a,{label:o,rows:[]}),n.get(a).rows.push(r)}return[...n.values()].sort((e,t)=>e.label.localeCompare(t.label,`nb`))}function Et(e,t){let n=[];return t.showKpSp&&n.push(`KP ${e.kamp_poeng_innl??`–`}`,`SP ${e.score_poeng_innl??`–`}`),t.showSnc&&n.push(`SNC ${e.snc_plassering??`–`}.`),t.showNc&&n.push(`NC ${e.nc_poeng??`–`}`),n.length?`<span class="res-meta">${n.join(`  `)}</span>`:``}function Dt(e,t){let n=Ot(e,t,(e,n)=>{let r=e.map(e=>N(R(e.kaster)||`–`)).join(` og `);return`
        <div class="res-row">
          <span class="res-pl">${n.plassering??`–`}.</span>
          <div class="res-info">
            <span class="res-navn">${r}</span>
            <span class="res-klubb">${Ct(e)}</span>
            ${Et(n,t)}
          </div>
        </div>`},e=>`
      <div class="res-row">
        <span class="res-pl">${e.plassering??`–`}.</span>
        <div class="res-info">
          <span class="res-navn">${N(R(e.kaster)||`–`)}</span>
          <span class="res-klubb">${N(e.klubb?.navn??`–`)}</span>
          ${Et(e,t)}
        </div>
      </div>`).join(``);return`
    <div class="res-group">
      <h2 class="res-group-title">${N(e.label)}</h2>
      <div class="res-group-rows">${n}</div>
    </div>`}function Ot(e,t,n,r){return t.isParMix?wt(e.rows).map(e=>n(e,e[0])):e.rows.map(r)}function kt(e,t,n,r,i){return`
    <tr>
      <td class="res-td-pl">${e??`–`}</td>
      <td class="res-td-navn">${t}</td>
      <td class="res-td-klubb">${n}</td>
      ${i.showKpSp?`<td class="res-td-kp">${r.kamp_poeng_innl??``}</td><td class="res-td-sp">${r.score_poeng_innl??``}</td>`:``}
      ${i.showSnc?`<td class="res-td-pl">${r.snc_plassering??``}</td>`:``}
      ${i.showNc?`<td class="res-td-nc">${r.nc_poeng??``}</td>`:``}
    </tr>`}function At(e,t){let n=e=>{let t=e.kaster;return t?`<a href="#/kastere/${Se(t)}" class="res-kaster-lenke">${N(R(t))}</a>`:`–`},r=Ot(e,t,(e,r)=>kt(r.plassering,e.map(n).join(` og `),Ct(e),r,t),e=>kt(e.plassering,n(e),N(e.klubb?.navn??`–`),e,t)).join(``);return`
    <div class="res-table-section">
      <table class="res-table">
        <thead>
          <tr class="res-thead-group">
            <td colspan="${3+(t.showKpSp?2:0)+ +!!t.showSnc+ +!!t.showNc}" class="res-td-group-header">${N(e.label)}</td>
          </tr>
          <tr class="res-thead-columns">
            <th class="res-td-pl">Pl</th>
            <th class="res-td-navn">NAVN</th>
            <th class="res-td-klubb">KLUBB</th>
            ${t.showKpSp?`<th class="res-td-kp">KP</th><th class="res-td-sp">SP</th>`:``}
            ${t.showSnc?`<th class="res-td-pl">SNC</th>`:``}
            ${t.showNc?`<th class="res-td-nc">NC</th>`:``}
          </tr>
        </thead>
        <tbody>${r}</tbody>
      </table>
    </div>`}async function jt(e,{id:n}){e.replaceChildren(F(`Laster resultat…`));try{let[t,r]=await Promise.all([Ae(n),Oe(n)]);if(t.error||!t.data){e.replaceChildren(f(`Kunne ikkje laste stevnet.`));return}if(r.error){e.replaceChildren(f(`Kunne ikkje laste resultat.`));return}let i=t.data,a=r.data;if(!a.length){e.replaceChildren(L(i.erfullfort?`Ingen resultat registrert.`:`Turneringa er ikkje avslutta enno.`));return}let o=Tt(a,(i.dato?new Date(i.dato+`T12:00:00`).getFullYear():9999)<2026),s=a.length,c={isParMix:i.kategori?.erlagbasert??!1,showNc:xt.has(i.stevnetype?.navn??``),showKpSp:St.has(i.innledende?.navn??``),showSnc:i.snc_hovudstevne_id!=null&&a.some(e=>e.snc_plassering!=null)},l=i.snc_hovudstevne_id==null?``:`<p class="res-klassifisering">
             <a href="#/stevne/${i.snc_hovudstevne_id}/resultat">Samla SNC-resultat for alle lokale stevne →</a>
           </p>`;e.innerHTML=`
      <div class="res-side">
        <div class="res-felles">
          ${i.resultaturl?.startsWith(`http`)?`<a class="res-pdf-lenke" href="${N(i.resultaturl)}" target="_blank" rel="noopener">Resultat som pdf 📄</a>`:``}
          ${l}
          ${i.juryleder?`<p class="res-klassifisering">Juryleder: ${N(i.juryleder)}</p>`:``}
          <p class="res-antall"><strong>Antall deltakarar: ${s}</strong></p>
        </div>
        <div class="res-mobil-blokk">
          ${o.map(e=>Dt(e,c)).join(``)}
        </div>
        <div class="res-desktop-blokk">
          ${o.map(e=>At(e,c)).join(``)}
        </div>
      </div>`}catch(n){t(`stevne-resultat.render`,n),e.replaceChildren(f(`Kunne ikkje laste resultat.`))}}e.from(`kamp`).select(`
  id,
  er_walkover,
  er_tre_spelarar,
  spelarar:kamp_spelar(
    id,
    kasterid,
    score_poeng,
    omgangar:kamp_omgang(score, antall_ringer),
    kaster:kasterid(id, fornavn, etternavn)
  )
`);async function Mt(n){let{data:r,error:i}=await e.from(`kamp`).select(`
      id,
      er_walkover,
      er_tre_spelarar,
      spelarar:kamp_spelar(
        id,
        kasterid,
        score_poeng,
        omgangar:kamp_omgang(score, antall_ringer),
        kaster:kasterid(id, fornavn, etternavn)
      )
    `).eq(`stevneid`,n).eq(`er_bekreftet`,!0).eq(`er_walkover`,!1);return i&&t(`getMatchesForStats`,i),{data:r??[],error:i}}async function Nt(n){let{data:r,error:i}=await e.from(`resultat`).select(`kasterid, posisjon`).eq(`stevneid`,n);i&&t(`getPositionForTournament`,i);let a=new Map;for(let e of r??[])e.kasterid!=null&&e.posisjon!=null&&a.set(e.kasterid,e.posisjon);return a}function Pt(e,t,n){let r=n.get(e.kasterid)??null;return t.filter(t=>t.kasterid!==e.kasterid&&(n.get(t.kasterid)??null)===r).reduce((e,t)=>e+t.score_poeng,0)}function Ft(e,t){let n=new Map;for(let r of e){if(r.er_walkover)continue;let e=r.spelarar;for(let r of e){let i=Pt(r,e,t);n.has(r.kasterid)||n.set(r.kasterid,{kasterid:r.kasterid,navn:R(r.kaster),matchCount:0,shoesThrown:0,ringers:0,ringerPct:0,doubleRingers:0,score4:0,score3:0,score2:0,score1:0,score0:0,scoreDiff:0});let a=n.get(r.kasterid);r.omgangar.length>0&&a.matchCount++,a.scoreDiff+=r.score_poeng-i;for(let e of r.omgangar)a.shoesThrown+=2,e.antall_ringer!=null&&(a.ringers+=e.antall_ringer),e.antall_ringer===2&&a.doubleRingers++,e.score===4?a.score4++:e.score===3?a.score3++:e.score===2?a.score2++:e.score===1?a.score1++:e.score===0&&a.score0++}}let r=[...n.values()].filter(e=>e.shoesThrown>0);for(let e of r)e.ringerPct=e.shoesThrown>0?e.ringers/e.shoesThrown*100:0;return r.sort((e,t)=>t.ringerPct-e.ringerPct)}function It(e){return e>0?`+${e}`:String(e)}function Lt(e){return`
    <div class="stats-table-wrap">
      <table class="stats-table">
        <thead>
          <tr>
            <th class="stats-th-name">Namn</th>
            <th class="stats-th-num">K</th>
            <th class="stats-th-num">Sko</th>
            <th class="stats-th-num stats-th-ringer">R</th>
            <th class="stats-th-num stats-th-ringer">R%</th>
            <th class="stats-th-num">6p</th>
            <th class="stats-th-num">4p</th>
            <th class="stats-th-num">3p</th>
            <th class="stats-th-num">2p</th>
            <th class="stats-th-num">1p</th>
            <th class="stats-th-num">0p</th>
            <th class="stats-th-diff">±</th>
          </tr>
        </thead>
        <tbody>${e.map(e=>`
    <tr>
      <td class="stats-td-name">${N(e.navn)}</td>
      <td class="stats-td-num">${e.matchCount}</td>
      <td class="stats-td-num">${e.shoesThrown}</td>
      <td class="stats-td-num stats-td-ringer">${e.ringers}</td>
      <td class="stats-td-num stats-td-ringer">${e.ringerPct.toFixed(1)}%</td>
      <td class="stats-td-num">${e.doubleRingers}</td>
      <td class="stats-td-num">${e.score4}</td>
      <td class="stats-td-num">${e.score3}</td>
      <td class="stats-td-num">${e.score2}</td>
      <td class="stats-td-num">${e.score1}</td>
      <td class="stats-td-num">${e.score0}</td>
      <td class="stats-td-diff ${e.scoreDiff>=0?`stats-td-pos`:`stats-td-neg`}">${It(e.scoreDiff)}</td>
    </tr>`).join(``)}</tbody>
      </table>
    </div>`}function Rt(e){let t=!1,n=0,r=0;e.addEventListener(`mousedown`,i=>{t=!0,e.classList.add(`is-grabbing`),n=i.pageX-e.offsetLeft,r=e.scrollLeft}),e.addEventListener(`mouseleave`,()=>{t=!1,e.classList.remove(`is-grabbing`)}),e.addEventListener(`mouseup`,()=>{t=!1,e.classList.remove(`is-grabbing`)}),e.addEventListener(`mousemove`,i=>{t&&(i.preventDefault(),e.scrollLeft=r-(i.pageX-e.offsetLeft-n))})}function zt(e,t){let n=[...e.querySelectorAll(`tr`)],r=n[0];if(!r)return;let i=[...r.cells].slice(0,t).map(e=>e.offsetWidth);for(let e of n){let n=0;for(let r=0;r<t&&r<e.cells.length;r++){let a=e.cells[r];a&&(a.classList.add(`stats-col-sticky`),r===t-1&&a.classList.add(`stats-col-sticky-last`),a.style.setProperty(`--col-left`,`${n}px`),n+=i[r]??0)}}}async function Bt(e,{id:n}){e.replaceChildren(F(`Laster statistikk…`));try{let[{data:t,error:r},i]=await Promise.all([Mt(n),Nt(n)]);if(r){e.replaceChildren(f(`Kunne ikkje laste statistikk.`));return}let a=Ft(t,i);if(!a.length){e.replaceChildren(L(`Ingen statistikk registrert.`));return}e.innerHTML=`<div class="stats-side">${Lt(a)}</div>`;let o=e.querySelector(`.stats-table-wrap`),s=e.querySelector(`.stats-table`);o&&Rt(o),s&&zt(s,1)}catch(n){t(`stevne-stats.render`,n),e.replaceChildren(f(`Kunne ikkje laste statistikk.`))}}function $(e){let t=[e.klubb?.navn,e.sted].filter(e=>!!e?.trim()),n=[...new Set(t.map(e=>e.trim()))];return n.length?n.join(` · `):e.navn}function Vt(e){return e.stevne_fase===null||e.stevne_fase===`ikke_startet`}function Ht(e){return e.erfullfort?`done`:Vt(e)?`upcoming`:`live`}function Ut(e){return Vt(e)&&!e.erfullfort}function Wt(e){let t=[e.kastemetodeInnl?.navn,e.kastemetodeAvsl?.navn].filter(Boolean);return t.length?t.join(` → `):`—`}function Gt(e,t,n){let i=t.filter(e=>e.erfullfort).length;return`
    <div class="card mb-3">
      <div class="card-body">
        <table class="table table-sm mb-0">
          <tbody>
            <tr><th>Status</th><td>${N(e.erfullfort?`Samla resultat er klart`:t.length?`${i} av ${t.length} lokale stevne fullført`:`Ingen lokale stevne registrerte`)}</td></tr>
            <tr><th>Dato</th><td>${e.dato?r(e.dato):`—`}</td></tr>
            <tr><th>Tid</th><td>${e.tid?x(e.tid):`—`}</td></tr>
            <tr><th>Kategori</th><td>${N(e.kategori?.navn??`—`)}</td></tr>
            <tr><th>Kastemetode</th><td>${N(Wt(e))}</td></tr>
            <tr><th>Lokale stevne</th><td>${t.length}</td></tr>
            <tr><th>Påmelde i alt</th><td>${n}</td></tr>
          </tbody>
        </table>
      </div>
    </div>`}function Kt(e,t,n,r,i){if(!r)return`<div class="alert alert-info">
      <a href="#/logginn?redirect=/stevne/${i}/info">Logg inn</a> for å melde deg på eitt av dei lokale stevna.
    </div>`;if(!n)return``;if(t.ownStevneId==null)return`<div class="alert alert-info">Vel kva lokalt stevne du vil delta på. Du kan berre stå på eitt per SNC-runde.</div>`;let a=e.find(e=>e.id===t.ownStevneId);return`<div class="alert alert-success">
    Du er påmeld <strong>${N(a?$(a):`eit lokalt stevne`)}</strong>.
  </div>`}function qt(e,t,n){let r=t.counts.get(e.id)??0,i=[e.tid?x(e.tid):``,`${r} påmelde`].filter(Boolean).join(` · `);return ne({title:$(e),href:`#/stevne/${e.id}/${e.erfullfort?`resultat`:`info`}`,date:b(e.dato),dateIso:e.dato,dateFull:fe(e.dato),dateWeekday:l(e.dato),dateDay:u(e.dato),status:Ht(e),meta:[i],nearestLabel:t.ownStevneId===e.id?`PÅMELD`:void 0,actionSlot:n&&Ut(e)})}async function Jt(e,{id:n,isAdmin:r=!1},i=null){let a=()=>Jt(e,{id:n,isAdmin:r},i);P(a),e.replaceChildren(F(`Laster lokale stevne…`));try{let[t,o,s]=await Promise.all([_(n),w(n),h()]);if(t.error||!t.data){e.replaceChildren(f(`Fann ikkje SNC-hovudstevnet.`));return}let c=t.data,l=o.data,u=s?.profil?.kobling_status===`godkjent`?s.profil.kasterid:null,d=await ue(l.map(e=>e.id),u),p=[...d.counts.values()].reduce((e,t)=>e+t,0),m=u!=null&&!c.erfullfort;Xt(i,c,l,r,a),e.innerHTML=`
      <div class="org-max-480">
        ${Gt(c,l,p)}
        ${Kt(l,d,m,s!=null,n)}
        <h6 class="mb-2">Lokale stevne (${l.length})</h6>
        <div id="snc-locals" class="stevne-kort-liste"></div>
        ${r?`<div class="mt-3"><a class="btn btn-sm btn-outline-success" href="#/stevne/ny?snc=${n}">+ Nytt lokalt stevne</a></div>`:``}
      </div>`;let g=e.querySelector(`#snc-locals`);if(!l.length){g.replaceChildren(L(`Ingen lokale stevne er kopla til denne SNC-runden enno.`));return}for(let e of l){let t=qt(e,d,m),n=t.querySelector(`[data-action-slot]`);n&&u!=null&&n.replaceWith(Yt(e,d,u,a)),g.appendChild(t)}}catch(n){t(`snc-info.render`,n),e.replaceChildren(f(`Kunne ikkje laste dei lokale stevna.`))}}function Yt(e,t,r,i){let a=t.ownStevneId===e.id,o=!a&&t.ownStevneId!=null,s=document.createElement(`button`);return s.type=`button`,s.className=a?`btn btn-sm btn-outline-danger snc-avmeld`:o?`btn btn-sm btn-outline-primary snc-byt`:`btn btn-sm btn-primary snc-meldpa`,s.textContent=a?`Meld av`:o?`Byt hit`:`Meld på`,s.addEventListener(`click`,async()=>{if(a){if(t.ownRegistrationId==null||!await n({title:`Meld av`,message:`Vil du melde deg av SNC-runden?`}))return;s.disabled=!0;let{error:e}=await v(t.ownRegistrationId);if(e){k(`Kunne ikkje melde av: `+m(e),`error`),s.disabled=!1;return}k(`Du er meldt av.`,`success`),await i();return}if(o){if(!await n({title:`Byt lokalt stevne`,message:`Du blir meldt av det lokale stevnet du står på no, og påmeld dette i staden. Fortsette?`}))return;if(s.disabled=!0,t.ownRegistrationId!=null){let{error:e}=await v(t.ownRegistrationId);if(e){k(`Kunne ikkje melde av det gamle lokalstevnet: `+m(e),`error`),s.disabled=!1;return}}let{error:a}=await le(e.id,r);if(a){k(`Du er meldt av det gamle lokalstevnet, men påmeldinga feila: `+m(a),`error`),await i();return}k(`Du er meldt på det nye lokalstevnet.`,`success`),await i();return}s.disabled=!0;let{error:c}=await le(e.id,r);if(c){k(`Kunne ikkje melde på: `+m(c),`error`),s.disabled=!1;return}k(`Du er meldt på.`,`success`),await i()}),s}function Xt(e,t,r,i,a){if(!e)return;if(!i){e.innerHTML=``;return}let o=r.length>0&&r.every(e=>e.erfullfort);if(t.erfullfort){e.innerHTML=`<button id="snc-reopen-btn" class="btn btn-sm btn-outline-warning">Gjenopne SNC-runden</button>`,e.querySelector(`#snc-reopen-btn`)?.addEventListener(`click`,async()=>{if(!await n({title:`Gjenopne SNC-runden`,message:`Den samla lista og NC-poenga blir nullstilte, og lokalstevna kan endrast igjen. Fortsette?`,danger:!0}))return;let{error:e}=await A(t.id);if(e){k(`Kunne ikkje gjenopne: `+m(e),`error`);return}await a()});return}e.innerHTML=`<button id="snc-complete-btn" class="btn btn-sm btn-success"${o?``:` disabled`}>Konsolider SNC-runden</button>`,e.querySelector(`#snc-complete-btn`)?.addEventListener(`click`,async()=>{if(!await n({title:`Konsolider SNC-runden`,message:`Alle lokalresultata blir slåtte saman til éi liste, og NC-poenga blir rekna ut frå den samla plasseringa. Fortsette?`,danger:!0}))return;let{error:e}=await te(t.id);if(e){k(`Kunne ikkje konsolidere: `+m(e),`error`);return}k(`SNC-runden er konsolidert.`,`success`),await a()})}function Zt(e,t){return t.carryFactor==null?(t.showKongelag?e.poeng_kongelag:e.poeng_xkast)??0:(e.poeng_kongelag??0)+Math.round((e.poeng_xkast??0)*t.carryFactor)}function Qt(e,t){let n=e.kaster,r=n?`<a href="#/kastere/${Se(n)}" class="res-kaster-lenke">${N(R(n))}</a>`:`–`;return`
    <tr>
      <td class="res-td-pl">${e.snc_plassering??`–`}</td>
      <td class="res-td-navn">${r}</td>
      <td class="res-td-klubb">${N(e.klubb?.navn??`–`)}</td>
      <td class="res-td-klubb">${N($(e.stevne))}</td>
      ${t.showXkast?`<td class="res-td-kp">${e.poeng_xkast??``}</td>`:``}
      ${t.showKongelag?`<td class="res-td-sp">${e.poeng_kongelag??``}</td>`:``}
      <td class="res-td-sp">${Zt(e,t)}</td>
      <td class="res-td-nc">${e.nc_poeng??``}</td>
      <td class="res-td-pl">${e.plassering??`–`}</td>
    </tr>`}function $t(e,t){let n=[`TOT ${Zt(e,t)}`,`NC ${e.nc_poeng??`–`}`];return t.showXkast&&n.unshift(`X ${e.poeng_xkast??`–`}`),t.showKongelag&&n.unshift(`K ${e.poeng_kongelag??`–`}`),`
    <div class="res-row">
      <span class="res-pl">${e.snc_plassering??`–`}.</span>
      <div class="res-info">
        <span class="res-navn">${N(R(e.kaster)||`–`)}</span>
        <span class="res-klubb">${N(e.klubb?.navn??`–`)} · ${N($(e.stevne))}</span>
        <span class="res-meta">${n.join(`  `)}</span>
      </div>
    </div>`}async function en(e,{id:n}){e.replaceChildren(F(`Laster samla resultat…`));try{let[t,r]=await Promise.all([_(n),ke(n)]);if(t.error||!t.data){e.replaceChildren(f(`Fann ikkje SNC-hovudstevnet.`));return}if(r.error){e.replaceChildren(f(`Kunne ikkje laste samla resultat.`));return}let i=t.data,a=r.data.filter(e=>e.snc_plassering!=null);if(!i.erfullfort||!a.length){e.replaceChildren(L(`Den samla lista blir klar når alle dei lokale stevna er fullførte og runden er konsolidert.`));return}let o=i.kastemetodeInnl?.antall_omganger??null,s=i.innledendekastemetodeid!=null,c=i.avsluttendekastemetodeid!=null,l={showXkast:s,showKongelag:c,carryFactor:s&&c&&o?Ne(o):null},u=new Set(r.data.map(e=>e.stevne.id)).size,d=l.carryFactor!=null&&o?` · overføring frå X-kast ${Me(o)} %`:``;e.innerHTML=`
      <div class="res-side">
        <div class="res-felles">
          <p class="res-antall"><strong>${a.length} deltakarar frå ${u} lokale stevne</strong>${N(d)}</p>
        </div>
        <div class="res-mobil-blokk">
          <div class="res-group">
            <div class="res-group-rows">${a.map(e=>$t(e,l)).join(``)}</div>
          </div>
        </div>
        <div class="res-desktop-blokk">
          <div class="res-table-section">
            <table class="res-table">
              <thead>
                <tr class="res-thead-columns">
                  <th class="res-td-pl">Pl</th>
                  <th class="res-td-navn">NAVN</th>
                  <th class="res-td-klubb">KLUBB</th>
                  <th class="res-td-klubb">LOKALT STEVNE</th>
                  ${l.showXkast?`<th class="res-td-kp">X</th>`:``}
                  ${l.showKongelag?`<th class="res-td-sp">K</th>`:``}
                  <th class="res-td-sp">TOT</th>
                  <th class="res-td-nc">NC</th>
                  <th class="res-td-pl">LOKAL PL</th>
                </tr>
              </thead>
              <tbody>${a.map(e=>Qt(e,l)).join(``)}</tbody>
            </table>
          </div>
        </div>
      </div>`}catch(n){t(`snc-resultat.render`,n),e.replaceChildren(f(`Kunne ikkje laste samla resultat.`))}}var tn=[{key:`info`,label:`Info`,adminOnly:!1,completedOnly:!1},{key:`deltakere`,label:`Deltakere`,adminOnly:!0,completedOnly:!1},{key:`innledende`,label:`Innl.`,adminOnly:!1,completedOnly:!1},{key:`avsluttende`,label:`Avsl.`,adminOnly:!1,completedOnly:!1},{key:`resultat`,label:`Sluttresultat`,adminOnly:!1,completedOnly:!0},{key:`innstillinger`,label:`Innstillingar`,adminOnly:!0,completedOnly:!1},{key:`stats`,label:`Stats`,adminOnly:!1,completedOnly:!1}],nn=new Set([`deltakere`,`innledende`,`avsluttende`,`stats`]),rn={info:z,deltakere:_t,innledende:vt,avsluttende:yt,innstillinger:bt,resultat:jt,stats:Bt},an={info:Jt,resultat:en};function on(e,t,n,r){return tn.filter(t=>e||!t.adminOnly).filter(e=>e.key!==`avsluttende`||t).filter(e=>!e.completedOnly||n).filter(e=>!r||!nn.has(e.key))}function sn(e,t,n){return`<ul class="nav nav-underline tournament-nav mb-0 px-3">${n.map(({key:n,label:r})=>`
      <li class="nav-item">
        <a class="nav-link${t===n?` active`:``}"
           href="#/stevne/${e}/${n}">${r}</a>
      </li>`).join(``)}</ul>`}async function cn(e,n){let r=Number(n.id),i=String(n.tab??`info`);e.replaceChildren(F());try{let{data:t,error:n}=await y(r);if(n||!t){e.replaceChildren(f(`Stevne ikkje funne.`));return}oe(t.navn);let a=await d()||await p(),o=t.avsluttendekastemetodeid!=null,s=t.erfullfort===!0,c=t.er_snc_hovudstevne===!0,l=on(a,o,s,c),u=l.some(e=>e.key===i)?i:`info`;e.innerHTML=`
      <div class="org-shell pb-3 pt-1">
        ${sn(r,u,l)}
        <div class="org-fase-header d-flex align-items-center gap-2 mb-3">
          <h5 class="mb-0">${N(t.navn)}</h5>
          <div id="org-banner-buttons"></div>
        </div>
        <div id="org-subpage" class="px-3"></div>
      </div>`;let m=e.querySelector(`#org-banner-buttons`),h=e.querySelector(`#org-subpage`);await((c?an[u]:void 0)??rn[u]??z)(h,{id:r,isAdmin:a},m)}catch(n){t(`stevne.render`,n),e.replaceChildren(f(`Kunne ikkje laste stevnet.`))}}export{cn as render};