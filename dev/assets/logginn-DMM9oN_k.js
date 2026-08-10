import{t as e}from"./logError-BO7RC_Nh.js";import{B as t,H as n,I as r,Jt as i,N as a,P as o,R as s,k as c,s as l,z as u}from"./index-CFlkG31m.js";import{t as d}from"./Tabs-DZCBJPb0.js";function f(e){let t=document.createElement(`div`);return t.innerHTML=e,t}function p(e){return new URLSearchParams(location.hash.split(`?`)[1]??``).get(e)}function m(){return p(`redirect`)}async function h(e){return e?`#${e}`:await r()?`#/admin`:`#/minside`}async function g(r){let g=new URLSearchParams(window.location.search),_=g.get(`error_description`)??g.get(`error`);if(_){c(_,`error`);let e=new URL(window.location.href);e.search=``,window.history.replaceState(null,``,e.toString())}let v=await o();if(v){let e=m(),t=sessionStorage.getItem(a)===`1`;if(t&&sessionStorage.removeItem(a),e||t){location.hash=await h(e);return}r.innerHTML=`
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
    </form>`),x=document.createElement(`div`);x.className=`container py-4 account-container`;let S=document.createElement(`h2`);S.className=`mb-4`,S.textContent=`Konto`,x.appendChild(S);function C(t,n,r){let a=document.createElement(`button`);return a.type=`button`,a.className=`btn ${n} w-100`,a.textContent=t,a.addEventListener(`click`,async()=>{a.disabled=!0;let{error:t}=await r();if(t){e(`logginn.socialLogin`,t),c(t.message,`error`),a.disabled=!1;return}i.isNativePlatform()&&(location.hash=await h(m()))}),a}x.appendChild(C(`Logg inn med Google`,`btn-google`,()=>t(m()??void 0))),i.getPlatform()===`ios`&&x.appendChild(C(` Logg inn med Apple`,`btn-apple mt-2`,u));let w=document.createElement(`div`);w.className=`account-divider`,w.textContent=`eller`,x.appendChild(w),x.appendChild(d({tabs:[{id:`login`,label:`Logg inn`,panel:y},{id:`register`,label:`Registrer ny konto`,panel:b}]})),r.replaceChildren(x);let T=p(`email`);T&&(r.querySelector(`#li-email`).value=T,r.querySelector(`#li-password`).focus()),r.querySelector(`#login-form`).addEventListener(`submit`,async e=>{e.preventDefault();let t=e.target,n=r.querySelector(`#li-error`);n.classList.add(`d-none`);let i=t.querySelector(`[type=submit]`);i.disabled=!0;let{error:a}=await s(r.querySelector(`#li-email`).value.trim(),r.querySelector(`#li-password`).value);if(a){n.textContent=a.message===`Invalid login credentials`?`Feil e-post eller passord.`:a.message,n.classList.remove(`d-none`),i.disabled=!1;return}location.hash=await h(m())}),r.querySelector(`#register-form`).addEventListener(`submit`,async e=>{e.preventDefault();let t=e.target,i=r.querySelector(`#reg-error`),a=r.querySelector(`#reg-success`);i.classList.add(`d-none`),a.classList.add(`d-none`);let o=r.querySelector(`#reg-password`).value;if(o!==r.querySelector(`#reg-password2`).value){i.textContent=`Passorda er ikkje like.`,i.classList.remove(`d-none`);return}let c=t.querySelector(`[type=submit]`);c.disabled=!0;let l=r.querySelector(`#reg-email`).value.trim(),{error:u}=await n(l,o);if(u){i.textContent=u.message,i.classList.remove(`d-none`),c.disabled=!1;return}await s(l,o),location.hash=`#/minside`})}export{g as render};