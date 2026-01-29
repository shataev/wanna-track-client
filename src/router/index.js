import { createRouter, createWebHistory } from 'vue-router'
import AuthPage from '@/pages/AuthPage.vue'
import ExpensesPage from '@/pages/ExpensesPage.vue'
import SignInPage from '@/pages/SignInPage.vue'
import SignUpPage from '@/pages/SignUpPage.vue'
import NewExpensePage from '@/pages/NewExpensePage.vue'
import HomeView from '@/views/HomeView.vue'
import useAuthStore from '@/stores/auth'
import { AUTH_ROUTES, ROUTE_NAMES } from '@/router/router.constants'
import { WANNA_TRACK_ACCESS_TOKEN } from '@/constants'

import useUserStore from '@/stores/user'
import { checkAuth } from '@/utils/auth.utils'
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

router.beforeEach(async (to, from) => {
  const authStore = useAuthStore()
  const userStore = useUserStore()

  const accessToken = localStorage.getItem(WANNA_TRACK_ACCESS_TOKEN)

  const user = await checkAuth(accessToken)

  if (to.name === ROUTE_NAMES.EMAIL_VERIFICATION) {
    return true
  }

  if (!user && !AUTH_ROUTES.includes(to.name)) {
    return { name: ROUTE_NAMES.SIGN_IN }
  }

  if (user) {
    authStore.accessToken = user.accessToken
    userStore.user = {
      email: user.email,
      id: user.id,
      username: user.username,
      defaultCurrency: user.defaultCurrency
    }
  }

  return true
})

export default router
