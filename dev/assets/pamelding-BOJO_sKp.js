import{G as e,W as t,i as n,j as r,k as i,nt as a,q as o}from"./index-BFQjj73C.js";import{a as s,o as c}from"./kasterService-d3-Fp_3i.js";import{t as l}from"./LoadingState-RVZNML7E.js";import{t as u}from"./ConfirmDialog-DNGrXiEY.js";import{c as d,d as f,n as p}from"./pameldingService-Dt7hI0Jh.js";function m(e,t,n,r,i,a){return e?!n&&!t?`<div class="alert alert-warning">
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
    </div>`}function h(e,n,r,i){if(!e||n)return``;let a=new Set(r.map(e=>e.kasterid));return`
    <form id="admin-pamelding-skjema" class="card p-3 mb-3 border-warning">
      <h5 class="mb-3">Meld på klubbmedlem</h5>
      <div class="mb-3">
        <label class="form-label">Utøvar</label>
        <select class="form-select" name="admin_kasterid" required>
          <option value="">— vel utøvar —</option>${i.filter(e=>!a.has(e.id)).map(e=>`<option value="${e.id}">${t(e.etternavn)}, ${t(e.fornavn)} — ${t(e.klubb?.navn??``)}</option>`).join(``)}
        </select>
      </div>
      <div id="admin-pm-feil" class="alert alert-danger d-none"></div>
      <button type="submit" class="btn btn-warning">Meld på</button>
    </form>`}function g(e){return e.length?`
    <div class="mt-4 mb-3">
      <h5>Andre stevner same helg (same arrangør)</h5>
      <ul class="list-unstyled">${e.map(e=>{let n=e.dato?o(e.dato):``;return`<li><a href="#/stevne/${e.id}/pamelding">${t(e.navn??``)} — ${n}</a></li>`}).join(``)}</ul>
    </div>`:``}function _(e,n){if(!e.length)return`<p class="empty-state">Ingen påmeldingar enno.</p>`;let r=e.map(e=>`<tr>
    <td>${e.kaster?`<a href="#/kastere/${e.kaster.id}">${t(e.kaster.fornavn)} ${t(e.kaster.etternavn)}</a>`:`—`}</td>
    <td>${t(e.kaster?.klubb?.navn??``)}</td>
    ${n?`<td><button class="btn btn-sm btn-outline-danger fjern-pm" data-id="${e.id}">Fjern</button></td>`:``}
  </tr>`).join(``);return`<table class="table table-sm">
    <thead><tr><th>Namn</th><th>Klubb</th>${n?`<th></th>`:``}</tr></thead>
    <tbody>${r}</tbody>
  </table>`}function v(e,t,n,r,i,a){e.querySelector(`#pamelding-skjema`)?.addEventListener(`submit`,async n=>{n.preventDefault();let o=e.querySelector(`#pm-feil`);if(o.classList.add(`d-none`),r==null)return;let{error:s}=await f(a,r,i);if(s){o.textContent=`Feil ved påmelding.`,o.classList.remove(`d-none`);return}y(e,t)});let o=e.querySelector(`#admin-pamelding-skjema`);o?.addEventListener(`submit`,async n=>{n.preventDefault();let r=e.querySelector(`#admin-pm-feil`);r.classList.add(`d-none`);let s=new FormData(o),c=Number(s.get(`admin_kasterid`));if(!c){r.textContent=`Vel ein utøvar.`,r.classList.remove(`d-none`);return}let{error:l}=await f(a,c,i);if(l){r.textContent=`Feil ved påmelding.`,r.classList.remove(`d-none`);return}y(e,t)}),e.querySelector(`#avmeld-knapp`)?.addEventListener(`click`,async()=>{if(r==null)return;let i=n.find(e=>e.kasterid===r);if(!i||!await u({title:`Avmeld`,message:`Vil du melde deg av?`}))return;let{error:a}=await p(i.id);a||y(e,t)}),e.querySelectorAll(`.fjern-pm`).forEach(n=>{n.addEventListener(`click`,async()=>{if(!await u({title:`Fjern påmelding`,message:`Fjern påmelding?`}))return;let r=Number(n.dataset.id);if(!r)return;let{error:i}=await p(r);i||y(e,t)})})}async function y(u,f={}){let p=f.id;if(!p){u.replaceChildren(e(`Manglande stevne-ID.`));return}let y=Number(p);u.replaceChildren(l(`Laster påmelding…`));try{let[a,l]=await Promise.all([n(),r(y)]);if(l.error||!l.data){u.replaceChildren(e(`Stevnet finst ikkje.`));return}let p=l.data,b=a?.profil?.rolle===`admin`,x=a?.profil?.rolle===`klubbadmin`,S=b||x,C=p.dato?{fraDato:new Date(new Date(p.dato+`T12:00:00`).getTime()-2*864e5).toISOString().slice(0,10),tilDato:new Date(new Date(p.dato+`T12:00:00`).getTime()+2*864e5).toISOString().slice(0,10)}:null,w=S?b?c():a&&a.klubber.length?s(a.klubber):Promise.resolve({data:[],error:null}):Promise.resolve({data:[],error:null}),[T,E,D]=await Promise.all([d(y),p.klubbid!=null&&C?i(p.klubbid,C.fraDato,C.tilDato,y):Promise.resolve({data:[],error:null}),w]),O=T.data,k=E.data,A=D.data,j=a?.profil?.kasterid??null,M=a?.profil?.kobling_status===`godkjent`,N=j!=null&&O.some(e=>e.kasterid===j),P=p.dato?o(p.dato):``;u.innerHTML=`
      <div class="container py-4 pm-side">
        <h2 class="mb-1">${t(p.navn??``)}</h2>
        <p class="text-muted mb-4">${P}${p.sted?` · `+t(p.sted):``}</p>
        ${m(a,S,M,N,p.erfullfort??!1,y)}
        ${h(S,p.erfullfort??!1,O,A)}
        ${g(k)}
        <h5 class="mt-4 mb-2">Påmeldingar (${O.length})</h5>
        ${_(O,S)}
      </div>`,a&&v(u,f,O,j,a.user.id,y)}catch(t){a(`pamelding.render`,t),u.replaceChildren(e(`Kunne ikkje laste påmelding.`))}}export{y as render};