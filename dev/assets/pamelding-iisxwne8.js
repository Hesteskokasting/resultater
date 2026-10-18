import{t as e}from"./logError-BkXRFcqp.js";import{An as t,C as n,D as r,Dt as i,En as a,Mn as o,Nn as s,S as c,Sr as l,Ut as u,_ as d,f,g as p,hr as m,i as h,lr as g,t as _,xr as v,xt as y}from"./index-D6KMvqKH.js";import{p as b,r as x}from"./kasterService-D2Ihl5lb.js";function S(e,t,n,r,i,a){return e?!n&&!t?`<div class="alert alert-warning">
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
    </div>`}function C(e,t,n,r){if(!e||t)return``;let i=new Set(n.map(e=>e.kasterid));return`
    <form id="admin-registration-form" class="card p-3 mb-3 border-warning">
      <h5 class="mb-3">Meld på klubbmedlem</h5>
      <div class="mb-3">
        <label class="form-label">Utøvar</label>
        <select class="form-select" name="admin_kasterid" required>
          <option value="">— vel utøvar —</option>${r.filter(e=>!i.has(e.id)).map(e=>`<option value="${e.id}">${f(e.etternavn)}, ${f(e.fornavn)} — ${f(e.klubb?.navn??``)}</option>`).join(``)}
        </select>
      </div>
      <div id="admin-registration-error" class="alert alert-danger d-none"></div>
      <button type="submit" class="btn btn-warning">Meld på</button>
    </form>`}function w(e){return e.length?`
    <div class="mt-4 mb-3">
      <h5>Stevner samme helg</h5>
      <ul class="list-unstyled">${e.map(e=>{let t=e.dato?g(e.dato):``;return`<li><a href="#/stevne/${e.id}/pamelding">${f(e.navn??``)} — ${t}</a></li>`}).join(``)}</ul>
    </div>`:``}function T(e){return e.length?`<table class="table table-sm"><tbody>${e.map(e=>{let t=e.sideA.kaster,r=e.sideB.kaster,i=e=>e?`<a href="#/kastere/${e.id}">${f(n(e))}</a>${e.klubb?.navn?`<br><small class="text-muted">${f(e.klubb.navn)}</small>`:``}`:`—`;return`<tr><td>${i(t)}</td><td>${i(r)}</td></tr>`}).join(``)}</tbody></table>`:`<p class="empty-state">Ingen par registrerte enno.</p>`}function E(e,t){if(!e.length)return`<p class="empty-state">Ingen påmeldingar enno.</p>`;let n=[...e].sort((e,t)=>{let n=e.kaster?.klubb?.navn??``,r=t.kaster?.klubb?.navn??``,i=n.localeCompare(r,`nb`);return i===0?(e.kaster?.etternavn??``).localeCompare(t.kaster?.etternavn??``,`nb`):i}).map(e=>`<tr>
    <td>${e.kaster?`<a href="#/kastere/${e.kaster.id}">${f(e.kaster.fornavn)} ${f(e.kaster.etternavn)}</a>`:`—`}</td>
    <td>${f(e.kaster?.klubb?.navn??``)}</td>
    ${t?`<td><button class="btn btn-sm btn-outline-danger remove-registration" data-id="${e.id}">Fjern</button></td>`:``}
  </tr>`).join(``);return`<table class="table table-sm">
    <thead><tr><th>Namn</th><th>Klubb</th>${t?`<th></th>`:``}</tr></thead>
    <tbody>${n}</tbody>
  </table>`}function D(e,t,n,r,i){e.querySelector(`#registration-form`)?.addEventListener(`submit`,async n=>{n.preventDefault();let a=e.querySelector(`#registration-error`);if(a.classList.add(`d-none`),r==null)return;let{error:s}=await o(i,r);if(s){a.textContent=`Feil ved påmelding.`,a.classList.remove(`d-none`);return}O(e,t)});let a=e.querySelector(`#admin-registration-form`);a?.addEventListener(`submit`,async n=>{n.preventDefault();let r=e.querySelector(`#admin-registration-error`);r.classList.add(`d-none`);let s=new FormData(a),c=Number(s.get(`admin_kasterid`));if(!c){r.textContent=`Vel ein utøvar.`,r.classList.remove(`d-none`);return}let{error:l}=await o(i,c);if(l){r.textContent=`Feil ved påmelding.`,r.classList.remove(`d-none`);return}O(e,t)}),e.querySelector(`#unregister-button`)?.addEventListener(`click`,async()=>{if(r==null)return;let i=n.find(e=>e.kasterid===r);if(!i||!await d({title:`Avmeld`,message:`Vil du melde deg av?`}))return;let{error:a}=await s(i.id);if(a){p(`Kunne ikkje melde av: `+u(a),`error`);return}O(e,t)}),e.querySelectorAll(`.remove-registration`).forEach(n=>{n.addEventListener(`click`,async()=>{if(!await d({title:`Fjern påmelding`,message:`Fjern påmelding?`}))return;let r=Number(n.dataset.id);if(!r)return;let{error:i}=await s(r);if(i){p(`Kunne ikkje fjerne påmelding: `+u(i),`error`);return}O(e,t)})})}async function O(n,o={}){let s=o.id;if(!s){n.replaceChildren(v(`Manglande stevne-ID.`));return}let u=Number(s);_(()=>O(n,o)),n.replaceChildren(l(`Laster påmelding…`));try{let[e,s]=await Promise.all([r(),i(u)]);if(s.error||!s.data){n.replaceChildren(v(`Stevnet finst ikkje.`));return}let l=s.data;if(l.er_snc_hovudstevne){location.hash=`#/stevne/${u}/info`;return}h(`Påmelding – ${l.navn}`);let d=e?.profil?.role===`admin`,p=e?.profil?.role===`klubbadmin`,_=d||p,O=(l.kategori?.navn??``).toLowerCase(),k=O.includes(`par`)||O.includes(`mix`),A=l.dato?{fromDate:new Date(new Date(l.dato+`T12:00:00`).getTime()-1728e5).toISOString().slice(0,10),toDate:new Date(new Date(l.dato+`T12:00:00`).getTime()+1728e5).toISOString().slice(0,10)}:null,j=_?d?x():e?.club==null?Promise.resolve({data:[],error:null}):b(e.club):Promise.resolve({data:[],error:null}),[M,N,P,F]=await Promise.all([t(u),l.klubbid!=null&&A?y(l.klubbid,A.fromDate,A.toDate,u):Promise.resolve({data:[],error:null}),j,k?a(u):Promise.resolve({data:[],error:null})]),I=M.data,L=N.data,R=P.data,z=F.data,B=e?.profil?.kasterid??null,V=c(e)!==null,H=B!=null&&I.some(e=>e.kasterid===B),U=[l.dato?g(l.dato):``,l.tid?m(l.tid):``,l.kategori?.navn?f(l.kategori.navn):``,l.sted?f(l.sted):``].filter(Boolean).join(` · `);n.innerHTML=`
      <div class="container py-4 pm-side">
        <h2 class="mb-1">${f(l.navn??``)}</h2>
        <p class="text-muted mb-4">${U}</p>
        ${S(e,_,V,H,l.erfullfort??!1,u)}
        ${C(_,l.erfullfort??!1,I,R)}
        ${w(L)}
        <h5 class="mt-4 mb-2">${k?`Par (${z.length})`:`Påmeldingar (${I.length})`}</h5>
        ${k?T(z):E(I,_)}
      </div>`,e&&D(n,o,I,B,u)}catch(t){e(`pamelding.render`,t),n.replaceChildren(v(`Kunne ikkje laste påmelding.`))}}export{O as render};