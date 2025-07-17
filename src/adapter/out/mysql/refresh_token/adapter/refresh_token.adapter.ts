import { logger } from "@logger";
import { Filter } from "@domain/filter";
import { RefreshToken } from "@domain/refresh_token";
import { toDomain, toEntity, toPartialDomain, toPartialEntity } from "../util/refresh_token.converter";
import { Stats } from "@domain/stats";
import { IRefreshTokenSqlAdapter } from "./refresh_token.base_adapter";
import { IRefreshTokenSqlRepository } from "../repository/refresh_token.base_repository";
import { RefreshTokenSqlRepository } from "../repository/refresh_token.repository";

export class RefreshTokenSqlAdapter implements IRefreshTokenSqlAdapter {
  private refreshTokenPgRepository: IRefreshTokenSqlRepository

  constructor(){
    this.refreshTokenPgRepository = new RefreshTokenSqlRepository();
  }

  async getAll(currentPage?: number, perPage?: number, filter?: Filter, traceId?: string): Promise<{ data: RefreshToken[]; stats: Stats; }> {
    logger.info(this.getAll.name, RefreshTokenSqlAdapter.name, traceId);
    const { data, stats } = await this.refreshTokenPgRepository.getAll(currentPage, perPage, filter, traceId);

    return {
      data: data.map((refreshToken) => toDomain(refreshToken)),
      stats,
    }
  }

  async getByUserId(userId: number, traceId?: string): Promise<RefreshToken | null> {
    logger.info(this.getByUserId.name, RefreshTokenSqlAdapter.name, traceId);
    const refreshToken = await this.refreshTokenPgRepository.getByUserId(userId, traceId);
    if (!refreshToken) return null;

    return toDomain(refreshToken);
  }

  async getByToken(token: string, traceId?: string): Promise<RefreshToken | null> {
    logger.info(this.getByToken.name, RefreshTokenSqlAdapter.name, traceId);
    const refreshToken = await this.refreshTokenPgRepository.getByToken(token, traceId);
    if (!refreshToken) return null;

    return toDomain(refreshToken);
  }
  
  async getById(id: number, traceId?: string): Promise<RefreshToken | null> {
    logger.info(this.getById.name, RefreshTokenSqlAdapter.name, traceId);
    const refreshToken = await this.refreshTokenPgRepository.getById(id, traceId);
    if (!refreshToken) return null;

    return toDomain(refreshToken);
  }
  
  async create(data: RefreshToken, traceId?: string): Promise<RefreshToken> {
    logger.info(this.create.name, RefreshTokenSqlAdapter.name, traceId);
    return toDomain(await this.refreshTokenPgRepository.create(toEntity(data), traceId));
  }
  
  async update(id: number, data: Partial<RefreshToken>, traceId?: string): Promise<Partial<RefreshToken> | null> {
    logger.info(this.update.name, RefreshTokenSqlAdapter.name, traceId);
    const refreshToken = await this.refreshTokenPgRepository.update(id, toPartialEntity(data), traceId);
    if (!refreshToken) return null;

    return toPartialDomain(refreshToken);
  }
  
  async delete(id: number, traceId?: string): Promise<boolean> {
    logger.info(this.delete.name, RefreshTokenSqlAdapter.name, traceId);
    return await this.refreshTokenPgRepository.delete(id, traceId);
  }
  
}