import { trigger, style, transition, animate, keyframes, query, stagger, state } from '@angular/animations';

export const fadeInRouteAnimation = trigger(
  'routeAnimation',
  [
    state('*',
      style({
        opacity: 1
      })
    ),
    transition(':enter', [
      style({
        opacity: 0
      }),
      animate('0.2s ease-in')
    ])
  ]
);

export const fadeInOutAnimation = trigger(
  'fadeInOut',
  [
    state('*',
      style({
        opacity: 1
      })
    ),
    transition(':enter', [
      style({
        opacity: 0
      }),
      animate('200ms ease-in')
    ]),
    transition(':leave', [
      animate('200ms ease-in', style({
        transform: 'scale(0.5, 0.5)',
        opacity: 0
      }))
    ])
  ]
);
