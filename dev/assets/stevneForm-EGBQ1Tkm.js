import{t as e}from"./logError-ByTg738k.js";import{$ as t,C as n,Ct as r,Dt as i,Nt as a,O as o,Qn as s,Tt as ee,Xt as te,Yt as ne,Z as re,dr as ie,et as ae,f as c,g as l,gt as oe,h as u,k as d,kt as se,ot as ce,rt as le,ur as f,ut as ue,vt as p,wt as de}from"./index-CKF_crql.js";import{a as fe}from"./klubbService-pPakrKDt.js";import{a as m,i as pe,n as me,r as h,t as he}from"./_formButtons-1XK7B3OF.js";import{t as g}from"./dropdown-StSKniAr.js";import{t as _}from"./formNum-HGeagI_O.js";import{i as ge}from"./kasterService-BN8H2rLx.js";import{t as _e}from"./SearchSelect-D-crG2OI.js";function v(){let e=new URLSearchParams(location.hash.split(`?`)[1]??``).get(`snc`),t=e?Number(e):NaN;return Number.isFinite(t)&&t>0?t:null}async function y(b,x){let{container:S}=b;S.replaceChildren(ie());let C=[],w=[],T=[],E=[],D=[],O=[],k=[];try{let e=await Promise.all([fe(),r(),ue(),ce(),le(),oe(),ge()]);C=e[0].data,w=e[1].data,T=e[2].data,E=e[3].data,D=e[4].data,O=e[5].data,k=e[6].data}catch(t){e(`stevneForm.mount`,t),S.replaceChildren(f(`Kunne ikkje laste skjema.`));return}let A=null;if(x){let{data:e,error:t}=await p(x);if(t||!e){S.replaceChildren(f(`Stevne ikkje funne.`));return}if(A=e,!await o()&&!await d(A.klubbid??void 0)){S.replaceChildren(f(`Ingen tilgang til dette stevnet.`));return}}let j=A??{},M=j.kategoriid??D.find(e=>e.navn===`Singel`)?.id,N=x?j.snc_hovudstevne_id??null:v(),P=O.find(e=>e.id===N)??null,F=x?j.snc_hovudstevne_id!=null:P!==null,I=F?N:null,L=j.er_snc_hovudstevne===!0,R=F&&!x,ve=j.navn??(R?P?.navn??``:``),ye=j.dato??(R?P?.dato??``:``),be=j.tid?j.tid.slice(0,5):x?``:R?P?.tid?.slice(0,5)??``:`11:00`,xe=g(C,j.klubbid),Se=g(w,j.stevnetypeid),Ce=g(T,j.innledendekastemetodeid),we=g(E,j.avsluttendekastemetodeid),Te=g(D,M),Ee=k.filter(e=>e.eraktiv||x!=null).map(e=>({id:e.id,label:n(e)+(e.eraktiv?``:` (inaktiv)`),sublabel:e.klubb?.navn??null})),z=P?c(P.navn)+(P.dato?` (${s(P.dato)})`:``):``,{wrapper:B,headingHtml:De}=pe(b);B.innerHTML=`
    ${De}
    <form id="tournament-form">
      ${F?`<div class="alert alert-info py-2">
          <div class="fw-semibold">Hovudstevne:${z?` ${z}`:``}.</div>
        </div>`:``}
      ${h(`Namn*`,`<input type="text" class="form-control" name="navn" value="${c(ve)}" required>`)}
      ${h(`Stad`,`<input type="text" class="form-control" name="sted" value="${c(j.sted)}">`)}
      <div class="admin-form-grid">
        ${h(`Dato`,`<input type="date" class="form-control" name="dato" value="${ye}" required>`)}
        ${h(`Tid`,`<input type="time" class="form-control" name="tid" value="${be}">`)}
      </div>
      <div class="admin-form-grid">
        ${h(`Arrangørklubb`,`<select class="form-select" name="klubbid">${xe}</select>`)}
        ${h(`Kontaktperson`,`<span id="kontakt-slot"></span>`)}
      </div>
      <div class="admin-form-grid">
        ${h(`Stevnetype`,`<select class="form-select" name="stevnetypeid">${Se}</select>`)}
        ${h(`Kategori`,`<select class="form-select" name="kategoriid">${Te}</select>`)}
      </div>
      <div class="admin-form-grid">
        ${h(`Innleiande kastemetode`,`<select class="form-select" name="innledendekastemetodeid">${Ce}</select>`)}
        ${h(`Avsluttande kastemetode`,`<select class="form-select" name="avsluttendekastemetodeid">${we}</select>`)}
      </div>
      <div class="mb-3 d-flex gap-4 flex-wrap">
        <div class="form-check"><input class="form-check-input" type="checkbox" name="ernm" id="ernm"${j.ernm?` checked`:``}><label class="form-check-label" for="ernm">Er NM</label></div>
        <div class="form-check"><input class="form-check-input" type="checkbox" name="ernorgesranking" id="ernr"${j.ernorgesranking?` checked`:``}><label class="form-check-label" for="ernr">Er Norgesranking</label></div>
        <div class="form-check"><input class="form-check-input" type="checkbox" name="erekskludertfrarekorder" id="ekskl"${j.erekskludertfrarekorder?` checked`:``}><label class="form-check-label" for="ekskl">Ekskl. frå rekorder</label></div>
      </div>
      ${h(`Resultat-URL`,`<input type="url" class="form-control" name="resultaturl" value="${c(j.resultaturl)}">`)}
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
    </form>`,S.replaceChildren(B),_e({slot:B.querySelector(`#kontakt-slot`),items:Ee,name:`kontaktkasterid`,value:j.kontaktkasterid??null,placeholder:`Søk på etternamn eller fornamn…`,clearLabel:`— ingen kontaktperson —`});let V=B.querySelector(`#snc-hovud`),Oe=B.querySelector(`#snc-fieldset`),H=e=>B.querySelector(`[name="${e}"]`),U=H(`stevnetypeid`),W=H(`kategoriid`),G=H(`innledendekastemetodeid`),K=H(`avsluttendekastemetodeid`),q=B.querySelector(`#ernr`),J=B.querySelector(`#ernm`),ke=B.querySelector(`#ekskl`),Y=w.find(e=>e.navn===`NM`)?.id,X=w.find(e=>e.navn===`SNC`)?.id;j.stevnetypeid!=null&&(U.value=String(j.stevnetypeid));let Z=()=>X!=null&&U.value===String(X);U.addEventListener(`change`,()=>{Y!=null&&U.value===String(Y)&&(J.checked=!0),Z()&&(V.checked=!0),$()});function Q(e,t){let n=e.value,r=t.some(e=>String(e.id)===n);e.innerHTML=g(t,r?n:``)}function $(){Z()||(V.checked=!1),Oe.classList.toggle(`d-none`,F||!Z());let e=F||V.checked;if(Q(G,e?T.filter(e=>te(e.navn)):T),Q(K,e?E.filter(e=>ne(e.navn)):E),F&&P){let e=(e,t)=>{e.value=t==null?``:String(t)};e(U,P.stevnetypeid),e(W,P.kategoriid),e(G,P.innledendekastemetodeid),e(K,P.avsluttendekastemetodeid),q.checked=P.ernorgesranking}for(let e of[J,ke])e.disabled=F,F&&(e.checked=!1);for(let e of[U,W,G,K,q])e.disabled=F}V.addEventListener(`change`,$),$(),B.querySelector(`#tournament-form`).addEventListener(`submit`,async e=>{e.preventDefault();let n=new FormData(e.target),r=P,i={navn:n.get(`navn`).trim(),sted:n.get(`sted`).trim()||null,dato:n.get(`dato`),tid:n.get(`tid`)||null,klubbid:_(n.get(`klubbid`)),stevnetypeid:F?r?.stevnetypeid??j.stevnetypeid??null:_(n.get(`stevnetypeid`)),innledendekastemetodeid:F?r?.innledendekastemetodeid??j.innledendekastemetodeid??null:_(n.get(`innledendekastemetodeid`)),avsluttendekastemetodeid:F?r?.avsluttendekastemetodeid??j.avsluttendekastemetodeid??null:_(n.get(`avsluttendekastemetodeid`)),kategoriid:F?r?.kategoriid??j.kategoriid??null:_(n.get(`kategoriid`)),kontaktkasterid:_(n.get(`kontaktkasterid`)),ernm:!F&&n.get(`ernm`)===`on`,ernorgesranking:F?r?.ernorgesranking??j.ernorgesranking??!1:n.get(`ernorgesranking`)===`on`,erekskludertfrarekorder:!F&&n.get(`erekskludertfrarekorder`)===`on`,resultaturl:n.get(`resultaturl`).trim()||null,er_snc_hovudstevne:!F&&V.checked,snc_hovudstevne_id:I},{data:o,error:s}=x?await se(x,i):await t(i);if(s){m(B,a(s));return}u(x?`Stevnet er lagra.`:`Stevnet er oppretta.`,`success`),b.onSaved?.(o?.id??x,!x)}),he(B,b),me(B,{title:`Slett stevne`,message:`Slett «${A?.navn}»? Dette kan ikkje angrast.`,remove:()=>ae(x),onDeleted:b.onDeleted}),B.querySelector(`#complete-button`)?.addEventListener(`click`,async()=>{if(!await l({title:L?`Konsolider SNC-runden`:`Fullfør turnering`,message:L?`Slå saman lokalresultata i «${A?.navn}» til éi liste og rekne ut NC-poeng frå den samla plasseringa?`:`Fullfør «${A?.navn}»? Du kan ikkje lenger endre kampar og resultat for stevnet.`,danger:!0}))return;let{error:e}=L?await re(x):await i(x);if(e){m(B,a(e));return}await y(b,x)}),B.querySelector(`#reopen-button`)?.addEventListener(`click`,async()=>{if(!await l({title:L?`Gjenopne SNC-runden`:`Gjenåpne turnering`,message:L?`Gjenopne «${A?.navn}»? Den samla lista og NC-poenga blir nullstilte.`:`Gjenåpne «${A?.navn}»? Kampar og resultat kan då endres igjen.`,danger:L}))return;let{error:e}=L?await de(x):await ee(x);if(e){m(B,a(e));return}await y(b,x)})}export{y as t};