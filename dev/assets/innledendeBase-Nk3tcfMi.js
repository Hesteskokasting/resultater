import{G as e,V as t,W as n,nt as r,t as i,w as a}from"./index-IHBsWX3l.js";import{t as o}from"./LoadingState-RVZNML7E.js";import{t as s}from"./ConfirmDialog-DNGrXiEY.js";import{n as c,r as l,t as u}from"./kamp-BVHPp875.js";import{C as d,S as f,l as p,o as m,r as h,y as g}from"./kampService-BJceDH4N.js";import{t as _}from"./realtime-1KFDfsu_.js";import{S as v,b as y,d as b,f as x,g as S,h as C,i as w,l as T,m as E,s as D,u as O,v as k,x as A,y as j}from"./resultatService-BCsLhSF6.js";import{t as M}from"./testDataService-EsCbo3P-.js";import{t as N}from"./ScoreNumberpad-DEYDshL3.js";var P=null,F=null,I=null,L=null;function R(){return P||(P=document.createElement(`div`),P.className=`modal`,P.style.display=`none`,P.setAttribute(`role`,`dialog`),P.setAttribute(`aria-modal`,`true`),P.setAttribute(`aria-labelledby`,`pd-title`),P.innerHTML=`
    <div class="modal-dialog modal-dialog-centered modal-sm">
      <div class="modal-content">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title" id="pd-title"></h5>
        </div>
        <div class="modal-body pt-2">
          <label class="form-label" id="pd-message" for="pd-input"></label>
          <input type="text" class="form-control" id="pd-input" autocomplete="off" />
        </div>
        <div class="modal-footer border-0 pt-0">
          <button type="button" class="btn btn-secondary" id="pd-cancel">Avbryt</button>
          <button type="button" class="btn btn-primary" id="pd-confirm">OK</button>
        </div>
      </div>
    </div>
  `,document.body.appendChild(P),P.querySelector(`#pd-cancel`).addEventListener(`click`,()=>{H(null)}),P.querySelector(`#pd-confirm`).addEventListener(`click`,()=>{V()}),P.querySelector(`#pd-input`).addEventListener(`keydown`,e=>{e.key===`Enter`&&(e.preventDefault(),V())}),P)}function z(e){F=document.createElement(`div`),F.className=`modal-backdrop show`,document.body.appendChild(F),document.body.classList.add(`modal-open`),e.style.display=`block`,e.classList.add(`show`),e.querySelector(`#pd-input`)?.focus(),L=e=>{e.key===`Escape`&&(e.preventDefault(),H(null))},document.addEventListener(`keydown`,L)}function B(e){e.classList.remove(`show`),e.style.display=`none`,F?.remove(),F=null,document.body.classList.remove(`modal-open`),L&&=(document.removeEventListener(`keydown`,L),null)}function V(){H(P?.querySelector(`#pd-input`)?.value??``)}function H(e){if(!P||!I)return;let t=I;I=null,B(P),t(e)}function U(e){let{title:t,message:n,defaultValue:r=``,inputType:i=`text`}=e,a=R();a.querySelector(`#pd-title`).textContent=t,a.querySelector(`#pd-message`).textContent=n;let o=a.querySelector(`#pd-input`);return o.type=i,o.value=r,new Promise(e=>{I=e,z(a)})}function W(O){let P=null,F=null,I=!1,L=new Set;async function R(e,{id:t,isAdmin:n=!1},r=null){F=r,I=n,O.onReset?.(),P&&=(await _(P),null),e.replaceChildren(o(`Laster…`)),await z(e,t)}async function z(o,d){try{let[{data:h},{data:_},{data:S}]=await Promise.all([a(d),p(d),w(d)]);if(!h){o.replaceChildren(e(`Stevne ikkje funne.`));return}let P=Object.fromEntries(S.filter(e=>e.kasterid!=null).map(e=>[e.kasterid,e.startnummer??0])),R=Object.fromEntries(S.filter(e=>e.kasterid!=null&&(e.hcp??0)>0).map(e=>[e.kasterid,e.hcp??0])),H=new Map;for(let e of _)H.has(e.runde_nummer)||H.set(e.runde_nummer,[]),H.get(e.runde_nummer).push(e);let{spelMap:W,ekteKasterids:G}=E(_,P),J=v(Object.values(W).filter(e=>G.has(e.kasterid)).map(e=>({...e,hcp:S.find(t=>t.kasterid===e.kasterid)?.hcp??0})),_),Y=_.length>0&&_.every(e=>e.er_bekreftet),X=I&&h.stevne_fase!==`avsluttende`,Z={container:o,stevneid:d,stevne:h,alleKamper:_,rundeMap:H,startnrMap:P,stilling:J,isAdmin:I,erAlleKamperBekreftet:Y,reload:()=>z(o,d)};F&&(F.innerHTML=(I?j(h,O.erSwiss):``)+O.getBannerExtra(Z),O.bindBannerExtra(F,Z),F.querySelector(`#fullfør-turnering-btn`)?.addEventListener(`click`,async()=>{if(!await s({title:`Fullfør turnering`,message:`Vil du fullføre turneringa? Dette kan ikkje angrast.`,danger:!0}))return;let{error:e}=await T(d,J);if(e){i(`Feil ved lagring av plasseringar`,`error`);return}let{error:n}=await t(d);if(n){i(`Feil ved lagring`,`error`);return}await z(o,d)}),F.querySelector(`#test-autofullfør-btn`)?.addEventListener(`click`,async e=>{let t=e.currentTarget;await s({title:`Autofullfør kampar`,message:`Autofullfør alle ubekreftede innledande kampar?`})&&(t.disabled=!0,await M(d),await z(o,d))}));let Q=[...(O.filterRundar??(e=>e))(H).entries()].map(([e,t])=>q(e,t,P,X,R)).join(``)+K(),$=I||J.some(e=>(e.hcp??0)>0),ee=y(J,_,P,{tableId:`stilling-innl`,isAdmin:I,stevneid:d,harHcp:$,harAntallKamper:!0}),te=C(o);o.innerHTML=k(Q,ee),x(o),te===`stilling`&&A(o,`stilling`),b(o,`stilling-innl`,L),I&&o.querySelectorAll(`.stilling-hcp-celle`).forEach(e=>{e.addEventListener(`click`,async e=>{e.stopPropagation();let t=e.currentTarget,n=Number(t.dataset.kasterid),r=Number(t.dataset.stevneid),a=S.find(e=>e.kasterid===n)?.hcp??0,s=await U({title:`Sett HCP`,message:`Sett HCP for spelar:`,defaultValue:String(a),inputType:`number`});if(s===null)return;let c=parseInt(s,10);if(isNaN(c)||c<0){i(`Ugyldig HCP-verdi`,`error`);return}let{error:l}=await D(r,n,c);if(l){i(`Feil ved lagring av HCP`,`error`);return}await z(o,d)})});for(let e of _){let t=async()=>{let[t,a]=c(e.spelarar,P),u=[t?.id,a?.id].filter(e=>e!=null),p=u.length?await m(u):!1;p&&!await s({title:`Slett detaljar`,message:`Dette sletter detaljar for denne kampen. Er du sikker?`})||N(t?.kaster?`${n(t.kaster.fornavn)} ${n(t.kaster.etternavn)}`:`—`,a?.kaster?`${n(a.kaster.fornavn)} ${n(a.kaster.etternavn)}`:`—`,l(t),l(a),async(e,n)=>{try{p&&u.length&&await f(u),await Promise.all([t?g(t.id,e):Promise.resolve({error:null}),a?g(a.id,n):Promise.resolve({error:null})])}catch(e){r(`${O.logPrefix}:plusCallback`,e),i(`Feil ved lagring av score`,`error`);return}await z(o,d)})};if(o.querySelector(`#plus-${e.id}`)?.addEventListener(`click`,t),o.querySelector(`#scoreboard-${e.id}`)?.addEventListener(`click`,()=>{window.open(`#/kamp/${e.id}`,`_blank`)}),o.querySelector(`#bekrft-${e.id}`)?.addEventListener(`click`,async t=>{let n=t.currentTarget;n.disabled=!0,n.textContent=`Lagrer…`;try{await V(o,d,e,P,R)||(n.disabled=!1,n.textContent=`Bekreft`)}catch{n.disabled=!1,n.textContent=`Bekreft`}}),X&&e.er_bekreftet){let[t,a]=c(e.spelarar,P),s=t?.kaster?`${n(t.kaster.fornavn)} ${n(t.kaster.etternavn)}`:`—`,l=a?.kaster?`${n(a.kaster.fornavn)} ${n(a.kaster.etternavn)}`:`—`,f=()=>{N(s,l,t?.score_poeng??0,a?.score_poeng??0,async(e,n)=>{let[s,c]=u(e,n);try{await Promise.all([t?g(t.id,e,s):Promise.resolve({error:null}),a?g(a.id,n,c):Promise.resolve({error:null})])}catch(e){r(`${O.logPrefix}:adminReScore`,e),i(`Feil ved lagring av score`,`error`);return}await z(o,d)})};o.querySelectorAll(`[data-endre-score="${e.id}"]`).forEach(e=>e.addEventListener(`click`,f))}let a=o.querySelector(`.kamp-rad-mobil[data-kamp-id="${e.id}"]`);a&&(I?(a.querySelector(`.kamp-rad-mobil__hoved`)?.addEventListener(`click`,()=>{let e=a.dataset.expanded===`true`;o.querySelectorAll(`.kamp-rad-mobil[data-expanded="true"]`).forEach(e=>{e.dataset.expanded=`false`,e.setAttribute(`aria-expanded`,`false`)}),a.dataset.expanded=e?`false`:`true`,a.setAttribute(`aria-expanded`,String(!e))}),o.querySelector(`#m-plus-${e.id}`)?.addEventListener(`click`,e=>{e.stopPropagation(),t()}),o.querySelector(`#m-scoreboard-${e.id}`)?.addEventListener(`click`,t=>{t.stopPropagation(),window.open(`#/kamp/${e.id}`,`_blank`)}),o.querySelector(`#m-bekrft-${e.id}`)?.addEventListener(`click`,async t=>{t.stopPropagation();let n=t.currentTarget;n.disabled=!0,n.textContent=`Lagrer…`,await V(o,d,e,P,R)||(n.disabled=!1,n.textContent=`Bekreft`)})):a.addEventListener(`click`,()=>{window.open(`#/kamp/${e.id}`,`_blank`)}))}B(o,d)}catch(t){r(`${O.logPrefix}.lastOgVis`,t),o.replaceChildren(e(`Kunne ikkje laste innledande fase.`))}}function B(e,t){if(P)return;let n=S(t,[`innledende`],e,z,()=>{P&&=(_(P),null)});P=d(t,O.channelName(t),n)}async function V(e,t,n,r,a={}){let[o,s]=c(n.spelarar,r),l=a[o?.kasterid??-1]??0,u=a[s?.kasterid??-1]??0,{error:d}=await h({kampId:n.id,p1:o?{spelarId:o.id,kasterid:o.kasterid,scorePoeng:o.score_poeng}:null,p2:s?{spelarId:s.id,kasterid:s.kasterid,scorePoeng:s.score_poeng}:null,hcp1:l,hcp2:u,erWalkover:n.er_walkover});return d?(i(`DB-feil ved bekreft`,`error`),!1):(await z(e,t),!0)}return R}function G(e,t,n){return e.er_bekreftet?`ferdig`:n||t?`pagaar`:`ikke-startet`}function K(){return`
    <div class="kamp-legend">
      <div class="kamp-legend__item"><div class="kamp-legend__stripe kamp-legend__stripe--ikke"></div> Ikke startet</div>
      <div class="kamp-legend__item"><div class="kamp-legend__stripe kamp-legend__stripe--pagaar"></div> Pågår</div>
      <div class="kamp-legend__item"><div class="kamp-legend__stripe kamp-legend__stripe--ferdig"></div> Ferdig</div>
    </div>`}function q(e,t,n,r,i={}){let a=t.map(e=>J(e,n,r,i)).join(``),o=t.map(e=>Y(e,n,r,i)).join(``);return`
    <div class="mb-3">
      <h6 class="text-center fw-bold mb-1">Runde ${e}</h6>
      <table class="table table-sm kamp-tabell mb-0 kamp-tabell--desktop">
        <thead class="org-thead">
          <tr>
            <th class="th-36 text-center">B</th>
            <th>P1</th>
            <th class="th-48 text-center">S1</th>
            <th class="th-48 text-center">S2</th>
            <th>P2</th>
            ${r?`<th class="th-148"></th>`:`<th class="th-80"></th>`}
          </tr>
        </thead>
        <tbody>${a}</tbody>
      </table>
      <ul class="kamp-liste-mobil list-unstyled mb-0">${o}</ul>
    </div>`}function J(e,t,r=!0,i={}){let[a,o]=c(e.spelarar,t),s=a?.kasterid?t[a.kasterid]??``:``,u=o?.kasterid?t[o.kasterid]??``:``,d=a?.kaster?`${n(a.kaster.fornavn)} ${n(a.kaster.etternavn)}`:`—`,f=e.er_walkover&&!o?.kaster,p=f?`Walkover`:o?.kaster?`${n(o.kaster.fornavn)} ${n(o.kaster.etternavn)}`:`—`,m=s?`${d} (${s})`:d,h=f?u?`Walkover (${u})`:`Walkover`:u?`${p} (${u})`:p,g=(a?.omgangar?.length??0)>0,_=(o?.omgangar?.length??0)>0,v=g||_,y=i[a?.kasterid??-1]??0,b=i[o?.kasterid??-1]??0,x=e.er_bekreftet?a?.score_poeng??0:l(a)+(g?y:0),S=e.er_bekreftet?o?.score_poeng??0:l(o)+(_?b:0),C=e.er_walkover&&!e.er_bekreftet,w=C?21:x,T=C?0:S,E=e.er_bekreftet||e.er_walkover||v||x>0||S>0,D=G(e,E,v),k=O(e,[a,o].filter(e=>e!=null),v,i),A=r&&e.er_bekreftet&&!e.er_walkover&&!v?` data-endre-score="${e.id}" class="text-center score-redigerbar"`:` class="text-center"`,j;if(e.er_bekreftet)j=`<td class="text-end pe-2"><span class="kamp-bekreftet-indikator">✓ Bekreftet</span></td>`;else if(r){let t=D===`ikke-startet`,n=v,r=k,i=`kamp-knapp${t?` kamp-knapp-primaer`:``}`,a=`kamp-knapp${n?` kamp-knapp-primaer`:``}`,o=`kamp-knapp${r?` kamp-knapp-suksess`:``}`;j=`<td class="text-end pe-2 text-nowrap">
        <button class="${i}" id="plus-${e.id}">+</button>
        <button class="${a}" id="scoreboard-${e.id}" title="Scoreboard">Score</button>
        <button class="${o}" id="bekrft-${e.id}"${k?``:` disabled`}>Bekreft</button>
      </td>`}else j=`<td class="text-end pe-2">
        <button class="kamp-knapp" id="scoreboard-${e.id}" title="Scoreboard">Score</button>
      </td>`;return`
    <tr class="kamp-rad-desktop" data-status="${D}">
      <td class="text-center">${e.bane_nummer??``}</td>
      <td>${m}</td>
      <td${A}>${E?w:`—`}</td>
      <td${A}>${E?T:`—`}</td>
      <td>${h}</td>
      ${j}
    </tr>`}function Y(e,t,r,i={}){let[a,o]=c(e.spelarar,t),s=a?.kaster?`${n(a.kaster.fornavn)} ${n(a.kaster.etternavn.charAt(0))}.`:`—`,u=e.er_walkover&&!o?.kaster?`Walkover`:o?.kaster?`${n(o.kaster.fornavn)} ${n(o.kaster.etternavn.charAt(0))}.`:`—`,d=(a?.omgangar?.length??0)>0,f=(o?.omgangar?.length??0)>0,p=d||f,m=i[a?.kasterid??-1]??0,h=i[o?.kasterid??-1]??0,g=e.er_bekreftet?a?.score_poeng??0:l(a)+(d?m:0),_=e.er_bekreftet?o?.score_poeng??0:l(o)+(f?h:0),v=e.er_walkover&&!e.er_bekreftet,y=v?21:g,b=v?0:_,x=e.er_bekreftet||e.er_walkover||p||g>0||_>0,S=G(e,x,p),C=x?`${y}–${b}`:`—`,w=``;if(r){let t=O(e,[a,o].filter(e=>e!=null),p,i),n=e.er_bekreftet?`<span class="kamp-bekreftet-mobil">✓ Bekreftet</span>`:`<button class="kamp-knapp-mobil kamp-knapp-bekreft-mobil" id="m-bekrft-${e.id}"${t?``:` disabled`}>Bekreft</button>`;w=`
      <div class="kamp-mobil-knapper">
        <button class="kamp-knapp-mobil" id="m-plus-${e.id}"${e.er_bekreftet?` disabled`:``}>+ Resultat</button>
        <button class="kamp-knapp-mobil" id="m-scoreboard-${e.id}">Score</button>
        ${n}
      </div>`}return`
    <li class="kamp-rad-mobil${r?``:` kamp-rad-mobil--viewer`}" data-kamp-id="${e.id}" data-status="${S}" role="button" tabindex="0">
      <div class="kamp-rad-mobil__hoved">
        <span class="kamp-mobil-bane">${e.bane_nummer??``}</span>
        <span class="kamp-mobil-namn">${s} vs ${u}</span>
        <span class="kamp-mobil-resultat">${C}</span>
      </div>
      ${w}
    </li>`}export{W as t};