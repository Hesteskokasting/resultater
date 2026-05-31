import{G as e,W as t,n,r}from"./index-IHBsWX3l.js";import{i,n as a,r as o,t as s}from"./adminForms-NOYImrG9.js";import{i as c,n as l}from"./klubbService-CjCA2v4v.js";import{t as u}from"./LoadingState-RVZNML7E.js";async function d(d,f={}){let p=f.id===void 0?void 0:Number(f.id);if(!p){d.replaceChildren(e(`Manglande ID.`));return}d.replaceChildren(u());let{data:m,error:h}=await l(p);if(h||!m){d.replaceChildren(e(`Klubb ikkje funne.`));return}if(!await n()&&!await r(p)){d.replaceChildren(e(`Ingen tilgang til denne klubben.`));return}d.innerHTML=`
    <div class="container py-4 admin-skjema-sm">
      <h2 class="mb-4">Rediger klubb: ${t(m.navn)}</h2>
      <form id="klubb-skjema">
        ${a(`Namn*`,`<input type="text" class="form-control" name="navn" value="${t(m.navn)}" required>`)}
        ${a(`Kortnavn`,`<input type="text" class="form-control" name="kortnavn" value="${t(m.kortnavn)}">`)}
        ${a(`Logo-URL`,`<input type="url" class="form-control" name="logourl" value="${t(m.logourl)}">`)}
        <div class="mb-3 form-check">
          <input class="form-check-input" type="checkbox" name="eraktiv" id="eraktiv"${m.eraktiv?` checked`:``}>
          <label class="form-check-label" for="eraktiv">Er aktiv</label>
        </div>
        <button type="submit" class="btn btn-primary mt-2">Lagre</button>
      </form>
    </div>`,d.querySelector(`#klubb-skjema`).addEventListener(`submit`,async e=>{e.preventDefault();let t=new FormData(e.target),{error:n}=await c(p,{navn:t.get(`navn`).trim(),kortnavn:t.get(`kortnavn`).trim(),logourl:t.get(`logourl`).trim()||null,eraktiv:t.get(`eraktiv`)===`on`});if(n){o(d,s(n));return}i(d,`Klubben er lagra.`)})}export{d as render};