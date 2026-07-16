import{n as e,t}from"./logError-D5z16FyH.js";import{C as n,Q as r,S as i,St as a,bt as o,dt as s,gt as c,ht as l,p as u,vt as d,w as f,xt as p}from"./index-DWg2upQi.js";import{t as m}from"./LoadingState-BWi0wPLz.js";import{C as h,N as g,O as _,T as v,a as y,c as b,i as x,t as S,v as C,y as w}from"./kampService-CnBu9jM9.js";import{n as T}from"./navigation-BZAaZHac.js";import{b as E,c as D,d as O,g as k,h as A,l as ee,m as j,n as te,p as M,r as ne,s as N,t as P,u as re,v as ie,x as F,y as ae}from"./resultatService-CBgOBxBZ.js";import{n as I,t as L}from"./scoreEditor-BLk0yNwD.js";function R(e){let t=[...e];for(let e=t.length-1;e>0;e--){let n=Math.floor(Math.random()*(e+1));[t[e],t[n]]=[t[n],t[e]]}return t}function z(e){return e===2||e===4?!0:e<2?!1:e%3==0?z(Math.floor(e/3)*2):e%2==0?z(e/2):!1}function B(e){return e%3==0?{c3:e/3,c2:0}:e%2==0?{c3:0,c2:e/2}:{c3:0,c2:0}}function V(e){if(e<2)return[];let t=[],n=Math.floor(e/2);for(let r=e%3;r<=n&&r<=3&&t.filter(e=>e.c2===0).length<2;r+=3){let n=(e-r)/3;if(n<1)break;z(r+2*n)&&t.push({walkovers:r,c3:n,c2:0})}for(let r=e%2;r<=n&&r<=3&&t.filter(e=>e.c3===0).length<2;r+=2){let n=(e-r)/2;if(n<1)break;let i=r+n;!t.some(e=>e.walkovers===r&&e.c3===0&&e.c2===n)&&z(i)&&t.push({walkovers:r,c3:0,c2:n})}return t.sort((e,t)=>e.walkovers-t.walkovers||t.c3-e.c3),t}function H(e){return e===2?!0:V(e).length>0}function U(e){let t=Math.ceil(e*.5),n=Math.round(e*.8),r=[];for(let i=n;i>=t;i--){let t=e-i;t>=2&&H(i)&&H(t)&&r.push({nA:i,nB:t})}return r}function W(e,{runde1:t=null,walkovers1:n=null}={}){let r=[],i=e,a=1,o=!0;for(;i>2;){let e,s,c;if(o){let r=t;!r&&n!==null&&(r={walkovers:n,c3:Math.floor((i-n)/3),c2:0}),r||=V(i)[0]??{walkovers:i%3,c3:Math.floor(i/3),c2:0},c=r.walkovers,e=r.c3,s=r.c2,o=!1}else{let t=B(i);e=t.c3,s=t.c2,c=0}let l=e*2+s+c;r.push({runde:a,players:i,lanes:e+s,threePlayers:e>0,walkovers:c,advancing:l}),i=l,a++}return r}function G(e,{medSeeding:t=!0,isRunde1:n=!1,walkoverTall:r=null,runde1Oppsett:i=null,shuffleFn:a}={}){let o=a??R,s=[],c=[...e];if(n){let e=i?.walkovers??r??c.length%3;if(e>0){let t=c.slice(0,e);c=c.slice(e);for(let e of t)s.push({players:[e.kasterid],isWalkover:!0,isThreePlayers:!1})}}let l=c.length,u,d;if(i&&n)u=i.c3,d=i.c2;else if(n)u=Math.floor(l/3),d=0;else{let e=B(l);u=e.c3,d=e.c2}let f=u+d;if(t&&f>0){let e=o(c.slice(0,f)),t=o(c.slice(f,2*f)),n=o(c.slice(2*f)),r=0;for(let i=0;i<f;i++){let a=i<u,o=[e[i],t[i]].filter(e=>e!=null),c=a?n[r]:void 0;c&&(o.push(c),r++),s.push({players:o.map(e=>e.kasterid),isWalkover:!1,isThreePlayers:a})}}else{let e=o(c),t=0;for(let n=0;n<u;n++)s.push({players:e.slice(t,t+3).map(e=>e.kasterid),isWalkover:!1,isThreePlayers:!0}),t+=3;for(let n=0;n<d;n++)s.push({players:e.slice(t,t+2).map(e=>e.kasterid),isWalkover:!1,isThreePlayers:!1}),t+=2}return s}function K(e,{showPlayerList:t=!0,initNa:n=null,initFormat:r=null}={}){let i=typeof e==`number`?e:e.length,a=typeof e==`number`?[]:e.map((e,t)=>({...e,cupPlassering:t+1})),o=U(i),s=n===i?i:n!=null&&o.some(e=>e.nA===n)?n:o[0]?.nA??i,c=i-s,l=o.filter(e=>V(e.nA).some(e=>e.c3>0)),u=o.filter(e=>!V(e.nA).some(e=>e.c3>0)),d=V(i).length>0,f=(e,t)=>e.map((e,r)=>{let a=e.nA===s&&n!==i,o=t+r;return`
      <div class="form-check">
        <input class="form-check-input" type="radio" name="group-split" id="split-${o}" value="${e.nA}" ${a?`checked`:``}>
        <label class="form-check-label" for="split-${o}">A:${e.nA} — B:${e.nB}</label>
      </div>`}).join(``),p=[];l.length&&p.push(`<div class="text-muted small fw-semibold mb-1">3 spillere per bane (A)</div>${f(l,0)}`),u.length&&(p.length&&p.push(`<hr class="my-2">`),p.push(`<div class="text-muted small fw-semibold mb-1">2 spillere per bane (A)</div>${f(u,l.length)}`)),d&&(p.length&&p.push(`<hr class="my-2">`),p.push(`
      <div class="form-check">
        <input class="form-check-input" type="radio" name="group-split" id="split-none" value="${i}" ${n===i?`checked`:``}>
        <label class="form-check-label" for="split-ingen">Alle i A</label>
      </div>`));let m=p.join(``),h=r?.A??V(s)[0]??null,g=c>=2?r?.B??V(c)[0]??null:null,_=t?`<div id="group-preview">${q(a,s,h?.walkovers??0,g?.walkovers??0)}</div>`:``;return`
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
            ${Y(`Gruppe A`,s,`round1-format-a`,h)}
          </div>
          ${c>=2?`<div id="group-panel-b" class="final-group-col">
            ${Y(`Gruppe B`,c,`round1-format-b`,g)}
          </div>`:``}
        </div>
      </div>
      ${_}
      <div class="confirm-banner">
        <button id="confirm-group-btn" class="btn btn-success btn-lg w-100">Bekreft gruppefordeling</button>
      </div>
    </div>
  `}function q(e,t,n=0,r=0){let i=e.slice(0,t),a=e.slice(t);function o(e,t=0){return e.map((e,n)=>{let r=n<t;return`
      <tr>
        <td>${e.cupPlassering}</td>
        <td>${p(e.navn??``)}${r?` <span class="badge bg-info text-dark">Walkover</span>`:``}</td>
        <td class="text-center">${e.kamp_poeng??0}</td>
        <td class="text-center">${e.score_poeng??0}</td>
      </tr>`}).join(``)}let s=`
    <thead class="org-thead"><tr>
      <th class="th-32">#</th><th>NAMN</th>
      <th class="th-44 text-center">KP</th>
      <th class="th-44 text-center">SP</th>
    </tr></thead>`,c=`
    <table class="table table-bordered table-sm bg-white mb-0">
      ${s}
      <tbody>${o(i,n)}</tbody>
    </table>`,l=a.length?`
    <table class="table table-bordered table-sm bg-white mb-0">
      ${s}
      <tbody>${o(a,r)}</tbody>
    </table>`:``;return`
    <div class="d-flex gap-3 flex-wrap">
      <div class="avsl-gruppe-kol">
        <h6 class="fw-bold text-center">GRUPPE A (${i.length})</h6>
        ${c}
      </div>
      ${a.length?`<div class="avsl-gruppe-kol">
        <h6 class="fw-bold text-center">GRUPPE B (${a.length})</h6>
        ${l}
      </div>`:``}
    </div>`}function oe(e){let t=e.c3>0?3:2;return`${e.walkovers} walkover - ${t} deltakere per bane`}function se(e,t,n,r=null){let i=V(t);return i.length<=1?``:`<div class="d-flex flex-column align-items-start gap-1 mb-2">${i.map((e,t)=>{let i=`${n}-${t}`,a=JSON.stringify(e),o=r?e.walkovers===r.walkovers&&e.c3===r.c3&&e.c2===r.c2:t===0,s=e.c3>0?`btn-outline-success`:`btn-outline-warning`;return`
      <input type="radio" class="btn-check" name="${n}" id="${i}"
        value='${a}' data-oppsett='${a}' autocomplete="off" ${o?`checked`:``}>
      <label class="btn btn-sm ${s}" for="${i}">${oe(e)}</label>`}).join(``)}</div>`}function J(e,t,n){return`<div id="structure-${n}">
    <table class="table table-sm table-bordered mb-0">
      <thead><tr>
        <th>Runde</th><th>Deltakere</th><th>Baner</th><th>Per bane</th>
      </tr></thead>
      <tbody>${(e>=2?W(e,{runde1:t}):[]).map((e,n)=>{let r=e.walkovers??0,i=e.players-r,a=r>0?`${i} <span class="text-muted">(${r} w.o.)</span>`:`${i}`,o;return o=n===0&&t?t.c3>0&&t.c2>0?`2/3`:t.c3>0?`3`:`2`:e.players%e.lanes===0?String(e.players/e.lanes):`2/3`,`<tr${e.threePlayers?` class="fw-bold"`:``}>
      <td>${e.runde}</td>
      <td>${a}</td>
      <td>${e.lanes}</td>
      <td>${o}</td>
    </tr>`}).join(``)}</tbody>
    </table>
  </div>`}function Y(e,t,n,r){let i=n.slice(-1),a=se(e,t,n,r);return`
    <div class="card">
      <div class="card-body">
        <h6 class="fw-bold mb-2">${a?`${e}: Velg format`:`${e} (${t})`}</h6>
        ${a}
        ${J(t,r,i)}
      </div>
    </div>`}function X(){return crypto.randomUUID()}async function Z(t){let{data:n,error:r}=await e.from(`resultat`).select(`kasterid, startnummer, posisjon`).eq(`stevneid`,t);if(r)throw Error(`Feil ved henting av resultat: `+r.message);let i={},a={};for(let e of n??[])e.kasterid==null||e.startnummer==null||(i[e.kasterid]=e.startnummer,(a[e.startnummer]??=[]).push({kasterid:e.kasterid,posisjon:e.posisjon}));let o={};for(let[e,t]of Object.entries(a))t.sort((e,t)=>(e.posisjon??1/0)-(t.posisjon??1/0)||e.kasterid-t.kasterid),o[Number(e)]=t.map(e=>e.kasterid);return{kasteridToSnr:i,snrToMembers:o}}function ce(e,t){let n=e.kasteridToSnr[t];return(n==null?void 0:e.snrToMembers[n])??[t]}async function Q(t,n,r,i,a,o=0,s=null){let c=n.map(()=>X()),l=o,u=n.map((e,n)=>({match_id:c[n],stevneid:t,fase:`avsluttende`,runde_nummer:r,gruppe_navn:i??null,bane_nummer:e.isWalkover?null:++l,er_bekreftet:e.isWalkover,er_walkover:e.isWalkover,er_tre_spelarar:e.isThreePlayers,runde_navn:s})),{data:d,error:f}=await e.from(`kamp`).insert(u).select(`id, match_id`);if(f)throw Error(`Feil ved innsetting av cup-kampar: `+f.message);let p=Object.fromEntries(d.map(e=>[e.match_id,e.id])),m=[];for(let[e,t]of n.entries()){let n=p[c[e]];t.players.forEach(e=>{for(let t of ce(a,e))m.push({kampid:n,kasterid:t,score_poeng:0,kamp_poeng:0,antall_ringer:0})})}let{error:h}=await e.from(`kamp_spelar`).insert(m);if(h)throw Error(`Feil ved innsetting av cup-spelarar: `+h.message);return d.length}async function le(t,n,r,i=null){let a=[`A`,`B`,`C`],o=0,s=await Z(t);for(let c of n){let n=G(c.spelarar,{medSeeding:r,isRunde1:!0,runde1Oppsett:c.runde1Oppsett??null}),{data:l}=await e.from(`kamp`).select(`bane_nummer`).eq(`stevneid`,t).eq(`fase`,`avsluttende`).eq(`runde_nummer`,1).not(`bane_nummer`,`is`,null).order(`bane_nummer`,{ascending:!1}).limit(1),u=l?.[0]?.bane_nummer??0,d=0;if(i&&c.groupName){let e=a.indexOf(c.groupName);for(let t of a.slice(0,e)){let e=i[t];e&&(d+=(e.c3??0)+(e.c2??0))}}let f=Math.max(u,d),p=c.spelarar.length===4;o+=await Q(t,n,1,c.groupName,s,f,p?`Semifinale`:null)}return o}async function ue(t,n){let{data:r}=await e.from(`kamp`).select(`bane_nummer`).eq(`stevneid`,t).eq(`fase`,`avsluttende`).eq(`runde_nummer`,n).not(`bane_nummer`,`is`,null).order(`bane_nummer`,{ascending:!1}).limit(1);return r?.[0]?.bane_nummer??0}async function de(t,n,r,i){let{data:a}=await e.from(`kamp`).select(`runde_nummer`).eq(`stevneid`,t).eq(`fase`,`avsluttende`).eq(`gruppe_navn`,n).order(`runde_nummer`,{ascending:!1}).limit(1),o=(a?.[0]?.runde_nummer??0)+1,s=i.length===4,c=G(i,{medSeeding:r,isRunde1:!1}),l=await ue(t,o);return{roundNumber:o,matchCount:await Q(t,c,o,n,await Z(t),l,s?`Semifinale`:null)}}async function fe(t,n){let{data:r}=await e.from(`kamp`).select(`id, runde_nummer, spelarar:kamp_spelar(id, kasterid, score_poeng, omgangar:kamp_omgang(score))`).eq(`stevneid`,t).eq(`fase`,`avsluttende`).eq(`gruppe_navn`,n).eq(`runde_navn`,`Semifinale`).eq(`er_bekreftet`,!0);if(!r?.length)throw Error(`Semifinalane er ikkje bekrefta.`);let i=await Z(t),a=r,o=a[0].runde_nummer+1,s=[],c=[];for(let e of a){let t=new Map;for(let n of e.spelarar??[]){if(n.kasterid==null)continue;let e=i.kasteridToSnr[n.kasterid]??`kaster-${n.kasterid}`,r=t.get(e)??{kasterids:[],score:0};r.kasterids.push(n.kasterid),r.score+=n.omgangar?.length?n.omgangar.reduce((e,t)=>e+(t.score??0),0):n.score_poeng??0,t.set(e,r)}let n=[...t.values()].sort((e,t)=>t.score-e.score);n[0]&&s.push(n[0].kasterids),n[1]&&c.push(n[1].kasterids)}let l=await ue(t,o),u={match_id:X(),stevneid:t,fase:`avsluttende`,runde_nummer:o,gruppe_navn:n,bane_nummer:l+1,runde_navn:`Finale`,er_bekreftet:!1,er_walkover:!1,er_tre_spelarar:!1},d={match_id:X(),stevneid:t,fase:`avsluttende`,runde_nummer:o,gruppe_navn:n,bane_nummer:l+2,runde_navn:`Bronsefinale`,er_bekreftet:!1,er_walkover:!1,er_tre_spelarar:!1},{data:f,error:p}=await e.from(`kamp`).insert([u,d]).select(`id, runde_navn`);if(p)throw Error(`Feil: `+p.message);let m=f,h=m.find(e=>e.runde_navn===`Finale`).id,g=m.find(e=>e.runde_navn===`Bronsefinale`).id,_=[...s.flat().map(e=>({kampid:h,kasterid:e,score_poeng:0,kamp_poeng:0,antall_ringer:0})),...c.flat().map(e=>({kampid:g,kasterid:e,score_poeng:0,kamp_poeng:0,antall_ringer:0}))],{error:v}=await e.from(`kamp_spelar`).insert(_);if(v)throw Error(`Feil: `+v.message)}function pe(e,r,i,a,o,s){let c=i.filter(e=>e.runde_eliminert==null),l=i.length,u=c.length,d=a===1?o?.[r]??null:null,f=d?.walkovers??0,m=(d?d.c3:u%3==0?u/3:0)+(d?d.c2:u%3==0?0:u/2),h=c.slice(f,f+m),g=c.slice(f+m,f+2*m),_=c.slice(f+2*m),v=document.createElement(`div`);v.className=`final-dialog-overlay`,document.body.appendChild(v);let y=null,b=!1,x=0,S=0;function C(e){if(!b)return;let t=v.querySelector(`.final-dialog-card-wide`);if(!t)return;let n=e.clientX-x,r=e.clientY-S;y={left:n,top:r},t.style.left=`${n}px`,t.style.top=`${r}px`}function w(){b&&(b=!1,document.body.style.userSelect=``)}document.addEventListener(`mousemove`,C),document.addEventListener(`mouseup`,w);function T(){document.removeEventListener(`mousemove`,C),document.removeEventListener(`mouseup`,w)}function E(e){return`<div class="d-flex justify-content-between gap-2 py-1">
      <span class="small">${p(e.navn??``)}</span>
      <span class="small text-muted text-nowrap">${e.kamp_poeng??0}p (${e.score_poeng??0})</span>
    </div>`}function D(i){let C=c.slice(0,f),w=C.length>0?`<div class="mb-3">
          <strong class="d-block mb-1">Walkovers (går vidare utan kamp):</strong>
          ${C.map(E).join(``)}
        </div>`:``,O=i===!0&&m>0?`<div class="alert alert-info small mb-3 py-2">
          Dette er seedinggrupper, ikkje kampar. Spelarar i same gruppe kan ikkje trekkast mot kvarandre. Kampane blir oppretta når du klikkar «Bekreft og opprett kampar».
        </div>`:``,k=i===!0&&m>0?`<div class="d-flex gap-3 flex-wrap mb-3">
          ${[{label:`Seeding 1`,pool:h},{label:`Seeding 2`,pool:g},..._.length?[{label:`Seeding 3`,pool:_}]:[]].map(({label:e,pool:t})=>`
            <div class="card flex-grow-1">
              <div class="card-body p-2">
                <strong class="d-block mb-2 small text-uppercase">${p(e)}</strong>
                ${t.map(E).join(``)}
              </div>
            </div>`).join(``)}
        </div>`:`<div class="final-player-columns mb-3">
          ${c.slice(f).map((e,t)=>`
            <div class="small d-flex justify-content-between gap-2">
              <span>${f+t+1}. ${p(e.navn??``)}</span>
              <span class="text-muted text-nowrap">${e.kamp_poeng??0}p (${e.score_poeng??0})</span>
            </div>`).join(``)}
        </div>`;v.innerHTML=`
      <div class="card final-dialog-card-wide">
        <div class="final-dialog-drag-handle">
          <p class="text-muted small text-uppercase fw-semibold mb-1">Trekning</p>
          <h5 class="mb-1">Gruppe ${p(r)} — Runde ${a}</h5>
          <p class="text-muted small mb-0">${u} av ${l} spelarar igjen</p>
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
          ${O}
          ${w}
          ${k}
        </div>
        <div class="final-dialog-footer">
          <div class="d-flex gap-2">
            <button id="bekreft-gen-btn" class="btn btn-primary" ${i===null?`disabled`:``}>Bekreft og opprett kampar</button>
            <button id="avbryt-gen-btn" class="btn btn-secondary">Avbryt</button>
          </div>
        </div>
      </div>`;let A=v.querySelector(`.final-dialog-card-wide`);y&&(A.style.position=`fixed`,A.style.left=`${y.left}px`,A.style.top=`${y.top}px`,A.style.margin=`0`,A.style.zIndex=`10000`),A.querySelector(`.final-dialog-drag-handle`).addEventListener(`mousedown`,e=>{let t=A.getBoundingClientRect();A.style.position=`fixed`,A.style.left=`${t.left}px`,A.style.top=`${t.top}px`,A.style.margin=`0`,A.style.zIndex=`10000`,x=e.clientX-t.left,S=e.clientY-t.top,y={left:t.left,top:t.top},b=!0,document.body.style.userSelect=`none`}),v.querySelector(`#seeding-ja`).addEventListener(`change`,()=>D(!0)),v.querySelector(`#seeding-nei`).addEventListener(`change`,()=>D(!1)),v.querySelector(`#avbryt-gen-btn`).addEventListener(`click`,()=>{T(),v.remove()}),v.querySelector(`#bekreft-gen-btn`).addEventListener(`click`,async()=>{if(i===null)return;let l=v.querySelector(`#bekreft-gen-btn`);l.disabled=!0,l.textContent=`Lagrer…`;try{let t=c.map((e,t)=>({kasterid:e.kasterid,plassering:t+1}));if(a===1){let n={A:o?.A??void 0,B:o?.B??void 0};await le(e,[{groupName:r,spelarar:t,runde1Oppsett:d}],i,o?n:null)}else await de(e,r,i,t);T(),v.remove(),await s()}catch(e){t(`cup:genererRunde`,e),n(`Feil ved generering av runde`,`error`),l.disabled=!1,l.textContent=`Bekreft og opprett kampar`}})}D(null)}function me(e,t,r,i){let a=t.map(e=>F(e,!1)),o=[],s=document.createElement(`div`);s.className=`final-dialog-overlay`,document.body.appendChild(s);function c(){let l=o.length===2?t.find(e=>!o.includes(e.rep.kasterid)):null;s.innerHTML=`
      <div class="card p-4 final-dialog-card">
        <h5 class="card-title mb-1">Bekreft 3-spelar kamp</h5>
        <p class="text-muted small mb-3">Vel dei to som går vidare. Den gjenverande er utslått.</p>
        <div class="d-flex flex-column gap-2 mb-3">
          ${t.map((e,t)=>{let n=o.indexOf(e.rep.kasterid),r=n!==-1,i=!!l&&l.rep.kasterid===e.rep.kasterid,s=n===0?`1. plass`:n===1?`2. plass`:``;return`<button
              class="btn ${r?`btn-success`:i?`btn-outline-danger`:`btn-outline-secondary`} text-start d-flex justify-content-between align-items-center"
              data-kasterid="${e.rep.kasterid}"
              ${i?`disabled`:``}
            ><span>${a[t]}</span>${s?`<span class="badge bg-success-subtle text-success-emphasis">${s}</span>`:i?`<span class="badge bg-danger">Utslått</span>`:``}</button>`}).join(``)}
        </div>
        <div class="d-flex gap-2">
          <button id="bekreft-tre-btn" class="btn btn-success" ${o.length===2?``:`disabled`}>Bekreft</button>
          <button id="avbryt-tre-btn" class="btn btn-secondary">Avbryt</button>
        </div>
      </div>
    `,s.querySelector(`#avbryt-tre-btn`).addEventListener(`click`,()=>s.remove()),s.querySelectorAll(`[data-kasterid]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=Number(e.dataset.kasterid),n=o.indexOf(t);n===-1?o.length<2&&o.push(t):o.splice(n,1),c()})}),s.querySelector(`#bekreft-tre-btn`)?.addEventListener(`click`,async()=>{if(o.length!==2)return;let a=t.find(e=>!o.includes(e.rep.kasterid))??null,c=o.map(e=>t.find(t=>t.rep.kasterid===e)).filter(e=>e!=null).map(e=>e.members.map(e=>e.kasterid)),l=t.flatMap(e=>e.members.map(e=>e.kasterid));s.remove();let{error:u}=await S({kampId:e.id,stevneId:r,roundNumber:e.runde_nummer,roundName:e.runde_navn,allThrowerIds:l,eliminatedIds:a?.members.map(e=>e.kasterid)??[],advancingSides:c});if(u){n(`DB-feil ved bekreft`,`error`);return}await i()})}c()}function he(e){return typeof e!=`object`||!e||Array.isArray(e)?null:e}function ge(e){return e.map(e=>({er_bekreftet:e.er_bekreftet,er_walkover:e.er_walkover,runde_nummer:e.runde_nummer,bane_nummer:e.bane_nummer,spelarar:_e(e.spelarar)}))}function _e(e){return e.map(e=>({kasterid:e.kasterid??0,kamp_poeng:e.kamp_poeng??0,score_poeng:e.score_poeng??0,antall_ringer:e.antall_ringer,omgangar:e.omgangar,kaster:e.kaster}))}function ve(e){let i=null,o=null,l=!1,d=new Set;async function p(e,{id:t,isAdmin:n=!1},r=null){o=r,l=n,i&&=(await T(i),null),e.replaceChildren(m(`Laster…`)),await h(e,t)}async function h(i,p){try{let[{data:t},{data:m},{data:_},{data:v},{count:b}]=await Promise.all([r(p),y(p),ne(p),te([`A`,`B`]),s(p)]);if(!t){i.replaceChildren(a(`Stevne ikkje funne.`));return}let x=_.filter(e=>e.kasterid!=null),S=m.filter(e=>e.fase===`innledende`),C=m.filter(e=>e.fase===`avsluttende`),w={},T={},j=new Map;for(let e of x)e.startnummer!=null&&(w[e.kasterid]=e.startnummer,j.set(e.startnummer,(j.get(e.startnummer)??0)+1)),e.posisjon!=null&&(T[e.kasterid]=e.posisjon);let M=[...j.values()].some(e=>e>1),N={};for(let e of m)for(let t of e.spelarar)t.kasterid&&t.kaster&&!N[t.kasterid]&&(N[t.kasterid]=`${t.kaster.fornavn} ${t.kaster.etternavn}`);let P=ge(S),F=O(P,x,N,w,T),I=S.length>0&&S.every(e=>e.er_bekreftet),L=C.length>0,R=(S.length>0||L)&&S.every(e=>e.er_bekreftet)&&C.every(e=>e.er_bekreftet),z=x.some(e=>e.gruppe!=null),B=Object.fromEntries(v.map(e=>[e.navn,e.id])),V=he(t.runde1_format),H=b??0;if(t.kategori?.erlagbasert){let{data:e}=await u(p);H=e.length}let U={container:i,stevneid:p,stevne:t,standings:F,startNumberMap:w,positionMap:T,isTeam:M,nameMap:N,initialMatches:S,finalMatches:C,results:x,isAdmin:l,hasGroupAssignment:z,allInitialConfirmed:I,hasFinalMatches:L,round1Format:V,unitCount:H,groupNameMap:B,reload:()=>h(i,p)};l&&o&&(o.innerHTML=k(t,{allMatchesConfirmed:R,hasFinalMatches:L,hasGroupAssignment:z,hasPreconfiguredFormat:V!=null&&t.stevne_fase!==`avsluttende`}));let W=A(i);if(z){let t=ae(F,P,w,{tableId:`standing-final`,hasGroups:!0,hasElimination:!0,positionMap:T,unitLabel:M?`par`:`spelarar`});i.innerHTML=ie(e.renderMatchesHtml(U),t),ee(i,`standing-final`,d),re(i),W===`standing`&&E(i,`standing`),e.bindMatchEvents(i,U),g(i,p)}else i.innerHTML=e.renderSetupHtml(U);o?.querySelector(`#complete-tournament-btn`)?.addEventListener(`click`,async()=>{if(!await f({title:`Fullfør turnering`,message:`Vil du fullføre turneringa? Dette kan ikkje angrast.`,danger:!0}))return;let{error:e}=await D(p,[...F.filter(e=>e.gruppe?.navn===`A`),...F.filter(e=>e.gruppe?.navn===`B`),...F.filter(e=>e.gruppe?.navn!==`A`&&e.gruppe?.navn!==`B`)]);if(e){n(`Feil ved lagring av plasseringar`,`error`);return}let{error:t}=await c(p);if(t){n(`Feil ved fullføring av turnering`,`error`);return}await h(i,p)}),e.bindHeaderEvents(o,U)}catch(e){t(`avsluttendeBase.loadAndRender`,e),i.replaceChildren(a(`Kunne ikkje laste avsluttande fase.`))}}function g(t,n){if(i)return;let r=j(n,[`avsluttende`],t,h,()=>{i&&=(T(i),null)});i=w(n,e.channelName(n),r)}return p}function ye(e,t,n){return _(e.spelarar.filter(e=>e.kasterid!=null),t,n)}function $(e){return e?.members.reduce((e,t)=>e+g(t),0)??0}var be=ve({channelName:e=>`stevne-avsl-cup-${e}`,renderMatchesHtml:e=>{let{finalMatches:t,standings:n,startNumberMap:r,positionMap:i,isTeam:a,isAdmin:o}=e;return`<div class="d-flex gap-3 flex-wrap">${[...new Set(n.map(e=>e.gruppe?.navn).filter(e=>e!=null))].sort().map(e=>{let s=t.filter(t=>t.gruppe_navn===e),c=n.filter(t=>t.gruppe?.navn===e),l=c.filter(e=>e.runde_eliminert==null).length,u=c.length,d=s.length?Math.max(...s.map(e=>e.runde_nummer)):0,f=s.filter(e=>e.runde_nummer===d),p=f.length>0&&f.every(e=>e.er_bekreftet||e.er_walkover),m=s.some(e=>e.runde_navn===`Semifinale`),h=o&&(s.length===0||p)&&l>1&&!m,g=f.length>0&&f.every(e=>e.runde_navn===`Semifinale`),_=s.some(e=>e.runde_navn===`Finale`);return Se(e,s,l,u,d,h,o&&g&&p&&!_,r,i,a?`par`:`spelarar`,o)}).join(``)}</div>`},bindMatchEvents:(e,t)=>{!t.isAdmin&&t.finalMatches.length===0||Oe(e,t.stevneid,t.finalMatches,t.isAdmin,t.reload,t.startNumberMap,t.positionMap)},renderSetupHtml:e=>{let{stevne:t,isAdmin:n,round1Format:r,unitCount:i,standings:a}=e,o=r?.nA??null;if(t.stevne_fase===`avsluttende`)return n?K(a,{showPlayerList:!0,initNa:o,initFormat:r}):`<p class="text-muted fst-italic">Gruppefordeling er ikkje klar enno.</p>`;if(!n)return``;if(i<2)return`<p class="text-muted fst-italic">${t.kategori?.erlagbasert?`Minst 2 par må vere oppretta før gruppefordelinga kan setjast.`:`Minst 2 spelarar må vere påmelde før gruppefordelinga kan setjast.`}</p>`;let s=a.length>0;return K(s?a:i,{showPlayerList:s,initNa:o,initFormat:r})},bindHeaderEvents:(e,r)=>{let{container:a,stevneid:o,stevne:s,standings:c,results:u,round1Format:p,allInitialConfirmed:m,hasGroupAssignment:h,groupNameMap:g,reload:_}=r;if(e?.querySelector(`#start-final-btn`)?.addEventListener(`click`,async()=>{if(!m)return;let{error:e}=await d(o,`avsluttende`);if(e){n(`Feil ved oppstart av avsluttande fase`,`error`);return}if(p?.nA!=null){let e=p.nA,{error:t}=await N(o,xe(c,u,e,g.A??null,g.B??null));if(t){n(`Feil ved lagring av gruppefordeling: `+i(t),`error`);return}}await _()}),!h){let e=parseInt(a.querySelector(`#group-assignment-wrapper`)?.dataset.n??`0`)||c.length;function t(e,t){let n=a.querySelector(`input[name="${e}"]:checked`);if(n?.dataset.oppsett)try{return JSON.parse(n.dataset.oppsett)}catch{}return V(t)[0]??null}function r(e,t,n){let r=a.querySelector(`#group-preview`);r&&(r.innerHTML=q(c.map((e,t)=>({...e,cupPlassering:t+1})),e,t?.walkovers??0,n?.walkovers??0))}let d=a.querySelector(`#group-panels`);d&&d.addEventListener(`change`,n=>{let i=n.target;if(!i.matches(`input[name^="round1-format"]`))return;let o=parseInt(a.querySelector(`input[name="group-split"]:checked`)?.value??String(e)),s=e-o,c=t(`round1-format-a`,o),l=t(`round1-format-b`,s);if(i.name===`round1-format-a`){let e=a.querySelector(`#structure-a`);e&&(e.outerHTML=J(o,c,`a`))}else{let e=a.querySelector(`#structure-b`);e&&(e.outerHTML=J(s,l,`b`))}r(o,c,l)}),a.querySelectorAll(`input[name="group-split"]`).forEach(t=>{t.addEventListener(`change`,()=>{let n=parseInt(t.value),i=e-n,a=V(n)[0]??null,o=i>=2?V(i)[0]??null:null;d&&(d.innerHTML=`<div id="group-panel-a" class="final-group-col">
                ${Y(`Gruppe A`,n,`round1-format-a`,a)}
              </div>`+(i>=2?`<div id="group-panel-b" class="final-group-col">
                ${Y(`Gruppe B`,i,`round1-format-b`,o)}
              </div>`:``)),r(n,a,o)})}),a.querySelector(`#confirm-group-btn`)?.addEventListener(`click`,async()=>{let r=a.querySelector(`input[name="group-split"]:checked`);if(!r)return;let d=parseInt(r.value),f=e-d,{error:p}=await l(o,{A:t(`round1-format-a`,d),B:f>=2?t(`round1-format-b`,f):null,nA:d});if(p){n(`Feil ved lagring av format: `+i(p),`error`);return}if(s.stevne_fase===`avsluttende`){let{error:e}=await N(o,xe(c,u,d,g.A??null,g.B??null));if(e){n(`Feil ved lagring av gruppefordeling: `+i(e),`error`);return}}n(`Gruppefordeling lagra`,`success`),await _()})}e?.querySelector(`#edit-group-assignment-btn`)?.addEventListener(`click`,async()=>{await f({title:`Tilbakestill gruppeinndeling`,message:`Gruppefordeling og format vert fjerna.`,danger:!0})&&(await Promise.all([P(o),l(o,null)]),await _())}),h&&(a.querySelectorAll(`[data-generate-group]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.generateGroup??``,n=parseInt(e.dataset.runde??`1`);pe(o,t,c.filter(e=>e.gruppe?.navn===t),n,p,_)})}),a.querySelectorAll(`[data-generate-finale-group]`).forEach(e=>{e.addEventListener(`click`,async()=>{let r=e.dataset.generateFinaleGroup??``;e.disabled=!0,e.textContent=`Genererer…`;try{await fe(o,r),await _()}catch(r){t(`cup:genererFinale`,r),n(`Feil ved generering av finale`,`error`),e.disabled=!1,e.textContent=`Generer finale`}})}))}});function xe(e,t,n,r,i){return e.flatMap((e,a)=>{let o=a<n?r:i??r,s=e.startnummer==null?[]:t.filter(t=>t.startnummer===e.startnummer).map(e=>e.kasterid);return(s.length?s:[e.kasterid]).map(e=>({kasterid:e,gruppeid:o}))})}function Se(e,t,n,r,i,a,o,s,c,l,u=!0){let d=new Map;for(let e of t)d.has(e.runde_nummer)||d.set(e.runde_nummer,[]),d.get(e.runde_nummer).push(e);let f=[...d.entries()].reverse().map(([e,t])=>{let n=t[0]?.runde_navn??`Runde ${e}`,r=t.filter(e=>!e.er_walkover);return r.length?`
      <h6 class="fw-bold text-center mb-1">${p(n)}</h6>
      <div class="d-flex flex-wrap gap-2 mb-2">
        ${r.map(e=>De(e,s,c,u)).join(``)}
      </div>`:``}).join(``),m=i+1,h=a?`<button class="btn btn-success w-100 mt-2"
         data-generate-group="${p(e)}" data-runde="${m}">
         Generer runde ${m}
       </button>`:``,g=o?`<button class="btn btn-success w-100 mt-2" data-generate-finale-group="${p(e)}">
         Generer finale
       </button>`:``;return`
    <div class="final-group-col">
      <h6 class="text-center fw-bold mb-2">Gruppe ${p(e)} (${r} ${p(l)})</h6>
      ${h}
      ${g}
      ${f}
    </div>`}function Ce(e,t,n,r){let i=$(t),a=i>0||r.isConfirmed&&!r.isThreeSides||r.hasRounds?i:`—`,o=t.rep.kamp_plassering,s=e.er_bekreftet&&o!=null&&o>=n,c=e.er_bekreftet&&o!=null&&o<n,l=s?`match-eliminated`:c?`match-advancing`:``,u=`text-center fw-semibold final-score-cell${r.canEditScore?` score-editable`:``}`,d=r.canEditScore?` data-endre-score="${e.id}"`:``;return`<tr${l?` class="${l}"`:``}>
    <td>${F(t,!1)}</td>
    <td class="${u}"${d}>${a}</td>
  </tr>`}function we(e,t,n){return e.er_walkover?`<tr>
        <td colspan="2">${F(t[0]??null,!1)} <span class="badge bg-secondary">Walkover</span></td>
      </tr>`:t.map(r=>Ce(e,r,t.length,n)).join(``)}function Te(e,t,n,r){if(e.er_tre_spelarar)return{css:r?`btn-secondary`:`btn-outline-secondary`,text:r?`Endre plassering`:`Sett plassering`,disabled:!1,extraCss:``};let i=M(e,_e(t.map(e=>e.rep)),n);return{css:r?`btn-secondary`:i?`btn-success`:`btn-outline-secondary`,text:r?`Bekreftet`:`Bekreft`,disabled:r||!i,extraCss:` btn-confirm`}}function Ee(e,t,n){return`<tr>
            <td colspan="2" class="text-end pe-1">
              ${!e.er_walkover&&!e.er_tre_spelarar?`<button class="btn btn-primary btn-sm" id="plus-${e.id}"${t?` disabled`:``}>+</button> `:``}
              ${t?``:`<button class="btn btn-secondary btn-sm" id="scoreboard-${e.id}">Scoreboard</button> `}
              <button class="btn ${n.css} btn-sm${n.extraCss}" id="bekrft-${e.id}"${n.disabled?` disabled`:``}>${n.text}</button>
            </td>
          </tr>`}function De(e,t,n,r=!0){let i=ye(e,t,n),a=e.er_bekreftet||e.er_walkover,s=e.spelarar.some(e=>(e.omgangar?.length??0)>0),c={isConfirmed:a,hasRounds:s,canEditScore:r&&e.er_bekreftet&&!e.er_tre_spelarar&&!s,isThreeSides:e.er_tre_spelarar},l=r?Ee(e,a,Te(e,i,s,a)):``;return`
    <div class="final-match-block">
      <div class="final-match-header">
        <span class="final-match-lane">Bane ${e.bane_nummer}</span>
        ${s&&!a?o():``}
      </div>
      <table class="table table-sm table-bordered mb-0">
        <tbody>
          ${we(e,i,c)}
          ${l}
        </tbody>
      </table>
    </div>`}function Oe(e,r,i,a,o,s,c){for(let l of i){let i=ye(l,s,c),u=i[0]??null,d=i[1]??null,f=u?.rep??null,p=d?.rep??null,m=F(u,!1),g=F(d,!1),_=i.flatMap(e=>e.members.map(e=>e.id)),y=async(e,n)=>{let r=[];f?.id&&r.push(h(f.id,e)),p?.id&&r.push(h(p.id,n));for(let e of[u,d])for(let t of e?.members.slice(1)??[])r.push(h(t.id,0));try{return(await Promise.all(r)).find(e=>e.error)??null}catch(e){return t(`cup:writeSideScore`,e),{error:e}}};if(e.querySelector(`#plus-${l.id}`)?.addEventListener(`click`,()=>{L({side1Name:m,side2Name:g,currentS1:$(u),currentS2:$(d),playerIds:_,hasRounds:l.spelarar.some(e=>(e.omgangar?.length??0)>0),logPrefix:`cup`,onSave:y,onSaved:o})}),e.querySelector(`#scoreboard-${l.id}`)?.addEventListener(`click`,()=>{window.open(`#/kamp/${l.id}`,`_blank`)}),e.querySelector(`#bekrft-${l.id}`)?.addEventListener(`click`,async e=>{if(l.er_tre_spelarar)me(l,i,r,o);else{let t=e.currentTarget;t.disabled=!0,t.textContent=`Lagrer…`;try{await ke(r,l,i,o)||(t.disabled=!1,t.textContent=`Bekreft`)}catch{t.disabled=!1,t.textContent=`Bekreft`}}}),a&&l.er_bekreftet&&!l.er_tre_spelarar){let t=i.flatMap(e=>e.members.map(e=>e.kasterid)),a=()=>{I(m,g,$(u),$(d),async(e,i)=>{if(_.length){let{error:e}=await x(_);if(e){n(`DB-feil ved sletting av omgangar`,`error`);return}}if(await y(e,i)){n(`DB-feil ved oppdatering av score`,`error`);return}let a=e>=i?u:d,s=e>=i?d:u,c=a?.members.map(e=>e.kasterid)??[],f=s?.members.map(e=>e.kasterid)??[],p=[...c.map(e=>({kasterid:e,plassering:1})),...f.map(e=>({kasterid:e,plassering:2}))],{error:m}=await C(l.id,p);if(m){n(`DB-feil ved oppdatering av plassering`,`error`);return}await v({stevneId:r,roundNumber:l.runde_nummer,roundName:l.runde_navn,allThrowerIds:t,newWinnerIds:c,newLoserIds:f}),await o()})};e.querySelectorAll(`[data-endre-score="${l.id}"]`).forEach(e=>e.addEventListener(`click`,a))}}}async function ke(e,t,r,i){let a=r[0]??null,o=r[1]??null,{data:s}=await b(t.id),c=e=>e?.members.reduce((e,t)=>e+g(s.find(e=>e.id===t.id)??t),0)??0,l=c(a),u=c(o);if(l===0&&u===0&&!await f({title:`Ingen score registrert`,message:`Vil du bekrefte kampen likevel?`}))return!1;let d=l>=u?a:o,p=l>=u?o:a,m=r.flatMap(e=>e.members.map(e=>e.kasterid)),{error:h}=await S({kampId:t.id,stevneId:e,roundNumber:t.runde_nummer,roundName:t.runde_navn,allThrowerIds:m,eliminatedIds:p?.members.map(e=>e.kasterid)??[],advancingSides:d?[d.members.map(e=>e.kasterid)]:[]});return h?(n(`DB-feil ved bekreft`,`error`),!1):(await i(),!0)}export{be as render};