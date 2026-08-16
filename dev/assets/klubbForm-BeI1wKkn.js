import{t as e}from"./escHtml-Z0YwDf7L.js";import{B as t,J as n,V as r,Xt as i,Y as a,Zt as o}from"./index-CY82xwnt.js";import{i as s,o as c,t as l}from"./klubbService-4kqWJyho.js";import{a as u,i as d,r as f,t as p}from"./_formButtons-DiDCxmS9.js";async function m(m,h){let{container:g}=m;g.replaceChildren(o());let _=null;if(h){let{data:e,error:t}=await s(h);if(t||!e){g.replaceChildren(i(`Klubb ikkje funne.`));return}if(_=e,!await n()&&!await a(h)){g.replaceChildren(i(`Ingen tilgang til denne klubben.`));return}}else if(!await n()){g.replaceChildren(i(`Ingen tilgang.`));return}let{wrapper:v,headingHtml:y}=d(m);v.innerHTML=`
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
    </form>`,g.replaceChildren(v),v.querySelector(`#club-form`).addEventListener(`submit`,async e=>{e.preventDefault();let n=new FormData(e.target),i={navn:n.get(`navn`).trim(),kortnavn:n.get(`kortnavn`).trim(),logourl:n.get(`logourl`).trim()||null,eraktiv:n.get(`eraktiv`)===`on`};if(h){let{error:e}=await c(h,i);if(e){u(v,t(e));return}r(`Klubben er lagra.`,`success`),m.onSaved?.(h,!1);return}let{data:a,error:o}=await l(i);if(o){u(v,t(o));return}r(`Klubben er oppretta.`,`success`),m.onSaved?.(a.id,!0)}),p(v,m)}export{m as t};