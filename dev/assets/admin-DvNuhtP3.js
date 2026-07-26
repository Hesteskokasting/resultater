import{t as e}from"./logError-D5z16FyH.js";import{B as t,Ct as n,G as r,H as i,K as a,U as o,V as s,Vt as c,W as l,q as u,st as d,t as f,wt as p,z as m}from"./index-DVHt6_kn.js";import{t as h}from"./adminForms-Ca2wo1ti.js";import{r as g}from"./klubbService-CaXvOdL5.js";import{d as _}from"./kasterService-B3gLOC11.js";import{t as v}from"./LoadingState-BWi0wPLz.js";import{t as y}from"./EmptyState-B1E_7OzB.js";var b=[`links`,`users`,`club-admin`],x={links:`Koblingforespørslar`,users:`Brukarar`,"club-admin":`Klubbadmin-tilgang`};function S(e){let t=e.stevne_fase===`avsluttende`?`avsluttende`:`innledende`;return`
    <a class="live-card" href="#/stevne/${e.id}/${t}">
      ${n()}
      <span>${p(e.navn)}</span>
    </a>`}async function C(e){e.innerHTML=`
    <div class="content-page">
      <div id="live-section"></div>
      <h2 class="mb-3">Administrasjon</h2>
      <ul class="nav nav-tabs mb-4" id="admin-tabs">
        ${b.map((e,t)=>`<li class="nav-item">
          <button class="nav-link${t===0?` active`:``}" data-tab="${e}">${x[e]}</button>
        </li>`).join(``)}
      </ul>
      <div id="admin-content"></div>
    </div>`;let t=e.querySelector(`#admin-content`),n=`links`;async function r(r){n=r,e.querySelectorAll(`[data-tab]`).forEach(e=>{e.classList.toggle(`active`,e.dataset.tab===r)}),v(`Laster...`),r===`links`&&await w(t),r===`users`&&await E(t),r===`club-admin`&&await D(t)}f(()=>r(n)),e.querySelector(`#admin-tabs`).addEventListener(`click`,e=>{let t=e.target.closest(`[data-tab]`);t?.dataset.tab&&r(t.dataset.tab)});let[,{data:i}]=await Promise.all([r(`links`),d()]),a=(i??[]).filter(e=>!e.erfullfort);a.length&&(e.querySelector(`#live-section`).innerHTML=`<div class="live-banner">${a.map(S).join(``)}</div>`)}async function w(e){let{data:t,error:n}=await o(),r=e.closest(`.content-page`)?.querySelector(`[data-tab="links"]`);if(r&&(r.textContent=n||!t.length?x.links:`${x.links} (${t.length})`),n){e.innerHTML=`<div class="alert alert-danger">${p(h(n))}</div>`;return}if(!t.length){e.replaceChildren(y(`Ingen ventande forespørslar.`));return}let i=t.map(e=>e.id),s=t.map(e=>e.kobling_kasterid).filter(e=>e!==null),[{data:c},{data:u}]=await Promise.all([l(i),_(s)]),d=Object.fromEntries((c??[]).map(e=>[e.id,e.epost])),f=new Map((u??[]).map(e=>[e.id,e]));e.innerHTML=`<table class="table table-hover">
    <thead><tr><th>E-post</th><th>Vil koblast til</th><th>Handling</th></tr></thead>
    <tbody>
      ${t.map(e=>{let t=e.kobling_kasterid?f.get(e.kobling_kasterid):null,n=t?.klubb,r=t?`${p(t.fornavn)} ${p(t.etternavn)} (${p(n?.navn??``)})`:`—`;return`<tr data-id="${e.id}" data-thrower-id="${e.kobling_kasterid??``}">
          <td>${p(d[e.id]??e.id)}</td>
          <td>${r}</td>
          <td>
            <button class="btn btn-sm btn-success me-1 approve-button">Godkjenn</button>
            <button class="btn btn-sm btn-outline-danger reject-button">Avvis</button>
          </td>
        </tr>`}).join(``)}
    </tbody>
  </table>`,e.querySelectorAll(`.approve-button`).forEach(t=>{t.addEventListener(`click`,async()=>{let n=t.closest(`tr`),r=n.dataset.throwerId?Number(n.dataset.throwerId):null,{error:i}=await a(n.dataset.id,r,`godkjent`);if(i){e.innerHTML=`<div class="alert alert-danger">${p(h(i))}</div>`;return}w(e)})}),e.querySelectorAll(`.reject-button`).forEach(t=>{t.addEventListener(`click`,async()=>{let{error:n}=await a(t.closest(`tr`).dataset.id,null,`avvist`);if(n){e.innerHTML=`<div class="alert alert-danger">${p(h(n))}</div>`;return}w(e)})})}async function T(e){let{data:t}=await l(e);return Object.fromEntries((t??[]).map(e=>[e.id,e.epost]))}async function E(e){let{data:n,error:r}=await t();if(r){e.innerHTML=`<div class="alert alert-danger">${p(h(r))}</div>`;return}if(!n.length){e.replaceChildren(y(`Ingen brukarar.`));return}let i=n.map(e=>e.kobling_kasterid).filter(e=>e!==null),[a,{data:o}]=await Promise.all([T(n.map(e=>e.id)),_(i)]),s=new Map((o??[]).map(e=>[e.id,e])),l=[`bruker`,`klubbadmin`,`admin`].map(e=>`<option value="${e}">${e}</option>`).join(``);e.innerHTML=`
    <div id="user-error" class="alert alert-danger d-none"></div>
    <table class="table table-hover">
      <thead><tr><th>E-post</th><th>Rolle</th><th>Kobling</th><th></th></tr></thead>
      <tbody>
        ${n.map(e=>{let t=e.kobling_kasterid?s.get(e.kobling_kasterid):null,n=t?` <span class="text-muted small">(${p(c(t))})</span>`:``;return`<tr data-id="${e.id}">
          <td>${p(a[e.id]??e.id)}${n}</td>
          <td>
            <select id="role-select-${e.id}" class="form-select form-select-sm role-select sel-auto">
              ${l}
            </select>
          </td>
          <td><span class="badge bg-secondary">${p(e.kobling_status)}</span></td>
          <td><button class="btn btn-sm btn-primary save-role">Lagre</button></td>
        </tr>`}).join(``)}
      </tbody>
    </table>`,n.forEach(t=>{let n=e.querySelector(`tr[data-id="${t.id}"]`);n&&(n.querySelector(`.role-select`).value=t.rolle)}),e.querySelectorAll(`.save-role`).forEach(t=>{t.addEventListener(`click`,async()=>{let n=t.closest(`tr`),r=n.querySelector(`.role-select`).value,i=e.querySelector(`#user-error`);i.classList.add(`d-none`);let{error:a}=await u(n.dataset.id,r);a?(i.textContent=h(a),i.classList.remove(`d-none`)):(t.textContent=`✓`,setTimeout(()=>{t.textContent=`Lagre`},2e3))})})}async function D(t){let n,a,o;try{let e=await Promise.all([i(),g(),s()]);n=e[0].data,a=e[1].data,o=e[2].data}catch(n){e(`admin._renderClubAdmin`,n),t.innerHTML=`<div class="alert alert-danger">Kunne ikkje laste data.</div>`;return}if(!n.length){t.replaceChildren(y(`Ingen brukarar med rolle "klubbadmin".`));return}let c=await T(n.map(e=>e.id)),l={};o.forEach(e=>{(l[e.bruker_id]??=new Set).add(e.klubbid)});let u=a.map(e=>`<option value="${e.id}">${p(e.navn)}</option>`).join(``);t.innerHTML=`
    <div id="club-admin-error" class="alert alert-danger d-none"></div>
    ${n.map(e=>{let t=[...l[e.id]??[]].map(e=>{let t=a.find(t=>t.id===e);return t?`<span class="badge bg-primary me-1" data-club-id="${e}">${p(t.navn)} <button class="btn-close btn-close-white btn-close-xs remove-club"></button></span>`:``}).join(``);return`<div class="card mb-3" data-user="${e.id}">
        <div class="card-body">
          <h6 class="card-title mb-2">${p(c[e.id]??e.id)}</h6>
          <div class="club-admin-clubs mb-2">${t||`<span class="text-muted small">Ingen klubbar tildelt</span>`}</div>
          <div class="d-flex gap-2">
            <select id="add-club-select-${e.id}" class="form-select form-select-sm add-club-select sel-auto">
              <option value="">Legg til klubb…</option>
              ${u}
            </select>
            <button class="btn btn-sm btn-success add-club-button">Legg til</button>
          </div>
        </div>
      </div>`}).join(``)}`,t.querySelectorAll(`.add-club-button`).forEach(e=>{e.addEventListener(`click`,async()=>{let n=e.closest(`[data-user]`),r=n.querySelector(`.add-club-select`),i=Number(r.value);if(!i)return;let a=t.querySelector(`#club-admin-error`);a.classList.add(`d-none`);let{error:o}=await m(n.dataset.user,i);if(o){a.textContent=h(o),a.classList.remove(`d-none`);return}D(t)})}),t.querySelectorAll(`.remove-club`).forEach(e=>{e.addEventListener(`click`,async n=>{n.stopPropagation();let i=e.closest(`[data-club-id]`),a=e.closest(`[data-user]`),o=t.querySelector(`#club-admin-error`);o.classList.add(`d-none`);let{error:s}=await r(a.dataset.user,Number(i.dataset.clubId));if(s){o.textContent=h(s),o.classList.remove(`d-none`);return}D(t)})})}export{C as render};