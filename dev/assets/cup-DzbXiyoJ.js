import{n as e,t}from"./logError-BO7RC_Nh.js";import{A as n,Et as r,It as i,Mt as a,O as o,Pt as s,_ as c,jt as l,k as u,s as d,ut as f}from"./index-CFlkG31m.js";import{t as p}from"./LoadingState-C6NB62Ct.js";import{i as m}from"./kastemetode-Dor3Q-Ix.js";import{D as h,M as g,P as _,S as v,_ as y,b,g as x,n as S,o as C,r as w,t as T,w as E}from"./kampService-ZDYne52X.js";import{n as D}from"./navigation-CLFdaq7c.js";import{A as O,C as k,D as A,O as j,S as M,T as ee,_ as N,b as te,c as ne,g as re,h as P,k as ie,s as F,u as ae,v as oe,w as se,y as ce}from"./omgangValidation-BDFoTG-4.js";import{l as le}from"./xkastKongelagService-C6PGJsxd.js";import{n as I}from"./ScoreNumberpad-BqTXeh5F.js";import{n as ue,t as L}from"./scoreEditor-BNEgmk30.js";function R(e){let t=[...e];for(let e=t.length-1;e>0;e--){let n=Math.floor(Math.random()*(e+1));[t[e],t[n]]=[t[n],t[e]]}return t}function z(e){return e===2||e===4?!0:e<2?!1:e%3==0?z(Math.floor(e/3)*2):e%2==0&&z(e/2)}function B(e){return e%3==0?{c3:e/3,c2:0}:e%2==0?{c3:0,c2:e/2}:{c3:0,c2:0}}function V(e){if(e<2)return[];let t=[],n=Math.floor(e/2);for(let r=e%3;r<=n&&r<=3&&t.filter(e=>e.c2===0).length<2;r+=3){let n=(e-r)/3;if(n<1)break;z(r+2*n)&&t.push({walkovers:r,c3:n,c2:0})}for(let r=e%2;r<=n&&r<=3&&t.filter(e=>e.c3===0).length<2;r+=2){let n=(e-r)/2;if(n<1)break;let i=r+n;!t.some(e=>e.walkovers===r&&e.c3===0&&e.c2===n)&&z(i)&&t.push({walkovers:r,c3:0,c2:n})}return t.sort((e,t)=>e.walkovers-t.walkovers||t.c3-e.c3),t}function H(e){return e===2||V(e).length>0}function de(e){let t=Math.ceil(e*.5),n=Math.round(e*.8),r=[];for(let i=n;i>=t;i--){let t=e-i;t>=2&&H(i)&&H(t)&&r.push({nA:i,nB:t})}return r}function fe(e,{runde1:t=null,walkovers1:n=null}={}){let r=[],i=e,a=1,o=!0;for(;i>2;){let e,s,c;if(o){let r=t;!r&&n!==null&&(r={walkovers:n,c3:Math.floor((i-n)/3),c2:0}),r||=V(i)[0]??{walkovers:i%3,c3:Math.floor(i/3),c2:0},c=r.walkovers,e=r.c3,s=r.c2,o=!1}else{let t=B(i);e=t.c3,s=t.c2,c=0}let l=e*2+s+c;r.push({runde:a,players:i,lanes:e+s,threePlayers:e>0,walkovers:c,advancing:l}),i=l,a++}return r}function U(e,{medSeeding:t=!0,isRunde1:n=!1,walkoverTall:r=null,runde1Oppsett:i=null,shuffleFn:a}={}){let o=a??R,s=[],c=[...e];if(n){let e=i?.walkovers??r??c.length%3;if(e>0){let t=c.slice(0,e);c=c.slice(e);for(let e of t)s.push({players:[e.kasterid],isWalkover:!0,isThreePlayers:!1})}}let l=c.length,u,d;if(i&&n)u=i.c3,d=i.c2;else if(n)u=Math.floor(l/3),d=0;else{let e=B(l);u=e.c3,d=e.c2}let f=u+d;if(t&&f>0){let e=o(c.slice(0,f)),t=o(c.slice(f,2*f)),n=o(c.slice(2*f)),r=0;for(let i=0;i<f;i++){let a=i<u,o=[e[i],t[i]].filter(e=>e!=null),c=a?n[r]:void 0;c&&(o.push(c),r++),s.push({players:o.map(e=>e.kasterid),isWalkover:!1,isThreePlayers:a})}}else{let e=o(c),t=0;for(let n=0;n<u;n++)s.push({players:e.slice(t,t+3).map(e=>e.kasterid),isWalkover:!1,isThreePlayers:!0}),t+=3;for(let n=0;n<d;n++)s.push({players:e.slice(t,t+2).map(e=>e.kasterid),isWalkover:!1,isThreePlayers:!1}),t+=2}return s}function W(e,{showPlayerList:t=!0,initNa:n=null,initFormat:r=null}={}){let i=typeof e==`number`?e:e.length,a=typeof e==`number`?[]:e.map((e,t)=>({...e,cupPlassering:t+1})),o=de(i),s=n===i?i:n!=null&&o.some(e=>e.nA===n)?n:o[0]?.nA??i,c=i-s,l=o.filter(e=>V(e.nA).some(e=>e.c3>0)),u=o.filter(e=>!V(e.nA).some(e=>e.c3>0)),d=V(i).length>0,f=(e,t)=>e.map((e,r)=>{let a=e.nA===s&&n!==i,o=t+r;return`
      <div class="form-check">
        <input class="form-check-input" type="radio" name="group-split" id="split-${o}" value="${e.nA}" ${a?`checked`:``}>
        <label class="form-check-label" for="split-${o}">A:${e.nA} — B:${e.nB}</label>
      </div>`}).join(``),p=[];l.length&&p.push(`<div class="text-muted small fw-semibold mb-1">3 spillere per bane (A)</div>${f(l,0)}`),u.length&&(p.length&&p.push(`<hr class="my-2">`),p.push(`<div class="text-muted small fw-semibold mb-1">2 spillere per bane (A)</div>${f(u,l.length)}`)),d&&(p.length&&p.push(`<hr class="my-2">`),p.push(`
      <div class="form-check">
        <input class="form-check-input" type="radio" name="group-split" id="split-none" value="${i}" ${n===i?`checked`:``}>
        <label class="form-check-label" for="split-ingen">Alle i A</label>
      </div>`));let m=p.join(``),h=r?.A??V(s)[0]??null,g=c>=2?r?.B??V(c)[0]??null:null,_=t?`<div id="group-preview">${G(a,s,h?.walkovers??0,g?.walkovers??0)}</div>`:``;return`
    <div id="group-assignment-wrapper" data-n="${i}">
      <h5 class="mb-3">Velg gruppefordeling for cup</h5>
      <div class="d-flex group-layout gap-3 align-items-start mb-3">
        <div class="card">
          <div class="card-body">
            ${m}
          </div>
        </div>
        <div id="group-panels" class="d-flex gap-3 flex-wrap">
          <div id="group-panel-a" class="final-group-col">
            ${q(`Gruppe A`,s,`round1-format-a`,h)}
          </div>
          ${c>=2?`<div id="group-panel-b" class="final-group-col">
            ${q(`Gruppe B`,c,`round1-format-b`,g)}
          </div>`:``}
        </div>
      </div>
      ${_}
      <div class="confirm-banner">
        <button id="confirm-group-btn" class="btn btn-success btn-lg w-100">Bekreft gruppefordeling</button>
      </div>
    </div>
  `}function G(e,t,n=0,r=0){let i=e.slice(0,t),a=e.slice(t),o=e.some(e=>e.poeng_xkast!=null);function s(e,t=0){return e.map((e,n)=>{let r=n<t,i=o?e.antall_ring_xkast??0:e.kamp_poeng??0,a=o?e.poeng_xkast??0:e.score_poeng??0;return`
      <tr>
        <td>${e.cupPlassering}</td>
        <td>${d(e.navn??``)}${r?` <span class="badge bg-info text-dark">Walkover</span>`:``}</td>
        <td class="text-center">${i}</td>
        <td class="text-center">${a}</td>
      </tr>`}).join(``)}let c=`
    <thead class="org-thead"><tr>
      <th class="th-32">#</th><th>NAMN</th>
      <th class="th-44 text-center">${o?`R`:`KP`}</th>
      <th class="th-44 text-center">${o?`X`:`SP`}</th>
    </tr></thead>`,l=`
    <table class="table table-bordered table-sm bg-white mb-0">
      ${c}
      <tbody>${s(i,n)}</tbody>
    </table>`,u=a.length?`
    <table class="table table-bordered table-sm bg-white mb-0">
      ${c}
      <tbody>${s(a,r)}</tbody>
    </table>`:``;return`
    <div class="d-flex gap-3 flex-wrap">
      <div class="avsl-gruppe-kol">
        <h6 class="fw-bold text-center">GRUPPE A (${i.length})</h6>
        ${l}
      </div>
      ${a.length?`<div class="avsl-gruppe-kol">
        <h6 class="fw-bold text-center">GRUPPE B (${a.length})</h6>
        ${u}
      </div>`:``}
    </div>`}function pe(e){let t=e.c3>0?3:2;return`${e.walkovers} walkover - ${t} deltakere per bane`}function me(e,t,n,r=null){let i=V(t);return i.length<=1?``:`<div class="d-flex flex-column align-items-start gap-1 mb-2">${i.map((e,t)=>{let i=`${n}-${t}`,a=JSON.stringify(e),o=r?e.walkovers===r.walkovers&&e.c3===r.c3&&e.c2===r.c2:t===0,s=e.c3>0?`btn-outline-success`:`btn-outline-warning`;return`
      <input type="radio" class="btn-check" name="${n}" id="${i}"
        value='${a}' data-oppsett='${a}' autocomplete="off" ${o?`checked`:``}>
      <label class="btn btn-sm ${s}" for="${i}">${pe(e)}</label>`}).join(``)}</div>`}function K(e,t,n){return`<div id="structure-${n}">
    <table class="table table-sm table-bordered mb-0">
      <thead><tr>
        <th>Runde</th><th>Deltakere</th><th>Baner</th><th>Per bane</th>
      </tr></thead>
      <tbody>${(e>=2?fe(e,{runde1:t}):[]).map((e,n)=>{let r=e.walkovers??0,i=e.players-r,a=r>0?`${i} <span class="text-muted">(${r} w.o.)</span>`:`${i}`,o;return o=n===0&&t?t.c3>0&&t.c2>0?`2/3`:t.c3>0?`3`:`2`:e.players%e.lanes===0?String(e.players/e.lanes):`2/3`,`<tr${e.threePlayers?` class="fw-bold"`:``}>
      <td>${e.runde}</td>
      <td>${a}</td>
      <td>${e.lanes}</td>
      <td>${o}</td>
    </tr>`}).join(``)}</tbody>
    </table>
  </div>`}function q(e,t,n,r){let i=n.slice(-1),a=me(e,t,n,r);return`
    <div class="card">
      <div class="card-body">
        <h6 class="fw-bold mb-2">${a?`${e}: Velg format`:`${e} (${t})`}</h6>
        ${a}
        ${K(t,r,i)}
      </div>
    </div>`}function J(){return crypto.randomUUID()}async function Y(t){let{data:n,error:r}=await e.from(`resultat`).select(`kasterid, startnummer, posisjon`).eq(`stevneid`,t);if(r)throw Error(`Feil ved henting av resultat: `+r.message);let i={},a={};for(let e of n??[])e.kasterid!=null&&e.startnummer!=null&&(i[e.kasterid]=e.startnummer,(a[e.startnummer]??=[]).push({kasterid:e.kasterid,posisjon:e.posisjon}));let o={};for(let[e,t]of Object.entries(a))t.sort((e,t)=>(e.posisjon??1/0)-(t.posisjon??1/0)||e.kasterid-t.kasterid),o[Number(e)]=t.map(e=>e.kasterid);return{kasteridToSnr:i,snrToMembers:o}}function he(e,t){let n=e.kasteridToSnr[t];return(n==null?void 0:e.snrToMembers[n])??[t]}function ge(e,t,n,r,i,a=0,o=null,s=J){let c=a;return t.map(t=>({match:{match_id:s(),stevneid:e,fase:`avsluttende`,runde_nummer:n,gruppe_navn:r??null,bane_nummer:t.isWalkover?null:++c,er_bekreftet:t.isWalkover,er_walkover:t.isWalkover,er_tre_spelarar:t.isThreePlayers,runde_navn:o},playerKasterids:t.players.flatMap(e=>he(i,Number(e)))}))}async function X(t){if(t.length===0)return 0;let n=t.map(e=>({match_id:e.match.match_id,stevneid:e.match.stevneid,fase:e.match.fase,runde_nummer:e.match.runde_nummer,gruppe_navn:e.match.gruppe_navn??null,bane_nummer:e.match.bane_nummer??null,er_bekreftet:e.match.er_bekreftet??!1,er_walkover:e.match.er_walkover??!1,er_tre_spelarar:e.match.er_tre_spelarar??!1,runde_navn:e.match.runde_navn??null,players:e.playerKasterids.map(e=>({kasterid:e}))})),{data:r,error:i}=await e.rpc(`insert_avsluttende_matches`,{p_matches:n});if(i)throw Error(`Feil ved innsetting av cup-kampar: `+i.message);return r??0}async function _e(e,t,n,r,i,a=0,o=null){return X(ge(e,t,n,r,i,a,o))}function ve(e,t,n){if(!e||!t)return 0;let r=n.indexOf(t),i=0;for(let t of n.slice(0,r)){let n=e[t];n&&(i+=(n.c3??0)+(n.c2??0))}return i}async function ye(e,t,n,r=null){let i=[`A`,`B`,`C`],a=await Y(e),o=await Z(e,1),s=[];for(let c of t){let t=U(c.spelarar,{medSeeding:n,isRunde1:!0,runde1Oppsett:c.runde1Oppsett??null}),l=Math.max(o,ve(r,c.groupName,i)),u=c.spelarar.length===4,d=ge(e,t,1,c.groupName,a,l,u?`Semifinale`:null);s.push(...d);for(let{match:e}of d)e.bane_nummer!=null&&e.bane_nummer>o&&(o=e.bane_nummer)}return X(s)}async function Z(t,n){let{data:r}=await e.from(`kamp`).select(`bane_nummer`).eq(`stevneid`,t).eq(`fase`,`avsluttende`).eq(`runde_nummer`,n).not(`bane_nummer`,`is`,null).order(`bane_nummer`,{ascending:!1}).limit(1);return r?.[0]?.bane_nummer??0}async function be(t,n,r,i){let{data:a}=await e.from(`kamp`).select(`runde_nummer`).eq(`stevneid`,t).eq(`fase`,`avsluttende`).eq(`gruppe_navn`,n).order(`runde_nummer`,{ascending:!1}).limit(1),o=(a?.[0]?.runde_nummer??0)+1,s=i.length===4,c=U(i,{medSeeding:r,isRunde1:!1}),l=await Z(t,o);return{roundNumber:o,matchCount:await _e(t,c,o,n,await Y(t),l,s?`Semifinale`:null)}}async function xe(t,n){let{data:r}=await e.from(`kamp`).select(`id, runde_nummer, spelarar:kamp_spelar(id, kasterid, score_poeng, omgangar:kamp_omgang(score))`).eq(`stevneid`,t).eq(`fase`,`avsluttende`).eq(`gruppe_navn`,n).eq(`runde_navn`,`Semifinale`).eq(`er_bekreftet`,!0);if(!r?.length)throw Error(`Semifinalane er ikkje bekrefta.`);let i=await Y(t),a=r,o=a[0].runde_nummer+1,s=[],c=[];for(let e of a){let t=new Map;for(let n of e.spelarar??[]){if(n.kasterid==null)continue;let e=i.kasteridToSnr[n.kasterid]??`kaster-${n.kasterid}`,r=t.get(e)??{kasterids:[],score:0};r.kasterids.push(n.kasterid),r.score+=n.omgangar?.length?n.omgangar.reduce((e,t)=>e+(t.score??0),0):n.score_poeng??0,t.set(e,r)}let n=[...t.values()].sort((e,t)=>t.score-e.score);n[0]&&s.push(n[0].kasterids),n[1]&&c.push(n[1].kasterids)}let l=await Z(t,o);await X([{match:{match_id:J(),stevneid:t,fase:`avsluttende`,runde_nummer:o,gruppe_navn:n,bane_nummer:l+1,runde_navn:`Finale`,er_bekreftet:!1,er_walkover:!1,er_tre_spelarar:!1},playerKasterids:s.flat()},{match:{match_id:J(),stevneid:t,fase:`avsluttende`,runde_nummer:o,gruppe_navn:n,bane_nummer:l+2,runde_navn:`Bronsefinale`,er_bekreftet:!1,er_walkover:!1,er_tre_spelarar:!1},playerKasterids:c.flat()}])}function Se(e,n,r,i,a,o){let s=r.filter(e=>e.runde_eliminert==null),c=r.length,l=s.length,f=r.some(e=>e.poeng_xkast!=null),p=e=>f?`${e.poeng_xkast??0}p (${e.antall_ring_xkast??0})`:`${e.kamp_poeng??0}p (${e.score_poeng??0})`,m=i===1?a?.[n]??null:null,h=m?.walkovers??0,g=(m?m.c3:l%3==0?l/3:0)+(m?m.c2:l%3==0?0:l/2),_=s.slice(h,h+g),v=s.slice(h+g,h+2*g),y=s.slice(h+2*g),b=document.createElement(`div`);b.className=`final-dialog-overlay`,document.body.appendChild(b);let x=null,S=!1,C=0,w=0;function T(e){if(!S)return;let t=b.querySelector(`.final-dialog-card-wide`);if(!t)return;let n=e.clientX-C,r=e.clientY-w;x={left:n,top:r},t.style.left=`${n}px`,t.style.top=`${r}px`}function E(){S&&(S=!1,document.body.style.userSelect=``)}document.addEventListener(`mousemove`,T),document.addEventListener(`mouseup`,E);function D(){document.removeEventListener(`mousemove`,T),document.removeEventListener(`mouseup`,E)}function O(e){return`<div class="d-flex justify-content-between gap-2 py-1">
      <span class="small">${d(e.navn??``)}</span>
      <span class="small text-muted text-nowrap">${p(e)}</span>
    </div>`}function k(r){let f=s.slice(0,h),T=f.length>0?`<div class="mb-3">
          <strong class="d-block mb-1">Walkovers (går vidare utan kamp):</strong>
          ${f.map(O).join(``)}
        </div>`:``,E=r===!0&&g>0?`<div class="alert alert-info small mb-3 py-2">
          Dette er seedinggrupper, ikkje kampar. Spelarar i same gruppe kan ikkje trekkast mot kvarandre. Kampane blir oppretta når du klikkar «Bekreft og opprett kampar».
        </div>`:``,A=r===!0&&g>0?`<div class="d-flex gap-3 flex-wrap mb-3">
          ${[{label:`Seeding 1`,pool:_},{label:`Seeding 2`,pool:v},...y.length?[{label:`Seeding 3`,pool:y}]:[]].map(({label:e,pool:t})=>`
            <div class="card flex-grow-1">
              <div class="card-body p-2">
                <strong class="d-block mb-2 small text-uppercase">${d(e)}</strong>
                ${t.map(O).join(``)}
              </div>
            </div>`).join(``)}
        </div>`:`<div class="final-player-columns mb-3">
          ${s.slice(h).map((e,t)=>`
            <div class="small d-flex justify-content-between gap-2">
              <span>${h+t+1}. ${d(e.navn??``)}</span>
              <span class="text-muted text-nowrap">${p(e)}</span>
            </div>`).join(``)}
        </div>`;b.innerHTML=`
      <div class="card final-dialog-card-wide">
        <div class="final-dialog-drag-handle">
          <p class="text-muted small text-uppercase fw-semibold mb-1">Trekning</p>
          <h5 class="mb-1">Gruppe ${d(n)} — Runde ${i}</h5>
          <p class="text-muted small mb-0">${l} av ${c} spelarar igjen</p>
        </div>
        <div class="final-dialog-body">
          <div class="mb-3">
            <span class="form-label fw-semibold d-block mb-1">Bruk seeding</span>
            <div class="form-check form-check-inline">
              <input class="form-check-input" type="radio" name="seeding-dlg" id="seeding-ja" value="ja" ${r===!0?`checked`:``}>
              <label class="form-check-label" for="seeding-ja">Ja</label>
            </div>
            <div class="form-check form-check-inline">
              <input class="form-check-input" type="radio" name="seeding-dlg" id="seeding-nei" value="nei" ${r===!1?`checked`:``}>
              <label class="form-check-label" for="seeding-nei">Nei</label>
            </div>
          </div>
          ${E}
          ${T}
          ${A}
        </div>
        <div class="final-dialog-footer">
          <div class="d-flex gap-2">
            <button id="bekreft-gen-btn" class="btn btn-primary" ${r===null?`disabled`:``}>Bekreft og opprett kampar</button>
            <button id="avbryt-gen-btn" class="btn btn-secondary">Avbryt</button>
          </div>
        </div>
      </div>`;let j=b.querySelector(`.final-dialog-card-wide`);x&&(j.style.position=`fixed`,j.style.left=`${x.left}px`,j.style.top=`${x.top}px`,j.style.margin=`0`,j.style.zIndex=`10000`),j.querySelector(`.final-dialog-drag-handle`).addEventListener(`mousedown`,e=>{let t=j.getBoundingClientRect();j.style.position=`fixed`,j.style.left=`${t.left}px`,j.style.top=`${t.top}px`,j.style.margin=`0`,j.style.zIndex=`10000`,C=e.clientX-t.left,w=e.clientY-t.top,x={left:t.left,top:t.top},S=!0,document.body.style.userSelect=`none`}),b.querySelector(`#seeding-ja`).addEventListener(`change`,()=>k(!0)),b.querySelector(`#seeding-nei`).addEventListener(`change`,()=>k(!1)),b.querySelector(`#avbryt-gen-btn`).addEventListener(`click`,()=>{D(),b.remove()}),b.querySelector(`#bekreft-gen-btn`).addEventListener(`click`,async()=>{if(r===null)return;let c=b.querySelector(`#bekreft-gen-btn`);c.disabled=!0,c.textContent=`Lagrer…`;try{let t=s.map((e,t)=>({kasterid:e.kasterid,plassering:t+1}));if(i===1){let i={A:a?.A??void 0,B:a?.B??void 0};await ye(e,[{groupName:n,spelarar:t,runde1Oppsett:m}],r,a?i:null)}else await be(e,n,r,t);D(),b.remove(),await o()}catch(e){t(`cup:genererRunde`,e),u(`Feil ved generering av runde`,`error`),c.disabled=!1,c.textContent=`Bekreft og opprett kampar`}})}k(null)}function Ce(e,t,n,r){let i=t.map(e=>O(e,!1)),a=[],o=document.createElement(`div`);o.className=`final-dialog-overlay`,document.body.appendChild(o);function s(){let c=a.length===2?t.find(e=>!a.includes(e.rep.kasterid)):null;o.innerHTML=`
      <div class="card p-4 final-dialog-card">
        <h5 class="card-title mb-1">Bekreft 3-spelar kamp</h5>
        <p class="text-muted small mb-3">Vel dei to som går vidare. Den gjenverande er utslått.</p>
        <div class="d-flex flex-column gap-2 mb-3">
          ${t.map((e,t)=>{let n=a.indexOf(e.rep.kasterid),r=n!==-1,o=!!c&&c.rep.kasterid===e.rep.kasterid,s=n===0?`1. plass`:n===1?`2. plass`:``;return`<button
              class="btn ${r?`btn-success`:o?`btn-outline-danger`:`btn-outline-secondary`} text-start d-flex justify-content-between align-items-center"
              data-kasterid="${e.rep.kasterid}"
              ${o?`disabled`:``}
            ><span>${i[t]}</span>${s?`<span class="badge bg-success-subtle text-success-emphasis">${s}</span>`:o?`<span class="badge bg-danger">Utslått</span>`:``}</button>`}).join(``)}
        </div>
        <div class="d-flex gap-2">
          <button id="bekreft-tre-btn" class="btn btn-success" ${a.length===2?``:`disabled`}>Bekreft</button>
          <button id="avbryt-tre-btn" class="btn btn-secondary">Avbryt</button>
        </div>
      </div>
    `,o.querySelector(`#avbryt-tre-btn`).addEventListener(`click`,()=>o.remove()),o.querySelectorAll(`[data-kasterid]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=Number(e.dataset.kasterid),n=a.indexOf(t);n===-1?a.length<2&&a.push(t):a.splice(n,1),s()})}),o.querySelector(`#bekreft-tre-btn`)?.addEventListener(`click`,async()=>{if(a.length!==2)return;let i=t.find(e=>!a.includes(e.rep.kasterid))??null,s=a.map(e=>t.find(t=>t.rep.kasterid===e)).filter(e=>e!=null).map(e=>e.members.map(e=>e.kasterid)),c=t.flatMap(e=>e.members.map(e=>e.kasterid));o.remove();let{error:l}=await T({kampId:e.id,sides:t.map(b),outcome:{type:`cup-ranked`,stevneId:n,roundNumber:e.runde_nummer,roundName:e.runde_navn,allThrowerIds:c,eliminatedIds:i?.members.map(e=>e.kasterid)??[],advancingSides:s}});if(l){u(`DB-feil ved bekreft`,`error`);return}await r()})}s()}function we(e){return typeof e!=`object`||!e||Array.isArray(e)?null:e}function Te(e){return e.map(e=>({er_bekreftet:e.er_bekreftet,er_walkover:e.er_walkover,runde_nummer:e.runde_nummer,bane_nummer:e.bane_nummer,spelarar:Ee(e.spelarar)}))}function Ee(e){return e.map(e=>({kasterid:e.kasterid??0,kamp_poeng:e.kamp_poeng??0,score_poeng:e.score_poeng??0,antall_ringer:e.antall_ringer,omgangar:e.omgangar,kaster:e.kaster}))}function De(e){let o=null,s=null,l=!1,d=new Set,m=new Set;async function h(e,{id:t,isAdmin:n=!1},r=null){s=r,l=n,o&&=(await D(o),null),e.replaceChildren(p(`Laster…`)),await g(e,t)}async function g(o,p){try{let[{data:t},{data:h},{data:v},{data:y},{count:b}]=await Promise.all([f(p),w(p),ae(p),ne([`A`,`B`]),r(p)]);if(!t){o.replaceChildren(i(`Stevne ikkje funne.`));return}m.clear();for(let e of h)for(let t of e.spelarar)m.add(t.id);let x=v.filter(e=>e.kasterid!=null),S=h.filter(e=>e.fase===`innledende`),C=h.filter(e=>e.fase===`avsluttende`),T={},E={},D=new Map;for(let e of x)e.startnummer!=null&&(T[e.kasterid]=e.startnummer,D.set(e.startnummer,(D.get(e.startnummer)??0)+1)),e.posisjon!=null&&(E[e.kasterid]=e.posisjon);let O=[...D.values()].some(e=>e>1),k={};for(let e of h)for(let t of e.spelarar)t.kasterid&&t.kaster&&!k[t.kasterid]&&(k[t.kasterid]=`${t.kaster.fornavn} ${t.kaster.etternavn}`);for(let e of x)e.kaster&&!k[e.kasterid]&&(k[e.kasterid]=`${e.kaster.fornavn} ${e.kaster.etternavn}`);let M=Te(S),N=te(M,x,k,T,E),P=S.length>0&&S.every(e=>e.er_bekreftet),F=C.length>0,le=(S.length>0||F)&&S.every(e=>e.er_bekreftet)&&C.every(e=>e.er_bekreftet),I=x.some(e=>e.gruppe!=null),ue=Object.fromEntries(y.map(e=>[e.navn,e.id])),L=we(t.runde1_format),R=b??0;if(t.kategori?.erlagbasert){let{data:e}=await c(p);R=e.length}let z={container:o,stevneid:p,stevne:t,standings:N,startNumberMap:T,positionMap:E,isTeam:O,nameMap:k,initialMatches:S,finalMatches:C,results:x,isAdmin:l,hasGroupAssignment:I,allInitialConfirmed:P,hasFinalMatches:F,round1Format:L,unitCount:R,groupNameMap:ue,reload:()=>g(o,p)};l&&s&&(s.innerHTML=ee(t,{allMatchesConfirmed:le,hasFinalMatches:F,hasGroupAssignment:I,hasPreconfiguredFormat:L!=null&&t.stevne_fase!==`avsluttende`}));let B=se(o);if(I){let t=j(N,M,T,{tableId:`standing-final`,hasGroups:!0,hasElimination:!0,positionMap:E,unitLabel:O?`par`:`spelarar`});o.innerHTML=A(e.renderMatchesHtml(z),t),oe(o,`standing-final`,d),ce(o),B===`standing`&&ie(o,`standing`),e.bindMatchEvents(o,z),_(o,p)}else o.innerHTML=e.renderSetupHtml(z);s?.querySelector(`#complete-tournament-btn`)?.addEventListener(`click`,async()=>{if(!await n({title:`Fullfør turnering`,message:`Vil du fullføre turneringa? Dette kan ikkje angrast.`,danger:!0}))return;let{error:e}=await re(p,[...N.filter(e=>e.gruppe?.navn===`A`),...N.filter(e=>e.gruppe?.navn===`B`),...N.filter(e=>e.gruppe?.navn!==`A`&&e.gruppe?.navn!==`B`)]);if(e){u(`Feil ved lagring av plasseringar`,`error`);return}let{error:t}=await a(p);if(t){u(`Feil ved fullføring av turnering`,`error`);return}await g(o,p)}),e.bindHeaderEvents(s,z)}catch(e){t(`avsluttendeBase.loadAndRender`,e),o.replaceChildren(i(`Kunne ikkje laste avsluttande fase.`))}}function _(t,n){if(o)return;let r=k(n,[`avsluttende`],t,g,()=>{o&&=(D(o),null)});o=y(n,e.channelName(n),r,e=>m.has(e))}return h}function Q(e,t,n){return h(e.spelarar.filter(e=>e.kasterid!=null),t,n)}function $(e,t){return _(e,t.er_bekreftet)}var Oe=De({channelName:e=>`stevne-avsl-cup-${e}`,renderMatchesHtml:e=>{let{finalMatches:t,standings:n,startNumberMap:r,positionMap:i,isTeam:a,isAdmin:o}=e;return`<div class="d-flex gap-3 flex-wrap">${[...new Set(n.map(e=>e.gruppe?.navn).filter(e=>e!=null))].sort().map(e=>{let s=t.filter(t=>t.gruppe_navn===e),c=n.filter(t=>t.gruppe?.navn===e),l=c.filter(e=>e.runde_eliminert==null).length,u=c.length,d=s.length?Math.max(...s.map(e=>e.runde_nummer)):0,f=s.filter(e=>e.runde_nummer===d),p=f.length>0&&f.every(e=>e.er_bekreftet||e.er_walkover),m=s.some(e=>e.runde_navn===`Semifinale`),h=o&&(s.length===0||p)&&l>1&&!m,g=f.length>0&&f.every(e=>e.runde_navn===`Semifinale`),_=s.some(e=>e.runde_navn===`Finale`);return Ae(e,s,l,u,d,h,o&&g&&p&&!_,r,i,a?`par`:`spelarar`,o)}).join(``)}</div>`},bindMatchEvents:(e,t)=>{!t.isAdmin&&t.finalMatches.length===0||Ie(e,t.stevneid,t.finalMatches,t.isAdmin,t.reload,t.startNumberMap,t.positionMap)},renderSetupHtml:e=>{let{stevne:t,isAdmin:n,round1Format:r,unitCount:i,standings:a}=e,o=r?.nA??null;if(t.stevne_fase===`avsluttende`)return n?W(a,{showPlayerList:!0,initNa:o,initFormat:r}):`<p class="text-muted fst-italic">Gruppefordeling er ikkje klar enno.</p>`;if(!n)return``;if(i<2)return`<p class="text-muted fst-italic">${t.kategori?.erlagbasert?`Minst 2 par må vere oppretta før gruppefordelinga kan setjast.`:`Minst 2 spelarar må vere påmelde før gruppefordelinga kan setjast.`}</p>`;let s=a.length>0;return W(s?a:i,{showPlayerList:s,initNa:o,initFormat:r})},bindHeaderEvents:(e,r)=>{let{container:i,stevneid:a,stevne:c,standings:d,results:f,round1Format:p,allInitialConfirmed:h,hasGroupAssignment:g,groupNameMap:_,reload:v}=r;if(e?.querySelector(`#start-final-btn`)?.addEventListener(`click`,async()=>{if(!h)return;let{error:e}=await s(a,`avsluttende`);if(e){u(`Feil ved oppstart av avsluttande fase`,`error`);return}if(p?.nA!=null){let e=p.nA,t=_.A??null,n=_.B??null,r=ke(d,f,e,t,n),{error:i}=await P(a,r);if(i){u(`Feil ved lagring av gruppefordeling: `+o(i),`error`);return}}await v()}),!g){let e=parseInt(i.querySelector(`#group-assignment-wrapper`)?.dataset.n??`0`)||d.length;function t(e,t){let n=i.querySelector(`input[name="${e}"]:checked`);if(n?.dataset.oppsett)try{return JSON.parse(n.dataset.oppsett)}catch{}return V(t)[0]??null}function n(e,t,n){let r=i.querySelector(`#group-preview`);r&&(r.innerHTML=G(d.map((e,t)=>({...e,cupPlassering:t+1})),e,t?.walkovers??0,n?.walkovers??0))}let r=i.querySelector(`#group-panels`);r&&r.addEventListener(`change`,r=>{let a=r.target;if(!a.matches(`input[name^="round1-format"]`))return;let o=parseInt(i.querySelector(`input[name="group-split"]:checked`)?.value??String(e)),s=e-o,c=t(`round1-format-a`,o),l=t(`round1-format-b`,s);if(a.name===`round1-format-a`){let e=i.querySelector(`#structure-a`);e&&(e.outerHTML=K(o,c,`a`))}else{let e=i.querySelector(`#structure-b`);e&&(e.outerHTML=K(s,l,`b`))}n(o,c,l)}),i.querySelectorAll(`input[name="group-split"]`).forEach(t=>{t.addEventListener(`change`,()=>{let i=parseInt(t.value),a=e-i,o=V(i)[0]??null,s=a>=2?V(a)[0]??null:null;r&&(r.innerHTML=`<div id="group-panel-a" class="final-group-col">
                ${q(`Gruppe A`,i,`round1-format-a`,o)}
              </div>`+(a>=2?`<div id="group-panel-b" class="final-group-col">
                ${q(`Gruppe B`,a,`round1-format-b`,s)}
              </div>`:``)),n(i,o,s)})}),i.querySelector(`#confirm-group-btn`)?.addEventListener(`click`,async()=>{let n=i.querySelector(`input[name="group-split"]:checked`);if(!n)return;let r=parseInt(n.value),p=e-r,h=t(`round1-format-a`,r),g=p>=2?t(`round1-format-b`,p):null,{error:y}=await l(a,{A:h,B:g,nA:r});if(y){u(`Feil ved lagring av format: `+o(y),`error`);return}let b=c.stevne_fase;if(b!==`avsluttende`&&m(c.kastemetodeInnl?.navn??``)){let{data:e}=await le(a);if(!e){u(`Fullfør den innleiande fasen før cupen kan startast`,`error`);return}let{error:t}=await s(a,`avsluttende`);if(t){u(`Feil ved oppstart av avsluttande fase: `+o(t),`error`);return}b=`avsluttende`}if(b===`avsluttende`){let e=_.A??null,t=_.B??null,n=ke(d,f,r,e,t),{error:i}=await P(a,n);if(i){u(`Feil ved lagring av gruppefordeling: `+o(i),`error`);return}}u(`Gruppefordeling lagra`,`success`),await v()})}e?.querySelector(`#edit-group-assignment-btn`)?.addEventListener(`click`,async()=>{await n({title:`Tilbakestill gruppeinndeling`,message:`Gruppefordeling og format vert fjerna.`,danger:!0})&&(await Promise.all([F(a),l(a,null)]),await v())}),g&&(i.querySelectorAll(`[data-generate-group]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.generateGroup??``,n=parseInt(e.dataset.runde??`1`),r=d.filter(e=>e.gruppe?.navn===t);Se(a,t,r,n,p,v)})}),i.querySelectorAll(`[data-generate-finale-group]`).forEach(e=>{e.addEventListener(`click`,async()=>{let n=e.dataset.generateFinaleGroup??``;e.disabled=!0,e.textContent=`Genererer…`;try{await xe(a,n),await v()}catch(n){t(`cup:genererFinale`,n),u(`Feil ved generering av finale`,`error`),e.disabled=!1,e.textContent=`Generer finale`}})}))}});function ke(e,t,n,r,i){return e.flatMap((e,a)=>{let o=a<n?r:i??r,s=e.startnummer==null?[]:t.filter(t=>t.startnummer===e.startnummer).map(e=>e.kasterid);return(s.length?s:[e.kasterid]).map(e=>({kasterid:e,gruppeid:o}))})}function Ae(e,t,n,r,i,a,o,s,c,l,u=!0){let f=new Map;for(let e of t)f.has(e.runde_nummer)||f.set(e.runde_nummer,[]),f.get(e.runde_nummer).push(e);let p=[...f.entries()].reverse().map(([e,t])=>{let n=t[0]?.runde_navn??`Runde ${e}`,r=t.filter(e=>!e.er_walkover);return r.length?`
      <h6 class="fw-bold text-center mb-1">${d(n)}</h6>
      <div class="d-flex flex-wrap gap-2 mb-2">
        ${r.map(e=>Fe(e,s,c,u)).join(``)}
      </div>`:``}).join(``),m=i+1,h=a?`<button class="btn btn-success w-100 mt-2"
         data-generate-group="${d(e)}" data-runde="${m}">
         Generer runde ${m}
       </button>`:``,g=o?`<button class="btn btn-success w-100 mt-2" data-generate-finale-group="${d(e)}">
         Generer finale
       </button>`:``;return`
    <div class="final-group-col">
      <h6 class="text-center fw-bold mb-2">Gruppe ${d(e)} (${r} ${d(l)})</h6>
      ${h}
      ${g}
      ${p}
    </div>`}function je(e,t,n,r){let i=$(t,e),a=i>0||r.isConfirmed&&!r.isThreeSides||r.hasRounds?i:`—`,o=t.rep.kamp_plassering,s=e.er_bekreftet&&o!=null&&o>=n,c=e.er_bekreftet&&o!=null&&o<n,l=s?`match-eliminated`:c?`match-advancing`:``,u=`text-center fw-semibold final-score-cell${r.canEditScore?` score-editable`:``}`,d=r.canEditScore?` data-endre-score="${e.id}"`:``;return`<tr${l?` class="${l}"`:``}>
    <td>${O(t,!1)}</td>
    <td class="${u}"${d}>${a}</td>
  </tr>`}function Me(e,t,n){return e.er_walkover?`<tr>
        <td colspan="2">${O(t[0]??null,!1)} <span class="badge bg-secondary">Walkover</span></td>
      </tr>`:t.map(r=>je(e,r,t.length,n)).join(``)}function Ne(e,t,n,r){if(e.er_tre_spelarar)return{css:r?`btn-secondary`:`btn-outline-secondary`,text:r?`Endre plassering`:`Sett plassering`,disabled:!1,extraCss:``};let i=M(e,Ee(t.map(e=>e.rep)),n);return{css:r?`btn-secondary`:i?`btn-success`:`btn-outline-secondary`,text:r?`Bekreftet`:`Bekreft`,disabled:r||!i,extraCss:` btn-confirm`}}function Pe(e,t,n){return`<tr>
            <td colspan="2" class="text-end pe-1">
              ${!e.er_walkover&&!e.er_tre_spelarar?`<button class="btn btn-primary btn-sm" id="plus-${e.id}"${t?` disabled`:``}>+</button> `:``}
              ${t?``:`<button class="btn btn-secondary btn-sm" data-scoreboard-kamp-id="${e.id}">Scoreboard</button> `}
              <button class="btn ${n.css} btn-sm${n.extraCss}" id="bekrft-${e.id}"${n.disabled?` disabled`:``}>${n.text}</button>
            </td>
          </tr>`}function Fe(e,t,n,r=!0){let i=Q(e,t,n),a=e.er_bekreftet||e.er_walkover,o=e.spelarar.some(e=>(e.omgangar?.length??0)>0),s={isConfirmed:a,hasRounds:o,canEditScore:r&&e.er_bekreftet&&!e.er_tre_spelarar&&!o,isThreeSides:e.er_tre_spelarar},c=r?Pe(e,a,Ne(e,i,o,a)):``;return`
    <div class="final-match-block">
      <div class="final-match-header">
        <span class="final-match-lane">Bane ${e.bane_nummer}</span>
        ${o&&!a?ue():``}
      </div>
      <table class="table table-sm table-bordered mb-0">
        <tbody>
          ${Me(e,i,s)}
          ${c}
        </tbody>
      </table>
    </div>`}function Ie(e,n,r,i,a,o,s){N(e);for(let c of r){let r=Q(c,o,s),l=r[0]??null,d=r[1]??null,f=l?.rep??null,p=d?.rep??null,m=O(l,!1),h=O(d,!1),g=r.flatMap(e=>e.members.map(e=>e.id)),_=async(e,n)=>{let r=[];f?.id&&r.push(v(f.id,e)),p?.id&&r.push(v(p.id,n));for(let e of[l,d])for(let t of e?.members.slice(1)??[])r.push(v(t.id,0));try{return(await Promise.all(r)).find(e=>e.error)??null}catch(e){return t(`cup:writeSideScore`,e),{error:e}}};if(e.querySelector(`#plus-${c.id}`)?.addEventListener(`click`,()=>{L({side1Name:m,side2Name:h,currentS1:$(l,c),currentS2:$(d,c),playerIds:g,hasRounds:c.spelarar.some(e=>(e.omgangar?.length??0)>0),logPrefix:`cup`,onSave:_,onSaved:a})}),e.querySelector(`#bekrft-${c.id}`)?.addEventListener(`click`,async e=>{if(c.er_tre_spelarar)Ce(c,r,n,a);else{let t=e.currentTarget;t.disabled=!0,t.textContent=`Lagrer…`;try{await Le(n,c,r,a)||(t.disabled=!1,t.textContent=`Bekreft`)}catch{t.disabled=!1,t.textContent=`Bekreft`}}}),i&&c.er_bekreftet&&!c.er_tre_spelarar){let t=r.flatMap(e=>e.members.map(e=>e.kasterid)),i=()=>{I([{name:m,score:$(l,c)},{name:h,score:$(d,c)}],async([e=0,r=0])=>{if(g.length){let{error:e}=await S(g);if(e){u(`DB-feil ved sletting av omgangar`,`error`);return}}if(await _(e,r)){u(`DB-feil ved oppdatering av score`,`error`);return}let i=e>=r?l:d,o=e>=r?d:l,s=i?.members.map(e=>e.kasterid)??[],f=o?.members.map(e=>e.kasterid)??[],p=[...s.map(e=>({kasterid:e,plassering:1})),...f.map(e=>({kasterid:e,plassering:2}))],{error:m}=await x(c.id,p);if(m){u(`DB-feil ved oppdatering av plassering`,`error`);return}await E({stevneId:n,roundNumber:c.runde_nummer,roundName:c.runde_navn,allThrowerIds:t,newWinnerIds:s,newLoserIds:f}),await a()})};e.querySelectorAll(`[data-endre-score="${c.id}"]`).forEach(e=>e.addEventListener(`click`,i))}}}async function Le(e,t,r,i){let a=r[0]??null,o=r[1]??null,{data:s}=await C(t.id),c=e=>e?.members.reduce((e,t)=>e+g(s.find(e=>e.id===t.id)??t,!1),0)??0,l=c(a),d=c(o);if(l===0&&d===0&&!await n({title:`Ingen score registrert`,message:`Vil du bekrefte kampen likevel?`}))return!1;let f=l>=d?a:o,p=l>=d?o:a,m=r.flatMap(e=>e.members.map(e=>e.kasterid)),{error:h}=await T({kampId:t.id,sides:[b(a),b(o)],outcome:{type:`cup-ranked`,stevneId:e,roundNumber:t.runde_nummer,roundName:t.runde_navn,allThrowerIds:m,eliminatedIds:p?.members.map(e=>e.kasterid)??[],advancingSides:f?[f.members.map(e=>e.kasterid)]:[]}});return h?(u(`DB-feil ved bekreft`,`error`),!1):(await i(),!0)}export{Oe as render};