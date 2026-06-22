
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
 * Model OnboardingCase
 * 
 */
export type OnboardingCase = $Result.DefaultSelection<Prisma.$OnboardingCasePayload>
/**
 * Model OnboardingTask
 * 
 */
export type OnboardingTask = $Result.DefaultSelection<Prisma.$OnboardingTaskPayload>
/**
 * Model OnboardingDocument
 * 
 */
export type OnboardingDocument = $Result.DefaultSelection<Prisma.$OnboardingDocumentPayload>
/**
 * Model Verification
 * 
 */
export type Verification = $Result.DefaultSelection<Prisma.$VerificationPayload>
/**
 * Model Outbox
 * 
 */
export type Outbox = $Result.DefaultSelection<Prisma.$OutboxPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const OnboardingCaseStatus: {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  BLOCKED: 'BLOCKED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

export type OnboardingCaseStatus = (typeof OnboardingCaseStatus)[keyof typeof OnboardingCaseStatus]


export const OnboardingTaskStatus: {
  TODO: 'TODO',
  SUBMITTED: 'SUBMITTED',
  DONE: 'DONE',
  WAIVED: 'WAIVED'
};

export type OnboardingTaskStatus = (typeof OnboardingTaskStatus)[keyof typeof OnboardingTaskStatus]


export const OnboardingTaskKind: {
  PROFILE: 'PROFILE',
  DOCUMENT: 'DOCUMENT',
  VERIFICATION: 'VERIFICATION',
  ACKNOWLEDGE: 'ACKNOWLEDGE',
  FIRST_DAY: 'FIRST_DAY'
};

export type OnboardingTaskKind = (typeof OnboardingTaskKind)[keyof typeof OnboardingTaskKind]


export const VerificationType: {
  PAN: 'PAN',
  BANK_ACCOUNT: 'BANK_ACCOUNT',
  ID: 'ID'
};

export type VerificationType = (typeof VerificationType)[keyof typeof VerificationType]


export const VerificationStatus: {
  NOT_STARTED: 'NOT_STARTED',
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  FAILED: 'FAILED',
  NEEDS_PROVIDER: 'NEEDS_PROVIDER'
};

export type VerificationStatus = (typeof VerificationStatus)[keyof typeof VerificationStatus]


export const OutboxStatus: {
  PENDING: 'PENDING',
  SENT: 'SENT',
  FAILED: 'FAILED'
};

export type OutboxStatus = (typeof OutboxStatus)[keyof typeof OutboxStatus]

}

export type OnboardingCaseStatus = $Enums.OnboardingCaseStatus

export const OnboardingCaseStatus: typeof $Enums.OnboardingCaseStatus

export type OnboardingTaskStatus = $Enums.OnboardingTaskStatus

export const OnboardingTaskStatus: typeof $Enums.OnboardingTaskStatus

export type OnboardingTaskKind = $Enums.OnboardingTaskKind

export const OnboardingTaskKind: typeof $Enums.OnboardingTaskKind

export type VerificationType = $Enums.VerificationType

export const VerificationType: typeof $Enums.VerificationType

export type VerificationStatus = $Enums.VerificationStatus

export const VerificationStatus: typeof $Enums.VerificationStatus

export type OutboxStatus = $Enums.OutboxStatus

export const OutboxStatus: typeof $Enums.OutboxStatus

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more OnboardingCases
 * const onboardingCases = await prisma.onboardingCase.findMany()
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
   * // Fetch zero or more OnboardingCases
   * const onboardingCases = await prisma.onboardingCase.findMany()
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
   * `prisma.onboardingCase`: Exposes CRUD operations for the **OnboardingCase** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more OnboardingCases
    * const onboardingCases = await prisma.onboardingCase.findMany()
    * ```
    */
  get onboardingCase(): Prisma.OnboardingCaseDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.onboardingTask`: Exposes CRUD operations for the **OnboardingTask** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more OnboardingTasks
    * const onboardingTasks = await prisma.onboardingTask.findMany()
    * ```
    */
  get onboardingTask(): Prisma.OnboardingTaskDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.onboardingDocument`: Exposes CRUD operations for the **OnboardingDocument** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more OnboardingDocuments
    * const onboardingDocuments = await prisma.onboardingDocument.findMany()
    * ```
    */
  get onboardingDocument(): Prisma.OnboardingDocumentDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.verification`: Exposes CRUD operations for the **Verification** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Verifications
    * const verifications = await prisma.verification.findMany()
    * ```
    */
  get verification(): Prisma.VerificationDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.outbox`: Exposes CRUD operations for the **Outbox** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Outboxes
    * const outboxes = await prisma.outbox.findMany()
    * ```
    */
  get outbox(): Prisma.OutboxDelegate<ExtArgs, ClientOptions>;
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
    OnboardingCase: 'OnboardingCase',
    OnboardingTask: 'OnboardingTask',
    OnboardingDocument: 'OnboardingDocument',
    Verification: 'Verification',
    Outbox: 'Outbox'
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
      modelProps: "onboardingCase" | "onboardingTask" | "onboardingDocument" | "verification" | "outbox"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      OnboardingCase: {
        payload: Prisma.$OnboardingCasePayload<ExtArgs>
        fields: Prisma.OnboardingCaseFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OnboardingCaseFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingCasePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OnboardingCaseFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingCasePayload>
          }
          findFirst: {
            args: Prisma.OnboardingCaseFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingCasePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OnboardingCaseFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingCasePayload>
          }
          findMany: {
            args: Prisma.OnboardingCaseFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingCasePayload>[]
          }
          create: {
            args: Prisma.OnboardingCaseCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingCasePayload>
          }
          createMany: {
            args: Prisma.OnboardingCaseCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OnboardingCaseCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingCasePayload>[]
          }
          delete: {
            args: Prisma.OnboardingCaseDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingCasePayload>
          }
          update: {
            args: Prisma.OnboardingCaseUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingCasePayload>
          }
          deleteMany: {
            args: Prisma.OnboardingCaseDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OnboardingCaseUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.OnboardingCaseUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingCasePayload>[]
          }
          upsert: {
            args: Prisma.OnboardingCaseUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingCasePayload>
          }
          aggregate: {
            args: Prisma.OnboardingCaseAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOnboardingCase>
          }
          groupBy: {
            args: Prisma.OnboardingCaseGroupByArgs<ExtArgs>
            result: $Utils.Optional<OnboardingCaseGroupByOutputType>[]
          }
          count: {
            args: Prisma.OnboardingCaseCountArgs<ExtArgs>
            result: $Utils.Optional<OnboardingCaseCountAggregateOutputType> | number
          }
        }
      }
      OnboardingTask: {
        payload: Prisma.$OnboardingTaskPayload<ExtArgs>
        fields: Prisma.OnboardingTaskFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OnboardingTaskFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingTaskPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OnboardingTaskFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingTaskPayload>
          }
          findFirst: {
            args: Prisma.OnboardingTaskFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingTaskPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OnboardingTaskFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingTaskPayload>
          }
          findMany: {
            args: Prisma.OnboardingTaskFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingTaskPayload>[]
          }
          create: {
            args: Prisma.OnboardingTaskCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingTaskPayload>
          }
          createMany: {
            args: Prisma.OnboardingTaskCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OnboardingTaskCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingTaskPayload>[]
          }
          delete: {
            args: Prisma.OnboardingTaskDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingTaskPayload>
          }
          update: {
            args: Prisma.OnboardingTaskUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingTaskPayload>
          }
          deleteMany: {
            args: Prisma.OnboardingTaskDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OnboardingTaskUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.OnboardingTaskUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingTaskPayload>[]
          }
          upsert: {
            args: Prisma.OnboardingTaskUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingTaskPayload>
          }
          aggregate: {
            args: Prisma.OnboardingTaskAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOnboardingTask>
          }
          groupBy: {
            args: Prisma.OnboardingTaskGroupByArgs<ExtArgs>
            result: $Utils.Optional<OnboardingTaskGroupByOutputType>[]
          }
          count: {
            args: Prisma.OnboardingTaskCountArgs<ExtArgs>
            result: $Utils.Optional<OnboardingTaskCountAggregateOutputType> | number
          }
        }
      }
      OnboardingDocument: {
        payload: Prisma.$OnboardingDocumentPayload<ExtArgs>
        fields: Prisma.OnboardingDocumentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OnboardingDocumentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingDocumentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OnboardingDocumentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingDocumentPayload>
          }
          findFirst: {
            args: Prisma.OnboardingDocumentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingDocumentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OnboardingDocumentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingDocumentPayload>
          }
          findMany: {
            args: Prisma.OnboardingDocumentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingDocumentPayload>[]
          }
          create: {
            args: Prisma.OnboardingDocumentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingDocumentPayload>
          }
          createMany: {
            args: Prisma.OnboardingDocumentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OnboardingDocumentCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingDocumentPayload>[]
          }
          delete: {
            args: Prisma.OnboardingDocumentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingDocumentPayload>
          }
          update: {
            args: Prisma.OnboardingDocumentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingDocumentPayload>
          }
          deleteMany: {
            args: Prisma.OnboardingDocumentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OnboardingDocumentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.OnboardingDocumentUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingDocumentPayload>[]
          }
          upsert: {
            args: Prisma.OnboardingDocumentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingDocumentPayload>
          }
          aggregate: {
            args: Prisma.OnboardingDocumentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOnboardingDocument>
          }
          groupBy: {
            args: Prisma.OnboardingDocumentGroupByArgs<ExtArgs>
            result: $Utils.Optional<OnboardingDocumentGroupByOutputType>[]
          }
          count: {
            args: Prisma.OnboardingDocumentCountArgs<ExtArgs>
            result: $Utils.Optional<OnboardingDocumentCountAggregateOutputType> | number
          }
        }
      }
      Verification: {
        payload: Prisma.$VerificationPayload<ExtArgs>
        fields: Prisma.VerificationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.VerificationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.VerificationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationPayload>
          }
          findFirst: {
            args: Prisma.VerificationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.VerificationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationPayload>
          }
          findMany: {
            args: Prisma.VerificationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationPayload>[]
          }
          create: {
            args: Prisma.VerificationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationPayload>
          }
          createMany: {
            args: Prisma.VerificationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.VerificationCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationPayload>[]
          }
          delete: {
            args: Prisma.VerificationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationPayload>
          }
          update: {
            args: Prisma.VerificationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationPayload>
          }
          deleteMany: {
            args: Prisma.VerificationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.VerificationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.VerificationUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationPayload>[]
          }
          upsert: {
            args: Prisma.VerificationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationPayload>
          }
          aggregate: {
            args: Prisma.VerificationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateVerification>
          }
          groupBy: {
            args: Prisma.VerificationGroupByArgs<ExtArgs>
            result: $Utils.Optional<VerificationGroupByOutputType>[]
          }
          count: {
            args: Prisma.VerificationCountArgs<ExtArgs>
            result: $Utils.Optional<VerificationCountAggregateOutputType> | number
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
    onboardingCase?: OnboardingCaseOmit
    onboardingTask?: OnboardingTaskOmit
    onboardingDocument?: OnboardingDocumentOmit
    verification?: VerificationOmit
    outbox?: OutboxOmit
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
   * Count Type OnboardingCaseCountOutputType
   */

  export type OnboardingCaseCountOutputType = {
    tasks: number
    documents: number
    verifications: number
  }

  export type OnboardingCaseCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tasks?: boolean | OnboardingCaseCountOutputTypeCountTasksArgs
    documents?: boolean | OnboardingCaseCountOutputTypeCountDocumentsArgs
    verifications?: boolean | OnboardingCaseCountOutputTypeCountVerificationsArgs
  }

  // Custom InputTypes
  /**
   * OnboardingCaseCountOutputType without action
   */
  export type OnboardingCaseCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingCaseCountOutputType
     */
    select?: OnboardingCaseCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * OnboardingCaseCountOutputType without action
   */
  export type OnboardingCaseCountOutputTypeCountTasksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OnboardingTaskWhereInput
  }

  /**
   * OnboardingCaseCountOutputType without action
   */
  export type OnboardingCaseCountOutputTypeCountDocumentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OnboardingDocumentWhereInput
  }

  /**
   * OnboardingCaseCountOutputType without action
   */
  export type OnboardingCaseCountOutputTypeCountVerificationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: VerificationWhereInput
  }


  /**
   * Models
   */

  /**
   * Model OnboardingCase
   */

  export type AggregateOnboardingCase = {
    _count: OnboardingCaseCountAggregateOutputType | null
    _min: OnboardingCaseMinAggregateOutputType | null
    _max: OnboardingCaseMaxAggregateOutputType | null
  }

  export type OnboardingCaseMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    candidateId: string | null
    applicationId: string | null
    offerId: string | null
    candidateName: string | null
    candidateEmail: string | null
    jobTitle: string | null
    status: $Enums.OnboardingCaseStatus | null
    portalToken: string | null
    startDate: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OnboardingCaseMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    candidateId: string | null
    applicationId: string | null
    offerId: string | null
    candidateName: string | null
    candidateEmail: string | null
    jobTitle: string | null
    status: $Enums.OnboardingCaseStatus | null
    portalToken: string | null
    startDate: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OnboardingCaseCountAggregateOutputType = {
    id: number
    tenantId: number
    candidateId: number
    applicationId: number
    offerId: number
    candidateName: number
    candidateEmail: number
    jobTitle: number
    status: number
    portalToken: number
    startDate: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type OnboardingCaseMinAggregateInputType = {
    id?: true
    tenantId?: true
    candidateId?: true
    applicationId?: true
    offerId?: true
    candidateName?: true
    candidateEmail?: true
    jobTitle?: true
    status?: true
    portalToken?: true
    startDate?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OnboardingCaseMaxAggregateInputType = {
    id?: true
    tenantId?: true
    candidateId?: true
    applicationId?: true
    offerId?: true
    candidateName?: true
    candidateEmail?: true
    jobTitle?: true
    status?: true
    portalToken?: true
    startDate?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OnboardingCaseCountAggregateInputType = {
    id?: true
    tenantId?: true
    candidateId?: true
    applicationId?: true
    offerId?: true
    candidateName?: true
    candidateEmail?: true
    jobTitle?: true
    status?: true
    portalToken?: true
    startDate?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type OnboardingCaseAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OnboardingCase to aggregate.
     */
    where?: OnboardingCaseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OnboardingCases to fetch.
     */
    orderBy?: OnboardingCaseOrderByWithRelationInput | OnboardingCaseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OnboardingCaseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OnboardingCases from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OnboardingCases.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned OnboardingCases
    **/
    _count?: true | OnboardingCaseCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OnboardingCaseMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OnboardingCaseMaxAggregateInputType
  }

  export type GetOnboardingCaseAggregateType<T extends OnboardingCaseAggregateArgs> = {
        [P in keyof T & keyof AggregateOnboardingCase]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOnboardingCase[P]>
      : GetScalarType<T[P], AggregateOnboardingCase[P]>
  }




  export type OnboardingCaseGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OnboardingCaseWhereInput
    orderBy?: OnboardingCaseOrderByWithAggregationInput | OnboardingCaseOrderByWithAggregationInput[]
    by: OnboardingCaseScalarFieldEnum[] | OnboardingCaseScalarFieldEnum
    having?: OnboardingCaseScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OnboardingCaseCountAggregateInputType | true
    _min?: OnboardingCaseMinAggregateInputType
    _max?: OnboardingCaseMaxAggregateInputType
  }

  export type OnboardingCaseGroupByOutputType = {
    id: string
    tenantId: string
    candidateId: string
    applicationId: string | null
    offerId: string | null
    candidateName: string | null
    candidateEmail: string | null
    jobTitle: string | null
    status: $Enums.OnboardingCaseStatus
    portalToken: string
    startDate: Date | null
    createdAt: Date
    updatedAt: Date
    _count: OnboardingCaseCountAggregateOutputType | null
    _min: OnboardingCaseMinAggregateOutputType | null
    _max: OnboardingCaseMaxAggregateOutputType | null
  }

  type GetOnboardingCaseGroupByPayload<T extends OnboardingCaseGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OnboardingCaseGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OnboardingCaseGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OnboardingCaseGroupByOutputType[P]>
            : GetScalarType<T[P], OnboardingCaseGroupByOutputType[P]>
        }
      >
    >


  export type OnboardingCaseSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    candidateId?: boolean
    applicationId?: boolean
    offerId?: boolean
    candidateName?: boolean
    candidateEmail?: boolean
    jobTitle?: boolean
    status?: boolean
    portalToken?: boolean
    startDate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tasks?: boolean | OnboardingCase$tasksArgs<ExtArgs>
    documents?: boolean | OnboardingCase$documentsArgs<ExtArgs>
    verifications?: boolean | OnboardingCase$verificationsArgs<ExtArgs>
    _count?: boolean | OnboardingCaseCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["onboardingCase"]>

  export type OnboardingCaseSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    candidateId?: boolean
    applicationId?: boolean
    offerId?: boolean
    candidateName?: boolean
    candidateEmail?: boolean
    jobTitle?: boolean
    status?: boolean
    portalToken?: boolean
    startDate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["onboardingCase"]>

  export type OnboardingCaseSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    candidateId?: boolean
    applicationId?: boolean
    offerId?: boolean
    candidateName?: boolean
    candidateEmail?: boolean
    jobTitle?: boolean
    status?: boolean
    portalToken?: boolean
    startDate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["onboardingCase"]>

  export type OnboardingCaseSelectScalar = {
    id?: boolean
    tenantId?: boolean
    candidateId?: boolean
    applicationId?: boolean
    offerId?: boolean
    candidateName?: boolean
    candidateEmail?: boolean
    jobTitle?: boolean
    status?: boolean
    portalToken?: boolean
    startDate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type OnboardingCaseOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "candidateId" | "applicationId" | "offerId" | "candidateName" | "candidateEmail" | "jobTitle" | "status" | "portalToken" | "startDate" | "createdAt" | "updatedAt", ExtArgs["result"]["onboardingCase"]>
  export type OnboardingCaseInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tasks?: boolean | OnboardingCase$tasksArgs<ExtArgs>
    documents?: boolean | OnboardingCase$documentsArgs<ExtArgs>
    verifications?: boolean | OnboardingCase$verificationsArgs<ExtArgs>
    _count?: boolean | OnboardingCaseCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type OnboardingCaseIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type OnboardingCaseIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $OnboardingCasePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "OnboardingCase"
    objects: {
      tasks: Prisma.$OnboardingTaskPayload<ExtArgs>[]
      documents: Prisma.$OnboardingDocumentPayload<ExtArgs>[]
      verifications: Prisma.$VerificationPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      candidateId: string
      applicationId: string | null
      offerId: string | null
      candidateName: string | null
      candidateEmail: string | null
      jobTitle: string | null
      status: $Enums.OnboardingCaseStatus
      portalToken: string
      startDate: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["onboardingCase"]>
    composites: {}
  }

  type OnboardingCaseGetPayload<S extends boolean | null | undefined | OnboardingCaseDefaultArgs> = $Result.GetResult<Prisma.$OnboardingCasePayload, S>

  type OnboardingCaseCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OnboardingCaseFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OnboardingCaseCountAggregateInputType | true
    }

  export interface OnboardingCaseDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['OnboardingCase'], meta: { name: 'OnboardingCase' } }
    /**
     * Find zero or one OnboardingCase that matches the filter.
     * @param {OnboardingCaseFindUniqueArgs} args - Arguments to find a OnboardingCase
     * @example
     * // Get one OnboardingCase
     * const onboardingCase = await prisma.onboardingCase.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OnboardingCaseFindUniqueArgs>(args: SelectSubset<T, OnboardingCaseFindUniqueArgs<ExtArgs>>): Prisma__OnboardingCaseClient<$Result.GetResult<Prisma.$OnboardingCasePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one OnboardingCase that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OnboardingCaseFindUniqueOrThrowArgs} args - Arguments to find a OnboardingCase
     * @example
     * // Get one OnboardingCase
     * const onboardingCase = await prisma.onboardingCase.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OnboardingCaseFindUniqueOrThrowArgs>(args: SelectSubset<T, OnboardingCaseFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OnboardingCaseClient<$Result.GetResult<Prisma.$OnboardingCasePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OnboardingCase that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingCaseFindFirstArgs} args - Arguments to find a OnboardingCase
     * @example
     * // Get one OnboardingCase
     * const onboardingCase = await prisma.onboardingCase.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OnboardingCaseFindFirstArgs>(args?: SelectSubset<T, OnboardingCaseFindFirstArgs<ExtArgs>>): Prisma__OnboardingCaseClient<$Result.GetResult<Prisma.$OnboardingCasePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OnboardingCase that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingCaseFindFirstOrThrowArgs} args - Arguments to find a OnboardingCase
     * @example
     * // Get one OnboardingCase
     * const onboardingCase = await prisma.onboardingCase.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OnboardingCaseFindFirstOrThrowArgs>(args?: SelectSubset<T, OnboardingCaseFindFirstOrThrowArgs<ExtArgs>>): Prisma__OnboardingCaseClient<$Result.GetResult<Prisma.$OnboardingCasePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more OnboardingCases that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingCaseFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all OnboardingCases
     * const onboardingCases = await prisma.onboardingCase.findMany()
     * 
     * // Get first 10 OnboardingCases
     * const onboardingCases = await prisma.onboardingCase.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const onboardingCaseWithIdOnly = await prisma.onboardingCase.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OnboardingCaseFindManyArgs>(args?: SelectSubset<T, OnboardingCaseFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OnboardingCasePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a OnboardingCase.
     * @param {OnboardingCaseCreateArgs} args - Arguments to create a OnboardingCase.
     * @example
     * // Create one OnboardingCase
     * const OnboardingCase = await prisma.onboardingCase.create({
     *   data: {
     *     // ... data to create a OnboardingCase
     *   }
     * })
     * 
     */
    create<T extends OnboardingCaseCreateArgs>(args: SelectSubset<T, OnboardingCaseCreateArgs<ExtArgs>>): Prisma__OnboardingCaseClient<$Result.GetResult<Prisma.$OnboardingCasePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many OnboardingCases.
     * @param {OnboardingCaseCreateManyArgs} args - Arguments to create many OnboardingCases.
     * @example
     * // Create many OnboardingCases
     * const onboardingCase = await prisma.onboardingCase.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OnboardingCaseCreateManyArgs>(args?: SelectSubset<T, OnboardingCaseCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many OnboardingCases and returns the data saved in the database.
     * @param {OnboardingCaseCreateManyAndReturnArgs} args - Arguments to create many OnboardingCases.
     * @example
     * // Create many OnboardingCases
     * const onboardingCase = await prisma.onboardingCase.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many OnboardingCases and only return the `id`
     * const onboardingCaseWithIdOnly = await prisma.onboardingCase.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OnboardingCaseCreateManyAndReturnArgs>(args?: SelectSubset<T, OnboardingCaseCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OnboardingCasePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a OnboardingCase.
     * @param {OnboardingCaseDeleteArgs} args - Arguments to delete one OnboardingCase.
     * @example
     * // Delete one OnboardingCase
     * const OnboardingCase = await prisma.onboardingCase.delete({
     *   where: {
     *     // ... filter to delete one OnboardingCase
     *   }
     * })
     * 
     */
    delete<T extends OnboardingCaseDeleteArgs>(args: SelectSubset<T, OnboardingCaseDeleteArgs<ExtArgs>>): Prisma__OnboardingCaseClient<$Result.GetResult<Prisma.$OnboardingCasePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one OnboardingCase.
     * @param {OnboardingCaseUpdateArgs} args - Arguments to update one OnboardingCase.
     * @example
     * // Update one OnboardingCase
     * const onboardingCase = await prisma.onboardingCase.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OnboardingCaseUpdateArgs>(args: SelectSubset<T, OnboardingCaseUpdateArgs<ExtArgs>>): Prisma__OnboardingCaseClient<$Result.GetResult<Prisma.$OnboardingCasePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more OnboardingCases.
     * @param {OnboardingCaseDeleteManyArgs} args - Arguments to filter OnboardingCases to delete.
     * @example
     * // Delete a few OnboardingCases
     * const { count } = await prisma.onboardingCase.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OnboardingCaseDeleteManyArgs>(args?: SelectSubset<T, OnboardingCaseDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OnboardingCases.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingCaseUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many OnboardingCases
     * const onboardingCase = await prisma.onboardingCase.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OnboardingCaseUpdateManyArgs>(args: SelectSubset<T, OnboardingCaseUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OnboardingCases and returns the data updated in the database.
     * @param {OnboardingCaseUpdateManyAndReturnArgs} args - Arguments to update many OnboardingCases.
     * @example
     * // Update many OnboardingCases
     * const onboardingCase = await prisma.onboardingCase.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more OnboardingCases and only return the `id`
     * const onboardingCaseWithIdOnly = await prisma.onboardingCase.updateManyAndReturn({
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
    updateManyAndReturn<T extends OnboardingCaseUpdateManyAndReturnArgs>(args: SelectSubset<T, OnboardingCaseUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OnboardingCasePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one OnboardingCase.
     * @param {OnboardingCaseUpsertArgs} args - Arguments to update or create a OnboardingCase.
     * @example
     * // Update or create a OnboardingCase
     * const onboardingCase = await prisma.onboardingCase.upsert({
     *   create: {
     *     // ... data to create a OnboardingCase
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the OnboardingCase we want to update
     *   }
     * })
     */
    upsert<T extends OnboardingCaseUpsertArgs>(args: SelectSubset<T, OnboardingCaseUpsertArgs<ExtArgs>>): Prisma__OnboardingCaseClient<$Result.GetResult<Prisma.$OnboardingCasePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of OnboardingCases.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingCaseCountArgs} args - Arguments to filter OnboardingCases to count.
     * @example
     * // Count the number of OnboardingCases
     * const count = await prisma.onboardingCase.count({
     *   where: {
     *     // ... the filter for the OnboardingCases we want to count
     *   }
     * })
    **/
    count<T extends OnboardingCaseCountArgs>(
      args?: Subset<T, OnboardingCaseCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OnboardingCaseCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a OnboardingCase.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingCaseAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends OnboardingCaseAggregateArgs>(args: Subset<T, OnboardingCaseAggregateArgs>): Prisma.PrismaPromise<GetOnboardingCaseAggregateType<T>>

    /**
     * Group by OnboardingCase.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingCaseGroupByArgs} args - Group by arguments.
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
      T extends OnboardingCaseGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OnboardingCaseGroupByArgs['orderBy'] }
        : { orderBy?: OnboardingCaseGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, OnboardingCaseGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOnboardingCaseGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the OnboardingCase model
   */
  readonly fields: OnboardingCaseFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for OnboardingCase.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OnboardingCaseClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tasks<T extends OnboardingCase$tasksArgs<ExtArgs> = {}>(args?: Subset<T, OnboardingCase$tasksArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OnboardingTaskPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    documents<T extends OnboardingCase$documentsArgs<ExtArgs> = {}>(args?: Subset<T, OnboardingCase$documentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OnboardingDocumentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    verifications<T extends OnboardingCase$verificationsArgs<ExtArgs> = {}>(args?: Subset<T, OnboardingCase$verificationsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VerificationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the OnboardingCase model
   */
  interface OnboardingCaseFieldRefs {
    readonly id: FieldRef<"OnboardingCase", 'String'>
    readonly tenantId: FieldRef<"OnboardingCase", 'String'>
    readonly candidateId: FieldRef<"OnboardingCase", 'String'>
    readonly applicationId: FieldRef<"OnboardingCase", 'String'>
    readonly offerId: FieldRef<"OnboardingCase", 'String'>
    readonly candidateName: FieldRef<"OnboardingCase", 'String'>
    readonly candidateEmail: FieldRef<"OnboardingCase", 'String'>
    readonly jobTitle: FieldRef<"OnboardingCase", 'String'>
    readonly status: FieldRef<"OnboardingCase", 'OnboardingCaseStatus'>
    readonly portalToken: FieldRef<"OnboardingCase", 'String'>
    readonly startDate: FieldRef<"OnboardingCase", 'DateTime'>
    readonly createdAt: FieldRef<"OnboardingCase", 'DateTime'>
    readonly updatedAt: FieldRef<"OnboardingCase", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * OnboardingCase findUnique
   */
  export type OnboardingCaseFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingCase
     */
    select?: OnboardingCaseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingCase
     */
    omit?: OnboardingCaseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingCaseInclude<ExtArgs> | null
    /**
     * Filter, which OnboardingCase to fetch.
     */
    where: OnboardingCaseWhereUniqueInput
  }

  /**
   * OnboardingCase findUniqueOrThrow
   */
  export type OnboardingCaseFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingCase
     */
    select?: OnboardingCaseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingCase
     */
    omit?: OnboardingCaseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingCaseInclude<ExtArgs> | null
    /**
     * Filter, which OnboardingCase to fetch.
     */
    where: OnboardingCaseWhereUniqueInput
  }

  /**
   * OnboardingCase findFirst
   */
  export type OnboardingCaseFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingCase
     */
    select?: OnboardingCaseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingCase
     */
    omit?: OnboardingCaseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingCaseInclude<ExtArgs> | null
    /**
     * Filter, which OnboardingCase to fetch.
     */
    where?: OnboardingCaseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OnboardingCases to fetch.
     */
    orderBy?: OnboardingCaseOrderByWithRelationInput | OnboardingCaseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OnboardingCases.
     */
    cursor?: OnboardingCaseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OnboardingCases from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OnboardingCases.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OnboardingCases.
     */
    distinct?: OnboardingCaseScalarFieldEnum | OnboardingCaseScalarFieldEnum[]
  }

  /**
   * OnboardingCase findFirstOrThrow
   */
  export type OnboardingCaseFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingCase
     */
    select?: OnboardingCaseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingCase
     */
    omit?: OnboardingCaseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingCaseInclude<ExtArgs> | null
    /**
     * Filter, which OnboardingCase to fetch.
     */
    where?: OnboardingCaseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OnboardingCases to fetch.
     */
    orderBy?: OnboardingCaseOrderByWithRelationInput | OnboardingCaseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OnboardingCases.
     */
    cursor?: OnboardingCaseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OnboardingCases from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OnboardingCases.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OnboardingCases.
     */
    distinct?: OnboardingCaseScalarFieldEnum | OnboardingCaseScalarFieldEnum[]
  }

  /**
   * OnboardingCase findMany
   */
  export type OnboardingCaseFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingCase
     */
    select?: OnboardingCaseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingCase
     */
    omit?: OnboardingCaseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingCaseInclude<ExtArgs> | null
    /**
     * Filter, which OnboardingCases to fetch.
     */
    where?: OnboardingCaseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OnboardingCases to fetch.
     */
    orderBy?: OnboardingCaseOrderByWithRelationInput | OnboardingCaseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing OnboardingCases.
     */
    cursor?: OnboardingCaseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OnboardingCases from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OnboardingCases.
     */
    skip?: number
    distinct?: OnboardingCaseScalarFieldEnum | OnboardingCaseScalarFieldEnum[]
  }

  /**
   * OnboardingCase create
   */
  export type OnboardingCaseCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingCase
     */
    select?: OnboardingCaseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingCase
     */
    omit?: OnboardingCaseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingCaseInclude<ExtArgs> | null
    /**
     * The data needed to create a OnboardingCase.
     */
    data: XOR<OnboardingCaseCreateInput, OnboardingCaseUncheckedCreateInput>
  }

  /**
   * OnboardingCase createMany
   */
  export type OnboardingCaseCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many OnboardingCases.
     */
    data: OnboardingCaseCreateManyInput | OnboardingCaseCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OnboardingCase createManyAndReturn
   */
  export type OnboardingCaseCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingCase
     */
    select?: OnboardingCaseSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingCase
     */
    omit?: OnboardingCaseOmit<ExtArgs> | null
    /**
     * The data used to create many OnboardingCases.
     */
    data: OnboardingCaseCreateManyInput | OnboardingCaseCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OnboardingCase update
   */
  export type OnboardingCaseUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingCase
     */
    select?: OnboardingCaseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingCase
     */
    omit?: OnboardingCaseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingCaseInclude<ExtArgs> | null
    /**
     * The data needed to update a OnboardingCase.
     */
    data: XOR<OnboardingCaseUpdateInput, OnboardingCaseUncheckedUpdateInput>
    /**
     * Choose, which OnboardingCase to update.
     */
    where: OnboardingCaseWhereUniqueInput
  }

  /**
   * OnboardingCase updateMany
   */
  export type OnboardingCaseUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update OnboardingCases.
     */
    data: XOR<OnboardingCaseUpdateManyMutationInput, OnboardingCaseUncheckedUpdateManyInput>
    /**
     * Filter which OnboardingCases to update
     */
    where?: OnboardingCaseWhereInput
    /**
     * Limit how many OnboardingCases to update.
     */
    limit?: number
  }

  /**
   * OnboardingCase updateManyAndReturn
   */
  export type OnboardingCaseUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingCase
     */
    select?: OnboardingCaseSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingCase
     */
    omit?: OnboardingCaseOmit<ExtArgs> | null
    /**
     * The data used to update OnboardingCases.
     */
    data: XOR<OnboardingCaseUpdateManyMutationInput, OnboardingCaseUncheckedUpdateManyInput>
    /**
     * Filter which OnboardingCases to update
     */
    where?: OnboardingCaseWhereInput
    /**
     * Limit how many OnboardingCases to update.
     */
    limit?: number
  }

  /**
   * OnboardingCase upsert
   */
  export type OnboardingCaseUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingCase
     */
    select?: OnboardingCaseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingCase
     */
    omit?: OnboardingCaseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingCaseInclude<ExtArgs> | null
    /**
     * The filter to search for the OnboardingCase to update in case it exists.
     */
    where: OnboardingCaseWhereUniqueInput
    /**
     * In case the OnboardingCase found by the `where` argument doesn't exist, create a new OnboardingCase with this data.
     */
    create: XOR<OnboardingCaseCreateInput, OnboardingCaseUncheckedCreateInput>
    /**
     * In case the OnboardingCase was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OnboardingCaseUpdateInput, OnboardingCaseUncheckedUpdateInput>
  }

  /**
   * OnboardingCase delete
   */
  export type OnboardingCaseDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingCase
     */
    select?: OnboardingCaseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingCase
     */
    omit?: OnboardingCaseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingCaseInclude<ExtArgs> | null
    /**
     * Filter which OnboardingCase to delete.
     */
    where: OnboardingCaseWhereUniqueInput
  }

  /**
   * OnboardingCase deleteMany
   */
  export type OnboardingCaseDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OnboardingCases to delete
     */
    where?: OnboardingCaseWhereInput
    /**
     * Limit how many OnboardingCases to delete.
     */
    limit?: number
  }

  /**
   * OnboardingCase.tasks
   */
  export type OnboardingCase$tasksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingTask
     */
    select?: OnboardingTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingTask
     */
    omit?: OnboardingTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingTaskInclude<ExtArgs> | null
    where?: OnboardingTaskWhereInput
    orderBy?: OnboardingTaskOrderByWithRelationInput | OnboardingTaskOrderByWithRelationInput[]
    cursor?: OnboardingTaskWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OnboardingTaskScalarFieldEnum | OnboardingTaskScalarFieldEnum[]
  }

  /**
   * OnboardingCase.documents
   */
  export type OnboardingCase$documentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingDocument
     */
    select?: OnboardingDocumentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingDocument
     */
    omit?: OnboardingDocumentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingDocumentInclude<ExtArgs> | null
    where?: OnboardingDocumentWhereInput
    orderBy?: OnboardingDocumentOrderByWithRelationInput | OnboardingDocumentOrderByWithRelationInput[]
    cursor?: OnboardingDocumentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OnboardingDocumentScalarFieldEnum | OnboardingDocumentScalarFieldEnum[]
  }

  /**
   * OnboardingCase.verifications
   */
  export type OnboardingCase$verificationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Verification
     */
    select?: VerificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Verification
     */
    omit?: VerificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VerificationInclude<ExtArgs> | null
    where?: VerificationWhereInput
    orderBy?: VerificationOrderByWithRelationInput | VerificationOrderByWithRelationInput[]
    cursor?: VerificationWhereUniqueInput
    take?: number
    skip?: number
    distinct?: VerificationScalarFieldEnum | VerificationScalarFieldEnum[]
  }

  /**
   * OnboardingCase without action
   */
  export type OnboardingCaseDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingCase
     */
    select?: OnboardingCaseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingCase
     */
    omit?: OnboardingCaseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingCaseInclude<ExtArgs> | null
  }


  /**
   * Model OnboardingTask
   */

  export type AggregateOnboardingTask = {
    _count: OnboardingTaskCountAggregateOutputType | null
    _avg: OnboardingTaskAvgAggregateOutputType | null
    _sum: OnboardingTaskSumAggregateOutputType | null
    _min: OnboardingTaskMinAggregateOutputType | null
    _max: OnboardingTaskMaxAggregateOutputType | null
  }

  export type OnboardingTaskAvgAggregateOutputType = {
    order: number | null
  }

  export type OnboardingTaskSumAggregateOutputType = {
    order: number | null
  }

  export type OnboardingTaskMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    caseId: string | null
    kind: $Enums.OnboardingTaskKind | null
    title: string | null
    description: string | null
    required: boolean | null
    status: $Enums.OnboardingTaskStatus | null
    order: number | null
    completedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OnboardingTaskMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    caseId: string | null
    kind: $Enums.OnboardingTaskKind | null
    title: string | null
    description: string | null
    required: boolean | null
    status: $Enums.OnboardingTaskStatus | null
    order: number | null
    completedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OnboardingTaskCountAggregateOutputType = {
    id: number
    tenantId: number
    caseId: number
    kind: number
    title: number
    description: number
    required: number
    status: number
    order: number
    completedAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type OnboardingTaskAvgAggregateInputType = {
    order?: true
  }

  export type OnboardingTaskSumAggregateInputType = {
    order?: true
  }

  export type OnboardingTaskMinAggregateInputType = {
    id?: true
    tenantId?: true
    caseId?: true
    kind?: true
    title?: true
    description?: true
    required?: true
    status?: true
    order?: true
    completedAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OnboardingTaskMaxAggregateInputType = {
    id?: true
    tenantId?: true
    caseId?: true
    kind?: true
    title?: true
    description?: true
    required?: true
    status?: true
    order?: true
    completedAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OnboardingTaskCountAggregateInputType = {
    id?: true
    tenantId?: true
    caseId?: true
    kind?: true
    title?: true
    description?: true
    required?: true
    status?: true
    order?: true
    completedAt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type OnboardingTaskAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OnboardingTask to aggregate.
     */
    where?: OnboardingTaskWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OnboardingTasks to fetch.
     */
    orderBy?: OnboardingTaskOrderByWithRelationInput | OnboardingTaskOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OnboardingTaskWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OnboardingTasks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OnboardingTasks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned OnboardingTasks
    **/
    _count?: true | OnboardingTaskCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: OnboardingTaskAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: OnboardingTaskSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OnboardingTaskMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OnboardingTaskMaxAggregateInputType
  }

  export type GetOnboardingTaskAggregateType<T extends OnboardingTaskAggregateArgs> = {
        [P in keyof T & keyof AggregateOnboardingTask]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOnboardingTask[P]>
      : GetScalarType<T[P], AggregateOnboardingTask[P]>
  }




  export type OnboardingTaskGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OnboardingTaskWhereInput
    orderBy?: OnboardingTaskOrderByWithAggregationInput | OnboardingTaskOrderByWithAggregationInput[]
    by: OnboardingTaskScalarFieldEnum[] | OnboardingTaskScalarFieldEnum
    having?: OnboardingTaskScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OnboardingTaskCountAggregateInputType | true
    _avg?: OnboardingTaskAvgAggregateInputType
    _sum?: OnboardingTaskSumAggregateInputType
    _min?: OnboardingTaskMinAggregateInputType
    _max?: OnboardingTaskMaxAggregateInputType
  }

  export type OnboardingTaskGroupByOutputType = {
    id: string
    tenantId: string
    caseId: string
    kind: $Enums.OnboardingTaskKind
    title: string
    description: string | null
    required: boolean
    status: $Enums.OnboardingTaskStatus
    order: number
    completedAt: Date | null
    createdAt: Date
    updatedAt: Date
    _count: OnboardingTaskCountAggregateOutputType | null
    _avg: OnboardingTaskAvgAggregateOutputType | null
    _sum: OnboardingTaskSumAggregateOutputType | null
    _min: OnboardingTaskMinAggregateOutputType | null
    _max: OnboardingTaskMaxAggregateOutputType | null
  }

  type GetOnboardingTaskGroupByPayload<T extends OnboardingTaskGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OnboardingTaskGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OnboardingTaskGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OnboardingTaskGroupByOutputType[P]>
            : GetScalarType<T[P], OnboardingTaskGroupByOutputType[P]>
        }
      >
    >


  export type OnboardingTaskSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    caseId?: boolean
    kind?: boolean
    title?: boolean
    description?: boolean
    required?: boolean
    status?: boolean
    order?: boolean
    completedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    case?: boolean | OnboardingCaseDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["onboardingTask"]>

  export type OnboardingTaskSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    caseId?: boolean
    kind?: boolean
    title?: boolean
    description?: boolean
    required?: boolean
    status?: boolean
    order?: boolean
    completedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    case?: boolean | OnboardingCaseDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["onboardingTask"]>

  export type OnboardingTaskSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    caseId?: boolean
    kind?: boolean
    title?: boolean
    description?: boolean
    required?: boolean
    status?: boolean
    order?: boolean
    completedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    case?: boolean | OnboardingCaseDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["onboardingTask"]>

  export type OnboardingTaskSelectScalar = {
    id?: boolean
    tenantId?: boolean
    caseId?: boolean
    kind?: boolean
    title?: boolean
    description?: boolean
    required?: boolean
    status?: boolean
    order?: boolean
    completedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type OnboardingTaskOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "caseId" | "kind" | "title" | "description" | "required" | "status" | "order" | "completedAt" | "createdAt" | "updatedAt", ExtArgs["result"]["onboardingTask"]>
  export type OnboardingTaskInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    case?: boolean | OnboardingCaseDefaultArgs<ExtArgs>
  }
  export type OnboardingTaskIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    case?: boolean | OnboardingCaseDefaultArgs<ExtArgs>
  }
  export type OnboardingTaskIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    case?: boolean | OnboardingCaseDefaultArgs<ExtArgs>
  }

  export type $OnboardingTaskPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "OnboardingTask"
    objects: {
      case: Prisma.$OnboardingCasePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      caseId: string
      kind: $Enums.OnboardingTaskKind
      title: string
      description: string | null
      required: boolean
      status: $Enums.OnboardingTaskStatus
      order: number
      completedAt: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["onboardingTask"]>
    composites: {}
  }

  type OnboardingTaskGetPayload<S extends boolean | null | undefined | OnboardingTaskDefaultArgs> = $Result.GetResult<Prisma.$OnboardingTaskPayload, S>

  type OnboardingTaskCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OnboardingTaskFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OnboardingTaskCountAggregateInputType | true
    }

  export interface OnboardingTaskDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['OnboardingTask'], meta: { name: 'OnboardingTask' } }
    /**
     * Find zero or one OnboardingTask that matches the filter.
     * @param {OnboardingTaskFindUniqueArgs} args - Arguments to find a OnboardingTask
     * @example
     * // Get one OnboardingTask
     * const onboardingTask = await prisma.onboardingTask.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OnboardingTaskFindUniqueArgs>(args: SelectSubset<T, OnboardingTaskFindUniqueArgs<ExtArgs>>): Prisma__OnboardingTaskClient<$Result.GetResult<Prisma.$OnboardingTaskPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one OnboardingTask that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OnboardingTaskFindUniqueOrThrowArgs} args - Arguments to find a OnboardingTask
     * @example
     * // Get one OnboardingTask
     * const onboardingTask = await prisma.onboardingTask.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OnboardingTaskFindUniqueOrThrowArgs>(args: SelectSubset<T, OnboardingTaskFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OnboardingTaskClient<$Result.GetResult<Prisma.$OnboardingTaskPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OnboardingTask that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingTaskFindFirstArgs} args - Arguments to find a OnboardingTask
     * @example
     * // Get one OnboardingTask
     * const onboardingTask = await prisma.onboardingTask.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OnboardingTaskFindFirstArgs>(args?: SelectSubset<T, OnboardingTaskFindFirstArgs<ExtArgs>>): Prisma__OnboardingTaskClient<$Result.GetResult<Prisma.$OnboardingTaskPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OnboardingTask that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingTaskFindFirstOrThrowArgs} args - Arguments to find a OnboardingTask
     * @example
     * // Get one OnboardingTask
     * const onboardingTask = await prisma.onboardingTask.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OnboardingTaskFindFirstOrThrowArgs>(args?: SelectSubset<T, OnboardingTaskFindFirstOrThrowArgs<ExtArgs>>): Prisma__OnboardingTaskClient<$Result.GetResult<Prisma.$OnboardingTaskPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more OnboardingTasks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingTaskFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all OnboardingTasks
     * const onboardingTasks = await prisma.onboardingTask.findMany()
     * 
     * // Get first 10 OnboardingTasks
     * const onboardingTasks = await prisma.onboardingTask.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const onboardingTaskWithIdOnly = await prisma.onboardingTask.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OnboardingTaskFindManyArgs>(args?: SelectSubset<T, OnboardingTaskFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OnboardingTaskPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a OnboardingTask.
     * @param {OnboardingTaskCreateArgs} args - Arguments to create a OnboardingTask.
     * @example
     * // Create one OnboardingTask
     * const OnboardingTask = await prisma.onboardingTask.create({
     *   data: {
     *     // ... data to create a OnboardingTask
     *   }
     * })
     * 
     */
    create<T extends OnboardingTaskCreateArgs>(args: SelectSubset<T, OnboardingTaskCreateArgs<ExtArgs>>): Prisma__OnboardingTaskClient<$Result.GetResult<Prisma.$OnboardingTaskPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many OnboardingTasks.
     * @param {OnboardingTaskCreateManyArgs} args - Arguments to create many OnboardingTasks.
     * @example
     * // Create many OnboardingTasks
     * const onboardingTask = await prisma.onboardingTask.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OnboardingTaskCreateManyArgs>(args?: SelectSubset<T, OnboardingTaskCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many OnboardingTasks and returns the data saved in the database.
     * @param {OnboardingTaskCreateManyAndReturnArgs} args - Arguments to create many OnboardingTasks.
     * @example
     * // Create many OnboardingTasks
     * const onboardingTask = await prisma.onboardingTask.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many OnboardingTasks and only return the `id`
     * const onboardingTaskWithIdOnly = await prisma.onboardingTask.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OnboardingTaskCreateManyAndReturnArgs>(args?: SelectSubset<T, OnboardingTaskCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OnboardingTaskPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a OnboardingTask.
     * @param {OnboardingTaskDeleteArgs} args - Arguments to delete one OnboardingTask.
     * @example
     * // Delete one OnboardingTask
     * const OnboardingTask = await prisma.onboardingTask.delete({
     *   where: {
     *     // ... filter to delete one OnboardingTask
     *   }
     * })
     * 
     */
    delete<T extends OnboardingTaskDeleteArgs>(args: SelectSubset<T, OnboardingTaskDeleteArgs<ExtArgs>>): Prisma__OnboardingTaskClient<$Result.GetResult<Prisma.$OnboardingTaskPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one OnboardingTask.
     * @param {OnboardingTaskUpdateArgs} args - Arguments to update one OnboardingTask.
     * @example
     * // Update one OnboardingTask
     * const onboardingTask = await prisma.onboardingTask.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OnboardingTaskUpdateArgs>(args: SelectSubset<T, OnboardingTaskUpdateArgs<ExtArgs>>): Prisma__OnboardingTaskClient<$Result.GetResult<Prisma.$OnboardingTaskPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more OnboardingTasks.
     * @param {OnboardingTaskDeleteManyArgs} args - Arguments to filter OnboardingTasks to delete.
     * @example
     * // Delete a few OnboardingTasks
     * const { count } = await prisma.onboardingTask.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OnboardingTaskDeleteManyArgs>(args?: SelectSubset<T, OnboardingTaskDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OnboardingTasks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingTaskUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many OnboardingTasks
     * const onboardingTask = await prisma.onboardingTask.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OnboardingTaskUpdateManyArgs>(args: SelectSubset<T, OnboardingTaskUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OnboardingTasks and returns the data updated in the database.
     * @param {OnboardingTaskUpdateManyAndReturnArgs} args - Arguments to update many OnboardingTasks.
     * @example
     * // Update many OnboardingTasks
     * const onboardingTask = await prisma.onboardingTask.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more OnboardingTasks and only return the `id`
     * const onboardingTaskWithIdOnly = await prisma.onboardingTask.updateManyAndReturn({
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
    updateManyAndReturn<T extends OnboardingTaskUpdateManyAndReturnArgs>(args: SelectSubset<T, OnboardingTaskUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OnboardingTaskPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one OnboardingTask.
     * @param {OnboardingTaskUpsertArgs} args - Arguments to update or create a OnboardingTask.
     * @example
     * // Update or create a OnboardingTask
     * const onboardingTask = await prisma.onboardingTask.upsert({
     *   create: {
     *     // ... data to create a OnboardingTask
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the OnboardingTask we want to update
     *   }
     * })
     */
    upsert<T extends OnboardingTaskUpsertArgs>(args: SelectSubset<T, OnboardingTaskUpsertArgs<ExtArgs>>): Prisma__OnboardingTaskClient<$Result.GetResult<Prisma.$OnboardingTaskPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of OnboardingTasks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingTaskCountArgs} args - Arguments to filter OnboardingTasks to count.
     * @example
     * // Count the number of OnboardingTasks
     * const count = await prisma.onboardingTask.count({
     *   where: {
     *     // ... the filter for the OnboardingTasks we want to count
     *   }
     * })
    **/
    count<T extends OnboardingTaskCountArgs>(
      args?: Subset<T, OnboardingTaskCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OnboardingTaskCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a OnboardingTask.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingTaskAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends OnboardingTaskAggregateArgs>(args: Subset<T, OnboardingTaskAggregateArgs>): Prisma.PrismaPromise<GetOnboardingTaskAggregateType<T>>

    /**
     * Group by OnboardingTask.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingTaskGroupByArgs} args - Group by arguments.
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
      T extends OnboardingTaskGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OnboardingTaskGroupByArgs['orderBy'] }
        : { orderBy?: OnboardingTaskGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, OnboardingTaskGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOnboardingTaskGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the OnboardingTask model
   */
  readonly fields: OnboardingTaskFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for OnboardingTask.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OnboardingTaskClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    case<T extends OnboardingCaseDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OnboardingCaseDefaultArgs<ExtArgs>>): Prisma__OnboardingCaseClient<$Result.GetResult<Prisma.$OnboardingCasePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the OnboardingTask model
   */
  interface OnboardingTaskFieldRefs {
    readonly id: FieldRef<"OnboardingTask", 'String'>
    readonly tenantId: FieldRef<"OnboardingTask", 'String'>
    readonly caseId: FieldRef<"OnboardingTask", 'String'>
    readonly kind: FieldRef<"OnboardingTask", 'OnboardingTaskKind'>
    readonly title: FieldRef<"OnboardingTask", 'String'>
    readonly description: FieldRef<"OnboardingTask", 'String'>
    readonly required: FieldRef<"OnboardingTask", 'Boolean'>
    readonly status: FieldRef<"OnboardingTask", 'OnboardingTaskStatus'>
    readonly order: FieldRef<"OnboardingTask", 'Int'>
    readonly completedAt: FieldRef<"OnboardingTask", 'DateTime'>
    readonly createdAt: FieldRef<"OnboardingTask", 'DateTime'>
    readonly updatedAt: FieldRef<"OnboardingTask", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * OnboardingTask findUnique
   */
  export type OnboardingTaskFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingTask
     */
    select?: OnboardingTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingTask
     */
    omit?: OnboardingTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingTaskInclude<ExtArgs> | null
    /**
     * Filter, which OnboardingTask to fetch.
     */
    where: OnboardingTaskWhereUniqueInput
  }

  /**
   * OnboardingTask findUniqueOrThrow
   */
  export type OnboardingTaskFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingTask
     */
    select?: OnboardingTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingTask
     */
    omit?: OnboardingTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingTaskInclude<ExtArgs> | null
    /**
     * Filter, which OnboardingTask to fetch.
     */
    where: OnboardingTaskWhereUniqueInput
  }

  /**
   * OnboardingTask findFirst
   */
  export type OnboardingTaskFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingTask
     */
    select?: OnboardingTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingTask
     */
    omit?: OnboardingTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingTaskInclude<ExtArgs> | null
    /**
     * Filter, which OnboardingTask to fetch.
     */
    where?: OnboardingTaskWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OnboardingTasks to fetch.
     */
    orderBy?: OnboardingTaskOrderByWithRelationInput | OnboardingTaskOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OnboardingTasks.
     */
    cursor?: OnboardingTaskWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OnboardingTasks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OnboardingTasks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OnboardingTasks.
     */
    distinct?: OnboardingTaskScalarFieldEnum | OnboardingTaskScalarFieldEnum[]
  }

  /**
   * OnboardingTask findFirstOrThrow
   */
  export type OnboardingTaskFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingTask
     */
    select?: OnboardingTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingTask
     */
    omit?: OnboardingTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingTaskInclude<ExtArgs> | null
    /**
     * Filter, which OnboardingTask to fetch.
     */
    where?: OnboardingTaskWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OnboardingTasks to fetch.
     */
    orderBy?: OnboardingTaskOrderByWithRelationInput | OnboardingTaskOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OnboardingTasks.
     */
    cursor?: OnboardingTaskWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OnboardingTasks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OnboardingTasks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OnboardingTasks.
     */
    distinct?: OnboardingTaskScalarFieldEnum | OnboardingTaskScalarFieldEnum[]
  }

  /**
   * OnboardingTask findMany
   */
  export type OnboardingTaskFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingTask
     */
    select?: OnboardingTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingTask
     */
    omit?: OnboardingTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingTaskInclude<ExtArgs> | null
    /**
     * Filter, which OnboardingTasks to fetch.
     */
    where?: OnboardingTaskWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OnboardingTasks to fetch.
     */
    orderBy?: OnboardingTaskOrderByWithRelationInput | OnboardingTaskOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing OnboardingTasks.
     */
    cursor?: OnboardingTaskWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OnboardingTasks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OnboardingTasks.
     */
    skip?: number
    distinct?: OnboardingTaskScalarFieldEnum | OnboardingTaskScalarFieldEnum[]
  }

  /**
   * OnboardingTask create
   */
  export type OnboardingTaskCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingTask
     */
    select?: OnboardingTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingTask
     */
    omit?: OnboardingTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingTaskInclude<ExtArgs> | null
    /**
     * The data needed to create a OnboardingTask.
     */
    data: XOR<OnboardingTaskCreateInput, OnboardingTaskUncheckedCreateInput>
  }

  /**
   * OnboardingTask createMany
   */
  export type OnboardingTaskCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many OnboardingTasks.
     */
    data: OnboardingTaskCreateManyInput | OnboardingTaskCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OnboardingTask createManyAndReturn
   */
  export type OnboardingTaskCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingTask
     */
    select?: OnboardingTaskSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingTask
     */
    omit?: OnboardingTaskOmit<ExtArgs> | null
    /**
     * The data used to create many OnboardingTasks.
     */
    data: OnboardingTaskCreateManyInput | OnboardingTaskCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingTaskIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * OnboardingTask update
   */
  export type OnboardingTaskUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingTask
     */
    select?: OnboardingTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingTask
     */
    omit?: OnboardingTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingTaskInclude<ExtArgs> | null
    /**
     * The data needed to update a OnboardingTask.
     */
    data: XOR<OnboardingTaskUpdateInput, OnboardingTaskUncheckedUpdateInput>
    /**
     * Choose, which OnboardingTask to update.
     */
    where: OnboardingTaskWhereUniqueInput
  }

  /**
   * OnboardingTask updateMany
   */
  export type OnboardingTaskUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update OnboardingTasks.
     */
    data: XOR<OnboardingTaskUpdateManyMutationInput, OnboardingTaskUncheckedUpdateManyInput>
    /**
     * Filter which OnboardingTasks to update
     */
    where?: OnboardingTaskWhereInput
    /**
     * Limit how many OnboardingTasks to update.
     */
    limit?: number
  }

  /**
   * OnboardingTask updateManyAndReturn
   */
  export type OnboardingTaskUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingTask
     */
    select?: OnboardingTaskSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingTask
     */
    omit?: OnboardingTaskOmit<ExtArgs> | null
    /**
     * The data used to update OnboardingTasks.
     */
    data: XOR<OnboardingTaskUpdateManyMutationInput, OnboardingTaskUncheckedUpdateManyInput>
    /**
     * Filter which OnboardingTasks to update
     */
    where?: OnboardingTaskWhereInput
    /**
     * Limit how many OnboardingTasks to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingTaskIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * OnboardingTask upsert
   */
  export type OnboardingTaskUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingTask
     */
    select?: OnboardingTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingTask
     */
    omit?: OnboardingTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingTaskInclude<ExtArgs> | null
    /**
     * The filter to search for the OnboardingTask to update in case it exists.
     */
    where: OnboardingTaskWhereUniqueInput
    /**
     * In case the OnboardingTask found by the `where` argument doesn't exist, create a new OnboardingTask with this data.
     */
    create: XOR<OnboardingTaskCreateInput, OnboardingTaskUncheckedCreateInput>
    /**
     * In case the OnboardingTask was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OnboardingTaskUpdateInput, OnboardingTaskUncheckedUpdateInput>
  }

  /**
   * OnboardingTask delete
   */
  export type OnboardingTaskDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingTask
     */
    select?: OnboardingTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingTask
     */
    omit?: OnboardingTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingTaskInclude<ExtArgs> | null
    /**
     * Filter which OnboardingTask to delete.
     */
    where: OnboardingTaskWhereUniqueInput
  }

  /**
   * OnboardingTask deleteMany
   */
  export type OnboardingTaskDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OnboardingTasks to delete
     */
    where?: OnboardingTaskWhereInput
    /**
     * Limit how many OnboardingTasks to delete.
     */
    limit?: number
  }

  /**
   * OnboardingTask without action
   */
  export type OnboardingTaskDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingTask
     */
    select?: OnboardingTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingTask
     */
    omit?: OnboardingTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingTaskInclude<ExtArgs> | null
  }


  /**
   * Model OnboardingDocument
   */

  export type AggregateOnboardingDocument = {
    _count: OnboardingDocumentCountAggregateOutputType | null
    _min: OnboardingDocumentMinAggregateOutputType | null
    _max: OnboardingDocumentMaxAggregateOutputType | null
  }

  export type OnboardingDocumentMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    caseId: string | null
    label: string | null
    storageKey: string | null
    fileName: string | null
    uploadedAt: Date | null
    createdAt: Date | null
  }

  export type OnboardingDocumentMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    caseId: string | null
    label: string | null
    storageKey: string | null
    fileName: string | null
    uploadedAt: Date | null
    createdAt: Date | null
  }

  export type OnboardingDocumentCountAggregateOutputType = {
    id: number
    tenantId: number
    caseId: number
    label: number
    storageKey: number
    fileName: number
    uploadedAt: number
    createdAt: number
    _all: number
  }


  export type OnboardingDocumentMinAggregateInputType = {
    id?: true
    tenantId?: true
    caseId?: true
    label?: true
    storageKey?: true
    fileName?: true
    uploadedAt?: true
    createdAt?: true
  }

  export type OnboardingDocumentMaxAggregateInputType = {
    id?: true
    tenantId?: true
    caseId?: true
    label?: true
    storageKey?: true
    fileName?: true
    uploadedAt?: true
    createdAt?: true
  }

  export type OnboardingDocumentCountAggregateInputType = {
    id?: true
    tenantId?: true
    caseId?: true
    label?: true
    storageKey?: true
    fileName?: true
    uploadedAt?: true
    createdAt?: true
    _all?: true
  }

  export type OnboardingDocumentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OnboardingDocument to aggregate.
     */
    where?: OnboardingDocumentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OnboardingDocuments to fetch.
     */
    orderBy?: OnboardingDocumentOrderByWithRelationInput | OnboardingDocumentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OnboardingDocumentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OnboardingDocuments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OnboardingDocuments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned OnboardingDocuments
    **/
    _count?: true | OnboardingDocumentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OnboardingDocumentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OnboardingDocumentMaxAggregateInputType
  }

  export type GetOnboardingDocumentAggregateType<T extends OnboardingDocumentAggregateArgs> = {
        [P in keyof T & keyof AggregateOnboardingDocument]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOnboardingDocument[P]>
      : GetScalarType<T[P], AggregateOnboardingDocument[P]>
  }




  export type OnboardingDocumentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OnboardingDocumentWhereInput
    orderBy?: OnboardingDocumentOrderByWithAggregationInput | OnboardingDocumentOrderByWithAggregationInput[]
    by: OnboardingDocumentScalarFieldEnum[] | OnboardingDocumentScalarFieldEnum
    having?: OnboardingDocumentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OnboardingDocumentCountAggregateInputType | true
    _min?: OnboardingDocumentMinAggregateInputType
    _max?: OnboardingDocumentMaxAggregateInputType
  }

  export type OnboardingDocumentGroupByOutputType = {
    id: string
    tenantId: string
    caseId: string
    label: string
    storageKey: string | null
    fileName: string | null
    uploadedAt: Date | null
    createdAt: Date
    _count: OnboardingDocumentCountAggregateOutputType | null
    _min: OnboardingDocumentMinAggregateOutputType | null
    _max: OnboardingDocumentMaxAggregateOutputType | null
  }

  type GetOnboardingDocumentGroupByPayload<T extends OnboardingDocumentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OnboardingDocumentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OnboardingDocumentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OnboardingDocumentGroupByOutputType[P]>
            : GetScalarType<T[P], OnboardingDocumentGroupByOutputType[P]>
        }
      >
    >


  export type OnboardingDocumentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    caseId?: boolean
    label?: boolean
    storageKey?: boolean
    fileName?: boolean
    uploadedAt?: boolean
    createdAt?: boolean
    case?: boolean | OnboardingCaseDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["onboardingDocument"]>

  export type OnboardingDocumentSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    caseId?: boolean
    label?: boolean
    storageKey?: boolean
    fileName?: boolean
    uploadedAt?: boolean
    createdAt?: boolean
    case?: boolean | OnboardingCaseDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["onboardingDocument"]>

  export type OnboardingDocumentSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    caseId?: boolean
    label?: boolean
    storageKey?: boolean
    fileName?: boolean
    uploadedAt?: boolean
    createdAt?: boolean
    case?: boolean | OnboardingCaseDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["onboardingDocument"]>

  export type OnboardingDocumentSelectScalar = {
    id?: boolean
    tenantId?: boolean
    caseId?: boolean
    label?: boolean
    storageKey?: boolean
    fileName?: boolean
    uploadedAt?: boolean
    createdAt?: boolean
  }

  export type OnboardingDocumentOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "caseId" | "label" | "storageKey" | "fileName" | "uploadedAt" | "createdAt", ExtArgs["result"]["onboardingDocument"]>
  export type OnboardingDocumentInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    case?: boolean | OnboardingCaseDefaultArgs<ExtArgs>
  }
  export type OnboardingDocumentIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    case?: boolean | OnboardingCaseDefaultArgs<ExtArgs>
  }
  export type OnboardingDocumentIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    case?: boolean | OnboardingCaseDefaultArgs<ExtArgs>
  }

  export type $OnboardingDocumentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "OnboardingDocument"
    objects: {
      case: Prisma.$OnboardingCasePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      caseId: string
      label: string
      storageKey: string | null
      fileName: string | null
      uploadedAt: Date | null
      createdAt: Date
    }, ExtArgs["result"]["onboardingDocument"]>
    composites: {}
  }

  type OnboardingDocumentGetPayload<S extends boolean | null | undefined | OnboardingDocumentDefaultArgs> = $Result.GetResult<Prisma.$OnboardingDocumentPayload, S>

  type OnboardingDocumentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OnboardingDocumentFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OnboardingDocumentCountAggregateInputType | true
    }

  export interface OnboardingDocumentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['OnboardingDocument'], meta: { name: 'OnboardingDocument' } }
    /**
     * Find zero or one OnboardingDocument that matches the filter.
     * @param {OnboardingDocumentFindUniqueArgs} args - Arguments to find a OnboardingDocument
     * @example
     * // Get one OnboardingDocument
     * const onboardingDocument = await prisma.onboardingDocument.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OnboardingDocumentFindUniqueArgs>(args: SelectSubset<T, OnboardingDocumentFindUniqueArgs<ExtArgs>>): Prisma__OnboardingDocumentClient<$Result.GetResult<Prisma.$OnboardingDocumentPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one OnboardingDocument that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OnboardingDocumentFindUniqueOrThrowArgs} args - Arguments to find a OnboardingDocument
     * @example
     * // Get one OnboardingDocument
     * const onboardingDocument = await prisma.onboardingDocument.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OnboardingDocumentFindUniqueOrThrowArgs>(args: SelectSubset<T, OnboardingDocumentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OnboardingDocumentClient<$Result.GetResult<Prisma.$OnboardingDocumentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OnboardingDocument that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingDocumentFindFirstArgs} args - Arguments to find a OnboardingDocument
     * @example
     * // Get one OnboardingDocument
     * const onboardingDocument = await prisma.onboardingDocument.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OnboardingDocumentFindFirstArgs>(args?: SelectSubset<T, OnboardingDocumentFindFirstArgs<ExtArgs>>): Prisma__OnboardingDocumentClient<$Result.GetResult<Prisma.$OnboardingDocumentPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OnboardingDocument that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingDocumentFindFirstOrThrowArgs} args - Arguments to find a OnboardingDocument
     * @example
     * // Get one OnboardingDocument
     * const onboardingDocument = await prisma.onboardingDocument.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OnboardingDocumentFindFirstOrThrowArgs>(args?: SelectSubset<T, OnboardingDocumentFindFirstOrThrowArgs<ExtArgs>>): Prisma__OnboardingDocumentClient<$Result.GetResult<Prisma.$OnboardingDocumentPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more OnboardingDocuments that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingDocumentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all OnboardingDocuments
     * const onboardingDocuments = await prisma.onboardingDocument.findMany()
     * 
     * // Get first 10 OnboardingDocuments
     * const onboardingDocuments = await prisma.onboardingDocument.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const onboardingDocumentWithIdOnly = await prisma.onboardingDocument.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OnboardingDocumentFindManyArgs>(args?: SelectSubset<T, OnboardingDocumentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OnboardingDocumentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a OnboardingDocument.
     * @param {OnboardingDocumentCreateArgs} args - Arguments to create a OnboardingDocument.
     * @example
     * // Create one OnboardingDocument
     * const OnboardingDocument = await prisma.onboardingDocument.create({
     *   data: {
     *     // ... data to create a OnboardingDocument
     *   }
     * })
     * 
     */
    create<T extends OnboardingDocumentCreateArgs>(args: SelectSubset<T, OnboardingDocumentCreateArgs<ExtArgs>>): Prisma__OnboardingDocumentClient<$Result.GetResult<Prisma.$OnboardingDocumentPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many OnboardingDocuments.
     * @param {OnboardingDocumentCreateManyArgs} args - Arguments to create many OnboardingDocuments.
     * @example
     * // Create many OnboardingDocuments
     * const onboardingDocument = await prisma.onboardingDocument.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OnboardingDocumentCreateManyArgs>(args?: SelectSubset<T, OnboardingDocumentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many OnboardingDocuments and returns the data saved in the database.
     * @param {OnboardingDocumentCreateManyAndReturnArgs} args - Arguments to create many OnboardingDocuments.
     * @example
     * // Create many OnboardingDocuments
     * const onboardingDocument = await prisma.onboardingDocument.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many OnboardingDocuments and only return the `id`
     * const onboardingDocumentWithIdOnly = await prisma.onboardingDocument.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OnboardingDocumentCreateManyAndReturnArgs>(args?: SelectSubset<T, OnboardingDocumentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OnboardingDocumentPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a OnboardingDocument.
     * @param {OnboardingDocumentDeleteArgs} args - Arguments to delete one OnboardingDocument.
     * @example
     * // Delete one OnboardingDocument
     * const OnboardingDocument = await prisma.onboardingDocument.delete({
     *   where: {
     *     // ... filter to delete one OnboardingDocument
     *   }
     * })
     * 
     */
    delete<T extends OnboardingDocumentDeleteArgs>(args: SelectSubset<T, OnboardingDocumentDeleteArgs<ExtArgs>>): Prisma__OnboardingDocumentClient<$Result.GetResult<Prisma.$OnboardingDocumentPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one OnboardingDocument.
     * @param {OnboardingDocumentUpdateArgs} args - Arguments to update one OnboardingDocument.
     * @example
     * // Update one OnboardingDocument
     * const onboardingDocument = await prisma.onboardingDocument.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OnboardingDocumentUpdateArgs>(args: SelectSubset<T, OnboardingDocumentUpdateArgs<ExtArgs>>): Prisma__OnboardingDocumentClient<$Result.GetResult<Prisma.$OnboardingDocumentPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more OnboardingDocuments.
     * @param {OnboardingDocumentDeleteManyArgs} args - Arguments to filter OnboardingDocuments to delete.
     * @example
     * // Delete a few OnboardingDocuments
     * const { count } = await prisma.onboardingDocument.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OnboardingDocumentDeleteManyArgs>(args?: SelectSubset<T, OnboardingDocumentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OnboardingDocuments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingDocumentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many OnboardingDocuments
     * const onboardingDocument = await prisma.onboardingDocument.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OnboardingDocumentUpdateManyArgs>(args: SelectSubset<T, OnboardingDocumentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OnboardingDocuments and returns the data updated in the database.
     * @param {OnboardingDocumentUpdateManyAndReturnArgs} args - Arguments to update many OnboardingDocuments.
     * @example
     * // Update many OnboardingDocuments
     * const onboardingDocument = await prisma.onboardingDocument.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more OnboardingDocuments and only return the `id`
     * const onboardingDocumentWithIdOnly = await prisma.onboardingDocument.updateManyAndReturn({
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
    updateManyAndReturn<T extends OnboardingDocumentUpdateManyAndReturnArgs>(args: SelectSubset<T, OnboardingDocumentUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OnboardingDocumentPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one OnboardingDocument.
     * @param {OnboardingDocumentUpsertArgs} args - Arguments to update or create a OnboardingDocument.
     * @example
     * // Update or create a OnboardingDocument
     * const onboardingDocument = await prisma.onboardingDocument.upsert({
     *   create: {
     *     // ... data to create a OnboardingDocument
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the OnboardingDocument we want to update
     *   }
     * })
     */
    upsert<T extends OnboardingDocumentUpsertArgs>(args: SelectSubset<T, OnboardingDocumentUpsertArgs<ExtArgs>>): Prisma__OnboardingDocumentClient<$Result.GetResult<Prisma.$OnboardingDocumentPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of OnboardingDocuments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingDocumentCountArgs} args - Arguments to filter OnboardingDocuments to count.
     * @example
     * // Count the number of OnboardingDocuments
     * const count = await prisma.onboardingDocument.count({
     *   where: {
     *     // ... the filter for the OnboardingDocuments we want to count
     *   }
     * })
    **/
    count<T extends OnboardingDocumentCountArgs>(
      args?: Subset<T, OnboardingDocumentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OnboardingDocumentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a OnboardingDocument.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingDocumentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends OnboardingDocumentAggregateArgs>(args: Subset<T, OnboardingDocumentAggregateArgs>): Prisma.PrismaPromise<GetOnboardingDocumentAggregateType<T>>

    /**
     * Group by OnboardingDocument.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingDocumentGroupByArgs} args - Group by arguments.
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
      T extends OnboardingDocumentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OnboardingDocumentGroupByArgs['orderBy'] }
        : { orderBy?: OnboardingDocumentGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, OnboardingDocumentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOnboardingDocumentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the OnboardingDocument model
   */
  readonly fields: OnboardingDocumentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for OnboardingDocument.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OnboardingDocumentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    case<T extends OnboardingCaseDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OnboardingCaseDefaultArgs<ExtArgs>>): Prisma__OnboardingCaseClient<$Result.GetResult<Prisma.$OnboardingCasePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the OnboardingDocument model
   */
  interface OnboardingDocumentFieldRefs {
    readonly id: FieldRef<"OnboardingDocument", 'String'>
    readonly tenantId: FieldRef<"OnboardingDocument", 'String'>
    readonly caseId: FieldRef<"OnboardingDocument", 'String'>
    readonly label: FieldRef<"OnboardingDocument", 'String'>
    readonly storageKey: FieldRef<"OnboardingDocument", 'String'>
    readonly fileName: FieldRef<"OnboardingDocument", 'String'>
    readonly uploadedAt: FieldRef<"OnboardingDocument", 'DateTime'>
    readonly createdAt: FieldRef<"OnboardingDocument", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * OnboardingDocument findUnique
   */
  export type OnboardingDocumentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingDocument
     */
    select?: OnboardingDocumentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingDocument
     */
    omit?: OnboardingDocumentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingDocumentInclude<ExtArgs> | null
    /**
     * Filter, which OnboardingDocument to fetch.
     */
    where: OnboardingDocumentWhereUniqueInput
  }

  /**
   * OnboardingDocument findUniqueOrThrow
   */
  export type OnboardingDocumentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingDocument
     */
    select?: OnboardingDocumentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingDocument
     */
    omit?: OnboardingDocumentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingDocumentInclude<ExtArgs> | null
    /**
     * Filter, which OnboardingDocument to fetch.
     */
    where: OnboardingDocumentWhereUniqueInput
  }

  /**
   * OnboardingDocument findFirst
   */
  export type OnboardingDocumentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingDocument
     */
    select?: OnboardingDocumentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingDocument
     */
    omit?: OnboardingDocumentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingDocumentInclude<ExtArgs> | null
    /**
     * Filter, which OnboardingDocument to fetch.
     */
    where?: OnboardingDocumentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OnboardingDocuments to fetch.
     */
    orderBy?: OnboardingDocumentOrderByWithRelationInput | OnboardingDocumentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OnboardingDocuments.
     */
    cursor?: OnboardingDocumentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OnboardingDocuments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OnboardingDocuments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OnboardingDocuments.
     */
    distinct?: OnboardingDocumentScalarFieldEnum | OnboardingDocumentScalarFieldEnum[]
  }

  /**
   * OnboardingDocument findFirstOrThrow
   */
  export type OnboardingDocumentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingDocument
     */
    select?: OnboardingDocumentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingDocument
     */
    omit?: OnboardingDocumentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingDocumentInclude<ExtArgs> | null
    /**
     * Filter, which OnboardingDocument to fetch.
     */
    where?: OnboardingDocumentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OnboardingDocuments to fetch.
     */
    orderBy?: OnboardingDocumentOrderByWithRelationInput | OnboardingDocumentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OnboardingDocuments.
     */
    cursor?: OnboardingDocumentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OnboardingDocuments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OnboardingDocuments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OnboardingDocuments.
     */
    distinct?: OnboardingDocumentScalarFieldEnum | OnboardingDocumentScalarFieldEnum[]
  }

  /**
   * OnboardingDocument findMany
   */
  export type OnboardingDocumentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingDocument
     */
    select?: OnboardingDocumentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingDocument
     */
    omit?: OnboardingDocumentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingDocumentInclude<ExtArgs> | null
    /**
     * Filter, which OnboardingDocuments to fetch.
     */
    where?: OnboardingDocumentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OnboardingDocuments to fetch.
     */
    orderBy?: OnboardingDocumentOrderByWithRelationInput | OnboardingDocumentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing OnboardingDocuments.
     */
    cursor?: OnboardingDocumentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OnboardingDocuments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OnboardingDocuments.
     */
    skip?: number
    distinct?: OnboardingDocumentScalarFieldEnum | OnboardingDocumentScalarFieldEnum[]
  }

  /**
   * OnboardingDocument create
   */
  export type OnboardingDocumentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingDocument
     */
    select?: OnboardingDocumentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingDocument
     */
    omit?: OnboardingDocumentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingDocumentInclude<ExtArgs> | null
    /**
     * The data needed to create a OnboardingDocument.
     */
    data: XOR<OnboardingDocumentCreateInput, OnboardingDocumentUncheckedCreateInput>
  }

  /**
   * OnboardingDocument createMany
   */
  export type OnboardingDocumentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many OnboardingDocuments.
     */
    data: OnboardingDocumentCreateManyInput | OnboardingDocumentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OnboardingDocument createManyAndReturn
   */
  export type OnboardingDocumentCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingDocument
     */
    select?: OnboardingDocumentSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingDocument
     */
    omit?: OnboardingDocumentOmit<ExtArgs> | null
    /**
     * The data used to create many OnboardingDocuments.
     */
    data: OnboardingDocumentCreateManyInput | OnboardingDocumentCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingDocumentIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * OnboardingDocument update
   */
  export type OnboardingDocumentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingDocument
     */
    select?: OnboardingDocumentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingDocument
     */
    omit?: OnboardingDocumentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingDocumentInclude<ExtArgs> | null
    /**
     * The data needed to update a OnboardingDocument.
     */
    data: XOR<OnboardingDocumentUpdateInput, OnboardingDocumentUncheckedUpdateInput>
    /**
     * Choose, which OnboardingDocument to update.
     */
    where: OnboardingDocumentWhereUniqueInput
  }

  /**
   * OnboardingDocument updateMany
   */
  export type OnboardingDocumentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update OnboardingDocuments.
     */
    data: XOR<OnboardingDocumentUpdateManyMutationInput, OnboardingDocumentUncheckedUpdateManyInput>
    /**
     * Filter which OnboardingDocuments to update
     */
    where?: OnboardingDocumentWhereInput
    /**
     * Limit how many OnboardingDocuments to update.
     */
    limit?: number
  }

  /**
   * OnboardingDocument updateManyAndReturn
   */
  export type OnboardingDocumentUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingDocument
     */
    select?: OnboardingDocumentSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingDocument
     */
    omit?: OnboardingDocumentOmit<ExtArgs> | null
    /**
     * The data used to update OnboardingDocuments.
     */
    data: XOR<OnboardingDocumentUpdateManyMutationInput, OnboardingDocumentUncheckedUpdateManyInput>
    /**
     * Filter which OnboardingDocuments to update
     */
    where?: OnboardingDocumentWhereInput
    /**
     * Limit how many OnboardingDocuments to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingDocumentIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * OnboardingDocument upsert
   */
  export type OnboardingDocumentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingDocument
     */
    select?: OnboardingDocumentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingDocument
     */
    omit?: OnboardingDocumentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingDocumentInclude<ExtArgs> | null
    /**
     * The filter to search for the OnboardingDocument to update in case it exists.
     */
    where: OnboardingDocumentWhereUniqueInput
    /**
     * In case the OnboardingDocument found by the `where` argument doesn't exist, create a new OnboardingDocument with this data.
     */
    create: XOR<OnboardingDocumentCreateInput, OnboardingDocumentUncheckedCreateInput>
    /**
     * In case the OnboardingDocument was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OnboardingDocumentUpdateInput, OnboardingDocumentUncheckedUpdateInput>
  }

  /**
   * OnboardingDocument delete
   */
  export type OnboardingDocumentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingDocument
     */
    select?: OnboardingDocumentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingDocument
     */
    omit?: OnboardingDocumentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingDocumentInclude<ExtArgs> | null
    /**
     * Filter which OnboardingDocument to delete.
     */
    where: OnboardingDocumentWhereUniqueInput
  }

  /**
   * OnboardingDocument deleteMany
   */
  export type OnboardingDocumentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OnboardingDocuments to delete
     */
    where?: OnboardingDocumentWhereInput
    /**
     * Limit how many OnboardingDocuments to delete.
     */
    limit?: number
  }

  /**
   * OnboardingDocument without action
   */
  export type OnboardingDocumentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingDocument
     */
    select?: OnboardingDocumentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingDocument
     */
    omit?: OnboardingDocumentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingDocumentInclude<ExtArgs> | null
  }


  /**
   * Model Verification
   */

  export type AggregateVerification = {
    _count: VerificationCountAggregateOutputType | null
    _min: VerificationMinAggregateOutputType | null
    _max: VerificationMaxAggregateOutputType | null
  }

  export type VerificationMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    caseId: string | null
    type: $Enums.VerificationType | null
    status: $Enums.VerificationStatus | null
    providerRef: string | null
    provider: string | null
    maskedValue: string | null
    encryptedPayload: string | null
    message: string | null
    verifiedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type VerificationMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    caseId: string | null
    type: $Enums.VerificationType | null
    status: $Enums.VerificationStatus | null
    providerRef: string | null
    provider: string | null
    maskedValue: string | null
    encryptedPayload: string | null
    message: string | null
    verifiedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type VerificationCountAggregateOutputType = {
    id: number
    tenantId: number
    caseId: number
    type: number
    status: number
    providerRef: number
    provider: number
    maskedValue: number
    encryptedPayload: number
    message: number
    verifiedAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type VerificationMinAggregateInputType = {
    id?: true
    tenantId?: true
    caseId?: true
    type?: true
    status?: true
    providerRef?: true
    provider?: true
    maskedValue?: true
    encryptedPayload?: true
    message?: true
    verifiedAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type VerificationMaxAggregateInputType = {
    id?: true
    tenantId?: true
    caseId?: true
    type?: true
    status?: true
    providerRef?: true
    provider?: true
    maskedValue?: true
    encryptedPayload?: true
    message?: true
    verifiedAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type VerificationCountAggregateInputType = {
    id?: true
    tenantId?: true
    caseId?: true
    type?: true
    status?: true
    providerRef?: true
    provider?: true
    maskedValue?: true
    encryptedPayload?: true
    message?: true
    verifiedAt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type VerificationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Verification to aggregate.
     */
    where?: VerificationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Verifications to fetch.
     */
    orderBy?: VerificationOrderByWithRelationInput | VerificationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: VerificationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Verifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Verifications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Verifications
    **/
    _count?: true | VerificationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: VerificationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: VerificationMaxAggregateInputType
  }

  export type GetVerificationAggregateType<T extends VerificationAggregateArgs> = {
        [P in keyof T & keyof AggregateVerification]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateVerification[P]>
      : GetScalarType<T[P], AggregateVerification[P]>
  }




  export type VerificationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: VerificationWhereInput
    orderBy?: VerificationOrderByWithAggregationInput | VerificationOrderByWithAggregationInput[]
    by: VerificationScalarFieldEnum[] | VerificationScalarFieldEnum
    having?: VerificationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: VerificationCountAggregateInputType | true
    _min?: VerificationMinAggregateInputType
    _max?: VerificationMaxAggregateInputType
  }

  export type VerificationGroupByOutputType = {
    id: string
    tenantId: string
    caseId: string
    type: $Enums.VerificationType
    status: $Enums.VerificationStatus
    providerRef: string | null
    provider: string | null
    maskedValue: string | null
    encryptedPayload: string | null
    message: string | null
    verifiedAt: Date | null
    createdAt: Date
    updatedAt: Date
    _count: VerificationCountAggregateOutputType | null
    _min: VerificationMinAggregateOutputType | null
    _max: VerificationMaxAggregateOutputType | null
  }

  type GetVerificationGroupByPayload<T extends VerificationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<VerificationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof VerificationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], VerificationGroupByOutputType[P]>
            : GetScalarType<T[P], VerificationGroupByOutputType[P]>
        }
      >
    >


  export type VerificationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    caseId?: boolean
    type?: boolean
    status?: boolean
    providerRef?: boolean
    provider?: boolean
    maskedValue?: boolean
    encryptedPayload?: boolean
    message?: boolean
    verifiedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    case?: boolean | OnboardingCaseDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["verification"]>

  export type VerificationSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    caseId?: boolean
    type?: boolean
    status?: boolean
    providerRef?: boolean
    provider?: boolean
    maskedValue?: boolean
    encryptedPayload?: boolean
    message?: boolean
    verifiedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    case?: boolean | OnboardingCaseDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["verification"]>

  export type VerificationSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    caseId?: boolean
    type?: boolean
    status?: boolean
    providerRef?: boolean
    provider?: boolean
    maskedValue?: boolean
    encryptedPayload?: boolean
    message?: boolean
    verifiedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    case?: boolean | OnboardingCaseDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["verification"]>

  export type VerificationSelectScalar = {
    id?: boolean
    tenantId?: boolean
    caseId?: boolean
    type?: boolean
    status?: boolean
    providerRef?: boolean
    provider?: boolean
    maskedValue?: boolean
    encryptedPayload?: boolean
    message?: boolean
    verifiedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type VerificationOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "caseId" | "type" | "status" | "providerRef" | "provider" | "maskedValue" | "encryptedPayload" | "message" | "verifiedAt" | "createdAt" | "updatedAt", ExtArgs["result"]["verification"]>
  export type VerificationInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    case?: boolean | OnboardingCaseDefaultArgs<ExtArgs>
  }
  export type VerificationIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    case?: boolean | OnboardingCaseDefaultArgs<ExtArgs>
  }
  export type VerificationIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    case?: boolean | OnboardingCaseDefaultArgs<ExtArgs>
  }

  export type $VerificationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Verification"
    objects: {
      case: Prisma.$OnboardingCasePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      caseId: string
      type: $Enums.VerificationType
      status: $Enums.VerificationStatus
      providerRef: string | null
      provider: string | null
      maskedValue: string | null
      encryptedPayload: string | null
      message: string | null
      verifiedAt: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["verification"]>
    composites: {}
  }

  type VerificationGetPayload<S extends boolean | null | undefined | VerificationDefaultArgs> = $Result.GetResult<Prisma.$VerificationPayload, S>

  type VerificationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<VerificationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: VerificationCountAggregateInputType | true
    }

  export interface VerificationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Verification'], meta: { name: 'Verification' } }
    /**
     * Find zero or one Verification that matches the filter.
     * @param {VerificationFindUniqueArgs} args - Arguments to find a Verification
     * @example
     * // Get one Verification
     * const verification = await prisma.verification.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends VerificationFindUniqueArgs>(args: SelectSubset<T, VerificationFindUniqueArgs<ExtArgs>>): Prisma__VerificationClient<$Result.GetResult<Prisma.$VerificationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Verification that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {VerificationFindUniqueOrThrowArgs} args - Arguments to find a Verification
     * @example
     * // Get one Verification
     * const verification = await prisma.verification.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends VerificationFindUniqueOrThrowArgs>(args: SelectSubset<T, VerificationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__VerificationClient<$Result.GetResult<Prisma.$VerificationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Verification that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationFindFirstArgs} args - Arguments to find a Verification
     * @example
     * // Get one Verification
     * const verification = await prisma.verification.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends VerificationFindFirstArgs>(args?: SelectSubset<T, VerificationFindFirstArgs<ExtArgs>>): Prisma__VerificationClient<$Result.GetResult<Prisma.$VerificationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Verification that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationFindFirstOrThrowArgs} args - Arguments to find a Verification
     * @example
     * // Get one Verification
     * const verification = await prisma.verification.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends VerificationFindFirstOrThrowArgs>(args?: SelectSubset<T, VerificationFindFirstOrThrowArgs<ExtArgs>>): Prisma__VerificationClient<$Result.GetResult<Prisma.$VerificationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Verifications that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Verifications
     * const verifications = await prisma.verification.findMany()
     * 
     * // Get first 10 Verifications
     * const verifications = await prisma.verification.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const verificationWithIdOnly = await prisma.verification.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends VerificationFindManyArgs>(args?: SelectSubset<T, VerificationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VerificationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Verification.
     * @param {VerificationCreateArgs} args - Arguments to create a Verification.
     * @example
     * // Create one Verification
     * const Verification = await prisma.verification.create({
     *   data: {
     *     // ... data to create a Verification
     *   }
     * })
     * 
     */
    create<T extends VerificationCreateArgs>(args: SelectSubset<T, VerificationCreateArgs<ExtArgs>>): Prisma__VerificationClient<$Result.GetResult<Prisma.$VerificationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Verifications.
     * @param {VerificationCreateManyArgs} args - Arguments to create many Verifications.
     * @example
     * // Create many Verifications
     * const verification = await prisma.verification.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends VerificationCreateManyArgs>(args?: SelectSubset<T, VerificationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Verifications and returns the data saved in the database.
     * @param {VerificationCreateManyAndReturnArgs} args - Arguments to create many Verifications.
     * @example
     * // Create many Verifications
     * const verification = await prisma.verification.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Verifications and only return the `id`
     * const verificationWithIdOnly = await prisma.verification.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends VerificationCreateManyAndReturnArgs>(args?: SelectSubset<T, VerificationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VerificationPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Verification.
     * @param {VerificationDeleteArgs} args - Arguments to delete one Verification.
     * @example
     * // Delete one Verification
     * const Verification = await prisma.verification.delete({
     *   where: {
     *     // ... filter to delete one Verification
     *   }
     * })
     * 
     */
    delete<T extends VerificationDeleteArgs>(args: SelectSubset<T, VerificationDeleteArgs<ExtArgs>>): Prisma__VerificationClient<$Result.GetResult<Prisma.$VerificationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Verification.
     * @param {VerificationUpdateArgs} args - Arguments to update one Verification.
     * @example
     * // Update one Verification
     * const verification = await prisma.verification.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends VerificationUpdateArgs>(args: SelectSubset<T, VerificationUpdateArgs<ExtArgs>>): Prisma__VerificationClient<$Result.GetResult<Prisma.$VerificationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Verifications.
     * @param {VerificationDeleteManyArgs} args - Arguments to filter Verifications to delete.
     * @example
     * // Delete a few Verifications
     * const { count } = await prisma.verification.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends VerificationDeleteManyArgs>(args?: SelectSubset<T, VerificationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Verifications.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Verifications
     * const verification = await prisma.verification.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends VerificationUpdateManyArgs>(args: SelectSubset<T, VerificationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Verifications and returns the data updated in the database.
     * @param {VerificationUpdateManyAndReturnArgs} args - Arguments to update many Verifications.
     * @example
     * // Update many Verifications
     * const verification = await prisma.verification.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Verifications and only return the `id`
     * const verificationWithIdOnly = await prisma.verification.updateManyAndReturn({
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
    updateManyAndReturn<T extends VerificationUpdateManyAndReturnArgs>(args: SelectSubset<T, VerificationUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VerificationPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Verification.
     * @param {VerificationUpsertArgs} args - Arguments to update or create a Verification.
     * @example
     * // Update or create a Verification
     * const verification = await prisma.verification.upsert({
     *   create: {
     *     // ... data to create a Verification
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Verification we want to update
     *   }
     * })
     */
    upsert<T extends VerificationUpsertArgs>(args: SelectSubset<T, VerificationUpsertArgs<ExtArgs>>): Prisma__VerificationClient<$Result.GetResult<Prisma.$VerificationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Verifications.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationCountArgs} args - Arguments to filter Verifications to count.
     * @example
     * // Count the number of Verifications
     * const count = await prisma.verification.count({
     *   where: {
     *     // ... the filter for the Verifications we want to count
     *   }
     * })
    **/
    count<T extends VerificationCountArgs>(
      args?: Subset<T, VerificationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], VerificationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Verification.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends VerificationAggregateArgs>(args: Subset<T, VerificationAggregateArgs>): Prisma.PrismaPromise<GetVerificationAggregateType<T>>

    /**
     * Group by Verification.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationGroupByArgs} args - Group by arguments.
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
      T extends VerificationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: VerificationGroupByArgs['orderBy'] }
        : { orderBy?: VerificationGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, VerificationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetVerificationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Verification model
   */
  readonly fields: VerificationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Verification.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__VerificationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    case<T extends OnboardingCaseDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OnboardingCaseDefaultArgs<ExtArgs>>): Prisma__OnboardingCaseClient<$Result.GetResult<Prisma.$OnboardingCasePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the Verification model
   */
  interface VerificationFieldRefs {
    readonly id: FieldRef<"Verification", 'String'>
    readonly tenantId: FieldRef<"Verification", 'String'>
    readonly caseId: FieldRef<"Verification", 'String'>
    readonly type: FieldRef<"Verification", 'VerificationType'>
    readonly status: FieldRef<"Verification", 'VerificationStatus'>
    readonly providerRef: FieldRef<"Verification", 'String'>
    readonly provider: FieldRef<"Verification", 'String'>
    readonly maskedValue: FieldRef<"Verification", 'String'>
    readonly encryptedPayload: FieldRef<"Verification", 'String'>
    readonly message: FieldRef<"Verification", 'String'>
    readonly verifiedAt: FieldRef<"Verification", 'DateTime'>
    readonly createdAt: FieldRef<"Verification", 'DateTime'>
    readonly updatedAt: FieldRef<"Verification", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Verification findUnique
   */
  export type VerificationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Verification
     */
    select?: VerificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Verification
     */
    omit?: VerificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VerificationInclude<ExtArgs> | null
    /**
     * Filter, which Verification to fetch.
     */
    where: VerificationWhereUniqueInput
  }

  /**
   * Verification findUniqueOrThrow
   */
  export type VerificationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Verification
     */
    select?: VerificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Verification
     */
    omit?: VerificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VerificationInclude<ExtArgs> | null
    /**
     * Filter, which Verification to fetch.
     */
    where: VerificationWhereUniqueInput
  }

  /**
   * Verification findFirst
   */
  export type VerificationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Verification
     */
    select?: VerificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Verification
     */
    omit?: VerificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VerificationInclude<ExtArgs> | null
    /**
     * Filter, which Verification to fetch.
     */
    where?: VerificationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Verifications to fetch.
     */
    orderBy?: VerificationOrderByWithRelationInput | VerificationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Verifications.
     */
    cursor?: VerificationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Verifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Verifications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Verifications.
     */
    distinct?: VerificationScalarFieldEnum | VerificationScalarFieldEnum[]
  }

  /**
   * Verification findFirstOrThrow
   */
  export type VerificationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Verification
     */
    select?: VerificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Verification
     */
    omit?: VerificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VerificationInclude<ExtArgs> | null
    /**
     * Filter, which Verification to fetch.
     */
    where?: VerificationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Verifications to fetch.
     */
    orderBy?: VerificationOrderByWithRelationInput | VerificationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Verifications.
     */
    cursor?: VerificationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Verifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Verifications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Verifications.
     */
    distinct?: VerificationScalarFieldEnum | VerificationScalarFieldEnum[]
  }

  /**
   * Verification findMany
   */
  export type VerificationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Verification
     */
    select?: VerificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Verification
     */
    omit?: VerificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VerificationInclude<ExtArgs> | null
    /**
     * Filter, which Verifications to fetch.
     */
    where?: VerificationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Verifications to fetch.
     */
    orderBy?: VerificationOrderByWithRelationInput | VerificationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Verifications.
     */
    cursor?: VerificationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Verifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Verifications.
     */
    skip?: number
    distinct?: VerificationScalarFieldEnum | VerificationScalarFieldEnum[]
  }

  /**
   * Verification create
   */
  export type VerificationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Verification
     */
    select?: VerificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Verification
     */
    omit?: VerificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VerificationInclude<ExtArgs> | null
    /**
     * The data needed to create a Verification.
     */
    data: XOR<VerificationCreateInput, VerificationUncheckedCreateInput>
  }

  /**
   * Verification createMany
   */
  export type VerificationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Verifications.
     */
    data: VerificationCreateManyInput | VerificationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Verification createManyAndReturn
   */
  export type VerificationCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Verification
     */
    select?: VerificationSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Verification
     */
    omit?: VerificationOmit<ExtArgs> | null
    /**
     * The data used to create many Verifications.
     */
    data: VerificationCreateManyInput | VerificationCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VerificationIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Verification update
   */
  export type VerificationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Verification
     */
    select?: VerificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Verification
     */
    omit?: VerificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VerificationInclude<ExtArgs> | null
    /**
     * The data needed to update a Verification.
     */
    data: XOR<VerificationUpdateInput, VerificationUncheckedUpdateInput>
    /**
     * Choose, which Verification to update.
     */
    where: VerificationWhereUniqueInput
  }

  /**
   * Verification updateMany
   */
  export type VerificationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Verifications.
     */
    data: XOR<VerificationUpdateManyMutationInput, VerificationUncheckedUpdateManyInput>
    /**
     * Filter which Verifications to update
     */
    where?: VerificationWhereInput
    /**
     * Limit how many Verifications to update.
     */
    limit?: number
  }

  /**
   * Verification updateManyAndReturn
   */
  export type VerificationUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Verification
     */
    select?: VerificationSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Verification
     */
    omit?: VerificationOmit<ExtArgs> | null
    /**
     * The data used to update Verifications.
     */
    data: XOR<VerificationUpdateManyMutationInput, VerificationUncheckedUpdateManyInput>
    /**
     * Filter which Verifications to update
     */
    where?: VerificationWhereInput
    /**
     * Limit how many Verifications to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VerificationIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Verification upsert
   */
  export type VerificationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Verification
     */
    select?: VerificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Verification
     */
    omit?: VerificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VerificationInclude<ExtArgs> | null
    /**
     * The filter to search for the Verification to update in case it exists.
     */
    where: VerificationWhereUniqueInput
    /**
     * In case the Verification found by the `where` argument doesn't exist, create a new Verification with this data.
     */
    create: XOR<VerificationCreateInput, VerificationUncheckedCreateInput>
    /**
     * In case the Verification was found with the provided `where` argument, update it with this data.
     */
    update: XOR<VerificationUpdateInput, VerificationUncheckedUpdateInput>
  }

  /**
   * Verification delete
   */
  export type VerificationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Verification
     */
    select?: VerificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Verification
     */
    omit?: VerificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VerificationInclude<ExtArgs> | null
    /**
     * Filter which Verification to delete.
     */
    where: VerificationWhereUniqueInput
  }

  /**
   * Verification deleteMany
   */
  export type VerificationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Verifications to delete
     */
    where?: VerificationWhereInput
    /**
     * Limit how many Verifications to delete.
     */
    limit?: number
  }

  /**
   * Verification without action
   */
  export type VerificationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Verification
     */
    select?: VerificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Verification
     */
    omit?: VerificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VerificationInclude<ExtArgs> | null
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
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const OnboardingCaseScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    candidateId: 'candidateId',
    applicationId: 'applicationId',
    offerId: 'offerId',
    candidateName: 'candidateName',
    candidateEmail: 'candidateEmail',
    jobTitle: 'jobTitle',
    status: 'status',
    portalToken: 'portalToken',
    startDate: 'startDate',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type OnboardingCaseScalarFieldEnum = (typeof OnboardingCaseScalarFieldEnum)[keyof typeof OnboardingCaseScalarFieldEnum]


  export const OnboardingTaskScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    caseId: 'caseId',
    kind: 'kind',
    title: 'title',
    description: 'description',
    required: 'required',
    status: 'status',
    order: 'order',
    completedAt: 'completedAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type OnboardingTaskScalarFieldEnum = (typeof OnboardingTaskScalarFieldEnum)[keyof typeof OnboardingTaskScalarFieldEnum]


  export const OnboardingDocumentScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    caseId: 'caseId',
    label: 'label',
    storageKey: 'storageKey',
    fileName: 'fileName',
    uploadedAt: 'uploadedAt',
    createdAt: 'createdAt'
  };

  export type OnboardingDocumentScalarFieldEnum = (typeof OnboardingDocumentScalarFieldEnum)[keyof typeof OnboardingDocumentScalarFieldEnum]


  export const VerificationScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    caseId: 'caseId',
    type: 'type',
    status: 'status',
    providerRef: 'providerRef',
    provider: 'provider',
    maskedValue: 'maskedValue',
    encryptedPayload: 'encryptedPayload',
    message: 'message',
    verifiedAt: 'verifiedAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type VerificationScalarFieldEnum = (typeof VerificationScalarFieldEnum)[keyof typeof VerificationScalarFieldEnum]


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
   * Reference to a field of type 'OnboardingCaseStatus'
   */
  export type EnumOnboardingCaseStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OnboardingCaseStatus'>
    


  /**
   * Reference to a field of type 'OnboardingCaseStatus[]'
   */
  export type ListEnumOnboardingCaseStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OnboardingCaseStatus[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'OnboardingTaskKind'
   */
  export type EnumOnboardingTaskKindFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OnboardingTaskKind'>
    


  /**
   * Reference to a field of type 'OnboardingTaskKind[]'
   */
  export type ListEnumOnboardingTaskKindFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OnboardingTaskKind[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'OnboardingTaskStatus'
   */
  export type EnumOnboardingTaskStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OnboardingTaskStatus'>
    


  /**
   * Reference to a field of type 'OnboardingTaskStatus[]'
   */
  export type ListEnumOnboardingTaskStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OnboardingTaskStatus[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'VerificationType'
   */
  export type EnumVerificationTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'VerificationType'>
    


  /**
   * Reference to a field of type 'VerificationType[]'
   */
  export type ListEnumVerificationTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'VerificationType[]'>
    


  /**
   * Reference to a field of type 'VerificationStatus'
   */
  export type EnumVerificationStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'VerificationStatus'>
    


  /**
   * Reference to a field of type 'VerificationStatus[]'
   */
  export type ListEnumVerificationStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'VerificationStatus[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'OutboxStatus'
   */
  export type EnumOutboxStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OutboxStatus'>
    


  /**
   * Reference to a field of type 'OutboxStatus[]'
   */
  export type ListEnumOutboxStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OutboxStatus[]'>
    


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


  export type OnboardingCaseWhereInput = {
    AND?: OnboardingCaseWhereInput | OnboardingCaseWhereInput[]
    OR?: OnboardingCaseWhereInput[]
    NOT?: OnboardingCaseWhereInput | OnboardingCaseWhereInput[]
    id?: StringFilter<"OnboardingCase"> | string
    tenantId?: StringFilter<"OnboardingCase"> | string
    candidateId?: StringFilter<"OnboardingCase"> | string
    applicationId?: StringNullableFilter<"OnboardingCase"> | string | null
    offerId?: StringNullableFilter<"OnboardingCase"> | string | null
    candidateName?: StringNullableFilter<"OnboardingCase"> | string | null
    candidateEmail?: StringNullableFilter<"OnboardingCase"> | string | null
    jobTitle?: StringNullableFilter<"OnboardingCase"> | string | null
    status?: EnumOnboardingCaseStatusFilter<"OnboardingCase"> | $Enums.OnboardingCaseStatus
    portalToken?: StringFilter<"OnboardingCase"> | string
    startDate?: DateTimeNullableFilter<"OnboardingCase"> | Date | string | null
    createdAt?: DateTimeFilter<"OnboardingCase"> | Date | string
    updatedAt?: DateTimeFilter<"OnboardingCase"> | Date | string
    tasks?: OnboardingTaskListRelationFilter
    documents?: OnboardingDocumentListRelationFilter
    verifications?: VerificationListRelationFilter
  }

  export type OnboardingCaseOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    candidateId?: SortOrder
    applicationId?: SortOrderInput | SortOrder
    offerId?: SortOrderInput | SortOrder
    candidateName?: SortOrderInput | SortOrder
    candidateEmail?: SortOrderInput | SortOrder
    jobTitle?: SortOrderInput | SortOrder
    status?: SortOrder
    portalToken?: SortOrder
    startDate?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    tasks?: OnboardingTaskOrderByRelationAggregateInput
    documents?: OnboardingDocumentOrderByRelationAggregateInput
    verifications?: VerificationOrderByRelationAggregateInput
  }

  export type OnboardingCaseWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    portalToken?: string
    AND?: OnboardingCaseWhereInput | OnboardingCaseWhereInput[]
    OR?: OnboardingCaseWhereInput[]
    NOT?: OnboardingCaseWhereInput | OnboardingCaseWhereInput[]
    tenantId?: StringFilter<"OnboardingCase"> | string
    candidateId?: StringFilter<"OnboardingCase"> | string
    applicationId?: StringNullableFilter<"OnboardingCase"> | string | null
    offerId?: StringNullableFilter<"OnboardingCase"> | string | null
    candidateName?: StringNullableFilter<"OnboardingCase"> | string | null
    candidateEmail?: StringNullableFilter<"OnboardingCase"> | string | null
    jobTitle?: StringNullableFilter<"OnboardingCase"> | string | null
    status?: EnumOnboardingCaseStatusFilter<"OnboardingCase"> | $Enums.OnboardingCaseStatus
    startDate?: DateTimeNullableFilter<"OnboardingCase"> | Date | string | null
    createdAt?: DateTimeFilter<"OnboardingCase"> | Date | string
    updatedAt?: DateTimeFilter<"OnboardingCase"> | Date | string
    tasks?: OnboardingTaskListRelationFilter
    documents?: OnboardingDocumentListRelationFilter
    verifications?: VerificationListRelationFilter
  }, "id" | "portalToken">

  export type OnboardingCaseOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    candidateId?: SortOrder
    applicationId?: SortOrderInput | SortOrder
    offerId?: SortOrderInput | SortOrder
    candidateName?: SortOrderInput | SortOrder
    candidateEmail?: SortOrderInput | SortOrder
    jobTitle?: SortOrderInput | SortOrder
    status?: SortOrder
    portalToken?: SortOrder
    startDate?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: OnboardingCaseCountOrderByAggregateInput
    _max?: OnboardingCaseMaxOrderByAggregateInput
    _min?: OnboardingCaseMinOrderByAggregateInput
  }

  export type OnboardingCaseScalarWhereWithAggregatesInput = {
    AND?: OnboardingCaseScalarWhereWithAggregatesInput | OnboardingCaseScalarWhereWithAggregatesInput[]
    OR?: OnboardingCaseScalarWhereWithAggregatesInput[]
    NOT?: OnboardingCaseScalarWhereWithAggregatesInput | OnboardingCaseScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"OnboardingCase"> | string
    tenantId?: StringWithAggregatesFilter<"OnboardingCase"> | string
    candidateId?: StringWithAggregatesFilter<"OnboardingCase"> | string
    applicationId?: StringNullableWithAggregatesFilter<"OnboardingCase"> | string | null
    offerId?: StringNullableWithAggregatesFilter<"OnboardingCase"> | string | null
    candidateName?: StringNullableWithAggregatesFilter<"OnboardingCase"> | string | null
    candidateEmail?: StringNullableWithAggregatesFilter<"OnboardingCase"> | string | null
    jobTitle?: StringNullableWithAggregatesFilter<"OnboardingCase"> | string | null
    status?: EnumOnboardingCaseStatusWithAggregatesFilter<"OnboardingCase"> | $Enums.OnboardingCaseStatus
    portalToken?: StringWithAggregatesFilter<"OnboardingCase"> | string
    startDate?: DateTimeNullableWithAggregatesFilter<"OnboardingCase"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"OnboardingCase"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"OnboardingCase"> | Date | string
  }

  export type OnboardingTaskWhereInput = {
    AND?: OnboardingTaskWhereInput | OnboardingTaskWhereInput[]
    OR?: OnboardingTaskWhereInput[]
    NOT?: OnboardingTaskWhereInput | OnboardingTaskWhereInput[]
    id?: StringFilter<"OnboardingTask"> | string
    tenantId?: StringFilter<"OnboardingTask"> | string
    caseId?: StringFilter<"OnboardingTask"> | string
    kind?: EnumOnboardingTaskKindFilter<"OnboardingTask"> | $Enums.OnboardingTaskKind
    title?: StringFilter<"OnboardingTask"> | string
    description?: StringNullableFilter<"OnboardingTask"> | string | null
    required?: BoolFilter<"OnboardingTask"> | boolean
    status?: EnumOnboardingTaskStatusFilter<"OnboardingTask"> | $Enums.OnboardingTaskStatus
    order?: IntFilter<"OnboardingTask"> | number
    completedAt?: DateTimeNullableFilter<"OnboardingTask"> | Date | string | null
    createdAt?: DateTimeFilter<"OnboardingTask"> | Date | string
    updatedAt?: DateTimeFilter<"OnboardingTask"> | Date | string
    case?: XOR<OnboardingCaseScalarRelationFilter, OnboardingCaseWhereInput>
  }

  export type OnboardingTaskOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    caseId?: SortOrder
    kind?: SortOrder
    title?: SortOrder
    description?: SortOrderInput | SortOrder
    required?: SortOrder
    status?: SortOrder
    order?: SortOrder
    completedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    case?: OnboardingCaseOrderByWithRelationInput
  }

  export type OnboardingTaskWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: OnboardingTaskWhereInput | OnboardingTaskWhereInput[]
    OR?: OnboardingTaskWhereInput[]
    NOT?: OnboardingTaskWhereInput | OnboardingTaskWhereInput[]
    tenantId?: StringFilter<"OnboardingTask"> | string
    caseId?: StringFilter<"OnboardingTask"> | string
    kind?: EnumOnboardingTaskKindFilter<"OnboardingTask"> | $Enums.OnboardingTaskKind
    title?: StringFilter<"OnboardingTask"> | string
    description?: StringNullableFilter<"OnboardingTask"> | string | null
    required?: BoolFilter<"OnboardingTask"> | boolean
    status?: EnumOnboardingTaskStatusFilter<"OnboardingTask"> | $Enums.OnboardingTaskStatus
    order?: IntFilter<"OnboardingTask"> | number
    completedAt?: DateTimeNullableFilter<"OnboardingTask"> | Date | string | null
    createdAt?: DateTimeFilter<"OnboardingTask"> | Date | string
    updatedAt?: DateTimeFilter<"OnboardingTask"> | Date | string
    case?: XOR<OnboardingCaseScalarRelationFilter, OnboardingCaseWhereInput>
  }, "id">

  export type OnboardingTaskOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    caseId?: SortOrder
    kind?: SortOrder
    title?: SortOrder
    description?: SortOrderInput | SortOrder
    required?: SortOrder
    status?: SortOrder
    order?: SortOrder
    completedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: OnboardingTaskCountOrderByAggregateInput
    _avg?: OnboardingTaskAvgOrderByAggregateInput
    _max?: OnboardingTaskMaxOrderByAggregateInput
    _min?: OnboardingTaskMinOrderByAggregateInput
    _sum?: OnboardingTaskSumOrderByAggregateInput
  }

  export type OnboardingTaskScalarWhereWithAggregatesInput = {
    AND?: OnboardingTaskScalarWhereWithAggregatesInput | OnboardingTaskScalarWhereWithAggregatesInput[]
    OR?: OnboardingTaskScalarWhereWithAggregatesInput[]
    NOT?: OnboardingTaskScalarWhereWithAggregatesInput | OnboardingTaskScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"OnboardingTask"> | string
    tenantId?: StringWithAggregatesFilter<"OnboardingTask"> | string
    caseId?: StringWithAggregatesFilter<"OnboardingTask"> | string
    kind?: EnumOnboardingTaskKindWithAggregatesFilter<"OnboardingTask"> | $Enums.OnboardingTaskKind
    title?: StringWithAggregatesFilter<"OnboardingTask"> | string
    description?: StringNullableWithAggregatesFilter<"OnboardingTask"> | string | null
    required?: BoolWithAggregatesFilter<"OnboardingTask"> | boolean
    status?: EnumOnboardingTaskStatusWithAggregatesFilter<"OnboardingTask"> | $Enums.OnboardingTaskStatus
    order?: IntWithAggregatesFilter<"OnboardingTask"> | number
    completedAt?: DateTimeNullableWithAggregatesFilter<"OnboardingTask"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"OnboardingTask"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"OnboardingTask"> | Date | string
  }

  export type OnboardingDocumentWhereInput = {
    AND?: OnboardingDocumentWhereInput | OnboardingDocumentWhereInput[]
    OR?: OnboardingDocumentWhereInput[]
    NOT?: OnboardingDocumentWhereInput | OnboardingDocumentWhereInput[]
    id?: StringFilter<"OnboardingDocument"> | string
    tenantId?: StringFilter<"OnboardingDocument"> | string
    caseId?: StringFilter<"OnboardingDocument"> | string
    label?: StringFilter<"OnboardingDocument"> | string
    storageKey?: StringNullableFilter<"OnboardingDocument"> | string | null
    fileName?: StringNullableFilter<"OnboardingDocument"> | string | null
    uploadedAt?: DateTimeNullableFilter<"OnboardingDocument"> | Date | string | null
    createdAt?: DateTimeFilter<"OnboardingDocument"> | Date | string
    case?: XOR<OnboardingCaseScalarRelationFilter, OnboardingCaseWhereInput>
  }

  export type OnboardingDocumentOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    caseId?: SortOrder
    label?: SortOrder
    storageKey?: SortOrderInput | SortOrder
    fileName?: SortOrderInput | SortOrder
    uploadedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    case?: OnboardingCaseOrderByWithRelationInput
  }

  export type OnboardingDocumentWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: OnboardingDocumentWhereInput | OnboardingDocumentWhereInput[]
    OR?: OnboardingDocumentWhereInput[]
    NOT?: OnboardingDocumentWhereInput | OnboardingDocumentWhereInput[]
    tenantId?: StringFilter<"OnboardingDocument"> | string
    caseId?: StringFilter<"OnboardingDocument"> | string
    label?: StringFilter<"OnboardingDocument"> | string
    storageKey?: StringNullableFilter<"OnboardingDocument"> | string | null
    fileName?: StringNullableFilter<"OnboardingDocument"> | string | null
    uploadedAt?: DateTimeNullableFilter<"OnboardingDocument"> | Date | string | null
    createdAt?: DateTimeFilter<"OnboardingDocument"> | Date | string
    case?: XOR<OnboardingCaseScalarRelationFilter, OnboardingCaseWhereInput>
  }, "id">

  export type OnboardingDocumentOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    caseId?: SortOrder
    label?: SortOrder
    storageKey?: SortOrderInput | SortOrder
    fileName?: SortOrderInput | SortOrder
    uploadedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: OnboardingDocumentCountOrderByAggregateInput
    _max?: OnboardingDocumentMaxOrderByAggregateInput
    _min?: OnboardingDocumentMinOrderByAggregateInput
  }

  export type OnboardingDocumentScalarWhereWithAggregatesInput = {
    AND?: OnboardingDocumentScalarWhereWithAggregatesInput | OnboardingDocumentScalarWhereWithAggregatesInput[]
    OR?: OnboardingDocumentScalarWhereWithAggregatesInput[]
    NOT?: OnboardingDocumentScalarWhereWithAggregatesInput | OnboardingDocumentScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"OnboardingDocument"> | string
    tenantId?: StringWithAggregatesFilter<"OnboardingDocument"> | string
    caseId?: StringWithAggregatesFilter<"OnboardingDocument"> | string
    label?: StringWithAggregatesFilter<"OnboardingDocument"> | string
    storageKey?: StringNullableWithAggregatesFilter<"OnboardingDocument"> | string | null
    fileName?: StringNullableWithAggregatesFilter<"OnboardingDocument"> | string | null
    uploadedAt?: DateTimeNullableWithAggregatesFilter<"OnboardingDocument"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"OnboardingDocument"> | Date | string
  }

  export type VerificationWhereInput = {
    AND?: VerificationWhereInput | VerificationWhereInput[]
    OR?: VerificationWhereInput[]
    NOT?: VerificationWhereInput | VerificationWhereInput[]
    id?: StringFilter<"Verification"> | string
    tenantId?: StringFilter<"Verification"> | string
    caseId?: StringFilter<"Verification"> | string
    type?: EnumVerificationTypeFilter<"Verification"> | $Enums.VerificationType
    status?: EnumVerificationStatusFilter<"Verification"> | $Enums.VerificationStatus
    providerRef?: StringNullableFilter<"Verification"> | string | null
    provider?: StringNullableFilter<"Verification"> | string | null
    maskedValue?: StringNullableFilter<"Verification"> | string | null
    encryptedPayload?: StringNullableFilter<"Verification"> | string | null
    message?: StringNullableFilter<"Verification"> | string | null
    verifiedAt?: DateTimeNullableFilter<"Verification"> | Date | string | null
    createdAt?: DateTimeFilter<"Verification"> | Date | string
    updatedAt?: DateTimeFilter<"Verification"> | Date | string
    case?: XOR<OnboardingCaseScalarRelationFilter, OnboardingCaseWhereInput>
  }

  export type VerificationOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    caseId?: SortOrder
    type?: SortOrder
    status?: SortOrder
    providerRef?: SortOrderInput | SortOrder
    provider?: SortOrderInput | SortOrder
    maskedValue?: SortOrderInput | SortOrder
    encryptedPayload?: SortOrderInput | SortOrder
    message?: SortOrderInput | SortOrder
    verifiedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    case?: OnboardingCaseOrderByWithRelationInput
  }

  export type VerificationWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    caseId_type?: VerificationCaseIdTypeCompoundUniqueInput
    AND?: VerificationWhereInput | VerificationWhereInput[]
    OR?: VerificationWhereInput[]
    NOT?: VerificationWhereInput | VerificationWhereInput[]
    tenantId?: StringFilter<"Verification"> | string
    caseId?: StringFilter<"Verification"> | string
    type?: EnumVerificationTypeFilter<"Verification"> | $Enums.VerificationType
    status?: EnumVerificationStatusFilter<"Verification"> | $Enums.VerificationStatus
    providerRef?: StringNullableFilter<"Verification"> | string | null
    provider?: StringNullableFilter<"Verification"> | string | null
    maskedValue?: StringNullableFilter<"Verification"> | string | null
    encryptedPayload?: StringNullableFilter<"Verification"> | string | null
    message?: StringNullableFilter<"Verification"> | string | null
    verifiedAt?: DateTimeNullableFilter<"Verification"> | Date | string | null
    createdAt?: DateTimeFilter<"Verification"> | Date | string
    updatedAt?: DateTimeFilter<"Verification"> | Date | string
    case?: XOR<OnboardingCaseScalarRelationFilter, OnboardingCaseWhereInput>
  }, "id" | "caseId_type">

  export type VerificationOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    caseId?: SortOrder
    type?: SortOrder
    status?: SortOrder
    providerRef?: SortOrderInput | SortOrder
    provider?: SortOrderInput | SortOrder
    maskedValue?: SortOrderInput | SortOrder
    encryptedPayload?: SortOrderInput | SortOrder
    message?: SortOrderInput | SortOrder
    verifiedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: VerificationCountOrderByAggregateInput
    _max?: VerificationMaxOrderByAggregateInput
    _min?: VerificationMinOrderByAggregateInput
  }

  export type VerificationScalarWhereWithAggregatesInput = {
    AND?: VerificationScalarWhereWithAggregatesInput | VerificationScalarWhereWithAggregatesInput[]
    OR?: VerificationScalarWhereWithAggregatesInput[]
    NOT?: VerificationScalarWhereWithAggregatesInput | VerificationScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Verification"> | string
    tenantId?: StringWithAggregatesFilter<"Verification"> | string
    caseId?: StringWithAggregatesFilter<"Verification"> | string
    type?: EnumVerificationTypeWithAggregatesFilter<"Verification"> | $Enums.VerificationType
    status?: EnumVerificationStatusWithAggregatesFilter<"Verification"> | $Enums.VerificationStatus
    providerRef?: StringNullableWithAggregatesFilter<"Verification"> | string | null
    provider?: StringNullableWithAggregatesFilter<"Verification"> | string | null
    maskedValue?: StringNullableWithAggregatesFilter<"Verification"> | string | null
    encryptedPayload?: StringNullableWithAggregatesFilter<"Verification"> | string | null
    message?: StringNullableWithAggregatesFilter<"Verification"> | string | null
    verifiedAt?: DateTimeNullableWithAggregatesFilter<"Verification"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Verification"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Verification"> | Date | string
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

  export type OnboardingCaseCreateInput = {
    id?: string
    tenantId: string
    candidateId: string
    applicationId?: string | null
    offerId?: string | null
    candidateName?: string | null
    candidateEmail?: string | null
    jobTitle?: string | null
    status?: $Enums.OnboardingCaseStatus
    portalToken: string
    startDate?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tasks?: OnboardingTaskCreateNestedManyWithoutCaseInput
    documents?: OnboardingDocumentCreateNestedManyWithoutCaseInput
    verifications?: VerificationCreateNestedManyWithoutCaseInput
  }

  export type OnboardingCaseUncheckedCreateInput = {
    id?: string
    tenantId: string
    candidateId: string
    applicationId?: string | null
    offerId?: string | null
    candidateName?: string | null
    candidateEmail?: string | null
    jobTitle?: string | null
    status?: $Enums.OnboardingCaseStatus
    portalToken: string
    startDate?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tasks?: OnboardingTaskUncheckedCreateNestedManyWithoutCaseInput
    documents?: OnboardingDocumentUncheckedCreateNestedManyWithoutCaseInput
    verifications?: VerificationUncheckedCreateNestedManyWithoutCaseInput
  }

  export type OnboardingCaseUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    applicationId?: NullableStringFieldUpdateOperationsInput | string | null
    offerId?: NullableStringFieldUpdateOperationsInput | string | null
    candidateName?: NullableStringFieldUpdateOperationsInput | string | null
    candidateEmail?: NullableStringFieldUpdateOperationsInput | string | null
    jobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumOnboardingCaseStatusFieldUpdateOperationsInput | $Enums.OnboardingCaseStatus
    portalToken?: StringFieldUpdateOperationsInput | string
    startDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tasks?: OnboardingTaskUpdateManyWithoutCaseNestedInput
    documents?: OnboardingDocumentUpdateManyWithoutCaseNestedInput
    verifications?: VerificationUpdateManyWithoutCaseNestedInput
  }

  export type OnboardingCaseUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    applicationId?: NullableStringFieldUpdateOperationsInput | string | null
    offerId?: NullableStringFieldUpdateOperationsInput | string | null
    candidateName?: NullableStringFieldUpdateOperationsInput | string | null
    candidateEmail?: NullableStringFieldUpdateOperationsInput | string | null
    jobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumOnboardingCaseStatusFieldUpdateOperationsInput | $Enums.OnboardingCaseStatus
    portalToken?: StringFieldUpdateOperationsInput | string
    startDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tasks?: OnboardingTaskUncheckedUpdateManyWithoutCaseNestedInput
    documents?: OnboardingDocumentUncheckedUpdateManyWithoutCaseNestedInput
    verifications?: VerificationUncheckedUpdateManyWithoutCaseNestedInput
  }

  export type OnboardingCaseCreateManyInput = {
    id?: string
    tenantId: string
    candidateId: string
    applicationId?: string | null
    offerId?: string | null
    candidateName?: string | null
    candidateEmail?: string | null
    jobTitle?: string | null
    status?: $Enums.OnboardingCaseStatus
    portalToken: string
    startDate?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OnboardingCaseUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    applicationId?: NullableStringFieldUpdateOperationsInput | string | null
    offerId?: NullableStringFieldUpdateOperationsInput | string | null
    candidateName?: NullableStringFieldUpdateOperationsInput | string | null
    candidateEmail?: NullableStringFieldUpdateOperationsInput | string | null
    jobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumOnboardingCaseStatusFieldUpdateOperationsInput | $Enums.OnboardingCaseStatus
    portalToken?: StringFieldUpdateOperationsInput | string
    startDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OnboardingCaseUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    applicationId?: NullableStringFieldUpdateOperationsInput | string | null
    offerId?: NullableStringFieldUpdateOperationsInput | string | null
    candidateName?: NullableStringFieldUpdateOperationsInput | string | null
    candidateEmail?: NullableStringFieldUpdateOperationsInput | string | null
    jobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumOnboardingCaseStatusFieldUpdateOperationsInput | $Enums.OnboardingCaseStatus
    portalToken?: StringFieldUpdateOperationsInput | string
    startDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OnboardingTaskCreateInput = {
    id?: string
    tenantId: string
    kind: $Enums.OnboardingTaskKind
    title: string
    description?: string | null
    required?: boolean
    status?: $Enums.OnboardingTaskStatus
    order?: number
    completedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    case: OnboardingCaseCreateNestedOneWithoutTasksInput
  }

  export type OnboardingTaskUncheckedCreateInput = {
    id?: string
    tenantId: string
    caseId: string
    kind: $Enums.OnboardingTaskKind
    title: string
    description?: string | null
    required?: boolean
    status?: $Enums.OnboardingTaskStatus
    order?: number
    completedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OnboardingTaskUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    kind?: EnumOnboardingTaskKindFieldUpdateOperationsInput | $Enums.OnboardingTaskKind
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    required?: BoolFieldUpdateOperationsInput | boolean
    status?: EnumOnboardingTaskStatusFieldUpdateOperationsInput | $Enums.OnboardingTaskStatus
    order?: IntFieldUpdateOperationsInput | number
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    case?: OnboardingCaseUpdateOneRequiredWithoutTasksNestedInput
  }

  export type OnboardingTaskUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    caseId?: StringFieldUpdateOperationsInput | string
    kind?: EnumOnboardingTaskKindFieldUpdateOperationsInput | $Enums.OnboardingTaskKind
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    required?: BoolFieldUpdateOperationsInput | boolean
    status?: EnumOnboardingTaskStatusFieldUpdateOperationsInput | $Enums.OnboardingTaskStatus
    order?: IntFieldUpdateOperationsInput | number
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OnboardingTaskCreateManyInput = {
    id?: string
    tenantId: string
    caseId: string
    kind: $Enums.OnboardingTaskKind
    title: string
    description?: string | null
    required?: boolean
    status?: $Enums.OnboardingTaskStatus
    order?: number
    completedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OnboardingTaskUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    kind?: EnumOnboardingTaskKindFieldUpdateOperationsInput | $Enums.OnboardingTaskKind
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    required?: BoolFieldUpdateOperationsInput | boolean
    status?: EnumOnboardingTaskStatusFieldUpdateOperationsInput | $Enums.OnboardingTaskStatus
    order?: IntFieldUpdateOperationsInput | number
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OnboardingTaskUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    caseId?: StringFieldUpdateOperationsInput | string
    kind?: EnumOnboardingTaskKindFieldUpdateOperationsInput | $Enums.OnboardingTaskKind
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    required?: BoolFieldUpdateOperationsInput | boolean
    status?: EnumOnboardingTaskStatusFieldUpdateOperationsInput | $Enums.OnboardingTaskStatus
    order?: IntFieldUpdateOperationsInput | number
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OnboardingDocumentCreateInput = {
    id?: string
    tenantId: string
    label: string
    storageKey?: string | null
    fileName?: string | null
    uploadedAt?: Date | string | null
    createdAt?: Date | string
    case: OnboardingCaseCreateNestedOneWithoutDocumentsInput
  }

  export type OnboardingDocumentUncheckedCreateInput = {
    id?: string
    tenantId: string
    caseId: string
    label: string
    storageKey?: string | null
    fileName?: string | null
    uploadedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type OnboardingDocumentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    storageKey?: NullableStringFieldUpdateOperationsInput | string | null
    fileName?: NullableStringFieldUpdateOperationsInput | string | null
    uploadedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    case?: OnboardingCaseUpdateOneRequiredWithoutDocumentsNestedInput
  }

  export type OnboardingDocumentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    caseId?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    storageKey?: NullableStringFieldUpdateOperationsInput | string | null
    fileName?: NullableStringFieldUpdateOperationsInput | string | null
    uploadedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OnboardingDocumentCreateManyInput = {
    id?: string
    tenantId: string
    caseId: string
    label: string
    storageKey?: string | null
    fileName?: string | null
    uploadedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type OnboardingDocumentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    storageKey?: NullableStringFieldUpdateOperationsInput | string | null
    fileName?: NullableStringFieldUpdateOperationsInput | string | null
    uploadedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OnboardingDocumentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    caseId?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    storageKey?: NullableStringFieldUpdateOperationsInput | string | null
    fileName?: NullableStringFieldUpdateOperationsInput | string | null
    uploadedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VerificationCreateInput = {
    id?: string
    tenantId: string
    type: $Enums.VerificationType
    status?: $Enums.VerificationStatus
    providerRef?: string | null
    provider?: string | null
    maskedValue?: string | null
    encryptedPayload?: string | null
    message?: string | null
    verifiedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    case: OnboardingCaseCreateNestedOneWithoutVerificationsInput
  }

  export type VerificationUncheckedCreateInput = {
    id?: string
    tenantId: string
    caseId: string
    type: $Enums.VerificationType
    status?: $Enums.VerificationStatus
    providerRef?: string | null
    provider?: string | null
    maskedValue?: string | null
    encryptedPayload?: string | null
    message?: string | null
    verifiedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type VerificationUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    type?: EnumVerificationTypeFieldUpdateOperationsInput | $Enums.VerificationType
    status?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    providerRef?: NullableStringFieldUpdateOperationsInput | string | null
    provider?: NullableStringFieldUpdateOperationsInput | string | null
    maskedValue?: NullableStringFieldUpdateOperationsInput | string | null
    encryptedPayload?: NullableStringFieldUpdateOperationsInput | string | null
    message?: NullableStringFieldUpdateOperationsInput | string | null
    verifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    case?: OnboardingCaseUpdateOneRequiredWithoutVerificationsNestedInput
  }

  export type VerificationUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    caseId?: StringFieldUpdateOperationsInput | string
    type?: EnumVerificationTypeFieldUpdateOperationsInput | $Enums.VerificationType
    status?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    providerRef?: NullableStringFieldUpdateOperationsInput | string | null
    provider?: NullableStringFieldUpdateOperationsInput | string | null
    maskedValue?: NullableStringFieldUpdateOperationsInput | string | null
    encryptedPayload?: NullableStringFieldUpdateOperationsInput | string | null
    message?: NullableStringFieldUpdateOperationsInput | string | null
    verifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VerificationCreateManyInput = {
    id?: string
    tenantId: string
    caseId: string
    type: $Enums.VerificationType
    status?: $Enums.VerificationStatus
    providerRef?: string | null
    provider?: string | null
    maskedValue?: string | null
    encryptedPayload?: string | null
    message?: string | null
    verifiedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type VerificationUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    type?: EnumVerificationTypeFieldUpdateOperationsInput | $Enums.VerificationType
    status?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    providerRef?: NullableStringFieldUpdateOperationsInput | string | null
    provider?: NullableStringFieldUpdateOperationsInput | string | null
    maskedValue?: NullableStringFieldUpdateOperationsInput | string | null
    encryptedPayload?: NullableStringFieldUpdateOperationsInput | string | null
    message?: NullableStringFieldUpdateOperationsInput | string | null
    verifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VerificationUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    caseId?: StringFieldUpdateOperationsInput | string
    type?: EnumVerificationTypeFieldUpdateOperationsInput | $Enums.VerificationType
    status?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    providerRef?: NullableStringFieldUpdateOperationsInput | string | null
    provider?: NullableStringFieldUpdateOperationsInput | string | null
    maskedValue?: NullableStringFieldUpdateOperationsInput | string | null
    encryptedPayload?: NullableStringFieldUpdateOperationsInput | string | null
    message?: NullableStringFieldUpdateOperationsInput | string | null
    verifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
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

  export type EnumOnboardingCaseStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.OnboardingCaseStatus | EnumOnboardingCaseStatusFieldRefInput<$PrismaModel>
    in?: $Enums.OnboardingCaseStatus[] | ListEnumOnboardingCaseStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.OnboardingCaseStatus[] | ListEnumOnboardingCaseStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumOnboardingCaseStatusFilter<$PrismaModel> | $Enums.OnboardingCaseStatus
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

  export type OnboardingTaskListRelationFilter = {
    every?: OnboardingTaskWhereInput
    some?: OnboardingTaskWhereInput
    none?: OnboardingTaskWhereInput
  }

  export type OnboardingDocumentListRelationFilter = {
    every?: OnboardingDocumentWhereInput
    some?: OnboardingDocumentWhereInput
    none?: OnboardingDocumentWhereInput
  }

  export type VerificationListRelationFilter = {
    every?: VerificationWhereInput
    some?: VerificationWhereInput
    none?: VerificationWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type OnboardingTaskOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type OnboardingDocumentOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type VerificationOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type OnboardingCaseCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    candidateId?: SortOrder
    applicationId?: SortOrder
    offerId?: SortOrder
    candidateName?: SortOrder
    candidateEmail?: SortOrder
    jobTitle?: SortOrder
    status?: SortOrder
    portalToken?: SortOrder
    startDate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OnboardingCaseMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    candidateId?: SortOrder
    applicationId?: SortOrder
    offerId?: SortOrder
    candidateName?: SortOrder
    candidateEmail?: SortOrder
    jobTitle?: SortOrder
    status?: SortOrder
    portalToken?: SortOrder
    startDate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OnboardingCaseMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    candidateId?: SortOrder
    applicationId?: SortOrder
    offerId?: SortOrder
    candidateName?: SortOrder
    candidateEmail?: SortOrder
    jobTitle?: SortOrder
    status?: SortOrder
    portalToken?: SortOrder
    startDate?: SortOrder
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

  export type EnumOnboardingCaseStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.OnboardingCaseStatus | EnumOnboardingCaseStatusFieldRefInput<$PrismaModel>
    in?: $Enums.OnboardingCaseStatus[] | ListEnumOnboardingCaseStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.OnboardingCaseStatus[] | ListEnumOnboardingCaseStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumOnboardingCaseStatusWithAggregatesFilter<$PrismaModel> | $Enums.OnboardingCaseStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumOnboardingCaseStatusFilter<$PrismaModel>
    _max?: NestedEnumOnboardingCaseStatusFilter<$PrismaModel>
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

  export type EnumOnboardingTaskKindFilter<$PrismaModel = never> = {
    equals?: $Enums.OnboardingTaskKind | EnumOnboardingTaskKindFieldRefInput<$PrismaModel>
    in?: $Enums.OnboardingTaskKind[] | ListEnumOnboardingTaskKindFieldRefInput<$PrismaModel>
    notIn?: $Enums.OnboardingTaskKind[] | ListEnumOnboardingTaskKindFieldRefInput<$PrismaModel>
    not?: NestedEnumOnboardingTaskKindFilter<$PrismaModel> | $Enums.OnboardingTaskKind
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type EnumOnboardingTaskStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.OnboardingTaskStatus | EnumOnboardingTaskStatusFieldRefInput<$PrismaModel>
    in?: $Enums.OnboardingTaskStatus[] | ListEnumOnboardingTaskStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.OnboardingTaskStatus[] | ListEnumOnboardingTaskStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumOnboardingTaskStatusFilter<$PrismaModel> | $Enums.OnboardingTaskStatus
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

  export type OnboardingCaseScalarRelationFilter = {
    is?: OnboardingCaseWhereInput
    isNot?: OnboardingCaseWhereInput
  }

  export type OnboardingTaskCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    caseId?: SortOrder
    kind?: SortOrder
    title?: SortOrder
    description?: SortOrder
    required?: SortOrder
    status?: SortOrder
    order?: SortOrder
    completedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OnboardingTaskAvgOrderByAggregateInput = {
    order?: SortOrder
  }

  export type OnboardingTaskMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    caseId?: SortOrder
    kind?: SortOrder
    title?: SortOrder
    description?: SortOrder
    required?: SortOrder
    status?: SortOrder
    order?: SortOrder
    completedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OnboardingTaskMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    caseId?: SortOrder
    kind?: SortOrder
    title?: SortOrder
    description?: SortOrder
    required?: SortOrder
    status?: SortOrder
    order?: SortOrder
    completedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OnboardingTaskSumOrderByAggregateInput = {
    order?: SortOrder
  }

  export type EnumOnboardingTaskKindWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.OnboardingTaskKind | EnumOnboardingTaskKindFieldRefInput<$PrismaModel>
    in?: $Enums.OnboardingTaskKind[] | ListEnumOnboardingTaskKindFieldRefInput<$PrismaModel>
    notIn?: $Enums.OnboardingTaskKind[] | ListEnumOnboardingTaskKindFieldRefInput<$PrismaModel>
    not?: NestedEnumOnboardingTaskKindWithAggregatesFilter<$PrismaModel> | $Enums.OnboardingTaskKind
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumOnboardingTaskKindFilter<$PrismaModel>
    _max?: NestedEnumOnboardingTaskKindFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type EnumOnboardingTaskStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.OnboardingTaskStatus | EnumOnboardingTaskStatusFieldRefInput<$PrismaModel>
    in?: $Enums.OnboardingTaskStatus[] | ListEnumOnboardingTaskStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.OnboardingTaskStatus[] | ListEnumOnboardingTaskStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumOnboardingTaskStatusWithAggregatesFilter<$PrismaModel> | $Enums.OnboardingTaskStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumOnboardingTaskStatusFilter<$PrismaModel>
    _max?: NestedEnumOnboardingTaskStatusFilter<$PrismaModel>
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

  export type OnboardingDocumentCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    caseId?: SortOrder
    label?: SortOrder
    storageKey?: SortOrder
    fileName?: SortOrder
    uploadedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type OnboardingDocumentMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    caseId?: SortOrder
    label?: SortOrder
    storageKey?: SortOrder
    fileName?: SortOrder
    uploadedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type OnboardingDocumentMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    caseId?: SortOrder
    label?: SortOrder
    storageKey?: SortOrder
    fileName?: SortOrder
    uploadedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type EnumVerificationTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.VerificationType | EnumVerificationTypeFieldRefInput<$PrismaModel>
    in?: $Enums.VerificationType[] | ListEnumVerificationTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.VerificationType[] | ListEnumVerificationTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumVerificationTypeFilter<$PrismaModel> | $Enums.VerificationType
  }

  export type EnumVerificationStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.VerificationStatus | EnumVerificationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.VerificationStatus[] | ListEnumVerificationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.VerificationStatus[] | ListEnumVerificationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumVerificationStatusFilter<$PrismaModel> | $Enums.VerificationStatus
  }

  export type VerificationCaseIdTypeCompoundUniqueInput = {
    caseId: string
    type: $Enums.VerificationType
  }

  export type VerificationCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    caseId?: SortOrder
    type?: SortOrder
    status?: SortOrder
    providerRef?: SortOrder
    provider?: SortOrder
    maskedValue?: SortOrder
    encryptedPayload?: SortOrder
    message?: SortOrder
    verifiedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type VerificationMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    caseId?: SortOrder
    type?: SortOrder
    status?: SortOrder
    providerRef?: SortOrder
    provider?: SortOrder
    maskedValue?: SortOrder
    encryptedPayload?: SortOrder
    message?: SortOrder
    verifiedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type VerificationMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    caseId?: SortOrder
    type?: SortOrder
    status?: SortOrder
    providerRef?: SortOrder
    provider?: SortOrder
    maskedValue?: SortOrder
    encryptedPayload?: SortOrder
    message?: SortOrder
    verifiedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumVerificationTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.VerificationType | EnumVerificationTypeFieldRefInput<$PrismaModel>
    in?: $Enums.VerificationType[] | ListEnumVerificationTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.VerificationType[] | ListEnumVerificationTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumVerificationTypeWithAggregatesFilter<$PrismaModel> | $Enums.VerificationType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumVerificationTypeFilter<$PrismaModel>
    _max?: NestedEnumVerificationTypeFilter<$PrismaModel>
  }

  export type EnumVerificationStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.VerificationStatus | EnumVerificationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.VerificationStatus[] | ListEnumVerificationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.VerificationStatus[] | ListEnumVerificationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumVerificationStatusWithAggregatesFilter<$PrismaModel> | $Enums.VerificationStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumVerificationStatusFilter<$PrismaModel>
    _max?: NestedEnumVerificationStatusFilter<$PrismaModel>
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

  export type EnumOutboxStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.OutboxStatus | EnumOutboxStatusFieldRefInput<$PrismaModel>
    in?: $Enums.OutboxStatus[] | ListEnumOutboxStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.OutboxStatus[] | ListEnumOutboxStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumOutboxStatusWithAggregatesFilter<$PrismaModel> | $Enums.OutboxStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumOutboxStatusFilter<$PrismaModel>
    _max?: NestedEnumOutboxStatusFilter<$PrismaModel>
  }

  export type OnboardingTaskCreateNestedManyWithoutCaseInput = {
    create?: XOR<OnboardingTaskCreateWithoutCaseInput, OnboardingTaskUncheckedCreateWithoutCaseInput> | OnboardingTaskCreateWithoutCaseInput[] | OnboardingTaskUncheckedCreateWithoutCaseInput[]
    connectOrCreate?: OnboardingTaskCreateOrConnectWithoutCaseInput | OnboardingTaskCreateOrConnectWithoutCaseInput[]
    createMany?: OnboardingTaskCreateManyCaseInputEnvelope
    connect?: OnboardingTaskWhereUniqueInput | OnboardingTaskWhereUniqueInput[]
  }

  export type OnboardingDocumentCreateNestedManyWithoutCaseInput = {
    create?: XOR<OnboardingDocumentCreateWithoutCaseInput, OnboardingDocumentUncheckedCreateWithoutCaseInput> | OnboardingDocumentCreateWithoutCaseInput[] | OnboardingDocumentUncheckedCreateWithoutCaseInput[]
    connectOrCreate?: OnboardingDocumentCreateOrConnectWithoutCaseInput | OnboardingDocumentCreateOrConnectWithoutCaseInput[]
    createMany?: OnboardingDocumentCreateManyCaseInputEnvelope
    connect?: OnboardingDocumentWhereUniqueInput | OnboardingDocumentWhereUniqueInput[]
  }

  export type VerificationCreateNestedManyWithoutCaseInput = {
    create?: XOR<VerificationCreateWithoutCaseInput, VerificationUncheckedCreateWithoutCaseInput> | VerificationCreateWithoutCaseInput[] | VerificationUncheckedCreateWithoutCaseInput[]
    connectOrCreate?: VerificationCreateOrConnectWithoutCaseInput | VerificationCreateOrConnectWithoutCaseInput[]
    createMany?: VerificationCreateManyCaseInputEnvelope
    connect?: VerificationWhereUniqueInput | VerificationWhereUniqueInput[]
  }

  export type OnboardingTaskUncheckedCreateNestedManyWithoutCaseInput = {
    create?: XOR<OnboardingTaskCreateWithoutCaseInput, OnboardingTaskUncheckedCreateWithoutCaseInput> | OnboardingTaskCreateWithoutCaseInput[] | OnboardingTaskUncheckedCreateWithoutCaseInput[]
    connectOrCreate?: OnboardingTaskCreateOrConnectWithoutCaseInput | OnboardingTaskCreateOrConnectWithoutCaseInput[]
    createMany?: OnboardingTaskCreateManyCaseInputEnvelope
    connect?: OnboardingTaskWhereUniqueInput | OnboardingTaskWhereUniqueInput[]
  }

  export type OnboardingDocumentUncheckedCreateNestedManyWithoutCaseInput = {
    create?: XOR<OnboardingDocumentCreateWithoutCaseInput, OnboardingDocumentUncheckedCreateWithoutCaseInput> | OnboardingDocumentCreateWithoutCaseInput[] | OnboardingDocumentUncheckedCreateWithoutCaseInput[]
    connectOrCreate?: OnboardingDocumentCreateOrConnectWithoutCaseInput | OnboardingDocumentCreateOrConnectWithoutCaseInput[]
    createMany?: OnboardingDocumentCreateManyCaseInputEnvelope
    connect?: OnboardingDocumentWhereUniqueInput | OnboardingDocumentWhereUniqueInput[]
  }

  export type VerificationUncheckedCreateNestedManyWithoutCaseInput = {
    create?: XOR<VerificationCreateWithoutCaseInput, VerificationUncheckedCreateWithoutCaseInput> | VerificationCreateWithoutCaseInput[] | VerificationUncheckedCreateWithoutCaseInput[]
    connectOrCreate?: VerificationCreateOrConnectWithoutCaseInput | VerificationCreateOrConnectWithoutCaseInput[]
    createMany?: VerificationCreateManyCaseInputEnvelope
    connect?: VerificationWhereUniqueInput | VerificationWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type EnumOnboardingCaseStatusFieldUpdateOperationsInput = {
    set?: $Enums.OnboardingCaseStatus
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type OnboardingTaskUpdateManyWithoutCaseNestedInput = {
    create?: XOR<OnboardingTaskCreateWithoutCaseInput, OnboardingTaskUncheckedCreateWithoutCaseInput> | OnboardingTaskCreateWithoutCaseInput[] | OnboardingTaskUncheckedCreateWithoutCaseInput[]
    connectOrCreate?: OnboardingTaskCreateOrConnectWithoutCaseInput | OnboardingTaskCreateOrConnectWithoutCaseInput[]
    upsert?: OnboardingTaskUpsertWithWhereUniqueWithoutCaseInput | OnboardingTaskUpsertWithWhereUniqueWithoutCaseInput[]
    createMany?: OnboardingTaskCreateManyCaseInputEnvelope
    set?: OnboardingTaskWhereUniqueInput | OnboardingTaskWhereUniqueInput[]
    disconnect?: OnboardingTaskWhereUniqueInput | OnboardingTaskWhereUniqueInput[]
    delete?: OnboardingTaskWhereUniqueInput | OnboardingTaskWhereUniqueInput[]
    connect?: OnboardingTaskWhereUniqueInput | OnboardingTaskWhereUniqueInput[]
    update?: OnboardingTaskUpdateWithWhereUniqueWithoutCaseInput | OnboardingTaskUpdateWithWhereUniqueWithoutCaseInput[]
    updateMany?: OnboardingTaskUpdateManyWithWhereWithoutCaseInput | OnboardingTaskUpdateManyWithWhereWithoutCaseInput[]
    deleteMany?: OnboardingTaskScalarWhereInput | OnboardingTaskScalarWhereInput[]
  }

  export type OnboardingDocumentUpdateManyWithoutCaseNestedInput = {
    create?: XOR<OnboardingDocumentCreateWithoutCaseInput, OnboardingDocumentUncheckedCreateWithoutCaseInput> | OnboardingDocumentCreateWithoutCaseInput[] | OnboardingDocumentUncheckedCreateWithoutCaseInput[]
    connectOrCreate?: OnboardingDocumentCreateOrConnectWithoutCaseInput | OnboardingDocumentCreateOrConnectWithoutCaseInput[]
    upsert?: OnboardingDocumentUpsertWithWhereUniqueWithoutCaseInput | OnboardingDocumentUpsertWithWhereUniqueWithoutCaseInput[]
    createMany?: OnboardingDocumentCreateManyCaseInputEnvelope
    set?: OnboardingDocumentWhereUniqueInput | OnboardingDocumentWhereUniqueInput[]
    disconnect?: OnboardingDocumentWhereUniqueInput | OnboardingDocumentWhereUniqueInput[]
    delete?: OnboardingDocumentWhereUniqueInput | OnboardingDocumentWhereUniqueInput[]
    connect?: OnboardingDocumentWhereUniqueInput | OnboardingDocumentWhereUniqueInput[]
    update?: OnboardingDocumentUpdateWithWhereUniqueWithoutCaseInput | OnboardingDocumentUpdateWithWhereUniqueWithoutCaseInput[]
    updateMany?: OnboardingDocumentUpdateManyWithWhereWithoutCaseInput | OnboardingDocumentUpdateManyWithWhereWithoutCaseInput[]
    deleteMany?: OnboardingDocumentScalarWhereInput | OnboardingDocumentScalarWhereInput[]
  }

  export type VerificationUpdateManyWithoutCaseNestedInput = {
    create?: XOR<VerificationCreateWithoutCaseInput, VerificationUncheckedCreateWithoutCaseInput> | VerificationCreateWithoutCaseInput[] | VerificationUncheckedCreateWithoutCaseInput[]
    connectOrCreate?: VerificationCreateOrConnectWithoutCaseInput | VerificationCreateOrConnectWithoutCaseInput[]
    upsert?: VerificationUpsertWithWhereUniqueWithoutCaseInput | VerificationUpsertWithWhereUniqueWithoutCaseInput[]
    createMany?: VerificationCreateManyCaseInputEnvelope
    set?: VerificationWhereUniqueInput | VerificationWhereUniqueInput[]
    disconnect?: VerificationWhereUniqueInput | VerificationWhereUniqueInput[]
    delete?: VerificationWhereUniqueInput | VerificationWhereUniqueInput[]
    connect?: VerificationWhereUniqueInput | VerificationWhereUniqueInput[]
    update?: VerificationUpdateWithWhereUniqueWithoutCaseInput | VerificationUpdateWithWhereUniqueWithoutCaseInput[]
    updateMany?: VerificationUpdateManyWithWhereWithoutCaseInput | VerificationUpdateManyWithWhereWithoutCaseInput[]
    deleteMany?: VerificationScalarWhereInput | VerificationScalarWhereInput[]
  }

  export type OnboardingTaskUncheckedUpdateManyWithoutCaseNestedInput = {
    create?: XOR<OnboardingTaskCreateWithoutCaseInput, OnboardingTaskUncheckedCreateWithoutCaseInput> | OnboardingTaskCreateWithoutCaseInput[] | OnboardingTaskUncheckedCreateWithoutCaseInput[]
    connectOrCreate?: OnboardingTaskCreateOrConnectWithoutCaseInput | OnboardingTaskCreateOrConnectWithoutCaseInput[]
    upsert?: OnboardingTaskUpsertWithWhereUniqueWithoutCaseInput | OnboardingTaskUpsertWithWhereUniqueWithoutCaseInput[]
    createMany?: OnboardingTaskCreateManyCaseInputEnvelope
    set?: OnboardingTaskWhereUniqueInput | OnboardingTaskWhereUniqueInput[]
    disconnect?: OnboardingTaskWhereUniqueInput | OnboardingTaskWhereUniqueInput[]
    delete?: OnboardingTaskWhereUniqueInput | OnboardingTaskWhereUniqueInput[]
    connect?: OnboardingTaskWhereUniqueInput | OnboardingTaskWhereUniqueInput[]
    update?: OnboardingTaskUpdateWithWhereUniqueWithoutCaseInput | OnboardingTaskUpdateWithWhereUniqueWithoutCaseInput[]
    updateMany?: OnboardingTaskUpdateManyWithWhereWithoutCaseInput | OnboardingTaskUpdateManyWithWhereWithoutCaseInput[]
    deleteMany?: OnboardingTaskScalarWhereInput | OnboardingTaskScalarWhereInput[]
  }

  export type OnboardingDocumentUncheckedUpdateManyWithoutCaseNestedInput = {
    create?: XOR<OnboardingDocumentCreateWithoutCaseInput, OnboardingDocumentUncheckedCreateWithoutCaseInput> | OnboardingDocumentCreateWithoutCaseInput[] | OnboardingDocumentUncheckedCreateWithoutCaseInput[]
    connectOrCreate?: OnboardingDocumentCreateOrConnectWithoutCaseInput | OnboardingDocumentCreateOrConnectWithoutCaseInput[]
    upsert?: OnboardingDocumentUpsertWithWhereUniqueWithoutCaseInput | OnboardingDocumentUpsertWithWhereUniqueWithoutCaseInput[]
    createMany?: OnboardingDocumentCreateManyCaseInputEnvelope
    set?: OnboardingDocumentWhereUniqueInput | OnboardingDocumentWhereUniqueInput[]
    disconnect?: OnboardingDocumentWhereUniqueInput | OnboardingDocumentWhereUniqueInput[]
    delete?: OnboardingDocumentWhereUniqueInput | OnboardingDocumentWhereUniqueInput[]
    connect?: OnboardingDocumentWhereUniqueInput | OnboardingDocumentWhereUniqueInput[]
    update?: OnboardingDocumentUpdateWithWhereUniqueWithoutCaseInput | OnboardingDocumentUpdateWithWhereUniqueWithoutCaseInput[]
    updateMany?: OnboardingDocumentUpdateManyWithWhereWithoutCaseInput | OnboardingDocumentUpdateManyWithWhereWithoutCaseInput[]
    deleteMany?: OnboardingDocumentScalarWhereInput | OnboardingDocumentScalarWhereInput[]
  }

  export type VerificationUncheckedUpdateManyWithoutCaseNestedInput = {
    create?: XOR<VerificationCreateWithoutCaseInput, VerificationUncheckedCreateWithoutCaseInput> | VerificationCreateWithoutCaseInput[] | VerificationUncheckedCreateWithoutCaseInput[]
    connectOrCreate?: VerificationCreateOrConnectWithoutCaseInput | VerificationCreateOrConnectWithoutCaseInput[]
    upsert?: VerificationUpsertWithWhereUniqueWithoutCaseInput | VerificationUpsertWithWhereUniqueWithoutCaseInput[]
    createMany?: VerificationCreateManyCaseInputEnvelope
    set?: VerificationWhereUniqueInput | VerificationWhereUniqueInput[]
    disconnect?: VerificationWhereUniqueInput | VerificationWhereUniqueInput[]
    delete?: VerificationWhereUniqueInput | VerificationWhereUniqueInput[]
    connect?: VerificationWhereUniqueInput | VerificationWhereUniqueInput[]
    update?: VerificationUpdateWithWhereUniqueWithoutCaseInput | VerificationUpdateWithWhereUniqueWithoutCaseInput[]
    updateMany?: VerificationUpdateManyWithWhereWithoutCaseInput | VerificationUpdateManyWithWhereWithoutCaseInput[]
    deleteMany?: VerificationScalarWhereInput | VerificationScalarWhereInput[]
  }

  export type OnboardingCaseCreateNestedOneWithoutTasksInput = {
    create?: XOR<OnboardingCaseCreateWithoutTasksInput, OnboardingCaseUncheckedCreateWithoutTasksInput>
    connectOrCreate?: OnboardingCaseCreateOrConnectWithoutTasksInput
    connect?: OnboardingCaseWhereUniqueInput
  }

  export type EnumOnboardingTaskKindFieldUpdateOperationsInput = {
    set?: $Enums.OnboardingTaskKind
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type EnumOnboardingTaskStatusFieldUpdateOperationsInput = {
    set?: $Enums.OnboardingTaskStatus
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type OnboardingCaseUpdateOneRequiredWithoutTasksNestedInput = {
    create?: XOR<OnboardingCaseCreateWithoutTasksInput, OnboardingCaseUncheckedCreateWithoutTasksInput>
    connectOrCreate?: OnboardingCaseCreateOrConnectWithoutTasksInput
    upsert?: OnboardingCaseUpsertWithoutTasksInput
    connect?: OnboardingCaseWhereUniqueInput
    update?: XOR<XOR<OnboardingCaseUpdateToOneWithWhereWithoutTasksInput, OnboardingCaseUpdateWithoutTasksInput>, OnboardingCaseUncheckedUpdateWithoutTasksInput>
  }

  export type OnboardingCaseCreateNestedOneWithoutDocumentsInput = {
    create?: XOR<OnboardingCaseCreateWithoutDocumentsInput, OnboardingCaseUncheckedCreateWithoutDocumentsInput>
    connectOrCreate?: OnboardingCaseCreateOrConnectWithoutDocumentsInput
    connect?: OnboardingCaseWhereUniqueInput
  }

  export type OnboardingCaseUpdateOneRequiredWithoutDocumentsNestedInput = {
    create?: XOR<OnboardingCaseCreateWithoutDocumentsInput, OnboardingCaseUncheckedCreateWithoutDocumentsInput>
    connectOrCreate?: OnboardingCaseCreateOrConnectWithoutDocumentsInput
    upsert?: OnboardingCaseUpsertWithoutDocumentsInput
    connect?: OnboardingCaseWhereUniqueInput
    update?: XOR<XOR<OnboardingCaseUpdateToOneWithWhereWithoutDocumentsInput, OnboardingCaseUpdateWithoutDocumentsInput>, OnboardingCaseUncheckedUpdateWithoutDocumentsInput>
  }

  export type OnboardingCaseCreateNestedOneWithoutVerificationsInput = {
    create?: XOR<OnboardingCaseCreateWithoutVerificationsInput, OnboardingCaseUncheckedCreateWithoutVerificationsInput>
    connectOrCreate?: OnboardingCaseCreateOrConnectWithoutVerificationsInput
    connect?: OnboardingCaseWhereUniqueInput
  }

  export type EnumVerificationTypeFieldUpdateOperationsInput = {
    set?: $Enums.VerificationType
  }

  export type EnumVerificationStatusFieldUpdateOperationsInput = {
    set?: $Enums.VerificationStatus
  }

  export type OnboardingCaseUpdateOneRequiredWithoutVerificationsNestedInput = {
    create?: XOR<OnboardingCaseCreateWithoutVerificationsInput, OnboardingCaseUncheckedCreateWithoutVerificationsInput>
    connectOrCreate?: OnboardingCaseCreateOrConnectWithoutVerificationsInput
    upsert?: OnboardingCaseUpsertWithoutVerificationsInput
    connect?: OnboardingCaseWhereUniqueInput
    update?: XOR<XOR<OnboardingCaseUpdateToOneWithWhereWithoutVerificationsInput, OnboardingCaseUpdateWithoutVerificationsInput>, OnboardingCaseUncheckedUpdateWithoutVerificationsInput>
  }

  export type EnumOutboxStatusFieldUpdateOperationsInput = {
    set?: $Enums.OutboxStatus
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

  export type NestedEnumOnboardingCaseStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.OnboardingCaseStatus | EnumOnboardingCaseStatusFieldRefInput<$PrismaModel>
    in?: $Enums.OnboardingCaseStatus[] | ListEnumOnboardingCaseStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.OnboardingCaseStatus[] | ListEnumOnboardingCaseStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumOnboardingCaseStatusFilter<$PrismaModel> | $Enums.OnboardingCaseStatus
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

  export type NestedEnumOnboardingCaseStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.OnboardingCaseStatus | EnumOnboardingCaseStatusFieldRefInput<$PrismaModel>
    in?: $Enums.OnboardingCaseStatus[] | ListEnumOnboardingCaseStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.OnboardingCaseStatus[] | ListEnumOnboardingCaseStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumOnboardingCaseStatusWithAggregatesFilter<$PrismaModel> | $Enums.OnboardingCaseStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumOnboardingCaseStatusFilter<$PrismaModel>
    _max?: NestedEnumOnboardingCaseStatusFilter<$PrismaModel>
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

  export type NestedEnumOnboardingTaskKindFilter<$PrismaModel = never> = {
    equals?: $Enums.OnboardingTaskKind | EnumOnboardingTaskKindFieldRefInput<$PrismaModel>
    in?: $Enums.OnboardingTaskKind[] | ListEnumOnboardingTaskKindFieldRefInput<$PrismaModel>
    notIn?: $Enums.OnboardingTaskKind[] | ListEnumOnboardingTaskKindFieldRefInput<$PrismaModel>
    not?: NestedEnumOnboardingTaskKindFilter<$PrismaModel> | $Enums.OnboardingTaskKind
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedEnumOnboardingTaskStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.OnboardingTaskStatus | EnumOnboardingTaskStatusFieldRefInput<$PrismaModel>
    in?: $Enums.OnboardingTaskStatus[] | ListEnumOnboardingTaskStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.OnboardingTaskStatus[] | ListEnumOnboardingTaskStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumOnboardingTaskStatusFilter<$PrismaModel> | $Enums.OnboardingTaskStatus
  }

  export type NestedEnumOnboardingTaskKindWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.OnboardingTaskKind | EnumOnboardingTaskKindFieldRefInput<$PrismaModel>
    in?: $Enums.OnboardingTaskKind[] | ListEnumOnboardingTaskKindFieldRefInput<$PrismaModel>
    notIn?: $Enums.OnboardingTaskKind[] | ListEnumOnboardingTaskKindFieldRefInput<$PrismaModel>
    not?: NestedEnumOnboardingTaskKindWithAggregatesFilter<$PrismaModel> | $Enums.OnboardingTaskKind
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumOnboardingTaskKindFilter<$PrismaModel>
    _max?: NestedEnumOnboardingTaskKindFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedEnumOnboardingTaskStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.OnboardingTaskStatus | EnumOnboardingTaskStatusFieldRefInput<$PrismaModel>
    in?: $Enums.OnboardingTaskStatus[] | ListEnumOnboardingTaskStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.OnboardingTaskStatus[] | ListEnumOnboardingTaskStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumOnboardingTaskStatusWithAggregatesFilter<$PrismaModel> | $Enums.OnboardingTaskStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumOnboardingTaskStatusFilter<$PrismaModel>
    _max?: NestedEnumOnboardingTaskStatusFilter<$PrismaModel>
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

  export type NestedEnumVerificationTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.VerificationType | EnumVerificationTypeFieldRefInput<$PrismaModel>
    in?: $Enums.VerificationType[] | ListEnumVerificationTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.VerificationType[] | ListEnumVerificationTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumVerificationTypeFilter<$PrismaModel> | $Enums.VerificationType
  }

  export type NestedEnumVerificationStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.VerificationStatus | EnumVerificationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.VerificationStatus[] | ListEnumVerificationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.VerificationStatus[] | ListEnumVerificationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumVerificationStatusFilter<$PrismaModel> | $Enums.VerificationStatus
  }

  export type NestedEnumVerificationTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.VerificationType | EnumVerificationTypeFieldRefInput<$PrismaModel>
    in?: $Enums.VerificationType[] | ListEnumVerificationTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.VerificationType[] | ListEnumVerificationTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumVerificationTypeWithAggregatesFilter<$PrismaModel> | $Enums.VerificationType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumVerificationTypeFilter<$PrismaModel>
    _max?: NestedEnumVerificationTypeFilter<$PrismaModel>
  }

  export type NestedEnumVerificationStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.VerificationStatus | EnumVerificationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.VerificationStatus[] | ListEnumVerificationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.VerificationStatus[] | ListEnumVerificationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumVerificationStatusWithAggregatesFilter<$PrismaModel> | $Enums.VerificationStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumVerificationStatusFilter<$PrismaModel>
    _max?: NestedEnumVerificationStatusFilter<$PrismaModel>
  }

  export type NestedEnumOutboxStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.OutboxStatus | EnumOutboxStatusFieldRefInput<$PrismaModel>
    in?: $Enums.OutboxStatus[] | ListEnumOutboxStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.OutboxStatus[] | ListEnumOutboxStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumOutboxStatusFilter<$PrismaModel> | $Enums.OutboxStatus
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

  export type NestedEnumOutboxStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.OutboxStatus | EnumOutboxStatusFieldRefInput<$PrismaModel>
    in?: $Enums.OutboxStatus[] | ListEnumOutboxStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.OutboxStatus[] | ListEnumOutboxStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumOutboxStatusWithAggregatesFilter<$PrismaModel> | $Enums.OutboxStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumOutboxStatusFilter<$PrismaModel>
    _max?: NestedEnumOutboxStatusFilter<$PrismaModel>
  }

  export type OnboardingTaskCreateWithoutCaseInput = {
    id?: string
    tenantId: string
    kind: $Enums.OnboardingTaskKind
    title: string
    description?: string | null
    required?: boolean
    status?: $Enums.OnboardingTaskStatus
    order?: number
    completedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OnboardingTaskUncheckedCreateWithoutCaseInput = {
    id?: string
    tenantId: string
    kind: $Enums.OnboardingTaskKind
    title: string
    description?: string | null
    required?: boolean
    status?: $Enums.OnboardingTaskStatus
    order?: number
    completedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OnboardingTaskCreateOrConnectWithoutCaseInput = {
    where: OnboardingTaskWhereUniqueInput
    create: XOR<OnboardingTaskCreateWithoutCaseInput, OnboardingTaskUncheckedCreateWithoutCaseInput>
  }

  export type OnboardingTaskCreateManyCaseInputEnvelope = {
    data: OnboardingTaskCreateManyCaseInput | OnboardingTaskCreateManyCaseInput[]
    skipDuplicates?: boolean
  }

  export type OnboardingDocumentCreateWithoutCaseInput = {
    id?: string
    tenantId: string
    label: string
    storageKey?: string | null
    fileName?: string | null
    uploadedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type OnboardingDocumentUncheckedCreateWithoutCaseInput = {
    id?: string
    tenantId: string
    label: string
    storageKey?: string | null
    fileName?: string | null
    uploadedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type OnboardingDocumentCreateOrConnectWithoutCaseInput = {
    where: OnboardingDocumentWhereUniqueInput
    create: XOR<OnboardingDocumentCreateWithoutCaseInput, OnboardingDocumentUncheckedCreateWithoutCaseInput>
  }

  export type OnboardingDocumentCreateManyCaseInputEnvelope = {
    data: OnboardingDocumentCreateManyCaseInput | OnboardingDocumentCreateManyCaseInput[]
    skipDuplicates?: boolean
  }

  export type VerificationCreateWithoutCaseInput = {
    id?: string
    tenantId: string
    type: $Enums.VerificationType
    status?: $Enums.VerificationStatus
    providerRef?: string | null
    provider?: string | null
    maskedValue?: string | null
    encryptedPayload?: string | null
    message?: string | null
    verifiedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type VerificationUncheckedCreateWithoutCaseInput = {
    id?: string
    tenantId: string
    type: $Enums.VerificationType
    status?: $Enums.VerificationStatus
    providerRef?: string | null
    provider?: string | null
    maskedValue?: string | null
    encryptedPayload?: string | null
    message?: string | null
    verifiedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type VerificationCreateOrConnectWithoutCaseInput = {
    where: VerificationWhereUniqueInput
    create: XOR<VerificationCreateWithoutCaseInput, VerificationUncheckedCreateWithoutCaseInput>
  }

  export type VerificationCreateManyCaseInputEnvelope = {
    data: VerificationCreateManyCaseInput | VerificationCreateManyCaseInput[]
    skipDuplicates?: boolean
  }

  export type OnboardingTaskUpsertWithWhereUniqueWithoutCaseInput = {
    where: OnboardingTaskWhereUniqueInput
    update: XOR<OnboardingTaskUpdateWithoutCaseInput, OnboardingTaskUncheckedUpdateWithoutCaseInput>
    create: XOR<OnboardingTaskCreateWithoutCaseInput, OnboardingTaskUncheckedCreateWithoutCaseInput>
  }

  export type OnboardingTaskUpdateWithWhereUniqueWithoutCaseInput = {
    where: OnboardingTaskWhereUniqueInput
    data: XOR<OnboardingTaskUpdateWithoutCaseInput, OnboardingTaskUncheckedUpdateWithoutCaseInput>
  }

  export type OnboardingTaskUpdateManyWithWhereWithoutCaseInput = {
    where: OnboardingTaskScalarWhereInput
    data: XOR<OnboardingTaskUpdateManyMutationInput, OnboardingTaskUncheckedUpdateManyWithoutCaseInput>
  }

  export type OnboardingTaskScalarWhereInput = {
    AND?: OnboardingTaskScalarWhereInput | OnboardingTaskScalarWhereInput[]
    OR?: OnboardingTaskScalarWhereInput[]
    NOT?: OnboardingTaskScalarWhereInput | OnboardingTaskScalarWhereInput[]
    id?: StringFilter<"OnboardingTask"> | string
    tenantId?: StringFilter<"OnboardingTask"> | string
    caseId?: StringFilter<"OnboardingTask"> | string
    kind?: EnumOnboardingTaskKindFilter<"OnboardingTask"> | $Enums.OnboardingTaskKind
    title?: StringFilter<"OnboardingTask"> | string
    description?: StringNullableFilter<"OnboardingTask"> | string | null
    required?: BoolFilter<"OnboardingTask"> | boolean
    status?: EnumOnboardingTaskStatusFilter<"OnboardingTask"> | $Enums.OnboardingTaskStatus
    order?: IntFilter<"OnboardingTask"> | number
    completedAt?: DateTimeNullableFilter<"OnboardingTask"> | Date | string | null
    createdAt?: DateTimeFilter<"OnboardingTask"> | Date | string
    updatedAt?: DateTimeFilter<"OnboardingTask"> | Date | string
  }

  export type OnboardingDocumentUpsertWithWhereUniqueWithoutCaseInput = {
    where: OnboardingDocumentWhereUniqueInput
    update: XOR<OnboardingDocumentUpdateWithoutCaseInput, OnboardingDocumentUncheckedUpdateWithoutCaseInput>
    create: XOR<OnboardingDocumentCreateWithoutCaseInput, OnboardingDocumentUncheckedCreateWithoutCaseInput>
  }

  export type OnboardingDocumentUpdateWithWhereUniqueWithoutCaseInput = {
    where: OnboardingDocumentWhereUniqueInput
    data: XOR<OnboardingDocumentUpdateWithoutCaseInput, OnboardingDocumentUncheckedUpdateWithoutCaseInput>
  }

  export type OnboardingDocumentUpdateManyWithWhereWithoutCaseInput = {
    where: OnboardingDocumentScalarWhereInput
    data: XOR<OnboardingDocumentUpdateManyMutationInput, OnboardingDocumentUncheckedUpdateManyWithoutCaseInput>
  }

  export type OnboardingDocumentScalarWhereInput = {
    AND?: OnboardingDocumentScalarWhereInput | OnboardingDocumentScalarWhereInput[]
    OR?: OnboardingDocumentScalarWhereInput[]
    NOT?: OnboardingDocumentScalarWhereInput | OnboardingDocumentScalarWhereInput[]
    id?: StringFilter<"OnboardingDocument"> | string
    tenantId?: StringFilter<"OnboardingDocument"> | string
    caseId?: StringFilter<"OnboardingDocument"> | string
    label?: StringFilter<"OnboardingDocument"> | string
    storageKey?: StringNullableFilter<"OnboardingDocument"> | string | null
    fileName?: StringNullableFilter<"OnboardingDocument"> | string | null
    uploadedAt?: DateTimeNullableFilter<"OnboardingDocument"> | Date | string | null
    createdAt?: DateTimeFilter<"OnboardingDocument"> | Date | string
  }

  export type VerificationUpsertWithWhereUniqueWithoutCaseInput = {
    where: VerificationWhereUniqueInput
    update: XOR<VerificationUpdateWithoutCaseInput, VerificationUncheckedUpdateWithoutCaseInput>
    create: XOR<VerificationCreateWithoutCaseInput, VerificationUncheckedCreateWithoutCaseInput>
  }

  export type VerificationUpdateWithWhereUniqueWithoutCaseInput = {
    where: VerificationWhereUniqueInput
    data: XOR<VerificationUpdateWithoutCaseInput, VerificationUncheckedUpdateWithoutCaseInput>
  }

  export type VerificationUpdateManyWithWhereWithoutCaseInput = {
    where: VerificationScalarWhereInput
    data: XOR<VerificationUpdateManyMutationInput, VerificationUncheckedUpdateManyWithoutCaseInput>
  }

  export type VerificationScalarWhereInput = {
    AND?: VerificationScalarWhereInput | VerificationScalarWhereInput[]
    OR?: VerificationScalarWhereInput[]
    NOT?: VerificationScalarWhereInput | VerificationScalarWhereInput[]
    id?: StringFilter<"Verification"> | string
    tenantId?: StringFilter<"Verification"> | string
    caseId?: StringFilter<"Verification"> | string
    type?: EnumVerificationTypeFilter<"Verification"> | $Enums.VerificationType
    status?: EnumVerificationStatusFilter<"Verification"> | $Enums.VerificationStatus
    providerRef?: StringNullableFilter<"Verification"> | string | null
    provider?: StringNullableFilter<"Verification"> | string | null
    maskedValue?: StringNullableFilter<"Verification"> | string | null
    encryptedPayload?: StringNullableFilter<"Verification"> | string | null
    message?: StringNullableFilter<"Verification"> | string | null
    verifiedAt?: DateTimeNullableFilter<"Verification"> | Date | string | null
    createdAt?: DateTimeFilter<"Verification"> | Date | string
    updatedAt?: DateTimeFilter<"Verification"> | Date | string
  }

  export type OnboardingCaseCreateWithoutTasksInput = {
    id?: string
    tenantId: string
    candidateId: string
    applicationId?: string | null
    offerId?: string | null
    candidateName?: string | null
    candidateEmail?: string | null
    jobTitle?: string | null
    status?: $Enums.OnboardingCaseStatus
    portalToken: string
    startDate?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    documents?: OnboardingDocumentCreateNestedManyWithoutCaseInput
    verifications?: VerificationCreateNestedManyWithoutCaseInput
  }

  export type OnboardingCaseUncheckedCreateWithoutTasksInput = {
    id?: string
    tenantId: string
    candidateId: string
    applicationId?: string | null
    offerId?: string | null
    candidateName?: string | null
    candidateEmail?: string | null
    jobTitle?: string | null
    status?: $Enums.OnboardingCaseStatus
    portalToken: string
    startDate?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    documents?: OnboardingDocumentUncheckedCreateNestedManyWithoutCaseInput
    verifications?: VerificationUncheckedCreateNestedManyWithoutCaseInput
  }

  export type OnboardingCaseCreateOrConnectWithoutTasksInput = {
    where: OnboardingCaseWhereUniqueInput
    create: XOR<OnboardingCaseCreateWithoutTasksInput, OnboardingCaseUncheckedCreateWithoutTasksInput>
  }

  export type OnboardingCaseUpsertWithoutTasksInput = {
    update: XOR<OnboardingCaseUpdateWithoutTasksInput, OnboardingCaseUncheckedUpdateWithoutTasksInput>
    create: XOR<OnboardingCaseCreateWithoutTasksInput, OnboardingCaseUncheckedCreateWithoutTasksInput>
    where?: OnboardingCaseWhereInput
  }

  export type OnboardingCaseUpdateToOneWithWhereWithoutTasksInput = {
    where?: OnboardingCaseWhereInput
    data: XOR<OnboardingCaseUpdateWithoutTasksInput, OnboardingCaseUncheckedUpdateWithoutTasksInput>
  }

  export type OnboardingCaseUpdateWithoutTasksInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    applicationId?: NullableStringFieldUpdateOperationsInput | string | null
    offerId?: NullableStringFieldUpdateOperationsInput | string | null
    candidateName?: NullableStringFieldUpdateOperationsInput | string | null
    candidateEmail?: NullableStringFieldUpdateOperationsInput | string | null
    jobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumOnboardingCaseStatusFieldUpdateOperationsInput | $Enums.OnboardingCaseStatus
    portalToken?: StringFieldUpdateOperationsInput | string
    startDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    documents?: OnboardingDocumentUpdateManyWithoutCaseNestedInput
    verifications?: VerificationUpdateManyWithoutCaseNestedInput
  }

  export type OnboardingCaseUncheckedUpdateWithoutTasksInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    applicationId?: NullableStringFieldUpdateOperationsInput | string | null
    offerId?: NullableStringFieldUpdateOperationsInput | string | null
    candidateName?: NullableStringFieldUpdateOperationsInput | string | null
    candidateEmail?: NullableStringFieldUpdateOperationsInput | string | null
    jobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumOnboardingCaseStatusFieldUpdateOperationsInput | $Enums.OnboardingCaseStatus
    portalToken?: StringFieldUpdateOperationsInput | string
    startDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    documents?: OnboardingDocumentUncheckedUpdateManyWithoutCaseNestedInput
    verifications?: VerificationUncheckedUpdateManyWithoutCaseNestedInput
  }

  export type OnboardingCaseCreateWithoutDocumentsInput = {
    id?: string
    tenantId: string
    candidateId: string
    applicationId?: string | null
    offerId?: string | null
    candidateName?: string | null
    candidateEmail?: string | null
    jobTitle?: string | null
    status?: $Enums.OnboardingCaseStatus
    portalToken: string
    startDate?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tasks?: OnboardingTaskCreateNestedManyWithoutCaseInput
    verifications?: VerificationCreateNestedManyWithoutCaseInput
  }

  export type OnboardingCaseUncheckedCreateWithoutDocumentsInput = {
    id?: string
    tenantId: string
    candidateId: string
    applicationId?: string | null
    offerId?: string | null
    candidateName?: string | null
    candidateEmail?: string | null
    jobTitle?: string | null
    status?: $Enums.OnboardingCaseStatus
    portalToken: string
    startDate?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tasks?: OnboardingTaskUncheckedCreateNestedManyWithoutCaseInput
    verifications?: VerificationUncheckedCreateNestedManyWithoutCaseInput
  }

  export type OnboardingCaseCreateOrConnectWithoutDocumentsInput = {
    where: OnboardingCaseWhereUniqueInput
    create: XOR<OnboardingCaseCreateWithoutDocumentsInput, OnboardingCaseUncheckedCreateWithoutDocumentsInput>
  }

  export type OnboardingCaseUpsertWithoutDocumentsInput = {
    update: XOR<OnboardingCaseUpdateWithoutDocumentsInput, OnboardingCaseUncheckedUpdateWithoutDocumentsInput>
    create: XOR<OnboardingCaseCreateWithoutDocumentsInput, OnboardingCaseUncheckedCreateWithoutDocumentsInput>
    where?: OnboardingCaseWhereInput
  }

  export type OnboardingCaseUpdateToOneWithWhereWithoutDocumentsInput = {
    where?: OnboardingCaseWhereInput
    data: XOR<OnboardingCaseUpdateWithoutDocumentsInput, OnboardingCaseUncheckedUpdateWithoutDocumentsInput>
  }

  export type OnboardingCaseUpdateWithoutDocumentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    applicationId?: NullableStringFieldUpdateOperationsInput | string | null
    offerId?: NullableStringFieldUpdateOperationsInput | string | null
    candidateName?: NullableStringFieldUpdateOperationsInput | string | null
    candidateEmail?: NullableStringFieldUpdateOperationsInput | string | null
    jobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumOnboardingCaseStatusFieldUpdateOperationsInput | $Enums.OnboardingCaseStatus
    portalToken?: StringFieldUpdateOperationsInput | string
    startDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tasks?: OnboardingTaskUpdateManyWithoutCaseNestedInput
    verifications?: VerificationUpdateManyWithoutCaseNestedInput
  }

  export type OnboardingCaseUncheckedUpdateWithoutDocumentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    applicationId?: NullableStringFieldUpdateOperationsInput | string | null
    offerId?: NullableStringFieldUpdateOperationsInput | string | null
    candidateName?: NullableStringFieldUpdateOperationsInput | string | null
    candidateEmail?: NullableStringFieldUpdateOperationsInput | string | null
    jobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumOnboardingCaseStatusFieldUpdateOperationsInput | $Enums.OnboardingCaseStatus
    portalToken?: StringFieldUpdateOperationsInput | string
    startDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tasks?: OnboardingTaskUncheckedUpdateManyWithoutCaseNestedInput
    verifications?: VerificationUncheckedUpdateManyWithoutCaseNestedInput
  }

  export type OnboardingCaseCreateWithoutVerificationsInput = {
    id?: string
    tenantId: string
    candidateId: string
    applicationId?: string | null
    offerId?: string | null
    candidateName?: string | null
    candidateEmail?: string | null
    jobTitle?: string | null
    status?: $Enums.OnboardingCaseStatus
    portalToken: string
    startDate?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tasks?: OnboardingTaskCreateNestedManyWithoutCaseInput
    documents?: OnboardingDocumentCreateNestedManyWithoutCaseInput
  }

  export type OnboardingCaseUncheckedCreateWithoutVerificationsInput = {
    id?: string
    tenantId: string
    candidateId: string
    applicationId?: string | null
    offerId?: string | null
    candidateName?: string | null
    candidateEmail?: string | null
    jobTitle?: string | null
    status?: $Enums.OnboardingCaseStatus
    portalToken: string
    startDate?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tasks?: OnboardingTaskUncheckedCreateNestedManyWithoutCaseInput
    documents?: OnboardingDocumentUncheckedCreateNestedManyWithoutCaseInput
  }

  export type OnboardingCaseCreateOrConnectWithoutVerificationsInput = {
    where: OnboardingCaseWhereUniqueInput
    create: XOR<OnboardingCaseCreateWithoutVerificationsInput, OnboardingCaseUncheckedCreateWithoutVerificationsInput>
  }

  export type OnboardingCaseUpsertWithoutVerificationsInput = {
    update: XOR<OnboardingCaseUpdateWithoutVerificationsInput, OnboardingCaseUncheckedUpdateWithoutVerificationsInput>
    create: XOR<OnboardingCaseCreateWithoutVerificationsInput, OnboardingCaseUncheckedCreateWithoutVerificationsInput>
    where?: OnboardingCaseWhereInput
  }

  export type OnboardingCaseUpdateToOneWithWhereWithoutVerificationsInput = {
    where?: OnboardingCaseWhereInput
    data: XOR<OnboardingCaseUpdateWithoutVerificationsInput, OnboardingCaseUncheckedUpdateWithoutVerificationsInput>
  }

  export type OnboardingCaseUpdateWithoutVerificationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    applicationId?: NullableStringFieldUpdateOperationsInput | string | null
    offerId?: NullableStringFieldUpdateOperationsInput | string | null
    candidateName?: NullableStringFieldUpdateOperationsInput | string | null
    candidateEmail?: NullableStringFieldUpdateOperationsInput | string | null
    jobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumOnboardingCaseStatusFieldUpdateOperationsInput | $Enums.OnboardingCaseStatus
    portalToken?: StringFieldUpdateOperationsInput | string
    startDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tasks?: OnboardingTaskUpdateManyWithoutCaseNestedInput
    documents?: OnboardingDocumentUpdateManyWithoutCaseNestedInput
  }

  export type OnboardingCaseUncheckedUpdateWithoutVerificationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    applicationId?: NullableStringFieldUpdateOperationsInput | string | null
    offerId?: NullableStringFieldUpdateOperationsInput | string | null
    candidateName?: NullableStringFieldUpdateOperationsInput | string | null
    candidateEmail?: NullableStringFieldUpdateOperationsInput | string | null
    jobTitle?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumOnboardingCaseStatusFieldUpdateOperationsInput | $Enums.OnboardingCaseStatus
    portalToken?: StringFieldUpdateOperationsInput | string
    startDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tasks?: OnboardingTaskUncheckedUpdateManyWithoutCaseNestedInput
    documents?: OnboardingDocumentUncheckedUpdateManyWithoutCaseNestedInput
  }

  export type OnboardingTaskCreateManyCaseInput = {
    id?: string
    tenantId: string
    kind: $Enums.OnboardingTaskKind
    title: string
    description?: string | null
    required?: boolean
    status?: $Enums.OnboardingTaskStatus
    order?: number
    completedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OnboardingDocumentCreateManyCaseInput = {
    id?: string
    tenantId: string
    label: string
    storageKey?: string | null
    fileName?: string | null
    uploadedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type VerificationCreateManyCaseInput = {
    id?: string
    tenantId: string
    type: $Enums.VerificationType
    status?: $Enums.VerificationStatus
    providerRef?: string | null
    provider?: string | null
    maskedValue?: string | null
    encryptedPayload?: string | null
    message?: string | null
    verifiedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OnboardingTaskUpdateWithoutCaseInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    kind?: EnumOnboardingTaskKindFieldUpdateOperationsInput | $Enums.OnboardingTaskKind
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    required?: BoolFieldUpdateOperationsInput | boolean
    status?: EnumOnboardingTaskStatusFieldUpdateOperationsInput | $Enums.OnboardingTaskStatus
    order?: IntFieldUpdateOperationsInput | number
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OnboardingTaskUncheckedUpdateWithoutCaseInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    kind?: EnumOnboardingTaskKindFieldUpdateOperationsInput | $Enums.OnboardingTaskKind
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    required?: BoolFieldUpdateOperationsInput | boolean
    status?: EnumOnboardingTaskStatusFieldUpdateOperationsInput | $Enums.OnboardingTaskStatus
    order?: IntFieldUpdateOperationsInput | number
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OnboardingTaskUncheckedUpdateManyWithoutCaseInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    kind?: EnumOnboardingTaskKindFieldUpdateOperationsInput | $Enums.OnboardingTaskKind
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    required?: BoolFieldUpdateOperationsInput | boolean
    status?: EnumOnboardingTaskStatusFieldUpdateOperationsInput | $Enums.OnboardingTaskStatus
    order?: IntFieldUpdateOperationsInput | number
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OnboardingDocumentUpdateWithoutCaseInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    storageKey?: NullableStringFieldUpdateOperationsInput | string | null
    fileName?: NullableStringFieldUpdateOperationsInput | string | null
    uploadedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OnboardingDocumentUncheckedUpdateWithoutCaseInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    storageKey?: NullableStringFieldUpdateOperationsInput | string | null
    fileName?: NullableStringFieldUpdateOperationsInput | string | null
    uploadedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OnboardingDocumentUncheckedUpdateManyWithoutCaseInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    storageKey?: NullableStringFieldUpdateOperationsInput | string | null
    fileName?: NullableStringFieldUpdateOperationsInput | string | null
    uploadedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VerificationUpdateWithoutCaseInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    type?: EnumVerificationTypeFieldUpdateOperationsInput | $Enums.VerificationType
    status?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    providerRef?: NullableStringFieldUpdateOperationsInput | string | null
    provider?: NullableStringFieldUpdateOperationsInput | string | null
    maskedValue?: NullableStringFieldUpdateOperationsInput | string | null
    encryptedPayload?: NullableStringFieldUpdateOperationsInput | string | null
    message?: NullableStringFieldUpdateOperationsInput | string | null
    verifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VerificationUncheckedUpdateWithoutCaseInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    type?: EnumVerificationTypeFieldUpdateOperationsInput | $Enums.VerificationType
    status?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    providerRef?: NullableStringFieldUpdateOperationsInput | string | null
    provider?: NullableStringFieldUpdateOperationsInput | string | null
    maskedValue?: NullableStringFieldUpdateOperationsInput | string | null
    encryptedPayload?: NullableStringFieldUpdateOperationsInput | string | null
    message?: NullableStringFieldUpdateOperationsInput | string | null
    verifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VerificationUncheckedUpdateManyWithoutCaseInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    type?: EnumVerificationTypeFieldUpdateOperationsInput | $Enums.VerificationType
    status?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    providerRef?: NullableStringFieldUpdateOperationsInput | string | null
    provider?: NullableStringFieldUpdateOperationsInput | string | null
    maskedValue?: NullableStringFieldUpdateOperationsInput | string | null
    encryptedPayload?: NullableStringFieldUpdateOperationsInput | string | null
    message?: NullableStringFieldUpdateOperationsInput | string | null
    verifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
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