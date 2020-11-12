<template>
  <div>
    <h2>{{ title }}</h2>
		<div class="form">
			<div class="field">
				<textarea v-model="expression"></textarea>
			</div>
			<div class="field">
				<input v-on:click="graphRender" type="button" value="Draw" />
			</div>
		</div>
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

<style lang="scss" src="./app.scss" />
