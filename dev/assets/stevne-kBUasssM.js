const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/gloppen-BU0QB45m.js","assets/logError-BO7RC_Nh.js","assets/vendor-C-D82lIT.js","assets/rolldown-runtime-DK3Fl9T5.js","assets/roundInfoBuilder-BlrpvzVS.js","assets/kampService-Dgr8rFtc.js","assets/verifiedWrite-B5unhhqf.js","assets/innledendeBase-GAWyNB_a.js","assets/index-BOGgiIrf.js","assets/index-DRpVmDEK.css","assets/LoadingState-C6NB62Ct.js","assets/navigation-CLFdaq7c.js","assets/LivePill-Bwfk6OSo.js","assets/omgangValidation-ClxsXSUk.js","assets/kaster-CGWDYFbf.js","assets/Table-B_UMcRWp.js","assets/navigationService-CSA1wHWO.js","assets/testDataService-Dvs3Nhyz.js","assets/scoreEditor-CGIuC9V8.js","assets/ScoreNumberpad-BqTXeh5F.js","assets/createEl-C9Xo-o-q.js","assets/nordhordland-3iuuaDdd.js","assets/kampGenereringInnledendeService-l9lf4PPr.js","assets/xkastKongelagService-BJqnqg52.js","assets/xkast-D1DcCHOw.js","assets/xkastKongelagView-CUwyijMP.js","assets/EmptyState-CCNgsnix.js","assets/cup-DpayPm-E.js","assets/kongelag-BF4qPs1i.js","assets/nordhordland-C_ww3TED.js"])))=>i.map(i=>d[i]);
import{n as e,t}from"./logError-BO7RC_Nh.js";import{C as n,Ct as r,D as i,E as a,Ft as o,M as s,Mt as c,Ot as l,Q as u,St as d,T as f,_ as p,a as m,at as h,b as g,c as _,d as v,g as y,gt as b,h as x,it as S,j as C,k as w,l as T,mt as E,p as D,r as O,s as k,t as A,tt as j,u as M,v as N,w as ee,wt as P}from"./index-BOGgiIrf.js";import{r as te}from"./klubbService-BRsJvfyR.js";import{r as ne,s as re,t as ie}from"./kasterService-CNRTXiz_.js";import{n as ae,r as F}from"./kaster-CGWDYFbf.js";import{t as I}from"./LoadingState-C6NB62Ct.js";import{t as oe}from"./EmptyState-CCNgsnix.js";import{t as se}from"./buildDropdownOptions-BO1_8OQD.js";import{t as L}from"./formNum-HGeagI_O.js";import{o as ce}from"./kampService-Dgr8rFtc.js";import{n as le,t as ue}from"./navigation-CLFdaq7c.js";import{t as de}from"./SearchInput-BwD50MFz.js";import{t as fe}from"./Tabs-DZCBJPb0.js";import{t as pe}from"./LivePill-Bwfk6OSo.js";import{d as me,f as he,u as ge}from"./omgangValidation-ClxsXSUk.js";import{h as _e,i as ve,m as ye}from"./xkastKongelagService-BJqnqg52.js";import{t as be}from"./kampGenereringInnledendeService-l9lf4PPr.js";import{n as xe,t as Se}from"./roundInfoBuilder-BlrpvzVS.js";import{r as Ce}from"./testDataService-Dvs3Nhyz.js";function we(e,t){return t?`Fullført`:e===`avsluttende`?`Avsluttande fase ${pe()}`:e===`innledende`?`Innleiande fase ${pe()}`:`Ikkje starta`}async function R(e,{id:n,isAdmin:r=!1},o=null){A(()=>R(e,{id:n,isAdmin:r},o)),e.replaceChildren(I());try{let[t,s,u,h]=await Promise.all([S(n),p(n),x(n),w()]);if(t.error||!t.data){e.replaceChildren(P(`Stevne ikkje funne.`));return}let _=t.data,v=_.stevne_fase??null,y=v===null||v===`ikke_startet`,b=_.kastemetodeInnl?.navn??`—`,C=b.toLowerCase().includes(`gloppen`),T=_.kategori?.erlagbasert??!1,E=(_.kategori?.navn??``).toLowerCase(),O=E.includes(`par`)||E.includes(`mix`),A=!_.kastemetodeInnl&&(_.kastemetodeAvsl?.navn??``).toLowerCase().includes(`kongelag`);if(o&&y&&r){o.innerHTML=`<button id="start-stevne-btn" class="btn btn-sm btn-success">Start stevne</button>`;let e=o.querySelector(`#start-stevne-btn`);e.addEventListener(`click`,async()=>{if(!_.kastemetodeInnl&&!A){a(`Du må velje kastemetode for innleiande fase. Gå til Innstillingar for å endre.`,`error`);return}if(T?s<4:s<2){a(T?`Stevnet treng minst 2 par (4 spelarar) for å startast.`:`Stevnet må ha minst 2 spelarar for å startast.`,`error`);return}if(C&&!_.antall_runder_innl){a(`Du må setje antal rundar for innleiande fase. Gå til Innstillingar for å endre.`,`error`);return}let t=await g(n);if(t>0&&!await i({title:`Ubekrefta spelarar`,message:`${t} spelar(ar) er ikkje bekrefta. Vil du starte stevnet likevel?`}))return;if(e.disabled=!0,e.textContent=`Starter…`,A){let{error:t}=await d(n,`avsluttende`);if(t){a(`Feil ved oppdatering av fase.`,`error`),e.disabled=!1,e.textContent=`Start stevne`;return}let{error:r}=await ve(n);if(r){a(`Feil ved generering av Kongelag-banar: `+f(r),`error`),e.disabled=!1,e.textContent=`Start stevne`;return}location.hash=`#/stevne/${n}/avsluttende`;return}try{await be(n,b,_.antall_runder_innl??1,T)}catch(t){a(`Feil ved kampgenerering: `+f(t),`error`),e.disabled=!1,e.textContent=`Start stevne`;return}let{error:r}=await d(n,`innledende`);if(r){a(`Feil ved oppdatering av fase.`,`error`),e.disabled=!1,e.textContent=`Start stevne`;return}location.hash=`#/stevne/${n}/innledende`})}e.innerHTML=`
      <div class="card mb-3 org-max-480">
        <div class="card-body">
          <table class="table table-sm mb-0">
            <tbody>
              <tr><th>Status</th><td>${we(_.stevne_fase,_.erfullfort)}</td></tr>
              <tr><th>Stad</th><td>${m(_.sted??`—`)}</td></tr>
              <tr><th>Dato</th><td>${_.dato?l(_.dato):`—`}</td></tr>
              <tr><th>Tid</th><td>${_.tid?c(_.tid):`—`}</td></tr>
              <tr><th>Kategori</th><td>${m(_.kategori?.navn??`—`)}</td></tr>
              <tr><th>Kastemetode innleiande</th><td>${m(b)}</td></tr>
              <tr><th>Kastemetode avsluttande</th><td>${m(_.kastemetodeAvsl?.navn??`—`)}</td></tr>
              <tr><th>Antal rundar innleiande</th><td>${_.antall_runder_innl??`—`}</td></tr>
              <tr><th>Påmelde ${O?`par`:`spelarar`}</th><td>${O?u:s}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <div id="info-handling-knapper" class="mb-3 d-flex gap-2 flex-wrap"></div>`;let j=e.querySelector(`#info-handling-knapper`);if(h?.profil?.kobling_status===`godkjent`&&y){let t=h.profil.kasterid;if(t===null)return;let i=(await D(n,t)).data;j.appendChild(k({tournamentId:n,throwerId:t,userId:h.user.id,isRegistered:i!==null,registrationId:i?.id,onAction:()=>{R(e,{id:n,isAdmin:r},o)}}))}let M=document.createElement(`a`);M.href=`#/stevne/${n}/pamelding`,M.className=`btn btn-sm btn-outline-secondary`,M.textContent=`Sjå påmeldingar`,j.appendChild(M);let N=document.createElement(`button`);N.type=`button`,N.className=`btn btn-sm btn-outline-secondary`,N.textContent=`Oppdater`,N.addEventListener(`click`,()=>{R(e,{id:n,isAdmin:r},o)}),j.appendChild(N)}catch(n){t(`stevne-info.render`,n),e.replaceChildren(P(`Kunne ikkje laste info.`))}}var z=null,B=null,Te=null,Ee=[];function V(){return`serial`in navigator}function De(){return z!==null}function Oe(e){Te=e}function ke(){B&&navigator.serial.removeEventListener(`disconnect`,B),B=e=>{z!==null&&(z=null,B=null,Te?.())},navigator.serial.addEventListener(`disconnect`,B)}async function Ae(){if(!V()||z)return!1;let e=(await navigator.serial.getPorts())[0];if(!e)return!1;try{return await e.open({baudRate:9600}),z=e,ke(),!0}catch{return!1}}async function je(){if(!V())throw Error(`Web Serial API is not supported in this browser.`);if(z)return;let e=Ee.length>0?{filters:Ee}:void 0,t=await navigator.serial.requestPort(e);await t.open({baudRate:9600}),z=t,ke()}async function Me(){if(z){B&&=(navigator.serial.removeEventListener(`disconnect`,B),null);try{await z.close()}catch(e){t(`receiptPrinterService.disconnect`,e)}finally{z=null}}}async function Ne(){let e=z;await Me();try{await e?.forget()}catch(e){t(`receiptPrinterService.forget`,e)}}async function Pe(e){if(!z)throw Error(`Ingen printar tilkopla. Koble til ein printar fyrst.`);let t=z.writable;if(!t)throw Error(`Printerport er ikkje i skrivemodus.`);let n=t.getWriter();try{await n.write(e)}finally{n.releaseLock()}}var Fe=0,Ie=10,H=27,Le=29;function U(...e){return new Uint8Array(e)}function Re(){return U(H,64)}function W(e){return U(H,97,e===`center`?1:e===`right`?2:0)}function G(e){return U(H,33,e?8:0)}function ze(e,t){return U(Le,33,e-1<<4|t-1)}function K(e){let t=e.replace(/æ/g,`ae`).replace(/ø/g,`oe`).replace(/å/g,`aa`).replace(/Æ/g,`Ae`).replace(/Ø/g,`Oe`).replace(/Å/g,`Aa`).replace(/[\x00-\x1F\x7F]/g,` `).slice(0,32),n=new Uint8Array(t.length+1);for(let e=0;e<t.length;e++)n[e]=t.charCodeAt(e)&255;return n[t.length]=Ie,n}function q(){return K(`-`.repeat(32))}function Be(){return U(Le,86,65,Fe)}function Ve(...e){let t=e.reduce((e,t)=>e+t.length,0),n=new Uint8Array(t),r=0;for(let t of e)n.set(t,r),r+=t.length;return n}function J(e,t){return String(e??``).slice(0,t).padStart(t)}function Y(e,t){return String(e??``).slice(0,t).padEnd(t)}function He(e){let t=[],n=(...e)=>t.push(...e);n(Re()),n(q()),n(W(`center`),G(!0)),n(K(`STARTKORT - GLOPPEN`)),n(G(!1),W(`left`)),n(K(e.stevneNavn)),n(q()),n(ze(1,2)),n(K(e.namn??``)),n(ze(1,1));let r=`Nr:${e.startnummer}`;return n(K(`${r}  ${`Klubb:${e.klubb}`.slice(0,32-r.length-2)}`)),n(q()),n(G(!0)),n(K(`${Y(`Rnd`,3)} ${Y(`Bane`,4)} ${Y(`Mot#`,4)}  ${Y(`Motstandar`,17)}`)),n(G(!1)),e.roundInfos.forEach((e,t)=>{let r=J(t+1,3),i=J(e.court??``,4),a=J(e.opponentId??``,4),o=Y(e.opponentName??``,17);n(K(`${r} ${i} ${a}  ${o}`))}),n(q()),n(W(`center`)),n(K(``)),n(K(`Lykke til!`)),n(K(``)),n(K(``)),n(K(``)),n(W(`left`)),n(Be()),Ve(...t)}function Ue(e){let{tournamentId:t,tournamentName:n,isTeam:r,onStateChange:i}=e,o=document.createElement(`div`);o.className=`d-flex align-items-center gap-2 mb-2`;let s=null;function c(){s=null}async function l(){if(s)return s;let[e,n,i]=await Promise.all([ce(t),ge(t),r?y(t):Promise.resolve({data:[],error:null})]);if(e.error)return a(`Feil ved lasting av kampdata`,`error`),null;if(n.error)return a(`Feil ved lasting av resultatdata`,`error`),null;let o={};for(let e of n.data)e.kasterid!=null&&(o[e.kasterid]=e.startnummer??0);let c=[],l=new Map;for(let t of e.data){let e={spelarar:t.spelarar,er_walkover:t.er_walkover,bane_nummer:t.bane_nummer};c.push(e);let n=l.get(t.runde_nummer)??[];n.push(e),l.set(t.runde_nummer,n)}return s={allMatchesPrint:c,roundMap:l,startNumberMap:o,sortedRounds:[...l.keys()].sort((e,t)=>e-t),pairs:i.data},s}function u(){return De()?async e=>{let t=await l();if(!t)return;let r=t.pairs.find(t=>t.sideA.kasterid===e.id||t.sideB.kasterid===e.id),i;if(r){let t=(r.sideA.kasterid===e.id?r.sideB:r.sideA).kaster,n=t?`${t.fornavn??``} ${t.etternavn??``}`.trim():``;i=`${F(e)} / ${n}`}else i=F(e);let o=t.startNumberMap[e.id]??``,s=Se(e.id,t.sortedRounds,t.roundMap,t.startNumberMap),c=xe(e.id,t.allMatchesPrint),u=He({startnummer:o,namn:i,klubb:c,roundInfos:s,stevneNavn:n});try{await Pe(u)}catch(e){a(`Feil ved utskrift: `+f(e),`error`)}}:null}if(!V()){let e=document.createElement(`small`);return e.className=`text-muted`,e.textContent=`Kvitteringsprintar ikkje tilgjengeleg i denne nettlesaren (bruk Chrome/Edge).`,o.appendChild(e),{element:o,getPrintHandler:()=>null,invalidateMatchData:c}}let d=document.createElement(`span`),p=document.createElement(`span`);p.textContent=`Printer`;let m=document.createElement(`span`);m.className=`d-flex align-items-center gap-1 small`,m.appendChild(d),m.appendChild(p);let h=document.createElement(`button`);h.textContent=`Koble til kvitteringsprintar`,h.className=`btn btn-sm btn-outline-secondary`;let g=document.createElement(`button`);g.textContent=`Koble frå`,g.className=`btn btn-sm btn-outline-warning d-none`;function _(){let e=De();d.textContent=`●`,d.className=e?`text-success`:`text-muted`,h.classList.toggle(`d-none`,e),g.classList.toggle(`d-none`,!e)}return Oe(()=>{_(),i()}),h.addEventListener(`click`,async()=>{h.disabled=!0;try{await je(),_(),i()}catch(e){h.disabled=!1,e instanceof Error&&e.name!==`NotFoundError`&&a(`Feil ved tilkopling: `+f(e),`error`)}}),g.addEventListener(`click`,async()=>{g.disabled=!0,await Ne(),_(),i(),g.disabled=!1}),o.appendChild(m),o.appendChild(h),o.appendChild(g),_(),Ae().then(e=>{e&&(_(),i())}),{element:o,getPrintHandler:u,invalidateMatchData:c}}function We({title:e=`Fjern`,onClick:t}){let n=document.createElement(`button`);return n.type=`button`,n.innerHTML=`&times;`,n.className=`btn btn-sm rounded-circle p-0 lh-1 remove-btn`,n.title=e,n.addEventListener(`click`,e=>{e.stopPropagation(),t()}),n}function X(e){let{formatTitle:t,emptyText:n,onRowClick:r,isDraggable:i,onDragStart:a,onDragEnd:o,renderLeading:s,renderTrailing:c,clubFallback:l}=e,u=s!=null,d=c??[],f=+!!u+2+d.length,p=document.createElement(`div`);p.className=`d-flex flex-column flex-grow-1`;let m=document.createElement(`h6`);m.className=`fw-bold mb-1`;let h=document.createElement(`div`);h.className=`participant-table-wrapper border rounded overflow-auto`;let g=document.createElement(`table`);g.className=`table table-sm table-hover mb-0`;let _=document.createElement(`tbody`);g.appendChild(_),h.appendChild(g),p.appendChild(m),p.appendChild(h);function v(e){let t=document.createElement(`td`);return t.className=`text-center th-40`,e&&t.appendChild(e),t}function y(e){let t=document.createElement(`tr`);u&&t.appendChild(v(s(e)));let n=document.createElement(`td`);n.textContent=F(e),t.appendChild(n);let c=document.createElement(`td`);c.textContent=e.klubb?.navn??l??``,t.appendChild(c);for(let n of d)t.appendChild(v(n(e)));return r&&(t.classList.add(`participant-row`),t.addEventListener(`click`,()=>r(e))),i&&(t.draggable=!0,t.dataset.kasterid=String(e.id),t.addEventListener(`dragstart`,n=>{n.dataTransfer?.setData(`text/plain`,String(e.id)),a?.(e,t)}),t.addEventListener(`dragend`,()=>o?.(e,t))),t}function b(e){if(m.textContent=t(e.length),_.replaceChildren(),!e.length){let e=document.createElement(`tr`),t=document.createElement(`td`);t.className=`text-center text-muted fst-italic py-3`,t.textContent=n,t.colSpan=f,e.appendChild(t),_.appendChild(e);return}for(let t of e)_.appendChild(y(t))}return{element:p,setPlayers:b}}var Ge=0;function Ke(e){let{tournamentId:t,onCreated:n}=e,r=`np${++Ge}`,i=[],o=!1,s=!1,c=document.createElement(`button`);c.type=`button`,c.className=`btn btn-link btn-sm text-decoration-none align-self-start px-0 mt-2`,c.textContent=`+ Ny spelar`;let l=document.createElement(`div`);l.className=`card card-body p-3 mb-2 d-none`,l.innerHTML=`
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
    </form>`;let u=l.querySelector(`form`),d=l.querySelector(`.btn-close`),p=l.querySelector(`#${r}-fornavn`),m=l.querySelector(`#${r}-etternavn`),h=l.querySelector(`#${r}-klubb`),g=l.querySelector(`#${r}-kjonn`),v=u.querySelector(`button[type="submit"]`),y=u.querySelector(`button[type="button"]`);function b(){return p.value.trim()!==``&&m.value.trim()!==``&&L(g.value)!==null}function x(){v.disabled=s||!o||!b()}function S(e){s=e;for(let t of[p,m,h,g,y,d])t.disabled=e;x()}function C(){u.reset(),x()}function w(){l.classList.add(`d-none`),c.classList.remove(`d-none`),C()}async function T(){if(o)return;let[e,t]=await Promise.all([te(),re()]);if(e.error||t.error){a(`Kunne ikkje laste klubbar og kjønn.`,`error`),w();return}i=e.data,h.innerHTML=se(i,null,`— vel —`),g.innerHTML=se(t.data,null,`— vel —`),o=!0,x()}async function E(){l.classList.remove(`d-none`),c.classList.add(`d-none`),await T(),p.focus()}c.addEventListener(`click`,()=>void E()),d.addEventListener(`click`,w),y.addEventListener(`click`,w);for(let e of[p,m,g])e.addEventListener(`input`,x);return l.addEventListener(`keydown`,e=>{e.key===`Escape`&&!s&&(e.stopPropagation(),w(),c.focus())}),u.addEventListener(`submit`,async e=>{if(e.preventDefault(),s||!b())return;let r=p.value.trim(),o=m.value.trim(),l=L(g.value),u=L(h.value);if(l===null)return;S(!0);let{data:d,error:v}=await ie({fornavn:r,etternavn:o,kjonnid:l,klubbid:u,klasseid:null,epost:null,telefon:null,medlemsnummer:null,eraktiv:!0});if(v||!d){a(`Kunne ikkje opprette spelar: `+f(v),`error`),S(!1);return}let{error:y}=await _(t,d.id);y&&a(`Spelaren blei oppretta, men ikkje meldt på: `+f(y),`error`);let x=u===null?null:i.find(e=>e.id===u)??null;n({id:d.id,fornavn:r,etternavn:o,eraktiv:!0,avatarurl:null,kjonnid:l,klubb:x&&{id:x.id,navn:x.navn}},!y),S(!1),w(),c.focus()}),{element:l,toggle:c}}function qe(e){let{canEdit:t,tournamentId:n,onRegistered:r,refreshLists:i,onCreated:o}=e,s=document.createElement(`div`);s.className=`col-md-6 d-flex flex-column participant-column`;let c=de({placeholder:`Søk etter navn eller klubb…`,variant:`form`}),l=X({formatTitle:()=>`Tilgjengelege spelarar`,emptyText:`Ingen spelarar funne`,clubFallback:`Ingen klubb`,onRowClick:t?async e=>{let{error:t}=await _(n,e.id);if(t){a(`Feil ved innmelding: `+f(t),`error`);return}r(e.id),i()}:void 0});if(s.appendChild(c),t){let e=Ke({tournamentId:n,onCreated:o});s.appendChild(e.element),s.appendChild(l.element),s.appendChild(e.toggle)}else s.appendChild(l.element);return{element:s,searchInput:c,table:l}}function Je(e){let{isStarted:t,canEdit:r,tournamentId:i,registeredMap:o,pairedIds:s,printerBanner:c,onConfirmed:l,onRemoved:u,refreshRegisteredList:d,refreshBothLists:p}=e,m=document.createElement(`div`);if(m.className=`${t?`col-12`:`col-md-6`} d-flex flex-column participant-column`,!t){let e=document.createElement(`input`);e.type=`text`,e.className=`form-control mb-2 participant-search-spacer`,e.tabIndex=-1,e.disabled=!0,m.appendChild(e)}let h=c?e=>{let t=c.getPrintHandler();if(!t)return null;let n=document.createElement(`button`);return n.textContent=`🖨`,n.className=`btn btn-outline-secondary btn-sm p-0 lh-1 participant-print-btn`,n.title=`Skriv ut startkort`,n.addEventListener(`click`,n=>{n.stopPropagation(),t(e)}),n}:null,g=X({formatTitle:e=>`Påmelde spelarar: ${e}`,emptyText:`Ingen spelarar påmelde`,renderLeading:e=>{if(o.get(e.id)??!1){let e=document.createElement(`span`);return e.className=`text-success fw-bold`,e.textContent=`✓`,e}if(!r)return null;let t=document.createElement(`button`);return t.textContent=`✓`,t.className=`btn btn-outline-danger btn-sm rounded-circle p-0 lh-1 participant-confirm-btn`,t.title=`Bekreft spelar`,t.addEventListener(`click`,async t=>{t.stopPropagation();let{error:n}=await T(i,e.id);if(n){a(`Feil ved bekreftelse: `+f(n),`error`);return}l(e.id),d()}),t},renderTrailing:[e=>r?We({title:`Fjern spelar`,onClick:async()=>{if(s.has(e.id)){a(`Kan ikkje fjerne spelar som er i eit par. Slett paret fyrst.`,`error`);return}let{error:t}=await n(i,e.id);if(t){a(`Feil ved fjerning: `+f(t),`error`);return}u(e.id),p()}}):null,...h?[h]:[]]});return m.appendChild(g.element),{element:m,table:g}}var Ye=1,Xe=2;function Ze(e){let t=document.createElement(`div`);return t.appendChild(I()),{element:t,refresh:()=>{Z(t,e)}}}async function Z(e,n){let{tournamentId:r,isAdmin:i,isMix:o,getRegisteredIds:s,allThrowers:c}=n,l=s(),{data:u,error:d}=await y(r);if(d){t(`createPairTab`,d),e.replaceChildren(P(`Kunne ikkje laste par.`));return}let p=new Set(u.flatMap(e=>[e.sideA.kasterid,e.sideB.kasterid]));n.onPairsChanged?.(p);let m=c.filter(e=>l.has(e.id)&&!p.has(e.id)),h=null,g=null,_=null,b=document.createElement(`div`);b.className=`row g-3`;let x=document.createElement(`div`);x.className=`col-md-6 d-flex flex-column participant-column`;let S=de({placeholder:`Søk spelar…`,variant:`form`,onInput:()=>w()}),C=X({formatTitle:e=>`Spelarar utan par: ${e}`,emptyText:`Ingen fleire spelarar å tilordne`,isDraggable:i,onDragStart:(e,t)=>{_=e.id,t.classList.add(`opacity-50`)},onDragEnd:(e,t)=>{_=null,t.classList.remove(`opacity-50`)}});function w(){let e=S.value.toLowerCase(),t=m.filter(t=>t.id===h?.id||t.id===g?.id?!1:!e||F(t).toLowerCase().includes(e)||(t.klubb?.navn??``).toLowerCase().includes(e));C.setPlayers(t)}x.appendChild(S),x.appendChild(C.element);let T=document.createElement(`div`);T.className=`col-md-6 d-flex flex-column participant-column`;let E=document.createElement(`h6`);E.className=`fw-bold mb-1`;let D=document.createElement(`div`);D.className=`flex-grow-1`;function O(e){let t=document.createElement(`div`);t.className=`pair-slot border rounded px-2 py-2 text-center`;let n=o?e===`A`?`Side A (kvinne)`:`Side B (mann)`:`Side ${e}`;t.setAttribute(`aria-label`,n);function r(){let r=e===`A`?h:g;t.textContent=r?F(r):n,t.classList.toggle(`pair-slot--filled`,r!=null)}return r(),t.addEventListener(`dragover`,e=>{e.preventDefault(),t.classList.add(`pair-slot--hover`)}),t.addEventListener(`dragleave`,()=>t.classList.remove(`pair-slot--hover`)),t.addEventListener(`drop`,n=>{n.preventDefault(),t.classList.remove(`pair-slot--hover`);let i=_??Number(n.dataTransfer?.getData(`text/plain`));if(!i||e===`A`&&g?.id===i||e===`B`&&h?.id===i)return;let s=c.find(e=>e.id===i);if(s){if(o){if(e===`A`&&s.kjonnid!==Xe){a(`Mix: Side A må vere ei kvinne`,`error`);return}if(e===`B`&&s.kjonnid!==Ye){a(`Mix: Side B må vere ein mann`,`error`);return}}e===`A`?h=s:g=s,r(),w(),A()}}),t}let k=document.createElement(`button`);k.type=`button`,k.className=`btn btn-primary btn-sm w-100 d-none mt-2`,k.textContent=`Opprett par`;function A(){k.classList.toggle(`d-none`,h==null||g==null)}k.addEventListener(`click`,async()=>{if(!h||!g)return;k.disabled=!0;let{error:t}=await M(r,h.id,g.id);if(k.disabled=!1,t){a(`Feil ved oppretting av par: `+f(t),`error`);return}e.replaceChildren(I()),Z(e,n)});function j(t){if(E.textContent=`Antal par: ${t.length}`,D.innerHTML=``,!t.length){let e=document.createElement(`p`);e.className=`text-muted fst-italic py-2 mb-0`,e.textContent=`Ingen par oppretta enno`,D.appendChild(e);return}for(let o of t){let t=document.createElement(`div`);t.className=`pair-row pair-grid-row mb-1`;let s=document.createElement(`span`);s.className=`pair-cell border rounded px-2 py-1`,s.textContent=F(o.sideA.kaster);let c=document.createElement(`span`);if(c.className=`pair-cell border rounded px-2 py-1`,c.textContent=F(o.sideB.kaster),t.appendChild(s),t.appendChild(c),i){let i=We({title:`Slett par`,onClick:async()=>{i.disabled=!0;let{error:t}=await v(r,o.lag_id);if(t){a(`Feil ved sletting: `+f(t),`error`),i.disabled=!1;return}e.replaceChildren(I()),Z(e,n)}});t.appendChild(i)}D.appendChild(t)}}if(i){let e=document.createElement(`div`);e.className=`pair-grid-row mb-2`,e.appendChild(O(`A`)),e.appendChild(O(`B`)),T.appendChild(e),T.appendChild(k)}else{let e=document.createElement(`div`);e.className=`form-control mb-2 participant-search-spacer`,T.appendChild(e)}T.appendChild(E),T.appendChild(D),b.appendChild(x),b.appendChild(T),e.replaceChildren(b),w(),j(u)}function Qe(e){let t=new Map,n=new Set;for(let r of e)r.kasterid!=null&&(t.set(r.kasterid,r.er_bekreftet??!1),r.lag_id!=null&&n.add(r.kasterid));return{registeredMap:t,pairedIds:n}}function $e(e){return[...e].sort((e,t)=>{let n=(e.klubb?.navn??``).localeCompare(t.klubb?.navn??``,`nb`);if(n!==0)return n;let r=(e.etternavn??``).localeCompare(t.etternavn??``,`nb`);return r===0?(e.fornavn??``).localeCompare(t.fornavn??``,`nb`):r})}function et(e,t,n){let r=t.toLowerCase();return e.filter(e=>n.has(e.id)?!1:!r||F(e).toLowerCase().includes(r)||(e.klubb?.navn??``).toLowerCase().includes(r))}async function tt(e){let[t,n,r,i]=await Promise.all([E(e),ne(),N(e),h(e)]);return t.error||!t.data?{ok:!1,error:`Stevne ikkje funne.`}:n.error?{ok:!1,error:`Kunne ikkje laste kasterliste.`}:{ok:!0,data:{stevne:t.data,throwers:n.data,registration:r.data,isGloppen:!i.error&&i.navn.includes(`gloppen`)}}}async function nt(e,{id:n,isAdmin:r=!1}){e.replaceChildren(I()),Oe(null);try{let t=await tt(n);if(!t.ok){e.replaceChildren(P(t.error));return}let{stevne:i,throwers:a,registration:o,isGloppen:s}=t.data,c=i.stevne_fase??null,l=r&&(c===null||c===`ikke_startet`),u=c!==null&&c!==`ikke_startet`,d=i.kategori?.erlagbasert??!1,{registeredMap:f,pairedIds:p}=Qe(o),m=!0,h=document.createElement(`div`),g;r&&s&&u&&(g=Ue({tournamentId:n,tournamentName:i.navn,isTeam:d,onStateChange:()=>b()}),h.appendChild(g.element));let _=document.createElement(`div`);_.className=`row g-3`;let v=null;u||(v=qe({canEdit:l,tournamentId:n,onRegistered:e=>{f.set(e,!1),m=!0,g?.invalidateMatchData()},refreshLists:()=>{b(),x()},onCreated:(e,t)=>{a.push(e),t&&(f.set(e.id,!1),m=!0,g?.invalidateMatchData()),b(),x()}}),_.appendChild(v.element));let y=Je({isStarted:u,canEdit:l,tournamentId:n,registeredMap:f,pairedIds:p,printerBanner:g,onConfirmed:e=>f.set(e,!0),onRemoved:e=>{f.delete(e),m=!0,g?.invalidateMatchData()},refreshRegisteredList:()=>b(),refreshBothLists:()=>{b(),x()}});_.appendChild(y.element);function b(){y.table.setPlayers($e(a.filter(e=>f.has(e.id))))}function x(){v&&v.table.setPlayers($e(et(a,v.searchInput.value,f)))}if(d){let e=Ze({tournamentId:n,isAdmin:l,isMix:(i.kategori?.navn??``).toLowerCase().includes(`mix`),getRegisteredIds:()=>new Set(f.keys()),allThrowers:a,onPairsChanged:e=>{p.clear();for(let t of e)p.add(t)}});h.appendChild(fe({tabs:[{id:`players`,label:`Spelarar`,panel:_},{id:`pairs`,label:`Administrer par`,panel:e.element}],onChange:t=>{t===`pairs`&&m&&(m=!1,e.refresh())}}))}else h.appendChild(_);e.replaceChildren(h),v?.searchInput.addEventListener(`input`,x),b(),x();async function S(){let{data:e,error:t}=await N(n);if(t)return;let{registeredMap:r,pairedIds:i}=Qe(e);f.clear(),r.forEach((e,t)=>f.set(t,e)),p.clear(),i.forEach(e=>p.add(e)),m=!0,g?.invalidateMatchData(),b(),x()}let C=ee(n,()=>{S()});ue(()=>{le(C)}),A(()=>{S()})}catch(n){t(`stevne-deltakere.render`,n),e.replaceChildren(P(`Kunne ikkje laste deltakarliste.`))}}async function rt(e,{id:t,isAdmin:n=!1},r=null){e.replaceChildren(I());let{navn:i,error:a}=await h(t);if(a){e.replaceChildren(P(`Stevne ikkje funne.`));return}if(i.includes(`gloppen`)){let{render:i}=await o(async()=>{let{render:e}=await import(`./gloppen-BU0QB45m.js`);return{render:e}},__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]));await i(e,{id:t,isAdmin:n},r)}else if(i.includes(`nordhordland`)){let{render:i}=await o(async()=>{let{render:e}=await import(`./nordhordland-3iuuaDdd.js`);return{render:e}},__vite__mapDeps([21,1,2,3,8,6,9,22,13,14,5,15,16,23,7,10,11,12,17,18,19,20]));await i(e,{id:t,isAdmin:n},r)}else if(ye(i)){let{render:i}=await o(async()=>{let{render:e}=await import(`./xkast-D1DcCHOw.js`);return{render:e}},__vite__mapDeps([24,23,1,2,3,8,6,9,13,14,5,15,16,25,10,26,20,11,17,19]));await i(e,{id:t,isAdmin:n},r)}else e.replaceChildren(P(`Ukjend innleiande kastemetode: ${i||`(ikkje sett)`}`))}async function it(e,{id:t,isAdmin:n=!1},r=null){e.replaceChildren(I());let{navn:i,error:a}=await j(t);if(a){e.replaceChildren(P(`Stevne ikkje funne.`));return}if(i.includes(`cup`)){let{render:i}=await o(async()=>{let{render:e}=await import(`./cup-DpayPm-E.js`);return{render:e}},__vite__mapDeps([27,1,2,3,8,6,9,10,5,11,12,13,14,15,16,23,19,20,18]));await i(e,{id:t,isAdmin:n},r)}else if(i.includes(`kongelag`)){let{render:i}=await o(async()=>{let{render:e}=await import(`./kongelag-BF4qPs1i.js`);return{render:e}},__vite__mapDeps([28,8,2,3,1,6,9,20,23,13,14,5,15,16,25,10,26,11,17,19]));await i(e,{id:t,isAdmin:n},r)}else if(i.includes(`nordhordland`)){let{render:i}=await o(async()=>{let{render:e}=await import(`./nordhordland-C_ww3TED.js`);return{render:e}},__vite__mapDeps([29,8,2,3,1,6,9]));await i(e,{id:t,isAdmin:n},r)}else e.replaceChildren(P(`Ukjend avsluttande kastemetode: ${i||`(ikkje sett)`}`))}async function Q(e,{id:n}){A(()=>Q(e,{id:n})),e.replaceChildren(I());try{let[o,s]=await Promise.all([b(n),u()]);if(o.error||!o.data){e.replaceChildren(P(`Stevne ikkje funne.`));return}let c=o.data,l=s.data,d=l.filter(e=>e.er_innledende),p=l.filter(e=>e.er_avsluttende);function h(e,t){return e.map(e=>`<option value="${e.id}"${e.id===t?` selected`:``}>${m(e.navn)}</option>`).join(``)}e.innerHTML=`
      <div>
        <div class="mb-3">
          <a href="#/stevne/${n}/rediger" class="btn btn-outline-secondary btn-sm">Rediger stevne</a>
        </div>
        <h4 class="mb-3">Innstillingar</h4>
        <form id="innstillingar-form" class="org-max-480">
          <div class="mb-3">
            <label class="form-label fw-semibold">Kastemetode innleiande</label>
            <select id="innl-metode" class="form-select">
              <option value="">— Ikkje vald —</option>
              ${h(d,c.innledendekastemetodeid)}
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold">Kastemetode avsluttande</label>
            <select id="avsl-metode" class="form-select">
              <option value="">— Ikkje vald —</option>
              ${h(p,c.avsluttendekastemetodeid)}
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold">Antal rundar innleiande</label>
            <input id="antall-rundar" type="number" min="1" class="form-control"
              value="${c.antall_runder_innl??``}" placeholder="t.d. 6">
          </div>
          <div class="mb-4">
            <label class="form-label fw-semibold">Tilgjengelege banar (X-kast/Kongelag)</label>
            <input id="tilgjengelege-banar" type="number" min="1" class="form-control"
              value="${c.tilgjengelige_baner??``}" placeholder="Valfritt — utan verdi blir det éi pulje">
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
      </div>`;let g=e.querySelector(`#innl-metode`),_=e.querySelector(`#antall-rundar`);function v(){let e=d.find(e=>e.id===Number(g.value)),t=e!=null&&_e(e.navn);_.disabled=!t,t||(_.value=``),_.placeholder=t?`t.d. 6`:`Berre for Gloppen/NHM`}v(),g.addEventListener(`change`,v),e.querySelector(`#innstillingar-form`).addEventListener(`submit`,async i=>{i.preventDefault();let o=e.querySelector(`#innl-metode`).value||null,s=e.querySelector(`#avsl-metode`).value||null,c=e.querySelector(`#antall-rundar`).value,l=e.querySelector(`#tilgjengelege-banar`).value,{error:u}=await r(n,{innledendekastemetodeid:o?Number(o):null,avsluttendekastemetodeid:s?Number(s):null,antall_runder_innl:c?Number(c):null,tilgjengelige_baner:l?Number(l):null});if(u){t(`stevne-innstillingar.lagre`,u),a(`Feil ved lagring: `+f(u),`error`);return}let d=e.querySelector(`#lagre-status`);d.classList.remove(`d-none`),setTimeout(()=>{d.classList.add(`d-none`)},2e3)}),e.querySelector(`#nullstill-btn`).addEventListener(`click`,async t=>{let r=t.currentTarget;if(!await i({title:`Nullstill stevne`,message:`Dette slettar alle kampar og resultat og set stevnet tilbake til starttilstanden. Er du sikker?`,danger:!0}))return;r.disabled=!0;let{error:o}=await Ce(n);if(o){a(`Feil ved nullstilling: `+f(o),`error`),r.disabled=!1;return}await Q(e,{id:n})})}catch(n){t(`stevne-innstillingar.render`,n),e.replaceChildren(P(`Kunne ikkje laste innstillingar.`))}}var at=new Set([`NC`,`SNC`,`DNC`]),ot=new Set([`Gloppen`,`Nordhordlandsmetoden`]);function st(e){let t=new Set,n=[];for(let r of e){let e=r.klubb?.navn??`–`;t.has(e)||(t.add(e),n.push(e))}return n.map(m).join(` / `)}function ct(e){let t=new Map,n=0;for(let r of e){let e=r.startnummer==null?`_${n++}`:r.startnummer,i=t.get(e)??[];i.push(r),t.set(e,i)}return[...t.values()]}function lt(e,t){let n=new Map;for(let r of e){let e=r.gruppe?.navn??`–`,i=r.klasse?.navn??null,a=t?`${i??``}|${e}`:e,o=t?`${i?i+` `:``}${e}`:e;n.has(a)||n.set(a,{label:o,rows:[]}),n.get(a).rows.push(r)}return[...n.values()].sort((e,t)=>e.label.localeCompare(t.label,`nb`))}function ut(e,t){let n=[];return t.showKpSp&&n.push(`KP ${e.kamp_poeng_innl??`–`}`,`SP ${e.score_poeng_innl??`–`}`),t.showNc&&n.push(`NC ${e.nc_poeng??`–`}`),n.length?`<span class="res-meta">${n.join(`  `)}</span>`:``}function dt(e,t){let n=ft(e,t,(e,n)=>{let r=e.map(e=>m(F(e.kaster)||`–`)).join(` og `);return`
        <div class="res-row">
          <span class="res-pl">${n.plassering??`–`}.</span>
          <div class="res-info">
            <span class="res-navn">${r}</span>
            <span class="res-klubb">${st(e)}</span>
            ${ut(n,t)}
          </div>
        </div>`},e=>`
      <div class="res-row">
        <span class="res-pl">${e.plassering??`–`}.</span>
        <div class="res-info">
          <span class="res-navn">${m(F(e.kaster)||`–`)}</span>
          <span class="res-klubb">${m(e.klubb?.navn??`–`)}</span>
          ${ut(e,t)}
        </div>
      </div>`).join(``);return`
    <div class="res-group">
      <h2 class="res-group-title">${m(e.label)}</h2>
      <div class="res-group-rows">${n}</div>
    </div>`}function ft(e,t,n,r){return t.isParMix?ct(e.rows).map(e=>n(e,e[0])):e.rows.map(r)}function pt(e,t,n,r,i){return`
    <tr>
      <td class="res-td-pl">${e??`–`}</td>
      <td class="res-td-navn">${t}</td>
      <td class="res-td-klubb">${n}</td>
      ${i.showKpSp?`<td class="res-td-kp">${r.kamp_poeng_innl??``}</td><td class="res-td-sp">${r.score_poeng_innl??``}</td>`:``}
      ${i.showNc?`<td class="res-td-nc">${r.nc_poeng??``}</td>`:``}
    </tr>`}function mt(e,t){let n=e=>{let t=e.kaster;return t?`<a href="#/kastere/${ae(t)}" class="res-kaster-lenke">${m(F(t))}</a>`:`–`},r=ft(e,t,(e,r)=>pt(r.plassering,e.map(n).join(` og `),st(e),r,t),e=>pt(e.plassering,n(e),m(e.klubb?.navn??`–`),e,t)).join(``);return`
    <div class="res-table-section">
      <table class="res-table">
        <thead>
          <tr class="res-thead-group">
            <td colspan="${3+(t.showKpSp?2:0)+ +!!t.showNc}" class="res-td-group-header">${m(e.label)}</td>
          </tr>
          <tr class="res-thead-columns">
            <th class="res-td-pl">Pl</th>
            <th class="res-td-navn">NAVN</th>
            <th class="res-td-klubb">KLUBB</th>
            ${t.showKpSp?`<th class="res-td-kp">KP</th><th class="res-td-sp">SP</th>`:``}
            ${t.showNc?`<th class="res-td-nc">NC</th>`:``}
          </tr>
        </thead>
        <tbody>${r}</tbody>
      </table>
    </div>`}async function ht(e,{id:n}){e.replaceChildren(I(`Laster resultat…`));try{let[t,r]=await Promise.all([he(n),me(n)]);if(t.error||!t.data){e.replaceChildren(P(`Kunne ikkje laste stevnet.`));return}if(r.error){e.replaceChildren(P(`Kunne ikkje laste resultat.`));return}let i=t.data,a=r.data;if(!a.length){e.replaceChildren(oe(i.erfullfort?`Ingen resultat registrert.`:`Turneringa er ikkje avslutta enno.`));return}let o=lt(a,(i.dato?new Date(i.dato+`T12:00:00`).getFullYear():9999)<2026),s=a.length,c={isParMix:i.kategori?.erlagbasert??!1,showNc:at.has(i.stevnetype?.navn??``),showKpSp:ot.has(i.innledende?.navn??``)};e.innerHTML=`
      <div class="res-side">
        <div class="res-felles">
          ${i.resultaturl?.startsWith(`http`)?`<a class="res-pdf-lenke" href="${m(i.resultaturl)}" target="_blank" rel="noopener">Resultat som pdf 📄</a>`:``}
          ${i.juryleder?`<p class="res-klassifisering">Juryleder: ${m(i.juryleder)}</p>`:``}
          <p class="res-antall"><strong>Antall deltakarar: ${s}</strong></p>
        </div>
        <div class="res-mobil-blokk">
          ${o.map(e=>dt(e,c)).join(``)}
        </div>
        <div class="res-desktop-blokk">
          ${o.map(e=>mt(e,c)).join(``)}
        </div>
      </div>`}catch(n){t(`stevne-resultat.render`,n),e.replaceChildren(P(`Kunne ikkje laste resultat.`))}}e.from(`kamp`).select(`
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
`);async function gt(n){let{data:r,error:i}=await e.from(`kamp`).select(`
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
    `).eq(`stevneid`,n).eq(`er_bekreftet`,!0).eq(`er_walkover`,!1);return i&&t(`getMatchesForStats`,i),{data:r??[],error:i}}async function _t(n){let{data:r,error:i}=await e.from(`resultat`).select(`kasterid, posisjon`).eq(`stevneid`,n);i&&t(`getPositionForTournament`,i);let a=new Map;for(let e of r??[])e.kasterid!=null&&e.posisjon!=null&&a.set(e.kasterid,e.posisjon);return a}function vt(e,t,n){let r=n.get(e.kasterid)??null;return t.filter(t=>t.kasterid!==e.kasterid&&(n.get(t.kasterid)??null)===r).reduce((e,t)=>e+t.score_poeng,0)}function yt(e,t){let n=new Map;for(let r of e){if(r.er_walkover)continue;let e=r.spelarar;for(let r of e){let i=vt(r,e,t);n.has(r.kasterid)||n.set(r.kasterid,{kasterid:r.kasterid,navn:F(r.kaster),matchCount:0,shoesThrown:0,ringers:0,ringerPct:0,doubleRingers:0,score4:0,score3:0,score2:0,score1:0,score0:0,scoreDiff:0});let a=n.get(r.kasterid);r.omgangar.length>0&&a.matchCount++,a.scoreDiff+=r.score_poeng-i;for(let e of r.omgangar)a.shoesThrown+=2,e.antall_ringer!=null&&(a.ringers+=e.antall_ringer),e.antall_ringer===2&&a.doubleRingers++,e.score===4?a.score4++:e.score===3?a.score3++:e.score===2?a.score2++:e.score===1?a.score1++:e.score===0&&a.score0++}}let r=[...n.values()].filter(e=>e.shoesThrown>0);for(let e of r)e.ringerPct=e.shoesThrown>0?e.ringers/e.shoesThrown*100:0;return r.sort((e,t)=>t.ringerPct-e.ringerPct)}function bt(e){return e>0?`+${e}`:String(e)}function xt(e){return`
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
      <td class="stats-td-name">${m(e.navn)}</td>
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
      <td class="stats-td-diff ${e.scoreDiff>=0?`stats-td-pos`:`stats-td-neg`}">${bt(e.scoreDiff)}</td>
    </tr>`).join(``)}</tbody>
      </table>
    </div>`}function St(e){let t=!1,n=0,r=0;e.addEventListener(`mousedown`,i=>{t=!0,e.classList.add(`is-grabbing`),n=i.pageX-e.offsetLeft,r=e.scrollLeft}),e.addEventListener(`mouseleave`,()=>{t=!1,e.classList.remove(`is-grabbing`)}),e.addEventListener(`mouseup`,()=>{t=!1,e.classList.remove(`is-grabbing`)}),e.addEventListener(`mousemove`,i=>{t&&(i.preventDefault(),e.scrollLeft=r-(i.pageX-e.offsetLeft-n))})}function Ct(e,t){let n=[...e.querySelectorAll(`tr`)],r=n[0];if(!r)return;let i=[...r.cells].slice(0,t).map(e=>e.offsetWidth);for(let e of n){let n=0;for(let r=0;r<t&&r<e.cells.length;r++){let a=e.cells[r];a&&(a.classList.add(`stats-col-sticky`),r===t-1&&a.classList.add(`stats-col-sticky-last`),a.style.setProperty(`--col-left`,`${n}px`),n+=i[r]??0)}}}async function wt(e,{id:n}){e.replaceChildren(I(`Laster statistikk…`));try{let[{data:t,error:r},i]=await Promise.all([gt(n),_t(n)]);if(r){e.replaceChildren(P(`Kunne ikkje laste statistikk.`));return}let a=yt(t,i);if(!a.length){e.replaceChildren(oe(`Ingen statistikk registrert.`));return}e.innerHTML=`<div class="stats-side">${xt(a)}</div>`;let o=e.querySelector(`.stats-table-wrap`),s=e.querySelector(`.stats-table`);o&&St(o),s&&Ct(s,1)}catch(n){t(`stevne-stats.render`,n),e.replaceChildren(P(`Kunne ikkje laste statistikk.`))}}var $=[{key:`info`,label:`Info`,adminOnly:!1,completedOnly:!1},{key:`deltakere`,label:`Deltakere`,adminOnly:!0,completedOnly:!1},{key:`innledende`,label:`Innl.`,adminOnly:!1,completedOnly:!1},{key:`avsluttende`,label:`Avsl.`,adminOnly:!1,completedOnly:!1},{key:`resultat`,label:`Sluttresultat`,adminOnly:!1,completedOnly:!0},{key:`innstillinger`,label:`Innstillingar`,adminOnly:!0,completedOnly:!1},{key:`stats`,label:`Stats`,adminOnly:!1,completedOnly:!1}],Tt=new Set($.filter(e=>e.adminOnly).map(e=>e.key)),Et=new Set($.filter(e=>e.completedOnly).map(e=>e.key)),Dt={info:R,deltakere:nt,innledende:rt,avsluttende:it,innstillinger:Q,resultat:ht,stats:wt};function Ot(e,t,n,r,i){return`<ul class="nav nav-underline tournament-nav mb-0 px-3">${$.filter(e=>n||!e.adminOnly).filter(e=>e.key!==`avsluttende`||r).filter(e=>!e.completedOnly||i).map(({key:n,label:r})=>`
      <li class="nav-item">
        <a class="nav-link${t===n?` active`:``}"
           href="#/stevne/${e}/${n}">${r}</a>
      </li>`).join(``)}</ul>`}async function kt(e,n){let r=Number(n.id),i=String(n.tab??`info`);e.replaceChildren(I());try{let{data:t,error:n}=await E(r);if(n||!t){e.replaceChildren(P(`Stevne ikkje funne.`));return}O(t.navn);let a=await C()||await s(),o=t.avsluttendekastemetodeid!=null,c=t.erfullfort===!0,l=!a&&Tt.has(i)||!c&&Et.has(i)?`info`:i;e.innerHTML=`
      <div class="org-shell pb-3 pt-1">
        ${Ot(r,l,a,o,c)}
        <div class="org-fase-header d-flex align-items-center gap-2 mb-3">
          <h5 class="mb-0">${m(t.navn)}</h5>
          <div id="org-banner-buttons"></div>
        </div>
        <div id="org-subpage" class="px-3"></div>
      </div>`;let u=e.querySelector(`#org-banner-buttons`),d=e.querySelector(`#org-subpage`);await(Dt[l]??R)(d,{id:r,isAdmin:a},u)}catch(n){t(`stevne.render`,n),e.replaceChildren(P(`Kunne ikkje laste stevnet.`))}}export{kt as render};