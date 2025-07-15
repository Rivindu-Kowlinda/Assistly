import { Routes } from '@angular/router';

import { EmployeeDashboard } from './employee/employee-dashboard/employee-dashboard';
import { Login } from './login/login';
import { Component } from '@angular/core';

export const routes: Routes = [
    {
        path:"login",
        component: Login
    },
    {
        path:"employeeDashboard",
        component: EmployeeDashboard
    }
];
