import{t as e}from"./logError-ByTg738k.js";import{An as t,Cn as n,Dn as r,E as i,Et as a,S as o,Vt as s,bt as c,f as l,fr as u,g as d,h as f,i as p,kn as m,or as h,t as g,vr as _,x as v,yr as y}from"./index-DSCLt71t.js";import{p as b,r as x}from"./kasterService-BN8H2rLx.js";function S(e,t,n,r,i,a){return e?!n&&!t?`<div class="alert alert-warning">
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
          <option value="">— vel utøvar —</option>${r.filter(e=>!i.has(e.id)).map(e=>`<option value="${e.id}">${l(e.etternavn)}, ${l(e.fornavn)} — ${l(e.klubb?.navn??``)}</option>`).join(``)}
        </select>
      </div>
      <div id="admin-registration-error" class="alert alert-danger d-none"></div>
      <button type="submit" class="btn btn-warning">Meld på</button>
    </form>`}function w(e){return e.length?`
    <div class="mt-4 mb-3">
      <h5>Stevner samme helg</h5>
      <ul class="list-unstyled">${e.map(e=>{let t=e.dato?h(e.dato):``;return`<li><a href="#/stevne/${e.id}/pamelding">${l(e.navn??``)} — ${t}</a></li>`}).join(``)}</ul>
    </div>`:``}function T(e){return e.length?`<table class="table table-sm"><tbody>${e.map(e=>{let t=e.sideA.kaster,n=e.sideB.kaster,r=e=>e?`<a href="#/kastere/${e.id}">${l(o(e))}</a>${e.klubb?.navn?`<br><small class="text-muted">${l(e.klubb.navn)}</small>`:``}`:`—`;return`<tr><td>${r(t)}</td><td>${r(n)}</td></tr>`}).join(``)}</tbody></table>`:`<p class="empty-state">Ingen par registrerte enno.</p>`}function E(e,t){if(!e.length)return`<p class="empty-state">Ingen påmeldingar enno.</p>`;let n=[...e].sort((e,t)=>{let n=e.kaster?.klubb?.navn??``,r=t.kaster?.klubb?.navn??``,i=n.localeCompare(r,`nb`);return i===0?(e.kaster?.etternavn??``).localeCompare(t.kaster?.etternavn??``,`nb`):i}).map(e=>`<tr>
    <td>${e.kaster?`<a href="#/kastere/${e.kaster.id}">${l(e.kaster.fornavn)} ${l(e.kaster.etternavn)}</a>`:`—`}</td>
    <td>${l(e.kaster?.klubb?.navn??``)}</td>
    ${t?`<td><button class="btn btn-sm btn-outline-danger remove-registration" data-id="${e.id}">Fjern</button></td>`:``}
  </tr>`).join(``);return`<table class="table table-sm">
    <thead><tr><th>Namn</th><th>Klubb</th>${t?`<th></th>`:``}</tr></thead>
    <tbody>${n}</tbody>
  </table>`}function D(e,n,r,i,a){e.querySelector(`#registration-form`)?.addEventListener(`submit`,async t=>{t.preventDefault();let r=e.querySelector(`#registration-error`);if(r.classList.add(`d-none`),i==null)return;let{error:o}=await m(a,i);if(o){r.textContent=`Feil ved påmelding.`,r.classList.remove(`d-none`);return}O(e,n)});let o=e.querySelector(`#admin-registration-form`);o?.addEventListener(`submit`,async t=>{t.preventDefault();let r=e.querySelector(`#admin-registration-error`);r.classList.add(`d-none`);let i=new FormData(o),s=Number(i.get(`admin_kasterid`));if(!s){r.textContent=`Vel ein utøvar.`,r.classList.remove(`d-none`);return}let{error:c}=await m(a,s);if(c){r.textContent=`Feil ved påmelding.`,r.classList.remove(`d-none`);return}O(e,n)}),e.querySelector(`#unregister-button`)?.addEventListener(`click`,async()=>{if(i==null)return;let a=r.find(e=>e.kasterid===i);if(!a||!await d({title:`Avmeld`,message:`Vil du melde deg av?`}))return;let{error:o}=await t(a.id);if(o){f(`Kunne ikkje melde av: `+s(o),`error`);return}O(e,n)}),e.querySelectorAll(`.remove-registration`).forEach(r=>{r.addEventListener(`click`,async()=>{if(!await d({title:`Fjern påmelding`,message:`Fjern påmelding?`}))return;let i=Number(r.dataset.id);if(!i)return;let{error:a}=await t(i);if(a){f(`Kunne ikkje fjerne påmelding: `+s(a),`error`);return}O(e,n)})})}async function O(t,o={}){let s=o.id;if(!s){t.replaceChildren(_(`Manglande stevne-ID.`));return}let d=Number(s);g(()=>O(t,o)),t.replaceChildren(y(`Laster påmelding…`));try{let[e,s]=await Promise.all([i(),a(d)]);if(s.error||!s.data){t.replaceChildren(_(`Stevnet finst ikkje.`));return}let f=s.data;if(f.er_snc_hovudstevne){location.hash=`#/stevne/${d}/info`;return}p(`Påmelding – ${f.navn}`);let m=e?.profil?.role===`admin`,g=e?.profil?.role===`klubbadmin`,y=m||g,O=(f.kategori?.navn??``).toLowerCase(),k=O.includes(`par`)||O.includes(`mix`),A=f.dato?{fromDate:new Date(new Date(f.dato+`T12:00:00`).getTime()-1728e5).toISOString().slice(0,10),toDate:new Date(new Date(f.dato+`T12:00:00`).getTime()+1728e5).toISOString().slice(0,10)}:null,j=y?m?x():e&&e.clubs.length?b(e.clubs):Promise.resolve({data:[],error:null}):Promise.resolve({data:[],error:null}),[M,N,P,F]=await Promise.all([r(d),f.klubbid!=null&&A?c(f.klubbid,A.fromDate,A.toDate,d):Promise.resolve({data:[],error:null}),j,k?n(d):Promise.resolve({data:[],error:null})]),I=M.data,L=N.data,R=P.data,z=F.data,B=e?.profil?.kasterid??null,V=v(e)!==null,H=B!=null&&I.some(e=>e.kasterid===B),U=[f.dato?h(f.dato):``,f.tid?u(f.tid):``,f.kategori?.navn?l(f.kategori.navn):``,f.sted?l(f.sted):``].filter(Boolean).join(` · `);t.innerHTML=`
      <div class="container py-4 pm-side">
        <h2 class="mb-1">${l(f.navn??``)}</h2>
        <p class="text-muted mb-4">${U}</p>
        ${S(e,y,V,H,f.erfullfort??!1,d)}
        ${C(y,f.erfullfort??!1,I,R)}
        ${w(L)}
        <h5 class="mt-4 mb-2">${k?`Par (${z.length})`:`Påmeldingar (${I.length})`}</h5>
        ${k?T(z):E(I,y)}
      </div>`,e&&D(t,o,I,B,d)}catch(n){e(`pamelding.render`,n),t.replaceChildren(_(`Kunne ikkje laste påmelding.`))}}export{O as render};