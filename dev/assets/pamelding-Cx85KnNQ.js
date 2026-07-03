import{t as e}from"./logError-Bwe5P2rH.js";import{r as t}from"./authService-DGswF3hY.js";import{B as n,L as r,Q as i,S as a,Z as o,_ as s,et as c,f as l,h as u,it as d,mt as f,n as p,t as m,v as h}from"./index-BL9bjKeu.js";import{f as g,r as _}from"./kasterService-CqrAEXWz.js";import{t as v}from"./LoadingState-VoeU7wjv.js";function y(e,t,n,r,i,a){return e?!n&&!t?`<div class="alert alert-warning">
      Du må <a href="#/minside">koble kontoen din til ein utøvarprofil</a> for å melde deg på.
    </div>`:i?`<div class="alert alert-secondary">Dette stevnet er fullført. Påmelding er stengt.</div>`:n&&r?`
      <div class="alert alert-success d-flex justify-content-between align-items-center">
        <span>Du er påmeldt</span>
        <button id="unregister-button" class="btn btn-sm btn-outline-danger">Meld av</button>
      </div>`:n?`
      <form id="registration-form" class="card p-3 mb-3">
        <h5 class="mb-3">Meld deg på</h5>
        <div id="registration-error" class="alert alert-danger d-none"></div>
        <button type="submit" class="btn btn-primary">Meld på</button>
      </form>`:``:`<div class="alert alert-info">
      <a href="#/logginn?redirect=/stevne/${a}/pamelding">Logg inn</a> for å melde deg på.
    </div>`}function b(e,t,n,r){if(!e||t)return``;let i=new Set(n.map(e=>e.kasterid));return`
    <form id="admin-registration-form" class="card p-3 mb-3 border-warning">
      <h5 class="mb-3">Meld på klubbmedlem</h5>
      <div class="mb-3">
        <label class="form-label">Utøvar</label>
        <select class="form-select" name="admin_kasterid" required>
          <option value="">— vel utøvar —</option>${r.filter(e=>!i.has(e.id)).map(e=>`<option value="${e.id}">${o(e.etternavn)}, ${o(e.fornavn)} — ${o(e.klubb?.navn??``)}</option>`).join(``)}
        </select>
      </div>
      <div id="admin-registration-error" class="alert alert-danger d-none"></div>
      <button type="submit" class="btn btn-warning">Meld på</button>
    </form>`}function x(e){return e.length?`
    <div class="mt-4 mb-3">
      <h5>Stevner samme helg</h5>
      <ul class="list-unstyled">${e.map(e=>{let t=e.dato?c(e.dato):``;return`<li><a href="#/stevne/${e.id}/pamelding">${o(e.navn??``)} — ${t}</a></li>`}).join(``)}</ul>
    </div>`:``}function S(e){return e.length?`<table class="table table-sm"><tbody>${e.map(e=>{let t=e.sideA.kaster,n=e.sideB.kaster,r=e=>e?`<a href="#/kastere/${e.id}">${o(f(e))}</a>${e.klubb?.navn?`<br><small class="text-muted">${o(e.klubb.navn)}</small>`:``}`:`—`;return`<tr><td>${r(t)}</td><td>${r(n)}</td></tr>`}).join(``)}</tbody></table>`:`<p class="empty-state">Ingen par registrerte enno.</p>`}function C(e,t){if(!e.length)return`<p class="empty-state">Ingen påmeldingar enno.</p>`;let n=[...e].sort((e,t)=>{let n=e.kaster?.klubb?.navn??``,r=t.kaster?.klubb?.navn??``,i=n.localeCompare(r,`nb`);return i===0?(e.kaster?.etternavn??``).localeCompare(t.kaster?.etternavn??``,`nb`):i}).map(e=>`<tr>
    <td>${e.kaster?`<a href="#/kastere/${e.kaster.id}">${o(e.kaster.fornavn)} ${o(e.kaster.etternavn)}</a>`:`—`}</td>
    <td>${o(e.kaster?.klubb?.navn??``)}</td>
    ${t?`<td><button class="btn btn-sm btn-outline-danger remove-registration" data-id="${e.id}">Fjern</button></td>`:``}
  </tr>`).join(``);return`<table class="table table-sm">
    <thead><tr><th>Namn</th><th>Klubb</th>${t?`<th></th>`:``}</tr></thead>
    <tbody>${n}</tbody>
  </table>`}function w(e,t,n,r,i,o){e.querySelector(`#registration-form`)?.addEventListener(`submit`,async n=>{n.preventDefault();let a=e.querySelector(`#registration-error`);if(a.classList.add(`d-none`),r==null)return;let{error:c}=await s(o,r,i);if(c){a.textContent=`Feil ved påmelding.`,a.classList.remove(`d-none`);return}T(e,t)});let c=e.querySelector(`#admin-registration-form`);c?.addEventListener(`submit`,async n=>{n.preventDefault();let r=e.querySelector(`#admin-registration-error`);r.classList.add(`d-none`);let a=new FormData(c),l=Number(a.get(`admin_kasterid`));if(!l){r.textContent=`Vel ein utøvar.`,r.classList.remove(`d-none`);return}let{error:u}=await s(o,l,i);if(u){r.textContent=`Feil ved påmelding.`,r.classList.remove(`d-none`);return}T(e,t)}),e.querySelector(`#unregister-button`)?.addEventListener(`click`,async()=>{if(r==null)return;let i=n.find(e=>e.kasterid===r);if(!i||!await a({title:`Avmeld`,message:`Vil du melde deg av?`}))return;let{error:o}=await h(i.id);o||T(e,t)}),e.querySelectorAll(`.remove-registration`).forEach(n=>{n.addEventListener(`click`,async()=>{if(!await a({title:`Fjern påmelding`,message:`Fjern påmelding?`}))return;let r=Number(n.dataset.id);if(!r)return;let{error:i}=await h(r);i||T(e,t)})})}async function T(a,s={}){let f=s.id;if(!f){a.replaceChildren(i(`Manglande stevne-ID.`));return}let h=Number(f);m(()=>T(a,s)),a.replaceChildren(v(`Laster påmelding…`));try{let[e,f]=await Promise.all([t(),n(h)]);if(f.error||!f.data){a.replaceChildren(i(`Stevnet finst ikkje.`));return}let m=f.data;p(`Påmelding – ${m.navn}`);let v=e?.profil?.role===`admin`,T=e?.profil?.role===`klubbadmin`,E=v||T,D=(m.kategori?.navn??``).toLowerCase(),O=D.includes(`par`)||D.includes(`mix`),k=m.dato?{fromDate:new Date(new Date(m.dato+`T12:00:00`).getTime()-2*864e5).toISOString().slice(0,10),toDate:new Date(new Date(m.dato+`T12:00:00`).getTime()+2*864e5).toISOString().slice(0,10)}:null,A=E?v?_():e&&e.clubs.length?g(e.clubs):Promise.resolve({data:[],error:null}):Promise.resolve({data:[],error:null}),[j,M,N,P]=await Promise.all([u(h),m.klubbid!=null&&k?r(m.klubbid,k.fromDate,k.toDate,h):Promise.resolve({data:[],error:null}),A,O?l(h):Promise.resolve({data:[],error:null})]),F=j.data,I=M.data,L=N.data,R=P.data,z=e?.profil?.kasterid??null,B=e?.profil?.kobling_status===`godkjent`,V=z!=null&&F.some(e=>e.kasterid===z),H=[m.dato?c(m.dato):``,m.tid?d(m.tid):``,m.kategori?.navn?o(m.kategori.navn):``,m.sted?o(m.sted):``].filter(Boolean).join(` · `);a.innerHTML=`
      <div class="container py-4 pm-side">
        <h2 class="mb-1">${o(m.navn??``)}</h2>
        <p class="text-muted mb-4">${H}</p>
        ${y(e,E,B,V,m.erfullfort??!1,h)}
        ${b(E,m.erfullfort??!1,F,L)}
        ${x(I)}
        <h5 class="mt-4 mb-2">${O?`Par (${R.length})`:`Påmeldingar (${F.length})`}</h5>
        ${O?S(R):C(F,E)}
      </div>`,e&&w(a,s,F,z,e.user.id,h)}catch(t){e(`pamelding.render`,t),a.replaceChildren(i(`Kunne ikkje laste påmelding.`))}}export{T as render};