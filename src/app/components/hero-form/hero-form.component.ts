import { Component, OnInit, OnDestroy, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil, catchError, of } from 'rxjs';

import { MaterialModule } from '@shared/material.module';
import { HeroService } from '@services/hero.service';
import { Hero, HeroCreateRequest, HeroUpdateRequest } from '@models/hero';
import { isFutureDate, isValidDate, formatDateForInput, getCurrentDate, showSuccessMessage, showErrorMessage } from '@shared/utils';
import { UppercaseDirective } from '@app/directives/uppercase.directive';

/**
 * Dialog data interface for hero form configuration
 */
export interface HeroFormDialogData {
  hero?: Hero;
  mode: 'create' | 'edit';
}

/**
 * Form field validation limits interface
 */
interface FormLimits {
  readonly name: { min: number; max: number };
  readonly superpower: { min: number; max: number };
  readonly alterEgo: { min: number; max: number };
}

/**
 * Field display names for error messages
 */
interface FieldLabels {
  readonly [key: string]: string;
}

/**
 * Form validation limits and constraints
 */
const FORM_LIMITS: FormLimits = {
  name: { min: 2, max: 50 },
  superpower: { min: 3, max: 100 },
  alterEgo: { min: 2, max: 50 }
} as const;

/**
 * Human-readable field names for validation messages
 */
const FIELD_LABELS: FieldLabels = {
  name: 'Hero name',
  superpower: 'Superpower',
  alterEgo: 'Alter ego',
  firstAppearance: 'First appearance date'
} as const;

/**
 * Text pattern for name and alter ego fields (letters, spaces, hyphens)
 */
const NAME_PATTERN = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s-]+$/;

/**
 * Hero form component for creating and editing heroes
 * Features dual mode operation with comprehensive validation and Material Design integration
 */
@Component({
  selector: 'app-hero-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, UppercaseDirective],
  templateUrl: './hero-form.component.html',
  styleUrl: './hero-form.component.css'
})
export class HeroFormComponent implements OnInit, OnDestroy {

  /** Destruction subject for subscription cleanup */
  private readonly destroy$ = new Subject<void>();

  /** Angular services */
  private readonly fb = inject(FormBuilder);
  private readonly heroService = inject(HeroService);
  private readonly snackBar = inject(MatSnackBar);

  /** Reactive form for hero data management */
  heroForm!: FormGroup;

  /** Loading state for UI feedback during operations */
  isLoading = false;

  /** Current operation mode */
  get isEditMode(): boolean {
    return this.data.mode === 'edit';
  }

  /** Dynamic dialog title based on operation mode */
  get dialogTitle(): string {
    return this.isEditMode ? 'Edit Hero' : 'Add New Hero';
  }

  /** Dynamic action button text based on operation mode */
  get actionButtonText(): string {
    return this.isEditMode ? 'Update' : 'Create';
  }

  constructor(
    public readonly dialogRef: MatDialogRef<HeroFormComponent>,
    @Inject(MAT_DIALOG_DATA) public readonly data: HeroFormDialogData
  ) {}

  ngOnInit(): void {
    this.createForm();
    this.populateFormData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Creates the reactive form with comprehensive validation rules
   */
  private createForm(): void {
    this.heroForm = this.fb.group({
      name: ['', [
        Validators.required,
        Validators.minLength(FORM_LIMITS.name.min),
        Validators.maxLength(FORM_LIMITS.name.max),
        Validators.pattern(NAME_PATTERN)
      ]],
      superpower: ['', [
        Validators.required,
        Validators.minLength(FORM_LIMITS.superpower.min),
        Validators.maxLength(FORM_LIMITS.superpower.max)
      ]],
      alterEgo: ['', [
        Validators.required,
        Validators.minLength(FORM_LIMITS.alterEgo.min),
        Validators.maxLength(FORM_LIMITS.alterEgo.max),
        Validators.pattern(NAME_PATTERN)
      ]],
      firstAppearance: ['', [
        Validators.required,
        this.pastDateValidator
      ]],
      isActive: [true]
    });
  }

  /**
   * Populates form with existing hero data in edit mode
   */
  private populateFormData(): void {
    if (this.isEditMode && this.data.hero) {
      const hero = this.data.hero;
      this.heroForm.patchValue({
        name: hero.name,
        superpower: hero.superpower,
        alterEgo: hero.alterEgo,
        firstAppearance: formatDateForInput(hero.firstAppearance),
        isActive: hero.isActive
      });
    }
  }

  /**
   * Custom validator to ensure date is not in the future
   */
  private readonly pastDateValidator = (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    
    if (!isValidDate(control.value)) {
      return { invalidDate: true };
    }
    
    return isFutureDate(control.value) ? { futureDate: true } : null;
  };

  /**
   * Checks if a form field has validation errors and has been touched
   */
  hasFieldError(fieldName: string): boolean {
    const field = this.heroForm.get(fieldName);
    return !!(field?.invalid && field.touched);
  }

  /**
   * Returns descriptive error message for a specific field
   */
  getFieldErrorMessage(fieldName: string): string {
    const field = this.heroForm.get(fieldName);
    if (!field?.errors) return '';

    const errors = field.errors;
    const fieldLabel = FIELD_LABELS[fieldName] || 'Field';

    if (errors['required']) return `${fieldLabel} is required`;
    if (errors['minlength']) return `${fieldLabel} must be at least ${errors['minlength'].requiredLength} characters`;
    if (errors['maxlength']) return `${fieldLabel} cannot exceed ${errors['maxlength'].requiredLength} characters`;
    if (errors['pattern']) return `${fieldLabel} contains invalid characters`;
    if (errors['invalidDate']) return 'Please enter a valid date';
    if (errors['futureDate']) return 'First appearance date cannot be in the future';

    return 'Invalid field';
  }

  /**
   * Marks all form controls as touched to display validation errors
   */
  private markAllFieldsTouched(): void {
    Object.keys(this.heroForm.controls).forEach(key => {
      this.heroForm.get(key)?.markAsTouched();
    });
  }

  /**
   * Handles form submission with validation and appropriate action
   */
  onSubmit(): void {
    if (!this.heroForm.valid) {
      this.markAllFieldsTouched();
      return;
    }

    if (this.isLoading) return;

    this.isLoading = true;
    this.isEditMode ? this.updateHero() : this.createHero();
  }

  /**
   * Creates a new hero with form data
   */
  private createHero(): void {
    const heroData = this.buildHeroCreateRequest();

    this.heroService.createHero(heroData)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => this.handleServiceError('create', error))
      )
      .subscribe(result => {
        this.isLoading = false;
        if (result) {
          showSuccessMessage(this.snackBar, 'Hero created successfully');
          this.dialogRef.close(result);
        }
      });
  }

  /**
   * Updates existing hero with form data
   */
  private updateHero(): void {
    if (!this.data.hero) return;

    const heroData = this.buildHeroUpdateRequest();

    this.heroService.updateHero(heroData)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => this.handleServiceError('update', error))
      )
      .subscribe(result => {
        this.isLoading = false;
        if (result) {
          showSuccessMessage(this.snackBar, 'Hero updated successfully');
          this.dialogRef.close(result);
        }
      });
  }

  /**
   * Cancels the operation and closes the dialog
   */
  onCancel(): void {
    this.dialogRef.close();
  }

  /**
   * Builds create request object from form data
   */
  private buildHeroCreateRequest(): HeroCreateRequest {
    const formValue = this.heroForm.value;
    return {
      name: formValue.name.trim(),
      superpower: formValue.superpower.trim(),
      alterEgo: formValue.alterEgo.trim(),
      firstAppearance: new Date(formValue.firstAppearance),
      isActive: formValue.isActive
    };
  }

  /**
   * Builds update request object from form data
   */
  private buildHeroUpdateRequest(): HeroUpdateRequest {
    const createRequest = this.buildHeroCreateRequest();
    return {
      id: this.data.hero!.id,
      ...createRequest
    };
  }

  /**
   * Returns current date in YYYY-MM-DD format for date input max attribute
   */
  getCurrentDate(): string {
    return getCurrentDate();
  }

  /**
   * Handles service operation errors with consistent messaging
   */
  private handleServiceError(operation: 'create' | 'update', error: any) {
    const action = operation === 'create' ? 'creating' : 'updating';
    showErrorMessage(this.snackBar, `Error ${action} hero: ${error.message}`);
    this.isLoading = false;
    return of(null);
  }
}
