import zip from 'jszip'
import { reactive, ref, watch } from 'vue'
import { computeSHA256 } from '../files'
import { http } from '../http'
import { useToast } from 'vue-toastification'
import { useAsyncTask } from '../async'

export function useDataUpload(problemId: string, updated: () => void) {
  const toast = useToast()
  const advanced = ref(false)

  const uploadInfo = reactive({
    file: [] as File[],
    hash: '',
    description: '',
    configJson: JSON.stringify(
      {
        $schema: 'local://schemas/problem_config.json'
      },
      null,
      2
    )
  })

  watch(
    () => uploadInfo.file,
    () => {
      if (uploadInfo.file.length > 0) {
        handleFile()
      }
    }
  )

  async function handleFile() {
    const file = uploadInfo.file[0]
    try {
      if (advanced.value) {
        toast.warning('Advanced mode is on, you need to manually fill in the hash and config')
      } else {
        uploadInfo.hash = await computeSHA256(file)
        const result = await zip.loadAsync(file)
        const content = await result.file('problem.json')?.async('string')
        if (content) {
          uploadInfo.configJson = content
        } else {
          toast.warning('problem.json not found in zip file, please check your file')
        }
      }
    } catch (err) {
      toast.error('Failed to parse problem data, is it a zip file?')
    }
  }

  const uploadFileTask = useAsyncTask(async () => {
    const resp = await http.get(`problem/${problemId}/data/${uploadInfo.hash}/url/upload`)
    const { url } = await resp.json<{ url: string }>()
    await fetch(url, {
      method: 'PUT',
      body: uploadInfo.file[0]
    })
    await http.post(`problem/${problemId}/data`, {
      json: {
        hash: uploadInfo.hash,
        description: uploadInfo.description,
        config: JSON.parse(uploadInfo.configJson)
      }
    })
    updated()
  })

  return { uploadInfo, uploadFileTask, advanced }
}
