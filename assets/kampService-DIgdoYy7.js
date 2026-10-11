import{n as e,t}from"./logError-DeZsXp8u.js";import{t as n}from"./verifiedWrite-DY57lQG_.js";import{Jn as r}from"./index-DsqZhKPc.js";e.from(`kamp_spelar`).select(`
  id, kasterid,
  kamp:kampid(
    id, stevneid, fase, runde_nummer, bane_nummer, er_bekreftet, er_walkover, er_tre_spelarar,
    stevne:stevneid(
      id, navn, dato, erfullfort,
      metodeInnl:kastemetode!stevne_innledendekastemetodeid_fkey(navn),
      metodeAvsl:kastemetode!stevne_avsluttendekastemetodeid_fkey(navn)
    ),
    spelarar:kamp_spelar(
      id, kasterid, score_poeng, kamp_plassering,
      kaster:kasterid(id, fornavn, etternavn),
      omgangar:kamp_omgang(score)
    )
  )
`);async function i(n){let{data:r,error:i}=await e.from(`kamp_spelar`).select(`
      id, kasterid,
      kamp:kampid(
        id, stevneid, fase, runde_nummer, bane_nummer, er_bekreftet, er_walkover, er_tre_spelarar,
        stevne:stevneid(
          id, navn, dato, erfullfort,
          metodeInnl:kastemetode!stevne_innledendekastemetodeid_fkey(navn),
          metodeAvsl:kastemetode!stevne_avsluttendekastemetodeid_fkey(navn)
        ),
        spelarar:kamp_spelar(
          id, kasterid, score_poeng, kamp_plassering,
          kaster:kasterid(id, fornavn, etternavn),
          omgangar:kamp_omgang(score)
        )
      )
    `).eq(`kasterid`,n);return i&&t(`getMyMatches`,i),{data:r??[],error:i}}e.from(`kamp`).select(`
    id, stevneid, fase, runde_nummer, runde_navn, bane_nummer,
    er_bekreftet, er_walkover, er_tre_spelarar,
    stevne:stevneid(navn, klubbid),
    spelarar:kamp_spelar(
      id, kasterid, score_poeng, kamp_poeng, antall_ringer,
      kaster:kasterid(id, fornavn, etternavn)
    )
  `),e.from(`kamp`).select(`
  id, stevneid, runde_nummer, bane_nummer, er_bekreftet, er_walkover, fase,
  spelarar:kamp_spelar(
    id, kasterid, score_poeng, kamp_poeng, antall_ringer,
    kaster:kasterid(id, fornavn, etternavn, klubb:klubbid(kortnavn, navn)),
    omgangar:kamp_omgang(score, antall_ringer)
  )
`);async function a(n){let{data:r,error:i}=await e.from(`kamp`).select(`
      id, stevneid, runde_nummer, bane_nummer, er_bekreftet, er_walkover, fase,
      spelarar:kamp_spelar(
        id, kasterid, score_poeng, kamp_poeng, antall_ringer,
        kaster:kasterid(id, fornavn, etternavn, klubb:klubbid(kortnavn, navn)),
        omgangar:kamp_omgang(score, antall_ringer)
      )
    `).eq(`stevneid`,n).eq(`fase`,`innledende`).order(`runde_nummer`).order(`bane_nummer`);return i&&t(`getInitialRoundMatches`,i),{data:r??[],error:i}}async function o(t,n){if(!t.length)return{error:null};let r=e.from(`kamp_omgang`).delete().in(`kamp_spelar_id`,t);return w(`deleteMatchRounds`,n==null?r:r.eq(`omgang`,n))}async function s(n){let{data:r,error:i}=await e.from(`kamp`).select(`
      id, stevneid, fase, runde_nummer, runde_navn, bane_nummer,
      er_bekreftet, er_walkover, er_tre_spelarar,
      stevne:stevneid(navn, klubbid),
      spelarar:kamp_spelar(
        id, kasterid, score_poeng, kamp_poeng, antall_ringer,
        kaster:kasterid(id, fornavn, etternavn)
      )
    `).eq(`id`,n).maybeSingle();return i&&t(`getMatch`,i),{data:r,error:i}}async function c(n,r){if(!r.length)return{startNumberMap:{},positionMap:{},hcpMap:new Map};let{data:i,error:a}=await e.from(`resultat`).select(`kasterid, startnummer, posisjon, hcp`).eq(`stevneid`,n).in(`kasterid`,r);a&&t(`getMatchResultInfo`,a);let o={},s={},c=new Map;for(let e of i??[])e.kasterid!=null&&(e.startnummer!=null&&(o[e.kasterid]=e.startnummer),e.posisjon!=null&&(s[e.kasterid]=e.posisjon),c.set(e.kasterid,e.hcp??0));return{startNumberMap:o,positionMap:s,hcpMap:c}}async function l(n){if(!n.length)return{};let{data:r,error:i}=await e.from(`resultat`).select(`stevneid, kasterid, startnummer`).in(`stevneid`,n);i&&t(`getStartNumbersForTournaments`,i);let a={};for(let e of r??[])e.kasterid!=null&&e.startnummer!=null&&(a[`${e.stevneid}:${e.kasterid}`]=e.startnummer);return a}async function u(n,r){let{data:i,error:a}=await e.from(`kamp`).select(`id`).eq(`stevneid`,n).eq(`bane_nummer`,r).eq(`er_bekreftet`,!1).eq(`er_walkover`,!1).order(`runde_nummer`).limit(1).maybeSingle();return a&&t(`getNextMatchForOrganizer`,a),{data:i,error:a}}async function d(n,r){let{data:i,error:a}=await e.from(`kamp_spelar`).select(`kampid`).eq(`kasterid`,r);if(a)return t(`getNextMatchForParticipant:minekampar`,a),{data:null,error:a};let o=(i??[]).map(e=>e.kampid).filter(e=>e!=null);if(!o.length)return{data:null,error:null};let{data:s,error:c}=await e.from(`kamp`).select(`id`).in(`id`,o).eq(`stevneid`,n).eq(`er_bekreftet`,!1).eq(`er_walkover`,!1).order(`runde_nummer`).limit(1).maybeSingle();return c&&t(`getNextMatchForParticipant`,c),{data:s,error:c}}async function f(t,n){let{data:r}=await e.from(`kamp_spelar`).select(`id`).eq(`kampid`,t).eq(`kasterid`,n).maybeSingle();return!!r}function p(e,t){if(!e)return null;let{baseScore:n}=t??{};return{playerIds:e.members.map(e=>e.id),kasterid:e.rep.kasterid,...n==null?{}:{baseScore:n}}}function m(e){let{roundData:t,sides:n,hcp:i=[],erWalkover:a=!1,placements:o}=e,s=new Map;for(let e of n)for(let t of e?.playerIds??[])s.set(t,{score_poeng:0,kamp_poeng:0,antall_ringer:0,kamp_plassering:null});let c=n.map(()=>0),l=e=>n[e]?.playerIds[0];if(a){c[0]=21;let e=l(0);e!=null&&(s.get(e).score_poeng=21)}else if(t.length){for(let e of t){let t=e.kamp_spelar_id;if(t==null)continue;let r=s.get(t);if(!r)continue;r.score_poeng+=e.score??0,r.antall_ringer+=e.antall_ringer??0;let i=n.findIndex(e=>e?.playerIds.includes(t));i!==-1&&(c[i]=(c[i]??0)+(e.score??0))}n.forEach((e,t)=>{let n=i[t]??0;if(!n)return;c[t]=(c[t]??0)+n;let r=l(t);r!=null&&(s.get(r).score_poeng+=n)})}else n.forEach((e,t)=>{if(!e)return;c[t]=e.baseScore??0;let n=l(t);n!=null&&(s.get(n).score_poeng=e.baseScore??0)});if(n.filter(Boolean).length<=2){let[e,t]=r(c[0]??0,c[1]??0);for(let t of n[0]?.playerIds??[])s.get(t).kamp_poeng=e;for(let e of n[1]?.playerIds??[])s.get(e).kamp_poeng=t}return n.forEach((e,t)=>{let r=o?.[t]??1+n.filter((e,n)=>e&&(c[n]??0)>(c[t]??0)).length;for(let t of e?.playerIds??[])s.get(t).kamp_plassering=r}),{updates:s,totals:c}}function h(e,t){let n=e.map((e,n)=>({side:e,total:t[n]??0})).filter(e=>e.side!=null);return n.length<2?null:n.reduce((e,t)=>t.total<=e.total?t:e).side.kasterid??null}var g=`Kampen er allereie stadfesta av ein annan deltakar.`;async function _(n){let{sides:r,hcp:i,erWalkover:a,placements:o}=n,s=r.flatMap(e=>e?.playerIds??[]),c={updates:new Map,totals:r.map(()=>0)};if(!s.length)return{error:null,...c};let l=[],u=r,d=r.every(e=>!e||e.baseScore!=null);if(!a&&!d){let{data:n,error:i}=await e.from(`kamp_omgang`).select(`kamp_spelar_id, score, antall_ringer`).in(`kamp_spelar_id`,s);if(i)return t(`confirmMatch:omgangar`,i),{error:i,...c};if(l=n??[],!l.length){let{data:t}=await e.from(`kamp_spelar`).select(`id, score_poeng`).in(`id`,s),n=new Map((t??[]).map(e=>[e.id,e.score_poeng??0]));u=r.map(e=>{if(!e||e.baseScore!=null)return e;let t=e.playerIds.filter(e=>n.has(e));return t.length?{...e,baseScore:t.reduce((e,t)=>e+n.get(t),0)}:e})}}let{updates:f,totals:p}=m({roundData:l,sides:u,hcp:i,erWalkover:a,placements:o});return{error:null,updates:f,totals:p}}async function v(r){let i=(await Promise.all([...r.entries()].map(([t,r])=>n(e.from(`kamp_spelar`).update(r).eq(`id`,t).select(`id`),g)))).find(e=>e.error)?.error??null;return i&&t(`confirmMatch:spelarar`,i),{error:i}}async function y(n){let{kampId:r,sides:i,hcp:a,erWalkover:o=!1,ranking:s,outcome:c}=n,{error:l,updates:u,totals:d}=await _({sides:i,hcp:a,erWalkover:o,placements:s?i.map(e=>s.find(t=>t.kasterid===e?.kasterid)?.plassering??null):void 0});if(l)return{error:l};let f=[...u.entries()].map(([e,t])=>({kamp_spelar_id:e,...t}));if(c.type===`innledende`){let{data:n,error:i}=await e.rpc(`bekreft_innledende_kamp`,{p_kamp_id:r,p_scores:f}).abortSignal(AbortSignal.timeout(C));return!i&&n!==!1||await b(r,u)?{error:null,stored:u}:(i&&t(`confirmMatch:innledende`,i),{error:i??Error(g)})}if(c.type===`cup-ranked`){let{error:n}=await e.rpc(`bekreft_avsluttende_kamp_rangert`,{p_kamp_id:r,p_scores:f,p_vidare:c.advancingSides,p_eliminert:c.eliminatedIds,p_slett_omgangar:c.deleteRounds??!1}).abortSignal(AbortSignal.timeout(C));return!n||await b(r,u)?{error:null,stored:u}:(t(`confirmMatch:cup-ranked`,n),{error:n})}let{error:p}=await v(u);if(p)return{error:p};let m=s?.length===3?s[2]?.kasterid??null:h(i,d),{error:y}=await e.rpc(`bekreft_avsluttende_kamp_deltakar`,{p_kamp_id:r,p_eliminert_kasterid:m??void 0});return y&&t(`confirmMatch:cup-derived`,y),{error:y}}async function b(t,n){try{let{data:r,error:i}=await e.from(`kamp`).select(`er_bekreftet, spelarar:kamp_spelar(id, score_poeng)`).eq(`id`,t).abortSignal(AbortSignal.timeout(C)).maybeSingle();return i||!r?.er_bekreftet?!1:[...n.entries()].every(([e,t])=>r.spelarar.some(n=>n.id===e&&n.score_poeng===t.score_poeng))}catch{return!1}}e.from(`kamp`).select(`
  id, fase, runde_nummer, bane_nummer, gruppe_navn, runde_navn,
  er_bekreftet, er_walkover, er_tre_spelarar,
  spelarar:kamp_spelar(
    id, kasterid, score_poeng, kamp_poeng, antall_ringer, kamp_plassering,
    kaster:kasterid(fornavn, etternavn),
    omgangar:kamp_omgang(score, antall_ringer)
  )
`),e.from(`kamp_spelar`).select(`id, kasterid, score_poeng, antall_ringer, omgangar:kamp_omgang(score, antall_ringer)`);async function x(n){let{data:r,error:i}=await e.from(`kamp`).select(`
      id, fase, runde_nummer, bane_nummer, gruppe_navn, runde_navn,
      er_bekreftet, er_walkover, er_tre_spelarar,
      spelarar:kamp_spelar(
        id, kasterid, score_poeng, kamp_poeng, antall_ringer, kamp_plassering,
        kaster:kasterid(fornavn, etternavn),
        omgangar:kamp_omgang(score, antall_ringer)
      )
    `).eq(`stevneid`,n).order(`runde_nummer`).order(`bane_nummer`);return i&&t(`getFinalRoundMatches`,i),{data:r??[],error:i}}e.from(`kamp_omgang`).select(`id, kamp_spelar_id, omgang, score, antall_ringer`);async function S(n){if(!n.length)return{data:[],error:null};let{data:r,error:i}=await e.from(`kamp_omgang`).select(`id, kamp_spelar_id, omgang, score, antall_ringer`).in(`kamp_spelar_id`,n).order(`omgang`);return i&&t(`getMatchRounds`,i),{data:r??[],error:i}}var C=2e4;async function w(e,n){try{let{error:r}=await n.abortSignal(AbortSignal.timeout(C));return r&&t(e,r),{error:r}}catch(n){return t(e,n),{error:n}}}async function T(t){if(!t.length)return{error:null};let n=await w(`saveMatchRound`,e.from(`kamp_omgang`).insert(t));return n.error&&await E(t)?{error:null}:n}async function E(t){try{let{data:n,error:r}=await e.from(`kamp_omgang`).select(`kamp_spelar_id, omgang, score`).in(`kamp_spelar_id`,t.map(e=>e.kamp_spelar_id)).abortSignal(AbortSignal.timeout(C));return r||!n?!1:t.every(e=>n.some(t=>t.kamp_spelar_id===e.kamp_spelar_id&&t.omgang===e.omgang&&t.score===e.score))}catch{return!1}}function D(t,n,r){return e.channel(`neste-kamp-${n}`).on(`postgres_changes`,{event:`INSERT`,schema:`public`,table:`kamp`,filter:`stevneid=eq.${t}`},e=>{r(e.new)}).subscribe()}function O(t,n,r,i){return e.channel(n).on(`postgres_changes`,{event:`*`,schema:`public`,table:`kamp_omgang`},e=>{let t=e.new?.kamp_spelar_id??e.old?.kamp_spelar_id;(t==null||!i||i(t))&&r()}).on(`postgres_changes`,{event:`*`,schema:`public`,table:`kamp`},e=>{(e.new?.stevneid??e.old?.stevneid)===t&&r()}).subscribe()}function k(t,n,r,i,a){let o=null;return e.channel(`scoreboard-kamp-${t}`).on(`postgres_changes`,{event:`*`,schema:`public`,table:`kamp_omgang`},e=>{let t=e.new,i=e.old,a=t.kamp_spelar_id??i.kamp_spelar_id;(!a||n.includes(a))&&(o&&clearTimeout(o),o=setTimeout(()=>{o=null,r()},50))}).on(`postgres_changes`,{event:`UPDATE`,schema:`public`,table:`kamp`,filter:`id=eq.${t}`},async e=>{e.new?.er_bekreftet&&await i()}).subscribe(e=>{e===`SUBSCRIBED`&&a?.()})}export{p as _,s as a,i as c,l as d,f,k as g,D as h,a as i,u as l,O as m,o as n,c as o,T as p,x as r,S as s,y as t,d as u};