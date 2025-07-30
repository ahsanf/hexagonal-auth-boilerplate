import { RefreshToken } from "@domain/refresh_token";
import { RefreshTokenSqlEntity } from "../entity/refresh_token_sql.entity";

export const toDomain = (entity: RefreshTokenSqlEntity): RefreshToken => {
  return {
    id: entity.id,
    userId: entity.user_id,
    token: entity.token,
    userAgent: entity.user_agent,
    ipAddress: entity.ip_address,
    macAddress: entity.mac_address,
    expiredAt: entity.expired_at,
    createdAt: entity.created_at,
    updatedAt: entity.updated_at
  };
}

export const toEntity = (domain: RefreshToken): RefreshTokenSqlEntity => {
  return {
    id: domain.id,
    user_id: domain.userId,
    token: domain.token,
    user_agent: domain.userAgent,
    ip_address: domain.ipAddress,
    mac_address: domain.macAddress,
    expired_at: domain.expiredAt,
    created_at: domain.createdAt,
    updated_at: domain.updatedAt
  };
};

export const toPartialEntity = (domain: Partial<RefreshToken>): Partial<RefreshTokenSqlEntity> => {
  return {
    id: domain.id,
    user_id: domain.userId,
    token: domain.token,
    user_agent: domain.userAgent,
    ip_address: domain.ipAddress,
    mac_address: domain.macAddress,
    expired_at: domain.expiredAt,
    created_at: domain.createdAt,
    updated_at: domain.updatedAt
  };
};

export const toPartialDomain = (entity: Partial<RefreshTokenSqlEntity>): Partial<RefreshToken> => {
  return {
    id: entity.id,
    userId: entity.user_id,
    token: entity.token,
    userAgent: entity.user_agent,
    ipAddress: entity.ip_address,
    macAddress: entity.mac_address,
    expiredAt: entity.expired_at,
    createdAt: entity.created_at,
    updatedAt: entity.updated_at
  };
};