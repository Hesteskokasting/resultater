import{t as e}from"./logError-DhxY2JQv.js";import{c as t,i as n,l as r,n as i,o as a,r as o,s,t as c,u as l}from"./adminService-DXjXtHN0.js";import{A as u,J as d,q as f}from"./index-pllV3QU0.js";import{t as p}from"./adminForms-D4qtFNU6.js";import{r as m}from"./klubbService-avZCVzgk.js";import{i as h}from"./kasterService-D1rq1bik.js";import{t as g}from"./LoadingState-xRmJ3K_t.js";import{t as _}from"./EmptyState-BvE_0HiD.js";var v=[`kobling`,`brukarar`,`klubbadmin`],y={kobling:`Koblingforespørslar`,brukarar:`Brukarar`,klubbadmin:`Klubbadmin-tilgang`};function b(e){let t=e.stevne_fase===`avsluttende`?`avsluttende`:`innledende`;return`
    <a class="live-kort" href="#/stevne/${e.id}/${t}">
      ${f()}
      <span>${d(e.navn)}</span>
    </a>`}async function x(e){e.innerHTML=`
    <div class="content-page">
      <div id="live-seksjon"></div>
      <h2 class="mb-3">Administrasjon</h2>
      <ul class="nav nav-tabs mb-4" id="admin-faner">
        ${v.map((e,t)=>`<li class="nav-item">
          <button class="nav-link${t===0?` active`:``}" data-fane="${e}">${y[e]}</button>
        </li>`).join(``)}
      </ul>
      <div id="admin-innhald"></div>
    </div>`;let t=e.querySelector(`#admin-innhald`);async function n(n){e.querySelectorAll(`[data-fane]`).forEach(e=>{e.classList.toggle(`active`,e.dataset.fane===n)}),g(`Laster...`),n===`kobling`&&await S(t),n===`brukarar`&&await w(t),n===`klubbadmin`&&await T(t)}e.querySelector(`#admin-faner`).addEventListener(`click`,e=>{let t=e.target.closest(`[data-fane]`);t?.dataset.fane&&n(t.dataset.fane)});let[,{data:r}]=await Promise.all([n(`kobling`),u()]),i=(r??[]).filter(e=>!e.erfullfort);i.length&&(e.querySelector(`#live-seksjon`).innerHTML=`<div class="live-banner">${i.map(b).join(``)}</div>`)}async function S(e){let{data:t,error:n}=await s();if(n){e.innerHTML=`<div class="alert alert-danger">${d(p(n))}</div>`;return}if(!t.length){e.replaceChildren(_(`Ingen ventande forespørslar.`));return}let r=t.map(e=>e.id),i=t.map(e=>e.kobling_kasterid).filter(e=>e!==null),[{data:a},{data:c}]=await Promise.all([o(r),h(i)]),u=Object.fromEntries((a??[]).map(e=>[e.id,e.epost])),f=new Map((c??[]).map(e=>[e.id,e]));e.innerHTML=`<table class="table table-hover">
    <thead><tr><th>E-post</th><th>Vil koblast til</th><th>Handling</th></tr></thead>
    <tbody>
      ${t.map(e=>{let t=e.kobling_kasterid?f.get(e.kobling_kasterid):null,n=t?.klubb,r=t?`${d(t.fornavn)} ${d(t.etternavn)} (${d(n?.navn??``)})`:`—`;return`<tr data-id="${e.id}" data-kasterid="${e.kobling_kasterid??``}">
          <td>${d(u[e.id]??e.id)}</td>
          <td>${r}</td>
          <td>
            <button class="btn btn-sm btn-success me-1 godkjenn-knapp">Godkjenn</button>
            <button class="btn btn-sm btn-outline-danger avvis-knapp">Avvis</button>
          </td>
        </tr>`}).join(``)}
    </tbody>
  </table>`,e.querySelectorAll(`.godkjenn-knapp`).forEach(t=>{t.addEventListener(`click`,async()=>{let n=t.closest(`tr`),r=n.dataset.kasterid?Number(n.dataset.kasterid):null,{error:i}=await l(n.dataset.id,r,`godkjent`);if(i){e.innerHTML=`<div class="alert alert-danger">${d(p(i))}</div>`;return}S(e)})}),e.querySelectorAll(`.avvis-knapp`).forEach(t=>{t.addEventListener(`click`,async()=>{let{error:n}=await l(t.closest(`tr`).dataset.id,null,`avvist`);if(n){e.innerHTML=`<div class="alert alert-danger">${d(p(n))}</div>`;return}S(e)})})}async function C(e){let{data:t}=await o(e);return Object.fromEntries((t??[]).map(e=>[e.id,e.epost]))}async function w(e){let{data:t,error:n}=await i();if(n){e.innerHTML=`<div class="alert alert-danger">${d(p(n))}</div>`;return}if(!t.length){e.replaceChildren(_(`Ingen brukarar.`));return}let a=await C(t.map(e=>e.id)),o=[`bruker`,`klubbadmin`,`admin`].map(e=>`<option value="${e}">${e}</option>`).join(``);e.innerHTML=`
    <div id="brukar-feil" class="alert alert-danger d-none"></div>
    <table class="table table-hover">
      <thead><tr><th>E-post</th><th>Rolle</th><th>Kobling</th><th></th></tr></thead>
      <tbody>
        ${t.map(e=>`<tr data-id="${e.id}">
          <td>${d(a[e.id]??e.id)}</td>
          <td>
            <select class="form-select form-select-sm rolle-vel sel-auto">
              ${o}
            </select>
          </td>
          <td><span class="badge bg-secondary">${d(e.kobling_status)}</span></td>
          <td><button class="btn btn-sm btn-primary lagre-rolle">Lagre</button></td>
        </tr>`).join(``)}
      </tbody>
    </table>`,t.forEach(t=>{let n=e.querySelector(`tr[data-id="${t.id}"]`);n&&(n.querySelector(`.rolle-vel`).value=t.rolle)}),e.querySelectorAll(`.lagre-rolle`).forEach(t=>{t.addEventListener(`click`,async()=>{let n=t.closest(`tr`),i=n.querySelector(`.rolle-vel`).value,a=e.querySelector(`#brukar-feil`);a.classList.add(`d-none`);let{error:o}=await r(n.dataset.id,i);o?(a.textContent=p(o),a.classList.remove(`d-none`)):(t.textContent=`✓`,setTimeout(()=>{t.textContent=`Lagre`},2e3))})})}async function T(r){let i,o,s;try{let e=await Promise.all([n(),m(),a()]);i=e[0].data,o=e[1].data,s=e[2].data}catch(t){e(`admin._visKlubbadmin`,t),r.innerHTML=`<div class="alert alert-danger">Kunne ikkje laste data.</div>`;return}if(!i.length){r.replaceChildren(_(`Ingen brukarar med rolle "klubbadmin".`));return}let l=await C(i.map(e=>e.id)),u={};s.forEach(e=>{(u[e.bruker_id]??=new Set).add(e.klubbid)});let f=o.map(e=>`<option value="${e.id}">${d(e.navn)}</option>`).join(``);r.innerHTML=`
    <div id="ka-feil" class="alert alert-danger d-none"></div>
    ${i.map(e=>{let t=[...u[e.id]??[]].map(e=>{let t=o.find(t=>t.id===e);return t?`<span class="badge bg-primary me-1" data-kid="${e}">${d(t.navn)} <button class="btn-close btn-close-white btn-close-xs fjern-klubb"></button></span>`:``}).join(``);return`<div class="card mb-3" data-bruker="${e.id}">
        <div class="card-body">
          <h6 class="card-title mb-2">${d(l[e.id]??e.id)}</h6>
          <div class="ka-klubbar mb-2">${t||`<span class="text-muted small">Ingen klubbar tildelt</span>`}</div>
          <div class="d-flex gap-2">
            <select class="form-select form-select-sm legg-til-vel sel-auto">
              <option value="">Legg til klubb…</option>
              ${f}
            </select>
            <button class="btn btn-sm btn-success legg-til-knapp">Legg til</button>
          </div>
        </div>
      </div>`}).join(``)}`,r.querySelectorAll(`.legg-til-knapp`).forEach(e=>{e.addEventListener(`click`,async()=>{let n=e.closest(`[data-bruker]`),i=n.querySelector(`.legg-til-vel`),a=Number(i.value);if(!a)return;let o=r.querySelector(`#ka-feil`);o.classList.add(`d-none`);let{error:s}=await t(n.dataset.bruker,a);if(s){o.textContent=p(s),o.classList.remove(`d-none`);return}T(r)})}),r.querySelectorAll(`.fjern-klubb`).forEach(e=>{e.addEventListener(`click`,async t=>{t.stopPropagation();let n=e.closest(`[data-kid]`),i=e.closest(`[data-bruker]`),a=r.querySelector(`#ka-feil`);a.classList.add(`d-none`);let{error:o}=await c(i.dataset.bruker,Number(n.dataset.kid));if(o){a.textContent=p(o),a.classList.remove(`d-none`);return}T(r)})})}export{x as render};