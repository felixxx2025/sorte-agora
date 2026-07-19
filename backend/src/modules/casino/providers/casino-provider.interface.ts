export interface CasinoLaunchRequest {
  game: {
    id: string;
    name: string;
    provider: string;
    providerGameId: string;
  };
  sessionToken: string;
  userId: string;
}

export interface CasinoLaunchResult {
  gameUrl: string;
  mode: string;
}

export interface CasinoProvider {
  readonly name: string;
  launch(request: CasinoLaunchRequest): Promise<CasinoLaunchResult>;
}

export const CASINO_PROVIDER = Symbol('CASINO_PROVIDER');
