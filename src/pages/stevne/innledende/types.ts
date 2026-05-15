import type { OrgKamp, OrgKampSpelar } from '../../../organizer/org-shared.js'

export interface InnlKlubb { kortnavn: string | null; navn: string | null }
export interface InnlKaster { id: number; fornavn: string; etternavn: string; klubb: InnlKlubb | null }
export interface InnlKampOmgang { score: number | null; antall_ringer: number | null }
export interface InnlKampSpelar extends OrgKampSpelar {
  id: number
  kaster: InnlKaster | null
  omgangar: InnlKampOmgang[] | null
}
export interface InnlKamp extends OrgKamp {
  id: number
  stevneid: number
  fase: string
  spelarar: InnlKampSpelar[] | null
}
export interface InnlStevne {
  id: number
  navn: string
  erfullfort: boolean
  stevne_fase: string | null
  kastemetode: { id: number; navn: string } | null
}
export interface InnlResultat { kasterid: number; startnummer: number | null; hcp: number | null }
