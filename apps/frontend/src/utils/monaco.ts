import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import { shallowRef, type Ref, type ToRefs, onMounted, watch, onBeforeUnmount } from 'vue'

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') {
      return new jsonWorker()
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new cssWorker()
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new htmlWorker()
    }
    if (label === 'typescript' || label === 'javascript') {
      return new tsWorker()
    }
    return new editorWorker()
  }
}

export default monaco

export function getSupportedLanguages() {
  return monaco.languages.getLanguages().map(({ id }) => id)
}

export interface IMonacoEditorProps {
  language?: string
  theme?: string
  readonly?: boolean
  uri?: string
}

function getModel(uri: string) {
  return (
    monaco.editor.getModel(monaco.Uri.parse(uri)) ??
    monaco.editor.createModel('', 'plaintext', monaco.Uri.parse(uri))
  )
}

export function useMonaco(
  container: Ref<HTMLElement | null>,
  model: Ref<string>,
  props: IMonacoEditorProps
) {
  const editor = shallowRef<monaco.editor.IStandaloneCodeEditor>()

  function syncValue(value: string) {
    if (editor.value && editor.value.getValue() !== value) {
      editor.value.setValue(value)
    }
  }

  function syncLanguage(language?: string) {
    if (editor.value && language) {
      monaco.editor.setModelLanguage(editor.value.getModel()!, language)
    }
  }

  function syncTheme(theme?: string) {
    if (editor.value && theme) {
      monaco.editor.setTheme(theme)
    }
  }

  function syncReadonly(readOnly?: boolean) {
    if (editor.value && readOnly) {
      editor.value.updateOptions({ readOnly })
    }
  }

  function syncUri(uri?: string) {
    if (editor.value && uri) {
      editor.value.setModel(getModel(uri))
      syncValue(model.value)
      syncLanguage(props.language)
    }
  }

  onMounted(() => {
    if (container.value) {
      const instance = (editor.value = monaco.editor.create(container.value, {
        theme: props.theme,
        automaticLayout: true,
        readOnly: props.readonly,
        model: props.uri ? getModel(props.uri) : undefined
      }))
      syncValue(model.value)
      syncLanguage(props.language)
      instance.onDidChangeModelContent(() => {
        model.value = instance.getValue() ?? ''
      })
    }
  })

  watch(() => model.value, syncValue)
  watch(() => props.language, syncLanguage)
  watch(() => props.theme, syncTheme)
  watch(() => props.readonly, syncReadonly)
  watch(() => props.uri, syncUri)

  onBeforeUnmount(() => {
    editor.value?.dispose()
  })

  return { editor }
}
