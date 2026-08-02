import{t as e}from"./logError-D5z16FyH.js";import{D as t,E as n,Et as r,Mt as i,S as a,T as o,a as s,g as c,k as l,pt as u,r as d,t as f,ut as p,wt as m,x as h,y as g}from"./index-CApPqR2n.js";import{f as _,r as v}from"./kasterService-B3gLOC11.js";import{r as y}from"./kaster-D1SjB08R.js";import{t as b}from"./LoadingState-CllUVMAe.js";function x(e,t,n,r,i,a){return e?!n&&!t?`<div class="alert alert-warning">
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
          <option value="">— vel utøvar —</option>${r.filter(e=>!i.has(e.id)).map(e=>`<option value="${e.id}">${s(e.etternavn)}, ${s(e.fornavn)} — ${s(e.klubb?.navn??``)}</option>`).join(``)}
        </select>
      </div>
      <div id="admin-registration-error" class="alert alert-danger d-none"></div>
      <button type="submit" class="btn btn-warning">Meld på</button>
    </form>`}function C(e){return e.length?`
    <div class="mt-4 mb-3">
      <h5>Stevner samme helg</h5>
      <ul class="list-unstyled">${e.map(e=>{let t=e.dato?r(e.dato):``;return`<li><a href="#/stevne/${e.id}/pamelding">${s(e.navn??``)} — ${t}</a></li>`}).join(``)}</ul>
    </div>`:``}function w(e){return e.length?`<table class="table table-sm"><tbody>${e.map(e=>{let t=e.sideA.kaster,n=e.sideB.kaster,r=e=>e?`<a href="#/kastere/${e.id}">${s(y(e))}</a>${e.klubb?.navn?`<br><small class="text-muted">${s(e.klubb.navn)}</small>`:``}`:`—`;return`<tr><td>${r(t)}</td><td>${r(n)}</td></tr>`}).join(``)}</tbody></table>`:`<p class="empty-state">Ingen par registrerte enno.</p>`}function T(e,t){if(!e.length)return`<p class="empty-state">Ingen påmeldingar enno.</p>`;let n=[...e].sort((e,t)=>{let n=e.kaster?.klubb?.navn??``,r=t.kaster?.klubb?.navn??``,i=n.localeCompare(r,`nb`);return i===0?(e.kaster?.etternavn??``).localeCompare(t.kaster?.etternavn??``,`nb`):i}).map(e=>`<tr>
    <td>${e.kaster?`<a href="#/kastere/${e.kaster.id}">${s(e.kaster.fornavn)} ${s(e.kaster.etternavn)}</a>`:`—`}</td>
    <td>${s(e.kaster?.klubb?.navn??``)}</td>
    ${t?`<td><button class="btn btn-sm btn-outline-danger remove-registration" data-id="${e.id}">Fjern</button></td>`:``}
  </tr>`).join(``);return`<table class="table table-sm">
    <thead><tr><th>Namn</th><th>Klubb</th>${t?`<th></th>`:``}</tr></thead>
    <tbody>${n}</tbody>
  </table>`}function E(e,r,i,s,c){e.querySelector(`#registration-form`)?.addEventListener(`submit`,async t=>{t.preventDefault();let n=e.querySelector(`#registration-error`);if(n.classList.add(`d-none`),s==null)return;let{error:i}=await h(c,s);if(i){n.textContent=`Feil ved påmelding.`,n.classList.remove(`d-none`);return}D(e,r)});let l=e.querySelector(`#admin-registration-form`);l?.addEventListener(`submit`,async t=>{t.preventDefault();let n=e.querySelector(`#admin-registration-error`);n.classList.add(`d-none`);let i=new FormData(l),a=Number(i.get(`admin_kasterid`));if(!a){n.textContent=`Vel ein utøvar.`,n.classList.remove(`d-none`);return}let{error:o}=await h(c,a);if(o){n.textContent=`Feil ved påmelding.`,n.classList.remove(`d-none`);return}D(e,r)}),e.querySelector(`#unregister-button`)?.addEventListener(`click`,async()=>{if(s==null)return;let c=i.find(e=>e.kasterid===s);if(!c||!await t({title:`Avmeld`,message:`Vil du melde deg av?`}))return;let{error:l}=await a(c.id);if(l){n(`Kunne ikkje melde av: `+o(l),`error`);return}D(e,r)}),e.querySelectorAll(`.remove-registration`).forEach(i=>{i.addEventListener(`click`,async()=>{if(!await t({title:`Fjern påmelding`,message:`Fjern påmelding?`}))return;let s=Number(i.dataset.id);if(!s)return;let{error:c}=await a(s);if(c){n(`Kunne ikkje fjerne påmelding: `+o(c),`error`);return}D(e,r)})})}async function D(t,n={}){let a=n.id;if(!a){t.replaceChildren(m(`Manglande stevne-ID.`));return}let o=Number(a);f(()=>D(t,n)),t.replaceChildren(b(`Laster påmelding…`));try{let[e,a]=await Promise.all([l(),u(o)]);if(a.error||!a.data){t.replaceChildren(m(`Stevnet finst ikkje.`));return}let f=a.data;d(`Påmelding – ${f.navn}`);let h=e?.profil?.role===`admin`,y=e?.profil?.role===`klubbadmin`,b=h||y,D=(f.kategori?.navn??``).toLowerCase(),O=D.includes(`par`)||D.includes(`mix`),k=f.dato?{fromDate:new Date(new Date(f.dato+`T12:00:00`).getTime()-2*864e5).toISOString().slice(0,10),toDate:new Date(new Date(f.dato+`T12:00:00`).getTime()+2*864e5).toISOString().slice(0,10)}:null,A=b?h?v():e&&e.clubs.length?_(e.clubs):Promise.resolve({data:[],error:null}):Promise.resolve({data:[],error:null}),[j,M,N,P]=await Promise.all([g(o),f.klubbid!=null&&k?p(f.klubbid,k.fromDate,k.toDate,o):Promise.resolve({data:[],error:null}),A,O?c(o):Promise.resolve({data:[],error:null})]),F=j.data,I=M.data,L=N.data,R=P.data,z=e?.profil?.kasterid??null,B=e?.profil?.kobling_status===`godkjent`,V=z!=null&&F.some(e=>e.kasterid===z),H=[f.dato?r(f.dato):``,f.tid?i(f.tid):``,f.kategori?.navn?s(f.kategori.navn):``,f.sted?s(f.sted):``].filter(Boolean).join(` · `);t.innerHTML=`
      <div class="container py-4 pm-side">
        <h2 class="mb-1">${s(f.navn??``)}</h2>
        <p class="text-muted mb-4">${H}</p>
        ${x(e,b,B,V,f.erfullfort??!1,o)}
        ${S(b,f.erfullfort??!1,F,L)}
        ${C(I)}
        <h5 class="mt-4 mb-2">${O?`Par (${R.length})`:`Påmeldingar (${F.length})`}</h5>
        ${O?w(R):T(F,b)}
      </div>`,e&&E(t,n,F,z,o)}catch(n){e(`pamelding.render`,n),t.replaceChildren(m(`Kunne ikkje laste påmelding.`))}}export{D as render};