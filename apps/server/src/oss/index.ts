import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { IOrgOssSettings } from '../schemas/org.js'

function getClient(cred: IOrgOssSettings) {
  return new S3Client({
    region: cred.region,
    credentials: {
      accessKeyId: cred.accessKeyId,
      secretAccessKey: cred.secretAccessKey
    },
    endpoint: cred.endpoint
  })
}

export interface IUrlOptions {
  expiresIn: number
  sha256?: string
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
  return getSignedUrl(getClient(cred), cmd, { expiresIn })
}

export async function getUploadUrl(
  cred: IOrgOssSettings,
  key: string,
  { expiresIn, sha256, size } = defaultUrlOptions
) {
  const cmd = new PutObjectCommand({
    Bucket: cred.bucket,
    Key: key,
    ChecksumSHA256: sha256,
    ContentLength: size
  })
  return getSignedUrl(getClient(cred), cmd, { expiresIn })
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
  return getSignedUrl(getClient(cred), cmd, { expiresIn })
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
  return getSignedUrl(getClient(cred), cmd, { expiresIn })
}
