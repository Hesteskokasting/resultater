import{t as e}from"./logError-D5z16FyH.js";import{A as t,E as n,Q as r,Tt as i,X as a,Y as o,_t as s,bt as c,dt as l,gt as u,j as d,nt as f,ot as p,wt as m,yt as h}from"./index-DVHt6_kn.js";import{i as g,n as _,r as v,t as y}from"./adminForms-Ca2wo1ti.js";import{r as b}from"./klubbService-CaXvOdL5.js";import{t as x}from"./LoadingState-BWi0wPLz.js";import{t as S}from"./buildDropdownOptions-0Tsskn_s.js";import{t as C}from"./formNum-DDzUPdUs.js";async function w(T,E={}){let D=E.id===void 0?void 0:Number(E.id);T.replaceChildren(x());let O=[],k=[],A=[],j=[],M=[];try{let e=await Promise.all([b(),u(),p(),f(),r()]);O=e[0].data,k=e[1].data,A=e[2].data,j=e[3].data,M=e[4].data}catch(t){e(`stevneadmin.render`,t),T.replaceChildren(i(`Kunne ikkje laste skjema.`));return}let N=null;if(D){let{data:e,error:n}=await l(D);if(n||!e){T.replaceChildren(i(`Stevne ikkje funne.`));return}if(N=e,!await t()&&!await d(N.klubbid??void 0)){T.replaceChildren(i(`Ingen tilgang til dette stevnet.`));return}}let P=D?`Rediger stevne: ${m(N?.navn??``)}`:`Nytt stevne`,F=N??{},I=F.dato??``,L=F.tid?F.tid.slice(0,5):D?``:`11:00`,R=F.kategoriid??M.find(e=>e.navn===`Singel`)?.id,z=S(O,F.klubbid),B=S(k,F.stevnetypeid),V=S(A,F.innledendekastemetodeid),H=S(j,F.avsluttendekastemetodeid),U=S(M,R);T.innerHTML=`
    <div class="container py-4 admin-form-lg">
      <h2 class="mb-4">${P}</h2>
      <form id="tournament-form">
        ${_(`Namn*`,`<input type="text" class="form-control" name="navn" value="${m(F.navn)}" required>`)}
        ${_(`Stad`,`<input type="text" class="form-control" name="sted" value="${m(F.sted)}">`)}
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
        ${_(`Resultat-URL`,`<input type="url" class="form-control" name="resultaturl" value="${m(F.resultaturl)}">`)}
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
    </div>`,T.querySelector(`#tournament-form`).addEventListener(`submit`,async e=>{e.preventDefault();let t=new FormData(e.target),n={navn:t.get(`navn`).trim(),sted:t.get(`sted`).trim()||null,dato:t.get(`dato`),tid:t.get(`tid`)||null,klubbid:C(t.get(`klubbid`)),stevnetypeid:C(t.get(`stevnetypeid`)),innledendekastemetodeid:C(t.get(`innledendekastemetodeid`)),avsluttendekastemetodeid:C(t.get(`avsluttendekastemetodeid`)),kategoriid:C(t.get(`kategoriid`)),ernm:t.get(`ernm`)===`on`,ernorgesranking:t.get(`ernorgesranking`)===`on`,erekskludertfrarekorder:t.get(`erekskludertfrarekorder`)===`on`,resultaturl:t.get(`resultaturl`).trim()||null},{data:r,error:i}=D?await c(D,n):await o(n);if(i){v(T,y(i));return}g(T,`Stevnet er lagra.`),D||setTimeout(()=>{location.hash=`#/stevne/${r.id}/rediger`},1500)}),T.querySelector(`#delete-button`)?.addEventListener(`click`,async()=>{if(!await n({title:`Slett stevne`,message:`Slett «${N?.navn}»? Dette kan ikkje angrast.`,danger:!0}))return;let{error:e}=await a(D);if(e){v(T,y(e));return}location.hash=`#/terminliste`}),T.querySelector(`#complete-button`)?.addEventListener(`click`,async()=>{if(!await n({title:`Fullfør turnering`,message:`Fullfør «${N?.navn}»? Du kan ikkje lenger endre kampar og resultat for stevnet.`,danger:!0}))return;let{error:e}=await h(D);if(e){v(T,y(e));return}g(T,`Stevnet er fullført.`),setTimeout(()=>{w(T,E)},1500)}),T.querySelector(`#reopen-button`)?.addEventListener(`click`,async()=>{if(!await n({title:`Gjenåpne turnering`,message:`Gjenåpne «${N?.navn}»? Kampar og resultat kan då endres igjen.`}))return;let{error:e}=await s(D);if(e){v(T,y(e));return}g(T,`Stevnet er gjenåpna.`),setTimeout(()=>{w(T,E)},1500)})}export{w as render};