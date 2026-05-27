
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Requisition
 * 
 */
export type Requisition = $Result.DefaultSelection<Prisma.$RequisitionPayload>
/**
 * Model JobPosting
 * 
 */
export type JobPosting = $Result.DefaultSelection<Prisma.$JobPostingPayload>
/**
 * Model ApplicationFormSchema
 * 
 */
export type ApplicationFormSchema = $Result.DefaultSelection<Prisma.$ApplicationFormSchemaPayload>
/**
 * Model Skill
 * 
 */
export type Skill = $Result.DefaultSelection<Prisma.$SkillPayload>
/**
 * Model Outbox
 * 
 */
export type Outbox = $Result.DefaultSelection<Prisma.$OutboxPayload>
/**
 * Model AgentRun
 * 
 */
export type AgentRun = $Result.DefaultSelection<Prisma.$AgentRunPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const RequisitionStatus: {
  DRAFT: 'DRAFT',
  OPEN: 'OPEN',
  ON_HOLD: 'ON_HOLD',
  FILLED: 'FILLED',
  CLOSED: 'CLOSED',
  CANCELLED: 'CANCELLED'
};

export type RequisitionStatus = (typeof RequisitionStatus)[keyof typeof RequisitionStatus]


export const OutboxStatus: {
  PENDING: 'PENDING',
  SENT: 'SENT',
  FAILED: 'FAILED'
};

export type OutboxStatus = (typeof OutboxStatus)[keyof typeof OutboxStatus]

}

export type RequisitionStatus = $Enums.RequisitionStatus

export const RequisitionStatus: typeof $Enums.RequisitionStatus

export type OutboxStatus = $Enums.OutboxStatus

export const OutboxStatus: typeof $Enums.OutboxStatus

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Requisitions
 * const requisitions = await prisma.requisition.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Requisitions
   * const requisitions = await prisma.requisition.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.requisition`: Exposes CRUD operations for the **Requisition** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Requisitions
    * const requisitions = await prisma.requisition.findMany()
    * ```
    */
  get requisition(): Prisma.RequisitionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.jobPosting`: Exposes CRUD operations for the **JobPosting** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more JobPostings
    * const jobPostings = await prisma.jobPosting.findMany()
    * ```
    */
  get jobPosting(): Prisma.JobPostingDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.applicationFormSchema`: Exposes CRUD operations for the **ApplicationFormSchema** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ApplicationFormSchemas
    * const applicationFormSchemas = await prisma.applicationFormSchema.findMany()
    * ```
    */
  get applicationFormSchema(): Prisma.ApplicationFormSchemaDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.skill`: Exposes CRUD operations for the **Skill** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Skills
    * const skills = await prisma.skill.findMany()
    * ```
    */
  get skill(): Prisma.SkillDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.outbox`: Exposes CRUD operations for the **Outbox** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Outboxes
    * const outboxes = await prisma.outbox.findMany()
    * ```
    */
  get outbox(): Prisma.OutboxDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.agentRun`: Exposes CRUD operations for the **AgentRun** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AgentRuns
    * const agentRuns = await prisma.agentRun.findMany()
    * ```
    */
  get agentRun(): Prisma.AgentRunDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.19.3
   * Query Engine version: c2990dca591cba766e3b7ef5d9e8a84796e47ab7
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Requisition: 'Requisition',
    JobPosting: 'JobPosting',
    ApplicationFormSchema: 'ApplicationFormSchema',
    Skill: 'Skill',
    Outbox: 'Outbox',
    AgentRun: 'AgentRun'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "requisition" | "jobPosting" | "applicationFormSchema" | "skill" | "outbox" | "agentRun"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Requisition: {
        payload: Prisma.$RequisitionPayload<ExtArgs>
        fields: Prisma.RequisitionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RequisitionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequisitionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RequisitionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequisitionPayload>
          }
          findFirst: {
            args: Prisma.RequisitionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequisitionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RequisitionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequisitionPayload>
          }
          findMany: {
            args: Prisma.RequisitionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequisitionPayload>[]
          }
          create: {
            args: Prisma.RequisitionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequisitionPayload>
          }
          createMany: {
            args: Prisma.RequisitionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RequisitionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequisitionPayload>[]
          }
          delete: {
            args: Prisma.RequisitionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequisitionPayload>
          }
          update: {
            args: Prisma.RequisitionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequisitionPayload>
          }
          deleteMany: {
            args: Prisma.RequisitionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RequisitionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.RequisitionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequisitionPayload>[]
          }
          upsert: {
            args: Prisma.RequisitionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequisitionPayload>
          }
          aggregate: {
            args: Prisma.RequisitionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRequisition>
          }
          groupBy: {
            args: Prisma.RequisitionGroupByArgs<ExtArgs>
            result: $Utils.Optional<RequisitionGroupByOutputType>[]
          }
          count: {
            args: Prisma.RequisitionCountArgs<ExtArgs>
            result: $Utils.Optional<RequisitionCountAggregateOutputType> | number
          }
        }
      }
      JobPosting: {
        payload: Prisma.$JobPostingPayload<ExtArgs>
        fields: Prisma.JobPostingFieldRefs
        operations: {
          findUnique: {
            args: Prisma.JobPostingFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobPostingPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.JobPostingFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobPostingPayload>
          }
          findFirst: {
            args: Prisma.JobPostingFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobPostingPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.JobPostingFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobPostingPayload>
          }
          findMany: {
            args: Prisma.JobPostingFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobPostingPayload>[]
          }
          create: {
            args: Prisma.JobPostingCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobPostingPayload>
          }
          createMany: {
            args: Prisma.JobPostingCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.JobPostingCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobPostingPayload>[]
          }
          delete: {
            args: Prisma.JobPostingDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobPostingPayload>
          }
          update: {
            args: Prisma.JobPostingUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobPostingPayload>
          }
          deleteMany: {
            args: Prisma.JobPostingDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.JobPostingUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.JobPostingUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobPostingPayload>[]
          }
          upsert: {
            args: Prisma.JobPostingUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobPostingPayload>
          }
          aggregate: {
            args: Prisma.JobPostingAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateJobPosting>
          }
          groupBy: {
            args: Prisma.JobPostingGroupByArgs<ExtArgs>
            result: $Utils.Optional<JobPostingGroupByOutputType>[]
          }
          count: {
            args: Prisma.JobPostingCountArgs<ExtArgs>
            result: $Utils.Optional<JobPostingCountAggregateOutputType> | number
          }
        }
      }
      ApplicationFormSchema: {
        payload: Prisma.$ApplicationFormSchemaPayload<ExtArgs>
        fields: Prisma.ApplicationFormSchemaFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ApplicationFormSchemaFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApplicationFormSchemaPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ApplicationFormSchemaFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApplicationFormSchemaPayload>
          }
          findFirst: {
            args: Prisma.ApplicationFormSchemaFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApplicationFormSchemaPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ApplicationFormSchemaFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApplicationFormSchemaPayload>
          }
          findMany: {
            args: Prisma.ApplicationFormSchemaFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApplicationFormSchemaPayload>[]
          }
          create: {
            args: Prisma.ApplicationFormSchemaCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApplicationFormSchemaPayload>
          }
          createMany: {
            args: Prisma.ApplicationFormSchemaCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ApplicationFormSchemaCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApplicationFormSchemaPayload>[]
          }
          delete: {
            args: Prisma.ApplicationFormSchemaDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApplicationFormSchemaPayload>
          }
          update: {
            args: Prisma.ApplicationFormSchemaUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApplicationFormSchemaPayload>
          }
          deleteMany: {
            args: Prisma.ApplicationFormSchemaDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ApplicationFormSchemaUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ApplicationFormSchemaUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApplicationFormSchemaPayload>[]
          }
          upsert: {
            args: Prisma.ApplicationFormSchemaUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApplicationFormSchemaPayload>
          }
          aggregate: {
            args: Prisma.ApplicationFormSchemaAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateApplicationFormSchema>
          }
          groupBy: {
            args: Prisma.ApplicationFormSchemaGroupByArgs<ExtArgs>
            result: $Utils.Optional<ApplicationFormSchemaGroupByOutputType>[]
          }
          count: {
            args: Prisma.ApplicationFormSchemaCountArgs<ExtArgs>
            result: $Utils.Optional<ApplicationFormSchemaCountAggregateOutputType> | number
          }
        }
      }
      Skill: {
        payload: Prisma.$SkillPayload<ExtArgs>
        fields: Prisma.SkillFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SkillFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SkillPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SkillFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SkillPayload>
          }
          findFirst: {
            args: Prisma.SkillFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SkillPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SkillFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SkillPayload>
          }
          findMany: {
            args: Prisma.SkillFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SkillPayload>[]
          }
          create: {
            args: Prisma.SkillCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SkillPayload>
          }
          createMany: {
            args: Prisma.SkillCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SkillCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SkillPayload>[]
          }
          delete: {
            args: Prisma.SkillDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SkillPayload>
          }
          update: {
            args: Prisma.SkillUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SkillPayload>
          }
          deleteMany: {
            args: Prisma.SkillDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SkillUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SkillUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SkillPayload>[]
          }
          upsert: {
            args: Prisma.SkillUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SkillPayload>
          }
          aggregate: {
            args: Prisma.SkillAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSkill>
          }
          groupBy: {
            args: Prisma.SkillGroupByArgs<ExtArgs>
            result: $Utils.Optional<SkillGroupByOutputType>[]
          }
          count: {
            args: Prisma.SkillCountArgs<ExtArgs>
            result: $Utils.Optional<SkillCountAggregateOutputType> | number
          }
        }
      }
      Outbox: {
        payload: Prisma.$OutboxPayload<ExtArgs>
        fields: Prisma.OutboxFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OutboxFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutboxPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OutboxFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutboxPayload>
          }
          findFirst: {
            args: Prisma.OutboxFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutboxPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OutboxFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutboxPayload>
          }
          findMany: {
            args: Prisma.OutboxFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutboxPayload>[]
          }
          create: {
            args: Prisma.OutboxCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutboxPayload>
          }
          createMany: {
            args: Prisma.OutboxCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OutboxCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutboxPayload>[]
          }
          delete: {
            args: Prisma.OutboxDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutboxPayload>
          }
          update: {
            args: Prisma.OutboxUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutboxPayload>
          }
          deleteMany: {
            args: Prisma.OutboxDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OutboxUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.OutboxUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutboxPayload>[]
          }
          upsert: {
            args: Prisma.OutboxUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutboxPayload>
          }
          aggregate: {
            args: Prisma.OutboxAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOutbox>
          }
          groupBy: {
            args: Prisma.OutboxGroupByArgs<ExtArgs>
            result: $Utils.Optional<OutboxGroupByOutputType>[]
          }
          count: {
            args: Prisma.OutboxCountArgs<ExtArgs>
            result: $Utils.Optional<OutboxCountAggregateOutputType> | number
          }
        }
      }
      AgentRun: {
        payload: Prisma.$AgentRunPayload<ExtArgs>
        fields: Prisma.AgentRunFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AgentRunFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentRunPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AgentRunFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentRunPayload>
          }
          findFirst: {
            args: Prisma.AgentRunFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentRunPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AgentRunFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentRunPayload>
          }
          findMany: {
            args: Prisma.AgentRunFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentRunPayload>[]
          }
          create: {
            args: Prisma.AgentRunCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentRunPayload>
          }
          createMany: {
            args: Prisma.AgentRunCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AgentRunCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentRunPayload>[]
          }
          delete: {
            args: Prisma.AgentRunDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentRunPayload>
          }
          update: {
            args: Prisma.AgentRunUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentRunPayload>
          }
          deleteMany: {
            args: Prisma.AgentRunDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AgentRunUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AgentRunUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentRunPayload>[]
          }
          upsert: {
            args: Prisma.AgentRunUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentRunPayload>
          }
          aggregate: {
            args: Prisma.AgentRunAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAgentRun>
          }
          groupBy: {
            args: Prisma.AgentRunGroupByArgs<ExtArgs>
            result: $Utils.Optional<AgentRunGroupByOutputType>[]
          }
          count: {
            args: Prisma.AgentRunCountArgs<ExtArgs>
            result: $Utils.Optional<AgentRunCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    requisition?: RequisitionOmit
    jobPosting?: JobPostingOmit
    applicationFormSchema?: ApplicationFormSchemaOmit
    skill?: SkillOmit
    outbox?: OutboxOmit
    agentRun?: AgentRunOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type RequisitionCountOutputType
   */

  export type RequisitionCountOutputType = {
    jobPostings: number
  }

  export type RequisitionCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    jobPostings?: boolean | RequisitionCountOutputTypeCountJobPostingsArgs
  }

  // Custom InputTypes
  /**
   * RequisitionCountOutputType without action
   */
  export type RequisitionCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequisitionCountOutputType
     */
    select?: RequisitionCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * RequisitionCountOutputType without action
   */
  export type RequisitionCountOutputTypeCountJobPostingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: JobPostingWhereInput
  }


  /**
   * Count Type SkillCountOutputType
   */

  export type SkillCountOutputType = {
    children: number
  }

  export type SkillCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    children?: boolean | SkillCountOutputTypeCountChildrenArgs
  }

  // Custom InputTypes
  /**
   * SkillCountOutputType without action
   */
  export type SkillCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SkillCountOutputType
     */
    select?: SkillCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * SkillCountOutputType without action
   */
  export type SkillCountOutputTypeCountChildrenArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SkillWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Requisition
   */

  export type AggregateRequisition = {
    _count: RequisitionCountAggregateOutputType | null
    _avg: RequisitionAvgAggregateOutputType | null
    _sum: RequisitionSumAggregateOutputType | null
    _min: RequisitionMinAggregateOutputType | null
    _max: RequisitionMaxAggregateOutputType | null
  }

  export type RequisitionAvgAggregateOutputType = {
    salaryMin: number | null
    salaryMax: number | null
    priority: number | null
    headcount: number | null
  }

  export type RequisitionSumAggregateOutputType = {
    salaryMin: number | null
    salaryMax: number | null
    priority: number | null
    headcount: number | null
  }

  export type RequisitionMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    title: string | null
    department: string | null
    location: string | null
    country: string | null
    jobFamily: string | null
    description: string | null
    salaryMin: number | null
    salaryMax: number | null
    salaryCurrency: string | null
    status: $Enums.RequisitionStatus | null
    priority: number | null
    hiringManagerId: string | null
    recruiterId: string | null
    headcount: number | null
    targetStartDate: Date | null
    createdAt: Date | null
    updatedAt: Date | null
    closedAt: Date | null
  }

  export type RequisitionMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    title: string | null
    department: string | null
    location: string | null
    country: string | null
    jobFamily: string | null
    description: string | null
    salaryMin: number | null
    salaryMax: number | null
    salaryCurrency: string | null
    status: $Enums.RequisitionStatus | null
    priority: number | null
    hiringManagerId: string | null
    recruiterId: string | null
    headcount: number | null
    targetStartDate: Date | null
    createdAt: Date | null
    updatedAt: Date | null
    closedAt: Date | null
  }

  export type RequisitionCountAggregateOutputType = {
    id: number
    tenantId: number
    title: number
    department: number
    location: number
    country: number
    jobFamily: number
    description: number
    requirements: number
    salaryMin: number
    salaryMax: number
    salaryCurrency: number
    status: number
    priority: number
    hiringManagerId: number
    recruiterId: number
    headcount: number
    targetStartDate: number
    createdAt: number
    updatedAt: number
    closedAt: number
    _all: number
  }


  export type RequisitionAvgAggregateInputType = {
    salaryMin?: true
    salaryMax?: true
    priority?: true
    headcount?: true
  }

  export type RequisitionSumAggregateInputType = {
    salaryMin?: true
    salaryMax?: true
    priority?: true
    headcount?: true
  }

  export type RequisitionMinAggregateInputType = {
    id?: true
    tenantId?: true
    title?: true
    department?: true
    location?: true
    country?: true
    jobFamily?: true
    description?: true
    salaryMin?: true
    salaryMax?: true
    salaryCurrency?: true
    status?: true
    priority?: true
    hiringManagerId?: true
    recruiterId?: true
    headcount?: true
    targetStartDate?: true
    createdAt?: true
    updatedAt?: true
    closedAt?: true
  }

  export type RequisitionMaxAggregateInputType = {
    id?: true
    tenantId?: true
    title?: true
    department?: true
    location?: true
    country?: true
    jobFamily?: true
    description?: true
    salaryMin?: true
    salaryMax?: true
    salaryCurrency?: true
    status?: true
    priority?: true
    hiringManagerId?: true
    recruiterId?: true
    headcount?: true
    targetStartDate?: true
    createdAt?: true
    updatedAt?: true
    closedAt?: true
  }

  export type RequisitionCountAggregateInputType = {
    id?: true
    tenantId?: true
    title?: true
    department?: true
    location?: true
    country?: true
    jobFamily?: true
    description?: true
    requirements?: true
    salaryMin?: true
    salaryMax?: true
    salaryCurrency?: true
    status?: true
    priority?: true
    hiringManagerId?: true
    recruiterId?: true
    headcount?: true
    targetStartDate?: true
    createdAt?: true
    updatedAt?: true
    closedAt?: true
    _all?: true
  }

  export type RequisitionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Requisition to aggregate.
     */
    where?: RequisitionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Requisitions to fetch.
     */
    orderBy?: RequisitionOrderByWithRelationInput | RequisitionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RequisitionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Requisitions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Requisitions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Requisitions
    **/
    _count?: true | RequisitionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: RequisitionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: RequisitionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RequisitionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RequisitionMaxAggregateInputType
  }

  export type GetRequisitionAggregateType<T extends RequisitionAggregateArgs> = {
        [P in keyof T & keyof AggregateRequisition]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRequisition[P]>
      : GetScalarType<T[P], AggregateRequisition[P]>
  }




  export type RequisitionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RequisitionWhereInput
    orderBy?: RequisitionOrderByWithAggregationInput | RequisitionOrderByWithAggregationInput[]
    by: RequisitionScalarFieldEnum[] | RequisitionScalarFieldEnum
    having?: RequisitionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RequisitionCountAggregateInputType | true
    _avg?: RequisitionAvgAggregateInputType
    _sum?: RequisitionSumAggregateInputType
    _min?: RequisitionMinAggregateInputType
    _max?: RequisitionMaxAggregateInputType
  }

  export type RequisitionGroupByOutputType = {
    id: string
    tenantId: string
    title: string
    department: string
    location: string
    country: string
    jobFamily: string | null
    description: string | null
    requirements: JsonValue
    salaryMin: number | null
    salaryMax: number | null
    salaryCurrency: string
    status: $Enums.RequisitionStatus
    priority: number
    hiringManagerId: string | null
    recruiterId: string | null
    headcount: number
    targetStartDate: Date | null
    createdAt: Date
    updatedAt: Date
    closedAt: Date | null
    _count: RequisitionCountAggregateOutputType | null
    _avg: RequisitionAvgAggregateOutputType | null
    _sum: RequisitionSumAggregateOutputType | null
    _min: RequisitionMinAggregateOutputType | null
    _max: RequisitionMaxAggregateOutputType | null
  }

  type GetRequisitionGroupByPayload<T extends RequisitionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RequisitionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RequisitionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RequisitionGroupByOutputType[P]>
            : GetScalarType<T[P], RequisitionGroupByOutputType[P]>
        }
      >
    >


  export type RequisitionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    title?: boolean
    department?: boolean
    location?: boolean
    country?: boolean
    jobFamily?: boolean
    description?: boolean
    requirements?: boolean
    salaryMin?: boolean
    salaryMax?: boolean
    salaryCurrency?: boolean
    status?: boolean
    priority?: boolean
    hiringManagerId?: boolean
    recruiterId?: boolean
    headcount?: boolean
    targetStartDate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    closedAt?: boolean
    jobPostings?: boolean | Requisition$jobPostingsArgs<ExtArgs>
    formSchema?: boolean | Requisition$formSchemaArgs<ExtArgs>
    _count?: boolean | RequisitionCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["requisition"]>

  export type RequisitionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    title?: boolean
    department?: boolean
    location?: boolean
    country?: boolean
    jobFamily?: boolean
    description?: boolean
    requirements?: boolean
    salaryMin?: boolean
    salaryMax?: boolean
    salaryCurrency?: boolean
    status?: boolean
    priority?: boolean
    hiringManagerId?: boolean
    recruiterId?: boolean
    headcount?: boolean
    targetStartDate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    closedAt?: boolean
  }, ExtArgs["result"]["requisition"]>

  export type RequisitionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    title?: boolean
    department?: boolean
    location?: boolean
    country?: boolean
    jobFamily?: boolean
    description?: boolean
    requirements?: boolean
    salaryMin?: boolean
    salaryMax?: boolean
    salaryCurrency?: boolean
    status?: boolean
    priority?: boolean
    hiringManagerId?: boolean
    recruiterId?: boolean
    headcount?: boolean
    targetStartDate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    closedAt?: boolean
  }, ExtArgs["result"]["requisition"]>

  export type RequisitionSelectScalar = {
    id?: boolean
    tenantId?: boolean
    title?: boolean
    department?: boolean
    location?: boolean
    country?: boolean
    jobFamily?: boolean
    description?: boolean
    requirements?: boolean
    salaryMin?: boolean
    salaryMax?: boolean
    salaryCurrency?: boolean
    status?: boolean
    priority?: boolean
    hiringManagerId?: boolean
    recruiterId?: boolean
    headcount?: boolean
    targetStartDate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    closedAt?: boolean
  }

  export type RequisitionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "title" | "department" | "location" | "country" | "jobFamily" | "description" | "requirements" | "salaryMin" | "salaryMax" | "salaryCurrency" | "status" | "priority" | "hiringManagerId" | "recruiterId" | "headcount" | "targetStartDate" | "createdAt" | "updatedAt" | "closedAt", ExtArgs["result"]["requisition"]>
  export type RequisitionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    jobPostings?: boolean | Requisition$jobPostingsArgs<ExtArgs>
    formSchema?: boolean | Requisition$formSchemaArgs<ExtArgs>
    _count?: boolean | RequisitionCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type RequisitionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type RequisitionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $RequisitionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Requisition"
    objects: {
      jobPostings: Prisma.$JobPostingPayload<ExtArgs>[]
      formSchema: Prisma.$ApplicationFormSchemaPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      title: string
      department: string
      location: string
      country: string
      jobFamily: string | null
      description: string | null
      requirements: Prisma.JsonValue
      salaryMin: number | null
      salaryMax: number | null
      salaryCurrency: string
      status: $Enums.RequisitionStatus
      priority: number
      hiringManagerId: string | null
      recruiterId: string | null
      headcount: number
      targetStartDate: Date | null
      createdAt: Date
      updatedAt: Date
      closedAt: Date | null
    }, ExtArgs["result"]["requisition"]>
    composites: {}
  }

  type RequisitionGetPayload<S extends boolean | null | undefined | RequisitionDefaultArgs> = $Result.GetResult<Prisma.$RequisitionPayload, S>

  type RequisitionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<RequisitionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: RequisitionCountAggregateInputType | true
    }

  export interface RequisitionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Requisition'], meta: { name: 'Requisition' } }
    /**
     * Find zero or one Requisition that matches the filter.
     * @param {RequisitionFindUniqueArgs} args - Arguments to find a Requisition
     * @example
     * // Get one Requisition
     * const requisition = await prisma.requisition.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RequisitionFindUniqueArgs>(args: SelectSubset<T, RequisitionFindUniqueArgs<ExtArgs>>): Prisma__RequisitionClient<$Result.GetResult<Prisma.$RequisitionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Requisition that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RequisitionFindUniqueOrThrowArgs} args - Arguments to find a Requisition
     * @example
     * // Get one Requisition
     * const requisition = await prisma.requisition.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RequisitionFindUniqueOrThrowArgs>(args: SelectSubset<T, RequisitionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RequisitionClient<$Result.GetResult<Prisma.$RequisitionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Requisition that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequisitionFindFirstArgs} args - Arguments to find a Requisition
     * @example
     * // Get one Requisition
     * const requisition = await prisma.requisition.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RequisitionFindFirstArgs>(args?: SelectSubset<T, RequisitionFindFirstArgs<ExtArgs>>): Prisma__RequisitionClient<$Result.GetResult<Prisma.$RequisitionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Requisition that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequisitionFindFirstOrThrowArgs} args - Arguments to find a Requisition
     * @example
     * // Get one Requisition
     * const requisition = await prisma.requisition.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RequisitionFindFirstOrThrowArgs>(args?: SelectSubset<T, RequisitionFindFirstOrThrowArgs<ExtArgs>>): Prisma__RequisitionClient<$Result.GetResult<Prisma.$RequisitionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Requisitions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequisitionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Requisitions
     * const requisitions = await prisma.requisition.findMany()
     * 
     * // Get first 10 Requisitions
     * const requisitions = await prisma.requisition.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const requisitionWithIdOnly = await prisma.requisition.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RequisitionFindManyArgs>(args?: SelectSubset<T, RequisitionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RequisitionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Requisition.
     * @param {RequisitionCreateArgs} args - Arguments to create a Requisition.
     * @example
     * // Create one Requisition
     * const Requisition = await prisma.requisition.create({
     *   data: {
     *     // ... data to create a Requisition
     *   }
     * })
     * 
     */
    create<T extends RequisitionCreateArgs>(args: SelectSubset<T, RequisitionCreateArgs<ExtArgs>>): Prisma__RequisitionClient<$Result.GetResult<Prisma.$RequisitionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Requisitions.
     * @param {RequisitionCreateManyArgs} args - Arguments to create many Requisitions.
     * @example
     * // Create many Requisitions
     * const requisition = await prisma.requisition.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RequisitionCreateManyArgs>(args?: SelectSubset<T, RequisitionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Requisitions and returns the data saved in the database.
     * @param {RequisitionCreateManyAndReturnArgs} args - Arguments to create many Requisitions.
     * @example
     * // Create many Requisitions
     * const requisition = await prisma.requisition.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Requisitions and only return the `id`
     * const requisitionWithIdOnly = await prisma.requisition.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RequisitionCreateManyAndReturnArgs>(args?: SelectSubset<T, RequisitionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RequisitionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Requisition.
     * @param {RequisitionDeleteArgs} args - Arguments to delete one Requisition.
     * @example
     * // Delete one Requisition
     * const Requisition = await prisma.requisition.delete({
     *   where: {
     *     // ... filter to delete one Requisition
     *   }
     * })
     * 
     */
    delete<T extends RequisitionDeleteArgs>(args: SelectSubset<T, RequisitionDeleteArgs<ExtArgs>>): Prisma__RequisitionClient<$Result.GetResult<Prisma.$RequisitionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Requisition.
     * @param {RequisitionUpdateArgs} args - Arguments to update one Requisition.
     * @example
     * // Update one Requisition
     * const requisition = await prisma.requisition.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RequisitionUpdateArgs>(args: SelectSubset<T, RequisitionUpdateArgs<ExtArgs>>): Prisma__RequisitionClient<$Result.GetResult<Prisma.$RequisitionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Requisitions.
     * @param {RequisitionDeleteManyArgs} args - Arguments to filter Requisitions to delete.
     * @example
     * // Delete a few Requisitions
     * const { count } = await prisma.requisition.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RequisitionDeleteManyArgs>(args?: SelectSubset<T, RequisitionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Requisitions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequisitionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Requisitions
     * const requisition = await prisma.requisition.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RequisitionUpdateManyArgs>(args: SelectSubset<T, RequisitionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Requisitions and returns the data updated in the database.
     * @param {RequisitionUpdateManyAndReturnArgs} args - Arguments to update many Requisitions.
     * @example
     * // Update many Requisitions
     * const requisition = await prisma.requisition.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Requisitions and only return the `id`
     * const requisitionWithIdOnly = await prisma.requisition.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends RequisitionUpdateManyAndReturnArgs>(args: SelectSubset<T, RequisitionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RequisitionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Requisition.
     * @param {RequisitionUpsertArgs} args - Arguments to update or create a Requisition.
     * @example
     * // Update or create a Requisition
     * const requisition = await prisma.requisition.upsert({
     *   create: {
     *     // ... data to create a Requisition
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Requisition we want to update
     *   }
     * })
     */
    upsert<T extends RequisitionUpsertArgs>(args: SelectSubset<T, RequisitionUpsertArgs<ExtArgs>>): Prisma__RequisitionClient<$Result.GetResult<Prisma.$RequisitionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Requisitions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequisitionCountArgs} args - Arguments to filter Requisitions to count.
     * @example
     * // Count the number of Requisitions
     * const count = await prisma.requisition.count({
     *   where: {
     *     // ... the filter for the Requisitions we want to count
     *   }
     * })
    **/
    count<T extends RequisitionCountArgs>(
      args?: Subset<T, RequisitionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RequisitionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Requisition.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequisitionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RequisitionAggregateArgs>(args: Subset<T, RequisitionAggregateArgs>): Prisma.PrismaPromise<GetRequisitionAggregateType<T>>

    /**
     * Group by Requisition.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequisitionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RequisitionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RequisitionGroupByArgs['orderBy'] }
        : { orderBy?: RequisitionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RequisitionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRequisitionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Requisition model
   */
  readonly fields: RequisitionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Requisition.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RequisitionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    jobPostings<T extends Requisition$jobPostingsArgs<ExtArgs> = {}>(args?: Subset<T, Requisition$jobPostingsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$JobPostingPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    formSchema<T extends Requisition$formSchemaArgs<ExtArgs> = {}>(args?: Subset<T, Requisition$formSchemaArgs<ExtArgs>>): Prisma__ApplicationFormSchemaClient<$Result.GetResult<Prisma.$ApplicationFormSchemaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Requisition model
   */
  interface RequisitionFieldRefs {
    readonly id: FieldRef<"Requisition", 'String'>
    readonly tenantId: FieldRef<"Requisition", 'String'>
    readonly title: FieldRef<"Requisition", 'String'>
    readonly department: FieldRef<"Requisition", 'String'>
    readonly location: FieldRef<"Requisition", 'String'>
    readonly country: FieldRef<"Requisition", 'String'>
    readonly jobFamily: FieldRef<"Requisition", 'String'>
    readonly description: FieldRef<"Requisition", 'String'>
    readonly requirements: FieldRef<"Requisition", 'Json'>
    readonly salaryMin: FieldRef<"Requisition", 'Float'>
    readonly salaryMax: FieldRef<"Requisition", 'Float'>
    readonly salaryCurrency: FieldRef<"Requisition", 'String'>
    readonly status: FieldRef<"Requisition", 'RequisitionStatus'>
    readonly priority: FieldRef<"Requisition", 'Int'>
    readonly hiringManagerId: FieldRef<"Requisition", 'String'>
    readonly recruiterId: FieldRef<"Requisition", 'String'>
    readonly headcount: FieldRef<"Requisition", 'Int'>
    readonly targetStartDate: FieldRef<"Requisition", 'DateTime'>
    readonly createdAt: FieldRef<"Requisition", 'DateTime'>
    readonly updatedAt: FieldRef<"Requisition", 'DateTime'>
    readonly closedAt: FieldRef<"Requisition", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Requisition findUnique
   */
  export type RequisitionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Requisition
     */
    select?: RequisitionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Requisition
     */
    omit?: RequisitionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequisitionInclude<ExtArgs> | null
    /**
     * Filter, which Requisition to fetch.
     */
    where: RequisitionWhereUniqueInput
  }

  /**
   * Requisition findUniqueOrThrow
   */
  export type RequisitionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Requisition
     */
    select?: RequisitionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Requisition
     */
    omit?: RequisitionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequisitionInclude<ExtArgs> | null
    /**
     * Filter, which Requisition to fetch.
     */
    where: RequisitionWhereUniqueInput
  }

  /**
   * Requisition findFirst
   */
  export type RequisitionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Requisition
     */
    select?: RequisitionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Requisition
     */
    omit?: RequisitionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequisitionInclude<ExtArgs> | null
    /**
     * Filter, which Requisition to fetch.
     */
    where?: RequisitionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Requisitions to fetch.
     */
    orderBy?: RequisitionOrderByWithRelationInput | RequisitionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Requisitions.
     */
    cursor?: RequisitionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Requisitions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Requisitions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Requisitions.
     */
    distinct?: RequisitionScalarFieldEnum | RequisitionScalarFieldEnum[]
  }

  /**
   * Requisition findFirstOrThrow
   */
  export type RequisitionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Requisition
     */
    select?: RequisitionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Requisition
     */
    omit?: RequisitionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequisitionInclude<ExtArgs> | null
    /**
     * Filter, which Requisition to fetch.
     */
    where?: RequisitionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Requisitions to fetch.
     */
    orderBy?: RequisitionOrderByWithRelationInput | RequisitionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Requisitions.
     */
    cursor?: RequisitionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Requisitions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Requisitions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Requisitions.
     */
    distinct?: RequisitionScalarFieldEnum | RequisitionScalarFieldEnum[]
  }

  /**
   * Requisition findMany
   */
  export type RequisitionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Requisition
     */
    select?: RequisitionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Requisition
     */
    omit?: RequisitionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequisitionInclude<ExtArgs> | null
    /**
     * Filter, which Requisitions to fetch.
     */
    where?: RequisitionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Requisitions to fetch.
     */
    orderBy?: RequisitionOrderByWithRelationInput | RequisitionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Requisitions.
     */
    cursor?: RequisitionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Requisitions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Requisitions.
     */
    skip?: number
    distinct?: RequisitionScalarFieldEnum | RequisitionScalarFieldEnum[]
  }

  /**
   * Requisition create
   */
  export type RequisitionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Requisition
     */
    select?: RequisitionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Requisition
     */
    omit?: RequisitionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequisitionInclude<ExtArgs> | null
    /**
     * The data needed to create a Requisition.
     */
    data: XOR<RequisitionCreateInput, RequisitionUncheckedCreateInput>
  }

  /**
   * Requisition createMany
   */
  export type RequisitionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Requisitions.
     */
    data: RequisitionCreateManyInput | RequisitionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Requisition createManyAndReturn
   */
  export type RequisitionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Requisition
     */
    select?: RequisitionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Requisition
     */
    omit?: RequisitionOmit<ExtArgs> | null
    /**
     * The data used to create many Requisitions.
     */
    data: RequisitionCreateManyInput | RequisitionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Requisition update
   */
  export type RequisitionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Requisition
     */
    select?: RequisitionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Requisition
     */
    omit?: RequisitionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequisitionInclude<ExtArgs> | null
    /**
     * The data needed to update a Requisition.
     */
    data: XOR<RequisitionUpdateInput, RequisitionUncheckedUpdateInput>
    /**
     * Choose, which Requisition to update.
     */
    where: RequisitionWhereUniqueInput
  }

  /**
   * Requisition updateMany
   */
  export type RequisitionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Requisitions.
     */
    data: XOR<RequisitionUpdateManyMutationInput, RequisitionUncheckedUpdateManyInput>
    /**
     * Filter which Requisitions to update
     */
    where?: RequisitionWhereInput
    /**
     * Limit how many Requisitions to update.
     */
    limit?: number
  }

  /**
   * Requisition updateManyAndReturn
   */
  export type RequisitionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Requisition
     */
    select?: RequisitionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Requisition
     */
    omit?: RequisitionOmit<ExtArgs> | null
    /**
     * The data used to update Requisitions.
     */
    data: XOR<RequisitionUpdateManyMutationInput, RequisitionUncheckedUpdateManyInput>
    /**
     * Filter which Requisitions to update
     */
    where?: RequisitionWhereInput
    /**
     * Limit how many Requisitions to update.
     */
    limit?: number
  }

  /**
   * Requisition upsert
   */
  export type RequisitionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Requisition
     */
    select?: RequisitionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Requisition
     */
    omit?: RequisitionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequisitionInclude<ExtArgs> | null
    /**
     * The filter to search for the Requisition to update in case it exists.
     */
    where: RequisitionWhereUniqueInput
    /**
     * In case the Requisition found by the `where` argument doesn't exist, create a new Requisition with this data.
     */
    create: XOR<RequisitionCreateInput, RequisitionUncheckedCreateInput>
    /**
     * In case the Requisition was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RequisitionUpdateInput, RequisitionUncheckedUpdateInput>
  }

  /**
   * Requisition delete
   */
  export type RequisitionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Requisition
     */
    select?: RequisitionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Requisition
     */
    omit?: RequisitionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequisitionInclude<ExtArgs> | null
    /**
     * Filter which Requisition to delete.
     */
    where: RequisitionWhereUniqueInput
  }

  /**
   * Requisition deleteMany
   */
  export type RequisitionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Requisitions to delete
     */
    where?: RequisitionWhereInput
    /**
     * Limit how many Requisitions to delete.
     */
    limit?: number
  }

  /**
   * Requisition.jobPostings
   */
  export type Requisition$jobPostingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobPosting
     */
    select?: JobPostingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the JobPosting
     */
    omit?: JobPostingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JobPostingInclude<ExtArgs> | null
    where?: JobPostingWhereInput
    orderBy?: JobPostingOrderByWithRelationInput | JobPostingOrderByWithRelationInput[]
    cursor?: JobPostingWhereUniqueInput
    take?: number
    skip?: number
    distinct?: JobPostingScalarFieldEnum | JobPostingScalarFieldEnum[]
  }

  /**
   * Requisition.formSchema
   */
  export type Requisition$formSchemaArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApplicationFormSchema
     */
    select?: ApplicationFormSchemaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApplicationFormSchema
     */
    omit?: ApplicationFormSchemaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationFormSchemaInclude<ExtArgs> | null
    where?: ApplicationFormSchemaWhereInput
  }

  /**
   * Requisition without action
   */
  export type RequisitionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Requisition
     */
    select?: RequisitionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Requisition
     */
    omit?: RequisitionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequisitionInclude<ExtArgs> | null
  }


  /**
   * Model JobPosting
   */

  export type AggregateJobPosting = {
    _count: JobPostingCountAggregateOutputType | null
    _avg: JobPostingAvgAggregateOutputType | null
    _sum: JobPostingSumAggregateOutputType | null
    _min: JobPostingMinAggregateOutputType | null
    _max: JobPostingMaxAggregateOutputType | null
  }

  export type JobPostingAvgAggregateOutputType = {
    views: number | null
    applicationCount: number | null
  }

  export type JobPostingSumAggregateOutputType = {
    views: number | null
    applicationCount: number | null
  }

  export type JobPostingMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    requisitionId: string | null
    slug: string | null
    title: string | null
    description: string | null
    isPublished: boolean | null
    publishedAt: Date | null
    expiresAt: Date | null
    views: number | null
    applicationCount: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type JobPostingMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    requisitionId: string | null
    slug: string | null
    title: string | null
    description: string | null
    isPublished: boolean | null
    publishedAt: Date | null
    expiresAt: Date | null
    views: number | null
    applicationCount: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type JobPostingCountAggregateOutputType = {
    id: number
    tenantId: number
    requisitionId: number
    slug: number
    title: number
    description: number
    requirements: number
    isPublished: number
    publishedAt: number
    expiresAt: number
    views: number
    applicationCount: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type JobPostingAvgAggregateInputType = {
    views?: true
    applicationCount?: true
  }

  export type JobPostingSumAggregateInputType = {
    views?: true
    applicationCount?: true
  }

  export type JobPostingMinAggregateInputType = {
    id?: true
    tenantId?: true
    requisitionId?: true
    slug?: true
    title?: true
    description?: true
    isPublished?: true
    publishedAt?: true
    expiresAt?: true
    views?: true
    applicationCount?: true
    createdAt?: true
    updatedAt?: true
  }

  export type JobPostingMaxAggregateInputType = {
    id?: true
    tenantId?: true
    requisitionId?: true
    slug?: true
    title?: true
    description?: true
    isPublished?: true
    publishedAt?: true
    expiresAt?: true
    views?: true
    applicationCount?: true
    createdAt?: true
    updatedAt?: true
  }

  export type JobPostingCountAggregateInputType = {
    id?: true
    tenantId?: true
    requisitionId?: true
    slug?: true
    title?: true
    description?: true
    requirements?: true
    isPublished?: true
    publishedAt?: true
    expiresAt?: true
    views?: true
    applicationCount?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type JobPostingAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which JobPosting to aggregate.
     */
    where?: JobPostingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of JobPostings to fetch.
     */
    orderBy?: JobPostingOrderByWithRelationInput | JobPostingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: JobPostingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` JobPostings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` JobPostings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned JobPostings
    **/
    _count?: true | JobPostingCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: JobPostingAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: JobPostingSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: JobPostingMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: JobPostingMaxAggregateInputType
  }

  export type GetJobPostingAggregateType<T extends JobPostingAggregateArgs> = {
        [P in keyof T & keyof AggregateJobPosting]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateJobPosting[P]>
      : GetScalarType<T[P], AggregateJobPosting[P]>
  }




  export type JobPostingGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: JobPostingWhereInput
    orderBy?: JobPostingOrderByWithAggregationInput | JobPostingOrderByWithAggregationInput[]
    by: JobPostingScalarFieldEnum[] | JobPostingScalarFieldEnum
    having?: JobPostingScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: JobPostingCountAggregateInputType | true
    _avg?: JobPostingAvgAggregateInputType
    _sum?: JobPostingSumAggregateInputType
    _min?: JobPostingMinAggregateInputType
    _max?: JobPostingMaxAggregateInputType
  }

  export type JobPostingGroupByOutputType = {
    id: string
    tenantId: string
    requisitionId: string
    slug: string
    title: string
    description: string
    requirements: string[]
    isPublished: boolean
    publishedAt: Date | null
    expiresAt: Date | null
    views: number
    applicationCount: number
    createdAt: Date
    updatedAt: Date
    _count: JobPostingCountAggregateOutputType | null
    _avg: JobPostingAvgAggregateOutputType | null
    _sum: JobPostingSumAggregateOutputType | null
    _min: JobPostingMinAggregateOutputType | null
    _max: JobPostingMaxAggregateOutputType | null
  }

  type GetJobPostingGroupByPayload<T extends JobPostingGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<JobPostingGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof JobPostingGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], JobPostingGroupByOutputType[P]>
            : GetScalarType<T[P], JobPostingGroupByOutputType[P]>
        }
      >
    >


  export type JobPostingSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    requisitionId?: boolean
    slug?: boolean
    title?: boolean
    description?: boolean
    requirements?: boolean
    isPublished?: boolean
    publishedAt?: boolean
    expiresAt?: boolean
    views?: boolean
    applicationCount?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    requisition?: boolean | RequisitionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["jobPosting"]>

  export type JobPostingSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    requisitionId?: boolean
    slug?: boolean
    title?: boolean
    description?: boolean
    requirements?: boolean
    isPublished?: boolean
    publishedAt?: boolean
    expiresAt?: boolean
    views?: boolean
    applicationCount?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    requisition?: boolean | RequisitionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["jobPosting"]>

  export type JobPostingSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    requisitionId?: boolean
    slug?: boolean
    title?: boolean
    description?: boolean
    requirements?: boolean
    isPublished?: boolean
    publishedAt?: boolean
    expiresAt?: boolean
    views?: boolean
    applicationCount?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    requisition?: boolean | RequisitionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["jobPosting"]>

  export type JobPostingSelectScalar = {
    id?: boolean
    tenantId?: boolean
    requisitionId?: boolean
    slug?: boolean
    title?: boolean
    description?: boolean
    requirements?: boolean
    isPublished?: boolean
    publishedAt?: boolean
    expiresAt?: boolean
    views?: boolean
    applicationCount?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type JobPostingOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "requisitionId" | "slug" | "title" | "description" | "requirements" | "isPublished" | "publishedAt" | "expiresAt" | "views" | "applicationCount" | "createdAt" | "updatedAt", ExtArgs["result"]["jobPosting"]>
  export type JobPostingInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    requisition?: boolean | RequisitionDefaultArgs<ExtArgs>
  }
  export type JobPostingIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    requisition?: boolean | RequisitionDefaultArgs<ExtArgs>
  }
  export type JobPostingIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    requisition?: boolean | RequisitionDefaultArgs<ExtArgs>
  }

  export type $JobPostingPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "JobPosting"
    objects: {
      requisition: Prisma.$RequisitionPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      requisitionId: string
      slug: string
      title: string
      description: string
      requirements: string[]
      isPublished: boolean
      publishedAt: Date | null
      expiresAt: Date | null
      views: number
      applicationCount: number
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["jobPosting"]>
    composites: {}
  }

  type JobPostingGetPayload<S extends boolean | null | undefined | JobPostingDefaultArgs> = $Result.GetResult<Prisma.$JobPostingPayload, S>

  type JobPostingCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<JobPostingFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: JobPostingCountAggregateInputType | true
    }

  export interface JobPostingDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['JobPosting'], meta: { name: 'JobPosting' } }
    /**
     * Find zero or one JobPosting that matches the filter.
     * @param {JobPostingFindUniqueArgs} args - Arguments to find a JobPosting
     * @example
     * // Get one JobPosting
     * const jobPosting = await prisma.jobPosting.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends JobPostingFindUniqueArgs>(args: SelectSubset<T, JobPostingFindUniqueArgs<ExtArgs>>): Prisma__JobPostingClient<$Result.GetResult<Prisma.$JobPostingPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one JobPosting that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {JobPostingFindUniqueOrThrowArgs} args - Arguments to find a JobPosting
     * @example
     * // Get one JobPosting
     * const jobPosting = await prisma.jobPosting.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends JobPostingFindUniqueOrThrowArgs>(args: SelectSubset<T, JobPostingFindUniqueOrThrowArgs<ExtArgs>>): Prisma__JobPostingClient<$Result.GetResult<Prisma.$JobPostingPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first JobPosting that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JobPostingFindFirstArgs} args - Arguments to find a JobPosting
     * @example
     * // Get one JobPosting
     * const jobPosting = await prisma.jobPosting.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends JobPostingFindFirstArgs>(args?: SelectSubset<T, JobPostingFindFirstArgs<ExtArgs>>): Prisma__JobPostingClient<$Result.GetResult<Prisma.$JobPostingPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first JobPosting that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JobPostingFindFirstOrThrowArgs} args - Arguments to find a JobPosting
     * @example
     * // Get one JobPosting
     * const jobPosting = await prisma.jobPosting.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends JobPostingFindFirstOrThrowArgs>(args?: SelectSubset<T, JobPostingFindFirstOrThrowArgs<ExtArgs>>): Prisma__JobPostingClient<$Result.GetResult<Prisma.$JobPostingPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more JobPostings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JobPostingFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all JobPostings
     * const jobPostings = await prisma.jobPosting.findMany()
     * 
     * // Get first 10 JobPostings
     * const jobPostings = await prisma.jobPosting.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const jobPostingWithIdOnly = await prisma.jobPosting.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends JobPostingFindManyArgs>(args?: SelectSubset<T, JobPostingFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$JobPostingPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a JobPosting.
     * @param {JobPostingCreateArgs} args - Arguments to create a JobPosting.
     * @example
     * // Create one JobPosting
     * const JobPosting = await prisma.jobPosting.create({
     *   data: {
     *     // ... data to create a JobPosting
     *   }
     * })
     * 
     */
    create<T extends JobPostingCreateArgs>(args: SelectSubset<T, JobPostingCreateArgs<ExtArgs>>): Prisma__JobPostingClient<$Result.GetResult<Prisma.$JobPostingPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many JobPostings.
     * @param {JobPostingCreateManyArgs} args - Arguments to create many JobPostings.
     * @example
     * // Create many JobPostings
     * const jobPosting = await prisma.jobPosting.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends JobPostingCreateManyArgs>(args?: SelectSubset<T, JobPostingCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many JobPostings and returns the data saved in the database.
     * @param {JobPostingCreateManyAndReturnArgs} args - Arguments to create many JobPostings.
     * @example
     * // Create many JobPostings
     * const jobPosting = await prisma.jobPosting.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many JobPostings and only return the `id`
     * const jobPostingWithIdOnly = await prisma.jobPosting.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends JobPostingCreateManyAndReturnArgs>(args?: SelectSubset<T, JobPostingCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$JobPostingPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a JobPosting.
     * @param {JobPostingDeleteArgs} args - Arguments to delete one JobPosting.
     * @example
     * // Delete one JobPosting
     * const JobPosting = await prisma.jobPosting.delete({
     *   where: {
     *     // ... filter to delete one JobPosting
     *   }
     * })
     * 
     */
    delete<T extends JobPostingDeleteArgs>(args: SelectSubset<T, JobPostingDeleteArgs<ExtArgs>>): Prisma__JobPostingClient<$Result.GetResult<Prisma.$JobPostingPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one JobPosting.
     * @param {JobPostingUpdateArgs} args - Arguments to update one JobPosting.
     * @example
     * // Update one JobPosting
     * const jobPosting = await prisma.jobPosting.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends JobPostingUpdateArgs>(args: SelectSubset<T, JobPostingUpdateArgs<ExtArgs>>): Prisma__JobPostingClient<$Result.GetResult<Prisma.$JobPostingPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more JobPostings.
     * @param {JobPostingDeleteManyArgs} args - Arguments to filter JobPostings to delete.
     * @example
     * // Delete a few JobPostings
     * const { count } = await prisma.jobPosting.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends JobPostingDeleteManyArgs>(args?: SelectSubset<T, JobPostingDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more JobPostings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JobPostingUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many JobPostings
     * const jobPosting = await prisma.jobPosting.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends JobPostingUpdateManyArgs>(args: SelectSubset<T, JobPostingUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more JobPostings and returns the data updated in the database.
     * @param {JobPostingUpdateManyAndReturnArgs} args - Arguments to update many JobPostings.
     * @example
     * // Update many JobPostings
     * const jobPosting = await prisma.jobPosting.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more JobPostings and only return the `id`
     * const jobPostingWithIdOnly = await prisma.jobPosting.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends JobPostingUpdateManyAndReturnArgs>(args: SelectSubset<T, JobPostingUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$JobPostingPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one JobPosting.
     * @param {JobPostingUpsertArgs} args - Arguments to update or create a JobPosting.
     * @example
     * // Update or create a JobPosting
     * const jobPosting = await prisma.jobPosting.upsert({
     *   create: {
     *     // ... data to create a JobPosting
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the JobPosting we want to update
     *   }
     * })
     */
    upsert<T extends JobPostingUpsertArgs>(args: SelectSubset<T, JobPostingUpsertArgs<ExtArgs>>): Prisma__JobPostingClient<$Result.GetResult<Prisma.$JobPostingPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of JobPostings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JobPostingCountArgs} args - Arguments to filter JobPostings to count.
     * @example
     * // Count the number of JobPostings
     * const count = await prisma.jobPosting.count({
     *   where: {
     *     // ... the filter for the JobPostings we want to count
     *   }
     * })
    **/
    count<T extends JobPostingCountArgs>(
      args?: Subset<T, JobPostingCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], JobPostingCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a JobPosting.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JobPostingAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends JobPostingAggregateArgs>(args: Subset<T, JobPostingAggregateArgs>): Prisma.PrismaPromise<GetJobPostingAggregateType<T>>

    /**
     * Group by JobPosting.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JobPostingGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends JobPostingGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: JobPostingGroupByArgs['orderBy'] }
        : { orderBy?: JobPostingGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, JobPostingGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetJobPostingGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the JobPosting model
   */
  readonly fields: JobPostingFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for JobPosting.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__JobPostingClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    requisition<T extends RequisitionDefaultArgs<ExtArgs> = {}>(args?: Subset<T, RequisitionDefaultArgs<ExtArgs>>): Prisma__RequisitionClient<$Result.GetResult<Prisma.$RequisitionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the JobPosting model
   */
  interface JobPostingFieldRefs {
    readonly id: FieldRef<"JobPosting", 'String'>
    readonly tenantId: FieldRef<"JobPosting", 'String'>
    readonly requisitionId: FieldRef<"JobPosting", 'String'>
    readonly slug: FieldRef<"JobPosting", 'String'>
    readonly title: FieldRef<"JobPosting", 'String'>
    readonly description: FieldRef<"JobPosting", 'String'>
    readonly requirements: FieldRef<"JobPosting", 'String[]'>
    readonly isPublished: FieldRef<"JobPosting", 'Boolean'>
    readonly publishedAt: FieldRef<"JobPosting", 'DateTime'>
    readonly expiresAt: FieldRef<"JobPosting", 'DateTime'>
    readonly views: FieldRef<"JobPosting", 'Int'>
    readonly applicationCount: FieldRef<"JobPosting", 'Int'>
    readonly createdAt: FieldRef<"JobPosting", 'DateTime'>
    readonly updatedAt: FieldRef<"JobPosting", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * JobPosting findUnique
   */
  export type JobPostingFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobPosting
     */
    select?: JobPostingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the JobPosting
     */
    omit?: JobPostingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JobPostingInclude<ExtArgs> | null
    /**
     * Filter, which JobPosting to fetch.
     */
    where: JobPostingWhereUniqueInput
  }

  /**
   * JobPosting findUniqueOrThrow
   */
  export type JobPostingFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobPosting
     */
    select?: JobPostingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the JobPosting
     */
    omit?: JobPostingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JobPostingInclude<ExtArgs> | null
    /**
     * Filter, which JobPosting to fetch.
     */
    where: JobPostingWhereUniqueInput
  }

  /**
   * JobPosting findFirst
   */
  export type JobPostingFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobPosting
     */
    select?: JobPostingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the JobPosting
     */
    omit?: JobPostingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JobPostingInclude<ExtArgs> | null
    /**
     * Filter, which JobPosting to fetch.
     */
    where?: JobPostingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of JobPostings to fetch.
     */
    orderBy?: JobPostingOrderByWithRelationInput | JobPostingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for JobPostings.
     */
    cursor?: JobPostingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` JobPostings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` JobPostings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of JobPostings.
     */
    distinct?: JobPostingScalarFieldEnum | JobPostingScalarFieldEnum[]
  }

  /**
   * JobPosting findFirstOrThrow
   */
  export type JobPostingFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobPosting
     */
    select?: JobPostingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the JobPosting
     */
    omit?: JobPostingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JobPostingInclude<ExtArgs> | null
    /**
     * Filter, which JobPosting to fetch.
     */
    where?: JobPostingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of JobPostings to fetch.
     */
    orderBy?: JobPostingOrderByWithRelationInput | JobPostingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for JobPostings.
     */
    cursor?: JobPostingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` JobPostings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` JobPostings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of JobPostings.
     */
    distinct?: JobPostingScalarFieldEnum | JobPostingScalarFieldEnum[]
  }

  /**
   * JobPosting findMany
   */
  export type JobPostingFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobPosting
     */
    select?: JobPostingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the JobPosting
     */
    omit?: JobPostingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JobPostingInclude<ExtArgs> | null
    /**
     * Filter, which JobPostings to fetch.
     */
    where?: JobPostingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of JobPostings to fetch.
     */
    orderBy?: JobPostingOrderByWithRelationInput | JobPostingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing JobPostings.
     */
    cursor?: JobPostingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` JobPostings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` JobPostings.
     */
    skip?: number
    distinct?: JobPostingScalarFieldEnum | JobPostingScalarFieldEnum[]
  }

  /**
   * JobPosting create
   */
  export type JobPostingCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobPosting
     */
    select?: JobPostingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the JobPosting
     */
    omit?: JobPostingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JobPostingInclude<ExtArgs> | null
    /**
     * The data needed to create a JobPosting.
     */
    data: XOR<JobPostingCreateInput, JobPostingUncheckedCreateInput>
  }

  /**
   * JobPosting createMany
   */
  export type JobPostingCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many JobPostings.
     */
    data: JobPostingCreateManyInput | JobPostingCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * JobPosting createManyAndReturn
   */
  export type JobPostingCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobPosting
     */
    select?: JobPostingSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the JobPosting
     */
    omit?: JobPostingOmit<ExtArgs> | null
    /**
     * The data used to create many JobPostings.
     */
    data: JobPostingCreateManyInput | JobPostingCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JobPostingIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * JobPosting update
   */
  export type JobPostingUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobPosting
     */
    select?: JobPostingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the JobPosting
     */
    omit?: JobPostingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JobPostingInclude<ExtArgs> | null
    /**
     * The data needed to update a JobPosting.
     */
    data: XOR<JobPostingUpdateInput, JobPostingUncheckedUpdateInput>
    /**
     * Choose, which JobPosting to update.
     */
    where: JobPostingWhereUniqueInput
  }

  /**
   * JobPosting updateMany
   */
  export type JobPostingUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update JobPostings.
     */
    data: XOR<JobPostingUpdateManyMutationInput, JobPostingUncheckedUpdateManyInput>
    /**
     * Filter which JobPostings to update
     */
    where?: JobPostingWhereInput
    /**
     * Limit how many JobPostings to update.
     */
    limit?: number
  }

  /**
   * JobPosting updateManyAndReturn
   */
  export type JobPostingUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobPosting
     */
    select?: JobPostingSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the JobPosting
     */
    omit?: JobPostingOmit<ExtArgs> | null
    /**
     * The data used to update JobPostings.
     */
    data: XOR<JobPostingUpdateManyMutationInput, JobPostingUncheckedUpdateManyInput>
    /**
     * Filter which JobPostings to update
     */
    where?: JobPostingWhereInput
    /**
     * Limit how many JobPostings to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JobPostingIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * JobPosting upsert
   */
  export type JobPostingUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobPosting
     */
    select?: JobPostingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the JobPosting
     */
    omit?: JobPostingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JobPostingInclude<ExtArgs> | null
    /**
     * The filter to search for the JobPosting to update in case it exists.
     */
    where: JobPostingWhereUniqueInput
    /**
     * In case the JobPosting found by the `where` argument doesn't exist, create a new JobPosting with this data.
     */
    create: XOR<JobPostingCreateInput, JobPostingUncheckedCreateInput>
    /**
     * In case the JobPosting was found with the provided `where` argument, update it with this data.
     */
    update: XOR<JobPostingUpdateInput, JobPostingUncheckedUpdateInput>
  }

  /**
   * JobPosting delete
   */
  export type JobPostingDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobPosting
     */
    select?: JobPostingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the JobPosting
     */
    omit?: JobPostingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JobPostingInclude<ExtArgs> | null
    /**
     * Filter which JobPosting to delete.
     */
    where: JobPostingWhereUniqueInput
  }

  /**
   * JobPosting deleteMany
   */
  export type JobPostingDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which JobPostings to delete
     */
    where?: JobPostingWhereInput
    /**
     * Limit how many JobPostings to delete.
     */
    limit?: number
  }

  /**
   * JobPosting without action
   */
  export type JobPostingDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobPosting
     */
    select?: JobPostingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the JobPosting
     */
    omit?: JobPostingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JobPostingInclude<ExtArgs> | null
  }


  /**
   * Model ApplicationFormSchema
   */

  export type AggregateApplicationFormSchema = {
    _count: ApplicationFormSchemaCountAggregateOutputType | null
    _min: ApplicationFormSchemaMinAggregateOutputType | null
    _max: ApplicationFormSchemaMaxAggregateOutputType | null
  }

  export type ApplicationFormSchemaMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    requisitionId: string | null
    name: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ApplicationFormSchemaMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    requisitionId: string | null
    name: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ApplicationFormSchemaCountAggregateOutputType = {
    id: number
    tenantId: number
    requisitionId: number
    name: number
    fields: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ApplicationFormSchemaMinAggregateInputType = {
    id?: true
    tenantId?: true
    requisitionId?: true
    name?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ApplicationFormSchemaMaxAggregateInputType = {
    id?: true
    tenantId?: true
    requisitionId?: true
    name?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ApplicationFormSchemaCountAggregateInputType = {
    id?: true
    tenantId?: true
    requisitionId?: true
    name?: true
    fields?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ApplicationFormSchemaAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ApplicationFormSchema to aggregate.
     */
    where?: ApplicationFormSchemaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ApplicationFormSchemas to fetch.
     */
    orderBy?: ApplicationFormSchemaOrderByWithRelationInput | ApplicationFormSchemaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ApplicationFormSchemaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ApplicationFormSchemas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ApplicationFormSchemas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ApplicationFormSchemas
    **/
    _count?: true | ApplicationFormSchemaCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ApplicationFormSchemaMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ApplicationFormSchemaMaxAggregateInputType
  }

  export type GetApplicationFormSchemaAggregateType<T extends ApplicationFormSchemaAggregateArgs> = {
        [P in keyof T & keyof AggregateApplicationFormSchema]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateApplicationFormSchema[P]>
      : GetScalarType<T[P], AggregateApplicationFormSchema[P]>
  }




  export type ApplicationFormSchemaGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ApplicationFormSchemaWhereInput
    orderBy?: ApplicationFormSchemaOrderByWithAggregationInput | ApplicationFormSchemaOrderByWithAggregationInput[]
    by: ApplicationFormSchemaScalarFieldEnum[] | ApplicationFormSchemaScalarFieldEnum
    having?: ApplicationFormSchemaScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ApplicationFormSchemaCountAggregateInputType | true
    _min?: ApplicationFormSchemaMinAggregateInputType
    _max?: ApplicationFormSchemaMaxAggregateInputType
  }

  export type ApplicationFormSchemaGroupByOutputType = {
    id: string
    tenantId: string
    requisitionId: string
    name: string
    fields: JsonValue
    createdAt: Date
    updatedAt: Date
    _count: ApplicationFormSchemaCountAggregateOutputType | null
    _min: ApplicationFormSchemaMinAggregateOutputType | null
    _max: ApplicationFormSchemaMaxAggregateOutputType | null
  }

  type GetApplicationFormSchemaGroupByPayload<T extends ApplicationFormSchemaGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ApplicationFormSchemaGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ApplicationFormSchemaGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ApplicationFormSchemaGroupByOutputType[P]>
            : GetScalarType<T[P], ApplicationFormSchemaGroupByOutputType[P]>
        }
      >
    >


  export type ApplicationFormSchemaSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    requisitionId?: boolean
    name?: boolean
    fields?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    requisition?: boolean | RequisitionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["applicationFormSchema"]>

  export type ApplicationFormSchemaSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    requisitionId?: boolean
    name?: boolean
    fields?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    requisition?: boolean | RequisitionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["applicationFormSchema"]>

  export type ApplicationFormSchemaSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    requisitionId?: boolean
    name?: boolean
    fields?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    requisition?: boolean | RequisitionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["applicationFormSchema"]>

  export type ApplicationFormSchemaSelectScalar = {
    id?: boolean
    tenantId?: boolean
    requisitionId?: boolean
    name?: boolean
    fields?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ApplicationFormSchemaOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "requisitionId" | "name" | "fields" | "createdAt" | "updatedAt", ExtArgs["result"]["applicationFormSchema"]>
  export type ApplicationFormSchemaInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    requisition?: boolean | RequisitionDefaultArgs<ExtArgs>
  }
  export type ApplicationFormSchemaIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    requisition?: boolean | RequisitionDefaultArgs<ExtArgs>
  }
  export type ApplicationFormSchemaIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    requisition?: boolean | RequisitionDefaultArgs<ExtArgs>
  }

  export type $ApplicationFormSchemaPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ApplicationFormSchema"
    objects: {
      requisition: Prisma.$RequisitionPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      requisitionId: string
      name: string
      fields: Prisma.JsonValue
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["applicationFormSchema"]>
    composites: {}
  }

  type ApplicationFormSchemaGetPayload<S extends boolean | null | undefined | ApplicationFormSchemaDefaultArgs> = $Result.GetResult<Prisma.$ApplicationFormSchemaPayload, S>

  type ApplicationFormSchemaCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ApplicationFormSchemaFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ApplicationFormSchemaCountAggregateInputType | true
    }

  export interface ApplicationFormSchemaDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ApplicationFormSchema'], meta: { name: 'ApplicationFormSchema' } }
    /**
     * Find zero or one ApplicationFormSchema that matches the filter.
     * @param {ApplicationFormSchemaFindUniqueArgs} args - Arguments to find a ApplicationFormSchema
     * @example
     * // Get one ApplicationFormSchema
     * const applicationFormSchema = await prisma.applicationFormSchema.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ApplicationFormSchemaFindUniqueArgs>(args: SelectSubset<T, ApplicationFormSchemaFindUniqueArgs<ExtArgs>>): Prisma__ApplicationFormSchemaClient<$Result.GetResult<Prisma.$ApplicationFormSchemaPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ApplicationFormSchema that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ApplicationFormSchemaFindUniqueOrThrowArgs} args - Arguments to find a ApplicationFormSchema
     * @example
     * // Get one ApplicationFormSchema
     * const applicationFormSchema = await prisma.applicationFormSchema.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ApplicationFormSchemaFindUniqueOrThrowArgs>(args: SelectSubset<T, ApplicationFormSchemaFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ApplicationFormSchemaClient<$Result.GetResult<Prisma.$ApplicationFormSchemaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ApplicationFormSchema that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApplicationFormSchemaFindFirstArgs} args - Arguments to find a ApplicationFormSchema
     * @example
     * // Get one ApplicationFormSchema
     * const applicationFormSchema = await prisma.applicationFormSchema.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ApplicationFormSchemaFindFirstArgs>(args?: SelectSubset<T, ApplicationFormSchemaFindFirstArgs<ExtArgs>>): Prisma__ApplicationFormSchemaClient<$Result.GetResult<Prisma.$ApplicationFormSchemaPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ApplicationFormSchema that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApplicationFormSchemaFindFirstOrThrowArgs} args - Arguments to find a ApplicationFormSchema
     * @example
     * // Get one ApplicationFormSchema
     * const applicationFormSchema = await prisma.applicationFormSchema.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ApplicationFormSchemaFindFirstOrThrowArgs>(args?: SelectSubset<T, ApplicationFormSchemaFindFirstOrThrowArgs<ExtArgs>>): Prisma__ApplicationFormSchemaClient<$Result.GetResult<Prisma.$ApplicationFormSchemaPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ApplicationFormSchemas that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApplicationFormSchemaFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ApplicationFormSchemas
     * const applicationFormSchemas = await prisma.applicationFormSchema.findMany()
     * 
     * // Get first 10 ApplicationFormSchemas
     * const applicationFormSchemas = await prisma.applicationFormSchema.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const applicationFormSchemaWithIdOnly = await prisma.applicationFormSchema.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ApplicationFormSchemaFindManyArgs>(args?: SelectSubset<T, ApplicationFormSchemaFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ApplicationFormSchemaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ApplicationFormSchema.
     * @param {ApplicationFormSchemaCreateArgs} args - Arguments to create a ApplicationFormSchema.
     * @example
     * // Create one ApplicationFormSchema
     * const ApplicationFormSchema = await prisma.applicationFormSchema.create({
     *   data: {
     *     // ... data to create a ApplicationFormSchema
     *   }
     * })
     * 
     */
    create<T extends ApplicationFormSchemaCreateArgs>(args: SelectSubset<T, ApplicationFormSchemaCreateArgs<ExtArgs>>): Prisma__ApplicationFormSchemaClient<$Result.GetResult<Prisma.$ApplicationFormSchemaPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ApplicationFormSchemas.
     * @param {ApplicationFormSchemaCreateManyArgs} args - Arguments to create many ApplicationFormSchemas.
     * @example
     * // Create many ApplicationFormSchemas
     * const applicationFormSchema = await prisma.applicationFormSchema.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ApplicationFormSchemaCreateManyArgs>(args?: SelectSubset<T, ApplicationFormSchemaCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ApplicationFormSchemas and returns the data saved in the database.
     * @param {ApplicationFormSchemaCreateManyAndReturnArgs} args - Arguments to create many ApplicationFormSchemas.
     * @example
     * // Create many ApplicationFormSchemas
     * const applicationFormSchema = await prisma.applicationFormSchema.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ApplicationFormSchemas and only return the `id`
     * const applicationFormSchemaWithIdOnly = await prisma.applicationFormSchema.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ApplicationFormSchemaCreateManyAndReturnArgs>(args?: SelectSubset<T, ApplicationFormSchemaCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ApplicationFormSchemaPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ApplicationFormSchema.
     * @param {ApplicationFormSchemaDeleteArgs} args - Arguments to delete one ApplicationFormSchema.
     * @example
     * // Delete one ApplicationFormSchema
     * const ApplicationFormSchema = await prisma.applicationFormSchema.delete({
     *   where: {
     *     // ... filter to delete one ApplicationFormSchema
     *   }
     * })
     * 
     */
    delete<T extends ApplicationFormSchemaDeleteArgs>(args: SelectSubset<T, ApplicationFormSchemaDeleteArgs<ExtArgs>>): Prisma__ApplicationFormSchemaClient<$Result.GetResult<Prisma.$ApplicationFormSchemaPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ApplicationFormSchema.
     * @param {ApplicationFormSchemaUpdateArgs} args - Arguments to update one ApplicationFormSchema.
     * @example
     * // Update one ApplicationFormSchema
     * const applicationFormSchema = await prisma.applicationFormSchema.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ApplicationFormSchemaUpdateArgs>(args: SelectSubset<T, ApplicationFormSchemaUpdateArgs<ExtArgs>>): Prisma__ApplicationFormSchemaClient<$Result.GetResult<Prisma.$ApplicationFormSchemaPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ApplicationFormSchemas.
     * @param {ApplicationFormSchemaDeleteManyArgs} args - Arguments to filter ApplicationFormSchemas to delete.
     * @example
     * // Delete a few ApplicationFormSchemas
     * const { count } = await prisma.applicationFormSchema.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ApplicationFormSchemaDeleteManyArgs>(args?: SelectSubset<T, ApplicationFormSchemaDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ApplicationFormSchemas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApplicationFormSchemaUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ApplicationFormSchemas
     * const applicationFormSchema = await prisma.applicationFormSchema.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ApplicationFormSchemaUpdateManyArgs>(args: SelectSubset<T, ApplicationFormSchemaUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ApplicationFormSchemas and returns the data updated in the database.
     * @param {ApplicationFormSchemaUpdateManyAndReturnArgs} args - Arguments to update many ApplicationFormSchemas.
     * @example
     * // Update many ApplicationFormSchemas
     * const applicationFormSchema = await prisma.applicationFormSchema.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ApplicationFormSchemas and only return the `id`
     * const applicationFormSchemaWithIdOnly = await prisma.applicationFormSchema.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ApplicationFormSchemaUpdateManyAndReturnArgs>(args: SelectSubset<T, ApplicationFormSchemaUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ApplicationFormSchemaPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ApplicationFormSchema.
     * @param {ApplicationFormSchemaUpsertArgs} args - Arguments to update or create a ApplicationFormSchema.
     * @example
     * // Update or create a ApplicationFormSchema
     * const applicationFormSchema = await prisma.applicationFormSchema.upsert({
     *   create: {
     *     // ... data to create a ApplicationFormSchema
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ApplicationFormSchema we want to update
     *   }
     * })
     */
    upsert<T extends ApplicationFormSchemaUpsertArgs>(args: SelectSubset<T, ApplicationFormSchemaUpsertArgs<ExtArgs>>): Prisma__ApplicationFormSchemaClient<$Result.GetResult<Prisma.$ApplicationFormSchemaPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ApplicationFormSchemas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApplicationFormSchemaCountArgs} args - Arguments to filter ApplicationFormSchemas to count.
     * @example
     * // Count the number of ApplicationFormSchemas
     * const count = await prisma.applicationFormSchema.count({
     *   where: {
     *     // ... the filter for the ApplicationFormSchemas we want to count
     *   }
     * })
    **/
    count<T extends ApplicationFormSchemaCountArgs>(
      args?: Subset<T, ApplicationFormSchemaCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ApplicationFormSchemaCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ApplicationFormSchema.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApplicationFormSchemaAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ApplicationFormSchemaAggregateArgs>(args: Subset<T, ApplicationFormSchemaAggregateArgs>): Prisma.PrismaPromise<GetApplicationFormSchemaAggregateType<T>>

    /**
     * Group by ApplicationFormSchema.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApplicationFormSchemaGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ApplicationFormSchemaGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ApplicationFormSchemaGroupByArgs['orderBy'] }
        : { orderBy?: ApplicationFormSchemaGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ApplicationFormSchemaGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetApplicationFormSchemaGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ApplicationFormSchema model
   */
  readonly fields: ApplicationFormSchemaFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ApplicationFormSchema.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ApplicationFormSchemaClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    requisition<T extends RequisitionDefaultArgs<ExtArgs> = {}>(args?: Subset<T, RequisitionDefaultArgs<ExtArgs>>): Prisma__RequisitionClient<$Result.GetResult<Prisma.$RequisitionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ApplicationFormSchema model
   */
  interface ApplicationFormSchemaFieldRefs {
    readonly id: FieldRef<"ApplicationFormSchema", 'String'>
    readonly tenantId: FieldRef<"ApplicationFormSchema", 'String'>
    readonly requisitionId: FieldRef<"ApplicationFormSchema", 'String'>
    readonly name: FieldRef<"ApplicationFormSchema", 'String'>
    readonly fields: FieldRef<"ApplicationFormSchema", 'Json'>
    readonly createdAt: FieldRef<"ApplicationFormSchema", 'DateTime'>
    readonly updatedAt: FieldRef<"ApplicationFormSchema", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ApplicationFormSchema findUnique
   */
  export type ApplicationFormSchemaFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApplicationFormSchema
     */
    select?: ApplicationFormSchemaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApplicationFormSchema
     */
    omit?: ApplicationFormSchemaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationFormSchemaInclude<ExtArgs> | null
    /**
     * Filter, which ApplicationFormSchema to fetch.
     */
    where: ApplicationFormSchemaWhereUniqueInput
  }

  /**
   * ApplicationFormSchema findUniqueOrThrow
   */
  export type ApplicationFormSchemaFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApplicationFormSchema
     */
    select?: ApplicationFormSchemaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApplicationFormSchema
     */
    omit?: ApplicationFormSchemaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationFormSchemaInclude<ExtArgs> | null
    /**
     * Filter, which ApplicationFormSchema to fetch.
     */
    where: ApplicationFormSchemaWhereUniqueInput
  }

  /**
   * ApplicationFormSchema findFirst
   */
  export type ApplicationFormSchemaFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApplicationFormSchema
     */
    select?: ApplicationFormSchemaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApplicationFormSchema
     */
    omit?: ApplicationFormSchemaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationFormSchemaInclude<ExtArgs> | null
    /**
     * Filter, which ApplicationFormSchema to fetch.
     */
    where?: ApplicationFormSchemaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ApplicationFormSchemas to fetch.
     */
    orderBy?: ApplicationFormSchemaOrderByWithRelationInput | ApplicationFormSchemaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ApplicationFormSchemas.
     */
    cursor?: ApplicationFormSchemaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ApplicationFormSchemas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ApplicationFormSchemas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ApplicationFormSchemas.
     */
    distinct?: ApplicationFormSchemaScalarFieldEnum | ApplicationFormSchemaScalarFieldEnum[]
  }

  /**
   * ApplicationFormSchema findFirstOrThrow
   */
  export type ApplicationFormSchemaFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApplicationFormSchema
     */
    select?: ApplicationFormSchemaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApplicationFormSchema
     */
    omit?: ApplicationFormSchemaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationFormSchemaInclude<ExtArgs> | null
    /**
     * Filter, which ApplicationFormSchema to fetch.
     */
    where?: ApplicationFormSchemaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ApplicationFormSchemas to fetch.
     */
    orderBy?: ApplicationFormSchemaOrderByWithRelationInput | ApplicationFormSchemaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ApplicationFormSchemas.
     */
    cursor?: ApplicationFormSchemaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ApplicationFormSchemas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ApplicationFormSchemas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ApplicationFormSchemas.
     */
    distinct?: ApplicationFormSchemaScalarFieldEnum | ApplicationFormSchemaScalarFieldEnum[]
  }

  /**
   * ApplicationFormSchema findMany
   */
  export type ApplicationFormSchemaFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApplicationFormSchema
     */
    select?: ApplicationFormSchemaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApplicationFormSchema
     */
    omit?: ApplicationFormSchemaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationFormSchemaInclude<ExtArgs> | null
    /**
     * Filter, which ApplicationFormSchemas to fetch.
     */
    where?: ApplicationFormSchemaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ApplicationFormSchemas to fetch.
     */
    orderBy?: ApplicationFormSchemaOrderByWithRelationInput | ApplicationFormSchemaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ApplicationFormSchemas.
     */
    cursor?: ApplicationFormSchemaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ApplicationFormSchemas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ApplicationFormSchemas.
     */
    skip?: number
    distinct?: ApplicationFormSchemaScalarFieldEnum | ApplicationFormSchemaScalarFieldEnum[]
  }

  /**
   * ApplicationFormSchema create
   */
  export type ApplicationFormSchemaCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApplicationFormSchema
     */
    select?: ApplicationFormSchemaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApplicationFormSchema
     */
    omit?: ApplicationFormSchemaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationFormSchemaInclude<ExtArgs> | null
    /**
     * The data needed to create a ApplicationFormSchema.
     */
    data: XOR<ApplicationFormSchemaCreateInput, ApplicationFormSchemaUncheckedCreateInput>
  }

  /**
   * ApplicationFormSchema createMany
   */
  export type ApplicationFormSchemaCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ApplicationFormSchemas.
     */
    data: ApplicationFormSchemaCreateManyInput | ApplicationFormSchemaCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ApplicationFormSchema createManyAndReturn
   */
  export type ApplicationFormSchemaCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApplicationFormSchema
     */
    select?: ApplicationFormSchemaSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ApplicationFormSchema
     */
    omit?: ApplicationFormSchemaOmit<ExtArgs> | null
    /**
     * The data used to create many ApplicationFormSchemas.
     */
    data: ApplicationFormSchemaCreateManyInput | ApplicationFormSchemaCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationFormSchemaIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ApplicationFormSchema update
   */
  export type ApplicationFormSchemaUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApplicationFormSchema
     */
    select?: ApplicationFormSchemaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApplicationFormSchema
     */
    omit?: ApplicationFormSchemaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationFormSchemaInclude<ExtArgs> | null
    /**
     * The data needed to update a ApplicationFormSchema.
     */
    data: XOR<ApplicationFormSchemaUpdateInput, ApplicationFormSchemaUncheckedUpdateInput>
    /**
     * Choose, which ApplicationFormSchema to update.
     */
    where: ApplicationFormSchemaWhereUniqueInput
  }

  /**
   * ApplicationFormSchema updateMany
   */
  export type ApplicationFormSchemaUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ApplicationFormSchemas.
     */
    data: XOR<ApplicationFormSchemaUpdateManyMutationInput, ApplicationFormSchemaUncheckedUpdateManyInput>
    /**
     * Filter which ApplicationFormSchemas to update
     */
    where?: ApplicationFormSchemaWhereInput
    /**
     * Limit how many ApplicationFormSchemas to update.
     */
    limit?: number
  }

  /**
   * ApplicationFormSchema updateManyAndReturn
   */
  export type ApplicationFormSchemaUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApplicationFormSchema
     */
    select?: ApplicationFormSchemaSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ApplicationFormSchema
     */
    omit?: ApplicationFormSchemaOmit<ExtArgs> | null
    /**
     * The data used to update ApplicationFormSchemas.
     */
    data: XOR<ApplicationFormSchemaUpdateManyMutationInput, ApplicationFormSchemaUncheckedUpdateManyInput>
    /**
     * Filter which ApplicationFormSchemas to update
     */
    where?: ApplicationFormSchemaWhereInput
    /**
     * Limit how many ApplicationFormSchemas to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationFormSchemaIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ApplicationFormSchema upsert
   */
  export type ApplicationFormSchemaUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApplicationFormSchema
     */
    select?: ApplicationFormSchemaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApplicationFormSchema
     */
    omit?: ApplicationFormSchemaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationFormSchemaInclude<ExtArgs> | null
    /**
     * The filter to search for the ApplicationFormSchema to update in case it exists.
     */
    where: ApplicationFormSchemaWhereUniqueInput
    /**
     * In case the ApplicationFormSchema found by the `where` argument doesn't exist, create a new ApplicationFormSchema with this data.
     */
    create: XOR<ApplicationFormSchemaCreateInput, ApplicationFormSchemaUncheckedCreateInput>
    /**
     * In case the ApplicationFormSchema was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ApplicationFormSchemaUpdateInput, ApplicationFormSchemaUncheckedUpdateInput>
  }

  /**
   * ApplicationFormSchema delete
   */
  export type ApplicationFormSchemaDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApplicationFormSchema
     */
    select?: ApplicationFormSchemaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApplicationFormSchema
     */
    omit?: ApplicationFormSchemaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationFormSchemaInclude<ExtArgs> | null
    /**
     * Filter which ApplicationFormSchema to delete.
     */
    where: ApplicationFormSchemaWhereUniqueInput
  }

  /**
   * ApplicationFormSchema deleteMany
   */
  export type ApplicationFormSchemaDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ApplicationFormSchemas to delete
     */
    where?: ApplicationFormSchemaWhereInput
    /**
     * Limit how many ApplicationFormSchemas to delete.
     */
    limit?: number
  }

  /**
   * ApplicationFormSchema without action
   */
  export type ApplicationFormSchemaDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApplicationFormSchema
     */
    select?: ApplicationFormSchemaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApplicationFormSchema
     */
    omit?: ApplicationFormSchemaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationFormSchemaInclude<ExtArgs> | null
  }


  /**
   * Model Skill
   */

  export type AggregateSkill = {
    _count: SkillCountAggregateOutputType | null
    _min: SkillMinAggregateOutputType | null
    _max: SkillMaxAggregateOutputType | null
  }

  export type SkillMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    name: string | null
    category: string | null
    parentId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SkillMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    name: string | null
    category: string | null
    parentId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SkillCountAggregateOutputType = {
    id: number
    tenantId: number
    name: number
    category: number
    parentId: number
    aliases: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type SkillMinAggregateInputType = {
    id?: true
    tenantId?: true
    name?: true
    category?: true
    parentId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SkillMaxAggregateInputType = {
    id?: true
    tenantId?: true
    name?: true
    category?: true
    parentId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SkillCountAggregateInputType = {
    id?: true
    tenantId?: true
    name?: true
    category?: true
    parentId?: true
    aliases?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type SkillAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Skill to aggregate.
     */
    where?: SkillWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Skills to fetch.
     */
    orderBy?: SkillOrderByWithRelationInput | SkillOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SkillWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Skills from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Skills.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Skills
    **/
    _count?: true | SkillCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SkillMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SkillMaxAggregateInputType
  }

  export type GetSkillAggregateType<T extends SkillAggregateArgs> = {
        [P in keyof T & keyof AggregateSkill]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSkill[P]>
      : GetScalarType<T[P], AggregateSkill[P]>
  }




  export type SkillGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SkillWhereInput
    orderBy?: SkillOrderByWithAggregationInput | SkillOrderByWithAggregationInput[]
    by: SkillScalarFieldEnum[] | SkillScalarFieldEnum
    having?: SkillScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SkillCountAggregateInputType | true
    _min?: SkillMinAggregateInputType
    _max?: SkillMaxAggregateInputType
  }

  export type SkillGroupByOutputType = {
    id: string
    tenantId: string | null
    name: string
    category: string | null
    parentId: string | null
    aliases: string[]
    createdAt: Date
    updatedAt: Date
    _count: SkillCountAggregateOutputType | null
    _min: SkillMinAggregateOutputType | null
    _max: SkillMaxAggregateOutputType | null
  }

  type GetSkillGroupByPayload<T extends SkillGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SkillGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SkillGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SkillGroupByOutputType[P]>
            : GetScalarType<T[P], SkillGroupByOutputType[P]>
        }
      >
    >


  export type SkillSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    name?: boolean
    category?: boolean
    parentId?: boolean
    aliases?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    parent?: boolean | Skill$parentArgs<ExtArgs>
    children?: boolean | Skill$childrenArgs<ExtArgs>
    _count?: boolean | SkillCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["skill"]>

  export type SkillSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    name?: boolean
    category?: boolean
    parentId?: boolean
    aliases?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    parent?: boolean | Skill$parentArgs<ExtArgs>
  }, ExtArgs["result"]["skill"]>

  export type SkillSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    name?: boolean
    category?: boolean
    parentId?: boolean
    aliases?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    parent?: boolean | Skill$parentArgs<ExtArgs>
  }, ExtArgs["result"]["skill"]>

  export type SkillSelectScalar = {
    id?: boolean
    tenantId?: boolean
    name?: boolean
    category?: boolean
    parentId?: boolean
    aliases?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type SkillOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "name" | "category" | "parentId" | "aliases" | "createdAt" | "updatedAt", ExtArgs["result"]["skill"]>
  export type SkillInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    parent?: boolean | Skill$parentArgs<ExtArgs>
    children?: boolean | Skill$childrenArgs<ExtArgs>
    _count?: boolean | SkillCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type SkillIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    parent?: boolean | Skill$parentArgs<ExtArgs>
  }
  export type SkillIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    parent?: boolean | Skill$parentArgs<ExtArgs>
  }

  export type $SkillPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Skill"
    objects: {
      parent: Prisma.$SkillPayload<ExtArgs> | null
      children: Prisma.$SkillPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string | null
      name: string
      category: string | null
      parentId: string | null
      aliases: string[]
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["skill"]>
    composites: {}
  }

  type SkillGetPayload<S extends boolean | null | undefined | SkillDefaultArgs> = $Result.GetResult<Prisma.$SkillPayload, S>

  type SkillCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SkillFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SkillCountAggregateInputType | true
    }

  export interface SkillDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Skill'], meta: { name: 'Skill' } }
    /**
     * Find zero or one Skill that matches the filter.
     * @param {SkillFindUniqueArgs} args - Arguments to find a Skill
     * @example
     * // Get one Skill
     * const skill = await prisma.skill.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SkillFindUniqueArgs>(args: SelectSubset<T, SkillFindUniqueArgs<ExtArgs>>): Prisma__SkillClient<$Result.GetResult<Prisma.$SkillPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Skill that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SkillFindUniqueOrThrowArgs} args - Arguments to find a Skill
     * @example
     * // Get one Skill
     * const skill = await prisma.skill.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SkillFindUniqueOrThrowArgs>(args: SelectSubset<T, SkillFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SkillClient<$Result.GetResult<Prisma.$SkillPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Skill that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SkillFindFirstArgs} args - Arguments to find a Skill
     * @example
     * // Get one Skill
     * const skill = await prisma.skill.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SkillFindFirstArgs>(args?: SelectSubset<T, SkillFindFirstArgs<ExtArgs>>): Prisma__SkillClient<$Result.GetResult<Prisma.$SkillPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Skill that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SkillFindFirstOrThrowArgs} args - Arguments to find a Skill
     * @example
     * // Get one Skill
     * const skill = await prisma.skill.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SkillFindFirstOrThrowArgs>(args?: SelectSubset<T, SkillFindFirstOrThrowArgs<ExtArgs>>): Prisma__SkillClient<$Result.GetResult<Prisma.$SkillPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Skills that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SkillFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Skills
     * const skills = await prisma.skill.findMany()
     * 
     * // Get first 10 Skills
     * const skills = await prisma.skill.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const skillWithIdOnly = await prisma.skill.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SkillFindManyArgs>(args?: SelectSubset<T, SkillFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SkillPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Skill.
     * @param {SkillCreateArgs} args - Arguments to create a Skill.
     * @example
     * // Create one Skill
     * const Skill = await prisma.skill.create({
     *   data: {
     *     // ... data to create a Skill
     *   }
     * })
     * 
     */
    create<T extends SkillCreateArgs>(args: SelectSubset<T, SkillCreateArgs<ExtArgs>>): Prisma__SkillClient<$Result.GetResult<Prisma.$SkillPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Skills.
     * @param {SkillCreateManyArgs} args - Arguments to create many Skills.
     * @example
     * // Create many Skills
     * const skill = await prisma.skill.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SkillCreateManyArgs>(args?: SelectSubset<T, SkillCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Skills and returns the data saved in the database.
     * @param {SkillCreateManyAndReturnArgs} args - Arguments to create many Skills.
     * @example
     * // Create many Skills
     * const skill = await prisma.skill.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Skills and only return the `id`
     * const skillWithIdOnly = await prisma.skill.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SkillCreateManyAndReturnArgs>(args?: SelectSubset<T, SkillCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SkillPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Skill.
     * @param {SkillDeleteArgs} args - Arguments to delete one Skill.
     * @example
     * // Delete one Skill
     * const Skill = await prisma.skill.delete({
     *   where: {
     *     // ... filter to delete one Skill
     *   }
     * })
     * 
     */
    delete<T extends SkillDeleteArgs>(args: SelectSubset<T, SkillDeleteArgs<ExtArgs>>): Prisma__SkillClient<$Result.GetResult<Prisma.$SkillPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Skill.
     * @param {SkillUpdateArgs} args - Arguments to update one Skill.
     * @example
     * // Update one Skill
     * const skill = await prisma.skill.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SkillUpdateArgs>(args: SelectSubset<T, SkillUpdateArgs<ExtArgs>>): Prisma__SkillClient<$Result.GetResult<Prisma.$SkillPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Skills.
     * @param {SkillDeleteManyArgs} args - Arguments to filter Skills to delete.
     * @example
     * // Delete a few Skills
     * const { count } = await prisma.skill.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SkillDeleteManyArgs>(args?: SelectSubset<T, SkillDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Skills.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SkillUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Skills
     * const skill = await prisma.skill.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SkillUpdateManyArgs>(args: SelectSubset<T, SkillUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Skills and returns the data updated in the database.
     * @param {SkillUpdateManyAndReturnArgs} args - Arguments to update many Skills.
     * @example
     * // Update many Skills
     * const skill = await prisma.skill.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Skills and only return the `id`
     * const skillWithIdOnly = await prisma.skill.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SkillUpdateManyAndReturnArgs>(args: SelectSubset<T, SkillUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SkillPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Skill.
     * @param {SkillUpsertArgs} args - Arguments to update or create a Skill.
     * @example
     * // Update or create a Skill
     * const skill = await prisma.skill.upsert({
     *   create: {
     *     // ... data to create a Skill
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Skill we want to update
     *   }
     * })
     */
    upsert<T extends SkillUpsertArgs>(args: SelectSubset<T, SkillUpsertArgs<ExtArgs>>): Prisma__SkillClient<$Result.GetResult<Prisma.$SkillPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Skills.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SkillCountArgs} args - Arguments to filter Skills to count.
     * @example
     * // Count the number of Skills
     * const count = await prisma.skill.count({
     *   where: {
     *     // ... the filter for the Skills we want to count
     *   }
     * })
    **/
    count<T extends SkillCountArgs>(
      args?: Subset<T, SkillCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SkillCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Skill.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SkillAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SkillAggregateArgs>(args: Subset<T, SkillAggregateArgs>): Prisma.PrismaPromise<GetSkillAggregateType<T>>

    /**
     * Group by Skill.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SkillGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SkillGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SkillGroupByArgs['orderBy'] }
        : { orderBy?: SkillGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SkillGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSkillGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Skill model
   */
  readonly fields: SkillFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Skill.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SkillClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    parent<T extends Skill$parentArgs<ExtArgs> = {}>(args?: Subset<T, Skill$parentArgs<ExtArgs>>): Prisma__SkillClient<$Result.GetResult<Prisma.$SkillPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    children<T extends Skill$childrenArgs<ExtArgs> = {}>(args?: Subset<T, Skill$childrenArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SkillPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Skill model
   */
  interface SkillFieldRefs {
    readonly id: FieldRef<"Skill", 'String'>
    readonly tenantId: FieldRef<"Skill", 'String'>
    readonly name: FieldRef<"Skill", 'String'>
    readonly category: FieldRef<"Skill", 'String'>
    readonly parentId: FieldRef<"Skill", 'String'>
    readonly aliases: FieldRef<"Skill", 'String[]'>
    readonly createdAt: FieldRef<"Skill", 'DateTime'>
    readonly updatedAt: FieldRef<"Skill", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Skill findUnique
   */
  export type SkillFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Skill
     */
    select?: SkillSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Skill
     */
    omit?: SkillOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SkillInclude<ExtArgs> | null
    /**
     * Filter, which Skill to fetch.
     */
    where: SkillWhereUniqueInput
  }

  /**
   * Skill findUniqueOrThrow
   */
  export type SkillFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Skill
     */
    select?: SkillSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Skill
     */
    omit?: SkillOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SkillInclude<ExtArgs> | null
    /**
     * Filter, which Skill to fetch.
     */
    where: SkillWhereUniqueInput
  }

  /**
   * Skill findFirst
   */
  export type SkillFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Skill
     */
    select?: SkillSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Skill
     */
    omit?: SkillOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SkillInclude<ExtArgs> | null
    /**
     * Filter, which Skill to fetch.
     */
    where?: SkillWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Skills to fetch.
     */
    orderBy?: SkillOrderByWithRelationInput | SkillOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Skills.
     */
    cursor?: SkillWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Skills from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Skills.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Skills.
     */
    distinct?: SkillScalarFieldEnum | SkillScalarFieldEnum[]
  }

  /**
   * Skill findFirstOrThrow
   */
  export type SkillFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Skill
     */
    select?: SkillSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Skill
     */
    omit?: SkillOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SkillInclude<ExtArgs> | null
    /**
     * Filter, which Skill to fetch.
     */
    where?: SkillWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Skills to fetch.
     */
    orderBy?: SkillOrderByWithRelationInput | SkillOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Skills.
     */
    cursor?: SkillWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Skills from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Skills.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Skills.
     */
    distinct?: SkillScalarFieldEnum | SkillScalarFieldEnum[]
  }

  /**
   * Skill findMany
   */
  export type SkillFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Skill
     */
    select?: SkillSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Skill
     */
    omit?: SkillOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SkillInclude<ExtArgs> | null
    /**
     * Filter, which Skills to fetch.
     */
    where?: SkillWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Skills to fetch.
     */
    orderBy?: SkillOrderByWithRelationInput | SkillOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Skills.
     */
    cursor?: SkillWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Skills from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Skills.
     */
    skip?: number
    distinct?: SkillScalarFieldEnum | SkillScalarFieldEnum[]
  }

  /**
   * Skill create
   */
  export type SkillCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Skill
     */
    select?: SkillSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Skill
     */
    omit?: SkillOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SkillInclude<ExtArgs> | null
    /**
     * The data needed to create a Skill.
     */
    data: XOR<SkillCreateInput, SkillUncheckedCreateInput>
  }

  /**
   * Skill createMany
   */
  export type SkillCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Skills.
     */
    data: SkillCreateManyInput | SkillCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Skill createManyAndReturn
   */
  export type SkillCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Skill
     */
    select?: SkillSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Skill
     */
    omit?: SkillOmit<ExtArgs> | null
    /**
     * The data used to create many Skills.
     */
    data: SkillCreateManyInput | SkillCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SkillIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Skill update
   */
  export type SkillUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Skill
     */
    select?: SkillSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Skill
     */
    omit?: SkillOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SkillInclude<ExtArgs> | null
    /**
     * The data needed to update a Skill.
     */
    data: XOR<SkillUpdateInput, SkillUncheckedUpdateInput>
    /**
     * Choose, which Skill to update.
     */
    where: SkillWhereUniqueInput
  }

  /**
   * Skill updateMany
   */
  export type SkillUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Skills.
     */
    data: XOR<SkillUpdateManyMutationInput, SkillUncheckedUpdateManyInput>
    /**
     * Filter which Skills to update
     */
    where?: SkillWhereInput
    /**
     * Limit how many Skills to update.
     */
    limit?: number
  }

  /**
   * Skill updateManyAndReturn
   */
  export type SkillUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Skill
     */
    select?: SkillSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Skill
     */
    omit?: SkillOmit<ExtArgs> | null
    /**
     * The data used to update Skills.
     */
    data: XOR<SkillUpdateManyMutationInput, SkillUncheckedUpdateManyInput>
    /**
     * Filter which Skills to update
     */
    where?: SkillWhereInput
    /**
     * Limit how many Skills to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SkillIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Skill upsert
   */
  export type SkillUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Skill
     */
    select?: SkillSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Skill
     */
    omit?: SkillOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SkillInclude<ExtArgs> | null
    /**
     * The filter to search for the Skill to update in case it exists.
     */
    where: SkillWhereUniqueInput
    /**
     * In case the Skill found by the `where` argument doesn't exist, create a new Skill with this data.
     */
    create: XOR<SkillCreateInput, SkillUncheckedCreateInput>
    /**
     * In case the Skill was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SkillUpdateInput, SkillUncheckedUpdateInput>
  }

  /**
   * Skill delete
   */
  export type SkillDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Skill
     */
    select?: SkillSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Skill
     */
    omit?: SkillOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SkillInclude<ExtArgs> | null
    /**
     * Filter which Skill to delete.
     */
    where: SkillWhereUniqueInput
  }

  /**
   * Skill deleteMany
   */
  export type SkillDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Skills to delete
     */
    where?: SkillWhereInput
    /**
     * Limit how many Skills to delete.
     */
    limit?: number
  }

  /**
   * Skill.parent
   */
  export type Skill$parentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Skill
     */
    select?: SkillSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Skill
     */
    omit?: SkillOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SkillInclude<ExtArgs> | null
    where?: SkillWhereInput
  }

  /**
   * Skill.children
   */
  export type Skill$childrenArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Skill
     */
    select?: SkillSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Skill
     */
    omit?: SkillOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SkillInclude<ExtArgs> | null
    where?: SkillWhereInput
    orderBy?: SkillOrderByWithRelationInput | SkillOrderByWithRelationInput[]
    cursor?: SkillWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SkillScalarFieldEnum | SkillScalarFieldEnum[]
  }

  /**
   * Skill without action
   */
  export type SkillDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Skill
     */
    select?: SkillSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Skill
     */
    omit?: SkillOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SkillInclude<ExtArgs> | null
  }


  /**
   * Model Outbox
   */

  export type AggregateOutbox = {
    _count: OutboxCountAggregateOutputType | null
    _avg: OutboxAvgAggregateOutputType | null
    _sum: OutboxSumAggregateOutputType | null
    _min: OutboxMinAggregateOutputType | null
    _max: OutboxMaxAggregateOutputType | null
  }

  export type OutboxAvgAggregateOutputType = {
    attemptCount: number | null
  }

  export type OutboxSumAggregateOutputType = {
    attemptCount: number | null
  }

  export type OutboxMinAggregateOutputType = {
    id: string | null
    subject: string | null
    type: string | null
    tenantId: string | null
    status: $Enums.OutboxStatus | null
    attemptCount: number | null
    lastError: string | null
    sentAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OutboxMaxAggregateOutputType = {
    id: string | null
    subject: string | null
    type: string | null
    tenantId: string | null
    status: $Enums.OutboxStatus | null
    attemptCount: number | null
    lastError: string | null
    sentAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OutboxCountAggregateOutputType = {
    id: number
    subject: number
    type: number
    tenantId: number
    payload: number
    status: number
    attemptCount: number
    lastError: number
    sentAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type OutboxAvgAggregateInputType = {
    attemptCount?: true
  }

  export type OutboxSumAggregateInputType = {
    attemptCount?: true
  }

  export type OutboxMinAggregateInputType = {
    id?: true
    subject?: true
    type?: true
    tenantId?: true
    status?: true
    attemptCount?: true
    lastError?: true
    sentAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OutboxMaxAggregateInputType = {
    id?: true
    subject?: true
    type?: true
    tenantId?: true
    status?: true
    attemptCount?: true
    lastError?: true
    sentAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OutboxCountAggregateInputType = {
    id?: true
    subject?: true
    type?: true
    tenantId?: true
    payload?: true
    status?: true
    attemptCount?: true
    lastError?: true
    sentAt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type OutboxAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Outbox to aggregate.
     */
    where?: OutboxWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Outboxes to fetch.
     */
    orderBy?: OutboxOrderByWithRelationInput | OutboxOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OutboxWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Outboxes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Outboxes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Outboxes
    **/
    _count?: true | OutboxCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: OutboxAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: OutboxSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OutboxMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OutboxMaxAggregateInputType
  }

  export type GetOutboxAggregateType<T extends OutboxAggregateArgs> = {
        [P in keyof T & keyof AggregateOutbox]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOutbox[P]>
      : GetScalarType<T[P], AggregateOutbox[P]>
  }




  export type OutboxGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OutboxWhereInput
    orderBy?: OutboxOrderByWithAggregationInput | OutboxOrderByWithAggregationInput[]
    by: OutboxScalarFieldEnum[] | OutboxScalarFieldEnum
    having?: OutboxScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OutboxCountAggregateInputType | true
    _avg?: OutboxAvgAggregateInputType
    _sum?: OutboxSumAggregateInputType
    _min?: OutboxMinAggregateInputType
    _max?: OutboxMaxAggregateInputType
  }

  export type OutboxGroupByOutputType = {
    id: string
    subject: string
    type: string
    tenantId: string | null
    payload: JsonValue
    status: $Enums.OutboxStatus
    attemptCount: number
    lastError: string | null
    sentAt: Date | null
    createdAt: Date
    updatedAt: Date
    _count: OutboxCountAggregateOutputType | null
    _avg: OutboxAvgAggregateOutputType | null
    _sum: OutboxSumAggregateOutputType | null
    _min: OutboxMinAggregateOutputType | null
    _max: OutboxMaxAggregateOutputType | null
  }

  type GetOutboxGroupByPayload<T extends OutboxGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OutboxGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OutboxGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OutboxGroupByOutputType[P]>
            : GetScalarType<T[P], OutboxGroupByOutputType[P]>
        }
      >
    >


  export type OutboxSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    subject?: boolean
    type?: boolean
    tenantId?: boolean
    payload?: boolean
    status?: boolean
    attemptCount?: boolean
    lastError?: boolean
    sentAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["outbox"]>

  export type OutboxSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    subject?: boolean
    type?: boolean
    tenantId?: boolean
    payload?: boolean
    status?: boolean
    attemptCount?: boolean
    lastError?: boolean
    sentAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["outbox"]>

  export type OutboxSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    subject?: boolean
    type?: boolean
    tenantId?: boolean
    payload?: boolean
    status?: boolean
    attemptCount?: boolean
    lastError?: boolean
    sentAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["outbox"]>

  export type OutboxSelectScalar = {
    id?: boolean
    subject?: boolean
    type?: boolean
    tenantId?: boolean
    payload?: boolean
    status?: boolean
    attemptCount?: boolean
    lastError?: boolean
    sentAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type OutboxOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "subject" | "type" | "tenantId" | "payload" | "status" | "attemptCount" | "lastError" | "sentAt" | "createdAt" | "updatedAt", ExtArgs["result"]["outbox"]>

  export type $OutboxPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Outbox"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      subject: string
      type: string
      tenantId: string | null
      payload: Prisma.JsonValue
      status: $Enums.OutboxStatus
      attemptCount: number
      lastError: string | null
      sentAt: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["outbox"]>
    composites: {}
  }

  type OutboxGetPayload<S extends boolean | null | undefined | OutboxDefaultArgs> = $Result.GetResult<Prisma.$OutboxPayload, S>

  type OutboxCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OutboxFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OutboxCountAggregateInputType | true
    }

  export interface OutboxDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Outbox'], meta: { name: 'Outbox' } }
    /**
     * Find zero or one Outbox that matches the filter.
     * @param {OutboxFindUniqueArgs} args - Arguments to find a Outbox
     * @example
     * // Get one Outbox
     * const outbox = await prisma.outbox.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OutboxFindUniqueArgs>(args: SelectSubset<T, OutboxFindUniqueArgs<ExtArgs>>): Prisma__OutboxClient<$Result.GetResult<Prisma.$OutboxPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Outbox that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OutboxFindUniqueOrThrowArgs} args - Arguments to find a Outbox
     * @example
     * // Get one Outbox
     * const outbox = await prisma.outbox.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OutboxFindUniqueOrThrowArgs>(args: SelectSubset<T, OutboxFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OutboxClient<$Result.GetResult<Prisma.$OutboxPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Outbox that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutboxFindFirstArgs} args - Arguments to find a Outbox
     * @example
     * // Get one Outbox
     * const outbox = await prisma.outbox.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OutboxFindFirstArgs>(args?: SelectSubset<T, OutboxFindFirstArgs<ExtArgs>>): Prisma__OutboxClient<$Result.GetResult<Prisma.$OutboxPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Outbox that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutboxFindFirstOrThrowArgs} args - Arguments to find a Outbox
     * @example
     * // Get one Outbox
     * const outbox = await prisma.outbox.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OutboxFindFirstOrThrowArgs>(args?: SelectSubset<T, OutboxFindFirstOrThrowArgs<ExtArgs>>): Prisma__OutboxClient<$Result.GetResult<Prisma.$OutboxPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Outboxes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutboxFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Outboxes
     * const outboxes = await prisma.outbox.findMany()
     * 
     * // Get first 10 Outboxes
     * const outboxes = await prisma.outbox.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const outboxWithIdOnly = await prisma.outbox.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OutboxFindManyArgs>(args?: SelectSubset<T, OutboxFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OutboxPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Outbox.
     * @param {OutboxCreateArgs} args - Arguments to create a Outbox.
     * @example
     * // Create one Outbox
     * const Outbox = await prisma.outbox.create({
     *   data: {
     *     // ... data to create a Outbox
     *   }
     * })
     * 
     */
    create<T extends OutboxCreateArgs>(args: SelectSubset<T, OutboxCreateArgs<ExtArgs>>): Prisma__OutboxClient<$Result.GetResult<Prisma.$OutboxPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Outboxes.
     * @param {OutboxCreateManyArgs} args - Arguments to create many Outboxes.
     * @example
     * // Create many Outboxes
     * const outbox = await prisma.outbox.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OutboxCreateManyArgs>(args?: SelectSubset<T, OutboxCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Outboxes and returns the data saved in the database.
     * @param {OutboxCreateManyAndReturnArgs} args - Arguments to create many Outboxes.
     * @example
     * // Create many Outboxes
     * const outbox = await prisma.outbox.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Outboxes and only return the `id`
     * const outboxWithIdOnly = await prisma.outbox.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OutboxCreateManyAndReturnArgs>(args?: SelectSubset<T, OutboxCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OutboxPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Outbox.
     * @param {OutboxDeleteArgs} args - Arguments to delete one Outbox.
     * @example
     * // Delete one Outbox
     * const Outbox = await prisma.outbox.delete({
     *   where: {
     *     // ... filter to delete one Outbox
     *   }
     * })
     * 
     */
    delete<T extends OutboxDeleteArgs>(args: SelectSubset<T, OutboxDeleteArgs<ExtArgs>>): Prisma__OutboxClient<$Result.GetResult<Prisma.$OutboxPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Outbox.
     * @param {OutboxUpdateArgs} args - Arguments to update one Outbox.
     * @example
     * // Update one Outbox
     * const outbox = await prisma.outbox.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OutboxUpdateArgs>(args: SelectSubset<T, OutboxUpdateArgs<ExtArgs>>): Prisma__OutboxClient<$Result.GetResult<Prisma.$OutboxPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Outboxes.
     * @param {OutboxDeleteManyArgs} args - Arguments to filter Outboxes to delete.
     * @example
     * // Delete a few Outboxes
     * const { count } = await prisma.outbox.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OutboxDeleteManyArgs>(args?: SelectSubset<T, OutboxDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Outboxes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutboxUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Outboxes
     * const outbox = await prisma.outbox.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OutboxUpdateManyArgs>(args: SelectSubset<T, OutboxUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Outboxes and returns the data updated in the database.
     * @param {OutboxUpdateManyAndReturnArgs} args - Arguments to update many Outboxes.
     * @example
     * // Update many Outboxes
     * const outbox = await prisma.outbox.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Outboxes and only return the `id`
     * const outboxWithIdOnly = await prisma.outbox.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends OutboxUpdateManyAndReturnArgs>(args: SelectSubset<T, OutboxUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OutboxPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Outbox.
     * @param {OutboxUpsertArgs} args - Arguments to update or create a Outbox.
     * @example
     * // Update or create a Outbox
     * const outbox = await prisma.outbox.upsert({
     *   create: {
     *     // ... data to create a Outbox
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Outbox we want to update
     *   }
     * })
     */
    upsert<T extends OutboxUpsertArgs>(args: SelectSubset<T, OutboxUpsertArgs<ExtArgs>>): Prisma__OutboxClient<$Result.GetResult<Prisma.$OutboxPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Outboxes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutboxCountArgs} args - Arguments to filter Outboxes to count.
     * @example
     * // Count the number of Outboxes
     * const count = await prisma.outbox.count({
     *   where: {
     *     // ... the filter for the Outboxes we want to count
     *   }
     * })
    **/
    count<T extends OutboxCountArgs>(
      args?: Subset<T, OutboxCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OutboxCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Outbox.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutboxAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OutboxAggregateArgs>(args: Subset<T, OutboxAggregateArgs>): Prisma.PrismaPromise<GetOutboxAggregateType<T>>

    /**
     * Group by Outbox.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutboxGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends OutboxGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OutboxGroupByArgs['orderBy'] }
        : { orderBy?: OutboxGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, OutboxGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOutboxGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Outbox model
   */
  readonly fields: OutboxFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Outbox.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OutboxClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Outbox model
   */
  interface OutboxFieldRefs {
    readonly id: FieldRef<"Outbox", 'String'>
    readonly subject: FieldRef<"Outbox", 'String'>
    readonly type: FieldRef<"Outbox", 'String'>
    readonly tenantId: FieldRef<"Outbox", 'String'>
    readonly payload: FieldRef<"Outbox", 'Json'>
    readonly status: FieldRef<"Outbox", 'OutboxStatus'>
    readonly attemptCount: FieldRef<"Outbox", 'Int'>
    readonly lastError: FieldRef<"Outbox", 'String'>
    readonly sentAt: FieldRef<"Outbox", 'DateTime'>
    readonly createdAt: FieldRef<"Outbox", 'DateTime'>
    readonly updatedAt: FieldRef<"Outbox", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Outbox findUnique
   */
  export type OutboxFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outbox
     */
    select?: OutboxSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Outbox
     */
    omit?: OutboxOmit<ExtArgs> | null
    /**
     * Filter, which Outbox to fetch.
     */
    where: OutboxWhereUniqueInput
  }

  /**
   * Outbox findUniqueOrThrow
   */
  export type OutboxFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outbox
     */
    select?: OutboxSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Outbox
     */
    omit?: OutboxOmit<ExtArgs> | null
    /**
     * Filter, which Outbox to fetch.
     */
    where: OutboxWhereUniqueInput
  }

  /**
   * Outbox findFirst
   */
  export type OutboxFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outbox
     */
    select?: OutboxSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Outbox
     */
    omit?: OutboxOmit<ExtArgs> | null
    /**
     * Filter, which Outbox to fetch.
     */
    where?: OutboxWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Outboxes to fetch.
     */
    orderBy?: OutboxOrderByWithRelationInput | OutboxOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Outboxes.
     */
    cursor?: OutboxWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Outboxes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Outboxes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Outboxes.
     */
    distinct?: OutboxScalarFieldEnum | OutboxScalarFieldEnum[]
  }

  /**
   * Outbox findFirstOrThrow
   */
  export type OutboxFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outbox
     */
    select?: OutboxSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Outbox
     */
    omit?: OutboxOmit<ExtArgs> | null
    /**
     * Filter, which Outbox to fetch.
     */
    where?: OutboxWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Outboxes to fetch.
     */
    orderBy?: OutboxOrderByWithRelationInput | OutboxOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Outboxes.
     */
    cursor?: OutboxWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Outboxes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Outboxes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Outboxes.
     */
    distinct?: OutboxScalarFieldEnum | OutboxScalarFieldEnum[]
  }

  /**
   * Outbox findMany
   */
  export type OutboxFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outbox
     */
    select?: OutboxSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Outbox
     */
    omit?: OutboxOmit<ExtArgs> | null
    /**
     * Filter, which Outboxes to fetch.
     */
    where?: OutboxWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Outboxes to fetch.
     */
    orderBy?: OutboxOrderByWithRelationInput | OutboxOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Outboxes.
     */
    cursor?: OutboxWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Outboxes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Outboxes.
     */
    skip?: number
    distinct?: OutboxScalarFieldEnum | OutboxScalarFieldEnum[]
  }

  /**
   * Outbox create
   */
  export type OutboxCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outbox
     */
    select?: OutboxSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Outbox
     */
    omit?: OutboxOmit<ExtArgs> | null
    /**
     * The data needed to create a Outbox.
     */
    data: XOR<OutboxCreateInput, OutboxUncheckedCreateInput>
  }

  /**
   * Outbox createMany
   */
  export type OutboxCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Outboxes.
     */
    data: OutboxCreateManyInput | OutboxCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Outbox createManyAndReturn
   */
  export type OutboxCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outbox
     */
    select?: OutboxSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Outbox
     */
    omit?: OutboxOmit<ExtArgs> | null
    /**
     * The data used to create many Outboxes.
     */
    data: OutboxCreateManyInput | OutboxCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Outbox update
   */
  export type OutboxUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outbox
     */
    select?: OutboxSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Outbox
     */
    omit?: OutboxOmit<ExtArgs> | null
    /**
     * The data needed to update a Outbox.
     */
    data: XOR<OutboxUpdateInput, OutboxUncheckedUpdateInput>
    /**
     * Choose, which Outbox to update.
     */
    where: OutboxWhereUniqueInput
  }

  /**
   * Outbox updateMany
   */
  export type OutboxUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Outboxes.
     */
    data: XOR<OutboxUpdateManyMutationInput, OutboxUncheckedUpdateManyInput>
    /**
     * Filter which Outboxes to update
     */
    where?: OutboxWhereInput
    /**
     * Limit how many Outboxes to update.
     */
    limit?: number
  }

  /**
   * Outbox updateManyAndReturn
   */
  export type OutboxUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outbox
     */
    select?: OutboxSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Outbox
     */
    omit?: OutboxOmit<ExtArgs> | null
    /**
     * The data used to update Outboxes.
     */
    data: XOR<OutboxUpdateManyMutationInput, OutboxUncheckedUpdateManyInput>
    /**
     * Filter which Outboxes to update
     */
    where?: OutboxWhereInput
    /**
     * Limit how many Outboxes to update.
     */
    limit?: number
  }

  /**
   * Outbox upsert
   */
  export type OutboxUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outbox
     */
    select?: OutboxSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Outbox
     */
    omit?: OutboxOmit<ExtArgs> | null
    /**
     * The filter to search for the Outbox to update in case it exists.
     */
    where: OutboxWhereUniqueInput
    /**
     * In case the Outbox found by the `where` argument doesn't exist, create a new Outbox with this data.
     */
    create: XOR<OutboxCreateInput, OutboxUncheckedCreateInput>
    /**
     * In case the Outbox was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OutboxUpdateInput, OutboxUncheckedUpdateInput>
  }

  /**
   * Outbox delete
   */
  export type OutboxDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outbox
     */
    select?: OutboxSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Outbox
     */
    omit?: OutboxOmit<ExtArgs> | null
    /**
     * Filter which Outbox to delete.
     */
    where: OutboxWhereUniqueInput
  }

  /**
   * Outbox deleteMany
   */
  export type OutboxDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Outboxes to delete
     */
    where?: OutboxWhereInput
    /**
     * Limit how many Outboxes to delete.
     */
    limit?: number
  }

  /**
   * Outbox without action
   */
  export type OutboxDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outbox
     */
    select?: OutboxSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Outbox
     */
    omit?: OutboxOmit<ExtArgs> | null
  }


  /**
   * Model AgentRun
   */

  export type AggregateAgentRun = {
    _count: AgentRunCountAggregateOutputType | null
    _avg: AgentRunAvgAggregateOutputType | null
    _sum: AgentRunSumAggregateOutputType | null
    _min: AgentRunMinAggregateOutputType | null
    _max: AgentRunMaxAggregateOutputType | null
  }

  export type AgentRunAvgAggregateOutputType = {
    tokensIn: number | null
    tokensOut: number | null
    costUsd: Decimal | null
    latencyMs: number | null
    iterations: number | null
  }

  export type AgentRunSumAggregateOutputType = {
    tokensIn: number | null
    tokensOut: number | null
    costUsd: Decimal | null
    latencyMs: number | null
    iterations: number | null
  }

  export type AgentRunMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    agentType: string | null
    status: string | null
    inputHash: string | null
    tokensIn: number | null
    tokensOut: number | null
    costUsd: Decimal | null
    latencyMs: number | null
    modelName: string | null
    iterations: number | null
    triggeredBy: string | null
    errorMessage: string | null
    startedAt: Date | null
    completedAt: Date | null
    createdAt: Date | null
  }

  export type AgentRunMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    agentType: string | null
    status: string | null
    inputHash: string | null
    tokensIn: number | null
    tokensOut: number | null
    costUsd: Decimal | null
    latencyMs: number | null
    modelName: string | null
    iterations: number | null
    triggeredBy: string | null
    errorMessage: string | null
    startedAt: Date | null
    completedAt: Date | null
    createdAt: Date | null
  }

  export type AgentRunCountAggregateOutputType = {
    id: number
    tenantId: number
    agentType: number
    status: number
    inputHash: number
    tokensIn: number
    tokensOut: number
    costUsd: number
    latencyMs: number
    modelName: number
    iterations: number
    triggeredBy: number
    errorMessage: number
    startedAt: number
    completedAt: number
    createdAt: number
    _all: number
  }


  export type AgentRunAvgAggregateInputType = {
    tokensIn?: true
    tokensOut?: true
    costUsd?: true
    latencyMs?: true
    iterations?: true
  }

  export type AgentRunSumAggregateInputType = {
    tokensIn?: true
    tokensOut?: true
    costUsd?: true
    latencyMs?: true
    iterations?: true
  }

  export type AgentRunMinAggregateInputType = {
    id?: true
    tenantId?: true
    agentType?: true
    status?: true
    inputHash?: true
    tokensIn?: true
    tokensOut?: true
    costUsd?: true
    latencyMs?: true
    modelName?: true
    iterations?: true
    triggeredBy?: true
    errorMessage?: true
    startedAt?: true
    completedAt?: true
    createdAt?: true
  }

  export type AgentRunMaxAggregateInputType = {
    id?: true
    tenantId?: true
    agentType?: true
    status?: true
    inputHash?: true
    tokensIn?: true
    tokensOut?: true
    costUsd?: true
    latencyMs?: true
    modelName?: true
    iterations?: true
    triggeredBy?: true
    errorMessage?: true
    startedAt?: true
    completedAt?: true
    createdAt?: true
  }

  export type AgentRunCountAggregateInputType = {
    id?: true
    tenantId?: true
    agentType?: true
    status?: true
    inputHash?: true
    tokensIn?: true
    tokensOut?: true
    costUsd?: true
    latencyMs?: true
    modelName?: true
    iterations?: true
    triggeredBy?: true
    errorMessage?: true
    startedAt?: true
    completedAt?: true
    createdAt?: true
    _all?: true
  }

  export type AgentRunAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AgentRun to aggregate.
     */
    where?: AgentRunWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AgentRuns to fetch.
     */
    orderBy?: AgentRunOrderByWithRelationInput | AgentRunOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AgentRunWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AgentRuns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AgentRuns.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AgentRuns
    **/
    _count?: true | AgentRunCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AgentRunAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AgentRunSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AgentRunMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AgentRunMaxAggregateInputType
  }

  export type GetAgentRunAggregateType<T extends AgentRunAggregateArgs> = {
        [P in keyof T & keyof AggregateAgentRun]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAgentRun[P]>
      : GetScalarType<T[P], AggregateAgentRun[P]>
  }




  export type AgentRunGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AgentRunWhereInput
    orderBy?: AgentRunOrderByWithAggregationInput | AgentRunOrderByWithAggregationInput[]
    by: AgentRunScalarFieldEnum[] | AgentRunScalarFieldEnum
    having?: AgentRunScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AgentRunCountAggregateInputType | true
    _avg?: AgentRunAvgAggregateInputType
    _sum?: AgentRunSumAggregateInputType
    _min?: AgentRunMinAggregateInputType
    _max?: AgentRunMaxAggregateInputType
  }

  export type AgentRunGroupByOutputType = {
    id: string
    tenantId: string
    agentType: string
    status: string
    inputHash: string
    tokensIn: number
    tokensOut: number
    costUsd: Decimal
    latencyMs: number
    modelName: string
    iterations: number
    triggeredBy: string | null
    errorMessage: string | null
    startedAt: Date
    completedAt: Date
    createdAt: Date
    _count: AgentRunCountAggregateOutputType | null
    _avg: AgentRunAvgAggregateOutputType | null
    _sum: AgentRunSumAggregateOutputType | null
    _min: AgentRunMinAggregateOutputType | null
    _max: AgentRunMaxAggregateOutputType | null
  }

  type GetAgentRunGroupByPayload<T extends AgentRunGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AgentRunGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AgentRunGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AgentRunGroupByOutputType[P]>
            : GetScalarType<T[P], AgentRunGroupByOutputType[P]>
        }
      >
    >


  export type AgentRunSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    agentType?: boolean
    status?: boolean
    inputHash?: boolean
    tokensIn?: boolean
    tokensOut?: boolean
    costUsd?: boolean
    latencyMs?: boolean
    modelName?: boolean
    iterations?: boolean
    triggeredBy?: boolean
    errorMessage?: boolean
    startedAt?: boolean
    completedAt?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["agentRun"]>

  export type AgentRunSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    agentType?: boolean
    status?: boolean
    inputHash?: boolean
    tokensIn?: boolean
    tokensOut?: boolean
    costUsd?: boolean
    latencyMs?: boolean
    modelName?: boolean
    iterations?: boolean
    triggeredBy?: boolean
    errorMessage?: boolean
    startedAt?: boolean
    completedAt?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["agentRun"]>

  export type AgentRunSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    agentType?: boolean
    status?: boolean
    inputHash?: boolean
    tokensIn?: boolean
    tokensOut?: boolean
    costUsd?: boolean
    latencyMs?: boolean
    modelName?: boolean
    iterations?: boolean
    triggeredBy?: boolean
    errorMessage?: boolean
    startedAt?: boolean
    completedAt?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["agentRun"]>

  export type AgentRunSelectScalar = {
    id?: boolean
    tenantId?: boolean
    agentType?: boolean
    status?: boolean
    inputHash?: boolean
    tokensIn?: boolean
    tokensOut?: boolean
    costUsd?: boolean
    latencyMs?: boolean
    modelName?: boolean
    iterations?: boolean
    triggeredBy?: boolean
    errorMessage?: boolean
    startedAt?: boolean
    completedAt?: boolean
    createdAt?: boolean
  }

  export type AgentRunOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "agentType" | "status" | "inputHash" | "tokensIn" | "tokensOut" | "costUsd" | "latencyMs" | "modelName" | "iterations" | "triggeredBy" | "errorMessage" | "startedAt" | "completedAt" | "createdAt", ExtArgs["result"]["agentRun"]>

  export type $AgentRunPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AgentRun"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      agentType: string
      status: string
      inputHash: string
      tokensIn: number
      tokensOut: number
      costUsd: Prisma.Decimal
      latencyMs: number
      modelName: string
      iterations: number
      triggeredBy: string | null
      errorMessage: string | null
      startedAt: Date
      completedAt: Date
      createdAt: Date
    }, ExtArgs["result"]["agentRun"]>
    composites: {}
  }

  type AgentRunGetPayload<S extends boolean | null | undefined | AgentRunDefaultArgs> = $Result.GetResult<Prisma.$AgentRunPayload, S>

  type AgentRunCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AgentRunFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AgentRunCountAggregateInputType | true
    }

  export interface AgentRunDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AgentRun'], meta: { name: 'AgentRun' } }
    /**
     * Find zero or one AgentRun that matches the filter.
     * @param {AgentRunFindUniqueArgs} args - Arguments to find a AgentRun
     * @example
     * // Get one AgentRun
     * const agentRun = await prisma.agentRun.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AgentRunFindUniqueArgs>(args: SelectSubset<T, AgentRunFindUniqueArgs<ExtArgs>>): Prisma__AgentRunClient<$Result.GetResult<Prisma.$AgentRunPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AgentRun that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AgentRunFindUniqueOrThrowArgs} args - Arguments to find a AgentRun
     * @example
     * // Get one AgentRun
     * const agentRun = await prisma.agentRun.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AgentRunFindUniqueOrThrowArgs>(args: SelectSubset<T, AgentRunFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AgentRunClient<$Result.GetResult<Prisma.$AgentRunPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AgentRun that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentRunFindFirstArgs} args - Arguments to find a AgentRun
     * @example
     * // Get one AgentRun
     * const agentRun = await prisma.agentRun.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AgentRunFindFirstArgs>(args?: SelectSubset<T, AgentRunFindFirstArgs<ExtArgs>>): Prisma__AgentRunClient<$Result.GetResult<Prisma.$AgentRunPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AgentRun that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentRunFindFirstOrThrowArgs} args - Arguments to find a AgentRun
     * @example
     * // Get one AgentRun
     * const agentRun = await prisma.agentRun.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AgentRunFindFirstOrThrowArgs>(args?: SelectSubset<T, AgentRunFindFirstOrThrowArgs<ExtArgs>>): Prisma__AgentRunClient<$Result.GetResult<Prisma.$AgentRunPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AgentRuns that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentRunFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AgentRuns
     * const agentRuns = await prisma.agentRun.findMany()
     * 
     * // Get first 10 AgentRuns
     * const agentRuns = await prisma.agentRun.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const agentRunWithIdOnly = await prisma.agentRun.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AgentRunFindManyArgs>(args?: SelectSubset<T, AgentRunFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AgentRunPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AgentRun.
     * @param {AgentRunCreateArgs} args - Arguments to create a AgentRun.
     * @example
     * // Create one AgentRun
     * const AgentRun = await prisma.agentRun.create({
     *   data: {
     *     // ... data to create a AgentRun
     *   }
     * })
     * 
     */
    create<T extends AgentRunCreateArgs>(args: SelectSubset<T, AgentRunCreateArgs<ExtArgs>>): Prisma__AgentRunClient<$Result.GetResult<Prisma.$AgentRunPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AgentRuns.
     * @param {AgentRunCreateManyArgs} args - Arguments to create many AgentRuns.
     * @example
     * // Create many AgentRuns
     * const agentRun = await prisma.agentRun.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AgentRunCreateManyArgs>(args?: SelectSubset<T, AgentRunCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AgentRuns and returns the data saved in the database.
     * @param {AgentRunCreateManyAndReturnArgs} args - Arguments to create many AgentRuns.
     * @example
     * // Create many AgentRuns
     * const agentRun = await prisma.agentRun.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AgentRuns and only return the `id`
     * const agentRunWithIdOnly = await prisma.agentRun.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AgentRunCreateManyAndReturnArgs>(args?: SelectSubset<T, AgentRunCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AgentRunPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a AgentRun.
     * @param {AgentRunDeleteArgs} args - Arguments to delete one AgentRun.
     * @example
     * // Delete one AgentRun
     * const AgentRun = await prisma.agentRun.delete({
     *   where: {
     *     // ... filter to delete one AgentRun
     *   }
     * })
     * 
     */
    delete<T extends AgentRunDeleteArgs>(args: SelectSubset<T, AgentRunDeleteArgs<ExtArgs>>): Prisma__AgentRunClient<$Result.GetResult<Prisma.$AgentRunPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AgentRun.
     * @param {AgentRunUpdateArgs} args - Arguments to update one AgentRun.
     * @example
     * // Update one AgentRun
     * const agentRun = await prisma.agentRun.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AgentRunUpdateArgs>(args: SelectSubset<T, AgentRunUpdateArgs<ExtArgs>>): Prisma__AgentRunClient<$Result.GetResult<Prisma.$AgentRunPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AgentRuns.
     * @param {AgentRunDeleteManyArgs} args - Arguments to filter AgentRuns to delete.
     * @example
     * // Delete a few AgentRuns
     * const { count } = await prisma.agentRun.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AgentRunDeleteManyArgs>(args?: SelectSubset<T, AgentRunDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AgentRuns.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentRunUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AgentRuns
     * const agentRun = await prisma.agentRun.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AgentRunUpdateManyArgs>(args: SelectSubset<T, AgentRunUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AgentRuns and returns the data updated in the database.
     * @param {AgentRunUpdateManyAndReturnArgs} args - Arguments to update many AgentRuns.
     * @example
     * // Update many AgentRuns
     * const agentRun = await prisma.agentRun.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more AgentRuns and only return the `id`
     * const agentRunWithIdOnly = await prisma.agentRun.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AgentRunUpdateManyAndReturnArgs>(args: SelectSubset<T, AgentRunUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AgentRunPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one AgentRun.
     * @param {AgentRunUpsertArgs} args - Arguments to update or create a AgentRun.
     * @example
     * // Update or create a AgentRun
     * const agentRun = await prisma.agentRun.upsert({
     *   create: {
     *     // ... data to create a AgentRun
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AgentRun we want to update
     *   }
     * })
     */
    upsert<T extends AgentRunUpsertArgs>(args: SelectSubset<T, AgentRunUpsertArgs<ExtArgs>>): Prisma__AgentRunClient<$Result.GetResult<Prisma.$AgentRunPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of AgentRuns.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentRunCountArgs} args - Arguments to filter AgentRuns to count.
     * @example
     * // Count the number of AgentRuns
     * const count = await prisma.agentRun.count({
     *   where: {
     *     // ... the filter for the AgentRuns we want to count
     *   }
     * })
    **/
    count<T extends AgentRunCountArgs>(
      args?: Subset<T, AgentRunCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AgentRunCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AgentRun.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentRunAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AgentRunAggregateArgs>(args: Subset<T, AgentRunAggregateArgs>): Prisma.PrismaPromise<GetAgentRunAggregateType<T>>

    /**
     * Group by AgentRun.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentRunGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AgentRunGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AgentRunGroupByArgs['orderBy'] }
        : { orderBy?: AgentRunGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AgentRunGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAgentRunGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AgentRun model
   */
  readonly fields: AgentRunFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AgentRun.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AgentRunClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AgentRun model
   */
  interface AgentRunFieldRefs {
    readonly id: FieldRef<"AgentRun", 'String'>
    readonly tenantId: FieldRef<"AgentRun", 'String'>
    readonly agentType: FieldRef<"AgentRun", 'String'>
    readonly status: FieldRef<"AgentRun", 'String'>
    readonly inputHash: FieldRef<"AgentRun", 'String'>
    readonly tokensIn: FieldRef<"AgentRun", 'Int'>
    readonly tokensOut: FieldRef<"AgentRun", 'Int'>
    readonly costUsd: FieldRef<"AgentRun", 'Decimal'>
    readonly latencyMs: FieldRef<"AgentRun", 'Int'>
    readonly modelName: FieldRef<"AgentRun", 'String'>
    readonly iterations: FieldRef<"AgentRun", 'Int'>
    readonly triggeredBy: FieldRef<"AgentRun", 'String'>
    readonly errorMessage: FieldRef<"AgentRun", 'String'>
    readonly startedAt: FieldRef<"AgentRun", 'DateTime'>
    readonly completedAt: FieldRef<"AgentRun", 'DateTime'>
    readonly createdAt: FieldRef<"AgentRun", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AgentRun findUnique
   */
  export type AgentRunFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentRun
     */
    select?: AgentRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentRun
     */
    omit?: AgentRunOmit<ExtArgs> | null
    /**
     * Filter, which AgentRun to fetch.
     */
    where: AgentRunWhereUniqueInput
  }

  /**
   * AgentRun findUniqueOrThrow
   */
  export type AgentRunFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentRun
     */
    select?: AgentRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentRun
     */
    omit?: AgentRunOmit<ExtArgs> | null
    /**
     * Filter, which AgentRun to fetch.
     */
    where: AgentRunWhereUniqueInput
  }

  /**
   * AgentRun findFirst
   */
  export type AgentRunFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentRun
     */
    select?: AgentRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentRun
     */
    omit?: AgentRunOmit<ExtArgs> | null
    /**
     * Filter, which AgentRun to fetch.
     */
    where?: AgentRunWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AgentRuns to fetch.
     */
    orderBy?: AgentRunOrderByWithRelationInput | AgentRunOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AgentRuns.
     */
    cursor?: AgentRunWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AgentRuns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AgentRuns.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AgentRuns.
     */
    distinct?: AgentRunScalarFieldEnum | AgentRunScalarFieldEnum[]
  }

  /**
   * AgentRun findFirstOrThrow
   */
  export type AgentRunFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentRun
     */
    select?: AgentRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentRun
     */
    omit?: AgentRunOmit<ExtArgs> | null
    /**
     * Filter, which AgentRun to fetch.
     */
    where?: AgentRunWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AgentRuns to fetch.
     */
    orderBy?: AgentRunOrderByWithRelationInput | AgentRunOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AgentRuns.
     */
    cursor?: AgentRunWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AgentRuns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AgentRuns.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AgentRuns.
     */
    distinct?: AgentRunScalarFieldEnum | AgentRunScalarFieldEnum[]
  }

  /**
   * AgentRun findMany
   */
  export type AgentRunFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentRun
     */
    select?: AgentRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentRun
     */
    omit?: AgentRunOmit<ExtArgs> | null
    /**
     * Filter, which AgentRuns to fetch.
     */
    where?: AgentRunWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AgentRuns to fetch.
     */
    orderBy?: AgentRunOrderByWithRelationInput | AgentRunOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AgentRuns.
     */
    cursor?: AgentRunWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AgentRuns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AgentRuns.
     */
    skip?: number
    distinct?: AgentRunScalarFieldEnum | AgentRunScalarFieldEnum[]
  }

  /**
   * AgentRun create
   */
  export type AgentRunCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentRun
     */
    select?: AgentRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentRun
     */
    omit?: AgentRunOmit<ExtArgs> | null
    /**
     * The data needed to create a AgentRun.
     */
    data: XOR<AgentRunCreateInput, AgentRunUncheckedCreateInput>
  }

  /**
   * AgentRun createMany
   */
  export type AgentRunCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AgentRuns.
     */
    data: AgentRunCreateManyInput | AgentRunCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AgentRun createManyAndReturn
   */
  export type AgentRunCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentRun
     */
    select?: AgentRunSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AgentRun
     */
    omit?: AgentRunOmit<ExtArgs> | null
    /**
     * The data used to create many AgentRuns.
     */
    data: AgentRunCreateManyInput | AgentRunCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AgentRun update
   */
  export type AgentRunUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentRun
     */
    select?: AgentRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentRun
     */
    omit?: AgentRunOmit<ExtArgs> | null
    /**
     * The data needed to update a AgentRun.
     */
    data: XOR<AgentRunUpdateInput, AgentRunUncheckedUpdateInput>
    /**
     * Choose, which AgentRun to update.
     */
    where: AgentRunWhereUniqueInput
  }

  /**
   * AgentRun updateMany
   */
  export type AgentRunUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AgentRuns.
     */
    data: XOR<AgentRunUpdateManyMutationInput, AgentRunUncheckedUpdateManyInput>
    /**
     * Filter which AgentRuns to update
     */
    where?: AgentRunWhereInput
    /**
     * Limit how many AgentRuns to update.
     */
    limit?: number
  }

  /**
   * AgentRun updateManyAndReturn
   */
  export type AgentRunUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentRun
     */
    select?: AgentRunSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AgentRun
     */
    omit?: AgentRunOmit<ExtArgs> | null
    /**
     * The data used to update AgentRuns.
     */
    data: XOR<AgentRunUpdateManyMutationInput, AgentRunUncheckedUpdateManyInput>
    /**
     * Filter which AgentRuns to update
     */
    where?: AgentRunWhereInput
    /**
     * Limit how many AgentRuns to update.
     */
    limit?: number
  }

  /**
   * AgentRun upsert
   */
  export type AgentRunUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentRun
     */
    select?: AgentRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentRun
     */
    omit?: AgentRunOmit<ExtArgs> | null
    /**
     * The filter to search for the AgentRun to update in case it exists.
     */
    where: AgentRunWhereUniqueInput
    /**
     * In case the AgentRun found by the `where` argument doesn't exist, create a new AgentRun with this data.
     */
    create: XOR<AgentRunCreateInput, AgentRunUncheckedCreateInput>
    /**
     * In case the AgentRun was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AgentRunUpdateInput, AgentRunUncheckedUpdateInput>
  }

  /**
   * AgentRun delete
   */
  export type AgentRunDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentRun
     */
    select?: AgentRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentRun
     */
    omit?: AgentRunOmit<ExtArgs> | null
    /**
     * Filter which AgentRun to delete.
     */
    where: AgentRunWhereUniqueInput
  }

  /**
   * AgentRun deleteMany
   */
  export type AgentRunDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AgentRuns to delete
     */
    where?: AgentRunWhereInput
    /**
     * Limit how many AgentRuns to delete.
     */
    limit?: number
  }

  /**
   * AgentRun without action
   */
  export type AgentRunDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentRun
     */
    select?: AgentRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentRun
     */
    omit?: AgentRunOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const RequisitionScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    title: 'title',
    department: 'department',
    location: 'location',
    country: 'country',
    jobFamily: 'jobFamily',
    description: 'description',
    requirements: 'requirements',
    salaryMin: 'salaryMin',
    salaryMax: 'salaryMax',
    salaryCurrency: 'salaryCurrency',
    status: 'status',
    priority: 'priority',
    hiringManagerId: 'hiringManagerId',
    recruiterId: 'recruiterId',
    headcount: 'headcount',
    targetStartDate: 'targetStartDate',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    closedAt: 'closedAt'
  };

  export type RequisitionScalarFieldEnum = (typeof RequisitionScalarFieldEnum)[keyof typeof RequisitionScalarFieldEnum]


  export const JobPostingScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    requisitionId: 'requisitionId',
    slug: 'slug',
    title: 'title',
    description: 'description',
    requirements: 'requirements',
    isPublished: 'isPublished',
    publishedAt: 'publishedAt',
    expiresAt: 'expiresAt',
    views: 'views',
    applicationCount: 'applicationCount',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type JobPostingScalarFieldEnum = (typeof JobPostingScalarFieldEnum)[keyof typeof JobPostingScalarFieldEnum]


  export const ApplicationFormSchemaScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    requisitionId: 'requisitionId',
    name: 'name',
    fields: 'fields',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ApplicationFormSchemaScalarFieldEnum = (typeof ApplicationFormSchemaScalarFieldEnum)[keyof typeof ApplicationFormSchemaScalarFieldEnum]


  export const SkillScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    name: 'name',
    category: 'category',
    parentId: 'parentId',
    aliases: 'aliases',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type SkillScalarFieldEnum = (typeof SkillScalarFieldEnum)[keyof typeof SkillScalarFieldEnum]


  export const OutboxScalarFieldEnum: {
    id: 'id',
    subject: 'subject',
    type: 'type',
    tenantId: 'tenantId',
    payload: 'payload',
    status: 'status',
    attemptCount: 'attemptCount',
    lastError: 'lastError',
    sentAt: 'sentAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type OutboxScalarFieldEnum = (typeof OutboxScalarFieldEnum)[keyof typeof OutboxScalarFieldEnum]


  export const AgentRunScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    agentType: 'agentType',
    status: 'status',
    inputHash: 'inputHash',
    tokensIn: 'tokensIn',
    tokensOut: 'tokensOut',
    costUsd: 'costUsd',
    latencyMs: 'latencyMs',
    modelName: 'modelName',
    iterations: 'iterations',
    triggeredBy: 'triggeredBy',
    errorMessage: 'errorMessage',
    startedAt: 'startedAt',
    completedAt: 'completedAt',
    createdAt: 'createdAt'
  };

  export type AgentRunScalarFieldEnum = (typeof AgentRunScalarFieldEnum)[keyof typeof AgentRunScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'RequisitionStatus'
   */
  export type EnumRequisitionStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RequisitionStatus'>
    


  /**
   * Reference to a field of type 'RequisitionStatus[]'
   */
  export type ListEnumRequisitionStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RequisitionStatus[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'OutboxStatus'
   */
  export type EnumOutboxStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OutboxStatus'>
    


  /**
   * Reference to a field of type 'OutboxStatus[]'
   */
  export type ListEnumOutboxStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OutboxStatus[]'>
    


  /**
   * Reference to a field of type 'Decimal'
   */
  export type DecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal'>
    


  /**
   * Reference to a field of type 'Decimal[]'
   */
  export type ListDecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal[]'>
    
  /**
   * Deep Input Types
   */


  export type RequisitionWhereInput = {
    AND?: RequisitionWhereInput | RequisitionWhereInput[]
    OR?: RequisitionWhereInput[]
    NOT?: RequisitionWhereInput | RequisitionWhereInput[]
    id?: StringFilter<"Requisition"> | string
    tenantId?: StringFilter<"Requisition"> | string
    title?: StringFilter<"Requisition"> | string
    department?: StringFilter<"Requisition"> | string
    location?: StringFilter<"Requisition"> | string
    country?: StringFilter<"Requisition"> | string
    jobFamily?: StringNullableFilter<"Requisition"> | string | null
    description?: StringNullableFilter<"Requisition"> | string | null
    requirements?: JsonFilter<"Requisition">
    salaryMin?: FloatNullableFilter<"Requisition"> | number | null
    salaryMax?: FloatNullableFilter<"Requisition"> | number | null
    salaryCurrency?: StringFilter<"Requisition"> | string
    status?: EnumRequisitionStatusFilter<"Requisition"> | $Enums.RequisitionStatus
    priority?: IntFilter<"Requisition"> | number
    hiringManagerId?: StringNullableFilter<"Requisition"> | string | null
    recruiterId?: StringNullableFilter<"Requisition"> | string | null
    headcount?: IntFilter<"Requisition"> | number
    targetStartDate?: DateTimeNullableFilter<"Requisition"> | Date | string | null
    createdAt?: DateTimeFilter<"Requisition"> | Date | string
    updatedAt?: DateTimeFilter<"Requisition"> | Date | string
    closedAt?: DateTimeNullableFilter<"Requisition"> | Date | string | null
    jobPostings?: JobPostingListRelationFilter
    formSchema?: XOR<ApplicationFormSchemaNullableScalarRelationFilter, ApplicationFormSchemaWhereInput> | null
  }

  export type RequisitionOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    title?: SortOrder
    department?: SortOrder
    location?: SortOrder
    country?: SortOrder
    jobFamily?: SortOrderInput | SortOrder
    description?: SortOrderInput | SortOrder
    requirements?: SortOrder
    salaryMin?: SortOrderInput | SortOrder
    salaryMax?: SortOrderInput | SortOrder
    salaryCurrency?: SortOrder
    status?: SortOrder
    priority?: SortOrder
    hiringManagerId?: SortOrderInput | SortOrder
    recruiterId?: SortOrderInput | SortOrder
    headcount?: SortOrder
    targetStartDate?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    closedAt?: SortOrderInput | SortOrder
    jobPostings?: JobPostingOrderByRelationAggregateInput
    formSchema?: ApplicationFormSchemaOrderByWithRelationInput
  }

  export type RequisitionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: RequisitionWhereInput | RequisitionWhereInput[]
    OR?: RequisitionWhereInput[]
    NOT?: RequisitionWhereInput | RequisitionWhereInput[]
    tenantId?: StringFilter<"Requisition"> | string
    title?: StringFilter<"Requisition"> | string
    department?: StringFilter<"Requisition"> | string
    location?: StringFilter<"Requisition"> | string
    country?: StringFilter<"Requisition"> | string
    jobFamily?: StringNullableFilter<"Requisition"> | string | null
    description?: StringNullableFilter<"Requisition"> | string | null
    requirements?: JsonFilter<"Requisition">
    salaryMin?: FloatNullableFilter<"Requisition"> | number | null
    salaryMax?: FloatNullableFilter<"Requisition"> | number | null
    salaryCurrency?: StringFilter<"Requisition"> | string
    status?: EnumRequisitionStatusFilter<"Requisition"> | $Enums.RequisitionStatus
    priority?: IntFilter<"Requisition"> | number
    hiringManagerId?: StringNullableFilter<"Requisition"> | string | null
    recruiterId?: StringNullableFilter<"Requisition"> | string | null
    headcount?: IntFilter<"Requisition"> | number
    targetStartDate?: DateTimeNullableFilter<"Requisition"> | Date | string | null
    createdAt?: DateTimeFilter<"Requisition"> | Date | string
    updatedAt?: DateTimeFilter<"Requisition"> | Date | string
    closedAt?: DateTimeNullableFilter<"Requisition"> | Date | string | null
    jobPostings?: JobPostingListRelationFilter
    formSchema?: XOR<ApplicationFormSchemaNullableScalarRelationFilter, ApplicationFormSchemaWhereInput> | null
  }, "id">

  export type RequisitionOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    title?: SortOrder
    department?: SortOrder
    location?: SortOrder
    country?: SortOrder
    jobFamily?: SortOrderInput | SortOrder
    description?: SortOrderInput | SortOrder
    requirements?: SortOrder
    salaryMin?: SortOrderInput | SortOrder
    salaryMax?: SortOrderInput | SortOrder
    salaryCurrency?: SortOrder
    status?: SortOrder
    priority?: SortOrder
    hiringManagerId?: SortOrderInput | SortOrder
    recruiterId?: SortOrderInput | SortOrder
    headcount?: SortOrder
    targetStartDate?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    closedAt?: SortOrderInput | SortOrder
    _count?: RequisitionCountOrderByAggregateInput
    _avg?: RequisitionAvgOrderByAggregateInput
    _max?: RequisitionMaxOrderByAggregateInput
    _min?: RequisitionMinOrderByAggregateInput
    _sum?: RequisitionSumOrderByAggregateInput
  }

  export type RequisitionScalarWhereWithAggregatesInput = {
    AND?: RequisitionScalarWhereWithAggregatesInput | RequisitionScalarWhereWithAggregatesInput[]
    OR?: RequisitionScalarWhereWithAggregatesInput[]
    NOT?: RequisitionScalarWhereWithAggregatesInput | RequisitionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Requisition"> | string
    tenantId?: StringWithAggregatesFilter<"Requisition"> | string
    title?: StringWithAggregatesFilter<"Requisition"> | string
    department?: StringWithAggregatesFilter<"Requisition"> | string
    location?: StringWithAggregatesFilter<"Requisition"> | string
    country?: StringWithAggregatesFilter<"Requisition"> | string
    jobFamily?: StringNullableWithAggregatesFilter<"Requisition"> | string | null
    description?: StringNullableWithAggregatesFilter<"Requisition"> | string | null
    requirements?: JsonWithAggregatesFilter<"Requisition">
    salaryMin?: FloatNullableWithAggregatesFilter<"Requisition"> | number | null
    salaryMax?: FloatNullableWithAggregatesFilter<"Requisition"> | number | null
    salaryCurrency?: StringWithAggregatesFilter<"Requisition"> | string
    status?: EnumRequisitionStatusWithAggregatesFilter<"Requisition"> | $Enums.RequisitionStatus
    priority?: IntWithAggregatesFilter<"Requisition"> | number
    hiringManagerId?: StringNullableWithAggregatesFilter<"Requisition"> | string | null
    recruiterId?: StringNullableWithAggregatesFilter<"Requisition"> | string | null
    headcount?: IntWithAggregatesFilter<"Requisition"> | number
    targetStartDate?: DateTimeNullableWithAggregatesFilter<"Requisition"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Requisition"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Requisition"> | Date | string
    closedAt?: DateTimeNullableWithAggregatesFilter<"Requisition"> | Date | string | null
  }

  export type JobPostingWhereInput = {
    AND?: JobPostingWhereInput | JobPostingWhereInput[]
    OR?: JobPostingWhereInput[]
    NOT?: JobPostingWhereInput | JobPostingWhereInput[]
    id?: StringFilter<"JobPosting"> | string
    tenantId?: StringFilter<"JobPosting"> | string
    requisitionId?: StringFilter<"JobPosting"> | string
    slug?: StringFilter<"JobPosting"> | string
    title?: StringFilter<"JobPosting"> | string
    description?: StringFilter<"JobPosting"> | string
    requirements?: StringNullableListFilter<"JobPosting">
    isPublished?: BoolFilter<"JobPosting"> | boolean
    publishedAt?: DateTimeNullableFilter<"JobPosting"> | Date | string | null
    expiresAt?: DateTimeNullableFilter<"JobPosting"> | Date | string | null
    views?: IntFilter<"JobPosting"> | number
    applicationCount?: IntFilter<"JobPosting"> | number
    createdAt?: DateTimeFilter<"JobPosting"> | Date | string
    updatedAt?: DateTimeFilter<"JobPosting"> | Date | string
    requisition?: XOR<RequisitionScalarRelationFilter, RequisitionWhereInput>
  }

  export type JobPostingOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    requisitionId?: SortOrder
    slug?: SortOrder
    title?: SortOrder
    description?: SortOrder
    requirements?: SortOrder
    isPublished?: SortOrder
    publishedAt?: SortOrderInput | SortOrder
    expiresAt?: SortOrderInput | SortOrder
    views?: SortOrder
    applicationCount?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    requisition?: RequisitionOrderByWithRelationInput
  }

  export type JobPostingWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    tenantId_slug?: JobPostingTenantIdSlugCompoundUniqueInput
    AND?: JobPostingWhereInput | JobPostingWhereInput[]
    OR?: JobPostingWhereInput[]
    NOT?: JobPostingWhereInput | JobPostingWhereInput[]
    tenantId?: StringFilter<"JobPosting"> | string
    requisitionId?: StringFilter<"JobPosting"> | string
    slug?: StringFilter<"JobPosting"> | string
    title?: StringFilter<"JobPosting"> | string
    description?: StringFilter<"JobPosting"> | string
    requirements?: StringNullableListFilter<"JobPosting">
    isPublished?: BoolFilter<"JobPosting"> | boolean
    publishedAt?: DateTimeNullableFilter<"JobPosting"> | Date | string | null
    expiresAt?: DateTimeNullableFilter<"JobPosting"> | Date | string | null
    views?: IntFilter<"JobPosting"> | number
    applicationCount?: IntFilter<"JobPosting"> | number
    createdAt?: DateTimeFilter<"JobPosting"> | Date | string
    updatedAt?: DateTimeFilter<"JobPosting"> | Date | string
    requisition?: XOR<RequisitionScalarRelationFilter, RequisitionWhereInput>
  }, "id" | "tenantId_slug">

  export type JobPostingOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    requisitionId?: SortOrder
    slug?: SortOrder
    title?: SortOrder
    description?: SortOrder
    requirements?: SortOrder
    isPublished?: SortOrder
    publishedAt?: SortOrderInput | SortOrder
    expiresAt?: SortOrderInput | SortOrder
    views?: SortOrder
    applicationCount?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: JobPostingCountOrderByAggregateInput
    _avg?: JobPostingAvgOrderByAggregateInput
    _max?: JobPostingMaxOrderByAggregateInput
    _min?: JobPostingMinOrderByAggregateInput
    _sum?: JobPostingSumOrderByAggregateInput
  }

  export type JobPostingScalarWhereWithAggregatesInput = {
    AND?: JobPostingScalarWhereWithAggregatesInput | JobPostingScalarWhereWithAggregatesInput[]
    OR?: JobPostingScalarWhereWithAggregatesInput[]
    NOT?: JobPostingScalarWhereWithAggregatesInput | JobPostingScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"JobPosting"> | string
    tenantId?: StringWithAggregatesFilter<"JobPosting"> | string
    requisitionId?: StringWithAggregatesFilter<"JobPosting"> | string
    slug?: StringWithAggregatesFilter<"JobPosting"> | string
    title?: StringWithAggregatesFilter<"JobPosting"> | string
    description?: StringWithAggregatesFilter<"JobPosting"> | string
    requirements?: StringNullableListFilter<"JobPosting">
    isPublished?: BoolWithAggregatesFilter<"JobPosting"> | boolean
    publishedAt?: DateTimeNullableWithAggregatesFilter<"JobPosting"> | Date | string | null
    expiresAt?: DateTimeNullableWithAggregatesFilter<"JobPosting"> | Date | string | null
    views?: IntWithAggregatesFilter<"JobPosting"> | number
    applicationCount?: IntWithAggregatesFilter<"JobPosting"> | number
    createdAt?: DateTimeWithAggregatesFilter<"JobPosting"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"JobPosting"> | Date | string
  }

  export type ApplicationFormSchemaWhereInput = {
    AND?: ApplicationFormSchemaWhereInput | ApplicationFormSchemaWhereInput[]
    OR?: ApplicationFormSchemaWhereInput[]
    NOT?: ApplicationFormSchemaWhereInput | ApplicationFormSchemaWhereInput[]
    id?: StringFilter<"ApplicationFormSchema"> | string
    tenantId?: StringFilter<"ApplicationFormSchema"> | string
    requisitionId?: StringFilter<"ApplicationFormSchema"> | string
    name?: StringFilter<"ApplicationFormSchema"> | string
    fields?: JsonFilter<"ApplicationFormSchema">
    createdAt?: DateTimeFilter<"ApplicationFormSchema"> | Date | string
    updatedAt?: DateTimeFilter<"ApplicationFormSchema"> | Date | string
    requisition?: XOR<RequisitionScalarRelationFilter, RequisitionWhereInput>
  }

  export type ApplicationFormSchemaOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    requisitionId?: SortOrder
    name?: SortOrder
    fields?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    requisition?: RequisitionOrderByWithRelationInput
  }

  export type ApplicationFormSchemaWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    requisitionId?: string
    AND?: ApplicationFormSchemaWhereInput | ApplicationFormSchemaWhereInput[]
    OR?: ApplicationFormSchemaWhereInput[]
    NOT?: ApplicationFormSchemaWhereInput | ApplicationFormSchemaWhereInput[]
    tenantId?: StringFilter<"ApplicationFormSchema"> | string
    name?: StringFilter<"ApplicationFormSchema"> | string
    fields?: JsonFilter<"ApplicationFormSchema">
    createdAt?: DateTimeFilter<"ApplicationFormSchema"> | Date | string
    updatedAt?: DateTimeFilter<"ApplicationFormSchema"> | Date | string
    requisition?: XOR<RequisitionScalarRelationFilter, RequisitionWhereInput>
  }, "id" | "requisitionId">

  export type ApplicationFormSchemaOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    requisitionId?: SortOrder
    name?: SortOrder
    fields?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ApplicationFormSchemaCountOrderByAggregateInput
    _max?: ApplicationFormSchemaMaxOrderByAggregateInput
    _min?: ApplicationFormSchemaMinOrderByAggregateInput
  }

  export type ApplicationFormSchemaScalarWhereWithAggregatesInput = {
    AND?: ApplicationFormSchemaScalarWhereWithAggregatesInput | ApplicationFormSchemaScalarWhereWithAggregatesInput[]
    OR?: ApplicationFormSchemaScalarWhereWithAggregatesInput[]
    NOT?: ApplicationFormSchemaScalarWhereWithAggregatesInput | ApplicationFormSchemaScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ApplicationFormSchema"> | string
    tenantId?: StringWithAggregatesFilter<"ApplicationFormSchema"> | string
    requisitionId?: StringWithAggregatesFilter<"ApplicationFormSchema"> | string
    name?: StringWithAggregatesFilter<"ApplicationFormSchema"> | string
    fields?: JsonWithAggregatesFilter<"ApplicationFormSchema">
    createdAt?: DateTimeWithAggregatesFilter<"ApplicationFormSchema"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"ApplicationFormSchema"> | Date | string
  }

  export type SkillWhereInput = {
    AND?: SkillWhereInput | SkillWhereInput[]
    OR?: SkillWhereInput[]
    NOT?: SkillWhereInput | SkillWhereInput[]
    id?: StringFilter<"Skill"> | string
    tenantId?: StringNullableFilter<"Skill"> | string | null
    name?: StringFilter<"Skill"> | string
    category?: StringNullableFilter<"Skill"> | string | null
    parentId?: StringNullableFilter<"Skill"> | string | null
    aliases?: StringNullableListFilter<"Skill">
    createdAt?: DateTimeFilter<"Skill"> | Date | string
    updatedAt?: DateTimeFilter<"Skill"> | Date | string
    parent?: XOR<SkillNullableScalarRelationFilter, SkillWhereInput> | null
    children?: SkillListRelationFilter
  }

  export type SkillOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrderInput | SortOrder
    name?: SortOrder
    category?: SortOrderInput | SortOrder
    parentId?: SortOrderInput | SortOrder
    aliases?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    parent?: SkillOrderByWithRelationInput
    children?: SkillOrderByRelationAggregateInput
  }

  export type SkillWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    tenantId_name?: SkillTenantIdNameCompoundUniqueInput
    AND?: SkillWhereInput | SkillWhereInput[]
    OR?: SkillWhereInput[]
    NOT?: SkillWhereInput | SkillWhereInput[]
    tenantId?: StringNullableFilter<"Skill"> | string | null
    name?: StringFilter<"Skill"> | string
    category?: StringNullableFilter<"Skill"> | string | null
    parentId?: StringNullableFilter<"Skill"> | string | null
    aliases?: StringNullableListFilter<"Skill">
    createdAt?: DateTimeFilter<"Skill"> | Date | string
    updatedAt?: DateTimeFilter<"Skill"> | Date | string
    parent?: XOR<SkillNullableScalarRelationFilter, SkillWhereInput> | null
    children?: SkillListRelationFilter
  }, "id" | "tenantId_name">

  export type SkillOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrderInput | SortOrder
    name?: SortOrder
    category?: SortOrderInput | SortOrder
    parentId?: SortOrderInput | SortOrder
    aliases?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: SkillCountOrderByAggregateInput
    _max?: SkillMaxOrderByAggregateInput
    _min?: SkillMinOrderByAggregateInput
  }

  export type SkillScalarWhereWithAggregatesInput = {
    AND?: SkillScalarWhereWithAggregatesInput | SkillScalarWhereWithAggregatesInput[]
    OR?: SkillScalarWhereWithAggregatesInput[]
    NOT?: SkillScalarWhereWithAggregatesInput | SkillScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Skill"> | string
    tenantId?: StringNullableWithAggregatesFilter<"Skill"> | string | null
    name?: StringWithAggregatesFilter<"Skill"> | string
    category?: StringNullableWithAggregatesFilter<"Skill"> | string | null
    parentId?: StringNullableWithAggregatesFilter<"Skill"> | string | null
    aliases?: StringNullableListFilter<"Skill">
    createdAt?: DateTimeWithAggregatesFilter<"Skill"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Skill"> | Date | string
  }

  export type OutboxWhereInput = {
    AND?: OutboxWhereInput | OutboxWhereInput[]
    OR?: OutboxWhereInput[]
    NOT?: OutboxWhereInput | OutboxWhereInput[]
    id?: StringFilter<"Outbox"> | string
    subject?: StringFilter<"Outbox"> | string
    type?: StringFilter<"Outbox"> | string
    tenantId?: StringNullableFilter<"Outbox"> | string | null
    payload?: JsonFilter<"Outbox">
    status?: EnumOutboxStatusFilter<"Outbox"> | $Enums.OutboxStatus
    attemptCount?: IntFilter<"Outbox"> | number
    lastError?: StringNullableFilter<"Outbox"> | string | null
    sentAt?: DateTimeNullableFilter<"Outbox"> | Date | string | null
    createdAt?: DateTimeFilter<"Outbox"> | Date | string
    updatedAt?: DateTimeFilter<"Outbox"> | Date | string
  }

  export type OutboxOrderByWithRelationInput = {
    id?: SortOrder
    subject?: SortOrder
    type?: SortOrder
    tenantId?: SortOrderInput | SortOrder
    payload?: SortOrder
    status?: SortOrder
    attemptCount?: SortOrder
    lastError?: SortOrderInput | SortOrder
    sentAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OutboxWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: OutboxWhereInput | OutboxWhereInput[]
    OR?: OutboxWhereInput[]
    NOT?: OutboxWhereInput | OutboxWhereInput[]
    subject?: StringFilter<"Outbox"> | string
    type?: StringFilter<"Outbox"> | string
    tenantId?: StringNullableFilter<"Outbox"> | string | null
    payload?: JsonFilter<"Outbox">
    status?: EnumOutboxStatusFilter<"Outbox"> | $Enums.OutboxStatus
    attemptCount?: IntFilter<"Outbox"> | number
    lastError?: StringNullableFilter<"Outbox"> | string | null
    sentAt?: DateTimeNullableFilter<"Outbox"> | Date | string | null
    createdAt?: DateTimeFilter<"Outbox"> | Date | string
    updatedAt?: DateTimeFilter<"Outbox"> | Date | string
  }, "id">

  export type OutboxOrderByWithAggregationInput = {
    id?: SortOrder
    subject?: SortOrder
    type?: SortOrder
    tenantId?: SortOrderInput | SortOrder
    payload?: SortOrder
    status?: SortOrder
    attemptCount?: SortOrder
    lastError?: SortOrderInput | SortOrder
    sentAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: OutboxCountOrderByAggregateInput
    _avg?: OutboxAvgOrderByAggregateInput
    _max?: OutboxMaxOrderByAggregateInput
    _min?: OutboxMinOrderByAggregateInput
    _sum?: OutboxSumOrderByAggregateInput
  }

  export type OutboxScalarWhereWithAggregatesInput = {
    AND?: OutboxScalarWhereWithAggregatesInput | OutboxScalarWhereWithAggregatesInput[]
    OR?: OutboxScalarWhereWithAggregatesInput[]
    NOT?: OutboxScalarWhereWithAggregatesInput | OutboxScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Outbox"> | string
    subject?: StringWithAggregatesFilter<"Outbox"> | string
    type?: StringWithAggregatesFilter<"Outbox"> | string
    tenantId?: StringNullableWithAggregatesFilter<"Outbox"> | string | null
    payload?: JsonWithAggregatesFilter<"Outbox">
    status?: EnumOutboxStatusWithAggregatesFilter<"Outbox"> | $Enums.OutboxStatus
    attemptCount?: IntWithAggregatesFilter<"Outbox"> | number
    lastError?: StringNullableWithAggregatesFilter<"Outbox"> | string | null
    sentAt?: DateTimeNullableWithAggregatesFilter<"Outbox"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Outbox"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Outbox"> | Date | string
  }

  export type AgentRunWhereInput = {
    AND?: AgentRunWhereInput | AgentRunWhereInput[]
    OR?: AgentRunWhereInput[]
    NOT?: AgentRunWhereInput | AgentRunWhereInput[]
    id?: StringFilter<"AgentRun"> | string
    tenantId?: StringFilter<"AgentRun"> | string
    agentType?: StringFilter<"AgentRun"> | string
    status?: StringFilter<"AgentRun"> | string
    inputHash?: StringFilter<"AgentRun"> | string
    tokensIn?: IntFilter<"AgentRun"> | number
    tokensOut?: IntFilter<"AgentRun"> | number
    costUsd?: DecimalFilter<"AgentRun"> | Decimal | DecimalJsLike | number | string
    latencyMs?: IntFilter<"AgentRun"> | number
    modelName?: StringFilter<"AgentRun"> | string
    iterations?: IntFilter<"AgentRun"> | number
    triggeredBy?: StringNullableFilter<"AgentRun"> | string | null
    errorMessage?: StringNullableFilter<"AgentRun"> | string | null
    startedAt?: DateTimeFilter<"AgentRun"> | Date | string
    completedAt?: DateTimeFilter<"AgentRun"> | Date | string
    createdAt?: DateTimeFilter<"AgentRun"> | Date | string
  }

  export type AgentRunOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    agentType?: SortOrder
    status?: SortOrder
    inputHash?: SortOrder
    tokensIn?: SortOrder
    tokensOut?: SortOrder
    costUsd?: SortOrder
    latencyMs?: SortOrder
    modelName?: SortOrder
    iterations?: SortOrder
    triggeredBy?: SortOrderInput | SortOrder
    errorMessage?: SortOrderInput | SortOrder
    startedAt?: SortOrder
    completedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type AgentRunWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: AgentRunWhereInput | AgentRunWhereInput[]
    OR?: AgentRunWhereInput[]
    NOT?: AgentRunWhereInput | AgentRunWhereInput[]
    tenantId?: StringFilter<"AgentRun"> | string
    agentType?: StringFilter<"AgentRun"> | string
    status?: StringFilter<"AgentRun"> | string
    inputHash?: StringFilter<"AgentRun"> | string
    tokensIn?: IntFilter<"AgentRun"> | number
    tokensOut?: IntFilter<"AgentRun"> | number
    costUsd?: DecimalFilter<"AgentRun"> | Decimal | DecimalJsLike | number | string
    latencyMs?: IntFilter<"AgentRun"> | number
    modelName?: StringFilter<"AgentRun"> | string
    iterations?: IntFilter<"AgentRun"> | number
    triggeredBy?: StringNullableFilter<"AgentRun"> | string | null
    errorMessage?: StringNullableFilter<"AgentRun"> | string | null
    startedAt?: DateTimeFilter<"AgentRun"> | Date | string
    completedAt?: DateTimeFilter<"AgentRun"> | Date | string
    createdAt?: DateTimeFilter<"AgentRun"> | Date | string
  }, "id">

  export type AgentRunOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    agentType?: SortOrder
    status?: SortOrder
    inputHash?: SortOrder
    tokensIn?: SortOrder
    tokensOut?: SortOrder
    costUsd?: SortOrder
    latencyMs?: SortOrder
    modelName?: SortOrder
    iterations?: SortOrder
    triggeredBy?: SortOrderInput | SortOrder
    errorMessage?: SortOrderInput | SortOrder
    startedAt?: SortOrder
    completedAt?: SortOrder
    createdAt?: SortOrder
    _count?: AgentRunCountOrderByAggregateInput
    _avg?: AgentRunAvgOrderByAggregateInput
    _max?: AgentRunMaxOrderByAggregateInput
    _min?: AgentRunMinOrderByAggregateInput
    _sum?: AgentRunSumOrderByAggregateInput
  }

  export type AgentRunScalarWhereWithAggregatesInput = {
    AND?: AgentRunScalarWhereWithAggregatesInput | AgentRunScalarWhereWithAggregatesInput[]
    OR?: AgentRunScalarWhereWithAggregatesInput[]
    NOT?: AgentRunScalarWhereWithAggregatesInput | AgentRunScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"AgentRun"> | string
    tenantId?: StringWithAggregatesFilter<"AgentRun"> | string
    agentType?: StringWithAggregatesFilter<"AgentRun"> | string
    status?: StringWithAggregatesFilter<"AgentRun"> | string
    inputHash?: StringWithAggregatesFilter<"AgentRun"> | string
    tokensIn?: IntWithAggregatesFilter<"AgentRun"> | number
    tokensOut?: IntWithAggregatesFilter<"AgentRun"> | number
    costUsd?: DecimalWithAggregatesFilter<"AgentRun"> | Decimal | DecimalJsLike | number | string
    latencyMs?: IntWithAggregatesFilter<"AgentRun"> | number
    modelName?: StringWithAggregatesFilter<"AgentRun"> | string
    iterations?: IntWithAggregatesFilter<"AgentRun"> | number
    triggeredBy?: StringNullableWithAggregatesFilter<"AgentRun"> | string | null
    errorMessage?: StringNullableWithAggregatesFilter<"AgentRun"> | string | null
    startedAt?: DateTimeWithAggregatesFilter<"AgentRun"> | Date | string
    completedAt?: DateTimeWithAggregatesFilter<"AgentRun"> | Date | string
    createdAt?: DateTimeWithAggregatesFilter<"AgentRun"> | Date | string
  }

  export type RequisitionCreateInput = {
    id?: string
    tenantId: string
    title: string
    department: string
    location: string
    country?: string
    jobFamily?: string | null
    description?: string | null
    requirements?: JsonNullValueInput | InputJsonValue
    salaryMin?: number | null
    salaryMax?: number | null
    salaryCurrency?: string
    status?: $Enums.RequisitionStatus
    priority?: number
    hiringManagerId?: string | null
    recruiterId?: string | null
    headcount?: number
    targetStartDate?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    closedAt?: Date | string | null
    jobPostings?: JobPostingCreateNestedManyWithoutRequisitionInput
    formSchema?: ApplicationFormSchemaCreateNestedOneWithoutRequisitionInput
  }

  export type RequisitionUncheckedCreateInput = {
    id?: string
    tenantId: string
    title: string
    department: string
    location: string
    country?: string
    jobFamily?: string | null
    description?: string | null
    requirements?: JsonNullValueInput | InputJsonValue
    salaryMin?: number | null
    salaryMax?: number | null
    salaryCurrency?: string
    status?: $Enums.RequisitionStatus
    priority?: number
    hiringManagerId?: string | null
    recruiterId?: string | null
    headcount?: number
    targetStartDate?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    closedAt?: Date | string | null
    jobPostings?: JobPostingUncheckedCreateNestedManyWithoutRequisitionInput
    formSchema?: ApplicationFormSchemaUncheckedCreateNestedOneWithoutRequisitionInput
  }

  export type RequisitionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    department?: StringFieldUpdateOperationsInput | string
    location?: StringFieldUpdateOperationsInput | string
    country?: StringFieldUpdateOperationsInput | string
    jobFamily?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    requirements?: JsonNullValueInput | InputJsonValue
    salaryMin?: NullableFloatFieldUpdateOperationsInput | number | null
    salaryMax?: NullableFloatFieldUpdateOperationsInput | number | null
    salaryCurrency?: StringFieldUpdateOperationsInput | string
    status?: EnumRequisitionStatusFieldUpdateOperationsInput | $Enums.RequisitionStatus
    priority?: IntFieldUpdateOperationsInput | number
    hiringManagerId?: NullableStringFieldUpdateOperationsInput | string | null
    recruiterId?: NullableStringFieldUpdateOperationsInput | string | null
    headcount?: IntFieldUpdateOperationsInput | number
    targetStartDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    closedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    jobPostings?: JobPostingUpdateManyWithoutRequisitionNestedInput
    formSchema?: ApplicationFormSchemaUpdateOneWithoutRequisitionNestedInput
  }

  export type RequisitionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    department?: StringFieldUpdateOperationsInput | string
    location?: StringFieldUpdateOperationsInput | string
    country?: StringFieldUpdateOperationsInput | string
    jobFamily?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    requirements?: JsonNullValueInput | InputJsonValue
    salaryMin?: NullableFloatFieldUpdateOperationsInput | number | null
    salaryMax?: NullableFloatFieldUpdateOperationsInput | number | null
    salaryCurrency?: StringFieldUpdateOperationsInput | string
    status?: EnumRequisitionStatusFieldUpdateOperationsInput | $Enums.RequisitionStatus
    priority?: IntFieldUpdateOperationsInput | number
    hiringManagerId?: NullableStringFieldUpdateOperationsInput | string | null
    recruiterId?: NullableStringFieldUpdateOperationsInput | string | null
    headcount?: IntFieldUpdateOperationsInput | number
    targetStartDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    closedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    jobPostings?: JobPostingUncheckedUpdateManyWithoutRequisitionNestedInput
    formSchema?: ApplicationFormSchemaUncheckedUpdateOneWithoutRequisitionNestedInput
  }

  export type RequisitionCreateManyInput = {
    id?: string
    tenantId: string
    title: string
    department: string
    location: string
    country?: string
    jobFamily?: string | null
    description?: string | null
    requirements?: JsonNullValueInput | InputJsonValue
    salaryMin?: number | null
    salaryMax?: number | null
    salaryCurrency?: string
    status?: $Enums.RequisitionStatus
    priority?: number
    hiringManagerId?: string | null
    recruiterId?: string | null
    headcount?: number
    targetStartDate?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    closedAt?: Date | string | null
  }

  export type RequisitionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    department?: StringFieldUpdateOperationsInput | string
    location?: StringFieldUpdateOperationsInput | string
    country?: StringFieldUpdateOperationsInput | string
    jobFamily?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    requirements?: JsonNullValueInput | InputJsonValue
    salaryMin?: NullableFloatFieldUpdateOperationsInput | number | null
    salaryMax?: NullableFloatFieldUpdateOperationsInput | number | null
    salaryCurrency?: StringFieldUpdateOperationsInput | string
    status?: EnumRequisitionStatusFieldUpdateOperationsInput | $Enums.RequisitionStatus
    priority?: IntFieldUpdateOperationsInput | number
    hiringManagerId?: NullableStringFieldUpdateOperationsInput | string | null
    recruiterId?: NullableStringFieldUpdateOperationsInput | string | null
    headcount?: IntFieldUpdateOperationsInput | number
    targetStartDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    closedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type RequisitionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    department?: StringFieldUpdateOperationsInput | string
    location?: StringFieldUpdateOperationsInput | string
    country?: StringFieldUpdateOperationsInput | string
    jobFamily?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    requirements?: JsonNullValueInput | InputJsonValue
    salaryMin?: NullableFloatFieldUpdateOperationsInput | number | null
    salaryMax?: NullableFloatFieldUpdateOperationsInput | number | null
    salaryCurrency?: StringFieldUpdateOperationsInput | string
    status?: EnumRequisitionStatusFieldUpdateOperationsInput | $Enums.RequisitionStatus
    priority?: IntFieldUpdateOperationsInput | number
    hiringManagerId?: NullableStringFieldUpdateOperationsInput | string | null
    recruiterId?: NullableStringFieldUpdateOperationsInput | string | null
    headcount?: IntFieldUpdateOperationsInput | number
    targetStartDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    closedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type JobPostingCreateInput = {
    id?: string
    tenantId: string
    slug: string
    title: string
    description: string
    requirements?: JobPostingCreaterequirementsInput | string[]
    isPublished?: boolean
    publishedAt?: Date | string | null
    expiresAt?: Date | string | null
    views?: number
    applicationCount?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    requisition: RequisitionCreateNestedOneWithoutJobPostingsInput
  }

  export type JobPostingUncheckedCreateInput = {
    id?: string
    tenantId: string
    requisitionId: string
    slug: string
    title: string
    description: string
    requirements?: JobPostingCreaterequirementsInput | string[]
    isPublished?: boolean
    publishedAt?: Date | string | null
    expiresAt?: Date | string | null
    views?: number
    applicationCount?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type JobPostingUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    requirements?: JobPostingUpdaterequirementsInput | string[]
    isPublished?: BoolFieldUpdateOperationsInput | boolean
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    views?: IntFieldUpdateOperationsInput | number
    applicationCount?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    requisition?: RequisitionUpdateOneRequiredWithoutJobPostingsNestedInput
  }

  export type JobPostingUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    requisitionId?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    requirements?: JobPostingUpdaterequirementsInput | string[]
    isPublished?: BoolFieldUpdateOperationsInput | boolean
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    views?: IntFieldUpdateOperationsInput | number
    applicationCount?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type JobPostingCreateManyInput = {
    id?: string
    tenantId: string
    requisitionId: string
    slug: string
    title: string
    description: string
    requirements?: JobPostingCreaterequirementsInput | string[]
    isPublished?: boolean
    publishedAt?: Date | string | null
    expiresAt?: Date | string | null
    views?: number
    applicationCount?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type JobPostingUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    requirements?: JobPostingUpdaterequirementsInput | string[]
    isPublished?: BoolFieldUpdateOperationsInput | boolean
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    views?: IntFieldUpdateOperationsInput | number
    applicationCount?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type JobPostingUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    requisitionId?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    requirements?: JobPostingUpdaterequirementsInput | string[]
    isPublished?: BoolFieldUpdateOperationsInput | boolean
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    views?: IntFieldUpdateOperationsInput | number
    applicationCount?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ApplicationFormSchemaCreateInput = {
    id?: string
    tenantId: string
    name?: string
    fields: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    requisition: RequisitionCreateNestedOneWithoutFormSchemaInput
  }

  export type ApplicationFormSchemaUncheckedCreateInput = {
    id?: string
    tenantId: string
    requisitionId: string
    name?: string
    fields: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ApplicationFormSchemaUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    fields?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    requisition?: RequisitionUpdateOneRequiredWithoutFormSchemaNestedInput
  }

  export type ApplicationFormSchemaUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    requisitionId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    fields?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ApplicationFormSchemaCreateManyInput = {
    id?: string
    tenantId: string
    requisitionId: string
    name?: string
    fields: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ApplicationFormSchemaUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    fields?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ApplicationFormSchemaUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    requisitionId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    fields?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SkillCreateInput = {
    id?: string
    tenantId?: string | null
    name: string
    category?: string | null
    aliases?: SkillCreatealiasesInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
    parent?: SkillCreateNestedOneWithoutChildrenInput
    children?: SkillCreateNestedManyWithoutParentInput
  }

  export type SkillUncheckedCreateInput = {
    id?: string
    tenantId?: string | null
    name: string
    category?: string | null
    parentId?: string | null
    aliases?: SkillCreatealiasesInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
    children?: SkillUncheckedCreateNestedManyWithoutParentInput
  }

  export type SkillUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    category?: NullableStringFieldUpdateOperationsInput | string | null
    aliases?: SkillUpdatealiasesInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    parent?: SkillUpdateOneWithoutChildrenNestedInput
    children?: SkillUpdateManyWithoutParentNestedInput
  }

  export type SkillUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    category?: NullableStringFieldUpdateOperationsInput | string | null
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    aliases?: SkillUpdatealiasesInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    children?: SkillUncheckedUpdateManyWithoutParentNestedInput
  }

  export type SkillCreateManyInput = {
    id?: string
    tenantId?: string | null
    name: string
    category?: string | null
    parentId?: string | null
    aliases?: SkillCreatealiasesInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SkillUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    category?: NullableStringFieldUpdateOperationsInput | string | null
    aliases?: SkillUpdatealiasesInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SkillUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    category?: NullableStringFieldUpdateOperationsInput | string | null
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    aliases?: SkillUpdatealiasesInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OutboxCreateInput = {
    id?: string
    subject: string
    type: string
    tenantId?: string | null
    payload: JsonNullValueInput | InputJsonValue
    status?: $Enums.OutboxStatus
    attemptCount?: number
    lastError?: string | null
    sentAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OutboxUncheckedCreateInput = {
    id?: string
    subject: string
    type: string
    tenantId?: string | null
    payload: JsonNullValueInput | InputJsonValue
    status?: $Enums.OutboxStatus
    attemptCount?: number
    lastError?: string | null
    sentAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OutboxUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    subject?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    payload?: JsonNullValueInput | InputJsonValue
    status?: EnumOutboxStatusFieldUpdateOperationsInput | $Enums.OutboxStatus
    attemptCount?: IntFieldUpdateOperationsInput | number
    lastError?: NullableStringFieldUpdateOperationsInput | string | null
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OutboxUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    subject?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    payload?: JsonNullValueInput | InputJsonValue
    status?: EnumOutboxStatusFieldUpdateOperationsInput | $Enums.OutboxStatus
    attemptCount?: IntFieldUpdateOperationsInput | number
    lastError?: NullableStringFieldUpdateOperationsInput | string | null
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OutboxCreateManyInput = {
    id?: string
    subject: string
    type: string
    tenantId?: string | null
    payload: JsonNullValueInput | InputJsonValue
    status?: $Enums.OutboxStatus
    attemptCount?: number
    lastError?: string | null
    sentAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OutboxUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    subject?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    payload?: JsonNullValueInput | InputJsonValue
    status?: EnumOutboxStatusFieldUpdateOperationsInput | $Enums.OutboxStatus
    attemptCount?: IntFieldUpdateOperationsInput | number
    lastError?: NullableStringFieldUpdateOperationsInput | string | null
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OutboxUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    subject?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    payload?: JsonNullValueInput | InputJsonValue
    status?: EnumOutboxStatusFieldUpdateOperationsInput | $Enums.OutboxStatus
    attemptCount?: IntFieldUpdateOperationsInput | number
    lastError?: NullableStringFieldUpdateOperationsInput | string | null
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AgentRunCreateInput = {
    id: string
    tenantId: string
    agentType: string
    status: string
    inputHash: string
    tokensIn: number
    tokensOut: number
    costUsd: Decimal | DecimalJsLike | number | string
    latencyMs: number
    modelName: string
    iterations?: number
    triggeredBy?: string | null
    errorMessage?: string | null
    startedAt: Date | string
    completedAt: Date | string
    createdAt?: Date | string
  }

  export type AgentRunUncheckedCreateInput = {
    id: string
    tenantId: string
    agentType: string
    status: string
    inputHash: string
    tokensIn: number
    tokensOut: number
    costUsd: Decimal | DecimalJsLike | number | string
    latencyMs: number
    modelName: string
    iterations?: number
    triggeredBy?: string | null
    errorMessage?: string | null
    startedAt: Date | string
    completedAt: Date | string
    createdAt?: Date | string
  }

  export type AgentRunUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    agentType?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    inputHash?: StringFieldUpdateOperationsInput | string
    tokensIn?: IntFieldUpdateOperationsInput | number
    tokensOut?: IntFieldUpdateOperationsInput | number
    costUsd?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    latencyMs?: IntFieldUpdateOperationsInput | number
    modelName?: StringFieldUpdateOperationsInput | string
    iterations?: IntFieldUpdateOperationsInput | number
    triggeredBy?: NullableStringFieldUpdateOperationsInput | string | null
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AgentRunUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    agentType?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    inputHash?: StringFieldUpdateOperationsInput | string
    tokensIn?: IntFieldUpdateOperationsInput | number
    tokensOut?: IntFieldUpdateOperationsInput | number
    costUsd?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    latencyMs?: IntFieldUpdateOperationsInput | number
    modelName?: StringFieldUpdateOperationsInput | string
    iterations?: IntFieldUpdateOperationsInput | number
    triggeredBy?: NullableStringFieldUpdateOperationsInput | string | null
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AgentRunCreateManyInput = {
    id: string
    tenantId: string
    agentType: string
    status: string
    inputHash: string
    tokensIn: number
    tokensOut: number
    costUsd: Decimal | DecimalJsLike | number | string
    latencyMs: number
    modelName: string
    iterations?: number
    triggeredBy?: string | null
    errorMessage?: string | null
    startedAt: Date | string
    completedAt: Date | string
    createdAt?: Date | string
  }

  export type AgentRunUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    agentType?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    inputHash?: StringFieldUpdateOperationsInput | string
    tokensIn?: IntFieldUpdateOperationsInput | number
    tokensOut?: IntFieldUpdateOperationsInput | number
    costUsd?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    latencyMs?: IntFieldUpdateOperationsInput | number
    modelName?: StringFieldUpdateOperationsInput | string
    iterations?: IntFieldUpdateOperationsInput | number
    triggeredBy?: NullableStringFieldUpdateOperationsInput | string | null
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AgentRunUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    agentType?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    inputHash?: StringFieldUpdateOperationsInput | string
    tokensIn?: IntFieldUpdateOperationsInput | number
    tokensOut?: IntFieldUpdateOperationsInput | number
    costUsd?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    latencyMs?: IntFieldUpdateOperationsInput | number
    modelName?: StringFieldUpdateOperationsInput | string
    iterations?: IntFieldUpdateOperationsInput | number
    triggeredBy?: NullableStringFieldUpdateOperationsInput | string | null
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }
  export type JsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type EnumRequisitionStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.RequisitionStatus | EnumRequisitionStatusFieldRefInput<$PrismaModel>
    in?: $Enums.RequisitionStatus[] | ListEnumRequisitionStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.RequisitionStatus[] | ListEnumRequisitionStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumRequisitionStatusFilter<$PrismaModel> | $Enums.RequisitionStatus
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type JobPostingListRelationFilter = {
    every?: JobPostingWhereInput
    some?: JobPostingWhereInput
    none?: JobPostingWhereInput
  }

  export type ApplicationFormSchemaNullableScalarRelationFilter = {
    is?: ApplicationFormSchemaWhereInput | null
    isNot?: ApplicationFormSchemaWhereInput | null
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type JobPostingOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type RequisitionCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    title?: SortOrder
    department?: SortOrder
    location?: SortOrder
    country?: SortOrder
    jobFamily?: SortOrder
    description?: SortOrder
    requirements?: SortOrder
    salaryMin?: SortOrder
    salaryMax?: SortOrder
    salaryCurrency?: SortOrder
    status?: SortOrder
    priority?: SortOrder
    hiringManagerId?: SortOrder
    recruiterId?: SortOrder
    headcount?: SortOrder
    targetStartDate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    closedAt?: SortOrder
  }

  export type RequisitionAvgOrderByAggregateInput = {
    salaryMin?: SortOrder
    salaryMax?: SortOrder
    priority?: SortOrder
    headcount?: SortOrder
  }

  export type RequisitionMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    title?: SortOrder
    department?: SortOrder
    location?: SortOrder
    country?: SortOrder
    jobFamily?: SortOrder
    description?: SortOrder
    salaryMin?: SortOrder
    salaryMax?: SortOrder
    salaryCurrency?: SortOrder
    status?: SortOrder
    priority?: SortOrder
    hiringManagerId?: SortOrder
    recruiterId?: SortOrder
    headcount?: SortOrder
    targetStartDate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    closedAt?: SortOrder
  }

  export type RequisitionMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    title?: SortOrder
    department?: SortOrder
    location?: SortOrder
    country?: SortOrder
    jobFamily?: SortOrder
    description?: SortOrder
    salaryMin?: SortOrder
    salaryMax?: SortOrder
    salaryCurrency?: SortOrder
    status?: SortOrder
    priority?: SortOrder
    hiringManagerId?: SortOrder
    recruiterId?: SortOrder
    headcount?: SortOrder
    targetStartDate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    closedAt?: SortOrder
  }

  export type RequisitionSumOrderByAggregateInput = {
    salaryMin?: SortOrder
    salaryMax?: SortOrder
    priority?: SortOrder
    headcount?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type EnumRequisitionStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RequisitionStatus | EnumRequisitionStatusFieldRefInput<$PrismaModel>
    in?: $Enums.RequisitionStatus[] | ListEnumRequisitionStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.RequisitionStatus[] | ListEnumRequisitionStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumRequisitionStatusWithAggregatesFilter<$PrismaModel> | $Enums.RequisitionStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRequisitionStatusFilter<$PrismaModel>
    _max?: NestedEnumRequisitionStatusFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    has?: string | StringFieldRefInput<$PrismaModel> | null
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type RequisitionScalarRelationFilter = {
    is?: RequisitionWhereInput
    isNot?: RequisitionWhereInput
  }

  export type JobPostingTenantIdSlugCompoundUniqueInput = {
    tenantId: string
    slug: string
  }

  export type JobPostingCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    requisitionId?: SortOrder
    slug?: SortOrder
    title?: SortOrder
    description?: SortOrder
    requirements?: SortOrder
    isPublished?: SortOrder
    publishedAt?: SortOrder
    expiresAt?: SortOrder
    views?: SortOrder
    applicationCount?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type JobPostingAvgOrderByAggregateInput = {
    views?: SortOrder
    applicationCount?: SortOrder
  }

  export type JobPostingMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    requisitionId?: SortOrder
    slug?: SortOrder
    title?: SortOrder
    description?: SortOrder
    isPublished?: SortOrder
    publishedAt?: SortOrder
    expiresAt?: SortOrder
    views?: SortOrder
    applicationCount?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type JobPostingMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    requisitionId?: SortOrder
    slug?: SortOrder
    title?: SortOrder
    description?: SortOrder
    isPublished?: SortOrder
    publishedAt?: SortOrder
    expiresAt?: SortOrder
    views?: SortOrder
    applicationCount?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type JobPostingSumOrderByAggregateInput = {
    views?: SortOrder
    applicationCount?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type ApplicationFormSchemaCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    requisitionId?: SortOrder
    name?: SortOrder
    fields?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ApplicationFormSchemaMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    requisitionId?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ApplicationFormSchemaMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    requisitionId?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SkillNullableScalarRelationFilter = {
    is?: SkillWhereInput | null
    isNot?: SkillWhereInput | null
  }

  export type SkillListRelationFilter = {
    every?: SkillWhereInput
    some?: SkillWhereInput
    none?: SkillWhereInput
  }

  export type SkillOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type SkillTenantIdNameCompoundUniqueInput = {
    tenantId: string
    name: string
  }

  export type SkillCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    name?: SortOrder
    category?: SortOrder
    parentId?: SortOrder
    aliases?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SkillMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    name?: SortOrder
    category?: SortOrder
    parentId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SkillMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    name?: SortOrder
    category?: SortOrder
    parentId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumOutboxStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.OutboxStatus | EnumOutboxStatusFieldRefInput<$PrismaModel>
    in?: $Enums.OutboxStatus[] | ListEnumOutboxStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.OutboxStatus[] | ListEnumOutboxStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumOutboxStatusFilter<$PrismaModel> | $Enums.OutboxStatus
  }

  export type OutboxCountOrderByAggregateInput = {
    id?: SortOrder
    subject?: SortOrder
    type?: SortOrder
    tenantId?: SortOrder
    payload?: SortOrder
    status?: SortOrder
    attemptCount?: SortOrder
    lastError?: SortOrder
    sentAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OutboxAvgOrderByAggregateInput = {
    attemptCount?: SortOrder
  }

  export type OutboxMaxOrderByAggregateInput = {
    id?: SortOrder
    subject?: SortOrder
    type?: SortOrder
    tenantId?: SortOrder
    status?: SortOrder
    attemptCount?: SortOrder
    lastError?: SortOrder
    sentAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OutboxMinOrderByAggregateInput = {
    id?: SortOrder
    subject?: SortOrder
    type?: SortOrder
    tenantId?: SortOrder
    status?: SortOrder
    attemptCount?: SortOrder
    lastError?: SortOrder
    sentAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OutboxSumOrderByAggregateInput = {
    attemptCount?: SortOrder
  }

  export type EnumOutboxStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.OutboxStatus | EnumOutboxStatusFieldRefInput<$PrismaModel>
    in?: $Enums.OutboxStatus[] | ListEnumOutboxStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.OutboxStatus[] | ListEnumOutboxStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumOutboxStatusWithAggregatesFilter<$PrismaModel> | $Enums.OutboxStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumOutboxStatusFilter<$PrismaModel>
    _max?: NestedEnumOutboxStatusFilter<$PrismaModel>
  }

  export type DecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type AgentRunCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    agentType?: SortOrder
    status?: SortOrder
    inputHash?: SortOrder
    tokensIn?: SortOrder
    tokensOut?: SortOrder
    costUsd?: SortOrder
    latencyMs?: SortOrder
    modelName?: SortOrder
    iterations?: SortOrder
    triggeredBy?: SortOrder
    errorMessage?: SortOrder
    startedAt?: SortOrder
    completedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type AgentRunAvgOrderByAggregateInput = {
    tokensIn?: SortOrder
    tokensOut?: SortOrder
    costUsd?: SortOrder
    latencyMs?: SortOrder
    iterations?: SortOrder
  }

  export type AgentRunMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    agentType?: SortOrder
    status?: SortOrder
    inputHash?: SortOrder
    tokensIn?: SortOrder
    tokensOut?: SortOrder
    costUsd?: SortOrder
    latencyMs?: SortOrder
    modelName?: SortOrder
    iterations?: SortOrder
    triggeredBy?: SortOrder
    errorMessage?: SortOrder
    startedAt?: SortOrder
    completedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type AgentRunMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    agentType?: SortOrder
    status?: SortOrder
    inputHash?: SortOrder
    tokensIn?: SortOrder
    tokensOut?: SortOrder
    costUsd?: SortOrder
    latencyMs?: SortOrder
    modelName?: SortOrder
    iterations?: SortOrder
    triggeredBy?: SortOrder
    errorMessage?: SortOrder
    startedAt?: SortOrder
    completedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type AgentRunSumOrderByAggregateInput = {
    tokensIn?: SortOrder
    tokensOut?: SortOrder
    costUsd?: SortOrder
    latencyMs?: SortOrder
    iterations?: SortOrder
  }

  export type DecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type JobPostingCreateNestedManyWithoutRequisitionInput = {
    create?: XOR<JobPostingCreateWithoutRequisitionInput, JobPostingUncheckedCreateWithoutRequisitionInput> | JobPostingCreateWithoutRequisitionInput[] | JobPostingUncheckedCreateWithoutRequisitionInput[]
    connectOrCreate?: JobPostingCreateOrConnectWithoutRequisitionInput | JobPostingCreateOrConnectWithoutRequisitionInput[]
    createMany?: JobPostingCreateManyRequisitionInputEnvelope
    connect?: JobPostingWhereUniqueInput | JobPostingWhereUniqueInput[]
  }

  export type ApplicationFormSchemaCreateNestedOneWithoutRequisitionInput = {
    create?: XOR<ApplicationFormSchemaCreateWithoutRequisitionInput, ApplicationFormSchemaUncheckedCreateWithoutRequisitionInput>
    connectOrCreate?: ApplicationFormSchemaCreateOrConnectWithoutRequisitionInput
    connect?: ApplicationFormSchemaWhereUniqueInput
  }

  export type JobPostingUncheckedCreateNestedManyWithoutRequisitionInput = {
    create?: XOR<JobPostingCreateWithoutRequisitionInput, JobPostingUncheckedCreateWithoutRequisitionInput> | JobPostingCreateWithoutRequisitionInput[] | JobPostingUncheckedCreateWithoutRequisitionInput[]
    connectOrCreate?: JobPostingCreateOrConnectWithoutRequisitionInput | JobPostingCreateOrConnectWithoutRequisitionInput[]
    createMany?: JobPostingCreateManyRequisitionInputEnvelope
    connect?: JobPostingWhereUniqueInput | JobPostingWhereUniqueInput[]
  }

  export type ApplicationFormSchemaUncheckedCreateNestedOneWithoutRequisitionInput = {
    create?: XOR<ApplicationFormSchemaCreateWithoutRequisitionInput, ApplicationFormSchemaUncheckedCreateWithoutRequisitionInput>
    connectOrCreate?: ApplicationFormSchemaCreateOrConnectWithoutRequisitionInput
    connect?: ApplicationFormSchemaWhereUniqueInput
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type EnumRequisitionStatusFieldUpdateOperationsInput = {
    set?: $Enums.RequisitionStatus
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type JobPostingUpdateManyWithoutRequisitionNestedInput = {
    create?: XOR<JobPostingCreateWithoutRequisitionInput, JobPostingUncheckedCreateWithoutRequisitionInput> | JobPostingCreateWithoutRequisitionInput[] | JobPostingUncheckedCreateWithoutRequisitionInput[]
    connectOrCreate?: JobPostingCreateOrConnectWithoutRequisitionInput | JobPostingCreateOrConnectWithoutRequisitionInput[]
    upsert?: JobPostingUpsertWithWhereUniqueWithoutRequisitionInput | JobPostingUpsertWithWhereUniqueWithoutRequisitionInput[]
    createMany?: JobPostingCreateManyRequisitionInputEnvelope
    set?: JobPostingWhereUniqueInput | JobPostingWhereUniqueInput[]
    disconnect?: JobPostingWhereUniqueInput | JobPostingWhereUniqueInput[]
    delete?: JobPostingWhereUniqueInput | JobPostingWhereUniqueInput[]
    connect?: JobPostingWhereUniqueInput | JobPostingWhereUniqueInput[]
    update?: JobPostingUpdateWithWhereUniqueWithoutRequisitionInput | JobPostingUpdateWithWhereUniqueWithoutRequisitionInput[]
    updateMany?: JobPostingUpdateManyWithWhereWithoutRequisitionInput | JobPostingUpdateManyWithWhereWithoutRequisitionInput[]
    deleteMany?: JobPostingScalarWhereInput | JobPostingScalarWhereInput[]
  }

  export type ApplicationFormSchemaUpdateOneWithoutRequisitionNestedInput = {
    create?: XOR<ApplicationFormSchemaCreateWithoutRequisitionInput, ApplicationFormSchemaUncheckedCreateWithoutRequisitionInput>
    connectOrCreate?: ApplicationFormSchemaCreateOrConnectWithoutRequisitionInput
    upsert?: ApplicationFormSchemaUpsertWithoutRequisitionInput
    disconnect?: ApplicationFormSchemaWhereInput | boolean
    delete?: ApplicationFormSchemaWhereInput | boolean
    connect?: ApplicationFormSchemaWhereUniqueInput
    update?: XOR<XOR<ApplicationFormSchemaUpdateToOneWithWhereWithoutRequisitionInput, ApplicationFormSchemaUpdateWithoutRequisitionInput>, ApplicationFormSchemaUncheckedUpdateWithoutRequisitionInput>
  }

  export type JobPostingUncheckedUpdateManyWithoutRequisitionNestedInput = {
    create?: XOR<JobPostingCreateWithoutRequisitionInput, JobPostingUncheckedCreateWithoutRequisitionInput> | JobPostingCreateWithoutRequisitionInput[] | JobPostingUncheckedCreateWithoutRequisitionInput[]
    connectOrCreate?: JobPostingCreateOrConnectWithoutRequisitionInput | JobPostingCreateOrConnectWithoutRequisitionInput[]
    upsert?: JobPostingUpsertWithWhereUniqueWithoutRequisitionInput | JobPostingUpsertWithWhereUniqueWithoutRequisitionInput[]
    createMany?: JobPostingCreateManyRequisitionInputEnvelope
    set?: JobPostingWhereUniqueInput | JobPostingWhereUniqueInput[]
    disconnect?: JobPostingWhereUniqueInput | JobPostingWhereUniqueInput[]
    delete?: JobPostingWhereUniqueInput | JobPostingWhereUniqueInput[]
    connect?: JobPostingWhereUniqueInput | JobPostingWhereUniqueInput[]
    update?: JobPostingUpdateWithWhereUniqueWithoutRequisitionInput | JobPostingUpdateWithWhereUniqueWithoutRequisitionInput[]
    updateMany?: JobPostingUpdateManyWithWhereWithoutRequisitionInput | JobPostingUpdateManyWithWhereWithoutRequisitionInput[]
    deleteMany?: JobPostingScalarWhereInput | JobPostingScalarWhereInput[]
  }

  export type ApplicationFormSchemaUncheckedUpdateOneWithoutRequisitionNestedInput = {
    create?: XOR<ApplicationFormSchemaCreateWithoutRequisitionInput, ApplicationFormSchemaUncheckedCreateWithoutRequisitionInput>
    connectOrCreate?: ApplicationFormSchemaCreateOrConnectWithoutRequisitionInput
    upsert?: ApplicationFormSchemaUpsertWithoutRequisitionInput
    disconnect?: ApplicationFormSchemaWhereInput | boolean
    delete?: ApplicationFormSchemaWhereInput | boolean
    connect?: ApplicationFormSchemaWhereUniqueInput
    update?: XOR<XOR<ApplicationFormSchemaUpdateToOneWithWhereWithoutRequisitionInput, ApplicationFormSchemaUpdateWithoutRequisitionInput>, ApplicationFormSchemaUncheckedUpdateWithoutRequisitionInput>
  }

  export type JobPostingCreaterequirementsInput = {
    set: string[]
  }

  export type RequisitionCreateNestedOneWithoutJobPostingsInput = {
    create?: XOR<RequisitionCreateWithoutJobPostingsInput, RequisitionUncheckedCreateWithoutJobPostingsInput>
    connectOrCreate?: RequisitionCreateOrConnectWithoutJobPostingsInput
    connect?: RequisitionWhereUniqueInput
  }

  export type JobPostingUpdaterequirementsInput = {
    set?: string[]
    push?: string | string[]
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type RequisitionUpdateOneRequiredWithoutJobPostingsNestedInput = {
    create?: XOR<RequisitionCreateWithoutJobPostingsInput, RequisitionUncheckedCreateWithoutJobPostingsInput>
    connectOrCreate?: RequisitionCreateOrConnectWithoutJobPostingsInput
    upsert?: RequisitionUpsertWithoutJobPostingsInput
    connect?: RequisitionWhereUniqueInput
    update?: XOR<XOR<RequisitionUpdateToOneWithWhereWithoutJobPostingsInput, RequisitionUpdateWithoutJobPostingsInput>, RequisitionUncheckedUpdateWithoutJobPostingsInput>
  }

  export type RequisitionCreateNestedOneWithoutFormSchemaInput = {
    create?: XOR<RequisitionCreateWithoutFormSchemaInput, RequisitionUncheckedCreateWithoutFormSchemaInput>
    connectOrCreate?: RequisitionCreateOrConnectWithoutFormSchemaInput
    connect?: RequisitionWhereUniqueInput
  }

  export type RequisitionUpdateOneRequiredWithoutFormSchemaNestedInput = {
    create?: XOR<RequisitionCreateWithoutFormSchemaInput, RequisitionUncheckedCreateWithoutFormSchemaInput>
    connectOrCreate?: RequisitionCreateOrConnectWithoutFormSchemaInput
    upsert?: RequisitionUpsertWithoutFormSchemaInput
    connect?: RequisitionWhereUniqueInput
    update?: XOR<XOR<RequisitionUpdateToOneWithWhereWithoutFormSchemaInput, RequisitionUpdateWithoutFormSchemaInput>, RequisitionUncheckedUpdateWithoutFormSchemaInput>
  }

  export type SkillCreatealiasesInput = {
    set: string[]
  }

  export type SkillCreateNestedOneWithoutChildrenInput = {
    create?: XOR<SkillCreateWithoutChildrenInput, SkillUncheckedCreateWithoutChildrenInput>
    connectOrCreate?: SkillCreateOrConnectWithoutChildrenInput
    connect?: SkillWhereUniqueInput
  }

  export type SkillCreateNestedManyWithoutParentInput = {
    create?: XOR<SkillCreateWithoutParentInput, SkillUncheckedCreateWithoutParentInput> | SkillCreateWithoutParentInput[] | SkillUncheckedCreateWithoutParentInput[]
    connectOrCreate?: SkillCreateOrConnectWithoutParentInput | SkillCreateOrConnectWithoutParentInput[]
    createMany?: SkillCreateManyParentInputEnvelope
    connect?: SkillWhereUniqueInput | SkillWhereUniqueInput[]
  }

  export type SkillUncheckedCreateNestedManyWithoutParentInput = {
    create?: XOR<SkillCreateWithoutParentInput, SkillUncheckedCreateWithoutParentInput> | SkillCreateWithoutParentInput[] | SkillUncheckedCreateWithoutParentInput[]
    connectOrCreate?: SkillCreateOrConnectWithoutParentInput | SkillCreateOrConnectWithoutParentInput[]
    createMany?: SkillCreateManyParentInputEnvelope
    connect?: SkillWhereUniqueInput | SkillWhereUniqueInput[]
  }

  export type SkillUpdatealiasesInput = {
    set?: string[]
    push?: string | string[]
  }

  export type SkillUpdateOneWithoutChildrenNestedInput = {
    create?: XOR<SkillCreateWithoutChildrenInput, SkillUncheckedCreateWithoutChildrenInput>
    connectOrCreate?: SkillCreateOrConnectWithoutChildrenInput
    upsert?: SkillUpsertWithoutChildrenInput
    disconnect?: SkillWhereInput | boolean
    delete?: SkillWhereInput | boolean
    connect?: SkillWhereUniqueInput
    update?: XOR<XOR<SkillUpdateToOneWithWhereWithoutChildrenInput, SkillUpdateWithoutChildrenInput>, SkillUncheckedUpdateWithoutChildrenInput>
  }

  export type SkillUpdateManyWithoutParentNestedInput = {
    create?: XOR<SkillCreateWithoutParentInput, SkillUncheckedCreateWithoutParentInput> | SkillCreateWithoutParentInput[] | SkillUncheckedCreateWithoutParentInput[]
    connectOrCreate?: SkillCreateOrConnectWithoutParentInput | SkillCreateOrConnectWithoutParentInput[]
    upsert?: SkillUpsertWithWhereUniqueWithoutParentInput | SkillUpsertWithWhereUniqueWithoutParentInput[]
    createMany?: SkillCreateManyParentInputEnvelope
    set?: SkillWhereUniqueInput | SkillWhereUniqueInput[]
    disconnect?: SkillWhereUniqueInput | SkillWhereUniqueInput[]
    delete?: SkillWhereUniqueInput | SkillWhereUniqueInput[]
    connect?: SkillWhereUniqueInput | SkillWhereUniqueInput[]
    update?: SkillUpdateWithWhereUniqueWithoutParentInput | SkillUpdateWithWhereUniqueWithoutParentInput[]
    updateMany?: SkillUpdateManyWithWhereWithoutParentInput | SkillUpdateManyWithWhereWithoutParentInput[]
    deleteMany?: SkillScalarWhereInput | SkillScalarWhereInput[]
  }

  export type SkillUncheckedUpdateManyWithoutParentNestedInput = {
    create?: XOR<SkillCreateWithoutParentInput, SkillUncheckedCreateWithoutParentInput> | SkillCreateWithoutParentInput[] | SkillUncheckedCreateWithoutParentInput[]
    connectOrCreate?: SkillCreateOrConnectWithoutParentInput | SkillCreateOrConnectWithoutParentInput[]
    upsert?: SkillUpsertWithWhereUniqueWithoutParentInput | SkillUpsertWithWhereUniqueWithoutParentInput[]
    createMany?: SkillCreateManyParentInputEnvelope
    set?: SkillWhereUniqueInput | SkillWhereUniqueInput[]
    disconnect?: SkillWhereUniqueInput | SkillWhereUniqueInput[]
    delete?: SkillWhereUniqueInput | SkillWhereUniqueInput[]
    connect?: SkillWhereUniqueInput | SkillWhereUniqueInput[]
    update?: SkillUpdateWithWhereUniqueWithoutParentInput | SkillUpdateWithWhereUniqueWithoutParentInput[]
    updateMany?: SkillUpdateManyWithWhereWithoutParentInput | SkillUpdateManyWithWhereWithoutParentInput[]
    deleteMany?: SkillScalarWhereInput | SkillScalarWhereInput[]
  }

  export type EnumOutboxStatusFieldUpdateOperationsInput = {
    set?: $Enums.OutboxStatus
  }

  export type DecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedEnumRequisitionStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.RequisitionStatus | EnumRequisitionStatusFieldRefInput<$PrismaModel>
    in?: $Enums.RequisitionStatus[] | ListEnumRequisitionStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.RequisitionStatus[] | ListEnumRequisitionStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumRequisitionStatusFilter<$PrismaModel> | $Enums.RequisitionStatus
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }
  export type NestedJsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type NestedEnumRequisitionStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RequisitionStatus | EnumRequisitionStatusFieldRefInput<$PrismaModel>
    in?: $Enums.RequisitionStatus[] | ListEnumRequisitionStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.RequisitionStatus[] | ListEnumRequisitionStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumRequisitionStatusWithAggregatesFilter<$PrismaModel> | $Enums.RequisitionStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRequisitionStatusFilter<$PrismaModel>
    _max?: NestedEnumRequisitionStatusFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedEnumOutboxStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.OutboxStatus | EnumOutboxStatusFieldRefInput<$PrismaModel>
    in?: $Enums.OutboxStatus[] | ListEnumOutboxStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.OutboxStatus[] | ListEnumOutboxStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumOutboxStatusFilter<$PrismaModel> | $Enums.OutboxStatus
  }

  export type NestedEnumOutboxStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.OutboxStatus | EnumOutboxStatusFieldRefInput<$PrismaModel>
    in?: $Enums.OutboxStatus[] | ListEnumOutboxStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.OutboxStatus[] | ListEnumOutboxStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumOutboxStatusWithAggregatesFilter<$PrismaModel> | $Enums.OutboxStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumOutboxStatusFilter<$PrismaModel>
    _max?: NestedEnumOutboxStatusFilter<$PrismaModel>
  }

  export type NestedDecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type NestedDecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type JobPostingCreateWithoutRequisitionInput = {
    id?: string
    tenantId: string
    slug: string
    title: string
    description: string
    requirements?: JobPostingCreaterequirementsInput | string[]
    isPublished?: boolean
    publishedAt?: Date | string | null
    expiresAt?: Date | string | null
    views?: number
    applicationCount?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type JobPostingUncheckedCreateWithoutRequisitionInput = {
    id?: string
    tenantId: string
    slug: string
    title: string
    description: string
    requirements?: JobPostingCreaterequirementsInput | string[]
    isPublished?: boolean
    publishedAt?: Date | string | null
    expiresAt?: Date | string | null
    views?: number
    applicationCount?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type JobPostingCreateOrConnectWithoutRequisitionInput = {
    where: JobPostingWhereUniqueInput
    create: XOR<JobPostingCreateWithoutRequisitionInput, JobPostingUncheckedCreateWithoutRequisitionInput>
  }

  export type JobPostingCreateManyRequisitionInputEnvelope = {
    data: JobPostingCreateManyRequisitionInput | JobPostingCreateManyRequisitionInput[]
    skipDuplicates?: boolean
  }

  export type ApplicationFormSchemaCreateWithoutRequisitionInput = {
    id?: string
    tenantId: string
    name?: string
    fields: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ApplicationFormSchemaUncheckedCreateWithoutRequisitionInput = {
    id?: string
    tenantId: string
    name?: string
    fields: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ApplicationFormSchemaCreateOrConnectWithoutRequisitionInput = {
    where: ApplicationFormSchemaWhereUniqueInput
    create: XOR<ApplicationFormSchemaCreateWithoutRequisitionInput, ApplicationFormSchemaUncheckedCreateWithoutRequisitionInput>
  }

  export type JobPostingUpsertWithWhereUniqueWithoutRequisitionInput = {
    where: JobPostingWhereUniqueInput
    update: XOR<JobPostingUpdateWithoutRequisitionInput, JobPostingUncheckedUpdateWithoutRequisitionInput>
    create: XOR<JobPostingCreateWithoutRequisitionInput, JobPostingUncheckedCreateWithoutRequisitionInput>
  }

  export type JobPostingUpdateWithWhereUniqueWithoutRequisitionInput = {
    where: JobPostingWhereUniqueInput
    data: XOR<JobPostingUpdateWithoutRequisitionInput, JobPostingUncheckedUpdateWithoutRequisitionInput>
  }

  export type JobPostingUpdateManyWithWhereWithoutRequisitionInput = {
    where: JobPostingScalarWhereInput
    data: XOR<JobPostingUpdateManyMutationInput, JobPostingUncheckedUpdateManyWithoutRequisitionInput>
  }

  export type JobPostingScalarWhereInput = {
    AND?: JobPostingScalarWhereInput | JobPostingScalarWhereInput[]
    OR?: JobPostingScalarWhereInput[]
    NOT?: JobPostingScalarWhereInput | JobPostingScalarWhereInput[]
    id?: StringFilter<"JobPosting"> | string
    tenantId?: StringFilter<"JobPosting"> | string
    requisitionId?: StringFilter<"JobPosting"> | string
    slug?: StringFilter<"JobPosting"> | string
    title?: StringFilter<"JobPosting"> | string
    description?: StringFilter<"JobPosting"> | string
    requirements?: StringNullableListFilter<"JobPosting">
    isPublished?: BoolFilter<"JobPosting"> | boolean
    publishedAt?: DateTimeNullableFilter<"JobPosting"> | Date | string | null
    expiresAt?: DateTimeNullableFilter<"JobPosting"> | Date | string | null
    views?: IntFilter<"JobPosting"> | number
    applicationCount?: IntFilter<"JobPosting"> | number
    createdAt?: DateTimeFilter<"JobPosting"> | Date | string
    updatedAt?: DateTimeFilter<"JobPosting"> | Date | string
  }

  export type ApplicationFormSchemaUpsertWithoutRequisitionInput = {
    update: XOR<ApplicationFormSchemaUpdateWithoutRequisitionInput, ApplicationFormSchemaUncheckedUpdateWithoutRequisitionInput>
    create: XOR<ApplicationFormSchemaCreateWithoutRequisitionInput, ApplicationFormSchemaUncheckedCreateWithoutRequisitionInput>
    where?: ApplicationFormSchemaWhereInput
  }

  export type ApplicationFormSchemaUpdateToOneWithWhereWithoutRequisitionInput = {
    where?: ApplicationFormSchemaWhereInput
    data: XOR<ApplicationFormSchemaUpdateWithoutRequisitionInput, ApplicationFormSchemaUncheckedUpdateWithoutRequisitionInput>
  }

  export type ApplicationFormSchemaUpdateWithoutRequisitionInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    fields?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ApplicationFormSchemaUncheckedUpdateWithoutRequisitionInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    fields?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RequisitionCreateWithoutJobPostingsInput = {
    id?: string
    tenantId: string
    title: string
    department: string
    location: string
    country?: string
    jobFamily?: string | null
    description?: string | null
    requirements?: JsonNullValueInput | InputJsonValue
    salaryMin?: number | null
    salaryMax?: number | null
    salaryCurrency?: string
    status?: $Enums.RequisitionStatus
    priority?: number
    hiringManagerId?: string | null
    recruiterId?: string | null
    headcount?: number
    targetStartDate?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    closedAt?: Date | string | null
    formSchema?: ApplicationFormSchemaCreateNestedOneWithoutRequisitionInput
  }

  export type RequisitionUncheckedCreateWithoutJobPostingsInput = {
    id?: string
    tenantId: string
    title: string
    department: string
    location: string
    country?: string
    jobFamily?: string | null
    description?: string | null
    requirements?: JsonNullValueInput | InputJsonValue
    salaryMin?: number | null
    salaryMax?: number | null
    salaryCurrency?: string
    status?: $Enums.RequisitionStatus
    priority?: number
    hiringManagerId?: string | null
    recruiterId?: string | null
    headcount?: number
    targetStartDate?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    closedAt?: Date | string | null
    formSchema?: ApplicationFormSchemaUncheckedCreateNestedOneWithoutRequisitionInput
  }

  export type RequisitionCreateOrConnectWithoutJobPostingsInput = {
    where: RequisitionWhereUniqueInput
    create: XOR<RequisitionCreateWithoutJobPostingsInput, RequisitionUncheckedCreateWithoutJobPostingsInput>
  }

  export type RequisitionUpsertWithoutJobPostingsInput = {
    update: XOR<RequisitionUpdateWithoutJobPostingsInput, RequisitionUncheckedUpdateWithoutJobPostingsInput>
    create: XOR<RequisitionCreateWithoutJobPostingsInput, RequisitionUncheckedCreateWithoutJobPostingsInput>
    where?: RequisitionWhereInput
  }

  export type RequisitionUpdateToOneWithWhereWithoutJobPostingsInput = {
    where?: RequisitionWhereInput
    data: XOR<RequisitionUpdateWithoutJobPostingsInput, RequisitionUncheckedUpdateWithoutJobPostingsInput>
  }

  export type RequisitionUpdateWithoutJobPostingsInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    department?: StringFieldUpdateOperationsInput | string
    location?: StringFieldUpdateOperationsInput | string
    country?: StringFieldUpdateOperationsInput | string
    jobFamily?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    requirements?: JsonNullValueInput | InputJsonValue
    salaryMin?: NullableFloatFieldUpdateOperationsInput | number | null
    salaryMax?: NullableFloatFieldUpdateOperationsInput | number | null
    salaryCurrency?: StringFieldUpdateOperationsInput | string
    status?: EnumRequisitionStatusFieldUpdateOperationsInput | $Enums.RequisitionStatus
    priority?: IntFieldUpdateOperationsInput | number
    hiringManagerId?: NullableStringFieldUpdateOperationsInput | string | null
    recruiterId?: NullableStringFieldUpdateOperationsInput | string | null
    headcount?: IntFieldUpdateOperationsInput | number
    targetStartDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    closedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    formSchema?: ApplicationFormSchemaUpdateOneWithoutRequisitionNestedInput
  }

  export type RequisitionUncheckedUpdateWithoutJobPostingsInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    department?: StringFieldUpdateOperationsInput | string
    location?: StringFieldUpdateOperationsInput | string
    country?: StringFieldUpdateOperationsInput | string
    jobFamily?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    requirements?: JsonNullValueInput | InputJsonValue
    salaryMin?: NullableFloatFieldUpdateOperationsInput | number | null
    salaryMax?: NullableFloatFieldUpdateOperationsInput | number | null
    salaryCurrency?: StringFieldUpdateOperationsInput | string
    status?: EnumRequisitionStatusFieldUpdateOperationsInput | $Enums.RequisitionStatus
    priority?: IntFieldUpdateOperationsInput | number
    hiringManagerId?: NullableStringFieldUpdateOperationsInput | string | null
    recruiterId?: NullableStringFieldUpdateOperationsInput | string | null
    headcount?: IntFieldUpdateOperationsInput | number
    targetStartDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    closedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    formSchema?: ApplicationFormSchemaUncheckedUpdateOneWithoutRequisitionNestedInput
  }

  export type RequisitionCreateWithoutFormSchemaInput = {
    id?: string
    tenantId: string
    title: string
    department: string
    location: string
    country?: string
    jobFamily?: string | null
    description?: string | null
    requirements?: JsonNullValueInput | InputJsonValue
    salaryMin?: number | null
    salaryMax?: number | null
    salaryCurrency?: string
    status?: $Enums.RequisitionStatus
    priority?: number
    hiringManagerId?: string | null
    recruiterId?: string | null
    headcount?: number
    targetStartDate?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    closedAt?: Date | string | null
    jobPostings?: JobPostingCreateNestedManyWithoutRequisitionInput
  }

  export type RequisitionUncheckedCreateWithoutFormSchemaInput = {
    id?: string
    tenantId: string
    title: string
    department: string
    location: string
    country?: string
    jobFamily?: string | null
    description?: string | null
    requirements?: JsonNullValueInput | InputJsonValue
    salaryMin?: number | null
    salaryMax?: number | null
    salaryCurrency?: string
    status?: $Enums.RequisitionStatus
    priority?: number
    hiringManagerId?: string | null
    recruiterId?: string | null
    headcount?: number
    targetStartDate?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    closedAt?: Date | string | null
    jobPostings?: JobPostingUncheckedCreateNestedManyWithoutRequisitionInput
  }

  export type RequisitionCreateOrConnectWithoutFormSchemaInput = {
    where: RequisitionWhereUniqueInput
    create: XOR<RequisitionCreateWithoutFormSchemaInput, RequisitionUncheckedCreateWithoutFormSchemaInput>
  }

  export type RequisitionUpsertWithoutFormSchemaInput = {
    update: XOR<RequisitionUpdateWithoutFormSchemaInput, RequisitionUncheckedUpdateWithoutFormSchemaInput>
    create: XOR<RequisitionCreateWithoutFormSchemaInput, RequisitionUncheckedCreateWithoutFormSchemaInput>
    where?: RequisitionWhereInput
  }

  export type RequisitionUpdateToOneWithWhereWithoutFormSchemaInput = {
    where?: RequisitionWhereInput
    data: XOR<RequisitionUpdateWithoutFormSchemaInput, RequisitionUncheckedUpdateWithoutFormSchemaInput>
  }

  export type RequisitionUpdateWithoutFormSchemaInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    department?: StringFieldUpdateOperationsInput | string
    location?: StringFieldUpdateOperationsInput | string
    country?: StringFieldUpdateOperationsInput | string
    jobFamily?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    requirements?: JsonNullValueInput | InputJsonValue
    salaryMin?: NullableFloatFieldUpdateOperationsInput | number | null
    salaryMax?: NullableFloatFieldUpdateOperationsInput | number | null
    salaryCurrency?: StringFieldUpdateOperationsInput | string
    status?: EnumRequisitionStatusFieldUpdateOperationsInput | $Enums.RequisitionStatus
    priority?: IntFieldUpdateOperationsInput | number
    hiringManagerId?: NullableStringFieldUpdateOperationsInput | string | null
    recruiterId?: NullableStringFieldUpdateOperationsInput | string | null
    headcount?: IntFieldUpdateOperationsInput | number
    targetStartDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    closedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    jobPostings?: JobPostingUpdateManyWithoutRequisitionNestedInput
  }

  export type RequisitionUncheckedUpdateWithoutFormSchemaInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    department?: StringFieldUpdateOperationsInput | string
    location?: StringFieldUpdateOperationsInput | string
    country?: StringFieldUpdateOperationsInput | string
    jobFamily?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    requirements?: JsonNullValueInput | InputJsonValue
    salaryMin?: NullableFloatFieldUpdateOperationsInput | number | null
    salaryMax?: NullableFloatFieldUpdateOperationsInput | number | null
    salaryCurrency?: StringFieldUpdateOperationsInput | string
    status?: EnumRequisitionStatusFieldUpdateOperationsInput | $Enums.RequisitionStatus
    priority?: IntFieldUpdateOperationsInput | number
    hiringManagerId?: NullableStringFieldUpdateOperationsInput | string | null
    recruiterId?: NullableStringFieldUpdateOperationsInput | string | null
    headcount?: IntFieldUpdateOperationsInput | number
    targetStartDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    closedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    jobPostings?: JobPostingUncheckedUpdateManyWithoutRequisitionNestedInput
  }

  export type SkillCreateWithoutChildrenInput = {
    id?: string
    tenantId?: string | null
    name: string
    category?: string | null
    aliases?: SkillCreatealiasesInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
    parent?: SkillCreateNestedOneWithoutChildrenInput
  }

  export type SkillUncheckedCreateWithoutChildrenInput = {
    id?: string
    tenantId?: string | null
    name: string
    category?: string | null
    parentId?: string | null
    aliases?: SkillCreatealiasesInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SkillCreateOrConnectWithoutChildrenInput = {
    where: SkillWhereUniqueInput
    create: XOR<SkillCreateWithoutChildrenInput, SkillUncheckedCreateWithoutChildrenInput>
  }

  export type SkillCreateWithoutParentInput = {
    id?: string
    tenantId?: string | null
    name: string
    category?: string | null
    aliases?: SkillCreatealiasesInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
    children?: SkillCreateNestedManyWithoutParentInput
  }

  export type SkillUncheckedCreateWithoutParentInput = {
    id?: string
    tenantId?: string | null
    name: string
    category?: string | null
    aliases?: SkillCreatealiasesInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
    children?: SkillUncheckedCreateNestedManyWithoutParentInput
  }

  export type SkillCreateOrConnectWithoutParentInput = {
    where: SkillWhereUniqueInput
    create: XOR<SkillCreateWithoutParentInput, SkillUncheckedCreateWithoutParentInput>
  }

  export type SkillCreateManyParentInputEnvelope = {
    data: SkillCreateManyParentInput | SkillCreateManyParentInput[]
    skipDuplicates?: boolean
  }

  export type SkillUpsertWithoutChildrenInput = {
    update: XOR<SkillUpdateWithoutChildrenInput, SkillUncheckedUpdateWithoutChildrenInput>
    create: XOR<SkillCreateWithoutChildrenInput, SkillUncheckedCreateWithoutChildrenInput>
    where?: SkillWhereInput
  }

  export type SkillUpdateToOneWithWhereWithoutChildrenInput = {
    where?: SkillWhereInput
    data: XOR<SkillUpdateWithoutChildrenInput, SkillUncheckedUpdateWithoutChildrenInput>
  }

  export type SkillUpdateWithoutChildrenInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    category?: NullableStringFieldUpdateOperationsInput | string | null
    aliases?: SkillUpdatealiasesInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    parent?: SkillUpdateOneWithoutChildrenNestedInput
  }

  export type SkillUncheckedUpdateWithoutChildrenInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    category?: NullableStringFieldUpdateOperationsInput | string | null
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    aliases?: SkillUpdatealiasesInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SkillUpsertWithWhereUniqueWithoutParentInput = {
    where: SkillWhereUniqueInput
    update: XOR<SkillUpdateWithoutParentInput, SkillUncheckedUpdateWithoutParentInput>
    create: XOR<SkillCreateWithoutParentInput, SkillUncheckedCreateWithoutParentInput>
  }

  export type SkillUpdateWithWhereUniqueWithoutParentInput = {
    where: SkillWhereUniqueInput
    data: XOR<SkillUpdateWithoutParentInput, SkillUncheckedUpdateWithoutParentInput>
  }

  export type SkillUpdateManyWithWhereWithoutParentInput = {
    where: SkillScalarWhereInput
    data: XOR<SkillUpdateManyMutationInput, SkillUncheckedUpdateManyWithoutParentInput>
  }

  export type SkillScalarWhereInput = {
    AND?: SkillScalarWhereInput | SkillScalarWhereInput[]
    OR?: SkillScalarWhereInput[]
    NOT?: SkillScalarWhereInput | SkillScalarWhereInput[]
    id?: StringFilter<"Skill"> | string
    tenantId?: StringNullableFilter<"Skill"> | string | null
    name?: StringFilter<"Skill"> | string
    category?: StringNullableFilter<"Skill"> | string | null
    parentId?: StringNullableFilter<"Skill"> | string | null
    aliases?: StringNullableListFilter<"Skill">
    createdAt?: DateTimeFilter<"Skill"> | Date | string
    updatedAt?: DateTimeFilter<"Skill"> | Date | string
  }

  export type JobPostingCreateManyRequisitionInput = {
    id?: string
    tenantId: string
    slug: string
    title: string
    description: string
    requirements?: JobPostingCreaterequirementsInput | string[]
    isPublished?: boolean
    publishedAt?: Date | string | null
    expiresAt?: Date | string | null
    views?: number
    applicationCount?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type JobPostingUpdateWithoutRequisitionInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    requirements?: JobPostingUpdaterequirementsInput | string[]
    isPublished?: BoolFieldUpdateOperationsInput | boolean
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    views?: IntFieldUpdateOperationsInput | number
    applicationCount?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type JobPostingUncheckedUpdateWithoutRequisitionInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    requirements?: JobPostingUpdaterequirementsInput | string[]
    isPublished?: BoolFieldUpdateOperationsInput | boolean
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    views?: IntFieldUpdateOperationsInput | number
    applicationCount?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type JobPostingUncheckedUpdateManyWithoutRequisitionInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    requirements?: JobPostingUpdaterequirementsInput | string[]
    isPublished?: BoolFieldUpdateOperationsInput | boolean
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    views?: IntFieldUpdateOperationsInput | number
    applicationCount?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SkillCreateManyParentInput = {
    id?: string
    tenantId?: string | null
    name: string
    category?: string | null
    aliases?: SkillCreatealiasesInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SkillUpdateWithoutParentInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    category?: NullableStringFieldUpdateOperationsInput | string | null
    aliases?: SkillUpdatealiasesInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    children?: SkillUpdateManyWithoutParentNestedInput
  }

  export type SkillUncheckedUpdateWithoutParentInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    category?: NullableStringFieldUpdateOperationsInput | string | null
    aliases?: SkillUpdatealiasesInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    children?: SkillUncheckedUpdateManyWithoutParentNestedInput
  }

  export type SkillUncheckedUpdateManyWithoutParentInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    category?: NullableStringFieldUpdateOperationsInput | string | null
    aliases?: SkillUpdatealiasesInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}