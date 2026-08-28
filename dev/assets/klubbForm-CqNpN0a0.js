import{Nt as e,O as t,dr as n,f as r,h as i,k as a,ur as o}from"./index-BSSvcWYo.js";import{i as s,o as c,t as l}from"./klubbService-pPakrKDt.js";import{a as u,i as d,r as f,t as p}from"./_formButtons-yop05IH4.js";async function m(m,h){let{container:g}=m;g.replaceChildren(n());let _=null;if(h){let{data:e,error:n}=await s(h);if(n||!e){g.replaceChildren(o(`Klubb ikkje funne.`));return}if(_=e,!await t()&&!await a(h)){g.replaceChildren(o(`Ingen tilgang til denne klubben.`));return}}else if(!await t()){g.replaceChildren(o(`Ingen tilgang.`));return}let{wrapper:v,headingHtml:y}=d(m);v.innerHTML=`
    ${y}
    <form id="club-form">
      <div class="admin-form-grid">
        ${f(`Namn*`,`<input type="text" class="form-control" name="navn" value="${r(_?.navn)}" required>`)}
        ${f(`Kortnavn`,`<input type="text" class="form-control" name="kortnavn" value="${r(_?.kortnavn)}">`)}
      </div>
      ${f(`Logo-URL`,`<input type="url" class="form-control" name="logourl" value="${r(_?.logourl)}">`)}
      <div class="mb-3 form-check">
        <input class="form-check-input" type="checkbox" name="eraktiv" id="eraktiv"${_===null||_.eraktiv?` checked`:``}>
        <label class="form-check-label" for="eraktiv">Er aktiv</label>
      </div>
      <div class="admin-form-actions">
        <button type="submit" class="btn btn-primary">Lagre</button>
        ${m.onCancel?`<button type="button" id="cancel-button" class="btn btn-outline-secondary">Avbryt</button>`:``}
      </div>
    </form>`,g.replaceChildren(v),v.querySelector(`#club-form`).addEventListener(`submit`,async t=>{t.preventDefault();let n=new FormData(t.target),r={navn:n.get(`navn`).trim(),kortnavn:n.get(`kortnavn`).trim(),logourl:n.get(`logourl`).trim()||null,eraktiv:n.get(`eraktiv`)===`on`};if(h){let{error:t}=await c(h,r);if(t){u(v,e(t));return}i(`Klubben er lagra.`,`success`),m.onSaved?.(h,!1);return}let{data:a,error:o}=await l(r);if(o){u(v,e(o));return}i(`Klubben er oppretta.`,`success`),m.onSaved?.(a.id,!0)}),p(v,m)}export{m as t};