import{t as e}from"./logError-CB4-2Lin.js";import{At as t,L as n,Lt as r,Nt as i,Pt as ee,R as a,St as o,at as te,c as s,ct as ne,ft as c,gt as re,it as ie,j as l,jt as ae,kt as oe,rt as se,wt as ce,zt as u}from"./index-Dib9Q0Sp.js";import{a as d,i as f,n as p,o as m,r as le,s as ue,t as de}from"./_formButtons-B6Mtm97q.js";import{t as fe}from"./LoadingState-C6NB62Ct.js";import{a as pe}from"./klubbService-BuTqcngo.js";import{t as h}from"./buildDropdownOptions-BWhegM12.js";import{t as g}from"./formNum-HGeagI_O.js";import{i as me}from"./kasterService-D9jqvobU.js";import{t as he}from"./SearchSelect-ubpkwWhs.js";import{i as ge}from"./kaster-2cwCS5i9.js";import{i as _e,r as ve}from"./kastemetode-Dor3Q-Ix.js";function _(){let e=new URLSearchParams(location.hash.split(`?`)[1]??``).get(`snc`),t=e?Number(e):NaN;return Number.isFinite(t)&&t>0?t:null}async function v(y,b){let{container:x}=y;x.replaceChildren(fe());let S=[],C=[],w=[],T=[],E=[],D=[],O=[];try{let e=await Promise.all([pe(),oe(),re(),c(),ne(),o(),me()]);S=e[0].data,C=e[1].data,w=e[2].data,T=e[3].data,E=e[4].data,D=e[5].data,O=e[6].data}catch(t){e(`stevneForm.mount`,t),x.replaceChildren(r(`Kunne ikkje laste skjema.`));return}let k=null;if(b){let{data:e,error:t}=await ce(b);if(t||!e){x.replaceChildren(r(`Stevne ikkje funne.`));return}if(k=e,!await n()&&!await a(k.klubbid??void 0)){x.replaceChildren(r(`Ingen tilgang til dette stevnet.`));return}}let A=k??{},j=A.kategoriid??E.find(e=>e.navn===`Singel`)?.id,M=b?A.snc_hovudstevne_id??null:_(),N=D.find(e=>e.id===M)??null,P=b?A.snc_hovudstevne_id!=null:N!==null,F=P?M:null,I=A.er_snc_hovudstevne===!0,L=P&&!b,ye=A.navn??(L?N?.navn??``:``),R=A.dato??(L?N?.dato??``:``),be=A.tid?A.tid.slice(0,5):b?``:L?N?.tid?.slice(0,5)??``:`11:00`,xe=h(S,A.klubbid),Se=h(C,A.stevnetypeid),Ce=h(w,A.innledendekastemetodeid),we=h(T,A.avsluttendekastemetodeid),Te=h(E,j),Ee=O.filter(e=>e.eraktiv||b!=null).map(e=>({id:e.id,label:ge(e)+(e.eraktiv?``:` (inaktiv)`),sublabel:e.klubb?.navn??null})),z=N?s(N.navn)+(N.dato?` (${u(N.dato)})`:``):``,{wrapper:B,headingHtml:De}=le(y);B.innerHTML=`
    ${De}
    <form id="tournament-form">
      ${P?`<div class="alert alert-info py-2">
          <div class="fw-semibold">Hovudstevne:${z?` ${z}`:``}.</div>
        </div>`:``}
      ${d(`Namn*`,`<input type="text" class="form-control" name="navn" value="${s(ye)}" required>`)}
      ${d(`Stad`,`<input type="text" class="form-control" name="sted" value="${s(A.sted)}">`)}
      <div class="admin-form-grid">
        ${d(`Dato`,`<input type="date" class="form-control" name="dato" value="${R}" required>`)}
        ${d(`Tid`,`<input type="time" class="form-control" name="tid" value="${be}">`)}
      </div>
      <div class="admin-form-grid">
        ${d(`Arrangørklubb`,`<select class="form-select" name="klubbid">${xe}</select>`)}
        ${d(`Kontaktperson`,`<span id="kontakt-slot"></span>`)}
      </div>
      <div class="admin-form-grid">
        ${d(`Stevnetype`,`<select class="form-select" name="stevnetypeid">${Se}</select>`)}
        ${d(`Kategori`,`<select class="form-select" name="kategoriid">${Te}</select>`)}
      </div>
      <div class="admin-form-grid">
        ${d(`Innleiande kastemetode`,`<select class="form-select" name="innledendekastemetodeid">${Ce}</select>`)}
        ${d(`Avsluttande kastemetode`,`<select class="form-select" name="avsluttendekastemetodeid">${we}</select>`)}
      </div>
      <div class="mb-3 d-flex gap-4 flex-wrap">
        <div class="form-check"><input class="form-check-input" type="checkbox" name="ernm" id="ernm"${A.ernm?` checked`:``}><label class="form-check-label" for="ernm">Er NM</label></div>
        <div class="form-check"><input class="form-check-input" type="checkbox" name="ernorgesranking" id="ernr"${A.ernorgesranking?` checked`:``}><label class="form-check-label" for="ernr">Er Norgesranking</label></div>
        <div class="form-check"><input class="form-check-input" type="checkbox" name="erekskludertfrarekorder" id="ekskl"${A.erekskludertfrarekorder?` checked`:``}><label class="form-check-label" for="ekskl">Ekskl. frå rekorder</label></div>
      </div>
      ${d(`Resultat-URL`,`<input type="url" class="form-control" name="resultaturl" value="${s(A.resultaturl)}">`)}
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
    </form>`,x.replaceChildren(B),he({slot:B.querySelector(`#kontakt-slot`),items:Ee,name:`kontaktkasterid`,value:A.kontaktkasterid??null,placeholder:`Søk på etternamn eller fornamn…`,clearLabel:`— ingen kontaktperson —`});let V=B.querySelector(`#snc-hovud`),Oe=B.querySelector(`#snc-fieldset`),H=e=>B.querySelector(`[name="${e}"]`),U=H(`stevnetypeid`),W=H(`kategoriid`),G=H(`innledendekastemetodeid`),K=H(`avsluttendekastemetodeid`),q=B.querySelector(`#ernr`),J=B.querySelector(`#ernm`),ke=B.querySelector(`#ekskl`),Y=C.find(e=>e.navn===`NM`)?.id,X=C.find(e=>e.navn===`SNC`)?.id;A.stevnetypeid!=null&&(U.value=String(A.stevnetypeid));let Z=()=>X!=null&&U.value===String(X);U.addEventListener(`change`,()=>{Y!=null&&U.value===String(Y)&&(J.checked=!0),Z()&&(V.checked=!0),$()});function Q(e,t){let n=e.value,r=t.some(e=>String(e.id)===n);e.innerHTML=h(t,r?n:``)}function $(){Z()||(V.checked=!1),Oe.classList.toggle(`d-none`,P||!Z());let e=P||V.checked;if(Q(G,e?w.filter(e=>_e(e.navn)):w),Q(K,e?T.filter(e=>ve(e.navn)):T),P&&N){let e=(e,t)=>{e.value=t==null?``:String(t)};e(U,N.stevnetypeid),e(W,N.kategoriid),e(G,N.innledendekastemetodeid),e(K,N.avsluttendekastemetodeid),q.checked=N.ernorgesranking}for(let e of[J,ke])e.disabled=P,P&&(e.checked=!1);for(let e of[U,W,G,K,q])e.disabled=P}V.addEventListener(`change`,$),$(),B.querySelector(`#tournament-form`).addEventListener(`submit`,async e=>{e.preventDefault();let t=new FormData(e.target),n=N,r={navn:t.get(`navn`).trim(),sted:t.get(`sted`).trim()||null,dato:t.get(`dato`),tid:t.get(`tid`)||null,klubbid:g(t.get(`klubbid`)),stevnetypeid:P?n?.stevnetypeid??A.stevnetypeid??null:g(t.get(`stevnetypeid`)),innledendekastemetodeid:P?n?.innledendekastemetodeid??A.innledendekastemetodeid??null:g(t.get(`innledendekastemetodeid`)),avsluttendekastemetodeid:P?n?.avsluttendekastemetodeid??A.avsluttendekastemetodeid??null:g(t.get(`avsluttendekastemetodeid`)),kategoriid:P?n?.kategoriid??A.kategoriid??null:g(t.get(`kategoriid`)),kontaktkasterid:g(t.get(`kontaktkasterid`)),ernm:!P&&t.get(`ernm`)===`on`,ernorgesranking:P?n?.ernorgesranking??A.ernorgesranking??!1:t.get(`ernorgesranking`)===`on`,erekskludertfrarekorder:!P&&t.get(`erekskludertfrarekorder`)===`on`,resultaturl:t.get(`resultaturl`).trim()||null,er_snc_hovudstevne:!P&&V.checked,snc_hovudstevne_id:F},{data:i,error:a}=b?await ee(b,r):await ie(r);if(a){m(B,f(a));return}ue(B,`Stevnet er lagra.`),y.onSaved?.(i?.id??b,!b)}),de(B,y),p(B,{title:`Slett stevne`,message:`Slett «${k?.navn}»? Dette kan ikkje angrast.`,remove:()=>te(b),onDeleted:y.onDeleted}),B.querySelector(`#complete-button`)?.addEventListener(`click`,async()=>{if(!await l({title:I?`Konsolider SNC-runden`:`Fullfør turnering`,message:I?`Slå saman lokalresultata i «${k?.navn}» til éi liste og rekne ut NC-poeng frå den samla plasseringa?`:`Fullfør «${k?.navn}»? Du kan ikkje lenger endre kampar og resultat for stevnet.`,danger:!0}))return;let{error:e}=I?await se(b):await i(b);if(e){m(B,f(e));return}await v(y,b)}),B.querySelector(`#reopen-button`)?.addEventListener(`click`,async()=>{if(!await l({title:I?`Gjenopne SNC-runden`:`Gjenåpne turnering`,message:I?`Gjenopne «${k?.navn}»? Den samla lista og NC-poenga blir nullstilte.`:`Gjenåpne «${k?.navn}»? Kampar og resultat kan då endres igjen.`,danger:I}))return;let{error:e}=I?await t(b):await ae(b);if(e){m(B,f(e));return}await v(y,b)})}export{v as t};