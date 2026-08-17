import{t as e}from"./logError-CTQ3euge.js";import{Ln as t,Mt as n,Wn as r,Xn as i,ct as a,d as o,jn as s,m as c,mr as l,pr as u,qn as d,zn as f}from"./index-DBNqlYTc.js";import{h as p,i as m,t as h,v as g}from"./kampService-Hp_9s8-S.js";import{t as _}from"./realtime-CtSjZAnf.js";import{t as v}from"./groupBy-Bg_SEHjk.js";import{t as y}from"./ScoreboardButton-cO_q_Bk1.js";import{l as b,n as x,o as S,r as C}from"./stevne-CKXIwIkS.js";import{o as w,t as T}from"./ScoreEditor-BzXpk_QP.js";import{C as E,D,E as O,O as k,T as A,_ as j,b as M,g as N,k as P,v as F,w as I,x as L,y as R}from"./padInput-I_H3ZVvs.js";function z(e){return e?.members.some(e=>(e.omgangar?.length??0)>0)??!1}function B(e,t,n){return e.er_bekreftet?`done`:n||t?`in-progress`:`not-started`}function V(){return`
    <div class="match-legend">
      <div class="match-legend__item"><div class="match-legend__stripe match-legend__stripe--not-started"></div> Ikke startet</div>
      <div class="match-legend__item"><div class="match-legend__stripe match-legend__stripe--in-progress"></div> Pågår</div>
      <div class="match-legend__item"><div class="match-legend__stripe match-legend__stripe--done"></div> Ferdig</div>
    </div>`}function H(e,t,n,r,i={},a={}){let o=t.map(e=>X(e,n,r,i,a)).join(``),s=t.map(e=>Z(e,n,r,i,a)).join(``);return`
    <div class="mb-3">
      <h6 class="text-center fw-bold mb-1">Runde ${e}</h6>
      <table class="table table-sm match-table mb-0 match-table--desktop">
        <thead class="stevne-thead">
          <tr>
            <th class="th-36 text-center">B</th>
            <th>P1</th>
            <th class="th-96 text-center initial-score-th">SCORE</th>
            <th>P2</th>
            ${r?`<th class="th-148"></th>`:`<th class="th-80"></th>`}
          </tr>
        </thead>
        <tbody>${o}</tbody>
      </table>
      <ul class="match-list-mobile list-unstyled mb-0">${s}</ul>
    </div>`}function U(e,t,n){for(let r of t){e.querySelectorAll(`[data-kamp-id="${r}"]`).forEach(e=>e.classList.add(`match-newly-confirmed`));let t=n.find(e=>e.id===r);if(t)for(let n of t.spelarar)e.querySelectorAll(`#standing-initial tr.standing-player-row[data-kasterid="${n.kasterid}"] td`).forEach(e=>e.classList.add(`standing-new-confirmed`))}}function W(e,t,n,r){return t?i(e,!0):i(e,!1)+(n?r:0)}function G(e,t,n,r,i,a,o){let s=W(t,e.er_bekreftet,r,a),c=W(n,e.er_bekreftet,i,o),l=e.er_walkover&&!e.er_bekreftet,u=e.er_bekreftet||e.er_walkover||r||i||s>0||c>0;return{s1:l?21:s,s2:l?0:c,hasPoints:u}}function K(e,t,n,i){let[a,o]=r(e.spelarar,t,i),s=a?.rep??null,c=o?.rep??null,l=e.er_walkover&&!c?.kaster,u=z(a),d=z(o),f=u||d,{s1:p,s2:m,hasPoints:h}=G(e,a,o,u,d,n[s?.kasterid??-1]??0,n[c?.kasterid??-1]??0);return{side1:a,side2:o,p1:s,p2:c,p2IsBye:l,hasRounds:f,s1:p,s2:m,hasPoints:h,status:B(e,h,f),isLive:f&&!e.er_bekreftet,showScoreboard:!(e.er_bekreftet&&!f)}}function q(e,t,n=`–`){return`<span class="initial-score-inner"><span class="initial-s1">${e}</span><span class="initial-sep">${n}</span><span class="initial-s2">${t}</span></span>`}function J(e,t){return t?`${e} (${t})`:e}function Y(e,t,n){return`<td class="pe-2">
        <span class="d-flex align-items-center justify-content-end gap-2">
          ${t?o():``}
          ${n?y(e.id):``}
        </span>
      </td>`}function X(e,t,n=!0,r={},i={}){let{side1:a,side2:o,p1:s,p2:c,p2IsBye:l,s1:u,s2:d,hasPoints:f,status:p,isLive:m,showScoreboard:h}=K(e,t,r,i),g=s?.kasterid?t[s.kasterid]??``:``,_=c?.kasterid?t[c.kasterid]??``:``,v=J(P(a,!1),g),y=J(l?`Walkover`:P(o,!1),_),b=n&&!e.er_walkover,x=`text-center initial-score-cell${b?` score-editable`:``}`,S=b?` data-endre-score="${e.id}"`:``;return`
    <tr class="match-row-desktop" data-kamp-id="${e.id}" data-status="${p}">
      <td class="text-center">${e.bane_nummer??``}</td>
      <td>${v}</td>
      <td class="${x}"${S}>${f?q(u,d):`—`}</td>
      <td>${y}</td>
      ${Y(e,m,h)}
    </tr>`}function Z(e,t,n,r={},i={}){let{side1:a,side2:s,p2IsBye:c,s1:l,s2:u,hasPoints:d,status:f,isLive:p,showScoreboard:m}=K(e,t,r,i),h=P(a,!0),g=c?`Walkover`:P(s,!0),_=d?q(l,u):q(``,``,`—`),v=n&&!e.er_walkover,b=v?` id="m-score-${e.id}"`:``,x=v?` score-editable`:``;return`
    <li class="match-row-mobile${n?``:` match-row-mobile--viewer`}" data-kamp-id="${e.id}" data-status="${f}">
      <div class="match-row-mobile__header">
        <span class="match-mobile-lane">${e.bane_nummer??``}</span>
        <span class="match-mobile-name"><span class="match-mobile-name__p1">${h}</span><span class="match-mobile-name__p2"><span class="match-mobile-vs">vs</span> ${g}</span></span>
        <span class="match-mobile-pill-slot">${p?o():``}</span>
        <span class="match-mobile-result${x}"${b}>${_}</span>
        <span class="match-mobile-sb-slot">${m?y(e.id):``}</span>
      </div>
      ${n?`<div class="match-mobile-detail"></div>`:``}
    </li>`}function Q(t){let o=null,d=null,f=!1,y=new Set,z=null,B=new Set,W=new Set,G=null;async function K(e,{id:n,isAdmin:r=!1},i=null){d=i,f=r,t.onReset?.(),o&&=(await _(o),null),e.replaceChildren(l(`Laster…`)),await q(e,n)}async function q(n,r){try{let[{data:e},{data:i},{data:o}]=await Promise.all([a(r),m(r),s(r)]);if(!e){n.replaceChildren(u(`Stevne ikkje funne.`));return}W.clear();for(let e of i)for(let t of e.spelarar)W.add(t.id);let{startNumberMap:c,hcpMap:l,positionMap:d,isTeam:p}=b(o),h=v(i,e=>e.runde_nummer),g=$(i,o,c,d,p),_=J(i),x=i.length>0&&i.every(e=>e.er_bekreftet),S=f&&e.stevne_fase!==`avsluttende`;Y({container:n,stevneid:r,stevne:e,allMatches:i,roundMap:h,startNumberMap:c,standing:g,isAdmin:f,allMatchesConfirmed:x,reload:()=>q(n,r)});let C=[...(t.filterRounds??(e=>e))(h).entries()].map(([e,t])=>H(e,t,c,S,l,d)).join(``)+V(),T=O(g,i,c,{tableId:`standing-initial`,hasMatchCount:!0,positionMap:d,unitLabel:p?`par`:`spelarar`,qualifyCutoff:w(e.runde1_format)?.nA??null}),k=E(n);n.innerHTML=A(C,T),M(n),k===`standing`&&D(n,`standing`),R(n,`standing-initial`,y),U(n,_,i),F(n);for(let e of i)Q(n,r,e,c,l,d,S);ee(n,r)}catch(r){e(`${t.logPrefix}.loadAndRender`,r),n.replaceChildren(u(`Kunne ikkje laste innleiande fase.`))}}function J(e){let t=new Set(e.filter(e=>e.er_bekreftet).map(e=>e.id)),n=z?new Set([...t].filter(e=>!z.has(e))):new Set,r=new Set([...n,...B]);return B=new Set(n),z=t,r}function Y(e){if(k(d,t.bannerMeta(e)),!d)return;let n=t.getMenuItems(e),r=e.stevne.antall_runder_innl,i=r!=null&&e.roundMap.size>=r;d.innerHTML=C(f?I(e.stevne,{erSwiss:t.isSwiss,canGenerateRound:r==null||e.roundMap.size<r,canComplete:e.allMatchesConfirmed&&(r==null||i),extras:n}):n),x(d),t.bindBannerExtra(d,e),j(d,e.stevneid,()=>e.standing,e.reload),N(d,{title:`Autofullfør kampar`,message:`Autofullfør alle ubekreftede innleiande kampar?`},async()=>{await S(e.stevneid),await e.reload()})}function X(e,n,a,o,s,c){let[l,u]=r(a.spelarar,o,c),d=[...l?.members??[],...u?.members??[]].map(e=>e.id),f=async()=>{await T({side1Name:P(l,!1),side2Name:P(u,!1),currentS1:i(l,a.er_bekreftet),currentS2:i(u,a.er_bekreftet),baneLabel:`Bane ${a.bane_nummer??`?`}`,rundeLabel:`Runde ${a.runde_nummer}`,playerIds:d,hasRounds:a.spelarar.some(e=>(e.omgangar?.length??0)>0),logPrefix:t.logPrefix,onSaved:async(t,r)=>{await te(e,n,a,o,s,c,[t,r])||await q(e,n)}})};e.querySelectorAll(`[data-endre-score="${a.id}"]`).forEach(e=>e.addEventListener(`click`,f)),e.querySelector(`#m-score-${a.id}`)?.addEventListener(`click`,e=>{e.stopPropagation(),f()})}function Z(e,t){let n=e.querySelector(`.match-row-mobile[data-kamp-id="${t.id}"]`);n&&f&&n.querySelector(`.match-row-mobile__header`)?.addEventListener(`click`,t=>{if(t.target.closest(`[data-scoreboard-kamp-id]`))return;let r=n.dataset.expanded===`true`;e.querySelectorAll(`.match-row-mobile[data-expanded="true"]`).forEach(e=>{e.dataset.expanded=`false`}),n.dataset.expanded=r?`false`:`true`})}function Q(e,t,n,r,i,a,o){o&&X(e,t,n,r,i,a),Z(e,n)}function ee(e,n){if(o)return;let r=L(n,[`innledende`],e,q,()=>{o&&=(_(o),null)});G=r,o=p(n,t.channelName(n),r,e=>W.has(e))}async function te(e,t,i,a,o={},s={},l){let[u,d]=r(i.spelarar,a,s),f=u?.rep??null,p=d?.rep??null,m=o[f?.kasterid??-1]??0,_=o[p?.kasterid??-1]??0,{error:v}=await h({kampId:i.id,sides:[g(u,l?.[0]),g(d,l?.[1])],hcp:[m,_],erWalkover:i.er_walkover,outcome:{type:`innledende`}});return v?(c(`DB-feil ved bekreft: `+n(v),`error`),!1):(G?G():await q(e,t),!0)}return K}function $(e,n,r,i,a){let{playerMap:o,realThrowerIds:s}=t(e,r),c=Object.values(o).filter(e=>s.has(e.kasterid)).map(e=>({...e,hcp:n.find(t=>t.kasterid===e.kasterid)?.hcp??0}));return f(a?d(c,i):c,e)}export{Q as t};