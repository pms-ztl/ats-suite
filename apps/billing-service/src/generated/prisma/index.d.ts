
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
 * Model ModuleRegistry
 * 
 */
export type ModuleRegistry = $Result.DefaultSelection<Prisma.$ModuleRegistryPayload>
/**
 * Model TenantModule
 * 
 */
export type TenantModule = $Result.DefaultSelection<Prisma.$TenantModulePayload>
/**
 * Model PlatformAgentKillSwitch
 * 
 */
export type PlatformAgentKillSwitch = $Result.DefaultSelection<Prisma.$PlatformAgentKillSwitchPayload>
/**
 * Model PlatformKillAudit
 * 
 */
export type PlatformKillAudit = $Result.DefaultSelection<Prisma.$PlatformKillAuditPayload>
/**
 * Model StripeSubscription
 * 
 */
export type StripeSubscription = $Result.DefaultSelection<Prisma.$StripeSubscriptionPayload>
/**
 * Model StripeWebhookEvent
 * 
 */
export type StripeWebhookEvent = $Result.DefaultSelection<Prisma.$StripeWebhookEventPayload>
/**
 * Model PromptOverride
 * 
 */
export type PromptOverride = $Result.DefaultSelection<Prisma.$PromptOverridePayload>

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

  /**
   * `prisma.moduleRegistry`: Exposes CRUD operations for the **ModuleRegistry** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ModuleRegistries
    * const moduleRegistries = await prisma.moduleRegistry.findMany()
    * ```
    */
  get moduleRegistry(): Prisma.ModuleRegistryDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.tenantModule`: Exposes CRUD operations for the **TenantModule** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TenantModules
    * const tenantModules = await prisma.tenantModule.findMany()
    * ```
    */
  get tenantModule(): Prisma.TenantModuleDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.platformAgentKillSwitch`: Exposes CRUD operations for the **PlatformAgentKillSwitch** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PlatformAgentKillSwitches
    * const platformAgentKillSwitches = await prisma.platformAgentKillSwitch.findMany()
    * ```
    */
  get platformAgentKillSwitch(): Prisma.PlatformAgentKillSwitchDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.platformKillAudit`: Exposes CRUD operations for the **PlatformKillAudit** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PlatformKillAudits
    * const platformKillAudits = await prisma.platformKillAudit.findMany()
    * ```
    */
  get platformKillAudit(): Prisma.PlatformKillAuditDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.stripeSubscription`: Exposes CRUD operations for the **StripeSubscription** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more StripeSubscriptions
    * const stripeSubscriptions = await prisma.stripeSubscription.findMany()
    * ```
    */
  get stripeSubscription(): Prisma.StripeSubscriptionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.stripeWebhookEvent`: Exposes CRUD operations for the **StripeWebhookEvent** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more StripeWebhookEvents
    * const stripeWebhookEvents = await prisma.stripeWebhookEvent.findMany()
    * ```
    */
  get stripeWebhookEvent(): Prisma.StripeWebhookEventDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.promptOverride`: Exposes CRUD operations for the **PromptOverride** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PromptOverrides
    * const promptOverrides = await prisma.promptOverride.findMany()
    * ```
    */
  get promptOverride(): Prisma.PromptOverrideDelegate<ExtArgs, ClientOptions>;
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
    FeatureFlag: 'FeatureFlag',
    ModuleRegistry: 'ModuleRegistry',
    TenantModule: 'TenantModule',
    PlatformAgentKillSwitch: 'PlatformAgentKillSwitch',
    PlatformKillAudit: 'PlatformKillAudit',
    StripeSubscription: 'StripeSubscription',
    StripeWebhookEvent: 'StripeWebhookEvent',
    PromptOverride: 'PromptOverride'
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
      modelProps: "tenantPlanCache" | "agentKillSwitch" | "agentRunCost" | "featureFlag" | "moduleRegistry" | "tenantModule" | "platformAgentKillSwitch" | "platformKillAudit" | "stripeSubscription" | "stripeWebhookEvent" | "promptOverride"
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
      ModuleRegistry: {
        payload: Prisma.$ModuleRegistryPayload<ExtArgs>
        fields: Prisma.ModuleRegistryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ModuleRegistryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ModuleRegistryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ModuleRegistryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ModuleRegistryPayload>
          }
          findFirst: {
            args: Prisma.ModuleRegistryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ModuleRegistryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ModuleRegistryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ModuleRegistryPayload>
          }
          findMany: {
            args: Prisma.ModuleRegistryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ModuleRegistryPayload>[]
          }
          create: {
            args: Prisma.ModuleRegistryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ModuleRegistryPayload>
          }
          createMany: {
            args: Prisma.ModuleRegistryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ModuleRegistryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ModuleRegistryPayload>[]
          }
          delete: {
            args: Prisma.ModuleRegistryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ModuleRegistryPayload>
          }
          update: {
            args: Prisma.ModuleRegistryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ModuleRegistryPayload>
          }
          deleteMany: {
            args: Prisma.ModuleRegistryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ModuleRegistryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ModuleRegistryUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ModuleRegistryPayload>[]
          }
          upsert: {
            args: Prisma.ModuleRegistryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ModuleRegistryPayload>
          }
          aggregate: {
            args: Prisma.ModuleRegistryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateModuleRegistry>
          }
          groupBy: {
            args: Prisma.ModuleRegistryGroupByArgs<ExtArgs>
            result: $Utils.Optional<ModuleRegistryGroupByOutputType>[]
          }
          count: {
            args: Prisma.ModuleRegistryCountArgs<ExtArgs>
            result: $Utils.Optional<ModuleRegistryCountAggregateOutputType> | number
          }
        }
      }
      TenantModule: {
        payload: Prisma.$TenantModulePayload<ExtArgs>
        fields: Prisma.TenantModuleFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TenantModuleFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantModulePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TenantModuleFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantModulePayload>
          }
          findFirst: {
            args: Prisma.TenantModuleFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantModulePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TenantModuleFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantModulePayload>
          }
          findMany: {
            args: Prisma.TenantModuleFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantModulePayload>[]
          }
          create: {
            args: Prisma.TenantModuleCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantModulePayload>
          }
          createMany: {
            args: Prisma.TenantModuleCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TenantModuleCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantModulePayload>[]
          }
          delete: {
            args: Prisma.TenantModuleDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantModulePayload>
          }
          update: {
            args: Prisma.TenantModuleUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantModulePayload>
          }
          deleteMany: {
            args: Prisma.TenantModuleDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TenantModuleUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TenantModuleUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantModulePayload>[]
          }
          upsert: {
            args: Prisma.TenantModuleUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantModulePayload>
          }
          aggregate: {
            args: Prisma.TenantModuleAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTenantModule>
          }
          groupBy: {
            args: Prisma.TenantModuleGroupByArgs<ExtArgs>
            result: $Utils.Optional<TenantModuleGroupByOutputType>[]
          }
          count: {
            args: Prisma.TenantModuleCountArgs<ExtArgs>
            result: $Utils.Optional<TenantModuleCountAggregateOutputType> | number
          }
        }
      }
      PlatformAgentKillSwitch: {
        payload: Prisma.$PlatformAgentKillSwitchPayload<ExtArgs>
        fields: Prisma.PlatformAgentKillSwitchFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PlatformAgentKillSwitchFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlatformAgentKillSwitchPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PlatformAgentKillSwitchFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlatformAgentKillSwitchPayload>
          }
          findFirst: {
            args: Prisma.PlatformAgentKillSwitchFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlatformAgentKillSwitchPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PlatformAgentKillSwitchFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlatformAgentKillSwitchPayload>
          }
          findMany: {
            args: Prisma.PlatformAgentKillSwitchFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlatformAgentKillSwitchPayload>[]
          }
          create: {
            args: Prisma.PlatformAgentKillSwitchCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlatformAgentKillSwitchPayload>
          }
          createMany: {
            args: Prisma.PlatformAgentKillSwitchCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PlatformAgentKillSwitchCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlatformAgentKillSwitchPayload>[]
          }
          delete: {
            args: Prisma.PlatformAgentKillSwitchDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlatformAgentKillSwitchPayload>
          }
          update: {
            args: Prisma.PlatformAgentKillSwitchUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlatformAgentKillSwitchPayload>
          }
          deleteMany: {
            args: Prisma.PlatformAgentKillSwitchDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PlatformAgentKillSwitchUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PlatformAgentKillSwitchUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlatformAgentKillSwitchPayload>[]
          }
          upsert: {
            args: Prisma.PlatformAgentKillSwitchUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlatformAgentKillSwitchPayload>
          }
          aggregate: {
            args: Prisma.PlatformAgentKillSwitchAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePlatformAgentKillSwitch>
          }
          groupBy: {
            args: Prisma.PlatformAgentKillSwitchGroupByArgs<ExtArgs>
            result: $Utils.Optional<PlatformAgentKillSwitchGroupByOutputType>[]
          }
          count: {
            args: Prisma.PlatformAgentKillSwitchCountArgs<ExtArgs>
            result: $Utils.Optional<PlatformAgentKillSwitchCountAggregateOutputType> | number
          }
        }
      }
      PlatformKillAudit: {
        payload: Prisma.$PlatformKillAuditPayload<ExtArgs>
        fields: Prisma.PlatformKillAuditFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PlatformKillAuditFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlatformKillAuditPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PlatformKillAuditFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlatformKillAuditPayload>
          }
          findFirst: {
            args: Prisma.PlatformKillAuditFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlatformKillAuditPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PlatformKillAuditFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlatformKillAuditPayload>
          }
          findMany: {
            args: Prisma.PlatformKillAuditFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlatformKillAuditPayload>[]
          }
          create: {
            args: Prisma.PlatformKillAuditCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlatformKillAuditPayload>
          }
          createMany: {
            args: Prisma.PlatformKillAuditCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PlatformKillAuditCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlatformKillAuditPayload>[]
          }
          delete: {
            args: Prisma.PlatformKillAuditDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlatformKillAuditPayload>
          }
          update: {
            args: Prisma.PlatformKillAuditUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlatformKillAuditPayload>
          }
          deleteMany: {
            args: Prisma.PlatformKillAuditDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PlatformKillAuditUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PlatformKillAuditUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlatformKillAuditPayload>[]
          }
          upsert: {
            args: Prisma.PlatformKillAuditUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlatformKillAuditPayload>
          }
          aggregate: {
            args: Prisma.PlatformKillAuditAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePlatformKillAudit>
          }
          groupBy: {
            args: Prisma.PlatformKillAuditGroupByArgs<ExtArgs>
            result: $Utils.Optional<PlatformKillAuditGroupByOutputType>[]
          }
          count: {
            args: Prisma.PlatformKillAuditCountArgs<ExtArgs>
            result: $Utils.Optional<PlatformKillAuditCountAggregateOutputType> | number
          }
        }
      }
      StripeSubscription: {
        payload: Prisma.$StripeSubscriptionPayload<ExtArgs>
        fields: Prisma.StripeSubscriptionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.StripeSubscriptionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StripeSubscriptionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.StripeSubscriptionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StripeSubscriptionPayload>
          }
          findFirst: {
            args: Prisma.StripeSubscriptionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StripeSubscriptionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.StripeSubscriptionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StripeSubscriptionPayload>
          }
          findMany: {
            args: Prisma.StripeSubscriptionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StripeSubscriptionPayload>[]
          }
          create: {
            args: Prisma.StripeSubscriptionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StripeSubscriptionPayload>
          }
          createMany: {
            args: Prisma.StripeSubscriptionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.StripeSubscriptionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StripeSubscriptionPayload>[]
          }
          delete: {
            args: Prisma.StripeSubscriptionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StripeSubscriptionPayload>
          }
          update: {
            args: Prisma.StripeSubscriptionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StripeSubscriptionPayload>
          }
          deleteMany: {
            args: Prisma.StripeSubscriptionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.StripeSubscriptionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.StripeSubscriptionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StripeSubscriptionPayload>[]
          }
          upsert: {
            args: Prisma.StripeSubscriptionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StripeSubscriptionPayload>
          }
          aggregate: {
            args: Prisma.StripeSubscriptionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateStripeSubscription>
          }
          groupBy: {
            args: Prisma.StripeSubscriptionGroupByArgs<ExtArgs>
            result: $Utils.Optional<StripeSubscriptionGroupByOutputType>[]
          }
          count: {
            args: Prisma.StripeSubscriptionCountArgs<ExtArgs>
            result: $Utils.Optional<StripeSubscriptionCountAggregateOutputType> | number
          }
        }
      }
      StripeWebhookEvent: {
        payload: Prisma.$StripeWebhookEventPayload<ExtArgs>
        fields: Prisma.StripeWebhookEventFieldRefs
        operations: {
          findUnique: {
            args: Prisma.StripeWebhookEventFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StripeWebhookEventPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.StripeWebhookEventFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StripeWebhookEventPayload>
          }
          findFirst: {
            args: Prisma.StripeWebhookEventFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StripeWebhookEventPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.StripeWebhookEventFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StripeWebhookEventPayload>
          }
          findMany: {
            args: Prisma.StripeWebhookEventFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StripeWebhookEventPayload>[]
          }
          create: {
            args: Prisma.StripeWebhookEventCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StripeWebhookEventPayload>
          }
          createMany: {
            args: Prisma.StripeWebhookEventCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.StripeWebhookEventCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StripeWebhookEventPayload>[]
          }
          delete: {
            args: Prisma.StripeWebhookEventDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StripeWebhookEventPayload>
          }
          update: {
            args: Prisma.StripeWebhookEventUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StripeWebhookEventPayload>
          }
          deleteMany: {
            args: Prisma.StripeWebhookEventDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.StripeWebhookEventUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.StripeWebhookEventUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StripeWebhookEventPayload>[]
          }
          upsert: {
            args: Prisma.StripeWebhookEventUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StripeWebhookEventPayload>
          }
          aggregate: {
            args: Prisma.StripeWebhookEventAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateStripeWebhookEvent>
          }
          groupBy: {
            args: Prisma.StripeWebhookEventGroupByArgs<ExtArgs>
            result: $Utils.Optional<StripeWebhookEventGroupByOutputType>[]
          }
          count: {
            args: Prisma.StripeWebhookEventCountArgs<ExtArgs>
            result: $Utils.Optional<StripeWebhookEventCountAggregateOutputType> | number
          }
        }
      }
      PromptOverride: {
        payload: Prisma.$PromptOverridePayload<ExtArgs>
        fields: Prisma.PromptOverrideFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PromptOverrideFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PromptOverridePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PromptOverrideFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PromptOverridePayload>
          }
          findFirst: {
            args: Prisma.PromptOverrideFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PromptOverridePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PromptOverrideFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PromptOverridePayload>
          }
          findMany: {
            args: Prisma.PromptOverrideFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PromptOverridePayload>[]
          }
          create: {
            args: Prisma.PromptOverrideCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PromptOverridePayload>
          }
          createMany: {
            args: Prisma.PromptOverrideCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PromptOverrideCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PromptOverridePayload>[]
          }
          delete: {
            args: Prisma.PromptOverrideDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PromptOverridePayload>
          }
          update: {
            args: Prisma.PromptOverrideUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PromptOverridePayload>
          }
          deleteMany: {
            args: Prisma.PromptOverrideDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PromptOverrideUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PromptOverrideUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PromptOverridePayload>[]
          }
          upsert: {
            args: Prisma.PromptOverrideUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PromptOverridePayload>
          }
          aggregate: {
            args: Prisma.PromptOverrideAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePromptOverride>
          }
          groupBy: {
            args: Prisma.PromptOverrideGroupByArgs<ExtArgs>
            result: $Utils.Optional<PromptOverrideGroupByOutputType>[]
          }
          count: {
            args: Prisma.PromptOverrideCountArgs<ExtArgs>
            result: $Utils.Optional<PromptOverrideCountAggregateOutputType> | number
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
    moduleRegistry?: ModuleRegistryOmit
    tenantModule?: TenantModuleOmit
    platformAgentKillSwitch?: PlatformAgentKillSwitchOmit
    platformKillAudit?: PlatformKillAuditOmit
    stripeSubscription?: StripeSubscriptionOmit
    stripeWebhookEvent?: StripeWebhookEventOmit
    promptOverride?: PromptOverrideOmit
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
   * Model ModuleRegistry
   */

  export type AggregateModuleRegistry = {
    _count: ModuleRegistryCountAggregateOutputType | null
    _min: ModuleRegistryMinAggregateOutputType | null
    _max: ModuleRegistryMaxAggregateOutputType | null
  }

  export type ModuleRegistryMinAggregateOutputType = {
    id: string | null
    key: string | null
    name: string | null
    version: string | null
    category: string | null
    type: string | null
    requiresPlan: string | null
    defaultEnabled: boolean | null
    createdAt: Date | null
  }

  export type ModuleRegistryMaxAggregateOutputType = {
    id: string | null
    key: string | null
    name: string | null
    version: string | null
    category: string | null
    type: string | null
    requiresPlan: string | null
    defaultEnabled: boolean | null
    createdAt: Date | null
  }

  export type ModuleRegistryCountAggregateOutputType = {
    id: number
    key: number
    name: number
    version: number
    category: number
    type: number
    requiresPlan: number
    manifest: number
    defaultEnabled: number
    createdAt: number
    _all: number
  }


  export type ModuleRegistryMinAggregateInputType = {
    id?: true
    key?: true
    name?: true
    version?: true
    category?: true
    type?: true
    requiresPlan?: true
    defaultEnabled?: true
    createdAt?: true
  }

  export type ModuleRegistryMaxAggregateInputType = {
    id?: true
    key?: true
    name?: true
    version?: true
    category?: true
    type?: true
    requiresPlan?: true
    defaultEnabled?: true
    createdAt?: true
  }

  export type ModuleRegistryCountAggregateInputType = {
    id?: true
    key?: true
    name?: true
    version?: true
    category?: true
    type?: true
    requiresPlan?: true
    manifest?: true
    defaultEnabled?: true
    createdAt?: true
    _all?: true
  }

  export type ModuleRegistryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ModuleRegistry to aggregate.
     */
    where?: ModuleRegistryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ModuleRegistries to fetch.
     */
    orderBy?: ModuleRegistryOrderByWithRelationInput | ModuleRegistryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ModuleRegistryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ModuleRegistries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ModuleRegistries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ModuleRegistries
    **/
    _count?: true | ModuleRegistryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ModuleRegistryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ModuleRegistryMaxAggregateInputType
  }

  export type GetModuleRegistryAggregateType<T extends ModuleRegistryAggregateArgs> = {
        [P in keyof T & keyof AggregateModuleRegistry]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateModuleRegistry[P]>
      : GetScalarType<T[P], AggregateModuleRegistry[P]>
  }




  export type ModuleRegistryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ModuleRegistryWhereInput
    orderBy?: ModuleRegistryOrderByWithAggregationInput | ModuleRegistryOrderByWithAggregationInput[]
    by: ModuleRegistryScalarFieldEnum[] | ModuleRegistryScalarFieldEnum
    having?: ModuleRegistryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ModuleRegistryCountAggregateInputType | true
    _min?: ModuleRegistryMinAggregateInputType
    _max?: ModuleRegistryMaxAggregateInputType
  }

  export type ModuleRegistryGroupByOutputType = {
    id: string
    key: string
    name: string
    version: string
    category: string
    type: string
    requiresPlan: string | null
    manifest: JsonValue
    defaultEnabled: boolean
    createdAt: Date
    _count: ModuleRegistryCountAggregateOutputType | null
    _min: ModuleRegistryMinAggregateOutputType | null
    _max: ModuleRegistryMaxAggregateOutputType | null
  }

  type GetModuleRegistryGroupByPayload<T extends ModuleRegistryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ModuleRegistryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ModuleRegistryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ModuleRegistryGroupByOutputType[P]>
            : GetScalarType<T[P], ModuleRegistryGroupByOutputType[P]>
        }
      >
    >


  export type ModuleRegistrySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    key?: boolean
    name?: boolean
    version?: boolean
    category?: boolean
    type?: boolean
    requiresPlan?: boolean
    manifest?: boolean
    defaultEnabled?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["moduleRegistry"]>

  export type ModuleRegistrySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    key?: boolean
    name?: boolean
    version?: boolean
    category?: boolean
    type?: boolean
    requiresPlan?: boolean
    manifest?: boolean
    defaultEnabled?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["moduleRegistry"]>

  export type ModuleRegistrySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    key?: boolean
    name?: boolean
    version?: boolean
    category?: boolean
    type?: boolean
    requiresPlan?: boolean
    manifest?: boolean
    defaultEnabled?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["moduleRegistry"]>

  export type ModuleRegistrySelectScalar = {
    id?: boolean
    key?: boolean
    name?: boolean
    version?: boolean
    category?: boolean
    type?: boolean
    requiresPlan?: boolean
    manifest?: boolean
    defaultEnabled?: boolean
    createdAt?: boolean
  }

  export type ModuleRegistryOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "key" | "name" | "version" | "category" | "type" | "requiresPlan" | "manifest" | "defaultEnabled" | "createdAt", ExtArgs["result"]["moduleRegistry"]>

  export type $ModuleRegistryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ModuleRegistry"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      key: string
      name: string
      version: string
      category: string
      type: string
      requiresPlan: string | null
      manifest: Prisma.JsonValue
      defaultEnabled: boolean
      createdAt: Date
    }, ExtArgs["result"]["moduleRegistry"]>
    composites: {}
  }

  type ModuleRegistryGetPayload<S extends boolean | null | undefined | ModuleRegistryDefaultArgs> = $Result.GetResult<Prisma.$ModuleRegistryPayload, S>

  type ModuleRegistryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ModuleRegistryFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ModuleRegistryCountAggregateInputType | true
    }

  export interface ModuleRegistryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ModuleRegistry'], meta: { name: 'ModuleRegistry' } }
    /**
     * Find zero or one ModuleRegistry that matches the filter.
     * @param {ModuleRegistryFindUniqueArgs} args - Arguments to find a ModuleRegistry
     * @example
     * // Get one ModuleRegistry
     * const moduleRegistry = await prisma.moduleRegistry.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ModuleRegistryFindUniqueArgs>(args: SelectSubset<T, ModuleRegistryFindUniqueArgs<ExtArgs>>): Prisma__ModuleRegistryClient<$Result.GetResult<Prisma.$ModuleRegistryPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ModuleRegistry that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ModuleRegistryFindUniqueOrThrowArgs} args - Arguments to find a ModuleRegistry
     * @example
     * // Get one ModuleRegistry
     * const moduleRegistry = await prisma.moduleRegistry.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ModuleRegistryFindUniqueOrThrowArgs>(args: SelectSubset<T, ModuleRegistryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ModuleRegistryClient<$Result.GetResult<Prisma.$ModuleRegistryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ModuleRegistry that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ModuleRegistryFindFirstArgs} args - Arguments to find a ModuleRegistry
     * @example
     * // Get one ModuleRegistry
     * const moduleRegistry = await prisma.moduleRegistry.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ModuleRegistryFindFirstArgs>(args?: SelectSubset<T, ModuleRegistryFindFirstArgs<ExtArgs>>): Prisma__ModuleRegistryClient<$Result.GetResult<Prisma.$ModuleRegistryPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ModuleRegistry that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ModuleRegistryFindFirstOrThrowArgs} args - Arguments to find a ModuleRegistry
     * @example
     * // Get one ModuleRegistry
     * const moduleRegistry = await prisma.moduleRegistry.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ModuleRegistryFindFirstOrThrowArgs>(args?: SelectSubset<T, ModuleRegistryFindFirstOrThrowArgs<ExtArgs>>): Prisma__ModuleRegistryClient<$Result.GetResult<Prisma.$ModuleRegistryPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ModuleRegistries that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ModuleRegistryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ModuleRegistries
     * const moduleRegistries = await prisma.moduleRegistry.findMany()
     * 
     * // Get first 10 ModuleRegistries
     * const moduleRegistries = await prisma.moduleRegistry.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const moduleRegistryWithIdOnly = await prisma.moduleRegistry.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ModuleRegistryFindManyArgs>(args?: SelectSubset<T, ModuleRegistryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ModuleRegistryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ModuleRegistry.
     * @param {ModuleRegistryCreateArgs} args - Arguments to create a ModuleRegistry.
     * @example
     * // Create one ModuleRegistry
     * const ModuleRegistry = await prisma.moduleRegistry.create({
     *   data: {
     *     // ... data to create a ModuleRegistry
     *   }
     * })
     * 
     */
    create<T extends ModuleRegistryCreateArgs>(args: SelectSubset<T, ModuleRegistryCreateArgs<ExtArgs>>): Prisma__ModuleRegistryClient<$Result.GetResult<Prisma.$ModuleRegistryPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ModuleRegistries.
     * @param {ModuleRegistryCreateManyArgs} args - Arguments to create many ModuleRegistries.
     * @example
     * // Create many ModuleRegistries
     * const moduleRegistry = await prisma.moduleRegistry.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ModuleRegistryCreateManyArgs>(args?: SelectSubset<T, ModuleRegistryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ModuleRegistries and returns the data saved in the database.
     * @param {ModuleRegistryCreateManyAndReturnArgs} args - Arguments to create many ModuleRegistries.
     * @example
     * // Create many ModuleRegistries
     * const moduleRegistry = await prisma.moduleRegistry.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ModuleRegistries and only return the `id`
     * const moduleRegistryWithIdOnly = await prisma.moduleRegistry.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ModuleRegistryCreateManyAndReturnArgs>(args?: SelectSubset<T, ModuleRegistryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ModuleRegistryPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ModuleRegistry.
     * @param {ModuleRegistryDeleteArgs} args - Arguments to delete one ModuleRegistry.
     * @example
     * // Delete one ModuleRegistry
     * const ModuleRegistry = await prisma.moduleRegistry.delete({
     *   where: {
     *     // ... filter to delete one ModuleRegistry
     *   }
     * })
     * 
     */
    delete<T extends ModuleRegistryDeleteArgs>(args: SelectSubset<T, ModuleRegistryDeleteArgs<ExtArgs>>): Prisma__ModuleRegistryClient<$Result.GetResult<Prisma.$ModuleRegistryPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ModuleRegistry.
     * @param {ModuleRegistryUpdateArgs} args - Arguments to update one ModuleRegistry.
     * @example
     * // Update one ModuleRegistry
     * const moduleRegistry = await prisma.moduleRegistry.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ModuleRegistryUpdateArgs>(args: SelectSubset<T, ModuleRegistryUpdateArgs<ExtArgs>>): Prisma__ModuleRegistryClient<$Result.GetResult<Prisma.$ModuleRegistryPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ModuleRegistries.
     * @param {ModuleRegistryDeleteManyArgs} args - Arguments to filter ModuleRegistries to delete.
     * @example
     * // Delete a few ModuleRegistries
     * const { count } = await prisma.moduleRegistry.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ModuleRegistryDeleteManyArgs>(args?: SelectSubset<T, ModuleRegistryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ModuleRegistries.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ModuleRegistryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ModuleRegistries
     * const moduleRegistry = await prisma.moduleRegistry.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ModuleRegistryUpdateManyArgs>(args: SelectSubset<T, ModuleRegistryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ModuleRegistries and returns the data updated in the database.
     * @param {ModuleRegistryUpdateManyAndReturnArgs} args - Arguments to update many ModuleRegistries.
     * @example
     * // Update many ModuleRegistries
     * const moduleRegistry = await prisma.moduleRegistry.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ModuleRegistries and only return the `id`
     * const moduleRegistryWithIdOnly = await prisma.moduleRegistry.updateManyAndReturn({
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
    updateManyAndReturn<T extends ModuleRegistryUpdateManyAndReturnArgs>(args: SelectSubset<T, ModuleRegistryUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ModuleRegistryPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ModuleRegistry.
     * @param {ModuleRegistryUpsertArgs} args - Arguments to update or create a ModuleRegistry.
     * @example
     * // Update or create a ModuleRegistry
     * const moduleRegistry = await prisma.moduleRegistry.upsert({
     *   create: {
     *     // ... data to create a ModuleRegistry
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ModuleRegistry we want to update
     *   }
     * })
     */
    upsert<T extends ModuleRegistryUpsertArgs>(args: SelectSubset<T, ModuleRegistryUpsertArgs<ExtArgs>>): Prisma__ModuleRegistryClient<$Result.GetResult<Prisma.$ModuleRegistryPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ModuleRegistries.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ModuleRegistryCountArgs} args - Arguments to filter ModuleRegistries to count.
     * @example
     * // Count the number of ModuleRegistries
     * const count = await prisma.moduleRegistry.count({
     *   where: {
     *     // ... the filter for the ModuleRegistries we want to count
     *   }
     * })
    **/
    count<T extends ModuleRegistryCountArgs>(
      args?: Subset<T, ModuleRegistryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ModuleRegistryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ModuleRegistry.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ModuleRegistryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ModuleRegistryAggregateArgs>(args: Subset<T, ModuleRegistryAggregateArgs>): Prisma.PrismaPromise<GetModuleRegistryAggregateType<T>>

    /**
     * Group by ModuleRegistry.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ModuleRegistryGroupByArgs} args - Group by arguments.
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
      T extends ModuleRegistryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ModuleRegistryGroupByArgs['orderBy'] }
        : { orderBy?: ModuleRegistryGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ModuleRegistryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetModuleRegistryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ModuleRegistry model
   */
  readonly fields: ModuleRegistryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ModuleRegistry.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ModuleRegistryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the ModuleRegistry model
   */
  interface ModuleRegistryFieldRefs {
    readonly id: FieldRef<"ModuleRegistry", 'String'>
    readonly key: FieldRef<"ModuleRegistry", 'String'>
    readonly name: FieldRef<"ModuleRegistry", 'String'>
    readonly version: FieldRef<"ModuleRegistry", 'String'>
    readonly category: FieldRef<"ModuleRegistry", 'String'>
    readonly type: FieldRef<"ModuleRegistry", 'String'>
    readonly requiresPlan: FieldRef<"ModuleRegistry", 'String'>
    readonly manifest: FieldRef<"ModuleRegistry", 'Json'>
    readonly defaultEnabled: FieldRef<"ModuleRegistry", 'Boolean'>
    readonly createdAt: FieldRef<"ModuleRegistry", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ModuleRegistry findUnique
   */
  export type ModuleRegistryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModuleRegistry
     */
    select?: ModuleRegistrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ModuleRegistry
     */
    omit?: ModuleRegistryOmit<ExtArgs> | null
    /**
     * Filter, which ModuleRegistry to fetch.
     */
    where: ModuleRegistryWhereUniqueInput
  }

  /**
   * ModuleRegistry findUniqueOrThrow
   */
  export type ModuleRegistryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModuleRegistry
     */
    select?: ModuleRegistrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ModuleRegistry
     */
    omit?: ModuleRegistryOmit<ExtArgs> | null
    /**
     * Filter, which ModuleRegistry to fetch.
     */
    where: ModuleRegistryWhereUniqueInput
  }

  /**
   * ModuleRegistry findFirst
   */
  export type ModuleRegistryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModuleRegistry
     */
    select?: ModuleRegistrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ModuleRegistry
     */
    omit?: ModuleRegistryOmit<ExtArgs> | null
    /**
     * Filter, which ModuleRegistry to fetch.
     */
    where?: ModuleRegistryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ModuleRegistries to fetch.
     */
    orderBy?: ModuleRegistryOrderByWithRelationInput | ModuleRegistryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ModuleRegistries.
     */
    cursor?: ModuleRegistryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ModuleRegistries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ModuleRegistries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ModuleRegistries.
     */
    distinct?: ModuleRegistryScalarFieldEnum | ModuleRegistryScalarFieldEnum[]
  }

  /**
   * ModuleRegistry findFirstOrThrow
   */
  export type ModuleRegistryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModuleRegistry
     */
    select?: ModuleRegistrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ModuleRegistry
     */
    omit?: ModuleRegistryOmit<ExtArgs> | null
    /**
     * Filter, which ModuleRegistry to fetch.
     */
    where?: ModuleRegistryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ModuleRegistries to fetch.
     */
    orderBy?: ModuleRegistryOrderByWithRelationInput | ModuleRegistryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ModuleRegistries.
     */
    cursor?: ModuleRegistryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ModuleRegistries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ModuleRegistries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ModuleRegistries.
     */
    distinct?: ModuleRegistryScalarFieldEnum | ModuleRegistryScalarFieldEnum[]
  }

  /**
   * ModuleRegistry findMany
   */
  export type ModuleRegistryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModuleRegistry
     */
    select?: ModuleRegistrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ModuleRegistry
     */
    omit?: ModuleRegistryOmit<ExtArgs> | null
    /**
     * Filter, which ModuleRegistries to fetch.
     */
    where?: ModuleRegistryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ModuleRegistries to fetch.
     */
    orderBy?: ModuleRegistryOrderByWithRelationInput | ModuleRegistryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ModuleRegistries.
     */
    cursor?: ModuleRegistryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ModuleRegistries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ModuleRegistries.
     */
    skip?: number
    distinct?: ModuleRegistryScalarFieldEnum | ModuleRegistryScalarFieldEnum[]
  }

  /**
   * ModuleRegistry create
   */
  export type ModuleRegistryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModuleRegistry
     */
    select?: ModuleRegistrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ModuleRegistry
     */
    omit?: ModuleRegistryOmit<ExtArgs> | null
    /**
     * The data needed to create a ModuleRegistry.
     */
    data: XOR<ModuleRegistryCreateInput, ModuleRegistryUncheckedCreateInput>
  }

  /**
   * ModuleRegistry createMany
   */
  export type ModuleRegistryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ModuleRegistries.
     */
    data: ModuleRegistryCreateManyInput | ModuleRegistryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ModuleRegistry createManyAndReturn
   */
  export type ModuleRegistryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModuleRegistry
     */
    select?: ModuleRegistrySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ModuleRegistry
     */
    omit?: ModuleRegistryOmit<ExtArgs> | null
    /**
     * The data used to create many ModuleRegistries.
     */
    data: ModuleRegistryCreateManyInput | ModuleRegistryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ModuleRegistry update
   */
  export type ModuleRegistryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModuleRegistry
     */
    select?: ModuleRegistrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ModuleRegistry
     */
    omit?: ModuleRegistryOmit<ExtArgs> | null
    /**
     * The data needed to update a ModuleRegistry.
     */
    data: XOR<ModuleRegistryUpdateInput, ModuleRegistryUncheckedUpdateInput>
    /**
     * Choose, which ModuleRegistry to update.
     */
    where: ModuleRegistryWhereUniqueInput
  }

  /**
   * ModuleRegistry updateMany
   */
  export type ModuleRegistryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ModuleRegistries.
     */
    data: XOR<ModuleRegistryUpdateManyMutationInput, ModuleRegistryUncheckedUpdateManyInput>
    /**
     * Filter which ModuleRegistries to update
     */
    where?: ModuleRegistryWhereInput
    /**
     * Limit how many ModuleRegistries to update.
     */
    limit?: number
  }

  /**
   * ModuleRegistry updateManyAndReturn
   */
  export type ModuleRegistryUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModuleRegistry
     */
    select?: ModuleRegistrySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ModuleRegistry
     */
    omit?: ModuleRegistryOmit<ExtArgs> | null
    /**
     * The data used to update ModuleRegistries.
     */
    data: XOR<ModuleRegistryUpdateManyMutationInput, ModuleRegistryUncheckedUpdateManyInput>
    /**
     * Filter which ModuleRegistries to update
     */
    where?: ModuleRegistryWhereInput
    /**
     * Limit how many ModuleRegistries to update.
     */
    limit?: number
  }

  /**
   * ModuleRegistry upsert
   */
  export type ModuleRegistryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModuleRegistry
     */
    select?: ModuleRegistrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ModuleRegistry
     */
    omit?: ModuleRegistryOmit<ExtArgs> | null
    /**
     * The filter to search for the ModuleRegistry to update in case it exists.
     */
    where: ModuleRegistryWhereUniqueInput
    /**
     * In case the ModuleRegistry found by the `where` argument doesn't exist, create a new ModuleRegistry with this data.
     */
    create: XOR<ModuleRegistryCreateInput, ModuleRegistryUncheckedCreateInput>
    /**
     * In case the ModuleRegistry was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ModuleRegistryUpdateInput, ModuleRegistryUncheckedUpdateInput>
  }

  /**
   * ModuleRegistry delete
   */
  export type ModuleRegistryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModuleRegistry
     */
    select?: ModuleRegistrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ModuleRegistry
     */
    omit?: ModuleRegistryOmit<ExtArgs> | null
    /**
     * Filter which ModuleRegistry to delete.
     */
    where: ModuleRegistryWhereUniqueInput
  }

  /**
   * ModuleRegistry deleteMany
   */
  export type ModuleRegistryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ModuleRegistries to delete
     */
    where?: ModuleRegistryWhereInput
    /**
     * Limit how many ModuleRegistries to delete.
     */
    limit?: number
  }

  /**
   * ModuleRegistry without action
   */
  export type ModuleRegistryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModuleRegistry
     */
    select?: ModuleRegistrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ModuleRegistry
     */
    omit?: ModuleRegistryOmit<ExtArgs> | null
  }


  /**
   * Model TenantModule
   */

  export type AggregateTenantModule = {
    _count: TenantModuleCountAggregateOutputType | null
    _min: TenantModuleMinAggregateOutputType | null
    _max: TenantModuleMaxAggregateOutputType | null
  }

  export type TenantModuleMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    moduleKey: string | null
    enabled: boolean | null
    enabledAt: Date | null
    updatedBy: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TenantModuleMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    moduleKey: string | null
    enabled: boolean | null
    enabledAt: Date | null
    updatedBy: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TenantModuleCountAggregateOutputType = {
    id: number
    tenantId: number
    moduleKey: number
    enabled: number
    config: number
    enabledAt: number
    updatedBy: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type TenantModuleMinAggregateInputType = {
    id?: true
    tenantId?: true
    moduleKey?: true
    enabled?: true
    enabledAt?: true
    updatedBy?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TenantModuleMaxAggregateInputType = {
    id?: true
    tenantId?: true
    moduleKey?: true
    enabled?: true
    enabledAt?: true
    updatedBy?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TenantModuleCountAggregateInputType = {
    id?: true
    tenantId?: true
    moduleKey?: true
    enabled?: true
    config?: true
    enabledAt?: true
    updatedBy?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type TenantModuleAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TenantModule to aggregate.
     */
    where?: TenantModuleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantModules to fetch.
     */
    orderBy?: TenantModuleOrderByWithRelationInput | TenantModuleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TenantModuleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantModules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantModules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TenantModules
    **/
    _count?: true | TenantModuleCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TenantModuleMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TenantModuleMaxAggregateInputType
  }

  export type GetTenantModuleAggregateType<T extends TenantModuleAggregateArgs> = {
        [P in keyof T & keyof AggregateTenantModule]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTenantModule[P]>
      : GetScalarType<T[P], AggregateTenantModule[P]>
  }




  export type TenantModuleGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TenantModuleWhereInput
    orderBy?: TenantModuleOrderByWithAggregationInput | TenantModuleOrderByWithAggregationInput[]
    by: TenantModuleScalarFieldEnum[] | TenantModuleScalarFieldEnum
    having?: TenantModuleScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TenantModuleCountAggregateInputType | true
    _min?: TenantModuleMinAggregateInputType
    _max?: TenantModuleMaxAggregateInputType
  }

  export type TenantModuleGroupByOutputType = {
    id: string
    tenantId: string
    moduleKey: string
    enabled: boolean
    config: JsonValue
    enabledAt: Date | null
    updatedBy: string
    createdAt: Date
    updatedAt: Date
    _count: TenantModuleCountAggregateOutputType | null
    _min: TenantModuleMinAggregateOutputType | null
    _max: TenantModuleMaxAggregateOutputType | null
  }

  type GetTenantModuleGroupByPayload<T extends TenantModuleGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TenantModuleGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TenantModuleGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TenantModuleGroupByOutputType[P]>
            : GetScalarType<T[P], TenantModuleGroupByOutputType[P]>
        }
      >
    >


  export type TenantModuleSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    moduleKey?: boolean
    enabled?: boolean
    config?: boolean
    enabledAt?: boolean
    updatedBy?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["tenantModule"]>

  export type TenantModuleSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    moduleKey?: boolean
    enabled?: boolean
    config?: boolean
    enabledAt?: boolean
    updatedBy?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["tenantModule"]>

  export type TenantModuleSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    moduleKey?: boolean
    enabled?: boolean
    config?: boolean
    enabledAt?: boolean
    updatedBy?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["tenantModule"]>

  export type TenantModuleSelectScalar = {
    id?: boolean
    tenantId?: boolean
    moduleKey?: boolean
    enabled?: boolean
    config?: boolean
    enabledAt?: boolean
    updatedBy?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type TenantModuleOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "moduleKey" | "enabled" | "config" | "enabledAt" | "updatedBy" | "createdAt" | "updatedAt", ExtArgs["result"]["tenantModule"]>

  export type $TenantModulePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TenantModule"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      moduleKey: string
      enabled: boolean
      config: Prisma.JsonValue
      enabledAt: Date | null
      updatedBy: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["tenantModule"]>
    composites: {}
  }

  type TenantModuleGetPayload<S extends boolean | null | undefined | TenantModuleDefaultArgs> = $Result.GetResult<Prisma.$TenantModulePayload, S>

  type TenantModuleCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TenantModuleFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TenantModuleCountAggregateInputType | true
    }

  export interface TenantModuleDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TenantModule'], meta: { name: 'TenantModule' } }
    /**
     * Find zero or one TenantModule that matches the filter.
     * @param {TenantModuleFindUniqueArgs} args - Arguments to find a TenantModule
     * @example
     * // Get one TenantModule
     * const tenantModule = await prisma.tenantModule.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TenantModuleFindUniqueArgs>(args: SelectSubset<T, TenantModuleFindUniqueArgs<ExtArgs>>): Prisma__TenantModuleClient<$Result.GetResult<Prisma.$TenantModulePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one TenantModule that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TenantModuleFindUniqueOrThrowArgs} args - Arguments to find a TenantModule
     * @example
     * // Get one TenantModule
     * const tenantModule = await prisma.tenantModule.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TenantModuleFindUniqueOrThrowArgs>(args: SelectSubset<T, TenantModuleFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TenantModuleClient<$Result.GetResult<Prisma.$TenantModulePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TenantModule that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantModuleFindFirstArgs} args - Arguments to find a TenantModule
     * @example
     * // Get one TenantModule
     * const tenantModule = await prisma.tenantModule.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TenantModuleFindFirstArgs>(args?: SelectSubset<T, TenantModuleFindFirstArgs<ExtArgs>>): Prisma__TenantModuleClient<$Result.GetResult<Prisma.$TenantModulePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TenantModule that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantModuleFindFirstOrThrowArgs} args - Arguments to find a TenantModule
     * @example
     * // Get one TenantModule
     * const tenantModule = await prisma.tenantModule.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TenantModuleFindFirstOrThrowArgs>(args?: SelectSubset<T, TenantModuleFindFirstOrThrowArgs<ExtArgs>>): Prisma__TenantModuleClient<$Result.GetResult<Prisma.$TenantModulePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more TenantModules that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantModuleFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TenantModules
     * const tenantModules = await prisma.tenantModule.findMany()
     * 
     * // Get first 10 TenantModules
     * const tenantModules = await prisma.tenantModule.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tenantModuleWithIdOnly = await prisma.tenantModule.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TenantModuleFindManyArgs>(args?: SelectSubset<T, TenantModuleFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantModulePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a TenantModule.
     * @param {TenantModuleCreateArgs} args - Arguments to create a TenantModule.
     * @example
     * // Create one TenantModule
     * const TenantModule = await prisma.tenantModule.create({
     *   data: {
     *     // ... data to create a TenantModule
     *   }
     * })
     * 
     */
    create<T extends TenantModuleCreateArgs>(args: SelectSubset<T, TenantModuleCreateArgs<ExtArgs>>): Prisma__TenantModuleClient<$Result.GetResult<Prisma.$TenantModulePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many TenantModules.
     * @param {TenantModuleCreateManyArgs} args - Arguments to create many TenantModules.
     * @example
     * // Create many TenantModules
     * const tenantModule = await prisma.tenantModule.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TenantModuleCreateManyArgs>(args?: SelectSubset<T, TenantModuleCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TenantModules and returns the data saved in the database.
     * @param {TenantModuleCreateManyAndReturnArgs} args - Arguments to create many TenantModules.
     * @example
     * // Create many TenantModules
     * const tenantModule = await prisma.tenantModule.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TenantModules and only return the `id`
     * const tenantModuleWithIdOnly = await prisma.tenantModule.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TenantModuleCreateManyAndReturnArgs>(args?: SelectSubset<T, TenantModuleCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantModulePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a TenantModule.
     * @param {TenantModuleDeleteArgs} args - Arguments to delete one TenantModule.
     * @example
     * // Delete one TenantModule
     * const TenantModule = await prisma.tenantModule.delete({
     *   where: {
     *     // ... filter to delete one TenantModule
     *   }
     * })
     * 
     */
    delete<T extends TenantModuleDeleteArgs>(args: SelectSubset<T, TenantModuleDeleteArgs<ExtArgs>>): Prisma__TenantModuleClient<$Result.GetResult<Prisma.$TenantModulePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one TenantModule.
     * @param {TenantModuleUpdateArgs} args - Arguments to update one TenantModule.
     * @example
     * // Update one TenantModule
     * const tenantModule = await prisma.tenantModule.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TenantModuleUpdateArgs>(args: SelectSubset<T, TenantModuleUpdateArgs<ExtArgs>>): Prisma__TenantModuleClient<$Result.GetResult<Prisma.$TenantModulePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more TenantModules.
     * @param {TenantModuleDeleteManyArgs} args - Arguments to filter TenantModules to delete.
     * @example
     * // Delete a few TenantModules
     * const { count } = await prisma.tenantModule.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TenantModuleDeleteManyArgs>(args?: SelectSubset<T, TenantModuleDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TenantModules.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantModuleUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TenantModules
     * const tenantModule = await prisma.tenantModule.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TenantModuleUpdateManyArgs>(args: SelectSubset<T, TenantModuleUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TenantModules and returns the data updated in the database.
     * @param {TenantModuleUpdateManyAndReturnArgs} args - Arguments to update many TenantModules.
     * @example
     * // Update many TenantModules
     * const tenantModule = await prisma.tenantModule.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more TenantModules and only return the `id`
     * const tenantModuleWithIdOnly = await prisma.tenantModule.updateManyAndReturn({
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
    updateManyAndReturn<T extends TenantModuleUpdateManyAndReturnArgs>(args: SelectSubset<T, TenantModuleUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantModulePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one TenantModule.
     * @param {TenantModuleUpsertArgs} args - Arguments to update or create a TenantModule.
     * @example
     * // Update or create a TenantModule
     * const tenantModule = await prisma.tenantModule.upsert({
     *   create: {
     *     // ... data to create a TenantModule
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TenantModule we want to update
     *   }
     * })
     */
    upsert<T extends TenantModuleUpsertArgs>(args: SelectSubset<T, TenantModuleUpsertArgs<ExtArgs>>): Prisma__TenantModuleClient<$Result.GetResult<Prisma.$TenantModulePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of TenantModules.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantModuleCountArgs} args - Arguments to filter TenantModules to count.
     * @example
     * // Count the number of TenantModules
     * const count = await prisma.tenantModule.count({
     *   where: {
     *     // ... the filter for the TenantModules we want to count
     *   }
     * })
    **/
    count<T extends TenantModuleCountArgs>(
      args?: Subset<T, TenantModuleCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TenantModuleCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TenantModule.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantModuleAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends TenantModuleAggregateArgs>(args: Subset<T, TenantModuleAggregateArgs>): Prisma.PrismaPromise<GetTenantModuleAggregateType<T>>

    /**
     * Group by TenantModule.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantModuleGroupByArgs} args - Group by arguments.
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
      T extends TenantModuleGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TenantModuleGroupByArgs['orderBy'] }
        : { orderBy?: TenantModuleGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, TenantModuleGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTenantModuleGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TenantModule model
   */
  readonly fields: TenantModuleFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TenantModule.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TenantModuleClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the TenantModule model
   */
  interface TenantModuleFieldRefs {
    readonly id: FieldRef<"TenantModule", 'String'>
    readonly tenantId: FieldRef<"TenantModule", 'String'>
    readonly moduleKey: FieldRef<"TenantModule", 'String'>
    readonly enabled: FieldRef<"TenantModule", 'Boolean'>
    readonly config: FieldRef<"TenantModule", 'Json'>
    readonly enabledAt: FieldRef<"TenantModule", 'DateTime'>
    readonly updatedBy: FieldRef<"TenantModule", 'String'>
    readonly createdAt: FieldRef<"TenantModule", 'DateTime'>
    readonly updatedAt: FieldRef<"TenantModule", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * TenantModule findUnique
   */
  export type TenantModuleFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantModule
     */
    select?: TenantModuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantModule
     */
    omit?: TenantModuleOmit<ExtArgs> | null
    /**
     * Filter, which TenantModule to fetch.
     */
    where: TenantModuleWhereUniqueInput
  }

  /**
   * TenantModule findUniqueOrThrow
   */
  export type TenantModuleFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantModule
     */
    select?: TenantModuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantModule
     */
    omit?: TenantModuleOmit<ExtArgs> | null
    /**
     * Filter, which TenantModule to fetch.
     */
    where: TenantModuleWhereUniqueInput
  }

  /**
   * TenantModule findFirst
   */
  export type TenantModuleFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantModule
     */
    select?: TenantModuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantModule
     */
    omit?: TenantModuleOmit<ExtArgs> | null
    /**
     * Filter, which TenantModule to fetch.
     */
    where?: TenantModuleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantModules to fetch.
     */
    orderBy?: TenantModuleOrderByWithRelationInput | TenantModuleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TenantModules.
     */
    cursor?: TenantModuleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantModules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantModules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TenantModules.
     */
    distinct?: TenantModuleScalarFieldEnum | TenantModuleScalarFieldEnum[]
  }

  /**
   * TenantModule findFirstOrThrow
   */
  export type TenantModuleFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantModule
     */
    select?: TenantModuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantModule
     */
    omit?: TenantModuleOmit<ExtArgs> | null
    /**
     * Filter, which TenantModule to fetch.
     */
    where?: TenantModuleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantModules to fetch.
     */
    orderBy?: TenantModuleOrderByWithRelationInput | TenantModuleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TenantModules.
     */
    cursor?: TenantModuleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantModules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantModules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TenantModules.
     */
    distinct?: TenantModuleScalarFieldEnum | TenantModuleScalarFieldEnum[]
  }

  /**
   * TenantModule findMany
   */
  export type TenantModuleFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantModule
     */
    select?: TenantModuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantModule
     */
    omit?: TenantModuleOmit<ExtArgs> | null
    /**
     * Filter, which TenantModules to fetch.
     */
    where?: TenantModuleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantModules to fetch.
     */
    orderBy?: TenantModuleOrderByWithRelationInput | TenantModuleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TenantModules.
     */
    cursor?: TenantModuleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantModules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantModules.
     */
    skip?: number
    distinct?: TenantModuleScalarFieldEnum | TenantModuleScalarFieldEnum[]
  }

  /**
   * TenantModule create
   */
  export type TenantModuleCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantModule
     */
    select?: TenantModuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantModule
     */
    omit?: TenantModuleOmit<ExtArgs> | null
    /**
     * The data needed to create a TenantModule.
     */
    data: XOR<TenantModuleCreateInput, TenantModuleUncheckedCreateInput>
  }

  /**
   * TenantModule createMany
   */
  export type TenantModuleCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TenantModules.
     */
    data: TenantModuleCreateManyInput | TenantModuleCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TenantModule createManyAndReturn
   */
  export type TenantModuleCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantModule
     */
    select?: TenantModuleSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TenantModule
     */
    omit?: TenantModuleOmit<ExtArgs> | null
    /**
     * The data used to create many TenantModules.
     */
    data: TenantModuleCreateManyInput | TenantModuleCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TenantModule update
   */
  export type TenantModuleUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantModule
     */
    select?: TenantModuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantModule
     */
    omit?: TenantModuleOmit<ExtArgs> | null
    /**
     * The data needed to update a TenantModule.
     */
    data: XOR<TenantModuleUpdateInput, TenantModuleUncheckedUpdateInput>
    /**
     * Choose, which TenantModule to update.
     */
    where: TenantModuleWhereUniqueInput
  }

  /**
   * TenantModule updateMany
   */
  export type TenantModuleUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TenantModules.
     */
    data: XOR<TenantModuleUpdateManyMutationInput, TenantModuleUncheckedUpdateManyInput>
    /**
     * Filter which TenantModules to update
     */
    where?: TenantModuleWhereInput
    /**
     * Limit how many TenantModules to update.
     */
    limit?: number
  }

  /**
   * TenantModule updateManyAndReturn
   */
  export type TenantModuleUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantModule
     */
    select?: TenantModuleSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TenantModule
     */
    omit?: TenantModuleOmit<ExtArgs> | null
    /**
     * The data used to update TenantModules.
     */
    data: XOR<TenantModuleUpdateManyMutationInput, TenantModuleUncheckedUpdateManyInput>
    /**
     * Filter which TenantModules to update
     */
    where?: TenantModuleWhereInput
    /**
     * Limit how many TenantModules to update.
     */
    limit?: number
  }

  /**
   * TenantModule upsert
   */
  export type TenantModuleUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantModule
     */
    select?: TenantModuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantModule
     */
    omit?: TenantModuleOmit<ExtArgs> | null
    /**
     * The filter to search for the TenantModule to update in case it exists.
     */
    where: TenantModuleWhereUniqueInput
    /**
     * In case the TenantModule found by the `where` argument doesn't exist, create a new TenantModule with this data.
     */
    create: XOR<TenantModuleCreateInput, TenantModuleUncheckedCreateInput>
    /**
     * In case the TenantModule was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TenantModuleUpdateInput, TenantModuleUncheckedUpdateInput>
  }

  /**
   * TenantModule delete
   */
  export type TenantModuleDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantModule
     */
    select?: TenantModuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantModule
     */
    omit?: TenantModuleOmit<ExtArgs> | null
    /**
     * Filter which TenantModule to delete.
     */
    where: TenantModuleWhereUniqueInput
  }

  /**
   * TenantModule deleteMany
   */
  export type TenantModuleDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TenantModules to delete
     */
    where?: TenantModuleWhereInput
    /**
     * Limit how many TenantModules to delete.
     */
    limit?: number
  }

  /**
   * TenantModule without action
   */
  export type TenantModuleDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantModule
     */
    select?: TenantModuleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantModule
     */
    omit?: TenantModuleOmit<ExtArgs> | null
  }


  /**
   * Model PlatformAgentKillSwitch
   */

  export type AggregatePlatformAgentKillSwitch = {
    _count: PlatformAgentKillSwitchCountAggregateOutputType | null
    _min: PlatformAgentKillSwitchMinAggregateOutputType | null
    _max: PlatformAgentKillSwitchMaxAggregateOutputType | null
  }

  export type PlatformAgentKillSwitchMinAggregateOutputType = {
    agentType: string | null
    disabled: boolean | null
    reason: string | null
    updatedByUserId: string | null
    updatedAt: Date | null
  }

  export type PlatformAgentKillSwitchMaxAggregateOutputType = {
    agentType: string | null
    disabled: boolean | null
    reason: string | null
    updatedByUserId: string | null
    updatedAt: Date | null
  }

  export type PlatformAgentKillSwitchCountAggregateOutputType = {
    agentType: number
    disabled: number
    reason: number
    updatedByUserId: number
    updatedAt: number
    _all: number
  }


  export type PlatformAgentKillSwitchMinAggregateInputType = {
    agentType?: true
    disabled?: true
    reason?: true
    updatedByUserId?: true
    updatedAt?: true
  }

  export type PlatformAgentKillSwitchMaxAggregateInputType = {
    agentType?: true
    disabled?: true
    reason?: true
    updatedByUserId?: true
    updatedAt?: true
  }

  export type PlatformAgentKillSwitchCountAggregateInputType = {
    agentType?: true
    disabled?: true
    reason?: true
    updatedByUserId?: true
    updatedAt?: true
    _all?: true
  }

  export type PlatformAgentKillSwitchAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PlatformAgentKillSwitch to aggregate.
     */
    where?: PlatformAgentKillSwitchWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PlatformAgentKillSwitches to fetch.
     */
    orderBy?: PlatformAgentKillSwitchOrderByWithRelationInput | PlatformAgentKillSwitchOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PlatformAgentKillSwitchWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PlatformAgentKillSwitches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PlatformAgentKillSwitches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PlatformAgentKillSwitches
    **/
    _count?: true | PlatformAgentKillSwitchCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PlatformAgentKillSwitchMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PlatformAgentKillSwitchMaxAggregateInputType
  }

  export type GetPlatformAgentKillSwitchAggregateType<T extends PlatformAgentKillSwitchAggregateArgs> = {
        [P in keyof T & keyof AggregatePlatformAgentKillSwitch]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePlatformAgentKillSwitch[P]>
      : GetScalarType<T[P], AggregatePlatformAgentKillSwitch[P]>
  }




  export type PlatformAgentKillSwitchGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PlatformAgentKillSwitchWhereInput
    orderBy?: PlatformAgentKillSwitchOrderByWithAggregationInput | PlatformAgentKillSwitchOrderByWithAggregationInput[]
    by: PlatformAgentKillSwitchScalarFieldEnum[] | PlatformAgentKillSwitchScalarFieldEnum
    having?: PlatformAgentKillSwitchScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PlatformAgentKillSwitchCountAggregateInputType | true
    _min?: PlatformAgentKillSwitchMinAggregateInputType
    _max?: PlatformAgentKillSwitchMaxAggregateInputType
  }

  export type PlatformAgentKillSwitchGroupByOutputType = {
    agentType: string
    disabled: boolean
    reason: string | null
    updatedByUserId: string | null
    updatedAt: Date
    _count: PlatformAgentKillSwitchCountAggregateOutputType | null
    _min: PlatformAgentKillSwitchMinAggregateOutputType | null
    _max: PlatformAgentKillSwitchMaxAggregateOutputType | null
  }

  type GetPlatformAgentKillSwitchGroupByPayload<T extends PlatformAgentKillSwitchGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PlatformAgentKillSwitchGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PlatformAgentKillSwitchGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PlatformAgentKillSwitchGroupByOutputType[P]>
            : GetScalarType<T[P], PlatformAgentKillSwitchGroupByOutputType[P]>
        }
      >
    >


  export type PlatformAgentKillSwitchSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    agentType?: boolean
    disabled?: boolean
    reason?: boolean
    updatedByUserId?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["platformAgentKillSwitch"]>

  export type PlatformAgentKillSwitchSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    agentType?: boolean
    disabled?: boolean
    reason?: boolean
    updatedByUserId?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["platformAgentKillSwitch"]>

  export type PlatformAgentKillSwitchSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    agentType?: boolean
    disabled?: boolean
    reason?: boolean
    updatedByUserId?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["platformAgentKillSwitch"]>

  export type PlatformAgentKillSwitchSelectScalar = {
    agentType?: boolean
    disabled?: boolean
    reason?: boolean
    updatedByUserId?: boolean
    updatedAt?: boolean
  }

  export type PlatformAgentKillSwitchOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"agentType" | "disabled" | "reason" | "updatedByUserId" | "updatedAt", ExtArgs["result"]["platformAgentKillSwitch"]>

  export type $PlatformAgentKillSwitchPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PlatformAgentKillSwitch"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      agentType: string
      disabled: boolean
      reason: string | null
      updatedByUserId: string | null
      updatedAt: Date
    }, ExtArgs["result"]["platformAgentKillSwitch"]>
    composites: {}
  }

  type PlatformAgentKillSwitchGetPayload<S extends boolean | null | undefined | PlatformAgentKillSwitchDefaultArgs> = $Result.GetResult<Prisma.$PlatformAgentKillSwitchPayload, S>

  type PlatformAgentKillSwitchCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PlatformAgentKillSwitchFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PlatformAgentKillSwitchCountAggregateInputType | true
    }

  export interface PlatformAgentKillSwitchDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PlatformAgentKillSwitch'], meta: { name: 'PlatformAgentKillSwitch' } }
    /**
     * Find zero or one PlatformAgentKillSwitch that matches the filter.
     * @param {PlatformAgentKillSwitchFindUniqueArgs} args - Arguments to find a PlatformAgentKillSwitch
     * @example
     * // Get one PlatformAgentKillSwitch
     * const platformAgentKillSwitch = await prisma.platformAgentKillSwitch.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PlatformAgentKillSwitchFindUniqueArgs>(args: SelectSubset<T, PlatformAgentKillSwitchFindUniqueArgs<ExtArgs>>): Prisma__PlatformAgentKillSwitchClient<$Result.GetResult<Prisma.$PlatformAgentKillSwitchPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one PlatformAgentKillSwitch that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PlatformAgentKillSwitchFindUniqueOrThrowArgs} args - Arguments to find a PlatformAgentKillSwitch
     * @example
     * // Get one PlatformAgentKillSwitch
     * const platformAgentKillSwitch = await prisma.platformAgentKillSwitch.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PlatformAgentKillSwitchFindUniqueOrThrowArgs>(args: SelectSubset<T, PlatformAgentKillSwitchFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PlatformAgentKillSwitchClient<$Result.GetResult<Prisma.$PlatformAgentKillSwitchPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PlatformAgentKillSwitch that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlatformAgentKillSwitchFindFirstArgs} args - Arguments to find a PlatformAgentKillSwitch
     * @example
     * // Get one PlatformAgentKillSwitch
     * const platformAgentKillSwitch = await prisma.platformAgentKillSwitch.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PlatformAgentKillSwitchFindFirstArgs>(args?: SelectSubset<T, PlatformAgentKillSwitchFindFirstArgs<ExtArgs>>): Prisma__PlatformAgentKillSwitchClient<$Result.GetResult<Prisma.$PlatformAgentKillSwitchPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PlatformAgentKillSwitch that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlatformAgentKillSwitchFindFirstOrThrowArgs} args - Arguments to find a PlatformAgentKillSwitch
     * @example
     * // Get one PlatformAgentKillSwitch
     * const platformAgentKillSwitch = await prisma.platformAgentKillSwitch.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PlatformAgentKillSwitchFindFirstOrThrowArgs>(args?: SelectSubset<T, PlatformAgentKillSwitchFindFirstOrThrowArgs<ExtArgs>>): Prisma__PlatformAgentKillSwitchClient<$Result.GetResult<Prisma.$PlatformAgentKillSwitchPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more PlatformAgentKillSwitches that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlatformAgentKillSwitchFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PlatformAgentKillSwitches
     * const platformAgentKillSwitches = await prisma.platformAgentKillSwitch.findMany()
     * 
     * // Get first 10 PlatformAgentKillSwitches
     * const platformAgentKillSwitches = await prisma.platformAgentKillSwitch.findMany({ take: 10 })
     * 
     * // Only select the `agentType`
     * const platformAgentKillSwitchWithAgentTypeOnly = await prisma.platformAgentKillSwitch.findMany({ select: { agentType: true } })
     * 
     */
    findMany<T extends PlatformAgentKillSwitchFindManyArgs>(args?: SelectSubset<T, PlatformAgentKillSwitchFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PlatformAgentKillSwitchPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a PlatformAgentKillSwitch.
     * @param {PlatformAgentKillSwitchCreateArgs} args - Arguments to create a PlatformAgentKillSwitch.
     * @example
     * // Create one PlatformAgentKillSwitch
     * const PlatformAgentKillSwitch = await prisma.platformAgentKillSwitch.create({
     *   data: {
     *     // ... data to create a PlatformAgentKillSwitch
     *   }
     * })
     * 
     */
    create<T extends PlatformAgentKillSwitchCreateArgs>(args: SelectSubset<T, PlatformAgentKillSwitchCreateArgs<ExtArgs>>): Prisma__PlatformAgentKillSwitchClient<$Result.GetResult<Prisma.$PlatformAgentKillSwitchPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many PlatformAgentKillSwitches.
     * @param {PlatformAgentKillSwitchCreateManyArgs} args - Arguments to create many PlatformAgentKillSwitches.
     * @example
     * // Create many PlatformAgentKillSwitches
     * const platformAgentKillSwitch = await prisma.platformAgentKillSwitch.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PlatformAgentKillSwitchCreateManyArgs>(args?: SelectSubset<T, PlatformAgentKillSwitchCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PlatformAgentKillSwitches and returns the data saved in the database.
     * @param {PlatformAgentKillSwitchCreateManyAndReturnArgs} args - Arguments to create many PlatformAgentKillSwitches.
     * @example
     * // Create many PlatformAgentKillSwitches
     * const platformAgentKillSwitch = await prisma.platformAgentKillSwitch.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PlatformAgentKillSwitches and only return the `agentType`
     * const platformAgentKillSwitchWithAgentTypeOnly = await prisma.platformAgentKillSwitch.createManyAndReturn({
     *   select: { agentType: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PlatformAgentKillSwitchCreateManyAndReturnArgs>(args?: SelectSubset<T, PlatformAgentKillSwitchCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PlatformAgentKillSwitchPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a PlatformAgentKillSwitch.
     * @param {PlatformAgentKillSwitchDeleteArgs} args - Arguments to delete one PlatformAgentKillSwitch.
     * @example
     * // Delete one PlatformAgentKillSwitch
     * const PlatformAgentKillSwitch = await prisma.platformAgentKillSwitch.delete({
     *   where: {
     *     // ... filter to delete one PlatformAgentKillSwitch
     *   }
     * })
     * 
     */
    delete<T extends PlatformAgentKillSwitchDeleteArgs>(args: SelectSubset<T, PlatformAgentKillSwitchDeleteArgs<ExtArgs>>): Prisma__PlatformAgentKillSwitchClient<$Result.GetResult<Prisma.$PlatformAgentKillSwitchPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one PlatformAgentKillSwitch.
     * @param {PlatformAgentKillSwitchUpdateArgs} args - Arguments to update one PlatformAgentKillSwitch.
     * @example
     * // Update one PlatformAgentKillSwitch
     * const platformAgentKillSwitch = await prisma.platformAgentKillSwitch.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PlatformAgentKillSwitchUpdateArgs>(args: SelectSubset<T, PlatformAgentKillSwitchUpdateArgs<ExtArgs>>): Prisma__PlatformAgentKillSwitchClient<$Result.GetResult<Prisma.$PlatformAgentKillSwitchPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more PlatformAgentKillSwitches.
     * @param {PlatformAgentKillSwitchDeleteManyArgs} args - Arguments to filter PlatformAgentKillSwitches to delete.
     * @example
     * // Delete a few PlatformAgentKillSwitches
     * const { count } = await prisma.platformAgentKillSwitch.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PlatformAgentKillSwitchDeleteManyArgs>(args?: SelectSubset<T, PlatformAgentKillSwitchDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PlatformAgentKillSwitches.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlatformAgentKillSwitchUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PlatformAgentKillSwitches
     * const platformAgentKillSwitch = await prisma.platformAgentKillSwitch.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PlatformAgentKillSwitchUpdateManyArgs>(args: SelectSubset<T, PlatformAgentKillSwitchUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PlatformAgentKillSwitches and returns the data updated in the database.
     * @param {PlatformAgentKillSwitchUpdateManyAndReturnArgs} args - Arguments to update many PlatformAgentKillSwitches.
     * @example
     * // Update many PlatformAgentKillSwitches
     * const platformAgentKillSwitch = await prisma.platformAgentKillSwitch.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more PlatformAgentKillSwitches and only return the `agentType`
     * const platformAgentKillSwitchWithAgentTypeOnly = await prisma.platformAgentKillSwitch.updateManyAndReturn({
     *   select: { agentType: true },
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
    updateManyAndReturn<T extends PlatformAgentKillSwitchUpdateManyAndReturnArgs>(args: SelectSubset<T, PlatformAgentKillSwitchUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PlatformAgentKillSwitchPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one PlatformAgentKillSwitch.
     * @param {PlatformAgentKillSwitchUpsertArgs} args - Arguments to update or create a PlatformAgentKillSwitch.
     * @example
     * // Update or create a PlatformAgentKillSwitch
     * const platformAgentKillSwitch = await prisma.platformAgentKillSwitch.upsert({
     *   create: {
     *     // ... data to create a PlatformAgentKillSwitch
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PlatformAgentKillSwitch we want to update
     *   }
     * })
     */
    upsert<T extends PlatformAgentKillSwitchUpsertArgs>(args: SelectSubset<T, PlatformAgentKillSwitchUpsertArgs<ExtArgs>>): Prisma__PlatformAgentKillSwitchClient<$Result.GetResult<Prisma.$PlatformAgentKillSwitchPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of PlatformAgentKillSwitches.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlatformAgentKillSwitchCountArgs} args - Arguments to filter PlatformAgentKillSwitches to count.
     * @example
     * // Count the number of PlatformAgentKillSwitches
     * const count = await prisma.platformAgentKillSwitch.count({
     *   where: {
     *     // ... the filter for the PlatformAgentKillSwitches we want to count
     *   }
     * })
    **/
    count<T extends PlatformAgentKillSwitchCountArgs>(
      args?: Subset<T, PlatformAgentKillSwitchCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PlatformAgentKillSwitchCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PlatformAgentKillSwitch.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlatformAgentKillSwitchAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends PlatformAgentKillSwitchAggregateArgs>(args: Subset<T, PlatformAgentKillSwitchAggregateArgs>): Prisma.PrismaPromise<GetPlatformAgentKillSwitchAggregateType<T>>

    /**
     * Group by PlatformAgentKillSwitch.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlatformAgentKillSwitchGroupByArgs} args - Group by arguments.
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
      T extends PlatformAgentKillSwitchGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PlatformAgentKillSwitchGroupByArgs['orderBy'] }
        : { orderBy?: PlatformAgentKillSwitchGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, PlatformAgentKillSwitchGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPlatformAgentKillSwitchGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PlatformAgentKillSwitch model
   */
  readonly fields: PlatformAgentKillSwitchFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PlatformAgentKillSwitch.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PlatformAgentKillSwitchClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the PlatformAgentKillSwitch model
   */
  interface PlatformAgentKillSwitchFieldRefs {
    readonly agentType: FieldRef<"PlatformAgentKillSwitch", 'String'>
    readonly disabled: FieldRef<"PlatformAgentKillSwitch", 'Boolean'>
    readonly reason: FieldRef<"PlatformAgentKillSwitch", 'String'>
    readonly updatedByUserId: FieldRef<"PlatformAgentKillSwitch", 'String'>
    readonly updatedAt: FieldRef<"PlatformAgentKillSwitch", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PlatformAgentKillSwitch findUnique
   */
  export type PlatformAgentKillSwitchFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlatformAgentKillSwitch
     */
    select?: PlatformAgentKillSwitchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlatformAgentKillSwitch
     */
    omit?: PlatformAgentKillSwitchOmit<ExtArgs> | null
    /**
     * Filter, which PlatformAgentKillSwitch to fetch.
     */
    where: PlatformAgentKillSwitchWhereUniqueInput
  }

  /**
   * PlatformAgentKillSwitch findUniqueOrThrow
   */
  export type PlatformAgentKillSwitchFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlatformAgentKillSwitch
     */
    select?: PlatformAgentKillSwitchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlatformAgentKillSwitch
     */
    omit?: PlatformAgentKillSwitchOmit<ExtArgs> | null
    /**
     * Filter, which PlatformAgentKillSwitch to fetch.
     */
    where: PlatformAgentKillSwitchWhereUniqueInput
  }

  /**
   * PlatformAgentKillSwitch findFirst
   */
  export type PlatformAgentKillSwitchFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlatformAgentKillSwitch
     */
    select?: PlatformAgentKillSwitchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlatformAgentKillSwitch
     */
    omit?: PlatformAgentKillSwitchOmit<ExtArgs> | null
    /**
     * Filter, which PlatformAgentKillSwitch to fetch.
     */
    where?: PlatformAgentKillSwitchWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PlatformAgentKillSwitches to fetch.
     */
    orderBy?: PlatformAgentKillSwitchOrderByWithRelationInput | PlatformAgentKillSwitchOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PlatformAgentKillSwitches.
     */
    cursor?: PlatformAgentKillSwitchWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PlatformAgentKillSwitches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PlatformAgentKillSwitches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PlatformAgentKillSwitches.
     */
    distinct?: PlatformAgentKillSwitchScalarFieldEnum | PlatformAgentKillSwitchScalarFieldEnum[]
  }

  /**
   * PlatformAgentKillSwitch findFirstOrThrow
   */
  export type PlatformAgentKillSwitchFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlatformAgentKillSwitch
     */
    select?: PlatformAgentKillSwitchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlatformAgentKillSwitch
     */
    omit?: PlatformAgentKillSwitchOmit<ExtArgs> | null
    /**
     * Filter, which PlatformAgentKillSwitch to fetch.
     */
    where?: PlatformAgentKillSwitchWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PlatformAgentKillSwitches to fetch.
     */
    orderBy?: PlatformAgentKillSwitchOrderByWithRelationInput | PlatformAgentKillSwitchOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PlatformAgentKillSwitches.
     */
    cursor?: PlatformAgentKillSwitchWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PlatformAgentKillSwitches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PlatformAgentKillSwitches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PlatformAgentKillSwitches.
     */
    distinct?: PlatformAgentKillSwitchScalarFieldEnum | PlatformAgentKillSwitchScalarFieldEnum[]
  }

  /**
   * PlatformAgentKillSwitch findMany
   */
  export type PlatformAgentKillSwitchFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlatformAgentKillSwitch
     */
    select?: PlatformAgentKillSwitchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlatformAgentKillSwitch
     */
    omit?: PlatformAgentKillSwitchOmit<ExtArgs> | null
    /**
     * Filter, which PlatformAgentKillSwitches to fetch.
     */
    where?: PlatformAgentKillSwitchWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PlatformAgentKillSwitches to fetch.
     */
    orderBy?: PlatformAgentKillSwitchOrderByWithRelationInput | PlatformAgentKillSwitchOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PlatformAgentKillSwitches.
     */
    cursor?: PlatformAgentKillSwitchWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PlatformAgentKillSwitches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PlatformAgentKillSwitches.
     */
    skip?: number
    distinct?: PlatformAgentKillSwitchScalarFieldEnum | PlatformAgentKillSwitchScalarFieldEnum[]
  }

  /**
   * PlatformAgentKillSwitch create
   */
  export type PlatformAgentKillSwitchCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlatformAgentKillSwitch
     */
    select?: PlatformAgentKillSwitchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlatformAgentKillSwitch
     */
    omit?: PlatformAgentKillSwitchOmit<ExtArgs> | null
    /**
     * The data needed to create a PlatformAgentKillSwitch.
     */
    data: XOR<PlatformAgentKillSwitchCreateInput, PlatformAgentKillSwitchUncheckedCreateInput>
  }

  /**
   * PlatformAgentKillSwitch createMany
   */
  export type PlatformAgentKillSwitchCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PlatformAgentKillSwitches.
     */
    data: PlatformAgentKillSwitchCreateManyInput | PlatformAgentKillSwitchCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PlatformAgentKillSwitch createManyAndReturn
   */
  export type PlatformAgentKillSwitchCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlatformAgentKillSwitch
     */
    select?: PlatformAgentKillSwitchSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PlatformAgentKillSwitch
     */
    omit?: PlatformAgentKillSwitchOmit<ExtArgs> | null
    /**
     * The data used to create many PlatformAgentKillSwitches.
     */
    data: PlatformAgentKillSwitchCreateManyInput | PlatformAgentKillSwitchCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PlatformAgentKillSwitch update
   */
  export type PlatformAgentKillSwitchUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlatformAgentKillSwitch
     */
    select?: PlatformAgentKillSwitchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlatformAgentKillSwitch
     */
    omit?: PlatformAgentKillSwitchOmit<ExtArgs> | null
    /**
     * The data needed to update a PlatformAgentKillSwitch.
     */
    data: XOR<PlatformAgentKillSwitchUpdateInput, PlatformAgentKillSwitchUncheckedUpdateInput>
    /**
     * Choose, which PlatformAgentKillSwitch to update.
     */
    where: PlatformAgentKillSwitchWhereUniqueInput
  }

  /**
   * PlatformAgentKillSwitch updateMany
   */
  export type PlatformAgentKillSwitchUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PlatformAgentKillSwitches.
     */
    data: XOR<PlatformAgentKillSwitchUpdateManyMutationInput, PlatformAgentKillSwitchUncheckedUpdateManyInput>
    /**
     * Filter which PlatformAgentKillSwitches to update
     */
    where?: PlatformAgentKillSwitchWhereInput
    /**
     * Limit how many PlatformAgentKillSwitches to update.
     */
    limit?: number
  }

  /**
   * PlatformAgentKillSwitch updateManyAndReturn
   */
  export type PlatformAgentKillSwitchUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlatformAgentKillSwitch
     */
    select?: PlatformAgentKillSwitchSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PlatformAgentKillSwitch
     */
    omit?: PlatformAgentKillSwitchOmit<ExtArgs> | null
    /**
     * The data used to update PlatformAgentKillSwitches.
     */
    data: XOR<PlatformAgentKillSwitchUpdateManyMutationInput, PlatformAgentKillSwitchUncheckedUpdateManyInput>
    /**
     * Filter which PlatformAgentKillSwitches to update
     */
    where?: PlatformAgentKillSwitchWhereInput
    /**
     * Limit how many PlatformAgentKillSwitches to update.
     */
    limit?: number
  }

  /**
   * PlatformAgentKillSwitch upsert
   */
  export type PlatformAgentKillSwitchUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlatformAgentKillSwitch
     */
    select?: PlatformAgentKillSwitchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlatformAgentKillSwitch
     */
    omit?: PlatformAgentKillSwitchOmit<ExtArgs> | null
    /**
     * The filter to search for the PlatformAgentKillSwitch to update in case it exists.
     */
    where: PlatformAgentKillSwitchWhereUniqueInput
    /**
     * In case the PlatformAgentKillSwitch found by the `where` argument doesn't exist, create a new PlatformAgentKillSwitch with this data.
     */
    create: XOR<PlatformAgentKillSwitchCreateInput, PlatformAgentKillSwitchUncheckedCreateInput>
    /**
     * In case the PlatformAgentKillSwitch was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PlatformAgentKillSwitchUpdateInput, PlatformAgentKillSwitchUncheckedUpdateInput>
  }

  /**
   * PlatformAgentKillSwitch delete
   */
  export type PlatformAgentKillSwitchDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlatformAgentKillSwitch
     */
    select?: PlatformAgentKillSwitchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlatformAgentKillSwitch
     */
    omit?: PlatformAgentKillSwitchOmit<ExtArgs> | null
    /**
     * Filter which PlatformAgentKillSwitch to delete.
     */
    where: PlatformAgentKillSwitchWhereUniqueInput
  }

  /**
   * PlatformAgentKillSwitch deleteMany
   */
  export type PlatformAgentKillSwitchDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PlatformAgentKillSwitches to delete
     */
    where?: PlatformAgentKillSwitchWhereInput
    /**
     * Limit how many PlatformAgentKillSwitches to delete.
     */
    limit?: number
  }

  /**
   * PlatformAgentKillSwitch without action
   */
  export type PlatformAgentKillSwitchDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlatformAgentKillSwitch
     */
    select?: PlatformAgentKillSwitchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlatformAgentKillSwitch
     */
    omit?: PlatformAgentKillSwitchOmit<ExtArgs> | null
  }


  /**
   * Model PlatformKillAudit
   */

  export type AggregatePlatformKillAudit = {
    _count: PlatformKillAuditCountAggregateOutputType | null
    _min: PlatformKillAuditMinAggregateOutputType | null
    _max: PlatformKillAuditMaxAggregateOutputType | null
  }

  export type PlatformKillAuditMinAggregateOutputType = {
    id: string | null
    agentType: string | null
    disabled: boolean | null
    reason: string | null
    actorUserId: string | null
    createdAt: Date | null
  }

  export type PlatformKillAuditMaxAggregateOutputType = {
    id: string | null
    agentType: string | null
    disabled: boolean | null
    reason: string | null
    actorUserId: string | null
    createdAt: Date | null
  }

  export type PlatformKillAuditCountAggregateOutputType = {
    id: number
    agentType: number
    disabled: number
    reason: number
    actorUserId: number
    createdAt: number
    _all: number
  }


  export type PlatformKillAuditMinAggregateInputType = {
    id?: true
    agentType?: true
    disabled?: true
    reason?: true
    actorUserId?: true
    createdAt?: true
  }

  export type PlatformKillAuditMaxAggregateInputType = {
    id?: true
    agentType?: true
    disabled?: true
    reason?: true
    actorUserId?: true
    createdAt?: true
  }

  export type PlatformKillAuditCountAggregateInputType = {
    id?: true
    agentType?: true
    disabled?: true
    reason?: true
    actorUserId?: true
    createdAt?: true
    _all?: true
  }

  export type PlatformKillAuditAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PlatformKillAudit to aggregate.
     */
    where?: PlatformKillAuditWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PlatformKillAudits to fetch.
     */
    orderBy?: PlatformKillAuditOrderByWithRelationInput | PlatformKillAuditOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PlatformKillAuditWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PlatformKillAudits from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PlatformKillAudits.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PlatformKillAudits
    **/
    _count?: true | PlatformKillAuditCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PlatformKillAuditMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PlatformKillAuditMaxAggregateInputType
  }

  export type GetPlatformKillAuditAggregateType<T extends PlatformKillAuditAggregateArgs> = {
        [P in keyof T & keyof AggregatePlatformKillAudit]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePlatformKillAudit[P]>
      : GetScalarType<T[P], AggregatePlatformKillAudit[P]>
  }




  export type PlatformKillAuditGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PlatformKillAuditWhereInput
    orderBy?: PlatformKillAuditOrderByWithAggregationInput | PlatformKillAuditOrderByWithAggregationInput[]
    by: PlatformKillAuditScalarFieldEnum[] | PlatformKillAuditScalarFieldEnum
    having?: PlatformKillAuditScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PlatformKillAuditCountAggregateInputType | true
    _min?: PlatformKillAuditMinAggregateInputType
    _max?: PlatformKillAuditMaxAggregateInputType
  }

  export type PlatformKillAuditGroupByOutputType = {
    id: string
    agentType: string
    disabled: boolean
    reason: string | null
    actorUserId: string | null
    createdAt: Date
    _count: PlatformKillAuditCountAggregateOutputType | null
    _min: PlatformKillAuditMinAggregateOutputType | null
    _max: PlatformKillAuditMaxAggregateOutputType | null
  }

  type GetPlatformKillAuditGroupByPayload<T extends PlatformKillAuditGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PlatformKillAuditGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PlatformKillAuditGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PlatformKillAuditGroupByOutputType[P]>
            : GetScalarType<T[P], PlatformKillAuditGroupByOutputType[P]>
        }
      >
    >


  export type PlatformKillAuditSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    agentType?: boolean
    disabled?: boolean
    reason?: boolean
    actorUserId?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["platformKillAudit"]>

  export type PlatformKillAuditSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    agentType?: boolean
    disabled?: boolean
    reason?: boolean
    actorUserId?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["platformKillAudit"]>

  export type PlatformKillAuditSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    agentType?: boolean
    disabled?: boolean
    reason?: boolean
    actorUserId?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["platformKillAudit"]>

  export type PlatformKillAuditSelectScalar = {
    id?: boolean
    agentType?: boolean
    disabled?: boolean
    reason?: boolean
    actorUserId?: boolean
    createdAt?: boolean
  }

  export type PlatformKillAuditOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "agentType" | "disabled" | "reason" | "actorUserId" | "createdAt", ExtArgs["result"]["platformKillAudit"]>

  export type $PlatformKillAuditPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PlatformKillAudit"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      agentType: string
      disabled: boolean
      reason: string | null
      actorUserId: string | null
      createdAt: Date
    }, ExtArgs["result"]["platformKillAudit"]>
    composites: {}
  }

  type PlatformKillAuditGetPayload<S extends boolean | null | undefined | PlatformKillAuditDefaultArgs> = $Result.GetResult<Prisma.$PlatformKillAuditPayload, S>

  type PlatformKillAuditCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PlatformKillAuditFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PlatformKillAuditCountAggregateInputType | true
    }

  export interface PlatformKillAuditDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PlatformKillAudit'], meta: { name: 'PlatformKillAudit' } }
    /**
     * Find zero or one PlatformKillAudit that matches the filter.
     * @param {PlatformKillAuditFindUniqueArgs} args - Arguments to find a PlatformKillAudit
     * @example
     * // Get one PlatformKillAudit
     * const platformKillAudit = await prisma.platformKillAudit.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PlatformKillAuditFindUniqueArgs>(args: SelectSubset<T, PlatformKillAuditFindUniqueArgs<ExtArgs>>): Prisma__PlatformKillAuditClient<$Result.GetResult<Prisma.$PlatformKillAuditPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one PlatformKillAudit that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PlatformKillAuditFindUniqueOrThrowArgs} args - Arguments to find a PlatformKillAudit
     * @example
     * // Get one PlatformKillAudit
     * const platformKillAudit = await prisma.platformKillAudit.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PlatformKillAuditFindUniqueOrThrowArgs>(args: SelectSubset<T, PlatformKillAuditFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PlatformKillAuditClient<$Result.GetResult<Prisma.$PlatformKillAuditPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PlatformKillAudit that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlatformKillAuditFindFirstArgs} args - Arguments to find a PlatformKillAudit
     * @example
     * // Get one PlatformKillAudit
     * const platformKillAudit = await prisma.platformKillAudit.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PlatformKillAuditFindFirstArgs>(args?: SelectSubset<T, PlatformKillAuditFindFirstArgs<ExtArgs>>): Prisma__PlatformKillAuditClient<$Result.GetResult<Prisma.$PlatformKillAuditPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PlatformKillAudit that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlatformKillAuditFindFirstOrThrowArgs} args - Arguments to find a PlatformKillAudit
     * @example
     * // Get one PlatformKillAudit
     * const platformKillAudit = await prisma.platformKillAudit.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PlatformKillAuditFindFirstOrThrowArgs>(args?: SelectSubset<T, PlatformKillAuditFindFirstOrThrowArgs<ExtArgs>>): Prisma__PlatformKillAuditClient<$Result.GetResult<Prisma.$PlatformKillAuditPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more PlatformKillAudits that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlatformKillAuditFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PlatformKillAudits
     * const platformKillAudits = await prisma.platformKillAudit.findMany()
     * 
     * // Get first 10 PlatformKillAudits
     * const platformKillAudits = await prisma.platformKillAudit.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const platformKillAuditWithIdOnly = await prisma.platformKillAudit.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PlatformKillAuditFindManyArgs>(args?: SelectSubset<T, PlatformKillAuditFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PlatformKillAuditPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a PlatformKillAudit.
     * @param {PlatformKillAuditCreateArgs} args - Arguments to create a PlatformKillAudit.
     * @example
     * // Create one PlatformKillAudit
     * const PlatformKillAudit = await prisma.platformKillAudit.create({
     *   data: {
     *     // ... data to create a PlatformKillAudit
     *   }
     * })
     * 
     */
    create<T extends PlatformKillAuditCreateArgs>(args: SelectSubset<T, PlatformKillAuditCreateArgs<ExtArgs>>): Prisma__PlatformKillAuditClient<$Result.GetResult<Prisma.$PlatformKillAuditPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many PlatformKillAudits.
     * @param {PlatformKillAuditCreateManyArgs} args - Arguments to create many PlatformKillAudits.
     * @example
     * // Create many PlatformKillAudits
     * const platformKillAudit = await prisma.platformKillAudit.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PlatformKillAuditCreateManyArgs>(args?: SelectSubset<T, PlatformKillAuditCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PlatformKillAudits and returns the data saved in the database.
     * @param {PlatformKillAuditCreateManyAndReturnArgs} args - Arguments to create many PlatformKillAudits.
     * @example
     * // Create many PlatformKillAudits
     * const platformKillAudit = await prisma.platformKillAudit.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PlatformKillAudits and only return the `id`
     * const platformKillAuditWithIdOnly = await prisma.platformKillAudit.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PlatformKillAuditCreateManyAndReturnArgs>(args?: SelectSubset<T, PlatformKillAuditCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PlatformKillAuditPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a PlatformKillAudit.
     * @param {PlatformKillAuditDeleteArgs} args - Arguments to delete one PlatformKillAudit.
     * @example
     * // Delete one PlatformKillAudit
     * const PlatformKillAudit = await prisma.platformKillAudit.delete({
     *   where: {
     *     // ... filter to delete one PlatformKillAudit
     *   }
     * })
     * 
     */
    delete<T extends PlatformKillAuditDeleteArgs>(args: SelectSubset<T, PlatformKillAuditDeleteArgs<ExtArgs>>): Prisma__PlatformKillAuditClient<$Result.GetResult<Prisma.$PlatformKillAuditPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one PlatformKillAudit.
     * @param {PlatformKillAuditUpdateArgs} args - Arguments to update one PlatformKillAudit.
     * @example
     * // Update one PlatformKillAudit
     * const platformKillAudit = await prisma.platformKillAudit.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PlatformKillAuditUpdateArgs>(args: SelectSubset<T, PlatformKillAuditUpdateArgs<ExtArgs>>): Prisma__PlatformKillAuditClient<$Result.GetResult<Prisma.$PlatformKillAuditPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more PlatformKillAudits.
     * @param {PlatformKillAuditDeleteManyArgs} args - Arguments to filter PlatformKillAudits to delete.
     * @example
     * // Delete a few PlatformKillAudits
     * const { count } = await prisma.platformKillAudit.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PlatformKillAuditDeleteManyArgs>(args?: SelectSubset<T, PlatformKillAuditDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PlatformKillAudits.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlatformKillAuditUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PlatformKillAudits
     * const platformKillAudit = await prisma.platformKillAudit.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PlatformKillAuditUpdateManyArgs>(args: SelectSubset<T, PlatformKillAuditUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PlatformKillAudits and returns the data updated in the database.
     * @param {PlatformKillAuditUpdateManyAndReturnArgs} args - Arguments to update many PlatformKillAudits.
     * @example
     * // Update many PlatformKillAudits
     * const platformKillAudit = await prisma.platformKillAudit.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more PlatformKillAudits and only return the `id`
     * const platformKillAuditWithIdOnly = await prisma.platformKillAudit.updateManyAndReturn({
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
    updateManyAndReturn<T extends PlatformKillAuditUpdateManyAndReturnArgs>(args: SelectSubset<T, PlatformKillAuditUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PlatformKillAuditPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one PlatformKillAudit.
     * @param {PlatformKillAuditUpsertArgs} args - Arguments to update or create a PlatformKillAudit.
     * @example
     * // Update or create a PlatformKillAudit
     * const platformKillAudit = await prisma.platformKillAudit.upsert({
     *   create: {
     *     // ... data to create a PlatformKillAudit
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PlatformKillAudit we want to update
     *   }
     * })
     */
    upsert<T extends PlatformKillAuditUpsertArgs>(args: SelectSubset<T, PlatformKillAuditUpsertArgs<ExtArgs>>): Prisma__PlatformKillAuditClient<$Result.GetResult<Prisma.$PlatformKillAuditPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of PlatformKillAudits.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlatformKillAuditCountArgs} args - Arguments to filter PlatformKillAudits to count.
     * @example
     * // Count the number of PlatformKillAudits
     * const count = await prisma.platformKillAudit.count({
     *   where: {
     *     // ... the filter for the PlatformKillAudits we want to count
     *   }
     * })
    **/
    count<T extends PlatformKillAuditCountArgs>(
      args?: Subset<T, PlatformKillAuditCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PlatformKillAuditCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PlatformKillAudit.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlatformKillAuditAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends PlatformKillAuditAggregateArgs>(args: Subset<T, PlatformKillAuditAggregateArgs>): Prisma.PrismaPromise<GetPlatformKillAuditAggregateType<T>>

    /**
     * Group by PlatformKillAudit.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlatformKillAuditGroupByArgs} args - Group by arguments.
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
      T extends PlatformKillAuditGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PlatformKillAuditGroupByArgs['orderBy'] }
        : { orderBy?: PlatformKillAuditGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, PlatformKillAuditGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPlatformKillAuditGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PlatformKillAudit model
   */
  readonly fields: PlatformKillAuditFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PlatformKillAudit.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PlatformKillAuditClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the PlatformKillAudit model
   */
  interface PlatformKillAuditFieldRefs {
    readonly id: FieldRef<"PlatformKillAudit", 'String'>
    readonly agentType: FieldRef<"PlatformKillAudit", 'String'>
    readonly disabled: FieldRef<"PlatformKillAudit", 'Boolean'>
    readonly reason: FieldRef<"PlatformKillAudit", 'String'>
    readonly actorUserId: FieldRef<"PlatformKillAudit", 'String'>
    readonly createdAt: FieldRef<"PlatformKillAudit", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PlatformKillAudit findUnique
   */
  export type PlatformKillAuditFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlatformKillAudit
     */
    select?: PlatformKillAuditSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlatformKillAudit
     */
    omit?: PlatformKillAuditOmit<ExtArgs> | null
    /**
     * Filter, which PlatformKillAudit to fetch.
     */
    where: PlatformKillAuditWhereUniqueInput
  }

  /**
   * PlatformKillAudit findUniqueOrThrow
   */
  export type PlatformKillAuditFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlatformKillAudit
     */
    select?: PlatformKillAuditSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlatformKillAudit
     */
    omit?: PlatformKillAuditOmit<ExtArgs> | null
    /**
     * Filter, which PlatformKillAudit to fetch.
     */
    where: PlatformKillAuditWhereUniqueInput
  }

  /**
   * PlatformKillAudit findFirst
   */
  export type PlatformKillAuditFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlatformKillAudit
     */
    select?: PlatformKillAuditSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlatformKillAudit
     */
    omit?: PlatformKillAuditOmit<ExtArgs> | null
    /**
     * Filter, which PlatformKillAudit to fetch.
     */
    where?: PlatformKillAuditWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PlatformKillAudits to fetch.
     */
    orderBy?: PlatformKillAuditOrderByWithRelationInput | PlatformKillAuditOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PlatformKillAudits.
     */
    cursor?: PlatformKillAuditWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PlatformKillAudits from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PlatformKillAudits.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PlatformKillAudits.
     */
    distinct?: PlatformKillAuditScalarFieldEnum | PlatformKillAuditScalarFieldEnum[]
  }

  /**
   * PlatformKillAudit findFirstOrThrow
   */
  export type PlatformKillAuditFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlatformKillAudit
     */
    select?: PlatformKillAuditSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlatformKillAudit
     */
    omit?: PlatformKillAuditOmit<ExtArgs> | null
    /**
     * Filter, which PlatformKillAudit to fetch.
     */
    where?: PlatformKillAuditWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PlatformKillAudits to fetch.
     */
    orderBy?: PlatformKillAuditOrderByWithRelationInput | PlatformKillAuditOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PlatformKillAudits.
     */
    cursor?: PlatformKillAuditWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PlatformKillAudits from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PlatformKillAudits.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PlatformKillAudits.
     */
    distinct?: PlatformKillAuditScalarFieldEnum | PlatformKillAuditScalarFieldEnum[]
  }

  /**
   * PlatformKillAudit findMany
   */
  export type PlatformKillAuditFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlatformKillAudit
     */
    select?: PlatformKillAuditSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlatformKillAudit
     */
    omit?: PlatformKillAuditOmit<ExtArgs> | null
    /**
     * Filter, which PlatformKillAudits to fetch.
     */
    where?: PlatformKillAuditWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PlatformKillAudits to fetch.
     */
    orderBy?: PlatformKillAuditOrderByWithRelationInput | PlatformKillAuditOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PlatformKillAudits.
     */
    cursor?: PlatformKillAuditWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PlatformKillAudits from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PlatformKillAudits.
     */
    skip?: number
    distinct?: PlatformKillAuditScalarFieldEnum | PlatformKillAuditScalarFieldEnum[]
  }

  /**
   * PlatformKillAudit create
   */
  export type PlatformKillAuditCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlatformKillAudit
     */
    select?: PlatformKillAuditSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlatformKillAudit
     */
    omit?: PlatformKillAuditOmit<ExtArgs> | null
    /**
     * The data needed to create a PlatformKillAudit.
     */
    data: XOR<PlatformKillAuditCreateInput, PlatformKillAuditUncheckedCreateInput>
  }

  /**
   * PlatformKillAudit createMany
   */
  export type PlatformKillAuditCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PlatformKillAudits.
     */
    data: PlatformKillAuditCreateManyInput | PlatformKillAuditCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PlatformKillAudit createManyAndReturn
   */
  export type PlatformKillAuditCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlatformKillAudit
     */
    select?: PlatformKillAuditSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PlatformKillAudit
     */
    omit?: PlatformKillAuditOmit<ExtArgs> | null
    /**
     * The data used to create many PlatformKillAudits.
     */
    data: PlatformKillAuditCreateManyInput | PlatformKillAuditCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PlatformKillAudit update
   */
  export type PlatformKillAuditUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlatformKillAudit
     */
    select?: PlatformKillAuditSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlatformKillAudit
     */
    omit?: PlatformKillAuditOmit<ExtArgs> | null
    /**
     * The data needed to update a PlatformKillAudit.
     */
    data: XOR<PlatformKillAuditUpdateInput, PlatformKillAuditUncheckedUpdateInput>
    /**
     * Choose, which PlatformKillAudit to update.
     */
    where: PlatformKillAuditWhereUniqueInput
  }

  /**
   * PlatformKillAudit updateMany
   */
  export type PlatformKillAuditUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PlatformKillAudits.
     */
    data: XOR<PlatformKillAuditUpdateManyMutationInput, PlatformKillAuditUncheckedUpdateManyInput>
    /**
     * Filter which PlatformKillAudits to update
     */
    where?: PlatformKillAuditWhereInput
    /**
     * Limit how many PlatformKillAudits to update.
     */
    limit?: number
  }

  /**
   * PlatformKillAudit updateManyAndReturn
   */
  export type PlatformKillAuditUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlatformKillAudit
     */
    select?: PlatformKillAuditSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PlatformKillAudit
     */
    omit?: PlatformKillAuditOmit<ExtArgs> | null
    /**
     * The data used to update PlatformKillAudits.
     */
    data: XOR<PlatformKillAuditUpdateManyMutationInput, PlatformKillAuditUncheckedUpdateManyInput>
    /**
     * Filter which PlatformKillAudits to update
     */
    where?: PlatformKillAuditWhereInput
    /**
     * Limit how many PlatformKillAudits to update.
     */
    limit?: number
  }

  /**
   * PlatformKillAudit upsert
   */
  export type PlatformKillAuditUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlatformKillAudit
     */
    select?: PlatformKillAuditSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlatformKillAudit
     */
    omit?: PlatformKillAuditOmit<ExtArgs> | null
    /**
     * The filter to search for the PlatformKillAudit to update in case it exists.
     */
    where: PlatformKillAuditWhereUniqueInput
    /**
     * In case the PlatformKillAudit found by the `where` argument doesn't exist, create a new PlatformKillAudit with this data.
     */
    create: XOR<PlatformKillAuditCreateInput, PlatformKillAuditUncheckedCreateInput>
    /**
     * In case the PlatformKillAudit was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PlatformKillAuditUpdateInput, PlatformKillAuditUncheckedUpdateInput>
  }

  /**
   * PlatformKillAudit delete
   */
  export type PlatformKillAuditDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlatformKillAudit
     */
    select?: PlatformKillAuditSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlatformKillAudit
     */
    omit?: PlatformKillAuditOmit<ExtArgs> | null
    /**
     * Filter which PlatformKillAudit to delete.
     */
    where: PlatformKillAuditWhereUniqueInput
  }

  /**
   * PlatformKillAudit deleteMany
   */
  export type PlatformKillAuditDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PlatformKillAudits to delete
     */
    where?: PlatformKillAuditWhereInput
    /**
     * Limit how many PlatformKillAudits to delete.
     */
    limit?: number
  }

  /**
   * PlatformKillAudit without action
   */
  export type PlatformKillAuditDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlatformKillAudit
     */
    select?: PlatformKillAuditSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlatformKillAudit
     */
    omit?: PlatformKillAuditOmit<ExtArgs> | null
  }


  /**
   * Model StripeSubscription
   */

  export type AggregateStripeSubscription = {
    _count: StripeSubscriptionCountAggregateOutputType | null
    _min: StripeSubscriptionMinAggregateOutputType | null
    _max: StripeSubscriptionMaxAggregateOutputType | null
  }

  export type StripeSubscriptionMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    stripeCustomerId: string | null
    stripeSubscriptionId: string | null
    plan: string | null
    status: string | null
    currentPeriodEnd: Date | null
    cancelAtPeriodEnd: boolean | null
    stripePriceId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type StripeSubscriptionMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    stripeCustomerId: string | null
    stripeSubscriptionId: string | null
    plan: string | null
    status: string | null
    currentPeriodEnd: Date | null
    cancelAtPeriodEnd: boolean | null
    stripePriceId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type StripeSubscriptionCountAggregateOutputType = {
    id: number
    tenantId: number
    stripeCustomerId: number
    stripeSubscriptionId: number
    plan: number
    status: number
    currentPeriodEnd: number
    cancelAtPeriodEnd: number
    stripePriceId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type StripeSubscriptionMinAggregateInputType = {
    id?: true
    tenantId?: true
    stripeCustomerId?: true
    stripeSubscriptionId?: true
    plan?: true
    status?: true
    currentPeriodEnd?: true
    cancelAtPeriodEnd?: true
    stripePriceId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type StripeSubscriptionMaxAggregateInputType = {
    id?: true
    tenantId?: true
    stripeCustomerId?: true
    stripeSubscriptionId?: true
    plan?: true
    status?: true
    currentPeriodEnd?: true
    cancelAtPeriodEnd?: true
    stripePriceId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type StripeSubscriptionCountAggregateInputType = {
    id?: true
    tenantId?: true
    stripeCustomerId?: true
    stripeSubscriptionId?: true
    plan?: true
    status?: true
    currentPeriodEnd?: true
    cancelAtPeriodEnd?: true
    stripePriceId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type StripeSubscriptionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which StripeSubscription to aggregate.
     */
    where?: StripeSubscriptionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of StripeSubscriptions to fetch.
     */
    orderBy?: StripeSubscriptionOrderByWithRelationInput | StripeSubscriptionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: StripeSubscriptionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` StripeSubscriptions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` StripeSubscriptions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned StripeSubscriptions
    **/
    _count?: true | StripeSubscriptionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: StripeSubscriptionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: StripeSubscriptionMaxAggregateInputType
  }

  export type GetStripeSubscriptionAggregateType<T extends StripeSubscriptionAggregateArgs> = {
        [P in keyof T & keyof AggregateStripeSubscription]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateStripeSubscription[P]>
      : GetScalarType<T[P], AggregateStripeSubscription[P]>
  }




  export type StripeSubscriptionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: StripeSubscriptionWhereInput
    orderBy?: StripeSubscriptionOrderByWithAggregationInput | StripeSubscriptionOrderByWithAggregationInput[]
    by: StripeSubscriptionScalarFieldEnum[] | StripeSubscriptionScalarFieldEnum
    having?: StripeSubscriptionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: StripeSubscriptionCountAggregateInputType | true
    _min?: StripeSubscriptionMinAggregateInputType
    _max?: StripeSubscriptionMaxAggregateInputType
  }

  export type StripeSubscriptionGroupByOutputType = {
    id: string
    tenantId: string
    stripeCustomerId: string
    stripeSubscriptionId: string
    plan: string
    status: string
    currentPeriodEnd: Date
    cancelAtPeriodEnd: boolean
    stripePriceId: string
    createdAt: Date
    updatedAt: Date
    _count: StripeSubscriptionCountAggregateOutputType | null
    _min: StripeSubscriptionMinAggregateOutputType | null
    _max: StripeSubscriptionMaxAggregateOutputType | null
  }

  type GetStripeSubscriptionGroupByPayload<T extends StripeSubscriptionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<StripeSubscriptionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof StripeSubscriptionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], StripeSubscriptionGroupByOutputType[P]>
            : GetScalarType<T[P], StripeSubscriptionGroupByOutputType[P]>
        }
      >
    >


  export type StripeSubscriptionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    stripeCustomerId?: boolean
    stripeSubscriptionId?: boolean
    plan?: boolean
    status?: boolean
    currentPeriodEnd?: boolean
    cancelAtPeriodEnd?: boolean
    stripePriceId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["stripeSubscription"]>

  export type StripeSubscriptionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    stripeCustomerId?: boolean
    stripeSubscriptionId?: boolean
    plan?: boolean
    status?: boolean
    currentPeriodEnd?: boolean
    cancelAtPeriodEnd?: boolean
    stripePriceId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["stripeSubscription"]>

  export type StripeSubscriptionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    stripeCustomerId?: boolean
    stripeSubscriptionId?: boolean
    plan?: boolean
    status?: boolean
    currentPeriodEnd?: boolean
    cancelAtPeriodEnd?: boolean
    stripePriceId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["stripeSubscription"]>

  export type StripeSubscriptionSelectScalar = {
    id?: boolean
    tenantId?: boolean
    stripeCustomerId?: boolean
    stripeSubscriptionId?: boolean
    plan?: boolean
    status?: boolean
    currentPeriodEnd?: boolean
    cancelAtPeriodEnd?: boolean
    stripePriceId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type StripeSubscriptionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "stripeCustomerId" | "stripeSubscriptionId" | "plan" | "status" | "currentPeriodEnd" | "cancelAtPeriodEnd" | "stripePriceId" | "createdAt" | "updatedAt", ExtArgs["result"]["stripeSubscription"]>

  export type $StripeSubscriptionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "StripeSubscription"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      stripeCustomerId: string
      stripeSubscriptionId: string
      plan: string
      status: string
      currentPeriodEnd: Date
      cancelAtPeriodEnd: boolean
      stripePriceId: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["stripeSubscription"]>
    composites: {}
  }

  type StripeSubscriptionGetPayload<S extends boolean | null | undefined | StripeSubscriptionDefaultArgs> = $Result.GetResult<Prisma.$StripeSubscriptionPayload, S>

  type StripeSubscriptionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<StripeSubscriptionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: StripeSubscriptionCountAggregateInputType | true
    }

  export interface StripeSubscriptionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['StripeSubscription'], meta: { name: 'StripeSubscription' } }
    /**
     * Find zero or one StripeSubscription that matches the filter.
     * @param {StripeSubscriptionFindUniqueArgs} args - Arguments to find a StripeSubscription
     * @example
     * // Get one StripeSubscription
     * const stripeSubscription = await prisma.stripeSubscription.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends StripeSubscriptionFindUniqueArgs>(args: SelectSubset<T, StripeSubscriptionFindUniqueArgs<ExtArgs>>): Prisma__StripeSubscriptionClient<$Result.GetResult<Prisma.$StripeSubscriptionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one StripeSubscription that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {StripeSubscriptionFindUniqueOrThrowArgs} args - Arguments to find a StripeSubscription
     * @example
     * // Get one StripeSubscription
     * const stripeSubscription = await prisma.stripeSubscription.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends StripeSubscriptionFindUniqueOrThrowArgs>(args: SelectSubset<T, StripeSubscriptionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__StripeSubscriptionClient<$Result.GetResult<Prisma.$StripeSubscriptionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first StripeSubscription that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StripeSubscriptionFindFirstArgs} args - Arguments to find a StripeSubscription
     * @example
     * // Get one StripeSubscription
     * const stripeSubscription = await prisma.stripeSubscription.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends StripeSubscriptionFindFirstArgs>(args?: SelectSubset<T, StripeSubscriptionFindFirstArgs<ExtArgs>>): Prisma__StripeSubscriptionClient<$Result.GetResult<Prisma.$StripeSubscriptionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first StripeSubscription that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StripeSubscriptionFindFirstOrThrowArgs} args - Arguments to find a StripeSubscription
     * @example
     * // Get one StripeSubscription
     * const stripeSubscription = await prisma.stripeSubscription.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends StripeSubscriptionFindFirstOrThrowArgs>(args?: SelectSubset<T, StripeSubscriptionFindFirstOrThrowArgs<ExtArgs>>): Prisma__StripeSubscriptionClient<$Result.GetResult<Prisma.$StripeSubscriptionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more StripeSubscriptions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StripeSubscriptionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all StripeSubscriptions
     * const stripeSubscriptions = await prisma.stripeSubscription.findMany()
     * 
     * // Get first 10 StripeSubscriptions
     * const stripeSubscriptions = await prisma.stripeSubscription.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const stripeSubscriptionWithIdOnly = await prisma.stripeSubscription.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends StripeSubscriptionFindManyArgs>(args?: SelectSubset<T, StripeSubscriptionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StripeSubscriptionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a StripeSubscription.
     * @param {StripeSubscriptionCreateArgs} args - Arguments to create a StripeSubscription.
     * @example
     * // Create one StripeSubscription
     * const StripeSubscription = await prisma.stripeSubscription.create({
     *   data: {
     *     // ... data to create a StripeSubscription
     *   }
     * })
     * 
     */
    create<T extends StripeSubscriptionCreateArgs>(args: SelectSubset<T, StripeSubscriptionCreateArgs<ExtArgs>>): Prisma__StripeSubscriptionClient<$Result.GetResult<Prisma.$StripeSubscriptionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many StripeSubscriptions.
     * @param {StripeSubscriptionCreateManyArgs} args - Arguments to create many StripeSubscriptions.
     * @example
     * // Create many StripeSubscriptions
     * const stripeSubscription = await prisma.stripeSubscription.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends StripeSubscriptionCreateManyArgs>(args?: SelectSubset<T, StripeSubscriptionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many StripeSubscriptions and returns the data saved in the database.
     * @param {StripeSubscriptionCreateManyAndReturnArgs} args - Arguments to create many StripeSubscriptions.
     * @example
     * // Create many StripeSubscriptions
     * const stripeSubscription = await prisma.stripeSubscription.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many StripeSubscriptions and only return the `id`
     * const stripeSubscriptionWithIdOnly = await prisma.stripeSubscription.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends StripeSubscriptionCreateManyAndReturnArgs>(args?: SelectSubset<T, StripeSubscriptionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StripeSubscriptionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a StripeSubscription.
     * @param {StripeSubscriptionDeleteArgs} args - Arguments to delete one StripeSubscription.
     * @example
     * // Delete one StripeSubscription
     * const StripeSubscription = await prisma.stripeSubscription.delete({
     *   where: {
     *     // ... filter to delete one StripeSubscription
     *   }
     * })
     * 
     */
    delete<T extends StripeSubscriptionDeleteArgs>(args: SelectSubset<T, StripeSubscriptionDeleteArgs<ExtArgs>>): Prisma__StripeSubscriptionClient<$Result.GetResult<Prisma.$StripeSubscriptionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one StripeSubscription.
     * @param {StripeSubscriptionUpdateArgs} args - Arguments to update one StripeSubscription.
     * @example
     * // Update one StripeSubscription
     * const stripeSubscription = await prisma.stripeSubscription.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends StripeSubscriptionUpdateArgs>(args: SelectSubset<T, StripeSubscriptionUpdateArgs<ExtArgs>>): Prisma__StripeSubscriptionClient<$Result.GetResult<Prisma.$StripeSubscriptionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more StripeSubscriptions.
     * @param {StripeSubscriptionDeleteManyArgs} args - Arguments to filter StripeSubscriptions to delete.
     * @example
     * // Delete a few StripeSubscriptions
     * const { count } = await prisma.stripeSubscription.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends StripeSubscriptionDeleteManyArgs>(args?: SelectSubset<T, StripeSubscriptionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more StripeSubscriptions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StripeSubscriptionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many StripeSubscriptions
     * const stripeSubscription = await prisma.stripeSubscription.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends StripeSubscriptionUpdateManyArgs>(args: SelectSubset<T, StripeSubscriptionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more StripeSubscriptions and returns the data updated in the database.
     * @param {StripeSubscriptionUpdateManyAndReturnArgs} args - Arguments to update many StripeSubscriptions.
     * @example
     * // Update many StripeSubscriptions
     * const stripeSubscription = await prisma.stripeSubscription.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more StripeSubscriptions and only return the `id`
     * const stripeSubscriptionWithIdOnly = await prisma.stripeSubscription.updateManyAndReturn({
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
    updateManyAndReturn<T extends StripeSubscriptionUpdateManyAndReturnArgs>(args: SelectSubset<T, StripeSubscriptionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StripeSubscriptionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one StripeSubscription.
     * @param {StripeSubscriptionUpsertArgs} args - Arguments to update or create a StripeSubscription.
     * @example
     * // Update or create a StripeSubscription
     * const stripeSubscription = await prisma.stripeSubscription.upsert({
     *   create: {
     *     // ... data to create a StripeSubscription
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the StripeSubscription we want to update
     *   }
     * })
     */
    upsert<T extends StripeSubscriptionUpsertArgs>(args: SelectSubset<T, StripeSubscriptionUpsertArgs<ExtArgs>>): Prisma__StripeSubscriptionClient<$Result.GetResult<Prisma.$StripeSubscriptionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of StripeSubscriptions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StripeSubscriptionCountArgs} args - Arguments to filter StripeSubscriptions to count.
     * @example
     * // Count the number of StripeSubscriptions
     * const count = await prisma.stripeSubscription.count({
     *   where: {
     *     // ... the filter for the StripeSubscriptions we want to count
     *   }
     * })
    **/
    count<T extends StripeSubscriptionCountArgs>(
      args?: Subset<T, StripeSubscriptionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], StripeSubscriptionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a StripeSubscription.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StripeSubscriptionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends StripeSubscriptionAggregateArgs>(args: Subset<T, StripeSubscriptionAggregateArgs>): Prisma.PrismaPromise<GetStripeSubscriptionAggregateType<T>>

    /**
     * Group by StripeSubscription.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StripeSubscriptionGroupByArgs} args - Group by arguments.
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
      T extends StripeSubscriptionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: StripeSubscriptionGroupByArgs['orderBy'] }
        : { orderBy?: StripeSubscriptionGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, StripeSubscriptionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetStripeSubscriptionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the StripeSubscription model
   */
  readonly fields: StripeSubscriptionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for StripeSubscription.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__StripeSubscriptionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the StripeSubscription model
   */
  interface StripeSubscriptionFieldRefs {
    readonly id: FieldRef<"StripeSubscription", 'String'>
    readonly tenantId: FieldRef<"StripeSubscription", 'String'>
    readonly stripeCustomerId: FieldRef<"StripeSubscription", 'String'>
    readonly stripeSubscriptionId: FieldRef<"StripeSubscription", 'String'>
    readonly plan: FieldRef<"StripeSubscription", 'String'>
    readonly status: FieldRef<"StripeSubscription", 'String'>
    readonly currentPeriodEnd: FieldRef<"StripeSubscription", 'DateTime'>
    readonly cancelAtPeriodEnd: FieldRef<"StripeSubscription", 'Boolean'>
    readonly stripePriceId: FieldRef<"StripeSubscription", 'String'>
    readonly createdAt: FieldRef<"StripeSubscription", 'DateTime'>
    readonly updatedAt: FieldRef<"StripeSubscription", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * StripeSubscription findUnique
   */
  export type StripeSubscriptionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StripeSubscription
     */
    select?: StripeSubscriptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StripeSubscription
     */
    omit?: StripeSubscriptionOmit<ExtArgs> | null
    /**
     * Filter, which StripeSubscription to fetch.
     */
    where: StripeSubscriptionWhereUniqueInput
  }

  /**
   * StripeSubscription findUniqueOrThrow
   */
  export type StripeSubscriptionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StripeSubscription
     */
    select?: StripeSubscriptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StripeSubscription
     */
    omit?: StripeSubscriptionOmit<ExtArgs> | null
    /**
     * Filter, which StripeSubscription to fetch.
     */
    where: StripeSubscriptionWhereUniqueInput
  }

  /**
   * StripeSubscription findFirst
   */
  export type StripeSubscriptionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StripeSubscription
     */
    select?: StripeSubscriptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StripeSubscription
     */
    omit?: StripeSubscriptionOmit<ExtArgs> | null
    /**
     * Filter, which StripeSubscription to fetch.
     */
    where?: StripeSubscriptionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of StripeSubscriptions to fetch.
     */
    orderBy?: StripeSubscriptionOrderByWithRelationInput | StripeSubscriptionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for StripeSubscriptions.
     */
    cursor?: StripeSubscriptionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` StripeSubscriptions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` StripeSubscriptions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of StripeSubscriptions.
     */
    distinct?: StripeSubscriptionScalarFieldEnum | StripeSubscriptionScalarFieldEnum[]
  }

  /**
   * StripeSubscription findFirstOrThrow
   */
  export type StripeSubscriptionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StripeSubscription
     */
    select?: StripeSubscriptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StripeSubscription
     */
    omit?: StripeSubscriptionOmit<ExtArgs> | null
    /**
     * Filter, which StripeSubscription to fetch.
     */
    where?: StripeSubscriptionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of StripeSubscriptions to fetch.
     */
    orderBy?: StripeSubscriptionOrderByWithRelationInput | StripeSubscriptionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for StripeSubscriptions.
     */
    cursor?: StripeSubscriptionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` StripeSubscriptions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` StripeSubscriptions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of StripeSubscriptions.
     */
    distinct?: StripeSubscriptionScalarFieldEnum | StripeSubscriptionScalarFieldEnum[]
  }

  /**
   * StripeSubscription findMany
   */
  export type StripeSubscriptionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StripeSubscription
     */
    select?: StripeSubscriptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StripeSubscription
     */
    omit?: StripeSubscriptionOmit<ExtArgs> | null
    /**
     * Filter, which StripeSubscriptions to fetch.
     */
    where?: StripeSubscriptionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of StripeSubscriptions to fetch.
     */
    orderBy?: StripeSubscriptionOrderByWithRelationInput | StripeSubscriptionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing StripeSubscriptions.
     */
    cursor?: StripeSubscriptionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` StripeSubscriptions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` StripeSubscriptions.
     */
    skip?: number
    distinct?: StripeSubscriptionScalarFieldEnum | StripeSubscriptionScalarFieldEnum[]
  }

  /**
   * StripeSubscription create
   */
  export type StripeSubscriptionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StripeSubscription
     */
    select?: StripeSubscriptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StripeSubscription
     */
    omit?: StripeSubscriptionOmit<ExtArgs> | null
    /**
     * The data needed to create a StripeSubscription.
     */
    data: XOR<StripeSubscriptionCreateInput, StripeSubscriptionUncheckedCreateInput>
  }

  /**
   * StripeSubscription createMany
   */
  export type StripeSubscriptionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many StripeSubscriptions.
     */
    data: StripeSubscriptionCreateManyInput | StripeSubscriptionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * StripeSubscription createManyAndReturn
   */
  export type StripeSubscriptionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StripeSubscription
     */
    select?: StripeSubscriptionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the StripeSubscription
     */
    omit?: StripeSubscriptionOmit<ExtArgs> | null
    /**
     * The data used to create many StripeSubscriptions.
     */
    data: StripeSubscriptionCreateManyInput | StripeSubscriptionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * StripeSubscription update
   */
  export type StripeSubscriptionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StripeSubscription
     */
    select?: StripeSubscriptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StripeSubscription
     */
    omit?: StripeSubscriptionOmit<ExtArgs> | null
    /**
     * The data needed to update a StripeSubscription.
     */
    data: XOR<StripeSubscriptionUpdateInput, StripeSubscriptionUncheckedUpdateInput>
    /**
     * Choose, which StripeSubscription to update.
     */
    where: StripeSubscriptionWhereUniqueInput
  }

  /**
   * StripeSubscription updateMany
   */
  export type StripeSubscriptionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update StripeSubscriptions.
     */
    data: XOR<StripeSubscriptionUpdateManyMutationInput, StripeSubscriptionUncheckedUpdateManyInput>
    /**
     * Filter which StripeSubscriptions to update
     */
    where?: StripeSubscriptionWhereInput
    /**
     * Limit how many StripeSubscriptions to update.
     */
    limit?: number
  }

  /**
   * StripeSubscription updateManyAndReturn
   */
  export type StripeSubscriptionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StripeSubscription
     */
    select?: StripeSubscriptionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the StripeSubscription
     */
    omit?: StripeSubscriptionOmit<ExtArgs> | null
    /**
     * The data used to update StripeSubscriptions.
     */
    data: XOR<StripeSubscriptionUpdateManyMutationInput, StripeSubscriptionUncheckedUpdateManyInput>
    /**
     * Filter which StripeSubscriptions to update
     */
    where?: StripeSubscriptionWhereInput
    /**
     * Limit how many StripeSubscriptions to update.
     */
    limit?: number
  }

  /**
   * StripeSubscription upsert
   */
  export type StripeSubscriptionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StripeSubscription
     */
    select?: StripeSubscriptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StripeSubscription
     */
    omit?: StripeSubscriptionOmit<ExtArgs> | null
    /**
     * The filter to search for the StripeSubscription to update in case it exists.
     */
    where: StripeSubscriptionWhereUniqueInput
    /**
     * In case the StripeSubscription found by the `where` argument doesn't exist, create a new StripeSubscription with this data.
     */
    create: XOR<StripeSubscriptionCreateInput, StripeSubscriptionUncheckedCreateInput>
    /**
     * In case the StripeSubscription was found with the provided `where` argument, update it with this data.
     */
    update: XOR<StripeSubscriptionUpdateInput, StripeSubscriptionUncheckedUpdateInput>
  }

  /**
   * StripeSubscription delete
   */
  export type StripeSubscriptionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StripeSubscription
     */
    select?: StripeSubscriptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StripeSubscription
     */
    omit?: StripeSubscriptionOmit<ExtArgs> | null
    /**
     * Filter which StripeSubscription to delete.
     */
    where: StripeSubscriptionWhereUniqueInput
  }

  /**
   * StripeSubscription deleteMany
   */
  export type StripeSubscriptionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which StripeSubscriptions to delete
     */
    where?: StripeSubscriptionWhereInput
    /**
     * Limit how many StripeSubscriptions to delete.
     */
    limit?: number
  }

  /**
   * StripeSubscription without action
   */
  export type StripeSubscriptionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StripeSubscription
     */
    select?: StripeSubscriptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StripeSubscription
     */
    omit?: StripeSubscriptionOmit<ExtArgs> | null
  }


  /**
   * Model StripeWebhookEvent
   */

  export type AggregateStripeWebhookEvent = {
    _count: StripeWebhookEventCountAggregateOutputType | null
    _min: StripeWebhookEventMinAggregateOutputType | null
    _max: StripeWebhookEventMaxAggregateOutputType | null
  }

  export type StripeWebhookEventMinAggregateOutputType = {
    id: string | null
    type: string | null
    tenantId: string | null
    livemode: boolean | null
    processedAt: Date | null
    processingError: string | null
    createdAt: Date | null
  }

  export type StripeWebhookEventMaxAggregateOutputType = {
    id: string | null
    type: string | null
    tenantId: string | null
    livemode: boolean | null
    processedAt: Date | null
    processingError: string | null
    createdAt: Date | null
  }

  export type StripeWebhookEventCountAggregateOutputType = {
    id: number
    type: number
    tenantId: number
    livemode: number
    payload: number
    processedAt: number
    processingError: number
    createdAt: number
    _all: number
  }


  export type StripeWebhookEventMinAggregateInputType = {
    id?: true
    type?: true
    tenantId?: true
    livemode?: true
    processedAt?: true
    processingError?: true
    createdAt?: true
  }

  export type StripeWebhookEventMaxAggregateInputType = {
    id?: true
    type?: true
    tenantId?: true
    livemode?: true
    processedAt?: true
    processingError?: true
    createdAt?: true
  }

  export type StripeWebhookEventCountAggregateInputType = {
    id?: true
    type?: true
    tenantId?: true
    livemode?: true
    payload?: true
    processedAt?: true
    processingError?: true
    createdAt?: true
    _all?: true
  }

  export type StripeWebhookEventAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which StripeWebhookEvent to aggregate.
     */
    where?: StripeWebhookEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of StripeWebhookEvents to fetch.
     */
    orderBy?: StripeWebhookEventOrderByWithRelationInput | StripeWebhookEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: StripeWebhookEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` StripeWebhookEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` StripeWebhookEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned StripeWebhookEvents
    **/
    _count?: true | StripeWebhookEventCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: StripeWebhookEventMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: StripeWebhookEventMaxAggregateInputType
  }

  export type GetStripeWebhookEventAggregateType<T extends StripeWebhookEventAggregateArgs> = {
        [P in keyof T & keyof AggregateStripeWebhookEvent]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateStripeWebhookEvent[P]>
      : GetScalarType<T[P], AggregateStripeWebhookEvent[P]>
  }




  export type StripeWebhookEventGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: StripeWebhookEventWhereInput
    orderBy?: StripeWebhookEventOrderByWithAggregationInput | StripeWebhookEventOrderByWithAggregationInput[]
    by: StripeWebhookEventScalarFieldEnum[] | StripeWebhookEventScalarFieldEnum
    having?: StripeWebhookEventScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: StripeWebhookEventCountAggregateInputType | true
    _min?: StripeWebhookEventMinAggregateInputType
    _max?: StripeWebhookEventMaxAggregateInputType
  }

  export type StripeWebhookEventGroupByOutputType = {
    id: string
    type: string
    tenantId: string | null
    livemode: boolean
    payload: JsonValue
    processedAt: Date | null
    processingError: string | null
    createdAt: Date
    _count: StripeWebhookEventCountAggregateOutputType | null
    _min: StripeWebhookEventMinAggregateOutputType | null
    _max: StripeWebhookEventMaxAggregateOutputType | null
  }

  type GetStripeWebhookEventGroupByPayload<T extends StripeWebhookEventGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<StripeWebhookEventGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof StripeWebhookEventGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], StripeWebhookEventGroupByOutputType[P]>
            : GetScalarType<T[P], StripeWebhookEventGroupByOutputType[P]>
        }
      >
    >


  export type StripeWebhookEventSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    type?: boolean
    tenantId?: boolean
    livemode?: boolean
    payload?: boolean
    processedAt?: boolean
    processingError?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["stripeWebhookEvent"]>

  export type StripeWebhookEventSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    type?: boolean
    tenantId?: boolean
    livemode?: boolean
    payload?: boolean
    processedAt?: boolean
    processingError?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["stripeWebhookEvent"]>

  export type StripeWebhookEventSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    type?: boolean
    tenantId?: boolean
    livemode?: boolean
    payload?: boolean
    processedAt?: boolean
    processingError?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["stripeWebhookEvent"]>

  export type StripeWebhookEventSelectScalar = {
    id?: boolean
    type?: boolean
    tenantId?: boolean
    livemode?: boolean
    payload?: boolean
    processedAt?: boolean
    processingError?: boolean
    createdAt?: boolean
  }

  export type StripeWebhookEventOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "type" | "tenantId" | "livemode" | "payload" | "processedAt" | "processingError" | "createdAt", ExtArgs["result"]["stripeWebhookEvent"]>

  export type $StripeWebhookEventPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "StripeWebhookEvent"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      type: string
      tenantId: string | null
      livemode: boolean
      payload: Prisma.JsonValue
      processedAt: Date | null
      processingError: string | null
      createdAt: Date
    }, ExtArgs["result"]["stripeWebhookEvent"]>
    composites: {}
  }

  type StripeWebhookEventGetPayload<S extends boolean | null | undefined | StripeWebhookEventDefaultArgs> = $Result.GetResult<Prisma.$StripeWebhookEventPayload, S>

  type StripeWebhookEventCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<StripeWebhookEventFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: StripeWebhookEventCountAggregateInputType | true
    }

  export interface StripeWebhookEventDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['StripeWebhookEvent'], meta: { name: 'StripeWebhookEvent' } }
    /**
     * Find zero or one StripeWebhookEvent that matches the filter.
     * @param {StripeWebhookEventFindUniqueArgs} args - Arguments to find a StripeWebhookEvent
     * @example
     * // Get one StripeWebhookEvent
     * const stripeWebhookEvent = await prisma.stripeWebhookEvent.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends StripeWebhookEventFindUniqueArgs>(args: SelectSubset<T, StripeWebhookEventFindUniqueArgs<ExtArgs>>): Prisma__StripeWebhookEventClient<$Result.GetResult<Prisma.$StripeWebhookEventPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one StripeWebhookEvent that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {StripeWebhookEventFindUniqueOrThrowArgs} args - Arguments to find a StripeWebhookEvent
     * @example
     * // Get one StripeWebhookEvent
     * const stripeWebhookEvent = await prisma.stripeWebhookEvent.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends StripeWebhookEventFindUniqueOrThrowArgs>(args: SelectSubset<T, StripeWebhookEventFindUniqueOrThrowArgs<ExtArgs>>): Prisma__StripeWebhookEventClient<$Result.GetResult<Prisma.$StripeWebhookEventPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first StripeWebhookEvent that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StripeWebhookEventFindFirstArgs} args - Arguments to find a StripeWebhookEvent
     * @example
     * // Get one StripeWebhookEvent
     * const stripeWebhookEvent = await prisma.stripeWebhookEvent.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends StripeWebhookEventFindFirstArgs>(args?: SelectSubset<T, StripeWebhookEventFindFirstArgs<ExtArgs>>): Prisma__StripeWebhookEventClient<$Result.GetResult<Prisma.$StripeWebhookEventPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first StripeWebhookEvent that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StripeWebhookEventFindFirstOrThrowArgs} args - Arguments to find a StripeWebhookEvent
     * @example
     * // Get one StripeWebhookEvent
     * const stripeWebhookEvent = await prisma.stripeWebhookEvent.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends StripeWebhookEventFindFirstOrThrowArgs>(args?: SelectSubset<T, StripeWebhookEventFindFirstOrThrowArgs<ExtArgs>>): Prisma__StripeWebhookEventClient<$Result.GetResult<Prisma.$StripeWebhookEventPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more StripeWebhookEvents that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StripeWebhookEventFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all StripeWebhookEvents
     * const stripeWebhookEvents = await prisma.stripeWebhookEvent.findMany()
     * 
     * // Get first 10 StripeWebhookEvents
     * const stripeWebhookEvents = await prisma.stripeWebhookEvent.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const stripeWebhookEventWithIdOnly = await prisma.stripeWebhookEvent.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends StripeWebhookEventFindManyArgs>(args?: SelectSubset<T, StripeWebhookEventFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StripeWebhookEventPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a StripeWebhookEvent.
     * @param {StripeWebhookEventCreateArgs} args - Arguments to create a StripeWebhookEvent.
     * @example
     * // Create one StripeWebhookEvent
     * const StripeWebhookEvent = await prisma.stripeWebhookEvent.create({
     *   data: {
     *     // ... data to create a StripeWebhookEvent
     *   }
     * })
     * 
     */
    create<T extends StripeWebhookEventCreateArgs>(args: SelectSubset<T, StripeWebhookEventCreateArgs<ExtArgs>>): Prisma__StripeWebhookEventClient<$Result.GetResult<Prisma.$StripeWebhookEventPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many StripeWebhookEvents.
     * @param {StripeWebhookEventCreateManyArgs} args - Arguments to create many StripeWebhookEvents.
     * @example
     * // Create many StripeWebhookEvents
     * const stripeWebhookEvent = await prisma.stripeWebhookEvent.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends StripeWebhookEventCreateManyArgs>(args?: SelectSubset<T, StripeWebhookEventCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many StripeWebhookEvents and returns the data saved in the database.
     * @param {StripeWebhookEventCreateManyAndReturnArgs} args - Arguments to create many StripeWebhookEvents.
     * @example
     * // Create many StripeWebhookEvents
     * const stripeWebhookEvent = await prisma.stripeWebhookEvent.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many StripeWebhookEvents and only return the `id`
     * const stripeWebhookEventWithIdOnly = await prisma.stripeWebhookEvent.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends StripeWebhookEventCreateManyAndReturnArgs>(args?: SelectSubset<T, StripeWebhookEventCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StripeWebhookEventPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a StripeWebhookEvent.
     * @param {StripeWebhookEventDeleteArgs} args - Arguments to delete one StripeWebhookEvent.
     * @example
     * // Delete one StripeWebhookEvent
     * const StripeWebhookEvent = await prisma.stripeWebhookEvent.delete({
     *   where: {
     *     // ... filter to delete one StripeWebhookEvent
     *   }
     * })
     * 
     */
    delete<T extends StripeWebhookEventDeleteArgs>(args: SelectSubset<T, StripeWebhookEventDeleteArgs<ExtArgs>>): Prisma__StripeWebhookEventClient<$Result.GetResult<Prisma.$StripeWebhookEventPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one StripeWebhookEvent.
     * @param {StripeWebhookEventUpdateArgs} args - Arguments to update one StripeWebhookEvent.
     * @example
     * // Update one StripeWebhookEvent
     * const stripeWebhookEvent = await prisma.stripeWebhookEvent.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends StripeWebhookEventUpdateArgs>(args: SelectSubset<T, StripeWebhookEventUpdateArgs<ExtArgs>>): Prisma__StripeWebhookEventClient<$Result.GetResult<Prisma.$StripeWebhookEventPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more StripeWebhookEvents.
     * @param {StripeWebhookEventDeleteManyArgs} args - Arguments to filter StripeWebhookEvents to delete.
     * @example
     * // Delete a few StripeWebhookEvents
     * const { count } = await prisma.stripeWebhookEvent.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends StripeWebhookEventDeleteManyArgs>(args?: SelectSubset<T, StripeWebhookEventDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more StripeWebhookEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StripeWebhookEventUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many StripeWebhookEvents
     * const stripeWebhookEvent = await prisma.stripeWebhookEvent.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends StripeWebhookEventUpdateManyArgs>(args: SelectSubset<T, StripeWebhookEventUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more StripeWebhookEvents and returns the data updated in the database.
     * @param {StripeWebhookEventUpdateManyAndReturnArgs} args - Arguments to update many StripeWebhookEvents.
     * @example
     * // Update many StripeWebhookEvents
     * const stripeWebhookEvent = await prisma.stripeWebhookEvent.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more StripeWebhookEvents and only return the `id`
     * const stripeWebhookEventWithIdOnly = await prisma.stripeWebhookEvent.updateManyAndReturn({
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
    updateManyAndReturn<T extends StripeWebhookEventUpdateManyAndReturnArgs>(args: SelectSubset<T, StripeWebhookEventUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StripeWebhookEventPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one StripeWebhookEvent.
     * @param {StripeWebhookEventUpsertArgs} args - Arguments to update or create a StripeWebhookEvent.
     * @example
     * // Update or create a StripeWebhookEvent
     * const stripeWebhookEvent = await prisma.stripeWebhookEvent.upsert({
     *   create: {
     *     // ... data to create a StripeWebhookEvent
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the StripeWebhookEvent we want to update
     *   }
     * })
     */
    upsert<T extends StripeWebhookEventUpsertArgs>(args: SelectSubset<T, StripeWebhookEventUpsertArgs<ExtArgs>>): Prisma__StripeWebhookEventClient<$Result.GetResult<Prisma.$StripeWebhookEventPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of StripeWebhookEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StripeWebhookEventCountArgs} args - Arguments to filter StripeWebhookEvents to count.
     * @example
     * // Count the number of StripeWebhookEvents
     * const count = await prisma.stripeWebhookEvent.count({
     *   where: {
     *     // ... the filter for the StripeWebhookEvents we want to count
     *   }
     * })
    **/
    count<T extends StripeWebhookEventCountArgs>(
      args?: Subset<T, StripeWebhookEventCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], StripeWebhookEventCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a StripeWebhookEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StripeWebhookEventAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends StripeWebhookEventAggregateArgs>(args: Subset<T, StripeWebhookEventAggregateArgs>): Prisma.PrismaPromise<GetStripeWebhookEventAggregateType<T>>

    /**
     * Group by StripeWebhookEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StripeWebhookEventGroupByArgs} args - Group by arguments.
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
      T extends StripeWebhookEventGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: StripeWebhookEventGroupByArgs['orderBy'] }
        : { orderBy?: StripeWebhookEventGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, StripeWebhookEventGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetStripeWebhookEventGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the StripeWebhookEvent model
   */
  readonly fields: StripeWebhookEventFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for StripeWebhookEvent.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__StripeWebhookEventClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the StripeWebhookEvent model
   */
  interface StripeWebhookEventFieldRefs {
    readonly id: FieldRef<"StripeWebhookEvent", 'String'>
    readonly type: FieldRef<"StripeWebhookEvent", 'String'>
    readonly tenantId: FieldRef<"StripeWebhookEvent", 'String'>
    readonly livemode: FieldRef<"StripeWebhookEvent", 'Boolean'>
    readonly payload: FieldRef<"StripeWebhookEvent", 'Json'>
    readonly processedAt: FieldRef<"StripeWebhookEvent", 'DateTime'>
    readonly processingError: FieldRef<"StripeWebhookEvent", 'String'>
    readonly createdAt: FieldRef<"StripeWebhookEvent", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * StripeWebhookEvent findUnique
   */
  export type StripeWebhookEventFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StripeWebhookEvent
     */
    select?: StripeWebhookEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StripeWebhookEvent
     */
    omit?: StripeWebhookEventOmit<ExtArgs> | null
    /**
     * Filter, which StripeWebhookEvent to fetch.
     */
    where: StripeWebhookEventWhereUniqueInput
  }

  /**
   * StripeWebhookEvent findUniqueOrThrow
   */
  export type StripeWebhookEventFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StripeWebhookEvent
     */
    select?: StripeWebhookEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StripeWebhookEvent
     */
    omit?: StripeWebhookEventOmit<ExtArgs> | null
    /**
     * Filter, which StripeWebhookEvent to fetch.
     */
    where: StripeWebhookEventWhereUniqueInput
  }

  /**
   * StripeWebhookEvent findFirst
   */
  export type StripeWebhookEventFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StripeWebhookEvent
     */
    select?: StripeWebhookEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StripeWebhookEvent
     */
    omit?: StripeWebhookEventOmit<ExtArgs> | null
    /**
     * Filter, which StripeWebhookEvent to fetch.
     */
    where?: StripeWebhookEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of StripeWebhookEvents to fetch.
     */
    orderBy?: StripeWebhookEventOrderByWithRelationInput | StripeWebhookEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for StripeWebhookEvents.
     */
    cursor?: StripeWebhookEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` StripeWebhookEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` StripeWebhookEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of StripeWebhookEvents.
     */
    distinct?: StripeWebhookEventScalarFieldEnum | StripeWebhookEventScalarFieldEnum[]
  }

  /**
   * StripeWebhookEvent findFirstOrThrow
   */
  export type StripeWebhookEventFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StripeWebhookEvent
     */
    select?: StripeWebhookEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StripeWebhookEvent
     */
    omit?: StripeWebhookEventOmit<ExtArgs> | null
    /**
     * Filter, which StripeWebhookEvent to fetch.
     */
    where?: StripeWebhookEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of StripeWebhookEvents to fetch.
     */
    orderBy?: StripeWebhookEventOrderByWithRelationInput | StripeWebhookEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for StripeWebhookEvents.
     */
    cursor?: StripeWebhookEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` StripeWebhookEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` StripeWebhookEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of StripeWebhookEvents.
     */
    distinct?: StripeWebhookEventScalarFieldEnum | StripeWebhookEventScalarFieldEnum[]
  }

  /**
   * StripeWebhookEvent findMany
   */
  export type StripeWebhookEventFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StripeWebhookEvent
     */
    select?: StripeWebhookEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StripeWebhookEvent
     */
    omit?: StripeWebhookEventOmit<ExtArgs> | null
    /**
     * Filter, which StripeWebhookEvents to fetch.
     */
    where?: StripeWebhookEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of StripeWebhookEvents to fetch.
     */
    orderBy?: StripeWebhookEventOrderByWithRelationInput | StripeWebhookEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing StripeWebhookEvents.
     */
    cursor?: StripeWebhookEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` StripeWebhookEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` StripeWebhookEvents.
     */
    skip?: number
    distinct?: StripeWebhookEventScalarFieldEnum | StripeWebhookEventScalarFieldEnum[]
  }

  /**
   * StripeWebhookEvent create
   */
  export type StripeWebhookEventCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StripeWebhookEvent
     */
    select?: StripeWebhookEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StripeWebhookEvent
     */
    omit?: StripeWebhookEventOmit<ExtArgs> | null
    /**
     * The data needed to create a StripeWebhookEvent.
     */
    data: XOR<StripeWebhookEventCreateInput, StripeWebhookEventUncheckedCreateInput>
  }

  /**
   * StripeWebhookEvent createMany
   */
  export type StripeWebhookEventCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many StripeWebhookEvents.
     */
    data: StripeWebhookEventCreateManyInput | StripeWebhookEventCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * StripeWebhookEvent createManyAndReturn
   */
  export type StripeWebhookEventCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StripeWebhookEvent
     */
    select?: StripeWebhookEventSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the StripeWebhookEvent
     */
    omit?: StripeWebhookEventOmit<ExtArgs> | null
    /**
     * The data used to create many StripeWebhookEvents.
     */
    data: StripeWebhookEventCreateManyInput | StripeWebhookEventCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * StripeWebhookEvent update
   */
  export type StripeWebhookEventUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StripeWebhookEvent
     */
    select?: StripeWebhookEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StripeWebhookEvent
     */
    omit?: StripeWebhookEventOmit<ExtArgs> | null
    /**
     * The data needed to update a StripeWebhookEvent.
     */
    data: XOR<StripeWebhookEventUpdateInput, StripeWebhookEventUncheckedUpdateInput>
    /**
     * Choose, which StripeWebhookEvent to update.
     */
    where: StripeWebhookEventWhereUniqueInput
  }

  /**
   * StripeWebhookEvent updateMany
   */
  export type StripeWebhookEventUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update StripeWebhookEvents.
     */
    data: XOR<StripeWebhookEventUpdateManyMutationInput, StripeWebhookEventUncheckedUpdateManyInput>
    /**
     * Filter which StripeWebhookEvents to update
     */
    where?: StripeWebhookEventWhereInput
    /**
     * Limit how many StripeWebhookEvents to update.
     */
    limit?: number
  }

  /**
   * StripeWebhookEvent updateManyAndReturn
   */
  export type StripeWebhookEventUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StripeWebhookEvent
     */
    select?: StripeWebhookEventSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the StripeWebhookEvent
     */
    omit?: StripeWebhookEventOmit<ExtArgs> | null
    /**
     * The data used to update StripeWebhookEvents.
     */
    data: XOR<StripeWebhookEventUpdateManyMutationInput, StripeWebhookEventUncheckedUpdateManyInput>
    /**
     * Filter which StripeWebhookEvents to update
     */
    where?: StripeWebhookEventWhereInput
    /**
     * Limit how many StripeWebhookEvents to update.
     */
    limit?: number
  }

  /**
   * StripeWebhookEvent upsert
   */
  export type StripeWebhookEventUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StripeWebhookEvent
     */
    select?: StripeWebhookEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StripeWebhookEvent
     */
    omit?: StripeWebhookEventOmit<ExtArgs> | null
    /**
     * The filter to search for the StripeWebhookEvent to update in case it exists.
     */
    where: StripeWebhookEventWhereUniqueInput
    /**
     * In case the StripeWebhookEvent found by the `where` argument doesn't exist, create a new StripeWebhookEvent with this data.
     */
    create: XOR<StripeWebhookEventCreateInput, StripeWebhookEventUncheckedCreateInput>
    /**
     * In case the StripeWebhookEvent was found with the provided `where` argument, update it with this data.
     */
    update: XOR<StripeWebhookEventUpdateInput, StripeWebhookEventUncheckedUpdateInput>
  }

  /**
   * StripeWebhookEvent delete
   */
  export type StripeWebhookEventDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StripeWebhookEvent
     */
    select?: StripeWebhookEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StripeWebhookEvent
     */
    omit?: StripeWebhookEventOmit<ExtArgs> | null
    /**
     * Filter which StripeWebhookEvent to delete.
     */
    where: StripeWebhookEventWhereUniqueInput
  }

  /**
   * StripeWebhookEvent deleteMany
   */
  export type StripeWebhookEventDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which StripeWebhookEvents to delete
     */
    where?: StripeWebhookEventWhereInput
    /**
     * Limit how many StripeWebhookEvents to delete.
     */
    limit?: number
  }

  /**
   * StripeWebhookEvent without action
   */
  export type StripeWebhookEventDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StripeWebhookEvent
     */
    select?: StripeWebhookEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StripeWebhookEvent
     */
    omit?: StripeWebhookEventOmit<ExtArgs> | null
  }


  /**
   * Model PromptOverride
   */

  export type AggregatePromptOverride = {
    _count: PromptOverrideCountAggregateOutputType | null
    _avg: PromptOverrideAvgAggregateOutputType | null
    _sum: PromptOverrideSumAggregateOutputType | null
    _min: PromptOverrideMinAggregateOutputType | null
    _max: PromptOverrideMaxAggregateOutputType | null
  }

  export type PromptOverrideAvgAggregateOutputType = {
    temperature: number | null
    version: number | null
  }

  export type PromptOverrideSumAggregateOutputType = {
    temperature: number | null
    version: number | null
  }

  export type PromptOverrideMinAggregateOutputType = {
    id: string | null
    agentType: string | null
    systemPrompt: string | null
    modelName: string | null
    temperature: number | null
    version: number | null
    isActive: boolean | null
    notes: string | null
    createdByUserId: string | null
    createdAt: Date | null
  }

  export type PromptOverrideMaxAggregateOutputType = {
    id: string | null
    agentType: string | null
    systemPrompt: string | null
    modelName: string | null
    temperature: number | null
    version: number | null
    isActive: boolean | null
    notes: string | null
    createdByUserId: string | null
    createdAt: Date | null
  }

  export type PromptOverrideCountAggregateOutputType = {
    id: number
    agentType: number
    systemPrompt: number
    modelName: number
    temperature: number
    version: number
    isActive: number
    notes: number
    createdByUserId: number
    createdAt: number
    _all: number
  }


  export type PromptOverrideAvgAggregateInputType = {
    temperature?: true
    version?: true
  }

  export type PromptOverrideSumAggregateInputType = {
    temperature?: true
    version?: true
  }

  export type PromptOverrideMinAggregateInputType = {
    id?: true
    agentType?: true
    systemPrompt?: true
    modelName?: true
    temperature?: true
    version?: true
    isActive?: true
    notes?: true
    createdByUserId?: true
    createdAt?: true
  }

  export type PromptOverrideMaxAggregateInputType = {
    id?: true
    agentType?: true
    systemPrompt?: true
    modelName?: true
    temperature?: true
    version?: true
    isActive?: true
    notes?: true
    createdByUserId?: true
    createdAt?: true
  }

  export type PromptOverrideCountAggregateInputType = {
    id?: true
    agentType?: true
    systemPrompt?: true
    modelName?: true
    temperature?: true
    version?: true
    isActive?: true
    notes?: true
    createdByUserId?: true
    createdAt?: true
    _all?: true
  }

  export type PromptOverrideAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PromptOverride to aggregate.
     */
    where?: PromptOverrideWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PromptOverrides to fetch.
     */
    orderBy?: PromptOverrideOrderByWithRelationInput | PromptOverrideOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PromptOverrideWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PromptOverrides from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PromptOverrides.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PromptOverrides
    **/
    _count?: true | PromptOverrideCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PromptOverrideAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PromptOverrideSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PromptOverrideMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PromptOverrideMaxAggregateInputType
  }

  export type GetPromptOverrideAggregateType<T extends PromptOverrideAggregateArgs> = {
        [P in keyof T & keyof AggregatePromptOverride]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePromptOverride[P]>
      : GetScalarType<T[P], AggregatePromptOverride[P]>
  }




  export type PromptOverrideGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PromptOverrideWhereInput
    orderBy?: PromptOverrideOrderByWithAggregationInput | PromptOverrideOrderByWithAggregationInput[]
    by: PromptOverrideScalarFieldEnum[] | PromptOverrideScalarFieldEnum
    having?: PromptOverrideScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PromptOverrideCountAggregateInputType | true
    _avg?: PromptOverrideAvgAggregateInputType
    _sum?: PromptOverrideSumAggregateInputType
    _min?: PromptOverrideMinAggregateInputType
    _max?: PromptOverrideMaxAggregateInputType
  }

  export type PromptOverrideGroupByOutputType = {
    id: string
    agentType: string
    systemPrompt: string | null
    modelName: string | null
    temperature: number | null
    version: number
    isActive: boolean
    notes: string | null
    createdByUserId: string | null
    createdAt: Date
    _count: PromptOverrideCountAggregateOutputType | null
    _avg: PromptOverrideAvgAggregateOutputType | null
    _sum: PromptOverrideSumAggregateOutputType | null
    _min: PromptOverrideMinAggregateOutputType | null
    _max: PromptOverrideMaxAggregateOutputType | null
  }

  type GetPromptOverrideGroupByPayload<T extends PromptOverrideGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PromptOverrideGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PromptOverrideGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PromptOverrideGroupByOutputType[P]>
            : GetScalarType<T[P], PromptOverrideGroupByOutputType[P]>
        }
      >
    >


  export type PromptOverrideSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    agentType?: boolean
    systemPrompt?: boolean
    modelName?: boolean
    temperature?: boolean
    version?: boolean
    isActive?: boolean
    notes?: boolean
    createdByUserId?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["promptOverride"]>

  export type PromptOverrideSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    agentType?: boolean
    systemPrompt?: boolean
    modelName?: boolean
    temperature?: boolean
    version?: boolean
    isActive?: boolean
    notes?: boolean
    createdByUserId?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["promptOverride"]>

  export type PromptOverrideSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    agentType?: boolean
    systemPrompt?: boolean
    modelName?: boolean
    temperature?: boolean
    version?: boolean
    isActive?: boolean
    notes?: boolean
    createdByUserId?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["promptOverride"]>

  export type PromptOverrideSelectScalar = {
    id?: boolean
    agentType?: boolean
    systemPrompt?: boolean
    modelName?: boolean
    temperature?: boolean
    version?: boolean
    isActive?: boolean
    notes?: boolean
    createdByUserId?: boolean
    createdAt?: boolean
  }

  export type PromptOverrideOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "agentType" | "systemPrompt" | "modelName" | "temperature" | "version" | "isActive" | "notes" | "createdByUserId" | "createdAt", ExtArgs["result"]["promptOverride"]>

  export type $PromptOverridePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PromptOverride"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      agentType: string
      systemPrompt: string | null
      modelName: string | null
      temperature: number | null
      version: number
      isActive: boolean
      notes: string | null
      createdByUserId: string | null
      createdAt: Date
    }, ExtArgs["result"]["promptOverride"]>
    composites: {}
  }

  type PromptOverrideGetPayload<S extends boolean | null | undefined | PromptOverrideDefaultArgs> = $Result.GetResult<Prisma.$PromptOverridePayload, S>

  type PromptOverrideCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PromptOverrideFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PromptOverrideCountAggregateInputType | true
    }

  export interface PromptOverrideDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PromptOverride'], meta: { name: 'PromptOverride' } }
    /**
     * Find zero or one PromptOverride that matches the filter.
     * @param {PromptOverrideFindUniqueArgs} args - Arguments to find a PromptOverride
     * @example
     * // Get one PromptOverride
     * const promptOverride = await prisma.promptOverride.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PromptOverrideFindUniqueArgs>(args: SelectSubset<T, PromptOverrideFindUniqueArgs<ExtArgs>>): Prisma__PromptOverrideClient<$Result.GetResult<Prisma.$PromptOverridePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one PromptOverride that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PromptOverrideFindUniqueOrThrowArgs} args - Arguments to find a PromptOverride
     * @example
     * // Get one PromptOverride
     * const promptOverride = await prisma.promptOverride.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PromptOverrideFindUniqueOrThrowArgs>(args: SelectSubset<T, PromptOverrideFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PromptOverrideClient<$Result.GetResult<Prisma.$PromptOverridePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PromptOverride that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PromptOverrideFindFirstArgs} args - Arguments to find a PromptOverride
     * @example
     * // Get one PromptOverride
     * const promptOverride = await prisma.promptOverride.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PromptOverrideFindFirstArgs>(args?: SelectSubset<T, PromptOverrideFindFirstArgs<ExtArgs>>): Prisma__PromptOverrideClient<$Result.GetResult<Prisma.$PromptOverridePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PromptOverride that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PromptOverrideFindFirstOrThrowArgs} args - Arguments to find a PromptOverride
     * @example
     * // Get one PromptOverride
     * const promptOverride = await prisma.promptOverride.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PromptOverrideFindFirstOrThrowArgs>(args?: SelectSubset<T, PromptOverrideFindFirstOrThrowArgs<ExtArgs>>): Prisma__PromptOverrideClient<$Result.GetResult<Prisma.$PromptOverridePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more PromptOverrides that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PromptOverrideFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PromptOverrides
     * const promptOverrides = await prisma.promptOverride.findMany()
     * 
     * // Get first 10 PromptOverrides
     * const promptOverrides = await prisma.promptOverride.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const promptOverrideWithIdOnly = await prisma.promptOverride.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PromptOverrideFindManyArgs>(args?: SelectSubset<T, PromptOverrideFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PromptOverridePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a PromptOverride.
     * @param {PromptOverrideCreateArgs} args - Arguments to create a PromptOverride.
     * @example
     * // Create one PromptOverride
     * const PromptOverride = await prisma.promptOverride.create({
     *   data: {
     *     // ... data to create a PromptOverride
     *   }
     * })
     * 
     */
    create<T extends PromptOverrideCreateArgs>(args: SelectSubset<T, PromptOverrideCreateArgs<ExtArgs>>): Prisma__PromptOverrideClient<$Result.GetResult<Prisma.$PromptOverridePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many PromptOverrides.
     * @param {PromptOverrideCreateManyArgs} args - Arguments to create many PromptOverrides.
     * @example
     * // Create many PromptOverrides
     * const promptOverride = await prisma.promptOverride.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PromptOverrideCreateManyArgs>(args?: SelectSubset<T, PromptOverrideCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PromptOverrides and returns the data saved in the database.
     * @param {PromptOverrideCreateManyAndReturnArgs} args - Arguments to create many PromptOverrides.
     * @example
     * // Create many PromptOverrides
     * const promptOverride = await prisma.promptOverride.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PromptOverrides and only return the `id`
     * const promptOverrideWithIdOnly = await prisma.promptOverride.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PromptOverrideCreateManyAndReturnArgs>(args?: SelectSubset<T, PromptOverrideCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PromptOverridePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a PromptOverride.
     * @param {PromptOverrideDeleteArgs} args - Arguments to delete one PromptOverride.
     * @example
     * // Delete one PromptOverride
     * const PromptOverride = await prisma.promptOverride.delete({
     *   where: {
     *     // ... filter to delete one PromptOverride
     *   }
     * })
     * 
     */
    delete<T extends PromptOverrideDeleteArgs>(args: SelectSubset<T, PromptOverrideDeleteArgs<ExtArgs>>): Prisma__PromptOverrideClient<$Result.GetResult<Prisma.$PromptOverridePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one PromptOverride.
     * @param {PromptOverrideUpdateArgs} args - Arguments to update one PromptOverride.
     * @example
     * // Update one PromptOverride
     * const promptOverride = await prisma.promptOverride.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PromptOverrideUpdateArgs>(args: SelectSubset<T, PromptOverrideUpdateArgs<ExtArgs>>): Prisma__PromptOverrideClient<$Result.GetResult<Prisma.$PromptOverridePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more PromptOverrides.
     * @param {PromptOverrideDeleteManyArgs} args - Arguments to filter PromptOverrides to delete.
     * @example
     * // Delete a few PromptOverrides
     * const { count } = await prisma.promptOverride.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PromptOverrideDeleteManyArgs>(args?: SelectSubset<T, PromptOverrideDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PromptOverrides.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PromptOverrideUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PromptOverrides
     * const promptOverride = await prisma.promptOverride.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PromptOverrideUpdateManyArgs>(args: SelectSubset<T, PromptOverrideUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PromptOverrides and returns the data updated in the database.
     * @param {PromptOverrideUpdateManyAndReturnArgs} args - Arguments to update many PromptOverrides.
     * @example
     * // Update many PromptOverrides
     * const promptOverride = await prisma.promptOverride.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more PromptOverrides and only return the `id`
     * const promptOverrideWithIdOnly = await prisma.promptOverride.updateManyAndReturn({
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
    updateManyAndReturn<T extends PromptOverrideUpdateManyAndReturnArgs>(args: SelectSubset<T, PromptOverrideUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PromptOverridePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one PromptOverride.
     * @param {PromptOverrideUpsertArgs} args - Arguments to update or create a PromptOverride.
     * @example
     * // Update or create a PromptOverride
     * const promptOverride = await prisma.promptOverride.upsert({
     *   create: {
     *     // ... data to create a PromptOverride
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PromptOverride we want to update
     *   }
     * })
     */
    upsert<T extends PromptOverrideUpsertArgs>(args: SelectSubset<T, PromptOverrideUpsertArgs<ExtArgs>>): Prisma__PromptOverrideClient<$Result.GetResult<Prisma.$PromptOverridePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of PromptOverrides.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PromptOverrideCountArgs} args - Arguments to filter PromptOverrides to count.
     * @example
     * // Count the number of PromptOverrides
     * const count = await prisma.promptOverride.count({
     *   where: {
     *     // ... the filter for the PromptOverrides we want to count
     *   }
     * })
    **/
    count<T extends PromptOverrideCountArgs>(
      args?: Subset<T, PromptOverrideCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PromptOverrideCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PromptOverride.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PromptOverrideAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends PromptOverrideAggregateArgs>(args: Subset<T, PromptOverrideAggregateArgs>): Prisma.PrismaPromise<GetPromptOverrideAggregateType<T>>

    /**
     * Group by PromptOverride.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PromptOverrideGroupByArgs} args - Group by arguments.
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
      T extends PromptOverrideGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PromptOverrideGroupByArgs['orderBy'] }
        : { orderBy?: PromptOverrideGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, PromptOverrideGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPromptOverrideGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PromptOverride model
   */
  readonly fields: PromptOverrideFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PromptOverride.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PromptOverrideClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the PromptOverride model
   */
  interface PromptOverrideFieldRefs {
    readonly id: FieldRef<"PromptOverride", 'String'>
    readonly agentType: FieldRef<"PromptOverride", 'String'>
    readonly systemPrompt: FieldRef<"PromptOverride", 'String'>
    readonly modelName: FieldRef<"PromptOverride", 'String'>
    readonly temperature: FieldRef<"PromptOverride", 'Float'>
    readonly version: FieldRef<"PromptOverride", 'Int'>
    readonly isActive: FieldRef<"PromptOverride", 'Boolean'>
    readonly notes: FieldRef<"PromptOverride", 'String'>
    readonly createdByUserId: FieldRef<"PromptOverride", 'String'>
    readonly createdAt: FieldRef<"PromptOverride", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PromptOverride findUnique
   */
  export type PromptOverrideFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PromptOverride
     */
    select?: PromptOverrideSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PromptOverride
     */
    omit?: PromptOverrideOmit<ExtArgs> | null
    /**
     * Filter, which PromptOverride to fetch.
     */
    where: PromptOverrideWhereUniqueInput
  }

  /**
   * PromptOverride findUniqueOrThrow
   */
  export type PromptOverrideFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PromptOverride
     */
    select?: PromptOverrideSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PromptOverride
     */
    omit?: PromptOverrideOmit<ExtArgs> | null
    /**
     * Filter, which PromptOverride to fetch.
     */
    where: PromptOverrideWhereUniqueInput
  }

  /**
   * PromptOverride findFirst
   */
  export type PromptOverrideFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PromptOverride
     */
    select?: PromptOverrideSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PromptOverride
     */
    omit?: PromptOverrideOmit<ExtArgs> | null
    /**
     * Filter, which PromptOverride to fetch.
     */
    where?: PromptOverrideWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PromptOverrides to fetch.
     */
    orderBy?: PromptOverrideOrderByWithRelationInput | PromptOverrideOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PromptOverrides.
     */
    cursor?: PromptOverrideWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PromptOverrides from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PromptOverrides.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PromptOverrides.
     */
    distinct?: PromptOverrideScalarFieldEnum | PromptOverrideScalarFieldEnum[]
  }

  /**
   * PromptOverride findFirstOrThrow
   */
  export type PromptOverrideFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PromptOverride
     */
    select?: PromptOverrideSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PromptOverride
     */
    omit?: PromptOverrideOmit<ExtArgs> | null
    /**
     * Filter, which PromptOverride to fetch.
     */
    where?: PromptOverrideWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PromptOverrides to fetch.
     */
    orderBy?: PromptOverrideOrderByWithRelationInput | PromptOverrideOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PromptOverrides.
     */
    cursor?: PromptOverrideWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PromptOverrides from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PromptOverrides.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PromptOverrides.
     */
    distinct?: PromptOverrideScalarFieldEnum | PromptOverrideScalarFieldEnum[]
  }

  /**
   * PromptOverride findMany
   */
  export type PromptOverrideFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PromptOverride
     */
    select?: PromptOverrideSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PromptOverride
     */
    omit?: PromptOverrideOmit<ExtArgs> | null
    /**
     * Filter, which PromptOverrides to fetch.
     */
    where?: PromptOverrideWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PromptOverrides to fetch.
     */
    orderBy?: PromptOverrideOrderByWithRelationInput | PromptOverrideOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PromptOverrides.
     */
    cursor?: PromptOverrideWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PromptOverrides from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PromptOverrides.
     */
    skip?: number
    distinct?: PromptOverrideScalarFieldEnum | PromptOverrideScalarFieldEnum[]
  }

  /**
   * PromptOverride create
   */
  export type PromptOverrideCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PromptOverride
     */
    select?: PromptOverrideSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PromptOverride
     */
    omit?: PromptOverrideOmit<ExtArgs> | null
    /**
     * The data needed to create a PromptOverride.
     */
    data: XOR<PromptOverrideCreateInput, PromptOverrideUncheckedCreateInput>
  }

  /**
   * PromptOverride createMany
   */
  export type PromptOverrideCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PromptOverrides.
     */
    data: PromptOverrideCreateManyInput | PromptOverrideCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PromptOverride createManyAndReturn
   */
  export type PromptOverrideCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PromptOverride
     */
    select?: PromptOverrideSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PromptOverride
     */
    omit?: PromptOverrideOmit<ExtArgs> | null
    /**
     * The data used to create many PromptOverrides.
     */
    data: PromptOverrideCreateManyInput | PromptOverrideCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PromptOverride update
   */
  export type PromptOverrideUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PromptOverride
     */
    select?: PromptOverrideSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PromptOverride
     */
    omit?: PromptOverrideOmit<ExtArgs> | null
    /**
     * The data needed to update a PromptOverride.
     */
    data: XOR<PromptOverrideUpdateInput, PromptOverrideUncheckedUpdateInput>
    /**
     * Choose, which PromptOverride to update.
     */
    where: PromptOverrideWhereUniqueInput
  }

  /**
   * PromptOverride updateMany
   */
  export type PromptOverrideUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PromptOverrides.
     */
    data: XOR<PromptOverrideUpdateManyMutationInput, PromptOverrideUncheckedUpdateManyInput>
    /**
     * Filter which PromptOverrides to update
     */
    where?: PromptOverrideWhereInput
    /**
     * Limit how many PromptOverrides to update.
     */
    limit?: number
  }

  /**
   * PromptOverride updateManyAndReturn
   */
  export type PromptOverrideUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PromptOverride
     */
    select?: PromptOverrideSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PromptOverride
     */
    omit?: PromptOverrideOmit<ExtArgs> | null
    /**
     * The data used to update PromptOverrides.
     */
    data: XOR<PromptOverrideUpdateManyMutationInput, PromptOverrideUncheckedUpdateManyInput>
    /**
     * Filter which PromptOverrides to update
     */
    where?: PromptOverrideWhereInput
    /**
     * Limit how many PromptOverrides to update.
     */
    limit?: number
  }

  /**
   * PromptOverride upsert
   */
  export type PromptOverrideUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PromptOverride
     */
    select?: PromptOverrideSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PromptOverride
     */
    omit?: PromptOverrideOmit<ExtArgs> | null
    /**
     * The filter to search for the PromptOverride to update in case it exists.
     */
    where: PromptOverrideWhereUniqueInput
    /**
     * In case the PromptOverride found by the `where` argument doesn't exist, create a new PromptOverride with this data.
     */
    create: XOR<PromptOverrideCreateInput, PromptOverrideUncheckedCreateInput>
    /**
     * In case the PromptOverride was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PromptOverrideUpdateInput, PromptOverrideUncheckedUpdateInput>
  }

  /**
   * PromptOverride delete
   */
  export type PromptOverrideDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PromptOverride
     */
    select?: PromptOverrideSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PromptOverride
     */
    omit?: PromptOverrideOmit<ExtArgs> | null
    /**
     * Filter which PromptOverride to delete.
     */
    where: PromptOverrideWhereUniqueInput
  }

  /**
   * PromptOverride deleteMany
   */
  export type PromptOverrideDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PromptOverrides to delete
     */
    where?: PromptOverrideWhereInput
    /**
     * Limit how many PromptOverrides to delete.
     */
    limit?: number
  }

  /**
   * PromptOverride without action
   */
  export type PromptOverrideDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PromptOverride
     */
    select?: PromptOverrideSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PromptOverride
     */
    omit?: PromptOverrideOmit<ExtArgs> | null
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


  export const ModuleRegistryScalarFieldEnum: {
    id: 'id',
    key: 'key',
    name: 'name',
    version: 'version',
    category: 'category',
    type: 'type',
    requiresPlan: 'requiresPlan',
    manifest: 'manifest',
    defaultEnabled: 'defaultEnabled',
    createdAt: 'createdAt'
  };

  export type ModuleRegistryScalarFieldEnum = (typeof ModuleRegistryScalarFieldEnum)[keyof typeof ModuleRegistryScalarFieldEnum]


  export const TenantModuleScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    moduleKey: 'moduleKey',
    enabled: 'enabled',
    config: 'config',
    enabledAt: 'enabledAt',
    updatedBy: 'updatedBy',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type TenantModuleScalarFieldEnum = (typeof TenantModuleScalarFieldEnum)[keyof typeof TenantModuleScalarFieldEnum]


  export const PlatformAgentKillSwitchScalarFieldEnum: {
    agentType: 'agentType',
    disabled: 'disabled',
    reason: 'reason',
    updatedByUserId: 'updatedByUserId',
    updatedAt: 'updatedAt'
  };

  export type PlatformAgentKillSwitchScalarFieldEnum = (typeof PlatformAgentKillSwitchScalarFieldEnum)[keyof typeof PlatformAgentKillSwitchScalarFieldEnum]


  export const PlatformKillAuditScalarFieldEnum: {
    id: 'id',
    agentType: 'agentType',
    disabled: 'disabled',
    reason: 'reason',
    actorUserId: 'actorUserId',
    createdAt: 'createdAt'
  };

  export type PlatformKillAuditScalarFieldEnum = (typeof PlatformKillAuditScalarFieldEnum)[keyof typeof PlatformKillAuditScalarFieldEnum]


  export const StripeSubscriptionScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    stripeCustomerId: 'stripeCustomerId',
    stripeSubscriptionId: 'stripeSubscriptionId',
    plan: 'plan',
    status: 'status',
    currentPeriodEnd: 'currentPeriodEnd',
    cancelAtPeriodEnd: 'cancelAtPeriodEnd',
    stripePriceId: 'stripePriceId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type StripeSubscriptionScalarFieldEnum = (typeof StripeSubscriptionScalarFieldEnum)[keyof typeof StripeSubscriptionScalarFieldEnum]


  export const StripeWebhookEventScalarFieldEnum: {
    id: 'id',
    type: 'type',
    tenantId: 'tenantId',
    livemode: 'livemode',
    payload: 'payload',
    processedAt: 'processedAt',
    processingError: 'processingError',
    createdAt: 'createdAt'
  };

  export type StripeWebhookEventScalarFieldEnum = (typeof StripeWebhookEventScalarFieldEnum)[keyof typeof StripeWebhookEventScalarFieldEnum]


  export const PromptOverrideScalarFieldEnum: {
    id: 'id',
    agentType: 'agentType',
    systemPrompt: 'systemPrompt',
    modelName: 'modelName',
    temperature: 'temperature',
    version: 'version',
    isActive: 'isActive',
    notes: 'notes',
    createdByUserId: 'createdByUserId',
    createdAt: 'createdAt'
  };

  export type PromptOverrideScalarFieldEnum = (typeof PromptOverrideScalarFieldEnum)[keyof typeof PromptOverrideScalarFieldEnum]


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

  export type ModuleRegistryWhereInput = {
    AND?: ModuleRegistryWhereInput | ModuleRegistryWhereInput[]
    OR?: ModuleRegistryWhereInput[]
    NOT?: ModuleRegistryWhereInput | ModuleRegistryWhereInput[]
    id?: StringFilter<"ModuleRegistry"> | string
    key?: StringFilter<"ModuleRegistry"> | string
    name?: StringFilter<"ModuleRegistry"> | string
    version?: StringFilter<"ModuleRegistry"> | string
    category?: StringFilter<"ModuleRegistry"> | string
    type?: StringFilter<"ModuleRegistry"> | string
    requiresPlan?: StringNullableFilter<"ModuleRegistry"> | string | null
    manifest?: JsonFilter<"ModuleRegistry">
    defaultEnabled?: BoolFilter<"ModuleRegistry"> | boolean
    createdAt?: DateTimeFilter<"ModuleRegistry"> | Date | string
  }

  export type ModuleRegistryOrderByWithRelationInput = {
    id?: SortOrder
    key?: SortOrder
    name?: SortOrder
    version?: SortOrder
    category?: SortOrder
    type?: SortOrder
    requiresPlan?: SortOrderInput | SortOrder
    manifest?: SortOrder
    defaultEnabled?: SortOrder
    createdAt?: SortOrder
  }

  export type ModuleRegistryWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    key?: string
    AND?: ModuleRegistryWhereInput | ModuleRegistryWhereInput[]
    OR?: ModuleRegistryWhereInput[]
    NOT?: ModuleRegistryWhereInput | ModuleRegistryWhereInput[]
    name?: StringFilter<"ModuleRegistry"> | string
    version?: StringFilter<"ModuleRegistry"> | string
    category?: StringFilter<"ModuleRegistry"> | string
    type?: StringFilter<"ModuleRegistry"> | string
    requiresPlan?: StringNullableFilter<"ModuleRegistry"> | string | null
    manifest?: JsonFilter<"ModuleRegistry">
    defaultEnabled?: BoolFilter<"ModuleRegistry"> | boolean
    createdAt?: DateTimeFilter<"ModuleRegistry"> | Date | string
  }, "id" | "key">

  export type ModuleRegistryOrderByWithAggregationInput = {
    id?: SortOrder
    key?: SortOrder
    name?: SortOrder
    version?: SortOrder
    category?: SortOrder
    type?: SortOrder
    requiresPlan?: SortOrderInput | SortOrder
    manifest?: SortOrder
    defaultEnabled?: SortOrder
    createdAt?: SortOrder
    _count?: ModuleRegistryCountOrderByAggregateInput
    _max?: ModuleRegistryMaxOrderByAggregateInput
    _min?: ModuleRegistryMinOrderByAggregateInput
  }

  export type ModuleRegistryScalarWhereWithAggregatesInput = {
    AND?: ModuleRegistryScalarWhereWithAggregatesInput | ModuleRegistryScalarWhereWithAggregatesInput[]
    OR?: ModuleRegistryScalarWhereWithAggregatesInput[]
    NOT?: ModuleRegistryScalarWhereWithAggregatesInput | ModuleRegistryScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ModuleRegistry"> | string
    key?: StringWithAggregatesFilter<"ModuleRegistry"> | string
    name?: StringWithAggregatesFilter<"ModuleRegistry"> | string
    version?: StringWithAggregatesFilter<"ModuleRegistry"> | string
    category?: StringWithAggregatesFilter<"ModuleRegistry"> | string
    type?: StringWithAggregatesFilter<"ModuleRegistry"> | string
    requiresPlan?: StringNullableWithAggregatesFilter<"ModuleRegistry"> | string | null
    manifest?: JsonWithAggregatesFilter<"ModuleRegistry">
    defaultEnabled?: BoolWithAggregatesFilter<"ModuleRegistry"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"ModuleRegistry"> | Date | string
  }

  export type TenantModuleWhereInput = {
    AND?: TenantModuleWhereInput | TenantModuleWhereInput[]
    OR?: TenantModuleWhereInput[]
    NOT?: TenantModuleWhereInput | TenantModuleWhereInput[]
    id?: StringFilter<"TenantModule"> | string
    tenantId?: StringFilter<"TenantModule"> | string
    moduleKey?: StringFilter<"TenantModule"> | string
    enabled?: BoolFilter<"TenantModule"> | boolean
    config?: JsonFilter<"TenantModule">
    enabledAt?: DateTimeNullableFilter<"TenantModule"> | Date | string | null
    updatedBy?: StringFilter<"TenantModule"> | string
    createdAt?: DateTimeFilter<"TenantModule"> | Date | string
    updatedAt?: DateTimeFilter<"TenantModule"> | Date | string
  }

  export type TenantModuleOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    moduleKey?: SortOrder
    enabled?: SortOrder
    config?: SortOrder
    enabledAt?: SortOrderInput | SortOrder
    updatedBy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TenantModuleWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    tenantId_moduleKey?: TenantModuleTenantIdModuleKeyCompoundUniqueInput
    AND?: TenantModuleWhereInput | TenantModuleWhereInput[]
    OR?: TenantModuleWhereInput[]
    NOT?: TenantModuleWhereInput | TenantModuleWhereInput[]
    tenantId?: StringFilter<"TenantModule"> | string
    moduleKey?: StringFilter<"TenantModule"> | string
    enabled?: BoolFilter<"TenantModule"> | boolean
    config?: JsonFilter<"TenantModule">
    enabledAt?: DateTimeNullableFilter<"TenantModule"> | Date | string | null
    updatedBy?: StringFilter<"TenantModule"> | string
    createdAt?: DateTimeFilter<"TenantModule"> | Date | string
    updatedAt?: DateTimeFilter<"TenantModule"> | Date | string
  }, "id" | "tenantId_moduleKey">

  export type TenantModuleOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    moduleKey?: SortOrder
    enabled?: SortOrder
    config?: SortOrder
    enabledAt?: SortOrderInput | SortOrder
    updatedBy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: TenantModuleCountOrderByAggregateInput
    _max?: TenantModuleMaxOrderByAggregateInput
    _min?: TenantModuleMinOrderByAggregateInput
  }

  export type TenantModuleScalarWhereWithAggregatesInput = {
    AND?: TenantModuleScalarWhereWithAggregatesInput | TenantModuleScalarWhereWithAggregatesInput[]
    OR?: TenantModuleScalarWhereWithAggregatesInput[]
    NOT?: TenantModuleScalarWhereWithAggregatesInput | TenantModuleScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"TenantModule"> | string
    tenantId?: StringWithAggregatesFilter<"TenantModule"> | string
    moduleKey?: StringWithAggregatesFilter<"TenantModule"> | string
    enabled?: BoolWithAggregatesFilter<"TenantModule"> | boolean
    config?: JsonWithAggregatesFilter<"TenantModule">
    enabledAt?: DateTimeNullableWithAggregatesFilter<"TenantModule"> | Date | string | null
    updatedBy?: StringWithAggregatesFilter<"TenantModule"> | string
    createdAt?: DateTimeWithAggregatesFilter<"TenantModule"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"TenantModule"> | Date | string
  }

  export type PlatformAgentKillSwitchWhereInput = {
    AND?: PlatformAgentKillSwitchWhereInput | PlatformAgentKillSwitchWhereInput[]
    OR?: PlatformAgentKillSwitchWhereInput[]
    NOT?: PlatformAgentKillSwitchWhereInput | PlatformAgentKillSwitchWhereInput[]
    agentType?: StringFilter<"PlatformAgentKillSwitch"> | string
    disabled?: BoolFilter<"PlatformAgentKillSwitch"> | boolean
    reason?: StringNullableFilter<"PlatformAgentKillSwitch"> | string | null
    updatedByUserId?: StringNullableFilter<"PlatformAgentKillSwitch"> | string | null
    updatedAt?: DateTimeFilter<"PlatformAgentKillSwitch"> | Date | string
  }

  export type PlatformAgentKillSwitchOrderByWithRelationInput = {
    agentType?: SortOrder
    disabled?: SortOrder
    reason?: SortOrderInput | SortOrder
    updatedByUserId?: SortOrderInput | SortOrder
    updatedAt?: SortOrder
  }

  export type PlatformAgentKillSwitchWhereUniqueInput = Prisma.AtLeast<{
    agentType?: string
    AND?: PlatformAgentKillSwitchWhereInput | PlatformAgentKillSwitchWhereInput[]
    OR?: PlatformAgentKillSwitchWhereInput[]
    NOT?: PlatformAgentKillSwitchWhereInput | PlatformAgentKillSwitchWhereInput[]
    disabled?: BoolFilter<"PlatformAgentKillSwitch"> | boolean
    reason?: StringNullableFilter<"PlatformAgentKillSwitch"> | string | null
    updatedByUserId?: StringNullableFilter<"PlatformAgentKillSwitch"> | string | null
    updatedAt?: DateTimeFilter<"PlatformAgentKillSwitch"> | Date | string
  }, "agentType">

  export type PlatformAgentKillSwitchOrderByWithAggregationInput = {
    agentType?: SortOrder
    disabled?: SortOrder
    reason?: SortOrderInput | SortOrder
    updatedByUserId?: SortOrderInput | SortOrder
    updatedAt?: SortOrder
    _count?: PlatformAgentKillSwitchCountOrderByAggregateInput
    _max?: PlatformAgentKillSwitchMaxOrderByAggregateInput
    _min?: PlatformAgentKillSwitchMinOrderByAggregateInput
  }

  export type PlatformAgentKillSwitchScalarWhereWithAggregatesInput = {
    AND?: PlatformAgentKillSwitchScalarWhereWithAggregatesInput | PlatformAgentKillSwitchScalarWhereWithAggregatesInput[]
    OR?: PlatformAgentKillSwitchScalarWhereWithAggregatesInput[]
    NOT?: PlatformAgentKillSwitchScalarWhereWithAggregatesInput | PlatformAgentKillSwitchScalarWhereWithAggregatesInput[]
    agentType?: StringWithAggregatesFilter<"PlatformAgentKillSwitch"> | string
    disabled?: BoolWithAggregatesFilter<"PlatformAgentKillSwitch"> | boolean
    reason?: StringNullableWithAggregatesFilter<"PlatformAgentKillSwitch"> | string | null
    updatedByUserId?: StringNullableWithAggregatesFilter<"PlatformAgentKillSwitch"> | string | null
    updatedAt?: DateTimeWithAggregatesFilter<"PlatformAgentKillSwitch"> | Date | string
  }

  export type PlatformKillAuditWhereInput = {
    AND?: PlatformKillAuditWhereInput | PlatformKillAuditWhereInput[]
    OR?: PlatformKillAuditWhereInput[]
    NOT?: PlatformKillAuditWhereInput | PlatformKillAuditWhereInput[]
    id?: StringFilter<"PlatformKillAudit"> | string
    agentType?: StringFilter<"PlatformKillAudit"> | string
    disabled?: BoolFilter<"PlatformKillAudit"> | boolean
    reason?: StringNullableFilter<"PlatformKillAudit"> | string | null
    actorUserId?: StringNullableFilter<"PlatformKillAudit"> | string | null
    createdAt?: DateTimeFilter<"PlatformKillAudit"> | Date | string
  }

  export type PlatformKillAuditOrderByWithRelationInput = {
    id?: SortOrder
    agentType?: SortOrder
    disabled?: SortOrder
    reason?: SortOrderInput | SortOrder
    actorUserId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
  }

  export type PlatformKillAuditWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: PlatformKillAuditWhereInput | PlatformKillAuditWhereInput[]
    OR?: PlatformKillAuditWhereInput[]
    NOT?: PlatformKillAuditWhereInput | PlatformKillAuditWhereInput[]
    agentType?: StringFilter<"PlatformKillAudit"> | string
    disabled?: BoolFilter<"PlatformKillAudit"> | boolean
    reason?: StringNullableFilter<"PlatformKillAudit"> | string | null
    actorUserId?: StringNullableFilter<"PlatformKillAudit"> | string | null
    createdAt?: DateTimeFilter<"PlatformKillAudit"> | Date | string
  }, "id">

  export type PlatformKillAuditOrderByWithAggregationInput = {
    id?: SortOrder
    agentType?: SortOrder
    disabled?: SortOrder
    reason?: SortOrderInput | SortOrder
    actorUserId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: PlatformKillAuditCountOrderByAggregateInput
    _max?: PlatformKillAuditMaxOrderByAggregateInput
    _min?: PlatformKillAuditMinOrderByAggregateInput
  }

  export type PlatformKillAuditScalarWhereWithAggregatesInput = {
    AND?: PlatformKillAuditScalarWhereWithAggregatesInput | PlatformKillAuditScalarWhereWithAggregatesInput[]
    OR?: PlatformKillAuditScalarWhereWithAggregatesInput[]
    NOT?: PlatformKillAuditScalarWhereWithAggregatesInput | PlatformKillAuditScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"PlatformKillAudit"> | string
    agentType?: StringWithAggregatesFilter<"PlatformKillAudit"> | string
    disabled?: BoolWithAggregatesFilter<"PlatformKillAudit"> | boolean
    reason?: StringNullableWithAggregatesFilter<"PlatformKillAudit"> | string | null
    actorUserId?: StringNullableWithAggregatesFilter<"PlatformKillAudit"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"PlatformKillAudit"> | Date | string
  }

  export type StripeSubscriptionWhereInput = {
    AND?: StripeSubscriptionWhereInput | StripeSubscriptionWhereInput[]
    OR?: StripeSubscriptionWhereInput[]
    NOT?: StripeSubscriptionWhereInput | StripeSubscriptionWhereInput[]
    id?: StringFilter<"StripeSubscription"> | string
    tenantId?: StringFilter<"StripeSubscription"> | string
    stripeCustomerId?: StringFilter<"StripeSubscription"> | string
    stripeSubscriptionId?: StringFilter<"StripeSubscription"> | string
    plan?: StringFilter<"StripeSubscription"> | string
    status?: StringFilter<"StripeSubscription"> | string
    currentPeriodEnd?: DateTimeFilter<"StripeSubscription"> | Date | string
    cancelAtPeriodEnd?: BoolFilter<"StripeSubscription"> | boolean
    stripePriceId?: StringFilter<"StripeSubscription"> | string
    createdAt?: DateTimeFilter<"StripeSubscription"> | Date | string
    updatedAt?: DateTimeFilter<"StripeSubscription"> | Date | string
  }

  export type StripeSubscriptionOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    stripeCustomerId?: SortOrder
    stripeSubscriptionId?: SortOrder
    plan?: SortOrder
    status?: SortOrder
    currentPeriodEnd?: SortOrder
    cancelAtPeriodEnd?: SortOrder
    stripePriceId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StripeSubscriptionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    tenantId?: string
    stripeCustomerId?: string
    stripeSubscriptionId?: string
    AND?: StripeSubscriptionWhereInput | StripeSubscriptionWhereInput[]
    OR?: StripeSubscriptionWhereInput[]
    NOT?: StripeSubscriptionWhereInput | StripeSubscriptionWhereInput[]
    plan?: StringFilter<"StripeSubscription"> | string
    status?: StringFilter<"StripeSubscription"> | string
    currentPeriodEnd?: DateTimeFilter<"StripeSubscription"> | Date | string
    cancelAtPeriodEnd?: BoolFilter<"StripeSubscription"> | boolean
    stripePriceId?: StringFilter<"StripeSubscription"> | string
    createdAt?: DateTimeFilter<"StripeSubscription"> | Date | string
    updatedAt?: DateTimeFilter<"StripeSubscription"> | Date | string
  }, "id" | "tenantId" | "stripeCustomerId" | "stripeSubscriptionId">

  export type StripeSubscriptionOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    stripeCustomerId?: SortOrder
    stripeSubscriptionId?: SortOrder
    plan?: SortOrder
    status?: SortOrder
    currentPeriodEnd?: SortOrder
    cancelAtPeriodEnd?: SortOrder
    stripePriceId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: StripeSubscriptionCountOrderByAggregateInput
    _max?: StripeSubscriptionMaxOrderByAggregateInput
    _min?: StripeSubscriptionMinOrderByAggregateInput
  }

  export type StripeSubscriptionScalarWhereWithAggregatesInput = {
    AND?: StripeSubscriptionScalarWhereWithAggregatesInput | StripeSubscriptionScalarWhereWithAggregatesInput[]
    OR?: StripeSubscriptionScalarWhereWithAggregatesInput[]
    NOT?: StripeSubscriptionScalarWhereWithAggregatesInput | StripeSubscriptionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"StripeSubscription"> | string
    tenantId?: StringWithAggregatesFilter<"StripeSubscription"> | string
    stripeCustomerId?: StringWithAggregatesFilter<"StripeSubscription"> | string
    stripeSubscriptionId?: StringWithAggregatesFilter<"StripeSubscription"> | string
    plan?: StringWithAggregatesFilter<"StripeSubscription"> | string
    status?: StringWithAggregatesFilter<"StripeSubscription"> | string
    currentPeriodEnd?: DateTimeWithAggregatesFilter<"StripeSubscription"> | Date | string
    cancelAtPeriodEnd?: BoolWithAggregatesFilter<"StripeSubscription"> | boolean
    stripePriceId?: StringWithAggregatesFilter<"StripeSubscription"> | string
    createdAt?: DateTimeWithAggregatesFilter<"StripeSubscription"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"StripeSubscription"> | Date | string
  }

  export type StripeWebhookEventWhereInput = {
    AND?: StripeWebhookEventWhereInput | StripeWebhookEventWhereInput[]
    OR?: StripeWebhookEventWhereInput[]
    NOT?: StripeWebhookEventWhereInput | StripeWebhookEventWhereInput[]
    id?: StringFilter<"StripeWebhookEvent"> | string
    type?: StringFilter<"StripeWebhookEvent"> | string
    tenantId?: StringNullableFilter<"StripeWebhookEvent"> | string | null
    livemode?: BoolFilter<"StripeWebhookEvent"> | boolean
    payload?: JsonFilter<"StripeWebhookEvent">
    processedAt?: DateTimeNullableFilter<"StripeWebhookEvent"> | Date | string | null
    processingError?: StringNullableFilter<"StripeWebhookEvent"> | string | null
    createdAt?: DateTimeFilter<"StripeWebhookEvent"> | Date | string
  }

  export type StripeWebhookEventOrderByWithRelationInput = {
    id?: SortOrder
    type?: SortOrder
    tenantId?: SortOrderInput | SortOrder
    livemode?: SortOrder
    payload?: SortOrder
    processedAt?: SortOrderInput | SortOrder
    processingError?: SortOrderInput | SortOrder
    createdAt?: SortOrder
  }

  export type StripeWebhookEventWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: StripeWebhookEventWhereInput | StripeWebhookEventWhereInput[]
    OR?: StripeWebhookEventWhereInput[]
    NOT?: StripeWebhookEventWhereInput | StripeWebhookEventWhereInput[]
    type?: StringFilter<"StripeWebhookEvent"> | string
    tenantId?: StringNullableFilter<"StripeWebhookEvent"> | string | null
    livemode?: BoolFilter<"StripeWebhookEvent"> | boolean
    payload?: JsonFilter<"StripeWebhookEvent">
    processedAt?: DateTimeNullableFilter<"StripeWebhookEvent"> | Date | string | null
    processingError?: StringNullableFilter<"StripeWebhookEvent"> | string | null
    createdAt?: DateTimeFilter<"StripeWebhookEvent"> | Date | string
  }, "id">

  export type StripeWebhookEventOrderByWithAggregationInput = {
    id?: SortOrder
    type?: SortOrder
    tenantId?: SortOrderInput | SortOrder
    livemode?: SortOrder
    payload?: SortOrder
    processedAt?: SortOrderInput | SortOrder
    processingError?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: StripeWebhookEventCountOrderByAggregateInput
    _max?: StripeWebhookEventMaxOrderByAggregateInput
    _min?: StripeWebhookEventMinOrderByAggregateInput
  }

  export type StripeWebhookEventScalarWhereWithAggregatesInput = {
    AND?: StripeWebhookEventScalarWhereWithAggregatesInput | StripeWebhookEventScalarWhereWithAggregatesInput[]
    OR?: StripeWebhookEventScalarWhereWithAggregatesInput[]
    NOT?: StripeWebhookEventScalarWhereWithAggregatesInput | StripeWebhookEventScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"StripeWebhookEvent"> | string
    type?: StringWithAggregatesFilter<"StripeWebhookEvent"> | string
    tenantId?: StringNullableWithAggregatesFilter<"StripeWebhookEvent"> | string | null
    livemode?: BoolWithAggregatesFilter<"StripeWebhookEvent"> | boolean
    payload?: JsonWithAggregatesFilter<"StripeWebhookEvent">
    processedAt?: DateTimeNullableWithAggregatesFilter<"StripeWebhookEvent"> | Date | string | null
    processingError?: StringNullableWithAggregatesFilter<"StripeWebhookEvent"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"StripeWebhookEvent"> | Date | string
  }

  export type PromptOverrideWhereInput = {
    AND?: PromptOverrideWhereInput | PromptOverrideWhereInput[]
    OR?: PromptOverrideWhereInput[]
    NOT?: PromptOverrideWhereInput | PromptOverrideWhereInput[]
    id?: StringFilter<"PromptOverride"> | string
    agentType?: StringFilter<"PromptOverride"> | string
    systemPrompt?: StringNullableFilter<"PromptOverride"> | string | null
    modelName?: StringNullableFilter<"PromptOverride"> | string | null
    temperature?: FloatNullableFilter<"PromptOverride"> | number | null
    version?: IntFilter<"PromptOverride"> | number
    isActive?: BoolFilter<"PromptOverride"> | boolean
    notes?: StringNullableFilter<"PromptOverride"> | string | null
    createdByUserId?: StringNullableFilter<"PromptOverride"> | string | null
    createdAt?: DateTimeFilter<"PromptOverride"> | Date | string
  }

  export type PromptOverrideOrderByWithRelationInput = {
    id?: SortOrder
    agentType?: SortOrder
    systemPrompt?: SortOrderInput | SortOrder
    modelName?: SortOrderInput | SortOrder
    temperature?: SortOrderInput | SortOrder
    version?: SortOrder
    isActive?: SortOrder
    notes?: SortOrderInput | SortOrder
    createdByUserId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
  }

  export type PromptOverrideWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: PromptOverrideWhereInput | PromptOverrideWhereInput[]
    OR?: PromptOverrideWhereInput[]
    NOT?: PromptOverrideWhereInput | PromptOverrideWhereInput[]
    agentType?: StringFilter<"PromptOverride"> | string
    systemPrompt?: StringNullableFilter<"PromptOverride"> | string | null
    modelName?: StringNullableFilter<"PromptOverride"> | string | null
    temperature?: FloatNullableFilter<"PromptOverride"> | number | null
    version?: IntFilter<"PromptOverride"> | number
    isActive?: BoolFilter<"PromptOverride"> | boolean
    notes?: StringNullableFilter<"PromptOverride"> | string | null
    createdByUserId?: StringNullableFilter<"PromptOverride"> | string | null
    createdAt?: DateTimeFilter<"PromptOverride"> | Date | string
  }, "id">

  export type PromptOverrideOrderByWithAggregationInput = {
    id?: SortOrder
    agentType?: SortOrder
    systemPrompt?: SortOrderInput | SortOrder
    modelName?: SortOrderInput | SortOrder
    temperature?: SortOrderInput | SortOrder
    version?: SortOrder
    isActive?: SortOrder
    notes?: SortOrderInput | SortOrder
    createdByUserId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: PromptOverrideCountOrderByAggregateInput
    _avg?: PromptOverrideAvgOrderByAggregateInput
    _max?: PromptOverrideMaxOrderByAggregateInput
    _min?: PromptOverrideMinOrderByAggregateInput
    _sum?: PromptOverrideSumOrderByAggregateInput
  }

  export type PromptOverrideScalarWhereWithAggregatesInput = {
    AND?: PromptOverrideScalarWhereWithAggregatesInput | PromptOverrideScalarWhereWithAggregatesInput[]
    OR?: PromptOverrideScalarWhereWithAggregatesInput[]
    NOT?: PromptOverrideScalarWhereWithAggregatesInput | PromptOverrideScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"PromptOverride"> | string
    agentType?: StringWithAggregatesFilter<"PromptOverride"> | string
    systemPrompt?: StringNullableWithAggregatesFilter<"PromptOverride"> | string | null
    modelName?: StringNullableWithAggregatesFilter<"PromptOverride"> | string | null
    temperature?: FloatNullableWithAggregatesFilter<"PromptOverride"> | number | null
    version?: IntWithAggregatesFilter<"PromptOverride"> | number
    isActive?: BoolWithAggregatesFilter<"PromptOverride"> | boolean
    notes?: StringNullableWithAggregatesFilter<"PromptOverride"> | string | null
    createdByUserId?: StringNullableWithAggregatesFilter<"PromptOverride"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"PromptOverride"> | Date | string
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

  export type ModuleRegistryCreateInput = {
    id?: string
    key: string
    name: string
    version: string
    category: string
    type: string
    requiresPlan?: string | null
    manifest: JsonNullValueInput | InputJsonValue
    defaultEnabled?: boolean
    createdAt?: Date | string
  }

  export type ModuleRegistryUncheckedCreateInput = {
    id?: string
    key: string
    name: string
    version: string
    category: string
    type: string
    requiresPlan?: string | null
    manifest: JsonNullValueInput | InputJsonValue
    defaultEnabled?: boolean
    createdAt?: Date | string
  }

  export type ModuleRegistryUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    requiresPlan?: NullableStringFieldUpdateOperationsInput | string | null
    manifest?: JsonNullValueInput | InputJsonValue
    defaultEnabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ModuleRegistryUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    requiresPlan?: NullableStringFieldUpdateOperationsInput | string | null
    manifest?: JsonNullValueInput | InputJsonValue
    defaultEnabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ModuleRegistryCreateManyInput = {
    id?: string
    key: string
    name: string
    version: string
    category: string
    type: string
    requiresPlan?: string | null
    manifest: JsonNullValueInput | InputJsonValue
    defaultEnabled?: boolean
    createdAt?: Date | string
  }

  export type ModuleRegistryUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    requiresPlan?: NullableStringFieldUpdateOperationsInput | string | null
    manifest?: JsonNullValueInput | InputJsonValue
    defaultEnabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ModuleRegistryUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    requiresPlan?: NullableStringFieldUpdateOperationsInput | string | null
    manifest?: JsonNullValueInput | InputJsonValue
    defaultEnabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantModuleCreateInput = {
    id?: string
    tenantId: string
    moduleKey: string
    enabled?: boolean
    config?: JsonNullValueInput | InputJsonValue
    enabledAt?: Date | string | null
    updatedBy: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantModuleUncheckedCreateInput = {
    id?: string
    tenantId: string
    moduleKey: string
    enabled?: boolean
    config?: JsonNullValueInput | InputJsonValue
    enabledAt?: Date | string | null
    updatedBy: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantModuleUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    moduleKey?: StringFieldUpdateOperationsInput | string
    enabled?: BoolFieldUpdateOperationsInput | boolean
    config?: JsonNullValueInput | InputJsonValue
    enabledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedBy?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantModuleUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    moduleKey?: StringFieldUpdateOperationsInput | string
    enabled?: BoolFieldUpdateOperationsInput | boolean
    config?: JsonNullValueInput | InputJsonValue
    enabledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedBy?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantModuleCreateManyInput = {
    id?: string
    tenantId: string
    moduleKey: string
    enabled?: boolean
    config?: JsonNullValueInput | InputJsonValue
    enabledAt?: Date | string | null
    updatedBy: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantModuleUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    moduleKey?: StringFieldUpdateOperationsInput | string
    enabled?: BoolFieldUpdateOperationsInput | boolean
    config?: JsonNullValueInput | InputJsonValue
    enabledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedBy?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantModuleUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    moduleKey?: StringFieldUpdateOperationsInput | string
    enabled?: BoolFieldUpdateOperationsInput | boolean
    config?: JsonNullValueInput | InputJsonValue
    enabledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedBy?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PlatformAgentKillSwitchCreateInput = {
    agentType: string
    disabled?: boolean
    reason?: string | null
    updatedByUserId?: string | null
    updatedAt?: Date | string
  }

  export type PlatformAgentKillSwitchUncheckedCreateInput = {
    agentType: string
    disabled?: boolean
    reason?: string | null
    updatedByUserId?: string | null
    updatedAt?: Date | string
  }

  export type PlatformAgentKillSwitchUpdateInput = {
    agentType?: StringFieldUpdateOperationsInput | string
    disabled?: BoolFieldUpdateOperationsInput | boolean
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    updatedByUserId?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PlatformAgentKillSwitchUncheckedUpdateInput = {
    agentType?: StringFieldUpdateOperationsInput | string
    disabled?: BoolFieldUpdateOperationsInput | boolean
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    updatedByUserId?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PlatformAgentKillSwitchCreateManyInput = {
    agentType: string
    disabled?: boolean
    reason?: string | null
    updatedByUserId?: string | null
    updatedAt?: Date | string
  }

  export type PlatformAgentKillSwitchUpdateManyMutationInput = {
    agentType?: StringFieldUpdateOperationsInput | string
    disabled?: BoolFieldUpdateOperationsInput | boolean
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    updatedByUserId?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PlatformAgentKillSwitchUncheckedUpdateManyInput = {
    agentType?: StringFieldUpdateOperationsInput | string
    disabled?: BoolFieldUpdateOperationsInput | boolean
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    updatedByUserId?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PlatformKillAuditCreateInput = {
    id?: string
    agentType: string
    disabled: boolean
    reason?: string | null
    actorUserId?: string | null
    createdAt?: Date | string
  }

  export type PlatformKillAuditUncheckedCreateInput = {
    id?: string
    agentType: string
    disabled: boolean
    reason?: string | null
    actorUserId?: string | null
    createdAt?: Date | string
  }

  export type PlatformKillAuditUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    agentType?: StringFieldUpdateOperationsInput | string
    disabled?: BoolFieldUpdateOperationsInput | boolean
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    actorUserId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PlatformKillAuditUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    agentType?: StringFieldUpdateOperationsInput | string
    disabled?: BoolFieldUpdateOperationsInput | boolean
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    actorUserId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PlatformKillAuditCreateManyInput = {
    id?: string
    agentType: string
    disabled: boolean
    reason?: string | null
    actorUserId?: string | null
    createdAt?: Date | string
  }

  export type PlatformKillAuditUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    agentType?: StringFieldUpdateOperationsInput | string
    disabled?: BoolFieldUpdateOperationsInput | boolean
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    actorUserId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PlatformKillAuditUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    agentType?: StringFieldUpdateOperationsInput | string
    disabled?: BoolFieldUpdateOperationsInput | boolean
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    actorUserId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StripeSubscriptionCreateInput = {
    id?: string
    tenantId: string
    stripeCustomerId: string
    stripeSubscriptionId: string
    plan: string
    status: string
    currentPeriodEnd: Date | string
    cancelAtPeriodEnd?: boolean
    stripePriceId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type StripeSubscriptionUncheckedCreateInput = {
    id?: string
    tenantId: string
    stripeCustomerId: string
    stripeSubscriptionId: string
    plan: string
    status: string
    currentPeriodEnd: Date | string
    cancelAtPeriodEnd?: boolean
    stripePriceId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type StripeSubscriptionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    stripeCustomerId?: StringFieldUpdateOperationsInput | string
    stripeSubscriptionId?: StringFieldUpdateOperationsInput | string
    plan?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    currentPeriodEnd?: DateTimeFieldUpdateOperationsInput | Date | string
    cancelAtPeriodEnd?: BoolFieldUpdateOperationsInput | boolean
    stripePriceId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StripeSubscriptionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    stripeCustomerId?: StringFieldUpdateOperationsInput | string
    stripeSubscriptionId?: StringFieldUpdateOperationsInput | string
    plan?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    currentPeriodEnd?: DateTimeFieldUpdateOperationsInput | Date | string
    cancelAtPeriodEnd?: BoolFieldUpdateOperationsInput | boolean
    stripePriceId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StripeSubscriptionCreateManyInput = {
    id?: string
    tenantId: string
    stripeCustomerId: string
    stripeSubscriptionId: string
    plan: string
    status: string
    currentPeriodEnd: Date | string
    cancelAtPeriodEnd?: boolean
    stripePriceId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type StripeSubscriptionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    stripeCustomerId?: StringFieldUpdateOperationsInput | string
    stripeSubscriptionId?: StringFieldUpdateOperationsInput | string
    plan?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    currentPeriodEnd?: DateTimeFieldUpdateOperationsInput | Date | string
    cancelAtPeriodEnd?: BoolFieldUpdateOperationsInput | boolean
    stripePriceId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StripeSubscriptionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    stripeCustomerId?: StringFieldUpdateOperationsInput | string
    stripeSubscriptionId?: StringFieldUpdateOperationsInput | string
    plan?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    currentPeriodEnd?: DateTimeFieldUpdateOperationsInput | Date | string
    cancelAtPeriodEnd?: BoolFieldUpdateOperationsInput | boolean
    stripePriceId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StripeWebhookEventCreateInput = {
    id: string
    type: string
    tenantId?: string | null
    livemode: boolean
    payload: JsonNullValueInput | InputJsonValue
    processedAt?: Date | string | null
    processingError?: string | null
    createdAt?: Date | string
  }

  export type StripeWebhookEventUncheckedCreateInput = {
    id: string
    type: string
    tenantId?: string | null
    livemode: boolean
    payload: JsonNullValueInput | InputJsonValue
    processedAt?: Date | string | null
    processingError?: string | null
    createdAt?: Date | string
  }

  export type StripeWebhookEventUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    livemode?: BoolFieldUpdateOperationsInput | boolean
    payload?: JsonNullValueInput | InputJsonValue
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    processingError?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StripeWebhookEventUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    livemode?: BoolFieldUpdateOperationsInput | boolean
    payload?: JsonNullValueInput | InputJsonValue
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    processingError?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StripeWebhookEventCreateManyInput = {
    id: string
    type: string
    tenantId?: string | null
    livemode: boolean
    payload: JsonNullValueInput | InputJsonValue
    processedAt?: Date | string | null
    processingError?: string | null
    createdAt?: Date | string
  }

  export type StripeWebhookEventUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    livemode?: BoolFieldUpdateOperationsInput | boolean
    payload?: JsonNullValueInput | InputJsonValue
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    processingError?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StripeWebhookEventUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    livemode?: BoolFieldUpdateOperationsInput | boolean
    payload?: JsonNullValueInput | InputJsonValue
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    processingError?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PromptOverrideCreateInput = {
    id?: string
    agentType: string
    systemPrompt?: string | null
    modelName?: string | null
    temperature?: number | null
    version?: number
    isActive?: boolean
    notes?: string | null
    createdByUserId?: string | null
    createdAt?: Date | string
  }

  export type PromptOverrideUncheckedCreateInput = {
    id?: string
    agentType: string
    systemPrompt?: string | null
    modelName?: string | null
    temperature?: number | null
    version?: number
    isActive?: boolean
    notes?: string | null
    createdByUserId?: string | null
    createdAt?: Date | string
  }

  export type PromptOverrideUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    agentType?: StringFieldUpdateOperationsInput | string
    systemPrompt?: NullableStringFieldUpdateOperationsInput | string | null
    modelName?: NullableStringFieldUpdateOperationsInput | string | null
    temperature?: NullableFloatFieldUpdateOperationsInput | number | null
    version?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdByUserId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PromptOverrideUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    agentType?: StringFieldUpdateOperationsInput | string
    systemPrompt?: NullableStringFieldUpdateOperationsInput | string | null
    modelName?: NullableStringFieldUpdateOperationsInput | string | null
    temperature?: NullableFloatFieldUpdateOperationsInput | number | null
    version?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdByUserId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PromptOverrideCreateManyInput = {
    id?: string
    agentType: string
    systemPrompt?: string | null
    modelName?: string | null
    temperature?: number | null
    version?: number
    isActive?: boolean
    notes?: string | null
    createdByUserId?: string | null
    createdAt?: Date | string
  }

  export type PromptOverrideUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    agentType?: StringFieldUpdateOperationsInput | string
    systemPrompt?: NullableStringFieldUpdateOperationsInput | string | null
    modelName?: NullableStringFieldUpdateOperationsInput | string | null
    temperature?: NullableFloatFieldUpdateOperationsInput | number | null
    version?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdByUserId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PromptOverrideUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    agentType?: StringFieldUpdateOperationsInput | string
    systemPrompt?: NullableStringFieldUpdateOperationsInput | string | null
    modelName?: NullableStringFieldUpdateOperationsInput | string | null
    temperature?: NullableFloatFieldUpdateOperationsInput | number | null
    version?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdByUserId?: NullableStringFieldUpdateOperationsInput | string | null
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

  export type ModuleRegistryCountOrderByAggregateInput = {
    id?: SortOrder
    key?: SortOrder
    name?: SortOrder
    version?: SortOrder
    category?: SortOrder
    type?: SortOrder
    requiresPlan?: SortOrder
    manifest?: SortOrder
    defaultEnabled?: SortOrder
    createdAt?: SortOrder
  }

  export type ModuleRegistryMaxOrderByAggregateInput = {
    id?: SortOrder
    key?: SortOrder
    name?: SortOrder
    version?: SortOrder
    category?: SortOrder
    type?: SortOrder
    requiresPlan?: SortOrder
    defaultEnabled?: SortOrder
    createdAt?: SortOrder
  }

  export type ModuleRegistryMinOrderByAggregateInput = {
    id?: SortOrder
    key?: SortOrder
    name?: SortOrder
    version?: SortOrder
    category?: SortOrder
    type?: SortOrder
    requiresPlan?: SortOrder
    defaultEnabled?: SortOrder
    createdAt?: SortOrder
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

  export type TenantModuleTenantIdModuleKeyCompoundUniqueInput = {
    tenantId: string
    moduleKey: string
  }

  export type TenantModuleCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    moduleKey?: SortOrder
    enabled?: SortOrder
    config?: SortOrder
    enabledAt?: SortOrder
    updatedBy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TenantModuleMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    moduleKey?: SortOrder
    enabled?: SortOrder
    enabledAt?: SortOrder
    updatedBy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TenantModuleMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    moduleKey?: SortOrder
    enabled?: SortOrder
    enabledAt?: SortOrder
    updatedBy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
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

  export type PlatformAgentKillSwitchCountOrderByAggregateInput = {
    agentType?: SortOrder
    disabled?: SortOrder
    reason?: SortOrder
    updatedByUserId?: SortOrder
    updatedAt?: SortOrder
  }

  export type PlatformAgentKillSwitchMaxOrderByAggregateInput = {
    agentType?: SortOrder
    disabled?: SortOrder
    reason?: SortOrder
    updatedByUserId?: SortOrder
    updatedAt?: SortOrder
  }

  export type PlatformAgentKillSwitchMinOrderByAggregateInput = {
    agentType?: SortOrder
    disabled?: SortOrder
    reason?: SortOrder
    updatedByUserId?: SortOrder
    updatedAt?: SortOrder
  }

  export type PlatformKillAuditCountOrderByAggregateInput = {
    id?: SortOrder
    agentType?: SortOrder
    disabled?: SortOrder
    reason?: SortOrder
    actorUserId?: SortOrder
    createdAt?: SortOrder
  }

  export type PlatformKillAuditMaxOrderByAggregateInput = {
    id?: SortOrder
    agentType?: SortOrder
    disabled?: SortOrder
    reason?: SortOrder
    actorUserId?: SortOrder
    createdAt?: SortOrder
  }

  export type PlatformKillAuditMinOrderByAggregateInput = {
    id?: SortOrder
    agentType?: SortOrder
    disabled?: SortOrder
    reason?: SortOrder
    actorUserId?: SortOrder
    createdAt?: SortOrder
  }

  export type StripeSubscriptionCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    stripeCustomerId?: SortOrder
    stripeSubscriptionId?: SortOrder
    plan?: SortOrder
    status?: SortOrder
    currentPeriodEnd?: SortOrder
    cancelAtPeriodEnd?: SortOrder
    stripePriceId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StripeSubscriptionMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    stripeCustomerId?: SortOrder
    stripeSubscriptionId?: SortOrder
    plan?: SortOrder
    status?: SortOrder
    currentPeriodEnd?: SortOrder
    cancelAtPeriodEnd?: SortOrder
    stripePriceId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StripeSubscriptionMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    stripeCustomerId?: SortOrder
    stripeSubscriptionId?: SortOrder
    plan?: SortOrder
    status?: SortOrder
    currentPeriodEnd?: SortOrder
    cancelAtPeriodEnd?: SortOrder
    stripePriceId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StripeWebhookEventCountOrderByAggregateInput = {
    id?: SortOrder
    type?: SortOrder
    tenantId?: SortOrder
    livemode?: SortOrder
    payload?: SortOrder
    processedAt?: SortOrder
    processingError?: SortOrder
    createdAt?: SortOrder
  }

  export type StripeWebhookEventMaxOrderByAggregateInput = {
    id?: SortOrder
    type?: SortOrder
    tenantId?: SortOrder
    livemode?: SortOrder
    processedAt?: SortOrder
    processingError?: SortOrder
    createdAt?: SortOrder
  }

  export type StripeWebhookEventMinOrderByAggregateInput = {
    id?: SortOrder
    type?: SortOrder
    tenantId?: SortOrder
    livemode?: SortOrder
    processedAt?: SortOrder
    processingError?: SortOrder
    createdAt?: SortOrder
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

  export type PromptOverrideCountOrderByAggregateInput = {
    id?: SortOrder
    agentType?: SortOrder
    systemPrompt?: SortOrder
    modelName?: SortOrder
    temperature?: SortOrder
    version?: SortOrder
    isActive?: SortOrder
    notes?: SortOrder
    createdByUserId?: SortOrder
    createdAt?: SortOrder
  }

  export type PromptOverrideAvgOrderByAggregateInput = {
    temperature?: SortOrder
    version?: SortOrder
  }

  export type PromptOverrideMaxOrderByAggregateInput = {
    id?: SortOrder
    agentType?: SortOrder
    systemPrompt?: SortOrder
    modelName?: SortOrder
    temperature?: SortOrder
    version?: SortOrder
    isActive?: SortOrder
    notes?: SortOrder
    createdByUserId?: SortOrder
    createdAt?: SortOrder
  }

  export type PromptOverrideMinOrderByAggregateInput = {
    id?: SortOrder
    agentType?: SortOrder
    systemPrompt?: SortOrder
    modelName?: SortOrder
    temperature?: SortOrder
    version?: SortOrder
    isActive?: SortOrder
    notes?: SortOrder
    createdByUserId?: SortOrder
    createdAt?: SortOrder
  }

  export type PromptOverrideSumOrderByAggregateInput = {
    temperature?: SortOrder
    version?: SortOrder
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

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type NullableFloatFieldUpdateOperationsInput = {
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