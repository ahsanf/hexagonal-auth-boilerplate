import { logger } from "@logger";
import { IUserSqlRepository as IUserSqlRepository } from "../repository/user.base_repository";
import { UserSqlRepository } from "../repository/user.repository";
import { IUserSqlAdapter as IUserSqlAdapter } from "./user.base_adapter";
import { Filter } from "@domain/filter";
import { User } from "@domain/user";
import { toDomain, toEntity, toPartialDomain, toPartialEntity } from "../util/user.converter";
import { Stats } from "@domain/stats";

export class UserSqlAdapter implements IUserSqlAdapter {
  private userSqlRepository: IUserSqlRepository

  constructor(){
    this.userSqlRepository = new UserSqlRepository();
  }
  async getAll(currentPage?: number, perPage?: number, filter?: Filter, traceId?: string): Promise<{ data: User[]; stats: Stats; }> {
    logger.info(this.getAll.name, UserSqlAdapter.name, traceId);
    const { data, stats } = await this.userSqlRepository.getAll(currentPage, perPage, filter, traceId);

    return {
      data: data.map((user) => toDomain(user)),
      stats,
    }
  }
  
  async getById(id: number, traceId?: string): Promise<User | null> {
    logger.info(this.getById.name, UserSqlAdapter.name, traceId);
    const user = await this.userSqlRepository.getById(id, traceId);
    if (!user) return null;

    return toDomain(user);
  }
  
  async create(data: User, traceId?: string): Promise<User> {
    logger.info(this.create.name, UserSqlAdapter.name, traceId);
    return toDomain(await this.userSqlRepository.create(toEntity(data), traceId));
  }
  
  async update(id: number, data: Partial<User>, traceId?: string): Promise<Partial<User> | null> {
    logger.info(this.update.name, UserSqlAdapter.name, traceId);
    const user = await this.userSqlRepository.update(id, toPartialEntity(data), traceId);
    if (!user) return null;

    return toPartialDomain(user);
  }
  
  async delete(id: number, traceId?: string): Promise<boolean> {
    logger.info(this.delete.name, UserSqlAdapter.name, traceId);
    return await this.userSqlRepository.delete(id, traceId);
  }

  async getByUsernameOrEmail(usernameOrEmail:  string, traceId?: string): Promise<User | null> {
    logger.info(this.getByUsernameOrEmail.name, UserSqlAdapter.name, traceId);
    const user = await this.userSqlRepository.getByUsernameOrEmail(usernameOrEmail, traceId);
    if (!user) return null;

    return toDomain(user);
  }
  
}