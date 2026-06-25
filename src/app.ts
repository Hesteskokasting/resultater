import 'bootstrap'
import { render as renderHome } from './pages/home'
import { getUser, erAdmin, erKlubbadmin, loggUt } from './services/authService'
import { createErrorBanner } from './components/ErrorBanner'
import { showToast } from './components/Toast'
import type { PageRenderFn, Rute } from '@/types'

if (import.meta.env.VITE_ENV === 'dev') {
  const versjonEl = document.querySelector('.header-versjon')
  if (versjonEl) versjonEl.textContent += ' [DEV]'
}

type MinRolle = 'bruker' | 'admin' | 'klubbadmin'

function lazy(load: () => Promise<{ render: PageRenderFn }>): PageRenderFn {
  return async (c, p) => {
    const { render } = await load()
    return render(c, p)
  }
}

const container = document.getElementById('app')!

function authGuard(minRolle: MinRolle, renderFn: PageRenderFn): PageRenderFn {
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
  { pattern: /^\/logginn$/,                      side: lazy(() => import('./pages/logginn')),                         params: () => ({}) },
  { pattern: /^\/minside$/,                      side: authGuard('bruker', lazy(() => import('./pages/minside'))),    params: () => ({}) },
  { pattern: /^\/admin$/,                        side: authGuard('admin',  lazy(() => import('./admin/admin'))),      params: () => ({}) },
  { pattern: /^\/stevne\/ny$/,                   side: authGuard('klubbadmin', lazy(() => import('./admin/stevneadmin'))), params: () => ({}) },
  { pattern: /^\/stevne\/(\d+)\/rediger$/,        side: authGuard('klubbadmin', lazy(() => import('./admin/stevneadmin'))), params: m => ({ id: Number(m[1]) }) },
  { pattern: /^\/kamp\/(\d+)$/,                 side: lazy(() => import('./pages/kamp')),                            params: m => ({ id: Number(m[1]) }) },
  { pattern: /^\/stevne\/(\d+)\/pamelding$/,    side: lazy(() => import('./pages/pamelding')),                       params: m => ({ id: m[1] }) },
  { pattern: /^\/stevne\/(\d+)(?:\/([^/]*))?$/, side: lazy(() => import('./pages/stevne')),                         params: m => ({ id: Number(m[1]), tab: m[2] ?? 'info' }) },
  { pattern: /^\/kaster\/ny$/,                   side: authGuard('klubbadmin', lazy(() => import('./admin/kasteradmin'))), params: () => ({}) },
  { pattern: /^\/kaster\/(\d+)\/admin$/,         side: authGuard('klubbadmin', lazy(() => import('./admin/kasteradmin'))), params: m => ({ id: m[1] }) },
  { pattern: /^\/klubber\/(\d+)\/admin$/,        side: authGuard('klubbadmin', lazy(() => import('./admin/klubbadmin'))), params: m => ({ id: m[1] }) },
  // Eksisterande ruter
  { pattern: /^\/terminliste$/,                  side: lazy(() => import('./pages/terminliste')),                    params: () => ({}) },
  { pattern: /^\/norgescupen$/,                  side: lazy(() => import('./pages/norgescupen')),                    params: () => ({}) },
  { pattern: /^\/norgesranking$/,                side: lazy(() => import('./pages/norgesranking')),                  params: () => ({}) },
  { pattern: /^\/rekorder$/,                     side: lazy(() => import('./pages/rekorder')),                       params: () => ({}) },
  { pattern: /^\/nmvinnere$/,                    side: lazy(() => import('./pages/nmvinnere')),                      params: () => ({}) },
  { pattern: /^\/kastere\/(\d+)(-[^/]*)?$/,     side: lazy(() => import('./pages/kastere')),                        params: m => ({ id: m[1] }) },
  { pattern: /^\/kastere$/,                      side: lazy(() => import('./pages/kastere')),                        params: () => ({}) },
  { pattern: /^\/klubber\/(\d+)(-[^/]*)?$/,     side: lazy(() => import('./pages/klubber')),                        params: m => ({ id: m[1] }) },
  { pattern: /^\/klubber$/,                      side: lazy(() => import('./pages/klubber')),                        params: () => ({}) },
  { pattern: /^\/?$/,                            side: renderHome,                                                   params: () => ({}) },
]

function naviger(): void {
  const [hash = '/'] = (location.hash.replace(/^#/, '') || '/').split('?')

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
  if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
    oppdaterAuthMeny()
  }
  if (event === 'SIGNED_OUT' && !intentional) {
    showToast('Sesjonen din er utløpt. Logg inn igjen for å halde fram.', 'warning', true)
  }
})

