import { Component, computed, signal, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-search',
  imports: [MatButtonModule],
  templateUrl: './search.html',
  styleUrls: ['./search.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class Search {
  word = signal('');
  favorites = signal<Set<string>>(new Set());

  isFavorite = computed(() => this.favorites().has(this.word()));

  onSearchInput() {
    this.word.set('');
  }
  onSearchEnter(event: unknown) {
    const value = ((event as KeyboardEvent).currentTarget as HTMLInputElement).value;
    this.word.set(value);
    // fetch()https://dict.youdao.com/dictvoice?audio=${word}&type=1
  }

  toggleFavorite() {
    const currentWord = this.word();
    if (!currentWord) return;

    const newFavorites = new Set(this.favorites());
    if (newFavorites.has(currentWord)) {
      newFavorites.delete(currentWord);
    } else {
      newFavorites.add(currentWord);
    }
    this.favorites.set(newFavorites);
  }
}
