import path from "path";
const fs = require("fs");
import { readFileSync, writeFileSync, renameSync } from "fs";
const argv = process.argv;

// --- Parse CLI Args ---
const args = Object.fromEntries(
  argv.slice(2).map(arg => {
    const [key, val] = arg.replace(/^--/, "").split("=");
    return [key, val];
  })
);

//Usages: bun run generate.ts --domain=User --domainFile=user.ts --entityFile=user_sql.ts --mode=mysql
const domain = args.domain; // ${domainCamel}
const domainFile = args.domainFile; // ${domainSnake}.ts
const entityFile = args.entityFile; // user_${mode}.ts
let mode = args.mode || "mongodb"; // mongodb, mysql, postgres
let modeTitle = 'Mongo'

if (!domain || !domainFile || !entityFile) {
  console.error("Missing required arguments.");
  process.exit(1);
}

if(mode === 'postgres') {
  console.error("PostgreSQL mode is not supported yet.");
  process.exit(1);
}

if(mode === 'mysql') {
  modeTitle = 'MySQL'
}

// --- Utils ---
const toSnakeCase = (str: string) =>
  str.replace(/[A-Z]/g, (letter, i) => (i ? "_" : "") + letter.toLowerCase());
const toUrlCase = (str: string) =>
  str.replace(/[A-Z]/g, (letter, i) => (i ? "-" : "") + letter.toLowerCase());
const domainSnake = toSnakeCase(domain);
const domainCamel = domain;
const domainUrl = toUrlCase(domain);

const srcDir = `src`;

const adapterOutDir = `${srcDir}/adapter/out/${mode}/${domainSnake}`;
const adapterInDir = `${srcDir}/adapter/in/rest/${domainSnake}`;
const appDir = `${srcDir}/app`;

const utilOutDir = path.join(adapterOutDir, 'util');
const entityDir = path.join(adapterOutDir, 'entity');
const repositoryDir = path.join(adapterOutDir, 'repository');
const adapterDir = path.join(adapterOutDir, 'adapter');

const controllerDir = path.join(adapterInDir, 'controller');
const utilInDir = path.join(adapterInDir, 'util');

const useCaseDir = path.join(appDir, 'port/out');
const serviceDir = path.join(appDir, 'service');
const domainDir = path.join(srcDir, 'domain');


[utilOutDir, entityDir, repositoryDir, adapterDir, controllerDir, utilInDir, useCaseDir, serviceDir].forEach(dir => {
  mkdirSync(dir, { recursive: true });
});


// --- Read Types ---
const domainContent = readFileSync(domainFile, "utf-8");
const mongoContent = readFileSync(entityFile, "utf-8");



const parseFields = (content: string) => {
  const match = content.match(/type\s+\w+\s+=\s+{([^}]+)}/);
  if (!match) return [];
  return match[1]
    .trim()
    .split("\n")
    .map(line => line.trim().replace(/,$/, ""))
    .filter(Boolean);
};

const keyOnlyFields = (fields: string[]) => {
  return fields.map(field => {
    const key = field.split(":")[0].trim();
    return key.endsWith("?") ? `${key.slice(0, -1)}` : key;
  });
}

const domainFields = parseFields(domainContent); // id, name, email?
const mongoFields = parseFields(mongoContent); // _id, name, email?
const keyDomainFields = keyOnlyFields(domainFields);
const keyMongoFields = keyOnlyFields(mongoFields);

// --- Move Mongo Entity File ---
renameSync(entityFile, `${entityDir}/${entityFile}`);

// --- Move Domain File ---
renameSync(domainFile, `${domainDir}/${domainFile}`);

if(mode === 'mongodb'){
  const converterLines = [
    `import { ${domainCamel} } from "@domain/${domainSnake}";`,
    `import { ${domainCamel}${modeTitle}Entity } from "../entity/${domainSnake}_${mode}.entity";`,
    `import { ObjectId } from "mongodb";`,
    ``,
    `export const toDomain = (entity: ${domainCamel}${modeTitle}Entity): ${domainCamel} => {`,
    `  return {`,
    ...domainFields.map((field, index) => {
      if (field.startsWith("id")) return `    id: entity._id.toHexString(),`;
      const key = field.split(":")[0].trim().replace("?", "");
      return `    ${key}: entity.${keyMongoFields[index]},`;
    }),
    `  };`,
    `};`,
    ``,
    `export const toEntity = (domain: ${domainCamel}): ${domainCamel}${modeTitle}Entity => {`,
    `  return {`,
    ...domainFields.map((field, index) => {
      if (field.startsWith("id")) return `    _id: domain.id ? new ObjectId(domain.id) : new ObjectId(),`;
      const key = field.split(":")[0].trim().replace("?", "");
      return `    ${keyMongoFields[index]}: domain.${key},`;
    }),
    `  };`,
    `};`,
    ``,
    `export const toPartialDomain = (entity: Partial<${domainCamel}${modeTitle}Entity>): Partial<${domainCamel}> => {`,
    `  return {`,
    ...mongoFields.map((field, index) => {
      if (field.startsWith("_id")) return `    id: entity._id?.toString(),`;
      const key = field.split(":")[0].trim().replace("?", "");
      return `    ${keyDomainFields[index]}: entity.${key},`;
    }), 
    `  };`,
    `};`,
    ``,
    `export const toPartialEntity = (domain: Partial<${domainCamel}>): Partial<${domainCamel}${modeTitle}Entity> => {`,
    `  return {`,
    ...domainFields.map((field, index) => {
      if (field.startsWith("id")) return `    _id: domain.id ? new ObjectId(domain.id) : undefined,`;
      const key = field.split(":")[0].trim().replace("?", "");
      return `    ${keyMongoFields[index]}: domain.${key},`;
    }),
    `  };`,
    `};`,
    ``,
  ];

  const baseRepoContent = `
  import { Stats } from "@domain/stats"
  import { Filter } from "@domain/filter"
  import { ObjectId } from "mongodb"
  import { ${domainCamel}${modeTitle}Entity } from "../entity/${domainSnake}_${mode}.entity"

  export interface I${domainCamel}${modeTitle}Repository {
    getAll(currentPage?: number, perPage?: number, filter?: Filter, traceId?: string): Promise<${domainCamel}${modeTitle}Entity[]>
    getStats(traceId?: string): Promise<Stats>
    getById(id: ObjectId, traceId?: string): Promise<${domainCamel}${modeTitle}Entity | null>
    create(data: ${domainCamel}${modeTitle}Entity, traceId?: string): Promise<${domainCamel}${modeTitle}Entity>
    update(id: ObjectId, data: Partial<${domainCamel}${modeTitle}Entity>, traceId?: string): Promise<Partial<${domainCamel}${modeTitle}Entity>>
    delete(id: ObjectId, traceId?: string): Promise<boolean>
  }
  `;

  const repoContent = `
  import { Filter } from "@domain/filter";
  import { Stats } from "@domain/stats";
  import { Collection, Db, FindOptions, ObjectId } from "mongodb";
  import { ${domainCamel}${modeTitle}Entity } from "../entity/${domainSnake}_${mode}.entity";
  import { I${domainCamel}${modeTitle}Repository } from "./base_repository";
  import { logger } from "@logger";
  import { config } from "@config";
  import { COLLECTION } from "@domain/constant";
  import { getMongoClient } from "@util/mongodb/mongodb";
  import { ApplicationError } from "@util/error/application_error";
  import { HttpError } from "@util/error/type/http_error";
  import { removeUndefinedField } from "@util/converter/global_converter";

  export class ${domainCamel}${modeTitle}Repository implements I${domainCamel}${modeTitle}Repository {
    private dbName: string = 'dbName' // Replace with actual database name;
    private tableName: string = 'tableName' // Replace with actual table name
    private db: Db
    private collection: Collection<${domainCamel}${modeTitle}Entity>
    private perPage: number | undefined = 10 
    private current: number | undefined = 1
    private query: any = {}
    private findOptions: FindOptions = {}

    constructor(){
      this.db = getMongoClient().db(this.dbName)
      this.collection = this.db.collection(this.tableName)
    }

    filterSearch(query?: string): any {
      if(query === undefined) return {}
      return {
        $or: [
          { year: { $regex: '.*'+query+'.*', $options: 'i' } },
          { description: { $regex: '.*'+query+'.*', $options: 'i' } },
        ]
      }
    }

    filterIsActive(isActive?: boolean): any {
      return isActive === undefined ? {} : { is_active: isActive };
    }

    async getAll(currentPage?: number, perPage?: number, filter?: Filter, traceId?: string): Promise<${domainCamel}${modeTitle}Entity[]> {
      logger.info(this.getAll.name, ${domainCamel}${modeTitle}Repository.name, traceId);
      const sortOrder: 1 | -1 = (filter?.sortOrder === -1 || filter?.sortOrder === 'desc') ? -1 : 1;

      this.findOptions = {
        collation: { locale: 'en', numericOrdering: true },
        limit: perPage,
        skip: currentPage && perPage ? (currentPage - 1) * perPage : 0,
        sort: filter?.sortBy ? [[filter.sortBy, sortOrder]] : []
      };
      
      this.query = {
        $and: [
          this.filterSearch(filter?.query),
          this.filterIsActive(filter?.isActive)
        ]
      }


      const data = await this.collection
        .find(this.query, this.findOptions)
        .toArray();

      return data;
    }
    
    async getStats(traceId?: string): Promise<Stats> {
      logger.info(this.getStats.name, ${domainCamel}${modeTitle}Repository.name, traceId);
      if(this.perPage && this.current) {
        const totalData: number = await this.collection.countDocuments(this.query)
        const totalPage: number = Math.ceil(totalData / this.perPage)
      
        return {
          totalData: totalData,
          currentPage: this.current,
          totalPage: totalPage,
          perPage: this.perPage
        }
      }

      return {
        totalData: 0,
        currentPage: 0,
        totalPage: 0,
        perPage: 0
      }
    }
    
    async getById(id: ObjectId, traceId?: string): Promise<${domainCamel}${modeTitle}Entity | null> {
      logger.info(this.getById.name, ${domainCamel}${modeTitle}Repository.name, traceId);
      return await this.collection.findOne({ _id: id });;
    }
    
    async create(data: ${domainCamel}${modeTitle}Entity, traceId?: string): Promise<${domainCamel}${modeTitle}Entity> {
      logger.info(this.create.name, ${domainCamel}${modeTitle}Repository.name, traceId);
      try {
        await this.collection.insertOne({
          ...data,
          created_at: new Date(),
          updated_at: new Date()
        })
        return data
      } catch (error) {
        throw new ApplicationError(HttpError('Failed to insert data').INTERNAL_SERVER_ERROR)
      }
    }
    
    async update(id: ObjectId, data: Partial<${domainCamel}${modeTitle}Entity>, traceId?: string): Promise<Partial<${domainCamel}${modeTitle}Entity>> {
      logger.info(this.update.name, ${domainCamel}${modeTitle}Repository.name, traceId);
      const {_id,...updateData} = data
      try {
        await this.collection.updateOne({ _id: id }, {
          $set: {
            ...removeUndefinedField(updateData),
            updated_at: new Date()
          }
        })
        return data
      } catch (error) {
        throw new ApplicationError(HttpError('Failed to update data').INTERNAL_SERVER_ERROR)
      }
    }
    
    async delete(id: ObjectId, traceId?: string): Promise<boolean> {
      logger.info(this.delete.name, ${domainCamel}${modeTitle}Repository.name, traceId);
      const result = await this.collection.deleteOne({ _id: id })
      return result.deletedCount > 0
    }
    
  }
  `

  const baseAdapterContent = `
  import { Stats } from "@domain/stats"
  import { Filter } from "@domain/filter"
  import { ${domainCamel} } from "@domain/${domainSnake}"

  export interface I${domainCamel}${modeTitle}Adapter {
    getAll(currentPage?: number, perPage?: number, filter?: Filter, traceId?: string): Promise<${domainCamel}[]>
    getStats(traceId?: string): Promise<Stats>
    getById(id: string, traceId?: string): Promise<${domainCamel} | null>
    create(data: ${domainCamel}, traceId?: string): Promise<${domainCamel}>
    update(id: string, data: Partial<${domainCamel}>, traceId?: string): Promise<Partial<${domainCamel}>>
    delete(id: string, traceId?: string): Promise<boolean>
  }
  `;

  const adapterContent = `
  import { Filter } from "@domain/filter";
  import { Stats } from "@domain/stats";
  import { I${domainCamel}${modeTitle}Repository } from "../repository/${domainSnake}_${mode}.base_repository";
  import { ${domainCamel}${modeTitle}Repository } from "../repository/${domainSnake}_${mode}.repository";
  import { I${domainCamel}${modeTitle}Adapter } from "./${domainSnake}_${mode}.base_adapter";
  import { logger } from "@logger";
  import { toDomain, toEntity, toPartialDomain, toPartialEntity } from "../util/converter";
  import { ObjectId } from "mongodb";
  import { ${domainCamel} } from "@domain/${domainSnake}";

  export class ${domainCamel}${modeTitle}Adapter implements I${domainCamel}${modeTitle}Adapter {
    private repository: I${domainCamel}${modeTitle}Repository;

    constructor() {
      this.repository = new ${domainCamel}${modeTitle}Repository();
    }
    
    async getAll(currentPage?: number, perPage?: number, filter?: Filter, traceId?: string): Promise<${domainCamel}[]> {
      logger.info(this.getAll.name, ${domainCamel}${modeTitle}Adapter.name, traceId);
      return (await this.repository.getAll(currentPage, perPage, filter, traceId)).map(toDomain)
    }
    
    async getStats(traceId?: string): Promise<Stats> {
      logger.info(this.getStats.name, ${domainCamel}${modeTitle}Adapter.name, traceId);
      return await this.repository.getStats(traceId);
    }
    
    async getById(id: string, traceId?: string): Promise<${domainCamel} | null> {
      logger.info(this.getById.name, ${domainCamel}${modeTitle}Adapter.name, traceId);
      const data = await this.repository.getById(new ObjectId(id), traceId);
      return data !== null ? toDomain(data) : null;
    }
    
    async create(data: ${domainCamel}, traceId?: string): Promise<${domainCamel}> {
      logger.info(this.create.name, ${domainCamel}${modeTitle}Adapter.name, traceId);
      return toDomain(await this.repository.create(toEntity(data), traceId));
    }
    
    async update(id: string, data: Partial<${domainCamel}>, traceId?: string): Promise<Partial<${domainCamel}>> {
      logger.info(this.update.name, ${domainCamel}${modeTitle}Adapter.name, traceId);
      return toPartialDomain(await this.repository.update(new ObjectId(id), toPartialEntity(data), traceId));
    }
    
    async delete(id: string, traceId?: string): Promise<boolean> {
      logger.info(this.delete.name, ${domainCamel}${modeTitle}Adapter.name, traceId);
      return await this.repository.delete(new ObjectId(id), traceId);
    }
  }
  `

  const useCaseContent = `
  import { Stats } from "@domain/stats"
  import { Filter } from "@domain/filter"
  import { ${domainCamel} } from "@domain/${domainSnake}"

  export interface I${domainCamel}UseCase {
    getAll(currentPage?: number, perPage?: number, filter?: Filter, traceId?: string): Promise<${domainCamel}[]>
    getStats(traceId?: string): Promise<Stats>
    getById(id: string, traceId?: string): Promise<${domainCamel} | null>
    create(data: ${domainCamel}, traceId?: string): Promise<${domainCamel}>
    update(id: string, data: Partial<${domainCamel}>, traceId?: string): Promise<Partial<${domainCamel}>>
    delete(id: string, traceId?: string): Promise<boolean>
  }
  `

  const serviceContent = `
  import { ${domainCamel}${modeTitle}Adapter } from "@adapter_out/${mode}/${domainSnake}/adapter/${domainSnake}_${mode}.adapter";
  import { I${domainCamel}${modeTitle}Adapter } from "@adapter_out/${mode}/${domainSnake}/adapter/${domainSnake}_${mode}.base_adapter";
  import { ${domainCamel} } from "@domain/${domainSnake}";
  import { Filter } from "@domain/filter";
  import { Stats } from "@domain/stats";
  import { logger } from "@logger";
  import { I${domainCamel}UseCase } from "@use_case/${domainSnake}.use_case";

  export class ${domainCamel}Service implements I${domainCamel}UseCase {
    private ${mode}Adapter: I${domainCamel}${modeTitle}Adapter;

    constructor() {
      this.${mode}Adapter = new ${domainCamel}${modeTitle}Adapter();
    }
    
    async getAll(currentPage?: number, perPage?: number, filter?: Filter, traceId?: string): Promise<${domainCamel}[]> {
      logger.info(this.getAll.name, ${domainCamel}Service.name, traceId);
      return await this.${mode}Adapter.getAll(currentPage, perPage, filter, traceId);
    }
    
    async getStats(traceId?: string): Promise<Stats> {
      logger.info(this.getStats.name, ${domainCamel}Service.name, traceId);
      return await this.${mode}Adapter.getStats(traceId);
    }
    
    async getById(id: string, traceId?: string): Promise<${domainCamel} | null> {
      logger.info(this.getById.name, ${domainCamel}Service.name, traceId);
      return await this.${mode}Adapter.getById(id, traceId);
    }
    
    async create(data: ${domainCamel}, traceId?: string): Promise<${domainCamel}> {
      logger.info(this.create.name, ${domainCamel}Service.name, traceId);
      return await this.${mode}Adapter.create(data, traceId);
    }
    
    async update(id: string, data: Partial<${domainCamel}>, traceId?: string): Promise<Partial<${domainCamel}>> {
      logger.info(this.update.name, ${domainCamel}Service.name, traceId);
      return await this.${mode}Adapter.update(id, data, traceId);
    }
    
    async delete(id: string, traceId?: string): Promise<boolean> {
      logger.info(this.delete.name, ${domainCamel}Service.name, traceId);
      return await this.${mode}Adapter.delete(id, traceId);
    }

  }
  `

  const restControllerContent = `
  import { BaseController } from "@common/base_controller";
  import { Express, Request, Response } from "express";
  import { queryToFilter } from "../util/${domainSnake}.converter";
  import { getLogTraceId } from "@logger";
  import { dataToRestResponse } from "@util/converter/global_converter";
  import { errorHandler } from "@util/error/error_handler";
  import { globalAuthMiddleware } from "@util/middlewares/global_auth";
  import { I${domainCamel}UseCase } from "@use_case/${domainSnake}.use_case";
  import { ${domainCamel}Service } from "@service/${domainSnake}.service";

  export class ${domainCamel}RestController implements BaseController {
    private app: Express;
    private readonly prefix: string = "/${domainUrl}s";
    private service: I${domainCamel}UseCase;

    constructor(app: Express) {
      this.app = app;
      this.service = new ${domainCamel}Service();
    }

    init(): void {
      this.app.get(this.prefix, globalAuthMiddleware, this.getAll.bind(this));
      this.app.get(this.prefix + '/:id', globalAuthMiddleware, this.getById.bind(this));
      this.app.post(this.prefix, globalAuthMiddleware, this.create.bind(this));
      this.app.put(this.prefix + '/:id', globalAuthMiddleware, this.update.bind(this));
      this.app.delete(this.prefix + '/:id', globalAuthMiddleware, this.delete.bind(this));
    }

    async getAll(req: Request, res: Response): Promise<void> {
      try {
        const filter = queryToFilter(req)
        const traceId = getLogTraceId();
        const data = await this.service.getAll(filter.currentPage, filter.perPage, filter, traceId)
        const stats = filter.currentPage !== undefined && filter.perPage !== undefined ? await this.service.getStats(traceId) : undefined;
        res.json(dataToRestResponse(data, stats));
        
      } catch (error) {
        errorHandler(error, res)
      }
    }

    async getById(req: Request, res: Response): Promise<void> {
      try {
        const data = await this.service.getById(req.params.id, getLogTraceId());
        res.json(dataToRestResponse(data));
      } catch (error) {
        errorHandler(error, res);
      }
    }

    async create(req: Request, res: Response): Promise<void> {
      try {
        const data = await this.service.create(req.body, getLogTraceId());
        res.status(201).json(dataToRestResponse(data));
      } catch (error) {
        errorHandler(error, res);
      }
    }
    async update(req: Request, res: Response): Promise<void> {
      try {
        const data = await this.service.update(req.params.id, req.body, getLogTraceId());
        res.json(dataToRestResponse(data));
      } catch (error) {
        errorHandler(error, res);
      }
    }

    async delete(req: Request, res: Response): Promise<void> {
      try {
        const result = await this.service.delete(req.params.id, getLogTraceId());
        res.json(dataToRestResponse(result));
      } catch (error) {
        errorHandler(error, res);
      }
    }
  }
  `

  const converterInContent = `
  import { COMMON } from "@domain/constant"
  import { Filter } from "@domain/filter"
  import { Request } from "express"

  export const queryToFilter = (req: Request): Filter => {
    return {
      perPage: req.query.perPage !== undefined && req.query.perPage !== '' ? parseInt(req.query.perPage.toString()) : undefined,
      currentPage: req.query.page !== undefined && req.query.page !== '' ? parseInt(req.query.page.toString()) : undefined,
      query: req.query.q !== undefined ? req.query.q as string : '',
      sortBy: req.query.sortBy !== undefined ? req.query.sortBy as string : undefined,
      sortOrder: req.query.sortOrder !== undefined ? (req.query.sortOrder === COMMON.ASC || req.query.sortOrder === '1' ? COMMON.ASC : (req.query.sortOrder === COMMON.DESC || req.query.sortOrder === '-1' ? COMMON.DESC : parseInt(req.query.sortOrder as string))) : undefined,
      isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
    }
  }
  `

  writeFileSync(`${repositoryDir}/${domainSnake}_${mode}.base_repository.ts`, baseRepoContent.trim());
  writeFileSync(`${repositoryDir}/${domainSnake}_${mode}.repository.ts`, repoContent.trim());

  writeFileSync(`${adapterDir}/${domainSnake}_${mode}.base_adapter.ts`, baseAdapterContent.trim());
  writeFileSync(`${adapterDir}/${domainSnake}_${mode}.adapter.ts`, adapterContent.trim());

  writeFileSync(`${appDir}/port/out/${domainSnake}.use_case.ts`, useCaseContent.trim());
  writeFileSync(`${serviceDir}/${domainSnake}.service.ts`, serviceContent.trim());

  writeFileSync(`${utilOutDir}/${domainSnake}.converter.ts`, converterLines.join("\n"));
  writeFileSync(`${controllerDir}/${domainSnake}.controller.ts`, restControllerContent.trim());
  writeFileSync(`${utilInDir}/${domainSnake}_${mode}.converter.ts`, converterInContent.trim());

  console.log("✔️ Generation complete.");
}

if(mode === 'mysql') {
   const converterLines = [
    `import { ${domainCamel} } from "@domain/${domainSnake}";`,
    `import { ${domainCamel}${modeTitle}Entity } from "../entity/${domainSnake}_${mode}.entity";`,
    ``,
    `export const toDomain = (entity: ${domainCamel}${modeTitle}Entity): ${domainCamel} => {`,
    `  return {`,
    ...domainFields.map((field, index) => {
      const key = field.split(":")[0].trim().replace("?", "");
      return `    ${key}: entity.${keyMongoFields[index]},`;
    }),
    `  };`,
    `};`,
    ``,
    `export const toEntity = (domain: ${domainCamel}): ${domainCamel}${modeTitle}Entity => {`,
    `  return {`,
    ...domainFields.map((field, index) => {
      const key = field.split(":")[0].trim().replace("?", "");
      return `    ${keyMongoFields[index]}: domain.${key},`;
    }),
    `  };`,
    `};`,
    ``,
    `export const toPartialDomain = (entity: Partial<${domainCamel}${modeTitle}Entity>): Partial<${domainCamel}> => {`,
    `  return {`,
    ...mongoFields.map((field, index) => {
      const key = field.split(":")[0].trim().replace("?", "");
      return `    ${keyDomainFields[index]}: entity.${key},`;
    }), 
    `  };`,
    `};`,
    ``,
    `export const toPartialEntity = (domain: Partial<${domainCamel}>): Partial<${domainCamel}${modeTitle}Entity> => {`,
    `  return {`,
    ...domainFields.map((field, index) => {
      const key = field.split(":")[0].trim().replace("?", "");
      return `    ${keyMongoFields[index]}: domain.${key},`;
    }),
    `  };`,
    `};`,
    ``,
  ];

  const baseRepoContent = `
  import { Stats } from "@domain/stats"
  import { Filter } from "@domain/filter"
  import { ${domainCamel}${modeTitle}Entity } from "../entity/${domainSnake}_${mode}.entity"

  export interface I${domainCamel}${modeTitle}Repository {
    getAll(currentPage?: number, perPage?: number, filter?: Filter, traceId?: string): Promise<{ data: ${domainCamel}${modeTitle}Entity[], stats: Stats}>
    getById(id: number, traceId?: string): Promise<${domainCamel}${modeTitle}Entity | null>
    create(data: ${domainCamel}${modeTitle}Entity, traceId?: string): Promise<${domainCamel}${modeTitle}Entity>
    update(id: number, data: Partial<${domainCamel}${modeTitle}Entity>, traceId?: string): Promise<Partial<${domainCamel}${modeTitle}Entity> | null>
    delete(id: number, traceId?: string): Promise<boolean>
  }
  `;

  const repoContent = `
  import { Knex } from "knex";
  import { ${domainCamel}${modeTitle}Entity } from "../entity/${domainSnake}_${mode}.entity";
  import { Filter } from "@domain/filter";
  import { logger } from "@logger";
  import { I${domainCamel}${modeTitle}Repository } from "./${domainSnake}_${mode}.base_repository";
  import { Stats } from "@domain/stats";
  import { TABLE_NAME } from "@domain/constant";
  import { getMysqlClient } from "@mysql";
  import { removeUndefinedField } from "@util/converter/global_converter";
  import { ApplicationError } from "@util/error/application_error";
  import { HttpError } from "@util/error/type/http_error";

  export class ${domainCamel}${modeTitle}Repository implements I${domainCamel}${modeTitle}Repository { 
    private readonly orm: Knex.QueryBuilder<${domainCamel}${modeTitle}Entity, ${domainCamel}${modeTitle}Entity[]>;
    private readonly tableName: string = ''; // Change this to your actual table name

    constructor() {
      this.orm = getMysqlClient()<${domainCamel}${modeTitle}Entity>(this.tableName);
    }
    
    private applyFilters(builder: Knex.QueryBuilder<${domainCamel}${modeTitle}Entity, ${domainCamel}${modeTitle}Entity[]>, filter?: Filter) {
      if (filter?.query) {
        builder.whereILike("name", '%' + filter.query + '%');
      }

    }
    
    async getAll(currentPage: number = 1, perPage: number = 10, filter?: Filter, traceId?: string):  Promise<{ data: ${domainCamel}${modeTitle}Entity[], stats: Stats }>{
      logger.info(this.getAll.name, ${domainCamel}${modeTitle}Repository.name, traceId);
      
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

    async getById(id: number, traceId?: string): Promise<${domainCamel}${modeTitle}Entity | null> {
      logger.info(this.getById.name, ${domainCamel}${modeTitle}Repository.name, traceId);
    
      return this.orm
        .clone()
        .where({ id })
        .first()
        .then((result) => result ?? null);
    }
    
    async create(data: ${domainCamel}${modeTitle}Entity, traceId?: string): Promise<${domainCamel}${modeTitle}Entity> {
      logger.info(this.create.name, ${domainCamel}${modeTitle}Repository.name, traceId);
    
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
    
    async update(id: number, data: Partial<${domainCamel}${modeTitle}Entity>, traceId?: string): Promise<${domainCamel}${modeTitle}Entity | null> {
      logger.info(this.update.name, ${domainCamel}${modeTitle}Repository.name, traceId);
    
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
      logger.info(this.delete.name, ${domainCamel}${modeTitle}Repository.name, traceId);
    
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
  `

  const baseAdapterContent = `
  import { Stats } from "@domain/stats"
  import { Filter } from "@domain/filter"
  import { ${domainCamel} } from "@domain/${domainSnake}"

  export interface I${domainCamel}${modeTitle}Adapter {
    getAll(currentPage?: number, perPage?: number, filter?: Filter, traceId?: string): Promise<{ data: ${domainCamel}[], stats: Stats }>
    getById(id: number, traceId?: string): Promise<${domainCamel} | null>
    create(data: ${domainCamel}, traceId?: string): Promise<${domainCamel}>
    update(id: number, data: Partial<${domainCamel}>, traceId?: string): Promise<Partial<${domainCamel}> | null>
    delete(id: number, traceId?: string): Promise<boolean>
  }
  `;

  const adapterContent = `
  import { logger } from "@logger";
  import { I${domainCamel}${modeTitle}Repository as I${domainCamel}${modeTitle}Repository } from "../repository/${domainSnake}_${mode}.base_repository";
  import { ${domainCamel}${modeTitle}Repository } from "../repository/${domainSnake}_${mode}.repository";
  import { I${domainCamel}${modeTitle}Adapter as I${domainCamel}${modeTitle}Adapter } from "./${domainSnake}_${mode}.base_adapter";
  import { Filter } from "@domain/filter";
  import { ${domainCamel} } from "@domain/${domainSnake}";
  import { toDomain, toEntity, toPartialDomain, toPartialEntity } from "../util/${domainSnake}_${mode}.converter";
  import { Stats } from "@domain/stats";

  export class ${domainCamel}${modeTitle}Adapter implements I${domainCamel}${modeTitle}Adapter {
    private ${domainCamel}SqlRepository: I${domainCamel}${modeTitle}Repository

    constructor(){
      this.${domainCamel}SqlRepository = new ${domainCamel}${modeTitle}Repository();
    }
    async getAll(currentPage?: number, perPage?: number, filter?: Filter, traceId?: string): Promise<{ data: ${domainCamel}[]; stats: Stats; }> {
      logger.info(this.getAll.name, ${domainCamel}${modeTitle}Adapter.name, traceId);
      const { data, stats } = await this.${domainCamel}SqlRepository.getAll(currentPage, perPage, filter, traceId);

      return {
        data: data.map((${domainSnake}) => toDomain(${domainSnake})),
        stats,
      }
    }
    
    async getById(id: number, traceId?: string): Promise<${domainCamel} | null> {
      logger.info(this.getById.name, ${domainCamel}${modeTitle}Adapter.name, traceId);
      const ${domainSnake} = await this.${domainCamel}SqlRepository.getById(id, traceId);
      if (!${domainSnake}) return null;

      return toDomain(${domainSnake});
    }
    
    async create(data: ${domainCamel}, traceId?: string): Promise<${domainCamel}> {
      logger.info(this.create.name, ${domainCamel}${modeTitle}Adapter.name, traceId);
      return toDomain(await this.${domainCamel}SqlRepository.create(toEntity(data), traceId));
    }
    
    async update(id: number, data: Partial<${domainCamel}>, traceId?: string): Promise<Partial<${domainCamel}> | null> {
      logger.info(this.update.name, ${domainCamel}${modeTitle}Adapter.name, traceId);
      const ${domainSnake} = await this.${domainCamel}SqlRepository.update(id, toPartialEntity(data), traceId);
      if (!${domainSnake}) return null;

      return toPartialDomain(${domainSnake});
    }
    
    async delete(id: number, traceId?: string): Promise<boolean> {
      logger.info(this.delete.name, ${domainCamel}${modeTitle}Adapter.name, traceId);
      return await this.${domainCamel}SqlRepository.delete(id, traceId);
    }
    
  }
  `

  const useCaseContent = `
  import { Stats } from "@domain/stats"
  import { Filter } from "@domain/filter"
  import { ${domainCamel} } from "@domain/${domainSnake}"

  export interface I${domainCamel}UseCase {
    getAll(currentPage?: number, perPage?: number, filter?: Filter, traceId?: string): Promise<{ data: ${domainCamel}[], stats: Stats }>
    getById(id: number, traceId?: string): Promise<${domainCamel} | null>
    create(data: ${domainCamel}, traceId?: string): Promise<${domainCamel}>
    update(id: number, data: Partial<${domainCamel}>, traceId?: string): Promise<Partial<${domainCamel}> | null>
    delete(id: number, traceId?: string): Promise<boolean>
  }
  `

  const serviceContent = `
  import { ${domainCamel}${modeTitle}Adapter } from "@adapter_out/${mode}/${domainSnake}/adapter/${domainSnake}_${mode}.adapter";
  import { I${domainCamel}${modeTitle}Adapter } from "@adapter_out/${mode}/${domainSnake}/adapter/${domainSnake}_${mode}.base_adapter";
  import { ${domainCamel} } from "@domain/${domainSnake}";
  import { Filter } from "@domain/filter";
  import { Stats } from "@domain/stats";
  import { logger } from "@logger";
  import { I${domainCamel}UseCase } from "@use_case/${domainSnake}.use_case";

  export class ${domainCamel}Service implements I${domainCamel}UseCase {
    private ${mode}Adapter: I${domainCamel}${modeTitle}Adapter;

    constructor() {
      this.${mode}Adapter = new ${domainCamel}${modeTitle}Adapter();
    }
    
    async getAll(currentPage?: number, perPage?: number, filter?: Filter, traceId?: string): Promise<{ data: ${domainCamel}[], stats: Stats }> {
      logger.info(this.getAll.name, ${domainCamel}Service.name, traceId);
      return await this.${mode}Adapter.getAll(currentPage, perPage, filter, traceId);
    }
    
    async getById(id: number, traceId?: string): Promise<${domainCamel} | null> {
      logger.info(this.getById.name, ${domainCamel}Service.name, traceId);
      return await this.${mode}Adapter.getById(id, traceId);
    }
    
    async create(data: ${domainCamel}, traceId?: string): Promise<${domainCamel}> {
      logger.info(this.create.name, ${domainCamel}Service.name, traceId);
      return await this.${mode}Adapter.create(data, traceId);
    }

    async update(id: number, data: Partial<${domainCamel}>, traceId?: string): Promise<Partial<${domainCamel}> | null> {
      logger.info(this.update.name, ${domainCamel}Service.name, traceId);
      return await this.${mode}Adapter.update(id, data, traceId);
    }

    async delete(id: number, traceId?: string): Promise<boolean> {
      logger.info(this.delete.name, ${domainCamel}Service.name, traceId);
      return await this.${mode}Adapter.delete(id, traceId);
    }

  }
  `

  const restControllerContent = `
  import { BaseController } from "@common/base_controller";
  import { Express, Request, Response } from "express";
  import { queryToFilter } from "../util/${domainSnake}.converter";
  import { getLogTraceId } from "@logger";
  import { dataToRestResponse } from "@util/converter/global_converter";
  import { errorHandler } from "@util/error/error_handler";
  import { globalAuthMiddleware } from "@util/middlewares/global_auth";
  import { I${domainCamel}UseCase } from "@use_case/${domainSnake}.use_case";
  import { ${domainCamel}Service } from "@service/${domainSnake}.service";

  export class ${domainCamel}RestController implements BaseController {
    private app: Express;
    private readonly prefix: string = "/${domainUrl}s";
    private service: I${domainCamel}UseCase;

    constructor(app: Express) {
      this.app = app;
      this.service = new ${domainCamel}Service();
    }

    init(): void {
      this.app.get(this.prefix, globalAuthMiddleware, this.getAll.bind(this));
      this.app.get(this.prefix + '/:id', globalAuthMiddleware, this.getById.bind(this));
      this.app.post(this.prefix, globalAuthMiddleware, this.create.bind(this));
      this.app.put(this.prefix + '/:id', globalAuthMiddleware, this.update.bind(this));
      this.app.delete(this.prefix + '/:id', globalAuthMiddleware, this.delete.bind(this));
    }

    async getAll(req: Request, res: Response): Promise<void> {
      try {
        const filter = queryToFilter(req)
        const traceId = getLogTraceId();
        const data = await this.service.getAll(filter.currentPage, filter.perPage, filter, traceId)
        const stats = filter.currentPage !== undefined && filter.perPage !== undefined ? await this.service.getStats(traceId) : undefined;
        res.json(dataToRestResponse(data, stats));
        
      } catch (error) {
        errorHandler(error, res)
      }
    }

    async getById(req: Request, res: Response): Promise<void> {
      try {
        const data = await this.service.getById(parseInt(req.params.id.toString()), getLogTraceId());
        res.json(dataToRestResponse(data));
      } catch (error) {
        errorHandler(error, res);
      }
    }

    async create(req: Request, res: Response): Promise<void> {
      try {
        const data = await this.service.create(req.body, getLogTraceId());
        res.status(201).json(dataToRestResponse(data));
      } catch (error) {
        errorHandler(error, res);
      }
    }
    async update(req: Request, res: Response): Promise<void> {
      try {
        const data = await this.service.update(parseInt(req.params.id.toString()), req.body, getLogTraceId());
        res.json(dataToRestResponse(data));
      } catch (error) {
        errorHandler(error, res);
      }
    }

    async delete(req: Request, res: Response): Promise<void> {
      try {
        const result = await this.service.delete(parseInt(req.params.id.toString()), getLogTraceId());
        res.json(dataToRestResponse(result));
      } catch (error) {
        errorHandler(error, res);
      }
    }
  }
  `

  const converterInContent = `
  import { COMMON } from "@domain/constant"
  import { Filter } from "@domain/filter"
  import { Request } from "express"

  export const queryToFilter = (req: Request): Filter => {
    return {
      perPage: req.query.perPage !== undefined && req.query.perPage !== '' ? parseInt(req.query.perPage.toString()) : undefined,
      currentPage: req.query.page !== undefined && req.query.page !== '' ? parseInt(req.query.page.toString()) : undefined,
      query: req.query.q !== undefined ? req.query.q as string : '',
      sortBy: req.query.sortBy !== undefined ? req.query.sortBy as string : undefined,
      sortOrder: req.query.sortOrder !== undefined ? (req.query.sortOrder === COMMON.ASC || req.query.sortOrder === '1' ? COMMON.ASC : (req.query.sortOrder === COMMON.DESC || req.query.sortOrder === '-1' ? COMMON.DESC : parseInt(req.query.sortOrder as string))) : undefined,
      isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
    }
  }
  `

  writeFileSync(`${repositoryDir}/${domainSnake}_${mode}.base_repository.ts`, baseRepoContent.trim());
  writeFileSync(`${repositoryDir}/${domainSnake}_${mode}.repository.ts`, repoContent.trim());

  writeFileSync(`${adapterDir}/${domainSnake}_${mode}.base_adapter.ts`, baseAdapterContent.trim());
  writeFileSync(`${adapterDir}/${domainSnake}_${mode}.adapter.ts`, adapterContent.trim());

  writeFileSync(`${appDir}/port/out/${domainSnake}.use_case.ts`, useCaseContent.trim());
  writeFileSync(`${serviceDir}/${domainSnake}.service.ts`, serviceContent.trim());

  writeFileSync(`${utilOutDir}/${domainSnake}_${mode}.converter.ts`, converterLines.join("\n"));
  writeFileSync(`${controllerDir}/${domainSnake}.controller.ts`, restControllerContent.trim());
  writeFileSync(`${utilInDir}/${domainSnake}.converter.ts`, converterInContent.trim());

  console.log("✔️ Generation complete.");
}

 function mkdirSync(dir: string, arg1: { recursive: boolean; }) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: arg1.recursive });
    }
    return dir;
  }


