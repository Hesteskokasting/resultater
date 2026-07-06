import{n as e,t}from"./logError-Cjb5zwtM.js";import{G as n,H as r,J as i,K as a,Q as o,S as s,X as c,Z as l,f as u,k as d,x as f}from"./index-CBSadyAf.js";import{t as p}from"./LoadingState-BCLCa55U.js";import{C as m,N as h,O as g,T as _,a as v,c as y,i as b,t as x,v as S,y as C}from"./kampService-ChfQLXja.js";import{n as w}from"./navigation-NxDw8Q0y.js";import{b as T,c as E,d as D,g as O,h as ee,l as k,m as A,n as te,p as j,r as ne,s as M,t as N,u as re,v as ie,x as P,y as ae}from"./resultatService-DcySzrgo.js";import{n as F,t as I}from"./scoreEditor-C4_oGXzg.js";function L(e){let t=[...e];for(let e=t.length-1;e>0;e--){let n=Math.floor(Math.random()*(e+1));[t[e],t[n]]=[t[n],t[e]]}return t}function R(e){return e===2||e===4?!0:e<2?!1:e%3==0?R(Math.floor(e/3)*2):e%2==0?R(e/2):!1}function z(e){return e%3==0?{c3:e/3,c2:0}:e%2==0?{c3:0,c2:e/2}:{c3:0,c2:0}}function B(e){if(e<2)return[];let t=[],n=Math.floor(e/2);for(let r=e%3;r<=n&&r<=3&&t.filter(e=>e.c2===0).length<2;r+=3){let n=(e-r)/3;if(n<1)break;R(r+2*n)&&t.push({walkovers:r,c3:n,c2:0})}for(let r=e%2;r<=n&&r<=3&&t.filter(e=>e.c3===0).length<2;r+=2){let n=(e-r)/2;if(n<1)break;let i=r+n;!t.some(e=>e.walkovers===r&&e.c3===0&&e.c2===n)&&R(i)&&t.push({walkovers:r,c3:0,c2:n})}return t.sort((e,t)=>e.walkovers-t.walkovers||t.c3-e.c3),t}function V(e){return e===2?!0:B(e).length>0}function H(e){let t=Math.ceil(e*.5),n=Math.round(e*.8),r=[];for(let i=n;i>=t;i--){let t=e-i;t>=2&&V(i)&&V(t)&&r.push({nA:i,nB:t})}return r}function U(e,{runde1:t=null,walkovers1:n=null}={}){let r=[],i=e,a=1,o=!0;for(;i>2;){let e,s,c;if(o){let r=t;!r&&n!==null&&(r={walkovers:n,c3:Math.floor((i-n)/3),c2:0}),r||=B(i)[0]??{walkovers:i%3,c3:Math.floor(i/3),c2:0},c=r.walkovers,e=r.c3,s=r.c2,o=!1}else{let t=z(i);e=t.c3,s=t.c2,c=0}let l=e*2+s+c;r.push({runde:a,players:i,lanes:e+s,threePlayers:e>0,walkovers:c,advancing:l}),i=l,a++}return r}function W(e,{medSeeding:t=!0,isRunde1:n=!1,walkoverTall:r=null,runde1Oppsett:i=null,shuffleFn:a}={}){let o=a??L,s=[],c=[...e];if(n){let e=i?.walkovers??r??c.length%3;if(e>0){let t=c.slice(0,e);c=c.slice(e);for(let e of t)s.push({players:[e.kasterid],isWalkover:!0,isThreePlayers:!1})}}let l=c.length,u,d;if(i&&n)u=i.c3,d=i.c2;else if(n)u=Math.floor(l/3),d=0;else{let e=z(l);u=e.c3,d=e.c2}let f=u+d;if(t&&f>0){let e=o(c.slice(0,f)),t=o(c.slice(f,2*f)),n=o(c.slice(2*f)),r=0;for(let i=0;i<f;i++){let a=i<u,o=[e[i],t[i]].filter(e=>e!=null),c=a?n[r]:void 0;c&&(o.push(c),r++),s.push({players:o.map(e=>e.kasterid),isWalkover:!1,isThreePlayers:a})}}else{let e=o(c),t=0;for(let n=0;n<u;n++)s.push({players:e.slice(t,t+3).map(e=>e.kasterid),isWalkover:!1,isThreePlayers:!0}),t+=3;for(let n=0;n<d;n++)s.push({players:e.slice(t,t+2).map(e=>e.kasterid),isWalkover:!1,isThreePlayers:!1}),t+=2}return s}function G(e,{showPlayerList:t=!0,initNa:n=null,initFormat:r=null}={}){let i=typeof e==`number`?e:e.length,a=typeof e==`number`?[]:e.map((e,t)=>({...e,cupPlassering:t+1})),o=H(i),s=n===i?i:n!=null&&o.some(e=>e.nA===n)?n:o[0]?.nA??i,c=i-s,l=o.filter(e=>B(e.nA).some(e=>e.c3>0)),u=o.filter(e=>!B(e.nA).some(e=>e.c3>0)),d=B(i).length>0,f=(e,t)=>e.map((e,r)=>{let a=e.nA===s&&n!==i,o=t+r;return`
      <div class="form-check">
        <input class="form-check-input" type="radio" name="group-split" id="split-${o}" value="${e.nA}" ${a?`checked`:``}>
        <label class="form-check-label" for="split-${o}">A:${e.nA} — B:${e.nB}</label>
      </div>`}).join(``),p=[];l.length&&p.push(`<div class="text-muted small fw-semibold mb-1">3 spillere per bane (A)</div>${f(l,0)}`),u.length&&(p.length&&p.push(`<hr class="my-2">`),p.push(`<div class="text-muted small fw-semibold mb-1">2 spillere per bane (A)</div>${f(u,l.length)}`)),d&&(p.length&&p.push(`<hr class="my-2">`),p.push(`
      <div class="form-check">
        <input class="form-check-input" type="radio" name="group-split" id="split-none" value="${i}" ${n===i?`checked`:``}>
        <label class="form-check-label" for="split-ingen">Alle i A</label>
      </div>`));let m=p.join(``),h=r?.A??B(s)[0]??null,g=c>=2?r?.B??B(c)[0]??null:null,_=t?`<div id="group-preview">${K(a,s,h?.walkovers??0,g?.walkovers??0)}</div>`:``;return`
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
            ${J(`Gruppe A`,s,`round1-format-a`,h)}
          </div>
          ${c>=2?`<div id="group-panel-b" class="final-group-col">
            ${J(`Gruppe B`,c,`round1-format-b`,g)}
          </div>`:``}
        </div>
      </div>
      ${_}
      <div class="confirm-banner">
        <button id="confirm-group-btn" class="btn btn-success btn-lg w-100">Bekreft gruppefordeling</button>
      </div>
    </div>
  `}function K(e,t,n=0,r=0){let i=e.slice(0,t),a=e.slice(t);function o(e,t=0){return e.map((e,n)=>{let r=n<t;return`
      <tr>
        <td>${e.cupPlassering}</td>
        <td>${l(e.navn??``)}${r?` <span class="badge bg-info text-dark">Walkover</span>`:``}</td>
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
    </table>`,u=a.length?`
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
        ${u}
      </div>`:``}
    </div>`}function oe(e){let t=e.c3>0?3:2;return`${e.walkovers} walkover - ${t} deltakere per bane`}function se(e,t,n,r=null){let i=B(t);return i.length<=1?``:`<div class="d-flex flex-column align-items-start gap-1 mb-2">${i.map((e,t)=>{let i=`${n}-${t}`,a=JSON.stringify(e),o=r?e.walkovers===r.walkovers&&e.c3===r.c3&&e.c2===r.c2:t===0,s=e.c3>0?`btn-outline-success`:`btn-outline-warning`;return`
      <input type="radio" class="btn-check" name="${n}" id="${i}"
        value='${a}' data-oppsett='${a}' autocomplete="off" ${o?`checked`:``}>
      <label class="btn btn-sm ${s}" for="${i}">${oe(e)}</label>`}).join(``)}</div>`}function q(e,t,n){return`<div id="structure-${n}">
    <table class="table table-sm table-bordered mb-0">
      <thead><tr>
        <th>Runde</th><th>Deltakere</th><th>Baner</th><th>Per bane</th>
      </tr></thead>
      <tbody>${(e>=2?U(e,{runde1:t}):[]).map((e,n)=>{let r=e.walkovers??0,i=e.players-r,a=r>0?`${i} <span class="text-muted">(${r} w.o.)</span>`:`${i}`,o;return o=n===0&&t?t.c3>0&&t.c2>0?`2/3`:t.c3>0?`3`:`2`:e.players%e.lanes===0?String(e.players/e.lanes):`2/3`,`<tr${e.threePlayers?` class="fw-bold"`:``}>
      <td>${e.runde}</td>
      <td>${a}</td>
      <td>${e.lanes}</td>
      <td>${o}</td>
    </tr>`}).join(``)}</tbody>
    </table>
  </div>`}function J(e,t,n,r){let i=n.slice(-1),a=se(e,t,n,r);return`
    <div class="card">
      <div class="card-body">
        <h6 class="fw-bold mb-2">${a?`${e}: Velg format`:`${e} (${t})`}</h6>
        ${a}
        ${q(t,r,i)}
      </div>
    </div>`}function Y(){return crypto.randomUUID()}async function X(t){let{data:n,error:r}=await e.from(`resultat`).select(`kasterid, startnummer, posisjon`).eq(`stevneid`,t);if(r)throw Error(`Feil ved henting av resultat: `+r.message);let i={},a={};for(let e of n??[])e.kasterid==null||e.startnummer==null||(i[e.kasterid]=e.startnummer,(a[e.startnummer]??=[]).push({kasterid:e.kasterid,posisjon:e.posisjon}));let o={};for(let[e,t]of Object.entries(a))t.sort((e,t)=>(e.posisjon??1/0)-(t.posisjon??1/0)||e.kasterid-t.kasterid),o[Number(e)]=t.map(e=>e.kasterid);return{kasteridToSnr:i,snrToMembers:o}}function ce(e,t){let n=e.kasteridToSnr[t];return(n==null?void 0:e.snrToMembers[n])??[t]}async function Z(t,n,r,i,a,o=0,s=null){let c=n.map(()=>Y()),l=o,u=n.map((e,n)=>({match_id:c[n],stevneid:t,fase:`avsluttende`,runde_nummer:r,gruppe_navn:i??null,bane_nummer:e.isWalkover?null:++l,er_bekreftet:e.isWalkover,er_walkover:e.isWalkover,er_tre_spelarar:e.isThreePlayers,runde_navn:s})),{data:d,error:f}=await e.from(`kamp`).insert(u).select(`id, match_id`);if(f)throw Error(`Feil ved innsetting av cup-kampar: `+f.message);let p=Object.fromEntries(d.map(e=>[e.match_id,e.id])),m=[];for(let[e,t]of n.entries()){let n=p[c[e]];t.players.forEach(e=>{for(let t of ce(a,e))m.push({kampid:n,kasterid:t,score_poeng:0,kamp_poeng:0,antall_ringer:0})})}let{error:h}=await e.from(`kamp_spelar`).insert(m);if(h)throw Error(`Feil ved innsetting av cup-spelarar: `+h.message);return d.length}async function le(t,n,r,i=null){let a=[`A`,`B`,`C`],o=0,s=await X(t);for(let c of n){let n=W(c.spelarar,{medSeeding:r,isRunde1:!0,runde1Oppsett:c.runde1Oppsett??null}),{data:l}=await e.from(`kamp`).select(`bane_nummer`).eq(`stevneid`,t).eq(`fase`,`avsluttende`).eq(`runde_nummer`,1).not(`bane_nummer`,`is`,null).order(`bane_nummer`,{ascending:!1}).limit(1),u=l?.[0]?.bane_nummer??0,d=0;if(i&&c.groupName){let e=a.indexOf(c.groupName);for(let t of a.slice(0,e)){let e=i[t];e&&(d+=(e.c3??0)+(e.c2??0))}}let f=Math.max(u,d),p=c.spelarar.length===4;o+=await Z(t,n,1,c.groupName,s,f,p?`Semifinale`:null)}return o}async function Q(t,n){let{data:r}=await e.from(`kamp`).select(`bane_nummer`).eq(`stevneid`,t).eq(`fase`,`avsluttende`).eq(`runde_nummer`,n).not(`bane_nummer`,`is`,null).order(`bane_nummer`,{ascending:!1}).limit(1);return r?.[0]?.bane_nummer??0}async function ue(t,n,r,i){let{data:a}=await e.from(`kamp`).select(`runde_nummer`).eq(`stevneid`,t).eq(`fase`,`avsluttende`).eq(`gruppe_navn`,n).order(`runde_nummer`,{ascending:!1}).limit(1),o=(a?.[0]?.runde_nummer??0)+1,s=i.length===4,c=W(i,{medSeeding:r,isRunde1:!1}),l=await Q(t,o);return{roundNumber:o,matchCount:await Z(t,c,o,n,await X(t),l,s?`Semifinale`:null)}}async function de(t,n){let{data:r}=await e.from(`kamp`).select(`id, runde_nummer, spelarar:kamp_spelar(id, kasterid, score_poeng, omgangar:kamp_omgang(score))`).eq(`stevneid`,t).eq(`fase`,`avsluttende`).eq(`gruppe_navn`,n).eq(`runde_navn`,`Semifinale`).eq(`er_bekreftet`,!0);if(!r?.length)throw Error(`Semifinalane er ikkje bekrefta.`);let i=await X(t),a=r,o=a[0].runde_nummer+1,s=[],c=[];for(let e of a){let t=new Map;for(let n of e.spelarar??[]){if(n.kasterid==null)continue;let e=i.kasteridToSnr[n.kasterid]??`kaster-${n.kasterid}`,r=t.get(e)??{kasterids:[],score:0};r.kasterids.push(n.kasterid),r.score+=n.omgangar?.length?n.omgangar.reduce((e,t)=>e+(t.score??0),0):n.score_poeng??0,t.set(e,r)}let n=[...t.values()].sort((e,t)=>t.score-e.score);n[0]&&s.push(n[0].kasterids),n[1]&&c.push(n[1].kasterids)}let l=await Q(t,o),u={match_id:Y(),stevneid:t,fase:`avsluttende`,runde_nummer:o,gruppe_navn:n,bane_nummer:l+1,runde_navn:`Finale`,er_bekreftet:!1,er_walkover:!1,er_tre_spelarar:!1},d={match_id:Y(),stevneid:t,fase:`avsluttende`,runde_nummer:o,gruppe_navn:n,bane_nummer:l+2,runde_navn:`Bronsefinale`,er_bekreftet:!1,er_walkover:!1,er_tre_spelarar:!1},{data:f,error:p}=await e.from(`kamp`).insert([u,d]).select(`id, runde_navn`);if(p)throw Error(`Feil: `+p.message);let m=f,h=m.find(e=>e.runde_navn===`Finale`).id,g=m.find(e=>e.runde_navn===`Bronsefinale`).id,_=[...s.flat().map(e=>({kampid:h,kasterid:e,score_poeng:0,kamp_poeng:0,antall_ringer:0})),...c.flat().map(e=>({kampid:g,kasterid:e,score_poeng:0,kamp_poeng:0,antall_ringer:0}))],{error:v}=await e.from(`kamp_spelar`).insert(_);if(v)throw Error(`Feil: `+v.message)}function fe(e,n,r,i,a,o){let s=r.filter(e=>e.runde_eliminert==null),c=r.length,u=s.length,d=i===1?a?.[n]??null:null,p=d?.walkovers??0,m=(d?d.c3:u%3==0?u/3:0)+(d?d.c2:u%3==0?0:u/2),h=s.slice(p,p+m),g=s.slice(p+m,p+2*m),_=s.slice(p+2*m),v=document.createElement(`div`);v.className=`final-dialog-overlay`,document.body.appendChild(v);let y=null,b=!1,x=0,S=0;function C(e){if(!b)return;let t=v.querySelector(`.final-dialog-card-wide`);if(!t)return;let n=e.clientX-x,r=e.clientY-S;y={left:n,top:r},t.style.left=`${n}px`,t.style.top=`${r}px`}function w(){b&&(b=!1,document.body.style.userSelect=``)}document.addEventListener(`mousemove`,C),document.addEventListener(`mouseup`,w);function T(){document.removeEventListener(`mousemove`,C),document.removeEventListener(`mouseup`,w)}function E(e){return`<div class="d-flex justify-content-between gap-2 py-1">
      <span class="small">${l(e.navn??``)}</span>
      <span class="small text-muted text-nowrap">${e.kamp_poeng??0}p (${e.score_poeng??0})</span>
    </div>`}function D(r){let C=s.slice(0,p),w=C.length>0?`<div class="mb-3">
          <strong class="d-block mb-1">Walkovers (går vidare utan kamp):</strong>
          ${C.map(E).join(``)}
        </div>`:``,O=r===!0&&m>0?`<div class="alert alert-info small mb-3 py-2">
          Dette er seedinggrupper, ikkje kampar. Spelarar i same gruppe kan ikkje trekkast mot kvarandre. Kampane blir oppretta når du klikkar «Bekreft og opprett kampar».
        </div>`:``,ee=r===!0&&m>0?`<div class="d-flex gap-3 flex-wrap mb-3">
          ${[{label:`Seeding 1`,pool:h},{label:`Seeding 2`,pool:g},..._.length?[{label:`Seeding 3`,pool:_}]:[]].map(({label:e,pool:t})=>`
            <div class="card flex-grow-1">
              <div class="card-body p-2">
                <strong class="d-block mb-2 small text-uppercase">${l(e)}</strong>
                ${t.map(E).join(``)}
              </div>
            </div>`).join(``)}
        </div>`:`<div class="final-player-columns mb-3">
          ${s.slice(p).map((e,t)=>`
            <div class="small d-flex justify-content-between gap-2">
              <span>${p+t+1}. ${l(e.navn??``)}</span>
              <span class="text-muted text-nowrap">${e.kamp_poeng??0}p (${e.score_poeng??0})</span>
            </div>`).join(``)}
        </div>`;v.innerHTML=`
      <div class="card final-dialog-card-wide">
        <div class="final-dialog-drag-handle">
          <p class="text-muted small text-uppercase fw-semibold mb-1">Trekning</p>
          <h5 class="mb-1">Gruppe ${l(n)} — Runde ${i}</h5>
          <p class="text-muted small mb-0">${u} av ${c} spelarar igjen</p>
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
          ${O}
          ${w}
          ${ee}
        </div>
        <div class="final-dialog-footer">
          <div class="d-flex gap-2">
            <button id="bekreft-gen-btn" class="btn btn-primary" ${r===null?`disabled`:``}>Bekreft og opprett kampar</button>
            <button id="avbryt-gen-btn" class="btn btn-secondary">Avbryt</button>
          </div>
        </div>
      </div>`;let k=v.querySelector(`.final-dialog-card-wide`);y&&(k.style.position=`fixed`,k.style.left=`${y.left}px`,k.style.top=`${y.top}px`,k.style.margin=`0`,k.style.zIndex=`10000`),k.querySelector(`.final-dialog-drag-handle`).addEventListener(`mousedown`,e=>{let t=k.getBoundingClientRect();k.style.position=`fixed`,k.style.left=`${t.left}px`,k.style.top=`${t.top}px`,k.style.margin=`0`,k.style.zIndex=`10000`,x=e.clientX-t.left,S=e.clientY-t.top,y={left:t.left,top:t.top},b=!0,document.body.style.userSelect=`none`}),v.querySelector(`#seeding-ja`).addEventListener(`change`,()=>D(!0)),v.querySelector(`#seeding-nei`).addEventListener(`change`,()=>D(!1)),v.querySelector(`#avbryt-gen-btn`).addEventListener(`click`,()=>{T(),v.remove()}),v.querySelector(`#bekreft-gen-btn`).addEventListener(`click`,async()=>{if(r===null)return;let c=v.querySelector(`#bekreft-gen-btn`);c.disabled=!0,c.textContent=`Lagrer…`;try{let t=s.map((e,t)=>({kasterid:e.kasterid,plassering:t+1}));if(i===1){let i={A:a?.A??void 0,B:a?.B??void 0};await le(e,[{groupName:n,spelarar:t,runde1Oppsett:d}],r,a?i:null)}else await ue(e,n,r,t);T(),v.remove(),await o()}catch(e){t(`cup:genererRunde`,e),f(`Feil ved generering av runde`,`error`),c.disabled=!1,c.textContent=`Bekreft og opprett kampar`}})}D(null)}function pe(e,t,n,r){let i=t.map(e=>P(e,!1)),a=[],o=document.createElement(`div`);o.className=`final-dialog-overlay`,document.body.appendChild(o);function s(){let c=a.length===2?t.find(e=>!a.includes(e.rep.kasterid)):null;o.innerHTML=`
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
    `,o.querySelector(`#avbryt-tre-btn`).addEventListener(`click`,()=>o.remove()),o.querySelectorAll(`[data-kasterid]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=Number(e.dataset.kasterid),n=a.indexOf(t);n===-1?a.length<2&&a.push(t):a.splice(n,1),s()})}),o.querySelector(`#bekreft-tre-btn`)?.addEventListener(`click`,async()=>{if(a.length!==2)return;let i=t.find(e=>!a.includes(e.rep.kasterid))??null,s=a.map(e=>t.find(t=>t.rep.kasterid===e)).filter(e=>e!=null).map(e=>e.members.map(e=>e.kasterid)),c=t.flatMap(e=>e.members.map(e=>e.kasterid));o.remove();let{error:l}=await x({kampId:e.id,stevneId:n,roundNumber:e.runde_nummer,roundName:e.runde_navn,allThrowerIds:c,eliminatedIds:i?.members.map(e=>e.kasterid)??[],advancingSides:s});if(l){f(`DB-feil ved bekreft`,`error`);return}await r()})}s()}function me(e){return typeof e!=`object`||!e||Array.isArray(e)?null:e}function he(e){return e.map(e=>({er_bekreftet:e.er_bekreftet,er_walkover:e.er_walkover,runde_nummer:e.runde_nummer,bane_nummer:e.bane_nummer,spelarar:ge(e.spelarar)}))}function ge(e){return e.map(e=>({kasterid:e.kasterid??0,kamp_poeng:e.kamp_poeng??0,score_poeng:e.score_poeng??0,antall_ringer:e.antall_ringer,omgangar:e.omgangar,kaster:e.kaster}))}function _e(e){let n=null,i=null,c=!1,l=new Set;async function m(e,{id:t,isAdmin:r=!1},a=null){i=a,c=r,n&&=(await w(n),null),e.replaceChildren(p(`Laster…`)),await h(e,t)}async function h(n,p){try{let[{data:t},{data:m},{data:_},{data:y},{count:b}]=await Promise.all([d(p),v(p),ne(p),te([`A`,`B`]),r(p)]);if(!t){n.replaceChildren(o(`Stevne ikkje funne.`));return}let x=_.filter(e=>e.kasterid!=null),S=m.filter(e=>e.fase===`innledende`),C=m.filter(e=>e.fase===`avsluttende`),w={},A={},j=new Map;for(let e of x)e.startnummer!=null&&(w[e.kasterid]=e.startnummer,j.set(e.startnummer,(j.get(e.startnummer)??0)+1)),e.posisjon!=null&&(A[e.kasterid]=e.posisjon);let M=[...j.values()].some(e=>e>1),N={};for(let e of m)for(let t of e.spelarar)t.kasterid&&t.kaster&&!N[t.kasterid]&&(N[t.kasterid]=`${t.kaster.fornavn} ${t.kaster.etternavn}`);let P=he(S),F=D(P,x,N,w,A),I=S.length>0&&S.every(e=>e.er_bekreftet),L=C.length>0,R=(S.length>0||L)&&S.every(e=>e.er_bekreftet)&&C.every(e=>e.er_bekreftet),z=x.some(e=>e.gruppe!=null),B=Object.fromEntries(y.map(e=>[e.navn,e.id])),V=me(t.runde1_format),H=b??0;if(t.kategori?.erlagbasert){let{data:e}=await u(p);H=e.length}let U={container:n,stevneid:p,stevne:t,standings:F,startNumberMap:w,positionMap:A,isTeam:M,nameMap:N,initialMatches:S,finalMatches:C,results:x,isAdmin:c,hasGroupAssignment:z,allInitialConfirmed:I,hasFinalMatches:L,round1Format:V,unitCount:H,groupNameMap:B,reload:()=>h(n,p)};c&&i&&(i.innerHTML=O(t,{allMatchesConfirmed:R,hasFinalMatches:L,hasGroupAssignment:z,hasPreconfiguredFormat:V!=null&&t.stevne_fase!==`avsluttende`}));let W=ee(n);if(z){let t=ae(F,P,w,{tableId:`standing-final`,hasGroups:!0,hasElimination:!0,positionMap:A,unitLabel:M?`par`:`spelarar`});n.innerHTML=ie(e.renderMatchesHtml(U),t),k(n,`standing-final`,l),re(n),W===`standing`&&T(n,`standing`),e.bindMatchEvents(n,U),g(n,p)}else n.innerHTML=e.renderSetupHtml(U);i?.querySelector(`#complete-tournament-btn`)?.addEventListener(`click`,async()=>{if(!await s({title:`Fullfør turnering`,message:`Vil du fullføre turneringa? Dette kan ikkje angrast.`,danger:!0}))return;let{error:e}=await E(p,[...F.filter(e=>e.gruppe?.navn===`A`),...F.filter(e=>e.gruppe?.navn===`B`),...F.filter(e=>e.gruppe?.navn!==`A`&&e.gruppe?.navn!==`B`)]);if(e){f(`Feil ved lagring av plasseringar`,`error`);return}let{error:t}=await a(p);if(t){f(`Feil ved fullføring av turnering`,`error`);return}await h(n,p)}),e.bindHeaderEvents(i,U)}catch(e){t(`avsluttendeBase.loadAndRender`,e),n.replaceChildren(o(`Kunne ikkje laste avsluttande fase.`))}}function g(t,r){if(n)return;let i=A(r,[`avsluttende`],t,h,()=>{n&&=(w(n),null)});n=C(r,e.channelName(r),i)}return m}function ve(e,t,n){return g(e.spelarar.filter(e=>e.kasterid!=null),t,n)}function $(e){return e?.members.reduce((e,t)=>e+h(t),0)??0}var ye=_e({channelName:e=>`stevne-avsl-cup-${e}`,renderMatchesHtml:e=>{let{finalMatches:t,standings:n,startNumberMap:r,positionMap:i,isTeam:a,isAdmin:o}=e;return`<div class="d-flex gap-3 flex-wrap">${[...new Set(n.map(e=>e.gruppe?.navn).filter(e=>e!=null))].sort().map(e=>{let s=t.filter(t=>t.gruppe_navn===e),c=n.filter(t=>t.gruppe?.navn===e),l=c.filter(e=>e.runde_eliminert==null).length,u=c.length,d=s.length?Math.max(...s.map(e=>e.runde_nummer)):0,f=s.filter(e=>e.runde_nummer===d),p=f.length>0&&f.every(e=>e.er_bekreftet||e.er_walkover),m=s.some(e=>e.runde_navn===`Semifinale`),h=o&&(s.length===0||p)&&l>1&&!m,g=f.length>0&&f.every(e=>e.runde_navn===`Semifinale`),_=s.some(e=>e.runde_navn===`Finale`);return xe(e,s,l,u,d,h,o&&g&&p&&!_,r,i,a?`par`:`spelarar`,o)}).join(``)}</div>`},bindMatchEvents:(e,t)=>{!t.isAdmin&&t.finalMatches.length===0||De(e,t.stevneid,t.finalMatches,t.isAdmin,t.reload,t.startNumberMap,t.positionMap)},renderSetupHtml:e=>{let{stevne:t,isAdmin:n,round1Format:r,unitCount:i,standings:a}=e,o=r?.nA??null;if(t.stevne_fase===`avsluttende`)return n?G(a,{showPlayerList:!0,initNa:o,initFormat:r}):`<p class="text-muted fst-italic">Gruppefordeling er ikkje klar enno.</p>`;if(!n)return``;if(i<2)return`<p class="text-muted fst-italic">${t.kategori?.erlagbasert?`Minst 2 par må vere oppretta før gruppefordelinga kan setjast.`:`Minst 2 spelarar må vere påmelde før gruppefordelinga kan setjast.`}</p>`;let s=a.length>0;return G(s?a:i,{showPlayerList:s,initNa:o,initFormat:r})},bindHeaderEvents:(e,r)=>{let{container:a,stevneid:o,stevne:c,standings:l,results:u,round1Format:d,allInitialConfirmed:p,hasGroupAssignment:m,groupNameMap:h,reload:g}=r;if(e?.querySelector(`#start-final-btn`)?.addEventListener(`click`,async()=>{if(!p)return;let{error:e}=await i(o,`avsluttende`);if(e){f(`Feil ved oppstart av avsluttande fase`,`error`);return}if(d?.nA!=null){let e=d.nA,{error:t}=await M(o,be(l,u,e,h.A??null,h.B??null));if(t){f(`Feil ved lagring av gruppefordeling`,`error`);return}}await g()}),!m){let e=parseInt(a.querySelector(`#group-assignment-wrapper`)?.dataset.n??`0`)||l.length;function t(e,t){let n=a.querySelector(`input[name="${e}"]:checked`);if(n?.dataset.oppsett)try{return JSON.parse(n.dataset.oppsett)}catch{}return B(t)[0]??null}function r(e,t,n){let r=a.querySelector(`#group-preview`);r&&(r.innerHTML=K(l.map((e,t)=>({...e,cupPlassering:t+1})),e,t?.walkovers??0,n?.walkovers??0))}let i=a.querySelector(`#group-panels`);i&&i.addEventListener(`change`,n=>{let i=n.target;if(!i.matches(`input[name^="round1-format"]`))return;let o=parseInt(a.querySelector(`input[name="group-split"]:checked`)?.value??String(e)),s=e-o,c=t(`round1-format-a`,o),l=t(`round1-format-b`,s);if(i.name===`round1-format-a`){let e=a.querySelector(`#structure-a`);e&&(e.outerHTML=q(o,c,`a`))}else{let e=a.querySelector(`#structure-b`);e&&(e.outerHTML=q(s,l,`b`))}r(o,c,l)}),a.querySelectorAll(`input[name="group-split"]`).forEach(t=>{t.addEventListener(`change`,()=>{let n=parseInt(t.value),a=e-n,o=B(n)[0]??null,s=a>=2?B(a)[0]??null:null;i&&(i.innerHTML=`<div id="group-panel-a" class="final-group-col">
                ${J(`Gruppe A`,n,`round1-format-a`,o)}
              </div>`+(a>=2?`<div id="group-panel-b" class="final-group-col">
                ${J(`Gruppe B`,a,`round1-format-b`,s)}
              </div>`:``)),r(n,o,s)})}),a.querySelector(`#confirm-group-btn`)?.addEventListener(`click`,async()=>{let r=a.querySelector(`input[name="group-split"]:checked`);if(!r)return;let i=parseInt(r.value),s=e-i,{error:d}=await n(o,{A:t(`round1-format-a`,i),B:s>=2?t(`round1-format-b`,s):null,nA:i});if(d){f(`Feil ved lagring av format`,`error`);return}if(c.stevne_fase===`avsluttende`){let{error:e}=await M(o,be(l,u,i,h.A??null,h.B??null));if(e){f(`Feil ved lagring av gruppefordeling`,`error`);return}}f(`Gruppefordeling lagra`,`success`),await g()})}e?.querySelector(`#edit-group-assignment-btn`)?.addEventListener(`click`,async()=>{await s({title:`Tilbakestill gruppeinndeling`,message:`Gruppefordeling og format vert fjerna.`,danger:!0})&&(await Promise.all([N(o),n(o,null)]),await g())}),m&&(a.querySelectorAll(`[data-generate-group]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.generateGroup??``,n=parseInt(e.dataset.runde??`1`);fe(o,t,l.filter(e=>e.gruppe?.navn===t),n,d,g)})}),a.querySelectorAll(`[data-generate-finale-group]`).forEach(e=>{e.addEventListener(`click`,async()=>{let n=e.dataset.generateFinaleGroup??``;e.disabled=!0,e.textContent=`Genererer…`;try{await de(o,n),await g()}catch(n){t(`cup:genererFinale`,n),f(`Feil ved generering av finale`,`error`),e.disabled=!1,e.textContent=`Generer finale`}})}))}});function be(e,t,n,r,i){return e.flatMap((e,a)=>{let o=a<n?r:i??r,s=e.startnummer==null?[]:t.filter(t=>t.startnummer===e.startnummer).map(e=>e.kasterid);return(s.length?s:[e.kasterid]).map(e=>({kasterid:e,gruppeid:o}))})}function xe(e,t,n,r,i,a,o,s,c,u,d=!0){let f=new Map;for(let e of t)f.has(e.runde_nummer)||f.set(e.runde_nummer,[]),f.get(e.runde_nummer).push(e);let p=[...f.entries()].reverse().map(([e,t])=>{let n=t[0]?.runde_navn??`Runde ${e}`,r=t.filter(e=>!e.er_walkover);return r.length?`
      <h6 class="fw-bold text-center mb-1">${l(n)}</h6>
      <div class="d-flex flex-wrap gap-2 mb-2">
        ${r.map(e=>Ee(e,s,c,d)).join(``)}
      </div>`:``}).join(``),m=i+1,h=a?`<button class="btn btn-success w-100 mt-2"
         data-generate-group="${l(e)}" data-runde="${m}">
         Generer runde ${m}
       </button>`:``,g=o?`<button class="btn btn-success w-100 mt-2" data-generate-finale-group="${l(e)}">
         Generer finale
       </button>`:``;return`
    <div class="final-group-col">
      <h6 class="text-center fw-bold mb-2">Gruppe ${l(e)} (${r} ${l(u)})</h6>
      ${h}
      ${g}
      ${p}
    </div>`}function Se(e,t,n,r){let i=$(t),a=i>0||r.isConfirmed&&!r.isThreeSides||r.hasRounds?i:`—`,o=t.rep.kamp_plassering,s=e.er_bekreftet&&o!=null&&o>=n,c=e.er_bekreftet&&o!=null&&o<n,l=s?`match-eliminated`:c?`match-advancing`:``,u=`text-center fw-semibold final-score-cell${r.canEditScore?` score-editable`:``}`,d=r.canEditScore?` data-endre-score="${e.id}"`:``;return`<tr${l?` class="${l}"`:``}>
    <td>${P(t,!1)}</td>
    <td class="${u}"${d}>${a}</td>
  </tr>`}function Ce(e,t,n){return e.er_walkover?`<tr>
        <td colspan="2">${P(t[0]??null,!1)} <span class="badge bg-secondary">Walkover</span></td>
      </tr>`:t.map(r=>Se(e,r,t.length,n)).join(``)}function we(e,t,n,r){if(e.er_tre_spelarar)return{css:r?`btn-secondary`:`btn-outline-secondary`,text:r?`Endre plassering`:`Sett plassering`,disabled:!1,extraCss:``};let i=j(e,ge(t.map(e=>e.rep)),n);return{css:r?`btn-secondary`:i?`btn-success`:`btn-outline-secondary`,text:r?`Bekreftet`:`Bekreft`,disabled:r||!i,extraCss:` btn-confirm`}}function Te(e,t,n){return`<tr>
            <td colspan="2" class="text-end pe-1">
              ${!e.er_walkover&&!e.er_tre_spelarar?`<button class="btn btn-primary btn-sm" id="plus-${e.id}"${t?` disabled`:``}>+</button> `:``}
              ${t?``:`<button class="btn btn-secondary btn-sm" id="scoreboard-${e.id}">Scoreboard</button> `}
              <button class="btn ${n.css} btn-sm${n.extraCss}" id="bekrft-${e.id}"${n.disabled?` disabled`:``}>${n.text}</button>
            </td>
          </tr>`}function Ee(e,t,n,r=!0){let i=ve(e,t,n),a=e.er_bekreftet||e.er_walkover,o=e.spelarar.some(e=>(e.omgangar?.length??0)>0),s={isConfirmed:a,hasRounds:o,canEditScore:r&&e.er_bekreftet&&!e.er_tre_spelarar&&!o,isThreeSides:e.er_tre_spelarar},l=r?Te(e,a,we(e,i,o,a)):``;return`
    <div class="final-match-block">
      <div class="final-match-header">
        <span class="final-match-lane">Bane ${e.bane_nummer}</span>
        ${o&&!a?c():``}
      </div>
      <table class="table table-sm table-bordered mb-0">
        <tbody>
          ${Ce(e,i,s)}
          ${l}
        </tbody>
      </table>
    </div>`}function De(e,n,r,i,a,o,s){for(let c of r){let r=ve(c,o,s),l=r[0]??null,u=r[1]??null,d=l?.rep??null,p=u?.rep??null,h=P(l,!1),g=P(u,!1),v=r.flatMap(e=>e.members.map(e=>e.id)),y=async(e,n)=>{let r=[];d?.id&&r.push(m(d.id,e)),p?.id&&r.push(m(p.id,n));for(let e of[l,u])for(let t of e?.members.slice(1)??[])r.push(m(t.id,0));try{return(await Promise.all(r)).find(e=>e.error)??null}catch(e){return t(`cup:writeSideScore`,e),{error:e}}};if(e.querySelector(`#plus-${c.id}`)?.addEventListener(`click`,()=>{I({side1Name:h,side2Name:g,currentS1:$(l),currentS2:$(u),playerIds:v,hasRounds:c.spelarar.some(e=>(e.omgangar?.length??0)>0),logPrefix:`cup`,onSave:y,onSaved:a})}),e.querySelector(`#scoreboard-${c.id}`)?.addEventListener(`click`,()=>{window.open(`#/kamp/${c.id}`,`_blank`)}),e.querySelector(`#bekrft-${c.id}`)?.addEventListener(`click`,async e=>{if(c.er_tre_spelarar)pe(c,r,n,a);else{let t=e.currentTarget;t.disabled=!0,t.textContent=`Lagrer…`;try{await Oe(n,c,r,a)||(t.disabled=!1,t.textContent=`Bekreft`)}catch{t.disabled=!1,t.textContent=`Bekreft`}}}),i&&c.er_bekreftet&&!c.er_tre_spelarar){let t=r.flatMap(e=>e.members.map(e=>e.kasterid)),i=()=>{F(h,g,$(l),$(u),async(e,r)=>{if(v.length){let{error:e}=await b(v);if(e){f(`DB-feil ved sletting av omgangar`,`error`);return}}if(await y(e,r)){f(`DB-feil ved oppdatering av score`,`error`);return}let i=e>=r?l:u,o=e>=r?u:l,s=i?.members.map(e=>e.kasterid)??[],d=o?.members.map(e=>e.kasterid)??[],p=[...s.map(e=>({kasterid:e,plassering:1})),...d.map(e=>({kasterid:e,plassering:2}))],{error:m}=await S(c.id,p);if(m){f(`DB-feil ved oppdatering av plassering`,`error`);return}await _({stevneId:n,roundNumber:c.runde_nummer,roundName:c.runde_navn,allThrowerIds:t,newWinnerIds:s,newLoserIds:d}),await a()})};e.querySelectorAll(`[data-endre-score="${c.id}"]`).forEach(e=>e.addEventListener(`click`,i))}}}async function Oe(e,t,n,r){let i=n[0]??null,a=n[1]??null,{data:o}=await y(t.id),c=e=>e?.members.reduce((e,t)=>e+h(o.find(e=>e.id===t.id)??t),0)??0,l=c(i),u=c(a);if(l===0&&u===0&&!await s({title:`Ingen score registrert`,message:`Vil du bekrefte kampen likevel?`}))return!1;let d=l>=u?i:a,p=l>=u?a:i,m=n.flatMap(e=>e.members.map(e=>e.kasterid)),{error:g}=await x({kampId:t.id,stevneId:e,roundNumber:t.runde_nummer,roundName:t.runde_navn,allThrowerIds:m,eliminatedIds:p?.members.map(e=>e.kasterid)??[],advancingSides:d?[d.members.map(e=>e.kasterid)]:[]});return g?(f(`DB-feil ved bekreft`,`error`),!1):(await r(),!0)}export{ye as render};