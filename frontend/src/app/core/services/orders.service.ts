import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PaginatedResponse } from './clients.service';
import { Client } from './clients.service';
import { Product } from './products.service';

export interface OrderItem {
  id: number;
  product: Product;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: number;
  client: Client;
  items: OrderItem[];
  createdAt: string;
}

export interface CreateOrderPayload {
  clientId: number;
  items: { productId: number; quantity: number }[];
}

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly baseUrl = `${environment.apiBaseUrl}/orders`;

  constructor(private readonly http: HttpClient) {}

  list(page = 1, limit = 10) {
    return this.http.get<PaginatedResponse<Order>>(
      `${this.baseUrl}?page=${page}&limit=${limit}`,
    );
  }

  get(id: number) {
    return this.http.get<Order>(`${this.baseUrl}/${id}`);
  }

  create(payload: CreateOrderPayload) {
    return this.http.post<Order>(this.baseUrl, payload);
  }

  remove(id: number) {
    return this.http.delete<{ deleted: boolean }>(`${this.baseUrl}/${id}`);
  }
}
