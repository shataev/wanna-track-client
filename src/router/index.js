import { createRouter, createWebHistory } from 'vue-router'
import AuthPage from '@/pages/AuthPage.vue'
import ExpensesPage from '@/pages/ExpensesPage.vue'
import SignInPage from '@/pages/SignInPage.vue'
import SignUpPage from '@/pages/SignUpPage.vue'
import NewExpensePage from '@/pages/NewExpensePage.vue'
import HomeView from '@/views/HomeView.vue'
import useAuthStore from '@/stores/auth'
import { AUTH_ROUTES, ROUTE_NAMES } from '@/router/router.constants'
import { refreshSession, setAuthFailureHandler } from '@/api/http'
import EmailVerificationPage from '@/pages/EmailVerificationPage/EmailVerificationPage.vue'
import NewCategoryPage from '@/pages/NewCategoryPage.vue'
import FundsPage from '@/pages/FundsPage.vue'
import FundPage from '@/pages/FundPage.vue'
import EditFundPage from '@/pages/EditFundPage.vue'
import ProfilePage from '@/pages/ProfilePage.vue'

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
          path: 'funds',
          name: ROUTE_NAMES.FUNDS,
          component: FundsPage
        },
        {
          path: 'analytics',
          name: ROUTE_NAMES.ANALYTICS,
          component: () => import('@/pages/AnalyticsPage.vue')
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
      path: '/funds/new',
      name: ROUTE_NAMES.NEW_FUND,
      component: EditFundPage
    },
    {
      path: '/funds/:id',
      name: ROUTE_NAMES.FUND,
      component: FundPage
    },
    {
      path: '/funds/:id/edit',
      name: ROUTE_NAMES.FUND_EDIT,
      component: EditFundPage
    },
    {
      path: '/email-verification',
      name: ROUTE_NAMES.EMAIL_VERIFICATION,
      component: EmailVerificationPage
    },
    {
      path: '/new-category',
      name: ROUTE_NAMES.NEW_CATEGORY,
      component: NewCategoryPage
    },
    {
      path: '/funds/transfer',
      name: ROUTE_NAMES.FUND_TRANSFER,
      component: () => import('@/pages/TransferFundPage.vue')
    },
    {
      path: '/profile',
      name: ROUTE_NAMES.PROFILE,
      component: ProfilePage
    }
  ]
})

router.beforeEach(async (to) => {
  if (to.name === ROUTE_NAMES.EMAIL_VERIFICATION || AUTH_ROUTES.includes(to.name)) {
    return true
  }

  const authStore = useAuthStore()

  // Once a token is in memory, an expired one is renewed by the http
  // interceptor on its first 401, so navigation never waits on the API
  if (authStore.accessToken) {
    return true
  }

  try {
    await refreshSession()

    return true
  } catch {
    return { name: ROUTE_NAMES.SIGN_IN }
  }
})

setAuthFailureHandler(() => router.push({ name: ROUTE_NAMES.SIGN_IN }))

export default router
