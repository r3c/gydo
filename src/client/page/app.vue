<template>
  <div>
    <h2>{{ title }}</h2>
    <div class="dashboard">
      <div v-for="panel of panels" :key="panel.id" class="panel">
        <h3>{{ panel.title }}</h3>
        <div v-for="error of panel.errors" class="error">{{ error }}</div>
        <div :id="panel.id" v-html="panel.contents"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./app.ts" />
