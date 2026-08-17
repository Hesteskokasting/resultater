import{t as e}from"./escHtml-CfOHO0aD.js";import{D as t,Mt as n,O as r,m as i,mr as a,pr as o}from"./index-CZtrUdko.js";import{i as s,o as c,t as l}from"./klubbService-3zTTaX6v.js";import{a as u,i as d,r as f,t as p}from"./_formButtons-BIVSxNE1.js";async function m(m,h){let{container:g}=m;g.replaceChildren(a());let _=null;if(h){let{data:e,error:n}=await s(h);if(n||!e){g.replaceChildren(o(`Klubb ikkje funne.`));return}if(_=e,!await t()&&!await r(h)){g.replaceChildren(o(`Ingen tilgang til denne klubben.`));return}}else if(!await t()){g.replaceChildren(o(`Ingen tilgang.`));return}let{wrapper:v,headingHtml:y}=d(m);v.innerHTML=`
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
    </form>`,g.replaceChildren(v),v.querySelector(`#club-form`).addEventListener(`submit`,async e=>{e.preventDefault();let t=new FormData(e.target),r={navn:t.get(`navn`).trim(),kortnavn:t.get(`kortnavn`).trim(),logourl:t.get(`logourl`).trim()||null,eraktiv:t.get(`eraktiv`)===`on`};if(h){let{error:e}=await c(h,r);if(e){u(v,n(e));return}i(`Klubben er lagra.`,`success`),m.onSaved?.(h,!1);return}let{data:a,error:o}=await l(r);if(o){u(v,n(o));return}i(`Klubben er oppretta.`,`success`),m.onSaved?.(a.id,!0)}),p(v,m)}export{m as t};