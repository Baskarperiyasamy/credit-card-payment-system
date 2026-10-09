import logging, time
logger = logging.getLogger("api.monitoring")
class RequestMetricsMiddleware:
    """Log request duration and failures without recording secrets or request bodies."""
    def __init__(self, get_response): self.get_response = get_response
    def __call__(self, request):
        start = time.perf_counter(); status_code = 500
        try:
            response = self.get_response(request); status_code = response.status_code; return response
        finally:
            elapsed_ms = round((time.perf_counter() - start) * 1000, 2)
            logger.info("api_request method=%s path=%s status=%s duration_ms=%s", request.method, request.path, status_code, elapsed_ms)
            if status_code >= 500: logger.error("api_failure path=%s status=%s duration_ms=%s", request.path, status_code, elapsed_ms)
