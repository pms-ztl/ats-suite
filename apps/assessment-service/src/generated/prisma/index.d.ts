
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
 * Model Assessment
 * 
 */
export type Assessment = $Result.DefaultSelection<Prisma.$AssessmentPayload>
/**
 * Model AssessmentInvite
 * 
 */
export type AssessmentInvite = $Result.DefaultSelection<Prisma.$AssessmentInvitePayload>
/**
 * Model Attempt
 * 
 */
export type Attempt = $Result.DefaultSelection<Prisma.$AttemptPayload>
/**
 * Model Answer
 * 
 */
export type Answer = $Result.DefaultSelection<Prisma.$AnswerPayload>
/**
 * Model ProctorEvent
 * 
 */
export type ProctorEvent = $Result.DefaultSelection<Prisma.$ProctorEventPayload>
/**
 * Model AssessmentResult
 * 
 */
export type AssessmentResult = $Result.DefaultSelection<Prisma.$AssessmentResultPayload>
/**
 * Model QuestionBank
 * 
 */
export type QuestionBank = $Result.DefaultSelection<Prisma.$QuestionBankPayload>
/**
 * Model Question
 * 
 */
export type Question = $Result.DefaultSelection<Prisma.$QuestionPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const AssessmentStatus: {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED'
};

export type AssessmentStatus = (typeof AssessmentStatus)[keyof typeof AssessmentStatus]


export const QuestionType: {
  MCQ_SINGLE: 'MCQ_SINGLE',
  MCQ_MULTI: 'MCQ_MULTI',
  TRUE_FALSE: 'TRUE_FALSE',
  SHORT_ANSWER: 'SHORT_ANSWER',
  ESSAY: 'ESSAY',
  CODING: 'CODING'
};

export type QuestionType = (typeof QuestionType)[keyof typeof QuestionType]


export const AssessmentInviteStatus: {
  PENDING: 'PENDING',
  SENT: 'SENT',
  OPENED: 'OPENED',
  STARTED: 'STARTED',
  SUBMITTED: 'SUBMITTED',
  EXPIRED: 'EXPIRED',
  REVOKED: 'REVOKED'
};

export type AssessmentInviteStatus = (typeof AssessmentInviteStatus)[keyof typeof AssessmentInviteStatus]


export const AttemptStatus: {
  IN_PROGRESS: 'IN_PROGRESS',
  SUBMITTED: 'SUBMITTED',
  EXPIRED: 'EXPIRED',
  GRADED: 'GRADED'
};

export type AttemptStatus = (typeof AttemptStatus)[keyof typeof AttemptStatus]

}

export type AssessmentStatus = $Enums.AssessmentStatus

export const AssessmentStatus: typeof $Enums.AssessmentStatus

export type QuestionType = $Enums.QuestionType

export const QuestionType: typeof $Enums.QuestionType

export type AssessmentInviteStatus = $Enums.AssessmentInviteStatus

export const AssessmentInviteStatus: typeof $Enums.AssessmentInviteStatus

export type AttemptStatus = $Enums.AttemptStatus

export const AttemptStatus: typeof $Enums.AttemptStatus

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Assessments
 * const assessments = await prisma.assessment.findMany()
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
   * // Fetch zero or more Assessments
   * const assessments = await prisma.assessment.findMany()
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
   * `prisma.assessment`: Exposes CRUD operations for the **Assessment** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Assessments
    * const assessments = await prisma.assessment.findMany()
    * ```
    */
  get assessment(): Prisma.AssessmentDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.assessmentInvite`: Exposes CRUD operations for the **AssessmentInvite** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AssessmentInvites
    * const assessmentInvites = await prisma.assessmentInvite.findMany()
    * ```
    */
  get assessmentInvite(): Prisma.AssessmentInviteDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.attempt`: Exposes CRUD operations for the **Attempt** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Attempts
    * const attempts = await prisma.attempt.findMany()
    * ```
    */
  get attempt(): Prisma.AttemptDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.answer`: Exposes CRUD operations for the **Answer** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Answers
    * const answers = await prisma.answer.findMany()
    * ```
    */
  get answer(): Prisma.AnswerDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.proctorEvent`: Exposes CRUD operations for the **ProctorEvent** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ProctorEvents
    * const proctorEvents = await prisma.proctorEvent.findMany()
    * ```
    */
  get proctorEvent(): Prisma.ProctorEventDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.assessmentResult`: Exposes CRUD operations for the **AssessmentResult** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AssessmentResults
    * const assessmentResults = await prisma.assessmentResult.findMany()
    * ```
    */
  get assessmentResult(): Prisma.AssessmentResultDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.questionBank`: Exposes CRUD operations for the **QuestionBank** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more QuestionBanks
    * const questionBanks = await prisma.questionBank.findMany()
    * ```
    */
  get questionBank(): Prisma.QuestionBankDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.question`: Exposes CRUD operations for the **Question** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Questions
    * const questions = await prisma.question.findMany()
    * ```
    */
  get question(): Prisma.QuestionDelegate<ExtArgs, ClientOptions>;
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
    Assessment: 'Assessment',
    AssessmentInvite: 'AssessmentInvite',
    Attempt: 'Attempt',
    Answer: 'Answer',
    ProctorEvent: 'ProctorEvent',
    AssessmentResult: 'AssessmentResult',
    QuestionBank: 'QuestionBank',
    Question: 'Question'
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
      modelProps: "assessment" | "assessmentInvite" | "attempt" | "answer" | "proctorEvent" | "assessmentResult" | "questionBank" | "question"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Assessment: {
        payload: Prisma.$AssessmentPayload<ExtArgs>
        fields: Prisma.AssessmentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AssessmentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssessmentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AssessmentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssessmentPayload>
          }
          findFirst: {
            args: Prisma.AssessmentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssessmentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AssessmentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssessmentPayload>
          }
          findMany: {
            args: Prisma.AssessmentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssessmentPayload>[]
          }
          create: {
            args: Prisma.AssessmentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssessmentPayload>
          }
          createMany: {
            args: Prisma.AssessmentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AssessmentCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssessmentPayload>[]
          }
          delete: {
            args: Prisma.AssessmentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssessmentPayload>
          }
          update: {
            args: Prisma.AssessmentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssessmentPayload>
          }
          deleteMany: {
            args: Prisma.AssessmentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AssessmentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AssessmentUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssessmentPayload>[]
          }
          upsert: {
            args: Prisma.AssessmentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssessmentPayload>
          }
          aggregate: {
            args: Prisma.AssessmentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAssessment>
          }
          groupBy: {
            args: Prisma.AssessmentGroupByArgs<ExtArgs>
            result: $Utils.Optional<AssessmentGroupByOutputType>[]
          }
          count: {
            args: Prisma.AssessmentCountArgs<ExtArgs>
            result: $Utils.Optional<AssessmentCountAggregateOutputType> | number
          }
        }
      }
      AssessmentInvite: {
        payload: Prisma.$AssessmentInvitePayload<ExtArgs>
        fields: Prisma.AssessmentInviteFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AssessmentInviteFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssessmentInvitePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AssessmentInviteFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssessmentInvitePayload>
          }
          findFirst: {
            args: Prisma.AssessmentInviteFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssessmentInvitePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AssessmentInviteFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssessmentInvitePayload>
          }
          findMany: {
            args: Prisma.AssessmentInviteFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssessmentInvitePayload>[]
          }
          create: {
            args: Prisma.AssessmentInviteCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssessmentInvitePayload>
          }
          createMany: {
            args: Prisma.AssessmentInviteCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AssessmentInviteCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssessmentInvitePayload>[]
          }
          delete: {
            args: Prisma.AssessmentInviteDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssessmentInvitePayload>
          }
          update: {
            args: Prisma.AssessmentInviteUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssessmentInvitePayload>
          }
          deleteMany: {
            args: Prisma.AssessmentInviteDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AssessmentInviteUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AssessmentInviteUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssessmentInvitePayload>[]
          }
          upsert: {
            args: Prisma.AssessmentInviteUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssessmentInvitePayload>
          }
          aggregate: {
            args: Prisma.AssessmentInviteAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAssessmentInvite>
          }
          groupBy: {
            args: Prisma.AssessmentInviteGroupByArgs<ExtArgs>
            result: $Utils.Optional<AssessmentInviteGroupByOutputType>[]
          }
          count: {
            args: Prisma.AssessmentInviteCountArgs<ExtArgs>
            result: $Utils.Optional<AssessmentInviteCountAggregateOutputType> | number
          }
        }
      }
      Attempt: {
        payload: Prisma.$AttemptPayload<ExtArgs>
        fields: Prisma.AttemptFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AttemptFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttemptPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AttemptFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttemptPayload>
          }
          findFirst: {
            args: Prisma.AttemptFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttemptPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AttemptFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttemptPayload>
          }
          findMany: {
            args: Prisma.AttemptFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttemptPayload>[]
          }
          create: {
            args: Prisma.AttemptCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttemptPayload>
          }
          createMany: {
            args: Prisma.AttemptCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AttemptCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttemptPayload>[]
          }
          delete: {
            args: Prisma.AttemptDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttemptPayload>
          }
          update: {
            args: Prisma.AttemptUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttemptPayload>
          }
          deleteMany: {
            args: Prisma.AttemptDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AttemptUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AttemptUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttemptPayload>[]
          }
          upsert: {
            args: Prisma.AttemptUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttemptPayload>
          }
          aggregate: {
            args: Prisma.AttemptAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAttempt>
          }
          groupBy: {
            args: Prisma.AttemptGroupByArgs<ExtArgs>
            result: $Utils.Optional<AttemptGroupByOutputType>[]
          }
          count: {
            args: Prisma.AttemptCountArgs<ExtArgs>
            result: $Utils.Optional<AttemptCountAggregateOutputType> | number
          }
        }
      }
      Answer: {
        payload: Prisma.$AnswerPayload<ExtArgs>
        fields: Prisma.AnswerFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AnswerFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnswerPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AnswerFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnswerPayload>
          }
          findFirst: {
            args: Prisma.AnswerFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnswerPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AnswerFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnswerPayload>
          }
          findMany: {
            args: Prisma.AnswerFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnswerPayload>[]
          }
          create: {
            args: Prisma.AnswerCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnswerPayload>
          }
          createMany: {
            args: Prisma.AnswerCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AnswerCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnswerPayload>[]
          }
          delete: {
            args: Prisma.AnswerDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnswerPayload>
          }
          update: {
            args: Prisma.AnswerUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnswerPayload>
          }
          deleteMany: {
            args: Prisma.AnswerDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AnswerUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AnswerUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnswerPayload>[]
          }
          upsert: {
            args: Prisma.AnswerUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AnswerPayload>
          }
          aggregate: {
            args: Prisma.AnswerAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAnswer>
          }
          groupBy: {
            args: Prisma.AnswerGroupByArgs<ExtArgs>
            result: $Utils.Optional<AnswerGroupByOutputType>[]
          }
          count: {
            args: Prisma.AnswerCountArgs<ExtArgs>
            result: $Utils.Optional<AnswerCountAggregateOutputType> | number
          }
        }
      }
      ProctorEvent: {
        payload: Prisma.$ProctorEventPayload<ExtArgs>
        fields: Prisma.ProctorEventFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProctorEventFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProctorEventPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProctorEventFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProctorEventPayload>
          }
          findFirst: {
            args: Prisma.ProctorEventFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProctorEventPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProctorEventFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProctorEventPayload>
          }
          findMany: {
            args: Prisma.ProctorEventFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProctorEventPayload>[]
          }
          create: {
            args: Prisma.ProctorEventCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProctorEventPayload>
          }
          createMany: {
            args: Prisma.ProctorEventCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProctorEventCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProctorEventPayload>[]
          }
          delete: {
            args: Prisma.ProctorEventDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProctorEventPayload>
          }
          update: {
            args: Prisma.ProctorEventUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProctorEventPayload>
          }
          deleteMany: {
            args: Prisma.ProctorEventDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProctorEventUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ProctorEventUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProctorEventPayload>[]
          }
          upsert: {
            args: Prisma.ProctorEventUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProctorEventPayload>
          }
          aggregate: {
            args: Prisma.ProctorEventAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProctorEvent>
          }
          groupBy: {
            args: Prisma.ProctorEventGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProctorEventGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProctorEventCountArgs<ExtArgs>
            result: $Utils.Optional<ProctorEventCountAggregateOutputType> | number
          }
        }
      }
      AssessmentResult: {
        payload: Prisma.$AssessmentResultPayload<ExtArgs>
        fields: Prisma.AssessmentResultFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AssessmentResultFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssessmentResultPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AssessmentResultFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssessmentResultPayload>
          }
          findFirst: {
            args: Prisma.AssessmentResultFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssessmentResultPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AssessmentResultFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssessmentResultPayload>
          }
          findMany: {
            args: Prisma.AssessmentResultFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssessmentResultPayload>[]
          }
          create: {
            args: Prisma.AssessmentResultCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssessmentResultPayload>
          }
          createMany: {
            args: Prisma.AssessmentResultCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AssessmentResultCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssessmentResultPayload>[]
          }
          delete: {
            args: Prisma.AssessmentResultDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssessmentResultPayload>
          }
          update: {
            args: Prisma.AssessmentResultUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssessmentResultPayload>
          }
          deleteMany: {
            args: Prisma.AssessmentResultDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AssessmentResultUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AssessmentResultUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssessmentResultPayload>[]
          }
          upsert: {
            args: Prisma.AssessmentResultUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssessmentResultPayload>
          }
          aggregate: {
            args: Prisma.AssessmentResultAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAssessmentResult>
          }
          groupBy: {
            args: Prisma.AssessmentResultGroupByArgs<ExtArgs>
            result: $Utils.Optional<AssessmentResultGroupByOutputType>[]
          }
          count: {
            args: Prisma.AssessmentResultCountArgs<ExtArgs>
            result: $Utils.Optional<AssessmentResultCountAggregateOutputType> | number
          }
        }
      }
      QuestionBank: {
        payload: Prisma.$QuestionBankPayload<ExtArgs>
        fields: Prisma.QuestionBankFieldRefs
        operations: {
          findUnique: {
            args: Prisma.QuestionBankFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QuestionBankPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.QuestionBankFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QuestionBankPayload>
          }
          findFirst: {
            args: Prisma.QuestionBankFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QuestionBankPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.QuestionBankFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QuestionBankPayload>
          }
          findMany: {
            args: Prisma.QuestionBankFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QuestionBankPayload>[]
          }
          create: {
            args: Prisma.QuestionBankCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QuestionBankPayload>
          }
          createMany: {
            args: Prisma.QuestionBankCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.QuestionBankCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QuestionBankPayload>[]
          }
          delete: {
            args: Prisma.QuestionBankDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QuestionBankPayload>
          }
          update: {
            args: Prisma.QuestionBankUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QuestionBankPayload>
          }
          deleteMany: {
            args: Prisma.QuestionBankDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.QuestionBankUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.QuestionBankUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QuestionBankPayload>[]
          }
          upsert: {
            args: Prisma.QuestionBankUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QuestionBankPayload>
          }
          aggregate: {
            args: Prisma.QuestionBankAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateQuestionBank>
          }
          groupBy: {
            args: Prisma.QuestionBankGroupByArgs<ExtArgs>
            result: $Utils.Optional<QuestionBankGroupByOutputType>[]
          }
          count: {
            args: Prisma.QuestionBankCountArgs<ExtArgs>
            result: $Utils.Optional<QuestionBankCountAggregateOutputType> | number
          }
        }
      }
      Question: {
        payload: Prisma.$QuestionPayload<ExtArgs>
        fields: Prisma.QuestionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.QuestionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QuestionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.QuestionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QuestionPayload>
          }
          findFirst: {
            args: Prisma.QuestionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QuestionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.QuestionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QuestionPayload>
          }
          findMany: {
            args: Prisma.QuestionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QuestionPayload>[]
          }
          create: {
            args: Prisma.QuestionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QuestionPayload>
          }
          createMany: {
            args: Prisma.QuestionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.QuestionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QuestionPayload>[]
          }
          delete: {
            args: Prisma.QuestionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QuestionPayload>
          }
          update: {
            args: Prisma.QuestionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QuestionPayload>
          }
          deleteMany: {
            args: Prisma.QuestionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.QuestionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.QuestionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QuestionPayload>[]
          }
          upsert: {
            args: Prisma.QuestionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QuestionPayload>
          }
          aggregate: {
            args: Prisma.QuestionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateQuestion>
          }
          groupBy: {
            args: Prisma.QuestionGroupByArgs<ExtArgs>
            result: $Utils.Optional<QuestionGroupByOutputType>[]
          }
          count: {
            args: Prisma.QuestionCountArgs<ExtArgs>
            result: $Utils.Optional<QuestionCountAggregateOutputType> | number
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
    assessment?: AssessmentOmit
    assessmentInvite?: AssessmentInviteOmit
    attempt?: AttemptOmit
    answer?: AnswerOmit
    proctorEvent?: ProctorEventOmit
    assessmentResult?: AssessmentResultOmit
    questionBank?: QuestionBankOmit
    question?: QuestionOmit
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
   * Count Type AssessmentCountOutputType
   */

  export type AssessmentCountOutputType = {
    invites: number
    attempts: number
    results: number
  }

  export type AssessmentCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    invites?: boolean | AssessmentCountOutputTypeCountInvitesArgs
    attempts?: boolean | AssessmentCountOutputTypeCountAttemptsArgs
    results?: boolean | AssessmentCountOutputTypeCountResultsArgs
  }

  // Custom InputTypes
  /**
   * AssessmentCountOutputType without action
   */
  export type AssessmentCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssessmentCountOutputType
     */
    select?: AssessmentCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * AssessmentCountOutputType without action
   */
  export type AssessmentCountOutputTypeCountInvitesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AssessmentInviteWhereInput
  }

  /**
   * AssessmentCountOutputType without action
   */
  export type AssessmentCountOutputTypeCountAttemptsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AttemptWhereInput
  }

  /**
   * AssessmentCountOutputType without action
   */
  export type AssessmentCountOutputTypeCountResultsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AssessmentResultWhereInput
  }


  /**
   * Count Type AttemptCountOutputType
   */

  export type AttemptCountOutputType = {
    answers: number
    proctorEvents: number
  }

  export type AttemptCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    answers?: boolean | AttemptCountOutputTypeCountAnswersArgs
    proctorEvents?: boolean | AttemptCountOutputTypeCountProctorEventsArgs
  }

  // Custom InputTypes
  /**
   * AttemptCountOutputType without action
   */
  export type AttemptCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AttemptCountOutputType
     */
    select?: AttemptCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * AttemptCountOutputType without action
   */
  export type AttemptCountOutputTypeCountAnswersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AnswerWhereInput
  }

  /**
   * AttemptCountOutputType without action
   */
  export type AttemptCountOutputTypeCountProctorEventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProctorEventWhereInput
  }


  /**
   * Count Type QuestionBankCountOutputType
   */

  export type QuestionBankCountOutputType = {
    questions: number
  }

  export type QuestionBankCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    questions?: boolean | QuestionBankCountOutputTypeCountQuestionsArgs
  }

  // Custom InputTypes
  /**
   * QuestionBankCountOutputType without action
   */
  export type QuestionBankCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QuestionBankCountOutputType
     */
    select?: QuestionBankCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * QuestionBankCountOutputType without action
   */
  export type QuestionBankCountOutputTypeCountQuestionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: QuestionWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Assessment
   */

  export type AggregateAssessment = {
    _count: AssessmentCountAggregateOutputType | null
    _avg: AssessmentAvgAggregateOutputType | null
    _sum: AssessmentSumAggregateOutputType | null
    _min: AssessmentMinAggregateOutputType | null
    _max: AssessmentMaxAggregateOutputType | null
  }

  export type AssessmentAvgAggregateOutputType = {
    durationMinutes: number | null
    passingScore: number | null
    version: number | null
  }

  export type AssessmentSumAggregateOutputType = {
    durationMinutes: number | null
    passingScore: number | null
    version: number | null
  }

  export type AssessmentMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    requisitionId: string | null
    questionBankId: string | null
    title: string | null
    description: string | null
    status: $Enums.AssessmentStatus | null
    durationMinutes: number | null
    passingScore: number | null
    shuffleQuestions: boolean | null
    version: number | null
    publishedHash: string | null
    publishedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AssessmentMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    requisitionId: string | null
    questionBankId: string | null
    title: string | null
    description: string | null
    status: $Enums.AssessmentStatus | null
    durationMinutes: number | null
    passingScore: number | null
    shuffleQuestions: boolean | null
    version: number | null
    publishedHash: string | null
    publishedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AssessmentCountAggregateOutputType = {
    id: number
    tenantId: number
    requisitionId: number
    questionBankId: number
    title: number
    description: number
    status: number
    durationMinutes: number
    passingScore: number
    shuffleQuestions: number
    questions: number
    schemaJson: number
    version: number
    publishedHash: number
    publishedAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type AssessmentAvgAggregateInputType = {
    durationMinutes?: true
    passingScore?: true
    version?: true
  }

  export type AssessmentSumAggregateInputType = {
    durationMinutes?: true
    passingScore?: true
    version?: true
  }

  export type AssessmentMinAggregateInputType = {
    id?: true
    tenantId?: true
    requisitionId?: true
    questionBankId?: true
    title?: true
    description?: true
    status?: true
    durationMinutes?: true
    passingScore?: true
    shuffleQuestions?: true
    version?: true
    publishedHash?: true
    publishedAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AssessmentMaxAggregateInputType = {
    id?: true
    tenantId?: true
    requisitionId?: true
    questionBankId?: true
    title?: true
    description?: true
    status?: true
    durationMinutes?: true
    passingScore?: true
    shuffleQuestions?: true
    version?: true
    publishedHash?: true
    publishedAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AssessmentCountAggregateInputType = {
    id?: true
    tenantId?: true
    requisitionId?: true
    questionBankId?: true
    title?: true
    description?: true
    status?: true
    durationMinutes?: true
    passingScore?: true
    shuffleQuestions?: true
    questions?: true
    schemaJson?: true
    version?: true
    publishedHash?: true
    publishedAt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type AssessmentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Assessment to aggregate.
     */
    where?: AssessmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Assessments to fetch.
     */
    orderBy?: AssessmentOrderByWithRelationInput | AssessmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AssessmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Assessments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Assessments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Assessments
    **/
    _count?: true | AssessmentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AssessmentAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AssessmentSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AssessmentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AssessmentMaxAggregateInputType
  }

  export type GetAssessmentAggregateType<T extends AssessmentAggregateArgs> = {
        [P in keyof T & keyof AggregateAssessment]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAssessment[P]>
      : GetScalarType<T[P], AggregateAssessment[P]>
  }




  export type AssessmentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AssessmentWhereInput
    orderBy?: AssessmentOrderByWithAggregationInput | AssessmentOrderByWithAggregationInput[]
    by: AssessmentScalarFieldEnum[] | AssessmentScalarFieldEnum
    having?: AssessmentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AssessmentCountAggregateInputType | true
    _avg?: AssessmentAvgAggregateInputType
    _sum?: AssessmentSumAggregateInputType
    _min?: AssessmentMinAggregateInputType
    _max?: AssessmentMaxAggregateInputType
  }

  export type AssessmentGroupByOutputType = {
    id: string
    tenantId: string
    requisitionId: string | null
    questionBankId: string | null
    title: string
    description: string | null
    status: $Enums.AssessmentStatus
    durationMinutes: number | null
    passingScore: number | null
    shuffleQuestions: boolean
    questions: JsonValue
    schemaJson: JsonValue
    version: number
    publishedHash: string | null
    publishedAt: Date | null
    createdAt: Date
    updatedAt: Date
    _count: AssessmentCountAggregateOutputType | null
    _avg: AssessmentAvgAggregateOutputType | null
    _sum: AssessmentSumAggregateOutputType | null
    _min: AssessmentMinAggregateOutputType | null
    _max: AssessmentMaxAggregateOutputType | null
  }

  type GetAssessmentGroupByPayload<T extends AssessmentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AssessmentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AssessmentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AssessmentGroupByOutputType[P]>
            : GetScalarType<T[P], AssessmentGroupByOutputType[P]>
        }
      >
    >


  export type AssessmentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    requisitionId?: boolean
    questionBankId?: boolean
    title?: boolean
    description?: boolean
    status?: boolean
    durationMinutes?: boolean
    passingScore?: boolean
    shuffleQuestions?: boolean
    questions?: boolean
    schemaJson?: boolean
    version?: boolean
    publishedHash?: boolean
    publishedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    invites?: boolean | Assessment$invitesArgs<ExtArgs>
    attempts?: boolean | Assessment$attemptsArgs<ExtArgs>
    results?: boolean | Assessment$resultsArgs<ExtArgs>
    _count?: boolean | AssessmentCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["assessment"]>

  export type AssessmentSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    requisitionId?: boolean
    questionBankId?: boolean
    title?: boolean
    description?: boolean
    status?: boolean
    durationMinutes?: boolean
    passingScore?: boolean
    shuffleQuestions?: boolean
    questions?: boolean
    schemaJson?: boolean
    version?: boolean
    publishedHash?: boolean
    publishedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["assessment"]>

  export type AssessmentSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    requisitionId?: boolean
    questionBankId?: boolean
    title?: boolean
    description?: boolean
    status?: boolean
    durationMinutes?: boolean
    passingScore?: boolean
    shuffleQuestions?: boolean
    questions?: boolean
    schemaJson?: boolean
    version?: boolean
    publishedHash?: boolean
    publishedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["assessment"]>

  export type AssessmentSelectScalar = {
    id?: boolean
    tenantId?: boolean
    requisitionId?: boolean
    questionBankId?: boolean
    title?: boolean
    description?: boolean
    status?: boolean
    durationMinutes?: boolean
    passingScore?: boolean
    shuffleQuestions?: boolean
    questions?: boolean
    schemaJson?: boolean
    version?: boolean
    publishedHash?: boolean
    publishedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type AssessmentOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "requisitionId" | "questionBankId" | "title" | "description" | "status" | "durationMinutes" | "passingScore" | "shuffleQuestions" | "questions" | "schemaJson" | "version" | "publishedHash" | "publishedAt" | "createdAt" | "updatedAt", ExtArgs["result"]["assessment"]>
  export type AssessmentInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    invites?: boolean | Assessment$invitesArgs<ExtArgs>
    attempts?: boolean | Assessment$attemptsArgs<ExtArgs>
    results?: boolean | Assessment$resultsArgs<ExtArgs>
    _count?: boolean | AssessmentCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type AssessmentIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type AssessmentIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $AssessmentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Assessment"
    objects: {
      invites: Prisma.$AssessmentInvitePayload<ExtArgs>[]
      attempts: Prisma.$AttemptPayload<ExtArgs>[]
      results: Prisma.$AssessmentResultPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      requisitionId: string | null
      questionBankId: string | null
      title: string
      description: string | null
      status: $Enums.AssessmentStatus
      durationMinutes: number | null
      passingScore: number | null
      shuffleQuestions: boolean
      questions: Prisma.JsonValue
      schemaJson: Prisma.JsonValue
      version: number
      publishedHash: string | null
      publishedAt: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["assessment"]>
    composites: {}
  }

  type AssessmentGetPayload<S extends boolean | null | undefined | AssessmentDefaultArgs> = $Result.GetResult<Prisma.$AssessmentPayload, S>

  type AssessmentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AssessmentFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AssessmentCountAggregateInputType | true
    }

  export interface AssessmentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Assessment'], meta: { name: 'Assessment' } }
    /**
     * Find zero or one Assessment that matches the filter.
     * @param {AssessmentFindUniqueArgs} args - Arguments to find a Assessment
     * @example
     * // Get one Assessment
     * const assessment = await prisma.assessment.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AssessmentFindUniqueArgs>(args: SelectSubset<T, AssessmentFindUniqueArgs<ExtArgs>>): Prisma__AssessmentClient<$Result.GetResult<Prisma.$AssessmentPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Assessment that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AssessmentFindUniqueOrThrowArgs} args - Arguments to find a Assessment
     * @example
     * // Get one Assessment
     * const assessment = await prisma.assessment.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AssessmentFindUniqueOrThrowArgs>(args: SelectSubset<T, AssessmentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AssessmentClient<$Result.GetResult<Prisma.$AssessmentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Assessment that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssessmentFindFirstArgs} args - Arguments to find a Assessment
     * @example
     * // Get one Assessment
     * const assessment = await prisma.assessment.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AssessmentFindFirstArgs>(args?: SelectSubset<T, AssessmentFindFirstArgs<ExtArgs>>): Prisma__AssessmentClient<$Result.GetResult<Prisma.$AssessmentPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Assessment that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssessmentFindFirstOrThrowArgs} args - Arguments to find a Assessment
     * @example
     * // Get one Assessment
     * const assessment = await prisma.assessment.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AssessmentFindFirstOrThrowArgs>(args?: SelectSubset<T, AssessmentFindFirstOrThrowArgs<ExtArgs>>): Prisma__AssessmentClient<$Result.GetResult<Prisma.$AssessmentPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Assessments that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssessmentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Assessments
     * const assessments = await prisma.assessment.findMany()
     * 
     * // Get first 10 Assessments
     * const assessments = await prisma.assessment.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const assessmentWithIdOnly = await prisma.assessment.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AssessmentFindManyArgs>(args?: SelectSubset<T, AssessmentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AssessmentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Assessment.
     * @param {AssessmentCreateArgs} args - Arguments to create a Assessment.
     * @example
     * // Create one Assessment
     * const Assessment = await prisma.assessment.create({
     *   data: {
     *     // ... data to create a Assessment
     *   }
     * })
     * 
     */
    create<T extends AssessmentCreateArgs>(args: SelectSubset<T, AssessmentCreateArgs<ExtArgs>>): Prisma__AssessmentClient<$Result.GetResult<Prisma.$AssessmentPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Assessments.
     * @param {AssessmentCreateManyArgs} args - Arguments to create many Assessments.
     * @example
     * // Create many Assessments
     * const assessment = await prisma.assessment.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AssessmentCreateManyArgs>(args?: SelectSubset<T, AssessmentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Assessments and returns the data saved in the database.
     * @param {AssessmentCreateManyAndReturnArgs} args - Arguments to create many Assessments.
     * @example
     * // Create many Assessments
     * const assessment = await prisma.assessment.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Assessments and only return the `id`
     * const assessmentWithIdOnly = await prisma.assessment.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AssessmentCreateManyAndReturnArgs>(args?: SelectSubset<T, AssessmentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AssessmentPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Assessment.
     * @param {AssessmentDeleteArgs} args - Arguments to delete one Assessment.
     * @example
     * // Delete one Assessment
     * const Assessment = await prisma.assessment.delete({
     *   where: {
     *     // ... filter to delete one Assessment
     *   }
     * })
     * 
     */
    delete<T extends AssessmentDeleteArgs>(args: SelectSubset<T, AssessmentDeleteArgs<ExtArgs>>): Prisma__AssessmentClient<$Result.GetResult<Prisma.$AssessmentPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Assessment.
     * @param {AssessmentUpdateArgs} args - Arguments to update one Assessment.
     * @example
     * // Update one Assessment
     * const assessment = await prisma.assessment.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AssessmentUpdateArgs>(args: SelectSubset<T, AssessmentUpdateArgs<ExtArgs>>): Prisma__AssessmentClient<$Result.GetResult<Prisma.$AssessmentPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Assessments.
     * @param {AssessmentDeleteManyArgs} args - Arguments to filter Assessments to delete.
     * @example
     * // Delete a few Assessments
     * const { count } = await prisma.assessment.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AssessmentDeleteManyArgs>(args?: SelectSubset<T, AssessmentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Assessments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssessmentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Assessments
     * const assessment = await prisma.assessment.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AssessmentUpdateManyArgs>(args: SelectSubset<T, AssessmentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Assessments and returns the data updated in the database.
     * @param {AssessmentUpdateManyAndReturnArgs} args - Arguments to update many Assessments.
     * @example
     * // Update many Assessments
     * const assessment = await prisma.assessment.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Assessments and only return the `id`
     * const assessmentWithIdOnly = await prisma.assessment.updateManyAndReturn({
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
    updateManyAndReturn<T extends AssessmentUpdateManyAndReturnArgs>(args: SelectSubset<T, AssessmentUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AssessmentPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Assessment.
     * @param {AssessmentUpsertArgs} args - Arguments to update or create a Assessment.
     * @example
     * // Update or create a Assessment
     * const assessment = await prisma.assessment.upsert({
     *   create: {
     *     // ... data to create a Assessment
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Assessment we want to update
     *   }
     * })
     */
    upsert<T extends AssessmentUpsertArgs>(args: SelectSubset<T, AssessmentUpsertArgs<ExtArgs>>): Prisma__AssessmentClient<$Result.GetResult<Prisma.$AssessmentPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Assessments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssessmentCountArgs} args - Arguments to filter Assessments to count.
     * @example
     * // Count the number of Assessments
     * const count = await prisma.assessment.count({
     *   where: {
     *     // ... the filter for the Assessments we want to count
     *   }
     * })
    **/
    count<T extends AssessmentCountArgs>(
      args?: Subset<T, AssessmentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AssessmentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Assessment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssessmentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends AssessmentAggregateArgs>(args: Subset<T, AssessmentAggregateArgs>): Prisma.PrismaPromise<GetAssessmentAggregateType<T>>

    /**
     * Group by Assessment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssessmentGroupByArgs} args - Group by arguments.
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
      T extends AssessmentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AssessmentGroupByArgs['orderBy'] }
        : { orderBy?: AssessmentGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, AssessmentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAssessmentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Assessment model
   */
  readonly fields: AssessmentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Assessment.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AssessmentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    invites<T extends Assessment$invitesArgs<ExtArgs> = {}>(args?: Subset<T, Assessment$invitesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AssessmentInvitePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    attempts<T extends Assessment$attemptsArgs<ExtArgs> = {}>(args?: Subset<T, Assessment$attemptsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AttemptPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    results<T extends Assessment$resultsArgs<ExtArgs> = {}>(args?: Subset<T, Assessment$resultsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AssessmentResultPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the Assessment model
   */
  interface AssessmentFieldRefs {
    readonly id: FieldRef<"Assessment", 'String'>
    readonly tenantId: FieldRef<"Assessment", 'String'>
    readonly requisitionId: FieldRef<"Assessment", 'String'>
    readonly questionBankId: FieldRef<"Assessment", 'String'>
    readonly title: FieldRef<"Assessment", 'String'>
    readonly description: FieldRef<"Assessment", 'String'>
    readonly status: FieldRef<"Assessment", 'AssessmentStatus'>
    readonly durationMinutes: FieldRef<"Assessment", 'Int'>
    readonly passingScore: FieldRef<"Assessment", 'Int'>
    readonly shuffleQuestions: FieldRef<"Assessment", 'Boolean'>
    readonly questions: FieldRef<"Assessment", 'Json'>
    readonly schemaJson: FieldRef<"Assessment", 'Json'>
    readonly version: FieldRef<"Assessment", 'Int'>
    readonly publishedHash: FieldRef<"Assessment", 'String'>
    readonly publishedAt: FieldRef<"Assessment", 'DateTime'>
    readonly createdAt: FieldRef<"Assessment", 'DateTime'>
    readonly updatedAt: FieldRef<"Assessment", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Assessment findUnique
   */
  export type AssessmentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Assessment
     */
    select?: AssessmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Assessment
     */
    omit?: AssessmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssessmentInclude<ExtArgs> | null
    /**
     * Filter, which Assessment to fetch.
     */
    where: AssessmentWhereUniqueInput
  }

  /**
   * Assessment findUniqueOrThrow
   */
  export type AssessmentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Assessment
     */
    select?: AssessmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Assessment
     */
    omit?: AssessmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssessmentInclude<ExtArgs> | null
    /**
     * Filter, which Assessment to fetch.
     */
    where: AssessmentWhereUniqueInput
  }

  /**
   * Assessment findFirst
   */
  export type AssessmentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Assessment
     */
    select?: AssessmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Assessment
     */
    omit?: AssessmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssessmentInclude<ExtArgs> | null
    /**
     * Filter, which Assessment to fetch.
     */
    where?: AssessmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Assessments to fetch.
     */
    orderBy?: AssessmentOrderByWithRelationInput | AssessmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Assessments.
     */
    cursor?: AssessmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Assessments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Assessments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Assessments.
     */
    distinct?: AssessmentScalarFieldEnum | AssessmentScalarFieldEnum[]
  }

  /**
   * Assessment findFirstOrThrow
   */
  export type AssessmentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Assessment
     */
    select?: AssessmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Assessment
     */
    omit?: AssessmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssessmentInclude<ExtArgs> | null
    /**
     * Filter, which Assessment to fetch.
     */
    where?: AssessmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Assessments to fetch.
     */
    orderBy?: AssessmentOrderByWithRelationInput | AssessmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Assessments.
     */
    cursor?: AssessmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Assessments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Assessments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Assessments.
     */
    distinct?: AssessmentScalarFieldEnum | AssessmentScalarFieldEnum[]
  }

  /**
   * Assessment findMany
   */
  export type AssessmentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Assessment
     */
    select?: AssessmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Assessment
     */
    omit?: AssessmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssessmentInclude<ExtArgs> | null
    /**
     * Filter, which Assessments to fetch.
     */
    where?: AssessmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Assessments to fetch.
     */
    orderBy?: AssessmentOrderByWithRelationInput | AssessmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Assessments.
     */
    cursor?: AssessmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Assessments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Assessments.
     */
    skip?: number
    distinct?: AssessmentScalarFieldEnum | AssessmentScalarFieldEnum[]
  }

  /**
   * Assessment create
   */
  export type AssessmentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Assessment
     */
    select?: AssessmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Assessment
     */
    omit?: AssessmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssessmentInclude<ExtArgs> | null
    /**
     * The data needed to create a Assessment.
     */
    data: XOR<AssessmentCreateInput, AssessmentUncheckedCreateInput>
  }

  /**
   * Assessment createMany
   */
  export type AssessmentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Assessments.
     */
    data: AssessmentCreateManyInput | AssessmentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Assessment createManyAndReturn
   */
  export type AssessmentCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Assessment
     */
    select?: AssessmentSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Assessment
     */
    omit?: AssessmentOmit<ExtArgs> | null
    /**
     * The data used to create many Assessments.
     */
    data: AssessmentCreateManyInput | AssessmentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Assessment update
   */
  export type AssessmentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Assessment
     */
    select?: AssessmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Assessment
     */
    omit?: AssessmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssessmentInclude<ExtArgs> | null
    /**
     * The data needed to update a Assessment.
     */
    data: XOR<AssessmentUpdateInput, AssessmentUncheckedUpdateInput>
    /**
     * Choose, which Assessment to update.
     */
    where: AssessmentWhereUniqueInput
  }

  /**
   * Assessment updateMany
   */
  export type AssessmentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Assessments.
     */
    data: XOR<AssessmentUpdateManyMutationInput, AssessmentUncheckedUpdateManyInput>
    /**
     * Filter which Assessments to update
     */
    where?: AssessmentWhereInput
    /**
     * Limit how many Assessments to update.
     */
    limit?: number
  }

  /**
   * Assessment updateManyAndReturn
   */
  export type AssessmentUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Assessment
     */
    select?: AssessmentSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Assessment
     */
    omit?: AssessmentOmit<ExtArgs> | null
    /**
     * The data used to update Assessments.
     */
    data: XOR<AssessmentUpdateManyMutationInput, AssessmentUncheckedUpdateManyInput>
    /**
     * Filter which Assessments to update
     */
    where?: AssessmentWhereInput
    /**
     * Limit how many Assessments to update.
     */
    limit?: number
  }

  /**
   * Assessment upsert
   */
  export type AssessmentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Assessment
     */
    select?: AssessmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Assessment
     */
    omit?: AssessmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssessmentInclude<ExtArgs> | null
    /**
     * The filter to search for the Assessment to update in case it exists.
     */
    where: AssessmentWhereUniqueInput
    /**
     * In case the Assessment found by the `where` argument doesn't exist, create a new Assessment with this data.
     */
    create: XOR<AssessmentCreateInput, AssessmentUncheckedCreateInput>
    /**
     * In case the Assessment was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AssessmentUpdateInput, AssessmentUncheckedUpdateInput>
  }

  /**
   * Assessment delete
   */
  export type AssessmentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Assessment
     */
    select?: AssessmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Assessment
     */
    omit?: AssessmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssessmentInclude<ExtArgs> | null
    /**
     * Filter which Assessment to delete.
     */
    where: AssessmentWhereUniqueInput
  }

  /**
   * Assessment deleteMany
   */
  export type AssessmentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Assessments to delete
     */
    where?: AssessmentWhereInput
    /**
     * Limit how many Assessments to delete.
     */
    limit?: number
  }

  /**
   * Assessment.invites
   */
  export type Assessment$invitesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssessmentInvite
     */
    select?: AssessmentInviteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AssessmentInvite
     */
    omit?: AssessmentInviteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssessmentInviteInclude<ExtArgs> | null
    where?: AssessmentInviteWhereInput
    orderBy?: AssessmentInviteOrderByWithRelationInput | AssessmentInviteOrderByWithRelationInput[]
    cursor?: AssessmentInviteWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AssessmentInviteScalarFieldEnum | AssessmentInviteScalarFieldEnum[]
  }

  /**
   * Assessment.attempts
   */
  export type Assessment$attemptsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attempt
     */
    select?: AttemptSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attempt
     */
    omit?: AttemptOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttemptInclude<ExtArgs> | null
    where?: AttemptWhereInput
    orderBy?: AttemptOrderByWithRelationInput | AttemptOrderByWithRelationInput[]
    cursor?: AttemptWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AttemptScalarFieldEnum | AttemptScalarFieldEnum[]
  }

  /**
   * Assessment.results
   */
  export type Assessment$resultsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssessmentResult
     */
    select?: AssessmentResultSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AssessmentResult
     */
    omit?: AssessmentResultOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssessmentResultInclude<ExtArgs> | null
    where?: AssessmentResultWhereInput
    orderBy?: AssessmentResultOrderByWithRelationInput | AssessmentResultOrderByWithRelationInput[]
    cursor?: AssessmentResultWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AssessmentResultScalarFieldEnum | AssessmentResultScalarFieldEnum[]
  }

  /**
   * Assessment without action
   */
  export type AssessmentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Assessment
     */
    select?: AssessmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Assessment
     */
    omit?: AssessmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssessmentInclude<ExtArgs> | null
  }


  /**
   * Model AssessmentInvite
   */

  export type AggregateAssessmentInvite = {
    _count: AssessmentInviteCountAggregateOutputType | null
    _min: AssessmentInviteMinAggregateOutputType | null
    _max: AssessmentInviteMaxAggregateOutputType | null
  }

  export type AssessmentInviteMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    assessmentId: string | null
    candidateId: string | null
    applicationId: string | null
    tokenHash: string | null
    provider: string | null
    providerInvitationId: string | null
    providerSecret: string | null
    email: string | null
    status: $Enums.AssessmentInviteStatus | null
    expiresAt: Date | null
    sentAt: Date | null
    openedAt: Date | null
    startedAt: Date | null
    submittedAt: Date | null
    consumedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AssessmentInviteMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    assessmentId: string | null
    candidateId: string | null
    applicationId: string | null
    tokenHash: string | null
    provider: string | null
    providerInvitationId: string | null
    providerSecret: string | null
    email: string | null
    status: $Enums.AssessmentInviteStatus | null
    expiresAt: Date | null
    sentAt: Date | null
    openedAt: Date | null
    startedAt: Date | null
    submittedAt: Date | null
    consumedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AssessmentInviteCountAggregateOutputType = {
    id: number
    tenantId: number
    assessmentId: number
    candidateId: number
    applicationId: number
    tokenHash: number
    provider: number
    providerInvitationId: number
    providerSecret: number
    email: number
    status: number
    expiresAt: number
    sentAt: number
    openedAt: number
    startedAt: number
    submittedAt: number
    consumedAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type AssessmentInviteMinAggregateInputType = {
    id?: true
    tenantId?: true
    assessmentId?: true
    candidateId?: true
    applicationId?: true
    tokenHash?: true
    provider?: true
    providerInvitationId?: true
    providerSecret?: true
    email?: true
    status?: true
    expiresAt?: true
    sentAt?: true
    openedAt?: true
    startedAt?: true
    submittedAt?: true
    consumedAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AssessmentInviteMaxAggregateInputType = {
    id?: true
    tenantId?: true
    assessmentId?: true
    candidateId?: true
    applicationId?: true
    tokenHash?: true
    provider?: true
    providerInvitationId?: true
    providerSecret?: true
    email?: true
    status?: true
    expiresAt?: true
    sentAt?: true
    openedAt?: true
    startedAt?: true
    submittedAt?: true
    consumedAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AssessmentInviteCountAggregateInputType = {
    id?: true
    tenantId?: true
    assessmentId?: true
    candidateId?: true
    applicationId?: true
    tokenHash?: true
    provider?: true
    providerInvitationId?: true
    providerSecret?: true
    email?: true
    status?: true
    expiresAt?: true
    sentAt?: true
    openedAt?: true
    startedAt?: true
    submittedAt?: true
    consumedAt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type AssessmentInviteAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AssessmentInvite to aggregate.
     */
    where?: AssessmentInviteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AssessmentInvites to fetch.
     */
    orderBy?: AssessmentInviteOrderByWithRelationInput | AssessmentInviteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AssessmentInviteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AssessmentInvites from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AssessmentInvites.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AssessmentInvites
    **/
    _count?: true | AssessmentInviteCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AssessmentInviteMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AssessmentInviteMaxAggregateInputType
  }

  export type GetAssessmentInviteAggregateType<T extends AssessmentInviteAggregateArgs> = {
        [P in keyof T & keyof AggregateAssessmentInvite]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAssessmentInvite[P]>
      : GetScalarType<T[P], AggregateAssessmentInvite[P]>
  }




  export type AssessmentInviteGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AssessmentInviteWhereInput
    orderBy?: AssessmentInviteOrderByWithAggregationInput | AssessmentInviteOrderByWithAggregationInput[]
    by: AssessmentInviteScalarFieldEnum[] | AssessmentInviteScalarFieldEnum
    having?: AssessmentInviteScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AssessmentInviteCountAggregateInputType | true
    _min?: AssessmentInviteMinAggregateInputType
    _max?: AssessmentInviteMaxAggregateInputType
  }

  export type AssessmentInviteGroupByOutputType = {
    id: string
    tenantId: string
    assessmentId: string
    candidateId: string
    applicationId: string | null
    tokenHash: string
    provider: string | null
    providerInvitationId: string | null
    providerSecret: string | null
    email: string
    status: $Enums.AssessmentInviteStatus
    expiresAt: Date | null
    sentAt: Date | null
    openedAt: Date | null
    startedAt: Date | null
    submittedAt: Date | null
    consumedAt: Date | null
    createdAt: Date
    updatedAt: Date
    _count: AssessmentInviteCountAggregateOutputType | null
    _min: AssessmentInviteMinAggregateOutputType | null
    _max: AssessmentInviteMaxAggregateOutputType | null
  }

  type GetAssessmentInviteGroupByPayload<T extends AssessmentInviteGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AssessmentInviteGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AssessmentInviteGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AssessmentInviteGroupByOutputType[P]>
            : GetScalarType<T[P], AssessmentInviteGroupByOutputType[P]>
        }
      >
    >


  export type AssessmentInviteSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    assessmentId?: boolean
    candidateId?: boolean
    applicationId?: boolean
    tokenHash?: boolean
    provider?: boolean
    providerInvitationId?: boolean
    providerSecret?: boolean
    email?: boolean
    status?: boolean
    expiresAt?: boolean
    sentAt?: boolean
    openedAt?: boolean
    startedAt?: boolean
    submittedAt?: boolean
    consumedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    assessment?: boolean | AssessmentDefaultArgs<ExtArgs>
    attempt?: boolean | AssessmentInvite$attemptArgs<ExtArgs>
  }, ExtArgs["result"]["assessmentInvite"]>

  export type AssessmentInviteSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    assessmentId?: boolean
    candidateId?: boolean
    applicationId?: boolean
    tokenHash?: boolean
    provider?: boolean
    providerInvitationId?: boolean
    providerSecret?: boolean
    email?: boolean
    status?: boolean
    expiresAt?: boolean
    sentAt?: boolean
    openedAt?: boolean
    startedAt?: boolean
    submittedAt?: boolean
    consumedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    assessment?: boolean | AssessmentDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["assessmentInvite"]>

  export type AssessmentInviteSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    assessmentId?: boolean
    candidateId?: boolean
    applicationId?: boolean
    tokenHash?: boolean
    provider?: boolean
    providerInvitationId?: boolean
    providerSecret?: boolean
    email?: boolean
    status?: boolean
    expiresAt?: boolean
    sentAt?: boolean
    openedAt?: boolean
    startedAt?: boolean
    submittedAt?: boolean
    consumedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    assessment?: boolean | AssessmentDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["assessmentInvite"]>

  export type AssessmentInviteSelectScalar = {
    id?: boolean
    tenantId?: boolean
    assessmentId?: boolean
    candidateId?: boolean
    applicationId?: boolean
    tokenHash?: boolean
    provider?: boolean
    providerInvitationId?: boolean
    providerSecret?: boolean
    email?: boolean
    status?: boolean
    expiresAt?: boolean
    sentAt?: boolean
    openedAt?: boolean
    startedAt?: boolean
    submittedAt?: boolean
    consumedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type AssessmentInviteOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "assessmentId" | "candidateId" | "applicationId" | "tokenHash" | "provider" | "providerInvitationId" | "providerSecret" | "email" | "status" | "expiresAt" | "sentAt" | "openedAt" | "startedAt" | "submittedAt" | "consumedAt" | "createdAt" | "updatedAt", ExtArgs["result"]["assessmentInvite"]>
  export type AssessmentInviteInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    assessment?: boolean | AssessmentDefaultArgs<ExtArgs>
    attempt?: boolean | AssessmentInvite$attemptArgs<ExtArgs>
  }
  export type AssessmentInviteIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    assessment?: boolean | AssessmentDefaultArgs<ExtArgs>
  }
  export type AssessmentInviteIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    assessment?: boolean | AssessmentDefaultArgs<ExtArgs>
  }

  export type $AssessmentInvitePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AssessmentInvite"
    objects: {
      assessment: Prisma.$AssessmentPayload<ExtArgs>
      attempt: Prisma.$AttemptPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      assessmentId: string
      candidateId: string
      applicationId: string | null
      tokenHash: string
      provider: string | null
      providerInvitationId: string | null
      providerSecret: string | null
      email: string
      status: $Enums.AssessmentInviteStatus
      expiresAt: Date | null
      sentAt: Date | null
      openedAt: Date | null
      startedAt: Date | null
      submittedAt: Date | null
      consumedAt: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["assessmentInvite"]>
    composites: {}
  }

  type AssessmentInviteGetPayload<S extends boolean | null | undefined | AssessmentInviteDefaultArgs> = $Result.GetResult<Prisma.$AssessmentInvitePayload, S>

  type AssessmentInviteCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AssessmentInviteFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AssessmentInviteCountAggregateInputType | true
    }

  export interface AssessmentInviteDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AssessmentInvite'], meta: { name: 'AssessmentInvite' } }
    /**
     * Find zero or one AssessmentInvite that matches the filter.
     * @param {AssessmentInviteFindUniqueArgs} args - Arguments to find a AssessmentInvite
     * @example
     * // Get one AssessmentInvite
     * const assessmentInvite = await prisma.assessmentInvite.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AssessmentInviteFindUniqueArgs>(args: SelectSubset<T, AssessmentInviteFindUniqueArgs<ExtArgs>>): Prisma__AssessmentInviteClient<$Result.GetResult<Prisma.$AssessmentInvitePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AssessmentInvite that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AssessmentInviteFindUniqueOrThrowArgs} args - Arguments to find a AssessmentInvite
     * @example
     * // Get one AssessmentInvite
     * const assessmentInvite = await prisma.assessmentInvite.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AssessmentInviteFindUniqueOrThrowArgs>(args: SelectSubset<T, AssessmentInviteFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AssessmentInviteClient<$Result.GetResult<Prisma.$AssessmentInvitePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AssessmentInvite that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssessmentInviteFindFirstArgs} args - Arguments to find a AssessmentInvite
     * @example
     * // Get one AssessmentInvite
     * const assessmentInvite = await prisma.assessmentInvite.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AssessmentInviteFindFirstArgs>(args?: SelectSubset<T, AssessmentInviteFindFirstArgs<ExtArgs>>): Prisma__AssessmentInviteClient<$Result.GetResult<Prisma.$AssessmentInvitePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AssessmentInvite that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssessmentInviteFindFirstOrThrowArgs} args - Arguments to find a AssessmentInvite
     * @example
     * // Get one AssessmentInvite
     * const assessmentInvite = await prisma.assessmentInvite.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AssessmentInviteFindFirstOrThrowArgs>(args?: SelectSubset<T, AssessmentInviteFindFirstOrThrowArgs<ExtArgs>>): Prisma__AssessmentInviteClient<$Result.GetResult<Prisma.$AssessmentInvitePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AssessmentInvites that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssessmentInviteFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AssessmentInvites
     * const assessmentInvites = await prisma.assessmentInvite.findMany()
     * 
     * // Get first 10 AssessmentInvites
     * const assessmentInvites = await prisma.assessmentInvite.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const assessmentInviteWithIdOnly = await prisma.assessmentInvite.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AssessmentInviteFindManyArgs>(args?: SelectSubset<T, AssessmentInviteFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AssessmentInvitePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AssessmentInvite.
     * @param {AssessmentInviteCreateArgs} args - Arguments to create a AssessmentInvite.
     * @example
     * // Create one AssessmentInvite
     * const AssessmentInvite = await prisma.assessmentInvite.create({
     *   data: {
     *     // ... data to create a AssessmentInvite
     *   }
     * })
     * 
     */
    create<T extends AssessmentInviteCreateArgs>(args: SelectSubset<T, AssessmentInviteCreateArgs<ExtArgs>>): Prisma__AssessmentInviteClient<$Result.GetResult<Prisma.$AssessmentInvitePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AssessmentInvites.
     * @param {AssessmentInviteCreateManyArgs} args - Arguments to create many AssessmentInvites.
     * @example
     * // Create many AssessmentInvites
     * const assessmentInvite = await prisma.assessmentInvite.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AssessmentInviteCreateManyArgs>(args?: SelectSubset<T, AssessmentInviteCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AssessmentInvites and returns the data saved in the database.
     * @param {AssessmentInviteCreateManyAndReturnArgs} args - Arguments to create many AssessmentInvites.
     * @example
     * // Create many AssessmentInvites
     * const assessmentInvite = await prisma.assessmentInvite.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AssessmentInvites and only return the `id`
     * const assessmentInviteWithIdOnly = await prisma.assessmentInvite.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AssessmentInviteCreateManyAndReturnArgs>(args?: SelectSubset<T, AssessmentInviteCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AssessmentInvitePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a AssessmentInvite.
     * @param {AssessmentInviteDeleteArgs} args - Arguments to delete one AssessmentInvite.
     * @example
     * // Delete one AssessmentInvite
     * const AssessmentInvite = await prisma.assessmentInvite.delete({
     *   where: {
     *     // ... filter to delete one AssessmentInvite
     *   }
     * })
     * 
     */
    delete<T extends AssessmentInviteDeleteArgs>(args: SelectSubset<T, AssessmentInviteDeleteArgs<ExtArgs>>): Prisma__AssessmentInviteClient<$Result.GetResult<Prisma.$AssessmentInvitePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AssessmentInvite.
     * @param {AssessmentInviteUpdateArgs} args - Arguments to update one AssessmentInvite.
     * @example
     * // Update one AssessmentInvite
     * const assessmentInvite = await prisma.assessmentInvite.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AssessmentInviteUpdateArgs>(args: SelectSubset<T, AssessmentInviteUpdateArgs<ExtArgs>>): Prisma__AssessmentInviteClient<$Result.GetResult<Prisma.$AssessmentInvitePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AssessmentInvites.
     * @param {AssessmentInviteDeleteManyArgs} args - Arguments to filter AssessmentInvites to delete.
     * @example
     * // Delete a few AssessmentInvites
     * const { count } = await prisma.assessmentInvite.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AssessmentInviteDeleteManyArgs>(args?: SelectSubset<T, AssessmentInviteDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AssessmentInvites.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssessmentInviteUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AssessmentInvites
     * const assessmentInvite = await prisma.assessmentInvite.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AssessmentInviteUpdateManyArgs>(args: SelectSubset<T, AssessmentInviteUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AssessmentInvites and returns the data updated in the database.
     * @param {AssessmentInviteUpdateManyAndReturnArgs} args - Arguments to update many AssessmentInvites.
     * @example
     * // Update many AssessmentInvites
     * const assessmentInvite = await prisma.assessmentInvite.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more AssessmentInvites and only return the `id`
     * const assessmentInviteWithIdOnly = await prisma.assessmentInvite.updateManyAndReturn({
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
    updateManyAndReturn<T extends AssessmentInviteUpdateManyAndReturnArgs>(args: SelectSubset<T, AssessmentInviteUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AssessmentInvitePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one AssessmentInvite.
     * @param {AssessmentInviteUpsertArgs} args - Arguments to update or create a AssessmentInvite.
     * @example
     * // Update or create a AssessmentInvite
     * const assessmentInvite = await prisma.assessmentInvite.upsert({
     *   create: {
     *     // ... data to create a AssessmentInvite
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AssessmentInvite we want to update
     *   }
     * })
     */
    upsert<T extends AssessmentInviteUpsertArgs>(args: SelectSubset<T, AssessmentInviteUpsertArgs<ExtArgs>>): Prisma__AssessmentInviteClient<$Result.GetResult<Prisma.$AssessmentInvitePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of AssessmentInvites.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssessmentInviteCountArgs} args - Arguments to filter AssessmentInvites to count.
     * @example
     * // Count the number of AssessmentInvites
     * const count = await prisma.assessmentInvite.count({
     *   where: {
     *     // ... the filter for the AssessmentInvites we want to count
     *   }
     * })
    **/
    count<T extends AssessmentInviteCountArgs>(
      args?: Subset<T, AssessmentInviteCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AssessmentInviteCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AssessmentInvite.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssessmentInviteAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends AssessmentInviteAggregateArgs>(args: Subset<T, AssessmentInviteAggregateArgs>): Prisma.PrismaPromise<GetAssessmentInviteAggregateType<T>>

    /**
     * Group by AssessmentInvite.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssessmentInviteGroupByArgs} args - Group by arguments.
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
      T extends AssessmentInviteGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AssessmentInviteGroupByArgs['orderBy'] }
        : { orderBy?: AssessmentInviteGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, AssessmentInviteGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAssessmentInviteGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AssessmentInvite model
   */
  readonly fields: AssessmentInviteFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AssessmentInvite.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AssessmentInviteClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    assessment<T extends AssessmentDefaultArgs<ExtArgs> = {}>(args?: Subset<T, AssessmentDefaultArgs<ExtArgs>>): Prisma__AssessmentClient<$Result.GetResult<Prisma.$AssessmentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    attempt<T extends AssessmentInvite$attemptArgs<ExtArgs> = {}>(args?: Subset<T, AssessmentInvite$attemptArgs<ExtArgs>>): Prisma__AttemptClient<$Result.GetResult<Prisma.$AttemptPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the AssessmentInvite model
   */
  interface AssessmentInviteFieldRefs {
    readonly id: FieldRef<"AssessmentInvite", 'String'>
    readonly tenantId: FieldRef<"AssessmentInvite", 'String'>
    readonly assessmentId: FieldRef<"AssessmentInvite", 'String'>
    readonly candidateId: FieldRef<"AssessmentInvite", 'String'>
    readonly applicationId: FieldRef<"AssessmentInvite", 'String'>
    readonly tokenHash: FieldRef<"AssessmentInvite", 'String'>
    readonly provider: FieldRef<"AssessmentInvite", 'String'>
    readonly providerInvitationId: FieldRef<"AssessmentInvite", 'String'>
    readonly providerSecret: FieldRef<"AssessmentInvite", 'String'>
    readonly email: FieldRef<"AssessmentInvite", 'String'>
    readonly status: FieldRef<"AssessmentInvite", 'AssessmentInviteStatus'>
    readonly expiresAt: FieldRef<"AssessmentInvite", 'DateTime'>
    readonly sentAt: FieldRef<"AssessmentInvite", 'DateTime'>
    readonly openedAt: FieldRef<"AssessmentInvite", 'DateTime'>
    readonly startedAt: FieldRef<"AssessmentInvite", 'DateTime'>
    readonly submittedAt: FieldRef<"AssessmentInvite", 'DateTime'>
    readonly consumedAt: FieldRef<"AssessmentInvite", 'DateTime'>
    readonly createdAt: FieldRef<"AssessmentInvite", 'DateTime'>
    readonly updatedAt: FieldRef<"AssessmentInvite", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AssessmentInvite findUnique
   */
  export type AssessmentInviteFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssessmentInvite
     */
    select?: AssessmentInviteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AssessmentInvite
     */
    omit?: AssessmentInviteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssessmentInviteInclude<ExtArgs> | null
    /**
     * Filter, which AssessmentInvite to fetch.
     */
    where: AssessmentInviteWhereUniqueInput
  }

  /**
   * AssessmentInvite findUniqueOrThrow
   */
  export type AssessmentInviteFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssessmentInvite
     */
    select?: AssessmentInviteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AssessmentInvite
     */
    omit?: AssessmentInviteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssessmentInviteInclude<ExtArgs> | null
    /**
     * Filter, which AssessmentInvite to fetch.
     */
    where: AssessmentInviteWhereUniqueInput
  }

  /**
   * AssessmentInvite findFirst
   */
  export type AssessmentInviteFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssessmentInvite
     */
    select?: AssessmentInviteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AssessmentInvite
     */
    omit?: AssessmentInviteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssessmentInviteInclude<ExtArgs> | null
    /**
     * Filter, which AssessmentInvite to fetch.
     */
    where?: AssessmentInviteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AssessmentInvites to fetch.
     */
    orderBy?: AssessmentInviteOrderByWithRelationInput | AssessmentInviteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AssessmentInvites.
     */
    cursor?: AssessmentInviteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AssessmentInvites from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AssessmentInvites.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AssessmentInvites.
     */
    distinct?: AssessmentInviteScalarFieldEnum | AssessmentInviteScalarFieldEnum[]
  }

  /**
   * AssessmentInvite findFirstOrThrow
   */
  export type AssessmentInviteFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssessmentInvite
     */
    select?: AssessmentInviteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AssessmentInvite
     */
    omit?: AssessmentInviteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssessmentInviteInclude<ExtArgs> | null
    /**
     * Filter, which AssessmentInvite to fetch.
     */
    where?: AssessmentInviteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AssessmentInvites to fetch.
     */
    orderBy?: AssessmentInviteOrderByWithRelationInput | AssessmentInviteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AssessmentInvites.
     */
    cursor?: AssessmentInviteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AssessmentInvites from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AssessmentInvites.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AssessmentInvites.
     */
    distinct?: AssessmentInviteScalarFieldEnum | AssessmentInviteScalarFieldEnum[]
  }

  /**
   * AssessmentInvite findMany
   */
  export type AssessmentInviteFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssessmentInvite
     */
    select?: AssessmentInviteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AssessmentInvite
     */
    omit?: AssessmentInviteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssessmentInviteInclude<ExtArgs> | null
    /**
     * Filter, which AssessmentInvites to fetch.
     */
    where?: AssessmentInviteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AssessmentInvites to fetch.
     */
    orderBy?: AssessmentInviteOrderByWithRelationInput | AssessmentInviteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AssessmentInvites.
     */
    cursor?: AssessmentInviteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AssessmentInvites from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AssessmentInvites.
     */
    skip?: number
    distinct?: AssessmentInviteScalarFieldEnum | AssessmentInviteScalarFieldEnum[]
  }

  /**
   * AssessmentInvite create
   */
  export type AssessmentInviteCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssessmentInvite
     */
    select?: AssessmentInviteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AssessmentInvite
     */
    omit?: AssessmentInviteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssessmentInviteInclude<ExtArgs> | null
    /**
     * The data needed to create a AssessmentInvite.
     */
    data: XOR<AssessmentInviteCreateInput, AssessmentInviteUncheckedCreateInput>
  }

  /**
   * AssessmentInvite createMany
   */
  export type AssessmentInviteCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AssessmentInvites.
     */
    data: AssessmentInviteCreateManyInput | AssessmentInviteCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AssessmentInvite createManyAndReturn
   */
  export type AssessmentInviteCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssessmentInvite
     */
    select?: AssessmentInviteSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AssessmentInvite
     */
    omit?: AssessmentInviteOmit<ExtArgs> | null
    /**
     * The data used to create many AssessmentInvites.
     */
    data: AssessmentInviteCreateManyInput | AssessmentInviteCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssessmentInviteIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * AssessmentInvite update
   */
  export type AssessmentInviteUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssessmentInvite
     */
    select?: AssessmentInviteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AssessmentInvite
     */
    omit?: AssessmentInviteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssessmentInviteInclude<ExtArgs> | null
    /**
     * The data needed to update a AssessmentInvite.
     */
    data: XOR<AssessmentInviteUpdateInput, AssessmentInviteUncheckedUpdateInput>
    /**
     * Choose, which AssessmentInvite to update.
     */
    where: AssessmentInviteWhereUniqueInput
  }

  /**
   * AssessmentInvite updateMany
   */
  export type AssessmentInviteUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AssessmentInvites.
     */
    data: XOR<AssessmentInviteUpdateManyMutationInput, AssessmentInviteUncheckedUpdateManyInput>
    /**
     * Filter which AssessmentInvites to update
     */
    where?: AssessmentInviteWhereInput
    /**
     * Limit how many AssessmentInvites to update.
     */
    limit?: number
  }

  /**
   * AssessmentInvite updateManyAndReturn
   */
  export type AssessmentInviteUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssessmentInvite
     */
    select?: AssessmentInviteSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AssessmentInvite
     */
    omit?: AssessmentInviteOmit<ExtArgs> | null
    /**
     * The data used to update AssessmentInvites.
     */
    data: XOR<AssessmentInviteUpdateManyMutationInput, AssessmentInviteUncheckedUpdateManyInput>
    /**
     * Filter which AssessmentInvites to update
     */
    where?: AssessmentInviteWhereInput
    /**
     * Limit how many AssessmentInvites to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssessmentInviteIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * AssessmentInvite upsert
   */
  export type AssessmentInviteUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssessmentInvite
     */
    select?: AssessmentInviteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AssessmentInvite
     */
    omit?: AssessmentInviteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssessmentInviteInclude<ExtArgs> | null
    /**
     * The filter to search for the AssessmentInvite to update in case it exists.
     */
    where: AssessmentInviteWhereUniqueInput
    /**
     * In case the AssessmentInvite found by the `where` argument doesn't exist, create a new AssessmentInvite with this data.
     */
    create: XOR<AssessmentInviteCreateInput, AssessmentInviteUncheckedCreateInput>
    /**
     * In case the AssessmentInvite was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AssessmentInviteUpdateInput, AssessmentInviteUncheckedUpdateInput>
  }

  /**
   * AssessmentInvite delete
   */
  export type AssessmentInviteDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssessmentInvite
     */
    select?: AssessmentInviteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AssessmentInvite
     */
    omit?: AssessmentInviteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssessmentInviteInclude<ExtArgs> | null
    /**
     * Filter which AssessmentInvite to delete.
     */
    where: AssessmentInviteWhereUniqueInput
  }

  /**
   * AssessmentInvite deleteMany
   */
  export type AssessmentInviteDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AssessmentInvites to delete
     */
    where?: AssessmentInviteWhereInput
    /**
     * Limit how many AssessmentInvites to delete.
     */
    limit?: number
  }

  /**
   * AssessmentInvite.attempt
   */
  export type AssessmentInvite$attemptArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attempt
     */
    select?: AttemptSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attempt
     */
    omit?: AttemptOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttemptInclude<ExtArgs> | null
    where?: AttemptWhereInput
  }

  /**
   * AssessmentInvite without action
   */
  export type AssessmentInviteDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssessmentInvite
     */
    select?: AssessmentInviteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AssessmentInvite
     */
    omit?: AssessmentInviteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssessmentInviteInclude<ExtArgs> | null
  }


  /**
   * Model Attempt
   */

  export type AggregateAttempt = {
    _count: AttemptCountAggregateOutputType | null
    _avg: AttemptAvgAggregateOutputType | null
    _sum: AttemptSumAggregateOutputType | null
    _min: AttemptMinAggregateOutputType | null
    _max: AttemptMaxAggregateOutputType | null
  }

  export type AttemptAvgAggregateOutputType = {
    durationSeconds: number | null
    remainingSeconds: number | null
  }

  export type AttemptSumAggregateOutputType = {
    durationSeconds: number | null
    remainingSeconds: number | null
  }

  export type AttemptMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    assessmentId: string | null
    inviteId: string | null
    candidateId: string | null
    status: $Enums.AttemptStatus | null
    startedAt: Date | null
    submittedAt: Date | null
    durationSeconds: number | null
    sessionTokenHash: string | null
    remainingSeconds: number | null
    lastHeartbeatAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AttemptMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    assessmentId: string | null
    inviteId: string | null
    candidateId: string | null
    status: $Enums.AttemptStatus | null
    startedAt: Date | null
    submittedAt: Date | null
    durationSeconds: number | null
    sessionTokenHash: string | null
    remainingSeconds: number | null
    lastHeartbeatAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AttemptCountAggregateOutputType = {
    id: number
    tenantId: number
    assessmentId: number
    inviteId: number
    candidateId: number
    status: number
    startedAt: number
    submittedAt: number
    durationSeconds: number
    questionOrder: number
    answerKey: number
    sessionTokenHash: number
    remainingSeconds: number
    lastHeartbeatAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type AttemptAvgAggregateInputType = {
    durationSeconds?: true
    remainingSeconds?: true
  }

  export type AttemptSumAggregateInputType = {
    durationSeconds?: true
    remainingSeconds?: true
  }

  export type AttemptMinAggregateInputType = {
    id?: true
    tenantId?: true
    assessmentId?: true
    inviteId?: true
    candidateId?: true
    status?: true
    startedAt?: true
    submittedAt?: true
    durationSeconds?: true
    sessionTokenHash?: true
    remainingSeconds?: true
    lastHeartbeatAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AttemptMaxAggregateInputType = {
    id?: true
    tenantId?: true
    assessmentId?: true
    inviteId?: true
    candidateId?: true
    status?: true
    startedAt?: true
    submittedAt?: true
    durationSeconds?: true
    sessionTokenHash?: true
    remainingSeconds?: true
    lastHeartbeatAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AttemptCountAggregateInputType = {
    id?: true
    tenantId?: true
    assessmentId?: true
    inviteId?: true
    candidateId?: true
    status?: true
    startedAt?: true
    submittedAt?: true
    durationSeconds?: true
    questionOrder?: true
    answerKey?: true
    sessionTokenHash?: true
    remainingSeconds?: true
    lastHeartbeatAt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type AttemptAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Attempt to aggregate.
     */
    where?: AttemptWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Attempts to fetch.
     */
    orderBy?: AttemptOrderByWithRelationInput | AttemptOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AttemptWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Attempts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Attempts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Attempts
    **/
    _count?: true | AttemptCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AttemptAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AttemptSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AttemptMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AttemptMaxAggregateInputType
  }

  export type GetAttemptAggregateType<T extends AttemptAggregateArgs> = {
        [P in keyof T & keyof AggregateAttempt]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAttempt[P]>
      : GetScalarType<T[P], AggregateAttempt[P]>
  }




  export type AttemptGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AttemptWhereInput
    orderBy?: AttemptOrderByWithAggregationInput | AttemptOrderByWithAggregationInput[]
    by: AttemptScalarFieldEnum[] | AttemptScalarFieldEnum
    having?: AttemptScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AttemptCountAggregateInputType | true
    _avg?: AttemptAvgAggregateInputType
    _sum?: AttemptSumAggregateInputType
    _min?: AttemptMinAggregateInputType
    _max?: AttemptMaxAggregateInputType
  }

  export type AttemptGroupByOutputType = {
    id: string
    tenantId: string
    assessmentId: string
    inviteId: string
    candidateId: string
    status: $Enums.AttemptStatus
    startedAt: Date | null
    submittedAt: Date | null
    durationSeconds: number | null
    questionOrder: JsonValue
    answerKey: JsonValue
    sessionTokenHash: string | null
    remainingSeconds: number | null
    lastHeartbeatAt: Date | null
    createdAt: Date
    updatedAt: Date
    _count: AttemptCountAggregateOutputType | null
    _avg: AttemptAvgAggregateOutputType | null
    _sum: AttemptSumAggregateOutputType | null
    _min: AttemptMinAggregateOutputType | null
    _max: AttemptMaxAggregateOutputType | null
  }

  type GetAttemptGroupByPayload<T extends AttemptGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AttemptGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AttemptGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AttemptGroupByOutputType[P]>
            : GetScalarType<T[P], AttemptGroupByOutputType[P]>
        }
      >
    >


  export type AttemptSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    assessmentId?: boolean
    inviteId?: boolean
    candidateId?: boolean
    status?: boolean
    startedAt?: boolean
    submittedAt?: boolean
    durationSeconds?: boolean
    questionOrder?: boolean
    answerKey?: boolean
    sessionTokenHash?: boolean
    remainingSeconds?: boolean
    lastHeartbeatAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    assessment?: boolean | AssessmentDefaultArgs<ExtArgs>
    invite?: boolean | AssessmentInviteDefaultArgs<ExtArgs>
    answers?: boolean | Attempt$answersArgs<ExtArgs>
    proctorEvents?: boolean | Attempt$proctorEventsArgs<ExtArgs>
    result?: boolean | Attempt$resultArgs<ExtArgs>
    _count?: boolean | AttemptCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["attempt"]>

  export type AttemptSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    assessmentId?: boolean
    inviteId?: boolean
    candidateId?: boolean
    status?: boolean
    startedAt?: boolean
    submittedAt?: boolean
    durationSeconds?: boolean
    questionOrder?: boolean
    answerKey?: boolean
    sessionTokenHash?: boolean
    remainingSeconds?: boolean
    lastHeartbeatAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    assessment?: boolean | AssessmentDefaultArgs<ExtArgs>
    invite?: boolean | AssessmentInviteDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["attempt"]>

  export type AttemptSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    assessmentId?: boolean
    inviteId?: boolean
    candidateId?: boolean
    status?: boolean
    startedAt?: boolean
    submittedAt?: boolean
    durationSeconds?: boolean
    questionOrder?: boolean
    answerKey?: boolean
    sessionTokenHash?: boolean
    remainingSeconds?: boolean
    lastHeartbeatAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    assessment?: boolean | AssessmentDefaultArgs<ExtArgs>
    invite?: boolean | AssessmentInviteDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["attempt"]>

  export type AttemptSelectScalar = {
    id?: boolean
    tenantId?: boolean
    assessmentId?: boolean
    inviteId?: boolean
    candidateId?: boolean
    status?: boolean
    startedAt?: boolean
    submittedAt?: boolean
    durationSeconds?: boolean
    questionOrder?: boolean
    answerKey?: boolean
    sessionTokenHash?: boolean
    remainingSeconds?: boolean
    lastHeartbeatAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type AttemptOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "assessmentId" | "inviteId" | "candidateId" | "status" | "startedAt" | "submittedAt" | "durationSeconds" | "questionOrder" | "answerKey" | "sessionTokenHash" | "remainingSeconds" | "lastHeartbeatAt" | "createdAt" | "updatedAt", ExtArgs["result"]["attempt"]>
  export type AttemptInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    assessment?: boolean | AssessmentDefaultArgs<ExtArgs>
    invite?: boolean | AssessmentInviteDefaultArgs<ExtArgs>
    answers?: boolean | Attempt$answersArgs<ExtArgs>
    proctorEvents?: boolean | Attempt$proctorEventsArgs<ExtArgs>
    result?: boolean | Attempt$resultArgs<ExtArgs>
    _count?: boolean | AttemptCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type AttemptIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    assessment?: boolean | AssessmentDefaultArgs<ExtArgs>
    invite?: boolean | AssessmentInviteDefaultArgs<ExtArgs>
  }
  export type AttemptIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    assessment?: boolean | AssessmentDefaultArgs<ExtArgs>
    invite?: boolean | AssessmentInviteDefaultArgs<ExtArgs>
  }

  export type $AttemptPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Attempt"
    objects: {
      assessment: Prisma.$AssessmentPayload<ExtArgs>
      invite: Prisma.$AssessmentInvitePayload<ExtArgs>
      answers: Prisma.$AnswerPayload<ExtArgs>[]
      proctorEvents: Prisma.$ProctorEventPayload<ExtArgs>[]
      result: Prisma.$AssessmentResultPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      assessmentId: string
      inviteId: string
      candidateId: string
      status: $Enums.AttemptStatus
      startedAt: Date | null
      submittedAt: Date | null
      durationSeconds: number | null
      questionOrder: Prisma.JsonValue
      answerKey: Prisma.JsonValue
      sessionTokenHash: string | null
      remainingSeconds: number | null
      lastHeartbeatAt: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["attempt"]>
    composites: {}
  }

  type AttemptGetPayload<S extends boolean | null | undefined | AttemptDefaultArgs> = $Result.GetResult<Prisma.$AttemptPayload, S>

  type AttemptCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AttemptFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AttemptCountAggregateInputType | true
    }

  export interface AttemptDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Attempt'], meta: { name: 'Attempt' } }
    /**
     * Find zero or one Attempt that matches the filter.
     * @param {AttemptFindUniqueArgs} args - Arguments to find a Attempt
     * @example
     * // Get one Attempt
     * const attempt = await prisma.attempt.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AttemptFindUniqueArgs>(args: SelectSubset<T, AttemptFindUniqueArgs<ExtArgs>>): Prisma__AttemptClient<$Result.GetResult<Prisma.$AttemptPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Attempt that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AttemptFindUniqueOrThrowArgs} args - Arguments to find a Attempt
     * @example
     * // Get one Attempt
     * const attempt = await prisma.attempt.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AttemptFindUniqueOrThrowArgs>(args: SelectSubset<T, AttemptFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AttemptClient<$Result.GetResult<Prisma.$AttemptPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Attempt that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttemptFindFirstArgs} args - Arguments to find a Attempt
     * @example
     * // Get one Attempt
     * const attempt = await prisma.attempt.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AttemptFindFirstArgs>(args?: SelectSubset<T, AttemptFindFirstArgs<ExtArgs>>): Prisma__AttemptClient<$Result.GetResult<Prisma.$AttemptPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Attempt that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttemptFindFirstOrThrowArgs} args - Arguments to find a Attempt
     * @example
     * // Get one Attempt
     * const attempt = await prisma.attempt.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AttemptFindFirstOrThrowArgs>(args?: SelectSubset<T, AttemptFindFirstOrThrowArgs<ExtArgs>>): Prisma__AttemptClient<$Result.GetResult<Prisma.$AttemptPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Attempts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttemptFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Attempts
     * const attempts = await prisma.attempt.findMany()
     * 
     * // Get first 10 Attempts
     * const attempts = await prisma.attempt.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const attemptWithIdOnly = await prisma.attempt.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AttemptFindManyArgs>(args?: SelectSubset<T, AttemptFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AttemptPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Attempt.
     * @param {AttemptCreateArgs} args - Arguments to create a Attempt.
     * @example
     * // Create one Attempt
     * const Attempt = await prisma.attempt.create({
     *   data: {
     *     // ... data to create a Attempt
     *   }
     * })
     * 
     */
    create<T extends AttemptCreateArgs>(args: SelectSubset<T, AttemptCreateArgs<ExtArgs>>): Prisma__AttemptClient<$Result.GetResult<Prisma.$AttemptPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Attempts.
     * @param {AttemptCreateManyArgs} args - Arguments to create many Attempts.
     * @example
     * // Create many Attempts
     * const attempt = await prisma.attempt.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AttemptCreateManyArgs>(args?: SelectSubset<T, AttemptCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Attempts and returns the data saved in the database.
     * @param {AttemptCreateManyAndReturnArgs} args - Arguments to create many Attempts.
     * @example
     * // Create many Attempts
     * const attempt = await prisma.attempt.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Attempts and only return the `id`
     * const attemptWithIdOnly = await prisma.attempt.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AttemptCreateManyAndReturnArgs>(args?: SelectSubset<T, AttemptCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AttemptPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Attempt.
     * @param {AttemptDeleteArgs} args - Arguments to delete one Attempt.
     * @example
     * // Delete one Attempt
     * const Attempt = await prisma.attempt.delete({
     *   where: {
     *     // ... filter to delete one Attempt
     *   }
     * })
     * 
     */
    delete<T extends AttemptDeleteArgs>(args: SelectSubset<T, AttemptDeleteArgs<ExtArgs>>): Prisma__AttemptClient<$Result.GetResult<Prisma.$AttemptPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Attempt.
     * @param {AttemptUpdateArgs} args - Arguments to update one Attempt.
     * @example
     * // Update one Attempt
     * const attempt = await prisma.attempt.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AttemptUpdateArgs>(args: SelectSubset<T, AttemptUpdateArgs<ExtArgs>>): Prisma__AttemptClient<$Result.GetResult<Prisma.$AttemptPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Attempts.
     * @param {AttemptDeleteManyArgs} args - Arguments to filter Attempts to delete.
     * @example
     * // Delete a few Attempts
     * const { count } = await prisma.attempt.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AttemptDeleteManyArgs>(args?: SelectSubset<T, AttemptDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Attempts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttemptUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Attempts
     * const attempt = await prisma.attempt.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AttemptUpdateManyArgs>(args: SelectSubset<T, AttemptUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Attempts and returns the data updated in the database.
     * @param {AttemptUpdateManyAndReturnArgs} args - Arguments to update many Attempts.
     * @example
     * // Update many Attempts
     * const attempt = await prisma.attempt.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Attempts and only return the `id`
     * const attemptWithIdOnly = await prisma.attempt.updateManyAndReturn({
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
    updateManyAndReturn<T extends AttemptUpdateManyAndReturnArgs>(args: SelectSubset<T, AttemptUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AttemptPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Attempt.
     * @param {AttemptUpsertArgs} args - Arguments to update or create a Attempt.
     * @example
     * // Update or create a Attempt
     * const attempt = await prisma.attempt.upsert({
     *   create: {
     *     // ... data to create a Attempt
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Attempt we want to update
     *   }
     * })
     */
    upsert<T extends AttemptUpsertArgs>(args: SelectSubset<T, AttemptUpsertArgs<ExtArgs>>): Prisma__AttemptClient<$Result.GetResult<Prisma.$AttemptPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Attempts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttemptCountArgs} args - Arguments to filter Attempts to count.
     * @example
     * // Count the number of Attempts
     * const count = await prisma.attempt.count({
     *   where: {
     *     // ... the filter for the Attempts we want to count
     *   }
     * })
    **/
    count<T extends AttemptCountArgs>(
      args?: Subset<T, AttemptCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AttemptCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Attempt.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttemptAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends AttemptAggregateArgs>(args: Subset<T, AttemptAggregateArgs>): Prisma.PrismaPromise<GetAttemptAggregateType<T>>

    /**
     * Group by Attempt.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttemptGroupByArgs} args - Group by arguments.
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
      T extends AttemptGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AttemptGroupByArgs['orderBy'] }
        : { orderBy?: AttemptGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, AttemptGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAttemptGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Attempt model
   */
  readonly fields: AttemptFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Attempt.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AttemptClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    assessment<T extends AssessmentDefaultArgs<ExtArgs> = {}>(args?: Subset<T, AssessmentDefaultArgs<ExtArgs>>): Prisma__AssessmentClient<$Result.GetResult<Prisma.$AssessmentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    invite<T extends AssessmentInviteDefaultArgs<ExtArgs> = {}>(args?: Subset<T, AssessmentInviteDefaultArgs<ExtArgs>>): Prisma__AssessmentInviteClient<$Result.GetResult<Prisma.$AssessmentInvitePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    answers<T extends Attempt$answersArgs<ExtArgs> = {}>(args?: Subset<T, Attempt$answersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AnswerPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    proctorEvents<T extends Attempt$proctorEventsArgs<ExtArgs> = {}>(args?: Subset<T, Attempt$proctorEventsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProctorEventPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    result<T extends Attempt$resultArgs<ExtArgs> = {}>(args?: Subset<T, Attempt$resultArgs<ExtArgs>>): Prisma__AssessmentResultClient<$Result.GetResult<Prisma.$AssessmentResultPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the Attempt model
   */
  interface AttemptFieldRefs {
    readonly id: FieldRef<"Attempt", 'String'>
    readonly tenantId: FieldRef<"Attempt", 'String'>
    readonly assessmentId: FieldRef<"Attempt", 'String'>
    readonly inviteId: FieldRef<"Attempt", 'String'>
    readonly candidateId: FieldRef<"Attempt", 'String'>
    readonly status: FieldRef<"Attempt", 'AttemptStatus'>
    readonly startedAt: FieldRef<"Attempt", 'DateTime'>
    readonly submittedAt: FieldRef<"Attempt", 'DateTime'>
    readonly durationSeconds: FieldRef<"Attempt", 'Int'>
    readonly questionOrder: FieldRef<"Attempt", 'Json'>
    readonly answerKey: FieldRef<"Attempt", 'Json'>
    readonly sessionTokenHash: FieldRef<"Attempt", 'String'>
    readonly remainingSeconds: FieldRef<"Attempt", 'Int'>
    readonly lastHeartbeatAt: FieldRef<"Attempt", 'DateTime'>
    readonly createdAt: FieldRef<"Attempt", 'DateTime'>
    readonly updatedAt: FieldRef<"Attempt", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Attempt findUnique
   */
  export type AttemptFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attempt
     */
    select?: AttemptSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attempt
     */
    omit?: AttemptOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttemptInclude<ExtArgs> | null
    /**
     * Filter, which Attempt to fetch.
     */
    where: AttemptWhereUniqueInput
  }

  /**
   * Attempt findUniqueOrThrow
   */
  export type AttemptFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attempt
     */
    select?: AttemptSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attempt
     */
    omit?: AttemptOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttemptInclude<ExtArgs> | null
    /**
     * Filter, which Attempt to fetch.
     */
    where: AttemptWhereUniqueInput
  }

  /**
   * Attempt findFirst
   */
  export type AttemptFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attempt
     */
    select?: AttemptSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attempt
     */
    omit?: AttemptOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttemptInclude<ExtArgs> | null
    /**
     * Filter, which Attempt to fetch.
     */
    where?: AttemptWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Attempts to fetch.
     */
    orderBy?: AttemptOrderByWithRelationInput | AttemptOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Attempts.
     */
    cursor?: AttemptWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Attempts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Attempts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Attempts.
     */
    distinct?: AttemptScalarFieldEnum | AttemptScalarFieldEnum[]
  }

  /**
   * Attempt findFirstOrThrow
   */
  export type AttemptFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attempt
     */
    select?: AttemptSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attempt
     */
    omit?: AttemptOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttemptInclude<ExtArgs> | null
    /**
     * Filter, which Attempt to fetch.
     */
    where?: AttemptWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Attempts to fetch.
     */
    orderBy?: AttemptOrderByWithRelationInput | AttemptOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Attempts.
     */
    cursor?: AttemptWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Attempts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Attempts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Attempts.
     */
    distinct?: AttemptScalarFieldEnum | AttemptScalarFieldEnum[]
  }

  /**
   * Attempt findMany
   */
  export type AttemptFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attempt
     */
    select?: AttemptSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attempt
     */
    omit?: AttemptOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttemptInclude<ExtArgs> | null
    /**
     * Filter, which Attempts to fetch.
     */
    where?: AttemptWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Attempts to fetch.
     */
    orderBy?: AttemptOrderByWithRelationInput | AttemptOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Attempts.
     */
    cursor?: AttemptWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Attempts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Attempts.
     */
    skip?: number
    distinct?: AttemptScalarFieldEnum | AttemptScalarFieldEnum[]
  }

  /**
   * Attempt create
   */
  export type AttemptCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attempt
     */
    select?: AttemptSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attempt
     */
    omit?: AttemptOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttemptInclude<ExtArgs> | null
    /**
     * The data needed to create a Attempt.
     */
    data: XOR<AttemptCreateInput, AttemptUncheckedCreateInput>
  }

  /**
   * Attempt createMany
   */
  export type AttemptCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Attempts.
     */
    data: AttemptCreateManyInput | AttemptCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Attempt createManyAndReturn
   */
  export type AttemptCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attempt
     */
    select?: AttemptSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Attempt
     */
    omit?: AttemptOmit<ExtArgs> | null
    /**
     * The data used to create many Attempts.
     */
    data: AttemptCreateManyInput | AttemptCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttemptIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Attempt update
   */
  export type AttemptUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attempt
     */
    select?: AttemptSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attempt
     */
    omit?: AttemptOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttemptInclude<ExtArgs> | null
    /**
     * The data needed to update a Attempt.
     */
    data: XOR<AttemptUpdateInput, AttemptUncheckedUpdateInput>
    /**
     * Choose, which Attempt to update.
     */
    where: AttemptWhereUniqueInput
  }

  /**
   * Attempt updateMany
   */
  export type AttemptUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Attempts.
     */
    data: XOR<AttemptUpdateManyMutationInput, AttemptUncheckedUpdateManyInput>
    /**
     * Filter which Attempts to update
     */
    where?: AttemptWhereInput
    /**
     * Limit how many Attempts to update.
     */
    limit?: number
  }

  /**
   * Attempt updateManyAndReturn
   */
  export type AttemptUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attempt
     */
    select?: AttemptSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Attempt
     */
    omit?: AttemptOmit<ExtArgs> | null
    /**
     * The data used to update Attempts.
     */
    data: XOR<AttemptUpdateManyMutationInput, AttemptUncheckedUpdateManyInput>
    /**
     * Filter which Attempts to update
     */
    where?: AttemptWhereInput
    /**
     * Limit how many Attempts to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttemptIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Attempt upsert
   */
  export type AttemptUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attempt
     */
    select?: AttemptSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attempt
     */
    omit?: AttemptOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttemptInclude<ExtArgs> | null
    /**
     * The filter to search for the Attempt to update in case it exists.
     */
    where: AttemptWhereUniqueInput
    /**
     * In case the Attempt found by the `where` argument doesn't exist, create a new Attempt with this data.
     */
    create: XOR<AttemptCreateInput, AttemptUncheckedCreateInput>
    /**
     * In case the Attempt was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AttemptUpdateInput, AttemptUncheckedUpdateInput>
  }

  /**
   * Attempt delete
   */
  export type AttemptDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attempt
     */
    select?: AttemptSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attempt
     */
    omit?: AttemptOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttemptInclude<ExtArgs> | null
    /**
     * Filter which Attempt to delete.
     */
    where: AttemptWhereUniqueInput
  }

  /**
   * Attempt deleteMany
   */
  export type AttemptDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Attempts to delete
     */
    where?: AttemptWhereInput
    /**
     * Limit how many Attempts to delete.
     */
    limit?: number
  }

  /**
   * Attempt.answers
   */
  export type Attempt$answersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Answer
     */
    select?: AnswerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Answer
     */
    omit?: AnswerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnswerInclude<ExtArgs> | null
    where?: AnswerWhereInput
    orderBy?: AnswerOrderByWithRelationInput | AnswerOrderByWithRelationInput[]
    cursor?: AnswerWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AnswerScalarFieldEnum | AnswerScalarFieldEnum[]
  }

  /**
   * Attempt.proctorEvents
   */
  export type Attempt$proctorEventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProctorEvent
     */
    select?: ProctorEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProctorEvent
     */
    omit?: ProctorEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProctorEventInclude<ExtArgs> | null
    where?: ProctorEventWhereInput
    orderBy?: ProctorEventOrderByWithRelationInput | ProctorEventOrderByWithRelationInput[]
    cursor?: ProctorEventWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ProctorEventScalarFieldEnum | ProctorEventScalarFieldEnum[]
  }

  /**
   * Attempt.result
   */
  export type Attempt$resultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssessmentResult
     */
    select?: AssessmentResultSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AssessmentResult
     */
    omit?: AssessmentResultOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssessmentResultInclude<ExtArgs> | null
    where?: AssessmentResultWhereInput
  }

  /**
   * Attempt without action
   */
  export type AttemptDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attempt
     */
    select?: AttemptSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attempt
     */
    omit?: AttemptOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttemptInclude<ExtArgs> | null
  }


  /**
   * Model Answer
   */

  export type AggregateAnswer = {
    _count: AnswerCountAggregateOutputType | null
    _avg: AnswerAvgAggregateOutputType | null
    _sum: AnswerSumAggregateOutputType | null
    _min: AnswerMinAggregateOutputType | null
    _max: AnswerMaxAggregateOutputType | null
  }

  export type AnswerAvgAggregateOutputType = {
    timeSpentSeconds: number | null
  }

  export type AnswerSumAggregateOutputType = {
    timeSpentSeconds: number | null
  }

  export type AnswerMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    attemptId: string | null
    questionId: string | null
    timeSpentSeconds: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AnswerMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    attemptId: string | null
    questionId: string | null
    timeSpentSeconds: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AnswerCountAggregateOutputType = {
    id: number
    tenantId: number
    attemptId: number
    questionId: number
    value: number
    timeSpentSeconds: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type AnswerAvgAggregateInputType = {
    timeSpentSeconds?: true
  }

  export type AnswerSumAggregateInputType = {
    timeSpentSeconds?: true
  }

  export type AnswerMinAggregateInputType = {
    id?: true
    tenantId?: true
    attemptId?: true
    questionId?: true
    timeSpentSeconds?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AnswerMaxAggregateInputType = {
    id?: true
    tenantId?: true
    attemptId?: true
    questionId?: true
    timeSpentSeconds?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AnswerCountAggregateInputType = {
    id?: true
    tenantId?: true
    attemptId?: true
    questionId?: true
    value?: true
    timeSpentSeconds?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type AnswerAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Answer to aggregate.
     */
    where?: AnswerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Answers to fetch.
     */
    orderBy?: AnswerOrderByWithRelationInput | AnswerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AnswerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Answers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Answers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Answers
    **/
    _count?: true | AnswerCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AnswerAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AnswerSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AnswerMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AnswerMaxAggregateInputType
  }

  export type GetAnswerAggregateType<T extends AnswerAggregateArgs> = {
        [P in keyof T & keyof AggregateAnswer]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAnswer[P]>
      : GetScalarType<T[P], AggregateAnswer[P]>
  }




  export type AnswerGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AnswerWhereInput
    orderBy?: AnswerOrderByWithAggregationInput | AnswerOrderByWithAggregationInput[]
    by: AnswerScalarFieldEnum[] | AnswerScalarFieldEnum
    having?: AnswerScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AnswerCountAggregateInputType | true
    _avg?: AnswerAvgAggregateInputType
    _sum?: AnswerSumAggregateInputType
    _min?: AnswerMinAggregateInputType
    _max?: AnswerMaxAggregateInputType
  }

  export type AnswerGroupByOutputType = {
    id: string
    tenantId: string
    attemptId: string
    questionId: string
    value: JsonValue | null
    timeSpentSeconds: number | null
    createdAt: Date
    updatedAt: Date
    _count: AnswerCountAggregateOutputType | null
    _avg: AnswerAvgAggregateOutputType | null
    _sum: AnswerSumAggregateOutputType | null
    _min: AnswerMinAggregateOutputType | null
    _max: AnswerMaxAggregateOutputType | null
  }

  type GetAnswerGroupByPayload<T extends AnswerGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AnswerGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AnswerGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AnswerGroupByOutputType[P]>
            : GetScalarType<T[P], AnswerGroupByOutputType[P]>
        }
      >
    >


  export type AnswerSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    attemptId?: boolean
    questionId?: boolean
    value?: boolean
    timeSpentSeconds?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    attempt?: boolean | AttemptDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["answer"]>

  export type AnswerSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    attemptId?: boolean
    questionId?: boolean
    value?: boolean
    timeSpentSeconds?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    attempt?: boolean | AttemptDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["answer"]>

  export type AnswerSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    attemptId?: boolean
    questionId?: boolean
    value?: boolean
    timeSpentSeconds?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    attempt?: boolean | AttemptDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["answer"]>

  export type AnswerSelectScalar = {
    id?: boolean
    tenantId?: boolean
    attemptId?: boolean
    questionId?: boolean
    value?: boolean
    timeSpentSeconds?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type AnswerOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "attemptId" | "questionId" | "value" | "timeSpentSeconds" | "createdAt" | "updatedAt", ExtArgs["result"]["answer"]>
  export type AnswerInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    attempt?: boolean | AttemptDefaultArgs<ExtArgs>
  }
  export type AnswerIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    attempt?: boolean | AttemptDefaultArgs<ExtArgs>
  }
  export type AnswerIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    attempt?: boolean | AttemptDefaultArgs<ExtArgs>
  }

  export type $AnswerPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Answer"
    objects: {
      attempt: Prisma.$AttemptPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      attemptId: string
      questionId: string
      value: Prisma.JsonValue | null
      timeSpentSeconds: number | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["answer"]>
    composites: {}
  }

  type AnswerGetPayload<S extends boolean | null | undefined | AnswerDefaultArgs> = $Result.GetResult<Prisma.$AnswerPayload, S>

  type AnswerCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AnswerFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AnswerCountAggregateInputType | true
    }

  export interface AnswerDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Answer'], meta: { name: 'Answer' } }
    /**
     * Find zero or one Answer that matches the filter.
     * @param {AnswerFindUniqueArgs} args - Arguments to find a Answer
     * @example
     * // Get one Answer
     * const answer = await prisma.answer.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AnswerFindUniqueArgs>(args: SelectSubset<T, AnswerFindUniqueArgs<ExtArgs>>): Prisma__AnswerClient<$Result.GetResult<Prisma.$AnswerPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Answer that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AnswerFindUniqueOrThrowArgs} args - Arguments to find a Answer
     * @example
     * // Get one Answer
     * const answer = await prisma.answer.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AnswerFindUniqueOrThrowArgs>(args: SelectSubset<T, AnswerFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AnswerClient<$Result.GetResult<Prisma.$AnswerPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Answer that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnswerFindFirstArgs} args - Arguments to find a Answer
     * @example
     * // Get one Answer
     * const answer = await prisma.answer.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AnswerFindFirstArgs>(args?: SelectSubset<T, AnswerFindFirstArgs<ExtArgs>>): Prisma__AnswerClient<$Result.GetResult<Prisma.$AnswerPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Answer that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnswerFindFirstOrThrowArgs} args - Arguments to find a Answer
     * @example
     * // Get one Answer
     * const answer = await prisma.answer.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AnswerFindFirstOrThrowArgs>(args?: SelectSubset<T, AnswerFindFirstOrThrowArgs<ExtArgs>>): Prisma__AnswerClient<$Result.GetResult<Prisma.$AnswerPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Answers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnswerFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Answers
     * const answers = await prisma.answer.findMany()
     * 
     * // Get first 10 Answers
     * const answers = await prisma.answer.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const answerWithIdOnly = await prisma.answer.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AnswerFindManyArgs>(args?: SelectSubset<T, AnswerFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AnswerPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Answer.
     * @param {AnswerCreateArgs} args - Arguments to create a Answer.
     * @example
     * // Create one Answer
     * const Answer = await prisma.answer.create({
     *   data: {
     *     // ... data to create a Answer
     *   }
     * })
     * 
     */
    create<T extends AnswerCreateArgs>(args: SelectSubset<T, AnswerCreateArgs<ExtArgs>>): Prisma__AnswerClient<$Result.GetResult<Prisma.$AnswerPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Answers.
     * @param {AnswerCreateManyArgs} args - Arguments to create many Answers.
     * @example
     * // Create many Answers
     * const answer = await prisma.answer.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AnswerCreateManyArgs>(args?: SelectSubset<T, AnswerCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Answers and returns the data saved in the database.
     * @param {AnswerCreateManyAndReturnArgs} args - Arguments to create many Answers.
     * @example
     * // Create many Answers
     * const answer = await prisma.answer.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Answers and only return the `id`
     * const answerWithIdOnly = await prisma.answer.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AnswerCreateManyAndReturnArgs>(args?: SelectSubset<T, AnswerCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AnswerPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Answer.
     * @param {AnswerDeleteArgs} args - Arguments to delete one Answer.
     * @example
     * // Delete one Answer
     * const Answer = await prisma.answer.delete({
     *   where: {
     *     // ... filter to delete one Answer
     *   }
     * })
     * 
     */
    delete<T extends AnswerDeleteArgs>(args: SelectSubset<T, AnswerDeleteArgs<ExtArgs>>): Prisma__AnswerClient<$Result.GetResult<Prisma.$AnswerPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Answer.
     * @param {AnswerUpdateArgs} args - Arguments to update one Answer.
     * @example
     * // Update one Answer
     * const answer = await prisma.answer.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AnswerUpdateArgs>(args: SelectSubset<T, AnswerUpdateArgs<ExtArgs>>): Prisma__AnswerClient<$Result.GetResult<Prisma.$AnswerPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Answers.
     * @param {AnswerDeleteManyArgs} args - Arguments to filter Answers to delete.
     * @example
     * // Delete a few Answers
     * const { count } = await prisma.answer.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AnswerDeleteManyArgs>(args?: SelectSubset<T, AnswerDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Answers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnswerUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Answers
     * const answer = await prisma.answer.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AnswerUpdateManyArgs>(args: SelectSubset<T, AnswerUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Answers and returns the data updated in the database.
     * @param {AnswerUpdateManyAndReturnArgs} args - Arguments to update many Answers.
     * @example
     * // Update many Answers
     * const answer = await prisma.answer.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Answers and only return the `id`
     * const answerWithIdOnly = await prisma.answer.updateManyAndReturn({
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
    updateManyAndReturn<T extends AnswerUpdateManyAndReturnArgs>(args: SelectSubset<T, AnswerUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AnswerPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Answer.
     * @param {AnswerUpsertArgs} args - Arguments to update or create a Answer.
     * @example
     * // Update or create a Answer
     * const answer = await prisma.answer.upsert({
     *   create: {
     *     // ... data to create a Answer
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Answer we want to update
     *   }
     * })
     */
    upsert<T extends AnswerUpsertArgs>(args: SelectSubset<T, AnswerUpsertArgs<ExtArgs>>): Prisma__AnswerClient<$Result.GetResult<Prisma.$AnswerPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Answers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnswerCountArgs} args - Arguments to filter Answers to count.
     * @example
     * // Count the number of Answers
     * const count = await prisma.answer.count({
     *   where: {
     *     // ... the filter for the Answers we want to count
     *   }
     * })
    **/
    count<T extends AnswerCountArgs>(
      args?: Subset<T, AnswerCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AnswerCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Answer.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnswerAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends AnswerAggregateArgs>(args: Subset<T, AnswerAggregateArgs>): Prisma.PrismaPromise<GetAnswerAggregateType<T>>

    /**
     * Group by Answer.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnswerGroupByArgs} args - Group by arguments.
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
      T extends AnswerGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AnswerGroupByArgs['orderBy'] }
        : { orderBy?: AnswerGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, AnswerGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAnswerGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Answer model
   */
  readonly fields: AnswerFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Answer.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AnswerClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    attempt<T extends AttemptDefaultArgs<ExtArgs> = {}>(args?: Subset<T, AttemptDefaultArgs<ExtArgs>>): Prisma__AttemptClient<$Result.GetResult<Prisma.$AttemptPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the Answer model
   */
  interface AnswerFieldRefs {
    readonly id: FieldRef<"Answer", 'String'>
    readonly tenantId: FieldRef<"Answer", 'String'>
    readonly attemptId: FieldRef<"Answer", 'String'>
    readonly questionId: FieldRef<"Answer", 'String'>
    readonly value: FieldRef<"Answer", 'Json'>
    readonly timeSpentSeconds: FieldRef<"Answer", 'Int'>
    readonly createdAt: FieldRef<"Answer", 'DateTime'>
    readonly updatedAt: FieldRef<"Answer", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Answer findUnique
   */
  export type AnswerFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Answer
     */
    select?: AnswerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Answer
     */
    omit?: AnswerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnswerInclude<ExtArgs> | null
    /**
     * Filter, which Answer to fetch.
     */
    where: AnswerWhereUniqueInput
  }

  /**
   * Answer findUniqueOrThrow
   */
  export type AnswerFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Answer
     */
    select?: AnswerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Answer
     */
    omit?: AnswerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnswerInclude<ExtArgs> | null
    /**
     * Filter, which Answer to fetch.
     */
    where: AnswerWhereUniqueInput
  }

  /**
   * Answer findFirst
   */
  export type AnswerFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Answer
     */
    select?: AnswerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Answer
     */
    omit?: AnswerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnswerInclude<ExtArgs> | null
    /**
     * Filter, which Answer to fetch.
     */
    where?: AnswerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Answers to fetch.
     */
    orderBy?: AnswerOrderByWithRelationInput | AnswerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Answers.
     */
    cursor?: AnswerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Answers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Answers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Answers.
     */
    distinct?: AnswerScalarFieldEnum | AnswerScalarFieldEnum[]
  }

  /**
   * Answer findFirstOrThrow
   */
  export type AnswerFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Answer
     */
    select?: AnswerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Answer
     */
    omit?: AnswerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnswerInclude<ExtArgs> | null
    /**
     * Filter, which Answer to fetch.
     */
    where?: AnswerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Answers to fetch.
     */
    orderBy?: AnswerOrderByWithRelationInput | AnswerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Answers.
     */
    cursor?: AnswerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Answers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Answers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Answers.
     */
    distinct?: AnswerScalarFieldEnum | AnswerScalarFieldEnum[]
  }

  /**
   * Answer findMany
   */
  export type AnswerFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Answer
     */
    select?: AnswerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Answer
     */
    omit?: AnswerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnswerInclude<ExtArgs> | null
    /**
     * Filter, which Answers to fetch.
     */
    where?: AnswerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Answers to fetch.
     */
    orderBy?: AnswerOrderByWithRelationInput | AnswerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Answers.
     */
    cursor?: AnswerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Answers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Answers.
     */
    skip?: number
    distinct?: AnswerScalarFieldEnum | AnswerScalarFieldEnum[]
  }

  /**
   * Answer create
   */
  export type AnswerCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Answer
     */
    select?: AnswerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Answer
     */
    omit?: AnswerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnswerInclude<ExtArgs> | null
    /**
     * The data needed to create a Answer.
     */
    data: XOR<AnswerCreateInput, AnswerUncheckedCreateInput>
  }

  /**
   * Answer createMany
   */
  export type AnswerCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Answers.
     */
    data: AnswerCreateManyInput | AnswerCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Answer createManyAndReturn
   */
  export type AnswerCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Answer
     */
    select?: AnswerSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Answer
     */
    omit?: AnswerOmit<ExtArgs> | null
    /**
     * The data used to create many Answers.
     */
    data: AnswerCreateManyInput | AnswerCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnswerIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Answer update
   */
  export type AnswerUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Answer
     */
    select?: AnswerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Answer
     */
    omit?: AnswerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnswerInclude<ExtArgs> | null
    /**
     * The data needed to update a Answer.
     */
    data: XOR<AnswerUpdateInput, AnswerUncheckedUpdateInput>
    /**
     * Choose, which Answer to update.
     */
    where: AnswerWhereUniqueInput
  }

  /**
   * Answer updateMany
   */
  export type AnswerUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Answers.
     */
    data: XOR<AnswerUpdateManyMutationInput, AnswerUncheckedUpdateManyInput>
    /**
     * Filter which Answers to update
     */
    where?: AnswerWhereInput
    /**
     * Limit how many Answers to update.
     */
    limit?: number
  }

  /**
   * Answer updateManyAndReturn
   */
  export type AnswerUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Answer
     */
    select?: AnswerSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Answer
     */
    omit?: AnswerOmit<ExtArgs> | null
    /**
     * The data used to update Answers.
     */
    data: XOR<AnswerUpdateManyMutationInput, AnswerUncheckedUpdateManyInput>
    /**
     * Filter which Answers to update
     */
    where?: AnswerWhereInput
    /**
     * Limit how many Answers to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnswerIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Answer upsert
   */
  export type AnswerUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Answer
     */
    select?: AnswerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Answer
     */
    omit?: AnswerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnswerInclude<ExtArgs> | null
    /**
     * The filter to search for the Answer to update in case it exists.
     */
    where: AnswerWhereUniqueInput
    /**
     * In case the Answer found by the `where` argument doesn't exist, create a new Answer with this data.
     */
    create: XOR<AnswerCreateInput, AnswerUncheckedCreateInput>
    /**
     * In case the Answer was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AnswerUpdateInput, AnswerUncheckedUpdateInput>
  }

  /**
   * Answer delete
   */
  export type AnswerDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Answer
     */
    select?: AnswerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Answer
     */
    omit?: AnswerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnswerInclude<ExtArgs> | null
    /**
     * Filter which Answer to delete.
     */
    where: AnswerWhereUniqueInput
  }

  /**
   * Answer deleteMany
   */
  export type AnswerDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Answers to delete
     */
    where?: AnswerWhereInput
    /**
     * Limit how many Answers to delete.
     */
    limit?: number
  }

  /**
   * Answer without action
   */
  export type AnswerDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Answer
     */
    select?: AnswerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Answer
     */
    omit?: AnswerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AnswerInclude<ExtArgs> | null
  }


  /**
   * Model ProctorEvent
   */

  export type AggregateProctorEvent = {
    _count: ProctorEventCountAggregateOutputType | null
    _min: ProctorEventMinAggregateOutputType | null
    _max: ProctorEventMaxAggregateOutputType | null
  }

  export type ProctorEventMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    attemptId: string | null
    type: string | null
    occurredAt: Date | null
    createdAt: Date | null
  }

  export type ProctorEventMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    attemptId: string | null
    type: string | null
    occurredAt: Date | null
    createdAt: Date | null
  }

  export type ProctorEventCountAggregateOutputType = {
    id: number
    tenantId: number
    attemptId: number
    type: number
    metadata: number
    occurredAt: number
    createdAt: number
    _all: number
  }


  export type ProctorEventMinAggregateInputType = {
    id?: true
    tenantId?: true
    attemptId?: true
    type?: true
    occurredAt?: true
    createdAt?: true
  }

  export type ProctorEventMaxAggregateInputType = {
    id?: true
    tenantId?: true
    attemptId?: true
    type?: true
    occurredAt?: true
    createdAt?: true
  }

  export type ProctorEventCountAggregateInputType = {
    id?: true
    tenantId?: true
    attemptId?: true
    type?: true
    metadata?: true
    occurredAt?: true
    createdAt?: true
    _all?: true
  }

  export type ProctorEventAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProctorEvent to aggregate.
     */
    where?: ProctorEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProctorEvents to fetch.
     */
    orderBy?: ProctorEventOrderByWithRelationInput | ProctorEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProctorEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProctorEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProctorEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ProctorEvents
    **/
    _count?: true | ProctorEventCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProctorEventMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProctorEventMaxAggregateInputType
  }

  export type GetProctorEventAggregateType<T extends ProctorEventAggregateArgs> = {
        [P in keyof T & keyof AggregateProctorEvent]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProctorEvent[P]>
      : GetScalarType<T[P], AggregateProctorEvent[P]>
  }




  export type ProctorEventGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProctorEventWhereInput
    orderBy?: ProctorEventOrderByWithAggregationInput | ProctorEventOrderByWithAggregationInput[]
    by: ProctorEventScalarFieldEnum[] | ProctorEventScalarFieldEnum
    having?: ProctorEventScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProctorEventCountAggregateInputType | true
    _min?: ProctorEventMinAggregateInputType
    _max?: ProctorEventMaxAggregateInputType
  }

  export type ProctorEventGroupByOutputType = {
    id: string
    tenantId: string
    attemptId: string
    type: string
    metadata: JsonValue
    occurredAt: Date
    createdAt: Date
    _count: ProctorEventCountAggregateOutputType | null
    _min: ProctorEventMinAggregateOutputType | null
    _max: ProctorEventMaxAggregateOutputType | null
  }

  type GetProctorEventGroupByPayload<T extends ProctorEventGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProctorEventGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProctorEventGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProctorEventGroupByOutputType[P]>
            : GetScalarType<T[P], ProctorEventGroupByOutputType[P]>
        }
      >
    >


  export type ProctorEventSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    attemptId?: boolean
    type?: boolean
    metadata?: boolean
    occurredAt?: boolean
    createdAt?: boolean
    attempt?: boolean | AttemptDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["proctorEvent"]>

  export type ProctorEventSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    attemptId?: boolean
    type?: boolean
    metadata?: boolean
    occurredAt?: boolean
    createdAt?: boolean
    attempt?: boolean | AttemptDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["proctorEvent"]>

  export type ProctorEventSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    attemptId?: boolean
    type?: boolean
    metadata?: boolean
    occurredAt?: boolean
    createdAt?: boolean
    attempt?: boolean | AttemptDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["proctorEvent"]>

  export type ProctorEventSelectScalar = {
    id?: boolean
    tenantId?: boolean
    attemptId?: boolean
    type?: boolean
    metadata?: boolean
    occurredAt?: boolean
    createdAt?: boolean
  }

  export type ProctorEventOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "attemptId" | "type" | "metadata" | "occurredAt" | "createdAt", ExtArgs["result"]["proctorEvent"]>
  export type ProctorEventInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    attempt?: boolean | AttemptDefaultArgs<ExtArgs>
  }
  export type ProctorEventIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    attempt?: boolean | AttemptDefaultArgs<ExtArgs>
  }
  export type ProctorEventIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    attempt?: boolean | AttemptDefaultArgs<ExtArgs>
  }

  export type $ProctorEventPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ProctorEvent"
    objects: {
      attempt: Prisma.$AttemptPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      attemptId: string
      type: string
      metadata: Prisma.JsonValue
      occurredAt: Date
      createdAt: Date
    }, ExtArgs["result"]["proctorEvent"]>
    composites: {}
  }

  type ProctorEventGetPayload<S extends boolean | null | undefined | ProctorEventDefaultArgs> = $Result.GetResult<Prisma.$ProctorEventPayload, S>

  type ProctorEventCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ProctorEventFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ProctorEventCountAggregateInputType | true
    }

  export interface ProctorEventDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ProctorEvent'], meta: { name: 'ProctorEvent' } }
    /**
     * Find zero or one ProctorEvent that matches the filter.
     * @param {ProctorEventFindUniqueArgs} args - Arguments to find a ProctorEvent
     * @example
     * // Get one ProctorEvent
     * const proctorEvent = await prisma.proctorEvent.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProctorEventFindUniqueArgs>(args: SelectSubset<T, ProctorEventFindUniqueArgs<ExtArgs>>): Prisma__ProctorEventClient<$Result.GetResult<Prisma.$ProctorEventPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ProctorEvent that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ProctorEventFindUniqueOrThrowArgs} args - Arguments to find a ProctorEvent
     * @example
     * // Get one ProctorEvent
     * const proctorEvent = await prisma.proctorEvent.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProctorEventFindUniqueOrThrowArgs>(args: SelectSubset<T, ProctorEventFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProctorEventClient<$Result.GetResult<Prisma.$ProctorEventPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ProctorEvent that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProctorEventFindFirstArgs} args - Arguments to find a ProctorEvent
     * @example
     * // Get one ProctorEvent
     * const proctorEvent = await prisma.proctorEvent.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProctorEventFindFirstArgs>(args?: SelectSubset<T, ProctorEventFindFirstArgs<ExtArgs>>): Prisma__ProctorEventClient<$Result.GetResult<Prisma.$ProctorEventPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ProctorEvent that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProctorEventFindFirstOrThrowArgs} args - Arguments to find a ProctorEvent
     * @example
     * // Get one ProctorEvent
     * const proctorEvent = await prisma.proctorEvent.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProctorEventFindFirstOrThrowArgs>(args?: SelectSubset<T, ProctorEventFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProctorEventClient<$Result.GetResult<Prisma.$ProctorEventPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ProctorEvents that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProctorEventFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ProctorEvents
     * const proctorEvents = await prisma.proctorEvent.findMany()
     * 
     * // Get first 10 ProctorEvents
     * const proctorEvents = await prisma.proctorEvent.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const proctorEventWithIdOnly = await prisma.proctorEvent.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ProctorEventFindManyArgs>(args?: SelectSubset<T, ProctorEventFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProctorEventPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ProctorEvent.
     * @param {ProctorEventCreateArgs} args - Arguments to create a ProctorEvent.
     * @example
     * // Create one ProctorEvent
     * const ProctorEvent = await prisma.proctorEvent.create({
     *   data: {
     *     // ... data to create a ProctorEvent
     *   }
     * })
     * 
     */
    create<T extends ProctorEventCreateArgs>(args: SelectSubset<T, ProctorEventCreateArgs<ExtArgs>>): Prisma__ProctorEventClient<$Result.GetResult<Prisma.$ProctorEventPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ProctorEvents.
     * @param {ProctorEventCreateManyArgs} args - Arguments to create many ProctorEvents.
     * @example
     * // Create many ProctorEvents
     * const proctorEvent = await prisma.proctorEvent.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProctorEventCreateManyArgs>(args?: SelectSubset<T, ProctorEventCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ProctorEvents and returns the data saved in the database.
     * @param {ProctorEventCreateManyAndReturnArgs} args - Arguments to create many ProctorEvents.
     * @example
     * // Create many ProctorEvents
     * const proctorEvent = await prisma.proctorEvent.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ProctorEvents and only return the `id`
     * const proctorEventWithIdOnly = await prisma.proctorEvent.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ProctorEventCreateManyAndReturnArgs>(args?: SelectSubset<T, ProctorEventCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProctorEventPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ProctorEvent.
     * @param {ProctorEventDeleteArgs} args - Arguments to delete one ProctorEvent.
     * @example
     * // Delete one ProctorEvent
     * const ProctorEvent = await prisma.proctorEvent.delete({
     *   where: {
     *     // ... filter to delete one ProctorEvent
     *   }
     * })
     * 
     */
    delete<T extends ProctorEventDeleteArgs>(args: SelectSubset<T, ProctorEventDeleteArgs<ExtArgs>>): Prisma__ProctorEventClient<$Result.GetResult<Prisma.$ProctorEventPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ProctorEvent.
     * @param {ProctorEventUpdateArgs} args - Arguments to update one ProctorEvent.
     * @example
     * // Update one ProctorEvent
     * const proctorEvent = await prisma.proctorEvent.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProctorEventUpdateArgs>(args: SelectSubset<T, ProctorEventUpdateArgs<ExtArgs>>): Prisma__ProctorEventClient<$Result.GetResult<Prisma.$ProctorEventPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ProctorEvents.
     * @param {ProctorEventDeleteManyArgs} args - Arguments to filter ProctorEvents to delete.
     * @example
     * // Delete a few ProctorEvents
     * const { count } = await prisma.proctorEvent.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProctorEventDeleteManyArgs>(args?: SelectSubset<T, ProctorEventDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ProctorEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProctorEventUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ProctorEvents
     * const proctorEvent = await prisma.proctorEvent.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProctorEventUpdateManyArgs>(args: SelectSubset<T, ProctorEventUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ProctorEvents and returns the data updated in the database.
     * @param {ProctorEventUpdateManyAndReturnArgs} args - Arguments to update many ProctorEvents.
     * @example
     * // Update many ProctorEvents
     * const proctorEvent = await prisma.proctorEvent.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ProctorEvents and only return the `id`
     * const proctorEventWithIdOnly = await prisma.proctorEvent.updateManyAndReturn({
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
    updateManyAndReturn<T extends ProctorEventUpdateManyAndReturnArgs>(args: SelectSubset<T, ProctorEventUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProctorEventPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ProctorEvent.
     * @param {ProctorEventUpsertArgs} args - Arguments to update or create a ProctorEvent.
     * @example
     * // Update or create a ProctorEvent
     * const proctorEvent = await prisma.proctorEvent.upsert({
     *   create: {
     *     // ... data to create a ProctorEvent
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ProctorEvent we want to update
     *   }
     * })
     */
    upsert<T extends ProctorEventUpsertArgs>(args: SelectSubset<T, ProctorEventUpsertArgs<ExtArgs>>): Prisma__ProctorEventClient<$Result.GetResult<Prisma.$ProctorEventPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ProctorEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProctorEventCountArgs} args - Arguments to filter ProctorEvents to count.
     * @example
     * // Count the number of ProctorEvents
     * const count = await prisma.proctorEvent.count({
     *   where: {
     *     // ... the filter for the ProctorEvents we want to count
     *   }
     * })
    **/
    count<T extends ProctorEventCountArgs>(
      args?: Subset<T, ProctorEventCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProctorEventCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ProctorEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProctorEventAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ProctorEventAggregateArgs>(args: Subset<T, ProctorEventAggregateArgs>): Prisma.PrismaPromise<GetProctorEventAggregateType<T>>

    /**
     * Group by ProctorEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProctorEventGroupByArgs} args - Group by arguments.
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
      T extends ProctorEventGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProctorEventGroupByArgs['orderBy'] }
        : { orderBy?: ProctorEventGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ProctorEventGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProctorEventGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ProctorEvent model
   */
  readonly fields: ProctorEventFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ProctorEvent.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProctorEventClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    attempt<T extends AttemptDefaultArgs<ExtArgs> = {}>(args?: Subset<T, AttemptDefaultArgs<ExtArgs>>): Prisma__AttemptClient<$Result.GetResult<Prisma.$AttemptPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the ProctorEvent model
   */
  interface ProctorEventFieldRefs {
    readonly id: FieldRef<"ProctorEvent", 'String'>
    readonly tenantId: FieldRef<"ProctorEvent", 'String'>
    readonly attemptId: FieldRef<"ProctorEvent", 'String'>
    readonly type: FieldRef<"ProctorEvent", 'String'>
    readonly metadata: FieldRef<"ProctorEvent", 'Json'>
    readonly occurredAt: FieldRef<"ProctorEvent", 'DateTime'>
    readonly createdAt: FieldRef<"ProctorEvent", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ProctorEvent findUnique
   */
  export type ProctorEventFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProctorEvent
     */
    select?: ProctorEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProctorEvent
     */
    omit?: ProctorEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProctorEventInclude<ExtArgs> | null
    /**
     * Filter, which ProctorEvent to fetch.
     */
    where: ProctorEventWhereUniqueInput
  }

  /**
   * ProctorEvent findUniqueOrThrow
   */
  export type ProctorEventFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProctorEvent
     */
    select?: ProctorEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProctorEvent
     */
    omit?: ProctorEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProctorEventInclude<ExtArgs> | null
    /**
     * Filter, which ProctorEvent to fetch.
     */
    where: ProctorEventWhereUniqueInput
  }

  /**
   * ProctorEvent findFirst
   */
  export type ProctorEventFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProctorEvent
     */
    select?: ProctorEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProctorEvent
     */
    omit?: ProctorEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProctorEventInclude<ExtArgs> | null
    /**
     * Filter, which ProctorEvent to fetch.
     */
    where?: ProctorEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProctorEvents to fetch.
     */
    orderBy?: ProctorEventOrderByWithRelationInput | ProctorEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProctorEvents.
     */
    cursor?: ProctorEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProctorEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProctorEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProctorEvents.
     */
    distinct?: ProctorEventScalarFieldEnum | ProctorEventScalarFieldEnum[]
  }

  /**
   * ProctorEvent findFirstOrThrow
   */
  export type ProctorEventFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProctorEvent
     */
    select?: ProctorEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProctorEvent
     */
    omit?: ProctorEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProctorEventInclude<ExtArgs> | null
    /**
     * Filter, which ProctorEvent to fetch.
     */
    where?: ProctorEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProctorEvents to fetch.
     */
    orderBy?: ProctorEventOrderByWithRelationInput | ProctorEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProctorEvents.
     */
    cursor?: ProctorEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProctorEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProctorEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProctorEvents.
     */
    distinct?: ProctorEventScalarFieldEnum | ProctorEventScalarFieldEnum[]
  }

  /**
   * ProctorEvent findMany
   */
  export type ProctorEventFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProctorEvent
     */
    select?: ProctorEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProctorEvent
     */
    omit?: ProctorEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProctorEventInclude<ExtArgs> | null
    /**
     * Filter, which ProctorEvents to fetch.
     */
    where?: ProctorEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProctorEvents to fetch.
     */
    orderBy?: ProctorEventOrderByWithRelationInput | ProctorEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ProctorEvents.
     */
    cursor?: ProctorEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProctorEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProctorEvents.
     */
    skip?: number
    distinct?: ProctorEventScalarFieldEnum | ProctorEventScalarFieldEnum[]
  }

  /**
   * ProctorEvent create
   */
  export type ProctorEventCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProctorEvent
     */
    select?: ProctorEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProctorEvent
     */
    omit?: ProctorEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProctorEventInclude<ExtArgs> | null
    /**
     * The data needed to create a ProctorEvent.
     */
    data: XOR<ProctorEventCreateInput, ProctorEventUncheckedCreateInput>
  }

  /**
   * ProctorEvent createMany
   */
  export type ProctorEventCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ProctorEvents.
     */
    data: ProctorEventCreateManyInput | ProctorEventCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ProctorEvent createManyAndReturn
   */
  export type ProctorEventCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProctorEvent
     */
    select?: ProctorEventSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ProctorEvent
     */
    omit?: ProctorEventOmit<ExtArgs> | null
    /**
     * The data used to create many ProctorEvents.
     */
    data: ProctorEventCreateManyInput | ProctorEventCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProctorEventIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ProctorEvent update
   */
  export type ProctorEventUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProctorEvent
     */
    select?: ProctorEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProctorEvent
     */
    omit?: ProctorEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProctorEventInclude<ExtArgs> | null
    /**
     * The data needed to update a ProctorEvent.
     */
    data: XOR<ProctorEventUpdateInput, ProctorEventUncheckedUpdateInput>
    /**
     * Choose, which ProctorEvent to update.
     */
    where: ProctorEventWhereUniqueInput
  }

  /**
   * ProctorEvent updateMany
   */
  export type ProctorEventUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ProctorEvents.
     */
    data: XOR<ProctorEventUpdateManyMutationInput, ProctorEventUncheckedUpdateManyInput>
    /**
     * Filter which ProctorEvents to update
     */
    where?: ProctorEventWhereInput
    /**
     * Limit how many ProctorEvents to update.
     */
    limit?: number
  }

  /**
   * ProctorEvent updateManyAndReturn
   */
  export type ProctorEventUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProctorEvent
     */
    select?: ProctorEventSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ProctorEvent
     */
    omit?: ProctorEventOmit<ExtArgs> | null
    /**
     * The data used to update ProctorEvents.
     */
    data: XOR<ProctorEventUpdateManyMutationInput, ProctorEventUncheckedUpdateManyInput>
    /**
     * Filter which ProctorEvents to update
     */
    where?: ProctorEventWhereInput
    /**
     * Limit how many ProctorEvents to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProctorEventIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ProctorEvent upsert
   */
  export type ProctorEventUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProctorEvent
     */
    select?: ProctorEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProctorEvent
     */
    omit?: ProctorEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProctorEventInclude<ExtArgs> | null
    /**
     * The filter to search for the ProctorEvent to update in case it exists.
     */
    where: ProctorEventWhereUniqueInput
    /**
     * In case the ProctorEvent found by the `where` argument doesn't exist, create a new ProctorEvent with this data.
     */
    create: XOR<ProctorEventCreateInput, ProctorEventUncheckedCreateInput>
    /**
     * In case the ProctorEvent was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProctorEventUpdateInput, ProctorEventUncheckedUpdateInput>
  }

  /**
   * ProctorEvent delete
   */
  export type ProctorEventDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProctorEvent
     */
    select?: ProctorEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProctorEvent
     */
    omit?: ProctorEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProctorEventInclude<ExtArgs> | null
    /**
     * Filter which ProctorEvent to delete.
     */
    where: ProctorEventWhereUniqueInput
  }

  /**
   * ProctorEvent deleteMany
   */
  export type ProctorEventDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProctorEvents to delete
     */
    where?: ProctorEventWhereInput
    /**
     * Limit how many ProctorEvents to delete.
     */
    limit?: number
  }

  /**
   * ProctorEvent without action
   */
  export type ProctorEventDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProctorEvent
     */
    select?: ProctorEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProctorEvent
     */
    omit?: ProctorEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProctorEventInclude<ExtArgs> | null
  }


  /**
   * Model AssessmentResult
   */

  export type AggregateAssessmentResult = {
    _count: AssessmentResultCountAggregateOutputType | null
    _avg: AssessmentResultAvgAggregateOutputType | null
    _sum: AssessmentResultSumAggregateOutputType | null
    _min: AssessmentResultMinAggregateOutputType | null
    _max: AssessmentResultMaxAggregateOutputType | null
  }

  export type AssessmentResultAvgAggregateOutputType = {
    rawScore: number | null
    maxScore: number | null
  }

  export type AssessmentResultSumAggregateOutputType = {
    rawScore: number | null
    maxScore: number | null
  }

  export type AssessmentResultMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    assessmentId: string | null
    attemptId: string | null
    candidateId: string | null
    rawScore: number | null
    maxScore: number | null
    passed: boolean | null
    pendingManualReview: boolean | null
    gradedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AssessmentResultMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    assessmentId: string | null
    attemptId: string | null
    candidateId: string | null
    rawScore: number | null
    maxScore: number | null
    passed: boolean | null
    pendingManualReview: boolean | null
    gradedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AssessmentResultCountAggregateOutputType = {
    id: number
    tenantId: number
    assessmentId: number
    attemptId: number
    candidateId: number
    rawScore: number
    maxScore: number
    passed: number
    pendingManualReview: number
    perQuestion: number
    explainability: number
    gradedAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type AssessmentResultAvgAggregateInputType = {
    rawScore?: true
    maxScore?: true
  }

  export type AssessmentResultSumAggregateInputType = {
    rawScore?: true
    maxScore?: true
  }

  export type AssessmentResultMinAggregateInputType = {
    id?: true
    tenantId?: true
    assessmentId?: true
    attemptId?: true
    candidateId?: true
    rawScore?: true
    maxScore?: true
    passed?: true
    pendingManualReview?: true
    gradedAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AssessmentResultMaxAggregateInputType = {
    id?: true
    tenantId?: true
    assessmentId?: true
    attemptId?: true
    candidateId?: true
    rawScore?: true
    maxScore?: true
    passed?: true
    pendingManualReview?: true
    gradedAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AssessmentResultCountAggregateInputType = {
    id?: true
    tenantId?: true
    assessmentId?: true
    attemptId?: true
    candidateId?: true
    rawScore?: true
    maxScore?: true
    passed?: true
    pendingManualReview?: true
    perQuestion?: true
    explainability?: true
    gradedAt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type AssessmentResultAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AssessmentResult to aggregate.
     */
    where?: AssessmentResultWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AssessmentResults to fetch.
     */
    orderBy?: AssessmentResultOrderByWithRelationInput | AssessmentResultOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AssessmentResultWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AssessmentResults from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AssessmentResults.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AssessmentResults
    **/
    _count?: true | AssessmentResultCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AssessmentResultAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AssessmentResultSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AssessmentResultMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AssessmentResultMaxAggregateInputType
  }

  export type GetAssessmentResultAggregateType<T extends AssessmentResultAggregateArgs> = {
        [P in keyof T & keyof AggregateAssessmentResult]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAssessmentResult[P]>
      : GetScalarType<T[P], AggregateAssessmentResult[P]>
  }




  export type AssessmentResultGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AssessmentResultWhereInput
    orderBy?: AssessmentResultOrderByWithAggregationInput | AssessmentResultOrderByWithAggregationInput[]
    by: AssessmentResultScalarFieldEnum[] | AssessmentResultScalarFieldEnum
    having?: AssessmentResultScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AssessmentResultCountAggregateInputType | true
    _avg?: AssessmentResultAvgAggregateInputType
    _sum?: AssessmentResultSumAggregateInputType
    _min?: AssessmentResultMinAggregateInputType
    _max?: AssessmentResultMaxAggregateInputType
  }

  export type AssessmentResultGroupByOutputType = {
    id: string
    tenantId: string
    assessmentId: string
    attemptId: string
    candidateId: string
    rawScore: number
    maxScore: number
    passed: boolean | null
    pendingManualReview: boolean
    perQuestion: JsonValue
    explainability: JsonValue | null
    gradedAt: Date | null
    createdAt: Date
    updatedAt: Date
    _count: AssessmentResultCountAggregateOutputType | null
    _avg: AssessmentResultAvgAggregateOutputType | null
    _sum: AssessmentResultSumAggregateOutputType | null
    _min: AssessmentResultMinAggregateOutputType | null
    _max: AssessmentResultMaxAggregateOutputType | null
  }

  type GetAssessmentResultGroupByPayload<T extends AssessmentResultGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AssessmentResultGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AssessmentResultGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AssessmentResultGroupByOutputType[P]>
            : GetScalarType<T[P], AssessmentResultGroupByOutputType[P]>
        }
      >
    >


  export type AssessmentResultSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    assessmentId?: boolean
    attemptId?: boolean
    candidateId?: boolean
    rawScore?: boolean
    maxScore?: boolean
    passed?: boolean
    pendingManualReview?: boolean
    perQuestion?: boolean
    explainability?: boolean
    gradedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    assessment?: boolean | AssessmentDefaultArgs<ExtArgs>
    attempt?: boolean | AttemptDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["assessmentResult"]>

  export type AssessmentResultSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    assessmentId?: boolean
    attemptId?: boolean
    candidateId?: boolean
    rawScore?: boolean
    maxScore?: boolean
    passed?: boolean
    pendingManualReview?: boolean
    perQuestion?: boolean
    explainability?: boolean
    gradedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    assessment?: boolean | AssessmentDefaultArgs<ExtArgs>
    attempt?: boolean | AttemptDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["assessmentResult"]>

  export type AssessmentResultSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    assessmentId?: boolean
    attemptId?: boolean
    candidateId?: boolean
    rawScore?: boolean
    maxScore?: boolean
    passed?: boolean
    pendingManualReview?: boolean
    perQuestion?: boolean
    explainability?: boolean
    gradedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    assessment?: boolean | AssessmentDefaultArgs<ExtArgs>
    attempt?: boolean | AttemptDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["assessmentResult"]>

  export type AssessmentResultSelectScalar = {
    id?: boolean
    tenantId?: boolean
    assessmentId?: boolean
    attemptId?: boolean
    candidateId?: boolean
    rawScore?: boolean
    maxScore?: boolean
    passed?: boolean
    pendingManualReview?: boolean
    perQuestion?: boolean
    explainability?: boolean
    gradedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type AssessmentResultOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "assessmentId" | "attemptId" | "candidateId" | "rawScore" | "maxScore" | "passed" | "pendingManualReview" | "perQuestion" | "explainability" | "gradedAt" | "createdAt" | "updatedAt", ExtArgs["result"]["assessmentResult"]>
  export type AssessmentResultInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    assessment?: boolean | AssessmentDefaultArgs<ExtArgs>
    attempt?: boolean | AttemptDefaultArgs<ExtArgs>
  }
  export type AssessmentResultIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    assessment?: boolean | AssessmentDefaultArgs<ExtArgs>
    attempt?: boolean | AttemptDefaultArgs<ExtArgs>
  }
  export type AssessmentResultIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    assessment?: boolean | AssessmentDefaultArgs<ExtArgs>
    attempt?: boolean | AttemptDefaultArgs<ExtArgs>
  }

  export type $AssessmentResultPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AssessmentResult"
    objects: {
      assessment: Prisma.$AssessmentPayload<ExtArgs>
      attempt: Prisma.$AttemptPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      assessmentId: string
      attemptId: string
      candidateId: string
      rawScore: number
      maxScore: number
      passed: boolean | null
      pendingManualReview: boolean
      perQuestion: Prisma.JsonValue
      explainability: Prisma.JsonValue | null
      gradedAt: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["assessmentResult"]>
    composites: {}
  }

  type AssessmentResultGetPayload<S extends boolean | null | undefined | AssessmentResultDefaultArgs> = $Result.GetResult<Prisma.$AssessmentResultPayload, S>

  type AssessmentResultCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AssessmentResultFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AssessmentResultCountAggregateInputType | true
    }

  export interface AssessmentResultDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AssessmentResult'], meta: { name: 'AssessmentResult' } }
    /**
     * Find zero or one AssessmentResult that matches the filter.
     * @param {AssessmentResultFindUniqueArgs} args - Arguments to find a AssessmentResult
     * @example
     * // Get one AssessmentResult
     * const assessmentResult = await prisma.assessmentResult.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AssessmentResultFindUniqueArgs>(args: SelectSubset<T, AssessmentResultFindUniqueArgs<ExtArgs>>): Prisma__AssessmentResultClient<$Result.GetResult<Prisma.$AssessmentResultPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AssessmentResult that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AssessmentResultFindUniqueOrThrowArgs} args - Arguments to find a AssessmentResult
     * @example
     * // Get one AssessmentResult
     * const assessmentResult = await prisma.assessmentResult.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AssessmentResultFindUniqueOrThrowArgs>(args: SelectSubset<T, AssessmentResultFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AssessmentResultClient<$Result.GetResult<Prisma.$AssessmentResultPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AssessmentResult that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssessmentResultFindFirstArgs} args - Arguments to find a AssessmentResult
     * @example
     * // Get one AssessmentResult
     * const assessmentResult = await prisma.assessmentResult.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AssessmentResultFindFirstArgs>(args?: SelectSubset<T, AssessmentResultFindFirstArgs<ExtArgs>>): Prisma__AssessmentResultClient<$Result.GetResult<Prisma.$AssessmentResultPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AssessmentResult that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssessmentResultFindFirstOrThrowArgs} args - Arguments to find a AssessmentResult
     * @example
     * // Get one AssessmentResult
     * const assessmentResult = await prisma.assessmentResult.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AssessmentResultFindFirstOrThrowArgs>(args?: SelectSubset<T, AssessmentResultFindFirstOrThrowArgs<ExtArgs>>): Prisma__AssessmentResultClient<$Result.GetResult<Prisma.$AssessmentResultPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AssessmentResults that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssessmentResultFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AssessmentResults
     * const assessmentResults = await prisma.assessmentResult.findMany()
     * 
     * // Get first 10 AssessmentResults
     * const assessmentResults = await prisma.assessmentResult.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const assessmentResultWithIdOnly = await prisma.assessmentResult.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AssessmentResultFindManyArgs>(args?: SelectSubset<T, AssessmentResultFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AssessmentResultPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AssessmentResult.
     * @param {AssessmentResultCreateArgs} args - Arguments to create a AssessmentResult.
     * @example
     * // Create one AssessmentResult
     * const AssessmentResult = await prisma.assessmentResult.create({
     *   data: {
     *     // ... data to create a AssessmentResult
     *   }
     * })
     * 
     */
    create<T extends AssessmentResultCreateArgs>(args: SelectSubset<T, AssessmentResultCreateArgs<ExtArgs>>): Prisma__AssessmentResultClient<$Result.GetResult<Prisma.$AssessmentResultPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AssessmentResults.
     * @param {AssessmentResultCreateManyArgs} args - Arguments to create many AssessmentResults.
     * @example
     * // Create many AssessmentResults
     * const assessmentResult = await prisma.assessmentResult.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AssessmentResultCreateManyArgs>(args?: SelectSubset<T, AssessmentResultCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AssessmentResults and returns the data saved in the database.
     * @param {AssessmentResultCreateManyAndReturnArgs} args - Arguments to create many AssessmentResults.
     * @example
     * // Create many AssessmentResults
     * const assessmentResult = await prisma.assessmentResult.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AssessmentResults and only return the `id`
     * const assessmentResultWithIdOnly = await prisma.assessmentResult.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AssessmentResultCreateManyAndReturnArgs>(args?: SelectSubset<T, AssessmentResultCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AssessmentResultPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a AssessmentResult.
     * @param {AssessmentResultDeleteArgs} args - Arguments to delete one AssessmentResult.
     * @example
     * // Delete one AssessmentResult
     * const AssessmentResult = await prisma.assessmentResult.delete({
     *   where: {
     *     // ... filter to delete one AssessmentResult
     *   }
     * })
     * 
     */
    delete<T extends AssessmentResultDeleteArgs>(args: SelectSubset<T, AssessmentResultDeleteArgs<ExtArgs>>): Prisma__AssessmentResultClient<$Result.GetResult<Prisma.$AssessmentResultPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AssessmentResult.
     * @param {AssessmentResultUpdateArgs} args - Arguments to update one AssessmentResult.
     * @example
     * // Update one AssessmentResult
     * const assessmentResult = await prisma.assessmentResult.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AssessmentResultUpdateArgs>(args: SelectSubset<T, AssessmentResultUpdateArgs<ExtArgs>>): Prisma__AssessmentResultClient<$Result.GetResult<Prisma.$AssessmentResultPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AssessmentResults.
     * @param {AssessmentResultDeleteManyArgs} args - Arguments to filter AssessmentResults to delete.
     * @example
     * // Delete a few AssessmentResults
     * const { count } = await prisma.assessmentResult.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AssessmentResultDeleteManyArgs>(args?: SelectSubset<T, AssessmentResultDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AssessmentResults.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssessmentResultUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AssessmentResults
     * const assessmentResult = await prisma.assessmentResult.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AssessmentResultUpdateManyArgs>(args: SelectSubset<T, AssessmentResultUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AssessmentResults and returns the data updated in the database.
     * @param {AssessmentResultUpdateManyAndReturnArgs} args - Arguments to update many AssessmentResults.
     * @example
     * // Update many AssessmentResults
     * const assessmentResult = await prisma.assessmentResult.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more AssessmentResults and only return the `id`
     * const assessmentResultWithIdOnly = await prisma.assessmentResult.updateManyAndReturn({
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
    updateManyAndReturn<T extends AssessmentResultUpdateManyAndReturnArgs>(args: SelectSubset<T, AssessmentResultUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AssessmentResultPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one AssessmentResult.
     * @param {AssessmentResultUpsertArgs} args - Arguments to update or create a AssessmentResult.
     * @example
     * // Update or create a AssessmentResult
     * const assessmentResult = await prisma.assessmentResult.upsert({
     *   create: {
     *     // ... data to create a AssessmentResult
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AssessmentResult we want to update
     *   }
     * })
     */
    upsert<T extends AssessmentResultUpsertArgs>(args: SelectSubset<T, AssessmentResultUpsertArgs<ExtArgs>>): Prisma__AssessmentResultClient<$Result.GetResult<Prisma.$AssessmentResultPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of AssessmentResults.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssessmentResultCountArgs} args - Arguments to filter AssessmentResults to count.
     * @example
     * // Count the number of AssessmentResults
     * const count = await prisma.assessmentResult.count({
     *   where: {
     *     // ... the filter for the AssessmentResults we want to count
     *   }
     * })
    **/
    count<T extends AssessmentResultCountArgs>(
      args?: Subset<T, AssessmentResultCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AssessmentResultCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AssessmentResult.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssessmentResultAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends AssessmentResultAggregateArgs>(args: Subset<T, AssessmentResultAggregateArgs>): Prisma.PrismaPromise<GetAssessmentResultAggregateType<T>>

    /**
     * Group by AssessmentResult.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssessmentResultGroupByArgs} args - Group by arguments.
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
      T extends AssessmentResultGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AssessmentResultGroupByArgs['orderBy'] }
        : { orderBy?: AssessmentResultGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, AssessmentResultGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAssessmentResultGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AssessmentResult model
   */
  readonly fields: AssessmentResultFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AssessmentResult.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AssessmentResultClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    assessment<T extends AssessmentDefaultArgs<ExtArgs> = {}>(args?: Subset<T, AssessmentDefaultArgs<ExtArgs>>): Prisma__AssessmentClient<$Result.GetResult<Prisma.$AssessmentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    attempt<T extends AttemptDefaultArgs<ExtArgs> = {}>(args?: Subset<T, AttemptDefaultArgs<ExtArgs>>): Prisma__AttemptClient<$Result.GetResult<Prisma.$AttemptPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the AssessmentResult model
   */
  interface AssessmentResultFieldRefs {
    readonly id: FieldRef<"AssessmentResult", 'String'>
    readonly tenantId: FieldRef<"AssessmentResult", 'String'>
    readonly assessmentId: FieldRef<"AssessmentResult", 'String'>
    readonly attemptId: FieldRef<"AssessmentResult", 'String'>
    readonly candidateId: FieldRef<"AssessmentResult", 'String'>
    readonly rawScore: FieldRef<"AssessmentResult", 'Float'>
    readonly maxScore: FieldRef<"AssessmentResult", 'Float'>
    readonly passed: FieldRef<"AssessmentResult", 'Boolean'>
    readonly pendingManualReview: FieldRef<"AssessmentResult", 'Boolean'>
    readonly perQuestion: FieldRef<"AssessmentResult", 'Json'>
    readonly explainability: FieldRef<"AssessmentResult", 'Json'>
    readonly gradedAt: FieldRef<"AssessmentResult", 'DateTime'>
    readonly createdAt: FieldRef<"AssessmentResult", 'DateTime'>
    readonly updatedAt: FieldRef<"AssessmentResult", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AssessmentResult findUnique
   */
  export type AssessmentResultFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssessmentResult
     */
    select?: AssessmentResultSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AssessmentResult
     */
    omit?: AssessmentResultOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssessmentResultInclude<ExtArgs> | null
    /**
     * Filter, which AssessmentResult to fetch.
     */
    where: AssessmentResultWhereUniqueInput
  }

  /**
   * AssessmentResult findUniqueOrThrow
   */
  export type AssessmentResultFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssessmentResult
     */
    select?: AssessmentResultSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AssessmentResult
     */
    omit?: AssessmentResultOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssessmentResultInclude<ExtArgs> | null
    /**
     * Filter, which AssessmentResult to fetch.
     */
    where: AssessmentResultWhereUniqueInput
  }

  /**
   * AssessmentResult findFirst
   */
  export type AssessmentResultFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssessmentResult
     */
    select?: AssessmentResultSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AssessmentResult
     */
    omit?: AssessmentResultOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssessmentResultInclude<ExtArgs> | null
    /**
     * Filter, which AssessmentResult to fetch.
     */
    where?: AssessmentResultWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AssessmentResults to fetch.
     */
    orderBy?: AssessmentResultOrderByWithRelationInput | AssessmentResultOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AssessmentResults.
     */
    cursor?: AssessmentResultWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AssessmentResults from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AssessmentResults.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AssessmentResults.
     */
    distinct?: AssessmentResultScalarFieldEnum | AssessmentResultScalarFieldEnum[]
  }

  /**
   * AssessmentResult findFirstOrThrow
   */
  export type AssessmentResultFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssessmentResult
     */
    select?: AssessmentResultSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AssessmentResult
     */
    omit?: AssessmentResultOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssessmentResultInclude<ExtArgs> | null
    /**
     * Filter, which AssessmentResult to fetch.
     */
    where?: AssessmentResultWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AssessmentResults to fetch.
     */
    orderBy?: AssessmentResultOrderByWithRelationInput | AssessmentResultOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AssessmentResults.
     */
    cursor?: AssessmentResultWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AssessmentResults from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AssessmentResults.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AssessmentResults.
     */
    distinct?: AssessmentResultScalarFieldEnum | AssessmentResultScalarFieldEnum[]
  }

  /**
   * AssessmentResult findMany
   */
  export type AssessmentResultFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssessmentResult
     */
    select?: AssessmentResultSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AssessmentResult
     */
    omit?: AssessmentResultOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssessmentResultInclude<ExtArgs> | null
    /**
     * Filter, which AssessmentResults to fetch.
     */
    where?: AssessmentResultWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AssessmentResults to fetch.
     */
    orderBy?: AssessmentResultOrderByWithRelationInput | AssessmentResultOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AssessmentResults.
     */
    cursor?: AssessmentResultWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AssessmentResults from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AssessmentResults.
     */
    skip?: number
    distinct?: AssessmentResultScalarFieldEnum | AssessmentResultScalarFieldEnum[]
  }

  /**
   * AssessmentResult create
   */
  export type AssessmentResultCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssessmentResult
     */
    select?: AssessmentResultSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AssessmentResult
     */
    omit?: AssessmentResultOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssessmentResultInclude<ExtArgs> | null
    /**
     * The data needed to create a AssessmentResult.
     */
    data: XOR<AssessmentResultCreateInput, AssessmentResultUncheckedCreateInput>
  }

  /**
   * AssessmentResult createMany
   */
  export type AssessmentResultCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AssessmentResults.
     */
    data: AssessmentResultCreateManyInput | AssessmentResultCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AssessmentResult createManyAndReturn
   */
  export type AssessmentResultCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssessmentResult
     */
    select?: AssessmentResultSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AssessmentResult
     */
    omit?: AssessmentResultOmit<ExtArgs> | null
    /**
     * The data used to create many AssessmentResults.
     */
    data: AssessmentResultCreateManyInput | AssessmentResultCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssessmentResultIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * AssessmentResult update
   */
  export type AssessmentResultUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssessmentResult
     */
    select?: AssessmentResultSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AssessmentResult
     */
    omit?: AssessmentResultOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssessmentResultInclude<ExtArgs> | null
    /**
     * The data needed to update a AssessmentResult.
     */
    data: XOR<AssessmentResultUpdateInput, AssessmentResultUncheckedUpdateInput>
    /**
     * Choose, which AssessmentResult to update.
     */
    where: AssessmentResultWhereUniqueInput
  }

  /**
   * AssessmentResult updateMany
   */
  export type AssessmentResultUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AssessmentResults.
     */
    data: XOR<AssessmentResultUpdateManyMutationInput, AssessmentResultUncheckedUpdateManyInput>
    /**
     * Filter which AssessmentResults to update
     */
    where?: AssessmentResultWhereInput
    /**
     * Limit how many AssessmentResults to update.
     */
    limit?: number
  }

  /**
   * AssessmentResult updateManyAndReturn
   */
  export type AssessmentResultUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssessmentResult
     */
    select?: AssessmentResultSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AssessmentResult
     */
    omit?: AssessmentResultOmit<ExtArgs> | null
    /**
     * The data used to update AssessmentResults.
     */
    data: XOR<AssessmentResultUpdateManyMutationInput, AssessmentResultUncheckedUpdateManyInput>
    /**
     * Filter which AssessmentResults to update
     */
    where?: AssessmentResultWhereInput
    /**
     * Limit how many AssessmentResults to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssessmentResultIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * AssessmentResult upsert
   */
  export type AssessmentResultUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssessmentResult
     */
    select?: AssessmentResultSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AssessmentResult
     */
    omit?: AssessmentResultOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssessmentResultInclude<ExtArgs> | null
    /**
     * The filter to search for the AssessmentResult to update in case it exists.
     */
    where: AssessmentResultWhereUniqueInput
    /**
     * In case the AssessmentResult found by the `where` argument doesn't exist, create a new AssessmentResult with this data.
     */
    create: XOR<AssessmentResultCreateInput, AssessmentResultUncheckedCreateInput>
    /**
     * In case the AssessmentResult was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AssessmentResultUpdateInput, AssessmentResultUncheckedUpdateInput>
  }

  /**
   * AssessmentResult delete
   */
  export type AssessmentResultDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssessmentResult
     */
    select?: AssessmentResultSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AssessmentResult
     */
    omit?: AssessmentResultOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssessmentResultInclude<ExtArgs> | null
    /**
     * Filter which AssessmentResult to delete.
     */
    where: AssessmentResultWhereUniqueInput
  }

  /**
   * AssessmentResult deleteMany
   */
  export type AssessmentResultDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AssessmentResults to delete
     */
    where?: AssessmentResultWhereInput
    /**
     * Limit how many AssessmentResults to delete.
     */
    limit?: number
  }

  /**
   * AssessmentResult without action
   */
  export type AssessmentResultDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssessmentResult
     */
    select?: AssessmentResultSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AssessmentResult
     */
    omit?: AssessmentResultOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssessmentResultInclude<ExtArgs> | null
  }


  /**
   * Model QuestionBank
   */

  export type AggregateQuestionBank = {
    _count: QuestionBankCountAggregateOutputType | null
    _min: QuestionBankMinAggregateOutputType | null
    _max: QuestionBankMaxAggregateOutputType | null
  }

  export type QuestionBankMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    name: string | null
    description: string | null
    category: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type QuestionBankMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    name: string | null
    description: string | null
    category: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type QuestionBankCountAggregateOutputType = {
    id: number
    tenantId: number
    name: number
    description: number
    category: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type QuestionBankMinAggregateInputType = {
    id?: true
    tenantId?: true
    name?: true
    description?: true
    category?: true
    createdAt?: true
    updatedAt?: true
  }

  export type QuestionBankMaxAggregateInputType = {
    id?: true
    tenantId?: true
    name?: true
    description?: true
    category?: true
    createdAt?: true
    updatedAt?: true
  }

  export type QuestionBankCountAggregateInputType = {
    id?: true
    tenantId?: true
    name?: true
    description?: true
    category?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type QuestionBankAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which QuestionBank to aggregate.
     */
    where?: QuestionBankWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of QuestionBanks to fetch.
     */
    orderBy?: QuestionBankOrderByWithRelationInput | QuestionBankOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: QuestionBankWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` QuestionBanks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` QuestionBanks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned QuestionBanks
    **/
    _count?: true | QuestionBankCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: QuestionBankMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: QuestionBankMaxAggregateInputType
  }

  export type GetQuestionBankAggregateType<T extends QuestionBankAggregateArgs> = {
        [P in keyof T & keyof AggregateQuestionBank]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateQuestionBank[P]>
      : GetScalarType<T[P], AggregateQuestionBank[P]>
  }




  export type QuestionBankGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: QuestionBankWhereInput
    orderBy?: QuestionBankOrderByWithAggregationInput | QuestionBankOrderByWithAggregationInput[]
    by: QuestionBankScalarFieldEnum[] | QuestionBankScalarFieldEnum
    having?: QuestionBankScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: QuestionBankCountAggregateInputType | true
    _min?: QuestionBankMinAggregateInputType
    _max?: QuestionBankMaxAggregateInputType
  }

  export type QuestionBankGroupByOutputType = {
    id: string
    tenantId: string | null
    name: string
    description: string | null
    category: string | null
    createdAt: Date
    updatedAt: Date
    _count: QuestionBankCountAggregateOutputType | null
    _min: QuestionBankMinAggregateOutputType | null
    _max: QuestionBankMaxAggregateOutputType | null
  }

  type GetQuestionBankGroupByPayload<T extends QuestionBankGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<QuestionBankGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof QuestionBankGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], QuestionBankGroupByOutputType[P]>
            : GetScalarType<T[P], QuestionBankGroupByOutputType[P]>
        }
      >
    >


  export type QuestionBankSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    name?: boolean
    description?: boolean
    category?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    questions?: boolean | QuestionBank$questionsArgs<ExtArgs>
    _count?: boolean | QuestionBankCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["questionBank"]>

  export type QuestionBankSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    name?: boolean
    description?: boolean
    category?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["questionBank"]>

  export type QuestionBankSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    name?: boolean
    description?: boolean
    category?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["questionBank"]>

  export type QuestionBankSelectScalar = {
    id?: boolean
    tenantId?: boolean
    name?: boolean
    description?: boolean
    category?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type QuestionBankOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "name" | "description" | "category" | "createdAt" | "updatedAt", ExtArgs["result"]["questionBank"]>
  export type QuestionBankInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    questions?: boolean | QuestionBank$questionsArgs<ExtArgs>
    _count?: boolean | QuestionBankCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type QuestionBankIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type QuestionBankIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $QuestionBankPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "QuestionBank"
    objects: {
      questions: Prisma.$QuestionPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string | null
      name: string
      description: string | null
      category: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["questionBank"]>
    composites: {}
  }

  type QuestionBankGetPayload<S extends boolean | null | undefined | QuestionBankDefaultArgs> = $Result.GetResult<Prisma.$QuestionBankPayload, S>

  type QuestionBankCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<QuestionBankFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: QuestionBankCountAggregateInputType | true
    }

  export interface QuestionBankDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['QuestionBank'], meta: { name: 'QuestionBank' } }
    /**
     * Find zero or one QuestionBank that matches the filter.
     * @param {QuestionBankFindUniqueArgs} args - Arguments to find a QuestionBank
     * @example
     * // Get one QuestionBank
     * const questionBank = await prisma.questionBank.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends QuestionBankFindUniqueArgs>(args: SelectSubset<T, QuestionBankFindUniqueArgs<ExtArgs>>): Prisma__QuestionBankClient<$Result.GetResult<Prisma.$QuestionBankPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one QuestionBank that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {QuestionBankFindUniqueOrThrowArgs} args - Arguments to find a QuestionBank
     * @example
     * // Get one QuestionBank
     * const questionBank = await prisma.questionBank.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends QuestionBankFindUniqueOrThrowArgs>(args: SelectSubset<T, QuestionBankFindUniqueOrThrowArgs<ExtArgs>>): Prisma__QuestionBankClient<$Result.GetResult<Prisma.$QuestionBankPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first QuestionBank that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QuestionBankFindFirstArgs} args - Arguments to find a QuestionBank
     * @example
     * // Get one QuestionBank
     * const questionBank = await prisma.questionBank.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends QuestionBankFindFirstArgs>(args?: SelectSubset<T, QuestionBankFindFirstArgs<ExtArgs>>): Prisma__QuestionBankClient<$Result.GetResult<Prisma.$QuestionBankPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first QuestionBank that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QuestionBankFindFirstOrThrowArgs} args - Arguments to find a QuestionBank
     * @example
     * // Get one QuestionBank
     * const questionBank = await prisma.questionBank.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends QuestionBankFindFirstOrThrowArgs>(args?: SelectSubset<T, QuestionBankFindFirstOrThrowArgs<ExtArgs>>): Prisma__QuestionBankClient<$Result.GetResult<Prisma.$QuestionBankPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more QuestionBanks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QuestionBankFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all QuestionBanks
     * const questionBanks = await prisma.questionBank.findMany()
     * 
     * // Get first 10 QuestionBanks
     * const questionBanks = await prisma.questionBank.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const questionBankWithIdOnly = await prisma.questionBank.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends QuestionBankFindManyArgs>(args?: SelectSubset<T, QuestionBankFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$QuestionBankPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a QuestionBank.
     * @param {QuestionBankCreateArgs} args - Arguments to create a QuestionBank.
     * @example
     * // Create one QuestionBank
     * const QuestionBank = await prisma.questionBank.create({
     *   data: {
     *     // ... data to create a QuestionBank
     *   }
     * })
     * 
     */
    create<T extends QuestionBankCreateArgs>(args: SelectSubset<T, QuestionBankCreateArgs<ExtArgs>>): Prisma__QuestionBankClient<$Result.GetResult<Prisma.$QuestionBankPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many QuestionBanks.
     * @param {QuestionBankCreateManyArgs} args - Arguments to create many QuestionBanks.
     * @example
     * // Create many QuestionBanks
     * const questionBank = await prisma.questionBank.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends QuestionBankCreateManyArgs>(args?: SelectSubset<T, QuestionBankCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many QuestionBanks and returns the data saved in the database.
     * @param {QuestionBankCreateManyAndReturnArgs} args - Arguments to create many QuestionBanks.
     * @example
     * // Create many QuestionBanks
     * const questionBank = await prisma.questionBank.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many QuestionBanks and only return the `id`
     * const questionBankWithIdOnly = await prisma.questionBank.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends QuestionBankCreateManyAndReturnArgs>(args?: SelectSubset<T, QuestionBankCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$QuestionBankPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a QuestionBank.
     * @param {QuestionBankDeleteArgs} args - Arguments to delete one QuestionBank.
     * @example
     * // Delete one QuestionBank
     * const QuestionBank = await prisma.questionBank.delete({
     *   where: {
     *     // ... filter to delete one QuestionBank
     *   }
     * })
     * 
     */
    delete<T extends QuestionBankDeleteArgs>(args: SelectSubset<T, QuestionBankDeleteArgs<ExtArgs>>): Prisma__QuestionBankClient<$Result.GetResult<Prisma.$QuestionBankPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one QuestionBank.
     * @param {QuestionBankUpdateArgs} args - Arguments to update one QuestionBank.
     * @example
     * // Update one QuestionBank
     * const questionBank = await prisma.questionBank.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends QuestionBankUpdateArgs>(args: SelectSubset<T, QuestionBankUpdateArgs<ExtArgs>>): Prisma__QuestionBankClient<$Result.GetResult<Prisma.$QuestionBankPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more QuestionBanks.
     * @param {QuestionBankDeleteManyArgs} args - Arguments to filter QuestionBanks to delete.
     * @example
     * // Delete a few QuestionBanks
     * const { count } = await prisma.questionBank.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends QuestionBankDeleteManyArgs>(args?: SelectSubset<T, QuestionBankDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more QuestionBanks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QuestionBankUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many QuestionBanks
     * const questionBank = await prisma.questionBank.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends QuestionBankUpdateManyArgs>(args: SelectSubset<T, QuestionBankUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more QuestionBanks and returns the data updated in the database.
     * @param {QuestionBankUpdateManyAndReturnArgs} args - Arguments to update many QuestionBanks.
     * @example
     * // Update many QuestionBanks
     * const questionBank = await prisma.questionBank.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more QuestionBanks and only return the `id`
     * const questionBankWithIdOnly = await prisma.questionBank.updateManyAndReturn({
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
    updateManyAndReturn<T extends QuestionBankUpdateManyAndReturnArgs>(args: SelectSubset<T, QuestionBankUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$QuestionBankPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one QuestionBank.
     * @param {QuestionBankUpsertArgs} args - Arguments to update or create a QuestionBank.
     * @example
     * // Update or create a QuestionBank
     * const questionBank = await prisma.questionBank.upsert({
     *   create: {
     *     // ... data to create a QuestionBank
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the QuestionBank we want to update
     *   }
     * })
     */
    upsert<T extends QuestionBankUpsertArgs>(args: SelectSubset<T, QuestionBankUpsertArgs<ExtArgs>>): Prisma__QuestionBankClient<$Result.GetResult<Prisma.$QuestionBankPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of QuestionBanks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QuestionBankCountArgs} args - Arguments to filter QuestionBanks to count.
     * @example
     * // Count the number of QuestionBanks
     * const count = await prisma.questionBank.count({
     *   where: {
     *     // ... the filter for the QuestionBanks we want to count
     *   }
     * })
    **/
    count<T extends QuestionBankCountArgs>(
      args?: Subset<T, QuestionBankCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], QuestionBankCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a QuestionBank.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QuestionBankAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends QuestionBankAggregateArgs>(args: Subset<T, QuestionBankAggregateArgs>): Prisma.PrismaPromise<GetQuestionBankAggregateType<T>>

    /**
     * Group by QuestionBank.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QuestionBankGroupByArgs} args - Group by arguments.
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
      T extends QuestionBankGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: QuestionBankGroupByArgs['orderBy'] }
        : { orderBy?: QuestionBankGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, QuestionBankGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetQuestionBankGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the QuestionBank model
   */
  readonly fields: QuestionBankFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for QuestionBank.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__QuestionBankClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    questions<T extends QuestionBank$questionsArgs<ExtArgs> = {}>(args?: Subset<T, QuestionBank$questionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$QuestionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the QuestionBank model
   */
  interface QuestionBankFieldRefs {
    readonly id: FieldRef<"QuestionBank", 'String'>
    readonly tenantId: FieldRef<"QuestionBank", 'String'>
    readonly name: FieldRef<"QuestionBank", 'String'>
    readonly description: FieldRef<"QuestionBank", 'String'>
    readonly category: FieldRef<"QuestionBank", 'String'>
    readonly createdAt: FieldRef<"QuestionBank", 'DateTime'>
    readonly updatedAt: FieldRef<"QuestionBank", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * QuestionBank findUnique
   */
  export type QuestionBankFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QuestionBank
     */
    select?: QuestionBankSelect<ExtArgs> | null
    /**
     * Omit specific fields from the QuestionBank
     */
    omit?: QuestionBankOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QuestionBankInclude<ExtArgs> | null
    /**
     * Filter, which QuestionBank to fetch.
     */
    where: QuestionBankWhereUniqueInput
  }

  /**
   * QuestionBank findUniqueOrThrow
   */
  export type QuestionBankFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QuestionBank
     */
    select?: QuestionBankSelect<ExtArgs> | null
    /**
     * Omit specific fields from the QuestionBank
     */
    omit?: QuestionBankOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QuestionBankInclude<ExtArgs> | null
    /**
     * Filter, which QuestionBank to fetch.
     */
    where: QuestionBankWhereUniqueInput
  }

  /**
   * QuestionBank findFirst
   */
  export type QuestionBankFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QuestionBank
     */
    select?: QuestionBankSelect<ExtArgs> | null
    /**
     * Omit specific fields from the QuestionBank
     */
    omit?: QuestionBankOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QuestionBankInclude<ExtArgs> | null
    /**
     * Filter, which QuestionBank to fetch.
     */
    where?: QuestionBankWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of QuestionBanks to fetch.
     */
    orderBy?: QuestionBankOrderByWithRelationInput | QuestionBankOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for QuestionBanks.
     */
    cursor?: QuestionBankWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` QuestionBanks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` QuestionBanks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of QuestionBanks.
     */
    distinct?: QuestionBankScalarFieldEnum | QuestionBankScalarFieldEnum[]
  }

  /**
   * QuestionBank findFirstOrThrow
   */
  export type QuestionBankFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QuestionBank
     */
    select?: QuestionBankSelect<ExtArgs> | null
    /**
     * Omit specific fields from the QuestionBank
     */
    omit?: QuestionBankOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QuestionBankInclude<ExtArgs> | null
    /**
     * Filter, which QuestionBank to fetch.
     */
    where?: QuestionBankWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of QuestionBanks to fetch.
     */
    orderBy?: QuestionBankOrderByWithRelationInput | QuestionBankOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for QuestionBanks.
     */
    cursor?: QuestionBankWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` QuestionBanks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` QuestionBanks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of QuestionBanks.
     */
    distinct?: QuestionBankScalarFieldEnum | QuestionBankScalarFieldEnum[]
  }

  /**
   * QuestionBank findMany
   */
  export type QuestionBankFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QuestionBank
     */
    select?: QuestionBankSelect<ExtArgs> | null
    /**
     * Omit specific fields from the QuestionBank
     */
    omit?: QuestionBankOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QuestionBankInclude<ExtArgs> | null
    /**
     * Filter, which QuestionBanks to fetch.
     */
    where?: QuestionBankWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of QuestionBanks to fetch.
     */
    orderBy?: QuestionBankOrderByWithRelationInput | QuestionBankOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing QuestionBanks.
     */
    cursor?: QuestionBankWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` QuestionBanks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` QuestionBanks.
     */
    skip?: number
    distinct?: QuestionBankScalarFieldEnum | QuestionBankScalarFieldEnum[]
  }

  /**
   * QuestionBank create
   */
  export type QuestionBankCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QuestionBank
     */
    select?: QuestionBankSelect<ExtArgs> | null
    /**
     * Omit specific fields from the QuestionBank
     */
    omit?: QuestionBankOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QuestionBankInclude<ExtArgs> | null
    /**
     * The data needed to create a QuestionBank.
     */
    data: XOR<QuestionBankCreateInput, QuestionBankUncheckedCreateInput>
  }

  /**
   * QuestionBank createMany
   */
  export type QuestionBankCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many QuestionBanks.
     */
    data: QuestionBankCreateManyInput | QuestionBankCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * QuestionBank createManyAndReturn
   */
  export type QuestionBankCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QuestionBank
     */
    select?: QuestionBankSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the QuestionBank
     */
    omit?: QuestionBankOmit<ExtArgs> | null
    /**
     * The data used to create many QuestionBanks.
     */
    data: QuestionBankCreateManyInput | QuestionBankCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * QuestionBank update
   */
  export type QuestionBankUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QuestionBank
     */
    select?: QuestionBankSelect<ExtArgs> | null
    /**
     * Omit specific fields from the QuestionBank
     */
    omit?: QuestionBankOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QuestionBankInclude<ExtArgs> | null
    /**
     * The data needed to update a QuestionBank.
     */
    data: XOR<QuestionBankUpdateInput, QuestionBankUncheckedUpdateInput>
    /**
     * Choose, which QuestionBank to update.
     */
    where: QuestionBankWhereUniqueInput
  }

  /**
   * QuestionBank updateMany
   */
  export type QuestionBankUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update QuestionBanks.
     */
    data: XOR<QuestionBankUpdateManyMutationInput, QuestionBankUncheckedUpdateManyInput>
    /**
     * Filter which QuestionBanks to update
     */
    where?: QuestionBankWhereInput
    /**
     * Limit how many QuestionBanks to update.
     */
    limit?: number
  }

  /**
   * QuestionBank updateManyAndReturn
   */
  export type QuestionBankUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QuestionBank
     */
    select?: QuestionBankSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the QuestionBank
     */
    omit?: QuestionBankOmit<ExtArgs> | null
    /**
     * The data used to update QuestionBanks.
     */
    data: XOR<QuestionBankUpdateManyMutationInput, QuestionBankUncheckedUpdateManyInput>
    /**
     * Filter which QuestionBanks to update
     */
    where?: QuestionBankWhereInput
    /**
     * Limit how many QuestionBanks to update.
     */
    limit?: number
  }

  /**
   * QuestionBank upsert
   */
  export type QuestionBankUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QuestionBank
     */
    select?: QuestionBankSelect<ExtArgs> | null
    /**
     * Omit specific fields from the QuestionBank
     */
    omit?: QuestionBankOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QuestionBankInclude<ExtArgs> | null
    /**
     * The filter to search for the QuestionBank to update in case it exists.
     */
    where: QuestionBankWhereUniqueInput
    /**
     * In case the QuestionBank found by the `where` argument doesn't exist, create a new QuestionBank with this data.
     */
    create: XOR<QuestionBankCreateInput, QuestionBankUncheckedCreateInput>
    /**
     * In case the QuestionBank was found with the provided `where` argument, update it with this data.
     */
    update: XOR<QuestionBankUpdateInput, QuestionBankUncheckedUpdateInput>
  }

  /**
   * QuestionBank delete
   */
  export type QuestionBankDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QuestionBank
     */
    select?: QuestionBankSelect<ExtArgs> | null
    /**
     * Omit specific fields from the QuestionBank
     */
    omit?: QuestionBankOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QuestionBankInclude<ExtArgs> | null
    /**
     * Filter which QuestionBank to delete.
     */
    where: QuestionBankWhereUniqueInput
  }

  /**
   * QuestionBank deleteMany
   */
  export type QuestionBankDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which QuestionBanks to delete
     */
    where?: QuestionBankWhereInput
    /**
     * Limit how many QuestionBanks to delete.
     */
    limit?: number
  }

  /**
   * QuestionBank.questions
   */
  export type QuestionBank$questionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Question
     */
    select?: QuestionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Question
     */
    omit?: QuestionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QuestionInclude<ExtArgs> | null
    where?: QuestionWhereInput
    orderBy?: QuestionOrderByWithRelationInput | QuestionOrderByWithRelationInput[]
    cursor?: QuestionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: QuestionScalarFieldEnum | QuestionScalarFieldEnum[]
  }

  /**
   * QuestionBank without action
   */
  export type QuestionBankDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QuestionBank
     */
    select?: QuestionBankSelect<ExtArgs> | null
    /**
     * Omit specific fields from the QuestionBank
     */
    omit?: QuestionBankOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QuestionBankInclude<ExtArgs> | null
  }


  /**
   * Model Question
   */

  export type AggregateQuestion = {
    _count: QuestionCountAggregateOutputType | null
    _avg: QuestionAvgAggregateOutputType | null
    _sum: QuestionSumAggregateOutputType | null
    _min: QuestionMinAggregateOutputType | null
    _max: QuestionMaxAggregateOutputType | null
  }

  export type QuestionAvgAggregateOutputType = {
    order: number | null
    points: number | null
    timeLimit: number | null
  }

  export type QuestionSumAggregateOutputType = {
    order: number | null
    points: number | null
    timeLimit: number | null
  }

  export type QuestionMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    questionBankId: string | null
    type: $Enums.QuestionType | null
    prompt: string | null
    order: number | null
    required: boolean | null
    points: number | null
    timeLimit: number | null
    language: string | null
    starterCode: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type QuestionMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    questionBankId: string | null
    type: $Enums.QuestionType | null
    prompt: string | null
    order: number | null
    required: boolean | null
    points: number | null
    timeLimit: number | null
    language: string | null
    starterCode: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type QuestionCountAggregateOutputType = {
    id: number
    tenantId: number
    questionBankId: number
    type: number
    prompt: number
    order: number
    required: number
    points: number
    timeLimit: number
    options: number
    correctAnswer: number
    language: number
    starterCode: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type QuestionAvgAggregateInputType = {
    order?: true
    points?: true
    timeLimit?: true
  }

  export type QuestionSumAggregateInputType = {
    order?: true
    points?: true
    timeLimit?: true
  }

  export type QuestionMinAggregateInputType = {
    id?: true
    tenantId?: true
    questionBankId?: true
    type?: true
    prompt?: true
    order?: true
    required?: true
    points?: true
    timeLimit?: true
    language?: true
    starterCode?: true
    createdAt?: true
    updatedAt?: true
  }

  export type QuestionMaxAggregateInputType = {
    id?: true
    tenantId?: true
    questionBankId?: true
    type?: true
    prompt?: true
    order?: true
    required?: true
    points?: true
    timeLimit?: true
    language?: true
    starterCode?: true
    createdAt?: true
    updatedAt?: true
  }

  export type QuestionCountAggregateInputType = {
    id?: true
    tenantId?: true
    questionBankId?: true
    type?: true
    prompt?: true
    order?: true
    required?: true
    points?: true
    timeLimit?: true
    options?: true
    correctAnswer?: true
    language?: true
    starterCode?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type QuestionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Question to aggregate.
     */
    where?: QuestionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Questions to fetch.
     */
    orderBy?: QuestionOrderByWithRelationInput | QuestionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: QuestionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Questions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Questions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Questions
    **/
    _count?: true | QuestionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: QuestionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: QuestionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: QuestionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: QuestionMaxAggregateInputType
  }

  export type GetQuestionAggregateType<T extends QuestionAggregateArgs> = {
        [P in keyof T & keyof AggregateQuestion]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateQuestion[P]>
      : GetScalarType<T[P], AggregateQuestion[P]>
  }




  export type QuestionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: QuestionWhereInput
    orderBy?: QuestionOrderByWithAggregationInput | QuestionOrderByWithAggregationInput[]
    by: QuestionScalarFieldEnum[] | QuestionScalarFieldEnum
    having?: QuestionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: QuestionCountAggregateInputType | true
    _avg?: QuestionAvgAggregateInputType
    _sum?: QuestionSumAggregateInputType
    _min?: QuestionMinAggregateInputType
    _max?: QuestionMaxAggregateInputType
  }

  export type QuestionGroupByOutputType = {
    id: string
    tenantId: string | null
    questionBankId: string
    type: $Enums.QuestionType
    prompt: string
    order: number
    required: boolean
    points: number
    timeLimit: number | null
    options: JsonValue | null
    correctAnswer: JsonValue | null
    language: string | null
    starterCode: string | null
    createdAt: Date
    updatedAt: Date
    _count: QuestionCountAggregateOutputType | null
    _avg: QuestionAvgAggregateOutputType | null
    _sum: QuestionSumAggregateOutputType | null
    _min: QuestionMinAggregateOutputType | null
    _max: QuestionMaxAggregateOutputType | null
  }

  type GetQuestionGroupByPayload<T extends QuestionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<QuestionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof QuestionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], QuestionGroupByOutputType[P]>
            : GetScalarType<T[P], QuestionGroupByOutputType[P]>
        }
      >
    >


  export type QuestionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    questionBankId?: boolean
    type?: boolean
    prompt?: boolean
    order?: boolean
    required?: boolean
    points?: boolean
    timeLimit?: boolean
    options?: boolean
    correctAnswer?: boolean
    language?: boolean
    starterCode?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    questionBank?: boolean | QuestionBankDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["question"]>

  export type QuestionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    questionBankId?: boolean
    type?: boolean
    prompt?: boolean
    order?: boolean
    required?: boolean
    points?: boolean
    timeLimit?: boolean
    options?: boolean
    correctAnswer?: boolean
    language?: boolean
    starterCode?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    questionBank?: boolean | QuestionBankDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["question"]>

  export type QuestionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    questionBankId?: boolean
    type?: boolean
    prompt?: boolean
    order?: boolean
    required?: boolean
    points?: boolean
    timeLimit?: boolean
    options?: boolean
    correctAnswer?: boolean
    language?: boolean
    starterCode?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    questionBank?: boolean | QuestionBankDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["question"]>

  export type QuestionSelectScalar = {
    id?: boolean
    tenantId?: boolean
    questionBankId?: boolean
    type?: boolean
    prompt?: boolean
    order?: boolean
    required?: boolean
    points?: boolean
    timeLimit?: boolean
    options?: boolean
    correctAnswer?: boolean
    language?: boolean
    starterCode?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type QuestionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "questionBankId" | "type" | "prompt" | "order" | "required" | "points" | "timeLimit" | "options" | "correctAnswer" | "language" | "starterCode" | "createdAt" | "updatedAt", ExtArgs["result"]["question"]>
  export type QuestionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    questionBank?: boolean | QuestionBankDefaultArgs<ExtArgs>
  }
  export type QuestionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    questionBank?: boolean | QuestionBankDefaultArgs<ExtArgs>
  }
  export type QuestionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    questionBank?: boolean | QuestionBankDefaultArgs<ExtArgs>
  }

  export type $QuestionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Question"
    objects: {
      questionBank: Prisma.$QuestionBankPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string | null
      questionBankId: string
      type: $Enums.QuestionType
      prompt: string
      order: number
      required: boolean
      points: number
      timeLimit: number | null
      options: Prisma.JsonValue | null
      correctAnswer: Prisma.JsonValue | null
      language: string | null
      starterCode: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["question"]>
    composites: {}
  }

  type QuestionGetPayload<S extends boolean | null | undefined | QuestionDefaultArgs> = $Result.GetResult<Prisma.$QuestionPayload, S>

  type QuestionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<QuestionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: QuestionCountAggregateInputType | true
    }

  export interface QuestionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Question'], meta: { name: 'Question' } }
    /**
     * Find zero or one Question that matches the filter.
     * @param {QuestionFindUniqueArgs} args - Arguments to find a Question
     * @example
     * // Get one Question
     * const question = await prisma.question.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends QuestionFindUniqueArgs>(args: SelectSubset<T, QuestionFindUniqueArgs<ExtArgs>>): Prisma__QuestionClient<$Result.GetResult<Prisma.$QuestionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Question that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {QuestionFindUniqueOrThrowArgs} args - Arguments to find a Question
     * @example
     * // Get one Question
     * const question = await prisma.question.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends QuestionFindUniqueOrThrowArgs>(args: SelectSubset<T, QuestionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__QuestionClient<$Result.GetResult<Prisma.$QuestionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Question that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QuestionFindFirstArgs} args - Arguments to find a Question
     * @example
     * // Get one Question
     * const question = await prisma.question.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends QuestionFindFirstArgs>(args?: SelectSubset<T, QuestionFindFirstArgs<ExtArgs>>): Prisma__QuestionClient<$Result.GetResult<Prisma.$QuestionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Question that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QuestionFindFirstOrThrowArgs} args - Arguments to find a Question
     * @example
     * // Get one Question
     * const question = await prisma.question.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends QuestionFindFirstOrThrowArgs>(args?: SelectSubset<T, QuestionFindFirstOrThrowArgs<ExtArgs>>): Prisma__QuestionClient<$Result.GetResult<Prisma.$QuestionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Questions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QuestionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Questions
     * const questions = await prisma.question.findMany()
     * 
     * // Get first 10 Questions
     * const questions = await prisma.question.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const questionWithIdOnly = await prisma.question.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends QuestionFindManyArgs>(args?: SelectSubset<T, QuestionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$QuestionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Question.
     * @param {QuestionCreateArgs} args - Arguments to create a Question.
     * @example
     * // Create one Question
     * const Question = await prisma.question.create({
     *   data: {
     *     // ... data to create a Question
     *   }
     * })
     * 
     */
    create<T extends QuestionCreateArgs>(args: SelectSubset<T, QuestionCreateArgs<ExtArgs>>): Prisma__QuestionClient<$Result.GetResult<Prisma.$QuestionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Questions.
     * @param {QuestionCreateManyArgs} args - Arguments to create many Questions.
     * @example
     * // Create many Questions
     * const question = await prisma.question.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends QuestionCreateManyArgs>(args?: SelectSubset<T, QuestionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Questions and returns the data saved in the database.
     * @param {QuestionCreateManyAndReturnArgs} args - Arguments to create many Questions.
     * @example
     * // Create many Questions
     * const question = await prisma.question.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Questions and only return the `id`
     * const questionWithIdOnly = await prisma.question.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends QuestionCreateManyAndReturnArgs>(args?: SelectSubset<T, QuestionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$QuestionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Question.
     * @param {QuestionDeleteArgs} args - Arguments to delete one Question.
     * @example
     * // Delete one Question
     * const Question = await prisma.question.delete({
     *   where: {
     *     // ... filter to delete one Question
     *   }
     * })
     * 
     */
    delete<T extends QuestionDeleteArgs>(args: SelectSubset<T, QuestionDeleteArgs<ExtArgs>>): Prisma__QuestionClient<$Result.GetResult<Prisma.$QuestionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Question.
     * @param {QuestionUpdateArgs} args - Arguments to update one Question.
     * @example
     * // Update one Question
     * const question = await prisma.question.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends QuestionUpdateArgs>(args: SelectSubset<T, QuestionUpdateArgs<ExtArgs>>): Prisma__QuestionClient<$Result.GetResult<Prisma.$QuestionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Questions.
     * @param {QuestionDeleteManyArgs} args - Arguments to filter Questions to delete.
     * @example
     * // Delete a few Questions
     * const { count } = await prisma.question.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends QuestionDeleteManyArgs>(args?: SelectSubset<T, QuestionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Questions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QuestionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Questions
     * const question = await prisma.question.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends QuestionUpdateManyArgs>(args: SelectSubset<T, QuestionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Questions and returns the data updated in the database.
     * @param {QuestionUpdateManyAndReturnArgs} args - Arguments to update many Questions.
     * @example
     * // Update many Questions
     * const question = await prisma.question.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Questions and only return the `id`
     * const questionWithIdOnly = await prisma.question.updateManyAndReturn({
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
    updateManyAndReturn<T extends QuestionUpdateManyAndReturnArgs>(args: SelectSubset<T, QuestionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$QuestionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Question.
     * @param {QuestionUpsertArgs} args - Arguments to update or create a Question.
     * @example
     * // Update or create a Question
     * const question = await prisma.question.upsert({
     *   create: {
     *     // ... data to create a Question
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Question we want to update
     *   }
     * })
     */
    upsert<T extends QuestionUpsertArgs>(args: SelectSubset<T, QuestionUpsertArgs<ExtArgs>>): Prisma__QuestionClient<$Result.GetResult<Prisma.$QuestionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Questions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QuestionCountArgs} args - Arguments to filter Questions to count.
     * @example
     * // Count the number of Questions
     * const count = await prisma.question.count({
     *   where: {
     *     // ... the filter for the Questions we want to count
     *   }
     * })
    **/
    count<T extends QuestionCountArgs>(
      args?: Subset<T, QuestionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], QuestionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Question.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QuestionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends QuestionAggregateArgs>(args: Subset<T, QuestionAggregateArgs>): Prisma.PrismaPromise<GetQuestionAggregateType<T>>

    /**
     * Group by Question.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QuestionGroupByArgs} args - Group by arguments.
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
      T extends QuestionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: QuestionGroupByArgs['orderBy'] }
        : { orderBy?: QuestionGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, QuestionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetQuestionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Question model
   */
  readonly fields: QuestionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Question.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__QuestionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    questionBank<T extends QuestionBankDefaultArgs<ExtArgs> = {}>(args?: Subset<T, QuestionBankDefaultArgs<ExtArgs>>): Prisma__QuestionBankClient<$Result.GetResult<Prisma.$QuestionBankPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the Question model
   */
  interface QuestionFieldRefs {
    readonly id: FieldRef<"Question", 'String'>
    readonly tenantId: FieldRef<"Question", 'String'>
    readonly questionBankId: FieldRef<"Question", 'String'>
    readonly type: FieldRef<"Question", 'QuestionType'>
    readonly prompt: FieldRef<"Question", 'String'>
    readonly order: FieldRef<"Question", 'Int'>
    readonly required: FieldRef<"Question", 'Boolean'>
    readonly points: FieldRef<"Question", 'Int'>
    readonly timeLimit: FieldRef<"Question", 'Int'>
    readonly options: FieldRef<"Question", 'Json'>
    readonly correctAnswer: FieldRef<"Question", 'Json'>
    readonly language: FieldRef<"Question", 'String'>
    readonly starterCode: FieldRef<"Question", 'String'>
    readonly createdAt: FieldRef<"Question", 'DateTime'>
    readonly updatedAt: FieldRef<"Question", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Question findUnique
   */
  export type QuestionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Question
     */
    select?: QuestionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Question
     */
    omit?: QuestionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QuestionInclude<ExtArgs> | null
    /**
     * Filter, which Question to fetch.
     */
    where: QuestionWhereUniqueInput
  }

  /**
   * Question findUniqueOrThrow
   */
  export type QuestionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Question
     */
    select?: QuestionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Question
     */
    omit?: QuestionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QuestionInclude<ExtArgs> | null
    /**
     * Filter, which Question to fetch.
     */
    where: QuestionWhereUniqueInput
  }

  /**
   * Question findFirst
   */
  export type QuestionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Question
     */
    select?: QuestionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Question
     */
    omit?: QuestionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QuestionInclude<ExtArgs> | null
    /**
     * Filter, which Question to fetch.
     */
    where?: QuestionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Questions to fetch.
     */
    orderBy?: QuestionOrderByWithRelationInput | QuestionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Questions.
     */
    cursor?: QuestionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Questions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Questions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Questions.
     */
    distinct?: QuestionScalarFieldEnum | QuestionScalarFieldEnum[]
  }

  /**
   * Question findFirstOrThrow
   */
  export type QuestionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Question
     */
    select?: QuestionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Question
     */
    omit?: QuestionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QuestionInclude<ExtArgs> | null
    /**
     * Filter, which Question to fetch.
     */
    where?: QuestionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Questions to fetch.
     */
    orderBy?: QuestionOrderByWithRelationInput | QuestionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Questions.
     */
    cursor?: QuestionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Questions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Questions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Questions.
     */
    distinct?: QuestionScalarFieldEnum | QuestionScalarFieldEnum[]
  }

  /**
   * Question findMany
   */
  export type QuestionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Question
     */
    select?: QuestionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Question
     */
    omit?: QuestionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QuestionInclude<ExtArgs> | null
    /**
     * Filter, which Questions to fetch.
     */
    where?: QuestionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Questions to fetch.
     */
    orderBy?: QuestionOrderByWithRelationInput | QuestionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Questions.
     */
    cursor?: QuestionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Questions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Questions.
     */
    skip?: number
    distinct?: QuestionScalarFieldEnum | QuestionScalarFieldEnum[]
  }

  /**
   * Question create
   */
  export type QuestionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Question
     */
    select?: QuestionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Question
     */
    omit?: QuestionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QuestionInclude<ExtArgs> | null
    /**
     * The data needed to create a Question.
     */
    data: XOR<QuestionCreateInput, QuestionUncheckedCreateInput>
  }

  /**
   * Question createMany
   */
  export type QuestionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Questions.
     */
    data: QuestionCreateManyInput | QuestionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Question createManyAndReturn
   */
  export type QuestionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Question
     */
    select?: QuestionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Question
     */
    omit?: QuestionOmit<ExtArgs> | null
    /**
     * The data used to create many Questions.
     */
    data: QuestionCreateManyInput | QuestionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QuestionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Question update
   */
  export type QuestionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Question
     */
    select?: QuestionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Question
     */
    omit?: QuestionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QuestionInclude<ExtArgs> | null
    /**
     * The data needed to update a Question.
     */
    data: XOR<QuestionUpdateInput, QuestionUncheckedUpdateInput>
    /**
     * Choose, which Question to update.
     */
    where: QuestionWhereUniqueInput
  }

  /**
   * Question updateMany
   */
  export type QuestionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Questions.
     */
    data: XOR<QuestionUpdateManyMutationInput, QuestionUncheckedUpdateManyInput>
    /**
     * Filter which Questions to update
     */
    where?: QuestionWhereInput
    /**
     * Limit how many Questions to update.
     */
    limit?: number
  }

  /**
   * Question updateManyAndReturn
   */
  export type QuestionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Question
     */
    select?: QuestionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Question
     */
    omit?: QuestionOmit<ExtArgs> | null
    /**
     * The data used to update Questions.
     */
    data: XOR<QuestionUpdateManyMutationInput, QuestionUncheckedUpdateManyInput>
    /**
     * Filter which Questions to update
     */
    where?: QuestionWhereInput
    /**
     * Limit how many Questions to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QuestionIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Question upsert
   */
  export type QuestionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Question
     */
    select?: QuestionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Question
     */
    omit?: QuestionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QuestionInclude<ExtArgs> | null
    /**
     * The filter to search for the Question to update in case it exists.
     */
    where: QuestionWhereUniqueInput
    /**
     * In case the Question found by the `where` argument doesn't exist, create a new Question with this data.
     */
    create: XOR<QuestionCreateInput, QuestionUncheckedCreateInput>
    /**
     * In case the Question was found with the provided `where` argument, update it with this data.
     */
    update: XOR<QuestionUpdateInput, QuestionUncheckedUpdateInput>
  }

  /**
   * Question delete
   */
  export type QuestionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Question
     */
    select?: QuestionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Question
     */
    omit?: QuestionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QuestionInclude<ExtArgs> | null
    /**
     * Filter which Question to delete.
     */
    where: QuestionWhereUniqueInput
  }

  /**
   * Question deleteMany
   */
  export type QuestionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Questions to delete
     */
    where?: QuestionWhereInput
    /**
     * Limit how many Questions to delete.
     */
    limit?: number
  }

  /**
   * Question without action
   */
  export type QuestionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Question
     */
    select?: QuestionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Question
     */
    omit?: QuestionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QuestionInclude<ExtArgs> | null
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


  export const AssessmentScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    requisitionId: 'requisitionId',
    questionBankId: 'questionBankId',
    title: 'title',
    description: 'description',
    status: 'status',
    durationMinutes: 'durationMinutes',
    passingScore: 'passingScore',
    shuffleQuestions: 'shuffleQuestions',
    questions: 'questions',
    schemaJson: 'schemaJson',
    version: 'version',
    publishedHash: 'publishedHash',
    publishedAt: 'publishedAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type AssessmentScalarFieldEnum = (typeof AssessmentScalarFieldEnum)[keyof typeof AssessmentScalarFieldEnum]


  export const AssessmentInviteScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    assessmentId: 'assessmentId',
    candidateId: 'candidateId',
    applicationId: 'applicationId',
    tokenHash: 'tokenHash',
    provider: 'provider',
    providerInvitationId: 'providerInvitationId',
    providerSecret: 'providerSecret',
    email: 'email',
    status: 'status',
    expiresAt: 'expiresAt',
    sentAt: 'sentAt',
    openedAt: 'openedAt',
    startedAt: 'startedAt',
    submittedAt: 'submittedAt',
    consumedAt: 'consumedAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type AssessmentInviteScalarFieldEnum = (typeof AssessmentInviteScalarFieldEnum)[keyof typeof AssessmentInviteScalarFieldEnum]


  export const AttemptScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    assessmentId: 'assessmentId',
    inviteId: 'inviteId',
    candidateId: 'candidateId',
    status: 'status',
    startedAt: 'startedAt',
    submittedAt: 'submittedAt',
    durationSeconds: 'durationSeconds',
    questionOrder: 'questionOrder',
    answerKey: 'answerKey',
    sessionTokenHash: 'sessionTokenHash',
    remainingSeconds: 'remainingSeconds',
    lastHeartbeatAt: 'lastHeartbeatAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type AttemptScalarFieldEnum = (typeof AttemptScalarFieldEnum)[keyof typeof AttemptScalarFieldEnum]


  export const AnswerScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    attemptId: 'attemptId',
    questionId: 'questionId',
    value: 'value',
    timeSpentSeconds: 'timeSpentSeconds',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type AnswerScalarFieldEnum = (typeof AnswerScalarFieldEnum)[keyof typeof AnswerScalarFieldEnum]


  export const ProctorEventScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    attemptId: 'attemptId',
    type: 'type',
    metadata: 'metadata',
    occurredAt: 'occurredAt',
    createdAt: 'createdAt'
  };

  export type ProctorEventScalarFieldEnum = (typeof ProctorEventScalarFieldEnum)[keyof typeof ProctorEventScalarFieldEnum]


  export const AssessmentResultScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    assessmentId: 'assessmentId',
    attemptId: 'attemptId',
    candidateId: 'candidateId',
    rawScore: 'rawScore',
    maxScore: 'maxScore',
    passed: 'passed',
    pendingManualReview: 'pendingManualReview',
    perQuestion: 'perQuestion',
    explainability: 'explainability',
    gradedAt: 'gradedAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type AssessmentResultScalarFieldEnum = (typeof AssessmentResultScalarFieldEnum)[keyof typeof AssessmentResultScalarFieldEnum]


  export const QuestionBankScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    name: 'name',
    description: 'description',
    category: 'category',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type QuestionBankScalarFieldEnum = (typeof QuestionBankScalarFieldEnum)[keyof typeof QuestionBankScalarFieldEnum]


  export const QuestionScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    questionBankId: 'questionBankId',
    type: 'type',
    prompt: 'prompt',
    order: 'order',
    required: 'required',
    points: 'points',
    timeLimit: 'timeLimit',
    options: 'options',
    correctAnswer: 'correctAnswer',
    language: 'language',
    starterCode: 'starterCode',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type QuestionScalarFieldEnum = (typeof QuestionScalarFieldEnum)[keyof typeof QuestionScalarFieldEnum]


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
   * Reference to a field of type 'AssessmentStatus'
   */
  export type EnumAssessmentStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AssessmentStatus'>
    


  /**
   * Reference to a field of type 'AssessmentStatus[]'
   */
  export type ListEnumAssessmentStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AssessmentStatus[]'>
    


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
   * Reference to a field of type 'AssessmentInviteStatus'
   */
  export type EnumAssessmentInviteStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AssessmentInviteStatus'>
    


  /**
   * Reference to a field of type 'AssessmentInviteStatus[]'
   */
  export type ListEnumAssessmentInviteStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AssessmentInviteStatus[]'>
    


  /**
   * Reference to a field of type 'AttemptStatus'
   */
  export type EnumAttemptStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AttemptStatus'>
    


  /**
   * Reference to a field of type 'AttemptStatus[]'
   */
  export type ListEnumAttemptStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AttemptStatus[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'QuestionType'
   */
  export type EnumQuestionTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QuestionType'>
    


  /**
   * Reference to a field of type 'QuestionType[]'
   */
  export type ListEnumQuestionTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QuestionType[]'>
    
  /**
   * Deep Input Types
   */


  export type AssessmentWhereInput = {
    AND?: AssessmentWhereInput | AssessmentWhereInput[]
    OR?: AssessmentWhereInput[]
    NOT?: AssessmentWhereInput | AssessmentWhereInput[]
    id?: StringFilter<"Assessment"> | string
    tenantId?: StringFilter<"Assessment"> | string
    requisitionId?: StringNullableFilter<"Assessment"> | string | null
    questionBankId?: StringNullableFilter<"Assessment"> | string | null
    title?: StringFilter<"Assessment"> | string
    description?: StringNullableFilter<"Assessment"> | string | null
    status?: EnumAssessmentStatusFilter<"Assessment"> | $Enums.AssessmentStatus
    durationMinutes?: IntNullableFilter<"Assessment"> | number | null
    passingScore?: IntNullableFilter<"Assessment"> | number | null
    shuffleQuestions?: BoolFilter<"Assessment"> | boolean
    questions?: JsonFilter<"Assessment">
    schemaJson?: JsonFilter<"Assessment">
    version?: IntFilter<"Assessment"> | number
    publishedHash?: StringNullableFilter<"Assessment"> | string | null
    publishedAt?: DateTimeNullableFilter<"Assessment"> | Date | string | null
    createdAt?: DateTimeFilter<"Assessment"> | Date | string
    updatedAt?: DateTimeFilter<"Assessment"> | Date | string
    invites?: AssessmentInviteListRelationFilter
    attempts?: AttemptListRelationFilter
    results?: AssessmentResultListRelationFilter
  }

  export type AssessmentOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    requisitionId?: SortOrderInput | SortOrder
    questionBankId?: SortOrderInput | SortOrder
    title?: SortOrder
    description?: SortOrderInput | SortOrder
    status?: SortOrder
    durationMinutes?: SortOrderInput | SortOrder
    passingScore?: SortOrderInput | SortOrder
    shuffleQuestions?: SortOrder
    questions?: SortOrder
    schemaJson?: SortOrder
    version?: SortOrder
    publishedHash?: SortOrderInput | SortOrder
    publishedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    invites?: AssessmentInviteOrderByRelationAggregateInput
    attempts?: AttemptOrderByRelationAggregateInput
    results?: AssessmentResultOrderByRelationAggregateInput
  }

  export type AssessmentWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: AssessmentWhereInput | AssessmentWhereInput[]
    OR?: AssessmentWhereInput[]
    NOT?: AssessmentWhereInput | AssessmentWhereInput[]
    tenantId?: StringFilter<"Assessment"> | string
    requisitionId?: StringNullableFilter<"Assessment"> | string | null
    questionBankId?: StringNullableFilter<"Assessment"> | string | null
    title?: StringFilter<"Assessment"> | string
    description?: StringNullableFilter<"Assessment"> | string | null
    status?: EnumAssessmentStatusFilter<"Assessment"> | $Enums.AssessmentStatus
    durationMinutes?: IntNullableFilter<"Assessment"> | number | null
    passingScore?: IntNullableFilter<"Assessment"> | number | null
    shuffleQuestions?: BoolFilter<"Assessment"> | boolean
    questions?: JsonFilter<"Assessment">
    schemaJson?: JsonFilter<"Assessment">
    version?: IntFilter<"Assessment"> | number
    publishedHash?: StringNullableFilter<"Assessment"> | string | null
    publishedAt?: DateTimeNullableFilter<"Assessment"> | Date | string | null
    createdAt?: DateTimeFilter<"Assessment"> | Date | string
    updatedAt?: DateTimeFilter<"Assessment"> | Date | string
    invites?: AssessmentInviteListRelationFilter
    attempts?: AttemptListRelationFilter
    results?: AssessmentResultListRelationFilter
  }, "id">

  export type AssessmentOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    requisitionId?: SortOrderInput | SortOrder
    questionBankId?: SortOrderInput | SortOrder
    title?: SortOrder
    description?: SortOrderInput | SortOrder
    status?: SortOrder
    durationMinutes?: SortOrderInput | SortOrder
    passingScore?: SortOrderInput | SortOrder
    shuffleQuestions?: SortOrder
    questions?: SortOrder
    schemaJson?: SortOrder
    version?: SortOrder
    publishedHash?: SortOrderInput | SortOrder
    publishedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: AssessmentCountOrderByAggregateInput
    _avg?: AssessmentAvgOrderByAggregateInput
    _max?: AssessmentMaxOrderByAggregateInput
    _min?: AssessmentMinOrderByAggregateInput
    _sum?: AssessmentSumOrderByAggregateInput
  }

  export type AssessmentScalarWhereWithAggregatesInput = {
    AND?: AssessmentScalarWhereWithAggregatesInput | AssessmentScalarWhereWithAggregatesInput[]
    OR?: AssessmentScalarWhereWithAggregatesInput[]
    NOT?: AssessmentScalarWhereWithAggregatesInput | AssessmentScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Assessment"> | string
    tenantId?: StringWithAggregatesFilter<"Assessment"> | string
    requisitionId?: StringNullableWithAggregatesFilter<"Assessment"> | string | null
    questionBankId?: StringNullableWithAggregatesFilter<"Assessment"> | string | null
    title?: StringWithAggregatesFilter<"Assessment"> | string
    description?: StringNullableWithAggregatesFilter<"Assessment"> | string | null
    status?: EnumAssessmentStatusWithAggregatesFilter<"Assessment"> | $Enums.AssessmentStatus
    durationMinutes?: IntNullableWithAggregatesFilter<"Assessment"> | number | null
    passingScore?: IntNullableWithAggregatesFilter<"Assessment"> | number | null
    shuffleQuestions?: BoolWithAggregatesFilter<"Assessment"> | boolean
    questions?: JsonWithAggregatesFilter<"Assessment">
    schemaJson?: JsonWithAggregatesFilter<"Assessment">
    version?: IntWithAggregatesFilter<"Assessment"> | number
    publishedHash?: StringNullableWithAggregatesFilter<"Assessment"> | string | null
    publishedAt?: DateTimeNullableWithAggregatesFilter<"Assessment"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Assessment"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Assessment"> | Date | string
  }

  export type AssessmentInviteWhereInput = {
    AND?: AssessmentInviteWhereInput | AssessmentInviteWhereInput[]
    OR?: AssessmentInviteWhereInput[]
    NOT?: AssessmentInviteWhereInput | AssessmentInviteWhereInput[]
    id?: StringFilter<"AssessmentInvite"> | string
    tenantId?: StringFilter<"AssessmentInvite"> | string
    assessmentId?: StringFilter<"AssessmentInvite"> | string
    candidateId?: StringFilter<"AssessmentInvite"> | string
    applicationId?: StringNullableFilter<"AssessmentInvite"> | string | null
    tokenHash?: StringFilter<"AssessmentInvite"> | string
    provider?: StringNullableFilter<"AssessmentInvite"> | string | null
    providerInvitationId?: StringNullableFilter<"AssessmentInvite"> | string | null
    providerSecret?: StringNullableFilter<"AssessmentInvite"> | string | null
    email?: StringFilter<"AssessmentInvite"> | string
    status?: EnumAssessmentInviteStatusFilter<"AssessmentInvite"> | $Enums.AssessmentInviteStatus
    expiresAt?: DateTimeNullableFilter<"AssessmentInvite"> | Date | string | null
    sentAt?: DateTimeNullableFilter<"AssessmentInvite"> | Date | string | null
    openedAt?: DateTimeNullableFilter<"AssessmentInvite"> | Date | string | null
    startedAt?: DateTimeNullableFilter<"AssessmentInvite"> | Date | string | null
    submittedAt?: DateTimeNullableFilter<"AssessmentInvite"> | Date | string | null
    consumedAt?: DateTimeNullableFilter<"AssessmentInvite"> | Date | string | null
    createdAt?: DateTimeFilter<"AssessmentInvite"> | Date | string
    updatedAt?: DateTimeFilter<"AssessmentInvite"> | Date | string
    assessment?: XOR<AssessmentScalarRelationFilter, AssessmentWhereInput>
    attempt?: XOR<AttemptNullableScalarRelationFilter, AttemptWhereInput> | null
  }

  export type AssessmentInviteOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    assessmentId?: SortOrder
    candidateId?: SortOrder
    applicationId?: SortOrderInput | SortOrder
    tokenHash?: SortOrder
    provider?: SortOrderInput | SortOrder
    providerInvitationId?: SortOrderInput | SortOrder
    providerSecret?: SortOrderInput | SortOrder
    email?: SortOrder
    status?: SortOrder
    expiresAt?: SortOrderInput | SortOrder
    sentAt?: SortOrderInput | SortOrder
    openedAt?: SortOrderInput | SortOrder
    startedAt?: SortOrderInput | SortOrder
    submittedAt?: SortOrderInput | SortOrder
    consumedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    assessment?: AssessmentOrderByWithRelationInput
    attempt?: AttemptOrderByWithRelationInput
  }

  export type AssessmentInviteWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    tokenHash?: string
    providerInvitationId?: string
    AND?: AssessmentInviteWhereInput | AssessmentInviteWhereInput[]
    OR?: AssessmentInviteWhereInput[]
    NOT?: AssessmentInviteWhereInput | AssessmentInviteWhereInput[]
    tenantId?: StringFilter<"AssessmentInvite"> | string
    assessmentId?: StringFilter<"AssessmentInvite"> | string
    candidateId?: StringFilter<"AssessmentInvite"> | string
    applicationId?: StringNullableFilter<"AssessmentInvite"> | string | null
    provider?: StringNullableFilter<"AssessmentInvite"> | string | null
    providerSecret?: StringNullableFilter<"AssessmentInvite"> | string | null
    email?: StringFilter<"AssessmentInvite"> | string
    status?: EnumAssessmentInviteStatusFilter<"AssessmentInvite"> | $Enums.AssessmentInviteStatus
    expiresAt?: DateTimeNullableFilter<"AssessmentInvite"> | Date | string | null
    sentAt?: DateTimeNullableFilter<"AssessmentInvite"> | Date | string | null
    openedAt?: DateTimeNullableFilter<"AssessmentInvite"> | Date | string | null
    startedAt?: DateTimeNullableFilter<"AssessmentInvite"> | Date | string | null
    submittedAt?: DateTimeNullableFilter<"AssessmentInvite"> | Date | string | null
    consumedAt?: DateTimeNullableFilter<"AssessmentInvite"> | Date | string | null
    createdAt?: DateTimeFilter<"AssessmentInvite"> | Date | string
    updatedAt?: DateTimeFilter<"AssessmentInvite"> | Date | string
    assessment?: XOR<AssessmentScalarRelationFilter, AssessmentWhereInput>
    attempt?: XOR<AttemptNullableScalarRelationFilter, AttemptWhereInput> | null
  }, "id" | "tokenHash" | "providerInvitationId">

  export type AssessmentInviteOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    assessmentId?: SortOrder
    candidateId?: SortOrder
    applicationId?: SortOrderInput | SortOrder
    tokenHash?: SortOrder
    provider?: SortOrderInput | SortOrder
    providerInvitationId?: SortOrderInput | SortOrder
    providerSecret?: SortOrderInput | SortOrder
    email?: SortOrder
    status?: SortOrder
    expiresAt?: SortOrderInput | SortOrder
    sentAt?: SortOrderInput | SortOrder
    openedAt?: SortOrderInput | SortOrder
    startedAt?: SortOrderInput | SortOrder
    submittedAt?: SortOrderInput | SortOrder
    consumedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: AssessmentInviteCountOrderByAggregateInput
    _max?: AssessmentInviteMaxOrderByAggregateInput
    _min?: AssessmentInviteMinOrderByAggregateInput
  }

  export type AssessmentInviteScalarWhereWithAggregatesInput = {
    AND?: AssessmentInviteScalarWhereWithAggregatesInput | AssessmentInviteScalarWhereWithAggregatesInput[]
    OR?: AssessmentInviteScalarWhereWithAggregatesInput[]
    NOT?: AssessmentInviteScalarWhereWithAggregatesInput | AssessmentInviteScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"AssessmentInvite"> | string
    tenantId?: StringWithAggregatesFilter<"AssessmentInvite"> | string
    assessmentId?: StringWithAggregatesFilter<"AssessmentInvite"> | string
    candidateId?: StringWithAggregatesFilter<"AssessmentInvite"> | string
    applicationId?: StringNullableWithAggregatesFilter<"AssessmentInvite"> | string | null
    tokenHash?: StringWithAggregatesFilter<"AssessmentInvite"> | string
    provider?: StringNullableWithAggregatesFilter<"AssessmentInvite"> | string | null
    providerInvitationId?: StringNullableWithAggregatesFilter<"AssessmentInvite"> | string | null
    providerSecret?: StringNullableWithAggregatesFilter<"AssessmentInvite"> | string | null
    email?: StringWithAggregatesFilter<"AssessmentInvite"> | string
    status?: EnumAssessmentInviteStatusWithAggregatesFilter<"AssessmentInvite"> | $Enums.AssessmentInviteStatus
    expiresAt?: DateTimeNullableWithAggregatesFilter<"AssessmentInvite"> | Date | string | null
    sentAt?: DateTimeNullableWithAggregatesFilter<"AssessmentInvite"> | Date | string | null
    openedAt?: DateTimeNullableWithAggregatesFilter<"AssessmentInvite"> | Date | string | null
    startedAt?: DateTimeNullableWithAggregatesFilter<"AssessmentInvite"> | Date | string | null
    submittedAt?: DateTimeNullableWithAggregatesFilter<"AssessmentInvite"> | Date | string | null
    consumedAt?: DateTimeNullableWithAggregatesFilter<"AssessmentInvite"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"AssessmentInvite"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"AssessmentInvite"> | Date | string
  }

  export type AttemptWhereInput = {
    AND?: AttemptWhereInput | AttemptWhereInput[]
    OR?: AttemptWhereInput[]
    NOT?: AttemptWhereInput | AttemptWhereInput[]
    id?: StringFilter<"Attempt"> | string
    tenantId?: StringFilter<"Attempt"> | string
    assessmentId?: StringFilter<"Attempt"> | string
    inviteId?: StringFilter<"Attempt"> | string
    candidateId?: StringFilter<"Attempt"> | string
    status?: EnumAttemptStatusFilter<"Attempt"> | $Enums.AttemptStatus
    startedAt?: DateTimeNullableFilter<"Attempt"> | Date | string | null
    submittedAt?: DateTimeNullableFilter<"Attempt"> | Date | string | null
    durationSeconds?: IntNullableFilter<"Attempt"> | number | null
    questionOrder?: JsonFilter<"Attempt">
    answerKey?: JsonFilter<"Attempt">
    sessionTokenHash?: StringNullableFilter<"Attempt"> | string | null
    remainingSeconds?: IntNullableFilter<"Attempt"> | number | null
    lastHeartbeatAt?: DateTimeNullableFilter<"Attempt"> | Date | string | null
    createdAt?: DateTimeFilter<"Attempt"> | Date | string
    updatedAt?: DateTimeFilter<"Attempt"> | Date | string
    assessment?: XOR<AssessmentScalarRelationFilter, AssessmentWhereInput>
    invite?: XOR<AssessmentInviteScalarRelationFilter, AssessmentInviteWhereInput>
    answers?: AnswerListRelationFilter
    proctorEvents?: ProctorEventListRelationFilter
    result?: XOR<AssessmentResultNullableScalarRelationFilter, AssessmentResultWhereInput> | null
  }

  export type AttemptOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    assessmentId?: SortOrder
    inviteId?: SortOrder
    candidateId?: SortOrder
    status?: SortOrder
    startedAt?: SortOrderInput | SortOrder
    submittedAt?: SortOrderInput | SortOrder
    durationSeconds?: SortOrderInput | SortOrder
    questionOrder?: SortOrder
    answerKey?: SortOrder
    sessionTokenHash?: SortOrderInput | SortOrder
    remainingSeconds?: SortOrderInput | SortOrder
    lastHeartbeatAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    assessment?: AssessmentOrderByWithRelationInput
    invite?: AssessmentInviteOrderByWithRelationInput
    answers?: AnswerOrderByRelationAggregateInput
    proctorEvents?: ProctorEventOrderByRelationAggregateInput
    result?: AssessmentResultOrderByWithRelationInput
  }

  export type AttemptWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    inviteId?: string
    sessionTokenHash?: string
    AND?: AttemptWhereInput | AttemptWhereInput[]
    OR?: AttemptWhereInput[]
    NOT?: AttemptWhereInput | AttemptWhereInput[]
    tenantId?: StringFilter<"Attempt"> | string
    assessmentId?: StringFilter<"Attempt"> | string
    candidateId?: StringFilter<"Attempt"> | string
    status?: EnumAttemptStatusFilter<"Attempt"> | $Enums.AttemptStatus
    startedAt?: DateTimeNullableFilter<"Attempt"> | Date | string | null
    submittedAt?: DateTimeNullableFilter<"Attempt"> | Date | string | null
    durationSeconds?: IntNullableFilter<"Attempt"> | number | null
    questionOrder?: JsonFilter<"Attempt">
    answerKey?: JsonFilter<"Attempt">
    remainingSeconds?: IntNullableFilter<"Attempt"> | number | null
    lastHeartbeatAt?: DateTimeNullableFilter<"Attempt"> | Date | string | null
    createdAt?: DateTimeFilter<"Attempt"> | Date | string
    updatedAt?: DateTimeFilter<"Attempt"> | Date | string
    assessment?: XOR<AssessmentScalarRelationFilter, AssessmentWhereInput>
    invite?: XOR<AssessmentInviteScalarRelationFilter, AssessmentInviteWhereInput>
    answers?: AnswerListRelationFilter
    proctorEvents?: ProctorEventListRelationFilter
    result?: XOR<AssessmentResultNullableScalarRelationFilter, AssessmentResultWhereInput> | null
  }, "id" | "inviteId" | "sessionTokenHash">

  export type AttemptOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    assessmentId?: SortOrder
    inviteId?: SortOrder
    candidateId?: SortOrder
    status?: SortOrder
    startedAt?: SortOrderInput | SortOrder
    submittedAt?: SortOrderInput | SortOrder
    durationSeconds?: SortOrderInput | SortOrder
    questionOrder?: SortOrder
    answerKey?: SortOrder
    sessionTokenHash?: SortOrderInput | SortOrder
    remainingSeconds?: SortOrderInput | SortOrder
    lastHeartbeatAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: AttemptCountOrderByAggregateInput
    _avg?: AttemptAvgOrderByAggregateInput
    _max?: AttemptMaxOrderByAggregateInput
    _min?: AttemptMinOrderByAggregateInput
    _sum?: AttemptSumOrderByAggregateInput
  }

  export type AttemptScalarWhereWithAggregatesInput = {
    AND?: AttemptScalarWhereWithAggregatesInput | AttemptScalarWhereWithAggregatesInput[]
    OR?: AttemptScalarWhereWithAggregatesInput[]
    NOT?: AttemptScalarWhereWithAggregatesInput | AttemptScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Attempt"> | string
    tenantId?: StringWithAggregatesFilter<"Attempt"> | string
    assessmentId?: StringWithAggregatesFilter<"Attempt"> | string
    inviteId?: StringWithAggregatesFilter<"Attempt"> | string
    candidateId?: StringWithAggregatesFilter<"Attempt"> | string
    status?: EnumAttemptStatusWithAggregatesFilter<"Attempt"> | $Enums.AttemptStatus
    startedAt?: DateTimeNullableWithAggregatesFilter<"Attempt"> | Date | string | null
    submittedAt?: DateTimeNullableWithAggregatesFilter<"Attempt"> | Date | string | null
    durationSeconds?: IntNullableWithAggregatesFilter<"Attempt"> | number | null
    questionOrder?: JsonWithAggregatesFilter<"Attempt">
    answerKey?: JsonWithAggregatesFilter<"Attempt">
    sessionTokenHash?: StringNullableWithAggregatesFilter<"Attempt"> | string | null
    remainingSeconds?: IntNullableWithAggregatesFilter<"Attempt"> | number | null
    lastHeartbeatAt?: DateTimeNullableWithAggregatesFilter<"Attempt"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Attempt"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Attempt"> | Date | string
  }

  export type AnswerWhereInput = {
    AND?: AnswerWhereInput | AnswerWhereInput[]
    OR?: AnswerWhereInput[]
    NOT?: AnswerWhereInput | AnswerWhereInput[]
    id?: StringFilter<"Answer"> | string
    tenantId?: StringFilter<"Answer"> | string
    attemptId?: StringFilter<"Answer"> | string
    questionId?: StringFilter<"Answer"> | string
    value?: JsonNullableFilter<"Answer">
    timeSpentSeconds?: IntNullableFilter<"Answer"> | number | null
    createdAt?: DateTimeFilter<"Answer"> | Date | string
    updatedAt?: DateTimeFilter<"Answer"> | Date | string
    attempt?: XOR<AttemptScalarRelationFilter, AttemptWhereInput>
  }

  export type AnswerOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    attemptId?: SortOrder
    questionId?: SortOrder
    value?: SortOrderInput | SortOrder
    timeSpentSeconds?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    attempt?: AttemptOrderByWithRelationInput
  }

  export type AnswerWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    attemptId_questionId?: AnswerAttemptIdQuestionIdCompoundUniqueInput
    AND?: AnswerWhereInput | AnswerWhereInput[]
    OR?: AnswerWhereInput[]
    NOT?: AnswerWhereInput | AnswerWhereInput[]
    tenantId?: StringFilter<"Answer"> | string
    attemptId?: StringFilter<"Answer"> | string
    questionId?: StringFilter<"Answer"> | string
    value?: JsonNullableFilter<"Answer">
    timeSpentSeconds?: IntNullableFilter<"Answer"> | number | null
    createdAt?: DateTimeFilter<"Answer"> | Date | string
    updatedAt?: DateTimeFilter<"Answer"> | Date | string
    attempt?: XOR<AttemptScalarRelationFilter, AttemptWhereInput>
  }, "id" | "attemptId_questionId">

  export type AnswerOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    attemptId?: SortOrder
    questionId?: SortOrder
    value?: SortOrderInput | SortOrder
    timeSpentSeconds?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: AnswerCountOrderByAggregateInput
    _avg?: AnswerAvgOrderByAggregateInput
    _max?: AnswerMaxOrderByAggregateInput
    _min?: AnswerMinOrderByAggregateInput
    _sum?: AnswerSumOrderByAggregateInput
  }

  export type AnswerScalarWhereWithAggregatesInput = {
    AND?: AnswerScalarWhereWithAggregatesInput | AnswerScalarWhereWithAggregatesInput[]
    OR?: AnswerScalarWhereWithAggregatesInput[]
    NOT?: AnswerScalarWhereWithAggregatesInput | AnswerScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Answer"> | string
    tenantId?: StringWithAggregatesFilter<"Answer"> | string
    attemptId?: StringWithAggregatesFilter<"Answer"> | string
    questionId?: StringWithAggregatesFilter<"Answer"> | string
    value?: JsonNullableWithAggregatesFilter<"Answer">
    timeSpentSeconds?: IntNullableWithAggregatesFilter<"Answer"> | number | null
    createdAt?: DateTimeWithAggregatesFilter<"Answer"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Answer"> | Date | string
  }

  export type ProctorEventWhereInput = {
    AND?: ProctorEventWhereInput | ProctorEventWhereInput[]
    OR?: ProctorEventWhereInput[]
    NOT?: ProctorEventWhereInput | ProctorEventWhereInput[]
    id?: StringFilter<"ProctorEvent"> | string
    tenantId?: StringFilter<"ProctorEvent"> | string
    attemptId?: StringFilter<"ProctorEvent"> | string
    type?: StringFilter<"ProctorEvent"> | string
    metadata?: JsonFilter<"ProctorEvent">
    occurredAt?: DateTimeFilter<"ProctorEvent"> | Date | string
    createdAt?: DateTimeFilter<"ProctorEvent"> | Date | string
    attempt?: XOR<AttemptScalarRelationFilter, AttemptWhereInput>
  }

  export type ProctorEventOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    attemptId?: SortOrder
    type?: SortOrder
    metadata?: SortOrder
    occurredAt?: SortOrder
    createdAt?: SortOrder
    attempt?: AttemptOrderByWithRelationInput
  }

  export type ProctorEventWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ProctorEventWhereInput | ProctorEventWhereInput[]
    OR?: ProctorEventWhereInput[]
    NOT?: ProctorEventWhereInput | ProctorEventWhereInput[]
    tenantId?: StringFilter<"ProctorEvent"> | string
    attemptId?: StringFilter<"ProctorEvent"> | string
    type?: StringFilter<"ProctorEvent"> | string
    metadata?: JsonFilter<"ProctorEvent">
    occurredAt?: DateTimeFilter<"ProctorEvent"> | Date | string
    createdAt?: DateTimeFilter<"ProctorEvent"> | Date | string
    attempt?: XOR<AttemptScalarRelationFilter, AttemptWhereInput>
  }, "id">

  export type ProctorEventOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    attemptId?: SortOrder
    type?: SortOrder
    metadata?: SortOrder
    occurredAt?: SortOrder
    createdAt?: SortOrder
    _count?: ProctorEventCountOrderByAggregateInput
    _max?: ProctorEventMaxOrderByAggregateInput
    _min?: ProctorEventMinOrderByAggregateInput
  }

  export type ProctorEventScalarWhereWithAggregatesInput = {
    AND?: ProctorEventScalarWhereWithAggregatesInput | ProctorEventScalarWhereWithAggregatesInput[]
    OR?: ProctorEventScalarWhereWithAggregatesInput[]
    NOT?: ProctorEventScalarWhereWithAggregatesInput | ProctorEventScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ProctorEvent"> | string
    tenantId?: StringWithAggregatesFilter<"ProctorEvent"> | string
    attemptId?: StringWithAggregatesFilter<"ProctorEvent"> | string
    type?: StringWithAggregatesFilter<"ProctorEvent"> | string
    metadata?: JsonWithAggregatesFilter<"ProctorEvent">
    occurredAt?: DateTimeWithAggregatesFilter<"ProctorEvent"> | Date | string
    createdAt?: DateTimeWithAggregatesFilter<"ProctorEvent"> | Date | string
  }

  export type AssessmentResultWhereInput = {
    AND?: AssessmentResultWhereInput | AssessmentResultWhereInput[]
    OR?: AssessmentResultWhereInput[]
    NOT?: AssessmentResultWhereInput | AssessmentResultWhereInput[]
    id?: StringFilter<"AssessmentResult"> | string
    tenantId?: StringFilter<"AssessmentResult"> | string
    assessmentId?: StringFilter<"AssessmentResult"> | string
    attemptId?: StringFilter<"AssessmentResult"> | string
    candidateId?: StringFilter<"AssessmentResult"> | string
    rawScore?: FloatFilter<"AssessmentResult"> | number
    maxScore?: FloatFilter<"AssessmentResult"> | number
    passed?: BoolNullableFilter<"AssessmentResult"> | boolean | null
    pendingManualReview?: BoolFilter<"AssessmentResult"> | boolean
    perQuestion?: JsonFilter<"AssessmentResult">
    explainability?: JsonNullableFilter<"AssessmentResult">
    gradedAt?: DateTimeNullableFilter<"AssessmentResult"> | Date | string | null
    createdAt?: DateTimeFilter<"AssessmentResult"> | Date | string
    updatedAt?: DateTimeFilter<"AssessmentResult"> | Date | string
    assessment?: XOR<AssessmentScalarRelationFilter, AssessmentWhereInput>
    attempt?: XOR<AttemptScalarRelationFilter, AttemptWhereInput>
  }

  export type AssessmentResultOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    assessmentId?: SortOrder
    attemptId?: SortOrder
    candidateId?: SortOrder
    rawScore?: SortOrder
    maxScore?: SortOrder
    passed?: SortOrderInput | SortOrder
    pendingManualReview?: SortOrder
    perQuestion?: SortOrder
    explainability?: SortOrderInput | SortOrder
    gradedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    assessment?: AssessmentOrderByWithRelationInput
    attempt?: AttemptOrderByWithRelationInput
  }

  export type AssessmentResultWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    attemptId?: string
    AND?: AssessmentResultWhereInput | AssessmentResultWhereInput[]
    OR?: AssessmentResultWhereInput[]
    NOT?: AssessmentResultWhereInput | AssessmentResultWhereInput[]
    tenantId?: StringFilter<"AssessmentResult"> | string
    assessmentId?: StringFilter<"AssessmentResult"> | string
    candidateId?: StringFilter<"AssessmentResult"> | string
    rawScore?: FloatFilter<"AssessmentResult"> | number
    maxScore?: FloatFilter<"AssessmentResult"> | number
    passed?: BoolNullableFilter<"AssessmentResult"> | boolean | null
    pendingManualReview?: BoolFilter<"AssessmentResult"> | boolean
    perQuestion?: JsonFilter<"AssessmentResult">
    explainability?: JsonNullableFilter<"AssessmentResult">
    gradedAt?: DateTimeNullableFilter<"AssessmentResult"> | Date | string | null
    createdAt?: DateTimeFilter<"AssessmentResult"> | Date | string
    updatedAt?: DateTimeFilter<"AssessmentResult"> | Date | string
    assessment?: XOR<AssessmentScalarRelationFilter, AssessmentWhereInput>
    attempt?: XOR<AttemptScalarRelationFilter, AttemptWhereInput>
  }, "id" | "attemptId">

  export type AssessmentResultOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    assessmentId?: SortOrder
    attemptId?: SortOrder
    candidateId?: SortOrder
    rawScore?: SortOrder
    maxScore?: SortOrder
    passed?: SortOrderInput | SortOrder
    pendingManualReview?: SortOrder
    perQuestion?: SortOrder
    explainability?: SortOrderInput | SortOrder
    gradedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: AssessmentResultCountOrderByAggregateInput
    _avg?: AssessmentResultAvgOrderByAggregateInput
    _max?: AssessmentResultMaxOrderByAggregateInput
    _min?: AssessmentResultMinOrderByAggregateInput
    _sum?: AssessmentResultSumOrderByAggregateInput
  }

  export type AssessmentResultScalarWhereWithAggregatesInput = {
    AND?: AssessmentResultScalarWhereWithAggregatesInput | AssessmentResultScalarWhereWithAggregatesInput[]
    OR?: AssessmentResultScalarWhereWithAggregatesInput[]
    NOT?: AssessmentResultScalarWhereWithAggregatesInput | AssessmentResultScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"AssessmentResult"> | string
    tenantId?: StringWithAggregatesFilter<"AssessmentResult"> | string
    assessmentId?: StringWithAggregatesFilter<"AssessmentResult"> | string
    attemptId?: StringWithAggregatesFilter<"AssessmentResult"> | string
    candidateId?: StringWithAggregatesFilter<"AssessmentResult"> | string
    rawScore?: FloatWithAggregatesFilter<"AssessmentResult"> | number
    maxScore?: FloatWithAggregatesFilter<"AssessmentResult"> | number
    passed?: BoolNullableWithAggregatesFilter<"AssessmentResult"> | boolean | null
    pendingManualReview?: BoolWithAggregatesFilter<"AssessmentResult"> | boolean
    perQuestion?: JsonWithAggregatesFilter<"AssessmentResult">
    explainability?: JsonNullableWithAggregatesFilter<"AssessmentResult">
    gradedAt?: DateTimeNullableWithAggregatesFilter<"AssessmentResult"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"AssessmentResult"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"AssessmentResult"> | Date | string
  }

  export type QuestionBankWhereInput = {
    AND?: QuestionBankWhereInput | QuestionBankWhereInput[]
    OR?: QuestionBankWhereInput[]
    NOT?: QuestionBankWhereInput | QuestionBankWhereInput[]
    id?: StringFilter<"QuestionBank"> | string
    tenantId?: StringNullableFilter<"QuestionBank"> | string | null
    name?: StringFilter<"QuestionBank"> | string
    description?: StringNullableFilter<"QuestionBank"> | string | null
    category?: StringNullableFilter<"QuestionBank"> | string | null
    createdAt?: DateTimeFilter<"QuestionBank"> | Date | string
    updatedAt?: DateTimeFilter<"QuestionBank"> | Date | string
    questions?: QuestionListRelationFilter
  }

  export type QuestionBankOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrderInput | SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    category?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    questions?: QuestionOrderByRelationAggregateInput
  }

  export type QuestionBankWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: QuestionBankWhereInput | QuestionBankWhereInput[]
    OR?: QuestionBankWhereInput[]
    NOT?: QuestionBankWhereInput | QuestionBankWhereInput[]
    tenantId?: StringNullableFilter<"QuestionBank"> | string | null
    name?: StringFilter<"QuestionBank"> | string
    description?: StringNullableFilter<"QuestionBank"> | string | null
    category?: StringNullableFilter<"QuestionBank"> | string | null
    createdAt?: DateTimeFilter<"QuestionBank"> | Date | string
    updatedAt?: DateTimeFilter<"QuestionBank"> | Date | string
    questions?: QuestionListRelationFilter
  }, "id">

  export type QuestionBankOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrderInput | SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    category?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: QuestionBankCountOrderByAggregateInput
    _max?: QuestionBankMaxOrderByAggregateInput
    _min?: QuestionBankMinOrderByAggregateInput
  }

  export type QuestionBankScalarWhereWithAggregatesInput = {
    AND?: QuestionBankScalarWhereWithAggregatesInput | QuestionBankScalarWhereWithAggregatesInput[]
    OR?: QuestionBankScalarWhereWithAggregatesInput[]
    NOT?: QuestionBankScalarWhereWithAggregatesInput | QuestionBankScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"QuestionBank"> | string
    tenantId?: StringNullableWithAggregatesFilter<"QuestionBank"> | string | null
    name?: StringWithAggregatesFilter<"QuestionBank"> | string
    description?: StringNullableWithAggregatesFilter<"QuestionBank"> | string | null
    category?: StringNullableWithAggregatesFilter<"QuestionBank"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"QuestionBank"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"QuestionBank"> | Date | string
  }

  export type QuestionWhereInput = {
    AND?: QuestionWhereInput | QuestionWhereInput[]
    OR?: QuestionWhereInput[]
    NOT?: QuestionWhereInput | QuestionWhereInput[]
    id?: StringFilter<"Question"> | string
    tenantId?: StringNullableFilter<"Question"> | string | null
    questionBankId?: StringFilter<"Question"> | string
    type?: EnumQuestionTypeFilter<"Question"> | $Enums.QuestionType
    prompt?: StringFilter<"Question"> | string
    order?: IntFilter<"Question"> | number
    required?: BoolFilter<"Question"> | boolean
    points?: IntFilter<"Question"> | number
    timeLimit?: IntNullableFilter<"Question"> | number | null
    options?: JsonNullableFilter<"Question">
    correctAnswer?: JsonNullableFilter<"Question">
    language?: StringNullableFilter<"Question"> | string | null
    starterCode?: StringNullableFilter<"Question"> | string | null
    createdAt?: DateTimeFilter<"Question"> | Date | string
    updatedAt?: DateTimeFilter<"Question"> | Date | string
    questionBank?: XOR<QuestionBankScalarRelationFilter, QuestionBankWhereInput>
  }

  export type QuestionOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrderInput | SortOrder
    questionBankId?: SortOrder
    type?: SortOrder
    prompt?: SortOrder
    order?: SortOrder
    required?: SortOrder
    points?: SortOrder
    timeLimit?: SortOrderInput | SortOrder
    options?: SortOrderInput | SortOrder
    correctAnswer?: SortOrderInput | SortOrder
    language?: SortOrderInput | SortOrder
    starterCode?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    questionBank?: QuestionBankOrderByWithRelationInput
  }

  export type QuestionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: QuestionWhereInput | QuestionWhereInput[]
    OR?: QuestionWhereInput[]
    NOT?: QuestionWhereInput | QuestionWhereInput[]
    tenantId?: StringNullableFilter<"Question"> | string | null
    questionBankId?: StringFilter<"Question"> | string
    type?: EnumQuestionTypeFilter<"Question"> | $Enums.QuestionType
    prompt?: StringFilter<"Question"> | string
    order?: IntFilter<"Question"> | number
    required?: BoolFilter<"Question"> | boolean
    points?: IntFilter<"Question"> | number
    timeLimit?: IntNullableFilter<"Question"> | number | null
    options?: JsonNullableFilter<"Question">
    correctAnswer?: JsonNullableFilter<"Question">
    language?: StringNullableFilter<"Question"> | string | null
    starterCode?: StringNullableFilter<"Question"> | string | null
    createdAt?: DateTimeFilter<"Question"> | Date | string
    updatedAt?: DateTimeFilter<"Question"> | Date | string
    questionBank?: XOR<QuestionBankScalarRelationFilter, QuestionBankWhereInput>
  }, "id">

  export type QuestionOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrderInput | SortOrder
    questionBankId?: SortOrder
    type?: SortOrder
    prompt?: SortOrder
    order?: SortOrder
    required?: SortOrder
    points?: SortOrder
    timeLimit?: SortOrderInput | SortOrder
    options?: SortOrderInput | SortOrder
    correctAnswer?: SortOrderInput | SortOrder
    language?: SortOrderInput | SortOrder
    starterCode?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: QuestionCountOrderByAggregateInput
    _avg?: QuestionAvgOrderByAggregateInput
    _max?: QuestionMaxOrderByAggregateInput
    _min?: QuestionMinOrderByAggregateInput
    _sum?: QuestionSumOrderByAggregateInput
  }

  export type QuestionScalarWhereWithAggregatesInput = {
    AND?: QuestionScalarWhereWithAggregatesInput | QuestionScalarWhereWithAggregatesInput[]
    OR?: QuestionScalarWhereWithAggregatesInput[]
    NOT?: QuestionScalarWhereWithAggregatesInput | QuestionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Question"> | string
    tenantId?: StringNullableWithAggregatesFilter<"Question"> | string | null
    questionBankId?: StringWithAggregatesFilter<"Question"> | string
    type?: EnumQuestionTypeWithAggregatesFilter<"Question"> | $Enums.QuestionType
    prompt?: StringWithAggregatesFilter<"Question"> | string
    order?: IntWithAggregatesFilter<"Question"> | number
    required?: BoolWithAggregatesFilter<"Question"> | boolean
    points?: IntWithAggregatesFilter<"Question"> | number
    timeLimit?: IntNullableWithAggregatesFilter<"Question"> | number | null
    options?: JsonNullableWithAggregatesFilter<"Question">
    correctAnswer?: JsonNullableWithAggregatesFilter<"Question">
    language?: StringNullableWithAggregatesFilter<"Question"> | string | null
    starterCode?: StringNullableWithAggregatesFilter<"Question"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Question"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Question"> | Date | string
  }

  export type AssessmentCreateInput = {
    id?: string
    tenantId: string
    requisitionId?: string | null
    questionBankId?: string | null
    title: string
    description?: string | null
    status?: $Enums.AssessmentStatus
    durationMinutes?: number | null
    passingScore?: number | null
    shuffleQuestions?: boolean
    questions?: JsonNullValueInput | InputJsonValue
    schemaJson?: JsonNullValueInput | InputJsonValue
    version?: number
    publishedHash?: string | null
    publishedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    invites?: AssessmentInviteCreateNestedManyWithoutAssessmentInput
    attempts?: AttemptCreateNestedManyWithoutAssessmentInput
    results?: AssessmentResultCreateNestedManyWithoutAssessmentInput
  }

  export type AssessmentUncheckedCreateInput = {
    id?: string
    tenantId: string
    requisitionId?: string | null
    questionBankId?: string | null
    title: string
    description?: string | null
    status?: $Enums.AssessmentStatus
    durationMinutes?: number | null
    passingScore?: number | null
    shuffleQuestions?: boolean
    questions?: JsonNullValueInput | InputJsonValue
    schemaJson?: JsonNullValueInput | InputJsonValue
    version?: number
    publishedHash?: string | null
    publishedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    invites?: AssessmentInviteUncheckedCreateNestedManyWithoutAssessmentInput
    attempts?: AttemptUncheckedCreateNestedManyWithoutAssessmentInput
    results?: AssessmentResultUncheckedCreateNestedManyWithoutAssessmentInput
  }

  export type AssessmentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    requisitionId?: NullableStringFieldUpdateOperationsInput | string | null
    questionBankId?: NullableStringFieldUpdateOperationsInput | string | null
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumAssessmentStatusFieldUpdateOperationsInput | $Enums.AssessmentStatus
    durationMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    passingScore?: NullableIntFieldUpdateOperationsInput | number | null
    shuffleQuestions?: BoolFieldUpdateOperationsInput | boolean
    questions?: JsonNullValueInput | InputJsonValue
    schemaJson?: JsonNullValueInput | InputJsonValue
    version?: IntFieldUpdateOperationsInput | number
    publishedHash?: NullableStringFieldUpdateOperationsInput | string | null
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    invites?: AssessmentInviteUpdateManyWithoutAssessmentNestedInput
    attempts?: AttemptUpdateManyWithoutAssessmentNestedInput
    results?: AssessmentResultUpdateManyWithoutAssessmentNestedInput
  }

  export type AssessmentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    requisitionId?: NullableStringFieldUpdateOperationsInput | string | null
    questionBankId?: NullableStringFieldUpdateOperationsInput | string | null
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumAssessmentStatusFieldUpdateOperationsInput | $Enums.AssessmentStatus
    durationMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    passingScore?: NullableIntFieldUpdateOperationsInput | number | null
    shuffleQuestions?: BoolFieldUpdateOperationsInput | boolean
    questions?: JsonNullValueInput | InputJsonValue
    schemaJson?: JsonNullValueInput | InputJsonValue
    version?: IntFieldUpdateOperationsInput | number
    publishedHash?: NullableStringFieldUpdateOperationsInput | string | null
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    invites?: AssessmentInviteUncheckedUpdateManyWithoutAssessmentNestedInput
    attempts?: AttemptUncheckedUpdateManyWithoutAssessmentNestedInput
    results?: AssessmentResultUncheckedUpdateManyWithoutAssessmentNestedInput
  }

  export type AssessmentCreateManyInput = {
    id?: string
    tenantId: string
    requisitionId?: string | null
    questionBankId?: string | null
    title: string
    description?: string | null
    status?: $Enums.AssessmentStatus
    durationMinutes?: number | null
    passingScore?: number | null
    shuffleQuestions?: boolean
    questions?: JsonNullValueInput | InputJsonValue
    schemaJson?: JsonNullValueInput | InputJsonValue
    version?: number
    publishedHash?: string | null
    publishedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AssessmentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    requisitionId?: NullableStringFieldUpdateOperationsInput | string | null
    questionBankId?: NullableStringFieldUpdateOperationsInput | string | null
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumAssessmentStatusFieldUpdateOperationsInput | $Enums.AssessmentStatus
    durationMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    passingScore?: NullableIntFieldUpdateOperationsInput | number | null
    shuffleQuestions?: BoolFieldUpdateOperationsInput | boolean
    questions?: JsonNullValueInput | InputJsonValue
    schemaJson?: JsonNullValueInput | InputJsonValue
    version?: IntFieldUpdateOperationsInput | number
    publishedHash?: NullableStringFieldUpdateOperationsInput | string | null
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AssessmentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    requisitionId?: NullableStringFieldUpdateOperationsInput | string | null
    questionBankId?: NullableStringFieldUpdateOperationsInput | string | null
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumAssessmentStatusFieldUpdateOperationsInput | $Enums.AssessmentStatus
    durationMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    passingScore?: NullableIntFieldUpdateOperationsInput | number | null
    shuffleQuestions?: BoolFieldUpdateOperationsInput | boolean
    questions?: JsonNullValueInput | InputJsonValue
    schemaJson?: JsonNullValueInput | InputJsonValue
    version?: IntFieldUpdateOperationsInput | number
    publishedHash?: NullableStringFieldUpdateOperationsInput | string | null
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AssessmentInviteCreateInput = {
    id?: string
    tenantId: string
    candidateId: string
    applicationId?: string | null
    tokenHash: string
    provider?: string | null
    providerInvitationId?: string | null
    providerSecret?: string | null
    email: string
    status?: $Enums.AssessmentInviteStatus
    expiresAt?: Date | string | null
    sentAt?: Date | string | null
    openedAt?: Date | string | null
    startedAt?: Date | string | null
    submittedAt?: Date | string | null
    consumedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    assessment: AssessmentCreateNestedOneWithoutInvitesInput
    attempt?: AttemptCreateNestedOneWithoutInviteInput
  }

  export type AssessmentInviteUncheckedCreateInput = {
    id?: string
    tenantId: string
    assessmentId: string
    candidateId: string
    applicationId?: string | null
    tokenHash: string
    provider?: string | null
    providerInvitationId?: string | null
    providerSecret?: string | null
    email: string
    status?: $Enums.AssessmentInviteStatus
    expiresAt?: Date | string | null
    sentAt?: Date | string | null
    openedAt?: Date | string | null
    startedAt?: Date | string | null
    submittedAt?: Date | string | null
    consumedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    attempt?: AttemptUncheckedCreateNestedOneWithoutInviteInput
  }

  export type AssessmentInviteUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    applicationId?: NullableStringFieldUpdateOperationsInput | string | null
    tokenHash?: StringFieldUpdateOperationsInput | string
    provider?: NullableStringFieldUpdateOperationsInput | string | null
    providerInvitationId?: NullableStringFieldUpdateOperationsInput | string | null
    providerSecret?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    status?: EnumAssessmentInviteStatusFieldUpdateOperationsInput | $Enums.AssessmentInviteStatus
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    openedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    submittedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    consumedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    assessment?: AssessmentUpdateOneRequiredWithoutInvitesNestedInput
    attempt?: AttemptUpdateOneWithoutInviteNestedInput
  }

  export type AssessmentInviteUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    assessmentId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    applicationId?: NullableStringFieldUpdateOperationsInput | string | null
    tokenHash?: StringFieldUpdateOperationsInput | string
    provider?: NullableStringFieldUpdateOperationsInput | string | null
    providerInvitationId?: NullableStringFieldUpdateOperationsInput | string | null
    providerSecret?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    status?: EnumAssessmentInviteStatusFieldUpdateOperationsInput | $Enums.AssessmentInviteStatus
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    openedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    submittedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    consumedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    attempt?: AttemptUncheckedUpdateOneWithoutInviteNestedInput
  }

  export type AssessmentInviteCreateManyInput = {
    id?: string
    tenantId: string
    assessmentId: string
    candidateId: string
    applicationId?: string | null
    tokenHash: string
    provider?: string | null
    providerInvitationId?: string | null
    providerSecret?: string | null
    email: string
    status?: $Enums.AssessmentInviteStatus
    expiresAt?: Date | string | null
    sentAt?: Date | string | null
    openedAt?: Date | string | null
    startedAt?: Date | string | null
    submittedAt?: Date | string | null
    consumedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AssessmentInviteUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    applicationId?: NullableStringFieldUpdateOperationsInput | string | null
    tokenHash?: StringFieldUpdateOperationsInput | string
    provider?: NullableStringFieldUpdateOperationsInput | string | null
    providerInvitationId?: NullableStringFieldUpdateOperationsInput | string | null
    providerSecret?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    status?: EnumAssessmentInviteStatusFieldUpdateOperationsInput | $Enums.AssessmentInviteStatus
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    openedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    submittedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    consumedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AssessmentInviteUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    assessmentId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    applicationId?: NullableStringFieldUpdateOperationsInput | string | null
    tokenHash?: StringFieldUpdateOperationsInput | string
    provider?: NullableStringFieldUpdateOperationsInput | string | null
    providerInvitationId?: NullableStringFieldUpdateOperationsInput | string | null
    providerSecret?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    status?: EnumAssessmentInviteStatusFieldUpdateOperationsInput | $Enums.AssessmentInviteStatus
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    openedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    submittedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    consumedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AttemptCreateInput = {
    id?: string
    tenantId: string
    candidateId: string
    status?: $Enums.AttemptStatus
    startedAt?: Date | string | null
    submittedAt?: Date | string | null
    durationSeconds?: number | null
    questionOrder?: JsonNullValueInput | InputJsonValue
    answerKey?: JsonNullValueInput | InputJsonValue
    sessionTokenHash?: string | null
    remainingSeconds?: number | null
    lastHeartbeatAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    assessment: AssessmentCreateNestedOneWithoutAttemptsInput
    invite: AssessmentInviteCreateNestedOneWithoutAttemptInput
    answers?: AnswerCreateNestedManyWithoutAttemptInput
    proctorEvents?: ProctorEventCreateNestedManyWithoutAttemptInput
    result?: AssessmentResultCreateNestedOneWithoutAttemptInput
  }

  export type AttemptUncheckedCreateInput = {
    id?: string
    tenantId: string
    assessmentId: string
    inviteId: string
    candidateId: string
    status?: $Enums.AttemptStatus
    startedAt?: Date | string | null
    submittedAt?: Date | string | null
    durationSeconds?: number | null
    questionOrder?: JsonNullValueInput | InputJsonValue
    answerKey?: JsonNullValueInput | InputJsonValue
    sessionTokenHash?: string | null
    remainingSeconds?: number | null
    lastHeartbeatAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    answers?: AnswerUncheckedCreateNestedManyWithoutAttemptInput
    proctorEvents?: ProctorEventUncheckedCreateNestedManyWithoutAttemptInput
    result?: AssessmentResultUncheckedCreateNestedOneWithoutAttemptInput
  }

  export type AttemptUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    status?: EnumAttemptStatusFieldUpdateOperationsInput | $Enums.AttemptStatus
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    submittedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    durationSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    questionOrder?: JsonNullValueInput | InputJsonValue
    answerKey?: JsonNullValueInput | InputJsonValue
    sessionTokenHash?: NullableStringFieldUpdateOperationsInput | string | null
    remainingSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    lastHeartbeatAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    assessment?: AssessmentUpdateOneRequiredWithoutAttemptsNestedInput
    invite?: AssessmentInviteUpdateOneRequiredWithoutAttemptNestedInput
    answers?: AnswerUpdateManyWithoutAttemptNestedInput
    proctorEvents?: ProctorEventUpdateManyWithoutAttemptNestedInput
    result?: AssessmentResultUpdateOneWithoutAttemptNestedInput
  }

  export type AttemptUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    assessmentId?: StringFieldUpdateOperationsInput | string
    inviteId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    status?: EnumAttemptStatusFieldUpdateOperationsInput | $Enums.AttemptStatus
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    submittedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    durationSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    questionOrder?: JsonNullValueInput | InputJsonValue
    answerKey?: JsonNullValueInput | InputJsonValue
    sessionTokenHash?: NullableStringFieldUpdateOperationsInput | string | null
    remainingSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    lastHeartbeatAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    answers?: AnswerUncheckedUpdateManyWithoutAttemptNestedInput
    proctorEvents?: ProctorEventUncheckedUpdateManyWithoutAttemptNestedInput
    result?: AssessmentResultUncheckedUpdateOneWithoutAttemptNestedInput
  }

  export type AttemptCreateManyInput = {
    id?: string
    tenantId: string
    assessmentId: string
    inviteId: string
    candidateId: string
    status?: $Enums.AttemptStatus
    startedAt?: Date | string | null
    submittedAt?: Date | string | null
    durationSeconds?: number | null
    questionOrder?: JsonNullValueInput | InputJsonValue
    answerKey?: JsonNullValueInput | InputJsonValue
    sessionTokenHash?: string | null
    remainingSeconds?: number | null
    lastHeartbeatAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AttemptUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    status?: EnumAttemptStatusFieldUpdateOperationsInput | $Enums.AttemptStatus
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    submittedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    durationSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    questionOrder?: JsonNullValueInput | InputJsonValue
    answerKey?: JsonNullValueInput | InputJsonValue
    sessionTokenHash?: NullableStringFieldUpdateOperationsInput | string | null
    remainingSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    lastHeartbeatAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AttemptUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    assessmentId?: StringFieldUpdateOperationsInput | string
    inviteId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    status?: EnumAttemptStatusFieldUpdateOperationsInput | $Enums.AttemptStatus
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    submittedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    durationSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    questionOrder?: JsonNullValueInput | InputJsonValue
    answerKey?: JsonNullValueInput | InputJsonValue
    sessionTokenHash?: NullableStringFieldUpdateOperationsInput | string | null
    remainingSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    lastHeartbeatAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AnswerCreateInput = {
    id?: string
    tenantId: string
    questionId: string
    value?: NullableJsonNullValueInput | InputJsonValue
    timeSpentSeconds?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    attempt: AttemptCreateNestedOneWithoutAnswersInput
  }

  export type AnswerUncheckedCreateInput = {
    id?: string
    tenantId: string
    attemptId: string
    questionId: string
    value?: NullableJsonNullValueInput | InputJsonValue
    timeSpentSeconds?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AnswerUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    questionId?: StringFieldUpdateOperationsInput | string
    value?: NullableJsonNullValueInput | InputJsonValue
    timeSpentSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    attempt?: AttemptUpdateOneRequiredWithoutAnswersNestedInput
  }

  export type AnswerUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    attemptId?: StringFieldUpdateOperationsInput | string
    questionId?: StringFieldUpdateOperationsInput | string
    value?: NullableJsonNullValueInput | InputJsonValue
    timeSpentSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AnswerCreateManyInput = {
    id?: string
    tenantId: string
    attemptId: string
    questionId: string
    value?: NullableJsonNullValueInput | InputJsonValue
    timeSpentSeconds?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AnswerUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    questionId?: StringFieldUpdateOperationsInput | string
    value?: NullableJsonNullValueInput | InputJsonValue
    timeSpentSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AnswerUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    attemptId?: StringFieldUpdateOperationsInput | string
    questionId?: StringFieldUpdateOperationsInput | string
    value?: NullableJsonNullValueInput | InputJsonValue
    timeSpentSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProctorEventCreateInput = {
    id?: string
    tenantId: string
    type: string
    metadata?: JsonNullValueInput | InputJsonValue
    occurredAt?: Date | string
    createdAt?: Date | string
    attempt: AttemptCreateNestedOneWithoutProctorEventsInput
  }

  export type ProctorEventUncheckedCreateInput = {
    id?: string
    tenantId: string
    attemptId: string
    type: string
    metadata?: JsonNullValueInput | InputJsonValue
    occurredAt?: Date | string
    createdAt?: Date | string
  }

  export type ProctorEventUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    metadata?: JsonNullValueInput | InputJsonValue
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    attempt?: AttemptUpdateOneRequiredWithoutProctorEventsNestedInput
  }

  export type ProctorEventUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    attemptId?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    metadata?: JsonNullValueInput | InputJsonValue
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProctorEventCreateManyInput = {
    id?: string
    tenantId: string
    attemptId: string
    type: string
    metadata?: JsonNullValueInput | InputJsonValue
    occurredAt?: Date | string
    createdAt?: Date | string
  }

  export type ProctorEventUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    metadata?: JsonNullValueInput | InputJsonValue
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProctorEventUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    attemptId?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    metadata?: JsonNullValueInput | InputJsonValue
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AssessmentResultCreateInput = {
    id?: string
    tenantId: string
    candidateId: string
    rawScore: number
    maxScore: number
    passed?: boolean | null
    pendingManualReview?: boolean
    perQuestion?: JsonNullValueInput | InputJsonValue
    explainability?: NullableJsonNullValueInput | InputJsonValue
    gradedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    assessment: AssessmentCreateNestedOneWithoutResultsInput
    attempt: AttemptCreateNestedOneWithoutResultInput
  }

  export type AssessmentResultUncheckedCreateInput = {
    id?: string
    tenantId: string
    assessmentId: string
    attemptId: string
    candidateId: string
    rawScore: number
    maxScore: number
    passed?: boolean | null
    pendingManualReview?: boolean
    perQuestion?: JsonNullValueInput | InputJsonValue
    explainability?: NullableJsonNullValueInput | InputJsonValue
    gradedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AssessmentResultUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    rawScore?: FloatFieldUpdateOperationsInput | number
    maxScore?: FloatFieldUpdateOperationsInput | number
    passed?: NullableBoolFieldUpdateOperationsInput | boolean | null
    pendingManualReview?: BoolFieldUpdateOperationsInput | boolean
    perQuestion?: JsonNullValueInput | InputJsonValue
    explainability?: NullableJsonNullValueInput | InputJsonValue
    gradedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    assessment?: AssessmentUpdateOneRequiredWithoutResultsNestedInput
    attempt?: AttemptUpdateOneRequiredWithoutResultNestedInput
  }

  export type AssessmentResultUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    assessmentId?: StringFieldUpdateOperationsInput | string
    attemptId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    rawScore?: FloatFieldUpdateOperationsInput | number
    maxScore?: FloatFieldUpdateOperationsInput | number
    passed?: NullableBoolFieldUpdateOperationsInput | boolean | null
    pendingManualReview?: BoolFieldUpdateOperationsInput | boolean
    perQuestion?: JsonNullValueInput | InputJsonValue
    explainability?: NullableJsonNullValueInput | InputJsonValue
    gradedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AssessmentResultCreateManyInput = {
    id?: string
    tenantId: string
    assessmentId: string
    attemptId: string
    candidateId: string
    rawScore: number
    maxScore: number
    passed?: boolean | null
    pendingManualReview?: boolean
    perQuestion?: JsonNullValueInput | InputJsonValue
    explainability?: NullableJsonNullValueInput | InputJsonValue
    gradedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AssessmentResultUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    rawScore?: FloatFieldUpdateOperationsInput | number
    maxScore?: FloatFieldUpdateOperationsInput | number
    passed?: NullableBoolFieldUpdateOperationsInput | boolean | null
    pendingManualReview?: BoolFieldUpdateOperationsInput | boolean
    perQuestion?: JsonNullValueInput | InputJsonValue
    explainability?: NullableJsonNullValueInput | InputJsonValue
    gradedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AssessmentResultUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    assessmentId?: StringFieldUpdateOperationsInput | string
    attemptId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    rawScore?: FloatFieldUpdateOperationsInput | number
    maxScore?: FloatFieldUpdateOperationsInput | number
    passed?: NullableBoolFieldUpdateOperationsInput | boolean | null
    pendingManualReview?: BoolFieldUpdateOperationsInput | boolean
    perQuestion?: JsonNullValueInput | InputJsonValue
    explainability?: NullableJsonNullValueInput | InputJsonValue
    gradedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type QuestionBankCreateInput = {
    id?: string
    tenantId?: string | null
    name: string
    description?: string | null
    category?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    questions?: QuestionCreateNestedManyWithoutQuestionBankInput
  }

  export type QuestionBankUncheckedCreateInput = {
    id?: string
    tenantId?: string | null
    name: string
    description?: string | null
    category?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    questions?: QuestionUncheckedCreateNestedManyWithoutQuestionBankInput
  }

  export type QuestionBankUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    questions?: QuestionUpdateManyWithoutQuestionBankNestedInput
  }

  export type QuestionBankUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    questions?: QuestionUncheckedUpdateManyWithoutQuestionBankNestedInput
  }

  export type QuestionBankCreateManyInput = {
    id?: string
    tenantId?: string | null
    name: string
    description?: string | null
    category?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type QuestionBankUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type QuestionBankUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type QuestionCreateInput = {
    id?: string
    tenantId?: string | null
    type: $Enums.QuestionType
    prompt: string
    order?: number
    required?: boolean
    points?: number
    timeLimit?: number | null
    options?: NullableJsonNullValueInput | InputJsonValue
    correctAnswer?: NullableJsonNullValueInput | InputJsonValue
    language?: string | null
    starterCode?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    questionBank: QuestionBankCreateNestedOneWithoutQuestionsInput
  }

  export type QuestionUncheckedCreateInput = {
    id?: string
    tenantId?: string | null
    questionBankId: string
    type: $Enums.QuestionType
    prompt: string
    order?: number
    required?: boolean
    points?: number
    timeLimit?: number | null
    options?: NullableJsonNullValueInput | InputJsonValue
    correctAnswer?: NullableJsonNullValueInput | InputJsonValue
    language?: string | null
    starterCode?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type QuestionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumQuestionTypeFieldUpdateOperationsInput | $Enums.QuestionType
    prompt?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    required?: BoolFieldUpdateOperationsInput | boolean
    points?: IntFieldUpdateOperationsInput | number
    timeLimit?: NullableIntFieldUpdateOperationsInput | number | null
    options?: NullableJsonNullValueInput | InputJsonValue
    correctAnswer?: NullableJsonNullValueInput | InputJsonValue
    language?: NullableStringFieldUpdateOperationsInput | string | null
    starterCode?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    questionBank?: QuestionBankUpdateOneRequiredWithoutQuestionsNestedInput
  }

  export type QuestionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    questionBankId?: StringFieldUpdateOperationsInput | string
    type?: EnumQuestionTypeFieldUpdateOperationsInput | $Enums.QuestionType
    prompt?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    required?: BoolFieldUpdateOperationsInput | boolean
    points?: IntFieldUpdateOperationsInput | number
    timeLimit?: NullableIntFieldUpdateOperationsInput | number | null
    options?: NullableJsonNullValueInput | InputJsonValue
    correctAnswer?: NullableJsonNullValueInput | InputJsonValue
    language?: NullableStringFieldUpdateOperationsInput | string | null
    starterCode?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type QuestionCreateManyInput = {
    id?: string
    tenantId?: string | null
    questionBankId: string
    type: $Enums.QuestionType
    prompt: string
    order?: number
    required?: boolean
    points?: number
    timeLimit?: number | null
    options?: NullableJsonNullValueInput | InputJsonValue
    correctAnswer?: NullableJsonNullValueInput | InputJsonValue
    language?: string | null
    starterCode?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type QuestionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumQuestionTypeFieldUpdateOperationsInput | $Enums.QuestionType
    prompt?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    required?: BoolFieldUpdateOperationsInput | boolean
    points?: IntFieldUpdateOperationsInput | number
    timeLimit?: NullableIntFieldUpdateOperationsInput | number | null
    options?: NullableJsonNullValueInput | InputJsonValue
    correctAnswer?: NullableJsonNullValueInput | InputJsonValue
    language?: NullableStringFieldUpdateOperationsInput | string | null
    starterCode?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type QuestionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    questionBankId?: StringFieldUpdateOperationsInput | string
    type?: EnumQuestionTypeFieldUpdateOperationsInput | $Enums.QuestionType
    prompt?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    required?: BoolFieldUpdateOperationsInput | boolean
    points?: IntFieldUpdateOperationsInput | number
    timeLimit?: NullableIntFieldUpdateOperationsInput | number | null
    options?: NullableJsonNullValueInput | InputJsonValue
    correctAnswer?: NullableJsonNullValueInput | InputJsonValue
    language?: NullableStringFieldUpdateOperationsInput | string | null
    starterCode?: NullableStringFieldUpdateOperationsInput | string | null
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

  export type EnumAssessmentStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.AssessmentStatus | EnumAssessmentStatusFieldRefInput<$PrismaModel>
    in?: $Enums.AssessmentStatus[] | ListEnumAssessmentStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.AssessmentStatus[] | ListEnumAssessmentStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumAssessmentStatusFilter<$PrismaModel> | $Enums.AssessmentStatus
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

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
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

  export type AssessmentInviteListRelationFilter = {
    every?: AssessmentInviteWhereInput
    some?: AssessmentInviteWhereInput
    none?: AssessmentInviteWhereInput
  }

  export type AttemptListRelationFilter = {
    every?: AttemptWhereInput
    some?: AttemptWhereInput
    none?: AttemptWhereInput
  }

  export type AssessmentResultListRelationFilter = {
    every?: AssessmentResultWhereInput
    some?: AssessmentResultWhereInput
    none?: AssessmentResultWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type AssessmentInviteOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AttemptOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AssessmentResultOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AssessmentCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    requisitionId?: SortOrder
    questionBankId?: SortOrder
    title?: SortOrder
    description?: SortOrder
    status?: SortOrder
    durationMinutes?: SortOrder
    passingScore?: SortOrder
    shuffleQuestions?: SortOrder
    questions?: SortOrder
    schemaJson?: SortOrder
    version?: SortOrder
    publishedHash?: SortOrder
    publishedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AssessmentAvgOrderByAggregateInput = {
    durationMinutes?: SortOrder
    passingScore?: SortOrder
    version?: SortOrder
  }

  export type AssessmentMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    requisitionId?: SortOrder
    questionBankId?: SortOrder
    title?: SortOrder
    description?: SortOrder
    status?: SortOrder
    durationMinutes?: SortOrder
    passingScore?: SortOrder
    shuffleQuestions?: SortOrder
    version?: SortOrder
    publishedHash?: SortOrder
    publishedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AssessmentMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    requisitionId?: SortOrder
    questionBankId?: SortOrder
    title?: SortOrder
    description?: SortOrder
    status?: SortOrder
    durationMinutes?: SortOrder
    passingScore?: SortOrder
    shuffleQuestions?: SortOrder
    version?: SortOrder
    publishedHash?: SortOrder
    publishedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AssessmentSumOrderByAggregateInput = {
    durationMinutes?: SortOrder
    passingScore?: SortOrder
    version?: SortOrder
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

  export type EnumAssessmentStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AssessmentStatus | EnumAssessmentStatusFieldRefInput<$PrismaModel>
    in?: $Enums.AssessmentStatus[] | ListEnumAssessmentStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.AssessmentStatus[] | ListEnumAssessmentStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumAssessmentStatusWithAggregatesFilter<$PrismaModel> | $Enums.AssessmentStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAssessmentStatusFilter<$PrismaModel>
    _max?: NestedEnumAssessmentStatusFilter<$PrismaModel>
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

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
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

  export type EnumAssessmentInviteStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.AssessmentInviteStatus | EnumAssessmentInviteStatusFieldRefInput<$PrismaModel>
    in?: $Enums.AssessmentInviteStatus[] | ListEnumAssessmentInviteStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.AssessmentInviteStatus[] | ListEnumAssessmentInviteStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumAssessmentInviteStatusFilter<$PrismaModel> | $Enums.AssessmentInviteStatus
  }

  export type AssessmentScalarRelationFilter = {
    is?: AssessmentWhereInput
    isNot?: AssessmentWhereInput
  }

  export type AttemptNullableScalarRelationFilter = {
    is?: AttemptWhereInput | null
    isNot?: AttemptWhereInput | null
  }

  export type AssessmentInviteCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    assessmentId?: SortOrder
    candidateId?: SortOrder
    applicationId?: SortOrder
    tokenHash?: SortOrder
    provider?: SortOrder
    providerInvitationId?: SortOrder
    providerSecret?: SortOrder
    email?: SortOrder
    status?: SortOrder
    expiresAt?: SortOrder
    sentAt?: SortOrder
    openedAt?: SortOrder
    startedAt?: SortOrder
    submittedAt?: SortOrder
    consumedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AssessmentInviteMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    assessmentId?: SortOrder
    candidateId?: SortOrder
    applicationId?: SortOrder
    tokenHash?: SortOrder
    provider?: SortOrder
    providerInvitationId?: SortOrder
    providerSecret?: SortOrder
    email?: SortOrder
    status?: SortOrder
    expiresAt?: SortOrder
    sentAt?: SortOrder
    openedAt?: SortOrder
    startedAt?: SortOrder
    submittedAt?: SortOrder
    consumedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AssessmentInviteMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    assessmentId?: SortOrder
    candidateId?: SortOrder
    applicationId?: SortOrder
    tokenHash?: SortOrder
    provider?: SortOrder
    providerInvitationId?: SortOrder
    providerSecret?: SortOrder
    email?: SortOrder
    status?: SortOrder
    expiresAt?: SortOrder
    sentAt?: SortOrder
    openedAt?: SortOrder
    startedAt?: SortOrder
    submittedAt?: SortOrder
    consumedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumAssessmentInviteStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AssessmentInviteStatus | EnumAssessmentInviteStatusFieldRefInput<$PrismaModel>
    in?: $Enums.AssessmentInviteStatus[] | ListEnumAssessmentInviteStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.AssessmentInviteStatus[] | ListEnumAssessmentInviteStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumAssessmentInviteStatusWithAggregatesFilter<$PrismaModel> | $Enums.AssessmentInviteStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAssessmentInviteStatusFilter<$PrismaModel>
    _max?: NestedEnumAssessmentInviteStatusFilter<$PrismaModel>
  }

  export type EnumAttemptStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.AttemptStatus | EnumAttemptStatusFieldRefInput<$PrismaModel>
    in?: $Enums.AttemptStatus[] | ListEnumAttemptStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.AttemptStatus[] | ListEnumAttemptStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumAttemptStatusFilter<$PrismaModel> | $Enums.AttemptStatus
  }

  export type AssessmentInviteScalarRelationFilter = {
    is?: AssessmentInviteWhereInput
    isNot?: AssessmentInviteWhereInput
  }

  export type AnswerListRelationFilter = {
    every?: AnswerWhereInput
    some?: AnswerWhereInput
    none?: AnswerWhereInput
  }

  export type ProctorEventListRelationFilter = {
    every?: ProctorEventWhereInput
    some?: ProctorEventWhereInput
    none?: ProctorEventWhereInput
  }

  export type AssessmentResultNullableScalarRelationFilter = {
    is?: AssessmentResultWhereInput | null
    isNot?: AssessmentResultWhereInput | null
  }

  export type AnswerOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ProctorEventOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AttemptCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    assessmentId?: SortOrder
    inviteId?: SortOrder
    candidateId?: SortOrder
    status?: SortOrder
    startedAt?: SortOrder
    submittedAt?: SortOrder
    durationSeconds?: SortOrder
    questionOrder?: SortOrder
    answerKey?: SortOrder
    sessionTokenHash?: SortOrder
    remainingSeconds?: SortOrder
    lastHeartbeatAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AttemptAvgOrderByAggregateInput = {
    durationSeconds?: SortOrder
    remainingSeconds?: SortOrder
  }

  export type AttemptMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    assessmentId?: SortOrder
    inviteId?: SortOrder
    candidateId?: SortOrder
    status?: SortOrder
    startedAt?: SortOrder
    submittedAt?: SortOrder
    durationSeconds?: SortOrder
    sessionTokenHash?: SortOrder
    remainingSeconds?: SortOrder
    lastHeartbeatAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AttemptMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    assessmentId?: SortOrder
    inviteId?: SortOrder
    candidateId?: SortOrder
    status?: SortOrder
    startedAt?: SortOrder
    submittedAt?: SortOrder
    durationSeconds?: SortOrder
    sessionTokenHash?: SortOrder
    remainingSeconds?: SortOrder
    lastHeartbeatAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AttemptSumOrderByAggregateInput = {
    durationSeconds?: SortOrder
    remainingSeconds?: SortOrder
  }

  export type EnumAttemptStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AttemptStatus | EnumAttemptStatusFieldRefInput<$PrismaModel>
    in?: $Enums.AttemptStatus[] | ListEnumAttemptStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.AttemptStatus[] | ListEnumAttemptStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumAttemptStatusWithAggregatesFilter<$PrismaModel> | $Enums.AttemptStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAttemptStatusFilter<$PrismaModel>
    _max?: NestedEnumAttemptStatusFilter<$PrismaModel>
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

  export type AttemptScalarRelationFilter = {
    is?: AttemptWhereInput
    isNot?: AttemptWhereInput
  }

  export type AnswerAttemptIdQuestionIdCompoundUniqueInput = {
    attemptId: string
    questionId: string
  }

  export type AnswerCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    attemptId?: SortOrder
    questionId?: SortOrder
    value?: SortOrder
    timeSpentSeconds?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AnswerAvgOrderByAggregateInput = {
    timeSpentSeconds?: SortOrder
  }

  export type AnswerMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    attemptId?: SortOrder
    questionId?: SortOrder
    timeSpentSeconds?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AnswerMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    attemptId?: SortOrder
    questionId?: SortOrder
    timeSpentSeconds?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AnswerSumOrderByAggregateInput = {
    timeSpentSeconds?: SortOrder
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

  export type ProctorEventCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    attemptId?: SortOrder
    type?: SortOrder
    metadata?: SortOrder
    occurredAt?: SortOrder
    createdAt?: SortOrder
  }

  export type ProctorEventMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    attemptId?: SortOrder
    type?: SortOrder
    occurredAt?: SortOrder
    createdAt?: SortOrder
  }

  export type ProctorEventMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    attemptId?: SortOrder
    type?: SortOrder
    occurredAt?: SortOrder
    createdAt?: SortOrder
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type BoolNullableFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableFilter<$PrismaModel> | boolean | null
  }

  export type AssessmentResultCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    assessmentId?: SortOrder
    attemptId?: SortOrder
    candidateId?: SortOrder
    rawScore?: SortOrder
    maxScore?: SortOrder
    passed?: SortOrder
    pendingManualReview?: SortOrder
    perQuestion?: SortOrder
    explainability?: SortOrder
    gradedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AssessmentResultAvgOrderByAggregateInput = {
    rawScore?: SortOrder
    maxScore?: SortOrder
  }

  export type AssessmentResultMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    assessmentId?: SortOrder
    attemptId?: SortOrder
    candidateId?: SortOrder
    rawScore?: SortOrder
    maxScore?: SortOrder
    passed?: SortOrder
    pendingManualReview?: SortOrder
    gradedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AssessmentResultMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    assessmentId?: SortOrder
    attemptId?: SortOrder
    candidateId?: SortOrder
    rawScore?: SortOrder
    maxScore?: SortOrder
    passed?: SortOrder
    pendingManualReview?: SortOrder
    gradedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AssessmentResultSumOrderByAggregateInput = {
    rawScore?: SortOrder
    maxScore?: SortOrder
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type BoolNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableWithAggregatesFilter<$PrismaModel> | boolean | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedBoolNullableFilter<$PrismaModel>
    _max?: NestedBoolNullableFilter<$PrismaModel>
  }

  export type QuestionListRelationFilter = {
    every?: QuestionWhereInput
    some?: QuestionWhereInput
    none?: QuestionWhereInput
  }

  export type QuestionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type QuestionBankCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    name?: SortOrder
    description?: SortOrder
    category?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type QuestionBankMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    name?: SortOrder
    description?: SortOrder
    category?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type QuestionBankMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    name?: SortOrder
    description?: SortOrder
    category?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumQuestionTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.QuestionType | EnumQuestionTypeFieldRefInput<$PrismaModel>
    in?: $Enums.QuestionType[] | ListEnumQuestionTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.QuestionType[] | ListEnumQuestionTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumQuestionTypeFilter<$PrismaModel> | $Enums.QuestionType
  }

  export type QuestionBankScalarRelationFilter = {
    is?: QuestionBankWhereInput
    isNot?: QuestionBankWhereInput
  }

  export type QuestionCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    questionBankId?: SortOrder
    type?: SortOrder
    prompt?: SortOrder
    order?: SortOrder
    required?: SortOrder
    points?: SortOrder
    timeLimit?: SortOrder
    options?: SortOrder
    correctAnswer?: SortOrder
    language?: SortOrder
    starterCode?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type QuestionAvgOrderByAggregateInput = {
    order?: SortOrder
    points?: SortOrder
    timeLimit?: SortOrder
  }

  export type QuestionMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    questionBankId?: SortOrder
    type?: SortOrder
    prompt?: SortOrder
    order?: SortOrder
    required?: SortOrder
    points?: SortOrder
    timeLimit?: SortOrder
    language?: SortOrder
    starterCode?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type QuestionMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    questionBankId?: SortOrder
    type?: SortOrder
    prompt?: SortOrder
    order?: SortOrder
    required?: SortOrder
    points?: SortOrder
    timeLimit?: SortOrder
    language?: SortOrder
    starterCode?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type QuestionSumOrderByAggregateInput = {
    order?: SortOrder
    points?: SortOrder
    timeLimit?: SortOrder
  }

  export type EnumQuestionTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.QuestionType | EnumQuestionTypeFieldRefInput<$PrismaModel>
    in?: $Enums.QuestionType[] | ListEnumQuestionTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.QuestionType[] | ListEnumQuestionTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumQuestionTypeWithAggregatesFilter<$PrismaModel> | $Enums.QuestionType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumQuestionTypeFilter<$PrismaModel>
    _max?: NestedEnumQuestionTypeFilter<$PrismaModel>
  }

  export type AssessmentInviteCreateNestedManyWithoutAssessmentInput = {
    create?: XOR<AssessmentInviteCreateWithoutAssessmentInput, AssessmentInviteUncheckedCreateWithoutAssessmentInput> | AssessmentInviteCreateWithoutAssessmentInput[] | AssessmentInviteUncheckedCreateWithoutAssessmentInput[]
    connectOrCreate?: AssessmentInviteCreateOrConnectWithoutAssessmentInput | AssessmentInviteCreateOrConnectWithoutAssessmentInput[]
    createMany?: AssessmentInviteCreateManyAssessmentInputEnvelope
    connect?: AssessmentInviteWhereUniqueInput | AssessmentInviteWhereUniqueInput[]
  }

  export type AttemptCreateNestedManyWithoutAssessmentInput = {
    create?: XOR<AttemptCreateWithoutAssessmentInput, AttemptUncheckedCreateWithoutAssessmentInput> | AttemptCreateWithoutAssessmentInput[] | AttemptUncheckedCreateWithoutAssessmentInput[]
    connectOrCreate?: AttemptCreateOrConnectWithoutAssessmentInput | AttemptCreateOrConnectWithoutAssessmentInput[]
    createMany?: AttemptCreateManyAssessmentInputEnvelope
    connect?: AttemptWhereUniqueInput | AttemptWhereUniqueInput[]
  }

  export type AssessmentResultCreateNestedManyWithoutAssessmentInput = {
    create?: XOR<AssessmentResultCreateWithoutAssessmentInput, AssessmentResultUncheckedCreateWithoutAssessmentInput> | AssessmentResultCreateWithoutAssessmentInput[] | AssessmentResultUncheckedCreateWithoutAssessmentInput[]
    connectOrCreate?: AssessmentResultCreateOrConnectWithoutAssessmentInput | AssessmentResultCreateOrConnectWithoutAssessmentInput[]
    createMany?: AssessmentResultCreateManyAssessmentInputEnvelope
    connect?: AssessmentResultWhereUniqueInput | AssessmentResultWhereUniqueInput[]
  }

  export type AssessmentInviteUncheckedCreateNestedManyWithoutAssessmentInput = {
    create?: XOR<AssessmentInviteCreateWithoutAssessmentInput, AssessmentInviteUncheckedCreateWithoutAssessmentInput> | AssessmentInviteCreateWithoutAssessmentInput[] | AssessmentInviteUncheckedCreateWithoutAssessmentInput[]
    connectOrCreate?: AssessmentInviteCreateOrConnectWithoutAssessmentInput | AssessmentInviteCreateOrConnectWithoutAssessmentInput[]
    createMany?: AssessmentInviteCreateManyAssessmentInputEnvelope
    connect?: AssessmentInviteWhereUniqueInput | AssessmentInviteWhereUniqueInput[]
  }

  export type AttemptUncheckedCreateNestedManyWithoutAssessmentInput = {
    create?: XOR<AttemptCreateWithoutAssessmentInput, AttemptUncheckedCreateWithoutAssessmentInput> | AttemptCreateWithoutAssessmentInput[] | AttemptUncheckedCreateWithoutAssessmentInput[]
    connectOrCreate?: AttemptCreateOrConnectWithoutAssessmentInput | AttemptCreateOrConnectWithoutAssessmentInput[]
    createMany?: AttemptCreateManyAssessmentInputEnvelope
    connect?: AttemptWhereUniqueInput | AttemptWhereUniqueInput[]
  }

  export type AssessmentResultUncheckedCreateNestedManyWithoutAssessmentInput = {
    create?: XOR<AssessmentResultCreateWithoutAssessmentInput, AssessmentResultUncheckedCreateWithoutAssessmentInput> | AssessmentResultCreateWithoutAssessmentInput[] | AssessmentResultUncheckedCreateWithoutAssessmentInput[]
    connectOrCreate?: AssessmentResultCreateOrConnectWithoutAssessmentInput | AssessmentResultCreateOrConnectWithoutAssessmentInput[]
    createMany?: AssessmentResultCreateManyAssessmentInputEnvelope
    connect?: AssessmentResultWhereUniqueInput | AssessmentResultWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type EnumAssessmentStatusFieldUpdateOperationsInput = {
    set?: $Enums.AssessmentStatus
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
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

  export type AssessmentInviteUpdateManyWithoutAssessmentNestedInput = {
    create?: XOR<AssessmentInviteCreateWithoutAssessmentInput, AssessmentInviteUncheckedCreateWithoutAssessmentInput> | AssessmentInviteCreateWithoutAssessmentInput[] | AssessmentInviteUncheckedCreateWithoutAssessmentInput[]
    connectOrCreate?: AssessmentInviteCreateOrConnectWithoutAssessmentInput | AssessmentInviteCreateOrConnectWithoutAssessmentInput[]
    upsert?: AssessmentInviteUpsertWithWhereUniqueWithoutAssessmentInput | AssessmentInviteUpsertWithWhereUniqueWithoutAssessmentInput[]
    createMany?: AssessmentInviteCreateManyAssessmentInputEnvelope
    set?: AssessmentInviteWhereUniqueInput | AssessmentInviteWhereUniqueInput[]
    disconnect?: AssessmentInviteWhereUniqueInput | AssessmentInviteWhereUniqueInput[]
    delete?: AssessmentInviteWhereUniqueInput | AssessmentInviteWhereUniqueInput[]
    connect?: AssessmentInviteWhereUniqueInput | AssessmentInviteWhereUniqueInput[]
    update?: AssessmentInviteUpdateWithWhereUniqueWithoutAssessmentInput | AssessmentInviteUpdateWithWhereUniqueWithoutAssessmentInput[]
    updateMany?: AssessmentInviteUpdateManyWithWhereWithoutAssessmentInput | AssessmentInviteUpdateManyWithWhereWithoutAssessmentInput[]
    deleteMany?: AssessmentInviteScalarWhereInput | AssessmentInviteScalarWhereInput[]
  }

  export type AttemptUpdateManyWithoutAssessmentNestedInput = {
    create?: XOR<AttemptCreateWithoutAssessmentInput, AttemptUncheckedCreateWithoutAssessmentInput> | AttemptCreateWithoutAssessmentInput[] | AttemptUncheckedCreateWithoutAssessmentInput[]
    connectOrCreate?: AttemptCreateOrConnectWithoutAssessmentInput | AttemptCreateOrConnectWithoutAssessmentInput[]
    upsert?: AttemptUpsertWithWhereUniqueWithoutAssessmentInput | AttemptUpsertWithWhereUniqueWithoutAssessmentInput[]
    createMany?: AttemptCreateManyAssessmentInputEnvelope
    set?: AttemptWhereUniqueInput | AttemptWhereUniqueInput[]
    disconnect?: AttemptWhereUniqueInput | AttemptWhereUniqueInput[]
    delete?: AttemptWhereUniqueInput | AttemptWhereUniqueInput[]
    connect?: AttemptWhereUniqueInput | AttemptWhereUniqueInput[]
    update?: AttemptUpdateWithWhereUniqueWithoutAssessmentInput | AttemptUpdateWithWhereUniqueWithoutAssessmentInput[]
    updateMany?: AttemptUpdateManyWithWhereWithoutAssessmentInput | AttemptUpdateManyWithWhereWithoutAssessmentInput[]
    deleteMany?: AttemptScalarWhereInput | AttemptScalarWhereInput[]
  }

  export type AssessmentResultUpdateManyWithoutAssessmentNestedInput = {
    create?: XOR<AssessmentResultCreateWithoutAssessmentInput, AssessmentResultUncheckedCreateWithoutAssessmentInput> | AssessmentResultCreateWithoutAssessmentInput[] | AssessmentResultUncheckedCreateWithoutAssessmentInput[]
    connectOrCreate?: AssessmentResultCreateOrConnectWithoutAssessmentInput | AssessmentResultCreateOrConnectWithoutAssessmentInput[]
    upsert?: AssessmentResultUpsertWithWhereUniqueWithoutAssessmentInput | AssessmentResultUpsertWithWhereUniqueWithoutAssessmentInput[]
    createMany?: AssessmentResultCreateManyAssessmentInputEnvelope
    set?: AssessmentResultWhereUniqueInput | AssessmentResultWhereUniqueInput[]
    disconnect?: AssessmentResultWhereUniqueInput | AssessmentResultWhereUniqueInput[]
    delete?: AssessmentResultWhereUniqueInput | AssessmentResultWhereUniqueInput[]
    connect?: AssessmentResultWhereUniqueInput | AssessmentResultWhereUniqueInput[]
    update?: AssessmentResultUpdateWithWhereUniqueWithoutAssessmentInput | AssessmentResultUpdateWithWhereUniqueWithoutAssessmentInput[]
    updateMany?: AssessmentResultUpdateManyWithWhereWithoutAssessmentInput | AssessmentResultUpdateManyWithWhereWithoutAssessmentInput[]
    deleteMany?: AssessmentResultScalarWhereInput | AssessmentResultScalarWhereInput[]
  }

  export type AssessmentInviteUncheckedUpdateManyWithoutAssessmentNestedInput = {
    create?: XOR<AssessmentInviteCreateWithoutAssessmentInput, AssessmentInviteUncheckedCreateWithoutAssessmentInput> | AssessmentInviteCreateWithoutAssessmentInput[] | AssessmentInviteUncheckedCreateWithoutAssessmentInput[]
    connectOrCreate?: AssessmentInviteCreateOrConnectWithoutAssessmentInput | AssessmentInviteCreateOrConnectWithoutAssessmentInput[]
    upsert?: AssessmentInviteUpsertWithWhereUniqueWithoutAssessmentInput | AssessmentInviteUpsertWithWhereUniqueWithoutAssessmentInput[]
    createMany?: AssessmentInviteCreateManyAssessmentInputEnvelope
    set?: AssessmentInviteWhereUniqueInput | AssessmentInviteWhereUniqueInput[]
    disconnect?: AssessmentInviteWhereUniqueInput | AssessmentInviteWhereUniqueInput[]
    delete?: AssessmentInviteWhereUniqueInput | AssessmentInviteWhereUniqueInput[]
    connect?: AssessmentInviteWhereUniqueInput | AssessmentInviteWhereUniqueInput[]
    update?: AssessmentInviteUpdateWithWhereUniqueWithoutAssessmentInput | AssessmentInviteUpdateWithWhereUniqueWithoutAssessmentInput[]
    updateMany?: AssessmentInviteUpdateManyWithWhereWithoutAssessmentInput | AssessmentInviteUpdateManyWithWhereWithoutAssessmentInput[]
    deleteMany?: AssessmentInviteScalarWhereInput | AssessmentInviteScalarWhereInput[]
  }

  export type AttemptUncheckedUpdateManyWithoutAssessmentNestedInput = {
    create?: XOR<AttemptCreateWithoutAssessmentInput, AttemptUncheckedCreateWithoutAssessmentInput> | AttemptCreateWithoutAssessmentInput[] | AttemptUncheckedCreateWithoutAssessmentInput[]
    connectOrCreate?: AttemptCreateOrConnectWithoutAssessmentInput | AttemptCreateOrConnectWithoutAssessmentInput[]
    upsert?: AttemptUpsertWithWhereUniqueWithoutAssessmentInput | AttemptUpsertWithWhereUniqueWithoutAssessmentInput[]
    createMany?: AttemptCreateManyAssessmentInputEnvelope
    set?: AttemptWhereUniqueInput | AttemptWhereUniqueInput[]
    disconnect?: AttemptWhereUniqueInput | AttemptWhereUniqueInput[]
    delete?: AttemptWhereUniqueInput | AttemptWhereUniqueInput[]
    connect?: AttemptWhereUniqueInput | AttemptWhereUniqueInput[]
    update?: AttemptUpdateWithWhereUniqueWithoutAssessmentInput | AttemptUpdateWithWhereUniqueWithoutAssessmentInput[]
    updateMany?: AttemptUpdateManyWithWhereWithoutAssessmentInput | AttemptUpdateManyWithWhereWithoutAssessmentInput[]
    deleteMany?: AttemptScalarWhereInput | AttemptScalarWhereInput[]
  }

  export type AssessmentResultUncheckedUpdateManyWithoutAssessmentNestedInput = {
    create?: XOR<AssessmentResultCreateWithoutAssessmentInput, AssessmentResultUncheckedCreateWithoutAssessmentInput> | AssessmentResultCreateWithoutAssessmentInput[] | AssessmentResultUncheckedCreateWithoutAssessmentInput[]
    connectOrCreate?: AssessmentResultCreateOrConnectWithoutAssessmentInput | AssessmentResultCreateOrConnectWithoutAssessmentInput[]
    upsert?: AssessmentResultUpsertWithWhereUniqueWithoutAssessmentInput | AssessmentResultUpsertWithWhereUniqueWithoutAssessmentInput[]
    createMany?: AssessmentResultCreateManyAssessmentInputEnvelope
    set?: AssessmentResultWhereUniqueInput | AssessmentResultWhereUniqueInput[]
    disconnect?: AssessmentResultWhereUniqueInput | AssessmentResultWhereUniqueInput[]
    delete?: AssessmentResultWhereUniqueInput | AssessmentResultWhereUniqueInput[]
    connect?: AssessmentResultWhereUniqueInput | AssessmentResultWhereUniqueInput[]
    update?: AssessmentResultUpdateWithWhereUniqueWithoutAssessmentInput | AssessmentResultUpdateWithWhereUniqueWithoutAssessmentInput[]
    updateMany?: AssessmentResultUpdateManyWithWhereWithoutAssessmentInput | AssessmentResultUpdateManyWithWhereWithoutAssessmentInput[]
    deleteMany?: AssessmentResultScalarWhereInput | AssessmentResultScalarWhereInput[]
  }

  export type AssessmentCreateNestedOneWithoutInvitesInput = {
    create?: XOR<AssessmentCreateWithoutInvitesInput, AssessmentUncheckedCreateWithoutInvitesInput>
    connectOrCreate?: AssessmentCreateOrConnectWithoutInvitesInput
    connect?: AssessmentWhereUniqueInput
  }

  export type AttemptCreateNestedOneWithoutInviteInput = {
    create?: XOR<AttemptCreateWithoutInviteInput, AttemptUncheckedCreateWithoutInviteInput>
    connectOrCreate?: AttemptCreateOrConnectWithoutInviteInput
    connect?: AttemptWhereUniqueInput
  }

  export type AttemptUncheckedCreateNestedOneWithoutInviteInput = {
    create?: XOR<AttemptCreateWithoutInviteInput, AttemptUncheckedCreateWithoutInviteInput>
    connectOrCreate?: AttemptCreateOrConnectWithoutInviteInput
    connect?: AttemptWhereUniqueInput
  }

  export type EnumAssessmentInviteStatusFieldUpdateOperationsInput = {
    set?: $Enums.AssessmentInviteStatus
  }

  export type AssessmentUpdateOneRequiredWithoutInvitesNestedInput = {
    create?: XOR<AssessmentCreateWithoutInvitesInput, AssessmentUncheckedCreateWithoutInvitesInput>
    connectOrCreate?: AssessmentCreateOrConnectWithoutInvitesInput
    upsert?: AssessmentUpsertWithoutInvitesInput
    connect?: AssessmentWhereUniqueInput
    update?: XOR<XOR<AssessmentUpdateToOneWithWhereWithoutInvitesInput, AssessmentUpdateWithoutInvitesInput>, AssessmentUncheckedUpdateWithoutInvitesInput>
  }

  export type AttemptUpdateOneWithoutInviteNestedInput = {
    create?: XOR<AttemptCreateWithoutInviteInput, AttemptUncheckedCreateWithoutInviteInput>
    connectOrCreate?: AttemptCreateOrConnectWithoutInviteInput
    upsert?: AttemptUpsertWithoutInviteInput
    disconnect?: AttemptWhereInput | boolean
    delete?: AttemptWhereInput | boolean
    connect?: AttemptWhereUniqueInput
    update?: XOR<XOR<AttemptUpdateToOneWithWhereWithoutInviteInput, AttemptUpdateWithoutInviteInput>, AttemptUncheckedUpdateWithoutInviteInput>
  }

  export type AttemptUncheckedUpdateOneWithoutInviteNestedInput = {
    create?: XOR<AttemptCreateWithoutInviteInput, AttemptUncheckedCreateWithoutInviteInput>
    connectOrCreate?: AttemptCreateOrConnectWithoutInviteInput
    upsert?: AttemptUpsertWithoutInviteInput
    disconnect?: AttemptWhereInput | boolean
    delete?: AttemptWhereInput | boolean
    connect?: AttemptWhereUniqueInput
    update?: XOR<XOR<AttemptUpdateToOneWithWhereWithoutInviteInput, AttemptUpdateWithoutInviteInput>, AttemptUncheckedUpdateWithoutInviteInput>
  }

  export type AssessmentCreateNestedOneWithoutAttemptsInput = {
    create?: XOR<AssessmentCreateWithoutAttemptsInput, AssessmentUncheckedCreateWithoutAttemptsInput>
    connectOrCreate?: AssessmentCreateOrConnectWithoutAttemptsInput
    connect?: AssessmentWhereUniqueInput
  }

  export type AssessmentInviteCreateNestedOneWithoutAttemptInput = {
    create?: XOR<AssessmentInviteCreateWithoutAttemptInput, AssessmentInviteUncheckedCreateWithoutAttemptInput>
    connectOrCreate?: AssessmentInviteCreateOrConnectWithoutAttemptInput
    connect?: AssessmentInviteWhereUniqueInput
  }

  export type AnswerCreateNestedManyWithoutAttemptInput = {
    create?: XOR<AnswerCreateWithoutAttemptInput, AnswerUncheckedCreateWithoutAttemptInput> | AnswerCreateWithoutAttemptInput[] | AnswerUncheckedCreateWithoutAttemptInput[]
    connectOrCreate?: AnswerCreateOrConnectWithoutAttemptInput | AnswerCreateOrConnectWithoutAttemptInput[]
    createMany?: AnswerCreateManyAttemptInputEnvelope
    connect?: AnswerWhereUniqueInput | AnswerWhereUniqueInput[]
  }

  export type ProctorEventCreateNestedManyWithoutAttemptInput = {
    create?: XOR<ProctorEventCreateWithoutAttemptInput, ProctorEventUncheckedCreateWithoutAttemptInput> | ProctorEventCreateWithoutAttemptInput[] | ProctorEventUncheckedCreateWithoutAttemptInput[]
    connectOrCreate?: ProctorEventCreateOrConnectWithoutAttemptInput | ProctorEventCreateOrConnectWithoutAttemptInput[]
    createMany?: ProctorEventCreateManyAttemptInputEnvelope
    connect?: ProctorEventWhereUniqueInput | ProctorEventWhereUniqueInput[]
  }

  export type AssessmentResultCreateNestedOneWithoutAttemptInput = {
    create?: XOR<AssessmentResultCreateWithoutAttemptInput, AssessmentResultUncheckedCreateWithoutAttemptInput>
    connectOrCreate?: AssessmentResultCreateOrConnectWithoutAttemptInput
    connect?: AssessmentResultWhereUniqueInput
  }

  export type AnswerUncheckedCreateNestedManyWithoutAttemptInput = {
    create?: XOR<AnswerCreateWithoutAttemptInput, AnswerUncheckedCreateWithoutAttemptInput> | AnswerCreateWithoutAttemptInput[] | AnswerUncheckedCreateWithoutAttemptInput[]
    connectOrCreate?: AnswerCreateOrConnectWithoutAttemptInput | AnswerCreateOrConnectWithoutAttemptInput[]
    createMany?: AnswerCreateManyAttemptInputEnvelope
    connect?: AnswerWhereUniqueInput | AnswerWhereUniqueInput[]
  }

  export type ProctorEventUncheckedCreateNestedManyWithoutAttemptInput = {
    create?: XOR<ProctorEventCreateWithoutAttemptInput, ProctorEventUncheckedCreateWithoutAttemptInput> | ProctorEventCreateWithoutAttemptInput[] | ProctorEventUncheckedCreateWithoutAttemptInput[]
    connectOrCreate?: ProctorEventCreateOrConnectWithoutAttemptInput | ProctorEventCreateOrConnectWithoutAttemptInput[]
    createMany?: ProctorEventCreateManyAttemptInputEnvelope
    connect?: ProctorEventWhereUniqueInput | ProctorEventWhereUniqueInput[]
  }

  export type AssessmentResultUncheckedCreateNestedOneWithoutAttemptInput = {
    create?: XOR<AssessmentResultCreateWithoutAttemptInput, AssessmentResultUncheckedCreateWithoutAttemptInput>
    connectOrCreate?: AssessmentResultCreateOrConnectWithoutAttemptInput
    connect?: AssessmentResultWhereUniqueInput
  }

  export type EnumAttemptStatusFieldUpdateOperationsInput = {
    set?: $Enums.AttemptStatus
  }

  export type AssessmentUpdateOneRequiredWithoutAttemptsNestedInput = {
    create?: XOR<AssessmentCreateWithoutAttemptsInput, AssessmentUncheckedCreateWithoutAttemptsInput>
    connectOrCreate?: AssessmentCreateOrConnectWithoutAttemptsInput
    upsert?: AssessmentUpsertWithoutAttemptsInput
    connect?: AssessmentWhereUniqueInput
    update?: XOR<XOR<AssessmentUpdateToOneWithWhereWithoutAttemptsInput, AssessmentUpdateWithoutAttemptsInput>, AssessmentUncheckedUpdateWithoutAttemptsInput>
  }

  export type AssessmentInviteUpdateOneRequiredWithoutAttemptNestedInput = {
    create?: XOR<AssessmentInviteCreateWithoutAttemptInput, AssessmentInviteUncheckedCreateWithoutAttemptInput>
    connectOrCreate?: AssessmentInviteCreateOrConnectWithoutAttemptInput
    upsert?: AssessmentInviteUpsertWithoutAttemptInput
    connect?: AssessmentInviteWhereUniqueInput
    update?: XOR<XOR<AssessmentInviteUpdateToOneWithWhereWithoutAttemptInput, AssessmentInviteUpdateWithoutAttemptInput>, AssessmentInviteUncheckedUpdateWithoutAttemptInput>
  }

  export type AnswerUpdateManyWithoutAttemptNestedInput = {
    create?: XOR<AnswerCreateWithoutAttemptInput, AnswerUncheckedCreateWithoutAttemptInput> | AnswerCreateWithoutAttemptInput[] | AnswerUncheckedCreateWithoutAttemptInput[]
    connectOrCreate?: AnswerCreateOrConnectWithoutAttemptInput | AnswerCreateOrConnectWithoutAttemptInput[]
    upsert?: AnswerUpsertWithWhereUniqueWithoutAttemptInput | AnswerUpsertWithWhereUniqueWithoutAttemptInput[]
    createMany?: AnswerCreateManyAttemptInputEnvelope
    set?: AnswerWhereUniqueInput | AnswerWhereUniqueInput[]
    disconnect?: AnswerWhereUniqueInput | AnswerWhereUniqueInput[]
    delete?: AnswerWhereUniqueInput | AnswerWhereUniqueInput[]
    connect?: AnswerWhereUniqueInput | AnswerWhereUniqueInput[]
    update?: AnswerUpdateWithWhereUniqueWithoutAttemptInput | AnswerUpdateWithWhereUniqueWithoutAttemptInput[]
    updateMany?: AnswerUpdateManyWithWhereWithoutAttemptInput | AnswerUpdateManyWithWhereWithoutAttemptInput[]
    deleteMany?: AnswerScalarWhereInput | AnswerScalarWhereInput[]
  }

  export type ProctorEventUpdateManyWithoutAttemptNestedInput = {
    create?: XOR<ProctorEventCreateWithoutAttemptInput, ProctorEventUncheckedCreateWithoutAttemptInput> | ProctorEventCreateWithoutAttemptInput[] | ProctorEventUncheckedCreateWithoutAttemptInput[]
    connectOrCreate?: ProctorEventCreateOrConnectWithoutAttemptInput | ProctorEventCreateOrConnectWithoutAttemptInput[]
    upsert?: ProctorEventUpsertWithWhereUniqueWithoutAttemptInput | ProctorEventUpsertWithWhereUniqueWithoutAttemptInput[]
    createMany?: ProctorEventCreateManyAttemptInputEnvelope
    set?: ProctorEventWhereUniqueInput | ProctorEventWhereUniqueInput[]
    disconnect?: ProctorEventWhereUniqueInput | ProctorEventWhereUniqueInput[]
    delete?: ProctorEventWhereUniqueInput | ProctorEventWhereUniqueInput[]
    connect?: ProctorEventWhereUniqueInput | ProctorEventWhereUniqueInput[]
    update?: ProctorEventUpdateWithWhereUniqueWithoutAttemptInput | ProctorEventUpdateWithWhereUniqueWithoutAttemptInput[]
    updateMany?: ProctorEventUpdateManyWithWhereWithoutAttemptInput | ProctorEventUpdateManyWithWhereWithoutAttemptInput[]
    deleteMany?: ProctorEventScalarWhereInput | ProctorEventScalarWhereInput[]
  }

  export type AssessmentResultUpdateOneWithoutAttemptNestedInput = {
    create?: XOR<AssessmentResultCreateWithoutAttemptInput, AssessmentResultUncheckedCreateWithoutAttemptInput>
    connectOrCreate?: AssessmentResultCreateOrConnectWithoutAttemptInput
    upsert?: AssessmentResultUpsertWithoutAttemptInput
    disconnect?: AssessmentResultWhereInput | boolean
    delete?: AssessmentResultWhereInput | boolean
    connect?: AssessmentResultWhereUniqueInput
    update?: XOR<XOR<AssessmentResultUpdateToOneWithWhereWithoutAttemptInput, AssessmentResultUpdateWithoutAttemptInput>, AssessmentResultUncheckedUpdateWithoutAttemptInput>
  }

  export type AnswerUncheckedUpdateManyWithoutAttemptNestedInput = {
    create?: XOR<AnswerCreateWithoutAttemptInput, AnswerUncheckedCreateWithoutAttemptInput> | AnswerCreateWithoutAttemptInput[] | AnswerUncheckedCreateWithoutAttemptInput[]
    connectOrCreate?: AnswerCreateOrConnectWithoutAttemptInput | AnswerCreateOrConnectWithoutAttemptInput[]
    upsert?: AnswerUpsertWithWhereUniqueWithoutAttemptInput | AnswerUpsertWithWhereUniqueWithoutAttemptInput[]
    createMany?: AnswerCreateManyAttemptInputEnvelope
    set?: AnswerWhereUniqueInput | AnswerWhereUniqueInput[]
    disconnect?: AnswerWhereUniqueInput | AnswerWhereUniqueInput[]
    delete?: AnswerWhereUniqueInput | AnswerWhereUniqueInput[]
    connect?: AnswerWhereUniqueInput | AnswerWhereUniqueInput[]
    update?: AnswerUpdateWithWhereUniqueWithoutAttemptInput | AnswerUpdateWithWhereUniqueWithoutAttemptInput[]
    updateMany?: AnswerUpdateManyWithWhereWithoutAttemptInput | AnswerUpdateManyWithWhereWithoutAttemptInput[]
    deleteMany?: AnswerScalarWhereInput | AnswerScalarWhereInput[]
  }

  export type ProctorEventUncheckedUpdateManyWithoutAttemptNestedInput = {
    create?: XOR<ProctorEventCreateWithoutAttemptInput, ProctorEventUncheckedCreateWithoutAttemptInput> | ProctorEventCreateWithoutAttemptInput[] | ProctorEventUncheckedCreateWithoutAttemptInput[]
    connectOrCreate?: ProctorEventCreateOrConnectWithoutAttemptInput | ProctorEventCreateOrConnectWithoutAttemptInput[]
    upsert?: ProctorEventUpsertWithWhereUniqueWithoutAttemptInput | ProctorEventUpsertWithWhereUniqueWithoutAttemptInput[]
    createMany?: ProctorEventCreateManyAttemptInputEnvelope
    set?: ProctorEventWhereUniqueInput | ProctorEventWhereUniqueInput[]
    disconnect?: ProctorEventWhereUniqueInput | ProctorEventWhereUniqueInput[]
    delete?: ProctorEventWhereUniqueInput | ProctorEventWhereUniqueInput[]
    connect?: ProctorEventWhereUniqueInput | ProctorEventWhereUniqueInput[]
    update?: ProctorEventUpdateWithWhereUniqueWithoutAttemptInput | ProctorEventUpdateWithWhereUniqueWithoutAttemptInput[]
    updateMany?: ProctorEventUpdateManyWithWhereWithoutAttemptInput | ProctorEventUpdateManyWithWhereWithoutAttemptInput[]
    deleteMany?: ProctorEventScalarWhereInput | ProctorEventScalarWhereInput[]
  }

  export type AssessmentResultUncheckedUpdateOneWithoutAttemptNestedInput = {
    create?: XOR<AssessmentResultCreateWithoutAttemptInput, AssessmentResultUncheckedCreateWithoutAttemptInput>
    connectOrCreate?: AssessmentResultCreateOrConnectWithoutAttemptInput
    upsert?: AssessmentResultUpsertWithoutAttemptInput
    disconnect?: AssessmentResultWhereInput | boolean
    delete?: AssessmentResultWhereInput | boolean
    connect?: AssessmentResultWhereUniqueInput
    update?: XOR<XOR<AssessmentResultUpdateToOneWithWhereWithoutAttemptInput, AssessmentResultUpdateWithoutAttemptInput>, AssessmentResultUncheckedUpdateWithoutAttemptInput>
  }

  export type AttemptCreateNestedOneWithoutAnswersInput = {
    create?: XOR<AttemptCreateWithoutAnswersInput, AttemptUncheckedCreateWithoutAnswersInput>
    connectOrCreate?: AttemptCreateOrConnectWithoutAnswersInput
    connect?: AttemptWhereUniqueInput
  }

  export type AttemptUpdateOneRequiredWithoutAnswersNestedInput = {
    create?: XOR<AttemptCreateWithoutAnswersInput, AttemptUncheckedCreateWithoutAnswersInput>
    connectOrCreate?: AttemptCreateOrConnectWithoutAnswersInput
    upsert?: AttemptUpsertWithoutAnswersInput
    connect?: AttemptWhereUniqueInput
    update?: XOR<XOR<AttemptUpdateToOneWithWhereWithoutAnswersInput, AttemptUpdateWithoutAnswersInput>, AttemptUncheckedUpdateWithoutAnswersInput>
  }

  export type AttemptCreateNestedOneWithoutProctorEventsInput = {
    create?: XOR<AttemptCreateWithoutProctorEventsInput, AttemptUncheckedCreateWithoutProctorEventsInput>
    connectOrCreate?: AttemptCreateOrConnectWithoutProctorEventsInput
    connect?: AttemptWhereUniqueInput
  }

  export type AttemptUpdateOneRequiredWithoutProctorEventsNestedInput = {
    create?: XOR<AttemptCreateWithoutProctorEventsInput, AttemptUncheckedCreateWithoutProctorEventsInput>
    connectOrCreate?: AttemptCreateOrConnectWithoutProctorEventsInput
    upsert?: AttemptUpsertWithoutProctorEventsInput
    connect?: AttemptWhereUniqueInput
    update?: XOR<XOR<AttemptUpdateToOneWithWhereWithoutProctorEventsInput, AttemptUpdateWithoutProctorEventsInput>, AttemptUncheckedUpdateWithoutProctorEventsInput>
  }

  export type AssessmentCreateNestedOneWithoutResultsInput = {
    create?: XOR<AssessmentCreateWithoutResultsInput, AssessmentUncheckedCreateWithoutResultsInput>
    connectOrCreate?: AssessmentCreateOrConnectWithoutResultsInput
    connect?: AssessmentWhereUniqueInput
  }

  export type AttemptCreateNestedOneWithoutResultInput = {
    create?: XOR<AttemptCreateWithoutResultInput, AttemptUncheckedCreateWithoutResultInput>
    connectOrCreate?: AttemptCreateOrConnectWithoutResultInput
    connect?: AttemptWhereUniqueInput
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableBoolFieldUpdateOperationsInput = {
    set?: boolean | null
  }

  export type AssessmentUpdateOneRequiredWithoutResultsNestedInput = {
    create?: XOR<AssessmentCreateWithoutResultsInput, AssessmentUncheckedCreateWithoutResultsInput>
    connectOrCreate?: AssessmentCreateOrConnectWithoutResultsInput
    upsert?: AssessmentUpsertWithoutResultsInput
    connect?: AssessmentWhereUniqueInput
    update?: XOR<XOR<AssessmentUpdateToOneWithWhereWithoutResultsInput, AssessmentUpdateWithoutResultsInput>, AssessmentUncheckedUpdateWithoutResultsInput>
  }

  export type AttemptUpdateOneRequiredWithoutResultNestedInput = {
    create?: XOR<AttemptCreateWithoutResultInput, AttemptUncheckedCreateWithoutResultInput>
    connectOrCreate?: AttemptCreateOrConnectWithoutResultInput
    upsert?: AttemptUpsertWithoutResultInput
    connect?: AttemptWhereUniqueInput
    update?: XOR<XOR<AttemptUpdateToOneWithWhereWithoutResultInput, AttemptUpdateWithoutResultInput>, AttemptUncheckedUpdateWithoutResultInput>
  }

  export type QuestionCreateNestedManyWithoutQuestionBankInput = {
    create?: XOR<QuestionCreateWithoutQuestionBankInput, QuestionUncheckedCreateWithoutQuestionBankInput> | QuestionCreateWithoutQuestionBankInput[] | QuestionUncheckedCreateWithoutQuestionBankInput[]
    connectOrCreate?: QuestionCreateOrConnectWithoutQuestionBankInput | QuestionCreateOrConnectWithoutQuestionBankInput[]
    createMany?: QuestionCreateManyQuestionBankInputEnvelope
    connect?: QuestionWhereUniqueInput | QuestionWhereUniqueInput[]
  }

  export type QuestionUncheckedCreateNestedManyWithoutQuestionBankInput = {
    create?: XOR<QuestionCreateWithoutQuestionBankInput, QuestionUncheckedCreateWithoutQuestionBankInput> | QuestionCreateWithoutQuestionBankInput[] | QuestionUncheckedCreateWithoutQuestionBankInput[]
    connectOrCreate?: QuestionCreateOrConnectWithoutQuestionBankInput | QuestionCreateOrConnectWithoutQuestionBankInput[]
    createMany?: QuestionCreateManyQuestionBankInputEnvelope
    connect?: QuestionWhereUniqueInput | QuestionWhereUniqueInput[]
  }

  export type QuestionUpdateManyWithoutQuestionBankNestedInput = {
    create?: XOR<QuestionCreateWithoutQuestionBankInput, QuestionUncheckedCreateWithoutQuestionBankInput> | QuestionCreateWithoutQuestionBankInput[] | QuestionUncheckedCreateWithoutQuestionBankInput[]
    connectOrCreate?: QuestionCreateOrConnectWithoutQuestionBankInput | QuestionCreateOrConnectWithoutQuestionBankInput[]
    upsert?: QuestionUpsertWithWhereUniqueWithoutQuestionBankInput | QuestionUpsertWithWhereUniqueWithoutQuestionBankInput[]
    createMany?: QuestionCreateManyQuestionBankInputEnvelope
    set?: QuestionWhereUniqueInput | QuestionWhereUniqueInput[]
    disconnect?: QuestionWhereUniqueInput | QuestionWhereUniqueInput[]
    delete?: QuestionWhereUniqueInput | QuestionWhereUniqueInput[]
    connect?: QuestionWhereUniqueInput | QuestionWhereUniqueInput[]
    update?: QuestionUpdateWithWhereUniqueWithoutQuestionBankInput | QuestionUpdateWithWhereUniqueWithoutQuestionBankInput[]
    updateMany?: QuestionUpdateManyWithWhereWithoutQuestionBankInput | QuestionUpdateManyWithWhereWithoutQuestionBankInput[]
    deleteMany?: QuestionScalarWhereInput | QuestionScalarWhereInput[]
  }

  export type QuestionUncheckedUpdateManyWithoutQuestionBankNestedInput = {
    create?: XOR<QuestionCreateWithoutQuestionBankInput, QuestionUncheckedCreateWithoutQuestionBankInput> | QuestionCreateWithoutQuestionBankInput[] | QuestionUncheckedCreateWithoutQuestionBankInput[]
    connectOrCreate?: QuestionCreateOrConnectWithoutQuestionBankInput | QuestionCreateOrConnectWithoutQuestionBankInput[]
    upsert?: QuestionUpsertWithWhereUniqueWithoutQuestionBankInput | QuestionUpsertWithWhereUniqueWithoutQuestionBankInput[]
    createMany?: QuestionCreateManyQuestionBankInputEnvelope
    set?: QuestionWhereUniqueInput | QuestionWhereUniqueInput[]
    disconnect?: QuestionWhereUniqueInput | QuestionWhereUniqueInput[]
    delete?: QuestionWhereUniqueInput | QuestionWhereUniqueInput[]
    connect?: QuestionWhereUniqueInput | QuestionWhereUniqueInput[]
    update?: QuestionUpdateWithWhereUniqueWithoutQuestionBankInput | QuestionUpdateWithWhereUniqueWithoutQuestionBankInput[]
    updateMany?: QuestionUpdateManyWithWhereWithoutQuestionBankInput | QuestionUpdateManyWithWhereWithoutQuestionBankInput[]
    deleteMany?: QuestionScalarWhereInput | QuestionScalarWhereInput[]
  }

  export type QuestionBankCreateNestedOneWithoutQuestionsInput = {
    create?: XOR<QuestionBankCreateWithoutQuestionsInput, QuestionBankUncheckedCreateWithoutQuestionsInput>
    connectOrCreate?: QuestionBankCreateOrConnectWithoutQuestionsInput
    connect?: QuestionBankWhereUniqueInput
  }

  export type EnumQuestionTypeFieldUpdateOperationsInput = {
    set?: $Enums.QuestionType
  }

  export type QuestionBankUpdateOneRequiredWithoutQuestionsNestedInput = {
    create?: XOR<QuestionBankCreateWithoutQuestionsInput, QuestionBankUncheckedCreateWithoutQuestionsInput>
    connectOrCreate?: QuestionBankCreateOrConnectWithoutQuestionsInput
    upsert?: QuestionBankUpsertWithoutQuestionsInput
    connect?: QuestionBankWhereUniqueInput
    update?: XOR<XOR<QuestionBankUpdateToOneWithWhereWithoutQuestionsInput, QuestionBankUpdateWithoutQuestionsInput>, QuestionBankUncheckedUpdateWithoutQuestionsInput>
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

  export type NestedEnumAssessmentStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.AssessmentStatus | EnumAssessmentStatusFieldRefInput<$PrismaModel>
    in?: $Enums.AssessmentStatus[] | ListEnumAssessmentStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.AssessmentStatus[] | ListEnumAssessmentStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumAssessmentStatusFilter<$PrismaModel> | $Enums.AssessmentStatus
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

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
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

  export type NestedEnumAssessmentStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AssessmentStatus | EnumAssessmentStatusFieldRefInput<$PrismaModel>
    in?: $Enums.AssessmentStatus[] | ListEnumAssessmentStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.AssessmentStatus[] | ListEnumAssessmentStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumAssessmentStatusWithAggregatesFilter<$PrismaModel> | $Enums.AssessmentStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAssessmentStatusFilter<$PrismaModel>
    _max?: NestedEnumAssessmentStatusFilter<$PrismaModel>
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

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
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

  export type NestedEnumAssessmentInviteStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.AssessmentInviteStatus | EnumAssessmentInviteStatusFieldRefInput<$PrismaModel>
    in?: $Enums.AssessmentInviteStatus[] | ListEnumAssessmentInviteStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.AssessmentInviteStatus[] | ListEnumAssessmentInviteStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumAssessmentInviteStatusFilter<$PrismaModel> | $Enums.AssessmentInviteStatus
  }

  export type NestedEnumAssessmentInviteStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AssessmentInviteStatus | EnumAssessmentInviteStatusFieldRefInput<$PrismaModel>
    in?: $Enums.AssessmentInviteStatus[] | ListEnumAssessmentInviteStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.AssessmentInviteStatus[] | ListEnumAssessmentInviteStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumAssessmentInviteStatusWithAggregatesFilter<$PrismaModel> | $Enums.AssessmentInviteStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAssessmentInviteStatusFilter<$PrismaModel>
    _max?: NestedEnumAssessmentInviteStatusFilter<$PrismaModel>
  }

  export type NestedEnumAttemptStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.AttemptStatus | EnumAttemptStatusFieldRefInput<$PrismaModel>
    in?: $Enums.AttemptStatus[] | ListEnumAttemptStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.AttemptStatus[] | ListEnumAttemptStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumAttemptStatusFilter<$PrismaModel> | $Enums.AttemptStatus
  }

  export type NestedEnumAttemptStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AttemptStatus | EnumAttemptStatusFieldRefInput<$PrismaModel>
    in?: $Enums.AttemptStatus[] | ListEnumAttemptStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.AttemptStatus[] | ListEnumAttemptStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumAttemptStatusWithAggregatesFilter<$PrismaModel> | $Enums.AttemptStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAttemptStatusFilter<$PrismaModel>
    _max?: NestedEnumAttemptStatusFilter<$PrismaModel>
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

  export type NestedBoolNullableFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableFilter<$PrismaModel> | boolean | null
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedBoolNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableWithAggregatesFilter<$PrismaModel> | boolean | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedBoolNullableFilter<$PrismaModel>
    _max?: NestedBoolNullableFilter<$PrismaModel>
  }

  export type NestedEnumQuestionTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.QuestionType | EnumQuestionTypeFieldRefInput<$PrismaModel>
    in?: $Enums.QuestionType[] | ListEnumQuestionTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.QuestionType[] | ListEnumQuestionTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumQuestionTypeFilter<$PrismaModel> | $Enums.QuestionType
  }

  export type NestedEnumQuestionTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.QuestionType | EnumQuestionTypeFieldRefInput<$PrismaModel>
    in?: $Enums.QuestionType[] | ListEnumQuestionTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.QuestionType[] | ListEnumQuestionTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumQuestionTypeWithAggregatesFilter<$PrismaModel> | $Enums.QuestionType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumQuestionTypeFilter<$PrismaModel>
    _max?: NestedEnumQuestionTypeFilter<$PrismaModel>
  }

  export type AssessmentInviteCreateWithoutAssessmentInput = {
    id?: string
    tenantId: string
    candidateId: string
    applicationId?: string | null
    tokenHash: string
    provider?: string | null
    providerInvitationId?: string | null
    providerSecret?: string | null
    email: string
    status?: $Enums.AssessmentInviteStatus
    expiresAt?: Date | string | null
    sentAt?: Date | string | null
    openedAt?: Date | string | null
    startedAt?: Date | string | null
    submittedAt?: Date | string | null
    consumedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    attempt?: AttemptCreateNestedOneWithoutInviteInput
  }

  export type AssessmentInviteUncheckedCreateWithoutAssessmentInput = {
    id?: string
    tenantId: string
    candidateId: string
    applicationId?: string | null
    tokenHash: string
    provider?: string | null
    providerInvitationId?: string | null
    providerSecret?: string | null
    email: string
    status?: $Enums.AssessmentInviteStatus
    expiresAt?: Date | string | null
    sentAt?: Date | string | null
    openedAt?: Date | string | null
    startedAt?: Date | string | null
    submittedAt?: Date | string | null
    consumedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    attempt?: AttemptUncheckedCreateNestedOneWithoutInviteInput
  }

  export type AssessmentInviteCreateOrConnectWithoutAssessmentInput = {
    where: AssessmentInviteWhereUniqueInput
    create: XOR<AssessmentInviteCreateWithoutAssessmentInput, AssessmentInviteUncheckedCreateWithoutAssessmentInput>
  }

  export type AssessmentInviteCreateManyAssessmentInputEnvelope = {
    data: AssessmentInviteCreateManyAssessmentInput | AssessmentInviteCreateManyAssessmentInput[]
    skipDuplicates?: boolean
  }

  export type AttemptCreateWithoutAssessmentInput = {
    id?: string
    tenantId: string
    candidateId: string
    status?: $Enums.AttemptStatus
    startedAt?: Date | string | null
    submittedAt?: Date | string | null
    durationSeconds?: number | null
    questionOrder?: JsonNullValueInput | InputJsonValue
    answerKey?: JsonNullValueInput | InputJsonValue
    sessionTokenHash?: string | null
    remainingSeconds?: number | null
    lastHeartbeatAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    invite: AssessmentInviteCreateNestedOneWithoutAttemptInput
    answers?: AnswerCreateNestedManyWithoutAttemptInput
    proctorEvents?: ProctorEventCreateNestedManyWithoutAttemptInput
    result?: AssessmentResultCreateNestedOneWithoutAttemptInput
  }

  export type AttemptUncheckedCreateWithoutAssessmentInput = {
    id?: string
    tenantId: string
    inviteId: string
    candidateId: string
    status?: $Enums.AttemptStatus
    startedAt?: Date | string | null
    submittedAt?: Date | string | null
    durationSeconds?: number | null
    questionOrder?: JsonNullValueInput | InputJsonValue
    answerKey?: JsonNullValueInput | InputJsonValue
    sessionTokenHash?: string | null
    remainingSeconds?: number | null
    lastHeartbeatAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    answers?: AnswerUncheckedCreateNestedManyWithoutAttemptInput
    proctorEvents?: ProctorEventUncheckedCreateNestedManyWithoutAttemptInput
    result?: AssessmentResultUncheckedCreateNestedOneWithoutAttemptInput
  }

  export type AttemptCreateOrConnectWithoutAssessmentInput = {
    where: AttemptWhereUniqueInput
    create: XOR<AttemptCreateWithoutAssessmentInput, AttemptUncheckedCreateWithoutAssessmentInput>
  }

  export type AttemptCreateManyAssessmentInputEnvelope = {
    data: AttemptCreateManyAssessmentInput | AttemptCreateManyAssessmentInput[]
    skipDuplicates?: boolean
  }

  export type AssessmentResultCreateWithoutAssessmentInput = {
    id?: string
    tenantId: string
    candidateId: string
    rawScore: number
    maxScore: number
    passed?: boolean | null
    pendingManualReview?: boolean
    perQuestion?: JsonNullValueInput | InputJsonValue
    explainability?: NullableJsonNullValueInput | InputJsonValue
    gradedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    attempt: AttemptCreateNestedOneWithoutResultInput
  }

  export type AssessmentResultUncheckedCreateWithoutAssessmentInput = {
    id?: string
    tenantId: string
    attemptId: string
    candidateId: string
    rawScore: number
    maxScore: number
    passed?: boolean | null
    pendingManualReview?: boolean
    perQuestion?: JsonNullValueInput | InputJsonValue
    explainability?: NullableJsonNullValueInput | InputJsonValue
    gradedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AssessmentResultCreateOrConnectWithoutAssessmentInput = {
    where: AssessmentResultWhereUniqueInput
    create: XOR<AssessmentResultCreateWithoutAssessmentInput, AssessmentResultUncheckedCreateWithoutAssessmentInput>
  }

  export type AssessmentResultCreateManyAssessmentInputEnvelope = {
    data: AssessmentResultCreateManyAssessmentInput | AssessmentResultCreateManyAssessmentInput[]
    skipDuplicates?: boolean
  }

  export type AssessmentInviteUpsertWithWhereUniqueWithoutAssessmentInput = {
    where: AssessmentInviteWhereUniqueInput
    update: XOR<AssessmentInviteUpdateWithoutAssessmentInput, AssessmentInviteUncheckedUpdateWithoutAssessmentInput>
    create: XOR<AssessmentInviteCreateWithoutAssessmentInput, AssessmentInviteUncheckedCreateWithoutAssessmentInput>
  }

  export type AssessmentInviteUpdateWithWhereUniqueWithoutAssessmentInput = {
    where: AssessmentInviteWhereUniqueInput
    data: XOR<AssessmentInviteUpdateWithoutAssessmentInput, AssessmentInviteUncheckedUpdateWithoutAssessmentInput>
  }

  export type AssessmentInviteUpdateManyWithWhereWithoutAssessmentInput = {
    where: AssessmentInviteScalarWhereInput
    data: XOR<AssessmentInviteUpdateManyMutationInput, AssessmentInviteUncheckedUpdateManyWithoutAssessmentInput>
  }

  export type AssessmentInviteScalarWhereInput = {
    AND?: AssessmentInviteScalarWhereInput | AssessmentInviteScalarWhereInput[]
    OR?: AssessmentInviteScalarWhereInput[]
    NOT?: AssessmentInviteScalarWhereInput | AssessmentInviteScalarWhereInput[]
    id?: StringFilter<"AssessmentInvite"> | string
    tenantId?: StringFilter<"AssessmentInvite"> | string
    assessmentId?: StringFilter<"AssessmentInvite"> | string
    candidateId?: StringFilter<"AssessmentInvite"> | string
    applicationId?: StringNullableFilter<"AssessmentInvite"> | string | null
    tokenHash?: StringFilter<"AssessmentInvite"> | string
    provider?: StringNullableFilter<"AssessmentInvite"> | string | null
    providerInvitationId?: StringNullableFilter<"AssessmentInvite"> | string | null
    providerSecret?: StringNullableFilter<"AssessmentInvite"> | string | null
    email?: StringFilter<"AssessmentInvite"> | string
    status?: EnumAssessmentInviteStatusFilter<"AssessmentInvite"> | $Enums.AssessmentInviteStatus
    expiresAt?: DateTimeNullableFilter<"AssessmentInvite"> | Date | string | null
    sentAt?: DateTimeNullableFilter<"AssessmentInvite"> | Date | string | null
    openedAt?: DateTimeNullableFilter<"AssessmentInvite"> | Date | string | null
    startedAt?: DateTimeNullableFilter<"AssessmentInvite"> | Date | string | null
    submittedAt?: DateTimeNullableFilter<"AssessmentInvite"> | Date | string | null
    consumedAt?: DateTimeNullableFilter<"AssessmentInvite"> | Date | string | null
    createdAt?: DateTimeFilter<"AssessmentInvite"> | Date | string
    updatedAt?: DateTimeFilter<"AssessmentInvite"> | Date | string
  }

  export type AttemptUpsertWithWhereUniqueWithoutAssessmentInput = {
    where: AttemptWhereUniqueInput
    update: XOR<AttemptUpdateWithoutAssessmentInput, AttemptUncheckedUpdateWithoutAssessmentInput>
    create: XOR<AttemptCreateWithoutAssessmentInput, AttemptUncheckedCreateWithoutAssessmentInput>
  }

  export type AttemptUpdateWithWhereUniqueWithoutAssessmentInput = {
    where: AttemptWhereUniqueInput
    data: XOR<AttemptUpdateWithoutAssessmentInput, AttemptUncheckedUpdateWithoutAssessmentInput>
  }

  export type AttemptUpdateManyWithWhereWithoutAssessmentInput = {
    where: AttemptScalarWhereInput
    data: XOR<AttemptUpdateManyMutationInput, AttemptUncheckedUpdateManyWithoutAssessmentInput>
  }

  export type AttemptScalarWhereInput = {
    AND?: AttemptScalarWhereInput | AttemptScalarWhereInput[]
    OR?: AttemptScalarWhereInput[]
    NOT?: AttemptScalarWhereInput | AttemptScalarWhereInput[]
    id?: StringFilter<"Attempt"> | string
    tenantId?: StringFilter<"Attempt"> | string
    assessmentId?: StringFilter<"Attempt"> | string
    inviteId?: StringFilter<"Attempt"> | string
    candidateId?: StringFilter<"Attempt"> | string
    status?: EnumAttemptStatusFilter<"Attempt"> | $Enums.AttemptStatus
    startedAt?: DateTimeNullableFilter<"Attempt"> | Date | string | null
    submittedAt?: DateTimeNullableFilter<"Attempt"> | Date | string | null
    durationSeconds?: IntNullableFilter<"Attempt"> | number | null
    questionOrder?: JsonFilter<"Attempt">
    answerKey?: JsonFilter<"Attempt">
    sessionTokenHash?: StringNullableFilter<"Attempt"> | string | null
    remainingSeconds?: IntNullableFilter<"Attempt"> | number | null
    lastHeartbeatAt?: DateTimeNullableFilter<"Attempt"> | Date | string | null
    createdAt?: DateTimeFilter<"Attempt"> | Date | string
    updatedAt?: DateTimeFilter<"Attempt"> | Date | string
  }

  export type AssessmentResultUpsertWithWhereUniqueWithoutAssessmentInput = {
    where: AssessmentResultWhereUniqueInput
    update: XOR<AssessmentResultUpdateWithoutAssessmentInput, AssessmentResultUncheckedUpdateWithoutAssessmentInput>
    create: XOR<AssessmentResultCreateWithoutAssessmentInput, AssessmentResultUncheckedCreateWithoutAssessmentInput>
  }

  export type AssessmentResultUpdateWithWhereUniqueWithoutAssessmentInput = {
    where: AssessmentResultWhereUniqueInput
    data: XOR<AssessmentResultUpdateWithoutAssessmentInput, AssessmentResultUncheckedUpdateWithoutAssessmentInput>
  }

  export type AssessmentResultUpdateManyWithWhereWithoutAssessmentInput = {
    where: AssessmentResultScalarWhereInput
    data: XOR<AssessmentResultUpdateManyMutationInput, AssessmentResultUncheckedUpdateManyWithoutAssessmentInput>
  }

  export type AssessmentResultScalarWhereInput = {
    AND?: AssessmentResultScalarWhereInput | AssessmentResultScalarWhereInput[]
    OR?: AssessmentResultScalarWhereInput[]
    NOT?: AssessmentResultScalarWhereInput | AssessmentResultScalarWhereInput[]
    id?: StringFilter<"AssessmentResult"> | string
    tenantId?: StringFilter<"AssessmentResult"> | string
    assessmentId?: StringFilter<"AssessmentResult"> | string
    attemptId?: StringFilter<"AssessmentResult"> | string
    candidateId?: StringFilter<"AssessmentResult"> | string
    rawScore?: FloatFilter<"AssessmentResult"> | number
    maxScore?: FloatFilter<"AssessmentResult"> | number
    passed?: BoolNullableFilter<"AssessmentResult"> | boolean | null
    pendingManualReview?: BoolFilter<"AssessmentResult"> | boolean
    perQuestion?: JsonFilter<"AssessmentResult">
    explainability?: JsonNullableFilter<"AssessmentResult">
    gradedAt?: DateTimeNullableFilter<"AssessmentResult"> | Date | string | null
    createdAt?: DateTimeFilter<"AssessmentResult"> | Date | string
    updatedAt?: DateTimeFilter<"AssessmentResult"> | Date | string
  }

  export type AssessmentCreateWithoutInvitesInput = {
    id?: string
    tenantId: string
    requisitionId?: string | null
    questionBankId?: string | null
    title: string
    description?: string | null
    status?: $Enums.AssessmentStatus
    durationMinutes?: number | null
    passingScore?: number | null
    shuffleQuestions?: boolean
    questions?: JsonNullValueInput | InputJsonValue
    schemaJson?: JsonNullValueInput | InputJsonValue
    version?: number
    publishedHash?: string | null
    publishedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    attempts?: AttemptCreateNestedManyWithoutAssessmentInput
    results?: AssessmentResultCreateNestedManyWithoutAssessmentInput
  }

  export type AssessmentUncheckedCreateWithoutInvitesInput = {
    id?: string
    tenantId: string
    requisitionId?: string | null
    questionBankId?: string | null
    title: string
    description?: string | null
    status?: $Enums.AssessmentStatus
    durationMinutes?: number | null
    passingScore?: number | null
    shuffleQuestions?: boolean
    questions?: JsonNullValueInput | InputJsonValue
    schemaJson?: JsonNullValueInput | InputJsonValue
    version?: number
    publishedHash?: string | null
    publishedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    attempts?: AttemptUncheckedCreateNestedManyWithoutAssessmentInput
    results?: AssessmentResultUncheckedCreateNestedManyWithoutAssessmentInput
  }

  export type AssessmentCreateOrConnectWithoutInvitesInput = {
    where: AssessmentWhereUniqueInput
    create: XOR<AssessmentCreateWithoutInvitesInput, AssessmentUncheckedCreateWithoutInvitesInput>
  }

  export type AttemptCreateWithoutInviteInput = {
    id?: string
    tenantId: string
    candidateId: string
    status?: $Enums.AttemptStatus
    startedAt?: Date | string | null
    submittedAt?: Date | string | null
    durationSeconds?: number | null
    questionOrder?: JsonNullValueInput | InputJsonValue
    answerKey?: JsonNullValueInput | InputJsonValue
    sessionTokenHash?: string | null
    remainingSeconds?: number | null
    lastHeartbeatAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    assessment: AssessmentCreateNestedOneWithoutAttemptsInput
    answers?: AnswerCreateNestedManyWithoutAttemptInput
    proctorEvents?: ProctorEventCreateNestedManyWithoutAttemptInput
    result?: AssessmentResultCreateNestedOneWithoutAttemptInput
  }

  export type AttemptUncheckedCreateWithoutInviteInput = {
    id?: string
    tenantId: string
    assessmentId: string
    candidateId: string
    status?: $Enums.AttemptStatus
    startedAt?: Date | string | null
    submittedAt?: Date | string | null
    durationSeconds?: number | null
    questionOrder?: JsonNullValueInput | InputJsonValue
    answerKey?: JsonNullValueInput | InputJsonValue
    sessionTokenHash?: string | null
    remainingSeconds?: number | null
    lastHeartbeatAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    answers?: AnswerUncheckedCreateNestedManyWithoutAttemptInput
    proctorEvents?: ProctorEventUncheckedCreateNestedManyWithoutAttemptInput
    result?: AssessmentResultUncheckedCreateNestedOneWithoutAttemptInput
  }

  export type AttemptCreateOrConnectWithoutInviteInput = {
    where: AttemptWhereUniqueInput
    create: XOR<AttemptCreateWithoutInviteInput, AttemptUncheckedCreateWithoutInviteInput>
  }

  export type AssessmentUpsertWithoutInvitesInput = {
    update: XOR<AssessmentUpdateWithoutInvitesInput, AssessmentUncheckedUpdateWithoutInvitesInput>
    create: XOR<AssessmentCreateWithoutInvitesInput, AssessmentUncheckedCreateWithoutInvitesInput>
    where?: AssessmentWhereInput
  }

  export type AssessmentUpdateToOneWithWhereWithoutInvitesInput = {
    where?: AssessmentWhereInput
    data: XOR<AssessmentUpdateWithoutInvitesInput, AssessmentUncheckedUpdateWithoutInvitesInput>
  }

  export type AssessmentUpdateWithoutInvitesInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    requisitionId?: NullableStringFieldUpdateOperationsInput | string | null
    questionBankId?: NullableStringFieldUpdateOperationsInput | string | null
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumAssessmentStatusFieldUpdateOperationsInput | $Enums.AssessmentStatus
    durationMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    passingScore?: NullableIntFieldUpdateOperationsInput | number | null
    shuffleQuestions?: BoolFieldUpdateOperationsInput | boolean
    questions?: JsonNullValueInput | InputJsonValue
    schemaJson?: JsonNullValueInput | InputJsonValue
    version?: IntFieldUpdateOperationsInput | number
    publishedHash?: NullableStringFieldUpdateOperationsInput | string | null
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    attempts?: AttemptUpdateManyWithoutAssessmentNestedInput
    results?: AssessmentResultUpdateManyWithoutAssessmentNestedInput
  }

  export type AssessmentUncheckedUpdateWithoutInvitesInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    requisitionId?: NullableStringFieldUpdateOperationsInput | string | null
    questionBankId?: NullableStringFieldUpdateOperationsInput | string | null
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumAssessmentStatusFieldUpdateOperationsInput | $Enums.AssessmentStatus
    durationMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    passingScore?: NullableIntFieldUpdateOperationsInput | number | null
    shuffleQuestions?: BoolFieldUpdateOperationsInput | boolean
    questions?: JsonNullValueInput | InputJsonValue
    schemaJson?: JsonNullValueInput | InputJsonValue
    version?: IntFieldUpdateOperationsInput | number
    publishedHash?: NullableStringFieldUpdateOperationsInput | string | null
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    attempts?: AttemptUncheckedUpdateManyWithoutAssessmentNestedInput
    results?: AssessmentResultUncheckedUpdateManyWithoutAssessmentNestedInput
  }

  export type AttemptUpsertWithoutInviteInput = {
    update: XOR<AttemptUpdateWithoutInviteInput, AttemptUncheckedUpdateWithoutInviteInput>
    create: XOR<AttemptCreateWithoutInviteInput, AttemptUncheckedCreateWithoutInviteInput>
    where?: AttemptWhereInput
  }

  export type AttemptUpdateToOneWithWhereWithoutInviteInput = {
    where?: AttemptWhereInput
    data: XOR<AttemptUpdateWithoutInviteInput, AttemptUncheckedUpdateWithoutInviteInput>
  }

  export type AttemptUpdateWithoutInviteInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    status?: EnumAttemptStatusFieldUpdateOperationsInput | $Enums.AttemptStatus
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    submittedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    durationSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    questionOrder?: JsonNullValueInput | InputJsonValue
    answerKey?: JsonNullValueInput | InputJsonValue
    sessionTokenHash?: NullableStringFieldUpdateOperationsInput | string | null
    remainingSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    lastHeartbeatAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    assessment?: AssessmentUpdateOneRequiredWithoutAttemptsNestedInput
    answers?: AnswerUpdateManyWithoutAttemptNestedInput
    proctorEvents?: ProctorEventUpdateManyWithoutAttemptNestedInput
    result?: AssessmentResultUpdateOneWithoutAttemptNestedInput
  }

  export type AttemptUncheckedUpdateWithoutInviteInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    assessmentId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    status?: EnumAttemptStatusFieldUpdateOperationsInput | $Enums.AttemptStatus
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    submittedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    durationSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    questionOrder?: JsonNullValueInput | InputJsonValue
    answerKey?: JsonNullValueInput | InputJsonValue
    sessionTokenHash?: NullableStringFieldUpdateOperationsInput | string | null
    remainingSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    lastHeartbeatAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    answers?: AnswerUncheckedUpdateManyWithoutAttemptNestedInput
    proctorEvents?: ProctorEventUncheckedUpdateManyWithoutAttemptNestedInput
    result?: AssessmentResultUncheckedUpdateOneWithoutAttemptNestedInput
  }

  export type AssessmentCreateWithoutAttemptsInput = {
    id?: string
    tenantId: string
    requisitionId?: string | null
    questionBankId?: string | null
    title: string
    description?: string | null
    status?: $Enums.AssessmentStatus
    durationMinutes?: number | null
    passingScore?: number | null
    shuffleQuestions?: boolean
    questions?: JsonNullValueInput | InputJsonValue
    schemaJson?: JsonNullValueInput | InputJsonValue
    version?: number
    publishedHash?: string | null
    publishedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    invites?: AssessmentInviteCreateNestedManyWithoutAssessmentInput
    results?: AssessmentResultCreateNestedManyWithoutAssessmentInput
  }

  export type AssessmentUncheckedCreateWithoutAttemptsInput = {
    id?: string
    tenantId: string
    requisitionId?: string | null
    questionBankId?: string | null
    title: string
    description?: string | null
    status?: $Enums.AssessmentStatus
    durationMinutes?: number | null
    passingScore?: number | null
    shuffleQuestions?: boolean
    questions?: JsonNullValueInput | InputJsonValue
    schemaJson?: JsonNullValueInput | InputJsonValue
    version?: number
    publishedHash?: string | null
    publishedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    invites?: AssessmentInviteUncheckedCreateNestedManyWithoutAssessmentInput
    results?: AssessmentResultUncheckedCreateNestedManyWithoutAssessmentInput
  }

  export type AssessmentCreateOrConnectWithoutAttemptsInput = {
    where: AssessmentWhereUniqueInput
    create: XOR<AssessmentCreateWithoutAttemptsInput, AssessmentUncheckedCreateWithoutAttemptsInput>
  }

  export type AssessmentInviteCreateWithoutAttemptInput = {
    id?: string
    tenantId: string
    candidateId: string
    applicationId?: string | null
    tokenHash: string
    provider?: string | null
    providerInvitationId?: string | null
    providerSecret?: string | null
    email: string
    status?: $Enums.AssessmentInviteStatus
    expiresAt?: Date | string | null
    sentAt?: Date | string | null
    openedAt?: Date | string | null
    startedAt?: Date | string | null
    submittedAt?: Date | string | null
    consumedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    assessment: AssessmentCreateNestedOneWithoutInvitesInput
  }

  export type AssessmentInviteUncheckedCreateWithoutAttemptInput = {
    id?: string
    tenantId: string
    assessmentId: string
    candidateId: string
    applicationId?: string | null
    tokenHash: string
    provider?: string | null
    providerInvitationId?: string | null
    providerSecret?: string | null
    email: string
    status?: $Enums.AssessmentInviteStatus
    expiresAt?: Date | string | null
    sentAt?: Date | string | null
    openedAt?: Date | string | null
    startedAt?: Date | string | null
    submittedAt?: Date | string | null
    consumedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AssessmentInviteCreateOrConnectWithoutAttemptInput = {
    where: AssessmentInviteWhereUniqueInput
    create: XOR<AssessmentInviteCreateWithoutAttemptInput, AssessmentInviteUncheckedCreateWithoutAttemptInput>
  }

  export type AnswerCreateWithoutAttemptInput = {
    id?: string
    tenantId: string
    questionId: string
    value?: NullableJsonNullValueInput | InputJsonValue
    timeSpentSeconds?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AnswerUncheckedCreateWithoutAttemptInput = {
    id?: string
    tenantId: string
    questionId: string
    value?: NullableJsonNullValueInput | InputJsonValue
    timeSpentSeconds?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AnswerCreateOrConnectWithoutAttemptInput = {
    where: AnswerWhereUniqueInput
    create: XOR<AnswerCreateWithoutAttemptInput, AnswerUncheckedCreateWithoutAttemptInput>
  }

  export type AnswerCreateManyAttemptInputEnvelope = {
    data: AnswerCreateManyAttemptInput | AnswerCreateManyAttemptInput[]
    skipDuplicates?: boolean
  }

  export type ProctorEventCreateWithoutAttemptInput = {
    id?: string
    tenantId: string
    type: string
    metadata?: JsonNullValueInput | InputJsonValue
    occurredAt?: Date | string
    createdAt?: Date | string
  }

  export type ProctorEventUncheckedCreateWithoutAttemptInput = {
    id?: string
    tenantId: string
    type: string
    metadata?: JsonNullValueInput | InputJsonValue
    occurredAt?: Date | string
    createdAt?: Date | string
  }

  export type ProctorEventCreateOrConnectWithoutAttemptInput = {
    where: ProctorEventWhereUniqueInput
    create: XOR<ProctorEventCreateWithoutAttemptInput, ProctorEventUncheckedCreateWithoutAttemptInput>
  }

  export type ProctorEventCreateManyAttemptInputEnvelope = {
    data: ProctorEventCreateManyAttemptInput | ProctorEventCreateManyAttemptInput[]
    skipDuplicates?: boolean
  }

  export type AssessmentResultCreateWithoutAttemptInput = {
    id?: string
    tenantId: string
    candidateId: string
    rawScore: number
    maxScore: number
    passed?: boolean | null
    pendingManualReview?: boolean
    perQuestion?: JsonNullValueInput | InputJsonValue
    explainability?: NullableJsonNullValueInput | InputJsonValue
    gradedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    assessment: AssessmentCreateNestedOneWithoutResultsInput
  }

  export type AssessmentResultUncheckedCreateWithoutAttemptInput = {
    id?: string
    tenantId: string
    assessmentId: string
    candidateId: string
    rawScore: number
    maxScore: number
    passed?: boolean | null
    pendingManualReview?: boolean
    perQuestion?: JsonNullValueInput | InputJsonValue
    explainability?: NullableJsonNullValueInput | InputJsonValue
    gradedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AssessmentResultCreateOrConnectWithoutAttemptInput = {
    where: AssessmentResultWhereUniqueInput
    create: XOR<AssessmentResultCreateWithoutAttemptInput, AssessmentResultUncheckedCreateWithoutAttemptInput>
  }

  export type AssessmentUpsertWithoutAttemptsInput = {
    update: XOR<AssessmentUpdateWithoutAttemptsInput, AssessmentUncheckedUpdateWithoutAttemptsInput>
    create: XOR<AssessmentCreateWithoutAttemptsInput, AssessmentUncheckedCreateWithoutAttemptsInput>
    where?: AssessmentWhereInput
  }

  export type AssessmentUpdateToOneWithWhereWithoutAttemptsInput = {
    where?: AssessmentWhereInput
    data: XOR<AssessmentUpdateWithoutAttemptsInput, AssessmentUncheckedUpdateWithoutAttemptsInput>
  }

  export type AssessmentUpdateWithoutAttemptsInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    requisitionId?: NullableStringFieldUpdateOperationsInput | string | null
    questionBankId?: NullableStringFieldUpdateOperationsInput | string | null
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumAssessmentStatusFieldUpdateOperationsInput | $Enums.AssessmentStatus
    durationMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    passingScore?: NullableIntFieldUpdateOperationsInput | number | null
    shuffleQuestions?: BoolFieldUpdateOperationsInput | boolean
    questions?: JsonNullValueInput | InputJsonValue
    schemaJson?: JsonNullValueInput | InputJsonValue
    version?: IntFieldUpdateOperationsInput | number
    publishedHash?: NullableStringFieldUpdateOperationsInput | string | null
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    invites?: AssessmentInviteUpdateManyWithoutAssessmentNestedInput
    results?: AssessmentResultUpdateManyWithoutAssessmentNestedInput
  }

  export type AssessmentUncheckedUpdateWithoutAttemptsInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    requisitionId?: NullableStringFieldUpdateOperationsInput | string | null
    questionBankId?: NullableStringFieldUpdateOperationsInput | string | null
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumAssessmentStatusFieldUpdateOperationsInput | $Enums.AssessmentStatus
    durationMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    passingScore?: NullableIntFieldUpdateOperationsInput | number | null
    shuffleQuestions?: BoolFieldUpdateOperationsInput | boolean
    questions?: JsonNullValueInput | InputJsonValue
    schemaJson?: JsonNullValueInput | InputJsonValue
    version?: IntFieldUpdateOperationsInput | number
    publishedHash?: NullableStringFieldUpdateOperationsInput | string | null
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    invites?: AssessmentInviteUncheckedUpdateManyWithoutAssessmentNestedInput
    results?: AssessmentResultUncheckedUpdateManyWithoutAssessmentNestedInput
  }

  export type AssessmentInviteUpsertWithoutAttemptInput = {
    update: XOR<AssessmentInviteUpdateWithoutAttemptInput, AssessmentInviteUncheckedUpdateWithoutAttemptInput>
    create: XOR<AssessmentInviteCreateWithoutAttemptInput, AssessmentInviteUncheckedCreateWithoutAttemptInput>
    where?: AssessmentInviteWhereInput
  }

  export type AssessmentInviteUpdateToOneWithWhereWithoutAttemptInput = {
    where?: AssessmentInviteWhereInput
    data: XOR<AssessmentInviteUpdateWithoutAttemptInput, AssessmentInviteUncheckedUpdateWithoutAttemptInput>
  }

  export type AssessmentInviteUpdateWithoutAttemptInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    applicationId?: NullableStringFieldUpdateOperationsInput | string | null
    tokenHash?: StringFieldUpdateOperationsInput | string
    provider?: NullableStringFieldUpdateOperationsInput | string | null
    providerInvitationId?: NullableStringFieldUpdateOperationsInput | string | null
    providerSecret?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    status?: EnumAssessmentInviteStatusFieldUpdateOperationsInput | $Enums.AssessmentInviteStatus
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    openedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    submittedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    consumedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    assessment?: AssessmentUpdateOneRequiredWithoutInvitesNestedInput
  }

  export type AssessmentInviteUncheckedUpdateWithoutAttemptInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    assessmentId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    applicationId?: NullableStringFieldUpdateOperationsInput | string | null
    tokenHash?: StringFieldUpdateOperationsInput | string
    provider?: NullableStringFieldUpdateOperationsInput | string | null
    providerInvitationId?: NullableStringFieldUpdateOperationsInput | string | null
    providerSecret?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    status?: EnumAssessmentInviteStatusFieldUpdateOperationsInput | $Enums.AssessmentInviteStatus
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    openedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    submittedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    consumedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AnswerUpsertWithWhereUniqueWithoutAttemptInput = {
    where: AnswerWhereUniqueInput
    update: XOR<AnswerUpdateWithoutAttemptInput, AnswerUncheckedUpdateWithoutAttemptInput>
    create: XOR<AnswerCreateWithoutAttemptInput, AnswerUncheckedCreateWithoutAttemptInput>
  }

  export type AnswerUpdateWithWhereUniqueWithoutAttemptInput = {
    where: AnswerWhereUniqueInput
    data: XOR<AnswerUpdateWithoutAttemptInput, AnswerUncheckedUpdateWithoutAttemptInput>
  }

  export type AnswerUpdateManyWithWhereWithoutAttemptInput = {
    where: AnswerScalarWhereInput
    data: XOR<AnswerUpdateManyMutationInput, AnswerUncheckedUpdateManyWithoutAttemptInput>
  }

  export type AnswerScalarWhereInput = {
    AND?: AnswerScalarWhereInput | AnswerScalarWhereInput[]
    OR?: AnswerScalarWhereInput[]
    NOT?: AnswerScalarWhereInput | AnswerScalarWhereInput[]
    id?: StringFilter<"Answer"> | string
    tenantId?: StringFilter<"Answer"> | string
    attemptId?: StringFilter<"Answer"> | string
    questionId?: StringFilter<"Answer"> | string
    value?: JsonNullableFilter<"Answer">
    timeSpentSeconds?: IntNullableFilter<"Answer"> | number | null
    createdAt?: DateTimeFilter<"Answer"> | Date | string
    updatedAt?: DateTimeFilter<"Answer"> | Date | string
  }

  export type ProctorEventUpsertWithWhereUniqueWithoutAttemptInput = {
    where: ProctorEventWhereUniqueInput
    update: XOR<ProctorEventUpdateWithoutAttemptInput, ProctorEventUncheckedUpdateWithoutAttemptInput>
    create: XOR<ProctorEventCreateWithoutAttemptInput, ProctorEventUncheckedCreateWithoutAttemptInput>
  }

  export type ProctorEventUpdateWithWhereUniqueWithoutAttemptInput = {
    where: ProctorEventWhereUniqueInput
    data: XOR<ProctorEventUpdateWithoutAttemptInput, ProctorEventUncheckedUpdateWithoutAttemptInput>
  }

  export type ProctorEventUpdateManyWithWhereWithoutAttemptInput = {
    where: ProctorEventScalarWhereInput
    data: XOR<ProctorEventUpdateManyMutationInput, ProctorEventUncheckedUpdateManyWithoutAttemptInput>
  }

  export type ProctorEventScalarWhereInput = {
    AND?: ProctorEventScalarWhereInput | ProctorEventScalarWhereInput[]
    OR?: ProctorEventScalarWhereInput[]
    NOT?: ProctorEventScalarWhereInput | ProctorEventScalarWhereInput[]
    id?: StringFilter<"ProctorEvent"> | string
    tenantId?: StringFilter<"ProctorEvent"> | string
    attemptId?: StringFilter<"ProctorEvent"> | string
    type?: StringFilter<"ProctorEvent"> | string
    metadata?: JsonFilter<"ProctorEvent">
    occurredAt?: DateTimeFilter<"ProctorEvent"> | Date | string
    createdAt?: DateTimeFilter<"ProctorEvent"> | Date | string
  }

  export type AssessmentResultUpsertWithoutAttemptInput = {
    update: XOR<AssessmentResultUpdateWithoutAttemptInput, AssessmentResultUncheckedUpdateWithoutAttemptInput>
    create: XOR<AssessmentResultCreateWithoutAttemptInput, AssessmentResultUncheckedCreateWithoutAttemptInput>
    where?: AssessmentResultWhereInput
  }

  export type AssessmentResultUpdateToOneWithWhereWithoutAttemptInput = {
    where?: AssessmentResultWhereInput
    data: XOR<AssessmentResultUpdateWithoutAttemptInput, AssessmentResultUncheckedUpdateWithoutAttemptInput>
  }

  export type AssessmentResultUpdateWithoutAttemptInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    rawScore?: FloatFieldUpdateOperationsInput | number
    maxScore?: FloatFieldUpdateOperationsInput | number
    passed?: NullableBoolFieldUpdateOperationsInput | boolean | null
    pendingManualReview?: BoolFieldUpdateOperationsInput | boolean
    perQuestion?: JsonNullValueInput | InputJsonValue
    explainability?: NullableJsonNullValueInput | InputJsonValue
    gradedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    assessment?: AssessmentUpdateOneRequiredWithoutResultsNestedInput
  }

  export type AssessmentResultUncheckedUpdateWithoutAttemptInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    assessmentId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    rawScore?: FloatFieldUpdateOperationsInput | number
    maxScore?: FloatFieldUpdateOperationsInput | number
    passed?: NullableBoolFieldUpdateOperationsInput | boolean | null
    pendingManualReview?: BoolFieldUpdateOperationsInput | boolean
    perQuestion?: JsonNullValueInput | InputJsonValue
    explainability?: NullableJsonNullValueInput | InputJsonValue
    gradedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AttemptCreateWithoutAnswersInput = {
    id?: string
    tenantId: string
    candidateId: string
    status?: $Enums.AttemptStatus
    startedAt?: Date | string | null
    submittedAt?: Date | string | null
    durationSeconds?: number | null
    questionOrder?: JsonNullValueInput | InputJsonValue
    answerKey?: JsonNullValueInput | InputJsonValue
    sessionTokenHash?: string | null
    remainingSeconds?: number | null
    lastHeartbeatAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    assessment: AssessmentCreateNestedOneWithoutAttemptsInput
    invite: AssessmentInviteCreateNestedOneWithoutAttemptInput
    proctorEvents?: ProctorEventCreateNestedManyWithoutAttemptInput
    result?: AssessmentResultCreateNestedOneWithoutAttemptInput
  }

  export type AttemptUncheckedCreateWithoutAnswersInput = {
    id?: string
    tenantId: string
    assessmentId: string
    inviteId: string
    candidateId: string
    status?: $Enums.AttemptStatus
    startedAt?: Date | string | null
    submittedAt?: Date | string | null
    durationSeconds?: number | null
    questionOrder?: JsonNullValueInput | InputJsonValue
    answerKey?: JsonNullValueInput | InputJsonValue
    sessionTokenHash?: string | null
    remainingSeconds?: number | null
    lastHeartbeatAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    proctorEvents?: ProctorEventUncheckedCreateNestedManyWithoutAttemptInput
    result?: AssessmentResultUncheckedCreateNestedOneWithoutAttemptInput
  }

  export type AttemptCreateOrConnectWithoutAnswersInput = {
    where: AttemptWhereUniqueInput
    create: XOR<AttemptCreateWithoutAnswersInput, AttemptUncheckedCreateWithoutAnswersInput>
  }

  export type AttemptUpsertWithoutAnswersInput = {
    update: XOR<AttemptUpdateWithoutAnswersInput, AttemptUncheckedUpdateWithoutAnswersInput>
    create: XOR<AttemptCreateWithoutAnswersInput, AttemptUncheckedCreateWithoutAnswersInput>
    where?: AttemptWhereInput
  }

  export type AttemptUpdateToOneWithWhereWithoutAnswersInput = {
    where?: AttemptWhereInput
    data: XOR<AttemptUpdateWithoutAnswersInput, AttemptUncheckedUpdateWithoutAnswersInput>
  }

  export type AttemptUpdateWithoutAnswersInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    status?: EnumAttemptStatusFieldUpdateOperationsInput | $Enums.AttemptStatus
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    submittedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    durationSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    questionOrder?: JsonNullValueInput | InputJsonValue
    answerKey?: JsonNullValueInput | InputJsonValue
    sessionTokenHash?: NullableStringFieldUpdateOperationsInput | string | null
    remainingSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    lastHeartbeatAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    assessment?: AssessmentUpdateOneRequiredWithoutAttemptsNestedInput
    invite?: AssessmentInviteUpdateOneRequiredWithoutAttemptNestedInput
    proctorEvents?: ProctorEventUpdateManyWithoutAttemptNestedInput
    result?: AssessmentResultUpdateOneWithoutAttemptNestedInput
  }

  export type AttemptUncheckedUpdateWithoutAnswersInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    assessmentId?: StringFieldUpdateOperationsInput | string
    inviteId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    status?: EnumAttemptStatusFieldUpdateOperationsInput | $Enums.AttemptStatus
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    submittedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    durationSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    questionOrder?: JsonNullValueInput | InputJsonValue
    answerKey?: JsonNullValueInput | InputJsonValue
    sessionTokenHash?: NullableStringFieldUpdateOperationsInput | string | null
    remainingSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    lastHeartbeatAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    proctorEvents?: ProctorEventUncheckedUpdateManyWithoutAttemptNestedInput
    result?: AssessmentResultUncheckedUpdateOneWithoutAttemptNestedInput
  }

  export type AttemptCreateWithoutProctorEventsInput = {
    id?: string
    tenantId: string
    candidateId: string
    status?: $Enums.AttemptStatus
    startedAt?: Date | string | null
    submittedAt?: Date | string | null
    durationSeconds?: number | null
    questionOrder?: JsonNullValueInput | InputJsonValue
    answerKey?: JsonNullValueInput | InputJsonValue
    sessionTokenHash?: string | null
    remainingSeconds?: number | null
    lastHeartbeatAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    assessment: AssessmentCreateNestedOneWithoutAttemptsInput
    invite: AssessmentInviteCreateNestedOneWithoutAttemptInput
    answers?: AnswerCreateNestedManyWithoutAttemptInput
    result?: AssessmentResultCreateNestedOneWithoutAttemptInput
  }

  export type AttemptUncheckedCreateWithoutProctorEventsInput = {
    id?: string
    tenantId: string
    assessmentId: string
    inviteId: string
    candidateId: string
    status?: $Enums.AttemptStatus
    startedAt?: Date | string | null
    submittedAt?: Date | string | null
    durationSeconds?: number | null
    questionOrder?: JsonNullValueInput | InputJsonValue
    answerKey?: JsonNullValueInput | InputJsonValue
    sessionTokenHash?: string | null
    remainingSeconds?: number | null
    lastHeartbeatAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    answers?: AnswerUncheckedCreateNestedManyWithoutAttemptInput
    result?: AssessmentResultUncheckedCreateNestedOneWithoutAttemptInput
  }

  export type AttemptCreateOrConnectWithoutProctorEventsInput = {
    where: AttemptWhereUniqueInput
    create: XOR<AttemptCreateWithoutProctorEventsInput, AttemptUncheckedCreateWithoutProctorEventsInput>
  }

  export type AttemptUpsertWithoutProctorEventsInput = {
    update: XOR<AttemptUpdateWithoutProctorEventsInput, AttemptUncheckedUpdateWithoutProctorEventsInput>
    create: XOR<AttemptCreateWithoutProctorEventsInput, AttemptUncheckedCreateWithoutProctorEventsInput>
    where?: AttemptWhereInput
  }

  export type AttemptUpdateToOneWithWhereWithoutProctorEventsInput = {
    where?: AttemptWhereInput
    data: XOR<AttemptUpdateWithoutProctorEventsInput, AttemptUncheckedUpdateWithoutProctorEventsInput>
  }

  export type AttemptUpdateWithoutProctorEventsInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    status?: EnumAttemptStatusFieldUpdateOperationsInput | $Enums.AttemptStatus
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    submittedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    durationSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    questionOrder?: JsonNullValueInput | InputJsonValue
    answerKey?: JsonNullValueInput | InputJsonValue
    sessionTokenHash?: NullableStringFieldUpdateOperationsInput | string | null
    remainingSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    lastHeartbeatAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    assessment?: AssessmentUpdateOneRequiredWithoutAttemptsNestedInput
    invite?: AssessmentInviteUpdateOneRequiredWithoutAttemptNestedInput
    answers?: AnswerUpdateManyWithoutAttemptNestedInput
    result?: AssessmentResultUpdateOneWithoutAttemptNestedInput
  }

  export type AttemptUncheckedUpdateWithoutProctorEventsInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    assessmentId?: StringFieldUpdateOperationsInput | string
    inviteId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    status?: EnumAttemptStatusFieldUpdateOperationsInput | $Enums.AttemptStatus
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    submittedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    durationSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    questionOrder?: JsonNullValueInput | InputJsonValue
    answerKey?: JsonNullValueInput | InputJsonValue
    sessionTokenHash?: NullableStringFieldUpdateOperationsInput | string | null
    remainingSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    lastHeartbeatAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    answers?: AnswerUncheckedUpdateManyWithoutAttemptNestedInput
    result?: AssessmentResultUncheckedUpdateOneWithoutAttemptNestedInput
  }

  export type AssessmentCreateWithoutResultsInput = {
    id?: string
    tenantId: string
    requisitionId?: string | null
    questionBankId?: string | null
    title: string
    description?: string | null
    status?: $Enums.AssessmentStatus
    durationMinutes?: number | null
    passingScore?: number | null
    shuffleQuestions?: boolean
    questions?: JsonNullValueInput | InputJsonValue
    schemaJson?: JsonNullValueInput | InputJsonValue
    version?: number
    publishedHash?: string | null
    publishedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    invites?: AssessmentInviteCreateNestedManyWithoutAssessmentInput
    attempts?: AttemptCreateNestedManyWithoutAssessmentInput
  }

  export type AssessmentUncheckedCreateWithoutResultsInput = {
    id?: string
    tenantId: string
    requisitionId?: string | null
    questionBankId?: string | null
    title: string
    description?: string | null
    status?: $Enums.AssessmentStatus
    durationMinutes?: number | null
    passingScore?: number | null
    shuffleQuestions?: boolean
    questions?: JsonNullValueInput | InputJsonValue
    schemaJson?: JsonNullValueInput | InputJsonValue
    version?: number
    publishedHash?: string | null
    publishedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    invites?: AssessmentInviteUncheckedCreateNestedManyWithoutAssessmentInput
    attempts?: AttemptUncheckedCreateNestedManyWithoutAssessmentInput
  }

  export type AssessmentCreateOrConnectWithoutResultsInput = {
    where: AssessmentWhereUniqueInput
    create: XOR<AssessmentCreateWithoutResultsInput, AssessmentUncheckedCreateWithoutResultsInput>
  }

  export type AttemptCreateWithoutResultInput = {
    id?: string
    tenantId: string
    candidateId: string
    status?: $Enums.AttemptStatus
    startedAt?: Date | string | null
    submittedAt?: Date | string | null
    durationSeconds?: number | null
    questionOrder?: JsonNullValueInput | InputJsonValue
    answerKey?: JsonNullValueInput | InputJsonValue
    sessionTokenHash?: string | null
    remainingSeconds?: number | null
    lastHeartbeatAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    assessment: AssessmentCreateNestedOneWithoutAttemptsInput
    invite: AssessmentInviteCreateNestedOneWithoutAttemptInput
    answers?: AnswerCreateNestedManyWithoutAttemptInput
    proctorEvents?: ProctorEventCreateNestedManyWithoutAttemptInput
  }

  export type AttemptUncheckedCreateWithoutResultInput = {
    id?: string
    tenantId: string
    assessmentId: string
    inviteId: string
    candidateId: string
    status?: $Enums.AttemptStatus
    startedAt?: Date | string | null
    submittedAt?: Date | string | null
    durationSeconds?: number | null
    questionOrder?: JsonNullValueInput | InputJsonValue
    answerKey?: JsonNullValueInput | InputJsonValue
    sessionTokenHash?: string | null
    remainingSeconds?: number | null
    lastHeartbeatAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    answers?: AnswerUncheckedCreateNestedManyWithoutAttemptInput
    proctorEvents?: ProctorEventUncheckedCreateNestedManyWithoutAttemptInput
  }

  export type AttemptCreateOrConnectWithoutResultInput = {
    where: AttemptWhereUniqueInput
    create: XOR<AttemptCreateWithoutResultInput, AttemptUncheckedCreateWithoutResultInput>
  }

  export type AssessmentUpsertWithoutResultsInput = {
    update: XOR<AssessmentUpdateWithoutResultsInput, AssessmentUncheckedUpdateWithoutResultsInput>
    create: XOR<AssessmentCreateWithoutResultsInput, AssessmentUncheckedCreateWithoutResultsInput>
    where?: AssessmentWhereInput
  }

  export type AssessmentUpdateToOneWithWhereWithoutResultsInput = {
    where?: AssessmentWhereInput
    data: XOR<AssessmentUpdateWithoutResultsInput, AssessmentUncheckedUpdateWithoutResultsInput>
  }

  export type AssessmentUpdateWithoutResultsInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    requisitionId?: NullableStringFieldUpdateOperationsInput | string | null
    questionBankId?: NullableStringFieldUpdateOperationsInput | string | null
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumAssessmentStatusFieldUpdateOperationsInput | $Enums.AssessmentStatus
    durationMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    passingScore?: NullableIntFieldUpdateOperationsInput | number | null
    shuffleQuestions?: BoolFieldUpdateOperationsInput | boolean
    questions?: JsonNullValueInput | InputJsonValue
    schemaJson?: JsonNullValueInput | InputJsonValue
    version?: IntFieldUpdateOperationsInput | number
    publishedHash?: NullableStringFieldUpdateOperationsInput | string | null
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    invites?: AssessmentInviteUpdateManyWithoutAssessmentNestedInput
    attempts?: AttemptUpdateManyWithoutAssessmentNestedInput
  }

  export type AssessmentUncheckedUpdateWithoutResultsInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    requisitionId?: NullableStringFieldUpdateOperationsInput | string | null
    questionBankId?: NullableStringFieldUpdateOperationsInput | string | null
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumAssessmentStatusFieldUpdateOperationsInput | $Enums.AssessmentStatus
    durationMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    passingScore?: NullableIntFieldUpdateOperationsInput | number | null
    shuffleQuestions?: BoolFieldUpdateOperationsInput | boolean
    questions?: JsonNullValueInput | InputJsonValue
    schemaJson?: JsonNullValueInput | InputJsonValue
    version?: IntFieldUpdateOperationsInput | number
    publishedHash?: NullableStringFieldUpdateOperationsInput | string | null
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    invites?: AssessmentInviteUncheckedUpdateManyWithoutAssessmentNestedInput
    attempts?: AttemptUncheckedUpdateManyWithoutAssessmentNestedInput
  }

  export type AttemptUpsertWithoutResultInput = {
    update: XOR<AttemptUpdateWithoutResultInput, AttemptUncheckedUpdateWithoutResultInput>
    create: XOR<AttemptCreateWithoutResultInput, AttemptUncheckedCreateWithoutResultInput>
    where?: AttemptWhereInput
  }

  export type AttemptUpdateToOneWithWhereWithoutResultInput = {
    where?: AttemptWhereInput
    data: XOR<AttemptUpdateWithoutResultInput, AttemptUncheckedUpdateWithoutResultInput>
  }

  export type AttemptUpdateWithoutResultInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    status?: EnumAttemptStatusFieldUpdateOperationsInput | $Enums.AttemptStatus
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    submittedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    durationSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    questionOrder?: JsonNullValueInput | InputJsonValue
    answerKey?: JsonNullValueInput | InputJsonValue
    sessionTokenHash?: NullableStringFieldUpdateOperationsInput | string | null
    remainingSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    lastHeartbeatAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    assessment?: AssessmentUpdateOneRequiredWithoutAttemptsNestedInput
    invite?: AssessmentInviteUpdateOneRequiredWithoutAttemptNestedInput
    answers?: AnswerUpdateManyWithoutAttemptNestedInput
    proctorEvents?: ProctorEventUpdateManyWithoutAttemptNestedInput
  }

  export type AttemptUncheckedUpdateWithoutResultInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    assessmentId?: StringFieldUpdateOperationsInput | string
    inviteId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    status?: EnumAttemptStatusFieldUpdateOperationsInput | $Enums.AttemptStatus
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    submittedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    durationSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    questionOrder?: JsonNullValueInput | InputJsonValue
    answerKey?: JsonNullValueInput | InputJsonValue
    sessionTokenHash?: NullableStringFieldUpdateOperationsInput | string | null
    remainingSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    lastHeartbeatAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    answers?: AnswerUncheckedUpdateManyWithoutAttemptNestedInput
    proctorEvents?: ProctorEventUncheckedUpdateManyWithoutAttemptNestedInput
  }

  export type QuestionCreateWithoutQuestionBankInput = {
    id?: string
    tenantId?: string | null
    type: $Enums.QuestionType
    prompt: string
    order?: number
    required?: boolean
    points?: number
    timeLimit?: number | null
    options?: NullableJsonNullValueInput | InputJsonValue
    correctAnswer?: NullableJsonNullValueInput | InputJsonValue
    language?: string | null
    starterCode?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type QuestionUncheckedCreateWithoutQuestionBankInput = {
    id?: string
    tenantId?: string | null
    type: $Enums.QuestionType
    prompt: string
    order?: number
    required?: boolean
    points?: number
    timeLimit?: number | null
    options?: NullableJsonNullValueInput | InputJsonValue
    correctAnswer?: NullableJsonNullValueInput | InputJsonValue
    language?: string | null
    starterCode?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type QuestionCreateOrConnectWithoutQuestionBankInput = {
    where: QuestionWhereUniqueInput
    create: XOR<QuestionCreateWithoutQuestionBankInput, QuestionUncheckedCreateWithoutQuestionBankInput>
  }

  export type QuestionCreateManyQuestionBankInputEnvelope = {
    data: QuestionCreateManyQuestionBankInput | QuestionCreateManyQuestionBankInput[]
    skipDuplicates?: boolean
  }

  export type QuestionUpsertWithWhereUniqueWithoutQuestionBankInput = {
    where: QuestionWhereUniqueInput
    update: XOR<QuestionUpdateWithoutQuestionBankInput, QuestionUncheckedUpdateWithoutQuestionBankInput>
    create: XOR<QuestionCreateWithoutQuestionBankInput, QuestionUncheckedCreateWithoutQuestionBankInput>
  }

  export type QuestionUpdateWithWhereUniqueWithoutQuestionBankInput = {
    where: QuestionWhereUniqueInput
    data: XOR<QuestionUpdateWithoutQuestionBankInput, QuestionUncheckedUpdateWithoutQuestionBankInput>
  }

  export type QuestionUpdateManyWithWhereWithoutQuestionBankInput = {
    where: QuestionScalarWhereInput
    data: XOR<QuestionUpdateManyMutationInput, QuestionUncheckedUpdateManyWithoutQuestionBankInput>
  }

  export type QuestionScalarWhereInput = {
    AND?: QuestionScalarWhereInput | QuestionScalarWhereInput[]
    OR?: QuestionScalarWhereInput[]
    NOT?: QuestionScalarWhereInput | QuestionScalarWhereInput[]
    id?: StringFilter<"Question"> | string
    tenantId?: StringNullableFilter<"Question"> | string | null
    questionBankId?: StringFilter<"Question"> | string
    type?: EnumQuestionTypeFilter<"Question"> | $Enums.QuestionType
    prompt?: StringFilter<"Question"> | string
    order?: IntFilter<"Question"> | number
    required?: BoolFilter<"Question"> | boolean
    points?: IntFilter<"Question"> | number
    timeLimit?: IntNullableFilter<"Question"> | number | null
    options?: JsonNullableFilter<"Question">
    correctAnswer?: JsonNullableFilter<"Question">
    language?: StringNullableFilter<"Question"> | string | null
    starterCode?: StringNullableFilter<"Question"> | string | null
    createdAt?: DateTimeFilter<"Question"> | Date | string
    updatedAt?: DateTimeFilter<"Question"> | Date | string
  }

  export type QuestionBankCreateWithoutQuestionsInput = {
    id?: string
    tenantId?: string | null
    name: string
    description?: string | null
    category?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type QuestionBankUncheckedCreateWithoutQuestionsInput = {
    id?: string
    tenantId?: string | null
    name: string
    description?: string | null
    category?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type QuestionBankCreateOrConnectWithoutQuestionsInput = {
    where: QuestionBankWhereUniqueInput
    create: XOR<QuestionBankCreateWithoutQuestionsInput, QuestionBankUncheckedCreateWithoutQuestionsInput>
  }

  export type QuestionBankUpsertWithoutQuestionsInput = {
    update: XOR<QuestionBankUpdateWithoutQuestionsInput, QuestionBankUncheckedUpdateWithoutQuestionsInput>
    create: XOR<QuestionBankCreateWithoutQuestionsInput, QuestionBankUncheckedCreateWithoutQuestionsInput>
    where?: QuestionBankWhereInput
  }

  export type QuestionBankUpdateToOneWithWhereWithoutQuestionsInput = {
    where?: QuestionBankWhereInput
    data: XOR<QuestionBankUpdateWithoutQuestionsInput, QuestionBankUncheckedUpdateWithoutQuestionsInput>
  }

  export type QuestionBankUpdateWithoutQuestionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type QuestionBankUncheckedUpdateWithoutQuestionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AssessmentInviteCreateManyAssessmentInput = {
    id?: string
    tenantId: string
    candidateId: string
    applicationId?: string | null
    tokenHash: string
    provider?: string | null
    providerInvitationId?: string | null
    providerSecret?: string | null
    email: string
    status?: $Enums.AssessmentInviteStatus
    expiresAt?: Date | string | null
    sentAt?: Date | string | null
    openedAt?: Date | string | null
    startedAt?: Date | string | null
    submittedAt?: Date | string | null
    consumedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AttemptCreateManyAssessmentInput = {
    id?: string
    tenantId: string
    inviteId: string
    candidateId: string
    status?: $Enums.AttemptStatus
    startedAt?: Date | string | null
    submittedAt?: Date | string | null
    durationSeconds?: number | null
    questionOrder?: JsonNullValueInput | InputJsonValue
    answerKey?: JsonNullValueInput | InputJsonValue
    sessionTokenHash?: string | null
    remainingSeconds?: number | null
    lastHeartbeatAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AssessmentResultCreateManyAssessmentInput = {
    id?: string
    tenantId: string
    attemptId: string
    candidateId: string
    rawScore: number
    maxScore: number
    passed?: boolean | null
    pendingManualReview?: boolean
    perQuestion?: JsonNullValueInput | InputJsonValue
    explainability?: NullableJsonNullValueInput | InputJsonValue
    gradedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AssessmentInviteUpdateWithoutAssessmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    applicationId?: NullableStringFieldUpdateOperationsInput | string | null
    tokenHash?: StringFieldUpdateOperationsInput | string
    provider?: NullableStringFieldUpdateOperationsInput | string | null
    providerInvitationId?: NullableStringFieldUpdateOperationsInput | string | null
    providerSecret?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    status?: EnumAssessmentInviteStatusFieldUpdateOperationsInput | $Enums.AssessmentInviteStatus
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    openedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    submittedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    consumedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    attempt?: AttemptUpdateOneWithoutInviteNestedInput
  }

  export type AssessmentInviteUncheckedUpdateWithoutAssessmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    applicationId?: NullableStringFieldUpdateOperationsInput | string | null
    tokenHash?: StringFieldUpdateOperationsInput | string
    provider?: NullableStringFieldUpdateOperationsInput | string | null
    providerInvitationId?: NullableStringFieldUpdateOperationsInput | string | null
    providerSecret?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    status?: EnumAssessmentInviteStatusFieldUpdateOperationsInput | $Enums.AssessmentInviteStatus
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    openedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    submittedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    consumedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    attempt?: AttemptUncheckedUpdateOneWithoutInviteNestedInput
  }

  export type AssessmentInviteUncheckedUpdateManyWithoutAssessmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    applicationId?: NullableStringFieldUpdateOperationsInput | string | null
    tokenHash?: StringFieldUpdateOperationsInput | string
    provider?: NullableStringFieldUpdateOperationsInput | string | null
    providerInvitationId?: NullableStringFieldUpdateOperationsInput | string | null
    providerSecret?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    status?: EnumAssessmentInviteStatusFieldUpdateOperationsInput | $Enums.AssessmentInviteStatus
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    openedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    submittedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    consumedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AttemptUpdateWithoutAssessmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    status?: EnumAttemptStatusFieldUpdateOperationsInput | $Enums.AttemptStatus
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    submittedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    durationSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    questionOrder?: JsonNullValueInput | InputJsonValue
    answerKey?: JsonNullValueInput | InputJsonValue
    sessionTokenHash?: NullableStringFieldUpdateOperationsInput | string | null
    remainingSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    lastHeartbeatAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    invite?: AssessmentInviteUpdateOneRequiredWithoutAttemptNestedInput
    answers?: AnswerUpdateManyWithoutAttemptNestedInput
    proctorEvents?: ProctorEventUpdateManyWithoutAttemptNestedInput
    result?: AssessmentResultUpdateOneWithoutAttemptNestedInput
  }

  export type AttemptUncheckedUpdateWithoutAssessmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    inviteId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    status?: EnumAttemptStatusFieldUpdateOperationsInput | $Enums.AttemptStatus
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    submittedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    durationSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    questionOrder?: JsonNullValueInput | InputJsonValue
    answerKey?: JsonNullValueInput | InputJsonValue
    sessionTokenHash?: NullableStringFieldUpdateOperationsInput | string | null
    remainingSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    lastHeartbeatAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    answers?: AnswerUncheckedUpdateManyWithoutAttemptNestedInput
    proctorEvents?: ProctorEventUncheckedUpdateManyWithoutAttemptNestedInput
    result?: AssessmentResultUncheckedUpdateOneWithoutAttemptNestedInput
  }

  export type AttemptUncheckedUpdateManyWithoutAssessmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    inviteId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    status?: EnumAttemptStatusFieldUpdateOperationsInput | $Enums.AttemptStatus
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    submittedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    durationSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    questionOrder?: JsonNullValueInput | InputJsonValue
    answerKey?: JsonNullValueInput | InputJsonValue
    sessionTokenHash?: NullableStringFieldUpdateOperationsInput | string | null
    remainingSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    lastHeartbeatAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AssessmentResultUpdateWithoutAssessmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    rawScore?: FloatFieldUpdateOperationsInput | number
    maxScore?: FloatFieldUpdateOperationsInput | number
    passed?: NullableBoolFieldUpdateOperationsInput | boolean | null
    pendingManualReview?: BoolFieldUpdateOperationsInput | boolean
    perQuestion?: JsonNullValueInput | InputJsonValue
    explainability?: NullableJsonNullValueInput | InputJsonValue
    gradedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    attempt?: AttemptUpdateOneRequiredWithoutResultNestedInput
  }

  export type AssessmentResultUncheckedUpdateWithoutAssessmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    attemptId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    rawScore?: FloatFieldUpdateOperationsInput | number
    maxScore?: FloatFieldUpdateOperationsInput | number
    passed?: NullableBoolFieldUpdateOperationsInput | boolean | null
    pendingManualReview?: BoolFieldUpdateOperationsInput | boolean
    perQuestion?: JsonNullValueInput | InputJsonValue
    explainability?: NullableJsonNullValueInput | InputJsonValue
    gradedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AssessmentResultUncheckedUpdateManyWithoutAssessmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    attemptId?: StringFieldUpdateOperationsInput | string
    candidateId?: StringFieldUpdateOperationsInput | string
    rawScore?: FloatFieldUpdateOperationsInput | number
    maxScore?: FloatFieldUpdateOperationsInput | number
    passed?: NullableBoolFieldUpdateOperationsInput | boolean | null
    pendingManualReview?: BoolFieldUpdateOperationsInput | boolean
    perQuestion?: JsonNullValueInput | InputJsonValue
    explainability?: NullableJsonNullValueInput | InputJsonValue
    gradedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AnswerCreateManyAttemptInput = {
    id?: string
    tenantId: string
    questionId: string
    value?: NullableJsonNullValueInput | InputJsonValue
    timeSpentSeconds?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ProctorEventCreateManyAttemptInput = {
    id?: string
    tenantId: string
    type: string
    metadata?: JsonNullValueInput | InputJsonValue
    occurredAt?: Date | string
    createdAt?: Date | string
  }

  export type AnswerUpdateWithoutAttemptInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    questionId?: StringFieldUpdateOperationsInput | string
    value?: NullableJsonNullValueInput | InputJsonValue
    timeSpentSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AnswerUncheckedUpdateWithoutAttemptInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    questionId?: StringFieldUpdateOperationsInput | string
    value?: NullableJsonNullValueInput | InputJsonValue
    timeSpentSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AnswerUncheckedUpdateManyWithoutAttemptInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    questionId?: StringFieldUpdateOperationsInput | string
    value?: NullableJsonNullValueInput | InputJsonValue
    timeSpentSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProctorEventUpdateWithoutAttemptInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    metadata?: JsonNullValueInput | InputJsonValue
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProctorEventUncheckedUpdateWithoutAttemptInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    metadata?: JsonNullValueInput | InputJsonValue
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProctorEventUncheckedUpdateManyWithoutAttemptInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    metadata?: JsonNullValueInput | InputJsonValue
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type QuestionCreateManyQuestionBankInput = {
    id?: string
    tenantId?: string | null
    type: $Enums.QuestionType
    prompt: string
    order?: number
    required?: boolean
    points?: number
    timeLimit?: number | null
    options?: NullableJsonNullValueInput | InputJsonValue
    correctAnswer?: NullableJsonNullValueInput | InputJsonValue
    language?: string | null
    starterCode?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type QuestionUpdateWithoutQuestionBankInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumQuestionTypeFieldUpdateOperationsInput | $Enums.QuestionType
    prompt?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    required?: BoolFieldUpdateOperationsInput | boolean
    points?: IntFieldUpdateOperationsInput | number
    timeLimit?: NullableIntFieldUpdateOperationsInput | number | null
    options?: NullableJsonNullValueInput | InputJsonValue
    correctAnswer?: NullableJsonNullValueInput | InputJsonValue
    language?: NullableStringFieldUpdateOperationsInput | string | null
    starterCode?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type QuestionUncheckedUpdateWithoutQuestionBankInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumQuestionTypeFieldUpdateOperationsInput | $Enums.QuestionType
    prompt?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    required?: BoolFieldUpdateOperationsInput | boolean
    points?: IntFieldUpdateOperationsInput | number
    timeLimit?: NullableIntFieldUpdateOperationsInput | number | null
    options?: NullableJsonNullValueInput | InputJsonValue
    correctAnswer?: NullableJsonNullValueInput | InputJsonValue
    language?: NullableStringFieldUpdateOperationsInput | string | null
    starterCode?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type QuestionUncheckedUpdateManyWithoutQuestionBankInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumQuestionTypeFieldUpdateOperationsInput | $Enums.QuestionType
    prompt?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    required?: BoolFieldUpdateOperationsInput | boolean
    points?: IntFieldUpdateOperationsInput | number
    timeLimit?: NullableIntFieldUpdateOperationsInput | number | null
    options?: NullableJsonNullValueInput | InputJsonValue
    correctAnswer?: NullableJsonNullValueInput | InputJsonValue
    language?: NullableStringFieldUpdateOperationsInput | string | null
    starterCode?: NullableStringFieldUpdateOperationsInput | string | null
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