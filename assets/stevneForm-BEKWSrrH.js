import{t as e}from"./logError-BO7RC_Nh.js";import{A as t,At as n,Ct as r,I as i,It as a,L as o,Mt as s,Nt as ee,Ot as te,Rt as c,dt as ne,ht as l,it as u,kt as d,nt as f,rt as p,s as m,st as h,xt as re}from"./index-CNUjjVgw.js";import{a as g,i as _,n as ie,o as v,r as y,s as ae,t as b}from"./_formButtons-Bpl5oaQm.js";import{t as x}from"./LoadingState-C6NB62Ct.js";import{a as oe}from"./klubbService-Haapdsx7.js";import{t as S}from"./buildDropdownOptions-BTNE4WrD.js";import{t as C}from"./formNum-HGeagI_O.js";import{n as w,t as T}from"./kastemetode-BcDmg9po.js";function se(){let e=new URLSearchParams(location.hash.split(`?`)[1]??``).get(`snc`),t=e?Number(e):NaN;return Number.isFinite(t)&&t>0?t:null}function ce(e,t,n){let r=`<option value="">— ikkje eit lokalt SNC-stevne —</option>`;for(let i of e){if(i.id===n)continue;let e=i.id===t,a=i.dato?` (${c(i.dato)})`:``,o=i.erfullfort&&!e,s=i.erfullfort?` — konsolidert`:``;r+=`<option value="${i.id}"${e?` selected`:``}${o?` disabled`:``}>${m(i.navn+a+s)}</option>`}return r}async function E(c,D){let{container:O}=c;O.replaceChildren(x());let k=[],A=[],j=[],M=[],N=[],P=[];try{let e=await Promise.all([oe(),te(),l(),ne(),h(),re()]);k=e[0].data,A=e[1].data,j=e[2].data,M=e[3].data,N=e[4].data,P=e[5].data}catch(t){e(`stevneForm.mount`,t),O.replaceChildren(a(`Kunne ikkje laste skjema.`));return}let F=null;if(D){let{data:e,error:t}=await r(D);if(t||!e){O.replaceChildren(a(`Stevne ikkje funne.`));return}if(F=e,!await i()&&!await o(F.klubbid??void 0)){O.replaceChildren(a(`Ingen tilgang til dette stevnet.`));return}}let I=F??{},L=I.dato??``,R=I.tid?I.tid.slice(0,5):D?``:`11:00`,z=I.kategoriid??N.find(e=>e.navn===`Singel`)?.id,B=I.snc_hovudstevne_id??(D?null:se()),V=I.er_snc_hovudstevne===!0,H=S(k,I.klubbid),U=S(A,I.stevnetypeid),le=S(j,I.innledendekastemetodeid),W=S(M,I.avsluttendekastemetodeid),ue=S(N,z),de=ce(P,B,D),{wrapper:G,headingHtml:fe}=y(c);G.innerHTML=`
    ${fe}
    <form id="tournament-form">
      ${g(`Namn*`,`<input type="text" class="form-control" name="navn" value="${m(I.navn)}" required>`)}
      ${g(`Stad`,`<input type="text" class="form-control" name="sted" value="${m(I.sted)}">`)}
      <div class="admin-form-grid">
        ${g(`Dato`,`<input type="date" class="form-control" name="dato" value="${L}" required>`)}
        ${g(`Tid`,`<input type="time" class="form-control" name="tid" value="${R}">`)}
      </div>
      ${g(`Arrangørklubb`,`<select class="form-select" name="klubbid">${H}</select>`)}
      <div class="admin-form-grid">
        ${g(`Stevnetype`,`<select class="form-select" name="stevnetypeid">${U}</select>`)}
        ${g(`Kategori`,`<select class="form-select" name="kategoriid">${ue}</select>`)}
      </div>
      <div class="admin-form-grid">
        ${g(`Innleiande kastemetode`,`<select class="form-select" name="innledendekastemetodeid">${le}</select>`)}
        ${g(`Avsluttande kastemetode`,`<select class="form-select" name="avsluttendekastemetodeid">${W}</select>`)}
      </div>
      <div class="mb-3 d-flex gap-4 flex-wrap">
        <div class="form-check"><input class="form-check-input" type="checkbox" name="ernm" id="ernm"${I.ernm?` checked`:``}><label class="form-check-label" for="ernm">Er NM</label></div>
        <div class="form-check"><input class="form-check-input" type="checkbox" name="ernorgesranking" id="ernr"${I.ernorgesranking?` checked`:``}><label class="form-check-label" for="ernr">Er Norgesranking</label></div>
        <div class="form-check"><input class="form-check-input" type="checkbox" name="erekskludertfrarekorder" id="ekskl"${I.erekskludertfrarekorder?` checked`:``}><label class="form-check-label" for="ekskl">Ekskl. frå rekorder</label></div>
      </div>
      ${g(`Resultat-URL`,`<input type="url" class="form-control" name="resultaturl" value="${m(I.resultaturl)}">`)}
      <fieldset class="mb-3 border rounded p-3">
        <legend class="form-label fw-semibold float-none w-auto px-1 mb-2">SNC</legend>
        <div class="form-check mb-2">
          <input class="form-check-input" type="checkbox" name="er_snc_hovudstevne" id="snc-hovud"${V?` checked`:``}>
          <label class="form-check-label" for="snc-hovud">Er SNC-hovudstevne (samlar lokalstevna)</label>
        </div>
        ${g(`Del av SNC-hovudstevne`,`<select class="form-select" name="snc_hovudstevne_id" id="snc-parent">${de}</select>`)}
        <p class="form-text mb-0">
          Eit hovudstevne har ingen eigne kampar — det bind saman lokalstevna og eig den samla
          resultatlista. Eit lokalt stevne arvar stevnetype, kategori og kastemetodar frå
          hovudstevnet. SNC må vere X-kast, Kongelag eller begge.
        </p>
        <p id="snc-arva-note" class="form-text mb-0 d-none">
          Stevnetype, kategori, kastemetodar og norgesranking er låste her — dei blir arva frå
          hovudstevnet og kan berre endrast der.
        </p>
      </fieldset>
      ${D?`
        <div class="mb-3 d-flex align-items-center gap-2 flex-wrap">
          <span class="fw-semibold">Status:</span>
          <span>${I.erfullfort?V?`Konsolidert`:`Fullført`:`Ikkje fullført`}</span>
          ${I.erfullfort?`<button type="button" id="reopen-button" class="btn btn-sm btn-outline-warning">${V?`Gjenopne SNC-runden`:`Gjenåpne turnering`}</button>`:`<button type="button" id="complete-button" class="btn btn-sm btn-outline-success">${V?`Konsolider SNC-runden`:`Fullfør turnering`}</button>`}
        </div>`:``}
      <div class="admin-form-actions">
        <button type="submit" class="btn btn-primary">Lagre</button>
        ${c.onCancel?`<button type="button" id="cancel-button" class="btn btn-outline-secondary">Avbryt</button>`:``}
        ${D?`<button type="button" id="delete-button" class="btn btn-outline-danger ms-auto">Slett stevne</button>`:``}
      </div>
    </form>`,O.replaceChildren(G);let K=G.querySelector(`#snc-hovud`),q=G.querySelector(`#snc-parent`),J=e=>G.querySelector(`[name="${e}"]`),Y=J(`stevnetypeid`),pe=J(`kategoriid`),X=J(`innledendekastemetodeid`),Z=J(`avsluttendekastemetodeid`),me=G.querySelector(`#ernr`),he=G.querySelector(`#snc-arva-note`);function Q(e,t){let n=e.value;e.innerHTML=S(t,t.some(e=>String(e.id)===n)?n:``)}function $(){q.disabled=K.checked,K.disabled=q.value!==``;let e=q.value!==``,t=e||K.checked;if(Q(X,t?j.filter(e=>w(e.navn)):j),Q(Z,t?M.filter(e=>T(e.navn)):M),K.checked){let e=A.find(e=>e.navn===`SNC`);e&&(Y.value=String(e.id))}for(let t of[Y,pe,X,Z,me])t.disabled=e;he.classList.toggle(`d-none`,!e)}K.addEventListener(`change`,$),q.addEventListener(`change`,$),$(),G.querySelector(`#tournament-form`).addEventListener(`submit`,async e=>{e.preventDefault();let t=new FormData(e.target),n=q.value!==``,r={navn:t.get(`navn`).trim(),sted:t.get(`sted`).trim()||null,dato:t.get(`dato`),tid:t.get(`tid`)||null,klubbid:C(t.get(`klubbid`)),stevnetypeid:n?I.stevnetypeid??null:C(t.get(`stevnetypeid`)),innledendekastemetodeid:n?I.innledendekastemetodeid??null:C(t.get(`innledendekastemetodeid`)),avsluttendekastemetodeid:n?I.avsluttendekastemetodeid??null:C(t.get(`avsluttendekastemetodeid`)),kategoriid:n?I.kategoriid??null:C(t.get(`kategoriid`)),ernm:t.get(`ernm`)===`on`,ernorgesranking:n?I.ernorgesranking??!1:t.get(`ernorgesranking`)===`on`,erekskludertfrarekorder:t.get(`erekskludertfrarekorder`)===`on`,resultaturl:t.get(`resultaturl`).trim()||null,er_snc_hovudstevne:t.get(`er_snc_hovudstevne`)===`on`,snc_hovudstevne_id:C(t.get(`snc_hovudstevne_id`))},{data:i,error:a}=D?await ee(D,r):await p(r);if(a){v(G,_(a));return}ae(G,`Stevnet er lagra.`),c.onSaved?.(i?.id??D,!D)}),b(G,c),ie(G,{title:`Slett stevne`,message:`Slett «${F?.navn}»? Dette kan ikkje angrast.`,remove:()=>u(D),onDeleted:c.onDeleted}),G.querySelector(`#complete-button`)?.addEventListener(`click`,async()=>{if(!await t({title:V?`Konsolider SNC-runden`:`Fullfør turnering`,message:V?`Slå saman lokalresultata i «${F?.navn}» til éi liste og rekne ut NC-poeng frå den samla plasseringa?`:`Fullfør «${F?.navn}»? Du kan ikkje lenger endre kampar og resultat for stevnet.`,danger:!0}))return;let{error:e}=V?await f(D):await s(D);if(e){v(G,_(e));return}await E(c,D)}),G.querySelector(`#reopen-button`)?.addEventListener(`click`,async()=>{if(!await t({title:V?`Gjenopne SNC-runden`:`Gjenåpne turnering`,message:V?`Gjenopne «${F?.navn}»? Den samla lista og NC-poenga blir nullstilte.`:`Gjenåpne «${F?.navn}»? Kampar og resultat kan då endres igjen.`,danger:V}))return;let{error:e}=V?await d(D):await n(D);if(e){v(G,_(e));return}await E(c,D)})}export{E as t};