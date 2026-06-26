import{t as e}from"./logError-DhxY2JQv.js";import{i as t}from"./authService-CcI7FLUE.js";import{F as n,J as r,N as i,Y as a,Z as o,f as s,h as c,i as l,p as u,tt as d,ut as f,y as p}from"./index-pllV3QU0.js";import{a as m,o as h}from"./kasterService-D1rq1bik.js";import{t as g}from"./LoadingState-xRmJ3K_t.js";function _(e,t,n,r,i,a){return e?!n&&!t?`<div class="alert alert-warning">
      Du må <a href="#/minside">koble kontoen din til ein utøvarprofil</a> for å melde deg på.
    </div>`:i?`<div class="alert alert-secondary">Dette stevnet er fullført. Påmelding er stengt.</div>`:n&&r?`
      <div class="alert alert-success d-flex justify-content-between align-items-center">
        <span>Du er påmeldt</span>
        <button id="avmeld-knapp" class="btn btn-sm btn-outline-danger">Meld av</button>
      </div>`:n?`
      <form id="pamelding-skjema" class="card p-3 mb-3">
        <h5 class="mb-3">Meld deg på</h5>
        <div id="pm-feil" class="alert alert-danger d-none"></div>
        <button type="submit" class="btn btn-primary">Meld på</button>
      </form>`:``:`<div class="alert alert-info">
      <a href="#/logginn?redirect=/stevne/${a}/pamelding">Logg inn</a> for å melde deg på.
    </div>`}function v(e,t,n,i){if(!e||t)return``;let a=new Set(n.map(e=>e.kasterid));return`
    <form id="admin-pamelding-skjema" class="card p-3 mb-3 border-warning">
      <h5 class="mb-3">Meld på klubbmedlem</h5>
      <div class="mb-3">
        <label class="form-label">Utøvar</label>
        <select class="form-select" name="admin_kasterid" required>
          <option value="">— vel utøvar —</option>${i.filter(e=>!a.has(e.id)).map(e=>`<option value="${e.id}">${r(e.etternavn)}, ${r(e.fornavn)} — ${r(e.klubb?.navn??``)}</option>`).join(``)}
        </select>
      </div>
      <div id="admin-pm-feil" class="alert alert-danger d-none"></div>
      <button type="submit" class="btn btn-warning">Meld på</button>
    </form>`}function y(e){return e.length?`
    <div class="mt-4 mb-3">
      <h5>Stevner samme helg</h5>
      <ul class="list-unstyled">${e.map(e=>{let t=e.dato?o(e.dato):``;return`<li><a href="#/stevne/${e.id}/pamelding">${r(e.navn??``)} — ${t}</a></li>`}).join(``)}</ul>
    </div>`:``}function b(e){return e.length?`<table class="table table-sm"><tbody>${e.map(e=>{let t=e.sideA.kaster,n=e.sideB.kaster,i=e=>e?`<a href="#/kastere/${e.id}">${r(f(e))}</a>${e.klubb?.navn?`<br><small class="text-muted">${r(e.klubb.navn)}</small>`:``}`:`—`;return`<tr><td>${i(t)}</td><td>${i(n)}</td></tr>`}).join(``)}</tbody></table>`:`<p class="empty-state">Ingen par registrerte enno.</p>`}function x(e,t){if(!e.length)return`<p class="empty-state">Ingen påmeldingar enno.</p>`;let n=[...e].sort((e,t)=>{let n=e.kaster?.klubb?.navn??``,r=t.kaster?.klubb?.navn??``,i=n.localeCompare(r,`nb`);return i===0?(e.kaster?.etternavn??``).localeCompare(t.kaster?.etternavn??``,`nb`):i}).map(e=>`<tr>
    <td>${e.kaster?`<a href="#/kastere/${e.kaster.id}">${r(e.kaster.fornavn)} ${r(e.kaster.etternavn)}</a>`:`—`}</td>
    <td>${r(e.kaster?.klubb?.navn??``)}</td>
    ${t?`<td><button class="btn btn-sm btn-outline-danger fjern-pm" data-id="${e.id}">Fjern</button></td>`:``}
  </tr>`).join(``);return`<table class="table table-sm">
    <thead><tr><th>Namn</th><th>Klubb</th>${t?`<th></th>`:``}</tr></thead>
    <tbody>${n}</tbody>
  </table>`}function S(e,t,n,r,i,a){e.querySelector(`#pamelding-skjema`)?.addEventListener(`submit`,async n=>{n.preventDefault();let o=e.querySelector(`#pm-feil`);if(o.classList.add(`d-none`),r==null)return;let{error:s}=await c(a,r,i);if(s){o.textContent=`Feil ved påmelding.`,o.classList.remove(`d-none`);return}C(e,t)});let o=e.querySelector(`#admin-pamelding-skjema`);o?.addEventListener(`submit`,async n=>{n.preventDefault();let r=e.querySelector(`#admin-pm-feil`);r.classList.add(`d-none`);let s=new FormData(o),l=Number(s.get(`admin_kasterid`));if(!l){r.textContent=`Vel ein utøvar.`,r.classList.remove(`d-none`);return}let{error:u}=await c(a,l,i);if(u){r.textContent=`Feil ved påmelding.`,r.classList.remove(`d-none`);return}C(e,t)}),e.querySelector(`#avmeld-knapp`)?.addEventListener(`click`,async()=>{if(r==null)return;let i=n.find(e=>e.kasterid===r);if(!i||!await p({title:`Avmeld`,message:`Vil du melde deg av?`}))return;let{error:a}=await l(i.id);a||C(e,t)}),e.querySelectorAll(`.fjern-pm`).forEach(n=>{n.addEventListener(`click`,async()=>{if(!await p({title:`Fjern påmelding`,message:`Fjern påmelding?`}))return;let r=Number(n.dataset.id);if(!r)return;let{error:i}=await l(r);i||C(e,t)})})}async function C(c,l={}){let f=l.id;if(!f){c.replaceChildren(a(`Manglande stevne-ID.`));return}let p=Number(f);c.replaceChildren(g(`Laster påmelding…`));try{let[e,f]=await Promise.all([t(),n(p)]);if(f.error||!f.data){c.replaceChildren(a(`Stevnet finst ikkje.`));return}let g=f.data,C=e?.profil?.rolle===`admin`,w=e?.profil?.rolle===`klubbadmin`,T=C||w,E=(g.kategori?.navn??``).toLowerCase(),D=E.includes(`par`)||E.includes(`mix`),O=g.dato?{fraDato:new Date(new Date(g.dato+`T12:00:00`).getTime()-2*864e5).toISOString().slice(0,10),tilDato:new Date(new Date(g.dato+`T12:00:00`).getTime()+2*864e5).toISOString().slice(0,10)}:null,k=T?C?h():e&&e.klubber.length?m(e.klubber):Promise.resolve({data:[],error:null}):Promise.resolve({data:[],error:null}),[A,j,M,N]=await Promise.all([s(p),g.klubbid!=null&&O?i(g.klubbid,O.fraDato,O.tilDato,p):Promise.resolve({data:[],error:null}),k,D?u(p):Promise.resolve({data:[],error:null})]),P=A.data,F=j.data,I=M.data,L=N.data,R=e?.profil?.kasterid??null,z=e?.profil?.kobling_status===`godkjent`,B=R!=null&&P.some(e=>e.kasterid===R),V=[g.dato?o(g.dato):``,g.tid?d(g.tid):``,g.kategori?.navn?r(g.kategori.navn):``,g.sted?r(g.sted):``].filter(Boolean).join(` · `);c.innerHTML=`
      <div class="container py-4 pm-side">
        <h2 class="mb-1">${r(g.navn??``)}</h2>
        <p class="text-muted mb-4">${V}</p>
        ${_(e,T,z,B,g.erfullfort??!1,p)}
        ${v(T,g.erfullfort??!1,P,I)}
        ${y(F)}
        <h5 class="mt-4 mb-2">${D?`Par (${L.length})`:`Påmeldingar (${P.length})`}</h5>
        ${D?b(L):x(P,T)}
      </div>`,e&&S(c,l,P,R,e.user.id,p)}catch(t){e(`pamelding.render`,t),c.replaceChildren(a(`Kunne ikkje laste påmelding.`))}}export{C as render};