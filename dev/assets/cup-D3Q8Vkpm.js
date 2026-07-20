import{n as e,t}from"./logError-D5z16FyH.js";import{$ as n,C as r,Ct as i,S as a,St as o,_t as s,ft as c,gt as l,p as u,w as d,xt as f,yt as p}from"./index-BckkKJXl.js";import{t as m}from"./LoadingState-BWi0wPLz.js";import{C as h,N as g,O as _,T as v,a as y,c as b,i as x,t as S,v as C,y as w}from"./kampService-CnBu9jM9.js";import{n as T}from"./navigation-BZAaZHac.js";import{S as E,_ as D,b as ee,c as O,d as k,f as te,g as ne,h as A,l as j,m as M,n as re,r as ie,s as N,t as P,u as ae,x as oe,y as se}from"./resultatService-B5l9-vlb.js";import{n as F,t as I}from"./scoreEditor-Co_45fUM.js";function L(e){let t=[...e];for(let e=t.length-1;e>0;e--){let n=Math.floor(Math.random()*(e+1));[t[e],t[n]]=[t[n],t[e]]}return t}function R(e){return e===2||e===4?!0:e<2?!1:e%3==0?R(Math.floor(e/3)*2):e%2==0?R(e/2):!1}function z(e){return e%3==0?{c3:e/3,c2:0}:e%2==0?{c3:0,c2:e/2}:{c3:0,c2:0}}function B(e){if(e<2)return[];let t=[],n=Math.floor(e/2);for(let r=e%3;r<=n&&r<=3&&t.filter(e=>e.c2===0).length<2;r+=3){let n=(e-r)/3;if(n<1)break;R(r+2*n)&&t.push({walkovers:r,c3:n,c2:0})}for(let r=e%2;r<=n&&r<=3&&t.filter(e=>e.c3===0).length<2;r+=2){let n=(e-r)/2;if(n<1)break;let i=r+n;!t.some(e=>e.walkovers===r&&e.c3===0&&e.c2===n)&&R(i)&&t.push({walkovers:r,c3:0,c2:n})}return t.sort((e,t)=>e.walkovers-t.walkovers||t.c3-e.c3),t}function V(e){return e===2?!0:B(e).length>0}function H(e){let t=Math.ceil(e*.5),n=Math.round(e*.8),r=[];for(let i=n;i>=t;i--){let t=e-i;t>=2&&V(i)&&V(t)&&r.push({nA:i,nB:t})}return r}function ce(e,{runde1:t=null,walkovers1:n=null}={}){let r=[],i=e,a=1,o=!0;for(;i>2;){let e,s,c;if(o){let r=t;!r&&n!==null&&(r={walkovers:n,c3:Math.floor((i-n)/3),c2:0}),r||=B(i)[0]??{walkovers:i%3,c3:Math.floor(i/3),c2:0},c=r.walkovers,e=r.c3,s=r.c2,o=!1}else{let t=z(i);e=t.c3,s=t.c2,c=0}let l=e*2+s+c;r.push({runde:a,players:i,lanes:e+s,threePlayers:e>0,walkovers:c,advancing:l}),i=l,a++}return r}function U(e,{medSeeding:t=!0,isRunde1:n=!1,walkoverTall:r=null,runde1Oppsett:i=null,shuffleFn:a}={}){let o=a??L,s=[],c=[...e];if(n){let e=i?.walkovers??r??c.length%3;if(e>0){let t=c.slice(0,e);c=c.slice(e);for(let e of t)s.push({players:[e.kasterid],isWalkover:!0,isThreePlayers:!1})}}let l=c.length,u,d;if(i&&n)u=i.c3,d=i.c2;else if(n)u=Math.floor(l/3),d=0;else{let e=z(l);u=e.c3,d=e.c2}let f=u+d;if(t&&f>0){let e=o(c.slice(0,f)),t=o(c.slice(f,2*f)),n=o(c.slice(2*f)),r=0;for(let i=0;i<f;i++){let a=i<u,o=[e[i],t[i]].filter(e=>e!=null),c=a?n[r]:void 0;c&&(o.push(c),r++),s.push({players:o.map(e=>e.kasterid),isWalkover:!1,isThreePlayers:a})}}else{let e=o(c),t=0;for(let n=0;n<u;n++)s.push({players:e.slice(t,t+3).map(e=>e.kasterid),isWalkover:!1,isThreePlayers:!0}),t+=3;for(let n=0;n<d;n++)s.push({players:e.slice(t,t+2).map(e=>e.kasterid),isWalkover:!1,isThreePlayers:!1}),t+=2}return s}function W(e,{showPlayerList:t=!0,initNa:n=null,initFormat:r=null}={}){let i=typeof e==`number`?e:e.length,a=typeof e==`number`?[]:e.map((e,t)=>({...e,cupPlassering:t+1})),o=H(i),s=n===i?i:n!=null&&o.some(e=>e.nA===n)?n:o[0]?.nA??i,c=i-s,l=o.filter(e=>B(e.nA).some(e=>e.c3>0)),u=o.filter(e=>!B(e.nA).some(e=>e.c3>0)),d=B(i).length>0,f=(e,t)=>e.map((e,r)=>{let a=e.nA===s&&n!==i,o=t+r;return`
      <div class="form-check">
        <input class="form-check-input" type="radio" name="group-split" id="split-${o}" value="${e.nA}" ${a?`checked`:``}>
        <label class="form-check-label" for="split-${o}">A:${e.nA} — B:${e.nB}</label>
      </div>`}).join(``),p=[];l.length&&p.push(`<div class="text-muted small fw-semibold mb-1">3 spillere per bane (A)</div>${f(l,0)}`),u.length&&(p.length&&p.push(`<hr class="my-2">`),p.push(`<div class="text-muted small fw-semibold mb-1">2 spillere per bane (A)</div>${f(u,l.length)}`)),d&&(p.length&&p.push(`<hr class="my-2">`),p.push(`
      <div class="form-check">
        <input class="form-check-input" type="radio" name="group-split" id="split-none" value="${i}" ${n===i?`checked`:``}>
        <label class="form-check-label" for="split-ingen">Alle i A</label>
      </div>`));let m=p.join(``),h=r?.A??B(s)[0]??null,g=c>=2?r?.B??B(c)[0]??null:null,_=t?`<div id="group-preview">${G(a,s,h?.walkovers??0,g?.walkovers??0)}</div>`:``;return`
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
  `}function G(e,t,n=0,r=0){let i=e.slice(0,t),a=e.slice(t);function s(e,t=0){return e.map((e,n)=>{let r=n<t;return`
      <tr>
        <td>${e.cupPlassering}</td>
        <td>${o(e.navn??``)}${r?` <span class="badge bg-info text-dark">Walkover</span>`:``}</td>
        <td class="text-center">${e.kamp_poeng??0}</td>
        <td class="text-center">${e.score_poeng??0}</td>
      </tr>`}).join(``)}let c=`
    <thead class="org-thead"><tr>
      <th class="th-32">#</th><th>NAMN</th>
      <th class="th-44 text-center">KP</th>
      <th class="th-44 text-center">SP</th>
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
    </div>`}function le(e){let t=e.c3>0?3:2;return`${e.walkovers} walkover - ${t} deltakere per bane`}function ue(e,t,n,r=null){let i=B(t);return i.length<=1?``:`<div class="d-flex flex-column align-items-start gap-1 mb-2">${i.map((e,t)=>{let i=`${n}-${t}`,a=JSON.stringify(e),o=r?e.walkovers===r.walkovers&&e.c3===r.c3&&e.c2===r.c2:t===0,s=e.c3>0?`btn-outline-success`:`btn-outline-warning`;return`
      <input type="radio" class="btn-check" name="${n}" id="${i}"
        value='${a}' data-oppsett='${a}' autocomplete="off" ${o?`checked`:``}>
      <label class="btn btn-sm ${s}" for="${i}">${le(e)}</label>`}).join(``)}</div>`}function K(e,t,n){return`<div id="structure-${n}">
    <table class="table table-sm table-bordered mb-0">
      <thead><tr>
        <th>Runde</th><th>Deltakere</th><th>Baner</th><th>Per bane</th>
      </tr></thead>
      <tbody>${(e>=2?ce(e,{runde1:t}):[]).map((e,n)=>{let r=e.walkovers??0,i=e.players-r,a=r>0?`${i} <span class="text-muted">(${r} w.o.)</span>`:`${i}`,o;return o=n===0&&t?t.c3>0&&t.c2>0?`2/3`:t.c3>0?`3`:`2`:e.players%e.lanes===0?String(e.players/e.lanes):`2/3`,`<tr${e.threePlayers?` class="fw-bold"`:``}>
      <td>${e.runde}</td>
      <td>${a}</td>
      <td>${e.lanes}</td>
      <td>${o}</td>
    </tr>`}).join(``)}</tbody>
    </table>
  </div>`}function q(e,t,n,r){let i=n.slice(-1),a=ue(e,t,n,r);return`
    <div class="card">
      <div class="card-body">
        <h6 class="fw-bold mb-2">${a?`${e}: Velg format`:`${e} (${t})`}</h6>
        ${a}
        ${K(t,r,i)}
      </div>
    </div>`}function J(){return crypto.randomUUID()}async function Y(t){let{data:n,error:r}=await e.from(`resultat`).select(`kasterid, startnummer, posisjon`).eq(`stevneid`,t);if(r)throw Error(`Feil ved henting av resultat: `+r.message);let i={},a={};for(let e of n??[])e.kasterid==null||e.startnummer==null||(i[e.kasterid]=e.startnummer,(a[e.startnummer]??=[]).push({kasterid:e.kasterid,posisjon:e.posisjon}));let o={};for(let[e,t]of Object.entries(a))t.sort((e,t)=>(e.posisjon??1/0)-(t.posisjon??1/0)||e.kasterid-t.kasterid),o[Number(e)]=t.map(e=>e.kasterid);return{kasteridToSnr:i,snrToMembers:o}}function de(e,t){let n=e.kasteridToSnr[t];return(n==null?void 0:e.snrToMembers[n])??[t]}async function X(t,n,r,i,a,o=0,s=null){let c=n.map(()=>J()),l=o,u=n.map((e,n)=>({match_id:c[n],stevneid:t,fase:`avsluttende`,runde_nummer:r,gruppe_navn:i??null,bane_nummer:e.isWalkover?null:++l,er_bekreftet:e.isWalkover,er_walkover:e.isWalkover,er_tre_spelarar:e.isThreePlayers,runde_navn:s})),{data:d,error:f}=await e.from(`kamp`).insert(u).select(`id, match_id`);if(f)throw Error(`Feil ved innsetting av cup-kampar: `+f.message);let p=Object.fromEntries(d.map(e=>[e.match_id,e.id])),m=[];for(let[e,t]of n.entries()){let n=p[c[e]];t.players.forEach(e=>{for(let t of de(a,e))m.push({kampid:n,kasterid:t,score_poeng:0,kamp_poeng:0,antall_ringer:0})})}let{error:h}=await e.from(`kamp_spelar`).insert(m);if(h)throw Error(`Feil ved innsetting av cup-spelarar: `+h.message);return d.length}async function fe(t,n,r,i=null){let a=[`A`,`B`,`C`],o=0,s=await Y(t);for(let c of n){let n=U(c.spelarar,{medSeeding:r,isRunde1:!0,runde1Oppsett:c.runde1Oppsett??null}),{data:l}=await e.from(`kamp`).select(`bane_nummer`).eq(`stevneid`,t).eq(`fase`,`avsluttende`).eq(`runde_nummer`,1).not(`bane_nummer`,`is`,null).order(`bane_nummer`,{ascending:!1}).limit(1),u=l?.[0]?.bane_nummer??0,d=0;if(i&&c.groupName){let e=a.indexOf(c.groupName);for(let t of a.slice(0,e)){let e=i[t];e&&(d+=(e.c3??0)+(e.c2??0))}}let f=Math.max(u,d),p=c.spelarar.length===4;o+=await X(t,n,1,c.groupName,s,f,p?`Semifinale`:null)}return o}async function Z(t,n){let{data:r}=await e.from(`kamp`).select(`bane_nummer`).eq(`stevneid`,t).eq(`fase`,`avsluttende`).eq(`runde_nummer`,n).not(`bane_nummer`,`is`,null).order(`bane_nummer`,{ascending:!1}).limit(1);return r?.[0]?.bane_nummer??0}async function pe(t,n,r,i){let{data:a}=await e.from(`kamp`).select(`runde_nummer`).eq(`stevneid`,t).eq(`fase`,`avsluttende`).eq(`gruppe_navn`,n).order(`runde_nummer`,{ascending:!1}).limit(1),o=(a?.[0]?.runde_nummer??0)+1,s=i.length===4,c=U(i,{medSeeding:r,isRunde1:!1}),l=await Z(t,o);return{roundNumber:o,matchCount:await X(t,c,o,n,await Y(t),l,s?`Semifinale`:null)}}async function me(t,n){let{data:r}=await e.from(`kamp`).select(`id, runde_nummer, spelarar:kamp_spelar(id, kasterid, score_poeng, omgangar:kamp_omgang(score))`).eq(`stevneid`,t).eq(`fase`,`avsluttende`).eq(`gruppe_navn`,n).eq(`runde_navn`,`Semifinale`).eq(`er_bekreftet`,!0);if(!r?.length)throw Error(`Semifinalane er ikkje bekrefta.`);let i=await Y(t),a=r,o=a[0].runde_nummer+1,s=[],c=[];for(let e of a){let t=new Map;for(let n of e.spelarar??[]){if(n.kasterid==null)continue;let e=i.kasteridToSnr[n.kasterid]??`kaster-${n.kasterid}`,r=t.get(e)??{kasterids:[],score:0};r.kasterids.push(n.kasterid),r.score+=n.omgangar?.length?n.omgangar.reduce((e,t)=>e+(t.score??0),0):n.score_poeng??0,t.set(e,r)}let n=[...t.values()].sort((e,t)=>t.score-e.score);n[0]&&s.push(n[0].kasterids),n[1]&&c.push(n[1].kasterids)}let l=await Z(t,o),u={match_id:J(),stevneid:t,fase:`avsluttende`,runde_nummer:o,gruppe_navn:n,bane_nummer:l+1,runde_navn:`Finale`,er_bekreftet:!1,er_walkover:!1,er_tre_spelarar:!1},d={match_id:J(),stevneid:t,fase:`avsluttende`,runde_nummer:o,gruppe_navn:n,bane_nummer:l+2,runde_navn:`Bronsefinale`,er_bekreftet:!1,er_walkover:!1,er_tre_spelarar:!1},{data:f,error:p}=await e.from(`kamp`).insert([u,d]).select(`id, runde_navn`);if(p)throw Error(`Feil: `+p.message);let m=f,h=m.find(e=>e.runde_navn===`Finale`).id,g=m.find(e=>e.runde_navn===`Bronsefinale`).id,_=[...s.flat().map(e=>({kampid:h,kasterid:e,score_poeng:0,kamp_poeng:0,antall_ringer:0})),...c.flat().map(e=>({kampid:g,kasterid:e,score_poeng:0,kamp_poeng:0,antall_ringer:0}))],{error:v}=await e.from(`kamp_spelar`).insert(_);if(v)throw Error(`Feil: `+v.message)}function he(e,n,i,a,s,c){let l=i.filter(e=>e.runde_eliminert==null),u=i.length,d=l.length,f=a===1?s?.[n]??null:null,p=f?.walkovers??0,m=(f?f.c3:d%3==0?d/3:0)+(f?f.c2:d%3==0?0:d/2),h=l.slice(p,p+m),g=l.slice(p+m,p+2*m),_=l.slice(p+2*m),v=document.createElement(`div`);v.className=`final-dialog-overlay`,document.body.appendChild(v);let y=null,b=!1,x=0,S=0;function C(e){if(!b)return;let t=v.querySelector(`.final-dialog-card-wide`);if(!t)return;let n=e.clientX-x,r=e.clientY-S;y={left:n,top:r},t.style.left=`${n}px`,t.style.top=`${r}px`}function w(){b&&(b=!1,document.body.style.userSelect=``)}document.addEventListener(`mousemove`,C),document.addEventListener(`mouseup`,w);function T(){document.removeEventListener(`mousemove`,C),document.removeEventListener(`mouseup`,w)}function E(e){return`<div class="d-flex justify-content-between gap-2 py-1">
      <span class="small">${o(e.navn??``)}</span>
      <span class="small text-muted text-nowrap">${e.kamp_poeng??0}p (${e.score_poeng??0})</span>
    </div>`}function D(i){let C=l.slice(0,p),w=C.length>0?`<div class="mb-3">
          <strong class="d-block mb-1">Walkovers (går vidare utan kamp):</strong>
          ${C.map(E).join(``)}
        </div>`:``,ee=i===!0&&m>0?`<div class="alert alert-info small mb-3 py-2">
          Dette er seedinggrupper, ikkje kampar. Spelarar i same gruppe kan ikkje trekkast mot kvarandre. Kampane blir oppretta når du klikkar «Bekreft og opprett kampar».
        </div>`:``,O=i===!0&&m>0?`<div class="d-flex gap-3 flex-wrap mb-3">
          ${[{label:`Seeding 1`,pool:h},{label:`Seeding 2`,pool:g},..._.length?[{label:`Seeding 3`,pool:_}]:[]].map(({label:e,pool:t})=>`
            <div class="card flex-grow-1">
              <div class="card-body p-2">
                <strong class="d-block mb-2 small text-uppercase">${o(e)}</strong>
                ${t.map(E).join(``)}
              </div>
            </div>`).join(``)}
        </div>`:`<div class="final-player-columns mb-3">
          ${l.slice(p).map((e,t)=>`
            <div class="small d-flex justify-content-between gap-2">
              <span>${p+t+1}. ${o(e.navn??``)}</span>
              <span class="text-muted text-nowrap">${e.kamp_poeng??0}p (${e.score_poeng??0})</span>
            </div>`).join(``)}
        </div>`;v.innerHTML=`
      <div class="card final-dialog-card-wide">
        <div class="final-dialog-drag-handle">
          <p class="text-muted small text-uppercase fw-semibold mb-1">Trekning</p>
          <h5 class="mb-1">Gruppe ${o(n)} — Runde ${a}</h5>
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
          ${ee}
          ${w}
          ${O}
        </div>
        <div class="final-dialog-footer">
          <div class="d-flex gap-2">
            <button id="bekreft-gen-btn" class="btn btn-primary" ${i===null?`disabled`:``}>Bekreft og opprett kampar</button>
            <button id="avbryt-gen-btn" class="btn btn-secondary">Avbryt</button>
          </div>
        </div>
      </div>`;let k=v.querySelector(`.final-dialog-card-wide`);y&&(k.style.position=`fixed`,k.style.left=`${y.left}px`,k.style.top=`${y.top}px`,k.style.margin=`0`,k.style.zIndex=`10000`),k.querySelector(`.final-dialog-drag-handle`).addEventListener(`mousedown`,e=>{let t=k.getBoundingClientRect();k.style.position=`fixed`,k.style.left=`${t.left}px`,k.style.top=`${t.top}px`,k.style.margin=`0`,k.style.zIndex=`10000`,x=e.clientX-t.left,S=e.clientY-t.top,y={left:t.left,top:t.top},b=!0,document.body.style.userSelect=`none`}),v.querySelector(`#seeding-ja`).addEventListener(`change`,()=>D(!0)),v.querySelector(`#seeding-nei`).addEventListener(`change`,()=>D(!1)),v.querySelector(`#avbryt-gen-btn`).addEventListener(`click`,()=>{T(),v.remove()}),v.querySelector(`#bekreft-gen-btn`).addEventListener(`click`,async()=>{if(i===null)return;let o=v.querySelector(`#bekreft-gen-btn`);o.disabled=!0,o.textContent=`Lagrer…`;try{let t=l.map((e,t)=>({kasterid:e.kasterid,plassering:t+1}));if(a===1){let r={A:s?.A??void 0,B:s?.B??void 0};await fe(e,[{groupName:n,spelarar:t,runde1Oppsett:f}],i,s?r:null)}else await pe(e,n,i,t);T(),v.remove(),await c()}catch(e){t(`cup:genererRunde`,e),r(`Feil ved generering av runde`,`error`),o.disabled=!1,o.textContent=`Bekreft og opprett kampar`}})}D(null)}function ge(e,t,n,i){let a=t.map(e=>E(e,!1)),o=[],s=document.createElement(`div`);s.className=`final-dialog-overlay`,document.body.appendChild(s);function c(){let l=o.length===2?t.find(e=>!o.includes(e.rep.kasterid)):null;s.innerHTML=`
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
    `,s.querySelector(`#avbryt-tre-btn`).addEventListener(`click`,()=>s.remove()),s.querySelectorAll(`[data-kasterid]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=Number(e.dataset.kasterid),n=o.indexOf(t);n===-1?o.length<2&&o.push(t):o.splice(n,1),c()})}),s.querySelector(`#bekreft-tre-btn`)?.addEventListener(`click`,async()=>{if(o.length!==2)return;let a=t.find(e=>!o.includes(e.rep.kasterid))??null,c=o.map(e=>t.find(t=>t.rep.kasterid===e)).filter(e=>e!=null).map(e=>e.members.map(e=>e.kasterid)),l=t.flatMap(e=>e.members.map(e=>e.kasterid));s.remove();let{error:u}=await S({kampId:e.id,stevneId:n,roundNumber:e.runde_nummer,roundName:e.runde_navn,allThrowerIds:l,eliminatedIds:a?.members.map(e=>e.kasterid)??[],advancingSides:c});if(u){r(`DB-feil ved bekreft`,`error`);return}await i()})}c()}function _e(e){return typeof e!=`object`||!e||Array.isArray(e)?null:e}function ve(e){return e.map(e=>({er_bekreftet:e.er_bekreftet,er_walkover:e.er_walkover,runde_nummer:e.runde_nummer,bane_nummer:e.bane_nummer,spelarar:ye(e.spelarar)}))}function ye(e){return e.map(e=>({kasterid:e.kasterid??0,kamp_poeng:e.kamp_poeng??0,score_poeng:e.score_poeng??0,antall_ringer:e.antall_ringer,omgangar:e.omgangar,kaster:e.kaster}))}function be(e){let a=null,o=null,l=!1,f=new Set;async function p(e,{id:t,isAdmin:n=!1},r=null){o=r,l=n,a&&=(await T(a),null),e.replaceChildren(m(`Laster…`)),await h(e,t)}async function h(a,p){try{let[{data:t},{data:m},{data:_},{data:v},{count:b}]=await Promise.all([n(p),y(p),ie(p),re([`A`,`B`]),c(p)]);if(!t){a.replaceChildren(i(`Stevne ikkje funne.`));return}let x=_.filter(e=>e.kasterid!=null),S=m.filter(e=>e.fase===`innledende`),C=m.filter(e=>e.fase===`avsluttende`),w={},T={},E=new Map;for(let e of x)e.startnummer!=null&&(w[e.kasterid]=e.startnummer,E.set(e.startnummer,(E.get(e.startnummer)??0)+1)),e.posisjon!=null&&(T[e.kasterid]=e.posisjon);let A=[...E.values()].some(e=>e>1),j={};for(let e of m)for(let t of e.spelarar)t.kasterid&&t.kaster&&!j[t.kasterid]&&(j[t.kasterid]=`${t.kaster.fornavn} ${t.kaster.etternavn}`);let M=ve(S),N=te(M,x,j,w,T),P=S.length>0&&S.every(e=>e.er_bekreftet),F=C.length>0,I=(S.length>0||F)&&S.every(e=>e.er_bekreftet)&&C.every(e=>e.er_bekreftet),L=x.some(e=>e.gruppe!=null),R=Object.fromEntries(v.map(e=>[e.navn,e.id])),z=_e(t.runde1_format),B=b??0;if(t.kategori?.erlagbasert){let{data:e}=await u(p);B=e.length}let V={container:a,stevneid:p,stevne:t,standings:N,startNumberMap:w,positionMap:T,isTeam:A,nameMap:j,initialMatches:S,finalMatches:C,results:x,isAdmin:l,hasGroupAssignment:L,allInitialConfirmed:P,hasFinalMatches:F,round1Format:z,unitCount:B,groupNameMap:R,reload:()=>h(a,p)};l&&o&&(o.innerHTML=D(t,{allMatchesConfirmed:I,hasFinalMatches:F,hasGroupAssignment:L,hasPreconfiguredFormat:z!=null&&t.stevne_fase!==`avsluttende`}));let H=ne(a);if(L){let t=ee(N,M,w,{tableId:`standing-final`,hasGroups:!0,hasElimination:!0,positionMap:T,unitLabel:A?`par`:`spelarar`});a.innerHTML=se(e.renderMatchesHtml(V),t),ae(a,`standing-final`,f),k(a),H===`standing`&&oe(a,`standing`),e.bindMatchEvents(a,V),g(a,p)}else a.innerHTML=e.renderSetupHtml(V);o?.querySelector(`#complete-tournament-btn`)?.addEventListener(`click`,async()=>{if(!await d({title:`Fullfør turnering`,message:`Vil du fullføre turneringa? Dette kan ikkje angrast.`,danger:!0}))return;let{error:e}=await O(p,[...N.filter(e=>e.gruppe?.navn===`A`),...N.filter(e=>e.gruppe?.navn===`B`),...N.filter(e=>e.gruppe?.navn!==`A`&&e.gruppe?.navn!==`B`)]);if(e){r(`Feil ved lagring av plasseringar`,`error`);return}let{error:t}=await s(p);if(t){r(`Feil ved fullføring av turnering`,`error`);return}await h(a,p)}),e.bindHeaderEvents(o,V)}catch(e){t(`avsluttendeBase.loadAndRender`,e),a.replaceChildren(i(`Kunne ikkje laste avsluttande fase.`))}}function g(t,n){if(a)return;let r=A(n,[`avsluttende`],t,h,()=>{a&&=(T(a),null)});a=w(n,e.channelName(n),r)}return p}function xe(e,t,n){return _(e.spelarar.filter(e=>e.kasterid!=null),t,n)}function Q(e){return e?.members.reduce((e,t)=>e+g(t),0)??0}var Se=be({channelName:e=>`stevne-avsl-cup-${e}`,renderMatchesHtml:e=>{let{finalMatches:t,standings:n,startNumberMap:r,positionMap:i,isTeam:a,isAdmin:o}=e;return`<div class="d-flex gap-3 flex-wrap">${[...new Set(n.map(e=>e.gruppe?.navn).filter(e=>e!=null))].sort().map(e=>{let s=t.filter(t=>t.gruppe_navn===e),c=n.filter(t=>t.gruppe?.navn===e),l=c.filter(e=>e.runde_eliminert==null).length,u=c.length,d=s.length?Math.max(...s.map(e=>e.runde_nummer)):0,f=s.filter(e=>e.runde_nummer===d),p=f.length>0&&f.every(e=>e.er_bekreftet||e.er_walkover),m=s.some(e=>e.runde_navn===`Semifinale`),h=o&&(s.length===0||p)&&l>1&&!m,g=f.length>0&&f.every(e=>e.runde_navn===`Semifinale`),_=s.some(e=>e.runde_navn===`Finale`);return Ce(e,s,l,u,d,h,o&&g&&p&&!_,r,i,a?`par`:`spelarar`,o)}).join(``)}</div>`},bindMatchEvents:(e,t)=>{!t.isAdmin&&t.finalMatches.length===0||ke(e,t.stevneid,t.finalMatches,t.isAdmin,t.reload,t.startNumberMap,t.positionMap)},renderSetupHtml:e=>{let{stevne:t,isAdmin:n,round1Format:r,unitCount:i,standings:a}=e,o=r?.nA??null;if(t.stevne_fase===`avsluttende`)return n?W(a,{showPlayerList:!0,initNa:o,initFormat:r}):`<p class="text-muted fst-italic">Gruppefordeling er ikkje klar enno.</p>`;if(!n)return``;if(i<2)return`<p class="text-muted fst-italic">${t.kategori?.erlagbasert?`Minst 2 par må vere oppretta før gruppefordelinga kan setjast.`:`Minst 2 spelarar må vere påmelde før gruppefordelinga kan setjast.`}</p>`;let s=a.length>0;return W(s?a:i,{showPlayerList:s,initNa:o,initFormat:r})},bindHeaderEvents:(e,n)=>{let{container:i,stevneid:o,stevne:s,standings:c,results:u,round1Format:f,allInitialConfirmed:m,hasGroupAssignment:h,groupNameMap:g,reload:_}=n;if(e?.querySelector(`#start-final-btn`)?.addEventListener(`click`,async()=>{if(!m)return;let{error:e}=await p(o,`avsluttende`);if(e){r(`Feil ved oppstart av avsluttande fase`,`error`);return}if(f?.nA!=null){let e=f.nA,{error:t}=await N(o,$(c,u,e,g.A??null,g.B??null));if(t){r(`Feil ved lagring av gruppefordeling: `+a(t),`error`);return}}await _()}),!h){let e=parseInt(i.querySelector(`#group-assignment-wrapper`)?.dataset.n??`0`)||c.length;function t(e,t){let n=i.querySelector(`input[name="${e}"]:checked`);if(n?.dataset.oppsett)try{return JSON.parse(n.dataset.oppsett)}catch{}return B(t)[0]??null}function n(e,t,n){let r=i.querySelector(`#group-preview`);r&&(r.innerHTML=G(c.map((e,t)=>({...e,cupPlassering:t+1})),e,t?.walkovers??0,n?.walkovers??0))}let d=i.querySelector(`#group-panels`);d&&d.addEventListener(`change`,r=>{let a=r.target;if(!a.matches(`input[name^="round1-format"]`))return;let o=parseInt(i.querySelector(`input[name="group-split"]:checked`)?.value??String(e)),s=e-o,c=t(`round1-format-a`,o),l=t(`round1-format-b`,s);if(a.name===`round1-format-a`){let e=i.querySelector(`#structure-a`);e&&(e.outerHTML=K(o,c,`a`))}else{let e=i.querySelector(`#structure-b`);e&&(e.outerHTML=K(s,l,`b`))}n(o,c,l)}),i.querySelectorAll(`input[name="group-split"]`).forEach(t=>{t.addEventListener(`change`,()=>{let r=parseInt(t.value),i=e-r,a=B(r)[0]??null,o=i>=2?B(i)[0]??null:null;d&&(d.innerHTML=`<div id="group-panel-a" class="final-group-col">
                ${q(`Gruppe A`,r,`round1-format-a`,a)}
              </div>`+(i>=2?`<div id="group-panel-b" class="final-group-col">
                ${q(`Gruppe B`,i,`round1-format-b`,o)}
              </div>`:``)),n(r,a,o)})}),i.querySelector(`#confirm-group-btn`)?.addEventListener(`click`,async()=>{let n=i.querySelector(`input[name="group-split"]:checked`);if(!n)return;let d=parseInt(n.value),f=e-d,{error:p}=await l(o,{A:t(`round1-format-a`,d),B:f>=2?t(`round1-format-b`,f):null,nA:d});if(p){r(`Feil ved lagring av format: `+a(p),`error`);return}if(s.stevne_fase===`avsluttende`){let{error:e}=await N(o,$(c,u,d,g.A??null,g.B??null));if(e){r(`Feil ved lagring av gruppefordeling: `+a(e),`error`);return}}r(`Gruppefordeling lagra`,`success`),await _()})}e?.querySelector(`#edit-group-assignment-btn`)?.addEventListener(`click`,async()=>{await d({title:`Tilbakestill gruppeinndeling`,message:`Gruppefordeling og format vert fjerna.`,danger:!0})&&(await Promise.all([P(o),l(o,null)]),await _())}),h&&(i.querySelectorAll(`[data-generate-group]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.generateGroup??``,n=parseInt(e.dataset.runde??`1`);he(o,t,c.filter(e=>e.gruppe?.navn===t),n,f,_)})}),i.querySelectorAll(`[data-generate-finale-group]`).forEach(e=>{e.addEventListener(`click`,async()=>{let n=e.dataset.generateFinaleGroup??``;e.disabled=!0,e.textContent=`Genererer…`;try{await me(o,n),await _()}catch(n){t(`cup:genererFinale`,n),r(`Feil ved generering av finale`,`error`),e.disabled=!1,e.textContent=`Generer finale`}})}))}});function $(e,t,n,r,i){return e.flatMap((e,a)=>{let o=a<n?r:i??r,s=e.startnummer==null?[]:t.filter(t=>t.startnummer===e.startnummer).map(e=>e.kasterid);return(s.length?s:[e.kasterid]).map(e=>({kasterid:e,gruppeid:o}))})}function Ce(e,t,n,r,i,a,s,c,l,u,d=!0){let f=new Map;for(let e of t)f.has(e.runde_nummer)||f.set(e.runde_nummer,[]),f.get(e.runde_nummer).push(e);let p=[...f.entries()].reverse().map(([e,t])=>{let n=t[0]?.runde_navn??`Runde ${e}`,r=t.filter(e=>!e.er_walkover);return r.length?`
      <h6 class="fw-bold text-center mb-1">${o(n)}</h6>
      <div class="d-flex flex-wrap gap-2 mb-2">
        ${r.map(e=>Oe(e,c,l,d)).join(``)}
      </div>`:``}).join(``),m=i+1,h=a?`<button class="btn btn-success w-100 mt-2"
         data-generate-group="${o(e)}" data-runde="${m}">
         Generer runde ${m}
       </button>`:``,g=s?`<button class="btn btn-success w-100 mt-2" data-generate-finale-group="${o(e)}">
         Generer finale
       </button>`:``;return`
    <div class="final-group-col">
      <h6 class="text-center fw-bold mb-2">Gruppe ${o(e)} (${r} ${o(u)})</h6>
      ${h}
      ${g}
      ${p}
    </div>`}function we(e,t,n,r){let i=Q(t),a=i>0||r.isConfirmed&&!r.isThreeSides||r.hasRounds?i:`—`,o=t.rep.kamp_plassering,s=e.er_bekreftet&&o!=null&&o>=n,c=e.er_bekreftet&&o!=null&&o<n,l=s?`match-eliminated`:c?`match-advancing`:``,u=`text-center fw-semibold final-score-cell${r.canEditScore?` score-editable`:``}`,d=r.canEditScore?` data-endre-score="${e.id}"`:``;return`<tr${l?` class="${l}"`:``}>
    <td>${E(t,!1)}</td>
    <td class="${u}"${d}>${a}</td>
  </tr>`}function Te(e,t,n){return e.er_walkover?`<tr>
        <td colspan="2">${E(t[0]??null,!1)} <span class="badge bg-secondary">Walkover</span></td>
      </tr>`:t.map(r=>we(e,r,t.length,n)).join(``)}function Ee(e,t,n,r){if(e.er_tre_spelarar)return{css:r?`btn-secondary`:`btn-outline-secondary`,text:r?`Endre plassering`:`Sett plassering`,disabled:!1,extraCss:``};let i=M(e,ye(t.map(e=>e.rep)),n);return{css:r?`btn-secondary`:i?`btn-success`:`btn-outline-secondary`,text:r?`Bekreftet`:`Bekreft`,disabled:r||!i,extraCss:` btn-confirm`}}function De(e,t,n){return`<tr>
            <td colspan="2" class="text-end pe-1">
              ${!e.er_walkover&&!e.er_tre_spelarar?`<button class="btn btn-primary btn-sm" id="plus-${e.id}"${t?` disabled`:``}>+</button> `:``}
              ${t?``:`<button class="btn btn-secondary btn-sm" data-scoreboard-kamp-id="${e.id}">Scoreboard</button> `}
              <button class="btn ${n.css} btn-sm${n.extraCss}" id="bekrft-${e.id}"${n.disabled?` disabled`:``}>${n.text}</button>
            </td>
          </tr>`}function Oe(e,t,n,r=!0){let i=xe(e,t,n),a=e.er_bekreftet||e.er_walkover,o=e.spelarar.some(e=>(e.omgangar?.length??0)>0),s={isConfirmed:a,hasRounds:o,canEditScore:r&&e.er_bekreftet&&!e.er_tre_spelarar&&!o,isThreeSides:e.er_tre_spelarar},c=r?De(e,a,Ee(e,i,o,a)):``;return`
    <div class="final-match-block">
      <div class="final-match-header">
        <span class="final-match-lane">Bane ${e.bane_nummer}</span>
        ${o&&!a?f():``}
      </div>
      <table class="table table-sm table-bordered mb-0">
        <tbody>
          ${Te(e,i,s)}
          ${c}
        </tbody>
      </table>
    </div>`}function ke(e,n,i,a,o,s,c){j(e);for(let l of i){let i=xe(l,s,c),u=i[0]??null,d=i[1]??null,f=u?.rep??null,p=d?.rep??null,m=E(u,!1),g=E(d,!1),_=i.flatMap(e=>e.members.map(e=>e.id)),y=async(e,n)=>{let r=[];f?.id&&r.push(h(f.id,e)),p?.id&&r.push(h(p.id,n));for(let e of[u,d])for(let t of e?.members.slice(1)??[])r.push(h(t.id,0));try{return(await Promise.all(r)).find(e=>e.error)??null}catch(e){return t(`cup:writeSideScore`,e),{error:e}}};if(e.querySelector(`#plus-${l.id}`)?.addEventListener(`click`,()=>{I({side1Name:m,side2Name:g,currentS1:Q(u),currentS2:Q(d),playerIds:_,hasRounds:l.spelarar.some(e=>(e.omgangar?.length??0)>0),logPrefix:`cup`,onSave:y,onSaved:o})}),e.querySelector(`#bekrft-${l.id}`)?.addEventListener(`click`,async e=>{if(l.er_tre_spelarar)ge(l,i,n,o);else{let t=e.currentTarget;t.disabled=!0,t.textContent=`Lagrer…`;try{await Ae(n,l,i,o)||(t.disabled=!1,t.textContent=`Bekreft`)}catch{t.disabled=!1,t.textContent=`Bekreft`}}}),a&&l.er_bekreftet&&!l.er_tre_spelarar){let t=i.flatMap(e=>e.members.map(e=>e.kasterid)),a=()=>{F(m,g,Q(u),Q(d),async(e,i)=>{if(_.length){let{error:e}=await x(_);if(e){r(`DB-feil ved sletting av omgangar`,`error`);return}}if(await y(e,i)){r(`DB-feil ved oppdatering av score`,`error`);return}let a=e>=i?u:d,s=e>=i?d:u,c=a?.members.map(e=>e.kasterid)??[],f=s?.members.map(e=>e.kasterid)??[],p=[...c.map(e=>({kasterid:e,plassering:1})),...f.map(e=>({kasterid:e,plassering:2}))],{error:m}=await C(l.id,p);if(m){r(`DB-feil ved oppdatering av plassering`,`error`);return}await v({stevneId:n,roundNumber:l.runde_nummer,roundName:l.runde_navn,allThrowerIds:t,newWinnerIds:c,newLoserIds:f}),await o()})};e.querySelectorAll(`[data-endre-score="${l.id}"]`).forEach(e=>e.addEventListener(`click`,a))}}}async function Ae(e,t,n,i){let a=n[0]??null,o=n[1]??null,{data:s}=await b(t.id),c=e=>e?.members.reduce((e,t)=>e+g(s.find(e=>e.id===t.id)??t),0)??0,l=c(a),u=c(o);if(l===0&&u===0&&!await d({title:`Ingen score registrert`,message:`Vil du bekrefte kampen likevel?`}))return!1;let f=l>=u?a:o,p=l>=u?o:a,m=n.flatMap(e=>e.members.map(e=>e.kasterid)),{error:h}=await S({kampId:t.id,stevneId:e,roundNumber:t.runde_nummer,roundName:t.runde_navn,allThrowerIds:m,eliminatedIds:p?.members.map(e=>e.kasterid)??[],advancingSides:f?[f.members.map(e=>e.kasterid)]:[]});return h?(r(`DB-feil ved bekreft`,`error`),!1):(await i(),!0)}export{Se as render};