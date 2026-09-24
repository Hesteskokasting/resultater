import{t as e}from"./logError-ByTg738k.js";import{Bt as t,C as n,E as r,H as i,It as ee,Mt as a,Pt as o,St as te,_r as s,ar as ne,at as re,f as c,ft as l,g as u,gt as ie,h as ae,jt as oe,kt as se,lt as ce,nn as le,ot as ue,rn as de,rt as fe,vr as pe,wt as me}from"./index-ScyQGOLm.js";import{a as he}from"./klubbService-pPakrKDt.js";import{a as d,i as f,n as ge,r as p,t as _e}from"./_formButtons-DPHgHOKG.js";import{t as m}from"./dropdown-BfusA0XK.js";import{t as h}from"./formNum-HGeagI_O.js";import{i as ve}from"./kasterService-y8FvzW53.js";import{t as ye}from"./SearchSelect-fxcUpWhz.js";function be(){let e=new URLSearchParams(location.hash.split(`?`)[1]??``).get(`snc`),t=e?Number(e):NaN;return Number.isFinite(t)&&t>0?t:null}async function g(_,v){let{container:y}=_;y.replaceChildren(pe());let b=[],x=[],S=[],C=[],w=[],T=[],E=[];try{let e=await Promise.all([he(),se(),ie(),l(),ce(),te(),ve()]);b=e[0].data,x=e[1].data,S=e[2].data,C=e[3].data,w=e[4].data,T=e[5].data,E=e[6].data}catch(t){e(`stevneForm.mount`,t),y.replaceChildren(s(`Kunne ikkje laste skjema.`));return}let D=await r(),O=D?.profil?.role===`admin`,k=null;if(v){let{data:e,error:t}=await me(v);if(t||!e){y.replaceChildren(s(`Stevne ikkje funne.`));return}if(k=e,!i(D,k.klubbid)){y.replaceChildren(s(`Ingen tilgang til dette stevnet.`));return}}let A=k??{},j=A.kategoriid??w.find(e=>e.navn===`Singel`)?.id,M=v?A.snc_hovudstevne_id??null:be(),N=T.find(e=>e.id===M)??null,P=v?A.snc_hovudstevne_id!=null:N!==null,xe=P?M:null,F=A.er_snc_hovudstevne===!0,I=P&&!v,Se=A.navn??(I?N?.navn??``:``),Ce=A.dato??(I?N?.dato??``:``),we=A.tid?A.tid.slice(0,5):v?``:I?N?.tid?.slice(0,5)??``:`11:00`,L=D?.club??null,R=O?m(b,A.klubbid):m(b.filter(e=>e.id===L),L),Te=m(x,A.stevnetypeid),Ee=m(S,A.innledendekastemetodeid),De=m(C,A.avsluttendekastemetodeid),Oe=m(w,j),ke=E.filter(e=>e.eraktiv||v!=null).map(e=>({id:e.id,label:n(e)+(e.eraktiv?``:` (inaktiv)`),sublabel:e.klubb?.navn??null})),z=N?c(N.navn)+(N.dato?` (${ne(N.dato)})`:``):``,{wrapper:B,headingHtml:Ae}=f(_);B.innerHTML=`
    ${Ae}
    <form id="tournament-form">
      ${P?`<div class="alert alert-info py-2">
          <div class="fw-semibold">Hovudstevne:${z?` ${z}`:``}.</div>
        </div>`:``}
      ${p(`Namn*`,`<input type="text" class="form-control" name="navn" value="${c(Se)}" required>`)}
      ${p(`Stad`,`<input type="text" class="form-control" name="sted" value="${c(A.sted)}">`)}
      <div class="admin-form-grid">
        ${p(`Dato`,`<input type="date" class="form-control" name="dato" value="${Ce}" required>`)}
        ${p(`Tid`,`<input type="time" class="form-control" name="tid" value="${we}">`)}
      </div>
      <div class="admin-form-grid">
        ${p(`Arrangørklubb`,`<select class="form-select" name="klubbid"${O?``:` disabled`}>${R}</select>`)}
        ${p(`Kontaktperson`,`<span id="kontakt-slot"></span>`)}
      </div>
      <div class="admin-form-grid">
        ${p(`Stevnetype`,`<select class="form-select" name="stevnetypeid">${Te}</select>`)}
        ${p(`Kategori`,`<select class="form-select" name="kategoriid">${Oe}</select>`)}
      </div>
      <div class="admin-form-grid">
        ${p(`Innleiande kastemetode`,`<select class="form-select" name="innledendekastemetodeid">${Ee}</select>`)}
        ${p(`Avsluttande kastemetode`,`<select class="form-select" name="avsluttendekastemetodeid">${De}</select>`)}
      </div>
      <div class="mb-3 d-flex gap-4 flex-wrap">
        <div class="form-check"><input class="form-check-input" type="checkbox" name="ernm" id="ernm"${A.ernm?` checked`:``}><label class="form-check-label" for="ernm">Er NM</label></div>
        <div class="form-check"><input class="form-check-input" type="checkbox" name="ernorgesranking" id="ernr"${A.ernorgesranking?` checked`:``}><label class="form-check-label" for="ernr">Er Norgesranking</label></div>
        <div class="form-check"><input class="form-check-input" type="checkbox" name="erekskludertfrarekorder" id="ekskl"${A.erekskludertfrarekorder?` checked`:``}><label class="form-check-label" for="ekskl">Ekskl. frå rekorder</label></div>
      </div>
      ${p(`Resultat-URL`,`<input type="url" class="form-control" name="resultaturl" value="${c(A.resultaturl)}">`)}
      <fieldset class="mb-3 border rounded p-3 d-none" id="snc-fieldset">
        <legend class="form-label fw-semibold float-none w-auto px-1 mb-2">SNC</legend>
        <div class="form-check mb-2">
          <input class="form-check-input" type="checkbox" name="er_snc_hovudstevne" id="snc-hovud"${F?` checked`:``}>
          <label class="form-check-label" for="snc-hovud">Er SNC-hovudstevne</label>
        </div>
        <p class="form-text mb-0">

        </p>
      </fieldset>
      ${v?`
        <div class="mb-3 d-flex align-items-center gap-2 flex-wrap">
          <span class="fw-semibold">Status:</span>
          <span>${A.erfullfort?F?`Konsolidert`:`Fullført`:`Ikkje fullført`}</span>
          ${A.erfullfort?`<button type="button" id="reopen-button" class="btn btn-sm btn-outline-warning">${F?`Gjenopne SNC-runden`:`Gjenåpne turnering`}</button>`:`<button type="button" id="complete-button" class="btn btn-sm btn-outline-success">${F?`Konsolider SNC-runden`:`Fullfør turnering`}</button>`}
        </div>`:``}
      <div class="admin-form-actions">
        <button type="submit" class="btn btn-primary">Lagre</button>
        ${_.onCancel?`<button type="button" id="cancel-button" class="btn btn-outline-secondary">Avbryt</button>`:``}
        ${v&&O?`<button type="button" id="delete-button" class="btn btn-outline-danger ms-auto">Slett stevne</button>`:``}
      </div>
    </form>`,y.replaceChildren(B),ye({slot:B.querySelector(`#kontakt-slot`),items:ke,name:`kontaktkasterid`,value:A.kontaktkasterid??null,placeholder:`Søk på etternamn eller fornamn…`,clearLabel:`— ingen kontaktperson —`});let V=B.querySelector(`#snc-hovud`),je=B.querySelector(`#snc-fieldset`),H=e=>B.querySelector(`[name="${e}"]`),U=H(`stevnetypeid`),W=H(`kategoriid`),G=H(`innledendekastemetodeid`),K=H(`avsluttendekastemetodeid`),q=B.querySelector(`#ernr`),J=B.querySelector(`#ernm`),Me=B.querySelector(`#ekskl`),Y=x.find(e=>e.navn===`NM`)?.id,X=x.find(e=>e.navn===`SNC`)?.id;A.stevnetypeid!=null&&(U.value=String(A.stevnetypeid));let Z=()=>X!=null&&U.value===String(X);U.addEventListener(`change`,()=>{Y!=null&&U.value===String(Y)&&(J.checked=!0),Z()&&(V.checked=!0),$()});function Q(e,t){let n=e.value,r=t.some(e=>String(e.id)===n);e.innerHTML=m(t,r?n:``)}function $(){Z()||(V.checked=!1),je.classList.toggle(`d-none`,P||!Z());let e=P||V.checked;if(Q(G,e?S.filter(e=>de(e.navn)):S),Q(K,e?C.filter(e=>le(e.navn)):C),P&&N){let e=(e,t)=>{e.value=t==null?``:String(t)};e(U,N.stevnetypeid),e(W,N.kategoriid),e(G,N.innledendekastemetodeid),e(K,N.avsluttendekastemetodeid),q.checked=N.ernorgesranking}for(let e of[J,Me])e.disabled=P,P&&(e.checked=!1);for(let e of[U,W,G,K,q])e.disabled=P}V.addEventListener(`change`,$),$(),B.querySelector(`#tournament-form`).addEventListener(`submit`,async e=>{e.preventDefault();let n=new FormData(e.target),r=N,i={navn:n.get(`navn`).trim(),sted:n.get(`sted`).trim()||null,dato:n.get(`dato`),tid:n.get(`tid`)||null,klubbid:O?h(n.get(`klubbid`)):L,stevnetypeid:P?r?.stevnetypeid??A.stevnetypeid??null:h(n.get(`stevnetypeid`)),innledendekastemetodeid:P?r?.innledendekastemetodeid??A.innledendekastemetodeid??null:h(n.get(`innledendekastemetodeid`)),avsluttendekastemetodeid:P?r?.avsluttendekastemetodeid??A.avsluttendekastemetodeid??null:h(n.get(`avsluttendekastemetodeid`)),kategoriid:P?r?.kategoriid??A.kategoriid??null:h(n.get(`kategoriid`)),kontaktkasterid:h(n.get(`kontaktkasterid`)),ernm:!P&&n.get(`ernm`)===`on`,ernorgesranking:P?r?.ernorgesranking??A.ernorgesranking??!1:n.get(`ernorgesranking`)===`on`,erekskludertfrarekorder:!P&&n.get(`erekskludertfrarekorder`)===`on`,resultaturl:n.get(`resultaturl`).trim()||null,er_snc_hovudstevne:!P&&V.checked,snc_hovudstevne_id:xe},{data:a,error:o}=v?await ee(v,i):await re(i);if(o){d(B,t(o));return}ae(v?`Stevnet er lagra.`:`Stevnet er oppretta.`,`success`),_.onSaved?.(a?.id??v,!v)}),_e(B,_),ge(B,{title:`Slett stevne`,message:`Slett «${k?.navn}»? Dette kan ikkje angrast.`,remove:()=>ue(v),onDeleted:_.onDeleted}),B.querySelector(`#complete-button`)?.addEventListener(`click`,async()=>{if(!await u({title:F?`Konsolider SNC-runden`:`Fullfør turnering`,message:F?`Slå saman lokalresultata i «${k?.navn}» til éi liste og rekne ut NC-poeng frå den samla plasseringa?`:`Fullfør «${k?.navn}»? Du kan ikkje lenger endre kampar og resultat for stevnet.`,danger:!0}))return;let{error:e}=F?await fe(v):await o(v);if(e){d(B,t(e));return}await g(_,v)}),B.querySelector(`#reopen-button`)?.addEventListener(`click`,async()=>{if(!await u({title:F?`Gjenopne SNC-runden`:`Gjenåpne turnering`,message:F?`Gjenopne «${k?.navn}»? Den samla lista og NC-poenga blir nullstilte.`:`Gjenåpne «${k?.navn}»? Kampar og resultat kan då endres igjen.`,danger:F}))return;let{error:e}=F?await oe(v):await a(v);if(e){d(B,t(e));return}await g(_,v)})}export{g as t};