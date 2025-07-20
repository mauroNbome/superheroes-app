import { ComponentFixture, TestBed, fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
import { HeroListComponent } from './hero-list.component';
import { HeroService } from '@services/hero.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '@shared/material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { Hero } from '@models/hero';
import { DeleteConfirmationComponent } from '@components/delete-confirmation/delete-confirmation.component';

describe('HeroListComponent', () => {
  let component: HeroListComponent;
  let fixture: ComponentFixture<HeroListComponent>;
  let heroService: jasmine.SpyObj<HeroService>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let dialog: jasmine.SpyObj<MatDialog>;

  const mockHeroes: Hero[] = [
    {
      id: 1,
      name: 'SUPERMAN',
      superpower: 'Vuelo y fuerza sobrehumana',
      alterEgo: 'Clark Kent',
      firstAppearance: new Date('1938-06-01'),
      isActive: true
    },
    {
      id: 2,
      name: 'BATMAN',
      superpower: 'Inteligencia y tecnología',
      alterEgo: 'Bruce Wayne',
      firstAppearance: new Date('1939-05-01'),
      isActive: true
    },
    {
      id: 3,
      name: 'WONDER WOMAN',
      superpower: 'Fuerza amazónica',
      alterEgo: 'Diana Prince',
      firstAppearance: new Date('1941-12-01'),
      isActive: false
    }
  ];

  /** Mock paginated response structure */
  const mockPaginatedResponse = {
    heroes: mockHeroes,
    totalItems: mockHeroes.length,
    totalPages: 1,
    currentPage: 1
  };

  beforeEach(async () => {
    const heroServiceSpy = jasmine.createSpyObj('HeroService', [
      'searchHeroesByNamePaginated',
      'updateHero',
      'deleteHero'
    ]);

    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        HeroListComponent,
        MaterialModule,
        ReactiveFormsModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: HeroService, useValue: heroServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: MatDialog, useValue: dialogSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeroListComponent);
    component = fixture.componentInstance;
    heroService = TestBed.inject(HeroService) as jasmine.SpyObj<HeroService>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;

    // Setup default spy returns
    heroService.searchHeroesByNamePaginated.and.returnValue(of(mockPaginatedResponse));
    heroService.updateHero.and.returnValue(of(mockHeroes[0]));
    heroService.deleteHero.and.returnValue(of(true));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with correct default values', () => {
      expect(component.isLoading()).toBeFalse();
      expect(component.isPaginating()).toBeFalse();
      expect(component.totalHeroes()).toBe(0);
      expect(component.pageSize()).toBe(10);
      expect(component.currentPage()).toBe(0);
      expect(component.searchControl.value).toBe('');
    });

    it('should load heroes on initialization', fakeAsync(() => {
      component.ngOnInit();
      tick(400); // Wait for debounce + delay

      expect(heroService.searchHeroesByNamePaginated).toHaveBeenCalledWith('', 1, 10);
      expect(component.dataSource.data).toEqual(mockHeroes);
      expect(component.totalHeroes()).toBe(mockHeroes.length);
    }));
  });

  describe('Search Functionality', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should perform search with debounce', fakeAsync(() => {
      component.searchControl.setValue('SUPER');
      tick(300); // Wait for debounce

      expect(heroService.searchHeroesByNamePaginated).toHaveBeenCalledWith('SUPER', 1, 10);
    }));

    it('should reset pagination when searching', fakeAsync(() => {
      component.currentPage.set(2); // Set to page 2
      component.searchControl.setValue('BATMAN');
      tick(300);

      expect(component.currentPage()).toBe(0);
    }));

    it('should clear search when clearSearch is called', () => {
      component.searchControl.setValue('test');
      component.clearSearch();
      
      expect(component.searchControl.value).toBe('');
    });
  });

  describe('Loading States', () => {
    it('should show initial loading state', () => {
      component.loadHeroes(true);
      expect(component.isLoading()).toBeTrue();
      expect(component.isPaginating()).toBeFalse();
    });

    it('should show pagination loading state', () => {
      component.loadHeroes(false);
      expect(component.isLoading()).toBeFalse();
      expect(component.isPaginating()).toBeTrue();
    });
  });

  describe('Pagination', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should handle page changes', () => {
      const pageEvent = { pageIndex: 2, pageSize: 10 };
      component.onPageChange(pageEvent);

      expect(component.currentPage()).toBe(2);
      expect(component.pageSize()).toBe(10);
      expect(heroService.searchHeroesByNamePaginated).toHaveBeenCalledWith('', 3, 10);
    });
  });

  describe('Hero Operations', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

         it('should toggle hero active status', fakeAsync(() => {
       const hero = mockHeroes[0];
       const updatedHero = { ...hero, isActive: false };
       heroService.updateHero.and.returnValue(of(updatedHero));

       component.onToggleActive(hero);
       tick();

       expect(heroService.updateHero).toHaveBeenCalledWith(updatedHero);
       expect(snackBar.open).toHaveBeenCalledWith(
         'Hero deactivated successfully',
         'Close',
         jasmine.objectContaining({
           duration: 3000,
           panelClass: ['success-snackbar']
         })
       );
     }));

         it('should handle toggle errors gracefully', fakeAsync(() => {
       const hero = mockHeroes[0];
       heroService.updateHero.and.returnValue(throwError(() => new Error('Update failed')));

       component.onToggleActive(hero);
       tick();

       expect(snackBar.open).toHaveBeenCalledWith(
         'Error updating hero: Update failed',
         'Close',
         jasmine.objectContaining({
           duration: 5000,
           panelClass: ['error-snackbar']
         })
       );
     }));
  });

  describe('Dialog Operations', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should open create hero dialog', () => {
      const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
      dialogRefSpy.afterClosed.and.returnValue(of(null));
      dialog.open.and.returnValue(dialogRefSpy);

      component.onAddHero();

      expect(dialog.open).toHaveBeenCalled();
    });

    it('should open edit hero dialog', () => {
      const hero = mockHeroes[0];
      const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
      dialogRefSpy.afterClosed.and.returnValue(of(null));
      dialog.open.and.returnValue(dialogRefSpy);

      component.onEditHero(hero);

      expect(dialog.open).toHaveBeenCalled();
    });

    it('should open delete confirmation dialog', () => {
      const hero = mockHeroes[0];
      const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
      dialogRefSpy.afterClosed.and.returnValue(of(false));
      dialog.open.and.returnValue(dialogRefSpy);

      component.onDeleteHero(hero);

      expect(dialog.open).toHaveBeenCalledWith(
        DeleteConfirmationComponent,
        jasmine.any(Object)
      );
    });

    it('should delete hero when confirmed', fakeAsync(() => {
      const hero = mockHeroes[0];
      const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
      dialogRefSpy.afterClosed.and.returnValue(of(true));
      dialog.open.and.returnValue(dialogRefSpy);

      component.onDeleteHero(hero);
      tick();

      expect(heroService.deleteHero).toHaveBeenCalledWith(hero.id);
    }));
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

         it('should handle search errors gracefully', fakeAsync(() => {
       heroService.searchHeroesByNamePaginated.and.returnValue(
         throwError(() => new Error('Search failed'))
       );

       component.loadHeroes();
       tick(300);

       expect(snackBar.open).toHaveBeenCalledWith(
         'Error loading heroes: Search failed',
         'Close',
         jasmine.objectContaining({
           duration: 5000,
           panelClass: ['error-snackbar']
         })
       );
       expect(component.dataSource.data).toEqual([]);
       expect(component.totalHeroes()).toBe(0);
     }));

         it('should handle delete errors gracefully', fakeAsync(() => {
       const hero = mockHeroes[0];
       heroService.deleteHero.and.returnValue(throwError(() => new Error('Delete failed')));

       component['performDelete'](hero);
       tick();

       expect(snackBar.open).toHaveBeenCalledWith(
         'Error deleting hero: Delete failed',
         'Close',
         jasmine.objectContaining({
           duration: 5000,
           panelClass: ['error-snackbar']
         })
       );
     }));
  });

  describe('Utility Methods', () => {
    it('should format dates correctly', () => {
      const date = new Date('2023-01-15');
      const formatted = component.formatDate(date);
      expect(formatted).toBeTruthy();
    });

    it('should return correct status text', () => {
      expect(component.getStatusText(true)).toBe('Activo');
      expect(component.getStatusText(false)).toBe('Inactivo');
    });

    it('should return correct status colors', () => {
      expect(component.getStatusColor(true)).toBe('primary');
      expect(component.getStatusColor(false)).toBe('warn');
    });
  });

  describe('Navigation', () => {
    it('should navigate to hero detail', () => {
      const routerSpy = spyOn(component['router'], 'navigate');
      const hero = mockHeroes[0];

      component.viewHeroDetail(hero);

      expect(routerSpy).toHaveBeenCalledWith(['/hero', hero.id]);
    });
  });
}); 