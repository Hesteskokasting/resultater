import{A as e,E as t,G as n,H as r,I as i,P as a,T as o,W as s,n as c,nt as l,r as u,v as d,z as f}from"./index-D-FxIV0h.js";import{i as p,n as m,r as h,t as g}from"./adminForms-DJFRKQAi.js";import{r as _}from"./klubbService-DwViyehp.js";import{t as v}from"./LoadingState-RVZNML7E.js";import{t as y}from"./ConfirmDialog-3D8QuJxP.js";import{t as b}from"./buildDropdownOptions-C1Oi-scW.js";import{t as x}from"./formNum-DroYxM0M.js";async function S(S,C={}){let w=C.id===void 0?void 0:Number(C.id);S.replaceChildren(v());let T=[],E=[],D=[],O=[],k=[];try{let e=await Promise.all([_(),a(),o(),d(),t()]);T=e[0].data,E=e[1].data,D=e[2].data,O=e[3].data,k=e[4].data}catch(e){l(`stevneadmin.render`,e),S.replaceChildren(n(`Kunne ikkje laste skjema.`));return}let A=null;if(w){let{data:t,error:r}=await e(w);if(r||!t){S.replaceChildren(n(`Stevne ikkje funne.`));return}if(A=t,!await c()&&!await u(A.klubbid??void 0)){S.replaceChildren(n(`Ingen tilgang til dette stevnet.`));return}}let j=w?`Rediger stevne: ${s(A?.navn??``)}`:`Nytt stevne`,M=A??{},N=M.dato??``,P=M.tid?M.tid.slice(0,5):w?``:`11:00`,F=M.kategoriid??k.find(e=>e.navn===`Singel`)?.id,I=b(T,M.klubbid),L=b(E,M.stevnetypeid),R=b(D,M.innledendekastemetodeid),z=b(O,M.avsluttendekastemetodeid),B=b(k,F);S.innerHTML=`
    <div class="container py-4 admin-skjema-lg">
      <h2 class="mb-4">${j}</h2>
      <form id="stevne-skjema">
        ${m(`Namn*`,`<input type="text" class="form-control" name="navn" value="${s(M.navn)}" required>`)}
        ${m(`Stad`,`<input type="text" class="form-control" name="sted" value="${s(M.sted)}">`)}
        ${m(`Dato`,`<input type="date" class="form-control" name="dato" value="${N}" required>`)}
        ${m(`Tid`,`<input type="time" class="form-control" name="tid" value="${P}">`)}
        ${m(`Arrangørklubb`,`<select class="form-select" name="klubbid">${I}</select>`)}
        ${m(`Stevnetype`,`<select class="form-select" name="stevnetypeid">${L}</select>`)}
        ${m(`Innleiande kastemetode`,`<select class="form-select" name="innledendekastemetodeid">${R}</select>`)}
        ${m(`Avsluttande kastemetode`,`<select class="form-select" name="avsluttendekastemetodeid">${z}</select>`)}
        ${m(`Kategori`,`<select class="form-select" name="kategoriid">${B}</select>`)}
        <div class="mb-3 d-flex gap-4 flex-wrap">
          <div class="form-check"><input class="form-check-input" type="checkbox" name="ernm" id="ernm"${M.ernm?` checked`:``}><label class="form-check-label" for="ernm">Er NM</label></div>
          <div class="form-check"><input class="form-check-input" type="checkbox" name="ernorgesranking" id="ernr"${M.ernorgesranking?` checked`:``}><label class="form-check-label" for="ernr">Er Norgesranking</label></div>
          <div class="form-check"><input class="form-check-input" type="checkbox" name="erfullfort" id="erfullfort"${M.erfullfort?` checked`:``}><label class="form-check-label" for="erfullfort">Er fullført</label></div>
          <div class="form-check"><input class="form-check-input" type="checkbox" name="erekskludertfrarekorder" id="ekskl"${M.erekskludertfrarekorder?` checked`:``}><label class="form-check-label" for="ekskl">Ekskl. frå rekorder</label></div>
        </div>
        ${m(`Innbydelses-URL`,`<input type="url" class="form-control" name="innbydelseurl" value="${s(M.innbydelseurl)}">`)}
        ${m(`Resultat-URL`,`<input type="url" class="form-control" name="resultaturl" value="${s(M.resultaturl)}">`)}
        <div class="d-flex gap-2 mt-4">
          <button type="submit" class="btn btn-primary">Lagre</button>
          ${w?`<button type="button" id="slett-knapp" class="btn btn-outline-danger ms-auto">Slett stevne</button>`:``}
        </div>
      </form>
    </div>`,S.querySelector(`#stevne-skjema`).addEventListener(`submit`,async e=>{e.preventDefault();let t=new FormData(e.target),n={navn:t.get(`navn`).trim(),sted:t.get(`sted`).trim()||null,dato:t.get(`dato`)||null,tid:t.get(`tid`)||null,klubbid:x(t.get(`klubbid`)),stevnetypeid:x(t.get(`stevnetypeid`)),innledendekastemetodeid:x(t.get(`innledendekastemetodeid`)),avsluttendekastemetodeid:x(t.get(`avsluttendekastemetodeid`)),kategoriid:x(t.get(`kategoriid`)),ernm:t.get(`ernm`)===`on`,ernorgesranking:t.get(`ernorgesranking`)===`on`,erfullfort:t.get(`erfullfort`)===`on`,erekskludertfrarekorder:t.get(`erekskludertfrarekorder`)===`on`,innbydelseurl:t.get(`innbydelseurl`).trim()||null,resultaturl:t.get(`resultaturl`).trim()||null},{data:r,error:a}=w?await i(w,n):await f(n);if(a){h(S,g(a));return}p(S,`Stevnet er lagra.`),w||setTimeout(()=>{location.hash=`#/stevne/${r.id}/rediger`},1500)}),S.querySelector(`#slett-knapp`)?.addEventListener(`click`,async()=>{if(!await y({title:`Slett stevne`,message:`Slett «${A?.navn}»? Dette kan ikkje angrast.`,danger:!0}))return;let{error:e}=await r(w);if(e){h(S,g(e));return}location.hash=`#/terminliste`})}export{S as render};