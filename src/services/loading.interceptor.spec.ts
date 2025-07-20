import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { LoadingService } from '@services/loading.service';
import { loadingInterceptor } from '@services/loading.interceptor';

describe('LoadingInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let loadingService: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([loadingInterceptor])),
        provideHttpClientTesting(),
        LoadingService
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    loadingService = TestBed.inject(LoadingService);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(loadingInterceptor).toBeTruthy();
  });

  describe('Petición HTTP exitosa', () => {
    it('should show loading before request and hide after success', () => {
      const testUrl = '/api/test';
      const testData = { message: 'success' };

      // Spy en los métodos del servicio
      spyOn(loadingService, 'show');
      spyOn(loadingService, 'hide');

      // Hacer la petición
      httpClient.get(testUrl).subscribe(response => {
        expect(response).toEqual(testData);
      });

      // Verificar que show() fue llamado
      expect(loadingService.show).toHaveBeenCalledTimes(1);
      expect(loadingService.hide).not.toHaveBeenCalled();

      // Simular respuesta del servidor
      const req = httpTestingController.expectOne(testUrl);
      expect(req.request.method).toBe('GET');
      req.flush(testData);

      // Verificar que hide() fue llamado después de la respuesta
      expect(loadingService.hide).toHaveBeenCalledTimes(1);
    });

    it('should handle POST requests correctly', () => {
      const testUrl = '/api/create';
      const postData = { name: 'Test' };
      const responseData = { id: 1, name: 'Test' };

      spyOn(loadingService, 'show');
      spyOn(loadingService, 'hide');

      httpClient.post(testUrl, postData).subscribe(response => {
        expect(response).toEqual(responseData);
      });

      expect(loadingService.show).toHaveBeenCalledTimes(1);

      const req = httpTestingController.expectOne(testUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(postData);
      req.flush(responseData);

      expect(loadingService.hide).toHaveBeenCalledTimes(1);
    });
  });

  describe('Petición HTTP con error', () => {
    it('should hide loading even when request fails', () => {
      const testUrl = '/api/error';

      spyOn(loadingService, 'show');
      spyOn(loadingService, 'hide');

      httpClient.get(testUrl).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      expect(loadingService.show).toHaveBeenCalledTimes(1);

      const req = httpTestingController.expectOne(testUrl);
      req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });

      // Verificar que hide() fue llamado incluso con error
      expect(loadingService.hide).toHaveBeenCalledTimes(1);
    });

    it('should handle network errors', () => {
      const testUrl = '/api/network-error';

      spyOn(loadingService, 'show');
      spyOn(loadingService, 'hide');

      httpClient.get(testUrl).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.error).toBeInstanceOf(ProgressEvent);
        }
      });

      expect(loadingService.show).toHaveBeenCalledTimes(1);

      const req = httpTestingController.expectOne(testUrl);
      req.error(new ProgressEvent('Network error'));

      expect(loadingService.hide).toHaveBeenCalledTimes(1);
    });
  });

  describe('Múltiples peticiones simultáneas', () => {
    it('should handle multiple concurrent requests', () => {
      const urls = ['/api/test1', '/api/test2', '/api/test3'];
      const responses = [
        { data: 'response1' },
        { data: 'response2' },
        { data: 'response3' }
      ];

      spyOn(loadingService, 'show');
      spyOn(loadingService, 'hide');

      // Hacer 3 peticiones simultáneas
      const requests = urls.map(url => httpClient.get(url));
      
      requests.forEach((request, index) => {
        request.subscribe(response => {
          expect(response).toEqual(responses[index]);
        });
      });

      // Verificar que show() fue llamado 3 veces
      expect(loadingService.show).toHaveBeenCalledTimes(3);
      expect(loadingService.hide).not.toHaveBeenCalled();

      // Responder a todas las peticiones
      urls.forEach((url, index) => {
        const req = httpTestingController.expectOne(url);
        req.flush(responses[index]);
      });

      // Verificar que hide() fue llamado 3 veces
      expect(loadingService.hide).toHaveBeenCalledTimes(3);
    });

    it('should handle mixed success and error responses', () => {
      const successUrl = '/api/success';
      const errorUrl = '/api/error';

      spyOn(loadingService, 'show');
      spyOn(loadingService, 'hide');

      // Petición exitosa
      httpClient.get(successUrl).subscribe(response => {
        expect(response).toEqual({ success: true });
      });

      // Petición con error
      httpClient.get(errorUrl).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      expect(loadingService.show).toHaveBeenCalledTimes(2);

      // Responder con éxito
      const successReq = httpTestingController.expectOne(successUrl);
      successReq.flush({ success: true });

      // Responder con error
      const errorReq = httpTestingController.expectOne(errorUrl);
      errorReq.flush('Not Found', { status: 404, statusText: 'Not Found' });

      // Ambas peticiones deben llamar hide()
      expect(loadingService.hide).toHaveBeenCalledTimes(2);
    });
  });

  describe('Integración con LoadingService', () => {
    it('should work with actual LoadingService state', () => {
      const testUrl = '/api/integration';
      
      // Estado inicial
      expect(loadingService.isLoading).toBeFalse();
      expect(loadingService.getLoadingCount()).toBe(0);

      // Hacer petición
      httpClient.get(testUrl).subscribe();

      // Verificar estado durante la petición
      expect(loadingService.isLoading).toBeTrue();
      expect(loadingService.getLoadingCount()).toBe(1);

      // Responder
      const req = httpTestingController.expectOne(testUrl);
      req.flush({ data: 'test' });

      // Verificar estado después de la respuesta
      expect(loadingService.isLoading).toBeFalse();
      expect(loadingService.getLoadingCount()).toBe(0);
    });

    it('should handle loading state with multiple requests', () => {
      const urls = ['/api/test1', '/api/test2'];
      
      expect(loadingService.isLoading).toBeFalse();

      // Primera petición
      httpClient.get(urls[0]).subscribe();
      expect(loadingService.isLoading).toBeTrue();
      expect(loadingService.getLoadingCount()).toBe(1);

      // Segunda petición
      httpClient.get(urls[1]).subscribe();
      expect(loadingService.isLoading).toBeTrue();
      expect(loadingService.getLoadingCount()).toBe(2);

      // Responder primera petición
      const req1 = httpTestingController.expectOne(urls[0]);
      req1.flush({ data: 'test1' });
      expect(loadingService.isLoading).toBeTrue();
      expect(loadingService.getLoadingCount()).toBe(1);

      // Responder segunda petición
      const req2 = httpTestingController.expectOne(urls[1]);
      req2.flush({ data: 'test2' });
      expect(loadingService.isLoading).toBeFalse();
      expect(loadingService.getLoadingCount()).toBe(0);
    });
  });
}); 