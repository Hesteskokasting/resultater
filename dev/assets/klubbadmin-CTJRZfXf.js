import{Ct as e,O as t,St as n,k as r}from"./index-_Sbv_Pyg.js";import{i,n as a,r as o,t as s}from"./adminForms-BgTw4KBl.js";import{i as c,n as l}from"./klubbService-CaXvOdL5.js";import{t as u}from"./LoadingState-BWi0wPLz.js";async function d(d,f={}){let p=f.id===void 0?void 0:Number(f.id);if(!p){d.replaceChildren(e(`Manglande ID.`));return}d.replaceChildren(u());let{data:m,error:h}=await l(p);if(h||!m){d.replaceChildren(e(`Klubb ikkje funne.`));return}if(!await t()&&!await r(p)){d.replaceChildren(e(`Ingen tilgang til denne klubben.`));return}d.innerHTML=`
    <div class="container py-4 admin-form-sm">
      <h2 class="mb-4">Rediger klubb: ${n(m.navn)}</h2>
      <form id="club-form">
        ${a(`Namn*`,`<input type="text" class="form-control" name="navn" value="${n(m.navn)}" required>`)}
        ${a(`Kortnavn`,`<input type="text" class="form-control" name="kortnavn" value="${n(m.kortnavn)}">`)}
        ${a(`Logo-URL`,`<input type="url" class="form-control" name="logourl" value="${n(m.logourl)}">`)}
        <div class="mb-3 form-check">
          <input class="form-check-input" type="checkbox" name="eraktiv" id="eraktiv"${m.eraktiv?` checked`:``}>
          <label class="form-check-label" for="eraktiv">Er aktiv</label>
        </div>
        <button type="submit" class="btn btn-primary mt-2">Lagre</button>
      </form>
    </div>`,d.querySelector(`#club-form`).addEventListener(`submit`,async e=>{e.preventDefault();let t=new FormData(e.target),{error:n}=await c(p,{navn:t.get(`navn`).trim(),kortnavn:t.get(`kortnavn`).trim(),logourl:t.get(`logourl`).trim()||null,eraktiv:t.get(`eraktiv`)===`on`});if(n){o(d,s(n));return}i(d,`Klubben er lagra.`)})}export{d as render};