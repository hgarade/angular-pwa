import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient) {}
  addPushSubscriber(sub: any) {
    console.log('addPushSubscriber', sub);
    return this.http.post('http://localhost:3000/api/notifications', sub);
  }

  send() {
    return this.http.post('http://localhost:3000/api/newsletter', '');
  }
}
