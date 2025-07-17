import { Filter } from "@domain/filter"
import { Stats } from "@domain/stats"
import { RefreshTokenSqlEntity } from "../entity/refresh_token_sql.entity"

export interface IRefreshTokenSqlRepository {
  getAll(currentPage?: number, perPage?: number, filter?: Filter, traceId?: string): Promise<{ data: RefreshTokenSqlEntity[], stats: Stats}>
  getById(id: number, traceId?: string): Promise<RefreshTokenSqlEntity | null>
  create(data: RefreshTokenSqlEntity, traceId?: string): Promise<RefreshTokenSqlEntity>
  update(id: number, data: Partial<RefreshTokenSqlEntity>, traceId?: string): Promise<Partial<RefreshTokenSqlEntity> | null>
  delete(id: number, traceId?: string): Promise<boolean>

  getByUserId(userId: number, traceId?: string): Promise<RefreshTokenSqlEntity | null>
  getByToken(token: string, traceId?: string): Promise<RefreshTokenSqlEntity | null>
  
}