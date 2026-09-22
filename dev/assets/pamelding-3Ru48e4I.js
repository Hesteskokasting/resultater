import{t as e}from"./logError-ByTg738k.js";import{$n as t,Cn as n,E as r,Pt as i,S as a,Sn as o,ar as s,bn as c,bt as l,dr as u,f as d,fr as f,g as p,gn as m,h,i as g,mt as _,t as v,x as y}from"./index-BzkBRoPl.js";import{p as b,r as x}from"./kasterService-BN8H2rLx.js";function S(e,t,n,r,i,a){return e?!n&&!t?`<div class="alert alert-warning">
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
      <ul class="list-unstyled">${e.map(e=>{let n=e.dato?t(e.dato):``;return`<li><a href="#/stevne/${e.id}/pamelding">${d(e.navn??``)} — ${n}</a></li>`}).join(``)}</ul>
    </div>`:``}function T(e){return e.length?`<table class="table table-sm"><tbody>${e.map(e=>{let t=e.sideA.kaster,n=e.sideB.kaster,r=e=>e?`<a href="#/kastere/${e.id}">${d(a(e))}</a>${e.klubb?.navn?`<br><small class="text-muted">${d(e.klubb.navn)}</small>`:``}`:`—`;return`<tr><td>${r(t)}</td><td>${r(n)}</td></tr>`}).join(``)}</tbody></table>`:`<p class="empty-state">Ingen par registrerte enno.</p>`}function E(e,t){if(!e.length)return`<p class="empty-state">Ingen påmeldingar enno.</p>`;let n=[...e].sort((e,t)=>{let n=e.kaster?.klubb?.navn??``,r=t.kaster?.klubb?.navn??``,i=n.localeCompare(r,`nb`);return i===0?(e.kaster?.etternavn??``).localeCompare(t.kaster?.etternavn??``,`nb`):i}).map(e=>`<tr>
    <td>${e.kaster?`<a href="#/kastere/${e.kaster.id}">${d(e.kaster.fornavn)} ${d(e.kaster.etternavn)}</a>`:`—`}</td>
    <td>${d(e.kaster?.klubb?.navn??``)}</td>
    ${t?`<td><button class="btn btn-sm btn-outline-danger remove-registration" data-id="${e.id}">Fjern</button></td>`:``}
  </tr>`).join(``);return`<table class="table table-sm">
    <thead><tr><th>Namn</th><th>Klubb</th>${t?`<th></th>`:``}</tr></thead>
    <tbody>${n}</tbody>
  </table>`}function D(e,t,r,a,s){e.querySelector(`#registration-form`)?.addEventListener(`submit`,async n=>{n.preventDefault();let r=e.querySelector(`#registration-error`);if(r.classList.add(`d-none`),a==null)return;let{error:i}=await o(s,a);if(i){r.textContent=`Feil ved påmelding.`,r.classList.remove(`d-none`);return}O(e,t)});let c=e.querySelector(`#admin-registration-form`);c?.addEventListener(`submit`,async n=>{n.preventDefault();let r=e.querySelector(`#admin-registration-error`);r.classList.add(`d-none`);let i=new FormData(c),a=Number(i.get(`admin_kasterid`));if(!a){r.textContent=`Vel ein utøvar.`,r.classList.remove(`d-none`);return}let{error:l}=await o(s,a);if(l){r.textContent=`Feil ved påmelding.`,r.classList.remove(`d-none`);return}O(e,t)}),e.querySelector(`#unregister-button`)?.addEventListener(`click`,async()=>{if(a==null)return;let o=r.find(e=>e.kasterid===a);if(!o||!await p({title:`Avmeld`,message:`Vil du melde deg av?`}))return;let{error:s}=await n(o.id);if(s){h(`Kunne ikkje melde av: `+i(s),`error`);return}O(e,t)}),e.querySelectorAll(`.remove-registration`).forEach(r=>{r.addEventListener(`click`,async()=>{if(!await p({title:`Fjern påmelding`,message:`Fjern påmelding?`}))return;let a=Number(r.dataset.id);if(!a)return;let{error:o}=await n(a);if(o){h(`Kunne ikkje fjerne påmelding: `+i(o),`error`);return}O(e,t)})})}async function O(n,i={}){let a=i.id;if(!a){n.replaceChildren(u(`Manglande stevne-ID.`));return}let o=Number(a);v(()=>O(n,i)),n.replaceChildren(f(`Laster påmelding…`));try{let[e,a]=await Promise.all([r(),l(o)]);if(a.error||!a.data){n.replaceChildren(u(`Stevnet finst ikkje.`));return}let f=a.data;if(f.er_snc_hovudstevne){location.hash=`#/stevne/${o}/info`;return}g(`Påmelding – ${f.navn}`);let p=e?.profil?.role===`admin`,h=e?.profil?.role===`klubbadmin`,v=p||h,O=(f.kategori?.navn??``).toLowerCase(),k=O.includes(`par`)||O.includes(`mix`),A=f.dato?{fromDate:new Date(new Date(f.dato+`T12:00:00`).getTime()-1728e5).toISOString().slice(0,10),toDate:new Date(new Date(f.dato+`T12:00:00`).getTime()+1728e5).toISOString().slice(0,10)}:null,j=v?p?x():e&&e.clubs.length?b(e.clubs):Promise.resolve({data:[],error:null}):Promise.resolve({data:[],error:null}),[M,N,P,F]=await Promise.all([c(o),f.klubbid!=null&&A?_(f.klubbid,A.fromDate,A.toDate,o):Promise.resolve({data:[],error:null}),j,k?m(o):Promise.resolve({data:[],error:null})]),I=M.data,L=N.data,R=P.data,z=F.data,B=e?.profil?.kasterid??null,V=y(e)!==null,H=B!=null&&I.some(e=>e.kasterid===B),U=[f.dato?t(f.dato):``,f.tid?s(f.tid):``,f.kategori?.navn?d(f.kategori.navn):``,f.sted?d(f.sted):``].filter(Boolean).join(` · `);n.innerHTML=`
      <div class="container py-4 pm-side">
        <h2 class="mb-1">${d(f.navn??``)}</h2>
        <p class="text-muted mb-4">${U}</p>
        ${S(e,v,V,H,f.erfullfort??!1,o)}
        ${C(v,f.erfullfort??!1,I,R)}
        ${w(L)}
        <h5 class="mt-4 mb-2">${k?`Par (${z.length})`:`Påmeldingar (${I.length})`}</h5>
        ${k?T(z):E(I,v)}
      </div>`,e&&D(n,i,I,B,o)}catch(t){e(`pamelding.render`,t),n.replaceChildren(u(`Kunne ikkje laste påmelding.`))}}export{O as render};