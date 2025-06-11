import { RefreshToken } from "@domain/refresh_token";
import { RefreshTokenPgEntity } from "../entity/refresh_token_pg.entity";

export const toDomain = (entity: RefreshTokenPgEntity): RefreshToken => {
  return {
    id: entity.id,
    userId: entity.user_id,
    token: entity.token,
    userAgent: entity.user_agent,
    ipAddress: entity.ip_address,
    expiredAt: entity.expired_at,
    createdAt: entity.created_at,
    updatedAt: entity.updated_at
  };
}

export const toEntity = (domain: RefreshToken): RefreshTokenPgEntity => {
  return {
    id: domain.id,
    user_id: domain.userId,
    token: domain.token,
    user_agent: domain.userAgent,
    ip_address: domain.ipAddress,
    expired_at: domain.expiredAt,
    created_at: domain.createdAt,
    updated_at: domain.updatedAt
  };
};

export const toPartialEntity = (domain: Partial<RefreshToken>): Partial<RefreshTokenPgEntity> => {
  return {
    id: domain.id,
    user_id: domain.userId,
    token: domain.token,
    user_agent: domain.userAgent,
    ip_address: domain.ipAddress,
    expired_at: domain.expiredAt,
    created_at: domain.createdAt,
    updated_at: domain.updatedAt
  };
};

export const toPartialDomain = (entity: Partial<RefreshTokenPgEntity>): Partial<RefreshToken> => {
  return {
    id: entity.id,
    userId: entity.user_id,
    token: entity.token,
    userAgent: entity.user_agent,
    ipAddress: entity.ip_address,
    expiredAt: entity.expired_at,
    createdAt: entity.created_at,
    updatedAt: entity.updated_at
  };
};