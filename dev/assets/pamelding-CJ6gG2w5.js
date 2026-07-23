import{t as e}from"./logError-D5z16FyH.js";import{At as t,Bt as n,C as r,Ct as i,D as a,Et as o,T as s,_ as c,b as l,ct as u,dt as d,m as f,r as p,t as m,w as h,wt as g,y as _}from"./index-CP0vkUTu.js";import{f as v,r as y}from"./kasterService-B3gLOC11.js";import{t as b}from"./LoadingState-BWi0wPLz.js";function x(e,t,n,r,i,a){return e?!n&&!t?`<div class="alert alert-warning">
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
    </div>`}function S(e,t,n,r){if(!e||t)return``;let a=new Set(n.map(e=>e.kasterid));return`
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
    </form>`}function C(e){return e.length?`
    <div class="mt-4 mb-3">
      <h5>Stevner samme helg</h5>
      <ul class="list-unstyled">${e.map(e=>{let t=e.dato?o(e.dato):``;return`<li><a href="#/stevne/${e.id}/pamelding">${i(e.navn??``)} — ${t}</a></li>`}).join(``)}</ul>
    </div>`:``}function w(e){return e.length?`<table class="table table-sm"><tbody>${e.map(e=>{let t=e.sideA.kaster,r=e.sideB.kaster,a=e=>e?`<a href="#/kastere/${e.id}">${i(n(e))}</a>${e.klubb?.navn?`<br><small class="text-muted">${i(e.klubb.navn)}</small>`:``}`:`—`;return`<tr><td>${a(t)}</td><td>${a(r)}</td></tr>`}).join(``)}</tbody></table>`:`<p class="empty-state">Ingen par registrerte enno.</p>`}function T(e,t){if(!e.length)return`<p class="empty-state">Ingen påmeldingar enno.</p>`;let n=[...e].sort((e,t)=>{let n=e.kaster?.klubb?.navn??``,r=t.kaster?.klubb?.navn??``,i=n.localeCompare(r,`nb`);return i===0?(e.kaster?.etternavn??``).localeCompare(t.kaster?.etternavn??``,`nb`):i}).map(e=>`<tr>
    <td>${e.kaster?`<a href="#/kastere/${e.kaster.id}">${i(e.kaster.fornavn)} ${i(e.kaster.etternavn)}</a>`:`—`}</td>
    <td>${i(e.kaster?.klubb?.navn??``)}</td>
    ${t?`<td><button class="btn btn-sm btn-outline-danger remove-registration" data-id="${e.id}">Fjern</button></td>`:``}
  </tr>`).join(``);return`<table class="table table-sm">
    <thead><tr><th>Namn</th><th>Klubb</th>${t?`<th></th>`:``}</tr></thead>
    <tbody>${n}</tbody>
  </table>`}function E(e,t,n,i,a){e.querySelector(`#registration-form`)?.addEventListener(`submit`,async n=>{n.preventDefault();let r=e.querySelector(`#registration-error`);if(r.classList.add(`d-none`),i==null)return;let{error:o}=await _(a,i);if(o){r.textContent=`Feil ved påmelding.`,r.classList.remove(`d-none`);return}D(e,t)});let o=e.querySelector(`#admin-registration-form`);o?.addEventListener(`submit`,async n=>{n.preventDefault();let r=e.querySelector(`#admin-registration-error`);r.classList.add(`d-none`);let i=new FormData(o),s=Number(i.get(`admin_kasterid`));if(!s){r.textContent=`Vel ein utøvar.`,r.classList.remove(`d-none`);return}let{error:c}=await _(a,s);if(c){r.textContent=`Feil ved påmelding.`,r.classList.remove(`d-none`);return}D(e,t)}),e.querySelector(`#unregister-button`)?.addEventListener(`click`,async()=>{if(i==null)return;let a=n.find(e=>e.kasterid===i);if(!a||!await s({title:`Avmeld`,message:`Vil du melde deg av?`}))return;let{error:o}=await l(a.id);if(o){h(`Kunne ikkje melde av: `+r(o),`error`);return}D(e,t)}),e.querySelectorAll(`.remove-registration`).forEach(n=>{n.addEventListener(`click`,async()=>{if(!await s({title:`Fjern påmelding`,message:`Fjern påmelding?`}))return;let i=Number(n.dataset.id);if(!i)return;let{error:a}=await l(i);if(a){h(`Kunne ikkje fjerne påmelding: `+r(a),`error`);return}D(e,t)})})}async function D(n,r={}){let s=r.id;if(!s){n.replaceChildren(g(`Manglande stevne-ID.`));return}let l=Number(s);m(()=>D(n,r)),n.replaceChildren(b(`Laster påmelding…`));try{let[e,s]=await Promise.all([a(),d(l)]);if(s.error||!s.data){n.replaceChildren(g(`Stevnet finst ikkje.`));return}let m=s.data;p(`Påmelding – ${m.navn}`);let h=e?.profil?.role===`admin`,_=e?.profil?.role===`klubbadmin`,b=h||_,D=(m.kategori?.navn??``).toLowerCase(),O=D.includes(`par`)||D.includes(`mix`),k=m.dato?{fromDate:new Date(new Date(m.dato+`T12:00:00`).getTime()-2*864e5).toISOString().slice(0,10),toDate:new Date(new Date(m.dato+`T12:00:00`).getTime()+2*864e5).toISOString().slice(0,10)}:null,A=b?h?y():e&&e.clubs.length?v(e.clubs):Promise.resolve({data:[],error:null}):Promise.resolve({data:[],error:null}),[j,M,N,P]=await Promise.all([c(l),m.klubbid!=null&&k?u(m.klubbid,k.fromDate,k.toDate,l):Promise.resolve({data:[],error:null}),A,O?f(l):Promise.resolve({data:[],error:null})]),F=j.data,I=M.data,L=N.data,R=P.data,z=e?.profil?.kasterid??null,B=e?.profil?.kobling_status===`godkjent`,V=z!=null&&F.some(e=>e.kasterid===z),H=[m.dato?o(m.dato):``,m.tid?t(m.tid):``,m.kategori?.navn?i(m.kategori.navn):``,m.sted?i(m.sted):``].filter(Boolean).join(` · `);n.innerHTML=`
      <div class="container py-4 pm-side">
        <h2 class="mb-1">${i(m.navn??``)}</h2>
        <p class="text-muted mb-4">${H}</p>
        ${x(e,b,B,V,m.erfullfort??!1,l)}
        ${S(b,m.erfullfort??!1,F,L)}
        ${C(I)}
        <h5 class="mt-4 mb-2">${O?`Par (${R.length})`:`Påmeldingar (${F.length})`}</h5>
        ${O?w(R):T(F,b)}
      </div>`,e&&E(n,r,F,z,l)}catch(t){e(`pamelding.render`,t),n.replaceChildren(g(`Kunne ikkje laste påmelding.`))}}export{D as render};