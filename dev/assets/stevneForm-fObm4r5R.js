import{t as e}from"./logError-ByTg738k.js";import{$n as t,At as n,C as r,Et as i,O as a,Ot as o,Pt as s,Q as ee,Tt as te,Xt as ne,Zt as re,_t as ie,dr as c,dt as ae,et as oe,f as l,fr as u,g as d,h as se,it as ce,k as le,st as f,tt as ue,wt as de,yt as fe}from"./index-BzkBRoPl.js";import{a as pe}from"./klubbService-pPakrKDt.js";import{a as p,i as me,n as he,r as m,t as ge}from"./_formButtons-8baxnBxy.js";import{t as h}from"./dropdown-bQi3GY84.js";import{t as g}from"./formNum-HGeagI_O.js";import{i as _e}from"./kasterService-BN8H2rLx.js";import{t as _}from"./SearchSelect-AmUwjtH-.js";function v(){let e=new URLSearchParams(location.hash.split(`?`)[1]??``).get(`snc`),t=e?Number(e):NaN;return Number.isFinite(t)&&t>0?t:null}async function y(b,x){let{container:S}=b;S.replaceChildren(u());let C=[],w=[],T=[],E=[],D=[],O=[],k=[];try{let e=await Promise.all([pe(),de(),ae(),f(),ce(),ie(),_e()]);C=e[0].data,w=e[1].data,T=e[2].data,E=e[3].data,D=e[4].data,O=e[5].data,k=e[6].data}catch(t){e(`stevneForm.mount`,t),S.replaceChildren(c(`Kunne ikkje laste skjema.`));return}let A=null;if(x){let{data:e,error:t}=await fe(x);if(t||!e){S.replaceChildren(c(`Stevne ikkje funne.`));return}if(A=e,!await a()&&!await le(A.klubbid??void 0)){S.replaceChildren(c(`Ingen tilgang til dette stevnet.`));return}}let j=A??{},M=j.kategoriid??D.find(e=>e.navn===`Singel`)?.id,N=x?j.snc_hovudstevne_id??null:v(),P=O.find(e=>e.id===N)??null,F=x?j.snc_hovudstevne_id!=null:P!==null,I=F?N:null,L=j.er_snc_hovudstevne===!0,R=F&&!x,ve=j.navn??(R?P?.navn??``:``),ye=j.dato??(R?P?.dato??``:``),be=j.tid?j.tid.slice(0,5):x?``:R?P?.tid?.slice(0,5)??``:`11:00`,xe=h(C,j.klubbid),Se=h(w,j.stevnetypeid),Ce=h(T,j.innledendekastemetodeid),we=h(E,j.avsluttendekastemetodeid),Te=h(D,M),Ee=k.filter(e=>e.eraktiv||x!=null).map(e=>({id:e.id,label:r(e)+(e.eraktiv?``:` (inaktiv)`),sublabel:e.klubb?.navn??null})),z=P?l(P.navn)+(P.dato?` (${t(P.dato)})`:``):``,{wrapper:B,headingHtml:De}=me(b);B.innerHTML=`
    ${De}
    <form id="tournament-form">
      ${F?`<div class="alert alert-info py-2">
          <div class="fw-semibold">Hovudstevne:${z?` ${z}`:``}.</div>
        </div>`:``}
      ${m(`Namn*`,`<input type="text" class="form-control" name="navn" value="${l(ve)}" required>`)}
      ${m(`Stad`,`<input type="text" class="form-control" name="sted" value="${l(j.sted)}">`)}
      <div class="admin-form-grid">
        ${m(`Dato`,`<input type="date" class="form-control" name="dato" value="${ye}" required>`)}
        ${m(`Tid`,`<input type="time" class="form-control" name="tid" value="${be}">`)}
      </div>
      <div class="admin-form-grid">
        ${m(`Arrangørklubb`,`<select class="form-select" name="klubbid">${xe}</select>`)}
        ${m(`Kontaktperson`,`<span id="kontakt-slot"></span>`)}
      </div>
      <div class="admin-form-grid">
        ${m(`Stevnetype`,`<select class="form-select" name="stevnetypeid">${Se}</select>`)}
        ${m(`Kategori`,`<select class="form-select" name="kategoriid">${Te}</select>`)}
      </div>
      <div class="admin-form-grid">
        ${m(`Innleiande kastemetode`,`<select class="form-select" name="innledendekastemetodeid">${Ce}</select>`)}
        ${m(`Avsluttande kastemetode`,`<select class="form-select" name="avsluttendekastemetodeid">${we}</select>`)}
      </div>
      <div class="mb-3 d-flex gap-4 flex-wrap">
        <div class="form-check"><input class="form-check-input" type="checkbox" name="ernm" id="ernm"${j.ernm?` checked`:``}><label class="form-check-label" for="ernm">Er NM</label></div>
        <div class="form-check"><input class="form-check-input" type="checkbox" name="ernorgesranking" id="ernr"${j.ernorgesranking?` checked`:``}><label class="form-check-label" for="ernr">Er Norgesranking</label></div>
        <div class="form-check"><input class="form-check-input" type="checkbox" name="erekskludertfrarekorder" id="ekskl"${j.erekskludertfrarekorder?` checked`:``}><label class="form-check-label" for="ekskl">Ekskl. frå rekorder</label></div>
      </div>
      ${m(`Resultat-URL`,`<input type="url" class="form-control" name="resultaturl" value="${l(j.resultaturl)}">`)}
      <fieldset class="mb-3 border rounded p-3 d-none" id="snc-fieldset">
        <legend class="form-label fw-semibold float-none w-auto px-1 mb-2">SNC</legend>
        <div class="form-check mb-2">
          <input class="form-check-input" type="checkbox" name="er_snc_hovudstevne" id="snc-hovud"${L?` checked`:``}>
          <label class="form-check-label" for="snc-hovud">Er SNC-hovudstevne</label>
        </div>
        <p class="form-text mb-0">

        </p>
      </fieldset>
      ${x?`
        <div class="mb-3 d-flex align-items-center gap-2 flex-wrap">
          <span class="fw-semibold">Status:</span>
          <span>${j.erfullfort?L?`Konsolidert`:`Fullført`:`Ikkje fullført`}</span>
          ${j.erfullfort?`<button type="button" id="reopen-button" class="btn btn-sm btn-outline-warning">${L?`Gjenopne SNC-runden`:`Gjenåpne turnering`}</button>`:`<button type="button" id="complete-button" class="btn btn-sm btn-outline-success">${L?`Konsolider SNC-runden`:`Fullfør turnering`}</button>`}
        </div>`:``}
      <div class="admin-form-actions">
        <button type="submit" class="btn btn-primary">Lagre</button>
        ${b.onCancel?`<button type="button" id="cancel-button" class="btn btn-outline-secondary">Avbryt</button>`:``}
        ${x?`<button type="button" id="delete-button" class="btn btn-outline-danger ms-auto">Slett stevne</button>`:``}
      </div>
    </form>`,S.replaceChildren(B),_({slot:B.querySelector(`#kontakt-slot`),items:Ee,name:`kontaktkasterid`,value:j.kontaktkasterid??null,placeholder:`Søk på etternamn eller fornamn…`,clearLabel:`— ingen kontaktperson —`});let V=B.querySelector(`#snc-hovud`),Oe=B.querySelector(`#snc-fieldset`),H=e=>B.querySelector(`[name="${e}"]`),U=H(`stevnetypeid`),W=H(`kategoriid`),G=H(`innledendekastemetodeid`),K=H(`avsluttendekastemetodeid`),q=B.querySelector(`#ernr`),J=B.querySelector(`#ernm`),ke=B.querySelector(`#ekskl`),Y=w.find(e=>e.navn===`NM`)?.id,X=w.find(e=>e.navn===`SNC`)?.id;j.stevnetypeid!=null&&(U.value=String(j.stevnetypeid));let Z=()=>X!=null&&U.value===String(X);U.addEventListener(`change`,()=>{Y!=null&&U.value===String(Y)&&(J.checked=!0),Z()&&(V.checked=!0),$()});function Q(e,t){let n=e.value,r=t.some(e=>String(e.id)===n);e.innerHTML=h(t,r?n:``)}function $(){Z()||(V.checked=!1),Oe.classList.toggle(`d-none`,F||!Z());let e=F||V.checked;if(Q(G,e?T.filter(e=>re(e.navn)):T),Q(K,e?E.filter(e=>ne(e.navn)):E),F&&P){let e=(e,t)=>{e.value=t==null?``:String(t)};e(U,P.stevnetypeid),e(W,P.kategoriid),e(G,P.innledendekastemetodeid),e(K,P.avsluttendekastemetodeid),q.checked=P.ernorgesranking}for(let e of[J,ke])e.disabled=F,F&&(e.checked=!1);for(let e of[U,W,G,K,q])e.disabled=F}V.addEventListener(`change`,$),$(),B.querySelector(`#tournament-form`).addEventListener(`submit`,async e=>{e.preventDefault();let t=new FormData(e.target),r=P,i={navn:t.get(`navn`).trim(),sted:t.get(`sted`).trim()||null,dato:t.get(`dato`),tid:t.get(`tid`)||null,klubbid:g(t.get(`klubbid`)),stevnetypeid:F?r?.stevnetypeid??j.stevnetypeid??null:g(t.get(`stevnetypeid`)),innledendekastemetodeid:F?r?.innledendekastemetodeid??j.innledendekastemetodeid??null:g(t.get(`innledendekastemetodeid`)),avsluttendekastemetodeid:F?r?.avsluttendekastemetodeid??j.avsluttendekastemetodeid??null:g(t.get(`avsluttendekastemetodeid`)),kategoriid:F?r?.kategoriid??j.kategoriid??null:g(t.get(`kategoriid`)),kontaktkasterid:g(t.get(`kontaktkasterid`)),ernm:!F&&t.get(`ernm`)===`on`,ernorgesranking:F?r?.ernorgesranking??j.ernorgesranking??!1:t.get(`ernorgesranking`)===`on`,erekskludertfrarekorder:!F&&t.get(`erekskludertfrarekorder`)===`on`,resultaturl:t.get(`resultaturl`).trim()||null,er_snc_hovudstevne:!F&&V.checked,snc_hovudstevne_id:I},{data:a,error:o}=x?await n(x,i):await oe(i);if(o){p(B,s(o));return}se(x?`Stevnet er lagra.`:`Stevnet er oppretta.`,`success`),b.onSaved?.(a?.id??x,!x)}),ge(B,b),he(B,{title:`Slett stevne`,message:`Slett «${A?.navn}»? Dette kan ikkje angrast.`,remove:()=>ue(x),onDeleted:b.onDeleted}),B.querySelector(`#complete-button`)?.addEventListener(`click`,async()=>{if(!await d({title:L?`Konsolider SNC-runden`:`Fullfør turnering`,message:L?`Slå saman lokalresultata i «${A?.navn}» til éi liste og rekne ut NC-poeng frå den samla plasseringa?`:`Fullfør «${A?.navn}»? Du kan ikkje lenger endre kampar og resultat for stevnet.`,danger:!0}))return;let{error:e}=L?await ee(x):await o(x);if(e){p(B,s(e));return}await y(b,x)}),B.querySelector(`#reopen-button`)?.addEventListener(`click`,async()=>{if(!await d({title:L?`Gjenopne SNC-runden`:`Gjenåpne turnering`,message:L?`Gjenopne «${A?.navn}»? Den samla lista og NC-poenga blir nullstilte.`:`Gjenåpne «${A?.navn}»? Kampar og resultat kan då endres igjen.`,danger:L}))return;let{error:e}=L?await te(x):await i(x);if(e){p(B,s(e));return}await y(b,x)})}export{y as t};