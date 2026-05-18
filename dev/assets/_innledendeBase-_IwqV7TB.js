import{C as e,D as t,F as n,G as r,H as i,L as a,M as o,N as s,P as c,T as l,U as u,V as d,W as f,_ as p,a as m,b as h,d as g,f as _,g as v,h as y,i as b,j as x,k as S,l as C,p as w,s as T,u as E,v as D,x as O,y as k}from"./index-BdH-Y53h.js";import{t as A}from"./ScoreNumberpad-DYEk7r3I.js";var j=null,M=null,N=null,P=null;function F(){return j||(j=document.createElement(`div`),j.className=`modal`,j.style.display=`none`,j.setAttribute(`role`,`dialog`),j.setAttribute(`aria-modal`,`true`),j.setAttribute(`aria-labelledby`,`pd-title`),j.innerHTML=`
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
  `,document.body.appendChild(j),j.querySelector(`#pd-cancel`).addEventListener(`click`,()=>{z(null)}),j.querySelector(`#pd-confirm`).addEventListener(`click`,()=>{R()}),j.querySelector(`#pd-input`).addEventListener(`keydown`,e=>{e.key===`Enter`&&(e.preventDefault(),R())}),j)}function I(e){M=document.createElement(`div`),M.className=`modal-backdrop show`,document.body.appendChild(M),document.body.classList.add(`modal-open`),e.style.display=`block`,e.classList.add(`show`),e.querySelector(`#pd-input`)?.focus(),P=e=>{e.key===`Escape`&&(e.preventDefault(),z(null))},document.addEventListener(`keydown`,P)}function L(e){e.classList.remove(`show`),e.style.display=`none`,M?.remove(),M=null,document.body.classList.remove(`modal-open`),P&&=(document.removeEventListener(`keydown`,P),null)}function R(){z(j?.querySelector(`#pd-input`)?.value??``)}function z(e){if(!j||!N)return;let t=N;N=null,L(j),t(e)}function B(e){let{title:t,message:n,defaultValue:r=``,inputType:i=`text`}=e,a=F();a.querySelector(`#pd-title`).textContent=t,a.querySelector(`#pd-message`).textContent=n;let o=a.querySelector(`#pd-input`);return o.type=i,o.value=r,new Promise(e=>{N=e,I(a)})}function V(C){let j=null,M=null,N=!1,P=new Set;async function F(e,{id:t,isAdmin:n=!1},r=null){M=r,N=n,C.onReset?.(),j&&=(await h(j),null),e.replaceChildren(u(`Laster…`)),await I(e,t)}async function I(e,o){try{let[{data:u},{data:h},{data:w}]=await Promise.all([a(o),t(o),b(o)]);if(!u){e.replaceChildren(f(`Stevne ikkje funne.`));return}let j=Object.fromEntries(w.filter(e=>e.kasterid!=null).map(e=>[e.kasterid,e.startnummer??0])),F=Object.fromEntries(w.filter(e=>e.kasterid!=null&&(e.hcp??0)>0).map(e=>[e.kasterid,e.hcp??0])),z=new Map;for(let e of h)z.has(e.runde_nummer)||z.set(e.runde_nummer,[]),z.get(e.runde_nummer).push(e);let{spelMap:V,ekteKasterids:U}=_(h,j),W=D(Object.values(V).filter(e=>U.has(e.kasterid)).map(e=>({...e,hcp:w.find(t=>t.kasterid===e.kasterid)?.hcp??0})),h),G=h.length>0&&h.every(e=>e.er_bekreftet),K=N&&u.stevne_fase!==`avsluttende`,q={container:e,stevneid:o,stevne:u,alleKamper:h,rundeMap:z,startnrMap:j,stilling:W,isAdmin:N,erAlleKamperBekreftet:G,reload:()=>I(e,o)};M&&(M.innerHTML=(N?v(u,C.erSwiss):``)+C.getBannerExtra(q),C.bindBannerExtra(M,q),M.querySelector(`#fullfør-turnering-btn`)?.addEventListener(`click`,async()=>{if(!await O({title:`Fullfør turnering`,message:`Vil du fullføre turneringa? Dette kan ikkje angrast.`,danger:!0}))return;let{error:t}=await d(o);if(t){k(`Feil ved lagring`,`error`);return}await I(e,o)}),M.querySelector(`#test-autofullfør-btn`)?.addEventListener(`click`,async t=>{let n=t.currentTarget;await O({title:`Autofullfør kampar`,message:`Autofullfør alle ubekreftede innledande kampar?`})&&(n.disabled=!0,await T(o),await I(e,o))}));let J=[...(C.filterRundar??(e=>e))(z).entries()].map(([e,t])=>H(e,t,j,K,F)).join(``),Y=N||W.some(e=>(e.hcp??0)>0);e.innerHTML=y(J,p(W,h,j,{tableId:`stilling-innl`,isAdmin:N,stevneid:o,harHcp:Y,harAntallKamper:!0})),g(e),E(e,`stilling-innl`,P),N&&e.querySelectorAll(`.stilling-hcp-celle`).forEach(t=>{t.addEventListener(`click`,async t=>{t.stopPropagation();let n=t.currentTarget,r=Number(n.dataset.kasterid),i=Number(n.dataset.stevneid),a=w.find(e=>e.kasterid===r)?.hcp??0,s=await B({title:`Sett HCP`,message:`Sett HCP for spelar:`,defaultValue:String(a),inputType:`number`});if(s===null)return;let c=parseInt(s,10);if(isNaN(c)||c<0){k(`Ugyldig HCP-verdi`,`error`);return}let{error:l}=await m(i,r,c);if(l){k(`Feil ved lagring av HCP`,`error`);return}await I(e,o)})});for(let t of h)if(e.querySelector(`#plus-${t.id}`)?.addEventListener(`click`,async()=>{let[a,s]=c(t.spelarar,j),u=[a?.id,s?.id].filter(e=>e!=null),d=u.length?await l(u):!1;d&&!await O({title:`Slett detaljar`,message:`Dette sletter detaljar for denne kampen. Er du sikker?`})||A(a?.kaster?`${i(a.kaster.fornavn)} ${i(a.kaster.etternavn)}`:`—`,s?.kaster?`${i(s.kaster.fornavn)} ${i(s.kaster.etternavn)}`:`—`,n(a),n(s),async(t,n)=>{try{d&&u.length&&await x(u),await Promise.all([a?S(a.id,t):Promise.resolve({error:null}),s?S(s.id,n):Promise.resolve({error:null})])}catch(e){r(`${C.logPrefix}:plusCallback`,e),k(`Feil ved lagring av score`,`error`);return}await I(e,o)})}),e.querySelector(`#scoreboard-${t.id}`)?.addEventListener(`click`,()=>{window.open(`#/kamp/${t.id}`,`_blank`)}),e.querySelector(`#bekrft-${t.id}`)?.addEventListener(`click`,()=>R(e,o,t,j,F)),K&&t.er_bekreftet){let[n,a]=c(t.spelarar,j),l=n?.kaster?`${i(n.kaster.fornavn)} ${i(n.kaster.etternavn)}`:`—`,u=a?.kaster?`${i(a.kaster.fornavn)} ${i(a.kaster.etternavn)}`:`—`,d=()=>{A(l,u,n?.score_poeng??0,a?.score_poeng??0,async(t,i)=>{let[c,l]=s(t,i);try{await Promise.all([n?S(n.id,t,c):Promise.resolve({error:null}),a?S(a.id,i,l):Promise.resolve({error:null})])}catch(e){r(`${C.logPrefix}:adminReScore`,e),k(`Feil ved lagring av score`,`error`);return}await I(e,o)})};e.querySelectorAll(`[data-endre-score="${t.id}"]`).forEach(e=>e.addEventListener(`click`,d))}L(e,o)}catch(t){r(`${C.logPrefix}.lastOgVis`,t),e.replaceChildren(f(`Kunne ikkje laste innledande fase.`))}}function L(e,t){if(j)return;let n=w(t,[`innledende`],e,I,()=>{j&&=(h(j),null)});j=o(t,C.channelName(t),n)}async function R(t,n,r,i,a={}){let[o,s]=c(r.spelarar,i),l=a[o?.kasterid??-1]??0,u=a[s?.kasterid??-1]??0,{error:d}=await e({kampId:r.id,p1:o?{spelarId:o.id,kasterid:o.kasterid,scorePoeng:o.score_poeng}:null,p2:s?{spelarId:s.id,kasterid:s.kasterid,scorePoeng:s.score_poeng}:null,hcp1:l,hcp2:u,erWalkover:r.er_walkover});if(d){k(`DB-feil ved bekreft`,`error`);return}await I(t,n)}return F}function H(e,t,n,r,i={}){return`
    <div class="mb-3">
      <h6 class="text-center fw-bold mb-1">Runde ${e}</h6>
      <table class="table table-bordered table-sm mb-0 bg-white">
        <thead class="org-thead">
          <tr>
            <th class="th-36 text-center">B</th>
            <th>P1</th>
            <th class="th-48 text-center">S1</th>
            <th class="th-48 text-center">S2</th>
            <th>P2</th>
            ${r?`<th class="th-148"></th>`:`<th class="th-48"></th>`}
          </tr>
        </thead>
        <tbody>
          ${t.map(e=>U(e,n,r,i)).join(``)}
        </tbody>
      </table>
    </div>`}function U(e,t,r=!0,a={}){let[o,s]=c(e.spelarar,t),l=o?.kasterid?t[o.kasterid]??``:``,u=s?.kasterid?t[s.kasterid]??``:``,d=o?.kaster?`${i(o.kaster.fornavn)} ${i(o.kaster.etternavn)}`:`—`,f=e.er_walkover&&!s?.kaster,p=f?`Walkover`:s?.kaster?`${i(s.kaster.fornavn)} ${i(s.kaster.etternavn)}`:`—`,m=l?`${d} (${l})`:d,h=f?u?`Walkover (${u})`:`Walkover`:u?`${p} (${u})`:p,g=(o?.omgangar?.length??0)>0,_=(s?.omgangar?.length??0)>0,v=g||_,y=a[o?.kasterid??-1]??0,b=a[s?.kasterid??-1]??0,x=e.er_bekreftet?o?.score_poeng??0:n(o)+(g?y:0),S=e.er_bekreftet?s?.score_poeng??0:n(s)+(_?b:0),w=e.er_walkover&&!e.er_bekreftet,T=w?21:x,E=w?0:S,D=e.er_bekreftet||e.er_walkover||v||x>0||S>0,O=C(e,[o,s].filter(e=>e!=null),v,a),k=e.er_bekreftet?`btn-secondary`:O?`btn-success`:`btn-outline-secondary`,A=e.er_bekreftet?`Bekreftet`:`Bekreft`,j=e.er_bekreftet||!O?` disabled`:``,M=e.er_bekreftet&&!v?` disabled`:``,N=r&&e.er_bekreftet&&!e.er_walkover&&!v?` data-endre-score="${e.id}" class="text-center score-redigerbar"`:` class="text-center"`;return`
    <tr>
      <td class="text-center">${e.bane_nummer??``}</td>
      <td>${m}</td>
      <td${N}>${D?T:``}</td>
      <td${N}>${D?E:``}</td>
      <td>${h}</td>
      <td class="text-end pe-2 text-nowrap">
        ${r?`<button class="btn btn-primary btn-sm" id="plus-${e.id}"${e.er_bekreftet?` disabled`:``}>+</button>`:``}
        <button class="btn btn-secondary btn-sm" id="scoreboard-${e.id}" data-bane="${e.bane_nummer??``}" title="Scoreboard"${M}>S</button>
        ${r?`<button class="btn ${k} btn-sm btn-bekreft" id="bekrft-${e.id}"${j}>${A}</button>`:``}
      </td>
    </tr>`}export{V as t};