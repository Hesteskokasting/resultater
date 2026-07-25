import{t as e}from"./logError-D5z16FyH.js";import{B as t,Bt as n,Ct as r,G as i,H as a,K as o,R as s,St as c,U as l,V as u,W as d,ot as f,t as p,z as m}from"./index-BErz4npm.js";import{t as h}from"./adminForms-CrGhydBW.js";import{r as g}from"./klubbService-CaXvOdL5.js";import{d as _}from"./kasterService-B3gLOC11.js";import{t as v}from"./LoadingState-BWi0wPLz.js";import{t as y}from"./EmptyState-B1E_7OzB.js";var b=[`links`,`users`,`club-admin`],x={links:`Koblingforespørslar`,users:`Brukarar`,"club-admin":`Klubbadmin-tilgang`};function S(e){let t=e.stevne_fase===`avsluttende`?`avsluttende`:`innledende`;return`
    <a class="live-card" href="#/stevne/${e.id}/${t}">
      ${c()}
      <span>${r(e.navn)}</span>
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
    </div>`;let t=e.querySelector(`#admin-content`),n=`links`;async function r(r){n=r,e.querySelectorAll(`[data-tab]`).forEach(e=>{e.classList.toggle(`active`,e.dataset.tab===r)}),v(`Laster...`),r===`links`&&await w(t),r===`users`&&await E(t),r===`club-admin`&&await D(t)}p(()=>r(n)),e.querySelector(`#admin-tabs`).addEventListener(`click`,e=>{let t=e.target.closest(`[data-tab]`);t?.dataset.tab&&r(t.dataset.tab)});let[,{data:i}]=await Promise.all([r(`links`),f()]),a=(i??[]).filter(e=>!e.erfullfort);a.length&&(e.querySelector(`#live-section`).innerHTML=`<div class="live-banner">${a.map(S).join(``)}</div>`)}async function w(e){let{data:t,error:n}=await a(),o=e.closest(`.content-page`)?.querySelector(`[data-tab="links"]`);if(o&&(o.textContent=n||!t.length?x.links:`${x.links} (${t.length})`),n){e.innerHTML=`<div class="alert alert-danger">${r(h(n))}</div>`;return}if(!t.length){e.replaceChildren(y(`Ingen ventande forespørslar.`));return}let s=t.map(e=>e.id),c=t.map(e=>e.kobling_kasterid).filter(e=>e!==null),[{data:u},{data:d}]=await Promise.all([l(s),_(c)]),f=Object.fromEntries((u??[]).map(e=>[e.id,e.epost])),p=new Map((d??[]).map(e=>[e.id,e]));e.innerHTML=`<table class="table table-hover">
    <thead><tr><th>E-post</th><th>Vil koblast til</th><th>Handling</th></tr></thead>
    <tbody>
      ${t.map(e=>{let t=e.kobling_kasterid?p.get(e.kobling_kasterid):null,n=t?.klubb,i=t?`${r(t.fornavn)} ${r(t.etternavn)} (${r(n?.navn??``)})`:`—`;return`<tr data-id="${e.id}" data-thrower-id="${e.kobling_kasterid??``}">
          <td>${r(f[e.id]??e.id)}</td>
          <td>${i}</td>
          <td>
            <button class="btn btn-sm btn-success me-1 approve-button">Godkjenn</button>
            <button class="btn btn-sm btn-outline-danger reject-button">Avvis</button>
          </td>
        </tr>`}).join(``)}
    </tbody>
  </table>`,e.querySelectorAll(`.approve-button`).forEach(t=>{t.addEventListener(`click`,async()=>{let n=t.closest(`tr`),a=n.dataset.throwerId?Number(n.dataset.throwerId):null,{error:o}=await i(n.dataset.id,a,`godkjent`);if(o){e.innerHTML=`<div class="alert alert-danger">${r(h(o))}</div>`;return}w(e)})}),e.querySelectorAll(`.reject-button`).forEach(t=>{t.addEventListener(`click`,async()=>{let{error:n}=await i(t.closest(`tr`).dataset.id,null,`avvist`);if(n){e.innerHTML=`<div class="alert alert-danger">${r(h(n))}</div>`;return}w(e)})})}async function T(e){let{data:t}=await l(e);return Object.fromEntries((t??[]).map(e=>[e.id,e.epost]))}async function E(e){let{data:t,error:i}=await m();if(i){e.innerHTML=`<div class="alert alert-danger">${r(h(i))}</div>`;return}if(!t.length){e.replaceChildren(y(`Ingen brukarar.`));return}let a=t.map(e=>e.kobling_kasterid).filter(e=>e!==null),[s,{data:c}]=await Promise.all([T(t.map(e=>e.id)),_(a)]),l=new Map((c??[]).map(e=>[e.id,e])),u=[`bruker`,`klubbadmin`,`admin`].map(e=>`<option value="${e}">${e}</option>`).join(``);e.innerHTML=`
    <div id="user-error" class="alert alert-danger d-none"></div>
    <table class="table table-hover">
      <thead><tr><th>E-post</th><th>Rolle</th><th>Kobling</th><th></th></tr></thead>
      <tbody>
        ${t.map(e=>{let t=e.kobling_kasterid?l.get(e.kobling_kasterid):null,i=t?` <span class="text-muted small">(${r(n(t))})</span>`:``;return`<tr data-id="${e.id}">
          <td>${r(s[e.id]??e.id)}${i}</td>
          <td>
            <select id="role-select-${e.id}" class="form-select form-select-sm role-select sel-auto">
              ${u}
            </select>
          </td>
          <td><span class="badge bg-secondary">${r(e.kobling_status)}</span></td>
          <td><button class="btn btn-sm btn-primary save-role">Lagre</button></td>
        </tr>`}).join(``)}
      </tbody>
    </table>`,t.forEach(t=>{let n=e.querySelector(`tr[data-id="${t.id}"]`);n&&(n.querySelector(`.role-select`).value=t.rolle)}),e.querySelectorAll(`.save-role`).forEach(t=>{t.addEventListener(`click`,async()=>{let n=t.closest(`tr`),r=n.querySelector(`.role-select`).value,i=e.querySelector(`#user-error`);i.classList.add(`d-none`);let{error:a}=await o(n.dataset.id,r);a?(i.textContent=h(a),i.classList.remove(`d-none`)):(t.textContent=`✓`,setTimeout(()=>{t.textContent=`Lagre`},2e3))})})}async function D(n){let i,a,o;try{let e=await Promise.all([u(),g(),t()]);i=e[0].data,a=e[1].data,o=e[2].data}catch(t){e(`admin._renderClubAdmin`,t),n.innerHTML=`<div class="alert alert-danger">Kunne ikkje laste data.</div>`;return}if(!i.length){n.replaceChildren(y(`Ingen brukarar med rolle "klubbadmin".`));return}let c=await T(i.map(e=>e.id)),l={};o.forEach(e=>{(l[e.bruker_id]??=new Set).add(e.klubbid)});let f=a.map(e=>`<option value="${e.id}">${r(e.navn)}</option>`).join(``);n.innerHTML=`
    <div id="club-admin-error" class="alert alert-danger d-none"></div>
    ${i.map(e=>{let t=[...l[e.id]??[]].map(e=>{let t=a.find(t=>t.id===e);return t?`<span class="badge bg-primary me-1" data-club-id="${e}">${r(t.navn)} <button class="btn-close btn-close-white btn-close-xs remove-club"></button></span>`:``}).join(``);return`<div class="card mb-3" data-user="${e.id}">
        <div class="card-body">
          <h6 class="card-title mb-2">${r(c[e.id]??e.id)}</h6>
          <div class="club-admin-clubs mb-2">${t||`<span class="text-muted small">Ingen klubbar tildelt</span>`}</div>
          <div class="d-flex gap-2">
            <select id="add-club-select-${e.id}" class="form-select form-select-sm add-club-select sel-auto">
              <option value="">Legg til klubb…</option>
              ${f}
            </select>
            <button class="btn btn-sm btn-success add-club-button">Legg til</button>
          </div>
        </div>
      </div>`}).join(``)}`,n.querySelectorAll(`.add-club-button`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=e.closest(`[data-user]`),r=t.querySelector(`.add-club-select`),i=Number(r.value);if(!i)return;let a=n.querySelector(`#club-admin-error`);a.classList.add(`d-none`);let{error:o}=await s(t.dataset.user,i);if(o){a.textContent=h(o),a.classList.remove(`d-none`);return}D(n)})}),n.querySelectorAll(`.remove-club`).forEach(e=>{e.addEventListener(`click`,async t=>{t.stopPropagation();let r=e.closest(`[data-club-id]`),i=e.closest(`[data-user]`),a=n.querySelector(`#club-admin-error`);a.classList.add(`d-none`);let{error:o}=await d(i.dataset.user,Number(r.dataset.clubId));if(o){a.textContent=h(o),a.classList.remove(`d-none`);return}D(n)})})}export{C as render};