import{t as e}from"./logError-ByTg738k.js";import{E as t,L as n,Nt as r,R as i,dr as a}from"./index-BSSvcWYo.js";import{t as o}from"./navigation-DSwGXsno.js";var s=`
  <h2>Nytt passord</h2>
  <div class="alert alert-danger">Lenka er ugyldig eller har gått ut. Ber du om ei ny lenke, må du
     opne den i same nettlesar som du ba om den frå.</div>
  <a href="#/logginn" class="btn btn-primary">Tilbake til innlogging</a>`,c=`
  <h2>Nytt passord</h2>
  <p class="account-intro">Vel eit nytt passord for kontoen din.</p>
  <form id="np-form">
    <div class="mb-3">
      <label class="form-label" for="np-password">Nytt passord</label>
      <input type="password" class="form-control" id="np-password" required
             autocomplete="new-password" minlength="8">
    </div>
    <div class="mb-3">
      <label class="form-label" for="np-password2">Gjenta nytt passord</label>
      <input type="password" class="form-control" id="np-password2" required
             autocomplete="new-password" minlength="8">
    </div>
    <div id="np-error" class="alert alert-danger d-none"></div>
    <button type="submit" class="btn btn-primary w-100" id="np-submit">Lagre nytt passord</button>
  </form>`,l=`
  <h2>Nytt passord</h2>
  <div class="alert alert-success">Passordet er endra. Du er innlogga.</div>
  <a href="#/minside" class="btn btn-primary">Gå til Min side</a>`;async function u(u){u.replaceChildren(a(`Opnar lenka…`));let d=o(`token_hash`);if(d){let{error:t}=await i(d);t&&e(`nyttPassord.verifyRecoveryToken`,t)}let f=document.createElement(`div`);if(f.className=`container py-4 account-container`,!await t()){f.innerHTML=s,u.replaceChildren(f);return}f.innerHTML=c,u.replaceChildren(f);let p=f.querySelector(`#np-password`),m=f.querySelector(`#np-password2`),h=f.querySelector(`#np-error`),g=f.querySelector(`#np-submit`);f.querySelector(`#np-form`).addEventListener(`submit`,async t=>{if(t.preventDefault(),h.classList.add(`d-none`),p.value!==m.value){h.textContent=`Passorda er ikkje like.`,h.classList.remove(`d-none`);return}g.disabled=!0;let{error:i}=await n(p.value);if(i){e(`nyttPassord.updatePassword`,i),h.textContent=`Kunne ikkje lagre passordet: ${r(i)}`,h.classList.remove(`d-none`),g.disabled=!1;return}f.innerHTML=l})}export{u as render};