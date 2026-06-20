import{W as e,a as t,i as n,n as r,o as i}from"./index-BePamk3G.js";import{t as a}from"./Tabs-DqZPv_S4.js";function o(e){let t=document.createElement(`div`);return t.innerHTML=e,t}async function s(s){let c=await n();if(c){s.innerHTML=`
      <div class="container py-4 konto-container">
        <p>Du er allereie innlogga som <strong>${e(c.user.email)}</strong>.</p>
        <a href="#/minside" class="btn btn-primary">Gå til Min side</a>
      </div>`;return}let l=o(`
    <form id="logginn-skjema">
      <div class="mb-3">
        <label class="form-label" for="li-epost">E-post</label>
        <input type="email" class="form-control" id="li-epost" required autocomplete="email">
      </div>
      <div class="mb-3">
        <label class="form-label" for="li-passord">Passord</label>
        <input type="password" class="form-control" id="li-passord" required autocomplete="current-password">
      </div>
      <div id="li-feil" class="alert alert-danger d-none"></div>
      <button type="submit" class="btn btn-primary w-100">Logg inn</button>
    </form>`),u=o(`
    <form id="registrer-skjema">
      <div class="mb-3">
        <label class="form-label" for="reg-epost">E-post</label>
        <input type="email" class="form-control" id="reg-epost" required autocomplete="email">
      </div>
      <div class="mb-3">
        <label class="form-label" for="reg-passord">Passord</label>
        <input type="password" class="form-control" id="reg-passord" required autocomplete="new-password" minlength="8">
      </div>
      <div class="mb-3">
        <label class="form-label" for="reg-passord2">Gjenta passord</label>
        <input type="password" class="form-control" id="reg-passord2" required autocomplete="new-password" minlength="8">
      </div>
      <div id="reg-feil" class="alert alert-danger d-none"></div>
      <div id="reg-suksess" class="alert alert-success d-none">
        Konto oppretta! Du kan no logge inn.
      </div>
      <button type="submit" class="btn btn-success w-100">Opprett konto</button>
    </form>`),d=document.createElement(`div`);d.className=`container py-4 konto-container`;let f=document.createElement(`h2`);f.className=`mb-4`,f.textContent=`Konto`,d.appendChild(f),d.appendChild(a({tabs:[{id:`logginn`,label:`Logg inn`,panel:l},{id:`registrer`,label:`Registrer ny konto`,panel:u}]})),s.replaceChildren(d),s.querySelector(`#logginn-skjema`).addEventListener(`submit`,async e=>{e.preventDefault();let n=e.target,i=s.querySelector(`#li-feil`);i.classList.add(`d-none`);let a=n.querySelector(`[type=submit]`);a.disabled=!0;let{error:o}=await t(s.querySelector(`#li-epost`).value.trim(),s.querySelector(`#li-passord`).value);if(o){i.textContent=o.message===`Invalid login credentials`?`Feil e-post eller passord.`:o.message,i.classList.remove(`d-none`),a.disabled=!1;return}let c=new URLSearchParams(location.hash.split(`?`)[1]??``).get(`redirect`);c?location.hash=`#${c}`:location.hash=await r()?`#/admin`:`#/minside`}),s.querySelector(`#registrer-skjema`).addEventListener(`submit`,async e=>{e.preventDefault();let n=e.target,r=s.querySelector(`#reg-feil`),a=s.querySelector(`#reg-suksess`);r.classList.add(`d-none`),a.classList.add(`d-none`);let o=s.querySelector(`#reg-passord`).value;if(o!==s.querySelector(`#reg-passord2`).value){r.textContent=`Passorda er ikkje like.`,r.classList.remove(`d-none`);return}let c=n.querySelector(`[type=submit]`);c.disabled=!0;let l=s.querySelector(`#reg-epost`).value.trim(),{error:u}=await i(l,o);if(u){r.textContent=u.message,r.classList.remove(`d-none`),c.disabled=!1;return}await t(l,o),location.hash=`#/minside`})}export{s as render};