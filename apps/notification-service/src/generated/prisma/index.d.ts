
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
 * Model Notification
 * 
 */
export type Notification = $Result.DefaultSelection<Prisma.$NotificationPayload>
/**
 * Model NotificationDelivery
 * 
 */
export type NotificationDelivery = $Result.DefaultSelection<Prisma.$NotificationDeliveryPayload>
/**
 * Model TenantIntegration
 * 
 */
export type TenantIntegration = $Result.DefaultSelection<Prisma.$TenantIntegrationPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const NotificationType: {
  PLAN_CHANGE_REQUESTED: 'PLAN_CHANGE_REQUESTED',
  PLAN_CHANGE_APPROVED: 'PLAN_CHANGE_APPROVED',
  PLAN_CHANGE_REJECTED: 'PLAN_CHANGE_REJECTED',
  NEW_TENANT_SIGNUP: 'NEW_TENANT_SIGNUP',
  BULK_UPLOAD_COMPLETED: 'BULK_UPLOAD_COMPLETED',
  SEAT_LIMIT_REACHED: 'SEAT_LIMIT_REACHED',
  INTERVIEW_FEEDBACK_NEW: 'INTERVIEW_FEEDBACK_NEW',
  SYSTEM: 'SYSTEM'
};

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType]


export const DeliveryChannel: {
  IN_APP: 'IN_APP',
  EMAIL: 'EMAIL',
  SLACK: 'SLACK'
};

export type DeliveryChannel = (typeof DeliveryChannel)[keyof typeof DeliveryChannel]


export const DeliveryStatus: {
  PENDING: 'PENDING',
  SENT: 'SENT',
  FAILED: 'FAILED'
};

export type DeliveryStatus = (typeof DeliveryStatus)[keyof typeof DeliveryStatus]

}

export type NotificationType = $Enums.NotificationType

export const NotificationType: typeof $Enums.NotificationType

export type DeliveryChannel = $Enums.DeliveryChannel

export const DeliveryChannel: typeof $Enums.DeliveryChannel

export type DeliveryStatus = $Enums.DeliveryStatus

export const DeliveryStatus: typeof $Enums.DeliveryStatus

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Notifications
 * const notifications = await prisma.notification.findMany()
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
   * // Fetch zero or more Notifications
   * const notifications = await prisma.notification.findMany()
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
   * `prisma.notification`: Exposes CRUD operations for the **Notification** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Notifications
    * const notifications = await prisma.notification.findMany()
    * ```
    */
  get notification(): Prisma.NotificationDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.notificationDelivery`: Exposes CRUD operations for the **NotificationDelivery** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more NotificationDeliveries
    * const notificationDeliveries = await prisma.notificationDelivery.findMany()
    * ```
    */
  get notificationDelivery(): Prisma.NotificationDeliveryDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.tenantIntegration`: Exposes CRUD operations for the **TenantIntegration** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TenantIntegrations
    * const tenantIntegrations = await prisma.tenantIntegration.findMany()
    * ```
    */
  get tenantIntegration(): Prisma.TenantIntegrationDelegate<ExtArgs, ClientOptions>;
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
    Notification: 'Notification',
    NotificationDelivery: 'NotificationDelivery',
    TenantIntegration: 'TenantIntegration'
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
      modelProps: "notification" | "notificationDelivery" | "tenantIntegration"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Notification: {
        payload: Prisma.$NotificationPayload<ExtArgs>
        fields: Prisma.NotificationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.NotificationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.NotificationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          findFirst: {
            args: Prisma.NotificationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.NotificationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          findMany: {
            args: Prisma.NotificationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>[]
          }
          create: {
            args: Prisma.NotificationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          createMany: {
            args: Prisma.NotificationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.NotificationCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>[]
          }
          delete: {
            args: Prisma.NotificationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          update: {
            args: Prisma.NotificationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          deleteMany: {
            args: Prisma.NotificationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.NotificationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.NotificationUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>[]
          }
          upsert: {
            args: Prisma.NotificationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          aggregate: {
            args: Prisma.NotificationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateNotification>
          }
          groupBy: {
            args: Prisma.NotificationGroupByArgs<ExtArgs>
            result: $Utils.Optional<NotificationGroupByOutputType>[]
          }
          count: {
            args: Prisma.NotificationCountArgs<ExtArgs>
            result: $Utils.Optional<NotificationCountAggregateOutputType> | number
          }
        }
      }
      NotificationDelivery: {
        payload: Prisma.$NotificationDeliveryPayload<ExtArgs>
        fields: Prisma.NotificationDeliveryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.NotificationDeliveryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationDeliveryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.NotificationDeliveryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationDeliveryPayload>
          }
          findFirst: {
            args: Prisma.NotificationDeliveryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationDeliveryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.NotificationDeliveryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationDeliveryPayload>
          }
          findMany: {
            args: Prisma.NotificationDeliveryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationDeliveryPayload>[]
          }
          create: {
            args: Prisma.NotificationDeliveryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationDeliveryPayload>
          }
          createMany: {
            args: Prisma.NotificationDeliveryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.NotificationDeliveryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationDeliveryPayload>[]
          }
          delete: {
            args: Prisma.NotificationDeliveryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationDeliveryPayload>
          }
          update: {
            args: Prisma.NotificationDeliveryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationDeliveryPayload>
          }
          deleteMany: {
            args: Prisma.NotificationDeliveryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.NotificationDeliveryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.NotificationDeliveryUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationDeliveryPayload>[]
          }
          upsert: {
            args: Prisma.NotificationDeliveryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationDeliveryPayload>
          }
          aggregate: {
            args: Prisma.NotificationDeliveryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateNotificationDelivery>
          }
          groupBy: {
            args: Prisma.NotificationDeliveryGroupByArgs<ExtArgs>
            result: $Utils.Optional<NotificationDeliveryGroupByOutputType>[]
          }
          count: {
            args: Prisma.NotificationDeliveryCountArgs<ExtArgs>
            result: $Utils.Optional<NotificationDeliveryCountAggregateOutputType> | number
          }
        }
      }
      TenantIntegration: {
        payload: Prisma.$TenantIntegrationPayload<ExtArgs>
        fields: Prisma.TenantIntegrationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TenantIntegrationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantIntegrationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TenantIntegrationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantIntegrationPayload>
          }
          findFirst: {
            args: Prisma.TenantIntegrationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantIntegrationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TenantIntegrationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantIntegrationPayload>
          }
          findMany: {
            args: Prisma.TenantIntegrationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantIntegrationPayload>[]
          }
          create: {
            args: Prisma.TenantIntegrationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantIntegrationPayload>
          }
          createMany: {
            args: Prisma.TenantIntegrationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TenantIntegrationCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantIntegrationPayload>[]
          }
          delete: {
            args: Prisma.TenantIntegrationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantIntegrationPayload>
          }
          update: {
            args: Prisma.TenantIntegrationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantIntegrationPayload>
          }
          deleteMany: {
            args: Prisma.TenantIntegrationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TenantIntegrationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TenantIntegrationUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantIntegrationPayload>[]
          }
          upsert: {
            args: Prisma.TenantIntegrationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantIntegrationPayload>
          }
          aggregate: {
            args: Prisma.TenantIntegrationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTenantIntegration>
          }
          groupBy: {
            args: Prisma.TenantIntegrationGroupByArgs<ExtArgs>
            result: $Utils.Optional<TenantIntegrationGroupByOutputType>[]
          }
          count: {
            args: Prisma.TenantIntegrationCountArgs<ExtArgs>
            result: $Utils.Optional<TenantIntegrationCountAggregateOutputType> | number
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
    notification?: NotificationOmit
    notificationDelivery?: NotificationDeliveryOmit
    tenantIntegration?: TenantIntegrationOmit
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
   * Count Type NotificationCountOutputType
   */

  export type NotificationCountOutputType = {
    deliveries: number
  }

  export type NotificationCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    deliveries?: boolean | NotificationCountOutputTypeCountDeliveriesArgs
  }

  // Custom InputTypes
  /**
   * NotificationCountOutputType without action
   */
  export type NotificationCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NotificationCountOutputType
     */
    select?: NotificationCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * NotificationCountOutputType without action
   */
  export type NotificationCountOutputTypeCountDeliveriesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: NotificationDeliveryWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Notification
   */

  export type AggregateNotification = {
    _count: NotificationCountAggregateOutputType | null
    _min: NotificationMinAggregateOutputType | null
    _max: NotificationMaxAggregateOutputType | null
  }

  export type NotificationMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    userId: string | null
    type: $Enums.NotificationType | null
    title: string | null
    body: string | null
    link: string | null
    readAt: Date | null
    createdAt: Date | null
  }

  export type NotificationMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    userId: string | null
    type: $Enums.NotificationType | null
    title: string | null
    body: string | null
    link: string | null
    readAt: Date | null
    createdAt: Date | null
  }

  export type NotificationCountAggregateOutputType = {
    id: number
    tenantId: number
    userId: number
    type: number
    title: number
    body: number
    link: number
    readAt: number
    metadata: number
    channels: number
    createdAt: number
    _all: number
  }


  export type NotificationMinAggregateInputType = {
    id?: true
    tenantId?: true
    userId?: true
    type?: true
    title?: true
    body?: true
    link?: true
    readAt?: true
    createdAt?: true
  }

  export type NotificationMaxAggregateInputType = {
    id?: true
    tenantId?: true
    userId?: true
    type?: true
    title?: true
    body?: true
    link?: true
    readAt?: true
    createdAt?: true
  }

  export type NotificationCountAggregateInputType = {
    id?: true
    tenantId?: true
    userId?: true
    type?: true
    title?: true
    body?: true
    link?: true
    readAt?: true
    metadata?: true
    channels?: true
    createdAt?: true
    _all?: true
  }

  export type NotificationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Notification to aggregate.
     */
    where?: NotificationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Notifications to fetch.
     */
    orderBy?: NotificationOrderByWithRelationInput | NotificationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: NotificationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Notifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Notifications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Notifications
    **/
    _count?: true | NotificationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: NotificationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: NotificationMaxAggregateInputType
  }

  export type GetNotificationAggregateType<T extends NotificationAggregateArgs> = {
        [P in keyof T & keyof AggregateNotification]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateNotification[P]>
      : GetScalarType<T[P], AggregateNotification[P]>
  }




  export type NotificationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: NotificationWhereInput
    orderBy?: NotificationOrderByWithAggregationInput | NotificationOrderByWithAggregationInput[]
    by: NotificationScalarFieldEnum[] | NotificationScalarFieldEnum
    having?: NotificationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: NotificationCountAggregateInputType | true
    _min?: NotificationMinAggregateInputType
    _max?: NotificationMaxAggregateInputType
  }

  export type NotificationGroupByOutputType = {
    id: string
    tenantId: string | null
    userId: string | null
    type: $Enums.NotificationType
    title: string
    body: string | null
    link: string | null
    readAt: Date | null
    metadata: JsonValue
    channels: string[]
    createdAt: Date
    _count: NotificationCountAggregateOutputType | null
    _min: NotificationMinAggregateOutputType | null
    _max: NotificationMaxAggregateOutputType | null
  }

  type GetNotificationGroupByPayload<T extends NotificationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<NotificationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof NotificationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], NotificationGroupByOutputType[P]>
            : GetScalarType<T[P], NotificationGroupByOutputType[P]>
        }
      >
    >


  export type NotificationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    userId?: boolean
    type?: boolean
    title?: boolean
    body?: boolean
    link?: boolean
    readAt?: boolean
    metadata?: boolean
    channels?: boolean
    createdAt?: boolean
    deliveries?: boolean | Notification$deliveriesArgs<ExtArgs>
    _count?: boolean | NotificationCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["notification"]>

  export type NotificationSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    userId?: boolean
    type?: boolean
    title?: boolean
    body?: boolean
    link?: boolean
    readAt?: boolean
    metadata?: boolean
    channels?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["notification"]>

  export type NotificationSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    userId?: boolean
    type?: boolean
    title?: boolean
    body?: boolean
    link?: boolean
    readAt?: boolean
    metadata?: boolean
    channels?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["notification"]>

  export type NotificationSelectScalar = {
    id?: boolean
    tenantId?: boolean
    userId?: boolean
    type?: boolean
    title?: boolean
    body?: boolean
    link?: boolean
    readAt?: boolean
    metadata?: boolean
    channels?: boolean
    createdAt?: boolean
  }

  export type NotificationOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "userId" | "type" | "title" | "body" | "link" | "readAt" | "metadata" | "channels" | "createdAt", ExtArgs["result"]["notification"]>
  export type NotificationInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    deliveries?: boolean | Notification$deliveriesArgs<ExtArgs>
    _count?: boolean | NotificationCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type NotificationIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type NotificationIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $NotificationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Notification"
    objects: {
      deliveries: Prisma.$NotificationDeliveryPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string | null
      userId: string | null
      type: $Enums.NotificationType
      title: string
      body: string | null
      link: string | null
      readAt: Date | null
      metadata: Prisma.JsonValue
      channels: string[]
      createdAt: Date
    }, ExtArgs["result"]["notification"]>
    composites: {}
  }

  type NotificationGetPayload<S extends boolean | null | undefined | NotificationDefaultArgs> = $Result.GetResult<Prisma.$NotificationPayload, S>

  type NotificationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<NotificationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: NotificationCountAggregateInputType | true
    }

  export interface NotificationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Notification'], meta: { name: 'Notification' } }
    /**
     * Find zero or one Notification that matches the filter.
     * @param {NotificationFindUniqueArgs} args - Arguments to find a Notification
     * @example
     * // Get one Notification
     * const notification = await prisma.notification.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends NotificationFindUniqueArgs>(args: SelectSubset<T, NotificationFindUniqueArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Notification that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {NotificationFindUniqueOrThrowArgs} args - Arguments to find a Notification
     * @example
     * // Get one Notification
     * const notification = await prisma.notification.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends NotificationFindUniqueOrThrowArgs>(args: SelectSubset<T, NotificationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Notification that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationFindFirstArgs} args - Arguments to find a Notification
     * @example
     * // Get one Notification
     * const notification = await prisma.notification.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends NotificationFindFirstArgs>(args?: SelectSubset<T, NotificationFindFirstArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Notification that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationFindFirstOrThrowArgs} args - Arguments to find a Notification
     * @example
     * // Get one Notification
     * const notification = await prisma.notification.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends NotificationFindFirstOrThrowArgs>(args?: SelectSubset<T, NotificationFindFirstOrThrowArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Notifications that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Notifications
     * const notifications = await prisma.notification.findMany()
     * 
     * // Get first 10 Notifications
     * const notifications = await prisma.notification.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const notificationWithIdOnly = await prisma.notification.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends NotificationFindManyArgs>(args?: SelectSubset<T, NotificationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Notification.
     * @param {NotificationCreateArgs} args - Arguments to create a Notification.
     * @example
     * // Create one Notification
     * const Notification = await prisma.notification.create({
     *   data: {
     *     // ... data to create a Notification
     *   }
     * })
     * 
     */
    create<T extends NotificationCreateArgs>(args: SelectSubset<T, NotificationCreateArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Notifications.
     * @param {NotificationCreateManyArgs} args - Arguments to create many Notifications.
     * @example
     * // Create many Notifications
     * const notification = await prisma.notification.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends NotificationCreateManyArgs>(args?: SelectSubset<T, NotificationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Notifications and returns the data saved in the database.
     * @param {NotificationCreateManyAndReturnArgs} args - Arguments to create many Notifications.
     * @example
     * // Create many Notifications
     * const notification = await prisma.notification.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Notifications and only return the `id`
     * const notificationWithIdOnly = await prisma.notification.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends NotificationCreateManyAndReturnArgs>(args?: SelectSubset<T, NotificationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Notification.
     * @param {NotificationDeleteArgs} args - Arguments to delete one Notification.
     * @example
     * // Delete one Notification
     * const Notification = await prisma.notification.delete({
     *   where: {
     *     // ... filter to delete one Notification
     *   }
     * })
     * 
     */
    delete<T extends NotificationDeleteArgs>(args: SelectSubset<T, NotificationDeleteArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Notification.
     * @param {NotificationUpdateArgs} args - Arguments to update one Notification.
     * @example
     * // Update one Notification
     * const notification = await prisma.notification.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends NotificationUpdateArgs>(args: SelectSubset<T, NotificationUpdateArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Notifications.
     * @param {NotificationDeleteManyArgs} args - Arguments to filter Notifications to delete.
     * @example
     * // Delete a few Notifications
     * const { count } = await prisma.notification.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends NotificationDeleteManyArgs>(args?: SelectSubset<T, NotificationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Notifications.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Notifications
     * const notification = await prisma.notification.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends NotificationUpdateManyArgs>(args: SelectSubset<T, NotificationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Notifications and returns the data updated in the database.
     * @param {NotificationUpdateManyAndReturnArgs} args - Arguments to update many Notifications.
     * @example
     * // Update many Notifications
     * const notification = await prisma.notification.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Notifications and only return the `id`
     * const notificationWithIdOnly = await prisma.notification.updateManyAndReturn({
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
    updateManyAndReturn<T extends NotificationUpdateManyAndReturnArgs>(args: SelectSubset<T, NotificationUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Notification.
     * @param {NotificationUpsertArgs} args - Arguments to update or create a Notification.
     * @example
     * // Update or create a Notification
     * const notification = await prisma.notification.upsert({
     *   create: {
     *     // ... data to create a Notification
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Notification we want to update
     *   }
     * })
     */
    upsert<T extends NotificationUpsertArgs>(args: SelectSubset<T, NotificationUpsertArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Notifications.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationCountArgs} args - Arguments to filter Notifications to count.
     * @example
     * // Count the number of Notifications
     * const count = await prisma.notification.count({
     *   where: {
     *     // ... the filter for the Notifications we want to count
     *   }
     * })
    **/
    count<T extends NotificationCountArgs>(
      args?: Subset<T, NotificationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], NotificationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Notification.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends NotificationAggregateArgs>(args: Subset<T, NotificationAggregateArgs>): Prisma.PrismaPromise<GetNotificationAggregateType<T>>

    /**
     * Group by Notification.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationGroupByArgs} args - Group by arguments.
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
      T extends NotificationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: NotificationGroupByArgs['orderBy'] }
        : { orderBy?: NotificationGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, NotificationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetNotificationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Notification model
   */
  readonly fields: NotificationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Notification.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__NotificationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    deliveries<T extends Notification$deliveriesArgs<ExtArgs> = {}>(args?: Subset<T, Notification$deliveriesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NotificationDeliveryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the Notification model
   */
  interface NotificationFieldRefs {
    readonly id: FieldRef<"Notification", 'String'>
    readonly tenantId: FieldRef<"Notification", 'String'>
    readonly userId: FieldRef<"Notification", 'String'>
    readonly type: FieldRef<"Notification", 'NotificationType'>
    readonly title: FieldRef<"Notification", 'String'>
    readonly body: FieldRef<"Notification", 'String'>
    readonly link: FieldRef<"Notification", 'String'>
    readonly readAt: FieldRef<"Notification", 'DateTime'>
    readonly metadata: FieldRef<"Notification", 'Json'>
    readonly channels: FieldRef<"Notification", 'String[]'>
    readonly createdAt: FieldRef<"Notification", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Notification findUnique
   */
  export type NotificationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * Filter, which Notification to fetch.
     */
    where: NotificationWhereUniqueInput
  }

  /**
   * Notification findUniqueOrThrow
   */
  export type NotificationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * Filter, which Notification to fetch.
     */
    where: NotificationWhereUniqueInput
  }

  /**
   * Notification findFirst
   */
  export type NotificationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * Filter, which Notification to fetch.
     */
    where?: NotificationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Notifications to fetch.
     */
    orderBy?: NotificationOrderByWithRelationInput | NotificationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Notifications.
     */
    cursor?: NotificationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Notifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Notifications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Notifications.
     */
    distinct?: NotificationScalarFieldEnum | NotificationScalarFieldEnum[]
  }

  /**
   * Notification findFirstOrThrow
   */
  export type NotificationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * Filter, which Notification to fetch.
     */
    where?: NotificationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Notifications to fetch.
     */
    orderBy?: NotificationOrderByWithRelationInput | NotificationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Notifications.
     */
    cursor?: NotificationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Notifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Notifications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Notifications.
     */
    distinct?: NotificationScalarFieldEnum | NotificationScalarFieldEnum[]
  }

  /**
   * Notification findMany
   */
  export type NotificationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * Filter, which Notifications to fetch.
     */
    where?: NotificationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Notifications to fetch.
     */
    orderBy?: NotificationOrderByWithRelationInput | NotificationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Notifications.
     */
    cursor?: NotificationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Notifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Notifications.
     */
    skip?: number
    distinct?: NotificationScalarFieldEnum | NotificationScalarFieldEnum[]
  }

  /**
   * Notification create
   */
  export type NotificationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * The data needed to create a Notification.
     */
    data: XOR<NotificationCreateInput, NotificationUncheckedCreateInput>
  }

  /**
   * Notification createMany
   */
  export type NotificationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Notifications.
     */
    data: NotificationCreateManyInput | NotificationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Notification createManyAndReturn
   */
  export type NotificationCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * The data used to create many Notifications.
     */
    data: NotificationCreateManyInput | NotificationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Notification update
   */
  export type NotificationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * The data needed to update a Notification.
     */
    data: XOR<NotificationUpdateInput, NotificationUncheckedUpdateInput>
    /**
     * Choose, which Notification to update.
     */
    where: NotificationWhereUniqueInput
  }

  /**
   * Notification updateMany
   */
  export type NotificationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Notifications.
     */
    data: XOR<NotificationUpdateManyMutationInput, NotificationUncheckedUpdateManyInput>
    /**
     * Filter which Notifications to update
     */
    where?: NotificationWhereInput
    /**
     * Limit how many Notifications to update.
     */
    limit?: number
  }

  /**
   * Notification updateManyAndReturn
   */
  export type NotificationUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * The data used to update Notifications.
     */
    data: XOR<NotificationUpdateManyMutationInput, NotificationUncheckedUpdateManyInput>
    /**
     * Filter which Notifications to update
     */
    where?: NotificationWhereInput
    /**
     * Limit how many Notifications to update.
     */
    limit?: number
  }

  /**
   * Notification upsert
   */
  export type NotificationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * The filter to search for the Notification to update in case it exists.
     */
    where: NotificationWhereUniqueInput
    /**
     * In case the Notification found by the `where` argument doesn't exist, create a new Notification with this data.
     */
    create: XOR<NotificationCreateInput, NotificationUncheckedCreateInput>
    /**
     * In case the Notification was found with the provided `where` argument, update it with this data.
     */
    update: XOR<NotificationUpdateInput, NotificationUncheckedUpdateInput>
  }

  /**
   * Notification delete
   */
  export type NotificationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * Filter which Notification to delete.
     */
    where: NotificationWhereUniqueInput
  }

  /**
   * Notification deleteMany
   */
  export type NotificationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Notifications to delete
     */
    where?: NotificationWhereInput
    /**
     * Limit how many Notifications to delete.
     */
    limit?: number
  }

  /**
   * Notification.deliveries
   */
  export type Notification$deliveriesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NotificationDelivery
     */
    select?: NotificationDeliverySelect<ExtArgs> | null
    /**
     * Omit specific fields from the NotificationDelivery
     */
    omit?: NotificationDeliveryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationDeliveryInclude<ExtArgs> | null
    where?: NotificationDeliveryWhereInput
    orderBy?: NotificationDeliveryOrderByWithRelationInput | NotificationDeliveryOrderByWithRelationInput[]
    cursor?: NotificationDeliveryWhereUniqueInput
    take?: number
    skip?: number
    distinct?: NotificationDeliveryScalarFieldEnum | NotificationDeliveryScalarFieldEnum[]
  }

  /**
   * Notification without action
   */
  export type NotificationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
  }


  /**
   * Model NotificationDelivery
   */

  export type AggregateNotificationDelivery = {
    _count: NotificationDeliveryCountAggregateOutputType | null
    _avg: NotificationDeliveryAvgAggregateOutputType | null
    _sum: NotificationDeliverySumAggregateOutputType | null
    _min: NotificationDeliveryMinAggregateOutputType | null
    _max: NotificationDeliveryMaxAggregateOutputType | null
  }

  export type NotificationDeliveryAvgAggregateOutputType = {
    attemptCount: number | null
  }

  export type NotificationDeliverySumAggregateOutputType = {
    attemptCount: number | null
  }

  export type NotificationDeliveryMinAggregateOutputType = {
    id: string | null
    notificationId: string | null
    tenantId: string | null
    channel: $Enums.DeliveryChannel | null
    status: $Enums.DeliveryStatus | null
    recipient: string | null
    attemptCount: number | null
    lastError: string | null
    sentAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type NotificationDeliveryMaxAggregateOutputType = {
    id: string | null
    notificationId: string | null
    tenantId: string | null
    channel: $Enums.DeliveryChannel | null
    status: $Enums.DeliveryStatus | null
    recipient: string | null
    attemptCount: number | null
    lastError: string | null
    sentAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type NotificationDeliveryCountAggregateOutputType = {
    id: number
    notificationId: number
    tenantId: number
    channel: number
    status: number
    recipient: number
    attemptCount: number
    lastError: number
    sentAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type NotificationDeliveryAvgAggregateInputType = {
    attemptCount?: true
  }

  export type NotificationDeliverySumAggregateInputType = {
    attemptCount?: true
  }

  export type NotificationDeliveryMinAggregateInputType = {
    id?: true
    notificationId?: true
    tenantId?: true
    channel?: true
    status?: true
    recipient?: true
    attemptCount?: true
    lastError?: true
    sentAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type NotificationDeliveryMaxAggregateInputType = {
    id?: true
    notificationId?: true
    tenantId?: true
    channel?: true
    status?: true
    recipient?: true
    attemptCount?: true
    lastError?: true
    sentAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type NotificationDeliveryCountAggregateInputType = {
    id?: true
    notificationId?: true
    tenantId?: true
    channel?: true
    status?: true
    recipient?: true
    attemptCount?: true
    lastError?: true
    sentAt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type NotificationDeliveryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which NotificationDelivery to aggregate.
     */
    where?: NotificationDeliveryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of NotificationDeliveries to fetch.
     */
    orderBy?: NotificationDeliveryOrderByWithRelationInput | NotificationDeliveryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: NotificationDeliveryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` NotificationDeliveries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` NotificationDeliveries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned NotificationDeliveries
    **/
    _count?: true | NotificationDeliveryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: NotificationDeliveryAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: NotificationDeliverySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: NotificationDeliveryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: NotificationDeliveryMaxAggregateInputType
  }

  export type GetNotificationDeliveryAggregateType<T extends NotificationDeliveryAggregateArgs> = {
        [P in keyof T & keyof AggregateNotificationDelivery]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateNotificationDelivery[P]>
      : GetScalarType<T[P], AggregateNotificationDelivery[P]>
  }




  export type NotificationDeliveryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: NotificationDeliveryWhereInput
    orderBy?: NotificationDeliveryOrderByWithAggregationInput | NotificationDeliveryOrderByWithAggregationInput[]
    by: NotificationDeliveryScalarFieldEnum[] | NotificationDeliveryScalarFieldEnum
    having?: NotificationDeliveryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: NotificationDeliveryCountAggregateInputType | true
    _avg?: NotificationDeliveryAvgAggregateInputType
    _sum?: NotificationDeliverySumAggregateInputType
    _min?: NotificationDeliveryMinAggregateInputType
    _max?: NotificationDeliveryMaxAggregateInputType
  }

  export type NotificationDeliveryGroupByOutputType = {
    id: string
    notificationId: string
    tenantId: string | null
    channel: $Enums.DeliveryChannel
    status: $Enums.DeliveryStatus
    recipient: string
    attemptCount: number
    lastError: string | null
    sentAt: Date | null
    createdAt: Date
    updatedAt: Date
    _count: NotificationDeliveryCountAggregateOutputType | null
    _avg: NotificationDeliveryAvgAggregateOutputType | null
    _sum: NotificationDeliverySumAggregateOutputType | null
    _min: NotificationDeliveryMinAggregateOutputType | null
    _max: NotificationDeliveryMaxAggregateOutputType | null
  }

  type GetNotificationDeliveryGroupByPayload<T extends NotificationDeliveryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<NotificationDeliveryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof NotificationDeliveryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], NotificationDeliveryGroupByOutputType[P]>
            : GetScalarType<T[P], NotificationDeliveryGroupByOutputType[P]>
        }
      >
    >


  export type NotificationDeliverySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    notificationId?: boolean
    tenantId?: boolean
    channel?: boolean
    status?: boolean
    recipient?: boolean
    attemptCount?: boolean
    lastError?: boolean
    sentAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    notification?: boolean | NotificationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["notificationDelivery"]>

  export type NotificationDeliverySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    notificationId?: boolean
    tenantId?: boolean
    channel?: boolean
    status?: boolean
    recipient?: boolean
    attemptCount?: boolean
    lastError?: boolean
    sentAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    notification?: boolean | NotificationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["notificationDelivery"]>

  export type NotificationDeliverySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    notificationId?: boolean
    tenantId?: boolean
    channel?: boolean
    status?: boolean
    recipient?: boolean
    attemptCount?: boolean
    lastError?: boolean
    sentAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    notification?: boolean | NotificationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["notificationDelivery"]>

  export type NotificationDeliverySelectScalar = {
    id?: boolean
    notificationId?: boolean
    tenantId?: boolean
    channel?: boolean
    status?: boolean
    recipient?: boolean
    attemptCount?: boolean
    lastError?: boolean
    sentAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type NotificationDeliveryOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "notificationId" | "tenantId" | "channel" | "status" | "recipient" | "attemptCount" | "lastError" | "sentAt" | "createdAt" | "updatedAt", ExtArgs["result"]["notificationDelivery"]>
  export type NotificationDeliveryInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    notification?: boolean | NotificationDefaultArgs<ExtArgs>
  }
  export type NotificationDeliveryIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    notification?: boolean | NotificationDefaultArgs<ExtArgs>
  }
  export type NotificationDeliveryIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    notification?: boolean | NotificationDefaultArgs<ExtArgs>
  }

  export type $NotificationDeliveryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "NotificationDelivery"
    objects: {
      notification: Prisma.$NotificationPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      notificationId: string
      tenantId: string | null
      channel: $Enums.DeliveryChannel
      status: $Enums.DeliveryStatus
      recipient: string
      attemptCount: number
      lastError: string | null
      sentAt: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["notificationDelivery"]>
    composites: {}
  }

  type NotificationDeliveryGetPayload<S extends boolean | null | undefined | NotificationDeliveryDefaultArgs> = $Result.GetResult<Prisma.$NotificationDeliveryPayload, S>

  type NotificationDeliveryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<NotificationDeliveryFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: NotificationDeliveryCountAggregateInputType | true
    }

  export interface NotificationDeliveryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['NotificationDelivery'], meta: { name: 'NotificationDelivery' } }
    /**
     * Find zero or one NotificationDelivery that matches the filter.
     * @param {NotificationDeliveryFindUniqueArgs} args - Arguments to find a NotificationDelivery
     * @example
     * // Get one NotificationDelivery
     * const notificationDelivery = await prisma.notificationDelivery.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends NotificationDeliveryFindUniqueArgs>(args: SelectSubset<T, NotificationDeliveryFindUniqueArgs<ExtArgs>>): Prisma__NotificationDeliveryClient<$Result.GetResult<Prisma.$NotificationDeliveryPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one NotificationDelivery that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {NotificationDeliveryFindUniqueOrThrowArgs} args - Arguments to find a NotificationDelivery
     * @example
     * // Get one NotificationDelivery
     * const notificationDelivery = await prisma.notificationDelivery.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends NotificationDeliveryFindUniqueOrThrowArgs>(args: SelectSubset<T, NotificationDeliveryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__NotificationDeliveryClient<$Result.GetResult<Prisma.$NotificationDeliveryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first NotificationDelivery that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationDeliveryFindFirstArgs} args - Arguments to find a NotificationDelivery
     * @example
     * // Get one NotificationDelivery
     * const notificationDelivery = await prisma.notificationDelivery.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends NotificationDeliveryFindFirstArgs>(args?: SelectSubset<T, NotificationDeliveryFindFirstArgs<ExtArgs>>): Prisma__NotificationDeliveryClient<$Result.GetResult<Prisma.$NotificationDeliveryPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first NotificationDelivery that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationDeliveryFindFirstOrThrowArgs} args - Arguments to find a NotificationDelivery
     * @example
     * // Get one NotificationDelivery
     * const notificationDelivery = await prisma.notificationDelivery.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends NotificationDeliveryFindFirstOrThrowArgs>(args?: SelectSubset<T, NotificationDeliveryFindFirstOrThrowArgs<ExtArgs>>): Prisma__NotificationDeliveryClient<$Result.GetResult<Prisma.$NotificationDeliveryPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more NotificationDeliveries that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationDeliveryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all NotificationDeliveries
     * const notificationDeliveries = await prisma.notificationDelivery.findMany()
     * 
     * // Get first 10 NotificationDeliveries
     * const notificationDeliveries = await prisma.notificationDelivery.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const notificationDeliveryWithIdOnly = await prisma.notificationDelivery.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends NotificationDeliveryFindManyArgs>(args?: SelectSubset<T, NotificationDeliveryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NotificationDeliveryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a NotificationDelivery.
     * @param {NotificationDeliveryCreateArgs} args - Arguments to create a NotificationDelivery.
     * @example
     * // Create one NotificationDelivery
     * const NotificationDelivery = await prisma.notificationDelivery.create({
     *   data: {
     *     // ... data to create a NotificationDelivery
     *   }
     * })
     * 
     */
    create<T extends NotificationDeliveryCreateArgs>(args: SelectSubset<T, NotificationDeliveryCreateArgs<ExtArgs>>): Prisma__NotificationDeliveryClient<$Result.GetResult<Prisma.$NotificationDeliveryPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many NotificationDeliveries.
     * @param {NotificationDeliveryCreateManyArgs} args - Arguments to create many NotificationDeliveries.
     * @example
     * // Create many NotificationDeliveries
     * const notificationDelivery = await prisma.notificationDelivery.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends NotificationDeliveryCreateManyArgs>(args?: SelectSubset<T, NotificationDeliveryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many NotificationDeliveries and returns the data saved in the database.
     * @param {NotificationDeliveryCreateManyAndReturnArgs} args - Arguments to create many NotificationDeliveries.
     * @example
     * // Create many NotificationDeliveries
     * const notificationDelivery = await prisma.notificationDelivery.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many NotificationDeliveries and only return the `id`
     * const notificationDeliveryWithIdOnly = await prisma.notificationDelivery.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends NotificationDeliveryCreateManyAndReturnArgs>(args?: SelectSubset<T, NotificationDeliveryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NotificationDeliveryPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a NotificationDelivery.
     * @param {NotificationDeliveryDeleteArgs} args - Arguments to delete one NotificationDelivery.
     * @example
     * // Delete one NotificationDelivery
     * const NotificationDelivery = await prisma.notificationDelivery.delete({
     *   where: {
     *     // ... filter to delete one NotificationDelivery
     *   }
     * })
     * 
     */
    delete<T extends NotificationDeliveryDeleteArgs>(args: SelectSubset<T, NotificationDeliveryDeleteArgs<ExtArgs>>): Prisma__NotificationDeliveryClient<$Result.GetResult<Prisma.$NotificationDeliveryPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one NotificationDelivery.
     * @param {NotificationDeliveryUpdateArgs} args - Arguments to update one NotificationDelivery.
     * @example
     * // Update one NotificationDelivery
     * const notificationDelivery = await prisma.notificationDelivery.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends NotificationDeliveryUpdateArgs>(args: SelectSubset<T, NotificationDeliveryUpdateArgs<ExtArgs>>): Prisma__NotificationDeliveryClient<$Result.GetResult<Prisma.$NotificationDeliveryPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more NotificationDeliveries.
     * @param {NotificationDeliveryDeleteManyArgs} args - Arguments to filter NotificationDeliveries to delete.
     * @example
     * // Delete a few NotificationDeliveries
     * const { count } = await prisma.notificationDelivery.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends NotificationDeliveryDeleteManyArgs>(args?: SelectSubset<T, NotificationDeliveryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more NotificationDeliveries.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationDeliveryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many NotificationDeliveries
     * const notificationDelivery = await prisma.notificationDelivery.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends NotificationDeliveryUpdateManyArgs>(args: SelectSubset<T, NotificationDeliveryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more NotificationDeliveries and returns the data updated in the database.
     * @param {NotificationDeliveryUpdateManyAndReturnArgs} args - Arguments to update many NotificationDeliveries.
     * @example
     * // Update many NotificationDeliveries
     * const notificationDelivery = await prisma.notificationDelivery.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more NotificationDeliveries and only return the `id`
     * const notificationDeliveryWithIdOnly = await prisma.notificationDelivery.updateManyAndReturn({
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
    updateManyAndReturn<T extends NotificationDeliveryUpdateManyAndReturnArgs>(args: SelectSubset<T, NotificationDeliveryUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NotificationDeliveryPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one NotificationDelivery.
     * @param {NotificationDeliveryUpsertArgs} args - Arguments to update or create a NotificationDelivery.
     * @example
     * // Update or create a NotificationDelivery
     * const notificationDelivery = await prisma.notificationDelivery.upsert({
     *   create: {
     *     // ... data to create a NotificationDelivery
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the NotificationDelivery we want to update
     *   }
     * })
     */
    upsert<T extends NotificationDeliveryUpsertArgs>(args: SelectSubset<T, NotificationDeliveryUpsertArgs<ExtArgs>>): Prisma__NotificationDeliveryClient<$Result.GetResult<Prisma.$NotificationDeliveryPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of NotificationDeliveries.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationDeliveryCountArgs} args - Arguments to filter NotificationDeliveries to count.
     * @example
     * // Count the number of NotificationDeliveries
     * const count = await prisma.notificationDelivery.count({
     *   where: {
     *     // ... the filter for the NotificationDeliveries we want to count
     *   }
     * })
    **/
    count<T extends NotificationDeliveryCountArgs>(
      args?: Subset<T, NotificationDeliveryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], NotificationDeliveryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a NotificationDelivery.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationDeliveryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends NotificationDeliveryAggregateArgs>(args: Subset<T, NotificationDeliveryAggregateArgs>): Prisma.PrismaPromise<GetNotificationDeliveryAggregateType<T>>

    /**
     * Group by NotificationDelivery.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationDeliveryGroupByArgs} args - Group by arguments.
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
      T extends NotificationDeliveryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: NotificationDeliveryGroupByArgs['orderBy'] }
        : { orderBy?: NotificationDeliveryGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, NotificationDeliveryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetNotificationDeliveryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the NotificationDelivery model
   */
  readonly fields: NotificationDeliveryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for NotificationDelivery.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__NotificationDeliveryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    notification<T extends NotificationDefaultArgs<ExtArgs> = {}>(args?: Subset<T, NotificationDefaultArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the NotificationDelivery model
   */
  interface NotificationDeliveryFieldRefs {
    readonly id: FieldRef<"NotificationDelivery", 'String'>
    readonly notificationId: FieldRef<"NotificationDelivery", 'String'>
    readonly tenantId: FieldRef<"NotificationDelivery", 'String'>
    readonly channel: FieldRef<"NotificationDelivery", 'DeliveryChannel'>
    readonly status: FieldRef<"NotificationDelivery", 'DeliveryStatus'>
    readonly recipient: FieldRef<"NotificationDelivery", 'String'>
    readonly attemptCount: FieldRef<"NotificationDelivery", 'Int'>
    readonly lastError: FieldRef<"NotificationDelivery", 'String'>
    readonly sentAt: FieldRef<"NotificationDelivery", 'DateTime'>
    readonly createdAt: FieldRef<"NotificationDelivery", 'DateTime'>
    readonly updatedAt: FieldRef<"NotificationDelivery", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * NotificationDelivery findUnique
   */
  export type NotificationDeliveryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NotificationDelivery
     */
    select?: NotificationDeliverySelect<ExtArgs> | null
    /**
     * Omit specific fields from the NotificationDelivery
     */
    omit?: NotificationDeliveryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationDeliveryInclude<ExtArgs> | null
    /**
     * Filter, which NotificationDelivery to fetch.
     */
    where: NotificationDeliveryWhereUniqueInput
  }

  /**
   * NotificationDelivery findUniqueOrThrow
   */
  export type NotificationDeliveryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NotificationDelivery
     */
    select?: NotificationDeliverySelect<ExtArgs> | null
    /**
     * Omit specific fields from the NotificationDelivery
     */
    omit?: NotificationDeliveryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationDeliveryInclude<ExtArgs> | null
    /**
     * Filter, which NotificationDelivery to fetch.
     */
    where: NotificationDeliveryWhereUniqueInput
  }

  /**
   * NotificationDelivery findFirst
   */
  export type NotificationDeliveryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NotificationDelivery
     */
    select?: NotificationDeliverySelect<ExtArgs> | null
    /**
     * Omit specific fields from the NotificationDelivery
     */
    omit?: NotificationDeliveryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationDeliveryInclude<ExtArgs> | null
    /**
     * Filter, which NotificationDelivery to fetch.
     */
    where?: NotificationDeliveryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of NotificationDeliveries to fetch.
     */
    orderBy?: NotificationDeliveryOrderByWithRelationInput | NotificationDeliveryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for NotificationDeliveries.
     */
    cursor?: NotificationDeliveryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` NotificationDeliveries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` NotificationDeliveries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of NotificationDeliveries.
     */
    distinct?: NotificationDeliveryScalarFieldEnum | NotificationDeliveryScalarFieldEnum[]
  }

  /**
   * NotificationDelivery findFirstOrThrow
   */
  export type NotificationDeliveryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NotificationDelivery
     */
    select?: NotificationDeliverySelect<ExtArgs> | null
    /**
     * Omit specific fields from the NotificationDelivery
     */
    omit?: NotificationDeliveryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationDeliveryInclude<ExtArgs> | null
    /**
     * Filter, which NotificationDelivery to fetch.
     */
    where?: NotificationDeliveryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of NotificationDeliveries to fetch.
     */
    orderBy?: NotificationDeliveryOrderByWithRelationInput | NotificationDeliveryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for NotificationDeliveries.
     */
    cursor?: NotificationDeliveryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` NotificationDeliveries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` NotificationDeliveries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of NotificationDeliveries.
     */
    distinct?: NotificationDeliveryScalarFieldEnum | NotificationDeliveryScalarFieldEnum[]
  }

  /**
   * NotificationDelivery findMany
   */
  export type NotificationDeliveryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NotificationDelivery
     */
    select?: NotificationDeliverySelect<ExtArgs> | null
    /**
     * Omit specific fields from the NotificationDelivery
     */
    omit?: NotificationDeliveryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationDeliveryInclude<ExtArgs> | null
    /**
     * Filter, which NotificationDeliveries to fetch.
     */
    where?: NotificationDeliveryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of NotificationDeliveries to fetch.
     */
    orderBy?: NotificationDeliveryOrderByWithRelationInput | NotificationDeliveryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing NotificationDeliveries.
     */
    cursor?: NotificationDeliveryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` NotificationDeliveries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` NotificationDeliveries.
     */
    skip?: number
    distinct?: NotificationDeliveryScalarFieldEnum | NotificationDeliveryScalarFieldEnum[]
  }

  /**
   * NotificationDelivery create
   */
  export type NotificationDeliveryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NotificationDelivery
     */
    select?: NotificationDeliverySelect<ExtArgs> | null
    /**
     * Omit specific fields from the NotificationDelivery
     */
    omit?: NotificationDeliveryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationDeliveryInclude<ExtArgs> | null
    /**
     * The data needed to create a NotificationDelivery.
     */
    data: XOR<NotificationDeliveryCreateInput, NotificationDeliveryUncheckedCreateInput>
  }

  /**
   * NotificationDelivery createMany
   */
  export type NotificationDeliveryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many NotificationDeliveries.
     */
    data: NotificationDeliveryCreateManyInput | NotificationDeliveryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * NotificationDelivery createManyAndReturn
   */
  export type NotificationDeliveryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NotificationDelivery
     */
    select?: NotificationDeliverySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the NotificationDelivery
     */
    omit?: NotificationDeliveryOmit<ExtArgs> | null
    /**
     * The data used to create many NotificationDeliveries.
     */
    data: NotificationDeliveryCreateManyInput | NotificationDeliveryCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationDeliveryIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * NotificationDelivery update
   */
  export type NotificationDeliveryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NotificationDelivery
     */
    select?: NotificationDeliverySelect<ExtArgs> | null
    /**
     * Omit specific fields from the NotificationDelivery
     */
    omit?: NotificationDeliveryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationDeliveryInclude<ExtArgs> | null
    /**
     * The data needed to update a NotificationDelivery.
     */
    data: XOR<NotificationDeliveryUpdateInput, NotificationDeliveryUncheckedUpdateInput>
    /**
     * Choose, which NotificationDelivery to update.
     */
    where: NotificationDeliveryWhereUniqueInput
  }

  /**
   * NotificationDelivery updateMany
   */
  export type NotificationDeliveryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update NotificationDeliveries.
     */
    data: XOR<NotificationDeliveryUpdateManyMutationInput, NotificationDeliveryUncheckedUpdateManyInput>
    /**
     * Filter which NotificationDeliveries to update
     */
    where?: NotificationDeliveryWhereInput
    /**
     * Limit how many NotificationDeliveries to update.
     */
    limit?: number
  }

  /**
   * NotificationDelivery updateManyAndReturn
   */
  export type NotificationDeliveryUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NotificationDelivery
     */
    select?: NotificationDeliverySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the NotificationDelivery
     */
    omit?: NotificationDeliveryOmit<ExtArgs> | null
    /**
     * The data used to update NotificationDeliveries.
     */
    data: XOR<NotificationDeliveryUpdateManyMutationInput, NotificationDeliveryUncheckedUpdateManyInput>
    /**
     * Filter which NotificationDeliveries to update
     */
    where?: NotificationDeliveryWhereInput
    /**
     * Limit how many NotificationDeliveries to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationDeliveryIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * NotificationDelivery upsert
   */
  export type NotificationDeliveryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NotificationDelivery
     */
    select?: NotificationDeliverySelect<ExtArgs> | null
    /**
     * Omit specific fields from the NotificationDelivery
     */
    omit?: NotificationDeliveryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationDeliveryInclude<ExtArgs> | null
    /**
     * The filter to search for the NotificationDelivery to update in case it exists.
     */
    where: NotificationDeliveryWhereUniqueInput
    /**
     * In case the NotificationDelivery found by the `where` argument doesn't exist, create a new NotificationDelivery with this data.
     */
    create: XOR<NotificationDeliveryCreateInput, NotificationDeliveryUncheckedCreateInput>
    /**
     * In case the NotificationDelivery was found with the provided `where` argument, update it with this data.
     */
    update: XOR<NotificationDeliveryUpdateInput, NotificationDeliveryUncheckedUpdateInput>
  }

  /**
   * NotificationDelivery delete
   */
  export type NotificationDeliveryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NotificationDelivery
     */
    select?: NotificationDeliverySelect<ExtArgs> | null
    /**
     * Omit specific fields from the NotificationDelivery
     */
    omit?: NotificationDeliveryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationDeliveryInclude<ExtArgs> | null
    /**
     * Filter which NotificationDelivery to delete.
     */
    where: NotificationDeliveryWhereUniqueInput
  }

  /**
   * NotificationDelivery deleteMany
   */
  export type NotificationDeliveryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which NotificationDeliveries to delete
     */
    where?: NotificationDeliveryWhereInput
    /**
     * Limit how many NotificationDeliveries to delete.
     */
    limit?: number
  }

  /**
   * NotificationDelivery without action
   */
  export type NotificationDeliveryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NotificationDelivery
     */
    select?: NotificationDeliverySelect<ExtArgs> | null
    /**
     * Omit specific fields from the NotificationDelivery
     */
    omit?: NotificationDeliveryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationDeliveryInclude<ExtArgs> | null
  }


  /**
   * Model TenantIntegration
   */

  export type AggregateTenantIntegration = {
    _count: TenantIntegrationCountAggregateOutputType | null
    _min: TenantIntegrationMinAggregateOutputType | null
    _max: TenantIntegrationMaxAggregateOutputType | null
  }

  export type TenantIntegrationMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    kind: string | null
    enabled: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TenantIntegrationMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    kind: string | null
    enabled: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TenantIntegrationCountAggregateOutputType = {
    id: number
    tenantId: number
    kind: number
    config: number
    enabled: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type TenantIntegrationMinAggregateInputType = {
    id?: true
    tenantId?: true
    kind?: true
    enabled?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TenantIntegrationMaxAggregateInputType = {
    id?: true
    tenantId?: true
    kind?: true
    enabled?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TenantIntegrationCountAggregateInputType = {
    id?: true
    tenantId?: true
    kind?: true
    config?: true
    enabled?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type TenantIntegrationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TenantIntegration to aggregate.
     */
    where?: TenantIntegrationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantIntegrations to fetch.
     */
    orderBy?: TenantIntegrationOrderByWithRelationInput | TenantIntegrationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TenantIntegrationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantIntegrations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantIntegrations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TenantIntegrations
    **/
    _count?: true | TenantIntegrationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TenantIntegrationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TenantIntegrationMaxAggregateInputType
  }

  export type GetTenantIntegrationAggregateType<T extends TenantIntegrationAggregateArgs> = {
        [P in keyof T & keyof AggregateTenantIntegration]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTenantIntegration[P]>
      : GetScalarType<T[P], AggregateTenantIntegration[P]>
  }




  export type TenantIntegrationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TenantIntegrationWhereInput
    orderBy?: TenantIntegrationOrderByWithAggregationInput | TenantIntegrationOrderByWithAggregationInput[]
    by: TenantIntegrationScalarFieldEnum[] | TenantIntegrationScalarFieldEnum
    having?: TenantIntegrationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TenantIntegrationCountAggregateInputType | true
    _min?: TenantIntegrationMinAggregateInputType
    _max?: TenantIntegrationMaxAggregateInputType
  }

  export type TenantIntegrationGroupByOutputType = {
    id: string
    tenantId: string
    kind: string
    config: JsonValue
    enabled: boolean
    createdAt: Date
    updatedAt: Date
    _count: TenantIntegrationCountAggregateOutputType | null
    _min: TenantIntegrationMinAggregateOutputType | null
    _max: TenantIntegrationMaxAggregateOutputType | null
  }

  type GetTenantIntegrationGroupByPayload<T extends TenantIntegrationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TenantIntegrationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TenantIntegrationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TenantIntegrationGroupByOutputType[P]>
            : GetScalarType<T[P], TenantIntegrationGroupByOutputType[P]>
        }
      >
    >


  export type TenantIntegrationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    kind?: boolean
    config?: boolean
    enabled?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["tenantIntegration"]>

  export type TenantIntegrationSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    kind?: boolean
    config?: boolean
    enabled?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["tenantIntegration"]>

  export type TenantIntegrationSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    kind?: boolean
    config?: boolean
    enabled?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["tenantIntegration"]>

  export type TenantIntegrationSelectScalar = {
    id?: boolean
    tenantId?: boolean
    kind?: boolean
    config?: boolean
    enabled?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type TenantIntegrationOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "kind" | "config" | "enabled" | "createdAt" | "updatedAt", ExtArgs["result"]["tenantIntegration"]>

  export type $TenantIntegrationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TenantIntegration"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      kind: string
      config: Prisma.JsonValue
      enabled: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["tenantIntegration"]>
    composites: {}
  }

  type TenantIntegrationGetPayload<S extends boolean | null | undefined | TenantIntegrationDefaultArgs> = $Result.GetResult<Prisma.$TenantIntegrationPayload, S>

  type TenantIntegrationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TenantIntegrationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TenantIntegrationCountAggregateInputType | true
    }

  export interface TenantIntegrationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TenantIntegration'], meta: { name: 'TenantIntegration' } }
    /**
     * Find zero or one TenantIntegration that matches the filter.
     * @param {TenantIntegrationFindUniqueArgs} args - Arguments to find a TenantIntegration
     * @example
     * // Get one TenantIntegration
     * const tenantIntegration = await prisma.tenantIntegration.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TenantIntegrationFindUniqueArgs>(args: SelectSubset<T, TenantIntegrationFindUniqueArgs<ExtArgs>>): Prisma__TenantIntegrationClient<$Result.GetResult<Prisma.$TenantIntegrationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one TenantIntegration that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TenantIntegrationFindUniqueOrThrowArgs} args - Arguments to find a TenantIntegration
     * @example
     * // Get one TenantIntegration
     * const tenantIntegration = await prisma.tenantIntegration.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TenantIntegrationFindUniqueOrThrowArgs>(args: SelectSubset<T, TenantIntegrationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TenantIntegrationClient<$Result.GetResult<Prisma.$TenantIntegrationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TenantIntegration that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantIntegrationFindFirstArgs} args - Arguments to find a TenantIntegration
     * @example
     * // Get one TenantIntegration
     * const tenantIntegration = await prisma.tenantIntegration.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TenantIntegrationFindFirstArgs>(args?: SelectSubset<T, TenantIntegrationFindFirstArgs<ExtArgs>>): Prisma__TenantIntegrationClient<$Result.GetResult<Prisma.$TenantIntegrationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TenantIntegration that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantIntegrationFindFirstOrThrowArgs} args - Arguments to find a TenantIntegration
     * @example
     * // Get one TenantIntegration
     * const tenantIntegration = await prisma.tenantIntegration.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TenantIntegrationFindFirstOrThrowArgs>(args?: SelectSubset<T, TenantIntegrationFindFirstOrThrowArgs<ExtArgs>>): Prisma__TenantIntegrationClient<$Result.GetResult<Prisma.$TenantIntegrationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more TenantIntegrations that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantIntegrationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TenantIntegrations
     * const tenantIntegrations = await prisma.tenantIntegration.findMany()
     * 
     * // Get first 10 TenantIntegrations
     * const tenantIntegrations = await prisma.tenantIntegration.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tenantIntegrationWithIdOnly = await prisma.tenantIntegration.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TenantIntegrationFindManyArgs>(args?: SelectSubset<T, TenantIntegrationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantIntegrationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a TenantIntegration.
     * @param {TenantIntegrationCreateArgs} args - Arguments to create a TenantIntegration.
     * @example
     * // Create one TenantIntegration
     * const TenantIntegration = await prisma.tenantIntegration.create({
     *   data: {
     *     // ... data to create a TenantIntegration
     *   }
     * })
     * 
     */
    create<T extends TenantIntegrationCreateArgs>(args: SelectSubset<T, TenantIntegrationCreateArgs<ExtArgs>>): Prisma__TenantIntegrationClient<$Result.GetResult<Prisma.$TenantIntegrationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many TenantIntegrations.
     * @param {TenantIntegrationCreateManyArgs} args - Arguments to create many TenantIntegrations.
     * @example
     * // Create many TenantIntegrations
     * const tenantIntegration = await prisma.tenantIntegration.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TenantIntegrationCreateManyArgs>(args?: SelectSubset<T, TenantIntegrationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TenantIntegrations and returns the data saved in the database.
     * @param {TenantIntegrationCreateManyAndReturnArgs} args - Arguments to create many TenantIntegrations.
     * @example
     * // Create many TenantIntegrations
     * const tenantIntegration = await prisma.tenantIntegration.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TenantIntegrations and only return the `id`
     * const tenantIntegrationWithIdOnly = await prisma.tenantIntegration.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TenantIntegrationCreateManyAndReturnArgs>(args?: SelectSubset<T, TenantIntegrationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantIntegrationPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a TenantIntegration.
     * @param {TenantIntegrationDeleteArgs} args - Arguments to delete one TenantIntegration.
     * @example
     * // Delete one TenantIntegration
     * const TenantIntegration = await prisma.tenantIntegration.delete({
     *   where: {
     *     // ... filter to delete one TenantIntegration
     *   }
     * })
     * 
     */
    delete<T extends TenantIntegrationDeleteArgs>(args: SelectSubset<T, TenantIntegrationDeleteArgs<ExtArgs>>): Prisma__TenantIntegrationClient<$Result.GetResult<Prisma.$TenantIntegrationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one TenantIntegration.
     * @param {TenantIntegrationUpdateArgs} args - Arguments to update one TenantIntegration.
     * @example
     * // Update one TenantIntegration
     * const tenantIntegration = await prisma.tenantIntegration.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TenantIntegrationUpdateArgs>(args: SelectSubset<T, TenantIntegrationUpdateArgs<ExtArgs>>): Prisma__TenantIntegrationClient<$Result.GetResult<Prisma.$TenantIntegrationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more TenantIntegrations.
     * @param {TenantIntegrationDeleteManyArgs} args - Arguments to filter TenantIntegrations to delete.
     * @example
     * // Delete a few TenantIntegrations
     * const { count } = await prisma.tenantIntegration.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TenantIntegrationDeleteManyArgs>(args?: SelectSubset<T, TenantIntegrationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TenantIntegrations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantIntegrationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TenantIntegrations
     * const tenantIntegration = await prisma.tenantIntegration.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TenantIntegrationUpdateManyArgs>(args: SelectSubset<T, TenantIntegrationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TenantIntegrations and returns the data updated in the database.
     * @param {TenantIntegrationUpdateManyAndReturnArgs} args - Arguments to update many TenantIntegrations.
     * @example
     * // Update many TenantIntegrations
     * const tenantIntegration = await prisma.tenantIntegration.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more TenantIntegrations and only return the `id`
     * const tenantIntegrationWithIdOnly = await prisma.tenantIntegration.updateManyAndReturn({
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
    updateManyAndReturn<T extends TenantIntegrationUpdateManyAndReturnArgs>(args: SelectSubset<T, TenantIntegrationUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantIntegrationPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one TenantIntegration.
     * @param {TenantIntegrationUpsertArgs} args - Arguments to update or create a TenantIntegration.
     * @example
     * // Update or create a TenantIntegration
     * const tenantIntegration = await prisma.tenantIntegration.upsert({
     *   create: {
     *     // ... data to create a TenantIntegration
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TenantIntegration we want to update
     *   }
     * })
     */
    upsert<T extends TenantIntegrationUpsertArgs>(args: SelectSubset<T, TenantIntegrationUpsertArgs<ExtArgs>>): Prisma__TenantIntegrationClient<$Result.GetResult<Prisma.$TenantIntegrationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of TenantIntegrations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantIntegrationCountArgs} args - Arguments to filter TenantIntegrations to count.
     * @example
     * // Count the number of TenantIntegrations
     * const count = await prisma.tenantIntegration.count({
     *   where: {
     *     // ... the filter for the TenantIntegrations we want to count
     *   }
     * })
    **/
    count<T extends TenantIntegrationCountArgs>(
      args?: Subset<T, TenantIntegrationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TenantIntegrationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TenantIntegration.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantIntegrationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends TenantIntegrationAggregateArgs>(args: Subset<T, TenantIntegrationAggregateArgs>): Prisma.PrismaPromise<GetTenantIntegrationAggregateType<T>>

    /**
     * Group by TenantIntegration.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantIntegrationGroupByArgs} args - Group by arguments.
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
      T extends TenantIntegrationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TenantIntegrationGroupByArgs['orderBy'] }
        : { orderBy?: TenantIntegrationGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, TenantIntegrationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTenantIntegrationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TenantIntegration model
   */
  readonly fields: TenantIntegrationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TenantIntegration.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TenantIntegrationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the TenantIntegration model
   */
  interface TenantIntegrationFieldRefs {
    readonly id: FieldRef<"TenantIntegration", 'String'>
    readonly tenantId: FieldRef<"TenantIntegration", 'String'>
    readonly kind: FieldRef<"TenantIntegration", 'String'>
    readonly config: FieldRef<"TenantIntegration", 'Json'>
    readonly enabled: FieldRef<"TenantIntegration", 'Boolean'>
    readonly createdAt: FieldRef<"TenantIntegration", 'DateTime'>
    readonly updatedAt: FieldRef<"TenantIntegration", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * TenantIntegration findUnique
   */
  export type TenantIntegrationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantIntegration
     */
    select?: TenantIntegrationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantIntegration
     */
    omit?: TenantIntegrationOmit<ExtArgs> | null
    /**
     * Filter, which TenantIntegration to fetch.
     */
    where: TenantIntegrationWhereUniqueInput
  }

  /**
   * TenantIntegration findUniqueOrThrow
   */
  export type TenantIntegrationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantIntegration
     */
    select?: TenantIntegrationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantIntegration
     */
    omit?: TenantIntegrationOmit<ExtArgs> | null
    /**
     * Filter, which TenantIntegration to fetch.
     */
    where: TenantIntegrationWhereUniqueInput
  }

  /**
   * TenantIntegration findFirst
   */
  export type TenantIntegrationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantIntegration
     */
    select?: TenantIntegrationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantIntegration
     */
    omit?: TenantIntegrationOmit<ExtArgs> | null
    /**
     * Filter, which TenantIntegration to fetch.
     */
    where?: TenantIntegrationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantIntegrations to fetch.
     */
    orderBy?: TenantIntegrationOrderByWithRelationInput | TenantIntegrationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TenantIntegrations.
     */
    cursor?: TenantIntegrationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantIntegrations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantIntegrations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TenantIntegrations.
     */
    distinct?: TenantIntegrationScalarFieldEnum | TenantIntegrationScalarFieldEnum[]
  }

  /**
   * TenantIntegration findFirstOrThrow
   */
  export type TenantIntegrationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantIntegration
     */
    select?: TenantIntegrationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantIntegration
     */
    omit?: TenantIntegrationOmit<ExtArgs> | null
    /**
     * Filter, which TenantIntegration to fetch.
     */
    where?: TenantIntegrationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantIntegrations to fetch.
     */
    orderBy?: TenantIntegrationOrderByWithRelationInput | TenantIntegrationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TenantIntegrations.
     */
    cursor?: TenantIntegrationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantIntegrations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantIntegrations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TenantIntegrations.
     */
    distinct?: TenantIntegrationScalarFieldEnum | TenantIntegrationScalarFieldEnum[]
  }

  /**
   * TenantIntegration findMany
   */
  export type TenantIntegrationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantIntegration
     */
    select?: TenantIntegrationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantIntegration
     */
    omit?: TenantIntegrationOmit<ExtArgs> | null
    /**
     * Filter, which TenantIntegrations to fetch.
     */
    where?: TenantIntegrationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantIntegrations to fetch.
     */
    orderBy?: TenantIntegrationOrderByWithRelationInput | TenantIntegrationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TenantIntegrations.
     */
    cursor?: TenantIntegrationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantIntegrations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantIntegrations.
     */
    skip?: number
    distinct?: TenantIntegrationScalarFieldEnum | TenantIntegrationScalarFieldEnum[]
  }

  /**
   * TenantIntegration create
   */
  export type TenantIntegrationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantIntegration
     */
    select?: TenantIntegrationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantIntegration
     */
    omit?: TenantIntegrationOmit<ExtArgs> | null
    /**
     * The data needed to create a TenantIntegration.
     */
    data: XOR<TenantIntegrationCreateInput, TenantIntegrationUncheckedCreateInput>
  }

  /**
   * TenantIntegration createMany
   */
  export type TenantIntegrationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TenantIntegrations.
     */
    data: TenantIntegrationCreateManyInput | TenantIntegrationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TenantIntegration createManyAndReturn
   */
  export type TenantIntegrationCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantIntegration
     */
    select?: TenantIntegrationSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TenantIntegration
     */
    omit?: TenantIntegrationOmit<ExtArgs> | null
    /**
     * The data used to create many TenantIntegrations.
     */
    data: TenantIntegrationCreateManyInput | TenantIntegrationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TenantIntegration update
   */
  export type TenantIntegrationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantIntegration
     */
    select?: TenantIntegrationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantIntegration
     */
    omit?: TenantIntegrationOmit<ExtArgs> | null
    /**
     * The data needed to update a TenantIntegration.
     */
    data: XOR<TenantIntegrationUpdateInput, TenantIntegrationUncheckedUpdateInput>
    /**
     * Choose, which TenantIntegration to update.
     */
    where: TenantIntegrationWhereUniqueInput
  }

  /**
   * TenantIntegration updateMany
   */
  export type TenantIntegrationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TenantIntegrations.
     */
    data: XOR<TenantIntegrationUpdateManyMutationInput, TenantIntegrationUncheckedUpdateManyInput>
    /**
     * Filter which TenantIntegrations to update
     */
    where?: TenantIntegrationWhereInput
    /**
     * Limit how many TenantIntegrations to update.
     */
    limit?: number
  }

  /**
   * TenantIntegration updateManyAndReturn
   */
  export type TenantIntegrationUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantIntegration
     */
    select?: TenantIntegrationSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TenantIntegration
     */
    omit?: TenantIntegrationOmit<ExtArgs> | null
    /**
     * The data used to update TenantIntegrations.
     */
    data: XOR<TenantIntegrationUpdateManyMutationInput, TenantIntegrationUncheckedUpdateManyInput>
    /**
     * Filter which TenantIntegrations to update
     */
    where?: TenantIntegrationWhereInput
    /**
     * Limit how many TenantIntegrations to update.
     */
    limit?: number
  }

  /**
   * TenantIntegration upsert
   */
  export type TenantIntegrationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantIntegration
     */
    select?: TenantIntegrationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantIntegration
     */
    omit?: TenantIntegrationOmit<ExtArgs> | null
    /**
     * The filter to search for the TenantIntegration to update in case it exists.
     */
    where: TenantIntegrationWhereUniqueInput
    /**
     * In case the TenantIntegration found by the `where` argument doesn't exist, create a new TenantIntegration with this data.
     */
    create: XOR<TenantIntegrationCreateInput, TenantIntegrationUncheckedCreateInput>
    /**
     * In case the TenantIntegration was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TenantIntegrationUpdateInput, TenantIntegrationUncheckedUpdateInput>
  }

  /**
   * TenantIntegration delete
   */
  export type TenantIntegrationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantIntegration
     */
    select?: TenantIntegrationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantIntegration
     */
    omit?: TenantIntegrationOmit<ExtArgs> | null
    /**
     * Filter which TenantIntegration to delete.
     */
    where: TenantIntegrationWhereUniqueInput
  }

  /**
   * TenantIntegration deleteMany
   */
  export type TenantIntegrationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TenantIntegrations to delete
     */
    where?: TenantIntegrationWhereInput
    /**
     * Limit how many TenantIntegrations to delete.
     */
    limit?: number
  }

  /**
   * TenantIntegration without action
   */
  export type TenantIntegrationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantIntegration
     */
    select?: TenantIntegrationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantIntegration
     */
    omit?: TenantIntegrationOmit<ExtArgs> | null
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


  export const NotificationScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    userId: 'userId',
    type: 'type',
    title: 'title',
    body: 'body',
    link: 'link',
    readAt: 'readAt',
    metadata: 'metadata',
    channels: 'channels',
    createdAt: 'createdAt'
  };

  export type NotificationScalarFieldEnum = (typeof NotificationScalarFieldEnum)[keyof typeof NotificationScalarFieldEnum]


  export const NotificationDeliveryScalarFieldEnum: {
    id: 'id',
    notificationId: 'notificationId',
    tenantId: 'tenantId',
    channel: 'channel',
    status: 'status',
    recipient: 'recipient',
    attemptCount: 'attemptCount',
    lastError: 'lastError',
    sentAt: 'sentAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type NotificationDeliveryScalarFieldEnum = (typeof NotificationDeliveryScalarFieldEnum)[keyof typeof NotificationDeliveryScalarFieldEnum]


  export const TenantIntegrationScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    kind: 'kind',
    config: 'config',
    enabled: 'enabled',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type TenantIntegrationScalarFieldEnum = (typeof TenantIntegrationScalarFieldEnum)[keyof typeof TenantIntegrationScalarFieldEnum]


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
   * Reference to a field of type 'NotificationType'
   */
  export type EnumNotificationTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'NotificationType'>
    


  /**
   * Reference to a field of type 'NotificationType[]'
   */
  export type ListEnumNotificationTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'NotificationType[]'>
    


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
   * Reference to a field of type 'DeliveryChannel'
   */
  export type EnumDeliveryChannelFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DeliveryChannel'>
    


  /**
   * Reference to a field of type 'DeliveryChannel[]'
   */
  export type ListEnumDeliveryChannelFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DeliveryChannel[]'>
    


  /**
   * Reference to a field of type 'DeliveryStatus'
   */
  export type EnumDeliveryStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DeliveryStatus'>
    


  /**
   * Reference to a field of type 'DeliveryStatus[]'
   */
  export type ListEnumDeliveryStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DeliveryStatus[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


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


  export type NotificationWhereInput = {
    AND?: NotificationWhereInput | NotificationWhereInput[]
    OR?: NotificationWhereInput[]
    NOT?: NotificationWhereInput | NotificationWhereInput[]
    id?: StringFilter<"Notification"> | string
    tenantId?: StringNullableFilter<"Notification"> | string | null
    userId?: StringNullableFilter<"Notification"> | string | null
    type?: EnumNotificationTypeFilter<"Notification"> | $Enums.NotificationType
    title?: StringFilter<"Notification"> | string
    body?: StringNullableFilter<"Notification"> | string | null
    link?: StringNullableFilter<"Notification"> | string | null
    readAt?: DateTimeNullableFilter<"Notification"> | Date | string | null
    metadata?: JsonFilter<"Notification">
    channels?: StringNullableListFilter<"Notification">
    createdAt?: DateTimeFilter<"Notification"> | Date | string
    deliveries?: NotificationDeliveryListRelationFilter
  }

  export type NotificationOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrderInput | SortOrder
    userId?: SortOrderInput | SortOrder
    type?: SortOrder
    title?: SortOrder
    body?: SortOrderInput | SortOrder
    link?: SortOrderInput | SortOrder
    readAt?: SortOrderInput | SortOrder
    metadata?: SortOrder
    channels?: SortOrder
    createdAt?: SortOrder
    deliveries?: NotificationDeliveryOrderByRelationAggregateInput
  }

  export type NotificationWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: NotificationWhereInput | NotificationWhereInput[]
    OR?: NotificationWhereInput[]
    NOT?: NotificationWhereInput | NotificationWhereInput[]
    tenantId?: StringNullableFilter<"Notification"> | string | null
    userId?: StringNullableFilter<"Notification"> | string | null
    type?: EnumNotificationTypeFilter<"Notification"> | $Enums.NotificationType
    title?: StringFilter<"Notification"> | string
    body?: StringNullableFilter<"Notification"> | string | null
    link?: StringNullableFilter<"Notification"> | string | null
    readAt?: DateTimeNullableFilter<"Notification"> | Date | string | null
    metadata?: JsonFilter<"Notification">
    channels?: StringNullableListFilter<"Notification">
    createdAt?: DateTimeFilter<"Notification"> | Date | string
    deliveries?: NotificationDeliveryListRelationFilter
  }, "id">

  export type NotificationOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrderInput | SortOrder
    userId?: SortOrderInput | SortOrder
    type?: SortOrder
    title?: SortOrder
    body?: SortOrderInput | SortOrder
    link?: SortOrderInput | SortOrder
    readAt?: SortOrderInput | SortOrder
    metadata?: SortOrder
    channels?: SortOrder
    createdAt?: SortOrder
    _count?: NotificationCountOrderByAggregateInput
    _max?: NotificationMaxOrderByAggregateInput
    _min?: NotificationMinOrderByAggregateInput
  }

  export type NotificationScalarWhereWithAggregatesInput = {
    AND?: NotificationScalarWhereWithAggregatesInput | NotificationScalarWhereWithAggregatesInput[]
    OR?: NotificationScalarWhereWithAggregatesInput[]
    NOT?: NotificationScalarWhereWithAggregatesInput | NotificationScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Notification"> | string
    tenantId?: StringNullableWithAggregatesFilter<"Notification"> | string | null
    userId?: StringNullableWithAggregatesFilter<"Notification"> | string | null
    type?: EnumNotificationTypeWithAggregatesFilter<"Notification"> | $Enums.NotificationType
    title?: StringWithAggregatesFilter<"Notification"> | string
    body?: StringNullableWithAggregatesFilter<"Notification"> | string | null
    link?: StringNullableWithAggregatesFilter<"Notification"> | string | null
    readAt?: DateTimeNullableWithAggregatesFilter<"Notification"> | Date | string | null
    metadata?: JsonWithAggregatesFilter<"Notification">
    channels?: StringNullableListFilter<"Notification">
    createdAt?: DateTimeWithAggregatesFilter<"Notification"> | Date | string
  }

  export type NotificationDeliveryWhereInput = {
    AND?: NotificationDeliveryWhereInput | NotificationDeliveryWhereInput[]
    OR?: NotificationDeliveryWhereInput[]
    NOT?: NotificationDeliveryWhereInput | NotificationDeliveryWhereInput[]
    id?: StringFilter<"NotificationDelivery"> | string
    notificationId?: StringFilter<"NotificationDelivery"> | string
    tenantId?: StringNullableFilter<"NotificationDelivery"> | string | null
    channel?: EnumDeliveryChannelFilter<"NotificationDelivery"> | $Enums.DeliveryChannel
    status?: EnumDeliveryStatusFilter<"NotificationDelivery"> | $Enums.DeliveryStatus
    recipient?: StringFilter<"NotificationDelivery"> | string
    attemptCount?: IntFilter<"NotificationDelivery"> | number
    lastError?: StringNullableFilter<"NotificationDelivery"> | string | null
    sentAt?: DateTimeNullableFilter<"NotificationDelivery"> | Date | string | null
    createdAt?: DateTimeFilter<"NotificationDelivery"> | Date | string
    updatedAt?: DateTimeFilter<"NotificationDelivery"> | Date | string
    notification?: XOR<NotificationScalarRelationFilter, NotificationWhereInput>
  }

  export type NotificationDeliveryOrderByWithRelationInput = {
    id?: SortOrder
    notificationId?: SortOrder
    tenantId?: SortOrderInput | SortOrder
    channel?: SortOrder
    status?: SortOrder
    recipient?: SortOrder
    attemptCount?: SortOrder
    lastError?: SortOrderInput | SortOrder
    sentAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    notification?: NotificationOrderByWithRelationInput
  }

  export type NotificationDeliveryWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: NotificationDeliveryWhereInput | NotificationDeliveryWhereInput[]
    OR?: NotificationDeliveryWhereInput[]
    NOT?: NotificationDeliveryWhereInput | NotificationDeliveryWhereInput[]
    notificationId?: StringFilter<"NotificationDelivery"> | string
    tenantId?: StringNullableFilter<"NotificationDelivery"> | string | null
    channel?: EnumDeliveryChannelFilter<"NotificationDelivery"> | $Enums.DeliveryChannel
    status?: EnumDeliveryStatusFilter<"NotificationDelivery"> | $Enums.DeliveryStatus
    recipient?: StringFilter<"NotificationDelivery"> | string
    attemptCount?: IntFilter<"NotificationDelivery"> | number
    lastError?: StringNullableFilter<"NotificationDelivery"> | string | null
    sentAt?: DateTimeNullableFilter<"NotificationDelivery"> | Date | string | null
    createdAt?: DateTimeFilter<"NotificationDelivery"> | Date | string
    updatedAt?: DateTimeFilter<"NotificationDelivery"> | Date | string
    notification?: XOR<NotificationScalarRelationFilter, NotificationWhereInput>
  }, "id">

  export type NotificationDeliveryOrderByWithAggregationInput = {
    id?: SortOrder
    notificationId?: SortOrder
    tenantId?: SortOrderInput | SortOrder
    channel?: SortOrder
    status?: SortOrder
    recipient?: SortOrder
    attemptCount?: SortOrder
    lastError?: SortOrderInput | SortOrder
    sentAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: NotificationDeliveryCountOrderByAggregateInput
    _avg?: NotificationDeliveryAvgOrderByAggregateInput
    _max?: NotificationDeliveryMaxOrderByAggregateInput
    _min?: NotificationDeliveryMinOrderByAggregateInput
    _sum?: NotificationDeliverySumOrderByAggregateInput
  }

  export type NotificationDeliveryScalarWhereWithAggregatesInput = {
    AND?: NotificationDeliveryScalarWhereWithAggregatesInput | NotificationDeliveryScalarWhereWithAggregatesInput[]
    OR?: NotificationDeliveryScalarWhereWithAggregatesInput[]
    NOT?: NotificationDeliveryScalarWhereWithAggregatesInput | NotificationDeliveryScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"NotificationDelivery"> | string
    notificationId?: StringWithAggregatesFilter<"NotificationDelivery"> | string
    tenantId?: StringNullableWithAggregatesFilter<"NotificationDelivery"> | string | null
    channel?: EnumDeliveryChannelWithAggregatesFilter<"NotificationDelivery"> | $Enums.DeliveryChannel
    status?: EnumDeliveryStatusWithAggregatesFilter<"NotificationDelivery"> | $Enums.DeliveryStatus
    recipient?: StringWithAggregatesFilter<"NotificationDelivery"> | string
    attemptCount?: IntWithAggregatesFilter<"NotificationDelivery"> | number
    lastError?: StringNullableWithAggregatesFilter<"NotificationDelivery"> | string | null
    sentAt?: DateTimeNullableWithAggregatesFilter<"NotificationDelivery"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"NotificationDelivery"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"NotificationDelivery"> | Date | string
  }

  export type TenantIntegrationWhereInput = {
    AND?: TenantIntegrationWhereInput | TenantIntegrationWhereInput[]
    OR?: TenantIntegrationWhereInput[]
    NOT?: TenantIntegrationWhereInput | TenantIntegrationWhereInput[]
    id?: StringFilter<"TenantIntegration"> | string
    tenantId?: StringFilter<"TenantIntegration"> | string
    kind?: StringFilter<"TenantIntegration"> | string
    config?: JsonFilter<"TenantIntegration">
    enabled?: BoolFilter<"TenantIntegration"> | boolean
    createdAt?: DateTimeFilter<"TenantIntegration"> | Date | string
    updatedAt?: DateTimeFilter<"TenantIntegration"> | Date | string
  }

  export type TenantIntegrationOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    kind?: SortOrder
    config?: SortOrder
    enabled?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TenantIntegrationWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    tenantId_kind?: TenantIntegrationTenantIdKindCompoundUniqueInput
    AND?: TenantIntegrationWhereInput | TenantIntegrationWhereInput[]
    OR?: TenantIntegrationWhereInput[]
    NOT?: TenantIntegrationWhereInput | TenantIntegrationWhereInput[]
    tenantId?: StringFilter<"TenantIntegration"> | string
    kind?: StringFilter<"TenantIntegration"> | string
    config?: JsonFilter<"TenantIntegration">
    enabled?: BoolFilter<"TenantIntegration"> | boolean
    createdAt?: DateTimeFilter<"TenantIntegration"> | Date | string
    updatedAt?: DateTimeFilter<"TenantIntegration"> | Date | string
  }, "id" | "tenantId_kind">

  export type TenantIntegrationOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    kind?: SortOrder
    config?: SortOrder
    enabled?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: TenantIntegrationCountOrderByAggregateInput
    _max?: TenantIntegrationMaxOrderByAggregateInput
    _min?: TenantIntegrationMinOrderByAggregateInput
  }

  export type TenantIntegrationScalarWhereWithAggregatesInput = {
    AND?: TenantIntegrationScalarWhereWithAggregatesInput | TenantIntegrationScalarWhereWithAggregatesInput[]
    OR?: TenantIntegrationScalarWhereWithAggregatesInput[]
    NOT?: TenantIntegrationScalarWhereWithAggregatesInput | TenantIntegrationScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"TenantIntegration"> | string
    tenantId?: StringWithAggregatesFilter<"TenantIntegration"> | string
    kind?: StringWithAggregatesFilter<"TenantIntegration"> | string
    config?: JsonWithAggregatesFilter<"TenantIntegration">
    enabled?: BoolWithAggregatesFilter<"TenantIntegration"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"TenantIntegration"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"TenantIntegration"> | Date | string
  }

  export type NotificationCreateInput = {
    id?: string
    tenantId?: string | null
    userId?: string | null
    type: $Enums.NotificationType
    title: string
    body?: string | null
    link?: string | null
    readAt?: Date | string | null
    metadata?: JsonNullValueInput | InputJsonValue
    channels?: NotificationCreatechannelsInput | string[]
    createdAt?: Date | string
    deliveries?: NotificationDeliveryCreateNestedManyWithoutNotificationInput
  }

  export type NotificationUncheckedCreateInput = {
    id?: string
    tenantId?: string | null
    userId?: string | null
    type: $Enums.NotificationType
    title: string
    body?: string | null
    link?: string | null
    readAt?: Date | string | null
    metadata?: JsonNullValueInput | InputJsonValue
    channels?: NotificationCreatechannelsInput | string[]
    createdAt?: Date | string
    deliveries?: NotificationDeliveryUncheckedCreateNestedManyWithoutNotificationInput
  }

  export type NotificationUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumNotificationTypeFieldUpdateOperationsInput | $Enums.NotificationType
    title?: StringFieldUpdateOperationsInput | string
    body?: NullableStringFieldUpdateOperationsInput | string | null
    link?: NullableStringFieldUpdateOperationsInput | string | null
    readAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    metadata?: JsonNullValueInput | InputJsonValue
    channels?: NotificationUpdatechannelsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deliveries?: NotificationDeliveryUpdateManyWithoutNotificationNestedInput
  }

  export type NotificationUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumNotificationTypeFieldUpdateOperationsInput | $Enums.NotificationType
    title?: StringFieldUpdateOperationsInput | string
    body?: NullableStringFieldUpdateOperationsInput | string | null
    link?: NullableStringFieldUpdateOperationsInput | string | null
    readAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    metadata?: JsonNullValueInput | InputJsonValue
    channels?: NotificationUpdatechannelsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deliveries?: NotificationDeliveryUncheckedUpdateManyWithoutNotificationNestedInput
  }

  export type NotificationCreateManyInput = {
    id?: string
    tenantId?: string | null
    userId?: string | null
    type: $Enums.NotificationType
    title: string
    body?: string | null
    link?: string | null
    readAt?: Date | string | null
    metadata?: JsonNullValueInput | InputJsonValue
    channels?: NotificationCreatechannelsInput | string[]
    createdAt?: Date | string
  }

  export type NotificationUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumNotificationTypeFieldUpdateOperationsInput | $Enums.NotificationType
    title?: StringFieldUpdateOperationsInput | string
    body?: NullableStringFieldUpdateOperationsInput | string | null
    link?: NullableStringFieldUpdateOperationsInput | string | null
    readAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    metadata?: JsonNullValueInput | InputJsonValue
    channels?: NotificationUpdatechannelsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NotificationUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumNotificationTypeFieldUpdateOperationsInput | $Enums.NotificationType
    title?: StringFieldUpdateOperationsInput | string
    body?: NullableStringFieldUpdateOperationsInput | string | null
    link?: NullableStringFieldUpdateOperationsInput | string | null
    readAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    metadata?: JsonNullValueInput | InputJsonValue
    channels?: NotificationUpdatechannelsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NotificationDeliveryCreateInput = {
    id?: string
    tenantId?: string | null
    channel: $Enums.DeliveryChannel
    status?: $Enums.DeliveryStatus
    recipient: string
    attemptCount?: number
    lastError?: string | null
    sentAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    notification: NotificationCreateNestedOneWithoutDeliveriesInput
  }

  export type NotificationDeliveryUncheckedCreateInput = {
    id?: string
    notificationId: string
    tenantId?: string | null
    channel: $Enums.DeliveryChannel
    status?: $Enums.DeliveryStatus
    recipient: string
    attemptCount?: number
    lastError?: string | null
    sentAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type NotificationDeliveryUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    channel?: EnumDeliveryChannelFieldUpdateOperationsInput | $Enums.DeliveryChannel
    status?: EnumDeliveryStatusFieldUpdateOperationsInput | $Enums.DeliveryStatus
    recipient?: StringFieldUpdateOperationsInput | string
    attemptCount?: IntFieldUpdateOperationsInput | number
    lastError?: NullableStringFieldUpdateOperationsInput | string | null
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    notification?: NotificationUpdateOneRequiredWithoutDeliveriesNestedInput
  }

  export type NotificationDeliveryUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    notificationId?: StringFieldUpdateOperationsInput | string
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    channel?: EnumDeliveryChannelFieldUpdateOperationsInput | $Enums.DeliveryChannel
    status?: EnumDeliveryStatusFieldUpdateOperationsInput | $Enums.DeliveryStatus
    recipient?: StringFieldUpdateOperationsInput | string
    attemptCount?: IntFieldUpdateOperationsInput | number
    lastError?: NullableStringFieldUpdateOperationsInput | string | null
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NotificationDeliveryCreateManyInput = {
    id?: string
    notificationId: string
    tenantId?: string | null
    channel: $Enums.DeliveryChannel
    status?: $Enums.DeliveryStatus
    recipient: string
    attemptCount?: number
    lastError?: string | null
    sentAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type NotificationDeliveryUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    channel?: EnumDeliveryChannelFieldUpdateOperationsInput | $Enums.DeliveryChannel
    status?: EnumDeliveryStatusFieldUpdateOperationsInput | $Enums.DeliveryStatus
    recipient?: StringFieldUpdateOperationsInput | string
    attemptCount?: IntFieldUpdateOperationsInput | number
    lastError?: NullableStringFieldUpdateOperationsInput | string | null
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NotificationDeliveryUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    notificationId?: StringFieldUpdateOperationsInput | string
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    channel?: EnumDeliveryChannelFieldUpdateOperationsInput | $Enums.DeliveryChannel
    status?: EnumDeliveryStatusFieldUpdateOperationsInput | $Enums.DeliveryStatus
    recipient?: StringFieldUpdateOperationsInput | string
    attemptCount?: IntFieldUpdateOperationsInput | number
    lastError?: NullableStringFieldUpdateOperationsInput | string | null
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantIntegrationCreateInput = {
    id?: string
    tenantId: string
    kind: string
    config: JsonNullValueInput | InputJsonValue
    enabled?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantIntegrationUncheckedCreateInput = {
    id?: string
    tenantId: string
    kind: string
    config: JsonNullValueInput | InputJsonValue
    enabled?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantIntegrationUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    kind?: StringFieldUpdateOperationsInput | string
    config?: JsonNullValueInput | InputJsonValue
    enabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantIntegrationUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    kind?: StringFieldUpdateOperationsInput | string
    config?: JsonNullValueInput | InputJsonValue
    enabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantIntegrationCreateManyInput = {
    id?: string
    tenantId: string
    kind: string
    config: JsonNullValueInput | InputJsonValue
    enabled?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantIntegrationUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    kind?: StringFieldUpdateOperationsInput | string
    config?: JsonNullValueInput | InputJsonValue
    enabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantIntegrationUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    kind?: StringFieldUpdateOperationsInput | string
    config?: JsonNullValueInput | InputJsonValue
    enabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
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

  export type EnumNotificationTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.NotificationType | EnumNotificationTypeFieldRefInput<$PrismaModel>
    in?: $Enums.NotificationType[] | ListEnumNotificationTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.NotificationType[] | ListEnumNotificationTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumNotificationTypeFilter<$PrismaModel> | $Enums.NotificationType
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

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    has?: string | StringFieldRefInput<$PrismaModel> | null
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>
    isEmpty?: boolean
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

  export type NotificationDeliveryListRelationFilter = {
    every?: NotificationDeliveryWhereInput
    some?: NotificationDeliveryWhereInput
    none?: NotificationDeliveryWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type NotificationDeliveryOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type NotificationCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    userId?: SortOrder
    type?: SortOrder
    title?: SortOrder
    body?: SortOrder
    link?: SortOrder
    readAt?: SortOrder
    metadata?: SortOrder
    channels?: SortOrder
    createdAt?: SortOrder
  }

  export type NotificationMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    userId?: SortOrder
    type?: SortOrder
    title?: SortOrder
    body?: SortOrder
    link?: SortOrder
    readAt?: SortOrder
    createdAt?: SortOrder
  }

  export type NotificationMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    userId?: SortOrder
    type?: SortOrder
    title?: SortOrder
    body?: SortOrder
    link?: SortOrder
    readAt?: SortOrder
    createdAt?: SortOrder
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

  export type EnumNotificationTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.NotificationType | EnumNotificationTypeFieldRefInput<$PrismaModel>
    in?: $Enums.NotificationType[] | ListEnumNotificationTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.NotificationType[] | ListEnumNotificationTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumNotificationTypeWithAggregatesFilter<$PrismaModel> | $Enums.NotificationType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumNotificationTypeFilter<$PrismaModel>
    _max?: NestedEnumNotificationTypeFilter<$PrismaModel>
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

  export type EnumDeliveryChannelFilter<$PrismaModel = never> = {
    equals?: $Enums.DeliveryChannel | EnumDeliveryChannelFieldRefInput<$PrismaModel>
    in?: $Enums.DeliveryChannel[] | ListEnumDeliveryChannelFieldRefInput<$PrismaModel>
    notIn?: $Enums.DeliveryChannel[] | ListEnumDeliveryChannelFieldRefInput<$PrismaModel>
    not?: NestedEnumDeliveryChannelFilter<$PrismaModel> | $Enums.DeliveryChannel
  }

  export type EnumDeliveryStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.DeliveryStatus | EnumDeliveryStatusFieldRefInput<$PrismaModel>
    in?: $Enums.DeliveryStatus[] | ListEnumDeliveryStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.DeliveryStatus[] | ListEnumDeliveryStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumDeliveryStatusFilter<$PrismaModel> | $Enums.DeliveryStatus
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

  export type NotificationScalarRelationFilter = {
    is?: NotificationWhereInput
    isNot?: NotificationWhereInput
  }

  export type NotificationDeliveryCountOrderByAggregateInput = {
    id?: SortOrder
    notificationId?: SortOrder
    tenantId?: SortOrder
    channel?: SortOrder
    status?: SortOrder
    recipient?: SortOrder
    attemptCount?: SortOrder
    lastError?: SortOrder
    sentAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type NotificationDeliveryAvgOrderByAggregateInput = {
    attemptCount?: SortOrder
  }

  export type NotificationDeliveryMaxOrderByAggregateInput = {
    id?: SortOrder
    notificationId?: SortOrder
    tenantId?: SortOrder
    channel?: SortOrder
    status?: SortOrder
    recipient?: SortOrder
    attemptCount?: SortOrder
    lastError?: SortOrder
    sentAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type NotificationDeliveryMinOrderByAggregateInput = {
    id?: SortOrder
    notificationId?: SortOrder
    tenantId?: SortOrder
    channel?: SortOrder
    status?: SortOrder
    recipient?: SortOrder
    attemptCount?: SortOrder
    lastError?: SortOrder
    sentAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type NotificationDeliverySumOrderByAggregateInput = {
    attemptCount?: SortOrder
  }

  export type EnumDeliveryChannelWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.DeliveryChannel | EnumDeliveryChannelFieldRefInput<$PrismaModel>
    in?: $Enums.DeliveryChannel[] | ListEnumDeliveryChannelFieldRefInput<$PrismaModel>
    notIn?: $Enums.DeliveryChannel[] | ListEnumDeliveryChannelFieldRefInput<$PrismaModel>
    not?: NestedEnumDeliveryChannelWithAggregatesFilter<$PrismaModel> | $Enums.DeliveryChannel
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumDeliveryChannelFilter<$PrismaModel>
    _max?: NestedEnumDeliveryChannelFilter<$PrismaModel>
  }

  export type EnumDeliveryStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.DeliveryStatus | EnumDeliveryStatusFieldRefInput<$PrismaModel>
    in?: $Enums.DeliveryStatus[] | ListEnumDeliveryStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.DeliveryStatus[] | ListEnumDeliveryStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumDeliveryStatusWithAggregatesFilter<$PrismaModel> | $Enums.DeliveryStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumDeliveryStatusFilter<$PrismaModel>
    _max?: NestedEnumDeliveryStatusFilter<$PrismaModel>
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

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type TenantIntegrationTenantIdKindCompoundUniqueInput = {
    tenantId: string
    kind: string
  }

  export type TenantIntegrationCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    kind?: SortOrder
    config?: SortOrder
    enabled?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TenantIntegrationMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    kind?: SortOrder
    enabled?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TenantIntegrationMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    kind?: SortOrder
    enabled?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NotificationCreatechannelsInput = {
    set: string[]
  }

  export type NotificationDeliveryCreateNestedManyWithoutNotificationInput = {
    create?: XOR<NotificationDeliveryCreateWithoutNotificationInput, NotificationDeliveryUncheckedCreateWithoutNotificationInput> | NotificationDeliveryCreateWithoutNotificationInput[] | NotificationDeliveryUncheckedCreateWithoutNotificationInput[]
    connectOrCreate?: NotificationDeliveryCreateOrConnectWithoutNotificationInput | NotificationDeliveryCreateOrConnectWithoutNotificationInput[]
    createMany?: NotificationDeliveryCreateManyNotificationInputEnvelope
    connect?: NotificationDeliveryWhereUniqueInput | NotificationDeliveryWhereUniqueInput[]
  }

  export type NotificationDeliveryUncheckedCreateNestedManyWithoutNotificationInput = {
    create?: XOR<NotificationDeliveryCreateWithoutNotificationInput, NotificationDeliveryUncheckedCreateWithoutNotificationInput> | NotificationDeliveryCreateWithoutNotificationInput[] | NotificationDeliveryUncheckedCreateWithoutNotificationInput[]
    connectOrCreate?: NotificationDeliveryCreateOrConnectWithoutNotificationInput | NotificationDeliveryCreateOrConnectWithoutNotificationInput[]
    createMany?: NotificationDeliveryCreateManyNotificationInputEnvelope
    connect?: NotificationDeliveryWhereUniqueInput | NotificationDeliveryWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type EnumNotificationTypeFieldUpdateOperationsInput = {
    set?: $Enums.NotificationType
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type NotificationUpdatechannelsInput = {
    set?: string[]
    push?: string | string[]
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NotificationDeliveryUpdateManyWithoutNotificationNestedInput = {
    create?: XOR<NotificationDeliveryCreateWithoutNotificationInput, NotificationDeliveryUncheckedCreateWithoutNotificationInput> | NotificationDeliveryCreateWithoutNotificationInput[] | NotificationDeliveryUncheckedCreateWithoutNotificationInput[]
    connectOrCreate?: NotificationDeliveryCreateOrConnectWithoutNotificationInput | NotificationDeliveryCreateOrConnectWithoutNotificationInput[]
    upsert?: NotificationDeliveryUpsertWithWhereUniqueWithoutNotificationInput | NotificationDeliveryUpsertWithWhereUniqueWithoutNotificationInput[]
    createMany?: NotificationDeliveryCreateManyNotificationInputEnvelope
    set?: NotificationDeliveryWhereUniqueInput | NotificationDeliveryWhereUniqueInput[]
    disconnect?: NotificationDeliveryWhereUniqueInput | NotificationDeliveryWhereUniqueInput[]
    delete?: NotificationDeliveryWhereUniqueInput | NotificationDeliveryWhereUniqueInput[]
    connect?: NotificationDeliveryWhereUniqueInput | NotificationDeliveryWhereUniqueInput[]
    update?: NotificationDeliveryUpdateWithWhereUniqueWithoutNotificationInput | NotificationDeliveryUpdateWithWhereUniqueWithoutNotificationInput[]
    updateMany?: NotificationDeliveryUpdateManyWithWhereWithoutNotificationInput | NotificationDeliveryUpdateManyWithWhereWithoutNotificationInput[]
    deleteMany?: NotificationDeliveryScalarWhereInput | NotificationDeliveryScalarWhereInput[]
  }

  export type NotificationDeliveryUncheckedUpdateManyWithoutNotificationNestedInput = {
    create?: XOR<NotificationDeliveryCreateWithoutNotificationInput, NotificationDeliveryUncheckedCreateWithoutNotificationInput> | NotificationDeliveryCreateWithoutNotificationInput[] | NotificationDeliveryUncheckedCreateWithoutNotificationInput[]
    connectOrCreate?: NotificationDeliveryCreateOrConnectWithoutNotificationInput | NotificationDeliveryCreateOrConnectWithoutNotificationInput[]
    upsert?: NotificationDeliveryUpsertWithWhereUniqueWithoutNotificationInput | NotificationDeliveryUpsertWithWhereUniqueWithoutNotificationInput[]
    createMany?: NotificationDeliveryCreateManyNotificationInputEnvelope
    set?: NotificationDeliveryWhereUniqueInput | NotificationDeliveryWhereUniqueInput[]
    disconnect?: NotificationDeliveryWhereUniqueInput | NotificationDeliveryWhereUniqueInput[]
    delete?: NotificationDeliveryWhereUniqueInput | NotificationDeliveryWhereUniqueInput[]
    connect?: NotificationDeliveryWhereUniqueInput | NotificationDeliveryWhereUniqueInput[]
    update?: NotificationDeliveryUpdateWithWhereUniqueWithoutNotificationInput | NotificationDeliveryUpdateWithWhereUniqueWithoutNotificationInput[]
    updateMany?: NotificationDeliveryUpdateManyWithWhereWithoutNotificationInput | NotificationDeliveryUpdateManyWithWhereWithoutNotificationInput[]
    deleteMany?: NotificationDeliveryScalarWhereInput | NotificationDeliveryScalarWhereInput[]
  }

  export type NotificationCreateNestedOneWithoutDeliveriesInput = {
    create?: XOR<NotificationCreateWithoutDeliveriesInput, NotificationUncheckedCreateWithoutDeliveriesInput>
    connectOrCreate?: NotificationCreateOrConnectWithoutDeliveriesInput
    connect?: NotificationWhereUniqueInput
  }

  export type EnumDeliveryChannelFieldUpdateOperationsInput = {
    set?: $Enums.DeliveryChannel
  }

  export type EnumDeliveryStatusFieldUpdateOperationsInput = {
    set?: $Enums.DeliveryStatus
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NotificationUpdateOneRequiredWithoutDeliveriesNestedInput = {
    create?: XOR<NotificationCreateWithoutDeliveriesInput, NotificationUncheckedCreateWithoutDeliveriesInput>
    connectOrCreate?: NotificationCreateOrConnectWithoutDeliveriesInput
    upsert?: NotificationUpsertWithoutDeliveriesInput
    connect?: NotificationWhereUniqueInput
    update?: XOR<XOR<NotificationUpdateToOneWithWhereWithoutDeliveriesInput, NotificationUpdateWithoutDeliveriesInput>, NotificationUncheckedUpdateWithoutDeliveriesInput>
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
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

  export type NestedEnumNotificationTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.NotificationType | EnumNotificationTypeFieldRefInput<$PrismaModel>
    in?: $Enums.NotificationType[] | ListEnumNotificationTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.NotificationType[] | ListEnumNotificationTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumNotificationTypeFilter<$PrismaModel> | $Enums.NotificationType
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

  export type NestedEnumNotificationTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.NotificationType | EnumNotificationTypeFieldRefInput<$PrismaModel>
    in?: $Enums.NotificationType[] | ListEnumNotificationTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.NotificationType[] | ListEnumNotificationTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumNotificationTypeWithAggregatesFilter<$PrismaModel> | $Enums.NotificationType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumNotificationTypeFilter<$PrismaModel>
    _max?: NestedEnumNotificationTypeFilter<$PrismaModel>
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

  export type NestedEnumDeliveryChannelFilter<$PrismaModel = never> = {
    equals?: $Enums.DeliveryChannel | EnumDeliveryChannelFieldRefInput<$PrismaModel>
    in?: $Enums.DeliveryChannel[] | ListEnumDeliveryChannelFieldRefInput<$PrismaModel>
    notIn?: $Enums.DeliveryChannel[] | ListEnumDeliveryChannelFieldRefInput<$PrismaModel>
    not?: NestedEnumDeliveryChannelFilter<$PrismaModel> | $Enums.DeliveryChannel
  }

  export type NestedEnumDeliveryStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.DeliveryStatus | EnumDeliveryStatusFieldRefInput<$PrismaModel>
    in?: $Enums.DeliveryStatus[] | ListEnumDeliveryStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.DeliveryStatus[] | ListEnumDeliveryStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumDeliveryStatusFilter<$PrismaModel> | $Enums.DeliveryStatus
  }

  export type NestedEnumDeliveryChannelWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.DeliveryChannel | EnumDeliveryChannelFieldRefInput<$PrismaModel>
    in?: $Enums.DeliveryChannel[] | ListEnumDeliveryChannelFieldRefInput<$PrismaModel>
    notIn?: $Enums.DeliveryChannel[] | ListEnumDeliveryChannelFieldRefInput<$PrismaModel>
    not?: NestedEnumDeliveryChannelWithAggregatesFilter<$PrismaModel> | $Enums.DeliveryChannel
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumDeliveryChannelFilter<$PrismaModel>
    _max?: NestedEnumDeliveryChannelFilter<$PrismaModel>
  }

  export type NestedEnumDeliveryStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.DeliveryStatus | EnumDeliveryStatusFieldRefInput<$PrismaModel>
    in?: $Enums.DeliveryStatus[] | ListEnumDeliveryStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.DeliveryStatus[] | ListEnumDeliveryStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumDeliveryStatusWithAggregatesFilter<$PrismaModel> | $Enums.DeliveryStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumDeliveryStatusFilter<$PrismaModel>
    _max?: NestedEnumDeliveryStatusFilter<$PrismaModel>
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

  export type NotificationDeliveryCreateWithoutNotificationInput = {
    id?: string
    tenantId?: string | null
    channel: $Enums.DeliveryChannel
    status?: $Enums.DeliveryStatus
    recipient: string
    attemptCount?: number
    lastError?: string | null
    sentAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type NotificationDeliveryUncheckedCreateWithoutNotificationInput = {
    id?: string
    tenantId?: string | null
    channel: $Enums.DeliveryChannel
    status?: $Enums.DeliveryStatus
    recipient: string
    attemptCount?: number
    lastError?: string | null
    sentAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type NotificationDeliveryCreateOrConnectWithoutNotificationInput = {
    where: NotificationDeliveryWhereUniqueInput
    create: XOR<NotificationDeliveryCreateWithoutNotificationInput, NotificationDeliveryUncheckedCreateWithoutNotificationInput>
  }

  export type NotificationDeliveryCreateManyNotificationInputEnvelope = {
    data: NotificationDeliveryCreateManyNotificationInput | NotificationDeliveryCreateManyNotificationInput[]
    skipDuplicates?: boolean
  }

  export type NotificationDeliveryUpsertWithWhereUniqueWithoutNotificationInput = {
    where: NotificationDeliveryWhereUniqueInput
    update: XOR<NotificationDeliveryUpdateWithoutNotificationInput, NotificationDeliveryUncheckedUpdateWithoutNotificationInput>
    create: XOR<NotificationDeliveryCreateWithoutNotificationInput, NotificationDeliveryUncheckedCreateWithoutNotificationInput>
  }

  export type NotificationDeliveryUpdateWithWhereUniqueWithoutNotificationInput = {
    where: NotificationDeliveryWhereUniqueInput
    data: XOR<NotificationDeliveryUpdateWithoutNotificationInput, NotificationDeliveryUncheckedUpdateWithoutNotificationInput>
  }

  export type NotificationDeliveryUpdateManyWithWhereWithoutNotificationInput = {
    where: NotificationDeliveryScalarWhereInput
    data: XOR<NotificationDeliveryUpdateManyMutationInput, NotificationDeliveryUncheckedUpdateManyWithoutNotificationInput>
  }

  export type NotificationDeliveryScalarWhereInput = {
    AND?: NotificationDeliveryScalarWhereInput | NotificationDeliveryScalarWhereInput[]
    OR?: NotificationDeliveryScalarWhereInput[]
    NOT?: NotificationDeliveryScalarWhereInput | NotificationDeliveryScalarWhereInput[]
    id?: StringFilter<"NotificationDelivery"> | string
    notificationId?: StringFilter<"NotificationDelivery"> | string
    tenantId?: StringNullableFilter<"NotificationDelivery"> | string | null
    channel?: EnumDeliveryChannelFilter<"NotificationDelivery"> | $Enums.DeliveryChannel
    status?: EnumDeliveryStatusFilter<"NotificationDelivery"> | $Enums.DeliveryStatus
    recipient?: StringFilter<"NotificationDelivery"> | string
    attemptCount?: IntFilter<"NotificationDelivery"> | number
    lastError?: StringNullableFilter<"NotificationDelivery"> | string | null
    sentAt?: DateTimeNullableFilter<"NotificationDelivery"> | Date | string | null
    createdAt?: DateTimeFilter<"NotificationDelivery"> | Date | string
    updatedAt?: DateTimeFilter<"NotificationDelivery"> | Date | string
  }

  export type NotificationCreateWithoutDeliveriesInput = {
    id?: string
    tenantId?: string | null
    userId?: string | null
    type: $Enums.NotificationType
    title: string
    body?: string | null
    link?: string | null
    readAt?: Date | string | null
    metadata?: JsonNullValueInput | InputJsonValue
    channels?: NotificationCreatechannelsInput | string[]
    createdAt?: Date | string
  }

  export type NotificationUncheckedCreateWithoutDeliveriesInput = {
    id?: string
    tenantId?: string | null
    userId?: string | null
    type: $Enums.NotificationType
    title: string
    body?: string | null
    link?: string | null
    readAt?: Date | string | null
    metadata?: JsonNullValueInput | InputJsonValue
    channels?: NotificationCreatechannelsInput | string[]
    createdAt?: Date | string
  }

  export type NotificationCreateOrConnectWithoutDeliveriesInput = {
    where: NotificationWhereUniqueInput
    create: XOR<NotificationCreateWithoutDeliveriesInput, NotificationUncheckedCreateWithoutDeliveriesInput>
  }

  export type NotificationUpsertWithoutDeliveriesInput = {
    update: XOR<NotificationUpdateWithoutDeliveriesInput, NotificationUncheckedUpdateWithoutDeliveriesInput>
    create: XOR<NotificationCreateWithoutDeliveriesInput, NotificationUncheckedCreateWithoutDeliveriesInput>
    where?: NotificationWhereInput
  }

  export type NotificationUpdateToOneWithWhereWithoutDeliveriesInput = {
    where?: NotificationWhereInput
    data: XOR<NotificationUpdateWithoutDeliveriesInput, NotificationUncheckedUpdateWithoutDeliveriesInput>
  }

  export type NotificationUpdateWithoutDeliveriesInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumNotificationTypeFieldUpdateOperationsInput | $Enums.NotificationType
    title?: StringFieldUpdateOperationsInput | string
    body?: NullableStringFieldUpdateOperationsInput | string | null
    link?: NullableStringFieldUpdateOperationsInput | string | null
    readAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    metadata?: JsonNullValueInput | InputJsonValue
    channels?: NotificationUpdatechannelsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NotificationUncheckedUpdateWithoutDeliveriesInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumNotificationTypeFieldUpdateOperationsInput | $Enums.NotificationType
    title?: StringFieldUpdateOperationsInput | string
    body?: NullableStringFieldUpdateOperationsInput | string | null
    link?: NullableStringFieldUpdateOperationsInput | string | null
    readAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    metadata?: JsonNullValueInput | InputJsonValue
    channels?: NotificationUpdatechannelsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NotificationDeliveryCreateManyNotificationInput = {
    id?: string
    tenantId?: string | null
    channel: $Enums.DeliveryChannel
    status?: $Enums.DeliveryStatus
    recipient: string
    attemptCount?: number
    lastError?: string | null
    sentAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type NotificationDeliveryUpdateWithoutNotificationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    channel?: EnumDeliveryChannelFieldUpdateOperationsInput | $Enums.DeliveryChannel
    status?: EnumDeliveryStatusFieldUpdateOperationsInput | $Enums.DeliveryStatus
    recipient?: StringFieldUpdateOperationsInput | string
    attemptCount?: IntFieldUpdateOperationsInput | number
    lastError?: NullableStringFieldUpdateOperationsInput | string | null
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NotificationDeliveryUncheckedUpdateWithoutNotificationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    channel?: EnumDeliveryChannelFieldUpdateOperationsInput | $Enums.DeliveryChannel
    status?: EnumDeliveryStatusFieldUpdateOperationsInput | $Enums.DeliveryStatus
    recipient?: StringFieldUpdateOperationsInput | string
    attemptCount?: IntFieldUpdateOperationsInput | number
    lastError?: NullableStringFieldUpdateOperationsInput | string | null
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NotificationDeliveryUncheckedUpdateManyWithoutNotificationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    channel?: EnumDeliveryChannelFieldUpdateOperationsInput | $Enums.DeliveryChannel
    status?: EnumDeliveryStatusFieldUpdateOperationsInput | $Enums.DeliveryStatus
    recipient?: StringFieldUpdateOperationsInput | string
    attemptCount?: IntFieldUpdateOperationsInput | number
    lastError?: NullableStringFieldUpdateOperationsInput | string | null
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
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