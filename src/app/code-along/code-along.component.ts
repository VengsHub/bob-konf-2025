import { Component, ElementRef, viewChild } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { filter, fromEvent, map, share, switchMap, takeUntil } from 'rxjs';

@Component({
  selector: 'app-code-along',
  standalone: true,
  imports: [],
  templateUrl: './code-along.component.html',
  styleUrl: './code-along.component.scss'
})
export class CodeAlongComponent {
  readonly draggable = viewChild<ElementRef>('draggable');
  readonly draggableAvailable = toObservable(this.draggable).pipe(
    filter(elementRef => !!elementRef),
    map(elementRef => elementRef.nativeElement)
  );

  readonly dragStart = this.draggableAvailable.pipe(
    switchMap(element => fromEvent(element, 'mousedown'))
  );

  readonly dragMove = fromEvent(document, 'mousemove').pipe(
    share()
  );

  readonly dragEnd = fromEvent(document, 'mouseup');

  readonly drag = this.dragStart.pipe(
    switchMap(() => this.dragMove.pipe(
      takeUntil(this.dragEnd)
    ))
  );

  readonly positionOfDraggable = toSignal(
    this.drag.pipe(
      map(event => {
        const typedEvent = event as MouseEvent;
        return {x: typedEvent.x, y: typedEvent.y};
      })
    ), {initialValue: {x: 0, y: 0}}
  )

  constructor() {
    this.drag.subscribe(event => {
      console.log('dragging', event);
    })
  }
}
