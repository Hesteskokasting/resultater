import{t as e}from"./logError-BO7RC_Nh.js";import{A as t,C as n,It as r,O as i,P as a,Rt as o,Wt as s,_ as c,k as l,r as u,s as d,t as f,vt as p,w as m,wt as h,x as g}from"./index-f4GJwwSh.js";import{p as _,r as v}from"./kasterService-Dbuq1Ip6.js";import{t as y}from"./LoadingState-C6NB62Ct.js";import{r as b}from"./kaster-CGWDYFbf.js";function x(e,t,n,r,i,a){return e?!n&&!t?`<div class="alert alert-warning">
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
          <option value="">— vel utøvar —</option>${r.filter(e=>!i.has(e.id)).map(e=>`<option value="${e.id}">${d(e.etternavn)}, ${d(e.fornavn)} — ${d(e.klubb?.navn??``)}</option>`).join(``)}
        </select>
      </div>
      <div id="admin-registration-error" class="alert alert-danger d-none"></div>
      <button type="submit" class="btn btn-warning">Meld på</button>
    </form>`}function C(e){return e.length?`
    <div class="mt-4 mb-3">
      <h5>Stevner samme helg</h5>
      <ul class="list-unstyled">${e.map(e=>{let t=e.dato?o(e.dato):``;return`<li><a href="#/stevne/${e.id}/pamelding">${d(e.navn??``)} — ${t}</a></li>`}).join(``)}</ul>
    </div>`:``}function w(e){return e.length?`<table class="table table-sm"><tbody>${e.map(e=>{let t=e.sideA.kaster,n=e.sideB.kaster,r=e=>e?`<a href="#/kastere/${e.id}">${d(b(e))}</a>${e.klubb?.navn?`<br><small class="text-muted">${d(e.klubb.navn)}</small>`:``}`:`—`;return`<tr><td>${r(t)}</td><td>${r(n)}</td></tr>`}).join(``)}</tbody></table>`:`<p class="empty-state">Ingen par registrerte enno.</p>`}function T(e,t){if(!e.length)return`<p class="empty-state">Ingen påmeldingar enno.</p>`;let n=[...e].sort((e,t)=>{let n=e.kaster?.klubb?.navn??``,r=t.kaster?.klubb?.navn??``,i=n.localeCompare(r,`nb`);return i===0?(e.kaster?.etternavn??``).localeCompare(t.kaster?.etternavn??``,`nb`):i}).map(e=>`<tr>
    <td>${e.kaster?`<a href="#/kastere/${e.kaster.id}">${d(e.kaster.fornavn)} ${d(e.kaster.etternavn)}</a>`:`—`}</td>
    <td>${d(e.kaster?.klubb?.navn??``)}</td>
    ${t?`<td><button class="btn btn-sm btn-outline-danger remove-registration" data-id="${e.id}">Fjern</button></td>`:``}
  </tr>`).join(``);return`<table class="table table-sm">
    <thead><tr><th>Namn</th><th>Klubb</th>${t?`<th></th>`:``}</tr></thead>
    <tbody>${n}</tbody>
  </table>`}function E(e,r,a,o,s){e.querySelector(`#registration-form`)?.addEventListener(`submit`,async t=>{t.preventDefault();let i=e.querySelector(`#registration-error`);if(i.classList.add(`d-none`),o==null)return;let{error:a}=await n(s,o);if(a){i.textContent=`Feil ved påmelding.`,i.classList.remove(`d-none`);return}D(e,r)});let c=e.querySelector(`#admin-registration-form`);c?.addEventListener(`submit`,async t=>{t.preventDefault();let i=e.querySelector(`#admin-registration-error`);i.classList.add(`d-none`);let a=new FormData(c),o=Number(a.get(`admin_kasterid`));if(!o){i.textContent=`Vel ein utøvar.`,i.classList.remove(`d-none`);return}let{error:l}=await n(s,o);if(l){i.textContent=`Feil ved påmelding.`,i.classList.remove(`d-none`);return}D(e,r)}),e.querySelector(`#unregister-button`)?.addEventListener(`click`,async()=>{if(o==null)return;let n=a.find(e=>e.kasterid===o);if(!n||!await t({title:`Avmeld`,message:`Vil du melde deg av?`}))return;let{error:s}=await m(n.id);if(s){l(`Kunne ikkje melde av: `+i(s),`error`);return}D(e,r)}),e.querySelectorAll(`.remove-registration`).forEach(n=>{n.addEventListener(`click`,async()=>{if(!await t({title:`Fjern påmelding`,message:`Fjern påmelding?`}))return;let a=Number(n.dataset.id);if(!a)return;let{error:o}=await m(a);if(o){l(`Kunne ikkje fjerne påmelding: `+i(o),`error`);return}D(e,r)})})}async function D(t,n={}){let i=n.id;if(!i){t.replaceChildren(r(`Manglande stevne-ID.`));return}let l=Number(i);f(()=>D(t,n)),t.replaceChildren(y(`Laster påmelding…`));try{let[e,i]=await Promise.all([a(),h(l)]);if(i.error||!i.data){t.replaceChildren(r(`Stevnet finst ikkje.`));return}let f=i.data;if(f.er_snc_hovudstevne){location.hash=`#/stevne/${l}/info`;return}u(`Påmelding – ${f.navn}`);let m=e?.profil?.role===`admin`,y=e?.profil?.role===`klubbadmin`,b=m||y,D=(f.kategori?.navn??``).toLowerCase(),O=D.includes(`par`)||D.includes(`mix`),k=f.dato?{fromDate:new Date(new Date(f.dato+`T12:00:00`).getTime()-2*864e5).toISOString().slice(0,10),toDate:new Date(new Date(f.dato+`T12:00:00`).getTime()+2*864e5).toISOString().slice(0,10)}:null,A=b?m?v():e&&e.clubs.length?_(e.clubs):Promise.resolve({data:[],error:null}):Promise.resolve({data:[],error:null}),[j,M,N,P]=await Promise.all([g(l),f.klubbid!=null&&k?p(f.klubbid,k.fromDate,k.toDate,l):Promise.resolve({data:[],error:null}),A,O?c(l):Promise.resolve({data:[],error:null})]),F=j.data,I=M.data,L=N.data,R=P.data,z=e?.profil?.kasterid??null,B=e?.profil?.kobling_status===`godkjent`,V=z!=null&&F.some(e=>e.kasterid===z),H=[f.dato?o(f.dato):``,f.tid?s(f.tid):``,f.kategori?.navn?d(f.kategori.navn):``,f.sted?d(f.sted):``].filter(Boolean).join(` · `);t.innerHTML=`
      <div class="container py-4 pm-side">
        <h2 class="mb-1">${d(f.navn??``)}</h2>
        <p class="text-muted mb-4">${H}</p>
        ${x(e,b,B,V,f.erfullfort??!1,l)}
        ${S(b,f.erfullfort??!1,F,L)}
        ${C(I)}
        <h5 class="mt-4 mb-2">${O?`Par (${R.length})`:`Påmeldingar (${F.length})`}</h5>
        ${O?w(R):T(F,b)}
      </div>`,e&&E(t,n,F,z,l)}catch(n){e(`pamelding.render`,n),t.replaceChildren(r(`Kunne ikkje laste påmelding.`))}}export{D as render};