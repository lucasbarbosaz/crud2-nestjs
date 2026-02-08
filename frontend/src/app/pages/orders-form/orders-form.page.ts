import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ClientsService, Client } from '../../core/services/clients.service';
import { ProductsService, Product } from '../../core/services/products.service';
import { OrdersService } from '../../core/services/orders.service';

@Component({
  selector: 'app-orders-form-page',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './orders-form.page.html',
})
export class OrdersFormPage implements OnInit {
  clients: Client[] = [];
  products: Product[] = [];
  items: { productId: number; quantity: number; descricao: string }[] = [];
  loading = false;
  error = '';

  private readonly fb = inject(FormBuilder);
  form = this.fb.group({
    clientId: ['', Validators.required],
    productId: ['', Validators.required],
    quantity: [1, [Validators.required]],
  });

  constructor(
    private readonly clientsService: ClientsService,
    private readonly productsService: ProductsService,
    private readonly ordersService: OrdersService,
    private readonly router: Router,
  ) {}

  ngOnInit() {
    this.clientsService.list().subscribe((response) => (this.clients = response.data));
    this.productsService.list().subscribe((response) => (this.products = response.data));
  }

  addItem() {
    if (this.form.controls.productId.invalid || this.form.controls.quantity.invalid) return;
    const productId = Number(this.form.controls.productId.value);
    const quantity = Number(this.form.controls.quantity.value);
    const product = this.products.find((p) => p.id === productId);
    if (!product) return;
    this.items.push({ productId, quantity, descricao: product.descricao });
    this.form.patchValue({ productId: '', quantity: 1 });
  }

  removeItem(index: number) {
    this.items.splice(index, 1);
  }

  submit() {
    if (this.form.controls.clientId.invalid || this.items.length === 0) return;
    this.loading = true;
    this.error = '';
    const payload = {
      clientId: Number(this.form.controls.clientId.value),
      items: this.items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
    };
    this.ordersService.create(payload).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigateByUrl('/pedidos');
      },
      error: (err) => {
        this.loading = false;
        this.error =
          err?.error?.message?.message ??
          err?.error?.message ??
          'Erro ao salvar pedido';
      },
    });
  }
}
