import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { IOrgOssSettings } from '../schemas/index.js'
export * from './key.js'

export function getS3Client(cred: IOrgOssSettings) {
  return new S3Client({
    region: cred.region,
    credentials: {
      accessKeyId: cred.accessKey,
      secretAccessKey: cred.secretKey
    },
    endpoint: cred.endpoint,
    // If endpoint is set, default to path style
    forcePathStyle: cred.pathStyle ?? !!cred.endpoint
  })
}

export interface IUrlOptions {
  expiresIn?: number
  size?: number
}

const defaultUrlOptions: IUrlOptions = {
  expiresIn: 60
}

export async function getDownloadUrl(
  cred: IOrgOssSettings,
  key: string,
  { expiresIn } = defaultUrlOptions
) {
  const cmd = new GetObjectCommand({
    Bucket: cred.bucket,
    Key: key
  })
  return getSignedUrl(getS3Client(cred), cmd, { expiresIn })
}

export async function getUploadUrl(
  cred: IOrgOssSettings,
  key: string,
  { expiresIn, size } = defaultUrlOptions
) {
  const cmd = new PutObjectCommand({
    Bucket: cred.bucket,
    Key: key,
    ContentLength: size
  })
  return getSignedUrl(getS3Client(cred), cmd, { expiresIn })
}

export async function getDeleteUrl(
  cred: IOrgOssSettings,
  key: string,
  { expiresIn } = defaultUrlOptions
) {
  const cmd = new DeleteObjectCommand({
    Bucket: cred.bucket,
    Key: key
  })
  return getSignedUrl(getS3Client(cred), cmd, { expiresIn })
}

export async function getHeadUrl(
  cred: IOrgOssSettings,
  key: string,
  { expiresIn } = defaultUrlOptions
) {
  const cmd = new HeadObjectCommand({
    Bucket: cred.bucket,
    Key: key
  })
  return getSignedUrl(getS3Client(cred), cmd, { expiresIn })
}
