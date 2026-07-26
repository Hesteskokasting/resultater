import{t as e}from"./logError-D5z16FyH.js";import{A as t,D as n,I as r,M as i,N as a,O as o,P as s,T as c,Wt as l,wt as u}from"./index-DVHt6_kn.js";import{t as d}from"./Tabs-BIv0oqoM.js";function f(e){let t=document.createElement(`div`);return t.innerHTML=e,t}function p(e){return new URLSearchParams(location.hash.split(`?`)[1]??``).get(e)}function m(){return p(`redirect`)}async function h(e){return e?`#${e}`:await t()?`#/admin`:`#/minside`}async function g(t){let g=new URLSearchParams(window.location.search),_=g.get(`error_description`)??g.get(`error`);if(_){c(_,`error`);let e=new URL(window.location.href);e.search=``,window.history.replaceState(null,``,e.toString())}let v=await o();if(v){let e=m(),r=sessionStorage.getItem(n)===`1`;if(r&&sessionStorage.removeItem(n),e||r){location.hash=await h(e);return}t.innerHTML=`
      <div class="container py-4 account-container">
        <p>Du er allereie innlogga som <strong>${u(v.user.email)}</strong>.</p>
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
    </form>`),x=document.createElement(`div`);x.className=`container py-4 account-container`;let S=document.createElement(`h2`);S.className=`mb-4`,S.textContent=`Konto`,x.appendChild(S);function C(t,n,r){let i=document.createElement(`button`);return i.type=`button`,i.className=`btn ${n} w-100`,i.textContent=t,i.addEventListener(`click`,async()=>{i.disabled=!0;let{error:t}=await r();if(t){e(`logginn.socialLogin`,t),c(t.message,`error`),i.disabled=!1;return}l.isNativePlatform()&&(location.hash=await h(m()))}),i}x.appendChild(C(`Logg inn med Google`,`btn-google`,()=>s(m()??void 0))),l.getPlatform()===`ios`&&x.appendChild(C(` Logg inn med Apple`,`btn-apple mt-2`,a));let w=document.createElement(`div`);w.className=`account-divider`,w.textContent=`eller`,x.appendChild(w),x.appendChild(d({tabs:[{id:`login`,label:`Logg inn`,panel:y},{id:`register`,label:`Registrer ny konto`,panel:b}]})),t.replaceChildren(x);let T=p(`email`);T&&(t.querySelector(`#li-email`).value=T,t.querySelector(`#li-password`).focus()),t.querySelector(`#login-form`).addEventListener(`submit`,async e=>{e.preventDefault();let n=e.target,r=t.querySelector(`#li-error`);r.classList.add(`d-none`);let a=n.querySelector(`[type=submit]`);a.disabled=!0;let{error:o}=await i(t.querySelector(`#li-email`).value.trim(),t.querySelector(`#li-password`).value);if(o){r.textContent=o.message===`Invalid login credentials`?`Feil e-post eller passord.`:o.message,r.classList.remove(`d-none`),a.disabled=!1;return}location.hash=await h(m())}),t.querySelector(`#register-form`).addEventListener(`submit`,async e=>{e.preventDefault();let n=e.target,a=t.querySelector(`#reg-error`),o=t.querySelector(`#reg-success`);a.classList.add(`d-none`),o.classList.add(`d-none`);let s=t.querySelector(`#reg-password`).value;if(s!==t.querySelector(`#reg-password2`).value){a.textContent=`Passorda er ikkje like.`,a.classList.remove(`d-none`);return}let c=n.querySelector(`[type=submit]`);c.disabled=!0;let l=t.querySelector(`#reg-email`).value.trim(),{error:u}=await r(l,s);if(u){a.textContent=u.message,a.classList.remove(`d-none`),c.disabled=!1;return}await i(l,s),location.hash=`#/minside`})}export{g as render};