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
}

export function useMonaco(
  container: Ref<HTMLElement | null>,
  model: Ref<string>,
  props: ToRefs<IMonacoEditorProps>
) {
  const editor = shallowRef<monaco.editor.IStandaloneCodeEditor>()

  onMounted(() => {
    if (container.value) {
      const instance = (editor.value = monaco.editor.create(container.value, {
        value: model.value,
        language: props.language?.value,
        theme: props.theme?.value,
        automaticLayout: true,
        readOnly: props.readonly?.value
      }))
      instance.onDidChangeModelContent(() => {
        model.value = instance.getValue() ?? ''
      })
    }
  })

  watch(
    () => model.value,
    (value) => {
      if (editor.value && editor.value.getValue() !== value) {
        editor.value.setValue(value)
      }
    }
  )

  watch(
    () => props.language,
    (language) => {
      if (editor.value && language?.value) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        monaco.editor.setModelLanguage(editor.value.getModel()!, language.value)
      }
    }
  )

  watch(
    () => props.theme,
    (theme) => {
      if (editor.value && theme?.value) {
        monaco.editor.setTheme(theme.value)
      }
    }
  )

  watch(
    () => props.readonly,
    (readonly) => {
      if (editor.value && readonly?.value) {
        editor.value.updateOptions({ readOnly: readonly.value })
      }
    }
  )

  onBeforeUnmount(() => {
    editor.value?.dispose()
  })

  return { editor }
}
