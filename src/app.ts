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
import { getUser, erAdmin, erKlubbadmin, loggUt } from './services/authService'
import { createErrorBanner } from './components/ErrorBanner'
import { showToast } from './components/Toast'

if (import.meta.env.VITE_ENV === 'dev') {
  const versjonEl = document.querySelector('.header-versjon')
  if (versjonEl) versjonEl.textContent += ' [DEV]'
}

type Params = Record<string, string | number | undefined>
type RenderFn = (container: HTMLElement, params: Params) => void | Promise<void>
type MinRolle = 'bruker' | 'admin' | 'klubbadmin'

interface Rute {
  pattern: RegExp
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
      cont.replaceChildren(createErrorBanner('Ingen tilgang.'))
      return
    }
    if (minRolle === 'klubbadmin' && !(await erAdmin()) && !(await erKlubbadmin())) {
      cont.replaceChildren(createErrorBanner('Ingen tilgang.'))
      return
    }
    await renderFn(cont, params)
  }
}

const ruter: Rute[] = [
  // Auth-ruter (spesifikke før generiske)
  { pattern: /^\/logginn$/,                    side: renderLogginn,                                            params: () => ({}) },
  { pattern: /^\/minside$/,                    side: authGuard('bruker', renderMinSide),                       params: () => ({}) },
  { pattern: /^\/admin$/,                      side: authGuard('admin', renderAdmin),                          params: () => ({}) },
  { pattern: /^\/stevne\/ny$/,                 side: authGuard('klubbadmin', renderStevneAdmin as RenderFn),   params: () => ({}) },
  { pattern: /^\/stevne\/(\d+)\/admin$/,       side: authGuard('klubbadmin', renderStevneAdmin as RenderFn),   params: m => ({ id: m[1] }) },
  { pattern: /^\/kamp\/(\d+)$/,               side: renderKamp as RenderFn,                                   params: m => ({ id: Number(m[1]) }) },
  { pattern: /^\/stevne\/(\d+)\/pamelding$/,  side: renderPamelding as RenderFn,                              params: m => ({ id: m[1] }) },
  { pattern: /^\/stevne\/(\d+)(?:\/([^/]*))?$/, side: renderStevne as RenderFn,                              params: m => ({ id: Number(m[1]), tab: m[2] ?? 'info' }) },
  { pattern: /^\/kaster\/ny$/,                 side: authGuard('klubbadmin', renderKasterAdmin as RenderFn),   params: () => ({}) },
  { pattern: /^\/kaster\/(\d+)\/admin$/,       side: authGuard('klubbadmin', renderKasterAdmin as RenderFn),   params: m => ({ id: m[1] }) },
  { pattern: /^\/klubber\/(\d+)\/admin$/,      side: authGuard('klubbadmin', renderKlubbAdminSide),            params: m => ({ id: m[1] }) },
  // Eksisterande ruter
  { pattern: /^\/terminliste$/,                side: renderTerminliste,                                        params: () => ({}) },
  { pattern: /^\/norgescupen$/,                side: renderNorgescupen,                                        params: () => ({}) },
  { pattern: /^\/norgesranking$/,              side: renderNorgesranking,                                      params: () => ({}) },
  { pattern: /^\/rekorder$/,                   side: renderRekorder,                                           params: () => ({}) },
  { pattern: /^\/nmvinnere$/,                  side: renderNMVinnere,                                          params: () => ({}) },
  { pattern: /^\/kastere\/(\d+)(-[^/]*)?$/,   side: renderKastere as RenderFn,                                params: m => ({ id: m[1] }) },
  { pattern: /^\/kastere$/,                    side: renderKastere as RenderFn,                                params: () => ({}) },
  { pattern: /^\/klubber\/(\d+)(-[^/]*)?$/,   side: renderKlubber as RenderFn,                                params: m => ({ id: m[1] }) },
  { pattern: /^\/klubber$/,                    side: renderKlubber as RenderFn,                                params: () => ({}) },
  { pattern: /^\/?$/,                          side: renderHome,                                               params: () => ({}) },
]

function naviger(): void {
  const hash = location.hash.replace(/^#/, '') || '/'

  for (const rute of ruter) {
    const treff = hash.match(rute.pattern)
    if (treff) {
      rute.side(container, rute.params(treff))
      return
    }
  }

  container.replaceChildren(createErrorBanner('Side ikkje funne.'))
}

async function oppdaterAuthMeny(): Promise<void> {
  const auth = await getUser()
  const logginnItem = document.getElementById('meny-logginn-item')!
  const minsideItem = document.getElementById('meny-minside-item')!
  const adminItem   = document.getElementById('meny-admin-item')!
  const loggutItem  = document.getElementById('meny-loggut-item')!
  const headerEmail = document.getElementById('headerEmail')!

  if (auth) {
    logginnItem.classList.add('d-none')
    const erAdminBrukar = auth.profil?.rolle === 'admin'
    minsideItem.classList.toggle('d-none', erAdminBrukar)
    adminItem.classList.toggle('d-none', !erAdminBrukar)
    loggutItem.classList.remove('d-none')
    headerEmail.textContent = auth.user.email ?? ''
    ;(headerEmail as HTMLAnchorElement).href = erAdminBrukar ? '#/admin' : '#/minside'
    headerEmail.classList.remove('d-none')
  } else {
    logginnItem.classList.remove('d-none')
    minsideItem.classList.add('d-none')
    adminItem.classList.add('d-none')
    loggutItem.classList.add('d-none')
    headerEmail.textContent = ''
    headerEmail.classList.add('d-none')
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

document.addEventListener('authStateChanged', (e) => {
  const { event, intentional } = (e as CustomEvent<{ event: string; intentional: boolean }>).detail
  oppdaterAuthMeny()
  if (event === 'SIGNED_OUT' && !intentional) {
    showToast('Sesjonen din er utløpt. Logg inn igjen for å halde fram.', 'warning', true)
  }
})
