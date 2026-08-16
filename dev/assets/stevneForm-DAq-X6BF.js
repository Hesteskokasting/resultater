import{n as e,t}from"./escHtml-Z0YwDf7L.js";import{B as n,Gt as r,H as i,Ht as a,It as o,J as ee,Kt as te,Ot as ne,Pt as re,Ut as s,V as c,Vt as l,Xt as u,Y as ie,Zt as ae,_t as oe,bt as se,d as ce,gt as le,ht as ue,wt as de}from"./index-CY82xwnt.js";import{a as fe}from"./klubbService-4kqWJyho.js";import{a as d,i as pe,n as me,r as f,t as he}from"./_formButtons-DiDCxmS9.js";import{t as p}from"./buildDropdownOptions-_eb4-29H.js";import{t as m}from"./formNum-HGeagI_O.js";import{i as h}from"./kasterService-CQnR08kH.js";import{t as g}from"./SearchSelect-9z2eJz8A.js";import{i as _}from"./kaster-2cwCS5i9.js";import{i as ge,r as _e}from"./kastemetode-Dor3Q-Ix.js";function ve(){let e=new URLSearchParams(location.hash.split(`?`)[1]??``).get(`snc`),t=e?Number(e):NaN;return Number.isFinite(t)&&t>0?t:null}async function v(y,b){let{container:x}=y;x.replaceChildren(ae());let S=[],C=[],w=[],T=[],E=[],D=[],O=[];try{let e=await Promise.all([fe(),l(),ne(),de(),se(),re(),h()]);S=e[0].data,C=e[1].data,w=e[2].data,T=e[3].data,E=e[4].data,D=e[5].data,O=e[6].data}catch(t){e(`stevneForm.mount`,t),x.replaceChildren(u(`Kunne ikkje laste skjema.`));return}let k=null;if(b){let{data:e,error:t}=await o(b);if(t||!e){x.replaceChildren(u(`Stevne ikkje funne.`));return}if(k=e,!await ee()&&!await ie(k.klubbid??void 0)){x.replaceChildren(u(`Ingen tilgang til dette stevnet.`));return}}let A=k??{},j=A.kategoriid??E.find(e=>e.navn===`Singel`)?.id,M=b?A.snc_hovudstevne_id??null:ve(),N=D.find(e=>e.id===M)??null,P=b?A.snc_hovudstevne_id!=null:N!==null,F=P?M:null,I=A.er_snc_hovudstevne===!0,L=P&&!b,ye=A.navn??(L?N?.navn??``:``),R=A.dato??(L?N?.dato??``:``),be=A.tid?A.tid.slice(0,5):b?``:L?N?.tid?.slice(0,5)??``:`11:00`,xe=p(S,A.klubbid),Se=p(C,A.stevnetypeid),Ce=p(w,A.innledendekastemetodeid),we=p(T,A.avsluttendekastemetodeid),Te=p(E,j),Ee=O.filter(e=>e.eraktiv||b!=null).map(e=>({id:e.id,label:_(e)+(e.eraktiv?``:` (inaktiv)`),sublabel:e.klubb?.navn??null})),z=N?t(N.navn)+(N.dato?` (${ce(N.dato)})`:``):``,{wrapper:B,headingHtml:De}=pe(y);B.innerHTML=`
    ${De}
    <form id="tournament-form">
      ${P?`<div class="alert alert-info py-2">
          <div class="fw-semibold">Hovudstevne:${z?` ${z}`:``}.</div>
        </div>`:``}
      ${f(`Namn*`,`<input type="text" class="form-control" name="navn" value="${t(ye)}" required>`)}
      ${f(`Stad`,`<input type="text" class="form-control" name="sted" value="${t(A.sted)}">`)}
      <div class="admin-form-grid">
        ${f(`Dato`,`<input type="date" class="form-control" name="dato" value="${R}" required>`)}
        ${f(`Tid`,`<input type="time" class="form-control" name="tid" value="${be}">`)}
      </div>
      <div class="admin-form-grid">
        ${f(`Arrangørklubb`,`<select class="form-select" name="klubbid">${xe}</select>`)}
        ${f(`Kontaktperson`,`<span id="kontakt-slot"></span>`)}
      </div>
      <div class="admin-form-grid">
        ${f(`Stevnetype`,`<select class="form-select" name="stevnetypeid">${Se}</select>`)}
        ${f(`Kategori`,`<select class="form-select" name="kategoriid">${Te}</select>`)}
      </div>
      <div class="admin-form-grid">
        ${f(`Innleiande kastemetode`,`<select class="form-select" name="innledendekastemetodeid">${Ce}</select>`)}
        ${f(`Avsluttande kastemetode`,`<select class="form-select" name="avsluttendekastemetodeid">${we}</select>`)}
      </div>
      <div class="mb-3 d-flex gap-4 flex-wrap">
        <div class="form-check"><input class="form-check-input" type="checkbox" name="ernm" id="ernm"${A.ernm?` checked`:``}><label class="form-check-label" for="ernm">Er NM</label></div>
        <div class="form-check"><input class="form-check-input" type="checkbox" name="ernorgesranking" id="ernr"${A.ernorgesranking?` checked`:``}><label class="form-check-label" for="ernr">Er Norgesranking</label></div>
        <div class="form-check"><input class="form-check-input" type="checkbox" name="erekskludertfrarekorder" id="ekskl"${A.erekskludertfrarekorder?` checked`:``}><label class="form-check-label" for="ekskl">Ekskl. frå rekorder</label></div>
      </div>
      ${f(`Resultat-URL`,`<input type="url" class="form-control" name="resultaturl" value="${t(A.resultaturl)}">`)}
      <fieldset class="mb-3 border rounded p-3 d-none" id="snc-fieldset">
        <legend class="form-label fw-semibold float-none w-auto px-1 mb-2">SNC</legend>
        <div class="form-check mb-2">
          <input class="form-check-input" type="checkbox" name="er_snc_hovudstevne" id="snc-hovud"${I?` checked`:``}>
          <label class="form-check-label" for="snc-hovud">Er SNC-hovudstevne</label>
        </div>
        <p class="form-text mb-0">

        </p>
      </fieldset>
      ${b?`
        <div class="mb-3 d-flex align-items-center gap-2 flex-wrap">
          <span class="fw-semibold">Status:</span>
          <span>${A.erfullfort?I?`Konsolidert`:`Fullført`:`Ikkje fullført`}</span>
          ${A.erfullfort?`<button type="button" id="reopen-button" class="btn btn-sm btn-outline-warning">${I?`Gjenopne SNC-runden`:`Gjenåpne turnering`}</button>`:`<button type="button" id="complete-button" class="btn btn-sm btn-outline-success">${I?`Konsolider SNC-runden`:`Fullfør turnering`}</button>`}
        </div>`:``}
      <div class="admin-form-actions">
        <button type="submit" class="btn btn-primary">Lagre</button>
        ${y.onCancel?`<button type="button" id="cancel-button" class="btn btn-outline-secondary">Avbryt</button>`:``}
        ${b?`<button type="button" id="delete-button" class="btn btn-outline-danger ms-auto">Slett stevne</button>`:``}
      </div>
    </form>`,x.replaceChildren(B),g({slot:B.querySelector(`#kontakt-slot`),items:Ee,name:`kontaktkasterid`,value:A.kontaktkasterid??null,placeholder:`Søk på etternamn eller fornamn…`,clearLabel:`— ingen kontaktperson —`});let V=B.querySelector(`#snc-hovud`),Oe=B.querySelector(`#snc-fieldset`),H=e=>B.querySelector(`[name="${e}"]`),U=H(`stevnetypeid`),W=H(`kategoriid`),G=H(`innledendekastemetodeid`),K=H(`avsluttendekastemetodeid`),q=B.querySelector(`#ernr`),J=B.querySelector(`#ernm`),ke=B.querySelector(`#ekskl`),Y=C.find(e=>e.navn===`NM`)?.id,X=C.find(e=>e.navn===`SNC`)?.id;A.stevnetypeid!=null&&(U.value=String(A.stevnetypeid));let Z=()=>X!=null&&U.value===String(X);U.addEventListener(`change`,()=>{Y!=null&&U.value===String(Y)&&(J.checked=!0),Z()&&(V.checked=!0),$()});function Q(e,t){let n=e.value,r=t.some(e=>String(e.id)===n);e.innerHTML=p(t,r?n:``)}function $(){Z()||(V.checked=!1),Oe.classList.toggle(`d-none`,P||!Z());let e=P||V.checked;if(Q(G,e?w.filter(e=>ge(e.navn)):w),Q(K,e?T.filter(e=>_e(e.navn)):T),P&&N){let e=(e,t)=>{e.value=t==null?``:String(t)};e(U,N.stevnetypeid),e(W,N.kategoriid),e(G,N.innledendekastemetodeid),e(K,N.avsluttendekastemetodeid),q.checked=N.ernorgesranking}for(let e of[J,ke])e.disabled=P,P&&(e.checked=!1);for(let e of[U,W,G,K,q])e.disabled=P}V.addEventListener(`change`,$),$(),B.querySelector(`#tournament-form`).addEventListener(`submit`,async e=>{e.preventDefault();let t=new FormData(e.target),r=N,i={navn:t.get(`navn`).trim(),sted:t.get(`sted`).trim()||null,dato:t.get(`dato`),tid:t.get(`tid`)||null,klubbid:m(t.get(`klubbid`)),stevnetypeid:P?r?.stevnetypeid??A.stevnetypeid??null:m(t.get(`stevnetypeid`)),innledendekastemetodeid:P?r?.innledendekastemetodeid??A.innledendekastemetodeid??null:m(t.get(`innledendekastemetodeid`)),avsluttendekastemetodeid:P?r?.avsluttendekastemetodeid??A.avsluttendekastemetodeid??null:m(t.get(`avsluttendekastemetodeid`)),kategoriid:P?r?.kategoriid??A.kategoriid??null:m(t.get(`kategoriid`)),kontaktkasterid:m(t.get(`kontaktkasterid`)),ernm:!P&&t.get(`ernm`)===`on`,ernorgesranking:P?r?.ernorgesranking??A.ernorgesranking??!1:t.get(`ernorgesranking`)===`on`,erekskludertfrarekorder:!P&&t.get(`erekskludertfrarekorder`)===`on`,resultaturl:t.get(`resultaturl`).trim()||null,er_snc_hovudstevne:!P&&V.checked,snc_hovudstevne_id:F},{data:a,error:o}=b?await te(b,i):await le(i);if(o){d(B,n(o));return}c(b?`Stevnet er lagra.`:`Stevnet er oppretta.`,`success`),y.onSaved?.(a?.id??b,!b)}),he(B,y),me(B,{title:`Slett stevne`,message:`Slett «${k?.navn}»? Dette kan ikkje angrast.`,remove:()=>oe(b),onDeleted:y.onDeleted}),B.querySelector(`#complete-button`)?.addEventListener(`click`,async()=>{if(!await i({title:I?`Konsolider SNC-runden`:`Fullfør turnering`,message:I?`Slå saman lokalresultata i «${k?.navn}» til éi liste og rekne ut NC-poeng frå den samla plasseringa?`:`Fullfør «${k?.navn}»? Du kan ikkje lenger endre kampar og resultat for stevnet.`,danger:!0}))return;let{error:e}=I?await ue(b):await r(b);if(e){d(B,n(e));return}await v(y,b)}),B.querySelector(`#reopen-button`)?.addEventListener(`click`,async()=>{if(!await i({title:I?`Gjenopne SNC-runden`:`Gjenåpne turnering`,message:I?`Gjenopne «${k?.navn}»? Den samla lista og NC-poenga blir nullstilte.`:`Gjenåpne «${k?.navn}»? Kampar og resultat kan då endres igjen.`,danger:I}))return;let{error:e}=I?await a(b):await s(b);if(e){d(B,n(e));return}await v(y,b)})}export{v as t};