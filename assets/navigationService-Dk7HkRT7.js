import{n as e,t}from"./logError-CB4-2Lin.js";import{t as n}from"./verifiedWrite-dJ27H7z9.js";import{Xt as r,m as i}from"./index-DXJSs_ua.js";import{i as a}from"./kastemetode-Dor3Q-Ix.js";e.from(`stevne`).select(`
    id, navn, sted, dato, erfullfort, resultaturl, juryleder, klubbid, snc_hovudstevne_id,
    stevnetype:stevnetypeid(navn),
    kategori:kategoriid(navn, erlagbasert),
    kontakt:kontaktkasterid(fornavn, etternavn),
    innledende:kastemetode!innledendekastemetodeid(navn),
    avsluttende:kastemetode!avsluttendekastemetodeid(navn)
  `),e.from(`resultat`).select(`
    plassering, nc_poeng, snc_plassering, startnummer, kamp_poeng_innl, score_poeng_innl,
    kaster:kasterid(id, fornavn, etternavn),
    klubb:klubbid(navn),
    klasse:klasseid(navn),
    gruppe:gruppeid(navn)
  `);async function o(n){let{data:r,error:i}=await e.from(`stevne`).select(`
      id, navn, sted, dato, erfullfort, resultaturl, juryleder, klubbid, snc_hovudstevne_id,
      stevnetype:stevnetypeid(navn),
      kategori:kategoriid(navn, erlagbasert),
      kontakt:kontaktkasterid(fornavn, etternavn),
      innledende:kastemetode!innledendekastemetodeid(navn),
      avsluttende:kastemetode!avsluttendekastemetodeid(navn)
    `).eq(`id`,n).maybeSingle();return i&&t(`getTournamentWithDetails`,i),{data:r,error:i}}e.from(`resultat`).select(`kasterid, startnummer, hcp, posisjon`);async function s(n){let{data:r,error:i}=await e.from(`resultat`).select(`kasterid, startnummer, hcp, posisjon`).eq(`stevneid`,n);return i&&t(`getResultsForInitialRound`,i),{data:r??[],error:i}}e.from(`resultat`).select(`
  kasterid, startnummer, posisjon, plassering, runde_eliminert,
  poeng_xkast, antall_ring_xkast,
  kaster:kasterid(fornavn, etternavn),
  gruppe:gruppeid(id, navn)
`);async function c(n){let{data:r,error:i}=await e.from(`resultat`).select(`
      kasterid, startnummer, posisjon, plassering, runde_eliminert,
      poeng_xkast, antall_ring_xkast,
      kaster:kasterid(fornavn, etternavn),
      gruppe:gruppeid(id, navn)
    `).eq(`stevneid`,n);return i&&t(`getResultsForFinalRound`,i),{data:r??[],error:i}}async function l(n){let{data:r,error:i}=await e.from(`gruppe`).select(`id, navn`).in(`navn`,n);return i&&t(`getGroups`,i),{data:r??[],error:i}}async function u(r,i){if(!i.length)return{error:null};let a=(await Promise.all(i.map(t=>n(e.from(`resultat`).update({gruppeid:t.gruppeid}).eq(`stevneid`,r).eq(`kasterid`,t.kasterid).select(`id`))))).find(e=>e.error)?.error??null;return a&&t(`setGroupAssignment`,a),{error:a}}async function d(n,r){if(!r.length)return{error:null};let i=(await Promise.all(r.map((t,r)=>e.from(`resultat`).update({plassering:r+1}).eq(`stevneid`,n).eq(`kasterid`,t.kasterid)))).find(e=>e.error)?.error??null;return i&&t(`writePlacements`,i),{error:i}}async function f(n){try{let[r,i]=await Promise.all([e.from(`resultat`).select(`kasterid, poeng_xkast, antall_ring_xkast`).eq(`stevneid`,n).not(`kasterid`,`is`,null),e.from(`innledende_kamp_poeng`).select(`kasterid, kamp_poeng_innl, score_poeng_innl`).eq(`stevneid`,n)]),a=r.error??i.error;if(a)return t(`getKongelagSeedingRows`,a),{data:[],error:a};let o=new Map((i.data??[]).filter(e=>e.kasterid!=null).map(e=>[e.kasterid,e]));return{data:(r.data??[]).filter(e=>e.kasterid!=null).map(e=>({kasterid:e.kasterid,poeng_xkast:e.poeng_xkast,antall_ring_xkast:e.antall_ring_xkast,kamp_poeng_innl:o.get(e.kasterid)?.kamp_poeng_innl??null,score_poeng_innl:o.get(e.kasterid)?.score_poeng_innl??null})),error:null}}catch(e){return t(`getKongelagSeedingRows`,e),{data:[],error:e}}}async function p(n){let{error:r}=await e.from(`resultat`).update({gruppeid:null}).eq(`stevneid`,n);return r&&t(`clearGroupAssignment`,r),{error:r}}var m=`
  snc_plassering, plassering, nc_poeng, poeng_xkast, poeng_kongelag,
  antall_ring_xkast, antall_ring_kongelag, erpremie,
  kaster:kasterid(id, fornavn, etternavn),
  klubb:klubbid(navn),
  stevne:stevneid!inner(id, navn, sted, klubb:klubbid(navn))
`;e.from(`resultat`).select(m);async function h(n){let{data:r,error:i}=await e.from(`resultat`).select(m).eq(`stevne.snc_hovudstevne_id`,n).order(`snc_plassering`,{nullsFirst:!1});return i&&t(`getSncConsolidatedResults`,i),{data:r??[],error:i}}async function g(n,r){let{data:i,error:a}=await e.rpc(`draw_snc_premiar`,{p_stevneid:n,...`prosent`in r?{p_prosent:r.prosent}:{p_antal:r.antal}});return a&&t(`drawSncPremiar`,a),{antal:i??0,error:a}}async function _(n){let{data:r,error:i}=await e.rpc(`clear_snc_premiar`,{p_stevneid:n});return i&&t(`clearSncPremiar`,i),{antal:r??0,error:i}}async function v(n){let{data:r,error:i}=await e.from(`resultat`).select(`
      plassering, nc_poeng, snc_plassering, startnummer, kamp_poeng_innl, score_poeng_innl,
      kaster:kasterid(id, fornavn, etternavn),
      klubb:klubbid(navn),
      klasse:klasseid(navn),
      gruppe:gruppeid(navn)
    `).eq(`stevneid`,n).order(`plassering`);return i&&t(`getResultsForTournament`,i),{data:r??[],error:i}}function y(e,t){if(!Number.isInteger(e)||e<0)throw Error(`participantCount must be a non-negative integer, got ${e}`);if(!Number.isInteger(t)||t<1)throw Error(`maxPerPulje must be a positive integer, got ${t}`);if(e===0)return[];let n=Math.ceil(e/t),r=Math.floor(e/n),i=e%n;return Array.from({length:n},(e,t)=>r+ +(t>=n-i))}function b(e){let t=e.some(e=>e.poeng_xkast!=null),n=e=>(t?e.poeng_xkast:e.kamp_poeng_innl)??-1,r=e=>(t?e.antall_ring_xkast:e.score_poeng_innl)??-1;return[...e].sort((e,t)=>n(t)-n(e)||r(t)-r(e)).map(e=>e.kasterid)}function x(e,t){if(!e.length)return[];let n=Math.max(1,Math.ceil(e.length/2)),r=Math.min(t??e.length,n),i=y(e.length,r),a=[],o=0;for(let t=i.length-1;t>=0;t--)for(let n=0;n<i[t];n++)a.push({pulje:t+1,baneNummer:n+1,kasterids:[e[o]]}),o++;return a.sort((e,t)=>e.pulje-t.pulje||e.baneNummer-t.baneNummer)}function S(e,t=4){return{min:Math.max(0,Math.ceil((e-3*t)/2)),max:Math.min(t,Math.floor(e/5))}}function C(e){let{min:t,max:n}=S(e);if(t>n)return{allowed:[],autoSelected:null};let r=Array.from({length:n-t+1},(e,n)=>t+n);return{allowed:r,autoSelected:r.length===1?r[0]:null}}function w(e,t){if(!Number.isInteger(e)||!Number.isInteger(t)||e<0||e>20||t<0||t>4)return!1;let{min:n,max:r}=S(e);return t>=n&&t<=r}function T(e){return 4*e}function E(e){return T(e)*5}function D(e){return T(e)}function O(e,t){let n=T(t);return n<=0?null:e/n*100}function k(e,t,n){if(!Number.isInteger(e)||!Number.isInteger(t))return!1;let r=T(n);if(e<0||e>E(n)||t<0||t>D(n))return!1;let{min:i,max:a}=S(e,r);return t>=i&&t<=a}function A(e,t){let n=Math.max(e.length,t.length);for(let r=0;r<n;r++){let n=(t[r]??-1)-(e[r]??-1);if(n!==0)return n}return 0}function j(e,t){return t.poeng===e.poeng?t.antallRinger===e.antallRinger?A(e.omgangPoengDesc,t.omgangPoengDesc):t.antallRinger-e.antallRinger:t.poeng-e.poeng}function M(e,t){e.sort(t);let n=1;return e.forEach((r,i)=>{let a=e[i-1];a&&t(a,r)!==0&&(n=i+1),r.plassering=n}),e}function N(e){return M(e.map(e=>e.manualTotal?{kasterid:e.kasterid,navn:e.navn,poeng:e.manualTotal.poeng,antallRinger:e.manualTotal.antallRinger,antallOmganger:e.manualTotal.antallOmganger,omgangPoengDesc:[],plassering:0}:{kasterid:e.kasterid,navn:e.navn,poeng:e.omganger.reduce((e,t)=>e+t.poeng,0),antallRinger:e.omganger.reduce((e,t)=>e+(t.antall_ringer??0),0),antallOmganger:e.omganger.length,omgangPoengDesc:e.omganger.map(e=>e.poeng).sort((e,t)=>t-e),plassering:0}),j)}function P(e){return 100/(e*20)}function F(e){return Number((P(e)*100).toFixed(2))}function I(e,t){let n=t.isXkast&&t.antallOmganger?P(t.antallOmganger):0,r={};for(let i of e)r[i.kasterid]=t.isXkast?Math.round((i.poeng_xkast??0)*n):i.kamp_poeng_innl??0;return r}function L(e,t){return t.displayTotal===e.displayTotal?j(e,t):t.displayTotal-e.displayTotal}function R(e,t){return M(e.map(e=>{let n=t[e.kasterid]??0;return{...e,carryOver:n,displayTotal:e.poeng+n}}),L)}e.from(`xkast_kongelag`).select(`
  id, stevneid, fase, pulje, bane_nummer, er_bekreftet,
  deltakarar:xkast_kongelag_deltaker(
    id, kasterid, poeng, antall_ringer, totalsum_manuelt,
    kaster:kasterid(id, fornavn, etternavn, klubb:klubbid(kortnavn, navn)),
    omgangar:xkast_kongelag_omgang(id, omgang, poeng, antall_ringer)
  )
`);async function z(n,r){let{data:i,error:a}=await e.from(`xkast_kongelag`).select(`
      id, stevneid, fase, pulje, bane_nummer, er_bekreftet,
      deltakarar:xkast_kongelag_deltaker(
        id, kasterid, poeng, antall_ringer, totalsum_manuelt,
        kaster:kasterid(id, fornavn, etternavn, klubb:klubbid(kortnavn, navn)),
        omgangar:xkast_kongelag_omgang(id, omgang, poeng, antall_ringer)
      )
    `).eq(`stevneid`,n).eq(`fase`,r).order(`pulje`).order(`bane_nummer`);return a&&t(`getCourts`,a),{data:i??[],error:a}}e.from(`xkast_kongelag_deltaker`).select(`
  id, kasterid,
  bane:xkast_kongelag_id(
    id, stevneid, fase, bane_nummer, er_bekreftet,
    stevne:stevneid(id, navn, dato, erfullfort),
    deltakarar:xkast_kongelag_deltaker(
      id, kasterid, poeng,
      kaster:kasterid(id, fornavn, etternavn)
    )
  )
`);async function B(n){let{data:r,error:i}=await e.from(`xkast_kongelag_deltaker`).select(`
      id, kasterid,
      bane:xkast_kongelag_id(
        id, stevneid, fase, bane_nummer, er_bekreftet,
        stevne:stevneid(id, navn, dato, erfullfort),
        deltakarar:xkast_kongelag_deltaker(
          id, kasterid, poeng,
          kaster:kasterid(id, fornavn, etternavn)
        )
      )
    `).eq(`kasterid`,n);return i&&t(`getMyCourts`,i),{data:(r??[]).map(e=>e.bane).filter(e=>e!=null),error:i}}async function V(n,r){let{data:i,error:a}=await e.from(`stevne`).select(`
      tilgjengelige_baner, stevne_fase, erfullfort, innledendekastemetodeid, avsluttendekastemetodeid,
      kastemetodeInnl:kastemetode!stevne_innledendekastemetodeid_fkey(navn, antall_omganger),
      kastemetodeAvsl:kastemetode!stevne_avsluttendekastemetodeid_fkey(navn, antall_omganger)
    `).eq(`id`,n).maybeSingle();if(a&&t(`loadCourtPhaseConfig`,a),!i)return{data:null,error:a};let o=r===`innledende`?i.kastemetodeInnl:i.kastemetodeAvsl;return{data:{metodeNavn:o?.navn??null,antallOmganger:o?.antall_omganger??null,tilgjengeligeBaner:i.tilgjengelige_baner,stevneFase:i.stevne_fase,erfullfort:i.erfullfort??!1,hasInitialPhase:i.innledendekastemetodeid!=null,hasFinalPhase:i.avsluttendekastemetodeid!=null},error:a}}function H(e){return V(e,`innledende`)}function U(e){return V(e,`avsluttende`)}async function W(n){try{let[r,i,a,o]=await Promise.all([e.from(`kamp`).select(`id`,{count:`exact`,head:!0}).eq(`stevneid`,n).eq(`fase`,`innledende`),e.from(`kamp`).select(`id`,{count:`exact`,head:!0}).eq(`stevneid`,n).eq(`fase`,`innledende`).eq(`er_bekreftet`,!1).eq(`er_walkover`,!1),e.from(`xkast_kongelag`).select(`id`,{count:`exact`,head:!0}).eq(`stevneid`,n).eq(`fase`,`innledende`),e.from(`xkast_kongelag`).select(`id`,{count:`exact`,head:!0}).eq(`stevneid`,n).eq(`fase`,`innledende`).eq(`er_bekreftet`,!1)]),s=r.error??i.error??a.error??o.error;if(s)return t(`isInnledendeComplete`,s),{data:!1,error:s};let c=(r.count??0)+(a.count??0),l=(i.count??0)+(o.count??0);return{data:c>0&&l===0,error:null}}catch(e){return t(`isInnledendeComplete`,e),{data:!1,error:e}}}async function G(n){let{data:r,error:i}=await e.from(`stevne`).select(`kastemetodeInnl:kastemetode!stevne_innledendekastemetodeid_fkey(navn, antall_omganger)`).eq(`id`,n).maybeSingle();if(i)return t(`getKongelagCarryOver`,i),{data:null,error:i};if(!r?.kastemetodeInnl)return{data:null,error:null};let{data:o,error:s}=await f(n);if(s)return{data:null,error:s};let{navn:c,antall_omganger:l}=r.kastemetodeInnl,u=a(c??``);return{data:{byKasterid:I(o,{isXkast:u,antallOmganger:l}),xkastPercent:u&&l?F(l):null},error:null}}async function K(n){let{data:r,error:a}=await i(n);if(a)return{data:[],error:a};if(!r.length){let e=Error(`generateKongelagCourts: no enrolled players`);return t(`generateKongelagCourts`,e),{data:[],error:e}}let{error:o}=await e.from(`resultat`).delete().eq(`stevneid`,n);if(o)return t(`generateKongelagCourts:clearResultat`,o),{data:[],error:o};for(let e=r.length-1;e>0;e--){let t=Math.floor(Math.random()*(e+1));[r[e],r[t]]=[r[t],r[e]]}let{error:s}=await e.from(`resultat`).insert(r.map((e,t)=>({stevneid:n,kasterid:e.kasterid,klubbid:e.klubbid,startnummer:t+1,posisjon:null})));return s?(t(`generateKongelagCourts:resultat`,s),{data:[],error:s}):{data:r.map(e=>e.kasterid),error:null}}async function q(n){let{data:r,error:i}=await U(n);if(i||!r)return{error:i??Error(`Stevne ikkje funne`)};let{count:a,error:o}=await e.from(`xkast_kongelag`).select(`id`,{count:`exact`,head:!0}).eq(`stevneid`,n).eq(`fase`,`avsluttende`);if(o)return t(`generateKongelagCourts:count`,o),{error:o};if((a??0)>0){let e=Error(`generateKongelagCourts: courts already generated`);return t(`generateKongelagCourts`,e),{error:e}}let s;if(r.hasInitialPhase){let{data:e,error:r}=await f(n);if(r)return{error:r};if(!e.length){let e=Error(`generateKongelagCourts: no resultat rows to seed from`);return t(`generateKongelagCourts`,e),{error:e}}s=b(e)}else{let{data:e,error:t}=await K(n);if(t)return{error:t};s=e}return J(n,`avsluttende`,x(s,r.tilgjengeligeBaner))}async function J(n,r,i){if(!i.length)return{error:null};let{data:a,error:o}=await e.from(`xkast_kongelag`).insert(i.map(e=>({stevneid:n,fase:r,pulje:e.pulje,bane_nummer:e.baneNummer}))).select(`id, pulje, bane_nummer`);if(o||!a)return t(`createCourts`,o),{error:o};let s=new Map(a.map(e=>[`${e.pulje}-${e.bane_nummer}`,e.id])),c=i.flatMap(e=>{let t=s.get(`${e.pulje}-${e.baneNummer}`);return t===void 0?[]:e.kasterids.map(e=>({xkast_kongelag_id:t,kasterid:e}))});if(c.length!==i.reduce((e,t)=>e+t.kasterids.length,0)){let e=Error(`createCourts: inserted courts could not be matched back to input`);return t(`createCourts`,e),{error:e}}let{error:l}=await e.from(`xkast_kongelag_deltaker`).insert(c);return l&&t(`createCourts`,l),{error:l}}async function Y(n,r,i,a){let{error:o}=await e.from(`xkast_kongelag_omgang`).upsert({xkast_kongelag_deltaker_id:n,omgang:r,poeng:i,antall_ringer:a},{onConflict:`xkast_kongelag_deltaker_id,omgang`});return o&&t(`saveOmgang`,o),{error:o}}async function X(n,r){let{error:i}=await e.rpc(`swap_xkast_kongelag_deltaker`,{p_deltaker_a:n,p_deltaker_b:r});return i&&t(`swapCourtPlayers`,i),{error:i}}async function Z(n,r,i,a){let{error:o}=await e.rpc(`edit_xkast_kongelag_omgang`,{p_deltaker_id:n,p_omgang:r,p_poeng:i,p_antall_ringer:a});return o&&t(`editCourtOmgang`,o),{error:o}}async function Q(n,r,i){let{error:a}=await e.rpc(`set_xkast_kongelag_total`,{p_deltaker_id:n,p_poeng:r,p_antall_ringer:i});return a&&t(`setCourtTotal`,a),{error:a}}async function $(n){let{error:r}=await e.rpc(`confirm_xkast_kongelag`,{p_xkast_kongelag_id:n});return r&&t(`confirmCourt`,r),{error:r}}function ee(t,n,r,i){return e.channel(n).on(`postgres_changes`,{event:`*`,schema:`public`,table:`xkast_kongelag_omgang`},e=>{let t=e.new?.xkast_kongelag_deltaker_id??e.old?.xkast_kongelag_deltaker_id;t!=null&&i&&!i(t)||r()}).on(`postgres_changes`,{event:`*`,schema:`public`,table:`xkast_kongelag_deltaker`},e=>{let t=e.new?.id??e.old?.id;t!=null&&i&&!i(t)||r()}).on(`postgres_changes`,{event:`*`,schema:`public`,table:`xkast_kongelag`},e=>{(e.new?.stevneid??e.old?.stevneid)===t&&r()}).subscribe()}function te(e){if(r.isNativePlatform()){location.href=e;return}window.open(e,`_blank`)}function ne(){return r.isNativePlatform()?``:` target="_blank" rel="noopener"`}export{g as A,C,y as D,D as E,h as F,o as I,u as L,c as M,s as N,p as O,v as P,d as R,k as S,E as T,R as _,Z as a,N as b,G as c,H as d,W as f,X as g,ee as h,J as i,l as j,_ as k,U as l,Q as m,te as n,q as o,Y as p,$ as r,z as s,ne as t,B as u,P as v,O as w,w as x,F as y};