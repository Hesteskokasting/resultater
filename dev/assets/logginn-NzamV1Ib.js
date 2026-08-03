import{t as e}from"./logError-BO7RC_Nh.js";import{B as t,D as n,Gt as r,I as i,L as a,M as o,P as s,R as c,a as l,j as u}from"./index-z7iEevWR.js";import{t as d}from"./Tabs-DZCBJPb0.js";function f(e){let t=document.createElement(`div`);return t.innerHTML=e,t}function p(e){return new URLSearchParams(location.hash.split(`?`)[1]??``).get(e)}function m(){return p(`redirect`)}async function h(e){return e?`#${e}`:await s()?`#/admin`:`#/minside`}async function g(s){let g=new URLSearchParams(window.location.search),_=g.get(`error_description`)??g.get(`error`);if(_){n(_,`error`);let e=new URL(window.location.href);e.search=``,window.history.replaceState(null,``,e.toString())}let v=await o();if(v){let e=m(),t=sessionStorage.getItem(u)===`1`;if(t&&sessionStorage.removeItem(u),e||t){location.hash=await h(e);return}s.innerHTML=`
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
    </form>`),x=document.createElement(`div`);x.className=`container py-4 account-container`;let S=document.createElement(`h2`);S.className=`mb-4`,S.textContent=`Konto`,x.appendChild(S);function C(t,i,a){let o=document.createElement(`button`);return o.type=`button`,o.className=`btn ${i} w-100`,o.textContent=t,o.addEventListener(`click`,async()=>{o.disabled=!0;let{error:t}=await a();if(t){e(`logginn.socialLogin`,t),n(t.message,`error`),o.disabled=!1;return}r.isNativePlatform()&&(location.hash=await h(m()))}),o}x.appendChild(C(`Logg inn med Google`,`btn-google`,()=>c(m()??void 0))),r.getPlatform()===`ios`&&x.appendChild(C(` Logg inn med Apple`,`btn-apple mt-2`,a));let w=document.createElement(`div`);w.className=`account-divider`,w.textContent=`eller`,x.appendChild(w),x.appendChild(d({tabs:[{id:`login`,label:`Logg inn`,panel:y},{id:`register`,label:`Registrer ny konto`,panel:b}]})),s.replaceChildren(x);let T=p(`email`);T&&(s.querySelector(`#li-email`).value=T,s.querySelector(`#li-password`).focus()),s.querySelector(`#login-form`).addEventListener(`submit`,async e=>{e.preventDefault();let t=e.target,n=s.querySelector(`#li-error`);n.classList.add(`d-none`);let r=t.querySelector(`[type=submit]`);r.disabled=!0;let{error:a}=await i(s.querySelector(`#li-email`).value.trim(),s.querySelector(`#li-password`).value);if(a){n.textContent=a.message===`Invalid login credentials`?`Feil e-post eller passord.`:a.message,n.classList.remove(`d-none`),r.disabled=!1;return}location.hash=await h(m())}),s.querySelector(`#register-form`).addEventListener(`submit`,async e=>{e.preventDefault();let n=e.target,r=s.querySelector(`#reg-error`),a=s.querySelector(`#reg-success`);r.classList.add(`d-none`),a.classList.add(`d-none`);let o=s.querySelector(`#reg-password`).value;if(o!==s.querySelector(`#reg-password2`).value){r.textContent=`Passorda er ikkje like.`,r.classList.remove(`d-none`);return}let c=n.querySelector(`[type=submit]`);c.disabled=!0;let l=s.querySelector(`#reg-email`).value.trim(),{error:u}=await t(l,o);if(u){r.textContent=u.message,r.classList.remove(`d-none`),c.disabled=!1;return}await i(l,o),location.hash=`#/minside`})}export{g as render};