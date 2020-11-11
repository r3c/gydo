import { Component, Vue } from "vue-property-decorator";
import {
  Dashboard,
  RenderEngine,
  SourceType,
} from "../../server/graph/request";
import { Rendering, ResourceType } from "../../server/graph/response";

type Panel = {
  errors?: string[];
  html: string;
  id: string;
  title: string;
};

@Component({})
export default class App extends Vue {
  script: string = "";
  scriptUrls: string[] = [];
  panels: Panel[] = [];
  title: string;

  async mounted() {
    const dashboard: Dashboard = {
      panels: [
        {
          title: "Number of COVID tests per day",
          renderer: RenderEngine.LineChart,
          queries: [
            {
              expression: "$.datagouvfr.date ^ ($)",
            },
            {
              expression: "$.datagouvfr ^ (date).testsPositifs",
              label: "nbPositive",
            },
            {
              expression: "$.datagouvfr ^ (date).testsRealises",
              label: "nbTests",
            },
            {
              expression: "$.datagouvfr ^ (date).(testsPositifs / testsRealises)",
              label: "ratio",
            },
          ],
        },
      ],
      sources: {
        datagouvfr: {
          type: SourceType.Json,
          url:
            "https://www.data.gouv.fr/fr/datasets/r/d2671c6c-c0eb-4e12-b69a-8e8f87fc224c",
        },
      },
      title: "Sample dashboard",
    };

    const response = await fetch("/api/graph/render", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dashboard),
    });

    const panels = [];
    const result = (await response.json()) as Rendering;
    const scripts = [];

    if (result.panels !== undefined) {
      for (const panel of result.panels) {
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
    }

    this.panels = panels;
    this.script = scripts.join();
    this.title = result.title;
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
