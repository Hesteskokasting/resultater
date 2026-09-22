import{t as e}from"./logError-ByTg738k.js";import{A as t,B as n,E as r,Ft as i,gr as a,pr as o,z as s}from"./index-CkbUM2Oe.js";import{t as c}from"./navigation-DSwGXsno.js";var l=e=>e?`Set passord`:`Nytt passord`,u=e=>`
  <h2>${l(e)}</h2>
  <div class="alert alert-danger">${e?`Invitasjonen er ugyldig eller har gått ut. Be om ein ny invitasjon.`:`Lenka er ugyldig eller har gått ut. Ber du om ei ny lenke, må du
         opne den i same nettlesar som du ba om den frå.`}</div>
  <a href="#/logginn" class="btn btn-primary">Tilbake til innlogging</a>`,d=e=>`
  <h2>${l(e)}</h2>
  <p class="account-intro">${e?`Vel eit passord for den nye kontoen din.`:`Vel eit nytt passord for kontoen din.`}</p>
  <form id="np-form">
    <div class="mb-3">
      <label class="form-label" for="np-password">${e?`Passord`:`Nytt passord`}</label>
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
  </form>${e&&!a.isNativePlatform()?`<p class="account-hint">eller</p>
         <button type="button" class="btn btn-google w-100" id="np-google">Bruk Google-kontoen din</button>`:``}`,f=e=>`
  <h2>${l(e)}</h2>
  <div class="alert alert-success">${e?`Kontoen er klar. Du er innlogga.`:`Passordet er endra. Du er innlogga.`}</div>
  <a href="#/minside" class="btn btn-primary">Gå til Min side</a>`;async function p(a){a.replaceChildren(o(`Opnar lenka…`));let l=c(`type`)===`invite`,p=c(`token_hash`);if(p){let{error:t}=await n(p,l?`invite`:`recovery`);t&&e(`nyttPassord.verifyEmailToken`,t)}let m=document.createElement(`div`);if(m.className=`container py-4 account-container`,!await r()){m.innerHTML=u(l),a.replaceChildren(m);return}m.innerHTML=d(l),a.replaceChildren(m);let h=m.querySelector(`#np-password`),g=m.querySelector(`#np-password2`),_=m.querySelector(`#np-error`),v=m.querySelector(`#np-submit`),y=m.querySelector(`#np-google`);y?.addEventListener(`click`,async()=>{_.classList.add(`d-none`),y.disabled=!0;let{error:n}=await t();n&&(e(`nyttPassord.linkGoogleIdentity`,n),_.textContent=`Kunne ikkje koble til Google: ${i(n)}`,_.classList.remove(`d-none`),y.disabled=!1)}),m.querySelector(`#np-form`).addEventListener(`submit`,async t=>{if(t.preventDefault(),_.classList.add(`d-none`),h.value!==g.value){_.textContent=`Passorda er ikkje like.`,_.classList.remove(`d-none`);return}v.disabled=!0;let{error:n}=await s(h.value);if(n){e(`nyttPassord.updatePassword`,n),_.textContent=`Kunne ikkje lagre passordet: ${i(n)}`,_.classList.remove(`d-none`),v.disabled=!1;return}m.innerHTML=f(l)})}export{p as render};