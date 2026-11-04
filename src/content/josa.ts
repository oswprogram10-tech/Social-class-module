/** 낱말 끝 글자에 받침이 있으면 앞의 조사, 없으면 뒤의 조사를 붙입니다. 한글이 아니면 "을(를)"처럼 둘 다 씁니다. */
function josa(word: string, withFinal: string, withoutFinal: string): string {
  const code = word.trim().charCodeAt(word.trim().length - 1);
  if (Number.isNaN(code) || code < 0xac00 || code > 0xd7a3) return `${word}${withFinal}(${withoutFinal})`;
  return word + ((code - 0xac00) % 28 ? withFinal : withoutFinal);
}

/** 을/를 */
export const eulReul = (word: string) => josa(word, '을', '를');
/** 이/가 */
export const iGa = (word: string) => josa(word, '이', '가');
