import{f as e}from"./index-CKF_crql.js";import{t}from"./expandableRows-DqcsNOuh.js";function n(e){let t=null;return{async get(n){if(t?.year===n)return t.data;let r=await e(n);return r&&(t={year:n,data:r}),r},clear(){t=null}}}var r=`<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="12" y1="7.5" x2="12" y2="7.5"/></svg>`,i=0;function a({slot:e,label:t=`Vis info`,html:n}){let a=`info-tip-${i++}`,o=document.createElement(`span`);o.className=`info-tip`;let s=document.createElement(`button`);s.type=`button`,s.className=`info-tip__knapp`,s.setAttribute(`aria-label`,t),s.setAttribute(`aria-expanded`,`false`),s.setAttribute(`aria-controls`,a),s.title=t,s.innerHTML=r;let c=document.createElement(`div`);c.className=`info-tip__panel`,c.id=a,c.setAttribute(`role`,`note`),c.hidden=!0,c.innerHTML=n,o.append(s,c);function l(e){c.hidden=!e,s.setAttribute(`aria-expanded`,String(e))}s.addEventListener(`click`,e=>{e.stopPropagation(),l(!!c.hidden)});function u(e){if(!o.isConnected){document.removeEventListener(`click`,u);return}!c.hidden&&!o.contains(e.target)&&l(!1)}function d(e){if(!o.isConnected){document.removeEventListener(`keydown`,d);return}e.key===`Escape`&&!c.hidden&&(l(!1),s.focus())}return document.addEventListener(`click`,u),document.addEventListener(`keydown`,d),e.replaceWith(o),{setHtml:e=>{c.innerHTML=e}}}function o(t,n){let r=t.value(n),i=t.title?.(n)??``,a=i&&i!==r?` title="${e(i)}"`:``;return`<td class="${t.cellClass??``}"${a}>${e(r)}</td>`}function s(t,n){return n.length?`
    <div class="rank-detalj-boks">
      <table class="rank-detalj-tabell">
        <thead><tr>${t.map(t=>`<th class="${t.cellClass??``}">${e(t.label)}</th>`).join(``)}</tr></thead>
        <tbody>${n.map(e=>`<tr>${t.map(t=>o(t,e)).join(``)}</tr>`).join(``)}</tbody>
      </table>
    </div>`:``}function c(e){let t=[{label:`PL`,cellClass:`res-td-pl`,value:t=>`${e.placement(t)}.`},{label:e.nameLabel??`NAMN`,cellClass:`res-td-navn`,value:e.name}];e.club&&t.push({label:`KLUBB`,cellClass:`res-td-klubb`,value:e.club});for(let n of e.columns??[]){let e={label:n.label,cellClass:n.cellClass??`res-tal`,value:n.value};n.title!=null&&(e.title=n.title),t.push(e)}return t.push({label:e.mainLabel,cellClass:`res-tal res-td-tot`,value:e.main}),t}function l(t,n,r,i){let a=i.detail?.(t)??``,o=`${i.idPrefix}-detalj-${n}`,s=i.rowClass?.(t),c=[`rank-rad`,n%2==1?`rank-rad--stripe`:``,s??``].filter(Boolean).join(` `),l=r.length-1,u=r.map((n,r)=>{let i=r===l&&a?`<span class="rank-pil" aria-hidden="true">▾</span>`:``;return`<td class="${n.cellClass}">${e(n.value(t))}${i}</td>`}).join(``),d=a?` role="button" tabindex="0" aria-expanded="false" aria-controls="${o}"`:``,f=`<tr class="${c}${a?` rank-rad--klikk`:``}"${d}>${u}</tr>`;return a?`${f}<tr class="rank-detalj-rad" id="${o}" hidden><td colspan="${r.length}">${a}</td></tr>`:f}function u(t,n){let r=c(n);return`
    <div class="res-tabell-boks">
      <table class="res-table res-table--gruppert rank-table">
        <thead><tr class="res-thead-columns">${r.map(t=>`<th class="${t.cellClass}"${t.title?` title="${e(t.title)}"`:``}>${e(t.label)}</th>`).join(``)}</tr></thead>
        <tbody>${t.map((e,t)=>l(e,t,r,n)).join(``)}</tbody>
      </table>
    </div>`}function d(t,n,r){let i=r.detail?.(t)??``,a=`${r.idPrefix}-kort-${n}`,o=r.club?.(t),s=r.meta?.(t),c=r.rowClass?.(t);return`
    <div class="res-row res-row--detalj${c?` ${c}`:``}">
      <span class="res-pl">${e(r.placement(t))}.</span>
      <div class="res-info">
        <span class="res-navn">${e(r.name(t))}</span>
        ${o?`<span class="res-klubb">${e(o)}</span>`:``}
        ${s?`<span class="res-meta">${e(s)}</span>`:``}
        ${i?`<button type="button" class="res-detalj-btn" aria-expanded="false" aria-controls="${a}">
                 <span class="res-detalj-tekst">Vis detaljar</span><span class="res-detalj-pil" aria-hidden="true">▾</span>
               </button>`:``}
      </div>
      <div class="res-tot">
        <span class="res-tot-label">${e(r.mainLabel)}</span>
        <span class="res-tot-verdi">${e(r.main(t))}</span>
      </div>
      ${i?`<div class="res-detalj" id="${a}" hidden>${i}</div>`:``}
    </div>`}function f(e,t){return`
    <div class="res-mobil-blokk">
      <div class="res-group"><div class="res-group-rows">${e.map((e,n)=>d(e,n,t)).join(``)}</div></div>
    </div>
    <div class="res-desktop-blokk">${u(e,t)}</div>`}function p(e,t){let n=e.querySelector(`.res-detalj-pil, .rank-pil`);n&&(n.textContent=t?`▴`:`▾`)}function m(e){t(e,{trigger:`.res-detalj-btn`,panel:e=>e.closest(`.res-row`)?.querySelector(`.res-detalj`)??null,onToggle:(e,t)=>{let n=e.querySelector(`.res-detalj-tekst`);n&&(n.textContent=t?`Skjul detaljar`:`Vis detaljar`),p(e,t)}}),t(e,{trigger:`.rank-rad--klikk`,panel:e=>{let t=e.nextElementSibling;return t instanceof HTMLElement&&t.classList.contains(`rank-detalj-rad`)?t:null},onToggle:(e,t)=>{e.classList.toggle(`rank-rad--open`,t),p(e,t)}})}function h(e,t){return e.length>t?e.slice(0,t).trimEnd()+`…`:e}export{a,f as i,m as n,n as o,s as r,h as t};