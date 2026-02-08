import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PaginatedResponse } from './clients.service';

export interface ProductImage {
  id: number;
  url: string;
  isPrimary?: boolean;
}

export interface Product {
  id: number;
  descricao: string;
  valorVenda: number;
  estoque: number;
  images: ProductImage[];
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly baseUrl = `${environment.apiBaseUrl}/products`;

  constructor(private readonly http: HttpClient) {}

  list(page = 1, limit = 10) {
    return this.http.get<PaginatedResponse<Product>>(
      `${this.baseUrl}?page=${page}&limit=${limit}`,
    );
  }

  get(id: number) {
    return this.http.get<Product>(`${this.baseUrl}/${id}`);
  }

  create(payload: Omit<Product, 'id' | 'images'>, images: File[], primaryIndex = 0) {
    const form = new FormData();
    form.append('descricao', payload.descricao);
    form.append('valorVenda', String(payload.valorVenda));
    form.append('estoque', String(payload.estoque));
    form.append('primaryIndex', String(primaryIndex));
    images.forEach((file) => form.append('images', file));
    return this.http.post<Product>(this.baseUrl, form);
  }

  update(id: number, payload: Partial<Omit<Product, 'id' | 'images'>>, images?: File[]) {
    if (images && images.length > 0) {
      const form = new FormData();
      if (payload.descricao !== undefined) form.append('descricao', payload.descricao);
      if (payload.valorVenda !== undefined) form.append('valorVenda', String(payload.valorVenda));
      if (payload.estoque !== undefined) form.append('estoque', String(payload.estoque));
      images.forEach((file) => form.append('images', file));
      return this.http.put<Product>(`${this.baseUrl}/${id}`, form);
    }
    return this.http.put<Product>(`${this.baseUrl}/${id}`, payload);
  }

  setDefaultImage(productId: number, imageId: number) {
    return this.http.put<Product>(`${this.baseUrl}/${productId}/images/${imageId}/default`, {});
  }

  removeImage(productId: number, imageId: number) {
    return this.http.delete<Product>(`${this.baseUrl}/${productId}/images/${imageId}`);
  }

  remove(id: number) {
    return this.http.delete<{ deleted: boolean }>(`${this.baseUrl}/${id}`);
  }
}
