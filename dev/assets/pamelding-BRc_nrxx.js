import{t as e}from"./logError-DFCPgUum.js";import{r as t}from"./authService-3qblRciR.js";import{$ as n,C as r,Q as i,R as a,V as o,at as s,g as c,ht as l,n as u,p as d,r as f,tt as p,v as m,y as h}from"./index-CpxSVsbW.js";import{f as g,r as _}from"./kasterService-VZ0s6Z5J.js";import{t as v}from"./LoadingState-Ps7fTB_T.js";function y(e,t,n,r,i,a){return e?!n&&!t?`<div class="alert alert-warning">
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
    </div>`}function b(e,t,n,r){if(!e||t)return``;let a=new Set(n.map(e=>e.kasterid));return`
    <form id="admin-registration-form" class="card p-3 mb-3 border-warning">
      <h5 class="mb-3">Meld på klubbmedlem</h5>
      <div class="mb-3">
        <label class="form-label">Utøvar</label>
        <select class="form-select" name="admin_kasterid" required>
          <option value="">— vel utøvar —</option>${r.filter(e=>!a.has(e.id)).map(e=>`<option value="${e.id}">${i(e.etternavn)}, ${i(e.fornavn)} — ${i(e.klubb?.navn??``)}</option>`).join(``)}
        </select>
      </div>
      <div id="admin-registration-error" class="alert alert-danger d-none"></div>
      <button type="submit" class="btn btn-warning">Meld på</button>
    </form>`}function x(e){return e.length?`
    <div class="mt-4 mb-3">
      <h5>Stevner samme helg</h5>
      <ul class="list-unstyled">${e.map(e=>{let t=e.dato?p(e.dato):``;return`<li><a href="#/stevne/${e.id}/pamelding">${i(e.navn??``)} — ${t}</a></li>`}).join(``)}</ul>
    </div>`:``}function S(e){return e.length?`<table class="table table-sm"><tbody>${e.map(e=>{let t=e.sideA.kaster,n=e.sideB.kaster,r=e=>e?`<a href="#/kastere/${e.id}">${i(l(e))}</a>${e.klubb?.navn?`<br><small class="text-muted">${i(e.klubb.navn)}</small>`:``}`:`—`;return`<tr><td>${r(t)}</td><td>${r(n)}</td></tr>`}).join(``)}</tbody></table>`:`<p class="empty-state">Ingen par registrerte enno.</p>`}function C(e,t){if(!e.length)return`<p class="empty-state">Ingen påmeldingar enno.</p>`;let n=[...e].sort((e,t)=>{let n=e.kaster?.klubb?.navn??``,r=t.kaster?.klubb?.navn??``,i=n.localeCompare(r,`nb`);return i===0?(e.kaster?.etternavn??``).localeCompare(t.kaster?.etternavn??``,`nb`):i}).map(e=>`<tr>
    <td>${e.kaster?`<a href="#/kastere/${e.kaster.id}">${i(e.kaster.fornavn)} ${i(e.kaster.etternavn)}</a>`:`—`}</td>
    <td>${i(e.kaster?.klubb?.navn??``)}</td>
    ${t?`<td><button class="btn btn-sm btn-outline-danger remove-registration" data-id="${e.id}">Fjern</button></td>`:``}
  </tr>`).join(``);return`<table class="table table-sm">
    <thead><tr><th>Namn</th><th>Klubb</th>${t?`<th></th>`:``}</tr></thead>
    <tbody>${n}</tbody>
  </table>`}function w(e,t,n,i,a,o){e.querySelector(`#registration-form`)?.addEventListener(`submit`,async n=>{n.preventDefault();let r=e.querySelector(`#registration-error`);if(r.classList.add(`d-none`),i==null)return;let{error:s}=await m(o,i,a);if(s){r.textContent=`Feil ved påmelding.`,r.classList.remove(`d-none`);return}T(e,t)});let s=e.querySelector(`#admin-registration-form`);s?.addEventListener(`submit`,async n=>{n.preventDefault();let r=e.querySelector(`#admin-registration-error`);r.classList.add(`d-none`);let i=new FormData(s),c=Number(i.get(`admin_kasterid`));if(!c){r.textContent=`Vel ein utøvar.`,r.classList.remove(`d-none`);return}let{error:l}=await m(o,c,a);if(l){r.textContent=`Feil ved påmelding.`,r.classList.remove(`d-none`);return}T(e,t)}),e.querySelector(`#unregister-button`)?.addEventListener(`click`,async()=>{if(i==null)return;let a=n.find(e=>e.kasterid===i);if(!a||!await r({title:`Avmeld`,message:`Vil du melde deg av?`}))return;let{error:o}=await h(a.id);o||T(e,t)}),e.querySelectorAll(`.remove-registration`).forEach(n=>{n.addEventListener(`click`,async()=>{if(!await r({title:`Fjern påmelding`,message:`Fjern påmelding?`}))return;let i=Number(n.dataset.id);if(!i)return;let{error:a}=await h(i);a||T(e,t)})})}async function T(r,l={}){let m=l.id;if(!m){r.replaceChildren(n(`Manglande stevne-ID.`));return}let h=Number(m);u(()=>T(r,l)),r.replaceChildren(v(`Laster påmelding…`));try{let[e,u]=await Promise.all([t(),o(h)]);if(u.error||!u.data){r.replaceChildren(n(`Stevnet finst ikkje.`));return}let m=u.data;f(`Påmelding – ${m.navn}`);let v=e?.profil?.role===`admin`,T=e?.profil?.role===`klubbadmin`,E=v||T,D=(m.kategori?.navn??``).toLowerCase(),O=D.includes(`par`)||D.includes(`mix`),k=m.dato?{fromDate:new Date(new Date(m.dato+`T12:00:00`).getTime()-2*864e5).toISOString().slice(0,10),toDate:new Date(new Date(m.dato+`T12:00:00`).getTime()+2*864e5).toISOString().slice(0,10)}:null,A=E?v?_():e&&e.clubs.length?g(e.clubs):Promise.resolve({data:[],error:null}):Promise.resolve({data:[],error:null}),[j,M,N,P]=await Promise.all([c(h),m.klubbid!=null&&k?a(m.klubbid,k.fromDate,k.toDate,h):Promise.resolve({data:[],error:null}),A,O?d(h):Promise.resolve({data:[],error:null})]),F=j.data,I=M.data,L=N.data,R=P.data,z=e?.profil?.kasterid??null,B=e?.profil?.kobling_status===`godkjent`,V=z!=null&&F.some(e=>e.kasterid===z),H=[m.dato?p(m.dato):``,m.tid?s(m.tid):``,m.kategori?.navn?i(m.kategori.navn):``,m.sted?i(m.sted):``].filter(Boolean).join(` · `);r.innerHTML=`
      <div class="container py-4 pm-side">
        <h2 class="mb-1">${i(m.navn??``)}</h2>
        <p class="text-muted mb-4">${H}</p>
        ${y(e,E,B,V,m.erfullfort??!1,h)}
        ${b(E,m.erfullfort??!1,F,L)}
        ${x(I)}
        <h5 class="mt-4 mb-2">${O?`Par (${R.length})`:`Påmeldingar (${F.length})`}</h5>
        ${O?S(R):C(F,E)}
      </div>`,e&&w(r,l,F,z,e.user.id,h)}catch(t){e(`pamelding.render`,t),r.replaceChildren(n(`Kunne ikkje laste påmelding.`))}}export{T as render};