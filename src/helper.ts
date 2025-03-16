import { ElementRef, Signal } from '@angular/core';
import { filter, fromEvent, map, merge, Observable, switchMap } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';

export function customFromEvent<T extends Event>(element: Signal<ElementRef|undefined>, eventName: string): Observable<T> {
  return toObservable(element).pipe(
    filter((elementRef): elementRef is ElementRef => !!elementRef?.nativeElement),
    switchMap(({nativeElement}) => fromEvent<T>(nativeElement, eventName))
  );
}

export function customFromEvents(elements: Signal<ElementRef[]|readonly ElementRef[]>, eventName: string): Observable<number> {
  return toObservable(elements).pipe(
    map(elementRefs => elementRefs.map(elementRef => elementRef.nativeElement)),
    switchMap(nativeElements => merge(
      ...nativeElements.map((element, index) =>
        fromEvent(element, eventName).pipe(map(() => index))
      )
    ))
  );
}
