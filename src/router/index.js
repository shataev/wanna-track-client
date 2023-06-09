import { createRouter, createWebHistory } from 'vue-router'
import HomePage from "@/pages/HomePage.vue";
import AuthPage from "@/pages/AuthPage.vue";
import ExpensesPage from "@/pages/ExpensesPage.vue";
import IncomePage from "@/pages/IncomesPage.vue";
import SignInPage from "@/pages/SignInPage.vue";
import SignUpPage from "@/pages/SignUpPage.vue";
import NewExpensePage from "@/pages/NewExpensePage.vue";
import NewIncomePage from "@/pages/NewIncomePage.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
      children: [
        {
          path: 'expenses',
          name: 'expenses',
          component: ExpensesPage,
        },
        {
          path: 'income',
          name: 'income',
          component: IncomePage,
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
      name: 'signIn',
      component: SignInPage
    },
    {
      path: '/signup',
      name: 'signUp',
      component: SignUpPage
    },
    {
      path: '/new-expense',
      name: 'newExpense',
      component: NewExpensePage
    },
    {
      path: '/new-income',
      name: 'newIncome',
      component: NewIncomePage
    }
  ]
})

export default router
