import{n as e,t}from"./logError-CTQ3euge.js";import{t as n}from"./verifiedWrite-DY57lQG_.js";import{Bn as r}from"./index-BvHOwV9o.js";e.from(`kamp_spelar`).select(`
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
    stevne:stevneid(navn),
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
    `).eq(`stevneid`,n).eq(`fase`,`innledende`).order(`runde_nummer`).order(`bane_nummer`);return i&&t(`getInitialRoundMatches`,i),{data:r??[],error:i}}async function o(n){if(!n.length)return{error:null};let{error:r}=await e.from(`kamp_omgang`).delete().in(`kamp_spelar_id`,n);return r&&t(`deleteMatchRounds`,r),{error:r}}async function s(t,n,r){let i=r===void 0?{score_poeng:n}:{score_poeng:n,kamp_poeng:r};return O(`updateMatchPlayerScoreFast`,e.from(`kamp_spelar`).update(i).eq(`id`,t))}async function c(n){let{data:r,error:i}=await e.from(`kamp`).select(`
      id, stevneid, fase, runde_nummer, runde_navn, bane_nummer,
      er_bekreftet, er_walkover, er_tre_spelarar,
      stevne:stevneid(navn),
      spelarar:kamp_spelar(
        id, kasterid, score_poeng, kamp_poeng, antall_ringer,
        kaster:kasterid(id, fornavn, etternavn)
      )
    `).eq(`id`,n).maybeSingle();return i&&t(`getMatch`,i),{data:r,error:i}}async function l(n,r){if(!r.length)return{startNumberMap:{},positionMap:{},hcpMap:new Map};let{data:i,error:a}=await e.from(`resultat`).select(`kasterid, startnummer, posisjon, hcp`).eq(`stevneid`,n).in(`kasterid`,r);a&&t(`getMatchResultInfo`,a);let o={},s={},c=new Map;for(let e of i??[])e.kasterid!=null&&(e.startnummer!=null&&(o[e.kasterid]=e.startnummer),e.posisjon!=null&&(s[e.kasterid]=e.posisjon),c.set(e.kasterid,e.hcp??0));return{startNumberMap:o,positionMap:s,hcpMap:c}}async function u(n){if(!n.length)return{};let{data:r,error:i}=await e.from(`resultat`).select(`stevneid, kasterid, startnummer`).in(`stevneid`,n);i&&t(`getStartNumbersForTournaments`,i);let a={};for(let e of r??[])e.kasterid!=null&&e.startnummer!=null&&(a[`${e.stevneid}:${e.kasterid}`]=e.startnummer);return a}async function d(n,r){let{data:i,error:a}=await e.from(`kamp`).select(`id`).eq(`stevneid`,n).eq(`bane_nummer`,r).eq(`er_bekreftet`,!1).eq(`er_walkover`,!1).order(`runde_nummer`).limit(1).maybeSingle();return a&&t(`getNextMatchForOrganizer`,a),{data:i,error:a}}async function f(n,r){let{data:i,error:a}=await e.from(`kamp_spelar`).select(`kampid`).eq(`kasterid`,r);if(a)return t(`getNextMatchForParticipant:minekampar`,a),{data:null,error:a};let o=(i??[]).map(e=>e.kampid).filter(e=>e!=null);if(!o.length)return{data:null,error:null};let{data:s,error:c}=await e.from(`kamp`).select(`id`).in(`id`,o).eq(`stevneid`,n).eq(`er_bekreftet`,!1).eq(`er_walkover`,!1).order(`runde_nummer`).limit(1).maybeSingle();return c&&t(`getNextMatchForParticipant`,c),{data:s,error:c}}async function p(t,n){let{data:r}=await e.from(`kamp_spelar`).select(`id`).eq(`kampid`,t).eq(`kasterid`,n).maybeSingle();return!!r}function m(e,t){if(!e)return null;let{baseScore:n}=t??{};return{playerIds:e.members.map(e=>e.id),kasterid:e.rep.kasterid,...n==null?{}:{baseScore:n}}}function h(e){let{roundData:t,sides:n,hcp:i=[],erWalkover:a=!1}=e,o=new Map;for(let e of n)for(let t of e?.playerIds??[])o.set(t,{score_poeng:0,kamp_poeng:0,antall_ringer:0});let s=n.map(()=>0),c=e=>n[e]?.playerIds[0];if(a){s[0]=21;let e=c(0);e!=null&&(o.get(e).score_poeng=21)}else if(t.length){for(let e of t){let t=e.kamp_spelar_id;if(t==null)continue;let r=o.get(t);if(!r)continue;r.score_poeng+=e.score??0,r.antall_ringer+=e.antall_ringer??0;let i=n.findIndex(e=>e?.playerIds.includes(t));i!==-1&&(s[i]=(s[i]??0)+(e.score??0))}n.forEach((e,t)=>{let n=i[t]??0;if(!n)return;s[t]=(s[t]??0)+n;let r=c(t);r!=null&&(o.get(r).score_poeng+=n)})}else n.forEach((e,t)=>{if(!e)return;s[t]=e.baseScore??0;let n=c(t);n!=null&&(o.get(n).score_poeng=e.baseScore??0)});if(n.filter(Boolean).length<=2){let[e,t]=r(s[0]??0,s[1]??0);for(let t of n[0]?.playerIds??[])o.get(t).kamp_poeng=e;for(let e of n[1]?.playerIds??[])o.get(e).kamp_poeng=t}return{updates:o,totals:s}}function g(e,t){let n=e.map((e,n)=>({side:e,total:t[n]??0})).filter(e=>e.side!=null);return n.length<2?null:n.reduce((e,t)=>t.total<=e.total?t:e).side.kasterid??null}var _=`Kampen er allereie stadfesta av ein annan deltakar.`;async function v(n){let{sides:r,hcp:i,erWalkover:a}=n,o=r.flatMap(e=>e?.playerIds??[]),s={updates:new Map,totals:r.map(()=>0)};if(!o.length)return{error:null,...s};let c=[],l=r,u=r.every(e=>!e||e.baseScore!=null);if(!a&&!u){let{data:n,error:i}=await e.from(`kamp_omgang`).select(`kamp_spelar_id, score, antall_ringer`).in(`kamp_spelar_id`,o);if(i)return t(`confirmMatch:omgangar`,i),{error:i,...s};if(c=n??[],!c.length){let{data:t}=await e.from(`kamp_spelar`).select(`id, score_poeng`).in(`id`,o),n=new Map((t??[]).map(e=>[e.id,e.score_poeng??0]));l=r.map(e=>{if(!e||e.baseScore!=null)return e;let t=e.playerIds.filter(e=>n.has(e));return t.length?{...e,baseScore:t.reduce((e,t)=>e+n.get(t),0)}:e})}}let{updates:d,totals:f}=h({roundData:c,sides:l,hcp:i,erWalkover:a});return{error:null,updates:d,totals:f}}async function y(r){let i=(await Promise.all([...r.entries()].map(([t,r])=>n(e.from(`kamp_spelar`).update(r).eq(`id`,t).select(`id`),_)))).find(e=>e.error)?.error??null;return i&&t(`confirmMatch:spelarar`,i),{error:i}}async function b(n){let{kampId:r,sides:i,hcp:a,erWalkover:o=!1,outcome:s}=n,{error:c,updates:l,totals:u}=await v({sides:i,hcp:a,erWalkover:o});if(c)return{error:c};if(s.type===`innledende`){let{data:n,error:i}=await e.rpc(`bekreft_innledende_kamp`,{p_kamp_id:r,p_scores:[...l.entries()].map(([e,t])=>({kamp_spelar_id:e,...t}))});return i&&t(`confirmMatch:innledende`,i),!i&&n===!1?{error:Error(_)}:{error:i}}let{error:d}=await y(l);if(d)return{error:d};if(s.type===`cup-derived`){let n=s.orderedKasterids?.length===3?s.orderedKasterids[2]??null:g(i,u),{error:a}=await e.rpc(`bekreft_avsluttende_kamp_deltakar`,{p_kamp_id:r,p_eliminert_kasterid:n??void 0});return a&&t(`confirmMatch:cup-derived`,a),{error:a}}return C(r,s)}e.from(`kamp`).select(`
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
    `).eq(`stevneid`,n).order(`runde_nummer`).order(`bane_nummer`);return i&&t(`getFinalRoundMatches`,i),{data:r??[],error:i}}async function S(n,r){if(!r.length)return{error:null};let i=(await Promise.all(r.map(t=>e.from(`kamp_spelar`).update({kamp_plassering:t.plassering}).eq(`kampid`,n).eq(`kasterid`,t.kasterid)))).find(e=>e.error)?.error??null;return i&&t(`setMatchPlayerPlacements`,i),{error:i}}async function C(n,r){let{stevneId:i,roundNumber:a,roundName:o,allThrowerIds:s,eliminatedIds:c,advancingSides:l}=r,{error:u}=await e.from(`kamp`).update({er_bekreftet:!0}).eq(`id`,n);if(u)return t(`confirmMatch:cup-ranked:kamp`,u),{error:u};let{error:d}=await S(n,[...l.flatMap((e,t)=>e.map(e=>({kasterid:e,plassering:t+1}))),...c.map(e=>({kasterid:e,plassering:l.length+1}))]);if(d)return{error:d};if(o===`Semifinale`||!c.length)return{error:null};if(o!==`Finale`&&o!==`Bronsefinale`){let{error:e}=await w(i,a,s,c,`confirmMatch:cup-ranked`);if(e)return{error:e}}let f=l[0]??[];if(o===`Finale`&&f.length){let{error:n}=await e.from(`resultat`).update({plassering:1}).eq(`stevneid`,i).in(`kasterid`,f);if(n)return t(`confirmMatch:cup-ranked:plassering-vinnar`,n),{error:n};let{error:r}=await e.from(`resultat`).update({plassering:2}).eq(`stevneid`,i).in(`kasterid`,c);if(r)return t(`confirmMatch:cup-ranked:plassering-tapar`,r),{error:r}}else if(o===`Bronsefinale`&&f.length){let{error:n}=await e.from(`resultat`).update({plassering:3}).eq(`stevneid`,i).in(`kasterid`,f);if(n)return t(`confirmMatch:cup-ranked:plassering-vinnar`,n),{error:n};let{error:r}=await e.from(`resultat`).update({plassering:4}).eq(`stevneid`,i).in(`kasterid`,c);if(r)return t(`confirmMatch:cup-ranked:plassering-tapar`,r),{error:r}}return{error:null}}async function w(n,r,i,a,o){let{error:s}=await e.from(`resultat`).update({runde_eliminert:null}).eq(`stevneid`,n).eq(`runde_eliminert`,r).in(`kasterid`,i);if(s)return t(`${o}:reset`,s),{error:s};if(a.length){let{error:i}=await e.from(`resultat`).update({runde_eliminert:r}).eq(`stevneid`,n).in(`kasterid`,a);if(i)return t(`${o}:eliminert`,i),{error:i}}return{error:null}}async function T(n){let{stevneId:r,roundNumber:i,roundName:a,allThrowerIds:o,newWinnerIds:s,newLoserIds:c}=n,l=a===`Semifinale`,u=a===`Finale`,d=a===`Bronsefinale`;if(l)return{error:null};if(u||d){let n=u?1:3,i=u?2:4;if(s.length){let{error:i}=await e.from(`resultat`).update({plassering:n}).eq(`stevneid`,r).in(`kasterid`,s);if(i)return t(`updateWinnerLoser:plassering-vinnar`,i),{error:i}}if(c.length){let{error:n}=await e.from(`resultat`).update({plassering:i}).eq(`stevneid`,r).in(`kasterid`,c);if(n)return t(`updateWinnerLoser:plassering-tapar`,n),{error:n}}}else{let{error:e}=await w(r,i,o,c,`updateWinnerLoser`);if(e)return{error:e}}return{error:null}}e.from(`kamp_omgang`).select(`id, kamp_spelar_id, omgang, score, antall_ringer`);async function E(n){if(!n.length)return{data:[],error:null};let{data:r,error:i}=await e.from(`kamp_omgang`).select(`id, kamp_spelar_id, omgang, score, antall_ringer`).in(`kamp_spelar_id`,n).order(`omgang`);return i&&t(`getMatchRounds`,i),{data:r??[],error:i}}var D=1e4;async function O(e,n){try{let r=new Promise((e,t)=>setTimeout(()=>t(Error(`Request timed out`)),D)),{error:i}=await Promise.race([n,r]);return i&&t(e,i),{error:i}}catch(n){return t(e,n),{error:n}}}async function k(t){return t.length?O(`saveMatchRound`,e.from(`kamp_omgang`).insert(t)):{error:null}}async function A(n){if(!n.length)return{error:null};try{let r=(await Promise.all(n.map(t=>e.from(`kamp_omgang`).update({score:t.score,antall_ringer:t.antall_ringer}).eq(`kamp_spelar_id`,t.kamp_spelar_id).eq(`omgang`,t.omgang)))).find(e=>e.error)?.error??null;return r&&t(`updateMatchRound`,r),{error:r}}catch(e){return t(`updateMatchRound`,e),{error:e}}}function j(t,n,r){return e.channel(`neste-kamp-${n}`).on(`postgres_changes`,{event:`INSERT`,schema:`public`,table:`kamp`,filter:`stevneid=eq.${t}`},e=>{r(e.new)}).subscribe()}function M(t,n,r,i){return e.channel(n).on(`postgres_changes`,{event:`*`,schema:`public`,table:`kamp_omgang`},e=>{let t=e.new?.kamp_spelar_id??e.old?.kamp_spelar_id;t!=null&&i&&!i(t)||r()}).on(`postgres_changes`,{event:`*`,schema:`public`,table:`kamp`},e=>{(e.new?.stevneid??e.old?.stevneid)===t&&r()}).subscribe()}function N(t,n,r,i,a){let o=null;return e.channel(`scoreboard-kamp-${t}`).on(`postgres_changes`,{event:`*`,schema:`public`,table:`kamp_omgang`},e=>{let t=e.new,i=e.old,a=t.kamp_spelar_id??i.kamp_spelar_id;(!a||n.includes(a))&&(o&&clearTimeout(o),o=setTimeout(()=>{o=null,r()},50))}).on(`postgres_changes`,{event:`UPDATE`,schema:`public`,table:`kamp`,filter:`id=eq.${t}`},async e=>{e.new?.er_bekreftet&&await i()}).subscribe(e=>{e===`SUBSCRIBED`&&a?.()})}export{N as _,c as a,A as b,i as c,u as d,p as f,j as g,M as h,a as i,d as l,S as m,o as n,l as o,k as p,x as r,E as s,b as t,f as u,m as v,T as x,s as y};