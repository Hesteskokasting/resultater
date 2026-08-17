import { throwerName } from "@/utils/kaster";
import { showToast } from "@/components/Toast";
import { errorMessage } from "@/utils/errorMessage";
import { getInitialRoundMatches } from "@/services/kampService";
import { getResultsForInitialRound } from "@/services/resultatService";
import { buildParticipantMaps } from "@/utils/participantMaps";
import { groupBy } from "@/utils/groupBy";
import { getPairsForTournament } from "@/services/pameldingService";
import type { RegistrationPair } from "@/services/pameldingService";
import { buildRoundInfos, hentKlubbNamn } from "@/print/roundInfoBuilder";
import type { PrintMatch } from "@/print/roundInfoBuilder";
import { formatStartkortReceipt } from "@/print/receiptFormat";
import {
  isWebSerialSupported,
  isPrinterConnected,
  setOnDisconnect,
  tryAutoReconnect,
  connectUsb,
  forget as forgetPrinter,
  printBytes,
} from "@/services/receiptPrinterService";
import type { ThrowerListRow } from "@/services/kasterService";

interface InitialRoundData {
  allMatchesPrint: PrintMatch[];
  roundMap: Map<number, PrintMatch[]>;
  startNumberMap: Record<number, number>;
  sortedRounds: number[];
  pairs: RegistrationPair[];
}

interface Props {
  tournamentId: number;
  tournamentName: string;
  isTeam: boolean;
  onStateChange: () => void;
}

export interface PrinterBanner {
  element: HTMLElement;
  /** null = show empty print column (printer disconnected); handler = show print button */
  getPrintHandler: () => ((thrower: ThrowerListRow) => void) | null;
  /** Call when enrollment changes so cached match data is discarded */
  invalidateMatchData: () => void;
}

export function createPrinterBanner(props: Props): PrinterBanner {
  const { tournamentId, tournamentName, isTeam, onStateChange } = props;

  const element = document.createElement("div");
  element.className = "d-flex align-items-center gap-2 mb-2";

  let initialRoundData: InitialRoundData | null = null;

  function invalidateMatchData(): void {
    initialRoundData = null;
  }

  async function ensureInitialRoundData(): Promise<InitialRoundData | null> {
    if (initialRoundData) return initialRoundData;
    const [matchesRes, resultRes, pairsRes] = await Promise.all([
      getInitialRoundMatches(tournamentId),
      getResultsForInitialRound(tournamentId),
      isTeam
        ? getPairsForTournament(tournamentId)
        : Promise.resolve({ data: [] as RegistrationPair[], error: null }),
    ]);
    if (matchesRes.error) {
      showToast("Feil ved lasting av kampdata", "error");
      return null;
    }
    if (resultRes.error) {
      showToast("Feil ved lasting av resultatdata", "error");
      return null;
    }

    const { startNumberMap } = buildParticipantMaps(resultRes.data);

    const toPrintMatch = (kamp: (typeof matchesRes.data)[number]): PrintMatch => ({
      spelarar: kamp.spelarar,
      er_walkover: kamp.er_walkover,
      bane_nummer: kamp.bane_nummer,
    });
    const allMatchesPrint = matchesRes.data.map(toPrintMatch);
    const roundMap = new Map(
      [...groupBy(matchesRes.data, (k) => k.runde_nummer)].map(([runde, kampar]) => [
        runde,
        kampar.map(toPrintMatch),
      ]),
    );

    initialRoundData = {
      allMatchesPrint,
      roundMap,
      startNumberMap,
      sortedRounds: [...roundMap.keys()].sort((a, b) => a - b),
      pairs: pairsRes.data,
    };
    return initialRoundData;
  }

  function getPrintHandler(): ((thrower: ThrowerListRow) => void) | null {
    if (!isPrinterConnected()) return null;
    return async (thrower: ThrowerListRow) => {
      const data = await ensureInitialRoundData();
      if (!data) return;
      const pair = data.pairs.find(
        (p) => p.sideA.kasterid === thrower.id || p.sideB.kasterid === thrower.id,
      );
      let name: string;
      if (pair) {
        const partnerMember = pair.sideA.kasterid === thrower.id ? pair.sideB : pair.sideA;
        const pk = partnerMember.kaster;
        const partnerName = pk ? `${pk.fornavn ?? ""} ${pk.etternavn ?? ""}`.trim() : "";
        name = `${throwerName(thrower)} / ${partnerName}`;
      } else {
        name = throwerName(thrower);
      }
      const startNumber = data.startNumberMap[thrower.id] ?? "";
      const roundInfos = buildRoundInfos(
        thrower.id,
        data.sortedRounds,
        data.roundMap,
        data.startNumberMap,
      );
      const club = hentKlubbNamn(thrower.id, data.allMatchesPrint);
      const bytes = formatStartkortReceipt({
        startnummer: startNumber,
        namn: name,
        klubb: club,
        roundInfos,
        stevneNavn: tournamentName,
      });
      try {
        await printBytes(bytes);
      } catch (err) {
        showToast("Feil ved utskrift: " + errorMessage(err), "error");
      }
    };
  }

  if (!isWebSerialSupported()) {
    const note = document.createElement("small");
    note.className = "text-muted";
    note.textContent =
      "Kvitteringsprintar ikkje tilgjengeleg i denne nettlesaren (bruk Chrome/Edge).";
    element.appendChild(note);
    return { element, getPrintHandler: () => null, invalidateMatchData };
  }

  const statusDot = document.createElement("span");
  const statusLabel = document.createElement("span");
  statusLabel.textContent = "Printer";
  const statusEl = document.createElement("span");
  statusEl.className = "d-flex align-items-center gap-1 small";
  statusEl.appendChild(statusDot);
  statusEl.appendChild(statusLabel);

  const connectBtn = document.createElement("button");
  connectBtn.textContent = "Koble til kvitteringsprintar";
  connectBtn.className = "btn btn-sm btn-outline-secondary";

  const disconnectBtn = document.createElement("button");
  disconnectBtn.textContent = "Koble frå";
  disconnectBtn.className = "btn btn-sm btn-outline-warning d-none";

  function syncUI(): void {
    const connected = isPrinterConnected();
    statusDot.textContent = "●";
    statusDot.className = connected ? "text-success" : "text-muted";
    connectBtn.classList.toggle("d-none", connected);
    disconnectBtn.classList.toggle("d-none", !connected);
  }

  setOnDisconnect(() => {
    syncUI();
    onStateChange();
  });

  connectBtn.addEventListener("click", async () => {
    connectBtn.disabled = true;
    try {
      await connectUsb();
      syncUI();
      onStateChange();
    } catch (err) {
      connectBtn.disabled = false;
      if (err instanceof Error && err.name !== "NotFoundError") {
        showToast("Feil ved tilkopling: " + errorMessage(err), "error");
      }
    }
  });

  disconnectBtn.addEventListener("click", async () => {
    disconnectBtn.disabled = true;
    await forgetPrinter();
    syncUI();
    onStateChange();
    disconnectBtn.disabled = false;
  });

  element.appendChild(statusEl);
  element.appendChild(connectBtn);
  element.appendChild(disconnectBtn);

  // Set initial dot/button state without triggering list re-render
  syncUI();

  // Reconnect in the background — opening a Bluetooth serial port can
  // take several seconds on Windows, so it must not block first paint.
  void tryAutoReconnect().then((reconnected) => {
    if (reconnected) {
      syncUI();
      onStateChange();
    }
  });

  return { element, getPrintHandler, invalidateMatchData };
}
