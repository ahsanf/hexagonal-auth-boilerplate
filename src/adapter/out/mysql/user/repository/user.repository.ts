


import { getPostgresClient } from "@util/postgres/postgres";

import { Knex } from "knex";
import { UserSqlEntity } from "../entity/user_pg.entity";
import { Filter } from "@domain/filter";
import { logger } from "@logger";
import { IUserPgRepository } from "./user.base_repository";
import { Stats } from "@domain/stats";
import { TABLE_NAME } from "@domain/constant";
import { getMysqlClient } from "@mysql";

export class UserPgRepository implements IUserPgRepository { 
  private readonly orm: Knex.QueryBuilder<UserSqlEntity, UserSqlEntity[]>;
  
  constructor() {
    this.orm = getMysqlClient()<UserSqlEntity>(TABLE_NAME.USERS)
  }
  
  private applyFilters(builder: Knex.QueryBuilder<UserSqlEntity, UserSqlEntity[]>, filter?: Filter) {
    if (filter?.query) {
      builder.whereILike("name", `%${filter.query}%`);
    }

  }
  
  async getAll(currentPage: number = 1, perPage: number = 10, filter?: Filter, traceId?: string):  Promise<{ data: UserSqlEntity[], stats: Stats }>{
    logger.info(this.getAll.name, UserPgRepository.name, traceId);
    
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

  async getById(id: number, traceId?: string): Promise<UserSqlEntity | null> {
    logger.info(this.getById.name, UserPgRepository.name, traceId);
  
    return this.orm
      .clone()
      .where({ id })
      .first()
      .then((result) => result ?? null);
  }
  
  async create(data: UserSqlEntity, traceId?: string): Promise<UserSqlEntity> {
    logger.info(this.create.name, UserPgRepository.name, traceId);
  
    const [created] = await this.orm
      .clone()
      .insert(data)
      .returning("*");
  
    return created;
  }
  
  async update(id: number, data: Partial<UserSqlEntity>, traceId?: string): Promise<UserSqlEntity | null> {
    logger.info(this.update.name, UserPgRepository.name, traceId);
  
    const [updated] = await this.orm
      .clone()
      .where({ id })
      .update(data)
      .returning("*");
  
    return updated ?? null;
  }
  
  async delete(id: number, traceId?: string): Promise<boolean> {
    logger.info(this.delete.name, UserPgRepository.name, traceId);
  
    const deletedCount = await this.orm
      .clone()
      .where({ id })
      .delete();
  
    return deletedCount > 0;
  }
}