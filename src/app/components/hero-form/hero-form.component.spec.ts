import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { HeroFormComponent, HeroFormDialogData } from './hero-form.component';
import { HeroService } from '@services/hero.service';
import { Hero } from '@models/hero';

describe('HeroFormComponent', () => {
  let component: HeroFormComponent;
  let fixture: ComponentFixture<HeroFormComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<HeroFormComponent>>;
  let mockHeroService: jasmine.SpyObj<HeroService>;

  /** Mock hero data for testing */
  const mockHero: Hero = {
    id: 1,
    name: 'Test Hero',
    superpower: 'Testing powers',
    alterEgo: 'Test Alter',
    firstAppearance: new Date('2023-01-01'),
    isActive: true
  };

  /** Mock dialog data for create mode */
  const mockCreateData: HeroFormDialogData = {
    mode: 'create'
  };

  /** Mock dialog data for edit mode */
  const mockEditData: HeroFormDialogData = {
    hero: mockHero,
    mode: 'edit'
  };

  beforeEach(async () => {
    // Create service mocks with spy methods
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    mockHeroService = jasmine.createSpyObj('HeroService', ['createHero', 'updateHero']);

    // Configure service mocks to return successful responses
    mockHeroService.createHero.and.returnValue(of(mockHero));
    mockHeroService.updateHero.and.returnValue(of(mockHero));

    await TestBed.configureTestingModule({
      imports: [HeroFormComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockCreateData },
        { provide: HeroService, useValue: mockHeroService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeroFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create component successfully', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form with empty values in create mode', () => {
      expect(component.isEditMode).toBeFalse();
      expect(component.dialogTitle).toBe('Add New Hero');
      expect(component.actionButtonText).toBe('Create');
      expect(component.heroForm.get('name')?.value).toBe('');
    });

    it('should initialize form with hero data in edit mode', () => {
      // Reconfigure component for edit mode
      TestBed.overrideProvider(MAT_DIALOG_DATA, { useValue: mockEditData });
      fixture = TestBed.createComponent(HeroFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.isEditMode).toBeTrue();
      expect(component.dialogTitle).toBe('Edit Hero');
      expect(component.actionButtonText).toBe('Update');
      expect(component.heroForm.get('name')?.value).toBe(mockHero.name);
    });
  });

  describe('Form Validation', () => {
    it('should validate required fields', () => {
      const nameControl = component.heroForm.get('name');
      const superpowerControl = component.heroForm.get('superpower');
      
      nameControl?.setValue('');
      superpowerControl?.setValue('');
      nameControl?.markAsTouched();
      superpowerControl?.markAsTouched();

      expect(component.hasFieldError('name')).toBeTrue();
      expect(component.hasFieldError('superpower')).toBeTrue();
      expect(component.getFieldErrorMessage('name')).toContain('required');
    });

    it('should validate field length constraints', () => {
      const nameControl = component.heroForm.get('name');
      
      nameControl?.setValue('A'); // Too short
      nameControl?.markAsTouched();
      
      expect(component.hasFieldError('name')).toBeTrue();
      expect(component.getFieldErrorMessage('name')).toContain('at least');
    });
  });

  describe('Form Actions', () => {
    it('should close dialog on cancel', () => {
      component.onCancel();
      expect(mockDialogRef.close).toHaveBeenCalledWith();
    });

    it('should prevent submission of invalid form', () => {
      component.heroForm.patchValue({ name: '', superpower: '' });
      component.onSubmit();
      
      expect(mockHeroService.createHero).not.toHaveBeenCalled();
      expect(component.isLoading).toBeFalse();
    });
  });

  describe('Utility Methods', () => {
    it('should return current date in correct format', () => {
      const currentDate = component.getCurrentDate();
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      
      expect(currentDate).toMatch(dateRegex);
    });

    it('should handle field error checking gracefully', () => {
      expect(component.hasFieldError('nonexistent')).toBeFalse();
      expect(component.getFieldErrorMessage('nonexistent')).toBe('');
    });
  });
});
