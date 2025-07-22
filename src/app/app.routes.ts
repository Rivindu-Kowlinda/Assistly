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
import { Component } from '@angular/core';

export const routes: Routes = [
    {
        path:"login",
        component: Login
    },
    {
        path:"employeeDashboard",
        component: EmployeeDashboard
    },
    {
        path:"request",
        component: Request
    },
    {
        path:"help",
        component: Help
    },
    {
        path:"profile",
        component: Profile
    },
    {
        path:"adminDashboard",
        component: AdminDashboard
    },
    {
        path:"users",
        component: Users
    },
    {
        path:"settings",
        component: Settings
    },
    {
        path:"adminProfile",
        component: AdminProfile
    }
];
