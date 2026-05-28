import { createRouter, createWebHistory } from "@ionic/vue-router";
import LoginPage from "@/views/LoginPage.vue";
import TabsPage from "@/views/TabsPage.vue";
import HomePage from "@/views/HomePage.vue";
import PassPage from "@/views/PassPage.vue";
import AttendancePage from "@/views/AttendancePage.vue";
import ProfilePage from "@/views/ProfilePage.vue";
import AccidentsPage from "@/views/AccidentsPage.vue";
import DocsPage from "@/views/DocsPage.vue";
import DeploymentsPage from "@/views/DeploymentsPage.vue";
import { getStoredWorker } from "@/lib/session";

const routes = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/login",
    component: LoginPage,
  },
  // 상세 정보 페이지 (탭 외부, 인증 필요)
  {
    path: "/worker/accidents",
    component: AccidentsPage,
    meta: { requiresAuth: true },
  },
  {
    path: "/worker/docs",
    component: DocsPage,
    meta: { requiresAuth: true },
  },
  {
    path: "/worker/deployments",
    component: DeploymentsPage,
    meta: { requiresAuth: true },
  },
  {
    path: "/tabs",
    component: TabsPage,
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        redirect: "/tabs/home",
      },
      {
        path: "home",
        component: HomePage,
        meta: { requiresAuth: true },
      },
      {
        path: "pass",
        component: PassPage,
        meta: { requiresAuth: true },
      },
      {
        path: "attendance",
        component: AttendancePage,
        meta: { requiresAuth: true },
      },
      {
        path: "profile",
        component: ProfilePage,
        meta: { requiresAuth: true },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to) => {
  if (to.matched.some((record) => record.meta.requiresAuth) && !getStoredWorker()) {
    return "/login";
  }

  if (to.path === "/login" && getStoredWorker()) {
    return "/tabs/home";
  }

  return true;
});

export default router;
