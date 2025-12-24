import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin } from 'rxjs';
import { BookInfoWithPath, Word } from '../../type/types';

interface BookcaseWithWords extends BookInfoWithPath {
  words: Word[];
}

@Component({
  selector: 'app-search',
  imports: [MatButtonModule, MatChipsModule, MatIconModule],
  templateUrl: './search.html',
  styleUrls: ['./search.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class Search implements OnInit {
  private readonly http = inject(HttpClient);

  word = signal('');
  bookcases = signal<BookcaseWithWords[]>([]);
  loading = signal(false);

  // 单词所在的 bookcase 列表
  wordInBookcases = computed(() => {
    const w = this.word().toLowerCase();
    if (!w) return [];
    return this.bookcases().filter((bc) => bc.words.some((word) => word.word.toLowerCase() === w));
  });

  // 单词不在的 bookcase 列表（可以添加）
  wordNotInBookcases = computed(() => {
    const w = this.word().toLowerCase();
    if (!w) return [];
    return this.bookcases().filter((bc) => !bc.words.some((word) => word.word.toLowerCase() === w));
  });

  ngOnInit(): void {
    this.loadBookcases();
  }

  private loadBookcases(): void {
    this.loading.set(true);
    this.http.get<BookInfoWithPath[]>('/api/bookcases').subscribe({
      next: (bookcases) => {
        // 加载每个 bookcase 的单词列表
        const requests = bookcases.map((bc) =>
          this.http.get<Word[]>(`/api/bookcase-words/${bc.folder}`)
        );

        if (requests.length === 0) {
          this.bookcases.set([]);
          this.loading.set(false);
          return;
        }

        forkJoin(requests).subscribe({
          next: (wordsArrays) => {
            const bookcasesWithWords = bookcases.map((bc, index) => ({
              ...bc,
              words: wordsArrays[index],
            }));
            this.bookcases.set(bookcasesWithWords);
            this.loading.set(false);
          },
          error: () => {
            this.loading.set(false);
          },
        });
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  onSearchInput(): void {
    this.word.set('');
  }

  onSearchEnter(event: unknown): void {
    const value = ((event as KeyboardEvent).currentTarget as HTMLInputElement).value;
    this.word.set(value);
  }

  addToBookcase(bookcase: BookcaseWithWords): void {
    const w = this.word();
    if (!w) return;

    this.http.post(`/api/bookcase-words/${bookcase.folder}/add`, { word: w }).subscribe({
      next: () => {
        // 更新本地状态
        const updatedBookcases = this.bookcases().map((bc) => {
          if (bc.folder === bookcase.folder) {
            return {
              ...bc,
              words: [...bc.words, { word: w, lesson: 1, unit: 1 }],
            };
          }
          return bc;
        });
        this.bookcases.set(updatedBookcases);
      },
    });
  }

  removeFromBookcase(bookcase: BookcaseWithWords): void {
    const w = this.word();
    if (!w) return;

    this.http.post(`/api/bookcase-words/${bookcase.folder}/remove`, { word: w }).subscribe({
      next: () => {
        // 更新本地状态
        const updatedBookcases = this.bookcases().map((bc) => {
          if (bc.folder === bookcase.folder) {
            return {
              ...bc,
              words: bc.words.filter((word) => word.word.toLowerCase() !== w.toLowerCase()),
            };
          }
          return bc;
        });
        this.bookcases.set(updatedBookcases);
      },
    });
  }
}
