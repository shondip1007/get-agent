import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

export const createClient = () => {
  return createBrowserClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      get(name: string) {
        // Check if running in browser
        if (typeof document === 'undefined') return undefined;
        // Get cookie value from document.cookie
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(";").shift();
      },
      set(name: string, value: string, options: any) {
        // Check if running in browser
        if (typeof document === 'undefined') return;
        // Set cookie using document.cookie
        let cookie = `${name}=${value}`;
        if (options?.maxAge) cookie += `; max-age=${options.maxAge}`;
        if (options?.path) cookie += `; path=${options.path}`;
        if (options?.domain) cookie += `; domain=${options.domain}`;
        if (options?.sameSite) cookie += `; samesite=${options.sameSite}`;
        if (options?.secure) cookie += "; secure";
        document.cookie = cookie;
      },
      remove(name: string, options: any) {
        // Check if running in browser
        if (typeof document === 'undefined') return;
        // Remove cookie by setting expiry to past date
        let cookie = `${name}=; max-age=0`;
        if (options?.path) cookie += `; path=${options.path}`;
        if (options?.domain) cookie += `; domain=${options.domain}`;
        document.cookie = cookie;
      },
    },
  });
};
