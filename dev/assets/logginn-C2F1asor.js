import{t as e}from"./logError-D5z16FyH.js";import{A as t,C as n,E as r,N as i,O as a,T as o,Vt as s,j as c,xt as l}from"./index-Dgk2Kvj3.js";import{t as u}from"./Tabs-B8ddqDpf.js";function d(e){let t=document.createElement(`div`);return t.innerHTML=e,t}function f(e){return new URLSearchParams(location.hash.split(`?`)[1]??``).get(e)}function p(){return f(`redirect`)}async function m(e){return e?`#${e}`:await a()?`#/admin`:`#/minside`}async function h(a){let h=new URLSearchParams(window.location.search),g=h.get(`error_description`)??h.get(`error`);if(g){n(g,`error`);let e=new URL(window.location.href);e.search=``,window.history.replaceState(null,``,e.toString())}let _=await r();if(_){let e=p(),t=sessionStorage.getItem(o)===`1`;if(t&&sessionStorage.removeItem(o),e||t){location.hash=await m(e);return}a.innerHTML=`
      <div class="container py-4 account-container">
        <p>Du er allereie innlogga som <strong>${l(_.user.email)}</strong>.</p>
        <a href="#/minside" class="btn btn-primary">Gå til Min side</a>
      </div>`;return}let v=d(`
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
    </form>`),y=d(`
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
    </form>`),b=document.createElement(`div`);b.className=`container py-4 account-container`;let x=document.createElement(`h2`);x.className=`mb-4`,x.textContent=`Konto`,b.appendChild(x);let S=document.createElement(`button`);S.type=`button`,S.className=`btn btn-google w-100`,S.textContent=`Logg inn med Google`,b.appendChild(S);let C=document.createElement(`div`);C.className=`account-divider`,C.textContent=`eller`,b.appendChild(C),b.appendChild(u({tabs:[{id:`login`,label:`Logg inn`,panel:v},{id:`register`,label:`Registrer ny konto`,panel:y}]})),a.replaceChildren(b);let w=f(`email`);w&&(a.querySelector(`#li-email`).value=w,a.querySelector(`#li-password`).focus()),S.addEventListener(`click`,async()=>{S.disabled=!0;let{error:t}=await c(p()??void 0);if(t){e(`logginn.signInWithGoogle`,t),n(t.message,`error`),S.disabled=!1;return}s.isNativePlatform()&&(location.hash=await m(p()))}),a.querySelector(`#login-form`).addEventListener(`submit`,async e=>{e.preventDefault();let n=e.target,r=a.querySelector(`#li-error`);r.classList.add(`d-none`);let i=n.querySelector(`[type=submit]`);i.disabled=!0;let{error:o}=await t(a.querySelector(`#li-email`).value.trim(),a.querySelector(`#li-password`).value);if(o){r.textContent=o.message===`Invalid login credentials`?`Feil e-post eller passord.`:o.message,r.classList.remove(`d-none`),i.disabled=!1;return}location.hash=await m(p())}),a.querySelector(`#register-form`).addEventListener(`submit`,async e=>{e.preventDefault();let n=e.target,r=a.querySelector(`#reg-error`),o=a.querySelector(`#reg-success`);r.classList.add(`d-none`),o.classList.add(`d-none`);let s=a.querySelector(`#reg-password`).value;if(s!==a.querySelector(`#reg-password2`).value){r.textContent=`Passorda er ikkje like.`,r.classList.remove(`d-none`);return}let c=n.querySelector(`[type=submit]`);c.disabled=!0;let l=a.querySelector(`#reg-email`).value.trim(),{error:u}=await i(l,s);if(u){r.textContent=u.message,r.classList.remove(`d-none`),c.disabled=!1;return}await t(l,s),location.hash=`#/minside`})}export{h as render};