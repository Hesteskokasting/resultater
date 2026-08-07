import{t as e}from"./logError-BO7RC_Nh.js";import{A as t,At as n,Ct as r,I as i,It as a,L as ee,Mt as te,Nt as ne,Ot as o,Rt as s,dt as re,ht as ie,it as ae,kt as oe,nt as c,rt as l,s as u,st as d,xt as f}from"./index-DGjq4O4X.js";import{i as se}from"./kasterService-BMY5rO_4.js";import{a as p,i as m,n as ce,o as h,r as le,s as ue,t as de}from"./_formButtons-Co171qPY.js";import{t as fe}from"./LoadingState-C6NB62Ct.js";import{a as pe}from"./klubbService-Haapdsx7.js";import{t as g}from"./buildDropdownOptions-DPo3g2f9.js";import{t as _}from"./formNum-HGeagI_O.js";import{r as me}from"./kaster-CGWDYFbf.js";import{n as he,t as ge}from"./kastemetode-BcDmg9po.js";function _e(){let e=new URLSearchParams(location.hash.split(`?`)[1]??``).get(`snc`),t=e?Number(e):NaN;return Number.isFinite(t)&&t>0?t:null}async function v(y,b){let{container:x}=y;x.replaceChildren(fe());let S=[],C=[],w=[],T=[],E=[],D=[],O=[];try{let e=await Promise.all([pe(),o(),ie(),re(),d(),f(),se()]);S=e[0].data,C=e[1].data,w=e[2].data,T=e[3].data,E=e[4].data,D=e[5].data,O=e[6].data}catch(t){e(`stevneForm.mount`,t),x.replaceChildren(a(`Kunne ikkje laste skjema.`));return}let k=null;if(b){let{data:e,error:t}=await r(b);if(t||!e){x.replaceChildren(a(`Stevne ikkje funne.`));return}if(k=e,!await i()&&!await ee(k.klubbid??void 0)){x.replaceChildren(a(`Ingen tilgang til dette stevnet.`));return}}let A=k??{},j=A.kategoriid??E.find(e=>e.navn===`Singel`)?.id,M=b?A.snc_hovudstevne_id??null:_e(),N=D.find(e=>e.id===M)??null,P=b?A.snc_hovudstevne_id!=null:N!==null,F=P?M:null,I=A.er_snc_hovudstevne===!0,L=P&&!b,ve=A.navn??(L?N?.navn??``:``),R=A.dato??(L?N?.dato??``:``),ye=A.tid?A.tid.slice(0,5):b?``:L?N?.tid?.slice(0,5)??``:`11:00`,be=g(S,A.klubbid),xe=g(C,A.stevnetypeid),Se=g(w,A.innledendekastemetodeid),Ce=g(T,A.avsluttendekastemetodeid),we=g(E,j),Te=g(O.map(e=>({id:e.id,navn:me(e)+(e.eraktiv?``:` (inaktiv)`)})),A.kontaktkasterid,`— ingen kontaktperson —`),z=N?u(N.navn)+(N.dato?` (${s(N.dato)})`:``):``,{wrapper:B,headingHtml:Ee}=le(y);B.innerHTML=`
    ${Ee}
    <form id="tournament-form">
      ${P?`<div class="alert alert-info py-2">
          <div class="fw-semibold">Hovudstevne:${z?` ${z}`:``}.</div>
        </div>`:``}
      ${p(`Namn*`,`<input type="text" class="form-control" name="navn" value="${u(ve)}" required>`)}
      ${p(`Stad`,`<input type="text" class="form-control" name="sted" value="${u(A.sted)}">`)}
      <div class="admin-form-grid">
        ${p(`Dato`,`<input type="date" class="form-control" name="dato" value="${R}" required>`)}
        ${p(`Tid`,`<input type="time" class="form-control" name="tid" value="${ye}">`)}
      </div>
      <div class="admin-form-grid">
        ${p(`Arrangørklubb`,`<select class="form-select" name="klubbid">${be}</select>`)}
        ${p(`Kontaktperson`,`<select class="form-select" name="kontaktkasterid">${Te}</select>`)}
      </div>
      <div class="admin-form-grid">
        ${p(`Stevnetype`,`<select class="form-select" name="stevnetypeid">${xe}</select>`)}
        ${p(`Kategori`,`<select class="form-select" name="kategoriid">${we}</select>`)}
      </div>
      <div class="admin-form-grid">
        ${p(`Innleiande kastemetode`,`<select class="form-select" name="innledendekastemetodeid">${Se}</select>`)}
        ${p(`Avsluttande kastemetode`,`<select class="form-select" name="avsluttendekastemetodeid">${Ce}</select>`)}
      </div>
      <div class="mb-3 d-flex gap-4 flex-wrap">
        <div class="form-check"><input class="form-check-input" type="checkbox" name="ernm" id="ernm"${A.ernm?` checked`:``}><label class="form-check-label" for="ernm">Er NM</label></div>
        <div class="form-check"><input class="form-check-input" type="checkbox" name="ernorgesranking" id="ernr"${A.ernorgesranking?` checked`:``}><label class="form-check-label" for="ernr">Er Norgesranking</label></div>
        <div class="form-check"><input class="form-check-input" type="checkbox" name="erekskludertfrarekorder" id="ekskl"${A.erekskludertfrarekorder?` checked`:``}><label class="form-check-label" for="ekskl">Ekskl. frå rekorder</label></div>
      </div>
      ${p(`Resultat-URL`,`<input type="url" class="form-control" name="resultaturl" value="${u(A.resultaturl)}">`)}
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
    </form>`,x.replaceChildren(B);let V=B.querySelector(`#snc-hovud`),De=B.querySelector(`#snc-fieldset`),H=e=>B.querySelector(`[name="${e}"]`),U=H(`stevnetypeid`),W=H(`kategoriid`),G=H(`innledendekastemetodeid`),K=H(`avsluttendekastemetodeid`),q=B.querySelector(`#ernr`),J=B.querySelector(`#ernm`),Oe=B.querySelector(`#ekskl`),Y=C.find(e=>e.navn===`NM`)?.id,X=C.find(e=>e.navn===`SNC`)?.id;A.stevnetypeid!=null&&(U.value=String(A.stevnetypeid));let Z=()=>X!=null&&U.value===String(X);U.addEventListener(`change`,()=>{Y!=null&&U.value===String(Y)&&(J.checked=!0),Z()&&(V.checked=!0),$()});function Q(e,t){let n=e.value;e.innerHTML=g(t,t.some(e=>String(e.id)===n)?n:``)}function $(){Z()||(V.checked=!1),De.classList.toggle(`d-none`,P||!Z());let e=P||V.checked;if(Q(G,e?w.filter(e=>he(e.navn)):w),Q(K,e?T.filter(e=>ge(e.navn)):T),P&&N){let e=(e,t)=>{e.value=t==null?``:String(t)};e(U,N.stevnetypeid),e(W,N.kategoriid),e(G,N.innledendekastemetodeid),e(K,N.avsluttendekastemetodeid),q.checked=N.ernorgesranking}for(let e of[J,Oe])e.disabled=P,P&&(e.checked=!1);for(let e of[U,W,G,K,q])e.disabled=P}V.addEventListener(`change`,$),$(),B.querySelector(`#tournament-form`).addEventListener(`submit`,async e=>{e.preventDefault();let t=new FormData(e.target),n=N,r={navn:t.get(`navn`).trim(),sted:t.get(`sted`).trim()||null,dato:t.get(`dato`),tid:t.get(`tid`)||null,klubbid:_(t.get(`klubbid`)),stevnetypeid:P?n?.stevnetypeid??A.stevnetypeid??null:_(t.get(`stevnetypeid`)),innledendekastemetodeid:P?n?.innledendekastemetodeid??A.innledendekastemetodeid??null:_(t.get(`innledendekastemetodeid`)),avsluttendekastemetodeid:P?n?.avsluttendekastemetodeid??A.avsluttendekastemetodeid??null:_(t.get(`avsluttendekastemetodeid`)),kategoriid:P?n?.kategoriid??A.kategoriid??null:_(t.get(`kategoriid`)),kontaktkasterid:_(t.get(`kontaktkasterid`)),ernm:!P&&t.get(`ernm`)===`on`,ernorgesranking:P?n?.ernorgesranking??A.ernorgesranking??!1:t.get(`ernorgesranking`)===`on`,erekskludertfrarekorder:!P&&t.get(`erekskludertfrarekorder`)===`on`,resultaturl:t.get(`resultaturl`).trim()||null,er_snc_hovudstevne:!P&&V.checked,snc_hovudstevne_id:F},{data:i,error:a}=b?await ne(b,r):await l(r);if(a){h(B,m(a));return}ue(B,`Stevnet er lagra.`),y.onSaved?.(i?.id??b,!b)}),de(B,y),ce(B,{title:`Slett stevne`,message:`Slett «${k?.navn}»? Dette kan ikkje angrast.`,remove:()=>ae(b),onDeleted:y.onDeleted}),B.querySelector(`#complete-button`)?.addEventListener(`click`,async()=>{if(!await t({title:I?`Konsolider SNC-runden`:`Fullfør turnering`,message:I?`Slå saman lokalresultata i «${k?.navn}» til éi liste og rekne ut NC-poeng frå den samla plasseringa?`:`Fullfør «${k?.navn}»? Du kan ikkje lenger endre kampar og resultat for stevnet.`,danger:!0}))return;let{error:e}=I?await c(b):await te(b);if(e){h(B,m(e));return}await v(y,b)}),B.querySelector(`#reopen-button`)?.addEventListener(`click`,async()=>{if(!await t({title:I?`Gjenopne SNC-runden`:`Gjenåpne turnering`,message:I?`Gjenopne «${k?.navn}»? Den samla lista og NC-poenga blir nullstilte.`:`Gjenåpne «${k?.navn}»? Kampar og resultat kan då endres igjen.`,danger:I}))return;let{error:e}=I?await oe(b):await n(b);if(e){h(B,m(e));return}await v(y,b)})}export{v as t};