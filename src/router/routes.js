import DashboardLayout from "@/layout/dashboard/DashboardLayout.vue";
// GeneralViews

import NotFound from "@/pages/NotFoundPage.vue";

// Admin pages
const Dashboard = () =>
  import(/* webpackChunkName: "dashboard" */ "@/pages/Dashboard.vue");
const Profile = () =>
  import(/* webpackChunkName: "common" */ "@/pages/Profile.vue");
const Icons = () =>
  import(/* webpackChunkName: "common" */ "@/pages/Icons.vue");
const Maps = () => import(/* webpackChunkName: "common" */ "@/pages/Maps.vue");
const Typography = () =>
  import(/* webpackChunkName: "common" */ "@/pages/Typography.vue");
const TableList = () =>
  import(/* webpackChunkName: "common" */ "@/pages/TableList.vue");
const CategoriesList = () =>
  import(/* webpackChunkName: "categories" */ "@/pages/Categories/List.vue");
const CategoriesAdd = () =>
  import(/* webpackChunkName: "categories" */ "@/pages/Categories/Add.vue");
const MenusList = () =>
  import(/* webpackChunkName: "menus" */ "@/pages/Menus/List.vue");
const MenusAdd = () =>
  import(/* webpackChunkName: "menus" */ "@/pages/Menus/Add.vue");
// Importing the new Infos component
const InfosEdit = () =>
  import(/* webpackChunkName: "infos" */ "@/pages/Infos/Edit.vue");
// Importing the login component
const Login = () =>
  import(/* webpackChunkName: "auth" */ "@/pages/auth/Login.vue");
const routes = [
  {
    path: "/",
    component: DashboardLayout,
    redirect: "/dashboard",
    children: [
      {
        path: "dashboard",
        name: "dashboard",
        component: Dashboard,
      },
      {
        path: "profile",
        name: "profile",
        component: Profile,
      },
      {
        path: "icons",
        name: "icons",
        component: Icons,
      },
      {
        path: "maps",
        name: "maps",
        component: Maps,
      },
      {
        path: "typography",
        name: "typography",
        component: Typography,
      },
      {
        path: "table-list",
        name: "table-list",
        component: TableList,
      },
      {
        path: "categories/list",
        name: "categories-list",
        component: CategoriesList,
      },
      {
        path: "categories/add",
        name: "categories-add",
        component: CategoriesAdd,
      },
      {
        path: "menus/list",
        name: "menus-list",
        component: MenusList,
      },
      {
        path: "menus/add",
        name: "menus-add",
        component: MenusAdd,
      },
      {
        path: "infos/edit",
        name: "infos-edit",
        component: InfosEdit,
      }
    ],
  },
  { path: "*", component: NotFound },
  {
    path: "/login",
    name: "login",
    component: Login,
  }
];

/**
 * Asynchronously load view (Webpack Lazy loading compatible)
 * The specified component must be inside the Views folder
 * @param  {string} name  the filename (basename) of the view to load.
function view(name) {
   var res= require('../components/Dashboard/Views/' + name + '.vue');
   return res;
};**/

export default routes;
