import { Injectable, signal, computed } from '@angular/core';
import { Observable } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';

/**
 * Global loading state management service using Angular Signals
 * Handles concurrent operations with request counter
 */
@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  
  /**
   * Request counter signal for concurrent operations
   */
  private loadingCountSignal = signal<number>(0);
  
  /**
   * Computed loading state based on active requests
   */
  private isLoadingSignal = computed(() => this.loadingCountSignal() > 0);
  
  /**
   * Public loading state signal (recommended for new components)
   */
  public readonly loading = this.isLoadingSignal;
  
  /**
   * Observable compatibility for existing RxJS code
   */
  public loading$: Observable<boolean> = toObservable(this.isLoadingSignal);
  
  /**
   * Start loading operation
   * Increments request counter
   */
  show(): void {
    this.loadingCountSignal.update(count => count + 1);
  }
  
  /**
   * End loading operation  
   * Decrements request counter safely
   */
  hide(): void {
    this.loadingCountSignal.update(count => Math.max(0, count - 1));
  }
  
  /**
   * Force reset loading state
   * Useful for error recovery
   */
  forceHide(): void {
    this.loadingCountSignal.set(0);
  }

  /**
   * Get current loading count for testing purposes
   * @returns Current number of active requests
   */
  getLoadingCount(): number {
    return this.loadingCountSignal();
  }

  /**
   * Legacy compatibility getter for tests
   * @deprecated Use loading() signal instead
   */
  get isLoading(): boolean {
    return this.loading();
  }
} 