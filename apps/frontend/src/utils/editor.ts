import { ModelOperations } from '@vscode/vscode-languagedetection'
import modelBin from '@vscode/vscode-languagedetection/model/group1-shard1of1.bin?url'

import monaco from './monaco'

const languages = monaco.languages.getLanguages()

const modulOperations = new ModelOperations({
  modelJsonLoaderFunc: () =>
    import('@vscode/vscode-languagedetection/model/model.json').then((res) => res.default),
  weightsLoaderFunc: () => fetch(modelBin).then((res) => res.arrayBuffer())
})

export async function detectLanguage(text: string, filename: string) {
  const ext = filename.split('.').pop()
  let language = languages.find(({ extensions }) => extensions?.includes('.' + ext))
  if (language) return language.id

  const result = await modulOperations.runModel(text)
  const { languageId } = result[0]
  language = languages.find(
    ({ id, aliases, extensions }) =>
      id === languageId || aliases?.includes(languageId) || extensions?.includes('.' + languageId)
  )
  return language?.id ?? 'plaintext'
}
