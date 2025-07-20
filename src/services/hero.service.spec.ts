import { TestBed } from '@angular/core/testing';
import { HeroService } from '@services/hero.service';
import { Hero, HeroCreateRequest, HeroUpdateRequest } from '@models/hero';
import { HEROES_MOCK } from '@data/heroes.mock';

describe('HeroService', () => {
  let service: HeroService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HeroService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getHeroById', () => {
    it('should return hero by id', (done) => {
      const heroId = 1;
      const expectedHero = HEROES_MOCK.find(h => h.id === heroId);
      
      service.getHeroById(heroId).subscribe(hero => {
        expect(hero).toEqual(expectedHero);
        done();
      });
    });

    it('should return undefined for non-existent hero', (done) => {
      const nonExistentId = 999;
      
      service.getHeroById(nonExistentId).subscribe(hero => {
        expect(hero).toBeUndefined();
        done();
      });
    });
  });

  describe('createHero', () => {
    it('should create a new hero', (done) => {
      const newHeroData: HeroCreateRequest = {
        name: 'Test Hero',
        superpower: 'Test Power',
        alterEgo: 'Test Alter Ego',
        firstAppearance: new Date('2023-01-01'),
        isActive: true
      };

      service.createHero(newHeroData).subscribe(createdHero => {
        expect(createdHero.id).toBeDefined();
        expect(createdHero.name).toBe('TEST HERO'); // Should be uppercase
        expect(createdHero.superpower).toBe(newHeroData.superpower);
        expect(createdHero.alterEgo).toBe(newHeroData.alterEgo);
        expect(createdHero.firstAppearance).toEqual(newHeroData.firstAppearance);
        expect(createdHero.isActive).toBe(newHeroData.isActive);
        done();
      });
    });

    it('should reject duplicate hero names', (done) => {
      const duplicateHeroData: HeroCreateRequest = {
        name: 'Spiderman', // Ya existe en HEROES_MOCK
        superpower: 'Test Power',
        alterEgo: 'Test Alter Ego',
        firstAppearance: new Date('2023-01-01'),
        isActive: true
      };

      service.createHero(duplicateHeroData).subscribe({
        next: () => {
          fail('Should have thrown an error for duplicate name');
        },
        error: (error) => {
          expect(error.message).toContain('Ya existe un héroe con el nombre');
          done();
        }
      });
    });

    it('should update heroes list after creation', (done) => {
      const newHeroData: HeroCreateRequest = {
        name: 'New Test Hero',
        superpower: 'New Test Power',
        alterEgo: 'New Test Alter Ego',
        firstAppearance: new Date('2023-01-01'),
        isActive: true
      };

      service.createHero(newHeroData).subscribe(() => {
        service.heroes$.subscribe(heroes => {
          expect(heroes.length).toBe(HEROES_MOCK.length + 1);
          const createdHero = heroes.find(h => h.name === 'NEW TEST HERO');
          expect(createdHero).toBeDefined();
          done();
        });
      });
    });
  });

  describe('updateHero', () => {
    it('should update an existing hero', (done) => {
      const updateData: HeroUpdateRequest = {
        id: 1,
        name: 'Updated Spiderman',
        superpower: 'Updated powers'
      };

      service.updateHero(updateData).subscribe(updatedHero => {
        expect(updatedHero.id).toBe(1);
        expect(updatedHero.name).toBe('UPDATED SPIDERMAN');
        expect(updatedHero.superpower).toBe('Updated powers');
        done();
      });
    });

    it('should reject update for non-existent hero', (done) => {
      const updateData: HeroUpdateRequest = {
        id: 999,
        name: 'Non-existent Hero'
      };

      service.updateHero(updateData).subscribe({
        next: () => {
          fail('Should have thrown an error for non-existent hero');
        },
        error: (error) => {
          expect(error.message).toContain('No se encontró el héroe con ID');
          done();
        }
      });
    });

    it('should reject update with duplicate name', (done) => {
      const updateData: HeroUpdateRequest = {
        id: 1,
        name: 'Superman' // Ya existe otro héroe con este nombre
      };

      service.updateHero(updateData).subscribe({
        next: () => {
          fail('Should have thrown an error for duplicate name');
        },
        error: (error) => {
          expect(error.message).toContain('Ya existe un héroe con el nombre');
          done();
        }
      });
    });
  });

  describe('deleteHero', () => {
    it('should delete an existing hero', (done) => {
      const heroIdToDelete = 1;

      service.deleteHero(heroIdToDelete).subscribe(result => {
        expect(result).toBe(true);
        
        service.heroes$.subscribe(heroes => {
          expect(heroes.length).toBe(HEROES_MOCK.length - 1);
          const deletedHero = heroes.find(h => h.id === heroIdToDelete);
          expect(deletedHero).toBeUndefined();
          done();
        });
      });
    });

    it('should reject delete for non-existent hero', (done) => {
      const nonExistentId = 999;

      service.deleteHero(nonExistentId).subscribe({
        next: () => {
          fail('Should have thrown an error for non-existent hero');
        },
        error: (error) => {
          expect(error.message).toContain('No se encontró el héroe con ID');
          done();
        }
      });
    });
  });

  describe('searchHeroesByNamePaginated', () => {
    it('should return paginated search results', (done) => {
      const searchTerm = 'man';
      const page = 1;
      const pageSize = 3;

      service.searchHeroesByNamePaginated(searchTerm, page, pageSize).subscribe(result => {
        expect(result.heroes.length).toBeLessThanOrEqual(pageSize);
        result.heroes.forEach(hero => {
          expect(hero.name.toLowerCase()).toContain(searchTerm.toLowerCase());
        });
        expect(result.currentPage).toBe(page);
        done();
      });
    });

    it('should return all heroes paginated when search is empty', (done) => {
      const searchTerm = '';
      const page = 1;
      const pageSize = 5;

      service.searchHeroesByNamePaginated(searchTerm, page, pageSize).subscribe(result => {
        expect(result.totalItems).toBe(HEROES_MOCK.length);
        done();
      });
    });
  });

  describe('heroes$ observable', () => {
    it('should emit updated heroes after creation', (done) => {
      const newHeroData: HeroCreateRequest = {
        name: 'Observable Test Hero',
        superpower: 'Observable Power',
        alterEgo: 'Observable Alter Ego',
        firstAppearance: new Date('2023-01-01'),
        isActive: true
      };

      let emissionCount = 0;
      service.heroes$.subscribe(heroes => {
        emissionCount++;
        if (emissionCount === 1) {
          // Primera emisión: datos iniciales
          expect(heroes.length).toBe(HEROES_MOCK.length);
        } else if (emissionCount === 2) {
          // Segunda emisión: después de crear héroe
          expect(heroes.length).toBe(HEROES_MOCK.length + 1);
          const createdHero = heroes.find(h => h.name === 'OBSERVABLE TEST HERO');
          expect(createdHero).toBeDefined();
          done();
        }
      });

      // Crear héroe después de suscribirse
      setTimeout(() => {
        service.createHero(newHeroData).subscribe();
      }, 100);
    });
  });
}); 