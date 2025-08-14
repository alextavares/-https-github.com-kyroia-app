/**
 * Helpers de cache e segurança para Responses
 */
export function setPublicCache(res: Response, seconds: number, swr?: number) {
  const extras = swr ? `, stale-while-revalidate=${swr}` : "";
  res.headers.set("Cache-Control", `public, max-age=${seconds}${extras}`);
  applySecurityHeaders(res);
}

export function setPrivateCache(res: Response, seconds: number) {
  res.headers.set("Cache-Control", `private, max-age=${seconds}`);
  applySecurityHeaders(res);
}

export function setNoStore(res: Response) {
  res.headers.set("Cache-Control", "no-store");
  applySecurityHeaders(res);
}

export function setSSEHeaders(res: Response) {
  res.headers.set("Content-Type", "text/event-stream");
  res.headers.set("Cache-Control", "no-store");
  res.headers.set("Connection", "keep-alive");
  applySecurityHeaders(res);
}

export function setDownloadHeaders(
  res: Response,
  filename: string,
  contentType = "application/octet-stream"
) {
  res.headers.set("Cache-Control", "no-store");
  res.headers.set("Content-Type", contentType);
  res.headers.set("Content-Disposition", `attachment; filename="${filename}"`);
  applySecurityHeaders(res);
}

/**
 * Aplica headers de segurança padrão (ajuste conforme necessário).
 * Observação: HSTS deve ser usado apenas quando a aplicação está por trás de HTTPS.
 */
export function applySecurityHeaders(res: Response) {
  // HSTS por 180 dias (apenas HTTPS)
  res.headers.set("Strict-Transport-Security", "max-age=15552000; includeSubDomains");

  // Evita MIME sniffing
  res.headers.set("X-Content-Type-Options", "nosniff");

  // Proteção contra clickjacking
  res.headers.set("X-Frame-Options", "DENY");

  // Política de referência
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Política de permissões (endurecida; ajuste se a app usar algum recurso)
  res.headers.set(
    "Permissions-Policy",
    [
      "accelerometer=()",
      "autoplay=()",
      "camera=()",
      "display-capture=()",
      "encrypted-media=()",
      "fullscreen=()",
      "geolocation=()",
      "gyroscope=()",
      "microphone=()",
      "midi=()",
      "payment=()",
      "sync-xhr=('self')",
      "usb=()",
      "xr-spatial-tracking=()",
    ].join(", ")
  );

  // Opcional: CSP básica (comente se quebrar assets atuais, depois ajustar/domínios)
  // res.headers.set(
  //   "Content-Security-Policy",
  //   "default-src 'self'; img-src 'self' data:; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'"
  // );
}