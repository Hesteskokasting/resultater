import { kasterNavn, lagKasterSlug as lagSlug } from '../utils/kaster'
import { getUser } from '../services/authService'
import { createErrorBanner } from '../components/ErrorBanner'
import { createLoadingState } from '../components/LoadingState'
import { escHtml } from '../utils/escHtml'
import { logError } from '../utils/logError'
import {
  hentKastereListeAktive,
  hentKastereListeAlle,
} from '../services/kasterService'
import type { KasterListeRow } from '../services/kasterService'

const SIDER_STORLEIK = 24
const PLACEHOLDER_AVATAR = 'https://placehold.co/200x200/444/888?text=?'

const filtreListe = { visAlle: false, sokeTekst: '', side: 1 }

function kasterKortHtml(k: KasterListeRow): string {
  const namn = kasterNavn(k)
  return `
    <a href="#/kastere/${lagSlug(k)}" class="kaster-kort">
      <img src="${escHtml(k.avatarurl || PLACEHOLDER_AVATAR)}" alt="${escHtml(namn)}" loading="lazy">
      <div class="kaster-namn">${escHtml(namn)}</div>
      <div class="kaster-klubb">${escHtml(k.klubb?.navn ?? '–')}</div>
    </a>`
}

function listeSkelettHtml(): string {
  return `
    <div class="nc-side">
      <div class="kaster-liste-kontroller">
        <div class="nc-filter-rad">
          <input id="kaster-sok" type="search" class="tl-select" placeholder="Søk på namn/klubb" value="">
        </div>
        <div class="mt-2">
          <label class="kaster-checkbox-label">
            <input type="checkbox" id="kaster-berre-aktive" checked>
            Vis berre aktive utøvarar
          </label>
        </div>
      </div>
      <div id="kaster-sideinfo" class="my-2"></div>
      <div id="kaster-paginering-topp"></div>
      <div id="kaster-grid" class="kaster-grid"></div>
      <div id="kaster-paginering-botn"></div>
    </div>`
}

function pagineringHtml(side: number, totaltSider: number): string {
  if (totaltSider <= 1) return ''
  const knapp = (tekst: string, s: number, deaktivert: boolean) =>
    `<button class="btn btn-sm ${s === side ? 'btn-primary' : 'btn-outline-secondary'} pag-knapp"
      data-side="${s}" ${deaktivert ? 'disabled' : ''}>${tekst}</button>`
  return `
    <div class="kaster-paginering">
      ${knapp('«', 1, side === 1)}
      ${knapp('‹', side - 1, side === 1)}
      <span class="pag-info">side ${side} av ${totaltSider}</span>
      ${knapp('›', side + 1, side === totaltSider)}
      ${knapp('»', totaltSider, side === totaltSider)}
    </div>`
}

export async function renderListe(container: HTMLElement): Promise<void> {
  filtreListe.side = 1
  container.replaceChildren(createLoadingState('Laster utøvarar...'))

  try {
    const init = await hentKastereListeAktive()
    if (init.error) {
      container.replaceChildren(createErrorBanner('Kunne ikkje laste utøvarar.'))
      return
    }

    let kastereData = init.data
    container.innerHTML = listeSkelettHtml()

    const grid        = container.querySelector<HTMLElement>('#kaster-grid')!
    const sideinfoEl  = container.querySelector<HTMLElement>('#kaster-sideinfo')!
    const pagTopp     = container.querySelector<HTMLElement>('#kaster-paginering-topp')!
    const pagBotn     = container.querySelector<HTMLElement>('#kaster-paginering-botn')!
    const sokInput    = container.querySelector<HTMLInputElement>('#kaster-sok')!
    const aktiveCheck = container.querySelector<HTMLInputElement>('#kaster-berre-aktive')!

    function filtrerOgVis(): void {
      const sok = filtreListe.sokeTekst.trim().toLowerCase()
      let filtrert = kastereData
      if (sok) filtrert = filtrert.filter(k =>
        kasterNavn(k).toLowerCase().includes(sok) ||
        (k.klubb?.navn ?? '').toLowerCase().includes(sok)
      )

      const totalt      = filtrert.length
      const totaltSider = Math.max(1, Math.ceil(totalt / SIDER_STORLEIK))
      if (filtreListe.side > totaltSider) filtreListe.side = 1

      const start   = (filtreListe.side - 1) * SIDER_STORLEIK
      const sideDel = filtrert.slice(start, start + SIDER_STORLEIK)

      sideinfoEl.innerHTML = `side ${filtreListe.side} av ${totaltSider}`
      const pagHtml = pagineringHtml(filtreListe.side, totaltSider)
      pagTopp.innerHTML = pagHtml
      pagBotn.innerHTML = pagHtml
      grid.innerHTML    = sideDel.map(kasterKortHtml).join('')
    }

    filtrerOgVis()

    sokInput.addEventListener('input', () => {
      filtreListe.sokeTekst = sokInput.value
      filtreListe.side = 1
      filtrerOgVis()
    })

    aktiveCheck.addEventListener('change', async () => {
      filtreListe.visAlle = !aktiveCheck.checked
      filtreListe.side = 1
      const { data, error } = filtreListe.visAlle
        ? await hentKastereListeAlle()
        : await hentKastereListeAktive()
      if (!error) kastereData = data
      filtrerOgVis()
    })

    container.addEventListener('click', e => {
      const knapp = (e.target as Element).closest<HTMLButtonElement>('.pag-knapp')
      if (!knapp || knapp.disabled) return
      filtreListe.side = Number(knapp.dataset.side)
      filtrerOgVis()
      container.querySelector('.nc-side')?.scrollIntoView({ behavior: 'smooth' })
    })

    void getUser().then(auth => {
      if (!auth?.profil) return
      if (auth.profil.rolle !== 'admin' && auth.profil.rolle !== 'klubbadmin') return
      const bar = document.createElement('div')
      bar.className = 'mb-2 px-2'
      bar.innerHTML = `<a href="#/kaster/ny" class="btn btn-sm btn-success">+ Ny utøvar</a>`
      container.querySelector('.nc-side')?.prepend(bar)
    })
  } catch (err) {
    logError('renderListe', err)
    container.replaceChildren(createErrorBanner('Kunne ikkje laste utøvarar.'))
  }
}
