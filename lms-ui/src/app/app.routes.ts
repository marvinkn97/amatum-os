import { Routes } from '@angular/router';
import { AuthCallbackComponent } from './auth/auth.callback';
import { canActivateAuth } from './auth/auth.guard';
import { ProfileComponent } from './auth/profile';
import { LearnerLayout } from './pages/learner/layout/layout';
import { LearnerDashboardComponent } from './pages/learner/dashboard/dashboard';
import { LessonComponent } from './pages/learner/lesson/lesson';
import { CourseCatalogueComponent } from './pages/learner/course-catalogue/course-catalogue';
import { MyCertificatesComponent } from './pages/learner/certificates/certificates';
import { ManagerLayout } from './pages/manager/layout/layout';
import { ManagerDashboard } from './pages/manager/dashboard/dashboard';
import { ManagerCourses } from './pages/manager/courses/courses';
import { CourseBuilder } from './pages/manager/course-builder/course-builder';
import { SuperAdminLayout } from './pages/super-admin/layout/layout';
import { CourseCategoriesComponent } from './pages/super-admin/categories/categories';
import { RoleSelectionComponent } from './auth/role-selection';
import { CourseDetailsComponent } from './pages/learner/course-details/course-details';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/public/getting-started/getting-started').then((m) => m.GettingStarted),
  },
  {
    path: 'explore',
    loadComponent: () => import('./pages/public/explore/explore').then((m) => m.Explore),
  },
  {
    path: 'curriculum',
    loadComponent: () => import('./pages/curriculum/curriculum').then((m) => m.Curriculum),
  },
  {
    path: 'onboarding',
    canActivate: [canActivateAuth],
    loadComponent: () => import('./auth/onboarding').then((m) => m.Onboarding),
  },
  {
    path: 'auth/callback',
    component: AuthCallbackComponent,
  },

  { path: 'choose-role', component: RoleSelectionComponent, canActivate: [canActivateAuth] },

  {
    path: 'super-admin',
    component: SuperAdminLayout, // The "Shell"
    canActivate: [canActivateAuth],
    children: [{ path: 'config/categories', component: CourseCategoriesComponent }],
  },

  {
    path: 'learner',
    component: LearnerLayout, // The "Shell"
    canActivate: [canActivateAuth],
    data: { role: 'LEARNER' },
    children: [
      { path: '', component: LearnerDashboardComponent, pathMatch: 'full' },
      { path: 'profile', component: ProfileComponent },
      { path: 'lesson', component: LessonComponent },
      { path: 'course-catalogue', component: CourseCatalogueComponent },
      { path: 'course-catalogue/:id', component: CourseDetailsComponent },
      { path: 'certificates', component: MyCertificatesComponent },
    ],
  },

  {
    path: 'manager',
    component: ManagerLayout, // The "Shell"
    canActivate: [canActivateAuth],
    data: { role: 'MANAGER' },
    children: [
      { path: '', component: ManagerDashboard, pathMatch: 'full' },
      { path: 'profile', component: ProfileComponent },
      { path: 'courses', component: ManagerCourses },
      { path: 'courses/studio', component: CourseBuilder },
      { path: 'courses/studio/:id', component: CourseBuilder },
    ],
  },
];
