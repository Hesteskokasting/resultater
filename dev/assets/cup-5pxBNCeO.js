import{n as e,r as t,t as n}from"./escHtml-Z0YwDf7L.js";import{B as r,Ct as i,Gt as a,H as o,V as s,Wt as c,Xt as l,Zt as u,k as d,qt as f,zt as p}from"./index-CY82xwnt.js";import{i as m}from"./kastemetode-Dor3Q-Ix.js";import{I as h,O as g,P as _,S as v,_ as y,b,g as x,n as S,o as C,r as w,t as T,w as E}from"./kampService-DkSYNJOZ.js";import{n as D}from"./navigation-qGwd87eC.js";import{L as O,M as k,O as A,R as j,f as M,j as ee}from"./navigationService-B7jb4P4S.js";import{t as N}from"./ScoreboardButton-cO_q_Bk1.js";import{_ as P,a as te,c as F,f as ne,g as re,h as ie,i as ae,l as oe,m as se,n as ce,o as le,p as ue,r as de,t as fe,u as pe}from"./BannerMenu-C3PaLkVL.js";import{n as I,t as L}from"./scoreEditor-DXqTbD_x.js";function R(e){let t=[...e];for(let e=t.length-1;e>0;e--){let n=Math.floor(Math.random()*(e+1));[t[e],t[n]]=[t[n],t[e]]}return t}function z(e){return e===2||e===4?!0:e<2?!1:e%3==0?z(Math.floor(e/3)*2):e%2==0&&z(e/2)}function B(e){return e%3==0?{c3:e/3,c2:0}:e%2==0?{c3:0,c2:e/2}:{c3:0,c2:0}}function V(e){if(e<2)return[];let t=[],n=Math.floor(e/2);for(let r=e%3;r<=n&&r<=3&&t.filter(e=>e.c2===0).length<2;r+=3){let n=(e-r)/3;if(n<1)break;z(r+2*n)&&t.push({walkovers:r,c3:n,c2:0})}for(let r=e%2;r<=n&&r<=3&&t.filter(e=>e.c3===0).length<2;r+=2){let n=(e-r)/2;if(n<1)break;let i=r+n;!t.some(e=>e.walkovers===r&&e.c3===0&&e.c2===n)&&z(i)&&t.push({walkovers:r,c3:0,c2:n})}return t.sort((e,t)=>e.walkovers-t.walkovers||t.c3-e.c3),t}function H(e){return e===2||V(e).length>0}function me(e){let t=Math.ceil(e*.5),n=Math.round(e*.8),r=[];for(let i=n;i>=t;i--){let t=e-i;t>=2&&H(i)&&H(t)&&r.push({nA:i,nB:t})}return r}function he(e,{runde1:t=null,walkovers1:n=null}={}){let r=[],i=e,a=1,o=!0;for(;i>2;){let e,s,c;if(o){let r=t;!r&&n!==null&&(r={walkovers:n,c3:Math.floor((i-n)/3),c2:0}),r||=V(i)[0]??{walkovers:i%3,c3:Math.floor(i/3),c2:0},c=r.walkovers,e=r.c3,s=r.c2,o=!1}else{let t=B(i);e=t.c3,s=t.c2,c=0}let l=e*2+s+c;r.push({runde:a,players:i,lanes:e+s,threePlayers:e>0,walkovers:c,advancing:l}),i=l,a++}return r}function U(e,{medSeeding:t=!0,isRunde1:n=!1,walkoverTall:r=null,runde1Oppsett:i=null,shuffleFn:a}={}){let o=a??R,s=[],c=[...e];if(n){let e=i?.walkovers??r??c.length%3;if(e>0){let t=c.slice(0,e);c=c.slice(e);for(let e of t)s.push({players:[e.kasterid],isWalkover:!0,isThreePlayers:!1})}}let l=c.length,u,d;if(i&&n)u=i.c3,d=i.c2;else if(n)u=Math.floor(l/3),d=0;else{let e=B(l);u=e.c3,d=e.c2}let f=u+d;if(t&&f>0){let e=o(c.slice(0,f)),t=o(c.slice(f,2*f)),n=o(c.slice(2*f)),r=0;for(let i=0;i<f;i++){let a=i<u,o=[e[i],t[i]].filter(e=>e!=null),c=a?n[r]:void 0;c&&(o.push(c),r++),s.push({players:o.map(e=>e.kasterid),isWalkover:!1,isThreePlayers:a})}}else{let e=o(c),t=0;for(let n=0;n<u;n++)s.push({players:e.slice(t,t+3).map(e=>e.kasterid),isWalkover:!1,isThreePlayers:!0}),t+=3;for(let n=0;n<d;n++)s.push({players:e.slice(t,t+2).map(e=>e.kasterid),isWalkover:!1,isThreePlayers:!1}),t+=2}return s}function W(e,{showPlayerList:t=!0,initNa:n=null,initFormat:r=null}={}){let i=typeof e==`number`?e:e.length,a=typeof e==`number`?[]:e.map((e,t)=>({...e,cupPlassering:t+1})),o=me(i),s=n===i?i:n!=null&&o.some(e=>e.nA===n)?n:o[0]?.nA??i,c=i-s,l=o.filter(e=>V(e.nA).some(e=>e.c3>0)),u=o.filter(e=>!V(e.nA).some(e=>e.c3>0)),d=V(i).length>0,f=(e,t)=>e.map((e,r)=>{let a=e.nA===s&&n!==i,o=t+r;return`
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
  `}function G(e,t,r=0,i=0){let a=e.slice(0,t),o=e.slice(t),s=e.some(e=>e.poeng_xkast!=null);function c(e,t=0){return e.map((e,r)=>{let i=r<t,a=s?e.antall_ring_xkast??0:e.kamp_poeng??0,o=s?e.poeng_xkast??0:e.score_poeng??0;return`
      <tr>
        <td>${e.cupPlassering}</td>
        <td>${n(e.navn??``)}${i?` <span class="badge bg-info text-dark">Walkover</span>`:``}</td>
        <td class="text-center">${a}</td>
        <td class="text-center">${o}</td>
      </tr>`}).join(``)}let l=`
    <thead class="org-thead"><tr>
      <th class="th-32">#</th><th>NAMN</th>
      <th class="th-44 text-center">${s?`R`:`KP`}</th>
      <th class="th-44 text-center">${s?`X`:`SP`}</th>
    </tr></thead>`,u=`
    <table class="table table-bordered table-sm bg-white mb-0">
      ${l}
      <tbody>${c(a,r)}</tbody>
    </table>`,d=o.length?`
    <table class="table table-bordered table-sm bg-white mb-0">
      ${l}
      <tbody>${c(o,i)}</tbody>
    </table>`:``;return`
    <div class="d-flex gap-3 flex-wrap">
      <div class="avsl-gruppe-kol">
        <h6 class="fw-bold text-center">GRUPPE A (${a.length})</h6>
        ${u}
      </div>
      ${o.length?`<div class="avsl-gruppe-kol">
        <h6 class="fw-bold text-center">GRUPPE B (${o.length})</h6>
        ${d}
      </div>`:``}
    </div>`}function ge(e){let t=e.c3>0?3:2;return`${e.walkovers} walkover - ${t} deltakere per bane`}function _e(e,t,n,r=null){let i=V(t);return i.length<=1?``:`<div class="d-flex flex-column align-items-start gap-1 mb-2">${i.map((e,t)=>{let i=`${n}-${t}`,a=JSON.stringify(e),o=r?e.walkovers===r.walkovers&&e.c3===r.c3&&e.c2===r.c2:t===0,s=e.c3>0?`btn-outline-success`:`btn-outline-warning`;return`
      <input type="radio" class="btn-check" name="${n}" id="${i}"
        value='${a}' data-oppsett='${a}' autocomplete="off" ${o?`checked`:``}>
      <label class="btn btn-sm ${s}" for="${i}">${ge(e)}</label>`}).join(``)}</div>`}function K(e,t,n){return`<div id="structure-${n}">
    <table class="table table-sm table-bordered mb-0">
      <thead><tr>
        <th>Runde</th><th>Deltakere</th><th>Baner</th><th>Per bane</th>
      </tr></thead>
      <tbody>${(e>=2?he(e,{runde1:t}):[]).map((e,n)=>{let r=e.walkovers??0,i=e.players-r,a=r>0?`${i} <span class="text-muted">(${r} w.o.)</span>`:`${i}`,o;return o=n===0&&t?t.c3>0&&t.c2>0?`2/3`:t.c3>0?`3`:`2`:e.players%e.lanes===0?String(e.players/e.lanes):`2/3`,`<tr${e.threePlayers?` class="fw-bold"`:``}>
      <td>${e.runde}</td>
      <td>${a}</td>
      <td>${e.lanes}</td>
      <td>${o}</td>
    </tr>`}).join(``)}</tbody>
    </table>
  </div>`}function q(e,t,n,r){let i=n.slice(-1),a=_e(e,t,n,r);return`
    <div class="card">
      <div class="card-body">
        <h6 class="fw-bold mb-2">${a?`${e}: Velg format`:`${e} (${t})`}</h6>
        ${a}
        ${K(t,r,i)}
      </div>
    </div>`}function J(){return crypto.randomUUID()}async function Y(e){let{data:n,error:r}=await t.from(`resultat`).select(`kasterid, startnummer, posisjon`).eq(`stevneid`,e);if(r)throw Error(`Feil ved henting av resultat: `+r.message);let i={},a={};for(let e of n??[])e.kasterid!=null&&e.startnummer!=null&&(i[e.kasterid]=e.startnummer,(a[e.startnummer]??=[]).push({kasterid:e.kasterid,posisjon:e.posisjon}));let o={};for(let[e,t]of Object.entries(a))t.sort((e,t)=>(e.posisjon??1/0)-(t.posisjon??1/0)||e.kasterid-t.kasterid),o[Number(e)]=t.map(e=>e.kasterid);return{kasteridToSnr:i,snrToMembers:o}}function ve(e,t){let n=e.kasteridToSnr[t];return(n==null?void 0:e.snrToMembers[n])??[t]}function X(e,t,n,r,i,a=0,o=null,s=J){let c=a;return t.map(t=>({match:{match_id:s(),stevneid:e,fase:`avsluttende`,runde_nummer:n,gruppe_navn:r??null,bane_nummer:t.isWalkover?null:++c,er_bekreftet:t.isWalkover,er_walkover:t.isWalkover,er_tre_spelarar:t.isThreePlayers,runde_navn:o},playerKasterids:t.players.flatMap(e=>ve(i,Number(e)))}))}async function Z(e){if(e.length===0)return 0;let n=e.map(e=>({match_id:e.match.match_id,stevneid:e.match.stevneid,fase:e.match.fase,runde_nummer:e.match.runde_nummer,gruppe_navn:e.match.gruppe_navn??null,bane_nummer:e.match.bane_nummer??null,er_bekreftet:e.match.er_bekreftet??!1,er_walkover:e.match.er_walkover??!1,er_tre_spelarar:e.match.er_tre_spelarar??!1,runde_navn:e.match.runde_navn??null,players:e.playerKasterids.map(e=>({kasterid:e}))})),{data:r,error:i}=await t.rpc(`insert_avsluttende_matches`,{p_matches:n});if(i)throw Error(`Feil ved innsetting av cup-kampar: `+i.message);return r??0}async function ye(e,t,n,r,i,a=0,o=null){return Z(X(e,t,n,r,i,a,o))}function be(e,t,n){if(!e||!t)return 0;let r=n.indexOf(t),i=0;for(let t of n.slice(0,r)){let n=e[t];n&&(i+=(n.c3??0)+(n.c2??0))}return i}async function xe(e,t,n,r=null){let i=[`A`,`B`,`C`],a=await Y(e),o=await Q(e,1),s=[];for(let c of t){let t=U(c.spelarar,{medSeeding:n,isRunde1:!0,runde1Oppsett:c.runde1Oppsett??null}),l=Math.max(o,be(r,c.groupName,i)),u=c.spelarar.length===4,d=X(e,t,1,c.groupName,a,l,u?`Semifinale`:null);s.push(...d);for(let{match:e}of d)e.bane_nummer!=null&&e.bane_nummer>o&&(o=e.bane_nummer)}return Z(s)}async function Q(e,n){let{data:r}=await t.from(`kamp`).select(`bane_nummer`).eq(`stevneid`,e).eq(`fase`,`avsluttende`).eq(`runde_nummer`,n).not(`bane_nummer`,`is`,null).order(`bane_nummer`,{ascending:!1}).limit(1);return r?.[0]?.bane_nummer??0}async function Se(e,n,r,i){let{data:a}=await t.from(`kamp`).select(`runde_nummer`).eq(`stevneid`,e).eq(`fase`,`avsluttende`).eq(`gruppe_navn`,n).order(`runde_nummer`,{ascending:!1}).limit(1),o=(a?.[0]?.runde_nummer??0)+1,s=i.length===4,c=U(i,{medSeeding:r,isRunde1:!1}),l=await Q(e,o);return{roundNumber:o,matchCount:await ye(e,c,o,n,await Y(e),l,s?`Semifinale`:null)}}async function Ce(e,n){let{data:r}=await t.from(`kamp`).select(`id, runde_nummer, spelarar:kamp_spelar(id, kasterid, score_poeng, omgangar:kamp_omgang(score))`).eq(`stevneid`,e).eq(`fase`,`avsluttende`).eq(`gruppe_navn`,n).eq(`runde_navn`,`Semifinale`).eq(`er_bekreftet`,!0);if(!r?.length)throw Error(`Semifinalane er ikkje bekrefta.`);let i=await Y(e),a=r,o=a[0].runde_nummer+1,s=[],c=[];for(let e of a){let t=new Map;for(let n of e.spelarar??[]){if(n.kasterid==null)continue;let e=i.kasteridToSnr[n.kasterid]??`kaster-${n.kasterid}`,r=t.get(e)??{kasterids:[],score:0};r.kasterids.push(n.kasterid),r.score+=n.omgangar?.length?n.omgangar.reduce((e,t)=>e+(t.score??0),0):n.score_poeng??0,t.set(e,r)}let n=[...t.values()].sort((e,t)=>t.score-e.score);n[0]&&s.push(n[0].kasterids),n[1]&&c.push(n[1].kasterids)}let l=await Q(e,o);await Z([{match:{match_id:J(),stevneid:e,fase:`avsluttende`,runde_nummer:o,gruppe_navn:n,bane_nummer:l+1,runde_navn:`Finale`,er_bekreftet:!1,er_walkover:!1,er_tre_spelarar:!1},playerKasterids:s.flat()},{match:{match_id:J(),stevneid:e,fase:`avsluttende`,runde_nummer:o,gruppe_navn:n,bane_nummer:l+2,runde_navn:`Bronsefinale`,er_bekreftet:!1,er_walkover:!1,er_tre_spelarar:!1},playerKasterids:c.flat()}])}function we(t,r,i,a,o,c){let l=i.filter(e=>e.runde_eliminert==null),u=i.length,d=l.length,f=i.some(e=>e.poeng_xkast!=null),p=e=>f?`${e.poeng_xkast??0}p (${e.antall_ring_xkast??0})`:`${e.kamp_poeng??0}p (${e.score_poeng??0})`,m=a===1?o?.[r]??null:null,h=m?.walkovers??0,g=(m?m.c3:d%3==0?d/3:0)+(m?m.c2:d%3==0?0:d/2),_=l.slice(h,h+g),v=l.slice(h+g,h+2*g),y=l.slice(h+2*g),b=document.createElement(`div`);b.className=`final-dialog-overlay`,document.body.appendChild(b);let x=null,S=!1,C=0,w=0;function T(e){if(!S)return;let t=b.querySelector(`.final-dialog-card-wide`);if(!t)return;let n=e.clientX-C,r=e.clientY-w;x={left:n,top:r},t.style.left=`${n}px`,t.style.top=`${r}px`}function E(){S&&(S=!1,document.body.style.userSelect=``)}document.addEventListener(`mousemove`,T),document.addEventListener(`mouseup`,E);function D(){document.removeEventListener(`mousemove`,T),document.removeEventListener(`mouseup`,E)}function O(e){return`<div class="d-flex justify-content-between gap-2 py-1">
      <span class="small">${n(e.navn??``)}</span>
      <span class="small text-muted text-nowrap">${p(e)}</span>
    </div>`}function k(i){let f=l.slice(0,h),T=f.length>0?`<div class="mb-3">
          <strong class="d-block mb-1">Walkovers (går vidare utan kamp):</strong>
          ${f.map(O).join(``)}
        </div>`:``,E=i===!0&&g>0?`<div class="alert alert-info small mb-3 py-2">
          Dette er seedinggrupper, ikkje kampar. Spelarar i same gruppe kan ikkje trekkast mot kvarandre. Kampane blir oppretta når du klikkar «Bekreft og opprett kampar».
        </div>`:``,A=i===!0&&g>0?`<div class="d-flex gap-3 flex-wrap mb-3">
          ${[{label:`Seeding 1`,pool:_},{label:`Seeding 2`,pool:v},...y.length?[{label:`Seeding 3`,pool:y}]:[]].map(({label:e,pool:t})=>`
            <div class="card flex-grow-1">
              <div class="card-body p-2">
                <strong class="d-block mb-2 small text-uppercase">${n(e)}</strong>
                ${t.map(O).join(``)}
              </div>
            </div>`).join(``)}
        </div>`:`<div class="final-player-columns mb-3">
          ${l.slice(h).map((e,t)=>`
            <div class="small d-flex justify-content-between gap-2">
              <span>${h+t+1}. ${n(e.navn??``)}</span>
              <span class="text-muted text-nowrap">${p(e)}</span>
            </div>`).join(``)}
        </div>`;b.innerHTML=`
      <div class="card final-dialog-card-wide">
        <div class="final-dialog-drag-handle">
          <p class="text-muted small text-uppercase fw-semibold mb-1">Trekning</p>
          <h5 class="mb-1">Gruppe ${n(r)} — Runde ${a}</h5>
          <p class="text-muted small mb-0">${d} av ${u} spelarar igjen</p>
        </div>
        <div class="final-dialog-body">
          <div class="mb-3">
            <span class="form-label fw-semibold d-block mb-1">Bruk seeding</span>
            <div class="form-check form-check-inline">
              <input class="form-check-input" type="radio" name="seeding-dlg" id="seeding-ja" value="ja" ${i===!0?`checked`:``}>
              <label class="form-check-label" for="seeding-ja">Ja</label>
            </div>
            <div class="form-check form-check-inline">
              <input class="form-check-input" type="radio" name="seeding-dlg" id="seeding-nei" value="nei" ${i===!1?`checked`:``}>
              <label class="form-check-label" for="seeding-nei">Nei</label>
            </div>
          </div>
          ${E}
          ${T}
          ${A}
        </div>
        <div class="final-dialog-footer">
          <div class="d-flex gap-2">
            <button id="bekreft-gen-btn" class="btn btn-primary" ${i===null?`disabled`:``}>Bekreft og opprett kampar</button>
            <button id="avbryt-gen-btn" class="btn btn-secondary">Avbryt</button>
          </div>
        </div>
      </div>`;let j=b.querySelector(`.final-dialog-card-wide`);x&&(j.style.position=`fixed`,j.style.left=`${x.left}px`,j.style.top=`${x.top}px`,j.style.margin=`0`,j.style.zIndex=`10000`),j.querySelector(`.final-dialog-drag-handle`).addEventListener(`mousedown`,e=>{let t=j.getBoundingClientRect();j.style.position=`fixed`,j.style.left=`${t.left}px`,j.style.top=`${t.top}px`,j.style.margin=`0`,j.style.zIndex=`10000`,C=e.clientX-t.left,w=e.clientY-t.top,x={left:t.left,top:t.top},S=!0,document.body.style.userSelect=`none`}),b.querySelector(`#seeding-ja`).addEventListener(`change`,()=>k(!0)),b.querySelector(`#seeding-nei`).addEventListener(`change`,()=>k(!1)),b.querySelector(`#avbryt-gen-btn`).addEventListener(`click`,()=>{D(),b.remove()}),b.querySelector(`#bekreft-gen-btn`).addEventListener(`click`,async()=>{if(i===null)return;let n=b.querySelector(`#bekreft-gen-btn`);n.disabled=!0,n.textContent=`Lagrer…`;try{let e=l.map((e,t)=>({kasterid:e.kasterid,plassering:t+1}));if(a===1){let n={A:o?.A??void 0,B:o?.B??void 0};await xe(t,[{groupName:r,spelarar:e,runde1Oppsett:m}],i,o?n:null)}else await Se(t,r,i,e);D(),b.remove(),await c()}catch(t){e(`cup:genererRunde`,t),s(`Feil ved generering av runde`,`error`),n.disabled=!1,n.textContent=`Bekreft og opprett kampar`}})}k(null)}function Te(e,t,n,r){let i=t.map(e=>P(e,!1)),a=[],o=document.createElement(`div`);o.className=`final-dialog-overlay`,document.body.appendChild(o);function c(){let l=a.length===2?t.find(e=>!a.includes(e.rep.kasterid)):null;o.innerHTML=`
      <div class="card p-4 final-dialog-card">
        <h5 class="card-title mb-1">Bekreft 3-spelar kamp</h5>
        <p class="text-muted small mb-3">Vel dei to som går vidare. Den gjenverande er utslått.</p>
        <div class="d-flex flex-column gap-2 mb-3">
          ${t.map((e,t)=>{let n=a.indexOf(e.rep.kasterid),r=n!==-1,o=!!l&&l.rep.kasterid===e.rep.kasterid,s=n===0?`1. plass`:n===1?`2. plass`:``;return`<button
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
    `,o.querySelector(`#avbryt-tre-btn`).addEventListener(`click`,()=>o.remove()),o.querySelectorAll(`[data-kasterid]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=Number(e.dataset.kasterid),n=a.indexOf(t);n===-1?a.length<2&&a.push(t):a.splice(n,1),c()})}),o.querySelector(`#bekreft-tre-btn`)?.addEventListener(`click`,async()=>{if(a.length!==2)return;let i=t.find(e=>!a.includes(e.rep.kasterid))??null,c=a.map(e=>t.find(t=>t.rep.kasterid===e)).filter(e=>e!=null).map(e=>e.members.map(e=>e.kasterid)),l=t.flatMap(e=>e.members.map(e=>e.kasterid));o.remove();let{error:u}=await T({kampId:e.id,sides:t.map(b),outcome:{type:`cup-ranked`,stevneId:n,roundNumber:e.runde_nummer,roundName:e.runde_navn,allThrowerIds:l,eliminatedIds:i?.members.map(e=>e.kasterid)??[],advancingSides:c}});if(u){s(`DB-feil ved bekreft`,`error`);return}await r()})}c()}function Ee(e){return e.map(e=>({er_bekreftet:e.er_bekreftet,er_walkover:e.er_walkover,runde_nummer:e.runde_nummer,bane_nummer:e.bane_nummer,spelarar:De(e.spelarar)}))}function De(e){return e.map(e=>({kasterid:e.kasterid??0,kamp_poeng:e.kamp_poeng??0,score_poeng:e.score_poeng??0,antall_ringer:e.antall_ringer,omgangar:e.omgangar,kaster:e.kaster}))}function Oe(t){let n=null,r=null,c=!1,f=new Set,m=new Set;async function h(e,{id:t,isAdmin:i=!1},a=null){r=a,c=i,n&&=(await D(n),null),e.replaceChildren(u(`Laster…`)),await g(e,t)}async function g(n,u){try{let[{data:e},{data:h},{data:v},{data:y},{count:b}]=await Promise.all([i(u),w(u),k(u),ee([`A`,`B`]),p(u)]);if(!e){n.replaceChildren(l(`Stevne ikkje funne.`));return}m.clear();for(let e of h)for(let t of e.spelarar)m.add(t.id);let x=v.filter(e=>e.kasterid!=null),S=h.filter(e=>e.fase===`innledende`),C=h.filter(e=>e.fase===`avsluttende`),T={},E={},D=new Map;for(let e of x)e.startnummer!=null&&(T[e.kasterid]=e.startnummer,D.set(e.startnummer,(D.get(e.startnummer)??0)+1)),e.posisjon!=null&&(E[e.kasterid]=e.posisjon);let O=[...D.values()].some(e=>e>1),A={};for(let e of h)for(let t of e.spelarar)t.kasterid&&t.kaster&&!A[t.kasterid]&&(A[t.kasterid]=`${t.kaster.fornavn} ${t.kaster.etternavn}`);for(let e of x)e.kaster&&!A[e.kasterid]&&(A[e.kasterid]=`${e.kaster.fornavn} ${e.kaster.etternavn}`);let M=Ee(S),N=le(M,x,A,T,E),P=S.length>0&&S.every(e=>e.er_bekreftet),F=C.length>0,de=(S.length>0||F)&&S.every(e=>e.er_bekreftet)&&C.every(e=>e.er_bekreftet),I=x.some(e=>e.gruppe!=null),L=Object.fromEntries(y.map(e=>[e.navn,e.id])),R=ne(e.runde1_format),z=b??0;if(e.kategori?.erlagbasert){let{data:e}=await d(u);z=e.length}let B={container:n,stevneid:u,stevne:e,standings:N,startNumberMap:T,positionMap:E,isTeam:O,nameMap:A,initialMatches:S,finalMatches:C,results:x,isAdmin:c,hasGroupAssignment:I,allInitialConfirmed:P,hasFinalMatches:F,round1Format:R,unitCount:z,groupNameMap:L,reload:()=>g(n,u)};re(r,t.bannerMeta(B)),c&&r&&(r.innerHTML=ce(oe(e,{allMatchesConfirmed:de,hasFinalMatches:F,hasGroupAssignment:I,hasPreconfiguredFormat:R!=null&&e.stevne_fase!==`avsluttende`})),fe(r));let V=pe(n);if(I){let e=se(N,M,T,{tableId:`standing-final`,hasGroups:!0,hasElimination:!0,positionMap:E,unitLabel:O?`par`:`spelarar`});n.innerHTML=ue(t.renderMatchesHtml(B),e),ae(n,`standing-final`,f),te(n),V===`standing`&&ie(n,`standing`),t.bindMatchEvents(n,B),_(n,u)}else n.innerHTML=t.renderSetupHtml(B);r?.querySelector(`#complete-tournament-btn`)?.addEventListener(`click`,async()=>{if(!await o({title:`Fullfør turnering`,message:`Vil du fullføre turneringa? Dette kan ikkje angrast.`,danger:!0}))return;let e=[...N.filter(e=>e.gruppe?.navn===`A`),...N.filter(e=>e.gruppe?.navn===`B`),...N.filter(e=>e.gruppe?.navn!==`A`&&e.gruppe?.navn!==`B`)],{error:t}=await j(u,e);if(t){s(`Feil ved lagring av plasseringar`,`error`);return}let{error:r}=await a(u);if(r){s(`Feil ved fullføring av turnering`,`error`);return}await g(n,u)}),t.bindHeaderEvents(r,B)}catch(t){e(`avsluttendeBase.loadAndRender`,t),n.replaceChildren(l(`Kunne ikkje laste avsluttande fase.`))}}function _(e,r){if(n)return;let i=F(r,[`avsluttende`],e,g,()=>{n&&=(D(n),null)});n=y(r,t.channelName(r),i,e=>m.has(e))}return h}function ke(e,t,n){let r=e.spelarar.filter(e=>e.kasterid!=null);return g(r,t,n)}function $(e,t){return h(e,t.er_bekreftet)}var Ae=Oe({channelName:e=>`stevne-avsl-cup-${e}`,renderMatchesHtml:e=>{let{finalMatches:t,standings:n,startNumberMap:r,positionMap:i,isTeam:a,isAdmin:o}=e;return`<div class="d-flex gap-3 flex-wrap">${[...new Set(n.map(e=>e.gruppe?.navn).filter(e=>e!=null))].sort().map(e=>{let s=t.filter(t=>t.gruppe_navn===e),c=n.filter(t=>t.gruppe?.navn===e),l=c.filter(e=>e.runde_eliminert==null).length,u=c.length,d=s.length?Math.max(...s.map(e=>e.runde_nummer)):0,f=s.filter(e=>e.runde_nummer===d),p=f.length>0&&f.every(e=>e.er_bekreftet||e.er_walkover),m=s.some(e=>e.runde_navn===`Semifinale`),h=o&&(s.length===0||p)&&l>1&&!m,g=f.length>0&&f.every(e=>e.runde_navn===`Semifinale`),_=s.some(e=>e.runde_navn===`Finale`);return Me(e,s,l,u,d,h,o&&g&&p&&!_,r,i,a?`par`:`spelarar`,o)}).join(``)}</div>`},bindMatchEvents:(e,t)=>{!t.isAdmin&&t.finalMatches.length===0||Ie(e,t.stevneid,t.finalMatches,t.isAdmin,t.reload,t.startNumberMap,t.positionMap)},renderSetupHtml:e=>{let{stevne:t,isAdmin:n,round1Format:r,unitCount:i,standings:a}=e,o=r?.nA??null;if(t.stevne_fase===`avsluttende`)return n?W(a,{showPlayerList:!0,initNa:o,initFormat:r}):`<p class="text-muted fst-italic">Gruppefordeling er ikkje klar enno.</p>`;if(!n)return``;if(i<2)return`<p class="text-muted fst-italic">${t.kategori?.erlagbasert?`Minst 2 par må vere oppretta før gruppefordelinga kan setjast.`:`Minst 2 spelarar må vere påmelde før gruppefordelinga kan setjast.`}</p>`;let s=a.length>0;return W(s?a:i,{showPlayerList:s,initNa:o,initFormat:r})},bannerMeta:({standings:e,round1Format:t})=>{let n=e.filter(e=>e.gruppe?.navn===`A`).length,r=e.filter(e=>e.gruppe?.navn===`B`).length;return n||r?`Cup - A:${n} - B:${r}`:t?.nA==null?`Cup`:`Cup - A:${t.nA} - B:${e.length-t.nA}`},bindHeaderEvents:(t,n)=>{let{container:i,stevneid:a,stevne:l,standings:u,results:d,round1Format:p,allInitialConfirmed:h,hasGroupAssignment:g,groupNameMap:_,reload:v}=n;if(t?.querySelector(`#start-final-btn`)?.addEventListener(`click`,async()=>{if(!h)return;let{error:e}=await f(a,`avsluttende`);if(e){s(`Feil ved oppstart av avsluttande fase`,`error`);return}if(p?.nA!=null){let e=p.nA,t=_.A??null,n=_.B??null,i=je(u,d,e,t,n),{error:o}=await O(a,i);if(o){s(`Feil ved lagring av gruppefordeling: `+r(o),`error`);return}}await v()}),!g){let e=parseInt(i.querySelector(`#group-assignment-wrapper`)?.dataset.n??`0`)||u.length;function t(e,t){let n=i.querySelector(`input[name="${e}"]:checked`);if(n?.dataset.oppsett)try{return JSON.parse(n.dataset.oppsett)}catch{}return V(t)[0]??null}function n(e,t,n){let r=i.querySelector(`#group-preview`);r&&(r.innerHTML=G(u.map((e,t)=>({...e,cupPlassering:t+1})),e,t?.walkovers??0,n?.walkovers??0))}let o=i.querySelector(`#group-panels`);o&&o.addEventListener(`change`,r=>{let a=r.target;if(!a.matches(`input[name^="round1-format"]`))return;let o=parseInt(i.querySelector(`input[name="group-split"]:checked`)?.value??String(e)),s=e-o,c=t(`round1-format-a`,o),l=t(`round1-format-b`,s);if(a.name===`round1-format-a`){let e=i.querySelector(`#structure-a`);e&&(e.outerHTML=K(o,c,`a`))}else{let e=i.querySelector(`#structure-b`);e&&(e.outerHTML=K(s,l,`b`))}n(o,c,l)}),i.querySelectorAll(`input[name="group-split"]`).forEach(t=>{t.addEventListener(`change`,()=>{let r=parseInt(t.value),i=e-r,a=V(r)[0]??null,s=i>=2?V(i)[0]??null:null;o&&(o.innerHTML=`<div id="group-panel-a" class="final-group-col">
                ${q(`Gruppe A`,r,`round1-format-a`,a)}
              </div>`+(i>=2?`<div id="group-panel-b" class="final-group-col">
                ${q(`Gruppe B`,i,`round1-format-b`,s)}
              </div>`:``)),n(r,a,s)})}),i.querySelector(`#confirm-group-btn`)?.addEventListener(`click`,async()=>{let n=i.querySelector(`input[name="group-split"]:checked`);if(!n)return;let o=parseInt(n.value),p=e-o,h=t(`round1-format-a`,o),g=p>=2?t(`round1-format-b`,p):null,{error:y}=await c(a,{A:h,B:g,nA:o});if(y){s(`Feil ved lagring av format: `+r(y),`error`);return}let b=l.stevne_fase;if(b!==`avsluttende`&&m(l.kastemetodeInnl?.navn??``)){let{data:e}=await M(a);if(!e){s(`Fullfør den innleiande fasen før cupen kan startast`,`error`);return}let{error:t}=await f(a,`avsluttende`);if(t){s(`Feil ved oppstart av avsluttande fase: `+r(t),`error`);return}b=`avsluttende`}if(b===`avsluttende`){let e=_.A??null,t=_.B??null,n=je(u,d,o,e,t),{error:i}=await O(a,n);if(i){s(`Feil ved lagring av gruppefordeling: `+r(i),`error`);return}}s(`Gruppefordeling lagra`,`success`),await v()})}t?.querySelector(`#edit-group-assignment-btn`)?.addEventListener(`click`,async()=>{await o({title:`Tilbakestill gruppeinndeling`,message:`Gruppefordeling og format vert fjerna.`,danger:!0})&&(await Promise.all([A(a),c(a,null)]),await v())}),g&&(i.querySelectorAll(`[data-generate-group]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.generateGroup??``,n=parseInt(e.dataset.runde??`1`),r=u.filter(e=>e.gruppe?.navn===t);we(a,t,r,n,p,v)})}),i.querySelectorAll(`[data-generate-finale-group]`).forEach(t=>{t.addEventListener(`click`,async()=>{let n=t.dataset.generateFinaleGroup??``;t.disabled=!0,t.textContent=`Genererer…`;try{await Ce(a,n),await v()}catch(n){e(`cup:genererFinale`,n),s(`Feil ved generering av finale`,`error`),t.disabled=!1,t.textContent=`Generer finale`}})}))}});function je(e,t,n,r,i){return e.flatMap((e,a)=>{let o=a<n?r:i??r,s=e.startnummer==null?[]:t.filter(t=>t.startnummer===e.startnummer).map(e=>e.kasterid);return(s.length?s:[e.kasterid]).map(e=>({kasterid:e,gruppeid:o}))})}function Me(e,t,r,i,a,o,s,c,l,u,d=!0){let f=new Map;for(let e of t)f.has(e.runde_nummer)||f.set(e.runde_nummer,[]),f.get(e.runde_nummer).push(e);let p=[...f.entries()].reverse().map(([e,t])=>{let r=t[0]?.runde_navn??`Runde ${e}`,i=t.filter(e=>!e.er_walkover);return i.length?`
      <h6 class="fw-bold text-center mb-1">${n(r)}</h6>
      <div class="d-flex flex-wrap gap-2 mb-2">
        ${i.map(e=>Fe(e,c,l,d)).join(``)}
      </div>`:``}).join(``),m=a+1,h=o?`<button class="btn btn-success w-100 mt-2"
         data-generate-group="${n(e)}" data-runde="${m}">
         Generer runde ${m}
       </button>`:``,g=s?`<button class="btn btn-success w-100 mt-2" data-generate-finale-group="${n(e)}">
         Generer finale
       </button>`:``;return`
    <div class="final-group-col">
      <h6 class="text-center fw-bold mb-2">Gruppe ${n(e)} (${i} ${n(u)})</h6>
      ${h}
      ${g}
      ${p}
    </div>`}function Ne(e,t,n,r){let i=$(t,e),a=i>0||r.isConfirmed&&!r.isThreeSides||r.hasRounds?i:`—`,o=t.rep.kamp_plassering,s=e.er_bekreftet&&o!=null&&o>=n,c=e.er_bekreftet&&o!=null&&o<n,l=s?` cup-row--tapar`:c?` cup-row--vinnar`:``,u=`cup-row__score${r.canEditScore?` score-editable`:``}`,d=r.canEditScore?` data-endre-score="${e.id}"`:``;return`<div class="cup-row${l}">
      <span class="cup-row__name">${P(t,!1)}</span>
      <span class="${u}"${d}>${a}</span>
    </div>`}function Pe(e,t,n){return e.er_walkover?`<div class="cup-row">
        <span class="cup-row__name">${P(t[0]??null,!1)} <span class="badge bg-secondary">Walkover</span></span>
        <span class="cup-row__score">—</span>
      </div>`:t.map(r=>Ne(e,r,t.length,n)).join(``)}function Fe(e,t,n,r=!0){let i=ke(e,t,n),a=e.er_bekreftet||e.er_walkover,o=e.spelarar.some(e=>(e.omgangar?.length??0)>0),s={isConfirmed:a,hasRounds:o,canEditScore:r&&!e.er_tre_spelarar&&!e.er_walkover&&(!e.er_bekreftet||!o),isThreeSides:e.er_tre_spelarar},c=r&&!(a&&!o)?N(e.id):``,l=r&&e.er_tre_spelarar?`<div class="cup-card__footer">
          <button class="btn ${a?`btn-secondary`:`btn-outline-secondary`} btn-sm" id="bekrft-${e.id}">${a?`Endre plassering`:`Sett plassering`}</button>
        </div>`:``;return`
    <div class="cup-card">
      <div class="cup-card__header">
        <span class="cup-card__lane">Bane ${e.bane_nummer}</span>
        ${c}
        ${o&&!a?`<span class="live-prikk cup-card__live"></span>`:``}
      </div>
      <div class="cup-card__rows">${Pe(e,i,s)}</div>
      ${l}
    </div>`}function Ie(t,n,r,i,a,o,c){de(t);for(let l of r){let r=ke(l,o,c),u=r[0]??null,d=r[1]??null,f=u?.rep??null,p=d?.rep??null,m=P(u,!1),h=P(d,!1),g=r.flatMap(e=>e.members.map(e=>e.id)),_=async(t,n)=>{let r=[];f?.id&&r.push(v(f.id,t)),p?.id&&r.push(v(p.id,n));for(let e of[u,d])for(let t of e?.members.slice(1)??[])r.push(v(t.id,0));try{return(await Promise.all(r)).find(e=>e.error)??null}catch(t){return e(`cup:writeSideScore`,t),{error:t}}},y=()=>{L({side1Name:m,side2Name:h,currentS1:$(u,l),currentS2:$(d,l),baneLabel:`Bane ${l.bane_nummer??`?`}`,rundeLabel:l.runde_navn??`Runde ${l.runde_nummer}`,playerIds:g,hasRounds:l.spelarar.some(e=>(e.omgangar?.length??0)>0),logPrefix:`cup`,onSave:_,onSaved:async()=>{await Le(n,l,r,a)||await a()}})};if(t.querySelector(`#bekrft-${l.id}`)?.addEventListener(`click`,()=>{Te(l,r,n,a)}),i&&!l.er_tre_spelarar&&!l.er_walkover){let e=r.flatMap(e=>e.members.map(e=>e.kasterid)),i=l.er_bekreftet?()=>{I([{name:m,score:$(u,l)},{name:h,score:$(d,l)}],async([t=0,r=0])=>{if(g.length){let{error:e}=await S(g);if(e)return s(`DB-feil ved sletting av omgangar`,`error`),!1}if(await _(t,r))return s(`DB-feil ved oppdatering av score`,`error`),!1;let i=t>=r?u:d,o=t>=r?d:u,c=i?.members.map(e=>e.kasterid)??[],f=o?.members.map(e=>e.kasterid)??[],p=[...c.map(e=>({kasterid:e,plassering:1})),...f.map(e=>({kasterid:e,plassering:2}))],{error:m}=await x(l.id,p);return m?(s(`DB-feil ved oppdatering av plassering`,`error`),!1):(await E({stevneId:n,roundNumber:l.runde_nummer,roundName:l.runde_navn,allThrowerIds:e,newWinnerIds:c,newLoserIds:f}),await a(),!0)},{baneLabel:`Bane ${l.bane_nummer??`?`}`,rundeLabel:l.runde_navn??`Runde ${l.runde_nummer}`})}:y;t.querySelectorAll(`[data-endre-score="${l.id}"]`).forEach(e=>e.addEventListener(`click`,i))}}}async function Le(e,t,n,r){let i=n[0]??null,a=n[1]??null,{data:c}=await C(t.id),l=e=>e?.members.reduce((e,t)=>{let n=c.find(e=>e.id===t.id);return e+_(n??t,!1)},0)??0,u=l(i),d=l(a);if(u===0&&d===0&&!await o({title:`Ingen score registrert`,message:`Vil du bekrefte kampen likevel?`}))return!1;let f=u>=d?i:a,p=u>=d?a:i,m=n.flatMap(e=>e.members.map(e=>e.kasterid)),{error:h}=await T({kampId:t.id,sides:[b(i),b(a)],outcome:{type:`cup-ranked`,stevneId:e,roundNumber:t.runde_nummer,roundName:t.runde_navn,allThrowerIds:m,eliminatedIds:p?.members.map(e=>e.kasterid)??[],advancingSides:f?[f.members.map(e=>e.kasterid)]:[]}});return h?(s(`DB-feil ved bekreft`,`error`),!1):(await r(),!0)}export{Ae as render};