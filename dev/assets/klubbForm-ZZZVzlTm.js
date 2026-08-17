import{n as e}from"./logError-DE4meABt.js";import{D as t,E as n,dr as r,fr as i,kt as a,p as o}from"./index-C5SiCpc_.js";import{i as s,o as c,t as l}from"./klubbService-Dj0rmPbi.js";import{a as u,i as d,r as f,t as p}from"./_formButtons-CWtqV9Kk.js";async function m(m,h){let{container:g}=m;g.replaceChildren(i());let _=null;if(h){let{data:e,error:i}=await s(h);if(i||!e){g.replaceChildren(r(`Klubb ikkje funne.`));return}if(_=e,!await n()&&!await t(h)){g.replaceChildren(r(`Ingen tilgang til denne klubben.`));return}}else if(!await n()){g.replaceChildren(r(`Ingen tilgang.`));return}let{wrapper:v,headingHtml:y}=d(m);v.innerHTML=`
    ${y}
    <form id="club-form">
      <div class="admin-form-grid">
        ${f(`Namn*`,`<input type="text" class="form-control" name="navn" value="${e(_?.navn)}" required>`)}
        ${f(`Kortnavn`,`<input type="text" class="form-control" name="kortnavn" value="${e(_?.kortnavn)}">`)}
      </div>
      ${f(`Logo-URL`,`<input type="url" class="form-control" name="logourl" value="${e(_?.logourl)}">`)}
      <div class="mb-3 form-check">
        <input class="form-check-input" type="checkbox" name="eraktiv" id="eraktiv"${_===null||_.eraktiv?` checked`:``}>
        <label class="form-check-label" for="eraktiv">Er aktiv</label>
      </div>
      <div class="admin-form-actions">
        <button type="submit" class="btn btn-primary">Lagre</button>
        ${m.onCancel?`<button type="button" id="cancel-button" class="btn btn-outline-secondary">Avbryt</button>`:``}
      </div>
    </form>`,g.replaceChildren(v),v.querySelector(`#club-form`).addEventListener(`submit`,async e=>{e.preventDefault();let t=new FormData(e.target),n={navn:t.get(`navn`).trim(),kortnavn:t.get(`kortnavn`).trim(),logourl:t.get(`logourl`).trim()||null,eraktiv:t.get(`eraktiv`)===`on`};if(h){let{error:e}=await c(h,n);if(e){u(v,a(e));return}o(`Klubben er lagra.`,`success`),m.onSaved?.(h,!1);return}let{data:r,error:i}=await l(n);if(i){u(v,a(i));return}o(`Klubben er oppretta.`,`success`),m.onSaved?.(r.id,!0)}),p(v,m)}export{m as t};