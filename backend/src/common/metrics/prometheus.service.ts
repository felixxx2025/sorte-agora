import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { Counter, Histogram, Registry, Gauge } from "prom-client";

@Injectable()
export class PrometheusService implements OnModuleDestroy {
  private register: Registry;

  // Contadores de negócio
  private userRegistrations: Counter<string>;
  private userLogins: Counter<string>;
  private deposits: Counter<string>;
  private withdrawals: Counter<string>;
  private betsPlaced: Counter<string>;
  private gamesPlayed: Counter<string>;

  // Histogramas de latência
  private httpRequestDuration: Histogram<string>;
  private dbQueryDuration: Histogram<string>;

  // Gauges de estado
  private activeUsers: Gauge<string>;
  private totalBalance: Gauge<string>;

  constructor() {
    this.register = new Registry();

    // Inicializar métricas de negócio
    this.userRegistrations = new Counter({
      name: "user_registrations_total",
      help: "Total de novos registros de usuários",
      labelNames: ["currency"],
      registers: [this.register],
    });

    this.userLogins = new Counter({
      name: "user_logins_total",
      help: "Total de logins de usuários",
      labelNames: ["status"],
      registers: [this.register],
    });

    this.deposits = new Counter({
      name: "deposits_total",
      help: "Total de depósitos",
      labelNames: ["status", "method"],
      registers: [this.register],
    });

    this.withdrawals = new Counter({
      name: "withdrawals_total",
      help: "Total de saques",
      labelNames: ["status", "method"],
      registers: [this.register],
    });

    this.betsPlaced = new Counter({
      name: "bets_placed_total",
      help: "Total de apostas realizadas",
      labelNames: ["type", "status"],
      registers: [this.register],
    });

    this.gamesPlayed = new Counter({
      name: "games_played_total",
      help: "Total de jogos jogados",
      labelNames: ["category", "provider"],
      registers: [this.register],
    });

    // Inicializar histogramas
    this.httpRequestDuration = new Histogram({
      name: "http_request_duration_seconds",
      help: "Duração das requisições HTTP",
      labelNames: ["method", "route", "status_code"],
      buckets: [0.1, 0.5, 1, 2, 5, 10],
      registers: [this.register],
    });

    this.dbQueryDuration = new Histogram({
      name: "db_query_duration_seconds",
      help: "Duração das queries de banco de dados",
      labelNames: ["operation", "table"],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2],
      registers: [this.register],
    });

    // Inicializar gauges
    this.activeUsers = new Gauge({
      name: "active_users",
      help: "Número de usuários ativos",
      registers: [this.register],
    });

    this.totalBalance = new Gauge({
      name: "total_balance",
      help: "Saldo total de todos os usuários",
      labelNames: ["currency"],
      registers: [this.register],
    });
  }

  // Métodos para incrementar contadores
  incrementUserRegistrations(currency: string = "BRL") {
    this.userRegistrations.inc({ currency });
  }

  incrementUserLogins(status: "success" | "failed") {
    this.userLogins.inc({ status });
  }

  incrementDeposits(status: string, method: string = "PIX") {
    this.deposits.inc({ status, method });
  }

  incrementWithdrawals(status: string, method: string = "PIX") {
    this.withdrawals.inc({ status, method });
  }

  incrementBetsPlaced(type: string, status: string) {
    this.betsPlaced.inc({ type, status });
  }

  incrementGamesPlayed(category: string, provider: string) {
    this.gamesPlayed.inc({ category, provider });
  }

  // Métodos para histogramas
  observeHttpRequestDuration(
    method: string,
    route: string,
    statusCode: number,
    duration: number,
  ) {
    this.httpRequestDuration.observe(
      { method, route, status_code: statusCode.toString() },
      duration,
    );
  }

  observeDbQueryDuration(operation: string, table: string, duration: number) {
    this.dbQueryDuration.observe({ operation, table }, duration);
  }

  // Métodos para gauges
  setActiveUsers(count: number) {
    this.activeUsers.set(count);
  }

  setTotalBalance(amount: number, currency: string = "BRL") {
    this.totalBalance.set({ currency }, amount);
  }

  // Endpoint de métricas
  async getMetrics(): Promise<string> {
    return await this.register.metrics();
  }

  onModuleDestroy() {
    this.register.clear();
  }
}
