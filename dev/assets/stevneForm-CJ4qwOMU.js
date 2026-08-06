import{t as e}from"./logError-BO7RC_Nh.js";import{A as t,At as n,Ct as r,I as i,It as a,L as o,Mt as s,Nt as ee,Ot as c,Rt as l,dt as te,ht as ne,it as re,kt as ie,nt as ae,rt as oe,s as u,st as se,xt as d}from"./index-CTcD5IvO.js";import{i as f}from"./kasterService-BMY5rO_4.js";import{a as p,i as m,n as ce,o as h,r as le,s as ue,t as g}from"./_formButtons-CxSdTvBK.js";import{t as de}from"./LoadingState-C6NB62Ct.js";import{a as fe}from"./klubbService-Haapdsx7.js";import{t as _}from"./buildDropdownOptions-kJlrh2q7.js";import{t as v}from"./formNum-HGeagI_O.js";import{r as y}from"./kaster-CGWDYFbf.js";import{n as b,t as x}from"./kastemetode-BcDmg9po.js";function pe(){let e=new URLSearchParams(location.hash.split(`?`)[1]??``).get(`snc`),t=e?Number(e):NaN;return Number.isFinite(t)&&t>0?t:null}function me(e,t,n){let r=`<option value="">— ikkje eit lokalt SNC-stevne —</option>`;for(let i of e){if(i.id===n)continue;let e=i.id===t,a=i.dato?` (${l(i.dato)})`:``,o=i.erfullfort&&!e,s=i.erfullfort?` — konsolidert`:``;r+=`<option value="${i.id}"${e?` selected`:``}${o?` disabled`:``}>${u(i.navn+a+s)}</option>`}return r}async function S(l,C){let{container:w}=l;w.replaceChildren(de());let T=[],E=[],D=[],O=[],k=[],A=[],j=[];try{let e=await Promise.all([fe(),c(),ne(),te(),se(),d(),f()]);T=e[0].data,E=e[1].data,D=e[2].data,O=e[3].data,k=e[4].data,A=e[5].data,j=e[6].data}catch(t){e(`stevneForm.mount`,t),w.replaceChildren(a(`Kunne ikkje laste skjema.`));return}let M=null;if(C){let{data:e,error:t}=await r(C);if(t||!e){w.replaceChildren(a(`Stevne ikkje funne.`));return}if(M=e,!await i()&&!await o(M.klubbid??void 0)){w.replaceChildren(a(`Ingen tilgang til dette stevnet.`));return}}let N=M??{},P=N.dato??``,F=N.tid?N.tid.slice(0,5):C?``:`11:00`,I=N.kategoriid??k.find(e=>e.navn===`Singel`)?.id,L=N.snc_hovudstevne_id??(C?null:pe()),R=N.er_snc_hovudstevne===!0,z=!C&&A.some(e=>e.id===L),he=_(T,N.klubbid),ge=_(E,N.stevnetypeid),_e=_(D,N.innledendekastemetodeid),ve=_(O,N.avsluttendekastemetodeid),ye=_(k,I),be=_(j.map(e=>({id:e.id,navn:y(e)+(e.eraktiv?``:` (inaktiv)`)})),N.kontaktkasterid,`— ingen kontaktperson —`),xe=me(A,L,C),{wrapper:B,headingHtml:Se}=le(l);B.innerHTML=`
    ${Se}
    <form id="tournament-form">
      ${p(`Namn*`,`<input type="text" class="form-control" name="navn" value="${u(N.navn)}" required>`)}
      ${p(`Stad`,`<input type="text" class="form-control" name="sted" value="${u(N.sted)}">`)}
      <div class="admin-form-grid">
        ${p(`Dato`,`<input type="date" class="form-control" name="dato" value="${P}" required>`)}
        ${p(`Tid`,`<input type="time" class="form-control" name="tid" value="${F}">`)}
      </div>
      <div class="admin-form-grid">
        ${p(`Arrangørklubb`,`<select class="form-select" name="klubbid">${he}</select>`)}
        ${p(`Kontaktperson`,`<select class="form-select" name="kontaktkasterid">${be}</select>`)}
      </div>
      <div class="admin-form-grid">
        ${p(`Stevnetype`,`<select class="form-select" name="stevnetypeid">${ge}</select>`)}
        ${p(`Kategori`,`<select class="form-select" name="kategoriid">${ye}</select>`)}
      </div>
      <div class="admin-form-grid">
        ${p(`Innleiande kastemetode`,`<select class="form-select" name="innledendekastemetodeid">${_e}</select>`)}
        ${p(`Avsluttande kastemetode`,`<select class="form-select" name="avsluttendekastemetodeid">${ve}</select>`)}
      </div>
      <div class="mb-3 d-flex gap-4 flex-wrap">
        <div class="form-check"><input class="form-check-input" type="checkbox" name="ernm" id="ernm"${N.ernm?` checked`:``}><label class="form-check-label" for="ernm">Er NM</label></div>
        <div class="form-check"><input class="form-check-input" type="checkbox" name="ernorgesranking" id="ernr"${N.ernorgesranking?` checked`:``}><label class="form-check-label" for="ernr">Er Norgesranking</label></div>
        <div class="form-check"><input class="form-check-input" type="checkbox" name="erekskludertfrarekorder" id="ekskl"${N.erekskludertfrarekorder?` checked`:``}><label class="form-check-label" for="ekskl">Ekskl. frå rekorder</label></div>
      </div>
      ${p(`Resultat-URL`,`<input type="url" class="form-control" name="resultaturl" value="${u(N.resultaturl)}">`)}
      <fieldset class="mb-3 border rounded p-3">
        <legend class="form-label fw-semibold float-none w-auto px-1 mb-2">SNC</legend>
        <div class="form-check mb-2">
          <input class="form-check-input" type="checkbox" name="er_snc_hovudstevne" id="snc-hovud"${R?` checked`:``}>
          <label class="form-check-label" for="snc-hovud">Er SNC-hovudstevne (samlar lokalstevna)</label>
        </div>
        ${p(`Del av SNC-hovudstevne`,`<select class="form-select" name="snc_hovudstevne_id" id="snc-parent">${xe}</select>`)}
        <p class="form-text mb-0">
          Eit hovudstevne har ingen eigne kampar — det bind saman lokalstevna og eig den samla
          resultatlista. Eit lokalt stevne arvar stevnetype, kategori og kastemetodar frå
          hovudstevnet. SNC må vere X-kast, Kongelag eller begge.
        </p>
        <p id="snc-arva-note" class="form-text mb-0 d-none">
          Stevnetype, kategori, kastemetodar og norgesranking er låste her — dei blir arva frå
          hovudstevnet og kan berre endrast der. Dato og tid er fylte ut frå hovudstevnet og kan
          justerast. Eit lokalstevne kan ikkje vere NM eller ekskluderast frå rekorder.
        </p>
        ${z?`<p class="form-text mb-0">Hovudstevnet er valt frå SNC-sida og kan ikkje endrast her.</p>`:``}
      </fieldset>
      ${C?`
        <div class="mb-3 d-flex align-items-center gap-2 flex-wrap">
          <span class="fw-semibold">Status:</span>
          <span>${N.erfullfort?R?`Konsolidert`:`Fullført`:`Ikkje fullført`}</span>
          ${N.erfullfort?`<button type="button" id="reopen-button" class="btn btn-sm btn-outline-warning">${R?`Gjenopne SNC-runden`:`Gjenåpne turnering`}</button>`:`<button type="button" id="complete-button" class="btn btn-sm btn-outline-success">${R?`Konsolider SNC-runden`:`Fullfør turnering`}</button>`}
        </div>`:``}
      <div class="admin-form-actions">
        <button type="submit" class="btn btn-primary">Lagre</button>
        ${l.onCancel?`<button type="button" id="cancel-button" class="btn btn-outline-secondary">Avbryt</button>`:``}
        ${C?`<button type="button" id="delete-button" class="btn btn-outline-danger ms-auto">Slett stevne</button>`:``}
      </div>
    </form>`,w.replaceChildren(B);let V=B.querySelector(`#snc-hovud`),H=B.querySelector(`#snc-parent`),U=e=>B.querySelector(`[name="${e}"]`),W=U(`stevnetypeid`),G=U(`kategoriid`),K=U(`innledendekastemetodeid`),q=U(`avsluttendekastemetodeid`),J=B.querySelector(`#ernr`),Y=B.querySelector(`#ernm`),Ce=B.querySelector(`#ekskl`),we=B.querySelector(`[name="dato"]`),Te=B.querySelector(`[name="tid"]`),Ee=B.querySelector(`#snc-arva-note`),X=()=>A.find(e=>String(e.id)===H.value)??null,Z=E.find(e=>e.navn===`NM`)?.id;W.addEventListener(`change`,()=>{Z!=null&&W.value===String(Z)&&(Y.checked=!0)});function Q(e,t){let n=e.value;e.innerHTML=_(t,t.some(e=>String(e.id)===n)?n:``)}function $(){H.disabled=z||V.checked,V.disabled=H.value!==``;let e=H.value!==``,t=e||V.checked;if(Q(K,t?D.filter(e=>b(e.navn)):D),Q(q,t?O.filter(e=>x(e.navn)):O),V.checked){let e=E.find(e=>e.navn===`SNC`);e&&(W.value=String(e.id))}let n=X();if(n){let e=(e,t)=>{e.value=t==null?``:String(t)};e(W,n.stevnetypeid),e(G,n.kategoriid),e(K,n.innledendekastemetodeid),e(q,n.avsluttendekastemetodeid),J.checked=n.ernorgesranking,C||(we.value=n.dato,Te.value=n.tid?n.tid.slice(0,5):``)}for(let t of[Y,Ce])t.disabled=e,e&&(t.checked=!1);for(let t of[W,G,K,q,J])t.disabled=e;Ee.classList.toggle(`d-none`,!e)}V.addEventListener(`change`,$),H.addEventListener(`change`,$),$(),B.querySelector(`#tournament-form`).addEventListener(`submit`,async e=>{e.preventDefault();let t=new FormData(e.target),n=H.value!==``,r=X(),i={navn:t.get(`navn`).trim(),sted:t.get(`sted`).trim()||null,dato:t.get(`dato`),tid:t.get(`tid`)||null,klubbid:v(t.get(`klubbid`)),stevnetypeid:n?r?.stevnetypeid??N.stevnetypeid??null:v(t.get(`stevnetypeid`)),innledendekastemetodeid:n?r?.innledendekastemetodeid??N.innledendekastemetodeid??null:v(t.get(`innledendekastemetodeid`)),avsluttendekastemetodeid:n?r?.avsluttendekastemetodeid??N.avsluttendekastemetodeid??null:v(t.get(`avsluttendekastemetodeid`)),kategoriid:n?r?.kategoriid??N.kategoriid??null:v(t.get(`kategoriid`)),kontaktkasterid:v(t.get(`kontaktkasterid`)),ernm:!n&&t.get(`ernm`)===`on`,ernorgesranking:n?r?.ernorgesranking??N.ernorgesranking??!1:t.get(`ernorgesranking`)===`on`,erekskludertfrarekorder:!n&&t.get(`erekskludertfrarekorder`)===`on`,resultaturl:t.get(`resultaturl`).trim()||null,er_snc_hovudstevne:t.get(`er_snc_hovudstevne`)===`on`,snc_hovudstevne_id:v(H.value)},{data:a,error:o}=C?await ee(C,i):await oe(i);if(o){h(B,m(o));return}ue(B,`Stevnet er lagra.`),l.onSaved?.(a?.id??C,!C)}),g(B,l),ce(B,{title:`Slett stevne`,message:`Slett «${M?.navn}»? Dette kan ikkje angrast.`,remove:()=>re(C),onDeleted:l.onDeleted}),B.querySelector(`#complete-button`)?.addEventListener(`click`,async()=>{if(!await t({title:R?`Konsolider SNC-runden`:`Fullfør turnering`,message:R?`Slå saman lokalresultata i «${M?.navn}» til éi liste og rekne ut NC-poeng frå den samla plasseringa?`:`Fullfør «${M?.navn}»? Du kan ikkje lenger endre kampar og resultat for stevnet.`,danger:!0}))return;let{error:e}=R?await ae(C):await s(C);if(e){h(B,m(e));return}await S(l,C)}),B.querySelector(`#reopen-button`)?.addEventListener(`click`,async()=>{if(!await t({title:R?`Gjenopne SNC-runden`:`Gjenåpne turnering`,message:R?`Gjenopne «${M?.navn}»? Den samla lista og NC-poenga blir nullstilte.`:`Gjenåpne «${M?.navn}»? Kampar og resultat kan då endres igjen.`,danger:R}))return;let{error:e}=R?await ie(C):await n(C);if(e){h(B,m(e));return}await S(l,C)})}export{S as t};