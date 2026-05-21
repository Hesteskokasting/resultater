import{C as e,D as t,F as n,G as r,I as i,J as a,K as o,L as s,N as c,R as l,S as u,T as d,V as f,Y as p,a as m,b as h,c as g,d as _,f as v,g as y,h as b,i as x,j as S,k as C,m as w,q as T,s as E,u as D,v as O,w as k,x as A,y as j,z as M}from"./index-BckvuGoj.js";import{t as N}from"./ScoreNumberpad-C-b3sWkY.js";var P=null,F=null,I=null,L=null;function R(){return P||(P=document.createElement(`div`),P.className=`modal`,P.style.display=`none`,P.setAttribute(`role`,`dialog`),P.setAttribute(`aria-modal`,`true`),P.setAttribute(`aria-labelledby`,`pd-title`),P.innerHTML=`
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
  `,document.body.appendChild(P),P.querySelector(`#pd-cancel`).addEventListener(`click`,()=>{H(null)}),P.querySelector(`#pd-confirm`).addEventListener(`click`,()=>{V()}),P.querySelector(`#pd-input`).addEventListener(`keydown`,e=>{e.key===`Enter`&&(e.preventDefault(),V())}),P)}function z(e){F=document.createElement(`div`),F.className=`modal-backdrop show`,document.body.appendChild(F),document.body.classList.add(`modal-open`),e.style.display=`block`,e.classList.add(`show`),e.querySelector(`#pd-input`)?.focus(),L=e=>{e.key===`Escape`&&(e.preventDefault(),H(null))},document.addEventListener(`keydown`,L)}function B(e){e.classList.remove(`show`),e.style.display=`none`,F?.remove(),F=null,document.body.classList.remove(`modal-open`),L&&=(document.removeEventListener(`keydown`,L),null)}function V(){H(P?.querySelector(`#pd-input`)?.value??``)}function H(e){if(!P||!I)return;let t=I;I=null,B(P),t(e)}function U(e){let{title:t,message:n,defaultValue:r=``,inputType:i=`text`}=e,a=R();a.querySelector(`#pd-title`).textContent=t,a.querySelector(`#pd-message`).textContent=n;let o=a.querySelector(`#pd-input`);return o.type=i,o.value=r,new Promise(e=>{I=e,z(a)})}function W(D){let P=null,F=null,I=!1,L=new Set;async function R(e,{id:t,isAdmin:n=!1},r=null){F=r,I=n,D.onReset?.(),P&&=(await k(P),null),e.replaceChildren(T(`Laster…`)),await z(e,t)}async function z(t,i){try{let[{data:y},{data:T},{data:k}]=await Promise.all([f(i),S(i),x(i)]);if(!y){t.replaceChildren(a(`Stevne ikkje funne.`));return}let P=Object.fromEntries(k.filter(e=>e.kasterid!=null).map(e=>[e.kasterid,e.startnummer??0])),R=Object.fromEntries(k.filter(e=>e.kasterid!=null&&(e.hcp??0)>0).map(e=>[e.kasterid,e.hcp??0])),H=new Map;for(let e of T)H.has(e.runde_nummer)||H.set(e.runde_nummer,[]),H.get(e.runde_nummer).push(e);let{spelMap:W,ekteKasterids:G}=w(T,P),J=u(Object.values(W).filter(e=>G.has(e.kasterid)).map(e=>({...e,hcp:k.find(t=>t.kasterid===e.kasterid)?.hcp??0})),T),Y=T.length>0&&T.every(e=>e.er_bekreftet),X=I&&y.stevne_fase!==`avsluttende`,Z={container:t,stevneid:i,stevne:y,alleKamper:T,rundeMap:H,startnrMap:P,stilling:J,isAdmin:I,erAlleKamperBekreftet:Y,reload:()=>z(t,i)};F&&(F.innerHTML=(I?j(y,D.erSwiss):``)+D.getBannerExtra(Z),D.bindBannerExtra(F,Z),F.querySelector(`#fullfør-turnering-btn`)?.addEventListener(`click`,async()=>{if(!await d({title:`Fullfør turnering`,message:`Vil du fullføre turneringa? Dette kan ikkje angrast.`,danger:!0}))return;let{error:n}=await E(i,J);if(n){e(`Feil ved lagring av plasseringar`,`error`);return}let{error:a}=await r(i);if(a){e(`Feil ved lagring`,`error`);return}await z(t,i)}),F.querySelector(`#test-autofullfør-btn`)?.addEventListener(`click`,async e=>{let n=e.currentTarget;await d({title:`Autofullfør kampar`,message:`Autofullfør alle ubekreftede innledande kampar?`})&&(n.disabled=!0,await g(i),await z(t,i))}));let Q=[...(D.filterRundar??(e=>e))(H).entries()].map(([e,t])=>q(e,t,P,X,R)).join(``)+K(),$=I||J.some(e=>(e.hcp??0)>0),ee=h(J,T,P,{tableId:`stilling-innl`,isAdmin:I,stevneid:i,harHcp:$,harAntallKamper:!0}),te=b(t);t.innerHTML=O(Q,ee),v(t),te===`stilling`&&A(t,`stilling`),_(t,`stilling-innl`,L),I&&t.querySelectorAll(`.stilling-hcp-celle`).forEach(n=>{n.addEventListener(`click`,async n=>{n.stopPropagation();let r=n.currentTarget,a=Number(r.dataset.kasterid),o=Number(r.dataset.stevneid),s=k.find(e=>e.kasterid===a)?.hcp??0,c=await U({title:`Sett HCP`,message:`Sett HCP for spelar:`,defaultValue:String(s),inputType:`number`});if(c===null)return;let l=parseInt(c,10);if(isNaN(l)||l<0){e(`Ugyldig HCP-verdi`,`error`);return}let{error:u}=await m(o,a,l);if(u){e(`Feil ved lagring av HCP`,`error`);return}await z(t,i)})});for(let r of T){let a=async()=>{let[a,s]=l(r.spelarar,P),u=[a?.id,s?.id].filter(e=>e!=null),f=u.length?await C(u):!1;f&&!await d({title:`Slett detaljar`,message:`Dette sletter detaljar for denne kampen. Er du sikker?`})||N(a?.kaster?`${o(a.kaster.fornavn)} ${o(a.kaster.etternavn)}`:`—`,s?.kaster?`${o(s.kaster.fornavn)} ${o(s.kaster.etternavn)}`:`—`,M(a),M(s),async(r,o)=>{try{f&&u.length&&await n(u),await Promise.all([a?c(a.id,r):Promise.resolve({error:null}),s?c(s.id,o):Promise.resolve({error:null})])}catch(t){p(`${D.logPrefix}:plusCallback`,t),e(`Feil ved lagring av score`,`error`);return}await z(t,i)})};if(t.querySelector(`#plus-${r.id}`)?.addEventListener(`click`,a),t.querySelector(`#scoreboard-${r.id}`)?.addEventListener(`click`,()=>{window.open(`#/kamp/${r.id}`,`_blank`)}),t.querySelector(`#bekrft-${r.id}`)?.addEventListener(`click`,async e=>{let n=e.currentTarget;n.disabled=!0,n.textContent=`Lagrer…`;try{await V(t,i,r,P,R)||(n.disabled=!1,n.textContent=`Bekreft`)}catch{n.disabled=!1,n.textContent=`Bekreft`}}),X&&r.er_bekreftet){let[n,a]=l(r.spelarar,P),u=n?.kaster?`${o(n.kaster.fornavn)} ${o(n.kaster.etternavn)}`:`—`,d=a?.kaster?`${o(a.kaster.fornavn)} ${o(a.kaster.etternavn)}`:`—`,f=()=>{N(u,d,n?.score_poeng??0,a?.score_poeng??0,async(r,o)=>{let[l,u]=s(r,o);try{await Promise.all([n?c(n.id,r,l):Promise.resolve({error:null}),a?c(a.id,o,u):Promise.resolve({error:null})])}catch(t){p(`${D.logPrefix}:adminReScore`,t),e(`Feil ved lagring av score`,`error`);return}await z(t,i)})};t.querySelectorAll(`[data-endre-score="${r.id}"]`).forEach(e=>e.addEventListener(`click`,f))}let u=t.querySelector(`.kamp-rad-mobil[data-kamp-id="${r.id}"]`);u&&(I?(u.querySelector(`.kamp-rad-mobil__hoved`)?.addEventListener(`click`,()=>{let e=u.dataset.expanded===`true`;t.querySelectorAll(`.kamp-rad-mobil[data-expanded="true"]`).forEach(e=>{e.dataset.expanded=`false`,e.setAttribute(`aria-expanded`,`false`)}),u.dataset.expanded=e?`false`:`true`,u.setAttribute(`aria-expanded`,String(!e))}),t.querySelector(`#m-plus-${r.id}`)?.addEventListener(`click`,e=>{e.stopPropagation(),a()}),t.querySelector(`#m-scoreboard-${r.id}`)?.addEventListener(`click`,e=>{e.stopPropagation(),window.open(`#/kamp/${r.id}`,`_blank`)}),t.querySelector(`#m-bekrft-${r.id}`)?.addEventListener(`click`,async e=>{e.stopPropagation();let n=e.currentTarget;n.disabled=!0,n.textContent=`Lagrer…`,await V(t,i,r,P,R)||(n.disabled=!1,n.textContent=`Bekreft`)})):u.addEventListener(`click`,()=>{window.open(`#/kamp/${r.id}`,`_blank`)}))}B(t,i)}catch(e){p(`${D.logPrefix}.lastOgVis`,e),t.replaceChildren(a(`Kunne ikkje laste innledande fase.`))}}function B(e,t){if(P)return;let n=y(t,[`innledende`],e,z,()=>{P&&=(k(P),null)});P=i(t,D.channelName(t),n)}async function V(n,r,i,a,o={}){let[s,c]=l(i.spelarar,a),u=o[s?.kasterid??-1]??0,d=o[c?.kasterid??-1]??0,{error:f}=await t({kampId:i.id,p1:s?{spelarId:s.id,kasterid:s.kasterid,scorePoeng:s.score_poeng}:null,p2:c?{spelarId:c.id,kasterid:c.kasterid,scorePoeng:c.score_poeng}:null,hcp1:u,hcp2:d,erWalkover:i.er_walkover});return f?(e(`DB-feil ved bekreft`,`error`),!1):(await z(n,r),!0)}return R}function G(e,t,n){return e.er_bekreftet?`ferdig`:n||t?`pagaar`:`ikke-startet`}function K(){return`
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
    </div>`}function J(e,t,n=!0,r={}){let[i,a]=l(e.spelarar,t),s=i?.kasterid?t[i.kasterid]??``:``,c=a?.kasterid?t[a.kasterid]??``:``,u=i?.kaster?`${o(i.kaster.fornavn)} ${o(i.kaster.etternavn)}`:`—`,d=e.er_walkover&&!a?.kaster,f=d?`Walkover`:a?.kaster?`${o(a.kaster.fornavn)} ${o(a.kaster.etternavn)}`:`—`,p=s?`${u} (${s})`:u,m=d?c?`Walkover (${c})`:`Walkover`:c?`${f} (${c})`:f,h=(i?.omgangar?.length??0)>0,g=(a?.omgangar?.length??0)>0,_=h||g,v=r[i?.kasterid??-1]??0,y=r[a?.kasterid??-1]??0,b=e.er_bekreftet?i?.score_poeng??0:M(i)+(h?v:0),x=e.er_bekreftet?a?.score_poeng??0:M(a)+(g?y:0),S=e.er_walkover&&!e.er_bekreftet,C=S?21:b,w=S?0:x,T=e.er_bekreftet||e.er_walkover||_||b>0||x>0,E=G(e,T,_),O=D(e,[i,a].filter(e=>e!=null),_,r),k=n&&e.er_bekreftet&&!e.er_walkover&&!_?` data-endre-score="${e.id}" class="text-center score-redigerbar"`:` class="text-center"`,A;if(e.er_bekreftet)A=`<td class="text-end pe-2"><span class="kamp-bekreftet-indikator">✓ Bekreftet</span></td>`;else if(n){let t=E===`ikke-startet`,n=_,r=O,i=`kamp-knapp${t?` kamp-knapp-primaer`:``}`,a=`kamp-knapp${n?` kamp-knapp-primaer`:``}`,o=`kamp-knapp${r?` kamp-knapp-suksess`:``}`;A=`<td class="text-end pe-2 text-nowrap">
        <button class="${i}" id="plus-${e.id}">+</button>
        <button class="${a}" id="scoreboard-${e.id}" title="Scoreboard">Score</button>
        <button class="${o}" id="bekrft-${e.id}"${O?``:` disabled`}>Bekreft</button>
      </td>`}else A=`<td class="text-end pe-2">
        <button class="kamp-knapp" id="scoreboard-${e.id}" title="Scoreboard">Score</button>
      </td>`;return`
    <tr class="kamp-rad-desktop" data-status="${E}">
      <td class="text-center">${e.bane_nummer??``}</td>
      <td>${p}</td>
      <td${k}>${T?C:`—`}</td>
      <td${k}>${T?w:`—`}</td>
      <td>${m}</td>
      ${A}
    </tr>`}function Y(e,t,n,r={}){let[i,a]=l(e.spelarar,t),s=i?.kaster?`${o(i.kaster.fornavn)} ${o(i.kaster.etternavn.charAt(0))}.`:`—`,c=e.er_walkover&&!a?.kaster?`Walkover`:a?.kaster?`${o(a.kaster.fornavn)} ${o(a.kaster.etternavn.charAt(0))}.`:`—`,u=(i?.omgangar?.length??0)>0,d=(a?.omgangar?.length??0)>0,f=u||d,p=r[i?.kasterid??-1]??0,m=r[a?.kasterid??-1]??0,h=e.er_bekreftet?i?.score_poeng??0:M(i)+(u?p:0),g=e.er_bekreftet?a?.score_poeng??0:M(a)+(d?m:0),_=e.er_walkover&&!e.er_bekreftet,v=_?21:h,y=_?0:g,b=e.er_bekreftet||e.er_walkover||f||h>0||g>0,x=G(e,b,f),S=b?`${v}–${y}`:`—`,C=``;if(n){let t=D(e,[i,a].filter(e=>e!=null),f,r),n=e.er_bekreftet?`<span class="kamp-bekreftet-mobil">✓ Bekreftet</span>`:`<button class="kamp-knapp-mobil kamp-knapp-bekreft-mobil" id="m-bekrft-${e.id}"${t?``:` disabled`}>Bekreft</button>`;C=`
      <div class="kamp-mobil-knapper">
        <button class="kamp-knapp-mobil" id="m-plus-${e.id}"${e.er_bekreftet?` disabled`:``}>+ Resultat</button>
        <button class="kamp-knapp-mobil" id="m-scoreboard-${e.id}">Score</button>
        ${n}
      </div>`}return`
    <li class="kamp-rad-mobil${n?``:` kamp-rad-mobil--viewer`}" data-kamp-id="${e.id}" data-status="${x}" role="button" tabindex="0">
      <div class="kamp-rad-mobil__hoved">
        <span class="kamp-mobil-bane">${e.bane_nummer??``}</span>
        <span class="kamp-mobil-namn">${s} vs ${c}</span>
        <span class="kamp-mobil-resultat">${S}</span>
      </div>
      ${C}
    </li>`}export{W as t};