import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Client {
  id: number;
  razaoSocial: string;
  cnpj: string;
  email: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

@Injectable({ providedIn: 'root' })
export class ClientsService {
  private readonly baseUrl = `${environment.apiBaseUrl}/clients`;

  constructor(private readonly http: HttpClient) {}

  list(page = 1, limit = 10) {
    return this.http.get<PaginatedResponse<Client>>(
      `${this.baseUrl}?page=${page}&limit=${limit}`,
    );
  }

  get(id: number) {
    return this.http.get<Client>(`${this.baseUrl}/${id}`);
  }

  create(payload: Omit<Client, 'id'>) {
    return this.http.post<Client>(this.baseUrl, payload);
  }

  update(id: number, payload: Partial<Omit<Client, 'id'>>) {
    return this.http.put<Client>(`${this.baseUrl}/${id}`, payload);
  }

  remove(id: number) {
    return this.http.delete<{ deleted: boolean }>(`${this.baseUrl}/${id}`);
  }
}
