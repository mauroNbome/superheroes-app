import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '@services/loading.service';

/**
 * HTTP interceptor for automatic loading state management
 * Integrates with simulated network delays in mock services
 */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  
  // Show loading for operations that simulate network requests
  const shouldShowGlobalLoading = !isTableOperation(req);
  
  if (shouldShowGlobalLoading) {
    loadingService.show();
  }
  
  return next(req).pipe(
    finalize(() => {
      if (shouldShowGlobalLoading) {
        loadingService.hide();
      }
    })
  );
};

/**
 * Determines if request should skip global loading
 * Uses custom header for table operations
 */
function isTableOperation(req: any): boolean {
  return req.headers && req.headers.get('X-Skip-Global-Loading') === 'true';
} 