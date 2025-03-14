import { Component, computed, ElementRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { filter, fromEvent, map, merge, of, scan, startWith, switchMap } from 'rxjs';

@Component({
  selector: 'app-tab-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tab-bar.component.html',
  styleUrl: './tab-bar.component.scss'
})
export class TabBarComponent {
  readonly newTabButton = viewChild<ElementRef<HTMLButtonElement>>('newTabButton');
  readonly newTabButtonAvailable = toObservable(this.newTabButton).pipe(
    filter(elementRef => !!elementRef),
    map(elementRef => elementRef.nativeElement)
  );
  readonly addNewTabEvent = this.newTabButtonAvailable.pipe(
    switchMap(element => fromEvent(element, 'click')),
    map(() => (tabs: string[]) => [...tabs, 'new tab'])
  );

  readonly removeTabButton = viewChild<ElementRef<HTMLButtonElement>>('removeTabButton');
  readonly removeTabButtonAvailable = toObservable(this.removeTabButton).pipe(
    filter(elementRef => !!elementRef),
    map(elementRef => elementRef.nativeElement)
  );
  readonly removeTabEvent = this.removeTabButtonAvailable.pipe(
    switchMap(element => fromEvent(element, 'click')),
    map(() => (tabs: string[]) => tabs.slice(0, tabs.length - 1))
  );

  readonly updateEvents = merge(this.addNewTabEvent, this.removeTabEvent);

  readonly tabs = toSignal(
    this.httpGetTabs().pipe(
      switchMap(initialTabs =>
        this.updateEvents.pipe(
          startWith(() => initialTabs),
          scan(
            (tabs, action) => action(tabs),
            initialTabs
          ),
        )
      )
    ), {initialValue: []}
  );

  readonly windowWidth = toSignal(
    fromEvent(window, 'resize').pipe(
      map(() => window.innerWidth)
    ),
    {initialValue: window.innerWidth}
  );

  readonly isMobile = computed(() => this.windowWidth() <= 480);

  protected readonly tabWidth = computed(() => {
    const responsiveWidth = this.windowWidth() / this.tabs().length;
    if (responsiveWidth < 80) return 44;
    if (responsiveWidth > 280) return 280;
    return responsiveWidth;
  });

  readonly visibleTabsLimit = computed(() =>
    Math.floor(this.windowWidth() / this.tabWidth())
  );

  httpGetTabs() {
    return of(['tab1', 'tab2', 'reallyLongTabName', 'tab3', 'tab4', 'reallyLongTabNameThatIsEvenLonger']);
  }
}
