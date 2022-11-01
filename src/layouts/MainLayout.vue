<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="bg-red text-white">
      <q-toolbar>
        <q-toolbar-title>
          <q-avatar>
            <q-icon name="flag_circle" size="md" />
          </q-avatar>
          Hetzner Road
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts"></script>
