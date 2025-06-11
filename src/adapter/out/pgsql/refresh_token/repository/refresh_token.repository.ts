


import { getPostgresClient } from "@util/postgres/postgres";

import { Knex } from "knex";
import { Filter } from "@domain/filter";
import { logger } from "@logger";
import { Stats } from "@domain/stats";
import { IRefreshTokenPgRepository } from "./refresh_token.base_repository";
import { RefreshTokenPgEntity } from "../entity/refresh_token_pg.entity";
import { TABLE_NAME } from "@domain/constant";

export class RefreshTokenPgRepository implements IRefreshTokenPgRepository { 
  private readonly orm: Knex.QueryBuilder<RefreshTokenPgEntity, RefreshTokenPgEntity[]>;
  
  constructor() {
    this.orm = getPostgresClient()<RefreshTokenPgEntity>(TABLE_NAME.REFRESH_TOKENS)
  }
  
  private applyFilters(builder: Knex.QueryBuilder<RefreshTokenPgEntity, RefreshTokenPgEntity[]>, filter?: Filter) {
    if (filter?.query) {
      builder.whereILike("name", `%${filter.query}%`);
    }

  }
  
  async getAll(currentPage: number = 1, perPage: number = 10, filter?: Filter, traceId?: string):  Promise<{ data: RefreshTokenPgEntity[], stats: Stats }>{
    logger.info(this.getAll.name, RefreshTokenPgRepository.name, traceId);
    
    const offset = (currentPage - 1) * perPage;

    const baseQuery = this.orm.clone().where((builder) => {
      this.applyFilters(builder, filter);
    });

    const [data, countResult] = await Promise.all([
      baseQuery.clone().offset(offset).limit(perPage),
      baseQuery.clone().clearSelect().count<{ count: string }>("* as count").first(),
    ]);

    const totalData = parseInt(countResult?.count ?? "0", 10);
    const totalPage = Math.ceil(totalData / perPage);

    return {
      data,
      stats: {
        totalData,
        currentPage,
        totalPage,
        perPage,
      },
    };
  
  }

  async getById(id: number, traceId?: string): Promise<RefreshTokenPgEntity | null> {
    logger.info(this.getById.name, RefreshTokenPgRepository.name, traceId);
  
    return this.orm
      .clone()
      .where({ id })
      .first()
      .then((result) => result ?? null);
  }
  
  async create(data: RefreshTokenPgEntity, traceId?: string): Promise<RefreshTokenPgEntity> {
    logger.info(this.create.name, RefreshTokenPgRepository.name, traceId);
  
    const [created] = await this.orm
      .clone()
      .insert(data)
      .returning("*");
  
    return created;
  }
  
  async update(id: number, data: Partial<RefreshTokenPgEntity>, traceId?: string): Promise<RefreshTokenPgEntity | null> {
    logger.info(this.update.name, RefreshTokenPgRepository.name, traceId);
  
    const [updated] = await this.orm
      .clone()
      .where({ id })
      .update(data)
      .returning("*");
  
    return updated ?? null;
  }
  
  async delete(id: number, traceId?: string): Promise<boolean> {
    logger.info(this.delete.name, RefreshTokenPgRepository.name, traceId);
  
    const deletedCount = await this.orm
      .clone()
      .where({ id })
      .delete();
  
    return deletedCount > 0;
  }
}