export interface OddsQuote {
  externalSelectionId?: string;
  selectionId?: string;
  odds: number;
}

export interface OddsProvider {
  readonly name: string;
  /** Retorna cotações externas; vazio se feed desligado */
  fetchQuotes(): Promise<OddsQuote[]>;
}

export const ODDS_PROVIDER = Symbol("ODDS_PROVIDER");
