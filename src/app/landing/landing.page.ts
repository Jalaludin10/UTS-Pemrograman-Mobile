import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [IonicModule],
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
})
export class LandingPage {
  constructor(private router: Router) {}

  goToHome() {
    this.router.navigate(['/home']);
  }
}
