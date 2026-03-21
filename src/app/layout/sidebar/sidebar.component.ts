import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
  userName = '';
  userEmail = '';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    const user = this.authService.getUser();
    if (user) {
      this.userName = user.name;
      this.userEmail = user.email;
    }
  }

  onLogout() {
    this.authService.logout();
  }
}
