import { Filter } from "@domain/filter"
import { UserSqlEntity } from "../entity/user_pg.entity"
import { Stats } from "@domain/stats"

export interface IUserPgRepository {
  getAll(currentPage?: number, perPage?: number, filter?: Filter, traceId?: string): Promise<{ data: UserSqlEntity[], stats: Stats}>
  getById(id: number, traceId?: string): Promise<UserSqlEntity | null>
  create(data: UserSqlEntity, traceId?: string): Promise<UserSqlEntity>
  update(id: number, data: Partial<UserSqlEntity>, traceId?: string): Promise<Partial<UserSqlEntity> | null>
  delete(id: number, traceId?: string): Promise<boolean>
}