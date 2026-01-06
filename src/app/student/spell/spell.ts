import { CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTreeModule } from '@angular/material/tree';
import { LetterSlot, Word } from '../../type/types';

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
    MatProgressBarModule,
  ],
  templateUrl: './spell.html',
  styleUrls: ['./spell.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class Spell implements OnInit {
  private readonly http = inject(HttpClient);

  protected card = signal<'start' | 'spell' | 'result'>('start');
  protected currentWord = signal<Word | null>(null);
  protected dropLetterSlots: LetterSlot[] = [];
  protected dragLetterSlots: LetterSlot[] = [];
  protected showResult = signal(false);
  protected isCorrect = signal(false);
  protected correctList = signal<Word[]>([]);
  protected errorList = signal<Word[]>([]);
  protected total = signal(0);
  protected count = signal(0);

  private fullDict: Word[] = [];
  private words: Array<Word> = [];

  ngOnInit(): void {
    this.initDictionary();
  }

  private initDictionary(): void {
    this.http
      .get<Array<Word>>('bookcase/power_up_level_0/dict.json')
      .subscribe((dict: Array<Word>) => {
        this.fullDict = structuredClone(dict);
      });
  }

  protected startGame(): void {
    this.words = [...this.fullDict.filter((word) => !word.kill)].sort(() => Math.random() - 0.5);
    this.setNewWord();
    this.card.set('spell');
  }

  protected audioClick() {
    this.audioPlay(`audio/${this.currentWord()?.word}.mp3`);
  }

  protected audioPlay(url: string) {
    const context = new AudioContext();
    this.http
      .get(url, {
        responseType: 'arraybuffer',
      })
      .subscribe((buffer) => {
        context.decodeAudioData(buffer, (decoded) => {
          const source = context.createBufferSource();
          source.buffer = decoded;
          source.connect(context.destination);
          source.start();
        });
      });
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
    const currentWordVal = this.currentWord()!;
    const isCorrect =
      this.dropLetterSlots.map((slot) => slot.letter).join('') === currentWordVal.word;
    this.isCorrect.set(isCorrect);
    (isCorrect ? this.correctList : this.errorList).update((list) => [...list, currentWordVal]);
    this.showResult.set(true);
    setTimeout(() => this.audioPlay(isCorrect ? 'right.mp3' : 'error.mp3'));
  }

  protected nextWord() {
    this.showResult.set(false);
    this.setNewWord();
  }

  private setNewWord() {
    this.currentWord.set(this.words.pop()!);
    const currentWordVal = this.currentWord()!;
    this.dragLetterSlots = currentWordVal.word
      .split('')
      .sort(() => Math.random() - 0.5)
      .map((letter) => ({ letter }));
    this.dropLetterSlots = currentWordVal.word.split('').map(() => ({ letter: '' }));
    this.total.set(this.fullDict.length);
    this.count.set(this.fullDict.length - this.words.length);
    setTimeout(() => this.audioPlay(`audio/${currentWordVal.word}.mp3`));
  }

  protected getProgressValue(): number {
    return Math.floor((this.count() / this.total()) * 100);
  }
}
