import{n as e,t}from"./logError-ByTg738k.js";import{S as n,dr as r,f as i,lr as a,ur as o}from"./index-ivhVxv2k.js";import{t as s}from"./SearchSelect-DtGJzhkh.js";import{t as c}from"./navigation-DSwGXsno.js";var l={tournamentId:0,playerId:null};async function u(){let{data:t,error:n}=await e.from(`stevne`).select(`id, navn, dato, kamp!inner(id, kamp_spelar!inner(id, kamp_omgang!inner(id)))`).limit(1,{referencedTable:`kamp`}).limit(1,{referencedTable:`kamp.kamp_spelar`}).limit(1,{referencedTable:`kamp.kamp_spelar.kamp_omgang`}).order(`dato`,{ascending:!1});if(n)throw n;return(t??[]).map(({id:e,navn:t,dato:n})=>({id:e,navn:t,dato:n}))}async function d(t){let{data:r,error:i}=await e.from(`kamp`).select(`
      id,
      fase,
      runde_nummer,
      runde_navn,
      gruppe_navn,
      bane_nummer,
      er_bekreftet,
      er_walkover,
      spelarar:kamp_spelar(
        kasterid,
        score_poeng,
        antall_ringer,
        kamp_plassering,
        kaster:kasterid(fornavn, etternavn),
        omgangar:kamp_omgang(omgang, score, antall_ringer)
      )
    `).eq(`stevneid`,t).order(`runde_nummer`).order(`id`);if(i)throw i;let a=e=>e===`innledende`?0:1;return(r??[]).map(e=>({...e,spelarar:e.spelarar.map(e=>({kasterid:e.kasterid,navn:e.kaster?n(e.kaster):`#${e.kasterid}`,score_poeng:e.score_poeng,antall_ringer:e.antall_ringer,kamp_plassering:e.kamp_plassering,omgangar:[...e.omgangar].sort((e,t)=>e.omgang-t.omgang)}))})).filter(e=>e.spelarar.some(e=>e.omgangar.length>0)).sort((e,t)=>a(e.fase)-a(t.fase)||e.runde_nummer-t.runde_nummer||e.id-t.id)}function f(e){let t=[e.runde_navn??`${e.fase} runde ${e.runde_nummer}`,e.gruppe_navn,e.bane_nummer==null?null:`bane ${e.bane_nummer}`,e.er_walkover?`walkover`:null,e.er_bekreftet?null:`ikkje bekrefta`].filter(Boolean);return`Kamp ${e.id} — ${t.join(` · `)}`}function p(e){let t=Math.max(0,...e.spelarar.map(e=>e.omgangar.length)),n=Array.from({length:t},(e,t)=>`<th>${t+1}</th>`).join(``),r=e.spelarar.map(e=>{let n=0,r=Array.from({length:t},(t,r)=>{let i=e.omgangar[r];return i?(n+=i.score,`<td>${i.score}<div class="small text-muted">${n}</div></td>`):`<td class="text-muted">–</td>`}).join(``),a=e.omgangar.length*2,o=a>0?`${(e.antall_ringer/a*100).toFixed(1)}%`:`–`;return`<tr>
        <td>${i(e.navn)}</td>${r}
        <td class="fw-semibold">${e.score_poeng}</td>
        <td>${e.antall_ringer}</td>
        <td>${o}</td>
        <td>${e.kamp_plassering??`–`}</td>
      </tr>`}).join(``);return`
    <div class="card mb-3">
      <div class="card-header py-1 small">${i(f(e))}</div>
      <div class="table-responsive">
        <table class="table table-sm table-bordered mb-0 align-middle text-center">
          <thead><tr><th class="text-start">Spelar</th>${n}<th>Sum</th><th>Ring</th><th>Ring%</th><th>Pl.</th></tr></thead>
          <tbody>${r}</tbody>
        </table>
      </div>
    </div>`}function m(e,t){return t==null?e:e.filter(e=>e.spelarar.some(e=>e.kasterid===t))}function h(e){let t=new Map;for(let n of e)for(let e of n.spelarar)t.set(e.kasterid,e.navn);return[...t].map(([e,t])=>({id:e,label:t})).sort((e,t)=>e.label.localeCompare(t.label,`nb`))}async function g(e){e.replaceChildren(r(`Laster stevne…`));let n;try{n=await u()}catch(n){t(`kampstatistikk.fetchTournaments`,n),e.replaceChildren(o(`Kunne ikkje laste stevne.`));return}if(!n.length){e.replaceChildren(a(`Ingen stevne funne.`));return}let f=Number(c(`stevneid`));l.tournamentId=n.some(e=>e.id===f)?f:n[0].id,l.playerId=Number(c(`kasterid`))||null,e.innerHTML=`
    <div class="content-page">
      <h1 class="h4 mb-3">Kampstatistikk (test)</h1>
      <div class="d-flex flex-wrap gap-2 mb-3">
        <select id="ks-stevne" class="form-select form-select-sm w-auto">
          ${n.map(e=>`<option value="${e.id}"${e.id===l.tournamentId?` selected`:``}>${i(e.dato)} — ${i(e.navn)}</option>`).join(``)}
        </select>
        <div id="ks-spelar" class="w-auto"></div>
      </div>
      <p id="ks-count" class="small text-muted"></p>
      <div id="ks-list"></div>
    </div>`;let g=e.querySelector(`#ks-list`),_=e.querySelector(`#ks-count`),v=[];function y(){let e=m(v,l.playerId);_.textContent=`${e.length} av ${v.length} kampar`,g.innerHTML=e.length?e.map(e=>p(e)).join(``):`<p class="text-muted">Ingen kampar.</p>`}let b=e.querySelector(`#ks-spelar`);function x(){let e=l.playerId==null?``:`&kasterid=${l.playerId}`;history.replaceState(history.state,``,`#/kampstatistikk?stevneid=${l.tournamentId}${e}`)}function S(){let e=document.createElement(`span`);b.replaceChildren(e),s({slot:e,items:h(v),value:l.playerId,placeholder:`Vel spelar…`,clearLabel:`Alle spelarar`,onSelect:e=>{l.playerId=e,x(),y()}})}async function C(){g.replaceChildren(r(`Laster kampar…`)),_.textContent=``;try{v=await d(l.tournamentId),h(v).some(e=>e.id===l.playerId)||(l.playerId=null),S(),x(),y()}catch(e){t(`kampstatistikk.fetchMatches`,e),g.replaceChildren(o(`Kunne ikkje laste kampar.`))}}e.querySelector(`#ks-stevne`).addEventListener(`change`,e=>{l.tournamentId=Number(e.target.value),C()}),await C()}export{g as render};