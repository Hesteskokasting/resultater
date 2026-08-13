import{t as e}from"./logError-CB4-2Lin.js";import{A as t,B as n,F as r,L as i,P as a,U as o,V as s,Xt as c,c as l,z as u}from"./index-BSv_kP0G.js";import{t as d}from"./Tabs-DZCBJPb0.js";function f(e){let t=document.createElement(`div`);return t.innerHTML=e,t}function p(e){return new URLSearchParams(location.hash.split(`?`)[1]??``).get(e)}function m(){return p(`redirect`)}async function h(e){return e?`#${e}`:await i()?`#/admin`:`#/minside`}async function g(i){let g=new URLSearchParams(window.location.search),_=g.get(`error_description`)??g.get(`error`);if(_){t(_,`error`);let e=new URL(window.location.href);e.search=``,window.history.replaceState(null,``,e.toString())}let v=await r();if(v){let e=m(),t=sessionStorage.getItem(a)===`1`;if(t&&sessionStorage.removeItem(a),e||t){location.hash=await h(e);return}i.innerHTML=`
      <div class="container py-4 account-container">
        <p>Du er allereie innlogga som <strong>${l(v.user.email)}</strong>.</p>
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
    </form>`),x=document.createElement(`div`);x.className=`container py-4 account-container`;let S=document.createElement(`h2`);S.className=`mb-4`,S.textContent=`Konto`,x.appendChild(S);function C(n,r,i){let a=document.createElement(`button`);return a.type=`button`,a.className=`btn ${r} w-100`,a.textContent=n,a.addEventListener(`click`,async()=>{a.disabled=!0;let{error:n}=await i();if(n){e(`logginn.socialLogin`,n),t(n.message,`error`),a.disabled=!1;return}c.isNativePlatform()&&(location.hash=await h(m()))}),a}x.appendChild(C(`Logg inn med Google`,`btn-google`,()=>s(m()??void 0))),c.getPlatform()===`ios`&&x.appendChild(C(` Logg inn med Apple`,`btn-apple mt-2`,n));let w=document.createElement(`div`);w.className=`account-divider`,w.textContent=`eller`,x.appendChild(w),x.appendChild(d({tabs:[{id:`login`,label:`Logg inn`,panel:y},{id:`register`,label:`Registrer ny konto`,panel:b}]})),i.replaceChildren(x);let T=p(`email`);T&&(i.querySelector(`#li-email`).value=T,i.querySelector(`#li-password`).focus()),i.querySelector(`#login-form`).addEventListener(`submit`,async e=>{e.preventDefault();let t=e.target,n=i.querySelector(`#li-error`);n.classList.add(`d-none`);let r=t.querySelector(`[type=submit]`);r.disabled=!0;let{error:a}=await u(i.querySelector(`#li-email`).value.trim(),i.querySelector(`#li-password`).value);if(a){n.textContent=a.message===`Invalid login credentials`?`Feil e-post eller passord.`:a.message,n.classList.remove(`d-none`),r.disabled=!1;return}location.hash=await h(m())}),i.querySelector(`#register-form`).addEventListener(`submit`,async e=>{e.preventDefault();let t=e.target,n=i.querySelector(`#reg-error`),r=i.querySelector(`#reg-success`);n.classList.add(`d-none`),r.classList.add(`d-none`);let a=i.querySelector(`#reg-password`).value;if(a!==i.querySelector(`#reg-password2`).value){n.textContent=`Passorda er ikkje like.`,n.classList.remove(`d-none`);return}let s=t.querySelector(`[type=submit]`);s.disabled=!0;let c=i.querySelector(`#reg-email`).value.trim(),{error:l}=await o(c,a);if(l){n.textContent=l.message,n.classList.remove(`d-none`),s.disabled=!1;return}await u(c,a),location.hash=`#/minside`})}export{g as render};