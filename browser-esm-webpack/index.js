import { configureMonacoYaml } from 'monaco-yaml';

window.MonacoEnvironment = {
  getWorkerUrl: function (_, label) {
    if (label === 'yaml') {
      return './yaml.worker.js';
    }
    return './editor.worker.js';
  }
};

export class MonacoService {
  constructor() {
    this.loadingState = { value: 'NOT_LOADED' };
  }

  load(config = {}) {
    if (this.loadingState.value === 'NOT_LOADED') {
      this.loadingState.value = 'LOADING';

      let baseUrl = config.baseUrl;
      // ensure backward compatibility
      if (baseUrl === "assets" || !baseUrl) {
        baseUrl = "monaco-editor/min/vs";
      }
      if (typeof window.monaco === 'object') {
        this.loadingState.value = 'LOADED';
        return;
      }
      const onGotAmdLoader = (require) => {
        const usedRequire = require || window.require;
        const requireConfig = { paths: { vs: `${baseUrl}` } };
        Object.assign(requireConfig, config.requireConfig || {});

        // Load monaco
        usedRequire.config(requireConfig);
        usedRequire([`vs/editor/editor.main`], () => {
          if (typeof config.onMonacoLoad === 'function') {
            config.onMonacoLoad();
          }
          this.loadingState.value = 'LOADED';
        });
      };

      if (config.monacoRequire) {
        onGotAmdLoader(config.monacoRequire);
      // Load AMD loader if necessary
      } else if (!window.require) {
        const loaderScript = document.createElement('script');
        loaderScript.type = 'text/javascript';
        loaderScript.src = `${baseUrl}/loader.js`;
        loaderScript.addEventListener('load', () => { onGotAmdLoader(); });
        document.body.appendChild(loaderScript);
      // Load AMD loader without over-riding node's require
      } else if (!window.require.config) {
        const src = `${baseUrl}/loader.js`;

        const loaderRequest = new XMLHttpRequest();
        loaderRequest.addEventListener("load", () => {
          const scriptElem = document.createElement('script');
          scriptElem.type = 'text/javascript';
          scriptElem.text = [
            // Monaco uses a custom amd loader that over-rides node's require.
            // Keep a reference to node's require so we can restore it after executing the amd loader file.
            'var nodeRequire = require;',
            loaderRequest.responseText.replace('"use strict";', ''),
            // Save Monaco's amd require and restore Node's require
            'var monacoAmdRequire = require;',
            'require = nodeRequire;',
            'require.nodeRequire = require;'
          ].join('\n');
          document.body.appendChild(scriptElem);
          onGotAmdLoader(window.monacoAmdRequire);
        });
        loaderRequest.open("GET", src);
        loaderRequest.send();
      } else {
        onGotAmdLoader();
      }
    }
  }
}

const monacoService = new MonacoService();

monacoService.load({
  onMonacoLoad: function() {
    const monaco = window.monaco;

    configureMonacoYaml(monaco, {
      enableSchemaRequest: true,
      hover: true,
      completion: true,
      validate: true,
      format: true,
      schemas: [
        {
          uri: 'https://api.app-prg1.zerops.io/api/rest/public/settings/zerops-yml-json-schema.json',
          fileMatch: [ '**/zerops.yml' ]
        }
      ]
    });

    const model = monaco.editor.createModel(
      'zerops: ',
      undefined,
      monaco.Uri.parse('zerops.yml')
    );

    monaco.editor.create(document.getElementById('container'), { model });

  }
});

