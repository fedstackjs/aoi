import { Type, type Static } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import * as xlsx from 'xlsx'
import { http } from '../http'
import { withMessage } from '../async'

const batchUpdateSchema = Type.Object({
  userId: Type.String(),
  tags: Type.String()
})
const batchUpdateSchemaChecker = TypeCompiler.Compile(batchUpdateSchema)

export async function participantBatchUpdate(contestId: string, xlsxFile: File) {
  const workbook = xlsx.read(await xlsxFile.arrayBuffer())
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const data: Static<typeof batchUpdateSchema>[] = xlsx.utils.sheet_to_json(sheet)
  for (const row of data) {
    if (!batchUpdateSchemaChecker.Check(row)) {
      throw new Error('Invalid data')
    }
  }
  let success = 0
  let failed = 0
  for (const row of data) {
    try {
      await http.patch(`contest/${contestId}/participant/admin/${row.userId}`, {
        json: {
          tags: row.tags.split(',').map((tag) => tag.trim())
        }
      })
      success++
    } catch (err) {
      console.log(err)
      failed++
    }
  }
  return withMessage(`Success: ${success}, Failed: ${failed}`)
}
