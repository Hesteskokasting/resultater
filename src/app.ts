import 'bootstrap'
import { App } from '@capacitor/app'
import { render as renderHome } from './pages/home'
import { getUser, isAdmin, isClubAdmin, signOut } from './services/authService'
import { createErrorBanner } from './components/ErrorBanner'
import { showReauthModal } from './components/ReauthModal'
import { setPageTitle } from '@/utils/pageTitle'
import { registerRefetch, runRefetch } from '@/utils/refetchRegistry'
import type { PageRenderFn, Role, Route } from '@/types'

if (import.meta.env.VITE_ENV === 'dev') {
  const versjonEl = document.querySelector('.header-versjon')
  if (versjonEl) versjonEl.textContent += ' [DEV]'
}

function lazy(load: () => Promise<{ render: PageRenderFn }>): PageRenderFn {
  return async (c, p) => {
    const { render } = await load()
    return render(c, p)
  }
}

const container = document.getElementById('app')!

function authGuard(requiredRole: Role, renderFn: PageRenderFn): PageRenderFn {
  return async (cont, params) => {
    const auth = await getUser()
    if (!auth) {
      location.hash = '#/logginn'
      return
    }
    if (requiredRole === 'admin' && !(await isAdmin())) {
      cont.replaceChildren(createErrorBanner('Ingen tilgang.'))
      return
    }
    if (requiredRole === 'klubbadmin' && !(await isAdmin()) && !(await isClubAdmin())) {
      cont.replaceChildren(createErrorBanner('Ingen tilgang.'))
      return
    }
    await renderFn(cont, params)
  }
}

const routes: Route[] = [
  // Auth-ruter (spesifikke før generiske)
  { pattern: /^\/logginn$/,                      page: lazy(() => import('./pages/logginn')),                         params: () => ({}), title: 'Logg inn' },
  { pattern: /^\/minside$/,                      page: authGuard('bruker', lazy(() => import('./pages/minside'))),    params: () => ({}), title: 'Min side' },
  { pattern: /^\/admin$/,                        page: authGuard('admin',  lazy(() => import('./admin/admin'))),      params: () => ({}), title: 'Admin' },
  { pattern: /^\/stevne\/ny$/,                   page: authGuard('klubbadmin', lazy(() => import('./admin/stevneadmin'))), params: () => ({}), title: 'Nytt stevne' },
  { pattern: /^\/stevne\/(\d+)\/rediger$/,        page: authGuard('klubbadmin', lazy(() => import('./admin/stevneadmin'))), params: m => ({ id: Number(m[1]) }), title: 'Rediger stevne' },
  { pattern: /^\/kamp\/(\d+)$/,                 page: lazy(() => import('./pages/kamp')),                            params: m => ({ id: Number(m[1]) }) },
  { pattern: /^\/stevne\/(\d+)\/pamelding$/,    page: lazy(() => import('./pages/pamelding')),                       params: m => ({ id: m[1] }) },
  { pattern: /^\/stevne\/(\d+)(?:\/([^/]*))?$/, page: lazy(() => import('./pages/stevne')),                         params: m => ({ id: Number(m[1]), tab: m[2] ?? 'info' }) },
  { pattern: /^\/kaster\/ny$/,                   page: authGuard('klubbadmin', lazy(() => import('./admin/kasteradmin'))), params: () => ({}), title: 'Ny utøvar' },
  { pattern: /^\/kaster\/(\d+)\/admin$/,         page: authGuard('klubbadmin', lazy(() => import('./admin/kasteradmin'))), params: m => ({ id: m[1] }), title: 'Rediger utøvar' },
  { pattern: /^\/klubber\/(\d+)\/admin$/,        page: authGuard('klubbadmin', lazy(() => import('./admin/klubbadmin'))), params: m => ({ id: m[1] }), title: 'Rediger klubb' },
  // Eksisterande ruter
  { pattern: /^\/terminliste$/,                  page: lazy(() => import('./pages/terminliste')),                    params: () => ({}), title: 'Terminliste' },
  { pattern: /^\/norgescupen$/,                  page: lazy(() => import('./pages/norgescupen')),                    params: () => ({}), title: 'Norgescupen' },
  { pattern: /^\/norgesranking$/,                page: lazy(() => import('./pages/norgesranking')),                  params: () => ({}), title: 'Norgesranking' },
  { pattern: /^\/rekorder$/,                     page: lazy(() => import('./pages/rekorder')),                       params: () => ({}), title: 'Rekorder' },
  { pattern: /^\/nmvinnere$/,                    page: lazy(() => import('./pages/nmvinnere')),                      params: () => ({}), title: 'NM-vinnere' },
  { pattern: /^\/kastere\/(\d+)(-[^/]*)?$/,     page: lazy(() => import('./pages/kastere')),                        params: m => ({ id: m[1] }) },
  { pattern: /^\/kastere$/,                      page: lazy(() => import('./pages/kastere')),                        params: () => ({}), title: 'Utøvere' },
  { pattern: /^\/klubber\/(\d+)(-[^/]*)?$/,     page: lazy(() => import('./pages/klubber')),                        params: m => ({ id: m[1] }) },
  { pattern: /^\/klubber$/,                      page: lazy(() => import('./pages/klubber')),                        params: () => ({}), title: 'Klubber' },
  { pattern: /^\/?$/,                            page: renderHome,                                                   params: () => ({}) },
]

function navigate(): void {
  const [hash = '/'] = (location.hash.replace(/^#/, '') || '/').split('?')

  for (const route of routes) {
    const match = hash.match(route.pattern)
    if (match) {
      setPageTitle(route.title)
      // Cleared by default so a stale page's refetch can't fire against a page that
      // hasn't opted in — pages that support resume-refetch re-register it themselves.
      registerRefetch(null)
      route.page(container, route.params(match))
      return
    }
  }

  container.replaceChildren(createErrorBanner('Side ikkje funne.'))
}

async function updateAuthMenu(): Promise<void> {
  const auth = await getUser()
  const logginnItem = document.getElementById('meny-logginn-item')!
  const minsideItem = document.getElementById('meny-minside-item')!
  const adminItem   = document.getElementById('meny-admin-item')!
  const loggutItem  = document.getElementById('meny-loggut-item')!
  const headerEmail = document.getElementById('headerEmail')!

  if (auth) {
    logginnItem.classList.add('d-none')
    const isAdminUser = auth.profil?.role === 'admin'
    minsideItem.classList.toggle('d-none', isAdminUser)
    adminItem.classList.toggle('d-none', !isAdminUser)
    loggutItem.classList.remove('d-none')
    headerEmail.textContent = auth.user.email ?? ''
    ;(headerEmail as HTMLAnchorElement).href = isAdminUser ? '#/admin' : '#/minside'
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

window.addEventListener('hashchange', navigate)

App.addListener('resume', runRefetch)

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('menyLoggUtKnapp')!.addEventListener('click', async () => {
    await signOut()
    location.hash = '#/'
  })

  updateAuthMenu()
  navigate()
})

document.addEventListener('authStateChanged', (e) => {
  const { event, intentional, hadSession } = (e as CustomEvent<{ event: string; intentional: boolean; hadSession: boolean }>).detail
  if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
    updateAuthMenu()
  }
  // On a genuine authenticated → signed-out transition (not restoring a dead token on
  // load), let the operator re-authenticate in place instead of being bounced to the
  // login page mid-task. showReauthModal() is idempotent against repeat SIGNED_OUT events.
  if (event === 'SIGNED_OUT' && !intentional && hadSession) {
    showReauthModal()
  }
})

