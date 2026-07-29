import{t as e}from"./logError-D5z16FyH.js";import{B as t,Dt as n,G as r,H as i,J as a,K as o,U as s,V as c,W as l,a as u,ct as d,i as f,q as p,t as m}from"./index-BWk7I7cT.js";import{t as h}from"./adminForms-BKTRhXRJ.js";import{r as g}from"./klubbService-CaXvOdL5.js";import{d as _}from"./kasterService-B3gLOC11.js";import{r as v}from"./kaster-D1SjB08R.js";import{t as y}from"./LoadingState-CllUVMAe.js";import{t as b}from"./EmptyState-17a_4X87.js";var x=[`links`,`users`,`club-admin`],S={links:`Koblingforespørslar`,users:`Brukarar`,"club-admin":`Klubbadmin-tilgang`};function C(e){let t=e.stevne_fase===`avsluttende`?`avsluttende`:`innledende`;return f({title:e.navn,href:`#/stevne/${e.id}/${t}`,date:n(e.dato),status:`live`})}function w(e){let t=document.createElement(`div`);return t.className=`stevne-kort-liste`,e.forEach(e=>t.appendChild(e)),t}async function T(e){e.innerHTML=`
    <div class="content-page">
      <div id="live-section"></div>
      <h2 class="mb-3">Administrasjon</h2>
      <ul class="nav nav-tabs mb-4" id="admin-tabs">
        ${x.map((e,t)=>`<li class="nav-item">
          <button class="nav-link${t===0?` active`:``}" data-tab="${e}">${S[e]}</button>
        </li>`).join(``)}
      </ul>
      <div id="admin-content"></div>
    </div>`;let t=e.querySelector(`#admin-content`),n=`links`;async function r(r){n=r,e.querySelectorAll(`[data-tab]`).forEach(e=>{e.classList.toggle(`active`,e.dataset.tab===r)}),y(`Laster...`),r===`links`&&await E(t),r===`users`&&await O(t),r===`club-admin`&&await k(t)}m(()=>r(n)),e.querySelector(`#admin-tabs`).addEventListener(`click`,e=>{let t=e.target.closest(`[data-tab]`);t?.dataset.tab&&r(t.dataset.tab)});let[,{data:i}]=await Promise.all([r(`links`),d()]),a=(i??[]).filter(e=>!e.erfullfort);a.length&&e.querySelector(`#live-section`).replaceChildren(w(a.map(C)))}async function E(e){let{data:t,error:n}=await l(),i=e.closest(`.content-page`)?.querySelector(`[data-tab="links"]`);if(i&&(i.textContent=n||!t.length?S.links:`${S.links} (${t.length})`),n){e.innerHTML=`<div class="alert alert-danger">${u(h(n))}</div>`;return}if(!t.length){e.replaceChildren(b(`Ingen ventande forespørslar.`));return}let a=t.map(e=>e.id),o=t.map(e=>e.kobling_kasterid).filter(e=>e!==null),[{data:s},{data:c}]=await Promise.all([r(a),_(o)]),d=Object.fromEntries((s??[]).map(e=>[e.id,e.epost])),f=new Map((c??[]).map(e=>[e.id,e]));e.innerHTML=`<table class="table table-hover">
    <thead><tr><th>E-post</th><th>Vil koblast til</th><th>Handling</th></tr></thead>
    <tbody>
      ${t.map(e=>{let t=e.kobling_kasterid?f.get(e.kobling_kasterid):null,n=t?.klubb,r=t?`${u(t.fornavn)} ${u(t.etternavn)} (${u(n?.navn??``)})`:`—`;return`<tr data-id="${e.id}" data-thrower-id="${e.kobling_kasterid??``}">
          <td>${u(d[e.id]??e.id)}</td>
          <td>${r}</td>
          <td>
            <button class="btn btn-sm btn-success me-1 approve-button">Godkjenn</button>
            <button class="btn btn-sm btn-outline-danger reject-button">Avvis</button>
          </td>
        </tr>`}).join(``)}
    </tbody>
  </table>`,e.querySelectorAll(`.approve-button`).forEach(t=>{t.addEventListener(`click`,async()=>{let n=t.closest(`tr`),r=n.dataset.throwerId?Number(n.dataset.throwerId):null,{error:i}=await p(n.dataset.id,r,`godkjent`);if(i){e.innerHTML=`<div class="alert alert-danger">${u(h(i))}</div>`;return}E(e)})}),e.querySelectorAll(`.reject-button`).forEach(t=>{t.addEventListener(`click`,async()=>{let{error:n}=await p(t.closest(`tr`).dataset.id,null,`avvist`);if(n){e.innerHTML=`<div class="alert alert-danger">${u(h(n))}</div>`;return}E(e)})})}async function D(e){let{data:t}=await r(e);return Object.fromEntries((t??[]).map(e=>[e.id,e.epost]))}async function O(e){let{data:t,error:n}=await c();if(n){e.innerHTML=`<div class="alert alert-danger">${u(h(n))}</div>`;return}if(!t.length){e.replaceChildren(b(`Ingen brukarar.`));return}let r=t.map(e=>e.kobling_kasterid).filter(e=>e!==null),[i,{data:o}]=await Promise.all([D(t.map(e=>e.id)),_(r)]),s=new Map((o??[]).map(e=>[e.id,e])),l=[`bruker`,`klubbadmin`,`admin`].map(e=>`<option value="${e}">${e}</option>`).join(``);e.innerHTML=`
    <div id="user-error" class="alert alert-danger d-none"></div>
    <table class="table table-hover">
      <thead><tr><th>E-post</th><th>Rolle</th><th>Kobling</th><th></th></tr></thead>
      <tbody>
        ${t.map(e=>{let t=e.kobling_kasterid?s.get(e.kobling_kasterid):null,n=t?` <span class="text-muted small">(${u(v(t))})</span>`:``;return`<tr data-id="${e.id}">
          <td>${u(i[e.id]??e.id)}${n}</td>
          <td>
            <select id="role-select-${e.id}" class="form-select form-select-sm role-select sel-auto">
              ${l}
            </select>
          </td>
          <td><span class="badge bg-secondary">${u(e.kobling_status)}</span></td>
          <td><button class="btn btn-sm btn-primary save-role">Lagre</button></td>
        </tr>`}).join(``)}
      </tbody>
    </table>`,t.forEach(t=>{let n=e.querySelector(`tr[data-id="${t.id}"]`);n&&(n.querySelector(`.role-select`).value=t.rolle)}),e.querySelectorAll(`.save-role`).forEach(t=>{t.addEventListener(`click`,async()=>{let n=t.closest(`tr`),r=n.querySelector(`.role-select`).value,i=e.querySelector(`#user-error`);i.classList.add(`d-none`);let{error:o}=await a(n.dataset.id,r);o?(i.textContent=h(o),i.classList.remove(`d-none`)):(t.textContent=`✓`,setTimeout(()=>{t.textContent=`Lagre`},2e3))})})}async function k(n){let r,a,c;try{let e=await Promise.all([s(),g(),i()]);r=e[0].data,a=e[1].data,c=e[2].data}catch(t){e(`admin._renderClubAdmin`,t),n.innerHTML=`<div class="alert alert-danger">Kunne ikkje laste data.</div>`;return}if(!r.length){n.replaceChildren(b(`Ingen brukarar med rolle "klubbadmin".`));return}let l=await D(r.map(e=>e.id)),d={};c.forEach(e=>{(d[e.bruker_id]??=new Set).add(e.klubbid)});let f=a.map(e=>`<option value="${e.id}">${u(e.navn)}</option>`).join(``);n.innerHTML=`
    <div id="club-admin-error" class="alert alert-danger d-none"></div>
    ${r.map(e=>{let t=[...d[e.id]??[]].map(e=>{let t=a.find(t=>t.id===e);return t?`<span class="badge bg-primary me-1" data-club-id="${e}">${u(t.navn)} <button class="btn-close btn-close-white btn-close-xs remove-club"></button></span>`:``}).join(``);return`<div class="card mb-3" data-user="${e.id}">
        <div class="card-body">
          <h6 class="card-title mb-2">${u(l[e.id]??e.id)}</h6>
          <div class="club-admin-clubs mb-2">${t||`<span class="text-muted small">Ingen klubbar tildelt</span>`}</div>
          <div class="d-flex gap-2">
            <select id="add-club-select-${e.id}" class="form-select form-select-sm add-club-select sel-auto">
              <option value="">Legg til klubb…</option>
              ${f}
            </select>
            <button class="btn btn-sm btn-success add-club-button">Legg til</button>
          </div>
        </div>
      </div>`}).join(``)}`,n.querySelectorAll(`.add-club-button`).forEach(e=>{e.addEventListener(`click`,async()=>{let r=e.closest(`[data-user]`),i=r.querySelector(`.add-club-select`),a=Number(i.value);if(!a)return;let o=n.querySelector(`#club-admin-error`);o.classList.add(`d-none`);let{error:s}=await t(r.dataset.user,a);if(s){o.textContent=h(s),o.classList.remove(`d-none`);return}k(n)})}),n.querySelectorAll(`.remove-club`).forEach(e=>{e.addEventListener(`click`,async t=>{t.stopPropagation();let r=e.closest(`[data-club-id]`),i=e.closest(`[data-user]`),a=n.querySelector(`#club-admin-error`);a.classList.add(`d-none`);let{error:s}=await o(i.dataset.user,Number(r.dataset.clubId));if(s){a.textContent=h(s),a.classList.remove(`d-none`);return}k(n)})})}export{T as render};