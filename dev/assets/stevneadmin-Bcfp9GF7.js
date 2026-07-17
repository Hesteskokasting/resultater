import{t as e}from"./logError-D5z16FyH.js";import{$ as t,K as n,O as r,St as i,Y as a,_t as o,ct as s,gt as c,k as l,mt as u,pt as d,q as f,rt as p,w as m,xt as h}from"./index-CYJkPuEJ.js";import{i as g,n as _,r as v,t as y}from"./adminForms-Dt92tg59.js";import{r as b}from"./klubbService-CaXvOdL5.js";import{t as x}from"./LoadingState-BWi0wPLz.js";import{t as S}from"./buildDropdownOptions-ClIgfosJ.js";import{t as C}from"./formNum-DDzUPdUs.js";async function w(T,E={}){let D=E.id===void 0?void 0:Number(E.id);T.replaceChildren(x());let O=[],k=[],A=[],j=[],M=[];try{let e=await Promise.all([b(),d(),p(),t(),a()]);O=e[0].data,k=e[1].data,A=e[2].data,j=e[3].data,M=e[4].data}catch(t){e(`stevneadmin.render`,t),T.replaceChildren(i(`Kunne ikkje laste skjema.`));return}let N=null;if(D){let{data:e,error:t}=await s(D);if(t||!e){T.replaceChildren(i(`Stevne ikkje funne.`));return}if(N=e,!await r()&&!await l(N.klubbid??void 0)){T.replaceChildren(i(`Ingen tilgang til dette stevnet.`));return}}let P=D?`Rediger stevne: ${h(N?.navn??``)}`:`Nytt stevne`,F=N??{},I=F.dato??``,L=F.tid?F.tid.slice(0,5):D?``:`11:00`,R=F.kategoriid??M.find(e=>e.navn===`Singel`)?.id,z=S(O,F.klubbid),B=S(k,F.stevnetypeid),V=S(A,F.innledendekastemetodeid),H=S(j,F.avsluttendekastemetodeid),U=S(M,R);T.innerHTML=`
    <div class="container py-4 admin-form-lg">
      <h2 class="mb-4">${P}</h2>
      <form id="tournament-form">
        ${_(`Namn*`,`<input type="text" class="form-control" name="navn" value="${h(F.navn)}" required>`)}
        ${_(`Stad`,`<input type="text" class="form-control" name="sted" value="${h(F.sted)}">`)}
        ${_(`Dato`,`<input type="date" class="form-control" name="dato" value="${I}" required>`)}
        ${_(`Tid`,`<input type="time" class="form-control" name="tid" value="${L}">`)}
        ${_(`Arrangørklubb`,`<select class="form-select" name="klubbid">${z}</select>`)}
        ${_(`Stevnetype`,`<select class="form-select" name="stevnetypeid">${B}</select>`)}
        ${_(`Innleiande kastemetode`,`<select class="form-select" name="innledendekastemetodeid">${V}</select>`)}
        ${_(`Avsluttande kastemetode`,`<select class="form-select" name="avsluttendekastemetodeid">${H}</select>`)}
        ${_(`Kategori`,`<select class="form-select" name="kategoriid">${U}</select>`)}
        <div class="mb-3 d-flex gap-4 flex-wrap">
          <div class="form-check"><input class="form-check-input" type="checkbox" name="ernm" id="ernm"${F.ernm?` checked`:``}><label class="form-check-label" for="ernm">Er NM</label></div>
          <div class="form-check"><input class="form-check-input" type="checkbox" name="ernorgesranking" id="ernr"${F.ernorgesranking?` checked`:``}><label class="form-check-label" for="ernr">Er Norgesranking</label></div>
          <div class="form-check"><input class="form-check-input" type="checkbox" name="erekskludertfrarekorder" id="ekskl"${F.erekskludertfrarekorder?` checked`:``}><label class="form-check-label" for="ekskl">Ekskl. frå rekorder</label></div>
        </div>
        ${_(`Innbydelses-URL`,`<input type="url" class="form-control" name="innbydelseurl" value="${h(F.innbydelseurl)}">`)}
        ${_(`Resultat-URL`,`<input type="url" class="form-control" name="resultaturl" value="${h(F.resultaturl)}">`)}
        ${D?`
          <div class="mb-3 d-flex align-items-center gap-2">
            <span class="fw-semibold">Status:</span>
            <span>${F.erfullfort?`Fullført`:`Ikkje fullført`}</span>
            ${F.erfullfort?`<button type="button" id="reopen-button" class="btn btn-sm btn-outline-warning">Gjenåpne turnering</button>`:`<button type="button" id="complete-button" class="btn btn-sm btn-outline-success">Fullfør turnering</button>`}
          </div>`:``}
        <div class="d-flex gap-2 mt-4">
          <button type="submit" class="btn btn-primary">Lagre</button>
          ${D?`<button type="button" id="delete-button" class="btn btn-outline-danger ms-auto">Slett stevne</button>`:``}
        </div>
      </form>
    </div>`,T.querySelector(`#tournament-form`).addEventListener(`submit`,async e=>{e.preventDefault();let t=new FormData(e.target),r={navn:t.get(`navn`).trim(),sted:t.get(`sted`).trim()||null,dato:t.get(`dato`),tid:t.get(`tid`)||null,klubbid:C(t.get(`klubbid`)),stevnetypeid:C(t.get(`stevnetypeid`)),innledendekastemetodeid:C(t.get(`innledendekastemetodeid`)),avsluttendekastemetodeid:C(t.get(`avsluttendekastemetodeid`)),kategoriid:C(t.get(`kategoriid`)),ernm:t.get(`ernm`)===`on`,ernorgesranking:t.get(`ernorgesranking`)===`on`,erekskludertfrarekorder:t.get(`erekskludertfrarekorder`)===`on`,innbydelseurl:t.get(`innbydelseurl`).trim()||null,resultaturl:t.get(`resultaturl`).trim()||null},{data:i,error:a}=D?await o(D,r):await n(r);if(a){v(T,y(a));return}g(T,`Stevnet er lagra.`),D||setTimeout(()=>{location.hash=`#/stevne/${i.id}/rediger`},1500)}),T.querySelector(`#delete-button`)?.addEventListener(`click`,async()=>{if(!await m({title:`Slett stevne`,message:`Slett «${N?.navn}»? Dette kan ikkje angrast.`,danger:!0}))return;let{error:e}=await f(D);if(e){v(T,y(e));return}location.hash=`#/terminliste`}),T.querySelector(`#complete-button`)?.addEventListener(`click`,async()=>{if(!await m({title:`Fullfør turnering`,message:`Fullfør «${N?.navn}»? Du kan ikkje lenger endre kampar og resultat for stevnet.`,danger:!0}))return;let{error:e}=await c(D);if(e){v(T,y(e));return}g(T,`Stevnet er fullført.`),setTimeout(()=>{w(T,E)},1500)}),T.querySelector(`#reopen-button`)?.addEventListener(`click`,async()=>{if(!await m({title:`Gjenåpne turnering`,message:`Gjenåpne «${N?.navn}»? Kampar og resultat kan då endres igjen.`}))return;let{error:e}=await u(D);if(e){v(T,y(e));return}g(T,`Stevnet er gjenåpna.`),setTimeout(()=>{w(T,E)},1500)})}export{w as render};