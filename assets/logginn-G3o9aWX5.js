import{t as e}from"./logError-D5z16FyH.js";import{E as t,F as n,It as r,L as i,N as a,O as o,P as s,a as c,j as l,k as u}from"./index-CApPqR2n.js";import{t as d}from"./Tabs-DOu_JrHI.js";function f(e){let t=document.createElement(`div`);return t.innerHTML=e,t}function p(e){return new URLSearchParams(location.hash.split(`?`)[1]??``).get(e)}function m(){return p(`redirect`)}async function h(e){return e?`#${e}`:await l()?`#/admin`:`#/minside`}async function g(l){let g=new URLSearchParams(window.location.search),_=g.get(`error_description`)??g.get(`error`);if(_){t(_,`error`);let e=new URL(window.location.href);e.search=``,window.history.replaceState(null,``,e.toString())}let v=await u();if(v){let e=m(),t=sessionStorage.getItem(o)===`1`;if(t&&sessionStorage.removeItem(o),e||t){location.hash=await h(e);return}l.innerHTML=`
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
    </form>`),x=document.createElement(`div`);x.className=`container py-4 account-container`;let S=document.createElement(`h2`);S.className=`mb-4`,S.textContent=`Konto`,x.appendChild(S);function C(n,i,a){let o=document.createElement(`button`);return o.type=`button`,o.className=`btn ${i} w-100`,o.textContent=n,o.addEventListener(`click`,async()=>{o.disabled=!0;let{error:n}=await a();if(n){e(`logginn.socialLogin`,n),t(n.message,`error`),o.disabled=!1;return}r.isNativePlatform()&&(location.hash=await h(m()))}),o}x.appendChild(C(`Logg inn med Google`,`btn-google`,()=>n(m()??void 0))),r.getPlatform()===`ios`&&x.appendChild(C(` Logg inn med Apple`,`btn-apple mt-2`,s));let w=document.createElement(`div`);w.className=`account-divider`,w.textContent=`eller`,x.appendChild(w),x.appendChild(d({tabs:[{id:`login`,label:`Logg inn`,panel:y},{id:`register`,label:`Registrer ny konto`,panel:b}]})),l.replaceChildren(x);let T=p(`email`);T&&(l.querySelector(`#li-email`).value=T,l.querySelector(`#li-password`).focus()),l.querySelector(`#login-form`).addEventListener(`submit`,async e=>{e.preventDefault();let t=e.target,n=l.querySelector(`#li-error`);n.classList.add(`d-none`);let r=t.querySelector(`[type=submit]`);r.disabled=!0;let{error:i}=await a(l.querySelector(`#li-email`).value.trim(),l.querySelector(`#li-password`).value);if(i){n.textContent=i.message===`Invalid login credentials`?`Feil e-post eller passord.`:i.message,n.classList.remove(`d-none`),r.disabled=!1;return}location.hash=await h(m())}),l.querySelector(`#register-form`).addEventListener(`submit`,async e=>{e.preventDefault();let t=e.target,n=l.querySelector(`#reg-error`),r=l.querySelector(`#reg-success`);n.classList.add(`d-none`),r.classList.add(`d-none`);let o=l.querySelector(`#reg-password`).value;if(o!==l.querySelector(`#reg-password2`).value){n.textContent=`Passorda er ikkje like.`,n.classList.remove(`d-none`);return}let s=t.querySelector(`[type=submit]`);s.disabled=!0;let c=l.querySelector(`#reg-email`).value.trim(),{error:u}=await i(c,o);if(u){n.textContent=u.message,n.classList.remove(`d-none`),s.disabled=!1;return}await a(c,o),location.hash=`#/minside`})}export{g as render};