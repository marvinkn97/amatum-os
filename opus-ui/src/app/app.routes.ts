import { Routes } from '@angular/router';
import { GettingStarted } from './pages/public/getting-started/getting-started';
import { BrowseJobsComponent } from './pages/public/browse-jobs/browse-jobs';

export const routes: Routes = [

{
    path: '',
    component: GettingStarted
},
{
    path: 'browse-jobs',
    component: BrowseJobsComponent
}
];
