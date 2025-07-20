import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, map, filter } from 'rxjs/operators';
import { Hero, HeroCreateRequest, HeroUpdateRequest } from '@models/hero';
import { HEROES_MOCK } from '@data/heroes.mock';

/**
 * Hero management service with reactive state management
 */
@Injectable({
  providedIn: 'root'
})
export class HeroService {
  
  /**
   * BehaviorSubject for reactive state management
   * Provides immediate state to new subscribers
   */
  private heroesSubject = new BehaviorSubject<Hero[]>([...HEROES_MOCK]);
  
  /**
   * Auto-increment ID generator
   */
  private nextId = Math.max(...HEROES_MOCK.map(h => h.id)) + 1;

  /**
   * Public observable for component subscriptions
   */
  public heroes$ = this.heroesSubject.asObservable();

  constructor() {}

  /**
   * Find hero by ID
   */
  getHeroById(id: number): Observable<Hero | undefined> {
    return this.heroes$.pipe(
      map(heroes => heroes.find(hero => hero.id === id)),
      delay(200)
    );
  }

  /**
   * Create new hero with validation and name normalization
   */
  createHero(heroData: HeroCreateRequest): Observable<Hero> {
    const currentHeroes = this.heroesSubject.value;
    
    // Validate unique name
    const nameExists = currentHeroes.some(hero => 
      hero.name.toLowerCase() === heroData.name.toLowerCase()
    );
    
    if (nameExists) {
      return throwError(() => new Error(`Ya existe un héroe con el nombre "${heroData.name}"`));
    }

    const newHero: Hero = {
      id: this.nextId++,
      name: heroData.name.toUpperCase(),
      superpower: heroData.superpower,
      alterEgo: heroData.alterEgo,
      firstAppearance: heroData.firstAppearance,
      isActive: heroData.isActive ?? true
    };

    // Immutable state update
    const updatedHeroes = [...currentHeroes, newHero];
    this.heroesSubject.next(updatedHeroes);

    return of(newHero).pipe(
      delay(500)
    );
  }

  /**
   * Update existing hero with validation
   */
  updateHero(heroData: HeroUpdateRequest): Observable<Hero> {
    const currentHeroes = this.heroesSubject.value;
    const heroIndex = currentHeroes.findIndex(hero => hero.id === heroData.id);

    if (heroIndex === -1) {
      return throwError(() => new Error(`No se encontró el héroe con ID ${heroData.id}`));
    }

    // Validate unique name (excluding current hero)
    if (heroData.name) {
      const nameExists = currentHeroes.some(hero => 
        hero.id !== heroData.id && 
        hero.name.toLowerCase() === heroData.name!.toLowerCase()
      );

      if (nameExists) {
        return throwError(() => new Error(`Ya existe un héroe con el nombre "${heroData.name}"`));
      }
    }

    const updatedHero: Hero = {
      ...currentHeroes[heroIndex],
      ...heroData,
      name: heroData.name ? heroData.name.toUpperCase() : currentHeroes[heroIndex].name
    };

    const updatedHeroes = [...currentHeroes];
    updatedHeroes[heroIndex] = updatedHero;
    this.heroesSubject.next(updatedHeroes);

    return of(updatedHero).pipe(
      delay(400)
    );
  }

  /**
   * Delete hero by ID
   */
  deleteHero(id: number): Observable<boolean> {
    const currentHeroes = this.heroesSubject.value;
    const heroIndex = currentHeroes.findIndex(hero => hero.id === id);

    if (heroIndex === -1) {
      return throwError(() => new Error(`No se encontró el héroe con ID ${id}`));
    }

    const updatedHeroes = currentHeroes.filter(hero => hero.id !== id);
    this.heroesSubject.next(updatedHeroes);

    return of(true).pipe(
      delay(300)
    );
  }

  /**
   * Search and paginate heroes
   */
  searchHeroesByNamePaginated(
    name: string, 
    page: number = 1, 
    pageSize: number = 5
  ): Observable<{
    heroes: Hero[],
    totalItems: number,
    totalPages: number,
    currentPage: number
  }> {
    return this.heroes$.pipe(
      map(heroes => {
        const filteredHeroes = name.trim() 
          ? heroes.filter(hero => 
              hero.name.toLowerCase().includes(name.toLowerCase())
            )
          : heroes;

        const totalItems = filteredHeroes.length;
        const totalPages = Math.ceil(totalItems / pageSize);
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedHeroes = filteredHeroes.slice(startIndex, endIndex);

        return {
          heroes: paginatedHeroes,
          totalItems,
          totalPages,
          currentPage: page
        };
      }),
      delay(350)
    );
  }
} 