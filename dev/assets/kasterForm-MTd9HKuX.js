import{t as e}from"./logError-CTQ3euge.js";import{t}from"./escHtml-CfOHO0aD.js";import{D as n,Mt as r,O as i,m as a,mr as o,pr as s}from"./index-NvMaOunS.js";import{a as c}from"./klubbService-3zTTaX6v.js";import{a as l,i as u,n as d,r as f,t as p}from"./_formButtons-ep303hkk.js";import{t as m}from"./buildDropdownOptions-BVCmx19F.js";import{t as h}from"./formNum-HGeagI_O.js";import{a as g,m as _,n as v,s as y,t as b,u as x}from"./kasterService-DIBRsqwT.js";async function S(S,C){let{container:w}=S;w.replaceChildren(o());let T=[],E=[],D=[];try{let e=await Promise.all([c(),g(),y()]);T=e[0].data,E=e[1].data,D=e[2].data}catch(t){e(`kasterForm.mount`,t),w.replaceChildren(s(`Kunne ikkje laste skjema.`));return}let O=null;if(C){let{data:e,error:t}=await x(C);if(t||!e){w.replaceChildren(s(`Utøvar ikkje funne.`));return}if(O=e,!await n()&&!await i(O.klubbid??void 0)){w.replaceChildren(s(`Ingen tilgang til denne utøvaren.`));return}}let k=O??{},A=T.map(e=>`<option value="${e.id}"${e.id===k.klubbid?` selected`:``}>${t(e.navn)}</option>`).join(``),{wrapper:j,headingHtml:M}=u(S);j.innerHTML=`
    ${M}
    <form id="thrower-form">
      <div class="admin-form-grid">
        ${f(`Fornavn*`,`<input type="text" class="form-control" name="fornavn" value="${t(k.fornavn)}" required>`)}
        ${f(`Etternavn*`,`<input type="text" class="form-control" name="etternavn" value="${t(k.etternavn)}" required>`)}
      </div>
      <div class="admin-form-grid">
        ${f(`Kjønn*`,`<select class="form-select" name="kjonnid">${m(D,k.kjonnid)}</select>`)}
        ${f(`Klasse`,`<select class="form-select" name="klasseid">${m(E,k.klasseid)}</select>`)}
      </div>
      ${f(`Klubb`,`<select class="form-select" name="klubbid"><option value="">— vel —</option>${A}</select>`)}
      <div class="mb-3 form-check">
        <input class="form-check-input" type="checkbox" name="eraktiv" id="eraktiv"${k.eraktiv===!1?``:` checked`}>
        <label class="form-check-label" for="eraktiv">Er aktiv</label>
      </div>
      <div class="admin-form-actions">
        <button type="submit" class="btn btn-primary">Lagre</button>
        ${S.onCancel?`<button type="button" id="cancel-button" class="btn btn-outline-secondary">Avbryt</button>`:``}
        ${C?`<button type="button" id="delete-button" class="btn btn-outline-danger ms-auto">Slett utøvar</button>`:``}
      </div>
    </form>`,w.replaceChildren(j),j.querySelector(`#thrower-form`).addEventListener(`submit`,async e=>{e.preventDefault();let t=new FormData(e.target),n={fornavn:t.get(`fornavn`).trim(),etternavn:t.get(`etternavn`).trim(),kjonnid:h(t.get(`kjonnid`)),klubbid:h(t.get(`klubbid`)),klasseid:h(t.get(`klasseid`)),eraktiv:t.get(`eraktiv`)===`on`},{data:i,error:o}=C?await _(C,n):await b(n);if(o){l(j,r(o));return}a(C?`Utøvaren er lagra.`:`Utøvaren er oppretta.`,`success`),S.onSaved?.(i?.id??C,!C)}),p(j,S),d(j,{title:`Slett utøvar`,message:`Slett «${O?.fornavn} ${O?.etternavn}»? Dette kan ikkje angrast.`,remove:()=>v(C),onDeleted:S.onDeleted})}export{S as t};