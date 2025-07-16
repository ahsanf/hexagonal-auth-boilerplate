import { User } from "@domain/user";
import { UserSqlEntity } from "../entity/user_sql.entity";

export const toDomain = (entity: UserSqlEntity): User => {
  return {
    id: entity.id,
    name: entity.name,
    email: entity.email,
    password: entity.password,
    phone: entity.phone,
    address: entity.address,
    lang: entity.lang,
    imageUrl: entity.image_url,
    isActive: entity.is_active,
    roles: entity.roles ? entity.roles : [],
    lastLogin: entity.last_login,
    lastPasswordChange: entity.last_password_change,
    emailVerified: entity.email_verified,
    refreshToken: entity.refresh_token,
    googleId: entity.google_id,
    createdAt: entity.created_at,
    updatedAt: entity.updated_at,
  };
}

export const toEntity = (domain: User): UserSqlEntity => {
  return {
    id: domain.id,
    name: domain.name,
    email: domain.email,
    password: domain.password,
    phone: domain.phone,
    address: domain.address,
    lang: domain.lang,
    image_url: domain.imageUrl,
    is_active: domain.isActive,
    roles: domain.roles ? domain.roles : [],
    last_login: domain.lastLogin,
    last_password_change: domain.lastPasswordChange,
    email_verified: domain.emailVerified,
    refresh_token: domain.refreshToken,
    google_id: domain.googleId,
    created_at: domain.createdAt,
    updated_at: domain.updatedAt,
  };
}

export const toPartialDomain = (entity: Partial<UserSqlEntity>): Partial<User> => {
  return {
    id: entity.id,
    name: entity.name,
    email: entity.email,
    password: entity.password,
    phone: entity.phone,
    address: entity.address,
    lang: entity.lang,
    imageUrl: entity.image_url,
    isActive: entity.is_active,
    roles: entity.roles ? entity.roles : [],
    lastLogin: entity.last_login,
    lastPasswordChange: entity.last_password_change,
    emailVerified: entity.email_verified,
    refreshToken: entity.refresh_token,
    googleId: entity.google_id,
    createdAt: entity.created_at,
    updatedAt: entity.updated_at,
  };
}

export const toPartialEntity = (domain: Partial<User>): Partial<UserSqlEntity> => {
  return {
    id: domain.id,
    name: domain.name,
    email: domain.email,
    password: domain.password,
    phone: domain.phone,
    address: domain.address,
    lang: domain.lang,
    image_url: domain.imageUrl,
    is_active: domain.isActive,
    roles: domain.roles ? domain.roles : [],
    last_login: domain.lastLogin,
    last_password_change: domain.lastPasswordChange,
    email_verified: domain.emailVerified,
    refresh_token: domain.refreshToken,
    google_id: domain.googleId,
    created_at: domain.createdAt,
    updated_at: domain.updatedAt,
  };
}