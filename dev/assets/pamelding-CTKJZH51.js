import{t as e}from"./logError-D5z16FyH.js";import{C as t,Ct as n,E as r,S as i,St as a,Tt as o,g as s,kt as c,p as l,r as u,st as d,t as f,ut as p,v as m,w as h,y as g,zt as _}from"./index-BckkKJXl.js";import{f as v,r as y}from"./kasterService-B3gLOC11.js";import{t as b}from"./LoadingState-BWi0wPLz.js";function x(e,t,n,r,i,a){return e?!n&&!t?`<div class="alert alert-warning">
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
    </div>`}function S(e,t,n,r){if(!e||t)return``;let i=new Set(n.map(e=>e.kasterid));return`
    <form id="admin-registration-form" class="card p-3 mb-3 border-warning">
      <h5 class="mb-3">Meld på klubbmedlem</h5>
      <div class="mb-3">
        <label class="form-label">Utøvar</label>
        <select class="form-select" name="admin_kasterid" required>
          <option value="">— vel utøvar —</option>${r.filter(e=>!i.has(e.id)).map(e=>`<option value="${e.id}">${a(e.etternavn)}, ${a(e.fornavn)} — ${a(e.klubb?.navn??``)}</option>`).join(``)}
        </select>
      </div>
      <div id="admin-registration-error" class="alert alert-danger d-none"></div>
      <button type="submit" class="btn btn-warning">Meld på</button>
    </form>`}function C(e){return e.length?`
    <div class="mt-4 mb-3">
      <h5>Stevner samme helg</h5>
      <ul class="list-unstyled">${e.map(e=>{let t=e.dato?o(e.dato):``;return`<li><a href="#/stevne/${e.id}/pamelding">${a(e.navn??``)} — ${t}</a></li>`}).join(``)}</ul>
    </div>`:``}function w(e){return e.length?`<table class="table table-sm"><tbody>${e.map(e=>{let t=e.sideA.kaster,n=e.sideB.kaster,r=e=>e?`<a href="#/kastere/${e.id}">${a(_(e))}</a>${e.klubb?.navn?`<br><small class="text-muted">${a(e.klubb.navn)}</small>`:``}`:`—`;return`<tr><td>${r(t)}</td><td>${r(n)}</td></tr>`}).join(``)}</tbody></table>`:`<p class="empty-state">Ingen par registrerte enno.</p>`}function T(e,t){if(!e.length)return`<p class="empty-state">Ingen påmeldingar enno.</p>`;let n=[...e].sort((e,t)=>{let n=e.kaster?.klubb?.navn??``,r=t.kaster?.klubb?.navn??``,i=n.localeCompare(r,`nb`);return i===0?(e.kaster?.etternavn??``).localeCompare(t.kaster?.etternavn??``,`nb`):i}).map(e=>`<tr>
    <td>${e.kaster?`<a href="#/kastere/${e.kaster.id}">${a(e.kaster.fornavn)} ${a(e.kaster.etternavn)}</a>`:`—`}</td>
    <td>${a(e.kaster?.klubb?.navn??``)}</td>
    ${t?`<td><button class="btn btn-sm btn-outline-danger remove-registration" data-id="${e.id}">Fjern</button></td>`:``}
  </tr>`).join(``);return`<table class="table table-sm">
    <thead><tr><th>Namn</th><th>Klubb</th>${t?`<th></th>`:``}</tr></thead>
    <tbody>${n}</tbody>
  </table>`}function E(e,n,r,a,o){e.querySelector(`#registration-form`)?.addEventListener(`submit`,async t=>{t.preventDefault();let r=e.querySelector(`#registration-error`);if(r.classList.add(`d-none`),a==null)return;let{error:i}=await m(o,a);if(i){r.textContent=`Feil ved påmelding.`,r.classList.remove(`d-none`);return}D(e,n)});let s=e.querySelector(`#admin-registration-form`);s?.addEventListener(`submit`,async t=>{t.preventDefault();let r=e.querySelector(`#admin-registration-error`);r.classList.add(`d-none`);let i=new FormData(s),a=Number(i.get(`admin_kasterid`));if(!a){r.textContent=`Vel ein utøvar.`,r.classList.remove(`d-none`);return}let{error:c}=await m(o,a);if(c){r.textContent=`Feil ved påmelding.`,r.classList.remove(`d-none`);return}D(e,n)}),e.querySelector(`#unregister-button`)?.addEventListener(`click`,async()=>{if(a==null)return;let o=r.find(e=>e.kasterid===a);if(!o||!await h({title:`Avmeld`,message:`Vil du melde deg av?`}))return;let{error:s}=await g(o.id);if(s){t(`Kunne ikkje melde av: `+i(s),`error`);return}D(e,n)}),e.querySelectorAll(`.remove-registration`).forEach(r=>{r.addEventListener(`click`,async()=>{if(!await h({title:`Fjern påmelding`,message:`Fjern påmelding?`}))return;let a=Number(r.dataset.id);if(!a)return;let{error:o}=await g(a);if(o){t(`Kunne ikkje fjerne påmelding: `+i(o),`error`);return}D(e,n)})})}async function D(t,i={}){let m=i.id;if(!m){t.replaceChildren(n(`Manglande stevne-ID.`));return}let h=Number(m);f(()=>D(t,i)),t.replaceChildren(b(`Laster påmelding…`));try{let[e,f]=await Promise.all([r(),p(h)]);if(f.error||!f.data){t.replaceChildren(n(`Stevnet finst ikkje.`));return}let m=f.data;u(`Påmelding – ${m.navn}`);let g=e?.profil?.role===`admin`,_=e?.profil?.role===`klubbadmin`,b=g||_,D=(m.kategori?.navn??``).toLowerCase(),O=D.includes(`par`)||D.includes(`mix`),k=m.dato?{fromDate:new Date(new Date(m.dato+`T12:00:00`).getTime()-2*864e5).toISOString().slice(0,10),toDate:new Date(new Date(m.dato+`T12:00:00`).getTime()+2*864e5).toISOString().slice(0,10)}:null,A=b?g?y():e&&e.clubs.length?v(e.clubs):Promise.resolve({data:[],error:null}):Promise.resolve({data:[],error:null}),[j,M,N,P]=await Promise.all([s(h),m.klubbid!=null&&k?d(m.klubbid,k.fromDate,k.toDate,h):Promise.resolve({data:[],error:null}),A,O?l(h):Promise.resolve({data:[],error:null})]),F=j.data,I=M.data,L=N.data,R=P.data,z=e?.profil?.kasterid??null,B=e?.profil?.kobling_status===`godkjent`,V=z!=null&&F.some(e=>e.kasterid===z),H=[m.dato?o(m.dato):``,m.tid?c(m.tid):``,m.kategori?.navn?a(m.kategori.navn):``,m.sted?a(m.sted):``].filter(Boolean).join(` · `);t.innerHTML=`
      <div class="container py-4 pm-side">
        <h2 class="mb-1">${a(m.navn??``)}</h2>
        <p class="text-muted mb-4">${H}</p>
        ${x(e,b,B,V,m.erfullfort??!1,h)}
        ${S(b,m.erfullfort??!1,F,L)}
        ${C(I)}
        <h5 class="mt-4 mb-2">${O?`Par (${R.length})`:`Påmeldingar (${F.length})`}</h5>
        ${O?w(R):T(F,b)}
      </div>`,e&&E(t,i,F,z,h)}catch(r){e(`pamelding.render`,r),t.replaceChildren(n(`Kunne ikkje laste påmelding.`))}}export{D as render};