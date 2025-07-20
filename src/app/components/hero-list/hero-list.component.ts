import { Component, OnInit, OnDestroy, ViewChild, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, startWith, switchMap, catchError, delay } from 'rxjs';
import { of } from 'rxjs';

import { MaterialModule } from '@shared/material.module';
import { HeroService } from '@services/hero.service';
import { Hero } from '@models/hero';
import { HeroFormComponent, HeroFormDialogData } from '@components/hero-form/hero-form.component';
import { DeleteConfirmationComponent } from '@components/delete-confirmation/delete-confirmation.component';
import { formatDate, getStatusText, getStatusColor, showSuccessMessage, showErrorMessage } from '@shared/utils';

/**
 * Hero list component for managing superhero collection
 * Features hybrid architecture with Angular Signals and RxJS for optimal performance
 */
@Component({
  selector: 'app-hero-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './hero-list.component.html',
  styleUrl: './hero-list.component.css'
})
export class HeroListComponent implements OnInit, OnDestroy {

  /** Destruction subject for subscription cleanup */
  private readonly destroy$ = new Subject<void>();

  /** Angular services */
  private readonly heroService = inject(HeroService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  /** Material Table components for pagination and sorting */
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  /** Initial loading state indicator */
  isLoading = signal(false);

  /** Pagination operation state indicator */
  isPaginating = signal(false);

  /** Total number of heroes */
  totalHeroes = signal(0);

  /** Fixed page size for consistent UX */
  pageSize = signal(10);

  /** Current page index (0-based) */
  currentPage = signal(0);

  /** Table column configuration */
  displayedColumns: string[] = ['id', 'name', 'superpower', 'alterEgo', 'firstAppearance', 'isActive', 'actions'];

  /** Material Table data source */
  dataSource = new MatTableDataSource<Hero>([]);

  /** Reactive search form control with debounce */
  searchControl = new FormControl('');

  ngOnInit(): void {
    this.setupSearch();
    this.loadHeroes(true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Configures reactive search with debounce and distinct value changes
   */
  private setupSearch(): void {
    this.searchControl.valueChanges
      .pipe(
        startWith(''),
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.currentPage.set(0);
        if (this.paginator) {
          this.paginator.firstPage();
        } 
        this.loadHeroes();
      });
  }

  /**
   * Loads heroes from service with optimized loading states
   */
  loadHeroes(isInitialLoad: boolean = false): void {
    const searchTerm = this.searchControl.value || '';
    
    if (isInitialLoad) {
      this.isLoading.set(true);
    } else {
      this.isPaginating.set(true);
    }
    
    this.heroService.searchHeroesByNamePaginated(searchTerm, this.currentPage() + 1, this.pageSize())
      .pipe(
        delay(isInitialLoad ? 0 : 200),
        takeUntil(this.destroy$),
        catchError(error => {
          showErrorMessage(this.snackBar, 'Error loading heroes: ' + error.message);
          return of({ heroes: [], totalItems: 0, totalPages: 0, currentPage: 0 });
        })
      )
      .subscribe((result: { heroes: Hero[]; totalItems: number; totalPages: number; currentPage: number }) => {
        this.dataSource.data = result.heroes;
        this.totalHeroes.set(result.totalItems);
        
        if (isInitialLoad) {
          this.isLoading.set(false);
        } else {
          this.isPaginating.set(false);
        }
      });
  }

  /**
   * Handles pagination changes
   */
  onPageChange(event: { pageIndex: number; pageSize: number }): void {
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadHeroes();
  }

  /**
   * Opens create hero dialog
   */
  onAddHero(): void {
    const dialogData: HeroFormDialogData = {
      mode: 'create'
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

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result) {
          this.loadHeroes();
        }
      });
  }

  /**
   * Opens edit hero dialog
   */
  onEditHero(hero: Hero): void {
    const dialogData: HeroFormDialogData = {
      hero: hero,
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

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result) {
          this.loadHeroes();
        }
      });
  }

  /**
   * Opens delete confirmation dialog and handles hero deletion
   */
  onDeleteHero(hero: Hero): void {
    const dialogRef = this.dialog.open(DeleteConfirmationComponent, {
      width: '450px',
      maxWidth: '95vw',
      maxHeight: '85vh',
      data: { hero },
      disableClose: true,
      autoFocus: false,
      restoreFocus: true,
      panelClass: 'delete-confirmation-dialog'
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.performDelete(hero);
      }
    });
  }

  /**
   * Toggles hero active status
   */
  onToggleActive(hero: Hero): void {
    const updatedHero = { ...hero, isActive: !hero.isActive };
    
    this.heroService.updateHero(updatedHero)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          showErrorMessage(this.snackBar, 'Error updating hero: ' + error.message);
          return of(null);
        })
      )
      .subscribe((result: Hero | null) => {
        if (result) {
          showSuccessMessage(this.snackBar, `Hero ${updatedHero.isActive ? 'activated' : 'deactivated'} successfully`);
          this.loadHeroes();
        }
      });
  }

  /**
   * Clears search input
   */
  clearSearch(): void {
    this.searchControl.setValue('');
  }

  /**
   * Gets status text for hero active state
   */
  getStatusText(isActive: boolean): string {
    return getStatusText(isActive, 'hero');
  }

  /**
   * Gets Material Design color for hero status
   */
  getStatusColor(isActive: boolean): string {
    return getStatusColor(isActive);
  }

  /**
   * Formats date for table display
   */
  formatDate(date: Date): string {
    return formatDate(date, 'es-ES');
  }

  /**
   * Navigates to hero detail view
   */
  viewHeroDetail(hero: Hero): void {
    this.router.navigate(['/hero', hero.id]);
  }

  /**
   * Performs hero deletion operation
   */
  private performDelete(hero: Hero): void {
    this.heroService.deleteHero(hero.id)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          showErrorMessage(this.snackBar, 'Error deleting hero: ' + error.message);
          return of(false);
        })
      )
      .subscribe((success: boolean) => {
        if (success) {
          showSuccessMessage(this.snackBar, `Hero "${hero.name}" deleted successfully`);
          this.loadHeroes();
        }
      });
  }
}
