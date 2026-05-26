import { useSignedUrl } from '../hooks/useSignedUrl'

interface SignedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string | undefined
}

export function SignedImage({ src, alt, ...rest }: SignedImageProps) {
  const signedSrc = useSignedUrl(src ?? null)

  if (!signedSrc) {
    return (
      <div
        className={rest.className}
        style={{ ...((rest.style as React.CSSProperties) ?? {}), backgroundColor: '#f0ece4' }}
      />
    )
  }

  return <img {...rest} src={signedSrc} alt={alt} />
}
