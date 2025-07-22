import { Component } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'scrollable-tabs',
    templateUrl: './scrollable-tabs.html',
    standalone: true,
    imports: [CommonModule, TabsModule]
})
export class ScrollableTabs {
    activeIndex: number = 0;

    scrollableTabs: any[] = Array.from({ length: 50 }, (_, i) => ({ title: "Title", content: "Content" }));
}