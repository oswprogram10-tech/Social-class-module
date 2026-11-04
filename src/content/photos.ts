/** 위키미디어 공용(Wikimedia Commons)의 자유 라이선스 사진: 학생 브라우저에서 바로 불러오고, 작가·라이선스를 표시합니다. */

export interface Photo {
  /** 위키미디어 공용 파일 이름 ("File:" 없이) */
  file: string;
  author: string;
  license: string;
  /** 파일 설명 페이지 */
  page: string;
}

/** 위키미디어 공용 사진 주소 (작은 크기로 받아 와요) */
export function photoUrl(p: Photo, width = 640): string {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(p.file.replace(/ /g, '_'))}?width=${width}`;
}

const LICENSE_URL: Record<string, string> = {
  'CC BY 2.0': 'https://creativecommons.org/licenses/by/2.0/',
  'CC BY 3.0': 'https://creativecommons.org/licenses/by/3.0/',
  'CC BY 4.0': 'https://creativecommons.org/licenses/by/4.0/',
  'CC BY-SA 2.0': 'https://creativecommons.org/licenses/by-sa/2.0/',
  'CC BY-SA 2.0 de': 'https://creativecommons.org/licenses/by-sa/2.0/de/',
  'CC BY-SA 2.5': 'https://creativecommons.org/licenses/by-sa/2.5/',
  'CC BY-SA 3.0': 'https://creativecommons.org/licenses/by-sa/3.0/',
  'CC BY-SA 4.0': 'https://creativecommons.org/licenses/by-sa/4.0/',
  CC0: 'https://creativecommons.org/publicdomain/zero/1.0/',
  'KOGL Type 1': 'https://www.kogl.or.kr/info/licenseType1.do',
};

export function licenseUrl(license: string): string | undefined {
  return LICENSE_URL[license];
}
