<template>
  <li class="nav-item" :class="{ 'nav-item-open': isOpen }">
    <a 
      class="nav-link dropdown-toggle" 
      href="#" 
      @click.prevent="toggleDropdown"
      :class="{ active: hasActiveChild }"
    >
      <i v-if="icon" :class="icon"></i>
      <p>
        {{ name }}
        <i class="tim-icons icon-minimal-down dropdown-arrow" :class="{ rotated: isOpen }"></i>
      </p>
    </a>
    <div class="collapse" :class="{ show: isOpen }">
      <ul class="nav">
        <sidebar-link
          v-for="(item, index) in items"
          :key="index"
          :to="item.to"
          :name="item.name"
          :icon="item.icon"
          class="nav-item-child"
        />
      </ul>
    </div>
  </li>
</template>

<script>
import SidebarLink from './SidebarLink.vue'

export default {
  name: "sidebar-dropdown",
  components: {
    SidebarLink
  },
  props: {
    name: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      default: ""
    },
    items: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      isOpen: false
    }
  },
  computed: {
    hasActiveChild() {
      return this.items.some(item => this.$route.path === item.to)
    }
  },
  methods: {
    toggleDropdown() {
      this.isOpen = !this.isOpen
    },
    handleChildClick(event) {
      // Prevent event bubbling and close sidebar immediately
      event.preventDefault();
      event.stopPropagation();
      
      if (this.$sidebar) {
        console.log('Closing sidebar from dropdown click');
        this.$sidebar.displaySidebar(false);
      }
    }
  },  
  watch: {
    '$route'() {
      // Auto-open dropdown if child route is active
      if (this.hasActiveChild) {
        this.isOpen = true
      }
    }
  },
  mounted() {
    // Open dropdown if child route is active on mount
    if (this.hasActiveChild) {
      this.isOpen = true
    }
  }
}
</script>

<style lang="scss" scoped>
.nav-item {
  .dropdown-toggle {
    cursor: pointer;
    
    .dropdown-arrow {
      float: right;
      margin-top: 3px;
      transition: transform 0.3s ease;
      
      &.rotated {
        transform: rotate(180deg);
      }
    }
  }
  
  .collapse {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease;
    
    &.show {
      max-height: 500px;
    }
  }
  
  .nav-item-child {
    .nav-link {
      padding-left: 50px;
      font-size: 0.9em;
      
      p {
        margin-bottom: 0;
      }
    }
  }
}
</style>
