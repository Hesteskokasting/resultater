const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/gloppen-Cmx_CIM9.js","assets/logError-BO7RC_Nh.js","assets/vendor-C-D82lIT.js","assets/rolldown-runtime-DK3Fl9T5.js","assets/roundInfoBuilder-BlrpvzVS.js","assets/kampService-Dgr8rFtc.js","assets/verifiedWrite-B5unhhqf.js","assets/innledendeBase-D67uqY0p.js","assets/index-z7iEevWR.js","assets/index-CjOETccm.css","assets/LoadingState-C6NB62Ct.js","assets/navigation-CLFdaq7c.js","assets/LivePill-Bwfk6OSo.js","assets/omgangValidation-DmCOzjkk.js","assets/kaster-CGWDYFbf.js","assets/Table-B_UMcRWp.js","assets/navigationService-BaqT2s_y.js","assets/testDataService-C_reBXrF.js","assets/scoreEditor-BijxYAWl.js","assets/ScoreNumberpad-BqTXeh5F.js","assets/createEl-C9Xo-o-q.js","assets/nordhordland-Udk4PvK2.js","assets/kampGenereringInnledendeService-CSwMZwbF.js","assets/kastemetode-BcDmg9po.js","assets/xkastKongelagService-C6RrdbFj.js","assets/xkast-DJnrdD65.js","assets/xkastKongelagView-BaOFm7Nx.js","assets/EmptyState-CCNgsnix.js","assets/cup-DsreCuFU.js","assets/kongelag-iASX5wdY.js","assets/nordhordland-ClvYmiif.js"])))=>i.map(i=>d[i]);
import{n as e,t}from"./logError-BO7RC_Nh.js";import{C as n,D as r,E as i,Et as a,F as o,Ht as s,It as c,Lt as l,M as u,Mt as d,Nt as f,O as p,P as m,Rt as h,S as g,St as _,T as v,Vt as y,Wt as b,_ as x,_t as S,a as C,c as w,d as T,et as E,g as D,h as O,i as k,jt as A,l as ee,lt as te,ot as ne,p as re,r as ie,rt as ae,s as oe,t as j,u as se,ut as ce,v as le,w as ue,wt as de,x as fe,y as pe,yt as me,zt as he}from"./index-z7iEevWR.js";import{r as ge,s as _e,t as ve}from"./kasterService-BMY5rO_4.js";import{t as M}from"./LoadingState-C6NB62Ct.js";import{a as ye}from"./klubbService-Haapdsx7.js";import{t as be}from"./buildDropdownOptions-B6B_Q6ZW.js";import{t as N}from"./formNum-HGeagI_O.js";import{n as xe,r as Se,t as Ce}from"./kastemetode-BcDmg9po.js";import{t as P}from"./EmptyState-CCNgsnix.js";import{t as we}from"./SearchInput-BwD50MFz.js";import{n as Te,r as F}from"./kaster-CGWDYFbf.js";import{o as Ee}from"./kampService-Dgr8rFtc.js";import{n as De,t as Oe}from"./navigation-CLFdaq7c.js";import{t as ke}from"./Tabs-DZCBJPb0.js";import{t as Ae}from"./LivePill-Bwfk6OSo.js";import{d as je,f as Me,p as Ne,u as Pe}from"./omgangValidation-DmCOzjkk.js";import{g as Fe,h as Ie,i as Le}from"./xkastKongelagService-C6RrdbFj.js";import{t as Re}from"./kampGenereringInnledendeService-CSwMZwbF.js";import{n as ze,t as Be}from"./roundInfoBuilder-BlrpvzVS.js";import{r as Ve}from"./testDataService-C_reBXrF.js";function He(e,t){return t?`Fullført`:e===`avsluttende`?`Avsluttande fase ${Ae()}`:e===`innledende`?`Innleiande fase ${Ae()}`:`Ikkje starta`}async function I(e,{id:n,isAdmin:a=!1},o=null){j(()=>I(e,{id:n,isAdmin:a},o)),e.replaceChildren(M());try{let[t,s,c,d]=await Promise.all([te(n),x(n),O(n),u()]);if(t.error||!t.data){e.replaceChildren(f(`Stevne ikkje funne.`));return}let m=t.data,h=m.stevne_fase??null,g=h===null||h===`ikke_startet`,_=m.kastemetodeInnl?.navn??`—`,v=_.toLowerCase().includes(`gloppen`),b=m.kategori?.erlagbasert??!1,S=(m.kategori?.navn??``).toLowerCase(),w=S.includes(`par`)||S.includes(`mix`),T=!m.kastemetodeInnl&&Ce(m.kastemetodeAvsl?.navn??``);if(o&&g&&a){o.innerHTML=`<button id="start-stevne-btn" class="btn btn-sm btn-success">Start stevne</button>`;let e=o.querySelector(`#start-stevne-btn`);e.addEventListener(`click`,async()=>{if(!m.kastemetodeInnl&&!T){r(`Du må velje kastemetode for innleiande fase. Gå til Innstillingar for å endre.`,`error`);return}if(b?s<4:s<2){r(b?`Stevnet treng minst 2 par (4 spelarar) for å startast.`:`Stevnet må ha minst 2 spelarar for å startast.`,`error`);return}if(v&&!m.antall_runder_innl){r(`Du må setje antal rundar for innleiande fase. Gå til Innstillingar for å endre.`,`error`);return}let t=await fe(n);if(t>0&&!await p({title:`Ubekrefta spelarar`,message:`${t} spelar(ar) er ikkje bekrefta. Vil du starte stevnet likevel?`}))return;if(e.disabled=!0,e.textContent=`Starter…`,T){let{error:t}=await A(n,`avsluttende`);if(t){r(`Feil ved oppdatering av fase.`,`error`),e.disabled=!1,e.textContent=`Start stevne`;return}let{error:a}=await Le(n);if(a){r(`Feil ved generering av Kongelag-banar: `+i(a),`error`),e.disabled=!1,e.textContent=`Start stevne`;return}location.hash=`#/stevne/${n}/avsluttende`;return}try{await Re(n,_,m.antall_runder_innl??1,b)}catch(t){r(`Feil ved kampgenerering: `+i(t),`error`),e.disabled=!1,e.textContent=`Start stevne`;return}let{error:a}=await A(n,`innledende`);if(a){r(`Feil ved oppdatering av fase.`,`error`),e.disabled=!1,e.textContent=`Start stevne`;return}location.hash=`#/stevne/${n}/innledende`})}e.innerHTML=`
      <div class="card mb-3 org-max-480">
        <div class="card-body">
          <table class="table table-sm mb-0">
            <tbody>
              <tr><th>Status</th><td>${He(m.stevne_fase,m.erfullfort)}</td></tr>
              <tr><th>Stad</th><td>${C(m.sted??`—`)}</td></tr>
              <tr><th>Dato</th><td>${m.dato?l(m.dato):`—`}</td></tr>
              <tr><th>Tid</th><td>${m.tid?y(m.tid):`—`}</td></tr>
              <tr><th>Kategori</th><td>${C(m.kategori?.navn??`—`)}</td></tr>
              <tr><th>Kastemetode innleiande</th><td>${C(_)}</td></tr>
              <tr><th>Kastemetode avsluttande</th><td>${C(m.kastemetodeAvsl?.navn??`—`)}</td></tr>
              <tr><th>Antal rundar innleiande</th><td>${m.antall_runder_innl??`—`}</td></tr>
              <tr><th>Påmelde ${w?`par`:`spelarar`}</th><td>${w?c:s}</td></tr>
              ${m.snc_hovudstevne_id==null?``:`<tr><th>SNC-runde</th><td><a href="#/stevne/${m.snc_hovudstevne_id}/info">Sjå alle lokale stevne</a></td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
      <div id="info-handling-knapper" class="mb-3 d-flex gap-2 flex-wrap"></div>`;let E=e.querySelector(`#info-handling-knapper`);if(d?.profil?.kobling_status===`godkjent`&&g){let t=d.profil.kasterid;if(t===null)return;let r=(await re(n,t)).data;E.appendChild(oe({tournamentId:n,throwerId:t,userId:d.user.id,isRegistered:r!==null,registrationId:r?.id,onAction:()=>{I(e,{id:n,isAdmin:a},o)}}))}let D=document.createElement(`a`);D.href=`#/stevne/${n}/pamelding`,D.className=`btn btn-sm btn-outline-secondary`,D.textContent=`Sjå påmeldingar`,E.appendChild(D);let k=document.createElement(`button`);k.type=`button`,k.className=`btn btn-sm btn-outline-secondary`,k.textContent=`Oppdater`,k.addEventListener(`click`,()=>{I(e,{id:n,isAdmin:a},o)}),E.appendChild(k)}catch(n){t(`stevne-info.render`,n),e.replaceChildren(f(`Kunne ikkje laste info.`))}}var L=null,R=null,Ue=null,We=[];function z(){return`serial`in navigator}function Ge(){return L!==null}function B(e){Ue=e}function Ke(){R&&navigator.serial.removeEventListener(`disconnect`,R),R=e=>{L!==null&&(L=null,R=null,Ue?.())},navigator.serial.addEventListener(`disconnect`,R)}async function qe(){if(!z()||L)return!1;let e=(await navigator.serial.getPorts())[0];if(!e)return!1;try{return await e.open({baudRate:9600}),L=e,Ke(),!0}catch{return!1}}async function Je(){if(!z())throw Error(`Web Serial API is not supported in this browser.`);if(L)return;let e=We.length>0?{filters:We}:void 0,t=await navigator.serial.requestPort(e);await t.open({baudRate:9600}),L=t,Ke()}async function Ye(){if(L){R&&=(navigator.serial.removeEventListener(`disconnect`,R),null);try{await L.close()}catch(e){t(`receiptPrinterService.disconnect`,e)}finally{L=null}}}async function Xe(){let e=L;await Ye();try{await e?.forget()}catch(e){t(`receiptPrinterService.forget`,e)}}async function Ze(e){if(!L)throw Error(`Ingen printar tilkopla. Koble til ein printar fyrst.`);let t=L.writable;if(!t)throw Error(`Printerport er ikkje i skrivemodus.`);let n=t.getWriter();try{await n.write(e)}finally{n.releaseLock()}}var Qe=0,$e=10,V=27,et=29;function H(...e){return new Uint8Array(e)}function tt(){return H(V,64)}function U(e){return H(V,97,e===`center`?1:e===`right`?2:0)}function W(e){return H(V,33,e?8:0)}function nt(e,t){return H(et,33,e-1<<4|t-1)}function G(e){let t=e.replace(/æ/g,`ae`).replace(/ø/g,`oe`).replace(/å/g,`aa`).replace(/Æ/g,`Ae`).replace(/Ø/g,`Oe`).replace(/Å/g,`Aa`).replace(/[\x00-\x1F\x7F]/g,` `).slice(0,32),n=new Uint8Array(t.length+1);for(let e=0;e<t.length;e++)n[e]=t.charCodeAt(e)&255;return n[t.length]=$e,n}function K(){return G(`-`.repeat(32))}function rt(){return H(et,86,65,Qe)}function it(...e){let t=e.reduce((e,t)=>e+t.length,0),n=new Uint8Array(t),r=0;for(let t of e)n.set(t,r),r+=t.length;return n}function q(e,t){return String(e??``).slice(0,t).padStart(t)}function J(e,t){return String(e??``).slice(0,t).padEnd(t)}function at(e){let t=[],n=(...e)=>t.push(...e);n(tt()),n(K()),n(U(`center`),W(!0)),n(G(`STARTKORT - GLOPPEN`)),n(W(!1),U(`left`)),n(G(e.stevneNavn)),n(K()),n(nt(1,2)),n(G(e.namn??``)),n(nt(1,1));let r=`Nr:${e.startnummer}`;return n(G(`${r}  ${`Klubb:${e.klubb}`.slice(0,32-r.length-2)}`)),n(K()),n(W(!0)),n(G(`${J(`Rnd`,3)} ${J(`Bane`,4)} ${J(`Mot#`,4)}  ${J(`Motstandar`,17)}`)),n(W(!1)),e.roundInfos.forEach((e,t)=>{let r=q(t+1,3),i=q(e.court??``,4),a=q(e.opponentId??``,4),o=J(e.opponentName??``,17);n(G(`${r} ${i} ${a}  ${o}`))}),n(K()),n(U(`center`)),n(G(``)),n(G(`Lykke til!`)),n(G(``)),n(G(``)),n(G(``)),n(U(`left`)),n(rt()),it(...t)}function ot(e){let{tournamentId:t,tournamentName:n,isTeam:a,onStateChange:o}=e,s=document.createElement(`div`);s.className=`d-flex align-items-center gap-2 mb-2`;let c=null;function l(){c=null}async function u(){if(c)return c;let[e,n,i]=await Promise.all([Ee(t),Pe(t),a?D(t):Promise.resolve({data:[],error:null})]);if(e.error)return r(`Feil ved lasting av kampdata`,`error`),null;if(n.error)return r(`Feil ved lasting av resultatdata`,`error`),null;let o={};for(let e of n.data)e.kasterid!=null&&(o[e.kasterid]=e.startnummer??0);let s=[],l=new Map;for(let t of e.data){let e={spelarar:t.spelarar,er_walkover:t.er_walkover,bane_nummer:t.bane_nummer};s.push(e);let n=l.get(t.runde_nummer)??[];n.push(e),l.set(t.runde_nummer,n)}return c={allMatchesPrint:s,roundMap:l,startNumberMap:o,sortedRounds:[...l.keys()].sort((e,t)=>e-t),pairs:i.data},c}function d(){return Ge()?async e=>{let t=await u();if(!t)return;let a=t.pairs.find(t=>t.sideA.kasterid===e.id||t.sideB.kasterid===e.id),o;if(a){let t=(a.sideA.kasterid===e.id?a.sideB:a.sideA).kaster,n=t?`${t.fornavn??``} ${t.etternavn??``}`.trim():``;o=`${F(e)} / ${n}`}else o=F(e);let s=t.startNumberMap[e.id]??``,c=Be(e.id,t.sortedRounds,t.roundMap,t.startNumberMap),l=ze(e.id,t.allMatchesPrint),d=at({startnummer:s,namn:o,klubb:l,roundInfos:c,stevneNavn:n});try{await Ze(d)}catch(e){r(`Feil ved utskrift: `+i(e),`error`)}}:null}if(!z()){let e=document.createElement(`small`);return e.className=`text-muted`,e.textContent=`Kvitteringsprintar ikkje tilgjengeleg i denne nettlesaren (bruk Chrome/Edge).`,s.appendChild(e),{element:s,getPrintHandler:()=>null,invalidateMatchData:l}}let f=document.createElement(`span`),p=document.createElement(`span`);p.textContent=`Printer`;let m=document.createElement(`span`);m.className=`d-flex align-items-center gap-1 small`,m.appendChild(f),m.appendChild(p);let h=document.createElement(`button`);h.textContent=`Koble til kvitteringsprintar`,h.className=`btn btn-sm btn-outline-secondary`;let g=document.createElement(`button`);g.textContent=`Koble frå`,g.className=`btn btn-sm btn-outline-warning d-none`;function _(){let e=Ge();f.textContent=`●`,f.className=e?`text-success`:`text-muted`,h.classList.toggle(`d-none`,e),g.classList.toggle(`d-none`,!e)}return B(()=>{_(),o()}),h.addEventListener(`click`,async()=>{h.disabled=!0;try{await Je(),_(),o()}catch(e){h.disabled=!1,e instanceof Error&&e.name!==`NotFoundError`&&r(`Feil ved tilkopling: `+i(e),`error`)}}),g.addEventListener(`click`,async()=>{g.disabled=!0,await Xe(),_(),o(),g.disabled=!1}),s.appendChild(m),s.appendChild(h),s.appendChild(g),_(),qe().then(e=>{e&&(_(),o())}),{element:s,getPrintHandler:d,invalidateMatchData:l}}function st({title:e=`Fjern`,onClick:t}){let n=document.createElement(`button`);return n.type=`button`,n.innerHTML=`&times;`,n.className=`btn btn-sm rounded-circle p-0 lh-1 remove-btn`,n.title=e,n.addEventListener(`click`,e=>{e.stopPropagation(),t()}),n}function Y(e){let{formatTitle:t,emptyText:n,onRowClick:r,isDraggable:i,onDragStart:a,onDragEnd:o,renderLeading:s,renderTrailing:c,clubFallback:l}=e,u=s!=null,d=c??[],f=+!!u+2+d.length,p=document.createElement(`div`);p.className=`d-flex flex-column flex-grow-1`;let m=document.createElement(`h6`);m.className=`fw-bold mb-1`;let h=document.createElement(`div`);h.className=`participant-table-wrapper border rounded overflow-auto`;let g=document.createElement(`table`);g.className=`table table-sm table-hover mb-0`;let _=document.createElement(`tbody`);g.appendChild(_),h.appendChild(g),p.appendChild(m),p.appendChild(h);function v(e){let t=document.createElement(`td`);return t.className=`text-center th-40`,e&&t.appendChild(e),t}function y(e){let t=document.createElement(`tr`);u&&t.appendChild(v(s(e)));let n=document.createElement(`td`);n.textContent=F(e),t.appendChild(n);let c=document.createElement(`td`);c.textContent=e.klubb?.navn??l??``,t.appendChild(c);for(let n of d)t.appendChild(v(n(e)));return r&&(t.classList.add(`participant-row`),t.addEventListener(`click`,()=>r(e))),i&&(t.draggable=!0,t.dataset.kasterid=String(e.id),t.addEventListener(`dragstart`,n=>{n.dataTransfer?.setData(`text/plain`,String(e.id)),a?.(e,t)}),t.addEventListener(`dragend`,()=>o?.(e,t))),t}function b(e){if(m.textContent=t(e.length),_.replaceChildren(),!e.length){let e=document.createElement(`tr`),t=document.createElement(`td`);t.className=`text-center text-muted fst-italic py-3`,t.textContent=n,t.colSpan=f,e.appendChild(t),_.appendChild(e);return}for(let t of e)_.appendChild(y(t))}return{element:p,setPlayers:b}}var ct=0;function lt(e){let{tournamentId:t,onCreated:n}=e,a=`np${++ct}`,o=[],s=!1,c=!1,l=document.createElement(`button`);l.type=`button`,l.className=`btn btn-link btn-sm text-decoration-none align-self-start px-0 mt-2`,l.textContent=`+ Ny spelar`;let u=document.createElement(`div`);u.className=`card card-body p-3 mb-2 d-none`,u.innerHTML=`
    <div class="d-flex justify-content-between align-items-center mb-2">
      <h6 class="fw-bold mb-0">Ny spelar</h6>
      <button type="button" class="btn-close" aria-label="Lukk"></button>
    </div>
    <form novalidate>
      <div class="row g-2">
        <div class="col-6">
          <label class="form-label small mb-1" for="${a}-fornavn">Fornamn</label>
          <input class="form-control form-control-sm" id="${a}-fornavn" type="text"
                 autocomplete="off" required>
        </div>
        <div class="col-6">
          <label class="form-label small mb-1" for="${a}-etternavn">Etternamn</label>
          <input class="form-control form-control-sm" id="${a}-etternavn" type="text"
                 autocomplete="off" required>
        </div>
        <div class="col-6">
          <label class="form-label small mb-1" for="${a}-klubb">Klubb</label>
          <select class="form-select form-select-sm" id="${a}-klubb"></select>
        </div>
        <div class="col-6">
          <label class="form-label small mb-1" for="${a}-kjonn">Kjønn</label>
          <select class="form-select form-select-sm" id="${a}-kjonn" required></select>
        </div>
      </div>
      <div class="d-flex align-items-center gap-3 mt-3">
        <button type="submit" class="btn btn-primary btn-sm" disabled>Opprett og meld på</button>
        <button type="button" class="btn btn-link btn-sm text-decoration-none px-0">Avbryt</button>
        <span class="text-muted small ms-auto">Lagrast i spelarregisteret</span>
      </div>
    </form>`;let d=u.querySelector(`form`),f=u.querySelector(`.btn-close`),p=u.querySelector(`#${a}-fornavn`),m=u.querySelector(`#${a}-etternavn`),h=u.querySelector(`#${a}-klubb`),g=u.querySelector(`#${a}-kjonn`),_=d.querySelector(`button[type="submit"]`),v=d.querySelector(`button[type="button"]`);function y(){return p.value.trim()!==``&&m.value.trim()!==``&&N(g.value)!==null}function b(){_.disabled=c||!s||!y()}function x(e){c=e;for(let t of[p,m,h,g,v,f])t.disabled=e;b()}function S(){d.reset(),b()}function C(){u.classList.add(`d-none`),l.classList.remove(`d-none`),S()}async function T(){if(s)return;let[e,t]=await Promise.all([ye(),_e()]);if(e.error||t.error){r(`Kunne ikkje laste klubbar og kjønn.`,`error`),C();return}o=e.data,h.innerHTML=be(o,null,`— vel —`),g.innerHTML=be(t.data,null,`— vel —`),s=!0,b()}async function E(){u.classList.remove(`d-none`),l.classList.add(`d-none`),await T(),p.focus()}l.addEventListener(`click`,()=>void E()),f.addEventListener(`click`,C),v.addEventListener(`click`,C);for(let e of[p,m,g])e.addEventListener(`input`,b);return u.addEventListener(`keydown`,e=>{e.key===`Escape`&&!c&&(e.stopPropagation(),C(),l.focus())}),d.addEventListener(`submit`,async e=>{if(e.preventDefault(),c||!y())return;let a=p.value.trim(),s=m.value.trim(),u=N(g.value),d=N(h.value);if(u===null)return;x(!0);let{data:f,error:_}=await ve({fornavn:a,etternavn:s,kjonnid:u,klubbid:d,klasseid:null,epost:null,telefon:null,medlemsnummer:null,eraktiv:!0});if(_||!f){r(`Kunne ikkje opprette spelar: `+i(_),`error`),x(!1);return}let{error:v}=await w(t,f.id);v&&r(`Spelaren blei oppretta, men ikkje meldt på: `+i(v),`error`);let b=d===null?null:o.find(e=>e.id===d)??null;n({id:f.id,fornavn:a,etternavn:s,eraktiv:!0,avatarurl:null,kjonnid:u,klubb:b&&{id:b.id,navn:b.navn}},!v),x(!1),C(),l.focus()}),{element:u,toggle:l}}function ut(e){let{canEdit:t,tournamentId:n,onRegistered:a,refreshLists:o,onCreated:s}=e,c=document.createElement(`div`);c.className=`col-md-6 d-flex flex-column participant-column`;let l=we({placeholder:`Søk etter navn eller klubb…`,variant:`form`}),u=Y({formatTitle:()=>`Tilgjengelege spelarar`,emptyText:`Ingen spelarar funne`,clubFallback:`Ingen klubb`,onRowClick:t?async e=>{let{error:t}=await w(n,e.id);if(t){r(`Feil ved innmelding: `+i(t),`error`);return}a(e.id),o()}:void 0});if(c.appendChild(l),t){let e=lt({tournamentId:n,onCreated:s});c.appendChild(e.element),c.appendChild(u.element),c.appendChild(e.toggle)}else c.appendChild(u.element);return{element:c,searchInput:l,table:u}}function dt(e){let{isStarted:t,canEdit:n,tournamentId:a,registeredMap:o,pairedIds:s,printerBanner:c,onConfirmed:l,onRemoved:u,refreshRegisteredList:d,refreshBothLists:f}=e,p=document.createElement(`div`);if(p.className=`${t?`col-12`:`col-md-6`} d-flex flex-column participant-column`,!t){let e=document.createElement(`input`);e.type=`text`,e.className=`form-control mb-2 participant-search-spacer`,e.tabIndex=-1,e.disabled=!0,p.appendChild(e)}let m=c?e=>{let t=c.getPrintHandler();if(!t)return null;let n=document.createElement(`button`);return n.textContent=`🖨`,n.className=`btn btn-outline-secondary btn-sm p-0 lh-1 participant-print-btn`,n.title=`Skriv ut startkort`,n.addEventListener(`click`,n=>{n.stopPropagation(),t(e)}),n}:null,h=Y({formatTitle:e=>`Påmelde spelarar: ${e}`,emptyText:`Ingen spelarar påmelde`,renderLeading:e=>{if(o.get(e.id)??!1){let e=document.createElement(`span`);return e.className=`text-success fw-bold`,e.textContent=`✓`,e}if(!n)return null;let t=document.createElement(`button`);return t.textContent=`✓`,t.className=`btn btn-outline-danger btn-sm rounded-circle p-0 lh-1 participant-confirm-btn`,t.title=`Bekreft spelar`,t.addEventListener(`click`,async t=>{t.stopPropagation();let{error:n}=await ee(a,e.id);if(n){r(`Feil ved bekreftelse: `+i(n),`error`);return}l(e.id),d()}),t},renderTrailing:[e=>n?st({title:`Fjern spelar`,onClick:async()=>{if(s.has(e.id)){r(`Kan ikkje fjerne spelar som er i eit par. Slett paret fyrst.`,`error`);return}let{error:t}=await ue(a,e.id);if(t){r(`Feil ved fjerning: `+i(t),`error`);return}u(e.id),f()}}):null,...m?[m]:[]]});return p.appendChild(h.element),{element:p,table:h}}var ft=1,pt=2;function mt(e){let t=document.createElement(`div`);return t.appendChild(M()),{element:t,refresh:()=>{X(t,e)}}}async function X(e,n){let{tournamentId:a,isAdmin:o,isMix:s,getRegisteredIds:c,allThrowers:l}=n,u=c(),{data:d,error:p}=await D(a);if(p){t(`createPairTab`,p),e.replaceChildren(f(`Kunne ikkje laste par.`));return}let m=new Set(d.flatMap(e=>[e.sideA.kasterid,e.sideB.kasterid]));n.onPairsChanged?.(m);let h=l.filter(e=>u.has(e.id)&&!m.has(e.id)),g=null,_=null,v=null,y=document.createElement(`div`);y.className=`row g-3`;let b=document.createElement(`div`);b.className=`col-md-6 d-flex flex-column participant-column`;let x=we({placeholder:`Søk spelar…`,variant:`form`,onInput:()=>C()}),S=Y({formatTitle:e=>`Spelarar utan par: ${e}`,emptyText:`Ingen fleire spelarar å tilordne`,isDraggable:o,onDragStart:(e,t)=>{v=e.id,t.classList.add(`opacity-50`)},onDragEnd:(e,t)=>{v=null,t.classList.remove(`opacity-50`)}});function C(){let e=x.value.toLowerCase(),t=h.filter(t=>t.id===g?.id||t.id===_?.id?!1:!e||F(t).toLowerCase().includes(e)||(t.klubb?.navn??``).toLowerCase().includes(e));S.setPlayers(t)}b.appendChild(x),b.appendChild(S.element);let w=document.createElement(`div`);w.className=`col-md-6 d-flex flex-column participant-column`;let E=document.createElement(`h6`);E.className=`fw-bold mb-1`;let O=document.createElement(`div`);O.className=`flex-grow-1`;function k(e){let t=document.createElement(`div`);t.className=`pair-slot border rounded px-2 py-2 text-center`;let n=s?e===`A`?`Side A (kvinne)`:`Side B (mann)`:`Side ${e}`;t.setAttribute(`aria-label`,n);function i(){let r=e===`A`?g:_;t.textContent=r?F(r):n,t.classList.toggle(`pair-slot--filled`,r!=null)}return i(),t.addEventListener(`dragover`,e=>{e.preventDefault(),t.classList.add(`pair-slot--hover`)}),t.addEventListener(`dragleave`,()=>t.classList.remove(`pair-slot--hover`)),t.addEventListener(`drop`,n=>{n.preventDefault(),t.classList.remove(`pair-slot--hover`);let a=v??Number(n.dataTransfer?.getData(`text/plain`));if(!a||e===`A`&&_?.id===a||e===`B`&&g?.id===a)return;let o=l.find(e=>e.id===a);if(o){if(s){if(e===`A`&&o.kjonnid!==pt){r(`Mix: Side A må vere ei kvinne`,`error`);return}if(e===`B`&&o.kjonnid!==ft){r(`Mix: Side B må vere ein mann`,`error`);return}}e===`A`?g=o:_=o,i(),C(),ee()}}),t}let A=document.createElement(`button`);A.type=`button`,A.className=`btn btn-primary btn-sm w-100 d-none mt-2`,A.textContent=`Opprett par`;function ee(){A.classList.toggle(`d-none`,g==null||_==null)}A.addEventListener(`click`,async()=>{if(!g||!_)return;A.disabled=!0;let{error:t}=await se(a,g.id,_.id);if(A.disabled=!1,t){r(`Feil ved oppretting av par: `+i(t),`error`);return}e.replaceChildren(M()),X(e,n)});function te(t){if(E.textContent=`Antal par: ${t.length}`,O.innerHTML=``,!t.length){let e=document.createElement(`p`);e.className=`text-muted fst-italic py-2 mb-0`,e.textContent=`Ingen par oppretta enno`,O.appendChild(e);return}for(let s of t){let t=document.createElement(`div`);t.className=`pair-row pair-grid-row mb-1`;let c=document.createElement(`span`);c.className=`pair-cell border rounded px-2 py-1`,c.textContent=F(s.sideA.kaster);let l=document.createElement(`span`);if(l.className=`pair-cell border rounded px-2 py-1`,l.textContent=F(s.sideB.kaster),t.appendChild(c),t.appendChild(l),o){let o=st({title:`Slett par`,onClick:async()=>{o.disabled=!0;let{error:t}=await T(a,s.lag_id);if(t){r(`Feil ved sletting: `+i(t),`error`),o.disabled=!1;return}e.replaceChildren(M()),X(e,n)}});t.appendChild(o)}O.appendChild(t)}}if(o){let e=document.createElement(`div`);e.className=`pair-grid-row mb-2`,e.appendChild(k(`A`)),e.appendChild(k(`B`)),w.appendChild(e),w.appendChild(A)}else{let e=document.createElement(`div`);e.className=`form-control mb-2 participant-search-spacer`,w.appendChild(e)}w.appendChild(E),w.appendChild(O),y.appendChild(b),y.appendChild(w),e.replaceChildren(y),C(),te(d)}function ht(e){let t=new Map,n=new Set;for(let r of e)r.kasterid!=null&&(t.set(r.kasterid,r.er_bekreftet??!1),r.lag_id!=null&&n.add(r.kasterid));return{registeredMap:t,pairedIds:n}}function gt(e){return[...e].sort((e,t)=>{let n=(e.klubb?.navn??``).localeCompare(t.klubb?.navn??``,`nb`);if(n!==0)return n;let r=(e.etternavn??``).localeCompare(t.etternavn??``,`nb`);return r===0?(e.fornavn??``).localeCompare(t.fornavn??``,`nb`):r})}function _t(e,t,n){let r=t.toLowerCase();return e.filter(e=>n.has(e.id)?!1:!r||F(e).toLowerCase().includes(r)||(e.klubb?.navn??``).toLowerCase().includes(r))}async function vt(e){let[t,n,r,i]=await Promise.all([_(e),ge(),le(e),ce(e)]);return t.error||!t.data?{ok:!1,error:`Stevne ikkje funne.`}:n.error?{ok:!1,error:`Kunne ikkje laste kasterliste.`}:{ok:!0,data:{stevne:t.data,throwers:n.data,registration:r.data,isGloppen:!i.error&&i.navn.includes(`gloppen`)}}}async function yt(e,{id:n,isAdmin:r=!1}){e.replaceChildren(M()),B(null);try{let t=await vt(n);if(!t.ok){e.replaceChildren(f(t.error));return}let{stevne:i,throwers:a,registration:o,isGloppen:s}=t.data,c=i.stevne_fase??null,l=r&&(c===null||c===`ikke_startet`),u=c!==null&&c!==`ikke_startet`,d=i.kategori?.erlagbasert??!1,{registeredMap:p,pairedIds:m}=ht(o),h=!0,g=document.createElement(`div`),_;r&&s&&u&&(_=ot({tournamentId:n,tournamentName:i.navn,isTeam:d,onStateChange:()=>S()}),g.appendChild(_.element));let y=document.createElement(`div`);y.className=`row g-3`;let b=null;u||(b=ut({canEdit:l,tournamentId:n,onRegistered:e=>{p.set(e,!1),h=!0,_?.invalidateMatchData()},refreshLists:()=>{S(),C()},onCreated:(e,t)=>{a.push(e),t&&(p.set(e.id,!1),h=!0,_?.invalidateMatchData()),S(),C()}}),y.appendChild(b.element));let x=dt({isStarted:u,canEdit:l,tournamentId:n,registeredMap:p,pairedIds:m,printerBanner:_,onConfirmed:e=>p.set(e,!0),onRemoved:e=>{p.delete(e),h=!0,_?.invalidateMatchData()},refreshRegisteredList:()=>S(),refreshBothLists:()=>{S(),C()}});y.appendChild(x.element);function S(){x.table.setPlayers(gt(a.filter(e=>p.has(e.id))))}function C(){b&&b.table.setPlayers(gt(_t(a,b.searchInput.value,p)))}if(d){let e=mt({tournamentId:n,isAdmin:l,isMix:(i.kategori?.navn??``).toLowerCase().includes(`mix`),getRegisteredIds:()=>new Set(p.keys()),allThrowers:a,onPairsChanged:e=>{m.clear();for(let t of e)m.add(t)}});g.appendChild(ke({tabs:[{id:`players`,label:`Spelarar`,panel:y},{id:`pairs`,label:`Administrer par`,panel:e.element}],onChange:t=>{t===`pairs`&&h&&(h=!1,e.refresh())}}))}else g.appendChild(y);e.replaceChildren(g),b?.searchInput.addEventListener(`input`,C),S(),C();async function w(){let{data:e,error:t}=await le(n);if(t)return;let{registeredMap:r,pairedIds:i}=ht(e);p.clear(),r.forEach((e,t)=>p.set(t,e)),m.clear(),i.forEach(e=>m.add(e)),h=!0,_?.invalidateMatchData(),S(),C()}let T=v(n,()=>{w()});Oe(()=>{De(T)}),j(()=>{w()})}catch(n){t(`stevne-deltakere.render`,n),e.replaceChildren(f(`Kunne ikkje laste deltakarliste.`))}}async function bt(e,{id:t,isAdmin:n=!1},r=null){e.replaceChildren(M());let{navn:i,error:a}=await ce(t);if(a){e.replaceChildren(f(`Stevne ikkje funne.`));return}if(i.includes(`gloppen`)){let{render:i}=await b(async()=>{let{render:e}=await import(`./gloppen-Cmx_CIM9.js`);return{render:e}},__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]));await i(e,{id:t,isAdmin:n},r)}else if(i.includes(`nordhordland`)){let{render:i}=await b(async()=>{let{render:e}=await import(`./nordhordland-Udk4PvK2.js`);return{render:e}},__vite__mapDeps([21,1,2,3,8,6,9,22,23,13,14,5,15,16,24,7,10,11,12,17,18,19,20]));await i(e,{id:t,isAdmin:n},r)}else if(xe(i)){let{render:i}=await b(async()=>{let{render:e}=await import(`./xkast-DJnrdD65.js`);return{render:e}},__vite__mapDeps([25,24,1,2,3,8,6,9,23,13,14,5,15,16,26,20,10,27,11,17,19]));await i(e,{id:t,isAdmin:n},r)}else e.replaceChildren(f(`Ukjend innleiande kastemetode: ${i||`(ikkje sett)`}`))}async function xt(e,{id:t,isAdmin:n=!1},r=null){e.replaceChildren(M());let{navn:i,error:a}=await ne(t);if(a){e.replaceChildren(f(`Stevne ikkje funne.`));return}if(i.includes(`cup`)){let{render:i}=await b(async()=>{let{render:e}=await import(`./cup-DsreCuFU.js`);return{render:e}},__vite__mapDeps([28,1,2,3,8,6,9,10,23,5,11,12,13,14,15,16,24,19,20,18]));await i(e,{id:t,isAdmin:n},r)}else if(i.includes(`kongelag`)){let{render:i}=await b(async()=>{let{render:e}=await import(`./kongelag-iASX5wdY.js`);return{render:e}},__vite__mapDeps([29,8,2,3,1,6,9,20,24,23,13,14,5,15,16,26,10,27,11,17,19]));await i(e,{id:t,isAdmin:n},r)}else if(i.includes(`nordhordland`)){let{render:i}=await b(async()=>{let{render:e}=await import(`./nordhordland-ClvYmiif.js`);return{render:e}},__vite__mapDeps([30,8,2,3,1,6,9]));await i(e,{id:t,isAdmin:n},r)}else e.replaceChildren(f(`Ukjend avsluttande kastemetode: ${i||`(ikkje sett)`}`))}async function Z(e,{id:n}){j(()=>Z(e,{id:n})),e.replaceChildren(M());try{let[a,o]=await Promise.all([de(n),ae()]);if(a.error||!a.data){e.replaceChildren(f(`Stevne ikkje funne.`));return}let s=a.data,c=o.data,l=s.er_snc_hovudstevne===!0,u=s.snc_hovudstevne_id,m=u!=null,h=m?` disabled`:``,g=c.filter(e=>e.er_innledende&&(!l||xe(e.navn))),_=c.filter(e=>e.er_avsluttende&&(!l||Ce(e.navn)));function v(e,t){return e.map(e=>`<option value="${e.id}"${e.id===t?` selected`:``}>${C(e.navn)}</option>`).join(``)}e.innerHTML=`
      <div>
        <div class="mb-3">
          <a href="#/stevne/${n}/rediger" class="btn btn-outline-secondary btn-sm">Rediger stevne</a>
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
          ${m?`<p class="form-text mb-3">Kastemetoden kjem frå
                   <a href="#/stevne/${u}/innstillinger">SNC-hovudstevnet</a>
                   og kan berre endrast der.</p>`:``}
          <div class="mb-3">
            <label class="form-label fw-semibold">Antal rundar innleiande</label>
            <input id="antall-rundar" type="number" min="1" class="form-control"
              value="${s.antall_runder_innl??``}" placeholder="t.d. 6">
          </div>
          ${l?`<p class="form-text mb-4">Kastemetoden gjeld heile SNC-runden og blir arva av alle lokalstevna. Banar blir sette på kvart lokalstevne.</p>`:`<div class="mb-4">
            <label class="form-label fw-semibold">Tilgjengelege banar (X-kast/Kongelag)</label>
            <input id="tilgjengelege-banar" type="number" min="1" class="form-control"
              value="${s.tilgjengelige_baner??``}" placeholder="Valfritt — utan verdi blir det éi pulje">
          </div>`}
          <button type="submit" class="btn btn-primary">Lagre</button>
          <span id="lagre-status" class="ms-3 text-success d-none">Lagra ✓</span>
          ${l?``:`<hr class="my-4">
          <div class="border border-danger rounded p-3">
            <h6 class="text-danger mb-2">Farleg sone</h6>
            <p class="text-muted small mb-2">Slettar alle kampar og resultat, og set stevnet tilbake til starttilstanden.</p>
            <button type="button" id="nullstill-btn" class="btn btn-danger">Start på nytt!</button>
          </div>`}
        </form>
      </div>`;let y=e.querySelector(`#innl-metode`),b=e.querySelector(`#antall-rundar`);function x(){let e=g.find(e=>e.id===Number(y.value)),t=e!=null&&Se(e.navn);b.disabled=!t,t||(b.value=``),b.placeholder=t?`t.d. 6`:`Berre for Gloppen/NHM`}x(),y.addEventListener(`change`,x),e.querySelector(`#innstillingar-form`).addEventListener(`submit`,async a=>{a.preventDefault();let o=e.querySelector(`#innl-metode`).value||null,c=e.querySelector(`#avsl-metode`).value||null,l=e.querySelector(`#antall-rundar`).value,u=e.querySelector(`#tilgjengelege-banar`),{error:f}=await d(n,{innledendekastemetodeid:m?s.innledendekastemetodeid:o?Number(o):null,avsluttendekastemetodeid:m?s.avsluttendekastemetodeid:c?Number(c):null,antall_runder_innl:l?Number(l):null,tilgjengelige_baner:u?.value?Number(u.value):null});if(f){t(`stevne-innstillingar.lagre`,f),r(`Feil ved lagring: `+i(f),`error`);return}let p=e.querySelector(`#lagre-status`);p.classList.remove(`d-none`),setTimeout(()=>{p.classList.add(`d-none`)},2e3)}),e.querySelector(`#nullstill-btn`)?.addEventListener(`click`,async t=>{let a=t.currentTarget;if(!await p({title:`Nullstill stevne`,message:`Dette slettar alle kampar og resultat og set stevnet tilbake til starttilstanden. Er du sikker?`,danger:!0}))return;a.disabled=!0;let{error:o}=await Ve(n);if(o){r(`Feil ved nullstilling: `+i(o),`error`),a.disabled=!1;return}await Z(e,{id:n})})}catch(n){t(`stevne-innstillingar.render`,n),e.replaceChildren(f(`Kunne ikkje laste innstillingar.`))}}var St=new Set([`NC`,`SNC`,`DNC`]),Ct=new Set([`Gloppen`,`Nordhordlandsmetoden`]);function wt(e){let t=new Set,n=[];for(let r of e){let e=r.klubb?.navn??`–`;t.has(e)||(t.add(e),n.push(e))}return n.map(C).join(` / `)}function Tt(e){let t=new Map,n=0;for(let r of e){let e=r.startnummer==null?`_${n++}`:r.startnummer,i=t.get(e)??[];i.push(r),t.set(e,i)}return[...t.values()]}function Et(e,t){let n=new Map;for(let r of e){let e=r.gruppe?.navn??`–`,i=r.klasse?.navn??null,a=t?`${i??``}|${e}`:e,o=t?`${i?i+` `:``}${e}`:e;n.has(a)||n.set(a,{label:o,rows:[]}),n.get(a).rows.push(r)}return[...n.values()].sort((e,t)=>e.label.localeCompare(t.label,`nb`))}function Dt(e,t){let n=[];return t.showKpSp&&n.push(`KP ${e.kamp_poeng_innl??`–`}`,`SP ${e.score_poeng_innl??`–`}`),t.showSnc&&n.push(`SNC ${e.snc_plassering??`–`}.`),t.showNc&&n.push(`NC ${e.nc_poeng??`–`}`),n.length?`<span class="res-meta">${n.join(`  `)}</span>`:``}function Ot(e,t){let n=Q(e,t,(e,n)=>{let r=e.map(e=>C(F(e.kaster)||`–`)).join(` og `);return`
        <div class="res-row">
          <span class="res-pl">${n.plassering??`–`}.</span>
          <div class="res-info">
            <span class="res-navn">${r}</span>
            <span class="res-klubb">${wt(e)}</span>
            ${Dt(n,t)}
          </div>
        </div>`},e=>`
      <div class="res-row">
        <span class="res-pl">${e.plassering??`–`}.</span>
        <div class="res-info">
          <span class="res-navn">${C(F(e.kaster)||`–`)}</span>
          <span class="res-klubb">${C(e.klubb?.navn??`–`)}</span>
          ${Dt(e,t)}
        </div>
      </div>`).join(``);return`
    <div class="res-group">
      <h2 class="res-group-title">${C(e.label)}</h2>
      <div class="res-group-rows">${n}</div>
    </div>`}function Q(e,t,n,r){return t.isParMix?Tt(e.rows).map(e=>n(e,e[0])):e.rows.map(r)}function kt(e,t,n,r,i){return`
    <tr>
      <td class="res-td-pl">${e??`–`}</td>
      <td class="res-td-navn">${t}</td>
      <td class="res-td-klubb">${n}</td>
      ${i.showKpSp?`<td class="res-td-kp">${r.kamp_poeng_innl??``}</td><td class="res-td-sp">${r.score_poeng_innl??``}</td>`:``}
      ${i.showSnc?`<td class="res-td-pl">${r.snc_plassering??``}</td>`:``}
      ${i.showNc?`<td class="res-td-nc">${r.nc_poeng??``}</td>`:``}
    </tr>`}function At(e,t){let n=e=>{let t=e.kaster;return t?`<a href="#/kastere/${Te(t)}" class="res-kaster-lenke">${C(F(t))}</a>`:`–`},r=Q(e,t,(e,r)=>kt(r.plassering,e.map(n).join(` og `),wt(e),r,t),e=>kt(e.plassering,n(e),C(e.klubb?.navn??`–`),e,t)).join(``);return`
    <div class="res-table-section">
      <table class="res-table">
        <thead>
          <tr class="res-thead-group">
            <td colspan="${3+(t.showKpSp?2:0)+ +!!t.showSnc+ +!!t.showNc}" class="res-td-group-header">${C(e.label)}</td>
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
    </div>`}async function jt(e,{id:n}){e.replaceChildren(M(`Laster resultat…`));try{let[t,r]=await Promise.all([Ne(n),je(n)]);if(t.error||!t.data){e.replaceChildren(f(`Kunne ikkje laste stevnet.`));return}if(r.error){e.replaceChildren(f(`Kunne ikkje laste resultat.`));return}let i=t.data,a=r.data;if(!a.length){e.replaceChildren(P(i.erfullfort?`Ingen resultat registrert.`:`Turneringa er ikkje avslutta enno.`));return}let o=Et(a,(i.dato?new Date(i.dato+`T12:00:00`).getFullYear():9999)<2026),s=a.length,c={isParMix:i.kategori?.erlagbasert??!1,showNc:St.has(i.stevnetype?.navn??``),showKpSp:Ct.has(i.innledende?.navn??``),showSnc:i.snc_hovudstevne_id!=null&&a.some(e=>e.snc_plassering!=null)},l=i.snc_hovudstevne_id==null?``:`<p class="res-klassifisering">
             <a href="#/stevne/${i.snc_hovudstevne_id}/resultat">Samla SNC-resultat for alle lokale stevne →</a>
           </p>`;e.innerHTML=`
      <div class="res-side">
        <div class="res-felles">
          ${i.resultaturl?.startsWith(`http`)?`<a class="res-pdf-lenke" href="${C(i.resultaturl)}" target="_blank" rel="noopener">Resultat som pdf 📄</a>`:``}
          ${l}
          ${i.juryleder?`<p class="res-klassifisering">Juryleder: ${C(i.juryleder)}</p>`:``}
          <p class="res-antall"><strong>Antall deltakarar: ${s}</strong></p>
        </div>
        <div class="res-mobil-blokk">
          ${o.map(e=>Ot(e,c)).join(``)}
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
    `).eq(`stevneid`,n).eq(`er_bekreftet`,!0).eq(`er_walkover`,!1);return i&&t(`getMatchesForStats`,i),{data:r??[],error:i}}async function Nt(n){let{data:r,error:i}=await e.from(`resultat`).select(`kasterid, posisjon`).eq(`stevneid`,n);i&&t(`getPositionForTournament`,i);let a=new Map;for(let e of r??[])e.kasterid!=null&&e.posisjon!=null&&a.set(e.kasterid,e.posisjon);return a}function Pt(e,t,n){let r=n.get(e.kasterid)??null;return t.filter(t=>t.kasterid!==e.kasterid&&(n.get(t.kasterid)??null)===r).reduce((e,t)=>e+t.score_poeng,0)}function Ft(e,t){let n=new Map;for(let r of e){if(r.er_walkover)continue;let e=r.spelarar;for(let r of e){let i=Pt(r,e,t);n.has(r.kasterid)||n.set(r.kasterid,{kasterid:r.kasterid,navn:F(r.kaster),matchCount:0,shoesThrown:0,ringers:0,ringerPct:0,doubleRingers:0,score4:0,score3:0,score2:0,score1:0,score0:0,scoreDiff:0});let a=n.get(r.kasterid);r.omgangar.length>0&&a.matchCount++,a.scoreDiff+=r.score_poeng-i;for(let e of r.omgangar)a.shoesThrown+=2,e.antall_ringer!=null&&(a.ringers+=e.antall_ringer),e.antall_ringer===2&&a.doubleRingers++,e.score===4?a.score4++:e.score===3?a.score3++:e.score===2?a.score2++:e.score===1?a.score1++:e.score===0&&a.score0++}}let r=[...n.values()].filter(e=>e.shoesThrown>0);for(let e of r)e.ringerPct=e.shoesThrown>0?e.ringers/e.shoesThrown*100:0;return r.sort((e,t)=>t.ringerPct-e.ringerPct)}function It(e){return e>0?`+${e}`:String(e)}function Lt(e){return`
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
      <td class="stats-td-name">${C(e.navn)}</td>
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
    </div>`}function Rt(e){let t=!1,n=0,r=0;e.addEventListener(`mousedown`,i=>{t=!0,e.classList.add(`is-grabbing`),n=i.pageX-e.offsetLeft,r=e.scrollLeft}),e.addEventListener(`mouseleave`,()=>{t=!1,e.classList.remove(`is-grabbing`)}),e.addEventListener(`mouseup`,()=>{t=!1,e.classList.remove(`is-grabbing`)}),e.addEventListener(`mousemove`,i=>{t&&(i.preventDefault(),e.scrollLeft=r-(i.pageX-e.offsetLeft-n))})}function zt(e,t){let n=[...e.querySelectorAll(`tr`)],r=n[0];if(!r)return;let i=[...r.cells].slice(0,t).map(e=>e.offsetWidth);for(let e of n){let n=0;for(let r=0;r<t&&r<e.cells.length;r++){let a=e.cells[r];a&&(a.classList.add(`stats-col-sticky`),r===t-1&&a.classList.add(`stats-col-sticky-last`),a.style.setProperty(`--col-left`,`${n}px`),n+=i[r]??0)}}}async function Bt(e,{id:n}){e.replaceChildren(M(`Laster statistikk…`));try{let[{data:t,error:r},i]=await Promise.all([Mt(n),Nt(n)]);if(r){e.replaceChildren(f(`Kunne ikkje laste statistikk.`));return}let a=Ft(t,i);if(!a.length){e.replaceChildren(P(`Ingen statistikk registrert.`));return}e.innerHTML=`<div class="stats-side">${Lt(a)}</div>`;let o=e.querySelector(`.stats-table-wrap`),s=e.querySelector(`.stats-table`);o&&Rt(o),s&&zt(s,1)}catch(n){t(`stevne-stats.render`,n),e.replaceChildren(f(`Kunne ikkje laste statistikk.`))}}function $(e){let t=[e.klubb?.navn,e.sted].filter(e=>!!e?.trim()),n=[...new Set(t.map(e=>e.trim()))];return n.length?n.join(` · `):e.navn}function Vt(e){return e.stevne_fase===null||e.stevne_fase===`ikke_startet`}function Ht(e){return e.erfullfort?`done`:Vt(e)?`upcoming`:`live`}function Ut(e){return Vt(e)&&!e.erfullfort}function Wt(e){let t=[e.kastemetodeInnl?.navn,e.kastemetodeAvsl?.navn].filter(Boolean);return t.length?t.join(` → `):`—`}function Gt(e,t,n){let r=t.filter(e=>e.erfullfort).length;return`
    <div class="card mb-3">
      <div class="card-body">
        <table class="table table-sm mb-0">
          <tbody>
            <tr><th>Status</th><td>${C(e.erfullfort?`Samla resultat er klart`:t.length?`${r} av ${t.length} lokale stevne fullført`:`Ingen lokale stevne registrerte`)}</td></tr>
            <tr><th>Dato</th><td>${e.dato?l(e.dato):`—`}</td></tr>
            <tr><th>Tid</th><td>${e.tid?y(e.tid):`—`}</td></tr>
            <tr><th>Kategori</th><td>${C(e.kategori?.navn??`—`)}</td></tr>
            <tr><th>Kastemetode</th><td>${C(Wt(e))}</td></tr>
            <tr><th>Lokale stevne</th><td>${t.length}</td></tr>
            <tr><th>Påmelde i alt</th><td>${n}</td></tr>
          </tbody>
        </table>
      </div>
    </div>`}function Kt(e,t,n,r,i){if(!r)return`<div class="alert alert-info">
      <a href="#/logginn?redirect=/stevne/${i}/info">Logg inn</a> for å melde deg på eitt av dei lokale stevna.
    </div>`;if(!n)return``;if(t.ownStevneId==null)return`<div class="alert alert-info">Vel kva lokalt stevne du vil delta på. Du kan berre stå på eitt per SNC-runde.</div>`;let a=e.find(e=>e.id===t.ownStevneId);return`<div class="alert alert-success">
    Du er påmeld <strong>${C(a?$(a):`eit lokalt stevne`)}</strong>.
  </div>`}function qt(e,t,n){let r=t.counts.get(e.id)??0,i=[e.tid?y(e.tid):``,`${r} påmelde`].filter(Boolean).join(` · `);return k({title:$(e),href:`#/stevne/${e.id}/${e.erfullfort?`resultat`:`info`}`,date:h(e.dato),dateIso:e.dato,dateFull:c(e.dato),dateWeekday:s(e.dato),dateDay:he(e.dato),status:Ht(e),meta:[i],nearestLabel:t.ownStevneId===e.id?`PÅMELD`:void 0,actionSlot:n&&Ut(e)})}async function Jt(e,{id:n,isAdmin:r=!1},i=null){let a=()=>Jt(e,{id:n,isAdmin:r},i);j(a),e.replaceChildren(M(`Laster lokale stevne…`));try{let[t,o,s]=await Promise.all([me(n),S(n),u()]);if(t.error||!t.data){e.replaceChildren(f(`Fann ikkje SNC-hovudstevnet.`));return}let c=t.data,l=o.data,d=s?.profil?.kobling_status===`godkjent`?s.profil.kasterid:null,p=await pe(l.map(e=>e.id),d),m=[...p.counts.values()].reduce((e,t)=>e+t,0),h=d!=null&&!c.erfullfort;Xt(i,c,l,r,a),e.innerHTML=`
      <div class="org-max-480">
        ${Gt(c,l,m)}
        ${Kt(l,p,h,s!=null,n)}
        <h6 class="mb-2">Lokale stevne (${l.length})</h6>
        <div id="snc-locals" class="stevne-kort-liste"></div>
        ${r?`<div class="mt-3"><a class="btn btn-sm btn-outline-success" href="#/stevne/ny?snc=${n}">+ Nytt lokalt stevne</a></div>`:``}
      </div>`;let g=e.querySelector(`#snc-locals`);if(!l.length){g.replaceChildren(P(`Ingen lokale stevne er kopla til denne SNC-runden enno.`));return}for(let e of l){let t=qt(e,p,h),n=t.querySelector(`[data-action-slot]`);n&&d!=null&&n.replaceWith(Yt(e,p,d,a)),g.appendChild(t)}}catch(n){t(`snc-info.render`,n),e.replaceChildren(f(`Kunne ikkje laste dei lokale stevna.`))}}function Yt(e,t,a,o){let s=t.ownStevneId===e.id,c=!s&&t.ownStevneId!=null,l=document.createElement(`button`);return l.type=`button`,l.className=s?`btn btn-sm btn-outline-danger snc-avmeld`:c?`btn btn-sm btn-outline-primary snc-byt`:`btn btn-sm btn-primary snc-meldpa`,l.textContent=s?`Meld av`:c?`Byt hit`:`Meld på`,l.addEventListener(`click`,async()=>{if(s){if(t.ownRegistrationId==null||!await p({title:`Meld av`,message:`Vil du melde deg av SNC-runden?`}))return;l.disabled=!0;let{error:e}=await n(t.ownRegistrationId);if(e){r(`Kunne ikkje melde av: `+i(e),`error`),l.disabled=!1;return}r(`Du er meldt av.`,`success`),await o();return}if(c){if(!await p({title:`Byt lokalt stevne`,message:`Du blir meldt av det lokale stevnet du står på no, og påmeld dette i staden. Fortsette?`}))return;if(l.disabled=!0,t.ownRegistrationId!=null){let{error:e}=await n(t.ownRegistrationId);if(e){r(`Kunne ikkje melde av det gamle lokalstevnet: `+i(e),`error`),l.disabled=!1;return}}let{error:s}=await g(e.id,a);if(s){r(`Du er meldt av det gamle lokalstevnet, men påmeldinga feila: `+i(s),`error`),await o();return}r(`Du er meldt på det nye lokalstevnet.`,`success`),await o();return}l.disabled=!0;let{error:u}=await g(e.id,a);if(u){r(`Kunne ikkje melde på: `+i(u),`error`),l.disabled=!1;return}r(`Du er meldt på.`,`success`),await o()}),l}function Xt(e,t,n,o,s){if(!e)return;if(!o){e.innerHTML=``;return}let c=n.length>0&&n.every(e=>e.erfullfort);if(t.erfullfort){e.innerHTML=`<button id="snc-reopen-btn" class="btn btn-sm btn-outline-warning">Gjenopne SNC-runden</button>`,e.querySelector(`#snc-reopen-btn`)?.addEventListener(`click`,async()=>{if(!await p({title:`Gjenopne SNC-runden`,message:`Den samla lista og NC-poenga blir nullstilte, og lokalstevna kan endrast igjen. Fortsette?`,danger:!0}))return;let{error:e}=await a(t.id);if(e){r(`Kunne ikkje gjenopne: `+i(e),`error`);return}await s()});return}e.innerHTML=`<button id="snc-complete-btn" class="btn btn-sm btn-success"${c?``:` disabled`}>Konsolider SNC-runden</button>`,e.querySelector(`#snc-complete-btn`)?.addEventListener(`click`,async()=>{if(!await p({title:`Konsolider SNC-runden`,message:`Alle lokalresultata blir slåtte saman til éi liste, og NC-poenga blir rekna ut frå den samla plasseringa. Fortsette?`,danger:!0}))return;let{error:e}=await E(t.id);if(e){r(`Kunne ikkje konsolidere: `+i(e),`error`);return}r(`SNC-runden er konsolidert.`,`success`),await s()})}function Zt(e,t){return t.carryFactor==null?(t.showKongelag?e.poeng_kongelag:e.poeng_xkast)??0:(e.poeng_kongelag??0)+Math.round((e.poeng_xkast??0)*t.carryFactor)}function Qt(e,t){let n=e.kaster,r=n?`<a href="#/kastere/${Te(n)}" class="res-kaster-lenke">${C(F(n))}</a>`:`–`;return`
    <tr>
      <td class="res-td-pl">${e.snc_plassering??`–`}</td>
      <td class="res-td-navn">${r}</td>
      <td class="res-td-klubb">${C(e.klubb?.navn??`–`)}</td>
      <td class="res-td-klubb">${C($(e.stevne))}</td>
      ${t.showXkast?`<td class="res-td-kp">${e.poeng_xkast??``}</td>`:``}
      ${t.showKongelag?`<td class="res-td-sp">${e.poeng_kongelag??``}</td>`:``}
      <td class="res-td-sp">${Zt(e,t)}</td>
      <td class="res-td-nc">${e.nc_poeng??``}</td>
      <td class="res-td-pl">${e.plassering??`–`}</td>
    </tr>`}function $t(e,t){let n=[`TOT ${Zt(e,t)}`,`NC ${e.nc_poeng??`–`}`];return t.showXkast&&n.unshift(`X ${e.poeng_xkast??`–`}`),t.showKongelag&&n.unshift(`K ${e.poeng_kongelag??`–`}`),`
    <div class="res-row">
      <span class="res-pl">${e.snc_plassering??`–`}.</span>
      <div class="res-info">
        <span class="res-navn">${C(F(e.kaster)||`–`)}</span>
        <span class="res-klubb">${C(e.klubb?.navn??`–`)} · ${C($(e.stevne))}</span>
        <span class="res-meta">${n.join(`  `)}</span>
      </div>
    </div>`}async function en(e,{id:n}){e.replaceChildren(M(`Laster samla resultat…`));try{let[t,r]=await Promise.all([me(n),Me(n)]);if(t.error||!t.data){e.replaceChildren(f(`Fann ikkje SNC-hovudstevnet.`));return}if(r.error){e.replaceChildren(f(`Kunne ikkje laste samla resultat.`));return}let i=t.data,a=r.data.filter(e=>e.snc_plassering!=null);if(!i.erfullfort||!a.length){e.replaceChildren(P(`Den samla lista blir klar når alle dei lokale stevna er fullførte og runden er konsolidert.`));return}let o=i.kastemetodeInnl?.antall_omganger??null,s=i.innledendekastemetodeid!=null,c=i.avsluttendekastemetodeid!=null,l={showXkast:s,showKongelag:c,carryFactor:s&&c&&o?Ie(o):null},u=new Set(r.data.map(e=>e.stevne.id)).size,d=l.carryFactor!=null&&o?` · overføring frå X-kast ${Fe(o)} %`:``;e.innerHTML=`
      <div class="res-side">
        <div class="res-felles">
          <p class="res-antall"><strong>${a.length} deltakarar frå ${u} lokale stevne</strong>${C(d)}</p>
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
      </div>`}catch(n){t(`snc-resultat.render`,n),e.replaceChildren(f(`Kunne ikkje laste samla resultat.`))}}var tn=[{key:`info`,label:`Info`,adminOnly:!1,completedOnly:!1},{key:`deltakere`,label:`Deltakere`,adminOnly:!0,completedOnly:!1},{key:`innledende`,label:`Innl.`,adminOnly:!1,completedOnly:!1},{key:`avsluttende`,label:`Avsl.`,adminOnly:!1,completedOnly:!1},{key:`resultat`,label:`Sluttresultat`,adminOnly:!1,completedOnly:!0},{key:`innstillinger`,label:`Innstillingar`,adminOnly:!0,completedOnly:!1},{key:`stats`,label:`Stats`,adminOnly:!1,completedOnly:!1}],nn=new Set([`deltakere`,`innledende`,`avsluttende`,`stats`]),rn={info:I,deltakere:yt,innledende:bt,avsluttende:xt,innstillinger:Z,resultat:jt,stats:Bt},an={info:Jt,resultat:en};function on(e,t,n,r){return tn.filter(t=>e||!t.adminOnly).filter(e=>e.key!==`avsluttende`||t).filter(e=>!e.completedOnly||n).filter(e=>!r||!nn.has(e.key))}function sn(e,t,n){return`<ul class="nav nav-underline tournament-nav mb-0 px-3">${n.map(({key:n,label:r})=>`
      <li class="nav-item">
        <a class="nav-link${t===n?` active`:``}"
           href="#/stevne/${e}/${n}">${r}</a>
      </li>`).join(``)}</ul>`}async function cn(e,n){let r=Number(n.id),i=String(n.tab??`info`);e.replaceChildren(M());try{let{data:t,error:n}=await _(r);if(n||!t){e.replaceChildren(f(`Stevne ikkje funne.`));return}ie(t.navn);let a=await m()||await o(),s=t.avsluttendekastemetodeid!=null,c=t.erfullfort===!0,l=t.er_snc_hovudstevne===!0,u=on(a,s,c,l),d=u.some(e=>e.key===i)?i:`info`;e.innerHTML=`
      <div class="org-shell pb-3 pt-1">
        ${sn(r,d,u)}
        <div class="org-fase-header d-flex align-items-center gap-2 mb-3">
          <h5 class="mb-0">${C(t.navn)}</h5>
          <div id="org-banner-buttons"></div>
        </div>
        <div id="org-subpage" class="px-3"></div>
      </div>`;let p=e.querySelector(`#org-banner-buttons`),h=e.querySelector(`#org-subpage`);await((l?an[d]:void 0)??rn[d]??I)(h,{id:r,isAdmin:a},p)}catch(n){t(`stevne.render`,n),e.replaceChildren(f(`Kunne ikkje laste stevnet.`))}}export{cn as render};