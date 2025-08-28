<template>
  <div class="wrapper">
    <side-bar>
      <template slot="links">
        <sidebar-link
          to="/dashboard"
          :name="$t('sidebar.dashboard')"
          icon="tim-icons icon-chart-pie-36"
        />
        <sidebar-dropdown
          :name="$t('sidebar.categories')"
          icon="tim-icons icon-puzzle-10"
          :items="categoryItems"
        />
        <sidebar-dropdown
          :name="$t('sidebar.menus')"
          icon="tim-icons icon-notes"
          :items="menuItems"
        />
        <!-- <sidebar-link
          to="/icons"
          :name="$t('sidebar.icons')"
          icon="tim-icons icon-atom"
        /> -->
        <!-- <sidebar-link
          to="/maps"
          :name="$t('sidebar.maps')"
          icon="tim-icons icon-pin"
        /> -->
        <!-- <sidebar-link
          to="/notifications"
          :name="$t('sidebar.notifications')"
          icon="tim-icons icon-bell-55"
        /> -->
        <sidebar-link
          to="/infos/edit"
          :name="$t('sidebar.infos')"
          icon="tim-icons icon-settings-gear-63"
        />
        <!-- <sidebar-link
          to="/table-list"
          :name="$t('sidebar.tableList')"
          icon="tim-icons icon-puzzle-10"
        /> -->
        <!-- <sidebar-link
          to="/typography"
          :name="$t('sidebar.typography')"
          icon="tim-icons icon-align-center"
        /> -->
        <!-- <sidebar-link
          to="/dashboard?enableRTL=true"
          :name="$t('sidebar.rtlSupport')"
          icon="tim-icons icon-world"
        />
        <sidebar-link
          to="/settings"
          :name="$t('sidebar.settings')"
          icon="tim-icons icon-settings-gear-63"
        /> -->
      </template>
    </side-bar>
    <div class="main-panel">
      <top-navbar></top-navbar>

      <dashboard-content @click.native="toggleSidebar"> </dashboard-content>

      <content-footer></content-footer>
    </div>
  </div>
</template>
<style lang="scss"></style>
<script>
import TopNavbar from "./TopNavbar.vue";
import ContentFooter from "./ContentFooter.vue";
import DashboardContent from "./Content.vue";
import MobileMenu from "./MobileMenu";
import SidebarDropdown from "../../components/SidebarPlugin/SidebarDropdown.vue";
export default {
  components: {
    TopNavbar,
    ContentFooter,
    DashboardContent,
    SidebarDropdown,
  },
  data() {
    return {
      menuItems: [
        {
          to: "/menus/add",
          name: this.$t('sidebar.addMenu'),
          icon: "tim-icons icon-simple-add"
        },
        {
          to: "/menus/list",
          name: this.$t('sidebar.menuList'),
          icon: "tim-icons icon-bullet-list-67"
        },
      ],
      categoryItems: [
        {
          to: "/categories/add",
          name: this.$t('sidebar.addCategory'),
          icon: "tim-icons icon-simple-add"
        },
        {
          to: "/categories/list",
          name: this.$t('sidebar.categoryList'),
          icon: "tim-icons icon-bullet-list-67"
        },
      ],
    }
  },
  methods: {
    toggleSidebar() {
      if (this.$sidebar.showSidebar) {
        this.$sidebar.displaySidebar(false);
      }
    },
  },
};
</script>
