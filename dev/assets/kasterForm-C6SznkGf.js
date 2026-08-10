import{t as e}from"./logError-BO7RC_Nh.js";import{I as t,It as n,L as r,s as i}from"./index-CFlkG31m.js";import{a,m as o,n as s,s as c,t as l,u}from"./kasterService-Dbuq1Ip6.js";import{a as d,i as f,n as p,o as m,r as h,s as g,t as _}from"./_formButtons-DjKr_V-2.js";import{t as v}from"./LoadingState-C6NB62Ct.js";import{a as y}from"./klubbService-880HYSCf.js";import{t as b}from"./buildDropdownOptions-D6LaA75_.js";import{t as x}from"./formNum-HGeagI_O.js";async function S(S,C){let{container:w}=S;w.replaceChildren(v());let T=[],E=[],D=[];try{let e=await Promise.all([y(),a(),c()]);T=e[0].data,E=e[1].data,D=e[2].data}catch(t){e(`kasterForm.mount`,t),w.replaceChildren(n(`Kunne ikkje laste skjema.`));return}let O=null;if(C){let{data:e,error:i}=await u(C);if(i||!e){w.replaceChildren(n(`Utøvar ikkje funne.`));return}if(O=e,!await t()&&!await r(O.klubbid??void 0)){w.replaceChildren(n(`Ingen tilgang til denne utøvaren.`));return}}let k=O??{},A=T.map(e=>`<option value="${e.id}"${e.id===k.klubbid?` selected`:``}>${i(e.navn)}</option>`).join(``),{wrapper:j,headingHtml:M}=h(S);j.innerHTML=`
    ${M}
    <form id="thrower-form">
      <div class="admin-form-grid">
        ${d(`Fornavn*`,`<input type="text" class="form-control" name="fornavn" value="${i(k.fornavn)}" required>`)}
        ${d(`Etternavn*`,`<input type="text" class="form-control" name="etternavn" value="${i(k.etternavn)}" required>`)}
      </div>
      <div class="admin-form-grid">
        ${d(`Kjønn*`,`<select class="form-select" name="kjonnid">${b(D,k.kjonnid)}</select>`)}
        ${d(`Klasse`,`<select class="form-select" name="klasseid">${b(E,k.klasseid)}</select>`)}
      </div>
      ${d(`Klubb`,`<select class="form-select" name="klubbid"><option value="">— vel —</option>${A}</select>`)}
      <div class="mb-3 form-check">
        <input class="form-check-input" type="checkbox" name="eraktiv" id="eraktiv"${k.eraktiv===!1?``:` checked`}>
        <label class="form-check-label" for="eraktiv">Er aktiv</label>
      </div>
      <div class="admin-form-actions">
        <button type="submit" class="btn btn-primary">Lagre</button>
        ${S.onCancel?`<button type="button" id="cancel-button" class="btn btn-outline-secondary">Avbryt</button>`:``}
        ${C?`<button type="button" id="delete-button" class="btn btn-outline-danger ms-auto">Slett utøvar</button>`:``}
      </div>
    </form>`,w.replaceChildren(j),j.querySelector(`#thrower-form`).addEventListener(`submit`,async e=>{e.preventDefault();let t=new FormData(e.target),n={fornavn:t.get(`fornavn`).trim(),etternavn:t.get(`etternavn`).trim(),kjonnid:x(t.get(`kjonnid`)),klubbid:x(t.get(`klubbid`)),klasseid:x(t.get(`klasseid`)),eraktiv:t.get(`eraktiv`)===`on`},{data:r,error:i}=C?await o(C,n):await l(n);if(i){m(j,f(i));return}g(j,`Utøvaren er lagra.`),S.onSaved?.(r?.id??C,!C)}),_(j,S),p(j,{title:`Slett utøvar`,message:`Slett «${O?.fornavn} ${O?.etternavn}»? Dette kan ikkje angrast.`,remove:()=>s(C),onDeleted:S.onDeleted})}export{S as t};