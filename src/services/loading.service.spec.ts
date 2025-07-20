import { TestBed } from '@angular/core/testing';
import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize with loading false', () => {
      expect(service.loading()).toBe(false);
    });

    it('should have loading$ observable for compatibility', () => {
      expect(service.loading$).toBeDefined();
      service.loading$.subscribe(value => {
        expect(value).toBe(false);
      });
    });
  });

  describe('show() method', () => {
    it('should set loading to true', () => {
      service.show();
      expect(service.loading()).toBe(true);
    });

    it('should handle multiple concurrent calls', () => {
      service.show();
      service.show();
      service.show();
      
      expect(service.loading()).toBe(true);
    });
  });

  describe('hide() method', () => {
    it('should handle request lifecycle correctly', () => {
      service.show();
      service.show();
      expect(service.loading()).toBe(true);
      
      service.hide();
      expect(service.loading()).toBe(true);
      
      service.hide();
      expect(service.loading()).toBe(false);
    });

    it('should not go below zero', () => {
      service.hide();
      service.hide();
      
      expect(service.loading()).toBe(false);
    });
  });

  describe('forceHide() method', () => {
    it('should reset loading to false immediately', () => {
      service.show();
      service.show();
      service.show();
      expect(service.loading()).toBe(true);
      
      service.forceHide();
      expect(service.loading()).toBe(false);
    });
  });

  describe('Signal reactivity', () => {
    it('should update computed signal when count changes', () => {
      expect(service.loading()).toBe(false);
      
      service.show();
      expect(service.loading()).toBe(true);
      
      service.hide();
      expect(service.loading()).toBe(false);
    });

    it('should maintain Observable compatibility', () => {
      expect(service.loading$).toBeDefined();
      
      service.loading$.subscribe(value => {
        expect(typeof value).toBe('boolean');
      });
      
      expect(service.loading()).toBe(false);
      
      service.show();
      expect(service.loading()).toBe(true);
      
      service.hide();
      expect(service.loading()).toBe(false);
    });
  });
}); 