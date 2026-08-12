import{L as e,Lt as t,R as n,c as r}from"./index-fkSDkKQN.js";import{a as i,i as a,o,r as s,s as c,t as l}from"./_formButtons-CaE5Ei6s.js";import{t as u}from"./LoadingState-C6NB62Ct.js";import{i as d,o as f,t as p}from"./klubbService-BuTqcngo.js";async function m(m,h){let{container:g}=m;g.replaceChildren(u());let _=null;if(h){let{data:r,error:i}=await d(h);if(i||!r){g.replaceChildren(t(`Klubb ikkje funne.`));return}if(_=r,!await e()&&!await n(h)){g.replaceChildren(t(`Ingen tilgang til denne klubben.`));return}}else if(!await e()){g.replaceChildren(t(`Ingen tilgang.`));return}let{wrapper:v,headingHtml:y}=s(m);v.innerHTML=`
    ${y}
    <form id="club-form">
      <div class="admin-form-grid">
        ${i(`Namn*`,`<input type="text" class="form-control" name="navn" value="${r(_?.navn)}" required>`)}
        ${i(`Kortnavn`,`<input type="text" class="form-control" name="kortnavn" value="${r(_?.kortnavn)}">`)}
      </div>
      ${i(`Logo-URL`,`<input type="url" class="form-control" name="logourl" value="${r(_?.logourl)}">`)}
      <div class="mb-3 form-check">
        <input class="form-check-input" type="checkbox" name="eraktiv" id="eraktiv"${_===null||_.eraktiv?` checked`:``}>
        <label class="form-check-label" for="eraktiv">Er aktiv</label>
      </div>
      <div class="admin-form-actions">
        <button type="submit" class="btn btn-primary">Lagre</button>
        ${m.onCancel?`<button type="button" id="cancel-button" class="btn btn-outline-secondary">Avbryt</button>`:``}
      </div>
    </form>`,g.replaceChildren(v),v.querySelector(`#club-form`).addEventListener(`submit`,async e=>{e.preventDefault();let t=new FormData(e.target),n={navn:t.get(`navn`).trim(),kortnavn:t.get(`kortnavn`).trim(),logourl:t.get(`logourl`).trim()||null,eraktiv:t.get(`eraktiv`)===`on`};if(h){let{error:e}=await f(h,n);if(e){o(v,a(e));return}c(v,`Klubben er lagra.`),m.onSaved?.(h,!1);return}let{data:r,error:i}=await p(n);if(i){o(v,a(i));return}c(v,`Klubben er oppretta.`),m.onSaved?.(r.id,!0)}),l(v,m)}export{m as t};