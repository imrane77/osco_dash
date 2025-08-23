<!-- eslint-disable vue/no-mutating-props -->
<template>
  <card>
    <h5 slot="header" class="title">Profile</h5>
    <div class="row">
      <div class="col-md-3 px-md-1">
        <base-input
          label="Username"
          placeholder="Username"
          v-model="model.username"
        >
        </base-input>
      </div>
      <div class="col-md-4 pl-md-1">
        <base-input
          label="Email address"
          type="email"
          v-model="model.email"
          placeholder="mike@email.com"
        >
        </base-input>
      </div>
    </div>
    <div class="row">
      <div class="col-md-6 pr-md-1">
        <base-input
          label="First Name"
          v-model="model.firstName"
          placeholder="First Name"
        >
        </base-input>
      </div>
      <div class="col-md-6 pl-md-1">
        <base-input
          label="Last Name"
          v-model="model.lastName"
          placeholder="Last Name"
        >
        </base-input>
      </div>
    </div>
    </div>
    <!-- <base-button slot="footer" type="primary" fill>Save</base-button> -->
  </card>
</template>
<script>
export default {
  props: {
    model: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
};
</script>
<style></style>
