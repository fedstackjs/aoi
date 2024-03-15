export async function detectPlatformIssues(): Promise<string[]> {
  const issues: string[] = []
  let worker, file, stream
  try {
    worker = new Worker('data:application/javascript,')
  } catch {
    issues.push('web-worker')
  }
  try {
    file = new File([''], 'file')
  } catch {
    issues.push('file')
  }
  try {
    stream = file!.stream()
  } catch {
    issues.push('file-stream')
  }
  try {
    worker!.postMessage(stream!, [stream!])
  } catch {
    issues.push('transferable-stream')
  }
  return issues
}
