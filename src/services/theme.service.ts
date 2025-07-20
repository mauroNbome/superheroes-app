import { Injectable, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Theme management service with light/dark mode support
 * Uses Signals for reactivity and localStorage persistence
 */
@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  
  /**
   * Private signal for dark mode state
   */
  private _isDarkMode = signal<boolean>(false);
  
  /**
   * Public readonly dark mode state
   */
  public readonly isDarkMode = this._isDarkMode.asReadonly();
  
  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeTheme();
      this.setupThemeEffect();
    }
  }
  
  /**
   * Initialize theme from localStorage or system preference
   */
  private initializeTheme(): void {
    try {
      const savedTheme = localStorage.getItem('app-theme');
      
      if (savedTheme !== null) {
        this._isDarkMode.set(savedTheme === 'dark');
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this._isDarkMode.set(prefersDark);
      }
    } catch (error) {
      console.warn('Error initializing theme:', error);
      this._isDarkMode.set(false);
    }
  }
  
  /**
   * Setup automatic theme application effect
   */
  private setupThemeEffect(): void {
    effect(() => {
      const isDark = this._isDarkMode();
      
      // Apply CSS classes to body
      if (isDark) {
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
      } else {
        document.body.classList.add('light-theme');
        document.body.classList.remove('dark-theme');
      }
      
      // Save to localStorage
      try {
        localStorage.setItem('app-theme', isDark ? 'dark' : 'light');
      } catch (error) {
        console.warn('Error saving theme preference:', error);
      }
    });
  }
  
  /**
   * Toggle between light and dark mode
   */
  toggleTheme(): void {
    this._isDarkMode.update(current => !current);
  }
  
  /**
   * Get appropriate toggle button icon
   */
  getToggleIcon(): string {
    return this._isDarkMode() ? 'light_mode' : 'dark_mode';
  }
  
  /**
   * Get appropriate toggle button tooltip
   */
  getToggleTooltip(): string {
    return this._isDarkMode() ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
  }
} 