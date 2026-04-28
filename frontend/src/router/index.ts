import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';

import LoginView from '../views/LoginView.vue';
import SignupView from '../views/SignupView.vue';
import DashboardView from '../views/DashboardView.vue';
import StudentsView from '../views/StudentsView.vue';
import AcademicYearsView from '../views/AcademicYearsView.vue';
import SubjectsView from '../views/SubjectsView.vue';
import StudyPlansView from '../views/StudyPlansView.vue';
import StudyPlanDetailsView from '../views/StudyPlanDetailsView.vue';
import ActivitiesView from '../views/ActivitiesView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/login', component: LoginView, meta: { public: true } },
    { path: '/signup', component: SignupView, meta: { public: true } },
    {
      path: '/students',
      name: 'students',
      component: StudentsView,
      meta: { requiresAuth: true }
    },
    {
      path: '/academic-years',
      name: 'academic-years',
      component: AcademicYearsView,
      meta: { requiresAuth: true }
    },
    {
      path: '/subjects',
      name: 'subjects',
      component: SubjectsView,
      meta: { requiresAuth: true }
    },
    {
      path: '/study-plans',
      name: 'study-plans',
      component: StudyPlansView,
      meta: { requiresAuth: true }
    },
    {
      path: '/study-plans/:id',
      name: 'study-plan-details',
      component: StudyPlanDetailsView,
      meta: { requiresAuth: true }
    },
    {
      path: '/activities',
      name: 'activities',
      component: ActivitiesView,
      meta: { requiresAuth: true }
    },
    { path: '/dashboard', component: DashboardView },
  ],
});

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();

  if (!to.meta.public && !authStore.isAuthenticated) {
    next({ path: '/login', query: { redirect: to.fullPath } });
    return;
  }

  if (to.meta.public && authStore.isAuthenticated) {
    next('/dashboard');
    return;
  }

  next();
});

export default router;
