import{t as e}from"./logError-D5z16FyH.js";import{Dt as t,E as n,O as r,T as i,Tt as a,Vt as o,b as s,ft as c,h as l,jt as u,lt as d,r as f,t as p,v as m,w as h,wt as g,x as _}from"./index-DVHt6_kn.js";import{f as v,r as y}from"./kasterService-B3gLOC11.js";import{t as b}from"./LoadingState-BWi0wPLz.js";function x(e,t,n,r,i,a){return e?!n&&!t?`<div class="alert alert-warning">
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
          <option value="">— vel utøvar —</option>${r.filter(e=>!i.has(e.id)).map(e=>`<option value="${e.id}">${g(e.etternavn)}, ${g(e.fornavn)} — ${g(e.klubb?.navn??``)}</option>`).join(``)}
        </select>
      </div>
      <div id="admin-registration-error" class="alert alert-danger d-none"></div>
      <button type="submit" class="btn btn-warning">Meld på</button>
    </form>`}function C(e){return e.length?`
    <div class="mt-4 mb-3">
      <h5>Stevner samme helg</h5>
      <ul class="list-unstyled">${e.map(e=>{let n=e.dato?t(e.dato):``;return`<li><a href="#/stevne/${e.id}/pamelding">${g(e.navn??``)} — ${n}</a></li>`}).join(``)}</ul>
    </div>`:``}function w(e){return e.length?`<table class="table table-sm"><tbody>${e.map(e=>{let t=e.sideA.kaster,n=e.sideB.kaster,r=e=>e?`<a href="#/kastere/${e.id}">${g(o(e))}</a>${e.klubb?.navn?`<br><small class="text-muted">${g(e.klubb.navn)}</small>`:``}`:`—`;return`<tr><td>${r(t)}</td><td>${r(n)}</td></tr>`}).join(``)}</tbody></table>`:`<p class="empty-state">Ingen par registrerte enno.</p>`}function T(e,t){if(!e.length)return`<p class="empty-state">Ingen påmeldingar enno.</p>`;let n=[...e].sort((e,t)=>{let n=e.kaster?.klubb?.navn??``,r=t.kaster?.klubb?.navn??``,i=n.localeCompare(r,`nb`);return i===0?(e.kaster?.etternavn??``).localeCompare(t.kaster?.etternavn??``,`nb`):i}).map(e=>`<tr>
    <td>${e.kaster?`<a href="#/kastere/${e.kaster.id}">${g(e.kaster.fornavn)} ${g(e.kaster.etternavn)}</a>`:`—`}</td>
    <td>${g(e.kaster?.klubb?.navn??``)}</td>
    ${t?`<td><button class="btn btn-sm btn-outline-danger remove-registration" data-id="${e.id}">Fjern</button></td>`:``}
  </tr>`).join(``);return`<table class="table table-sm">
    <thead><tr><th>Namn</th><th>Klubb</th>${t?`<th></th>`:``}</tr></thead>
    <tbody>${n}</tbody>
  </table>`}function E(e,t,r,a,o){e.querySelector(`#registration-form`)?.addEventListener(`submit`,async n=>{n.preventDefault();let r=e.querySelector(`#registration-error`);if(r.classList.add(`d-none`),a==null)return;let{error:i}=await s(o,a);if(i){r.textContent=`Feil ved påmelding.`,r.classList.remove(`d-none`);return}D(e,t)});let c=e.querySelector(`#admin-registration-form`);c?.addEventListener(`submit`,async n=>{n.preventDefault();let r=e.querySelector(`#admin-registration-error`);r.classList.add(`d-none`);let i=new FormData(c),a=Number(i.get(`admin_kasterid`));if(!a){r.textContent=`Vel ein utøvar.`,r.classList.remove(`d-none`);return}let{error:l}=await s(o,a);if(l){r.textContent=`Feil ved påmelding.`,r.classList.remove(`d-none`);return}D(e,t)}),e.querySelector(`#unregister-button`)?.addEventListener(`click`,async()=>{if(a==null)return;let o=r.find(e=>e.kasterid===a);if(!o||!await n({title:`Avmeld`,message:`Vil du melde deg av?`}))return;let{error:s}=await _(o.id);if(s){i(`Kunne ikkje melde av: `+h(s),`error`);return}D(e,t)}),e.querySelectorAll(`.remove-registration`).forEach(r=>{r.addEventListener(`click`,async()=>{if(!await n({title:`Fjern påmelding`,message:`Fjern påmelding?`}))return;let a=Number(r.dataset.id);if(!a)return;let{error:o}=await _(a);if(o){i(`Kunne ikkje fjerne påmelding: `+h(o),`error`);return}D(e,t)})})}async function D(n,i={}){let o=i.id;if(!o){n.replaceChildren(a(`Manglande stevne-ID.`));return}let s=Number(o);p(()=>D(n,i)),n.replaceChildren(b(`Laster påmelding…`));try{let[e,o]=await Promise.all([r(),c(s)]);if(o.error||!o.data){n.replaceChildren(a(`Stevnet finst ikkje.`));return}let p=o.data;f(`Påmelding – ${p.navn}`);let h=e?.profil?.role===`admin`,_=e?.profil?.role===`klubbadmin`,b=h||_,D=(p.kategori?.navn??``).toLowerCase(),O=D.includes(`par`)||D.includes(`mix`),k=p.dato?{fromDate:new Date(new Date(p.dato+`T12:00:00`).getTime()-2*864e5).toISOString().slice(0,10),toDate:new Date(new Date(p.dato+`T12:00:00`).getTime()+2*864e5).toISOString().slice(0,10)}:null,A=b?h?y():e&&e.clubs.length?v(e.clubs):Promise.resolve({data:[],error:null}):Promise.resolve({data:[],error:null}),[j,M,N,P]=await Promise.all([m(s),p.klubbid!=null&&k?d(p.klubbid,k.fromDate,k.toDate,s):Promise.resolve({data:[],error:null}),A,O?l(s):Promise.resolve({data:[],error:null})]),F=j.data,I=M.data,L=N.data,R=P.data,z=e?.profil?.kasterid??null,B=e?.profil?.kobling_status===`godkjent`,V=z!=null&&F.some(e=>e.kasterid===z),H=[p.dato?t(p.dato):``,p.tid?u(p.tid):``,p.kategori?.navn?g(p.kategori.navn):``,p.sted?g(p.sted):``].filter(Boolean).join(` · `);n.innerHTML=`
      <div class="container py-4 pm-side">
        <h2 class="mb-1">${g(p.navn??``)}</h2>
        <p class="text-muted mb-4">${H}</p>
        ${x(e,b,B,V,p.erfullfort??!1,s)}
        ${S(b,p.erfullfort??!1,F,L)}
        ${C(I)}
        <h5 class="mt-4 mb-2">${O?`Par (${R.length})`:`Påmeldingar (${F.length})`}</h5>
        ${O?w(R):T(F,b)}
      </div>`,e&&E(n,i,F,z,s)}catch(t){e(`pamelding.render`,t),n.replaceChildren(a(`Kunne ikkje laste påmelding.`))}}export{D as render};