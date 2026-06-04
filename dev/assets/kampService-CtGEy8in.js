import{nt as e,rt as t}from"./index-C0p0H8n3.js";import{t as n}from"./kamp-CpbenSSn.js";t.from(`kamp_spelar`).select(`
  id, kasterid,
  kamp:kampid(
    id, stevneid, fase, runde_nummer, bane_nummer, er_bekreftet, er_walkover,
    stevne:stevneid(id, navn, erfullfort),
    spelarar:kamp_spelar(
      id, kasterid,
      kaster:kasterid(id, fornavn, etternavn)
    )
  )
`);async function r(n){let{data:r,error:i}=await t.from(`kamp_spelar`).select(`
      id, kasterid,
      kamp:kampid(
        id, stevneid, fase, runde_nummer, bane_nummer, er_bekreftet, er_walkover,
        stevne:stevneid(id, navn, erfullfort),
        spelarar:kamp_spelar(
          id, kasterid,
          kaster:kasterid(id, fornavn, etternavn)
        )
      )
    `).eq(`kasterid`,n);return i&&e(`hentMineKampar`,i),{data:r??[],error:i}}t.from(`kamp`).select(`
    id, stevneid, fase, runde_nummer, runde_navn, bane_nummer,
    er_bekreftet, er_walkover, er_tre_spelarar,
    stevne:stevneid(navn),
    spelarar:kamp_spelar(
      id, kasterid, score_poeng, kamp_poeng, antall_ringer,
      kaster:kasterid(id, fornavn, etternavn)
    )
  `),t.from(`kamp`).select(`
  id, stevneid, runde_nummer, bane_nummer, er_bekreftet, er_walkover, fase,
  spelarar:kamp_spelar(
    id, kasterid, score_poeng, kamp_poeng, antall_ringer,
    kaster:kasterid(id, fornavn, etternavn, klubb:klubbid(kortnavn, navn)),
    omgangar:kamp_omgang(score, antall_ringer)
  )
`);async function i(n){let{data:r,error:i}=await t.from(`kamp`).select(`
      id, stevneid, runde_nummer, bane_nummer, er_bekreftet, er_walkover, fase,
      spelarar:kamp_spelar(
        id, kasterid, score_poeng, kamp_poeng, antall_ringer,
        kaster:kasterid(id, fornavn, etternavn, klubb:klubbid(kortnavn, navn)),
        omgangar:kamp_omgang(score, antall_ringer)
      )
    `).eq(`stevneid`,n).eq(`fase`,`innledende`).order(`runde_nummer`).order(`bane_nummer`);return i&&e(`hentInnledendeKamper`,i),{data:r??[],error:i}}async function a(n){if(!n.length)return!1;let{data:r,error:i}=await t.from(`kamp_omgang`).select(`id`).in(`kamp_spelar_id`,n).limit(1);return i&&e(`harKampOmgangar`,i),(r?.length??0)>0}async function o(n){if(!n.length)return{error:null};let{error:r}=await t.from(`kamp_omgang`).delete().in(`kamp_spelar_id`,n);return r&&e(`slettKampOmgangar`,r),{error:r}}async function s(n,r,i){let a=i===void 0?{score_poeng:r}:{score_poeng:r,kamp_poeng:i};try{let r=new Promise((e,t)=>setTimeout(()=>t(Error(`Request timed out`)),C)),{error:i}=await Promise.race([t.from(`kamp_spelar`).update(a).eq(`id`,n),r]);return i&&e(`oppdaterKampSpelarScoreRask`,i),{error:i}}catch(t){return e(`oppdaterKampSpelarScoreRask`,t),{error:t}}}async function c(n){let{data:r,error:i}=await t.from(`kamp`).select(`
      id, stevneid, fase, runde_nummer, runde_navn, bane_nummer,
      er_bekreftet, er_walkover, er_tre_spelarar,
      stevne:stevneid(navn),
      spelarar:kamp_spelar(
        id, kasterid, score_poeng, kamp_poeng, antall_ringer,
        kaster:kasterid(id, fornavn, etternavn)
      )
    `).eq(`id`,n).maybeSingle();return i&&e(`hentKamp`,i),{data:r,error:i}}async function l(n,r){if(!r.length)return new Map;let{data:i,error:a}=await t.from(`resultat`).select(`kasterid, hcp`).eq(`stevneid`,n).in(`kasterid`,r);return a&&e(`hentHcp`,a),new Map((i??[]).filter(e=>e.kasterid!=null).map(e=>[e.kasterid,e.hcp??0]))}async function u(n,r){if(!r.length)return{};let{data:i,error:a}=await t.from(`resultat`).select(`kasterid, startnummer`).eq(`stevneid`,n).in(`kasterid`,r);return a&&e(`hentStartnrMap`,a),Object.fromEntries((i??[]).filter(e=>e.kasterid!=null&&e.startnummer!=null).map(e=>[e.kasterid,e.startnummer]))}async function d(n,r){let{data:i,error:a}=await t.from(`kamp`).select(`id`).eq(`stevneid`,n).eq(`bane_nummer`,r).eq(`er_bekreftet`,!1).eq(`er_walkover`,!1).order(`runde_nummer`).limit(1).maybeSingle();return a&&e(`hentNesteKampOrganisator`,a),{data:i,error:a}}async function f(n,r){let{data:i,error:a}=await t.from(`kamp_spelar`).select(`kampid`).eq(`kasterid`,r);if(a)return e(`hentNesteKampDeltakar:minekampar`,a),{data:null,error:a};let o=(i??[]).map(e=>e.kampid).filter(e=>e!=null);if(!o.length)return{data:null,error:null};let{data:s,error:c}=await t.from(`kamp`).select(`id`).in(`id`,o).eq(`stevneid`,n).eq(`er_bekreftet`,!1).eq(`er_walkover`,!1).order(`runde_nummer`).limit(1).maybeSingle();return c&&e(`hentNesteKampDeltakar`,c),{data:s,error:c}}async function p(e,n){let{data:r}=await t.from(`kamp_spelar`).select(`id`).eq(`kampid`,e).eq(`kasterid`,n).maybeSingle();return!!r}async function m(r){let{kampId:i,p1:a,p2:o,hcp1:s,hcp2:c,erWalkover:l=!1}=r,u=0,d=0,f=0,p=0;if(l)u=21;else{let n=[a?.spelarId,o?.spelarId].filter(e=>e!=null),{data:r,error:i}=await t.from(`kamp_omgang`).select(`kamp_spelar_id, score, antall_ringer`).in(`kamp_spelar_id`,n);if(i)return e(`bekreftInnledendeKamp:omgangar`,i),{error:i};if(r?.length)for(let e of r)e.kamp_spelar_id===a?.spelarId?(u+=e.score??0,f+=e.antall_ringer??0):(d+=e.score??0,p+=e.antall_ringer??0);else{let{data:e}=await t.from(`kamp_spelar`).select(`id, score_poeng`).in(`id`,n),r=Object.fromEntries((e??[]).map(e=>[e.id,e.score_poeng??0]));u=a?r[a.spelarId]??a.scorePoeng:0,d=o?r[o.spelarId]??o.scorePoeng:0}u+=s,d+=c}let[m,h]=n(u,d),g=[];if(a&&g.push(t.from(`kamp_spelar`).update({score_poeng:u,kamp_poeng:m,antall_ringer:f}).eq(`id`,a.spelarId)),o&&g.push(t.from(`kamp_spelar`).update({score_poeng:d,kamp_poeng:h,antall_ringer:p}).eq(`id`,o.spelarId)),g.length){let t=(await Promise.all(g)).find(e=>e.error)?.error;if(t)return e(`bekreftInnledendeKamp:spelarar`,t),{error:t}}let{error:_}=await t.from(`kamp`).update({er_bekreftet:!0}).eq(`id`,i);return _&&e(`bekreftInnledendeKamp:kamp`,_),{error:_}}async function h(n){let{kampId:r,p1:i,p2:a,orderedKasterids:o}=n,s=null;if(o?.length===3)s=o[2];else{let e=[i?.spelarId,a?.spelarId].filter(e=>e!=null),{data:n}=await t.from(`kamp_omgang`).select(`kamp_spelar_id, score`).in(`kamp_spelar_id`,e),r={};for(let e of n??[])e.kamp_spelar_id!=null&&(r[e.kamp_spelar_id]=(r[e.kamp_spelar_id]??0)+(e.score??0));s=(i?r[i.spelarId]??i.scorePoeng:0)>=(a?r[a.spelarId]??a.scorePoeng:0)?a?.kasterid??null:i?.kasterid??null}let{error:c}=await t.rpc(`bekreft_avsluttende_kamp_deltakar`,{p_kamp_id:r,p_eliminert_kasterid:s??void 0});return c?(e(`bekreftAvsluttendeKamp`,c),{error:c}):{error:null}}t.from(`kamp`).select(`
  id, fase, runde_nummer, bane_nummer, gruppe_navn, runde_navn,
  er_bekreftet, er_walkover, er_tre_spelarar,
  spelarar:kamp_spelar(
    id, kasterid, score_poeng, kamp_poeng, antall_ringer, kamp_plassering,
    kaster:kasterid(fornavn, etternavn),
    omgangar:kamp_omgang(score, antall_ringer)
  )
`),t.from(`kamp_spelar`).select(`id, kasterid, score_poeng, antall_ringer, omgangar:kamp_omgang(score, antall_ringer)`);async function g(n){let{data:r,error:i}=await t.from(`kamp`).select(`
      id, fase, runde_nummer, bane_nummer, gruppe_navn, runde_navn,
      er_bekreftet, er_walkover, er_tre_spelarar,
      spelarar:kamp_spelar(
        id, kasterid, score_poeng, kamp_poeng, antall_ringer, kamp_plassering,
        kaster:kasterid(fornavn, etternavn),
        omgangar:kamp_omgang(score, antall_ringer)
      )
    `).eq(`stevneid`,n).order(`runde_nummer`).order(`bane_nummer`);return i&&e(`hentAvsluttendeKamper`,i),{data:r??[],error:i}}async function _(n){let{data:r,error:i}=await t.from(`kamp_spelar`).select(`id, kasterid, score_poeng, antall_ringer, omgangar:kamp_omgang(score, antall_ringer)`).eq(`kampid`,n);return i&&e(`hentKampSpelarar`,i),{data:r??[],error:i}}async function v(n,r){let{data:i,error:a}=await t.from(`kamp`).select(`er_bekreftet`).eq(`stevneid`,n).eq(`gruppe_navn`,r).eq(`runde_navn`,`Semifinale`);return a&&e(`harAlleSemifinalarBekrefta`,a),!!(i?.length&&i.every(e=>e.er_bekreftet))}async function y(n,r){if(!r.length)return{error:null};let i=(await Promise.all(r.map(e=>t.from(`kamp_spelar`).update({kamp_plassering:e.plassering}).eq(`kampid`,n).eq(`kasterid`,e.kasterid)))).find(e=>e.error)?.error??null;return i&&e(`setKampSpelarPlaseringar`,i),{error:i}}async function b(n){let{kampId:r,stevneId:i,rundeNummer:a,rundeNavn:o,allKasterids:s,eliminertId:c,vidareIds:l}=n,{error:u}=await t.from(`kamp`).update({er_bekreftet:!0}).eq(`id`,r);if(u)return e(`bekreftCupKamp:kamp`,u),{error:u};let{error:d}=await y(r,[...l.map((e,t)=>({kasterid:e,plassering:t+1})),...c==null?[]:[{kasterid:c,plassering:l.length+1}]]);if(d)return{error:d};if(o===`Semifinale`||!c)return{error:null};if(o!==`Finale`&&o!==`Bronsefinale`){let{error:n}=await t.from(`resultat`).update({runde_eliminert:null}).eq(`stevneid`,i).eq(`runde_eliminert`,a).in(`kasterid`,s);if(n)return e(`bekreftCupKamp:reset`,n),{error:n};let{error:r}=await t.from(`resultat`).update({runde_eliminert:a}).eq(`stevneid`,i).eq(`kasterid`,c);if(r)return e(`bekreftCupKamp:eliminert`,r),{error:r}}let f=l[0]??null;if(o===`Finale`&&f!=null){let{error:n}=await t.from(`resultat`).update({plassering:1}).eq(`stevneid`,i).eq(`kasterid`,f);if(n)return e(`bekreftCupKamp:plassering-vinnar`,n),{error:n};let{error:r}=await t.from(`resultat`).update({plassering:2}).eq(`stevneid`,i).eq(`kasterid`,c);if(r)return e(`bekreftCupKamp:plassering-tapar`,r),{error:r}}else if(o===`Bronsefinale`&&f!=null){let{error:n}=await t.from(`resultat`).update({plassering:3}).eq(`stevneid`,i).eq(`kasterid`,f);if(n)return e(`bekreftCupKamp:plassering-vinnar`,n),{error:n};let{error:r}=await t.from(`resultat`).update({plassering:4}).eq(`stevneid`,i).eq(`kasterid`,c);if(r)return e(`bekreftCupKamp:plassering-tapar`,r),{error:r}}return{error:null}}async function x(n){let{stevneId:r,rundeNummer:i,rundeNavn:a,allKasterids:o,nyVinnarId:s,nyTaparId:c}=n,l=a===`Semifinale`,u=a===`Finale`,d=a===`Bronsefinale`;if(l)return{error:null};if(u||d)if(u){if(s){let{error:n}=await t.from(`resultat`).update({plassering:1}).eq(`stevneid`,r).eq(`kasterid`,s);if(n)return e(`oppdaterVinnarTapar:plassering-vinnar`,n),{error:n}}if(c){let{error:n}=await t.from(`resultat`).update({plassering:2}).eq(`stevneid`,r).eq(`kasterid`,c);if(n)return e(`oppdaterVinnarTapar:plassering-tapar`,n),{error:n}}}else{if(s){let{error:n}=await t.from(`resultat`).update({plassering:3}).eq(`stevneid`,r).eq(`kasterid`,s);if(n)return e(`oppdaterVinnarTapar:plassering-vinnar`,n),{error:n}}if(c){let{error:n}=await t.from(`resultat`).update({plassering:4}).eq(`stevneid`,r).eq(`kasterid`,c);if(n)return e(`oppdaterVinnarTapar:plassering-tapar`,n),{error:n}}}else{let{error:n}=await t.from(`resultat`).update({runde_eliminert:null}).eq(`stevneid`,r).eq(`runde_eliminert`,i).in(`kasterid`,o);if(n)return e(`oppdaterVinnarTapar:reset`,n),{error:n};if(c){let{error:n}=await t.from(`resultat`).update({runde_eliminert:i}).eq(`stevneid`,r).eq(`kasterid`,c);if(n)return e(`oppdaterVinnarTapar:tapar`,n),{error:n}}}return{error:null}}t.from(`kamp_omgang`).select(`id, kamp_spelar_id, omgang, score, antall_ringer`);async function S(n){if(!n.length)return{data:[],error:null};let{data:r,error:i}=await t.from(`kamp_omgang`).select(`id, kamp_spelar_id, omgang, score, antall_ringer`).in(`kamp_spelar_id`,n).order(`omgang`);return i&&e(`hentKampOmgangar`,i),{data:r??[],error:i}}var C=1e4;async function w(n){if(!n.length)return{error:null};try{let r=new Promise((e,t)=>setTimeout(()=>t(Error(`Request timed out`)),C)),{error:i}=await Promise.race([t.from(`kamp_omgang`).insert(n),r]);return i&&e(`lagreKampOmgang`,i),{error:i}}catch(t){return e(`lagreKampOmgang`,t),{error:t}}}async function T(n){if(!n.length)return{error:null};try{let r=(await Promise.all(n.map(e=>t.from(`kamp_omgang`).update({score:e.score,antall_ringer:e.antall_ringer}).eq(`kamp_spelar_id`,e.kamp_spelar_id).eq(`omgang`,e.omgang)))).find(e=>e.error)?.error??null;return r&&e(`oppdaterKampOmgang`,r),{error:r}}catch(t){return e(`oppdaterKampOmgang`,t),{error:t}}}async function E(n){let{error:r}=await t.from(`kamp`).update({er_bekreftet:!1}).eq(`id`,n);return r&&e(`unbekreftKamp`,r),{error:r}}function D(e,n,r){return t.channel(`neste-kamp-${n}`).on(`postgres_changes`,{event:`INSERT`,schema:`public`,table:`kamp`,filter:`stevneid=eq.${e}`},e=>{r(e.new)}).subscribe()}function O(e,n,r){return t.channel(n).on(`postgres_changes`,{event:`*`,schema:`public`,table:`kamp_omgang`},r).on(`postgres_changes`,{event:`*`,schema:`public`,table:`kamp`},t=>{(t.new?.stevneid??t.old?.stevneid)===e&&r()}).subscribe()}function k(e,n,r,i,a){let o=null;return t.channel(`scoreboard-kamp-${e}`).on(`postgres_changes`,{event:`*`,schema:`public`,table:`kamp_omgang`},e=>{let t=e.new,i=e.old,a=t.kamp_spelar_id??i.kamp_spelar_id;(!a||n.includes(a))&&(o&&clearTimeout(o),o=setTimeout(()=>{o=null,r()},50))}).on(`postgres_changes`,{event:`UPDATE`,schema:`public`,table:`kamp`,filter:`id=eq.${e}`},async e=>{e.new?.er_bekreftet&&await i()}).subscribe(e=>{e===`SUBSCRIBED`&&a?.()})}export{O as C,E,o as S,k as T,w as _,v as a,x as b,l as c,S as d,_ as f,u as g,d as h,p as i,i as l,f as m,b as n,a as o,r as p,m as r,g as s,h as t,c as u,T as v,D as w,y as x,s as y};