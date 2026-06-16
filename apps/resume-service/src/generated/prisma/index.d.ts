
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
 * Model Resume
 * 
 */
export type Resume = $Result.DefaultSelection<Prisma.$ResumePayload>
/**
 * Model BulkUpload
 * 
 */
export type BulkUpload = $Result.DefaultSelection<Prisma.$BulkUploadPayload>
/**
 * Model BulkImportItem
 * 
 */
export type BulkImportItem = $Result.DefaultSelection<Prisma.$BulkImportItemPayload>
/**
 * Model AgentRun
 * 
 */
export type AgentRun = $Result.DefaultSelection<Prisma.$AgentRunPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const BulkUploadStatus: {
  QUEUED: 'QUEUED',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  PARTIAL: 'PARTIAL'
};

export type BulkUploadStatus = (typeof BulkUploadStatus)[keyof typeof BulkUploadStatus]

}

export type BulkUploadStatus = $Enums.BulkUploadStatus

export const BulkUploadStatus: typeof $Enums.BulkUploadStatus

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Resumes
 * const resumes = await prisma.resume.findMany()
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
   * // Fetch zero or more Resumes
   * const resumes = await prisma.resume.findMany()
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
   * `prisma.resume`: Exposes CRUD operations for the **Resume** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Resumes
    * const resumes = await prisma.resume.findMany()
    * ```
    */
  get resume(): Prisma.ResumeDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.bulkUpload`: Exposes CRUD operations for the **BulkUpload** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more BulkUploads
    * const bulkUploads = await prisma.bulkUpload.findMany()
    * ```
    */
  get bulkUpload(): Prisma.BulkUploadDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.bulkImportItem`: Exposes CRUD operations for the **BulkImportItem** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more BulkImportItems
    * const bulkImportItems = await prisma.bulkImportItem.findMany()
    * ```
    */
  get bulkImportItem(): Prisma.BulkImportItemDelegate<ExtArgs, ClientOptions>;

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
    Resume: 'Resume',
    BulkUpload: 'BulkUpload',
    BulkImportItem: 'BulkImportItem',
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
      modelProps: "resume" | "bulkUpload" | "bulkImportItem" | "agentRun"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Resume: {
        payload: Prisma.$ResumePayload<ExtArgs>
        fields: Prisma.ResumeFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ResumeFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResumePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ResumeFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResumePayload>
          }
          findFirst: {
            args: Prisma.ResumeFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResumePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ResumeFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResumePayload>
          }
          findMany: {
            args: Prisma.ResumeFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResumePayload>[]
          }
          create: {
            args: Prisma.ResumeCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResumePayload>
          }
          createMany: {
            args: Prisma.ResumeCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ResumeCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResumePayload>[]
          }
          delete: {
            args: Prisma.ResumeDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResumePayload>
          }
          update: {
            args: Prisma.ResumeUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResumePayload>
          }
          deleteMany: {
            args: Prisma.ResumeDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ResumeUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ResumeUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResumePayload>[]
          }
          upsert: {
            args: Prisma.ResumeUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResumePayload>
          }
          aggregate: {
            args: Prisma.ResumeAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateResume>
          }
          groupBy: {
            args: Prisma.ResumeGroupByArgs<ExtArgs>
            result: $Utils.Optional<ResumeGroupByOutputType>[]
          }
          count: {
            args: Prisma.ResumeCountArgs<ExtArgs>
            result: $Utils.Optional<ResumeCountAggregateOutputType> | number
          }
        }
      }
      BulkUpload: {
        payload: Prisma.$BulkUploadPayload<ExtArgs>
        fields: Prisma.BulkUploadFieldRefs
        operations: {
          findUnique: {
            args: Prisma.BulkUploadFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BulkUploadPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.BulkUploadFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BulkUploadPayload>
          }
          findFirst: {
            args: Prisma.BulkUploadFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BulkUploadPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.BulkUploadFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BulkUploadPayload>
          }
          findMany: {
            args: Prisma.BulkUploadFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BulkUploadPayload>[]
          }
          create: {
            args: Prisma.BulkUploadCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BulkUploadPayload>
          }
          createMany: {
            args: Prisma.BulkUploadCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.BulkUploadCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BulkUploadPayload>[]
          }
          delete: {
            args: Prisma.BulkUploadDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BulkUploadPayload>
          }
          update: {
            args: Prisma.BulkUploadUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BulkUploadPayload>
          }
          deleteMany: {
            args: Prisma.BulkUploadDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.BulkUploadUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.BulkUploadUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BulkUploadPayload>[]
          }
          upsert: {
            args: Prisma.BulkUploadUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BulkUploadPayload>
          }
          aggregate: {
            args: Prisma.BulkUploadAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateBulkUpload>
          }
          groupBy: {
            args: Prisma.BulkUploadGroupByArgs<ExtArgs>
            result: $Utils.Optional<BulkUploadGroupByOutputType>[]
          }
          count: {
            args: Prisma.BulkUploadCountArgs<ExtArgs>
            result: $Utils.Optional<BulkUploadCountAggregateOutputType> | number
          }
        }
      }
      BulkImportItem: {
        payload: Prisma.$BulkImportItemPayload<ExtArgs>
        fields: Prisma.BulkImportItemFieldRefs
        operations: {
          findUnique: {
            args: Prisma.BulkImportItemFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BulkImportItemPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.BulkImportItemFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BulkImportItemPayload>
          }
          findFirst: {
            args: Prisma.BulkImportItemFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BulkImportItemPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.BulkImportItemFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BulkImportItemPayload>
          }
          findMany: {
            args: Prisma.BulkImportItemFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BulkImportItemPayload>[]
          }
          create: {
            args: Prisma.BulkImportItemCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BulkImportItemPayload>
          }
          createMany: {
            args: Prisma.BulkImportItemCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.BulkImportItemCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BulkImportItemPayload>[]
          }
          delete: {
            args: Prisma.BulkImportItemDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BulkImportItemPayload>
          }
          update: {
            args: Prisma.BulkImportItemUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BulkImportItemPayload>
          }
          deleteMany: {
            args: Prisma.BulkImportItemDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.BulkImportItemUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.BulkImportItemUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BulkImportItemPayload>[]
          }
          upsert: {
            args: Prisma.BulkImportItemUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BulkImportItemPayload>
          }
          aggregate: {
            args: Prisma.BulkImportItemAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateBulkImportItem>
          }
          groupBy: {
            args: Prisma.BulkImportItemGroupByArgs<ExtArgs>
            result: $Utils.Optional<BulkImportItemGroupByOutputType>[]
          }
          count: {
            args: Prisma.BulkImportItemCountArgs<ExtArgs>
            result: $Utils.Optional<BulkImportItemCountAggregateOutputType> | number
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
    resume?: ResumeOmit
    bulkUpload?: BulkUploadOmit
    bulkImportItem?: BulkImportItemOmit
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
   * Models
   */

  /**
   * Model Resume
   */

  export type AggregateResume = {
    _count: ResumeCountAggregateOutputType | null
    _avg: ResumeAvgAggregateOutputType | null
    _sum: ResumeSumAggregateOutputType | null
    _min: ResumeMinAggregateOutputType | null
    _max: ResumeMaxAggregateOutputType | null
  }

  export type ResumeAvgAggregateOutputType = {
    fileSize: number | null
  }

  export type ResumeSumAggregateOutputType = {
    fileSize: number | null
  }

  export type ResumeMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    candidateId: string | null
    fileName: string | null
    originalFilename: string | null
    fileSize: number | null
    mimeType: string | null
    storageKey: string | null
    extractedText: string | null
    parseStatus: string | null
    parsedAt: Date | null
    bulkUploadId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ResumeMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    candidateId: string | null
    fileName: string | null
    originalFilename: string | null
    fileSize: number | null
    mimeType: string | null
    storageKey: string | null
    extractedText: string | null
    parseStatus: string | null
    parsedAt: Date | null
    bulkUploadId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ResumeCountAggregateOutputType = {
    id: number
    tenantId: number
    candidateId: number
    fileName: number
    originalFilename: number
    fileSize: number
    mimeType: number
    storageKey: number
    extractedText: number
    parsedData: number
    parseStatus: number
    parsedAt: number
    bulkUploadId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ResumeAvgAggregateInputType = {
    fileSize?: true
  }

  export type ResumeSumAggregateInputType = {
    fileSize?: true
  }

  export type ResumeMinAggregateInputType = {
    id?: true
    tenantId?: true
    candidateId?: true
    fileName?: true
    originalFilename?: true
    fileSize?: true
    mimeType?: true
    storageKey?: true
    extractedText?: true
    parseStatus?: true
    parsedAt?: true
    bulkUploadId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ResumeMaxAggregateInputType = {
    id?: true
    tenantId?: true
    candidateId?: true
    fileName?: true
    originalFilename?: true
    fileSize?: true
    mimeType?: true
    storageKey?: true
    extractedText?: true
    parseStatus?: true
    parsedAt?: true
    bulkUploadId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ResumeCountAggregateInputType = {
    id?: true
    tenantId?: true
    candidateId?: true
    fileName?: true
    originalFilename?: true
    fileSize?: true
    mimeType?: true
    storageKey?: true
    extractedText?: true
    parsedData?: true
    parseStatus?: true
    parsedAt?: true
    bulkUploadId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ResumeAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Resume to aggregate.
     */
    where?: ResumeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Resumes to fetch.
     */
    orderBy?: ResumeOrderByWithRelationInput | ResumeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ResumeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Resumes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Resumes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Resumes
    **/
    _count?: true | ResumeCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ResumeAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ResumeSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ResumeMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ResumeMaxAggregateInputType
  }

  export type GetResumeAggregateType<T extends ResumeAggregateArgs> = {
        [P in keyof T & keyof AggregateResume]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateResume[P]>
      : GetScalarType<T[P], AggregateResume[P]>
  }




  export type ResumeGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ResumeWhereInput
    orderBy?: ResumeOrderByWithAggregationInput | ResumeOrderByWithAggregationInput[]
    by: ResumeScalarFieldEnum[] | ResumeScalarFieldEnum
    having?: ResumeScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ResumeCountAggregateInputType | true
    _avg?: ResumeAvgAggregateInputType
    _sum?: ResumeSumAggregateInputType
    _min?: ResumeMinAggregateInputType
    _max?: ResumeMaxAggregateInputType
  }

  export type ResumeGroupByOutputType = {
    id: string
    tenantId: string
    candidateId: string
    fileName: string
    originalFilename: string | null
    fileSize: number
    mimeType: string
    storageKey: string
    extractedText: string | null
    parsedData: JsonValue | null
    parseStatus: string
    parsedAt: Date | null
    bulkUploadId: string | null
    createdAt: Date
    updatedAt: Date
    _count: ResumeCountAggregateOutputType | null
    _avg: ResumeAvgAggregateOutputType | null
    _sum: ResumeSumAggregateOutputType | null
    _min: ResumeMinAggregateOutputType | null
    _max: ResumeMaxAggregateOutputType | null
  }

  type GetResumeGroupByPayload<T extends ResumeGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ResumeGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ResumeGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ResumeGroupByOutputType[P]>
            : GetScalarType<T[P], ResumeGroupByOutputType[P]>
        }
      >
    >


  export type ResumeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    candidateId?: boolean
    fileName?: boolean
    originalFilename?: boolean
    fileSize?: boolean
    mimeType?: boolean
    storageKey?: boolean
    extractedText?: boolean
    parsedData?: boolean
    parseStatus?: boolean
    parsedAt?: boolean
    bulkUploadId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["resume"]>

  export type ResumeSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    candidateId?: boolean
    fileName?: boolean
    originalFilename?: boolean
    fileSize?: boolean
    mimeType?: boolean
    storageKey?: boolean
    extractedText?: boolean
    parsedData?: boolean
    parseStatus?: boolean
    parsedAt?: boolean
    bulkUploadId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["resume"]>

  export type ResumeSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    candidateId?: boolean
    fileName?: boolean
    originalFilename?: boolean
    fileSize?: boolean
    mimeType?: boolean
    storageKey?: boolean
    extractedText?: boolean
    parsedData?: boolean
    parseStatus?: boolean
    parsedAt?: boolean
    bulkUploadId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["resume"]>

  export type ResumeSelectScalar = {
    id?: boolean
    tenantId?: boolean
    candidateId?: boolean
    fileName?: boolean
    originalFilename?: boolean
    fileSize?: boolean
    mimeType?: boolean
    storageKey?: boolean
    extractedText?: boolean
    parsedData?: boolean
    parseStatus?: boolean
    parsedAt?: boolean
    bulkUploadId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ResumeOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "candidateId" | "fileName" | "originalFilename" | "fileSize" | "mimeType" | "storageKey" | "extractedText" | "parsedData" | "parseStatus" | "parsedAt" | "bulkUploadId" | "createdAt" | "updatedAt", ExtArgs["result"]["resume"]>

  export type $ResumePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Resume"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      candidateId: string
      fileName: string
      originalFilename: string | null
      fileSize: number
      mimeType: string
      storageKey: string
      extractedText: string | null
      parsedData: Prisma.JsonValue | null
      parseStatus: string
      parsedAt: Date | null
      bulkUploadId: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["resume"]>
    composites: {}
  }

  type ResumeGetPayload<S extends boolean | null | undefined | ResumeDefaultArgs> = $Result.GetResult<Prisma.$ResumePayload, S>

  type ResumeCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ResumeFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ResumeCountAggregateInputType | true
    }

  export interface ResumeDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Resume'], meta: { name: 'Resume' } }
    /**
     * Find zero or one Resume that matches the filter.
     * @param {ResumeFindUniqueArgs} args - Arguments to find a Resume
     * @example
     * // Get one Resume
     * const resume = await prisma.resume.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ResumeFindUniqueArgs>(args: SelectSubset<T, ResumeFindUniqueArgs<ExtArgs>>): Prisma__ResumeClient<$Result.GetResult<Prisma.$ResumePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Resume that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ResumeFindUniqueOrThrowArgs} args - Arguments to find a Resume
     * @example
     * // Get one Resume
     * const resume = await prisma.resume.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ResumeFindUniqueOrThrowArgs>(args: SelectSubset<T, ResumeFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ResumeClient<$Result.GetResult<Prisma.$ResumePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Resume that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ResumeFindFirstArgs} args - Arguments to find a Resume
     * @example
     * // Get one Resume
     * const resume = await prisma.resume.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ResumeFindFirstArgs>(args?: SelectSubset<T, ResumeFindFirstArgs<ExtArgs>>): Prisma__ResumeClient<$Result.GetResult<Prisma.$ResumePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Resume that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ResumeFindFirstOrThrowArgs} args - Arguments to find a Resume
     * @example
     * // Get one Resume
     * const resume = await prisma.resume.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ResumeFindFirstOrThrowArgs>(args?: SelectSubset<T, ResumeFindFirstOrThrowArgs<ExtArgs>>): Prisma__ResumeClient<$Result.GetResult<Prisma.$ResumePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Resumes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ResumeFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Resumes
     * const resumes = await prisma.resume.findMany()
     * 
     * // Get first 10 Resumes
     * const resumes = await prisma.resume.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const resumeWithIdOnly = await prisma.resume.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ResumeFindManyArgs>(args?: SelectSubset<T, ResumeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ResumePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Resume.
     * @param {ResumeCreateArgs} args - Arguments to create a Resume.
     * @example
     * // Create one Resume
     * const Resume = await prisma.resume.create({
     *   data: {
     *     // ... data to create a Resume
     *   }
     * })
     * 
     */
    create<T extends ResumeCreateArgs>(args: SelectSubset<T, ResumeCreateArgs<ExtArgs>>): Prisma__ResumeClient<$Result.GetResult<Prisma.$ResumePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Resumes.
     * @param {ResumeCreateManyArgs} args - Arguments to create many Resumes.
     * @example
     * // Create many Resumes
     * const resume = await prisma.resume.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ResumeCreateManyArgs>(args?: SelectSubset<T, ResumeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Resumes and returns the data saved in the database.
     * @param {ResumeCreateManyAndReturnArgs} args - Arguments to create many Resumes.
     * @example
     * // Create many Resumes
     * const resume = await prisma.resume.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Resumes and only return the `id`
     * const resumeWithIdOnly = await prisma.resume.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ResumeCreateManyAndReturnArgs>(args?: SelectSubset<T, ResumeCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ResumePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Resume.
     * @param {ResumeDeleteArgs} args - Arguments to delete one Resume.
     * @example
     * // Delete one Resume
     * const Resume = await prisma.resume.delete({
     *   where: {
     *     // ... filter to delete one Resume
     *   }
     * })
     * 
     */
    delete<T extends ResumeDeleteArgs>(args: SelectSubset<T, ResumeDeleteArgs<ExtArgs>>): Prisma__ResumeClient<$Result.GetResult<Prisma.$ResumePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Resume.
     * @param {ResumeUpdateArgs} args - Arguments to update one Resume.
     * @example
     * // Update one Resume
     * const resume = await prisma.resume.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ResumeUpdateArgs>(args: SelectSubset<T, ResumeUpdateArgs<ExtArgs>>): Prisma__ResumeClient<$Result.GetResult<Prisma.$ResumePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Resumes.
     * @param {ResumeDeleteManyArgs} args - Arguments to filter Resumes to delete.
     * @example
     * // Delete a few Resumes
     * const { count } = await prisma.resume.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ResumeDeleteManyArgs>(args?: SelectSubset<T, ResumeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Resumes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ResumeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Resumes
     * const resume = await prisma.resume.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ResumeUpdateManyArgs>(args: SelectSubset<T, ResumeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Resumes and returns the data updated in the database.
     * @param {ResumeUpdateManyAndReturnArgs} args - Arguments to update many Resumes.
     * @example
     * // Update many Resumes
     * const resume = await prisma.resume.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Resumes and only return the `id`
     * const resumeWithIdOnly = await prisma.resume.updateManyAndReturn({
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
    updateManyAndReturn<T extends ResumeUpdateManyAndReturnArgs>(args: SelectSubset<T, ResumeUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ResumePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Resume.
     * @param {ResumeUpsertArgs} args - Arguments to update or create a Resume.
     * @example
     * // Update or create a Resume
     * const resume = await prisma.resume.upsert({
     *   create: {
     *     // ... data to create a Resume
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Resume we want to update
     *   }
     * })
     */
    upsert<T extends ResumeUpsertArgs>(args: SelectSubset<T, ResumeUpsertArgs<ExtArgs>>): Prisma__ResumeClient<$Result.GetResult<Prisma.$ResumePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Resumes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ResumeCountArgs} args - Arguments to filter Resumes to count.
     * @example
     * // Count the number of Resumes
     * const count = await prisma.resume.count({
     *   where: {
     *     // ... the filter for the Resumes we want to count
     *   }
     * })
    **/
    count<T extends ResumeCountArgs>(
      args?: Subset<T, ResumeCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ResumeCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Resume.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ResumeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ResumeAggregateArgs>(args: Subset<T, ResumeAggregateArgs>): Prisma.PrismaPromise<GetResumeAggregateType<T>>

    /**
     * Group by Resume.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ResumeGroupByArgs} args - Group by arguments.
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
      T extends ResumeGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ResumeGroupByArgs['orderBy'] }
        : { orderBy?: ResumeGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ResumeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetResumeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Resume model
   */
  readonly fields: ResumeFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Resume.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ResumeClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the Resume model
   */
  interface ResumeFieldRefs {
    readonly id: FieldRef<"Resume", 'String'>
    readonly tenantId: FieldRef<"Resume", 'String'>
    readonly candidateId: FieldRef<"Resume", 'String'>
    readonly fileName: FieldRef<"Resume", 'String'>
    readonly originalFilename: FieldRef<"Resume", 'String'>
    readonly fileSize: FieldRef<"Resume", 'Int'>
    readonly mimeType: FieldRef<"Resume", 'String'>
    readonly storageKey: FieldRef<"Resume", 'String'>
    readonly extractedText: FieldRef<"Resume", 'String'>
    readonly parsedData: FieldRef<"Resume", 'Json'>
    readonly parseStatus: FieldRef<"Resume", 'String'>
    readonly parsedAt: FieldRef<"Resume", 'DateTime'>
    readonly bulkUploadId: FieldRef<"Resume", 'String'>
    readonly createdAt: FieldRef<"Resume", 'DateTime'>
    readonly updatedAt: FieldRef<"Resume", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Resume findUnique
   */
  export type ResumeFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Resume
     */
    select?: ResumeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Resume
     */
    omit?: ResumeOmit<ExtArgs> | null
    /**
     * Filter, which Resume to fetch.
     */
    where: ResumeWhereUniqueInput
  }

  /**
   * Resume findUniqueOrThrow
   */
  export type ResumeFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Resume
     */
    select?: ResumeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Resume
     */
    omit?: ResumeOmit<ExtArgs> | null
    /**
     * Filter, which Resume to fetch.
     */
    where: ResumeWhereUniqueInput
  }

  /**
   * Resume findFirst
   */
  export type ResumeFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Resume
     */
    select?: ResumeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Resume
     */
    omit?: ResumeOmit<ExtArgs> | null
    /**
     * Filter, which Resume to fetch.
     */
    where?: ResumeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Resumes to fetch.
     */
    orderBy?: ResumeOrderByWithRelationInput | ResumeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Resumes.
     */
    cursor?: ResumeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Resumes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Resumes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Resumes.
     */
    distinct?: ResumeScalarFieldEnum | ResumeScalarFieldEnum[]
  }

  /**
   * Resume findFirstOrThrow
   */
  export type ResumeFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Resume
     */
    select?: ResumeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Resume
     */
    omit?: ResumeOmit<ExtArgs> | null
    /**
     * Filter, which Resume to fetch.
     */
    where?: ResumeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Resumes to fetch.
     */
    orderBy?: ResumeOrderByWithRelationInput | ResumeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Resumes.
     */
    cursor?: ResumeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Resumes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Resumes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Resumes.
     */
    distinct?: ResumeScalarFieldEnum | ResumeScalarFieldEnum[]
  }

  /**
   * Resume findMany
   */
  export type ResumeFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Resume
     */
    select?: ResumeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Resume
     */
    omit?: ResumeOmit<ExtArgs> | null
    /**
     * Filter, which Resumes to fetch.
     */
    where?: ResumeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Resumes to fetch.
     */
    orderBy?: ResumeOrderByWithRelationInput | ResumeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Resumes.
     */
    cursor?: ResumeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Resumes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Resumes.
     */
    skip?: number
    distinct?: ResumeScalarFieldEnum | ResumeScalarFieldEnum[]
  }

  /**
   * Resume create
   */
  export type ResumeCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Resume
     */
    select?: ResumeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Resume
     */
    omit?: ResumeOmit<ExtArgs> | null
    /**
     * The data needed to create a Resume.
     */
    data: XOR<ResumeCreateInput, ResumeUncheckedCreateInput>
  }

  /**
   * Resume createMany
   */
  export type ResumeCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Resumes.
     */
    data: ResumeCreateManyInput | ResumeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Resume createManyAndReturn
   */
  export type ResumeCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Resume
     */
    select?: ResumeSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Resume
     */
    omit?: ResumeOmit<ExtArgs> | null
    /**
     * The data used to create many Resumes.
     */
    data: ResumeCreateManyInput | ResumeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Resume update
   */
  export type ResumeUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Resume
     */
    select?: ResumeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Resume
     */
    omit?: ResumeOmit<ExtArgs> | null
    /**
     * The data needed to update a Resume.
     */
    data: XOR<ResumeUpdateInput, ResumeUncheckedUpdateInput>
    /**
     * Choose, which Resume to update.
     */
    where: ResumeWhereUniqueInput
  }

  /**
   * Resume updateMany
   */
  export type ResumeUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Resumes.
     */
    data: XOR<ResumeUpdateManyMutationInput, ResumeUncheckedUpdateManyInput>
    /**
     * Filter which Resumes to update
     */
    where?: ResumeWhereInput
    /**
     * Limit how many Resumes to update.
     */
    limit?: number
  }

  /**
   * Resume updateManyAndReturn
   */
  export type ResumeUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Resume
     */
    select?: ResumeSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Resume
     */
    omit?: ResumeOmit<ExtArgs> | null
    /**
     * The data used to update Resumes.
     */
    data: XOR<ResumeUpdateManyMutationInput, ResumeUncheckedUpdateManyInput>
    /**
     * Filter which Resumes to update
     */
    where?: ResumeWhereInput
    /**
     * Limit how many Resumes to update.
     */
    limit?: number
  }

  /**
   * Resume upsert
   */
  export type ResumeUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Resume
     */
    select?: ResumeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Resume
     */
    omit?: ResumeOmit<ExtArgs> | null
    /**
     * The filter to search for the Resume to update in case it exists.
     */
    where: ResumeWhereUniqueInput
    /**
     * In case the Resume found by the `where` argument doesn't exist, create a new Resume with this data.
     */
    create: XOR<ResumeCreateInput, ResumeUncheckedCreateInput>
    /**
     * In case the Resume was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ResumeUpdateInput, ResumeUncheckedUpdateInput>
  }

  /**
   * Resume delete
   */
  export type ResumeDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Resume
     */
    select?: ResumeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Resume
     */
    omit?: ResumeOmit<ExtArgs> | null
    /**
     * Filter which Resume to delete.
     */
    where: ResumeWhereUniqueInput
  }

  /**
   * Resume deleteMany
   */
  export type ResumeDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Resumes to delete
     */
    where?: ResumeWhereInput
    /**
     * Limit how many Resumes to delete.
     */
    limit?: number
  }

  /**
   * Resume without action
   */
  export type ResumeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Resume
     */
    select?: ResumeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Resume
     */
    omit?: ResumeOmit<ExtArgs> | null
  }


  /**
   * Model BulkUpload
   */

  export type AggregateBulkUpload = {
    _count: BulkUploadCountAggregateOutputType | null
    _avg: BulkUploadAvgAggregateOutputType | null
    _sum: BulkUploadSumAggregateOutputType | null
    _min: BulkUploadMinAggregateOutputType | null
    _max: BulkUploadMaxAggregateOutputType | null
  }

  export type BulkUploadAvgAggregateOutputType = {
    totalFiles: number | null
    processedFiles: number | null
    failedFiles: number | null
    extractedCount: number | null
    pendingCount: number | null
    approvedCount: number | null
    rejectedCount: number | null
    committedCount: number | null
  }

  export type BulkUploadSumAggregateOutputType = {
    totalFiles: number | null
    processedFiles: number | null
    failedFiles: number | null
    extractedCount: number | null
    pendingCount: number | null
    approvedCount: number | null
    rejectedCount: number | null
    committedCount: number | null
  }

  export type BulkUploadMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    userId: string | null
    requisitionId: string | null
    status: $Enums.BulkUploadStatus | null
    phase: string | null
    archiveName: string | null
    totalFiles: number | null
    processedFiles: number | null
    failedFiles: number | null
    extractedCount: number | null
    pendingCount: number | null
    approvedCount: number | null
    rejectedCount: number | null
    committedCount: number | null
    createdAt: Date | null
    completedAt: Date | null
  }

  export type BulkUploadMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    userId: string | null
    requisitionId: string | null
    status: $Enums.BulkUploadStatus | null
    phase: string | null
    archiveName: string | null
    totalFiles: number | null
    processedFiles: number | null
    failedFiles: number | null
    extractedCount: number | null
    pendingCount: number | null
    approvedCount: number | null
    rejectedCount: number | null
    committedCount: number | null
    createdAt: Date | null
    completedAt: Date | null
  }

  export type BulkUploadCountAggregateOutputType = {
    id: number
    tenantId: number
    userId: number
    requisitionId: number
    status: number
    phase: number
    archiveName: number
    totalFiles: number
    processedFiles: number
    failedFiles: number
    extractedCount: number
    pendingCount: number
    approvedCount: number
    rejectedCount: number
    committedCount: number
    errors: number
    createdAt: number
    completedAt: number
    _all: number
  }


  export type BulkUploadAvgAggregateInputType = {
    totalFiles?: true
    processedFiles?: true
    failedFiles?: true
    extractedCount?: true
    pendingCount?: true
    approvedCount?: true
    rejectedCount?: true
    committedCount?: true
  }

  export type BulkUploadSumAggregateInputType = {
    totalFiles?: true
    processedFiles?: true
    failedFiles?: true
    extractedCount?: true
    pendingCount?: true
    approvedCount?: true
    rejectedCount?: true
    committedCount?: true
  }

  export type BulkUploadMinAggregateInputType = {
    id?: true
    tenantId?: true
    userId?: true
    requisitionId?: true
    status?: true
    phase?: true
    archiveName?: true
    totalFiles?: true
    processedFiles?: true
    failedFiles?: true
    extractedCount?: true
    pendingCount?: true
    approvedCount?: true
    rejectedCount?: true
    committedCount?: true
    createdAt?: true
    completedAt?: true
  }

  export type BulkUploadMaxAggregateInputType = {
    id?: true
    tenantId?: true
    userId?: true
    requisitionId?: true
    status?: true
    phase?: true
    archiveName?: true
    totalFiles?: true
    processedFiles?: true
    failedFiles?: true
    extractedCount?: true
    pendingCount?: true
    approvedCount?: true
    rejectedCount?: true
    committedCount?: true
    createdAt?: true
    completedAt?: true
  }

  export type BulkUploadCountAggregateInputType = {
    id?: true
    tenantId?: true
    userId?: true
    requisitionId?: true
    status?: true
    phase?: true
    archiveName?: true
    totalFiles?: true
    processedFiles?: true
    failedFiles?: true
    extractedCount?: true
    pendingCount?: true
    approvedCount?: true
    rejectedCount?: true
    committedCount?: true
    errors?: true
    createdAt?: true
    completedAt?: true
    _all?: true
  }

  export type BulkUploadAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which BulkUpload to aggregate.
     */
    where?: BulkUploadWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BulkUploads to fetch.
     */
    orderBy?: BulkUploadOrderByWithRelationInput | BulkUploadOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: BulkUploadWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BulkUploads from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BulkUploads.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned BulkUploads
    **/
    _count?: true | BulkUploadCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: BulkUploadAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: BulkUploadSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: BulkUploadMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: BulkUploadMaxAggregateInputType
  }

  export type GetBulkUploadAggregateType<T extends BulkUploadAggregateArgs> = {
        [P in keyof T & keyof AggregateBulkUpload]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateBulkUpload[P]>
      : GetScalarType<T[P], AggregateBulkUpload[P]>
  }




  export type BulkUploadGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BulkUploadWhereInput
    orderBy?: BulkUploadOrderByWithAggregationInput | BulkUploadOrderByWithAggregationInput[]
    by: BulkUploadScalarFieldEnum[] | BulkUploadScalarFieldEnum
    having?: BulkUploadScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: BulkUploadCountAggregateInputType | true
    _avg?: BulkUploadAvgAggregateInputType
    _sum?: BulkUploadSumAggregateInputType
    _min?: BulkUploadMinAggregateInputType
    _max?: BulkUploadMaxAggregateInputType
  }

  export type BulkUploadGroupByOutputType = {
    id: string
    tenantId: string
    userId: string
    requisitionId: string | null
    status: $Enums.BulkUploadStatus
    phase: string
    archiveName: string | null
    totalFiles: number
    processedFiles: number
    failedFiles: number
    extractedCount: number
    pendingCount: number
    approvedCount: number
    rejectedCount: number
    committedCount: number
    errors: JsonValue
    createdAt: Date
    completedAt: Date | null
    _count: BulkUploadCountAggregateOutputType | null
    _avg: BulkUploadAvgAggregateOutputType | null
    _sum: BulkUploadSumAggregateOutputType | null
    _min: BulkUploadMinAggregateOutputType | null
    _max: BulkUploadMaxAggregateOutputType | null
  }

  type GetBulkUploadGroupByPayload<T extends BulkUploadGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<BulkUploadGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof BulkUploadGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], BulkUploadGroupByOutputType[P]>
            : GetScalarType<T[P], BulkUploadGroupByOutputType[P]>
        }
      >
    >


  export type BulkUploadSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    userId?: boolean
    requisitionId?: boolean
    status?: boolean
    phase?: boolean
    archiveName?: boolean
    totalFiles?: boolean
    processedFiles?: boolean
    failedFiles?: boolean
    extractedCount?: boolean
    pendingCount?: boolean
    approvedCount?: boolean
    rejectedCount?: boolean
    committedCount?: boolean
    errors?: boolean
    createdAt?: boolean
    completedAt?: boolean
  }, ExtArgs["result"]["bulkUpload"]>

  export type BulkUploadSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    userId?: boolean
    requisitionId?: boolean
    status?: boolean
    phase?: boolean
    archiveName?: boolean
    totalFiles?: boolean
    processedFiles?: boolean
    failedFiles?: boolean
    extractedCount?: boolean
    pendingCount?: boolean
    approvedCount?: boolean
    rejectedCount?: boolean
    committedCount?: boolean
    errors?: boolean
    createdAt?: boolean
    completedAt?: boolean
  }, ExtArgs["result"]["bulkUpload"]>

  export type BulkUploadSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    userId?: boolean
    requisitionId?: boolean
    status?: boolean
    phase?: boolean
    archiveName?: boolean
    totalFiles?: boolean
    processedFiles?: boolean
    failedFiles?: boolean
    extractedCount?: boolean
    pendingCount?: boolean
    approvedCount?: boolean
    rejectedCount?: boolean
    committedCount?: boolean
    errors?: boolean
    createdAt?: boolean
    completedAt?: boolean
  }, ExtArgs["result"]["bulkUpload"]>

  export type BulkUploadSelectScalar = {
    id?: boolean
    tenantId?: boolean
    userId?: boolean
    requisitionId?: boolean
    status?: boolean
    phase?: boolean
    archiveName?: boolean
    totalFiles?: boolean
    processedFiles?: boolean
    failedFiles?: boolean
    extractedCount?: boolean
    pendingCount?: boolean
    approvedCount?: boolean
    rejectedCount?: boolean
    committedCount?: boolean
    errors?: boolean
    createdAt?: boolean
    completedAt?: boolean
  }

  export type BulkUploadOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "userId" | "requisitionId" | "status" | "phase" | "archiveName" | "totalFiles" | "processedFiles" | "failedFiles" | "extractedCount" | "pendingCount" | "approvedCount" | "rejectedCount" | "committedCount" | "errors" | "createdAt" | "completedAt", ExtArgs["result"]["bulkUpload"]>

  export type $BulkUploadPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "BulkUpload"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      userId: string
      requisitionId: string | null
      status: $Enums.BulkUploadStatus
      phase: string
      archiveName: string | null
      totalFiles: number
      processedFiles: number
      failedFiles: number
      extractedCount: number
      pendingCount: number
      approvedCount: number
      rejectedCount: number
      committedCount: number
      errors: Prisma.JsonValue
      createdAt: Date
      completedAt: Date | null
    }, ExtArgs["result"]["bulkUpload"]>
    composites: {}
  }

  type BulkUploadGetPayload<S extends boolean | null | undefined | BulkUploadDefaultArgs> = $Result.GetResult<Prisma.$BulkUploadPayload, S>

  type BulkUploadCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<BulkUploadFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: BulkUploadCountAggregateInputType | true
    }

  export interface BulkUploadDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['BulkUpload'], meta: { name: 'BulkUpload' } }
    /**
     * Find zero or one BulkUpload that matches the filter.
     * @param {BulkUploadFindUniqueArgs} args - Arguments to find a BulkUpload
     * @example
     * // Get one BulkUpload
     * const bulkUpload = await prisma.bulkUpload.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends BulkUploadFindUniqueArgs>(args: SelectSubset<T, BulkUploadFindUniqueArgs<ExtArgs>>): Prisma__BulkUploadClient<$Result.GetResult<Prisma.$BulkUploadPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one BulkUpload that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {BulkUploadFindUniqueOrThrowArgs} args - Arguments to find a BulkUpload
     * @example
     * // Get one BulkUpload
     * const bulkUpload = await prisma.bulkUpload.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends BulkUploadFindUniqueOrThrowArgs>(args: SelectSubset<T, BulkUploadFindUniqueOrThrowArgs<ExtArgs>>): Prisma__BulkUploadClient<$Result.GetResult<Prisma.$BulkUploadPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first BulkUpload that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BulkUploadFindFirstArgs} args - Arguments to find a BulkUpload
     * @example
     * // Get one BulkUpload
     * const bulkUpload = await prisma.bulkUpload.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends BulkUploadFindFirstArgs>(args?: SelectSubset<T, BulkUploadFindFirstArgs<ExtArgs>>): Prisma__BulkUploadClient<$Result.GetResult<Prisma.$BulkUploadPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first BulkUpload that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BulkUploadFindFirstOrThrowArgs} args - Arguments to find a BulkUpload
     * @example
     * // Get one BulkUpload
     * const bulkUpload = await prisma.bulkUpload.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends BulkUploadFindFirstOrThrowArgs>(args?: SelectSubset<T, BulkUploadFindFirstOrThrowArgs<ExtArgs>>): Prisma__BulkUploadClient<$Result.GetResult<Prisma.$BulkUploadPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more BulkUploads that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BulkUploadFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all BulkUploads
     * const bulkUploads = await prisma.bulkUpload.findMany()
     * 
     * // Get first 10 BulkUploads
     * const bulkUploads = await prisma.bulkUpload.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const bulkUploadWithIdOnly = await prisma.bulkUpload.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends BulkUploadFindManyArgs>(args?: SelectSubset<T, BulkUploadFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BulkUploadPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a BulkUpload.
     * @param {BulkUploadCreateArgs} args - Arguments to create a BulkUpload.
     * @example
     * // Create one BulkUpload
     * const BulkUpload = await prisma.bulkUpload.create({
     *   data: {
     *     // ... data to create a BulkUpload
     *   }
     * })
     * 
     */
    create<T extends BulkUploadCreateArgs>(args: SelectSubset<T, BulkUploadCreateArgs<ExtArgs>>): Prisma__BulkUploadClient<$Result.GetResult<Prisma.$BulkUploadPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many BulkUploads.
     * @param {BulkUploadCreateManyArgs} args - Arguments to create many BulkUploads.
     * @example
     * // Create many BulkUploads
     * const bulkUpload = await prisma.bulkUpload.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends BulkUploadCreateManyArgs>(args?: SelectSubset<T, BulkUploadCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many BulkUploads and returns the data saved in the database.
     * @param {BulkUploadCreateManyAndReturnArgs} args - Arguments to create many BulkUploads.
     * @example
     * // Create many BulkUploads
     * const bulkUpload = await prisma.bulkUpload.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many BulkUploads and only return the `id`
     * const bulkUploadWithIdOnly = await prisma.bulkUpload.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends BulkUploadCreateManyAndReturnArgs>(args?: SelectSubset<T, BulkUploadCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BulkUploadPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a BulkUpload.
     * @param {BulkUploadDeleteArgs} args - Arguments to delete one BulkUpload.
     * @example
     * // Delete one BulkUpload
     * const BulkUpload = await prisma.bulkUpload.delete({
     *   where: {
     *     // ... filter to delete one BulkUpload
     *   }
     * })
     * 
     */
    delete<T extends BulkUploadDeleteArgs>(args: SelectSubset<T, BulkUploadDeleteArgs<ExtArgs>>): Prisma__BulkUploadClient<$Result.GetResult<Prisma.$BulkUploadPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one BulkUpload.
     * @param {BulkUploadUpdateArgs} args - Arguments to update one BulkUpload.
     * @example
     * // Update one BulkUpload
     * const bulkUpload = await prisma.bulkUpload.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends BulkUploadUpdateArgs>(args: SelectSubset<T, BulkUploadUpdateArgs<ExtArgs>>): Prisma__BulkUploadClient<$Result.GetResult<Prisma.$BulkUploadPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more BulkUploads.
     * @param {BulkUploadDeleteManyArgs} args - Arguments to filter BulkUploads to delete.
     * @example
     * // Delete a few BulkUploads
     * const { count } = await prisma.bulkUpload.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends BulkUploadDeleteManyArgs>(args?: SelectSubset<T, BulkUploadDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more BulkUploads.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BulkUploadUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many BulkUploads
     * const bulkUpload = await prisma.bulkUpload.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends BulkUploadUpdateManyArgs>(args: SelectSubset<T, BulkUploadUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more BulkUploads and returns the data updated in the database.
     * @param {BulkUploadUpdateManyAndReturnArgs} args - Arguments to update many BulkUploads.
     * @example
     * // Update many BulkUploads
     * const bulkUpload = await prisma.bulkUpload.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more BulkUploads and only return the `id`
     * const bulkUploadWithIdOnly = await prisma.bulkUpload.updateManyAndReturn({
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
    updateManyAndReturn<T extends BulkUploadUpdateManyAndReturnArgs>(args: SelectSubset<T, BulkUploadUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BulkUploadPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one BulkUpload.
     * @param {BulkUploadUpsertArgs} args - Arguments to update or create a BulkUpload.
     * @example
     * // Update or create a BulkUpload
     * const bulkUpload = await prisma.bulkUpload.upsert({
     *   create: {
     *     // ... data to create a BulkUpload
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the BulkUpload we want to update
     *   }
     * })
     */
    upsert<T extends BulkUploadUpsertArgs>(args: SelectSubset<T, BulkUploadUpsertArgs<ExtArgs>>): Prisma__BulkUploadClient<$Result.GetResult<Prisma.$BulkUploadPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of BulkUploads.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BulkUploadCountArgs} args - Arguments to filter BulkUploads to count.
     * @example
     * // Count the number of BulkUploads
     * const count = await prisma.bulkUpload.count({
     *   where: {
     *     // ... the filter for the BulkUploads we want to count
     *   }
     * })
    **/
    count<T extends BulkUploadCountArgs>(
      args?: Subset<T, BulkUploadCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], BulkUploadCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a BulkUpload.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BulkUploadAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends BulkUploadAggregateArgs>(args: Subset<T, BulkUploadAggregateArgs>): Prisma.PrismaPromise<GetBulkUploadAggregateType<T>>

    /**
     * Group by BulkUpload.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BulkUploadGroupByArgs} args - Group by arguments.
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
      T extends BulkUploadGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: BulkUploadGroupByArgs['orderBy'] }
        : { orderBy?: BulkUploadGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, BulkUploadGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBulkUploadGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the BulkUpload model
   */
  readonly fields: BulkUploadFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for BulkUpload.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__BulkUploadClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the BulkUpload model
   */
  interface BulkUploadFieldRefs {
    readonly id: FieldRef<"BulkUpload", 'String'>
    readonly tenantId: FieldRef<"BulkUpload", 'String'>
    readonly userId: FieldRef<"BulkUpload", 'String'>
    readonly requisitionId: FieldRef<"BulkUpload", 'String'>
    readonly status: FieldRef<"BulkUpload", 'BulkUploadStatus'>
    readonly phase: FieldRef<"BulkUpload", 'String'>
    readonly archiveName: FieldRef<"BulkUpload", 'String'>
    readonly totalFiles: FieldRef<"BulkUpload", 'Int'>
    readonly processedFiles: FieldRef<"BulkUpload", 'Int'>
    readonly failedFiles: FieldRef<"BulkUpload", 'Int'>
    readonly extractedCount: FieldRef<"BulkUpload", 'Int'>
    readonly pendingCount: FieldRef<"BulkUpload", 'Int'>
    readonly approvedCount: FieldRef<"BulkUpload", 'Int'>
    readonly rejectedCount: FieldRef<"BulkUpload", 'Int'>
    readonly committedCount: FieldRef<"BulkUpload", 'Int'>
    readonly errors: FieldRef<"BulkUpload", 'Json'>
    readonly createdAt: FieldRef<"BulkUpload", 'DateTime'>
    readonly completedAt: FieldRef<"BulkUpload", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * BulkUpload findUnique
   */
  export type BulkUploadFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BulkUpload
     */
    select?: BulkUploadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BulkUpload
     */
    omit?: BulkUploadOmit<ExtArgs> | null
    /**
     * Filter, which BulkUpload to fetch.
     */
    where: BulkUploadWhereUniqueInput
  }

  /**
   * BulkUpload findUniqueOrThrow
   */
  export type BulkUploadFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BulkUpload
     */
    select?: BulkUploadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BulkUpload
     */
    omit?: BulkUploadOmit<ExtArgs> | null
    /**
     * Filter, which BulkUpload to fetch.
     */
    where: BulkUploadWhereUniqueInput
  }

  /**
   * BulkUpload findFirst
   */
  export type BulkUploadFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BulkUpload
     */
    select?: BulkUploadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BulkUpload
     */
    omit?: BulkUploadOmit<ExtArgs> | null
    /**
     * Filter, which BulkUpload to fetch.
     */
    where?: BulkUploadWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BulkUploads to fetch.
     */
    orderBy?: BulkUploadOrderByWithRelationInput | BulkUploadOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for BulkUploads.
     */
    cursor?: BulkUploadWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BulkUploads from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BulkUploads.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BulkUploads.
     */
    distinct?: BulkUploadScalarFieldEnum | BulkUploadScalarFieldEnum[]
  }

  /**
   * BulkUpload findFirstOrThrow
   */
  export type BulkUploadFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BulkUpload
     */
    select?: BulkUploadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BulkUpload
     */
    omit?: BulkUploadOmit<ExtArgs> | null
    /**
     * Filter, which BulkUpload to fetch.
     */
    where?: BulkUploadWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BulkUploads to fetch.
     */
    orderBy?: BulkUploadOrderByWithRelationInput | BulkUploadOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for BulkUploads.
     */
    cursor?: BulkUploadWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BulkUploads from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BulkUploads.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BulkUploads.
     */
    distinct?: BulkUploadScalarFieldEnum | BulkUploadScalarFieldEnum[]
  }

  /**
   * BulkUpload findMany
   */
  export type BulkUploadFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BulkUpload
     */
    select?: BulkUploadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BulkUpload
     */
    omit?: BulkUploadOmit<ExtArgs> | null
    /**
     * Filter, which BulkUploads to fetch.
     */
    where?: BulkUploadWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BulkUploads to fetch.
     */
    orderBy?: BulkUploadOrderByWithRelationInput | BulkUploadOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing BulkUploads.
     */
    cursor?: BulkUploadWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BulkUploads from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BulkUploads.
     */
    skip?: number
    distinct?: BulkUploadScalarFieldEnum | BulkUploadScalarFieldEnum[]
  }

  /**
   * BulkUpload create
   */
  export type BulkUploadCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BulkUpload
     */
    select?: BulkUploadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BulkUpload
     */
    omit?: BulkUploadOmit<ExtArgs> | null
    /**
     * The data needed to create a BulkUpload.
     */
    data: XOR<BulkUploadCreateInput, BulkUploadUncheckedCreateInput>
  }

  /**
   * BulkUpload createMany
   */
  export type BulkUploadCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many BulkUploads.
     */
    data: BulkUploadCreateManyInput | BulkUploadCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * BulkUpload createManyAndReturn
   */
  export type BulkUploadCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BulkUpload
     */
    select?: BulkUploadSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the BulkUpload
     */
    omit?: BulkUploadOmit<ExtArgs> | null
    /**
     * The data used to create many BulkUploads.
     */
    data: BulkUploadCreateManyInput | BulkUploadCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * BulkUpload update
   */
  export type BulkUploadUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BulkUpload
     */
    select?: BulkUploadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BulkUpload
     */
    omit?: BulkUploadOmit<ExtArgs> | null
    /**
     * The data needed to update a BulkUpload.
     */
    data: XOR<BulkUploadUpdateInput, BulkUploadUncheckedUpdateInput>
    /**
     * Choose, which BulkUpload to update.
     */
    where: BulkUploadWhereUniqueInput
  }

  /**
   * BulkUpload updateMany
   */
  export type BulkUploadUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update BulkUploads.
     */
    data: XOR<BulkUploadUpdateManyMutationInput, BulkUploadUncheckedUpdateManyInput>
    /**
     * Filter which BulkUploads to update
     */
    where?: BulkUploadWhereInput
    /**
     * Limit how many BulkUploads to update.
     */
    limit?: number
  }

  /**
   * BulkUpload updateManyAndReturn
   */
  export type BulkUploadUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BulkUpload
     */
    select?: BulkUploadSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the BulkUpload
     */
    omit?: BulkUploadOmit<ExtArgs> | null
    /**
     * The data used to update BulkUploads.
     */
    data: XOR<BulkUploadUpdateManyMutationInput, BulkUploadUncheckedUpdateManyInput>
    /**
     * Filter which BulkUploads to update
     */
    where?: BulkUploadWhereInput
    /**
     * Limit how many BulkUploads to update.
     */
    limit?: number
  }

  /**
   * BulkUpload upsert
   */
  export type BulkUploadUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BulkUpload
     */
    select?: BulkUploadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BulkUpload
     */
    omit?: BulkUploadOmit<ExtArgs> | null
    /**
     * The filter to search for the BulkUpload to update in case it exists.
     */
    where: BulkUploadWhereUniqueInput
    /**
     * In case the BulkUpload found by the `where` argument doesn't exist, create a new BulkUpload with this data.
     */
    create: XOR<BulkUploadCreateInput, BulkUploadUncheckedCreateInput>
    /**
     * In case the BulkUpload was found with the provided `where` argument, update it with this data.
     */
    update: XOR<BulkUploadUpdateInput, BulkUploadUncheckedUpdateInput>
  }

  /**
   * BulkUpload delete
   */
  export type BulkUploadDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BulkUpload
     */
    select?: BulkUploadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BulkUpload
     */
    omit?: BulkUploadOmit<ExtArgs> | null
    /**
     * Filter which BulkUpload to delete.
     */
    where: BulkUploadWhereUniqueInput
  }

  /**
   * BulkUpload deleteMany
   */
  export type BulkUploadDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which BulkUploads to delete
     */
    where?: BulkUploadWhereInput
    /**
     * Limit how many BulkUploads to delete.
     */
    limit?: number
  }

  /**
   * BulkUpload without action
   */
  export type BulkUploadDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BulkUpload
     */
    select?: BulkUploadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BulkUpload
     */
    omit?: BulkUploadOmit<ExtArgs> | null
  }


  /**
   * Model BulkImportItem
   */

  export type AggregateBulkImportItem = {
    _count: BulkImportItemCountAggregateOutputType | null
    _avg: BulkImportItemAvgAggregateOutputType | null
    _sum: BulkImportItemSumAggregateOutputType | null
    _min: BulkImportItemMinAggregateOutputType | null
    _max: BulkImportItemMaxAggregateOutputType | null
  }

  export type BulkImportItemAvgAggregateOutputType = {
    sizeBytes: number | null
  }

  export type BulkImportItemSumAggregateOutputType = {
    sizeBytes: number | null
  }

  export type BulkImportItemMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    bulkUploadId: string | null
    fileName: string | null
    mimeType: string | null
    sizeBytes: number | null
    detectedName: string | null
    detectedEmail: string | null
    textSnippet: string | null
    extractedText: string | null
    extractStatus: string | null
    reviewStatus: string | null
    candidateId: string | null
    createdAt: Date | null
  }

  export type BulkImportItemMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    bulkUploadId: string | null
    fileName: string | null
    mimeType: string | null
    sizeBytes: number | null
    detectedName: string | null
    detectedEmail: string | null
    textSnippet: string | null
    extractedText: string | null
    extractStatus: string | null
    reviewStatus: string | null
    candidateId: string | null
    createdAt: Date | null
  }

  export type BulkImportItemCountAggregateOutputType = {
    id: number
    tenantId: number
    bulkUploadId: number
    fileName: number
    mimeType: number
    sizeBytes: number
    detectedName: number
    detectedEmail: number
    textSnippet: number
    extractedText: number
    extractStatus: number
    reviewStatus: number
    candidateId: number
    createdAt: number
    _all: number
  }


  export type BulkImportItemAvgAggregateInputType = {
    sizeBytes?: true
  }

  export type BulkImportItemSumAggregateInputType = {
    sizeBytes?: true
  }

  export type BulkImportItemMinAggregateInputType = {
    id?: true
    tenantId?: true
    bulkUploadId?: true
    fileName?: true
    mimeType?: true
    sizeBytes?: true
    detectedName?: true
    detectedEmail?: true
    textSnippet?: true
    extractedText?: true
    extractStatus?: true
    reviewStatus?: true
    candidateId?: true
    createdAt?: true
  }

  export type BulkImportItemMaxAggregateInputType = {
    id?: true
    tenantId?: true
    bulkUploadId?: true
    fileName?: true
    mimeType?: true
    sizeBytes?: true
    detectedName?: true
    detectedEmail?: true
    textSnippet?: true
    extractedText?: true
    extractStatus?: true
    reviewStatus?: true
    candidateId?: true
    createdAt?: true
  }

  export type BulkImportItemCountAggregateInputType = {
    id?: true
    tenantId?: true
    bulkUploadId?: true
    fileName?: true
    mimeType?: true
    sizeBytes?: true
    detectedName?: true
    detectedEmail?: true
    textSnippet?: true
    extractedText?: true
    extractStatus?: true
    reviewStatus?: true
    candidateId?: true
    createdAt?: true
    _all?: true
  }

  export type BulkImportItemAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which BulkImportItem to aggregate.
     */
    where?: BulkImportItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BulkImportItems to fetch.
     */
    orderBy?: BulkImportItemOrderByWithRelationInput | BulkImportItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: BulkImportItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BulkImportItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BulkImportItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned BulkImportItems
    **/
    _count?: true | BulkImportItemCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: BulkImportItemAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: BulkImportItemSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: BulkImportItemMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: BulkImportItemMaxAggregateInputType
  }

  export type GetBulkImportItemAggregateType<T extends BulkImportItemAggregateArgs> = {
        [P in keyof T & keyof AggregateBulkImportItem]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateBulkImportItem[P]>
      : GetScalarType<T[P], AggregateBulkImportItem[P]>
  }




  export type BulkImportItemGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BulkImportItemWhereInput
    orderBy?: BulkImportItemOrderByWithAggregationInput | BulkImportItemOrderByWithAggregationInput[]
    by: BulkImportItemScalarFieldEnum[] | BulkImportItemScalarFieldEnum
    having?: BulkImportItemScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: BulkImportItemCountAggregateInputType | true
    _avg?: BulkImportItemAvgAggregateInputType
    _sum?: BulkImportItemSumAggregateInputType
    _min?: BulkImportItemMinAggregateInputType
    _max?: BulkImportItemMaxAggregateInputType
  }

  export type BulkImportItemGroupByOutputType = {
    id: string
    tenantId: string
    bulkUploadId: string
    fileName: string
    mimeType: string
    sizeBytes: number
    detectedName: string | null
    detectedEmail: string | null
    textSnippet: string | null
    extractedText: string | null
    extractStatus: string
    reviewStatus: string
    candidateId: string | null
    createdAt: Date
    _count: BulkImportItemCountAggregateOutputType | null
    _avg: BulkImportItemAvgAggregateOutputType | null
    _sum: BulkImportItemSumAggregateOutputType | null
    _min: BulkImportItemMinAggregateOutputType | null
    _max: BulkImportItemMaxAggregateOutputType | null
  }

  type GetBulkImportItemGroupByPayload<T extends BulkImportItemGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<BulkImportItemGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof BulkImportItemGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], BulkImportItemGroupByOutputType[P]>
            : GetScalarType<T[P], BulkImportItemGroupByOutputType[P]>
        }
      >
    >


  export type BulkImportItemSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    bulkUploadId?: boolean
    fileName?: boolean
    mimeType?: boolean
    sizeBytes?: boolean
    detectedName?: boolean
    detectedEmail?: boolean
    textSnippet?: boolean
    extractedText?: boolean
    extractStatus?: boolean
    reviewStatus?: boolean
    candidateId?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["bulkImportItem"]>

  export type BulkImportItemSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    bulkUploadId?: boolean
    fileName?: boolean
    mimeType?: boolean
    sizeBytes?: boolean
    detectedName?: boolean
    detectedEmail?: boolean
    textSnippet?: boolean
    extractedText?: boolean
    extractStatus?: boolean
    reviewStatus?: boolean
    candidateId?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["bulkImportItem"]>

  export type BulkImportItemSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    bulkUploadId?: boolean
    fileName?: boolean
    mimeType?: boolean
    sizeBytes?: boolean
    detectedName?: boolean
    detectedEmail?: boolean
    textSnippet?: boolean
    extractedText?: boolean
    extractStatus?: boolean
    reviewStatus?: boolean
    candidateId?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["bulkImportItem"]>

  export type BulkImportItemSelectScalar = {
    id?: boolean
    tenantId?: boolean
    bulkUploadId?: boolean
    fileName?: boolean
    mimeType?: boolean
    sizeBytes?: boolean
    detectedName?: boolean
    detectedEmail?: boolean
    textSnippet?: boolean
    extractedText?: boolean
    extractStatus?: boolean
    reviewStatus?: boolean
    candidateId?: boolean
    createdAt?: boolean
  }

  export type BulkImportItemOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "bulkUploadId" | "fileName" | "mimeType" | "sizeBytes" | "detectedName" | "detectedEmail" | "textSnippet" | "extractedText" | "extractStatus" | "reviewStatus" | "candidateId" | "createdAt", ExtArgs["result"]["bulkImportItem"]>

  export type $BulkImportItemPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "BulkImportItem"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      bulkUploadId: string
      fileName: string
      mimeType: string
      sizeBytes: number
      detectedName: string | null
      detectedEmail: string | null
      textSnippet: string | null
      extractedText: string | null
      extractStatus: string
      reviewStatus: string
      candidateId: string | null
      createdAt: Date
    }, ExtArgs["result"]["bulkImportItem"]>
    composites: {}
  }

  type BulkImportItemGetPayload<S extends boolean | null | undefined | BulkImportItemDefaultArgs> = $Result.GetResult<Prisma.$BulkImportItemPayload, S>

  type BulkImportItemCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<BulkImportItemFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: BulkImportItemCountAggregateInputType | true
    }

  export interface BulkImportItemDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['BulkImportItem'], meta: { name: 'BulkImportItem' } }
    /**
     * Find zero or one BulkImportItem that matches the filter.
     * @param {BulkImportItemFindUniqueArgs} args - Arguments to find a BulkImportItem
     * @example
     * // Get one BulkImportItem
     * const bulkImportItem = await prisma.bulkImportItem.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends BulkImportItemFindUniqueArgs>(args: SelectSubset<T, BulkImportItemFindUniqueArgs<ExtArgs>>): Prisma__BulkImportItemClient<$Result.GetResult<Prisma.$BulkImportItemPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one BulkImportItem that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {BulkImportItemFindUniqueOrThrowArgs} args - Arguments to find a BulkImportItem
     * @example
     * // Get one BulkImportItem
     * const bulkImportItem = await prisma.bulkImportItem.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends BulkImportItemFindUniqueOrThrowArgs>(args: SelectSubset<T, BulkImportItemFindUniqueOrThrowArgs<ExtArgs>>): Prisma__BulkImportItemClient<$Result.GetResult<Prisma.$BulkImportItemPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first BulkImportItem that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BulkImportItemFindFirstArgs} args - Arguments to find a BulkImportItem
     * @example
     * // Get one BulkImportItem
     * const bulkImportItem = await prisma.bulkImportItem.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends BulkImportItemFindFirstArgs>(args?: SelectSubset<T, BulkImportItemFindFirstArgs<ExtArgs>>): Prisma__BulkImportItemClient<$Result.GetResult<Prisma.$BulkImportItemPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first BulkImportItem that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BulkImportItemFindFirstOrThrowArgs} args - Arguments to find a BulkImportItem
     * @example
     * // Get one BulkImportItem
     * const bulkImportItem = await prisma.bulkImportItem.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends BulkImportItemFindFirstOrThrowArgs>(args?: SelectSubset<T, BulkImportItemFindFirstOrThrowArgs<ExtArgs>>): Prisma__BulkImportItemClient<$Result.GetResult<Prisma.$BulkImportItemPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more BulkImportItems that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BulkImportItemFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all BulkImportItems
     * const bulkImportItems = await prisma.bulkImportItem.findMany()
     * 
     * // Get first 10 BulkImportItems
     * const bulkImportItems = await prisma.bulkImportItem.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const bulkImportItemWithIdOnly = await prisma.bulkImportItem.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends BulkImportItemFindManyArgs>(args?: SelectSubset<T, BulkImportItemFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BulkImportItemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a BulkImportItem.
     * @param {BulkImportItemCreateArgs} args - Arguments to create a BulkImportItem.
     * @example
     * // Create one BulkImportItem
     * const BulkImportItem = await prisma.bulkImportItem.create({
     *   data: {
     *     // ... data to create a BulkImportItem
     *   }
     * })
     * 
     */
    create<T extends BulkImportItemCreateArgs>(args: SelectSubset<T, BulkImportItemCreateArgs<ExtArgs>>): Prisma__BulkImportItemClient<$Result.GetResult<Prisma.$BulkImportItemPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many BulkImportItems.
     * @param {BulkImportItemCreateManyArgs} args - Arguments to create many BulkImportItems.
     * @example
     * // Create many BulkImportItems
     * const bulkImportItem = await prisma.bulkImportItem.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends BulkImportItemCreateManyArgs>(args?: SelectSubset<T, BulkImportItemCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many BulkImportItems and returns the data saved in the database.
     * @param {BulkImportItemCreateManyAndReturnArgs} args - Arguments to create many BulkImportItems.
     * @example
     * // Create many BulkImportItems
     * const bulkImportItem = await prisma.bulkImportItem.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many BulkImportItems and only return the `id`
     * const bulkImportItemWithIdOnly = await prisma.bulkImportItem.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends BulkImportItemCreateManyAndReturnArgs>(args?: SelectSubset<T, BulkImportItemCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BulkImportItemPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a BulkImportItem.
     * @param {BulkImportItemDeleteArgs} args - Arguments to delete one BulkImportItem.
     * @example
     * // Delete one BulkImportItem
     * const BulkImportItem = await prisma.bulkImportItem.delete({
     *   where: {
     *     // ... filter to delete one BulkImportItem
     *   }
     * })
     * 
     */
    delete<T extends BulkImportItemDeleteArgs>(args: SelectSubset<T, BulkImportItemDeleteArgs<ExtArgs>>): Prisma__BulkImportItemClient<$Result.GetResult<Prisma.$BulkImportItemPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one BulkImportItem.
     * @param {BulkImportItemUpdateArgs} args - Arguments to update one BulkImportItem.
     * @example
     * // Update one BulkImportItem
     * const bulkImportItem = await prisma.bulkImportItem.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends BulkImportItemUpdateArgs>(args: SelectSubset<T, BulkImportItemUpdateArgs<ExtArgs>>): Prisma__BulkImportItemClient<$Result.GetResult<Prisma.$BulkImportItemPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more BulkImportItems.
     * @param {BulkImportItemDeleteManyArgs} args - Arguments to filter BulkImportItems to delete.
     * @example
     * // Delete a few BulkImportItems
     * const { count } = await prisma.bulkImportItem.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends BulkImportItemDeleteManyArgs>(args?: SelectSubset<T, BulkImportItemDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more BulkImportItems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BulkImportItemUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many BulkImportItems
     * const bulkImportItem = await prisma.bulkImportItem.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends BulkImportItemUpdateManyArgs>(args: SelectSubset<T, BulkImportItemUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more BulkImportItems and returns the data updated in the database.
     * @param {BulkImportItemUpdateManyAndReturnArgs} args - Arguments to update many BulkImportItems.
     * @example
     * // Update many BulkImportItems
     * const bulkImportItem = await prisma.bulkImportItem.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more BulkImportItems and only return the `id`
     * const bulkImportItemWithIdOnly = await prisma.bulkImportItem.updateManyAndReturn({
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
    updateManyAndReturn<T extends BulkImportItemUpdateManyAndReturnArgs>(args: SelectSubset<T, BulkImportItemUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BulkImportItemPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one BulkImportItem.
     * @param {BulkImportItemUpsertArgs} args - Arguments to update or create a BulkImportItem.
     * @example
     * // Update or create a BulkImportItem
     * const bulkImportItem = await prisma.bulkImportItem.upsert({
     *   create: {
     *     // ... data to create a BulkImportItem
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the BulkImportItem we want to update
     *   }
     * })
     */
    upsert<T extends BulkImportItemUpsertArgs>(args: SelectSubset<T, BulkImportItemUpsertArgs<ExtArgs>>): Prisma__BulkImportItemClient<$Result.GetResult<Prisma.$BulkImportItemPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of BulkImportItems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BulkImportItemCountArgs} args - Arguments to filter BulkImportItems to count.
     * @example
     * // Count the number of BulkImportItems
     * const count = await prisma.bulkImportItem.count({
     *   where: {
     *     // ... the filter for the BulkImportItems we want to count
     *   }
     * })
    **/
    count<T extends BulkImportItemCountArgs>(
      args?: Subset<T, BulkImportItemCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], BulkImportItemCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a BulkImportItem.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BulkImportItemAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends BulkImportItemAggregateArgs>(args: Subset<T, BulkImportItemAggregateArgs>): Prisma.PrismaPromise<GetBulkImportItemAggregateType<T>>

    /**
     * Group by BulkImportItem.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BulkImportItemGroupByArgs} args - Group by arguments.
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
      T extends BulkImportItemGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: BulkImportItemGroupByArgs['orderBy'] }
        : { orderBy?: BulkImportItemGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, BulkImportItemGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBulkImportItemGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the BulkImportItem model
   */
  readonly fields: BulkImportItemFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for BulkImportItem.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__BulkImportItemClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the BulkImportItem model
   */
  interface BulkImportItemFieldRefs {
    readonly id: FieldRef<"BulkImportItem", 'String'>
    readonly tenantId: FieldRef<"BulkImportItem", 'String'>
    readonly bulkUploadId: FieldRef<"BulkImportItem", 'String'>
    readonly fileName: FieldRef<"BulkImportItem", 'String'>
    readonly mimeType: FieldRef<"BulkImportItem", 'String'>
    readonly sizeBytes: FieldRef<"BulkImportItem", 'Int'>
    readonly detectedName: FieldRef<"BulkImportItem", 'String'>
    readonly detectedEmail: FieldRef<"BulkImportItem", 'String'>
    readonly textSnippet: FieldRef<"BulkImportItem", 'String'>
    readonly extractedText: FieldRef<"BulkImportItem", 'String'>
    readonly extractStatus: FieldRef<"BulkImportItem", 'String'>
    readonly reviewStatus: FieldRef<"BulkImportItem", 'String'>
    readonly candidateId: FieldRef<"BulkImportItem", 'String'>
    readonly createdAt: FieldRef<"BulkImportItem", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * BulkImportItem findUnique
   */
  export type BulkImportItemFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BulkImportItem
     */
    select?: BulkImportItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BulkImportItem
     */
    omit?: BulkImportItemOmit<ExtArgs> | null
    /**
     * Filter, which BulkImportItem to fetch.
     */
    where: BulkImportItemWhereUniqueInput
  }

  /**
   * BulkImportItem findUniqueOrThrow
   */
  export type BulkImportItemFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BulkImportItem
     */
    select?: BulkImportItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BulkImportItem
     */
    omit?: BulkImportItemOmit<ExtArgs> | null
    /**
     * Filter, which BulkImportItem to fetch.
     */
    where: BulkImportItemWhereUniqueInput
  }

  /**
   * BulkImportItem findFirst
   */
  export type BulkImportItemFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BulkImportItem
     */
    select?: BulkImportItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BulkImportItem
     */
    omit?: BulkImportItemOmit<ExtArgs> | null
    /**
     * Filter, which BulkImportItem to fetch.
     */
    where?: BulkImportItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BulkImportItems to fetch.
     */
    orderBy?: BulkImportItemOrderByWithRelationInput | BulkImportItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for BulkImportItems.
     */
    cursor?: BulkImportItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BulkImportItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BulkImportItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BulkImportItems.
     */
    distinct?: BulkImportItemScalarFieldEnum | BulkImportItemScalarFieldEnum[]
  }

  /**
   * BulkImportItem findFirstOrThrow
   */
  export type BulkImportItemFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BulkImportItem
     */
    select?: BulkImportItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BulkImportItem
     */
    omit?: BulkImportItemOmit<ExtArgs> | null
    /**
     * Filter, which BulkImportItem to fetch.
     */
    where?: BulkImportItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BulkImportItems to fetch.
     */
    orderBy?: BulkImportItemOrderByWithRelationInput | BulkImportItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for BulkImportItems.
     */
    cursor?: BulkImportItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BulkImportItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BulkImportItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BulkImportItems.
     */
    distinct?: BulkImportItemScalarFieldEnum | BulkImportItemScalarFieldEnum[]
  }

  /**
   * BulkImportItem findMany
   */
  export type BulkImportItemFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BulkImportItem
     */
    select?: BulkImportItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BulkImportItem
     */
    omit?: BulkImportItemOmit<ExtArgs> | null
    /**
     * Filter, which BulkImportItems to fetch.
     */
    where?: BulkImportItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BulkImportItems to fetch.
     */
    orderBy?: BulkImportItemOrderByWithRelationInput | BulkImportItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing BulkImportItems.
     */
    cursor?: BulkImportItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BulkImportItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BulkImportItems.
     */
    skip?: number
    distinct?: BulkImportItemScalarFieldEnum | BulkImportItemScalarFieldEnum[]
  }

  /**
   * BulkImportItem create
   */
  export type BulkImportItemCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BulkImportItem
     */
    select?: BulkImportItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BulkImportItem
     */
    omit?: BulkImportItemOmit<ExtArgs> | null
    /**
     * The data needed to create a BulkImportItem.
     */
    data: XOR<BulkImportItemCreateInput, BulkImportItemUncheckedCreateInput>
  }

  /**
   * BulkImportItem createMany
   */
  export type BulkImportItemCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many BulkImportItems.
     */
    data: BulkImportItemCreateManyInput | BulkImportItemCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * BulkImportItem createManyAndReturn
   */
  export type BulkImportItemCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BulkImportItem
     */
    select?: BulkImportItemSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the BulkImportItem
     */
    omit?: BulkImportItemOmit<ExtArgs> | null
    /**
     * The data used to create many BulkImportItems.
     */
    data: BulkImportItemCreateManyInput | BulkImportItemCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * BulkImportItem update
   */
  export type BulkImportItemUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BulkImportItem
     */
    select?: BulkImportItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BulkImportItem
     */
    omit?: BulkImportItemOmit<ExtArgs> | null
    /**
     * The data needed to update a BulkImportItem.
     */
    data: XOR<BulkImportItemUpdateInput, BulkImportItemUncheckedUpdateInput>
    /**
     * Choose, which BulkImportItem to update.
     */
    where: BulkImportItemWhereUniqueInput
  }

  /**
   * BulkImportItem updateMany
   */
  export type BulkImportItemUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update BulkImportItems.
     */
    data: XOR<BulkImportItemUpdateManyMutationInput, BulkImportItemUncheckedUpdateManyInput>
    /**
     * Filter which BulkImportItems to update
     */
    where?: BulkImportItemWhereInput
    /**
     * Limit how many BulkImportItems to update.
     */
    limit?: number
  }

  /**
   * BulkImportItem updateManyAndReturn
   */
  export type BulkImportItemUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BulkImportItem
     */
    select?: BulkImportItemSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the BulkImportItem
     */
    omit?: BulkImportItemOmit<ExtArgs> | null
    /**
     * The data used to update BulkImportItems.
     */
    data: XOR<BulkImportItemUpdateManyMutationInput, BulkImportItemUncheckedUpdateManyInput>
    /**
     * Filter which BulkImportItems to update
     */
    where?: BulkImportItemWhereInput
    /**
     * Limit how many BulkImportItems to update.
     */
    limit?: number
  }

  /**
   * BulkImportItem upsert
   */
  export type BulkImportItemUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BulkImportItem
     */
    select?: BulkImportItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BulkImportItem
     */
    omit?: BulkImportItemOmit<ExtArgs> | null
    /**
     * The filter to search for the BulkImportItem to update in case it exists.
     */
    where: BulkImportItemWhereUniqueInput
    /**
     * In case the BulkImportItem found by the `where` argument doesn't exist, create a new BulkImportItem with this data.
     */
    create: XOR<BulkImportItemCreateInput, BulkImportItemUncheckedCreateInput>
    /**
     * In case the BulkImportItem was found with the provided `where` argument, update it with this data.
     */
    update: XOR<BulkImportItemUpdateInput, BulkImportItemUncheckedUpdateInput>
  }

  /**
   * BulkImportItem delete
   */
  export type BulkImportItemDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BulkImportItem
     */
    select?: BulkImportItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BulkImportItem
     */
    omit?: BulkImportItemOmit<ExtArgs> | null
    /**
     * Filter which BulkImportItem to delete.
     */
    where: BulkImportItemWhereUniqueInput
  }

  /**
   * BulkImportItem deleteMany
   */
  export type BulkImportItemDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which BulkImportItems to delete
     */
    where?: BulkImportItemWhereInput
    /**
     * Limit how many BulkImportItems to delete.
     */
    limit?: number
  }

  /**
   * BulkImportItem without action
   */
  export type BulkImportItemDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BulkImportItem
     */
    select?: BulkImportItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BulkImportItem
     */
    omit?: BulkImportItemOmit<ExtArgs> | null
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
  }

  export type AgentRunSumAggregateOutputType = {
    tokensIn: number | null
    tokensOut: number | null
    costUsd: Decimal | null
    latencyMs: number | null
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
    triggeredByUserId: string | null
    errorMessage: string | null
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
    triggeredByUserId: string | null
    errorMessage: string | null
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
    triggeredByUserId: number
    errorMessage: number
    createdAt: number
    _all: number
  }


  export type AgentRunAvgAggregateInputType = {
    tokensIn?: true
    tokensOut?: true
    costUsd?: true
    latencyMs?: true
  }

  export type AgentRunSumAggregateInputType = {
    tokensIn?: true
    tokensOut?: true
    costUsd?: true
    latencyMs?: true
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
    triggeredByUserId?: true
    errorMessage?: true
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
    triggeredByUserId?: true
    errorMessage?: true
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
    triggeredByUserId?: true
    errorMessage?: true
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
    triggeredByUserId: string | null
    errorMessage: string | null
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
    triggeredByUserId?: boolean
    errorMessage?: boolean
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
    triggeredByUserId?: boolean
    errorMessage?: boolean
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
    triggeredByUserId?: boolean
    errorMessage?: boolean
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
    triggeredByUserId?: boolean
    errorMessage?: boolean
    createdAt?: boolean
  }

  export type AgentRunOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "agentType" | "status" | "inputHash" | "tokensIn" | "tokensOut" | "costUsd" | "latencyMs" | "modelName" | "triggeredByUserId" | "errorMessage" | "createdAt", ExtArgs["result"]["agentRun"]>

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
      triggeredByUserId: string | null
      errorMessage: string | null
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
    readonly triggeredByUserId: FieldRef<"AgentRun", 'String'>
    readonly errorMessage: FieldRef<"AgentRun", 'String'>
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


  export const ResumeScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    candidateId: 'candidateId',
    fileName: 'fileName',
    originalFilename: 'originalFilename',
    fileSize: 'fileSize',
    mimeType: 'mimeType',
    storageKey: 'storageKey',
    extractedText: 'extractedText',
    parsedData: 'parsedData',
    parseStatus: 'parseStatus',
    parsedAt: 'parsedAt',
    bulkUploadId: 'bulkUploadId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ResumeScalarFieldEnum = (typeof ResumeScalarFieldEnum)[keyof typeof ResumeScalarFieldEnum]


  export const BulkUploadScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    userId: 'userId',
    requisitionId: 'requisitionId',
    status: 'status',
    phase: 'phase',
    archiveName: 'archiveName',
    totalFiles: 'totalFiles',
    processedFiles: 'processedFiles',
    failedFiles: 'failedFiles',
    extractedCount: 'extractedCount',
    pendingCount: 'pendingCount',
    approvedCount: 'approvedCount',
    rejectedCount: 'rejectedCount',
    committedCount: 'committedCount',
    errors: 'errors',
    createdAt: 'createdAt',
    completedAt: 'completedAt'
  };

  export type BulkUploadScalarFieldEnum = (typeof BulkUploadScalarFieldEnum)[keyof typeof BulkUploadScalarFieldEnum]


  export const BulkImportItemScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    bulkUploadId: 'bulkUploadId',
    fileName: 'fileName',
    mimeType: 'mimeType',
    sizeBytes: 'sizeBytes',
    detectedName: 'detectedName',
    detectedEmail: 'detectedEmail',
    textSnippet: 'textSnippet',
    extractedText: 'extractedText',
    extractStatus: 'extractStatus',
    reviewStatus: 'reviewStatus',
    candidateId: 'candidateId',
    createdAt: 'createdAt'
  };

  export type BulkImportItemScalarFieldEnum = (typeof BulkImportItemScalarFieldEnum)[keyof typeof BulkImportItemScalarFieldEnum]


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
    triggeredByUserId: 'triggeredByUserId',
    errorMessage: 'errorMessage',
    createdAt: 'createdAt'
  };

  export type AgentRunScalarFieldEnum = (typeof AgentRunScalarFieldEnum)[keyof typeof AgentRunScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


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
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'BulkUploadStatus'
   */
  export type EnumBulkUploadStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BulkUploadStatus'>
    


  /**
   * Reference to a field of type 'BulkUploadStatus[]'
   */
  export type ListEnumBulkUploadStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BulkUploadStatus[]'>
    


  /**
   * Reference to a field of type 'Decimal'
   */
  export type DecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal'>
    


  /**
   * Reference to a field of type 'Decimal[]'
   */
  export type ListDecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type ResumeWhereInput = {
    AND?: ResumeWhereInput | ResumeWhereInput[]
    OR?: ResumeWhereInput[]
    NOT?: ResumeWhereInput | ResumeWhereInput[]
    id?: StringFilter<"Resume"> | string
    tenantId?: StringFilter<"Resume"> | string
    candidateId?: StringFilter<"Resume"> | string
    fileName?: StringFilter<"Resume"> | string
    originalFilename?: StringNullableFilter<"Resume"> | string | null
    fileSize?: IntFilter<"Resume"> | number
    mimeType?: StringFilter<"Resume"> | string
    storageKey?: StringFilter<"Resume"> | string
    extractedText?: StringNullableFilter<"Resume"> | string | null
    parsedData?: JsonNullableFilter<"Resume">
    parseStatus?: StringFilter<"Resume"> | string
    parsedAt?: DateTimeNullableFilter<"Resume"> | Date | string | null
    bulkUploadId?: StringNullableFilter<"Resume"> | string | null
    createdAt?: DateTimeFilter<"Resume"> | Date | string
    updatedAt?: DateTimeFilter<"Resume"> | Date | string
  }

  export type ResumeOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    candidateId?: SortOrder
    fileName?: SortOrder
    originalFilename?: SortOrderInput | SortOrder
    fileSize?: SortOrder
    mimeType?: SortOrder
    storageKey?: SortOrder
    extractedText?: SortOrderInput | SortOrder
    parsedData?: SortOrderInput | SortOrder
    parseStatus?: SortOrder
    parsedAt?: SortOrderInput | SortOrder
    bulkUploadId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ResumeWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    candidateId?: string
    AND?: ResumeWhereInput | ResumeWhereInput[]
    OR?: ResumeWhereInput[]
    NOT?: ResumeWhereInput | ResumeWhereInput[]
    tenantId?: StringFilter<"Resume"> | string
    fileName?: StringFilter<"Resume"> | string
    originalFilename?: StringNullableFilter<"Resume"> | string | null
    fileSize?: IntFilter<"Resume"> | number
    mimeType?: StringFilter<"Resume"> | string
    storageKey?: StringFilter<"Resume"> | string
    extractedText?: StringNullableFilter<"Resume"> | string | null
    parsedData?: JsonNullableFilter<"Resume">
    parseStatus?: StringFilter<"Resume"> | string
    parsedAt?: DateTimeNullableFilter<"Resume"> | Date | string | null
    bulkUploadId?: StringNullableFilter<"Resume"> | string | null
    createdAt?: DateTimeFilter<"Resume"> | Date | string
    updatedAt?: DateTimeFilter<"Resume"> | Date | string
  }, "id" | "candidateId">

  export type ResumeOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    candidateId?: SortOrder
    fileName?: SortOrder
    originalFilename?: SortOrderInput | SortOrder
    fileSize?: SortOrder
    mimeType?: SortOrder
    storageKey?: SortOrder
    extractedText?: SortOrderInput | SortOrder
    parsedData?: SortOrderInput | SortOrder
    parseStatus?: SortOrder
    parsedAt?: SortOrderInput | SortOrder
    bulkUploadId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ResumeCountOrderByAggregateInput
    _avg?: ResumeAvgOrderByAggregateInput
    _max?: ResumeMaxOrderByAggregateInput
    _min?: ResumeMinOrderByAggregateInput
    _sum?: ResumeSumOrderByAggregateInput
  }

  export type ResumeScalarWhereWithAggregatesInput = {
    AND?: ResumeScalarWhereWithAggregatesInput | ResumeScalarWhereWithAggregatesInput[]
    OR?: ResumeScalarWhereWithAggregatesInput[]
    NOT?: ResumeScalarWhereWithAggregatesInput | ResumeScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Resume"> | string
    tenantId?: StringWithAggregatesFilter<"Resume"> | string
    candidateId?: StringWithAggregatesFilter<"Resume"> | string
    fileName?: StringWithAggregatesFilter<"Resume"> | string
    originalFilename?: StringNullableWithAggregatesFilter<"Resume"> | string | null
    fileSize?: IntWithAggregatesFilter<"Resume"> | number
    mimeType?: StringWithAggregatesFilter<"Resume"> | string
    storageKey?: StringWithAggregatesFilter<"Resume"> | string
    extractedText?: StringNullableWithAggregatesFilter<"Resume"> | string | null
    parsedData?: JsonNullableWithAggregatesFilter<"Resume">
    parseStatus?: StringWithAggregatesFilter<"Resume"> | string
    parsedAt?: DateTimeNullableWithAggregatesFilter<"Resume"> | Date | string | null
    bulkUploadId?: StringNullableWithAggregatesFilter<"Resume"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Resume"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Resume"> | Date | string
  }

  export type BulkUploadWhereInput = {
    AND?: BulkUploadWhereInput | BulkUploadWhereInput[]
    OR?: BulkUploadWhereInput[]
    NOT?: BulkUploadWhereInput | BulkUploadWhereInput[]
    id?: StringFilter<"BulkUpload"> | string
    tenantId?: StringFilter<"BulkUpload"> | string
    userId?: StringFilter<"BulkUpload"> | string
    requisitionId?: StringNullableFilter<"BulkUpload"> | string | null
    status?: EnumBulkUploadStatusFilter<"BulkUpload"> | $Enums.BulkUploadStatus
    phase?: StringFilter<"BulkUpload"> | string
    archiveName?: StringNullableFilter<"BulkUpload"> | string | null
    totalFiles?: IntFilter<"BulkUpload"> | number
    processedFiles?: IntFilter<"BulkUpload"> | number
    failedFiles?: IntFilter<"BulkUpload"> | number
    extractedCount?: IntFilter<"BulkUpload"> | number
    pendingCount?: IntFilter<"BulkUpload"> | number
    approvedCount?: IntFilter<"BulkUpload"> | number
    rejectedCount?: IntFilter<"BulkUpload"> | number
    committedCount?: IntFilter<"BulkUpload"> | number
    errors?: JsonFilter<"BulkUpload">
    createdAt?: DateTimeFilter<"BulkUpload"> | Date | string
    completedAt?: DateTimeNullableFilter<"BulkUpload"> | Date | string | null
  }

  export type BulkUploadOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    userId?: SortOrder
    requisitionId?: SortOrderInput | SortOrder
    status?: SortOrder
    phase?: SortOrder
    archiveName?: SortOrderInput | SortOrder
    totalFiles?: SortOrder
    processedFiles?: SortOrder
    failedFiles?: SortOrder
    extractedCount?: SortOrder
    pendingCount?: SortOrder
    approvedCount?: SortOrder
    rejectedCount?: SortOrder
    committedCount?: SortOrder
    errors?: SortOrder
    createdAt?: SortOrder
    completedAt?: SortOrderInput | SortOrder
  }

  export type BulkUploadWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: BulkUploadWhereInput | BulkUploadWhereInput[]
    OR?: BulkUploadWhereInput[]
    NOT?: BulkUploadWhereInput | BulkUploadWhereInput[]
    tenantId?: StringFilter<"BulkUpload"> | string
    userId?: StringFilter<"BulkUpload"> | string
    requisitionId?: StringNullableFilter<"BulkUpload"> | string | null
    status?: EnumBulkUploadStatusFilter<"BulkUpload"> | $Enums.BulkUploadStatus
    phase?: StringFilter<"BulkUpload"> | string
    archiveName?: StringNullableFilter<"BulkUpload"> | string | null
    totalFiles?: IntFilter<"BulkUpload"> | number
    processedFiles?: IntFilter<"BulkUpload"> | number
    failedFiles?: IntFilter<"BulkUpload"> | number
    extractedCount?: IntFilter<"BulkUpload"> | number
    pendingCount?: IntFilter<"BulkUpload"> | number
    approvedCount?: IntFilter<"BulkUpload"> | number
    rejectedCount?: IntFilter<"BulkUpload"> | number
    committedCount?: IntFilter<"BulkUpload"> | number
    errors?: JsonFilter<"BulkUpload">
    createdAt?: DateTimeFilter<"BulkUpload"> | Date | string
    completedAt?: DateTimeNullableFilter<"BulkUpload"> | Date | string | null
  }, "id">

  export type BulkUploadOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    userId?: SortOrder
    requisitionId?: SortOrderInput | SortOrder
    status?: SortOrder
    phase?: SortOrder
    archiveName?: SortOrderInput | SortOrder
    totalFiles?: SortOrder
    processedFiles?: SortOrder
    failedFiles?: SortOrder
    extractedCount?: SortOrder
    pendingCount?: SortOrder
    approvedCount?: SortOrder
    rejectedCount?: SortOrder
    committedCount?: SortOrder
    errors?: SortOrder
    createdAt?: SortOrder
    completedAt?: SortOrderInput | SortOrder
    _count?: BulkUploadCountOrderByAggregateInput
    _avg?: BulkUploadAvgOrderByAggregateInput
    _max?: BulkUploadMaxOrderByAggregateInput
    _min?: BulkUploadMinOrderByAggregateInput
    _sum?: BulkUploadSumOrderByAggregateInput
  }

  export type BulkUploadScalarWhereWithAggregatesInput = {
    AND?: BulkUploadScalarWhereWithAggregatesInput | BulkUploadScalarWhereWithAggregatesInput[]
    OR?: BulkUploadScalarWhereWithAggregatesInput[]
    NOT?: BulkUploadScalarWhereWithAggregatesInput | BulkUploadScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"BulkUpload"> | string
    tenantId?: StringWithAggregatesFilter<"BulkUpload"> | string
    userId?: StringWithAggregatesFilter<"BulkUpload"> | string
    requisitionId?: StringNullableWithAggregatesFilter<"BulkUpload"> | string | null
    status?: EnumBulkUploadStatusWithAggregatesFilter<"BulkUpload"> | $Enums.BulkUploadStatus
    phase?: StringWithAggregatesFilter<"BulkUpload"> | string
    archiveName?: StringNullableWithAggregatesFilter<"BulkUpload"> | string | null
    totalFiles?: IntWithAggregatesFilter<"BulkUpload"> | number
    processedFiles?: IntWithAggregatesFilter<"BulkUpload"> | number
    failedFiles?: IntWithAggregatesFilter<"BulkUpload"> | number
    extractedCount?: IntWithAggregatesFilter<"BulkUpload"> | number
    pendingCount?: IntWithAggregatesFilter<"BulkUpload"> | number
    approvedCount?: IntWithAggregatesFilter<"BulkUpload"> | number
    rejectedCount?: IntWithAggregatesFilter<"BulkUpload"> | number
    committedCount?: IntWithAggregatesFilter<"BulkUpload"> | number
    errors?: JsonWithAggregatesFilter<"BulkUpload">
    createdAt?: DateTimeWithAggregatesFilter<"BulkUpload"> | Date | string
    completedAt?: DateTimeNullableWithAggregatesFilter<"BulkUpload"> | Date | string | null
  }

  export type BulkImportItemWhereInput = {
    AND?: BulkImportItemWhereInput | BulkImportItemWhereInput[]
    OR?: BulkImportItemWhereInput[]
    NOT?: BulkImportItemWhereInput | BulkImportItemWhereInput[]
    id?: StringFilter<"BulkImportItem"> | string
    tenantId?: StringFilter<"BulkImportItem"> | string
    bulkUploadId?: StringFilter<"BulkImportItem"> | string
    fileName?: StringFilter<"BulkImportItem"> | string
    mimeType?: StringFilter<"BulkImportItem"> | string
    sizeBytes?: IntFilter<"BulkImportItem"> | number
    detectedName?: StringNullableFilter<"BulkImportItem"> | string | null
    detectedEmail?: StringNullableFilter<"BulkImportItem"> | string | null
    textSnippet?: StringNullableFilter<"BulkImportItem"> | string | null
    extractedText?: StringNullableFilter<"BulkImportItem"> | string | null
    extractStatus?: StringFilter<"BulkImportItem"> | string
    reviewStatus?: StringFilter<"BulkImportItem"> | string
    candidateId?: StringNullableFilter<"BulkImportItem"> | string | null
    createdAt?: DateTimeFilter<"BulkImportItem"> | Date | string
  }

  export type BulkImportItemOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    bulkUploadId?: SortOrder
    fileName?: SortOrder
    mimeType?: SortOrder
    sizeBytes?: SortOrder
    detectedName?: SortOrderInput | SortOrder
    detectedEmail?: SortOrderInput | SortOrder
    textSnippet?: SortOrderInput | SortOrder
    extractedText?: SortOrderInput | SortOrder
    extractStatus?: SortOrder
    reviewStatus?: SortOrder
    candidateId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
  }

  export type BulkImportItemWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: BulkImportItemWhereInput | BulkImportItemWhereInput[]
    OR?: BulkImportItemWhereInput[]
    NOT?: BulkImportItemWhereInput | BulkImportItemWhereInput[]
    tenantId?: StringFilter<"BulkImportItem"> | string
    bulkUploadId?: StringFilter<"BulkImportItem"> | string
    fileName?: StringFilter<"BulkImportItem"> | string
    mimeType?: StringFilter<"BulkImportItem"> | string
    sizeBytes?: IntFilter<"BulkImportItem"> | number
    detectedName?: StringNullableFilter<"BulkImportItem"> | string | null
    detectedEmail?: StringNullableFilter<"BulkImportItem"> | string | null
    textSnippet?: StringNullableFilter<"BulkImportItem"> | string | null
    extractedText?: StringNullableFilter<"BulkImportItem"> | string | null
    extractStatus?: StringFilter<"BulkImportItem"> | string
    reviewStatus?: StringFilter<"BulkImportItem"> | string
    candidateId?: StringNullableFilter<"BulkImportItem"> | string | null
    createdAt?: DateTimeFilter<"BulkImportItem"> | Date | string
  }, "id">

  export type BulkImportItemOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    bulkUploadId?: SortOrder
    fileName?: SortOrder
    mimeType?: SortOrder
    sizeBytes?: SortOrder
    detectedName?: SortOrderInput | SortOrder
    detectedEmail?: SortOrderInput | SortOrder
    textSnippet?: SortOrderInput | SortOrder
    extractedText?: SortOrderInput | SortOrder
    extractStatus?: SortOrder
    reviewStatus?: SortOrder
    candidateId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: BulkImportItemCountOrderByAggregateInput
    _avg?: BulkImportItemAvgOrderByAggregateInput
    _max?: BulkImportItemMaxOrderByAggregateInput
    _min?: BulkImportItemMinOrderByAggregateInput
    _sum?: BulkImportItemSumOrderByAggregateInput
  }

  export type BulkImportItemScalarWhereWithAggregatesInput = {
    AND?: BulkImportItemScalarWhereWithAggregatesInput | BulkImportItemScalarWhereWithAggregatesInput[]
    OR?: BulkImportItemScalarWhereWithAggregatesInput[]
    NOT?: BulkImportItemScalarWhereWithAggregatesInput | BulkImportItemScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"BulkImportItem"> | string
    tenantId?: StringWithAggregatesFilter<"BulkImportItem"> | string
    bulkUploadId?: StringWithAggregatesFilter<"BulkImportItem"> | string
    fileName?: StringWithAggregatesFilter<"BulkImportItem"> | string
    mimeType?: StringWithAggregatesFilter<"BulkImportItem"> | string
    sizeBytes?: IntWithAggregatesFilter<"BulkImportItem"> | number
    detectedName?: StringNullableWithAggregatesFilter<"BulkImportItem"> | string | null
    detectedEmail?: StringNullableWithAggregatesFilter<"BulkImportItem"> | string | null
    textSnippet?: StringNullableWithAggregatesFilter<"BulkImportItem"> | string | null
    extractedText?: StringNullableWithAggregatesFilter<"BulkImportItem"> | string | null
    extractStatus?: StringWithAggregatesFilter<"BulkImportItem"> | string
    reviewStatus?: StringWithAggregatesFilter<"BulkImportItem"> | string
    candidateId?: StringNullableWithAggregatesFilter<"BulkImportItem"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"BulkImportItem"> | Date | string
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
    triggeredByUserId?: StringNullableFilter<"AgentRun"> | string | null
    errorMessage?: StringNullableFilter<"AgentRun"> | string | null
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
    triggeredByUserId?: SortOrderInput | SortOrder
    errorMessage?: SortOrderInput | SortOrder
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
    triggeredByUserId?: StringNullableFilter<"AgentRun"> | string | null
    errorMessage?: StringNullableFilter<"AgentRun"> | string | null
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
    triggeredByUserId?: SortOrderInput | SortOrder
    errorMessage?: SortOrderInput | SortOrder
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
    triggeredByUserId?: StringNullableWithAggregatesFilter<"AgentRun"> | string | null
    errorMessage?: StringNullableWithAggregatesFilter<"AgentRun"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"AgentRun"> | Date | string
  }

  export type ResumeCreateInput = {
    id?: string
    tenantId: string
    candidateId: string
    fileName: string
    originalFilename?: string | null
    fileSize: number
    mimeType: string
    storageKey?: string
    extractedText?: string | null
    parsedData?: NullableJsonNullValueInput | InputJsonValue
    parseStatus?: string
    parsedAt?: Date | string | null
    bulkUploadId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ResumeUncheckedCreateInput = {
    id?: string
    tenantId: string
    candidateId: string
    fileName: string
    originalFilename?: string | null
    fileSize: number
    mimeType: string
    storageKey?: string
    extractedText?: string | null
    parsedData?: NullableJsonNullValueInput | InputJsonValue
    parseStatus?: string
    parsedAt?: Date | string | null
    bulkUploadId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ResumeUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    fileName?: StringFieldUpdateOperationsInput | string
    originalFilename?: NullableStringFieldUpdateOperationsInput | string | null
    fileSize?: IntFieldUpdateOperationsInput | number
    mimeType?: StringFieldUpdateOperationsInput | string
    storageKey?: StringFieldUpdateOperationsInput | string
    extractedText?: NullableStringFieldUpdateOperationsInput | string | null
    parsedData?: NullableJsonNullValueInput | InputJsonValue
    parseStatus?: StringFieldUpdateOperationsInput | string
    parsedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    bulkUploadId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ResumeUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    fileName?: StringFieldUpdateOperationsInput | string
    originalFilename?: NullableStringFieldUpdateOperationsInput | string | null
    fileSize?: IntFieldUpdateOperationsInput | number
    mimeType?: StringFieldUpdateOperationsInput | string
    storageKey?: StringFieldUpdateOperationsInput | string
    extractedText?: NullableStringFieldUpdateOperationsInput | string | null
    parsedData?: NullableJsonNullValueInput | InputJsonValue
    parseStatus?: StringFieldUpdateOperationsInput | string
    parsedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    bulkUploadId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ResumeCreateManyInput = {
    id?: string
    tenantId: string
    candidateId: string
    fileName: string
    originalFilename?: string | null
    fileSize: number
    mimeType: string
    storageKey?: string
    extractedText?: string | null
    parsedData?: NullableJsonNullValueInput | InputJsonValue
    parseStatus?: string
    parsedAt?: Date | string | null
    bulkUploadId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ResumeUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    fileName?: StringFieldUpdateOperationsInput | string
    originalFilename?: NullableStringFieldUpdateOperationsInput | string | null
    fileSize?: IntFieldUpdateOperationsInput | number
    mimeType?: StringFieldUpdateOperationsInput | string
    storageKey?: StringFieldUpdateOperationsInput | string
    extractedText?: NullableStringFieldUpdateOperationsInput | string | null
    parsedData?: NullableJsonNullValueInput | InputJsonValue
    parseStatus?: StringFieldUpdateOperationsInput | string
    parsedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    bulkUploadId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ResumeUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    fileName?: StringFieldUpdateOperationsInput | string
    originalFilename?: NullableStringFieldUpdateOperationsInput | string | null
    fileSize?: IntFieldUpdateOperationsInput | number
    mimeType?: StringFieldUpdateOperationsInput | string
    storageKey?: StringFieldUpdateOperationsInput | string
    extractedText?: NullableStringFieldUpdateOperationsInput | string | null
    parsedData?: NullableJsonNullValueInput | InputJsonValue
    parseStatus?: StringFieldUpdateOperationsInput | string
    parsedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    bulkUploadId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BulkUploadCreateInput = {
    id?: string
    tenantId: string
    userId: string
    requisitionId?: string | null
    status?: $Enums.BulkUploadStatus
    phase?: string
    archiveName?: string | null
    totalFiles: number
    processedFiles?: number
    failedFiles?: number
    extractedCount?: number
    pendingCount?: number
    approvedCount?: number
    rejectedCount?: number
    committedCount?: number
    errors?: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    completedAt?: Date | string | null
  }

  export type BulkUploadUncheckedCreateInput = {
    id?: string
    tenantId: string
    userId: string
    requisitionId?: string | null
    status?: $Enums.BulkUploadStatus
    phase?: string
    archiveName?: string | null
    totalFiles: number
    processedFiles?: number
    failedFiles?: number
    extractedCount?: number
    pendingCount?: number
    approvedCount?: number
    rejectedCount?: number
    committedCount?: number
    errors?: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    completedAt?: Date | string | null
  }

  export type BulkUploadUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    requisitionId?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumBulkUploadStatusFieldUpdateOperationsInput | $Enums.BulkUploadStatus
    phase?: StringFieldUpdateOperationsInput | string
    archiveName?: NullableStringFieldUpdateOperationsInput | string | null
    totalFiles?: IntFieldUpdateOperationsInput | number
    processedFiles?: IntFieldUpdateOperationsInput | number
    failedFiles?: IntFieldUpdateOperationsInput | number
    extractedCount?: IntFieldUpdateOperationsInput | number
    pendingCount?: IntFieldUpdateOperationsInput | number
    approvedCount?: IntFieldUpdateOperationsInput | number
    rejectedCount?: IntFieldUpdateOperationsInput | number
    committedCount?: IntFieldUpdateOperationsInput | number
    errors?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type BulkUploadUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    requisitionId?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumBulkUploadStatusFieldUpdateOperationsInput | $Enums.BulkUploadStatus
    phase?: StringFieldUpdateOperationsInput | string
    archiveName?: NullableStringFieldUpdateOperationsInput | string | null
    totalFiles?: IntFieldUpdateOperationsInput | number
    processedFiles?: IntFieldUpdateOperationsInput | number
    failedFiles?: IntFieldUpdateOperationsInput | number
    extractedCount?: IntFieldUpdateOperationsInput | number
    pendingCount?: IntFieldUpdateOperationsInput | number
    approvedCount?: IntFieldUpdateOperationsInput | number
    rejectedCount?: IntFieldUpdateOperationsInput | number
    committedCount?: IntFieldUpdateOperationsInput | number
    errors?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type BulkUploadCreateManyInput = {
    id?: string
    tenantId: string
    userId: string
    requisitionId?: string | null
    status?: $Enums.BulkUploadStatus
    phase?: string
    archiveName?: string | null
    totalFiles: number
    processedFiles?: number
    failedFiles?: number
    extractedCount?: number
    pendingCount?: number
    approvedCount?: number
    rejectedCount?: number
    committedCount?: number
    errors?: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    completedAt?: Date | string | null
  }

  export type BulkUploadUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    requisitionId?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumBulkUploadStatusFieldUpdateOperationsInput | $Enums.BulkUploadStatus
    phase?: StringFieldUpdateOperationsInput | string
    archiveName?: NullableStringFieldUpdateOperationsInput | string | null
    totalFiles?: IntFieldUpdateOperationsInput | number
    processedFiles?: IntFieldUpdateOperationsInput | number
    failedFiles?: IntFieldUpdateOperationsInput | number
    extractedCount?: IntFieldUpdateOperationsInput | number
    pendingCount?: IntFieldUpdateOperationsInput | number
    approvedCount?: IntFieldUpdateOperationsInput | number
    rejectedCount?: IntFieldUpdateOperationsInput | number
    committedCount?: IntFieldUpdateOperationsInput | number
    errors?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type BulkUploadUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    requisitionId?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumBulkUploadStatusFieldUpdateOperationsInput | $Enums.BulkUploadStatus
    phase?: StringFieldUpdateOperationsInput | string
    archiveName?: NullableStringFieldUpdateOperationsInput | string | null
    totalFiles?: IntFieldUpdateOperationsInput | number
    processedFiles?: IntFieldUpdateOperationsInput | number
    failedFiles?: IntFieldUpdateOperationsInput | number
    extractedCount?: IntFieldUpdateOperationsInput | number
    pendingCount?: IntFieldUpdateOperationsInput | number
    approvedCount?: IntFieldUpdateOperationsInput | number
    rejectedCount?: IntFieldUpdateOperationsInput | number
    committedCount?: IntFieldUpdateOperationsInput | number
    errors?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type BulkImportItemCreateInput = {
    id?: string
    tenantId: string
    bulkUploadId: string
    fileName: string
    mimeType: string
    sizeBytes?: number
    detectedName?: string | null
    detectedEmail?: string | null
    textSnippet?: string | null
    extractedText?: string | null
    extractStatus?: string
    reviewStatus?: string
    candidateId?: string | null
    createdAt?: Date | string
  }

  export type BulkImportItemUncheckedCreateInput = {
    id?: string
    tenantId: string
    bulkUploadId: string
    fileName: string
    mimeType: string
    sizeBytes?: number
    detectedName?: string | null
    detectedEmail?: string | null
    textSnippet?: string | null
    extractedText?: string | null
    extractStatus?: string
    reviewStatus?: string
    candidateId?: string | null
    createdAt?: Date | string
  }

  export type BulkImportItemUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    bulkUploadId?: StringFieldUpdateOperationsInput | string
    fileName?: StringFieldUpdateOperationsInput | string
    mimeType?: StringFieldUpdateOperationsInput | string
    sizeBytes?: IntFieldUpdateOperationsInput | number
    detectedName?: NullableStringFieldUpdateOperationsInput | string | null
    detectedEmail?: NullableStringFieldUpdateOperationsInput | string | null
    textSnippet?: NullableStringFieldUpdateOperationsInput | string | null
    extractedText?: NullableStringFieldUpdateOperationsInput | string | null
    extractStatus?: StringFieldUpdateOperationsInput | string
    reviewStatus?: StringFieldUpdateOperationsInput | string
    candidateId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BulkImportItemUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    bulkUploadId?: StringFieldUpdateOperationsInput | string
    fileName?: StringFieldUpdateOperationsInput | string
    mimeType?: StringFieldUpdateOperationsInput | string
    sizeBytes?: IntFieldUpdateOperationsInput | number
    detectedName?: NullableStringFieldUpdateOperationsInput | string | null
    detectedEmail?: NullableStringFieldUpdateOperationsInput | string | null
    textSnippet?: NullableStringFieldUpdateOperationsInput | string | null
    extractedText?: NullableStringFieldUpdateOperationsInput | string | null
    extractStatus?: StringFieldUpdateOperationsInput | string
    reviewStatus?: StringFieldUpdateOperationsInput | string
    candidateId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BulkImportItemCreateManyInput = {
    id?: string
    tenantId: string
    bulkUploadId: string
    fileName: string
    mimeType: string
    sizeBytes?: number
    detectedName?: string | null
    detectedEmail?: string | null
    textSnippet?: string | null
    extractedText?: string | null
    extractStatus?: string
    reviewStatus?: string
    candidateId?: string | null
    createdAt?: Date | string
  }

  export type BulkImportItemUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    bulkUploadId?: StringFieldUpdateOperationsInput | string
    fileName?: StringFieldUpdateOperationsInput | string
    mimeType?: StringFieldUpdateOperationsInput | string
    sizeBytes?: IntFieldUpdateOperationsInput | number
    detectedName?: NullableStringFieldUpdateOperationsInput | string | null
    detectedEmail?: NullableStringFieldUpdateOperationsInput | string | null
    textSnippet?: NullableStringFieldUpdateOperationsInput | string | null
    extractedText?: NullableStringFieldUpdateOperationsInput | string | null
    extractStatus?: StringFieldUpdateOperationsInput | string
    reviewStatus?: StringFieldUpdateOperationsInput | string
    candidateId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BulkImportItemUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    bulkUploadId?: StringFieldUpdateOperationsInput | string
    fileName?: StringFieldUpdateOperationsInput | string
    mimeType?: StringFieldUpdateOperationsInput | string
    sizeBytes?: IntFieldUpdateOperationsInput | number
    detectedName?: NullableStringFieldUpdateOperationsInput | string | null
    detectedEmail?: NullableStringFieldUpdateOperationsInput | string | null
    textSnippet?: NullableStringFieldUpdateOperationsInput | string | null
    extractedText?: NullableStringFieldUpdateOperationsInput | string | null
    extractStatus?: StringFieldUpdateOperationsInput | string
    reviewStatus?: StringFieldUpdateOperationsInput | string
    candidateId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
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
    triggeredByUserId?: string | null
    errorMessage?: string | null
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
    triggeredByUserId?: string | null
    errorMessage?: string | null
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
    triggeredByUserId?: NullableStringFieldUpdateOperationsInput | string | null
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
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
    triggeredByUserId?: NullableStringFieldUpdateOperationsInput | string | null
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
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
    triggeredByUserId?: string | null
    errorMessage?: string | null
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
    triggeredByUserId?: NullableStringFieldUpdateOperationsInput | string | null
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
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
    triggeredByUserId?: NullableStringFieldUpdateOperationsInput | string | null
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
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
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
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

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type ResumeCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    candidateId?: SortOrder
    fileName?: SortOrder
    originalFilename?: SortOrder
    fileSize?: SortOrder
    mimeType?: SortOrder
    storageKey?: SortOrder
    extractedText?: SortOrder
    parsedData?: SortOrder
    parseStatus?: SortOrder
    parsedAt?: SortOrder
    bulkUploadId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ResumeAvgOrderByAggregateInput = {
    fileSize?: SortOrder
  }

  export type ResumeMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    candidateId?: SortOrder
    fileName?: SortOrder
    originalFilename?: SortOrder
    fileSize?: SortOrder
    mimeType?: SortOrder
    storageKey?: SortOrder
    extractedText?: SortOrder
    parseStatus?: SortOrder
    parsedAt?: SortOrder
    bulkUploadId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ResumeMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    candidateId?: SortOrder
    fileName?: SortOrder
    originalFilename?: SortOrder
    fileSize?: SortOrder
    mimeType?: SortOrder
    storageKey?: SortOrder
    extractedText?: SortOrder
    parseStatus?: SortOrder
    parsedAt?: SortOrder
    bulkUploadId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ResumeSumOrderByAggregateInput = {
    fileSize?: SortOrder
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
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
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
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
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

  export type EnumBulkUploadStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.BulkUploadStatus | EnumBulkUploadStatusFieldRefInput<$PrismaModel>
    in?: $Enums.BulkUploadStatus[] | ListEnumBulkUploadStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.BulkUploadStatus[] | ListEnumBulkUploadStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumBulkUploadStatusFilter<$PrismaModel> | $Enums.BulkUploadStatus
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

  export type BulkUploadCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    userId?: SortOrder
    requisitionId?: SortOrder
    status?: SortOrder
    phase?: SortOrder
    archiveName?: SortOrder
    totalFiles?: SortOrder
    processedFiles?: SortOrder
    failedFiles?: SortOrder
    extractedCount?: SortOrder
    pendingCount?: SortOrder
    approvedCount?: SortOrder
    rejectedCount?: SortOrder
    committedCount?: SortOrder
    errors?: SortOrder
    createdAt?: SortOrder
    completedAt?: SortOrder
  }

  export type BulkUploadAvgOrderByAggregateInput = {
    totalFiles?: SortOrder
    processedFiles?: SortOrder
    failedFiles?: SortOrder
    extractedCount?: SortOrder
    pendingCount?: SortOrder
    approvedCount?: SortOrder
    rejectedCount?: SortOrder
    committedCount?: SortOrder
  }

  export type BulkUploadMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    userId?: SortOrder
    requisitionId?: SortOrder
    status?: SortOrder
    phase?: SortOrder
    archiveName?: SortOrder
    totalFiles?: SortOrder
    processedFiles?: SortOrder
    failedFiles?: SortOrder
    extractedCount?: SortOrder
    pendingCount?: SortOrder
    approvedCount?: SortOrder
    rejectedCount?: SortOrder
    committedCount?: SortOrder
    createdAt?: SortOrder
    completedAt?: SortOrder
  }

  export type BulkUploadMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    userId?: SortOrder
    requisitionId?: SortOrder
    status?: SortOrder
    phase?: SortOrder
    archiveName?: SortOrder
    totalFiles?: SortOrder
    processedFiles?: SortOrder
    failedFiles?: SortOrder
    extractedCount?: SortOrder
    pendingCount?: SortOrder
    approvedCount?: SortOrder
    rejectedCount?: SortOrder
    committedCount?: SortOrder
    createdAt?: SortOrder
    completedAt?: SortOrder
  }

  export type BulkUploadSumOrderByAggregateInput = {
    totalFiles?: SortOrder
    processedFiles?: SortOrder
    failedFiles?: SortOrder
    extractedCount?: SortOrder
    pendingCount?: SortOrder
    approvedCount?: SortOrder
    rejectedCount?: SortOrder
    committedCount?: SortOrder
  }

  export type EnumBulkUploadStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.BulkUploadStatus | EnumBulkUploadStatusFieldRefInput<$PrismaModel>
    in?: $Enums.BulkUploadStatus[] | ListEnumBulkUploadStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.BulkUploadStatus[] | ListEnumBulkUploadStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumBulkUploadStatusWithAggregatesFilter<$PrismaModel> | $Enums.BulkUploadStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumBulkUploadStatusFilter<$PrismaModel>
    _max?: NestedEnumBulkUploadStatusFilter<$PrismaModel>
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

  export type BulkImportItemCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    bulkUploadId?: SortOrder
    fileName?: SortOrder
    mimeType?: SortOrder
    sizeBytes?: SortOrder
    detectedName?: SortOrder
    detectedEmail?: SortOrder
    textSnippet?: SortOrder
    extractedText?: SortOrder
    extractStatus?: SortOrder
    reviewStatus?: SortOrder
    candidateId?: SortOrder
    createdAt?: SortOrder
  }

  export type BulkImportItemAvgOrderByAggregateInput = {
    sizeBytes?: SortOrder
  }

  export type BulkImportItemMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    bulkUploadId?: SortOrder
    fileName?: SortOrder
    mimeType?: SortOrder
    sizeBytes?: SortOrder
    detectedName?: SortOrder
    detectedEmail?: SortOrder
    textSnippet?: SortOrder
    extractedText?: SortOrder
    extractStatus?: SortOrder
    reviewStatus?: SortOrder
    candidateId?: SortOrder
    createdAt?: SortOrder
  }

  export type BulkImportItemMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    bulkUploadId?: SortOrder
    fileName?: SortOrder
    mimeType?: SortOrder
    sizeBytes?: SortOrder
    detectedName?: SortOrder
    detectedEmail?: SortOrder
    textSnippet?: SortOrder
    extractedText?: SortOrder
    extractStatus?: SortOrder
    reviewStatus?: SortOrder
    candidateId?: SortOrder
    createdAt?: SortOrder
  }

  export type BulkImportItemSumOrderByAggregateInput = {
    sizeBytes?: SortOrder
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
    triggeredByUserId?: SortOrder
    errorMessage?: SortOrder
    createdAt?: SortOrder
  }

  export type AgentRunAvgOrderByAggregateInput = {
    tokensIn?: SortOrder
    tokensOut?: SortOrder
    costUsd?: SortOrder
    latencyMs?: SortOrder
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
    triggeredByUserId?: SortOrder
    errorMessage?: SortOrder
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
    triggeredByUserId?: SortOrder
    errorMessage?: SortOrder
    createdAt?: SortOrder
  }

  export type AgentRunSumOrderByAggregateInput = {
    tokensIn?: SortOrder
    tokensOut?: SortOrder
    costUsd?: SortOrder
    latencyMs?: SortOrder
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

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
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

  export type EnumBulkUploadStatusFieldUpdateOperationsInput = {
    set?: $Enums.BulkUploadStatus
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
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
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

  export type NestedEnumBulkUploadStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.BulkUploadStatus | EnumBulkUploadStatusFieldRefInput<$PrismaModel>
    in?: $Enums.BulkUploadStatus[] | ListEnumBulkUploadStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.BulkUploadStatus[] | ListEnumBulkUploadStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumBulkUploadStatusFilter<$PrismaModel> | $Enums.BulkUploadStatus
  }

  export type NestedEnumBulkUploadStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.BulkUploadStatus | EnumBulkUploadStatusFieldRefInput<$PrismaModel>
    in?: $Enums.BulkUploadStatus[] | ListEnumBulkUploadStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.BulkUploadStatus[] | ListEnumBulkUploadStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumBulkUploadStatusWithAggregatesFilter<$PrismaModel> | $Enums.BulkUploadStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumBulkUploadStatusFilter<$PrismaModel>
    _max?: NestedEnumBulkUploadStatusFilter<$PrismaModel>
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