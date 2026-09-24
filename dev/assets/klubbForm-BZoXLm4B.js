import{Bt as e,E as t,H as n,_r as r,f as i,h as a,vr as o}from"./index-ScyQGOLm.js";import{i as s,o as c,t as l}from"./klubbService-pPakrKDt.js";import{a as u,i as d,r as f,t as p}from"./_formButtons-DPHgHOKG.js";async function m(m,h){let{container:g}=m;g.replaceChildren(o());let _=await t(),v=null;if(h){let{data:e,error:t}=await s(h);if(t||!e){g.replaceChildren(r(`Klubb ikkje funne.`));return}if(v=e,!n(_,h)){g.replaceChildren(r(`Ingen tilgang til denne klubben.`));return}}else if(_?.profil?.role!==`admin`){g.replaceChildren(r(`Ingen tilgang.`));return}let{wrapper:y,headingHtml:b}=d(m);y.innerHTML=`
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
    </form>`,g.replaceChildren(y),y.querySelector(`#club-form`).addEventListener(`submit`,async t=>{t.preventDefault();let n=new FormData(t.target),r={navn:n.get(`navn`).trim(),kortnavn:n.get(`kortnavn`).trim(),logourl:n.get(`logourl`).trim()||null,eraktiv:n.get(`eraktiv`)===`on`};if(h){let{error:t}=await c(h,r);if(t){u(y,e(t));return}a(`Klubben er lagra.`,`success`),m.onSaved?.(h,!1);return}let{data:i,error:o}=await l(r);if(o){u(y,e(o));return}a(`Klubben er oppretta.`,`success`),m.onSaved?.(i.id,!0)}),p(y,m)}export{m as t};