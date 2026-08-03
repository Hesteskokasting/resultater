import{t as e}from"./logError-BO7RC_Nh.js";import{At as t,Dt as n,Et as r,F as i,Ft as a,Nt as o,O as s,P as c,Tt as ee,a as l,bt as u,ct as te,et as ne,ft as d,it as f,kt as p,nt as m,tt as h,vt as g}from"./index-z7iEevWR.js";import{a as _,i as v,n as re,o as y,r as b,s as x,t as S}from"./_formButtons-CsyWCJCB.js";import{t as ie}from"./LoadingState-C6NB62Ct.js";import{a as C}from"./klubbService-Haapdsx7.js";import{t as w}from"./buildDropdownOptions-B6B_Q6ZW.js";import{t as T}from"./formNum-HGeagI_O.js";import{n as ae,t as oe}from"./kastemetode-BcDmg9po.js";function se(){let e=new URLSearchParams(location.hash.split(`?`)[1]??``).get(`snc`),t=e?Number(e):NaN;return Number.isFinite(t)&&t>0?t:null}function ce(e,t,n){let r=`<option value="">— ikkje eit lokalt SNC-stevne —</option>`;for(let i of e){if(i.id===n)continue;let e=i.id===t,o=i.dato?` (${a(i.dato)})`:``,s=i.erfullfort&&!e,c=i.erfullfort?` — konsolidert`:``;r+=`<option value="${i.id}"${e?` selected`:``}${s?` disabled`:``}>${l(i.navn+o+c)}</option>`}return r}async function E(a,D){let{container:O}=a;O.replaceChildren(ie());let k=[],A=[],j=[],M=[],N=[],P=[];try{let e=await Promise.all([C(),ee(),d(),te(),f(),g()]);k=e[0].data,A=e[1].data,j=e[2].data,M=e[3].data,N=e[4].data,P=e[5].data}catch(t){e(`stevneForm.mount`,t),O.replaceChildren(o(`Kunne ikkje laste skjema.`));return}let F=null;if(D){let{data:e,error:t}=await u(D);if(t||!e){O.replaceChildren(o(`Stevne ikkje funne.`));return}if(F=e,!await c()&&!await i(F.klubbid??void 0)){O.replaceChildren(o(`Ingen tilgang til dette stevnet.`));return}}let I=F??{},L=I.dato??``,R=I.tid?I.tid.slice(0,5):D?``:`11:00`,z=I.kategoriid??N.find(e=>e.navn===`Singel`)?.id,B=I.snc_hovudstevne_id??(D?null:se()),V=I.er_snc_hovudstevne===!0,H=w(k,I.klubbid),U=w(A,I.stevnetypeid),le=w(j,I.innledendekastemetodeid),W=w(M,I.avsluttendekastemetodeid),ue=w(N,z),de=ce(P,B,D),{wrapper:G,headingHtml:fe}=b(a);G.innerHTML=`
    ${fe}
    <form id="tournament-form">
      ${_(`Namn*`,`<input type="text" class="form-control" name="navn" value="${l(I.navn)}" required>`)}
      ${_(`Stad`,`<input type="text" class="form-control" name="sted" value="${l(I.sted)}">`)}
      <div class="admin-form-grid">
        ${_(`Dato`,`<input type="date" class="form-control" name="dato" value="${L}" required>`)}
        ${_(`Tid`,`<input type="time" class="form-control" name="tid" value="${R}">`)}
      </div>
      ${_(`Arrangørklubb`,`<select class="form-select" name="klubbid">${H}</select>`)}
      <div class="admin-form-grid">
        ${_(`Stevnetype`,`<select class="form-select" name="stevnetypeid">${U}</select>`)}
        ${_(`Kategori`,`<select class="form-select" name="kategoriid">${ue}</select>`)}
      </div>
      <div class="admin-form-grid">
        ${_(`Innleiande kastemetode`,`<select class="form-select" name="innledendekastemetodeid">${le}</select>`)}
        ${_(`Avsluttande kastemetode`,`<select class="form-select" name="avsluttendekastemetodeid">${W}</select>`)}
      </div>
      <div class="mb-3 d-flex gap-4 flex-wrap">
        <div class="form-check"><input class="form-check-input" type="checkbox" name="ernm" id="ernm"${I.ernm?` checked`:``}><label class="form-check-label" for="ernm">Er NM</label></div>
        <div class="form-check"><input class="form-check-input" type="checkbox" name="ernorgesranking" id="ernr"${I.ernorgesranking?` checked`:``}><label class="form-check-label" for="ernr">Er Norgesranking</label></div>
        <div class="form-check"><input class="form-check-input" type="checkbox" name="erekskludertfrarekorder" id="ekskl"${I.erekskludertfrarekorder?` checked`:``}><label class="form-check-label" for="ekskl">Ekskl. frå rekorder</label></div>
      </div>
      ${_(`Resultat-URL`,`<input type="url" class="form-control" name="resultaturl" value="${l(I.resultaturl)}">`)}
      <fieldset class="mb-3 border rounded p-3">
        <legend class="form-label fw-semibold float-none w-auto px-1 mb-2">SNC</legend>
        <div class="form-check mb-2">
          <input class="form-check-input" type="checkbox" name="er_snc_hovudstevne" id="snc-hovud"${V?` checked`:``}>
          <label class="form-check-label" for="snc-hovud">Er SNC-hovudstevne (samlar lokalstevna)</label>
        </div>
        ${_(`Del av SNC-hovudstevne`,`<select class="form-select" name="snc_hovudstevne_id" id="snc-parent">${de}</select>`)}
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
        ${a.onCancel?`<button type="button" id="cancel-button" class="btn btn-outline-secondary">Avbryt</button>`:``}
        ${D?`<button type="button" id="delete-button" class="btn btn-outline-danger ms-auto">Slett stevne</button>`:``}
      </div>
    </form>`,O.replaceChildren(G);let K=G.querySelector(`#snc-hovud`),q=G.querySelector(`#snc-parent`),J=e=>G.querySelector(`[name="${e}"]`),Y=J(`stevnetypeid`),pe=J(`kategoriid`),X=J(`innledendekastemetodeid`),Z=J(`avsluttendekastemetodeid`),me=G.querySelector(`#ernr`),he=G.querySelector(`#snc-arva-note`);function Q(e,t){let n=e.value;e.innerHTML=w(t,t.some(e=>String(e.id)===n)?n:``)}function $(){q.disabled=K.checked,K.disabled=q.value!==``;let e=q.value!==``,t=e||K.checked;if(Q(X,t?j.filter(e=>ae(e.navn)):j),Q(Z,t?M.filter(e=>oe(e.navn)):M),K.checked){let e=A.find(e=>e.navn===`SNC`);e&&(Y.value=String(e.id))}for(let t of[Y,pe,X,Z,me])t.disabled=e;he.classList.toggle(`d-none`,!e)}K.addEventListener(`change`,$),q.addEventListener(`change`,$),$(),G.querySelector(`#tournament-form`).addEventListener(`submit`,async e=>{e.preventDefault();let n=new FormData(e.target),r=q.value!==``,i={navn:n.get(`navn`).trim(),sted:n.get(`sted`).trim()||null,dato:n.get(`dato`),tid:n.get(`tid`)||null,klubbid:T(n.get(`klubbid`)),stevnetypeid:r?I.stevnetypeid??null:T(n.get(`stevnetypeid`)),innledendekastemetodeid:r?I.innledendekastemetodeid??null:T(n.get(`innledendekastemetodeid`)),avsluttendekastemetodeid:r?I.avsluttendekastemetodeid??null:T(n.get(`avsluttendekastemetodeid`)),kategoriid:r?I.kategoriid??null:T(n.get(`kategoriid`)),ernm:n.get(`ernm`)===`on`,ernorgesranking:r?I.ernorgesranking??!1:n.get(`ernorgesranking`)===`on`,erekskludertfrarekorder:n.get(`erekskludertfrarekorder`)===`on`,resultaturl:n.get(`resultaturl`).trim()||null,er_snc_hovudstevne:n.get(`er_snc_hovudstevne`)===`on`,snc_hovudstevne_id:T(n.get(`snc_hovudstevne_id`))},{data:o,error:s}=D?await t(D,i):await h(i);if(s){y(G,v(s));return}x(G,`Stevnet er lagra.`),a.onSaved?.(o?.id??D,!D)}),S(G,a),re(G,{title:`Slett stevne`,message:`Slett «${F?.navn}»? Dette kan ikkje angrast.`,remove:()=>m(D),onDeleted:a.onDeleted}),G.querySelector(`#complete-button`)?.addEventListener(`click`,async()=>{if(!await s({title:V?`Konsolider SNC-runden`:`Fullfør turnering`,message:V?`Slå saman lokalresultata i «${F?.navn}» til éi liste og rekne ut NC-poeng frå den samla plasseringa?`:`Fullfør «${F?.navn}»? Du kan ikkje lenger endre kampar og resultat for stevnet.`,danger:!0}))return;let{error:e}=V?await ne(D):await p(D);if(e){y(G,v(e));return}await E(a,D)}),G.querySelector(`#reopen-button`)?.addEventListener(`click`,async()=>{if(!await s({title:V?`Gjenopne SNC-runden`:`Gjenåpne turnering`,message:V?`Gjenopne «${F?.navn}»? Den samla lista og NC-poenga blir nullstilte.`:`Gjenåpne «${F?.navn}»? Kampar og resultat kan då endres igjen.`,danger:V}))return;let{error:e}=V?await r(D):await n(D);if(e){y(G,v(e));return}await E(a,D)})}export{E as t};