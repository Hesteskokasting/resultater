import{t as e}from"./logError-CB4-2Lin.js";import{L as t,Lt as n,R as r,c as i}from"./index-fkSDkKQN.js";import{a,i as o,n as s,o as c,r as l,s as u,t as d}from"./_formButtons-CaE5Ei6s.js";import{t as f}from"./LoadingState-C6NB62Ct.js";import{a as p}from"./klubbService-BuTqcngo.js";import{t as m}from"./buildDropdownOptions-DBxqLyG8.js";import{t as h}from"./formNum-HGeagI_O.js";import{a as g,m as _,n as v,s as y,t as b,u as x}from"./kasterService-D9jqvobU.js";async function S(S,C){let{container:w}=S;w.replaceChildren(f());let T=[],E=[],D=[];try{let e=await Promise.all([p(),g(),y()]);T=e[0].data,E=e[1].data,D=e[2].data}catch(t){e(`kasterForm.mount`,t),w.replaceChildren(n(`Kunne ikkje laste skjema.`));return}let O=null;if(C){let{data:e,error:i}=await x(C);if(i||!e){w.replaceChildren(n(`Utøvar ikkje funne.`));return}if(O=e,!await t()&&!await r(O.klubbid??void 0)){w.replaceChildren(n(`Ingen tilgang til denne utøvaren.`));return}}let k=O??{},A=T.map(e=>`<option value="${e.id}"${e.id===k.klubbid?` selected`:``}>${i(e.navn)}</option>`).join(``),{wrapper:j,headingHtml:M}=l(S);j.innerHTML=`
    ${M}
    <form id="thrower-form">
      <div class="admin-form-grid">
        ${a(`Fornavn*`,`<input type="text" class="form-control" name="fornavn" value="${i(k.fornavn)}" required>`)}
        ${a(`Etternavn*`,`<input type="text" class="form-control" name="etternavn" value="${i(k.etternavn)}" required>`)}
      </div>
      <div class="admin-form-grid">
        ${a(`Kjønn*`,`<select class="form-select" name="kjonnid">${m(D,k.kjonnid)}</select>`)}
        ${a(`Klasse`,`<select class="form-select" name="klasseid">${m(E,k.klasseid)}</select>`)}
      </div>
      ${a(`Klubb`,`<select class="form-select" name="klubbid"><option value="">— vel —</option>${A}</select>`)}
      <div class="mb-3 form-check">
        <input class="form-check-input" type="checkbox" name="eraktiv" id="eraktiv"${k.eraktiv===!1?``:` checked`}>
        <label class="form-check-label" for="eraktiv">Er aktiv</label>
      </div>
      <div class="admin-form-actions">
        <button type="submit" class="btn btn-primary">Lagre</button>
        ${S.onCancel?`<button type="button" id="cancel-button" class="btn btn-outline-secondary">Avbryt</button>`:``}
        ${C?`<button type="button" id="delete-button" class="btn btn-outline-danger ms-auto">Slett utøvar</button>`:``}
      </div>
    </form>`,w.replaceChildren(j),j.querySelector(`#thrower-form`).addEventListener(`submit`,async e=>{e.preventDefault();let t=new FormData(e.target),n={fornavn:t.get(`fornavn`).trim(),etternavn:t.get(`etternavn`).trim(),kjonnid:h(t.get(`kjonnid`)),klubbid:h(t.get(`klubbid`)),klasseid:h(t.get(`klasseid`)),eraktiv:t.get(`eraktiv`)===`on`},{data:r,error:i}=C?await _(C,n):await b(n);if(i){c(j,o(i));return}u(j,`Utøvaren er lagra.`),S.onSaved?.(r?.id??C,!C)}),d(j,S),s(j,{title:`Slett utøvar`,message:`Slett «${O?.fornavn} ${O?.etternavn}»? Dette kan ikkje angrast.`,remove:()=>v(C),onDeleted:S.onDeleted})}export{S as t};