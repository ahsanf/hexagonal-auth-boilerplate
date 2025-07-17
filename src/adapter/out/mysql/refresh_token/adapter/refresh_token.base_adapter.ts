import { Filter } from "@domain/filter"
import { RefreshToken } from "@domain/refresh_token"
import { Stats } from "@domain/stats"

export interface IRefreshTokenSqlAdapter {
  getAll(currentPage?: number, perPage?: number, filter?: Filter, traceId?: string): Promise<{ data: RefreshToken[], stats: Stats}>
  getById(id: number, traceId?: string): Promise<RefreshToken | null>
  create(data: RefreshToken, traceId?: string): Promise<RefreshToken>
  update(id: number, data: Partial<RefreshToken>, traceId?: string): Promise<Partial<RefreshToken> | null>
  delete(id: number, traceId?: string): Promise<boolean>

  getByUserId(userId: number, traceId?: string): Promise<RefreshToken | null>
  getByToken(token: string, traceId?: string): Promise<RefreshToken | null>
}