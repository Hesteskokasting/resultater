import{C as e,D as t,F as n,G as r,I as i,K as a,L as o,N as s,P as c,S as l,T as u,U as d,W as f,_ as p,a as m,b as h,d as g,f as _,g as v,i as y,j as b,k as x,l as S,m as C,p as w,q as T,s as E,u as D,v as O,x as k,y as A,z as j}from"./index-6RpqGatu.js";import{t as M}from"./ScoreNumberpad-C-b3sWkY.js";var N=null,P=null,F=null,I=null;function L(){return N||(N=document.createElement(`div`),N.className=`modal`,N.style.display=`none`,N.setAttribute(`role`,`dialog`),N.setAttribute(`aria-modal`,`true`),N.setAttribute(`aria-labelledby`,`pd-title`),N.innerHTML=`
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
  `,document.body.appendChild(N),N.querySelector(`#pd-cancel`).addEventListener(`click`,()=>{V(null)}),N.querySelector(`#pd-confirm`).addEventListener(`click`,()=>{B()}),N.querySelector(`#pd-input`).addEventListener(`keydown`,e=>{e.key===`Enter`&&(e.preventDefault(),B())}),N)}function R(e){P=document.createElement(`div`),P.className=`modal-backdrop show`,document.body.appendChild(P),document.body.classList.add(`modal-open`),e.style.display=`block`,e.classList.add(`show`),e.querySelector(`#pd-input`)?.focus(),I=e=>{e.key===`Escape`&&(e.preventDefault(),V(null))},document.addEventListener(`keydown`,I)}function z(e){e.classList.remove(`show`),e.style.display=`none`,P?.remove(),P=null,document.body.classList.remove(`modal-open`),I&&=(document.removeEventListener(`keydown`,I),null)}function B(){V(N?.querySelector(`#pd-input`)?.value??``)}function V(e){if(!N||!F)return;let t=F;F=null,z(N),t(e)}function H(e){let{title:t,message:n,defaultValue:r=``,inputType:i=`text`}=e,a=L();a.querySelector(`#pd-title`).textContent=t,a.querySelector(`#pd-message`).textContent=n;let o=a.querySelector(`#pd-input`);return o.type=i,o.value=r,new Promise(e=>{F=e,R(a)})}function U(S){let N=null,P=null,F=!1,I=new Set;async function L(e,{id:t,isAdmin:n=!1},i=null){P=i,F=n,S.onReset?.(),N&&=(await l(N),null),e.replaceChildren(r(`Laster…`)),await R(e,t)}async function R(r,c){try{let[{data:l},{data:u},{data:C}]=await Promise.all([j(c),x(c),y(c)]);if(!l){r.replaceChildren(a(`Stevne ikkje funne.`));return}let N=Object.fromEntries(C.filter(e=>e.kasterid!=null).map(e=>[e.kasterid,e.startnummer??0])),L=Object.fromEntries(C.filter(e=>e.kasterid!=null&&(e.hcp??0)>0).map(e=>[e.kasterid,e.hcp??0])),V=new Map;for(let e of u)V.has(e.runde_nummer)||V.set(e.runde_nummer,[]),V.get(e.runde_nummer).push(e);let{spelMap:U,ekteKasterids:W}=_(u,N),q=h(Object.values(U).filter(e=>W.has(e.kasterid)).map(e=>({...e,hcp:C.find(t=>t.kasterid===e.kasterid)?.hcp??0})),u),J=u.length>0&&u.every(e=>e.er_bekreftet),Y=F&&l.stevne_fase!==`avsluttende`,X={container:r,stevneid:c,stevne:l,alleKamper:u,rundeMap:V,startnrMap:N,stilling:q,isAdmin:F,erAlleKamperBekreftet:J,reload:()=>R(r,c)};P&&(P.innerHTML=(F?p(l,S.erSwiss):``)+S.getBannerExtra(X),S.bindBannerExtra(P,X),P.querySelector(`#fullfør-turnering-btn`)?.addEventListener(`click`,async()=>{if(!await e({title:`Fullfør turnering`,message:`Vil du fullføre turneringa? Dette kan ikkje angrast.`,danger:!0}))return;let{error:t}=await d(c);if(t){k(`Feil ved lagring`,`error`);return}await R(r,c)}),P.querySelector(`#test-autofullfør-btn`)?.addEventListener(`click`,async t=>{let n=t.currentTarget;await e({title:`Autofullfør kampar`,message:`Autofullfør alle ubekreftede innledande kampar?`})&&(n.disabled=!0,await E(c),await R(r,c))}));let Z=[...(S.filterRundar??(e=>e))(V).entries()].map(([e,t])=>K(e,t,N,Y,L)).join(``)+G(),Q=F||q.some(e=>(e.hcp??0)>0),$=O(q,u,N,{tableId:`stilling-innl`,isAdmin:F,stevneid:c,harHcp:Q,harAntallKamper:!0}),ee=w(r);r.innerHTML=v(Z,$),g(r),ee===`stilling`&&A(r,`stilling`),D(r,`stilling-innl`,I),F&&r.querySelectorAll(`.stilling-hcp-celle`).forEach(e=>{e.addEventListener(`click`,async e=>{e.stopPropagation();let t=e.currentTarget,n=Number(t.dataset.kasterid),i=Number(t.dataset.stevneid),a=C.find(e=>e.kasterid===n)?.hcp??0,o=await H({title:`Sett HCP`,message:`Sett HCP for spelar:`,defaultValue:String(a),inputType:`number`});if(o===null)return;let s=parseInt(o,10);if(isNaN(s)||s<0){k(`Ugyldig HCP-verdi`,`error`);return}let{error:l}=await m(i,n,s);if(l){k(`Feil ved lagring av HCP`,`error`);return}await R(r,c)})});for(let a of u){let l=async()=>{let[n,l]=i(a.spelarar,N),u=[n?.id,l?.id].filter(e=>e!=null),d=u.length?await t(u):!1;d&&!await e({title:`Slett detaljar`,message:`Dette sletter detaljar for denne kampen. Er du sikker?`})||M(n?.kaster?`${f(n.kaster.fornavn)} ${f(n.kaster.etternavn)}`:`—`,l?.kaster?`${f(l.kaster.fornavn)} ${f(l.kaster.etternavn)}`:`—`,o(n),o(l),async(e,t)=>{try{d&&u.length&&await s(u),await Promise.all([n?b(n.id,e):Promise.resolve({error:null}),l?b(l.id,t):Promise.resolve({error:null})])}catch(e){T(`${S.logPrefix}:plusCallback`,e),k(`Feil ved lagring av score`,`error`);return}await R(r,c)})};if(r.querySelector(`#plus-${a.id}`)?.addEventListener(`click`,l),r.querySelector(`#scoreboard-${a.id}`)?.addEventListener(`click`,()=>{window.open(`#/kamp/${a.id}`,`_blank`)}),r.querySelector(`#bekrft-${a.id}`)?.addEventListener(`click`,async e=>{let t=e.currentTarget;t.disabled=!0,t.textContent=`Lagrer…`,await B(r,c,a,N,L)||(t.disabled=!1,t.textContent=`Bekreft`)}),Y&&a.er_bekreftet){let[e,t]=i(a.spelarar,N),o=e?.kaster?`${f(e.kaster.fornavn)} ${f(e.kaster.etternavn)}`:`—`,s=t?.kaster?`${f(t.kaster.fornavn)} ${f(t.kaster.etternavn)}`:`—`,l=()=>{M(o,s,e?.score_poeng??0,t?.score_poeng??0,async(i,a)=>{let[o,s]=n(i,a);try{await Promise.all([e?b(e.id,i,o):Promise.resolve({error:null}),t?b(t.id,a,s):Promise.resolve({error:null})])}catch(e){T(`${S.logPrefix}:adminReScore`,e),k(`Feil ved lagring av score`,`error`);return}await R(r,c)})};r.querySelectorAll(`[data-endre-score="${a.id}"]`).forEach(e=>e.addEventListener(`click`,l))}let u=r.querySelector(`.kamp-rad-mobil[data-kamp-id="${a.id}"]`);u&&(F?(u.querySelector(`.kamp-rad-mobil__hoved`)?.addEventListener(`click`,()=>{let e=u.dataset.expanded===`true`;r.querySelectorAll(`.kamp-rad-mobil[data-expanded="true"]`).forEach(e=>{e.dataset.expanded=`false`,e.setAttribute(`aria-expanded`,`false`)}),u.dataset.expanded=e?`false`:`true`,u.setAttribute(`aria-expanded`,String(!e))}),r.querySelector(`#m-plus-${a.id}`)?.addEventListener(`click`,e=>{e.stopPropagation(),l()}),r.querySelector(`#m-scoreboard-${a.id}`)?.addEventListener(`click`,e=>{e.stopPropagation(),window.open(`#/kamp/${a.id}`,`_blank`)}),r.querySelector(`#m-bekrft-${a.id}`)?.addEventListener(`click`,async e=>{e.stopPropagation();let t=e.currentTarget;t.disabled=!0,t.textContent=`Lagrer…`,await B(r,c,a,N,L)||(t.disabled=!1,t.textContent=`Bekreft`)})):u.addEventListener(`click`,()=>{window.open(`#/kamp/${a.id}`,`_blank`)}))}z(r,c)}catch(e){T(`${S.logPrefix}.lastOgVis`,e),r.replaceChildren(a(`Kunne ikkje laste innledande fase.`))}}function z(e,t){if(N)return;let n=C(t,[`innledende`],e,R,()=>{N&&=(l(N),null)});N=c(t,S.channelName(t),n)}async function B(e,t,n,r,a={}){let[o,s]=i(n.spelarar,r),c=a[o?.kasterid??-1]??0,l=a[s?.kasterid??-1]??0,{error:d}=await u({kampId:n.id,p1:o?{spelarId:o.id,kasterid:o.kasterid,scorePoeng:o.score_poeng}:null,p2:s?{spelarId:s.id,kasterid:s.kasterid,scorePoeng:s.score_poeng}:null,hcp1:c,hcp2:l,erWalkover:n.er_walkover});return d?(k(`DB-feil ved bekreft`,`error`),!1):(await R(e,t),!0)}return L}function W(e,t,n){return e.er_bekreftet?`ferdig`:n||t?`pagaar`:`ikke-startet`}function G(){return`
    <div class="kamp-legend">
      <div class="kamp-legend__item"><div class="kamp-legend__stripe kamp-legend__stripe--ikke"></div> Ikke startet</div>
      <div class="kamp-legend__item"><div class="kamp-legend__stripe kamp-legend__stripe--pagaar"></div> Pågår</div>
      <div class="kamp-legend__item"><div class="kamp-legend__stripe kamp-legend__stripe--ferdig"></div> Ferdig</div>
    </div>`}function K(e,t,n,r,i={}){let a=t.map(e=>q(e,n,r,i)).join(``),o=t.map(e=>J(e,n,r,i)).join(``);return`
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
    </div>`}function q(e,t,n=!0,r={}){let[a,s]=i(e.spelarar,t),c=a?.kasterid?t[a.kasterid]??``:``,l=s?.kasterid?t[s.kasterid]??``:``,u=a?.kaster?`${f(a.kaster.fornavn)} ${f(a.kaster.etternavn)}`:`—`,d=e.er_walkover&&!s?.kaster,p=d?`Walkover`:s?.kaster?`${f(s.kaster.fornavn)} ${f(s.kaster.etternavn)}`:`—`,m=c?`${u} (${c})`:u,h=d?l?`Walkover (${l})`:`Walkover`:l?`${p} (${l})`:p,g=(a?.omgangar?.length??0)>0,_=(s?.omgangar?.length??0)>0,v=g||_,y=r[a?.kasterid??-1]??0,b=r[s?.kasterid??-1]??0,x=e.er_bekreftet?a?.score_poeng??0:o(a)+(g?y:0),C=e.er_bekreftet?s?.score_poeng??0:o(s)+(_?b:0),w=e.er_walkover&&!e.er_bekreftet,T=w?21:x,E=w?0:C,D=e.er_bekreftet||e.er_walkover||v||x>0||C>0,O=W(e,D,v),k=S(e,[a,s].filter(e=>e!=null),v,r),A=n&&e.er_bekreftet&&!e.er_walkover&&!v?` data-endre-score="${e.id}" class="text-center score-redigerbar"`:` class="text-center"`,j;if(e.er_bekreftet)j=`<td class="text-end pe-2"><span class="kamp-bekreftet-indikator">✓ Bekreftet</span></td>`;else if(n){let t=O===`ikke-startet`,n=v,r=k,i=`kamp-knapp${t?` kamp-knapp-primaer`:``}`,a=`kamp-knapp${n?` kamp-knapp-primaer`:``}`,o=`kamp-knapp${r?` kamp-knapp-suksess`:``}`;j=`<td class="text-end pe-2 text-nowrap">
        <button class="${i}" id="plus-${e.id}">+</button>
        <button class="${a}" id="scoreboard-${e.id}" title="Scoreboard">Score</button>
        <button class="${o}" id="bekrft-${e.id}"${k?``:` disabled`}>Bekreft</button>
      </td>`}else j=`<td class="text-end pe-2">
        <button class="kamp-knapp" id="scoreboard-${e.id}" title="Scoreboard">Score</button>
      </td>`;return`
    <tr class="kamp-rad-desktop" data-status="${O}">
      <td class="text-center">${e.bane_nummer??``}</td>
      <td>${m}</td>
      <td${A}>${D?T:`—`}</td>
      <td${A}>${D?E:`—`}</td>
      <td>${h}</td>
      ${j}
    </tr>`}function J(e,t,n,r={}){let[a,s]=i(e.spelarar,t),c=a?.kaster?`${f(a.kaster.fornavn)} ${f(a.kaster.etternavn.charAt(0))}.`:`—`,l=e.er_walkover&&!s?.kaster?`Walkover`:s?.kaster?`${f(s.kaster.fornavn)} ${f(s.kaster.etternavn.charAt(0))}.`:`—`,u=(a?.omgangar?.length??0)>0,d=(s?.omgangar?.length??0)>0,p=u||d,m=r[a?.kasterid??-1]??0,h=r[s?.kasterid??-1]??0,g=e.er_bekreftet?a?.score_poeng??0:o(a)+(u?m:0),_=e.er_bekreftet?s?.score_poeng??0:o(s)+(d?h:0),v=e.er_walkover&&!e.er_bekreftet,y=v?21:g,b=v?0:_,x=e.er_bekreftet||e.er_walkover||p||g>0||_>0,C=W(e,x,p),w=x?`${y}–${b}`:`—`,T=``;if(n){let t=S(e,[a,s].filter(e=>e!=null),p,r),n=e.er_bekreftet?`<span class="kamp-bekreftet-mobil">✓ Bekreftet</span>`:`<button class="kamp-knapp-mobil kamp-knapp-bekreft-mobil" id="m-bekrft-${e.id}"${t?``:` disabled`}>Bekreft</button>`;T=`
      <div class="kamp-mobil-knapper">
        <button class="kamp-knapp-mobil" id="m-plus-${e.id}"${e.er_bekreftet?` disabled`:``}>+ Resultat</button>
        <button class="kamp-knapp-mobil" id="m-scoreboard-${e.id}">Score</button>
        ${n}
      </div>`}return`
    <li class="kamp-rad-mobil${n?``:` kamp-rad-mobil--viewer`}" data-kamp-id="${e.id}" data-status="${C}" role="button" tabindex="0">
      <div class="kamp-rad-mobil__hoved">
        <span class="kamp-mobil-bane">${e.bane_nummer??``}</span>
        <span class="kamp-mobil-namn">${c} vs ${l}</span>
        <span class="kamp-mobil-resultat">${w}</span>
      </div>
      ${T}
    </li>`}export{U as t};