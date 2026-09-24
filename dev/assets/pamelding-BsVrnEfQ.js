import{t as e}from"./logError-ByTg738k.js";import{Bt as t,E as n,En as r,On as i,S as a,Sn as o,Tt as s,_r as c,ar as l,dr as u,f as d,g as f,h as p,i as m,kn as h,t as g,vr as _,x as v,yt as y}from"./index-ScyQGOLm.js";import{p as b,r as x}from"./kasterService-y8FvzW53.js";function S(e,t,n,r,i,a){return e?!n&&!t?`<div class="alert alert-warning">
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
          <option value="">— vel utøvar —</option>${r.filter(e=>!i.has(e.id)).map(e=>`<option value="${e.id}">${d(e.etternavn)}, ${d(e.fornavn)} — ${d(e.klubb?.navn??``)}</option>`).join(``)}
        </select>
      </div>
      <div id="admin-registration-error" class="alert alert-danger d-none"></div>
      <button type="submit" class="btn btn-warning">Meld på</button>
    </form>`}function w(e){return e.length?`
    <div class="mt-4 mb-3">
      <h5>Stevner samme helg</h5>
      <ul class="list-unstyled">${e.map(e=>{let t=e.dato?l(e.dato):``;return`<li><a href="#/stevne/${e.id}/pamelding">${d(e.navn??``)} — ${t}</a></li>`}).join(``)}</ul>
    </div>`:``}function T(e){return e.length?`<table class="table table-sm"><tbody>${e.map(e=>{let t=e.sideA.kaster,n=e.sideB.kaster,r=e=>e?`<a href="#/kastere/${e.id}">${d(a(e))}</a>${e.klubb?.navn?`<br><small class="text-muted">${d(e.klubb.navn)}</small>`:``}`:`—`;return`<tr><td>${r(t)}</td><td>${r(n)}</td></tr>`}).join(``)}</tbody></table>`:`<p class="empty-state">Ingen par registrerte enno.</p>`}function E(e,t){if(!e.length)return`<p class="empty-state">Ingen påmeldingar enno.</p>`;let n=[...e].sort((e,t)=>{let n=e.kaster?.klubb?.navn??``,r=t.kaster?.klubb?.navn??``,i=n.localeCompare(r,`nb`);return i===0?(e.kaster?.etternavn??``).localeCompare(t.kaster?.etternavn??``,`nb`):i}).map(e=>`<tr>
    <td>${e.kaster?`<a href="#/kastere/${e.kaster.id}">${d(e.kaster.fornavn)} ${d(e.kaster.etternavn)}</a>`:`—`}</td>
    <td>${d(e.kaster?.klubb?.navn??``)}</td>
    ${t?`<td><button class="btn btn-sm btn-outline-danger remove-registration" data-id="${e.id}">Fjern</button></td>`:``}
  </tr>`).join(``);return`<table class="table table-sm">
    <thead><tr><th>Namn</th><th>Klubb</th>${t?`<th></th>`:``}</tr></thead>
    <tbody>${n}</tbody>
  </table>`}function D(e,n,r,a,o){e.querySelector(`#registration-form`)?.addEventListener(`submit`,async t=>{t.preventDefault();let r=e.querySelector(`#registration-error`);if(r.classList.add(`d-none`),a==null)return;let{error:s}=await i(o,a);if(s){r.textContent=`Feil ved påmelding.`,r.classList.remove(`d-none`);return}O(e,n)});let s=e.querySelector(`#admin-registration-form`);s?.addEventListener(`submit`,async t=>{t.preventDefault();let r=e.querySelector(`#admin-registration-error`);r.classList.add(`d-none`);let a=new FormData(s),c=Number(a.get(`admin_kasterid`));if(!c){r.textContent=`Vel ein utøvar.`,r.classList.remove(`d-none`);return}let{error:l}=await i(o,c);if(l){r.textContent=`Feil ved påmelding.`,r.classList.remove(`d-none`);return}O(e,n)}),e.querySelector(`#unregister-button`)?.addEventListener(`click`,async()=>{if(a==null)return;let i=r.find(e=>e.kasterid===a);if(!i||!await f({title:`Avmeld`,message:`Vil du melde deg av?`}))return;let{error:o}=await h(i.id);if(o){p(`Kunne ikkje melde av: `+t(o),`error`);return}O(e,n)}),e.querySelectorAll(`.remove-registration`).forEach(r=>{r.addEventListener(`click`,async()=>{if(!await f({title:`Fjern påmelding`,message:`Fjern påmelding?`}))return;let i=Number(r.dataset.id);if(!i)return;let{error:a}=await h(i);if(a){p(`Kunne ikkje fjerne påmelding: `+t(a),`error`);return}O(e,n)})})}async function O(t,i={}){let a=i.id;if(!a){t.replaceChildren(c(`Manglande stevne-ID.`));return}let f=Number(a);g(()=>O(t,i)),t.replaceChildren(_(`Laster påmelding…`));try{let[e,a]=await Promise.all([n(),s(f)]);if(a.error||!a.data){t.replaceChildren(c(`Stevnet finst ikkje.`));return}let p=a.data;if(p.er_snc_hovudstevne){location.hash=`#/stevne/${f}/info`;return}m(`Påmelding – ${p.navn}`);let h=e?.profil?.role===`admin`,g=e?.profil?.role===`klubbadmin`,_=h||g,O=(p.kategori?.navn??``).toLowerCase(),k=O.includes(`par`)||O.includes(`mix`),A=p.dato?{fromDate:new Date(new Date(p.dato+`T12:00:00`).getTime()-1728e5).toISOString().slice(0,10),toDate:new Date(new Date(p.dato+`T12:00:00`).getTime()+1728e5).toISOString().slice(0,10)}:null,j=_?h?x():e?.club==null?Promise.resolve({data:[],error:null}):b(e.club):Promise.resolve({data:[],error:null}),[M,N,P,F]=await Promise.all([r(f),p.klubbid!=null&&A?y(p.klubbid,A.fromDate,A.toDate,f):Promise.resolve({data:[],error:null}),j,k?o(f):Promise.resolve({data:[],error:null})]),I=M.data,L=N.data,R=P.data,z=F.data,B=e?.profil?.kasterid??null,V=v(e)!==null,H=B!=null&&I.some(e=>e.kasterid===B),U=[p.dato?l(p.dato):``,p.tid?u(p.tid):``,p.kategori?.navn?d(p.kategori.navn):``,p.sted?d(p.sted):``].filter(Boolean).join(` · `);t.innerHTML=`
      <div class="container py-4 pm-side">
        <h2 class="mb-1">${d(p.navn??``)}</h2>
        <p class="text-muted mb-4">${U}</p>
        ${S(e,_,V,H,p.erfullfort??!1,f)}
        ${C(_,p.erfullfort??!1,I,R)}
        ${w(L)}
        <h5 class="mt-4 mb-2">${k?`Par (${z.length})`:`Påmeldingar (${I.length})`}</h5>
        ${k?T(z):E(I,_)}
      </div>`,e&&D(t,i,I,B,f)}catch(n){e(`pamelding.render`,n),t.replaceChildren(c(`Kunne ikkje laste påmelding.`))}}export{O as render};