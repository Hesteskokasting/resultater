import { kasterNavn } from '@/utils/kaster'
import { showToast } from '@/components/Toast'
import { errorMessage } from '@/utils/errorMessage'
import { hentInnledendeKamper } from '@/services/kampService'
import { hentResultatForInnledende } from '@/services/resultatService'
import { hentParForStevne } from '@/services/pameldingService'
import type { PameldingPar } from '@/services/pameldingService'
import { buildRoundInfos, hentKlubbNamn } from '@/utils/startcard/roundInfoBuilder'
import type { PrintMatch } from '@/utils/startcard/roundInfoBuilder'
import { formatStartkortReceipt } from '@/utils/receipt/receiptFormat'
import {
  isWebSerialSupported,
  isPrinterConnected,
  setOnDisconnect,
  tryAutoReconnect,
  connectUsb,
  forget as forgetPrinter,
  printBytes,
} from '@/services/receiptPrinterService'
import type { KasterListeRow } from '@/services/kasterService'

interface InnlData {
  alleKamperPrint: PrintMatch[]
  rundeMap: Map<number, PrintMatch[]>
  startnrMap: Record<number, number>
  sortertRundar: number[]
  pairs: PameldingPar[]
}

interface Props {
  stevneId: number
  stevneNavn: string
  erLag: boolean
  onStateChange: () => void
}

export interface PrinterBanner {
  element: HTMLElement
  /** null = show empty print column (printer disconnected); handler = show print button */
  getPrintHandler: () => ((spelar: KasterListeRow) => void) | null
  /** Call when enrollment changes so cached match data is discarded */
  invalidateMatchData: () => void
}

export function createPrinterBanner(props: Props): PrinterBanner {
  const { stevneId, stevneNavn, erLag, onStateChange } = props

  const element = document.createElement('div')
  element.className = 'd-flex align-items-center gap-2 mb-2'

  let innlData: InnlData | null = null

  function invalidateMatchData(): void {
    innlData = null
  }

  async function ensureInnlData(): Promise<InnlData | null> {
    if (innlData) return innlData
    const [kamperRes, resultatRes, parRes] = await Promise.all([
      hentInnledendeKamper(stevneId),
      hentResultatForInnledende(stevneId),
      erLag ? hentParForStevne(stevneId) : Promise.resolve({ data: [] as PameldingPar[], error: null }),
    ])
    if (kamperRes.error) { showToast('Feil ved lasting av kampdata', 'error'); return null }
    if (resultatRes.error) { showToast('Feil ved lasting av resultatdata', 'error'); return null }

    const startnrMap: Record<number, number> = {}
    for (const r of resultatRes.data) {
      if (r.kasterid != null) startnrMap[r.kasterid] = r.startnummer ?? 0
    }

    const alleKamperPrint: PrintMatch[] = []
    const rundeMap = new Map<number, PrintMatch[]>()
    for (const kamp of kamperRes.data) {
      const pm: PrintMatch = {
        spelarar: kamp.spelarar,
        er_walkover: kamp.er_walkover,
        bane_nummer: kamp.bane_nummer,
      }
      alleKamperPrint.push(pm)
      const list = rundeMap.get(kamp.runde_nummer) ?? []
      list.push(pm)
      rundeMap.set(kamp.runde_nummer, list)
    }

    innlData = {
      alleKamperPrint,
      rundeMap,
      startnrMap,
      sortertRundar: [...rundeMap.keys()].sort((a, b) => a - b),
      pairs: parRes.data,
    }
    return innlData
  }

  function getPrintHandler(): ((spelar: KasterListeRow) => void) | null {
    if (!isPrinterConnected()) return null
    return async (spelar: KasterListeRow) => {
      const data = await ensureInnlData()
      if (!data) return
      const pair = data.pairs.find(p => p.sideA.kasterid === spelar.id || p.sideB.kasterid === spelar.id)
      let namn: string
      if (pair) {
        const partnerMember = pair.sideA.kasterid === spelar.id ? pair.sideB : pair.sideA
        const pk = partnerMember.kaster
        const partnerNavn = pk ? `${pk.fornavn ?? ''} ${pk.etternavn ?? ''}`.trim() : ''
        namn = `${kasterNavn(spelar)} / ${partnerNavn}`
      } else {
        namn = kasterNavn(spelar)
      }
      const startnummer = data.startnrMap[spelar.id] ?? ''
      const roundInfos = buildRoundInfos(spelar.id, data.sortertRundar, data.rundeMap, data.startnrMap)
      const klubb = hentKlubbNamn(spelar.id, data.alleKamperPrint)
      const bytes = formatStartkortReceipt({ startnummer, namn, klubb, roundInfos, stevneNavn })
      try {
        await printBytes(bytes)
      } catch (err) {
        showToast('Feil ved utskrift: ' + errorMessage(err), 'error')
      }
    }
  }

  if (!isWebSerialSupported()) {
    const note = document.createElement('small')
    note.className = 'text-muted'
    note.textContent = 'Kvitteringsprintar ikkje tilgjengeleg i denne nettlesaren (bruk Chrome/Edge).'
    element.appendChild(note)
    return { element, getPrintHandler: () => null, invalidateMatchData }
  }

  const statusDot = document.createElement('span')
  const statusLabel = document.createElement('span')
  statusLabel.textContent = 'Printer'
  const statusEl = document.createElement('span')
  statusEl.className = 'd-flex align-items-center gap-1 small'
  statusEl.appendChild(statusDot)
  statusEl.appendChild(statusLabel)

  const connectBtn = document.createElement('button')
  connectBtn.textContent = 'Koble til kvitteringsprintar'
  connectBtn.className = 'btn btn-sm btn-outline-secondary'

  const disconnectBtn = document.createElement('button')
  disconnectBtn.textContent = 'Koble frå'
  disconnectBtn.className = 'btn btn-sm btn-outline-warning d-none'

  function syncUI(): void {
    const connected = isPrinterConnected()
    statusDot.textContent = '●'
    statusDot.className = connected ? 'text-success' : 'text-muted'
    connectBtn.classList.toggle('d-none', connected)
    disconnectBtn.classList.toggle('d-none', !connected)
  }

  setOnDisconnect(() => { syncUI(); onStateChange() })

  connectBtn.addEventListener('click', async () => {
    connectBtn.disabled = true
    try {
      await connectUsb()
      syncUI()
      onStateChange()
    } catch (err) {
      connectBtn.disabled = false
      if (err instanceof Error && err.name !== 'NotFoundError') {
        showToast('Feil ved tilkopling: ' + errorMessage(err), 'error')
      }
    }
  })

  disconnectBtn.addEventListener('click', async () => {
    disconnectBtn.disabled = true
    await forgetPrinter()
    syncUI()
    onStateChange()
    disconnectBtn.disabled = false
  })

  element.appendChild(statusEl)
  element.appendChild(connectBtn)
  element.appendChild(disconnectBtn)

  // Set initial dot/button state without triggering list re-render
  syncUI()

  // Reconnect in the background — opening a Bluetooth serial port can
  // take several seconds on Windows, so it must not block first paint.
  void tryAutoReconnect().then(reconnected => {
    if (reconnected) { syncUI(); onStateChange() }
  })

  return { element, getPrintHandler, invalidateMatchData }
}
