export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      antallTellendeNc: {
        Row: {
          id: number
          max_dnc: number
          max_dnc_total: number
          max_nc_total: number
          max_snc: number
          max_snc_total: number
          maxtotal: number
          year: number | null
        }
        Insert: {
          id?: number
          max_dnc?: number
          max_dnc_total?: number
          max_nc_total?: number
          max_snc?: number
          max_snc_total?: number
          maxtotal?: number
          year?: number | null
        }
        Update: {
          id?: number
          max_dnc?: number
          max_dnc_total?: number
          max_nc_total?: number
          max_snc?: number
          max_snc_total?: number
          maxtotal?: number
          year?: number | null
        }
        Relationships: []
      }
      bruker_profil: {
        Row: {
          id: string
          kasterid: number | null
          kobling_kasterid: number | null
          kobling_status: string
          opprettet_at: string
          rolle: string
          varsle_kamp_opprettet: boolean
          varsle_stevne_start: boolean
        }
        Insert: {
          id: string
          kasterid?: number | null
          kobling_kasterid?: number | null
          kobling_status?: string
          opprettet_at?: string
          rolle?: string
          varsle_kamp_opprettet?: boolean
          varsle_stevne_start?: boolean
        }
        Update: {
          id?: string
          kasterid?: number | null
          kobling_kasterid?: number | null
          kobling_status?: string
          opprettet_at?: string
          rolle?: string
          varsle_kamp_opprettet?: boolean
          varsle_stevne_start?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "bruker_profil_kasterid_fkey"
            columns: ["kasterid"]
            isOneToOne: false
            referencedRelation: "kaster"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bruker_profil_kobling_kasterid_fkey"
            columns: ["kobling_kasterid"]
            isOneToOne: false
            referencedRelation: "kaster"
            referencedColumns: ["id"]
          },
        ]
      }
      gruppe: {
        Row: {
          eraktiv: boolean
          id: number
          navn: string
        }
        Insert: {
          eraktiv?: boolean
          id?: number
          navn: string
        }
        Update: {
          eraktiv?: boolean
          id?: number
          navn?: string
        }
        Relationships: []
      }
      kamp: {
        Row: {
          bane_nummer: number | null
          er_bekreftet: boolean
          er_tre_spelarar: boolean
          er_walkover: boolean
          fase: string
          gruppe_navn: string | null
          id: number
          match_id: string
          runde_navn: string | null
          runde_nummer: number
          stevneid: number
        }
        Insert: {
          bane_nummer?: number | null
          er_bekreftet?: boolean
          er_tre_spelarar?: boolean
          er_walkover?: boolean
          fase: string
          gruppe_navn?: string | null
          id?: never
          match_id: string
          runde_navn?: string | null
          runde_nummer: number
          stevneid: number
        }
        Update: {
          bane_nummer?: number | null
          er_bekreftet?: boolean
          er_tre_spelarar?: boolean
          er_walkover?: boolean
          fase?: string
          gruppe_navn?: string | null
          id?: never
          match_id?: string
          runde_navn?: string | null
          runde_nummer?: number
          stevneid?: number
        }
        Relationships: [
          {
            foreignKeyName: "kamp_stevneid_fkey"
            columns: ["stevneid"]
            isOneToOne: false
            referencedRelation: "stevne"
            referencedColumns: ["id"]
          },
        ]
      }
      kamp_omgang: {
        Row: {
          antall_ringer: number
          id: number
          kamp_spelar_id: number
          omgang: number
          registrert_at: string
          registrert_av: string | null
          score: number
        }
        Insert: {
          antall_ringer: number
          id?: never
          kamp_spelar_id: number
          omgang: number
          registrert_at?: string
          registrert_av?: string | null
          score: number
        }
        Update: {
          antall_ringer?: number
          id?: never
          kamp_spelar_id?: number
          omgang?: number
          registrert_at?: string
          registrert_av?: string | null
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "kamp_omgang_kamp_spelar_fkey"
            columns: ["kamp_spelar_id"]
            isOneToOne: false
            referencedRelation: "kamp_spelar"
            referencedColumns: ["id"]
          },
        ]
      }
      kamp_spelar: {
        Row: {
          antall_ringer: number
          id: number
          kamp_plassering: number | null
          kamp_poeng: number
          kampid: number
          kasterid: number
          score_poeng: number
        }
        Insert: {
          antall_ringer?: number
          id?: never
          kamp_plassering?: number | null
          kamp_poeng?: number
          kampid: number
          kasterid: number
          score_poeng?: number
        }
        Update: {
          antall_ringer?: number
          id?: never
          kamp_plassering?: number | null
          kamp_poeng?: number
          kampid?: number
          kasterid?: number
          score_poeng?: number
        }
        Relationships: [
          {
            foreignKeyName: "kamp_spelar_kampid_fkey"
            columns: ["kampid"]
            isOneToOne: false
            referencedRelation: "kamp"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kamp_spelar_kasterid_fkey"
            columns: ["kasterid"]
            isOneToOne: false
            referencedRelation: "kaster"
            referencedColumns: ["id"]
          },
        ]
      }
      kastemetode: {
        Row: {
          antall_omganger: number | null
          beskrivelse: string | null
          er_avsluttende: boolean
          er_innledende: boolean
          eraktiv: boolean
          ernorgesranking: boolean
          id: number
          navn: string
        }
        Insert: {
          antall_omganger?: number | null
          beskrivelse?: string | null
          er_avsluttende?: boolean
          er_innledende?: boolean
          eraktiv?: boolean
          ernorgesranking?: boolean
          id?: number
          navn: string
        }
        Update: {
          antall_omganger?: number | null
          beskrivelse?: string | null
          er_avsluttende?: boolean
          er_innledende?: boolean
          eraktiv?: boolean
          ernorgesranking?: boolean
          id?: number
          navn?: string
        }
        Relationships: []
      }
      kaster: {
        Row: {
          avatarurl: string | null
          eraktiv: boolean
          etternavn: string
          fornavn: string
          id: number
          kjonnid: number
          klasseid: number | null
          klubbid: number | null
          medlemsnummer: number | null
        }
        Insert: {
          avatarurl?: string | null
          eraktiv?: boolean
          etternavn: string
          fornavn: string
          id?: number
          kjonnid: number
          klasseid?: number | null
          klubbid?: number | null
          medlemsnummer?: number | null
        }
        Update: {
          avatarurl?: string | null
          eraktiv?: boolean
          etternavn?: string
          fornavn?: string
          id?: number
          kjonnid?: number
          klasseid?: number | null
          klubbid?: number | null
          medlemsnummer?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "kaster_kjonnid_fkey"
            columns: ["kjonnid"]
            isOneToOne: false
            referencedRelation: "kjonn"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kaster_klasseid_fkey"
            columns: ["klasseid"]
            isOneToOne: false
            referencedRelation: "klasse"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kaster_klubbid_fkey"
            columns: ["klubbid"]
            isOneToOne: false
            referencedRelation: "klubb"
            referencedColumns: ["id"]
          },
        ]
      }
      kategori: {
        Row: {
          erlagbasert: boolean
          ernm: boolean
          id: number
          navn: string
        }
        Insert: {
          erlagbasert?: boolean
          ernm?: boolean
          id?: number
          navn: string
        }
        Update: {
          erlagbasert?: boolean
          ernm?: boolean
          id?: number
          navn?: string
        }
        Relationships: []
      }
      kjonn: {
        Row: {
          id: number
          kortform: string
          navn: string
        }
        Insert: {
          id?: number
          kortform: string
          navn: string
        }
        Update: {
          id?: number
          kortform?: string
          navn?: string
        }
        Relationships: []
      }
      klasse: {
        Row: {
          eraktiv: boolean
          har_nm_vinnere: boolean
          id: number
          navn: string
        }
        Insert: {
          eraktiv?: boolean
          har_nm_vinnere?: boolean
          id?: number
          navn: string
        }
        Update: {
          eraktiv?: boolean
          har_nm_vinnere?: boolean
          id?: number
          navn?: string
        }
        Relationships: []
      }
      klubb: {
        Row: {
          eraktiv: boolean
          id: number
          kortnavn: string
          logourl: string | null
          navn: string
        }
        Insert: {
          eraktiv?: boolean
          id?: number
          kortnavn?: string
          logourl?: string | null
          navn: string
        }
        Update: {
          eraktiv?: boolean
          id?: number
          kortnavn?: string
          logourl?: string | null
          navn?: string
        }
        Relationships: []
      }
      klubbadmin_klubber: {
        Row: {
          bruker_id: string
          id: number
          klubbid: number
          tildelt_at: string
          tildelt_av: string | null
        }
        Insert: {
          bruker_id: string
          id?: never
          klubbid: number
          tildelt_at?: string
          tildelt_av?: string | null
        }
        Update: {
          bruker_id?: string
          id?: never
          klubbid?: number
          tildelt_at?: string
          tildelt_av?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "klubbadmin_klubber_klubbid_fkey"
            columns: ["klubbid"]
            isOneToOne: false
            referencedRelation: "klubb"
            referencedColumns: ["id"]
          },
        ]
      }
      norgescuppoeng: {
        Row: {
          gjelderfraaar: number
          gjeldertilaar: number | null
          id: number
          plassering: number
          poengdnc: number
          poengnc: number
        }
        Insert: {
          gjelderfraaar: number
          gjeldertilaar?: number | null
          id?: number
          plassering: number
          poengdnc: number
          poengnc: number
        }
        Update: {
          gjelderfraaar?: number
          gjeldertilaar?: number | null
          id?: number
          plassering?: number
          poengdnc?: number
          poengnc?: number
        }
        Relationships: []
      }
      notification_queue: {
        Row: {
          body: string
          created_at: string
          deep_link: string
          entity_id: number
          error: string | null
          id: number
          notification_type: string
          sent_at: string | null
          status: string
          title: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          deep_link: string
          entity_id: number
          error?: string | null
          id?: never
          notification_type: string
          sent_at?: string | null
          status?: string
          title: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          deep_link?: string
          entity_id?: number
          error?: string | null
          id?: never
          notification_type?: string
          sent_at?: string | null
          status?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      pamelding: {
        Row: {
          er_bekreftet: boolean
          id: number
          kasterid: number
          lag_id: number | null
          opprettet_at: string
          posisjon: number | null
          registrert_av: string | null
          stevneid: number
        }
        Insert: {
          er_bekreftet?: boolean
          id?: never
          kasterid: number
          lag_id?: number | null
          opprettet_at?: string
          posisjon?: number | null
          registrert_av?: string | null
          stevneid: number
        }
        Update: {
          er_bekreftet?: boolean
          id?: never
          kasterid?: number
          lag_id?: number | null
          opprettet_at?: string
          posisjon?: number | null
          registrert_av?: string | null
          stevneid?: number
        }
        Relationships: [
          {
            foreignKeyName: "pamelding_kasterid_fkey"
            columns: ["kasterid"]
            isOneToOne: false
            referencedRelation: "kaster"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pamelding_stevneid_fkey"
            columns: ["stevneid"]
            isOneToOne: false
            referencedRelation: "stevne"
            referencedColumns: ["id"]
          },
        ]
      }
      resultat: {
        Row: {
          antall_ring_kongelag: number | null
          antall_ring_xkast: number | null
          erpremie: boolean | null
          gruppeid: number | null
          hcp: number
          id: number
          kamp_poeng_innl: number | null
          kasterid: number | null
          klasseid: number | null
          klubbid: number | null
          nc_poeng: number | null
          plassering: number | null
          poeng_golf: number | null
          poeng_kongelag: number | null
          poeng_xkast: number | null
          posisjon: number | null
          runde_eliminert: number | null
          score_poeng_innl: number | null
          snc_plassering: number | null
          startnummer: number | null
          stevneid: number | null
        }
        Insert: {
          antall_ring_kongelag?: number | null
          antall_ring_xkast?: number | null
          erpremie?: boolean | null
          gruppeid?: number | null
          hcp?: number
          id?: number
          kamp_poeng_innl?: number | null
          kasterid?: number | null
          klasseid?: number | null
          klubbid?: number | null
          nc_poeng?: number | null
          plassering?: number | null
          poeng_golf?: number | null
          poeng_kongelag?: number | null
          poeng_xkast?: number | null
          posisjon?: number | null
          runde_eliminert?: number | null
          score_poeng_innl?: number | null
          snc_plassering?: number | null
          startnummer?: number | null
          stevneid?: number | null
        }
        Update: {
          antall_ring_kongelag?: number | null
          antall_ring_xkast?: number | null
          erpremie?: boolean | null
          gruppeid?: number | null
          hcp?: number
          id?: number
          kamp_poeng_innl?: number | null
          kasterid?: number | null
          klasseid?: number | null
          klubbid?: number | null
          nc_poeng?: number | null
          plassering?: number | null
          poeng_golf?: number | null
          poeng_kongelag?: number | null
          poeng_xkast?: number | null
          posisjon?: number | null
          runde_eliminert?: number | null
          score_poeng_innl?: number | null
          snc_plassering?: number | null
          startnummer?: number | null
          stevneid?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "resultat_gruppeid_fkey"
            columns: ["gruppeid"]
            isOneToOne: false
            referencedRelation: "gruppe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resultat_kasterid_fkey"
            columns: ["kasterid"]
            isOneToOne: false
            referencedRelation: "kaster"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resultat_klasseid_fkey"
            columns: ["klasseid"]
            isOneToOne: false
            referencedRelation: "klasse"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resultat_klubbid_fkey"
            columns: ["klubbid"]
            isOneToOne: false
            referencedRelation: "klubb"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resultat_stevneid_fkey"
            columns: ["stevneid"]
            isOneToOne: false
            referencedRelation: "stevne"
            referencedColumns: ["id"]
          },
        ]
      }
      stevne: {
        Row: {
          antall_runder_avsl: number | null
          antall_runder_innl: number | null
          avsluttendekastemetodeid: number | null
          dato: string
          er_snc_hovudstevne: boolean
          erekskludertfrarekorder: boolean
          erfullfort: boolean
          ernm: boolean
          ernorgesranking: boolean
          id: number
          innbydelseurl: string | null
          innledendekastemetodeid: number | null
          juryleder: string | null
          kategoriid: number | null
          klubbid: number | null
          kontaktkasterid: number | null
          navn: string
          resultaturl: string | null
          runde1_format: Json | null
          snc_hovudstevne_id: number | null
          sted: string | null
          stevne_fase: string | null
          stevnetypeid: number | null
          tid: string | null
          tilgjengelige_baner: number | null
        }
        Insert: {
          antall_runder_avsl?: number | null
          antall_runder_innl?: number | null
          avsluttendekastemetodeid?: number | null
          dato: string
          er_snc_hovudstevne?: boolean
          erekskludertfrarekorder?: boolean
          erfullfort?: boolean
          ernm?: boolean
          ernorgesranking?: boolean
          id?: number
          innbydelseurl?: string | null
          innledendekastemetodeid?: number | null
          juryleder?: string | null
          kategoriid?: number | null
          klubbid?: number | null
          kontaktkasterid?: number | null
          navn: string
          resultaturl?: string | null
          runde1_format?: Json | null
          snc_hovudstevne_id?: number | null
          sted?: string | null
          stevne_fase?: string | null
          stevnetypeid?: number | null
          tid?: string | null
          tilgjengelige_baner?: number | null
        }
        Update: {
          antall_runder_avsl?: number | null
          antall_runder_innl?: number | null
          avsluttendekastemetodeid?: number | null
          dato?: string
          er_snc_hovudstevne?: boolean
          erekskludertfrarekorder?: boolean
          erfullfort?: boolean
          ernm?: boolean
          ernorgesranking?: boolean
          id?: number
          innbydelseurl?: string | null
          innledendekastemetodeid?: number | null
          juryleder?: string | null
          kategoriid?: number | null
          klubbid?: number | null
          kontaktkasterid?: number | null
          navn?: string
          resultaturl?: string | null
          runde1_format?: Json | null
          snc_hovudstevne_id?: number | null
          sted?: string | null
          stevne_fase?: string | null
          stevnetypeid?: number | null
          tid?: string | null
          tilgjengelige_baner?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stevne_avsluttendekastemetodeid_fkey"
            columns: ["avsluttendekastemetodeid"]
            isOneToOne: false
            referencedRelation: "kastemetode"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stevne_innledendekastemetodeid_fkey"
            columns: ["innledendekastemetodeid"]
            isOneToOne: false
            referencedRelation: "kastemetode"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stevne_kategoriid_fkey"
            columns: ["kategoriid"]
            isOneToOne: false
            referencedRelation: "kategori"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stevne_klubbid_fkey"
            columns: ["klubbid"]
            isOneToOne: false
            referencedRelation: "klubb"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stevne_kontaktkasterid_fkey"
            columns: ["kontaktkasterid"]
            isOneToOne: false
            referencedRelation: "kaster"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stevne_snc_hovudstevne_id_fkey"
            columns: ["snc_hovudstevne_id"]
            isOneToOne: false
            referencedRelation: "stevne"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stevne_stevnetypeid_fkey"
            columns: ["stevnetypeid"]
            isOneToOne: false
            referencedRelation: "stevnetype"
            referencedColumns: ["id"]
          },
        ]
      }
      stevnetype: {
        Row: {
          beskrivelse: string | null
          eraktiv: boolean
          id: number
          navn: string
        }
        Insert: {
          beskrivelse?: string | null
          eraktiv?: boolean
          id?: number
          navn: string
        }
        Update: {
          beskrivelse?: string | null
          eraktiv?: boolean
          id?: number
          navn?: string
        }
        Relationships: []
      }
      xkast_kongelag: {
        Row: {
          bane_nummer: number | null
          er_bekreftet: boolean
          fase: string
          id: number
          pulje: number | null
          stevneid: number
        }
        Insert: {
          bane_nummer?: number | null
          er_bekreftet?: boolean
          fase: string
          id?: never
          pulje?: number | null
          stevneid: number
        }
        Update: {
          bane_nummer?: number | null
          er_bekreftet?: boolean
          fase?: string
          id?: never
          pulje?: number | null
          stevneid?: number
        }
        Relationships: [
          {
            foreignKeyName: "xkast_kongelag_stevneid_fkey"
            columns: ["stevneid"]
            isOneToOne: false
            referencedRelation: "stevne"
            referencedColumns: ["id"]
          },
        ]
      }
      xkast_kongelag_deltaker: {
        Row: {
          antall_ringer: number
          id: number
          kasterid: number
          poeng: number
          totalsum_manuelt: boolean
          xkast_kongelag_id: number
        }
        Insert: {
          antall_ringer?: number
          id?: never
          kasterid: number
          poeng?: number
          totalsum_manuelt?: boolean
          xkast_kongelag_id: number
        }
        Update: {
          antall_ringer?: number
          id?: never
          kasterid?: number
          poeng?: number
          totalsum_manuelt?: boolean
          xkast_kongelag_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "xkast_kongelag_deltaker_kasterid_fkey"
            columns: ["kasterid"]
            isOneToOne: false
            referencedRelation: "kaster"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xkast_kongelag_deltaker_xkast_kongelag_id_fkey"
            columns: ["xkast_kongelag_id"]
            isOneToOne: false
            referencedRelation: "xkast_kongelag"
            referencedColumns: ["id"]
          },
        ]
      }
      xkast_kongelag_omgang: {
        Row: {
          antall_ringer: number | null
          id: number
          omgang: number
          poeng: number
          registrert_at: string
          registrert_av: string | null
          xkast_kongelag_deltaker_id: number
        }
        Insert: {
          antall_ringer?: number | null
          id?: never
          omgang: number
          poeng: number
          registrert_at?: string
          registrert_av?: string | null
          xkast_kongelag_deltaker_id: number
        }
        Update: {
          antall_ringer?: number | null
          id?: never
          omgang?: number
          poeng?: number
          registrert_at?: string
          registrert_av?: string | null
          xkast_kongelag_deltaker_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "xkast_kongelag_omgang_deltaker_fkey"
            columns: ["xkast_kongelag_deltaker_id"]
            isOneToOne: false
            referencedRelation: "xkast_kongelag_deltaker"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      innledende_kamp_poeng: {
        Row: {
          kamp_poeng_innl: number | null
          kasterid: number | null
          score_poeng_innl: number | null
          stevneid: number | null
        }
        Relationships: [
          {
            foreignKeyName: "kamp_spelar_kasterid_fkey"
            columns: ["kasterid"]
            isOneToOne: false
            referencedRelation: "kaster"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kamp_stevneid_fkey"
            columns: ["stevneid"]
            isOneToOne: false
            referencedRelation: "stevne"
            referencedColumns: ["id"]
          },
        ]
      }
      kaster_rekorder: {
        Row: {
          ar: number | null
          etternavn: string | null
          fornavn: string | null
          kasterid: number | null
          kjonn_id: number | null
          kjonn_navn: string | null
          klubb_id: number | null
          klubb_navn: string | null
          metode: string | null
          poeng: number | null
          stevne_id: number | null
          stevne_navn: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _sync_xkast_kongelag_resultat: {
        Args: { p_xkast_kongelag_id: number }
        Returns: undefined
      }
      bekreft_avsluttende_kamp_deltakar: {
        Args: { p_eliminert_kasterid?: number; p_kamp_id: number }
        Returns: undefined
      }
      complete_snc_hovudstevne: {
        Args: { p_stevneid: number }
        Returns: undefined
      }
      complete_stevne: { Args: { p_stevneid: number }; Returns: undefined }
      confirm_xkast_kongelag: {
        Args: { p_xkast_kongelag_id: number }
        Returns: undefined
      }
      create_pair: {
        Args: { p_kaster_a: number; p_kaster_b: number; p_stevneid: number }
        Returns: undefined
      }
      edit_xkast_kongelag_omgang: {
        Args: {
          p_antall_ringer: number
          p_deltaker_id: number
          p_omgang: number
          p_poeng: number
        }
        Returns: undefined
      }
      er_kongelag_kastemetode: {
        Args: { p_kastemetodeid: number }
        Returns: boolean
      }
      er_xkast_kastemetode: {
        Args: { p_kastemetodeid: number }
        Returns: boolean
      }
      hent_bruker_epost: {
        Args: { bruker_ids: string[] }
        Returns: {
          epost: string
          id: string
        }[]
      }
      hent_kobla_kontoar: {
        Args: never
        Returns: {
          epost: string
          id: string
          opprettet_at: string
        }[]
      }
      insert_avsluttende_matches: { Args: { p_matches: Json }; Returns: number }
      min_rolle: { Args: never; Returns: string }
      reopen_snc_hovudstevne: {
        Args: { p_stevneid: number }
        Returns: undefined
      }
      reopen_stevne: { Args: { p_stevneid: number }; Returns: undefined }
      set_xkast_kongelag_total: {
        Args: {
          p_antall_ringer: number
          p_deltaker_id: number
          p_poeng: number
        }
        Returns: undefined
      }
      slett_brukarkonto: { Args: { target_id: string }; Returns: undefined }
      snc_kan_konsolidere: { Args: { p_stevneid: number }; Returns: boolean }
      stevne_is_completed: { Args: { p_stevneid: number }; Returns: boolean }
      swap_xkast_kongelag_deltaker: {
        Args: { p_deltaker_a: number; p_deltaker_b: number }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
