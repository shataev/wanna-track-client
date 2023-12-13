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
import { WANNA_TRACK_ACCESS_TOKEN } from '@/constants'

import useUserStore from '@/stores/user'
import { checkAuth } from '@/utils/auth.utils'
import EmailVerificationPage from '@/pages/EmailVerificationPage/EmailVerificationPage.vue'

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
    },
    {
      path: '/email-verification',
      name: ROUTE_NAMES.EMAIL_VERIFICATION,
      component: EmailVerificationPage
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

  authStore.accessToken = user.accessToken
  userStore.user = {
    email: user.email,
    id: user.id,
    username: user.username
  }

  return true
})

export default router