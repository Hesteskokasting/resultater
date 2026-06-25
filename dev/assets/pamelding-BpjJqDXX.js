import{t as e}from"./logError-DhxY2JQv.js";import{i as t}from"./authService-CcI7FLUE.js";import{I as n,P as r,Q as i,X as a,Y as o,d as s,i as c,m as l,v as u}from"./index-C7fZNAx-.js";import{a as d,o as f}from"./kasterService-D1rq1bik.js";import{t as p}from"./LoadingState-xRmJ3K_t.js";function m(e,t,n,r,i,a){return e?!n&&!t?`<div class="alert alert-warning">
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
    </div>`}function h(e,t,n,r){if(!e||t)return``;let i=new Set(n.map(e=>e.kasterid));return`
    <form id="admin-pamelding-skjema" class="card p-3 mb-3 border-warning">
      <h5 class="mb-3">Meld på klubbmedlem</h5>
      <div class="mb-3">
        <label class="form-label">Utøvar</label>
        <select class="form-select" name="admin_kasterid" required>
          <option value="">— vel utøvar —</option>${r.filter(e=>!i.has(e.id)).map(e=>`<option value="${e.id}">${o(e.etternavn)}, ${o(e.fornavn)} — ${o(e.klubb?.navn??``)}</option>`).join(``)}
        </select>
      </div>
      <div id="admin-pm-feil" class="alert alert-danger d-none"></div>
      <button type="submit" class="btn btn-warning">Meld på</button>
    </form>`}function g(e){return e.length?`
    <div class="mt-4 mb-3">
      <h5>Andre stevner same helg (same arrangør)</h5>
      <ul class="list-unstyled">${e.map(e=>{let t=e.dato?i(e.dato):``;return`<li><a href="#/stevne/${e.id}/pamelding">${o(e.navn??``)} — ${t}</a></li>`}).join(``)}</ul>
    </div>`:``}function _(e,t){if(!e.length)return`<p class="empty-state">Ingen påmeldingar enno.</p>`;let n=[...e].sort((e,t)=>{let n=e.kaster?.klubb?.navn??``,r=t.kaster?.klubb?.navn??``,i=n.localeCompare(r,`nb`);return i===0?(e.kaster?.etternavn??``).localeCompare(t.kaster?.etternavn??``,`nb`):i}).map(e=>`<tr>
    <td>${e.kaster?`<a href="#/kastere/${e.kaster.id}">${o(e.kaster.fornavn)} ${o(e.kaster.etternavn)}</a>`:`—`}</td>
    <td>${o(e.kaster?.klubb?.navn??``)}</td>
    ${t?`<td><button class="btn btn-sm btn-outline-danger fjern-pm" data-id="${e.id}">Fjern</button></td>`:``}
  </tr>`).join(``);return`<table class="table table-sm">
    <thead><tr><th>Namn</th><th>Klubb</th>${t?`<th></th>`:``}</tr></thead>
    <tbody>${n}</tbody>
  </table>`}function v(e,t,n,r,i,a){e.querySelector(`#pamelding-skjema`)?.addEventListener(`submit`,async n=>{n.preventDefault();let o=e.querySelector(`#pm-feil`);if(o.classList.add(`d-none`),r==null)return;let{error:s}=await l(a,r,i);if(s){o.textContent=`Feil ved påmelding.`,o.classList.remove(`d-none`);return}y(e,t)});let o=e.querySelector(`#admin-pamelding-skjema`);o?.addEventListener(`submit`,async n=>{n.preventDefault();let r=e.querySelector(`#admin-pm-feil`);r.classList.add(`d-none`);let s=new FormData(o),c=Number(s.get(`admin_kasterid`));if(!c){r.textContent=`Vel ein utøvar.`,r.classList.remove(`d-none`);return}let{error:u}=await l(a,c,i);if(u){r.textContent=`Feil ved påmelding.`,r.classList.remove(`d-none`);return}y(e,t)}),e.querySelector(`#avmeld-knapp`)?.addEventListener(`click`,async()=>{if(r==null)return;let i=n.find(e=>e.kasterid===r);if(!i||!await u({title:`Avmeld`,message:`Vil du melde deg av?`}))return;let{error:a}=await c(i.id);a||y(e,t)}),e.querySelectorAll(`.fjern-pm`).forEach(n=>{n.addEventListener(`click`,async()=>{if(!await u({title:`Fjern påmelding`,message:`Fjern påmelding?`}))return;let r=Number(n.dataset.id);if(!r)return;let{error:i}=await c(r);i||y(e,t)})})}async function y(c,l={}){let u=l.id;if(!u){c.replaceChildren(a(`Manglande stevne-ID.`));return}let y=Number(u);c.replaceChildren(p(`Laster påmelding…`));try{let[e,u]=await Promise.all([t(),n(y)]);if(u.error||!u.data){c.replaceChildren(a(`Stevnet finst ikkje.`));return}let p=u.data,b=e?.profil?.rolle===`admin`,x=e?.profil?.rolle===`klubbadmin`,S=b||x,C=p.dato?{fraDato:new Date(new Date(p.dato+`T12:00:00`).getTime()-2*864e5).toISOString().slice(0,10),tilDato:new Date(new Date(p.dato+`T12:00:00`).getTime()+2*864e5).toISOString().slice(0,10)}:null,w=S?b?f():e&&e.klubber.length?d(e.klubber):Promise.resolve({data:[],error:null}):Promise.resolve({data:[],error:null}),[T,E,D]=await Promise.all([s(y),p.klubbid!=null&&C?r(p.klubbid,C.fraDato,C.tilDato,y):Promise.resolve({data:[],error:null}),w]),O=T.data,k=E.data,A=D.data,j=e?.profil?.kasterid??null,M=e?.profil?.kobling_status===`godkjent`,N=j!=null&&O.some(e=>e.kasterid===j),P=p.dato?i(p.dato):``;c.innerHTML=`
      <div class="container py-4 pm-side">
        <h2 class="mb-1">${o(p.navn??``)}</h2>
        <p class="text-muted mb-4">${P}${p.sted?` · `+o(p.sted):``}</p>
        ${m(e,S,M,N,p.erfullfort??!1,y)}
        ${h(S,p.erfullfort??!1,O,A)}
        ${g(k)}
        <h5 class="mt-4 mb-2">Påmeldingar (${O.length})</h5>
        ${_(O,S)}
      </div>`,e&&v(c,l,O,j,e.user.id,y)}catch(t){e(`pamelding.render`,t),c.replaceChildren(a(`Kunne ikkje laste påmelding.`))}}export{y as render};