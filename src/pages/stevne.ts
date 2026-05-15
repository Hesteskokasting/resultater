import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '../supabase'
import { erAdmin, erKlubbadmin } from '../utils/auth'
import { feilHtml } from '../utils/pageStates'
import { logError } from '../utils/logError'
import { render as renderInfo }          from './stevne/stevne-info'
import { render as renderSpillarar }     from './stevne/stevne-deltakere'
import { render as renderInnledende }    from './stevne/stevne-innledende'
import { render as renderAvsluttende }   from './stevne/stevne-avsluttende'
import { render as renderInnstillingar } from './stevne/stevne-innstillinger'
import { render as renderResultat }      from './stevne/stevne-resultat'

// ── Typar ─────────────────────────────────────────────────────────────────────

type TabRender = (
  container: HTMLElement,
  opts: { id: number; isAdmin?: boolean },
  bannerSlot?: HTMLElement | null,
) => Promise<void>

// ── Tab-konfigurasjon ─────────────────────────────────────────────────────────

const FANER = [
  { nøkkel: 'info',          label: 'Info',          adminOnly: false },
  { nøkkel: 'spillere',      label: 'Spelarar',      adminOnly: true  },
  { nøkkel: 'innledende',    label: 'Innledande',    adminOnly: false },
  { nøkkel: 'avsluttende',   label: 'Avsluttande',   adminOnly: false },
  { nøkkel: 'resultat',      label: 'Sluttresultat', adminOnly: false },
  { nøkkel: 'innstillinger', label: 'Innstillingar', adminOnly: true  },
] as const

type TabNøkkel = (typeof FANER)[number]['nøkkel']

const ADMIN_FANER = new Set<string>(FANER.filter(f => f.adminOnly).map(f => f.nøkkel))

const TAB_RENDER: Record<TabNøkkel, TabRender> = {
  info:          renderInfo,
  spillere:      renderSpillarar as TabRender,
  innledende:    renderInnledende,
  avsluttende:   renderAvsluttende,
  innstillinger: renderInnstillingar as TabRender,
  resultat:      renderResultat as TabRender,
}

const FASE_LABEL: Record<string, string> = {
  ikke_startet: '<span class="badge bg-secondary">Ikkje starta</span>',
  innledende:   '<span class="badge bg-primary">Innledande fase</span>',
  avsluttende:  '<span class="badge bg-success">Avsluttande fase</span>',
}

// ── Hjelpefunksjonar ──────────────────────────────────────────────────────────

function renderNav(stevneid: number, aktiv: string, isAdmin: boolean): string {
  const items = FANER
    .filter(f => isAdmin || !f.adminOnly)
    .map(({ nøkkel, label }) => `
      <li class="nav-item">
        <a class="nav-link${aktiv === nøkkel ? ' active' : ''}"
           href="#/stevne/${stevneid}/${nøkkel}">${label}</a>
      </li>`)
    .join('')
  return `<ul class="nav nav-tabs mb-3">${items}</ul>`
}

// ── Render ────────────────────────────────────────────────────────────────────

let kanal: RealtimeChannel | null = null

export async function render(
  container: HTMLElement,
  { id, tab = 'info' }: { id: number; tab?: string },
): Promise<void> {
  if (kanal) { await supabase.removeChannel(kanal); kanal = null }
  container.innerHTML = '<p class="laster">Laster…</p>'

  try {
    const { data: stevne, error } = await supabase
      .from('stevne')
      .select('id, navn, stevne_fase')
      .eq('id', id)
      .single()

    if (error || !stevne) {
      container.innerHTML = feilHtml('Stevne ikkje funne.')
      return
    }

    const isAdmin = (await erAdmin()) || (await erKlubbadmin())
    const aktiv = (!isAdmin && ADMIN_FANER.has(tab)) ? 'info' : tab as TabNøkkel
    const badge = FASE_LABEL[stevne.stevne_fase ?? 'ikke_startet'] ?? ''

    container.innerHTML = `
      <div class="org-shell py-3 px-3">
        ${renderNav(id, aktiv, isAdmin)}
        <div class="org-fase-header d-flex align-items-center gap-2 mb-3">
          <h5 class="mb-0 flex-grow-1">${stevne.navn} <span id="fase-badge">${badge}</span></h5>
          <div id="org-banner-knappar"></div>
        </div>
        <div id="org-subside"></div>
      </div>`

    const bannerSlot = container.querySelector<HTMLElement>('#org-banner-knappar')
    const subside    = container.querySelector<HTMLElement>('#org-subside')!
    const renderFn   = TAB_RENDER[aktiv] ?? renderInfo

    await renderFn(subside, { id, isAdmin }, bannerSlot)

    kanal = supabase
      .channel(`stevne-fase-${id}`)
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'stevne', filter: `id=eq.${id}` },
        payload => {
          const el = container.querySelector('#fase-badge')
          if (el) el.innerHTML = FASE_LABEL[(payload.new as { stevne_fase?: string }).stevne_fase ?? 'ikke_startet'] ?? ''
        })
      .subscribe()
  } catch (err) {
    logError('stevne.render', err)
    container.innerHTML = feilHtml('Kunne ikkje laste stevnet.')
  }
}
