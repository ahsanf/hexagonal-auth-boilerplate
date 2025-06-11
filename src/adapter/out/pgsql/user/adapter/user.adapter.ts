import { logger } from "@logger";
import { IUserPgRepository } from "../repository/user.base_repository";
import { UserPgRepository } from "../repository/user.repository";
import { IUserPgAdapter } from "./user.base_adapter";
import { Filter } from "@domain/filter";
import { User } from "@domain/user";
import { toDomain, toEntity, toPartialDomain, toPartialEntity } from "../util/user.converter";
import { Stats } from "@domain/stats";

export class UserPgAdapter implements IUserPgAdapter {
  private userPgRepository: IUserPgRepository

  constructor(){
    this.userPgRepository = new UserPgRepository();
  }
  async getAll(currentPage?: number, perPage?: number, filter?: Filter, traceId?: string): Promise<{ data: User[]; stats: Stats; }> {
    logger.info(this.getAll.name, UserPgAdapter.name, traceId);
    const { data, stats } = await this.userPgRepository.getAll(currentPage, perPage, filter, traceId);

    return {
      data: data.map((user) => toDomain(user)),
      stats,
    }
  }
  
  async getById(id: number, traceId?: string): Promise<User | null> {
    logger.info(this.getById.name, UserPgAdapter.name, traceId);
    const user = await this.userPgRepository.getById(id, traceId);
    if (!user) return null;

    return toDomain(user);
  }
  
  async create(data: User, traceId?: string): Promise<User> {
    logger.info(this.create.name, UserPgAdapter.name, traceId);
    return toDomain(await this.userPgRepository.create(toEntity(data), traceId));
  }
  
  async update(id: number, data: Partial<User>, traceId?: string): Promise<Partial<User> | null> {
    logger.info(this.update.name, UserPgAdapter.name, traceId);
    const user = await this.userPgRepository.update(id, toPartialEntity(data), traceId);
    if (!user) return null;

    return toPartialDomain(user);
  }
  
  async delete(id: number, traceId?: string): Promise<boolean> {
    logger.info(this.delete.name, UserPgAdapter.name, traceId);
    return await this.userPgRepository.delete(id, traceId);
  }
  
}