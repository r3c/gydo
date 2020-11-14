<template>
  <div>
    <h1>Graph Your Data Online</h1>
    <div v-if="rendering" class="container">
      <h2>{{ rendering.title }}</h2>
      <div class="tiles">
        <div v-if="rendering.errors" class="tile">
          <ul class="errors">
            <li v-for="error of rendering.errors" class="error">{{ error }}</li>
          </ul>
        </div>
        <div v-if="panels" v-for="panel of panels" :key="panel.id" class="tile">
          <h3>{{ panel.title }}</h3>
          <div v-for="error of panel.errors" class="error">{{ error }}</div>
          <div :id="panel.id" v-html="panel.contents"></div>
        </div>
      </div>
    </div>
    <div v-else class="container">
      <a @click="expression = demo" href="#">Load demo dashboard</a>
    </div>
    <div class="container form">
      <h2>Input dashboard</h2>
      <div class="field">
        <textarea v-model="expression"></textarea>
      </div>
      <div class="field">
        <input @click="onRender" type="button" value="Draw" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./app.ts" />

<style lang="scss" src="./app.scss" />
