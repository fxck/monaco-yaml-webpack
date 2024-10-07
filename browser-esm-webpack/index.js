import * as monaco from 'monaco-editor';
import { configureMonacoYaml } from 'monaco-yaml';

self.MonacoEnvironment = {
	getWorkerUrl: function (moduleId, label) {
		if (label === 'json') {
			return './json.worker.bundle.js';
		}
		if (label === 'css' || label === 'scss' || label === 'less') {
			return './css.worker.bundle.js';
		}
		if (label === 'html' || label === 'handlebars' || label === 'razor') {
			return './html.worker.bundle.js';
		}
		if (label === 'typescript' || label === 'javascript') {
			return './ts.worker.bundle.js';
		}
		if (label === 'yaml') {
			return './yaml.worker.bundle.js';
		}
		return './editor.worker.bundle.js';
	}
};

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
})

const model = monaco.editor.createModel(
  'zerops: ',
  undefined,
  monaco.Uri.parse('zerops.yml')
);

monaco.editor.create(document.getElementById('container'), { model });
