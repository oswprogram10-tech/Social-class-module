import { useState } from 'react';
import { licenseUrl, photoUrl, type Photo } from '../content/photos';

/**
 * 위키미디어 공용 사진과 출처 표시.
 * 학교망에서 막혀 사진을 못 불러오면 그림 기호(fallback)와 안내 문구를 보여 줍니다.
 */
export default function CommonsPhoto({
  photo,
  alt,
  fallback,
  width = 640,
  className = 'lf-photo',
}: {
  photo?: Photo;
  alt: string;
  fallback: string;
  width?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (!photo || failed)
    return (
      <div className={`${className} lf-photo--none`} aria-hidden>
        <span>{fallback}</span>
        {photo && failed && <small>사진을 불러오지 못했어요 (학교 인터넷에서 막혔을 수 있어요)</small>}
      </div>
    );
  const lic = licenseUrl(photo.license);
  return (
    <figure className={className}>
      <img src={photoUrl(photo, width)} alt={alt} loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)} />
      <figcaption>
        사진: {photo.author} ·{' '}
        {lic ? (
          <a href={lic} target="_blank" rel="noreferrer">
            {photo.license}
          </a>
        ) : (
          photo.license
        )}{' '}
        ·{' '}
        <a href={photo.page} target="_blank" rel="noreferrer">
          위키미디어 공용
        </a>
      </figcaption>
    </figure>
  );
}
