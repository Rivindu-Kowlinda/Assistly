import { Component } from '@angular/core';
import { AdminSidebar } from "../../components/admin-sidebar/admin-sidebar";
import { TableFilterBasicDemo } from "../../components/users/users";

@Component({
  selector: 'app-users',
  imports: [AdminSidebar, TableFilterBasicDemo],
  templateUrl: './users.html',
  styleUrl: './users.css'
})
export class Users {

}
