import{t as e}from"./logError-DhxY2JQv.js";import{n as t,t as n}from"./authService-CcI7FLUE.js";import{B as r,J as i,K as a,O as o,P as s,R as c,U as l,Y as u,k as d,x as f,y as p}from"./index-pllV3QU0.js";import{i as m,n as h,r as g,t as _}from"./adminForms-D4qtFNU6.js";import{r as v}from"./klubbService-avZCVzgk.js";import{t as y}from"./LoadingState-xRmJ3K_t.js";import{t as b}from"./buildDropdownOptions-BRFGPdcK.js";import{t as x}from"./formNum-BZkf_zqu.js";async function S(S,C={}){let w=C.id===void 0?void 0:Number(C.id);S.replaceChildren(y());let T=[],E=[],D=[],O=[],k=[];try{let e=await Promise.all([v(),c(),o(),f(),d()]);T=e[0].data,E=e[1].data,D=e[2].data,O=e[3].data,k=e[4].data}catch(t){e(`stevneadmin.render`,t),S.replaceChildren(u(`Kunne ikkje laste skjema.`));return}let A=null;if(w){let{data:e,error:r}=await s(w);if(r||!e){S.replaceChildren(u(`Stevne ikkje funne.`));return}if(A=e,!await n()&&!await t(A.klubbid??void 0)){S.replaceChildren(u(`Ingen tilgang til dette stevnet.`));return}}let j=w?`Rediger stevne: ${i(A?.navn??``)}`:`Nytt stevne`,M=A??{},N=M.dato??``,P=M.tid?M.tid.slice(0,5):w?``:`11:00`,F=M.kategoriid??k.find(e=>e.navn===`Singel`)?.id,I=b(T,M.klubbid),L=b(E,M.stevnetypeid),R=b(D,M.innledendekastemetodeid),z=b(O,M.avsluttendekastemetodeid),B=b(k,F);S.innerHTML=`
    <div class="container py-4 admin-skjema-lg">
      <h2 class="mb-4">${j}</h2>
      <form id="stevne-skjema">
        ${h(`Namn*`,`<input type="text" class="form-control" name="navn" value="${i(M.navn)}" required>`)}
        ${h(`Stad`,`<input type="text" class="form-control" name="sted" value="${i(M.sted)}">`)}
        ${h(`Dato`,`<input type="date" class="form-control" name="dato" value="${N}" required>`)}
        ${h(`Tid`,`<input type="time" class="form-control" name="tid" value="${P}">`)}
        ${h(`Arrangørklubb`,`<select class="form-select" name="klubbid">${I}</select>`)}
        ${h(`Stevnetype`,`<select class="form-select" name="stevnetypeid">${L}</select>`)}
        ${h(`Innleiande kastemetode`,`<select class="form-select" name="innledendekastemetodeid">${R}</select>`)}
        ${h(`Avsluttande kastemetode`,`<select class="form-select" name="avsluttendekastemetodeid">${z}</select>`)}
        ${h(`Kategori`,`<select class="form-select" name="kategoriid">${B}</select>`)}
        <div class="mb-3 d-flex gap-4 flex-wrap">
          <div class="form-check"><input class="form-check-input" type="checkbox" name="ernm" id="ernm"${M.ernm?` checked`:``}><label class="form-check-label" for="ernm">Er NM</label></div>
          <div class="form-check"><input class="form-check-input" type="checkbox" name="ernorgesranking" id="ernr"${M.ernorgesranking?` checked`:``}><label class="form-check-label" for="ernr">Er Norgesranking</label></div>
          <div class="form-check"><input class="form-check-input" type="checkbox" name="erfullfort" id="erfullfort"${M.erfullfort?` checked`:``}><label class="form-check-label" for="erfullfort">Er fullført</label></div>
          <div class="form-check"><input class="form-check-input" type="checkbox" name="erekskludertfrarekorder" id="ekskl"${M.erekskludertfrarekorder?` checked`:``}><label class="form-check-label" for="ekskl">Ekskl. frå rekorder</label></div>
        </div>
        ${h(`Innbydelses-URL`,`<input type="url" class="form-control" name="innbydelseurl" value="${i(M.innbydelseurl)}">`)}
        ${h(`Resultat-URL`,`<input type="url" class="form-control" name="resultaturl" value="${i(M.resultaturl)}">`)}
        <div class="d-flex gap-2 mt-4">
          <button type="submit" class="btn btn-primary">Lagre</button>
          ${w?`<button type="button" id="slett-knapp" class="btn btn-outline-danger ms-auto">Slett stevne</button>`:``}
        </div>
      </form>
    </div>`,S.querySelector(`#stevne-skjema`).addEventListener(`submit`,async e=>{e.preventDefault();let t=new FormData(e.target),n={navn:t.get(`navn`).trim(),sted:t.get(`sted`).trim()||null,dato:t.get(`dato`)||null,tid:t.get(`tid`)||null,klubbid:x(t.get(`klubbid`)),stevnetypeid:x(t.get(`stevnetypeid`)),innledendekastemetodeid:x(t.get(`innledendekastemetodeid`)),avsluttendekastemetodeid:x(t.get(`avsluttendekastemetodeid`)),kategoriid:x(t.get(`kategoriid`)),ernm:t.get(`ernm`)===`on`,ernorgesranking:t.get(`ernorgesranking`)===`on`,erfullfort:t.get(`erfullfort`)===`on`,erekskludertfrarekorder:t.get(`erekskludertfrarekorder`)===`on`,innbydelseurl:t.get(`innbydelseurl`).trim()||null,resultaturl:t.get(`resultaturl`).trim()||null},{data:i,error:a}=w?await r(w,n):await l(n);if(a){g(S,_(a));return}m(S,`Stevnet er lagra.`),w||setTimeout(()=>{location.hash=`#/stevne/${i.id}/rediger`},1500)}),S.querySelector(`#slett-knapp`)?.addEventListener(`click`,async()=>{if(!await p({title:`Slett stevne`,message:`Slett «${A?.navn}»? Dette kan ikkje angrast.`,danger:!0}))return;let{error:e}=await a(w);if(e){g(S,_(e));return}location.hash=`#/terminliste`})}export{S as render};