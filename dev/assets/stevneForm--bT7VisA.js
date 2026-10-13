import{t as e}from"./logError-BkXRFcqp.js";import{Bt as t,C as n,E as r,H as i,It as a,Mt as o,Pt as s,St as ee,_r as c,ar as l,at as te,f as u,ft as ne,g as d,gt as re,h as ie,jt as ae,kt as oe,lt as se,nn as ce,ot as le,rn as ue,rt as de,vr as fe,wt as pe}from"./index-CkvmSVCa.js";import{a as me}from"./klubbService-B5pJ_Snb.js";import{a as f,i as he,n as ge,r as p,t as m}from"./_formButtons-B_zEyeVs.js";import{t as h}from"./dropdown-CJndo9Hx.js";import{t as g}from"./formNum-HGeagI_O.js";import{i as _e}from"./kasterService-D2Ihl5lb.js";import{t as ve}from"./SearchSelect-CNPWeL8F.js";function ye(){let e=new URLSearchParams(location.hash.split(`?`)[1]??``).get(`snc`),t=e?Number(e):NaN;return Number.isFinite(t)&&t>0?t:null}function be(e,t,n){let r=l(n.dato)+(n.tid?` kl. ${n.tid.slice(0,5)}`:``),i=[n.navn,r,n.sted].filter(Boolean).join(` · `),a=document.createElement(`div`);a.className=`text-center py-4`,a.innerHTML=`
    <div class="d-inline-flex align-items-center justify-content-center rounded-circle bg-success-subtle text-success fs-3 mb-3 admin-created-icon" aria-hidden="true">✓</div>
    <h3 class="h5 fw-bold">Stevnet er oppretta</h3>
    <p class="text-muted">${u(i)}</p>
    <div class="d-flex flex-wrap justify-content-center gap-2">
      <a class="btn btn-primary" href="#/stevne/${t}" id="goto-button">Gå til stevnet</a>
      <button type="button" class="btn btn-outline-primary" id="new-button">Opprett nytt stevne</button>
      ${e.onCancel?`<button type="button" class="btn btn-outline-secondary" id="cancel-button">Lukk</button>`:``}
    </div>`,a.querySelector(`#goto-button`).addEventListener(`click`,()=>e.onCancel?.()),a.querySelector(`#new-button`).addEventListener(`click`,()=>{_(e)}),m(a,e),e.container.replaceChildren(a),a.querySelector(`#goto-button`).focus()}async function _(v,y){let{container:b}=v;b.replaceChildren(fe());let x=[],S=[],C=[],w=[],T=[],E=[],D=[];try{let e=await Promise.all([me(),oe(),re(),ne(),se(),ee(),_e()]);x=e[0].data,S=e[1].data,C=e[2].data,w=e[3].data,T=e[4].data,E=e[5].data,D=e[6].data}catch(t){e(`stevneForm.mount`,t),b.replaceChildren(c(`Kunne ikkje laste skjema.`));return}let O=await r(),k=O?.profil?.role===`admin`,A=null;if(y){let{data:e,error:t}=await pe(y);if(t||!e){b.replaceChildren(c(`Stevne ikkje funne.`));return}if(A=e,!i(O,A.klubbid)){b.replaceChildren(c(`Ingen tilgang til dette stevnet.`));return}}let j=A??{},xe=j.kategoriid??T.find(e=>e.navn===`Singel`)?.id,M=y?j.snc_hovudstevne_id??null:ye(),N=E.find(e=>e.id===M)??null,P=y?j.snc_hovudstevne_id!=null:N!==null,Se=P?M:null,F=j.er_snc_hovudstevne===!0,I=P&&!y,Ce=j.navn??(I?N?.navn??``:``),L=j.dato??(I?N?.dato??``:``),we=j.tid?j.tid.slice(0,5):y?``:I?N?.tid?.slice(0,5)??``:`11:00`,R=O?.club??null,Te=k?h(x,j.klubbid):h(x.filter(e=>e.id===R),R),Ee=h(S,j.stevnetypeid),De=h(C,j.innledendekastemetodeid),Oe=h(w,j.avsluttendekastemetodeid),ke=h(T,xe),Ae=D.filter(e=>e.eraktiv||y!=null).map(e=>({id:e.id,label:n(e)+(e.eraktiv?``:` (inaktiv)`),sublabel:e.klubb?.navn??null})),z=N?u(N.navn)+(N.dato?` (${l(N.dato)})`:``):``,{wrapper:B,headingHtml:je}=he(v);B.innerHTML=`
    ${je}
    <form id="tournament-form">
      ${P?`<div class="alert alert-info py-2">
          <div class="fw-semibold">Hovudstevne:${z?` ${z}`:``}.</div>
        </div>`:``}
      ${p(`Namn*`,`<input type="text" class="form-control" name="navn" value="${u(Ce)}" required>`)}
      ${p(`Stad`,`<input type="text" class="form-control" name="sted" value="${u(j.sted)}">`)}
      <div class="admin-form-grid">
        ${p(`Dato`,`<input type="date" class="form-control" name="dato" value="${L}" required>`)}
        ${p(`Tid`,`<input type="time" class="form-control" name="tid" value="${we}">`)}
      </div>
      <div class="admin-form-grid">
        ${p(`Arrangørklubb`,`<select class="form-select" name="klubbid"${k?``:` disabled`}>${Te}</select>`)}
        ${p(`Kontaktperson`,`<span id="kontakt-slot"></span>`)}
      </div>
      <div class="admin-form-grid">
        ${p(`Stevnetype`,`<select class="form-select" name="stevnetypeid">${Ee}</select>`)}
        ${p(`Kategori`,`<select class="form-select" name="kategoriid">${ke}</select>`)}
      </div>
      <div class="admin-form-grid">
        ${p(`Innleiande kastemetode`,`<select class="form-select" name="innledendekastemetodeid">${De}</select>`)}
        ${p(`Avsluttande kastemetode`,`<select class="form-select" name="avsluttendekastemetodeid">${Oe}</select>`)}
      </div>
      <div class="mb-3 d-flex gap-4 flex-wrap">
        <div class="form-check"><input class="form-check-input" type="checkbox" name="ernm" id="ernm"${j.ernm?` checked`:``}><label class="form-check-label" for="ernm">Er NM</label></div>
        <div class="form-check"><input class="form-check-input" type="checkbox" name="ernorgesranking" id="ernr"${j.ernorgesranking?` checked`:``}><label class="form-check-label" for="ernr">Er Norgesranking</label></div>
        <div class="form-check"><input class="form-check-input" type="checkbox" name="erekskludertfrarekorder" id="ekskl"${j.erekskludertfrarekorder?` checked`:``}><label class="form-check-label" for="ekskl">Ekskl. frå rekorder</label></div>
      </div>
      ${p(`Resultat-URL`,`<input type="url" class="form-control" name="resultaturl" value="${u(j.resultaturl)}">`)}
      <fieldset class="mb-3 border rounded p-3 d-none" id="snc-fieldset">
        <legend class="form-label fw-semibold float-none w-auto px-1 mb-2">SNC</legend>
        <div class="form-check mb-2">
          <input class="form-check-input" type="checkbox" name="er_snc_hovudstevne" id="snc-hovud"${F?` checked`:``}>
          <label class="form-check-label" for="snc-hovud">Er SNC-hovudstevne</label>
        </div>
        <p class="form-text mb-0">

        </p>
      </fieldset>
      ${y?`
        <div class="mb-3 d-flex align-items-center gap-2 flex-wrap">
          <span class="fw-semibold">Status:</span>
          <span>${j.erfullfort?F?`Konsolidert`:`Fullført`:`Ikkje fullført`}</span>
          ${j.erfullfort?`<button type="button" id="reopen-button" class="btn btn-sm btn-outline-warning">${F?`Gjenopne SNC-runden`:`Gjenåpne turnering`}</button>`:`<button type="button" id="complete-button" class="btn btn-sm btn-outline-success">${F?`Konsolider SNC-runden`:`Fullfør turnering`}</button>`}
        </div>`:``}
      <div class="admin-form-actions">
        <button type="submit" class="btn btn-primary">Lagre</button>
        ${v.onCancel?`<button type="button" id="cancel-button" class="btn btn-outline-secondary">Avbryt</button>`:``}
        ${y&&k?`<button type="button" id="delete-button" class="btn btn-outline-danger ms-auto">Slett stevne</button>`:``}
      </div>
    </form>`,b.replaceChildren(B),ve({slot:B.querySelector(`#kontakt-slot`),items:Ae,name:`kontaktkasterid`,value:j.kontaktkasterid??null,placeholder:`Søk på etternamn eller fornamn…`,clearLabel:`— ingen kontaktperson —`});let V=B.querySelector(`#snc-hovud`),Me=B.querySelector(`#snc-fieldset`),H=e=>B.querySelector(`[name="${e}"]`),U=H(`stevnetypeid`),W=H(`kategoriid`),G=H(`innledendekastemetodeid`),K=H(`avsluttendekastemetodeid`),q=B.querySelector(`#ernr`),J=B.querySelector(`#ernm`),Ne=B.querySelector(`#ekskl`),Y=S.find(e=>e.navn===`NM`)?.id,X=S.find(e=>e.navn===`SNC`)?.id;j.stevnetypeid!=null&&(U.value=String(j.stevnetypeid));let Z=()=>X!=null&&U.value===String(X);U.addEventListener(`change`,()=>{Y!=null&&U.value===String(Y)&&(J.checked=!0),Z()&&(V.checked=!0),$()});function Q(e,t){let n=e.value,r=t.some(e=>String(e.id)===n);e.innerHTML=h(t,r?n:``)}function $(){Z()||(V.checked=!1),Me.classList.toggle(`d-none`,P||!Z());let e=P||V.checked;if(Q(G,e?C.filter(e=>ue(e.navn)):C),Q(K,e?w.filter(e=>ce(e.navn)):w),P&&N){let e=(e,t)=>{e.value=t==null?``:String(t)};e(U,N.stevnetypeid),e(W,N.kategoriid),e(G,N.innledendekastemetodeid),e(K,N.avsluttendekastemetodeid),q.checked=N.ernorgesranking}for(let e of[J,Ne])e.disabled=P,P&&(e.checked=!1);for(let e of[U,W,G,K,q])e.disabled=P}V.addEventListener(`change`,$),$(),B.querySelector(`#tournament-form`).addEventListener(`submit`,async e=>{e.preventDefault();let n=new FormData(e.target),r=N,i={navn:n.get(`navn`).trim(),sted:n.get(`sted`).trim()||null,dato:n.get(`dato`),tid:n.get(`tid`)||null,klubbid:k?g(n.get(`klubbid`)):R,stevnetypeid:P?r?.stevnetypeid??j.stevnetypeid??null:g(n.get(`stevnetypeid`)),innledendekastemetodeid:P?r?.innledendekastemetodeid??j.innledendekastemetodeid??null:g(n.get(`innledendekastemetodeid`)),avsluttendekastemetodeid:P?r?.avsluttendekastemetodeid??j.avsluttendekastemetodeid??null:g(n.get(`avsluttendekastemetodeid`)),kategoriid:P?r?.kategoriid??j.kategoriid??null:g(n.get(`kategoriid`)),kontaktkasterid:g(n.get(`kontaktkasterid`)),ernm:!P&&n.get(`ernm`)===`on`,ernorgesranking:P?r?.ernorgesranking??j.ernorgesranking??!1:n.get(`ernorgesranking`)===`on`,erekskludertfrarekorder:!P&&n.get(`erekskludertfrarekorder`)===`on`,resultaturl:n.get(`resultaturl`).trim()||null,er_snc_hovudstevne:!P&&V.checked,snc_hovudstevne_id:Se},{data:o,error:s}=y?await a(y,i):await te(i);if(s){f(B,t(s));return}if(y){ie(`Stevnet er lagra.`,`success`),v.onSaved?.(y,!1);return}v.onSaved?.(o.id,!0),be(v,o.id,i)}),m(B,v),ge(B,{title:`Slett stevne`,message:`Slett «${A?.navn}»? Dette kan ikkje angrast.`,remove:()=>le(y),onDeleted:v.onDeleted}),B.querySelector(`#complete-button`)?.addEventListener(`click`,async()=>{if(!await d({title:F?`Konsolider SNC-runden`:`Fullfør turnering`,message:F?`Slå saman lokalresultata i «${A?.navn}» til éi liste og rekne ut NC-poeng frå den samla plasseringa?`:`Fullfør «${A?.navn}»? Du kan ikkje lenger endre kampar og resultat for stevnet.`,danger:!0}))return;let{error:e}=F?await de(y):await s(y);if(e){f(B,t(e));return}await _(v,y)}),B.querySelector(`#reopen-button`)?.addEventListener(`click`,async()=>{if(!await d({title:F?`Gjenopne SNC-runden`:`Gjenåpne turnering`,message:F?`Gjenopne «${A?.navn}»? Den samla lista og NC-poenga blir nullstilte.`:`Gjenåpne «${A?.navn}»? Kampar og resultat kan då endres igjen.`,danger:F}))return;let{error:e}=F?await ae(y):await o(y);if(e){f(B,t(e));return}await _(v,y)})}export{_ as t};