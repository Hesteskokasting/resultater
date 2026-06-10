import type { Kaster, Klubb } from '@/types'

export function kasterNavn(k: Pick<Kaster, 'fornavn' | 'etternavn'> | null | undefined): string {
  return [k?.fornavn, k?.etternavn].filter(Boolean).join(' ')
}

/** "Fornavn E." — first name plus last-name initial. */
export function kasterNavnKort(k: Pick<Kaster, 'fornavn' | 'etternavn'> | null | undefined): string {
  const initial = k?.etternavn ? ` ${k.etternavn.charAt(0)}.` : ''
  return `${k?.fornavn ?? ''}${initial}`.trim()
}

function lagSlugStr(str: string): string {
  return (str ?? '')
    .toLowerCase()
    .replace(/[æä]/g, 'ae').replace(/[øö]/g, 'o').replace(/å/g, 'a')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function lagKasterSlug(k: Pick<Kaster, 'id' | 'fornavn' | 'etternavn'>): string {
  return `${k.id}-` + lagSlugStr(`${k.etternavn ?? ''}-${k.fornavn ?? ''}`)
}

export function lagKlubbSlug(k: Pick<Klubb, 'id' | 'navn'>): string {
  return `${k.id}-` + lagSlugStr(k.navn ?? '')
}
