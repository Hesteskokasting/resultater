import{t as e}from"./logError-BkXRFcqp.js";import{D as t,Et as n,Sr as r,U as i,Ut as a,an as o,f as s,g as ee,jt as te,lr as c,on as ne,ot as re,pt as ie,st as ae,ut as oe,vt as l,w as se,wt as ce,xr as u,zt as le}from"./index-D6KMvqKH.js";import{a as ue}from"./klubbService-B5pJ_Snb.js";import{a as d,i as de,n as fe,r as f,t as p}from"./_formButtons-BgpBtTPb.js";import{t as m}from"./dropdown-Ddn_lINp.js";import{t as h}from"./formNum-HGeagI_O.js";import{i as pe}from"./kasterService-D2Ihl5lb.js";import{t as me}from"./SearchSelect-Baef5YXj.js";import{n as he,t as ge}from"./completionActions-COzDq3BY.js";function _e(){let e=new URLSearchParams(location.hash.split(`?`)[1]??``).get(`snc`),t=e?Number(e):NaN;return Number.isFinite(t)&&t>0?t:null}function ve(e,t,n){let r=c(n.dato)+(n.tid?` kl. ${n.tid.slice(0,5)}`:``),i=[n.navn,r,n.sted].filter(Boolean).join(` · `),a=document.createElement(`div`);a.className=`text-center py-4`,a.innerHTML=`
    <div class="d-inline-flex align-items-center justify-content-center rounded-circle bg-success-subtle text-success fs-3 mb-3 admin-created-icon" aria-hidden="true">✓</div>
    <h3 class="h5 fw-bold">Stevnet er oppretta</h3>
    <p class="text-muted">${s(i)}</p>
    <div class="d-flex flex-wrap justify-content-center gap-2">
      <a class="btn btn-primary" href="#/stevne/${t}" id="goto-button">Gå til stevnet</a>
      <button type="button" class="btn btn-outline-primary" id="new-button">Opprett nytt stevne</button>
      ${e.onCancel?`<button type="button" class="btn btn-outline-secondary" id="cancel-button">Lukk</button>`:``}
    </div>`,a.querySelector(`#goto-button`).addEventListener(`click`,()=>e.onCancel?.()),a.querySelector(`#new-button`).addEventListener(`click`,()=>{g(e)}),p(a,e),e.container.replaceChildren(a),a.querySelector(`#goto-button`).focus()}async function g(_,v){let{container:y}=_;y.replaceChildren(r());let b=[],x=[],S=[],C=[],w=[],T=[],E=[];try{let e=await Promise.all([ue(),te(),l(),ie(),oe(),ce(),pe()]);b=e[0].data,x=e[1].data,S=e[2].data,C=e[3].data,w=e[4].data,T=e[5].data,E=e[6].data}catch(t){e(`stevneForm.mount`,t),y.replaceChildren(u(`Kunne ikkje laste skjema.`));return}let D=await t(),O=D?.profil?.role===`admin`,k=null;if(v){let{data:e,error:t}=await n(v);if(t||!e){y.replaceChildren(u(`Stevne ikkje funne.`));return}if(k=e,!i(D,k.klubbid)){y.replaceChildren(u(`Ingen tilgang til dette stevnet.`));return}}let A=k??{},ye=A.kategoriid??w.find(e=>e.navn===`Singel`)?.id,j=v?A.snc_hovudstevne_id??null:_e(),M=T.find(e=>e.id===j)??null,N=v?A.snc_hovudstevne_id!=null:M!==null,P=N?j:null,F=A.er_snc_hovudstevne===!0,I=N&&!v,be=A.navn??(I?M?.navn??``:``),xe=A.dato??(I?M?.dato??``:``),L=A.tid?A.tid.slice(0,5):v?``:I?M?.tid?.slice(0,5)??``:`11:00`,R=D?.club??null,Se=O?m(b,A.klubbid):m(b.filter(e=>e.id===R),R),Ce=m(x,A.stevnetypeid),we=m(S,A.innledendekastemetodeid),Te=m(C,A.avsluttendekastemetodeid),Ee=m(w,ye),De=E.filter(e=>e.eraktiv||v!=null).map(e=>({id:e.id,label:se(e)+(e.eraktiv?``:` (inaktiv)`),sublabel:e.klubb?.navn??null})),z=M?s(M.navn)+(M.dato?` (${c(M.dato)})`:``):``,{wrapper:B,headingHtml:Oe}=de(_);B.innerHTML=`
    ${Oe}
    <form id="tournament-form">
      ${N?`<div class="alert alert-info py-2">
          <div class="fw-semibold">Hovudstevne:${z?` ${z}`:``}.</div>
        </div>`:``}
      ${f(`Namn*`,`<input type="text" class="form-control" name="navn" value="${s(be)}" required>`)}
      ${f(`Stad`,`<input type="text" class="form-control" name="sted" value="${s(A.sted)}">`)}
      <div class="admin-form-grid">
        ${f(`Dato`,`<input type="date" class="form-control" name="dato" value="${xe}" required>`)}
        ${f(`Tid`,`<input type="time" class="form-control" name="tid" value="${L}">`)}
      </div>
      <div class="admin-form-grid">
        ${f(`Arrangørklubb`,`<select class="form-select" name="klubbid"${O?``:` disabled`}>${Se}</select>`)}
        ${f(`Kontaktperson`,`<span id="kontakt-slot"></span>`)}
      </div>
      <div class="admin-form-grid">
        ${f(`Stevnetype`,`<select class="form-select" name="stevnetypeid">${Ce}</select>`)}
        ${f(`Kategori`,`<select class="form-select" name="kategoriid">${Ee}</select>`)}
      </div>
      <div class="admin-form-grid">
        ${f(`Innleiande kastemetode`,`<select class="form-select" name="innledendekastemetodeid">${we}</select>`)}
        ${f(`Avsluttande kastemetode`,`<select class="form-select" name="avsluttendekastemetodeid">${Te}</select>`)}
      </div>
      <div class="mb-3 d-flex gap-4 flex-wrap">
        <div class="form-check"><input class="form-check-input" type="checkbox" name="ernm" id="ernm"${A.ernm?` checked`:``}><label class="form-check-label" for="ernm">Er NM</label></div>
        <div class="form-check"><input class="form-check-input" type="checkbox" name="ernorgesranking" id="ernr"${A.ernorgesranking?` checked`:``}><label class="form-check-label" for="ernr">Er Norgesranking</label></div>
        <div class="form-check"><input class="form-check-input" type="checkbox" name="erekskludertfrarekorder" id="ekskl"${A.erekskludertfrarekorder?` checked`:``}><label class="form-check-label" for="ekskl">Ekskl. frå rekorder</label></div>
      </div>
      ${f(`Resultat-URL`,`<input type="url" class="form-control" name="resultaturl" value="${s(A.resultaturl)}">`)}
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
          <button type="button" id="${A.erfullfort?`reopen`:`complete`}-button" class="btn btn-sm ${A.erfullfort?`btn-outline-warning`:`btn-outline-success`}">${ge({erfullfort:A.erfullfort===!0,isSncParent:F})}</button>
        </div>`:``}
      <div class="admin-form-actions">
        <button type="submit" class="btn btn-primary">Lagre</button>
        ${_.onCancel?`<button type="button" id="cancel-button" class="btn btn-outline-secondary">Avbryt</button>`:``}
        ${v&&O?`<button type="button" id="delete-button" class="btn btn-outline-danger ms-auto">Slett stevne</button>`:``}
      </div>
    </form>`,y.replaceChildren(B),me({slot:B.querySelector(`#kontakt-slot`),items:De,name:`kontaktkasterid`,value:A.kontaktkasterid??null,placeholder:`Søk på etternamn eller fornamn…`,clearLabel:`— ingen kontaktperson —`});let V=B.querySelector(`#snc-hovud`),ke=B.querySelector(`#snc-fieldset`),H=e=>B.querySelector(`[name="${e}"]`),U=H(`stevnetypeid`),W=H(`kategoriid`),G=H(`innledendekastemetodeid`),K=H(`avsluttendekastemetodeid`),q=B.querySelector(`#ernr`),J=B.querySelector(`#ernm`),Ae=B.querySelector(`#ekskl`),Y=x.find(e=>e.navn===`NM`)?.id,X=x.find(e=>e.navn===`SNC`)?.id;A.stevnetypeid!=null&&(U.value=String(A.stevnetypeid));let Z=()=>X!=null&&U.value===String(X);U.addEventListener(`change`,()=>{Y!=null&&U.value===String(Y)&&(J.checked=!0),Z()&&(V.checked=!0),$()});function Q(e,t){let n=e.value,r=t.some(e=>String(e.id)===n);e.innerHTML=m(t,r?n:``)}function $(){Z()||(V.checked=!1),ke.classList.toggle(`d-none`,N||!Z());let e=N||V.checked;if(Q(G,e?S.filter(e=>ne(e.navn)):S),Q(K,e?C.filter(e=>o(e.navn)):C),N&&M){let e=(e,t)=>{e.value=t==null?``:String(t)};e(U,M.stevnetypeid),e(W,M.kategoriid),e(G,M.innledendekastemetodeid),e(K,M.avsluttendekastemetodeid),q.checked=M.ernorgesranking}for(let e of[J,Ae])e.disabled=N,N&&(e.checked=!1);for(let e of[U,W,G,K,q])e.disabled=N}V.addEventListener(`change`,$),$(),B.querySelector(`#tournament-form`).addEventListener(`submit`,async e=>{e.preventDefault();let t=new FormData(e.target),n=M,r={navn:t.get(`navn`).trim(),sted:t.get(`sted`).trim()||null,dato:t.get(`dato`),tid:t.get(`tid`)||null,klubbid:O?h(t.get(`klubbid`)):R,stevnetypeid:N?n?.stevnetypeid??A.stevnetypeid??null:h(t.get(`stevnetypeid`)),innledendekastemetodeid:N?n?.innledendekastemetodeid??A.innledendekastemetodeid??null:h(t.get(`innledendekastemetodeid`)),avsluttendekastemetodeid:N?n?.avsluttendekastemetodeid??A.avsluttendekastemetodeid??null:h(t.get(`avsluttendekastemetodeid`)),kategoriid:N?n?.kategoriid??A.kategoriid??null:h(t.get(`kategoriid`)),kontaktkasterid:h(t.get(`kontaktkasterid`)),ernm:!N&&t.get(`ernm`)===`on`,ernorgesranking:N?n?.ernorgesranking??A.ernorgesranking??!1:t.get(`ernorgesranking`)===`on`,erekskludertfrarekorder:!N&&t.get(`erekskludertfrarekorder`)===`on`,resultaturl:t.get(`resultaturl`).trim()||null,er_snc_hovudstevne:!N&&V.checked,snc_hovudstevne_id:P},{data:i,error:o}=v?await le(v,r):await re(r);if(o){d(B,a(o));return}if(v){ee(`Stevnet er lagra.`,`success`),_.onSaved?.(v,!1);return}_.onSaved?.(i.id,!0),ve(_,i.id,r)}),p(B,_),fe(B,{title:`Slett stevne`,message:`Slett «${k?.navn}»? Dette kan ikkje angrast.`,remove:()=>ae(v),onDeleted:_.onDeleted}),B.querySelector(`#complete-button, #reopen-button`)?.addEventListener(`click`,async()=>{let e=await he({id:v,navn:k?.navn??``,erfullfort:A.erfullfort===!0,isSncParent:F});if(e){if(e.error){d(B,a(e.error));return}await g(_,v)}})}export{g as t};