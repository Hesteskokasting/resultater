import{t as e}from"./logError-D5z16FyH.js";import{B as t,G as n,H as r,L as i,R as a,St as o,U as s,V as c,W as l,at as u,t as d,xt as f,z as p,zt as m}from"./index-BckkKJXl.js";import{t as h}from"./adminForms-DCvJWIUd.js";import{r as g}from"./klubbService-CaXvOdL5.js";import{d as _}from"./kasterService-B3gLOC11.js";import{t as v}from"./LoadingState-BWi0wPLz.js";import{t as y}from"./EmptyState-B1E_7OzB.js";var b=[`links`,`users`,`club-admin`],x={links:`Koblingforespørslar`,users:`Brukarar`,"club-admin":`Klubbadmin-tilgang`};function S(e){let t=e.stevne_fase===`avsluttende`?`avsluttende`:`innledende`;return`
    <a class="live-card" href="#/stevne/${e.id}/${t}">
      ${f()}
      <span>${o(e.navn)}</span>
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
    </div>`;let t=e.querySelector(`#admin-content`),n=`links`;async function r(r){n=r,e.querySelectorAll(`[data-tab]`).forEach(e=>{e.classList.toggle(`active`,e.dataset.tab===r)}),v(`Laster...`),r===`links`&&await w(t),r===`users`&&await E(t),r===`club-admin`&&await D(t)}d(()=>r(n)),e.querySelector(`#admin-tabs`).addEventListener(`click`,e=>{let t=e.target.closest(`[data-tab]`);t?.dataset.tab&&r(t.dataset.tab)});let[,{data:i}]=await Promise.all([r(`links`),u()]),a=(i??[]).filter(e=>!e.erfullfort);a.length&&(e.querySelector(`#live-section`).innerHTML=`<div class="live-banner">${a.map(S).join(``)}</div>`)}async function w(e){let{data:t,error:n}=await c(),i=e.closest(`.content-page`)?.querySelector(`[data-tab="links"]`);if(i&&(i.textContent=n||!t.length?x.links:`${x.links} (${t.length})`),n){e.innerHTML=`<div class="alert alert-danger">${o(h(n))}</div>`;return}if(!t.length){e.replaceChildren(y(`Ingen ventande forespørslar.`));return}let a=t.map(e=>e.id),s=t.map(e=>e.kobling_kasterid).filter(e=>e!==null),[{data:u},{data:d}]=await Promise.all([r(a),_(s)]),f=Object.fromEntries((u??[]).map(e=>[e.id,e.epost])),p=new Map((d??[]).map(e=>[e.id,e]));e.innerHTML=`<table class="table table-hover">
    <thead><tr><th>E-post</th><th>Vil koblast til</th><th>Handling</th></tr></thead>
    <tbody>
      ${t.map(e=>{let t=e.kobling_kasterid?p.get(e.kobling_kasterid):null,n=t?.klubb,r=t?`${o(t.fornavn)} ${o(t.etternavn)} (${o(n?.navn??``)})`:`—`;return`<tr data-id="${e.id}" data-thrower-id="${e.kobling_kasterid??``}">
          <td>${o(f[e.id]??e.id)}</td>
          <td>${r}</td>
          <td>
            <button class="btn btn-sm btn-success me-1 approve-button">Godkjenn</button>
            <button class="btn btn-sm btn-outline-danger reject-button">Avvis</button>
          </td>
        </tr>`}).join(``)}
    </tbody>
  </table>`,e.querySelectorAll(`.approve-button`).forEach(t=>{t.addEventListener(`click`,async()=>{let n=t.closest(`tr`),r=n.dataset.throwerId?Number(n.dataset.throwerId):null,{error:i}=await l(n.dataset.id,r,`godkjent`);if(i){e.innerHTML=`<div class="alert alert-danger">${o(h(i))}</div>`;return}w(e)})}),e.querySelectorAll(`.reject-button`).forEach(t=>{t.addEventListener(`click`,async()=>{let{error:n}=await l(t.closest(`tr`).dataset.id,null,`avvist`);if(n){e.innerHTML=`<div class="alert alert-danger">${o(h(n))}</div>`;return}w(e)})})}async function T(e){let{data:t}=await r(e);return Object.fromEntries((t??[]).map(e=>[e.id,e.epost]))}async function E(e){let{data:t,error:r}=await a();if(r){e.innerHTML=`<div class="alert alert-danger">${o(h(r))}</div>`;return}if(!t.length){e.replaceChildren(y(`Ingen brukarar.`));return}let i=t.map(e=>e.kobling_kasterid).filter(e=>e!==null),[s,{data:c}]=await Promise.all([T(t.map(e=>e.id)),_(i)]),l=new Map((c??[]).map(e=>[e.id,e])),u=[`bruker`,`klubbadmin`,`admin`].map(e=>`<option value="${e}">${e}</option>`).join(``);e.innerHTML=`
    <div id="user-error" class="alert alert-danger d-none"></div>
    <table class="table table-hover">
      <thead><tr><th>E-post</th><th>Rolle</th><th>Kobling</th><th></th></tr></thead>
      <tbody>
        ${t.map(e=>{let t=e.kobling_kasterid?l.get(e.kobling_kasterid):null,n=t?` <span class="text-muted small">(${o(m(t))})</span>`:``;return`<tr data-id="${e.id}">
          <td>${o(s[e.id]??e.id)}${n}</td>
          <td>
            <select id="role-select-${e.id}" class="form-select form-select-sm role-select sel-auto">
              ${u}
            </select>
          </td>
          <td><span class="badge bg-secondary">${o(e.kobling_status)}</span></td>
          <td><button class="btn btn-sm btn-primary save-role">Lagre</button></td>
        </tr>`}).join(``)}
      </tbody>
    </table>`,t.forEach(t=>{let n=e.querySelector(`tr[data-id="${t.id}"]`);n&&(n.querySelector(`.role-select`).value=t.rolle)}),e.querySelectorAll(`.save-role`).forEach(t=>{t.addEventListener(`click`,async()=>{let r=t.closest(`tr`),i=r.querySelector(`.role-select`).value,a=e.querySelector(`#user-error`);a.classList.add(`d-none`);let{error:o}=await n(r.dataset.id,i);o?(a.textContent=h(o),a.classList.remove(`d-none`)):(t.textContent=`✓`,setTimeout(()=>{t.textContent=`Lagre`},2e3))})})}async function D(n){let r,a,c;try{let e=await Promise.all([t(),g(),p()]);r=e[0].data,a=e[1].data,c=e[2].data}catch(t){e(`admin._renderClubAdmin`,t),n.innerHTML=`<div class="alert alert-danger">Kunne ikkje laste data.</div>`;return}if(!r.length){n.replaceChildren(y(`Ingen brukarar med rolle "klubbadmin".`));return}let l=await T(r.map(e=>e.id)),u={};c.forEach(e=>{(u[e.bruker_id]??=new Set).add(e.klubbid)});let d=a.map(e=>`<option value="${e.id}">${o(e.navn)}</option>`).join(``);n.innerHTML=`
    <div id="club-admin-error" class="alert alert-danger d-none"></div>
    ${r.map(e=>{let t=[...u[e.id]??[]].map(e=>{let t=a.find(t=>t.id===e);return t?`<span class="badge bg-primary me-1" data-club-id="${e}">${o(t.navn)} <button class="btn-close btn-close-white btn-close-xs remove-club"></button></span>`:``}).join(``);return`<div class="card mb-3" data-user="${e.id}">
        <div class="card-body">
          <h6 class="card-title mb-2">${o(l[e.id]??e.id)}</h6>
          <div class="club-admin-clubs mb-2">${t||`<span class="text-muted small">Ingen klubbar tildelt</span>`}</div>
          <div class="d-flex gap-2">
            <select id="add-club-select-${e.id}" class="form-select form-select-sm add-club-select sel-auto">
              <option value="">Legg til klubb…</option>
              ${d}
            </select>
            <button class="btn btn-sm btn-success add-club-button">Legg til</button>
          </div>
        </div>
      </div>`}).join(``)}`,n.querySelectorAll(`.add-club-button`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=e.closest(`[data-user]`),r=t.querySelector(`.add-club-select`),a=Number(r.value);if(!a)return;let o=n.querySelector(`#club-admin-error`);o.classList.add(`d-none`);let{error:s}=await i(t.dataset.user,a);if(s){o.textContent=h(s),o.classList.remove(`d-none`);return}D(n)})}),n.querySelectorAll(`.remove-club`).forEach(e=>{e.addEventListener(`click`,async t=>{t.stopPropagation();let r=e.closest(`[data-club-id]`),i=e.closest(`[data-user]`),a=n.querySelector(`#club-admin-error`);a.classList.add(`d-none`);let{error:o}=await s(i.dataset.user,Number(r.dataset.clubId));if(o){a.textContent=h(o),a.classList.remove(`d-none`);return}D(n)})})}export{C as render};