import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

export const httpRequestHeaderInterceptor: HttpInterceptorFn = (
	req: HttpRequest<any>,
	next: HttpHandlerFn
): Observable<HttpEvent<any>> => {

	// Clone the request to add custom headers
	const modifiedReq = req.clone({
		headers: req.headers
			.set('Accept-Language', 'MM')
	});

	return next(modifiedReq);
};
