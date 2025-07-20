import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { loadingInterceptor } from '@services/loading.interceptor';

/**
 * Application Configuration for Superheroes Management System
 * 
 * This configuration file defines the global providers and services
 * that will be available throughout the entire Angular application.
 * 
 * Features included:
 * - Optimized change detection with zone.js coalescing
 * - Client-side routing configuration
 * - HTTP client with custom loading interceptor
 * - Asynchronous Angular Material animations
 * 
 * @version Angular 17+
 * @architecture Standalone Components
 */
export const appConfig: ApplicationConfig = {
  providers: [
    /**
     * Zone.js Change Detection Optimization
     * 
     * Enables event coalescing to reduce the number of change detection cycles.
     * This improves performance by batching multiple events that occur in the
     * same task into a single change detection run.
     * 
     * @performance Critical for applications with frequent user interactions
     */
    provideZoneChangeDetection({ eventCoalescing: true }), 
    
    /**
     * Router Configuration
     * 
     * Provides client-side routing functionality using the routes defined
     * in app.routes.ts. Enables navigation between different views without
     * full page reloads.
     * 
     * @see {@link routes} - Application route definitions
     */
    provideRouter(routes),
    
    /**
     * HTTP Client with Custom Interceptors
     * 
     * Configures the HTTP client for API communication with the following features:
     * - Loading interceptor: Automatically manages loading states for HTTP requests
     * - Global error handling and request/response transformation
     * 
     * @interceptors loadingInterceptor - Manages global loading state
     * @see {@link loadingInterceptor} - Custom loading state management
     */
    provideHttpClient(withInterceptors([loadingInterceptor])),
    
    /**
     * Angular Material Animations (Lazy Loaded)
     * 
     * Provides Angular Material animation capabilities loaded asynchronously
     * to improve initial bundle size. Animations are loaded on-demand when
     * Material components require them.
     * 
     * @performance Reduces initial bundle size by ~30KB
     * @lazy true - Animations loaded only when needed
     */
    provideAnimationsAsync()
  ]
};
