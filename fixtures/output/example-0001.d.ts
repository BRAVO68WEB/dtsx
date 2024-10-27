import type { BunPlugin } from 'bun';
import type { DtsGenerationConfig, DtsGenerationOption } from '@stacksjs/dtsx';
import { generate } from '@stacksjs/dtsx';

/**
 * Example of const declaration
 */
export declare const conf: { [key: string]: string };
export declare const someObject: {
  someString: 'Stacks';
  someNumber: 1000;
  someBoolean: true;
  someFalse: false;
  someFunction: (...args: any[]) => unknown;
  anotherOne: (...args: any[]) => unknown;
  someArray: Array<1 | 2 | 3>;
  someNestedArray: Array<Array<1 | 2 | 3> | Array<4 | 5 | 6 | 7 | 8 | 9 | 10>>;
  someNestedArray2: Array<Array<1 | 2 | 3> | Array<4 | 5 | 6 | 7 | 8 | 9 | 10> | 'dummy value'>;
  someNestedArray3: Array<Array<1 | 2 | 3> | Array<4 | 5 | 6 | 7 | 8 | 9 | 10> | 'dummy value' | Array<11 | 12 | 13>>;
  someOtherNestedArray: Array<Array<'some text' | 2 | unknown | ((...args: any[]) => unknown)> | Array<4 | 5 | 6 | 7 | 8 | 9 | 10>>;
  someComplexArray: Array<Array<{ key: 'value' }> | Array<{ key2: 'value2' } | 'test' | 1000> | Array<'some string' | unknown>>;
  someObject: {
    key: 'value';
  };
  someNestedObject: {
    key: {
      nestedKey: 'value';
    };
    otherKey: {
      nestedKey: unknown;
      nestedKey2: (...args: any[]) => unknown;
    };
  };
};
/**
 * Example of interface declaration
 * with another comment in an extra line
 */
export declare interface User {
  id: number
  name: string
  email: string
}
/**
 * Example of type declaration
 *
 * with multiple lines of comments, including an empty line
 */
export declare interface ResponseData {
  success: boolean
  data: User[]
}
/**
 * Example of function declaration
 *
 *
 * with multiple empty lines, including an empty lines
 */
export declare function fetchUsers(): Promise<ResponseData>;
export declare interface ApiResponse<T> {
  status: number
  message: string
  data: T
}
/**
 * Example of another const declaration
    *
* with multiple empty lines, including being poorly formatted
 */
declare const settings: { [key: string]: any };
export declare interface Product {
  id: number
  name: string
  price: number
}
/**
 * Example of function declaration
 */
export declare function getProduct(id: number): Promise<ApiResponse<Product>>;
export declare interface AuthResponse {
  token: string
  expiresIn: number
}
export declare type AuthStatus = 'authenticated' | 'unauthenticated';
export declare function authenticate(user: string, password: string): Promise<AuthResponse>;
export declare const defaultHeaders: {
  'Content-Type': 'application/json';
};
export declare function dts(options?: DtsGenerationOption): BunPlugin;
declare interface Options<T> {
  name: string
  cwd?: string
  defaultConfig: T
}
export declare function loadConfig<T extends Record<string, unknown>>({ name, cwd, defaultConfig }: Options<T>): Promise<T>;
declare const dtsConfig: DtsGenerationConfig;
export declare interface ComplexGeneric<T extends Record<string, unknown>, K extends keyof T> {
  data: T
  key: K
  value: T[K]
  transform: (input: T[K]) => string
  nested: Array<Partial<T>>
}
export declare type ComplexUnionIntersection = 
  | (User & { role: 'admin' })
  | (Product & { category: string })
  & {
    metadata: Record<string, unknown>
  }
export declare type ReadonlyDeep<T> = {
  readonly [P in keyof T]: T[P] extends object ? ReadonlyDeep<T[P]> : T[P]
}
export declare type ConditionalResponse<T> = T extends Array<infer U>
  ? ApiResponse<U[]>
  : T extends object
    ? ApiResponse<T>
    : ApiResponse<string>
export declare function processData(data: string): string;
export declare function processData(data: number): number;
export declare function processData(data: boolean): boolean;
export declare function processData<T extends object>(data: T): T;
export declare function processData(data: unknown): unknown;
export declare const complexObject: {
  handlers: {
    'async onSuccess<T>(data': unknown;
    'onError(error': unknown;
  };
};

export { generate, dtsConfig }
export type { DtsGenerationOption }
export { config } from './config'
export * from './extract'
export * from './generate'
export * from './types'
export * from './utils'

export default dts;
