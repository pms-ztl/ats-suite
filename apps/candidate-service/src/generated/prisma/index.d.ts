
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
 * Model Candidate
 * 
 */
export type Candidate = $Result.DefaultSelection<Prisma.$CandidatePayload>
/**
 * Model Application
 * 
 */
export type Application = $Result.DefaultSelection<Prisma.$ApplicationPayload>
/**
 * Model ApplicationAttachment
 * 
 */
export type ApplicationAttachment = $Result.DefaultSelection<Prisma.$ApplicationAttachmentPayload>
/**
 * Model CandidateNote
 * 
 */
export type CandidateNote = $Result.DefaultSelection<Prisma.$CandidateNotePayload>

/**
 * Enums
 */
export namespace $Enums {
  export const ApplicationStage: {
  APPLIED: 'APPLIED',
  SCREENED: 'SCREENED',
  PHONE_SCREEN: 'PHONE_SCREEN',
  ASSESSMENT: 'ASSESSMENT',
  INTERVIEW: 'INTERVIEW',
  FINAL_REVIEW: 'FINAL_REVIEW',
  OFFER: 'OFFER',
  HIRED: 'HIRED',
  REJECTED: 'REJECTED',
  WITHDRAWN: 'WITHDRAWN'
};

export type ApplicationStage = (typeof ApplicationStage)[keyof typeof ApplicationStage]


export const ApplicationStatus: {
  ACTIVE: 'ACTIVE',
  ON_HOLD: 'ON_HOLD',
  REJECTED: 'REJECTED',
  WITHDRAWN: 'WITHDRAWN',
  HIRED: 'HIRED'
};

export type ApplicationStatus = (typeof ApplicationStatus)[keyof typeof ApplicationStatus]

}

export type ApplicationStage = $Enums.ApplicationStage

export const ApplicationStage: typeof $Enums.ApplicationStage

export type ApplicationStatus = $Enums.ApplicationStatus

export const ApplicationStatus: typeof $Enums.ApplicationStatus

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Candidates
 * const candidates = await prisma.candidate.findMany()
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
   * // Fetch zero or more Candidates
   * const candidates = await prisma.candidate.findMany()
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
   * `prisma.candidate`: Exposes CRUD operations for the **Candidate** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Candidates
    * const candidates = await prisma.candidate.findMany()
    * ```
    */
  get candidate(): Prisma.CandidateDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.application`: Exposes CRUD operations for the **Application** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Applications
    * const applications = await prisma.application.findMany()
    * ```
    */
  get application(): Prisma.ApplicationDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.applicationAttachment`: Exposes CRUD operations for the **ApplicationAttachment** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ApplicationAttachments
    * const applicationAttachments = await prisma.applicationAttachment.findMany()
    * ```
    */
  get applicationAttachment(): Prisma.ApplicationAttachmentDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.candidateNote`: Exposes CRUD operations for the **CandidateNote** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CandidateNotes
    * const candidateNotes = await prisma.candidateNote.findMany()
    * ```
    */
  get candidateNote(): Prisma.CandidateNoteDelegate<ExtArgs, ClientOptions>;
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
    Candidate: 'Candidate',
    Application: 'Application',
    ApplicationAttachment: 'ApplicationAttachment',
    CandidateNote: 'CandidateNote'
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
      modelProps: "candidate" | "application" | "applicationAttachment" | "candidateNote"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Candidate: {
        payload: Prisma.$CandidatePayload<ExtArgs>
        fields: Prisma.CandidateFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CandidateFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CandidatePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CandidateFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CandidatePayload>
          }
          findFirst: {
            args: Prisma.CandidateFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CandidatePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CandidateFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CandidatePayload>
          }
          findMany: {
            args: Prisma.CandidateFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CandidatePayload>[]
          }
          create: {
            args: Prisma.CandidateCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CandidatePayload>
          }
          createMany: {
            args: Prisma.CandidateCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CandidateCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CandidatePayload>[]
          }
          delete: {
            args: Prisma.CandidateDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CandidatePayload>
          }
          update: {
            args: Prisma.CandidateUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CandidatePayload>
          }
          deleteMany: {
            args: Prisma.CandidateDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CandidateUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CandidateUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CandidatePayload>[]
          }
          upsert: {
            args: Prisma.CandidateUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CandidatePayload>
          }
          aggregate: {
            args: Prisma.CandidateAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCandidate>
          }
          groupBy: {
            args: Prisma.CandidateGroupByArgs<ExtArgs>
            result: $Utils.Optional<CandidateGroupByOutputType>[]
          }
          count: {
            args: Prisma.CandidateCountArgs<ExtArgs>
            result: $Utils.Optional<CandidateCountAggregateOutputType> | number
          }
        }
      }
      Application: {
        payload: Prisma.$ApplicationPayload<ExtArgs>
        fields: Prisma.ApplicationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ApplicationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApplicationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ApplicationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApplicationPayload>
          }
          findFirst: {
            args: Prisma.ApplicationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApplicationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ApplicationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApplicationPayload>
          }
          findMany: {
            args: Prisma.ApplicationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApplicationPayload>[]
          }
          create: {
            args: Prisma.ApplicationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApplicationPayload>
          }
          createMany: {
            args: Prisma.ApplicationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ApplicationCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApplicationPayload>[]
          }
          delete: {
            args: Prisma.ApplicationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApplicationPayload>
          }
          update: {
            args: Prisma.ApplicationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApplicationPayload>
          }
          deleteMany: {
            args: Prisma.ApplicationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ApplicationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ApplicationUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApplicationPayload>[]
          }
          upsert: {
            args: Prisma.ApplicationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApplicationPayload>
          }
          aggregate: {
            args: Prisma.ApplicationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateApplication>
          }
          groupBy: {
            args: Prisma.ApplicationGroupByArgs<ExtArgs>
            result: $Utils.Optional<ApplicationGroupByOutputType>[]
          }
          count: {
            args: Prisma.ApplicationCountArgs<ExtArgs>
            result: $Utils.Optional<ApplicationCountAggregateOutputType> | number
          }
        }
      }
      ApplicationAttachment: {
        payload: Prisma.$ApplicationAttachmentPayload<ExtArgs>
        fields: Prisma.ApplicationAttachmentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ApplicationAttachmentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApplicationAttachmentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ApplicationAttachmentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApplicationAttachmentPayload>
          }
          findFirst: {
            args: Prisma.ApplicationAttachmentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApplicationAttachmentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ApplicationAttachmentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApplicationAttachmentPayload>
          }
          findMany: {
            args: Prisma.ApplicationAttachmentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApplicationAttachmentPayload>[]
          }
          create: {
            args: Prisma.ApplicationAttachmentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApplicationAttachmentPayload>
          }
          createMany: {
            args: Prisma.ApplicationAttachmentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ApplicationAttachmentCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApplicationAttachmentPayload>[]
          }
          delete: {
            args: Prisma.ApplicationAttachmentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApplicationAttachmentPayload>
          }
          update: {
            args: Prisma.ApplicationAttachmentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApplicationAttachmentPayload>
          }
          deleteMany: {
            args: Prisma.ApplicationAttachmentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ApplicationAttachmentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ApplicationAttachmentUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApplicationAttachmentPayload>[]
          }
          upsert: {
            args: Prisma.ApplicationAttachmentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApplicationAttachmentPayload>
          }
          aggregate: {
            args: Prisma.ApplicationAttachmentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateApplicationAttachment>
          }
          groupBy: {
            args: Prisma.ApplicationAttachmentGroupByArgs<ExtArgs>
            result: $Utils.Optional<ApplicationAttachmentGroupByOutputType>[]
          }
          count: {
            args: Prisma.ApplicationAttachmentCountArgs<ExtArgs>
            result: $Utils.Optional<ApplicationAttachmentCountAggregateOutputType> | number
          }
        }
      }
      CandidateNote: {
        payload: Prisma.$CandidateNotePayload<ExtArgs>
        fields: Prisma.CandidateNoteFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CandidateNoteFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CandidateNotePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CandidateNoteFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CandidateNotePayload>
          }
          findFirst: {
            args: Prisma.CandidateNoteFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CandidateNotePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CandidateNoteFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CandidateNotePayload>
          }
          findMany: {
            args: Prisma.CandidateNoteFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CandidateNotePayload>[]
          }
          create: {
            args: Prisma.CandidateNoteCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CandidateNotePayload>
          }
          createMany: {
            args: Prisma.CandidateNoteCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CandidateNoteCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CandidateNotePayload>[]
          }
          delete: {
            args: Prisma.CandidateNoteDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CandidateNotePayload>
          }
          update: {
            args: Prisma.CandidateNoteUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CandidateNotePayload>
          }
          deleteMany: {
            args: Prisma.CandidateNoteDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CandidateNoteUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CandidateNoteUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CandidateNotePayload>[]
          }
          upsert: {
            args: Prisma.CandidateNoteUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CandidateNotePayload>
          }
          aggregate: {
            args: Prisma.CandidateNoteAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCandidateNote>
          }
          groupBy: {
            args: Prisma.CandidateNoteGroupByArgs<ExtArgs>
            result: $Utils.Optional<CandidateNoteGroupByOutputType>[]
          }
          count: {
            args: Prisma.CandidateNoteCountArgs<ExtArgs>
            result: $Utils.Optional<CandidateNoteCountAggregateOutputType> | number
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
    candidate?: CandidateOmit
    application?: ApplicationOmit
    applicationAttachment?: ApplicationAttachmentOmit
    candidateNote?: CandidateNoteOmit
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
   * Count Type CandidateCountOutputType
   */

  export type CandidateCountOutputType = {
    applications: number
    notes: number
  }

  export type CandidateCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    applications?: boolean | CandidateCountOutputTypeCountApplicationsArgs
    notes?: boolean | CandidateCountOutputTypeCountNotesArgs
  }

  // Custom InputTypes
  /**
   * CandidateCountOutputType without action
   */
  export type CandidateCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CandidateCountOutputType
     */
    select?: CandidateCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CandidateCountOutputType without action
   */
  export type CandidateCountOutputTypeCountApplicationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ApplicationWhereInput
  }

  /**
   * CandidateCountOutputType without action
   */
  export type CandidateCountOutputTypeCountNotesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CandidateNoteWhereInput
  }


  /**
   * Count Type ApplicationCountOutputType
   */

  export type ApplicationCountOutputType = {
    attachments: number
  }

  export type ApplicationCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    attachments?: boolean | ApplicationCountOutputTypeCountAttachmentsArgs
  }

  // Custom InputTypes
  /**
   * ApplicationCountOutputType without action
   */
  export type ApplicationCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApplicationCountOutputType
     */
    select?: ApplicationCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ApplicationCountOutputType without action
   */
  export type ApplicationCountOutputTypeCountAttachmentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ApplicationAttachmentWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Candidate
   */

  export type AggregateCandidate = {
    _count: CandidateCountAggregateOutputType | null
    _min: CandidateMinAggregateOutputType | null
    _max: CandidateMaxAggregateOutputType | null
  }

  export type CandidateMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    email: string | null
    firstName: string | null
    lastName: string | null
    phone: string | null
    location: string | null
    country: string | null
    resumeUrl: string | null
    linkedinUrl: string | null
    portfolioUrl: string | null
    summary: string | null
    source: string | null
    isAnonymized: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CandidateMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    email: string | null
    firstName: string | null
    lastName: string | null
    phone: string | null
    location: string | null
    country: string | null
    resumeUrl: string | null
    linkedinUrl: string | null
    portfolioUrl: string | null
    summary: string | null
    source: string | null
    isAnonymized: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CandidateCountAggregateOutputType = {
    id: number
    tenantId: number
    email: number
    firstName: number
    lastName: number
    phone: number
    location: number
    country: number
    resumeUrl: number
    linkedinUrl: number
    portfolioUrl: number
    summary: number
    source: number
    tags: number
    isAnonymized: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type CandidateMinAggregateInputType = {
    id?: true
    tenantId?: true
    email?: true
    firstName?: true
    lastName?: true
    phone?: true
    location?: true
    country?: true
    resumeUrl?: true
    linkedinUrl?: true
    portfolioUrl?: true
    summary?: true
    source?: true
    isAnonymized?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CandidateMaxAggregateInputType = {
    id?: true
    tenantId?: true
    email?: true
    firstName?: true
    lastName?: true
    phone?: true
    location?: true
    country?: true
    resumeUrl?: true
    linkedinUrl?: true
    portfolioUrl?: true
    summary?: true
    source?: true
    isAnonymized?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CandidateCountAggregateInputType = {
    id?: true
    tenantId?: true
    email?: true
    firstName?: true
    lastName?: true
    phone?: true
    location?: true
    country?: true
    resumeUrl?: true
    linkedinUrl?: true
    portfolioUrl?: true
    summary?: true
    source?: true
    tags?: true
    isAnonymized?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type CandidateAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Candidate to aggregate.
     */
    where?: CandidateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Candidates to fetch.
     */
    orderBy?: CandidateOrderByWithRelationInput | CandidateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CandidateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Candidates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Candidates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Candidates
    **/
    _count?: true | CandidateCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CandidateMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CandidateMaxAggregateInputType
  }

  export type GetCandidateAggregateType<T extends CandidateAggregateArgs> = {
        [P in keyof T & keyof AggregateCandidate]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCandidate[P]>
      : GetScalarType<T[P], AggregateCandidate[P]>
  }




  export type CandidateGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CandidateWhereInput
    orderBy?: CandidateOrderByWithAggregationInput | CandidateOrderByWithAggregationInput[]
    by: CandidateScalarFieldEnum[] | CandidateScalarFieldEnum
    having?: CandidateScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CandidateCountAggregateInputType | true
    _min?: CandidateMinAggregateInputType
    _max?: CandidateMaxAggregateInputType
  }

  export type CandidateGroupByOutputType = {
    id: string
    tenantId: string
    email: string
    firstName: string
    lastName: string
    phone: string | null
    location: string | null
    country: string | null
    resumeUrl: string | null
    linkedinUrl: string | null
    portfolioUrl: string | null
    summary: string | null
    source: string | null
    tags: string[]
    isAnonymized: boolean
    createdAt: Date
    updatedAt: Date
    _count: CandidateCountAggregateOutputType | null
    _min: CandidateMinAggregateOutputType | null
    _max: CandidateMaxAggregateOutputType | null
  }

  type GetCandidateGroupByPayload<T extends CandidateGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CandidateGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CandidateGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CandidateGroupByOutputType[P]>
            : GetScalarType<T[P], CandidateGroupByOutputType[P]>
        }
      >
    >


  export type CandidateSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    email?: boolean
    firstName?: boolean
    lastName?: boolean
    phone?: boolean
    location?: boolean
    country?: boolean
    resumeUrl?: boolean
    linkedinUrl?: boolean
    portfolioUrl?: boolean
    summary?: boolean
    source?: boolean
    tags?: boolean
    isAnonymized?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    applications?: boolean | Candidate$applicationsArgs<ExtArgs>
    notes?: boolean | Candidate$notesArgs<ExtArgs>
    _count?: boolean | CandidateCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["candidate"]>

  export type CandidateSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    email?: boolean
    firstName?: boolean
    lastName?: boolean
    phone?: boolean
    location?: boolean
    country?: boolean
    resumeUrl?: boolean
    linkedinUrl?: boolean
    portfolioUrl?: boolean
    summary?: boolean
    source?: boolean
    tags?: boolean
    isAnonymized?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["candidate"]>

  export type CandidateSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    email?: boolean
    firstName?: boolean
    lastName?: boolean
    phone?: boolean
    location?: boolean
    country?: boolean
    resumeUrl?: boolean
    linkedinUrl?: boolean
    portfolioUrl?: boolean
    summary?: boolean
    source?: boolean
    tags?: boolean
    isAnonymized?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["candidate"]>

  export type CandidateSelectScalar = {
    id?: boolean
    tenantId?: boolean
    email?: boolean
    firstName?: boolean
    lastName?: boolean
    phone?: boolean
    location?: boolean
    country?: boolean
    resumeUrl?: boolean
    linkedinUrl?: boolean
    portfolioUrl?: boolean
    summary?: boolean
    source?: boolean
    tags?: boolean
    isAnonymized?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type CandidateOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "email" | "firstName" | "lastName" | "phone" | "location" | "country" | "resumeUrl" | "linkedinUrl" | "portfolioUrl" | "summary" | "source" | "tags" | "isAnonymized" | "createdAt" | "updatedAt", ExtArgs["result"]["candidate"]>
  export type CandidateInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    applications?: boolean | Candidate$applicationsArgs<ExtArgs>
    notes?: boolean | Candidate$notesArgs<ExtArgs>
    _count?: boolean | CandidateCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type CandidateIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type CandidateIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $CandidatePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Candidate"
    objects: {
      applications: Prisma.$ApplicationPayload<ExtArgs>[]
      notes: Prisma.$CandidateNotePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      email: string
      firstName: string
      lastName: string
      phone: string | null
      location: string | null
      country: string | null
      resumeUrl: string | null
      linkedinUrl: string | null
      portfolioUrl: string | null
      summary: string | null
      source: string | null
      tags: string[]
      isAnonymized: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["candidate"]>
    composites: {}
  }

  type CandidateGetPayload<S extends boolean | null | undefined | CandidateDefaultArgs> = $Result.GetResult<Prisma.$CandidatePayload, S>

  type CandidateCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CandidateFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CandidateCountAggregateInputType | true
    }

  export interface CandidateDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Candidate'], meta: { name: 'Candidate' } }
    /**
     * Find zero or one Candidate that matches the filter.
     * @param {CandidateFindUniqueArgs} args - Arguments to find a Candidate
     * @example
     * // Get one Candidate
     * const candidate = await prisma.candidate.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CandidateFindUniqueArgs>(args: SelectSubset<T, CandidateFindUniqueArgs<ExtArgs>>): Prisma__CandidateClient<$Result.GetResult<Prisma.$CandidatePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Candidate that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CandidateFindUniqueOrThrowArgs} args - Arguments to find a Candidate
     * @example
     * // Get one Candidate
     * const candidate = await prisma.candidate.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CandidateFindUniqueOrThrowArgs>(args: SelectSubset<T, CandidateFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CandidateClient<$Result.GetResult<Prisma.$CandidatePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Candidate that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CandidateFindFirstArgs} args - Arguments to find a Candidate
     * @example
     * // Get one Candidate
     * const candidate = await prisma.candidate.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CandidateFindFirstArgs>(args?: SelectSubset<T, CandidateFindFirstArgs<ExtArgs>>): Prisma__CandidateClient<$Result.GetResult<Prisma.$CandidatePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Candidate that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CandidateFindFirstOrThrowArgs} args - Arguments to find a Candidate
     * @example
     * // Get one Candidate
     * const candidate = await prisma.candidate.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CandidateFindFirstOrThrowArgs>(args?: SelectSubset<T, CandidateFindFirstOrThrowArgs<ExtArgs>>): Prisma__CandidateClient<$Result.GetResult<Prisma.$CandidatePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Candidates that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CandidateFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Candidates
     * const candidates = await prisma.candidate.findMany()
     * 
     * // Get first 10 Candidates
     * const candidates = await prisma.candidate.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const candidateWithIdOnly = await prisma.candidate.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CandidateFindManyArgs>(args?: SelectSubset<T, CandidateFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CandidatePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Candidate.
     * @param {CandidateCreateArgs} args - Arguments to create a Candidate.
     * @example
     * // Create one Candidate
     * const Candidate = await prisma.candidate.create({
     *   data: {
     *     // ... data to create a Candidate
     *   }
     * })
     * 
     */
    create<T extends CandidateCreateArgs>(args: SelectSubset<T, CandidateCreateArgs<ExtArgs>>): Prisma__CandidateClient<$Result.GetResult<Prisma.$CandidatePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Candidates.
     * @param {CandidateCreateManyArgs} args - Arguments to create many Candidates.
     * @example
     * // Create many Candidates
     * const candidate = await prisma.candidate.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CandidateCreateManyArgs>(args?: SelectSubset<T, CandidateCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Candidates and returns the data saved in the database.
     * @param {CandidateCreateManyAndReturnArgs} args - Arguments to create many Candidates.
     * @example
     * // Create many Candidates
     * const candidate = await prisma.candidate.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Candidates and only return the `id`
     * const candidateWithIdOnly = await prisma.candidate.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CandidateCreateManyAndReturnArgs>(args?: SelectSubset<T, CandidateCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CandidatePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Candidate.
     * @param {CandidateDeleteArgs} args - Arguments to delete one Candidate.
     * @example
     * // Delete one Candidate
     * const Candidate = await prisma.candidate.delete({
     *   where: {
     *     // ... filter to delete one Candidate
     *   }
     * })
     * 
     */
    delete<T extends CandidateDeleteArgs>(args: SelectSubset<T, CandidateDeleteArgs<ExtArgs>>): Prisma__CandidateClient<$Result.GetResult<Prisma.$CandidatePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Candidate.
     * @param {CandidateUpdateArgs} args - Arguments to update one Candidate.
     * @example
     * // Update one Candidate
     * const candidate = await prisma.candidate.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CandidateUpdateArgs>(args: SelectSubset<T, CandidateUpdateArgs<ExtArgs>>): Prisma__CandidateClient<$Result.GetResult<Prisma.$CandidatePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Candidates.
     * @param {CandidateDeleteManyArgs} args - Arguments to filter Candidates to delete.
     * @example
     * // Delete a few Candidates
     * const { count } = await prisma.candidate.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CandidateDeleteManyArgs>(args?: SelectSubset<T, CandidateDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Candidates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CandidateUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Candidates
     * const candidate = await prisma.candidate.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CandidateUpdateManyArgs>(args: SelectSubset<T, CandidateUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Candidates and returns the data updated in the database.
     * @param {CandidateUpdateManyAndReturnArgs} args - Arguments to update many Candidates.
     * @example
     * // Update many Candidates
     * const candidate = await prisma.candidate.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Candidates and only return the `id`
     * const candidateWithIdOnly = await prisma.candidate.updateManyAndReturn({
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
    updateManyAndReturn<T extends CandidateUpdateManyAndReturnArgs>(args: SelectSubset<T, CandidateUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CandidatePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Candidate.
     * @param {CandidateUpsertArgs} args - Arguments to update or create a Candidate.
     * @example
     * // Update or create a Candidate
     * const candidate = await prisma.candidate.upsert({
     *   create: {
     *     // ... data to create a Candidate
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Candidate we want to update
     *   }
     * })
     */
    upsert<T extends CandidateUpsertArgs>(args: SelectSubset<T, CandidateUpsertArgs<ExtArgs>>): Prisma__CandidateClient<$Result.GetResult<Prisma.$CandidatePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Candidates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CandidateCountArgs} args - Arguments to filter Candidates to count.
     * @example
     * // Count the number of Candidates
     * const count = await prisma.candidate.count({
     *   where: {
     *     // ... the filter for the Candidates we want to count
     *   }
     * })
    **/
    count<T extends CandidateCountArgs>(
      args?: Subset<T, CandidateCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CandidateCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Candidate.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CandidateAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends CandidateAggregateArgs>(args: Subset<T, CandidateAggregateArgs>): Prisma.PrismaPromise<GetCandidateAggregateType<T>>

    /**
     * Group by Candidate.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CandidateGroupByArgs} args - Group by arguments.
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
      T extends CandidateGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CandidateGroupByArgs['orderBy'] }
        : { orderBy?: CandidateGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, CandidateGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCandidateGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Candidate model
   */
  readonly fields: CandidateFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Candidate.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CandidateClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    applications<T extends Candidate$applicationsArgs<ExtArgs> = {}>(args?: Subset<T, Candidate$applicationsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ApplicationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    notes<T extends Candidate$notesArgs<ExtArgs> = {}>(args?: Subset<T, Candidate$notesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CandidateNotePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the Candidate model
   */
  interface CandidateFieldRefs {
    readonly id: FieldRef<"Candidate", 'String'>
    readonly tenantId: FieldRef<"Candidate", 'String'>
    readonly email: FieldRef<"Candidate", 'String'>
    readonly firstName: FieldRef<"Candidate", 'String'>
    readonly lastName: FieldRef<"Candidate", 'String'>
    readonly phone: FieldRef<"Candidate", 'String'>
    readonly location: FieldRef<"Candidate", 'String'>
    readonly country: FieldRef<"Candidate", 'String'>
    readonly resumeUrl: FieldRef<"Candidate", 'String'>
    readonly linkedinUrl: FieldRef<"Candidate", 'String'>
    readonly portfolioUrl: FieldRef<"Candidate", 'String'>
    readonly summary: FieldRef<"Candidate", 'String'>
    readonly source: FieldRef<"Candidate", 'String'>
    readonly tags: FieldRef<"Candidate", 'String[]'>
    readonly isAnonymized: FieldRef<"Candidate", 'Boolean'>
    readonly createdAt: FieldRef<"Candidate", 'DateTime'>
    readonly updatedAt: FieldRef<"Candidate", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Candidate findUnique
   */
  export type CandidateFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Candidate
     */
    select?: CandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Candidate
     */
    omit?: CandidateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CandidateInclude<ExtArgs> | null
    /**
     * Filter, which Candidate to fetch.
     */
    where: CandidateWhereUniqueInput
  }

  /**
   * Candidate findUniqueOrThrow
   */
  export type CandidateFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Candidate
     */
    select?: CandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Candidate
     */
    omit?: CandidateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CandidateInclude<ExtArgs> | null
    /**
     * Filter, which Candidate to fetch.
     */
    where: CandidateWhereUniqueInput
  }

  /**
   * Candidate findFirst
   */
  export type CandidateFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Candidate
     */
    select?: CandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Candidate
     */
    omit?: CandidateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CandidateInclude<ExtArgs> | null
    /**
     * Filter, which Candidate to fetch.
     */
    where?: CandidateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Candidates to fetch.
     */
    orderBy?: CandidateOrderByWithRelationInput | CandidateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Candidates.
     */
    cursor?: CandidateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Candidates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Candidates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Candidates.
     */
    distinct?: CandidateScalarFieldEnum | CandidateScalarFieldEnum[]
  }

  /**
   * Candidate findFirstOrThrow
   */
  export type CandidateFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Candidate
     */
    select?: CandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Candidate
     */
    omit?: CandidateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CandidateInclude<ExtArgs> | null
    /**
     * Filter, which Candidate to fetch.
     */
    where?: CandidateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Candidates to fetch.
     */
    orderBy?: CandidateOrderByWithRelationInput | CandidateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Candidates.
     */
    cursor?: CandidateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Candidates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Candidates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Candidates.
     */
    distinct?: CandidateScalarFieldEnum | CandidateScalarFieldEnum[]
  }

  /**
   * Candidate findMany
   */
  export type CandidateFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Candidate
     */
    select?: CandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Candidate
     */
    omit?: CandidateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CandidateInclude<ExtArgs> | null
    /**
     * Filter, which Candidates to fetch.
     */
    where?: CandidateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Candidates to fetch.
     */
    orderBy?: CandidateOrderByWithRelationInput | CandidateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Candidates.
     */
    cursor?: CandidateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Candidates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Candidates.
     */
    skip?: number
    distinct?: CandidateScalarFieldEnum | CandidateScalarFieldEnum[]
  }

  /**
   * Candidate create
   */
  export type CandidateCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Candidate
     */
    select?: CandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Candidate
     */
    omit?: CandidateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CandidateInclude<ExtArgs> | null
    /**
     * The data needed to create a Candidate.
     */
    data: XOR<CandidateCreateInput, CandidateUncheckedCreateInput>
  }

  /**
   * Candidate createMany
   */
  export type CandidateCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Candidates.
     */
    data: CandidateCreateManyInput | CandidateCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Candidate createManyAndReturn
   */
  export type CandidateCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Candidate
     */
    select?: CandidateSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Candidate
     */
    omit?: CandidateOmit<ExtArgs> | null
    /**
     * The data used to create many Candidates.
     */
    data: CandidateCreateManyInput | CandidateCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Candidate update
   */
  export type CandidateUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Candidate
     */
    select?: CandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Candidate
     */
    omit?: CandidateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CandidateInclude<ExtArgs> | null
    /**
     * The data needed to update a Candidate.
     */
    data: XOR<CandidateUpdateInput, CandidateUncheckedUpdateInput>
    /**
     * Choose, which Candidate to update.
     */
    where: CandidateWhereUniqueInput
  }

  /**
   * Candidate updateMany
   */
  export type CandidateUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Candidates.
     */
    data: XOR<CandidateUpdateManyMutationInput, CandidateUncheckedUpdateManyInput>
    /**
     * Filter which Candidates to update
     */
    where?: CandidateWhereInput
    /**
     * Limit how many Candidates to update.
     */
    limit?: number
  }

  /**
   * Candidate updateManyAndReturn
   */
  export type CandidateUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Candidate
     */
    select?: CandidateSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Candidate
     */
    omit?: CandidateOmit<ExtArgs> | null
    /**
     * The data used to update Candidates.
     */
    data: XOR<CandidateUpdateManyMutationInput, CandidateUncheckedUpdateManyInput>
    /**
     * Filter which Candidates to update
     */
    where?: CandidateWhereInput
    /**
     * Limit how many Candidates to update.
     */
    limit?: number
  }

  /**
   * Candidate upsert
   */
  export type CandidateUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Candidate
     */
    select?: CandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Candidate
     */
    omit?: CandidateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CandidateInclude<ExtArgs> | null
    /**
     * The filter to search for the Candidate to update in case it exists.
     */
    where: CandidateWhereUniqueInput
    /**
     * In case the Candidate found by the `where` argument doesn't exist, create a new Candidate with this data.
     */
    create: XOR<CandidateCreateInput, CandidateUncheckedCreateInput>
    /**
     * In case the Candidate was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CandidateUpdateInput, CandidateUncheckedUpdateInput>
  }

  /**
   * Candidate delete
   */
  export type CandidateDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Candidate
     */
    select?: CandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Candidate
     */
    omit?: CandidateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CandidateInclude<ExtArgs> | null
    /**
     * Filter which Candidate to delete.
     */
    where: CandidateWhereUniqueInput
  }

  /**
   * Candidate deleteMany
   */
  export type CandidateDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Candidates to delete
     */
    where?: CandidateWhereInput
    /**
     * Limit how many Candidates to delete.
     */
    limit?: number
  }

  /**
   * Candidate.applications
   */
  export type Candidate$applicationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Application
     */
    select?: ApplicationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Application
     */
    omit?: ApplicationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationInclude<ExtArgs> | null
    where?: ApplicationWhereInput
    orderBy?: ApplicationOrderByWithRelationInput | ApplicationOrderByWithRelationInput[]
    cursor?: ApplicationWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ApplicationScalarFieldEnum | ApplicationScalarFieldEnum[]
  }

  /**
   * Candidate.notes
   */
  export type Candidate$notesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CandidateNote
     */
    select?: CandidateNoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CandidateNote
     */
    omit?: CandidateNoteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CandidateNoteInclude<ExtArgs> | null
    where?: CandidateNoteWhereInput
    orderBy?: CandidateNoteOrderByWithRelationInput | CandidateNoteOrderByWithRelationInput[]
    cursor?: CandidateNoteWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CandidateNoteScalarFieldEnum | CandidateNoteScalarFieldEnum[]
  }

  /**
   * Candidate without action
   */
  export type CandidateDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Candidate
     */
    select?: CandidateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Candidate
     */
    omit?: CandidateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CandidateInclude<ExtArgs> | null
  }


  /**
   * Model Application
   */

  export type AggregateApplication = {
    _count: ApplicationCountAggregateOutputType | null
    _min: ApplicationMinAggregateOutputType | null
    _max: ApplicationMaxAggregateOutputType | null
  }

  export type ApplicationMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    candidateId: string | null
    requisitionId: string | null
    stage: $Enums.ApplicationStage | null
    status: $Enums.ApplicationStatus | null
    appliedAt: Date | null
    stageUpdatedAt: Date | null
    notes: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ApplicationMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    candidateId: string | null
    requisitionId: string | null
    stage: $Enums.ApplicationStage | null
    status: $Enums.ApplicationStatus | null
    appliedAt: Date | null
    stageUpdatedAt: Date | null
    notes: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ApplicationCountAggregateOutputType = {
    id: number
    tenantId: number
    candidateId: number
    requisitionId: number
    stage: number
    status: number
    appliedAt: number
    stageUpdatedAt: number
    notes: number
    formResponses: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ApplicationMinAggregateInputType = {
    id?: true
    tenantId?: true
    candidateId?: true
    requisitionId?: true
    stage?: true
    status?: true
    appliedAt?: true
    stageUpdatedAt?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ApplicationMaxAggregateInputType = {
    id?: true
    tenantId?: true
    candidateId?: true
    requisitionId?: true
    stage?: true
    status?: true
    appliedAt?: true
    stageUpdatedAt?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ApplicationCountAggregateInputType = {
    id?: true
    tenantId?: true
    candidateId?: true
    requisitionId?: true
    stage?: true
    status?: true
    appliedAt?: true
    stageUpdatedAt?: true
    notes?: true
    formResponses?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ApplicationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Application to aggregate.
     */
    where?: ApplicationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Applications to fetch.
     */
    orderBy?: ApplicationOrderByWithRelationInput | ApplicationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ApplicationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Applications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Applications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Applications
    **/
    _count?: true | ApplicationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ApplicationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ApplicationMaxAggregateInputType
  }

  export type GetApplicationAggregateType<T extends ApplicationAggregateArgs> = {
        [P in keyof T & keyof AggregateApplication]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateApplication[P]>
      : GetScalarType<T[P], AggregateApplication[P]>
  }




  export type ApplicationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ApplicationWhereInput
    orderBy?: ApplicationOrderByWithAggregationInput | ApplicationOrderByWithAggregationInput[]
    by: ApplicationScalarFieldEnum[] | ApplicationScalarFieldEnum
    having?: ApplicationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ApplicationCountAggregateInputType | true
    _min?: ApplicationMinAggregateInputType
    _max?: ApplicationMaxAggregateInputType
  }

  export type ApplicationGroupByOutputType = {
    id: string
    tenantId: string
    candidateId: string
    requisitionId: string
    stage: $Enums.ApplicationStage
    status: $Enums.ApplicationStatus
    appliedAt: Date
    stageUpdatedAt: Date
    notes: string | null
    formResponses: JsonValue | null
    createdAt: Date
    updatedAt: Date
    _count: ApplicationCountAggregateOutputType | null
    _min: ApplicationMinAggregateOutputType | null
    _max: ApplicationMaxAggregateOutputType | null
  }

  type GetApplicationGroupByPayload<T extends ApplicationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ApplicationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ApplicationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ApplicationGroupByOutputType[P]>
            : GetScalarType<T[P], ApplicationGroupByOutputType[P]>
        }
      >
    >


  export type ApplicationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    candidateId?: boolean
    requisitionId?: boolean
    stage?: boolean
    status?: boolean
    appliedAt?: boolean
    stageUpdatedAt?: boolean
    notes?: boolean
    formResponses?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    candidate?: boolean | CandidateDefaultArgs<ExtArgs>
    attachments?: boolean | Application$attachmentsArgs<ExtArgs>
    _count?: boolean | ApplicationCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["application"]>

  export type ApplicationSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    candidateId?: boolean
    requisitionId?: boolean
    stage?: boolean
    status?: boolean
    appliedAt?: boolean
    stageUpdatedAt?: boolean
    notes?: boolean
    formResponses?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    candidate?: boolean | CandidateDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["application"]>

  export type ApplicationSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    candidateId?: boolean
    requisitionId?: boolean
    stage?: boolean
    status?: boolean
    appliedAt?: boolean
    stageUpdatedAt?: boolean
    notes?: boolean
    formResponses?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    candidate?: boolean | CandidateDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["application"]>

  export type ApplicationSelectScalar = {
    id?: boolean
    tenantId?: boolean
    candidateId?: boolean
    requisitionId?: boolean
    stage?: boolean
    status?: boolean
    appliedAt?: boolean
    stageUpdatedAt?: boolean
    notes?: boolean
    formResponses?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ApplicationOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "candidateId" | "requisitionId" | "stage" | "status" | "appliedAt" | "stageUpdatedAt" | "notes" | "formResponses" | "createdAt" | "updatedAt", ExtArgs["result"]["application"]>
  export type ApplicationInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    candidate?: boolean | CandidateDefaultArgs<ExtArgs>
    attachments?: boolean | Application$attachmentsArgs<ExtArgs>
    _count?: boolean | ApplicationCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ApplicationIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    candidate?: boolean | CandidateDefaultArgs<ExtArgs>
  }
  export type ApplicationIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    candidate?: boolean | CandidateDefaultArgs<ExtArgs>
  }

  export type $ApplicationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Application"
    objects: {
      candidate: Prisma.$CandidatePayload<ExtArgs>
      attachments: Prisma.$ApplicationAttachmentPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      candidateId: string
      requisitionId: string
      stage: $Enums.ApplicationStage
      status: $Enums.ApplicationStatus
      appliedAt: Date
      stageUpdatedAt: Date
      notes: string | null
      formResponses: Prisma.JsonValue | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["application"]>
    composites: {}
  }

  type ApplicationGetPayload<S extends boolean | null | undefined | ApplicationDefaultArgs> = $Result.GetResult<Prisma.$ApplicationPayload, S>

  type ApplicationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ApplicationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ApplicationCountAggregateInputType | true
    }

  export interface ApplicationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Application'], meta: { name: 'Application' } }
    /**
     * Find zero or one Application that matches the filter.
     * @param {ApplicationFindUniqueArgs} args - Arguments to find a Application
     * @example
     * // Get one Application
     * const application = await prisma.application.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ApplicationFindUniqueArgs>(args: SelectSubset<T, ApplicationFindUniqueArgs<ExtArgs>>): Prisma__ApplicationClient<$Result.GetResult<Prisma.$ApplicationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Application that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ApplicationFindUniqueOrThrowArgs} args - Arguments to find a Application
     * @example
     * // Get one Application
     * const application = await prisma.application.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ApplicationFindUniqueOrThrowArgs>(args: SelectSubset<T, ApplicationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ApplicationClient<$Result.GetResult<Prisma.$ApplicationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Application that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApplicationFindFirstArgs} args - Arguments to find a Application
     * @example
     * // Get one Application
     * const application = await prisma.application.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ApplicationFindFirstArgs>(args?: SelectSubset<T, ApplicationFindFirstArgs<ExtArgs>>): Prisma__ApplicationClient<$Result.GetResult<Prisma.$ApplicationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Application that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApplicationFindFirstOrThrowArgs} args - Arguments to find a Application
     * @example
     * // Get one Application
     * const application = await prisma.application.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ApplicationFindFirstOrThrowArgs>(args?: SelectSubset<T, ApplicationFindFirstOrThrowArgs<ExtArgs>>): Prisma__ApplicationClient<$Result.GetResult<Prisma.$ApplicationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Applications that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApplicationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Applications
     * const applications = await prisma.application.findMany()
     * 
     * // Get first 10 Applications
     * const applications = await prisma.application.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const applicationWithIdOnly = await prisma.application.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ApplicationFindManyArgs>(args?: SelectSubset<T, ApplicationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ApplicationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Application.
     * @param {ApplicationCreateArgs} args - Arguments to create a Application.
     * @example
     * // Create one Application
     * const Application = await prisma.application.create({
     *   data: {
     *     // ... data to create a Application
     *   }
     * })
     * 
     */
    create<T extends ApplicationCreateArgs>(args: SelectSubset<T, ApplicationCreateArgs<ExtArgs>>): Prisma__ApplicationClient<$Result.GetResult<Prisma.$ApplicationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Applications.
     * @param {ApplicationCreateManyArgs} args - Arguments to create many Applications.
     * @example
     * // Create many Applications
     * const application = await prisma.application.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ApplicationCreateManyArgs>(args?: SelectSubset<T, ApplicationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Applications and returns the data saved in the database.
     * @param {ApplicationCreateManyAndReturnArgs} args - Arguments to create many Applications.
     * @example
     * // Create many Applications
     * const application = await prisma.application.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Applications and only return the `id`
     * const applicationWithIdOnly = await prisma.application.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ApplicationCreateManyAndReturnArgs>(args?: SelectSubset<T, ApplicationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ApplicationPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Application.
     * @param {ApplicationDeleteArgs} args - Arguments to delete one Application.
     * @example
     * // Delete one Application
     * const Application = await prisma.application.delete({
     *   where: {
     *     // ... filter to delete one Application
     *   }
     * })
     * 
     */
    delete<T extends ApplicationDeleteArgs>(args: SelectSubset<T, ApplicationDeleteArgs<ExtArgs>>): Prisma__ApplicationClient<$Result.GetResult<Prisma.$ApplicationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Application.
     * @param {ApplicationUpdateArgs} args - Arguments to update one Application.
     * @example
     * // Update one Application
     * const application = await prisma.application.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ApplicationUpdateArgs>(args: SelectSubset<T, ApplicationUpdateArgs<ExtArgs>>): Prisma__ApplicationClient<$Result.GetResult<Prisma.$ApplicationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Applications.
     * @param {ApplicationDeleteManyArgs} args - Arguments to filter Applications to delete.
     * @example
     * // Delete a few Applications
     * const { count } = await prisma.application.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ApplicationDeleteManyArgs>(args?: SelectSubset<T, ApplicationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Applications.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApplicationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Applications
     * const application = await prisma.application.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ApplicationUpdateManyArgs>(args: SelectSubset<T, ApplicationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Applications and returns the data updated in the database.
     * @param {ApplicationUpdateManyAndReturnArgs} args - Arguments to update many Applications.
     * @example
     * // Update many Applications
     * const application = await prisma.application.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Applications and only return the `id`
     * const applicationWithIdOnly = await prisma.application.updateManyAndReturn({
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
    updateManyAndReturn<T extends ApplicationUpdateManyAndReturnArgs>(args: SelectSubset<T, ApplicationUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ApplicationPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Application.
     * @param {ApplicationUpsertArgs} args - Arguments to update or create a Application.
     * @example
     * // Update or create a Application
     * const application = await prisma.application.upsert({
     *   create: {
     *     // ... data to create a Application
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Application we want to update
     *   }
     * })
     */
    upsert<T extends ApplicationUpsertArgs>(args: SelectSubset<T, ApplicationUpsertArgs<ExtArgs>>): Prisma__ApplicationClient<$Result.GetResult<Prisma.$ApplicationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Applications.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApplicationCountArgs} args - Arguments to filter Applications to count.
     * @example
     * // Count the number of Applications
     * const count = await prisma.application.count({
     *   where: {
     *     // ... the filter for the Applications we want to count
     *   }
     * })
    **/
    count<T extends ApplicationCountArgs>(
      args?: Subset<T, ApplicationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ApplicationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Application.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApplicationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ApplicationAggregateArgs>(args: Subset<T, ApplicationAggregateArgs>): Prisma.PrismaPromise<GetApplicationAggregateType<T>>

    /**
     * Group by Application.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApplicationGroupByArgs} args - Group by arguments.
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
      T extends ApplicationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ApplicationGroupByArgs['orderBy'] }
        : { orderBy?: ApplicationGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ApplicationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetApplicationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Application model
   */
  readonly fields: ApplicationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Application.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ApplicationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    candidate<T extends CandidateDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CandidateDefaultArgs<ExtArgs>>): Prisma__CandidateClient<$Result.GetResult<Prisma.$CandidatePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    attachments<T extends Application$attachmentsArgs<ExtArgs> = {}>(args?: Subset<T, Application$attachmentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ApplicationAttachmentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the Application model
   */
  interface ApplicationFieldRefs {
    readonly id: FieldRef<"Application", 'String'>
    readonly tenantId: FieldRef<"Application", 'String'>
    readonly candidateId: FieldRef<"Application", 'String'>
    readonly requisitionId: FieldRef<"Application", 'String'>
    readonly stage: FieldRef<"Application", 'ApplicationStage'>
    readonly status: FieldRef<"Application", 'ApplicationStatus'>
    readonly appliedAt: FieldRef<"Application", 'DateTime'>
    readonly stageUpdatedAt: FieldRef<"Application", 'DateTime'>
    readonly notes: FieldRef<"Application", 'String'>
    readonly formResponses: FieldRef<"Application", 'Json'>
    readonly createdAt: FieldRef<"Application", 'DateTime'>
    readonly updatedAt: FieldRef<"Application", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Application findUnique
   */
  export type ApplicationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Application
     */
    select?: ApplicationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Application
     */
    omit?: ApplicationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationInclude<ExtArgs> | null
    /**
     * Filter, which Application to fetch.
     */
    where: ApplicationWhereUniqueInput
  }

  /**
   * Application findUniqueOrThrow
   */
  export type ApplicationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Application
     */
    select?: ApplicationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Application
     */
    omit?: ApplicationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationInclude<ExtArgs> | null
    /**
     * Filter, which Application to fetch.
     */
    where: ApplicationWhereUniqueInput
  }

  /**
   * Application findFirst
   */
  export type ApplicationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Application
     */
    select?: ApplicationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Application
     */
    omit?: ApplicationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationInclude<ExtArgs> | null
    /**
     * Filter, which Application to fetch.
     */
    where?: ApplicationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Applications to fetch.
     */
    orderBy?: ApplicationOrderByWithRelationInput | ApplicationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Applications.
     */
    cursor?: ApplicationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Applications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Applications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Applications.
     */
    distinct?: ApplicationScalarFieldEnum | ApplicationScalarFieldEnum[]
  }

  /**
   * Application findFirstOrThrow
   */
  export type ApplicationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Application
     */
    select?: ApplicationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Application
     */
    omit?: ApplicationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationInclude<ExtArgs> | null
    /**
     * Filter, which Application to fetch.
     */
    where?: ApplicationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Applications to fetch.
     */
    orderBy?: ApplicationOrderByWithRelationInput | ApplicationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Applications.
     */
    cursor?: ApplicationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Applications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Applications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Applications.
     */
    distinct?: ApplicationScalarFieldEnum | ApplicationScalarFieldEnum[]
  }

  /**
   * Application findMany
   */
  export type ApplicationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Application
     */
    select?: ApplicationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Application
     */
    omit?: ApplicationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationInclude<ExtArgs> | null
    /**
     * Filter, which Applications to fetch.
     */
    where?: ApplicationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Applications to fetch.
     */
    orderBy?: ApplicationOrderByWithRelationInput | ApplicationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Applications.
     */
    cursor?: ApplicationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Applications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Applications.
     */
    skip?: number
    distinct?: ApplicationScalarFieldEnum | ApplicationScalarFieldEnum[]
  }

  /**
   * Application create
   */
  export type ApplicationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Application
     */
    select?: ApplicationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Application
     */
    omit?: ApplicationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationInclude<ExtArgs> | null
    /**
     * The data needed to create a Application.
     */
    data: XOR<ApplicationCreateInput, ApplicationUncheckedCreateInput>
  }

  /**
   * Application createMany
   */
  export type ApplicationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Applications.
     */
    data: ApplicationCreateManyInput | ApplicationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Application createManyAndReturn
   */
  export type ApplicationCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Application
     */
    select?: ApplicationSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Application
     */
    omit?: ApplicationOmit<ExtArgs> | null
    /**
     * The data used to create many Applications.
     */
    data: ApplicationCreateManyInput | ApplicationCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Application update
   */
  export type ApplicationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Application
     */
    select?: ApplicationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Application
     */
    omit?: ApplicationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationInclude<ExtArgs> | null
    /**
     * The data needed to update a Application.
     */
    data: XOR<ApplicationUpdateInput, ApplicationUncheckedUpdateInput>
    /**
     * Choose, which Application to update.
     */
    where: ApplicationWhereUniqueInput
  }

  /**
   * Application updateMany
   */
  export type ApplicationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Applications.
     */
    data: XOR<ApplicationUpdateManyMutationInput, ApplicationUncheckedUpdateManyInput>
    /**
     * Filter which Applications to update
     */
    where?: ApplicationWhereInput
    /**
     * Limit how many Applications to update.
     */
    limit?: number
  }

  /**
   * Application updateManyAndReturn
   */
  export type ApplicationUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Application
     */
    select?: ApplicationSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Application
     */
    omit?: ApplicationOmit<ExtArgs> | null
    /**
     * The data used to update Applications.
     */
    data: XOR<ApplicationUpdateManyMutationInput, ApplicationUncheckedUpdateManyInput>
    /**
     * Filter which Applications to update
     */
    where?: ApplicationWhereInput
    /**
     * Limit how many Applications to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Application upsert
   */
  export type ApplicationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Application
     */
    select?: ApplicationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Application
     */
    omit?: ApplicationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationInclude<ExtArgs> | null
    /**
     * The filter to search for the Application to update in case it exists.
     */
    where: ApplicationWhereUniqueInput
    /**
     * In case the Application found by the `where` argument doesn't exist, create a new Application with this data.
     */
    create: XOR<ApplicationCreateInput, ApplicationUncheckedCreateInput>
    /**
     * In case the Application was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ApplicationUpdateInput, ApplicationUncheckedUpdateInput>
  }

  /**
   * Application delete
   */
  export type ApplicationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Application
     */
    select?: ApplicationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Application
     */
    omit?: ApplicationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationInclude<ExtArgs> | null
    /**
     * Filter which Application to delete.
     */
    where: ApplicationWhereUniqueInput
  }

  /**
   * Application deleteMany
   */
  export type ApplicationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Applications to delete
     */
    where?: ApplicationWhereInput
    /**
     * Limit how many Applications to delete.
     */
    limit?: number
  }

  /**
   * Application.attachments
   */
  export type Application$attachmentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApplicationAttachment
     */
    select?: ApplicationAttachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApplicationAttachment
     */
    omit?: ApplicationAttachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationAttachmentInclude<ExtArgs> | null
    where?: ApplicationAttachmentWhereInput
    orderBy?: ApplicationAttachmentOrderByWithRelationInput | ApplicationAttachmentOrderByWithRelationInput[]
    cursor?: ApplicationAttachmentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ApplicationAttachmentScalarFieldEnum | ApplicationAttachmentScalarFieldEnum[]
  }

  /**
   * Application without action
   */
  export type ApplicationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Application
     */
    select?: ApplicationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Application
     */
    omit?: ApplicationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationInclude<ExtArgs> | null
  }


  /**
   * Model ApplicationAttachment
   */

  export type AggregateApplicationAttachment = {
    _count: ApplicationAttachmentCountAggregateOutputType | null
    _avg: ApplicationAttachmentAvgAggregateOutputType | null
    _sum: ApplicationAttachmentSumAggregateOutputType | null
    _min: ApplicationAttachmentMinAggregateOutputType | null
    _max: ApplicationAttachmentMaxAggregateOutputType | null
  }

  export type ApplicationAttachmentAvgAggregateOutputType = {
    fileSize: number | null
  }

  export type ApplicationAttachmentSumAggregateOutputType = {
    fileSize: number | null
  }

  export type ApplicationAttachmentMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    applicationId: string | null
    fieldId: string | null
    fileName: string | null
    originalName: string | null
    fileSize: number | null
    mimeType: string | null
    storageKey: string | null
    createdAt: Date | null
  }

  export type ApplicationAttachmentMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    applicationId: string | null
    fieldId: string | null
    fileName: string | null
    originalName: string | null
    fileSize: number | null
    mimeType: string | null
    storageKey: string | null
    createdAt: Date | null
  }

  export type ApplicationAttachmentCountAggregateOutputType = {
    id: number
    tenantId: number
    applicationId: number
    fieldId: number
    fileName: number
    originalName: number
    fileSize: number
    mimeType: number
    storageKey: number
    createdAt: number
    _all: number
  }


  export type ApplicationAttachmentAvgAggregateInputType = {
    fileSize?: true
  }

  export type ApplicationAttachmentSumAggregateInputType = {
    fileSize?: true
  }

  export type ApplicationAttachmentMinAggregateInputType = {
    id?: true
    tenantId?: true
    applicationId?: true
    fieldId?: true
    fileName?: true
    originalName?: true
    fileSize?: true
    mimeType?: true
    storageKey?: true
    createdAt?: true
  }

  export type ApplicationAttachmentMaxAggregateInputType = {
    id?: true
    tenantId?: true
    applicationId?: true
    fieldId?: true
    fileName?: true
    originalName?: true
    fileSize?: true
    mimeType?: true
    storageKey?: true
    createdAt?: true
  }

  export type ApplicationAttachmentCountAggregateInputType = {
    id?: true
    tenantId?: true
    applicationId?: true
    fieldId?: true
    fileName?: true
    originalName?: true
    fileSize?: true
    mimeType?: true
    storageKey?: true
    createdAt?: true
    _all?: true
  }

  export type ApplicationAttachmentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ApplicationAttachment to aggregate.
     */
    where?: ApplicationAttachmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ApplicationAttachments to fetch.
     */
    orderBy?: ApplicationAttachmentOrderByWithRelationInput | ApplicationAttachmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ApplicationAttachmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ApplicationAttachments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ApplicationAttachments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ApplicationAttachments
    **/
    _count?: true | ApplicationAttachmentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ApplicationAttachmentAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ApplicationAttachmentSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ApplicationAttachmentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ApplicationAttachmentMaxAggregateInputType
  }

  export type GetApplicationAttachmentAggregateType<T extends ApplicationAttachmentAggregateArgs> = {
        [P in keyof T & keyof AggregateApplicationAttachment]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateApplicationAttachment[P]>
      : GetScalarType<T[P], AggregateApplicationAttachment[P]>
  }




  export type ApplicationAttachmentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ApplicationAttachmentWhereInput
    orderBy?: ApplicationAttachmentOrderByWithAggregationInput | ApplicationAttachmentOrderByWithAggregationInput[]
    by: ApplicationAttachmentScalarFieldEnum[] | ApplicationAttachmentScalarFieldEnum
    having?: ApplicationAttachmentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ApplicationAttachmentCountAggregateInputType | true
    _avg?: ApplicationAttachmentAvgAggregateInputType
    _sum?: ApplicationAttachmentSumAggregateInputType
    _min?: ApplicationAttachmentMinAggregateInputType
    _max?: ApplicationAttachmentMaxAggregateInputType
  }

  export type ApplicationAttachmentGroupByOutputType = {
    id: string
    tenantId: string
    applicationId: string
    fieldId: string
    fileName: string
    originalName: string
    fileSize: number
    mimeType: string
    storageKey: string
    createdAt: Date
    _count: ApplicationAttachmentCountAggregateOutputType | null
    _avg: ApplicationAttachmentAvgAggregateOutputType | null
    _sum: ApplicationAttachmentSumAggregateOutputType | null
    _min: ApplicationAttachmentMinAggregateOutputType | null
    _max: ApplicationAttachmentMaxAggregateOutputType | null
  }

  type GetApplicationAttachmentGroupByPayload<T extends ApplicationAttachmentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ApplicationAttachmentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ApplicationAttachmentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ApplicationAttachmentGroupByOutputType[P]>
            : GetScalarType<T[P], ApplicationAttachmentGroupByOutputType[P]>
        }
      >
    >


  export type ApplicationAttachmentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    applicationId?: boolean
    fieldId?: boolean
    fileName?: boolean
    originalName?: boolean
    fileSize?: boolean
    mimeType?: boolean
    storageKey?: boolean
    createdAt?: boolean
    application?: boolean | ApplicationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["applicationAttachment"]>

  export type ApplicationAttachmentSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    applicationId?: boolean
    fieldId?: boolean
    fileName?: boolean
    originalName?: boolean
    fileSize?: boolean
    mimeType?: boolean
    storageKey?: boolean
    createdAt?: boolean
    application?: boolean | ApplicationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["applicationAttachment"]>

  export type ApplicationAttachmentSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    applicationId?: boolean
    fieldId?: boolean
    fileName?: boolean
    originalName?: boolean
    fileSize?: boolean
    mimeType?: boolean
    storageKey?: boolean
    createdAt?: boolean
    application?: boolean | ApplicationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["applicationAttachment"]>

  export type ApplicationAttachmentSelectScalar = {
    id?: boolean
    tenantId?: boolean
    applicationId?: boolean
    fieldId?: boolean
    fileName?: boolean
    originalName?: boolean
    fileSize?: boolean
    mimeType?: boolean
    storageKey?: boolean
    createdAt?: boolean
  }

  export type ApplicationAttachmentOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "applicationId" | "fieldId" | "fileName" | "originalName" | "fileSize" | "mimeType" | "storageKey" | "createdAt", ExtArgs["result"]["applicationAttachment"]>
  export type ApplicationAttachmentInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    application?: boolean | ApplicationDefaultArgs<ExtArgs>
  }
  export type ApplicationAttachmentIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    application?: boolean | ApplicationDefaultArgs<ExtArgs>
  }
  export type ApplicationAttachmentIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    application?: boolean | ApplicationDefaultArgs<ExtArgs>
  }

  export type $ApplicationAttachmentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ApplicationAttachment"
    objects: {
      application: Prisma.$ApplicationPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      applicationId: string
      fieldId: string
      fileName: string
      originalName: string
      fileSize: number
      mimeType: string
      storageKey: string
      createdAt: Date
    }, ExtArgs["result"]["applicationAttachment"]>
    composites: {}
  }

  type ApplicationAttachmentGetPayload<S extends boolean | null | undefined | ApplicationAttachmentDefaultArgs> = $Result.GetResult<Prisma.$ApplicationAttachmentPayload, S>

  type ApplicationAttachmentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ApplicationAttachmentFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ApplicationAttachmentCountAggregateInputType | true
    }

  export interface ApplicationAttachmentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ApplicationAttachment'], meta: { name: 'ApplicationAttachment' } }
    /**
     * Find zero or one ApplicationAttachment that matches the filter.
     * @param {ApplicationAttachmentFindUniqueArgs} args - Arguments to find a ApplicationAttachment
     * @example
     * // Get one ApplicationAttachment
     * const applicationAttachment = await prisma.applicationAttachment.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ApplicationAttachmentFindUniqueArgs>(args: SelectSubset<T, ApplicationAttachmentFindUniqueArgs<ExtArgs>>): Prisma__ApplicationAttachmentClient<$Result.GetResult<Prisma.$ApplicationAttachmentPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ApplicationAttachment that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ApplicationAttachmentFindUniqueOrThrowArgs} args - Arguments to find a ApplicationAttachment
     * @example
     * // Get one ApplicationAttachment
     * const applicationAttachment = await prisma.applicationAttachment.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ApplicationAttachmentFindUniqueOrThrowArgs>(args: SelectSubset<T, ApplicationAttachmentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ApplicationAttachmentClient<$Result.GetResult<Prisma.$ApplicationAttachmentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ApplicationAttachment that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApplicationAttachmentFindFirstArgs} args - Arguments to find a ApplicationAttachment
     * @example
     * // Get one ApplicationAttachment
     * const applicationAttachment = await prisma.applicationAttachment.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ApplicationAttachmentFindFirstArgs>(args?: SelectSubset<T, ApplicationAttachmentFindFirstArgs<ExtArgs>>): Prisma__ApplicationAttachmentClient<$Result.GetResult<Prisma.$ApplicationAttachmentPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ApplicationAttachment that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApplicationAttachmentFindFirstOrThrowArgs} args - Arguments to find a ApplicationAttachment
     * @example
     * // Get one ApplicationAttachment
     * const applicationAttachment = await prisma.applicationAttachment.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ApplicationAttachmentFindFirstOrThrowArgs>(args?: SelectSubset<T, ApplicationAttachmentFindFirstOrThrowArgs<ExtArgs>>): Prisma__ApplicationAttachmentClient<$Result.GetResult<Prisma.$ApplicationAttachmentPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ApplicationAttachments that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApplicationAttachmentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ApplicationAttachments
     * const applicationAttachments = await prisma.applicationAttachment.findMany()
     * 
     * // Get first 10 ApplicationAttachments
     * const applicationAttachments = await prisma.applicationAttachment.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const applicationAttachmentWithIdOnly = await prisma.applicationAttachment.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ApplicationAttachmentFindManyArgs>(args?: SelectSubset<T, ApplicationAttachmentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ApplicationAttachmentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ApplicationAttachment.
     * @param {ApplicationAttachmentCreateArgs} args - Arguments to create a ApplicationAttachment.
     * @example
     * // Create one ApplicationAttachment
     * const ApplicationAttachment = await prisma.applicationAttachment.create({
     *   data: {
     *     // ... data to create a ApplicationAttachment
     *   }
     * })
     * 
     */
    create<T extends ApplicationAttachmentCreateArgs>(args: SelectSubset<T, ApplicationAttachmentCreateArgs<ExtArgs>>): Prisma__ApplicationAttachmentClient<$Result.GetResult<Prisma.$ApplicationAttachmentPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ApplicationAttachments.
     * @param {ApplicationAttachmentCreateManyArgs} args - Arguments to create many ApplicationAttachments.
     * @example
     * // Create many ApplicationAttachments
     * const applicationAttachment = await prisma.applicationAttachment.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ApplicationAttachmentCreateManyArgs>(args?: SelectSubset<T, ApplicationAttachmentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ApplicationAttachments and returns the data saved in the database.
     * @param {ApplicationAttachmentCreateManyAndReturnArgs} args - Arguments to create many ApplicationAttachments.
     * @example
     * // Create many ApplicationAttachments
     * const applicationAttachment = await prisma.applicationAttachment.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ApplicationAttachments and only return the `id`
     * const applicationAttachmentWithIdOnly = await prisma.applicationAttachment.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ApplicationAttachmentCreateManyAndReturnArgs>(args?: SelectSubset<T, ApplicationAttachmentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ApplicationAttachmentPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ApplicationAttachment.
     * @param {ApplicationAttachmentDeleteArgs} args - Arguments to delete one ApplicationAttachment.
     * @example
     * // Delete one ApplicationAttachment
     * const ApplicationAttachment = await prisma.applicationAttachment.delete({
     *   where: {
     *     // ... filter to delete one ApplicationAttachment
     *   }
     * })
     * 
     */
    delete<T extends ApplicationAttachmentDeleteArgs>(args: SelectSubset<T, ApplicationAttachmentDeleteArgs<ExtArgs>>): Prisma__ApplicationAttachmentClient<$Result.GetResult<Prisma.$ApplicationAttachmentPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ApplicationAttachment.
     * @param {ApplicationAttachmentUpdateArgs} args - Arguments to update one ApplicationAttachment.
     * @example
     * // Update one ApplicationAttachment
     * const applicationAttachment = await prisma.applicationAttachment.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ApplicationAttachmentUpdateArgs>(args: SelectSubset<T, ApplicationAttachmentUpdateArgs<ExtArgs>>): Prisma__ApplicationAttachmentClient<$Result.GetResult<Prisma.$ApplicationAttachmentPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ApplicationAttachments.
     * @param {ApplicationAttachmentDeleteManyArgs} args - Arguments to filter ApplicationAttachments to delete.
     * @example
     * // Delete a few ApplicationAttachments
     * const { count } = await prisma.applicationAttachment.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ApplicationAttachmentDeleteManyArgs>(args?: SelectSubset<T, ApplicationAttachmentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ApplicationAttachments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApplicationAttachmentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ApplicationAttachments
     * const applicationAttachment = await prisma.applicationAttachment.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ApplicationAttachmentUpdateManyArgs>(args: SelectSubset<T, ApplicationAttachmentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ApplicationAttachments and returns the data updated in the database.
     * @param {ApplicationAttachmentUpdateManyAndReturnArgs} args - Arguments to update many ApplicationAttachments.
     * @example
     * // Update many ApplicationAttachments
     * const applicationAttachment = await prisma.applicationAttachment.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ApplicationAttachments and only return the `id`
     * const applicationAttachmentWithIdOnly = await prisma.applicationAttachment.updateManyAndReturn({
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
    updateManyAndReturn<T extends ApplicationAttachmentUpdateManyAndReturnArgs>(args: SelectSubset<T, ApplicationAttachmentUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ApplicationAttachmentPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ApplicationAttachment.
     * @param {ApplicationAttachmentUpsertArgs} args - Arguments to update or create a ApplicationAttachment.
     * @example
     * // Update or create a ApplicationAttachment
     * const applicationAttachment = await prisma.applicationAttachment.upsert({
     *   create: {
     *     // ... data to create a ApplicationAttachment
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ApplicationAttachment we want to update
     *   }
     * })
     */
    upsert<T extends ApplicationAttachmentUpsertArgs>(args: SelectSubset<T, ApplicationAttachmentUpsertArgs<ExtArgs>>): Prisma__ApplicationAttachmentClient<$Result.GetResult<Prisma.$ApplicationAttachmentPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ApplicationAttachments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApplicationAttachmentCountArgs} args - Arguments to filter ApplicationAttachments to count.
     * @example
     * // Count the number of ApplicationAttachments
     * const count = await prisma.applicationAttachment.count({
     *   where: {
     *     // ... the filter for the ApplicationAttachments we want to count
     *   }
     * })
    **/
    count<T extends ApplicationAttachmentCountArgs>(
      args?: Subset<T, ApplicationAttachmentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ApplicationAttachmentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ApplicationAttachment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApplicationAttachmentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ApplicationAttachmentAggregateArgs>(args: Subset<T, ApplicationAttachmentAggregateArgs>): Prisma.PrismaPromise<GetApplicationAttachmentAggregateType<T>>

    /**
     * Group by ApplicationAttachment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApplicationAttachmentGroupByArgs} args - Group by arguments.
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
      T extends ApplicationAttachmentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ApplicationAttachmentGroupByArgs['orderBy'] }
        : { orderBy?: ApplicationAttachmentGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ApplicationAttachmentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetApplicationAttachmentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ApplicationAttachment model
   */
  readonly fields: ApplicationAttachmentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ApplicationAttachment.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ApplicationAttachmentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    application<T extends ApplicationDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ApplicationDefaultArgs<ExtArgs>>): Prisma__ApplicationClient<$Result.GetResult<Prisma.$ApplicationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the ApplicationAttachment model
   */
  interface ApplicationAttachmentFieldRefs {
    readonly id: FieldRef<"ApplicationAttachment", 'String'>
    readonly tenantId: FieldRef<"ApplicationAttachment", 'String'>
    readonly applicationId: FieldRef<"ApplicationAttachment", 'String'>
    readonly fieldId: FieldRef<"ApplicationAttachment", 'String'>
    readonly fileName: FieldRef<"ApplicationAttachment", 'String'>
    readonly originalName: FieldRef<"ApplicationAttachment", 'String'>
    readonly fileSize: FieldRef<"ApplicationAttachment", 'Int'>
    readonly mimeType: FieldRef<"ApplicationAttachment", 'String'>
    readonly storageKey: FieldRef<"ApplicationAttachment", 'String'>
    readonly createdAt: FieldRef<"ApplicationAttachment", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ApplicationAttachment findUnique
   */
  export type ApplicationAttachmentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApplicationAttachment
     */
    select?: ApplicationAttachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApplicationAttachment
     */
    omit?: ApplicationAttachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationAttachmentInclude<ExtArgs> | null
    /**
     * Filter, which ApplicationAttachment to fetch.
     */
    where: ApplicationAttachmentWhereUniqueInput
  }

  /**
   * ApplicationAttachment findUniqueOrThrow
   */
  export type ApplicationAttachmentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApplicationAttachment
     */
    select?: ApplicationAttachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApplicationAttachment
     */
    omit?: ApplicationAttachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationAttachmentInclude<ExtArgs> | null
    /**
     * Filter, which ApplicationAttachment to fetch.
     */
    where: ApplicationAttachmentWhereUniqueInput
  }

  /**
   * ApplicationAttachment findFirst
   */
  export type ApplicationAttachmentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApplicationAttachment
     */
    select?: ApplicationAttachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApplicationAttachment
     */
    omit?: ApplicationAttachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationAttachmentInclude<ExtArgs> | null
    /**
     * Filter, which ApplicationAttachment to fetch.
     */
    where?: ApplicationAttachmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ApplicationAttachments to fetch.
     */
    orderBy?: ApplicationAttachmentOrderByWithRelationInput | ApplicationAttachmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ApplicationAttachments.
     */
    cursor?: ApplicationAttachmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ApplicationAttachments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ApplicationAttachments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ApplicationAttachments.
     */
    distinct?: ApplicationAttachmentScalarFieldEnum | ApplicationAttachmentScalarFieldEnum[]
  }

  /**
   * ApplicationAttachment findFirstOrThrow
   */
  export type ApplicationAttachmentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApplicationAttachment
     */
    select?: ApplicationAttachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApplicationAttachment
     */
    omit?: ApplicationAttachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationAttachmentInclude<ExtArgs> | null
    /**
     * Filter, which ApplicationAttachment to fetch.
     */
    where?: ApplicationAttachmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ApplicationAttachments to fetch.
     */
    orderBy?: ApplicationAttachmentOrderByWithRelationInput | ApplicationAttachmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ApplicationAttachments.
     */
    cursor?: ApplicationAttachmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ApplicationAttachments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ApplicationAttachments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ApplicationAttachments.
     */
    distinct?: ApplicationAttachmentScalarFieldEnum | ApplicationAttachmentScalarFieldEnum[]
  }

  /**
   * ApplicationAttachment findMany
   */
  export type ApplicationAttachmentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApplicationAttachment
     */
    select?: ApplicationAttachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApplicationAttachment
     */
    omit?: ApplicationAttachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationAttachmentInclude<ExtArgs> | null
    /**
     * Filter, which ApplicationAttachments to fetch.
     */
    where?: ApplicationAttachmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ApplicationAttachments to fetch.
     */
    orderBy?: ApplicationAttachmentOrderByWithRelationInput | ApplicationAttachmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ApplicationAttachments.
     */
    cursor?: ApplicationAttachmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ApplicationAttachments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ApplicationAttachments.
     */
    skip?: number
    distinct?: ApplicationAttachmentScalarFieldEnum | ApplicationAttachmentScalarFieldEnum[]
  }

  /**
   * ApplicationAttachment create
   */
  export type ApplicationAttachmentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApplicationAttachment
     */
    select?: ApplicationAttachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApplicationAttachment
     */
    omit?: ApplicationAttachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationAttachmentInclude<ExtArgs> | null
    /**
     * The data needed to create a ApplicationAttachment.
     */
    data: XOR<ApplicationAttachmentCreateInput, ApplicationAttachmentUncheckedCreateInput>
  }

  /**
   * ApplicationAttachment createMany
   */
  export type ApplicationAttachmentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ApplicationAttachments.
     */
    data: ApplicationAttachmentCreateManyInput | ApplicationAttachmentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ApplicationAttachment createManyAndReturn
   */
  export type ApplicationAttachmentCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApplicationAttachment
     */
    select?: ApplicationAttachmentSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ApplicationAttachment
     */
    omit?: ApplicationAttachmentOmit<ExtArgs> | null
    /**
     * The data used to create many ApplicationAttachments.
     */
    data: ApplicationAttachmentCreateManyInput | ApplicationAttachmentCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationAttachmentIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ApplicationAttachment update
   */
  export type ApplicationAttachmentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApplicationAttachment
     */
    select?: ApplicationAttachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApplicationAttachment
     */
    omit?: ApplicationAttachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationAttachmentInclude<ExtArgs> | null
    /**
     * The data needed to update a ApplicationAttachment.
     */
    data: XOR<ApplicationAttachmentUpdateInput, ApplicationAttachmentUncheckedUpdateInput>
    /**
     * Choose, which ApplicationAttachment to update.
     */
    where: ApplicationAttachmentWhereUniqueInput
  }

  /**
   * ApplicationAttachment updateMany
   */
  export type ApplicationAttachmentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ApplicationAttachments.
     */
    data: XOR<ApplicationAttachmentUpdateManyMutationInput, ApplicationAttachmentUncheckedUpdateManyInput>
    /**
     * Filter which ApplicationAttachments to update
     */
    where?: ApplicationAttachmentWhereInput
    /**
     * Limit how many ApplicationAttachments to update.
     */
    limit?: number
  }

  /**
   * ApplicationAttachment updateManyAndReturn
   */
  export type ApplicationAttachmentUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApplicationAttachment
     */
    select?: ApplicationAttachmentSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ApplicationAttachment
     */
    omit?: ApplicationAttachmentOmit<ExtArgs> | null
    /**
     * The data used to update ApplicationAttachments.
     */
    data: XOR<ApplicationAttachmentUpdateManyMutationInput, ApplicationAttachmentUncheckedUpdateManyInput>
    /**
     * Filter which ApplicationAttachments to update
     */
    where?: ApplicationAttachmentWhereInput
    /**
     * Limit how many ApplicationAttachments to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationAttachmentIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ApplicationAttachment upsert
   */
  export type ApplicationAttachmentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApplicationAttachment
     */
    select?: ApplicationAttachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApplicationAttachment
     */
    omit?: ApplicationAttachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationAttachmentInclude<ExtArgs> | null
    /**
     * The filter to search for the ApplicationAttachment to update in case it exists.
     */
    where: ApplicationAttachmentWhereUniqueInput
    /**
     * In case the ApplicationAttachment found by the `where` argument doesn't exist, create a new ApplicationAttachment with this data.
     */
    create: XOR<ApplicationAttachmentCreateInput, ApplicationAttachmentUncheckedCreateInput>
    /**
     * In case the ApplicationAttachment was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ApplicationAttachmentUpdateInput, ApplicationAttachmentUncheckedUpdateInput>
  }

  /**
   * ApplicationAttachment delete
   */
  export type ApplicationAttachmentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApplicationAttachment
     */
    select?: ApplicationAttachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApplicationAttachment
     */
    omit?: ApplicationAttachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationAttachmentInclude<ExtArgs> | null
    /**
     * Filter which ApplicationAttachment to delete.
     */
    where: ApplicationAttachmentWhereUniqueInput
  }

  /**
   * ApplicationAttachment deleteMany
   */
  export type ApplicationAttachmentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ApplicationAttachments to delete
     */
    where?: ApplicationAttachmentWhereInput
    /**
     * Limit how many ApplicationAttachments to delete.
     */
    limit?: number
  }

  /**
   * ApplicationAttachment without action
   */
  export type ApplicationAttachmentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApplicationAttachment
     */
    select?: ApplicationAttachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApplicationAttachment
     */
    omit?: ApplicationAttachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationAttachmentInclude<ExtArgs> | null
  }


  /**
   * Model CandidateNote
   */

  export type AggregateCandidateNote = {
    _count: CandidateNoteCountAggregateOutputType | null
    _min: CandidateNoteMinAggregateOutputType | null
    _max: CandidateNoteMaxAggregateOutputType | null
  }

  export type CandidateNoteMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    candidateId: string | null
    authorUserId: string | null
    content: string | null
    isPrivate: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CandidateNoteMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    candidateId: string | null
    authorUserId: string | null
    content: string | null
    isPrivate: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CandidateNoteCountAggregateOutputType = {
    id: number
    tenantId: number
    candidateId: number
    authorUserId: number
    content: number
    isPrivate: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type CandidateNoteMinAggregateInputType = {
    id?: true
    tenantId?: true
    candidateId?: true
    authorUserId?: true
    content?: true
    isPrivate?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CandidateNoteMaxAggregateInputType = {
    id?: true
    tenantId?: true
    candidateId?: true
    authorUserId?: true
    content?: true
    isPrivate?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CandidateNoteCountAggregateInputType = {
    id?: true
    tenantId?: true
    candidateId?: true
    authorUserId?: true
    content?: true
    isPrivate?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type CandidateNoteAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CandidateNote to aggregate.
     */
    where?: CandidateNoteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CandidateNotes to fetch.
     */
    orderBy?: CandidateNoteOrderByWithRelationInput | CandidateNoteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CandidateNoteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CandidateNotes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CandidateNotes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CandidateNotes
    **/
    _count?: true | CandidateNoteCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CandidateNoteMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CandidateNoteMaxAggregateInputType
  }

  export type GetCandidateNoteAggregateType<T extends CandidateNoteAggregateArgs> = {
        [P in keyof T & keyof AggregateCandidateNote]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCandidateNote[P]>
      : GetScalarType<T[P], AggregateCandidateNote[P]>
  }




  export type CandidateNoteGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CandidateNoteWhereInput
    orderBy?: CandidateNoteOrderByWithAggregationInput | CandidateNoteOrderByWithAggregationInput[]
    by: CandidateNoteScalarFieldEnum[] | CandidateNoteScalarFieldEnum
    having?: CandidateNoteScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CandidateNoteCountAggregateInputType | true
    _min?: CandidateNoteMinAggregateInputType
    _max?: CandidateNoteMaxAggregateInputType
  }

  export type CandidateNoteGroupByOutputType = {
    id: string
    tenantId: string
    candidateId: string
    authorUserId: string
    content: string
    isPrivate: boolean
    createdAt: Date
    updatedAt: Date
    _count: CandidateNoteCountAggregateOutputType | null
    _min: CandidateNoteMinAggregateOutputType | null
    _max: CandidateNoteMaxAggregateOutputType | null
  }

  type GetCandidateNoteGroupByPayload<T extends CandidateNoteGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CandidateNoteGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CandidateNoteGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CandidateNoteGroupByOutputType[P]>
            : GetScalarType<T[P], CandidateNoteGroupByOutputType[P]>
        }
      >
    >


  export type CandidateNoteSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    candidateId?: boolean
    authorUserId?: boolean
    content?: boolean
    isPrivate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    candidate?: boolean | CandidateDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["candidateNote"]>

  export type CandidateNoteSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    candidateId?: boolean
    authorUserId?: boolean
    content?: boolean
    isPrivate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    candidate?: boolean | CandidateDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["candidateNote"]>

  export type CandidateNoteSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    candidateId?: boolean
    authorUserId?: boolean
    content?: boolean
    isPrivate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    candidate?: boolean | CandidateDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["candidateNote"]>

  export type CandidateNoteSelectScalar = {
    id?: boolean
    tenantId?: boolean
    candidateId?: boolean
    authorUserId?: boolean
    content?: boolean
    isPrivate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type CandidateNoteOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "candidateId" | "authorUserId" | "content" | "isPrivate" | "createdAt" | "updatedAt", ExtArgs["result"]["candidateNote"]>
  export type CandidateNoteInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    candidate?: boolean | CandidateDefaultArgs<ExtArgs>
  }
  export type CandidateNoteIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    candidate?: boolean | CandidateDefaultArgs<ExtArgs>
  }
  export type CandidateNoteIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    candidate?: boolean | CandidateDefaultArgs<ExtArgs>
  }

  export type $CandidateNotePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CandidateNote"
    objects: {
      candidate: Prisma.$CandidatePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      candidateId: string
      authorUserId: string
      content: string
      isPrivate: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["candidateNote"]>
    composites: {}
  }

  type CandidateNoteGetPayload<S extends boolean | null | undefined | CandidateNoteDefaultArgs> = $Result.GetResult<Prisma.$CandidateNotePayload, S>

  type CandidateNoteCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CandidateNoteFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CandidateNoteCountAggregateInputType | true
    }

  export interface CandidateNoteDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CandidateNote'], meta: { name: 'CandidateNote' } }
    /**
     * Find zero or one CandidateNote that matches the filter.
     * @param {CandidateNoteFindUniqueArgs} args - Arguments to find a CandidateNote
     * @example
     * // Get one CandidateNote
     * const candidateNote = await prisma.candidateNote.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CandidateNoteFindUniqueArgs>(args: SelectSubset<T, CandidateNoteFindUniqueArgs<ExtArgs>>): Prisma__CandidateNoteClient<$Result.GetResult<Prisma.$CandidateNotePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one CandidateNote that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CandidateNoteFindUniqueOrThrowArgs} args - Arguments to find a CandidateNote
     * @example
     * // Get one CandidateNote
     * const candidateNote = await prisma.candidateNote.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CandidateNoteFindUniqueOrThrowArgs>(args: SelectSubset<T, CandidateNoteFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CandidateNoteClient<$Result.GetResult<Prisma.$CandidateNotePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CandidateNote that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CandidateNoteFindFirstArgs} args - Arguments to find a CandidateNote
     * @example
     * // Get one CandidateNote
     * const candidateNote = await prisma.candidateNote.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CandidateNoteFindFirstArgs>(args?: SelectSubset<T, CandidateNoteFindFirstArgs<ExtArgs>>): Prisma__CandidateNoteClient<$Result.GetResult<Prisma.$CandidateNotePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CandidateNote that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CandidateNoteFindFirstOrThrowArgs} args - Arguments to find a CandidateNote
     * @example
     * // Get one CandidateNote
     * const candidateNote = await prisma.candidateNote.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CandidateNoteFindFirstOrThrowArgs>(args?: SelectSubset<T, CandidateNoteFindFirstOrThrowArgs<ExtArgs>>): Prisma__CandidateNoteClient<$Result.GetResult<Prisma.$CandidateNotePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more CandidateNotes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CandidateNoteFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CandidateNotes
     * const candidateNotes = await prisma.candidateNote.findMany()
     * 
     * // Get first 10 CandidateNotes
     * const candidateNotes = await prisma.candidateNote.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const candidateNoteWithIdOnly = await prisma.candidateNote.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CandidateNoteFindManyArgs>(args?: SelectSubset<T, CandidateNoteFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CandidateNotePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a CandidateNote.
     * @param {CandidateNoteCreateArgs} args - Arguments to create a CandidateNote.
     * @example
     * // Create one CandidateNote
     * const CandidateNote = await prisma.candidateNote.create({
     *   data: {
     *     // ... data to create a CandidateNote
     *   }
     * })
     * 
     */
    create<T extends CandidateNoteCreateArgs>(args: SelectSubset<T, CandidateNoteCreateArgs<ExtArgs>>): Prisma__CandidateNoteClient<$Result.GetResult<Prisma.$CandidateNotePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many CandidateNotes.
     * @param {CandidateNoteCreateManyArgs} args - Arguments to create many CandidateNotes.
     * @example
     * // Create many CandidateNotes
     * const candidateNote = await prisma.candidateNote.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CandidateNoteCreateManyArgs>(args?: SelectSubset<T, CandidateNoteCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CandidateNotes and returns the data saved in the database.
     * @param {CandidateNoteCreateManyAndReturnArgs} args - Arguments to create many CandidateNotes.
     * @example
     * // Create many CandidateNotes
     * const candidateNote = await prisma.candidateNote.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CandidateNotes and only return the `id`
     * const candidateNoteWithIdOnly = await prisma.candidateNote.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CandidateNoteCreateManyAndReturnArgs>(args?: SelectSubset<T, CandidateNoteCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CandidateNotePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a CandidateNote.
     * @param {CandidateNoteDeleteArgs} args - Arguments to delete one CandidateNote.
     * @example
     * // Delete one CandidateNote
     * const CandidateNote = await prisma.candidateNote.delete({
     *   where: {
     *     // ... filter to delete one CandidateNote
     *   }
     * })
     * 
     */
    delete<T extends CandidateNoteDeleteArgs>(args: SelectSubset<T, CandidateNoteDeleteArgs<ExtArgs>>): Prisma__CandidateNoteClient<$Result.GetResult<Prisma.$CandidateNotePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one CandidateNote.
     * @param {CandidateNoteUpdateArgs} args - Arguments to update one CandidateNote.
     * @example
     * // Update one CandidateNote
     * const candidateNote = await prisma.candidateNote.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CandidateNoteUpdateArgs>(args: SelectSubset<T, CandidateNoteUpdateArgs<ExtArgs>>): Prisma__CandidateNoteClient<$Result.GetResult<Prisma.$CandidateNotePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more CandidateNotes.
     * @param {CandidateNoteDeleteManyArgs} args - Arguments to filter CandidateNotes to delete.
     * @example
     * // Delete a few CandidateNotes
     * const { count } = await prisma.candidateNote.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CandidateNoteDeleteManyArgs>(args?: SelectSubset<T, CandidateNoteDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CandidateNotes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CandidateNoteUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CandidateNotes
     * const candidateNote = await prisma.candidateNote.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CandidateNoteUpdateManyArgs>(args: SelectSubset<T, CandidateNoteUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CandidateNotes and returns the data updated in the database.
     * @param {CandidateNoteUpdateManyAndReturnArgs} args - Arguments to update many CandidateNotes.
     * @example
     * // Update many CandidateNotes
     * const candidateNote = await prisma.candidateNote.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more CandidateNotes and only return the `id`
     * const candidateNoteWithIdOnly = await prisma.candidateNote.updateManyAndReturn({
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
    updateManyAndReturn<T extends CandidateNoteUpdateManyAndReturnArgs>(args: SelectSubset<T, CandidateNoteUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CandidateNotePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one CandidateNote.
     * @param {CandidateNoteUpsertArgs} args - Arguments to update or create a CandidateNote.
     * @example
     * // Update or create a CandidateNote
     * const candidateNote = await prisma.candidateNote.upsert({
     *   create: {
     *     // ... data to create a CandidateNote
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CandidateNote we want to update
     *   }
     * })
     */
    upsert<T extends CandidateNoteUpsertArgs>(args: SelectSubset<T, CandidateNoteUpsertArgs<ExtArgs>>): Prisma__CandidateNoteClient<$Result.GetResult<Prisma.$CandidateNotePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of CandidateNotes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CandidateNoteCountArgs} args - Arguments to filter CandidateNotes to count.
     * @example
     * // Count the number of CandidateNotes
     * const count = await prisma.candidateNote.count({
     *   where: {
     *     // ... the filter for the CandidateNotes we want to count
     *   }
     * })
    **/
    count<T extends CandidateNoteCountArgs>(
      args?: Subset<T, CandidateNoteCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CandidateNoteCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CandidateNote.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CandidateNoteAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends CandidateNoteAggregateArgs>(args: Subset<T, CandidateNoteAggregateArgs>): Prisma.PrismaPromise<GetCandidateNoteAggregateType<T>>

    /**
     * Group by CandidateNote.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CandidateNoteGroupByArgs} args - Group by arguments.
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
      T extends CandidateNoteGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CandidateNoteGroupByArgs['orderBy'] }
        : { orderBy?: CandidateNoteGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, CandidateNoteGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCandidateNoteGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CandidateNote model
   */
  readonly fields: CandidateNoteFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CandidateNote.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CandidateNoteClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    candidate<T extends CandidateDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CandidateDefaultArgs<ExtArgs>>): Prisma__CandidateClient<$Result.GetResult<Prisma.$CandidatePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the CandidateNote model
   */
  interface CandidateNoteFieldRefs {
    readonly id: FieldRef<"CandidateNote", 'String'>
    readonly tenantId: FieldRef<"CandidateNote", 'String'>
    readonly candidateId: FieldRef<"CandidateNote", 'String'>
    readonly authorUserId: FieldRef<"CandidateNote", 'String'>
    readonly content: FieldRef<"CandidateNote", 'String'>
    readonly isPrivate: FieldRef<"CandidateNote", 'Boolean'>
    readonly createdAt: FieldRef<"CandidateNote", 'DateTime'>
    readonly updatedAt: FieldRef<"CandidateNote", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CandidateNote findUnique
   */
  export type CandidateNoteFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CandidateNote
     */
    select?: CandidateNoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CandidateNote
     */
    omit?: CandidateNoteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CandidateNoteInclude<ExtArgs> | null
    /**
     * Filter, which CandidateNote to fetch.
     */
    where: CandidateNoteWhereUniqueInput
  }

  /**
   * CandidateNote findUniqueOrThrow
   */
  export type CandidateNoteFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CandidateNote
     */
    select?: CandidateNoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CandidateNote
     */
    omit?: CandidateNoteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CandidateNoteInclude<ExtArgs> | null
    /**
     * Filter, which CandidateNote to fetch.
     */
    where: CandidateNoteWhereUniqueInput
  }

  /**
   * CandidateNote findFirst
   */
  export type CandidateNoteFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CandidateNote
     */
    select?: CandidateNoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CandidateNote
     */
    omit?: CandidateNoteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CandidateNoteInclude<ExtArgs> | null
    /**
     * Filter, which CandidateNote to fetch.
     */
    where?: CandidateNoteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CandidateNotes to fetch.
     */
    orderBy?: CandidateNoteOrderByWithRelationInput | CandidateNoteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CandidateNotes.
     */
    cursor?: CandidateNoteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CandidateNotes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CandidateNotes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CandidateNotes.
     */
    distinct?: CandidateNoteScalarFieldEnum | CandidateNoteScalarFieldEnum[]
  }

  /**
   * CandidateNote findFirstOrThrow
   */
  export type CandidateNoteFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CandidateNote
     */
    select?: CandidateNoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CandidateNote
     */
    omit?: CandidateNoteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CandidateNoteInclude<ExtArgs> | null
    /**
     * Filter, which CandidateNote to fetch.
     */
    where?: CandidateNoteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CandidateNotes to fetch.
     */
    orderBy?: CandidateNoteOrderByWithRelationInput | CandidateNoteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CandidateNotes.
     */
    cursor?: CandidateNoteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CandidateNotes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CandidateNotes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CandidateNotes.
     */
    distinct?: CandidateNoteScalarFieldEnum | CandidateNoteScalarFieldEnum[]
  }

  /**
   * CandidateNote findMany
   */
  export type CandidateNoteFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CandidateNote
     */
    select?: CandidateNoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CandidateNote
     */
    omit?: CandidateNoteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CandidateNoteInclude<ExtArgs> | null
    /**
     * Filter, which CandidateNotes to fetch.
     */
    where?: CandidateNoteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CandidateNotes to fetch.
     */
    orderBy?: CandidateNoteOrderByWithRelationInput | CandidateNoteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CandidateNotes.
     */
    cursor?: CandidateNoteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CandidateNotes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CandidateNotes.
     */
    skip?: number
    distinct?: CandidateNoteScalarFieldEnum | CandidateNoteScalarFieldEnum[]
  }

  /**
   * CandidateNote create
   */
  export type CandidateNoteCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CandidateNote
     */
    select?: CandidateNoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CandidateNote
     */
    omit?: CandidateNoteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CandidateNoteInclude<ExtArgs> | null
    /**
     * The data needed to create a CandidateNote.
     */
    data: XOR<CandidateNoteCreateInput, CandidateNoteUncheckedCreateInput>
  }

  /**
   * CandidateNote createMany
   */
  export type CandidateNoteCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CandidateNotes.
     */
    data: CandidateNoteCreateManyInput | CandidateNoteCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CandidateNote createManyAndReturn
   */
  export type CandidateNoteCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CandidateNote
     */
    select?: CandidateNoteSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CandidateNote
     */
    omit?: CandidateNoteOmit<ExtArgs> | null
    /**
     * The data used to create many CandidateNotes.
     */
    data: CandidateNoteCreateManyInput | CandidateNoteCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CandidateNoteIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * CandidateNote update
   */
  export type CandidateNoteUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CandidateNote
     */
    select?: CandidateNoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CandidateNote
     */
    omit?: CandidateNoteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CandidateNoteInclude<ExtArgs> | null
    /**
     * The data needed to update a CandidateNote.
     */
    data: XOR<CandidateNoteUpdateInput, CandidateNoteUncheckedUpdateInput>
    /**
     * Choose, which CandidateNote to update.
     */
    where: CandidateNoteWhereUniqueInput
  }

  /**
   * CandidateNote updateMany
   */
  export type CandidateNoteUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CandidateNotes.
     */
    data: XOR<CandidateNoteUpdateManyMutationInput, CandidateNoteUncheckedUpdateManyInput>
    /**
     * Filter which CandidateNotes to update
     */
    where?: CandidateNoteWhereInput
    /**
     * Limit how many CandidateNotes to update.
     */
    limit?: number
  }

  /**
   * CandidateNote updateManyAndReturn
   */
  export type CandidateNoteUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CandidateNote
     */
    select?: CandidateNoteSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CandidateNote
     */
    omit?: CandidateNoteOmit<ExtArgs> | null
    /**
     * The data used to update CandidateNotes.
     */
    data: XOR<CandidateNoteUpdateManyMutationInput, CandidateNoteUncheckedUpdateManyInput>
    /**
     * Filter which CandidateNotes to update
     */
    where?: CandidateNoteWhereInput
    /**
     * Limit how many CandidateNotes to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CandidateNoteIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * CandidateNote upsert
   */
  export type CandidateNoteUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CandidateNote
     */
    select?: CandidateNoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CandidateNote
     */
    omit?: CandidateNoteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CandidateNoteInclude<ExtArgs> | null
    /**
     * The filter to search for the CandidateNote to update in case it exists.
     */
    where: CandidateNoteWhereUniqueInput
    /**
     * In case the CandidateNote found by the `where` argument doesn't exist, create a new CandidateNote with this data.
     */
    create: XOR<CandidateNoteCreateInput, CandidateNoteUncheckedCreateInput>
    /**
     * In case the CandidateNote was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CandidateNoteUpdateInput, CandidateNoteUncheckedUpdateInput>
  }

  /**
   * CandidateNote delete
   */
  export type CandidateNoteDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CandidateNote
     */
    select?: CandidateNoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CandidateNote
     */
    omit?: CandidateNoteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CandidateNoteInclude<ExtArgs> | null
    /**
     * Filter which CandidateNote to delete.
     */
    where: CandidateNoteWhereUniqueInput
  }

  /**
   * CandidateNote deleteMany
   */
  export type CandidateNoteDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CandidateNotes to delete
     */
    where?: CandidateNoteWhereInput
    /**
     * Limit how many CandidateNotes to delete.
     */
    limit?: number
  }

  /**
   * CandidateNote without action
   */
  export type CandidateNoteDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CandidateNote
     */
    select?: CandidateNoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CandidateNote
     */
    omit?: CandidateNoteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CandidateNoteInclude<ExtArgs> | null
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


  export const CandidateScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    email: 'email',
    firstName: 'firstName',
    lastName: 'lastName',
    phone: 'phone',
    location: 'location',
    country: 'country',
    resumeUrl: 'resumeUrl',
    linkedinUrl: 'linkedinUrl',
    portfolioUrl: 'portfolioUrl',
    summary: 'summary',
    source: 'source',
    tags: 'tags',
    isAnonymized: 'isAnonymized',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type CandidateScalarFieldEnum = (typeof CandidateScalarFieldEnum)[keyof typeof CandidateScalarFieldEnum]


  export const ApplicationScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    candidateId: 'candidateId',
    requisitionId: 'requisitionId',
    stage: 'stage',
    status: 'status',
    appliedAt: 'appliedAt',
    stageUpdatedAt: 'stageUpdatedAt',
    notes: 'notes',
    formResponses: 'formResponses',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ApplicationScalarFieldEnum = (typeof ApplicationScalarFieldEnum)[keyof typeof ApplicationScalarFieldEnum]


  export const ApplicationAttachmentScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    applicationId: 'applicationId',
    fieldId: 'fieldId',
    fileName: 'fileName',
    originalName: 'originalName',
    fileSize: 'fileSize',
    mimeType: 'mimeType',
    storageKey: 'storageKey',
    createdAt: 'createdAt'
  };

  export type ApplicationAttachmentScalarFieldEnum = (typeof ApplicationAttachmentScalarFieldEnum)[keyof typeof ApplicationAttachmentScalarFieldEnum]


  export const CandidateNoteScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    candidateId: 'candidateId',
    authorUserId: 'authorUserId',
    content: 'content',
    isPrivate: 'isPrivate',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type CandidateNoteScalarFieldEnum = (typeof CandidateNoteScalarFieldEnum)[keyof typeof CandidateNoteScalarFieldEnum]


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
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'ApplicationStage'
   */
  export type EnumApplicationStageFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ApplicationStage'>
    


  /**
   * Reference to a field of type 'ApplicationStage[]'
   */
  export type ListEnumApplicationStageFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ApplicationStage[]'>
    


  /**
   * Reference to a field of type 'ApplicationStatus'
   */
  export type EnumApplicationStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ApplicationStatus'>
    


  /**
   * Reference to a field of type 'ApplicationStatus[]'
   */
  export type ListEnumApplicationStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ApplicationStatus[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


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


  export type CandidateWhereInput = {
    AND?: CandidateWhereInput | CandidateWhereInput[]
    OR?: CandidateWhereInput[]
    NOT?: CandidateWhereInput | CandidateWhereInput[]
    id?: StringFilter<"Candidate"> | string
    tenantId?: StringFilter<"Candidate"> | string
    email?: StringFilter<"Candidate"> | string
    firstName?: StringFilter<"Candidate"> | string
    lastName?: StringFilter<"Candidate"> | string
    phone?: StringNullableFilter<"Candidate"> | string | null
    location?: StringNullableFilter<"Candidate"> | string | null
    country?: StringNullableFilter<"Candidate"> | string | null
    resumeUrl?: StringNullableFilter<"Candidate"> | string | null
    linkedinUrl?: StringNullableFilter<"Candidate"> | string | null
    portfolioUrl?: StringNullableFilter<"Candidate"> | string | null
    summary?: StringNullableFilter<"Candidate"> | string | null
    source?: StringNullableFilter<"Candidate"> | string | null
    tags?: StringNullableListFilter<"Candidate">
    isAnonymized?: BoolFilter<"Candidate"> | boolean
    createdAt?: DateTimeFilter<"Candidate"> | Date | string
    updatedAt?: DateTimeFilter<"Candidate"> | Date | string
    applications?: ApplicationListRelationFilter
    notes?: CandidateNoteListRelationFilter
  }

  export type CandidateOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    email?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    phone?: SortOrderInput | SortOrder
    location?: SortOrderInput | SortOrder
    country?: SortOrderInput | SortOrder
    resumeUrl?: SortOrderInput | SortOrder
    linkedinUrl?: SortOrderInput | SortOrder
    portfolioUrl?: SortOrderInput | SortOrder
    summary?: SortOrderInput | SortOrder
    source?: SortOrderInput | SortOrder
    tags?: SortOrder
    isAnonymized?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    applications?: ApplicationOrderByRelationAggregateInput
    notes?: CandidateNoteOrderByRelationAggregateInput
  }

  export type CandidateWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    tenantId_email?: CandidateTenantIdEmailCompoundUniqueInput
    AND?: CandidateWhereInput | CandidateWhereInput[]
    OR?: CandidateWhereInput[]
    NOT?: CandidateWhereInput | CandidateWhereInput[]
    tenantId?: StringFilter<"Candidate"> | string
    email?: StringFilter<"Candidate"> | string
    firstName?: StringFilter<"Candidate"> | string
    lastName?: StringFilter<"Candidate"> | string
    phone?: StringNullableFilter<"Candidate"> | string | null
    location?: StringNullableFilter<"Candidate"> | string | null
    country?: StringNullableFilter<"Candidate"> | string | null
    resumeUrl?: StringNullableFilter<"Candidate"> | string | null
    linkedinUrl?: StringNullableFilter<"Candidate"> | string | null
    portfolioUrl?: StringNullableFilter<"Candidate"> | string | null
    summary?: StringNullableFilter<"Candidate"> | string | null
    source?: StringNullableFilter<"Candidate"> | string | null
    tags?: StringNullableListFilter<"Candidate">
    isAnonymized?: BoolFilter<"Candidate"> | boolean
    createdAt?: DateTimeFilter<"Candidate"> | Date | string
    updatedAt?: DateTimeFilter<"Candidate"> | Date | string
    applications?: ApplicationListRelationFilter
    notes?: CandidateNoteListRelationFilter
  }, "id" | "tenantId_email">

  export type CandidateOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    email?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    phone?: SortOrderInput | SortOrder
    location?: SortOrderInput | SortOrder
    country?: SortOrderInput | SortOrder
    resumeUrl?: SortOrderInput | SortOrder
    linkedinUrl?: SortOrderInput | SortOrder
    portfolioUrl?: SortOrderInput | SortOrder
    summary?: SortOrderInput | SortOrder
    source?: SortOrderInput | SortOrder
    tags?: SortOrder
    isAnonymized?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: CandidateCountOrderByAggregateInput
    _max?: CandidateMaxOrderByAggregateInput
    _min?: CandidateMinOrderByAggregateInput
  }

  export type CandidateScalarWhereWithAggregatesInput = {
    AND?: CandidateScalarWhereWithAggregatesInput | CandidateScalarWhereWithAggregatesInput[]
    OR?: CandidateScalarWhereWithAggregatesInput[]
    NOT?: CandidateScalarWhereWithAggregatesInput | CandidateScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Candidate"> | string
    tenantId?: StringWithAggregatesFilter<"Candidate"> | string
    email?: StringWithAggregatesFilter<"Candidate"> | string
    firstName?: StringWithAggregatesFilter<"Candidate"> | string
    lastName?: StringWithAggregatesFilter<"Candidate"> | string
    phone?: StringNullableWithAggregatesFilter<"Candidate"> | string | null
    location?: StringNullableWithAggregatesFilter<"Candidate"> | string | null
    country?: StringNullableWithAggregatesFilter<"Candidate"> | string | null
    resumeUrl?: StringNullableWithAggregatesFilter<"Candidate"> | string | null
    linkedinUrl?: StringNullableWithAggregatesFilter<"Candidate"> | string | null
    portfolioUrl?: StringNullableWithAggregatesFilter<"Candidate"> | string | null
    summary?: StringNullableWithAggregatesFilter<"Candidate"> | string | null
    source?: StringNullableWithAggregatesFilter<"Candidate"> | string | null
    tags?: StringNullableListFilter<"Candidate">
    isAnonymized?: BoolWithAggregatesFilter<"Candidate"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"Candidate"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Candidate"> | Date | string
  }

  export type ApplicationWhereInput = {
    AND?: ApplicationWhereInput | ApplicationWhereInput[]
    OR?: ApplicationWhereInput[]
    NOT?: ApplicationWhereInput | ApplicationWhereInput[]
    id?: StringFilter<"Application"> | string
    tenantId?: StringFilter<"Application"> | string
    candidateId?: StringFilter<"Application"> | string
    requisitionId?: StringFilter<"Application"> | string
    stage?: EnumApplicationStageFilter<"Application"> | $Enums.ApplicationStage
    status?: EnumApplicationStatusFilter<"Application"> | $Enums.ApplicationStatus
    appliedAt?: DateTimeFilter<"Application"> | Date | string
    stageUpdatedAt?: DateTimeFilter<"Application"> | Date | string
    notes?: StringNullableFilter<"Application"> | string | null
    formResponses?: JsonNullableFilter<"Application">
    createdAt?: DateTimeFilter<"Application"> | Date | string
    updatedAt?: DateTimeFilter<"Application"> | Date | string
    candidate?: XOR<CandidateScalarRelationFilter, CandidateWhereInput>
    attachments?: ApplicationAttachmentListRelationFilter
  }

  export type ApplicationOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    candidateId?: SortOrder
    requisitionId?: SortOrder
    stage?: SortOrder
    status?: SortOrder
    appliedAt?: SortOrder
    stageUpdatedAt?: SortOrder
    notes?: SortOrderInput | SortOrder
    formResponses?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    candidate?: CandidateOrderByWithRelationInput
    attachments?: ApplicationAttachmentOrderByRelationAggregateInput
  }

  export type ApplicationWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ApplicationWhereInput | ApplicationWhereInput[]
    OR?: ApplicationWhereInput[]
    NOT?: ApplicationWhereInput | ApplicationWhereInput[]
    tenantId?: StringFilter<"Application"> | string
    candidateId?: StringFilter<"Application"> | string
    requisitionId?: StringFilter<"Application"> | string
    stage?: EnumApplicationStageFilter<"Application"> | $Enums.ApplicationStage
    status?: EnumApplicationStatusFilter<"Application"> | $Enums.ApplicationStatus
    appliedAt?: DateTimeFilter<"Application"> | Date | string
    stageUpdatedAt?: DateTimeFilter<"Application"> | Date | string
    notes?: StringNullableFilter<"Application"> | string | null
    formResponses?: JsonNullableFilter<"Application">
    createdAt?: DateTimeFilter<"Application"> | Date | string
    updatedAt?: DateTimeFilter<"Application"> | Date | string
    candidate?: XOR<CandidateScalarRelationFilter, CandidateWhereInput>
    attachments?: ApplicationAttachmentListRelationFilter
  }, "id">

  export type ApplicationOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    candidateId?: SortOrder
    requisitionId?: SortOrder
    stage?: SortOrder
    status?: SortOrder
    appliedAt?: SortOrder
    stageUpdatedAt?: SortOrder
    notes?: SortOrderInput | SortOrder
    formResponses?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ApplicationCountOrderByAggregateInput
    _max?: ApplicationMaxOrderByAggregateInput
    _min?: ApplicationMinOrderByAggregateInput
  }

  export type ApplicationScalarWhereWithAggregatesInput = {
    AND?: ApplicationScalarWhereWithAggregatesInput | ApplicationScalarWhereWithAggregatesInput[]
    OR?: ApplicationScalarWhereWithAggregatesInput[]
    NOT?: ApplicationScalarWhereWithAggregatesInput | ApplicationScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Application"> | string
    tenantId?: StringWithAggregatesFilter<"Application"> | string
    candidateId?: StringWithAggregatesFilter<"Application"> | string
    requisitionId?: StringWithAggregatesFilter<"Application"> | string
    stage?: EnumApplicationStageWithAggregatesFilter<"Application"> | $Enums.ApplicationStage
    status?: EnumApplicationStatusWithAggregatesFilter<"Application"> | $Enums.ApplicationStatus
    appliedAt?: DateTimeWithAggregatesFilter<"Application"> | Date | string
    stageUpdatedAt?: DateTimeWithAggregatesFilter<"Application"> | Date | string
    notes?: StringNullableWithAggregatesFilter<"Application"> | string | null
    formResponses?: JsonNullableWithAggregatesFilter<"Application">
    createdAt?: DateTimeWithAggregatesFilter<"Application"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Application"> | Date | string
  }

  export type ApplicationAttachmentWhereInput = {
    AND?: ApplicationAttachmentWhereInput | ApplicationAttachmentWhereInput[]
    OR?: ApplicationAttachmentWhereInput[]
    NOT?: ApplicationAttachmentWhereInput | ApplicationAttachmentWhereInput[]
    id?: StringFilter<"ApplicationAttachment"> | string
    tenantId?: StringFilter<"ApplicationAttachment"> | string
    applicationId?: StringFilter<"ApplicationAttachment"> | string
    fieldId?: StringFilter<"ApplicationAttachment"> | string
    fileName?: StringFilter<"ApplicationAttachment"> | string
    originalName?: StringFilter<"ApplicationAttachment"> | string
    fileSize?: IntFilter<"ApplicationAttachment"> | number
    mimeType?: StringFilter<"ApplicationAttachment"> | string
    storageKey?: StringFilter<"ApplicationAttachment"> | string
    createdAt?: DateTimeFilter<"ApplicationAttachment"> | Date | string
    application?: XOR<ApplicationScalarRelationFilter, ApplicationWhereInput>
  }

  export type ApplicationAttachmentOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    applicationId?: SortOrder
    fieldId?: SortOrder
    fileName?: SortOrder
    originalName?: SortOrder
    fileSize?: SortOrder
    mimeType?: SortOrder
    storageKey?: SortOrder
    createdAt?: SortOrder
    application?: ApplicationOrderByWithRelationInput
  }

  export type ApplicationAttachmentWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ApplicationAttachmentWhereInput | ApplicationAttachmentWhereInput[]
    OR?: ApplicationAttachmentWhereInput[]
    NOT?: ApplicationAttachmentWhereInput | ApplicationAttachmentWhereInput[]
    tenantId?: StringFilter<"ApplicationAttachment"> | string
    applicationId?: StringFilter<"ApplicationAttachment"> | string
    fieldId?: StringFilter<"ApplicationAttachment"> | string
    fileName?: StringFilter<"ApplicationAttachment"> | string
    originalName?: StringFilter<"ApplicationAttachment"> | string
    fileSize?: IntFilter<"ApplicationAttachment"> | number
    mimeType?: StringFilter<"ApplicationAttachment"> | string
    storageKey?: StringFilter<"ApplicationAttachment"> | string
    createdAt?: DateTimeFilter<"ApplicationAttachment"> | Date | string
    application?: XOR<ApplicationScalarRelationFilter, ApplicationWhereInput>
  }, "id">

  export type ApplicationAttachmentOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    applicationId?: SortOrder
    fieldId?: SortOrder
    fileName?: SortOrder
    originalName?: SortOrder
    fileSize?: SortOrder
    mimeType?: SortOrder
    storageKey?: SortOrder
    createdAt?: SortOrder
    _count?: ApplicationAttachmentCountOrderByAggregateInput
    _avg?: ApplicationAttachmentAvgOrderByAggregateInput
    _max?: ApplicationAttachmentMaxOrderByAggregateInput
    _min?: ApplicationAttachmentMinOrderByAggregateInput
    _sum?: ApplicationAttachmentSumOrderByAggregateInput
  }

  export type ApplicationAttachmentScalarWhereWithAggregatesInput = {
    AND?: ApplicationAttachmentScalarWhereWithAggregatesInput | ApplicationAttachmentScalarWhereWithAggregatesInput[]
    OR?: ApplicationAttachmentScalarWhereWithAggregatesInput[]
    NOT?: ApplicationAttachmentScalarWhereWithAggregatesInput | ApplicationAttachmentScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ApplicationAttachment"> | string
    tenantId?: StringWithAggregatesFilter<"ApplicationAttachment"> | string
    applicationId?: StringWithAggregatesFilter<"ApplicationAttachment"> | string
    fieldId?: StringWithAggregatesFilter<"ApplicationAttachment"> | string
    fileName?: StringWithAggregatesFilter<"ApplicationAttachment"> | string
    originalName?: StringWithAggregatesFilter<"ApplicationAttachment"> | string
    fileSize?: IntWithAggregatesFilter<"ApplicationAttachment"> | number
    mimeType?: StringWithAggregatesFilter<"ApplicationAttachment"> | string
    storageKey?: StringWithAggregatesFilter<"ApplicationAttachment"> | string
    createdAt?: DateTimeWithAggregatesFilter<"ApplicationAttachment"> | Date | string
  }

  export type CandidateNoteWhereInput = {
    AND?: CandidateNoteWhereInput | CandidateNoteWhereInput[]
    OR?: CandidateNoteWhereInput[]
    NOT?: CandidateNoteWhereInput | CandidateNoteWhereInput[]
    id?: StringFilter<"CandidateNote"> | string
    tenantId?: StringFilter<"CandidateNote"> | string
    candidateId?: StringFilter<"CandidateNote"> | string
    authorUserId?: StringFilter<"CandidateNote"> | string
    content?: StringFilter<"CandidateNote"> | string
    isPrivate?: BoolFilter<"CandidateNote"> | boolean
    createdAt?: DateTimeFilter<"CandidateNote"> | Date | string
    updatedAt?: DateTimeFilter<"CandidateNote"> | Date | string
    candidate?: XOR<CandidateScalarRelationFilter, CandidateWhereInput>
  }

  export type CandidateNoteOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    candidateId?: SortOrder
    authorUserId?: SortOrder
    content?: SortOrder
    isPrivate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    candidate?: CandidateOrderByWithRelationInput
  }

  export type CandidateNoteWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CandidateNoteWhereInput | CandidateNoteWhereInput[]
    OR?: CandidateNoteWhereInput[]
    NOT?: CandidateNoteWhereInput | CandidateNoteWhereInput[]
    tenantId?: StringFilter<"CandidateNote"> | string
    candidateId?: StringFilter<"CandidateNote"> | string
    authorUserId?: StringFilter<"CandidateNote"> | string
    content?: StringFilter<"CandidateNote"> | string
    isPrivate?: BoolFilter<"CandidateNote"> | boolean
    createdAt?: DateTimeFilter<"CandidateNote"> | Date | string
    updatedAt?: DateTimeFilter<"CandidateNote"> | Date | string
    candidate?: XOR<CandidateScalarRelationFilter, CandidateWhereInput>
  }, "id">

  export type CandidateNoteOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    candidateId?: SortOrder
    authorUserId?: SortOrder
    content?: SortOrder
    isPrivate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: CandidateNoteCountOrderByAggregateInput
    _max?: CandidateNoteMaxOrderByAggregateInput
    _min?: CandidateNoteMinOrderByAggregateInput
  }

  export type CandidateNoteScalarWhereWithAggregatesInput = {
    AND?: CandidateNoteScalarWhereWithAggregatesInput | CandidateNoteScalarWhereWithAggregatesInput[]
    OR?: CandidateNoteScalarWhereWithAggregatesInput[]
    NOT?: CandidateNoteScalarWhereWithAggregatesInput | CandidateNoteScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"CandidateNote"> | string
    tenantId?: StringWithAggregatesFilter<"CandidateNote"> | string
    candidateId?: StringWithAggregatesFilter<"CandidateNote"> | string
    authorUserId?: StringWithAggregatesFilter<"CandidateNote"> | string
    content?: StringWithAggregatesFilter<"CandidateNote"> | string
    isPrivate?: BoolWithAggregatesFilter<"CandidateNote"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"CandidateNote"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"CandidateNote"> | Date | string
  }

  export type CandidateCreateInput = {
    id?: string
    tenantId: string
    email: string
    firstName: string
    lastName: string
    phone?: string | null
    location?: string | null
    country?: string | null
    resumeUrl?: string | null
    linkedinUrl?: string | null
    portfolioUrl?: string | null
    summary?: string | null
    source?: string | null
    tags?: CandidateCreatetagsInput | string[]
    isAnonymized?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    applications?: ApplicationCreateNestedManyWithoutCandidateInput
    notes?: CandidateNoteCreateNestedManyWithoutCandidateInput
  }

  export type CandidateUncheckedCreateInput = {
    id?: string
    tenantId: string
    email: string
    firstName: string
    lastName: string
    phone?: string | null
    location?: string | null
    country?: string | null
    resumeUrl?: string | null
    linkedinUrl?: string | null
    portfolioUrl?: string | null
    summary?: string | null
    source?: string | null
    tags?: CandidateCreatetagsInput | string[]
    isAnonymized?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    applications?: ApplicationUncheckedCreateNestedManyWithoutCandidateInput
    notes?: CandidateNoteUncheckedCreateNestedManyWithoutCandidateInput
  }

  export type CandidateUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    country?: NullableStringFieldUpdateOperationsInput | string | null
    resumeUrl?: NullableStringFieldUpdateOperationsInput | string | null
    linkedinUrl?: NullableStringFieldUpdateOperationsInput | string | null
    portfolioUrl?: NullableStringFieldUpdateOperationsInput | string | null
    summary?: NullableStringFieldUpdateOperationsInput | string | null
    source?: NullableStringFieldUpdateOperationsInput | string | null
    tags?: CandidateUpdatetagsInput | string[]
    isAnonymized?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    applications?: ApplicationUpdateManyWithoutCandidateNestedInput
    notes?: CandidateNoteUpdateManyWithoutCandidateNestedInput
  }

  export type CandidateUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    country?: NullableStringFieldUpdateOperationsInput | string | null
    resumeUrl?: NullableStringFieldUpdateOperationsInput | string | null
    linkedinUrl?: NullableStringFieldUpdateOperationsInput | string | null
    portfolioUrl?: NullableStringFieldUpdateOperationsInput | string | null
    summary?: NullableStringFieldUpdateOperationsInput | string | null
    source?: NullableStringFieldUpdateOperationsInput | string | null
    tags?: CandidateUpdatetagsInput | string[]
    isAnonymized?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    applications?: ApplicationUncheckedUpdateManyWithoutCandidateNestedInput
    notes?: CandidateNoteUncheckedUpdateManyWithoutCandidateNestedInput
  }

  export type CandidateCreateManyInput = {
    id?: string
    tenantId: string
    email: string
    firstName: string
    lastName: string
    phone?: string | null
    location?: string | null
    country?: string | null
    resumeUrl?: string | null
    linkedinUrl?: string | null
    portfolioUrl?: string | null
    summary?: string | null
    source?: string | null
    tags?: CandidateCreatetagsInput | string[]
    isAnonymized?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CandidateUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    country?: NullableStringFieldUpdateOperationsInput | string | null
    resumeUrl?: NullableStringFieldUpdateOperationsInput | string | null
    linkedinUrl?: NullableStringFieldUpdateOperationsInput | string | null
    portfolioUrl?: NullableStringFieldUpdateOperationsInput | string | null
    summary?: NullableStringFieldUpdateOperationsInput | string | null
    source?: NullableStringFieldUpdateOperationsInput | string | null
    tags?: CandidateUpdatetagsInput | string[]
    isAnonymized?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CandidateUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    country?: NullableStringFieldUpdateOperationsInput | string | null
    resumeUrl?: NullableStringFieldUpdateOperationsInput | string | null
    linkedinUrl?: NullableStringFieldUpdateOperationsInput | string | null
    portfolioUrl?: NullableStringFieldUpdateOperationsInput | string | null
    summary?: NullableStringFieldUpdateOperationsInput | string | null
    source?: NullableStringFieldUpdateOperationsInput | string | null
    tags?: CandidateUpdatetagsInput | string[]
    isAnonymized?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ApplicationCreateInput = {
    id?: string
    tenantId: string
    requisitionId: string
    stage?: $Enums.ApplicationStage
    status?: $Enums.ApplicationStatus
    appliedAt?: Date | string
    stageUpdatedAt?: Date | string
    notes?: string | null
    formResponses?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    candidate: CandidateCreateNestedOneWithoutApplicationsInput
    attachments?: ApplicationAttachmentCreateNestedManyWithoutApplicationInput
  }

  export type ApplicationUncheckedCreateInput = {
    id?: string
    tenantId: string
    candidateId: string
    requisitionId: string
    stage?: $Enums.ApplicationStage
    status?: $Enums.ApplicationStatus
    appliedAt?: Date | string
    stageUpdatedAt?: Date | string
    notes?: string | null
    formResponses?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    attachments?: ApplicationAttachmentUncheckedCreateNestedManyWithoutApplicationInput
  }

  export type ApplicationUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    requisitionId?: StringFieldUpdateOperationsInput | string
    stage?: EnumApplicationStageFieldUpdateOperationsInput | $Enums.ApplicationStage
    status?: EnumApplicationStatusFieldUpdateOperationsInput | $Enums.ApplicationStatus
    appliedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    stageUpdatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    formResponses?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    candidate?: CandidateUpdateOneRequiredWithoutApplicationsNestedInput
    attachments?: ApplicationAttachmentUpdateManyWithoutApplicationNestedInput
  }

  export type ApplicationUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    requisitionId?: StringFieldUpdateOperationsInput | string
    stage?: EnumApplicationStageFieldUpdateOperationsInput | $Enums.ApplicationStage
    status?: EnumApplicationStatusFieldUpdateOperationsInput | $Enums.ApplicationStatus
    appliedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    stageUpdatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    formResponses?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    attachments?: ApplicationAttachmentUncheckedUpdateManyWithoutApplicationNestedInput
  }

  export type ApplicationCreateManyInput = {
    id?: string
    tenantId: string
    candidateId: string
    requisitionId: string
    stage?: $Enums.ApplicationStage
    status?: $Enums.ApplicationStatus
    appliedAt?: Date | string
    stageUpdatedAt?: Date | string
    notes?: string | null
    formResponses?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ApplicationUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    requisitionId?: StringFieldUpdateOperationsInput | string
    stage?: EnumApplicationStageFieldUpdateOperationsInput | $Enums.ApplicationStage
    status?: EnumApplicationStatusFieldUpdateOperationsInput | $Enums.ApplicationStatus
    appliedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    stageUpdatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    formResponses?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ApplicationUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    requisitionId?: StringFieldUpdateOperationsInput | string
    stage?: EnumApplicationStageFieldUpdateOperationsInput | $Enums.ApplicationStage
    status?: EnumApplicationStatusFieldUpdateOperationsInput | $Enums.ApplicationStatus
    appliedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    stageUpdatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    formResponses?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ApplicationAttachmentCreateInput = {
    id?: string
    tenantId: string
    fieldId: string
    fileName: string
    originalName: string
    fileSize: number
    mimeType: string
    storageKey: string
    createdAt?: Date | string
    application: ApplicationCreateNestedOneWithoutAttachmentsInput
  }

  export type ApplicationAttachmentUncheckedCreateInput = {
    id?: string
    tenantId: string
    applicationId: string
    fieldId: string
    fileName: string
    originalName: string
    fileSize: number
    mimeType: string
    storageKey: string
    createdAt?: Date | string
  }

  export type ApplicationAttachmentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    fieldId?: StringFieldUpdateOperationsInput | string
    fileName?: StringFieldUpdateOperationsInput | string
    originalName?: StringFieldUpdateOperationsInput | string
    fileSize?: IntFieldUpdateOperationsInput | number
    mimeType?: StringFieldUpdateOperationsInput | string
    storageKey?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    application?: ApplicationUpdateOneRequiredWithoutAttachmentsNestedInput
  }

  export type ApplicationAttachmentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    applicationId?: StringFieldUpdateOperationsInput | string
    fieldId?: StringFieldUpdateOperationsInput | string
    fileName?: StringFieldUpdateOperationsInput | string
    originalName?: StringFieldUpdateOperationsInput | string
    fileSize?: IntFieldUpdateOperationsInput | number
    mimeType?: StringFieldUpdateOperationsInput | string
    storageKey?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ApplicationAttachmentCreateManyInput = {
    id?: string
    tenantId: string
    applicationId: string
    fieldId: string
    fileName: string
    originalName: string
    fileSize: number
    mimeType: string
    storageKey: string
    createdAt?: Date | string
  }

  export type ApplicationAttachmentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    fieldId?: StringFieldUpdateOperationsInput | string
    fileName?: StringFieldUpdateOperationsInput | string
    originalName?: StringFieldUpdateOperationsInput | string
    fileSize?: IntFieldUpdateOperationsInput | number
    mimeType?: StringFieldUpdateOperationsInput | string
    storageKey?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ApplicationAttachmentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    applicationId?: StringFieldUpdateOperationsInput | string
    fieldId?: StringFieldUpdateOperationsInput | string
    fileName?: StringFieldUpdateOperationsInput | string
    originalName?: StringFieldUpdateOperationsInput | string
    fileSize?: IntFieldUpdateOperationsInput | number
    mimeType?: StringFieldUpdateOperationsInput | string
    storageKey?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CandidateNoteCreateInput = {
    id?: string
    tenantId: string
    authorUserId: string
    content: string
    isPrivate?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    candidate: CandidateCreateNestedOneWithoutNotesInput
  }

  export type CandidateNoteUncheckedCreateInput = {
    id?: string
    tenantId: string
    candidateId: string
    authorUserId: string
    content: string
    isPrivate?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CandidateNoteUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    authorUserId?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    isPrivate?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    candidate?: CandidateUpdateOneRequiredWithoutNotesNestedInput
  }

  export type CandidateNoteUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    authorUserId?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    isPrivate?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CandidateNoteCreateManyInput = {
    id?: string
    tenantId: string
    candidateId: string
    authorUserId: string
    content: string
    isPrivate?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CandidateNoteUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    authorUserId?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    isPrivate?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CandidateNoteUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    authorUserId?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    isPrivate?: BoolFieldUpdateOperationsInput | boolean
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

  export type ApplicationListRelationFilter = {
    every?: ApplicationWhereInput
    some?: ApplicationWhereInput
    none?: ApplicationWhereInput
  }

  export type CandidateNoteListRelationFilter = {
    every?: CandidateNoteWhereInput
    some?: CandidateNoteWhereInput
    none?: CandidateNoteWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type ApplicationOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CandidateNoteOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CandidateTenantIdEmailCompoundUniqueInput = {
    tenantId: string
    email: string
  }

  export type CandidateCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    email?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    phone?: SortOrder
    location?: SortOrder
    country?: SortOrder
    resumeUrl?: SortOrder
    linkedinUrl?: SortOrder
    portfolioUrl?: SortOrder
    summary?: SortOrder
    source?: SortOrder
    tags?: SortOrder
    isAnonymized?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CandidateMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    email?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    phone?: SortOrder
    location?: SortOrder
    country?: SortOrder
    resumeUrl?: SortOrder
    linkedinUrl?: SortOrder
    portfolioUrl?: SortOrder
    summary?: SortOrder
    source?: SortOrder
    isAnonymized?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CandidateMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    email?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    phone?: SortOrder
    location?: SortOrder
    country?: SortOrder
    resumeUrl?: SortOrder
    linkedinUrl?: SortOrder
    portfolioUrl?: SortOrder
    summary?: SortOrder
    source?: SortOrder
    isAnonymized?: SortOrder
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

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
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

  export type EnumApplicationStageFilter<$PrismaModel = never> = {
    equals?: $Enums.ApplicationStage | EnumApplicationStageFieldRefInput<$PrismaModel>
    in?: $Enums.ApplicationStage[] | ListEnumApplicationStageFieldRefInput<$PrismaModel>
    notIn?: $Enums.ApplicationStage[] | ListEnumApplicationStageFieldRefInput<$PrismaModel>
    not?: NestedEnumApplicationStageFilter<$PrismaModel> | $Enums.ApplicationStage
  }

  export type EnumApplicationStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.ApplicationStatus | EnumApplicationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ApplicationStatus[] | ListEnumApplicationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ApplicationStatus[] | ListEnumApplicationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumApplicationStatusFilter<$PrismaModel> | $Enums.ApplicationStatus
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

  export type CandidateScalarRelationFilter = {
    is?: CandidateWhereInput
    isNot?: CandidateWhereInput
  }

  export type ApplicationAttachmentListRelationFilter = {
    every?: ApplicationAttachmentWhereInput
    some?: ApplicationAttachmentWhereInput
    none?: ApplicationAttachmentWhereInput
  }

  export type ApplicationAttachmentOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ApplicationCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    candidateId?: SortOrder
    requisitionId?: SortOrder
    stage?: SortOrder
    status?: SortOrder
    appliedAt?: SortOrder
    stageUpdatedAt?: SortOrder
    notes?: SortOrder
    formResponses?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ApplicationMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    candidateId?: SortOrder
    requisitionId?: SortOrder
    stage?: SortOrder
    status?: SortOrder
    appliedAt?: SortOrder
    stageUpdatedAt?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ApplicationMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    candidateId?: SortOrder
    requisitionId?: SortOrder
    stage?: SortOrder
    status?: SortOrder
    appliedAt?: SortOrder
    stageUpdatedAt?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumApplicationStageWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ApplicationStage | EnumApplicationStageFieldRefInput<$PrismaModel>
    in?: $Enums.ApplicationStage[] | ListEnumApplicationStageFieldRefInput<$PrismaModel>
    notIn?: $Enums.ApplicationStage[] | ListEnumApplicationStageFieldRefInput<$PrismaModel>
    not?: NestedEnumApplicationStageWithAggregatesFilter<$PrismaModel> | $Enums.ApplicationStage
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumApplicationStageFilter<$PrismaModel>
    _max?: NestedEnumApplicationStageFilter<$PrismaModel>
  }

  export type EnumApplicationStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ApplicationStatus | EnumApplicationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ApplicationStatus[] | ListEnumApplicationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ApplicationStatus[] | ListEnumApplicationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumApplicationStatusWithAggregatesFilter<$PrismaModel> | $Enums.ApplicationStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumApplicationStatusFilter<$PrismaModel>
    _max?: NestedEnumApplicationStatusFilter<$PrismaModel>
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

  export type ApplicationScalarRelationFilter = {
    is?: ApplicationWhereInput
    isNot?: ApplicationWhereInput
  }

  export type ApplicationAttachmentCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    applicationId?: SortOrder
    fieldId?: SortOrder
    fileName?: SortOrder
    originalName?: SortOrder
    fileSize?: SortOrder
    mimeType?: SortOrder
    storageKey?: SortOrder
    createdAt?: SortOrder
  }

  export type ApplicationAttachmentAvgOrderByAggregateInput = {
    fileSize?: SortOrder
  }

  export type ApplicationAttachmentMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    applicationId?: SortOrder
    fieldId?: SortOrder
    fileName?: SortOrder
    originalName?: SortOrder
    fileSize?: SortOrder
    mimeType?: SortOrder
    storageKey?: SortOrder
    createdAt?: SortOrder
  }

  export type ApplicationAttachmentMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    applicationId?: SortOrder
    fieldId?: SortOrder
    fileName?: SortOrder
    originalName?: SortOrder
    fileSize?: SortOrder
    mimeType?: SortOrder
    storageKey?: SortOrder
    createdAt?: SortOrder
  }

  export type ApplicationAttachmentSumOrderByAggregateInput = {
    fileSize?: SortOrder
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

  export type CandidateNoteCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    candidateId?: SortOrder
    authorUserId?: SortOrder
    content?: SortOrder
    isPrivate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CandidateNoteMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    candidateId?: SortOrder
    authorUserId?: SortOrder
    content?: SortOrder
    isPrivate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CandidateNoteMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    candidateId?: SortOrder
    authorUserId?: SortOrder
    content?: SortOrder
    isPrivate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CandidateCreatetagsInput = {
    set: string[]
  }

  export type ApplicationCreateNestedManyWithoutCandidateInput = {
    create?: XOR<ApplicationCreateWithoutCandidateInput, ApplicationUncheckedCreateWithoutCandidateInput> | ApplicationCreateWithoutCandidateInput[] | ApplicationUncheckedCreateWithoutCandidateInput[]
    connectOrCreate?: ApplicationCreateOrConnectWithoutCandidateInput | ApplicationCreateOrConnectWithoutCandidateInput[]
    createMany?: ApplicationCreateManyCandidateInputEnvelope
    connect?: ApplicationWhereUniqueInput | ApplicationWhereUniqueInput[]
  }

  export type CandidateNoteCreateNestedManyWithoutCandidateInput = {
    create?: XOR<CandidateNoteCreateWithoutCandidateInput, CandidateNoteUncheckedCreateWithoutCandidateInput> | CandidateNoteCreateWithoutCandidateInput[] | CandidateNoteUncheckedCreateWithoutCandidateInput[]
    connectOrCreate?: CandidateNoteCreateOrConnectWithoutCandidateInput | CandidateNoteCreateOrConnectWithoutCandidateInput[]
    createMany?: CandidateNoteCreateManyCandidateInputEnvelope
    connect?: CandidateNoteWhereUniqueInput | CandidateNoteWhereUniqueInput[]
  }

  export type ApplicationUncheckedCreateNestedManyWithoutCandidateInput = {
    create?: XOR<ApplicationCreateWithoutCandidateInput, ApplicationUncheckedCreateWithoutCandidateInput> | ApplicationCreateWithoutCandidateInput[] | ApplicationUncheckedCreateWithoutCandidateInput[]
    connectOrCreate?: ApplicationCreateOrConnectWithoutCandidateInput | ApplicationCreateOrConnectWithoutCandidateInput[]
    createMany?: ApplicationCreateManyCandidateInputEnvelope
    connect?: ApplicationWhereUniqueInput | ApplicationWhereUniqueInput[]
  }

  export type CandidateNoteUncheckedCreateNestedManyWithoutCandidateInput = {
    create?: XOR<CandidateNoteCreateWithoutCandidateInput, CandidateNoteUncheckedCreateWithoutCandidateInput> | CandidateNoteCreateWithoutCandidateInput[] | CandidateNoteUncheckedCreateWithoutCandidateInput[]
    connectOrCreate?: CandidateNoteCreateOrConnectWithoutCandidateInput | CandidateNoteCreateOrConnectWithoutCandidateInput[]
    createMany?: CandidateNoteCreateManyCandidateInputEnvelope
    connect?: CandidateNoteWhereUniqueInput | CandidateNoteWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type CandidateUpdatetagsInput = {
    set?: string[]
    push?: string | string[]
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type ApplicationUpdateManyWithoutCandidateNestedInput = {
    create?: XOR<ApplicationCreateWithoutCandidateInput, ApplicationUncheckedCreateWithoutCandidateInput> | ApplicationCreateWithoutCandidateInput[] | ApplicationUncheckedCreateWithoutCandidateInput[]
    connectOrCreate?: ApplicationCreateOrConnectWithoutCandidateInput | ApplicationCreateOrConnectWithoutCandidateInput[]
    upsert?: ApplicationUpsertWithWhereUniqueWithoutCandidateInput | ApplicationUpsertWithWhereUniqueWithoutCandidateInput[]
    createMany?: ApplicationCreateManyCandidateInputEnvelope
    set?: ApplicationWhereUniqueInput | ApplicationWhereUniqueInput[]
    disconnect?: ApplicationWhereUniqueInput | ApplicationWhereUniqueInput[]
    delete?: ApplicationWhereUniqueInput | ApplicationWhereUniqueInput[]
    connect?: ApplicationWhereUniqueInput | ApplicationWhereUniqueInput[]
    update?: ApplicationUpdateWithWhereUniqueWithoutCandidateInput | ApplicationUpdateWithWhereUniqueWithoutCandidateInput[]
    updateMany?: ApplicationUpdateManyWithWhereWithoutCandidateInput | ApplicationUpdateManyWithWhereWithoutCandidateInput[]
    deleteMany?: ApplicationScalarWhereInput | ApplicationScalarWhereInput[]
  }

  export type CandidateNoteUpdateManyWithoutCandidateNestedInput = {
    create?: XOR<CandidateNoteCreateWithoutCandidateInput, CandidateNoteUncheckedCreateWithoutCandidateInput> | CandidateNoteCreateWithoutCandidateInput[] | CandidateNoteUncheckedCreateWithoutCandidateInput[]
    connectOrCreate?: CandidateNoteCreateOrConnectWithoutCandidateInput | CandidateNoteCreateOrConnectWithoutCandidateInput[]
    upsert?: CandidateNoteUpsertWithWhereUniqueWithoutCandidateInput | CandidateNoteUpsertWithWhereUniqueWithoutCandidateInput[]
    createMany?: CandidateNoteCreateManyCandidateInputEnvelope
    set?: CandidateNoteWhereUniqueInput | CandidateNoteWhereUniqueInput[]
    disconnect?: CandidateNoteWhereUniqueInput | CandidateNoteWhereUniqueInput[]
    delete?: CandidateNoteWhereUniqueInput | CandidateNoteWhereUniqueInput[]
    connect?: CandidateNoteWhereUniqueInput | CandidateNoteWhereUniqueInput[]
    update?: CandidateNoteUpdateWithWhereUniqueWithoutCandidateInput | CandidateNoteUpdateWithWhereUniqueWithoutCandidateInput[]
    updateMany?: CandidateNoteUpdateManyWithWhereWithoutCandidateInput | CandidateNoteUpdateManyWithWhereWithoutCandidateInput[]
    deleteMany?: CandidateNoteScalarWhereInput | CandidateNoteScalarWhereInput[]
  }

  export type ApplicationUncheckedUpdateManyWithoutCandidateNestedInput = {
    create?: XOR<ApplicationCreateWithoutCandidateInput, ApplicationUncheckedCreateWithoutCandidateInput> | ApplicationCreateWithoutCandidateInput[] | ApplicationUncheckedCreateWithoutCandidateInput[]
    connectOrCreate?: ApplicationCreateOrConnectWithoutCandidateInput | ApplicationCreateOrConnectWithoutCandidateInput[]
    upsert?: ApplicationUpsertWithWhereUniqueWithoutCandidateInput | ApplicationUpsertWithWhereUniqueWithoutCandidateInput[]
    createMany?: ApplicationCreateManyCandidateInputEnvelope
    set?: ApplicationWhereUniqueInput | ApplicationWhereUniqueInput[]
    disconnect?: ApplicationWhereUniqueInput | ApplicationWhereUniqueInput[]
    delete?: ApplicationWhereUniqueInput | ApplicationWhereUniqueInput[]
    connect?: ApplicationWhereUniqueInput | ApplicationWhereUniqueInput[]
    update?: ApplicationUpdateWithWhereUniqueWithoutCandidateInput | ApplicationUpdateWithWhereUniqueWithoutCandidateInput[]
    updateMany?: ApplicationUpdateManyWithWhereWithoutCandidateInput | ApplicationUpdateManyWithWhereWithoutCandidateInput[]
    deleteMany?: ApplicationScalarWhereInput | ApplicationScalarWhereInput[]
  }

  export type CandidateNoteUncheckedUpdateManyWithoutCandidateNestedInput = {
    create?: XOR<CandidateNoteCreateWithoutCandidateInput, CandidateNoteUncheckedCreateWithoutCandidateInput> | CandidateNoteCreateWithoutCandidateInput[] | CandidateNoteUncheckedCreateWithoutCandidateInput[]
    connectOrCreate?: CandidateNoteCreateOrConnectWithoutCandidateInput | CandidateNoteCreateOrConnectWithoutCandidateInput[]
    upsert?: CandidateNoteUpsertWithWhereUniqueWithoutCandidateInput | CandidateNoteUpsertWithWhereUniqueWithoutCandidateInput[]
    createMany?: CandidateNoteCreateManyCandidateInputEnvelope
    set?: CandidateNoteWhereUniqueInput | CandidateNoteWhereUniqueInput[]
    disconnect?: CandidateNoteWhereUniqueInput | CandidateNoteWhereUniqueInput[]
    delete?: CandidateNoteWhereUniqueInput | CandidateNoteWhereUniqueInput[]
    connect?: CandidateNoteWhereUniqueInput | CandidateNoteWhereUniqueInput[]
    update?: CandidateNoteUpdateWithWhereUniqueWithoutCandidateInput | CandidateNoteUpdateWithWhereUniqueWithoutCandidateInput[]
    updateMany?: CandidateNoteUpdateManyWithWhereWithoutCandidateInput | CandidateNoteUpdateManyWithWhereWithoutCandidateInput[]
    deleteMany?: CandidateNoteScalarWhereInput | CandidateNoteScalarWhereInput[]
  }

  export type CandidateCreateNestedOneWithoutApplicationsInput = {
    create?: XOR<CandidateCreateWithoutApplicationsInput, CandidateUncheckedCreateWithoutApplicationsInput>
    connectOrCreate?: CandidateCreateOrConnectWithoutApplicationsInput
    connect?: CandidateWhereUniqueInput
  }

  export type ApplicationAttachmentCreateNestedManyWithoutApplicationInput = {
    create?: XOR<ApplicationAttachmentCreateWithoutApplicationInput, ApplicationAttachmentUncheckedCreateWithoutApplicationInput> | ApplicationAttachmentCreateWithoutApplicationInput[] | ApplicationAttachmentUncheckedCreateWithoutApplicationInput[]
    connectOrCreate?: ApplicationAttachmentCreateOrConnectWithoutApplicationInput | ApplicationAttachmentCreateOrConnectWithoutApplicationInput[]
    createMany?: ApplicationAttachmentCreateManyApplicationInputEnvelope
    connect?: ApplicationAttachmentWhereUniqueInput | ApplicationAttachmentWhereUniqueInput[]
  }

  export type ApplicationAttachmentUncheckedCreateNestedManyWithoutApplicationInput = {
    create?: XOR<ApplicationAttachmentCreateWithoutApplicationInput, ApplicationAttachmentUncheckedCreateWithoutApplicationInput> | ApplicationAttachmentCreateWithoutApplicationInput[] | ApplicationAttachmentUncheckedCreateWithoutApplicationInput[]
    connectOrCreate?: ApplicationAttachmentCreateOrConnectWithoutApplicationInput | ApplicationAttachmentCreateOrConnectWithoutApplicationInput[]
    createMany?: ApplicationAttachmentCreateManyApplicationInputEnvelope
    connect?: ApplicationAttachmentWhereUniqueInput | ApplicationAttachmentWhereUniqueInput[]
  }

  export type EnumApplicationStageFieldUpdateOperationsInput = {
    set?: $Enums.ApplicationStage
  }

  export type EnumApplicationStatusFieldUpdateOperationsInput = {
    set?: $Enums.ApplicationStatus
  }

  export type CandidateUpdateOneRequiredWithoutApplicationsNestedInput = {
    create?: XOR<CandidateCreateWithoutApplicationsInput, CandidateUncheckedCreateWithoutApplicationsInput>
    connectOrCreate?: CandidateCreateOrConnectWithoutApplicationsInput
    upsert?: CandidateUpsertWithoutApplicationsInput
    connect?: CandidateWhereUniqueInput
    update?: XOR<XOR<CandidateUpdateToOneWithWhereWithoutApplicationsInput, CandidateUpdateWithoutApplicationsInput>, CandidateUncheckedUpdateWithoutApplicationsInput>
  }

  export type ApplicationAttachmentUpdateManyWithoutApplicationNestedInput = {
    create?: XOR<ApplicationAttachmentCreateWithoutApplicationInput, ApplicationAttachmentUncheckedCreateWithoutApplicationInput> | ApplicationAttachmentCreateWithoutApplicationInput[] | ApplicationAttachmentUncheckedCreateWithoutApplicationInput[]
    connectOrCreate?: ApplicationAttachmentCreateOrConnectWithoutApplicationInput | ApplicationAttachmentCreateOrConnectWithoutApplicationInput[]
    upsert?: ApplicationAttachmentUpsertWithWhereUniqueWithoutApplicationInput | ApplicationAttachmentUpsertWithWhereUniqueWithoutApplicationInput[]
    createMany?: ApplicationAttachmentCreateManyApplicationInputEnvelope
    set?: ApplicationAttachmentWhereUniqueInput | ApplicationAttachmentWhereUniqueInput[]
    disconnect?: ApplicationAttachmentWhereUniqueInput | ApplicationAttachmentWhereUniqueInput[]
    delete?: ApplicationAttachmentWhereUniqueInput | ApplicationAttachmentWhereUniqueInput[]
    connect?: ApplicationAttachmentWhereUniqueInput | ApplicationAttachmentWhereUniqueInput[]
    update?: ApplicationAttachmentUpdateWithWhereUniqueWithoutApplicationInput | ApplicationAttachmentUpdateWithWhereUniqueWithoutApplicationInput[]
    updateMany?: ApplicationAttachmentUpdateManyWithWhereWithoutApplicationInput | ApplicationAttachmentUpdateManyWithWhereWithoutApplicationInput[]
    deleteMany?: ApplicationAttachmentScalarWhereInput | ApplicationAttachmentScalarWhereInput[]
  }

  export type ApplicationAttachmentUncheckedUpdateManyWithoutApplicationNestedInput = {
    create?: XOR<ApplicationAttachmentCreateWithoutApplicationInput, ApplicationAttachmentUncheckedCreateWithoutApplicationInput> | ApplicationAttachmentCreateWithoutApplicationInput[] | ApplicationAttachmentUncheckedCreateWithoutApplicationInput[]
    connectOrCreate?: ApplicationAttachmentCreateOrConnectWithoutApplicationInput | ApplicationAttachmentCreateOrConnectWithoutApplicationInput[]
    upsert?: ApplicationAttachmentUpsertWithWhereUniqueWithoutApplicationInput | ApplicationAttachmentUpsertWithWhereUniqueWithoutApplicationInput[]
    createMany?: ApplicationAttachmentCreateManyApplicationInputEnvelope
    set?: ApplicationAttachmentWhereUniqueInput | ApplicationAttachmentWhereUniqueInput[]
    disconnect?: ApplicationAttachmentWhereUniqueInput | ApplicationAttachmentWhereUniqueInput[]
    delete?: ApplicationAttachmentWhereUniqueInput | ApplicationAttachmentWhereUniqueInput[]
    connect?: ApplicationAttachmentWhereUniqueInput | ApplicationAttachmentWhereUniqueInput[]
    update?: ApplicationAttachmentUpdateWithWhereUniqueWithoutApplicationInput | ApplicationAttachmentUpdateWithWhereUniqueWithoutApplicationInput[]
    updateMany?: ApplicationAttachmentUpdateManyWithWhereWithoutApplicationInput | ApplicationAttachmentUpdateManyWithWhereWithoutApplicationInput[]
    deleteMany?: ApplicationAttachmentScalarWhereInput | ApplicationAttachmentScalarWhereInput[]
  }

  export type ApplicationCreateNestedOneWithoutAttachmentsInput = {
    create?: XOR<ApplicationCreateWithoutAttachmentsInput, ApplicationUncheckedCreateWithoutAttachmentsInput>
    connectOrCreate?: ApplicationCreateOrConnectWithoutAttachmentsInput
    connect?: ApplicationWhereUniqueInput
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type ApplicationUpdateOneRequiredWithoutAttachmentsNestedInput = {
    create?: XOR<ApplicationCreateWithoutAttachmentsInput, ApplicationUncheckedCreateWithoutAttachmentsInput>
    connectOrCreate?: ApplicationCreateOrConnectWithoutAttachmentsInput
    upsert?: ApplicationUpsertWithoutAttachmentsInput
    connect?: ApplicationWhereUniqueInput
    update?: XOR<XOR<ApplicationUpdateToOneWithWhereWithoutAttachmentsInput, ApplicationUpdateWithoutAttachmentsInput>, ApplicationUncheckedUpdateWithoutAttachmentsInput>
  }

  export type CandidateCreateNestedOneWithoutNotesInput = {
    create?: XOR<CandidateCreateWithoutNotesInput, CandidateUncheckedCreateWithoutNotesInput>
    connectOrCreate?: CandidateCreateOrConnectWithoutNotesInput
    connect?: CandidateWhereUniqueInput
  }

  export type CandidateUpdateOneRequiredWithoutNotesNestedInput = {
    create?: XOR<CandidateCreateWithoutNotesInput, CandidateUncheckedCreateWithoutNotesInput>
    connectOrCreate?: CandidateCreateOrConnectWithoutNotesInput
    upsert?: CandidateUpsertWithoutNotesInput
    connect?: CandidateWhereUniqueInput
    update?: XOR<XOR<CandidateUpdateToOneWithWhereWithoutNotesInput, CandidateUpdateWithoutNotesInput>, CandidateUncheckedUpdateWithoutNotesInput>
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

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
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

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
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

  export type NestedEnumApplicationStageFilter<$PrismaModel = never> = {
    equals?: $Enums.ApplicationStage | EnumApplicationStageFieldRefInput<$PrismaModel>
    in?: $Enums.ApplicationStage[] | ListEnumApplicationStageFieldRefInput<$PrismaModel>
    notIn?: $Enums.ApplicationStage[] | ListEnumApplicationStageFieldRefInput<$PrismaModel>
    not?: NestedEnumApplicationStageFilter<$PrismaModel> | $Enums.ApplicationStage
  }

  export type NestedEnumApplicationStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.ApplicationStatus | EnumApplicationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ApplicationStatus[] | ListEnumApplicationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ApplicationStatus[] | ListEnumApplicationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumApplicationStatusFilter<$PrismaModel> | $Enums.ApplicationStatus
  }

  export type NestedEnumApplicationStageWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ApplicationStage | EnumApplicationStageFieldRefInput<$PrismaModel>
    in?: $Enums.ApplicationStage[] | ListEnumApplicationStageFieldRefInput<$PrismaModel>
    notIn?: $Enums.ApplicationStage[] | ListEnumApplicationStageFieldRefInput<$PrismaModel>
    not?: NestedEnumApplicationStageWithAggregatesFilter<$PrismaModel> | $Enums.ApplicationStage
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumApplicationStageFilter<$PrismaModel>
    _max?: NestedEnumApplicationStageFilter<$PrismaModel>
  }

  export type NestedEnumApplicationStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ApplicationStatus | EnumApplicationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ApplicationStatus[] | ListEnumApplicationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ApplicationStatus[] | ListEnumApplicationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumApplicationStatusWithAggregatesFilter<$PrismaModel> | $Enums.ApplicationStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumApplicationStatusFilter<$PrismaModel>
    _max?: NestedEnumApplicationStatusFilter<$PrismaModel>
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

  export type ApplicationCreateWithoutCandidateInput = {
    id?: string
    tenantId: string
    requisitionId: string
    stage?: $Enums.ApplicationStage
    status?: $Enums.ApplicationStatus
    appliedAt?: Date | string
    stageUpdatedAt?: Date | string
    notes?: string | null
    formResponses?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    attachments?: ApplicationAttachmentCreateNestedManyWithoutApplicationInput
  }

  export type ApplicationUncheckedCreateWithoutCandidateInput = {
    id?: string
    tenantId: string
    requisitionId: string
    stage?: $Enums.ApplicationStage
    status?: $Enums.ApplicationStatus
    appliedAt?: Date | string
    stageUpdatedAt?: Date | string
    notes?: string | null
    formResponses?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    attachments?: ApplicationAttachmentUncheckedCreateNestedManyWithoutApplicationInput
  }

  export type ApplicationCreateOrConnectWithoutCandidateInput = {
    where: ApplicationWhereUniqueInput
    create: XOR<ApplicationCreateWithoutCandidateInput, ApplicationUncheckedCreateWithoutCandidateInput>
  }

  export type ApplicationCreateManyCandidateInputEnvelope = {
    data: ApplicationCreateManyCandidateInput | ApplicationCreateManyCandidateInput[]
    skipDuplicates?: boolean
  }

  export type CandidateNoteCreateWithoutCandidateInput = {
    id?: string
    tenantId: string
    authorUserId: string
    content: string
    isPrivate?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CandidateNoteUncheckedCreateWithoutCandidateInput = {
    id?: string
    tenantId: string
    authorUserId: string
    content: string
    isPrivate?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CandidateNoteCreateOrConnectWithoutCandidateInput = {
    where: CandidateNoteWhereUniqueInput
    create: XOR<CandidateNoteCreateWithoutCandidateInput, CandidateNoteUncheckedCreateWithoutCandidateInput>
  }

  export type CandidateNoteCreateManyCandidateInputEnvelope = {
    data: CandidateNoteCreateManyCandidateInput | CandidateNoteCreateManyCandidateInput[]
    skipDuplicates?: boolean
  }

  export type ApplicationUpsertWithWhereUniqueWithoutCandidateInput = {
    where: ApplicationWhereUniqueInput
    update: XOR<ApplicationUpdateWithoutCandidateInput, ApplicationUncheckedUpdateWithoutCandidateInput>
    create: XOR<ApplicationCreateWithoutCandidateInput, ApplicationUncheckedCreateWithoutCandidateInput>
  }

  export type ApplicationUpdateWithWhereUniqueWithoutCandidateInput = {
    where: ApplicationWhereUniqueInput
    data: XOR<ApplicationUpdateWithoutCandidateInput, ApplicationUncheckedUpdateWithoutCandidateInput>
  }

  export type ApplicationUpdateManyWithWhereWithoutCandidateInput = {
    where: ApplicationScalarWhereInput
    data: XOR<ApplicationUpdateManyMutationInput, ApplicationUncheckedUpdateManyWithoutCandidateInput>
  }

  export type ApplicationScalarWhereInput = {
    AND?: ApplicationScalarWhereInput | ApplicationScalarWhereInput[]
    OR?: ApplicationScalarWhereInput[]
    NOT?: ApplicationScalarWhereInput | ApplicationScalarWhereInput[]
    id?: StringFilter<"Application"> | string
    tenantId?: StringFilter<"Application"> | string
    candidateId?: StringFilter<"Application"> | string
    requisitionId?: StringFilter<"Application"> | string
    stage?: EnumApplicationStageFilter<"Application"> | $Enums.ApplicationStage
    status?: EnumApplicationStatusFilter<"Application"> | $Enums.ApplicationStatus
    appliedAt?: DateTimeFilter<"Application"> | Date | string
    stageUpdatedAt?: DateTimeFilter<"Application"> | Date | string
    notes?: StringNullableFilter<"Application"> | string | null
    formResponses?: JsonNullableFilter<"Application">
    createdAt?: DateTimeFilter<"Application"> | Date | string
    updatedAt?: DateTimeFilter<"Application"> | Date | string
  }

  export type CandidateNoteUpsertWithWhereUniqueWithoutCandidateInput = {
    where: CandidateNoteWhereUniqueInput
    update: XOR<CandidateNoteUpdateWithoutCandidateInput, CandidateNoteUncheckedUpdateWithoutCandidateInput>
    create: XOR<CandidateNoteCreateWithoutCandidateInput, CandidateNoteUncheckedCreateWithoutCandidateInput>
  }

  export type CandidateNoteUpdateWithWhereUniqueWithoutCandidateInput = {
    where: CandidateNoteWhereUniqueInput
    data: XOR<CandidateNoteUpdateWithoutCandidateInput, CandidateNoteUncheckedUpdateWithoutCandidateInput>
  }

  export type CandidateNoteUpdateManyWithWhereWithoutCandidateInput = {
    where: CandidateNoteScalarWhereInput
    data: XOR<CandidateNoteUpdateManyMutationInput, CandidateNoteUncheckedUpdateManyWithoutCandidateInput>
  }

  export type CandidateNoteScalarWhereInput = {
    AND?: CandidateNoteScalarWhereInput | CandidateNoteScalarWhereInput[]
    OR?: CandidateNoteScalarWhereInput[]
    NOT?: CandidateNoteScalarWhereInput | CandidateNoteScalarWhereInput[]
    id?: StringFilter<"CandidateNote"> | string
    tenantId?: StringFilter<"CandidateNote"> | string
    candidateId?: StringFilter<"CandidateNote"> | string
    authorUserId?: StringFilter<"CandidateNote"> | string
    content?: StringFilter<"CandidateNote"> | string
    isPrivate?: BoolFilter<"CandidateNote"> | boolean
    createdAt?: DateTimeFilter<"CandidateNote"> | Date | string
    updatedAt?: DateTimeFilter<"CandidateNote"> | Date | string
  }

  export type CandidateCreateWithoutApplicationsInput = {
    id?: string
    tenantId: string
    email: string
    firstName: string
    lastName: string
    phone?: string | null
    location?: string | null
    country?: string | null
    resumeUrl?: string | null
    linkedinUrl?: string | null
    portfolioUrl?: string | null
    summary?: string | null
    source?: string | null
    tags?: CandidateCreatetagsInput | string[]
    isAnonymized?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    notes?: CandidateNoteCreateNestedManyWithoutCandidateInput
  }

  export type CandidateUncheckedCreateWithoutApplicationsInput = {
    id?: string
    tenantId: string
    email: string
    firstName: string
    lastName: string
    phone?: string | null
    location?: string | null
    country?: string | null
    resumeUrl?: string | null
    linkedinUrl?: string | null
    portfolioUrl?: string | null
    summary?: string | null
    source?: string | null
    tags?: CandidateCreatetagsInput | string[]
    isAnonymized?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    notes?: CandidateNoteUncheckedCreateNestedManyWithoutCandidateInput
  }

  export type CandidateCreateOrConnectWithoutApplicationsInput = {
    where: CandidateWhereUniqueInput
    create: XOR<CandidateCreateWithoutApplicationsInput, CandidateUncheckedCreateWithoutApplicationsInput>
  }

  export type ApplicationAttachmentCreateWithoutApplicationInput = {
    id?: string
    tenantId: string
    fieldId: string
    fileName: string
    originalName: string
    fileSize: number
    mimeType: string
    storageKey: string
    createdAt?: Date | string
  }

  export type ApplicationAttachmentUncheckedCreateWithoutApplicationInput = {
    id?: string
    tenantId: string
    fieldId: string
    fileName: string
    originalName: string
    fileSize: number
    mimeType: string
    storageKey: string
    createdAt?: Date | string
  }

  export type ApplicationAttachmentCreateOrConnectWithoutApplicationInput = {
    where: ApplicationAttachmentWhereUniqueInput
    create: XOR<ApplicationAttachmentCreateWithoutApplicationInput, ApplicationAttachmentUncheckedCreateWithoutApplicationInput>
  }

  export type ApplicationAttachmentCreateManyApplicationInputEnvelope = {
    data: ApplicationAttachmentCreateManyApplicationInput | ApplicationAttachmentCreateManyApplicationInput[]
    skipDuplicates?: boolean
  }

  export type CandidateUpsertWithoutApplicationsInput = {
    update: XOR<CandidateUpdateWithoutApplicationsInput, CandidateUncheckedUpdateWithoutApplicationsInput>
    create: XOR<CandidateCreateWithoutApplicationsInput, CandidateUncheckedCreateWithoutApplicationsInput>
    where?: CandidateWhereInput
  }

  export type CandidateUpdateToOneWithWhereWithoutApplicationsInput = {
    where?: CandidateWhereInput
    data: XOR<CandidateUpdateWithoutApplicationsInput, CandidateUncheckedUpdateWithoutApplicationsInput>
  }

  export type CandidateUpdateWithoutApplicationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    country?: NullableStringFieldUpdateOperationsInput | string | null
    resumeUrl?: NullableStringFieldUpdateOperationsInput | string | null
    linkedinUrl?: NullableStringFieldUpdateOperationsInput | string | null
    portfolioUrl?: NullableStringFieldUpdateOperationsInput | string | null
    summary?: NullableStringFieldUpdateOperationsInput | string | null
    source?: NullableStringFieldUpdateOperationsInput | string | null
    tags?: CandidateUpdatetagsInput | string[]
    isAnonymized?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: CandidateNoteUpdateManyWithoutCandidateNestedInput
  }

  export type CandidateUncheckedUpdateWithoutApplicationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    country?: NullableStringFieldUpdateOperationsInput | string | null
    resumeUrl?: NullableStringFieldUpdateOperationsInput | string | null
    linkedinUrl?: NullableStringFieldUpdateOperationsInput | string | null
    portfolioUrl?: NullableStringFieldUpdateOperationsInput | string | null
    summary?: NullableStringFieldUpdateOperationsInput | string | null
    source?: NullableStringFieldUpdateOperationsInput | string | null
    tags?: CandidateUpdatetagsInput | string[]
    isAnonymized?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: CandidateNoteUncheckedUpdateManyWithoutCandidateNestedInput
  }

  export type ApplicationAttachmentUpsertWithWhereUniqueWithoutApplicationInput = {
    where: ApplicationAttachmentWhereUniqueInput
    update: XOR<ApplicationAttachmentUpdateWithoutApplicationInput, ApplicationAttachmentUncheckedUpdateWithoutApplicationInput>
    create: XOR<ApplicationAttachmentCreateWithoutApplicationInput, ApplicationAttachmentUncheckedCreateWithoutApplicationInput>
  }

  export type ApplicationAttachmentUpdateWithWhereUniqueWithoutApplicationInput = {
    where: ApplicationAttachmentWhereUniqueInput
    data: XOR<ApplicationAttachmentUpdateWithoutApplicationInput, ApplicationAttachmentUncheckedUpdateWithoutApplicationInput>
  }

  export type ApplicationAttachmentUpdateManyWithWhereWithoutApplicationInput = {
    where: ApplicationAttachmentScalarWhereInput
    data: XOR<ApplicationAttachmentUpdateManyMutationInput, ApplicationAttachmentUncheckedUpdateManyWithoutApplicationInput>
  }

  export type ApplicationAttachmentScalarWhereInput = {
    AND?: ApplicationAttachmentScalarWhereInput | ApplicationAttachmentScalarWhereInput[]
    OR?: ApplicationAttachmentScalarWhereInput[]
    NOT?: ApplicationAttachmentScalarWhereInput | ApplicationAttachmentScalarWhereInput[]
    id?: StringFilter<"ApplicationAttachment"> | string
    tenantId?: StringFilter<"ApplicationAttachment"> | string
    applicationId?: StringFilter<"ApplicationAttachment"> | string
    fieldId?: StringFilter<"ApplicationAttachment"> | string
    fileName?: StringFilter<"ApplicationAttachment"> | string
    originalName?: StringFilter<"ApplicationAttachment"> | string
    fileSize?: IntFilter<"ApplicationAttachment"> | number
    mimeType?: StringFilter<"ApplicationAttachment"> | string
    storageKey?: StringFilter<"ApplicationAttachment"> | string
    createdAt?: DateTimeFilter<"ApplicationAttachment"> | Date | string
  }

  export type ApplicationCreateWithoutAttachmentsInput = {
    id?: string
    tenantId: string
    requisitionId: string
    stage?: $Enums.ApplicationStage
    status?: $Enums.ApplicationStatus
    appliedAt?: Date | string
    stageUpdatedAt?: Date | string
    notes?: string | null
    formResponses?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    candidate: CandidateCreateNestedOneWithoutApplicationsInput
  }

  export type ApplicationUncheckedCreateWithoutAttachmentsInput = {
    id?: string
    tenantId: string
    candidateId: string
    requisitionId: string
    stage?: $Enums.ApplicationStage
    status?: $Enums.ApplicationStatus
    appliedAt?: Date | string
    stageUpdatedAt?: Date | string
    notes?: string | null
    formResponses?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ApplicationCreateOrConnectWithoutAttachmentsInput = {
    where: ApplicationWhereUniqueInput
    create: XOR<ApplicationCreateWithoutAttachmentsInput, ApplicationUncheckedCreateWithoutAttachmentsInput>
  }

  export type ApplicationUpsertWithoutAttachmentsInput = {
    update: XOR<ApplicationUpdateWithoutAttachmentsInput, ApplicationUncheckedUpdateWithoutAttachmentsInput>
    create: XOR<ApplicationCreateWithoutAttachmentsInput, ApplicationUncheckedCreateWithoutAttachmentsInput>
    where?: ApplicationWhereInput
  }

  export type ApplicationUpdateToOneWithWhereWithoutAttachmentsInput = {
    where?: ApplicationWhereInput
    data: XOR<ApplicationUpdateWithoutAttachmentsInput, ApplicationUncheckedUpdateWithoutAttachmentsInput>
  }

  export type ApplicationUpdateWithoutAttachmentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    requisitionId?: StringFieldUpdateOperationsInput | string
    stage?: EnumApplicationStageFieldUpdateOperationsInput | $Enums.ApplicationStage
    status?: EnumApplicationStatusFieldUpdateOperationsInput | $Enums.ApplicationStatus
    appliedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    stageUpdatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    formResponses?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    candidate?: CandidateUpdateOneRequiredWithoutApplicationsNestedInput
  }

  export type ApplicationUncheckedUpdateWithoutAttachmentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    requisitionId?: StringFieldUpdateOperationsInput | string
    stage?: EnumApplicationStageFieldUpdateOperationsInput | $Enums.ApplicationStage
    status?: EnumApplicationStatusFieldUpdateOperationsInput | $Enums.ApplicationStatus
    appliedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    stageUpdatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    formResponses?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CandidateCreateWithoutNotesInput = {
    id?: string
    tenantId: string
    email: string
    firstName: string
    lastName: string
    phone?: string | null
    location?: string | null
    country?: string | null
    resumeUrl?: string | null
    linkedinUrl?: string | null
    portfolioUrl?: string | null
    summary?: string | null
    source?: string | null
    tags?: CandidateCreatetagsInput | string[]
    isAnonymized?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    applications?: ApplicationCreateNestedManyWithoutCandidateInput
  }

  export type CandidateUncheckedCreateWithoutNotesInput = {
    id?: string
    tenantId: string
    email: string
    firstName: string
    lastName: string
    phone?: string | null
    location?: string | null
    country?: string | null
    resumeUrl?: string | null
    linkedinUrl?: string | null
    portfolioUrl?: string | null
    summary?: string | null
    source?: string | null
    tags?: CandidateCreatetagsInput | string[]
    isAnonymized?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    applications?: ApplicationUncheckedCreateNestedManyWithoutCandidateInput
  }

  export type CandidateCreateOrConnectWithoutNotesInput = {
    where: CandidateWhereUniqueInput
    create: XOR<CandidateCreateWithoutNotesInput, CandidateUncheckedCreateWithoutNotesInput>
  }

  export type CandidateUpsertWithoutNotesInput = {
    update: XOR<CandidateUpdateWithoutNotesInput, CandidateUncheckedUpdateWithoutNotesInput>
    create: XOR<CandidateCreateWithoutNotesInput, CandidateUncheckedCreateWithoutNotesInput>
    where?: CandidateWhereInput
  }

  export type CandidateUpdateToOneWithWhereWithoutNotesInput = {
    where?: CandidateWhereInput
    data: XOR<CandidateUpdateWithoutNotesInput, CandidateUncheckedUpdateWithoutNotesInput>
  }

  export type CandidateUpdateWithoutNotesInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    country?: NullableStringFieldUpdateOperationsInput | string | null
    resumeUrl?: NullableStringFieldUpdateOperationsInput | string | null
    linkedinUrl?: NullableStringFieldUpdateOperationsInput | string | null
    portfolioUrl?: NullableStringFieldUpdateOperationsInput | string | null
    summary?: NullableStringFieldUpdateOperationsInput | string | null
    source?: NullableStringFieldUpdateOperationsInput | string | null
    tags?: CandidateUpdatetagsInput | string[]
    isAnonymized?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    applications?: ApplicationUpdateManyWithoutCandidateNestedInput
  }

  export type CandidateUncheckedUpdateWithoutNotesInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    country?: NullableStringFieldUpdateOperationsInput | string | null
    resumeUrl?: NullableStringFieldUpdateOperationsInput | string | null
    linkedinUrl?: NullableStringFieldUpdateOperationsInput | string | null
    portfolioUrl?: NullableStringFieldUpdateOperationsInput | string | null
    summary?: NullableStringFieldUpdateOperationsInput | string | null
    source?: NullableStringFieldUpdateOperationsInput | string | null
    tags?: CandidateUpdatetagsInput | string[]
    isAnonymized?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    applications?: ApplicationUncheckedUpdateManyWithoutCandidateNestedInput
  }

  export type ApplicationCreateManyCandidateInput = {
    id?: string
    tenantId: string
    requisitionId: string
    stage?: $Enums.ApplicationStage
    status?: $Enums.ApplicationStatus
    appliedAt?: Date | string
    stageUpdatedAt?: Date | string
    notes?: string | null
    formResponses?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CandidateNoteCreateManyCandidateInput = {
    id?: string
    tenantId: string
    authorUserId: string
    content: string
    isPrivate?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ApplicationUpdateWithoutCandidateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    requisitionId?: StringFieldUpdateOperationsInput | string
    stage?: EnumApplicationStageFieldUpdateOperationsInput | $Enums.ApplicationStage
    status?: EnumApplicationStatusFieldUpdateOperationsInput | $Enums.ApplicationStatus
    appliedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    stageUpdatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    formResponses?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    attachments?: ApplicationAttachmentUpdateManyWithoutApplicationNestedInput
  }

  export type ApplicationUncheckedUpdateWithoutCandidateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    requisitionId?: StringFieldUpdateOperationsInput | string
    stage?: EnumApplicationStageFieldUpdateOperationsInput | $Enums.ApplicationStage
    status?: EnumApplicationStatusFieldUpdateOperationsInput | $Enums.ApplicationStatus
    appliedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    stageUpdatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    formResponses?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    attachments?: ApplicationAttachmentUncheckedUpdateManyWithoutApplicationNestedInput
  }

  export type ApplicationUncheckedUpdateManyWithoutCandidateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    requisitionId?: StringFieldUpdateOperationsInput | string
    stage?: EnumApplicationStageFieldUpdateOperationsInput | $Enums.ApplicationStage
    status?: EnumApplicationStatusFieldUpdateOperationsInput | $Enums.ApplicationStatus
    appliedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    stageUpdatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    formResponses?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CandidateNoteUpdateWithoutCandidateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    authorUserId?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    isPrivate?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CandidateNoteUncheckedUpdateWithoutCandidateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    authorUserId?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    isPrivate?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CandidateNoteUncheckedUpdateManyWithoutCandidateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    authorUserId?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    isPrivate?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ApplicationAttachmentCreateManyApplicationInput = {
    id?: string
    tenantId: string
    fieldId: string
    fileName: string
    originalName: string
    fileSize: number
    mimeType: string
    storageKey: string
    createdAt?: Date | string
  }

  export type ApplicationAttachmentUpdateWithoutApplicationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    fieldId?: StringFieldUpdateOperationsInput | string
    fileName?: StringFieldUpdateOperationsInput | string
    originalName?: StringFieldUpdateOperationsInput | string
    fileSize?: IntFieldUpdateOperationsInput | number
    mimeType?: StringFieldUpdateOperationsInput | string
    storageKey?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ApplicationAttachmentUncheckedUpdateWithoutApplicationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    fieldId?: StringFieldUpdateOperationsInput | string
    fileName?: StringFieldUpdateOperationsInput | string
    originalName?: StringFieldUpdateOperationsInput | string
    fileSize?: IntFieldUpdateOperationsInput | number
    mimeType?: StringFieldUpdateOperationsInput | string
    storageKey?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ApplicationAttachmentUncheckedUpdateManyWithoutApplicationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    fieldId?: StringFieldUpdateOperationsInput | string
    fileName?: StringFieldUpdateOperationsInput | string
    originalName?: StringFieldUpdateOperationsInput | string
    fileSize?: IntFieldUpdateOperationsInput | number
    mimeType?: StringFieldUpdateOperationsInput | string
    storageKey?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
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