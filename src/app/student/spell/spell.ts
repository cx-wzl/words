import {
  CdkDrag,
  CdkDragDrop,
  CdkDragPlaceholder,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTreeModule } from '@angular/material/tree';
import { Word } from '../../type/types';

@Component({
  selector: 'app-spell',
  imports: [
    CdkDrag,
    CdkDropList,
    CdkDropListGroup,
    CdkDragPlaceholder,
    MatTreeModule,
    MatCheckboxModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './spell.html',
  styleUrls: ['./spell.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class Spell implements OnInit {
  private readonly http = inject(HttpClient);

  protected card = signal('start');
  protected process = signal('');
  protected currentWord = signal('');
  protected dropLetters: string[] = [];
  protected dragLetters: string[] = [];

  private fullDict: Word[] = [];
  private words: string[] = [];

  ngOnInit(): void {
    this.initDictionary();
  }

  private initDictionary(): void {
    this.http.get<Word[]>('bookcase/power_up_level_0/dict.json').subscribe((dict: Word[]) => {
      this.fullDict = dict;
      this.words = dict.map((word) => word.word);
    });
  }

  startGame(): void {
    this.currentWord.set(this.words[0]);
    this.dragLetters = this.currentWord()
      .split('')
      .sort(() => Math.random() - 0.5);
    this.dropLetters = this.currentWord()
      .split('')
      .map(() => '');
    this.card.set('spell');
  }

  drop(event: CdkDragDrop<string[]>, index: number): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const moveLetter = event.previousContainer.data.splice(event.previousIndex, 1)[0];
      event.container.data.splice(index, 1, moveLetter);
    }
  }
}
