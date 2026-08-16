import{n as e,t}from"./escHtml-Z0YwDf7L.js";import{B as n,F as r,H as i,I as a,K as o,Lt as s,N as c,V as l,Xt as u,Zt as d,_ as f,d as p,i as m,jt as h,k as g,t as _}from"./index-CY82xwnt.js";import{p as v,r as y}from"./kasterService-CQnR08kH.js";import{r as b}from"./kaster-2cwCS5i9.js";function x(e,t,n,r,i,a){return e?!n&&!t?`<div class="alert alert-warning">
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
    </div>`}function S(e,n,r,i){if(!e||n)return``;let a=new Set(r.map(e=>e.kasterid));return`
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
    </form>`}function C(e){return e.length?`
    <div class="mt-4 mb-3">
      <h5>Stevner samme helg</h5>
      <ul class="list-unstyled">${e.map(e=>{let n=e.dato?p(e.dato):``;return`<li><a href="#/stevne/${e.id}/pamelding">${t(e.navn??``)} — ${n}</a></li>`}).join(``)}</ul>
    </div>`:``}function w(e){return e.length?`<table class="table table-sm"><tbody>${e.map(e=>{let n=e.sideA.kaster,r=e.sideB.kaster,i=e=>e?`<a href="#/kastere/${e.id}">${t(b(e))}</a>${e.klubb?.navn?`<br><small class="text-muted">${t(e.klubb.navn)}</small>`:``}`:`—`;return`<tr><td>${i(n)}</td><td>${i(r)}</td></tr>`}).join(``)}</tbody></table>`:`<p class="empty-state">Ingen par registrerte enno.</p>`}function T(e,n){if(!e.length)return`<p class="empty-state">Ingen påmeldingar enno.</p>`;let r=[...e].sort((e,t)=>{let n=e.kaster?.klubb?.navn??``,r=t.kaster?.klubb?.navn??``,i=n.localeCompare(r,`nb`);return i===0?(e.kaster?.etternavn??``).localeCompare(t.kaster?.etternavn??``,`nb`):i}).map(e=>`<tr>
    <td>${e.kaster?`<a href="#/kastere/${e.kaster.id}">${t(e.kaster.fornavn)} ${t(e.kaster.etternavn)}</a>`:`—`}</td>
    <td>${t(e.kaster?.klubb?.navn??``)}</td>
    ${n?`<td><button class="btn btn-sm btn-outline-danger remove-registration" data-id="${e.id}">Fjern</button></td>`:``}
  </tr>`).join(``);return`<table class="table table-sm">
    <thead><tr><th>Namn</th><th>Klubb</th>${n?`<th></th>`:``}</tr></thead>
    <tbody>${r}</tbody>
  </table>`}function E(e,t,o,s,c){e.querySelector(`#registration-form`)?.addEventListener(`submit`,async n=>{n.preventDefault();let i=e.querySelector(`#registration-error`);if(i.classList.add(`d-none`),s==null)return;let{error:a}=await r(c,s);if(a){i.textContent=`Feil ved påmelding.`,i.classList.remove(`d-none`);return}D(e,t)});let u=e.querySelector(`#admin-registration-form`);u?.addEventListener(`submit`,async n=>{n.preventDefault();let i=e.querySelector(`#admin-registration-error`);i.classList.add(`d-none`);let a=new FormData(u),o=Number(a.get(`admin_kasterid`));if(!o){i.textContent=`Vel ein utøvar.`,i.classList.remove(`d-none`);return}let{error:s}=await r(c,o);if(s){i.textContent=`Feil ved påmelding.`,i.classList.remove(`d-none`);return}D(e,t)}),e.querySelector(`#unregister-button`)?.addEventListener(`click`,async()=>{if(s==null)return;let r=o.find(e=>e.kasterid===s);if(!r||!await i({title:`Avmeld`,message:`Vil du melde deg av?`}))return;let{error:c}=await a(r.id);if(c){l(`Kunne ikkje melde av: `+n(c),`error`);return}D(e,t)}),e.querySelectorAll(`.remove-registration`).forEach(r=>{r.addEventListener(`click`,async()=>{if(!await i({title:`Fjern påmelding`,message:`Fjern påmelding?`}))return;let o=Number(r.dataset.id);if(!o)return;let{error:s}=await a(o);if(s){l(`Kunne ikkje fjerne påmelding: `+n(s),`error`);return}D(e,t)})})}async function D(n,r={}){let i=r.id;if(!i){n.replaceChildren(u(`Manglande stevne-ID.`));return}let a=Number(i);_(()=>D(n,r)),n.replaceChildren(d(`Laster påmelding…`));try{let[e,i]=await Promise.all([o(),s(a)]);if(i.error||!i.data){n.replaceChildren(u(`Stevnet finst ikkje.`));return}let l=i.data;if(l.er_snc_hovudstevne){location.hash=`#/stevne/${a}/info`;return}m(`Påmelding – ${l.navn}`);let d=e?.profil?.role===`admin`,_=e?.profil?.role===`klubbadmin`,b=d||_,D=(l.kategori?.navn??``).toLowerCase(),O=D.includes(`par`)||D.includes(`mix`),k=l.dato?{fromDate:new Date(new Date(l.dato+`T12:00:00`).getTime()-1728e5).toISOString().slice(0,10),toDate:new Date(new Date(l.dato+`T12:00:00`).getTime()+1728e5).toISOString().slice(0,10)}:null,A=b?d?y():e&&e.clubs.length?v(e.clubs):Promise.resolve({data:[],error:null}):Promise.resolve({data:[],error:null}),[j,M,N,P]=await Promise.all([c(a),l.klubbid!=null&&k?h(l.klubbid,k.fromDate,k.toDate,a):Promise.resolve({data:[],error:null}),A,O?g(a):Promise.resolve({data:[],error:null})]),F=j.data,I=M.data,L=N.data,R=P.data,z=e?.profil?.kasterid??null,B=e?.profil?.kobling_status===`godkjent`,V=z!=null&&F.some(e=>e.kasterid===z),H=[l.dato?p(l.dato):``,l.tid?f(l.tid):``,l.kategori?.navn?t(l.kategori.navn):``,l.sted?t(l.sted):``].filter(Boolean).join(` · `);n.innerHTML=`
      <div class="container py-4 pm-side">
        <h2 class="mb-1">${t(l.navn??``)}</h2>
        <p class="text-muted mb-4">${H}</p>
        ${x(e,b,B,V,l.erfullfort??!1,a)}
        ${S(b,l.erfullfort??!1,F,L)}
        ${C(I)}
        <h5 class="mt-4 mb-2">${O?`Par (${R.length})`:`Påmeldingar (${F.length})`}</h5>
        ${O?w(R):T(F,b)}
      </div>`,e&&E(n,r,F,z,a)}catch(t){e(`pamelding.render`,t),n.replaceChildren(u(`Kunne ikkje laste påmelding.`))}}export{D as render};