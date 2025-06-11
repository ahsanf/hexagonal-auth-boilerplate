import { Filter } from "@domain/filter"
import { UserPgEntity } from "../entity/user_pg.entity"
import { Stats } from "@domain/stats"

export interface IUserPgRepository {
  getAll(currentPage?: number, perPage?: number, filter?: Filter, traceId?: string): Promise<{ data: UserPgEntity[], stats: Stats}>
  getById(id: number, traceId?: string): Promise<UserPgEntity | null>
  create(data: UserPgEntity, traceId?: string): Promise<UserPgEntity>
  update(id: number, data: Partial<UserPgEntity>, traceId?: string): Promise<Partial<UserPgEntity> | null>
  delete(id: number, traceId?: string): Promise<boolean>
}