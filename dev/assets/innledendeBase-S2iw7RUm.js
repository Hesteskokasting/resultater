import{$ as e,A as t,F as n,G as r,H as i,L as a,N as o,Q as s,S as c,U as l,V as u,W as d,Z as f,a as p,b as m,c as h,d as g,et as _,f as v,g as y,h as b,i as x,j as S,k as C,m as w,q as T,s as E,tt as D,u as O,v as k,x as A,y as j,z as M}from"./index-Bsi1D6xh.js";import{t as N}from"./ScoreNumberpad-C-b3sWkY.js";var P=null,F=null,I=null,L=null;function R(){return P||(P=document.createElement(`div`),P.className=`modal`,P.style.display=`none`,P.setAttribute(`role`,`dialog`),P.setAttribute(`aria-modal`,`true`),P.setAttribute(`aria-labelledby`,`pd-title`),P.innerHTML=`
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
  `,document.body.appendChild(P),P.querySelector(`#pd-cancel`).addEventListener(`click`,()=>{H(null)}),P.querySelector(`#pd-confirm`).addEventListener(`click`,()=>{V()}),P.querySelector(`#pd-input`).addEventListener(`keydown`,e=>{e.key===`Enter`&&(e.preventDefault(),V())}),P)}function z(e){F=document.createElement(`div`),F.className=`modal-backdrop show`,document.body.appendChild(F),document.body.classList.add(`modal-open`),e.style.display=`block`,e.classList.add(`show`),e.querySelector(`#pd-input`)?.focus(),L=e=>{e.key===`Escape`&&(e.preventDefault(),H(null))},document.addEventListener(`keydown`,L)}function B(e){e.classList.remove(`show`),e.style.display=`none`,F?.remove(),F=null,document.body.classList.remove(`modal-open`),L&&=(document.removeEventListener(`keydown`,L),null)}function V(){H(P?.querySelector(`#pd-input`)?.value??``)}function H(e){if(!P||!I)return;let t=I;I=null,B(P),t(e)}function U(e){let{title:t,message:n,defaultValue:r=``,inputType:i=`text`}=e,a=R();a.querySelector(`#pd-title`).textContent=t,a.querySelector(`#pd-message`).textContent=n;let o=a.querySelector(`#pd-input`);return o.type=i,o.value=r,new Promise(e=>{I=e,z(a)})}function W(O){let P=null,F=null,I=!1,L=new Set;async function R(n,{id:r,isAdmin:i=!1},a=null){F=a,I=i,O.onReset?.(),P&&=(await t(P),null),n.replaceChildren(e(`Laster…`)),await z(n,r)}async function z(e,t){try{let[{data:i},{data:o},{data:y}]=await Promise.all([T(t),a(t),x(t)]);if(!i){e.replaceChildren(_(`Stevne ikkje funne.`));return}let P=Object.fromEntries(y.filter(e=>e.kasterid!=null).map(e=>[e.kasterid,e.startnummer??0])),R=Object.fromEntries(y.filter(e=>e.kasterid!=null&&(e.hcp??0)>0).map(e=>[e.kasterid,e.hcp??0])),H=new Map;for(let e of o)H.has(e.runde_nummer)||H.set(e.runde_nummer,[]),H.get(e.runde_nummer).push(e);let{spelMap:W,ekteKasterids:G}=w(o,P),J=c(Object.values(W).filter(e=>G.has(e.kasterid)).map(e=>({...e,hcp:y.find(t=>t.kasterid===e.kasterid)?.hcp??0})),o),Y=o.length>0&&o.every(e=>e.er_bekreftet),X=I&&i.stevne_fase!==`avsluttende`,Z={container:e,stevneid:t,stevne:i,alleKamper:o,rundeMap:H,startnrMap:P,stilling:J,isAdmin:I,erAlleKamperBekreftet:Y,reload:()=>z(e,t)};F&&(F.innerHTML=(I?j(i,O.erSwiss):``)+O.getBannerExtra(Z),O.bindBannerExtra(F,Z),F.querySelector(`#fullfør-turnering-btn`)?.addEventListener(`click`,async()=>{if(!await S({title:`Fullfør turnering`,message:`Vil du fullføre turneringa? Dette kan ikkje angrast.`,danger:!0}))return;let{error:n}=await E(t,J);if(n){C(`Feil ved lagring av plasseringar`,`error`);return}let{error:r}=await f(t);if(r){C(`Feil ved lagring`,`error`);return}await z(e,t)}),F.querySelector(`#test-autofullfør-btn`)?.addEventListener(`click`,async n=>{let r=n.currentTarget;await S({title:`Autofullfør kampar`,message:`Autofullfør alle ubekreftede innledande kampar?`})&&(r.disabled=!0,await h(t),await z(e,t))}));let Q=[...(O.filterRundar??(e=>e))(H).entries()].map(([e,t])=>q(e,t,P,X,R)).join(``)+K(),$=I||J.some(e=>(e.hcp??0)>0),ee=m(J,o,P,{tableId:`stilling-innl`,isAdmin:I,stevneid:t,harHcp:$,harAntallKamper:!0}),te=b(e);e.innerHTML=k(Q,ee),v(e),te===`stilling`&&A(e,`stilling`),g(e,`stilling-innl`,L),I&&e.querySelectorAll(`.stilling-hcp-celle`).forEach(n=>{n.addEventListener(`click`,async n=>{n.stopPropagation();let r=n.currentTarget,i=Number(r.dataset.kasterid),a=Number(r.dataset.stevneid),o=y.find(e=>e.kasterid===i)?.hcp??0,s=await U({title:`Sett HCP`,message:`Sett HCP for spelar:`,defaultValue:String(o),inputType:`number`});if(s===null)return;let c=parseInt(s,10);if(isNaN(c)||c<0){C(`Ugyldig HCP-verdi`,`error`);return}let{error:l}=await p(a,i,c);if(l){C(`Feil ved lagring av HCP`,`error`);return}await z(e,t)})});for(let i of o){let a=async()=>{let[a,o]=d(i.spelarar,P),c=[a?.id,o?.id].filter(e=>e!=null),l=c.length?await n(c):!1;l&&!await S({title:`Slett detaljar`,message:`Dette sletter detaljar for denne kampen. Er du sikker?`})||N(a?.kaster?`${s(a.kaster.fornavn)} ${s(a.kaster.etternavn)}`:`—`,o?.kaster?`${s(o.kaster.fornavn)} ${s(o.kaster.etternavn)}`:`—`,r(a),r(o),async(n,r)=>{try{l&&c.length&&await u(c),await Promise.all([a?M(a.id,n):Promise.resolve({error:null}),o?M(o.id,r):Promise.resolve({error:null})])}catch(e){D(`${O.logPrefix}:plusCallback`,e),C(`Feil ved lagring av score`,`error`);return}await z(e,t)})};if(e.querySelector(`#plus-${i.id}`)?.addEventListener(`click`,a),e.querySelector(`#scoreboard-${i.id}`)?.addEventListener(`click`,()=>{window.open(`#/kamp/${i.id}`,`_blank`)}),e.querySelector(`#bekrft-${i.id}`)?.addEventListener(`click`,async n=>{let r=n.currentTarget;r.disabled=!0,r.textContent=`Lagrer…`;try{await V(e,t,i,P,R)||(r.disabled=!1,r.textContent=`Bekreft`)}catch{r.disabled=!1,r.textContent=`Bekreft`}}),X&&i.er_bekreftet){let[n,r]=d(i.spelarar,P),a=n?.kaster?`${s(n.kaster.fornavn)} ${s(n.kaster.etternavn)}`:`—`,o=r?.kaster?`${s(r.kaster.fornavn)} ${s(r.kaster.etternavn)}`:`—`,c=()=>{N(a,o,n?.score_poeng??0,r?.score_poeng??0,async(i,a)=>{let[o,s]=l(i,a);try{await Promise.all([n?M(n.id,i,o):Promise.resolve({error:null}),r?M(r.id,a,s):Promise.resolve({error:null})])}catch(e){D(`${O.logPrefix}:adminReScore`,e),C(`Feil ved lagring av score`,`error`);return}await z(e,t)})};e.querySelectorAll(`[data-endre-score="${i.id}"]`).forEach(e=>e.addEventListener(`click`,c))}let o=e.querySelector(`.kamp-rad-mobil[data-kamp-id="${i.id}"]`);o&&(I?(o.querySelector(`.kamp-rad-mobil__hoved`)?.addEventListener(`click`,()=>{let t=o.dataset.expanded===`true`;e.querySelectorAll(`.kamp-rad-mobil[data-expanded="true"]`).forEach(e=>{e.dataset.expanded=`false`,e.setAttribute(`aria-expanded`,`false`)}),o.dataset.expanded=t?`false`:`true`,o.setAttribute(`aria-expanded`,String(!t))}),e.querySelector(`#m-plus-${i.id}`)?.addEventListener(`click`,e=>{e.stopPropagation(),a()}),e.querySelector(`#m-scoreboard-${i.id}`)?.addEventListener(`click`,e=>{e.stopPropagation(),window.open(`#/kamp/${i.id}`,`_blank`)}),e.querySelector(`#m-bekrft-${i.id}`)?.addEventListener(`click`,async n=>{n.stopPropagation();let r=n.currentTarget;r.disabled=!0,r.textContent=`Lagrer…`,await V(e,t,i,P,R)||(r.disabled=!1,r.textContent=`Bekreft`)})):o.addEventListener(`click`,()=>{window.open(`#/kamp/${i.id}`,`_blank`)}))}B(e,t)}catch(t){D(`${O.logPrefix}.lastOgVis`,t),e.replaceChildren(_(`Kunne ikkje laste innledande fase.`))}}function B(e,n){if(P)return;let r=y(n,[`innledende`],e,z,()=>{P&&=(t(P),null)});P=i(n,O.channelName(n),r)}async function V(e,t,n,r,i={}){let[a,s]=d(n.spelarar,r),c=i[a?.kasterid??-1]??0,l=i[s?.kasterid??-1]??0,{error:u}=await o({kampId:n.id,p1:a?{spelarId:a.id,kasterid:a.kasterid,scorePoeng:a.score_poeng}:null,p2:s?{spelarId:s.id,kasterid:s.kasterid,scorePoeng:s.score_poeng}:null,hcp1:c,hcp2:l,erWalkover:n.er_walkover});return u?(C(`DB-feil ved bekreft`,`error`),!1):(await z(e,t),!0)}return R}function G(e,t,n){return e.er_bekreftet?`ferdig`:n||t?`pagaar`:`ikke-startet`}function K(){return`
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
    </div>`}function J(e,t,n=!0,i={}){let[a,o]=d(e.spelarar,t),c=a?.kasterid?t[a.kasterid]??``:``,l=o?.kasterid?t[o.kasterid]??``:``,u=a?.kaster?`${s(a.kaster.fornavn)} ${s(a.kaster.etternavn)}`:`—`,f=e.er_walkover&&!o?.kaster,p=f?`Walkover`:o?.kaster?`${s(o.kaster.fornavn)} ${s(o.kaster.etternavn)}`:`—`,m=c?`${u} (${c})`:u,h=f?l?`Walkover (${l})`:`Walkover`:l?`${p} (${l})`:p,g=(a?.omgangar?.length??0)>0,_=(o?.omgangar?.length??0)>0,v=g||_,y=i[a?.kasterid??-1]??0,b=i[o?.kasterid??-1]??0,x=e.er_bekreftet?a?.score_poeng??0:r(a)+(g?y:0),S=e.er_bekreftet?o?.score_poeng??0:r(o)+(_?b:0),C=e.er_walkover&&!e.er_bekreftet,w=C?21:x,T=C?0:S,E=e.er_bekreftet||e.er_walkover||v||x>0||S>0,D=G(e,E,v),k=O(e,[a,o].filter(e=>e!=null),v,i),A=n&&e.er_bekreftet&&!e.er_walkover&&!v?` data-endre-score="${e.id}" class="text-center score-redigerbar"`:` class="text-center"`,j;if(e.er_bekreftet)j=`<td class="text-end pe-2"><span class="kamp-bekreftet-indikator">✓ Bekreftet</span></td>`;else if(n){let t=D===`ikke-startet`,n=v,r=k,i=`kamp-knapp${t?` kamp-knapp-primaer`:``}`,a=`kamp-knapp${n?` kamp-knapp-primaer`:``}`,o=`kamp-knapp${r?` kamp-knapp-suksess`:``}`;j=`<td class="text-end pe-2 text-nowrap">
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
    </tr>`}function Y(e,t,n,i={}){let[a,o]=d(e.spelarar,t),c=a?.kaster?`${s(a.kaster.fornavn)} ${s(a.kaster.etternavn.charAt(0))}.`:`—`,l=e.er_walkover&&!o?.kaster?`Walkover`:o?.kaster?`${s(o.kaster.fornavn)} ${s(o.kaster.etternavn.charAt(0))}.`:`—`,u=(a?.omgangar?.length??0)>0,f=(o?.omgangar?.length??0)>0,p=u||f,m=i[a?.kasterid??-1]??0,h=i[o?.kasterid??-1]??0,g=e.er_bekreftet?a?.score_poeng??0:r(a)+(u?m:0),_=e.er_bekreftet?o?.score_poeng??0:r(o)+(f?h:0),v=e.er_walkover&&!e.er_bekreftet,y=v?21:g,b=v?0:_,x=e.er_bekreftet||e.er_walkover||p||g>0||_>0,S=G(e,x,p),C=x?`${y}–${b}`:`—`,w=``;if(n){let t=O(e,[a,o].filter(e=>e!=null),p,i),n=e.er_bekreftet?`<span class="kamp-bekreftet-mobil">✓ Bekreftet</span>`:`<button class="kamp-knapp-mobil kamp-knapp-bekreft-mobil" id="m-bekrft-${e.id}"${t?``:` disabled`}>Bekreft</button>`;w=`
      <div class="kamp-mobil-knapper">
        <button class="kamp-knapp-mobil" id="m-plus-${e.id}"${e.er_bekreftet?` disabled`:``}>+ Resultat</button>
        <button class="kamp-knapp-mobil" id="m-scoreboard-${e.id}">Score</button>
        ${n}
      </div>`}return`
    <li class="kamp-rad-mobil${n?``:` kamp-rad-mobil--viewer`}" data-kamp-id="${e.id}" data-status="${S}" role="button" tabindex="0">
      <div class="kamp-rad-mobil__hoved">
        <span class="kamp-mobil-bane">${e.bane_nummer??``}</span>
        <span class="kamp-mobil-namn">${c} vs ${l}</span>
        <span class="kamp-mobil-resultat">${C}</span>
      </div>
      ${w}
    </li>`}export{W as t};