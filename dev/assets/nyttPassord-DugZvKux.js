import{t as e}from"./dist-DIpltt4c.js";import{t}from"./logError-ByTg738k.js";import{A as n,B as r,E as i,Vt as a,yr as o,z as s}from"./index-DSCLt71t.js";import{t as c}from"./navigation-DSwGXsno.js";var l=e=>e?`Set passord`:`Nytt passord`,u=e=>`
  <h2>${l(e)}</h2>
  <div class="alert alert-danger">${e?`Invitasjonen er ugyldig eller har gått ut. Be om ein ny invitasjon.`:`Lenka er ugyldig eller har gått ut. Ber du om ei ny lenke, må du
         opne den i same nettlesar som du ba om den frå.`}</div>
  <a href="#/logginn" class="btn btn-primary">Tilbake til innlogging</a>`,d=t=>`
  <h2>${l(t)}</h2>
  <p class="account-intro">${t?`Vel eit passord for den nye kontoen din.`:`Vel eit nytt passord for kontoen din.`}</p>
  <form id="np-form">
    <div class="mb-3">
      <label class="form-label" for="np-password">${t?`Passord`:`Nytt passord`}</label>
      <input type="password" class="form-control" id="np-password" required
             autocomplete="new-password" minlength="8">
    </div>
    <div class="mb-3">
      <label class="form-label" for="np-password2">Gjenta passord</label>
      <input type="password" class="form-control" id="np-password2" required
             autocomplete="new-password" minlength="8">
    </div>
    <div id="np-error" class="alert alert-danger d-none"></div>
    <button type="submit" class="btn btn-primary w-100" id="np-submit">Lagre passord</button>
  </form>${t&&!e.isNativePlatform()?`<p class="account-hint">eller</p>
         <button type="button" class="btn btn-google w-100" id="np-google">Bruk Google-kontoen din</button>`:``}`,f=e=>`
  <h2>${l(e)}</h2>
  <div class="alert alert-success">${e?`Kontoen er klar. Du er innlogga.`:`Passordet er endra. Du er innlogga.`}</div>
  <a href="#/minside" class="btn btn-primary">Gå til Min side</a>`;async function p(e){e.replaceChildren(o(`Opnar lenka…`));let l=c(`type`)===`invite`,p=c(`token_hash`);if(p){let{error:e}=await r(p,l?`invite`:`recovery`);e&&t(`nyttPassord.verifyEmailToken`,e)}let m=document.createElement(`div`);if(m.className=`container py-4 account-container`,!await i()){m.innerHTML=u(l),e.replaceChildren(m);return}m.innerHTML=d(l),e.replaceChildren(m);let h=m.querySelector(`#np-password`),g=m.querySelector(`#np-password2`),_=m.querySelector(`#np-error`),v=m.querySelector(`#np-submit`),y=m.querySelector(`#np-google`);y?.addEventListener(`click`,async()=>{_.classList.add(`d-none`),y.disabled=!0;let{error:e}=await n();e&&(t(`nyttPassord.linkGoogleIdentity`,e),_.textContent=`Kunne ikkje koble til Google: ${a(e)}`,_.classList.remove(`d-none`),y.disabled=!1)}),m.querySelector(`#np-form`).addEventListener(`submit`,async e=>{if(e.preventDefault(),_.classList.add(`d-none`),h.value!==g.value){_.textContent=`Passorda er ikkje like.`,_.classList.remove(`d-none`);return}v.disabled=!0;let{error:n}=await s(h.value);if(n){t(`nyttPassord.updatePassword`,n),_.textContent=`Kunne ikkje lagre passordet: ${a(n)}`,_.classList.remove(`d-none`),v.disabled=!1;return}m.innerHTML=f(l)})}export{p as render};