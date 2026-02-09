import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductsService, Product } from '../../core/services/products.service';
import { AuthService } from '../../core/auth/auth.service';
import { finalize, retry, timeout } from 'rxjs';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-products-list-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './products-list.page.html',
})
export class ProductsListPage implements OnInit {
  products: Product[] = [];
  loading = false;
  error = '';
  readonly assetsBaseUrl = environment.apiBaseUrl.replace(/\/api\/v1$/, '');
  readonly placeholderImageUrl = 'https://i.imgur.com/03N27iR.png';
  expandedProductId: number | null = null;
  modalOpen = false;
  modalImages: string[] = [];
  modalIndex = 0;
  page = 1;
  limit = 10;
  totalPages = 1;

  constructor(
    private readonly productsService: ProductsService,
    protected readonly auth: AuthService,
  ) {}

  ngOnInit() {
    this.fetch();
  }

  fetch() {
    this.loading = true;
    this.error = '';
    this.productsService
      .list(this.page, this.limit)
      .pipe(
        retry({ count: 1, delay: 300 }),
        timeout(5000),
        finalize(() => {
          this.loading = false;
        }),
      )
      .subscribe({
        next: (response) => {
          this.products = response.data;
          this.totalPages = response.meta?.totalPages ?? 1;
        },
        error: (err) => {
          this.error =
            err?.error?.message ?? 'Nao foi possivel carregar os produtos. Tente novamente.';
        },
      });
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.page = page;
    this.fetch();
  }

  prevPage() {
    this.goToPage(this.page - 1);
  }

  nextPage() {
    this.goToPage(this.page + 1);
  }

  toggleImages(productId: number) {
    this.expandedProductId = this.expandedProductId === productId ? null : productId;
  }

  openImagesModal(product: Product) {
    const urls = (product.images ?? []).map((image) => this.assetsBaseUrl + image.url);
    this.modalImages = urls.length > 0 ? urls : [this.placeholderImageUrl];
    this.modalIndex = 0;
    this.modalOpen = true;
  }

  closeImagesModal() {
    this.modalOpen = false;
    this.modalImages = [];
    this.modalIndex = 0;
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.modalOpen) {
      this.closeImagesModal();
    }
  }

  prevImage() {
    if (this.modalImages.length === 0) return;
    this.modalIndex =
      (this.modalIndex - 1 + this.modalImages.length) % this.modalImages.length;
  }

  nextImage() {
    if (this.modalImages.length === 0) return;
    this.modalIndex = (this.modalIndex + 1) % this.modalImages.length;
  }

  getPrimaryImageUrl(product: Product) {
    if (!product.images || product.images.length === 0) {
      return this.placeholderImageUrl;
    }
    const primary = product.images.find((image) => image.isPrimary);
    const image = primary ?? product.images[0];
    return this.assetsBaseUrl + image.url;
  }

  remove(id: number) {
    Swal.fire({
      title: 'Excluir produto?',
      text: 'Essa ação não poderá ser desfeita.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (!result.isConfirmed) return;
      this.productsService.remove(id).subscribe({
        next: () => this.fetch(),
        error: (err) => {
          const message =
            err?.error?.message?.message ??
            err?.error?.message ??
            'Não foi possível excluir o produto.';
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'error',
            title: message,
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
          });
        },
      });
    });
  }
}
