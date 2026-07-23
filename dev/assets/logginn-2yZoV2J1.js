import{t as e}from"./logError-D5z16FyH.js";import{Ct as t,D as n,E as r,F as i,M as a,N as o,Ut as s,j as c,k as l,w as u}from"./index-CP0vkUTu.js";import{t as d}from"./Tabs-BIv0oqoM.js";function f(e){let t=document.createElement(`div`);return t.innerHTML=e,t}function p(e){return new URLSearchParams(location.hash.split(`?`)[1]??``).get(e)}function m(){return p(`redirect`)}async function h(e){return e?`#${e}`:await l()?`#/admin`:`#/minside`}async function g(l){let g=new URLSearchParams(window.location.search),_=g.get(`error_description`)??g.get(`error`);if(_){u(_,`error`);let e=new URL(window.location.href);e.search=``,window.history.replaceState(null,``,e.toString())}let v=await n();if(v){let e=m(),n=sessionStorage.getItem(r)===`1`;if(n&&sessionStorage.removeItem(r),e||n){location.hash=await h(e);return}l.innerHTML=`
      <div class="container py-4 account-container">
        <p>Du er allereie innlogga som <strong>${t(v.user.email)}</strong>.</p>
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
    </form>`),x=document.createElement(`div`);x.className=`container py-4 account-container`;let S=document.createElement(`h2`);S.className=`mb-4`,S.textContent=`Konto`,x.appendChild(S);function C(t,n,r){let i=document.createElement(`button`);return i.type=`button`,i.className=`btn ${n} w-100`,i.textContent=t,i.addEventListener(`click`,async()=>{i.disabled=!0;let{error:t}=await r();if(t){e(`logginn.socialLogin`,t),u(t.message,`error`),i.disabled=!1;return}s.isNativePlatform()&&(location.hash=await h(m()))}),i}x.appendChild(C(`Logg inn med Google`,`btn-google`,()=>o(m()??void 0))),s.getPlatform()===`ios`&&x.appendChild(C(` Logg inn med Apple`,`btn-apple mt-2`,a));let w=document.createElement(`div`);w.className=`account-divider`,w.textContent=`eller`,x.appendChild(w),x.appendChild(d({tabs:[{id:`login`,label:`Logg inn`,panel:y},{id:`register`,label:`Registrer ny konto`,panel:b}]})),l.replaceChildren(x);let T=p(`email`);T&&(l.querySelector(`#li-email`).value=T,l.querySelector(`#li-password`).focus()),l.querySelector(`#login-form`).addEventListener(`submit`,async e=>{e.preventDefault();let t=e.target,n=l.querySelector(`#li-error`);n.classList.add(`d-none`);let r=t.querySelector(`[type=submit]`);r.disabled=!0;let{error:i}=await c(l.querySelector(`#li-email`).value.trim(),l.querySelector(`#li-password`).value);if(i){n.textContent=i.message===`Invalid login credentials`?`Feil e-post eller passord.`:i.message,n.classList.remove(`d-none`),r.disabled=!1;return}location.hash=await h(m())}),l.querySelector(`#register-form`).addEventListener(`submit`,async e=>{e.preventDefault();let t=e.target,n=l.querySelector(`#reg-error`),r=l.querySelector(`#reg-success`);n.classList.add(`d-none`),r.classList.add(`d-none`);let a=l.querySelector(`#reg-password`).value;if(a!==l.querySelector(`#reg-password2`).value){n.textContent=`Passorda er ikkje like.`,n.classList.remove(`d-none`);return}let o=t.querySelector(`[type=submit]`);o.disabled=!0;let s=l.querySelector(`#reg-email`).value.trim(),{error:u}=await i(s,a);if(u){n.textContent=u.message,n.classList.remove(`d-none`),o.disabled=!1;return}await c(s,a),location.hash=`#/minside`})}export{g as render};