import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

import { Hero } from '@models/hero';
import { HeroService } from '@services/hero.service';
import { formatDate, getStatusText, getStatusIcon, getStatusClass, showSuccessMessage, showErrorMessage } from '@shared/utils';
import { HeroFormComponent, HeroFormDialogData } from '../hero-form/hero-form.component';
import { DeleteConfirmationComponent } from '../delete-confirmation/delete-confirmation.component';

/**
 * Hero detail component for displaying comprehensive hero information
 * Provides full CRUD operations and navigation functionality
 */
@Component({
  selector: 'app-hero-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './hero-detail.component.html',
  styleUrl: './hero-detail.component.css'
})
export class HeroDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly heroService = inject(HeroService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  /** Current hero data or null if not found */
  hero: Hero | null = null;
  
  /** Loading state indicator */
  loading = true;

  // Utility function references for template usage
  readonly formatDate = formatDate;
  readonly getStatusText = getStatusText;
  readonly getStatusIcon = getStatusIcon;
  readonly getStatusClass = getStatusClass;

  ngOnInit(): void {
    this.loadHero();
  }

  /**
   * Loads hero data from route parameters and service
   * Handles invalid IDs and error states gracefully
   */
  private loadHero(): void {
    const heroIdStr = this.route.snapshot.paramMap.get('id');
    
    if (!heroIdStr) {
      this.loading = false;
      return;
    }

    const heroId = parseInt(heroIdStr, 10);
    if (isNaN(heroId)) {
      this.loading = false;
      return;
    }

    this.heroService.getHeroById(heroId).subscribe({
      next: (hero) => {
        this.hero = hero || null;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading hero:', error);
        this.hero = null;
        this.loading = false;
        showErrorMessage(this.snackBar, 'Error al cargar el héroe');
      }
    });
  }

  /**
   * Navigates back to hero list
   */
  goBack(): void {
    this.router.navigate(['/']);
  }

  /**
   * Opens edit dialog for current hero
   * Updates local hero data on successful edit
   */
  editHero(): void {
    if (!this.hero) return;

    const dialogData: HeroFormDialogData = {
      hero: this.hero,
      mode: 'edit'
    };

    const dialogRef = this.dialog.open(HeroFormComponent, {
      width: '550px',
      maxWidth: '95vw',
      maxHeight: '85vh',
      data: dialogData,
      disableClose: true,
      autoFocus: true,
      restoreFocus: true,
      panelClass: 'hero-form-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.hero = result;
        showSuccessMessage(this.snackBar, 'Heroe actualizado correctamente');
      }
    });
  }

  /**
   * Opens delete confirmation dialog and handles hero deletion
   * Navigates to list on successful deletion
   */
  deleteHero(): void {
    if (!this.hero) return;

    const dialogRef = this.dialog.open(DeleteConfirmationComponent, {
      width: '450px',
      maxWidth: '95vw',
      maxHeight: '85vh',
      data: { hero: this.hero },
      disableClose: true,
      autoFocus: false,
      restoreFocus: true,
      panelClass: 'delete-confirmation-dialog'
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed && this.hero) {
        this.heroService.deleteHero(this.hero.id).subscribe({
          next: () => {
            showSuccessMessage(this.snackBar, 'Heroe eliminado correctamente');
            this.router.navigate(['/']);
          },
          error: (error) => {
            console.error('Error deleting hero:', error);
            showErrorMessage(this.snackBar, 'Error al eliminar el héroe');
          }
        });
      }
    });
  }

  /**
   * Gets hero status display text for template usage
   */
  get heroStatusText(): string {
    return this.getStatusText(this.hero?.isActive ?? false, 'hero');
  }

  /**
   * Gets hero status CSS class for template usage
   */
  get heroStatusClass(): string {
    return this.getStatusClass(this.hero?.isActive ?? false);
  }

  /**
   * Gets hero status icon for template usage
   */
  get heroStatusIcon(): string {
    return this.getStatusIcon(this.hero?.isActive ?? false);
  }

  /**
   * Formats hero first appearance date for display
   */
  get heroFormattedDate(): string {
    return this.hero?.firstAppearance ? this.formatDate(this.hero.firstAppearance) : '';
  }
}