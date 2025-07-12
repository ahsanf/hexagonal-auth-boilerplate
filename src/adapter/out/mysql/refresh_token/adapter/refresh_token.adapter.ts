import { logger } from "@logger";
import { Filter } from "@domain/filter";
import { RefreshToken } from "@domain/refresh_token";
import { toDomain, toEntity, toPartialDomain, toPartialEntity } from "../util/refresh_token.converter";
import { Stats } from "@domain/stats";
import { IRefreshTokenPgAdapter } from "./refresh_token.base_adapter";
import { IRefreshTokenPgRepository } from "../repository/refresh_token.base_repository";
import { RefreshTokenPgRepository } from "../repository/refresh_token.repository";

export class RefreshTokenPgAdapter implements IRefreshTokenPgAdapter {
  private refreshTokenPgRepository: IRefreshTokenPgRepository

  constructor(){
    this.refreshTokenPgRepository = new RefreshTokenPgRepository();
  }
  async getAll(currentPage?: number, perPage?: number, filter?: Filter, traceId?: string): Promise<{ data: RefreshToken[]; stats: Stats; }> {
    logger.info(this.getAll.name, RefreshTokenPgAdapter.name, traceId);
    const { data, stats } = await this.refreshTokenPgRepository.getAll(currentPage, perPage, filter, traceId);

    return {
      data: data.map((refreshToken) => toDomain(refreshToken)),
      stats,
    }
  }
  
  async getById(id: number, traceId?: string): Promise<RefreshToken | null> {
    logger.info(this.getById.name, RefreshTokenPgAdapter.name, traceId);
    const refreshToken = await this.refreshTokenPgRepository.getById(id, traceId);
    if (!refreshToken) return null;

    return toDomain(refreshToken);
  }
  
  async create(data: RefreshToken, traceId?: string): Promise<RefreshToken> {
    logger.info(this.create.name, RefreshTokenPgAdapter.name, traceId);
    return toDomain(await this.refreshTokenPgRepository.create(toEntity(data), traceId));
  }
  
  async update(id: number, data: Partial<RefreshToken>, traceId?: string): Promise<Partial<RefreshToken> | null> {
    logger.info(this.update.name, RefreshTokenPgAdapter.name, traceId);
    const refreshToken = await this.refreshTokenPgRepository.update(id, toPartialEntity(data), traceId);
    if (!refreshToken) return null;

    return toPartialDomain(refreshToken);
  }
  
  async delete(id: number, traceId?: string): Promise<boolean> {
    logger.info(this.delete.name, RefreshTokenPgAdapter.name, traceId);
    return await this.refreshTokenPgRepository.delete(id, traceId);
  }
  
}