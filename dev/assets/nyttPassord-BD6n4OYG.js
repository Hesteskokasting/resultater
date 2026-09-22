import{t as e}from"./logError-ByTg738k.js";import{E as t,L as n,Nt as r,R as i,dr as a}from"./index-BdFDMJa0.js";import{t as o}from"./navigation-DSwGXsno.js";var s=e=>e?`Set passord`:`Nytt passord`,c=e=>`
  <h2>${s(e)}</h2>
  <div class="alert alert-danger">${e?`Invitasjonen er ugyldig eller har gått ut. Be om ein ny invitasjon.`:`Lenka er ugyldig eller har gått ut. Ber du om ei ny lenke, må du
         opne den i same nettlesar som du ba om den frå.`}</div>
  <a href="#/logginn" class="btn btn-primary">Tilbake til innlogging</a>`,l=e=>`
  <h2>${s(e)}</h2>
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
  </form>`,u=e=>`
  <h2>${s(e)}</h2>
  <div class="alert alert-success">${e?`Kontoen er klar. Du er innlogga.`:`Passordet er endra. Du er innlogga.`}</div>
  <a href="#/minside" class="btn btn-primary">Gå til Min side</a>`;async function d(s){s.replaceChildren(a(`Opnar lenka…`));let d=o(`type`)===`invite`,f=o(`token_hash`);if(f){let{error:t}=await i(f,d?`invite`:`recovery`);t&&e(`nyttPassord.verifyEmailToken`,t)}let p=document.createElement(`div`);if(p.className=`container py-4 account-container`,!await t()){p.innerHTML=c(d),s.replaceChildren(p);return}p.innerHTML=l(d),s.replaceChildren(p);let m=p.querySelector(`#np-password`),h=p.querySelector(`#np-password2`),g=p.querySelector(`#np-error`),_=p.querySelector(`#np-submit`);p.querySelector(`#np-form`).addEventListener(`submit`,async t=>{if(t.preventDefault(),g.classList.add(`d-none`),m.value!==h.value){g.textContent=`Passorda er ikkje like.`,g.classList.remove(`d-none`);return}_.disabled=!0;let{error:i}=await n(m.value);if(i){e(`nyttPassord.updatePassword`,i),g.textContent=`Kunne ikkje lagre passordet: ${r(i)}`,g.classList.remove(`d-none`),_.disabled=!1;return}p.innerHTML=u(d)})}export{d as render};