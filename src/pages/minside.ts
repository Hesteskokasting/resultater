import { Capacitor } from '@capacitor/core'
import { getUser } from '@/services/authService'
import { createErrorBanner } from '@/components/ErrorBanner'
import { createLoadingState } from '@/components/LoadingState'
import { escHtml } from '@/utils/escHtml'
import { logError } from '@/utils/logError'
import { registerRefetch } from '@/utils/refetchRegistry'
import { render as renderMatches }       from './minside/minside-kampar'
import { render as renderRegistrations } from './minside/minside-pameldingar'
import { render as renderNotifications } from './minside/minside-varslingar'
import { render as renderSettings }      from './minside/minside-innstillingar'
import { render as renderAccount }       from './minside/minside-konto'
import type { MinSideContext } from './minside/_linkState'
import type { Params, LinkStatus } from '@/types'

type TabRender = (container: HTMLElement, ctx: MinSideContext) => Promise<void>

const TABS = [
  { key: 'kampar',        label: 'Kampar',        nativeOnly: false },
  { key: 'pameldingar',   label: 'Påmeldingar',   nativeOnly: false },
  { key: 'varslingar',    label: 'Varslingar',    nativeOnly: true  },
  { key: 'innstillingar', label: 'Innstillingar', nativeOnly: false },
  { key: 'konto',         label: 'Konto',         nativeOnly: false },
] as const

type TabKey = (typeof TABS)[number]['key']

const TAB_KEYS    = new Set<string>(TABS.map(f => f.key))
const NATIVE_TABS = new Set<string>(TABS.filter(f => f.nativeOnly).map(f => f.key))

const TAB_RENDER: Record<TabKey, TabRender> = {
  kampar:        renderMatches,
  pameldingar:   renderRegistrations,
  varslingar:    renderNotifications,
  innstillingar: renderSettings,
  konto:         renderAccount,
}

function renderNav(active: string, isNative: boolean): string {
  const items = TABS
    .filter(f => isNative || !f.nativeOnly)
    .map(({ key, label }) => `
      <li class="nav-item">
        <a class="nav-link${active === key ? ' active' : ''}"
           href="#/minside/${key}">${label}</a>
      </li>`)
    .join('')
  return `<ul class="nav nav-underline mypage-nav mb-3">${items}</ul>`
}

export async function render(container: HTMLElement, params: Params): Promise<void> {
  registerRefetch(() => render(container, params))
  const tab = String(params.tab ?? 'kampar')
  container.replaceChildren(createLoadingState('Laster min side…'))

  try {
    const auth = await getUser()
    if (!auth) { location.hash = '#/logginn'; return }

    const { profil, user } = auth
    const status: LinkStatus = profil?.kobling_status ?? 'ingen'

    const isNative = Capacitor.isNativePlatform()
    const activeTab = (!TAB_KEYS.has(tab) || (!isNative && NATIVE_TABS.has(tab)))
      ? 'kampar'
      : tab as TabKey

    container.innerHTML = `
      <div class="mypage-container">
        <h2 class="mb-1">Min side</h2>
        <p class="text-muted mb-3">${escHtml(user.email ?? '')}</p>
        ${renderNav(activeTab, isNative)}
        <div id="minside-subpage"></div>
      </div>`

    const subpage = container.querySelector<HTMLElement>('#minside-subpage')!
    await TAB_RENDER[activeTab](subpage, { user, profil, status })
  } catch (err) {
    logError('minside.render', err)
    container.replaceChildren(createErrorBanner('Kunne ikkje laste min side.'))
  }
}
