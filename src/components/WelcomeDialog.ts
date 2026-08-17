// First-visit dialog: what this app is, and which of the two things a newcomer
// wants to do next. Shown once per browser until dismissed for good, and never
// to a signed-in account — min side's link gate takes over from there.

import { createModalEl, createModalLifecycle } from "@/components/ModalBase";
import { getUser } from "@/services/authService";

const SEEN_KEY = "welcome-seen";

const BODY_HTML = `
  <div class="alert alert-warning">Sida er framleis under utvikling og kan difor innehalde feil.
     Det vil også kome ein del endringar fram til systemet blir tatt i bruk for fullt frå 2027.</div>
  <p>Terminliste, resultater og statistikk.
     Alt dette er ope for alle — du treng ingen konto for å følgje eit stevne.</p>
  <div class="card mb-3">
    <div class="card-body">
      <h6 class="card-title">Er du utøvar?</h6>
      <p class="card-text">Opprett ein konto og koble den til utøvarprofilen din i registeret.
         Då kan du melde deg på stevne, sjå dine eigne kampar og få varsel når eit stevne startar.</p>
      <a class="btn btn-sm btn-primary" href="#/logginn">Logg inn eller opprett konto</a>
      <p class="card-text text-muted small mt-3 mb-0">Har du ikkje delteke på eit stevne før? Ta kontakt med klubben din
          — eller send e-post til
         <a href="mailto:kontakt@hesteskokasting.no">kontakt@hesteskokasting.no</a>, så hjelper vi deg.</p>
    </div>
  </div>
  <div class="card">
    <div class="card-body">
      <h6 class="card-title">Er du publikum?</h6>
      <p class="card-text">Då er du klar. Gå til terminlista for å følgje stevne som går no, eller
         for å sjå resultat og statistikk frå tidlegare stevne.</p>
      <a class="btn btn-sm btn-outline-primary" href="#/terminliste">Til terminliste og resultat</a>
    </div>
  </div>`;

let el: HTMLElement | null = null;
const modal = createModalLifecycle();

function close(): void {
  if (!el) return;
  modal.close(el);
  el.remove();
  el = null;
}

function build(): HTMLElement {
  const created = createModalEl({
    role: "dialog",
    labelledBy: "wd-title",
    describedBy: "wd-body",
    html: `
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="wd-title">Velkomen til NHF Resultater</h5>
          </div>
          <div class="modal-body" id="wd-body">${BODY_HTML}</div>
          <div class="modal-footer justify-content-between">
            <div class="form-check mb-0">
              <input class="form-check-input" type="checkbox" id="wd-hide">
              <label class="form-check-label" for="wd-hide">Ikkje vis dette igjen</label>
            </div>
            <button type="button" class="btn btn-secondary" id="wd-close">Lukk</button>
          </div>
        </div>
      </div>`,
  });

  // Written on change rather than on close, so escaping out still respects it.
  created.querySelector<HTMLInputElement>("#wd-hide")!.addEventListener("change", (e) => {
    const { checked } = e.target as HTMLInputElement;
    if (checked) localStorage.setItem(SEEN_KEY, "1");
    else localStorage.removeItem(SEEN_KEY);
  });

  created.querySelector("#wd-close")!.addEventListener("click", close);

  // The dialog lives on body, so a route change would leave it hanging over the
  // page it just sent the user to. mailto: is left alone — it opens no route.
  created.querySelector("#wd-body")!.addEventListener("click", (e) => {
    if ((e.target as Element).closest('a[href^="#"]')) close();
  });

  return created;
}

/** Shows the dialog unless it has been dismissed for good or someone is signed in. */
export async function maybeShowWelcomeDialog(): Promise<void> {
  if (localStorage.getItem(SEEN_KEY) === "1") return;
  if (await getUser()) return;
  if (el) return;

  el = build();
  modal.open(el, { focus: "#wd-close", onEscape: close });
}
