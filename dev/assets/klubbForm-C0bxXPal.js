import{O as e,Vt as t,f as n,h as r,k as i,vr as a,yr as o}from"./index-DSCLt71t.js";import{i as s,o as c,t as l}from"./klubbService-pPakrKDt.js";import{a as u,i as d,r as f,t as p}from"./_formButtons-DA7uj7lV.js";async function m(m,h){let{container:g}=m;g.replaceChildren(o());let _=null;if(h){let{data:t,error:n}=await s(h);if(n||!t){g.replaceChildren(a(`Klubb ikkje funne.`));return}if(_=t,!await e()&&!await i(h)){g.replaceChildren(a(`Ingen tilgang til denne klubben.`));return}}else if(!await e()){g.replaceChildren(a(`Ingen tilgang.`));return}let{wrapper:v,headingHtml:y}=d(m);v.innerHTML=`
    ${y}
    <form id="club-form">
      <div class="admin-form-grid">
        ${f(`Namn*`,`<input type="text" class="form-control" name="navn" value="${n(_?.navn)}" required>`)}
        ${f(`Kortnavn`,`<input type="text" class="form-control" name="kortnavn" value="${n(_?.kortnavn)}">`)}
      </div>
      ${f(`Logo-URL`,`<input type="url" class="form-control" name="logourl" value="${n(_?.logourl)}">`)}
      <div class="mb-3 form-check">
        <input class="form-check-input" type="checkbox" name="eraktiv" id="eraktiv"${_===null||_.eraktiv?` checked`:``}>
        <label class="form-check-label" for="eraktiv">Er aktiv</label>
      </div>
      <div class="admin-form-actions">
        <button type="submit" class="btn btn-primary">Lagre</button>
        ${m.onCancel?`<button type="button" id="cancel-button" class="btn btn-outline-secondary">Avbryt</button>`:``}
      </div>
    </form>`,g.replaceChildren(v),v.querySelector(`#club-form`).addEventListener(`submit`,async e=>{e.preventDefault();let n=new FormData(e.target),i={navn:n.get(`navn`).trim(),kortnavn:n.get(`kortnavn`).trim(),logourl:n.get(`logourl`).trim()||null,eraktiv:n.get(`eraktiv`)===`on`};if(h){let{error:e}=await c(h,i);if(e){u(v,t(e));return}r(`Klubben er lagra.`,`success`),m.onSaved?.(h,!1);return}let{data:a,error:o}=await l(i);if(o){u(v,t(o));return}r(`Klubben er oppretta.`,`success`),m.onSaved?.(a.id,!0)}),p(v,m)}export{m as t};