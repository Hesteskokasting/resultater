import{t as e}from"./dist-Ck9YJ66N.js";import{t}from"./logError-Cjb5zwtM.js";import{i as n,l as r,o as i,r as a,s as o,t as s}from"./authService-BSCiMkAt.js";import{Z as c,x as l}from"./index-CDZhvbt-.js";import{t as u}from"./Tabs-BJyEwSRZ.js";function d(e){let t=document.createElement(`div`);return t.innerHTML=e,t}function f(){return new URLSearchParams(location.hash.split(`?`)[1]??``).get(`redirect`)}async function p(e){return e?`#${e}`:await n()?`#/admin`:`#/minside`}async function m(n){let m=new URLSearchParams(window.location.search),h=m.get(`error_description`)??m.get(`error`);if(h){l(h,`error`);let e=new URL(window.location.href);e.search=``,window.history.replaceState(null,``,e.toString())}let g=await a();if(g){let e=f(),t=sessionStorage.getItem(s)===`1`;if(t&&sessionStorage.removeItem(s),e||t){location.hash=await p(e);return}n.innerHTML=`
      <div class="container py-4 account-container">
        <p>Du er allereie innlogga som <strong>${c(g.user.email)}</strong>.</p>
        <a href="#/minside" class="btn btn-primary">Gå til Min side</a>
      </div>`;return}let _=d(`
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
    </form>`),v=d(`
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
    </form>`),y=document.createElement(`div`);y.className=`container py-4 account-container`;let b=document.createElement(`h2`);b.className=`mb-4`,b.textContent=`Konto`,y.appendChild(b);let x=document.createElement(`button`);x.type=`button`,x.className=`btn btn-google w-100`,x.textContent=`Logg inn med Google`,y.appendChild(x);let S=document.createElement(`div`);S.className=`account-divider`,S.textContent=`eller`,y.appendChild(S),y.appendChild(u({tabs:[{id:`login`,label:`Logg inn`,panel:_},{id:`register`,label:`Registrer ny konto`,panel:v}]})),n.replaceChildren(y),x.addEventListener(`click`,async()=>{x.disabled=!0;let{error:n}=await o(f()??void 0);if(n){t(`logginn.signInWithGoogle`,n),l(n.message,`error`),x.disabled=!1;return}e.isNativePlatform()&&(location.hash=await p(f()))}),n.querySelector(`#login-form`).addEventListener(`submit`,async e=>{e.preventDefault();let t=e.target,r=n.querySelector(`#li-error`);r.classList.add(`d-none`);let a=t.querySelector(`[type=submit]`);a.disabled=!0;let{error:o}=await i(n.querySelector(`#li-email`).value.trim(),n.querySelector(`#li-password`).value);if(o){r.textContent=o.message===`Invalid login credentials`?`Feil e-post eller passord.`:o.message,r.classList.remove(`d-none`),a.disabled=!1;return}location.hash=await p(f())}),n.querySelector(`#register-form`).addEventListener(`submit`,async e=>{e.preventDefault();let t=e.target,a=n.querySelector(`#reg-error`),o=n.querySelector(`#reg-success`);a.classList.add(`d-none`),o.classList.add(`d-none`);let s=n.querySelector(`#reg-password`).value;if(s!==n.querySelector(`#reg-password2`).value){a.textContent=`Passorda er ikkje like.`,a.classList.remove(`d-none`);return}let c=t.querySelector(`[type=submit]`);c.disabled=!0;let l=n.querySelector(`#reg-email`).value.trim(),{error:u}=await r(l,s);if(u){a.textContent=u.message,a.classList.remove(`d-none`),c.disabled=!1;return}await i(l,s),location.hash=`#/minside`})}export{m as render};