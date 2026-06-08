declare module "next/headers" {
  export interface CookieStore {
    getAll(): Array<{ name: string; value: string }>;
    set(name: string, value: string, options?: any): void;
    [key: string]: any;
  }
  export function cookies(): Promise<CookieStore> | CookieStore;
}

declare module "next/server" {
  export interface NextRequest {
    cookies: {
      getAll(): Array<{ name: string; value: string; options?: any }>;
      set(name: string, value: string, options?: any): void;
      [key: string]: any;
    };
    headers: any;
    [key: string]: any;
  }

  export class NextResponse {
    static next(options?: any): NextResponse;
    cookies: {
      set(name: string, value: string, options?: any): void;
      [key: string]: any;
    };
    [key: string]: any;
  }
}
