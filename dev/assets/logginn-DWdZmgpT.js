import{t as e}from"./logError-D5z16FyH.js";import{A as t,C as n,E as r,Ht as i,M as a,O as o,P as s,St as c,T as l,j as u}from"./index-DtEMUua3.js";import{t as d}from"./Tabs-BIv0oqoM.js";function f(e){let t=document.createElement(`div`);return t.innerHTML=e,t}function p(e){return new URLSearchParams(location.hash.split(`?`)[1]??``).get(e)}function m(){return p(`redirect`)}async function h(e){return e?`#${e}`:await o()?`#/admin`:`#/minside`}async function g(o){let g=new URLSearchParams(window.location.search),_=g.get(`error_description`)??g.get(`error`);if(_){n(_,`error`);let e=new URL(window.location.href);e.search=``,window.history.replaceState(null,``,e.toString())}let v=await r();if(v){let e=m(),t=sessionStorage.getItem(l)===`1`;if(t&&sessionStorage.removeItem(l),e||t){location.hash=await h(e);return}o.innerHTML=`
      <div class="container py-4 account-container">
        <p>Du er allereie innlogga som <strong>${c(v.user.email)}</strong>.</p>
        <a href="#/minside" class="btn btn-primary">Gå til Min side</a>
      </div>`;return}let y=f(`
    <form id="login-form">
      <div class="mb-3">
        <label class="form-label" for="li-email">E-post</label>
        <input type="email" class="form-control" id="li-email" required autocomplete="email">
      </div>
      <div class="mb-3">
        <label class="form-label" for="li-password">Passord</label>
        <input type="password" class="form-control" id="li-password" required autocomplete="current-password">
      </div>
      <div id="li-error" class="alert alert-danger d-none"></div>
      <button type="submit" class="btn btn-primary w-100">Logg inn</button>
    </form>`),b=f(`
    <form id="register-form">
      <div class="mb-3">
        <label class="form-label" for="reg-email">E-post</label>
        <input type="email" class="form-control" id="reg-email" required autocomplete="email">
      </div>
      <div class="mb-3">
        <label class="form-label" for="reg-password">Passord</label>
        <input type="password" class="form-control" id="reg-password" required autocomplete="new-password" minlength="8">
      </div>
      <div class="mb-3">
        <label class="form-label" for="reg-password2">Gjenta passord</label>
        <input type="password" class="form-control" id="reg-password2" required autocomplete="new-password" minlength="8">
      </div>
      <div id="reg-error" class="alert alert-danger d-none"></div>
      <div id="reg-success" class="alert alert-success d-none">
        Konto oppretta! Du kan no logge inn.
      </div>
      <button type="submit" class="btn btn-success w-100">Opprett konto</button>
    </form>`),x=document.createElement(`div`);x.className=`container py-4 account-container`;let S=document.createElement(`h2`);S.className=`mb-4`,S.textContent=`Konto`,x.appendChild(S);function C(t,r,a){let o=document.createElement(`button`);return o.type=`button`,o.className=`btn ${r} w-100`,o.textContent=t,o.addEventListener(`click`,async()=>{o.disabled=!0;let{error:t}=await a();if(t){e(`logginn.socialLogin`,t),n(t.message,`error`),o.disabled=!1;return}i.isNativePlatform()&&(location.hash=await h(m()))}),o}x.appendChild(C(`Logg inn med Google`,`btn-google`,()=>a(m()??void 0))),i.getPlatform()===`ios`&&x.appendChild(C(` Logg inn med Apple`,`btn-apple mt-2`,u));let w=document.createElement(`div`);w.className=`account-divider`,w.textContent=`eller`,x.appendChild(w),x.appendChild(d({tabs:[{id:`login`,label:`Logg inn`,panel:y},{id:`register`,label:`Registrer ny konto`,panel:b}]})),o.replaceChildren(x);let T=p(`email`);T&&(o.querySelector(`#li-email`).value=T,o.querySelector(`#li-password`).focus()),o.querySelector(`#login-form`).addEventListener(`submit`,async e=>{e.preventDefault();let n=e.target,r=o.querySelector(`#li-error`);r.classList.add(`d-none`);let i=n.querySelector(`[type=submit]`);i.disabled=!0;let{error:a}=await t(o.querySelector(`#li-email`).value.trim(),o.querySelector(`#li-password`).value);if(a){r.textContent=a.message===`Invalid login credentials`?`Feil e-post eller passord.`:a.message,r.classList.remove(`d-none`),i.disabled=!1;return}location.hash=await h(m())}),o.querySelector(`#register-form`).addEventListener(`submit`,async e=>{e.preventDefault();let n=e.target,r=o.querySelector(`#reg-error`),i=o.querySelector(`#reg-success`);r.classList.add(`d-none`),i.classList.add(`d-none`);let a=o.querySelector(`#reg-password`).value;if(a!==o.querySelector(`#reg-password2`).value){r.textContent=`Passorda er ikkje like.`,r.classList.remove(`d-none`);return}let c=n.querySelector(`[type=submit]`);c.disabled=!0;let l=o.querySelector(`#reg-email`).value.trim(),{error:u}=await s(l,a);if(u){r.textContent=u.message,r.classList.remove(`d-none`),c.disabled=!1;return}await t(l,a),location.hash=`#/minside`})}export{g as render};