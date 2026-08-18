import{t as e}from"./logError-CTQ3euge.js";import{t}from"./escHtml-CfOHO0aD.js";import{$n as n,Mt as r,T as i,ar as a,b as o,bn as s,ft as c,h as l,i as u,m as d,mn as f,mr as p,pr as m,t as h,vn as g,vt as _,x as v,xn as y}from"./index-36jj8hv1.js";import{p as b,r as x}from"./kasterService-DIBRsqwT.js";function S(e,t,n,r,i,a){return e?!n&&!t?`<div class="alert alert-warning">
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
    </div>`}function C(e,n,r,i){if(!e||n)return``;let a=new Set(r.map(e=>e.kasterid));return`
    <form id="admin-registration-form" class="card p-3 mb-3 border-warning">
      <h5 class="mb-3">Meld på klubbmedlem</h5>
      <div class="mb-3">
        <label class="form-label">Utøvar</label>
        <select class="form-select" name="admin_kasterid" required>
          <option value="">— vel utøvar —</option>${i.filter(e=>!a.has(e.id)).map(e=>`<option value="${e.id}">${t(e.etternavn)}, ${t(e.fornavn)} — ${t(e.klubb?.navn??``)}</option>`).join(``)}
        </select>
      </div>
      <div id="admin-registration-error" class="alert alert-danger d-none"></div>
      <button type="submit" class="btn btn-warning">Meld på</button>
    </form>`}function w(e){return e.length?`
    <div class="mt-4 mb-3">
      <h5>Stevner samme helg</h5>
      <ul class="list-unstyled">${e.map(e=>{let r=e.dato?n(e.dato):``;return`<li><a href="#/stevne/${e.id}/pamelding">${t(e.navn??``)} — ${r}</a></li>`}).join(``)}</ul>
    </div>`:``}function T(e){return e.length?`<table class="table table-sm"><tbody>${e.map(e=>{let n=e.sideA.kaster,r=e.sideB.kaster,i=e=>e?`<a href="#/kastere/${e.id}">${t(v(e))}</a>${e.klubb?.navn?`<br><small class="text-muted">${t(e.klubb.navn)}</small>`:``}`:`—`;return`<tr><td>${i(n)}</td><td>${i(r)}</td></tr>`}).join(``)}</tbody></table>`:`<p class="empty-state">Ingen par registrerte enno.</p>`}function E(e,n){if(!e.length)return`<p class="empty-state">Ingen påmeldingar enno.</p>`;let r=[...e].sort((e,t)=>{let n=e.kaster?.klubb?.navn??``,r=t.kaster?.klubb?.navn??``,i=n.localeCompare(r,`nb`);return i===0?(e.kaster?.etternavn??``).localeCompare(t.kaster?.etternavn??``,`nb`):i}).map(e=>`<tr>
    <td>${e.kaster?`<a href="#/kastere/${e.kaster.id}">${t(e.kaster.fornavn)} ${t(e.kaster.etternavn)}</a>`:`—`}</td>
    <td>${t(e.kaster?.klubb?.navn??``)}</td>
    ${n?`<td><button class="btn btn-sm btn-outline-danger remove-registration" data-id="${e.id}">Fjern</button></td>`:``}
  </tr>`).join(``);return`<table class="table table-sm">
    <thead><tr><th>Namn</th><th>Klubb</th>${n?`<th></th>`:``}</tr></thead>
    <tbody>${r}</tbody>
  </table>`}function D(e,t,n,i,a){e.querySelector(`#registration-form`)?.addEventListener(`submit`,async n=>{n.preventDefault();let r=e.querySelector(`#registration-error`);if(r.classList.add(`d-none`),i==null)return;let{error:o}=await s(a,i);if(o){r.textContent=`Feil ved påmelding.`,r.classList.remove(`d-none`);return}O(e,t)});let o=e.querySelector(`#admin-registration-form`);o?.addEventListener(`submit`,async n=>{n.preventDefault();let r=e.querySelector(`#admin-registration-error`);r.classList.add(`d-none`);let i=new FormData(o),c=Number(i.get(`admin_kasterid`));if(!c){r.textContent=`Vel ein utøvar.`,r.classList.remove(`d-none`);return}let{error:l}=await s(a,c);if(l){r.textContent=`Feil ved påmelding.`,r.classList.remove(`d-none`);return}O(e,t)}),e.querySelector(`#unregister-button`)?.addEventListener(`click`,async()=>{if(i==null)return;let a=n.find(e=>e.kasterid===i);if(!a||!await l({title:`Avmeld`,message:`Vil du melde deg av?`}))return;let{error:o}=await y(a.id);if(o){d(`Kunne ikkje melde av: `+r(o),`error`);return}O(e,t)}),e.querySelectorAll(`.remove-registration`).forEach(n=>{n.addEventListener(`click`,async()=>{if(!await l({title:`Fjern påmelding`,message:`Fjern påmelding?`}))return;let i=Number(n.dataset.id);if(!i)return;let{error:a}=await y(i);if(a){d(`Kunne ikkje fjerne påmelding: `+r(a),`error`);return}O(e,t)})})}async function O(r,s={}){let l=s.id;if(!l){r.replaceChildren(m(`Manglande stevne-ID.`));return}let d=Number(l);h(()=>O(r,s)),r.replaceChildren(p(`Laster påmelding…`));try{let[e,l]=await Promise.all([i(),_(d)]);if(l.error||!l.data){r.replaceChildren(m(`Stevnet finst ikkje.`));return}let p=l.data;if(p.er_snc_hovudstevne){location.hash=`#/stevne/${d}/info`;return}u(`Påmelding – ${p.navn}`);let h=e?.profil?.role===`admin`,v=e?.profil?.role===`klubbadmin`,y=h||v,O=(p.kategori?.navn??``).toLowerCase(),k=O.includes(`par`)||O.includes(`mix`),A=p.dato?{fromDate:new Date(new Date(p.dato+`T12:00:00`).getTime()-1728e5).toISOString().slice(0,10),toDate:new Date(new Date(p.dato+`T12:00:00`).getTime()+1728e5).toISOString().slice(0,10)}:null,j=y?h?x():e&&e.clubs.length?b(e.clubs):Promise.resolve({data:[],error:null}):Promise.resolve({data:[],error:null}),[M,N,P,F]=await Promise.all([g(d),p.klubbid!=null&&A?c(p.klubbid,A.fromDate,A.toDate,d):Promise.resolve({data:[],error:null}),j,k?f(d):Promise.resolve({data:[],error:null})]),I=M.data,L=N.data,R=P.data,z=F.data,B=e?.profil?.kasterid??null,V=o(e)!==null,H=B!=null&&I.some(e=>e.kasterid===B),U=[p.dato?n(p.dato):``,p.tid?a(p.tid):``,p.kategori?.navn?t(p.kategori.navn):``,p.sted?t(p.sted):``].filter(Boolean).join(` · `);r.innerHTML=`
      <div class="container py-4 pm-side">
        <h2 class="mb-1">${t(p.navn??``)}</h2>
        <p class="text-muted mb-4">${U}</p>
        ${S(e,y,V,H,p.erfullfort??!1,d)}
        ${C(y,p.erfullfort??!1,I,R)}
        ${w(L)}
        <h5 class="mt-4 mb-2">${k?`Par (${z.length})`:`Påmeldingar (${I.length})`}</h5>
        ${k?T(z):E(I,y)}
      </div>`,e&&D(r,s,I,B,d)}catch(t){e(`pamelding.render`,t),r.replaceChildren(m(`Kunne ikkje laste påmelding.`))}}export{O as render};