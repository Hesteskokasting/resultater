import{W as e,c as t,d as n,f as r,h as i,l as a,m as o,nt as s,p as c,s as l,u}from"./index-CJsfwfJB.js";import{t as d}from"./adminForms-D6fsqIQ7.js";import{r as f}from"./klubbService-p2P7_oWX.js";import{i as p}from"./kasterService-DSsUtuno.js";import{t as m}from"./LoadingState-RVZNML7E.js";import{t as h}from"./EmptyState-a5aDhc-8.js";var g=[`kobling`,`brukarar`,`klubbadmin`],_={kobling:`Koblingforespørslar`,brukarar:`Brukarar`,klubbadmin:`Klubbadmin-tilgang`};async function v(e){e.innerHTML=`
    <div class="container py-4 admin-skjema-xl">
      <h2 class="mb-3">Administrasjon</h2>
      <ul class="nav nav-tabs mb-4" id="admin-faner">
        ${g.map((e,t)=>`<li class="nav-item">
          <button class="nav-link${t===0?` active`:``}" data-fane="${e}">${_[e]}</button>
        </li>`).join(``)}
      </ul>
      <div id="admin-innhald"></div>
    </div>`;let t=e.querySelector(`#admin-innhald`);async function n(n){e.querySelectorAll(`[data-fane]`).forEach(e=>{e.classList.toggle(`active`,e.dataset.fane===n)}),m(`Laster...`),n===`kobling`&&await y(t),n===`brukarar`&&await b(t),n===`klubbadmin`&&await x(t)}e.querySelector(`#admin-faner`).addEventListener(`click`,e=>{let t=e.target.closest(`[data-fane]`);t?.dataset.fane&&n(t.dataset.fane)}),n(`kobling`)}async function y(t){let{data:n,error:o}=await r();if(o){t.innerHTML=`<div class="alert alert-danger">${e(d(o))}</div>`;return}if(!n.length){t.replaceChildren(h(`Ingen ventande forespørslar.`));return}let s=n.map(e=>e.id),c=n.map(e=>e.kobling_kasterid).filter(e=>e!==null),[{data:l},{data:u}]=await Promise.all([a(s),p(c)]),f=Object.fromEntries((l??[]).map(e=>[e.id,e.epost])),m=new Map((u??[]).map(e=>[e.id,e]));t.innerHTML=`<table class="table table-hover">
    <thead><tr><th>E-post</th><th>Vil koblast til</th><th>Handling</th></tr></thead>
    <tbody>
      ${n.map(t=>{let n=t.kobling_kasterid?m.get(t.kobling_kasterid):null,r=n?.klubb,i=n?`${e(n.fornavn)} ${e(n.etternavn)} (${e(r?.navn??``)})`:`—`;return`<tr data-id="${t.id}" data-kasterid="${t.kobling_kasterid??``}">
          <td>${e(f[t.id]??t.id)}</td>
          <td>${i}</td>
          <td>
            <button class="btn btn-sm btn-success me-1 godkjenn-knapp">Godkjenn</button>
            <button class="btn btn-sm btn-outline-danger avvis-knapp">Avvis</button>
          </td>
        </tr>`}).join(``)}
    </tbody>
  </table>`,t.querySelectorAll(`.godkjenn-knapp`).forEach(n=>{n.addEventListener(`click`,async()=>{let r=n.closest(`tr`),a=r.dataset.kasterid?Number(r.dataset.kasterid):null,{error:o}=await i(r.dataset.id,a,`godkjent`);if(o){t.innerHTML=`<div class="alert alert-danger">${e(d(o))}</div>`;return}y(t)})}),t.querySelectorAll(`.avvis-knapp`).forEach(n=>{n.addEventListener(`click`,async()=>{let{error:r}=await i(n.closest(`tr`).dataset.id,null,`avvist`);if(r){t.innerHTML=`<div class="alert alert-danger">${e(d(r))}</div>`;return}y(t)})})}async function b(n){let{data:r,error:i}=await t();if(i){n.innerHTML=`<div class="alert alert-danger">${e(d(i))}</div>`;return}if(!r.length){n.replaceChildren(h(`Ingen brukarar.`));return}let{data:s}=await a(r.map(e=>e.id)),c=Object.fromEntries((s??[]).map(e=>[e.id,e.epost])),l=[`bruker`,`klubbadmin`,`admin`].map(e=>`<option value="${e}">${e}</option>`).join(``);n.innerHTML=`
    <div id="brukar-feil" class="alert alert-danger d-none"></div>
    <table class="table table-hover">
      <thead><tr><th>E-post</th><th>Rolle</th><th>Kobling</th><th></th></tr></thead>
      <tbody>
        ${r.map(t=>`<tr data-id="${t.id}">
          <td>${e(c[t.id]??t.id)}</td>
          <td>
            <select class="form-select form-select-sm rolle-vel sel-auto">
              ${l}
            </select>
          </td>
          <td><span class="badge bg-secondary">${e(t.kobling_status)}</span></td>
          <td><button class="btn btn-sm btn-primary lagre-rolle">Lagre</button></td>
        </tr>`).join(``)}
      </tbody>
    </table>`,r.forEach(e=>{let t=n.querySelector(`tr[data-id="${e.id}"]`);t&&(t.querySelector(`.rolle-vel`).value=e.rolle)}),n.querySelectorAll(`.lagre-rolle`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=e.closest(`tr`),r=t.querySelector(`.rolle-vel`).value,i=n.querySelector(`#brukar-feil`);i.classList.add(`d-none`);let{error:a}=await o(t.dataset.id,r);a?(i.textContent=d(a),i.classList.remove(`d-none`)):(e.textContent=`✓`,setTimeout(()=>{e.textContent=`Lagre`},2e3))})})}async function x(t){let r,i,o;try{let e=await Promise.all([u(),f(),n()]);r=e[0].data,i=e[1].data,o=e[2].data}catch(e){s(`admin._visKlubbadmin`,e),t.innerHTML=`<div class="alert alert-danger">Kunne ikkje laste data.</div>`;return}if(!r.length){t.replaceChildren(h(`Ingen brukarar med rolle "klubbadmin".`));return}let{data:p}=await a(r.map(e=>e.id)),m=Object.fromEntries((p??[]).map(e=>[e.id,e.epost])),g={};o.forEach(e=>{g[e.bruker_id]||(g[e.bruker_id]=new Set),g[e.bruker_id].add(e.klubbid)});let _=i.map(t=>`<option value="${t.id}">${e(t.navn)}</option>`).join(``);t.innerHTML=`
    <div id="ka-feil" class="alert alert-danger d-none"></div>
    ${r.map(t=>{let n=[...g[t.id]??[]].map(t=>{let n=i.find(e=>e.id===t);return n?`<span class="badge bg-primary me-1" data-kid="${t}">${e(n.navn)} <button class="btn-close btn-close-white btn-close-xs fjern-klubb"></button></span>`:``}).join(``);return`<div class="card mb-3" data-bruker="${t.id}">
        <div class="card-body">
          <h6 class="card-title mb-2">${e(m[t.id]??t.id)}</h6>
          <div class="ka-klubbar mb-2">${n||`<span class="text-muted small">Ingen klubbar tildelt</span>`}</div>
          <div class="d-flex gap-2">
            <select class="form-select form-select-sm legg-til-vel sel-auto">
              <option value="">Legg til klubb…</option>
              ${_}
            </select>
            <button class="btn btn-sm btn-success legg-til-knapp">Legg til</button>
          </div>
        </div>
      </div>`}).join(``)}`,t.querySelectorAll(`.legg-til-knapp`).forEach(e=>{e.addEventListener(`click`,async()=>{let n=e.closest(`[data-bruker]`),r=n.querySelector(`.legg-til-vel`),i=Number(r.value);if(!i)return;let a=t.querySelector(`#ka-feil`);a.classList.add(`d-none`);let{error:o}=await c(n.dataset.bruker,i);if(o){a.textContent=d(o),a.classList.remove(`d-none`);return}x(t)})}),t.querySelectorAll(`.fjern-klubb`).forEach(e=>{e.addEventListener(`click`,async n=>{n.stopPropagation();let r=e.closest(`[data-kid]`),i=e.closest(`[data-bruker]`),a=t.querySelector(`#ka-feil`);a.classList.add(`d-none`);let{error:o}=await l(i.dataset.bruker,Number(r.dataset.kid));if(o){a.textContent=d(o),a.classList.remove(`d-none`);return}x(t)})})}export{v as render};