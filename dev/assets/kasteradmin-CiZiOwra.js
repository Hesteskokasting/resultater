import{t as e}from"./logError-D5z16FyH.js";import{O as t,St as n,k as r,w as i,xt as a}from"./index-CS17BQI3.js";import{i as o,n as s,r as c,t as l}from"./adminForms-BuuD3FDp.js";import{r as u}from"./klubbService-CaXvOdL5.js";import{a as d,l as f,n as p,p as m,s as h,t as g}from"./kasterService-B3gLOC11.js";import{t as _}from"./LoadingState-BWi0wPLz.js";import{t as v}from"./buildDropdownOptions-CY29-3cg.js";import{t as y}from"./formNum-DDzUPdUs.js";async function b(b,x={}){let S=x.id===void 0?void 0:Number(x.id);b.replaceChildren(_());let C=[],w=[],T=[];try{let e=await Promise.all([u(),d(),h()]);C=e[0].data,w=e[1].data,T=e[2].data}catch(t){e(`kasteradmin.render`,t),b.replaceChildren(n(`Kunne ikkje laste skjema.`));return}let E=null;if(S){let{data:e,error:i}=await f(S);if(i||!e){b.replaceChildren(n(`Utøvar ikkje funne.`));return}if(E=e,!await t()&&!await r(E.klubbid??void 0)){b.replaceChildren(n(`Ingen tilgang til denne utøvaren.`));return}}let D=S?`Rediger utøvar: ${E?`${a(E.fornavn)} ${a(E.etternavn)}`:``}`:`Ny utøvar`,O=E??{};b.innerHTML=`
    <div class="container py-4 admin-form-md">
      <h2 class="mb-4">${D}</h2>
      <form id="thrower-form">
        ${s(`Fornavn*`,`<input type="text" class="form-control" name="fornavn" value="${a(O.fornavn)}" required>`)}
        ${s(`Etternavn*`,`<input type="text" class="form-control" name="etternavn" value="${a(O.etternavn)}" required>`)}
        ${s(`Kjønn*`,`<select class="form-select" name="kjonnid">${v(T,O.kjonnid)}</select>`)}
        ${s(`Klubb`,`<select class="form-select" name="klubbid"><option value="">— vel —</option>${C.map(e=>`<option value="${e.id}"${e.id===O.klubbid?` selected`:``}>${a(e.navn)}</option>`).join(``)}</select>`)}
        ${s(`Klasse`,`<select class="form-select" name="klasseid">${v(w,O.klasseid)}</select>`)}
        ${s(`E-post`,`<input type="email" class="form-control" name="epost" value="${a(O.epost)}">`)}
        ${s(`Telefon`,`<input type="tel" class="form-control" name="telefon" value="${a(O.telefon)}">`)}
        ${s(`Medlemsnummer`,`<input type="number" class="form-control" name="medlemsnummer" value="${O.medlemsnummer??``}">`)}
        <div class="mb-3 form-check">
          <input class="form-check-input" type="checkbox" name="eraktiv" id="eraktiv"${O.eraktiv===!1?``:` checked`}>
          <label class="form-check-label" for="eraktiv">Er aktiv</label>
        </div>
        <div class="d-flex gap-2 mt-4">
          <button type="submit" class="btn btn-primary">Lagre</button>
          ${S?`<button type="button" id="delete-button" class="btn btn-outline-danger ms-auto">Slett utøvar</button>`:``}
        </div>
      </form>
    </div>`,b.querySelector(`#thrower-form`).addEventListener(`submit`,async e=>{e.preventDefault();let t=new FormData(e.target),n={fornavn:t.get(`fornavn`).trim(),etternavn:t.get(`etternavn`).trim(),kjonnid:y(t.get(`kjonnid`)),klubbid:y(t.get(`klubbid`)),klasseid:y(t.get(`klasseid`)),epost:t.get(`epost`).trim()||null,telefon:t.get(`telefon`).trim()||null,medlemsnummer:t.get(`medlemsnummer`)?Number(t.get(`medlemsnummer`)):null,eraktiv:t.get(`eraktiv`)===`on`},{data:r,error:i}=S?await m(S,n):await g(n);if(i){c(b,l(i));return}o(b,`Utøvaren er lagra.`),S||setTimeout(()=>{location.hash=`#/kaster/${r.id}/admin`},1500)}),b.querySelector(`#delete-button`)?.addEventListener(`click`,async()=>{if(!await i({title:`Slett utøvar`,message:`Slett «${E?.fornavn} ${E?.etternavn}»? Dette kan ikkje angrast.`,danger:!0}))return;let{error:e}=await p(S);if(e){c(b,l(e));return}location.hash=`#/kastere`})}export{b as render};