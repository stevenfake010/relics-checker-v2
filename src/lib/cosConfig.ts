const DEFAULT_COS_BUCKET = 'heritage-1420709282'
const DEFAULT_COS_REGION = 'ap-shanghai'

export const CLIENT_COS_BUCKET = import.meta.env.VITE_COS_BUCKET || DEFAULT_COS_BUCKET
export const CLIENT_COS_REGION = import.meta.env.VITE_COS_REGION || DEFAULT_COS_REGION
export const CLIENT_COS_ORIGIN = `https://${CLIENT_COS_BUCKET}.cos.${CLIENT_COS_REGION}.myqcloud.com/`
