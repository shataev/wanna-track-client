import { createRouter, createWebHistory } from 'vue-router'
import AuthPage from '@/pages/AuthPage.vue'
import ExpensesPage from '@/pages/ExpensesPage.vue'
import IncomePage from '@/pages/IncomePage.vue'
import SignInPage from '@/pages/SignInPage.vue'
import SignUpPage from '@/pages/SignUpPage.vue'
import NewExpensePage from '@/pages/NewExpensePage.vue'
import NewIncomePage from '@/pages/NewIncomePage.vue'
import HomeView from '@/views/HomeView.vue'
import useAuthStore from '@/stores/auth'
import { AUTH_ROUTES, ROUTE_NAMES } from '@/router/router.constants'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: HomeView,
      children: [
        {
          path: 'expenses',
          name: ROUTE_NAMES.EXPENSES,
          component: ExpensesPage
        },
        {
          path: 'income',
          name: ROUTE_NAMES.INCOME,
          component: IncomePage
        }
      ]
    },
    {
      path: '/auth',
      name: 'auth',
      component: AuthPage
    },
    {
      path: '/signin',
      name: ROUTE_NAMES.SIGN_IN,
      component: SignInPage
    },
    {
      path: '/signup',
      name: ROUTE_NAMES.SIGN_UP,
      component: SignUpPage
    },
    {
      path: '/expenses/new',
      name: ROUTE_NAMES.NEW_EXPENSE,
      component: NewExpensePage
    },
    {
      path: '/new-income',
      name: ROUTE_NAMES.NEW_INCOME,
      component: NewIncomePage
    }
  ]
})

router.beforeEach((to, from) => {
  const authStore = useAuthStore()

  const isAuthenticated = Boolean(authStore.accessToken)

  if (!isAuthenticated && !AUTH_ROUTES.includes(to.name)) {
    return { name: ROUTE_NAMES.SIGN_IN }
  }

  return true
})

export default router
