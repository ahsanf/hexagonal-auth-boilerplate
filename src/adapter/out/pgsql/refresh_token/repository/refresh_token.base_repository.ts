import { Filter } from "@domain/filter"
import { Stats } from "@domain/stats"
import { RefreshTokenPgEntity } from "../entity/refresh_token_pg.entity"

export interface IRefreshTokenPgRepository {
  getAll(currentPage?: number, perPage?: number, filter?: Filter, traceId?: string): Promise<{ data: RefreshTokenPgEntity[], stats: Stats}>
  getById(id: number, traceId?: string): Promise<RefreshTokenPgEntity | null>
  create(data: RefreshTokenPgEntity, traceId?: string): Promise<RefreshTokenPgEntity>
  update(id: number, data: Partial<RefreshTokenPgEntity>, traceId?: string): Promise<Partial<RefreshTokenPgEntity> | null>
  delete(id: number, traceId?: string): Promise<boolean>
}