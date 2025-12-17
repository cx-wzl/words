import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-bookcase',
  templateUrl: './bookcase.html',
  styleUrls: ['./bookcase.scss'],
  imports: [MatCardModule, MatButtonModule],
})
export class Bookcase implements OnInit {
  private readonly httpClient = Inject(HttpClient);
  private readonly bookcaseUrl: string = 'assets/bookcase.json';
  ngOnInit(): void {
    this.httpClient.get(this.bookcaseUrl).subscribe((response: any) => {
      console.log(response);
    });
  }
}
