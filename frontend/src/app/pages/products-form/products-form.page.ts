import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ProductsService, ProductImage } from '../../core/services/products.service';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-products-form-page',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FormsModule],
  templateUrl: './products-form.page.html',
})
export class ProductsFormPage implements OnInit, OnDestroy {
  loading = false;
  error = '';
  productId: number | null = null;
  selectedFiles: File[] = [];
  previewUrls: string[] = [];
  selectedPrimaryIndex = 0;
  existingImages: ProductImage[] = [];
  readonly assetsBaseUrl = environment.apiBaseUrl.replace(/\/api\/v1$/, '');
  private readonly fb = inject(FormBuilder);
  form = this.fb.group({
    descricao: ['', [Validators.required]],
    valorVenda: [0, [Validators.required, Validators.min(0)]],
    estoque: [0, [Validators.required, Validators.min(0)]],
  });

  constructor(
    private readonly productsService: ProductsService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  get isEdit() {
    return this.productId !== null;
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.productId = id ? Number(id) : null;
    if (this.productId) {
      this.productsService.get(this.productId).subscribe((product) => {
        this.form.patchValue({
          descricao: product.descricao,
          valorVenda: product.valorVenda,
          estoque: product.estoque,
        });
        this.existingImages = product.images ?? [];
      });
    }
  }

  onFilesChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    const files = Array.from(input.files);
    const maxImages = this.isEdit ? Math.max(5 - this.existingImages.length, 0) : 5;
    if (maxImages === 0) {
      this.error = 'Máximo de 5 imagens por produto';
      this.selectedFiles = [];
      this.previewUrls.forEach((url) => URL.revokeObjectURL(url));
      this.previewUrls = [];
      return;
    }
    if (files.length > maxImages) {
      this.error = `Máximo de ${maxImages} novas imagens`;
    } else {
      this.error = '';
    }
    this.selectedFiles = files.slice(0, maxImages);
    this.previewUrls.forEach((url) => URL.revokeObjectURL(url));
    this.previewUrls = this.selectedFiles.map((file) => URL.createObjectURL(file));
    this.selectedPrimaryIndex = 0;
  }

  removeNewImage(index: number) {
    const removedUrl = this.previewUrls[index];
    this.previewUrls.splice(index, 1);
    this.selectedFiles.splice(index, 1);
    if (removedUrl) {
      URL.revokeObjectURL(removedUrl);
    }
    if (this.selectedPrimaryIndex === index) {
      this.selectedPrimaryIndex = 0;
    } else if (this.selectedPrimaryIndex > index) {
      this.selectedPrimaryIndex -= 1;
    }
  }

  ngOnDestroy() {
    this.previewUrls.forEach((url) => URL.revokeObjectURL(url));
  }

  submit() {
    if (this.form.invalid) return;
    const rawCheck = this.form.getRawValue();
    if ((rawCheck.valorVenda ?? 0) < 0 || (rawCheck.estoque ?? 0) < 0) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'warning',
        title: 'Valor negativo não permitido',
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
      });
      return;
    }
    this.loading = true;
    this.error = '';
    const raw = rawCheck;
    const payload = {
      descricao: raw.descricao ?? '',
      valorVenda: raw.valorVenda ?? 0,
      estoque: raw.estoque ?? 0,
    };
    if (this.isEdit && this.productId) {
      this.productsService.update(this.productId, payload, this.selectedFiles).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigateByUrl('/produtos');
        },
        error: (err) => {
          this.loading = false;
          this.error =
            err?.error?.message?.message ??
            err?.error?.message ??
            'Erro ao atualizar produto';
        },
      });
      return;
    }

    this.productsService
      .create(payload, this.selectedFiles, this.selectedPrimaryIndex)
      .subscribe({
        next: () => {
          this.loading = false;
          this.router.navigateByUrl('/produtos');
        },
        error: (err) => {
          this.loading = false;
          this.error =
            err?.error?.message?.message ??
            err?.error?.message ??
            'Erro ao cadastrar produto';
        },
      });
  }

  setDefaultImage(imageId: number) {
    if (!this.productId) return;
    this.productsService.setDefaultImage(this.productId, imageId).subscribe({
      next: (product) => {
        this.existingImages = product.images ?? [];
      },
      error: () => {
        this.error = 'Erro ao definir imagem principal';
      },
    });
  }

  removeExistingImage(imageId: number) {
    if (!this.productId) return;
    this.productsService.removeImage(this.productId, imageId).subscribe({
      next: (product) => {
        this.existingImages = product.images ?? [];
      },
      error: () => {
        this.error = 'Erro ao remover imagem';
      },
    });
  }
}
