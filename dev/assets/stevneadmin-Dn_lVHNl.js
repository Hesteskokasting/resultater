import{t as e}from"./logError-Cjb5zwtM.js";import{a as t,i as n}from"./authService-9qLZxJYd.js";import{A as r,C as i,E as a,P as o,Q as s,S as c,W as l,Z as u,q as d,w as f,z as p}from"./index-CgeMi77Q.js";import{i as m,n as h,r as g,t as _}from"./adminForms-s4O0T8SN.js";import{r as v}from"./klubbService-CPrDwSKB.js";import{t as y}from"./LoadingState-DU0ZcPlb.js";import{t as b}from"./buildDropdownOptions-CjVEhiSJ.js";import{t as x}from"./formNum-BTZ_qfFL.js";async function S(S,C={}){let w=C.id===void 0?void 0:Number(C.id);S.replaceChildren(y());let T=[],E=[],D=[],O=[],k=[];try{let e=await Promise.all([v(),l(),o(),r(),a()]);T=e[0].data,E=e[1].data,D=e[2].data,O=e[3].data,k=e[4].data}catch(t){e(`stevneadmin.render`,t),S.replaceChildren(s(`Kunne ikkje laste skjema.`));return}let A=null;if(w){let{data:e,error:r}=await p(w);if(r||!e){S.replaceChildren(s(`Stevne ikkje funne.`));return}if(A=e,!await n()&&!await t(A.klubbid??void 0)){S.replaceChildren(s(`Ingen tilgang til dette stevnet.`));return}}let j=w?`Rediger stevne: ${u(A?.navn??``)}`:`Nytt stevne`,M=A??{},N=M.dato??``,P=M.tid?M.tid.slice(0,5):w?``:`11:00`,F=M.kategoriid??k.find(e=>e.navn===`Singel`)?.id,I=b(T,M.klubbid),L=b(E,M.stevnetypeid),R=b(D,M.innledendekastemetodeid),z=b(O,M.avsluttendekastemetodeid),B=b(k,F);S.innerHTML=`
    <div class="container py-4 admin-form-lg">
      <h2 class="mb-4">${j}</h2>
      <form id="tournament-form">
        ${h(`Namn*`,`<input type="text" class="form-control" name="navn" value="${u(M.navn)}" required>`)}
        ${h(`Stad`,`<input type="text" class="form-control" name="sted" value="${u(M.sted)}">`)}
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
        ${h(`Innbydelses-URL`,`<input type="url" class="form-control" name="innbydelseurl" value="${u(M.innbydelseurl)}">`)}
        ${h(`Resultat-URL`,`<input type="url" class="form-control" name="resultaturl" value="${u(M.resultaturl)}">`)}
        <div class="d-flex gap-2 mt-4">
          <button type="submit" class="btn btn-primary">Lagre</button>
          ${w?`<button type="button" id="delete-button" class="btn btn-outline-danger ms-auto">Slett stevne</button>`:``}
        </div>
      </form>
    </div>`,S.querySelector(`#tournament-form`).addEventListener(`submit`,async e=>{e.preventDefault();let t=new FormData(e.target),n={navn:t.get(`navn`).trim(),sted:t.get(`sted`).trim()||null,dato:t.get(`dato`)||null,tid:t.get(`tid`)||null,klubbid:x(t.get(`klubbid`)),stevnetypeid:x(t.get(`stevnetypeid`)),innledendekastemetodeid:x(t.get(`innledendekastemetodeid`)),avsluttendekastemetodeid:x(t.get(`avsluttendekastemetodeid`)),kategoriid:x(t.get(`kategoriid`)),ernm:t.get(`ernm`)===`on`,ernorgesranking:t.get(`ernorgesranking`)===`on`,erfullfort:t.get(`erfullfort`)===`on`,erekskludertfrarekorder:t.get(`erekskludertfrarekorder`)===`on`,innbydelseurl:t.get(`innbydelseurl`).trim()||null,resultaturl:t.get(`resultaturl`).trim()||null},{data:r,error:a}=w?await d(w,n):await i(n);if(a){g(S,_(a));return}m(S,`Stevnet er lagra.`),w||setTimeout(()=>{location.hash=`#/stevne/${r.id}/rediger`},1500)}),S.querySelector(`#delete-button`)?.addEventListener(`click`,async()=>{if(!await c({title:`Slett stevne`,message:`Slett «${A?.navn}»? Dette kan ikkje angrast.`,danger:!0}))return;let{error:e}=await f(w);if(e){g(S,_(e));return}location.hash=`#/terminliste`})}export{S as render};