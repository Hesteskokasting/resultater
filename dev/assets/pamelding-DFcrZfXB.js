import{t as e}from"./logError-ByTg738k.js";import{Cn as t,E as n,Ft as r,S as i,_n as a,er as o,f as s,fr as c,g as l,h as u,ht as d,i as f,or as p,pr as m,t as h,wn as g,x as _,xn as v,xt as y}from"./index-CkbUM2Oe.js";import{p as b,r as x}from"./kasterService-BN8H2rLx.js";function S(e,t,n,r,i,a){return e?!n&&!t?`<div class="alert alert-warning">
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
          <option value="">— vel utøvar —</option>${r.filter(e=>!i.has(e.id)).map(e=>`<option value="${e.id}">${s(e.etternavn)}, ${s(e.fornavn)} — ${s(e.klubb?.navn??``)}</option>`).join(``)}
        </select>
      </div>
      <div id="admin-registration-error" class="alert alert-danger d-none"></div>
      <button type="submit" class="btn btn-warning">Meld på</button>
    </form>`}function w(e){return e.length?`
    <div class="mt-4 mb-3">
      <h5>Stevner samme helg</h5>
      <ul class="list-unstyled">${e.map(e=>{let t=e.dato?o(e.dato):``;return`<li><a href="#/stevne/${e.id}/pamelding">${s(e.navn??``)} — ${t}</a></li>`}).join(``)}</ul>
    </div>`:``}function T(e){return e.length?`<table class="table table-sm"><tbody>${e.map(e=>{let t=e.sideA.kaster,n=e.sideB.kaster,r=e=>e?`<a href="#/kastere/${e.id}">${s(i(e))}</a>${e.klubb?.navn?`<br><small class="text-muted">${s(e.klubb.navn)}</small>`:``}`:`—`;return`<tr><td>${r(t)}</td><td>${r(n)}</td></tr>`}).join(``)}</tbody></table>`:`<p class="empty-state">Ingen par registrerte enno.</p>`}function E(e,t){if(!e.length)return`<p class="empty-state">Ingen påmeldingar enno.</p>`;let n=[...e].sort((e,t)=>{let n=e.kaster?.klubb?.navn??``,r=t.kaster?.klubb?.navn??``,i=n.localeCompare(r,`nb`);return i===0?(e.kaster?.etternavn??``).localeCompare(t.kaster?.etternavn??``,`nb`):i}).map(e=>`<tr>
    <td>${e.kaster?`<a href="#/kastere/${e.kaster.id}">${s(e.kaster.fornavn)} ${s(e.kaster.etternavn)}</a>`:`—`}</td>
    <td>${s(e.kaster?.klubb?.navn??``)}</td>
    ${t?`<td><button class="btn btn-sm btn-outline-danger remove-registration" data-id="${e.id}">Fjern</button></td>`:``}
  </tr>`).join(``);return`<table class="table table-sm">
    <thead><tr><th>Namn</th><th>Klubb</th>${t?`<th></th>`:``}</tr></thead>
    <tbody>${n}</tbody>
  </table>`}function D(e,n,i,a,o){e.querySelector(`#registration-form`)?.addEventListener(`submit`,async r=>{r.preventDefault();let i=e.querySelector(`#registration-error`);if(i.classList.add(`d-none`),a==null)return;let{error:s}=await t(o,a);if(s){i.textContent=`Feil ved påmelding.`,i.classList.remove(`d-none`);return}O(e,n)});let s=e.querySelector(`#admin-registration-form`);s?.addEventListener(`submit`,async r=>{r.preventDefault();let i=e.querySelector(`#admin-registration-error`);i.classList.add(`d-none`);let a=new FormData(s),c=Number(a.get(`admin_kasterid`));if(!c){i.textContent=`Vel ein utøvar.`,i.classList.remove(`d-none`);return}let{error:l}=await t(o,c);if(l){i.textContent=`Feil ved påmelding.`,i.classList.remove(`d-none`);return}O(e,n)}),e.querySelector(`#unregister-button`)?.addEventListener(`click`,async()=>{if(a==null)return;let t=i.find(e=>e.kasterid===a);if(!t||!await l({title:`Avmeld`,message:`Vil du melde deg av?`}))return;let{error:o}=await g(t.id);if(o){u(`Kunne ikkje melde av: `+r(o),`error`);return}O(e,n)}),e.querySelectorAll(`.remove-registration`).forEach(t=>{t.addEventListener(`click`,async()=>{if(!await l({title:`Fjern påmelding`,message:`Fjern påmelding?`}))return;let i=Number(t.dataset.id);if(!i)return;let{error:a}=await g(i);if(a){u(`Kunne ikkje fjerne påmelding: `+r(a),`error`);return}O(e,n)})})}async function O(t,r={}){let i=r.id;if(!i){t.replaceChildren(c(`Manglande stevne-ID.`));return}let l=Number(i);h(()=>O(t,r)),t.replaceChildren(m(`Laster påmelding…`));try{let[e,i]=await Promise.all([n(),y(l)]);if(i.error||!i.data){t.replaceChildren(c(`Stevnet finst ikkje.`));return}let u=i.data;if(u.er_snc_hovudstevne){location.hash=`#/stevne/${l}/info`;return}f(`Påmelding – ${u.navn}`);let m=e?.profil?.role===`admin`,h=e?.profil?.role===`klubbadmin`,g=m||h,O=(u.kategori?.navn??``).toLowerCase(),k=O.includes(`par`)||O.includes(`mix`),A=u.dato?{fromDate:new Date(new Date(u.dato+`T12:00:00`).getTime()-1728e5).toISOString().slice(0,10),toDate:new Date(new Date(u.dato+`T12:00:00`).getTime()+1728e5).toISOString().slice(0,10)}:null,j=g?m?x():e&&e.clubs.length?b(e.clubs):Promise.resolve({data:[],error:null}):Promise.resolve({data:[],error:null}),[M,N,P,F]=await Promise.all([v(l),u.klubbid!=null&&A?d(u.klubbid,A.fromDate,A.toDate,l):Promise.resolve({data:[],error:null}),j,k?a(l):Promise.resolve({data:[],error:null})]),I=M.data,L=N.data,R=P.data,z=F.data,B=e?.profil?.kasterid??null,V=_(e)!==null,H=B!=null&&I.some(e=>e.kasterid===B),U=[u.dato?o(u.dato):``,u.tid?p(u.tid):``,u.kategori?.navn?s(u.kategori.navn):``,u.sted?s(u.sted):``].filter(Boolean).join(` · `);t.innerHTML=`
      <div class="container py-4 pm-side">
        <h2 class="mb-1">${s(u.navn??``)}</h2>
        <p class="text-muted mb-4">${U}</p>
        ${S(e,g,V,H,u.erfullfort??!1,l)}
        ${C(g,u.erfullfort??!1,I,R)}
        ${w(L)}
        <h5 class="mt-4 mb-2">${k?`Par (${z.length})`:`Påmeldingar (${I.length})`}</h5>
        ${k?T(z):E(I,g)}
      </div>`,e&&D(t,r,I,B,l)}catch(n){e(`pamelding.render`,n),t.replaceChildren(c(`Kunne ikkje laste påmelding.`))}}export{O as render};