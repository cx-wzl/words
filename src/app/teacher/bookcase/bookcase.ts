import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

interface BookInfo {
  title: string;
  subTitle: string;
  image: string;
}

@Component({
  selector: 'app-bookcase',
  imports: [MatCardModule, MatButtonModule],
  templateUrl: './bookcase.html',
  styleUrls: ['./bookcase.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class Bookcase implements OnInit {
  private readonly http = inject(HttpClient);
  books = signal<BookInfo[]>([]);

  ngOnInit(): void {
    const imageUrl = 'bookcase/bookcase.json';
    this.http.get<BookInfo[]>(imageUrl).subscribe((resp) => {
      this.books.set(resp);
    });
  }
}
