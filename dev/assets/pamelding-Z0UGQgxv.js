import{n as e,t}from"./logError-DE4meABt.js";import{Zn as n,_n as r,b as i,dn as a,dr as o,fr as s,hn as c,ht as l,i as u,kt as d,lt as f,m as p,p as m,rr as h,t as g,vn as _,w as v,y}from"./index-C5SiCpc_.js";import{p as b,r as x}from"./kasterService-D2LNpl7e.js";function S(e,t,n,r,i,a){return e?!n&&!t?`<div class="alert alert-warning">
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
    </div>`}function C(t,n,r,i){if(!t||n)return``;let a=new Set(r.map(e=>e.kasterid));return`
    <form id="admin-registration-form" class="card p-3 mb-3 border-warning">
      <h5 class="mb-3">Meld på klubbmedlem</h5>
      <div class="mb-3">
        <label class="form-label">Utøvar</label>
        <select class="form-select" name="admin_kasterid" required>
          <option value="">— vel utøvar —</option>${i.filter(e=>!a.has(e.id)).map(t=>`<option value="${t.id}">${e(t.etternavn)}, ${e(t.fornavn)} — ${e(t.klubb?.navn??``)}</option>`).join(``)}
        </select>
      </div>
      <div id="admin-registration-error" class="alert alert-danger d-none"></div>
      <button type="submit" class="btn btn-warning">Meld på</button>
    </form>`}function w(t){return t.length?`
    <div class="mt-4 mb-3">
      <h5>Stevner samme helg</h5>
      <ul class="list-unstyled">${t.map(t=>{let r=t.dato?n(t.dato):``;return`<li><a href="#/stevne/${t.id}/pamelding">${e(t.navn??``)} — ${r}</a></li>`}).join(``)}</ul>
    </div>`:``}function T(t){return t.length?`<table class="table table-sm"><tbody>${t.map(t=>{let n=t.sideA.kaster,r=t.sideB.kaster,a=t=>t?`<a href="#/kastere/${t.id}">${e(i(t))}</a>${t.klubb?.navn?`<br><small class="text-muted">${e(t.klubb.navn)}</small>`:``}`:`—`;return`<tr><td>${a(n)}</td><td>${a(r)}</td></tr>`}).join(``)}</tbody></table>`:`<p class="empty-state">Ingen par registrerte enno.</p>`}function E(t,n){if(!t.length)return`<p class="empty-state">Ingen påmeldingar enno.</p>`;let r=[...t].sort((e,t)=>{let n=e.kaster?.klubb?.navn??``,r=t.kaster?.klubb?.navn??``,i=n.localeCompare(r,`nb`);return i===0?(e.kaster?.etternavn??``).localeCompare(t.kaster?.etternavn??``,`nb`):i}).map(t=>`<tr>
    <td>${t.kaster?`<a href="#/kastere/${t.kaster.id}">${e(t.kaster.fornavn)} ${e(t.kaster.etternavn)}</a>`:`—`}</td>
    <td>${e(t.kaster?.klubb?.navn??``)}</td>
    ${n?`<td><button class="btn btn-sm btn-outline-danger remove-registration" data-id="${t.id}">Fjern</button></td>`:``}
  </tr>`).join(``);return`<table class="table table-sm">
    <thead><tr><th>Namn</th><th>Klubb</th>${n?`<th></th>`:``}</tr></thead>
    <tbody>${r}</tbody>
  </table>`}function D(e,t,n,i,a){e.querySelector(`#registration-form`)?.addEventListener(`submit`,async n=>{n.preventDefault();let o=e.querySelector(`#registration-error`);if(o.classList.add(`d-none`),i==null)return;let{error:s}=await r(a,i);if(s){o.textContent=`Feil ved påmelding.`,o.classList.remove(`d-none`);return}O(e,t)});let o=e.querySelector(`#admin-registration-form`);o?.addEventListener(`submit`,async n=>{n.preventDefault();let i=e.querySelector(`#admin-registration-error`);i.classList.add(`d-none`);let s=new FormData(o),c=Number(s.get(`admin_kasterid`));if(!c){i.textContent=`Vel ein utøvar.`,i.classList.remove(`d-none`);return}let{error:l}=await r(a,c);if(l){i.textContent=`Feil ved påmelding.`,i.classList.remove(`d-none`);return}O(e,t)}),e.querySelector(`#unregister-button`)?.addEventListener(`click`,async()=>{if(i==null)return;let r=n.find(e=>e.kasterid===i);if(!r||!await p({title:`Avmeld`,message:`Vil du melde deg av?`}))return;let{error:a}=await _(r.id);if(a){m(`Kunne ikkje melde av: `+d(a),`error`);return}O(e,t)}),e.querySelectorAll(`.remove-registration`).forEach(n=>{n.addEventListener(`click`,async()=>{if(!await p({title:`Fjern påmelding`,message:`Fjern påmelding?`}))return;let r=Number(n.dataset.id);if(!r)return;let{error:i}=await _(r);if(i){m(`Kunne ikkje fjerne påmelding: `+d(i),`error`);return}O(e,t)})})}async function O(r,i={}){let d=i.id;if(!d){r.replaceChildren(o(`Manglande stevne-ID.`));return}let p=Number(d);g(()=>O(r,i)),r.replaceChildren(s(`Laster påmelding…`));try{let[t,s]=await Promise.all([v(),l(p)]);if(s.error||!s.data){r.replaceChildren(o(`Stevnet finst ikkje.`));return}let d=s.data;if(d.er_snc_hovudstevne){location.hash=`#/stevne/${p}/info`;return}u(`Påmelding – ${d.navn}`);let m=t?.profil?.role===`admin`,g=t?.profil?.role===`klubbadmin`,_=m||g,O=(d.kategori?.navn??``).toLowerCase(),k=O.includes(`par`)||O.includes(`mix`),A=d.dato?{fromDate:new Date(new Date(d.dato+`T12:00:00`).getTime()-1728e5).toISOString().slice(0,10),toDate:new Date(new Date(d.dato+`T12:00:00`).getTime()+1728e5).toISOString().slice(0,10)}:null,j=_?m?x():t&&t.clubs.length?b(t.clubs):Promise.resolve({data:[],error:null}):Promise.resolve({data:[],error:null}),[M,N,P,F]=await Promise.all([c(p),d.klubbid!=null&&A?f(d.klubbid,A.fromDate,A.toDate,p):Promise.resolve({data:[],error:null}),j,k?a(p):Promise.resolve({data:[],error:null})]),I=M.data,L=N.data,R=P.data,z=F.data,B=t?.profil?.kasterid??null,V=y(t)!==null,H=B!=null&&I.some(e=>e.kasterid===B),U=[d.dato?n(d.dato):``,d.tid?h(d.tid):``,d.kategori?.navn?e(d.kategori.navn):``,d.sted?e(d.sted):``].filter(Boolean).join(` · `);r.innerHTML=`
      <div class="container py-4 pm-side">
        <h2 class="mb-1">${e(d.navn??``)}</h2>
        <p class="text-muted mb-4">${U}</p>
        ${S(t,_,V,H,d.erfullfort??!1,p)}
        ${C(_,d.erfullfort??!1,I,R)}
        ${w(L)}
        <h5 class="mt-4 mb-2">${k?`Par (${z.length})`:`Påmeldingar (${I.length})`}</h5>
        ${k?T(z):E(I,_)}
      </div>`,t&&D(r,i,I,B,p)}catch(e){t(`pamelding.render`,e),r.replaceChildren(o(`Kunne ikkje laste påmelding.`))}}export{O as render};