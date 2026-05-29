import{$ as e,A as t,F as n,G as r,H as i,J as a,K as o,L as s,N as c,Q as l,S as u,U as d,W as f,a as p,b as m,c as h,d as g,et as _,f as v,g as y,h as b,i as x,j as S,k as C,m as w,nt as T,s as E,tt as D,u as O,v as k,x as A,y as j,z as M}from"./index-qbVhMqMH.js";import{t as N}from"./ScoreNumberpad-C-b3sWkY.js";var P=null,F=null,I=null,L=null;function R(){return P||(P=document.createElement(`div`),P.className=`modal`,P.style.display=`none`,P.setAttribute(`role`,`dialog`),P.setAttribute(`aria-modal`,`true`),P.setAttribute(`aria-labelledby`,`pd-title`),P.innerHTML=`
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
  `,document.body.appendChild(P),P.querySelector(`#pd-cancel`).addEventListener(`click`,()=>{H(null)}),P.querySelector(`#pd-confirm`).addEventListener(`click`,()=>{V()}),P.querySelector(`#pd-input`).addEventListener(`keydown`,e=>{e.key===`Enter`&&(e.preventDefault(),V())}),P)}function z(e){F=document.createElement(`div`),F.className=`modal-backdrop show`,document.body.appendChild(F),document.body.classList.add(`modal-open`),e.style.display=`block`,e.classList.add(`show`),e.querySelector(`#pd-input`)?.focus(),L=e=>{e.key===`Escape`&&(e.preventDefault(),H(null))},document.addEventListener(`keydown`,L)}function B(e){e.classList.remove(`show`),e.style.display=`none`,F?.remove(),F=null,document.body.classList.remove(`modal-open`),L&&=(document.removeEventListener(`keydown`,L),null)}function V(){H(P?.querySelector(`#pd-input`)?.value??``)}function H(e){if(!P||!I)return;let t=I;I=null,B(P),t(e)}function U(e){let{title:t,message:n,defaultValue:r=``,inputType:i=`text`}=e,a=R();a.querySelector(`#pd-title`).textContent=t,a.querySelector(`#pd-message`).textContent=n;let o=a.querySelector(`#pd-input`);return o.type=i,o.value=r,new Promise(e=>{I=e,z(a)})}function W(O){let P=null,F=null,I=!1,L=new Set;async function R(e,{id:n,isAdmin:r=!1},i=null){F=i,I=r,O.onReset?.(),P&&=(await t(P),null),e.replaceChildren(_(`Laster…`)),await z(e,n)}async function z(t,c){try{let[{data:d},{data:_},{data:y}]=await Promise.all([a(c),s(c),x(c)]);if(!d){t.replaceChildren(D(`Stevne ikkje funne.`));return}let P=Object.fromEntries(y.filter(e=>e.kasterid!=null).map(e=>[e.kasterid,e.startnummer??0])),R=Object.fromEntries(y.filter(e=>e.kasterid!=null&&(e.hcp??0)>0).map(e=>[e.kasterid,e.hcp??0])),H=new Map;for(let e of _)H.has(e.runde_nummer)||H.set(e.runde_nummer,[]),H.get(e.runde_nummer).push(e);let{spelMap:W,ekteKasterids:G}=w(_,P),J=u(Object.values(W).filter(e=>G.has(e.kasterid)).map(e=>({...e,hcp:y.find(t=>t.kasterid===e.kasterid)?.hcp??0})),_),Y=_.length>0&&_.every(e=>e.er_bekreftet),X=I&&d.stevne_fase!==`avsluttende`,Z={container:t,stevneid:c,stevne:d,alleKamper:_,rundeMap:H,startnrMap:P,stilling:J,isAdmin:I,erAlleKamperBekreftet:Y,reload:()=>z(t,c)};F&&(F.innerHTML=(I?j(d,O.erSwiss):``)+O.getBannerExtra(Z),O.bindBannerExtra(F,Z),F.querySelector(`#fullfør-turnering-btn`)?.addEventListener(`click`,async()=>{if(!await S({title:`Fullfør turnering`,message:`Vil du fullføre turneringa? Dette kan ikkje angrast.`,danger:!0}))return;let{error:e}=await E(c,J);if(e){C(`Feil ved lagring av plasseringar`,`error`);return}let{error:n}=await l(c);if(n){C(`Feil ved lagring`,`error`);return}await z(t,c)}),F.querySelector(`#test-autofullfør-btn`)?.addEventListener(`click`,async e=>{let n=e.currentTarget;await S({title:`Autofullfør kampar`,message:`Autofullfør alle ubekreftede innledande kampar?`})&&(n.disabled=!0,await h(c),await z(t,c))}));let Q=[...(O.filterRundar??(e=>e))(H).entries()].map(([e,t])=>q(e,t,P,X,R)).join(``)+K(),$=I||J.some(e=>(e.hcp??0)>0),ee=m(J,_,P,{tableId:`stilling-innl`,isAdmin:I,stevneid:c,harHcp:$,harAntallKamper:!0}),te=b(t);t.innerHTML=k(Q,ee),v(t),te===`stilling`&&A(t,`stilling`),g(t,`stilling-innl`,L),I&&t.querySelectorAll(`.stilling-hcp-celle`).forEach(e=>{e.addEventListener(`click`,async e=>{e.stopPropagation();let n=e.currentTarget,r=Number(n.dataset.kasterid),i=Number(n.dataset.stevneid),a=y.find(e=>e.kasterid===r)?.hcp??0,o=await U({title:`Sett HCP`,message:`Sett HCP for spelar:`,defaultValue:String(a),inputType:`number`});if(o===null)return;let s=parseInt(o,10);if(isNaN(s)||s<0){C(`Ugyldig HCP-verdi`,`error`);return}let{error:l}=await p(i,r,s);if(l){C(`Feil ved lagring av HCP`,`error`);return}await z(t,c)})});for(let a of _){let s=async()=>{let[s,l]=r(a.spelarar,P),u=[s?.id,l?.id].filter(e=>e!=null),d=u.length?await n(u):!1;d&&!await S({title:`Slett detaljar`,message:`Dette sletter detaljar for denne kampen. Er du sikker?`})||N(s?.kaster?`${e(s.kaster.fornavn)} ${e(s.kaster.etternavn)}`:`—`,l?.kaster?`${e(l.kaster.fornavn)} ${e(l.kaster.etternavn)}`:`—`,o(s),o(l),async(e,n)=>{try{d&&u.length&&await i(u),await Promise.all([s?M(s.id,e):Promise.resolve({error:null}),l?M(l.id,n):Promise.resolve({error:null})])}catch(e){T(`${O.logPrefix}:plusCallback`,e),C(`Feil ved lagring av score`,`error`);return}await z(t,c)})};if(t.querySelector(`#plus-${a.id}`)?.addEventListener(`click`,s),t.querySelector(`#scoreboard-${a.id}`)?.addEventListener(`click`,()=>{window.open(`#/kamp/${a.id}`,`_blank`)}),t.querySelector(`#bekrft-${a.id}`)?.addEventListener(`click`,async e=>{let n=e.currentTarget;n.disabled=!0,n.textContent=`Lagrer…`;try{await V(t,c,a,P,R)||(n.disabled=!1,n.textContent=`Bekreft`)}catch{n.disabled=!1,n.textContent=`Bekreft`}}),X&&a.er_bekreftet){let[n,i]=r(a.spelarar,P),o=n?.kaster?`${e(n.kaster.fornavn)} ${e(n.kaster.etternavn)}`:`—`,s=i?.kaster?`${e(i.kaster.fornavn)} ${e(i.kaster.etternavn)}`:`—`,l=()=>{N(o,s,n?.score_poeng??0,i?.score_poeng??0,async(e,r)=>{let[a,o]=f(e,r);try{await Promise.all([n?M(n.id,e,a):Promise.resolve({error:null}),i?M(i.id,r,o):Promise.resolve({error:null})])}catch(e){T(`${O.logPrefix}:adminReScore`,e),C(`Feil ved lagring av score`,`error`);return}await z(t,c)})};t.querySelectorAll(`[data-endre-score="${a.id}"]`).forEach(e=>e.addEventListener(`click`,l))}let l=t.querySelector(`.kamp-rad-mobil[data-kamp-id="${a.id}"]`);l&&(I?(l.querySelector(`.kamp-rad-mobil__hoved`)?.addEventListener(`click`,()=>{let e=l.dataset.expanded===`true`;t.querySelectorAll(`.kamp-rad-mobil[data-expanded="true"]`).forEach(e=>{e.dataset.expanded=`false`,e.setAttribute(`aria-expanded`,`false`)}),l.dataset.expanded=e?`false`:`true`,l.setAttribute(`aria-expanded`,String(!e))}),t.querySelector(`#m-plus-${a.id}`)?.addEventListener(`click`,e=>{e.stopPropagation(),s()}),t.querySelector(`#m-scoreboard-${a.id}`)?.addEventListener(`click`,e=>{e.stopPropagation(),window.open(`#/kamp/${a.id}`,`_blank`)}),t.querySelector(`#m-bekrft-${a.id}`)?.addEventListener(`click`,async e=>{e.stopPropagation();let n=e.currentTarget;n.disabled=!0,n.textContent=`Lagrer…`,await V(t,c,a,P,R)||(n.disabled=!1,n.textContent=`Bekreft`)})):l.addEventListener(`click`,()=>{window.open(`#/kamp/${a.id}`,`_blank`)}))}B(t,c)}catch(e){T(`${O.logPrefix}.lastOgVis`,e),t.replaceChildren(D(`Kunne ikkje laste innledande fase.`))}}function B(e,n){if(P)return;let r=y(n,[`innledende`],e,z,()=>{P&&=(t(P),null)});P=d(n,O.channelName(n),r)}async function V(e,t,n,i,a={}){let[o,s]=r(n.spelarar,i),l=a[o?.kasterid??-1]??0,u=a[s?.kasterid??-1]??0,{error:d}=await c({kampId:n.id,p1:o?{spelarId:o.id,kasterid:o.kasterid,scorePoeng:o.score_poeng}:null,p2:s?{spelarId:s.id,kasterid:s.kasterid,scorePoeng:s.score_poeng}:null,hcp1:l,hcp2:u,erWalkover:n.er_walkover});return d?(C(`DB-feil ved bekreft`,`error`),!1):(await z(e,t),!0)}return R}function G(e,t,n){return e.er_bekreftet?`ferdig`:n||t?`pagaar`:`ikke-startet`}function K(){return`
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
    </div>`}function J(t,n,i=!0,a={}){let[s,c]=r(t.spelarar,n),l=s?.kasterid?n[s.kasterid]??``:``,u=c?.kasterid?n[c.kasterid]??``:``,d=s?.kaster?`${e(s.kaster.fornavn)} ${e(s.kaster.etternavn)}`:`—`,f=t.er_walkover&&!c?.kaster,p=f?`Walkover`:c?.kaster?`${e(c.kaster.fornavn)} ${e(c.kaster.etternavn)}`:`—`,m=l?`${d} (${l})`:d,h=f?u?`Walkover (${u})`:`Walkover`:u?`${p} (${u})`:p,g=(s?.omgangar?.length??0)>0,_=(c?.omgangar?.length??0)>0,v=g||_,y=a[s?.kasterid??-1]??0,b=a[c?.kasterid??-1]??0,x=t.er_bekreftet?s?.score_poeng??0:o(s)+(g?y:0),S=t.er_bekreftet?c?.score_poeng??0:o(c)+(_?b:0),C=t.er_walkover&&!t.er_bekreftet,w=C?21:x,T=C?0:S,E=t.er_bekreftet||t.er_walkover||v||x>0||S>0,D=G(t,E,v),k=O(t,[s,c].filter(e=>e!=null),v,a),A=i&&t.er_bekreftet&&!t.er_walkover&&!v?` data-endre-score="${t.id}" class="text-center score-redigerbar"`:` class="text-center"`,j;if(t.er_bekreftet)j=`<td class="text-end pe-2"><span class="kamp-bekreftet-indikator">✓ Bekreftet</span></td>`;else if(i){let e=D===`ikke-startet`,n=v,r=k,i=`kamp-knapp${e?` kamp-knapp-primaer`:``}`,a=`kamp-knapp${n?` kamp-knapp-primaer`:``}`,o=`kamp-knapp${r?` kamp-knapp-suksess`:``}`;j=`<td class="text-end pe-2 text-nowrap">
        <button class="${i}" id="plus-${t.id}">+</button>
        <button class="${a}" id="scoreboard-${t.id}" title="Scoreboard">Score</button>
        <button class="${o}" id="bekrft-${t.id}"${k?``:` disabled`}>Bekreft</button>
      </td>`}else j=`<td class="text-end pe-2">
        <button class="kamp-knapp" id="scoreboard-${t.id}" title="Scoreboard">Score</button>
      </td>`;return`
    <tr class="kamp-rad-desktop" data-status="${D}">
      <td class="text-center">${t.bane_nummer??``}</td>
      <td>${m}</td>
      <td${A}>${E?w:`—`}</td>
      <td${A}>${E?T:`—`}</td>
      <td>${h}</td>
      ${j}
    </tr>`}function Y(t,n,i,a={}){let[s,c]=r(t.spelarar,n),l=s?.kaster?`${e(s.kaster.fornavn)} ${e(s.kaster.etternavn.charAt(0))}.`:`—`,u=t.er_walkover&&!c?.kaster?`Walkover`:c?.kaster?`${e(c.kaster.fornavn)} ${e(c.kaster.etternavn.charAt(0))}.`:`—`,d=(s?.omgangar?.length??0)>0,f=(c?.omgangar?.length??0)>0,p=d||f,m=a[s?.kasterid??-1]??0,h=a[c?.kasterid??-1]??0,g=t.er_bekreftet?s?.score_poeng??0:o(s)+(d?m:0),_=t.er_bekreftet?c?.score_poeng??0:o(c)+(f?h:0),v=t.er_walkover&&!t.er_bekreftet,y=v?21:g,b=v?0:_,x=t.er_bekreftet||t.er_walkover||p||g>0||_>0,S=G(t,x,p),C=x?`${y}–${b}`:`—`,w=``;if(i){let e=O(t,[s,c].filter(e=>e!=null),p,a),n=t.er_bekreftet?`<span class="kamp-bekreftet-mobil">✓ Bekreftet</span>`:`<button class="kamp-knapp-mobil kamp-knapp-bekreft-mobil" id="m-bekrft-${t.id}"${e?``:` disabled`}>Bekreft</button>`;w=`
      <div class="kamp-mobil-knapper">
        <button class="kamp-knapp-mobil" id="m-plus-${t.id}"${t.er_bekreftet?` disabled`:``}>+ Resultat</button>
        <button class="kamp-knapp-mobil" id="m-scoreboard-${t.id}">Score</button>
        ${n}
      </div>`}return`
    <li class="kamp-rad-mobil${i?``:` kamp-rad-mobil--viewer`}" data-kamp-id="${t.id}" data-status="${S}" role="button" tabindex="0">
      <div class="kamp-rad-mobil__hoved">
        <span class="kamp-mobil-bane">${t.bane_nummer??``}</span>
        <span class="kamp-mobil-namn">${l} vs ${u}</span>
        <span class="kamp-mobil-resultat">${C}</span>
      </div>
      ${w}
    </li>`}export{W as t};