// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/auth'; // Your backend API URL

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    console.log(password)
    return this.http.post(`${this.apiUrl}/login`, {email, password });
  }

  register(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, {email, password });
  }

  async isLoggedIn(): Promise<boolean> {
    const token = localStorage.getItem('token');
    if (!token) return false;
    try {
      const response: any = await firstValueFrom(this.http.post(`${this.apiUrl}/validate-token`, { token }));
      console.log("response.isValid")
      console.log(response.isValid)
      return response.isValid; // Return the result from the server
    } catch (error) {
      return false; // If there's an error, assume the token is invalid
    }
  }


  logout(): void {
    localStorage.removeItem('token');
  }
}
