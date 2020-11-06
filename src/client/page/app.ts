import { Component, Vue } from "vue-property-decorator";

@Component({
  props: {
    title: String,
  },
})
export default class App extends Vue {
  contents: string = "";
  title: string;

  async mounted() {
		const response = await fetch("/api/graph/render", {
			method: "POST"
		});

		const jsonResponse = await response.json();

    this.contents = jsonResponse.html;
  }
}
