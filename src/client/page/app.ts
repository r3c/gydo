import { Component, Vue, Watch } from "vue-property-decorator";
import { Rendering, ResourceType } from "../../server/graph/response";
import { apiBase } from "../../server/route";
import { graphRender } from "../../server/graph/route";
import { fetchJson } from "../network/http";

type Panel = {
  errors?: string[];
  html: string;
  id: string;
  title: string;
};

const demo = {
  panels: [
    {
      title: "Color properties",
      renderer: 2,
      labels: "$.demo.name",
      queries: [
        {
          points: "$.demo.luminance",
          name: "Luminance",
        },
        {
          points: "$.demo.hue",
          name: "Hue",
        },
      ],
    },
  ],
  sources: {
    demo: "https://gydo.herokuapp.com/api/demo/data",
  },
  title: "Demo dashboard",
};

@Component
export default class App extends Vue {
  expression: string = "";
  demo: string = JSON.stringify(demo, null, 2);
  rendering: Rendering | null = null;
  script: string = "";
  scriptUrls: string[] = [];
  panels: Panel[] | null = null;

  @Watch("rendering")
  public onRenderingChange() {
    if (this.rendering === null) {
      return;
    }

    const panels = [];
    const scripts = [];

    if (this.rendering.panels !== undefined) {
      for (const panel of this.rendering.panels) {
        const id = "panel-" + Math.random();

        if (panel.resources !== undefined) {
          for (const resource of panel.resources) {
            switch (resource.type) {
              case ResourceType.Javascript:
                this.scriptUrls.push(resource.url);

                break;
            }
          }
        }

        if (panel.script !== undefined) {
          scripts.push(
            `(function() { var panel = document.getElementById('${id}'); ${panel.script} })();`
          );
        }

        panels.push({
          contents: panel.contents ?? "",
          errors: panel.errors,
          id: id,
          title: panel.title,
        });
      }

      this.panels = panels;
      this.script = scripts.join("");
    } else {
      this.panels = null;
      this.script = "";
    }
  }

  public async onRender() {
    if (this.expression === "") {
      this.rendering = null;
    } else {
      try {
        const dashboard = JSON.parse(this.expression);
        const json = await fetchJson(`${apiBase}${graphRender}`, dashboard);

        location.hash = escape(JSON.stringify(dashboard));

        this.expression = JSON.stringify(dashboard, null, 2);
        this.rendering = json as Rendering;
      } catch (e) {
        this.rendering = {
          errors: [e],
          panels: [],
          title: "Rendering error",
        };
      }
    }
  }

  async mounted() {
    const hash = new URL(location.href).hash;

    this.expression = unescape((hash ?? "").slice(1));
    this.onRender();
  }

  async updated() {
    // Include all scripts by URL
    const promises = this.scriptUrls.map((url) =>
      this.includeScript((element) => (element.src = url))
    );

    // Wait for scripts to be loaded
    await Promise.all(promises);

    // Include inline script if any
    if (this.script.length > 0) {
      this.includeScript((element) =>
        element.appendChild(document.createTextNode(this.script))
      );
    }

    // Reset both script states
    this.script = "";
    this.scriptUrls = [];
  }

  private includeScript(configure: (script: HTMLScriptElement) => void) {
    const element = document.createElement("script");
    const result = new Promise((resolve) => {
      const complete = () => {
        document.body.removeChild(element);

        resolve();
      };

      element.onerror = complete;
      element.onload = complete;
    });

    configure(element);

    document.body.appendChild(element);

    return result;
  }
}
