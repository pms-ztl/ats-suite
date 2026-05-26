
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
 * Model Tenant
 * 
 */
export type Tenant = $Result.DefaultSelection<Prisma.$TenantPayload>
/**
 * Model PlanChangeRequest
 * 
 */
export type PlanChangeRequest = $Result.DefaultSelection<Prisma.$PlanChangeRequestPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const TenantPlan: {
  FREE: 'FREE',
  STARTER: 'STARTER',
  PROFESSIONAL: 'PROFESSIONAL',
  ENTERPRISE: 'ENTERPRISE'
};

export type TenantPlan = (typeof TenantPlan)[keyof typeof TenantPlan]


export const TenantStatus: {
  TRIAL: 'TRIAL',
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  CANCELLED: 'CANCELLED'
};

export type TenantStatus = (typeof TenantStatus)[keyof typeof TenantStatus]


export const PlanChangeStatus: {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED'
};

export type PlanChangeStatus = (typeof PlanChangeStatus)[keyof typeof PlanChangeStatus]

}

export type TenantPlan = $Enums.TenantPlan

export const TenantPlan: typeof $Enums.TenantPlan

export type TenantStatus = $Enums.TenantStatus

export const TenantStatus: typeof $Enums.TenantStatus

export type PlanChangeStatus = $Enums.PlanChangeStatus

export const PlanChangeStatus: typeof $Enums.PlanChangeStatus

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Tenants
 * const tenants = await prisma.tenant.findMany()
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
   * // Fetch zero or more Tenants
   * const tenants = await prisma.tenant.findMany()
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
   * `prisma.tenant`: Exposes CRUD operations for the **Tenant** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tenants
    * const tenants = await prisma.tenant.findMany()
    * ```
    */
  get tenant(): Prisma.TenantDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.planChangeRequest`: Exposes CRUD operations for the **PlanChangeRequest** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PlanChangeRequests
    * const planChangeRequests = await prisma.planChangeRequest.findMany()
    * ```
    */
  get planChangeRequest(): Prisma.PlanChangeRequestDelegate<ExtArgs, ClientOptions>;
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
    Tenant: 'Tenant',
    PlanChangeRequest: 'PlanChangeRequest'
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
      modelProps: "tenant" | "planChangeRequest"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Tenant: {
        payload: Prisma.$TenantPayload<ExtArgs>
        fields: Prisma.TenantFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TenantFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TenantFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          findFirst: {
            args: Prisma.TenantFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TenantFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          findMany: {
            args: Prisma.TenantFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>[]
          }
          create: {
            args: Prisma.TenantCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          createMany: {
            args: Prisma.TenantCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TenantCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>[]
          }
          delete: {
            args: Prisma.TenantDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          update: {
            args: Prisma.TenantUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          deleteMany: {
            args: Prisma.TenantDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TenantUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TenantUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>[]
          }
          upsert: {
            args: Prisma.TenantUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          aggregate: {
            args: Prisma.TenantAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTenant>
          }
          groupBy: {
            args: Prisma.TenantGroupByArgs<ExtArgs>
            result: $Utils.Optional<TenantGroupByOutputType>[]
          }
          count: {
            args: Prisma.TenantCountArgs<ExtArgs>
            result: $Utils.Optional<TenantCountAggregateOutputType> | number
          }
        }
      }
      PlanChangeRequest: {
        payload: Prisma.$PlanChangeRequestPayload<ExtArgs>
        fields: Prisma.PlanChangeRequestFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PlanChangeRequestFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlanChangeRequestPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PlanChangeRequestFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlanChangeRequestPayload>
          }
          findFirst: {
            args: Prisma.PlanChangeRequestFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlanChangeRequestPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PlanChangeRequestFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlanChangeRequestPayload>
          }
          findMany: {
            args: Prisma.PlanChangeRequestFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlanChangeRequestPayload>[]
          }
          create: {
            args: Prisma.PlanChangeRequestCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlanChangeRequestPayload>
          }
          createMany: {
            args: Prisma.PlanChangeRequestCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PlanChangeRequestCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlanChangeRequestPayload>[]
          }
          delete: {
            args: Prisma.PlanChangeRequestDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlanChangeRequestPayload>
          }
          update: {
            args: Prisma.PlanChangeRequestUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlanChangeRequestPayload>
          }
          deleteMany: {
            args: Prisma.PlanChangeRequestDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PlanChangeRequestUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PlanChangeRequestUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlanChangeRequestPayload>[]
          }
          upsert: {
            args: Prisma.PlanChangeRequestUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlanChangeRequestPayload>
          }
          aggregate: {
            args: Prisma.PlanChangeRequestAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePlanChangeRequest>
          }
          groupBy: {
            args: Prisma.PlanChangeRequestGroupByArgs<ExtArgs>
            result: $Utils.Optional<PlanChangeRequestGroupByOutputType>[]
          }
          count: {
            args: Prisma.PlanChangeRequestCountArgs<ExtArgs>
            result: $Utils.Optional<PlanChangeRequestCountAggregateOutputType> | number
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
    tenant?: TenantOmit
    planChangeRequest?: PlanChangeRequestOmit
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
   * Count Type TenantCountOutputType
   */

  export type TenantCountOutputType = {
    planChangeRequests: number
  }

  export type TenantCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    planChangeRequests?: boolean | TenantCountOutputTypeCountPlanChangeRequestsArgs
  }

  // Custom InputTypes
  /**
   * TenantCountOutputType without action
   */
  export type TenantCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantCountOutputType
     */
    select?: TenantCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * TenantCountOutputType without action
   */
  export type TenantCountOutputTypeCountPlanChangeRequestsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PlanChangeRequestWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Tenant
   */

  export type AggregateTenant = {
    _count: TenantCountAggregateOutputType | null
    _min: TenantMinAggregateOutputType | null
    _max: TenantMaxAggregateOutputType | null
  }

  export type TenantMinAggregateOutputType = {
    id: string | null
    name: string | null
    slug: string | null
    plan: $Enums.TenantPlan | null
    status: $Enums.TenantStatus | null
    trialEndsAt: Date | null
    logoUrl: string | null
    website: string | null
    industry: string | null
    companySize: string | null
    dataRegion: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TenantMaxAggregateOutputType = {
    id: string | null
    name: string | null
    slug: string | null
    plan: $Enums.TenantPlan | null
    status: $Enums.TenantStatus | null
    trialEndsAt: Date | null
    logoUrl: string | null
    website: string | null
    industry: string | null
    companySize: string | null
    dataRegion: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TenantCountAggregateOutputType = {
    id: number
    name: number
    slug: number
    plan: number
    status: number
    trialEndsAt: number
    logoUrl: number
    website: number
    industry: number
    companySize: number
    dataRegion: number
    isolationConfig: number
    settings: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type TenantMinAggregateInputType = {
    id?: true
    name?: true
    slug?: true
    plan?: true
    status?: true
    trialEndsAt?: true
    logoUrl?: true
    website?: true
    industry?: true
    companySize?: true
    dataRegion?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TenantMaxAggregateInputType = {
    id?: true
    name?: true
    slug?: true
    plan?: true
    status?: true
    trialEndsAt?: true
    logoUrl?: true
    website?: true
    industry?: true
    companySize?: true
    dataRegion?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TenantCountAggregateInputType = {
    id?: true
    name?: true
    slug?: true
    plan?: true
    status?: true
    trialEndsAt?: true
    logoUrl?: true
    website?: true
    industry?: true
    companySize?: true
    dataRegion?: true
    isolationConfig?: true
    settings?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type TenantAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Tenant to aggregate.
     */
    where?: TenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tenants to fetch.
     */
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tenants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Tenants
    **/
    _count?: true | TenantCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TenantMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TenantMaxAggregateInputType
  }

  export type GetTenantAggregateType<T extends TenantAggregateArgs> = {
        [P in keyof T & keyof AggregateTenant]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTenant[P]>
      : GetScalarType<T[P], AggregateTenant[P]>
  }




  export type TenantGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TenantWhereInput
    orderBy?: TenantOrderByWithAggregationInput | TenantOrderByWithAggregationInput[]
    by: TenantScalarFieldEnum[] | TenantScalarFieldEnum
    having?: TenantScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TenantCountAggregateInputType | true
    _min?: TenantMinAggregateInputType
    _max?: TenantMaxAggregateInputType
  }

  export type TenantGroupByOutputType = {
    id: string
    name: string
    slug: string
    plan: $Enums.TenantPlan
    status: $Enums.TenantStatus
    trialEndsAt: Date | null
    logoUrl: string | null
    website: string | null
    industry: string | null
    companySize: string | null
    dataRegion: string
    isolationConfig: JsonValue
    settings: JsonValue
    createdAt: Date
    updatedAt: Date
    _count: TenantCountAggregateOutputType | null
    _min: TenantMinAggregateOutputType | null
    _max: TenantMaxAggregateOutputType | null
  }

  type GetTenantGroupByPayload<T extends TenantGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TenantGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TenantGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TenantGroupByOutputType[P]>
            : GetScalarType<T[P], TenantGroupByOutputType[P]>
        }
      >
    >


  export type TenantSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    slug?: boolean
    plan?: boolean
    status?: boolean
    trialEndsAt?: boolean
    logoUrl?: boolean
    website?: boolean
    industry?: boolean
    companySize?: boolean
    dataRegion?: boolean
    isolationConfig?: boolean
    settings?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    planChangeRequests?: boolean | Tenant$planChangeRequestsArgs<ExtArgs>
    _count?: boolean | TenantCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tenant"]>

  export type TenantSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    slug?: boolean
    plan?: boolean
    status?: boolean
    trialEndsAt?: boolean
    logoUrl?: boolean
    website?: boolean
    industry?: boolean
    companySize?: boolean
    dataRegion?: boolean
    isolationConfig?: boolean
    settings?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["tenant"]>

  export type TenantSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    slug?: boolean
    plan?: boolean
    status?: boolean
    trialEndsAt?: boolean
    logoUrl?: boolean
    website?: boolean
    industry?: boolean
    companySize?: boolean
    dataRegion?: boolean
    isolationConfig?: boolean
    settings?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["tenant"]>

  export type TenantSelectScalar = {
    id?: boolean
    name?: boolean
    slug?: boolean
    plan?: boolean
    status?: boolean
    trialEndsAt?: boolean
    logoUrl?: boolean
    website?: boolean
    industry?: boolean
    companySize?: boolean
    dataRegion?: boolean
    isolationConfig?: boolean
    settings?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type TenantOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "slug" | "plan" | "status" | "trialEndsAt" | "logoUrl" | "website" | "industry" | "companySize" | "dataRegion" | "isolationConfig" | "settings" | "createdAt" | "updatedAt", ExtArgs["result"]["tenant"]>
  export type TenantInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    planChangeRequests?: boolean | Tenant$planChangeRequestsArgs<ExtArgs>
    _count?: boolean | TenantCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type TenantIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type TenantIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $TenantPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Tenant"
    objects: {
      planChangeRequests: Prisma.$PlanChangeRequestPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      slug: string
      plan: $Enums.TenantPlan
      status: $Enums.TenantStatus
      trialEndsAt: Date | null
      logoUrl: string | null
      website: string | null
      industry: string | null
      companySize: string | null
      dataRegion: string
      isolationConfig: Prisma.JsonValue
      settings: Prisma.JsonValue
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["tenant"]>
    composites: {}
  }

  type TenantGetPayload<S extends boolean | null | undefined | TenantDefaultArgs> = $Result.GetResult<Prisma.$TenantPayload, S>

  type TenantCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TenantFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TenantCountAggregateInputType | true
    }

  export interface TenantDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Tenant'], meta: { name: 'Tenant' } }
    /**
     * Find zero or one Tenant that matches the filter.
     * @param {TenantFindUniqueArgs} args - Arguments to find a Tenant
     * @example
     * // Get one Tenant
     * const tenant = await prisma.tenant.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TenantFindUniqueArgs>(args: SelectSubset<T, TenantFindUniqueArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Tenant that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TenantFindUniqueOrThrowArgs} args - Arguments to find a Tenant
     * @example
     * // Get one Tenant
     * const tenant = await prisma.tenant.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TenantFindUniqueOrThrowArgs>(args: SelectSubset<T, TenantFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tenant that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantFindFirstArgs} args - Arguments to find a Tenant
     * @example
     * // Get one Tenant
     * const tenant = await prisma.tenant.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TenantFindFirstArgs>(args?: SelectSubset<T, TenantFindFirstArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tenant that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantFindFirstOrThrowArgs} args - Arguments to find a Tenant
     * @example
     * // Get one Tenant
     * const tenant = await prisma.tenant.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TenantFindFirstOrThrowArgs>(args?: SelectSubset<T, TenantFindFirstOrThrowArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Tenants that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tenants
     * const tenants = await prisma.tenant.findMany()
     * 
     * // Get first 10 Tenants
     * const tenants = await prisma.tenant.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tenantWithIdOnly = await prisma.tenant.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TenantFindManyArgs>(args?: SelectSubset<T, TenantFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Tenant.
     * @param {TenantCreateArgs} args - Arguments to create a Tenant.
     * @example
     * // Create one Tenant
     * const Tenant = await prisma.tenant.create({
     *   data: {
     *     // ... data to create a Tenant
     *   }
     * })
     * 
     */
    create<T extends TenantCreateArgs>(args: SelectSubset<T, TenantCreateArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Tenants.
     * @param {TenantCreateManyArgs} args - Arguments to create many Tenants.
     * @example
     * // Create many Tenants
     * const tenant = await prisma.tenant.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TenantCreateManyArgs>(args?: SelectSubset<T, TenantCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Tenants and returns the data saved in the database.
     * @param {TenantCreateManyAndReturnArgs} args - Arguments to create many Tenants.
     * @example
     * // Create many Tenants
     * const tenant = await prisma.tenant.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Tenants and only return the `id`
     * const tenantWithIdOnly = await prisma.tenant.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TenantCreateManyAndReturnArgs>(args?: SelectSubset<T, TenantCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Tenant.
     * @param {TenantDeleteArgs} args - Arguments to delete one Tenant.
     * @example
     * // Delete one Tenant
     * const Tenant = await prisma.tenant.delete({
     *   where: {
     *     // ... filter to delete one Tenant
     *   }
     * })
     * 
     */
    delete<T extends TenantDeleteArgs>(args: SelectSubset<T, TenantDeleteArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Tenant.
     * @param {TenantUpdateArgs} args - Arguments to update one Tenant.
     * @example
     * // Update one Tenant
     * const tenant = await prisma.tenant.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TenantUpdateArgs>(args: SelectSubset<T, TenantUpdateArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Tenants.
     * @param {TenantDeleteManyArgs} args - Arguments to filter Tenants to delete.
     * @example
     * // Delete a few Tenants
     * const { count } = await prisma.tenant.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TenantDeleteManyArgs>(args?: SelectSubset<T, TenantDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tenants.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tenants
     * const tenant = await prisma.tenant.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TenantUpdateManyArgs>(args: SelectSubset<T, TenantUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tenants and returns the data updated in the database.
     * @param {TenantUpdateManyAndReturnArgs} args - Arguments to update many Tenants.
     * @example
     * // Update many Tenants
     * const tenant = await prisma.tenant.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Tenants and only return the `id`
     * const tenantWithIdOnly = await prisma.tenant.updateManyAndReturn({
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
    updateManyAndReturn<T extends TenantUpdateManyAndReturnArgs>(args: SelectSubset<T, TenantUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Tenant.
     * @param {TenantUpsertArgs} args - Arguments to update or create a Tenant.
     * @example
     * // Update or create a Tenant
     * const tenant = await prisma.tenant.upsert({
     *   create: {
     *     // ... data to create a Tenant
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Tenant we want to update
     *   }
     * })
     */
    upsert<T extends TenantUpsertArgs>(args: SelectSubset<T, TenantUpsertArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Tenants.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantCountArgs} args - Arguments to filter Tenants to count.
     * @example
     * // Count the number of Tenants
     * const count = await prisma.tenant.count({
     *   where: {
     *     // ... the filter for the Tenants we want to count
     *   }
     * })
    **/
    count<T extends TenantCountArgs>(
      args?: Subset<T, TenantCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TenantCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Tenant.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends TenantAggregateArgs>(args: Subset<T, TenantAggregateArgs>): Prisma.PrismaPromise<GetTenantAggregateType<T>>

    /**
     * Group by Tenant.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantGroupByArgs} args - Group by arguments.
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
      T extends TenantGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TenantGroupByArgs['orderBy'] }
        : { orderBy?: TenantGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, TenantGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTenantGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Tenant model
   */
  readonly fields: TenantFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Tenant.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TenantClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    planChangeRequests<T extends Tenant$planChangeRequestsArgs<ExtArgs> = {}>(args?: Subset<T, Tenant$planChangeRequestsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PlanChangeRequestPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the Tenant model
   */
  interface TenantFieldRefs {
    readonly id: FieldRef<"Tenant", 'String'>
    readonly name: FieldRef<"Tenant", 'String'>
    readonly slug: FieldRef<"Tenant", 'String'>
    readonly plan: FieldRef<"Tenant", 'TenantPlan'>
    readonly status: FieldRef<"Tenant", 'TenantStatus'>
    readonly trialEndsAt: FieldRef<"Tenant", 'DateTime'>
    readonly logoUrl: FieldRef<"Tenant", 'String'>
    readonly website: FieldRef<"Tenant", 'String'>
    readonly industry: FieldRef<"Tenant", 'String'>
    readonly companySize: FieldRef<"Tenant", 'String'>
    readonly dataRegion: FieldRef<"Tenant", 'String'>
    readonly isolationConfig: FieldRef<"Tenant", 'Json'>
    readonly settings: FieldRef<"Tenant", 'Json'>
    readonly createdAt: FieldRef<"Tenant", 'DateTime'>
    readonly updatedAt: FieldRef<"Tenant", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Tenant findUnique
   */
  export type TenantFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter, which Tenant to fetch.
     */
    where: TenantWhereUniqueInput
  }

  /**
   * Tenant findUniqueOrThrow
   */
  export type TenantFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter, which Tenant to fetch.
     */
    where: TenantWhereUniqueInput
  }

  /**
   * Tenant findFirst
   */
  export type TenantFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter, which Tenant to fetch.
     */
    where?: TenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tenants to fetch.
     */
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tenants.
     */
    cursor?: TenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tenants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tenants.
     */
    distinct?: TenantScalarFieldEnum | TenantScalarFieldEnum[]
  }

  /**
   * Tenant findFirstOrThrow
   */
  export type TenantFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter, which Tenant to fetch.
     */
    where?: TenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tenants to fetch.
     */
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tenants.
     */
    cursor?: TenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tenants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tenants.
     */
    distinct?: TenantScalarFieldEnum | TenantScalarFieldEnum[]
  }

  /**
   * Tenant findMany
   */
  export type TenantFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter, which Tenants to fetch.
     */
    where?: TenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tenants to fetch.
     */
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Tenants.
     */
    cursor?: TenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tenants.
     */
    skip?: number
    distinct?: TenantScalarFieldEnum | TenantScalarFieldEnum[]
  }

  /**
   * Tenant create
   */
  export type TenantCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * The data needed to create a Tenant.
     */
    data: XOR<TenantCreateInput, TenantUncheckedCreateInput>
  }

  /**
   * Tenant createMany
   */
  export type TenantCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Tenants.
     */
    data: TenantCreateManyInput | TenantCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Tenant createManyAndReturn
   */
  export type TenantCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * The data used to create many Tenants.
     */
    data: TenantCreateManyInput | TenantCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Tenant update
   */
  export type TenantUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * The data needed to update a Tenant.
     */
    data: XOR<TenantUpdateInput, TenantUncheckedUpdateInput>
    /**
     * Choose, which Tenant to update.
     */
    where: TenantWhereUniqueInput
  }

  /**
   * Tenant updateMany
   */
  export type TenantUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Tenants.
     */
    data: XOR<TenantUpdateManyMutationInput, TenantUncheckedUpdateManyInput>
    /**
     * Filter which Tenants to update
     */
    where?: TenantWhereInput
    /**
     * Limit how many Tenants to update.
     */
    limit?: number
  }

  /**
   * Tenant updateManyAndReturn
   */
  export type TenantUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * The data used to update Tenants.
     */
    data: XOR<TenantUpdateManyMutationInput, TenantUncheckedUpdateManyInput>
    /**
     * Filter which Tenants to update
     */
    where?: TenantWhereInput
    /**
     * Limit how many Tenants to update.
     */
    limit?: number
  }

  /**
   * Tenant upsert
   */
  export type TenantUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * The filter to search for the Tenant to update in case it exists.
     */
    where: TenantWhereUniqueInput
    /**
     * In case the Tenant found by the `where` argument doesn't exist, create a new Tenant with this data.
     */
    create: XOR<TenantCreateInput, TenantUncheckedCreateInput>
    /**
     * In case the Tenant was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TenantUpdateInput, TenantUncheckedUpdateInput>
  }

  /**
   * Tenant delete
   */
  export type TenantDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter which Tenant to delete.
     */
    where: TenantWhereUniqueInput
  }

  /**
   * Tenant deleteMany
   */
  export type TenantDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Tenants to delete
     */
    where?: TenantWhereInput
    /**
     * Limit how many Tenants to delete.
     */
    limit?: number
  }

  /**
   * Tenant.planChangeRequests
   */
  export type Tenant$planChangeRequestsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlanChangeRequest
     */
    select?: PlanChangeRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlanChangeRequest
     */
    omit?: PlanChangeRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlanChangeRequestInclude<ExtArgs> | null
    where?: PlanChangeRequestWhereInput
    orderBy?: PlanChangeRequestOrderByWithRelationInput | PlanChangeRequestOrderByWithRelationInput[]
    cursor?: PlanChangeRequestWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PlanChangeRequestScalarFieldEnum | PlanChangeRequestScalarFieldEnum[]
  }

  /**
   * Tenant without action
   */
  export type TenantDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
  }


  /**
   * Model PlanChangeRequest
   */

  export type AggregatePlanChangeRequest = {
    _count: PlanChangeRequestCountAggregateOutputType | null
    _min: PlanChangeRequestMinAggregateOutputType | null
    _max: PlanChangeRequestMaxAggregateOutputType | null
  }

  export type PlanChangeRequestMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    fromPlan: $Enums.TenantPlan | null
    toPlan: $Enums.TenantPlan | null
    status: $Enums.PlanChangeStatus | null
    reason: string | null
    requestedByUserId: string | null
    requestedAt: Date | null
    reviewedByUserId: string | null
    reviewedAt: Date | null
    decisionNote: string | null
  }

  export type PlanChangeRequestMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    fromPlan: $Enums.TenantPlan | null
    toPlan: $Enums.TenantPlan | null
    status: $Enums.PlanChangeStatus | null
    reason: string | null
    requestedByUserId: string | null
    requestedAt: Date | null
    reviewedByUserId: string | null
    reviewedAt: Date | null
    decisionNote: string | null
  }

  export type PlanChangeRequestCountAggregateOutputType = {
    id: number
    tenantId: number
    fromPlan: number
    toPlan: number
    status: number
    reason: number
    requestedByUserId: number
    requestedAt: number
    reviewedByUserId: number
    reviewedAt: number
    decisionNote: number
    _all: number
  }


  export type PlanChangeRequestMinAggregateInputType = {
    id?: true
    tenantId?: true
    fromPlan?: true
    toPlan?: true
    status?: true
    reason?: true
    requestedByUserId?: true
    requestedAt?: true
    reviewedByUserId?: true
    reviewedAt?: true
    decisionNote?: true
  }

  export type PlanChangeRequestMaxAggregateInputType = {
    id?: true
    tenantId?: true
    fromPlan?: true
    toPlan?: true
    status?: true
    reason?: true
    requestedByUserId?: true
    requestedAt?: true
    reviewedByUserId?: true
    reviewedAt?: true
    decisionNote?: true
  }

  export type PlanChangeRequestCountAggregateInputType = {
    id?: true
    tenantId?: true
    fromPlan?: true
    toPlan?: true
    status?: true
    reason?: true
    requestedByUserId?: true
    requestedAt?: true
    reviewedByUserId?: true
    reviewedAt?: true
    decisionNote?: true
    _all?: true
  }

  export type PlanChangeRequestAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PlanChangeRequest to aggregate.
     */
    where?: PlanChangeRequestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PlanChangeRequests to fetch.
     */
    orderBy?: PlanChangeRequestOrderByWithRelationInput | PlanChangeRequestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PlanChangeRequestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PlanChangeRequests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PlanChangeRequests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PlanChangeRequests
    **/
    _count?: true | PlanChangeRequestCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PlanChangeRequestMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PlanChangeRequestMaxAggregateInputType
  }

  export type GetPlanChangeRequestAggregateType<T extends PlanChangeRequestAggregateArgs> = {
        [P in keyof T & keyof AggregatePlanChangeRequest]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePlanChangeRequest[P]>
      : GetScalarType<T[P], AggregatePlanChangeRequest[P]>
  }




  export type PlanChangeRequestGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PlanChangeRequestWhereInput
    orderBy?: PlanChangeRequestOrderByWithAggregationInput | PlanChangeRequestOrderByWithAggregationInput[]
    by: PlanChangeRequestScalarFieldEnum[] | PlanChangeRequestScalarFieldEnum
    having?: PlanChangeRequestScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PlanChangeRequestCountAggregateInputType | true
    _min?: PlanChangeRequestMinAggregateInputType
    _max?: PlanChangeRequestMaxAggregateInputType
  }

  export type PlanChangeRequestGroupByOutputType = {
    id: string
    tenantId: string
    fromPlan: $Enums.TenantPlan
    toPlan: $Enums.TenantPlan
    status: $Enums.PlanChangeStatus
    reason: string | null
    requestedByUserId: string
    requestedAt: Date
    reviewedByUserId: string | null
    reviewedAt: Date | null
    decisionNote: string | null
    _count: PlanChangeRequestCountAggregateOutputType | null
    _min: PlanChangeRequestMinAggregateOutputType | null
    _max: PlanChangeRequestMaxAggregateOutputType | null
  }

  type GetPlanChangeRequestGroupByPayload<T extends PlanChangeRequestGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PlanChangeRequestGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PlanChangeRequestGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PlanChangeRequestGroupByOutputType[P]>
            : GetScalarType<T[P], PlanChangeRequestGroupByOutputType[P]>
        }
      >
    >


  export type PlanChangeRequestSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    fromPlan?: boolean
    toPlan?: boolean
    status?: boolean
    reason?: boolean
    requestedByUserId?: boolean
    requestedAt?: boolean
    reviewedByUserId?: boolean
    reviewedAt?: boolean
    decisionNote?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["planChangeRequest"]>

  export type PlanChangeRequestSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    fromPlan?: boolean
    toPlan?: boolean
    status?: boolean
    reason?: boolean
    requestedByUserId?: boolean
    requestedAt?: boolean
    reviewedByUserId?: boolean
    reviewedAt?: boolean
    decisionNote?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["planChangeRequest"]>

  export type PlanChangeRequestSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    fromPlan?: boolean
    toPlan?: boolean
    status?: boolean
    reason?: boolean
    requestedByUserId?: boolean
    requestedAt?: boolean
    reviewedByUserId?: boolean
    reviewedAt?: boolean
    decisionNote?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["planChangeRequest"]>

  export type PlanChangeRequestSelectScalar = {
    id?: boolean
    tenantId?: boolean
    fromPlan?: boolean
    toPlan?: boolean
    status?: boolean
    reason?: boolean
    requestedByUserId?: boolean
    requestedAt?: boolean
    reviewedByUserId?: boolean
    reviewedAt?: boolean
    decisionNote?: boolean
  }

  export type PlanChangeRequestOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "fromPlan" | "toPlan" | "status" | "reason" | "requestedByUserId" | "requestedAt" | "reviewedByUserId" | "reviewedAt" | "decisionNote", ExtArgs["result"]["planChangeRequest"]>
  export type PlanChangeRequestInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }
  export type PlanChangeRequestIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }
  export type PlanChangeRequestIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }

  export type $PlanChangeRequestPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PlanChangeRequest"
    objects: {
      tenant: Prisma.$TenantPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      fromPlan: $Enums.TenantPlan
      toPlan: $Enums.TenantPlan
      status: $Enums.PlanChangeStatus
      reason: string | null
      requestedByUserId: string
      requestedAt: Date
      reviewedByUserId: string | null
      reviewedAt: Date | null
      decisionNote: string | null
    }, ExtArgs["result"]["planChangeRequest"]>
    composites: {}
  }

  type PlanChangeRequestGetPayload<S extends boolean | null | undefined | PlanChangeRequestDefaultArgs> = $Result.GetResult<Prisma.$PlanChangeRequestPayload, S>

  type PlanChangeRequestCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PlanChangeRequestFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PlanChangeRequestCountAggregateInputType | true
    }

  export interface PlanChangeRequestDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PlanChangeRequest'], meta: { name: 'PlanChangeRequest' } }
    /**
     * Find zero or one PlanChangeRequest that matches the filter.
     * @param {PlanChangeRequestFindUniqueArgs} args - Arguments to find a PlanChangeRequest
     * @example
     * // Get one PlanChangeRequest
     * const planChangeRequest = await prisma.planChangeRequest.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PlanChangeRequestFindUniqueArgs>(args: SelectSubset<T, PlanChangeRequestFindUniqueArgs<ExtArgs>>): Prisma__PlanChangeRequestClient<$Result.GetResult<Prisma.$PlanChangeRequestPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one PlanChangeRequest that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PlanChangeRequestFindUniqueOrThrowArgs} args - Arguments to find a PlanChangeRequest
     * @example
     * // Get one PlanChangeRequest
     * const planChangeRequest = await prisma.planChangeRequest.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PlanChangeRequestFindUniqueOrThrowArgs>(args: SelectSubset<T, PlanChangeRequestFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PlanChangeRequestClient<$Result.GetResult<Prisma.$PlanChangeRequestPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PlanChangeRequest that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlanChangeRequestFindFirstArgs} args - Arguments to find a PlanChangeRequest
     * @example
     * // Get one PlanChangeRequest
     * const planChangeRequest = await prisma.planChangeRequest.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PlanChangeRequestFindFirstArgs>(args?: SelectSubset<T, PlanChangeRequestFindFirstArgs<ExtArgs>>): Prisma__PlanChangeRequestClient<$Result.GetResult<Prisma.$PlanChangeRequestPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PlanChangeRequest that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlanChangeRequestFindFirstOrThrowArgs} args - Arguments to find a PlanChangeRequest
     * @example
     * // Get one PlanChangeRequest
     * const planChangeRequest = await prisma.planChangeRequest.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PlanChangeRequestFindFirstOrThrowArgs>(args?: SelectSubset<T, PlanChangeRequestFindFirstOrThrowArgs<ExtArgs>>): Prisma__PlanChangeRequestClient<$Result.GetResult<Prisma.$PlanChangeRequestPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more PlanChangeRequests that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlanChangeRequestFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PlanChangeRequests
     * const planChangeRequests = await prisma.planChangeRequest.findMany()
     * 
     * // Get first 10 PlanChangeRequests
     * const planChangeRequests = await prisma.planChangeRequest.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const planChangeRequestWithIdOnly = await prisma.planChangeRequest.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PlanChangeRequestFindManyArgs>(args?: SelectSubset<T, PlanChangeRequestFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PlanChangeRequestPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a PlanChangeRequest.
     * @param {PlanChangeRequestCreateArgs} args - Arguments to create a PlanChangeRequest.
     * @example
     * // Create one PlanChangeRequest
     * const PlanChangeRequest = await prisma.planChangeRequest.create({
     *   data: {
     *     // ... data to create a PlanChangeRequest
     *   }
     * })
     * 
     */
    create<T extends PlanChangeRequestCreateArgs>(args: SelectSubset<T, PlanChangeRequestCreateArgs<ExtArgs>>): Prisma__PlanChangeRequestClient<$Result.GetResult<Prisma.$PlanChangeRequestPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many PlanChangeRequests.
     * @param {PlanChangeRequestCreateManyArgs} args - Arguments to create many PlanChangeRequests.
     * @example
     * // Create many PlanChangeRequests
     * const planChangeRequest = await prisma.planChangeRequest.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PlanChangeRequestCreateManyArgs>(args?: SelectSubset<T, PlanChangeRequestCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PlanChangeRequests and returns the data saved in the database.
     * @param {PlanChangeRequestCreateManyAndReturnArgs} args - Arguments to create many PlanChangeRequests.
     * @example
     * // Create many PlanChangeRequests
     * const planChangeRequest = await prisma.planChangeRequest.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PlanChangeRequests and only return the `id`
     * const planChangeRequestWithIdOnly = await prisma.planChangeRequest.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PlanChangeRequestCreateManyAndReturnArgs>(args?: SelectSubset<T, PlanChangeRequestCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PlanChangeRequestPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a PlanChangeRequest.
     * @param {PlanChangeRequestDeleteArgs} args - Arguments to delete one PlanChangeRequest.
     * @example
     * // Delete one PlanChangeRequest
     * const PlanChangeRequest = await prisma.planChangeRequest.delete({
     *   where: {
     *     // ... filter to delete one PlanChangeRequest
     *   }
     * })
     * 
     */
    delete<T extends PlanChangeRequestDeleteArgs>(args: SelectSubset<T, PlanChangeRequestDeleteArgs<ExtArgs>>): Prisma__PlanChangeRequestClient<$Result.GetResult<Prisma.$PlanChangeRequestPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one PlanChangeRequest.
     * @param {PlanChangeRequestUpdateArgs} args - Arguments to update one PlanChangeRequest.
     * @example
     * // Update one PlanChangeRequest
     * const planChangeRequest = await prisma.planChangeRequest.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PlanChangeRequestUpdateArgs>(args: SelectSubset<T, PlanChangeRequestUpdateArgs<ExtArgs>>): Prisma__PlanChangeRequestClient<$Result.GetResult<Prisma.$PlanChangeRequestPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more PlanChangeRequests.
     * @param {PlanChangeRequestDeleteManyArgs} args - Arguments to filter PlanChangeRequests to delete.
     * @example
     * // Delete a few PlanChangeRequests
     * const { count } = await prisma.planChangeRequest.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PlanChangeRequestDeleteManyArgs>(args?: SelectSubset<T, PlanChangeRequestDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PlanChangeRequests.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlanChangeRequestUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PlanChangeRequests
     * const planChangeRequest = await prisma.planChangeRequest.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PlanChangeRequestUpdateManyArgs>(args: SelectSubset<T, PlanChangeRequestUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PlanChangeRequests and returns the data updated in the database.
     * @param {PlanChangeRequestUpdateManyAndReturnArgs} args - Arguments to update many PlanChangeRequests.
     * @example
     * // Update many PlanChangeRequests
     * const planChangeRequest = await prisma.planChangeRequest.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more PlanChangeRequests and only return the `id`
     * const planChangeRequestWithIdOnly = await prisma.planChangeRequest.updateManyAndReturn({
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
    updateManyAndReturn<T extends PlanChangeRequestUpdateManyAndReturnArgs>(args: SelectSubset<T, PlanChangeRequestUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PlanChangeRequestPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one PlanChangeRequest.
     * @param {PlanChangeRequestUpsertArgs} args - Arguments to update or create a PlanChangeRequest.
     * @example
     * // Update or create a PlanChangeRequest
     * const planChangeRequest = await prisma.planChangeRequest.upsert({
     *   create: {
     *     // ... data to create a PlanChangeRequest
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PlanChangeRequest we want to update
     *   }
     * })
     */
    upsert<T extends PlanChangeRequestUpsertArgs>(args: SelectSubset<T, PlanChangeRequestUpsertArgs<ExtArgs>>): Prisma__PlanChangeRequestClient<$Result.GetResult<Prisma.$PlanChangeRequestPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of PlanChangeRequests.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlanChangeRequestCountArgs} args - Arguments to filter PlanChangeRequests to count.
     * @example
     * // Count the number of PlanChangeRequests
     * const count = await prisma.planChangeRequest.count({
     *   where: {
     *     // ... the filter for the PlanChangeRequests we want to count
     *   }
     * })
    **/
    count<T extends PlanChangeRequestCountArgs>(
      args?: Subset<T, PlanChangeRequestCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PlanChangeRequestCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PlanChangeRequest.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlanChangeRequestAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends PlanChangeRequestAggregateArgs>(args: Subset<T, PlanChangeRequestAggregateArgs>): Prisma.PrismaPromise<GetPlanChangeRequestAggregateType<T>>

    /**
     * Group by PlanChangeRequest.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlanChangeRequestGroupByArgs} args - Group by arguments.
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
      T extends PlanChangeRequestGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PlanChangeRequestGroupByArgs['orderBy'] }
        : { orderBy?: PlanChangeRequestGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, PlanChangeRequestGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPlanChangeRequestGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PlanChangeRequest model
   */
  readonly fields: PlanChangeRequestFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PlanChangeRequest.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PlanChangeRequestClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tenant<T extends TenantDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TenantDefaultArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the PlanChangeRequest model
   */
  interface PlanChangeRequestFieldRefs {
    readonly id: FieldRef<"PlanChangeRequest", 'String'>
    readonly tenantId: FieldRef<"PlanChangeRequest", 'String'>
    readonly fromPlan: FieldRef<"PlanChangeRequest", 'TenantPlan'>
    readonly toPlan: FieldRef<"PlanChangeRequest", 'TenantPlan'>
    readonly status: FieldRef<"PlanChangeRequest", 'PlanChangeStatus'>
    readonly reason: FieldRef<"PlanChangeRequest", 'String'>
    readonly requestedByUserId: FieldRef<"PlanChangeRequest", 'String'>
    readonly requestedAt: FieldRef<"PlanChangeRequest", 'DateTime'>
    readonly reviewedByUserId: FieldRef<"PlanChangeRequest", 'String'>
    readonly reviewedAt: FieldRef<"PlanChangeRequest", 'DateTime'>
    readonly decisionNote: FieldRef<"PlanChangeRequest", 'String'>
  }
    

  // Custom InputTypes
  /**
   * PlanChangeRequest findUnique
   */
  export type PlanChangeRequestFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlanChangeRequest
     */
    select?: PlanChangeRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlanChangeRequest
     */
    omit?: PlanChangeRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlanChangeRequestInclude<ExtArgs> | null
    /**
     * Filter, which PlanChangeRequest to fetch.
     */
    where: PlanChangeRequestWhereUniqueInput
  }

  /**
   * PlanChangeRequest findUniqueOrThrow
   */
  export type PlanChangeRequestFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlanChangeRequest
     */
    select?: PlanChangeRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlanChangeRequest
     */
    omit?: PlanChangeRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlanChangeRequestInclude<ExtArgs> | null
    /**
     * Filter, which PlanChangeRequest to fetch.
     */
    where: PlanChangeRequestWhereUniqueInput
  }

  /**
   * PlanChangeRequest findFirst
   */
  export type PlanChangeRequestFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlanChangeRequest
     */
    select?: PlanChangeRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlanChangeRequest
     */
    omit?: PlanChangeRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlanChangeRequestInclude<ExtArgs> | null
    /**
     * Filter, which PlanChangeRequest to fetch.
     */
    where?: PlanChangeRequestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PlanChangeRequests to fetch.
     */
    orderBy?: PlanChangeRequestOrderByWithRelationInput | PlanChangeRequestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PlanChangeRequests.
     */
    cursor?: PlanChangeRequestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PlanChangeRequests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PlanChangeRequests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PlanChangeRequests.
     */
    distinct?: PlanChangeRequestScalarFieldEnum | PlanChangeRequestScalarFieldEnum[]
  }

  /**
   * PlanChangeRequest findFirstOrThrow
   */
  export type PlanChangeRequestFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlanChangeRequest
     */
    select?: PlanChangeRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlanChangeRequest
     */
    omit?: PlanChangeRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlanChangeRequestInclude<ExtArgs> | null
    /**
     * Filter, which PlanChangeRequest to fetch.
     */
    where?: PlanChangeRequestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PlanChangeRequests to fetch.
     */
    orderBy?: PlanChangeRequestOrderByWithRelationInput | PlanChangeRequestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PlanChangeRequests.
     */
    cursor?: PlanChangeRequestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PlanChangeRequests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PlanChangeRequests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PlanChangeRequests.
     */
    distinct?: PlanChangeRequestScalarFieldEnum | PlanChangeRequestScalarFieldEnum[]
  }

  /**
   * PlanChangeRequest findMany
   */
  export type PlanChangeRequestFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlanChangeRequest
     */
    select?: PlanChangeRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlanChangeRequest
     */
    omit?: PlanChangeRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlanChangeRequestInclude<ExtArgs> | null
    /**
     * Filter, which PlanChangeRequests to fetch.
     */
    where?: PlanChangeRequestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PlanChangeRequests to fetch.
     */
    orderBy?: PlanChangeRequestOrderByWithRelationInput | PlanChangeRequestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PlanChangeRequests.
     */
    cursor?: PlanChangeRequestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PlanChangeRequests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PlanChangeRequests.
     */
    skip?: number
    distinct?: PlanChangeRequestScalarFieldEnum | PlanChangeRequestScalarFieldEnum[]
  }

  /**
   * PlanChangeRequest create
   */
  export type PlanChangeRequestCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlanChangeRequest
     */
    select?: PlanChangeRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlanChangeRequest
     */
    omit?: PlanChangeRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlanChangeRequestInclude<ExtArgs> | null
    /**
     * The data needed to create a PlanChangeRequest.
     */
    data: XOR<PlanChangeRequestCreateInput, PlanChangeRequestUncheckedCreateInput>
  }

  /**
   * PlanChangeRequest createMany
   */
  export type PlanChangeRequestCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PlanChangeRequests.
     */
    data: PlanChangeRequestCreateManyInput | PlanChangeRequestCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PlanChangeRequest createManyAndReturn
   */
  export type PlanChangeRequestCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlanChangeRequest
     */
    select?: PlanChangeRequestSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PlanChangeRequest
     */
    omit?: PlanChangeRequestOmit<ExtArgs> | null
    /**
     * The data used to create many PlanChangeRequests.
     */
    data: PlanChangeRequestCreateManyInput | PlanChangeRequestCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlanChangeRequestIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * PlanChangeRequest update
   */
  export type PlanChangeRequestUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlanChangeRequest
     */
    select?: PlanChangeRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlanChangeRequest
     */
    omit?: PlanChangeRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlanChangeRequestInclude<ExtArgs> | null
    /**
     * The data needed to update a PlanChangeRequest.
     */
    data: XOR<PlanChangeRequestUpdateInput, PlanChangeRequestUncheckedUpdateInput>
    /**
     * Choose, which PlanChangeRequest to update.
     */
    where: PlanChangeRequestWhereUniqueInput
  }

  /**
   * PlanChangeRequest updateMany
   */
  export type PlanChangeRequestUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PlanChangeRequests.
     */
    data: XOR<PlanChangeRequestUpdateManyMutationInput, PlanChangeRequestUncheckedUpdateManyInput>
    /**
     * Filter which PlanChangeRequests to update
     */
    where?: PlanChangeRequestWhereInput
    /**
     * Limit how many PlanChangeRequests to update.
     */
    limit?: number
  }

  /**
   * PlanChangeRequest updateManyAndReturn
   */
  export type PlanChangeRequestUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlanChangeRequest
     */
    select?: PlanChangeRequestSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PlanChangeRequest
     */
    omit?: PlanChangeRequestOmit<ExtArgs> | null
    /**
     * The data used to update PlanChangeRequests.
     */
    data: XOR<PlanChangeRequestUpdateManyMutationInput, PlanChangeRequestUncheckedUpdateManyInput>
    /**
     * Filter which PlanChangeRequests to update
     */
    where?: PlanChangeRequestWhereInput
    /**
     * Limit how many PlanChangeRequests to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlanChangeRequestIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * PlanChangeRequest upsert
   */
  export type PlanChangeRequestUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlanChangeRequest
     */
    select?: PlanChangeRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlanChangeRequest
     */
    omit?: PlanChangeRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlanChangeRequestInclude<ExtArgs> | null
    /**
     * The filter to search for the PlanChangeRequest to update in case it exists.
     */
    where: PlanChangeRequestWhereUniqueInput
    /**
     * In case the PlanChangeRequest found by the `where` argument doesn't exist, create a new PlanChangeRequest with this data.
     */
    create: XOR<PlanChangeRequestCreateInput, PlanChangeRequestUncheckedCreateInput>
    /**
     * In case the PlanChangeRequest was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PlanChangeRequestUpdateInput, PlanChangeRequestUncheckedUpdateInput>
  }

  /**
   * PlanChangeRequest delete
   */
  export type PlanChangeRequestDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlanChangeRequest
     */
    select?: PlanChangeRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlanChangeRequest
     */
    omit?: PlanChangeRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlanChangeRequestInclude<ExtArgs> | null
    /**
     * Filter which PlanChangeRequest to delete.
     */
    where: PlanChangeRequestWhereUniqueInput
  }

  /**
   * PlanChangeRequest deleteMany
   */
  export type PlanChangeRequestDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PlanChangeRequests to delete
     */
    where?: PlanChangeRequestWhereInput
    /**
     * Limit how many PlanChangeRequests to delete.
     */
    limit?: number
  }

  /**
   * PlanChangeRequest without action
   */
  export type PlanChangeRequestDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlanChangeRequest
     */
    select?: PlanChangeRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlanChangeRequest
     */
    omit?: PlanChangeRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlanChangeRequestInclude<ExtArgs> | null
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


  export const TenantScalarFieldEnum: {
    id: 'id',
    name: 'name',
    slug: 'slug',
    plan: 'plan',
    status: 'status',
    trialEndsAt: 'trialEndsAt',
    logoUrl: 'logoUrl',
    website: 'website',
    industry: 'industry',
    companySize: 'companySize',
    dataRegion: 'dataRegion',
    isolationConfig: 'isolationConfig',
    settings: 'settings',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type TenantScalarFieldEnum = (typeof TenantScalarFieldEnum)[keyof typeof TenantScalarFieldEnum]


  export const PlanChangeRequestScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    fromPlan: 'fromPlan',
    toPlan: 'toPlan',
    status: 'status',
    reason: 'reason',
    requestedByUserId: 'requestedByUserId',
    requestedAt: 'requestedAt',
    reviewedByUserId: 'reviewedByUserId',
    reviewedAt: 'reviewedAt',
    decisionNote: 'decisionNote'
  };

  export type PlanChangeRequestScalarFieldEnum = (typeof PlanChangeRequestScalarFieldEnum)[keyof typeof PlanChangeRequestScalarFieldEnum]


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
   * Reference to a field of type 'TenantPlan'
   */
  export type EnumTenantPlanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TenantPlan'>
    


  /**
   * Reference to a field of type 'TenantPlan[]'
   */
  export type ListEnumTenantPlanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TenantPlan[]'>
    


  /**
   * Reference to a field of type 'TenantStatus'
   */
  export type EnumTenantStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TenantStatus'>
    


  /**
   * Reference to a field of type 'TenantStatus[]'
   */
  export type ListEnumTenantStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TenantStatus[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'PlanChangeStatus'
   */
  export type EnumPlanChangeStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PlanChangeStatus'>
    


  /**
   * Reference to a field of type 'PlanChangeStatus[]'
   */
  export type ListEnumPlanChangeStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PlanChangeStatus[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    
  /**
   * Deep Input Types
   */


  export type TenantWhereInput = {
    AND?: TenantWhereInput | TenantWhereInput[]
    OR?: TenantWhereInput[]
    NOT?: TenantWhereInput | TenantWhereInput[]
    id?: StringFilter<"Tenant"> | string
    name?: StringFilter<"Tenant"> | string
    slug?: StringFilter<"Tenant"> | string
    plan?: EnumTenantPlanFilter<"Tenant"> | $Enums.TenantPlan
    status?: EnumTenantStatusFilter<"Tenant"> | $Enums.TenantStatus
    trialEndsAt?: DateTimeNullableFilter<"Tenant"> | Date | string | null
    logoUrl?: StringNullableFilter<"Tenant"> | string | null
    website?: StringNullableFilter<"Tenant"> | string | null
    industry?: StringNullableFilter<"Tenant"> | string | null
    companySize?: StringNullableFilter<"Tenant"> | string | null
    dataRegion?: StringFilter<"Tenant"> | string
    isolationConfig?: JsonFilter<"Tenant">
    settings?: JsonFilter<"Tenant">
    createdAt?: DateTimeFilter<"Tenant"> | Date | string
    updatedAt?: DateTimeFilter<"Tenant"> | Date | string
    planChangeRequests?: PlanChangeRequestListRelationFilter
  }

  export type TenantOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    plan?: SortOrder
    status?: SortOrder
    trialEndsAt?: SortOrderInput | SortOrder
    logoUrl?: SortOrderInput | SortOrder
    website?: SortOrderInput | SortOrder
    industry?: SortOrderInput | SortOrder
    companySize?: SortOrderInput | SortOrder
    dataRegion?: SortOrder
    isolationConfig?: SortOrder
    settings?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    planChangeRequests?: PlanChangeRequestOrderByRelationAggregateInput
  }

  export type TenantWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    slug?: string
    AND?: TenantWhereInput | TenantWhereInput[]
    OR?: TenantWhereInput[]
    NOT?: TenantWhereInput | TenantWhereInput[]
    name?: StringFilter<"Tenant"> | string
    plan?: EnumTenantPlanFilter<"Tenant"> | $Enums.TenantPlan
    status?: EnumTenantStatusFilter<"Tenant"> | $Enums.TenantStatus
    trialEndsAt?: DateTimeNullableFilter<"Tenant"> | Date | string | null
    logoUrl?: StringNullableFilter<"Tenant"> | string | null
    website?: StringNullableFilter<"Tenant"> | string | null
    industry?: StringNullableFilter<"Tenant"> | string | null
    companySize?: StringNullableFilter<"Tenant"> | string | null
    dataRegion?: StringFilter<"Tenant"> | string
    isolationConfig?: JsonFilter<"Tenant">
    settings?: JsonFilter<"Tenant">
    createdAt?: DateTimeFilter<"Tenant"> | Date | string
    updatedAt?: DateTimeFilter<"Tenant"> | Date | string
    planChangeRequests?: PlanChangeRequestListRelationFilter
  }, "id" | "slug">

  export type TenantOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    plan?: SortOrder
    status?: SortOrder
    trialEndsAt?: SortOrderInput | SortOrder
    logoUrl?: SortOrderInput | SortOrder
    website?: SortOrderInput | SortOrder
    industry?: SortOrderInput | SortOrder
    companySize?: SortOrderInput | SortOrder
    dataRegion?: SortOrder
    isolationConfig?: SortOrder
    settings?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: TenantCountOrderByAggregateInput
    _max?: TenantMaxOrderByAggregateInput
    _min?: TenantMinOrderByAggregateInput
  }

  export type TenantScalarWhereWithAggregatesInput = {
    AND?: TenantScalarWhereWithAggregatesInput | TenantScalarWhereWithAggregatesInput[]
    OR?: TenantScalarWhereWithAggregatesInput[]
    NOT?: TenantScalarWhereWithAggregatesInput | TenantScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Tenant"> | string
    name?: StringWithAggregatesFilter<"Tenant"> | string
    slug?: StringWithAggregatesFilter<"Tenant"> | string
    plan?: EnumTenantPlanWithAggregatesFilter<"Tenant"> | $Enums.TenantPlan
    status?: EnumTenantStatusWithAggregatesFilter<"Tenant"> | $Enums.TenantStatus
    trialEndsAt?: DateTimeNullableWithAggregatesFilter<"Tenant"> | Date | string | null
    logoUrl?: StringNullableWithAggregatesFilter<"Tenant"> | string | null
    website?: StringNullableWithAggregatesFilter<"Tenant"> | string | null
    industry?: StringNullableWithAggregatesFilter<"Tenant"> | string | null
    companySize?: StringNullableWithAggregatesFilter<"Tenant"> | string | null
    dataRegion?: StringWithAggregatesFilter<"Tenant"> | string
    isolationConfig?: JsonWithAggregatesFilter<"Tenant">
    settings?: JsonWithAggregatesFilter<"Tenant">
    createdAt?: DateTimeWithAggregatesFilter<"Tenant"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Tenant"> | Date | string
  }

  export type PlanChangeRequestWhereInput = {
    AND?: PlanChangeRequestWhereInput | PlanChangeRequestWhereInput[]
    OR?: PlanChangeRequestWhereInput[]
    NOT?: PlanChangeRequestWhereInput | PlanChangeRequestWhereInput[]
    id?: StringFilter<"PlanChangeRequest"> | string
    tenantId?: StringFilter<"PlanChangeRequest"> | string
    fromPlan?: EnumTenantPlanFilter<"PlanChangeRequest"> | $Enums.TenantPlan
    toPlan?: EnumTenantPlanFilter<"PlanChangeRequest"> | $Enums.TenantPlan
    status?: EnumPlanChangeStatusFilter<"PlanChangeRequest"> | $Enums.PlanChangeStatus
    reason?: StringNullableFilter<"PlanChangeRequest"> | string | null
    requestedByUserId?: StringFilter<"PlanChangeRequest"> | string
    requestedAt?: DateTimeFilter<"PlanChangeRequest"> | Date | string
    reviewedByUserId?: StringNullableFilter<"PlanChangeRequest"> | string | null
    reviewedAt?: DateTimeNullableFilter<"PlanChangeRequest"> | Date | string | null
    decisionNote?: StringNullableFilter<"PlanChangeRequest"> | string | null
    tenant?: XOR<TenantScalarRelationFilter, TenantWhereInput>
  }

  export type PlanChangeRequestOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    fromPlan?: SortOrder
    toPlan?: SortOrder
    status?: SortOrder
    reason?: SortOrderInput | SortOrder
    requestedByUserId?: SortOrder
    requestedAt?: SortOrder
    reviewedByUserId?: SortOrderInput | SortOrder
    reviewedAt?: SortOrderInput | SortOrder
    decisionNote?: SortOrderInput | SortOrder
    tenant?: TenantOrderByWithRelationInput
  }

  export type PlanChangeRequestWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: PlanChangeRequestWhereInput | PlanChangeRequestWhereInput[]
    OR?: PlanChangeRequestWhereInput[]
    NOT?: PlanChangeRequestWhereInput | PlanChangeRequestWhereInput[]
    tenantId?: StringFilter<"PlanChangeRequest"> | string
    fromPlan?: EnumTenantPlanFilter<"PlanChangeRequest"> | $Enums.TenantPlan
    toPlan?: EnumTenantPlanFilter<"PlanChangeRequest"> | $Enums.TenantPlan
    status?: EnumPlanChangeStatusFilter<"PlanChangeRequest"> | $Enums.PlanChangeStatus
    reason?: StringNullableFilter<"PlanChangeRequest"> | string | null
    requestedByUserId?: StringFilter<"PlanChangeRequest"> | string
    requestedAt?: DateTimeFilter<"PlanChangeRequest"> | Date | string
    reviewedByUserId?: StringNullableFilter<"PlanChangeRequest"> | string | null
    reviewedAt?: DateTimeNullableFilter<"PlanChangeRequest"> | Date | string | null
    decisionNote?: StringNullableFilter<"PlanChangeRequest"> | string | null
    tenant?: XOR<TenantScalarRelationFilter, TenantWhereInput>
  }, "id">

  export type PlanChangeRequestOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    fromPlan?: SortOrder
    toPlan?: SortOrder
    status?: SortOrder
    reason?: SortOrderInput | SortOrder
    requestedByUserId?: SortOrder
    requestedAt?: SortOrder
    reviewedByUserId?: SortOrderInput | SortOrder
    reviewedAt?: SortOrderInput | SortOrder
    decisionNote?: SortOrderInput | SortOrder
    _count?: PlanChangeRequestCountOrderByAggregateInput
    _max?: PlanChangeRequestMaxOrderByAggregateInput
    _min?: PlanChangeRequestMinOrderByAggregateInput
  }

  export type PlanChangeRequestScalarWhereWithAggregatesInput = {
    AND?: PlanChangeRequestScalarWhereWithAggregatesInput | PlanChangeRequestScalarWhereWithAggregatesInput[]
    OR?: PlanChangeRequestScalarWhereWithAggregatesInput[]
    NOT?: PlanChangeRequestScalarWhereWithAggregatesInput | PlanChangeRequestScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"PlanChangeRequest"> | string
    tenantId?: StringWithAggregatesFilter<"PlanChangeRequest"> | string
    fromPlan?: EnumTenantPlanWithAggregatesFilter<"PlanChangeRequest"> | $Enums.TenantPlan
    toPlan?: EnumTenantPlanWithAggregatesFilter<"PlanChangeRequest"> | $Enums.TenantPlan
    status?: EnumPlanChangeStatusWithAggregatesFilter<"PlanChangeRequest"> | $Enums.PlanChangeStatus
    reason?: StringNullableWithAggregatesFilter<"PlanChangeRequest"> | string | null
    requestedByUserId?: StringWithAggregatesFilter<"PlanChangeRequest"> | string
    requestedAt?: DateTimeWithAggregatesFilter<"PlanChangeRequest"> | Date | string
    reviewedByUserId?: StringNullableWithAggregatesFilter<"PlanChangeRequest"> | string | null
    reviewedAt?: DateTimeNullableWithAggregatesFilter<"PlanChangeRequest"> | Date | string | null
    decisionNote?: StringNullableWithAggregatesFilter<"PlanChangeRequest"> | string | null
  }

  export type TenantCreateInput = {
    id?: string
    name: string
    slug: string
    plan?: $Enums.TenantPlan
    status?: $Enums.TenantStatus
    trialEndsAt?: Date | string | null
    logoUrl?: string | null
    website?: string | null
    industry?: string | null
    companySize?: string | null
    dataRegion?: string
    isolationConfig?: JsonNullValueInput | InputJsonValue
    settings?: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    planChangeRequests?: PlanChangeRequestCreateNestedManyWithoutTenantInput
  }

  export type TenantUncheckedCreateInput = {
    id?: string
    name: string
    slug: string
    plan?: $Enums.TenantPlan
    status?: $Enums.TenantStatus
    trialEndsAt?: Date | string | null
    logoUrl?: string | null
    website?: string | null
    industry?: string | null
    companySize?: string | null
    dataRegion?: string
    isolationConfig?: JsonNullValueInput | InputJsonValue
    settings?: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    planChangeRequests?: PlanChangeRequestUncheckedCreateNestedManyWithoutTenantInput
  }

  export type TenantUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    plan?: EnumTenantPlanFieldUpdateOperationsInput | $Enums.TenantPlan
    status?: EnumTenantStatusFieldUpdateOperationsInput | $Enums.TenantStatus
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    logoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    website?: NullableStringFieldUpdateOperationsInput | string | null
    industry?: NullableStringFieldUpdateOperationsInput | string | null
    companySize?: NullableStringFieldUpdateOperationsInput | string | null
    dataRegion?: StringFieldUpdateOperationsInput | string
    isolationConfig?: JsonNullValueInput | InputJsonValue
    settings?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    planChangeRequests?: PlanChangeRequestUpdateManyWithoutTenantNestedInput
  }

  export type TenantUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    plan?: EnumTenantPlanFieldUpdateOperationsInput | $Enums.TenantPlan
    status?: EnumTenantStatusFieldUpdateOperationsInput | $Enums.TenantStatus
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    logoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    website?: NullableStringFieldUpdateOperationsInput | string | null
    industry?: NullableStringFieldUpdateOperationsInput | string | null
    companySize?: NullableStringFieldUpdateOperationsInput | string | null
    dataRegion?: StringFieldUpdateOperationsInput | string
    isolationConfig?: JsonNullValueInput | InputJsonValue
    settings?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    planChangeRequests?: PlanChangeRequestUncheckedUpdateManyWithoutTenantNestedInput
  }

  export type TenantCreateManyInput = {
    id?: string
    name: string
    slug: string
    plan?: $Enums.TenantPlan
    status?: $Enums.TenantStatus
    trialEndsAt?: Date | string | null
    logoUrl?: string | null
    website?: string | null
    industry?: string | null
    companySize?: string | null
    dataRegion?: string
    isolationConfig?: JsonNullValueInput | InputJsonValue
    settings?: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    plan?: EnumTenantPlanFieldUpdateOperationsInput | $Enums.TenantPlan
    status?: EnumTenantStatusFieldUpdateOperationsInput | $Enums.TenantStatus
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    logoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    website?: NullableStringFieldUpdateOperationsInput | string | null
    industry?: NullableStringFieldUpdateOperationsInput | string | null
    companySize?: NullableStringFieldUpdateOperationsInput | string | null
    dataRegion?: StringFieldUpdateOperationsInput | string
    isolationConfig?: JsonNullValueInput | InputJsonValue
    settings?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    plan?: EnumTenantPlanFieldUpdateOperationsInput | $Enums.TenantPlan
    status?: EnumTenantStatusFieldUpdateOperationsInput | $Enums.TenantStatus
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    logoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    website?: NullableStringFieldUpdateOperationsInput | string | null
    industry?: NullableStringFieldUpdateOperationsInput | string | null
    companySize?: NullableStringFieldUpdateOperationsInput | string | null
    dataRegion?: StringFieldUpdateOperationsInput | string
    isolationConfig?: JsonNullValueInput | InputJsonValue
    settings?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PlanChangeRequestCreateInput = {
    id?: string
    fromPlan: $Enums.TenantPlan
    toPlan: $Enums.TenantPlan
    status?: $Enums.PlanChangeStatus
    reason?: string | null
    requestedByUserId: string
    requestedAt?: Date | string
    reviewedByUserId?: string | null
    reviewedAt?: Date | string | null
    decisionNote?: string | null
    tenant: TenantCreateNestedOneWithoutPlanChangeRequestsInput
  }

  export type PlanChangeRequestUncheckedCreateInput = {
    id?: string
    tenantId: string
    fromPlan: $Enums.TenantPlan
    toPlan: $Enums.TenantPlan
    status?: $Enums.PlanChangeStatus
    reason?: string | null
    requestedByUserId: string
    requestedAt?: Date | string
    reviewedByUserId?: string | null
    reviewedAt?: Date | string | null
    decisionNote?: string | null
  }

  export type PlanChangeRequestUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    fromPlan?: EnumTenantPlanFieldUpdateOperationsInput | $Enums.TenantPlan
    toPlan?: EnumTenantPlanFieldUpdateOperationsInput | $Enums.TenantPlan
    status?: EnumPlanChangeStatusFieldUpdateOperationsInput | $Enums.PlanChangeStatus
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    requestedByUserId?: StringFieldUpdateOperationsInput | string
    requestedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    reviewedByUserId?: NullableStringFieldUpdateOperationsInput | string | null
    reviewedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    decisionNote?: NullableStringFieldUpdateOperationsInput | string | null
    tenant?: TenantUpdateOneRequiredWithoutPlanChangeRequestsNestedInput
  }

  export type PlanChangeRequestUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    fromPlan?: EnumTenantPlanFieldUpdateOperationsInput | $Enums.TenantPlan
    toPlan?: EnumTenantPlanFieldUpdateOperationsInput | $Enums.TenantPlan
    status?: EnumPlanChangeStatusFieldUpdateOperationsInput | $Enums.PlanChangeStatus
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    requestedByUserId?: StringFieldUpdateOperationsInput | string
    requestedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    reviewedByUserId?: NullableStringFieldUpdateOperationsInput | string | null
    reviewedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    decisionNote?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type PlanChangeRequestCreateManyInput = {
    id?: string
    tenantId: string
    fromPlan: $Enums.TenantPlan
    toPlan: $Enums.TenantPlan
    status?: $Enums.PlanChangeStatus
    reason?: string | null
    requestedByUserId: string
    requestedAt?: Date | string
    reviewedByUserId?: string | null
    reviewedAt?: Date | string | null
    decisionNote?: string | null
  }

  export type PlanChangeRequestUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    fromPlan?: EnumTenantPlanFieldUpdateOperationsInput | $Enums.TenantPlan
    toPlan?: EnumTenantPlanFieldUpdateOperationsInput | $Enums.TenantPlan
    status?: EnumPlanChangeStatusFieldUpdateOperationsInput | $Enums.PlanChangeStatus
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    requestedByUserId?: StringFieldUpdateOperationsInput | string
    requestedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    reviewedByUserId?: NullableStringFieldUpdateOperationsInput | string | null
    reviewedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    decisionNote?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type PlanChangeRequestUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    fromPlan?: EnumTenantPlanFieldUpdateOperationsInput | $Enums.TenantPlan
    toPlan?: EnumTenantPlanFieldUpdateOperationsInput | $Enums.TenantPlan
    status?: EnumPlanChangeStatusFieldUpdateOperationsInput | $Enums.PlanChangeStatus
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    requestedByUserId?: StringFieldUpdateOperationsInput | string
    requestedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    reviewedByUserId?: NullableStringFieldUpdateOperationsInput | string | null
    reviewedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    decisionNote?: NullableStringFieldUpdateOperationsInput | string | null
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

  export type EnumTenantPlanFilter<$PrismaModel = never> = {
    equals?: $Enums.TenantPlan | EnumTenantPlanFieldRefInput<$PrismaModel>
    in?: $Enums.TenantPlan[] | ListEnumTenantPlanFieldRefInput<$PrismaModel>
    notIn?: $Enums.TenantPlan[] | ListEnumTenantPlanFieldRefInput<$PrismaModel>
    not?: NestedEnumTenantPlanFilter<$PrismaModel> | $Enums.TenantPlan
  }

  export type EnumTenantStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.TenantStatus | EnumTenantStatusFieldRefInput<$PrismaModel>
    in?: $Enums.TenantStatus[] | ListEnumTenantStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.TenantStatus[] | ListEnumTenantStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumTenantStatusFilter<$PrismaModel> | $Enums.TenantStatus
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

  export type PlanChangeRequestListRelationFilter = {
    every?: PlanChangeRequestWhereInput
    some?: PlanChangeRequestWhereInput
    none?: PlanChangeRequestWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type PlanChangeRequestOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TenantCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    plan?: SortOrder
    status?: SortOrder
    trialEndsAt?: SortOrder
    logoUrl?: SortOrder
    website?: SortOrder
    industry?: SortOrder
    companySize?: SortOrder
    dataRegion?: SortOrder
    isolationConfig?: SortOrder
    settings?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TenantMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    plan?: SortOrder
    status?: SortOrder
    trialEndsAt?: SortOrder
    logoUrl?: SortOrder
    website?: SortOrder
    industry?: SortOrder
    companySize?: SortOrder
    dataRegion?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TenantMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    plan?: SortOrder
    status?: SortOrder
    trialEndsAt?: SortOrder
    logoUrl?: SortOrder
    website?: SortOrder
    industry?: SortOrder
    companySize?: SortOrder
    dataRegion?: SortOrder
    createdAt?: SortOrder
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

  export type EnumTenantPlanWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TenantPlan | EnumTenantPlanFieldRefInput<$PrismaModel>
    in?: $Enums.TenantPlan[] | ListEnumTenantPlanFieldRefInput<$PrismaModel>
    notIn?: $Enums.TenantPlan[] | ListEnumTenantPlanFieldRefInput<$PrismaModel>
    not?: NestedEnumTenantPlanWithAggregatesFilter<$PrismaModel> | $Enums.TenantPlan
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTenantPlanFilter<$PrismaModel>
    _max?: NestedEnumTenantPlanFilter<$PrismaModel>
  }

  export type EnumTenantStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TenantStatus | EnumTenantStatusFieldRefInput<$PrismaModel>
    in?: $Enums.TenantStatus[] | ListEnumTenantStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.TenantStatus[] | ListEnumTenantStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumTenantStatusWithAggregatesFilter<$PrismaModel> | $Enums.TenantStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTenantStatusFilter<$PrismaModel>
    _max?: NestedEnumTenantStatusFilter<$PrismaModel>
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

  export type EnumPlanChangeStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.PlanChangeStatus | EnumPlanChangeStatusFieldRefInput<$PrismaModel>
    in?: $Enums.PlanChangeStatus[] | ListEnumPlanChangeStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.PlanChangeStatus[] | ListEnumPlanChangeStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumPlanChangeStatusFilter<$PrismaModel> | $Enums.PlanChangeStatus
  }

  export type TenantScalarRelationFilter = {
    is?: TenantWhereInput
    isNot?: TenantWhereInput
  }

  export type PlanChangeRequestCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    fromPlan?: SortOrder
    toPlan?: SortOrder
    status?: SortOrder
    reason?: SortOrder
    requestedByUserId?: SortOrder
    requestedAt?: SortOrder
    reviewedByUserId?: SortOrder
    reviewedAt?: SortOrder
    decisionNote?: SortOrder
  }

  export type PlanChangeRequestMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    fromPlan?: SortOrder
    toPlan?: SortOrder
    status?: SortOrder
    reason?: SortOrder
    requestedByUserId?: SortOrder
    requestedAt?: SortOrder
    reviewedByUserId?: SortOrder
    reviewedAt?: SortOrder
    decisionNote?: SortOrder
  }

  export type PlanChangeRequestMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    fromPlan?: SortOrder
    toPlan?: SortOrder
    status?: SortOrder
    reason?: SortOrder
    requestedByUserId?: SortOrder
    requestedAt?: SortOrder
    reviewedByUserId?: SortOrder
    reviewedAt?: SortOrder
    decisionNote?: SortOrder
  }

  export type EnumPlanChangeStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PlanChangeStatus | EnumPlanChangeStatusFieldRefInput<$PrismaModel>
    in?: $Enums.PlanChangeStatus[] | ListEnumPlanChangeStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.PlanChangeStatus[] | ListEnumPlanChangeStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumPlanChangeStatusWithAggregatesFilter<$PrismaModel> | $Enums.PlanChangeStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPlanChangeStatusFilter<$PrismaModel>
    _max?: NestedEnumPlanChangeStatusFilter<$PrismaModel>
  }

  export type PlanChangeRequestCreateNestedManyWithoutTenantInput = {
    create?: XOR<PlanChangeRequestCreateWithoutTenantInput, PlanChangeRequestUncheckedCreateWithoutTenantInput> | PlanChangeRequestCreateWithoutTenantInput[] | PlanChangeRequestUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: PlanChangeRequestCreateOrConnectWithoutTenantInput | PlanChangeRequestCreateOrConnectWithoutTenantInput[]
    createMany?: PlanChangeRequestCreateManyTenantInputEnvelope
    connect?: PlanChangeRequestWhereUniqueInput | PlanChangeRequestWhereUniqueInput[]
  }

  export type PlanChangeRequestUncheckedCreateNestedManyWithoutTenantInput = {
    create?: XOR<PlanChangeRequestCreateWithoutTenantInput, PlanChangeRequestUncheckedCreateWithoutTenantInput> | PlanChangeRequestCreateWithoutTenantInput[] | PlanChangeRequestUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: PlanChangeRequestCreateOrConnectWithoutTenantInput | PlanChangeRequestCreateOrConnectWithoutTenantInput[]
    createMany?: PlanChangeRequestCreateManyTenantInputEnvelope
    connect?: PlanChangeRequestWhereUniqueInput | PlanChangeRequestWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type EnumTenantPlanFieldUpdateOperationsInput = {
    set?: $Enums.TenantPlan
  }

  export type EnumTenantStatusFieldUpdateOperationsInput = {
    set?: $Enums.TenantStatus
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type PlanChangeRequestUpdateManyWithoutTenantNestedInput = {
    create?: XOR<PlanChangeRequestCreateWithoutTenantInput, PlanChangeRequestUncheckedCreateWithoutTenantInput> | PlanChangeRequestCreateWithoutTenantInput[] | PlanChangeRequestUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: PlanChangeRequestCreateOrConnectWithoutTenantInput | PlanChangeRequestCreateOrConnectWithoutTenantInput[]
    upsert?: PlanChangeRequestUpsertWithWhereUniqueWithoutTenantInput | PlanChangeRequestUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: PlanChangeRequestCreateManyTenantInputEnvelope
    set?: PlanChangeRequestWhereUniqueInput | PlanChangeRequestWhereUniqueInput[]
    disconnect?: PlanChangeRequestWhereUniqueInput | PlanChangeRequestWhereUniqueInput[]
    delete?: PlanChangeRequestWhereUniqueInput | PlanChangeRequestWhereUniqueInput[]
    connect?: PlanChangeRequestWhereUniqueInput | PlanChangeRequestWhereUniqueInput[]
    update?: PlanChangeRequestUpdateWithWhereUniqueWithoutTenantInput | PlanChangeRequestUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: PlanChangeRequestUpdateManyWithWhereWithoutTenantInput | PlanChangeRequestUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: PlanChangeRequestScalarWhereInput | PlanChangeRequestScalarWhereInput[]
  }

  export type PlanChangeRequestUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: XOR<PlanChangeRequestCreateWithoutTenantInput, PlanChangeRequestUncheckedCreateWithoutTenantInput> | PlanChangeRequestCreateWithoutTenantInput[] | PlanChangeRequestUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: PlanChangeRequestCreateOrConnectWithoutTenantInput | PlanChangeRequestCreateOrConnectWithoutTenantInput[]
    upsert?: PlanChangeRequestUpsertWithWhereUniqueWithoutTenantInput | PlanChangeRequestUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: PlanChangeRequestCreateManyTenantInputEnvelope
    set?: PlanChangeRequestWhereUniqueInput | PlanChangeRequestWhereUniqueInput[]
    disconnect?: PlanChangeRequestWhereUniqueInput | PlanChangeRequestWhereUniqueInput[]
    delete?: PlanChangeRequestWhereUniqueInput | PlanChangeRequestWhereUniqueInput[]
    connect?: PlanChangeRequestWhereUniqueInput | PlanChangeRequestWhereUniqueInput[]
    update?: PlanChangeRequestUpdateWithWhereUniqueWithoutTenantInput | PlanChangeRequestUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: PlanChangeRequestUpdateManyWithWhereWithoutTenantInput | PlanChangeRequestUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: PlanChangeRequestScalarWhereInput | PlanChangeRequestScalarWhereInput[]
  }

  export type TenantCreateNestedOneWithoutPlanChangeRequestsInput = {
    create?: XOR<TenantCreateWithoutPlanChangeRequestsInput, TenantUncheckedCreateWithoutPlanChangeRequestsInput>
    connectOrCreate?: TenantCreateOrConnectWithoutPlanChangeRequestsInput
    connect?: TenantWhereUniqueInput
  }

  export type EnumPlanChangeStatusFieldUpdateOperationsInput = {
    set?: $Enums.PlanChangeStatus
  }

  export type TenantUpdateOneRequiredWithoutPlanChangeRequestsNestedInput = {
    create?: XOR<TenantCreateWithoutPlanChangeRequestsInput, TenantUncheckedCreateWithoutPlanChangeRequestsInput>
    connectOrCreate?: TenantCreateOrConnectWithoutPlanChangeRequestsInput
    upsert?: TenantUpsertWithoutPlanChangeRequestsInput
    connect?: TenantWhereUniqueInput
    update?: XOR<XOR<TenantUpdateToOneWithWhereWithoutPlanChangeRequestsInput, TenantUpdateWithoutPlanChangeRequestsInput>, TenantUncheckedUpdateWithoutPlanChangeRequestsInput>
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

  export type NestedEnumTenantPlanFilter<$PrismaModel = never> = {
    equals?: $Enums.TenantPlan | EnumTenantPlanFieldRefInput<$PrismaModel>
    in?: $Enums.TenantPlan[] | ListEnumTenantPlanFieldRefInput<$PrismaModel>
    notIn?: $Enums.TenantPlan[] | ListEnumTenantPlanFieldRefInput<$PrismaModel>
    not?: NestedEnumTenantPlanFilter<$PrismaModel> | $Enums.TenantPlan
  }

  export type NestedEnumTenantStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.TenantStatus | EnumTenantStatusFieldRefInput<$PrismaModel>
    in?: $Enums.TenantStatus[] | ListEnumTenantStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.TenantStatus[] | ListEnumTenantStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumTenantStatusFilter<$PrismaModel> | $Enums.TenantStatus
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

  export type NestedEnumTenantPlanWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TenantPlan | EnumTenantPlanFieldRefInput<$PrismaModel>
    in?: $Enums.TenantPlan[] | ListEnumTenantPlanFieldRefInput<$PrismaModel>
    notIn?: $Enums.TenantPlan[] | ListEnumTenantPlanFieldRefInput<$PrismaModel>
    not?: NestedEnumTenantPlanWithAggregatesFilter<$PrismaModel> | $Enums.TenantPlan
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTenantPlanFilter<$PrismaModel>
    _max?: NestedEnumTenantPlanFilter<$PrismaModel>
  }

  export type NestedEnumTenantStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TenantStatus | EnumTenantStatusFieldRefInput<$PrismaModel>
    in?: $Enums.TenantStatus[] | ListEnumTenantStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.TenantStatus[] | ListEnumTenantStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumTenantStatusWithAggregatesFilter<$PrismaModel> | $Enums.TenantStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTenantStatusFilter<$PrismaModel>
    _max?: NestedEnumTenantStatusFilter<$PrismaModel>
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

  export type NestedEnumPlanChangeStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.PlanChangeStatus | EnumPlanChangeStatusFieldRefInput<$PrismaModel>
    in?: $Enums.PlanChangeStatus[] | ListEnumPlanChangeStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.PlanChangeStatus[] | ListEnumPlanChangeStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumPlanChangeStatusFilter<$PrismaModel> | $Enums.PlanChangeStatus
  }

  export type NestedEnumPlanChangeStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PlanChangeStatus | EnumPlanChangeStatusFieldRefInput<$PrismaModel>
    in?: $Enums.PlanChangeStatus[] | ListEnumPlanChangeStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.PlanChangeStatus[] | ListEnumPlanChangeStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumPlanChangeStatusWithAggregatesFilter<$PrismaModel> | $Enums.PlanChangeStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPlanChangeStatusFilter<$PrismaModel>
    _max?: NestedEnumPlanChangeStatusFilter<$PrismaModel>
  }

  export type PlanChangeRequestCreateWithoutTenantInput = {
    id?: string
    fromPlan: $Enums.TenantPlan
    toPlan: $Enums.TenantPlan
    status?: $Enums.PlanChangeStatus
    reason?: string | null
    requestedByUserId: string
    requestedAt?: Date | string
    reviewedByUserId?: string | null
    reviewedAt?: Date | string | null
    decisionNote?: string | null
  }

  export type PlanChangeRequestUncheckedCreateWithoutTenantInput = {
    id?: string
    fromPlan: $Enums.TenantPlan
    toPlan: $Enums.TenantPlan
    status?: $Enums.PlanChangeStatus
    reason?: string | null
    requestedByUserId: string
    requestedAt?: Date | string
    reviewedByUserId?: string | null
    reviewedAt?: Date | string | null
    decisionNote?: string | null
  }

  export type PlanChangeRequestCreateOrConnectWithoutTenantInput = {
    where: PlanChangeRequestWhereUniqueInput
    create: XOR<PlanChangeRequestCreateWithoutTenantInput, PlanChangeRequestUncheckedCreateWithoutTenantInput>
  }

  export type PlanChangeRequestCreateManyTenantInputEnvelope = {
    data: PlanChangeRequestCreateManyTenantInput | PlanChangeRequestCreateManyTenantInput[]
    skipDuplicates?: boolean
  }

  export type PlanChangeRequestUpsertWithWhereUniqueWithoutTenantInput = {
    where: PlanChangeRequestWhereUniqueInput
    update: XOR<PlanChangeRequestUpdateWithoutTenantInput, PlanChangeRequestUncheckedUpdateWithoutTenantInput>
    create: XOR<PlanChangeRequestCreateWithoutTenantInput, PlanChangeRequestUncheckedCreateWithoutTenantInput>
  }

  export type PlanChangeRequestUpdateWithWhereUniqueWithoutTenantInput = {
    where: PlanChangeRequestWhereUniqueInput
    data: XOR<PlanChangeRequestUpdateWithoutTenantInput, PlanChangeRequestUncheckedUpdateWithoutTenantInput>
  }

  export type PlanChangeRequestUpdateManyWithWhereWithoutTenantInput = {
    where: PlanChangeRequestScalarWhereInput
    data: XOR<PlanChangeRequestUpdateManyMutationInput, PlanChangeRequestUncheckedUpdateManyWithoutTenantInput>
  }

  export type PlanChangeRequestScalarWhereInput = {
    AND?: PlanChangeRequestScalarWhereInput | PlanChangeRequestScalarWhereInput[]
    OR?: PlanChangeRequestScalarWhereInput[]
    NOT?: PlanChangeRequestScalarWhereInput | PlanChangeRequestScalarWhereInput[]
    id?: StringFilter<"PlanChangeRequest"> | string
    tenantId?: StringFilter<"PlanChangeRequest"> | string
    fromPlan?: EnumTenantPlanFilter<"PlanChangeRequest"> | $Enums.TenantPlan
    toPlan?: EnumTenantPlanFilter<"PlanChangeRequest"> | $Enums.TenantPlan
    status?: EnumPlanChangeStatusFilter<"PlanChangeRequest"> | $Enums.PlanChangeStatus
    reason?: StringNullableFilter<"PlanChangeRequest"> | string | null
    requestedByUserId?: StringFilter<"PlanChangeRequest"> | string
    requestedAt?: DateTimeFilter<"PlanChangeRequest"> | Date | string
    reviewedByUserId?: StringNullableFilter<"PlanChangeRequest"> | string | null
    reviewedAt?: DateTimeNullableFilter<"PlanChangeRequest"> | Date | string | null
    decisionNote?: StringNullableFilter<"PlanChangeRequest"> | string | null
  }

  export type TenantCreateWithoutPlanChangeRequestsInput = {
    id?: string
    name: string
    slug: string
    plan?: $Enums.TenantPlan
    status?: $Enums.TenantStatus
    trialEndsAt?: Date | string | null
    logoUrl?: string | null
    website?: string | null
    industry?: string | null
    companySize?: string | null
    dataRegion?: string
    isolationConfig?: JsonNullValueInput | InputJsonValue
    settings?: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantUncheckedCreateWithoutPlanChangeRequestsInput = {
    id?: string
    name: string
    slug: string
    plan?: $Enums.TenantPlan
    status?: $Enums.TenantStatus
    trialEndsAt?: Date | string | null
    logoUrl?: string | null
    website?: string | null
    industry?: string | null
    companySize?: string | null
    dataRegion?: string
    isolationConfig?: JsonNullValueInput | InputJsonValue
    settings?: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantCreateOrConnectWithoutPlanChangeRequestsInput = {
    where: TenantWhereUniqueInput
    create: XOR<TenantCreateWithoutPlanChangeRequestsInput, TenantUncheckedCreateWithoutPlanChangeRequestsInput>
  }

  export type TenantUpsertWithoutPlanChangeRequestsInput = {
    update: XOR<TenantUpdateWithoutPlanChangeRequestsInput, TenantUncheckedUpdateWithoutPlanChangeRequestsInput>
    create: XOR<TenantCreateWithoutPlanChangeRequestsInput, TenantUncheckedCreateWithoutPlanChangeRequestsInput>
    where?: TenantWhereInput
  }

  export type TenantUpdateToOneWithWhereWithoutPlanChangeRequestsInput = {
    where?: TenantWhereInput
    data: XOR<TenantUpdateWithoutPlanChangeRequestsInput, TenantUncheckedUpdateWithoutPlanChangeRequestsInput>
  }

  export type TenantUpdateWithoutPlanChangeRequestsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    plan?: EnumTenantPlanFieldUpdateOperationsInput | $Enums.TenantPlan
    status?: EnumTenantStatusFieldUpdateOperationsInput | $Enums.TenantStatus
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    logoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    website?: NullableStringFieldUpdateOperationsInput | string | null
    industry?: NullableStringFieldUpdateOperationsInput | string | null
    companySize?: NullableStringFieldUpdateOperationsInput | string | null
    dataRegion?: StringFieldUpdateOperationsInput | string
    isolationConfig?: JsonNullValueInput | InputJsonValue
    settings?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantUncheckedUpdateWithoutPlanChangeRequestsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    plan?: EnumTenantPlanFieldUpdateOperationsInput | $Enums.TenantPlan
    status?: EnumTenantStatusFieldUpdateOperationsInput | $Enums.TenantStatus
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    logoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    website?: NullableStringFieldUpdateOperationsInput | string | null
    industry?: NullableStringFieldUpdateOperationsInput | string | null
    companySize?: NullableStringFieldUpdateOperationsInput | string | null
    dataRegion?: StringFieldUpdateOperationsInput | string
    isolationConfig?: JsonNullValueInput | InputJsonValue
    settings?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PlanChangeRequestCreateManyTenantInput = {
    id?: string
    fromPlan: $Enums.TenantPlan
    toPlan: $Enums.TenantPlan
    status?: $Enums.PlanChangeStatus
    reason?: string | null
    requestedByUserId: string
    requestedAt?: Date | string
    reviewedByUserId?: string | null
    reviewedAt?: Date | string | null
    decisionNote?: string | null
  }

  export type PlanChangeRequestUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    fromPlan?: EnumTenantPlanFieldUpdateOperationsInput | $Enums.TenantPlan
    toPlan?: EnumTenantPlanFieldUpdateOperationsInput | $Enums.TenantPlan
    status?: EnumPlanChangeStatusFieldUpdateOperationsInput | $Enums.PlanChangeStatus
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    requestedByUserId?: StringFieldUpdateOperationsInput | string
    requestedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    reviewedByUserId?: NullableStringFieldUpdateOperationsInput | string | null
    reviewedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    decisionNote?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type PlanChangeRequestUncheckedUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    fromPlan?: EnumTenantPlanFieldUpdateOperationsInput | $Enums.TenantPlan
    toPlan?: EnumTenantPlanFieldUpdateOperationsInput | $Enums.TenantPlan
    status?: EnumPlanChangeStatusFieldUpdateOperationsInput | $Enums.PlanChangeStatus
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    requestedByUserId?: StringFieldUpdateOperationsInput | string
    requestedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    reviewedByUserId?: NullableStringFieldUpdateOperationsInput | string | null
    reviewedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    decisionNote?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type PlanChangeRequestUncheckedUpdateManyWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    fromPlan?: EnumTenantPlanFieldUpdateOperationsInput | $Enums.TenantPlan
    toPlan?: EnumTenantPlanFieldUpdateOperationsInput | $Enums.TenantPlan
    status?: EnumPlanChangeStatusFieldUpdateOperationsInput | $Enums.PlanChangeStatus
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    requestedByUserId?: StringFieldUpdateOperationsInput | string
    requestedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    reviewedByUserId?: NullableStringFieldUpdateOperationsInput | string | null
    reviewedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    decisionNote?: NullableStringFieldUpdateOperationsInput | string | null
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