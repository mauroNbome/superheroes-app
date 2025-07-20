/**
 * UI utility functions for status handling and Material Design integration
 */

import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Material Design color types
 */
export type MaterialColor = 'primary' | 'accent' | 'warn' | 'basic' | 'success' | 'error' | 'info';

/**
 * Status configuration interface
 */
export interface StatusConfig {
  activeText: string;
  inactiveText: string;
  pendingText?: string;
  disabledText?: string;
}

/**
 * Snackbar configuration interface
 */
export interface SnackbarConfig {
  duration: number;
  panelClass: string[];
}

/**
 * Predefined status configurations for different contexts
 */
export const STATUS_CONFIGS: Record<string, StatusConfig> = {
  hero: {
    activeText: 'Activo',
    inactiveText: 'Inactivo',
    pendingText: 'Pendiente',
    disabledText: 'Deshabilitado'
  },
  user: {
    activeText: 'Conectado',
    inactiveText: 'Desconectado',
    pendingText: 'Pendiente',
    disabledText: 'Bloqueado'
  },
  task: {
    activeText: 'En progreso',
    inactiveText: 'Completada',
    pendingText: 'Pendiente',
    disabledText: 'Cancelada'
  }
};

/**
 * Centralized snackbar configuration for consistent user feedback
 */
export const SNACKBAR_CONFIGS = {
  success: { duration: 3000, panelClass: ['success-snackbar'] as string[] },
  error: { duration: 5000, panelClass: ['error-snackbar'] as string[] },
  info: { duration: 4000, panelClass: ['info-snackbar'] as string[] },
  warning: { duration: 4000, panelClass: ['warning-snackbar'] as string[] }
};

/**
 * Get status text based on boolean state
 */
export function getStatusText(
  isActive: boolean,
  context: string = 'hero'
): string {
  const config = STATUS_CONFIGS[context] || STATUS_CONFIGS['hero'];
  return isActive ? config.activeText : config.inactiveText;
}

/**
 * Get Material Design color for status
 */
export function getStatusColor(
  isActive: boolean,
  activeColor: MaterialColor = 'primary',
  inactiveColor: MaterialColor = 'warn'
): MaterialColor {
  return isActive ? activeColor : inactiveColor;
}

/**
 * Get Material Design icon for status
 */
export function getStatusIcon(
  isActive: boolean,
  activeIcon: string = 'check_circle',
  inactiveIcon: string = 'cancel'
): string {
  return isActive ? activeIcon : inactiveIcon;
}

/**
 * Get CSS class for status styling
 */
export function getStatusClass(
  isActive: boolean,
  activeClass: string = 'status-active',
  inactiveClass: string = 'status-inactive'
): string {
  return isActive ? activeClass : inactiveClass;
}

/**
 * Shows success message using Material Snackbar with consistent styling
 */
export function showSuccessMessage(snackBar: MatSnackBar, message: string): void {
  snackBar.open(message, 'Close', SNACKBAR_CONFIGS.success);
}

/**
 * Shows error message using Material Snackbar with consistent styling
 */
export function showErrorMessage(snackBar: MatSnackBar, message: string): void {
  snackBar.open(message, 'Close', SNACKBAR_CONFIGS.error);
}

/**
 * Shows info message using Material Snackbar with consistent styling
 */
export function showInfoMessage(snackBar: MatSnackBar, message: string): void {
  snackBar.open(message, 'Close', SNACKBAR_CONFIGS.info);
}

/**
 * Shows warning message using Material Snackbar with consistent styling
 */
export function showWarningMessage(snackBar: MatSnackBar, message: string): void {
  snackBar.open(message, 'Close', SNACKBAR_CONFIGS.warning);
} 