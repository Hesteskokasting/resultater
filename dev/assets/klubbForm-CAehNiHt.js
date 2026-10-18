import{D as e,Sr as t,U as n,Ut as r,f as i,g as a,xr as o}from"./index-D6KMvqKH.js";import{i as s,o as c,t as l}from"./klubbService-B5pJ_Snb.js";import{a as u,i as d,r as f,t as p}from"./_formButtons-BgpBtTPb.js";async function m(m,h){let{container:g}=m;g.replaceChildren(t());let _=await e(),v=null;if(h){let{data:e,error:t}=await s(h);if(t||!e){g.replaceChildren(o(`Klubb ikkje funne.`));return}if(v=e,!n(_,h)){g.replaceChildren(o(`Ingen tilgang til denne klubben.`));return}}else if(_?.profil?.role!==`admin`){g.replaceChildren(o(`Ingen tilgang.`));return}let{wrapper:y,headingHtml:b}=d(m);y.innerHTML=`
    ${b}
    <form id="club-form">
      <div class="admin-form-grid">
        ${f(`Namn*`,`<input type="text" class="form-control" name="navn" value="${i(v?.navn)}" required>`)}
        ${f(`Kortnavn`,`<input type="text" class="form-control" name="kortnavn" value="${i(v?.kortnavn)}">`)}
      </div>
      ${f(`Logo-URL`,`<input type="url" class="form-control" name="logourl" value="${i(v?.logourl)}">`)}
      <div class="mb-3 form-check">
        <input class="form-check-input" type="checkbox" name="eraktiv" id="eraktiv"${v===null||v.eraktiv?` checked`:``}>
        <label class="form-check-label" for="eraktiv">Er aktiv</label>
      </div>
      <div class="admin-form-actions">
        <button type="submit" class="btn btn-primary">Lagre</button>
        ${m.onCancel?`<button type="button" id="cancel-button" class="btn btn-outline-secondary">Avbryt</button>`:``}
      </div>
    </form>`,g.replaceChildren(y),y.querySelector(`#club-form`).addEventListener(`submit`,async e=>{e.preventDefault();let t=new FormData(e.target),n={navn:t.get(`navn`).trim(),kortnavn:t.get(`kortnavn`).trim(),logourl:t.get(`logourl`).trim()||null,eraktiv:t.get(`eraktiv`)===`on`};if(h){let{error:e}=await c(h,n);if(e){u(y,r(e));return}a(`Klubben er lagra.`,`success`),m.onSaved?.(h,!1);return}let{data:i,error:o}=await l(n);if(o){u(y,r(o));return}a(`Klubben er oppretta.`,`success`),m.onSaved?.(i.id,!0)}),p(y,m)}export{m as t};