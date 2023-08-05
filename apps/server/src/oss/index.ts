import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3'
import { loadEnv } from '../utils/config.js'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3Client = new S3Client({
  region: loadEnv('S3_REGION', String),
  credentials: {
    accessKeyId: loadEnv('S3_ACCESS_KEY', String),
    secretAccessKey: loadEnv('S3_SECRET_KEY', String)
  },
  endpoint: loadEnv('S3_ENDPOINT', String)
})
const s3Bucket = loadEnv('S3_BUCKET', String)

export interface IUrlOptions {
  expiresIn: number
  sha256?: string
  size?: number
}

const defaultUrlOptions: IUrlOptions = {
  expiresIn: 60
}

/**
 * get presigned download url
 *
 * @export
 * @param {string} key Key of the object to get.
 * @param {number} expiresIn The number of seconds before the presigned URL expires
 */
export async function getDownloadUrl(key: string, { expiresIn } = defaultUrlOptions) {
  const cmd = new GetObjectCommand({
    Bucket: s3Bucket,
    Key: key
  })
  const url = await getSignedUrl(s3Client, cmd, { expiresIn })
  return url
}

export async function getUploadUrl(key: string, { expiresIn, sha256, size } = defaultUrlOptions) {
  const cmd = new PutObjectCommand({
    Bucket: s3Bucket,
    Key: key,
    ChecksumSHA256: sha256,
    ContentLength: size
  })
  const url = await getSignedUrl(s3Client, cmd, { expiresIn })
  return url
}

export async function getDeleteUrl(key: string, { expiresIn } = defaultUrlOptions) {
  const cmd = new DeleteObjectCommand({
    Bucket: s3Bucket,
    Key: key
  })
  const url = await getSignedUrl(s3Client, cmd, { expiresIn })
  return url
}

export async function getHeadUrl(key: string, { expiresIn } = defaultUrlOptions) {
  const cmd = new HeadObjectCommand({
    Bucket: s3Bucket,
    Key: key
  })
  const url = await getSignedUrl(s3Client, cmd, { expiresIn })
  return url
}

const getUrl = Object.freeze({
  download: getDownloadUrl,
  upload: getUploadUrl,
  delete: getDeleteUrl,
  head: getHeadUrl
})

export async function getOSSUrl(type: keyof typeof getUrl, key: string, options?: IUrlOptions) {
  return getUrl[type](key, options)
}
