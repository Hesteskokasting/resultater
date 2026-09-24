import{t as e}from"./logError-ByTg738k.js";import{Bt as t,E as n,H as r,_r as i,f as a,h as o,vr as s}from"./index-ScyQGOLm.js";import{a as c}from"./klubbService-pPakrKDt.js";import{a as l,i as u,n as d,r as f,t as p}from"./_formButtons-DPHgHOKG.js";import{t as m}from"./dropdown-BfusA0XK.js";import{t as h}from"./formNum-HGeagI_O.js";import{a as g,m as _,n as v,s as y,t as b,u as x}from"./kasterService-y8FvzW53.js";async function S(S,C){let{container:w}=S;w.replaceChildren(s());let T=[],E=[],D=[];try{let e=await Promise.all([c(),g(),y()]);T=e[0].data,E=e[1].data,D=e[2].data}catch(t){e(`kasterForm.mount`,t),w.replaceChildren(i(`Kunne ikkje laste skjema.`));return}let O=await n(),k=O?.profil?.role===`admin`,A=null;if(C){let{data:e,error:t}=await x(C);if(t||!e){w.replaceChildren(i(`Utøvar ikkje funne.`));return}if(A=e,!r(O,A.klubbid)){w.replaceChildren(i(`Ingen tilgang til denne utøvaren.`));return}}let j=A??{},M=O?.club??null,N=j.klubbid??(k?null:M),P=k||C?`<option value="">${k?`— vel —`:`Ingen klubb`}</option>`:``,F=(k?T:T.filter(e=>e.id===M)).map(e=>`<option value="${e.id}"${e.id===N?` selected`:``}>${a(e.navn)}</option>`).join(``),{wrapper:I,headingHtml:L}=u(S);I.innerHTML=`
    ${L}
    <form id="thrower-form">
      <div class="admin-form-grid">
        ${f(`Fornavn*`,`<input type="text" class="form-control" name="fornavn" value="${a(j.fornavn)}" required>`)}
        ${f(`Etternavn*`,`<input type="text" class="form-control" name="etternavn" value="${a(j.etternavn)}" required>`)}
      </div>
      <div class="admin-form-grid">
        ${f(`Kjønn*`,`<select class="form-select" name="kjonnid">${m(D,j.kjonnid)}</select>`)}
        ${f(`Klasse`,`<select class="form-select" name="klasseid">${m(E,j.klasseid)}</select>`)}
      </div>
      ${f(`Klubb`,`<select class="form-select" name="klubbid">${P}${F}</select>`)}
      <div class="mb-3 form-check">
        <input class="form-check-input" type="checkbox" name="eraktiv" id="eraktiv"${j.eraktiv===!1?``:` checked`}>
        <label class="form-check-label" for="eraktiv">Er aktiv</label>
      </div>
      <div class="admin-form-actions">
        <button type="submit" class="btn btn-primary">Lagre</button>
        ${S.onCancel?`<button type="button" id="cancel-button" class="btn btn-outline-secondary">Avbryt</button>`:``}
        ${C&&k?`<button type="button" id="delete-button" class="btn btn-outline-danger ms-auto">Slett utøvar</button>`:``}
      </div>
    </form>`,w.replaceChildren(I),I.querySelector(`#thrower-form`).addEventListener(`submit`,async e=>{e.preventDefault();let n=new FormData(e.target),r={fornavn:n.get(`fornavn`).trim(),etternavn:n.get(`etternavn`).trim(),kjonnid:h(n.get(`kjonnid`)),klubbid:h(n.get(`klubbid`)),klasseid:h(n.get(`klasseid`)),eraktiv:n.get(`eraktiv`)===`on`},{data:i,error:a}=C?await _(C,r):await b(r);if(a){l(I,t(a));return}o(C?`Utøvaren er lagra.`:`Utøvaren er oppretta.`,`success`),S.onSaved?.(i?.id??C,!C)}),p(I,S),d(I,{title:`Slett utøvar`,message:`Slett «${A?.fornavn} ${A?.etternavn}»? Dette kan ikkje angrast.`,remove:()=>v(C),onDeleted:S.onDeleted})}export{S as t};