import 'bootstrap'
import { render as renderHome }          from './pages/home'
import { render as renderTerminliste }    from './pages/terminliste'
import { render as renderNorgescupen }    from './pages/norgescupen'
import { render as renderNorgesranking }  from './pages/norgesranking'
import { render as renderKastere }        from './pages/kastere'
import { render as renderKlubber }        from './pages/klubber'
import { render as renderRekorder }       from './pages/rekorder'
import { render as renderNMVinnere }      from './pages/nmvinnere'
import { render as renderLogginn }        from './pages/logginn'
import { render as renderMinSide }        from './pages/minside'
import { render as renderAdmin }          from './admin/admin'
import { render as renderStevneAdmin }    from './admin/stevneadmin'
import { render as renderKasterAdmin }    from './admin/kasteradmin'
import { render as renderKlubbAdminSide } from './admin/klubbadmin'
import { render as renderPamelding }      from './pages/pamelding'
import { render as renderKamp }           from './pages/kamp'
import { render as renderStevne }         from './pages/stevne'
import { getUser, erAdmin, erKlubbadmin, loggUt } from './utils/auth'
import { feilHtml } from './utils/pageStates'

if (import.meta.env.VITE_ENV === 'dev') {
  const versjonEl = document.querySelector('.header-versjon')
  if (versjonEl) {
    versjonEl.textContent += ' [DEV]'
    const banner = document.createElement('span')
    banner.className = 'dev-banner'
    banner.textContent = 'TEST TEST TEST'
    versjonEl.after(banner)
  }
}

type Params = Record<string, string | number | undefined>
type RenderFn = (container: HTMLElement, params: Params) => void | Promise<void>
type MinRolle = 'bruker' | 'admin' | 'klubbadmin'

interface Rute {
  mønster: RegExp
  side: RenderFn
  params: (m: RegExpMatchArray) => Params
}

const container = document.getElementById('app')!

function authGuard(minRolle: MinRolle, renderFn: RenderFn): RenderFn {
  return async (cont, params) => {
    const auth = await getUser()
    if (!auth) {
      location.hash = '#/logginn'
      return
    }
    if (minRolle === 'admin' && !(await erAdmin())) {
      cont.innerHTML = feilHtml('Ingen tilgang.')
      return
    }
    if (minRolle === 'klubbadmin' && !(await erAdmin()) && !(await erKlubbadmin())) {
      cont.innerHTML = feilHtml('Ingen tilgang.')
      return
    }
    await renderFn(cont, params)
  }
}

const ruter: Rute[] = [
  // Auth-ruter (spesifikke før generiske)
  { mønster: /^\/logginn$/,                    side: renderLogginn,                                            params: () => ({}) },
  { mønster: /^\/minside$/,                    side: authGuard('bruker', renderMinSide),                       params: () => ({}) },
  { mønster: /^\/admin$/,                      side: authGuard('admin', renderAdmin),                          params: () => ({}) },
  { mønster: /^\/stevne\/ny$/,                 side: authGuard('klubbadmin', renderStevneAdmin as RenderFn),   params: () => ({}) },
  { mønster: /^\/stevne\/(\d+)\/admin$/,       side: authGuard('klubbadmin', renderStevneAdmin as RenderFn),   params: m => ({ id: m[1] }) },
  { mønster: /^\/kamp\/(\d+)$/,               side: renderKamp as RenderFn,                                   params: m => ({ id: Number(m[1]) }) },
  { mønster: /^\/stevne\/(\d+)\/pamelding$/,  side: renderPamelding as RenderFn,                              params: m => ({ id: m[1] }) },
  { mønster: /^\/stevne\/(\d+)(?:\/([^/]*))?$/, side: renderStevne as RenderFn,                              params: m => ({ id: Number(m[1]), tab: m[2] ?? 'info' }) },
  { mønster: /^\/kaster\/ny$/,                 side: authGuard('klubbadmin', renderKasterAdmin as RenderFn),   params: () => ({}) },
  { mønster: /^\/kaster\/(\d+)\/admin$/,       side: authGuard('klubbadmin', renderKasterAdmin as RenderFn),   params: m => ({ id: m[1] }) },
  { mønster: /^\/klubber\/(\d+)\/admin$/,      side: authGuard('klubbadmin', renderKlubbAdminSide),            params: m => ({ id: m[1] }) },
  // Eksisterande ruter
  { mønster: /^\/terminliste$/,                side: renderTerminliste,                                        params: () => ({}) },
  { mønster: /^\/norgescupen$/,                side: renderNorgescupen,                                        params: () => ({}) },
  { mønster: /^\/norgesranking$/,              side: renderNorgesranking,                                      params: () => ({}) },
  { mønster: /^\/rekorder$/,                   side: renderRekorder,                                           params: () => ({}) },
  { mønster: /^\/nmvinnere$/,                  side: renderNMVinnere,                                          params: () => ({}) },
  { mønster: /^\/kastere\/(\d+)(-[^/]*)?$/,   side: renderKastere as RenderFn,                                params: m => ({ id: m[1] }) },
  { mønster: /^\/kastere$/,                    side: renderKastere as RenderFn,                                params: () => ({}) },
  { mønster: /^\/klubber\/(\d+)(-[^/]*)?$/,   side: renderKlubber as RenderFn,                                params: m => ({ id: m[1] }) },
  { mønster: /^\/klubber$/,                    side: renderKlubber as RenderFn,                                params: () => ({}) },
  { mønster: /^\/?$/,                          side: renderHome,                                               params: () => ({}) },
]

function naviger(): void {
  const hash = location.hash.replace(/^#/, '') || '/'

  for (const rute of ruter) {
    const treff = hash.match(rute.mønster)
    if (treff) {
      rute.side(container, rute.params(treff))
      return
    }
  }

  container.innerHTML = feilHtml('Side ikkje funne.')
}

async function oppdaterAuthMeny(): Promise<void> {
  const auth = await getUser()
  const logginnItem = document.getElementById('meny-logginn-item')!
  const minsideItem = document.getElementById('meny-minside-item')!
  const adminItem   = document.getElementById('meny-admin-item')!
  const loggutItem  = document.getElementById('meny-loggut-item')!

  if (auth) {
    logginnItem.classList.add('d-none')
    const erAdminBrukar = auth.profil?.rolle === 'admin'
    minsideItem.classList.toggle('d-none', erAdminBrukar)
    adminItem.classList.toggle('d-none', !erAdminBrukar)
    loggutItem.classList.remove('d-none')
  } else {
    logginnItem.classList.remove('d-none')
    minsideItem.classList.add('d-none')
    adminItem.classList.add('d-none')
    loggutItem.classList.add('d-none')
  }
}

window.addEventListener('hashchange', naviger)

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('menyLoggUtKnapp')!.addEventListener('click', async () => {
    await loggUt()
    location.hash = '#/'
  })

  oppdaterAuthMeny()
  naviger()
})

document.addEventListener('authStateChanged', () => {
  oppdaterAuthMeny()
})
