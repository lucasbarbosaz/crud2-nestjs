import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrdersService, Order } from '../../core/services/orders.service';
import { AuthService } from '../../core/auth/auth.service';
import { finalize, retry, timeout } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-orders-list-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './orders-list.page.html',
})
export class OrdersListPage implements OnInit {
  orders: Order[] = [];
  loading = false;
  error = '';

  constructor(
    private readonly ordersService: OrdersService,
    protected readonly auth: AuthService,
  ) {}

  ngOnInit() {
    this.fetch();
  }

  fetch() {
    this.loading = true;
    this.error = '';
    this.ordersService
      .list()
      .pipe(
        retry({ count: 1, delay: 300 }),
        timeout(5000),
        finalize(() => {
          this.loading = false;
        }),
      )
      .subscribe({
        next: (response) => {
          this.orders = response.data;
        },
        error: (err) => {
          this.error =
            err?.error?.message ?? 'Nao foi possivel carregar os pedidos. Tente novamente.';
        },
      });
  }

  remove(id: number) {
    Swal.fire({
      title: 'Excluir pedido?',
      text: 'Essa ação não poderá ser desfeita.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (!result.isConfirmed) return;
      this.ordersService.remove(id).subscribe(() => this.fetch());
    });
  }
}
