import { Routes } from '@angular/router';
import { EmployeeDashboard } from './employee/employee-dashboard/employee-dashboard';
import { Login } from './login/login';
import { Request } from './employee/request/request';
import { Help } from './employee/help/help';
import { Profile } from './employee/profile/profile';
import { AdminDashboard } from './admin/dashboard/dashboard';
import { Users } from './admin/users/users';
import { Settings } from './components/settings/settings';
import { AdminProfile } from './admin/admin-profile/admin-profile';
import { UnauthorizedComponent } from './components/unauthorized/unauthorized.component.ts/unauthorized';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
    {
        path: "login",
        component: Login
    },
    {
        path: "unauthorized",
        component: UnauthorizedComponent
    },
    {
        path: "employeeDashboard",
        component: EmployeeDashboard,
        canActivate: [RoleGuard],
        data: { expectedRole: ['JUNIOR', 'MID', 'SENIOR'] }
    },
    {
        path: "request",
        component: Request,
        canActivate: [RoleGuard],
        data: { expectedRole: ['JUNIOR', 'MID', 'SENIOR'] }
    },
    {
        path: "help",
        component: Help,
        canActivate: [RoleGuard],
        data: { expectedRole: ['JUNIOR', 'MID', 'SENIOR'] }
    },
    {
        path: "profile",
        component: Profile,
        canActivate: [RoleGuard],
        data: { expectedRole: ['JUNIOR', 'MID', 'SENIOR'] }
    },
    {
        path: "adminDashboard",
        component: AdminDashboard,
        canActivate: [RoleGuard],
        data: { expectedRole: 'ADMIN' }
    },
    {
        path: "users",
        component: Users,
        canActivate: [RoleGuard],
        data: { expectedRole: 'ADMIN' }
    },
    {
        path: "settings",
        component: Settings,
        canActivate: [RoleGuard],
        data: { expectedRole: 'ADMIN' }
    },
    {
        path: "adminProfile",
        component: AdminProfile,
        canActivate: [RoleGuard],
        data: { expectedRole: 'ADMIN' }
    },
    {
        path: "employee",
        redirectTo: "/employeeDashboard",
        pathMatch: "full"
    },
    {
        path: "admin",
        redirectTo: "/adminDashboard", 
        pathMatch: "full"
    },
    { 
        path: '', 
        redirectTo: '/login', 
        pathMatch: 'full' 
    },
    { 
        path: '**', 
        redirectTo: '/login' 
    }
];