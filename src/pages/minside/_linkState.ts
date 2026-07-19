import { createEmptyState } from '@/components/EmptyState'
import { createPhoneVerification } from '@/components/PhoneVerification'
import { showToast } from '@/components/Toast'
import { escHtml } from '@/utils/escHtml'
import { throwerName } from '@/utils/kaster'
import { invalidateUserCache } from '@/services/authService'
import { getActiveThrowerList } from '@/services/kasterService'
import { approveLinkWithPhone, sendProfileLinkRequest } from '@/services/brukerProfilService'
import { runRefetch } from '@/utils/refetchRegistry'
import type { User } from '@supabase/supabase-js'
import type { LinkStatus, Profile } from '@/types'
import type { ThrowerListRow } from '@/services/kasterService'

export interface MinSideContext {
  user: User
  profil: Profile | null
  status: LinkStatus
}

function unlinkedHtml(status: LinkStatus): string {
  return `
    ${status === 'avvist' ? '<div class="alert alert-warning">Koblingforespørselen din vart avvist. Du kan sende ein ny.</div>' : ''}
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">Koble til utøvarprofil</h5>
        <p class="card-text text-muted">Søk etter deg sjølv i registeret og send ein forespørsel. Etter godkjenning kan du melde deg på stevner.</p>
        <input type="search" id="thrower-search" class="form-control mb-2" placeholder="Søk på navn…">
        <div id="thrower-matches" class="list-group mb-2"></div>
        <div id="thrower-error" class="alert alert-danger d-none"></div>
      </div>
    </div>`
}

function pendingHtml(): string {
  return '<div class="alert alert-info mb-4">Koblingforespørselen din ventar på godkjenning frå ein administrator.</div>'
}

/** Approves the pending request via the phone-verified RPC and re-renders. */
async function approvePendingLink(): Promise<void> {
  const { error } = await approveLinkWithPhone()
  if (error) {
    showToast('Klarte ikkje å koble kontoen automatisk. Ein administrator må godkjenne forespørselen.', 'warning')
  } else {
    showToast('Kontoen er kobla til utøvarprofilen.', 'success')
  }
  invalidateUserCache()
  await runRefetch()
}

function bindThrowerSearch(container: HTMLElement, ctx: MinSideContext): void {
  let timer: number | null = null
  let throwersCache: ThrowerListRow[] | null = null
  const searchInput = container.querySelector<HTMLInputElement>('#thrower-search')!
  const resultsDiv  = container.querySelector<HTMLElement>('#thrower-matches')!
  const errorDiv    = container.querySelector<HTMLElement>('#thrower-error')!

  searchInput.addEventListener('input', () => {
    if (timer !== null) clearTimeout(timer)
    const q = searchInput.value.trim().toLowerCase()
    if (q.length < 2) { resultsDiv.innerHTML = ''; return }

    timer = setTimeout(async () => {
      if (!throwersCache) {
        const { data } = await getActiveThrowerList()
        throwersCache = data
      }
      const results = throwersCache
        .filter(k => k.fornavn.toLowerCase().includes(q) || k.etternavn.toLowerCase().includes(q))
        .slice(0, 8)

      if (!results.length) {
        const el = createEmptyState('Ingen treff.')
        el.classList.add('small')
        resultsDiv.replaceChildren(el)
        return
      }
      resultsDiv.innerHTML = results.map(k =>
        `<button class="list-group-item list-group-item-action" data-id="${k.id}">
          ${escHtml(throwerName(k))} <span class="text-muted small">· ${escHtml(k.klubb?.navn ?? '')}</span>
        </button>`
      ).join('')
    }, 300)
  })

  resultsDiv.addEventListener('click', async e => {
    const button = (e.target as Element).closest<HTMLElement>('[data-id]')
    if (!button) return
    errorDiv.classList.add('d-none')

    const { error } = await sendProfileLinkRequest(ctx.user.id, Number(button.dataset.id))
    if (error) {
      errorDiv.textContent = 'Kunne ikkje sende forespørsel.'
      errorDiv.classList.remove('d-none')
      return
    }
    if (ctx.user.phone_confirmed_at) {
      await approvePendingLink()
      return
    }
    // The cached auth profile still says 'ingen'/'avvist'; drop it so the
    // re-render below sees the new 'venter' status.
    invalidateUserCache()
    await runRefetch()
  })
}

/**
 * Renders the link-request card or pending alert when the user has no approved
 * thrower link, and returns null. Returns the approved kasterid otherwise,
 * leaving the container untouched.
 */
export function renderLinkGate(container: HTMLElement, ctx: MinSideContext): number | null {
  if (ctx.status === 'godkjent' && ctx.profil?.kasterid != null) return ctx.profil.kasterid
  if (ctx.status === 'venter') {
    container.innerHTML = pendingHtml()
    if (ctx.user.phone_confirmed_at) {
      // Verified elsewhere (or the auto-approval failed): offer instant linking.
      const linkNowButton = document.createElement('button')
      linkNowButton.type = 'button'
      linkNowButton.className = 'btn btn-primary mb-4'
      linkNowButton.textContent = 'Koble til no'
      linkNowButton.addEventListener('click', () => {
        linkNowButton.disabled = true
        void approvePendingLink()
      })
      container.append(linkNowButton)
    } else {
      container.append(createPhoneVerification({
        description: 'Verifiser telefonnummeret ditt for å koble kontoen med ein gong — elles ventar du på godkjenning frå ein administrator.',
        onVerified: () => { void approvePendingLink() },
      }))
    }
    return null
  }
  container.innerHTML = unlinkedHtml(ctx.status)
  bindThrowerSearch(container, ctx)
  return null
}
