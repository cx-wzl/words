import { CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTreeModule } from '@angular/material/tree';
import { Word } from '../../type/types';

interface LetterSlot {
  letter: string;
}

@Component({
  selector: 'app-spell',
  imports: [
    CdkDrag,
    CdkDropList,
    CdkDropListGroup,
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
  protected dropLetterSlots: LetterSlot[] = [];
  protected dragLetterSlots: LetterSlot[] = [];
  protected showResult = signal(false);
  protected isCorrect = signal(false);
  protected correctCount = signal(0);
  protected errorCount = signal(0);

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

  protected startGame(): void {
    this.setNewWord();
    this.card.set('spell');
  }

  protected clearLetter(index: number): void {
    const letter = this.dropLetterSlots[index];
    if (letter.letter === '') {
      return;
    }
    this.dropLetterSlots.splice(index, 1, { letter: '' });
    this.dragLetterSlots.push(letter);
  }

  protected drop(event: CdkDragDrop<any>, index: number): void {
    const { previousContainer, container, previousIndex } = event;
    if (previousContainer === container) {
      return;
    }

    const dragLetterSlots = previousContainer.data.slots;
    const moveLetter = dragLetterSlots[previousIndex];
    dragLetterSlots.splice(previousIndex, 1);

    const dropLetterSlots = container.data.slots;
    dropLetterSlots.splice(index, 1, moveLetter);
  }

  protected dropLetterSlotsPredicate = (_drag: CdkDrag<any>, drop: CdkDropList<any>) => {
    return drop.data.value === '';
  };

  protected checkWord() {
    const isCorrect =
      this.dropLetterSlots.map((slot) => slot.letter).join('') === this.currentWord();
    this.isCorrect.set(isCorrect);
    this.showResult.set(true);
    (isCorrect ? this.correctCount : this.errorCount).update((count) => count + 1);
  }

  protected nextWord() {
    this.showResult.set(false);
    this.setNewWord();
  }

  private setNewWord() {
    this.currentWord.set(this.words.pop() ?? '');
    this.dragLetterSlots = this.currentWord()
      .split('')
      .sort(() => Math.random() - 0.5)
      .map((letter) => ({ letter }));
    this.dropLetterSlots = this.currentWord()
      .split('')
      .map(() => ({ letter: '' }));
    const total = this.fullDict.length;
    const count = this.fullDict.length - this.words.length;
    this.process.set(`${count}/${total}`);
  }
}
