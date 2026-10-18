import{f as e}from"./index-D6KMvqKH.js";import{t}from"./expandableRows-DiwJkvot.js";function n(e){let t=null;return{async get(n){if(t?.year===n)return t.data;let r=await e(n);return r&&(t={year:n,data:r}),r},clear(){t=null}}}function r(t,n){let r=t.value(n),i=t.title?.(n)??``,a=i&&i!==r?` title="${e(i)}"`:``;return`<td class="${t.cellClass??``}"${a}>${e(r)}</td>`}function i(t,n){return n.length?`
    <div class="rank-detalj-boks">
      <table class="rank-detalj-tabell">
        <thead><tr>${t.map(t=>`<th class="${t.cellClass??``}">${e(t.label)}</th>`).join(``)}</tr></thead>
        <tbody>${n.map(e=>`<tr>${t.map(t=>r(t,e)).join(``)}</tr>`).join(``)}</tbody>
      </table>
    </div>`:``}function a(e){let t=[{label:`PL`,cellClass:`res-td-pl`,value:t=>`${e.placement(t)}.`},{label:e.nameLabel??`NAMN`,cellClass:`res-td-navn`,value:e.name}];e.club&&t.push({label:`KLUBB`,cellClass:`res-td-klubb`,value:e.club});for(let n of e.columns??[]){let e={label:n.label,cellClass:n.cellClass??`res-tal`,value:n.value};n.title!=null&&(e.title=n.title),t.push(e)}return t.push({label:e.mainLabel,cellClass:`res-tal res-td-tot`,value:e.main}),t}function o(t,n,r,i){let a=i.detail?.(t)??``,o=`${i.idPrefix}-detalj-${n}`,s=i.rowClass?.(t),c=[`rank-rad`,n%2==1?`rank-rad--stripe`:``,s??``].filter(Boolean).join(` `),l=r.length-1,u=r.map((n,r)=>{let i=r===l&&a?`<span class="rank-pil" aria-hidden="true">▾</span>`:``;return`<td class="${n.cellClass}">${e(n.value(t))}${i}</td>`}).join(``),d=a?` role="button" tabindex="0" aria-expanded="false" aria-controls="${o}"`:``,f=`<tr class="${c}${a?` rank-rad--klikk`:``}"${d}>${u}</tr>`;return a?`${f}<tr class="rank-detalj-rad" id="${o}" hidden><td colspan="${r.length}">${a}</td></tr>`:f}function s(t,n){let r=a(n);return`
    <div class="res-tabell-boks">
      <table class="res-table res-table--gruppert rank-table">
        <thead><tr class="res-thead-columns">${r.map(t=>`<th class="${t.cellClass}"${t.title?` title="${e(t.title)}"`:``}>${e(t.label)}</th>`).join(``)}</tr></thead>
        <tbody>${t.map((e,t)=>o(e,t,r,n)).join(``)}</tbody>
      </table>
    </div>`}function c(t,n,r){let i=r.detail?.(t)??``,a=`${r.idPrefix}-kort-${n}`,o=r.club?.(t),s=r.meta?.(t),c=r.rowClass?.(t);return`
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
    </div>`}function l(e,t){return`
    <div class="res-mobil-blokk">
      <div class="res-group"><div class="res-group-rows">${e.map((e,n)=>c(e,n,t)).join(``)}</div></div>
    </div>
    <div class="res-desktop-blokk">${s(e,t)}</div>`}function u(e,t){let n=e.querySelector(`.res-detalj-pil, .rank-pil`);n&&(n.textContent=t?`▴`:`▾`)}function d(e){t(e,{trigger:`.res-detalj-btn`,panel:e=>e.closest(`.res-row`)?.querySelector(`.res-detalj`)??null,onToggle:(e,t)=>{let n=e.querySelector(`.res-detalj-tekst`);n&&(n.textContent=t?`Skjul detaljar`:`Vis detaljar`),u(e,t)}}),t(e,{trigger:`.rank-rad--klikk`,panel:e=>{let t=e.nextElementSibling;return t instanceof HTMLElement&&t.classList.contains(`rank-detalj-rad`)?t:null},onToggle:(e,t)=>{e.classList.toggle(`rank-rad--open`,t),u(e,t)}})}function f(e,t){return e.length>t?e.slice(0,t).trimEnd()+`…`:e}export{n as a,l as i,d as n,i as r,f as t};