import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingComponent } from './loading.component';
import { LoadingService } from '@services/loading.service';
import { MaterialModule } from '@shared/material.module';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('LoadingComponent', () => {
  let component: LoadingComponent;
  let fixture: ComponentFixture<LoadingComponent>;
  let loadingService: jasmine.SpyObj<LoadingService>;

  beforeEach(async () => {
    const loadingServiceSpy = jasmine.createSpyObj('LoadingService', ['show', 'hide', 'forceHide'], {
      loading: jasmine.createSpy('loading').and.returnValue(false)
    });

    await TestBed.configureTestingModule({
      imports: [LoadingComponent, MaterialModule, NoopAnimationsModule],
      providers: [
        { provide: LoadingService, useValue: loadingServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingComponent);
    component = fixture.componentInstance;
    loadingService = TestBed.inject(LoadingService) as jasmine.SpyObj<LoadingService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Inicialización', () => {
    it('should initialize with loading signal', () => {
      expect(component.loading).toBeDefined();
      expect(typeof component.loading).toBe('function');
    });

    it('should not show overlay initially', () => {
      loadingService.loading.and.returnValue(false);
      fixture.detectChanges();
      
      const overlay = fixture.debugElement.query(By.css('.loading-overlay'));
      expect(overlay).toBeFalsy();
    });
  });

  describe('Mostrar loading', () => {
    it('should show overlay when loading is true', () => {
      loadingService.loading.and.returnValue(true);
      fixture.detectChanges();

      const overlay = fixture.debugElement.query(By.css('.loading-overlay'));
      expect(overlay).toBeTruthy();
    });

    it('should display loading text', () => {
      loadingService.loading.and.returnValue(true);
      fixture.detectChanges();

      const loadingText = fixture.debugElement.query(By.css('.loading-text'));
      expect(loadingText).toBeTruthy();
      expect(loadingText.nativeElement.textContent.trim()).toBe('Cargando...');
    });

    it('should display spinner when loading', () => {
      loadingService.loading.and.returnValue(true);
      fixture.detectChanges();

      const spinner = fixture.debugElement.query(By.css('mat-spinner'));
      expect(spinner).toBeTruthy();
    });
  });

  describe('Ocultar loading', () => {
    it('should hide overlay when loading is false', () => {
      loadingService.loading.and.returnValue(false);
      fixture.detectChanges();

      const overlay = fixture.debugElement.query(By.css('.loading-overlay'));
      expect(overlay).toBeFalsy();
    });
  });

  describe('Estilos y accesibilidad', () => {
    it('should have proper z-index for overlay', () => {
      loadingService.loading.and.returnValue(true);
      fixture.detectChanges();

      const overlay = fixture.debugElement.query(By.css('.loading-overlay'));
      const styles = window.getComputedStyle(overlay.nativeElement);
      expect(parseInt(styles.zIndex)).toBeGreaterThan(1000);
    });

    it('should have loading text for screen readers', () => {
      loadingService.loading.and.returnValue(true);
      fixture.detectChanges();

      const loadingText = fixture.debugElement.query(By.css('.loading-text'));
      expect(loadingText.nativeElement.textContent.trim()).toBe('Cargando...');
    });
  });

  describe('Signal binding', () => {
    it('should use signal binding correctly', () => {
      expect(typeof component.loading).toBe('function');
      
      loadingService.loading.and.returnValue(true);
      fixture.detectChanges();
      
      const overlay = fixture.debugElement.query(By.css('.loading-overlay'));
      expect(overlay).toBeTruthy();
    });
  });
}); 