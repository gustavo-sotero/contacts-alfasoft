<script setup lang="ts">
import NotificationContainer from '@/components/NotificationContainer.vue'
import { RouterView } from 'vue-router'
</script>

<template>
  <UApp>
    <RouterView />
    <NotificationContainer />
  </UApp>
</template>

<style scoped></style>
