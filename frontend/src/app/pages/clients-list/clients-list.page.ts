import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { ClientsService, Client } from '../../core/services/clients.service';
import { Subject, filter, takeUntil, retry, finalize, timeout } from 'rxjs';
import Swal from 'sweetalert2';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-clients-list-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './clients-list.page.html',
})
export class ClientsListPage implements OnInit, OnDestroy {
  clients: Client[] = [];
  loading = false;
  error = '';
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly clientsService: ClientsService,
    private readonly router: Router,
    protected readonly auth: AuthService,
  ) {}

  ngOnInit() {
    this.fetch();
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntil(this.destroy$),
      )
      .subscribe((event) => {
        if (event.urlAfterRedirects.startsWith('/clientes')) {
          this.fetch();
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetch() {
    this.loading = true;
    this.error = '';
    this.clientsService
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
          this.clients = response.data;
        },
        error: (err) => {
          this.error =
            err?.error?.message ?? 'Nao foi possivel carregar os clientes. Tente novamente.';
        },
      });
  }

  remove(id: number) {
    Swal.fire({
      title: 'Excluir cliente?',
      text: 'Essa ação não poderá ser desfeita.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (!result.isConfirmed) return;
      this.clientsService.remove(id).subscribe(() => this.fetch());
    });
  }
}
