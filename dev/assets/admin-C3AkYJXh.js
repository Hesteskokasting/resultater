import{t as e}from"./logError-Bwe5P2rH.js";import{a as t,c as n,l as r,n as i,o as a,r as o,s,t as c,u as l}from"./adminService-CHD26Nvt.js";import{F as u,X as d,Z as f,mt as p,t as m}from"./index-CZ8oTelb.js";import{t as h}from"./adminForms-0_jvBVJd.js";import{r as g}from"./klubbService-C-nMARLH.js";import{d as _}from"./kasterService-CqrAEXWz.js";import{t as v}from"./LoadingState-VoeU7wjv.js";import{t as y}from"./EmptyState-D9n6SQus.js";var b=[`links`,`users`,`club-admin`],x={links:`Koblingforespørslar`,users:`Brukarar`,"club-admin":`Klubbadmin-tilgang`};function S(e){let t=e.stevne_fase===`avsluttende`?`avsluttende`:`innledende`;return`
    <a class="live-card" href="#/stevne/${e.id}/${t}">
      ${d()}
      <span>${f(e.navn)}</span>
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
    </div>`;let t=e.querySelector(`#admin-content`),n=`links`;async function r(r){n=r,e.querySelectorAll(`[data-tab]`).forEach(e=>{e.classList.toggle(`active`,e.dataset.tab===r)}),v(`Laster...`),r===`links`&&await w(t),r===`users`&&await E(t),r===`club-admin`&&await D(t)}m(()=>r(n)),e.querySelector(`#admin-tabs`).addEventListener(`click`,e=>{let t=e.target.closest(`[data-tab]`);t?.dataset.tab&&r(t.dataset.tab)});let[,{data:i}]=await Promise.all([r(`links`),u()]),a=(i??[]).filter(e=>!e.erfullfort);a.length&&(e.querySelector(`#live-section`).innerHTML=`<div class="live-banner">${a.map(S).join(``)}</div>`)}async function w(e){let{data:t,error:n}=await a(),i=e.closest(`.content-page`)?.querySelector(`[data-tab="links"]`);if(i&&(i.textContent=n||!t.length?x.links:`${x.links} (${t.length})`),n){e.innerHTML=`<div class="alert alert-danger">${f(h(n))}</div>`;return}if(!t.length){e.replaceChildren(y(`Ingen ventande forespørslar.`));return}let o=t.map(e=>e.id),c=t.map(e=>e.kobling_kasterid).filter(e=>e!==null),[{data:l},{data:u}]=await Promise.all([s(o),_(c)]),d=Object.fromEntries((l??[]).map(e=>[e.id,e.epost])),p=new Map((u??[]).map(e=>[e.id,e]));e.innerHTML=`<table class="table table-hover">
    <thead><tr><th>E-post</th><th>Vil koblast til</th><th>Handling</th></tr></thead>
    <tbody>
      ${t.map(e=>{let t=e.kobling_kasterid?p.get(e.kobling_kasterid):null,n=t?.klubb,r=t?`${f(t.fornavn)} ${f(t.etternavn)} (${f(n?.navn??``)})`:`—`;return`<tr data-id="${e.id}" data-thrower-id="${e.kobling_kasterid??``}">
          <td>${f(d[e.id]??e.id)}</td>
          <td>${r}</td>
          <td>
            <button class="btn btn-sm btn-success me-1 approve-button">Godkjenn</button>
            <button class="btn btn-sm btn-outline-danger reject-button">Avvis</button>
          </td>
        </tr>`}).join(``)}
    </tbody>
  </table>`,e.querySelectorAll(`.approve-button`).forEach(t=>{t.addEventListener(`click`,async()=>{let n=t.closest(`tr`),i=n.dataset.throwerId?Number(n.dataset.throwerId):null,{error:a}=await r(n.dataset.id,i,`godkjent`);if(a){e.innerHTML=`<div class="alert alert-danger">${f(h(a))}</div>`;return}w(e)})}),e.querySelectorAll(`.reject-button`).forEach(t=>{t.addEventListener(`click`,async()=>{let{error:n}=await r(t.closest(`tr`).dataset.id,null,`avvist`);if(n){e.innerHTML=`<div class="alert alert-danger">${f(h(n))}</div>`;return}w(e)})})}async function T(e){let{data:t}=await s(e);return Object.fromEntries((t??[]).map(e=>[e.id,e.epost]))}async function E(e){let{data:t,error:n}=await i();if(n){e.innerHTML=`<div class="alert alert-danger">${f(h(n))}</div>`;return}if(!t.length){e.replaceChildren(y(`Ingen brukarar.`));return}let r=t.map(e=>e.kobling_kasterid).filter(e=>e!==null),[a,{data:o}]=await Promise.all([T(t.map(e=>e.id)),_(r)]),s=new Map((o??[]).map(e=>[e.id,e])),c=[`bruker`,`klubbadmin`,`admin`].map(e=>`<option value="${e}">${e}</option>`).join(``);e.innerHTML=`
    <div id="user-error" class="alert alert-danger d-none"></div>
    <table class="table table-hover">
      <thead><tr><th>E-post</th><th>Rolle</th><th>Kobling</th><th></th></tr></thead>
      <tbody>
        ${t.map(e=>{let t=e.kobling_kasterid?s.get(e.kobling_kasterid):null,n=t?` <span class="text-muted small">(${f(p(t))})</span>`:``;return`<tr data-id="${e.id}">
          <td>${f(a[e.id]??e.id)}${n}</td>
          <td>
            <select id="role-select-${e.id}" class="form-select form-select-sm role-select sel-auto">
              ${c}
            </select>
          </td>
          <td><span class="badge bg-secondary">${f(e.kobling_status)}</span></td>
          <td><button class="btn btn-sm btn-primary save-role">Lagre</button></td>
        </tr>`}).join(``)}
      </tbody>
    </table>`,t.forEach(t=>{let n=e.querySelector(`tr[data-id="${t.id}"]`);n&&(n.querySelector(`.role-select`).value=t.rolle)}),e.querySelectorAll(`.save-role`).forEach(t=>{t.addEventListener(`click`,async()=>{let n=t.closest(`tr`),r=n.querySelector(`.role-select`).value,i=e.querySelector(`#user-error`);i.classList.add(`d-none`);let{error:a}=await l(n.dataset.id,r);a?(i.textContent=h(a),i.classList.remove(`d-none`)):(t.textContent=`✓`,setTimeout(()=>{t.textContent=`Lagre`},2e3))})})}async function D(r){let i,a,s;try{let e=await Promise.all([t(),g(),o()]);i=e[0].data,a=e[1].data,s=e[2].data}catch(t){e(`admin._renderClubAdmin`,t),r.innerHTML=`<div class="alert alert-danger">Kunne ikkje laste data.</div>`;return}if(!i.length){r.replaceChildren(y(`Ingen brukarar med rolle "klubbadmin".`));return}let l=await T(i.map(e=>e.id)),u={};s.forEach(e=>{(u[e.bruker_id]??=new Set).add(e.klubbid)});let d=a.map(e=>`<option value="${e.id}">${f(e.navn)}</option>`).join(``);r.innerHTML=`
    <div id="club-admin-error" class="alert alert-danger d-none"></div>
    ${i.map(e=>{let t=[...u[e.id]??[]].map(e=>{let t=a.find(t=>t.id===e);return t?`<span class="badge bg-primary me-1" data-club-id="${e}">${f(t.navn)} <button class="btn-close btn-close-white btn-close-xs remove-club"></button></span>`:``}).join(``);return`<div class="card mb-3" data-user="${e.id}">
        <div class="card-body">
          <h6 class="card-title mb-2">${f(l[e.id]??e.id)}</h6>
          <div class="club-admin-clubs mb-2">${t||`<span class="text-muted small">Ingen klubbar tildelt</span>`}</div>
          <div class="d-flex gap-2">
            <select id="add-club-select-${e.id}" class="form-select form-select-sm add-club-select sel-auto">
              <option value="">Legg til klubb…</option>
              ${d}
            </select>
            <button class="btn btn-sm btn-success add-club-button">Legg til</button>
          </div>
        </div>
      </div>`}).join(``)}`,r.querySelectorAll(`.add-club-button`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=e.closest(`[data-user]`),n=t.querySelector(`.add-club-select`),i=Number(n.value);if(!i)return;let a=r.querySelector(`#club-admin-error`);a.classList.add(`d-none`);let{error:o}=await c(t.dataset.user,i);if(o){a.textContent=h(o),a.classList.remove(`d-none`);return}D(r)})}),r.querySelectorAll(`.remove-club`).forEach(e=>{e.addEventListener(`click`,async t=>{t.stopPropagation();let i=e.closest(`[data-club-id]`),a=e.closest(`[data-user]`),o=r.querySelector(`#club-admin-error`);o.classList.add(`d-none`);let{error:s}=await n(a.dataset.user,Number(i.dataset.clubId));if(s){o.textContent=h(s),o.classList.remove(`d-none`);return}D(r)})})}export{C as render};