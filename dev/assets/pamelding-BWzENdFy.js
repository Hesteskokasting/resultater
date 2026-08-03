import{t as e}from"./logError-BO7RC_Nh.js";import{C as t,D as n,E as r,Ft as i,M as a,Nt as o,O as s,S as c,Vt as l,a as u,b as d,g as f,ht as p,r as m,t as h,xt as g}from"./index-z7iEevWR.js";import{p as _,r as v}from"./kasterService-BMY5rO_4.js";import{t as y}from"./LoadingState-C6NB62Ct.js";import{r as b}from"./kaster-CGWDYFbf.js";function x(e,t,n,r,i,a){return e?!n&&!t?`<div class="alert alert-warning">
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
          <option value="">— vel utøvar —</option>${r.filter(e=>!i.has(e.id)).map(e=>`<option value="${e.id}">${u(e.etternavn)}, ${u(e.fornavn)} — ${u(e.klubb?.navn??``)}</option>`).join(``)}
        </select>
      </div>
      <div id="admin-registration-error" class="alert alert-danger d-none"></div>
      <button type="submit" class="btn btn-warning">Meld på</button>
    </form>`}function C(e){return e.length?`
    <div class="mt-4 mb-3">
      <h5>Stevner samme helg</h5>
      <ul class="list-unstyled">${e.map(e=>{let t=e.dato?i(e.dato):``;return`<li><a href="#/stevne/${e.id}/pamelding">${u(e.navn??``)} — ${t}</a></li>`}).join(``)}</ul>
    </div>`:``}function w(e){return e.length?`<table class="table table-sm"><tbody>${e.map(e=>{let t=e.sideA.kaster,n=e.sideB.kaster,r=e=>e?`<a href="#/kastere/${e.id}">${u(b(e))}</a>${e.klubb?.navn?`<br><small class="text-muted">${u(e.klubb.navn)}</small>`:``}`:`—`;return`<tr><td>${r(t)}</td><td>${r(n)}</td></tr>`}).join(``)}</tbody></table>`:`<p class="empty-state">Ingen par registrerte enno.</p>`}function T(e,t){if(!e.length)return`<p class="empty-state">Ingen påmeldingar enno.</p>`;let n=[...e].sort((e,t)=>{let n=e.kaster?.klubb?.navn??``,r=t.kaster?.klubb?.navn??``,i=n.localeCompare(r,`nb`);return i===0?(e.kaster?.etternavn??``).localeCompare(t.kaster?.etternavn??``,`nb`):i}).map(e=>`<tr>
    <td>${e.kaster?`<a href="#/kastere/${e.kaster.id}">${u(e.kaster.fornavn)} ${u(e.kaster.etternavn)}</a>`:`—`}</td>
    <td>${u(e.kaster?.klubb?.navn??``)}</td>
    ${t?`<td><button class="btn btn-sm btn-outline-danger remove-registration" data-id="${e.id}">Fjern</button></td>`:``}
  </tr>`).join(``);return`<table class="table table-sm">
    <thead><tr><th>Namn</th><th>Klubb</th>${t?`<th></th>`:``}</tr></thead>
    <tbody>${n}</tbody>
  </table>`}function E(e,i,a,o,l){e.querySelector(`#registration-form`)?.addEventListener(`submit`,async t=>{t.preventDefault();let n=e.querySelector(`#registration-error`);if(n.classList.add(`d-none`),o==null)return;let{error:r}=await c(l,o);if(r){n.textContent=`Feil ved påmelding.`,n.classList.remove(`d-none`);return}D(e,i)});let u=e.querySelector(`#admin-registration-form`);u?.addEventListener(`submit`,async t=>{t.preventDefault();let n=e.querySelector(`#admin-registration-error`);n.classList.add(`d-none`);let r=new FormData(u),a=Number(r.get(`admin_kasterid`));if(!a){n.textContent=`Vel ein utøvar.`,n.classList.remove(`d-none`);return}let{error:o}=await c(l,a);if(o){n.textContent=`Feil ved påmelding.`,n.classList.remove(`d-none`);return}D(e,i)}),e.querySelector(`#unregister-button`)?.addEventListener(`click`,async()=>{if(o==null)return;let c=a.find(e=>e.kasterid===o);if(!c||!await s({title:`Avmeld`,message:`Vil du melde deg av?`}))return;let{error:l}=await t(c.id);if(l){n(`Kunne ikkje melde av: `+r(l),`error`);return}D(e,i)}),e.querySelectorAll(`.remove-registration`).forEach(a=>{a.addEventListener(`click`,async()=>{if(!await s({title:`Fjern påmelding`,message:`Fjern påmelding?`}))return;let o=Number(a.dataset.id);if(!o)return;let{error:c}=await t(o);if(c){n(`Kunne ikkje fjerne påmelding: `+r(c),`error`);return}D(e,i)})})}async function D(t,n={}){let r=n.id;if(!r){t.replaceChildren(o(`Manglande stevne-ID.`));return}let s=Number(r);h(()=>D(t,n)),t.replaceChildren(y(`Laster påmelding…`));try{let[e,r]=await Promise.all([a(),g(s)]);if(r.error||!r.data){t.replaceChildren(o(`Stevnet finst ikkje.`));return}let c=r.data;if(c.er_snc_hovudstevne){location.hash=`#/stevne/${s}/info`;return}m(`Påmelding – ${c.navn}`);let h=e?.profil?.role===`admin`,y=e?.profil?.role===`klubbadmin`,b=h||y,D=(c.kategori?.navn??``).toLowerCase(),O=D.includes(`par`)||D.includes(`mix`),k=c.dato?{fromDate:new Date(new Date(c.dato+`T12:00:00`).getTime()-2*864e5).toISOString().slice(0,10),toDate:new Date(new Date(c.dato+`T12:00:00`).getTime()+2*864e5).toISOString().slice(0,10)}:null,A=b?h?v():e&&e.clubs.length?_(e.clubs):Promise.resolve({data:[],error:null}):Promise.resolve({data:[],error:null}),[j,M,N,P]=await Promise.all([d(s),c.klubbid!=null&&k?p(c.klubbid,k.fromDate,k.toDate,s):Promise.resolve({data:[],error:null}),A,O?f(s):Promise.resolve({data:[],error:null})]),F=j.data,I=M.data,L=N.data,R=P.data,z=e?.profil?.kasterid??null,B=e?.profil?.kobling_status===`godkjent`,V=z!=null&&F.some(e=>e.kasterid===z),H=[c.dato?i(c.dato):``,c.tid?l(c.tid):``,c.kategori?.navn?u(c.kategori.navn):``,c.sted?u(c.sted):``].filter(Boolean).join(` · `);t.innerHTML=`
      <div class="container py-4 pm-side">
        <h2 class="mb-1">${u(c.navn??``)}</h2>
        <p class="text-muted mb-4">${H}</p>
        ${x(e,b,B,V,c.erfullfort??!1,s)}
        ${S(b,c.erfullfort??!1,F,L)}
        ${C(I)}
        <h5 class="mt-4 mb-2">${O?`Par (${R.length})`:`Påmeldingar (${F.length})`}</h5>
        ${O?w(R):T(F,b)}
      </div>`,e&&E(t,n,F,z,s)}catch(n){e(`pamelding.render`,n),t.replaceChildren(o(`Kunne ikkje laste påmelding.`))}}export{D as render};