
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
 * Model TenantPlanCache
 * 
 */
export type TenantPlanCache = $Result.DefaultSelection<Prisma.$TenantPlanCachePayload>
/**
 * Model AgentKillSwitch
 * 
 */
export type AgentKillSwitch = $Result.DefaultSelection<Prisma.$AgentKillSwitchPayload>
/**
 * Model AgentRunCost
 * 
 */
export type AgentRunCost = $Result.DefaultSelection<Prisma.$AgentRunCostPayload>
/**
 * Model FeatureFlag
 * 
 */
export type FeatureFlag = $Result.DefaultSelection<Prisma.$FeatureFlagPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more TenantPlanCaches
 * const tenantPlanCaches = await prisma.tenantPlanCache.findMany()
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
   * // Fetch zero or more TenantPlanCaches
   * const tenantPlanCaches = await prisma.tenantPlanCache.findMany()
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
   * `prisma.tenantPlanCache`: Exposes CRUD operations for the **TenantPlanCache** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TenantPlanCaches
    * const tenantPlanCaches = await prisma.tenantPlanCache.findMany()
    * ```
    */
  get tenantPlanCache(): Prisma.TenantPlanCacheDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.agentKillSwitch`: Exposes CRUD operations for the **AgentKillSwitch** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AgentKillSwitches
    * const agentKillSwitches = await prisma.agentKillSwitch.findMany()
    * ```
    */
  get agentKillSwitch(): Prisma.AgentKillSwitchDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.agentRunCost`: Exposes CRUD operations for the **AgentRunCost** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AgentRunCosts
    * const agentRunCosts = await prisma.agentRunCost.findMany()
    * ```
    */
  get agentRunCost(): Prisma.AgentRunCostDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.featureFlag`: Exposes CRUD operations for the **FeatureFlag** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more FeatureFlags
    * const featureFlags = await prisma.featureFlag.findMany()
    * ```
    */
  get featureFlag(): Prisma.FeatureFlagDelegate<ExtArgs, ClientOptions>;
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
    TenantPlanCache: 'TenantPlanCache',
    AgentKillSwitch: 'AgentKillSwitch',
    AgentRunCost: 'AgentRunCost',
    FeatureFlag: 'FeatureFlag'
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
      modelProps: "tenantPlanCache" | "agentKillSwitch" | "agentRunCost" | "featureFlag"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      TenantPlanCache: {
        payload: Prisma.$TenantPlanCachePayload<ExtArgs>
        fields: Prisma.TenantPlanCacheFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TenantPlanCacheFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPlanCachePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TenantPlanCacheFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPlanCachePayload>
          }
          findFirst: {
            args: Prisma.TenantPlanCacheFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPlanCachePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TenantPlanCacheFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPlanCachePayload>
          }
          findMany: {
            args: Prisma.TenantPlanCacheFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPlanCachePayload>[]
          }
          create: {
            args: Prisma.TenantPlanCacheCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPlanCachePayload>
          }
          createMany: {
            args: Prisma.TenantPlanCacheCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TenantPlanCacheCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPlanCachePayload>[]
          }
          delete: {
            args: Prisma.TenantPlanCacheDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPlanCachePayload>
          }
          update: {
            args: Prisma.TenantPlanCacheUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPlanCachePayload>
          }
          deleteMany: {
            args: Prisma.TenantPlanCacheDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TenantPlanCacheUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TenantPlanCacheUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPlanCachePayload>[]
          }
          upsert: {
            args: Prisma.TenantPlanCacheUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPlanCachePayload>
          }
          aggregate: {
            args: Prisma.TenantPlanCacheAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTenantPlanCache>
          }
          groupBy: {
            args: Prisma.TenantPlanCacheGroupByArgs<ExtArgs>
            result: $Utils.Optional<TenantPlanCacheGroupByOutputType>[]
          }
          count: {
            args: Prisma.TenantPlanCacheCountArgs<ExtArgs>
            result: $Utils.Optional<TenantPlanCacheCountAggregateOutputType> | number
          }
        }
      }
      AgentKillSwitch: {
        payload: Prisma.$AgentKillSwitchPayload<ExtArgs>
        fields: Prisma.AgentKillSwitchFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AgentKillSwitchFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentKillSwitchPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AgentKillSwitchFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentKillSwitchPayload>
          }
          findFirst: {
            args: Prisma.AgentKillSwitchFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentKillSwitchPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AgentKillSwitchFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentKillSwitchPayload>
          }
          findMany: {
            args: Prisma.AgentKillSwitchFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentKillSwitchPayload>[]
          }
          create: {
            args: Prisma.AgentKillSwitchCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentKillSwitchPayload>
          }
          createMany: {
            args: Prisma.AgentKillSwitchCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AgentKillSwitchCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentKillSwitchPayload>[]
          }
          delete: {
            args: Prisma.AgentKillSwitchDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentKillSwitchPayload>
          }
          update: {
            args: Prisma.AgentKillSwitchUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentKillSwitchPayload>
          }
          deleteMany: {
            args: Prisma.AgentKillSwitchDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AgentKillSwitchUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AgentKillSwitchUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentKillSwitchPayload>[]
          }
          upsert: {
            args: Prisma.AgentKillSwitchUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentKillSwitchPayload>
          }
          aggregate: {
            args: Prisma.AgentKillSwitchAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAgentKillSwitch>
          }
          groupBy: {
            args: Prisma.AgentKillSwitchGroupByArgs<ExtArgs>
            result: $Utils.Optional<AgentKillSwitchGroupByOutputType>[]
          }
          count: {
            args: Prisma.AgentKillSwitchCountArgs<ExtArgs>
            result: $Utils.Optional<AgentKillSwitchCountAggregateOutputType> | number
          }
        }
      }
      AgentRunCost: {
        payload: Prisma.$AgentRunCostPayload<ExtArgs>
        fields: Prisma.AgentRunCostFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AgentRunCostFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentRunCostPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AgentRunCostFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentRunCostPayload>
          }
          findFirst: {
            args: Prisma.AgentRunCostFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentRunCostPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AgentRunCostFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentRunCostPayload>
          }
          findMany: {
            args: Prisma.AgentRunCostFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentRunCostPayload>[]
          }
          create: {
            args: Prisma.AgentRunCostCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentRunCostPayload>
          }
          createMany: {
            args: Prisma.AgentRunCostCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AgentRunCostCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentRunCostPayload>[]
          }
          delete: {
            args: Prisma.AgentRunCostDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentRunCostPayload>
          }
          update: {
            args: Prisma.AgentRunCostUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentRunCostPayload>
          }
          deleteMany: {
            args: Prisma.AgentRunCostDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AgentRunCostUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AgentRunCostUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentRunCostPayload>[]
          }
          upsert: {
            args: Prisma.AgentRunCostUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentRunCostPayload>
          }
          aggregate: {
            args: Prisma.AgentRunCostAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAgentRunCost>
          }
          groupBy: {
            args: Prisma.AgentRunCostGroupByArgs<ExtArgs>
            result: $Utils.Optional<AgentRunCostGroupByOutputType>[]
          }
          count: {
            args: Prisma.AgentRunCostCountArgs<ExtArgs>
            result: $Utils.Optional<AgentRunCostCountAggregateOutputType> | number
          }
        }
      }
      FeatureFlag: {
        payload: Prisma.$FeatureFlagPayload<ExtArgs>
        fields: Prisma.FeatureFlagFieldRefs
        operations: {
          findUnique: {
            args: Prisma.FeatureFlagFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FeatureFlagPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.FeatureFlagFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FeatureFlagPayload>
          }
          findFirst: {
            args: Prisma.FeatureFlagFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FeatureFlagPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.FeatureFlagFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FeatureFlagPayload>
          }
          findMany: {
            args: Prisma.FeatureFlagFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FeatureFlagPayload>[]
          }
          create: {
            args: Prisma.FeatureFlagCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FeatureFlagPayload>
          }
          createMany: {
            args: Prisma.FeatureFlagCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.FeatureFlagCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FeatureFlagPayload>[]
          }
          delete: {
            args: Prisma.FeatureFlagDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FeatureFlagPayload>
          }
          update: {
            args: Prisma.FeatureFlagUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FeatureFlagPayload>
          }
          deleteMany: {
            args: Prisma.FeatureFlagDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.FeatureFlagUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.FeatureFlagUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FeatureFlagPayload>[]
          }
          upsert: {
            args: Prisma.FeatureFlagUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FeatureFlagPayload>
          }
          aggregate: {
            args: Prisma.FeatureFlagAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateFeatureFlag>
          }
          groupBy: {
            args: Prisma.FeatureFlagGroupByArgs<ExtArgs>
            result: $Utils.Optional<FeatureFlagGroupByOutputType>[]
          }
          count: {
            args: Prisma.FeatureFlagCountArgs<ExtArgs>
            result: $Utils.Optional<FeatureFlagCountAggregateOutputType> | number
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
    tenantPlanCache?: TenantPlanCacheOmit
    agentKillSwitch?: AgentKillSwitchOmit
    agentRunCost?: AgentRunCostOmit
    featureFlag?: FeatureFlagOmit
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
   * Model TenantPlanCache
   */

  export type AggregateTenantPlanCache = {
    _count: TenantPlanCacheCountAggregateOutputType | null
    _min: TenantPlanCacheMinAggregateOutputType | null
    _max: TenantPlanCacheMaxAggregateOutputType | null
  }

  export type TenantPlanCacheMinAggregateOutputType = {
    tenantId: string | null
    plan: string | null
    updatedAt: Date | null
  }

  export type TenantPlanCacheMaxAggregateOutputType = {
    tenantId: string | null
    plan: string | null
    updatedAt: Date | null
  }

  export type TenantPlanCacheCountAggregateOutputType = {
    tenantId: number
    plan: number
    updatedAt: number
    _all: number
  }


  export type TenantPlanCacheMinAggregateInputType = {
    tenantId?: true
    plan?: true
    updatedAt?: true
  }

  export type TenantPlanCacheMaxAggregateInputType = {
    tenantId?: true
    plan?: true
    updatedAt?: true
  }

  export type TenantPlanCacheCountAggregateInputType = {
    tenantId?: true
    plan?: true
    updatedAt?: true
    _all?: true
  }

  export type TenantPlanCacheAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TenantPlanCache to aggregate.
     */
    where?: TenantPlanCacheWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantPlanCaches to fetch.
     */
    orderBy?: TenantPlanCacheOrderByWithRelationInput | TenantPlanCacheOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TenantPlanCacheWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantPlanCaches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantPlanCaches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TenantPlanCaches
    **/
    _count?: true | TenantPlanCacheCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TenantPlanCacheMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TenantPlanCacheMaxAggregateInputType
  }

  export type GetTenantPlanCacheAggregateType<T extends TenantPlanCacheAggregateArgs> = {
        [P in keyof T & keyof AggregateTenantPlanCache]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTenantPlanCache[P]>
      : GetScalarType<T[P], AggregateTenantPlanCache[P]>
  }




  export type TenantPlanCacheGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TenantPlanCacheWhereInput
    orderBy?: TenantPlanCacheOrderByWithAggregationInput | TenantPlanCacheOrderByWithAggregationInput[]
    by: TenantPlanCacheScalarFieldEnum[] | TenantPlanCacheScalarFieldEnum
    having?: TenantPlanCacheScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TenantPlanCacheCountAggregateInputType | true
    _min?: TenantPlanCacheMinAggregateInputType
    _max?: TenantPlanCacheMaxAggregateInputType
  }

  export type TenantPlanCacheGroupByOutputType = {
    tenantId: string
    plan: string
    updatedAt: Date
    _count: TenantPlanCacheCountAggregateOutputType | null
    _min: TenantPlanCacheMinAggregateOutputType | null
    _max: TenantPlanCacheMaxAggregateOutputType | null
  }

  type GetTenantPlanCacheGroupByPayload<T extends TenantPlanCacheGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TenantPlanCacheGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TenantPlanCacheGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TenantPlanCacheGroupByOutputType[P]>
            : GetScalarType<T[P], TenantPlanCacheGroupByOutputType[P]>
        }
      >
    >


  export type TenantPlanCacheSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    tenantId?: boolean
    plan?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["tenantPlanCache"]>

  export type TenantPlanCacheSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    tenantId?: boolean
    plan?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["tenantPlanCache"]>

  export type TenantPlanCacheSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    tenantId?: boolean
    plan?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["tenantPlanCache"]>

  export type TenantPlanCacheSelectScalar = {
    tenantId?: boolean
    plan?: boolean
    updatedAt?: boolean
  }

  export type TenantPlanCacheOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"tenantId" | "plan" | "updatedAt", ExtArgs["result"]["tenantPlanCache"]>

  export type $TenantPlanCachePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TenantPlanCache"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      tenantId: string
      plan: string
      updatedAt: Date
    }, ExtArgs["result"]["tenantPlanCache"]>
    composites: {}
  }

  type TenantPlanCacheGetPayload<S extends boolean | null | undefined | TenantPlanCacheDefaultArgs> = $Result.GetResult<Prisma.$TenantPlanCachePayload, S>

  type TenantPlanCacheCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TenantPlanCacheFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TenantPlanCacheCountAggregateInputType | true
    }

  export interface TenantPlanCacheDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TenantPlanCache'], meta: { name: 'TenantPlanCache' } }
    /**
     * Find zero or one TenantPlanCache that matches the filter.
     * @param {TenantPlanCacheFindUniqueArgs} args - Arguments to find a TenantPlanCache
     * @example
     * // Get one TenantPlanCache
     * const tenantPlanCache = await prisma.tenantPlanCache.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TenantPlanCacheFindUniqueArgs>(args: SelectSubset<T, TenantPlanCacheFindUniqueArgs<ExtArgs>>): Prisma__TenantPlanCacheClient<$Result.GetResult<Prisma.$TenantPlanCachePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one TenantPlanCache that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TenantPlanCacheFindUniqueOrThrowArgs} args - Arguments to find a TenantPlanCache
     * @example
     * // Get one TenantPlanCache
     * const tenantPlanCache = await prisma.tenantPlanCache.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TenantPlanCacheFindUniqueOrThrowArgs>(args: SelectSubset<T, TenantPlanCacheFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TenantPlanCacheClient<$Result.GetResult<Prisma.$TenantPlanCachePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TenantPlanCache that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantPlanCacheFindFirstArgs} args - Arguments to find a TenantPlanCache
     * @example
     * // Get one TenantPlanCache
     * const tenantPlanCache = await prisma.tenantPlanCache.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TenantPlanCacheFindFirstArgs>(args?: SelectSubset<T, TenantPlanCacheFindFirstArgs<ExtArgs>>): Prisma__TenantPlanCacheClient<$Result.GetResult<Prisma.$TenantPlanCachePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TenantPlanCache that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantPlanCacheFindFirstOrThrowArgs} args - Arguments to find a TenantPlanCache
     * @example
     * // Get one TenantPlanCache
     * const tenantPlanCache = await prisma.tenantPlanCache.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TenantPlanCacheFindFirstOrThrowArgs>(args?: SelectSubset<T, TenantPlanCacheFindFirstOrThrowArgs<ExtArgs>>): Prisma__TenantPlanCacheClient<$Result.GetResult<Prisma.$TenantPlanCachePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more TenantPlanCaches that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantPlanCacheFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TenantPlanCaches
     * const tenantPlanCaches = await prisma.tenantPlanCache.findMany()
     * 
     * // Get first 10 TenantPlanCaches
     * const tenantPlanCaches = await prisma.tenantPlanCache.findMany({ take: 10 })
     * 
     * // Only select the `tenantId`
     * const tenantPlanCacheWithTenantIdOnly = await prisma.tenantPlanCache.findMany({ select: { tenantId: true } })
     * 
     */
    findMany<T extends TenantPlanCacheFindManyArgs>(args?: SelectSubset<T, TenantPlanCacheFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantPlanCachePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a TenantPlanCache.
     * @param {TenantPlanCacheCreateArgs} args - Arguments to create a TenantPlanCache.
     * @example
     * // Create one TenantPlanCache
     * const TenantPlanCache = await prisma.tenantPlanCache.create({
     *   data: {
     *     // ... data to create a TenantPlanCache
     *   }
     * })
     * 
     */
    create<T extends TenantPlanCacheCreateArgs>(args: SelectSubset<T, TenantPlanCacheCreateArgs<ExtArgs>>): Prisma__TenantPlanCacheClient<$Result.GetResult<Prisma.$TenantPlanCachePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many TenantPlanCaches.
     * @param {TenantPlanCacheCreateManyArgs} args - Arguments to create many TenantPlanCaches.
     * @example
     * // Create many TenantPlanCaches
     * const tenantPlanCache = await prisma.tenantPlanCache.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TenantPlanCacheCreateManyArgs>(args?: SelectSubset<T, TenantPlanCacheCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TenantPlanCaches and returns the data saved in the database.
     * @param {TenantPlanCacheCreateManyAndReturnArgs} args - Arguments to create many TenantPlanCaches.
     * @example
     * // Create many TenantPlanCaches
     * const tenantPlanCache = await prisma.tenantPlanCache.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TenantPlanCaches and only return the `tenantId`
     * const tenantPlanCacheWithTenantIdOnly = await prisma.tenantPlanCache.createManyAndReturn({
     *   select: { tenantId: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TenantPlanCacheCreateManyAndReturnArgs>(args?: SelectSubset<T, TenantPlanCacheCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantPlanCachePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a TenantPlanCache.
     * @param {TenantPlanCacheDeleteArgs} args - Arguments to delete one TenantPlanCache.
     * @example
     * // Delete one TenantPlanCache
     * const TenantPlanCache = await prisma.tenantPlanCache.delete({
     *   where: {
     *     // ... filter to delete one TenantPlanCache
     *   }
     * })
     * 
     */
    delete<T extends TenantPlanCacheDeleteArgs>(args: SelectSubset<T, TenantPlanCacheDeleteArgs<ExtArgs>>): Prisma__TenantPlanCacheClient<$Result.GetResult<Prisma.$TenantPlanCachePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one TenantPlanCache.
     * @param {TenantPlanCacheUpdateArgs} args - Arguments to update one TenantPlanCache.
     * @example
     * // Update one TenantPlanCache
     * const tenantPlanCache = await prisma.tenantPlanCache.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TenantPlanCacheUpdateArgs>(args: SelectSubset<T, TenantPlanCacheUpdateArgs<ExtArgs>>): Prisma__TenantPlanCacheClient<$Result.GetResult<Prisma.$TenantPlanCachePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more TenantPlanCaches.
     * @param {TenantPlanCacheDeleteManyArgs} args - Arguments to filter TenantPlanCaches to delete.
     * @example
     * // Delete a few TenantPlanCaches
     * const { count } = await prisma.tenantPlanCache.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TenantPlanCacheDeleteManyArgs>(args?: SelectSubset<T, TenantPlanCacheDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TenantPlanCaches.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantPlanCacheUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TenantPlanCaches
     * const tenantPlanCache = await prisma.tenantPlanCache.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TenantPlanCacheUpdateManyArgs>(args: SelectSubset<T, TenantPlanCacheUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TenantPlanCaches and returns the data updated in the database.
     * @param {TenantPlanCacheUpdateManyAndReturnArgs} args - Arguments to update many TenantPlanCaches.
     * @example
     * // Update many TenantPlanCaches
     * const tenantPlanCache = await prisma.tenantPlanCache.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more TenantPlanCaches and only return the `tenantId`
     * const tenantPlanCacheWithTenantIdOnly = await prisma.tenantPlanCache.updateManyAndReturn({
     *   select: { tenantId: true },
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
    updateManyAndReturn<T extends TenantPlanCacheUpdateManyAndReturnArgs>(args: SelectSubset<T, TenantPlanCacheUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantPlanCachePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one TenantPlanCache.
     * @param {TenantPlanCacheUpsertArgs} args - Arguments to update or create a TenantPlanCache.
     * @example
     * // Update or create a TenantPlanCache
     * const tenantPlanCache = await prisma.tenantPlanCache.upsert({
     *   create: {
     *     // ... data to create a TenantPlanCache
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TenantPlanCache we want to update
     *   }
     * })
     */
    upsert<T extends TenantPlanCacheUpsertArgs>(args: SelectSubset<T, TenantPlanCacheUpsertArgs<ExtArgs>>): Prisma__TenantPlanCacheClient<$Result.GetResult<Prisma.$TenantPlanCachePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of TenantPlanCaches.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantPlanCacheCountArgs} args - Arguments to filter TenantPlanCaches to count.
     * @example
     * // Count the number of TenantPlanCaches
     * const count = await prisma.tenantPlanCache.count({
     *   where: {
     *     // ... the filter for the TenantPlanCaches we want to count
     *   }
     * })
    **/
    count<T extends TenantPlanCacheCountArgs>(
      args?: Subset<T, TenantPlanCacheCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TenantPlanCacheCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TenantPlanCache.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantPlanCacheAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends TenantPlanCacheAggregateArgs>(args: Subset<T, TenantPlanCacheAggregateArgs>): Prisma.PrismaPromise<GetTenantPlanCacheAggregateType<T>>

    /**
     * Group by TenantPlanCache.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantPlanCacheGroupByArgs} args - Group by arguments.
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
      T extends TenantPlanCacheGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TenantPlanCacheGroupByArgs['orderBy'] }
        : { orderBy?: TenantPlanCacheGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, TenantPlanCacheGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTenantPlanCacheGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TenantPlanCache model
   */
  readonly fields: TenantPlanCacheFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TenantPlanCache.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TenantPlanCacheClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the TenantPlanCache model
   */
  interface TenantPlanCacheFieldRefs {
    readonly tenantId: FieldRef<"TenantPlanCache", 'String'>
    readonly plan: FieldRef<"TenantPlanCache", 'String'>
    readonly updatedAt: FieldRef<"TenantPlanCache", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * TenantPlanCache findUnique
   */
  export type TenantPlanCacheFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantPlanCache
     */
    select?: TenantPlanCacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantPlanCache
     */
    omit?: TenantPlanCacheOmit<ExtArgs> | null
    /**
     * Filter, which TenantPlanCache to fetch.
     */
    where: TenantPlanCacheWhereUniqueInput
  }

  /**
   * TenantPlanCache findUniqueOrThrow
   */
  export type TenantPlanCacheFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantPlanCache
     */
    select?: TenantPlanCacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantPlanCache
     */
    omit?: TenantPlanCacheOmit<ExtArgs> | null
    /**
     * Filter, which TenantPlanCache to fetch.
     */
    where: TenantPlanCacheWhereUniqueInput
  }

  /**
   * TenantPlanCache findFirst
   */
  export type TenantPlanCacheFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantPlanCache
     */
    select?: TenantPlanCacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantPlanCache
     */
    omit?: TenantPlanCacheOmit<ExtArgs> | null
    /**
     * Filter, which TenantPlanCache to fetch.
     */
    where?: TenantPlanCacheWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantPlanCaches to fetch.
     */
    orderBy?: TenantPlanCacheOrderByWithRelationInput | TenantPlanCacheOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TenantPlanCaches.
     */
    cursor?: TenantPlanCacheWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantPlanCaches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantPlanCaches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TenantPlanCaches.
     */
    distinct?: TenantPlanCacheScalarFieldEnum | TenantPlanCacheScalarFieldEnum[]
  }

  /**
   * TenantPlanCache findFirstOrThrow
   */
  export type TenantPlanCacheFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantPlanCache
     */
    select?: TenantPlanCacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantPlanCache
     */
    omit?: TenantPlanCacheOmit<ExtArgs> | null
    /**
     * Filter, which TenantPlanCache to fetch.
     */
    where?: TenantPlanCacheWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantPlanCaches to fetch.
     */
    orderBy?: TenantPlanCacheOrderByWithRelationInput | TenantPlanCacheOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TenantPlanCaches.
     */
    cursor?: TenantPlanCacheWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantPlanCaches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantPlanCaches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TenantPlanCaches.
     */
    distinct?: TenantPlanCacheScalarFieldEnum | TenantPlanCacheScalarFieldEnum[]
  }

  /**
   * TenantPlanCache findMany
   */
  export type TenantPlanCacheFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantPlanCache
     */
    select?: TenantPlanCacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantPlanCache
     */
    omit?: TenantPlanCacheOmit<ExtArgs> | null
    /**
     * Filter, which TenantPlanCaches to fetch.
     */
    where?: TenantPlanCacheWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantPlanCaches to fetch.
     */
    orderBy?: TenantPlanCacheOrderByWithRelationInput | TenantPlanCacheOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TenantPlanCaches.
     */
    cursor?: TenantPlanCacheWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantPlanCaches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantPlanCaches.
     */
    skip?: number
    distinct?: TenantPlanCacheScalarFieldEnum | TenantPlanCacheScalarFieldEnum[]
  }

  /**
   * TenantPlanCache create
   */
  export type TenantPlanCacheCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantPlanCache
     */
    select?: TenantPlanCacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantPlanCache
     */
    omit?: TenantPlanCacheOmit<ExtArgs> | null
    /**
     * The data needed to create a TenantPlanCache.
     */
    data: XOR<TenantPlanCacheCreateInput, TenantPlanCacheUncheckedCreateInput>
  }

  /**
   * TenantPlanCache createMany
   */
  export type TenantPlanCacheCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TenantPlanCaches.
     */
    data: TenantPlanCacheCreateManyInput | TenantPlanCacheCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TenantPlanCache createManyAndReturn
   */
  export type TenantPlanCacheCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantPlanCache
     */
    select?: TenantPlanCacheSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TenantPlanCache
     */
    omit?: TenantPlanCacheOmit<ExtArgs> | null
    /**
     * The data used to create many TenantPlanCaches.
     */
    data: TenantPlanCacheCreateManyInput | TenantPlanCacheCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TenantPlanCache update
   */
  export type TenantPlanCacheUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantPlanCache
     */
    select?: TenantPlanCacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantPlanCache
     */
    omit?: TenantPlanCacheOmit<ExtArgs> | null
    /**
     * The data needed to update a TenantPlanCache.
     */
    data: XOR<TenantPlanCacheUpdateInput, TenantPlanCacheUncheckedUpdateInput>
    /**
     * Choose, which TenantPlanCache to update.
     */
    where: TenantPlanCacheWhereUniqueInput
  }

  /**
   * TenantPlanCache updateMany
   */
  export type TenantPlanCacheUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TenantPlanCaches.
     */
    data: XOR<TenantPlanCacheUpdateManyMutationInput, TenantPlanCacheUncheckedUpdateManyInput>
    /**
     * Filter which TenantPlanCaches to update
     */
    where?: TenantPlanCacheWhereInput
    /**
     * Limit how many TenantPlanCaches to update.
     */
    limit?: number
  }

  /**
   * TenantPlanCache updateManyAndReturn
   */
  export type TenantPlanCacheUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantPlanCache
     */
    select?: TenantPlanCacheSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TenantPlanCache
     */
    omit?: TenantPlanCacheOmit<ExtArgs> | null
    /**
     * The data used to update TenantPlanCaches.
     */
    data: XOR<TenantPlanCacheUpdateManyMutationInput, TenantPlanCacheUncheckedUpdateManyInput>
    /**
     * Filter which TenantPlanCaches to update
     */
    where?: TenantPlanCacheWhereInput
    /**
     * Limit how many TenantPlanCaches to update.
     */
    limit?: number
  }

  /**
   * TenantPlanCache upsert
   */
  export type TenantPlanCacheUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantPlanCache
     */
    select?: TenantPlanCacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantPlanCache
     */
    omit?: TenantPlanCacheOmit<ExtArgs> | null
    /**
     * The filter to search for the TenantPlanCache to update in case it exists.
     */
    where: TenantPlanCacheWhereUniqueInput
    /**
     * In case the TenantPlanCache found by the `where` argument doesn't exist, create a new TenantPlanCache with this data.
     */
    create: XOR<TenantPlanCacheCreateInput, TenantPlanCacheUncheckedCreateInput>
    /**
     * In case the TenantPlanCache was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TenantPlanCacheUpdateInput, TenantPlanCacheUncheckedUpdateInput>
  }

  /**
   * TenantPlanCache delete
   */
  export type TenantPlanCacheDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantPlanCache
     */
    select?: TenantPlanCacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantPlanCache
     */
    omit?: TenantPlanCacheOmit<ExtArgs> | null
    /**
     * Filter which TenantPlanCache to delete.
     */
    where: TenantPlanCacheWhereUniqueInput
  }

  /**
   * TenantPlanCache deleteMany
   */
  export type TenantPlanCacheDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TenantPlanCaches to delete
     */
    where?: TenantPlanCacheWhereInput
    /**
     * Limit how many TenantPlanCaches to delete.
     */
    limit?: number
  }

  /**
   * TenantPlanCache without action
   */
  export type TenantPlanCacheDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantPlanCache
     */
    select?: TenantPlanCacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantPlanCache
     */
    omit?: TenantPlanCacheOmit<ExtArgs> | null
  }


  /**
   * Model AgentKillSwitch
   */

  export type AggregateAgentKillSwitch = {
    _count: AgentKillSwitchCountAggregateOutputType | null
    _min: AgentKillSwitchMinAggregateOutputType | null
    _max: AgentKillSwitchMaxAggregateOutputType | null
  }

  export type AgentKillSwitchMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    agentType: string | null
    disabled: boolean | null
    reason: string | null
    updatedAt: Date | null
  }

  export type AgentKillSwitchMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    agentType: string | null
    disabled: boolean | null
    reason: string | null
    updatedAt: Date | null
  }

  export type AgentKillSwitchCountAggregateOutputType = {
    id: number
    tenantId: number
    agentType: number
    disabled: number
    reason: number
    updatedAt: number
    _all: number
  }


  export type AgentKillSwitchMinAggregateInputType = {
    id?: true
    tenantId?: true
    agentType?: true
    disabled?: true
    reason?: true
    updatedAt?: true
  }

  export type AgentKillSwitchMaxAggregateInputType = {
    id?: true
    tenantId?: true
    agentType?: true
    disabled?: true
    reason?: true
    updatedAt?: true
  }

  export type AgentKillSwitchCountAggregateInputType = {
    id?: true
    tenantId?: true
    agentType?: true
    disabled?: true
    reason?: true
    updatedAt?: true
    _all?: true
  }

  export type AgentKillSwitchAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AgentKillSwitch to aggregate.
     */
    where?: AgentKillSwitchWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AgentKillSwitches to fetch.
     */
    orderBy?: AgentKillSwitchOrderByWithRelationInput | AgentKillSwitchOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AgentKillSwitchWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AgentKillSwitches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AgentKillSwitches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AgentKillSwitches
    **/
    _count?: true | AgentKillSwitchCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AgentKillSwitchMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AgentKillSwitchMaxAggregateInputType
  }

  export type GetAgentKillSwitchAggregateType<T extends AgentKillSwitchAggregateArgs> = {
        [P in keyof T & keyof AggregateAgentKillSwitch]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAgentKillSwitch[P]>
      : GetScalarType<T[P], AggregateAgentKillSwitch[P]>
  }




  export type AgentKillSwitchGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AgentKillSwitchWhereInput
    orderBy?: AgentKillSwitchOrderByWithAggregationInput | AgentKillSwitchOrderByWithAggregationInput[]
    by: AgentKillSwitchScalarFieldEnum[] | AgentKillSwitchScalarFieldEnum
    having?: AgentKillSwitchScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AgentKillSwitchCountAggregateInputType | true
    _min?: AgentKillSwitchMinAggregateInputType
    _max?: AgentKillSwitchMaxAggregateInputType
  }

  export type AgentKillSwitchGroupByOutputType = {
    id: string
    tenantId: string
    agentType: string
    disabled: boolean
    reason: string | null
    updatedAt: Date
    _count: AgentKillSwitchCountAggregateOutputType | null
    _min: AgentKillSwitchMinAggregateOutputType | null
    _max: AgentKillSwitchMaxAggregateOutputType | null
  }

  type GetAgentKillSwitchGroupByPayload<T extends AgentKillSwitchGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AgentKillSwitchGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AgentKillSwitchGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AgentKillSwitchGroupByOutputType[P]>
            : GetScalarType<T[P], AgentKillSwitchGroupByOutputType[P]>
        }
      >
    >


  export type AgentKillSwitchSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    agentType?: boolean
    disabled?: boolean
    reason?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["agentKillSwitch"]>

  export type AgentKillSwitchSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    agentType?: boolean
    disabled?: boolean
    reason?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["agentKillSwitch"]>

  export type AgentKillSwitchSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    agentType?: boolean
    disabled?: boolean
    reason?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["agentKillSwitch"]>

  export type AgentKillSwitchSelectScalar = {
    id?: boolean
    tenantId?: boolean
    agentType?: boolean
    disabled?: boolean
    reason?: boolean
    updatedAt?: boolean
  }

  export type AgentKillSwitchOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "agentType" | "disabled" | "reason" | "updatedAt", ExtArgs["result"]["agentKillSwitch"]>

  export type $AgentKillSwitchPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AgentKillSwitch"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      agentType: string
      disabled: boolean
      reason: string | null
      updatedAt: Date
    }, ExtArgs["result"]["agentKillSwitch"]>
    composites: {}
  }

  type AgentKillSwitchGetPayload<S extends boolean | null | undefined | AgentKillSwitchDefaultArgs> = $Result.GetResult<Prisma.$AgentKillSwitchPayload, S>

  type AgentKillSwitchCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AgentKillSwitchFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AgentKillSwitchCountAggregateInputType | true
    }

  export interface AgentKillSwitchDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AgentKillSwitch'], meta: { name: 'AgentKillSwitch' } }
    /**
     * Find zero or one AgentKillSwitch that matches the filter.
     * @param {AgentKillSwitchFindUniqueArgs} args - Arguments to find a AgentKillSwitch
     * @example
     * // Get one AgentKillSwitch
     * const agentKillSwitch = await prisma.agentKillSwitch.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AgentKillSwitchFindUniqueArgs>(args: SelectSubset<T, AgentKillSwitchFindUniqueArgs<ExtArgs>>): Prisma__AgentKillSwitchClient<$Result.GetResult<Prisma.$AgentKillSwitchPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AgentKillSwitch that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AgentKillSwitchFindUniqueOrThrowArgs} args - Arguments to find a AgentKillSwitch
     * @example
     * // Get one AgentKillSwitch
     * const agentKillSwitch = await prisma.agentKillSwitch.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AgentKillSwitchFindUniqueOrThrowArgs>(args: SelectSubset<T, AgentKillSwitchFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AgentKillSwitchClient<$Result.GetResult<Prisma.$AgentKillSwitchPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AgentKillSwitch that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentKillSwitchFindFirstArgs} args - Arguments to find a AgentKillSwitch
     * @example
     * // Get one AgentKillSwitch
     * const agentKillSwitch = await prisma.agentKillSwitch.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AgentKillSwitchFindFirstArgs>(args?: SelectSubset<T, AgentKillSwitchFindFirstArgs<ExtArgs>>): Prisma__AgentKillSwitchClient<$Result.GetResult<Prisma.$AgentKillSwitchPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AgentKillSwitch that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentKillSwitchFindFirstOrThrowArgs} args - Arguments to find a AgentKillSwitch
     * @example
     * // Get one AgentKillSwitch
     * const agentKillSwitch = await prisma.agentKillSwitch.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AgentKillSwitchFindFirstOrThrowArgs>(args?: SelectSubset<T, AgentKillSwitchFindFirstOrThrowArgs<ExtArgs>>): Prisma__AgentKillSwitchClient<$Result.GetResult<Prisma.$AgentKillSwitchPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AgentKillSwitches that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentKillSwitchFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AgentKillSwitches
     * const agentKillSwitches = await prisma.agentKillSwitch.findMany()
     * 
     * // Get first 10 AgentKillSwitches
     * const agentKillSwitches = await prisma.agentKillSwitch.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const agentKillSwitchWithIdOnly = await prisma.agentKillSwitch.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AgentKillSwitchFindManyArgs>(args?: SelectSubset<T, AgentKillSwitchFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AgentKillSwitchPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AgentKillSwitch.
     * @param {AgentKillSwitchCreateArgs} args - Arguments to create a AgentKillSwitch.
     * @example
     * // Create one AgentKillSwitch
     * const AgentKillSwitch = await prisma.agentKillSwitch.create({
     *   data: {
     *     // ... data to create a AgentKillSwitch
     *   }
     * })
     * 
     */
    create<T extends AgentKillSwitchCreateArgs>(args: SelectSubset<T, AgentKillSwitchCreateArgs<ExtArgs>>): Prisma__AgentKillSwitchClient<$Result.GetResult<Prisma.$AgentKillSwitchPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AgentKillSwitches.
     * @param {AgentKillSwitchCreateManyArgs} args - Arguments to create many AgentKillSwitches.
     * @example
     * // Create many AgentKillSwitches
     * const agentKillSwitch = await prisma.agentKillSwitch.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AgentKillSwitchCreateManyArgs>(args?: SelectSubset<T, AgentKillSwitchCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AgentKillSwitches and returns the data saved in the database.
     * @param {AgentKillSwitchCreateManyAndReturnArgs} args - Arguments to create many AgentKillSwitches.
     * @example
     * // Create many AgentKillSwitches
     * const agentKillSwitch = await prisma.agentKillSwitch.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AgentKillSwitches and only return the `id`
     * const agentKillSwitchWithIdOnly = await prisma.agentKillSwitch.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AgentKillSwitchCreateManyAndReturnArgs>(args?: SelectSubset<T, AgentKillSwitchCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AgentKillSwitchPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a AgentKillSwitch.
     * @param {AgentKillSwitchDeleteArgs} args - Arguments to delete one AgentKillSwitch.
     * @example
     * // Delete one AgentKillSwitch
     * const AgentKillSwitch = await prisma.agentKillSwitch.delete({
     *   where: {
     *     // ... filter to delete one AgentKillSwitch
     *   }
     * })
     * 
     */
    delete<T extends AgentKillSwitchDeleteArgs>(args: SelectSubset<T, AgentKillSwitchDeleteArgs<ExtArgs>>): Prisma__AgentKillSwitchClient<$Result.GetResult<Prisma.$AgentKillSwitchPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AgentKillSwitch.
     * @param {AgentKillSwitchUpdateArgs} args - Arguments to update one AgentKillSwitch.
     * @example
     * // Update one AgentKillSwitch
     * const agentKillSwitch = await prisma.agentKillSwitch.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AgentKillSwitchUpdateArgs>(args: SelectSubset<T, AgentKillSwitchUpdateArgs<ExtArgs>>): Prisma__AgentKillSwitchClient<$Result.GetResult<Prisma.$AgentKillSwitchPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AgentKillSwitches.
     * @param {AgentKillSwitchDeleteManyArgs} args - Arguments to filter AgentKillSwitches to delete.
     * @example
     * // Delete a few AgentKillSwitches
     * const { count } = await prisma.agentKillSwitch.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AgentKillSwitchDeleteManyArgs>(args?: SelectSubset<T, AgentKillSwitchDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AgentKillSwitches.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentKillSwitchUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AgentKillSwitches
     * const agentKillSwitch = await prisma.agentKillSwitch.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AgentKillSwitchUpdateManyArgs>(args: SelectSubset<T, AgentKillSwitchUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AgentKillSwitches and returns the data updated in the database.
     * @param {AgentKillSwitchUpdateManyAndReturnArgs} args - Arguments to update many AgentKillSwitches.
     * @example
     * // Update many AgentKillSwitches
     * const agentKillSwitch = await prisma.agentKillSwitch.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more AgentKillSwitches and only return the `id`
     * const agentKillSwitchWithIdOnly = await prisma.agentKillSwitch.updateManyAndReturn({
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
    updateManyAndReturn<T extends AgentKillSwitchUpdateManyAndReturnArgs>(args: SelectSubset<T, AgentKillSwitchUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AgentKillSwitchPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one AgentKillSwitch.
     * @param {AgentKillSwitchUpsertArgs} args - Arguments to update or create a AgentKillSwitch.
     * @example
     * // Update or create a AgentKillSwitch
     * const agentKillSwitch = await prisma.agentKillSwitch.upsert({
     *   create: {
     *     // ... data to create a AgentKillSwitch
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AgentKillSwitch we want to update
     *   }
     * })
     */
    upsert<T extends AgentKillSwitchUpsertArgs>(args: SelectSubset<T, AgentKillSwitchUpsertArgs<ExtArgs>>): Prisma__AgentKillSwitchClient<$Result.GetResult<Prisma.$AgentKillSwitchPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of AgentKillSwitches.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentKillSwitchCountArgs} args - Arguments to filter AgentKillSwitches to count.
     * @example
     * // Count the number of AgentKillSwitches
     * const count = await prisma.agentKillSwitch.count({
     *   where: {
     *     // ... the filter for the AgentKillSwitches we want to count
     *   }
     * })
    **/
    count<T extends AgentKillSwitchCountArgs>(
      args?: Subset<T, AgentKillSwitchCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AgentKillSwitchCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AgentKillSwitch.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentKillSwitchAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends AgentKillSwitchAggregateArgs>(args: Subset<T, AgentKillSwitchAggregateArgs>): Prisma.PrismaPromise<GetAgentKillSwitchAggregateType<T>>

    /**
     * Group by AgentKillSwitch.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentKillSwitchGroupByArgs} args - Group by arguments.
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
      T extends AgentKillSwitchGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AgentKillSwitchGroupByArgs['orderBy'] }
        : { orderBy?: AgentKillSwitchGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, AgentKillSwitchGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAgentKillSwitchGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AgentKillSwitch model
   */
  readonly fields: AgentKillSwitchFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AgentKillSwitch.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AgentKillSwitchClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the AgentKillSwitch model
   */
  interface AgentKillSwitchFieldRefs {
    readonly id: FieldRef<"AgentKillSwitch", 'String'>
    readonly tenantId: FieldRef<"AgentKillSwitch", 'String'>
    readonly agentType: FieldRef<"AgentKillSwitch", 'String'>
    readonly disabled: FieldRef<"AgentKillSwitch", 'Boolean'>
    readonly reason: FieldRef<"AgentKillSwitch", 'String'>
    readonly updatedAt: FieldRef<"AgentKillSwitch", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AgentKillSwitch findUnique
   */
  export type AgentKillSwitchFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentKillSwitch
     */
    select?: AgentKillSwitchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentKillSwitch
     */
    omit?: AgentKillSwitchOmit<ExtArgs> | null
    /**
     * Filter, which AgentKillSwitch to fetch.
     */
    where: AgentKillSwitchWhereUniqueInput
  }

  /**
   * AgentKillSwitch findUniqueOrThrow
   */
  export type AgentKillSwitchFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentKillSwitch
     */
    select?: AgentKillSwitchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentKillSwitch
     */
    omit?: AgentKillSwitchOmit<ExtArgs> | null
    /**
     * Filter, which AgentKillSwitch to fetch.
     */
    where: AgentKillSwitchWhereUniqueInput
  }

  /**
   * AgentKillSwitch findFirst
   */
  export type AgentKillSwitchFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentKillSwitch
     */
    select?: AgentKillSwitchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentKillSwitch
     */
    omit?: AgentKillSwitchOmit<ExtArgs> | null
    /**
     * Filter, which AgentKillSwitch to fetch.
     */
    where?: AgentKillSwitchWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AgentKillSwitches to fetch.
     */
    orderBy?: AgentKillSwitchOrderByWithRelationInput | AgentKillSwitchOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AgentKillSwitches.
     */
    cursor?: AgentKillSwitchWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AgentKillSwitches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AgentKillSwitches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AgentKillSwitches.
     */
    distinct?: AgentKillSwitchScalarFieldEnum | AgentKillSwitchScalarFieldEnum[]
  }

  /**
   * AgentKillSwitch findFirstOrThrow
   */
  export type AgentKillSwitchFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentKillSwitch
     */
    select?: AgentKillSwitchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentKillSwitch
     */
    omit?: AgentKillSwitchOmit<ExtArgs> | null
    /**
     * Filter, which AgentKillSwitch to fetch.
     */
    where?: AgentKillSwitchWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AgentKillSwitches to fetch.
     */
    orderBy?: AgentKillSwitchOrderByWithRelationInput | AgentKillSwitchOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AgentKillSwitches.
     */
    cursor?: AgentKillSwitchWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AgentKillSwitches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AgentKillSwitches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AgentKillSwitches.
     */
    distinct?: AgentKillSwitchScalarFieldEnum | AgentKillSwitchScalarFieldEnum[]
  }

  /**
   * AgentKillSwitch findMany
   */
  export type AgentKillSwitchFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentKillSwitch
     */
    select?: AgentKillSwitchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentKillSwitch
     */
    omit?: AgentKillSwitchOmit<ExtArgs> | null
    /**
     * Filter, which AgentKillSwitches to fetch.
     */
    where?: AgentKillSwitchWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AgentKillSwitches to fetch.
     */
    orderBy?: AgentKillSwitchOrderByWithRelationInput | AgentKillSwitchOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AgentKillSwitches.
     */
    cursor?: AgentKillSwitchWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AgentKillSwitches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AgentKillSwitches.
     */
    skip?: number
    distinct?: AgentKillSwitchScalarFieldEnum | AgentKillSwitchScalarFieldEnum[]
  }

  /**
   * AgentKillSwitch create
   */
  export type AgentKillSwitchCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentKillSwitch
     */
    select?: AgentKillSwitchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentKillSwitch
     */
    omit?: AgentKillSwitchOmit<ExtArgs> | null
    /**
     * The data needed to create a AgentKillSwitch.
     */
    data: XOR<AgentKillSwitchCreateInput, AgentKillSwitchUncheckedCreateInput>
  }

  /**
   * AgentKillSwitch createMany
   */
  export type AgentKillSwitchCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AgentKillSwitches.
     */
    data: AgentKillSwitchCreateManyInput | AgentKillSwitchCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AgentKillSwitch createManyAndReturn
   */
  export type AgentKillSwitchCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentKillSwitch
     */
    select?: AgentKillSwitchSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AgentKillSwitch
     */
    omit?: AgentKillSwitchOmit<ExtArgs> | null
    /**
     * The data used to create many AgentKillSwitches.
     */
    data: AgentKillSwitchCreateManyInput | AgentKillSwitchCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AgentKillSwitch update
   */
  export type AgentKillSwitchUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentKillSwitch
     */
    select?: AgentKillSwitchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentKillSwitch
     */
    omit?: AgentKillSwitchOmit<ExtArgs> | null
    /**
     * The data needed to update a AgentKillSwitch.
     */
    data: XOR<AgentKillSwitchUpdateInput, AgentKillSwitchUncheckedUpdateInput>
    /**
     * Choose, which AgentKillSwitch to update.
     */
    where: AgentKillSwitchWhereUniqueInput
  }

  /**
   * AgentKillSwitch updateMany
   */
  export type AgentKillSwitchUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AgentKillSwitches.
     */
    data: XOR<AgentKillSwitchUpdateManyMutationInput, AgentKillSwitchUncheckedUpdateManyInput>
    /**
     * Filter which AgentKillSwitches to update
     */
    where?: AgentKillSwitchWhereInput
    /**
     * Limit how many AgentKillSwitches to update.
     */
    limit?: number
  }

  /**
   * AgentKillSwitch updateManyAndReturn
   */
  export type AgentKillSwitchUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentKillSwitch
     */
    select?: AgentKillSwitchSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AgentKillSwitch
     */
    omit?: AgentKillSwitchOmit<ExtArgs> | null
    /**
     * The data used to update AgentKillSwitches.
     */
    data: XOR<AgentKillSwitchUpdateManyMutationInput, AgentKillSwitchUncheckedUpdateManyInput>
    /**
     * Filter which AgentKillSwitches to update
     */
    where?: AgentKillSwitchWhereInput
    /**
     * Limit how many AgentKillSwitches to update.
     */
    limit?: number
  }

  /**
   * AgentKillSwitch upsert
   */
  export type AgentKillSwitchUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentKillSwitch
     */
    select?: AgentKillSwitchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentKillSwitch
     */
    omit?: AgentKillSwitchOmit<ExtArgs> | null
    /**
     * The filter to search for the AgentKillSwitch to update in case it exists.
     */
    where: AgentKillSwitchWhereUniqueInput
    /**
     * In case the AgentKillSwitch found by the `where` argument doesn't exist, create a new AgentKillSwitch with this data.
     */
    create: XOR<AgentKillSwitchCreateInput, AgentKillSwitchUncheckedCreateInput>
    /**
     * In case the AgentKillSwitch was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AgentKillSwitchUpdateInput, AgentKillSwitchUncheckedUpdateInput>
  }

  /**
   * AgentKillSwitch delete
   */
  export type AgentKillSwitchDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentKillSwitch
     */
    select?: AgentKillSwitchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentKillSwitch
     */
    omit?: AgentKillSwitchOmit<ExtArgs> | null
    /**
     * Filter which AgentKillSwitch to delete.
     */
    where: AgentKillSwitchWhereUniqueInput
  }

  /**
   * AgentKillSwitch deleteMany
   */
  export type AgentKillSwitchDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AgentKillSwitches to delete
     */
    where?: AgentKillSwitchWhereInput
    /**
     * Limit how many AgentKillSwitches to delete.
     */
    limit?: number
  }

  /**
   * AgentKillSwitch without action
   */
  export type AgentKillSwitchDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentKillSwitch
     */
    select?: AgentKillSwitchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentKillSwitch
     */
    omit?: AgentKillSwitchOmit<ExtArgs> | null
  }


  /**
   * Model AgentRunCost
   */

  export type AggregateAgentRunCost = {
    _count: AgentRunCostCountAggregateOutputType | null
    _avg: AgentRunCostAvgAggregateOutputType | null
    _sum: AgentRunCostSumAggregateOutputType | null
    _min: AgentRunCostMinAggregateOutputType | null
    _max: AgentRunCostMaxAggregateOutputType | null
  }

  export type AgentRunCostAvgAggregateOutputType = {
    tokensIn: number | null
    tokensOut: number | null
    costUsd: Decimal | null
    latencyMs: number | null
    iterations: number | null
  }

  export type AgentRunCostSumAggregateOutputType = {
    tokensIn: number | null
    tokensOut: number | null
    costUsd: Decimal | null
    latencyMs: number | null
    iterations: number | null
  }

  export type AgentRunCostMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    agentRunId: string | null
    agentType: string | null
    status: string | null
    tokensIn: number | null
    tokensOut: number | null
    costUsd: Decimal | null
    latencyMs: number | null
    modelName: string | null
    iterations: number | null
    triggeredByUserId: string | null
    createdAt: Date | null
  }

  export type AgentRunCostMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    agentRunId: string | null
    agentType: string | null
    status: string | null
    tokensIn: number | null
    tokensOut: number | null
    costUsd: Decimal | null
    latencyMs: number | null
    modelName: string | null
    iterations: number | null
    triggeredByUserId: string | null
    createdAt: Date | null
  }

  export type AgentRunCostCountAggregateOutputType = {
    id: number
    tenantId: number
    agentRunId: number
    agentType: number
    status: number
    tokensIn: number
    tokensOut: number
    costUsd: number
    latencyMs: number
    modelName: number
    iterations: number
    triggeredByUserId: number
    createdAt: number
    _all: number
  }


  export type AgentRunCostAvgAggregateInputType = {
    tokensIn?: true
    tokensOut?: true
    costUsd?: true
    latencyMs?: true
    iterations?: true
  }

  export type AgentRunCostSumAggregateInputType = {
    tokensIn?: true
    tokensOut?: true
    costUsd?: true
    latencyMs?: true
    iterations?: true
  }

  export type AgentRunCostMinAggregateInputType = {
    id?: true
    tenantId?: true
    agentRunId?: true
    agentType?: true
    status?: true
    tokensIn?: true
    tokensOut?: true
    costUsd?: true
    latencyMs?: true
    modelName?: true
    iterations?: true
    triggeredByUserId?: true
    createdAt?: true
  }

  export type AgentRunCostMaxAggregateInputType = {
    id?: true
    tenantId?: true
    agentRunId?: true
    agentType?: true
    status?: true
    tokensIn?: true
    tokensOut?: true
    costUsd?: true
    latencyMs?: true
    modelName?: true
    iterations?: true
    triggeredByUserId?: true
    createdAt?: true
  }

  export type AgentRunCostCountAggregateInputType = {
    id?: true
    tenantId?: true
    agentRunId?: true
    agentType?: true
    status?: true
    tokensIn?: true
    tokensOut?: true
    costUsd?: true
    latencyMs?: true
    modelName?: true
    iterations?: true
    triggeredByUserId?: true
    createdAt?: true
    _all?: true
  }

  export type AgentRunCostAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AgentRunCost to aggregate.
     */
    where?: AgentRunCostWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AgentRunCosts to fetch.
     */
    orderBy?: AgentRunCostOrderByWithRelationInput | AgentRunCostOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AgentRunCostWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AgentRunCosts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AgentRunCosts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AgentRunCosts
    **/
    _count?: true | AgentRunCostCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AgentRunCostAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AgentRunCostSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AgentRunCostMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AgentRunCostMaxAggregateInputType
  }

  export type GetAgentRunCostAggregateType<T extends AgentRunCostAggregateArgs> = {
        [P in keyof T & keyof AggregateAgentRunCost]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAgentRunCost[P]>
      : GetScalarType<T[P], AggregateAgentRunCost[P]>
  }




  export type AgentRunCostGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AgentRunCostWhereInput
    orderBy?: AgentRunCostOrderByWithAggregationInput | AgentRunCostOrderByWithAggregationInput[]
    by: AgentRunCostScalarFieldEnum[] | AgentRunCostScalarFieldEnum
    having?: AgentRunCostScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AgentRunCostCountAggregateInputType | true
    _avg?: AgentRunCostAvgAggregateInputType
    _sum?: AgentRunCostSumAggregateInputType
    _min?: AgentRunCostMinAggregateInputType
    _max?: AgentRunCostMaxAggregateInputType
  }

  export type AgentRunCostGroupByOutputType = {
    id: string
    tenantId: string
    agentRunId: string
    agentType: string
    status: string
    tokensIn: number
    tokensOut: number
    costUsd: Decimal
    latencyMs: number
    modelName: string | null
    iterations: number | null
    triggeredByUserId: string | null
    createdAt: Date
    _count: AgentRunCostCountAggregateOutputType | null
    _avg: AgentRunCostAvgAggregateOutputType | null
    _sum: AgentRunCostSumAggregateOutputType | null
    _min: AgentRunCostMinAggregateOutputType | null
    _max: AgentRunCostMaxAggregateOutputType | null
  }

  type GetAgentRunCostGroupByPayload<T extends AgentRunCostGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AgentRunCostGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AgentRunCostGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AgentRunCostGroupByOutputType[P]>
            : GetScalarType<T[P], AgentRunCostGroupByOutputType[P]>
        }
      >
    >


  export type AgentRunCostSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    agentRunId?: boolean
    agentType?: boolean
    status?: boolean
    tokensIn?: boolean
    tokensOut?: boolean
    costUsd?: boolean
    latencyMs?: boolean
    modelName?: boolean
    iterations?: boolean
    triggeredByUserId?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["agentRunCost"]>

  export type AgentRunCostSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    agentRunId?: boolean
    agentType?: boolean
    status?: boolean
    tokensIn?: boolean
    tokensOut?: boolean
    costUsd?: boolean
    latencyMs?: boolean
    modelName?: boolean
    iterations?: boolean
    triggeredByUserId?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["agentRunCost"]>

  export type AgentRunCostSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    agentRunId?: boolean
    agentType?: boolean
    status?: boolean
    tokensIn?: boolean
    tokensOut?: boolean
    costUsd?: boolean
    latencyMs?: boolean
    modelName?: boolean
    iterations?: boolean
    triggeredByUserId?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["agentRunCost"]>

  export type AgentRunCostSelectScalar = {
    id?: boolean
    tenantId?: boolean
    agentRunId?: boolean
    agentType?: boolean
    status?: boolean
    tokensIn?: boolean
    tokensOut?: boolean
    costUsd?: boolean
    latencyMs?: boolean
    modelName?: boolean
    iterations?: boolean
    triggeredByUserId?: boolean
    createdAt?: boolean
  }

  export type AgentRunCostOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "agentRunId" | "agentType" | "status" | "tokensIn" | "tokensOut" | "costUsd" | "latencyMs" | "modelName" | "iterations" | "triggeredByUserId" | "createdAt", ExtArgs["result"]["agentRunCost"]>

  export type $AgentRunCostPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AgentRunCost"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      agentRunId: string
      agentType: string
      status: string
      tokensIn: number
      tokensOut: number
      costUsd: Prisma.Decimal
      latencyMs: number
      modelName: string | null
      iterations: number | null
      triggeredByUserId: string | null
      createdAt: Date
    }, ExtArgs["result"]["agentRunCost"]>
    composites: {}
  }

  type AgentRunCostGetPayload<S extends boolean | null | undefined | AgentRunCostDefaultArgs> = $Result.GetResult<Prisma.$AgentRunCostPayload, S>

  type AgentRunCostCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AgentRunCostFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AgentRunCostCountAggregateInputType | true
    }

  export interface AgentRunCostDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AgentRunCost'], meta: { name: 'AgentRunCost' } }
    /**
     * Find zero or one AgentRunCost that matches the filter.
     * @param {AgentRunCostFindUniqueArgs} args - Arguments to find a AgentRunCost
     * @example
     * // Get one AgentRunCost
     * const agentRunCost = await prisma.agentRunCost.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AgentRunCostFindUniqueArgs>(args: SelectSubset<T, AgentRunCostFindUniqueArgs<ExtArgs>>): Prisma__AgentRunCostClient<$Result.GetResult<Prisma.$AgentRunCostPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AgentRunCost that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AgentRunCostFindUniqueOrThrowArgs} args - Arguments to find a AgentRunCost
     * @example
     * // Get one AgentRunCost
     * const agentRunCost = await prisma.agentRunCost.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AgentRunCostFindUniqueOrThrowArgs>(args: SelectSubset<T, AgentRunCostFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AgentRunCostClient<$Result.GetResult<Prisma.$AgentRunCostPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AgentRunCost that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentRunCostFindFirstArgs} args - Arguments to find a AgentRunCost
     * @example
     * // Get one AgentRunCost
     * const agentRunCost = await prisma.agentRunCost.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AgentRunCostFindFirstArgs>(args?: SelectSubset<T, AgentRunCostFindFirstArgs<ExtArgs>>): Prisma__AgentRunCostClient<$Result.GetResult<Prisma.$AgentRunCostPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AgentRunCost that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentRunCostFindFirstOrThrowArgs} args - Arguments to find a AgentRunCost
     * @example
     * // Get one AgentRunCost
     * const agentRunCost = await prisma.agentRunCost.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AgentRunCostFindFirstOrThrowArgs>(args?: SelectSubset<T, AgentRunCostFindFirstOrThrowArgs<ExtArgs>>): Prisma__AgentRunCostClient<$Result.GetResult<Prisma.$AgentRunCostPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AgentRunCosts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentRunCostFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AgentRunCosts
     * const agentRunCosts = await prisma.agentRunCost.findMany()
     * 
     * // Get first 10 AgentRunCosts
     * const agentRunCosts = await prisma.agentRunCost.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const agentRunCostWithIdOnly = await prisma.agentRunCost.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AgentRunCostFindManyArgs>(args?: SelectSubset<T, AgentRunCostFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AgentRunCostPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AgentRunCost.
     * @param {AgentRunCostCreateArgs} args - Arguments to create a AgentRunCost.
     * @example
     * // Create one AgentRunCost
     * const AgentRunCost = await prisma.agentRunCost.create({
     *   data: {
     *     // ... data to create a AgentRunCost
     *   }
     * })
     * 
     */
    create<T extends AgentRunCostCreateArgs>(args: SelectSubset<T, AgentRunCostCreateArgs<ExtArgs>>): Prisma__AgentRunCostClient<$Result.GetResult<Prisma.$AgentRunCostPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AgentRunCosts.
     * @param {AgentRunCostCreateManyArgs} args - Arguments to create many AgentRunCosts.
     * @example
     * // Create many AgentRunCosts
     * const agentRunCost = await prisma.agentRunCost.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AgentRunCostCreateManyArgs>(args?: SelectSubset<T, AgentRunCostCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AgentRunCosts and returns the data saved in the database.
     * @param {AgentRunCostCreateManyAndReturnArgs} args - Arguments to create many AgentRunCosts.
     * @example
     * // Create many AgentRunCosts
     * const agentRunCost = await prisma.agentRunCost.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AgentRunCosts and only return the `id`
     * const agentRunCostWithIdOnly = await prisma.agentRunCost.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AgentRunCostCreateManyAndReturnArgs>(args?: SelectSubset<T, AgentRunCostCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AgentRunCostPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a AgentRunCost.
     * @param {AgentRunCostDeleteArgs} args - Arguments to delete one AgentRunCost.
     * @example
     * // Delete one AgentRunCost
     * const AgentRunCost = await prisma.agentRunCost.delete({
     *   where: {
     *     // ... filter to delete one AgentRunCost
     *   }
     * })
     * 
     */
    delete<T extends AgentRunCostDeleteArgs>(args: SelectSubset<T, AgentRunCostDeleteArgs<ExtArgs>>): Prisma__AgentRunCostClient<$Result.GetResult<Prisma.$AgentRunCostPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AgentRunCost.
     * @param {AgentRunCostUpdateArgs} args - Arguments to update one AgentRunCost.
     * @example
     * // Update one AgentRunCost
     * const agentRunCost = await prisma.agentRunCost.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AgentRunCostUpdateArgs>(args: SelectSubset<T, AgentRunCostUpdateArgs<ExtArgs>>): Prisma__AgentRunCostClient<$Result.GetResult<Prisma.$AgentRunCostPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AgentRunCosts.
     * @param {AgentRunCostDeleteManyArgs} args - Arguments to filter AgentRunCosts to delete.
     * @example
     * // Delete a few AgentRunCosts
     * const { count } = await prisma.agentRunCost.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AgentRunCostDeleteManyArgs>(args?: SelectSubset<T, AgentRunCostDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AgentRunCosts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentRunCostUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AgentRunCosts
     * const agentRunCost = await prisma.agentRunCost.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AgentRunCostUpdateManyArgs>(args: SelectSubset<T, AgentRunCostUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AgentRunCosts and returns the data updated in the database.
     * @param {AgentRunCostUpdateManyAndReturnArgs} args - Arguments to update many AgentRunCosts.
     * @example
     * // Update many AgentRunCosts
     * const agentRunCost = await prisma.agentRunCost.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more AgentRunCosts and only return the `id`
     * const agentRunCostWithIdOnly = await prisma.agentRunCost.updateManyAndReturn({
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
    updateManyAndReturn<T extends AgentRunCostUpdateManyAndReturnArgs>(args: SelectSubset<T, AgentRunCostUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AgentRunCostPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one AgentRunCost.
     * @param {AgentRunCostUpsertArgs} args - Arguments to update or create a AgentRunCost.
     * @example
     * // Update or create a AgentRunCost
     * const agentRunCost = await prisma.agentRunCost.upsert({
     *   create: {
     *     // ... data to create a AgentRunCost
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AgentRunCost we want to update
     *   }
     * })
     */
    upsert<T extends AgentRunCostUpsertArgs>(args: SelectSubset<T, AgentRunCostUpsertArgs<ExtArgs>>): Prisma__AgentRunCostClient<$Result.GetResult<Prisma.$AgentRunCostPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of AgentRunCosts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentRunCostCountArgs} args - Arguments to filter AgentRunCosts to count.
     * @example
     * // Count the number of AgentRunCosts
     * const count = await prisma.agentRunCost.count({
     *   where: {
     *     // ... the filter for the AgentRunCosts we want to count
     *   }
     * })
    **/
    count<T extends AgentRunCostCountArgs>(
      args?: Subset<T, AgentRunCostCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AgentRunCostCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AgentRunCost.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentRunCostAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends AgentRunCostAggregateArgs>(args: Subset<T, AgentRunCostAggregateArgs>): Prisma.PrismaPromise<GetAgentRunCostAggregateType<T>>

    /**
     * Group by AgentRunCost.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentRunCostGroupByArgs} args - Group by arguments.
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
      T extends AgentRunCostGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AgentRunCostGroupByArgs['orderBy'] }
        : { orderBy?: AgentRunCostGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, AgentRunCostGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAgentRunCostGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AgentRunCost model
   */
  readonly fields: AgentRunCostFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AgentRunCost.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AgentRunCostClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the AgentRunCost model
   */
  interface AgentRunCostFieldRefs {
    readonly id: FieldRef<"AgentRunCost", 'String'>
    readonly tenantId: FieldRef<"AgentRunCost", 'String'>
    readonly agentRunId: FieldRef<"AgentRunCost", 'String'>
    readonly agentType: FieldRef<"AgentRunCost", 'String'>
    readonly status: FieldRef<"AgentRunCost", 'String'>
    readonly tokensIn: FieldRef<"AgentRunCost", 'Int'>
    readonly tokensOut: FieldRef<"AgentRunCost", 'Int'>
    readonly costUsd: FieldRef<"AgentRunCost", 'Decimal'>
    readonly latencyMs: FieldRef<"AgentRunCost", 'Int'>
    readonly modelName: FieldRef<"AgentRunCost", 'String'>
    readonly iterations: FieldRef<"AgentRunCost", 'Int'>
    readonly triggeredByUserId: FieldRef<"AgentRunCost", 'String'>
    readonly createdAt: FieldRef<"AgentRunCost", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AgentRunCost findUnique
   */
  export type AgentRunCostFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentRunCost
     */
    select?: AgentRunCostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentRunCost
     */
    omit?: AgentRunCostOmit<ExtArgs> | null
    /**
     * Filter, which AgentRunCost to fetch.
     */
    where: AgentRunCostWhereUniqueInput
  }

  /**
   * AgentRunCost findUniqueOrThrow
   */
  export type AgentRunCostFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentRunCost
     */
    select?: AgentRunCostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentRunCost
     */
    omit?: AgentRunCostOmit<ExtArgs> | null
    /**
     * Filter, which AgentRunCost to fetch.
     */
    where: AgentRunCostWhereUniqueInput
  }

  /**
   * AgentRunCost findFirst
   */
  export type AgentRunCostFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentRunCost
     */
    select?: AgentRunCostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentRunCost
     */
    omit?: AgentRunCostOmit<ExtArgs> | null
    /**
     * Filter, which AgentRunCost to fetch.
     */
    where?: AgentRunCostWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AgentRunCosts to fetch.
     */
    orderBy?: AgentRunCostOrderByWithRelationInput | AgentRunCostOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AgentRunCosts.
     */
    cursor?: AgentRunCostWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AgentRunCosts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AgentRunCosts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AgentRunCosts.
     */
    distinct?: AgentRunCostScalarFieldEnum | AgentRunCostScalarFieldEnum[]
  }

  /**
   * AgentRunCost findFirstOrThrow
   */
  export type AgentRunCostFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentRunCost
     */
    select?: AgentRunCostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentRunCost
     */
    omit?: AgentRunCostOmit<ExtArgs> | null
    /**
     * Filter, which AgentRunCost to fetch.
     */
    where?: AgentRunCostWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AgentRunCosts to fetch.
     */
    orderBy?: AgentRunCostOrderByWithRelationInput | AgentRunCostOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AgentRunCosts.
     */
    cursor?: AgentRunCostWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AgentRunCosts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AgentRunCosts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AgentRunCosts.
     */
    distinct?: AgentRunCostScalarFieldEnum | AgentRunCostScalarFieldEnum[]
  }

  /**
   * AgentRunCost findMany
   */
  export type AgentRunCostFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentRunCost
     */
    select?: AgentRunCostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentRunCost
     */
    omit?: AgentRunCostOmit<ExtArgs> | null
    /**
     * Filter, which AgentRunCosts to fetch.
     */
    where?: AgentRunCostWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AgentRunCosts to fetch.
     */
    orderBy?: AgentRunCostOrderByWithRelationInput | AgentRunCostOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AgentRunCosts.
     */
    cursor?: AgentRunCostWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AgentRunCosts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AgentRunCosts.
     */
    skip?: number
    distinct?: AgentRunCostScalarFieldEnum | AgentRunCostScalarFieldEnum[]
  }

  /**
   * AgentRunCost create
   */
  export type AgentRunCostCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentRunCost
     */
    select?: AgentRunCostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentRunCost
     */
    omit?: AgentRunCostOmit<ExtArgs> | null
    /**
     * The data needed to create a AgentRunCost.
     */
    data: XOR<AgentRunCostCreateInput, AgentRunCostUncheckedCreateInput>
  }

  /**
   * AgentRunCost createMany
   */
  export type AgentRunCostCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AgentRunCosts.
     */
    data: AgentRunCostCreateManyInput | AgentRunCostCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AgentRunCost createManyAndReturn
   */
  export type AgentRunCostCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentRunCost
     */
    select?: AgentRunCostSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AgentRunCost
     */
    omit?: AgentRunCostOmit<ExtArgs> | null
    /**
     * The data used to create many AgentRunCosts.
     */
    data: AgentRunCostCreateManyInput | AgentRunCostCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AgentRunCost update
   */
  export type AgentRunCostUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentRunCost
     */
    select?: AgentRunCostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentRunCost
     */
    omit?: AgentRunCostOmit<ExtArgs> | null
    /**
     * The data needed to update a AgentRunCost.
     */
    data: XOR<AgentRunCostUpdateInput, AgentRunCostUncheckedUpdateInput>
    /**
     * Choose, which AgentRunCost to update.
     */
    where: AgentRunCostWhereUniqueInput
  }

  /**
   * AgentRunCost updateMany
   */
  export type AgentRunCostUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AgentRunCosts.
     */
    data: XOR<AgentRunCostUpdateManyMutationInput, AgentRunCostUncheckedUpdateManyInput>
    /**
     * Filter which AgentRunCosts to update
     */
    where?: AgentRunCostWhereInput
    /**
     * Limit how many AgentRunCosts to update.
     */
    limit?: number
  }

  /**
   * AgentRunCost updateManyAndReturn
   */
  export type AgentRunCostUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentRunCost
     */
    select?: AgentRunCostSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AgentRunCost
     */
    omit?: AgentRunCostOmit<ExtArgs> | null
    /**
     * The data used to update AgentRunCosts.
     */
    data: XOR<AgentRunCostUpdateManyMutationInput, AgentRunCostUncheckedUpdateManyInput>
    /**
     * Filter which AgentRunCosts to update
     */
    where?: AgentRunCostWhereInput
    /**
     * Limit how many AgentRunCosts to update.
     */
    limit?: number
  }

  /**
   * AgentRunCost upsert
   */
  export type AgentRunCostUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentRunCost
     */
    select?: AgentRunCostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentRunCost
     */
    omit?: AgentRunCostOmit<ExtArgs> | null
    /**
     * The filter to search for the AgentRunCost to update in case it exists.
     */
    where: AgentRunCostWhereUniqueInput
    /**
     * In case the AgentRunCost found by the `where` argument doesn't exist, create a new AgentRunCost with this data.
     */
    create: XOR<AgentRunCostCreateInput, AgentRunCostUncheckedCreateInput>
    /**
     * In case the AgentRunCost was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AgentRunCostUpdateInput, AgentRunCostUncheckedUpdateInput>
  }

  /**
   * AgentRunCost delete
   */
  export type AgentRunCostDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentRunCost
     */
    select?: AgentRunCostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentRunCost
     */
    omit?: AgentRunCostOmit<ExtArgs> | null
    /**
     * Filter which AgentRunCost to delete.
     */
    where: AgentRunCostWhereUniqueInput
  }

  /**
   * AgentRunCost deleteMany
   */
  export type AgentRunCostDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AgentRunCosts to delete
     */
    where?: AgentRunCostWhereInput
    /**
     * Limit how many AgentRunCosts to delete.
     */
    limit?: number
  }

  /**
   * AgentRunCost without action
   */
  export type AgentRunCostDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentRunCost
     */
    select?: AgentRunCostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgentRunCost
     */
    omit?: AgentRunCostOmit<ExtArgs> | null
  }


  /**
   * Model FeatureFlag
   */

  export type AggregateFeatureFlag = {
    _count: FeatureFlagCountAggregateOutputType | null
    _min: FeatureFlagMinAggregateOutputType | null
    _max: FeatureFlagMaxAggregateOutputType | null
  }

  export type FeatureFlagMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    name: string | null
    enabled: boolean | null
    updatedAt: Date | null
  }

  export type FeatureFlagMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    name: string | null
    enabled: boolean | null
    updatedAt: Date | null
  }

  export type FeatureFlagCountAggregateOutputType = {
    id: number
    tenantId: number
    name: number
    enabled: number
    metadata: number
    updatedAt: number
    _all: number
  }


  export type FeatureFlagMinAggregateInputType = {
    id?: true
    tenantId?: true
    name?: true
    enabled?: true
    updatedAt?: true
  }

  export type FeatureFlagMaxAggregateInputType = {
    id?: true
    tenantId?: true
    name?: true
    enabled?: true
    updatedAt?: true
  }

  export type FeatureFlagCountAggregateInputType = {
    id?: true
    tenantId?: true
    name?: true
    enabled?: true
    metadata?: true
    updatedAt?: true
    _all?: true
  }

  export type FeatureFlagAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which FeatureFlag to aggregate.
     */
    where?: FeatureFlagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FeatureFlags to fetch.
     */
    orderBy?: FeatureFlagOrderByWithRelationInput | FeatureFlagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: FeatureFlagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FeatureFlags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FeatureFlags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned FeatureFlags
    **/
    _count?: true | FeatureFlagCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: FeatureFlagMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: FeatureFlagMaxAggregateInputType
  }

  export type GetFeatureFlagAggregateType<T extends FeatureFlagAggregateArgs> = {
        [P in keyof T & keyof AggregateFeatureFlag]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateFeatureFlag[P]>
      : GetScalarType<T[P], AggregateFeatureFlag[P]>
  }




  export type FeatureFlagGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FeatureFlagWhereInput
    orderBy?: FeatureFlagOrderByWithAggregationInput | FeatureFlagOrderByWithAggregationInput[]
    by: FeatureFlagScalarFieldEnum[] | FeatureFlagScalarFieldEnum
    having?: FeatureFlagScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: FeatureFlagCountAggregateInputType | true
    _min?: FeatureFlagMinAggregateInputType
    _max?: FeatureFlagMaxAggregateInputType
  }

  export type FeatureFlagGroupByOutputType = {
    id: string
    tenantId: string
    name: string
    enabled: boolean
    metadata: JsonValue
    updatedAt: Date
    _count: FeatureFlagCountAggregateOutputType | null
    _min: FeatureFlagMinAggregateOutputType | null
    _max: FeatureFlagMaxAggregateOutputType | null
  }

  type GetFeatureFlagGroupByPayload<T extends FeatureFlagGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<FeatureFlagGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof FeatureFlagGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], FeatureFlagGroupByOutputType[P]>
            : GetScalarType<T[P], FeatureFlagGroupByOutputType[P]>
        }
      >
    >


  export type FeatureFlagSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    name?: boolean
    enabled?: boolean
    metadata?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["featureFlag"]>

  export type FeatureFlagSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    name?: boolean
    enabled?: boolean
    metadata?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["featureFlag"]>

  export type FeatureFlagSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    name?: boolean
    enabled?: boolean
    metadata?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["featureFlag"]>

  export type FeatureFlagSelectScalar = {
    id?: boolean
    tenantId?: boolean
    name?: boolean
    enabled?: boolean
    metadata?: boolean
    updatedAt?: boolean
  }

  export type FeatureFlagOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "name" | "enabled" | "metadata" | "updatedAt", ExtArgs["result"]["featureFlag"]>

  export type $FeatureFlagPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "FeatureFlag"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      name: string
      enabled: boolean
      metadata: Prisma.JsonValue
      updatedAt: Date
    }, ExtArgs["result"]["featureFlag"]>
    composites: {}
  }

  type FeatureFlagGetPayload<S extends boolean | null | undefined | FeatureFlagDefaultArgs> = $Result.GetResult<Prisma.$FeatureFlagPayload, S>

  type FeatureFlagCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<FeatureFlagFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: FeatureFlagCountAggregateInputType | true
    }

  export interface FeatureFlagDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['FeatureFlag'], meta: { name: 'FeatureFlag' } }
    /**
     * Find zero or one FeatureFlag that matches the filter.
     * @param {FeatureFlagFindUniqueArgs} args - Arguments to find a FeatureFlag
     * @example
     * // Get one FeatureFlag
     * const featureFlag = await prisma.featureFlag.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends FeatureFlagFindUniqueArgs>(args: SelectSubset<T, FeatureFlagFindUniqueArgs<ExtArgs>>): Prisma__FeatureFlagClient<$Result.GetResult<Prisma.$FeatureFlagPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one FeatureFlag that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {FeatureFlagFindUniqueOrThrowArgs} args - Arguments to find a FeatureFlag
     * @example
     * // Get one FeatureFlag
     * const featureFlag = await prisma.featureFlag.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends FeatureFlagFindUniqueOrThrowArgs>(args: SelectSubset<T, FeatureFlagFindUniqueOrThrowArgs<ExtArgs>>): Prisma__FeatureFlagClient<$Result.GetResult<Prisma.$FeatureFlagPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first FeatureFlag that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FeatureFlagFindFirstArgs} args - Arguments to find a FeatureFlag
     * @example
     * // Get one FeatureFlag
     * const featureFlag = await prisma.featureFlag.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends FeatureFlagFindFirstArgs>(args?: SelectSubset<T, FeatureFlagFindFirstArgs<ExtArgs>>): Prisma__FeatureFlagClient<$Result.GetResult<Prisma.$FeatureFlagPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first FeatureFlag that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FeatureFlagFindFirstOrThrowArgs} args - Arguments to find a FeatureFlag
     * @example
     * // Get one FeatureFlag
     * const featureFlag = await prisma.featureFlag.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends FeatureFlagFindFirstOrThrowArgs>(args?: SelectSubset<T, FeatureFlagFindFirstOrThrowArgs<ExtArgs>>): Prisma__FeatureFlagClient<$Result.GetResult<Prisma.$FeatureFlagPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more FeatureFlags that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FeatureFlagFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all FeatureFlags
     * const featureFlags = await prisma.featureFlag.findMany()
     * 
     * // Get first 10 FeatureFlags
     * const featureFlags = await prisma.featureFlag.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const featureFlagWithIdOnly = await prisma.featureFlag.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends FeatureFlagFindManyArgs>(args?: SelectSubset<T, FeatureFlagFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FeatureFlagPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a FeatureFlag.
     * @param {FeatureFlagCreateArgs} args - Arguments to create a FeatureFlag.
     * @example
     * // Create one FeatureFlag
     * const FeatureFlag = await prisma.featureFlag.create({
     *   data: {
     *     // ... data to create a FeatureFlag
     *   }
     * })
     * 
     */
    create<T extends FeatureFlagCreateArgs>(args: SelectSubset<T, FeatureFlagCreateArgs<ExtArgs>>): Prisma__FeatureFlagClient<$Result.GetResult<Prisma.$FeatureFlagPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many FeatureFlags.
     * @param {FeatureFlagCreateManyArgs} args - Arguments to create many FeatureFlags.
     * @example
     * // Create many FeatureFlags
     * const featureFlag = await prisma.featureFlag.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends FeatureFlagCreateManyArgs>(args?: SelectSubset<T, FeatureFlagCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many FeatureFlags and returns the data saved in the database.
     * @param {FeatureFlagCreateManyAndReturnArgs} args - Arguments to create many FeatureFlags.
     * @example
     * // Create many FeatureFlags
     * const featureFlag = await prisma.featureFlag.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many FeatureFlags and only return the `id`
     * const featureFlagWithIdOnly = await prisma.featureFlag.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends FeatureFlagCreateManyAndReturnArgs>(args?: SelectSubset<T, FeatureFlagCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FeatureFlagPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a FeatureFlag.
     * @param {FeatureFlagDeleteArgs} args - Arguments to delete one FeatureFlag.
     * @example
     * // Delete one FeatureFlag
     * const FeatureFlag = await prisma.featureFlag.delete({
     *   where: {
     *     // ... filter to delete one FeatureFlag
     *   }
     * })
     * 
     */
    delete<T extends FeatureFlagDeleteArgs>(args: SelectSubset<T, FeatureFlagDeleteArgs<ExtArgs>>): Prisma__FeatureFlagClient<$Result.GetResult<Prisma.$FeatureFlagPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one FeatureFlag.
     * @param {FeatureFlagUpdateArgs} args - Arguments to update one FeatureFlag.
     * @example
     * // Update one FeatureFlag
     * const featureFlag = await prisma.featureFlag.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends FeatureFlagUpdateArgs>(args: SelectSubset<T, FeatureFlagUpdateArgs<ExtArgs>>): Prisma__FeatureFlagClient<$Result.GetResult<Prisma.$FeatureFlagPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more FeatureFlags.
     * @param {FeatureFlagDeleteManyArgs} args - Arguments to filter FeatureFlags to delete.
     * @example
     * // Delete a few FeatureFlags
     * const { count } = await prisma.featureFlag.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends FeatureFlagDeleteManyArgs>(args?: SelectSubset<T, FeatureFlagDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more FeatureFlags.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FeatureFlagUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many FeatureFlags
     * const featureFlag = await prisma.featureFlag.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends FeatureFlagUpdateManyArgs>(args: SelectSubset<T, FeatureFlagUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more FeatureFlags and returns the data updated in the database.
     * @param {FeatureFlagUpdateManyAndReturnArgs} args - Arguments to update many FeatureFlags.
     * @example
     * // Update many FeatureFlags
     * const featureFlag = await prisma.featureFlag.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more FeatureFlags and only return the `id`
     * const featureFlagWithIdOnly = await prisma.featureFlag.updateManyAndReturn({
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
    updateManyAndReturn<T extends FeatureFlagUpdateManyAndReturnArgs>(args: SelectSubset<T, FeatureFlagUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FeatureFlagPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one FeatureFlag.
     * @param {FeatureFlagUpsertArgs} args - Arguments to update or create a FeatureFlag.
     * @example
     * // Update or create a FeatureFlag
     * const featureFlag = await prisma.featureFlag.upsert({
     *   create: {
     *     // ... data to create a FeatureFlag
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the FeatureFlag we want to update
     *   }
     * })
     */
    upsert<T extends FeatureFlagUpsertArgs>(args: SelectSubset<T, FeatureFlagUpsertArgs<ExtArgs>>): Prisma__FeatureFlagClient<$Result.GetResult<Prisma.$FeatureFlagPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of FeatureFlags.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FeatureFlagCountArgs} args - Arguments to filter FeatureFlags to count.
     * @example
     * // Count the number of FeatureFlags
     * const count = await prisma.featureFlag.count({
     *   where: {
     *     // ... the filter for the FeatureFlags we want to count
     *   }
     * })
    **/
    count<T extends FeatureFlagCountArgs>(
      args?: Subset<T, FeatureFlagCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], FeatureFlagCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a FeatureFlag.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FeatureFlagAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends FeatureFlagAggregateArgs>(args: Subset<T, FeatureFlagAggregateArgs>): Prisma.PrismaPromise<GetFeatureFlagAggregateType<T>>

    /**
     * Group by FeatureFlag.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FeatureFlagGroupByArgs} args - Group by arguments.
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
      T extends FeatureFlagGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: FeatureFlagGroupByArgs['orderBy'] }
        : { orderBy?: FeatureFlagGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, FeatureFlagGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetFeatureFlagGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the FeatureFlag model
   */
  readonly fields: FeatureFlagFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for FeatureFlag.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__FeatureFlagClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the FeatureFlag model
   */
  interface FeatureFlagFieldRefs {
    readonly id: FieldRef<"FeatureFlag", 'String'>
    readonly tenantId: FieldRef<"FeatureFlag", 'String'>
    readonly name: FieldRef<"FeatureFlag", 'String'>
    readonly enabled: FieldRef<"FeatureFlag", 'Boolean'>
    readonly metadata: FieldRef<"FeatureFlag", 'Json'>
    readonly updatedAt: FieldRef<"FeatureFlag", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * FeatureFlag findUnique
   */
  export type FeatureFlagFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FeatureFlag
     */
    select?: FeatureFlagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FeatureFlag
     */
    omit?: FeatureFlagOmit<ExtArgs> | null
    /**
     * Filter, which FeatureFlag to fetch.
     */
    where: FeatureFlagWhereUniqueInput
  }

  /**
   * FeatureFlag findUniqueOrThrow
   */
  export type FeatureFlagFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FeatureFlag
     */
    select?: FeatureFlagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FeatureFlag
     */
    omit?: FeatureFlagOmit<ExtArgs> | null
    /**
     * Filter, which FeatureFlag to fetch.
     */
    where: FeatureFlagWhereUniqueInput
  }

  /**
   * FeatureFlag findFirst
   */
  export type FeatureFlagFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FeatureFlag
     */
    select?: FeatureFlagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FeatureFlag
     */
    omit?: FeatureFlagOmit<ExtArgs> | null
    /**
     * Filter, which FeatureFlag to fetch.
     */
    where?: FeatureFlagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FeatureFlags to fetch.
     */
    orderBy?: FeatureFlagOrderByWithRelationInput | FeatureFlagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for FeatureFlags.
     */
    cursor?: FeatureFlagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FeatureFlags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FeatureFlags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FeatureFlags.
     */
    distinct?: FeatureFlagScalarFieldEnum | FeatureFlagScalarFieldEnum[]
  }

  /**
   * FeatureFlag findFirstOrThrow
   */
  export type FeatureFlagFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FeatureFlag
     */
    select?: FeatureFlagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FeatureFlag
     */
    omit?: FeatureFlagOmit<ExtArgs> | null
    /**
     * Filter, which FeatureFlag to fetch.
     */
    where?: FeatureFlagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FeatureFlags to fetch.
     */
    orderBy?: FeatureFlagOrderByWithRelationInput | FeatureFlagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for FeatureFlags.
     */
    cursor?: FeatureFlagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FeatureFlags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FeatureFlags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FeatureFlags.
     */
    distinct?: FeatureFlagScalarFieldEnum | FeatureFlagScalarFieldEnum[]
  }

  /**
   * FeatureFlag findMany
   */
  export type FeatureFlagFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FeatureFlag
     */
    select?: FeatureFlagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FeatureFlag
     */
    omit?: FeatureFlagOmit<ExtArgs> | null
    /**
     * Filter, which FeatureFlags to fetch.
     */
    where?: FeatureFlagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FeatureFlags to fetch.
     */
    orderBy?: FeatureFlagOrderByWithRelationInput | FeatureFlagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing FeatureFlags.
     */
    cursor?: FeatureFlagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FeatureFlags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FeatureFlags.
     */
    skip?: number
    distinct?: FeatureFlagScalarFieldEnum | FeatureFlagScalarFieldEnum[]
  }

  /**
   * FeatureFlag create
   */
  export type FeatureFlagCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FeatureFlag
     */
    select?: FeatureFlagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FeatureFlag
     */
    omit?: FeatureFlagOmit<ExtArgs> | null
    /**
     * The data needed to create a FeatureFlag.
     */
    data: XOR<FeatureFlagCreateInput, FeatureFlagUncheckedCreateInput>
  }

  /**
   * FeatureFlag createMany
   */
  export type FeatureFlagCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many FeatureFlags.
     */
    data: FeatureFlagCreateManyInput | FeatureFlagCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * FeatureFlag createManyAndReturn
   */
  export type FeatureFlagCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FeatureFlag
     */
    select?: FeatureFlagSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the FeatureFlag
     */
    omit?: FeatureFlagOmit<ExtArgs> | null
    /**
     * The data used to create many FeatureFlags.
     */
    data: FeatureFlagCreateManyInput | FeatureFlagCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * FeatureFlag update
   */
  export type FeatureFlagUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FeatureFlag
     */
    select?: FeatureFlagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FeatureFlag
     */
    omit?: FeatureFlagOmit<ExtArgs> | null
    /**
     * The data needed to update a FeatureFlag.
     */
    data: XOR<FeatureFlagUpdateInput, FeatureFlagUncheckedUpdateInput>
    /**
     * Choose, which FeatureFlag to update.
     */
    where: FeatureFlagWhereUniqueInput
  }

  /**
   * FeatureFlag updateMany
   */
  export type FeatureFlagUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update FeatureFlags.
     */
    data: XOR<FeatureFlagUpdateManyMutationInput, FeatureFlagUncheckedUpdateManyInput>
    /**
     * Filter which FeatureFlags to update
     */
    where?: FeatureFlagWhereInput
    /**
     * Limit how many FeatureFlags to update.
     */
    limit?: number
  }

  /**
   * FeatureFlag updateManyAndReturn
   */
  export type FeatureFlagUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FeatureFlag
     */
    select?: FeatureFlagSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the FeatureFlag
     */
    omit?: FeatureFlagOmit<ExtArgs> | null
    /**
     * The data used to update FeatureFlags.
     */
    data: XOR<FeatureFlagUpdateManyMutationInput, FeatureFlagUncheckedUpdateManyInput>
    /**
     * Filter which FeatureFlags to update
     */
    where?: FeatureFlagWhereInput
    /**
     * Limit how many FeatureFlags to update.
     */
    limit?: number
  }

  /**
   * FeatureFlag upsert
   */
  export type FeatureFlagUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FeatureFlag
     */
    select?: FeatureFlagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FeatureFlag
     */
    omit?: FeatureFlagOmit<ExtArgs> | null
    /**
     * The filter to search for the FeatureFlag to update in case it exists.
     */
    where: FeatureFlagWhereUniqueInput
    /**
     * In case the FeatureFlag found by the `where` argument doesn't exist, create a new FeatureFlag with this data.
     */
    create: XOR<FeatureFlagCreateInput, FeatureFlagUncheckedCreateInput>
    /**
     * In case the FeatureFlag was found with the provided `where` argument, update it with this data.
     */
    update: XOR<FeatureFlagUpdateInput, FeatureFlagUncheckedUpdateInput>
  }

  /**
   * FeatureFlag delete
   */
  export type FeatureFlagDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FeatureFlag
     */
    select?: FeatureFlagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FeatureFlag
     */
    omit?: FeatureFlagOmit<ExtArgs> | null
    /**
     * Filter which FeatureFlag to delete.
     */
    where: FeatureFlagWhereUniqueInput
  }

  /**
   * FeatureFlag deleteMany
   */
  export type FeatureFlagDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which FeatureFlags to delete
     */
    where?: FeatureFlagWhereInput
    /**
     * Limit how many FeatureFlags to delete.
     */
    limit?: number
  }

  /**
   * FeatureFlag without action
   */
  export type FeatureFlagDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FeatureFlag
     */
    select?: FeatureFlagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FeatureFlag
     */
    omit?: FeatureFlagOmit<ExtArgs> | null
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


  export const TenantPlanCacheScalarFieldEnum: {
    tenantId: 'tenantId',
    plan: 'plan',
    updatedAt: 'updatedAt'
  };

  export type TenantPlanCacheScalarFieldEnum = (typeof TenantPlanCacheScalarFieldEnum)[keyof typeof TenantPlanCacheScalarFieldEnum]


  export const AgentKillSwitchScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    agentType: 'agentType',
    disabled: 'disabled',
    reason: 'reason',
    updatedAt: 'updatedAt'
  };

  export type AgentKillSwitchScalarFieldEnum = (typeof AgentKillSwitchScalarFieldEnum)[keyof typeof AgentKillSwitchScalarFieldEnum]


  export const AgentRunCostScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    agentRunId: 'agentRunId',
    agentType: 'agentType',
    status: 'status',
    tokensIn: 'tokensIn',
    tokensOut: 'tokensOut',
    costUsd: 'costUsd',
    latencyMs: 'latencyMs',
    modelName: 'modelName',
    iterations: 'iterations',
    triggeredByUserId: 'triggeredByUserId',
    createdAt: 'createdAt'
  };

  export type AgentRunCostScalarFieldEnum = (typeof AgentRunCostScalarFieldEnum)[keyof typeof AgentRunCostScalarFieldEnum]


  export const FeatureFlagScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    name: 'name',
    enabled: 'enabled',
    metadata: 'metadata',
    updatedAt: 'updatedAt'
  };

  export type FeatureFlagScalarFieldEnum = (typeof FeatureFlagScalarFieldEnum)[keyof typeof FeatureFlagScalarFieldEnum]


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


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


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
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Decimal'
   */
  export type DecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal'>
    


  /**
   * Reference to a field of type 'Decimal[]'
   */
  export type ListDecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal[]'>
    


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
   * Deep Input Types
   */


  export type TenantPlanCacheWhereInput = {
    AND?: TenantPlanCacheWhereInput | TenantPlanCacheWhereInput[]
    OR?: TenantPlanCacheWhereInput[]
    NOT?: TenantPlanCacheWhereInput | TenantPlanCacheWhereInput[]
    tenantId?: StringFilter<"TenantPlanCache"> | string
    plan?: StringFilter<"TenantPlanCache"> | string
    updatedAt?: DateTimeFilter<"TenantPlanCache"> | Date | string
  }

  export type TenantPlanCacheOrderByWithRelationInput = {
    tenantId?: SortOrder
    plan?: SortOrder
    updatedAt?: SortOrder
  }

  export type TenantPlanCacheWhereUniqueInput = Prisma.AtLeast<{
    tenantId?: string
    AND?: TenantPlanCacheWhereInput | TenantPlanCacheWhereInput[]
    OR?: TenantPlanCacheWhereInput[]
    NOT?: TenantPlanCacheWhereInput | TenantPlanCacheWhereInput[]
    plan?: StringFilter<"TenantPlanCache"> | string
    updatedAt?: DateTimeFilter<"TenantPlanCache"> | Date | string
  }, "tenantId">

  export type TenantPlanCacheOrderByWithAggregationInput = {
    tenantId?: SortOrder
    plan?: SortOrder
    updatedAt?: SortOrder
    _count?: TenantPlanCacheCountOrderByAggregateInput
    _max?: TenantPlanCacheMaxOrderByAggregateInput
    _min?: TenantPlanCacheMinOrderByAggregateInput
  }

  export type TenantPlanCacheScalarWhereWithAggregatesInput = {
    AND?: TenantPlanCacheScalarWhereWithAggregatesInput | TenantPlanCacheScalarWhereWithAggregatesInput[]
    OR?: TenantPlanCacheScalarWhereWithAggregatesInput[]
    NOT?: TenantPlanCacheScalarWhereWithAggregatesInput | TenantPlanCacheScalarWhereWithAggregatesInput[]
    tenantId?: StringWithAggregatesFilter<"TenantPlanCache"> | string
    plan?: StringWithAggregatesFilter<"TenantPlanCache"> | string
    updatedAt?: DateTimeWithAggregatesFilter<"TenantPlanCache"> | Date | string
  }

  export type AgentKillSwitchWhereInput = {
    AND?: AgentKillSwitchWhereInput | AgentKillSwitchWhereInput[]
    OR?: AgentKillSwitchWhereInput[]
    NOT?: AgentKillSwitchWhereInput | AgentKillSwitchWhereInput[]
    id?: StringFilter<"AgentKillSwitch"> | string
    tenantId?: StringFilter<"AgentKillSwitch"> | string
    agentType?: StringFilter<"AgentKillSwitch"> | string
    disabled?: BoolFilter<"AgentKillSwitch"> | boolean
    reason?: StringNullableFilter<"AgentKillSwitch"> | string | null
    updatedAt?: DateTimeFilter<"AgentKillSwitch"> | Date | string
  }

  export type AgentKillSwitchOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    agentType?: SortOrder
    disabled?: SortOrder
    reason?: SortOrderInput | SortOrder
    updatedAt?: SortOrder
  }

  export type AgentKillSwitchWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    tenantId_agentType?: AgentKillSwitchTenantIdAgentTypeCompoundUniqueInput
    AND?: AgentKillSwitchWhereInput | AgentKillSwitchWhereInput[]
    OR?: AgentKillSwitchWhereInput[]
    NOT?: AgentKillSwitchWhereInput | AgentKillSwitchWhereInput[]
    tenantId?: StringFilter<"AgentKillSwitch"> | string
    agentType?: StringFilter<"AgentKillSwitch"> | string
    disabled?: BoolFilter<"AgentKillSwitch"> | boolean
    reason?: StringNullableFilter<"AgentKillSwitch"> | string | null
    updatedAt?: DateTimeFilter<"AgentKillSwitch"> | Date | string
  }, "id" | "tenantId_agentType">

  export type AgentKillSwitchOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    agentType?: SortOrder
    disabled?: SortOrder
    reason?: SortOrderInput | SortOrder
    updatedAt?: SortOrder
    _count?: AgentKillSwitchCountOrderByAggregateInput
    _max?: AgentKillSwitchMaxOrderByAggregateInput
    _min?: AgentKillSwitchMinOrderByAggregateInput
  }

  export type AgentKillSwitchScalarWhereWithAggregatesInput = {
    AND?: AgentKillSwitchScalarWhereWithAggregatesInput | AgentKillSwitchScalarWhereWithAggregatesInput[]
    OR?: AgentKillSwitchScalarWhereWithAggregatesInput[]
    NOT?: AgentKillSwitchScalarWhereWithAggregatesInput | AgentKillSwitchScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"AgentKillSwitch"> | string
    tenantId?: StringWithAggregatesFilter<"AgentKillSwitch"> | string
    agentType?: StringWithAggregatesFilter<"AgentKillSwitch"> | string
    disabled?: BoolWithAggregatesFilter<"AgentKillSwitch"> | boolean
    reason?: StringNullableWithAggregatesFilter<"AgentKillSwitch"> | string | null
    updatedAt?: DateTimeWithAggregatesFilter<"AgentKillSwitch"> | Date | string
  }

  export type AgentRunCostWhereInput = {
    AND?: AgentRunCostWhereInput | AgentRunCostWhereInput[]
    OR?: AgentRunCostWhereInput[]
    NOT?: AgentRunCostWhereInput | AgentRunCostWhereInput[]
    id?: StringFilter<"AgentRunCost"> | string
    tenantId?: StringFilter<"AgentRunCost"> | string
    agentRunId?: StringFilter<"AgentRunCost"> | string
    agentType?: StringFilter<"AgentRunCost"> | string
    status?: StringFilter<"AgentRunCost"> | string
    tokensIn?: IntFilter<"AgentRunCost"> | number
    tokensOut?: IntFilter<"AgentRunCost"> | number
    costUsd?: DecimalFilter<"AgentRunCost"> | Decimal | DecimalJsLike | number | string
    latencyMs?: IntFilter<"AgentRunCost"> | number
    modelName?: StringNullableFilter<"AgentRunCost"> | string | null
    iterations?: IntNullableFilter<"AgentRunCost"> | number | null
    triggeredByUserId?: StringNullableFilter<"AgentRunCost"> | string | null
    createdAt?: DateTimeFilter<"AgentRunCost"> | Date | string
  }

  export type AgentRunCostOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    agentRunId?: SortOrder
    agentType?: SortOrder
    status?: SortOrder
    tokensIn?: SortOrder
    tokensOut?: SortOrder
    costUsd?: SortOrder
    latencyMs?: SortOrder
    modelName?: SortOrderInput | SortOrder
    iterations?: SortOrderInput | SortOrder
    triggeredByUserId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
  }

  export type AgentRunCostWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    agentRunId?: string
    AND?: AgentRunCostWhereInput | AgentRunCostWhereInput[]
    OR?: AgentRunCostWhereInput[]
    NOT?: AgentRunCostWhereInput | AgentRunCostWhereInput[]
    tenantId?: StringFilter<"AgentRunCost"> | string
    agentType?: StringFilter<"AgentRunCost"> | string
    status?: StringFilter<"AgentRunCost"> | string
    tokensIn?: IntFilter<"AgentRunCost"> | number
    tokensOut?: IntFilter<"AgentRunCost"> | number
    costUsd?: DecimalFilter<"AgentRunCost"> | Decimal | DecimalJsLike | number | string
    latencyMs?: IntFilter<"AgentRunCost"> | number
    modelName?: StringNullableFilter<"AgentRunCost"> | string | null
    iterations?: IntNullableFilter<"AgentRunCost"> | number | null
    triggeredByUserId?: StringNullableFilter<"AgentRunCost"> | string | null
    createdAt?: DateTimeFilter<"AgentRunCost"> | Date | string
  }, "id" | "agentRunId">

  export type AgentRunCostOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    agentRunId?: SortOrder
    agentType?: SortOrder
    status?: SortOrder
    tokensIn?: SortOrder
    tokensOut?: SortOrder
    costUsd?: SortOrder
    latencyMs?: SortOrder
    modelName?: SortOrderInput | SortOrder
    iterations?: SortOrderInput | SortOrder
    triggeredByUserId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: AgentRunCostCountOrderByAggregateInput
    _avg?: AgentRunCostAvgOrderByAggregateInput
    _max?: AgentRunCostMaxOrderByAggregateInput
    _min?: AgentRunCostMinOrderByAggregateInput
    _sum?: AgentRunCostSumOrderByAggregateInput
  }

  export type AgentRunCostScalarWhereWithAggregatesInput = {
    AND?: AgentRunCostScalarWhereWithAggregatesInput | AgentRunCostScalarWhereWithAggregatesInput[]
    OR?: AgentRunCostScalarWhereWithAggregatesInput[]
    NOT?: AgentRunCostScalarWhereWithAggregatesInput | AgentRunCostScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"AgentRunCost"> | string
    tenantId?: StringWithAggregatesFilter<"AgentRunCost"> | string
    agentRunId?: StringWithAggregatesFilter<"AgentRunCost"> | string
    agentType?: StringWithAggregatesFilter<"AgentRunCost"> | string
    status?: StringWithAggregatesFilter<"AgentRunCost"> | string
    tokensIn?: IntWithAggregatesFilter<"AgentRunCost"> | number
    tokensOut?: IntWithAggregatesFilter<"AgentRunCost"> | number
    costUsd?: DecimalWithAggregatesFilter<"AgentRunCost"> | Decimal | DecimalJsLike | number | string
    latencyMs?: IntWithAggregatesFilter<"AgentRunCost"> | number
    modelName?: StringNullableWithAggregatesFilter<"AgentRunCost"> | string | null
    iterations?: IntNullableWithAggregatesFilter<"AgentRunCost"> | number | null
    triggeredByUserId?: StringNullableWithAggregatesFilter<"AgentRunCost"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"AgentRunCost"> | Date | string
  }

  export type FeatureFlagWhereInput = {
    AND?: FeatureFlagWhereInput | FeatureFlagWhereInput[]
    OR?: FeatureFlagWhereInput[]
    NOT?: FeatureFlagWhereInput | FeatureFlagWhereInput[]
    id?: StringFilter<"FeatureFlag"> | string
    tenantId?: StringFilter<"FeatureFlag"> | string
    name?: StringFilter<"FeatureFlag"> | string
    enabled?: BoolFilter<"FeatureFlag"> | boolean
    metadata?: JsonFilter<"FeatureFlag">
    updatedAt?: DateTimeFilter<"FeatureFlag"> | Date | string
  }

  export type FeatureFlagOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    name?: SortOrder
    enabled?: SortOrder
    metadata?: SortOrder
    updatedAt?: SortOrder
  }

  export type FeatureFlagWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    tenantId_name?: FeatureFlagTenantIdNameCompoundUniqueInput
    AND?: FeatureFlagWhereInput | FeatureFlagWhereInput[]
    OR?: FeatureFlagWhereInput[]
    NOT?: FeatureFlagWhereInput | FeatureFlagWhereInput[]
    tenantId?: StringFilter<"FeatureFlag"> | string
    name?: StringFilter<"FeatureFlag"> | string
    enabled?: BoolFilter<"FeatureFlag"> | boolean
    metadata?: JsonFilter<"FeatureFlag">
    updatedAt?: DateTimeFilter<"FeatureFlag"> | Date | string
  }, "id" | "tenantId_name">

  export type FeatureFlagOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    name?: SortOrder
    enabled?: SortOrder
    metadata?: SortOrder
    updatedAt?: SortOrder
    _count?: FeatureFlagCountOrderByAggregateInput
    _max?: FeatureFlagMaxOrderByAggregateInput
    _min?: FeatureFlagMinOrderByAggregateInput
  }

  export type FeatureFlagScalarWhereWithAggregatesInput = {
    AND?: FeatureFlagScalarWhereWithAggregatesInput | FeatureFlagScalarWhereWithAggregatesInput[]
    OR?: FeatureFlagScalarWhereWithAggregatesInput[]
    NOT?: FeatureFlagScalarWhereWithAggregatesInput | FeatureFlagScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"FeatureFlag"> | string
    tenantId?: StringWithAggregatesFilter<"FeatureFlag"> | string
    name?: StringWithAggregatesFilter<"FeatureFlag"> | string
    enabled?: BoolWithAggregatesFilter<"FeatureFlag"> | boolean
    metadata?: JsonWithAggregatesFilter<"FeatureFlag">
    updatedAt?: DateTimeWithAggregatesFilter<"FeatureFlag"> | Date | string
  }

  export type TenantPlanCacheCreateInput = {
    tenantId: string
    plan: string
    updatedAt?: Date | string
  }

  export type TenantPlanCacheUncheckedCreateInput = {
    tenantId: string
    plan: string
    updatedAt?: Date | string
  }

  export type TenantPlanCacheUpdateInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    plan?: StringFieldUpdateOperationsInput | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantPlanCacheUncheckedUpdateInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    plan?: StringFieldUpdateOperationsInput | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantPlanCacheCreateManyInput = {
    tenantId: string
    plan: string
    updatedAt?: Date | string
  }

  export type TenantPlanCacheUpdateManyMutationInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    plan?: StringFieldUpdateOperationsInput | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantPlanCacheUncheckedUpdateManyInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    plan?: StringFieldUpdateOperationsInput | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AgentKillSwitchCreateInput = {
    id?: string
    tenantId: string
    agentType: string
    disabled?: boolean
    reason?: string | null
    updatedAt?: Date | string
  }

  export type AgentKillSwitchUncheckedCreateInput = {
    id?: string
    tenantId: string
    agentType: string
    disabled?: boolean
    reason?: string | null
    updatedAt?: Date | string
  }

  export type AgentKillSwitchUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    agentType?: StringFieldUpdateOperationsInput | string
    disabled?: BoolFieldUpdateOperationsInput | boolean
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AgentKillSwitchUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    agentType?: StringFieldUpdateOperationsInput | string
    disabled?: BoolFieldUpdateOperationsInput | boolean
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AgentKillSwitchCreateManyInput = {
    id?: string
    tenantId: string
    agentType: string
    disabled?: boolean
    reason?: string | null
    updatedAt?: Date | string
  }

  export type AgentKillSwitchUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    agentType?: StringFieldUpdateOperationsInput | string
    disabled?: BoolFieldUpdateOperationsInput | boolean
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AgentKillSwitchUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    agentType?: StringFieldUpdateOperationsInput | string
    disabled?: BoolFieldUpdateOperationsInput | boolean
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AgentRunCostCreateInput = {
    id?: string
    tenantId: string
    agentRunId: string
    agentType: string
    status: string
    tokensIn: number
    tokensOut: number
    costUsd: Decimal | DecimalJsLike | number | string
    latencyMs: number
    modelName?: string | null
    iterations?: number | null
    triggeredByUserId?: string | null
    createdAt?: Date | string
  }

  export type AgentRunCostUncheckedCreateInput = {
    id?: string
    tenantId: string
    agentRunId: string
    agentType: string
    status: string
    tokensIn: number
    tokensOut: number
    costUsd: Decimal | DecimalJsLike | number | string
    latencyMs: number
    modelName?: string | null
    iterations?: number | null
    triggeredByUserId?: string | null
    createdAt?: Date | string
  }

  export type AgentRunCostUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    agentRunId?: StringFieldUpdateOperationsInput | string
    agentType?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    tokensIn?: IntFieldUpdateOperationsInput | number
    tokensOut?: IntFieldUpdateOperationsInput | number
    costUsd?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    latencyMs?: IntFieldUpdateOperationsInput | number
    modelName?: NullableStringFieldUpdateOperationsInput | string | null
    iterations?: NullableIntFieldUpdateOperationsInput | number | null
    triggeredByUserId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AgentRunCostUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    agentRunId?: StringFieldUpdateOperationsInput | string
    agentType?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    tokensIn?: IntFieldUpdateOperationsInput | number
    tokensOut?: IntFieldUpdateOperationsInput | number
    costUsd?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    latencyMs?: IntFieldUpdateOperationsInput | number
    modelName?: NullableStringFieldUpdateOperationsInput | string | null
    iterations?: NullableIntFieldUpdateOperationsInput | number | null
    triggeredByUserId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AgentRunCostCreateManyInput = {
    id?: string
    tenantId: string
    agentRunId: string
    agentType: string
    status: string
    tokensIn: number
    tokensOut: number
    costUsd: Decimal | DecimalJsLike | number | string
    latencyMs: number
    modelName?: string | null
    iterations?: number | null
    triggeredByUserId?: string | null
    createdAt?: Date | string
  }

  export type AgentRunCostUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    agentRunId?: StringFieldUpdateOperationsInput | string
    agentType?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    tokensIn?: IntFieldUpdateOperationsInput | number
    tokensOut?: IntFieldUpdateOperationsInput | number
    costUsd?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    latencyMs?: IntFieldUpdateOperationsInput | number
    modelName?: NullableStringFieldUpdateOperationsInput | string | null
    iterations?: NullableIntFieldUpdateOperationsInput | number | null
    triggeredByUserId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AgentRunCostUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    agentRunId?: StringFieldUpdateOperationsInput | string
    agentType?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    tokensIn?: IntFieldUpdateOperationsInput | number
    tokensOut?: IntFieldUpdateOperationsInput | number
    costUsd?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    latencyMs?: IntFieldUpdateOperationsInput | number
    modelName?: NullableStringFieldUpdateOperationsInput | string | null
    iterations?: NullableIntFieldUpdateOperationsInput | number | null
    triggeredByUserId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FeatureFlagCreateInput = {
    id?: string
    tenantId: string
    name: string
    enabled?: boolean
    metadata?: JsonNullValueInput | InputJsonValue
    updatedAt?: Date | string
  }

  export type FeatureFlagUncheckedCreateInput = {
    id?: string
    tenantId: string
    name: string
    enabled?: boolean
    metadata?: JsonNullValueInput | InputJsonValue
    updatedAt?: Date | string
  }

  export type FeatureFlagUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    enabled?: BoolFieldUpdateOperationsInput | boolean
    metadata?: JsonNullValueInput | InputJsonValue
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FeatureFlagUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    enabled?: BoolFieldUpdateOperationsInput | boolean
    metadata?: JsonNullValueInput | InputJsonValue
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FeatureFlagCreateManyInput = {
    id?: string
    tenantId: string
    name: string
    enabled?: boolean
    metadata?: JsonNullValueInput | InputJsonValue
    updatedAt?: Date | string
  }

  export type FeatureFlagUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    enabled?: BoolFieldUpdateOperationsInput | boolean
    metadata?: JsonNullValueInput | InputJsonValue
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FeatureFlagUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    enabled?: BoolFieldUpdateOperationsInput | boolean
    metadata?: JsonNullValueInput | InputJsonValue
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
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

  export type TenantPlanCacheCountOrderByAggregateInput = {
    tenantId?: SortOrder
    plan?: SortOrder
    updatedAt?: SortOrder
  }

  export type TenantPlanCacheMaxOrderByAggregateInput = {
    tenantId?: SortOrder
    plan?: SortOrder
    updatedAt?: SortOrder
  }

  export type TenantPlanCacheMinOrderByAggregateInput = {
    tenantId?: SortOrder
    plan?: SortOrder
    updatedAt?: SortOrder
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

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
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

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type AgentKillSwitchTenantIdAgentTypeCompoundUniqueInput = {
    tenantId: string
    agentType: string
  }

  export type AgentKillSwitchCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    agentType?: SortOrder
    disabled?: SortOrder
    reason?: SortOrder
    updatedAt?: SortOrder
  }

  export type AgentKillSwitchMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    agentType?: SortOrder
    disabled?: SortOrder
    reason?: SortOrder
    updatedAt?: SortOrder
  }

  export type AgentKillSwitchMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    agentType?: SortOrder
    disabled?: SortOrder
    reason?: SortOrder
    updatedAt?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
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

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type AgentRunCostCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    agentRunId?: SortOrder
    agentType?: SortOrder
    status?: SortOrder
    tokensIn?: SortOrder
    tokensOut?: SortOrder
    costUsd?: SortOrder
    latencyMs?: SortOrder
    modelName?: SortOrder
    iterations?: SortOrder
    triggeredByUserId?: SortOrder
    createdAt?: SortOrder
  }

  export type AgentRunCostAvgOrderByAggregateInput = {
    tokensIn?: SortOrder
    tokensOut?: SortOrder
    costUsd?: SortOrder
    latencyMs?: SortOrder
    iterations?: SortOrder
  }

  export type AgentRunCostMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    agentRunId?: SortOrder
    agentType?: SortOrder
    status?: SortOrder
    tokensIn?: SortOrder
    tokensOut?: SortOrder
    costUsd?: SortOrder
    latencyMs?: SortOrder
    modelName?: SortOrder
    iterations?: SortOrder
    triggeredByUserId?: SortOrder
    createdAt?: SortOrder
  }

  export type AgentRunCostMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    agentRunId?: SortOrder
    agentType?: SortOrder
    status?: SortOrder
    tokensIn?: SortOrder
    tokensOut?: SortOrder
    costUsd?: SortOrder
    latencyMs?: SortOrder
    modelName?: SortOrder
    iterations?: SortOrder
    triggeredByUserId?: SortOrder
    createdAt?: SortOrder
  }

  export type AgentRunCostSumOrderByAggregateInput = {
    tokensIn?: SortOrder
    tokensOut?: SortOrder
    costUsd?: SortOrder
    latencyMs?: SortOrder
    iterations?: SortOrder
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

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
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

  export type FeatureFlagTenantIdNameCompoundUniqueInput = {
    tenantId: string
    name: string
  }

  export type FeatureFlagCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    name?: SortOrder
    enabled?: SortOrder
    metadata?: SortOrder
    updatedAt?: SortOrder
  }

  export type FeatureFlagMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    name?: SortOrder
    enabled?: SortOrder
    updatedAt?: SortOrder
  }

  export type FeatureFlagMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    name?: SortOrder
    enabled?: SortOrder
    updatedAt?: SortOrder
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

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
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

  export type DecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
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

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
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

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
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