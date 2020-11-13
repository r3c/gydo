<template>
  <div>
		<h1>Graph Your Data Online</h1>
    <div v-if="rendering !== null" class="dashboard">
			<h2>{{ rendering.title }}</h2>
			<ul v-if="rendering.errors !== undefined" class="errors">
      	<li v-for="error of rendering.errors" class="error">{{ error }}</li>
			</ul>
			<div v-if="panels !== undefined" class="panels">
				<div v-for="panel of panels" :key="panel.id" class="panel">
					<h3>{{ panel.title }}</h3>
					<div v-for="error of panel.errors" class="error">{{ error }}</div>
					<div :id="panel.id" v-html="panel.contents"></div>
				</div>
			</div>
    </div>
		<div v-else class="dashboard">
			<a @click="expression = demo" href="#">Load demo dashboard</a>
		</div>
    <div class="form">
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
