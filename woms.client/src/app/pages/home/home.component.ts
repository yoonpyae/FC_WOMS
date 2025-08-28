import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    ProgressSpinnerModule
  ],
  providers: [MessageService],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  constructor(private router: Router) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.router.navigate(['./dashboard']);
    }, 2000);
  }
}

