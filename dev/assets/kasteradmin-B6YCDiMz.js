import{G as e,W as t,n,nt as r,r as i}from"./index-DWjo0-lM.js";import{i as a,n as o,r as s,t as c}from"./adminForms-YGwxoHa_.js";import{r as l}from"./klubbService-CwwTQsYA.js";import{c as u,d,f,l as p,n as m,p as h}from"./kasterService-CwOeukrR.js";import{t as g}from"./LoadingState-RVZNML7E.js";import{t as _}from"./ConfirmDialog-DNGrXiEY.js";import{t as v}from"./buildDropdownOptions-Dp8pK6OZ.js";import{t as y}from"./formNum-DroYxM0M.js";async function b(b,x={}){let S=x.id===void 0?void 0:Number(x.id);b.replaceChildren(g());let C=[],w=[],T=[];try{let e=await Promise.all([l(),p(),u()]);C=e[0].data,w=e[1].data,T=e[2].data}catch(t){r(`kasteradmin.render`,t),b.replaceChildren(e(`Kunne ikkje laste skjema.`));return}let E=null;if(S){let{data:t,error:r}=await m(S);if(r||!t){b.replaceChildren(e(`Utøvar ikkje funne.`));return}if(E=t,!await n()&&!await i(E.klubbid??void 0)){b.replaceChildren(e(`Ingen tilgang til denne utøvaren.`));return}}let D=S?`Rediger utøvar: ${E?`${t(E.fornavn)} ${t(E.etternavn)}`:``}`:`Ny utøvar`,O=E??{};b.innerHTML=`
    <div class="container py-4 admin-skjema-md">
      <h2 class="mb-4">${D}</h2>
      <form id="kaster-skjema">
        ${o(`Fornavn*`,`<input type="text" class="form-control" name="fornavn" value="${t(O.fornavn)}" required>`)}
        ${o(`Etternavn*`,`<input type="text" class="form-control" name="etternavn" value="${t(O.etternavn)}" required>`)}
        ${o(`Kjønn*`,`<select class="form-select" name="kjonnid">${v(T,O.kjonnid)}</select>`)}
        ${o(`Klubb`,`<select class="form-select" name="klubbid"><option value="">— vel —</option>${C.map(e=>`<option value="${e.id}"${e.id===O.klubbid?` selected`:``}>${t(e.navn)}</option>`).join(``)}</select>`)}
        ${o(`Klasse`,`<select class="form-select" name="klasseid">${v(w,O.klasseid)}</select>`)}
        ${o(`E-post`,`<input type="email" class="form-control" name="epost" value="${t(O.epost)}">`)}
        ${o(`Telefon`,`<input type="tel" class="form-control" name="telefon" value="${t(O.telefon)}">`)}
        ${o(`Medlemsnummer`,`<input type="number" class="form-control" name="medlemsnummer" value="${O.medlemsnummer??``}">`)}
        <div class="mb-3 form-check">
          <input class="form-check-input" type="checkbox" name="eraktiv" id="eraktiv"${O.eraktiv===!1?``:` checked`}>
          <label class="form-check-label" for="eraktiv">Er aktiv</label>
        </div>
        <div class="d-flex gap-2 mt-4">
          <button type="submit" class="btn btn-primary">Lagre</button>
          ${S?`<button type="button" id="slett-knapp" class="btn btn-outline-danger ms-auto">Slett utøvar</button>`:``}
        </div>
      </form>
    </div>`,b.querySelector(`#kaster-skjema`).addEventListener(`submit`,async e=>{e.preventDefault();let t=new FormData(e.target),n={fornavn:t.get(`fornavn`).trim(),etternavn:t.get(`etternavn`).trim(),kjonnid:y(t.get(`kjonnid`)),klubbid:y(t.get(`klubbid`)),klasseid:y(t.get(`klasseid`)),epost:t.get(`epost`).trim()||null,telefon:t.get(`telefon`).trim()||null,medlemsnummer:t.get(`medlemsnummer`)?Number(t.get(`medlemsnummer`)):null,eraktiv:t.get(`eraktiv`)===`on`},{data:r,error:i}=S?await d(S,n):await f(n);if(i){s(b,c(i));return}a(b,`Utøvaren er lagra.`),S||setTimeout(()=>{location.hash=`#/kaster/${r.id}/admin`},1500)}),b.querySelector(`#slett-knapp`)?.addEventListener(`click`,async()=>{if(!await _({title:`Slett utøvar`,message:`Slett «${E?.fornavn} ${E?.etternavn}»? Dette kan ikkje angrast.`,danger:!0}))return;let{error:e}=await h(S);if(e){s(b,c(e));return}location.hash=`#/kastere`})}export{b as render};