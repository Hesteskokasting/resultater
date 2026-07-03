import{t as e}from"./logError-Bwe5P2rH.js";import{i as t,l as n,o as r,r as i,s as a,t as o}from"./authService-DGswF3hY.js";import{Z as s,x as c}from"./index-BL9bjKeu.js";import{t as l}from"./Tabs-2shm9AOr.js";function u(e){let t=document.createElement(`div`);return t.innerHTML=e,t}function d(){return new URLSearchParams(location.hash.split(`?`)[1]??``).get(`redirect`)}async function f(f){let p=new URLSearchParams(window.location.search),m=p.get(`error_description`)??p.get(`error`);if(m){c(m,`error`);let e=new URL(window.location.href);e.search=``,window.history.replaceState(null,``,e.toString())}let h=await i();if(h){let e=d(),n=sessionStorage.getItem(o)===`1`;if(n&&sessionStorage.removeItem(o),e||n){location.hash=e?`#${e}`:await t()?`#/admin`:`#/minside`;return}f.innerHTML=`
      <div class="container py-4 account-container">
        <p>Du er allereie innlogga som <strong>${s(h.user.email)}</strong>.</p>
        <a href="#/minside" class="btn btn-primary">Gå til Min side</a>
      </div>`;return}let g=u(`
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
    </form>`),_=u(`
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
    </form>`),v=document.createElement(`div`);v.className=`container py-4 account-container`;let y=document.createElement(`h2`);y.className=`mb-4`,y.textContent=`Konto`,v.appendChild(y);let b=document.createElement(`button`);b.type=`button`,b.className=`btn btn-google w-100`,b.textContent=`Logg inn med Google`,v.appendChild(b);let x=document.createElement(`div`);x.className=`account-divider`,x.textContent=`eller`,v.appendChild(x),v.appendChild(l({tabs:[{id:`login`,label:`Logg inn`,panel:g},{id:`register`,label:`Registrer ny konto`,panel:_}]})),f.replaceChildren(v),b.addEventListener(`click`,async()=>{b.disabled=!0;let{error:t}=await a(d()??void 0);t&&(e(`logginn.signInWithGoogle`,t),c(t.message,`error`),b.disabled=!1)}),f.querySelector(`#login-form`).addEventListener(`submit`,async e=>{e.preventDefault();let n=e.target,i=f.querySelector(`#li-error`);i.classList.add(`d-none`);let a=n.querySelector(`[type=submit]`);a.disabled=!0;let{error:o}=await r(f.querySelector(`#li-email`).value.trim(),f.querySelector(`#li-password`).value);if(o){i.textContent=o.message===`Invalid login credentials`?`Feil e-post eller passord.`:o.message,i.classList.remove(`d-none`),a.disabled=!1;return}let s=d();s?location.hash=`#${s}`:location.hash=await t()?`#/admin`:`#/minside`}),f.querySelector(`#register-form`).addEventListener(`submit`,async e=>{e.preventDefault();let t=e.target,i=f.querySelector(`#reg-error`),a=f.querySelector(`#reg-success`);i.classList.add(`d-none`),a.classList.add(`d-none`);let o=f.querySelector(`#reg-password`).value;if(o!==f.querySelector(`#reg-password2`).value){i.textContent=`Passorda er ikkje like.`,i.classList.remove(`d-none`);return}let s=t.querySelector(`[type=submit]`);s.disabled=!0;let c=f.querySelector(`#reg-email`).value.trim(),{error:l}=await n(c,o);if(l){i.textContent=l.message,i.classList.remove(`d-none`),s.disabled=!1;return}await r(c,o),location.hash=`#/minside`})}export{f as render};