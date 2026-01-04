import { Component, inject, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main',
  templateUrl: './main.html',
  styleUrls: ['./main.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class Main {
  private readonly router = inject(Router);

  onClick(key: string) {
    this.router.navigate([key]);
  }
}
