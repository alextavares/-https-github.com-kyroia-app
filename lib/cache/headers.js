/**
 * Helpers de cache e segurança para Responses
 */
export function setPublicCache(res, seconds, swr) {
    const extras = swr ? `, stale-while-revalidate=${swr}` : "";
    res.headers.set("Cache-Control", `public, max-age=${seconds}${extras}`);
    applySecurityHeaders(res);
}
export function setPrivateCache(res, seconds) {
    res.headers.set("Cache-Control", `private, max-age=${seconds}`);
    applySecurityHeaders(res);
}
export function setNoStore(res) {
    res.headers.set("Cache-Control", "no-store");
    applySecurityHeaders(res);
}
export function setSSEHeaders(res) {
    res.headers.set("Content-Type", "text/event-stream");
    res.headers.set("Cache-Control", "no-store");
    res.headers.set("Connection", "keep-alive");
    applySecurityHeaders(res);
}
export function setDownloadHeaders(res, filename, contentType = "application/octet-stream") {
    res.headers.set("Cache-Control", "no-store");
    res.headers.set("Content-Type", contentType);
    res.headers.set("Content-Disposition", `attachment; filename="${filename}"`);
    applySecurityHeaders(res);
}
/**
 * Aplica headers de segurança padrão (ajuste conforme necessário).
 * Observação: HSTS deve ser usado apenas quando a aplicação está por trás de HTTPS.
 */
export function applySecurityHeaders(res) {
    // HSTS por 180 dias (apenas HTTPS)
    res.headers.set("Strict-Transport-Security", "max-age=15552000; includeSubDomains");
    // Evita MIME sniffing
    res.headers.set("X-Content-Type-Options", "nosniff");
    // Proteção contra clickjacking
    res.headers.set("X-Frame-Options", "DENY");
    // Política de referência
    res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    // Política de permissões (endurecida; ajuste se a app usar algum recurso)
    res.headers.set("Permissions-Policy", [
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
    ].join(", "));
    // Opcional: CSP básica (comente se quebrar assets atuais, depois ajustar/domínios)
    // res.headers.set(
    //   "Content-Security-Policy",
    //   "default-src 'self'; img-src 'self' data:; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'"
    // );
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVhZGVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImhlYWRlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFDSCxNQUFNLFVBQVUsY0FBYyxDQUFDLEdBQWEsRUFBRSxPQUFlLEVBQUUsR0FBWTtJQUN6RSxNQUFNLE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLDRCQUE0QixHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0lBQzVELEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsRUFBRSxtQkFBbUIsT0FBTyxHQUFHLE1BQU0sRUFBRSxDQUFDLENBQUM7SUFDeEUsb0JBQW9CLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDNUIsQ0FBQztBQUVELE1BQU0sVUFBVSxlQUFlLENBQUMsR0FBYSxFQUFFLE9BQWU7SUFDNUQsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxFQUFFLG9CQUFvQixPQUFPLEVBQUUsQ0FBQyxDQUFDO0lBQ2hFLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzVCLENBQUM7QUFFRCxNQUFNLFVBQVUsVUFBVSxDQUFDLEdBQWE7SUFDdEMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQzdDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzVCLENBQUM7QUFFRCxNQUFNLFVBQVUsYUFBYSxDQUFDLEdBQWE7SUFDekMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLG1CQUFtQixDQUFDLENBQUM7SUFDckQsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQzdDLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxZQUFZLENBQUMsQ0FBQztJQUM1QyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM1QixDQUFDO0FBRUQsTUFBTSxVQUFVLGtCQUFrQixDQUNoQyxHQUFhLEVBQ2IsUUFBZ0IsRUFDaEIsV0FBVyxHQUFHLDBCQUEwQjtJQUV4QyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDN0MsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQzdDLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQixFQUFFLHlCQUF5QixRQUFRLEdBQUcsQ0FBQyxDQUFDO0lBQzdFLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzVCLENBQUM7QUFFRDs7O0dBR0c7QUFDSCxNQUFNLFVBQVUsb0JBQW9CLENBQUMsR0FBYTtJQUNoRCxtQ0FBbUM7SUFDbkMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsMkJBQTJCLEVBQUUscUNBQXFDLENBQUMsQ0FBQztJQUVwRixzQkFBc0I7SUFDdEIsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFFckQsK0JBQStCO0lBQy9CLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBRTNDLHlCQUF5QjtJQUN6QixHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsRUFBRSxpQ0FBaUMsQ0FBQyxDQUFDO0lBRXRFLDBFQUEwRTtJQUMxRSxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FDYixvQkFBb0IsRUFDcEI7UUFDRSxrQkFBa0I7UUFDbEIsYUFBYTtRQUNiLFdBQVc7UUFDWCxvQkFBb0I7UUFDcEIsb0JBQW9CO1FBQ3BCLGVBQWU7UUFDZixnQkFBZ0I7UUFDaEIsY0FBYztRQUNkLGVBQWU7UUFDZixTQUFTO1FBQ1QsWUFBWTtRQUNaLG1CQUFtQjtRQUNuQixRQUFRO1FBQ1Isd0JBQXdCO0tBQ3pCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUNiLENBQUM7SUFFRixtRkFBbUY7SUFDbkYsbUJBQW1CO0lBQ25CLCtCQUErQjtJQUMvQixnSkFBZ0o7SUFDaEosS0FBSztBQUNQLENBQUMifQ==