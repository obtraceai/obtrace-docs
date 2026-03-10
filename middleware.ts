import { createI18nMiddleware } from "fumadocs-core/i18n";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { i18n, isSupportedLocale, supportedLocales, type SupportedLocale } from "./lib/i18n";

const COOKIE = "FD_LOCALE";
const handleI18n = createI18nMiddleware(i18n);

function hasLocalePrefix(pathname: string): SupportedLocale | null {
  return supportedLocales.find((locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) ?? null;
}

function resolvePreferredLocale(request: NextRequest): SupportedLocale {
  const cookieLocale = request.cookies.get(COOKIE)?.value;
  if (cookieLocale && isSupportedLocale(cookieLocale)) {
    return cookieLocale;
  }

  const country = request.headers.get("x-vercel-ip-country") ?? request.headers.get("cf-ipcountry");
  if (country?.toUpperCase() === "BR") {
    return "pt-BR";
  }

  const acceptLanguage = request.headers.get("accept-language")?.toLowerCase() ?? "";
  if (acceptLanguage.includes("pt-br") || acceptLanguage.includes("pt")) {
    return "pt-BR";
  }

  return i18n.defaultLanguage as SupportedLocale;
}

function withLocaleCookie(result: Response | null | undefined | void, locale: SupportedLocale) {
  const response = result instanceof NextResponse ? result : NextResponse.next();
  response.cookies.set(COOKIE, locale, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}

export default async function middleware(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl;
  const pathLocale = hasLocalePrefix(pathname);

  if (pathLocale) {
    return withLocaleCookie(await handleI18n(request, event), pathLocale);
  }

  const preferredLocale = resolvePreferredLocale(request);

  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = preferredLocale === "pt-BR" ? "/pt-BR/docs" : "/docs";
    return withLocaleCookie(NextResponse.redirect(url), preferredLocale);
  }

  if ((pathname === "/docs" || pathname.startsWith("/docs/")) && preferredLocale !== i18n.defaultLanguage) {
    const url = request.nextUrl.clone();
    url.pathname = `/${preferredLocale}${pathname}`;
    return withLocaleCookie(NextResponse.redirect(url), preferredLocale);
  }

  return withLocaleCookie(await handleI18n(request, event), preferredLocale);
}

export const config = {
  matcher: ["/", "/docs/:path*", "/:lang/docs/:path*"]
};
