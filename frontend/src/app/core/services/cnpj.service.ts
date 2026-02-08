import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface CnpjResponse {
  razao_social?: string;
  estabelecimento?: {
    cnpj?: string;
    email?: string;
  };
}

@Injectable({ providedIn: 'root' })
export class CnpjService {
  constructor(private readonly http: HttpClient) {}

  lookup(cnpj: string) {
    const digits = cnpj.replace(/\D/g, '');
    return this.http.get<CnpjResponse>(`${environment.apiBaseUrl}/cnpj/${digits}`);
  }
}
