<template>
  <div>
    <notifications></notifications>
    <router-view :key="$route.fullPath"></router-view>
  </div>
</template>

<script>
export default {
  methods: {
    disableRTL() {
      if (!this.$rtl.isRTL) {
        this.$rtl.disableRTL();
      }
    },
    toggleNavOpen() {
      let root = document.getElementsByTagName("html")[0];
      if (this.$sidebar.showSidebar) {
        root.classList.add("nav-open");
      } else {
        root.classList.remove("nav-open");
      }
    },
    closeSidebarOnNavigation() {
      if (this.$sidebar && this.$sidebar.showSidebar) {
        this.$sidebar.displaySidebar(false);
      }
    },
  },
  mounted() {
    this.$watch("$route", this.disableRTL, { immediate: true });
    this.$watch("$sidebar.showSidebar", this.toggleNavOpen);
    this.$watch("$route", this.closeSidebarOnNavigation);
  },
};
</script>

<style lang="scss"></style>
