import { Component, computed, ElementRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { fromEvent, map, merge, of, scan, startWith, switchMap } from 'rxjs';
import { customFromEvent } from '../../helper';

@Component({
  selector: 'app-tab-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tab-bar.component.html',
  styleUrl: './tab-bar.component.scss'
})
export class TabBarComponent {
  readonly newTabButton = viewChild<ElementRef<HTMLButtonElement>>('newTabButton');
  readonly addNewTabEvent = customFromEvent(this.newTabButton, 'click').pipe(
    map(() => (tabs: string[]) => [...tabs, 'new tab'])
  );

  readonly removeTabButton = viewChild<ElementRef<HTMLButtonElement>>('removeTabButton');
  readonly removeTabEvent = customFromEvent(this.removeTabButton, 'click').pipe(
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

  httpGetTabs() {
    return of(['tab1', 'tab2', 'reallyLongTabName', 'tab3', 'tab4', 'reallyLongTabNameThatIsEvenLonger']);
  }
}
