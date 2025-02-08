import { Archive } from 'libarchive.js'
import workerUrl from 'libarchive.js/dist/worker-bundle.js?url'

Archive.init({ workerUrl })

export async function parseArchiveFile(file: File) {
  const archive = await Archive.open(file)
  const filesObj = await archive.getFilesObject()
  console.log(filesObj)
}
