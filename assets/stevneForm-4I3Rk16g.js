import{t as e}from"./logError-CB4-2Lin.js";import{At as t,L as n,Lt as r,Nt as i,Pt as ee,R as a,St as te,at as ne,c as o,ct as re,ft as ie,gt as ae,it as oe,j as s,jt as se,kt as c,rt as l,wt as u,zt as d}from"./index-HV6oZghK.js";import{a as f,i as p,n as ce,o as m,r as h,s as le,t as ue}from"./_formButtons-3yhgsTJU.js";import{t as de}from"./LoadingState-C6NB62Ct.js";import{a as fe}from"./klubbService-BuTqcngo.js";import{t as g}from"./buildDropdownOptions-Cb0G9Gy7.js";import{t as _}from"./formNum-HGeagI_O.js";import{i as pe}from"./kasterService-CGoztUaG.js";import{r as me}from"./kaster-CGWDYFbf.js";import{i as v,r as he}from"./kastemetode-Dor3Q-Ix.js";function ge(){let e=new URLSearchParams(location.hash.split(`?`)[1]??``).get(`snc`),t=e?Number(e):NaN;return Number.isFinite(t)&&t>0?t:null}async function y(b,x){let{container:S}=b;S.replaceChildren(de());let C=[],w=[],T=[],E=[],D=[],O=[],k=[];try{let e=await Promise.all([fe(),c(),ae(),ie(),re(),te(),pe()]);C=e[0].data,w=e[1].data,T=e[2].data,E=e[3].data,D=e[4].data,O=e[5].data,k=e[6].data}catch(t){e(`stevneForm.mount`,t),S.replaceChildren(r(`Kunne ikkje laste skjema.`));return}let A=null;if(x){let{data:e,error:t}=await u(x);if(t||!e){S.replaceChildren(r(`Stevne ikkje funne.`));return}if(A=e,!await n()&&!await a(A.klubbid??void 0)){S.replaceChildren(r(`Ingen tilgang til dette stevnet.`));return}}let j=A??{},M=j.kategoriid??D.find(e=>e.navn===`Singel`)?.id,N=x?j.snc_hovudstevne_id??null:ge(),P=O.find(e=>e.id===N)??null,F=x?j.snc_hovudstevne_id!=null:P!==null,I=F?N:null,L=j.er_snc_hovudstevne===!0,R=F&&!x,_e=j.navn??(R?P?.navn??``:``),ve=j.dato??(R?P?.dato??``:``),ye=j.tid?j.tid.slice(0,5):x?``:R?P?.tid?.slice(0,5)??``:`11:00`,be=g(C,j.klubbid),xe=g(w,j.stevnetypeid),Se=g(T,j.innledendekastemetodeid),Ce=g(E,j.avsluttendekastemetodeid),we=g(D,M),Te=g(k.map(e=>({id:e.id,navn:me(e)+(e.eraktiv?``:` (inaktiv)`)})),j.kontaktkasterid,`— ingen kontaktperson —`),z=P?o(P.navn)+(P.dato?` (${d(P.dato)})`:``):``,{wrapper:B,headingHtml:Ee}=h(b);B.innerHTML=`
    ${Ee}
    <form id="tournament-form">
      ${F?`<div class="alert alert-info py-2">
          <div class="fw-semibold">Hovudstevne:${z?` ${z}`:``}.</div>
        </div>`:``}
      ${f(`Namn*`,`<input type="text" class="form-control" name="navn" value="${o(_e)}" required>`)}
      ${f(`Stad`,`<input type="text" class="form-control" name="sted" value="${o(j.sted)}">`)}
      <div class="admin-form-grid">
        ${f(`Dato`,`<input type="date" class="form-control" name="dato" value="${ve}" required>`)}
        ${f(`Tid`,`<input type="time" class="form-control" name="tid" value="${ye}">`)}
      </div>
      <div class="admin-form-grid">
        ${f(`Arrangørklubb`,`<select class="form-select" name="klubbid">${be}</select>`)}
        ${f(`Kontaktperson`,`<select class="form-select" name="kontaktkasterid">${Te}</select>`)}
      </div>
      <div class="admin-form-grid">
        ${f(`Stevnetype`,`<select class="form-select" name="stevnetypeid">${xe}</select>`)}
        ${f(`Kategori`,`<select class="form-select" name="kategoriid">${we}</select>`)}
      </div>
      <div class="admin-form-grid">
        ${f(`Innleiande kastemetode`,`<select class="form-select" name="innledendekastemetodeid">${Se}</select>`)}
        ${f(`Avsluttande kastemetode`,`<select class="form-select" name="avsluttendekastemetodeid">${Ce}</select>`)}
      </div>
      <div class="mb-3 d-flex gap-4 flex-wrap">
        <div class="form-check"><input class="form-check-input" type="checkbox" name="ernm" id="ernm"${j.ernm?` checked`:``}><label class="form-check-label" for="ernm">Er NM</label></div>
        <div class="form-check"><input class="form-check-input" type="checkbox" name="ernorgesranking" id="ernr"${j.ernorgesranking?` checked`:``}><label class="form-check-label" for="ernr">Er Norgesranking</label></div>
        <div class="form-check"><input class="form-check-input" type="checkbox" name="erekskludertfrarekorder" id="ekskl"${j.erekskludertfrarekorder?` checked`:``}><label class="form-check-label" for="ekskl">Ekskl. frå rekorder</label></div>
      </div>
      ${f(`Resultat-URL`,`<input type="url" class="form-control" name="resultaturl" value="${o(j.resultaturl)}">`)}
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
    </form>`,S.replaceChildren(B);let V=B.querySelector(`#snc-hovud`),De=B.querySelector(`#snc-fieldset`),H=e=>B.querySelector(`[name="${e}"]`),U=H(`stevnetypeid`),W=H(`kategoriid`),G=H(`innledendekastemetodeid`),K=H(`avsluttendekastemetodeid`),q=B.querySelector(`#ernr`),J=B.querySelector(`#ernm`),Oe=B.querySelector(`#ekskl`),Y=w.find(e=>e.navn===`NM`)?.id,X=w.find(e=>e.navn===`SNC`)?.id;j.stevnetypeid!=null&&(U.value=String(j.stevnetypeid));let Z=()=>X!=null&&U.value===String(X);U.addEventListener(`change`,()=>{Y!=null&&U.value===String(Y)&&(J.checked=!0),Z()&&(V.checked=!0),$()});function Q(e,t){let n=e.value,r=t.some(e=>String(e.id)===n);e.innerHTML=g(t,r?n:``)}function $(){Z()||(V.checked=!1),De.classList.toggle(`d-none`,F||!Z());let e=F||V.checked;if(Q(G,e?T.filter(e=>v(e.navn)):T),Q(K,e?E.filter(e=>he(e.navn)):E),F&&P){let e=(e,t)=>{e.value=t==null?``:String(t)};e(U,P.stevnetypeid),e(W,P.kategoriid),e(G,P.innledendekastemetodeid),e(K,P.avsluttendekastemetodeid),q.checked=P.ernorgesranking}for(let e of[J,Oe])e.disabled=F,F&&(e.checked=!1);for(let e of[U,W,G,K,q])e.disabled=F}V.addEventListener(`change`,$),$(),B.querySelector(`#tournament-form`).addEventListener(`submit`,async e=>{e.preventDefault();let t=new FormData(e.target),n=P,r={navn:t.get(`navn`).trim(),sted:t.get(`sted`).trim()||null,dato:t.get(`dato`),tid:t.get(`tid`)||null,klubbid:_(t.get(`klubbid`)),stevnetypeid:F?n?.stevnetypeid??j.stevnetypeid??null:_(t.get(`stevnetypeid`)),innledendekastemetodeid:F?n?.innledendekastemetodeid??j.innledendekastemetodeid??null:_(t.get(`innledendekastemetodeid`)),avsluttendekastemetodeid:F?n?.avsluttendekastemetodeid??j.avsluttendekastemetodeid??null:_(t.get(`avsluttendekastemetodeid`)),kategoriid:F?n?.kategoriid??j.kategoriid??null:_(t.get(`kategoriid`)),kontaktkasterid:_(t.get(`kontaktkasterid`)),ernm:!F&&t.get(`ernm`)===`on`,ernorgesranking:F?n?.ernorgesranking??j.ernorgesranking??!1:t.get(`ernorgesranking`)===`on`,erekskludertfrarekorder:!F&&t.get(`erekskludertfrarekorder`)===`on`,resultaturl:t.get(`resultaturl`).trim()||null,er_snc_hovudstevne:!F&&V.checked,snc_hovudstevne_id:I},{data:i,error:a}=x?await ee(x,r):await oe(r);if(a){m(B,p(a));return}le(B,`Stevnet er lagra.`),b.onSaved?.(i?.id??x,!x)}),ue(B,b),ce(B,{title:`Slett stevne`,message:`Slett «${A?.navn}»? Dette kan ikkje angrast.`,remove:()=>ne(x),onDeleted:b.onDeleted}),B.querySelector(`#complete-button`)?.addEventListener(`click`,async()=>{if(!await s({title:L?`Konsolider SNC-runden`:`Fullfør turnering`,message:L?`Slå saman lokalresultata i «${A?.navn}» til éi liste og rekne ut NC-poeng frå den samla plasseringa?`:`Fullfør «${A?.navn}»? Du kan ikkje lenger endre kampar og resultat for stevnet.`,danger:!0}))return;let{error:e}=L?await l(x):await i(x);if(e){m(B,p(e));return}await y(b,x)}),B.querySelector(`#reopen-button`)?.addEventListener(`click`,async()=>{if(!await s({title:L?`Gjenopne SNC-runden`:`Gjenåpne turnering`,message:L?`Gjenopne «${A?.navn}»? Den samla lista og NC-poenga blir nullstilte.`:`Gjenåpne «${A?.navn}»? Kampar og resultat kan då endres igjen.`,danger:L}))return;let{error:e}=L?await t(x):await se(x);if(e){m(B,p(e));return}await y(b,x)})}export{y as t};