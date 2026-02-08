import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClientsService } from '../../core/services/clients.service';
import { CnpjService } from '../../core/services/cnpj.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-clients-form-page',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './clients-form.page.html',
})
export class ClientsFormPage implements OnInit {
  loading = false;
  cnpjLoading = false;
  error = '';
  private readonly fb = inject(FormBuilder);
  form = this.fb.group({
    cnpj: ['', [Validators.required, Validators.pattern(/^\d{14}$/)]],
    razaoSocial: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
  });
  clientId: number | null = null;

  constructor(
    private readonly clientsService: ClientsService,
    private readonly cnpjService: CnpjService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.clientId = id ? Number(id) : null;
    if (this.clientId) {
      this.clientsService.get(this.clientId).subscribe((client) => {
        this.form.patchValue({
          cnpj: client.cnpj,
          razaoSocial: client.razaoSocial,
          email: client.email,
        });
      });
    }
  }

  onCnpjInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const digits = (target.value || '').replace(/\D/g, '');
    this.form.patchValue({ cnpj: digits }, { emitEvent: false });
    if (digits.length !== 14) {
      this.form.patchValue({ razaoSocial: '', email: '' }, { emitEvent: false });
    }
  }

  buscarCnpj() {
    const cnpj = this.form.get('cnpj')?.value ?? '';
    const digits = cnpj.replace(/\D/g, '');
    if (digits.length !== 14) {
      this.error = 'CNPJ inválido';
      this.form.patchValue({ razaoSocial: '', email: '' });
      return;
    }
    this.error = '';
    if (!cnpj) return;
    this.cnpjLoading = true;
    this.cnpjService.lookup(cnpj).subscribe({
      next: (response) => {
        this.cnpjLoading = false;
        if (response.razao_social) {
          this.form.patchValue({ razaoSocial: response.razao_social });
        }
        if (response.estabelecimento?.email) {
          this.form.patchValue({ email: response.estabelecimento.email });
        }
      },
      error: () => {
        this.cnpjLoading = false;
        this.error = 'CNPJ não encontrado';
        this.form.patchValue({ razaoSocial: '', email: '' });
      },
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    const raw = this.form.getRawValue();
    const payload = {
      cnpj: (raw.cnpj ?? '').replace(/\D/g, ''),
      razaoSocial: raw.razaoSocial ?? '',
      email: raw.email ?? '',
    };
    const request = this.clientId
      ? this.clientsService.update(this.clientId, payload)
      : this.clientsService.create(payload);
    request.subscribe({
      next: () => {
        this.loading = false;
        this.router.navigateByUrl('/clientes');
      },
      error: (err) => {
        this.loading = false;
        this.error =
          err?.error?.message?.message ??
          err?.error?.message ??
          'Erro ao salvar cliente';
      },
    });
  }
}
