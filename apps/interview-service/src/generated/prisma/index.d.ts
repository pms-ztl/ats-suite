
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
 * Model Interview
 * 
 */
export type Interview = $Result.DefaultSelection<Prisma.$InterviewPayload>
/**
 * Model InterviewRound
 * 
 */
export type InterviewRound = $Result.DefaultSelection<Prisma.$InterviewRoundPayload>
/**
 * Model InterviewFeedback
 * 
 */
export type InterviewFeedback = $Result.DefaultSelection<Prisma.$InterviewFeedbackPayload>
/**
 * Model InterviewPanelMember
 * 
 */
export type InterviewPanelMember = $Result.DefaultSelection<Prisma.$InterviewPanelMemberPayload>
/**
 * Model InterviewArtifact
 * 
 */
export type InterviewArtifact = $Result.DefaultSelection<Prisma.$InterviewArtifactPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const InterviewType: {
  PHONE_SCREEN: 'PHONE_SCREEN',
  TECHNICAL: 'TECHNICAL',
  BEHAVIORAL: 'BEHAVIORAL',
  PANEL: 'PANEL',
  FINAL: 'FINAL'
};

export type InterviewType = (typeof InterviewType)[keyof typeof InterviewType]


export const InterviewStatus: {
  SCHEDULED: 'SCHEDULED',
  CONFIRMED: 'CONFIRMED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW',
  RESCHEDULED: 'RESCHEDULED'
};

export type InterviewStatus = (typeof InterviewStatus)[keyof typeof InterviewStatus]


export const InterviewRecommendation: {
  STRONG_HIRE: 'STRONG_HIRE',
  HIRE: 'HIRE',
  LEAN_HIRE: 'LEAN_HIRE',
  NO_HIRE: 'NO_HIRE',
  STRONG_NO_HIRE: 'STRONG_NO_HIRE'
};

export type InterviewRecommendation = (typeof InterviewRecommendation)[keyof typeof InterviewRecommendation]

}

export type InterviewType = $Enums.InterviewType

export const InterviewType: typeof $Enums.InterviewType

export type InterviewStatus = $Enums.InterviewStatus

export const InterviewStatus: typeof $Enums.InterviewStatus

export type InterviewRecommendation = $Enums.InterviewRecommendation

export const InterviewRecommendation: typeof $Enums.InterviewRecommendation

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Interviews
 * const interviews = await prisma.interview.findMany()
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
   * // Fetch zero or more Interviews
   * const interviews = await prisma.interview.findMany()
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
   * `prisma.interview`: Exposes CRUD operations for the **Interview** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Interviews
    * const interviews = await prisma.interview.findMany()
    * ```
    */
  get interview(): Prisma.InterviewDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.interviewRound`: Exposes CRUD operations for the **InterviewRound** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more InterviewRounds
    * const interviewRounds = await prisma.interviewRound.findMany()
    * ```
    */
  get interviewRound(): Prisma.InterviewRoundDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.interviewFeedback`: Exposes CRUD operations for the **InterviewFeedback** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more InterviewFeedbacks
    * const interviewFeedbacks = await prisma.interviewFeedback.findMany()
    * ```
    */
  get interviewFeedback(): Prisma.InterviewFeedbackDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.interviewPanelMember`: Exposes CRUD operations for the **InterviewPanelMember** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more InterviewPanelMembers
    * const interviewPanelMembers = await prisma.interviewPanelMember.findMany()
    * ```
    */
  get interviewPanelMember(): Prisma.InterviewPanelMemberDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.interviewArtifact`: Exposes CRUD operations for the **InterviewArtifact** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more InterviewArtifacts
    * const interviewArtifacts = await prisma.interviewArtifact.findMany()
    * ```
    */
  get interviewArtifact(): Prisma.InterviewArtifactDelegate<ExtArgs, ClientOptions>;
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
    Interview: 'Interview',
    InterviewRound: 'InterviewRound',
    InterviewFeedback: 'InterviewFeedback',
    InterviewPanelMember: 'InterviewPanelMember',
    InterviewArtifact: 'InterviewArtifact'
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
      modelProps: "interview" | "interviewRound" | "interviewFeedback" | "interviewPanelMember" | "interviewArtifact"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Interview: {
        payload: Prisma.$InterviewPayload<ExtArgs>
        fields: Prisma.InterviewFieldRefs
        operations: {
          findUnique: {
            args: Prisma.InterviewFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.InterviewFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewPayload>
          }
          findFirst: {
            args: Prisma.InterviewFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.InterviewFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewPayload>
          }
          findMany: {
            args: Prisma.InterviewFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewPayload>[]
          }
          create: {
            args: Prisma.InterviewCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewPayload>
          }
          createMany: {
            args: Prisma.InterviewCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.InterviewCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewPayload>[]
          }
          delete: {
            args: Prisma.InterviewDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewPayload>
          }
          update: {
            args: Prisma.InterviewUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewPayload>
          }
          deleteMany: {
            args: Prisma.InterviewDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.InterviewUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.InterviewUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewPayload>[]
          }
          upsert: {
            args: Prisma.InterviewUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewPayload>
          }
          aggregate: {
            args: Prisma.InterviewAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateInterview>
          }
          groupBy: {
            args: Prisma.InterviewGroupByArgs<ExtArgs>
            result: $Utils.Optional<InterviewGroupByOutputType>[]
          }
          count: {
            args: Prisma.InterviewCountArgs<ExtArgs>
            result: $Utils.Optional<InterviewCountAggregateOutputType> | number
          }
        }
      }
      InterviewRound: {
        payload: Prisma.$InterviewRoundPayload<ExtArgs>
        fields: Prisma.InterviewRoundFieldRefs
        operations: {
          findUnique: {
            args: Prisma.InterviewRoundFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewRoundPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.InterviewRoundFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewRoundPayload>
          }
          findFirst: {
            args: Prisma.InterviewRoundFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewRoundPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.InterviewRoundFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewRoundPayload>
          }
          findMany: {
            args: Prisma.InterviewRoundFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewRoundPayload>[]
          }
          create: {
            args: Prisma.InterviewRoundCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewRoundPayload>
          }
          createMany: {
            args: Prisma.InterviewRoundCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.InterviewRoundCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewRoundPayload>[]
          }
          delete: {
            args: Prisma.InterviewRoundDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewRoundPayload>
          }
          update: {
            args: Prisma.InterviewRoundUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewRoundPayload>
          }
          deleteMany: {
            args: Prisma.InterviewRoundDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.InterviewRoundUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.InterviewRoundUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewRoundPayload>[]
          }
          upsert: {
            args: Prisma.InterviewRoundUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewRoundPayload>
          }
          aggregate: {
            args: Prisma.InterviewRoundAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateInterviewRound>
          }
          groupBy: {
            args: Prisma.InterviewRoundGroupByArgs<ExtArgs>
            result: $Utils.Optional<InterviewRoundGroupByOutputType>[]
          }
          count: {
            args: Prisma.InterviewRoundCountArgs<ExtArgs>
            result: $Utils.Optional<InterviewRoundCountAggregateOutputType> | number
          }
        }
      }
      InterviewFeedback: {
        payload: Prisma.$InterviewFeedbackPayload<ExtArgs>
        fields: Prisma.InterviewFeedbackFieldRefs
        operations: {
          findUnique: {
            args: Prisma.InterviewFeedbackFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewFeedbackPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.InterviewFeedbackFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewFeedbackPayload>
          }
          findFirst: {
            args: Prisma.InterviewFeedbackFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewFeedbackPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.InterviewFeedbackFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewFeedbackPayload>
          }
          findMany: {
            args: Prisma.InterviewFeedbackFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewFeedbackPayload>[]
          }
          create: {
            args: Prisma.InterviewFeedbackCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewFeedbackPayload>
          }
          createMany: {
            args: Prisma.InterviewFeedbackCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.InterviewFeedbackCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewFeedbackPayload>[]
          }
          delete: {
            args: Prisma.InterviewFeedbackDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewFeedbackPayload>
          }
          update: {
            args: Prisma.InterviewFeedbackUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewFeedbackPayload>
          }
          deleteMany: {
            args: Prisma.InterviewFeedbackDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.InterviewFeedbackUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.InterviewFeedbackUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewFeedbackPayload>[]
          }
          upsert: {
            args: Prisma.InterviewFeedbackUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewFeedbackPayload>
          }
          aggregate: {
            args: Prisma.InterviewFeedbackAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateInterviewFeedback>
          }
          groupBy: {
            args: Prisma.InterviewFeedbackGroupByArgs<ExtArgs>
            result: $Utils.Optional<InterviewFeedbackGroupByOutputType>[]
          }
          count: {
            args: Prisma.InterviewFeedbackCountArgs<ExtArgs>
            result: $Utils.Optional<InterviewFeedbackCountAggregateOutputType> | number
          }
        }
      }
      InterviewPanelMember: {
        payload: Prisma.$InterviewPanelMemberPayload<ExtArgs>
        fields: Prisma.InterviewPanelMemberFieldRefs
        operations: {
          findUnique: {
            args: Prisma.InterviewPanelMemberFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewPanelMemberPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.InterviewPanelMemberFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewPanelMemberPayload>
          }
          findFirst: {
            args: Prisma.InterviewPanelMemberFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewPanelMemberPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.InterviewPanelMemberFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewPanelMemberPayload>
          }
          findMany: {
            args: Prisma.InterviewPanelMemberFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewPanelMemberPayload>[]
          }
          create: {
            args: Prisma.InterviewPanelMemberCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewPanelMemberPayload>
          }
          createMany: {
            args: Prisma.InterviewPanelMemberCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.InterviewPanelMemberCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewPanelMemberPayload>[]
          }
          delete: {
            args: Prisma.InterviewPanelMemberDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewPanelMemberPayload>
          }
          update: {
            args: Prisma.InterviewPanelMemberUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewPanelMemberPayload>
          }
          deleteMany: {
            args: Prisma.InterviewPanelMemberDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.InterviewPanelMemberUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.InterviewPanelMemberUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewPanelMemberPayload>[]
          }
          upsert: {
            args: Prisma.InterviewPanelMemberUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewPanelMemberPayload>
          }
          aggregate: {
            args: Prisma.InterviewPanelMemberAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateInterviewPanelMember>
          }
          groupBy: {
            args: Prisma.InterviewPanelMemberGroupByArgs<ExtArgs>
            result: $Utils.Optional<InterviewPanelMemberGroupByOutputType>[]
          }
          count: {
            args: Prisma.InterviewPanelMemberCountArgs<ExtArgs>
            result: $Utils.Optional<InterviewPanelMemberCountAggregateOutputType> | number
          }
        }
      }
      InterviewArtifact: {
        payload: Prisma.$InterviewArtifactPayload<ExtArgs>
        fields: Prisma.InterviewArtifactFieldRefs
        operations: {
          findUnique: {
            args: Prisma.InterviewArtifactFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewArtifactPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.InterviewArtifactFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewArtifactPayload>
          }
          findFirst: {
            args: Prisma.InterviewArtifactFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewArtifactPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.InterviewArtifactFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewArtifactPayload>
          }
          findMany: {
            args: Prisma.InterviewArtifactFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewArtifactPayload>[]
          }
          create: {
            args: Prisma.InterviewArtifactCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewArtifactPayload>
          }
          createMany: {
            args: Prisma.InterviewArtifactCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.InterviewArtifactCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewArtifactPayload>[]
          }
          delete: {
            args: Prisma.InterviewArtifactDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewArtifactPayload>
          }
          update: {
            args: Prisma.InterviewArtifactUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewArtifactPayload>
          }
          deleteMany: {
            args: Prisma.InterviewArtifactDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.InterviewArtifactUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.InterviewArtifactUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewArtifactPayload>[]
          }
          upsert: {
            args: Prisma.InterviewArtifactUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InterviewArtifactPayload>
          }
          aggregate: {
            args: Prisma.InterviewArtifactAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateInterviewArtifact>
          }
          groupBy: {
            args: Prisma.InterviewArtifactGroupByArgs<ExtArgs>
            result: $Utils.Optional<InterviewArtifactGroupByOutputType>[]
          }
          count: {
            args: Prisma.InterviewArtifactCountArgs<ExtArgs>
            result: $Utils.Optional<InterviewArtifactCountAggregateOutputType> | number
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
    interview?: InterviewOmit
    interviewRound?: InterviewRoundOmit
    interviewFeedback?: InterviewFeedbackOmit
    interviewPanelMember?: InterviewPanelMemberOmit
    interviewArtifact?: InterviewArtifactOmit
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
   * Count Type InterviewCountOutputType
   */

  export type InterviewCountOutputType = {
    panelMembers: number
    feedback: number
  }

  export type InterviewCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    panelMembers?: boolean | InterviewCountOutputTypeCountPanelMembersArgs
    feedback?: boolean | InterviewCountOutputTypeCountFeedbackArgs
  }

  // Custom InputTypes
  /**
   * InterviewCountOutputType without action
   */
  export type InterviewCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewCountOutputType
     */
    select?: InterviewCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * InterviewCountOutputType without action
   */
  export type InterviewCountOutputTypeCountPanelMembersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InterviewPanelMemberWhereInput
  }

  /**
   * InterviewCountOutputType without action
   */
  export type InterviewCountOutputTypeCountFeedbackArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InterviewFeedbackWhereInput
  }


  /**
   * Count Type InterviewRoundCountOutputType
   */

  export type InterviewRoundCountOutputType = {
    interviews: number
  }

  export type InterviewRoundCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    interviews?: boolean | InterviewRoundCountOutputTypeCountInterviewsArgs
  }

  // Custom InputTypes
  /**
   * InterviewRoundCountOutputType without action
   */
  export type InterviewRoundCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewRoundCountOutputType
     */
    select?: InterviewRoundCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * InterviewRoundCountOutputType without action
   */
  export type InterviewRoundCountOutputTypeCountInterviewsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InterviewWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Interview
   */

  export type AggregateInterview = {
    _count: InterviewCountAggregateOutputType | null
    _avg: InterviewAvgAggregateOutputType | null
    _sum: InterviewSumAggregateOutputType | null
    _min: InterviewMinAggregateOutputType | null
    _max: InterviewMaxAggregateOutputType | null
  }

  export type InterviewAvgAggregateOutputType = {
    duration: number | null
    roundNumber: number | null
  }

  export type InterviewSumAggregateOutputType = {
    duration: number | null
    roundNumber: number | null
  }

  export type InterviewMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    requisitionId: string | null
    candidateId: string | null
    applicationId: string | null
    type: $Enums.InterviewType | null
    stage: string | null
    status: $Enums.InterviewStatus | null
    scheduledAt: Date | null
    duration: number | null
    location: string | null
    meetingUrl: string | null
    roundId: string | null
    roundNumber: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type InterviewMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    requisitionId: string | null
    candidateId: string | null
    applicationId: string | null
    type: $Enums.InterviewType | null
    stage: string | null
    status: $Enums.InterviewStatus | null
    scheduledAt: Date | null
    duration: number | null
    location: string | null
    meetingUrl: string | null
    roundId: string | null
    roundNumber: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type InterviewCountAggregateOutputType = {
    id: number
    tenantId: number
    requisitionId: number
    candidateId: number
    applicationId: number
    type: number
    stage: number
    status: number
    scheduledAt: number
    duration: number
    location: number
    meetingUrl: number
    roundId: number
    roundNumber: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type InterviewAvgAggregateInputType = {
    duration?: true
    roundNumber?: true
  }

  export type InterviewSumAggregateInputType = {
    duration?: true
    roundNumber?: true
  }

  export type InterviewMinAggregateInputType = {
    id?: true
    tenantId?: true
    requisitionId?: true
    candidateId?: true
    applicationId?: true
    type?: true
    stage?: true
    status?: true
    scheduledAt?: true
    duration?: true
    location?: true
    meetingUrl?: true
    roundId?: true
    roundNumber?: true
    createdAt?: true
    updatedAt?: true
  }

  export type InterviewMaxAggregateInputType = {
    id?: true
    tenantId?: true
    requisitionId?: true
    candidateId?: true
    applicationId?: true
    type?: true
    stage?: true
    status?: true
    scheduledAt?: true
    duration?: true
    location?: true
    meetingUrl?: true
    roundId?: true
    roundNumber?: true
    createdAt?: true
    updatedAt?: true
  }

  export type InterviewCountAggregateInputType = {
    id?: true
    tenantId?: true
    requisitionId?: true
    candidateId?: true
    applicationId?: true
    type?: true
    stage?: true
    status?: true
    scheduledAt?: true
    duration?: true
    location?: true
    meetingUrl?: true
    roundId?: true
    roundNumber?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type InterviewAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Interview to aggregate.
     */
    where?: InterviewWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Interviews to fetch.
     */
    orderBy?: InterviewOrderByWithRelationInput | InterviewOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: InterviewWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Interviews from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Interviews.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Interviews
    **/
    _count?: true | InterviewCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: InterviewAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: InterviewSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: InterviewMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: InterviewMaxAggregateInputType
  }

  export type GetInterviewAggregateType<T extends InterviewAggregateArgs> = {
        [P in keyof T & keyof AggregateInterview]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateInterview[P]>
      : GetScalarType<T[P], AggregateInterview[P]>
  }




  export type InterviewGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InterviewWhereInput
    orderBy?: InterviewOrderByWithAggregationInput | InterviewOrderByWithAggregationInput[]
    by: InterviewScalarFieldEnum[] | InterviewScalarFieldEnum
    having?: InterviewScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: InterviewCountAggregateInputType | true
    _avg?: InterviewAvgAggregateInputType
    _sum?: InterviewSumAggregateInputType
    _min?: InterviewMinAggregateInputType
    _max?: InterviewMaxAggregateInputType
  }

  export type InterviewGroupByOutputType = {
    id: string
    tenantId: string
    requisitionId: string
    candidateId: string
    applicationId: string | null
    type: $Enums.InterviewType | null
    stage: string
    status: $Enums.InterviewStatus
    scheduledAt: Date | null
    duration: number
    location: string | null
    meetingUrl: string | null
    roundId: string | null
    roundNumber: number | null
    createdAt: Date
    updatedAt: Date
    _count: InterviewCountAggregateOutputType | null
    _avg: InterviewAvgAggregateOutputType | null
    _sum: InterviewSumAggregateOutputType | null
    _min: InterviewMinAggregateOutputType | null
    _max: InterviewMaxAggregateOutputType | null
  }

  type GetInterviewGroupByPayload<T extends InterviewGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<InterviewGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof InterviewGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], InterviewGroupByOutputType[P]>
            : GetScalarType<T[P], InterviewGroupByOutputType[P]>
        }
      >
    >


  export type InterviewSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    requisitionId?: boolean
    candidateId?: boolean
    applicationId?: boolean
    type?: boolean
    stage?: boolean
    status?: boolean
    scheduledAt?: boolean
    duration?: boolean
    location?: boolean
    meetingUrl?: boolean
    roundId?: boolean
    roundNumber?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    round?: boolean | Interview$roundArgs<ExtArgs>
    panelMembers?: boolean | Interview$panelMembersArgs<ExtArgs>
    feedback?: boolean | Interview$feedbackArgs<ExtArgs>
    _count?: boolean | InterviewCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["interview"]>

  export type InterviewSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    requisitionId?: boolean
    candidateId?: boolean
    applicationId?: boolean
    type?: boolean
    stage?: boolean
    status?: boolean
    scheduledAt?: boolean
    duration?: boolean
    location?: boolean
    meetingUrl?: boolean
    roundId?: boolean
    roundNumber?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    round?: boolean | Interview$roundArgs<ExtArgs>
  }, ExtArgs["result"]["interview"]>

  export type InterviewSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    requisitionId?: boolean
    candidateId?: boolean
    applicationId?: boolean
    type?: boolean
    stage?: boolean
    status?: boolean
    scheduledAt?: boolean
    duration?: boolean
    location?: boolean
    meetingUrl?: boolean
    roundId?: boolean
    roundNumber?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    round?: boolean | Interview$roundArgs<ExtArgs>
  }, ExtArgs["result"]["interview"]>

  export type InterviewSelectScalar = {
    id?: boolean
    tenantId?: boolean
    requisitionId?: boolean
    candidateId?: boolean
    applicationId?: boolean
    type?: boolean
    stage?: boolean
    status?: boolean
    scheduledAt?: boolean
    duration?: boolean
    location?: boolean
    meetingUrl?: boolean
    roundId?: boolean
    roundNumber?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type InterviewOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "requisitionId" | "candidateId" | "applicationId" | "type" | "stage" | "status" | "scheduledAt" | "duration" | "location" | "meetingUrl" | "roundId" | "roundNumber" | "createdAt" | "updatedAt", ExtArgs["result"]["interview"]>
  export type InterviewInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    round?: boolean | Interview$roundArgs<ExtArgs>
    panelMembers?: boolean | Interview$panelMembersArgs<ExtArgs>
    feedback?: boolean | Interview$feedbackArgs<ExtArgs>
    _count?: boolean | InterviewCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type InterviewIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    round?: boolean | Interview$roundArgs<ExtArgs>
  }
  export type InterviewIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    round?: boolean | Interview$roundArgs<ExtArgs>
  }

  export type $InterviewPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Interview"
    objects: {
      round: Prisma.$InterviewRoundPayload<ExtArgs> | null
      panelMembers: Prisma.$InterviewPanelMemberPayload<ExtArgs>[]
      feedback: Prisma.$InterviewFeedbackPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      requisitionId: string
      candidateId: string
      applicationId: string | null
      type: $Enums.InterviewType | null
      stage: string
      status: $Enums.InterviewStatus
      scheduledAt: Date | null
      duration: number
      location: string | null
      meetingUrl: string | null
      roundId: string | null
      roundNumber: number | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["interview"]>
    composites: {}
  }

  type InterviewGetPayload<S extends boolean | null | undefined | InterviewDefaultArgs> = $Result.GetResult<Prisma.$InterviewPayload, S>

  type InterviewCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<InterviewFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: InterviewCountAggregateInputType | true
    }

  export interface InterviewDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Interview'], meta: { name: 'Interview' } }
    /**
     * Find zero or one Interview that matches the filter.
     * @param {InterviewFindUniqueArgs} args - Arguments to find a Interview
     * @example
     * // Get one Interview
     * const interview = await prisma.interview.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends InterviewFindUniqueArgs>(args: SelectSubset<T, InterviewFindUniqueArgs<ExtArgs>>): Prisma__InterviewClient<$Result.GetResult<Prisma.$InterviewPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Interview that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {InterviewFindUniqueOrThrowArgs} args - Arguments to find a Interview
     * @example
     * // Get one Interview
     * const interview = await prisma.interview.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends InterviewFindUniqueOrThrowArgs>(args: SelectSubset<T, InterviewFindUniqueOrThrowArgs<ExtArgs>>): Prisma__InterviewClient<$Result.GetResult<Prisma.$InterviewPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Interview that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InterviewFindFirstArgs} args - Arguments to find a Interview
     * @example
     * // Get one Interview
     * const interview = await prisma.interview.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends InterviewFindFirstArgs>(args?: SelectSubset<T, InterviewFindFirstArgs<ExtArgs>>): Prisma__InterviewClient<$Result.GetResult<Prisma.$InterviewPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Interview that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InterviewFindFirstOrThrowArgs} args - Arguments to find a Interview
     * @example
     * // Get one Interview
     * const interview = await prisma.interview.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends InterviewFindFirstOrThrowArgs>(args?: SelectSubset<T, InterviewFindFirstOrThrowArgs<ExtArgs>>): Prisma__InterviewClient<$Result.GetResult<Prisma.$InterviewPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Interviews that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InterviewFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Interviews
     * const interviews = await prisma.interview.findMany()
     * 
     * // Get first 10 Interviews
     * const interviews = await prisma.interview.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const interviewWithIdOnly = await prisma.interview.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends InterviewFindManyArgs>(args?: SelectSubset<T, InterviewFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InterviewPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Interview.
     * @param {InterviewCreateArgs} args - Arguments to create a Interview.
     * @example
     * // Create one Interview
     * const Interview = await prisma.interview.create({
     *   data: {
     *     // ... data to create a Interview
     *   }
     * })
     * 
     */
    create<T extends InterviewCreateArgs>(args: SelectSubset<T, InterviewCreateArgs<ExtArgs>>): Prisma__InterviewClient<$Result.GetResult<Prisma.$InterviewPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Interviews.
     * @param {InterviewCreateManyArgs} args - Arguments to create many Interviews.
     * @example
     * // Create many Interviews
     * const interview = await prisma.interview.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends InterviewCreateManyArgs>(args?: SelectSubset<T, InterviewCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Interviews and returns the data saved in the database.
     * @param {InterviewCreateManyAndReturnArgs} args - Arguments to create many Interviews.
     * @example
     * // Create many Interviews
     * const interview = await prisma.interview.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Interviews and only return the `id`
     * const interviewWithIdOnly = await prisma.interview.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends InterviewCreateManyAndReturnArgs>(args?: SelectSubset<T, InterviewCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InterviewPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Interview.
     * @param {InterviewDeleteArgs} args - Arguments to delete one Interview.
     * @example
     * // Delete one Interview
     * const Interview = await prisma.interview.delete({
     *   where: {
     *     // ... filter to delete one Interview
     *   }
     * })
     * 
     */
    delete<T extends InterviewDeleteArgs>(args: SelectSubset<T, InterviewDeleteArgs<ExtArgs>>): Prisma__InterviewClient<$Result.GetResult<Prisma.$InterviewPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Interview.
     * @param {InterviewUpdateArgs} args - Arguments to update one Interview.
     * @example
     * // Update one Interview
     * const interview = await prisma.interview.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends InterviewUpdateArgs>(args: SelectSubset<T, InterviewUpdateArgs<ExtArgs>>): Prisma__InterviewClient<$Result.GetResult<Prisma.$InterviewPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Interviews.
     * @param {InterviewDeleteManyArgs} args - Arguments to filter Interviews to delete.
     * @example
     * // Delete a few Interviews
     * const { count } = await prisma.interview.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends InterviewDeleteManyArgs>(args?: SelectSubset<T, InterviewDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Interviews.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InterviewUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Interviews
     * const interview = await prisma.interview.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends InterviewUpdateManyArgs>(args: SelectSubset<T, InterviewUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Interviews and returns the data updated in the database.
     * @param {InterviewUpdateManyAndReturnArgs} args - Arguments to update many Interviews.
     * @example
     * // Update many Interviews
     * const interview = await prisma.interview.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Interviews and only return the `id`
     * const interviewWithIdOnly = await prisma.interview.updateManyAndReturn({
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
    updateManyAndReturn<T extends InterviewUpdateManyAndReturnArgs>(args: SelectSubset<T, InterviewUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InterviewPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Interview.
     * @param {InterviewUpsertArgs} args - Arguments to update or create a Interview.
     * @example
     * // Update or create a Interview
     * const interview = await prisma.interview.upsert({
     *   create: {
     *     // ... data to create a Interview
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Interview we want to update
     *   }
     * })
     */
    upsert<T extends InterviewUpsertArgs>(args: SelectSubset<T, InterviewUpsertArgs<ExtArgs>>): Prisma__InterviewClient<$Result.GetResult<Prisma.$InterviewPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Interviews.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InterviewCountArgs} args - Arguments to filter Interviews to count.
     * @example
     * // Count the number of Interviews
     * const count = await prisma.interview.count({
     *   where: {
     *     // ... the filter for the Interviews we want to count
     *   }
     * })
    **/
    count<T extends InterviewCountArgs>(
      args?: Subset<T, InterviewCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], InterviewCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Interview.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InterviewAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends InterviewAggregateArgs>(args: Subset<T, InterviewAggregateArgs>): Prisma.PrismaPromise<GetInterviewAggregateType<T>>

    /**
     * Group by Interview.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InterviewGroupByArgs} args - Group by arguments.
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
      T extends InterviewGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: InterviewGroupByArgs['orderBy'] }
        : { orderBy?: InterviewGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, InterviewGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetInterviewGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Interview model
   */
  readonly fields: InterviewFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Interview.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__InterviewClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    round<T extends Interview$roundArgs<ExtArgs> = {}>(args?: Subset<T, Interview$roundArgs<ExtArgs>>): Prisma__InterviewRoundClient<$Result.GetResult<Prisma.$InterviewRoundPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    panelMembers<T extends Interview$panelMembersArgs<ExtArgs> = {}>(args?: Subset<T, Interview$panelMembersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InterviewPanelMemberPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    feedback<T extends Interview$feedbackArgs<ExtArgs> = {}>(args?: Subset<T, Interview$feedbackArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InterviewFeedbackPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the Interview model
   */
  interface InterviewFieldRefs {
    readonly id: FieldRef<"Interview", 'String'>
    readonly tenantId: FieldRef<"Interview", 'String'>
    readonly requisitionId: FieldRef<"Interview", 'String'>
    readonly candidateId: FieldRef<"Interview", 'String'>
    readonly applicationId: FieldRef<"Interview", 'String'>
    readonly type: FieldRef<"Interview", 'InterviewType'>
    readonly stage: FieldRef<"Interview", 'String'>
    readonly status: FieldRef<"Interview", 'InterviewStatus'>
    readonly scheduledAt: FieldRef<"Interview", 'DateTime'>
    readonly duration: FieldRef<"Interview", 'Int'>
    readonly location: FieldRef<"Interview", 'String'>
    readonly meetingUrl: FieldRef<"Interview", 'String'>
    readonly roundId: FieldRef<"Interview", 'String'>
    readonly roundNumber: FieldRef<"Interview", 'Int'>
    readonly createdAt: FieldRef<"Interview", 'DateTime'>
    readonly updatedAt: FieldRef<"Interview", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Interview findUnique
   */
  export type InterviewFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Interview
     */
    select?: InterviewSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Interview
     */
    omit?: InterviewOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewInclude<ExtArgs> | null
    /**
     * Filter, which Interview to fetch.
     */
    where: InterviewWhereUniqueInput
  }

  /**
   * Interview findUniqueOrThrow
   */
  export type InterviewFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Interview
     */
    select?: InterviewSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Interview
     */
    omit?: InterviewOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewInclude<ExtArgs> | null
    /**
     * Filter, which Interview to fetch.
     */
    where: InterviewWhereUniqueInput
  }

  /**
   * Interview findFirst
   */
  export type InterviewFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Interview
     */
    select?: InterviewSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Interview
     */
    omit?: InterviewOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewInclude<ExtArgs> | null
    /**
     * Filter, which Interview to fetch.
     */
    where?: InterviewWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Interviews to fetch.
     */
    orderBy?: InterviewOrderByWithRelationInput | InterviewOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Interviews.
     */
    cursor?: InterviewWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Interviews from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Interviews.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Interviews.
     */
    distinct?: InterviewScalarFieldEnum | InterviewScalarFieldEnum[]
  }

  /**
   * Interview findFirstOrThrow
   */
  export type InterviewFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Interview
     */
    select?: InterviewSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Interview
     */
    omit?: InterviewOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewInclude<ExtArgs> | null
    /**
     * Filter, which Interview to fetch.
     */
    where?: InterviewWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Interviews to fetch.
     */
    orderBy?: InterviewOrderByWithRelationInput | InterviewOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Interviews.
     */
    cursor?: InterviewWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Interviews from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Interviews.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Interviews.
     */
    distinct?: InterviewScalarFieldEnum | InterviewScalarFieldEnum[]
  }

  /**
   * Interview findMany
   */
  export type InterviewFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Interview
     */
    select?: InterviewSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Interview
     */
    omit?: InterviewOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewInclude<ExtArgs> | null
    /**
     * Filter, which Interviews to fetch.
     */
    where?: InterviewWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Interviews to fetch.
     */
    orderBy?: InterviewOrderByWithRelationInput | InterviewOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Interviews.
     */
    cursor?: InterviewWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Interviews from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Interviews.
     */
    skip?: number
    distinct?: InterviewScalarFieldEnum | InterviewScalarFieldEnum[]
  }

  /**
   * Interview create
   */
  export type InterviewCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Interview
     */
    select?: InterviewSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Interview
     */
    omit?: InterviewOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewInclude<ExtArgs> | null
    /**
     * The data needed to create a Interview.
     */
    data: XOR<InterviewCreateInput, InterviewUncheckedCreateInput>
  }

  /**
   * Interview createMany
   */
  export type InterviewCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Interviews.
     */
    data: InterviewCreateManyInput | InterviewCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Interview createManyAndReturn
   */
  export type InterviewCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Interview
     */
    select?: InterviewSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Interview
     */
    omit?: InterviewOmit<ExtArgs> | null
    /**
     * The data used to create many Interviews.
     */
    data: InterviewCreateManyInput | InterviewCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Interview update
   */
  export type InterviewUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Interview
     */
    select?: InterviewSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Interview
     */
    omit?: InterviewOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewInclude<ExtArgs> | null
    /**
     * The data needed to update a Interview.
     */
    data: XOR<InterviewUpdateInput, InterviewUncheckedUpdateInput>
    /**
     * Choose, which Interview to update.
     */
    where: InterviewWhereUniqueInput
  }

  /**
   * Interview updateMany
   */
  export type InterviewUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Interviews.
     */
    data: XOR<InterviewUpdateManyMutationInput, InterviewUncheckedUpdateManyInput>
    /**
     * Filter which Interviews to update
     */
    where?: InterviewWhereInput
    /**
     * Limit how many Interviews to update.
     */
    limit?: number
  }

  /**
   * Interview updateManyAndReturn
   */
  export type InterviewUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Interview
     */
    select?: InterviewSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Interview
     */
    omit?: InterviewOmit<ExtArgs> | null
    /**
     * The data used to update Interviews.
     */
    data: XOR<InterviewUpdateManyMutationInput, InterviewUncheckedUpdateManyInput>
    /**
     * Filter which Interviews to update
     */
    where?: InterviewWhereInput
    /**
     * Limit how many Interviews to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Interview upsert
   */
  export type InterviewUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Interview
     */
    select?: InterviewSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Interview
     */
    omit?: InterviewOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewInclude<ExtArgs> | null
    /**
     * The filter to search for the Interview to update in case it exists.
     */
    where: InterviewWhereUniqueInput
    /**
     * In case the Interview found by the `where` argument doesn't exist, create a new Interview with this data.
     */
    create: XOR<InterviewCreateInput, InterviewUncheckedCreateInput>
    /**
     * In case the Interview was found with the provided `where` argument, update it with this data.
     */
    update: XOR<InterviewUpdateInput, InterviewUncheckedUpdateInput>
  }

  /**
   * Interview delete
   */
  export type InterviewDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Interview
     */
    select?: InterviewSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Interview
     */
    omit?: InterviewOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewInclude<ExtArgs> | null
    /**
     * Filter which Interview to delete.
     */
    where: InterviewWhereUniqueInput
  }

  /**
   * Interview deleteMany
   */
  export type InterviewDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Interviews to delete
     */
    where?: InterviewWhereInput
    /**
     * Limit how many Interviews to delete.
     */
    limit?: number
  }

  /**
   * Interview.round
   */
  export type Interview$roundArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewRound
     */
    select?: InterviewRoundSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewRound
     */
    omit?: InterviewRoundOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewRoundInclude<ExtArgs> | null
    where?: InterviewRoundWhereInput
  }

  /**
   * Interview.panelMembers
   */
  export type Interview$panelMembersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewPanelMember
     */
    select?: InterviewPanelMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewPanelMember
     */
    omit?: InterviewPanelMemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewPanelMemberInclude<ExtArgs> | null
    where?: InterviewPanelMemberWhereInput
    orderBy?: InterviewPanelMemberOrderByWithRelationInput | InterviewPanelMemberOrderByWithRelationInput[]
    cursor?: InterviewPanelMemberWhereUniqueInput
    take?: number
    skip?: number
    distinct?: InterviewPanelMemberScalarFieldEnum | InterviewPanelMemberScalarFieldEnum[]
  }

  /**
   * Interview.feedback
   */
  export type Interview$feedbackArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewFeedback
     */
    select?: InterviewFeedbackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewFeedback
     */
    omit?: InterviewFeedbackOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewFeedbackInclude<ExtArgs> | null
    where?: InterviewFeedbackWhereInput
    orderBy?: InterviewFeedbackOrderByWithRelationInput | InterviewFeedbackOrderByWithRelationInput[]
    cursor?: InterviewFeedbackWhereUniqueInput
    take?: number
    skip?: number
    distinct?: InterviewFeedbackScalarFieldEnum | InterviewFeedbackScalarFieldEnum[]
  }

  /**
   * Interview without action
   */
  export type InterviewDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Interview
     */
    select?: InterviewSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Interview
     */
    omit?: InterviewOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewInclude<ExtArgs> | null
  }


  /**
   * Model InterviewRound
   */

  export type AggregateInterviewRound = {
    _count: InterviewRoundCountAggregateOutputType | null
    _avg: InterviewRoundAvgAggregateOutputType | null
    _sum: InterviewRoundSumAggregateOutputType | null
    _min: InterviewRoundMinAggregateOutputType | null
    _max: InterviewRoundMaxAggregateOutputType | null
  }

  export type InterviewRoundAvgAggregateOutputType = {
    order: number | null
    durationMinutes: number | null
  }

  export type InterviewRoundSumAggregateOutputType = {
    order: number | null
    durationMinutes: number | null
  }

  export type InterviewRoundMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    requisitionId: string | null
    name: string | null
    order: number | null
    interviewType: $Enums.InterviewType | null
    durationMinutes: number | null
    instructions: string | null
    autoAdvanceOnPass: boolean | null
    defaultPanelistRole: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type InterviewRoundMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    requisitionId: string | null
    name: string | null
    order: number | null
    interviewType: $Enums.InterviewType | null
    durationMinutes: number | null
    instructions: string | null
    autoAdvanceOnPass: boolean | null
    defaultPanelistRole: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type InterviewRoundCountAggregateOutputType = {
    id: number
    tenantId: number
    requisitionId: number
    name: number
    order: number
    interviewType: number
    durationMinutes: number
    instructions: number
    autoAdvanceOnPass: number
    defaultPanelistRole: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type InterviewRoundAvgAggregateInputType = {
    order?: true
    durationMinutes?: true
  }

  export type InterviewRoundSumAggregateInputType = {
    order?: true
    durationMinutes?: true
  }

  export type InterviewRoundMinAggregateInputType = {
    id?: true
    tenantId?: true
    requisitionId?: true
    name?: true
    order?: true
    interviewType?: true
    durationMinutes?: true
    instructions?: true
    autoAdvanceOnPass?: true
    defaultPanelistRole?: true
    createdAt?: true
    updatedAt?: true
  }

  export type InterviewRoundMaxAggregateInputType = {
    id?: true
    tenantId?: true
    requisitionId?: true
    name?: true
    order?: true
    interviewType?: true
    durationMinutes?: true
    instructions?: true
    autoAdvanceOnPass?: true
    defaultPanelistRole?: true
    createdAt?: true
    updatedAt?: true
  }

  export type InterviewRoundCountAggregateInputType = {
    id?: true
    tenantId?: true
    requisitionId?: true
    name?: true
    order?: true
    interviewType?: true
    durationMinutes?: true
    instructions?: true
    autoAdvanceOnPass?: true
    defaultPanelistRole?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type InterviewRoundAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which InterviewRound to aggregate.
     */
    where?: InterviewRoundWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InterviewRounds to fetch.
     */
    orderBy?: InterviewRoundOrderByWithRelationInput | InterviewRoundOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: InterviewRoundWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InterviewRounds from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InterviewRounds.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned InterviewRounds
    **/
    _count?: true | InterviewRoundCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: InterviewRoundAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: InterviewRoundSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: InterviewRoundMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: InterviewRoundMaxAggregateInputType
  }

  export type GetInterviewRoundAggregateType<T extends InterviewRoundAggregateArgs> = {
        [P in keyof T & keyof AggregateInterviewRound]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateInterviewRound[P]>
      : GetScalarType<T[P], AggregateInterviewRound[P]>
  }




  export type InterviewRoundGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InterviewRoundWhereInput
    orderBy?: InterviewRoundOrderByWithAggregationInput | InterviewRoundOrderByWithAggregationInput[]
    by: InterviewRoundScalarFieldEnum[] | InterviewRoundScalarFieldEnum
    having?: InterviewRoundScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: InterviewRoundCountAggregateInputType | true
    _avg?: InterviewRoundAvgAggregateInputType
    _sum?: InterviewRoundSumAggregateInputType
    _min?: InterviewRoundMinAggregateInputType
    _max?: InterviewRoundMaxAggregateInputType
  }

  export type InterviewRoundGroupByOutputType = {
    id: string
    tenantId: string
    requisitionId: string | null
    name: string
    order: number
    interviewType: $Enums.InterviewType
    durationMinutes: number
    instructions: string | null
    autoAdvanceOnPass: boolean
    defaultPanelistRole: string | null
    createdAt: Date
    updatedAt: Date
    _count: InterviewRoundCountAggregateOutputType | null
    _avg: InterviewRoundAvgAggregateOutputType | null
    _sum: InterviewRoundSumAggregateOutputType | null
    _min: InterviewRoundMinAggregateOutputType | null
    _max: InterviewRoundMaxAggregateOutputType | null
  }

  type GetInterviewRoundGroupByPayload<T extends InterviewRoundGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<InterviewRoundGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof InterviewRoundGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], InterviewRoundGroupByOutputType[P]>
            : GetScalarType<T[P], InterviewRoundGroupByOutputType[P]>
        }
      >
    >


  export type InterviewRoundSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    requisitionId?: boolean
    name?: boolean
    order?: boolean
    interviewType?: boolean
    durationMinutes?: boolean
    instructions?: boolean
    autoAdvanceOnPass?: boolean
    defaultPanelistRole?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    interviews?: boolean | InterviewRound$interviewsArgs<ExtArgs>
    _count?: boolean | InterviewRoundCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["interviewRound"]>

  export type InterviewRoundSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    requisitionId?: boolean
    name?: boolean
    order?: boolean
    interviewType?: boolean
    durationMinutes?: boolean
    instructions?: boolean
    autoAdvanceOnPass?: boolean
    defaultPanelistRole?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["interviewRound"]>

  export type InterviewRoundSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    requisitionId?: boolean
    name?: boolean
    order?: boolean
    interviewType?: boolean
    durationMinutes?: boolean
    instructions?: boolean
    autoAdvanceOnPass?: boolean
    defaultPanelistRole?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["interviewRound"]>

  export type InterviewRoundSelectScalar = {
    id?: boolean
    tenantId?: boolean
    requisitionId?: boolean
    name?: boolean
    order?: boolean
    interviewType?: boolean
    durationMinutes?: boolean
    instructions?: boolean
    autoAdvanceOnPass?: boolean
    defaultPanelistRole?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type InterviewRoundOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "requisitionId" | "name" | "order" | "interviewType" | "durationMinutes" | "instructions" | "autoAdvanceOnPass" | "defaultPanelistRole" | "createdAt" | "updatedAt", ExtArgs["result"]["interviewRound"]>
  export type InterviewRoundInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    interviews?: boolean | InterviewRound$interviewsArgs<ExtArgs>
    _count?: boolean | InterviewRoundCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type InterviewRoundIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type InterviewRoundIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $InterviewRoundPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "InterviewRound"
    objects: {
      interviews: Prisma.$InterviewPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      requisitionId: string | null
      name: string
      order: number
      interviewType: $Enums.InterviewType
      durationMinutes: number
      instructions: string | null
      autoAdvanceOnPass: boolean
      defaultPanelistRole: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["interviewRound"]>
    composites: {}
  }

  type InterviewRoundGetPayload<S extends boolean | null | undefined | InterviewRoundDefaultArgs> = $Result.GetResult<Prisma.$InterviewRoundPayload, S>

  type InterviewRoundCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<InterviewRoundFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: InterviewRoundCountAggregateInputType | true
    }

  export interface InterviewRoundDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['InterviewRound'], meta: { name: 'InterviewRound' } }
    /**
     * Find zero or one InterviewRound that matches the filter.
     * @param {InterviewRoundFindUniqueArgs} args - Arguments to find a InterviewRound
     * @example
     * // Get one InterviewRound
     * const interviewRound = await prisma.interviewRound.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends InterviewRoundFindUniqueArgs>(args: SelectSubset<T, InterviewRoundFindUniqueArgs<ExtArgs>>): Prisma__InterviewRoundClient<$Result.GetResult<Prisma.$InterviewRoundPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one InterviewRound that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {InterviewRoundFindUniqueOrThrowArgs} args - Arguments to find a InterviewRound
     * @example
     * // Get one InterviewRound
     * const interviewRound = await prisma.interviewRound.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends InterviewRoundFindUniqueOrThrowArgs>(args: SelectSubset<T, InterviewRoundFindUniqueOrThrowArgs<ExtArgs>>): Prisma__InterviewRoundClient<$Result.GetResult<Prisma.$InterviewRoundPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first InterviewRound that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InterviewRoundFindFirstArgs} args - Arguments to find a InterviewRound
     * @example
     * // Get one InterviewRound
     * const interviewRound = await prisma.interviewRound.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends InterviewRoundFindFirstArgs>(args?: SelectSubset<T, InterviewRoundFindFirstArgs<ExtArgs>>): Prisma__InterviewRoundClient<$Result.GetResult<Prisma.$InterviewRoundPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first InterviewRound that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InterviewRoundFindFirstOrThrowArgs} args - Arguments to find a InterviewRound
     * @example
     * // Get one InterviewRound
     * const interviewRound = await prisma.interviewRound.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends InterviewRoundFindFirstOrThrowArgs>(args?: SelectSubset<T, InterviewRoundFindFirstOrThrowArgs<ExtArgs>>): Prisma__InterviewRoundClient<$Result.GetResult<Prisma.$InterviewRoundPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more InterviewRounds that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InterviewRoundFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all InterviewRounds
     * const interviewRounds = await prisma.interviewRound.findMany()
     * 
     * // Get first 10 InterviewRounds
     * const interviewRounds = await prisma.interviewRound.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const interviewRoundWithIdOnly = await prisma.interviewRound.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends InterviewRoundFindManyArgs>(args?: SelectSubset<T, InterviewRoundFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InterviewRoundPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a InterviewRound.
     * @param {InterviewRoundCreateArgs} args - Arguments to create a InterviewRound.
     * @example
     * // Create one InterviewRound
     * const InterviewRound = await prisma.interviewRound.create({
     *   data: {
     *     // ... data to create a InterviewRound
     *   }
     * })
     * 
     */
    create<T extends InterviewRoundCreateArgs>(args: SelectSubset<T, InterviewRoundCreateArgs<ExtArgs>>): Prisma__InterviewRoundClient<$Result.GetResult<Prisma.$InterviewRoundPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many InterviewRounds.
     * @param {InterviewRoundCreateManyArgs} args - Arguments to create many InterviewRounds.
     * @example
     * // Create many InterviewRounds
     * const interviewRound = await prisma.interviewRound.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends InterviewRoundCreateManyArgs>(args?: SelectSubset<T, InterviewRoundCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many InterviewRounds and returns the data saved in the database.
     * @param {InterviewRoundCreateManyAndReturnArgs} args - Arguments to create many InterviewRounds.
     * @example
     * // Create many InterviewRounds
     * const interviewRound = await prisma.interviewRound.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many InterviewRounds and only return the `id`
     * const interviewRoundWithIdOnly = await prisma.interviewRound.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends InterviewRoundCreateManyAndReturnArgs>(args?: SelectSubset<T, InterviewRoundCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InterviewRoundPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a InterviewRound.
     * @param {InterviewRoundDeleteArgs} args - Arguments to delete one InterviewRound.
     * @example
     * // Delete one InterviewRound
     * const InterviewRound = await prisma.interviewRound.delete({
     *   where: {
     *     // ... filter to delete one InterviewRound
     *   }
     * })
     * 
     */
    delete<T extends InterviewRoundDeleteArgs>(args: SelectSubset<T, InterviewRoundDeleteArgs<ExtArgs>>): Prisma__InterviewRoundClient<$Result.GetResult<Prisma.$InterviewRoundPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one InterviewRound.
     * @param {InterviewRoundUpdateArgs} args - Arguments to update one InterviewRound.
     * @example
     * // Update one InterviewRound
     * const interviewRound = await prisma.interviewRound.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends InterviewRoundUpdateArgs>(args: SelectSubset<T, InterviewRoundUpdateArgs<ExtArgs>>): Prisma__InterviewRoundClient<$Result.GetResult<Prisma.$InterviewRoundPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more InterviewRounds.
     * @param {InterviewRoundDeleteManyArgs} args - Arguments to filter InterviewRounds to delete.
     * @example
     * // Delete a few InterviewRounds
     * const { count } = await prisma.interviewRound.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends InterviewRoundDeleteManyArgs>(args?: SelectSubset<T, InterviewRoundDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more InterviewRounds.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InterviewRoundUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many InterviewRounds
     * const interviewRound = await prisma.interviewRound.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends InterviewRoundUpdateManyArgs>(args: SelectSubset<T, InterviewRoundUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more InterviewRounds and returns the data updated in the database.
     * @param {InterviewRoundUpdateManyAndReturnArgs} args - Arguments to update many InterviewRounds.
     * @example
     * // Update many InterviewRounds
     * const interviewRound = await prisma.interviewRound.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more InterviewRounds and only return the `id`
     * const interviewRoundWithIdOnly = await prisma.interviewRound.updateManyAndReturn({
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
    updateManyAndReturn<T extends InterviewRoundUpdateManyAndReturnArgs>(args: SelectSubset<T, InterviewRoundUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InterviewRoundPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one InterviewRound.
     * @param {InterviewRoundUpsertArgs} args - Arguments to update or create a InterviewRound.
     * @example
     * // Update or create a InterviewRound
     * const interviewRound = await prisma.interviewRound.upsert({
     *   create: {
     *     // ... data to create a InterviewRound
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the InterviewRound we want to update
     *   }
     * })
     */
    upsert<T extends InterviewRoundUpsertArgs>(args: SelectSubset<T, InterviewRoundUpsertArgs<ExtArgs>>): Prisma__InterviewRoundClient<$Result.GetResult<Prisma.$InterviewRoundPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of InterviewRounds.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InterviewRoundCountArgs} args - Arguments to filter InterviewRounds to count.
     * @example
     * // Count the number of InterviewRounds
     * const count = await prisma.interviewRound.count({
     *   where: {
     *     // ... the filter for the InterviewRounds we want to count
     *   }
     * })
    **/
    count<T extends InterviewRoundCountArgs>(
      args?: Subset<T, InterviewRoundCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], InterviewRoundCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a InterviewRound.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InterviewRoundAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends InterviewRoundAggregateArgs>(args: Subset<T, InterviewRoundAggregateArgs>): Prisma.PrismaPromise<GetInterviewRoundAggregateType<T>>

    /**
     * Group by InterviewRound.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InterviewRoundGroupByArgs} args - Group by arguments.
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
      T extends InterviewRoundGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: InterviewRoundGroupByArgs['orderBy'] }
        : { orderBy?: InterviewRoundGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, InterviewRoundGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetInterviewRoundGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the InterviewRound model
   */
  readonly fields: InterviewRoundFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for InterviewRound.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__InterviewRoundClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    interviews<T extends InterviewRound$interviewsArgs<ExtArgs> = {}>(args?: Subset<T, InterviewRound$interviewsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InterviewPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the InterviewRound model
   */
  interface InterviewRoundFieldRefs {
    readonly id: FieldRef<"InterviewRound", 'String'>
    readonly tenantId: FieldRef<"InterviewRound", 'String'>
    readonly requisitionId: FieldRef<"InterviewRound", 'String'>
    readonly name: FieldRef<"InterviewRound", 'String'>
    readonly order: FieldRef<"InterviewRound", 'Int'>
    readonly interviewType: FieldRef<"InterviewRound", 'InterviewType'>
    readonly durationMinutes: FieldRef<"InterviewRound", 'Int'>
    readonly instructions: FieldRef<"InterviewRound", 'String'>
    readonly autoAdvanceOnPass: FieldRef<"InterviewRound", 'Boolean'>
    readonly defaultPanelistRole: FieldRef<"InterviewRound", 'String'>
    readonly createdAt: FieldRef<"InterviewRound", 'DateTime'>
    readonly updatedAt: FieldRef<"InterviewRound", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * InterviewRound findUnique
   */
  export type InterviewRoundFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewRound
     */
    select?: InterviewRoundSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewRound
     */
    omit?: InterviewRoundOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewRoundInclude<ExtArgs> | null
    /**
     * Filter, which InterviewRound to fetch.
     */
    where: InterviewRoundWhereUniqueInput
  }

  /**
   * InterviewRound findUniqueOrThrow
   */
  export type InterviewRoundFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewRound
     */
    select?: InterviewRoundSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewRound
     */
    omit?: InterviewRoundOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewRoundInclude<ExtArgs> | null
    /**
     * Filter, which InterviewRound to fetch.
     */
    where: InterviewRoundWhereUniqueInput
  }

  /**
   * InterviewRound findFirst
   */
  export type InterviewRoundFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewRound
     */
    select?: InterviewRoundSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewRound
     */
    omit?: InterviewRoundOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewRoundInclude<ExtArgs> | null
    /**
     * Filter, which InterviewRound to fetch.
     */
    where?: InterviewRoundWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InterviewRounds to fetch.
     */
    orderBy?: InterviewRoundOrderByWithRelationInput | InterviewRoundOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for InterviewRounds.
     */
    cursor?: InterviewRoundWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InterviewRounds from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InterviewRounds.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of InterviewRounds.
     */
    distinct?: InterviewRoundScalarFieldEnum | InterviewRoundScalarFieldEnum[]
  }

  /**
   * InterviewRound findFirstOrThrow
   */
  export type InterviewRoundFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewRound
     */
    select?: InterviewRoundSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewRound
     */
    omit?: InterviewRoundOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewRoundInclude<ExtArgs> | null
    /**
     * Filter, which InterviewRound to fetch.
     */
    where?: InterviewRoundWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InterviewRounds to fetch.
     */
    orderBy?: InterviewRoundOrderByWithRelationInput | InterviewRoundOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for InterviewRounds.
     */
    cursor?: InterviewRoundWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InterviewRounds from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InterviewRounds.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of InterviewRounds.
     */
    distinct?: InterviewRoundScalarFieldEnum | InterviewRoundScalarFieldEnum[]
  }

  /**
   * InterviewRound findMany
   */
  export type InterviewRoundFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewRound
     */
    select?: InterviewRoundSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewRound
     */
    omit?: InterviewRoundOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewRoundInclude<ExtArgs> | null
    /**
     * Filter, which InterviewRounds to fetch.
     */
    where?: InterviewRoundWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InterviewRounds to fetch.
     */
    orderBy?: InterviewRoundOrderByWithRelationInput | InterviewRoundOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing InterviewRounds.
     */
    cursor?: InterviewRoundWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InterviewRounds from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InterviewRounds.
     */
    skip?: number
    distinct?: InterviewRoundScalarFieldEnum | InterviewRoundScalarFieldEnum[]
  }

  /**
   * InterviewRound create
   */
  export type InterviewRoundCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewRound
     */
    select?: InterviewRoundSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewRound
     */
    omit?: InterviewRoundOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewRoundInclude<ExtArgs> | null
    /**
     * The data needed to create a InterviewRound.
     */
    data: XOR<InterviewRoundCreateInput, InterviewRoundUncheckedCreateInput>
  }

  /**
   * InterviewRound createMany
   */
  export type InterviewRoundCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many InterviewRounds.
     */
    data: InterviewRoundCreateManyInput | InterviewRoundCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * InterviewRound createManyAndReturn
   */
  export type InterviewRoundCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewRound
     */
    select?: InterviewRoundSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewRound
     */
    omit?: InterviewRoundOmit<ExtArgs> | null
    /**
     * The data used to create many InterviewRounds.
     */
    data: InterviewRoundCreateManyInput | InterviewRoundCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * InterviewRound update
   */
  export type InterviewRoundUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewRound
     */
    select?: InterviewRoundSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewRound
     */
    omit?: InterviewRoundOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewRoundInclude<ExtArgs> | null
    /**
     * The data needed to update a InterviewRound.
     */
    data: XOR<InterviewRoundUpdateInput, InterviewRoundUncheckedUpdateInput>
    /**
     * Choose, which InterviewRound to update.
     */
    where: InterviewRoundWhereUniqueInput
  }

  /**
   * InterviewRound updateMany
   */
  export type InterviewRoundUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update InterviewRounds.
     */
    data: XOR<InterviewRoundUpdateManyMutationInput, InterviewRoundUncheckedUpdateManyInput>
    /**
     * Filter which InterviewRounds to update
     */
    where?: InterviewRoundWhereInput
    /**
     * Limit how many InterviewRounds to update.
     */
    limit?: number
  }

  /**
   * InterviewRound updateManyAndReturn
   */
  export type InterviewRoundUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewRound
     */
    select?: InterviewRoundSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewRound
     */
    omit?: InterviewRoundOmit<ExtArgs> | null
    /**
     * The data used to update InterviewRounds.
     */
    data: XOR<InterviewRoundUpdateManyMutationInput, InterviewRoundUncheckedUpdateManyInput>
    /**
     * Filter which InterviewRounds to update
     */
    where?: InterviewRoundWhereInput
    /**
     * Limit how many InterviewRounds to update.
     */
    limit?: number
  }

  /**
   * InterviewRound upsert
   */
  export type InterviewRoundUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewRound
     */
    select?: InterviewRoundSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewRound
     */
    omit?: InterviewRoundOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewRoundInclude<ExtArgs> | null
    /**
     * The filter to search for the InterviewRound to update in case it exists.
     */
    where: InterviewRoundWhereUniqueInput
    /**
     * In case the InterviewRound found by the `where` argument doesn't exist, create a new InterviewRound with this data.
     */
    create: XOR<InterviewRoundCreateInput, InterviewRoundUncheckedCreateInput>
    /**
     * In case the InterviewRound was found with the provided `where` argument, update it with this data.
     */
    update: XOR<InterviewRoundUpdateInput, InterviewRoundUncheckedUpdateInput>
  }

  /**
   * InterviewRound delete
   */
  export type InterviewRoundDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewRound
     */
    select?: InterviewRoundSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewRound
     */
    omit?: InterviewRoundOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewRoundInclude<ExtArgs> | null
    /**
     * Filter which InterviewRound to delete.
     */
    where: InterviewRoundWhereUniqueInput
  }

  /**
   * InterviewRound deleteMany
   */
  export type InterviewRoundDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which InterviewRounds to delete
     */
    where?: InterviewRoundWhereInput
    /**
     * Limit how many InterviewRounds to delete.
     */
    limit?: number
  }

  /**
   * InterviewRound.interviews
   */
  export type InterviewRound$interviewsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Interview
     */
    select?: InterviewSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Interview
     */
    omit?: InterviewOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewInclude<ExtArgs> | null
    where?: InterviewWhereInput
    orderBy?: InterviewOrderByWithRelationInput | InterviewOrderByWithRelationInput[]
    cursor?: InterviewWhereUniqueInput
    take?: number
    skip?: number
    distinct?: InterviewScalarFieldEnum | InterviewScalarFieldEnum[]
  }

  /**
   * InterviewRound without action
   */
  export type InterviewRoundDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewRound
     */
    select?: InterviewRoundSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewRound
     */
    omit?: InterviewRoundOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewRoundInclude<ExtArgs> | null
  }


  /**
   * Model InterviewFeedback
   */

  export type AggregateInterviewFeedback = {
    _count: InterviewFeedbackCountAggregateOutputType | null
    _avg: InterviewFeedbackAvgAggregateOutputType | null
    _sum: InterviewFeedbackSumAggregateOutputType | null
    _min: InterviewFeedbackMinAggregateOutputType | null
    _max: InterviewFeedbackMaxAggregateOutputType | null
  }

  export type InterviewFeedbackAvgAggregateOutputType = {
    overallRating: number | null
  }

  export type InterviewFeedbackSumAggregateOutputType = {
    overallRating: number | null
  }

  export type InterviewFeedbackMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    interviewId: string | null
    interviewerId: string | null
    candidateId: string | null
    overallRating: number | null
    recommendation: $Enums.InterviewRecommendation | null
    notes: string | null
    submittedAt: Date | null
  }

  export type InterviewFeedbackMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    interviewId: string | null
    interviewerId: string | null
    candidateId: string | null
    overallRating: number | null
    recommendation: $Enums.InterviewRecommendation | null
    notes: string | null
    submittedAt: Date | null
  }

  export type InterviewFeedbackCountAggregateOutputType = {
    id: number
    tenantId: number
    interviewId: number
    interviewerId: number
    candidateId: number
    overallRating: number
    recommendation: number
    strengths: number
    concerns: number
    notes: number
    submittedAt: number
    _all: number
  }


  export type InterviewFeedbackAvgAggregateInputType = {
    overallRating?: true
  }

  export type InterviewFeedbackSumAggregateInputType = {
    overallRating?: true
  }

  export type InterviewFeedbackMinAggregateInputType = {
    id?: true
    tenantId?: true
    interviewId?: true
    interviewerId?: true
    candidateId?: true
    overallRating?: true
    recommendation?: true
    notes?: true
    submittedAt?: true
  }

  export type InterviewFeedbackMaxAggregateInputType = {
    id?: true
    tenantId?: true
    interviewId?: true
    interviewerId?: true
    candidateId?: true
    overallRating?: true
    recommendation?: true
    notes?: true
    submittedAt?: true
  }

  export type InterviewFeedbackCountAggregateInputType = {
    id?: true
    tenantId?: true
    interviewId?: true
    interviewerId?: true
    candidateId?: true
    overallRating?: true
    recommendation?: true
    strengths?: true
    concerns?: true
    notes?: true
    submittedAt?: true
    _all?: true
  }

  export type InterviewFeedbackAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which InterviewFeedback to aggregate.
     */
    where?: InterviewFeedbackWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InterviewFeedbacks to fetch.
     */
    orderBy?: InterviewFeedbackOrderByWithRelationInput | InterviewFeedbackOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: InterviewFeedbackWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InterviewFeedbacks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InterviewFeedbacks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned InterviewFeedbacks
    **/
    _count?: true | InterviewFeedbackCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: InterviewFeedbackAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: InterviewFeedbackSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: InterviewFeedbackMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: InterviewFeedbackMaxAggregateInputType
  }

  export type GetInterviewFeedbackAggregateType<T extends InterviewFeedbackAggregateArgs> = {
        [P in keyof T & keyof AggregateInterviewFeedback]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateInterviewFeedback[P]>
      : GetScalarType<T[P], AggregateInterviewFeedback[P]>
  }




  export type InterviewFeedbackGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InterviewFeedbackWhereInput
    orderBy?: InterviewFeedbackOrderByWithAggregationInput | InterviewFeedbackOrderByWithAggregationInput[]
    by: InterviewFeedbackScalarFieldEnum[] | InterviewFeedbackScalarFieldEnum
    having?: InterviewFeedbackScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: InterviewFeedbackCountAggregateInputType | true
    _avg?: InterviewFeedbackAvgAggregateInputType
    _sum?: InterviewFeedbackSumAggregateInputType
    _min?: InterviewFeedbackMinAggregateInputType
    _max?: InterviewFeedbackMaxAggregateInputType
  }

  export type InterviewFeedbackGroupByOutputType = {
    id: string
    tenantId: string
    interviewId: string
    interviewerId: string
    candidateId: string
    overallRating: number
    recommendation: $Enums.InterviewRecommendation
    strengths: JsonValue
    concerns: JsonValue
    notes: string | null
    submittedAt: Date
    _count: InterviewFeedbackCountAggregateOutputType | null
    _avg: InterviewFeedbackAvgAggregateOutputType | null
    _sum: InterviewFeedbackSumAggregateOutputType | null
    _min: InterviewFeedbackMinAggregateOutputType | null
    _max: InterviewFeedbackMaxAggregateOutputType | null
  }

  type GetInterviewFeedbackGroupByPayload<T extends InterviewFeedbackGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<InterviewFeedbackGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof InterviewFeedbackGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], InterviewFeedbackGroupByOutputType[P]>
            : GetScalarType<T[P], InterviewFeedbackGroupByOutputType[P]>
        }
      >
    >


  export type InterviewFeedbackSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    interviewId?: boolean
    interviewerId?: boolean
    candidateId?: boolean
    overallRating?: boolean
    recommendation?: boolean
    strengths?: boolean
    concerns?: boolean
    notes?: boolean
    submittedAt?: boolean
    interview?: boolean | InterviewDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["interviewFeedback"]>

  export type InterviewFeedbackSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    interviewId?: boolean
    interviewerId?: boolean
    candidateId?: boolean
    overallRating?: boolean
    recommendation?: boolean
    strengths?: boolean
    concerns?: boolean
    notes?: boolean
    submittedAt?: boolean
    interview?: boolean | InterviewDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["interviewFeedback"]>

  export type InterviewFeedbackSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    interviewId?: boolean
    interviewerId?: boolean
    candidateId?: boolean
    overallRating?: boolean
    recommendation?: boolean
    strengths?: boolean
    concerns?: boolean
    notes?: boolean
    submittedAt?: boolean
    interview?: boolean | InterviewDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["interviewFeedback"]>

  export type InterviewFeedbackSelectScalar = {
    id?: boolean
    tenantId?: boolean
    interviewId?: boolean
    interviewerId?: boolean
    candidateId?: boolean
    overallRating?: boolean
    recommendation?: boolean
    strengths?: boolean
    concerns?: boolean
    notes?: boolean
    submittedAt?: boolean
  }

  export type InterviewFeedbackOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "interviewId" | "interviewerId" | "candidateId" | "overallRating" | "recommendation" | "strengths" | "concerns" | "notes" | "submittedAt", ExtArgs["result"]["interviewFeedback"]>
  export type InterviewFeedbackInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    interview?: boolean | InterviewDefaultArgs<ExtArgs>
  }
  export type InterviewFeedbackIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    interview?: boolean | InterviewDefaultArgs<ExtArgs>
  }
  export type InterviewFeedbackIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    interview?: boolean | InterviewDefaultArgs<ExtArgs>
  }

  export type $InterviewFeedbackPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "InterviewFeedback"
    objects: {
      interview: Prisma.$InterviewPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      interviewId: string
      interviewerId: string
      candidateId: string
      overallRating: number
      recommendation: $Enums.InterviewRecommendation
      strengths: Prisma.JsonValue
      concerns: Prisma.JsonValue
      notes: string | null
      submittedAt: Date
    }, ExtArgs["result"]["interviewFeedback"]>
    composites: {}
  }

  type InterviewFeedbackGetPayload<S extends boolean | null | undefined | InterviewFeedbackDefaultArgs> = $Result.GetResult<Prisma.$InterviewFeedbackPayload, S>

  type InterviewFeedbackCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<InterviewFeedbackFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: InterviewFeedbackCountAggregateInputType | true
    }

  export interface InterviewFeedbackDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['InterviewFeedback'], meta: { name: 'InterviewFeedback' } }
    /**
     * Find zero or one InterviewFeedback that matches the filter.
     * @param {InterviewFeedbackFindUniqueArgs} args - Arguments to find a InterviewFeedback
     * @example
     * // Get one InterviewFeedback
     * const interviewFeedback = await prisma.interviewFeedback.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends InterviewFeedbackFindUniqueArgs>(args: SelectSubset<T, InterviewFeedbackFindUniqueArgs<ExtArgs>>): Prisma__InterviewFeedbackClient<$Result.GetResult<Prisma.$InterviewFeedbackPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one InterviewFeedback that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {InterviewFeedbackFindUniqueOrThrowArgs} args - Arguments to find a InterviewFeedback
     * @example
     * // Get one InterviewFeedback
     * const interviewFeedback = await prisma.interviewFeedback.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends InterviewFeedbackFindUniqueOrThrowArgs>(args: SelectSubset<T, InterviewFeedbackFindUniqueOrThrowArgs<ExtArgs>>): Prisma__InterviewFeedbackClient<$Result.GetResult<Prisma.$InterviewFeedbackPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first InterviewFeedback that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InterviewFeedbackFindFirstArgs} args - Arguments to find a InterviewFeedback
     * @example
     * // Get one InterviewFeedback
     * const interviewFeedback = await prisma.interviewFeedback.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends InterviewFeedbackFindFirstArgs>(args?: SelectSubset<T, InterviewFeedbackFindFirstArgs<ExtArgs>>): Prisma__InterviewFeedbackClient<$Result.GetResult<Prisma.$InterviewFeedbackPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first InterviewFeedback that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InterviewFeedbackFindFirstOrThrowArgs} args - Arguments to find a InterviewFeedback
     * @example
     * // Get one InterviewFeedback
     * const interviewFeedback = await prisma.interviewFeedback.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends InterviewFeedbackFindFirstOrThrowArgs>(args?: SelectSubset<T, InterviewFeedbackFindFirstOrThrowArgs<ExtArgs>>): Prisma__InterviewFeedbackClient<$Result.GetResult<Prisma.$InterviewFeedbackPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more InterviewFeedbacks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InterviewFeedbackFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all InterviewFeedbacks
     * const interviewFeedbacks = await prisma.interviewFeedback.findMany()
     * 
     * // Get first 10 InterviewFeedbacks
     * const interviewFeedbacks = await prisma.interviewFeedback.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const interviewFeedbackWithIdOnly = await prisma.interviewFeedback.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends InterviewFeedbackFindManyArgs>(args?: SelectSubset<T, InterviewFeedbackFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InterviewFeedbackPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a InterviewFeedback.
     * @param {InterviewFeedbackCreateArgs} args - Arguments to create a InterviewFeedback.
     * @example
     * // Create one InterviewFeedback
     * const InterviewFeedback = await prisma.interviewFeedback.create({
     *   data: {
     *     // ... data to create a InterviewFeedback
     *   }
     * })
     * 
     */
    create<T extends InterviewFeedbackCreateArgs>(args: SelectSubset<T, InterviewFeedbackCreateArgs<ExtArgs>>): Prisma__InterviewFeedbackClient<$Result.GetResult<Prisma.$InterviewFeedbackPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many InterviewFeedbacks.
     * @param {InterviewFeedbackCreateManyArgs} args - Arguments to create many InterviewFeedbacks.
     * @example
     * // Create many InterviewFeedbacks
     * const interviewFeedback = await prisma.interviewFeedback.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends InterviewFeedbackCreateManyArgs>(args?: SelectSubset<T, InterviewFeedbackCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many InterviewFeedbacks and returns the data saved in the database.
     * @param {InterviewFeedbackCreateManyAndReturnArgs} args - Arguments to create many InterviewFeedbacks.
     * @example
     * // Create many InterviewFeedbacks
     * const interviewFeedback = await prisma.interviewFeedback.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many InterviewFeedbacks and only return the `id`
     * const interviewFeedbackWithIdOnly = await prisma.interviewFeedback.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends InterviewFeedbackCreateManyAndReturnArgs>(args?: SelectSubset<T, InterviewFeedbackCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InterviewFeedbackPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a InterviewFeedback.
     * @param {InterviewFeedbackDeleteArgs} args - Arguments to delete one InterviewFeedback.
     * @example
     * // Delete one InterviewFeedback
     * const InterviewFeedback = await prisma.interviewFeedback.delete({
     *   where: {
     *     // ... filter to delete one InterviewFeedback
     *   }
     * })
     * 
     */
    delete<T extends InterviewFeedbackDeleteArgs>(args: SelectSubset<T, InterviewFeedbackDeleteArgs<ExtArgs>>): Prisma__InterviewFeedbackClient<$Result.GetResult<Prisma.$InterviewFeedbackPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one InterviewFeedback.
     * @param {InterviewFeedbackUpdateArgs} args - Arguments to update one InterviewFeedback.
     * @example
     * // Update one InterviewFeedback
     * const interviewFeedback = await prisma.interviewFeedback.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends InterviewFeedbackUpdateArgs>(args: SelectSubset<T, InterviewFeedbackUpdateArgs<ExtArgs>>): Prisma__InterviewFeedbackClient<$Result.GetResult<Prisma.$InterviewFeedbackPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more InterviewFeedbacks.
     * @param {InterviewFeedbackDeleteManyArgs} args - Arguments to filter InterviewFeedbacks to delete.
     * @example
     * // Delete a few InterviewFeedbacks
     * const { count } = await prisma.interviewFeedback.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends InterviewFeedbackDeleteManyArgs>(args?: SelectSubset<T, InterviewFeedbackDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more InterviewFeedbacks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InterviewFeedbackUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many InterviewFeedbacks
     * const interviewFeedback = await prisma.interviewFeedback.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends InterviewFeedbackUpdateManyArgs>(args: SelectSubset<T, InterviewFeedbackUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more InterviewFeedbacks and returns the data updated in the database.
     * @param {InterviewFeedbackUpdateManyAndReturnArgs} args - Arguments to update many InterviewFeedbacks.
     * @example
     * // Update many InterviewFeedbacks
     * const interviewFeedback = await prisma.interviewFeedback.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more InterviewFeedbacks and only return the `id`
     * const interviewFeedbackWithIdOnly = await prisma.interviewFeedback.updateManyAndReturn({
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
    updateManyAndReturn<T extends InterviewFeedbackUpdateManyAndReturnArgs>(args: SelectSubset<T, InterviewFeedbackUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InterviewFeedbackPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one InterviewFeedback.
     * @param {InterviewFeedbackUpsertArgs} args - Arguments to update or create a InterviewFeedback.
     * @example
     * // Update or create a InterviewFeedback
     * const interviewFeedback = await prisma.interviewFeedback.upsert({
     *   create: {
     *     // ... data to create a InterviewFeedback
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the InterviewFeedback we want to update
     *   }
     * })
     */
    upsert<T extends InterviewFeedbackUpsertArgs>(args: SelectSubset<T, InterviewFeedbackUpsertArgs<ExtArgs>>): Prisma__InterviewFeedbackClient<$Result.GetResult<Prisma.$InterviewFeedbackPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of InterviewFeedbacks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InterviewFeedbackCountArgs} args - Arguments to filter InterviewFeedbacks to count.
     * @example
     * // Count the number of InterviewFeedbacks
     * const count = await prisma.interviewFeedback.count({
     *   where: {
     *     // ... the filter for the InterviewFeedbacks we want to count
     *   }
     * })
    **/
    count<T extends InterviewFeedbackCountArgs>(
      args?: Subset<T, InterviewFeedbackCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], InterviewFeedbackCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a InterviewFeedback.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InterviewFeedbackAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends InterviewFeedbackAggregateArgs>(args: Subset<T, InterviewFeedbackAggregateArgs>): Prisma.PrismaPromise<GetInterviewFeedbackAggregateType<T>>

    /**
     * Group by InterviewFeedback.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InterviewFeedbackGroupByArgs} args - Group by arguments.
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
      T extends InterviewFeedbackGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: InterviewFeedbackGroupByArgs['orderBy'] }
        : { orderBy?: InterviewFeedbackGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, InterviewFeedbackGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetInterviewFeedbackGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the InterviewFeedback model
   */
  readonly fields: InterviewFeedbackFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for InterviewFeedback.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__InterviewFeedbackClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    interview<T extends InterviewDefaultArgs<ExtArgs> = {}>(args?: Subset<T, InterviewDefaultArgs<ExtArgs>>): Prisma__InterviewClient<$Result.GetResult<Prisma.$InterviewPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the InterviewFeedback model
   */
  interface InterviewFeedbackFieldRefs {
    readonly id: FieldRef<"InterviewFeedback", 'String'>
    readonly tenantId: FieldRef<"InterviewFeedback", 'String'>
    readonly interviewId: FieldRef<"InterviewFeedback", 'String'>
    readonly interviewerId: FieldRef<"InterviewFeedback", 'String'>
    readonly candidateId: FieldRef<"InterviewFeedback", 'String'>
    readonly overallRating: FieldRef<"InterviewFeedback", 'Int'>
    readonly recommendation: FieldRef<"InterviewFeedback", 'InterviewRecommendation'>
    readonly strengths: FieldRef<"InterviewFeedback", 'Json'>
    readonly concerns: FieldRef<"InterviewFeedback", 'Json'>
    readonly notes: FieldRef<"InterviewFeedback", 'String'>
    readonly submittedAt: FieldRef<"InterviewFeedback", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * InterviewFeedback findUnique
   */
  export type InterviewFeedbackFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewFeedback
     */
    select?: InterviewFeedbackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewFeedback
     */
    omit?: InterviewFeedbackOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewFeedbackInclude<ExtArgs> | null
    /**
     * Filter, which InterviewFeedback to fetch.
     */
    where: InterviewFeedbackWhereUniqueInput
  }

  /**
   * InterviewFeedback findUniqueOrThrow
   */
  export type InterviewFeedbackFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewFeedback
     */
    select?: InterviewFeedbackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewFeedback
     */
    omit?: InterviewFeedbackOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewFeedbackInclude<ExtArgs> | null
    /**
     * Filter, which InterviewFeedback to fetch.
     */
    where: InterviewFeedbackWhereUniqueInput
  }

  /**
   * InterviewFeedback findFirst
   */
  export type InterviewFeedbackFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewFeedback
     */
    select?: InterviewFeedbackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewFeedback
     */
    omit?: InterviewFeedbackOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewFeedbackInclude<ExtArgs> | null
    /**
     * Filter, which InterviewFeedback to fetch.
     */
    where?: InterviewFeedbackWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InterviewFeedbacks to fetch.
     */
    orderBy?: InterviewFeedbackOrderByWithRelationInput | InterviewFeedbackOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for InterviewFeedbacks.
     */
    cursor?: InterviewFeedbackWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InterviewFeedbacks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InterviewFeedbacks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of InterviewFeedbacks.
     */
    distinct?: InterviewFeedbackScalarFieldEnum | InterviewFeedbackScalarFieldEnum[]
  }

  /**
   * InterviewFeedback findFirstOrThrow
   */
  export type InterviewFeedbackFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewFeedback
     */
    select?: InterviewFeedbackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewFeedback
     */
    omit?: InterviewFeedbackOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewFeedbackInclude<ExtArgs> | null
    /**
     * Filter, which InterviewFeedback to fetch.
     */
    where?: InterviewFeedbackWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InterviewFeedbacks to fetch.
     */
    orderBy?: InterviewFeedbackOrderByWithRelationInput | InterviewFeedbackOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for InterviewFeedbacks.
     */
    cursor?: InterviewFeedbackWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InterviewFeedbacks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InterviewFeedbacks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of InterviewFeedbacks.
     */
    distinct?: InterviewFeedbackScalarFieldEnum | InterviewFeedbackScalarFieldEnum[]
  }

  /**
   * InterviewFeedback findMany
   */
  export type InterviewFeedbackFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewFeedback
     */
    select?: InterviewFeedbackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewFeedback
     */
    omit?: InterviewFeedbackOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewFeedbackInclude<ExtArgs> | null
    /**
     * Filter, which InterviewFeedbacks to fetch.
     */
    where?: InterviewFeedbackWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InterviewFeedbacks to fetch.
     */
    orderBy?: InterviewFeedbackOrderByWithRelationInput | InterviewFeedbackOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing InterviewFeedbacks.
     */
    cursor?: InterviewFeedbackWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InterviewFeedbacks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InterviewFeedbacks.
     */
    skip?: number
    distinct?: InterviewFeedbackScalarFieldEnum | InterviewFeedbackScalarFieldEnum[]
  }

  /**
   * InterviewFeedback create
   */
  export type InterviewFeedbackCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewFeedback
     */
    select?: InterviewFeedbackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewFeedback
     */
    omit?: InterviewFeedbackOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewFeedbackInclude<ExtArgs> | null
    /**
     * The data needed to create a InterviewFeedback.
     */
    data: XOR<InterviewFeedbackCreateInput, InterviewFeedbackUncheckedCreateInput>
  }

  /**
   * InterviewFeedback createMany
   */
  export type InterviewFeedbackCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many InterviewFeedbacks.
     */
    data: InterviewFeedbackCreateManyInput | InterviewFeedbackCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * InterviewFeedback createManyAndReturn
   */
  export type InterviewFeedbackCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewFeedback
     */
    select?: InterviewFeedbackSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewFeedback
     */
    omit?: InterviewFeedbackOmit<ExtArgs> | null
    /**
     * The data used to create many InterviewFeedbacks.
     */
    data: InterviewFeedbackCreateManyInput | InterviewFeedbackCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewFeedbackIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * InterviewFeedback update
   */
  export type InterviewFeedbackUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewFeedback
     */
    select?: InterviewFeedbackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewFeedback
     */
    omit?: InterviewFeedbackOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewFeedbackInclude<ExtArgs> | null
    /**
     * The data needed to update a InterviewFeedback.
     */
    data: XOR<InterviewFeedbackUpdateInput, InterviewFeedbackUncheckedUpdateInput>
    /**
     * Choose, which InterviewFeedback to update.
     */
    where: InterviewFeedbackWhereUniqueInput
  }

  /**
   * InterviewFeedback updateMany
   */
  export type InterviewFeedbackUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update InterviewFeedbacks.
     */
    data: XOR<InterviewFeedbackUpdateManyMutationInput, InterviewFeedbackUncheckedUpdateManyInput>
    /**
     * Filter which InterviewFeedbacks to update
     */
    where?: InterviewFeedbackWhereInput
    /**
     * Limit how many InterviewFeedbacks to update.
     */
    limit?: number
  }

  /**
   * InterviewFeedback updateManyAndReturn
   */
  export type InterviewFeedbackUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewFeedback
     */
    select?: InterviewFeedbackSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewFeedback
     */
    omit?: InterviewFeedbackOmit<ExtArgs> | null
    /**
     * The data used to update InterviewFeedbacks.
     */
    data: XOR<InterviewFeedbackUpdateManyMutationInput, InterviewFeedbackUncheckedUpdateManyInput>
    /**
     * Filter which InterviewFeedbacks to update
     */
    where?: InterviewFeedbackWhereInput
    /**
     * Limit how many InterviewFeedbacks to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewFeedbackIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * InterviewFeedback upsert
   */
  export type InterviewFeedbackUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewFeedback
     */
    select?: InterviewFeedbackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewFeedback
     */
    omit?: InterviewFeedbackOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewFeedbackInclude<ExtArgs> | null
    /**
     * The filter to search for the InterviewFeedback to update in case it exists.
     */
    where: InterviewFeedbackWhereUniqueInput
    /**
     * In case the InterviewFeedback found by the `where` argument doesn't exist, create a new InterviewFeedback with this data.
     */
    create: XOR<InterviewFeedbackCreateInput, InterviewFeedbackUncheckedCreateInput>
    /**
     * In case the InterviewFeedback was found with the provided `where` argument, update it with this data.
     */
    update: XOR<InterviewFeedbackUpdateInput, InterviewFeedbackUncheckedUpdateInput>
  }

  /**
   * InterviewFeedback delete
   */
  export type InterviewFeedbackDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewFeedback
     */
    select?: InterviewFeedbackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewFeedback
     */
    omit?: InterviewFeedbackOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewFeedbackInclude<ExtArgs> | null
    /**
     * Filter which InterviewFeedback to delete.
     */
    where: InterviewFeedbackWhereUniqueInput
  }

  /**
   * InterviewFeedback deleteMany
   */
  export type InterviewFeedbackDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which InterviewFeedbacks to delete
     */
    where?: InterviewFeedbackWhereInput
    /**
     * Limit how many InterviewFeedbacks to delete.
     */
    limit?: number
  }

  /**
   * InterviewFeedback without action
   */
  export type InterviewFeedbackDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewFeedback
     */
    select?: InterviewFeedbackSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewFeedback
     */
    omit?: InterviewFeedbackOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewFeedbackInclude<ExtArgs> | null
  }


  /**
   * Model InterviewPanelMember
   */

  export type AggregateInterviewPanelMember = {
    _count: InterviewPanelMemberCountAggregateOutputType | null
    _min: InterviewPanelMemberMinAggregateOutputType | null
    _max: InterviewPanelMemberMaxAggregateOutputType | null
  }

  export type InterviewPanelMemberMinAggregateOutputType = {
    id: string | null
    interviewId: string | null
    userId: string | null
    role: string | null
    isRequired: boolean | null
    confirmed: boolean | null
    createdAt: Date | null
  }

  export type InterviewPanelMemberMaxAggregateOutputType = {
    id: string | null
    interviewId: string | null
    userId: string | null
    role: string | null
    isRequired: boolean | null
    confirmed: boolean | null
    createdAt: Date | null
  }

  export type InterviewPanelMemberCountAggregateOutputType = {
    id: number
    interviewId: number
    userId: number
    role: number
    isRequired: number
    confirmed: number
    createdAt: number
    _all: number
  }


  export type InterviewPanelMemberMinAggregateInputType = {
    id?: true
    interviewId?: true
    userId?: true
    role?: true
    isRequired?: true
    confirmed?: true
    createdAt?: true
  }

  export type InterviewPanelMemberMaxAggregateInputType = {
    id?: true
    interviewId?: true
    userId?: true
    role?: true
    isRequired?: true
    confirmed?: true
    createdAt?: true
  }

  export type InterviewPanelMemberCountAggregateInputType = {
    id?: true
    interviewId?: true
    userId?: true
    role?: true
    isRequired?: true
    confirmed?: true
    createdAt?: true
    _all?: true
  }

  export type InterviewPanelMemberAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which InterviewPanelMember to aggregate.
     */
    where?: InterviewPanelMemberWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InterviewPanelMembers to fetch.
     */
    orderBy?: InterviewPanelMemberOrderByWithRelationInput | InterviewPanelMemberOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: InterviewPanelMemberWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InterviewPanelMembers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InterviewPanelMembers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned InterviewPanelMembers
    **/
    _count?: true | InterviewPanelMemberCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: InterviewPanelMemberMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: InterviewPanelMemberMaxAggregateInputType
  }

  export type GetInterviewPanelMemberAggregateType<T extends InterviewPanelMemberAggregateArgs> = {
        [P in keyof T & keyof AggregateInterviewPanelMember]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateInterviewPanelMember[P]>
      : GetScalarType<T[P], AggregateInterviewPanelMember[P]>
  }




  export type InterviewPanelMemberGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InterviewPanelMemberWhereInput
    orderBy?: InterviewPanelMemberOrderByWithAggregationInput | InterviewPanelMemberOrderByWithAggregationInput[]
    by: InterviewPanelMemberScalarFieldEnum[] | InterviewPanelMemberScalarFieldEnum
    having?: InterviewPanelMemberScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: InterviewPanelMemberCountAggregateInputType | true
    _min?: InterviewPanelMemberMinAggregateInputType
    _max?: InterviewPanelMemberMaxAggregateInputType
  }

  export type InterviewPanelMemberGroupByOutputType = {
    id: string
    interviewId: string
    userId: string
    role: string
    isRequired: boolean
    confirmed: boolean
    createdAt: Date
    _count: InterviewPanelMemberCountAggregateOutputType | null
    _min: InterviewPanelMemberMinAggregateOutputType | null
    _max: InterviewPanelMemberMaxAggregateOutputType | null
  }

  type GetInterviewPanelMemberGroupByPayload<T extends InterviewPanelMemberGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<InterviewPanelMemberGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof InterviewPanelMemberGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], InterviewPanelMemberGroupByOutputType[P]>
            : GetScalarType<T[P], InterviewPanelMemberGroupByOutputType[P]>
        }
      >
    >


  export type InterviewPanelMemberSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    interviewId?: boolean
    userId?: boolean
    role?: boolean
    isRequired?: boolean
    confirmed?: boolean
    createdAt?: boolean
    interview?: boolean | InterviewDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["interviewPanelMember"]>

  export type InterviewPanelMemberSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    interviewId?: boolean
    userId?: boolean
    role?: boolean
    isRequired?: boolean
    confirmed?: boolean
    createdAt?: boolean
    interview?: boolean | InterviewDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["interviewPanelMember"]>

  export type InterviewPanelMemberSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    interviewId?: boolean
    userId?: boolean
    role?: boolean
    isRequired?: boolean
    confirmed?: boolean
    createdAt?: boolean
    interview?: boolean | InterviewDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["interviewPanelMember"]>

  export type InterviewPanelMemberSelectScalar = {
    id?: boolean
    interviewId?: boolean
    userId?: boolean
    role?: boolean
    isRequired?: boolean
    confirmed?: boolean
    createdAt?: boolean
  }

  export type InterviewPanelMemberOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "interviewId" | "userId" | "role" | "isRequired" | "confirmed" | "createdAt", ExtArgs["result"]["interviewPanelMember"]>
  export type InterviewPanelMemberInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    interview?: boolean | InterviewDefaultArgs<ExtArgs>
  }
  export type InterviewPanelMemberIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    interview?: boolean | InterviewDefaultArgs<ExtArgs>
  }
  export type InterviewPanelMemberIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    interview?: boolean | InterviewDefaultArgs<ExtArgs>
  }

  export type $InterviewPanelMemberPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "InterviewPanelMember"
    objects: {
      interview: Prisma.$InterviewPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      interviewId: string
      userId: string
      role: string
      isRequired: boolean
      confirmed: boolean
      createdAt: Date
    }, ExtArgs["result"]["interviewPanelMember"]>
    composites: {}
  }

  type InterviewPanelMemberGetPayload<S extends boolean | null | undefined | InterviewPanelMemberDefaultArgs> = $Result.GetResult<Prisma.$InterviewPanelMemberPayload, S>

  type InterviewPanelMemberCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<InterviewPanelMemberFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: InterviewPanelMemberCountAggregateInputType | true
    }

  export interface InterviewPanelMemberDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['InterviewPanelMember'], meta: { name: 'InterviewPanelMember' } }
    /**
     * Find zero or one InterviewPanelMember that matches the filter.
     * @param {InterviewPanelMemberFindUniqueArgs} args - Arguments to find a InterviewPanelMember
     * @example
     * // Get one InterviewPanelMember
     * const interviewPanelMember = await prisma.interviewPanelMember.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends InterviewPanelMemberFindUniqueArgs>(args: SelectSubset<T, InterviewPanelMemberFindUniqueArgs<ExtArgs>>): Prisma__InterviewPanelMemberClient<$Result.GetResult<Prisma.$InterviewPanelMemberPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one InterviewPanelMember that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {InterviewPanelMemberFindUniqueOrThrowArgs} args - Arguments to find a InterviewPanelMember
     * @example
     * // Get one InterviewPanelMember
     * const interviewPanelMember = await prisma.interviewPanelMember.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends InterviewPanelMemberFindUniqueOrThrowArgs>(args: SelectSubset<T, InterviewPanelMemberFindUniqueOrThrowArgs<ExtArgs>>): Prisma__InterviewPanelMemberClient<$Result.GetResult<Prisma.$InterviewPanelMemberPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first InterviewPanelMember that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InterviewPanelMemberFindFirstArgs} args - Arguments to find a InterviewPanelMember
     * @example
     * // Get one InterviewPanelMember
     * const interviewPanelMember = await prisma.interviewPanelMember.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends InterviewPanelMemberFindFirstArgs>(args?: SelectSubset<T, InterviewPanelMemberFindFirstArgs<ExtArgs>>): Prisma__InterviewPanelMemberClient<$Result.GetResult<Prisma.$InterviewPanelMemberPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first InterviewPanelMember that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InterviewPanelMemberFindFirstOrThrowArgs} args - Arguments to find a InterviewPanelMember
     * @example
     * // Get one InterviewPanelMember
     * const interviewPanelMember = await prisma.interviewPanelMember.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends InterviewPanelMemberFindFirstOrThrowArgs>(args?: SelectSubset<T, InterviewPanelMemberFindFirstOrThrowArgs<ExtArgs>>): Prisma__InterviewPanelMemberClient<$Result.GetResult<Prisma.$InterviewPanelMemberPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more InterviewPanelMembers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InterviewPanelMemberFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all InterviewPanelMembers
     * const interviewPanelMembers = await prisma.interviewPanelMember.findMany()
     * 
     * // Get first 10 InterviewPanelMembers
     * const interviewPanelMembers = await prisma.interviewPanelMember.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const interviewPanelMemberWithIdOnly = await prisma.interviewPanelMember.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends InterviewPanelMemberFindManyArgs>(args?: SelectSubset<T, InterviewPanelMemberFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InterviewPanelMemberPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a InterviewPanelMember.
     * @param {InterviewPanelMemberCreateArgs} args - Arguments to create a InterviewPanelMember.
     * @example
     * // Create one InterviewPanelMember
     * const InterviewPanelMember = await prisma.interviewPanelMember.create({
     *   data: {
     *     // ... data to create a InterviewPanelMember
     *   }
     * })
     * 
     */
    create<T extends InterviewPanelMemberCreateArgs>(args: SelectSubset<T, InterviewPanelMemberCreateArgs<ExtArgs>>): Prisma__InterviewPanelMemberClient<$Result.GetResult<Prisma.$InterviewPanelMemberPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many InterviewPanelMembers.
     * @param {InterviewPanelMemberCreateManyArgs} args - Arguments to create many InterviewPanelMembers.
     * @example
     * // Create many InterviewPanelMembers
     * const interviewPanelMember = await prisma.interviewPanelMember.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends InterviewPanelMemberCreateManyArgs>(args?: SelectSubset<T, InterviewPanelMemberCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many InterviewPanelMembers and returns the data saved in the database.
     * @param {InterviewPanelMemberCreateManyAndReturnArgs} args - Arguments to create many InterviewPanelMembers.
     * @example
     * // Create many InterviewPanelMembers
     * const interviewPanelMember = await prisma.interviewPanelMember.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many InterviewPanelMembers and only return the `id`
     * const interviewPanelMemberWithIdOnly = await prisma.interviewPanelMember.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends InterviewPanelMemberCreateManyAndReturnArgs>(args?: SelectSubset<T, InterviewPanelMemberCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InterviewPanelMemberPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a InterviewPanelMember.
     * @param {InterviewPanelMemberDeleteArgs} args - Arguments to delete one InterviewPanelMember.
     * @example
     * // Delete one InterviewPanelMember
     * const InterviewPanelMember = await prisma.interviewPanelMember.delete({
     *   where: {
     *     // ... filter to delete one InterviewPanelMember
     *   }
     * })
     * 
     */
    delete<T extends InterviewPanelMemberDeleteArgs>(args: SelectSubset<T, InterviewPanelMemberDeleteArgs<ExtArgs>>): Prisma__InterviewPanelMemberClient<$Result.GetResult<Prisma.$InterviewPanelMemberPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one InterviewPanelMember.
     * @param {InterviewPanelMemberUpdateArgs} args - Arguments to update one InterviewPanelMember.
     * @example
     * // Update one InterviewPanelMember
     * const interviewPanelMember = await prisma.interviewPanelMember.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends InterviewPanelMemberUpdateArgs>(args: SelectSubset<T, InterviewPanelMemberUpdateArgs<ExtArgs>>): Prisma__InterviewPanelMemberClient<$Result.GetResult<Prisma.$InterviewPanelMemberPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more InterviewPanelMembers.
     * @param {InterviewPanelMemberDeleteManyArgs} args - Arguments to filter InterviewPanelMembers to delete.
     * @example
     * // Delete a few InterviewPanelMembers
     * const { count } = await prisma.interviewPanelMember.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends InterviewPanelMemberDeleteManyArgs>(args?: SelectSubset<T, InterviewPanelMemberDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more InterviewPanelMembers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InterviewPanelMemberUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many InterviewPanelMembers
     * const interviewPanelMember = await prisma.interviewPanelMember.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends InterviewPanelMemberUpdateManyArgs>(args: SelectSubset<T, InterviewPanelMemberUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more InterviewPanelMembers and returns the data updated in the database.
     * @param {InterviewPanelMemberUpdateManyAndReturnArgs} args - Arguments to update many InterviewPanelMembers.
     * @example
     * // Update many InterviewPanelMembers
     * const interviewPanelMember = await prisma.interviewPanelMember.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more InterviewPanelMembers and only return the `id`
     * const interviewPanelMemberWithIdOnly = await prisma.interviewPanelMember.updateManyAndReturn({
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
    updateManyAndReturn<T extends InterviewPanelMemberUpdateManyAndReturnArgs>(args: SelectSubset<T, InterviewPanelMemberUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InterviewPanelMemberPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one InterviewPanelMember.
     * @param {InterviewPanelMemberUpsertArgs} args - Arguments to update or create a InterviewPanelMember.
     * @example
     * // Update or create a InterviewPanelMember
     * const interviewPanelMember = await prisma.interviewPanelMember.upsert({
     *   create: {
     *     // ... data to create a InterviewPanelMember
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the InterviewPanelMember we want to update
     *   }
     * })
     */
    upsert<T extends InterviewPanelMemberUpsertArgs>(args: SelectSubset<T, InterviewPanelMemberUpsertArgs<ExtArgs>>): Prisma__InterviewPanelMemberClient<$Result.GetResult<Prisma.$InterviewPanelMemberPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of InterviewPanelMembers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InterviewPanelMemberCountArgs} args - Arguments to filter InterviewPanelMembers to count.
     * @example
     * // Count the number of InterviewPanelMembers
     * const count = await prisma.interviewPanelMember.count({
     *   where: {
     *     // ... the filter for the InterviewPanelMembers we want to count
     *   }
     * })
    **/
    count<T extends InterviewPanelMemberCountArgs>(
      args?: Subset<T, InterviewPanelMemberCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], InterviewPanelMemberCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a InterviewPanelMember.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InterviewPanelMemberAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends InterviewPanelMemberAggregateArgs>(args: Subset<T, InterviewPanelMemberAggregateArgs>): Prisma.PrismaPromise<GetInterviewPanelMemberAggregateType<T>>

    /**
     * Group by InterviewPanelMember.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InterviewPanelMemberGroupByArgs} args - Group by arguments.
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
      T extends InterviewPanelMemberGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: InterviewPanelMemberGroupByArgs['orderBy'] }
        : { orderBy?: InterviewPanelMemberGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, InterviewPanelMemberGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetInterviewPanelMemberGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the InterviewPanelMember model
   */
  readonly fields: InterviewPanelMemberFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for InterviewPanelMember.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__InterviewPanelMemberClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    interview<T extends InterviewDefaultArgs<ExtArgs> = {}>(args?: Subset<T, InterviewDefaultArgs<ExtArgs>>): Prisma__InterviewClient<$Result.GetResult<Prisma.$InterviewPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the InterviewPanelMember model
   */
  interface InterviewPanelMemberFieldRefs {
    readonly id: FieldRef<"InterviewPanelMember", 'String'>
    readonly interviewId: FieldRef<"InterviewPanelMember", 'String'>
    readonly userId: FieldRef<"InterviewPanelMember", 'String'>
    readonly role: FieldRef<"InterviewPanelMember", 'String'>
    readonly isRequired: FieldRef<"InterviewPanelMember", 'Boolean'>
    readonly confirmed: FieldRef<"InterviewPanelMember", 'Boolean'>
    readonly createdAt: FieldRef<"InterviewPanelMember", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * InterviewPanelMember findUnique
   */
  export type InterviewPanelMemberFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewPanelMember
     */
    select?: InterviewPanelMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewPanelMember
     */
    omit?: InterviewPanelMemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewPanelMemberInclude<ExtArgs> | null
    /**
     * Filter, which InterviewPanelMember to fetch.
     */
    where: InterviewPanelMemberWhereUniqueInput
  }

  /**
   * InterviewPanelMember findUniqueOrThrow
   */
  export type InterviewPanelMemberFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewPanelMember
     */
    select?: InterviewPanelMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewPanelMember
     */
    omit?: InterviewPanelMemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewPanelMemberInclude<ExtArgs> | null
    /**
     * Filter, which InterviewPanelMember to fetch.
     */
    where: InterviewPanelMemberWhereUniqueInput
  }

  /**
   * InterviewPanelMember findFirst
   */
  export type InterviewPanelMemberFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewPanelMember
     */
    select?: InterviewPanelMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewPanelMember
     */
    omit?: InterviewPanelMemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewPanelMemberInclude<ExtArgs> | null
    /**
     * Filter, which InterviewPanelMember to fetch.
     */
    where?: InterviewPanelMemberWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InterviewPanelMembers to fetch.
     */
    orderBy?: InterviewPanelMemberOrderByWithRelationInput | InterviewPanelMemberOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for InterviewPanelMembers.
     */
    cursor?: InterviewPanelMemberWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InterviewPanelMembers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InterviewPanelMembers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of InterviewPanelMembers.
     */
    distinct?: InterviewPanelMemberScalarFieldEnum | InterviewPanelMemberScalarFieldEnum[]
  }

  /**
   * InterviewPanelMember findFirstOrThrow
   */
  export type InterviewPanelMemberFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewPanelMember
     */
    select?: InterviewPanelMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewPanelMember
     */
    omit?: InterviewPanelMemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewPanelMemberInclude<ExtArgs> | null
    /**
     * Filter, which InterviewPanelMember to fetch.
     */
    where?: InterviewPanelMemberWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InterviewPanelMembers to fetch.
     */
    orderBy?: InterviewPanelMemberOrderByWithRelationInput | InterviewPanelMemberOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for InterviewPanelMembers.
     */
    cursor?: InterviewPanelMemberWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InterviewPanelMembers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InterviewPanelMembers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of InterviewPanelMembers.
     */
    distinct?: InterviewPanelMemberScalarFieldEnum | InterviewPanelMemberScalarFieldEnum[]
  }

  /**
   * InterviewPanelMember findMany
   */
  export type InterviewPanelMemberFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewPanelMember
     */
    select?: InterviewPanelMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewPanelMember
     */
    omit?: InterviewPanelMemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewPanelMemberInclude<ExtArgs> | null
    /**
     * Filter, which InterviewPanelMembers to fetch.
     */
    where?: InterviewPanelMemberWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InterviewPanelMembers to fetch.
     */
    orderBy?: InterviewPanelMemberOrderByWithRelationInput | InterviewPanelMemberOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing InterviewPanelMembers.
     */
    cursor?: InterviewPanelMemberWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InterviewPanelMembers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InterviewPanelMembers.
     */
    skip?: number
    distinct?: InterviewPanelMemberScalarFieldEnum | InterviewPanelMemberScalarFieldEnum[]
  }

  /**
   * InterviewPanelMember create
   */
  export type InterviewPanelMemberCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewPanelMember
     */
    select?: InterviewPanelMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewPanelMember
     */
    omit?: InterviewPanelMemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewPanelMemberInclude<ExtArgs> | null
    /**
     * The data needed to create a InterviewPanelMember.
     */
    data: XOR<InterviewPanelMemberCreateInput, InterviewPanelMemberUncheckedCreateInput>
  }

  /**
   * InterviewPanelMember createMany
   */
  export type InterviewPanelMemberCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many InterviewPanelMembers.
     */
    data: InterviewPanelMemberCreateManyInput | InterviewPanelMemberCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * InterviewPanelMember createManyAndReturn
   */
  export type InterviewPanelMemberCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewPanelMember
     */
    select?: InterviewPanelMemberSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewPanelMember
     */
    omit?: InterviewPanelMemberOmit<ExtArgs> | null
    /**
     * The data used to create many InterviewPanelMembers.
     */
    data: InterviewPanelMemberCreateManyInput | InterviewPanelMemberCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewPanelMemberIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * InterviewPanelMember update
   */
  export type InterviewPanelMemberUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewPanelMember
     */
    select?: InterviewPanelMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewPanelMember
     */
    omit?: InterviewPanelMemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewPanelMemberInclude<ExtArgs> | null
    /**
     * The data needed to update a InterviewPanelMember.
     */
    data: XOR<InterviewPanelMemberUpdateInput, InterviewPanelMemberUncheckedUpdateInput>
    /**
     * Choose, which InterviewPanelMember to update.
     */
    where: InterviewPanelMemberWhereUniqueInput
  }

  /**
   * InterviewPanelMember updateMany
   */
  export type InterviewPanelMemberUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update InterviewPanelMembers.
     */
    data: XOR<InterviewPanelMemberUpdateManyMutationInput, InterviewPanelMemberUncheckedUpdateManyInput>
    /**
     * Filter which InterviewPanelMembers to update
     */
    where?: InterviewPanelMemberWhereInput
    /**
     * Limit how many InterviewPanelMembers to update.
     */
    limit?: number
  }

  /**
   * InterviewPanelMember updateManyAndReturn
   */
  export type InterviewPanelMemberUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewPanelMember
     */
    select?: InterviewPanelMemberSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewPanelMember
     */
    omit?: InterviewPanelMemberOmit<ExtArgs> | null
    /**
     * The data used to update InterviewPanelMembers.
     */
    data: XOR<InterviewPanelMemberUpdateManyMutationInput, InterviewPanelMemberUncheckedUpdateManyInput>
    /**
     * Filter which InterviewPanelMembers to update
     */
    where?: InterviewPanelMemberWhereInput
    /**
     * Limit how many InterviewPanelMembers to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewPanelMemberIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * InterviewPanelMember upsert
   */
  export type InterviewPanelMemberUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewPanelMember
     */
    select?: InterviewPanelMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewPanelMember
     */
    omit?: InterviewPanelMemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewPanelMemberInclude<ExtArgs> | null
    /**
     * The filter to search for the InterviewPanelMember to update in case it exists.
     */
    where: InterviewPanelMemberWhereUniqueInput
    /**
     * In case the InterviewPanelMember found by the `where` argument doesn't exist, create a new InterviewPanelMember with this data.
     */
    create: XOR<InterviewPanelMemberCreateInput, InterviewPanelMemberUncheckedCreateInput>
    /**
     * In case the InterviewPanelMember was found with the provided `where` argument, update it with this data.
     */
    update: XOR<InterviewPanelMemberUpdateInput, InterviewPanelMemberUncheckedUpdateInput>
  }

  /**
   * InterviewPanelMember delete
   */
  export type InterviewPanelMemberDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewPanelMember
     */
    select?: InterviewPanelMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewPanelMember
     */
    omit?: InterviewPanelMemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewPanelMemberInclude<ExtArgs> | null
    /**
     * Filter which InterviewPanelMember to delete.
     */
    where: InterviewPanelMemberWhereUniqueInput
  }

  /**
   * InterviewPanelMember deleteMany
   */
  export type InterviewPanelMemberDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which InterviewPanelMembers to delete
     */
    where?: InterviewPanelMemberWhereInput
    /**
     * Limit how many InterviewPanelMembers to delete.
     */
    limit?: number
  }

  /**
   * InterviewPanelMember without action
   */
  export type InterviewPanelMemberDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewPanelMember
     */
    select?: InterviewPanelMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewPanelMember
     */
    omit?: InterviewPanelMemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InterviewPanelMemberInclude<ExtArgs> | null
  }


  /**
   * Model InterviewArtifact
   */

  export type AggregateInterviewArtifact = {
    _count: InterviewArtifactCountAggregateOutputType | null
    _min: InterviewArtifactMinAggregateOutputType | null
    _max: InterviewArtifactMaxAggregateOutputType | null
  }

  export type InterviewArtifactMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    interviewId: string | null
    roundId: string | null
    notesText: string | null
    code: string | null
    codeLanguage: string | null
    whiteboardImageKey: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type InterviewArtifactMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    interviewId: string | null
    roundId: string | null
    notesText: string | null
    code: string | null
    codeLanguage: string | null
    whiteboardImageKey: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type InterviewArtifactCountAggregateOutputType = {
    id: number
    tenantId: number
    interviewId: number
    roundId: number
    notes: number
    notesText: number
    code: number
    codeLanguage: number
    whiteboard: number
    whiteboardImageKey: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type InterviewArtifactMinAggregateInputType = {
    id?: true
    tenantId?: true
    interviewId?: true
    roundId?: true
    notesText?: true
    code?: true
    codeLanguage?: true
    whiteboardImageKey?: true
    createdAt?: true
    updatedAt?: true
  }

  export type InterviewArtifactMaxAggregateInputType = {
    id?: true
    tenantId?: true
    interviewId?: true
    roundId?: true
    notesText?: true
    code?: true
    codeLanguage?: true
    whiteboardImageKey?: true
    createdAt?: true
    updatedAt?: true
  }

  export type InterviewArtifactCountAggregateInputType = {
    id?: true
    tenantId?: true
    interviewId?: true
    roundId?: true
    notes?: true
    notesText?: true
    code?: true
    codeLanguage?: true
    whiteboard?: true
    whiteboardImageKey?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type InterviewArtifactAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which InterviewArtifact to aggregate.
     */
    where?: InterviewArtifactWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InterviewArtifacts to fetch.
     */
    orderBy?: InterviewArtifactOrderByWithRelationInput | InterviewArtifactOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: InterviewArtifactWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InterviewArtifacts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InterviewArtifacts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned InterviewArtifacts
    **/
    _count?: true | InterviewArtifactCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: InterviewArtifactMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: InterviewArtifactMaxAggregateInputType
  }

  export type GetInterviewArtifactAggregateType<T extends InterviewArtifactAggregateArgs> = {
        [P in keyof T & keyof AggregateInterviewArtifact]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateInterviewArtifact[P]>
      : GetScalarType<T[P], AggregateInterviewArtifact[P]>
  }




  export type InterviewArtifactGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InterviewArtifactWhereInput
    orderBy?: InterviewArtifactOrderByWithAggregationInput | InterviewArtifactOrderByWithAggregationInput[]
    by: InterviewArtifactScalarFieldEnum[] | InterviewArtifactScalarFieldEnum
    having?: InterviewArtifactScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: InterviewArtifactCountAggregateInputType | true
    _min?: InterviewArtifactMinAggregateInputType
    _max?: InterviewArtifactMaxAggregateInputType
  }

  export type InterviewArtifactGroupByOutputType = {
    id: string
    tenantId: string
    interviewId: string
    roundId: string | null
    notes: JsonValue | null
    notesText: string | null
    code: string | null
    codeLanguage: string
    whiteboard: JsonValue | null
    whiteboardImageKey: string | null
    createdAt: Date
    updatedAt: Date
    _count: InterviewArtifactCountAggregateOutputType | null
    _min: InterviewArtifactMinAggregateOutputType | null
    _max: InterviewArtifactMaxAggregateOutputType | null
  }

  type GetInterviewArtifactGroupByPayload<T extends InterviewArtifactGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<InterviewArtifactGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof InterviewArtifactGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], InterviewArtifactGroupByOutputType[P]>
            : GetScalarType<T[P], InterviewArtifactGroupByOutputType[P]>
        }
      >
    >


  export type InterviewArtifactSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    interviewId?: boolean
    roundId?: boolean
    notes?: boolean
    notesText?: boolean
    code?: boolean
    codeLanguage?: boolean
    whiteboard?: boolean
    whiteboardImageKey?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["interviewArtifact"]>

  export type InterviewArtifactSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    interviewId?: boolean
    roundId?: boolean
    notes?: boolean
    notesText?: boolean
    code?: boolean
    codeLanguage?: boolean
    whiteboard?: boolean
    whiteboardImageKey?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["interviewArtifact"]>

  export type InterviewArtifactSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    interviewId?: boolean
    roundId?: boolean
    notes?: boolean
    notesText?: boolean
    code?: boolean
    codeLanguage?: boolean
    whiteboard?: boolean
    whiteboardImageKey?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["interviewArtifact"]>

  export type InterviewArtifactSelectScalar = {
    id?: boolean
    tenantId?: boolean
    interviewId?: boolean
    roundId?: boolean
    notes?: boolean
    notesText?: boolean
    code?: boolean
    codeLanguage?: boolean
    whiteboard?: boolean
    whiteboardImageKey?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type InterviewArtifactOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "interviewId" | "roundId" | "notes" | "notesText" | "code" | "codeLanguage" | "whiteboard" | "whiteboardImageKey" | "createdAt" | "updatedAt", ExtArgs["result"]["interviewArtifact"]>

  export type $InterviewArtifactPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "InterviewArtifact"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      interviewId: string
      roundId: string | null
      notes: Prisma.JsonValue | null
      notesText: string | null
      code: string | null
      codeLanguage: string
      whiteboard: Prisma.JsonValue | null
      whiteboardImageKey: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["interviewArtifact"]>
    composites: {}
  }

  type InterviewArtifactGetPayload<S extends boolean | null | undefined | InterviewArtifactDefaultArgs> = $Result.GetResult<Prisma.$InterviewArtifactPayload, S>

  type InterviewArtifactCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<InterviewArtifactFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: InterviewArtifactCountAggregateInputType | true
    }

  export interface InterviewArtifactDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['InterviewArtifact'], meta: { name: 'InterviewArtifact' } }
    /**
     * Find zero or one InterviewArtifact that matches the filter.
     * @param {InterviewArtifactFindUniqueArgs} args - Arguments to find a InterviewArtifact
     * @example
     * // Get one InterviewArtifact
     * const interviewArtifact = await prisma.interviewArtifact.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends InterviewArtifactFindUniqueArgs>(args: SelectSubset<T, InterviewArtifactFindUniqueArgs<ExtArgs>>): Prisma__InterviewArtifactClient<$Result.GetResult<Prisma.$InterviewArtifactPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one InterviewArtifact that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {InterviewArtifactFindUniqueOrThrowArgs} args - Arguments to find a InterviewArtifact
     * @example
     * // Get one InterviewArtifact
     * const interviewArtifact = await prisma.interviewArtifact.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends InterviewArtifactFindUniqueOrThrowArgs>(args: SelectSubset<T, InterviewArtifactFindUniqueOrThrowArgs<ExtArgs>>): Prisma__InterviewArtifactClient<$Result.GetResult<Prisma.$InterviewArtifactPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first InterviewArtifact that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InterviewArtifactFindFirstArgs} args - Arguments to find a InterviewArtifact
     * @example
     * // Get one InterviewArtifact
     * const interviewArtifact = await prisma.interviewArtifact.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends InterviewArtifactFindFirstArgs>(args?: SelectSubset<T, InterviewArtifactFindFirstArgs<ExtArgs>>): Prisma__InterviewArtifactClient<$Result.GetResult<Prisma.$InterviewArtifactPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first InterviewArtifact that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InterviewArtifactFindFirstOrThrowArgs} args - Arguments to find a InterviewArtifact
     * @example
     * // Get one InterviewArtifact
     * const interviewArtifact = await prisma.interviewArtifact.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends InterviewArtifactFindFirstOrThrowArgs>(args?: SelectSubset<T, InterviewArtifactFindFirstOrThrowArgs<ExtArgs>>): Prisma__InterviewArtifactClient<$Result.GetResult<Prisma.$InterviewArtifactPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more InterviewArtifacts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InterviewArtifactFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all InterviewArtifacts
     * const interviewArtifacts = await prisma.interviewArtifact.findMany()
     * 
     * // Get first 10 InterviewArtifacts
     * const interviewArtifacts = await prisma.interviewArtifact.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const interviewArtifactWithIdOnly = await prisma.interviewArtifact.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends InterviewArtifactFindManyArgs>(args?: SelectSubset<T, InterviewArtifactFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InterviewArtifactPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a InterviewArtifact.
     * @param {InterviewArtifactCreateArgs} args - Arguments to create a InterviewArtifact.
     * @example
     * // Create one InterviewArtifact
     * const InterviewArtifact = await prisma.interviewArtifact.create({
     *   data: {
     *     // ... data to create a InterviewArtifact
     *   }
     * })
     * 
     */
    create<T extends InterviewArtifactCreateArgs>(args: SelectSubset<T, InterviewArtifactCreateArgs<ExtArgs>>): Prisma__InterviewArtifactClient<$Result.GetResult<Prisma.$InterviewArtifactPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many InterviewArtifacts.
     * @param {InterviewArtifactCreateManyArgs} args - Arguments to create many InterviewArtifacts.
     * @example
     * // Create many InterviewArtifacts
     * const interviewArtifact = await prisma.interviewArtifact.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends InterviewArtifactCreateManyArgs>(args?: SelectSubset<T, InterviewArtifactCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many InterviewArtifacts and returns the data saved in the database.
     * @param {InterviewArtifactCreateManyAndReturnArgs} args - Arguments to create many InterviewArtifacts.
     * @example
     * // Create many InterviewArtifacts
     * const interviewArtifact = await prisma.interviewArtifact.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many InterviewArtifacts and only return the `id`
     * const interviewArtifactWithIdOnly = await prisma.interviewArtifact.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends InterviewArtifactCreateManyAndReturnArgs>(args?: SelectSubset<T, InterviewArtifactCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InterviewArtifactPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a InterviewArtifact.
     * @param {InterviewArtifactDeleteArgs} args - Arguments to delete one InterviewArtifact.
     * @example
     * // Delete one InterviewArtifact
     * const InterviewArtifact = await prisma.interviewArtifact.delete({
     *   where: {
     *     // ... filter to delete one InterviewArtifact
     *   }
     * })
     * 
     */
    delete<T extends InterviewArtifactDeleteArgs>(args: SelectSubset<T, InterviewArtifactDeleteArgs<ExtArgs>>): Prisma__InterviewArtifactClient<$Result.GetResult<Prisma.$InterviewArtifactPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one InterviewArtifact.
     * @param {InterviewArtifactUpdateArgs} args - Arguments to update one InterviewArtifact.
     * @example
     * // Update one InterviewArtifact
     * const interviewArtifact = await prisma.interviewArtifact.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends InterviewArtifactUpdateArgs>(args: SelectSubset<T, InterviewArtifactUpdateArgs<ExtArgs>>): Prisma__InterviewArtifactClient<$Result.GetResult<Prisma.$InterviewArtifactPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more InterviewArtifacts.
     * @param {InterviewArtifactDeleteManyArgs} args - Arguments to filter InterviewArtifacts to delete.
     * @example
     * // Delete a few InterviewArtifacts
     * const { count } = await prisma.interviewArtifact.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends InterviewArtifactDeleteManyArgs>(args?: SelectSubset<T, InterviewArtifactDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more InterviewArtifacts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InterviewArtifactUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many InterviewArtifacts
     * const interviewArtifact = await prisma.interviewArtifact.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends InterviewArtifactUpdateManyArgs>(args: SelectSubset<T, InterviewArtifactUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more InterviewArtifacts and returns the data updated in the database.
     * @param {InterviewArtifactUpdateManyAndReturnArgs} args - Arguments to update many InterviewArtifacts.
     * @example
     * // Update many InterviewArtifacts
     * const interviewArtifact = await prisma.interviewArtifact.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more InterviewArtifacts and only return the `id`
     * const interviewArtifactWithIdOnly = await prisma.interviewArtifact.updateManyAndReturn({
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
    updateManyAndReturn<T extends InterviewArtifactUpdateManyAndReturnArgs>(args: SelectSubset<T, InterviewArtifactUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InterviewArtifactPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one InterviewArtifact.
     * @param {InterviewArtifactUpsertArgs} args - Arguments to update or create a InterviewArtifact.
     * @example
     * // Update or create a InterviewArtifact
     * const interviewArtifact = await prisma.interviewArtifact.upsert({
     *   create: {
     *     // ... data to create a InterviewArtifact
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the InterviewArtifact we want to update
     *   }
     * })
     */
    upsert<T extends InterviewArtifactUpsertArgs>(args: SelectSubset<T, InterviewArtifactUpsertArgs<ExtArgs>>): Prisma__InterviewArtifactClient<$Result.GetResult<Prisma.$InterviewArtifactPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of InterviewArtifacts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InterviewArtifactCountArgs} args - Arguments to filter InterviewArtifacts to count.
     * @example
     * // Count the number of InterviewArtifacts
     * const count = await prisma.interviewArtifact.count({
     *   where: {
     *     // ... the filter for the InterviewArtifacts we want to count
     *   }
     * })
    **/
    count<T extends InterviewArtifactCountArgs>(
      args?: Subset<T, InterviewArtifactCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], InterviewArtifactCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a InterviewArtifact.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InterviewArtifactAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends InterviewArtifactAggregateArgs>(args: Subset<T, InterviewArtifactAggregateArgs>): Prisma.PrismaPromise<GetInterviewArtifactAggregateType<T>>

    /**
     * Group by InterviewArtifact.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InterviewArtifactGroupByArgs} args - Group by arguments.
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
      T extends InterviewArtifactGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: InterviewArtifactGroupByArgs['orderBy'] }
        : { orderBy?: InterviewArtifactGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, InterviewArtifactGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetInterviewArtifactGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the InterviewArtifact model
   */
  readonly fields: InterviewArtifactFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for InterviewArtifact.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__InterviewArtifactClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the InterviewArtifact model
   */
  interface InterviewArtifactFieldRefs {
    readonly id: FieldRef<"InterviewArtifact", 'String'>
    readonly tenantId: FieldRef<"InterviewArtifact", 'String'>
    readonly interviewId: FieldRef<"InterviewArtifact", 'String'>
    readonly roundId: FieldRef<"InterviewArtifact", 'String'>
    readonly notes: FieldRef<"InterviewArtifact", 'Json'>
    readonly notesText: FieldRef<"InterviewArtifact", 'String'>
    readonly code: FieldRef<"InterviewArtifact", 'String'>
    readonly codeLanguage: FieldRef<"InterviewArtifact", 'String'>
    readonly whiteboard: FieldRef<"InterviewArtifact", 'Json'>
    readonly whiteboardImageKey: FieldRef<"InterviewArtifact", 'String'>
    readonly createdAt: FieldRef<"InterviewArtifact", 'DateTime'>
    readonly updatedAt: FieldRef<"InterviewArtifact", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * InterviewArtifact findUnique
   */
  export type InterviewArtifactFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewArtifact
     */
    select?: InterviewArtifactSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewArtifact
     */
    omit?: InterviewArtifactOmit<ExtArgs> | null
    /**
     * Filter, which InterviewArtifact to fetch.
     */
    where: InterviewArtifactWhereUniqueInput
  }

  /**
   * InterviewArtifact findUniqueOrThrow
   */
  export type InterviewArtifactFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewArtifact
     */
    select?: InterviewArtifactSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewArtifact
     */
    omit?: InterviewArtifactOmit<ExtArgs> | null
    /**
     * Filter, which InterviewArtifact to fetch.
     */
    where: InterviewArtifactWhereUniqueInput
  }

  /**
   * InterviewArtifact findFirst
   */
  export type InterviewArtifactFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewArtifact
     */
    select?: InterviewArtifactSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewArtifact
     */
    omit?: InterviewArtifactOmit<ExtArgs> | null
    /**
     * Filter, which InterviewArtifact to fetch.
     */
    where?: InterviewArtifactWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InterviewArtifacts to fetch.
     */
    orderBy?: InterviewArtifactOrderByWithRelationInput | InterviewArtifactOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for InterviewArtifacts.
     */
    cursor?: InterviewArtifactWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InterviewArtifacts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InterviewArtifacts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of InterviewArtifacts.
     */
    distinct?: InterviewArtifactScalarFieldEnum | InterviewArtifactScalarFieldEnum[]
  }

  /**
   * InterviewArtifact findFirstOrThrow
   */
  export type InterviewArtifactFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewArtifact
     */
    select?: InterviewArtifactSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewArtifact
     */
    omit?: InterviewArtifactOmit<ExtArgs> | null
    /**
     * Filter, which InterviewArtifact to fetch.
     */
    where?: InterviewArtifactWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InterviewArtifacts to fetch.
     */
    orderBy?: InterviewArtifactOrderByWithRelationInput | InterviewArtifactOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for InterviewArtifacts.
     */
    cursor?: InterviewArtifactWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InterviewArtifacts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InterviewArtifacts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of InterviewArtifacts.
     */
    distinct?: InterviewArtifactScalarFieldEnum | InterviewArtifactScalarFieldEnum[]
  }

  /**
   * InterviewArtifact findMany
   */
  export type InterviewArtifactFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewArtifact
     */
    select?: InterviewArtifactSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewArtifact
     */
    omit?: InterviewArtifactOmit<ExtArgs> | null
    /**
     * Filter, which InterviewArtifacts to fetch.
     */
    where?: InterviewArtifactWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InterviewArtifacts to fetch.
     */
    orderBy?: InterviewArtifactOrderByWithRelationInput | InterviewArtifactOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing InterviewArtifacts.
     */
    cursor?: InterviewArtifactWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InterviewArtifacts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InterviewArtifacts.
     */
    skip?: number
    distinct?: InterviewArtifactScalarFieldEnum | InterviewArtifactScalarFieldEnum[]
  }

  /**
   * InterviewArtifact create
   */
  export type InterviewArtifactCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewArtifact
     */
    select?: InterviewArtifactSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewArtifact
     */
    omit?: InterviewArtifactOmit<ExtArgs> | null
    /**
     * The data needed to create a InterviewArtifact.
     */
    data: XOR<InterviewArtifactCreateInput, InterviewArtifactUncheckedCreateInput>
  }

  /**
   * InterviewArtifact createMany
   */
  export type InterviewArtifactCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many InterviewArtifacts.
     */
    data: InterviewArtifactCreateManyInput | InterviewArtifactCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * InterviewArtifact createManyAndReturn
   */
  export type InterviewArtifactCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewArtifact
     */
    select?: InterviewArtifactSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewArtifact
     */
    omit?: InterviewArtifactOmit<ExtArgs> | null
    /**
     * The data used to create many InterviewArtifacts.
     */
    data: InterviewArtifactCreateManyInput | InterviewArtifactCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * InterviewArtifact update
   */
  export type InterviewArtifactUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewArtifact
     */
    select?: InterviewArtifactSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewArtifact
     */
    omit?: InterviewArtifactOmit<ExtArgs> | null
    /**
     * The data needed to update a InterviewArtifact.
     */
    data: XOR<InterviewArtifactUpdateInput, InterviewArtifactUncheckedUpdateInput>
    /**
     * Choose, which InterviewArtifact to update.
     */
    where: InterviewArtifactWhereUniqueInput
  }

  /**
   * InterviewArtifact updateMany
   */
  export type InterviewArtifactUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update InterviewArtifacts.
     */
    data: XOR<InterviewArtifactUpdateManyMutationInput, InterviewArtifactUncheckedUpdateManyInput>
    /**
     * Filter which InterviewArtifacts to update
     */
    where?: InterviewArtifactWhereInput
    /**
     * Limit how many InterviewArtifacts to update.
     */
    limit?: number
  }

  /**
   * InterviewArtifact updateManyAndReturn
   */
  export type InterviewArtifactUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewArtifact
     */
    select?: InterviewArtifactSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewArtifact
     */
    omit?: InterviewArtifactOmit<ExtArgs> | null
    /**
     * The data used to update InterviewArtifacts.
     */
    data: XOR<InterviewArtifactUpdateManyMutationInput, InterviewArtifactUncheckedUpdateManyInput>
    /**
     * Filter which InterviewArtifacts to update
     */
    where?: InterviewArtifactWhereInput
    /**
     * Limit how many InterviewArtifacts to update.
     */
    limit?: number
  }

  /**
   * InterviewArtifact upsert
   */
  export type InterviewArtifactUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewArtifact
     */
    select?: InterviewArtifactSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewArtifact
     */
    omit?: InterviewArtifactOmit<ExtArgs> | null
    /**
     * The filter to search for the InterviewArtifact to update in case it exists.
     */
    where: InterviewArtifactWhereUniqueInput
    /**
     * In case the InterviewArtifact found by the `where` argument doesn't exist, create a new InterviewArtifact with this data.
     */
    create: XOR<InterviewArtifactCreateInput, InterviewArtifactUncheckedCreateInput>
    /**
     * In case the InterviewArtifact was found with the provided `where` argument, update it with this data.
     */
    update: XOR<InterviewArtifactUpdateInput, InterviewArtifactUncheckedUpdateInput>
  }

  /**
   * InterviewArtifact delete
   */
  export type InterviewArtifactDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewArtifact
     */
    select?: InterviewArtifactSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewArtifact
     */
    omit?: InterviewArtifactOmit<ExtArgs> | null
    /**
     * Filter which InterviewArtifact to delete.
     */
    where: InterviewArtifactWhereUniqueInput
  }

  /**
   * InterviewArtifact deleteMany
   */
  export type InterviewArtifactDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which InterviewArtifacts to delete
     */
    where?: InterviewArtifactWhereInput
    /**
     * Limit how many InterviewArtifacts to delete.
     */
    limit?: number
  }

  /**
   * InterviewArtifact without action
   */
  export type InterviewArtifactDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InterviewArtifact
     */
    select?: InterviewArtifactSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InterviewArtifact
     */
    omit?: InterviewArtifactOmit<ExtArgs> | null
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


  export const InterviewScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    requisitionId: 'requisitionId',
    candidateId: 'candidateId',
    applicationId: 'applicationId',
    type: 'type',
    stage: 'stage',
    status: 'status',
    scheduledAt: 'scheduledAt',
    duration: 'duration',
    location: 'location',
    meetingUrl: 'meetingUrl',
    roundId: 'roundId',
    roundNumber: 'roundNumber',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type InterviewScalarFieldEnum = (typeof InterviewScalarFieldEnum)[keyof typeof InterviewScalarFieldEnum]


  export const InterviewRoundScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    requisitionId: 'requisitionId',
    name: 'name',
    order: 'order',
    interviewType: 'interviewType',
    durationMinutes: 'durationMinutes',
    instructions: 'instructions',
    autoAdvanceOnPass: 'autoAdvanceOnPass',
    defaultPanelistRole: 'defaultPanelistRole',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type InterviewRoundScalarFieldEnum = (typeof InterviewRoundScalarFieldEnum)[keyof typeof InterviewRoundScalarFieldEnum]


  export const InterviewFeedbackScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    interviewId: 'interviewId',
    interviewerId: 'interviewerId',
    candidateId: 'candidateId',
    overallRating: 'overallRating',
    recommendation: 'recommendation',
    strengths: 'strengths',
    concerns: 'concerns',
    notes: 'notes',
    submittedAt: 'submittedAt'
  };

  export type InterviewFeedbackScalarFieldEnum = (typeof InterviewFeedbackScalarFieldEnum)[keyof typeof InterviewFeedbackScalarFieldEnum]


  export const InterviewPanelMemberScalarFieldEnum: {
    id: 'id',
    interviewId: 'interviewId',
    userId: 'userId',
    role: 'role',
    isRequired: 'isRequired',
    confirmed: 'confirmed',
    createdAt: 'createdAt'
  };

  export type InterviewPanelMemberScalarFieldEnum = (typeof InterviewPanelMemberScalarFieldEnum)[keyof typeof InterviewPanelMemberScalarFieldEnum]


  export const InterviewArtifactScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    interviewId: 'interviewId',
    roundId: 'roundId',
    notes: 'notes',
    notesText: 'notesText',
    code: 'code',
    codeLanguage: 'codeLanguage',
    whiteboard: 'whiteboard',
    whiteboardImageKey: 'whiteboardImageKey',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type InterviewArtifactScalarFieldEnum = (typeof InterviewArtifactScalarFieldEnum)[keyof typeof InterviewArtifactScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


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
   * Reference to a field of type 'InterviewType'
   */
  export type EnumInterviewTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'InterviewType'>
    


  /**
   * Reference to a field of type 'InterviewType[]'
   */
  export type ListEnumInterviewTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'InterviewType[]'>
    


  /**
   * Reference to a field of type 'InterviewStatus'
   */
  export type EnumInterviewStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'InterviewStatus'>
    


  /**
   * Reference to a field of type 'InterviewStatus[]'
   */
  export type ListEnumInterviewStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'InterviewStatus[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


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
   * Reference to a field of type 'InterviewRecommendation'
   */
  export type EnumInterviewRecommendationFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'InterviewRecommendation'>
    


  /**
   * Reference to a field of type 'InterviewRecommendation[]'
   */
  export type ListEnumInterviewRecommendationFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'InterviewRecommendation[]'>
    


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


  export type InterviewWhereInput = {
    AND?: InterviewWhereInput | InterviewWhereInput[]
    OR?: InterviewWhereInput[]
    NOT?: InterviewWhereInput | InterviewWhereInput[]
    id?: StringFilter<"Interview"> | string
    tenantId?: StringFilter<"Interview"> | string
    requisitionId?: StringFilter<"Interview"> | string
    candidateId?: StringFilter<"Interview"> | string
    applicationId?: StringNullableFilter<"Interview"> | string | null
    type?: EnumInterviewTypeNullableFilter<"Interview"> | $Enums.InterviewType | null
    stage?: StringFilter<"Interview"> | string
    status?: EnumInterviewStatusFilter<"Interview"> | $Enums.InterviewStatus
    scheduledAt?: DateTimeNullableFilter<"Interview"> | Date | string | null
    duration?: IntFilter<"Interview"> | number
    location?: StringNullableFilter<"Interview"> | string | null
    meetingUrl?: StringNullableFilter<"Interview"> | string | null
    roundId?: StringNullableFilter<"Interview"> | string | null
    roundNumber?: IntNullableFilter<"Interview"> | number | null
    createdAt?: DateTimeFilter<"Interview"> | Date | string
    updatedAt?: DateTimeFilter<"Interview"> | Date | string
    round?: XOR<InterviewRoundNullableScalarRelationFilter, InterviewRoundWhereInput> | null
    panelMembers?: InterviewPanelMemberListRelationFilter
    feedback?: InterviewFeedbackListRelationFilter
  }

  export type InterviewOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    requisitionId?: SortOrder
    candidateId?: SortOrder
    applicationId?: SortOrderInput | SortOrder
    type?: SortOrderInput | SortOrder
    stage?: SortOrder
    status?: SortOrder
    scheduledAt?: SortOrderInput | SortOrder
    duration?: SortOrder
    location?: SortOrderInput | SortOrder
    meetingUrl?: SortOrderInput | SortOrder
    roundId?: SortOrderInput | SortOrder
    roundNumber?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    round?: InterviewRoundOrderByWithRelationInput
    panelMembers?: InterviewPanelMemberOrderByRelationAggregateInput
    feedback?: InterviewFeedbackOrderByRelationAggregateInput
  }

  export type InterviewWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: InterviewWhereInput | InterviewWhereInput[]
    OR?: InterviewWhereInput[]
    NOT?: InterviewWhereInput | InterviewWhereInput[]
    tenantId?: StringFilter<"Interview"> | string
    requisitionId?: StringFilter<"Interview"> | string
    candidateId?: StringFilter<"Interview"> | string
    applicationId?: StringNullableFilter<"Interview"> | string | null
    type?: EnumInterviewTypeNullableFilter<"Interview"> | $Enums.InterviewType | null
    stage?: StringFilter<"Interview"> | string
    status?: EnumInterviewStatusFilter<"Interview"> | $Enums.InterviewStatus
    scheduledAt?: DateTimeNullableFilter<"Interview"> | Date | string | null
    duration?: IntFilter<"Interview"> | number
    location?: StringNullableFilter<"Interview"> | string | null
    meetingUrl?: StringNullableFilter<"Interview"> | string | null
    roundId?: StringNullableFilter<"Interview"> | string | null
    roundNumber?: IntNullableFilter<"Interview"> | number | null
    createdAt?: DateTimeFilter<"Interview"> | Date | string
    updatedAt?: DateTimeFilter<"Interview"> | Date | string
    round?: XOR<InterviewRoundNullableScalarRelationFilter, InterviewRoundWhereInput> | null
    panelMembers?: InterviewPanelMemberListRelationFilter
    feedback?: InterviewFeedbackListRelationFilter
  }, "id">

  export type InterviewOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    requisitionId?: SortOrder
    candidateId?: SortOrder
    applicationId?: SortOrderInput | SortOrder
    type?: SortOrderInput | SortOrder
    stage?: SortOrder
    status?: SortOrder
    scheduledAt?: SortOrderInput | SortOrder
    duration?: SortOrder
    location?: SortOrderInput | SortOrder
    meetingUrl?: SortOrderInput | SortOrder
    roundId?: SortOrderInput | SortOrder
    roundNumber?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: InterviewCountOrderByAggregateInput
    _avg?: InterviewAvgOrderByAggregateInput
    _max?: InterviewMaxOrderByAggregateInput
    _min?: InterviewMinOrderByAggregateInput
    _sum?: InterviewSumOrderByAggregateInput
  }

  export type InterviewScalarWhereWithAggregatesInput = {
    AND?: InterviewScalarWhereWithAggregatesInput | InterviewScalarWhereWithAggregatesInput[]
    OR?: InterviewScalarWhereWithAggregatesInput[]
    NOT?: InterviewScalarWhereWithAggregatesInput | InterviewScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Interview"> | string
    tenantId?: StringWithAggregatesFilter<"Interview"> | string
    requisitionId?: StringWithAggregatesFilter<"Interview"> | string
    candidateId?: StringWithAggregatesFilter<"Interview"> | string
    applicationId?: StringNullableWithAggregatesFilter<"Interview"> | string | null
    type?: EnumInterviewTypeNullableWithAggregatesFilter<"Interview"> | $Enums.InterviewType | null
    stage?: StringWithAggregatesFilter<"Interview"> | string
    status?: EnumInterviewStatusWithAggregatesFilter<"Interview"> | $Enums.InterviewStatus
    scheduledAt?: DateTimeNullableWithAggregatesFilter<"Interview"> | Date | string | null
    duration?: IntWithAggregatesFilter<"Interview"> | number
    location?: StringNullableWithAggregatesFilter<"Interview"> | string | null
    meetingUrl?: StringNullableWithAggregatesFilter<"Interview"> | string | null
    roundId?: StringNullableWithAggregatesFilter<"Interview"> | string | null
    roundNumber?: IntNullableWithAggregatesFilter<"Interview"> | number | null
    createdAt?: DateTimeWithAggregatesFilter<"Interview"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Interview"> | Date | string
  }

  export type InterviewRoundWhereInput = {
    AND?: InterviewRoundWhereInput | InterviewRoundWhereInput[]
    OR?: InterviewRoundWhereInput[]
    NOT?: InterviewRoundWhereInput | InterviewRoundWhereInput[]
    id?: StringFilter<"InterviewRound"> | string
    tenantId?: StringFilter<"InterviewRound"> | string
    requisitionId?: StringNullableFilter<"InterviewRound"> | string | null
    name?: StringFilter<"InterviewRound"> | string
    order?: IntFilter<"InterviewRound"> | number
    interviewType?: EnumInterviewTypeFilter<"InterviewRound"> | $Enums.InterviewType
    durationMinutes?: IntFilter<"InterviewRound"> | number
    instructions?: StringNullableFilter<"InterviewRound"> | string | null
    autoAdvanceOnPass?: BoolFilter<"InterviewRound"> | boolean
    defaultPanelistRole?: StringNullableFilter<"InterviewRound"> | string | null
    createdAt?: DateTimeFilter<"InterviewRound"> | Date | string
    updatedAt?: DateTimeFilter<"InterviewRound"> | Date | string
    interviews?: InterviewListRelationFilter
  }

  export type InterviewRoundOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    requisitionId?: SortOrderInput | SortOrder
    name?: SortOrder
    order?: SortOrder
    interviewType?: SortOrder
    durationMinutes?: SortOrder
    instructions?: SortOrderInput | SortOrder
    autoAdvanceOnPass?: SortOrder
    defaultPanelistRole?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    interviews?: InterviewOrderByRelationAggregateInput
  }

  export type InterviewRoundWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    requisitionId_order?: InterviewRoundRequisitionIdOrderCompoundUniqueInput
    AND?: InterviewRoundWhereInput | InterviewRoundWhereInput[]
    OR?: InterviewRoundWhereInput[]
    NOT?: InterviewRoundWhereInput | InterviewRoundWhereInput[]
    tenantId?: StringFilter<"InterviewRound"> | string
    requisitionId?: StringNullableFilter<"InterviewRound"> | string | null
    name?: StringFilter<"InterviewRound"> | string
    order?: IntFilter<"InterviewRound"> | number
    interviewType?: EnumInterviewTypeFilter<"InterviewRound"> | $Enums.InterviewType
    durationMinutes?: IntFilter<"InterviewRound"> | number
    instructions?: StringNullableFilter<"InterviewRound"> | string | null
    autoAdvanceOnPass?: BoolFilter<"InterviewRound"> | boolean
    defaultPanelistRole?: StringNullableFilter<"InterviewRound"> | string | null
    createdAt?: DateTimeFilter<"InterviewRound"> | Date | string
    updatedAt?: DateTimeFilter<"InterviewRound"> | Date | string
    interviews?: InterviewListRelationFilter
  }, "id" | "requisitionId_order">

  export type InterviewRoundOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    requisitionId?: SortOrderInput | SortOrder
    name?: SortOrder
    order?: SortOrder
    interviewType?: SortOrder
    durationMinutes?: SortOrder
    instructions?: SortOrderInput | SortOrder
    autoAdvanceOnPass?: SortOrder
    defaultPanelistRole?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: InterviewRoundCountOrderByAggregateInput
    _avg?: InterviewRoundAvgOrderByAggregateInput
    _max?: InterviewRoundMaxOrderByAggregateInput
    _min?: InterviewRoundMinOrderByAggregateInput
    _sum?: InterviewRoundSumOrderByAggregateInput
  }

  export type InterviewRoundScalarWhereWithAggregatesInput = {
    AND?: InterviewRoundScalarWhereWithAggregatesInput | InterviewRoundScalarWhereWithAggregatesInput[]
    OR?: InterviewRoundScalarWhereWithAggregatesInput[]
    NOT?: InterviewRoundScalarWhereWithAggregatesInput | InterviewRoundScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"InterviewRound"> | string
    tenantId?: StringWithAggregatesFilter<"InterviewRound"> | string
    requisitionId?: StringNullableWithAggregatesFilter<"InterviewRound"> | string | null
    name?: StringWithAggregatesFilter<"InterviewRound"> | string
    order?: IntWithAggregatesFilter<"InterviewRound"> | number
    interviewType?: EnumInterviewTypeWithAggregatesFilter<"InterviewRound"> | $Enums.InterviewType
    durationMinutes?: IntWithAggregatesFilter<"InterviewRound"> | number
    instructions?: StringNullableWithAggregatesFilter<"InterviewRound"> | string | null
    autoAdvanceOnPass?: BoolWithAggregatesFilter<"InterviewRound"> | boolean
    defaultPanelistRole?: StringNullableWithAggregatesFilter<"InterviewRound"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"InterviewRound"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"InterviewRound"> | Date | string
  }

  export type InterviewFeedbackWhereInput = {
    AND?: InterviewFeedbackWhereInput | InterviewFeedbackWhereInput[]
    OR?: InterviewFeedbackWhereInput[]
    NOT?: InterviewFeedbackWhereInput | InterviewFeedbackWhereInput[]
    id?: StringFilter<"InterviewFeedback"> | string
    tenantId?: StringFilter<"InterviewFeedback"> | string
    interviewId?: StringFilter<"InterviewFeedback"> | string
    interviewerId?: StringFilter<"InterviewFeedback"> | string
    candidateId?: StringFilter<"InterviewFeedback"> | string
    overallRating?: IntFilter<"InterviewFeedback"> | number
    recommendation?: EnumInterviewRecommendationFilter<"InterviewFeedback"> | $Enums.InterviewRecommendation
    strengths?: JsonFilter<"InterviewFeedback">
    concerns?: JsonFilter<"InterviewFeedback">
    notes?: StringNullableFilter<"InterviewFeedback"> | string | null
    submittedAt?: DateTimeFilter<"InterviewFeedback"> | Date | string
    interview?: XOR<InterviewScalarRelationFilter, InterviewWhereInput>
  }

  export type InterviewFeedbackOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    interviewId?: SortOrder
    interviewerId?: SortOrder
    candidateId?: SortOrder
    overallRating?: SortOrder
    recommendation?: SortOrder
    strengths?: SortOrder
    concerns?: SortOrder
    notes?: SortOrderInput | SortOrder
    submittedAt?: SortOrder
    interview?: InterviewOrderByWithRelationInput
  }

  export type InterviewFeedbackWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    interviewId_interviewerId?: InterviewFeedbackInterviewIdInterviewerIdCompoundUniqueInput
    AND?: InterviewFeedbackWhereInput | InterviewFeedbackWhereInput[]
    OR?: InterviewFeedbackWhereInput[]
    NOT?: InterviewFeedbackWhereInput | InterviewFeedbackWhereInput[]
    tenantId?: StringFilter<"InterviewFeedback"> | string
    interviewId?: StringFilter<"InterviewFeedback"> | string
    interviewerId?: StringFilter<"InterviewFeedback"> | string
    candidateId?: StringFilter<"InterviewFeedback"> | string
    overallRating?: IntFilter<"InterviewFeedback"> | number
    recommendation?: EnumInterviewRecommendationFilter<"InterviewFeedback"> | $Enums.InterviewRecommendation
    strengths?: JsonFilter<"InterviewFeedback">
    concerns?: JsonFilter<"InterviewFeedback">
    notes?: StringNullableFilter<"InterviewFeedback"> | string | null
    submittedAt?: DateTimeFilter<"InterviewFeedback"> | Date | string
    interview?: XOR<InterviewScalarRelationFilter, InterviewWhereInput>
  }, "id" | "interviewId_interviewerId">

  export type InterviewFeedbackOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    interviewId?: SortOrder
    interviewerId?: SortOrder
    candidateId?: SortOrder
    overallRating?: SortOrder
    recommendation?: SortOrder
    strengths?: SortOrder
    concerns?: SortOrder
    notes?: SortOrderInput | SortOrder
    submittedAt?: SortOrder
    _count?: InterviewFeedbackCountOrderByAggregateInput
    _avg?: InterviewFeedbackAvgOrderByAggregateInput
    _max?: InterviewFeedbackMaxOrderByAggregateInput
    _min?: InterviewFeedbackMinOrderByAggregateInput
    _sum?: InterviewFeedbackSumOrderByAggregateInput
  }

  export type InterviewFeedbackScalarWhereWithAggregatesInput = {
    AND?: InterviewFeedbackScalarWhereWithAggregatesInput | InterviewFeedbackScalarWhereWithAggregatesInput[]
    OR?: InterviewFeedbackScalarWhereWithAggregatesInput[]
    NOT?: InterviewFeedbackScalarWhereWithAggregatesInput | InterviewFeedbackScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"InterviewFeedback"> | string
    tenantId?: StringWithAggregatesFilter<"InterviewFeedback"> | string
    interviewId?: StringWithAggregatesFilter<"InterviewFeedback"> | string
    interviewerId?: StringWithAggregatesFilter<"InterviewFeedback"> | string
    candidateId?: StringWithAggregatesFilter<"InterviewFeedback"> | string
    overallRating?: IntWithAggregatesFilter<"InterviewFeedback"> | number
    recommendation?: EnumInterviewRecommendationWithAggregatesFilter<"InterviewFeedback"> | $Enums.InterviewRecommendation
    strengths?: JsonWithAggregatesFilter<"InterviewFeedback">
    concerns?: JsonWithAggregatesFilter<"InterviewFeedback">
    notes?: StringNullableWithAggregatesFilter<"InterviewFeedback"> | string | null
    submittedAt?: DateTimeWithAggregatesFilter<"InterviewFeedback"> | Date | string
  }

  export type InterviewPanelMemberWhereInput = {
    AND?: InterviewPanelMemberWhereInput | InterviewPanelMemberWhereInput[]
    OR?: InterviewPanelMemberWhereInput[]
    NOT?: InterviewPanelMemberWhereInput | InterviewPanelMemberWhereInput[]
    id?: StringFilter<"InterviewPanelMember"> | string
    interviewId?: StringFilter<"InterviewPanelMember"> | string
    userId?: StringFilter<"InterviewPanelMember"> | string
    role?: StringFilter<"InterviewPanelMember"> | string
    isRequired?: BoolFilter<"InterviewPanelMember"> | boolean
    confirmed?: BoolFilter<"InterviewPanelMember"> | boolean
    createdAt?: DateTimeFilter<"InterviewPanelMember"> | Date | string
    interview?: XOR<InterviewScalarRelationFilter, InterviewWhereInput>
  }

  export type InterviewPanelMemberOrderByWithRelationInput = {
    id?: SortOrder
    interviewId?: SortOrder
    userId?: SortOrder
    role?: SortOrder
    isRequired?: SortOrder
    confirmed?: SortOrder
    createdAt?: SortOrder
    interview?: InterviewOrderByWithRelationInput
  }

  export type InterviewPanelMemberWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    interviewId_userId?: InterviewPanelMemberInterviewIdUserIdCompoundUniqueInput
    AND?: InterviewPanelMemberWhereInput | InterviewPanelMemberWhereInput[]
    OR?: InterviewPanelMemberWhereInput[]
    NOT?: InterviewPanelMemberWhereInput | InterviewPanelMemberWhereInput[]
    interviewId?: StringFilter<"InterviewPanelMember"> | string
    userId?: StringFilter<"InterviewPanelMember"> | string
    role?: StringFilter<"InterviewPanelMember"> | string
    isRequired?: BoolFilter<"InterviewPanelMember"> | boolean
    confirmed?: BoolFilter<"InterviewPanelMember"> | boolean
    createdAt?: DateTimeFilter<"InterviewPanelMember"> | Date | string
    interview?: XOR<InterviewScalarRelationFilter, InterviewWhereInput>
  }, "id" | "interviewId_userId">

  export type InterviewPanelMemberOrderByWithAggregationInput = {
    id?: SortOrder
    interviewId?: SortOrder
    userId?: SortOrder
    role?: SortOrder
    isRequired?: SortOrder
    confirmed?: SortOrder
    createdAt?: SortOrder
    _count?: InterviewPanelMemberCountOrderByAggregateInput
    _max?: InterviewPanelMemberMaxOrderByAggregateInput
    _min?: InterviewPanelMemberMinOrderByAggregateInput
  }

  export type InterviewPanelMemberScalarWhereWithAggregatesInput = {
    AND?: InterviewPanelMemberScalarWhereWithAggregatesInput | InterviewPanelMemberScalarWhereWithAggregatesInput[]
    OR?: InterviewPanelMemberScalarWhereWithAggregatesInput[]
    NOT?: InterviewPanelMemberScalarWhereWithAggregatesInput | InterviewPanelMemberScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"InterviewPanelMember"> | string
    interviewId?: StringWithAggregatesFilter<"InterviewPanelMember"> | string
    userId?: StringWithAggregatesFilter<"InterviewPanelMember"> | string
    role?: StringWithAggregatesFilter<"InterviewPanelMember"> | string
    isRequired?: BoolWithAggregatesFilter<"InterviewPanelMember"> | boolean
    confirmed?: BoolWithAggregatesFilter<"InterviewPanelMember"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"InterviewPanelMember"> | Date | string
  }

  export type InterviewArtifactWhereInput = {
    AND?: InterviewArtifactWhereInput | InterviewArtifactWhereInput[]
    OR?: InterviewArtifactWhereInput[]
    NOT?: InterviewArtifactWhereInput | InterviewArtifactWhereInput[]
    id?: StringFilter<"InterviewArtifact"> | string
    tenantId?: StringFilter<"InterviewArtifact"> | string
    interviewId?: StringFilter<"InterviewArtifact"> | string
    roundId?: StringNullableFilter<"InterviewArtifact"> | string | null
    notes?: JsonNullableFilter<"InterviewArtifact">
    notesText?: StringNullableFilter<"InterviewArtifact"> | string | null
    code?: StringNullableFilter<"InterviewArtifact"> | string | null
    codeLanguage?: StringFilter<"InterviewArtifact"> | string
    whiteboard?: JsonNullableFilter<"InterviewArtifact">
    whiteboardImageKey?: StringNullableFilter<"InterviewArtifact"> | string | null
    createdAt?: DateTimeFilter<"InterviewArtifact"> | Date | string
    updatedAt?: DateTimeFilter<"InterviewArtifact"> | Date | string
  }

  export type InterviewArtifactOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    interviewId?: SortOrder
    roundId?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    notesText?: SortOrderInput | SortOrder
    code?: SortOrderInput | SortOrder
    codeLanguage?: SortOrder
    whiteboard?: SortOrderInput | SortOrder
    whiteboardImageKey?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type InterviewArtifactWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    interviewId?: string
    AND?: InterviewArtifactWhereInput | InterviewArtifactWhereInput[]
    OR?: InterviewArtifactWhereInput[]
    NOT?: InterviewArtifactWhereInput | InterviewArtifactWhereInput[]
    tenantId?: StringFilter<"InterviewArtifact"> | string
    roundId?: StringNullableFilter<"InterviewArtifact"> | string | null
    notes?: JsonNullableFilter<"InterviewArtifact">
    notesText?: StringNullableFilter<"InterviewArtifact"> | string | null
    code?: StringNullableFilter<"InterviewArtifact"> | string | null
    codeLanguage?: StringFilter<"InterviewArtifact"> | string
    whiteboard?: JsonNullableFilter<"InterviewArtifact">
    whiteboardImageKey?: StringNullableFilter<"InterviewArtifact"> | string | null
    createdAt?: DateTimeFilter<"InterviewArtifact"> | Date | string
    updatedAt?: DateTimeFilter<"InterviewArtifact"> | Date | string
  }, "id" | "interviewId">

  export type InterviewArtifactOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    interviewId?: SortOrder
    roundId?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    notesText?: SortOrderInput | SortOrder
    code?: SortOrderInput | SortOrder
    codeLanguage?: SortOrder
    whiteboard?: SortOrderInput | SortOrder
    whiteboardImageKey?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: InterviewArtifactCountOrderByAggregateInput
    _max?: InterviewArtifactMaxOrderByAggregateInput
    _min?: InterviewArtifactMinOrderByAggregateInput
  }

  export type InterviewArtifactScalarWhereWithAggregatesInput = {
    AND?: InterviewArtifactScalarWhereWithAggregatesInput | InterviewArtifactScalarWhereWithAggregatesInput[]
    OR?: InterviewArtifactScalarWhereWithAggregatesInput[]
    NOT?: InterviewArtifactScalarWhereWithAggregatesInput | InterviewArtifactScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"InterviewArtifact"> | string
    tenantId?: StringWithAggregatesFilter<"InterviewArtifact"> | string
    interviewId?: StringWithAggregatesFilter<"InterviewArtifact"> | string
    roundId?: StringNullableWithAggregatesFilter<"InterviewArtifact"> | string | null
    notes?: JsonNullableWithAggregatesFilter<"InterviewArtifact">
    notesText?: StringNullableWithAggregatesFilter<"InterviewArtifact"> | string | null
    code?: StringNullableWithAggregatesFilter<"InterviewArtifact"> | string | null
    codeLanguage?: StringWithAggregatesFilter<"InterviewArtifact"> | string
    whiteboard?: JsonNullableWithAggregatesFilter<"InterviewArtifact">
    whiteboardImageKey?: StringNullableWithAggregatesFilter<"InterviewArtifact"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"InterviewArtifact"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"InterviewArtifact"> | Date | string
  }

  export type InterviewCreateInput = {
    id?: string
    tenantId: string
    requisitionId: string
    candidateId: string
    applicationId?: string | null
    type?: $Enums.InterviewType | null
    stage: string
    status?: $Enums.InterviewStatus
    scheduledAt?: Date | string | null
    duration?: number
    location?: string | null
    meetingUrl?: string | null
    roundNumber?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    round?: InterviewRoundCreateNestedOneWithoutInterviewsInput
    panelMembers?: InterviewPanelMemberCreateNestedManyWithoutInterviewInput
    feedback?: InterviewFeedbackCreateNestedManyWithoutInterviewInput
  }

  export type InterviewUncheckedCreateInput = {
    id?: string
    tenantId: string
    requisitionId: string
    candidateId: string
    applicationId?: string | null
    type?: $Enums.InterviewType | null
    stage: string
    status?: $Enums.InterviewStatus
    scheduledAt?: Date | string | null
    duration?: number
    location?: string | null
    meetingUrl?: string | null
    roundId?: string | null
    roundNumber?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    panelMembers?: InterviewPanelMemberUncheckedCreateNestedManyWithoutInterviewInput
    feedback?: InterviewFeedbackUncheckedCreateNestedManyWithoutInterviewInput
  }

  export type InterviewUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    requisitionId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    applicationId?: NullableStringFieldUpdateOperationsInput | string | null
    type?: NullableEnumInterviewTypeFieldUpdateOperationsInput | $Enums.InterviewType | null
    stage?: StringFieldUpdateOperationsInput | string
    status?: EnumInterviewStatusFieldUpdateOperationsInput | $Enums.InterviewStatus
    scheduledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    duration?: IntFieldUpdateOperationsInput | number
    location?: NullableStringFieldUpdateOperationsInput | string | null
    meetingUrl?: NullableStringFieldUpdateOperationsInput | string | null
    roundNumber?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    round?: InterviewRoundUpdateOneWithoutInterviewsNestedInput
    panelMembers?: InterviewPanelMemberUpdateManyWithoutInterviewNestedInput
    feedback?: InterviewFeedbackUpdateManyWithoutInterviewNestedInput
  }

  export type InterviewUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    requisitionId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    applicationId?: NullableStringFieldUpdateOperationsInput | string | null
    type?: NullableEnumInterviewTypeFieldUpdateOperationsInput | $Enums.InterviewType | null
    stage?: StringFieldUpdateOperationsInput | string
    status?: EnumInterviewStatusFieldUpdateOperationsInput | $Enums.InterviewStatus
    scheduledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    duration?: IntFieldUpdateOperationsInput | number
    location?: NullableStringFieldUpdateOperationsInput | string | null
    meetingUrl?: NullableStringFieldUpdateOperationsInput | string | null
    roundId?: NullableStringFieldUpdateOperationsInput | string | null
    roundNumber?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    panelMembers?: InterviewPanelMemberUncheckedUpdateManyWithoutInterviewNestedInput
    feedback?: InterviewFeedbackUncheckedUpdateManyWithoutInterviewNestedInput
  }

  export type InterviewCreateManyInput = {
    id?: string
    tenantId: string
    requisitionId: string
    candidateId: string
    applicationId?: string | null
    type?: $Enums.InterviewType | null
    stage: string
    status?: $Enums.InterviewStatus
    scheduledAt?: Date | string | null
    duration?: number
    location?: string | null
    meetingUrl?: string | null
    roundId?: string | null
    roundNumber?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type InterviewUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    requisitionId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    applicationId?: NullableStringFieldUpdateOperationsInput | string | null
    type?: NullableEnumInterviewTypeFieldUpdateOperationsInput | $Enums.InterviewType | null
    stage?: StringFieldUpdateOperationsInput | string
    status?: EnumInterviewStatusFieldUpdateOperationsInput | $Enums.InterviewStatus
    scheduledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    duration?: IntFieldUpdateOperationsInput | number
    location?: NullableStringFieldUpdateOperationsInput | string | null
    meetingUrl?: NullableStringFieldUpdateOperationsInput | string | null
    roundNumber?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InterviewUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    requisitionId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    applicationId?: NullableStringFieldUpdateOperationsInput | string | null
    type?: NullableEnumInterviewTypeFieldUpdateOperationsInput | $Enums.InterviewType | null
    stage?: StringFieldUpdateOperationsInput | string
    status?: EnumInterviewStatusFieldUpdateOperationsInput | $Enums.InterviewStatus
    scheduledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    duration?: IntFieldUpdateOperationsInput | number
    location?: NullableStringFieldUpdateOperationsInput | string | null
    meetingUrl?: NullableStringFieldUpdateOperationsInput | string | null
    roundId?: NullableStringFieldUpdateOperationsInput | string | null
    roundNumber?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InterviewRoundCreateInput = {
    id?: string
    tenantId: string
    requisitionId?: string | null
    name: string
    order: number
    interviewType: $Enums.InterviewType
    durationMinutes?: number
    instructions?: string | null
    autoAdvanceOnPass?: boolean
    defaultPanelistRole?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    interviews?: InterviewCreateNestedManyWithoutRoundInput
  }

  export type InterviewRoundUncheckedCreateInput = {
    id?: string
    tenantId: string
    requisitionId?: string | null
    name: string
    order: number
    interviewType: $Enums.InterviewType
    durationMinutes?: number
    instructions?: string | null
    autoAdvanceOnPass?: boolean
    defaultPanelistRole?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    interviews?: InterviewUncheckedCreateNestedManyWithoutRoundInput
  }

  export type InterviewRoundUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    requisitionId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    interviewType?: EnumInterviewTypeFieldUpdateOperationsInput | $Enums.InterviewType
    durationMinutes?: IntFieldUpdateOperationsInput | number
    instructions?: NullableStringFieldUpdateOperationsInput | string | null
    autoAdvanceOnPass?: BoolFieldUpdateOperationsInput | boolean
    defaultPanelistRole?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    interviews?: InterviewUpdateManyWithoutRoundNestedInput
  }

  export type InterviewRoundUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    requisitionId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    interviewType?: EnumInterviewTypeFieldUpdateOperationsInput | $Enums.InterviewType
    durationMinutes?: IntFieldUpdateOperationsInput | number
    instructions?: NullableStringFieldUpdateOperationsInput | string | null
    autoAdvanceOnPass?: BoolFieldUpdateOperationsInput | boolean
    defaultPanelistRole?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    interviews?: InterviewUncheckedUpdateManyWithoutRoundNestedInput
  }

  export type InterviewRoundCreateManyInput = {
    id?: string
    tenantId: string
    requisitionId?: string | null
    name: string
    order: number
    interviewType: $Enums.InterviewType
    durationMinutes?: number
    instructions?: string | null
    autoAdvanceOnPass?: boolean
    defaultPanelistRole?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type InterviewRoundUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    requisitionId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    interviewType?: EnumInterviewTypeFieldUpdateOperationsInput | $Enums.InterviewType
    durationMinutes?: IntFieldUpdateOperationsInput | number
    instructions?: NullableStringFieldUpdateOperationsInput | string | null
    autoAdvanceOnPass?: BoolFieldUpdateOperationsInput | boolean
    defaultPanelistRole?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InterviewRoundUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    requisitionId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    interviewType?: EnumInterviewTypeFieldUpdateOperationsInput | $Enums.InterviewType
    durationMinutes?: IntFieldUpdateOperationsInput | number
    instructions?: NullableStringFieldUpdateOperationsInput | string | null
    autoAdvanceOnPass?: BoolFieldUpdateOperationsInput | boolean
    defaultPanelistRole?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InterviewFeedbackCreateInput = {
    id?: string
    tenantId: string
    interviewerId: string
    candidateId: string
    overallRating: number
    recommendation: $Enums.InterviewRecommendation
    strengths?: JsonNullValueInput | InputJsonValue
    concerns?: JsonNullValueInput | InputJsonValue
    notes?: string | null
    submittedAt?: Date | string
    interview: InterviewCreateNestedOneWithoutFeedbackInput
  }

  export type InterviewFeedbackUncheckedCreateInput = {
    id?: string
    tenantId: string
    interviewId: string
    interviewerId: string
    candidateId: string
    overallRating: number
    recommendation: $Enums.InterviewRecommendation
    strengths?: JsonNullValueInput | InputJsonValue
    concerns?: JsonNullValueInput | InputJsonValue
    notes?: string | null
    submittedAt?: Date | string
  }

  export type InterviewFeedbackUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    interviewerId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    overallRating?: IntFieldUpdateOperationsInput | number
    recommendation?: EnumInterviewRecommendationFieldUpdateOperationsInput | $Enums.InterviewRecommendation
    strengths?: JsonNullValueInput | InputJsonValue
    concerns?: JsonNullValueInput | InputJsonValue
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    submittedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    interview?: InterviewUpdateOneRequiredWithoutFeedbackNestedInput
  }

  export type InterviewFeedbackUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    interviewId?: StringFieldUpdateOperationsInput | string
    interviewerId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    overallRating?: IntFieldUpdateOperationsInput | number
    recommendation?: EnumInterviewRecommendationFieldUpdateOperationsInput | $Enums.InterviewRecommendation
    strengths?: JsonNullValueInput | InputJsonValue
    concerns?: JsonNullValueInput | InputJsonValue
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    submittedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InterviewFeedbackCreateManyInput = {
    id?: string
    tenantId: string
    interviewId: string
    interviewerId: string
    candidateId: string
    overallRating: number
    recommendation: $Enums.InterviewRecommendation
    strengths?: JsonNullValueInput | InputJsonValue
    concerns?: JsonNullValueInput | InputJsonValue
    notes?: string | null
    submittedAt?: Date | string
  }

  export type InterviewFeedbackUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    interviewerId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    overallRating?: IntFieldUpdateOperationsInput | number
    recommendation?: EnumInterviewRecommendationFieldUpdateOperationsInput | $Enums.InterviewRecommendation
    strengths?: JsonNullValueInput | InputJsonValue
    concerns?: JsonNullValueInput | InputJsonValue
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    submittedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InterviewFeedbackUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    interviewId?: StringFieldUpdateOperationsInput | string
    interviewerId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    overallRating?: IntFieldUpdateOperationsInput | number
    recommendation?: EnumInterviewRecommendationFieldUpdateOperationsInput | $Enums.InterviewRecommendation
    strengths?: JsonNullValueInput | InputJsonValue
    concerns?: JsonNullValueInput | InputJsonValue
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    submittedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InterviewPanelMemberCreateInput = {
    id?: string
    userId: string
    role?: string
    isRequired?: boolean
    confirmed?: boolean
    createdAt?: Date | string
    interview: InterviewCreateNestedOneWithoutPanelMembersInput
  }

  export type InterviewPanelMemberUncheckedCreateInput = {
    id?: string
    interviewId: string
    userId: string
    role?: string
    isRequired?: boolean
    confirmed?: boolean
    createdAt?: Date | string
  }

  export type InterviewPanelMemberUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    isRequired?: BoolFieldUpdateOperationsInput | boolean
    confirmed?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    interview?: InterviewUpdateOneRequiredWithoutPanelMembersNestedInput
  }

  export type InterviewPanelMemberUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    interviewId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    isRequired?: BoolFieldUpdateOperationsInput | boolean
    confirmed?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InterviewPanelMemberCreateManyInput = {
    id?: string
    interviewId: string
    userId: string
    role?: string
    isRequired?: boolean
    confirmed?: boolean
    createdAt?: Date | string
  }

  export type InterviewPanelMemberUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    isRequired?: BoolFieldUpdateOperationsInput | boolean
    confirmed?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InterviewPanelMemberUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    interviewId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    isRequired?: BoolFieldUpdateOperationsInput | boolean
    confirmed?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InterviewArtifactCreateInput = {
    id?: string
    tenantId: string
    interviewId: string
    roundId?: string | null
    notes?: NullableJsonNullValueInput | InputJsonValue
    notesText?: string | null
    code?: string | null
    codeLanguage?: string
    whiteboard?: NullableJsonNullValueInput | InputJsonValue
    whiteboardImageKey?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type InterviewArtifactUncheckedCreateInput = {
    id?: string
    tenantId: string
    interviewId: string
    roundId?: string | null
    notes?: NullableJsonNullValueInput | InputJsonValue
    notesText?: string | null
    code?: string | null
    codeLanguage?: string
    whiteboard?: NullableJsonNullValueInput | InputJsonValue
    whiteboardImageKey?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type InterviewArtifactUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    interviewId?: StringFieldUpdateOperationsInput | string
    roundId?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableJsonNullValueInput | InputJsonValue
    notesText?: NullableStringFieldUpdateOperationsInput | string | null
    code?: NullableStringFieldUpdateOperationsInput | string | null
    codeLanguage?: StringFieldUpdateOperationsInput | string
    whiteboard?: NullableJsonNullValueInput | InputJsonValue
    whiteboardImageKey?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InterviewArtifactUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    interviewId?: StringFieldUpdateOperationsInput | string
    roundId?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableJsonNullValueInput | InputJsonValue
    notesText?: NullableStringFieldUpdateOperationsInput | string | null
    code?: NullableStringFieldUpdateOperationsInput | string | null
    codeLanguage?: StringFieldUpdateOperationsInput | string
    whiteboard?: NullableJsonNullValueInput | InputJsonValue
    whiteboardImageKey?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InterviewArtifactCreateManyInput = {
    id?: string
    tenantId: string
    interviewId: string
    roundId?: string | null
    notes?: NullableJsonNullValueInput | InputJsonValue
    notesText?: string | null
    code?: string | null
    codeLanguage?: string
    whiteboard?: NullableJsonNullValueInput | InputJsonValue
    whiteboardImageKey?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type InterviewArtifactUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    interviewId?: StringFieldUpdateOperationsInput | string
    roundId?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableJsonNullValueInput | InputJsonValue
    notesText?: NullableStringFieldUpdateOperationsInput | string | null
    code?: NullableStringFieldUpdateOperationsInput | string | null
    codeLanguage?: StringFieldUpdateOperationsInput | string
    whiteboard?: NullableJsonNullValueInput | InputJsonValue
    whiteboardImageKey?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InterviewArtifactUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    interviewId?: StringFieldUpdateOperationsInput | string
    roundId?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableJsonNullValueInput | InputJsonValue
    notesText?: NullableStringFieldUpdateOperationsInput | string | null
    code?: NullableStringFieldUpdateOperationsInput | string | null
    codeLanguage?: StringFieldUpdateOperationsInput | string
    whiteboard?: NullableJsonNullValueInput | InputJsonValue
    whiteboardImageKey?: NullableStringFieldUpdateOperationsInput | string | null
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

  export type EnumInterviewTypeNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.InterviewType | EnumInterviewTypeFieldRefInput<$PrismaModel> | null
    in?: $Enums.InterviewType[] | ListEnumInterviewTypeFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.InterviewType[] | ListEnumInterviewTypeFieldRefInput<$PrismaModel> | null
    not?: NestedEnumInterviewTypeNullableFilter<$PrismaModel> | $Enums.InterviewType | null
  }

  export type EnumInterviewStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.InterviewStatus | EnumInterviewStatusFieldRefInput<$PrismaModel>
    in?: $Enums.InterviewStatus[] | ListEnumInterviewStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.InterviewStatus[] | ListEnumInterviewStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumInterviewStatusFilter<$PrismaModel> | $Enums.InterviewStatus
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

  export type InterviewRoundNullableScalarRelationFilter = {
    is?: InterviewRoundWhereInput | null
    isNot?: InterviewRoundWhereInput | null
  }

  export type InterviewPanelMemberListRelationFilter = {
    every?: InterviewPanelMemberWhereInput
    some?: InterviewPanelMemberWhereInput
    none?: InterviewPanelMemberWhereInput
  }

  export type InterviewFeedbackListRelationFilter = {
    every?: InterviewFeedbackWhereInput
    some?: InterviewFeedbackWhereInput
    none?: InterviewFeedbackWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type InterviewPanelMemberOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type InterviewFeedbackOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type InterviewCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    requisitionId?: SortOrder
    candidateId?: SortOrder
    applicationId?: SortOrder
    type?: SortOrder
    stage?: SortOrder
    status?: SortOrder
    scheduledAt?: SortOrder
    duration?: SortOrder
    location?: SortOrder
    meetingUrl?: SortOrder
    roundId?: SortOrder
    roundNumber?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type InterviewAvgOrderByAggregateInput = {
    duration?: SortOrder
    roundNumber?: SortOrder
  }

  export type InterviewMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    requisitionId?: SortOrder
    candidateId?: SortOrder
    applicationId?: SortOrder
    type?: SortOrder
    stage?: SortOrder
    status?: SortOrder
    scheduledAt?: SortOrder
    duration?: SortOrder
    location?: SortOrder
    meetingUrl?: SortOrder
    roundId?: SortOrder
    roundNumber?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type InterviewMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    requisitionId?: SortOrder
    candidateId?: SortOrder
    applicationId?: SortOrder
    type?: SortOrder
    stage?: SortOrder
    status?: SortOrder
    scheduledAt?: SortOrder
    duration?: SortOrder
    location?: SortOrder
    meetingUrl?: SortOrder
    roundId?: SortOrder
    roundNumber?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type InterviewSumOrderByAggregateInput = {
    duration?: SortOrder
    roundNumber?: SortOrder
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

  export type EnumInterviewTypeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.InterviewType | EnumInterviewTypeFieldRefInput<$PrismaModel> | null
    in?: $Enums.InterviewType[] | ListEnumInterviewTypeFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.InterviewType[] | ListEnumInterviewTypeFieldRefInput<$PrismaModel> | null
    not?: NestedEnumInterviewTypeNullableWithAggregatesFilter<$PrismaModel> | $Enums.InterviewType | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumInterviewTypeNullableFilter<$PrismaModel>
    _max?: NestedEnumInterviewTypeNullableFilter<$PrismaModel>
  }

  export type EnumInterviewStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.InterviewStatus | EnumInterviewStatusFieldRefInput<$PrismaModel>
    in?: $Enums.InterviewStatus[] | ListEnumInterviewStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.InterviewStatus[] | ListEnumInterviewStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumInterviewStatusWithAggregatesFilter<$PrismaModel> | $Enums.InterviewStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumInterviewStatusFilter<$PrismaModel>
    _max?: NestedEnumInterviewStatusFilter<$PrismaModel>
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

  export type EnumInterviewTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.InterviewType | EnumInterviewTypeFieldRefInput<$PrismaModel>
    in?: $Enums.InterviewType[] | ListEnumInterviewTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.InterviewType[] | ListEnumInterviewTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumInterviewTypeFilter<$PrismaModel> | $Enums.InterviewType
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type InterviewListRelationFilter = {
    every?: InterviewWhereInput
    some?: InterviewWhereInput
    none?: InterviewWhereInput
  }

  export type InterviewOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type InterviewRoundRequisitionIdOrderCompoundUniqueInput = {
    requisitionId: string
    order: number
  }

  export type InterviewRoundCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    requisitionId?: SortOrder
    name?: SortOrder
    order?: SortOrder
    interviewType?: SortOrder
    durationMinutes?: SortOrder
    instructions?: SortOrder
    autoAdvanceOnPass?: SortOrder
    defaultPanelistRole?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type InterviewRoundAvgOrderByAggregateInput = {
    order?: SortOrder
    durationMinutes?: SortOrder
  }

  export type InterviewRoundMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    requisitionId?: SortOrder
    name?: SortOrder
    order?: SortOrder
    interviewType?: SortOrder
    durationMinutes?: SortOrder
    instructions?: SortOrder
    autoAdvanceOnPass?: SortOrder
    defaultPanelistRole?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type InterviewRoundMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    requisitionId?: SortOrder
    name?: SortOrder
    order?: SortOrder
    interviewType?: SortOrder
    durationMinutes?: SortOrder
    instructions?: SortOrder
    autoAdvanceOnPass?: SortOrder
    defaultPanelistRole?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type InterviewRoundSumOrderByAggregateInput = {
    order?: SortOrder
    durationMinutes?: SortOrder
  }

  export type EnumInterviewTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.InterviewType | EnumInterviewTypeFieldRefInput<$PrismaModel>
    in?: $Enums.InterviewType[] | ListEnumInterviewTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.InterviewType[] | ListEnumInterviewTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumInterviewTypeWithAggregatesFilter<$PrismaModel> | $Enums.InterviewType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumInterviewTypeFilter<$PrismaModel>
    _max?: NestedEnumInterviewTypeFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type EnumInterviewRecommendationFilter<$PrismaModel = never> = {
    equals?: $Enums.InterviewRecommendation | EnumInterviewRecommendationFieldRefInput<$PrismaModel>
    in?: $Enums.InterviewRecommendation[] | ListEnumInterviewRecommendationFieldRefInput<$PrismaModel>
    notIn?: $Enums.InterviewRecommendation[] | ListEnumInterviewRecommendationFieldRefInput<$PrismaModel>
    not?: NestedEnumInterviewRecommendationFilter<$PrismaModel> | $Enums.InterviewRecommendation
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

  export type InterviewScalarRelationFilter = {
    is?: InterviewWhereInput
    isNot?: InterviewWhereInput
  }

  export type InterviewFeedbackInterviewIdInterviewerIdCompoundUniqueInput = {
    interviewId: string
    interviewerId: string
  }

  export type InterviewFeedbackCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    interviewId?: SortOrder
    interviewerId?: SortOrder
    candidateId?: SortOrder
    overallRating?: SortOrder
    recommendation?: SortOrder
    strengths?: SortOrder
    concerns?: SortOrder
    notes?: SortOrder
    submittedAt?: SortOrder
  }

  export type InterviewFeedbackAvgOrderByAggregateInput = {
    overallRating?: SortOrder
  }

  export type InterviewFeedbackMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    interviewId?: SortOrder
    interviewerId?: SortOrder
    candidateId?: SortOrder
    overallRating?: SortOrder
    recommendation?: SortOrder
    notes?: SortOrder
    submittedAt?: SortOrder
  }

  export type InterviewFeedbackMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    interviewId?: SortOrder
    interviewerId?: SortOrder
    candidateId?: SortOrder
    overallRating?: SortOrder
    recommendation?: SortOrder
    notes?: SortOrder
    submittedAt?: SortOrder
  }

  export type InterviewFeedbackSumOrderByAggregateInput = {
    overallRating?: SortOrder
  }

  export type EnumInterviewRecommendationWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.InterviewRecommendation | EnumInterviewRecommendationFieldRefInput<$PrismaModel>
    in?: $Enums.InterviewRecommendation[] | ListEnumInterviewRecommendationFieldRefInput<$PrismaModel>
    notIn?: $Enums.InterviewRecommendation[] | ListEnumInterviewRecommendationFieldRefInput<$PrismaModel>
    not?: NestedEnumInterviewRecommendationWithAggregatesFilter<$PrismaModel> | $Enums.InterviewRecommendation
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumInterviewRecommendationFilter<$PrismaModel>
    _max?: NestedEnumInterviewRecommendationFilter<$PrismaModel>
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

  export type InterviewPanelMemberInterviewIdUserIdCompoundUniqueInput = {
    interviewId: string
    userId: string
  }

  export type InterviewPanelMemberCountOrderByAggregateInput = {
    id?: SortOrder
    interviewId?: SortOrder
    userId?: SortOrder
    role?: SortOrder
    isRequired?: SortOrder
    confirmed?: SortOrder
    createdAt?: SortOrder
  }

  export type InterviewPanelMemberMaxOrderByAggregateInput = {
    id?: SortOrder
    interviewId?: SortOrder
    userId?: SortOrder
    role?: SortOrder
    isRequired?: SortOrder
    confirmed?: SortOrder
    createdAt?: SortOrder
  }

  export type InterviewPanelMemberMinOrderByAggregateInput = {
    id?: SortOrder
    interviewId?: SortOrder
    userId?: SortOrder
    role?: SortOrder
    isRequired?: SortOrder
    confirmed?: SortOrder
    createdAt?: SortOrder
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

  export type InterviewArtifactCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    interviewId?: SortOrder
    roundId?: SortOrder
    notes?: SortOrder
    notesText?: SortOrder
    code?: SortOrder
    codeLanguage?: SortOrder
    whiteboard?: SortOrder
    whiteboardImageKey?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type InterviewArtifactMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    interviewId?: SortOrder
    roundId?: SortOrder
    notesText?: SortOrder
    code?: SortOrder
    codeLanguage?: SortOrder
    whiteboardImageKey?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type InterviewArtifactMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    interviewId?: SortOrder
    roundId?: SortOrder
    notesText?: SortOrder
    code?: SortOrder
    codeLanguage?: SortOrder
    whiteboardImageKey?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
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

  export type InterviewRoundCreateNestedOneWithoutInterviewsInput = {
    create?: XOR<InterviewRoundCreateWithoutInterviewsInput, InterviewRoundUncheckedCreateWithoutInterviewsInput>
    connectOrCreate?: InterviewRoundCreateOrConnectWithoutInterviewsInput
    connect?: InterviewRoundWhereUniqueInput
  }

  export type InterviewPanelMemberCreateNestedManyWithoutInterviewInput = {
    create?: XOR<InterviewPanelMemberCreateWithoutInterviewInput, InterviewPanelMemberUncheckedCreateWithoutInterviewInput> | InterviewPanelMemberCreateWithoutInterviewInput[] | InterviewPanelMemberUncheckedCreateWithoutInterviewInput[]
    connectOrCreate?: InterviewPanelMemberCreateOrConnectWithoutInterviewInput | InterviewPanelMemberCreateOrConnectWithoutInterviewInput[]
    createMany?: InterviewPanelMemberCreateManyInterviewInputEnvelope
    connect?: InterviewPanelMemberWhereUniqueInput | InterviewPanelMemberWhereUniqueInput[]
  }

  export type InterviewFeedbackCreateNestedManyWithoutInterviewInput = {
    create?: XOR<InterviewFeedbackCreateWithoutInterviewInput, InterviewFeedbackUncheckedCreateWithoutInterviewInput> | InterviewFeedbackCreateWithoutInterviewInput[] | InterviewFeedbackUncheckedCreateWithoutInterviewInput[]
    connectOrCreate?: InterviewFeedbackCreateOrConnectWithoutInterviewInput | InterviewFeedbackCreateOrConnectWithoutInterviewInput[]
    createMany?: InterviewFeedbackCreateManyInterviewInputEnvelope
    connect?: InterviewFeedbackWhereUniqueInput | InterviewFeedbackWhereUniqueInput[]
  }

  export type InterviewPanelMemberUncheckedCreateNestedManyWithoutInterviewInput = {
    create?: XOR<InterviewPanelMemberCreateWithoutInterviewInput, InterviewPanelMemberUncheckedCreateWithoutInterviewInput> | InterviewPanelMemberCreateWithoutInterviewInput[] | InterviewPanelMemberUncheckedCreateWithoutInterviewInput[]
    connectOrCreate?: InterviewPanelMemberCreateOrConnectWithoutInterviewInput | InterviewPanelMemberCreateOrConnectWithoutInterviewInput[]
    createMany?: InterviewPanelMemberCreateManyInterviewInputEnvelope
    connect?: InterviewPanelMemberWhereUniqueInput | InterviewPanelMemberWhereUniqueInput[]
  }

  export type InterviewFeedbackUncheckedCreateNestedManyWithoutInterviewInput = {
    create?: XOR<InterviewFeedbackCreateWithoutInterviewInput, InterviewFeedbackUncheckedCreateWithoutInterviewInput> | InterviewFeedbackCreateWithoutInterviewInput[] | InterviewFeedbackUncheckedCreateWithoutInterviewInput[]
    connectOrCreate?: InterviewFeedbackCreateOrConnectWithoutInterviewInput | InterviewFeedbackCreateOrConnectWithoutInterviewInput[]
    createMany?: InterviewFeedbackCreateManyInterviewInputEnvelope
    connect?: InterviewFeedbackWhereUniqueInput | InterviewFeedbackWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type NullableEnumInterviewTypeFieldUpdateOperationsInput = {
    set?: $Enums.InterviewType | null
  }

  export type EnumInterviewStatusFieldUpdateOperationsInput = {
    set?: $Enums.InterviewStatus
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type InterviewRoundUpdateOneWithoutInterviewsNestedInput = {
    create?: XOR<InterviewRoundCreateWithoutInterviewsInput, InterviewRoundUncheckedCreateWithoutInterviewsInput>
    connectOrCreate?: InterviewRoundCreateOrConnectWithoutInterviewsInput
    upsert?: InterviewRoundUpsertWithoutInterviewsInput
    disconnect?: InterviewRoundWhereInput | boolean
    delete?: InterviewRoundWhereInput | boolean
    connect?: InterviewRoundWhereUniqueInput
    update?: XOR<XOR<InterviewRoundUpdateToOneWithWhereWithoutInterviewsInput, InterviewRoundUpdateWithoutInterviewsInput>, InterviewRoundUncheckedUpdateWithoutInterviewsInput>
  }

  export type InterviewPanelMemberUpdateManyWithoutInterviewNestedInput = {
    create?: XOR<InterviewPanelMemberCreateWithoutInterviewInput, InterviewPanelMemberUncheckedCreateWithoutInterviewInput> | InterviewPanelMemberCreateWithoutInterviewInput[] | InterviewPanelMemberUncheckedCreateWithoutInterviewInput[]
    connectOrCreate?: InterviewPanelMemberCreateOrConnectWithoutInterviewInput | InterviewPanelMemberCreateOrConnectWithoutInterviewInput[]
    upsert?: InterviewPanelMemberUpsertWithWhereUniqueWithoutInterviewInput | InterviewPanelMemberUpsertWithWhereUniqueWithoutInterviewInput[]
    createMany?: InterviewPanelMemberCreateManyInterviewInputEnvelope
    set?: InterviewPanelMemberWhereUniqueInput | InterviewPanelMemberWhereUniqueInput[]
    disconnect?: InterviewPanelMemberWhereUniqueInput | InterviewPanelMemberWhereUniqueInput[]
    delete?: InterviewPanelMemberWhereUniqueInput | InterviewPanelMemberWhereUniqueInput[]
    connect?: InterviewPanelMemberWhereUniqueInput | InterviewPanelMemberWhereUniqueInput[]
    update?: InterviewPanelMemberUpdateWithWhereUniqueWithoutInterviewInput | InterviewPanelMemberUpdateWithWhereUniqueWithoutInterviewInput[]
    updateMany?: InterviewPanelMemberUpdateManyWithWhereWithoutInterviewInput | InterviewPanelMemberUpdateManyWithWhereWithoutInterviewInput[]
    deleteMany?: InterviewPanelMemberScalarWhereInput | InterviewPanelMemberScalarWhereInput[]
  }

  export type InterviewFeedbackUpdateManyWithoutInterviewNestedInput = {
    create?: XOR<InterviewFeedbackCreateWithoutInterviewInput, InterviewFeedbackUncheckedCreateWithoutInterviewInput> | InterviewFeedbackCreateWithoutInterviewInput[] | InterviewFeedbackUncheckedCreateWithoutInterviewInput[]
    connectOrCreate?: InterviewFeedbackCreateOrConnectWithoutInterviewInput | InterviewFeedbackCreateOrConnectWithoutInterviewInput[]
    upsert?: InterviewFeedbackUpsertWithWhereUniqueWithoutInterviewInput | InterviewFeedbackUpsertWithWhereUniqueWithoutInterviewInput[]
    createMany?: InterviewFeedbackCreateManyInterviewInputEnvelope
    set?: InterviewFeedbackWhereUniqueInput | InterviewFeedbackWhereUniqueInput[]
    disconnect?: InterviewFeedbackWhereUniqueInput | InterviewFeedbackWhereUniqueInput[]
    delete?: InterviewFeedbackWhereUniqueInput | InterviewFeedbackWhereUniqueInput[]
    connect?: InterviewFeedbackWhereUniqueInput | InterviewFeedbackWhereUniqueInput[]
    update?: InterviewFeedbackUpdateWithWhereUniqueWithoutInterviewInput | InterviewFeedbackUpdateWithWhereUniqueWithoutInterviewInput[]
    updateMany?: InterviewFeedbackUpdateManyWithWhereWithoutInterviewInput | InterviewFeedbackUpdateManyWithWhereWithoutInterviewInput[]
    deleteMany?: InterviewFeedbackScalarWhereInput | InterviewFeedbackScalarWhereInput[]
  }

  export type InterviewPanelMemberUncheckedUpdateManyWithoutInterviewNestedInput = {
    create?: XOR<InterviewPanelMemberCreateWithoutInterviewInput, InterviewPanelMemberUncheckedCreateWithoutInterviewInput> | InterviewPanelMemberCreateWithoutInterviewInput[] | InterviewPanelMemberUncheckedCreateWithoutInterviewInput[]
    connectOrCreate?: InterviewPanelMemberCreateOrConnectWithoutInterviewInput | InterviewPanelMemberCreateOrConnectWithoutInterviewInput[]
    upsert?: InterviewPanelMemberUpsertWithWhereUniqueWithoutInterviewInput | InterviewPanelMemberUpsertWithWhereUniqueWithoutInterviewInput[]
    createMany?: InterviewPanelMemberCreateManyInterviewInputEnvelope
    set?: InterviewPanelMemberWhereUniqueInput | InterviewPanelMemberWhereUniqueInput[]
    disconnect?: InterviewPanelMemberWhereUniqueInput | InterviewPanelMemberWhereUniqueInput[]
    delete?: InterviewPanelMemberWhereUniqueInput | InterviewPanelMemberWhereUniqueInput[]
    connect?: InterviewPanelMemberWhereUniqueInput | InterviewPanelMemberWhereUniqueInput[]
    update?: InterviewPanelMemberUpdateWithWhereUniqueWithoutInterviewInput | InterviewPanelMemberUpdateWithWhereUniqueWithoutInterviewInput[]
    updateMany?: InterviewPanelMemberUpdateManyWithWhereWithoutInterviewInput | InterviewPanelMemberUpdateManyWithWhereWithoutInterviewInput[]
    deleteMany?: InterviewPanelMemberScalarWhereInput | InterviewPanelMemberScalarWhereInput[]
  }

  export type InterviewFeedbackUncheckedUpdateManyWithoutInterviewNestedInput = {
    create?: XOR<InterviewFeedbackCreateWithoutInterviewInput, InterviewFeedbackUncheckedCreateWithoutInterviewInput> | InterviewFeedbackCreateWithoutInterviewInput[] | InterviewFeedbackUncheckedCreateWithoutInterviewInput[]
    connectOrCreate?: InterviewFeedbackCreateOrConnectWithoutInterviewInput | InterviewFeedbackCreateOrConnectWithoutInterviewInput[]
    upsert?: InterviewFeedbackUpsertWithWhereUniqueWithoutInterviewInput | InterviewFeedbackUpsertWithWhereUniqueWithoutInterviewInput[]
    createMany?: InterviewFeedbackCreateManyInterviewInputEnvelope
    set?: InterviewFeedbackWhereUniqueInput | InterviewFeedbackWhereUniqueInput[]
    disconnect?: InterviewFeedbackWhereUniqueInput | InterviewFeedbackWhereUniqueInput[]
    delete?: InterviewFeedbackWhereUniqueInput | InterviewFeedbackWhereUniqueInput[]
    connect?: InterviewFeedbackWhereUniqueInput | InterviewFeedbackWhereUniqueInput[]
    update?: InterviewFeedbackUpdateWithWhereUniqueWithoutInterviewInput | InterviewFeedbackUpdateWithWhereUniqueWithoutInterviewInput[]
    updateMany?: InterviewFeedbackUpdateManyWithWhereWithoutInterviewInput | InterviewFeedbackUpdateManyWithWhereWithoutInterviewInput[]
    deleteMany?: InterviewFeedbackScalarWhereInput | InterviewFeedbackScalarWhereInput[]
  }

  export type InterviewCreateNestedManyWithoutRoundInput = {
    create?: XOR<InterviewCreateWithoutRoundInput, InterviewUncheckedCreateWithoutRoundInput> | InterviewCreateWithoutRoundInput[] | InterviewUncheckedCreateWithoutRoundInput[]
    connectOrCreate?: InterviewCreateOrConnectWithoutRoundInput | InterviewCreateOrConnectWithoutRoundInput[]
    createMany?: InterviewCreateManyRoundInputEnvelope
    connect?: InterviewWhereUniqueInput | InterviewWhereUniqueInput[]
  }

  export type InterviewUncheckedCreateNestedManyWithoutRoundInput = {
    create?: XOR<InterviewCreateWithoutRoundInput, InterviewUncheckedCreateWithoutRoundInput> | InterviewCreateWithoutRoundInput[] | InterviewUncheckedCreateWithoutRoundInput[]
    connectOrCreate?: InterviewCreateOrConnectWithoutRoundInput | InterviewCreateOrConnectWithoutRoundInput[]
    createMany?: InterviewCreateManyRoundInputEnvelope
    connect?: InterviewWhereUniqueInput | InterviewWhereUniqueInput[]
  }

  export type EnumInterviewTypeFieldUpdateOperationsInput = {
    set?: $Enums.InterviewType
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type InterviewUpdateManyWithoutRoundNestedInput = {
    create?: XOR<InterviewCreateWithoutRoundInput, InterviewUncheckedCreateWithoutRoundInput> | InterviewCreateWithoutRoundInput[] | InterviewUncheckedCreateWithoutRoundInput[]
    connectOrCreate?: InterviewCreateOrConnectWithoutRoundInput | InterviewCreateOrConnectWithoutRoundInput[]
    upsert?: InterviewUpsertWithWhereUniqueWithoutRoundInput | InterviewUpsertWithWhereUniqueWithoutRoundInput[]
    createMany?: InterviewCreateManyRoundInputEnvelope
    set?: InterviewWhereUniqueInput | InterviewWhereUniqueInput[]
    disconnect?: InterviewWhereUniqueInput | InterviewWhereUniqueInput[]
    delete?: InterviewWhereUniqueInput | InterviewWhereUniqueInput[]
    connect?: InterviewWhereUniqueInput | InterviewWhereUniqueInput[]
    update?: InterviewUpdateWithWhereUniqueWithoutRoundInput | InterviewUpdateWithWhereUniqueWithoutRoundInput[]
    updateMany?: InterviewUpdateManyWithWhereWithoutRoundInput | InterviewUpdateManyWithWhereWithoutRoundInput[]
    deleteMany?: InterviewScalarWhereInput | InterviewScalarWhereInput[]
  }

  export type InterviewUncheckedUpdateManyWithoutRoundNestedInput = {
    create?: XOR<InterviewCreateWithoutRoundInput, InterviewUncheckedCreateWithoutRoundInput> | InterviewCreateWithoutRoundInput[] | InterviewUncheckedCreateWithoutRoundInput[]
    connectOrCreate?: InterviewCreateOrConnectWithoutRoundInput | InterviewCreateOrConnectWithoutRoundInput[]
    upsert?: InterviewUpsertWithWhereUniqueWithoutRoundInput | InterviewUpsertWithWhereUniqueWithoutRoundInput[]
    createMany?: InterviewCreateManyRoundInputEnvelope
    set?: InterviewWhereUniqueInput | InterviewWhereUniqueInput[]
    disconnect?: InterviewWhereUniqueInput | InterviewWhereUniqueInput[]
    delete?: InterviewWhereUniqueInput | InterviewWhereUniqueInput[]
    connect?: InterviewWhereUniqueInput | InterviewWhereUniqueInput[]
    update?: InterviewUpdateWithWhereUniqueWithoutRoundInput | InterviewUpdateWithWhereUniqueWithoutRoundInput[]
    updateMany?: InterviewUpdateManyWithWhereWithoutRoundInput | InterviewUpdateManyWithWhereWithoutRoundInput[]
    deleteMany?: InterviewScalarWhereInput | InterviewScalarWhereInput[]
  }

  export type InterviewCreateNestedOneWithoutFeedbackInput = {
    create?: XOR<InterviewCreateWithoutFeedbackInput, InterviewUncheckedCreateWithoutFeedbackInput>
    connectOrCreate?: InterviewCreateOrConnectWithoutFeedbackInput
    connect?: InterviewWhereUniqueInput
  }

  export type EnumInterviewRecommendationFieldUpdateOperationsInput = {
    set?: $Enums.InterviewRecommendation
  }

  export type InterviewUpdateOneRequiredWithoutFeedbackNestedInput = {
    create?: XOR<InterviewCreateWithoutFeedbackInput, InterviewUncheckedCreateWithoutFeedbackInput>
    connectOrCreate?: InterviewCreateOrConnectWithoutFeedbackInput
    upsert?: InterviewUpsertWithoutFeedbackInput
    connect?: InterviewWhereUniqueInput
    update?: XOR<XOR<InterviewUpdateToOneWithWhereWithoutFeedbackInput, InterviewUpdateWithoutFeedbackInput>, InterviewUncheckedUpdateWithoutFeedbackInput>
  }

  export type InterviewCreateNestedOneWithoutPanelMembersInput = {
    create?: XOR<InterviewCreateWithoutPanelMembersInput, InterviewUncheckedCreateWithoutPanelMembersInput>
    connectOrCreate?: InterviewCreateOrConnectWithoutPanelMembersInput
    connect?: InterviewWhereUniqueInput
  }

  export type InterviewUpdateOneRequiredWithoutPanelMembersNestedInput = {
    create?: XOR<InterviewCreateWithoutPanelMembersInput, InterviewUncheckedCreateWithoutPanelMembersInput>
    connectOrCreate?: InterviewCreateOrConnectWithoutPanelMembersInput
    upsert?: InterviewUpsertWithoutPanelMembersInput
    connect?: InterviewWhereUniqueInput
    update?: XOR<XOR<InterviewUpdateToOneWithWhereWithoutPanelMembersInput, InterviewUpdateWithoutPanelMembersInput>, InterviewUncheckedUpdateWithoutPanelMembersInput>
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

  export type NestedEnumInterviewTypeNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.InterviewType | EnumInterviewTypeFieldRefInput<$PrismaModel> | null
    in?: $Enums.InterviewType[] | ListEnumInterviewTypeFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.InterviewType[] | ListEnumInterviewTypeFieldRefInput<$PrismaModel> | null
    not?: NestedEnumInterviewTypeNullableFilter<$PrismaModel> | $Enums.InterviewType | null
  }

  export type NestedEnumInterviewStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.InterviewStatus | EnumInterviewStatusFieldRefInput<$PrismaModel>
    in?: $Enums.InterviewStatus[] | ListEnumInterviewStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.InterviewStatus[] | ListEnumInterviewStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumInterviewStatusFilter<$PrismaModel> | $Enums.InterviewStatus
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

  export type NestedEnumInterviewTypeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.InterviewType | EnumInterviewTypeFieldRefInput<$PrismaModel> | null
    in?: $Enums.InterviewType[] | ListEnumInterviewTypeFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.InterviewType[] | ListEnumInterviewTypeFieldRefInput<$PrismaModel> | null
    not?: NestedEnumInterviewTypeNullableWithAggregatesFilter<$PrismaModel> | $Enums.InterviewType | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumInterviewTypeNullableFilter<$PrismaModel>
    _max?: NestedEnumInterviewTypeNullableFilter<$PrismaModel>
  }

  export type NestedEnumInterviewStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.InterviewStatus | EnumInterviewStatusFieldRefInput<$PrismaModel>
    in?: $Enums.InterviewStatus[] | ListEnumInterviewStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.InterviewStatus[] | ListEnumInterviewStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumInterviewStatusWithAggregatesFilter<$PrismaModel> | $Enums.InterviewStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumInterviewStatusFilter<$PrismaModel>
    _max?: NestedEnumInterviewStatusFilter<$PrismaModel>
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

  export type NestedEnumInterviewTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.InterviewType | EnumInterviewTypeFieldRefInput<$PrismaModel>
    in?: $Enums.InterviewType[] | ListEnumInterviewTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.InterviewType[] | ListEnumInterviewTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumInterviewTypeFilter<$PrismaModel> | $Enums.InterviewType
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedEnumInterviewTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.InterviewType | EnumInterviewTypeFieldRefInput<$PrismaModel>
    in?: $Enums.InterviewType[] | ListEnumInterviewTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.InterviewType[] | ListEnumInterviewTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumInterviewTypeWithAggregatesFilter<$PrismaModel> | $Enums.InterviewType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumInterviewTypeFilter<$PrismaModel>
    _max?: NestedEnumInterviewTypeFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedEnumInterviewRecommendationFilter<$PrismaModel = never> = {
    equals?: $Enums.InterviewRecommendation | EnumInterviewRecommendationFieldRefInput<$PrismaModel>
    in?: $Enums.InterviewRecommendation[] | ListEnumInterviewRecommendationFieldRefInput<$PrismaModel>
    notIn?: $Enums.InterviewRecommendation[] | ListEnumInterviewRecommendationFieldRefInput<$PrismaModel>
    not?: NestedEnumInterviewRecommendationFilter<$PrismaModel> | $Enums.InterviewRecommendation
  }

  export type NestedEnumInterviewRecommendationWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.InterviewRecommendation | EnumInterviewRecommendationFieldRefInput<$PrismaModel>
    in?: $Enums.InterviewRecommendation[] | ListEnumInterviewRecommendationFieldRefInput<$PrismaModel>
    notIn?: $Enums.InterviewRecommendation[] | ListEnumInterviewRecommendationFieldRefInput<$PrismaModel>
    not?: NestedEnumInterviewRecommendationWithAggregatesFilter<$PrismaModel> | $Enums.InterviewRecommendation
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumInterviewRecommendationFilter<$PrismaModel>
    _max?: NestedEnumInterviewRecommendationFilter<$PrismaModel>
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

  export type InterviewRoundCreateWithoutInterviewsInput = {
    id?: string
    tenantId: string
    requisitionId?: string | null
    name: string
    order: number
    interviewType: $Enums.InterviewType
    durationMinutes?: number
    instructions?: string | null
    autoAdvanceOnPass?: boolean
    defaultPanelistRole?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type InterviewRoundUncheckedCreateWithoutInterviewsInput = {
    id?: string
    tenantId: string
    requisitionId?: string | null
    name: string
    order: number
    interviewType: $Enums.InterviewType
    durationMinutes?: number
    instructions?: string | null
    autoAdvanceOnPass?: boolean
    defaultPanelistRole?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type InterviewRoundCreateOrConnectWithoutInterviewsInput = {
    where: InterviewRoundWhereUniqueInput
    create: XOR<InterviewRoundCreateWithoutInterviewsInput, InterviewRoundUncheckedCreateWithoutInterviewsInput>
  }

  export type InterviewPanelMemberCreateWithoutInterviewInput = {
    id?: string
    userId: string
    role?: string
    isRequired?: boolean
    confirmed?: boolean
    createdAt?: Date | string
  }

  export type InterviewPanelMemberUncheckedCreateWithoutInterviewInput = {
    id?: string
    userId: string
    role?: string
    isRequired?: boolean
    confirmed?: boolean
    createdAt?: Date | string
  }

  export type InterviewPanelMemberCreateOrConnectWithoutInterviewInput = {
    where: InterviewPanelMemberWhereUniqueInput
    create: XOR<InterviewPanelMemberCreateWithoutInterviewInput, InterviewPanelMemberUncheckedCreateWithoutInterviewInput>
  }

  export type InterviewPanelMemberCreateManyInterviewInputEnvelope = {
    data: InterviewPanelMemberCreateManyInterviewInput | InterviewPanelMemberCreateManyInterviewInput[]
    skipDuplicates?: boolean
  }

  export type InterviewFeedbackCreateWithoutInterviewInput = {
    id?: string
    tenantId: string
    interviewerId: string
    candidateId: string
    overallRating: number
    recommendation: $Enums.InterviewRecommendation
    strengths?: JsonNullValueInput | InputJsonValue
    concerns?: JsonNullValueInput | InputJsonValue
    notes?: string | null
    submittedAt?: Date | string
  }

  export type InterviewFeedbackUncheckedCreateWithoutInterviewInput = {
    id?: string
    tenantId: string
    interviewerId: string
    candidateId: string
    overallRating: number
    recommendation: $Enums.InterviewRecommendation
    strengths?: JsonNullValueInput | InputJsonValue
    concerns?: JsonNullValueInput | InputJsonValue
    notes?: string | null
    submittedAt?: Date | string
  }

  export type InterviewFeedbackCreateOrConnectWithoutInterviewInput = {
    where: InterviewFeedbackWhereUniqueInput
    create: XOR<InterviewFeedbackCreateWithoutInterviewInput, InterviewFeedbackUncheckedCreateWithoutInterviewInput>
  }

  export type InterviewFeedbackCreateManyInterviewInputEnvelope = {
    data: InterviewFeedbackCreateManyInterviewInput | InterviewFeedbackCreateManyInterviewInput[]
    skipDuplicates?: boolean
  }

  export type InterviewRoundUpsertWithoutInterviewsInput = {
    update: XOR<InterviewRoundUpdateWithoutInterviewsInput, InterviewRoundUncheckedUpdateWithoutInterviewsInput>
    create: XOR<InterviewRoundCreateWithoutInterviewsInput, InterviewRoundUncheckedCreateWithoutInterviewsInput>
    where?: InterviewRoundWhereInput
  }

  export type InterviewRoundUpdateToOneWithWhereWithoutInterviewsInput = {
    where?: InterviewRoundWhereInput
    data: XOR<InterviewRoundUpdateWithoutInterviewsInput, InterviewRoundUncheckedUpdateWithoutInterviewsInput>
  }

  export type InterviewRoundUpdateWithoutInterviewsInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    requisitionId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    interviewType?: EnumInterviewTypeFieldUpdateOperationsInput | $Enums.InterviewType
    durationMinutes?: IntFieldUpdateOperationsInput | number
    instructions?: NullableStringFieldUpdateOperationsInput | string | null
    autoAdvanceOnPass?: BoolFieldUpdateOperationsInput | boolean
    defaultPanelistRole?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InterviewRoundUncheckedUpdateWithoutInterviewsInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    requisitionId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    interviewType?: EnumInterviewTypeFieldUpdateOperationsInput | $Enums.InterviewType
    durationMinutes?: IntFieldUpdateOperationsInput | number
    instructions?: NullableStringFieldUpdateOperationsInput | string | null
    autoAdvanceOnPass?: BoolFieldUpdateOperationsInput | boolean
    defaultPanelistRole?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InterviewPanelMemberUpsertWithWhereUniqueWithoutInterviewInput = {
    where: InterviewPanelMemberWhereUniqueInput
    update: XOR<InterviewPanelMemberUpdateWithoutInterviewInput, InterviewPanelMemberUncheckedUpdateWithoutInterviewInput>
    create: XOR<InterviewPanelMemberCreateWithoutInterviewInput, InterviewPanelMemberUncheckedCreateWithoutInterviewInput>
  }

  export type InterviewPanelMemberUpdateWithWhereUniqueWithoutInterviewInput = {
    where: InterviewPanelMemberWhereUniqueInput
    data: XOR<InterviewPanelMemberUpdateWithoutInterviewInput, InterviewPanelMemberUncheckedUpdateWithoutInterviewInput>
  }

  export type InterviewPanelMemberUpdateManyWithWhereWithoutInterviewInput = {
    where: InterviewPanelMemberScalarWhereInput
    data: XOR<InterviewPanelMemberUpdateManyMutationInput, InterviewPanelMemberUncheckedUpdateManyWithoutInterviewInput>
  }

  export type InterviewPanelMemberScalarWhereInput = {
    AND?: InterviewPanelMemberScalarWhereInput | InterviewPanelMemberScalarWhereInput[]
    OR?: InterviewPanelMemberScalarWhereInput[]
    NOT?: InterviewPanelMemberScalarWhereInput | InterviewPanelMemberScalarWhereInput[]
    id?: StringFilter<"InterviewPanelMember"> | string
    interviewId?: StringFilter<"InterviewPanelMember"> | string
    userId?: StringFilter<"InterviewPanelMember"> | string
    role?: StringFilter<"InterviewPanelMember"> | string
    isRequired?: BoolFilter<"InterviewPanelMember"> | boolean
    confirmed?: BoolFilter<"InterviewPanelMember"> | boolean
    createdAt?: DateTimeFilter<"InterviewPanelMember"> | Date | string
  }

  export type InterviewFeedbackUpsertWithWhereUniqueWithoutInterviewInput = {
    where: InterviewFeedbackWhereUniqueInput
    update: XOR<InterviewFeedbackUpdateWithoutInterviewInput, InterviewFeedbackUncheckedUpdateWithoutInterviewInput>
    create: XOR<InterviewFeedbackCreateWithoutInterviewInput, InterviewFeedbackUncheckedCreateWithoutInterviewInput>
  }

  export type InterviewFeedbackUpdateWithWhereUniqueWithoutInterviewInput = {
    where: InterviewFeedbackWhereUniqueInput
    data: XOR<InterviewFeedbackUpdateWithoutInterviewInput, InterviewFeedbackUncheckedUpdateWithoutInterviewInput>
  }

  export type InterviewFeedbackUpdateManyWithWhereWithoutInterviewInput = {
    where: InterviewFeedbackScalarWhereInput
    data: XOR<InterviewFeedbackUpdateManyMutationInput, InterviewFeedbackUncheckedUpdateManyWithoutInterviewInput>
  }

  export type InterviewFeedbackScalarWhereInput = {
    AND?: InterviewFeedbackScalarWhereInput | InterviewFeedbackScalarWhereInput[]
    OR?: InterviewFeedbackScalarWhereInput[]
    NOT?: InterviewFeedbackScalarWhereInput | InterviewFeedbackScalarWhereInput[]
    id?: StringFilter<"InterviewFeedback"> | string
    tenantId?: StringFilter<"InterviewFeedback"> | string
    interviewId?: StringFilter<"InterviewFeedback"> | string
    interviewerId?: StringFilter<"InterviewFeedback"> | string
    candidateId?: StringFilter<"InterviewFeedback"> | string
    overallRating?: IntFilter<"InterviewFeedback"> | number
    recommendation?: EnumInterviewRecommendationFilter<"InterviewFeedback"> | $Enums.InterviewRecommendation
    strengths?: JsonFilter<"InterviewFeedback">
    concerns?: JsonFilter<"InterviewFeedback">
    notes?: StringNullableFilter<"InterviewFeedback"> | string | null
    submittedAt?: DateTimeFilter<"InterviewFeedback"> | Date | string
  }

  export type InterviewCreateWithoutRoundInput = {
    id?: string
    tenantId: string
    requisitionId: string
    candidateId: string
    applicationId?: string | null
    type?: $Enums.InterviewType | null
    stage: string
    status?: $Enums.InterviewStatus
    scheduledAt?: Date | string | null
    duration?: number
    location?: string | null
    meetingUrl?: string | null
    roundNumber?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    panelMembers?: InterviewPanelMemberCreateNestedManyWithoutInterviewInput
    feedback?: InterviewFeedbackCreateNestedManyWithoutInterviewInput
  }

  export type InterviewUncheckedCreateWithoutRoundInput = {
    id?: string
    tenantId: string
    requisitionId: string
    candidateId: string
    applicationId?: string | null
    type?: $Enums.InterviewType | null
    stage: string
    status?: $Enums.InterviewStatus
    scheduledAt?: Date | string | null
    duration?: number
    location?: string | null
    meetingUrl?: string | null
    roundNumber?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    panelMembers?: InterviewPanelMemberUncheckedCreateNestedManyWithoutInterviewInput
    feedback?: InterviewFeedbackUncheckedCreateNestedManyWithoutInterviewInput
  }

  export type InterviewCreateOrConnectWithoutRoundInput = {
    where: InterviewWhereUniqueInput
    create: XOR<InterviewCreateWithoutRoundInput, InterviewUncheckedCreateWithoutRoundInput>
  }

  export type InterviewCreateManyRoundInputEnvelope = {
    data: InterviewCreateManyRoundInput | InterviewCreateManyRoundInput[]
    skipDuplicates?: boolean
  }

  export type InterviewUpsertWithWhereUniqueWithoutRoundInput = {
    where: InterviewWhereUniqueInput
    update: XOR<InterviewUpdateWithoutRoundInput, InterviewUncheckedUpdateWithoutRoundInput>
    create: XOR<InterviewCreateWithoutRoundInput, InterviewUncheckedCreateWithoutRoundInput>
  }

  export type InterviewUpdateWithWhereUniqueWithoutRoundInput = {
    where: InterviewWhereUniqueInput
    data: XOR<InterviewUpdateWithoutRoundInput, InterviewUncheckedUpdateWithoutRoundInput>
  }

  export type InterviewUpdateManyWithWhereWithoutRoundInput = {
    where: InterviewScalarWhereInput
    data: XOR<InterviewUpdateManyMutationInput, InterviewUncheckedUpdateManyWithoutRoundInput>
  }

  export type InterviewScalarWhereInput = {
    AND?: InterviewScalarWhereInput | InterviewScalarWhereInput[]
    OR?: InterviewScalarWhereInput[]
    NOT?: InterviewScalarWhereInput | InterviewScalarWhereInput[]
    id?: StringFilter<"Interview"> | string
    tenantId?: StringFilter<"Interview"> | string
    requisitionId?: StringFilter<"Interview"> | string
    candidateId?: StringFilter<"Interview"> | string
    applicationId?: StringNullableFilter<"Interview"> | string | null
    type?: EnumInterviewTypeNullableFilter<"Interview"> | $Enums.InterviewType | null
    stage?: StringFilter<"Interview"> | string
    status?: EnumInterviewStatusFilter<"Interview"> | $Enums.InterviewStatus
    scheduledAt?: DateTimeNullableFilter<"Interview"> | Date | string | null
    duration?: IntFilter<"Interview"> | number
    location?: StringNullableFilter<"Interview"> | string | null
    meetingUrl?: StringNullableFilter<"Interview"> | string | null
    roundId?: StringNullableFilter<"Interview"> | string | null
    roundNumber?: IntNullableFilter<"Interview"> | number | null
    createdAt?: DateTimeFilter<"Interview"> | Date | string
    updatedAt?: DateTimeFilter<"Interview"> | Date | string
  }

  export type InterviewCreateWithoutFeedbackInput = {
    id?: string
    tenantId: string
    requisitionId: string
    candidateId: string
    applicationId?: string | null
    type?: $Enums.InterviewType | null
    stage: string
    status?: $Enums.InterviewStatus
    scheduledAt?: Date | string | null
    duration?: number
    location?: string | null
    meetingUrl?: string | null
    roundNumber?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    round?: InterviewRoundCreateNestedOneWithoutInterviewsInput
    panelMembers?: InterviewPanelMemberCreateNestedManyWithoutInterviewInput
  }

  export type InterviewUncheckedCreateWithoutFeedbackInput = {
    id?: string
    tenantId: string
    requisitionId: string
    candidateId: string
    applicationId?: string | null
    type?: $Enums.InterviewType | null
    stage: string
    status?: $Enums.InterviewStatus
    scheduledAt?: Date | string | null
    duration?: number
    location?: string | null
    meetingUrl?: string | null
    roundId?: string | null
    roundNumber?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    panelMembers?: InterviewPanelMemberUncheckedCreateNestedManyWithoutInterviewInput
  }

  export type InterviewCreateOrConnectWithoutFeedbackInput = {
    where: InterviewWhereUniqueInput
    create: XOR<InterviewCreateWithoutFeedbackInput, InterviewUncheckedCreateWithoutFeedbackInput>
  }

  export type InterviewUpsertWithoutFeedbackInput = {
    update: XOR<InterviewUpdateWithoutFeedbackInput, InterviewUncheckedUpdateWithoutFeedbackInput>
    create: XOR<InterviewCreateWithoutFeedbackInput, InterviewUncheckedCreateWithoutFeedbackInput>
    where?: InterviewWhereInput
  }

  export type InterviewUpdateToOneWithWhereWithoutFeedbackInput = {
    where?: InterviewWhereInput
    data: XOR<InterviewUpdateWithoutFeedbackInput, InterviewUncheckedUpdateWithoutFeedbackInput>
  }

  export type InterviewUpdateWithoutFeedbackInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    requisitionId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    applicationId?: NullableStringFieldUpdateOperationsInput | string | null
    type?: NullableEnumInterviewTypeFieldUpdateOperationsInput | $Enums.InterviewType | null
    stage?: StringFieldUpdateOperationsInput | string
    status?: EnumInterviewStatusFieldUpdateOperationsInput | $Enums.InterviewStatus
    scheduledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    duration?: IntFieldUpdateOperationsInput | number
    location?: NullableStringFieldUpdateOperationsInput | string | null
    meetingUrl?: NullableStringFieldUpdateOperationsInput | string | null
    roundNumber?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    round?: InterviewRoundUpdateOneWithoutInterviewsNestedInput
    panelMembers?: InterviewPanelMemberUpdateManyWithoutInterviewNestedInput
  }

  export type InterviewUncheckedUpdateWithoutFeedbackInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    requisitionId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    applicationId?: NullableStringFieldUpdateOperationsInput | string | null
    type?: NullableEnumInterviewTypeFieldUpdateOperationsInput | $Enums.InterviewType | null
    stage?: StringFieldUpdateOperationsInput | string
    status?: EnumInterviewStatusFieldUpdateOperationsInput | $Enums.InterviewStatus
    scheduledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    duration?: IntFieldUpdateOperationsInput | number
    location?: NullableStringFieldUpdateOperationsInput | string | null
    meetingUrl?: NullableStringFieldUpdateOperationsInput | string | null
    roundId?: NullableStringFieldUpdateOperationsInput | string | null
    roundNumber?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    panelMembers?: InterviewPanelMemberUncheckedUpdateManyWithoutInterviewNestedInput
  }

  export type InterviewCreateWithoutPanelMembersInput = {
    id?: string
    tenantId: string
    requisitionId: string
    candidateId: string
    applicationId?: string | null
    type?: $Enums.InterviewType | null
    stage: string
    status?: $Enums.InterviewStatus
    scheduledAt?: Date | string | null
    duration?: number
    location?: string | null
    meetingUrl?: string | null
    roundNumber?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    round?: InterviewRoundCreateNestedOneWithoutInterviewsInput
    feedback?: InterviewFeedbackCreateNestedManyWithoutInterviewInput
  }

  export type InterviewUncheckedCreateWithoutPanelMembersInput = {
    id?: string
    tenantId: string
    requisitionId: string
    candidateId: string
    applicationId?: string | null
    type?: $Enums.InterviewType | null
    stage: string
    status?: $Enums.InterviewStatus
    scheduledAt?: Date | string | null
    duration?: number
    location?: string | null
    meetingUrl?: string | null
    roundId?: string | null
    roundNumber?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    feedback?: InterviewFeedbackUncheckedCreateNestedManyWithoutInterviewInput
  }

  export type InterviewCreateOrConnectWithoutPanelMembersInput = {
    where: InterviewWhereUniqueInput
    create: XOR<InterviewCreateWithoutPanelMembersInput, InterviewUncheckedCreateWithoutPanelMembersInput>
  }

  export type InterviewUpsertWithoutPanelMembersInput = {
    update: XOR<InterviewUpdateWithoutPanelMembersInput, InterviewUncheckedUpdateWithoutPanelMembersInput>
    create: XOR<InterviewCreateWithoutPanelMembersInput, InterviewUncheckedCreateWithoutPanelMembersInput>
    where?: InterviewWhereInput
  }

  export type InterviewUpdateToOneWithWhereWithoutPanelMembersInput = {
    where?: InterviewWhereInput
    data: XOR<InterviewUpdateWithoutPanelMembersInput, InterviewUncheckedUpdateWithoutPanelMembersInput>
  }

  export type InterviewUpdateWithoutPanelMembersInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    requisitionId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    applicationId?: NullableStringFieldUpdateOperationsInput | string | null
    type?: NullableEnumInterviewTypeFieldUpdateOperationsInput | $Enums.InterviewType | null
    stage?: StringFieldUpdateOperationsInput | string
    status?: EnumInterviewStatusFieldUpdateOperationsInput | $Enums.InterviewStatus
    scheduledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    duration?: IntFieldUpdateOperationsInput | number
    location?: NullableStringFieldUpdateOperationsInput | string | null
    meetingUrl?: NullableStringFieldUpdateOperationsInput | string | null
    roundNumber?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    round?: InterviewRoundUpdateOneWithoutInterviewsNestedInput
    feedback?: InterviewFeedbackUpdateManyWithoutInterviewNestedInput
  }

  export type InterviewUncheckedUpdateWithoutPanelMembersInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    requisitionId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    applicationId?: NullableStringFieldUpdateOperationsInput | string | null
    type?: NullableEnumInterviewTypeFieldUpdateOperationsInput | $Enums.InterviewType | null
    stage?: StringFieldUpdateOperationsInput | string
    status?: EnumInterviewStatusFieldUpdateOperationsInput | $Enums.InterviewStatus
    scheduledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    duration?: IntFieldUpdateOperationsInput | number
    location?: NullableStringFieldUpdateOperationsInput | string | null
    meetingUrl?: NullableStringFieldUpdateOperationsInput | string | null
    roundId?: NullableStringFieldUpdateOperationsInput | string | null
    roundNumber?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    feedback?: InterviewFeedbackUncheckedUpdateManyWithoutInterviewNestedInput
  }

  export type InterviewPanelMemberCreateManyInterviewInput = {
    id?: string
    userId: string
    role?: string
    isRequired?: boolean
    confirmed?: boolean
    createdAt?: Date | string
  }

  export type InterviewFeedbackCreateManyInterviewInput = {
    id?: string
    tenantId: string
    interviewerId: string
    candidateId: string
    overallRating: number
    recommendation: $Enums.InterviewRecommendation
    strengths?: JsonNullValueInput | InputJsonValue
    concerns?: JsonNullValueInput | InputJsonValue
    notes?: string | null
    submittedAt?: Date | string
  }

  export type InterviewPanelMemberUpdateWithoutInterviewInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    isRequired?: BoolFieldUpdateOperationsInput | boolean
    confirmed?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InterviewPanelMemberUncheckedUpdateWithoutInterviewInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    isRequired?: BoolFieldUpdateOperationsInput | boolean
    confirmed?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InterviewPanelMemberUncheckedUpdateManyWithoutInterviewInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    isRequired?: BoolFieldUpdateOperationsInput | boolean
    confirmed?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InterviewFeedbackUpdateWithoutInterviewInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    interviewerId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    overallRating?: IntFieldUpdateOperationsInput | number
    recommendation?: EnumInterviewRecommendationFieldUpdateOperationsInput | $Enums.InterviewRecommendation
    strengths?: JsonNullValueInput | InputJsonValue
    concerns?: JsonNullValueInput | InputJsonValue
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    submittedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InterviewFeedbackUncheckedUpdateWithoutInterviewInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    interviewerId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    overallRating?: IntFieldUpdateOperationsInput | number
    recommendation?: EnumInterviewRecommendationFieldUpdateOperationsInput | $Enums.InterviewRecommendation
    strengths?: JsonNullValueInput | InputJsonValue
    concerns?: JsonNullValueInput | InputJsonValue
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    submittedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InterviewFeedbackUncheckedUpdateManyWithoutInterviewInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    interviewerId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    overallRating?: IntFieldUpdateOperationsInput | number
    recommendation?: EnumInterviewRecommendationFieldUpdateOperationsInput | $Enums.InterviewRecommendation
    strengths?: JsonNullValueInput | InputJsonValue
    concerns?: JsonNullValueInput | InputJsonValue
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    submittedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InterviewCreateManyRoundInput = {
    id?: string
    tenantId: string
    requisitionId: string
    candidateId: string
    applicationId?: string | null
    type?: $Enums.InterviewType | null
    stage: string
    status?: $Enums.InterviewStatus
    scheduledAt?: Date | string | null
    duration?: number
    location?: string | null
    meetingUrl?: string | null
    roundNumber?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type InterviewUpdateWithoutRoundInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    requisitionId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    applicationId?: NullableStringFieldUpdateOperationsInput | string | null
    type?: NullableEnumInterviewTypeFieldUpdateOperationsInput | $Enums.InterviewType | null
    stage?: StringFieldUpdateOperationsInput | string
    status?: EnumInterviewStatusFieldUpdateOperationsInput | $Enums.InterviewStatus
    scheduledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    duration?: IntFieldUpdateOperationsInput | number
    location?: NullableStringFieldUpdateOperationsInput | string | null
    meetingUrl?: NullableStringFieldUpdateOperationsInput | string | null
    roundNumber?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    panelMembers?: InterviewPanelMemberUpdateManyWithoutInterviewNestedInput
    feedback?: InterviewFeedbackUpdateManyWithoutInterviewNestedInput
  }

  export type InterviewUncheckedUpdateWithoutRoundInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    requisitionId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    applicationId?: NullableStringFieldUpdateOperationsInput | string | null
    type?: NullableEnumInterviewTypeFieldUpdateOperationsInput | $Enums.InterviewType | null
    stage?: StringFieldUpdateOperationsInput | string
    status?: EnumInterviewStatusFieldUpdateOperationsInput | $Enums.InterviewStatus
    scheduledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    duration?: IntFieldUpdateOperationsInput | number
    location?: NullableStringFieldUpdateOperationsInput | string | null
    meetingUrl?: NullableStringFieldUpdateOperationsInput | string | null
    roundNumber?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    panelMembers?: InterviewPanelMemberUncheckedUpdateManyWithoutInterviewNestedInput
    feedback?: InterviewFeedbackUncheckedUpdateManyWithoutInterviewNestedInput
  }

  export type InterviewUncheckedUpdateManyWithoutRoundInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    requisitionId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    applicationId?: NullableStringFieldUpdateOperationsInput | string | null
    type?: NullableEnumInterviewTypeFieldUpdateOperationsInput | $Enums.InterviewType | null
    stage?: StringFieldUpdateOperationsInput | string
    status?: EnumInterviewStatusFieldUpdateOperationsInput | $Enums.InterviewStatus
    scheduledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    duration?: IntFieldUpdateOperationsInput | number
    location?: NullableStringFieldUpdateOperationsInput | string | null
    meetingUrl?: NullableStringFieldUpdateOperationsInput | string | null
    roundNumber?: NullableIntFieldUpdateOperationsInput | number | null
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