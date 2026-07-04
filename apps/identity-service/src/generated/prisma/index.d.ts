
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
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model TenantApiKey
 * 
 */
export type TenantApiKey = $Result.DefaultSelection<Prisma.$TenantApiKeyPayload>
/**
 * Model EmailVerification
 * 
 */
export type EmailVerification = $Result.DefaultSelection<Prisma.$EmailVerificationPayload>
/**
 * Model PasswordReset
 * 
 */
export type PasswordReset = $Result.DefaultSelection<Prisma.$PasswordResetPayload>
/**
 * Model InviteToken
 * 
 */
export type InviteToken = $Result.DefaultSelection<Prisma.$InviteTokenPayload>
/**
 * Model AuditEvent
 * 
 */
export type AuditEvent = $Result.DefaultSelection<Prisma.$AuditEventPayload>
/**
 * Model TenantSso
 * 
 */
export type TenantSso = $Result.DefaultSelection<Prisma.$TenantSsoPayload>
/**
 * Model SsoLoginAudit
 * 
 */
export type SsoLoginAudit = $Result.DefaultSelection<Prisma.$SsoLoginAuditPayload>
/**
 * Model DashboardLayout
 * 
 */
export type DashboardLayout = $Result.DefaultSelection<Prisma.$DashboardLayoutPayload>
/**
 * Model UserUiPrefs
 * 
 */
export type UserUiPrefs = $Result.DefaultSelection<Prisma.$UserUiPrefsPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const UserRole: {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  RECRUITER: 'RECRUITER',
  HIRING_MANAGER: 'HIRING_MANAGER',
  COMPLIANCE_OFFICER: 'COMPLIANCE_OFFICER',
  INTERVIEWER: 'INTERVIEWER',
  CANDIDATE: 'CANDIDATE',
  DEPARTMENT_HEAD: 'DEPARTMENT_HEAD',
  EXECUTIVE: 'EXECUTIVE'
};

export type UserRole = (typeof UserRole)[keyof typeof UserRole]


export const SsoProtocol: {
  SAML: 'SAML',
  OIDC: 'OIDC'
};

export type SsoProtocol = (typeof SsoProtocol)[keyof typeof SsoProtocol]


export const SsoStatus: {
  DRAFT: 'DRAFT',
  ENABLED: 'ENABLED',
  DISABLED: 'DISABLED'
};

export type SsoStatus = (typeof SsoStatus)[keyof typeof SsoStatus]

}

export type UserRole = $Enums.UserRole

export const UserRole: typeof $Enums.UserRole

export type SsoProtocol = $Enums.SsoProtocol

export const SsoProtocol: typeof $Enums.SsoProtocol

export type SsoStatus = $Enums.SsoStatus

export const SsoStatus: typeof $Enums.SsoStatus

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
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
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
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
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.tenantApiKey`: Exposes CRUD operations for the **TenantApiKey** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TenantApiKeys
    * const tenantApiKeys = await prisma.tenantApiKey.findMany()
    * ```
    */
  get tenantApiKey(): Prisma.TenantApiKeyDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.emailVerification`: Exposes CRUD operations for the **EmailVerification** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more EmailVerifications
    * const emailVerifications = await prisma.emailVerification.findMany()
    * ```
    */
  get emailVerification(): Prisma.EmailVerificationDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.passwordReset`: Exposes CRUD operations for the **PasswordReset** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PasswordResets
    * const passwordResets = await prisma.passwordReset.findMany()
    * ```
    */
  get passwordReset(): Prisma.PasswordResetDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.inviteToken`: Exposes CRUD operations for the **InviteToken** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more InviteTokens
    * const inviteTokens = await prisma.inviteToken.findMany()
    * ```
    */
  get inviteToken(): Prisma.InviteTokenDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.auditEvent`: Exposes CRUD operations for the **AuditEvent** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AuditEvents
    * const auditEvents = await prisma.auditEvent.findMany()
    * ```
    */
  get auditEvent(): Prisma.AuditEventDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.tenantSso`: Exposes CRUD operations for the **TenantSso** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TenantSsos
    * const tenantSsos = await prisma.tenantSso.findMany()
    * ```
    */
  get tenantSso(): Prisma.TenantSsoDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.ssoLoginAudit`: Exposes CRUD operations for the **SsoLoginAudit** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SsoLoginAudits
    * const ssoLoginAudits = await prisma.ssoLoginAudit.findMany()
    * ```
    */
  get ssoLoginAudit(): Prisma.SsoLoginAuditDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.dashboardLayout`: Exposes CRUD operations for the **DashboardLayout** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more DashboardLayouts
    * const dashboardLayouts = await prisma.dashboardLayout.findMany()
    * ```
    */
  get dashboardLayout(): Prisma.DashboardLayoutDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.userUiPrefs`: Exposes CRUD operations for the **UserUiPrefs** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserUiPrefs
    * const userUiPrefs = await prisma.userUiPrefs.findMany()
    * ```
    */
  get userUiPrefs(): Prisma.UserUiPrefsDelegate<ExtArgs, ClientOptions>;
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
    User: 'User',
    TenantApiKey: 'TenantApiKey',
    EmailVerification: 'EmailVerification',
    PasswordReset: 'PasswordReset',
    InviteToken: 'InviteToken',
    AuditEvent: 'AuditEvent',
    TenantSso: 'TenantSso',
    SsoLoginAudit: 'SsoLoginAudit',
    DashboardLayout: 'DashboardLayout',
    UserUiPrefs: 'UserUiPrefs'
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
      modelProps: "user" | "tenantApiKey" | "emailVerification" | "passwordReset" | "inviteToken" | "auditEvent" | "tenantSso" | "ssoLoginAudit" | "dashboardLayout" | "userUiPrefs"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      TenantApiKey: {
        payload: Prisma.$TenantApiKeyPayload<ExtArgs>
        fields: Prisma.TenantApiKeyFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TenantApiKeyFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantApiKeyPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TenantApiKeyFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantApiKeyPayload>
          }
          findFirst: {
            args: Prisma.TenantApiKeyFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantApiKeyPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TenantApiKeyFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantApiKeyPayload>
          }
          findMany: {
            args: Prisma.TenantApiKeyFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantApiKeyPayload>[]
          }
          create: {
            args: Prisma.TenantApiKeyCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantApiKeyPayload>
          }
          createMany: {
            args: Prisma.TenantApiKeyCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TenantApiKeyCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantApiKeyPayload>[]
          }
          delete: {
            args: Prisma.TenantApiKeyDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantApiKeyPayload>
          }
          update: {
            args: Prisma.TenantApiKeyUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantApiKeyPayload>
          }
          deleteMany: {
            args: Prisma.TenantApiKeyDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TenantApiKeyUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TenantApiKeyUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantApiKeyPayload>[]
          }
          upsert: {
            args: Prisma.TenantApiKeyUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantApiKeyPayload>
          }
          aggregate: {
            args: Prisma.TenantApiKeyAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTenantApiKey>
          }
          groupBy: {
            args: Prisma.TenantApiKeyGroupByArgs<ExtArgs>
            result: $Utils.Optional<TenantApiKeyGroupByOutputType>[]
          }
          count: {
            args: Prisma.TenantApiKeyCountArgs<ExtArgs>
            result: $Utils.Optional<TenantApiKeyCountAggregateOutputType> | number
          }
        }
      }
      EmailVerification: {
        payload: Prisma.$EmailVerificationPayload<ExtArgs>
        fields: Prisma.EmailVerificationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.EmailVerificationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailVerificationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.EmailVerificationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailVerificationPayload>
          }
          findFirst: {
            args: Prisma.EmailVerificationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailVerificationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.EmailVerificationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailVerificationPayload>
          }
          findMany: {
            args: Prisma.EmailVerificationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailVerificationPayload>[]
          }
          create: {
            args: Prisma.EmailVerificationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailVerificationPayload>
          }
          createMany: {
            args: Prisma.EmailVerificationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.EmailVerificationCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailVerificationPayload>[]
          }
          delete: {
            args: Prisma.EmailVerificationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailVerificationPayload>
          }
          update: {
            args: Prisma.EmailVerificationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailVerificationPayload>
          }
          deleteMany: {
            args: Prisma.EmailVerificationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.EmailVerificationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.EmailVerificationUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailVerificationPayload>[]
          }
          upsert: {
            args: Prisma.EmailVerificationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailVerificationPayload>
          }
          aggregate: {
            args: Prisma.EmailVerificationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateEmailVerification>
          }
          groupBy: {
            args: Prisma.EmailVerificationGroupByArgs<ExtArgs>
            result: $Utils.Optional<EmailVerificationGroupByOutputType>[]
          }
          count: {
            args: Prisma.EmailVerificationCountArgs<ExtArgs>
            result: $Utils.Optional<EmailVerificationCountAggregateOutputType> | number
          }
        }
      }
      PasswordReset: {
        payload: Prisma.$PasswordResetPayload<ExtArgs>
        fields: Prisma.PasswordResetFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PasswordResetFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PasswordResetPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PasswordResetFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PasswordResetPayload>
          }
          findFirst: {
            args: Prisma.PasswordResetFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PasswordResetPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PasswordResetFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PasswordResetPayload>
          }
          findMany: {
            args: Prisma.PasswordResetFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PasswordResetPayload>[]
          }
          create: {
            args: Prisma.PasswordResetCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PasswordResetPayload>
          }
          createMany: {
            args: Prisma.PasswordResetCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PasswordResetCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PasswordResetPayload>[]
          }
          delete: {
            args: Prisma.PasswordResetDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PasswordResetPayload>
          }
          update: {
            args: Prisma.PasswordResetUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PasswordResetPayload>
          }
          deleteMany: {
            args: Prisma.PasswordResetDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PasswordResetUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PasswordResetUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PasswordResetPayload>[]
          }
          upsert: {
            args: Prisma.PasswordResetUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PasswordResetPayload>
          }
          aggregate: {
            args: Prisma.PasswordResetAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePasswordReset>
          }
          groupBy: {
            args: Prisma.PasswordResetGroupByArgs<ExtArgs>
            result: $Utils.Optional<PasswordResetGroupByOutputType>[]
          }
          count: {
            args: Prisma.PasswordResetCountArgs<ExtArgs>
            result: $Utils.Optional<PasswordResetCountAggregateOutputType> | number
          }
        }
      }
      InviteToken: {
        payload: Prisma.$InviteTokenPayload<ExtArgs>
        fields: Prisma.InviteTokenFieldRefs
        operations: {
          findUnique: {
            args: Prisma.InviteTokenFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InviteTokenPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.InviteTokenFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InviteTokenPayload>
          }
          findFirst: {
            args: Prisma.InviteTokenFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InviteTokenPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.InviteTokenFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InviteTokenPayload>
          }
          findMany: {
            args: Prisma.InviteTokenFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InviteTokenPayload>[]
          }
          create: {
            args: Prisma.InviteTokenCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InviteTokenPayload>
          }
          createMany: {
            args: Prisma.InviteTokenCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.InviteTokenCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InviteTokenPayload>[]
          }
          delete: {
            args: Prisma.InviteTokenDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InviteTokenPayload>
          }
          update: {
            args: Prisma.InviteTokenUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InviteTokenPayload>
          }
          deleteMany: {
            args: Prisma.InviteTokenDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.InviteTokenUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.InviteTokenUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InviteTokenPayload>[]
          }
          upsert: {
            args: Prisma.InviteTokenUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InviteTokenPayload>
          }
          aggregate: {
            args: Prisma.InviteTokenAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateInviteToken>
          }
          groupBy: {
            args: Prisma.InviteTokenGroupByArgs<ExtArgs>
            result: $Utils.Optional<InviteTokenGroupByOutputType>[]
          }
          count: {
            args: Prisma.InviteTokenCountArgs<ExtArgs>
            result: $Utils.Optional<InviteTokenCountAggregateOutputType> | number
          }
        }
      }
      AuditEvent: {
        payload: Prisma.$AuditEventPayload<ExtArgs>
        fields: Prisma.AuditEventFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AuditEventFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditEventPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AuditEventFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditEventPayload>
          }
          findFirst: {
            args: Prisma.AuditEventFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditEventPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AuditEventFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditEventPayload>
          }
          findMany: {
            args: Prisma.AuditEventFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditEventPayload>[]
          }
          create: {
            args: Prisma.AuditEventCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditEventPayload>
          }
          createMany: {
            args: Prisma.AuditEventCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AuditEventCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditEventPayload>[]
          }
          delete: {
            args: Prisma.AuditEventDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditEventPayload>
          }
          update: {
            args: Prisma.AuditEventUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditEventPayload>
          }
          deleteMany: {
            args: Prisma.AuditEventDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AuditEventUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AuditEventUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditEventPayload>[]
          }
          upsert: {
            args: Prisma.AuditEventUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditEventPayload>
          }
          aggregate: {
            args: Prisma.AuditEventAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAuditEvent>
          }
          groupBy: {
            args: Prisma.AuditEventGroupByArgs<ExtArgs>
            result: $Utils.Optional<AuditEventGroupByOutputType>[]
          }
          count: {
            args: Prisma.AuditEventCountArgs<ExtArgs>
            result: $Utils.Optional<AuditEventCountAggregateOutputType> | number
          }
        }
      }
      TenantSso: {
        payload: Prisma.$TenantSsoPayload<ExtArgs>
        fields: Prisma.TenantSsoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TenantSsoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantSsoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TenantSsoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantSsoPayload>
          }
          findFirst: {
            args: Prisma.TenantSsoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantSsoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TenantSsoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantSsoPayload>
          }
          findMany: {
            args: Prisma.TenantSsoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantSsoPayload>[]
          }
          create: {
            args: Prisma.TenantSsoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantSsoPayload>
          }
          createMany: {
            args: Prisma.TenantSsoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TenantSsoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantSsoPayload>[]
          }
          delete: {
            args: Prisma.TenantSsoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantSsoPayload>
          }
          update: {
            args: Prisma.TenantSsoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantSsoPayload>
          }
          deleteMany: {
            args: Prisma.TenantSsoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TenantSsoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TenantSsoUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantSsoPayload>[]
          }
          upsert: {
            args: Prisma.TenantSsoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantSsoPayload>
          }
          aggregate: {
            args: Prisma.TenantSsoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTenantSso>
          }
          groupBy: {
            args: Prisma.TenantSsoGroupByArgs<ExtArgs>
            result: $Utils.Optional<TenantSsoGroupByOutputType>[]
          }
          count: {
            args: Prisma.TenantSsoCountArgs<ExtArgs>
            result: $Utils.Optional<TenantSsoCountAggregateOutputType> | number
          }
        }
      }
      SsoLoginAudit: {
        payload: Prisma.$SsoLoginAuditPayload<ExtArgs>
        fields: Prisma.SsoLoginAuditFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SsoLoginAuditFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SsoLoginAuditPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SsoLoginAuditFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SsoLoginAuditPayload>
          }
          findFirst: {
            args: Prisma.SsoLoginAuditFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SsoLoginAuditPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SsoLoginAuditFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SsoLoginAuditPayload>
          }
          findMany: {
            args: Prisma.SsoLoginAuditFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SsoLoginAuditPayload>[]
          }
          create: {
            args: Prisma.SsoLoginAuditCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SsoLoginAuditPayload>
          }
          createMany: {
            args: Prisma.SsoLoginAuditCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SsoLoginAuditCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SsoLoginAuditPayload>[]
          }
          delete: {
            args: Prisma.SsoLoginAuditDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SsoLoginAuditPayload>
          }
          update: {
            args: Prisma.SsoLoginAuditUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SsoLoginAuditPayload>
          }
          deleteMany: {
            args: Prisma.SsoLoginAuditDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SsoLoginAuditUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SsoLoginAuditUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SsoLoginAuditPayload>[]
          }
          upsert: {
            args: Prisma.SsoLoginAuditUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SsoLoginAuditPayload>
          }
          aggregate: {
            args: Prisma.SsoLoginAuditAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSsoLoginAudit>
          }
          groupBy: {
            args: Prisma.SsoLoginAuditGroupByArgs<ExtArgs>
            result: $Utils.Optional<SsoLoginAuditGroupByOutputType>[]
          }
          count: {
            args: Prisma.SsoLoginAuditCountArgs<ExtArgs>
            result: $Utils.Optional<SsoLoginAuditCountAggregateOutputType> | number
          }
        }
      }
      DashboardLayout: {
        payload: Prisma.$DashboardLayoutPayload<ExtArgs>
        fields: Prisma.DashboardLayoutFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DashboardLayoutFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DashboardLayoutPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DashboardLayoutFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DashboardLayoutPayload>
          }
          findFirst: {
            args: Prisma.DashboardLayoutFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DashboardLayoutPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DashboardLayoutFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DashboardLayoutPayload>
          }
          findMany: {
            args: Prisma.DashboardLayoutFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DashboardLayoutPayload>[]
          }
          create: {
            args: Prisma.DashboardLayoutCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DashboardLayoutPayload>
          }
          createMany: {
            args: Prisma.DashboardLayoutCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DashboardLayoutCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DashboardLayoutPayload>[]
          }
          delete: {
            args: Prisma.DashboardLayoutDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DashboardLayoutPayload>
          }
          update: {
            args: Prisma.DashboardLayoutUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DashboardLayoutPayload>
          }
          deleteMany: {
            args: Prisma.DashboardLayoutDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DashboardLayoutUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.DashboardLayoutUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DashboardLayoutPayload>[]
          }
          upsert: {
            args: Prisma.DashboardLayoutUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DashboardLayoutPayload>
          }
          aggregate: {
            args: Prisma.DashboardLayoutAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDashboardLayout>
          }
          groupBy: {
            args: Prisma.DashboardLayoutGroupByArgs<ExtArgs>
            result: $Utils.Optional<DashboardLayoutGroupByOutputType>[]
          }
          count: {
            args: Prisma.DashboardLayoutCountArgs<ExtArgs>
            result: $Utils.Optional<DashboardLayoutCountAggregateOutputType> | number
          }
        }
      }
      UserUiPrefs: {
        payload: Prisma.$UserUiPrefsPayload<ExtArgs>
        fields: Prisma.UserUiPrefsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserUiPrefsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserUiPrefsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserUiPrefsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserUiPrefsPayload>
          }
          findFirst: {
            args: Prisma.UserUiPrefsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserUiPrefsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserUiPrefsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserUiPrefsPayload>
          }
          findMany: {
            args: Prisma.UserUiPrefsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserUiPrefsPayload>[]
          }
          create: {
            args: Prisma.UserUiPrefsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserUiPrefsPayload>
          }
          createMany: {
            args: Prisma.UserUiPrefsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserUiPrefsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserUiPrefsPayload>[]
          }
          delete: {
            args: Prisma.UserUiPrefsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserUiPrefsPayload>
          }
          update: {
            args: Prisma.UserUiPrefsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserUiPrefsPayload>
          }
          deleteMany: {
            args: Prisma.UserUiPrefsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUiPrefsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUiPrefsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserUiPrefsPayload>[]
          }
          upsert: {
            args: Prisma.UserUiPrefsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserUiPrefsPayload>
          }
          aggregate: {
            args: Prisma.UserUiPrefsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUserUiPrefs>
          }
          groupBy: {
            args: Prisma.UserUiPrefsGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserUiPrefsGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserUiPrefsCountArgs<ExtArgs>
            result: $Utils.Optional<UserUiPrefsCountAggregateOutputType> | number
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
    user?: UserOmit
    tenantApiKey?: TenantApiKeyOmit
    emailVerification?: EmailVerificationOmit
    passwordReset?: PasswordResetOmit
    inviteToken?: InviteTokenOmit
    auditEvent?: AuditEventOmit
    tenantSso?: TenantSsoOmit
    ssoLoginAudit?: SsoLoginAuditOmit
    dashboardLayout?: DashboardLayoutOmit
    userUiPrefs?: UserUiPrefsOmit
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
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    inviteTokens: number
    passwordResets: number
    emailVerifications: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    inviteTokens?: boolean | UserCountOutputTypeCountInviteTokensArgs
    passwordResets?: boolean | UserCountOutputTypeCountPasswordResetsArgs
    emailVerifications?: boolean | UserCountOutputTypeCountEmailVerificationsArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountInviteTokensArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InviteTokenWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountPasswordResetsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PasswordResetWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountEmailVerificationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EmailVerificationWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    email: string | null
    passwordHash: string | null
    firstName: string | null
    lastName: string | null
    role: $Enums.UserRole | null
    department: string | null
    isActive: boolean | null
    lastLoginAt: Date | null
    mfaSecret: string | null
    mfaEnabled: boolean | null
    externalId: string | null
    ssoLastLogin: Date | null
    emailVerified: boolean | null
    emailVerifiedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
    managerId: string | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    email: string | null
    passwordHash: string | null
    firstName: string | null
    lastName: string | null
    role: $Enums.UserRole | null
    department: string | null
    isActive: boolean | null
    lastLoginAt: Date | null
    mfaSecret: string | null
    mfaEnabled: boolean | null
    externalId: string | null
    ssoLastLogin: Date | null
    emailVerified: boolean | null
    emailVerifiedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
    managerId: string | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    tenantId: number
    email: number
    passwordHash: number
    firstName: number
    lastName: number
    role: number
    department: number
    isActive: number
    lastLoginAt: number
    mfaSecret: number
    mfaEnabled: number
    externalId: number
    ssoLastLogin: number
    emailVerified: number
    emailVerifiedAt: number
    createdAt: number
    updatedAt: number
    managerId: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    tenantId?: true
    email?: true
    passwordHash?: true
    firstName?: true
    lastName?: true
    role?: true
    department?: true
    isActive?: true
    lastLoginAt?: true
    mfaSecret?: true
    mfaEnabled?: true
    externalId?: true
    ssoLastLogin?: true
    emailVerified?: true
    emailVerifiedAt?: true
    createdAt?: true
    updatedAt?: true
    managerId?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    tenantId?: true
    email?: true
    passwordHash?: true
    firstName?: true
    lastName?: true
    role?: true
    department?: true
    isActive?: true
    lastLoginAt?: true
    mfaSecret?: true
    mfaEnabled?: true
    externalId?: true
    ssoLastLogin?: true
    emailVerified?: true
    emailVerifiedAt?: true
    createdAt?: true
    updatedAt?: true
    managerId?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    tenantId?: true
    email?: true
    passwordHash?: true
    firstName?: true
    lastName?: true
    role?: true
    department?: true
    isActive?: true
    lastLoginAt?: true
    mfaSecret?: true
    mfaEnabled?: true
    externalId?: true
    ssoLastLogin?: true
    emailVerified?: true
    emailVerifiedAt?: true
    createdAt?: true
    updatedAt?: true
    managerId?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    tenantId: string
    email: string
    passwordHash: string
    firstName: string
    lastName: string
    role: $Enums.UserRole
    department: string | null
    isActive: boolean
    lastLoginAt: Date | null
    mfaSecret: string | null
    mfaEnabled: boolean
    externalId: string | null
    ssoLastLogin: Date | null
    emailVerified: boolean
    emailVerifiedAt: Date | null
    createdAt: Date
    updatedAt: Date
    managerId: string | null
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    email?: boolean
    passwordHash?: boolean
    firstName?: boolean
    lastName?: boolean
    role?: boolean
    department?: boolean
    isActive?: boolean
    lastLoginAt?: boolean
    mfaSecret?: boolean
    mfaEnabled?: boolean
    externalId?: boolean
    ssoLastLogin?: boolean
    emailVerified?: boolean
    emailVerifiedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    managerId?: boolean
    inviteTokens?: boolean | User$inviteTokensArgs<ExtArgs>
    passwordResets?: boolean | User$passwordResetsArgs<ExtArgs>
    emailVerifications?: boolean | User$emailVerificationsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    email?: boolean
    passwordHash?: boolean
    firstName?: boolean
    lastName?: boolean
    role?: boolean
    department?: boolean
    isActive?: boolean
    lastLoginAt?: boolean
    mfaSecret?: boolean
    mfaEnabled?: boolean
    externalId?: boolean
    ssoLastLogin?: boolean
    emailVerified?: boolean
    emailVerifiedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    managerId?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    email?: boolean
    passwordHash?: boolean
    firstName?: boolean
    lastName?: boolean
    role?: boolean
    department?: boolean
    isActive?: boolean
    lastLoginAt?: boolean
    mfaSecret?: boolean
    mfaEnabled?: boolean
    externalId?: boolean
    ssoLastLogin?: boolean
    emailVerified?: boolean
    emailVerifiedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    managerId?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    tenantId?: boolean
    email?: boolean
    passwordHash?: boolean
    firstName?: boolean
    lastName?: boolean
    role?: boolean
    department?: boolean
    isActive?: boolean
    lastLoginAt?: boolean
    mfaSecret?: boolean
    mfaEnabled?: boolean
    externalId?: boolean
    ssoLastLogin?: boolean
    emailVerified?: boolean
    emailVerifiedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    managerId?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "email" | "passwordHash" | "firstName" | "lastName" | "role" | "department" | "isActive" | "lastLoginAt" | "mfaSecret" | "mfaEnabled" | "externalId" | "ssoLastLogin" | "emailVerified" | "emailVerifiedAt" | "createdAt" | "updatedAt" | "managerId", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    inviteTokens?: boolean | User$inviteTokensArgs<ExtArgs>
    passwordResets?: boolean | User$passwordResetsArgs<ExtArgs>
    emailVerifications?: boolean | User$emailVerificationsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      inviteTokens: Prisma.$InviteTokenPayload<ExtArgs>[]
      passwordResets: Prisma.$PasswordResetPayload<ExtArgs>[]
      emailVerifications: Prisma.$EmailVerificationPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      email: string
      passwordHash: string
      firstName: string
      lastName: string
      role: $Enums.UserRole
      department: string | null
      isActive: boolean
      lastLoginAt: Date | null
      mfaSecret: string | null
      mfaEnabled: boolean
      externalId: string | null
      ssoLastLogin: Date | null
      emailVerified: boolean
      emailVerifiedAt: Date | null
      createdAt: Date
      updatedAt: Date
      managerId: string | null
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
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
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
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
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    inviteTokens<T extends User$inviteTokensArgs<ExtArgs> = {}>(args?: Subset<T, User$inviteTokensArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InviteTokenPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    passwordResets<T extends User$passwordResetsArgs<ExtArgs> = {}>(args?: Subset<T, User$passwordResetsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PasswordResetPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    emailVerifications<T extends User$emailVerificationsArgs<ExtArgs> = {}>(args?: Subset<T, User$emailVerificationsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmailVerificationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly tenantId: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly passwordHash: FieldRef<"User", 'String'>
    readonly firstName: FieldRef<"User", 'String'>
    readonly lastName: FieldRef<"User", 'String'>
    readonly role: FieldRef<"User", 'UserRole'>
    readonly department: FieldRef<"User", 'String'>
    readonly isActive: FieldRef<"User", 'Boolean'>
    readonly lastLoginAt: FieldRef<"User", 'DateTime'>
    readonly mfaSecret: FieldRef<"User", 'String'>
    readonly mfaEnabled: FieldRef<"User", 'Boolean'>
    readonly externalId: FieldRef<"User", 'String'>
    readonly ssoLastLogin: FieldRef<"User", 'DateTime'>
    readonly emailVerified: FieldRef<"User", 'Boolean'>
    readonly emailVerifiedAt: FieldRef<"User", 'DateTime'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
    readonly managerId: FieldRef<"User", 'String'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.inviteTokens
   */
  export type User$inviteTokensArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InviteToken
     */
    select?: InviteTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InviteToken
     */
    omit?: InviteTokenOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InviteTokenInclude<ExtArgs> | null
    where?: InviteTokenWhereInput
    orderBy?: InviteTokenOrderByWithRelationInput | InviteTokenOrderByWithRelationInput[]
    cursor?: InviteTokenWhereUniqueInput
    take?: number
    skip?: number
    distinct?: InviteTokenScalarFieldEnum | InviteTokenScalarFieldEnum[]
  }

  /**
   * User.passwordResets
   */
  export type User$passwordResetsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PasswordReset
     */
    select?: PasswordResetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PasswordReset
     */
    omit?: PasswordResetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PasswordResetInclude<ExtArgs> | null
    where?: PasswordResetWhereInput
    orderBy?: PasswordResetOrderByWithRelationInput | PasswordResetOrderByWithRelationInput[]
    cursor?: PasswordResetWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PasswordResetScalarFieldEnum | PasswordResetScalarFieldEnum[]
  }

  /**
   * User.emailVerifications
   */
  export type User$emailVerificationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailVerification
     */
    select?: EmailVerificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmailVerification
     */
    omit?: EmailVerificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailVerificationInclude<ExtArgs> | null
    where?: EmailVerificationWhereInput
    orderBy?: EmailVerificationOrderByWithRelationInput | EmailVerificationOrderByWithRelationInput[]
    cursor?: EmailVerificationWhereUniqueInput
    take?: number
    skip?: number
    distinct?: EmailVerificationScalarFieldEnum | EmailVerificationScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model TenantApiKey
   */

  export type AggregateTenantApiKey = {
    _count: TenantApiKeyCountAggregateOutputType | null
    _min: TenantApiKeyMinAggregateOutputType | null
    _max: TenantApiKeyMaxAggregateOutputType | null
  }

  export type TenantApiKeyMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    name: string | null
    keyPrefix: string | null
    keyHash: string | null
    createdByUserId: string | null
    createdAt: Date | null
    lastUsedAt: Date | null
    revokedAt: Date | null
  }

  export type TenantApiKeyMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    name: string | null
    keyPrefix: string | null
    keyHash: string | null
    createdByUserId: string | null
    createdAt: Date | null
    lastUsedAt: Date | null
    revokedAt: Date | null
  }

  export type TenantApiKeyCountAggregateOutputType = {
    id: number
    tenantId: number
    name: number
    keyPrefix: number
    keyHash: number
    createdByUserId: number
    createdAt: number
    lastUsedAt: number
    revokedAt: number
    scopes: number
    _all: number
  }


  export type TenantApiKeyMinAggregateInputType = {
    id?: true
    tenantId?: true
    name?: true
    keyPrefix?: true
    keyHash?: true
    createdByUserId?: true
    createdAt?: true
    lastUsedAt?: true
    revokedAt?: true
  }

  export type TenantApiKeyMaxAggregateInputType = {
    id?: true
    tenantId?: true
    name?: true
    keyPrefix?: true
    keyHash?: true
    createdByUserId?: true
    createdAt?: true
    lastUsedAt?: true
    revokedAt?: true
  }

  export type TenantApiKeyCountAggregateInputType = {
    id?: true
    tenantId?: true
    name?: true
    keyPrefix?: true
    keyHash?: true
    createdByUserId?: true
    createdAt?: true
    lastUsedAt?: true
    revokedAt?: true
    scopes?: true
    _all?: true
  }

  export type TenantApiKeyAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TenantApiKey to aggregate.
     */
    where?: TenantApiKeyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantApiKeys to fetch.
     */
    orderBy?: TenantApiKeyOrderByWithRelationInput | TenantApiKeyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TenantApiKeyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantApiKeys from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantApiKeys.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TenantApiKeys
    **/
    _count?: true | TenantApiKeyCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TenantApiKeyMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TenantApiKeyMaxAggregateInputType
  }

  export type GetTenantApiKeyAggregateType<T extends TenantApiKeyAggregateArgs> = {
        [P in keyof T & keyof AggregateTenantApiKey]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTenantApiKey[P]>
      : GetScalarType<T[P], AggregateTenantApiKey[P]>
  }




  export type TenantApiKeyGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TenantApiKeyWhereInput
    orderBy?: TenantApiKeyOrderByWithAggregationInput | TenantApiKeyOrderByWithAggregationInput[]
    by: TenantApiKeyScalarFieldEnum[] | TenantApiKeyScalarFieldEnum
    having?: TenantApiKeyScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TenantApiKeyCountAggregateInputType | true
    _min?: TenantApiKeyMinAggregateInputType
    _max?: TenantApiKeyMaxAggregateInputType
  }

  export type TenantApiKeyGroupByOutputType = {
    id: string
    tenantId: string
    name: string
    keyPrefix: string
    keyHash: string
    createdByUserId: string
    createdAt: Date
    lastUsedAt: Date | null
    revokedAt: Date | null
    scopes: string[]
    _count: TenantApiKeyCountAggregateOutputType | null
    _min: TenantApiKeyMinAggregateOutputType | null
    _max: TenantApiKeyMaxAggregateOutputType | null
  }

  type GetTenantApiKeyGroupByPayload<T extends TenantApiKeyGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TenantApiKeyGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TenantApiKeyGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TenantApiKeyGroupByOutputType[P]>
            : GetScalarType<T[P], TenantApiKeyGroupByOutputType[P]>
        }
      >
    >


  export type TenantApiKeySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    name?: boolean
    keyPrefix?: boolean
    keyHash?: boolean
    createdByUserId?: boolean
    createdAt?: boolean
    lastUsedAt?: boolean
    revokedAt?: boolean
    scopes?: boolean
  }, ExtArgs["result"]["tenantApiKey"]>

  export type TenantApiKeySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    name?: boolean
    keyPrefix?: boolean
    keyHash?: boolean
    createdByUserId?: boolean
    createdAt?: boolean
    lastUsedAt?: boolean
    revokedAt?: boolean
    scopes?: boolean
  }, ExtArgs["result"]["tenantApiKey"]>

  export type TenantApiKeySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    name?: boolean
    keyPrefix?: boolean
    keyHash?: boolean
    createdByUserId?: boolean
    createdAt?: boolean
    lastUsedAt?: boolean
    revokedAt?: boolean
    scopes?: boolean
  }, ExtArgs["result"]["tenantApiKey"]>

  export type TenantApiKeySelectScalar = {
    id?: boolean
    tenantId?: boolean
    name?: boolean
    keyPrefix?: boolean
    keyHash?: boolean
    createdByUserId?: boolean
    createdAt?: boolean
    lastUsedAt?: boolean
    revokedAt?: boolean
    scopes?: boolean
  }

  export type TenantApiKeyOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "name" | "keyPrefix" | "keyHash" | "createdByUserId" | "createdAt" | "lastUsedAt" | "revokedAt" | "scopes", ExtArgs["result"]["tenantApiKey"]>

  export type $TenantApiKeyPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TenantApiKey"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      name: string
      keyPrefix: string
      keyHash: string
      createdByUserId: string
      createdAt: Date
      lastUsedAt: Date | null
      revokedAt: Date | null
      scopes: string[]
    }, ExtArgs["result"]["tenantApiKey"]>
    composites: {}
  }

  type TenantApiKeyGetPayload<S extends boolean | null | undefined | TenantApiKeyDefaultArgs> = $Result.GetResult<Prisma.$TenantApiKeyPayload, S>

  type TenantApiKeyCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TenantApiKeyFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TenantApiKeyCountAggregateInputType | true
    }

  export interface TenantApiKeyDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TenantApiKey'], meta: { name: 'TenantApiKey' } }
    /**
     * Find zero or one TenantApiKey that matches the filter.
     * @param {TenantApiKeyFindUniqueArgs} args - Arguments to find a TenantApiKey
     * @example
     * // Get one TenantApiKey
     * const tenantApiKey = await prisma.tenantApiKey.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TenantApiKeyFindUniqueArgs>(args: SelectSubset<T, TenantApiKeyFindUniqueArgs<ExtArgs>>): Prisma__TenantApiKeyClient<$Result.GetResult<Prisma.$TenantApiKeyPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one TenantApiKey that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TenantApiKeyFindUniqueOrThrowArgs} args - Arguments to find a TenantApiKey
     * @example
     * // Get one TenantApiKey
     * const tenantApiKey = await prisma.tenantApiKey.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TenantApiKeyFindUniqueOrThrowArgs>(args: SelectSubset<T, TenantApiKeyFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TenantApiKeyClient<$Result.GetResult<Prisma.$TenantApiKeyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TenantApiKey that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantApiKeyFindFirstArgs} args - Arguments to find a TenantApiKey
     * @example
     * // Get one TenantApiKey
     * const tenantApiKey = await prisma.tenantApiKey.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TenantApiKeyFindFirstArgs>(args?: SelectSubset<T, TenantApiKeyFindFirstArgs<ExtArgs>>): Prisma__TenantApiKeyClient<$Result.GetResult<Prisma.$TenantApiKeyPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TenantApiKey that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantApiKeyFindFirstOrThrowArgs} args - Arguments to find a TenantApiKey
     * @example
     * // Get one TenantApiKey
     * const tenantApiKey = await prisma.tenantApiKey.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TenantApiKeyFindFirstOrThrowArgs>(args?: SelectSubset<T, TenantApiKeyFindFirstOrThrowArgs<ExtArgs>>): Prisma__TenantApiKeyClient<$Result.GetResult<Prisma.$TenantApiKeyPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more TenantApiKeys that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantApiKeyFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TenantApiKeys
     * const tenantApiKeys = await prisma.tenantApiKey.findMany()
     * 
     * // Get first 10 TenantApiKeys
     * const tenantApiKeys = await prisma.tenantApiKey.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tenantApiKeyWithIdOnly = await prisma.tenantApiKey.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TenantApiKeyFindManyArgs>(args?: SelectSubset<T, TenantApiKeyFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantApiKeyPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a TenantApiKey.
     * @param {TenantApiKeyCreateArgs} args - Arguments to create a TenantApiKey.
     * @example
     * // Create one TenantApiKey
     * const TenantApiKey = await prisma.tenantApiKey.create({
     *   data: {
     *     // ... data to create a TenantApiKey
     *   }
     * })
     * 
     */
    create<T extends TenantApiKeyCreateArgs>(args: SelectSubset<T, TenantApiKeyCreateArgs<ExtArgs>>): Prisma__TenantApiKeyClient<$Result.GetResult<Prisma.$TenantApiKeyPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many TenantApiKeys.
     * @param {TenantApiKeyCreateManyArgs} args - Arguments to create many TenantApiKeys.
     * @example
     * // Create many TenantApiKeys
     * const tenantApiKey = await prisma.tenantApiKey.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TenantApiKeyCreateManyArgs>(args?: SelectSubset<T, TenantApiKeyCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TenantApiKeys and returns the data saved in the database.
     * @param {TenantApiKeyCreateManyAndReturnArgs} args - Arguments to create many TenantApiKeys.
     * @example
     * // Create many TenantApiKeys
     * const tenantApiKey = await prisma.tenantApiKey.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TenantApiKeys and only return the `id`
     * const tenantApiKeyWithIdOnly = await prisma.tenantApiKey.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TenantApiKeyCreateManyAndReturnArgs>(args?: SelectSubset<T, TenantApiKeyCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantApiKeyPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a TenantApiKey.
     * @param {TenantApiKeyDeleteArgs} args - Arguments to delete one TenantApiKey.
     * @example
     * // Delete one TenantApiKey
     * const TenantApiKey = await prisma.tenantApiKey.delete({
     *   where: {
     *     // ... filter to delete one TenantApiKey
     *   }
     * })
     * 
     */
    delete<T extends TenantApiKeyDeleteArgs>(args: SelectSubset<T, TenantApiKeyDeleteArgs<ExtArgs>>): Prisma__TenantApiKeyClient<$Result.GetResult<Prisma.$TenantApiKeyPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one TenantApiKey.
     * @param {TenantApiKeyUpdateArgs} args - Arguments to update one TenantApiKey.
     * @example
     * // Update one TenantApiKey
     * const tenantApiKey = await prisma.tenantApiKey.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TenantApiKeyUpdateArgs>(args: SelectSubset<T, TenantApiKeyUpdateArgs<ExtArgs>>): Prisma__TenantApiKeyClient<$Result.GetResult<Prisma.$TenantApiKeyPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more TenantApiKeys.
     * @param {TenantApiKeyDeleteManyArgs} args - Arguments to filter TenantApiKeys to delete.
     * @example
     * // Delete a few TenantApiKeys
     * const { count } = await prisma.tenantApiKey.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TenantApiKeyDeleteManyArgs>(args?: SelectSubset<T, TenantApiKeyDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TenantApiKeys.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantApiKeyUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TenantApiKeys
     * const tenantApiKey = await prisma.tenantApiKey.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TenantApiKeyUpdateManyArgs>(args: SelectSubset<T, TenantApiKeyUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TenantApiKeys and returns the data updated in the database.
     * @param {TenantApiKeyUpdateManyAndReturnArgs} args - Arguments to update many TenantApiKeys.
     * @example
     * // Update many TenantApiKeys
     * const tenantApiKey = await prisma.tenantApiKey.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more TenantApiKeys and only return the `id`
     * const tenantApiKeyWithIdOnly = await prisma.tenantApiKey.updateManyAndReturn({
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
    updateManyAndReturn<T extends TenantApiKeyUpdateManyAndReturnArgs>(args: SelectSubset<T, TenantApiKeyUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantApiKeyPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one TenantApiKey.
     * @param {TenantApiKeyUpsertArgs} args - Arguments to update or create a TenantApiKey.
     * @example
     * // Update or create a TenantApiKey
     * const tenantApiKey = await prisma.tenantApiKey.upsert({
     *   create: {
     *     // ... data to create a TenantApiKey
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TenantApiKey we want to update
     *   }
     * })
     */
    upsert<T extends TenantApiKeyUpsertArgs>(args: SelectSubset<T, TenantApiKeyUpsertArgs<ExtArgs>>): Prisma__TenantApiKeyClient<$Result.GetResult<Prisma.$TenantApiKeyPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of TenantApiKeys.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantApiKeyCountArgs} args - Arguments to filter TenantApiKeys to count.
     * @example
     * // Count the number of TenantApiKeys
     * const count = await prisma.tenantApiKey.count({
     *   where: {
     *     // ... the filter for the TenantApiKeys we want to count
     *   }
     * })
    **/
    count<T extends TenantApiKeyCountArgs>(
      args?: Subset<T, TenantApiKeyCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TenantApiKeyCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TenantApiKey.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantApiKeyAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends TenantApiKeyAggregateArgs>(args: Subset<T, TenantApiKeyAggregateArgs>): Prisma.PrismaPromise<GetTenantApiKeyAggregateType<T>>

    /**
     * Group by TenantApiKey.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantApiKeyGroupByArgs} args - Group by arguments.
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
      T extends TenantApiKeyGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TenantApiKeyGroupByArgs['orderBy'] }
        : { orderBy?: TenantApiKeyGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, TenantApiKeyGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTenantApiKeyGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TenantApiKey model
   */
  readonly fields: TenantApiKeyFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TenantApiKey.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TenantApiKeyClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the TenantApiKey model
   */
  interface TenantApiKeyFieldRefs {
    readonly id: FieldRef<"TenantApiKey", 'String'>
    readonly tenantId: FieldRef<"TenantApiKey", 'String'>
    readonly name: FieldRef<"TenantApiKey", 'String'>
    readonly keyPrefix: FieldRef<"TenantApiKey", 'String'>
    readonly keyHash: FieldRef<"TenantApiKey", 'String'>
    readonly createdByUserId: FieldRef<"TenantApiKey", 'String'>
    readonly createdAt: FieldRef<"TenantApiKey", 'DateTime'>
    readonly lastUsedAt: FieldRef<"TenantApiKey", 'DateTime'>
    readonly revokedAt: FieldRef<"TenantApiKey", 'DateTime'>
    readonly scopes: FieldRef<"TenantApiKey", 'String[]'>
  }
    

  // Custom InputTypes
  /**
   * TenantApiKey findUnique
   */
  export type TenantApiKeyFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantApiKey
     */
    select?: TenantApiKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantApiKey
     */
    omit?: TenantApiKeyOmit<ExtArgs> | null
    /**
     * Filter, which TenantApiKey to fetch.
     */
    where: TenantApiKeyWhereUniqueInput
  }

  /**
   * TenantApiKey findUniqueOrThrow
   */
  export type TenantApiKeyFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantApiKey
     */
    select?: TenantApiKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantApiKey
     */
    omit?: TenantApiKeyOmit<ExtArgs> | null
    /**
     * Filter, which TenantApiKey to fetch.
     */
    where: TenantApiKeyWhereUniqueInput
  }

  /**
   * TenantApiKey findFirst
   */
  export type TenantApiKeyFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantApiKey
     */
    select?: TenantApiKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantApiKey
     */
    omit?: TenantApiKeyOmit<ExtArgs> | null
    /**
     * Filter, which TenantApiKey to fetch.
     */
    where?: TenantApiKeyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantApiKeys to fetch.
     */
    orderBy?: TenantApiKeyOrderByWithRelationInput | TenantApiKeyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TenantApiKeys.
     */
    cursor?: TenantApiKeyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantApiKeys from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantApiKeys.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TenantApiKeys.
     */
    distinct?: TenantApiKeyScalarFieldEnum | TenantApiKeyScalarFieldEnum[]
  }

  /**
   * TenantApiKey findFirstOrThrow
   */
  export type TenantApiKeyFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantApiKey
     */
    select?: TenantApiKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantApiKey
     */
    omit?: TenantApiKeyOmit<ExtArgs> | null
    /**
     * Filter, which TenantApiKey to fetch.
     */
    where?: TenantApiKeyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantApiKeys to fetch.
     */
    orderBy?: TenantApiKeyOrderByWithRelationInput | TenantApiKeyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TenantApiKeys.
     */
    cursor?: TenantApiKeyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantApiKeys from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantApiKeys.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TenantApiKeys.
     */
    distinct?: TenantApiKeyScalarFieldEnum | TenantApiKeyScalarFieldEnum[]
  }

  /**
   * TenantApiKey findMany
   */
  export type TenantApiKeyFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantApiKey
     */
    select?: TenantApiKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantApiKey
     */
    omit?: TenantApiKeyOmit<ExtArgs> | null
    /**
     * Filter, which TenantApiKeys to fetch.
     */
    where?: TenantApiKeyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantApiKeys to fetch.
     */
    orderBy?: TenantApiKeyOrderByWithRelationInput | TenantApiKeyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TenantApiKeys.
     */
    cursor?: TenantApiKeyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantApiKeys from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantApiKeys.
     */
    skip?: number
    distinct?: TenantApiKeyScalarFieldEnum | TenantApiKeyScalarFieldEnum[]
  }

  /**
   * TenantApiKey create
   */
  export type TenantApiKeyCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantApiKey
     */
    select?: TenantApiKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantApiKey
     */
    omit?: TenantApiKeyOmit<ExtArgs> | null
    /**
     * The data needed to create a TenantApiKey.
     */
    data: XOR<TenantApiKeyCreateInput, TenantApiKeyUncheckedCreateInput>
  }

  /**
   * TenantApiKey createMany
   */
  export type TenantApiKeyCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TenantApiKeys.
     */
    data: TenantApiKeyCreateManyInput | TenantApiKeyCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TenantApiKey createManyAndReturn
   */
  export type TenantApiKeyCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantApiKey
     */
    select?: TenantApiKeySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TenantApiKey
     */
    omit?: TenantApiKeyOmit<ExtArgs> | null
    /**
     * The data used to create many TenantApiKeys.
     */
    data: TenantApiKeyCreateManyInput | TenantApiKeyCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TenantApiKey update
   */
  export type TenantApiKeyUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantApiKey
     */
    select?: TenantApiKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantApiKey
     */
    omit?: TenantApiKeyOmit<ExtArgs> | null
    /**
     * The data needed to update a TenantApiKey.
     */
    data: XOR<TenantApiKeyUpdateInput, TenantApiKeyUncheckedUpdateInput>
    /**
     * Choose, which TenantApiKey to update.
     */
    where: TenantApiKeyWhereUniqueInput
  }

  /**
   * TenantApiKey updateMany
   */
  export type TenantApiKeyUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TenantApiKeys.
     */
    data: XOR<TenantApiKeyUpdateManyMutationInput, TenantApiKeyUncheckedUpdateManyInput>
    /**
     * Filter which TenantApiKeys to update
     */
    where?: TenantApiKeyWhereInput
    /**
     * Limit how many TenantApiKeys to update.
     */
    limit?: number
  }

  /**
   * TenantApiKey updateManyAndReturn
   */
  export type TenantApiKeyUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantApiKey
     */
    select?: TenantApiKeySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TenantApiKey
     */
    omit?: TenantApiKeyOmit<ExtArgs> | null
    /**
     * The data used to update TenantApiKeys.
     */
    data: XOR<TenantApiKeyUpdateManyMutationInput, TenantApiKeyUncheckedUpdateManyInput>
    /**
     * Filter which TenantApiKeys to update
     */
    where?: TenantApiKeyWhereInput
    /**
     * Limit how many TenantApiKeys to update.
     */
    limit?: number
  }

  /**
   * TenantApiKey upsert
   */
  export type TenantApiKeyUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantApiKey
     */
    select?: TenantApiKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantApiKey
     */
    omit?: TenantApiKeyOmit<ExtArgs> | null
    /**
     * The filter to search for the TenantApiKey to update in case it exists.
     */
    where: TenantApiKeyWhereUniqueInput
    /**
     * In case the TenantApiKey found by the `where` argument doesn't exist, create a new TenantApiKey with this data.
     */
    create: XOR<TenantApiKeyCreateInput, TenantApiKeyUncheckedCreateInput>
    /**
     * In case the TenantApiKey was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TenantApiKeyUpdateInput, TenantApiKeyUncheckedUpdateInput>
  }

  /**
   * TenantApiKey delete
   */
  export type TenantApiKeyDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantApiKey
     */
    select?: TenantApiKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantApiKey
     */
    omit?: TenantApiKeyOmit<ExtArgs> | null
    /**
     * Filter which TenantApiKey to delete.
     */
    where: TenantApiKeyWhereUniqueInput
  }

  /**
   * TenantApiKey deleteMany
   */
  export type TenantApiKeyDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TenantApiKeys to delete
     */
    where?: TenantApiKeyWhereInput
    /**
     * Limit how many TenantApiKeys to delete.
     */
    limit?: number
  }

  /**
   * TenantApiKey without action
   */
  export type TenantApiKeyDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantApiKey
     */
    select?: TenantApiKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantApiKey
     */
    omit?: TenantApiKeyOmit<ExtArgs> | null
  }


  /**
   * Model EmailVerification
   */

  export type AggregateEmailVerification = {
    _count: EmailVerificationCountAggregateOutputType | null
    _min: EmailVerificationMinAggregateOutputType | null
    _max: EmailVerificationMaxAggregateOutputType | null
  }

  export type EmailVerificationMinAggregateOutputType = {
    id: string | null
    userId: string | null
    email: string | null
    token: string | null
    expiresAt: Date | null
    usedAt: Date | null
    createdAt: Date | null
  }

  export type EmailVerificationMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    email: string | null
    token: string | null
    expiresAt: Date | null
    usedAt: Date | null
    createdAt: Date | null
  }

  export type EmailVerificationCountAggregateOutputType = {
    id: number
    userId: number
    email: number
    token: number
    expiresAt: number
    usedAt: number
    createdAt: number
    _all: number
  }


  export type EmailVerificationMinAggregateInputType = {
    id?: true
    userId?: true
    email?: true
    token?: true
    expiresAt?: true
    usedAt?: true
    createdAt?: true
  }

  export type EmailVerificationMaxAggregateInputType = {
    id?: true
    userId?: true
    email?: true
    token?: true
    expiresAt?: true
    usedAt?: true
    createdAt?: true
  }

  export type EmailVerificationCountAggregateInputType = {
    id?: true
    userId?: true
    email?: true
    token?: true
    expiresAt?: true
    usedAt?: true
    createdAt?: true
    _all?: true
  }

  export type EmailVerificationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which EmailVerification to aggregate.
     */
    where?: EmailVerificationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EmailVerifications to fetch.
     */
    orderBy?: EmailVerificationOrderByWithRelationInput | EmailVerificationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: EmailVerificationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EmailVerifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EmailVerifications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned EmailVerifications
    **/
    _count?: true | EmailVerificationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: EmailVerificationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: EmailVerificationMaxAggregateInputType
  }

  export type GetEmailVerificationAggregateType<T extends EmailVerificationAggregateArgs> = {
        [P in keyof T & keyof AggregateEmailVerification]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateEmailVerification[P]>
      : GetScalarType<T[P], AggregateEmailVerification[P]>
  }




  export type EmailVerificationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EmailVerificationWhereInput
    orderBy?: EmailVerificationOrderByWithAggregationInput | EmailVerificationOrderByWithAggregationInput[]
    by: EmailVerificationScalarFieldEnum[] | EmailVerificationScalarFieldEnum
    having?: EmailVerificationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: EmailVerificationCountAggregateInputType | true
    _min?: EmailVerificationMinAggregateInputType
    _max?: EmailVerificationMaxAggregateInputType
  }

  export type EmailVerificationGroupByOutputType = {
    id: string
    userId: string
    email: string
    token: string
    expiresAt: Date
    usedAt: Date | null
    createdAt: Date
    _count: EmailVerificationCountAggregateOutputType | null
    _min: EmailVerificationMinAggregateOutputType | null
    _max: EmailVerificationMaxAggregateOutputType | null
  }

  type GetEmailVerificationGroupByPayload<T extends EmailVerificationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<EmailVerificationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof EmailVerificationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], EmailVerificationGroupByOutputType[P]>
            : GetScalarType<T[P], EmailVerificationGroupByOutputType[P]>
        }
      >
    >


  export type EmailVerificationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    email?: boolean
    token?: boolean
    expiresAt?: boolean
    usedAt?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["emailVerification"]>

  export type EmailVerificationSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    email?: boolean
    token?: boolean
    expiresAt?: boolean
    usedAt?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["emailVerification"]>

  export type EmailVerificationSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    email?: boolean
    token?: boolean
    expiresAt?: boolean
    usedAt?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["emailVerification"]>

  export type EmailVerificationSelectScalar = {
    id?: boolean
    userId?: boolean
    email?: boolean
    token?: boolean
    expiresAt?: boolean
    usedAt?: boolean
    createdAt?: boolean
  }

  export type EmailVerificationOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "email" | "token" | "expiresAt" | "usedAt" | "createdAt", ExtArgs["result"]["emailVerification"]>
  export type EmailVerificationInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type EmailVerificationIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type EmailVerificationIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $EmailVerificationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "EmailVerification"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      email: string
      token: string
      expiresAt: Date
      usedAt: Date | null
      createdAt: Date
    }, ExtArgs["result"]["emailVerification"]>
    composites: {}
  }

  type EmailVerificationGetPayload<S extends boolean | null | undefined | EmailVerificationDefaultArgs> = $Result.GetResult<Prisma.$EmailVerificationPayload, S>

  type EmailVerificationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<EmailVerificationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: EmailVerificationCountAggregateInputType | true
    }

  export interface EmailVerificationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['EmailVerification'], meta: { name: 'EmailVerification' } }
    /**
     * Find zero or one EmailVerification that matches the filter.
     * @param {EmailVerificationFindUniqueArgs} args - Arguments to find a EmailVerification
     * @example
     * // Get one EmailVerification
     * const emailVerification = await prisma.emailVerification.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends EmailVerificationFindUniqueArgs>(args: SelectSubset<T, EmailVerificationFindUniqueArgs<ExtArgs>>): Prisma__EmailVerificationClient<$Result.GetResult<Prisma.$EmailVerificationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one EmailVerification that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {EmailVerificationFindUniqueOrThrowArgs} args - Arguments to find a EmailVerification
     * @example
     * // Get one EmailVerification
     * const emailVerification = await prisma.emailVerification.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends EmailVerificationFindUniqueOrThrowArgs>(args: SelectSubset<T, EmailVerificationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__EmailVerificationClient<$Result.GetResult<Prisma.$EmailVerificationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first EmailVerification that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmailVerificationFindFirstArgs} args - Arguments to find a EmailVerification
     * @example
     * // Get one EmailVerification
     * const emailVerification = await prisma.emailVerification.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends EmailVerificationFindFirstArgs>(args?: SelectSubset<T, EmailVerificationFindFirstArgs<ExtArgs>>): Prisma__EmailVerificationClient<$Result.GetResult<Prisma.$EmailVerificationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first EmailVerification that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmailVerificationFindFirstOrThrowArgs} args - Arguments to find a EmailVerification
     * @example
     * // Get one EmailVerification
     * const emailVerification = await prisma.emailVerification.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends EmailVerificationFindFirstOrThrowArgs>(args?: SelectSubset<T, EmailVerificationFindFirstOrThrowArgs<ExtArgs>>): Prisma__EmailVerificationClient<$Result.GetResult<Prisma.$EmailVerificationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more EmailVerifications that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmailVerificationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all EmailVerifications
     * const emailVerifications = await prisma.emailVerification.findMany()
     * 
     * // Get first 10 EmailVerifications
     * const emailVerifications = await prisma.emailVerification.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const emailVerificationWithIdOnly = await prisma.emailVerification.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends EmailVerificationFindManyArgs>(args?: SelectSubset<T, EmailVerificationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmailVerificationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a EmailVerification.
     * @param {EmailVerificationCreateArgs} args - Arguments to create a EmailVerification.
     * @example
     * // Create one EmailVerification
     * const EmailVerification = await prisma.emailVerification.create({
     *   data: {
     *     // ... data to create a EmailVerification
     *   }
     * })
     * 
     */
    create<T extends EmailVerificationCreateArgs>(args: SelectSubset<T, EmailVerificationCreateArgs<ExtArgs>>): Prisma__EmailVerificationClient<$Result.GetResult<Prisma.$EmailVerificationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many EmailVerifications.
     * @param {EmailVerificationCreateManyArgs} args - Arguments to create many EmailVerifications.
     * @example
     * // Create many EmailVerifications
     * const emailVerification = await prisma.emailVerification.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends EmailVerificationCreateManyArgs>(args?: SelectSubset<T, EmailVerificationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many EmailVerifications and returns the data saved in the database.
     * @param {EmailVerificationCreateManyAndReturnArgs} args - Arguments to create many EmailVerifications.
     * @example
     * // Create many EmailVerifications
     * const emailVerification = await prisma.emailVerification.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many EmailVerifications and only return the `id`
     * const emailVerificationWithIdOnly = await prisma.emailVerification.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends EmailVerificationCreateManyAndReturnArgs>(args?: SelectSubset<T, EmailVerificationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmailVerificationPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a EmailVerification.
     * @param {EmailVerificationDeleteArgs} args - Arguments to delete one EmailVerification.
     * @example
     * // Delete one EmailVerification
     * const EmailVerification = await prisma.emailVerification.delete({
     *   where: {
     *     // ... filter to delete one EmailVerification
     *   }
     * })
     * 
     */
    delete<T extends EmailVerificationDeleteArgs>(args: SelectSubset<T, EmailVerificationDeleteArgs<ExtArgs>>): Prisma__EmailVerificationClient<$Result.GetResult<Prisma.$EmailVerificationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one EmailVerification.
     * @param {EmailVerificationUpdateArgs} args - Arguments to update one EmailVerification.
     * @example
     * // Update one EmailVerification
     * const emailVerification = await prisma.emailVerification.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends EmailVerificationUpdateArgs>(args: SelectSubset<T, EmailVerificationUpdateArgs<ExtArgs>>): Prisma__EmailVerificationClient<$Result.GetResult<Prisma.$EmailVerificationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more EmailVerifications.
     * @param {EmailVerificationDeleteManyArgs} args - Arguments to filter EmailVerifications to delete.
     * @example
     * // Delete a few EmailVerifications
     * const { count } = await prisma.emailVerification.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends EmailVerificationDeleteManyArgs>(args?: SelectSubset<T, EmailVerificationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more EmailVerifications.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmailVerificationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many EmailVerifications
     * const emailVerification = await prisma.emailVerification.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends EmailVerificationUpdateManyArgs>(args: SelectSubset<T, EmailVerificationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more EmailVerifications and returns the data updated in the database.
     * @param {EmailVerificationUpdateManyAndReturnArgs} args - Arguments to update many EmailVerifications.
     * @example
     * // Update many EmailVerifications
     * const emailVerification = await prisma.emailVerification.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more EmailVerifications and only return the `id`
     * const emailVerificationWithIdOnly = await prisma.emailVerification.updateManyAndReturn({
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
    updateManyAndReturn<T extends EmailVerificationUpdateManyAndReturnArgs>(args: SelectSubset<T, EmailVerificationUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmailVerificationPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one EmailVerification.
     * @param {EmailVerificationUpsertArgs} args - Arguments to update or create a EmailVerification.
     * @example
     * // Update or create a EmailVerification
     * const emailVerification = await prisma.emailVerification.upsert({
     *   create: {
     *     // ... data to create a EmailVerification
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the EmailVerification we want to update
     *   }
     * })
     */
    upsert<T extends EmailVerificationUpsertArgs>(args: SelectSubset<T, EmailVerificationUpsertArgs<ExtArgs>>): Prisma__EmailVerificationClient<$Result.GetResult<Prisma.$EmailVerificationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of EmailVerifications.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmailVerificationCountArgs} args - Arguments to filter EmailVerifications to count.
     * @example
     * // Count the number of EmailVerifications
     * const count = await prisma.emailVerification.count({
     *   where: {
     *     // ... the filter for the EmailVerifications we want to count
     *   }
     * })
    **/
    count<T extends EmailVerificationCountArgs>(
      args?: Subset<T, EmailVerificationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], EmailVerificationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a EmailVerification.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmailVerificationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends EmailVerificationAggregateArgs>(args: Subset<T, EmailVerificationAggregateArgs>): Prisma.PrismaPromise<GetEmailVerificationAggregateType<T>>

    /**
     * Group by EmailVerification.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmailVerificationGroupByArgs} args - Group by arguments.
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
      T extends EmailVerificationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: EmailVerificationGroupByArgs['orderBy'] }
        : { orderBy?: EmailVerificationGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, EmailVerificationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEmailVerificationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the EmailVerification model
   */
  readonly fields: EmailVerificationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for EmailVerification.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__EmailVerificationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the EmailVerification model
   */
  interface EmailVerificationFieldRefs {
    readonly id: FieldRef<"EmailVerification", 'String'>
    readonly userId: FieldRef<"EmailVerification", 'String'>
    readonly email: FieldRef<"EmailVerification", 'String'>
    readonly token: FieldRef<"EmailVerification", 'String'>
    readonly expiresAt: FieldRef<"EmailVerification", 'DateTime'>
    readonly usedAt: FieldRef<"EmailVerification", 'DateTime'>
    readonly createdAt: FieldRef<"EmailVerification", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * EmailVerification findUnique
   */
  export type EmailVerificationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailVerification
     */
    select?: EmailVerificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmailVerification
     */
    omit?: EmailVerificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailVerificationInclude<ExtArgs> | null
    /**
     * Filter, which EmailVerification to fetch.
     */
    where: EmailVerificationWhereUniqueInput
  }

  /**
   * EmailVerification findUniqueOrThrow
   */
  export type EmailVerificationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailVerification
     */
    select?: EmailVerificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmailVerification
     */
    omit?: EmailVerificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailVerificationInclude<ExtArgs> | null
    /**
     * Filter, which EmailVerification to fetch.
     */
    where: EmailVerificationWhereUniqueInput
  }

  /**
   * EmailVerification findFirst
   */
  export type EmailVerificationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailVerification
     */
    select?: EmailVerificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmailVerification
     */
    omit?: EmailVerificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailVerificationInclude<ExtArgs> | null
    /**
     * Filter, which EmailVerification to fetch.
     */
    where?: EmailVerificationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EmailVerifications to fetch.
     */
    orderBy?: EmailVerificationOrderByWithRelationInput | EmailVerificationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for EmailVerifications.
     */
    cursor?: EmailVerificationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EmailVerifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EmailVerifications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of EmailVerifications.
     */
    distinct?: EmailVerificationScalarFieldEnum | EmailVerificationScalarFieldEnum[]
  }

  /**
   * EmailVerification findFirstOrThrow
   */
  export type EmailVerificationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailVerification
     */
    select?: EmailVerificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmailVerification
     */
    omit?: EmailVerificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailVerificationInclude<ExtArgs> | null
    /**
     * Filter, which EmailVerification to fetch.
     */
    where?: EmailVerificationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EmailVerifications to fetch.
     */
    orderBy?: EmailVerificationOrderByWithRelationInput | EmailVerificationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for EmailVerifications.
     */
    cursor?: EmailVerificationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EmailVerifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EmailVerifications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of EmailVerifications.
     */
    distinct?: EmailVerificationScalarFieldEnum | EmailVerificationScalarFieldEnum[]
  }

  /**
   * EmailVerification findMany
   */
  export type EmailVerificationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailVerification
     */
    select?: EmailVerificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmailVerification
     */
    omit?: EmailVerificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailVerificationInclude<ExtArgs> | null
    /**
     * Filter, which EmailVerifications to fetch.
     */
    where?: EmailVerificationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EmailVerifications to fetch.
     */
    orderBy?: EmailVerificationOrderByWithRelationInput | EmailVerificationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing EmailVerifications.
     */
    cursor?: EmailVerificationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EmailVerifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EmailVerifications.
     */
    skip?: number
    distinct?: EmailVerificationScalarFieldEnum | EmailVerificationScalarFieldEnum[]
  }

  /**
   * EmailVerification create
   */
  export type EmailVerificationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailVerification
     */
    select?: EmailVerificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmailVerification
     */
    omit?: EmailVerificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailVerificationInclude<ExtArgs> | null
    /**
     * The data needed to create a EmailVerification.
     */
    data: XOR<EmailVerificationCreateInput, EmailVerificationUncheckedCreateInput>
  }

  /**
   * EmailVerification createMany
   */
  export type EmailVerificationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many EmailVerifications.
     */
    data: EmailVerificationCreateManyInput | EmailVerificationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * EmailVerification createManyAndReturn
   */
  export type EmailVerificationCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailVerification
     */
    select?: EmailVerificationSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the EmailVerification
     */
    omit?: EmailVerificationOmit<ExtArgs> | null
    /**
     * The data used to create many EmailVerifications.
     */
    data: EmailVerificationCreateManyInput | EmailVerificationCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailVerificationIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * EmailVerification update
   */
  export type EmailVerificationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailVerification
     */
    select?: EmailVerificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmailVerification
     */
    omit?: EmailVerificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailVerificationInclude<ExtArgs> | null
    /**
     * The data needed to update a EmailVerification.
     */
    data: XOR<EmailVerificationUpdateInput, EmailVerificationUncheckedUpdateInput>
    /**
     * Choose, which EmailVerification to update.
     */
    where: EmailVerificationWhereUniqueInput
  }

  /**
   * EmailVerification updateMany
   */
  export type EmailVerificationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update EmailVerifications.
     */
    data: XOR<EmailVerificationUpdateManyMutationInput, EmailVerificationUncheckedUpdateManyInput>
    /**
     * Filter which EmailVerifications to update
     */
    where?: EmailVerificationWhereInput
    /**
     * Limit how many EmailVerifications to update.
     */
    limit?: number
  }

  /**
   * EmailVerification updateManyAndReturn
   */
  export type EmailVerificationUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailVerification
     */
    select?: EmailVerificationSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the EmailVerification
     */
    omit?: EmailVerificationOmit<ExtArgs> | null
    /**
     * The data used to update EmailVerifications.
     */
    data: XOR<EmailVerificationUpdateManyMutationInput, EmailVerificationUncheckedUpdateManyInput>
    /**
     * Filter which EmailVerifications to update
     */
    where?: EmailVerificationWhereInput
    /**
     * Limit how many EmailVerifications to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailVerificationIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * EmailVerification upsert
   */
  export type EmailVerificationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailVerification
     */
    select?: EmailVerificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmailVerification
     */
    omit?: EmailVerificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailVerificationInclude<ExtArgs> | null
    /**
     * The filter to search for the EmailVerification to update in case it exists.
     */
    where: EmailVerificationWhereUniqueInput
    /**
     * In case the EmailVerification found by the `where` argument doesn't exist, create a new EmailVerification with this data.
     */
    create: XOR<EmailVerificationCreateInput, EmailVerificationUncheckedCreateInput>
    /**
     * In case the EmailVerification was found with the provided `where` argument, update it with this data.
     */
    update: XOR<EmailVerificationUpdateInput, EmailVerificationUncheckedUpdateInput>
  }

  /**
   * EmailVerification delete
   */
  export type EmailVerificationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailVerification
     */
    select?: EmailVerificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmailVerification
     */
    omit?: EmailVerificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailVerificationInclude<ExtArgs> | null
    /**
     * Filter which EmailVerification to delete.
     */
    where: EmailVerificationWhereUniqueInput
  }

  /**
   * EmailVerification deleteMany
   */
  export type EmailVerificationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which EmailVerifications to delete
     */
    where?: EmailVerificationWhereInput
    /**
     * Limit how many EmailVerifications to delete.
     */
    limit?: number
  }

  /**
   * EmailVerification without action
   */
  export type EmailVerificationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailVerification
     */
    select?: EmailVerificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmailVerification
     */
    omit?: EmailVerificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailVerificationInclude<ExtArgs> | null
  }


  /**
   * Model PasswordReset
   */

  export type AggregatePasswordReset = {
    _count: PasswordResetCountAggregateOutputType | null
    _min: PasswordResetMinAggregateOutputType | null
    _max: PasswordResetMaxAggregateOutputType | null
  }

  export type PasswordResetMinAggregateOutputType = {
    id: string | null
    userId: string | null
    token: string | null
    expiresAt: Date | null
    usedAt: Date | null
    createdAt: Date | null
  }

  export type PasswordResetMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    token: string | null
    expiresAt: Date | null
    usedAt: Date | null
    createdAt: Date | null
  }

  export type PasswordResetCountAggregateOutputType = {
    id: number
    userId: number
    token: number
    expiresAt: number
    usedAt: number
    createdAt: number
    _all: number
  }


  export type PasswordResetMinAggregateInputType = {
    id?: true
    userId?: true
    token?: true
    expiresAt?: true
    usedAt?: true
    createdAt?: true
  }

  export type PasswordResetMaxAggregateInputType = {
    id?: true
    userId?: true
    token?: true
    expiresAt?: true
    usedAt?: true
    createdAt?: true
  }

  export type PasswordResetCountAggregateInputType = {
    id?: true
    userId?: true
    token?: true
    expiresAt?: true
    usedAt?: true
    createdAt?: true
    _all?: true
  }

  export type PasswordResetAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PasswordReset to aggregate.
     */
    where?: PasswordResetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PasswordResets to fetch.
     */
    orderBy?: PasswordResetOrderByWithRelationInput | PasswordResetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PasswordResetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PasswordResets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PasswordResets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PasswordResets
    **/
    _count?: true | PasswordResetCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PasswordResetMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PasswordResetMaxAggregateInputType
  }

  export type GetPasswordResetAggregateType<T extends PasswordResetAggregateArgs> = {
        [P in keyof T & keyof AggregatePasswordReset]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePasswordReset[P]>
      : GetScalarType<T[P], AggregatePasswordReset[P]>
  }




  export type PasswordResetGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PasswordResetWhereInput
    orderBy?: PasswordResetOrderByWithAggregationInput | PasswordResetOrderByWithAggregationInput[]
    by: PasswordResetScalarFieldEnum[] | PasswordResetScalarFieldEnum
    having?: PasswordResetScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PasswordResetCountAggregateInputType | true
    _min?: PasswordResetMinAggregateInputType
    _max?: PasswordResetMaxAggregateInputType
  }

  export type PasswordResetGroupByOutputType = {
    id: string
    userId: string
    token: string
    expiresAt: Date
    usedAt: Date | null
    createdAt: Date
    _count: PasswordResetCountAggregateOutputType | null
    _min: PasswordResetMinAggregateOutputType | null
    _max: PasswordResetMaxAggregateOutputType | null
  }

  type GetPasswordResetGroupByPayload<T extends PasswordResetGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PasswordResetGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PasswordResetGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PasswordResetGroupByOutputType[P]>
            : GetScalarType<T[P], PasswordResetGroupByOutputType[P]>
        }
      >
    >


  export type PasswordResetSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    token?: boolean
    expiresAt?: boolean
    usedAt?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["passwordReset"]>

  export type PasswordResetSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    token?: boolean
    expiresAt?: boolean
    usedAt?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["passwordReset"]>

  export type PasswordResetSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    token?: boolean
    expiresAt?: boolean
    usedAt?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["passwordReset"]>

  export type PasswordResetSelectScalar = {
    id?: boolean
    userId?: boolean
    token?: boolean
    expiresAt?: boolean
    usedAt?: boolean
    createdAt?: boolean
  }

  export type PasswordResetOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "token" | "expiresAt" | "usedAt" | "createdAt", ExtArgs["result"]["passwordReset"]>
  export type PasswordResetInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type PasswordResetIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type PasswordResetIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $PasswordResetPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PasswordReset"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      token: string
      expiresAt: Date
      usedAt: Date | null
      createdAt: Date
    }, ExtArgs["result"]["passwordReset"]>
    composites: {}
  }

  type PasswordResetGetPayload<S extends boolean | null | undefined | PasswordResetDefaultArgs> = $Result.GetResult<Prisma.$PasswordResetPayload, S>

  type PasswordResetCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PasswordResetFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PasswordResetCountAggregateInputType | true
    }

  export interface PasswordResetDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PasswordReset'], meta: { name: 'PasswordReset' } }
    /**
     * Find zero or one PasswordReset that matches the filter.
     * @param {PasswordResetFindUniqueArgs} args - Arguments to find a PasswordReset
     * @example
     * // Get one PasswordReset
     * const passwordReset = await prisma.passwordReset.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PasswordResetFindUniqueArgs>(args: SelectSubset<T, PasswordResetFindUniqueArgs<ExtArgs>>): Prisma__PasswordResetClient<$Result.GetResult<Prisma.$PasswordResetPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one PasswordReset that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PasswordResetFindUniqueOrThrowArgs} args - Arguments to find a PasswordReset
     * @example
     * // Get one PasswordReset
     * const passwordReset = await prisma.passwordReset.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PasswordResetFindUniqueOrThrowArgs>(args: SelectSubset<T, PasswordResetFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PasswordResetClient<$Result.GetResult<Prisma.$PasswordResetPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PasswordReset that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PasswordResetFindFirstArgs} args - Arguments to find a PasswordReset
     * @example
     * // Get one PasswordReset
     * const passwordReset = await prisma.passwordReset.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PasswordResetFindFirstArgs>(args?: SelectSubset<T, PasswordResetFindFirstArgs<ExtArgs>>): Prisma__PasswordResetClient<$Result.GetResult<Prisma.$PasswordResetPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PasswordReset that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PasswordResetFindFirstOrThrowArgs} args - Arguments to find a PasswordReset
     * @example
     * // Get one PasswordReset
     * const passwordReset = await prisma.passwordReset.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PasswordResetFindFirstOrThrowArgs>(args?: SelectSubset<T, PasswordResetFindFirstOrThrowArgs<ExtArgs>>): Prisma__PasswordResetClient<$Result.GetResult<Prisma.$PasswordResetPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more PasswordResets that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PasswordResetFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PasswordResets
     * const passwordResets = await prisma.passwordReset.findMany()
     * 
     * // Get first 10 PasswordResets
     * const passwordResets = await prisma.passwordReset.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const passwordResetWithIdOnly = await prisma.passwordReset.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PasswordResetFindManyArgs>(args?: SelectSubset<T, PasswordResetFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PasswordResetPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a PasswordReset.
     * @param {PasswordResetCreateArgs} args - Arguments to create a PasswordReset.
     * @example
     * // Create one PasswordReset
     * const PasswordReset = await prisma.passwordReset.create({
     *   data: {
     *     // ... data to create a PasswordReset
     *   }
     * })
     * 
     */
    create<T extends PasswordResetCreateArgs>(args: SelectSubset<T, PasswordResetCreateArgs<ExtArgs>>): Prisma__PasswordResetClient<$Result.GetResult<Prisma.$PasswordResetPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many PasswordResets.
     * @param {PasswordResetCreateManyArgs} args - Arguments to create many PasswordResets.
     * @example
     * // Create many PasswordResets
     * const passwordReset = await prisma.passwordReset.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PasswordResetCreateManyArgs>(args?: SelectSubset<T, PasswordResetCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PasswordResets and returns the data saved in the database.
     * @param {PasswordResetCreateManyAndReturnArgs} args - Arguments to create many PasswordResets.
     * @example
     * // Create many PasswordResets
     * const passwordReset = await prisma.passwordReset.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PasswordResets and only return the `id`
     * const passwordResetWithIdOnly = await prisma.passwordReset.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PasswordResetCreateManyAndReturnArgs>(args?: SelectSubset<T, PasswordResetCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PasswordResetPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a PasswordReset.
     * @param {PasswordResetDeleteArgs} args - Arguments to delete one PasswordReset.
     * @example
     * // Delete one PasswordReset
     * const PasswordReset = await prisma.passwordReset.delete({
     *   where: {
     *     // ... filter to delete one PasswordReset
     *   }
     * })
     * 
     */
    delete<T extends PasswordResetDeleteArgs>(args: SelectSubset<T, PasswordResetDeleteArgs<ExtArgs>>): Prisma__PasswordResetClient<$Result.GetResult<Prisma.$PasswordResetPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one PasswordReset.
     * @param {PasswordResetUpdateArgs} args - Arguments to update one PasswordReset.
     * @example
     * // Update one PasswordReset
     * const passwordReset = await prisma.passwordReset.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PasswordResetUpdateArgs>(args: SelectSubset<T, PasswordResetUpdateArgs<ExtArgs>>): Prisma__PasswordResetClient<$Result.GetResult<Prisma.$PasswordResetPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more PasswordResets.
     * @param {PasswordResetDeleteManyArgs} args - Arguments to filter PasswordResets to delete.
     * @example
     * // Delete a few PasswordResets
     * const { count } = await prisma.passwordReset.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PasswordResetDeleteManyArgs>(args?: SelectSubset<T, PasswordResetDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PasswordResets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PasswordResetUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PasswordResets
     * const passwordReset = await prisma.passwordReset.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PasswordResetUpdateManyArgs>(args: SelectSubset<T, PasswordResetUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PasswordResets and returns the data updated in the database.
     * @param {PasswordResetUpdateManyAndReturnArgs} args - Arguments to update many PasswordResets.
     * @example
     * // Update many PasswordResets
     * const passwordReset = await prisma.passwordReset.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more PasswordResets and only return the `id`
     * const passwordResetWithIdOnly = await prisma.passwordReset.updateManyAndReturn({
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
    updateManyAndReturn<T extends PasswordResetUpdateManyAndReturnArgs>(args: SelectSubset<T, PasswordResetUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PasswordResetPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one PasswordReset.
     * @param {PasswordResetUpsertArgs} args - Arguments to update or create a PasswordReset.
     * @example
     * // Update or create a PasswordReset
     * const passwordReset = await prisma.passwordReset.upsert({
     *   create: {
     *     // ... data to create a PasswordReset
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PasswordReset we want to update
     *   }
     * })
     */
    upsert<T extends PasswordResetUpsertArgs>(args: SelectSubset<T, PasswordResetUpsertArgs<ExtArgs>>): Prisma__PasswordResetClient<$Result.GetResult<Prisma.$PasswordResetPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of PasswordResets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PasswordResetCountArgs} args - Arguments to filter PasswordResets to count.
     * @example
     * // Count the number of PasswordResets
     * const count = await prisma.passwordReset.count({
     *   where: {
     *     // ... the filter for the PasswordResets we want to count
     *   }
     * })
    **/
    count<T extends PasswordResetCountArgs>(
      args?: Subset<T, PasswordResetCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PasswordResetCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PasswordReset.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PasswordResetAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends PasswordResetAggregateArgs>(args: Subset<T, PasswordResetAggregateArgs>): Prisma.PrismaPromise<GetPasswordResetAggregateType<T>>

    /**
     * Group by PasswordReset.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PasswordResetGroupByArgs} args - Group by arguments.
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
      T extends PasswordResetGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PasswordResetGroupByArgs['orderBy'] }
        : { orderBy?: PasswordResetGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, PasswordResetGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPasswordResetGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PasswordReset model
   */
  readonly fields: PasswordResetFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PasswordReset.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PasswordResetClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the PasswordReset model
   */
  interface PasswordResetFieldRefs {
    readonly id: FieldRef<"PasswordReset", 'String'>
    readonly userId: FieldRef<"PasswordReset", 'String'>
    readonly token: FieldRef<"PasswordReset", 'String'>
    readonly expiresAt: FieldRef<"PasswordReset", 'DateTime'>
    readonly usedAt: FieldRef<"PasswordReset", 'DateTime'>
    readonly createdAt: FieldRef<"PasswordReset", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PasswordReset findUnique
   */
  export type PasswordResetFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PasswordReset
     */
    select?: PasswordResetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PasswordReset
     */
    omit?: PasswordResetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PasswordResetInclude<ExtArgs> | null
    /**
     * Filter, which PasswordReset to fetch.
     */
    where: PasswordResetWhereUniqueInput
  }

  /**
   * PasswordReset findUniqueOrThrow
   */
  export type PasswordResetFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PasswordReset
     */
    select?: PasswordResetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PasswordReset
     */
    omit?: PasswordResetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PasswordResetInclude<ExtArgs> | null
    /**
     * Filter, which PasswordReset to fetch.
     */
    where: PasswordResetWhereUniqueInput
  }

  /**
   * PasswordReset findFirst
   */
  export type PasswordResetFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PasswordReset
     */
    select?: PasswordResetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PasswordReset
     */
    omit?: PasswordResetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PasswordResetInclude<ExtArgs> | null
    /**
     * Filter, which PasswordReset to fetch.
     */
    where?: PasswordResetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PasswordResets to fetch.
     */
    orderBy?: PasswordResetOrderByWithRelationInput | PasswordResetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PasswordResets.
     */
    cursor?: PasswordResetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PasswordResets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PasswordResets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PasswordResets.
     */
    distinct?: PasswordResetScalarFieldEnum | PasswordResetScalarFieldEnum[]
  }

  /**
   * PasswordReset findFirstOrThrow
   */
  export type PasswordResetFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PasswordReset
     */
    select?: PasswordResetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PasswordReset
     */
    omit?: PasswordResetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PasswordResetInclude<ExtArgs> | null
    /**
     * Filter, which PasswordReset to fetch.
     */
    where?: PasswordResetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PasswordResets to fetch.
     */
    orderBy?: PasswordResetOrderByWithRelationInput | PasswordResetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PasswordResets.
     */
    cursor?: PasswordResetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PasswordResets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PasswordResets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PasswordResets.
     */
    distinct?: PasswordResetScalarFieldEnum | PasswordResetScalarFieldEnum[]
  }

  /**
   * PasswordReset findMany
   */
  export type PasswordResetFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PasswordReset
     */
    select?: PasswordResetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PasswordReset
     */
    omit?: PasswordResetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PasswordResetInclude<ExtArgs> | null
    /**
     * Filter, which PasswordResets to fetch.
     */
    where?: PasswordResetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PasswordResets to fetch.
     */
    orderBy?: PasswordResetOrderByWithRelationInput | PasswordResetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PasswordResets.
     */
    cursor?: PasswordResetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PasswordResets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PasswordResets.
     */
    skip?: number
    distinct?: PasswordResetScalarFieldEnum | PasswordResetScalarFieldEnum[]
  }

  /**
   * PasswordReset create
   */
  export type PasswordResetCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PasswordReset
     */
    select?: PasswordResetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PasswordReset
     */
    omit?: PasswordResetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PasswordResetInclude<ExtArgs> | null
    /**
     * The data needed to create a PasswordReset.
     */
    data: XOR<PasswordResetCreateInput, PasswordResetUncheckedCreateInput>
  }

  /**
   * PasswordReset createMany
   */
  export type PasswordResetCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PasswordResets.
     */
    data: PasswordResetCreateManyInput | PasswordResetCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PasswordReset createManyAndReturn
   */
  export type PasswordResetCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PasswordReset
     */
    select?: PasswordResetSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PasswordReset
     */
    omit?: PasswordResetOmit<ExtArgs> | null
    /**
     * The data used to create many PasswordResets.
     */
    data: PasswordResetCreateManyInput | PasswordResetCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PasswordResetIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * PasswordReset update
   */
  export type PasswordResetUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PasswordReset
     */
    select?: PasswordResetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PasswordReset
     */
    omit?: PasswordResetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PasswordResetInclude<ExtArgs> | null
    /**
     * The data needed to update a PasswordReset.
     */
    data: XOR<PasswordResetUpdateInput, PasswordResetUncheckedUpdateInput>
    /**
     * Choose, which PasswordReset to update.
     */
    where: PasswordResetWhereUniqueInput
  }

  /**
   * PasswordReset updateMany
   */
  export type PasswordResetUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PasswordResets.
     */
    data: XOR<PasswordResetUpdateManyMutationInput, PasswordResetUncheckedUpdateManyInput>
    /**
     * Filter which PasswordResets to update
     */
    where?: PasswordResetWhereInput
    /**
     * Limit how many PasswordResets to update.
     */
    limit?: number
  }

  /**
   * PasswordReset updateManyAndReturn
   */
  export type PasswordResetUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PasswordReset
     */
    select?: PasswordResetSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PasswordReset
     */
    omit?: PasswordResetOmit<ExtArgs> | null
    /**
     * The data used to update PasswordResets.
     */
    data: XOR<PasswordResetUpdateManyMutationInput, PasswordResetUncheckedUpdateManyInput>
    /**
     * Filter which PasswordResets to update
     */
    where?: PasswordResetWhereInput
    /**
     * Limit how many PasswordResets to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PasswordResetIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * PasswordReset upsert
   */
  export type PasswordResetUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PasswordReset
     */
    select?: PasswordResetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PasswordReset
     */
    omit?: PasswordResetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PasswordResetInclude<ExtArgs> | null
    /**
     * The filter to search for the PasswordReset to update in case it exists.
     */
    where: PasswordResetWhereUniqueInput
    /**
     * In case the PasswordReset found by the `where` argument doesn't exist, create a new PasswordReset with this data.
     */
    create: XOR<PasswordResetCreateInput, PasswordResetUncheckedCreateInput>
    /**
     * In case the PasswordReset was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PasswordResetUpdateInput, PasswordResetUncheckedUpdateInput>
  }

  /**
   * PasswordReset delete
   */
  export type PasswordResetDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PasswordReset
     */
    select?: PasswordResetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PasswordReset
     */
    omit?: PasswordResetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PasswordResetInclude<ExtArgs> | null
    /**
     * Filter which PasswordReset to delete.
     */
    where: PasswordResetWhereUniqueInput
  }

  /**
   * PasswordReset deleteMany
   */
  export type PasswordResetDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PasswordResets to delete
     */
    where?: PasswordResetWhereInput
    /**
     * Limit how many PasswordResets to delete.
     */
    limit?: number
  }

  /**
   * PasswordReset without action
   */
  export type PasswordResetDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PasswordReset
     */
    select?: PasswordResetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PasswordReset
     */
    omit?: PasswordResetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PasswordResetInclude<ExtArgs> | null
  }


  /**
   * Model InviteToken
   */

  export type AggregateInviteToken = {
    _count: InviteTokenCountAggregateOutputType | null
    _min: InviteTokenMinAggregateOutputType | null
    _max: InviteTokenMaxAggregateOutputType | null
  }

  export type InviteTokenMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    email: string | null
    role: $Enums.UserRole | null
    token: string | null
    expiresAt: Date | null
    usedAt: Date | null
    invitedByUserId: string | null
    createdAt: Date | null
  }

  export type InviteTokenMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    email: string | null
    role: $Enums.UserRole | null
    token: string | null
    expiresAt: Date | null
    usedAt: Date | null
    invitedByUserId: string | null
    createdAt: Date | null
  }

  export type InviteTokenCountAggregateOutputType = {
    id: number
    tenantId: number
    email: number
    role: number
    token: number
    expiresAt: number
    usedAt: number
    invitedByUserId: number
    createdAt: number
    _all: number
  }


  export type InviteTokenMinAggregateInputType = {
    id?: true
    tenantId?: true
    email?: true
    role?: true
    token?: true
    expiresAt?: true
    usedAt?: true
    invitedByUserId?: true
    createdAt?: true
  }

  export type InviteTokenMaxAggregateInputType = {
    id?: true
    tenantId?: true
    email?: true
    role?: true
    token?: true
    expiresAt?: true
    usedAt?: true
    invitedByUserId?: true
    createdAt?: true
  }

  export type InviteTokenCountAggregateInputType = {
    id?: true
    tenantId?: true
    email?: true
    role?: true
    token?: true
    expiresAt?: true
    usedAt?: true
    invitedByUserId?: true
    createdAt?: true
    _all?: true
  }

  export type InviteTokenAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which InviteToken to aggregate.
     */
    where?: InviteTokenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InviteTokens to fetch.
     */
    orderBy?: InviteTokenOrderByWithRelationInput | InviteTokenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: InviteTokenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InviteTokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InviteTokens.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned InviteTokens
    **/
    _count?: true | InviteTokenCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: InviteTokenMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: InviteTokenMaxAggregateInputType
  }

  export type GetInviteTokenAggregateType<T extends InviteTokenAggregateArgs> = {
        [P in keyof T & keyof AggregateInviteToken]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateInviteToken[P]>
      : GetScalarType<T[P], AggregateInviteToken[P]>
  }




  export type InviteTokenGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InviteTokenWhereInput
    orderBy?: InviteTokenOrderByWithAggregationInput | InviteTokenOrderByWithAggregationInput[]
    by: InviteTokenScalarFieldEnum[] | InviteTokenScalarFieldEnum
    having?: InviteTokenScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: InviteTokenCountAggregateInputType | true
    _min?: InviteTokenMinAggregateInputType
    _max?: InviteTokenMaxAggregateInputType
  }

  export type InviteTokenGroupByOutputType = {
    id: string
    tenantId: string
    email: string
    role: $Enums.UserRole
    token: string
    expiresAt: Date
    usedAt: Date | null
    invitedByUserId: string
    createdAt: Date
    _count: InviteTokenCountAggregateOutputType | null
    _min: InviteTokenMinAggregateOutputType | null
    _max: InviteTokenMaxAggregateOutputType | null
  }

  type GetInviteTokenGroupByPayload<T extends InviteTokenGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<InviteTokenGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof InviteTokenGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], InviteTokenGroupByOutputType[P]>
            : GetScalarType<T[P], InviteTokenGroupByOutputType[P]>
        }
      >
    >


  export type InviteTokenSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    email?: boolean
    role?: boolean
    token?: boolean
    expiresAt?: boolean
    usedAt?: boolean
    invitedByUserId?: boolean
    createdAt?: boolean
    invitedBy?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["inviteToken"]>

  export type InviteTokenSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    email?: boolean
    role?: boolean
    token?: boolean
    expiresAt?: boolean
    usedAt?: boolean
    invitedByUserId?: boolean
    createdAt?: boolean
    invitedBy?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["inviteToken"]>

  export type InviteTokenSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    email?: boolean
    role?: boolean
    token?: boolean
    expiresAt?: boolean
    usedAt?: boolean
    invitedByUserId?: boolean
    createdAt?: boolean
    invitedBy?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["inviteToken"]>

  export type InviteTokenSelectScalar = {
    id?: boolean
    tenantId?: boolean
    email?: boolean
    role?: boolean
    token?: boolean
    expiresAt?: boolean
    usedAt?: boolean
    invitedByUserId?: boolean
    createdAt?: boolean
  }

  export type InviteTokenOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "email" | "role" | "token" | "expiresAt" | "usedAt" | "invitedByUserId" | "createdAt", ExtArgs["result"]["inviteToken"]>
  export type InviteTokenInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    invitedBy?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type InviteTokenIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    invitedBy?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type InviteTokenIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    invitedBy?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $InviteTokenPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "InviteToken"
    objects: {
      invitedBy: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      email: string
      role: $Enums.UserRole
      token: string
      expiresAt: Date
      usedAt: Date | null
      invitedByUserId: string
      createdAt: Date
    }, ExtArgs["result"]["inviteToken"]>
    composites: {}
  }

  type InviteTokenGetPayload<S extends boolean | null | undefined | InviteTokenDefaultArgs> = $Result.GetResult<Prisma.$InviteTokenPayload, S>

  type InviteTokenCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<InviteTokenFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: InviteTokenCountAggregateInputType | true
    }

  export interface InviteTokenDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['InviteToken'], meta: { name: 'InviteToken' } }
    /**
     * Find zero or one InviteToken that matches the filter.
     * @param {InviteTokenFindUniqueArgs} args - Arguments to find a InviteToken
     * @example
     * // Get one InviteToken
     * const inviteToken = await prisma.inviteToken.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends InviteTokenFindUniqueArgs>(args: SelectSubset<T, InviteTokenFindUniqueArgs<ExtArgs>>): Prisma__InviteTokenClient<$Result.GetResult<Prisma.$InviteTokenPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one InviteToken that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {InviteTokenFindUniqueOrThrowArgs} args - Arguments to find a InviteToken
     * @example
     * // Get one InviteToken
     * const inviteToken = await prisma.inviteToken.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends InviteTokenFindUniqueOrThrowArgs>(args: SelectSubset<T, InviteTokenFindUniqueOrThrowArgs<ExtArgs>>): Prisma__InviteTokenClient<$Result.GetResult<Prisma.$InviteTokenPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first InviteToken that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InviteTokenFindFirstArgs} args - Arguments to find a InviteToken
     * @example
     * // Get one InviteToken
     * const inviteToken = await prisma.inviteToken.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends InviteTokenFindFirstArgs>(args?: SelectSubset<T, InviteTokenFindFirstArgs<ExtArgs>>): Prisma__InviteTokenClient<$Result.GetResult<Prisma.$InviteTokenPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first InviteToken that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InviteTokenFindFirstOrThrowArgs} args - Arguments to find a InviteToken
     * @example
     * // Get one InviteToken
     * const inviteToken = await prisma.inviteToken.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends InviteTokenFindFirstOrThrowArgs>(args?: SelectSubset<T, InviteTokenFindFirstOrThrowArgs<ExtArgs>>): Prisma__InviteTokenClient<$Result.GetResult<Prisma.$InviteTokenPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more InviteTokens that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InviteTokenFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all InviteTokens
     * const inviteTokens = await prisma.inviteToken.findMany()
     * 
     * // Get first 10 InviteTokens
     * const inviteTokens = await prisma.inviteToken.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const inviteTokenWithIdOnly = await prisma.inviteToken.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends InviteTokenFindManyArgs>(args?: SelectSubset<T, InviteTokenFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InviteTokenPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a InviteToken.
     * @param {InviteTokenCreateArgs} args - Arguments to create a InviteToken.
     * @example
     * // Create one InviteToken
     * const InviteToken = await prisma.inviteToken.create({
     *   data: {
     *     // ... data to create a InviteToken
     *   }
     * })
     * 
     */
    create<T extends InviteTokenCreateArgs>(args: SelectSubset<T, InviteTokenCreateArgs<ExtArgs>>): Prisma__InviteTokenClient<$Result.GetResult<Prisma.$InviteTokenPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many InviteTokens.
     * @param {InviteTokenCreateManyArgs} args - Arguments to create many InviteTokens.
     * @example
     * // Create many InviteTokens
     * const inviteToken = await prisma.inviteToken.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends InviteTokenCreateManyArgs>(args?: SelectSubset<T, InviteTokenCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many InviteTokens and returns the data saved in the database.
     * @param {InviteTokenCreateManyAndReturnArgs} args - Arguments to create many InviteTokens.
     * @example
     * // Create many InviteTokens
     * const inviteToken = await prisma.inviteToken.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many InviteTokens and only return the `id`
     * const inviteTokenWithIdOnly = await prisma.inviteToken.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends InviteTokenCreateManyAndReturnArgs>(args?: SelectSubset<T, InviteTokenCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InviteTokenPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a InviteToken.
     * @param {InviteTokenDeleteArgs} args - Arguments to delete one InviteToken.
     * @example
     * // Delete one InviteToken
     * const InviteToken = await prisma.inviteToken.delete({
     *   where: {
     *     // ... filter to delete one InviteToken
     *   }
     * })
     * 
     */
    delete<T extends InviteTokenDeleteArgs>(args: SelectSubset<T, InviteTokenDeleteArgs<ExtArgs>>): Prisma__InviteTokenClient<$Result.GetResult<Prisma.$InviteTokenPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one InviteToken.
     * @param {InviteTokenUpdateArgs} args - Arguments to update one InviteToken.
     * @example
     * // Update one InviteToken
     * const inviteToken = await prisma.inviteToken.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends InviteTokenUpdateArgs>(args: SelectSubset<T, InviteTokenUpdateArgs<ExtArgs>>): Prisma__InviteTokenClient<$Result.GetResult<Prisma.$InviteTokenPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more InviteTokens.
     * @param {InviteTokenDeleteManyArgs} args - Arguments to filter InviteTokens to delete.
     * @example
     * // Delete a few InviteTokens
     * const { count } = await prisma.inviteToken.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends InviteTokenDeleteManyArgs>(args?: SelectSubset<T, InviteTokenDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more InviteTokens.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InviteTokenUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many InviteTokens
     * const inviteToken = await prisma.inviteToken.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends InviteTokenUpdateManyArgs>(args: SelectSubset<T, InviteTokenUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more InviteTokens and returns the data updated in the database.
     * @param {InviteTokenUpdateManyAndReturnArgs} args - Arguments to update many InviteTokens.
     * @example
     * // Update many InviteTokens
     * const inviteToken = await prisma.inviteToken.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more InviteTokens and only return the `id`
     * const inviteTokenWithIdOnly = await prisma.inviteToken.updateManyAndReturn({
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
    updateManyAndReturn<T extends InviteTokenUpdateManyAndReturnArgs>(args: SelectSubset<T, InviteTokenUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InviteTokenPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one InviteToken.
     * @param {InviteTokenUpsertArgs} args - Arguments to update or create a InviteToken.
     * @example
     * // Update or create a InviteToken
     * const inviteToken = await prisma.inviteToken.upsert({
     *   create: {
     *     // ... data to create a InviteToken
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the InviteToken we want to update
     *   }
     * })
     */
    upsert<T extends InviteTokenUpsertArgs>(args: SelectSubset<T, InviteTokenUpsertArgs<ExtArgs>>): Prisma__InviteTokenClient<$Result.GetResult<Prisma.$InviteTokenPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of InviteTokens.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InviteTokenCountArgs} args - Arguments to filter InviteTokens to count.
     * @example
     * // Count the number of InviteTokens
     * const count = await prisma.inviteToken.count({
     *   where: {
     *     // ... the filter for the InviteTokens we want to count
     *   }
     * })
    **/
    count<T extends InviteTokenCountArgs>(
      args?: Subset<T, InviteTokenCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], InviteTokenCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a InviteToken.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InviteTokenAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends InviteTokenAggregateArgs>(args: Subset<T, InviteTokenAggregateArgs>): Prisma.PrismaPromise<GetInviteTokenAggregateType<T>>

    /**
     * Group by InviteToken.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InviteTokenGroupByArgs} args - Group by arguments.
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
      T extends InviteTokenGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: InviteTokenGroupByArgs['orderBy'] }
        : { orderBy?: InviteTokenGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, InviteTokenGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetInviteTokenGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the InviteToken model
   */
  readonly fields: InviteTokenFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for InviteToken.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__InviteTokenClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    invitedBy<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the InviteToken model
   */
  interface InviteTokenFieldRefs {
    readonly id: FieldRef<"InviteToken", 'String'>
    readonly tenantId: FieldRef<"InviteToken", 'String'>
    readonly email: FieldRef<"InviteToken", 'String'>
    readonly role: FieldRef<"InviteToken", 'UserRole'>
    readonly token: FieldRef<"InviteToken", 'String'>
    readonly expiresAt: FieldRef<"InviteToken", 'DateTime'>
    readonly usedAt: FieldRef<"InviteToken", 'DateTime'>
    readonly invitedByUserId: FieldRef<"InviteToken", 'String'>
    readonly createdAt: FieldRef<"InviteToken", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * InviteToken findUnique
   */
  export type InviteTokenFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InviteToken
     */
    select?: InviteTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InviteToken
     */
    omit?: InviteTokenOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InviteTokenInclude<ExtArgs> | null
    /**
     * Filter, which InviteToken to fetch.
     */
    where: InviteTokenWhereUniqueInput
  }

  /**
   * InviteToken findUniqueOrThrow
   */
  export type InviteTokenFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InviteToken
     */
    select?: InviteTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InviteToken
     */
    omit?: InviteTokenOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InviteTokenInclude<ExtArgs> | null
    /**
     * Filter, which InviteToken to fetch.
     */
    where: InviteTokenWhereUniqueInput
  }

  /**
   * InviteToken findFirst
   */
  export type InviteTokenFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InviteToken
     */
    select?: InviteTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InviteToken
     */
    omit?: InviteTokenOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InviteTokenInclude<ExtArgs> | null
    /**
     * Filter, which InviteToken to fetch.
     */
    where?: InviteTokenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InviteTokens to fetch.
     */
    orderBy?: InviteTokenOrderByWithRelationInput | InviteTokenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for InviteTokens.
     */
    cursor?: InviteTokenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InviteTokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InviteTokens.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of InviteTokens.
     */
    distinct?: InviteTokenScalarFieldEnum | InviteTokenScalarFieldEnum[]
  }

  /**
   * InviteToken findFirstOrThrow
   */
  export type InviteTokenFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InviteToken
     */
    select?: InviteTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InviteToken
     */
    omit?: InviteTokenOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InviteTokenInclude<ExtArgs> | null
    /**
     * Filter, which InviteToken to fetch.
     */
    where?: InviteTokenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InviteTokens to fetch.
     */
    orderBy?: InviteTokenOrderByWithRelationInput | InviteTokenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for InviteTokens.
     */
    cursor?: InviteTokenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InviteTokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InviteTokens.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of InviteTokens.
     */
    distinct?: InviteTokenScalarFieldEnum | InviteTokenScalarFieldEnum[]
  }

  /**
   * InviteToken findMany
   */
  export type InviteTokenFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InviteToken
     */
    select?: InviteTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InviteToken
     */
    omit?: InviteTokenOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InviteTokenInclude<ExtArgs> | null
    /**
     * Filter, which InviteTokens to fetch.
     */
    where?: InviteTokenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InviteTokens to fetch.
     */
    orderBy?: InviteTokenOrderByWithRelationInput | InviteTokenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing InviteTokens.
     */
    cursor?: InviteTokenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InviteTokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InviteTokens.
     */
    skip?: number
    distinct?: InviteTokenScalarFieldEnum | InviteTokenScalarFieldEnum[]
  }

  /**
   * InviteToken create
   */
  export type InviteTokenCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InviteToken
     */
    select?: InviteTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InviteToken
     */
    omit?: InviteTokenOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InviteTokenInclude<ExtArgs> | null
    /**
     * The data needed to create a InviteToken.
     */
    data: XOR<InviteTokenCreateInput, InviteTokenUncheckedCreateInput>
  }

  /**
   * InviteToken createMany
   */
  export type InviteTokenCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many InviteTokens.
     */
    data: InviteTokenCreateManyInput | InviteTokenCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * InviteToken createManyAndReturn
   */
  export type InviteTokenCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InviteToken
     */
    select?: InviteTokenSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the InviteToken
     */
    omit?: InviteTokenOmit<ExtArgs> | null
    /**
     * The data used to create many InviteTokens.
     */
    data: InviteTokenCreateManyInput | InviteTokenCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InviteTokenIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * InviteToken update
   */
  export type InviteTokenUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InviteToken
     */
    select?: InviteTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InviteToken
     */
    omit?: InviteTokenOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InviteTokenInclude<ExtArgs> | null
    /**
     * The data needed to update a InviteToken.
     */
    data: XOR<InviteTokenUpdateInput, InviteTokenUncheckedUpdateInput>
    /**
     * Choose, which InviteToken to update.
     */
    where: InviteTokenWhereUniqueInput
  }

  /**
   * InviteToken updateMany
   */
  export type InviteTokenUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update InviteTokens.
     */
    data: XOR<InviteTokenUpdateManyMutationInput, InviteTokenUncheckedUpdateManyInput>
    /**
     * Filter which InviteTokens to update
     */
    where?: InviteTokenWhereInput
    /**
     * Limit how many InviteTokens to update.
     */
    limit?: number
  }

  /**
   * InviteToken updateManyAndReturn
   */
  export type InviteTokenUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InviteToken
     */
    select?: InviteTokenSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the InviteToken
     */
    omit?: InviteTokenOmit<ExtArgs> | null
    /**
     * The data used to update InviteTokens.
     */
    data: XOR<InviteTokenUpdateManyMutationInput, InviteTokenUncheckedUpdateManyInput>
    /**
     * Filter which InviteTokens to update
     */
    where?: InviteTokenWhereInput
    /**
     * Limit how many InviteTokens to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InviteTokenIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * InviteToken upsert
   */
  export type InviteTokenUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InviteToken
     */
    select?: InviteTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InviteToken
     */
    omit?: InviteTokenOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InviteTokenInclude<ExtArgs> | null
    /**
     * The filter to search for the InviteToken to update in case it exists.
     */
    where: InviteTokenWhereUniqueInput
    /**
     * In case the InviteToken found by the `where` argument doesn't exist, create a new InviteToken with this data.
     */
    create: XOR<InviteTokenCreateInput, InviteTokenUncheckedCreateInput>
    /**
     * In case the InviteToken was found with the provided `where` argument, update it with this data.
     */
    update: XOR<InviteTokenUpdateInput, InviteTokenUncheckedUpdateInput>
  }

  /**
   * InviteToken delete
   */
  export type InviteTokenDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InviteToken
     */
    select?: InviteTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InviteToken
     */
    omit?: InviteTokenOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InviteTokenInclude<ExtArgs> | null
    /**
     * Filter which InviteToken to delete.
     */
    where: InviteTokenWhereUniqueInput
  }

  /**
   * InviteToken deleteMany
   */
  export type InviteTokenDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which InviteTokens to delete
     */
    where?: InviteTokenWhereInput
    /**
     * Limit how many InviteTokens to delete.
     */
    limit?: number
  }

  /**
   * InviteToken without action
   */
  export type InviteTokenDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InviteToken
     */
    select?: InviteTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InviteToken
     */
    omit?: InviteTokenOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InviteTokenInclude<ExtArgs> | null
  }


  /**
   * Model AuditEvent
   */

  export type AggregateAuditEvent = {
    _count: AuditEventCountAggregateOutputType | null
    _min: AuditEventMinAggregateOutputType | null
    _max: AuditEventMaxAggregateOutputType | null
  }

  export type AuditEventMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    actorUserId: string | null
    action: string | null
    resourceType: string | null
    resourceId: string | null
    ipAddress: string | null
    createdAt: Date | null
  }

  export type AuditEventMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    actorUserId: string | null
    action: string | null
    resourceType: string | null
    resourceId: string | null
    ipAddress: string | null
    createdAt: Date | null
  }

  export type AuditEventCountAggregateOutputType = {
    id: number
    tenantId: number
    actorUserId: number
    action: number
    resourceType: number
    resourceId: number
    metadata: number
    ipAddress: number
    createdAt: number
    _all: number
  }


  export type AuditEventMinAggregateInputType = {
    id?: true
    tenantId?: true
    actorUserId?: true
    action?: true
    resourceType?: true
    resourceId?: true
    ipAddress?: true
    createdAt?: true
  }

  export type AuditEventMaxAggregateInputType = {
    id?: true
    tenantId?: true
    actorUserId?: true
    action?: true
    resourceType?: true
    resourceId?: true
    ipAddress?: true
    createdAt?: true
  }

  export type AuditEventCountAggregateInputType = {
    id?: true
    tenantId?: true
    actorUserId?: true
    action?: true
    resourceType?: true
    resourceId?: true
    metadata?: true
    ipAddress?: true
    createdAt?: true
    _all?: true
  }

  export type AuditEventAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AuditEvent to aggregate.
     */
    where?: AuditEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditEvents to fetch.
     */
    orderBy?: AuditEventOrderByWithRelationInput | AuditEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AuditEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AuditEvents
    **/
    _count?: true | AuditEventCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AuditEventMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AuditEventMaxAggregateInputType
  }

  export type GetAuditEventAggregateType<T extends AuditEventAggregateArgs> = {
        [P in keyof T & keyof AggregateAuditEvent]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAuditEvent[P]>
      : GetScalarType<T[P], AggregateAuditEvent[P]>
  }




  export type AuditEventGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AuditEventWhereInput
    orderBy?: AuditEventOrderByWithAggregationInput | AuditEventOrderByWithAggregationInput[]
    by: AuditEventScalarFieldEnum[] | AuditEventScalarFieldEnum
    having?: AuditEventScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AuditEventCountAggregateInputType | true
    _min?: AuditEventMinAggregateInputType
    _max?: AuditEventMaxAggregateInputType
  }

  export type AuditEventGroupByOutputType = {
    id: string
    tenantId: string | null
    actorUserId: string | null
    action: string
    resourceType: string
    resourceId: string
    metadata: JsonValue
    ipAddress: string | null
    createdAt: Date
    _count: AuditEventCountAggregateOutputType | null
    _min: AuditEventMinAggregateOutputType | null
    _max: AuditEventMaxAggregateOutputType | null
  }

  type GetAuditEventGroupByPayload<T extends AuditEventGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AuditEventGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AuditEventGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AuditEventGroupByOutputType[P]>
            : GetScalarType<T[P], AuditEventGroupByOutputType[P]>
        }
      >
    >


  export type AuditEventSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    actorUserId?: boolean
    action?: boolean
    resourceType?: boolean
    resourceId?: boolean
    metadata?: boolean
    ipAddress?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["auditEvent"]>

  export type AuditEventSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    actorUserId?: boolean
    action?: boolean
    resourceType?: boolean
    resourceId?: boolean
    metadata?: boolean
    ipAddress?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["auditEvent"]>

  export type AuditEventSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    actorUserId?: boolean
    action?: boolean
    resourceType?: boolean
    resourceId?: boolean
    metadata?: boolean
    ipAddress?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["auditEvent"]>

  export type AuditEventSelectScalar = {
    id?: boolean
    tenantId?: boolean
    actorUserId?: boolean
    action?: boolean
    resourceType?: boolean
    resourceId?: boolean
    metadata?: boolean
    ipAddress?: boolean
    createdAt?: boolean
  }

  export type AuditEventOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "actorUserId" | "action" | "resourceType" | "resourceId" | "metadata" | "ipAddress" | "createdAt", ExtArgs["result"]["auditEvent"]>

  export type $AuditEventPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AuditEvent"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string | null
      actorUserId: string | null
      action: string
      resourceType: string
      resourceId: string
      metadata: Prisma.JsonValue
      ipAddress: string | null
      createdAt: Date
    }, ExtArgs["result"]["auditEvent"]>
    composites: {}
  }

  type AuditEventGetPayload<S extends boolean | null | undefined | AuditEventDefaultArgs> = $Result.GetResult<Prisma.$AuditEventPayload, S>

  type AuditEventCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AuditEventFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AuditEventCountAggregateInputType | true
    }

  export interface AuditEventDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AuditEvent'], meta: { name: 'AuditEvent' } }
    /**
     * Find zero or one AuditEvent that matches the filter.
     * @param {AuditEventFindUniqueArgs} args - Arguments to find a AuditEvent
     * @example
     * // Get one AuditEvent
     * const auditEvent = await prisma.auditEvent.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AuditEventFindUniqueArgs>(args: SelectSubset<T, AuditEventFindUniqueArgs<ExtArgs>>): Prisma__AuditEventClient<$Result.GetResult<Prisma.$AuditEventPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AuditEvent that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AuditEventFindUniqueOrThrowArgs} args - Arguments to find a AuditEvent
     * @example
     * // Get one AuditEvent
     * const auditEvent = await prisma.auditEvent.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AuditEventFindUniqueOrThrowArgs>(args: SelectSubset<T, AuditEventFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AuditEventClient<$Result.GetResult<Prisma.$AuditEventPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AuditEvent that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditEventFindFirstArgs} args - Arguments to find a AuditEvent
     * @example
     * // Get one AuditEvent
     * const auditEvent = await prisma.auditEvent.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AuditEventFindFirstArgs>(args?: SelectSubset<T, AuditEventFindFirstArgs<ExtArgs>>): Prisma__AuditEventClient<$Result.GetResult<Prisma.$AuditEventPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AuditEvent that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditEventFindFirstOrThrowArgs} args - Arguments to find a AuditEvent
     * @example
     * // Get one AuditEvent
     * const auditEvent = await prisma.auditEvent.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AuditEventFindFirstOrThrowArgs>(args?: SelectSubset<T, AuditEventFindFirstOrThrowArgs<ExtArgs>>): Prisma__AuditEventClient<$Result.GetResult<Prisma.$AuditEventPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AuditEvents that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditEventFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AuditEvents
     * const auditEvents = await prisma.auditEvent.findMany()
     * 
     * // Get first 10 AuditEvents
     * const auditEvents = await prisma.auditEvent.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const auditEventWithIdOnly = await prisma.auditEvent.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AuditEventFindManyArgs>(args?: SelectSubset<T, AuditEventFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuditEventPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AuditEvent.
     * @param {AuditEventCreateArgs} args - Arguments to create a AuditEvent.
     * @example
     * // Create one AuditEvent
     * const AuditEvent = await prisma.auditEvent.create({
     *   data: {
     *     // ... data to create a AuditEvent
     *   }
     * })
     * 
     */
    create<T extends AuditEventCreateArgs>(args: SelectSubset<T, AuditEventCreateArgs<ExtArgs>>): Prisma__AuditEventClient<$Result.GetResult<Prisma.$AuditEventPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AuditEvents.
     * @param {AuditEventCreateManyArgs} args - Arguments to create many AuditEvents.
     * @example
     * // Create many AuditEvents
     * const auditEvent = await prisma.auditEvent.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AuditEventCreateManyArgs>(args?: SelectSubset<T, AuditEventCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AuditEvents and returns the data saved in the database.
     * @param {AuditEventCreateManyAndReturnArgs} args - Arguments to create many AuditEvents.
     * @example
     * // Create many AuditEvents
     * const auditEvent = await prisma.auditEvent.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AuditEvents and only return the `id`
     * const auditEventWithIdOnly = await prisma.auditEvent.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AuditEventCreateManyAndReturnArgs>(args?: SelectSubset<T, AuditEventCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuditEventPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a AuditEvent.
     * @param {AuditEventDeleteArgs} args - Arguments to delete one AuditEvent.
     * @example
     * // Delete one AuditEvent
     * const AuditEvent = await prisma.auditEvent.delete({
     *   where: {
     *     // ... filter to delete one AuditEvent
     *   }
     * })
     * 
     */
    delete<T extends AuditEventDeleteArgs>(args: SelectSubset<T, AuditEventDeleteArgs<ExtArgs>>): Prisma__AuditEventClient<$Result.GetResult<Prisma.$AuditEventPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AuditEvent.
     * @param {AuditEventUpdateArgs} args - Arguments to update one AuditEvent.
     * @example
     * // Update one AuditEvent
     * const auditEvent = await prisma.auditEvent.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AuditEventUpdateArgs>(args: SelectSubset<T, AuditEventUpdateArgs<ExtArgs>>): Prisma__AuditEventClient<$Result.GetResult<Prisma.$AuditEventPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AuditEvents.
     * @param {AuditEventDeleteManyArgs} args - Arguments to filter AuditEvents to delete.
     * @example
     * // Delete a few AuditEvents
     * const { count } = await prisma.auditEvent.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AuditEventDeleteManyArgs>(args?: SelectSubset<T, AuditEventDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AuditEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditEventUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AuditEvents
     * const auditEvent = await prisma.auditEvent.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AuditEventUpdateManyArgs>(args: SelectSubset<T, AuditEventUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AuditEvents and returns the data updated in the database.
     * @param {AuditEventUpdateManyAndReturnArgs} args - Arguments to update many AuditEvents.
     * @example
     * // Update many AuditEvents
     * const auditEvent = await prisma.auditEvent.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more AuditEvents and only return the `id`
     * const auditEventWithIdOnly = await prisma.auditEvent.updateManyAndReturn({
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
    updateManyAndReturn<T extends AuditEventUpdateManyAndReturnArgs>(args: SelectSubset<T, AuditEventUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuditEventPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one AuditEvent.
     * @param {AuditEventUpsertArgs} args - Arguments to update or create a AuditEvent.
     * @example
     * // Update or create a AuditEvent
     * const auditEvent = await prisma.auditEvent.upsert({
     *   create: {
     *     // ... data to create a AuditEvent
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AuditEvent we want to update
     *   }
     * })
     */
    upsert<T extends AuditEventUpsertArgs>(args: SelectSubset<T, AuditEventUpsertArgs<ExtArgs>>): Prisma__AuditEventClient<$Result.GetResult<Prisma.$AuditEventPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of AuditEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditEventCountArgs} args - Arguments to filter AuditEvents to count.
     * @example
     * // Count the number of AuditEvents
     * const count = await prisma.auditEvent.count({
     *   where: {
     *     // ... the filter for the AuditEvents we want to count
     *   }
     * })
    **/
    count<T extends AuditEventCountArgs>(
      args?: Subset<T, AuditEventCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AuditEventCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AuditEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditEventAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends AuditEventAggregateArgs>(args: Subset<T, AuditEventAggregateArgs>): Prisma.PrismaPromise<GetAuditEventAggregateType<T>>

    /**
     * Group by AuditEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditEventGroupByArgs} args - Group by arguments.
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
      T extends AuditEventGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AuditEventGroupByArgs['orderBy'] }
        : { orderBy?: AuditEventGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, AuditEventGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAuditEventGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AuditEvent model
   */
  readonly fields: AuditEventFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AuditEvent.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AuditEventClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the AuditEvent model
   */
  interface AuditEventFieldRefs {
    readonly id: FieldRef<"AuditEvent", 'String'>
    readonly tenantId: FieldRef<"AuditEvent", 'String'>
    readonly actorUserId: FieldRef<"AuditEvent", 'String'>
    readonly action: FieldRef<"AuditEvent", 'String'>
    readonly resourceType: FieldRef<"AuditEvent", 'String'>
    readonly resourceId: FieldRef<"AuditEvent", 'String'>
    readonly metadata: FieldRef<"AuditEvent", 'Json'>
    readonly ipAddress: FieldRef<"AuditEvent", 'String'>
    readonly createdAt: FieldRef<"AuditEvent", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AuditEvent findUnique
   */
  export type AuditEventFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditEvent
     */
    select?: AuditEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditEvent
     */
    omit?: AuditEventOmit<ExtArgs> | null
    /**
     * Filter, which AuditEvent to fetch.
     */
    where: AuditEventWhereUniqueInput
  }

  /**
   * AuditEvent findUniqueOrThrow
   */
  export type AuditEventFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditEvent
     */
    select?: AuditEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditEvent
     */
    omit?: AuditEventOmit<ExtArgs> | null
    /**
     * Filter, which AuditEvent to fetch.
     */
    where: AuditEventWhereUniqueInput
  }

  /**
   * AuditEvent findFirst
   */
  export type AuditEventFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditEvent
     */
    select?: AuditEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditEvent
     */
    omit?: AuditEventOmit<ExtArgs> | null
    /**
     * Filter, which AuditEvent to fetch.
     */
    where?: AuditEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditEvents to fetch.
     */
    orderBy?: AuditEventOrderByWithRelationInput | AuditEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AuditEvents.
     */
    cursor?: AuditEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AuditEvents.
     */
    distinct?: AuditEventScalarFieldEnum | AuditEventScalarFieldEnum[]
  }

  /**
   * AuditEvent findFirstOrThrow
   */
  export type AuditEventFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditEvent
     */
    select?: AuditEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditEvent
     */
    omit?: AuditEventOmit<ExtArgs> | null
    /**
     * Filter, which AuditEvent to fetch.
     */
    where?: AuditEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditEvents to fetch.
     */
    orderBy?: AuditEventOrderByWithRelationInput | AuditEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AuditEvents.
     */
    cursor?: AuditEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AuditEvents.
     */
    distinct?: AuditEventScalarFieldEnum | AuditEventScalarFieldEnum[]
  }

  /**
   * AuditEvent findMany
   */
  export type AuditEventFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditEvent
     */
    select?: AuditEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditEvent
     */
    omit?: AuditEventOmit<ExtArgs> | null
    /**
     * Filter, which AuditEvents to fetch.
     */
    where?: AuditEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditEvents to fetch.
     */
    orderBy?: AuditEventOrderByWithRelationInput | AuditEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AuditEvents.
     */
    cursor?: AuditEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditEvents.
     */
    skip?: number
    distinct?: AuditEventScalarFieldEnum | AuditEventScalarFieldEnum[]
  }

  /**
   * AuditEvent create
   */
  export type AuditEventCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditEvent
     */
    select?: AuditEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditEvent
     */
    omit?: AuditEventOmit<ExtArgs> | null
    /**
     * The data needed to create a AuditEvent.
     */
    data: XOR<AuditEventCreateInput, AuditEventUncheckedCreateInput>
  }

  /**
   * AuditEvent createMany
   */
  export type AuditEventCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AuditEvents.
     */
    data: AuditEventCreateManyInput | AuditEventCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AuditEvent createManyAndReturn
   */
  export type AuditEventCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditEvent
     */
    select?: AuditEventSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AuditEvent
     */
    omit?: AuditEventOmit<ExtArgs> | null
    /**
     * The data used to create many AuditEvents.
     */
    data: AuditEventCreateManyInput | AuditEventCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AuditEvent update
   */
  export type AuditEventUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditEvent
     */
    select?: AuditEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditEvent
     */
    omit?: AuditEventOmit<ExtArgs> | null
    /**
     * The data needed to update a AuditEvent.
     */
    data: XOR<AuditEventUpdateInput, AuditEventUncheckedUpdateInput>
    /**
     * Choose, which AuditEvent to update.
     */
    where: AuditEventWhereUniqueInput
  }

  /**
   * AuditEvent updateMany
   */
  export type AuditEventUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AuditEvents.
     */
    data: XOR<AuditEventUpdateManyMutationInput, AuditEventUncheckedUpdateManyInput>
    /**
     * Filter which AuditEvents to update
     */
    where?: AuditEventWhereInput
    /**
     * Limit how many AuditEvents to update.
     */
    limit?: number
  }

  /**
   * AuditEvent updateManyAndReturn
   */
  export type AuditEventUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditEvent
     */
    select?: AuditEventSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AuditEvent
     */
    omit?: AuditEventOmit<ExtArgs> | null
    /**
     * The data used to update AuditEvents.
     */
    data: XOR<AuditEventUpdateManyMutationInput, AuditEventUncheckedUpdateManyInput>
    /**
     * Filter which AuditEvents to update
     */
    where?: AuditEventWhereInput
    /**
     * Limit how many AuditEvents to update.
     */
    limit?: number
  }

  /**
   * AuditEvent upsert
   */
  export type AuditEventUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditEvent
     */
    select?: AuditEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditEvent
     */
    omit?: AuditEventOmit<ExtArgs> | null
    /**
     * The filter to search for the AuditEvent to update in case it exists.
     */
    where: AuditEventWhereUniqueInput
    /**
     * In case the AuditEvent found by the `where` argument doesn't exist, create a new AuditEvent with this data.
     */
    create: XOR<AuditEventCreateInput, AuditEventUncheckedCreateInput>
    /**
     * In case the AuditEvent was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AuditEventUpdateInput, AuditEventUncheckedUpdateInput>
  }

  /**
   * AuditEvent delete
   */
  export type AuditEventDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditEvent
     */
    select?: AuditEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditEvent
     */
    omit?: AuditEventOmit<ExtArgs> | null
    /**
     * Filter which AuditEvent to delete.
     */
    where: AuditEventWhereUniqueInput
  }

  /**
   * AuditEvent deleteMany
   */
  export type AuditEventDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AuditEvents to delete
     */
    where?: AuditEventWhereInput
    /**
     * Limit how many AuditEvents to delete.
     */
    limit?: number
  }

  /**
   * AuditEvent without action
   */
  export type AuditEventDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditEvent
     */
    select?: AuditEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditEvent
     */
    omit?: AuditEventOmit<ExtArgs> | null
  }


  /**
   * Model TenantSso
   */

  export type AggregateTenantSso = {
    _count: TenantSsoCountAggregateOutputType | null
    _min: TenantSsoMinAggregateOutputType | null
    _max: TenantSsoMaxAggregateOutputType | null
  }

  export type TenantSsoMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    protocol: $Enums.SsoProtocol | null
    status: $Enums.SsoStatus | null
    samlEntryPoint: string | null
    samlIssuer: string | null
    samlCertificate: string | null
    oidcIssuerUrl: string | null
    oidcClientId: string | null
    oidcClientSecret: string | null
    attrEmail: string | null
    attrFirstName: string | null
    attrLastName: string | null
    attrGroups: string | null
    defaultRole: $Enums.UserRole | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TenantSsoMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    protocol: $Enums.SsoProtocol | null
    status: $Enums.SsoStatus | null
    samlEntryPoint: string | null
    samlIssuer: string | null
    samlCertificate: string | null
    oidcIssuerUrl: string | null
    oidcClientId: string | null
    oidcClientSecret: string | null
    attrEmail: string | null
    attrFirstName: string | null
    attrLastName: string | null
    attrGroups: string | null
    defaultRole: $Enums.UserRole | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TenantSsoCountAggregateOutputType = {
    id: number
    tenantId: number
    protocol: number
    status: number
    samlEntryPoint: number
    samlIssuer: number
    samlCertificate: number
    oidcIssuerUrl: number
    oidcClientId: number
    oidcClientSecret: number
    emailDomains: number
    attrEmail: number
    attrFirstName: number
    attrLastName: number
    attrGroups: number
    roleMap: number
    defaultRole: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type TenantSsoMinAggregateInputType = {
    id?: true
    tenantId?: true
    protocol?: true
    status?: true
    samlEntryPoint?: true
    samlIssuer?: true
    samlCertificate?: true
    oidcIssuerUrl?: true
    oidcClientId?: true
    oidcClientSecret?: true
    attrEmail?: true
    attrFirstName?: true
    attrLastName?: true
    attrGroups?: true
    defaultRole?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TenantSsoMaxAggregateInputType = {
    id?: true
    tenantId?: true
    protocol?: true
    status?: true
    samlEntryPoint?: true
    samlIssuer?: true
    samlCertificate?: true
    oidcIssuerUrl?: true
    oidcClientId?: true
    oidcClientSecret?: true
    attrEmail?: true
    attrFirstName?: true
    attrLastName?: true
    attrGroups?: true
    defaultRole?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TenantSsoCountAggregateInputType = {
    id?: true
    tenantId?: true
    protocol?: true
    status?: true
    samlEntryPoint?: true
    samlIssuer?: true
    samlCertificate?: true
    oidcIssuerUrl?: true
    oidcClientId?: true
    oidcClientSecret?: true
    emailDomains?: true
    attrEmail?: true
    attrFirstName?: true
    attrLastName?: true
    attrGroups?: true
    roleMap?: true
    defaultRole?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type TenantSsoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TenantSso to aggregate.
     */
    where?: TenantSsoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantSsos to fetch.
     */
    orderBy?: TenantSsoOrderByWithRelationInput | TenantSsoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TenantSsoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantSsos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantSsos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TenantSsos
    **/
    _count?: true | TenantSsoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TenantSsoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TenantSsoMaxAggregateInputType
  }

  export type GetTenantSsoAggregateType<T extends TenantSsoAggregateArgs> = {
        [P in keyof T & keyof AggregateTenantSso]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTenantSso[P]>
      : GetScalarType<T[P], AggregateTenantSso[P]>
  }




  export type TenantSsoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TenantSsoWhereInput
    orderBy?: TenantSsoOrderByWithAggregationInput | TenantSsoOrderByWithAggregationInput[]
    by: TenantSsoScalarFieldEnum[] | TenantSsoScalarFieldEnum
    having?: TenantSsoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TenantSsoCountAggregateInputType | true
    _min?: TenantSsoMinAggregateInputType
    _max?: TenantSsoMaxAggregateInputType
  }

  export type TenantSsoGroupByOutputType = {
    id: string
    tenantId: string
    protocol: $Enums.SsoProtocol
    status: $Enums.SsoStatus
    samlEntryPoint: string | null
    samlIssuer: string | null
    samlCertificate: string | null
    oidcIssuerUrl: string | null
    oidcClientId: string | null
    oidcClientSecret: string | null
    emailDomains: string[]
    attrEmail: string
    attrFirstName: string
    attrLastName: string
    attrGroups: string
    roleMap: JsonValue
    defaultRole: $Enums.UserRole
    createdAt: Date
    updatedAt: Date
    _count: TenantSsoCountAggregateOutputType | null
    _min: TenantSsoMinAggregateOutputType | null
    _max: TenantSsoMaxAggregateOutputType | null
  }

  type GetTenantSsoGroupByPayload<T extends TenantSsoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TenantSsoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TenantSsoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TenantSsoGroupByOutputType[P]>
            : GetScalarType<T[P], TenantSsoGroupByOutputType[P]>
        }
      >
    >


  export type TenantSsoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    protocol?: boolean
    status?: boolean
    samlEntryPoint?: boolean
    samlIssuer?: boolean
    samlCertificate?: boolean
    oidcIssuerUrl?: boolean
    oidcClientId?: boolean
    oidcClientSecret?: boolean
    emailDomains?: boolean
    attrEmail?: boolean
    attrFirstName?: boolean
    attrLastName?: boolean
    attrGroups?: boolean
    roleMap?: boolean
    defaultRole?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["tenantSso"]>

  export type TenantSsoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    protocol?: boolean
    status?: boolean
    samlEntryPoint?: boolean
    samlIssuer?: boolean
    samlCertificate?: boolean
    oidcIssuerUrl?: boolean
    oidcClientId?: boolean
    oidcClientSecret?: boolean
    emailDomains?: boolean
    attrEmail?: boolean
    attrFirstName?: boolean
    attrLastName?: boolean
    attrGroups?: boolean
    roleMap?: boolean
    defaultRole?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["tenantSso"]>

  export type TenantSsoSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    protocol?: boolean
    status?: boolean
    samlEntryPoint?: boolean
    samlIssuer?: boolean
    samlCertificate?: boolean
    oidcIssuerUrl?: boolean
    oidcClientId?: boolean
    oidcClientSecret?: boolean
    emailDomains?: boolean
    attrEmail?: boolean
    attrFirstName?: boolean
    attrLastName?: boolean
    attrGroups?: boolean
    roleMap?: boolean
    defaultRole?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["tenantSso"]>

  export type TenantSsoSelectScalar = {
    id?: boolean
    tenantId?: boolean
    protocol?: boolean
    status?: boolean
    samlEntryPoint?: boolean
    samlIssuer?: boolean
    samlCertificate?: boolean
    oidcIssuerUrl?: boolean
    oidcClientId?: boolean
    oidcClientSecret?: boolean
    emailDomains?: boolean
    attrEmail?: boolean
    attrFirstName?: boolean
    attrLastName?: boolean
    attrGroups?: boolean
    roleMap?: boolean
    defaultRole?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type TenantSsoOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "protocol" | "status" | "samlEntryPoint" | "samlIssuer" | "samlCertificate" | "oidcIssuerUrl" | "oidcClientId" | "oidcClientSecret" | "emailDomains" | "attrEmail" | "attrFirstName" | "attrLastName" | "attrGroups" | "roleMap" | "defaultRole" | "createdAt" | "updatedAt", ExtArgs["result"]["tenantSso"]>

  export type $TenantSsoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TenantSso"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      protocol: $Enums.SsoProtocol
      status: $Enums.SsoStatus
      samlEntryPoint: string | null
      samlIssuer: string | null
      samlCertificate: string | null
      oidcIssuerUrl: string | null
      oidcClientId: string | null
      oidcClientSecret: string | null
      emailDomains: string[]
      attrEmail: string
      attrFirstName: string
      attrLastName: string
      attrGroups: string
      roleMap: Prisma.JsonValue
      defaultRole: $Enums.UserRole
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["tenantSso"]>
    composites: {}
  }

  type TenantSsoGetPayload<S extends boolean | null | undefined | TenantSsoDefaultArgs> = $Result.GetResult<Prisma.$TenantSsoPayload, S>

  type TenantSsoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TenantSsoFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TenantSsoCountAggregateInputType | true
    }

  export interface TenantSsoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TenantSso'], meta: { name: 'TenantSso' } }
    /**
     * Find zero or one TenantSso that matches the filter.
     * @param {TenantSsoFindUniqueArgs} args - Arguments to find a TenantSso
     * @example
     * // Get one TenantSso
     * const tenantSso = await prisma.tenantSso.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TenantSsoFindUniqueArgs>(args: SelectSubset<T, TenantSsoFindUniqueArgs<ExtArgs>>): Prisma__TenantSsoClient<$Result.GetResult<Prisma.$TenantSsoPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one TenantSso that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TenantSsoFindUniqueOrThrowArgs} args - Arguments to find a TenantSso
     * @example
     * // Get one TenantSso
     * const tenantSso = await prisma.tenantSso.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TenantSsoFindUniqueOrThrowArgs>(args: SelectSubset<T, TenantSsoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TenantSsoClient<$Result.GetResult<Prisma.$TenantSsoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TenantSso that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantSsoFindFirstArgs} args - Arguments to find a TenantSso
     * @example
     * // Get one TenantSso
     * const tenantSso = await prisma.tenantSso.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TenantSsoFindFirstArgs>(args?: SelectSubset<T, TenantSsoFindFirstArgs<ExtArgs>>): Prisma__TenantSsoClient<$Result.GetResult<Prisma.$TenantSsoPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TenantSso that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantSsoFindFirstOrThrowArgs} args - Arguments to find a TenantSso
     * @example
     * // Get one TenantSso
     * const tenantSso = await prisma.tenantSso.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TenantSsoFindFirstOrThrowArgs>(args?: SelectSubset<T, TenantSsoFindFirstOrThrowArgs<ExtArgs>>): Prisma__TenantSsoClient<$Result.GetResult<Prisma.$TenantSsoPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more TenantSsos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantSsoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TenantSsos
     * const tenantSsos = await prisma.tenantSso.findMany()
     * 
     * // Get first 10 TenantSsos
     * const tenantSsos = await prisma.tenantSso.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tenantSsoWithIdOnly = await prisma.tenantSso.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TenantSsoFindManyArgs>(args?: SelectSubset<T, TenantSsoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantSsoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a TenantSso.
     * @param {TenantSsoCreateArgs} args - Arguments to create a TenantSso.
     * @example
     * // Create one TenantSso
     * const TenantSso = await prisma.tenantSso.create({
     *   data: {
     *     // ... data to create a TenantSso
     *   }
     * })
     * 
     */
    create<T extends TenantSsoCreateArgs>(args: SelectSubset<T, TenantSsoCreateArgs<ExtArgs>>): Prisma__TenantSsoClient<$Result.GetResult<Prisma.$TenantSsoPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many TenantSsos.
     * @param {TenantSsoCreateManyArgs} args - Arguments to create many TenantSsos.
     * @example
     * // Create many TenantSsos
     * const tenantSso = await prisma.tenantSso.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TenantSsoCreateManyArgs>(args?: SelectSubset<T, TenantSsoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TenantSsos and returns the data saved in the database.
     * @param {TenantSsoCreateManyAndReturnArgs} args - Arguments to create many TenantSsos.
     * @example
     * // Create many TenantSsos
     * const tenantSso = await prisma.tenantSso.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TenantSsos and only return the `id`
     * const tenantSsoWithIdOnly = await prisma.tenantSso.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TenantSsoCreateManyAndReturnArgs>(args?: SelectSubset<T, TenantSsoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantSsoPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a TenantSso.
     * @param {TenantSsoDeleteArgs} args - Arguments to delete one TenantSso.
     * @example
     * // Delete one TenantSso
     * const TenantSso = await prisma.tenantSso.delete({
     *   where: {
     *     // ... filter to delete one TenantSso
     *   }
     * })
     * 
     */
    delete<T extends TenantSsoDeleteArgs>(args: SelectSubset<T, TenantSsoDeleteArgs<ExtArgs>>): Prisma__TenantSsoClient<$Result.GetResult<Prisma.$TenantSsoPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one TenantSso.
     * @param {TenantSsoUpdateArgs} args - Arguments to update one TenantSso.
     * @example
     * // Update one TenantSso
     * const tenantSso = await prisma.tenantSso.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TenantSsoUpdateArgs>(args: SelectSubset<T, TenantSsoUpdateArgs<ExtArgs>>): Prisma__TenantSsoClient<$Result.GetResult<Prisma.$TenantSsoPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more TenantSsos.
     * @param {TenantSsoDeleteManyArgs} args - Arguments to filter TenantSsos to delete.
     * @example
     * // Delete a few TenantSsos
     * const { count } = await prisma.tenantSso.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TenantSsoDeleteManyArgs>(args?: SelectSubset<T, TenantSsoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TenantSsos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantSsoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TenantSsos
     * const tenantSso = await prisma.tenantSso.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TenantSsoUpdateManyArgs>(args: SelectSubset<T, TenantSsoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TenantSsos and returns the data updated in the database.
     * @param {TenantSsoUpdateManyAndReturnArgs} args - Arguments to update many TenantSsos.
     * @example
     * // Update many TenantSsos
     * const tenantSso = await prisma.tenantSso.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more TenantSsos and only return the `id`
     * const tenantSsoWithIdOnly = await prisma.tenantSso.updateManyAndReturn({
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
    updateManyAndReturn<T extends TenantSsoUpdateManyAndReturnArgs>(args: SelectSubset<T, TenantSsoUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantSsoPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one TenantSso.
     * @param {TenantSsoUpsertArgs} args - Arguments to update or create a TenantSso.
     * @example
     * // Update or create a TenantSso
     * const tenantSso = await prisma.tenantSso.upsert({
     *   create: {
     *     // ... data to create a TenantSso
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TenantSso we want to update
     *   }
     * })
     */
    upsert<T extends TenantSsoUpsertArgs>(args: SelectSubset<T, TenantSsoUpsertArgs<ExtArgs>>): Prisma__TenantSsoClient<$Result.GetResult<Prisma.$TenantSsoPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of TenantSsos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantSsoCountArgs} args - Arguments to filter TenantSsos to count.
     * @example
     * // Count the number of TenantSsos
     * const count = await prisma.tenantSso.count({
     *   where: {
     *     // ... the filter for the TenantSsos we want to count
     *   }
     * })
    **/
    count<T extends TenantSsoCountArgs>(
      args?: Subset<T, TenantSsoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TenantSsoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TenantSso.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantSsoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends TenantSsoAggregateArgs>(args: Subset<T, TenantSsoAggregateArgs>): Prisma.PrismaPromise<GetTenantSsoAggregateType<T>>

    /**
     * Group by TenantSso.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantSsoGroupByArgs} args - Group by arguments.
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
      T extends TenantSsoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TenantSsoGroupByArgs['orderBy'] }
        : { orderBy?: TenantSsoGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, TenantSsoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTenantSsoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TenantSso model
   */
  readonly fields: TenantSsoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TenantSso.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TenantSsoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the TenantSso model
   */
  interface TenantSsoFieldRefs {
    readonly id: FieldRef<"TenantSso", 'String'>
    readonly tenantId: FieldRef<"TenantSso", 'String'>
    readonly protocol: FieldRef<"TenantSso", 'SsoProtocol'>
    readonly status: FieldRef<"TenantSso", 'SsoStatus'>
    readonly samlEntryPoint: FieldRef<"TenantSso", 'String'>
    readonly samlIssuer: FieldRef<"TenantSso", 'String'>
    readonly samlCertificate: FieldRef<"TenantSso", 'String'>
    readonly oidcIssuerUrl: FieldRef<"TenantSso", 'String'>
    readonly oidcClientId: FieldRef<"TenantSso", 'String'>
    readonly oidcClientSecret: FieldRef<"TenantSso", 'String'>
    readonly emailDomains: FieldRef<"TenantSso", 'String[]'>
    readonly attrEmail: FieldRef<"TenantSso", 'String'>
    readonly attrFirstName: FieldRef<"TenantSso", 'String'>
    readonly attrLastName: FieldRef<"TenantSso", 'String'>
    readonly attrGroups: FieldRef<"TenantSso", 'String'>
    readonly roleMap: FieldRef<"TenantSso", 'Json'>
    readonly defaultRole: FieldRef<"TenantSso", 'UserRole'>
    readonly createdAt: FieldRef<"TenantSso", 'DateTime'>
    readonly updatedAt: FieldRef<"TenantSso", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * TenantSso findUnique
   */
  export type TenantSsoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantSso
     */
    select?: TenantSsoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantSso
     */
    omit?: TenantSsoOmit<ExtArgs> | null
    /**
     * Filter, which TenantSso to fetch.
     */
    where: TenantSsoWhereUniqueInput
  }

  /**
   * TenantSso findUniqueOrThrow
   */
  export type TenantSsoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantSso
     */
    select?: TenantSsoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantSso
     */
    omit?: TenantSsoOmit<ExtArgs> | null
    /**
     * Filter, which TenantSso to fetch.
     */
    where: TenantSsoWhereUniqueInput
  }

  /**
   * TenantSso findFirst
   */
  export type TenantSsoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantSso
     */
    select?: TenantSsoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantSso
     */
    omit?: TenantSsoOmit<ExtArgs> | null
    /**
     * Filter, which TenantSso to fetch.
     */
    where?: TenantSsoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantSsos to fetch.
     */
    orderBy?: TenantSsoOrderByWithRelationInput | TenantSsoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TenantSsos.
     */
    cursor?: TenantSsoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantSsos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantSsos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TenantSsos.
     */
    distinct?: TenantSsoScalarFieldEnum | TenantSsoScalarFieldEnum[]
  }

  /**
   * TenantSso findFirstOrThrow
   */
  export type TenantSsoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantSso
     */
    select?: TenantSsoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantSso
     */
    omit?: TenantSsoOmit<ExtArgs> | null
    /**
     * Filter, which TenantSso to fetch.
     */
    where?: TenantSsoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantSsos to fetch.
     */
    orderBy?: TenantSsoOrderByWithRelationInput | TenantSsoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TenantSsos.
     */
    cursor?: TenantSsoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantSsos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantSsos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TenantSsos.
     */
    distinct?: TenantSsoScalarFieldEnum | TenantSsoScalarFieldEnum[]
  }

  /**
   * TenantSso findMany
   */
  export type TenantSsoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantSso
     */
    select?: TenantSsoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantSso
     */
    omit?: TenantSsoOmit<ExtArgs> | null
    /**
     * Filter, which TenantSsos to fetch.
     */
    where?: TenantSsoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantSsos to fetch.
     */
    orderBy?: TenantSsoOrderByWithRelationInput | TenantSsoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TenantSsos.
     */
    cursor?: TenantSsoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantSsos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantSsos.
     */
    skip?: number
    distinct?: TenantSsoScalarFieldEnum | TenantSsoScalarFieldEnum[]
  }

  /**
   * TenantSso create
   */
  export type TenantSsoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantSso
     */
    select?: TenantSsoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantSso
     */
    omit?: TenantSsoOmit<ExtArgs> | null
    /**
     * The data needed to create a TenantSso.
     */
    data: XOR<TenantSsoCreateInput, TenantSsoUncheckedCreateInput>
  }

  /**
   * TenantSso createMany
   */
  export type TenantSsoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TenantSsos.
     */
    data: TenantSsoCreateManyInput | TenantSsoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TenantSso createManyAndReturn
   */
  export type TenantSsoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantSso
     */
    select?: TenantSsoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TenantSso
     */
    omit?: TenantSsoOmit<ExtArgs> | null
    /**
     * The data used to create many TenantSsos.
     */
    data: TenantSsoCreateManyInput | TenantSsoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TenantSso update
   */
  export type TenantSsoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantSso
     */
    select?: TenantSsoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantSso
     */
    omit?: TenantSsoOmit<ExtArgs> | null
    /**
     * The data needed to update a TenantSso.
     */
    data: XOR<TenantSsoUpdateInput, TenantSsoUncheckedUpdateInput>
    /**
     * Choose, which TenantSso to update.
     */
    where: TenantSsoWhereUniqueInput
  }

  /**
   * TenantSso updateMany
   */
  export type TenantSsoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TenantSsos.
     */
    data: XOR<TenantSsoUpdateManyMutationInput, TenantSsoUncheckedUpdateManyInput>
    /**
     * Filter which TenantSsos to update
     */
    where?: TenantSsoWhereInput
    /**
     * Limit how many TenantSsos to update.
     */
    limit?: number
  }

  /**
   * TenantSso updateManyAndReturn
   */
  export type TenantSsoUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantSso
     */
    select?: TenantSsoSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TenantSso
     */
    omit?: TenantSsoOmit<ExtArgs> | null
    /**
     * The data used to update TenantSsos.
     */
    data: XOR<TenantSsoUpdateManyMutationInput, TenantSsoUncheckedUpdateManyInput>
    /**
     * Filter which TenantSsos to update
     */
    where?: TenantSsoWhereInput
    /**
     * Limit how many TenantSsos to update.
     */
    limit?: number
  }

  /**
   * TenantSso upsert
   */
  export type TenantSsoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantSso
     */
    select?: TenantSsoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantSso
     */
    omit?: TenantSsoOmit<ExtArgs> | null
    /**
     * The filter to search for the TenantSso to update in case it exists.
     */
    where: TenantSsoWhereUniqueInput
    /**
     * In case the TenantSso found by the `where` argument doesn't exist, create a new TenantSso with this data.
     */
    create: XOR<TenantSsoCreateInput, TenantSsoUncheckedCreateInput>
    /**
     * In case the TenantSso was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TenantSsoUpdateInput, TenantSsoUncheckedUpdateInput>
  }

  /**
   * TenantSso delete
   */
  export type TenantSsoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantSso
     */
    select?: TenantSsoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantSso
     */
    omit?: TenantSsoOmit<ExtArgs> | null
    /**
     * Filter which TenantSso to delete.
     */
    where: TenantSsoWhereUniqueInput
  }

  /**
   * TenantSso deleteMany
   */
  export type TenantSsoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TenantSsos to delete
     */
    where?: TenantSsoWhereInput
    /**
     * Limit how many TenantSsos to delete.
     */
    limit?: number
  }

  /**
   * TenantSso without action
   */
  export type TenantSsoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantSso
     */
    select?: TenantSsoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TenantSso
     */
    omit?: TenantSsoOmit<ExtArgs> | null
  }


  /**
   * Model SsoLoginAudit
   */

  export type AggregateSsoLoginAudit = {
    _count: SsoLoginAuditCountAggregateOutputType | null
    _min: SsoLoginAuditMinAggregateOutputType | null
    _max: SsoLoginAuditMaxAggregateOutputType | null
  }

  export type SsoLoginAuditMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    email: string | null
    protocol: $Enums.SsoProtocol | null
    outcome: string | null
    ipAddress: string | null
    userAgent: string | null
    userId: string | null
    createdAt: Date | null
  }

  export type SsoLoginAuditMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    email: string | null
    protocol: $Enums.SsoProtocol | null
    outcome: string | null
    ipAddress: string | null
    userAgent: string | null
    userId: string | null
    createdAt: Date | null
  }

  export type SsoLoginAuditCountAggregateOutputType = {
    id: number
    tenantId: number
    email: number
    protocol: number
    outcome: number
    ipAddress: number
    userAgent: number
    userId: number
    createdAt: number
    _all: number
  }


  export type SsoLoginAuditMinAggregateInputType = {
    id?: true
    tenantId?: true
    email?: true
    protocol?: true
    outcome?: true
    ipAddress?: true
    userAgent?: true
    userId?: true
    createdAt?: true
  }

  export type SsoLoginAuditMaxAggregateInputType = {
    id?: true
    tenantId?: true
    email?: true
    protocol?: true
    outcome?: true
    ipAddress?: true
    userAgent?: true
    userId?: true
    createdAt?: true
  }

  export type SsoLoginAuditCountAggregateInputType = {
    id?: true
    tenantId?: true
    email?: true
    protocol?: true
    outcome?: true
    ipAddress?: true
    userAgent?: true
    userId?: true
    createdAt?: true
    _all?: true
  }

  export type SsoLoginAuditAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SsoLoginAudit to aggregate.
     */
    where?: SsoLoginAuditWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SsoLoginAudits to fetch.
     */
    orderBy?: SsoLoginAuditOrderByWithRelationInput | SsoLoginAuditOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SsoLoginAuditWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SsoLoginAudits from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SsoLoginAudits.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SsoLoginAudits
    **/
    _count?: true | SsoLoginAuditCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SsoLoginAuditMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SsoLoginAuditMaxAggregateInputType
  }

  export type GetSsoLoginAuditAggregateType<T extends SsoLoginAuditAggregateArgs> = {
        [P in keyof T & keyof AggregateSsoLoginAudit]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSsoLoginAudit[P]>
      : GetScalarType<T[P], AggregateSsoLoginAudit[P]>
  }




  export type SsoLoginAuditGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SsoLoginAuditWhereInput
    orderBy?: SsoLoginAuditOrderByWithAggregationInput | SsoLoginAuditOrderByWithAggregationInput[]
    by: SsoLoginAuditScalarFieldEnum[] | SsoLoginAuditScalarFieldEnum
    having?: SsoLoginAuditScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SsoLoginAuditCountAggregateInputType | true
    _min?: SsoLoginAuditMinAggregateInputType
    _max?: SsoLoginAuditMaxAggregateInputType
  }

  export type SsoLoginAuditGroupByOutputType = {
    id: string
    tenantId: string
    email: string
    protocol: $Enums.SsoProtocol
    outcome: string
    ipAddress: string | null
    userAgent: string | null
    userId: string | null
    createdAt: Date
    _count: SsoLoginAuditCountAggregateOutputType | null
    _min: SsoLoginAuditMinAggregateOutputType | null
    _max: SsoLoginAuditMaxAggregateOutputType | null
  }

  type GetSsoLoginAuditGroupByPayload<T extends SsoLoginAuditGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SsoLoginAuditGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SsoLoginAuditGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SsoLoginAuditGroupByOutputType[P]>
            : GetScalarType<T[P], SsoLoginAuditGroupByOutputType[P]>
        }
      >
    >


  export type SsoLoginAuditSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    email?: boolean
    protocol?: boolean
    outcome?: boolean
    ipAddress?: boolean
    userAgent?: boolean
    userId?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["ssoLoginAudit"]>

  export type SsoLoginAuditSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    email?: boolean
    protocol?: boolean
    outcome?: boolean
    ipAddress?: boolean
    userAgent?: boolean
    userId?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["ssoLoginAudit"]>

  export type SsoLoginAuditSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    email?: boolean
    protocol?: boolean
    outcome?: boolean
    ipAddress?: boolean
    userAgent?: boolean
    userId?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["ssoLoginAudit"]>

  export type SsoLoginAuditSelectScalar = {
    id?: boolean
    tenantId?: boolean
    email?: boolean
    protocol?: boolean
    outcome?: boolean
    ipAddress?: boolean
    userAgent?: boolean
    userId?: boolean
    createdAt?: boolean
  }

  export type SsoLoginAuditOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "email" | "protocol" | "outcome" | "ipAddress" | "userAgent" | "userId" | "createdAt", ExtArgs["result"]["ssoLoginAudit"]>

  export type $SsoLoginAuditPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SsoLoginAudit"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      email: string
      protocol: $Enums.SsoProtocol
      outcome: string
      ipAddress: string | null
      userAgent: string | null
      userId: string | null
      createdAt: Date
    }, ExtArgs["result"]["ssoLoginAudit"]>
    composites: {}
  }

  type SsoLoginAuditGetPayload<S extends boolean | null | undefined | SsoLoginAuditDefaultArgs> = $Result.GetResult<Prisma.$SsoLoginAuditPayload, S>

  type SsoLoginAuditCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SsoLoginAuditFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SsoLoginAuditCountAggregateInputType | true
    }

  export interface SsoLoginAuditDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SsoLoginAudit'], meta: { name: 'SsoLoginAudit' } }
    /**
     * Find zero or one SsoLoginAudit that matches the filter.
     * @param {SsoLoginAuditFindUniqueArgs} args - Arguments to find a SsoLoginAudit
     * @example
     * // Get one SsoLoginAudit
     * const ssoLoginAudit = await prisma.ssoLoginAudit.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SsoLoginAuditFindUniqueArgs>(args: SelectSubset<T, SsoLoginAuditFindUniqueArgs<ExtArgs>>): Prisma__SsoLoginAuditClient<$Result.GetResult<Prisma.$SsoLoginAuditPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one SsoLoginAudit that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SsoLoginAuditFindUniqueOrThrowArgs} args - Arguments to find a SsoLoginAudit
     * @example
     * // Get one SsoLoginAudit
     * const ssoLoginAudit = await prisma.ssoLoginAudit.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SsoLoginAuditFindUniqueOrThrowArgs>(args: SelectSubset<T, SsoLoginAuditFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SsoLoginAuditClient<$Result.GetResult<Prisma.$SsoLoginAuditPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SsoLoginAudit that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SsoLoginAuditFindFirstArgs} args - Arguments to find a SsoLoginAudit
     * @example
     * // Get one SsoLoginAudit
     * const ssoLoginAudit = await prisma.ssoLoginAudit.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SsoLoginAuditFindFirstArgs>(args?: SelectSubset<T, SsoLoginAuditFindFirstArgs<ExtArgs>>): Prisma__SsoLoginAuditClient<$Result.GetResult<Prisma.$SsoLoginAuditPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SsoLoginAudit that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SsoLoginAuditFindFirstOrThrowArgs} args - Arguments to find a SsoLoginAudit
     * @example
     * // Get one SsoLoginAudit
     * const ssoLoginAudit = await prisma.ssoLoginAudit.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SsoLoginAuditFindFirstOrThrowArgs>(args?: SelectSubset<T, SsoLoginAuditFindFirstOrThrowArgs<ExtArgs>>): Prisma__SsoLoginAuditClient<$Result.GetResult<Prisma.$SsoLoginAuditPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more SsoLoginAudits that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SsoLoginAuditFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SsoLoginAudits
     * const ssoLoginAudits = await prisma.ssoLoginAudit.findMany()
     * 
     * // Get first 10 SsoLoginAudits
     * const ssoLoginAudits = await prisma.ssoLoginAudit.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const ssoLoginAuditWithIdOnly = await prisma.ssoLoginAudit.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SsoLoginAuditFindManyArgs>(args?: SelectSubset<T, SsoLoginAuditFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SsoLoginAuditPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a SsoLoginAudit.
     * @param {SsoLoginAuditCreateArgs} args - Arguments to create a SsoLoginAudit.
     * @example
     * // Create one SsoLoginAudit
     * const SsoLoginAudit = await prisma.ssoLoginAudit.create({
     *   data: {
     *     // ... data to create a SsoLoginAudit
     *   }
     * })
     * 
     */
    create<T extends SsoLoginAuditCreateArgs>(args: SelectSubset<T, SsoLoginAuditCreateArgs<ExtArgs>>): Prisma__SsoLoginAuditClient<$Result.GetResult<Prisma.$SsoLoginAuditPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many SsoLoginAudits.
     * @param {SsoLoginAuditCreateManyArgs} args - Arguments to create many SsoLoginAudits.
     * @example
     * // Create many SsoLoginAudits
     * const ssoLoginAudit = await prisma.ssoLoginAudit.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SsoLoginAuditCreateManyArgs>(args?: SelectSubset<T, SsoLoginAuditCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many SsoLoginAudits and returns the data saved in the database.
     * @param {SsoLoginAuditCreateManyAndReturnArgs} args - Arguments to create many SsoLoginAudits.
     * @example
     * // Create many SsoLoginAudits
     * const ssoLoginAudit = await prisma.ssoLoginAudit.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many SsoLoginAudits and only return the `id`
     * const ssoLoginAuditWithIdOnly = await prisma.ssoLoginAudit.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SsoLoginAuditCreateManyAndReturnArgs>(args?: SelectSubset<T, SsoLoginAuditCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SsoLoginAuditPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a SsoLoginAudit.
     * @param {SsoLoginAuditDeleteArgs} args - Arguments to delete one SsoLoginAudit.
     * @example
     * // Delete one SsoLoginAudit
     * const SsoLoginAudit = await prisma.ssoLoginAudit.delete({
     *   where: {
     *     // ... filter to delete one SsoLoginAudit
     *   }
     * })
     * 
     */
    delete<T extends SsoLoginAuditDeleteArgs>(args: SelectSubset<T, SsoLoginAuditDeleteArgs<ExtArgs>>): Prisma__SsoLoginAuditClient<$Result.GetResult<Prisma.$SsoLoginAuditPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one SsoLoginAudit.
     * @param {SsoLoginAuditUpdateArgs} args - Arguments to update one SsoLoginAudit.
     * @example
     * // Update one SsoLoginAudit
     * const ssoLoginAudit = await prisma.ssoLoginAudit.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SsoLoginAuditUpdateArgs>(args: SelectSubset<T, SsoLoginAuditUpdateArgs<ExtArgs>>): Prisma__SsoLoginAuditClient<$Result.GetResult<Prisma.$SsoLoginAuditPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more SsoLoginAudits.
     * @param {SsoLoginAuditDeleteManyArgs} args - Arguments to filter SsoLoginAudits to delete.
     * @example
     * // Delete a few SsoLoginAudits
     * const { count } = await prisma.ssoLoginAudit.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SsoLoginAuditDeleteManyArgs>(args?: SelectSubset<T, SsoLoginAuditDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SsoLoginAudits.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SsoLoginAuditUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SsoLoginAudits
     * const ssoLoginAudit = await prisma.ssoLoginAudit.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SsoLoginAuditUpdateManyArgs>(args: SelectSubset<T, SsoLoginAuditUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SsoLoginAudits and returns the data updated in the database.
     * @param {SsoLoginAuditUpdateManyAndReturnArgs} args - Arguments to update many SsoLoginAudits.
     * @example
     * // Update many SsoLoginAudits
     * const ssoLoginAudit = await prisma.ssoLoginAudit.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more SsoLoginAudits and only return the `id`
     * const ssoLoginAuditWithIdOnly = await prisma.ssoLoginAudit.updateManyAndReturn({
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
    updateManyAndReturn<T extends SsoLoginAuditUpdateManyAndReturnArgs>(args: SelectSubset<T, SsoLoginAuditUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SsoLoginAuditPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one SsoLoginAudit.
     * @param {SsoLoginAuditUpsertArgs} args - Arguments to update or create a SsoLoginAudit.
     * @example
     * // Update or create a SsoLoginAudit
     * const ssoLoginAudit = await prisma.ssoLoginAudit.upsert({
     *   create: {
     *     // ... data to create a SsoLoginAudit
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SsoLoginAudit we want to update
     *   }
     * })
     */
    upsert<T extends SsoLoginAuditUpsertArgs>(args: SelectSubset<T, SsoLoginAuditUpsertArgs<ExtArgs>>): Prisma__SsoLoginAuditClient<$Result.GetResult<Prisma.$SsoLoginAuditPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of SsoLoginAudits.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SsoLoginAuditCountArgs} args - Arguments to filter SsoLoginAudits to count.
     * @example
     * // Count the number of SsoLoginAudits
     * const count = await prisma.ssoLoginAudit.count({
     *   where: {
     *     // ... the filter for the SsoLoginAudits we want to count
     *   }
     * })
    **/
    count<T extends SsoLoginAuditCountArgs>(
      args?: Subset<T, SsoLoginAuditCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SsoLoginAuditCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SsoLoginAudit.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SsoLoginAuditAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends SsoLoginAuditAggregateArgs>(args: Subset<T, SsoLoginAuditAggregateArgs>): Prisma.PrismaPromise<GetSsoLoginAuditAggregateType<T>>

    /**
     * Group by SsoLoginAudit.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SsoLoginAuditGroupByArgs} args - Group by arguments.
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
      T extends SsoLoginAuditGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SsoLoginAuditGroupByArgs['orderBy'] }
        : { orderBy?: SsoLoginAuditGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, SsoLoginAuditGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSsoLoginAuditGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SsoLoginAudit model
   */
  readonly fields: SsoLoginAuditFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SsoLoginAudit.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SsoLoginAuditClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the SsoLoginAudit model
   */
  interface SsoLoginAuditFieldRefs {
    readonly id: FieldRef<"SsoLoginAudit", 'String'>
    readonly tenantId: FieldRef<"SsoLoginAudit", 'String'>
    readonly email: FieldRef<"SsoLoginAudit", 'String'>
    readonly protocol: FieldRef<"SsoLoginAudit", 'SsoProtocol'>
    readonly outcome: FieldRef<"SsoLoginAudit", 'String'>
    readonly ipAddress: FieldRef<"SsoLoginAudit", 'String'>
    readonly userAgent: FieldRef<"SsoLoginAudit", 'String'>
    readonly userId: FieldRef<"SsoLoginAudit", 'String'>
    readonly createdAt: FieldRef<"SsoLoginAudit", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * SsoLoginAudit findUnique
   */
  export type SsoLoginAuditFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SsoLoginAudit
     */
    select?: SsoLoginAuditSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SsoLoginAudit
     */
    omit?: SsoLoginAuditOmit<ExtArgs> | null
    /**
     * Filter, which SsoLoginAudit to fetch.
     */
    where: SsoLoginAuditWhereUniqueInput
  }

  /**
   * SsoLoginAudit findUniqueOrThrow
   */
  export type SsoLoginAuditFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SsoLoginAudit
     */
    select?: SsoLoginAuditSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SsoLoginAudit
     */
    omit?: SsoLoginAuditOmit<ExtArgs> | null
    /**
     * Filter, which SsoLoginAudit to fetch.
     */
    where: SsoLoginAuditWhereUniqueInput
  }

  /**
   * SsoLoginAudit findFirst
   */
  export type SsoLoginAuditFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SsoLoginAudit
     */
    select?: SsoLoginAuditSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SsoLoginAudit
     */
    omit?: SsoLoginAuditOmit<ExtArgs> | null
    /**
     * Filter, which SsoLoginAudit to fetch.
     */
    where?: SsoLoginAuditWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SsoLoginAudits to fetch.
     */
    orderBy?: SsoLoginAuditOrderByWithRelationInput | SsoLoginAuditOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SsoLoginAudits.
     */
    cursor?: SsoLoginAuditWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SsoLoginAudits from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SsoLoginAudits.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SsoLoginAudits.
     */
    distinct?: SsoLoginAuditScalarFieldEnum | SsoLoginAuditScalarFieldEnum[]
  }

  /**
   * SsoLoginAudit findFirstOrThrow
   */
  export type SsoLoginAuditFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SsoLoginAudit
     */
    select?: SsoLoginAuditSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SsoLoginAudit
     */
    omit?: SsoLoginAuditOmit<ExtArgs> | null
    /**
     * Filter, which SsoLoginAudit to fetch.
     */
    where?: SsoLoginAuditWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SsoLoginAudits to fetch.
     */
    orderBy?: SsoLoginAuditOrderByWithRelationInput | SsoLoginAuditOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SsoLoginAudits.
     */
    cursor?: SsoLoginAuditWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SsoLoginAudits from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SsoLoginAudits.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SsoLoginAudits.
     */
    distinct?: SsoLoginAuditScalarFieldEnum | SsoLoginAuditScalarFieldEnum[]
  }

  /**
   * SsoLoginAudit findMany
   */
  export type SsoLoginAuditFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SsoLoginAudit
     */
    select?: SsoLoginAuditSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SsoLoginAudit
     */
    omit?: SsoLoginAuditOmit<ExtArgs> | null
    /**
     * Filter, which SsoLoginAudits to fetch.
     */
    where?: SsoLoginAuditWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SsoLoginAudits to fetch.
     */
    orderBy?: SsoLoginAuditOrderByWithRelationInput | SsoLoginAuditOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SsoLoginAudits.
     */
    cursor?: SsoLoginAuditWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SsoLoginAudits from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SsoLoginAudits.
     */
    skip?: number
    distinct?: SsoLoginAuditScalarFieldEnum | SsoLoginAuditScalarFieldEnum[]
  }

  /**
   * SsoLoginAudit create
   */
  export type SsoLoginAuditCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SsoLoginAudit
     */
    select?: SsoLoginAuditSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SsoLoginAudit
     */
    omit?: SsoLoginAuditOmit<ExtArgs> | null
    /**
     * The data needed to create a SsoLoginAudit.
     */
    data: XOR<SsoLoginAuditCreateInput, SsoLoginAuditUncheckedCreateInput>
  }

  /**
   * SsoLoginAudit createMany
   */
  export type SsoLoginAuditCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SsoLoginAudits.
     */
    data: SsoLoginAuditCreateManyInput | SsoLoginAuditCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SsoLoginAudit createManyAndReturn
   */
  export type SsoLoginAuditCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SsoLoginAudit
     */
    select?: SsoLoginAuditSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SsoLoginAudit
     */
    omit?: SsoLoginAuditOmit<ExtArgs> | null
    /**
     * The data used to create many SsoLoginAudits.
     */
    data: SsoLoginAuditCreateManyInput | SsoLoginAuditCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SsoLoginAudit update
   */
  export type SsoLoginAuditUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SsoLoginAudit
     */
    select?: SsoLoginAuditSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SsoLoginAudit
     */
    omit?: SsoLoginAuditOmit<ExtArgs> | null
    /**
     * The data needed to update a SsoLoginAudit.
     */
    data: XOR<SsoLoginAuditUpdateInput, SsoLoginAuditUncheckedUpdateInput>
    /**
     * Choose, which SsoLoginAudit to update.
     */
    where: SsoLoginAuditWhereUniqueInput
  }

  /**
   * SsoLoginAudit updateMany
   */
  export type SsoLoginAuditUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SsoLoginAudits.
     */
    data: XOR<SsoLoginAuditUpdateManyMutationInput, SsoLoginAuditUncheckedUpdateManyInput>
    /**
     * Filter which SsoLoginAudits to update
     */
    where?: SsoLoginAuditWhereInput
    /**
     * Limit how many SsoLoginAudits to update.
     */
    limit?: number
  }

  /**
   * SsoLoginAudit updateManyAndReturn
   */
  export type SsoLoginAuditUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SsoLoginAudit
     */
    select?: SsoLoginAuditSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SsoLoginAudit
     */
    omit?: SsoLoginAuditOmit<ExtArgs> | null
    /**
     * The data used to update SsoLoginAudits.
     */
    data: XOR<SsoLoginAuditUpdateManyMutationInput, SsoLoginAuditUncheckedUpdateManyInput>
    /**
     * Filter which SsoLoginAudits to update
     */
    where?: SsoLoginAuditWhereInput
    /**
     * Limit how many SsoLoginAudits to update.
     */
    limit?: number
  }

  /**
   * SsoLoginAudit upsert
   */
  export type SsoLoginAuditUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SsoLoginAudit
     */
    select?: SsoLoginAuditSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SsoLoginAudit
     */
    omit?: SsoLoginAuditOmit<ExtArgs> | null
    /**
     * The filter to search for the SsoLoginAudit to update in case it exists.
     */
    where: SsoLoginAuditWhereUniqueInput
    /**
     * In case the SsoLoginAudit found by the `where` argument doesn't exist, create a new SsoLoginAudit with this data.
     */
    create: XOR<SsoLoginAuditCreateInput, SsoLoginAuditUncheckedCreateInput>
    /**
     * In case the SsoLoginAudit was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SsoLoginAuditUpdateInput, SsoLoginAuditUncheckedUpdateInput>
  }

  /**
   * SsoLoginAudit delete
   */
  export type SsoLoginAuditDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SsoLoginAudit
     */
    select?: SsoLoginAuditSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SsoLoginAudit
     */
    omit?: SsoLoginAuditOmit<ExtArgs> | null
    /**
     * Filter which SsoLoginAudit to delete.
     */
    where: SsoLoginAuditWhereUniqueInput
  }

  /**
   * SsoLoginAudit deleteMany
   */
  export type SsoLoginAuditDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SsoLoginAudits to delete
     */
    where?: SsoLoginAuditWhereInput
    /**
     * Limit how many SsoLoginAudits to delete.
     */
    limit?: number
  }

  /**
   * SsoLoginAudit without action
   */
  export type SsoLoginAuditDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SsoLoginAudit
     */
    select?: SsoLoginAuditSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SsoLoginAudit
     */
    omit?: SsoLoginAuditOmit<ExtArgs> | null
  }


  /**
   * Model DashboardLayout
   */

  export type AggregateDashboardLayout = {
    _count: DashboardLayoutCountAggregateOutputType | null
    _avg: DashboardLayoutAvgAggregateOutputType | null
    _sum: DashboardLayoutSumAggregateOutputType | null
    _min: DashboardLayoutMinAggregateOutputType | null
    _max: DashboardLayoutMaxAggregateOutputType | null
  }

  export type DashboardLayoutAvgAggregateOutputType = {
    schemaVersion: number | null
  }

  export type DashboardLayoutSumAggregateOutputType = {
    schemaVersion: number | null
  }

  export type DashboardLayoutMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    userId: string | null
    scope: string | null
    dashboardKey: string | null
    name: string | null
    schemaVersion: number | null
    isDefault: boolean | null
    updatedBy: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type DashboardLayoutMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    userId: string | null
    scope: string | null
    dashboardKey: string | null
    name: string | null
    schemaVersion: number | null
    isDefault: boolean | null
    updatedBy: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type DashboardLayoutCountAggregateOutputType = {
    id: number
    tenantId: number
    userId: number
    scope: number
    dashboardKey: number
    name: number
    document: number
    schemaVersion: number
    isDefault: number
    updatedBy: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type DashboardLayoutAvgAggregateInputType = {
    schemaVersion?: true
  }

  export type DashboardLayoutSumAggregateInputType = {
    schemaVersion?: true
  }

  export type DashboardLayoutMinAggregateInputType = {
    id?: true
    tenantId?: true
    userId?: true
    scope?: true
    dashboardKey?: true
    name?: true
    schemaVersion?: true
    isDefault?: true
    updatedBy?: true
    createdAt?: true
    updatedAt?: true
  }

  export type DashboardLayoutMaxAggregateInputType = {
    id?: true
    tenantId?: true
    userId?: true
    scope?: true
    dashboardKey?: true
    name?: true
    schemaVersion?: true
    isDefault?: true
    updatedBy?: true
    createdAt?: true
    updatedAt?: true
  }

  export type DashboardLayoutCountAggregateInputType = {
    id?: true
    tenantId?: true
    userId?: true
    scope?: true
    dashboardKey?: true
    name?: true
    document?: true
    schemaVersion?: true
    isDefault?: true
    updatedBy?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type DashboardLayoutAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DashboardLayout to aggregate.
     */
    where?: DashboardLayoutWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DashboardLayouts to fetch.
     */
    orderBy?: DashboardLayoutOrderByWithRelationInput | DashboardLayoutOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DashboardLayoutWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DashboardLayouts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DashboardLayouts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned DashboardLayouts
    **/
    _count?: true | DashboardLayoutCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: DashboardLayoutAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: DashboardLayoutSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DashboardLayoutMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DashboardLayoutMaxAggregateInputType
  }

  export type GetDashboardLayoutAggregateType<T extends DashboardLayoutAggregateArgs> = {
        [P in keyof T & keyof AggregateDashboardLayout]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDashboardLayout[P]>
      : GetScalarType<T[P], AggregateDashboardLayout[P]>
  }




  export type DashboardLayoutGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DashboardLayoutWhereInput
    orderBy?: DashboardLayoutOrderByWithAggregationInput | DashboardLayoutOrderByWithAggregationInput[]
    by: DashboardLayoutScalarFieldEnum[] | DashboardLayoutScalarFieldEnum
    having?: DashboardLayoutScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DashboardLayoutCountAggregateInputType | true
    _avg?: DashboardLayoutAvgAggregateInputType
    _sum?: DashboardLayoutSumAggregateInputType
    _min?: DashboardLayoutMinAggregateInputType
    _max?: DashboardLayoutMaxAggregateInputType
  }

  export type DashboardLayoutGroupByOutputType = {
    id: string
    tenantId: string
    userId: string | null
    scope: string
    dashboardKey: string
    name: string
    document: JsonValue
    schemaVersion: number
    isDefault: boolean
    updatedBy: string
    createdAt: Date
    updatedAt: Date
    _count: DashboardLayoutCountAggregateOutputType | null
    _avg: DashboardLayoutAvgAggregateOutputType | null
    _sum: DashboardLayoutSumAggregateOutputType | null
    _min: DashboardLayoutMinAggregateOutputType | null
    _max: DashboardLayoutMaxAggregateOutputType | null
  }

  type GetDashboardLayoutGroupByPayload<T extends DashboardLayoutGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DashboardLayoutGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DashboardLayoutGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DashboardLayoutGroupByOutputType[P]>
            : GetScalarType<T[P], DashboardLayoutGroupByOutputType[P]>
        }
      >
    >


  export type DashboardLayoutSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    userId?: boolean
    scope?: boolean
    dashboardKey?: boolean
    name?: boolean
    document?: boolean
    schemaVersion?: boolean
    isDefault?: boolean
    updatedBy?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["dashboardLayout"]>

  export type DashboardLayoutSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    userId?: boolean
    scope?: boolean
    dashboardKey?: boolean
    name?: boolean
    document?: boolean
    schemaVersion?: boolean
    isDefault?: boolean
    updatedBy?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["dashboardLayout"]>

  export type DashboardLayoutSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    userId?: boolean
    scope?: boolean
    dashboardKey?: boolean
    name?: boolean
    document?: boolean
    schemaVersion?: boolean
    isDefault?: boolean
    updatedBy?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["dashboardLayout"]>

  export type DashboardLayoutSelectScalar = {
    id?: boolean
    tenantId?: boolean
    userId?: boolean
    scope?: boolean
    dashboardKey?: boolean
    name?: boolean
    document?: boolean
    schemaVersion?: boolean
    isDefault?: boolean
    updatedBy?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type DashboardLayoutOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "userId" | "scope" | "dashboardKey" | "name" | "document" | "schemaVersion" | "isDefault" | "updatedBy" | "createdAt" | "updatedAt", ExtArgs["result"]["dashboardLayout"]>

  export type $DashboardLayoutPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "DashboardLayout"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      userId: string | null
      scope: string
      dashboardKey: string
      name: string
      document: Prisma.JsonValue
      schemaVersion: number
      isDefault: boolean
      updatedBy: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["dashboardLayout"]>
    composites: {}
  }

  type DashboardLayoutGetPayload<S extends boolean | null | undefined | DashboardLayoutDefaultArgs> = $Result.GetResult<Prisma.$DashboardLayoutPayload, S>

  type DashboardLayoutCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DashboardLayoutFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DashboardLayoutCountAggregateInputType | true
    }

  export interface DashboardLayoutDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['DashboardLayout'], meta: { name: 'DashboardLayout' } }
    /**
     * Find zero or one DashboardLayout that matches the filter.
     * @param {DashboardLayoutFindUniqueArgs} args - Arguments to find a DashboardLayout
     * @example
     * // Get one DashboardLayout
     * const dashboardLayout = await prisma.dashboardLayout.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DashboardLayoutFindUniqueArgs>(args: SelectSubset<T, DashboardLayoutFindUniqueArgs<ExtArgs>>): Prisma__DashboardLayoutClient<$Result.GetResult<Prisma.$DashboardLayoutPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one DashboardLayout that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DashboardLayoutFindUniqueOrThrowArgs} args - Arguments to find a DashboardLayout
     * @example
     * // Get one DashboardLayout
     * const dashboardLayout = await prisma.dashboardLayout.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DashboardLayoutFindUniqueOrThrowArgs>(args: SelectSubset<T, DashboardLayoutFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DashboardLayoutClient<$Result.GetResult<Prisma.$DashboardLayoutPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DashboardLayout that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DashboardLayoutFindFirstArgs} args - Arguments to find a DashboardLayout
     * @example
     * // Get one DashboardLayout
     * const dashboardLayout = await prisma.dashboardLayout.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DashboardLayoutFindFirstArgs>(args?: SelectSubset<T, DashboardLayoutFindFirstArgs<ExtArgs>>): Prisma__DashboardLayoutClient<$Result.GetResult<Prisma.$DashboardLayoutPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DashboardLayout that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DashboardLayoutFindFirstOrThrowArgs} args - Arguments to find a DashboardLayout
     * @example
     * // Get one DashboardLayout
     * const dashboardLayout = await prisma.dashboardLayout.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DashboardLayoutFindFirstOrThrowArgs>(args?: SelectSubset<T, DashboardLayoutFindFirstOrThrowArgs<ExtArgs>>): Prisma__DashboardLayoutClient<$Result.GetResult<Prisma.$DashboardLayoutPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more DashboardLayouts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DashboardLayoutFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DashboardLayouts
     * const dashboardLayouts = await prisma.dashboardLayout.findMany()
     * 
     * // Get first 10 DashboardLayouts
     * const dashboardLayouts = await prisma.dashboardLayout.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const dashboardLayoutWithIdOnly = await prisma.dashboardLayout.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DashboardLayoutFindManyArgs>(args?: SelectSubset<T, DashboardLayoutFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DashboardLayoutPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a DashboardLayout.
     * @param {DashboardLayoutCreateArgs} args - Arguments to create a DashboardLayout.
     * @example
     * // Create one DashboardLayout
     * const DashboardLayout = await prisma.dashboardLayout.create({
     *   data: {
     *     // ... data to create a DashboardLayout
     *   }
     * })
     * 
     */
    create<T extends DashboardLayoutCreateArgs>(args: SelectSubset<T, DashboardLayoutCreateArgs<ExtArgs>>): Prisma__DashboardLayoutClient<$Result.GetResult<Prisma.$DashboardLayoutPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many DashboardLayouts.
     * @param {DashboardLayoutCreateManyArgs} args - Arguments to create many DashboardLayouts.
     * @example
     * // Create many DashboardLayouts
     * const dashboardLayout = await prisma.dashboardLayout.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DashboardLayoutCreateManyArgs>(args?: SelectSubset<T, DashboardLayoutCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many DashboardLayouts and returns the data saved in the database.
     * @param {DashboardLayoutCreateManyAndReturnArgs} args - Arguments to create many DashboardLayouts.
     * @example
     * // Create many DashboardLayouts
     * const dashboardLayout = await prisma.dashboardLayout.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many DashboardLayouts and only return the `id`
     * const dashboardLayoutWithIdOnly = await prisma.dashboardLayout.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DashboardLayoutCreateManyAndReturnArgs>(args?: SelectSubset<T, DashboardLayoutCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DashboardLayoutPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a DashboardLayout.
     * @param {DashboardLayoutDeleteArgs} args - Arguments to delete one DashboardLayout.
     * @example
     * // Delete one DashboardLayout
     * const DashboardLayout = await prisma.dashboardLayout.delete({
     *   where: {
     *     // ... filter to delete one DashboardLayout
     *   }
     * })
     * 
     */
    delete<T extends DashboardLayoutDeleteArgs>(args: SelectSubset<T, DashboardLayoutDeleteArgs<ExtArgs>>): Prisma__DashboardLayoutClient<$Result.GetResult<Prisma.$DashboardLayoutPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one DashboardLayout.
     * @param {DashboardLayoutUpdateArgs} args - Arguments to update one DashboardLayout.
     * @example
     * // Update one DashboardLayout
     * const dashboardLayout = await prisma.dashboardLayout.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DashboardLayoutUpdateArgs>(args: SelectSubset<T, DashboardLayoutUpdateArgs<ExtArgs>>): Prisma__DashboardLayoutClient<$Result.GetResult<Prisma.$DashboardLayoutPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more DashboardLayouts.
     * @param {DashboardLayoutDeleteManyArgs} args - Arguments to filter DashboardLayouts to delete.
     * @example
     * // Delete a few DashboardLayouts
     * const { count } = await prisma.dashboardLayout.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DashboardLayoutDeleteManyArgs>(args?: SelectSubset<T, DashboardLayoutDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DashboardLayouts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DashboardLayoutUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DashboardLayouts
     * const dashboardLayout = await prisma.dashboardLayout.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DashboardLayoutUpdateManyArgs>(args: SelectSubset<T, DashboardLayoutUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DashboardLayouts and returns the data updated in the database.
     * @param {DashboardLayoutUpdateManyAndReturnArgs} args - Arguments to update many DashboardLayouts.
     * @example
     * // Update many DashboardLayouts
     * const dashboardLayout = await prisma.dashboardLayout.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more DashboardLayouts and only return the `id`
     * const dashboardLayoutWithIdOnly = await prisma.dashboardLayout.updateManyAndReturn({
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
    updateManyAndReturn<T extends DashboardLayoutUpdateManyAndReturnArgs>(args: SelectSubset<T, DashboardLayoutUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DashboardLayoutPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one DashboardLayout.
     * @param {DashboardLayoutUpsertArgs} args - Arguments to update or create a DashboardLayout.
     * @example
     * // Update or create a DashboardLayout
     * const dashboardLayout = await prisma.dashboardLayout.upsert({
     *   create: {
     *     // ... data to create a DashboardLayout
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DashboardLayout we want to update
     *   }
     * })
     */
    upsert<T extends DashboardLayoutUpsertArgs>(args: SelectSubset<T, DashboardLayoutUpsertArgs<ExtArgs>>): Prisma__DashboardLayoutClient<$Result.GetResult<Prisma.$DashboardLayoutPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of DashboardLayouts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DashboardLayoutCountArgs} args - Arguments to filter DashboardLayouts to count.
     * @example
     * // Count the number of DashboardLayouts
     * const count = await prisma.dashboardLayout.count({
     *   where: {
     *     // ... the filter for the DashboardLayouts we want to count
     *   }
     * })
    **/
    count<T extends DashboardLayoutCountArgs>(
      args?: Subset<T, DashboardLayoutCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DashboardLayoutCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a DashboardLayout.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DashboardLayoutAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends DashboardLayoutAggregateArgs>(args: Subset<T, DashboardLayoutAggregateArgs>): Prisma.PrismaPromise<GetDashboardLayoutAggregateType<T>>

    /**
     * Group by DashboardLayout.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DashboardLayoutGroupByArgs} args - Group by arguments.
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
      T extends DashboardLayoutGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DashboardLayoutGroupByArgs['orderBy'] }
        : { orderBy?: DashboardLayoutGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, DashboardLayoutGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDashboardLayoutGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the DashboardLayout model
   */
  readonly fields: DashboardLayoutFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DashboardLayout.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DashboardLayoutClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the DashboardLayout model
   */
  interface DashboardLayoutFieldRefs {
    readonly id: FieldRef<"DashboardLayout", 'String'>
    readonly tenantId: FieldRef<"DashboardLayout", 'String'>
    readonly userId: FieldRef<"DashboardLayout", 'String'>
    readonly scope: FieldRef<"DashboardLayout", 'String'>
    readonly dashboardKey: FieldRef<"DashboardLayout", 'String'>
    readonly name: FieldRef<"DashboardLayout", 'String'>
    readonly document: FieldRef<"DashboardLayout", 'Json'>
    readonly schemaVersion: FieldRef<"DashboardLayout", 'Int'>
    readonly isDefault: FieldRef<"DashboardLayout", 'Boolean'>
    readonly updatedBy: FieldRef<"DashboardLayout", 'String'>
    readonly createdAt: FieldRef<"DashboardLayout", 'DateTime'>
    readonly updatedAt: FieldRef<"DashboardLayout", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * DashboardLayout findUnique
   */
  export type DashboardLayoutFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DashboardLayout
     */
    select?: DashboardLayoutSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DashboardLayout
     */
    omit?: DashboardLayoutOmit<ExtArgs> | null
    /**
     * Filter, which DashboardLayout to fetch.
     */
    where: DashboardLayoutWhereUniqueInput
  }

  /**
   * DashboardLayout findUniqueOrThrow
   */
  export type DashboardLayoutFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DashboardLayout
     */
    select?: DashboardLayoutSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DashboardLayout
     */
    omit?: DashboardLayoutOmit<ExtArgs> | null
    /**
     * Filter, which DashboardLayout to fetch.
     */
    where: DashboardLayoutWhereUniqueInput
  }

  /**
   * DashboardLayout findFirst
   */
  export type DashboardLayoutFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DashboardLayout
     */
    select?: DashboardLayoutSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DashboardLayout
     */
    omit?: DashboardLayoutOmit<ExtArgs> | null
    /**
     * Filter, which DashboardLayout to fetch.
     */
    where?: DashboardLayoutWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DashboardLayouts to fetch.
     */
    orderBy?: DashboardLayoutOrderByWithRelationInput | DashboardLayoutOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DashboardLayouts.
     */
    cursor?: DashboardLayoutWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DashboardLayouts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DashboardLayouts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DashboardLayouts.
     */
    distinct?: DashboardLayoutScalarFieldEnum | DashboardLayoutScalarFieldEnum[]
  }

  /**
   * DashboardLayout findFirstOrThrow
   */
  export type DashboardLayoutFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DashboardLayout
     */
    select?: DashboardLayoutSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DashboardLayout
     */
    omit?: DashboardLayoutOmit<ExtArgs> | null
    /**
     * Filter, which DashboardLayout to fetch.
     */
    where?: DashboardLayoutWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DashboardLayouts to fetch.
     */
    orderBy?: DashboardLayoutOrderByWithRelationInput | DashboardLayoutOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DashboardLayouts.
     */
    cursor?: DashboardLayoutWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DashboardLayouts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DashboardLayouts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DashboardLayouts.
     */
    distinct?: DashboardLayoutScalarFieldEnum | DashboardLayoutScalarFieldEnum[]
  }

  /**
   * DashboardLayout findMany
   */
  export type DashboardLayoutFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DashboardLayout
     */
    select?: DashboardLayoutSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DashboardLayout
     */
    omit?: DashboardLayoutOmit<ExtArgs> | null
    /**
     * Filter, which DashboardLayouts to fetch.
     */
    where?: DashboardLayoutWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DashboardLayouts to fetch.
     */
    orderBy?: DashboardLayoutOrderByWithRelationInput | DashboardLayoutOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing DashboardLayouts.
     */
    cursor?: DashboardLayoutWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DashboardLayouts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DashboardLayouts.
     */
    skip?: number
    distinct?: DashboardLayoutScalarFieldEnum | DashboardLayoutScalarFieldEnum[]
  }

  /**
   * DashboardLayout create
   */
  export type DashboardLayoutCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DashboardLayout
     */
    select?: DashboardLayoutSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DashboardLayout
     */
    omit?: DashboardLayoutOmit<ExtArgs> | null
    /**
     * The data needed to create a DashboardLayout.
     */
    data: XOR<DashboardLayoutCreateInput, DashboardLayoutUncheckedCreateInput>
  }

  /**
   * DashboardLayout createMany
   */
  export type DashboardLayoutCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many DashboardLayouts.
     */
    data: DashboardLayoutCreateManyInput | DashboardLayoutCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DashboardLayout createManyAndReturn
   */
  export type DashboardLayoutCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DashboardLayout
     */
    select?: DashboardLayoutSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DashboardLayout
     */
    omit?: DashboardLayoutOmit<ExtArgs> | null
    /**
     * The data used to create many DashboardLayouts.
     */
    data: DashboardLayoutCreateManyInput | DashboardLayoutCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DashboardLayout update
   */
  export type DashboardLayoutUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DashboardLayout
     */
    select?: DashboardLayoutSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DashboardLayout
     */
    omit?: DashboardLayoutOmit<ExtArgs> | null
    /**
     * The data needed to update a DashboardLayout.
     */
    data: XOR<DashboardLayoutUpdateInput, DashboardLayoutUncheckedUpdateInput>
    /**
     * Choose, which DashboardLayout to update.
     */
    where: DashboardLayoutWhereUniqueInput
  }

  /**
   * DashboardLayout updateMany
   */
  export type DashboardLayoutUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update DashboardLayouts.
     */
    data: XOR<DashboardLayoutUpdateManyMutationInput, DashboardLayoutUncheckedUpdateManyInput>
    /**
     * Filter which DashboardLayouts to update
     */
    where?: DashboardLayoutWhereInput
    /**
     * Limit how many DashboardLayouts to update.
     */
    limit?: number
  }

  /**
   * DashboardLayout updateManyAndReturn
   */
  export type DashboardLayoutUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DashboardLayout
     */
    select?: DashboardLayoutSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DashboardLayout
     */
    omit?: DashboardLayoutOmit<ExtArgs> | null
    /**
     * The data used to update DashboardLayouts.
     */
    data: XOR<DashboardLayoutUpdateManyMutationInput, DashboardLayoutUncheckedUpdateManyInput>
    /**
     * Filter which DashboardLayouts to update
     */
    where?: DashboardLayoutWhereInput
    /**
     * Limit how many DashboardLayouts to update.
     */
    limit?: number
  }

  /**
   * DashboardLayout upsert
   */
  export type DashboardLayoutUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DashboardLayout
     */
    select?: DashboardLayoutSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DashboardLayout
     */
    omit?: DashboardLayoutOmit<ExtArgs> | null
    /**
     * The filter to search for the DashboardLayout to update in case it exists.
     */
    where: DashboardLayoutWhereUniqueInput
    /**
     * In case the DashboardLayout found by the `where` argument doesn't exist, create a new DashboardLayout with this data.
     */
    create: XOR<DashboardLayoutCreateInput, DashboardLayoutUncheckedCreateInput>
    /**
     * In case the DashboardLayout was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DashboardLayoutUpdateInput, DashboardLayoutUncheckedUpdateInput>
  }

  /**
   * DashboardLayout delete
   */
  export type DashboardLayoutDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DashboardLayout
     */
    select?: DashboardLayoutSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DashboardLayout
     */
    omit?: DashboardLayoutOmit<ExtArgs> | null
    /**
     * Filter which DashboardLayout to delete.
     */
    where: DashboardLayoutWhereUniqueInput
  }

  /**
   * DashboardLayout deleteMany
   */
  export type DashboardLayoutDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DashboardLayouts to delete
     */
    where?: DashboardLayoutWhereInput
    /**
     * Limit how many DashboardLayouts to delete.
     */
    limit?: number
  }

  /**
   * DashboardLayout without action
   */
  export type DashboardLayoutDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DashboardLayout
     */
    select?: DashboardLayoutSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DashboardLayout
     */
    omit?: DashboardLayoutOmit<ExtArgs> | null
  }


  /**
   * Model UserUiPrefs
   */

  export type AggregateUserUiPrefs = {
    _count: UserUiPrefsCountAggregateOutputType | null
    _min: UserUiPrefsMinAggregateOutputType | null
    _max: UserUiPrefsMaxAggregateOutputType | null
  }

  export type UserUiPrefsMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    userId: string | null
    colorMode: string | null
    density: string | null
    locale: string | null
    timezone: string | null
    accentOverride: string | null
    updatedAt: Date | null
  }

  export type UserUiPrefsMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    userId: string | null
    colorMode: string | null
    density: string | null
    locale: string | null
    timezone: string | null
    accentOverride: string | null
    updatedAt: Date | null
  }

  export type UserUiPrefsCountAggregateOutputType = {
    id: number
    tenantId: number
    userId: number
    colorMode: number
    density: number
    locale: number
    timezone: number
    accentOverride: number
    prefs: number
    updatedAt: number
    _all: number
  }


  export type UserUiPrefsMinAggregateInputType = {
    id?: true
    tenantId?: true
    userId?: true
    colorMode?: true
    density?: true
    locale?: true
    timezone?: true
    accentOverride?: true
    updatedAt?: true
  }

  export type UserUiPrefsMaxAggregateInputType = {
    id?: true
    tenantId?: true
    userId?: true
    colorMode?: true
    density?: true
    locale?: true
    timezone?: true
    accentOverride?: true
    updatedAt?: true
  }

  export type UserUiPrefsCountAggregateInputType = {
    id?: true
    tenantId?: true
    userId?: true
    colorMode?: true
    density?: true
    locale?: true
    timezone?: true
    accentOverride?: true
    prefs?: true
    updatedAt?: true
    _all?: true
  }

  export type UserUiPrefsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserUiPrefs to aggregate.
     */
    where?: UserUiPrefsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserUiPrefs to fetch.
     */
    orderBy?: UserUiPrefsOrderByWithRelationInput | UserUiPrefsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserUiPrefsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserUiPrefs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserUiPrefs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UserUiPrefs
    **/
    _count?: true | UserUiPrefsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserUiPrefsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserUiPrefsMaxAggregateInputType
  }

  export type GetUserUiPrefsAggregateType<T extends UserUiPrefsAggregateArgs> = {
        [P in keyof T & keyof AggregateUserUiPrefs]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUserUiPrefs[P]>
      : GetScalarType<T[P], AggregateUserUiPrefs[P]>
  }




  export type UserUiPrefsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserUiPrefsWhereInput
    orderBy?: UserUiPrefsOrderByWithAggregationInput | UserUiPrefsOrderByWithAggregationInput[]
    by: UserUiPrefsScalarFieldEnum[] | UserUiPrefsScalarFieldEnum
    having?: UserUiPrefsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserUiPrefsCountAggregateInputType | true
    _min?: UserUiPrefsMinAggregateInputType
    _max?: UserUiPrefsMaxAggregateInputType
  }

  export type UserUiPrefsGroupByOutputType = {
    id: string
    tenantId: string
    userId: string
    colorMode: string
    density: string
    locale: string | null
    timezone: string | null
    accentOverride: string | null
    prefs: JsonValue
    updatedAt: Date
    _count: UserUiPrefsCountAggregateOutputType | null
    _min: UserUiPrefsMinAggregateOutputType | null
    _max: UserUiPrefsMaxAggregateOutputType | null
  }

  type GetUserUiPrefsGroupByPayload<T extends UserUiPrefsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserUiPrefsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserUiPrefsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserUiPrefsGroupByOutputType[P]>
            : GetScalarType<T[P], UserUiPrefsGroupByOutputType[P]>
        }
      >
    >


  export type UserUiPrefsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    userId?: boolean
    colorMode?: boolean
    density?: boolean
    locale?: boolean
    timezone?: boolean
    accentOverride?: boolean
    prefs?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["userUiPrefs"]>

  export type UserUiPrefsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    userId?: boolean
    colorMode?: boolean
    density?: boolean
    locale?: boolean
    timezone?: boolean
    accentOverride?: boolean
    prefs?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["userUiPrefs"]>

  export type UserUiPrefsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    userId?: boolean
    colorMode?: boolean
    density?: boolean
    locale?: boolean
    timezone?: boolean
    accentOverride?: boolean
    prefs?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["userUiPrefs"]>

  export type UserUiPrefsSelectScalar = {
    id?: boolean
    tenantId?: boolean
    userId?: boolean
    colorMode?: boolean
    density?: boolean
    locale?: boolean
    timezone?: boolean
    accentOverride?: boolean
    prefs?: boolean
    updatedAt?: boolean
  }

  export type UserUiPrefsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "userId" | "colorMode" | "density" | "locale" | "timezone" | "accentOverride" | "prefs" | "updatedAt", ExtArgs["result"]["userUiPrefs"]>

  export type $UserUiPrefsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UserUiPrefs"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      userId: string
      colorMode: string
      density: string
      locale: string | null
      timezone: string | null
      accentOverride: string | null
      prefs: Prisma.JsonValue
      updatedAt: Date
    }, ExtArgs["result"]["userUiPrefs"]>
    composites: {}
  }

  type UserUiPrefsGetPayload<S extends boolean | null | undefined | UserUiPrefsDefaultArgs> = $Result.GetResult<Prisma.$UserUiPrefsPayload, S>

  type UserUiPrefsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserUiPrefsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserUiPrefsCountAggregateInputType | true
    }

  export interface UserUiPrefsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UserUiPrefs'], meta: { name: 'UserUiPrefs' } }
    /**
     * Find zero or one UserUiPrefs that matches the filter.
     * @param {UserUiPrefsFindUniqueArgs} args - Arguments to find a UserUiPrefs
     * @example
     * // Get one UserUiPrefs
     * const userUiPrefs = await prisma.userUiPrefs.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserUiPrefsFindUniqueArgs>(args: SelectSubset<T, UserUiPrefsFindUniqueArgs<ExtArgs>>): Prisma__UserUiPrefsClient<$Result.GetResult<Prisma.$UserUiPrefsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one UserUiPrefs that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserUiPrefsFindUniqueOrThrowArgs} args - Arguments to find a UserUiPrefs
     * @example
     * // Get one UserUiPrefs
     * const userUiPrefs = await prisma.userUiPrefs.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserUiPrefsFindUniqueOrThrowArgs>(args: SelectSubset<T, UserUiPrefsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserUiPrefsClient<$Result.GetResult<Prisma.$UserUiPrefsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserUiPrefs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUiPrefsFindFirstArgs} args - Arguments to find a UserUiPrefs
     * @example
     * // Get one UserUiPrefs
     * const userUiPrefs = await prisma.userUiPrefs.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserUiPrefsFindFirstArgs>(args?: SelectSubset<T, UserUiPrefsFindFirstArgs<ExtArgs>>): Prisma__UserUiPrefsClient<$Result.GetResult<Prisma.$UserUiPrefsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserUiPrefs that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUiPrefsFindFirstOrThrowArgs} args - Arguments to find a UserUiPrefs
     * @example
     * // Get one UserUiPrefs
     * const userUiPrefs = await prisma.userUiPrefs.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserUiPrefsFindFirstOrThrowArgs>(args?: SelectSubset<T, UserUiPrefsFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserUiPrefsClient<$Result.GetResult<Prisma.$UserUiPrefsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more UserUiPrefs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUiPrefsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserUiPrefs
     * const userUiPrefs = await prisma.userUiPrefs.findMany()
     * 
     * // Get first 10 UserUiPrefs
     * const userUiPrefs = await prisma.userUiPrefs.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userUiPrefsWithIdOnly = await prisma.userUiPrefs.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserUiPrefsFindManyArgs>(args?: SelectSubset<T, UserUiPrefsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserUiPrefsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a UserUiPrefs.
     * @param {UserUiPrefsCreateArgs} args - Arguments to create a UserUiPrefs.
     * @example
     * // Create one UserUiPrefs
     * const UserUiPrefs = await prisma.userUiPrefs.create({
     *   data: {
     *     // ... data to create a UserUiPrefs
     *   }
     * })
     * 
     */
    create<T extends UserUiPrefsCreateArgs>(args: SelectSubset<T, UserUiPrefsCreateArgs<ExtArgs>>): Prisma__UserUiPrefsClient<$Result.GetResult<Prisma.$UserUiPrefsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many UserUiPrefs.
     * @param {UserUiPrefsCreateManyArgs} args - Arguments to create many UserUiPrefs.
     * @example
     * // Create many UserUiPrefs
     * const userUiPrefs = await prisma.userUiPrefs.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserUiPrefsCreateManyArgs>(args?: SelectSubset<T, UserUiPrefsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many UserUiPrefs and returns the data saved in the database.
     * @param {UserUiPrefsCreateManyAndReturnArgs} args - Arguments to create many UserUiPrefs.
     * @example
     * // Create many UserUiPrefs
     * const userUiPrefs = await prisma.userUiPrefs.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many UserUiPrefs and only return the `id`
     * const userUiPrefsWithIdOnly = await prisma.userUiPrefs.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserUiPrefsCreateManyAndReturnArgs>(args?: SelectSubset<T, UserUiPrefsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserUiPrefsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a UserUiPrefs.
     * @param {UserUiPrefsDeleteArgs} args - Arguments to delete one UserUiPrefs.
     * @example
     * // Delete one UserUiPrefs
     * const UserUiPrefs = await prisma.userUiPrefs.delete({
     *   where: {
     *     // ... filter to delete one UserUiPrefs
     *   }
     * })
     * 
     */
    delete<T extends UserUiPrefsDeleteArgs>(args: SelectSubset<T, UserUiPrefsDeleteArgs<ExtArgs>>): Prisma__UserUiPrefsClient<$Result.GetResult<Prisma.$UserUiPrefsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one UserUiPrefs.
     * @param {UserUiPrefsUpdateArgs} args - Arguments to update one UserUiPrefs.
     * @example
     * // Update one UserUiPrefs
     * const userUiPrefs = await prisma.userUiPrefs.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUiPrefsUpdateArgs>(args: SelectSubset<T, UserUiPrefsUpdateArgs<ExtArgs>>): Prisma__UserUiPrefsClient<$Result.GetResult<Prisma.$UserUiPrefsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more UserUiPrefs.
     * @param {UserUiPrefsDeleteManyArgs} args - Arguments to filter UserUiPrefs to delete.
     * @example
     * // Delete a few UserUiPrefs
     * const { count } = await prisma.userUiPrefs.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserUiPrefsDeleteManyArgs>(args?: SelectSubset<T, UserUiPrefsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserUiPrefs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUiPrefsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserUiPrefs
     * const userUiPrefs = await prisma.userUiPrefs.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUiPrefsUpdateManyArgs>(args: SelectSubset<T, UserUiPrefsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserUiPrefs and returns the data updated in the database.
     * @param {UserUiPrefsUpdateManyAndReturnArgs} args - Arguments to update many UserUiPrefs.
     * @example
     * // Update many UserUiPrefs
     * const userUiPrefs = await prisma.userUiPrefs.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more UserUiPrefs and only return the `id`
     * const userUiPrefsWithIdOnly = await prisma.userUiPrefs.updateManyAndReturn({
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
    updateManyAndReturn<T extends UserUiPrefsUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUiPrefsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserUiPrefsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one UserUiPrefs.
     * @param {UserUiPrefsUpsertArgs} args - Arguments to update or create a UserUiPrefs.
     * @example
     * // Update or create a UserUiPrefs
     * const userUiPrefs = await prisma.userUiPrefs.upsert({
     *   create: {
     *     // ... data to create a UserUiPrefs
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserUiPrefs we want to update
     *   }
     * })
     */
    upsert<T extends UserUiPrefsUpsertArgs>(args: SelectSubset<T, UserUiPrefsUpsertArgs<ExtArgs>>): Prisma__UserUiPrefsClient<$Result.GetResult<Prisma.$UserUiPrefsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of UserUiPrefs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUiPrefsCountArgs} args - Arguments to filter UserUiPrefs to count.
     * @example
     * // Count the number of UserUiPrefs
     * const count = await prisma.userUiPrefs.count({
     *   where: {
     *     // ... the filter for the UserUiPrefs we want to count
     *   }
     * })
    **/
    count<T extends UserUiPrefsCountArgs>(
      args?: Subset<T, UserUiPrefsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserUiPrefsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UserUiPrefs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUiPrefsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends UserUiPrefsAggregateArgs>(args: Subset<T, UserUiPrefsAggregateArgs>): Prisma.PrismaPromise<GetUserUiPrefsAggregateType<T>>

    /**
     * Group by UserUiPrefs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUiPrefsGroupByArgs} args - Group by arguments.
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
      T extends UserUiPrefsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserUiPrefsGroupByArgs['orderBy'] }
        : { orderBy?: UserUiPrefsGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, UserUiPrefsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserUiPrefsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UserUiPrefs model
   */
  readonly fields: UserUiPrefsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserUiPrefs.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserUiPrefsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the UserUiPrefs model
   */
  interface UserUiPrefsFieldRefs {
    readonly id: FieldRef<"UserUiPrefs", 'String'>
    readonly tenantId: FieldRef<"UserUiPrefs", 'String'>
    readonly userId: FieldRef<"UserUiPrefs", 'String'>
    readonly colorMode: FieldRef<"UserUiPrefs", 'String'>
    readonly density: FieldRef<"UserUiPrefs", 'String'>
    readonly locale: FieldRef<"UserUiPrefs", 'String'>
    readonly timezone: FieldRef<"UserUiPrefs", 'String'>
    readonly accentOverride: FieldRef<"UserUiPrefs", 'String'>
    readonly prefs: FieldRef<"UserUiPrefs", 'Json'>
    readonly updatedAt: FieldRef<"UserUiPrefs", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * UserUiPrefs findUnique
   */
  export type UserUiPrefsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserUiPrefs
     */
    select?: UserUiPrefsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserUiPrefs
     */
    omit?: UserUiPrefsOmit<ExtArgs> | null
    /**
     * Filter, which UserUiPrefs to fetch.
     */
    where: UserUiPrefsWhereUniqueInput
  }

  /**
   * UserUiPrefs findUniqueOrThrow
   */
  export type UserUiPrefsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserUiPrefs
     */
    select?: UserUiPrefsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserUiPrefs
     */
    omit?: UserUiPrefsOmit<ExtArgs> | null
    /**
     * Filter, which UserUiPrefs to fetch.
     */
    where: UserUiPrefsWhereUniqueInput
  }

  /**
   * UserUiPrefs findFirst
   */
  export type UserUiPrefsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserUiPrefs
     */
    select?: UserUiPrefsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserUiPrefs
     */
    omit?: UserUiPrefsOmit<ExtArgs> | null
    /**
     * Filter, which UserUiPrefs to fetch.
     */
    where?: UserUiPrefsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserUiPrefs to fetch.
     */
    orderBy?: UserUiPrefsOrderByWithRelationInput | UserUiPrefsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserUiPrefs.
     */
    cursor?: UserUiPrefsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserUiPrefs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserUiPrefs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserUiPrefs.
     */
    distinct?: UserUiPrefsScalarFieldEnum | UserUiPrefsScalarFieldEnum[]
  }

  /**
   * UserUiPrefs findFirstOrThrow
   */
  export type UserUiPrefsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserUiPrefs
     */
    select?: UserUiPrefsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserUiPrefs
     */
    omit?: UserUiPrefsOmit<ExtArgs> | null
    /**
     * Filter, which UserUiPrefs to fetch.
     */
    where?: UserUiPrefsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserUiPrefs to fetch.
     */
    orderBy?: UserUiPrefsOrderByWithRelationInput | UserUiPrefsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserUiPrefs.
     */
    cursor?: UserUiPrefsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserUiPrefs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserUiPrefs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserUiPrefs.
     */
    distinct?: UserUiPrefsScalarFieldEnum | UserUiPrefsScalarFieldEnum[]
  }

  /**
   * UserUiPrefs findMany
   */
  export type UserUiPrefsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserUiPrefs
     */
    select?: UserUiPrefsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserUiPrefs
     */
    omit?: UserUiPrefsOmit<ExtArgs> | null
    /**
     * Filter, which UserUiPrefs to fetch.
     */
    where?: UserUiPrefsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserUiPrefs to fetch.
     */
    orderBy?: UserUiPrefsOrderByWithRelationInput | UserUiPrefsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UserUiPrefs.
     */
    cursor?: UserUiPrefsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserUiPrefs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserUiPrefs.
     */
    skip?: number
    distinct?: UserUiPrefsScalarFieldEnum | UserUiPrefsScalarFieldEnum[]
  }

  /**
   * UserUiPrefs create
   */
  export type UserUiPrefsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserUiPrefs
     */
    select?: UserUiPrefsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserUiPrefs
     */
    omit?: UserUiPrefsOmit<ExtArgs> | null
    /**
     * The data needed to create a UserUiPrefs.
     */
    data: XOR<UserUiPrefsCreateInput, UserUiPrefsUncheckedCreateInput>
  }

  /**
   * UserUiPrefs createMany
   */
  export type UserUiPrefsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UserUiPrefs.
     */
    data: UserUiPrefsCreateManyInput | UserUiPrefsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UserUiPrefs createManyAndReturn
   */
  export type UserUiPrefsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserUiPrefs
     */
    select?: UserUiPrefsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserUiPrefs
     */
    omit?: UserUiPrefsOmit<ExtArgs> | null
    /**
     * The data used to create many UserUiPrefs.
     */
    data: UserUiPrefsCreateManyInput | UserUiPrefsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UserUiPrefs update
   */
  export type UserUiPrefsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserUiPrefs
     */
    select?: UserUiPrefsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserUiPrefs
     */
    omit?: UserUiPrefsOmit<ExtArgs> | null
    /**
     * The data needed to update a UserUiPrefs.
     */
    data: XOR<UserUiPrefsUpdateInput, UserUiPrefsUncheckedUpdateInput>
    /**
     * Choose, which UserUiPrefs to update.
     */
    where: UserUiPrefsWhereUniqueInput
  }

  /**
   * UserUiPrefs updateMany
   */
  export type UserUiPrefsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UserUiPrefs.
     */
    data: XOR<UserUiPrefsUpdateManyMutationInput, UserUiPrefsUncheckedUpdateManyInput>
    /**
     * Filter which UserUiPrefs to update
     */
    where?: UserUiPrefsWhereInput
    /**
     * Limit how many UserUiPrefs to update.
     */
    limit?: number
  }

  /**
   * UserUiPrefs updateManyAndReturn
   */
  export type UserUiPrefsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserUiPrefs
     */
    select?: UserUiPrefsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserUiPrefs
     */
    omit?: UserUiPrefsOmit<ExtArgs> | null
    /**
     * The data used to update UserUiPrefs.
     */
    data: XOR<UserUiPrefsUpdateManyMutationInput, UserUiPrefsUncheckedUpdateManyInput>
    /**
     * Filter which UserUiPrefs to update
     */
    where?: UserUiPrefsWhereInput
    /**
     * Limit how many UserUiPrefs to update.
     */
    limit?: number
  }

  /**
   * UserUiPrefs upsert
   */
  export type UserUiPrefsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserUiPrefs
     */
    select?: UserUiPrefsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserUiPrefs
     */
    omit?: UserUiPrefsOmit<ExtArgs> | null
    /**
     * The filter to search for the UserUiPrefs to update in case it exists.
     */
    where: UserUiPrefsWhereUniqueInput
    /**
     * In case the UserUiPrefs found by the `where` argument doesn't exist, create a new UserUiPrefs with this data.
     */
    create: XOR<UserUiPrefsCreateInput, UserUiPrefsUncheckedCreateInput>
    /**
     * In case the UserUiPrefs was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUiPrefsUpdateInput, UserUiPrefsUncheckedUpdateInput>
  }

  /**
   * UserUiPrefs delete
   */
  export type UserUiPrefsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserUiPrefs
     */
    select?: UserUiPrefsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserUiPrefs
     */
    omit?: UserUiPrefsOmit<ExtArgs> | null
    /**
     * Filter which UserUiPrefs to delete.
     */
    where: UserUiPrefsWhereUniqueInput
  }

  /**
   * UserUiPrefs deleteMany
   */
  export type UserUiPrefsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserUiPrefs to delete
     */
    where?: UserUiPrefsWhereInput
    /**
     * Limit how many UserUiPrefs to delete.
     */
    limit?: number
  }

  /**
   * UserUiPrefs without action
   */
  export type UserUiPrefsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserUiPrefs
     */
    select?: UserUiPrefsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserUiPrefs
     */
    omit?: UserUiPrefsOmit<ExtArgs> | null
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


  export const UserScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    email: 'email',
    passwordHash: 'passwordHash',
    firstName: 'firstName',
    lastName: 'lastName',
    role: 'role',
    department: 'department',
    isActive: 'isActive',
    lastLoginAt: 'lastLoginAt',
    mfaSecret: 'mfaSecret',
    mfaEnabled: 'mfaEnabled',
    externalId: 'externalId',
    ssoLastLogin: 'ssoLastLogin',
    emailVerified: 'emailVerified',
    emailVerifiedAt: 'emailVerifiedAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    managerId: 'managerId'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const TenantApiKeyScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    name: 'name',
    keyPrefix: 'keyPrefix',
    keyHash: 'keyHash',
    createdByUserId: 'createdByUserId',
    createdAt: 'createdAt',
    lastUsedAt: 'lastUsedAt',
    revokedAt: 'revokedAt',
    scopes: 'scopes'
  };

  export type TenantApiKeyScalarFieldEnum = (typeof TenantApiKeyScalarFieldEnum)[keyof typeof TenantApiKeyScalarFieldEnum]


  export const EmailVerificationScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    email: 'email',
    token: 'token',
    expiresAt: 'expiresAt',
    usedAt: 'usedAt',
    createdAt: 'createdAt'
  };

  export type EmailVerificationScalarFieldEnum = (typeof EmailVerificationScalarFieldEnum)[keyof typeof EmailVerificationScalarFieldEnum]


  export const PasswordResetScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    token: 'token',
    expiresAt: 'expiresAt',
    usedAt: 'usedAt',
    createdAt: 'createdAt'
  };

  export type PasswordResetScalarFieldEnum = (typeof PasswordResetScalarFieldEnum)[keyof typeof PasswordResetScalarFieldEnum]


  export const InviteTokenScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    email: 'email',
    role: 'role',
    token: 'token',
    expiresAt: 'expiresAt',
    usedAt: 'usedAt',
    invitedByUserId: 'invitedByUserId',
    createdAt: 'createdAt'
  };

  export type InviteTokenScalarFieldEnum = (typeof InviteTokenScalarFieldEnum)[keyof typeof InviteTokenScalarFieldEnum]


  export const AuditEventScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    actorUserId: 'actorUserId',
    action: 'action',
    resourceType: 'resourceType',
    resourceId: 'resourceId',
    metadata: 'metadata',
    ipAddress: 'ipAddress',
    createdAt: 'createdAt'
  };

  export type AuditEventScalarFieldEnum = (typeof AuditEventScalarFieldEnum)[keyof typeof AuditEventScalarFieldEnum]


  export const TenantSsoScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    protocol: 'protocol',
    status: 'status',
    samlEntryPoint: 'samlEntryPoint',
    samlIssuer: 'samlIssuer',
    samlCertificate: 'samlCertificate',
    oidcIssuerUrl: 'oidcIssuerUrl',
    oidcClientId: 'oidcClientId',
    oidcClientSecret: 'oidcClientSecret',
    emailDomains: 'emailDomains',
    attrEmail: 'attrEmail',
    attrFirstName: 'attrFirstName',
    attrLastName: 'attrLastName',
    attrGroups: 'attrGroups',
    roleMap: 'roleMap',
    defaultRole: 'defaultRole',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type TenantSsoScalarFieldEnum = (typeof TenantSsoScalarFieldEnum)[keyof typeof TenantSsoScalarFieldEnum]


  export const SsoLoginAuditScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    email: 'email',
    protocol: 'protocol',
    outcome: 'outcome',
    ipAddress: 'ipAddress',
    userAgent: 'userAgent',
    userId: 'userId',
    createdAt: 'createdAt'
  };

  export type SsoLoginAuditScalarFieldEnum = (typeof SsoLoginAuditScalarFieldEnum)[keyof typeof SsoLoginAuditScalarFieldEnum]


  export const DashboardLayoutScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    userId: 'userId',
    scope: 'scope',
    dashboardKey: 'dashboardKey',
    name: 'name',
    document: 'document',
    schemaVersion: 'schemaVersion',
    isDefault: 'isDefault',
    updatedBy: 'updatedBy',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type DashboardLayoutScalarFieldEnum = (typeof DashboardLayoutScalarFieldEnum)[keyof typeof DashboardLayoutScalarFieldEnum]


  export const UserUiPrefsScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    userId: 'userId',
    colorMode: 'colorMode',
    density: 'density',
    locale: 'locale',
    timezone: 'timezone',
    accentOverride: 'accentOverride',
    prefs: 'prefs',
    updatedAt: 'updatedAt'
  };

  export type UserUiPrefsScalarFieldEnum = (typeof UserUiPrefsScalarFieldEnum)[keyof typeof UserUiPrefsScalarFieldEnum]


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
   * Reference to a field of type 'UserRole'
   */
  export type EnumUserRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserRole'>
    


  /**
   * Reference to a field of type 'UserRole[]'
   */
  export type ListEnumUserRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserRole[]'>
    


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
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'SsoProtocol'
   */
  export type EnumSsoProtocolFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SsoProtocol'>
    


  /**
   * Reference to a field of type 'SsoProtocol[]'
   */
  export type ListEnumSsoProtocolFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SsoProtocol[]'>
    


  /**
   * Reference to a field of type 'SsoStatus'
   */
  export type EnumSsoStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SsoStatus'>
    


  /**
   * Reference to a field of type 'SsoStatus[]'
   */
  export type ListEnumSsoStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SsoStatus[]'>
    


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


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    tenantId?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    passwordHash?: StringFilter<"User"> | string
    firstName?: StringFilter<"User"> | string
    lastName?: StringFilter<"User"> | string
    role?: EnumUserRoleFilter<"User"> | $Enums.UserRole
    department?: StringNullableFilter<"User"> | string | null
    isActive?: BoolFilter<"User"> | boolean
    lastLoginAt?: DateTimeNullableFilter<"User"> | Date | string | null
    mfaSecret?: StringNullableFilter<"User"> | string | null
    mfaEnabled?: BoolFilter<"User"> | boolean
    externalId?: StringNullableFilter<"User"> | string | null
    ssoLastLogin?: DateTimeNullableFilter<"User"> | Date | string | null
    emailVerified?: BoolFilter<"User"> | boolean
    emailVerifiedAt?: DateTimeNullableFilter<"User"> | Date | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    managerId?: StringNullableFilter<"User"> | string | null
    inviteTokens?: InviteTokenListRelationFilter
    passwordResets?: PasswordResetListRelationFilter
    emailVerifications?: EmailVerificationListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    role?: SortOrder
    department?: SortOrderInput | SortOrder
    isActive?: SortOrder
    lastLoginAt?: SortOrderInput | SortOrder
    mfaSecret?: SortOrderInput | SortOrder
    mfaEnabled?: SortOrder
    externalId?: SortOrderInput | SortOrder
    ssoLastLogin?: SortOrderInput | SortOrder
    emailVerified?: SortOrder
    emailVerifiedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    managerId?: SortOrderInput | SortOrder
    inviteTokens?: InviteTokenOrderByRelationAggregateInput
    passwordResets?: PasswordResetOrderByRelationAggregateInput
    emailVerifications?: EmailVerificationOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    externalId?: string
    tenantId_email?: UserTenantIdEmailCompoundUniqueInput
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    tenantId?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    passwordHash?: StringFilter<"User"> | string
    firstName?: StringFilter<"User"> | string
    lastName?: StringFilter<"User"> | string
    role?: EnumUserRoleFilter<"User"> | $Enums.UserRole
    department?: StringNullableFilter<"User"> | string | null
    isActive?: BoolFilter<"User"> | boolean
    lastLoginAt?: DateTimeNullableFilter<"User"> | Date | string | null
    mfaSecret?: StringNullableFilter<"User"> | string | null
    mfaEnabled?: BoolFilter<"User"> | boolean
    ssoLastLogin?: DateTimeNullableFilter<"User"> | Date | string | null
    emailVerified?: BoolFilter<"User"> | boolean
    emailVerifiedAt?: DateTimeNullableFilter<"User"> | Date | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    managerId?: StringNullableFilter<"User"> | string | null
    inviteTokens?: InviteTokenListRelationFilter
    passwordResets?: PasswordResetListRelationFilter
    emailVerifications?: EmailVerificationListRelationFilter
  }, "id" | "externalId" | "tenantId_email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    role?: SortOrder
    department?: SortOrderInput | SortOrder
    isActive?: SortOrder
    lastLoginAt?: SortOrderInput | SortOrder
    mfaSecret?: SortOrderInput | SortOrder
    mfaEnabled?: SortOrder
    externalId?: SortOrderInput | SortOrder
    ssoLastLogin?: SortOrderInput | SortOrder
    emailVerified?: SortOrder
    emailVerifiedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    managerId?: SortOrderInput | SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    tenantId?: StringWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    passwordHash?: StringWithAggregatesFilter<"User"> | string
    firstName?: StringWithAggregatesFilter<"User"> | string
    lastName?: StringWithAggregatesFilter<"User"> | string
    role?: EnumUserRoleWithAggregatesFilter<"User"> | $Enums.UserRole
    department?: StringNullableWithAggregatesFilter<"User"> | string | null
    isActive?: BoolWithAggregatesFilter<"User"> | boolean
    lastLoginAt?: DateTimeNullableWithAggregatesFilter<"User"> | Date | string | null
    mfaSecret?: StringNullableWithAggregatesFilter<"User"> | string | null
    mfaEnabled?: BoolWithAggregatesFilter<"User"> | boolean
    externalId?: StringNullableWithAggregatesFilter<"User"> | string | null
    ssoLastLogin?: DateTimeNullableWithAggregatesFilter<"User"> | Date | string | null
    emailVerified?: BoolWithAggregatesFilter<"User"> | boolean
    emailVerifiedAt?: DateTimeNullableWithAggregatesFilter<"User"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    managerId?: StringNullableWithAggregatesFilter<"User"> | string | null
  }

  export type TenantApiKeyWhereInput = {
    AND?: TenantApiKeyWhereInput | TenantApiKeyWhereInput[]
    OR?: TenantApiKeyWhereInput[]
    NOT?: TenantApiKeyWhereInput | TenantApiKeyWhereInput[]
    id?: StringFilter<"TenantApiKey"> | string
    tenantId?: StringFilter<"TenantApiKey"> | string
    name?: StringFilter<"TenantApiKey"> | string
    keyPrefix?: StringFilter<"TenantApiKey"> | string
    keyHash?: StringFilter<"TenantApiKey"> | string
    createdByUserId?: StringFilter<"TenantApiKey"> | string
    createdAt?: DateTimeFilter<"TenantApiKey"> | Date | string
    lastUsedAt?: DateTimeNullableFilter<"TenantApiKey"> | Date | string | null
    revokedAt?: DateTimeNullableFilter<"TenantApiKey"> | Date | string | null
    scopes?: StringNullableListFilter<"TenantApiKey">
  }

  export type TenantApiKeyOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    name?: SortOrder
    keyPrefix?: SortOrder
    keyHash?: SortOrder
    createdByUserId?: SortOrder
    createdAt?: SortOrder
    lastUsedAt?: SortOrderInput | SortOrder
    revokedAt?: SortOrderInput | SortOrder
    scopes?: SortOrder
  }

  export type TenantApiKeyWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: TenantApiKeyWhereInput | TenantApiKeyWhereInput[]
    OR?: TenantApiKeyWhereInput[]
    NOT?: TenantApiKeyWhereInput | TenantApiKeyWhereInput[]
    tenantId?: StringFilter<"TenantApiKey"> | string
    name?: StringFilter<"TenantApiKey"> | string
    keyPrefix?: StringFilter<"TenantApiKey"> | string
    keyHash?: StringFilter<"TenantApiKey"> | string
    createdByUserId?: StringFilter<"TenantApiKey"> | string
    createdAt?: DateTimeFilter<"TenantApiKey"> | Date | string
    lastUsedAt?: DateTimeNullableFilter<"TenantApiKey"> | Date | string | null
    revokedAt?: DateTimeNullableFilter<"TenantApiKey"> | Date | string | null
    scopes?: StringNullableListFilter<"TenantApiKey">
  }, "id">

  export type TenantApiKeyOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    name?: SortOrder
    keyPrefix?: SortOrder
    keyHash?: SortOrder
    createdByUserId?: SortOrder
    createdAt?: SortOrder
    lastUsedAt?: SortOrderInput | SortOrder
    revokedAt?: SortOrderInput | SortOrder
    scopes?: SortOrder
    _count?: TenantApiKeyCountOrderByAggregateInput
    _max?: TenantApiKeyMaxOrderByAggregateInput
    _min?: TenantApiKeyMinOrderByAggregateInput
  }

  export type TenantApiKeyScalarWhereWithAggregatesInput = {
    AND?: TenantApiKeyScalarWhereWithAggregatesInput | TenantApiKeyScalarWhereWithAggregatesInput[]
    OR?: TenantApiKeyScalarWhereWithAggregatesInput[]
    NOT?: TenantApiKeyScalarWhereWithAggregatesInput | TenantApiKeyScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"TenantApiKey"> | string
    tenantId?: StringWithAggregatesFilter<"TenantApiKey"> | string
    name?: StringWithAggregatesFilter<"TenantApiKey"> | string
    keyPrefix?: StringWithAggregatesFilter<"TenantApiKey"> | string
    keyHash?: StringWithAggregatesFilter<"TenantApiKey"> | string
    createdByUserId?: StringWithAggregatesFilter<"TenantApiKey"> | string
    createdAt?: DateTimeWithAggregatesFilter<"TenantApiKey"> | Date | string
    lastUsedAt?: DateTimeNullableWithAggregatesFilter<"TenantApiKey"> | Date | string | null
    revokedAt?: DateTimeNullableWithAggregatesFilter<"TenantApiKey"> | Date | string | null
    scopes?: StringNullableListFilter<"TenantApiKey">
  }

  export type EmailVerificationWhereInput = {
    AND?: EmailVerificationWhereInput | EmailVerificationWhereInput[]
    OR?: EmailVerificationWhereInput[]
    NOT?: EmailVerificationWhereInput | EmailVerificationWhereInput[]
    id?: StringFilter<"EmailVerification"> | string
    userId?: StringFilter<"EmailVerification"> | string
    email?: StringFilter<"EmailVerification"> | string
    token?: StringFilter<"EmailVerification"> | string
    expiresAt?: DateTimeFilter<"EmailVerification"> | Date | string
    usedAt?: DateTimeNullableFilter<"EmailVerification"> | Date | string | null
    createdAt?: DateTimeFilter<"EmailVerification"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type EmailVerificationOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    email?: SortOrder
    token?: SortOrder
    expiresAt?: SortOrder
    usedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type EmailVerificationWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    token?: string
    AND?: EmailVerificationWhereInput | EmailVerificationWhereInput[]
    OR?: EmailVerificationWhereInput[]
    NOT?: EmailVerificationWhereInput | EmailVerificationWhereInput[]
    userId?: StringFilter<"EmailVerification"> | string
    email?: StringFilter<"EmailVerification"> | string
    expiresAt?: DateTimeFilter<"EmailVerification"> | Date | string
    usedAt?: DateTimeNullableFilter<"EmailVerification"> | Date | string | null
    createdAt?: DateTimeFilter<"EmailVerification"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "token">

  export type EmailVerificationOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    email?: SortOrder
    token?: SortOrder
    expiresAt?: SortOrder
    usedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: EmailVerificationCountOrderByAggregateInput
    _max?: EmailVerificationMaxOrderByAggregateInput
    _min?: EmailVerificationMinOrderByAggregateInput
  }

  export type EmailVerificationScalarWhereWithAggregatesInput = {
    AND?: EmailVerificationScalarWhereWithAggregatesInput | EmailVerificationScalarWhereWithAggregatesInput[]
    OR?: EmailVerificationScalarWhereWithAggregatesInput[]
    NOT?: EmailVerificationScalarWhereWithAggregatesInput | EmailVerificationScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"EmailVerification"> | string
    userId?: StringWithAggregatesFilter<"EmailVerification"> | string
    email?: StringWithAggregatesFilter<"EmailVerification"> | string
    token?: StringWithAggregatesFilter<"EmailVerification"> | string
    expiresAt?: DateTimeWithAggregatesFilter<"EmailVerification"> | Date | string
    usedAt?: DateTimeNullableWithAggregatesFilter<"EmailVerification"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"EmailVerification"> | Date | string
  }

  export type PasswordResetWhereInput = {
    AND?: PasswordResetWhereInput | PasswordResetWhereInput[]
    OR?: PasswordResetWhereInput[]
    NOT?: PasswordResetWhereInput | PasswordResetWhereInput[]
    id?: StringFilter<"PasswordReset"> | string
    userId?: StringFilter<"PasswordReset"> | string
    token?: StringFilter<"PasswordReset"> | string
    expiresAt?: DateTimeFilter<"PasswordReset"> | Date | string
    usedAt?: DateTimeNullableFilter<"PasswordReset"> | Date | string | null
    createdAt?: DateTimeFilter<"PasswordReset"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type PasswordResetOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    token?: SortOrder
    expiresAt?: SortOrder
    usedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type PasswordResetWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    token?: string
    AND?: PasswordResetWhereInput | PasswordResetWhereInput[]
    OR?: PasswordResetWhereInput[]
    NOT?: PasswordResetWhereInput | PasswordResetWhereInput[]
    userId?: StringFilter<"PasswordReset"> | string
    expiresAt?: DateTimeFilter<"PasswordReset"> | Date | string
    usedAt?: DateTimeNullableFilter<"PasswordReset"> | Date | string | null
    createdAt?: DateTimeFilter<"PasswordReset"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "token">

  export type PasswordResetOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    token?: SortOrder
    expiresAt?: SortOrder
    usedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: PasswordResetCountOrderByAggregateInput
    _max?: PasswordResetMaxOrderByAggregateInput
    _min?: PasswordResetMinOrderByAggregateInput
  }

  export type PasswordResetScalarWhereWithAggregatesInput = {
    AND?: PasswordResetScalarWhereWithAggregatesInput | PasswordResetScalarWhereWithAggregatesInput[]
    OR?: PasswordResetScalarWhereWithAggregatesInput[]
    NOT?: PasswordResetScalarWhereWithAggregatesInput | PasswordResetScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"PasswordReset"> | string
    userId?: StringWithAggregatesFilter<"PasswordReset"> | string
    token?: StringWithAggregatesFilter<"PasswordReset"> | string
    expiresAt?: DateTimeWithAggregatesFilter<"PasswordReset"> | Date | string
    usedAt?: DateTimeNullableWithAggregatesFilter<"PasswordReset"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"PasswordReset"> | Date | string
  }

  export type InviteTokenWhereInput = {
    AND?: InviteTokenWhereInput | InviteTokenWhereInput[]
    OR?: InviteTokenWhereInput[]
    NOT?: InviteTokenWhereInput | InviteTokenWhereInput[]
    id?: StringFilter<"InviteToken"> | string
    tenantId?: StringFilter<"InviteToken"> | string
    email?: StringFilter<"InviteToken"> | string
    role?: EnumUserRoleFilter<"InviteToken"> | $Enums.UserRole
    token?: StringFilter<"InviteToken"> | string
    expiresAt?: DateTimeFilter<"InviteToken"> | Date | string
    usedAt?: DateTimeNullableFilter<"InviteToken"> | Date | string | null
    invitedByUserId?: StringFilter<"InviteToken"> | string
    createdAt?: DateTimeFilter<"InviteToken"> | Date | string
    invitedBy?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type InviteTokenOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    email?: SortOrder
    role?: SortOrder
    token?: SortOrder
    expiresAt?: SortOrder
    usedAt?: SortOrderInput | SortOrder
    invitedByUserId?: SortOrder
    createdAt?: SortOrder
    invitedBy?: UserOrderByWithRelationInput
  }

  export type InviteTokenWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    token?: string
    AND?: InviteTokenWhereInput | InviteTokenWhereInput[]
    OR?: InviteTokenWhereInput[]
    NOT?: InviteTokenWhereInput | InviteTokenWhereInput[]
    tenantId?: StringFilter<"InviteToken"> | string
    email?: StringFilter<"InviteToken"> | string
    role?: EnumUserRoleFilter<"InviteToken"> | $Enums.UserRole
    expiresAt?: DateTimeFilter<"InviteToken"> | Date | string
    usedAt?: DateTimeNullableFilter<"InviteToken"> | Date | string | null
    invitedByUserId?: StringFilter<"InviteToken"> | string
    createdAt?: DateTimeFilter<"InviteToken"> | Date | string
    invitedBy?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "token">

  export type InviteTokenOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    email?: SortOrder
    role?: SortOrder
    token?: SortOrder
    expiresAt?: SortOrder
    usedAt?: SortOrderInput | SortOrder
    invitedByUserId?: SortOrder
    createdAt?: SortOrder
    _count?: InviteTokenCountOrderByAggregateInput
    _max?: InviteTokenMaxOrderByAggregateInput
    _min?: InviteTokenMinOrderByAggregateInput
  }

  export type InviteTokenScalarWhereWithAggregatesInput = {
    AND?: InviteTokenScalarWhereWithAggregatesInput | InviteTokenScalarWhereWithAggregatesInput[]
    OR?: InviteTokenScalarWhereWithAggregatesInput[]
    NOT?: InviteTokenScalarWhereWithAggregatesInput | InviteTokenScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"InviteToken"> | string
    tenantId?: StringWithAggregatesFilter<"InviteToken"> | string
    email?: StringWithAggregatesFilter<"InviteToken"> | string
    role?: EnumUserRoleWithAggregatesFilter<"InviteToken"> | $Enums.UserRole
    token?: StringWithAggregatesFilter<"InviteToken"> | string
    expiresAt?: DateTimeWithAggregatesFilter<"InviteToken"> | Date | string
    usedAt?: DateTimeNullableWithAggregatesFilter<"InviteToken"> | Date | string | null
    invitedByUserId?: StringWithAggregatesFilter<"InviteToken"> | string
    createdAt?: DateTimeWithAggregatesFilter<"InviteToken"> | Date | string
  }

  export type AuditEventWhereInput = {
    AND?: AuditEventWhereInput | AuditEventWhereInput[]
    OR?: AuditEventWhereInput[]
    NOT?: AuditEventWhereInput | AuditEventWhereInput[]
    id?: StringFilter<"AuditEvent"> | string
    tenantId?: StringNullableFilter<"AuditEvent"> | string | null
    actorUserId?: StringNullableFilter<"AuditEvent"> | string | null
    action?: StringFilter<"AuditEvent"> | string
    resourceType?: StringFilter<"AuditEvent"> | string
    resourceId?: StringFilter<"AuditEvent"> | string
    metadata?: JsonFilter<"AuditEvent">
    ipAddress?: StringNullableFilter<"AuditEvent"> | string | null
    createdAt?: DateTimeFilter<"AuditEvent"> | Date | string
  }

  export type AuditEventOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrderInput | SortOrder
    actorUserId?: SortOrderInput | SortOrder
    action?: SortOrder
    resourceType?: SortOrder
    resourceId?: SortOrder
    metadata?: SortOrder
    ipAddress?: SortOrderInput | SortOrder
    createdAt?: SortOrder
  }

  export type AuditEventWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: AuditEventWhereInput | AuditEventWhereInput[]
    OR?: AuditEventWhereInput[]
    NOT?: AuditEventWhereInput | AuditEventWhereInput[]
    tenantId?: StringNullableFilter<"AuditEvent"> | string | null
    actorUserId?: StringNullableFilter<"AuditEvent"> | string | null
    action?: StringFilter<"AuditEvent"> | string
    resourceType?: StringFilter<"AuditEvent"> | string
    resourceId?: StringFilter<"AuditEvent"> | string
    metadata?: JsonFilter<"AuditEvent">
    ipAddress?: StringNullableFilter<"AuditEvent"> | string | null
    createdAt?: DateTimeFilter<"AuditEvent"> | Date | string
  }, "id">

  export type AuditEventOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrderInput | SortOrder
    actorUserId?: SortOrderInput | SortOrder
    action?: SortOrder
    resourceType?: SortOrder
    resourceId?: SortOrder
    metadata?: SortOrder
    ipAddress?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: AuditEventCountOrderByAggregateInput
    _max?: AuditEventMaxOrderByAggregateInput
    _min?: AuditEventMinOrderByAggregateInput
  }

  export type AuditEventScalarWhereWithAggregatesInput = {
    AND?: AuditEventScalarWhereWithAggregatesInput | AuditEventScalarWhereWithAggregatesInput[]
    OR?: AuditEventScalarWhereWithAggregatesInput[]
    NOT?: AuditEventScalarWhereWithAggregatesInput | AuditEventScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"AuditEvent"> | string
    tenantId?: StringNullableWithAggregatesFilter<"AuditEvent"> | string | null
    actorUserId?: StringNullableWithAggregatesFilter<"AuditEvent"> | string | null
    action?: StringWithAggregatesFilter<"AuditEvent"> | string
    resourceType?: StringWithAggregatesFilter<"AuditEvent"> | string
    resourceId?: StringWithAggregatesFilter<"AuditEvent"> | string
    metadata?: JsonWithAggregatesFilter<"AuditEvent">
    ipAddress?: StringNullableWithAggregatesFilter<"AuditEvent"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"AuditEvent"> | Date | string
  }

  export type TenantSsoWhereInput = {
    AND?: TenantSsoWhereInput | TenantSsoWhereInput[]
    OR?: TenantSsoWhereInput[]
    NOT?: TenantSsoWhereInput | TenantSsoWhereInput[]
    id?: StringFilter<"TenantSso"> | string
    tenantId?: StringFilter<"TenantSso"> | string
    protocol?: EnumSsoProtocolFilter<"TenantSso"> | $Enums.SsoProtocol
    status?: EnumSsoStatusFilter<"TenantSso"> | $Enums.SsoStatus
    samlEntryPoint?: StringNullableFilter<"TenantSso"> | string | null
    samlIssuer?: StringNullableFilter<"TenantSso"> | string | null
    samlCertificate?: StringNullableFilter<"TenantSso"> | string | null
    oidcIssuerUrl?: StringNullableFilter<"TenantSso"> | string | null
    oidcClientId?: StringNullableFilter<"TenantSso"> | string | null
    oidcClientSecret?: StringNullableFilter<"TenantSso"> | string | null
    emailDomains?: StringNullableListFilter<"TenantSso">
    attrEmail?: StringFilter<"TenantSso"> | string
    attrFirstName?: StringFilter<"TenantSso"> | string
    attrLastName?: StringFilter<"TenantSso"> | string
    attrGroups?: StringFilter<"TenantSso"> | string
    roleMap?: JsonFilter<"TenantSso">
    defaultRole?: EnumUserRoleFilter<"TenantSso"> | $Enums.UserRole
    createdAt?: DateTimeFilter<"TenantSso"> | Date | string
    updatedAt?: DateTimeFilter<"TenantSso"> | Date | string
  }

  export type TenantSsoOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    protocol?: SortOrder
    status?: SortOrder
    samlEntryPoint?: SortOrderInput | SortOrder
    samlIssuer?: SortOrderInput | SortOrder
    samlCertificate?: SortOrderInput | SortOrder
    oidcIssuerUrl?: SortOrderInput | SortOrder
    oidcClientId?: SortOrderInput | SortOrder
    oidcClientSecret?: SortOrderInput | SortOrder
    emailDomains?: SortOrder
    attrEmail?: SortOrder
    attrFirstName?: SortOrder
    attrLastName?: SortOrder
    attrGroups?: SortOrder
    roleMap?: SortOrder
    defaultRole?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TenantSsoWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    tenantId?: string
    AND?: TenantSsoWhereInput | TenantSsoWhereInput[]
    OR?: TenantSsoWhereInput[]
    NOT?: TenantSsoWhereInput | TenantSsoWhereInput[]
    protocol?: EnumSsoProtocolFilter<"TenantSso"> | $Enums.SsoProtocol
    status?: EnumSsoStatusFilter<"TenantSso"> | $Enums.SsoStatus
    samlEntryPoint?: StringNullableFilter<"TenantSso"> | string | null
    samlIssuer?: StringNullableFilter<"TenantSso"> | string | null
    samlCertificate?: StringNullableFilter<"TenantSso"> | string | null
    oidcIssuerUrl?: StringNullableFilter<"TenantSso"> | string | null
    oidcClientId?: StringNullableFilter<"TenantSso"> | string | null
    oidcClientSecret?: StringNullableFilter<"TenantSso"> | string | null
    emailDomains?: StringNullableListFilter<"TenantSso">
    attrEmail?: StringFilter<"TenantSso"> | string
    attrFirstName?: StringFilter<"TenantSso"> | string
    attrLastName?: StringFilter<"TenantSso"> | string
    attrGroups?: StringFilter<"TenantSso"> | string
    roleMap?: JsonFilter<"TenantSso">
    defaultRole?: EnumUserRoleFilter<"TenantSso"> | $Enums.UserRole
    createdAt?: DateTimeFilter<"TenantSso"> | Date | string
    updatedAt?: DateTimeFilter<"TenantSso"> | Date | string
  }, "id" | "tenantId">

  export type TenantSsoOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    protocol?: SortOrder
    status?: SortOrder
    samlEntryPoint?: SortOrderInput | SortOrder
    samlIssuer?: SortOrderInput | SortOrder
    samlCertificate?: SortOrderInput | SortOrder
    oidcIssuerUrl?: SortOrderInput | SortOrder
    oidcClientId?: SortOrderInput | SortOrder
    oidcClientSecret?: SortOrderInput | SortOrder
    emailDomains?: SortOrder
    attrEmail?: SortOrder
    attrFirstName?: SortOrder
    attrLastName?: SortOrder
    attrGroups?: SortOrder
    roleMap?: SortOrder
    defaultRole?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: TenantSsoCountOrderByAggregateInput
    _max?: TenantSsoMaxOrderByAggregateInput
    _min?: TenantSsoMinOrderByAggregateInput
  }

  export type TenantSsoScalarWhereWithAggregatesInput = {
    AND?: TenantSsoScalarWhereWithAggregatesInput | TenantSsoScalarWhereWithAggregatesInput[]
    OR?: TenantSsoScalarWhereWithAggregatesInput[]
    NOT?: TenantSsoScalarWhereWithAggregatesInput | TenantSsoScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"TenantSso"> | string
    tenantId?: StringWithAggregatesFilter<"TenantSso"> | string
    protocol?: EnumSsoProtocolWithAggregatesFilter<"TenantSso"> | $Enums.SsoProtocol
    status?: EnumSsoStatusWithAggregatesFilter<"TenantSso"> | $Enums.SsoStatus
    samlEntryPoint?: StringNullableWithAggregatesFilter<"TenantSso"> | string | null
    samlIssuer?: StringNullableWithAggregatesFilter<"TenantSso"> | string | null
    samlCertificate?: StringNullableWithAggregatesFilter<"TenantSso"> | string | null
    oidcIssuerUrl?: StringNullableWithAggregatesFilter<"TenantSso"> | string | null
    oidcClientId?: StringNullableWithAggregatesFilter<"TenantSso"> | string | null
    oidcClientSecret?: StringNullableWithAggregatesFilter<"TenantSso"> | string | null
    emailDomains?: StringNullableListFilter<"TenantSso">
    attrEmail?: StringWithAggregatesFilter<"TenantSso"> | string
    attrFirstName?: StringWithAggregatesFilter<"TenantSso"> | string
    attrLastName?: StringWithAggregatesFilter<"TenantSso"> | string
    attrGroups?: StringWithAggregatesFilter<"TenantSso"> | string
    roleMap?: JsonWithAggregatesFilter<"TenantSso">
    defaultRole?: EnumUserRoleWithAggregatesFilter<"TenantSso"> | $Enums.UserRole
    createdAt?: DateTimeWithAggregatesFilter<"TenantSso"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"TenantSso"> | Date | string
  }

  export type SsoLoginAuditWhereInput = {
    AND?: SsoLoginAuditWhereInput | SsoLoginAuditWhereInput[]
    OR?: SsoLoginAuditWhereInput[]
    NOT?: SsoLoginAuditWhereInput | SsoLoginAuditWhereInput[]
    id?: StringFilter<"SsoLoginAudit"> | string
    tenantId?: StringFilter<"SsoLoginAudit"> | string
    email?: StringFilter<"SsoLoginAudit"> | string
    protocol?: EnumSsoProtocolFilter<"SsoLoginAudit"> | $Enums.SsoProtocol
    outcome?: StringFilter<"SsoLoginAudit"> | string
    ipAddress?: StringNullableFilter<"SsoLoginAudit"> | string | null
    userAgent?: StringNullableFilter<"SsoLoginAudit"> | string | null
    userId?: StringNullableFilter<"SsoLoginAudit"> | string | null
    createdAt?: DateTimeFilter<"SsoLoginAudit"> | Date | string
  }

  export type SsoLoginAuditOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    email?: SortOrder
    protocol?: SortOrder
    outcome?: SortOrder
    ipAddress?: SortOrderInput | SortOrder
    userAgent?: SortOrderInput | SortOrder
    userId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
  }

  export type SsoLoginAuditWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: SsoLoginAuditWhereInput | SsoLoginAuditWhereInput[]
    OR?: SsoLoginAuditWhereInput[]
    NOT?: SsoLoginAuditWhereInput | SsoLoginAuditWhereInput[]
    tenantId?: StringFilter<"SsoLoginAudit"> | string
    email?: StringFilter<"SsoLoginAudit"> | string
    protocol?: EnumSsoProtocolFilter<"SsoLoginAudit"> | $Enums.SsoProtocol
    outcome?: StringFilter<"SsoLoginAudit"> | string
    ipAddress?: StringNullableFilter<"SsoLoginAudit"> | string | null
    userAgent?: StringNullableFilter<"SsoLoginAudit"> | string | null
    userId?: StringNullableFilter<"SsoLoginAudit"> | string | null
    createdAt?: DateTimeFilter<"SsoLoginAudit"> | Date | string
  }, "id">

  export type SsoLoginAuditOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    email?: SortOrder
    protocol?: SortOrder
    outcome?: SortOrder
    ipAddress?: SortOrderInput | SortOrder
    userAgent?: SortOrderInput | SortOrder
    userId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: SsoLoginAuditCountOrderByAggregateInput
    _max?: SsoLoginAuditMaxOrderByAggregateInput
    _min?: SsoLoginAuditMinOrderByAggregateInput
  }

  export type SsoLoginAuditScalarWhereWithAggregatesInput = {
    AND?: SsoLoginAuditScalarWhereWithAggregatesInput | SsoLoginAuditScalarWhereWithAggregatesInput[]
    OR?: SsoLoginAuditScalarWhereWithAggregatesInput[]
    NOT?: SsoLoginAuditScalarWhereWithAggregatesInput | SsoLoginAuditScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"SsoLoginAudit"> | string
    tenantId?: StringWithAggregatesFilter<"SsoLoginAudit"> | string
    email?: StringWithAggregatesFilter<"SsoLoginAudit"> | string
    protocol?: EnumSsoProtocolWithAggregatesFilter<"SsoLoginAudit"> | $Enums.SsoProtocol
    outcome?: StringWithAggregatesFilter<"SsoLoginAudit"> | string
    ipAddress?: StringNullableWithAggregatesFilter<"SsoLoginAudit"> | string | null
    userAgent?: StringNullableWithAggregatesFilter<"SsoLoginAudit"> | string | null
    userId?: StringNullableWithAggregatesFilter<"SsoLoginAudit"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"SsoLoginAudit"> | Date | string
  }

  export type DashboardLayoutWhereInput = {
    AND?: DashboardLayoutWhereInput | DashboardLayoutWhereInput[]
    OR?: DashboardLayoutWhereInput[]
    NOT?: DashboardLayoutWhereInput | DashboardLayoutWhereInput[]
    id?: StringFilter<"DashboardLayout"> | string
    tenantId?: StringFilter<"DashboardLayout"> | string
    userId?: StringNullableFilter<"DashboardLayout"> | string | null
    scope?: StringFilter<"DashboardLayout"> | string
    dashboardKey?: StringFilter<"DashboardLayout"> | string
    name?: StringFilter<"DashboardLayout"> | string
    document?: JsonFilter<"DashboardLayout">
    schemaVersion?: IntFilter<"DashboardLayout"> | number
    isDefault?: BoolFilter<"DashboardLayout"> | boolean
    updatedBy?: StringFilter<"DashboardLayout"> | string
    createdAt?: DateTimeFilter<"DashboardLayout"> | Date | string
    updatedAt?: DateTimeFilter<"DashboardLayout"> | Date | string
  }

  export type DashboardLayoutOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    userId?: SortOrderInput | SortOrder
    scope?: SortOrder
    dashboardKey?: SortOrder
    name?: SortOrder
    document?: SortOrder
    schemaVersion?: SortOrder
    isDefault?: SortOrder
    updatedBy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DashboardLayoutWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    tenantId_userId_dashboardKey?: DashboardLayoutTenantIdUserIdDashboardKeyCompoundUniqueInput
    AND?: DashboardLayoutWhereInput | DashboardLayoutWhereInput[]
    OR?: DashboardLayoutWhereInput[]
    NOT?: DashboardLayoutWhereInput | DashboardLayoutWhereInput[]
    tenantId?: StringFilter<"DashboardLayout"> | string
    userId?: StringNullableFilter<"DashboardLayout"> | string | null
    scope?: StringFilter<"DashboardLayout"> | string
    dashboardKey?: StringFilter<"DashboardLayout"> | string
    name?: StringFilter<"DashboardLayout"> | string
    document?: JsonFilter<"DashboardLayout">
    schemaVersion?: IntFilter<"DashboardLayout"> | number
    isDefault?: BoolFilter<"DashboardLayout"> | boolean
    updatedBy?: StringFilter<"DashboardLayout"> | string
    createdAt?: DateTimeFilter<"DashboardLayout"> | Date | string
    updatedAt?: DateTimeFilter<"DashboardLayout"> | Date | string
  }, "id" | "tenantId_userId_dashboardKey">

  export type DashboardLayoutOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    userId?: SortOrderInput | SortOrder
    scope?: SortOrder
    dashboardKey?: SortOrder
    name?: SortOrder
    document?: SortOrder
    schemaVersion?: SortOrder
    isDefault?: SortOrder
    updatedBy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: DashboardLayoutCountOrderByAggregateInput
    _avg?: DashboardLayoutAvgOrderByAggregateInput
    _max?: DashboardLayoutMaxOrderByAggregateInput
    _min?: DashboardLayoutMinOrderByAggregateInput
    _sum?: DashboardLayoutSumOrderByAggregateInput
  }

  export type DashboardLayoutScalarWhereWithAggregatesInput = {
    AND?: DashboardLayoutScalarWhereWithAggregatesInput | DashboardLayoutScalarWhereWithAggregatesInput[]
    OR?: DashboardLayoutScalarWhereWithAggregatesInput[]
    NOT?: DashboardLayoutScalarWhereWithAggregatesInput | DashboardLayoutScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"DashboardLayout"> | string
    tenantId?: StringWithAggregatesFilter<"DashboardLayout"> | string
    userId?: StringNullableWithAggregatesFilter<"DashboardLayout"> | string | null
    scope?: StringWithAggregatesFilter<"DashboardLayout"> | string
    dashboardKey?: StringWithAggregatesFilter<"DashboardLayout"> | string
    name?: StringWithAggregatesFilter<"DashboardLayout"> | string
    document?: JsonWithAggregatesFilter<"DashboardLayout">
    schemaVersion?: IntWithAggregatesFilter<"DashboardLayout"> | number
    isDefault?: BoolWithAggregatesFilter<"DashboardLayout"> | boolean
    updatedBy?: StringWithAggregatesFilter<"DashboardLayout"> | string
    createdAt?: DateTimeWithAggregatesFilter<"DashboardLayout"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"DashboardLayout"> | Date | string
  }

  export type UserUiPrefsWhereInput = {
    AND?: UserUiPrefsWhereInput | UserUiPrefsWhereInput[]
    OR?: UserUiPrefsWhereInput[]
    NOT?: UserUiPrefsWhereInput | UserUiPrefsWhereInput[]
    id?: StringFilter<"UserUiPrefs"> | string
    tenantId?: StringFilter<"UserUiPrefs"> | string
    userId?: StringFilter<"UserUiPrefs"> | string
    colorMode?: StringFilter<"UserUiPrefs"> | string
    density?: StringFilter<"UserUiPrefs"> | string
    locale?: StringNullableFilter<"UserUiPrefs"> | string | null
    timezone?: StringNullableFilter<"UserUiPrefs"> | string | null
    accentOverride?: StringNullableFilter<"UserUiPrefs"> | string | null
    prefs?: JsonFilter<"UserUiPrefs">
    updatedAt?: DateTimeFilter<"UserUiPrefs"> | Date | string
  }

  export type UserUiPrefsOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    userId?: SortOrder
    colorMode?: SortOrder
    density?: SortOrder
    locale?: SortOrderInput | SortOrder
    timezone?: SortOrderInput | SortOrder
    accentOverride?: SortOrderInput | SortOrder
    prefs?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserUiPrefsWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    userId?: string
    AND?: UserUiPrefsWhereInput | UserUiPrefsWhereInput[]
    OR?: UserUiPrefsWhereInput[]
    NOT?: UserUiPrefsWhereInput | UserUiPrefsWhereInput[]
    tenantId?: StringFilter<"UserUiPrefs"> | string
    colorMode?: StringFilter<"UserUiPrefs"> | string
    density?: StringFilter<"UserUiPrefs"> | string
    locale?: StringNullableFilter<"UserUiPrefs"> | string | null
    timezone?: StringNullableFilter<"UserUiPrefs"> | string | null
    accentOverride?: StringNullableFilter<"UserUiPrefs"> | string | null
    prefs?: JsonFilter<"UserUiPrefs">
    updatedAt?: DateTimeFilter<"UserUiPrefs"> | Date | string
  }, "id" | "userId">

  export type UserUiPrefsOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    userId?: SortOrder
    colorMode?: SortOrder
    density?: SortOrder
    locale?: SortOrderInput | SortOrder
    timezone?: SortOrderInput | SortOrder
    accentOverride?: SortOrderInput | SortOrder
    prefs?: SortOrder
    updatedAt?: SortOrder
    _count?: UserUiPrefsCountOrderByAggregateInput
    _max?: UserUiPrefsMaxOrderByAggregateInput
    _min?: UserUiPrefsMinOrderByAggregateInput
  }

  export type UserUiPrefsScalarWhereWithAggregatesInput = {
    AND?: UserUiPrefsScalarWhereWithAggregatesInput | UserUiPrefsScalarWhereWithAggregatesInput[]
    OR?: UserUiPrefsScalarWhereWithAggregatesInput[]
    NOT?: UserUiPrefsScalarWhereWithAggregatesInput | UserUiPrefsScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"UserUiPrefs"> | string
    tenantId?: StringWithAggregatesFilter<"UserUiPrefs"> | string
    userId?: StringWithAggregatesFilter<"UserUiPrefs"> | string
    colorMode?: StringWithAggregatesFilter<"UserUiPrefs"> | string
    density?: StringWithAggregatesFilter<"UserUiPrefs"> | string
    locale?: StringNullableWithAggregatesFilter<"UserUiPrefs"> | string | null
    timezone?: StringNullableWithAggregatesFilter<"UserUiPrefs"> | string | null
    accentOverride?: StringNullableWithAggregatesFilter<"UserUiPrefs"> | string | null
    prefs?: JsonWithAggregatesFilter<"UserUiPrefs">
    updatedAt?: DateTimeWithAggregatesFilter<"UserUiPrefs"> | Date | string
  }

  export type UserCreateInput = {
    id?: string
    tenantId: string
    email: string
    passwordHash: string
    firstName: string
    lastName: string
    role?: $Enums.UserRole
    department?: string | null
    isActive?: boolean
    lastLoginAt?: Date | string | null
    mfaSecret?: string | null
    mfaEnabled?: boolean
    externalId?: string | null
    ssoLastLogin?: Date | string | null
    emailVerified?: boolean
    emailVerifiedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    managerId?: string | null
    inviteTokens?: InviteTokenCreateNestedManyWithoutInvitedByInput
    passwordResets?: PasswordResetCreateNestedManyWithoutUserInput
    emailVerifications?: EmailVerificationCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    tenantId: string
    email: string
    passwordHash: string
    firstName: string
    lastName: string
    role?: $Enums.UserRole
    department?: string | null
    isActive?: boolean
    lastLoginAt?: Date | string | null
    mfaSecret?: string | null
    mfaEnabled?: boolean
    externalId?: string | null
    ssoLastLogin?: Date | string | null
    emailVerified?: boolean
    emailVerifiedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    managerId?: string | null
    inviteTokens?: InviteTokenUncheckedCreateNestedManyWithoutInvitedByInput
    passwordResets?: PasswordResetUncheckedCreateNestedManyWithoutUserInput
    emailVerifications?: EmailVerificationUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    department?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    mfaSecret?: NullableStringFieldUpdateOperationsInput | string | null
    mfaEnabled?: BoolFieldUpdateOperationsInput | boolean
    externalId?: NullableStringFieldUpdateOperationsInput | string | null
    ssoLastLogin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    emailVerified?: BoolFieldUpdateOperationsInput | boolean
    emailVerifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    managerId?: NullableStringFieldUpdateOperationsInput | string | null
    inviteTokens?: InviteTokenUpdateManyWithoutInvitedByNestedInput
    passwordResets?: PasswordResetUpdateManyWithoutUserNestedInput
    emailVerifications?: EmailVerificationUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    department?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    mfaSecret?: NullableStringFieldUpdateOperationsInput | string | null
    mfaEnabled?: BoolFieldUpdateOperationsInput | boolean
    externalId?: NullableStringFieldUpdateOperationsInput | string | null
    ssoLastLogin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    emailVerified?: BoolFieldUpdateOperationsInput | boolean
    emailVerifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    managerId?: NullableStringFieldUpdateOperationsInput | string | null
    inviteTokens?: InviteTokenUncheckedUpdateManyWithoutInvitedByNestedInput
    passwordResets?: PasswordResetUncheckedUpdateManyWithoutUserNestedInput
    emailVerifications?: EmailVerificationUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    tenantId: string
    email: string
    passwordHash: string
    firstName: string
    lastName: string
    role?: $Enums.UserRole
    department?: string | null
    isActive?: boolean
    lastLoginAt?: Date | string | null
    mfaSecret?: string | null
    mfaEnabled?: boolean
    externalId?: string | null
    ssoLastLogin?: Date | string | null
    emailVerified?: boolean
    emailVerifiedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    managerId?: string | null
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    department?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    mfaSecret?: NullableStringFieldUpdateOperationsInput | string | null
    mfaEnabled?: BoolFieldUpdateOperationsInput | boolean
    externalId?: NullableStringFieldUpdateOperationsInput | string | null
    ssoLastLogin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    emailVerified?: BoolFieldUpdateOperationsInput | boolean
    emailVerifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    managerId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    department?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    mfaSecret?: NullableStringFieldUpdateOperationsInput | string | null
    mfaEnabled?: BoolFieldUpdateOperationsInput | boolean
    externalId?: NullableStringFieldUpdateOperationsInput | string | null
    ssoLastLogin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    emailVerified?: BoolFieldUpdateOperationsInput | boolean
    emailVerifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    managerId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type TenantApiKeyCreateInput = {
    id?: string
    tenantId: string
    name: string
    keyPrefix: string
    keyHash: string
    createdByUserId: string
    createdAt?: Date | string
    lastUsedAt?: Date | string | null
    revokedAt?: Date | string | null
    scopes?: TenantApiKeyCreatescopesInput | string[]
  }

  export type TenantApiKeyUncheckedCreateInput = {
    id?: string
    tenantId: string
    name: string
    keyPrefix: string
    keyHash: string
    createdByUserId: string
    createdAt?: Date | string
    lastUsedAt?: Date | string | null
    revokedAt?: Date | string | null
    scopes?: TenantApiKeyCreatescopesInput | string[]
  }

  export type TenantApiKeyUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    keyPrefix?: StringFieldUpdateOperationsInput | string
    keyHash?: StringFieldUpdateOperationsInput | string
    createdByUserId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastUsedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    revokedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scopes?: TenantApiKeyUpdatescopesInput | string[]
  }

  export type TenantApiKeyUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    keyPrefix?: StringFieldUpdateOperationsInput | string
    keyHash?: StringFieldUpdateOperationsInput | string
    createdByUserId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastUsedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    revokedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scopes?: TenantApiKeyUpdatescopesInput | string[]
  }

  export type TenantApiKeyCreateManyInput = {
    id?: string
    tenantId: string
    name: string
    keyPrefix: string
    keyHash: string
    createdByUserId: string
    createdAt?: Date | string
    lastUsedAt?: Date | string | null
    revokedAt?: Date | string | null
    scopes?: TenantApiKeyCreatescopesInput | string[]
  }

  export type TenantApiKeyUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    keyPrefix?: StringFieldUpdateOperationsInput | string
    keyHash?: StringFieldUpdateOperationsInput | string
    createdByUserId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastUsedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    revokedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scopes?: TenantApiKeyUpdatescopesInput | string[]
  }

  export type TenantApiKeyUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    keyPrefix?: StringFieldUpdateOperationsInput | string
    keyHash?: StringFieldUpdateOperationsInput | string
    createdByUserId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastUsedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    revokedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scopes?: TenantApiKeyUpdatescopesInput | string[]
  }

  export type EmailVerificationCreateInput = {
    id?: string
    email: string
    token?: string
    expiresAt: Date | string
    usedAt?: Date | string | null
    createdAt?: Date | string
    user: UserCreateNestedOneWithoutEmailVerificationsInput
  }

  export type EmailVerificationUncheckedCreateInput = {
    id?: string
    userId: string
    email: string
    token?: string
    expiresAt: Date | string
    usedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type EmailVerificationUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutEmailVerificationsNestedInput
  }

  export type EmailVerificationUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EmailVerificationCreateManyInput = {
    id?: string
    userId: string
    email: string
    token?: string
    expiresAt: Date | string
    usedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type EmailVerificationUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EmailVerificationUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PasswordResetCreateInput = {
    id?: string
    token?: string
    expiresAt: Date | string
    usedAt?: Date | string | null
    createdAt?: Date | string
    user: UserCreateNestedOneWithoutPasswordResetsInput
  }

  export type PasswordResetUncheckedCreateInput = {
    id?: string
    userId: string
    token?: string
    expiresAt: Date | string
    usedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type PasswordResetUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutPasswordResetsNestedInput
  }

  export type PasswordResetUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PasswordResetCreateManyInput = {
    id?: string
    userId: string
    token?: string
    expiresAt: Date | string
    usedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type PasswordResetUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PasswordResetUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InviteTokenCreateInput = {
    id?: string
    tenantId: string
    email: string
    role?: $Enums.UserRole
    token?: string
    expiresAt: Date | string
    usedAt?: Date | string | null
    createdAt?: Date | string
    invitedBy: UserCreateNestedOneWithoutInviteTokensInput
  }

  export type InviteTokenUncheckedCreateInput = {
    id?: string
    tenantId: string
    email: string
    role?: $Enums.UserRole
    token?: string
    expiresAt: Date | string
    usedAt?: Date | string | null
    invitedByUserId: string
    createdAt?: Date | string
  }

  export type InviteTokenUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    token?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    invitedBy?: UserUpdateOneRequiredWithoutInviteTokensNestedInput
  }

  export type InviteTokenUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    token?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    invitedByUserId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InviteTokenCreateManyInput = {
    id?: string
    tenantId: string
    email: string
    role?: $Enums.UserRole
    token?: string
    expiresAt: Date | string
    usedAt?: Date | string | null
    invitedByUserId: string
    createdAt?: Date | string
  }

  export type InviteTokenUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    token?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InviteTokenUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    token?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    invitedByUserId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditEventCreateInput = {
    id?: string
    tenantId?: string | null
    actorUserId?: string | null
    action: string
    resourceType: string
    resourceId: string
    metadata?: JsonNullValueInput | InputJsonValue
    ipAddress?: string | null
    createdAt?: Date | string
  }

  export type AuditEventUncheckedCreateInput = {
    id?: string
    tenantId?: string | null
    actorUserId?: string | null
    action: string
    resourceType: string
    resourceId: string
    metadata?: JsonNullValueInput | InputJsonValue
    ipAddress?: string | null
    createdAt?: Date | string
  }

  export type AuditEventUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    actorUserId?: NullableStringFieldUpdateOperationsInput | string | null
    action?: StringFieldUpdateOperationsInput | string
    resourceType?: StringFieldUpdateOperationsInput | string
    resourceId?: StringFieldUpdateOperationsInput | string
    metadata?: JsonNullValueInput | InputJsonValue
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditEventUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    actorUserId?: NullableStringFieldUpdateOperationsInput | string | null
    action?: StringFieldUpdateOperationsInput | string
    resourceType?: StringFieldUpdateOperationsInput | string
    resourceId?: StringFieldUpdateOperationsInput | string
    metadata?: JsonNullValueInput | InputJsonValue
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditEventCreateManyInput = {
    id?: string
    tenantId?: string | null
    actorUserId?: string | null
    action: string
    resourceType: string
    resourceId: string
    metadata?: JsonNullValueInput | InputJsonValue
    ipAddress?: string | null
    createdAt?: Date | string
  }

  export type AuditEventUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    actorUserId?: NullableStringFieldUpdateOperationsInput | string | null
    action?: StringFieldUpdateOperationsInput | string
    resourceType?: StringFieldUpdateOperationsInput | string
    resourceId?: StringFieldUpdateOperationsInput | string
    metadata?: JsonNullValueInput | InputJsonValue
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditEventUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    actorUserId?: NullableStringFieldUpdateOperationsInput | string | null
    action?: StringFieldUpdateOperationsInput | string
    resourceType?: StringFieldUpdateOperationsInput | string
    resourceId?: StringFieldUpdateOperationsInput | string
    metadata?: JsonNullValueInput | InputJsonValue
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantSsoCreateInput = {
    id?: string
    tenantId: string
    protocol: $Enums.SsoProtocol
    status?: $Enums.SsoStatus
    samlEntryPoint?: string | null
    samlIssuer?: string | null
    samlCertificate?: string | null
    oidcIssuerUrl?: string | null
    oidcClientId?: string | null
    oidcClientSecret?: string | null
    emailDomains?: TenantSsoCreateemailDomainsInput | string[]
    attrEmail?: string
    attrFirstName?: string
    attrLastName?: string
    attrGroups?: string
    roleMap?: JsonNullValueInput | InputJsonValue
    defaultRole?: $Enums.UserRole
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantSsoUncheckedCreateInput = {
    id?: string
    tenantId: string
    protocol: $Enums.SsoProtocol
    status?: $Enums.SsoStatus
    samlEntryPoint?: string | null
    samlIssuer?: string | null
    samlCertificate?: string | null
    oidcIssuerUrl?: string | null
    oidcClientId?: string | null
    oidcClientSecret?: string | null
    emailDomains?: TenantSsoCreateemailDomainsInput | string[]
    attrEmail?: string
    attrFirstName?: string
    attrLastName?: string
    attrGroups?: string
    roleMap?: JsonNullValueInput | InputJsonValue
    defaultRole?: $Enums.UserRole
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantSsoUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    protocol?: EnumSsoProtocolFieldUpdateOperationsInput | $Enums.SsoProtocol
    status?: EnumSsoStatusFieldUpdateOperationsInput | $Enums.SsoStatus
    samlEntryPoint?: NullableStringFieldUpdateOperationsInput | string | null
    samlIssuer?: NullableStringFieldUpdateOperationsInput | string | null
    samlCertificate?: NullableStringFieldUpdateOperationsInput | string | null
    oidcIssuerUrl?: NullableStringFieldUpdateOperationsInput | string | null
    oidcClientId?: NullableStringFieldUpdateOperationsInput | string | null
    oidcClientSecret?: NullableStringFieldUpdateOperationsInput | string | null
    emailDomains?: TenantSsoUpdateemailDomainsInput | string[]
    attrEmail?: StringFieldUpdateOperationsInput | string
    attrFirstName?: StringFieldUpdateOperationsInput | string
    attrLastName?: StringFieldUpdateOperationsInput | string
    attrGroups?: StringFieldUpdateOperationsInput | string
    roleMap?: JsonNullValueInput | InputJsonValue
    defaultRole?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantSsoUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    protocol?: EnumSsoProtocolFieldUpdateOperationsInput | $Enums.SsoProtocol
    status?: EnumSsoStatusFieldUpdateOperationsInput | $Enums.SsoStatus
    samlEntryPoint?: NullableStringFieldUpdateOperationsInput | string | null
    samlIssuer?: NullableStringFieldUpdateOperationsInput | string | null
    samlCertificate?: NullableStringFieldUpdateOperationsInput | string | null
    oidcIssuerUrl?: NullableStringFieldUpdateOperationsInput | string | null
    oidcClientId?: NullableStringFieldUpdateOperationsInput | string | null
    oidcClientSecret?: NullableStringFieldUpdateOperationsInput | string | null
    emailDomains?: TenantSsoUpdateemailDomainsInput | string[]
    attrEmail?: StringFieldUpdateOperationsInput | string
    attrFirstName?: StringFieldUpdateOperationsInput | string
    attrLastName?: StringFieldUpdateOperationsInput | string
    attrGroups?: StringFieldUpdateOperationsInput | string
    roleMap?: JsonNullValueInput | InputJsonValue
    defaultRole?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantSsoCreateManyInput = {
    id?: string
    tenantId: string
    protocol: $Enums.SsoProtocol
    status?: $Enums.SsoStatus
    samlEntryPoint?: string | null
    samlIssuer?: string | null
    samlCertificate?: string | null
    oidcIssuerUrl?: string | null
    oidcClientId?: string | null
    oidcClientSecret?: string | null
    emailDomains?: TenantSsoCreateemailDomainsInput | string[]
    attrEmail?: string
    attrFirstName?: string
    attrLastName?: string
    attrGroups?: string
    roleMap?: JsonNullValueInput | InputJsonValue
    defaultRole?: $Enums.UserRole
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantSsoUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    protocol?: EnumSsoProtocolFieldUpdateOperationsInput | $Enums.SsoProtocol
    status?: EnumSsoStatusFieldUpdateOperationsInput | $Enums.SsoStatus
    samlEntryPoint?: NullableStringFieldUpdateOperationsInput | string | null
    samlIssuer?: NullableStringFieldUpdateOperationsInput | string | null
    samlCertificate?: NullableStringFieldUpdateOperationsInput | string | null
    oidcIssuerUrl?: NullableStringFieldUpdateOperationsInput | string | null
    oidcClientId?: NullableStringFieldUpdateOperationsInput | string | null
    oidcClientSecret?: NullableStringFieldUpdateOperationsInput | string | null
    emailDomains?: TenantSsoUpdateemailDomainsInput | string[]
    attrEmail?: StringFieldUpdateOperationsInput | string
    attrFirstName?: StringFieldUpdateOperationsInput | string
    attrLastName?: StringFieldUpdateOperationsInput | string
    attrGroups?: StringFieldUpdateOperationsInput | string
    roleMap?: JsonNullValueInput | InputJsonValue
    defaultRole?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantSsoUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    protocol?: EnumSsoProtocolFieldUpdateOperationsInput | $Enums.SsoProtocol
    status?: EnumSsoStatusFieldUpdateOperationsInput | $Enums.SsoStatus
    samlEntryPoint?: NullableStringFieldUpdateOperationsInput | string | null
    samlIssuer?: NullableStringFieldUpdateOperationsInput | string | null
    samlCertificate?: NullableStringFieldUpdateOperationsInput | string | null
    oidcIssuerUrl?: NullableStringFieldUpdateOperationsInput | string | null
    oidcClientId?: NullableStringFieldUpdateOperationsInput | string | null
    oidcClientSecret?: NullableStringFieldUpdateOperationsInput | string | null
    emailDomains?: TenantSsoUpdateemailDomainsInput | string[]
    attrEmail?: StringFieldUpdateOperationsInput | string
    attrFirstName?: StringFieldUpdateOperationsInput | string
    attrLastName?: StringFieldUpdateOperationsInput | string
    attrGroups?: StringFieldUpdateOperationsInput | string
    roleMap?: JsonNullValueInput | InputJsonValue
    defaultRole?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SsoLoginAuditCreateInput = {
    id?: string
    tenantId: string
    email: string
    protocol: $Enums.SsoProtocol
    outcome: string
    ipAddress?: string | null
    userAgent?: string | null
    userId?: string | null
    createdAt?: Date | string
  }

  export type SsoLoginAuditUncheckedCreateInput = {
    id?: string
    tenantId: string
    email: string
    protocol: $Enums.SsoProtocol
    outcome: string
    ipAddress?: string | null
    userAgent?: string | null
    userId?: string | null
    createdAt?: Date | string
  }

  export type SsoLoginAuditUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    protocol?: EnumSsoProtocolFieldUpdateOperationsInput | $Enums.SsoProtocol
    outcome?: StringFieldUpdateOperationsInput | string
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SsoLoginAuditUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    protocol?: EnumSsoProtocolFieldUpdateOperationsInput | $Enums.SsoProtocol
    outcome?: StringFieldUpdateOperationsInput | string
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SsoLoginAuditCreateManyInput = {
    id?: string
    tenantId: string
    email: string
    protocol: $Enums.SsoProtocol
    outcome: string
    ipAddress?: string | null
    userAgent?: string | null
    userId?: string | null
    createdAt?: Date | string
  }

  export type SsoLoginAuditUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    protocol?: EnumSsoProtocolFieldUpdateOperationsInput | $Enums.SsoProtocol
    outcome?: StringFieldUpdateOperationsInput | string
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SsoLoginAuditUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    protocol?: EnumSsoProtocolFieldUpdateOperationsInput | $Enums.SsoProtocol
    outcome?: StringFieldUpdateOperationsInput | string
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DashboardLayoutCreateInput = {
    id?: string
    tenantId: string
    userId?: string | null
    scope: string
    dashboardKey?: string
    name: string
    document: JsonNullValueInput | InputJsonValue
    schemaVersion?: number
    isDefault?: boolean
    updatedBy: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DashboardLayoutUncheckedCreateInput = {
    id?: string
    tenantId: string
    userId?: string | null
    scope: string
    dashboardKey?: string
    name: string
    document: JsonNullValueInput | InputJsonValue
    schemaVersion?: number
    isDefault?: boolean
    updatedBy: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DashboardLayoutUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    scope?: StringFieldUpdateOperationsInput | string
    dashboardKey?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    document?: JsonNullValueInput | InputJsonValue
    schemaVersion?: IntFieldUpdateOperationsInput | number
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    updatedBy?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DashboardLayoutUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    scope?: StringFieldUpdateOperationsInput | string
    dashboardKey?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    document?: JsonNullValueInput | InputJsonValue
    schemaVersion?: IntFieldUpdateOperationsInput | number
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    updatedBy?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DashboardLayoutCreateManyInput = {
    id?: string
    tenantId: string
    userId?: string | null
    scope: string
    dashboardKey?: string
    name: string
    document: JsonNullValueInput | InputJsonValue
    schemaVersion?: number
    isDefault?: boolean
    updatedBy: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DashboardLayoutUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    scope?: StringFieldUpdateOperationsInput | string
    dashboardKey?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    document?: JsonNullValueInput | InputJsonValue
    schemaVersion?: IntFieldUpdateOperationsInput | number
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    updatedBy?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DashboardLayoutUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    scope?: StringFieldUpdateOperationsInput | string
    dashboardKey?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    document?: JsonNullValueInput | InputJsonValue
    schemaVersion?: IntFieldUpdateOperationsInput | number
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    updatedBy?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUiPrefsCreateInput = {
    id?: string
    tenantId: string
    userId: string
    colorMode?: string
    density?: string
    locale?: string | null
    timezone?: string | null
    accentOverride?: string | null
    prefs?: JsonNullValueInput | InputJsonValue
    updatedAt?: Date | string
  }

  export type UserUiPrefsUncheckedCreateInput = {
    id?: string
    tenantId: string
    userId: string
    colorMode?: string
    density?: string
    locale?: string | null
    timezone?: string | null
    accentOverride?: string | null
    prefs?: JsonNullValueInput | InputJsonValue
    updatedAt?: Date | string
  }

  export type UserUiPrefsUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    colorMode?: StringFieldUpdateOperationsInput | string
    density?: StringFieldUpdateOperationsInput | string
    locale?: NullableStringFieldUpdateOperationsInput | string | null
    timezone?: NullableStringFieldUpdateOperationsInput | string | null
    accentOverride?: NullableStringFieldUpdateOperationsInput | string | null
    prefs?: JsonNullValueInput | InputJsonValue
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUiPrefsUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    colorMode?: StringFieldUpdateOperationsInput | string
    density?: StringFieldUpdateOperationsInput | string
    locale?: NullableStringFieldUpdateOperationsInput | string | null
    timezone?: NullableStringFieldUpdateOperationsInput | string | null
    accentOverride?: NullableStringFieldUpdateOperationsInput | string | null
    prefs?: JsonNullValueInput | InputJsonValue
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUiPrefsCreateManyInput = {
    id?: string
    tenantId: string
    userId: string
    colorMode?: string
    density?: string
    locale?: string | null
    timezone?: string | null
    accentOverride?: string | null
    prefs?: JsonNullValueInput | InputJsonValue
    updatedAt?: Date | string
  }

  export type UserUiPrefsUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    colorMode?: StringFieldUpdateOperationsInput | string
    density?: StringFieldUpdateOperationsInput | string
    locale?: NullableStringFieldUpdateOperationsInput | string | null
    timezone?: NullableStringFieldUpdateOperationsInput | string | null
    accentOverride?: NullableStringFieldUpdateOperationsInput | string | null
    prefs?: JsonNullValueInput | InputJsonValue
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUiPrefsUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    colorMode?: StringFieldUpdateOperationsInput | string
    density?: StringFieldUpdateOperationsInput | string
    locale?: NullableStringFieldUpdateOperationsInput | string | null
    timezone?: NullableStringFieldUpdateOperationsInput | string | null
    accentOverride?: NullableStringFieldUpdateOperationsInput | string | null
    prefs?: JsonNullValueInput | InputJsonValue
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

  export type EnumUserRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserRoleFilter<$PrismaModel> | $Enums.UserRole
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

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
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

  export type InviteTokenListRelationFilter = {
    every?: InviteTokenWhereInput
    some?: InviteTokenWhereInput
    none?: InviteTokenWhereInput
  }

  export type PasswordResetListRelationFilter = {
    every?: PasswordResetWhereInput
    some?: PasswordResetWhereInput
    none?: PasswordResetWhereInput
  }

  export type EmailVerificationListRelationFilter = {
    every?: EmailVerificationWhereInput
    some?: EmailVerificationWhereInput
    none?: EmailVerificationWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type InviteTokenOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PasswordResetOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type EmailVerificationOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserTenantIdEmailCompoundUniqueInput = {
    tenantId: string
    email: string
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    role?: SortOrder
    department?: SortOrder
    isActive?: SortOrder
    lastLoginAt?: SortOrder
    mfaSecret?: SortOrder
    mfaEnabled?: SortOrder
    externalId?: SortOrder
    ssoLastLogin?: SortOrder
    emailVerified?: SortOrder
    emailVerifiedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    managerId?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    role?: SortOrder
    department?: SortOrder
    isActive?: SortOrder
    lastLoginAt?: SortOrder
    mfaSecret?: SortOrder
    mfaEnabled?: SortOrder
    externalId?: SortOrder
    ssoLastLogin?: SortOrder
    emailVerified?: SortOrder
    emailVerifiedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    managerId?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    role?: SortOrder
    department?: SortOrder
    isActive?: SortOrder
    lastLoginAt?: SortOrder
    mfaSecret?: SortOrder
    mfaEnabled?: SortOrder
    externalId?: SortOrder
    ssoLastLogin?: SortOrder
    emailVerified?: SortOrder
    emailVerifiedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    managerId?: SortOrder
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

  export type EnumUserRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserRoleWithAggregatesFilter<$PrismaModel> | $Enums.UserRole
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumUserRoleFilter<$PrismaModel>
    _max?: NestedEnumUserRoleFilter<$PrismaModel>
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

  export type TenantApiKeyCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    name?: SortOrder
    keyPrefix?: SortOrder
    keyHash?: SortOrder
    createdByUserId?: SortOrder
    createdAt?: SortOrder
    lastUsedAt?: SortOrder
    revokedAt?: SortOrder
    scopes?: SortOrder
  }

  export type TenantApiKeyMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    name?: SortOrder
    keyPrefix?: SortOrder
    keyHash?: SortOrder
    createdByUserId?: SortOrder
    createdAt?: SortOrder
    lastUsedAt?: SortOrder
    revokedAt?: SortOrder
  }

  export type TenantApiKeyMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    name?: SortOrder
    keyPrefix?: SortOrder
    keyHash?: SortOrder
    createdByUserId?: SortOrder
    createdAt?: SortOrder
    lastUsedAt?: SortOrder
    revokedAt?: SortOrder
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type EmailVerificationCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    email?: SortOrder
    token?: SortOrder
    expiresAt?: SortOrder
    usedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type EmailVerificationMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    email?: SortOrder
    token?: SortOrder
    expiresAt?: SortOrder
    usedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type EmailVerificationMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    email?: SortOrder
    token?: SortOrder
    expiresAt?: SortOrder
    usedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type PasswordResetCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    token?: SortOrder
    expiresAt?: SortOrder
    usedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type PasswordResetMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    token?: SortOrder
    expiresAt?: SortOrder
    usedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type PasswordResetMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    token?: SortOrder
    expiresAt?: SortOrder
    usedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type InviteTokenCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    email?: SortOrder
    role?: SortOrder
    token?: SortOrder
    expiresAt?: SortOrder
    usedAt?: SortOrder
    invitedByUserId?: SortOrder
    createdAt?: SortOrder
  }

  export type InviteTokenMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    email?: SortOrder
    role?: SortOrder
    token?: SortOrder
    expiresAt?: SortOrder
    usedAt?: SortOrder
    invitedByUserId?: SortOrder
    createdAt?: SortOrder
  }

  export type InviteTokenMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    email?: SortOrder
    role?: SortOrder
    token?: SortOrder
    expiresAt?: SortOrder
    usedAt?: SortOrder
    invitedByUserId?: SortOrder
    createdAt?: SortOrder
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

  export type AuditEventCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    actorUserId?: SortOrder
    action?: SortOrder
    resourceType?: SortOrder
    resourceId?: SortOrder
    metadata?: SortOrder
    ipAddress?: SortOrder
    createdAt?: SortOrder
  }

  export type AuditEventMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    actorUserId?: SortOrder
    action?: SortOrder
    resourceType?: SortOrder
    resourceId?: SortOrder
    ipAddress?: SortOrder
    createdAt?: SortOrder
  }

  export type AuditEventMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    actorUserId?: SortOrder
    action?: SortOrder
    resourceType?: SortOrder
    resourceId?: SortOrder
    ipAddress?: SortOrder
    createdAt?: SortOrder
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

  export type EnumSsoProtocolFilter<$PrismaModel = never> = {
    equals?: $Enums.SsoProtocol | EnumSsoProtocolFieldRefInput<$PrismaModel>
    in?: $Enums.SsoProtocol[] | ListEnumSsoProtocolFieldRefInput<$PrismaModel>
    notIn?: $Enums.SsoProtocol[] | ListEnumSsoProtocolFieldRefInput<$PrismaModel>
    not?: NestedEnumSsoProtocolFilter<$PrismaModel> | $Enums.SsoProtocol
  }

  export type EnumSsoStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.SsoStatus | EnumSsoStatusFieldRefInput<$PrismaModel>
    in?: $Enums.SsoStatus[] | ListEnumSsoStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.SsoStatus[] | ListEnumSsoStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumSsoStatusFilter<$PrismaModel> | $Enums.SsoStatus
  }

  export type TenantSsoCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    protocol?: SortOrder
    status?: SortOrder
    samlEntryPoint?: SortOrder
    samlIssuer?: SortOrder
    samlCertificate?: SortOrder
    oidcIssuerUrl?: SortOrder
    oidcClientId?: SortOrder
    oidcClientSecret?: SortOrder
    emailDomains?: SortOrder
    attrEmail?: SortOrder
    attrFirstName?: SortOrder
    attrLastName?: SortOrder
    attrGroups?: SortOrder
    roleMap?: SortOrder
    defaultRole?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TenantSsoMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    protocol?: SortOrder
    status?: SortOrder
    samlEntryPoint?: SortOrder
    samlIssuer?: SortOrder
    samlCertificate?: SortOrder
    oidcIssuerUrl?: SortOrder
    oidcClientId?: SortOrder
    oidcClientSecret?: SortOrder
    attrEmail?: SortOrder
    attrFirstName?: SortOrder
    attrLastName?: SortOrder
    attrGroups?: SortOrder
    defaultRole?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TenantSsoMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    protocol?: SortOrder
    status?: SortOrder
    samlEntryPoint?: SortOrder
    samlIssuer?: SortOrder
    samlCertificate?: SortOrder
    oidcIssuerUrl?: SortOrder
    oidcClientId?: SortOrder
    oidcClientSecret?: SortOrder
    attrEmail?: SortOrder
    attrFirstName?: SortOrder
    attrLastName?: SortOrder
    attrGroups?: SortOrder
    defaultRole?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumSsoProtocolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SsoProtocol | EnumSsoProtocolFieldRefInput<$PrismaModel>
    in?: $Enums.SsoProtocol[] | ListEnumSsoProtocolFieldRefInput<$PrismaModel>
    notIn?: $Enums.SsoProtocol[] | ListEnumSsoProtocolFieldRefInput<$PrismaModel>
    not?: NestedEnumSsoProtocolWithAggregatesFilter<$PrismaModel> | $Enums.SsoProtocol
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSsoProtocolFilter<$PrismaModel>
    _max?: NestedEnumSsoProtocolFilter<$PrismaModel>
  }

  export type EnumSsoStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SsoStatus | EnumSsoStatusFieldRefInput<$PrismaModel>
    in?: $Enums.SsoStatus[] | ListEnumSsoStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.SsoStatus[] | ListEnumSsoStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumSsoStatusWithAggregatesFilter<$PrismaModel> | $Enums.SsoStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSsoStatusFilter<$PrismaModel>
    _max?: NestedEnumSsoStatusFilter<$PrismaModel>
  }

  export type SsoLoginAuditCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    email?: SortOrder
    protocol?: SortOrder
    outcome?: SortOrder
    ipAddress?: SortOrder
    userAgent?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
  }

  export type SsoLoginAuditMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    email?: SortOrder
    protocol?: SortOrder
    outcome?: SortOrder
    ipAddress?: SortOrder
    userAgent?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
  }

  export type SsoLoginAuditMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    email?: SortOrder
    protocol?: SortOrder
    outcome?: SortOrder
    ipAddress?: SortOrder
    userAgent?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
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

  export type DashboardLayoutTenantIdUserIdDashboardKeyCompoundUniqueInput = {
    tenantId: string
    userId: string
    dashboardKey: string
  }

  export type DashboardLayoutCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    userId?: SortOrder
    scope?: SortOrder
    dashboardKey?: SortOrder
    name?: SortOrder
    document?: SortOrder
    schemaVersion?: SortOrder
    isDefault?: SortOrder
    updatedBy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DashboardLayoutAvgOrderByAggregateInput = {
    schemaVersion?: SortOrder
  }

  export type DashboardLayoutMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    userId?: SortOrder
    scope?: SortOrder
    dashboardKey?: SortOrder
    name?: SortOrder
    schemaVersion?: SortOrder
    isDefault?: SortOrder
    updatedBy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DashboardLayoutMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    userId?: SortOrder
    scope?: SortOrder
    dashboardKey?: SortOrder
    name?: SortOrder
    schemaVersion?: SortOrder
    isDefault?: SortOrder
    updatedBy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DashboardLayoutSumOrderByAggregateInput = {
    schemaVersion?: SortOrder
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

  export type UserUiPrefsCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    userId?: SortOrder
    colorMode?: SortOrder
    density?: SortOrder
    locale?: SortOrder
    timezone?: SortOrder
    accentOverride?: SortOrder
    prefs?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserUiPrefsMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    userId?: SortOrder
    colorMode?: SortOrder
    density?: SortOrder
    locale?: SortOrder
    timezone?: SortOrder
    accentOverride?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserUiPrefsMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    userId?: SortOrder
    colorMode?: SortOrder
    density?: SortOrder
    locale?: SortOrder
    timezone?: SortOrder
    accentOverride?: SortOrder
    updatedAt?: SortOrder
  }

  export type InviteTokenCreateNestedManyWithoutInvitedByInput = {
    create?: XOR<InviteTokenCreateWithoutInvitedByInput, InviteTokenUncheckedCreateWithoutInvitedByInput> | InviteTokenCreateWithoutInvitedByInput[] | InviteTokenUncheckedCreateWithoutInvitedByInput[]
    connectOrCreate?: InviteTokenCreateOrConnectWithoutInvitedByInput | InviteTokenCreateOrConnectWithoutInvitedByInput[]
    createMany?: InviteTokenCreateManyInvitedByInputEnvelope
    connect?: InviteTokenWhereUniqueInput | InviteTokenWhereUniqueInput[]
  }

  export type PasswordResetCreateNestedManyWithoutUserInput = {
    create?: XOR<PasswordResetCreateWithoutUserInput, PasswordResetUncheckedCreateWithoutUserInput> | PasswordResetCreateWithoutUserInput[] | PasswordResetUncheckedCreateWithoutUserInput[]
    connectOrCreate?: PasswordResetCreateOrConnectWithoutUserInput | PasswordResetCreateOrConnectWithoutUserInput[]
    createMany?: PasswordResetCreateManyUserInputEnvelope
    connect?: PasswordResetWhereUniqueInput | PasswordResetWhereUniqueInput[]
  }

  export type EmailVerificationCreateNestedManyWithoutUserInput = {
    create?: XOR<EmailVerificationCreateWithoutUserInput, EmailVerificationUncheckedCreateWithoutUserInput> | EmailVerificationCreateWithoutUserInput[] | EmailVerificationUncheckedCreateWithoutUserInput[]
    connectOrCreate?: EmailVerificationCreateOrConnectWithoutUserInput | EmailVerificationCreateOrConnectWithoutUserInput[]
    createMany?: EmailVerificationCreateManyUserInputEnvelope
    connect?: EmailVerificationWhereUniqueInput | EmailVerificationWhereUniqueInput[]
  }

  export type InviteTokenUncheckedCreateNestedManyWithoutInvitedByInput = {
    create?: XOR<InviteTokenCreateWithoutInvitedByInput, InviteTokenUncheckedCreateWithoutInvitedByInput> | InviteTokenCreateWithoutInvitedByInput[] | InviteTokenUncheckedCreateWithoutInvitedByInput[]
    connectOrCreate?: InviteTokenCreateOrConnectWithoutInvitedByInput | InviteTokenCreateOrConnectWithoutInvitedByInput[]
    createMany?: InviteTokenCreateManyInvitedByInputEnvelope
    connect?: InviteTokenWhereUniqueInput | InviteTokenWhereUniqueInput[]
  }

  export type PasswordResetUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<PasswordResetCreateWithoutUserInput, PasswordResetUncheckedCreateWithoutUserInput> | PasswordResetCreateWithoutUserInput[] | PasswordResetUncheckedCreateWithoutUserInput[]
    connectOrCreate?: PasswordResetCreateOrConnectWithoutUserInput | PasswordResetCreateOrConnectWithoutUserInput[]
    createMany?: PasswordResetCreateManyUserInputEnvelope
    connect?: PasswordResetWhereUniqueInput | PasswordResetWhereUniqueInput[]
  }

  export type EmailVerificationUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<EmailVerificationCreateWithoutUserInput, EmailVerificationUncheckedCreateWithoutUserInput> | EmailVerificationCreateWithoutUserInput[] | EmailVerificationUncheckedCreateWithoutUserInput[]
    connectOrCreate?: EmailVerificationCreateOrConnectWithoutUserInput | EmailVerificationCreateOrConnectWithoutUserInput[]
    createMany?: EmailVerificationCreateManyUserInputEnvelope
    connect?: EmailVerificationWhereUniqueInput | EmailVerificationWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type EnumUserRoleFieldUpdateOperationsInput = {
    set?: $Enums.UserRole
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type InviteTokenUpdateManyWithoutInvitedByNestedInput = {
    create?: XOR<InviteTokenCreateWithoutInvitedByInput, InviteTokenUncheckedCreateWithoutInvitedByInput> | InviteTokenCreateWithoutInvitedByInput[] | InviteTokenUncheckedCreateWithoutInvitedByInput[]
    connectOrCreate?: InviteTokenCreateOrConnectWithoutInvitedByInput | InviteTokenCreateOrConnectWithoutInvitedByInput[]
    upsert?: InviteTokenUpsertWithWhereUniqueWithoutInvitedByInput | InviteTokenUpsertWithWhereUniqueWithoutInvitedByInput[]
    createMany?: InviteTokenCreateManyInvitedByInputEnvelope
    set?: InviteTokenWhereUniqueInput | InviteTokenWhereUniqueInput[]
    disconnect?: InviteTokenWhereUniqueInput | InviteTokenWhereUniqueInput[]
    delete?: InviteTokenWhereUniqueInput | InviteTokenWhereUniqueInput[]
    connect?: InviteTokenWhereUniqueInput | InviteTokenWhereUniqueInput[]
    update?: InviteTokenUpdateWithWhereUniqueWithoutInvitedByInput | InviteTokenUpdateWithWhereUniqueWithoutInvitedByInput[]
    updateMany?: InviteTokenUpdateManyWithWhereWithoutInvitedByInput | InviteTokenUpdateManyWithWhereWithoutInvitedByInput[]
    deleteMany?: InviteTokenScalarWhereInput | InviteTokenScalarWhereInput[]
  }

  export type PasswordResetUpdateManyWithoutUserNestedInput = {
    create?: XOR<PasswordResetCreateWithoutUserInput, PasswordResetUncheckedCreateWithoutUserInput> | PasswordResetCreateWithoutUserInput[] | PasswordResetUncheckedCreateWithoutUserInput[]
    connectOrCreate?: PasswordResetCreateOrConnectWithoutUserInput | PasswordResetCreateOrConnectWithoutUserInput[]
    upsert?: PasswordResetUpsertWithWhereUniqueWithoutUserInput | PasswordResetUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: PasswordResetCreateManyUserInputEnvelope
    set?: PasswordResetWhereUniqueInput | PasswordResetWhereUniqueInput[]
    disconnect?: PasswordResetWhereUniqueInput | PasswordResetWhereUniqueInput[]
    delete?: PasswordResetWhereUniqueInput | PasswordResetWhereUniqueInput[]
    connect?: PasswordResetWhereUniqueInput | PasswordResetWhereUniqueInput[]
    update?: PasswordResetUpdateWithWhereUniqueWithoutUserInput | PasswordResetUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: PasswordResetUpdateManyWithWhereWithoutUserInput | PasswordResetUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: PasswordResetScalarWhereInput | PasswordResetScalarWhereInput[]
  }

  export type EmailVerificationUpdateManyWithoutUserNestedInput = {
    create?: XOR<EmailVerificationCreateWithoutUserInput, EmailVerificationUncheckedCreateWithoutUserInput> | EmailVerificationCreateWithoutUserInput[] | EmailVerificationUncheckedCreateWithoutUserInput[]
    connectOrCreate?: EmailVerificationCreateOrConnectWithoutUserInput | EmailVerificationCreateOrConnectWithoutUserInput[]
    upsert?: EmailVerificationUpsertWithWhereUniqueWithoutUserInput | EmailVerificationUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: EmailVerificationCreateManyUserInputEnvelope
    set?: EmailVerificationWhereUniqueInput | EmailVerificationWhereUniqueInput[]
    disconnect?: EmailVerificationWhereUniqueInput | EmailVerificationWhereUniqueInput[]
    delete?: EmailVerificationWhereUniqueInput | EmailVerificationWhereUniqueInput[]
    connect?: EmailVerificationWhereUniqueInput | EmailVerificationWhereUniqueInput[]
    update?: EmailVerificationUpdateWithWhereUniqueWithoutUserInput | EmailVerificationUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: EmailVerificationUpdateManyWithWhereWithoutUserInput | EmailVerificationUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: EmailVerificationScalarWhereInput | EmailVerificationScalarWhereInput[]
  }

  export type InviteTokenUncheckedUpdateManyWithoutInvitedByNestedInput = {
    create?: XOR<InviteTokenCreateWithoutInvitedByInput, InviteTokenUncheckedCreateWithoutInvitedByInput> | InviteTokenCreateWithoutInvitedByInput[] | InviteTokenUncheckedCreateWithoutInvitedByInput[]
    connectOrCreate?: InviteTokenCreateOrConnectWithoutInvitedByInput | InviteTokenCreateOrConnectWithoutInvitedByInput[]
    upsert?: InviteTokenUpsertWithWhereUniqueWithoutInvitedByInput | InviteTokenUpsertWithWhereUniqueWithoutInvitedByInput[]
    createMany?: InviteTokenCreateManyInvitedByInputEnvelope
    set?: InviteTokenWhereUniqueInput | InviteTokenWhereUniqueInput[]
    disconnect?: InviteTokenWhereUniqueInput | InviteTokenWhereUniqueInput[]
    delete?: InviteTokenWhereUniqueInput | InviteTokenWhereUniqueInput[]
    connect?: InviteTokenWhereUniqueInput | InviteTokenWhereUniqueInput[]
    update?: InviteTokenUpdateWithWhereUniqueWithoutInvitedByInput | InviteTokenUpdateWithWhereUniqueWithoutInvitedByInput[]
    updateMany?: InviteTokenUpdateManyWithWhereWithoutInvitedByInput | InviteTokenUpdateManyWithWhereWithoutInvitedByInput[]
    deleteMany?: InviteTokenScalarWhereInput | InviteTokenScalarWhereInput[]
  }

  export type PasswordResetUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<PasswordResetCreateWithoutUserInput, PasswordResetUncheckedCreateWithoutUserInput> | PasswordResetCreateWithoutUserInput[] | PasswordResetUncheckedCreateWithoutUserInput[]
    connectOrCreate?: PasswordResetCreateOrConnectWithoutUserInput | PasswordResetCreateOrConnectWithoutUserInput[]
    upsert?: PasswordResetUpsertWithWhereUniqueWithoutUserInput | PasswordResetUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: PasswordResetCreateManyUserInputEnvelope
    set?: PasswordResetWhereUniqueInput | PasswordResetWhereUniqueInput[]
    disconnect?: PasswordResetWhereUniqueInput | PasswordResetWhereUniqueInput[]
    delete?: PasswordResetWhereUniqueInput | PasswordResetWhereUniqueInput[]
    connect?: PasswordResetWhereUniqueInput | PasswordResetWhereUniqueInput[]
    update?: PasswordResetUpdateWithWhereUniqueWithoutUserInput | PasswordResetUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: PasswordResetUpdateManyWithWhereWithoutUserInput | PasswordResetUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: PasswordResetScalarWhereInput | PasswordResetScalarWhereInput[]
  }

  export type EmailVerificationUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<EmailVerificationCreateWithoutUserInput, EmailVerificationUncheckedCreateWithoutUserInput> | EmailVerificationCreateWithoutUserInput[] | EmailVerificationUncheckedCreateWithoutUserInput[]
    connectOrCreate?: EmailVerificationCreateOrConnectWithoutUserInput | EmailVerificationCreateOrConnectWithoutUserInput[]
    upsert?: EmailVerificationUpsertWithWhereUniqueWithoutUserInput | EmailVerificationUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: EmailVerificationCreateManyUserInputEnvelope
    set?: EmailVerificationWhereUniqueInput | EmailVerificationWhereUniqueInput[]
    disconnect?: EmailVerificationWhereUniqueInput | EmailVerificationWhereUniqueInput[]
    delete?: EmailVerificationWhereUniqueInput | EmailVerificationWhereUniqueInput[]
    connect?: EmailVerificationWhereUniqueInput | EmailVerificationWhereUniqueInput[]
    update?: EmailVerificationUpdateWithWhereUniqueWithoutUserInput | EmailVerificationUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: EmailVerificationUpdateManyWithWhereWithoutUserInput | EmailVerificationUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: EmailVerificationScalarWhereInput | EmailVerificationScalarWhereInput[]
  }

  export type TenantApiKeyCreatescopesInput = {
    set: string[]
  }

  export type TenantApiKeyUpdatescopesInput = {
    set?: string[]
    push?: string | string[]
  }

  export type UserCreateNestedOneWithoutEmailVerificationsInput = {
    create?: XOR<UserCreateWithoutEmailVerificationsInput, UserUncheckedCreateWithoutEmailVerificationsInput>
    connectOrCreate?: UserCreateOrConnectWithoutEmailVerificationsInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutEmailVerificationsNestedInput = {
    create?: XOR<UserCreateWithoutEmailVerificationsInput, UserUncheckedCreateWithoutEmailVerificationsInput>
    connectOrCreate?: UserCreateOrConnectWithoutEmailVerificationsInput
    upsert?: UserUpsertWithoutEmailVerificationsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutEmailVerificationsInput, UserUpdateWithoutEmailVerificationsInput>, UserUncheckedUpdateWithoutEmailVerificationsInput>
  }

  export type UserCreateNestedOneWithoutPasswordResetsInput = {
    create?: XOR<UserCreateWithoutPasswordResetsInput, UserUncheckedCreateWithoutPasswordResetsInput>
    connectOrCreate?: UserCreateOrConnectWithoutPasswordResetsInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutPasswordResetsNestedInput = {
    create?: XOR<UserCreateWithoutPasswordResetsInput, UserUncheckedCreateWithoutPasswordResetsInput>
    connectOrCreate?: UserCreateOrConnectWithoutPasswordResetsInput
    upsert?: UserUpsertWithoutPasswordResetsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutPasswordResetsInput, UserUpdateWithoutPasswordResetsInput>, UserUncheckedUpdateWithoutPasswordResetsInput>
  }

  export type UserCreateNestedOneWithoutInviteTokensInput = {
    create?: XOR<UserCreateWithoutInviteTokensInput, UserUncheckedCreateWithoutInviteTokensInput>
    connectOrCreate?: UserCreateOrConnectWithoutInviteTokensInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutInviteTokensNestedInput = {
    create?: XOR<UserCreateWithoutInviteTokensInput, UserUncheckedCreateWithoutInviteTokensInput>
    connectOrCreate?: UserCreateOrConnectWithoutInviteTokensInput
    upsert?: UserUpsertWithoutInviteTokensInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutInviteTokensInput, UserUpdateWithoutInviteTokensInput>, UserUncheckedUpdateWithoutInviteTokensInput>
  }

  export type TenantSsoCreateemailDomainsInput = {
    set: string[]
  }

  export type EnumSsoProtocolFieldUpdateOperationsInput = {
    set?: $Enums.SsoProtocol
  }

  export type EnumSsoStatusFieldUpdateOperationsInput = {
    set?: $Enums.SsoStatus
  }

  export type TenantSsoUpdateemailDomainsInput = {
    set?: string[]
    push?: string | string[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
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

  export type NestedEnumUserRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserRoleFilter<$PrismaModel> | $Enums.UserRole
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

  export type NestedEnumUserRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserRoleWithAggregatesFilter<$PrismaModel> | $Enums.UserRole
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumUserRoleFilter<$PrismaModel>
    _max?: NestedEnumUserRoleFilter<$PrismaModel>
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

  export type NestedEnumSsoProtocolFilter<$PrismaModel = never> = {
    equals?: $Enums.SsoProtocol | EnumSsoProtocolFieldRefInput<$PrismaModel>
    in?: $Enums.SsoProtocol[] | ListEnumSsoProtocolFieldRefInput<$PrismaModel>
    notIn?: $Enums.SsoProtocol[] | ListEnumSsoProtocolFieldRefInput<$PrismaModel>
    not?: NestedEnumSsoProtocolFilter<$PrismaModel> | $Enums.SsoProtocol
  }

  export type NestedEnumSsoStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.SsoStatus | EnumSsoStatusFieldRefInput<$PrismaModel>
    in?: $Enums.SsoStatus[] | ListEnumSsoStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.SsoStatus[] | ListEnumSsoStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumSsoStatusFilter<$PrismaModel> | $Enums.SsoStatus
  }

  export type NestedEnumSsoProtocolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SsoProtocol | EnumSsoProtocolFieldRefInput<$PrismaModel>
    in?: $Enums.SsoProtocol[] | ListEnumSsoProtocolFieldRefInput<$PrismaModel>
    notIn?: $Enums.SsoProtocol[] | ListEnumSsoProtocolFieldRefInput<$PrismaModel>
    not?: NestedEnumSsoProtocolWithAggregatesFilter<$PrismaModel> | $Enums.SsoProtocol
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSsoProtocolFilter<$PrismaModel>
    _max?: NestedEnumSsoProtocolFilter<$PrismaModel>
  }

  export type NestedEnumSsoStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SsoStatus | EnumSsoStatusFieldRefInput<$PrismaModel>
    in?: $Enums.SsoStatus[] | ListEnumSsoStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.SsoStatus[] | ListEnumSsoStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumSsoStatusWithAggregatesFilter<$PrismaModel> | $Enums.SsoStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSsoStatusFilter<$PrismaModel>
    _max?: NestedEnumSsoStatusFilter<$PrismaModel>
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

  export type InviteTokenCreateWithoutInvitedByInput = {
    id?: string
    tenantId: string
    email: string
    role?: $Enums.UserRole
    token?: string
    expiresAt: Date | string
    usedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type InviteTokenUncheckedCreateWithoutInvitedByInput = {
    id?: string
    tenantId: string
    email: string
    role?: $Enums.UserRole
    token?: string
    expiresAt: Date | string
    usedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type InviteTokenCreateOrConnectWithoutInvitedByInput = {
    where: InviteTokenWhereUniqueInput
    create: XOR<InviteTokenCreateWithoutInvitedByInput, InviteTokenUncheckedCreateWithoutInvitedByInput>
  }

  export type InviteTokenCreateManyInvitedByInputEnvelope = {
    data: InviteTokenCreateManyInvitedByInput | InviteTokenCreateManyInvitedByInput[]
    skipDuplicates?: boolean
  }

  export type PasswordResetCreateWithoutUserInput = {
    id?: string
    token?: string
    expiresAt: Date | string
    usedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type PasswordResetUncheckedCreateWithoutUserInput = {
    id?: string
    token?: string
    expiresAt: Date | string
    usedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type PasswordResetCreateOrConnectWithoutUserInput = {
    where: PasswordResetWhereUniqueInput
    create: XOR<PasswordResetCreateWithoutUserInput, PasswordResetUncheckedCreateWithoutUserInput>
  }

  export type PasswordResetCreateManyUserInputEnvelope = {
    data: PasswordResetCreateManyUserInput | PasswordResetCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type EmailVerificationCreateWithoutUserInput = {
    id?: string
    email: string
    token?: string
    expiresAt: Date | string
    usedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type EmailVerificationUncheckedCreateWithoutUserInput = {
    id?: string
    email: string
    token?: string
    expiresAt: Date | string
    usedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type EmailVerificationCreateOrConnectWithoutUserInput = {
    where: EmailVerificationWhereUniqueInput
    create: XOR<EmailVerificationCreateWithoutUserInput, EmailVerificationUncheckedCreateWithoutUserInput>
  }

  export type EmailVerificationCreateManyUserInputEnvelope = {
    data: EmailVerificationCreateManyUserInput | EmailVerificationCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type InviteTokenUpsertWithWhereUniqueWithoutInvitedByInput = {
    where: InviteTokenWhereUniqueInput
    update: XOR<InviteTokenUpdateWithoutInvitedByInput, InviteTokenUncheckedUpdateWithoutInvitedByInput>
    create: XOR<InviteTokenCreateWithoutInvitedByInput, InviteTokenUncheckedCreateWithoutInvitedByInput>
  }

  export type InviteTokenUpdateWithWhereUniqueWithoutInvitedByInput = {
    where: InviteTokenWhereUniqueInput
    data: XOR<InviteTokenUpdateWithoutInvitedByInput, InviteTokenUncheckedUpdateWithoutInvitedByInput>
  }

  export type InviteTokenUpdateManyWithWhereWithoutInvitedByInput = {
    where: InviteTokenScalarWhereInput
    data: XOR<InviteTokenUpdateManyMutationInput, InviteTokenUncheckedUpdateManyWithoutInvitedByInput>
  }

  export type InviteTokenScalarWhereInput = {
    AND?: InviteTokenScalarWhereInput | InviteTokenScalarWhereInput[]
    OR?: InviteTokenScalarWhereInput[]
    NOT?: InviteTokenScalarWhereInput | InviteTokenScalarWhereInput[]
    id?: StringFilter<"InviteToken"> | string
    tenantId?: StringFilter<"InviteToken"> | string
    email?: StringFilter<"InviteToken"> | string
    role?: EnumUserRoleFilter<"InviteToken"> | $Enums.UserRole
    token?: StringFilter<"InviteToken"> | string
    expiresAt?: DateTimeFilter<"InviteToken"> | Date | string
    usedAt?: DateTimeNullableFilter<"InviteToken"> | Date | string | null
    invitedByUserId?: StringFilter<"InviteToken"> | string
    createdAt?: DateTimeFilter<"InviteToken"> | Date | string
  }

  export type PasswordResetUpsertWithWhereUniqueWithoutUserInput = {
    where: PasswordResetWhereUniqueInput
    update: XOR<PasswordResetUpdateWithoutUserInput, PasswordResetUncheckedUpdateWithoutUserInput>
    create: XOR<PasswordResetCreateWithoutUserInput, PasswordResetUncheckedCreateWithoutUserInput>
  }

  export type PasswordResetUpdateWithWhereUniqueWithoutUserInput = {
    where: PasswordResetWhereUniqueInput
    data: XOR<PasswordResetUpdateWithoutUserInput, PasswordResetUncheckedUpdateWithoutUserInput>
  }

  export type PasswordResetUpdateManyWithWhereWithoutUserInput = {
    where: PasswordResetScalarWhereInput
    data: XOR<PasswordResetUpdateManyMutationInput, PasswordResetUncheckedUpdateManyWithoutUserInput>
  }

  export type PasswordResetScalarWhereInput = {
    AND?: PasswordResetScalarWhereInput | PasswordResetScalarWhereInput[]
    OR?: PasswordResetScalarWhereInput[]
    NOT?: PasswordResetScalarWhereInput | PasswordResetScalarWhereInput[]
    id?: StringFilter<"PasswordReset"> | string
    userId?: StringFilter<"PasswordReset"> | string
    token?: StringFilter<"PasswordReset"> | string
    expiresAt?: DateTimeFilter<"PasswordReset"> | Date | string
    usedAt?: DateTimeNullableFilter<"PasswordReset"> | Date | string | null
    createdAt?: DateTimeFilter<"PasswordReset"> | Date | string
  }

  export type EmailVerificationUpsertWithWhereUniqueWithoutUserInput = {
    where: EmailVerificationWhereUniqueInput
    update: XOR<EmailVerificationUpdateWithoutUserInput, EmailVerificationUncheckedUpdateWithoutUserInput>
    create: XOR<EmailVerificationCreateWithoutUserInput, EmailVerificationUncheckedCreateWithoutUserInput>
  }

  export type EmailVerificationUpdateWithWhereUniqueWithoutUserInput = {
    where: EmailVerificationWhereUniqueInput
    data: XOR<EmailVerificationUpdateWithoutUserInput, EmailVerificationUncheckedUpdateWithoutUserInput>
  }

  export type EmailVerificationUpdateManyWithWhereWithoutUserInput = {
    where: EmailVerificationScalarWhereInput
    data: XOR<EmailVerificationUpdateManyMutationInput, EmailVerificationUncheckedUpdateManyWithoutUserInput>
  }

  export type EmailVerificationScalarWhereInput = {
    AND?: EmailVerificationScalarWhereInput | EmailVerificationScalarWhereInput[]
    OR?: EmailVerificationScalarWhereInput[]
    NOT?: EmailVerificationScalarWhereInput | EmailVerificationScalarWhereInput[]
    id?: StringFilter<"EmailVerification"> | string
    userId?: StringFilter<"EmailVerification"> | string
    email?: StringFilter<"EmailVerification"> | string
    token?: StringFilter<"EmailVerification"> | string
    expiresAt?: DateTimeFilter<"EmailVerification"> | Date | string
    usedAt?: DateTimeNullableFilter<"EmailVerification"> | Date | string | null
    createdAt?: DateTimeFilter<"EmailVerification"> | Date | string
  }

  export type UserCreateWithoutEmailVerificationsInput = {
    id?: string
    tenantId: string
    email: string
    passwordHash: string
    firstName: string
    lastName: string
    role?: $Enums.UserRole
    department?: string | null
    isActive?: boolean
    lastLoginAt?: Date | string | null
    mfaSecret?: string | null
    mfaEnabled?: boolean
    externalId?: string | null
    ssoLastLogin?: Date | string | null
    emailVerified?: boolean
    emailVerifiedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    managerId?: string | null
    inviteTokens?: InviteTokenCreateNestedManyWithoutInvitedByInput
    passwordResets?: PasswordResetCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutEmailVerificationsInput = {
    id?: string
    tenantId: string
    email: string
    passwordHash: string
    firstName: string
    lastName: string
    role?: $Enums.UserRole
    department?: string | null
    isActive?: boolean
    lastLoginAt?: Date | string | null
    mfaSecret?: string | null
    mfaEnabled?: boolean
    externalId?: string | null
    ssoLastLogin?: Date | string | null
    emailVerified?: boolean
    emailVerifiedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    managerId?: string | null
    inviteTokens?: InviteTokenUncheckedCreateNestedManyWithoutInvitedByInput
    passwordResets?: PasswordResetUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutEmailVerificationsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutEmailVerificationsInput, UserUncheckedCreateWithoutEmailVerificationsInput>
  }

  export type UserUpsertWithoutEmailVerificationsInput = {
    update: XOR<UserUpdateWithoutEmailVerificationsInput, UserUncheckedUpdateWithoutEmailVerificationsInput>
    create: XOR<UserCreateWithoutEmailVerificationsInput, UserUncheckedCreateWithoutEmailVerificationsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutEmailVerificationsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutEmailVerificationsInput, UserUncheckedUpdateWithoutEmailVerificationsInput>
  }

  export type UserUpdateWithoutEmailVerificationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    department?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    mfaSecret?: NullableStringFieldUpdateOperationsInput | string | null
    mfaEnabled?: BoolFieldUpdateOperationsInput | boolean
    externalId?: NullableStringFieldUpdateOperationsInput | string | null
    ssoLastLogin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    emailVerified?: BoolFieldUpdateOperationsInput | boolean
    emailVerifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    managerId?: NullableStringFieldUpdateOperationsInput | string | null
    inviteTokens?: InviteTokenUpdateManyWithoutInvitedByNestedInput
    passwordResets?: PasswordResetUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutEmailVerificationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    department?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    mfaSecret?: NullableStringFieldUpdateOperationsInput | string | null
    mfaEnabled?: BoolFieldUpdateOperationsInput | boolean
    externalId?: NullableStringFieldUpdateOperationsInput | string | null
    ssoLastLogin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    emailVerified?: BoolFieldUpdateOperationsInput | boolean
    emailVerifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    managerId?: NullableStringFieldUpdateOperationsInput | string | null
    inviteTokens?: InviteTokenUncheckedUpdateManyWithoutInvitedByNestedInput
    passwordResets?: PasswordResetUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutPasswordResetsInput = {
    id?: string
    tenantId: string
    email: string
    passwordHash: string
    firstName: string
    lastName: string
    role?: $Enums.UserRole
    department?: string | null
    isActive?: boolean
    lastLoginAt?: Date | string | null
    mfaSecret?: string | null
    mfaEnabled?: boolean
    externalId?: string | null
    ssoLastLogin?: Date | string | null
    emailVerified?: boolean
    emailVerifiedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    managerId?: string | null
    inviteTokens?: InviteTokenCreateNestedManyWithoutInvitedByInput
    emailVerifications?: EmailVerificationCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutPasswordResetsInput = {
    id?: string
    tenantId: string
    email: string
    passwordHash: string
    firstName: string
    lastName: string
    role?: $Enums.UserRole
    department?: string | null
    isActive?: boolean
    lastLoginAt?: Date | string | null
    mfaSecret?: string | null
    mfaEnabled?: boolean
    externalId?: string | null
    ssoLastLogin?: Date | string | null
    emailVerified?: boolean
    emailVerifiedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    managerId?: string | null
    inviteTokens?: InviteTokenUncheckedCreateNestedManyWithoutInvitedByInput
    emailVerifications?: EmailVerificationUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutPasswordResetsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutPasswordResetsInput, UserUncheckedCreateWithoutPasswordResetsInput>
  }

  export type UserUpsertWithoutPasswordResetsInput = {
    update: XOR<UserUpdateWithoutPasswordResetsInput, UserUncheckedUpdateWithoutPasswordResetsInput>
    create: XOR<UserCreateWithoutPasswordResetsInput, UserUncheckedCreateWithoutPasswordResetsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutPasswordResetsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutPasswordResetsInput, UserUncheckedUpdateWithoutPasswordResetsInput>
  }

  export type UserUpdateWithoutPasswordResetsInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    department?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    mfaSecret?: NullableStringFieldUpdateOperationsInput | string | null
    mfaEnabled?: BoolFieldUpdateOperationsInput | boolean
    externalId?: NullableStringFieldUpdateOperationsInput | string | null
    ssoLastLogin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    emailVerified?: BoolFieldUpdateOperationsInput | boolean
    emailVerifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    managerId?: NullableStringFieldUpdateOperationsInput | string | null
    inviteTokens?: InviteTokenUpdateManyWithoutInvitedByNestedInput
    emailVerifications?: EmailVerificationUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutPasswordResetsInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    department?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    mfaSecret?: NullableStringFieldUpdateOperationsInput | string | null
    mfaEnabled?: BoolFieldUpdateOperationsInput | boolean
    externalId?: NullableStringFieldUpdateOperationsInput | string | null
    ssoLastLogin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    emailVerified?: BoolFieldUpdateOperationsInput | boolean
    emailVerifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    managerId?: NullableStringFieldUpdateOperationsInput | string | null
    inviteTokens?: InviteTokenUncheckedUpdateManyWithoutInvitedByNestedInput
    emailVerifications?: EmailVerificationUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutInviteTokensInput = {
    id?: string
    tenantId: string
    email: string
    passwordHash: string
    firstName: string
    lastName: string
    role?: $Enums.UserRole
    department?: string | null
    isActive?: boolean
    lastLoginAt?: Date | string | null
    mfaSecret?: string | null
    mfaEnabled?: boolean
    externalId?: string | null
    ssoLastLogin?: Date | string | null
    emailVerified?: boolean
    emailVerifiedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    managerId?: string | null
    passwordResets?: PasswordResetCreateNestedManyWithoutUserInput
    emailVerifications?: EmailVerificationCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutInviteTokensInput = {
    id?: string
    tenantId: string
    email: string
    passwordHash: string
    firstName: string
    lastName: string
    role?: $Enums.UserRole
    department?: string | null
    isActive?: boolean
    lastLoginAt?: Date | string | null
    mfaSecret?: string | null
    mfaEnabled?: boolean
    externalId?: string | null
    ssoLastLogin?: Date | string | null
    emailVerified?: boolean
    emailVerifiedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    managerId?: string | null
    passwordResets?: PasswordResetUncheckedCreateNestedManyWithoutUserInput
    emailVerifications?: EmailVerificationUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutInviteTokensInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutInviteTokensInput, UserUncheckedCreateWithoutInviteTokensInput>
  }

  export type UserUpsertWithoutInviteTokensInput = {
    update: XOR<UserUpdateWithoutInviteTokensInput, UserUncheckedUpdateWithoutInviteTokensInput>
    create: XOR<UserCreateWithoutInviteTokensInput, UserUncheckedCreateWithoutInviteTokensInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutInviteTokensInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutInviteTokensInput, UserUncheckedUpdateWithoutInviteTokensInput>
  }

  export type UserUpdateWithoutInviteTokensInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    department?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    mfaSecret?: NullableStringFieldUpdateOperationsInput | string | null
    mfaEnabled?: BoolFieldUpdateOperationsInput | boolean
    externalId?: NullableStringFieldUpdateOperationsInput | string | null
    ssoLastLogin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    emailVerified?: BoolFieldUpdateOperationsInput | boolean
    emailVerifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    managerId?: NullableStringFieldUpdateOperationsInput | string | null
    passwordResets?: PasswordResetUpdateManyWithoutUserNestedInput
    emailVerifications?: EmailVerificationUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutInviteTokensInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    department?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    mfaSecret?: NullableStringFieldUpdateOperationsInput | string | null
    mfaEnabled?: BoolFieldUpdateOperationsInput | boolean
    externalId?: NullableStringFieldUpdateOperationsInput | string | null
    ssoLastLogin?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    emailVerified?: BoolFieldUpdateOperationsInput | boolean
    emailVerifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    managerId?: NullableStringFieldUpdateOperationsInput | string | null
    passwordResets?: PasswordResetUncheckedUpdateManyWithoutUserNestedInput
    emailVerifications?: EmailVerificationUncheckedUpdateManyWithoutUserNestedInput
  }

  export type InviteTokenCreateManyInvitedByInput = {
    id?: string
    tenantId: string
    email: string
    role?: $Enums.UserRole
    token?: string
    expiresAt: Date | string
    usedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type PasswordResetCreateManyUserInput = {
    id?: string
    token?: string
    expiresAt: Date | string
    usedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type EmailVerificationCreateManyUserInput = {
    id?: string
    email: string
    token?: string
    expiresAt: Date | string
    usedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type InviteTokenUpdateWithoutInvitedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    token?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InviteTokenUncheckedUpdateWithoutInvitedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    token?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InviteTokenUncheckedUpdateManyWithoutInvitedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    token?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PasswordResetUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PasswordResetUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PasswordResetUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EmailVerificationUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EmailVerificationUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EmailVerificationUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
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