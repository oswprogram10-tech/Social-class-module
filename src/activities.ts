/**
 * 활동 정의
 * 2022 개정 사회과 3~4학년군
 * 성취기준 문구는 교육부 고시 원문과 대조해 확인하세요.
 */

export type ActivityId =
  | 'feel'
  | 'better'
  | 'timeline'
  | 'mission'
  | 'legend'
  | 'market'
  | 'solve'
  | 'promote'
  | 'election'
  | 'factcheck'
  | 'climate'
  | 'population'
  | 'history'
  | 'globe'
  | 'worldclimate'
  | 'trade'
  | 'worldpop'
  | 'global'
  | 'landform'
  | 'change'
  | 'oldnew'
  | 'heritage'
  | 'democracy'
  | 'villages'
  | 'territory'
  | 'rights'
  | 'modern'
  | 'oldthings'
  | 'exchange'
  | 'powers'
  | 'economy'
  | 'growth'
  | 'prehistory'
  | 'joseon'
  | 'colonial';

/** 활동 종류: 핀 남기기 / 미션(자동 확인) / 단계별 문제 해결 */
export type ActivityKind =
  | 'pin'
  | 'mission'
  | 'solve'
  | 'timeline'
  | 'market'
  | 'election'
  | 'factcheck'
  | 'climate'
  | 'population'
  | 'history'
  | 'globe'
  | 'worldclimate'
  | 'trade'
  | 'worldpop'
  | 'global'
  | 'landform'
  | 'sort'
  | 'territory';

/** 지도를 쓰는 활동인지 */
export function isMapKind(kind: ActivityKind): boolean {
  return kind === 'pin' || kind === 'mission' || kind === 'solve';
}

/** 화면 전체를 스스로 그리는 활동 (학교 지도·연표를 쓰지 않음) */
export function isSelfKind(kind: ActivityKind): boolean {
  return !isMapKind(kind) && kind !== 'timeline';
}

export interface Choice {
  id: string;
  emoji: string;
  label: string;
}

export interface ActivityDef {
  id: ActivityId;
  kind: ActivityKind;
  title: string;
  standard: string;
  standardText: string;
  /** 학생에게 보여 줄 안내 (읽어주기 대상) */
  guide: string;
  /** 생각을 돕는 질문 카드 (정답 대신 질문으로 생각을 이끌어 줍니다). 교사가 학급별로 고칠 수 있습니다. */
  questions: string[];
}

export interface UnitDef {
  grade: string;
  title: string;
  activities: ActivityId[];
}

export const UNITS: UnitDef[] = [
  { grade: '3-1', title: '(1) 우리가 사는 곳', activities: ['feel', 'better'] },
  { grade: '3-1', title: '(2) 일상에서 만나는 과거', activities: ['timeline', 'oldthings'] },
  { grade: '3-2', title: '(3) 사회 변화와 다양한 문화', activities: ['change'] },
  { grade: '3-2', title: '(4) 옛날과 오늘날의 생활 모습', activities: ['oldnew'] },
  { grade: '4-1', title: '(5) 지도로 만나는 우리 지역', activities: ['mission', 'legend'] },
  { grade: '4-1', title: '(6) 우리 지역의 문화유산', activities: ['heritage'] },
  { grade: '4-1', title: '(7) 경제활동과 지역 간 교류', activities: ['market', 'exchange'] },
  { grade: '4-2', title: '(8) 민주주의와 자치', activities: ['democracy'] },
  { grade: '4-2', title: '(9) 지역문제를 해결하고 지역을 알리는 노력', activities: ['solve', 'promote'] },
  { grade: '4-2', title: '(10) 다양한 환경과 삶의 모습', activities: ['villages'] },
  { grade: '5-1', title: '(1) 우리나라 국토 여행', activities: ['territory'] },
  { grade: '5-1', title: '(2) 우리나라 지리 탐구', activities: ['climate', 'population'] },
  { grade: '5-1', title: '(3) 법과 인권의 보장', activities: ['rights'] },
  { grade: '5-2', title: '(4) 유적과 유물로 살펴본 옛 사람들의 생활', activities: ['prehistory'] },
  { grade: '5-2', title: '(5) 달라지는 시대, 변화하는 생활 모습', activities: ['joseon'] },
  { grade: '5-2', title: '(6) 식민 통치와 저항, 전쟁이 바꾼 사회와 생활', activities: ['colonial', 'history'] },
  { grade: '6-1', title: '(7) 평화 통일을 위한 노력, 민주화와 산업화', activities: ['modern'] },
  { grade: '6-1', title: '(8) 민주주의와 시민 참여', activities: ['election', 'powers', 'factcheck'] },
  { grade: '6-1', title: '(9) 지구, 대륙 그리고 국가들', activities: ['globe'] },
  { grade: '6-2', title: '(10) 세계의 자연환경', activities: ['landform', 'worldclimate'] },
  { grade: '6-2', title: '(11) 시장경제와 국가 간 거래', activities: ['economy', 'growth', 'trade'] },
  { grade: '6-2', title: '(12) 지구촌 사람들', activities: ['worldpop', 'global'] },
];

export const ACTIVITIES: Record<ActivityId, ActivityDef> = {
  feel: {
    id: 'feel',
    kind: 'pin',
    title: '나의 장소감 지도',
    standard: '[4사01-01]',
    standardText:
      '주변 여러 장소에서의 경험과 느낌을 다양한 방식으로 표현하고, 장소감을 나누며 서로 존중하는 태도를 지닌다.',
    guide: '우리 동네에서 기억에 남는 장소를 지도에서 찾아 눌러 보세요. 그곳에서 어떤 느낌이 들었는지 표시해요.',
    questions: [
      '그 장소에서 무엇을 했나요?',
      '그때 어떤 기분이 들었나요? 왜 그런 기분이 들었을까요?',
      '친구는 같은 장소에서 다른 느낌을 받았나요? 왜 다를까요?',
    ],
  },
  better: {
    id: 'better',
    kind: 'pin',
    title: '더 살기 좋은 우리 동네',
    standard: '[4사01-02]',
    standardText: '주변의 여러 장소를 살펴보고, 우리가 사는 곳을 더 살기 좋은 곳으로 만드는 방안을 탐색한다.',
    guide: '우리 동네에서 불편하거나 위험한 곳을 찾아 눌러 보세요. 무엇이 있으면 더 좋아질지 골라요.',
    questions: [
      '그곳은 누구에게 불편할까요? (어린이, 어르신, 휠체어 이용자…)',
      '왜 그런 문제가 생겼을까요?',
      '내가 고른 방법이 생기면 무엇이 달라질까요? 다른 방법은 없을까요?',
    ],
  },
  mission: {
    id: 'mission',
    kind: 'mission',
    title: '방위와 거리 미션',
    standard: '[4사05-01·02]',
    standardText:
      '우리 지역을 표현한 다양한 종류의 지도를 찾아보고, 지도의 요소를 이해한다. / 지도에서 우리 지역의 위치를 파악하고, 우리 지역의 지리 정보를 탐색한다.',
    guide: '방위표와 축척 막대를 이용해 미션에 맞는 장소를 지도에서 찾아 표시해요.',
    questions: [
      '방위표에서 북쪽은 지도의 어느 쪽인가요?',
      '축척 막대 한 칸은 실제로 몇 m일까요? 손가락으로 재어 볼까요?',
      '내가 찾은 장소를 친구에게 “학교에서 ○쪽으로 약 ○m”라고 설명해 볼까요?',
    ],
  },
  timeline: {
    id: 'timeline',
    kind: 'timeline',
    title: '나의 연표 만들기',
    standard: '[4사02-01]',
    standardText:
      '일상 속에서 시간의 흐름을 경험할 수 있는 사례를 살펴보고, 이를 바탕으로 역사의 시간 개념을 이해한다.',
    guide: '내가 태어난 해부터 지금까지 기억에 남는 일을 연도와 함께 적어 나의 연표를 만들어요.',
    questions: [
      '연표에서 왼쪽과 오른쪽 중 어느 쪽이 더 옛날인가요?',
      '가장 오래된 일과 가장 최근의 일은 몇 년 차이가 날까요?',
      '가족에게 물어보면 내가 기억하지 못하는 일도 연표에 넣을 수 있을까요?',
    ],
  },
  legend: {
    id: 'legend',
    kind: 'pin',
    title: '우리 반 지도 기호 만들기',
    standard: '[4사05-01]',
    standardText: '우리 지역을 표현한 다양한 종류의 지도를 찾아보고, 지도의 요소를 이해한다.',
    guide: '우리 동네의 장소를 하나 골라, 그 장소를 나타낼 기호를 직접 정해서 지도에 표시해요.',
    questions: [
      '왜 그 기호를 골랐나요? 친구도 보자마자 알 수 있을까요?',
      '같은 장소를 친구들은 어떤 기호로 나타냈나요?',
      '지도를 보는 모든 사람이 기호를 똑같이 이해하려면 어떻게 해야 할까요?',
    ],
  },
  solve: {
    id: 'solve',
    kind: 'solve',
    title: '우리 동네 문제 해결하기',
    standard: '[4사09-01]',
    standardText:
      '생활 주변에서 찾을 수 있는 여러 가지 문제를 파악하고, 그 문제를 합리적으로 해결하는 능력을 기른다.',
    guide: '우리 동네의 문제를 하나 찾아, 원인을 생각하고 두 가지 해결 방법을 비교한 뒤 더 좋은 방법을 골라요.',
    questions: [
      '이 문제 때문에 누가 불편을 겪나요?',
      '문제가 생긴 까닭은 무엇일까요? 한 가지만 있을까요?',
      '두 방법 중 더 많은 사람에게 도움이 되고, 실천하기 쉬운 것은 무엇일까요?',
    ],
  },
  market: {
    id: 'market',
    kind: 'market',
    title: '기회비용 장터',
    standard: '[4사07-01]',
    standardText:
      '자원의 희소성으로 인해 경제활동에서 선택의 문제가 발생함을 이해하고, 경제활동에서 합리적 선택의 방법을 탐색한다.',
    guide: '용돈 5,000원으로 사고 싶은 것을 골라요. 그리고 고르지 못한 것 중 가장 아쉬운 것, 기회비용을 찾아요.',
    questions: [
      '사고 싶은 것을 모두 살 수 없는 까닭은 무엇일까요?',
      '고르지 못한 것 중에서 가장 아쉬운 것은 무엇인가요? 그것이 기회비용이에요.',
      '다음에 다시 고른다면 무엇을 바꾸고 싶나요? 왜 그런가요?',
    ],
  },
  election: {
    id: 'election',
    kind: 'election',
    title: '선거 4원칙 지키기',
    standard: '[6사08-01]',
    standardText:
      '민주주의에서 선거의 의미와 역할을 파악하고, 시민의 주권 행사를 위해 선거에 참여하는 태도를 기른다.',
    guide: '행복섬의 선거 이야기를 읽고, 어떤 선거 원칙이 지켜지지 않았는지 찾아요.',
    questions: [
      '원칙이 지켜지지 않아서 누가 손해를 봤나요?',
      '우리 반 회장 선거에서는 네 가지 원칙이 잘 지켜지고 있나요?',
      '네 가지 원칙 중 하나라도 없으면 선거가 공정하다고 할 수 있을까요?',
    ],
  },
  factcheck: {
    id: 'factcheck',
    kind: 'factcheck',
    title: '팩트체크 스튜디오',
    standard: '[6사08-03]',
    standardText:
      '민주주의에서 미디어의 의미와 역할을 이해하고, 여러 가지 미디어의 내용을 비판적으로 분석하여 올바르게 이용하는 태도를 기른다.',
    guide: '같은 일을 다룬 여러 미디어 자료를 읽고, 사실과 의견을 구분한 뒤 믿을 만한지 따져 봐요.',
    questions: [
      '사실은 확인할 수 있는 내용이고, 의견은 생각이나 느낌이에요. 이 문장은 어느 쪽인가요?',
      '같은 일인데 자료마다 말하는 것이 왜 다를까요?',
      '이 자료를 만든 사람은 무엇을 바랄까요?',
    ],
  },
  climate: {
    id: 'climate',
    kind: 'climate',
    title: '우리나라 기후 탐구',
    standard: '[6사02-01]',
    standardText:
      '우리나라의 계절별 기후 특징을 자료에서 탐구하고, 기후변화로 인한 자연재해의 심각성을 이해한다.',
    guide: '달을 바꾸며 도시별 기온과 강수량을 비교하고, 도시를 눌러 기후 그래프를 살펴봐요.',
    questions: [
      '겨울에 남쪽과 북쪽의 기온은 어떻게 다른가요?',
      '1년 중 비가 가장 많이 오는 계절은 언제인가요?',
      '같은 위도인데 동해안과 서해안의 기온이 다른 까닭은 무엇일까요?',
    ],
  },
  population: {
    id: 'population',
    kind: 'population',
    title: '우리나라 인구 분포',
    standard: '[6사02-02]',
    standardText: '우리나라의 지역별 인구 분포의 특징을 알아보고, 이에 따른 문제점과 해결 방안을 탐색한다.',
    guide: '연도를 바꾸며 시도별 인구가 어떻게 변했는지 살펴보고, 수도권에 사는 사람의 비율을 확인해요.',
    questions: [
      '인구가 많은 곳은 주로 어디에 있나요? 왜 그럴까요?',
      '인구가 줄어든 지역에는 어떤 어려움이 생길까요?',
      '수도권 인구 비율은 1980년과 지금 얼마나 달라졌나요?',
    ],
  },
  history: {
    id: 'history',
    kind: 'history',
    title: '한국사 연표 순서 (전체 정리)',
    standard: '[6사04~06]',
    standardText: '선사 시대부터 광복까지, 유적·유물과 기록을 통해 각 시대 사람들의 생활을 추론한다.',
    guide: '우리 역사의 큰 사건 8가지를 옛날부터 차례대로 놓아 연표를 완성해요.',
    questions: [
      '가장 오래된 사건과 가장 최근의 사건은 무엇인가요?',
      '나라가 바뀐 사건(건국)을 순서대로 말해 볼까요?',
      '각 사건이 일어난 시대 사람들은 어떻게 살았을까요?',
    ],
  },
  globe: {
    id: 'globe',
    kind: 'globe',
    title: '지구본과 세계지도',
    standard: '[6사09-01·02]',
    standardText:
      '세계를 표현하는 다양한 공간 자료의 특징을 이해하고, 지구본과 세계지도에서 위치를 표현하는 방법을 익힌다. / 세계 주요 대륙과 대양을 파악하고, 우리나라 및 세계 여러 국가의 위치와 영토의 특징을 이해한다.',
    guide: '지구본을 돌려 보고 세계지도와 비교해요. 위도와 경도로 나라를 찾아요.',
    questions: [
      '지구본과 세계지도에서 그린란드의 크기는 어떻게 다르게 보이나요?',
      '적도와 본초 자오선은 각각 어디에 있나요?',
      '우리나라의 위치를 위도와 경도로 말해 볼까요?',
    ],
  },
  change: {
    id: 'change',
    kind: 'sort',
    title: '사회 변화와 다양한 문화',
    standard: '[4사03-01·02]',
    standardText:
      '최근 사회 변화의 양상과 특징을 파악하고, 그로 인해 나타난 생활모습의 변화를 탐색한다. / 우리 사회에 나타나는 다양한 문화의 특징을 이해하고, 편견과 차별의 문제를 해결하는 방안을 탐구한다.',
    guide: '생활 모습 카드를 저출산·고령화, 정보화, 세계화로 나누고, 다른 문화를 존중하는 모습을 찾아봐요.',
    questions: ['10년 전과 비교해 우리 생활에서 달라진 것은 무엇일까요?', '다른 나라에서 온 친구가 우리 반에 오면 어떤 마음일까요?', '편견은 왜 생길까요?'],
  },
  oldnew: {
    id: 'oldnew',
    kind: 'sort',
    title: '옛날과 오늘날의 생활 모습',
    standard: '[4사04-01·02]',
    standardText:
      '옛날 풍습에 대해 알아보고, 오늘날과 비교하여 변화상을 파악한다. / 옛날부터 오늘날까지 이어져 오는 생활 모습을 살펴보고, 그 의미를 탐색한다.',
    guide: '세시 풍속을 알맞은 명절과 짝짓고, 옛날 도구가 오늘날 어떤 도구로 바뀌었는지 찾아봐요.',
    questions: ['우리 집에서 명절에 하는 일은 무엇인가요?', '옛날 도구와 오늘날 도구는 무엇이 같고 무엇이 다를까요?', '할머니, 할아버지께 어린 시절 이야기를 여쭈어 볼까요?'],
  },
  heritage: {
    id: 'heritage',
    kind: 'pin',
    title: '우리 지역 문화유산 지도',
    standard: '[4사06-01·02]',
    standardText:
      '지역의 문화유산을 통해 문화유산의 의미와 유형을 알아보고, 문화유산의 가치를 탐색한다. / 지역의 박물관, 기념관 등을 활용하여 지역의 역사적 인물이나 사건을 조사하고, 그 의미를 탐구한다.',
    guide: '우리 지역의 문화유산을 지도에 표시하고, 왜 소중한지와 지키는 방법을 적어요.',
    questions: ['우리 지역에는 어떤 옛 건물, 비석, 축제, 전해 오는 이야기가 있나요?', '이 문화유산이 사라지면 무엇을 잃게 될까요?', '문화유산을 지키려면 우리가 무엇을 할 수 있을까요?'],
  },
  democracy: {
    id: 'democracy',
    kind: 'sort',
    title: '민주주의와 자치',
    standard: '[4사08-01·02]',
    standardText:
      '학교 자치 사례를 통하여 민주주의의 의미를 이해하고, 학교생활에서 민주주의를 실천하는 능력을 기른다. / 지역에서 주민 자치를 실천하는 사례를 조사하고, 지역 문제 해결에 참여하는 태도를 기른다.',
    guide: '학교에서 일을 정하는 모습이 민주적인지 판단하고, 주민이 지역 일에 참여하는 방법을 알아봐요.',
    questions: ['우리 반 회의에서 모두가 의견을 말하고 있나요?', '다수결로 정할 때 조심해야 할 점은 무엇일까요?', '우리 지역에 바라는 점을 어디에 알릴 수 있을까요?'],
  },
  villages: {
    id: 'villages',
    kind: 'sort',
    title: '다양한 환경과 삶의 모습',
    standard: '[4사10-01·02]',
    standardText:
      '여러 지역의 자연환경과 인문환경의 특징을 살펴보고, 환경의 이용과 개발에 따른 변화를 탐구한다. / 여러 지역의 사례를 통해 환경에 따라 다양한 삶의 모습을 비교한다.',
    guide: '농촌, 어촌, 산지촌, 도시 사람들의 생활을 나누어 보고, 환경을 개발하면 무엇이 달라지는지 생각해요.',
    questions: ['우리 지역은 농촌, 어촌, 산지촌, 도시 중 어디와 가장 비슷한가요?', '자연환경이 다르면 하는 일은 어떻게 달라질까요?', '개발할 때 지켜야 할 것은 무엇일까요?'],
  },
  territory: {
    id: 'territory',
    kind: 'territory',
    title: '우리나라 국토 여행',
    standard: '[6사01-01·02]',
    standardText:
      '우리나라 산지, 하천, 해안 지형의 위치를 확인하고 지형의 분포 특징을 탐구한다. / 독도의 지리적 특성에 대한 이해를 바탕으로 영토로서 독도가 지니는 중요성을 탐구한다.',
    guide: '우리나라 지도에서 산지, 하천, 해안 지형과 독도를 찾아보고, 지형이 어떻게 분포하는지 알아봐요.',
    questions: ['높은 산은 우리나라의 동쪽과 서쪽 중 어디에 많나요?', '서해안과 동해안은 어떻게 다를까요?', '독도가 우리 땅이라는 근거에는 무엇이 있을까요?'],
  },
  rights: {
    id: 'rights',
    kind: 'sort',
    title: '법과 인권의 보장',
    standard: '[6사03-01·02]',
    standardText:
      '일상 사례에서 법의 의미와 역할을 이해하고, 헌법에 규정된 인권이 일상생활에서 구현되는 사례를 조사하여 인권 친화적 태도를 기른다. / 생활 속에서 인권 보장이 필요한 사례를 탐구하여 인권 의식을 기르고, 인권 보호를 실천하는 태도를 기른다.',
    guide: '생활 속 모습이 헌법의 어떤 기본권과 관련 있는지 찾고, 인권을 존중하는 행동을 가려내요.',
    questions: ['헌법은 왜 국민의 기본권을 적어 두었을까요?', '우리 학교에서 인권이 잘 지켜지는 모습은 무엇인가요?', '인권을 침해당했을 때 어디에 도움을 청할 수 있을까요?'],
  },
  oldthings: {
    id: 'oldthings',
    kind: 'sort',
    title: '오래된 물건과 지역의 변화',
    standard: '[4사02-02·03]',
    standardText:
      '오래된 물건이나 자료들을 주변에서 찾아보고, 이를 통해 과거의 모습을 살펴볼 수 있음을 이해한다. / 지역의 변화상을 보여주는 역사 자료를 분석하여 지역 사람들의 달라진 생활 모습을 파악한다.',
    guide: '과거를 알려 주는 자료를 사진·물건·글·이야기로 나누고, 우리 지역의 옛날과 오늘날 모습을 비교해요.',
    questions: ['우리 집에서 가장 오래된 물건은 무엇일까요?', '그 물건을 쓰던 때에는 생활이 어땠을까요?', '우리 동네는 옛날과 비교해 무엇이 달라졌을까요?'],
  },
  exchange: {
    id: 'exchange',
    kind: 'sort',
    title: '생산과 소비, 지역 간 교류',
    standard: '[4사07-02]',
    standardText: '생산과 소비 활동을 파악하고, 인적⋅물적 교류의 사례를 통해 각 지역 및 사람들이 상호의존 관계를 맺고 있음을 탐색한다.',
    guide: '경제활동을 생산과 소비로 나누고, 지역끼리 물건과 사람이 오가는 교류를 찾아봐요.',
    questions: ['오늘 내가 한 소비 활동은 무엇인가요?', '우리 지역에서 많이 생산하는 것은 무엇일까요?', '다른 지역과 교류하지 않으면 어떤 점이 불편할까요?'],
  },
  powers: {
    id: 'powers',
    kind: 'sort',
    title: '국회·행정부·법원',
    standard: '[6사08-02]',
    standardText: '민주 국가에서 국회, 행정부, 법원이 하는 일에 대해 이해하고, 각 국가기관의 권력을 분립하는 이유를 탐색한다.',
    guide: '나라의 일이 국회, 행정부, 법원 중 어디의 일인지 나누고, 권력을 나누어 맡는 까닭을 생각해요.',
    questions: ['세 기관이 하는 일은 각각 무엇인가요?', '한 기관이 모든 일을 맡으면 어떤 문제가 생길까요?', '기관들이 서로 살펴보는 방법에는 무엇이 있을까요?'],
  },
  economy: {
    id: 'economy',
    kind: 'sort',
    title: '가계와 기업, 근로자의 권리',
    standard: '[6사11-01]',
    standardText: '시장경제에서 가계와 기업의 역할을 이해하고, 근로자의 권리와 기업의 자유 및 사회적 책임을 탐색한다.',
    guide: '가계와 기업이 하는 일을 나누고, 근로자의 권리가 지켜졌는지, 기업이 사회적 책임을 다하는지 판단해요.',
    questions: ['우리 가족은 가계로서 어떤 경제활동을 하나요?', '근로자의 권리는 왜 법으로 지켜야 할까요?', '좋은 기업은 어떤 기업일까요?'],
  },
  growth: {
    id: 'growth',
    kind: 'sort',
    title: '경제성장과 생활의 변화',
    standard: '[6사11-02]',
    standardText: '경제성장이 우리 생활에 미치는 영향을 파악하고, 빠른 경제성장으로 발생한 문제의 해결 방안을 탐색한다.',
    guide: '경제성장으로 좋아진 점과 생긴 문제를 나누고, 문제마다 알맞은 해결 방안을 짝지어요.',
    questions: ['할머니, 할아버지가 어렸을 때와 지금 생활은 어떻게 다를까요?', '경제가 성장하면 모든 사람이 똑같이 행복해질까요?', '문제를 해결하려면 누가 무엇을 해야 할까요?'],
  },
  prehistory: {
    id: 'prehistory',
    kind: 'sort',
    title: '유물로 옛 생활 추론하기',
    standard: '[6사04-01·02·03]',
    standardText:
      '선사 시대와 고조선의 유적과 유물을 활용하여 당시 사람들의 생활을 추론한다. / 역사 기록이나 유적과 유물에 나타난 고대 사람들의 생각과 생활을 추론한다. / 다양한 역사 자료를 활용하여 고려 시대 사회 모습과 사람들의 생활을 추론한다.',
    guide: '유물과 생활 모습으로 시대를 구분하고, 고인돌·금관·석굴암·직지 같은 유물에서 옛 사람들의 생활과 생각을 추론해요.',
    questions: ['이 유물은 무엇으로, 어떻게 만들었을까요?', '이 유물을 쓴 사람은 어떤 일을 했을까요?', '유물만 보고 알 수 없는 것은 무엇일까요?'],
  },
  joseon: {
    id: 'joseon',
    kind: 'sort',
    title: '조선의 유교 문화와 생활 변화',
    standard: '[6사05-01·02]',
    standardText:
      '조선 시대 사람들의 생각과 생활에 유교 문화가 미친 영향을 파악한다. / 조선 후기 사회⋅문화적 변화와 개항기 근대 문물 수용 과정에서 달라진 사람들의 생활을 이해한다.',
    guide: '유교 문화가 조선 사람들의 생활에 남긴 모습을 찾고, 조선 후기와 개항기에 생활이 어떻게 달라졌는지 나누어 봐요.',
    questions: ['오늘날에도 남아 있는 유교 문화는 무엇일까요?', '신분에 따라 생활이 다르면 어떤 점이 불공평했을까요?', '기차와 전등이 처음 생겼을 때 사람들은 어떤 마음이었을까요?'],
  },
  colonial: {
    id: 'colonial',
    kind: 'sort',
    title: '식민 통치와 저항, 광복과 전쟁',
    standard: '[6사06-01·02]',
    standardText:
      '일제의 식민 통치와 이에 대한 저항이 사회와 생활에 미친 영향을 이해한다. / 8⋅15 광복과 6⋅25 전쟁이 사회와 생활에 미친 영향을 파악한다.',
    guide: '일제의 수탈·탄압과 이에 맞선 독립운동을 구분하고, 광복과 6·25 전쟁이 사람들의 생활을 어떻게 바꾸었는지 알아봐요.',
    questions: ['일제는 왜 우리말과 이름을 빼앗으려 했을까요?', '독립운동가들은 어떤 방법으로 맞섰나요?', '6·25 전쟁은 사람들의 생활에 어떤 아픔을 남겼을까요?'],
  },
  modern: {
    id: 'modern',
    kind: 'history',
    title: '민주화와 산업화 연표',
    standard: '[6사07-01·02]',
    standardText:
      '분단으로 나타난 문제점과 분단과 관련된 장소를 평화의 장소로 바꾸는 노력을 탐구한다. / 민주화와 산업화 과정에서 일어난 변화를 탐구하고 그 의미를 이해한다.',
    guide: '6·25 전쟁 정전부터 첫 남북 정상 회담까지 큰 사건을 차례로 놓아 민주화와 산업화의 흐름을 살펴봐요.',
    questions: ['4·19 혁명, 5·18 민주화 운동, 6월 민주 항쟁은 무엇을 지키려 했을까요?', '경제가 빠르게 발전하면서 생활은 어떻게 달라졌을까요?', '분단으로 생긴 어려움은 무엇이고, 평화 통일을 위해 어떤 노력을 할 수 있을까요?'],
  },
  landform: {
    id: 'landform',
    kind: 'landform',
    title: '세계의 지형 경관',
    standard: '[6사10-01]',
    standardText: '세계의 여러 지역의 지형 경관을 살펴보고, 이를 통해 다양한 삶의 모습을 이해한다.',
    guide: '세계지도에서 산맥, 강, 사막, 빙하, 해안, 화산 지형을 찾아보고, 그곳 사람들이 어떻게 살아가는지 알아봐요.',
    questions: [
      '이 지형은 어떻게 만들어졌을까요?',
      '이곳에 사는 사람들은 지형을 어떻게 이용하고 있나요?',
      '우리나라에도 비슷한 지형이 있을까요?',
    ],
  },
  worldclimate: {
    id: 'worldclimate',
    kind: 'worldclimate',
    title: '세계의 다양한 기후',
    standard: '[6사10-02]',
    standardText: '세계의 다양한 기후를 알아보고 기후 환경과 인간생활 간의 관계를 탐구한다.',
    guide: '세계 여러 도시의 기후 그래프를 비교하고, 기후에 따라 옷과 음식과 집이 어떻게 다른지 알아봐요.',
    questions: [
      '적도에서 멀어질수록 기온은 어떻게 달라지나요?',
      '비가 거의 오지 않는 곳에 사는 사람들은 물을 어떻게 구할까요?',
      '같은 기후라도 사는 모습이 다른 까닭은 무엇일까요?',
    ],
  },
  trade: {
    id: 'trade',
    kind: 'trade',
    title: '무역 시뮬레이션',
    standard: '[6사11-03]',
    standardText: '사례를 통해 무역의 의미를 이해하고, 국가 간 무역이 발생하는 이유를 탐구한다.',
    guide: '기술나라가 되어 혼자 만들어 살 때와 이웃 나라와 무역할 때를 비교하고, 나라끼리 무역하는 까닭을 알아봐요.',
    questions: [
      '우리 집에 있는 물건 중 다른 나라에서 온 것은 무엇인가요?',
      '한 나라가 필요한 것을 모두 직접 만들면 어떤 점이 어려울까요?',
      '무역하는 나라에 어려운 일이 생기면 우리에게는 어떤 영향이 있을까요?',
    ],
  },
  global: {
    id: 'global',
    kind: 'global',
    title: '지구촌 문제 해결',
    standard: '[6사12-02]',
    standardText: '지구촌을 위협하는 다양한 문제들을 파악하고, 지속가능한 미래를 위한 해결 방안을 탐색한다.',
    guide: '지구촌 문제 하나를 골라 원인을 생각하고, 누가 어떻게 해결할 수 있을지 비교한 뒤 나의 실천 약속을 만들어요.',
    questions: [
      '이 문제는 우리 생활과 어떻게 이어져 있을까요?',
      '한 나라의 힘만으로 해결하기 어려운 까닭은 무엇일까요?',
      '오늘부터 내가 할 수 있는 작은 실천은 무엇일까요?',
    ],
  },
  worldpop: {
    id: 'worldpop',
    kind: 'worldpop',
    title: '세계 인구 분포',
    standard: '[6사12-01]',
    standardText: '세계의 인구 분포를 파악하고 여러 국가의 인구 특징을 탐구한다.',
    guide: '세계지도에서 나라별 인구와 인구 밀도를 비교하고, 사람이 많이 사는 곳과 드문 곳을 찾아봐요.',
    questions: [
      '사람이 많이 모여 사는 곳은 어느 대륙에 있나요?',
      '인구가 많은 나라와 인구 밀도가 높은 나라는 같을까요, 다를까요?',
      '사람이 드문 곳에는 어떤 자연환경이 있을까요?',
    ],
  },
  promote: {
    id: 'promote',
    kind: 'pin',
    title: '우리 지역 알리기',
    standard: '[4사09-02]',
    standardText: '지역의 자연환경, 역사, 문화, 생산물 등을 알리려는 지역사회의 노력을 알고 관심을 갖는다.',
    guide: '우리 지역의 자랑거리를 지도에 표시하고, 다른 지역 사람들에게 알릴 홍보 문구를 만들어요.',
    questions: [
      '다른 지역 사람이 우리 지역에 오면 꼭 보여 주고 싶은 것은 무엇인가요?',
      '우리 지역은 축제나 캐릭터로 무엇을 알리고 있나요?',
      '홍보 문구를 들은 사람이 가 보고 싶어지려면 어떤 말을 넣으면 좋을까요?',
    ],
  },
};

export const ACTIVITY_ORDER: ActivityId[] = UNITS.flatMap((u) => u.activities);

export function isActivityId(v: unknown): v is ActivityId {
  return typeof v === 'string' && (ACTIVITY_ORDER as string[]).includes(v);
}

/** 장소감 (활동 1) */
export const FEELINGS: Choice[] = [
  { id: 'happy', emoji: '😊', label: '좋아요' },
  { id: 'fun', emoji: '😆', label: '신나요' },
  { id: 'calm', emoji: '😌', label: '편안해요' },
  { id: 'proud', emoji: '🥰', label: '소중해요' },
  { id: 'scared', emoji: '😨', label: '무서워요' },
  { id: 'annoyed', emoji: '😣', label: '불편해요' },
  { id: 'sad', emoji: '😢', label: '슬퍼요' },
  { id: 'curious', emoji: '🤔', label: '궁금해요' },
];

/** 문제 종류 (활동 2) */
export const PROBLEMS: Choice[] = [
  { id: 'danger', emoji: '⚠️', label: '위험해요' },
  { id: 'dirty', emoji: '🗑️', label: '더러워요' },
  { id: 'noisy', emoji: '🔊', label: '시끄러워요' },
  { id: 'dark', emoji: '🌑', label: '어두워요' },
  { id: 'hard', emoji: '♿', label: '다니기 힘들어요' },
  { id: 'lack', emoji: '❓', label: '필요한 것이 없어요' },
];

/** 개선 방법 (활동 2) */
export const FIXES: Choice[] = [
  { id: 'signal', emoji: '🚦', label: '신호등' },
  { id: 'crosswalk', emoji: '🚸', label: '횡단보도' },
  { id: 'light', emoji: '💡', label: '가로등' },
  { id: 'cctv', emoji: '📹', label: 'CCTV' },
  { id: 'bin', emoji: '♻️', label: '분리수거함' },
  { id: 'bench', emoji: '🪑', label: '쉼터·벤치' },
  { id: 'tree', emoji: '🌳', label: '나무·공원' },
  { id: 'playground', emoji: '🛝', label: '놀이터' },
  { id: 'ramp', emoji: '🛗', label: '경사로·엘리베이터' },
  { id: 'sidewalk', emoji: '🚶', label: '인도' },
  { id: 'library', emoji: '📚', label: '도서관' },
  { id: 'other', emoji: '✨', label: '기타' },
];

/** 우리 지역 알리기: 자랑거리 종류 */
export const PROMO_CATS: Choice[] = [
  { id: 'nature', emoji: '🏞️', label: '자연환경' },
  { id: 'heritage', emoji: '🏯', label: '역사·문화유산' },
  { id: 'festival', emoji: '🎉', label: '축제·행사' },
  { id: 'product', emoji: '🍎', label: '특산물·먹거리' },
  { id: 'spot', emoji: '📸', label: '가 볼 만한 곳' },
  { id: 'people', emoji: '🙌', label: '사람·이야기' },
];

/** 우리 지역 문화유산 지도: 문화유산 종류 */
export const HERITAGE_TYPES: Choice[] = [
  { id: 'building', emoji: '🏯', label: '옛 건물·유적' },
  { id: 'stone', emoji: '🗿', label: '비석·탑·기념물' },
  { id: 'record', emoji: '📜', label: '기록·유물' },
  { id: 'intangible', emoji: '🎶', label: '노래·놀이·기술 (무형 유산)' },
  { id: 'nature', emoji: '🌳', label: '오래된 나무·자연유산' },
  { id: 'story', emoji: '📖', label: '인물·전해 오는 이야기' },
];

/** 지도 기호 만들기: 장소 종류 */
export const PLACE_TYPES: Choice[] = [
  { id: 'hospital', emoji: '🏥', label: '병원' },
  { id: 'library', emoji: '📚', label: '도서관' },
  { id: 'park', emoji: '🌳', label: '공원' },
  { id: 'store', emoji: '🛒', label: '가게·시장' },
  { id: 'bus', emoji: '🚌', label: '버스 정류장' },
  { id: 'police', emoji: '👮', label: '경찰서·파출소' },
  { id: 'office', emoji: '🏛️', label: '주민센터·관공서' },
  { id: 'playground', emoji: '🛝', label: '놀이터' },
];

/** 지도 기호 만들기: 학생이 고르는 기호 (장소 종류의 그림과 일부러 다르게, 단순한 모양 위주) */
export const SYMBOLS: Choice[] = [
  { id: 'cross', emoji: '➕', label: '더하기' },
  { id: 'heart', emoji: '❤️', label: '하트' },
  { id: 'star', emoji: '⭐', label: '별' },
  { id: 'circle', emoji: '🔵', label: '파란 원' },
  { id: 'redcircle', emoji: '🔴', label: '빨간 원' },
  { id: 'square', emoji: '🟩', label: '초록 네모' },
  { id: 'triangle', emoji: '🔺', label: '세모' },
  { id: 'diamond', emoji: '🔶', label: '마름모' },
  { id: 'book', emoji: '📖', label: '책' },
  { id: 'tree', emoji: '🌲', label: '나무' },
  { id: 'cart', emoji: '🛍️', label: '쇼핑백' },
  { id: 'flag', emoji: '🚩', label: '깃발' },
  { id: 'house', emoji: '🏠', label: '집' },
  { id: 'bell', emoji: '🔔', label: '종' },
  { id: 'shield', emoji: '🛡️', label: '방패' },
  { id: 'smile', emoji: '🙂', label: '웃는 얼굴' },
];

/** 연표: 사건 그림 */
export const TIMELINE_ICONS: Choice[] = [
  { id: 'baby', emoji: '👶', label: '태어남' },
  { id: 'school', emoji: '🏫', label: '입학·학교' },
  { id: 'move', emoji: '🏠', label: '이사' },
  { id: 'family', emoji: '👨‍👩‍👧', label: '가족' },
  { id: 'trip', emoji: '🧳', label: '여행' },
  { id: 'friend', emoji: '🤝', label: '친구' },
  { id: 'award', emoji: '🏆', label: '자랑' },
  { id: 'pet', emoji: '🐶', label: '동물' },
  { id: 'sick', emoji: '🩹', label: '아팠던 일' },
  { id: 'star', emoji: '⭐', label: '기타' },
];

/** 문제 해결 방법 (활동 4) */
export const SOLUTIONS: Choice[] = [
  { id: 'facility', emoji: '🏗️', label: '시설 만들기·고치기' },
  { id: 'campaign', emoji: '📢', label: '캠페인·알리기' },
  { id: 'rule', emoji: '📜', label: '규칙·약속 만들기' },
  { id: 'petition', emoji: '🗳️', label: '의견 모아 건의하기' },
  { id: 'volunteer', emoji: '🧹', label: '봉사·함께 실천' },
  { id: 'patrol', emoji: '👮', label: '살피기·순찰' },
];

/** 문제 해결 4단계 */
export const SOLVE_STEPS = ['문제 찾기', '원인 생각하기', '방법 비교하기', '결론 내리기'] as const;

export type Direction = 'N' | 'E' | 'S' | 'W';

export interface MissionDef {
  id: string;
  emoji: string;
  title: string;
  guide: string;
  check: { type: 'dir'; dir: Direction } | { type: 'dist'; target: number; min: number; max: number };
}

/** 방위와 거리 미션 (활동 3). 학교 위치를 기준으로 자동으로 확인합니다. */
export const MISSIONS: MissionDef[] = [
  { id: 'dir-n', emoji: '⬆️', title: '북쪽 탐험', guide: '학교의 북쪽에 있는 장소를 하나 찾아 표시하세요.', check: { type: 'dir', dir: 'N' } },
  { id: 'dir-e', emoji: '➡️', title: '동쪽 탐험', guide: '학교의 동쪽에 있는 장소를 하나 찾아 표시하세요.', check: { type: 'dir', dir: 'E' } },
  { id: 'dir-s', emoji: '⬇️', title: '남쪽 탐험', guide: '학교의 남쪽에 있는 장소를 하나 찾아 표시하세요.', check: { type: 'dir', dir: 'S' } },
  { id: 'dir-w', emoji: '⬅️', title: '서쪽 탐험', guide: '학교의 서쪽에 있는 장소를 하나 찾아 표시하세요.', check: { type: 'dir', dir: 'W' } },
  {
    id: 'dist-300',
    emoji: '📏',
    title: '300m 찾기',
    guide: '축척 막대를 이용해 학교에서 약 300m 떨어진 장소를 찾아 표시하세요.',
    check: { type: 'dist', target: 300, min: 200, max: 400 },
  },
  {
    id: 'dist-600',
    emoji: '📐',
    title: '600m 찾기',
    guide: '축척 막대를 이용해 학교에서 약 600m 떨어진 장소를 찾아 표시하세요.',
    check: { type: 'dist', target: 600, min: 450, max: 750 },
  },
];

export function findMission(id?: string): MissionDef | undefined {
  return MISSIONS.find((m) => m.id === id);
}

export function findChoice(list: Choice[], id?: string): Choice | undefined {
  return list.find((c) => c.id === id);
}
