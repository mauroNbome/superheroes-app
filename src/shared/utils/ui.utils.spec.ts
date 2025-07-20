import { 
  getStatusText, 
  getStatusColor, 
  getStatusIcon, 
  getStatusClass,
  showSuccessMessage,
  showErrorMessage,
  showInfoMessage,
  showWarningMessage,
  SNACKBAR_CONFIGS,
  STATUS_CONFIGS 
} from './ui.utils';
import { MatSnackBar } from '@angular/material/snack-bar';

describe('UI Utils', () => {
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(() => {
    mockSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);
  });

  describe('Status Functions', () => {
    describe('getStatusText', () => {
      it('should return active text for true value', () => {
        expect(getStatusText(true, 'hero')).toBe('Activo');
        expect(getStatusText(true, 'user')).toBe('Conectado');
        expect(getStatusText(true, 'task')).toBe('En progreso');
      });

      it('should return inactive text for false value', () => {
        expect(getStatusText(false, 'hero')).toBe('Inactivo');
        expect(getStatusText(false, 'user')).toBe('Desconectado');
        expect(getStatusText(false, 'task')).toBe('Completada');
      });

      it('should default to hero context when context not found', () => {
        expect(getStatusText(true, 'unknown')).toBe('Activo');
        expect(getStatusText(false, 'unknown')).toBe('Inactivo');
      });

      it('should default to hero context when no context provided', () => {
        expect(getStatusText(true)).toBe('Activo');
        expect(getStatusText(false)).toBe('Inactivo');
      });
    });

    describe('getStatusColor', () => {
      it('should return primary for active status', () => {
        expect(getStatusColor(true)).toBe('primary');
      });

      it('should return warn for inactive status', () => {
        expect(getStatusColor(false)).toBe('warn');
      });

      it('should accept custom colors', () => {
        expect(getStatusColor(true, 'accent', 'basic')).toBe('accent');
        expect(getStatusColor(false, 'accent', 'basic')).toBe('basic');
      });
    });

    describe('getStatusIcon', () => {
      it('should return check_circle for active status', () => {
        expect(getStatusIcon(true)).toBe('check_circle');
      });

      it('should return cancel for inactive status', () => {
        expect(getStatusIcon(false)).toBe('cancel');
      });

      it('should accept custom icons', () => {
        expect(getStatusIcon(true, 'thumb_up', 'thumb_down')).toBe('thumb_up');
        expect(getStatusIcon(false, 'thumb_up', 'thumb_down')).toBe('thumb_down');
      });
    });

    describe('getStatusClass', () => {
      it('should return status-active for active status', () => {
        expect(getStatusClass(true)).toBe('status-active');
      });

      it('should return status-inactive for inactive status', () => {
        expect(getStatusClass(false)).toBe('status-inactive');
      });

      it('should accept custom classes', () => {
        expect(getStatusClass(true, 'custom-active', 'custom-inactive')).toBe('custom-active');
        expect(getStatusClass(false, 'custom-active', 'custom-inactive')).toBe('custom-inactive');
      });
    });
  });

  describe('Snackbar Configuration', () => {
    it('should have correct success configuration', () => {
      expect(SNACKBAR_CONFIGS.success).toEqual({
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    });

    it('should have correct error configuration', () => {
      expect(SNACKBAR_CONFIGS.error).toEqual({
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    });

    it('should have correct info configuration', () => {
      expect(SNACKBAR_CONFIGS.info).toEqual({
        duration: 4000,
        panelClass: ['info-snackbar']
      });
    });

    it('should have correct warning configuration', () => {
      expect(SNACKBAR_CONFIGS.warning).toEqual({
        duration: 4000,
        panelClass: ['warning-snackbar']
      });
    });
  });

  describe('Snackbar Message Functions', () => {
    describe('showSuccessMessage', () => {
      it('should call snackBar.open with success configuration', () => {
        const message = 'Operation successful';
        
        showSuccessMessage(mockSnackBar, message);
        
        expect(mockSnackBar.open).toHaveBeenCalledWith(
          message,
          'Close',
          SNACKBAR_CONFIGS.success
        );
      });
    });

    describe('showErrorMessage', () => {
      it('should call snackBar.open with error configuration', () => {
        const message = 'Operation failed';
        
        showErrorMessage(mockSnackBar, message);
        
        expect(mockSnackBar.open).toHaveBeenCalledWith(
          message,
          'Close',
          SNACKBAR_CONFIGS.error
        );
      });
    });

    describe('showInfoMessage', () => {
      it('should call snackBar.open with info configuration', () => {
        const message = 'Information message';
        
        showInfoMessage(mockSnackBar, message);
        
        expect(mockSnackBar.open).toHaveBeenCalledWith(
          message,
          'Close',
          SNACKBAR_CONFIGS.info
        );
      });
    });

    describe('showWarningMessage', () => {
      it('should call snackBar.open with warning configuration', () => {
        const message = 'Warning message';
        
        showWarningMessage(mockSnackBar, message);
        
        expect(mockSnackBar.open).toHaveBeenCalledWith(
          message,
          'Close',
          SNACKBAR_CONFIGS.warning
        );
      });
    });
  });

  describe('STATUS_CONFIGS', () => {
    it('should have all required contexts', () => {
      expect(STATUS_CONFIGS['hero']).toBeDefined();
      expect(STATUS_CONFIGS['user']).toBeDefined();
      expect(STATUS_CONFIGS['task']).toBeDefined();
    });

    it('should have required properties for each context', () => {
      Object.values(STATUS_CONFIGS).forEach(config => {
        expect(config.activeText).toBeDefined();
        expect(config.inactiveText).toBeDefined();
      });
    });
  });
}); 