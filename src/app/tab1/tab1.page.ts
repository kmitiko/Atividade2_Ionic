import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FirebaseService } from './../services/firebase.service';

import { Product } from './../model/product';
import { ProductService } from './../services/product.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {

  productForm!: FormGroup;
  product!:Product;
  editable:boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private productService: ProductService,
    private firebaseService: FirebaseService,
    private router: Router,
    private route: ActivatedRoute
    ) {}

  ngOnInit(): void {

    this.productForm = this.formBuilder.group({
      nome: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(100)]],
      quantidade: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(5), Validators.pattern(/^[0-9]+$/)] ],
      preco_compra: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(10), Validators.pattern(/^[0-9]+$/)]],
      porcentagem: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(10), Validators.pattern(/^[0-9]+$/)]],
      preco_venda: ['', []],
      fornecedor: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(100)]]
    });

    this.route.paramMap.subscribe(params => {
      const productId = +params.get('id')!;

      if(productId) {
        this.productService.findProduct(productId).subscribe({
          next: (productDB: Product) => {
            this.product = productDB;
            this.editable = true;
            this.loadForm();
          },
          error: (err) => console.log(err)
        });
      }
    });
}

  addProduct(values: any) {
    let newProduct:Product = {...values};
    this.firebaseService.save(newProduct);
    console.log(newProduct);
    this.productForm.reset();

  }

  loadForm() {
    this.productForm.patchValue({
      nome: this.product.nome,
      quantidade: this.product.quantidade,
      preco_compra: this.product.preco_compra,
      porcentagem: this.product.porcentagem,
      preco_venda: this.product.preco_venda,
      fornecedor: this.product.fornecedor
    });
  }
  editProduct() {
    const editProduct = this.productForm.getRawValue() as Product;
    editProduct.id = this.product.id;


    this.productService.updateProduct(editProduct).subscribe({
      next: () => {
        this.router.navigateByUrl('/tabs/tab2');
        this.productForm.reset();
      },
      error: (err) => {
        console.error(err);
        this.productForm.reset();
      }
    });
    this.productForm.reset();
    this.router.navigateByUrl('/tabs/tab2');
  }


  calcVenda() {
    let valorCompra = this.productForm.get('preco_compra')?.value;
    let porcentagem = this.productForm.get('porcentagem')?.value;

    let calcVenda = valorCompra + (valorCompra * (porcentagem / 100));

    this.productForm.patchValue({
      preco_venda : calcVenda
    })

  }

}
