


import { getPostgresClient } from "@util/postgres/postgres";

import { Knex } from "knex";
import { Filter } from "@domain/filter";
import { logger } from "@logger";
import { Stats } from "@domain/stats";
import { IRefreshTokenSqlRepository } from "./refresh_token.base_repository";
import { RefreshTokenSqlEntity } from "../entity/refresh_token_sql.entity";
import { TABLE_NAME } from "@domain/constant";
import { getMysqlClient } from "@mysql";

export class RefreshTokenSqlRepository implements IRefreshTokenSqlRepository { 
  private readonly orm: Knex.QueryBuilder<RefreshTokenSqlEntity, RefreshTokenSqlEntity[]>;
  private readonly tableName: string = TABLE_NAME.REFRESH_TOKENS;

  constructor() {
    this.orm = getMysqlClient()<RefreshTokenSqlEntity>(this.tableName)
  }
  
  private applyFilters(builder: Knex.QueryBuilder<RefreshTokenSqlEntity, RefreshTokenSqlEntity[]>, filter?: Filter) {
    if (filter?.query) {
      builder.whereILike("name", `%${filter.query}%`);
    }

  }
  
  async getAll(currentPage: number = 1, perPage: number = 10, filter?: Filter, traceId?: string):  Promise<{ data: RefreshTokenSqlEntity[], stats: Stats }>{
    logger.info(this.getAll.name, RefreshTokenSqlRepository.name, traceId);
    
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

  async getById(id: number, traceId?: string): Promise<RefreshTokenSqlEntity | null> {
    logger.info(this.getById.name, RefreshTokenSqlRepository.name, traceId);
  
    return this.orm
      .clone()
      .where({ id })
      .first()
      .then((result) => result ?? null);
  }

  async getByUserId(userId: number, traceId?: string): Promise<RefreshTokenSqlEntity | null> {
    logger.info(this.getByUserId.name, RefreshTokenSqlRepository.name, traceId);
  
    return this.orm
      .clone()
      .where({ user_id: userId })
      .first()
      .then((result) => result ?? null);
  }

  async getByToken(token: string, traceId?: string): Promise<RefreshTokenSqlEntity | null> {
    logger.info(this.getByToken.name, RefreshTokenSqlRepository.name, traceId);
  
    return this.orm
      .clone()
      .where({ token })
      .first()
      .then((result) => result ?? null);
  }
  
  async create(data: RefreshTokenSqlEntity, traceId?: string): Promise<RefreshTokenSqlEntity> {
    logger.info(this.create.name, RefreshTokenSqlRepository.name, traceId);
  
    const connection = await this.orm.client.acquireConnection();
    
    try {
      const promiseConnection = connection.promise();
      
      const [insertResult] = await promiseConnection.query(
        'INSERT INTO ?? SET ?', 
        [this.tableName, data]
      );
      
      const [rows] = await promiseConnection.query(
        'SELECT * FROM ?? WHERE id = ?', 
        [this.tableName, insertResult.insertId]
      );
        [insertResult.insertId]
      
      
      const created = rows[0];
      
      if (!created) {
        throw new Error('Failed to create user');
      }

      return created;
    } finally {
      this.orm.client.releaseConnection(connection);
    }
  }
  
  async update(id: number, data: Partial<RefreshTokenSqlEntity>, traceId?: string): Promise<RefreshTokenSqlEntity | null> {
    logger.info(this.update.name, RefreshTokenSqlRepository.name, traceId);
  
    await this.orm
      .clone()
      .where({ id })
      .update(data);

    return this.getById(id, traceId);
  }
  
  async delete(id: number, traceId?: string): Promise<boolean> {
    logger.info(this.delete.name, RefreshTokenSqlRepository.name, traceId);
  
    const deletedCount = await this.orm
      .clone()
      .where({ id })
      .delete();
  
    return deletedCount > 0;
  }
}