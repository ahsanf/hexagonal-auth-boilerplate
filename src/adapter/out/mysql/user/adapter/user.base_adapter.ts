import { Filter } from "@domain/filter"
import { Stats } from "@domain/stats"
import { User } from "@domain/user"

export interface IUserSqlAdapter {
  getAll(currentPage?: number, perPage?: number, filter?: Filter, traceId?: string): Promise<{ data: User[], stats: Stats}>
  getById(id: number, traceId?: string): Promise<User | null>
  create(data: User, traceId?: string): Promise<User>
  update(id: number, data: Partial<User>, traceId?: string): Promise<Partial<User> | null>
  delete(id: number, traceId?: string): Promise<boolean>

  getByUsernameOrEmail(usernameOrEmail:  string, traceId?: string): Promise<User | null>
}