import { Knex } from "knex";
import { UserSqlEntity } from "../entity/user_sql.entity";
import { Filter } from "@domain/filter";
import { logger } from "@logger";
import { IUserSqlRepository } from "./user.base_repository";
import { Stats } from "@domain/stats";
import { TABLE_NAME } from "@domain/constant";
import { getMysqlClient } from "@mysql";
import { removeUndefinedField } from "@util/converter/global_converter";
import { ApplicationError } from "@util/error/application_error";
import { HttpError } from "@util/error/type/http_error";

export class UserSqlRepository implements IUserSqlRepository { 
  private readonly orm: Knex.QueryBuilder<UserSqlEntity, UserSqlEntity[]>;
  private readonly tableName: string = TABLE_NAME.USERS;
  
  constructor() {
    this.orm = getMysqlClient()<UserSqlEntity>(this.tableName)
  }
  
  private applyFilters(builder: Knex.QueryBuilder<UserSqlEntity, UserSqlEntity[]>, filter?: Filter) {
    if (filter?.query) {
      builder.whereILike("name", `%${filter.query}%`);
    }
  }
  
  async getAll(currentPage: number = 1, perPage: number = 10, filter?: Filter, traceId?: string):  Promise<{ data: UserSqlEntity[], stats: Stats }>{
    logger.info(this.getAll.name, UserSqlRepository.name, traceId);
    
    const offset = (currentPage - 1) * perPage;

    const baseQuery = this.orm.clone().select(
      filter?.fields ? filter.fields : "*"
    ).where((builder) => {
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

  async getByUsernameOrEmail(usernameOrEmail:  string, traceId?: string): Promise<UserSqlEntity | null> {
    logger.info(this.getByUsernameOrEmail.name, UserSqlRepository.name, traceId);
  
    const result = await this.orm
      .clone()
      .where((builder) => {
        builder.where("username", usernameOrEmail).orWhere("email", usernameOrEmail);
      })
      .first()
      .then((result) => result ?? null);
    return result;
  }

  async getById(id: number, traceId?: string): Promise<UserSqlEntity | null> {
    logger.info(this.getById.name, UserSqlRepository.name, traceId);
  
    return this.orm
      .clone()
      .where({ id })
      .first()
      .then((result) => result ?? null);
  }
  
async create(data: UserSqlEntity, traceId?: string): Promise<UserSqlEntity> {
  logger.info(this.create.name, UserSqlRepository.name, traceId);

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
    
    const created = rows[0];
    
    if (!created) {
      throw new ApplicationError(HttpError('Failed to insert data').INTERNAL_SERVER_ERROR)
    }

    return created;
  } finally {
    this.orm.client.releaseConnection(connection);
  }
}
  
  async update(id: number, data: Partial<UserSqlEntity>, traceId?: string): Promise<UserSqlEntity | null> {
    logger.info(this.update.name, UserSqlRepository.name, traceId);
    const connection = await this.orm.client.acquireConnection();

    try {
      const promiseConnection = connection.promise();

      await promiseConnection.query(
        'UPDATE ?? SET ? WHERE id = ?', 
        [this.tableName, removeUndefinedField(data), id]
      );
      
      const [updated] = await promiseConnection.query(
        'SELECT * FROM ?? WHERE id = ?', 
        [this.tableName, id]
      );
      
      return updated;
    } finally {
      this.orm.client.releaseConnection(connection);
    }
  }
  
  async delete(id: number, traceId?: string): Promise<boolean> {
    logger.info(this.delete.name, UserSqlRepository.name, traceId);
  
    const connection = await this.orm.client.acquireConnection();
    const promiseConnection = connection.promise();

    try {
      const result = await promiseConnection.query(
        'DELETE FROM ?? WHERE id = ?', 
        [this.tableName, id]
      );
      
      return result.affectedRows > 0;
    } finally {
      this.orm.client.releaseConnection(connection);
    }
  }
}