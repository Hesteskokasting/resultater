import{t as e}from"./logError-CB4-2Lin.js";import{A as t,F as n,Gt as r,Lt as i,S as a,T as o,Tt as s,c,i as l,j as u,k as d,t as f,v as p,w as m,yt as h,zt as g}from"./index-B3Z0SKG3.js";import{t as _}from"./LoadingState-C6NB62Ct.js";import{p as v,r as y}from"./kasterService-D9jqvobU.js";import{r as b}from"./kaster-2cwCS5i9.js";function x(e,t,n,r,i,a){return e?!n&&!t?`<div class="alert alert-warning">
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
          <option value="">— vel utøvar —</option>${r.filter(e=>!i.has(e.id)).map(e=>`<option value="${e.id}">${c(e.etternavn)}, ${c(e.fornavn)} — ${c(e.klubb?.navn??``)}</option>`).join(``)}
        </select>
      </div>
      <div id="admin-registration-error" class="alert alert-danger d-none"></div>
      <button type="submit" class="btn btn-warning">Meld på</button>
    </form>`}function C(e){return e.length?`
    <div class="mt-4 mb-3">
      <h5>Stevner samme helg</h5>
      <ul class="list-unstyled">${e.map(e=>{let t=e.dato?g(e.dato):``;return`<li><a href="#/stevne/${e.id}/pamelding">${c(e.navn??``)} — ${t}</a></li>`}).join(``)}</ul>
    </div>`:``}function w(e){return e.length?`<table class="table table-sm"><tbody>${e.map(e=>{let t=e.sideA.kaster,n=e.sideB.kaster,r=e=>e?`<a href="#/kastere/${e.id}">${c(b(e))}</a>${e.klubb?.navn?`<br><small class="text-muted">${c(e.klubb.navn)}</small>`:``}`:`—`;return`<tr><td>${r(t)}</td><td>${r(n)}</td></tr>`}).join(``)}</tbody></table>`:`<p class="empty-state">Ingen par registrerte enno.</p>`}function T(e,t){if(!e.length)return`<p class="empty-state">Ingen påmeldingar enno.</p>`;let n=[...e].sort((e,t)=>{let n=e.kaster?.klubb?.navn??``,r=t.kaster?.klubb?.navn??``,i=n.localeCompare(r,`nb`);return i===0?(e.kaster?.etternavn??``).localeCompare(t.kaster?.etternavn??``,`nb`):i}).map(e=>`<tr>
    <td>${e.kaster?`<a href="#/kastere/${e.kaster.id}">${c(e.kaster.fornavn)} ${c(e.kaster.etternavn)}</a>`:`—`}</td>
    <td>${c(e.kaster?.klubb?.navn??``)}</td>
    ${t?`<td><button class="btn btn-sm btn-outline-danger remove-registration" data-id="${e.id}">Fjern</button></td>`:``}
  </tr>`).join(``);return`<table class="table table-sm">
    <thead><tr><th>Namn</th><th>Klubb</th>${t?`<th></th>`:``}</tr></thead>
    <tbody>${n}</tbody>
  </table>`}function E(e,n,r,i,a){e.querySelector(`#registration-form`)?.addEventListener(`submit`,async t=>{t.preventDefault();let r=e.querySelector(`#registration-error`);if(r.classList.add(`d-none`),i==null)return;let{error:o}=await m(a,i);if(o){r.textContent=`Feil ved påmelding.`,r.classList.remove(`d-none`);return}D(e,n)});let s=e.querySelector(`#admin-registration-form`);s?.addEventListener(`submit`,async t=>{t.preventDefault();let r=e.querySelector(`#admin-registration-error`);r.classList.add(`d-none`);let i=new FormData(s),o=Number(i.get(`admin_kasterid`));if(!o){r.textContent=`Vel ein utøvar.`,r.classList.remove(`d-none`);return}let{error:c}=await m(a,o);if(c){r.textContent=`Feil ved påmelding.`,r.classList.remove(`d-none`);return}D(e,n)}),e.querySelector(`#unregister-button`)?.addEventListener(`click`,async()=>{if(i==null)return;let a=r.find(e=>e.kasterid===i);if(!a||!await u({title:`Avmeld`,message:`Vil du melde deg av?`}))return;let{error:s}=await o(a.id);if(s){t(`Kunne ikkje melde av: `+d(s),`error`);return}D(e,n)}),e.querySelectorAll(`.remove-registration`).forEach(r=>{r.addEventListener(`click`,async()=>{if(!await u({title:`Fjern påmelding`,message:`Fjern påmelding?`}))return;let i=Number(r.dataset.id);if(!i)return;let{error:a}=await o(i);if(a){t(`Kunne ikkje fjerne påmelding: `+d(a),`error`);return}D(e,n)})})}async function D(t,o={}){let u=o.id;if(!u){t.replaceChildren(i(`Manglande stevne-ID.`));return}let d=Number(u);f(()=>D(t,o)),t.replaceChildren(_(`Laster påmelding…`));try{let[e,u]=await Promise.all([n(),s(d)]);if(u.error||!u.data){t.replaceChildren(i(`Stevnet finst ikkje.`));return}let f=u.data;if(f.er_snc_hovudstevne){location.hash=`#/stevne/${d}/info`;return}l(`Påmelding – ${f.navn}`);let m=e?.profil?.role===`admin`,_=e?.profil?.role===`klubbadmin`,b=m||_,D=(f.kategori?.navn??``).toLowerCase(),O=D.includes(`par`)||D.includes(`mix`),k=f.dato?{fromDate:new Date(new Date(f.dato+`T12:00:00`).getTime()-1728e5).toISOString().slice(0,10),toDate:new Date(new Date(f.dato+`T12:00:00`).getTime()+1728e5).toISOString().slice(0,10)}:null,A=b?m?y():e&&e.clubs.length?v(e.clubs):Promise.resolve({data:[],error:null}):Promise.resolve({data:[],error:null}),[j,M,N,P]=await Promise.all([a(d),f.klubbid!=null&&k?h(f.klubbid,k.fromDate,k.toDate,d):Promise.resolve({data:[],error:null}),A,O?p(d):Promise.resolve({data:[],error:null})]),F=j.data,I=M.data,L=N.data,R=P.data,z=e?.profil?.kasterid??null,B=e?.profil?.kobling_status===`godkjent`,V=z!=null&&F.some(e=>e.kasterid===z),H=[f.dato?g(f.dato):``,f.tid?r(f.tid):``,f.kategori?.navn?c(f.kategori.navn):``,f.sted?c(f.sted):``].filter(Boolean).join(` · `);t.innerHTML=`
      <div class="container py-4 pm-side">
        <h2 class="mb-1">${c(f.navn??``)}</h2>
        <p class="text-muted mb-4">${H}</p>
        ${x(e,b,B,V,f.erfullfort??!1,d)}
        ${S(b,f.erfullfort??!1,F,L)}
        ${C(I)}
        <h5 class="mt-4 mb-2">${O?`Par (${R.length})`:`Påmeldingar (${F.length})`}</h5>
        ${O?w(R):T(F,b)}
      </div>`,e&&E(t,o,F,z,d)}catch(n){e(`pamelding.render`,n),t.replaceChildren(i(`Kunne ikkje laste påmelding.`))}}export{D as render};