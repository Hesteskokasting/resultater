import{t as e}from"./logError-DhxY2JQv.js";import{n as t,t as n}from"./authService-CcI7FLUE.js";import{J as r,Y as i,y as a}from"./index-D1GzXyr3.js";import{i as o,n as s,r as c,t as l}from"./adminForms-BlhJ8Vks.js";import{r as u}from"./klubbService-avZCVzgk.js";import{c as d,d as f,f as p,l as m,n as h,p as g}from"./kasterService-D1rq1bik.js";import{t as _}from"./LoadingState-xRmJ3K_t.js";import{t as v}from"./buildDropdownOptions-CFJw0343.js";import{t as y}from"./formNum-BZkf_zqu.js";async function b(b,x={}){let S=x.id===void 0?void 0:Number(x.id);b.replaceChildren(_());let C=[],w=[],T=[];try{let e=await Promise.all([u(),m(),d()]);C=e[0].data,w=e[1].data,T=e[2].data}catch(t){e(`kasteradmin.render`,t),b.replaceChildren(i(`Kunne ikkje laste skjema.`));return}let E=null;if(S){let{data:e,error:r}=await h(S);if(r||!e){b.replaceChildren(i(`Utøvar ikkje funne.`));return}if(E=e,!await n()&&!await t(E.klubbid??void 0)){b.replaceChildren(i(`Ingen tilgang til denne utøvaren.`));return}}let D=S?`Rediger utøvar: ${E?`${r(E.fornavn)} ${r(E.etternavn)}`:``}`:`Ny utøvar`,O=E??{};b.innerHTML=`
    <div class="container py-4 admin-skjema-md">
      <h2 class="mb-4">${D}</h2>
      <form id="kaster-skjema">
        ${s(`Fornavn*`,`<input type="text" class="form-control" name="fornavn" value="${r(O.fornavn)}" required>`)}
        ${s(`Etternavn*`,`<input type="text" class="form-control" name="etternavn" value="${r(O.etternavn)}" required>`)}
        ${s(`Kjønn*`,`<select class="form-select" name="kjonnid">${v(T,O.kjonnid)}</select>`)}
        ${s(`Klubb`,`<select class="form-select" name="klubbid"><option value="">— vel —</option>${C.map(e=>`<option value="${e.id}"${e.id===O.klubbid?` selected`:``}>${r(e.navn)}</option>`).join(``)}</select>`)}
        ${s(`Klasse`,`<select class="form-select" name="klasseid">${v(w,O.klasseid)}</select>`)}
        ${s(`E-post`,`<input type="email" class="form-control" name="epost" value="${r(O.epost)}">`)}
        ${s(`Telefon`,`<input type="tel" class="form-control" name="telefon" value="${r(O.telefon)}">`)}
        ${s(`Medlemsnummer`,`<input type="number" class="form-control" name="medlemsnummer" value="${O.medlemsnummer??``}">`)}
        <div class="mb-3 form-check">
          <input class="form-check-input" type="checkbox" name="eraktiv" id="eraktiv"${O.eraktiv===!1?``:` checked`}>
          <label class="form-check-label" for="eraktiv">Er aktiv</label>
        </div>
        <div class="d-flex gap-2 mt-4">
          <button type="submit" class="btn btn-primary">Lagre</button>
          ${S?`<button type="button" id="slett-knapp" class="btn btn-outline-danger ms-auto">Slett utøvar</button>`:``}
        </div>
      </form>
    </div>`,b.querySelector(`#kaster-skjema`).addEventListener(`submit`,async e=>{e.preventDefault();let t=new FormData(e.target),n={fornavn:t.get(`fornavn`).trim(),etternavn:t.get(`etternavn`).trim(),kjonnid:y(t.get(`kjonnid`)),klubbid:y(t.get(`klubbid`)),klasseid:y(t.get(`klasseid`)),epost:t.get(`epost`).trim()||null,telefon:t.get(`telefon`).trim()||null,medlemsnummer:t.get(`medlemsnummer`)?Number(t.get(`medlemsnummer`)):null,eraktiv:t.get(`eraktiv`)===`on`},{data:r,error:i}=S?await f(S,n):await p(n);if(i){c(b,l(i));return}o(b,`Utøvaren er lagra.`),S||setTimeout(()=>{location.hash=`#/kaster/${r.id}/admin`},1500)}),b.querySelector(`#slett-knapp`)?.addEventListener(`click`,async()=>{if(!await a({title:`Slett utøvar`,message:`Slett «${E?.fornavn} ${E?.etternavn}»? Dette kan ikkje angrast.`,danger:!0}))return;let{error:e}=await g(S);if(e){c(b,l(e));return}location.hash=`#/kastere`})}export{b as render};