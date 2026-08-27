import{t as e}from"./logError-ByTg738k.js";import{E as t,Nt as n,Qn as r,S as i,Sn as a,dr as o,f as s,g as c,h as l,hn as u,i as d,ir as f,pt as p,t as m,ur as h,x as g,xn as _,yn as v,yt as y}from"./index-BvGIsWRi.js";import{p as b,r as x}from"./kasterService-BN8H2rLx.js";function S(e,t,n,r,i,a){return e?!n&&!t?`<div class="alert alert-warning">
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
      <ul class="list-unstyled">${e.map(e=>{let t=e.dato?r(e.dato):``;return`<li><a href="#/stevne/${e.id}/pamelding">${s(e.navn??``)} — ${t}</a></li>`}).join(``)}</ul>
    </div>`:``}function T(e){return e.length?`<table class="table table-sm"><tbody>${e.map(e=>{let t=e.sideA.kaster,n=e.sideB.kaster,r=e=>e?`<a href="#/kastere/${e.id}">${s(i(e))}</a>${e.klubb?.navn?`<br><small class="text-muted">${s(e.klubb.navn)}</small>`:``}`:`—`;return`<tr><td>${r(t)}</td><td>${r(n)}</td></tr>`}).join(``)}</tbody></table>`:`<p class="empty-state">Ingen par registrerte enno.</p>`}function E(e,t){if(!e.length)return`<p class="empty-state">Ingen påmeldingar enno.</p>`;let n=[...e].sort((e,t)=>{let n=e.kaster?.klubb?.navn??``,r=t.kaster?.klubb?.navn??``,i=n.localeCompare(r,`nb`);return i===0?(e.kaster?.etternavn??``).localeCompare(t.kaster?.etternavn??``,`nb`):i}).map(e=>`<tr>
    <td>${e.kaster?`<a href="#/kastere/${e.kaster.id}">${s(e.kaster.fornavn)} ${s(e.kaster.etternavn)}</a>`:`—`}</td>
    <td>${s(e.kaster?.klubb?.navn??``)}</td>
    ${t?`<td><button class="btn btn-sm btn-outline-danger remove-registration" data-id="${e.id}">Fjern</button></td>`:``}
  </tr>`).join(``);return`<table class="table table-sm">
    <thead><tr><th>Namn</th><th>Klubb</th>${t?`<th></th>`:``}</tr></thead>
    <tbody>${n}</tbody>
  </table>`}function D(e,t,r,i,o){e.querySelector(`#registration-form`)?.addEventListener(`submit`,async n=>{n.preventDefault();let r=e.querySelector(`#registration-error`);if(r.classList.add(`d-none`),i==null)return;let{error:a}=await _(o,i);if(a){r.textContent=`Feil ved påmelding.`,r.classList.remove(`d-none`);return}O(e,t)});let s=e.querySelector(`#admin-registration-form`);s?.addEventListener(`submit`,async n=>{n.preventDefault();let r=e.querySelector(`#admin-registration-error`);r.classList.add(`d-none`);let i=new FormData(s),a=Number(i.get(`admin_kasterid`));if(!a){r.textContent=`Vel ein utøvar.`,r.classList.remove(`d-none`);return}let{error:c}=await _(o,a);if(c){r.textContent=`Feil ved påmelding.`,r.classList.remove(`d-none`);return}O(e,t)}),e.querySelector(`#unregister-button`)?.addEventListener(`click`,async()=>{if(i==null)return;let o=r.find(e=>e.kasterid===i);if(!o||!await c({title:`Avmeld`,message:`Vil du melde deg av?`}))return;let{error:s}=await a(o.id);if(s){l(`Kunne ikkje melde av: `+n(s),`error`);return}O(e,t)}),e.querySelectorAll(`.remove-registration`).forEach(r=>{r.addEventListener(`click`,async()=>{if(!await c({title:`Fjern påmelding`,message:`Fjern påmelding?`}))return;let i=Number(r.dataset.id);if(!i)return;let{error:o}=await a(i);if(o){l(`Kunne ikkje fjerne påmelding: `+n(o),`error`);return}O(e,t)})})}async function O(n,i={}){let a=i.id;if(!a){n.replaceChildren(h(`Manglande stevne-ID.`));return}let c=Number(a);m(()=>O(n,i)),n.replaceChildren(o(`Laster påmelding…`));try{let[e,a]=await Promise.all([t(),y(c)]);if(a.error||!a.data){n.replaceChildren(h(`Stevnet finst ikkje.`));return}let o=a.data;if(o.er_snc_hovudstevne){location.hash=`#/stevne/${c}/info`;return}d(`Påmelding – ${o.navn}`);let l=e?.profil?.role===`admin`,m=e?.profil?.role===`klubbadmin`,_=l||m,O=(o.kategori?.navn??``).toLowerCase(),k=O.includes(`par`)||O.includes(`mix`),A=o.dato?{fromDate:new Date(new Date(o.dato+`T12:00:00`).getTime()-1728e5).toISOString().slice(0,10),toDate:new Date(new Date(o.dato+`T12:00:00`).getTime()+1728e5).toISOString().slice(0,10)}:null,j=_?l?x():e&&e.clubs.length?b(e.clubs):Promise.resolve({data:[],error:null}):Promise.resolve({data:[],error:null}),[M,N,P,F]=await Promise.all([v(c),o.klubbid!=null&&A?p(o.klubbid,A.fromDate,A.toDate,c):Promise.resolve({data:[],error:null}),j,k?u(c):Promise.resolve({data:[],error:null})]),I=M.data,L=N.data,R=P.data,z=F.data,B=e?.profil?.kasterid??null,V=g(e)!==null,H=B!=null&&I.some(e=>e.kasterid===B),U=[o.dato?r(o.dato):``,o.tid?f(o.tid):``,o.kategori?.navn?s(o.kategori.navn):``,o.sted?s(o.sted):``].filter(Boolean).join(` · `);n.innerHTML=`
      <div class="container py-4 pm-side">
        <h2 class="mb-1">${s(o.navn??``)}</h2>
        <p class="text-muted mb-4">${U}</p>
        ${S(e,_,V,H,o.erfullfort??!1,c)}
        ${C(_,o.erfullfort??!1,I,R)}
        ${w(L)}
        <h5 class="mt-4 mb-2">${k?`Par (${z.length})`:`Påmeldingar (${I.length})`}</h5>
        ${k?T(z):E(I,_)}
      </div>`,e&&D(n,i,I,B,c)}catch(t){e(`pamelding.render`,t),n.replaceChildren(h(`Kunne ikkje laste påmelding.`))}}export{O as render};