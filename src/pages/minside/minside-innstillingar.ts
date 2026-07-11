import type { MinSideContext } from './_linkState'

export async function render(container: HTMLElement, _ctx: MinSideContext): Promise<void> {
  container.innerHTML = `
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">Innstillingar</h5>
        <p class="text-muted mb-0">Fleire innstillingar kjem her seinare.</p>
      </div>
    </div>`
}
