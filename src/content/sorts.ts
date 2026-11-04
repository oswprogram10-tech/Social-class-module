/**
 * 분류하기 활동: 카드를 알맞은 무리로 나누고, 앱이 바로 확인합니다(틀리면 답 대신 힌트).
 *
 * 저장 형식(labels): 모든 카드의 고른 무리 ID를 차례로 이은 문자열. 아직 안 고른 카드는 '-'.
 * 무리 ID는 반드시 한 글자여야 합니다.
 *
 * 같은 엔진으로 "읽고 판단하기"도 만듭니다.
 *  - 무리(section)에 story(이야기·자료)를 두면 카드 위에 읽을거리가 나옵니다.
 *  - 카드에 choices를 두면 그 카드만의 보기가 나옵니다(무리 공통 categories 대신).
 *  - answer에 여러 글자를 쓰면 그중 하나를 골라도 맞습니다(예: 'AB').
 */
import type { ActivityId } from '../activities';
import type { Photo } from './photos';
import { MORE_SORT_SETS } from './sortsMore';

export interface SortCategory {
  /** 한 글자 */
  id: string;
  emoji: string;
  label: string;
  /** 무리 이름 아래 작은 설명 */
  note?: string;
}

export interface SortCard {
  text: string;
  emoji?: string;
  /** 맞는 무리 ID. 여러 글자면 그중 하나를 골라도 맞아요. */
  answer: string;
  /** 이 카드만의 보기 (없으면 무리 공통 보기) */
  choices?: SortCategory[];
  /** 틀렸을 때 생각을 돕는 질문 */
  hint: string;
  /** 유물 사진 (위키미디어 공용, 자유 라이선스) */
  photo?: Photo;
}

export interface SortSection {
  title: string;
  prompt: string;
  /** 공통 보기. 카드마다 보기가 다르면 빈 배열로 둡니다. */
  categories: SortCategory[];
  cards: SortCard[];
  /** 카드 위에 보여 줄 읽을거리(이야기, 옛 자료) */
  story?: SortStory;
}

export interface SortStory {
  /** 예: '가상 이야기', '가상 일기 · 1895년 겨울' */
  label: string;
  paragraphs: string[];
  photo?: Photo;
  emoji?: string;
  /** 공식 통계 막대그래프 */
  chart?: StoryChart;
}

export interface StoryChart {
  title: string;
  /** 값 뒤에 붙는 단위 (예: '만 명', '%') */
  unit: string;
  points: { label: string; value: number }[];
  /** 출처 (기관, 자료 이름, 발표 연도) */
  source: string;
  note?: string;
}

export interface SortSet {
  placeName: string;
  sections: SortSection[];
  /** 다 맞힌 뒤 생각 쓰기 질문 */
  open: string;
}

export const SORT_SETS: Partial<Record<ActivityId, SortSet>> = {
  // ---------- 3-2 (3) 사회 변화와 다양한 문화 [4사03-01·02] ----------
  change: {
    placeName: '사회 변화와 다양한 문화',
    sections: [
      {
        title: '어떤 사회 변화와 관련 있을까요?',
        prompt: '생활 모습을 읽고, 어떤 사회 변화 때문에 생긴 모습인지 골라요.',
        categories: [
          { id: 'L', emoji: '👶👵', label: '저출산·고령화', note: '아이는 적게 태어나고 노인은 많아져요' },
          { id: 'I', emoji: '💻', label: '정보화', note: '컴퓨터·인터넷이 생활 곳곳에 쓰여요' },
          { id: 'G', emoji: '🌏', label: '세계화', note: '세계 여러 나라와 활발히 오가요' },
        ],
        cards: [
          { emoji: '🏫', text: '학생 수가 줄어 반이 줄어든 학교가 늘었어요.', answer: 'L', hint: '학생 수가 줄어든 까닭은 무엇일까요? 태어나는 아이 수를 떠올려 보세요.' },
          { emoji: '🏥', text: '노인 복지관과 요양 시설이 늘고 있어요.', answer: 'L', hint: '노인을 위한 시설이 늘어나는 까닭은 무엇일까요?' },
          { emoji: '📱', text: '은행에 가지 않고 휴대폰으로 돈을 보내요.', answer: 'I', hint: '휴대폰과 인터넷이 생활을 어떻게 바꾸었나요?' },
          { emoji: '🖥️', text: '음식점에서 무인 주문기(키오스크)로 주문해요.', answer: 'I', hint: '사람 대신 기계와 프로그램이 일하는 모습이에요.' },
          { emoji: '🎤', text: '우리나라 노래와 드라마를 세계 여러 나라 사람들이 즐겨요.', answer: 'G', hint: '우리 문화가 다른 나라로 퍼져 나가는 모습이에요.' },
          { emoji: '🍜', text: '여러 나라의 음식점을 우리 동네에서 쉽게 찾을 수 있어요.', answer: 'G', hint: '다른 나라의 문화가 우리 곁으로 들어온 모습이에요.' },
          { emoji: '👩‍💻', text: '집에서 화상으로 수업을 듣거나 회의를 해요.', answer: 'I', hint: '멀리 떨어져 있어도 함께할 수 있게 해 주는 것은 무엇일까요?' },
          { emoji: '✈️', text: '다른 나라에서 일하러 온 사람들이 우리 동네에 함께 살아요.', answer: 'G', hint: '나라와 나라 사이를 사람들이 많이 오가는 모습이에요.' },
        ],
      },
      {
        title: '다른 문화를 대하는 태도',
        prompt: '다양한 문화를 존중하는 모습인지, 편견이나 차별인지 골라요.',
        categories: [
          { id: 'R', emoji: '🤝', label: '존중해요' },
          { id: 'B', emoji: '🚫', label: '편견·차별이에요' },
        ],
        cards: [
          { emoji: '🎎', text: '친구 엄마 나라의 명절 이야기를 궁금해하며 들어요.', answer: 'R', hint: '친구의 문화에 관심을 갖는 것은 어떤 태도일까요?' },
          { emoji: '🙅', text: '생김새가 다르다고 놀이에 끼워 주지 않아요.', answer: 'B', hint: '생김새로 친구를 다르게 대하면 친구 마음은 어떨까요?' },
          { emoji: '🍱', text: '종교 때문에 못 먹는 음식이 있는 친구를 배려해요.', answer: 'R', hint: '친구의 생활 방식을 이해하고 돕는 모습이에요.' },
          { emoji: '🗣️', text: '한국어 말투가 다르다고 흉내 내며 놀려요.', answer: 'B', hint: '놀림을 받는 친구의 마음을 생각해 보세요.' },
        ],
      },
    ],
    open: '우리 반이 다양한 문화를 존중하려면 어떤 약속을 하면 좋을까요?',
  },

  // ---------- 3-2 (4) 옛날과 오늘날의 생활 모습 [4사04-01·02] ----------
  oldnew: {
    placeName: '옛날과 오늘날의 생활 모습',
    sections: [
      {
        title: '세시 풍속은 언제 할까요?',
        prompt: '해마다 같은 때에 되풀이해 온 풍속(세시 풍속)이에요. 어느 날 하는 풍속인지 골라요.',
        categories: [
          { id: 'S', emoji: '🧧', label: '설날', note: '음력 1월 1일' },
          { id: 'D', emoji: '🌕', label: '정월 대보름', note: '음력 1월 15일' },
          { id: 'O', emoji: '🌿', label: '단오', note: '음력 5월 5일' },
          { id: 'C', emoji: '🌾', label: '추석', note: '음력 8월 15일' },
          { id: 'J', emoji: '❄️', label: '동지', note: '밤이 가장 긴 날(12월 22일 무렵)' },
        ],
        cards: [
          { emoji: '🥣', text: '떡국을 먹고 웃어른께 세배를 드려요.', answer: 'S', hint: '새해 첫날에 하는 일을 떠올려 보세요.' },
          { emoji: '🥜', text: '호두·땅콩 같은 부럼을 깨물고 쥐불놀이를 해요.', answer: 'D', hint: '한 해의 첫 보름달이 뜨는 날이에요.' },
          { emoji: '💇', text: '창포물에 머리를 감고 그네뛰기·씨름을 해요.', answer: 'O', hint: '초여름, 더위가 시작될 무렵의 명절이에요.' },
          { emoji: '🥮', text: '햇곡식으로 송편을 빚고 강강술래를 해요.', answer: 'C', hint: '가을에 곡식을 거두어 감사하는 명절이에요.' },
          { emoji: '🍲', text: '팥죽을 쑤어 먹어요.', answer: 'J', hint: '1년 중 밤이 가장 긴 날에 먹는 음식이에요.' },
        ],
      },
      {
        title: '옛날 도구, 오늘날에는 무엇일까요?',
        prompt: '옛날에 쓰던 도구가 오늘날 어떤 도구로 바뀌었는지 짝을 지어요.',
        categories: [
          { id: 'W', emoji: '🫧', label: '세탁기' },
          { id: 'R', emoji: '🧊', label: '냉장고' },
          { id: 'B', emoji: '🍚', label: '전기밥솥' },
          { id: 'L', emoji: '💡', label: '전등' },
          { id: 'M', emoji: '🥤', label: '믹서기' },
        ],
        cards: [
          { emoji: '🪵', text: '빨래판과 빨랫방망이', answer: 'W', hint: '옷을 깨끗하게 하는 데 쓰던 도구예요.' },
          { emoji: '🏚️', text: '겨울 얼음을 넣어 두던 석빙고', answer: 'R', hint: '차갑게 보관하는 일을 하는 오늘날 도구는?' },
          { emoji: '🫕', text: '아궁이에 불을 때서 밥을 짓던 가마솥', answer: 'B', hint: '밥을 짓는 오늘날 도구는?' },
          { emoji: '🕯️', text: '기름을 넣어 불을 밝히던 호롱불', answer: 'L', hint: '어두운 방을 밝히는 오늘날 도구는?' },
          { emoji: '🪨', text: '곡식을 갈던 맷돌', answer: 'M', hint: '음식 재료를 잘게 가는 오늘날 도구는?' },
        ],
      },
    ],
    open: '옛날과 오늘날 생활 모습 중 계속 이어 가고 싶은 것은 무엇인가요? 까닭도 적어 보세요.',
  },

  // ---------- 4-2 (8) 민주주의와 자치 [4사08-01·02] ----------
  democracy: {
    placeName: '민주주의와 자치',
    sections: [
      {
        title: '민주적으로 결정했을까요?',
        prompt: '학교에서 일을 정하는 모습이에요. 민주적인 모습인지 골라요.',
        categories: [
          { id: 'Y', emoji: '🙆', label: '민주적이에요' },
          { id: 'N', emoji: '🙅', label: '민주적이지 않아요' },
        ],
        cards: [
          { emoji: '🙋', text: '학급 회의에서 모든 친구가 의견을 말할 기회를 가졌어요.', answer: 'Y', hint: '모두가 참여할 수 있었나요?' },
          { emoji: '💪', text: '힘이 센 친구 마음대로 놀이를 정했어요.', answer: 'N', hint: '다른 친구들의 생각은 반영되었나요?' },
          { emoji: '🗳️', text: '다수결로 정한 뒤, 적은 표를 받은 의견도 다음에 다시 이야기하기로 했어요.', answer: 'Y', hint: '다수결과 함께 소수의 의견도 존중했나요?' },
          { emoji: '📋', text: '회장이 혼자 학급 규칙을 정해서 알려 줬어요.', answer: 'N', hint: '규칙을 지킬 사람들이 함께 정했나요?' },
          { emoji: '🤝', text: '서로 조금씩 양보해서 두 의견을 섞은 방법을 찾았어요.', answer: 'Y', hint: '대화하고 타협하는 모습인가요?' },
          { emoji: '😏', text: '나와 의견이 다른 친구를 비웃었어요.', answer: 'N', hint: '다른 의견도 존중했나요?' },
        ],
      },
      {
        title: '주민이 지역 일에 참여하는 방법',
        prompt: '주민이 지역의 일에 참여하는 모습이에요. 어떤 방법인지 골라요.',
        categories: [
          { id: 'E', emoji: '🗳️', label: '지방 선거' },
          { id: 'P', emoji: '🗣️', label: '공청회·주민 회의' },
          { id: 'B', emoji: '💰', label: '주민 참여 예산' },
          { id: 'C', emoji: '📮', label: '누리집 제안·민원' },
        ],
        cards: [
          { emoji: '🏛️', text: '우리 지역의 시장(군수, 구청장)과 지방 의회 의원을 투표로 뽑아요.', answer: 'E', hint: '지역의 대표를 뽑는 방법이에요.' },
          { emoji: '🛣️', text: '새 도로를 만들기 전에 주민들이 모여 의견을 말해요.', answer: 'P', hint: '여러 사람이 한자리에 모여 의견을 듣고 말하는 방법이에요.' },
          { emoji: '🌳', text: '우리 동네 공원 고치는 데 돈을 어떻게 쓸지 주민이 제안하고 정해요.', answer: 'B', hint: '지역의 돈(예산)을 쓰는 일에 주민이 참여하는 방법이에요.' },
          { emoji: '💻', text: '시청 누리집에 불편한 점을 알리고 고쳐 달라고 해요.', answer: 'C', hint: '인터넷으로 의견을 전하는 방법이에요.' },
        ],
      },
    ],
    open: '우리 반이나 우리 지역에서 함께 정하고 싶은 일은 무엇인가요? 어떤 방법으로 정하면 좋을까요?',
  },

  // ---------- 4-2 (10) 다양한 환경과 삶의 모습 [4사10-01·02] ----------
  villages: {
    placeName: '다양한 환경과 삶의 모습',
    sections: [
      {
        title: '어느 곳의 모습일까요?',
        prompt: '자연환경과 사람들이 하는 일을 보고, 어느 곳의 모습인지 골라요.',
        categories: [
          { id: 'F', emoji: '🌾', label: '농촌', note: '들에서 농사를 지어요' },
          { id: 'S', emoji: '🐟', label: '어촌', note: '바다에서 일해요' },
          { id: 'M', emoji: '⛰️', label: '산지촌', note: '산에서 일해요' },
          { id: 'C', emoji: '🏙️', label: '도시', note: '사람과 건물이 많아요' },
        ],
        cards: [
          { emoji: '🌱', text: '넓은 들에서 벼농사를 짓고, 비닐하우스에서 채소를 길러요.', answer: 'F', hint: '넓고 평평한 들이 있는 곳은 어디일까요?' },
          { emoji: '🚤', text: '배를 타고 고기를 잡고, 김과 미역을 길러요.', answer: 'S', hint: '바다를 이용하는 곳이에요.' },
          { emoji: '🥬', text: '서늘한 산비탈에서 고랭지 배추를 기르고 버섯을 키워요.', answer: 'M', hint: '높고 서늘한 곳의 모습이에요.' },
          { emoji: '🚇', text: '높은 건물과 회사가 많고, 지하철이 다녀요.', answer: 'C', hint: '많은 사람이 모여 일하는 곳이에요.' },
          { emoji: '🦪', text: '썰물 때 드러난 갯벌에서 조개를 캐요.', answer: 'S', hint: '갯벌은 어디에 있을까요?' },
          { emoji: '🌲', text: '나무를 가꾸고 산나물을 캐요.', answer: 'M', hint: '나무와 산나물이 많은 곳은?' },
          { emoji: '🍎', text: '과수원과 논밭 사이에 집들이 띄엄띄엄 있어요.', answer: 'F', hint: '논밭과 과수원이 많은 곳은?' },
          { emoji: '🚦', text: '사람이 많이 살고, 출퇴근 시간에 길이 많이 막혀요.', answer: 'C', hint: '사람과 자동차가 많이 모이는 곳은?' },
        ],
      },
      {
        title: '환경을 이용하고 바꾼 모습',
        prompt: '사람들이 환경을 이용하거나 개발한 모습이에요. 좋아진 점인지, 생길 수 있는 문제인지 골라요.',
        categories: [
          { id: 'G', emoji: '👍', label: '좋아진 점' },
          { id: 'P', emoji: '⚠️', label: '생길 수 있는 문제' },
        ],
        cards: [
          { emoji: '🛤️', text: '산을 뚫어 터널을 만들어 이웃 마을까지 가는 시간이 줄었어요.', answer: 'G', hint: '사람들의 생활이 편리해졌나요?' },
          { emoji: '🏗️', text: '숲을 없애고 건물을 지어 동물이 살 곳을 잃었어요.', answer: 'P', hint: '자연과 동물에게는 어떤 일이 생겼나요?' },
          { emoji: '🎿', text: '눈이 많은 산에 스키장을 만들어 관광객이 늘었어요.', answer: 'G', hint: '지역 사람들에게 어떤 도움이 되었을까요?' },
          { emoji: '🌊', text: '갯벌을 메워 땅을 만들자 조개와 새가 줄었어요.', answer: 'P', hint: '갯벌에 살던 생물들은 어떻게 되었나요?' },
        ],
      },
    ],
    open: '우리 지역에 새로운 개발 계획이 생긴다면 찬성하나요, 반대하나요? 좋은 점과 걱정되는 점을 함께 적어 보세요.',
  },

  // ---------- 5-1 (3) 법과 인권의 보장 [6사03-01·02] ----------
  rights: {
    placeName: '법과 인권의 보장',
    sections: [
      {
        title: '헌법이 지켜 주는 기본권',
        prompt: '헌법에는 모든 국민이 누리는 기본적인 권리(기본권)가 적혀 있어요. 어떤 기본권인지 골라요.',
        categories: [
          { id: 'F', emoji: '🕊️', label: '자유권', note: '자유롭게 생각하고 행동할 권리' },
          { id: 'E', emoji: '⚖️', label: '평등권', note: '차별받지 않을 권리' },
          { id: 'P', emoji: '🗳️', label: '참정권', note: '나라 일에 참여할 권리' },
          { id: 'C', emoji: '📝', label: '청구권', note: '권리를 지켜 달라고 요구할 권리' },
          { id: 'S', emoji: '🏫', label: '사회권', note: '사람다운 생활을 보장받을 권리' },
        ],
        cards: [
          { emoji: '🙏', text: '내가 원하는 종교를 믿을 수 있어요.', answer: 'F', hint: '내 생각과 믿음을 스스로 정하는 권리예요.' },
          { emoji: '🧑‍🦽', text: '성별이나 장애 때문에 차별받지 않아요.', answer: 'E', hint: '누구나 똑같이 대우받을 권리예요.' },
          { emoji: '🗳️', text: '만 18세가 되면 선거에서 투표할 수 있어요.', answer: 'P', hint: '나라의 일을 정하는 데 참여하는 권리예요.' },
          { emoji: '🏛️', text: '억울한 일을 당했을 때 법원에 재판을 해 달라고 할 수 있어요.', answer: 'C', hint: '권리를 침해받았을 때 나라에 도와 달라고 요구하는 권리예요.' },
          { emoji: '📚', text: '모든 어린이가 교육을 받을 수 있어요.', answer: 'S', hint: '사람답게 살아가는 데 필요한 것을 나라가 보장해 주는 권리예요.' },
          { emoji: '🏠', text: '살 곳을 스스로 정해 이사할 수 있어요.', answer: 'F', hint: '어디서 살지 스스로 정하는 것은 어떤 권리일까요?' },
          { emoji: '👷', text: '일할 능력이 있는 사람은 일할 기회를 가질 수 있어요.', answer: 'S', hint: '사람다운 생활을 위해 나라가 보장해 주는 권리예요.' },
        ],
      },
      {
        title: '인권을 지키는 행동일까요?',
        prompt: '생활 속 모습이에요. 다른 사람의 인권을 존중하는 행동인지, 침해하는 행동인지 골라요.',
        categories: [
          { id: 'R', emoji: '💚', label: '인권을 존중해요' },
          { id: 'V', emoji: '💔', label: '인권을 침해해요' },
        ],
        cards: [
          { emoji: '📔', text: '친구의 일기장을 허락 없이 읽었어요.', answer: 'V', hint: '다른 사람이 알리고 싶지 않은 것도 지켜 줘야 할까요?' },
          { emoji: '♿', text: '휠체어를 탄 사람도 다닐 수 있게 건물 입구에 경사로를 만들었어요.', answer: 'R', hint: '누구나 편하게 다닐 수 있게 되었나요?' },
          { emoji: '📸', text: '친구 사진을 허락 없이 단체 대화방에 올렸어요.', answer: 'V', hint: '사진 속 친구에게 먼저 물어봤나요?' },
          { emoji: '🗨️', text: '모든 학생이 의견을 말할 수 있도록 회의 규칙을 만들었어요.', answer: 'R', hint: '모든 사람의 생각이 소중하게 다뤄지나요?' },
        ],
      },
    ],
    open: '우리 학교나 동네에서 인권이 더 잘 지켜지려면 무엇을 바꾸면 좋을까요?',
  },
};


/** 남은 성취기준을 채우는 분류하기 묶음 */
Object.assign(SORT_SETS, {
  // ---------- 3-1 (2) [4사02-02·03] 오래된 물건과 지역의 달라진 모습 ----------
  oldthings: {
    placeName: '오래된 물건과 지역의 변화',
    sections: [
      {
        title: '과거를 알려 주는 자료',
        prompt: '주변에서 찾은 오래된 자료예요. 어떤 종류의 자료인지 골라요.',
        categories: [
          { id: 'P', emoji: '🖼️', label: '사진' },
          { id: 'O', emoji: '📻', label: '물건' },
          { id: 'D', emoji: '📰', label: '글·기록' },
          { id: 'T', emoji: '👵', label: '들은 이야기' },
        ],
        cards: [
          { emoji: '🎓', text: '부모님이 초등학교를 졸업할 때 찍은 단체 사진', answer: 'P', hint: '그때의 모습을 찍어 남긴 자료예요.' },
          { emoji: '📻', text: '할아버지께서 쓰시던 오래된 라디오', answer: 'O', hint: '직접 손으로 쓰던 것이에요.' },
          { emoji: '📰', text: '30년 전 우리 동네 소식이 실린 신문 기사', answer: 'D', hint: '글자로 적어 남긴 자료예요.' },
          { emoji: '🗣️', text: '마을 어르신께서 들려주신, 옛날 우리 마을 모습 이야기', answer: 'T', hint: '어르신의 말씀을 듣고 알게 된 것이에요.' },
          { emoji: '📗', text: '엄마가 어릴 때 쓰던 교과서', answer: 'O', hint: '그 시절 학생이 직접 쓰던 것이에요.' },
          { emoji: '🗺️', text: '옛날 우리 지역을 그린 지도', answer: 'D', hint: '지역의 모습을 그려 기록한 자료예요.' },
        ],
      },
      {
        title: '우리 지역의 옛날과 오늘날',
        prompt: '지역의 모습이에요. 옛날 모습인지 오늘날 모습인지 골라요.',
        categories: [
          { id: 'O', emoji: '🕰️', label: '옛날 모습' },
          { id: 'N', emoji: '🏙️', label: '오늘날 모습' },
        ],
        cards: [
          { emoji: '🐂', text: '흙길로 소달구지가 짐을 실어 날라요.', answer: 'O', hint: '자동차가 많지 않던 때의 모습일까요?' },
          { emoji: '🚏', text: '버스 정류장 안내판에 버스가 언제 오는지 나와요.', answer: 'N', hint: '전자 안내판은 언제부터 생겼을까요?' },
          { emoji: '🪣', text: '마을 공동 우물에서 물을 길어 와요.', answer: 'O', hint: '집집마다 수도가 있기 전의 모습이에요.' },
          { emoji: '🏢', text: '논이 있던 자리에 아파트 단지와 큰 마트가 생겼어요.', answer: 'N', hint: '논이 바뀐 뒤의 모습이에요.' },
          { emoji: '🧺', text: '냇가에 모여 빨래를 해요.', answer: 'O', hint: '세탁기가 없던 때의 모습이에요.' },
        ],
      },
    ],
    open: '집이나 동네에서 찾은 오래된 물건이나 자료는 무엇인가요? 그것으로 옛날 모습을 어떻게 알 수 있나요?',
  },

  // ---------- 4-1 (7) [4사07-02] 생산과 소비, 지역 간 교류 ----------
  exchange: {
    placeName: '생산과 소비, 지역 간 교류',
    sections: [
      {
        title: '생산일까요, 소비일까요?',
        prompt: '사람들의 경제활동이에요. 필요한 것을 만들거나 제공하는 생산인지, 사서 쓰는 소비인지 골라요.',
        categories: [
          { id: 'P', emoji: '🏭', label: '생산', note: '물건을 만들거나 서비스를 제공해요' },
          { id: 'C', emoji: '🛒', label: '소비', note: '물건이나 서비스를 사서 써요' },
        ],
        cards: [
          { emoji: '🌾', text: '농부가 논에서 쌀을 길러요.', answer: 'P', hint: '필요한 것을 만들어 내는 일인가요?' },
          { emoji: '🍎', text: '가족이 마트에서 과일을 사요.', answer: 'C', hint: '돈을 내고 사서 쓰는 일인가요?' },
          { emoji: '🚗', text: '공장에서 자동차를 만들어요.', answer: 'P', hint: '물건을 만드는 일이에요.' },
          { emoji: '💇', text: '미용사가 손님의 머리를 잘라 줘요.', answer: 'P', hint: '미용사는 손님에게 서비스를 제공하는 일을 해요.' },
          { emoji: '🎬', text: '표를 사서 영화를 봐요.', answer: 'C', hint: '돈을 내고 서비스를 누리는 일이에요.' },
        ],
      },
      {
        title: '지역끼리 무엇이 오갈까요?',
        prompt: '지역과 지역 사이의 교류예요. 물건이 오가는지(물적 교류), 사람이 오가는지(인적 교류) 골라요.',
        categories: [
          { id: 'M', emoji: '📦', label: '물적 교류', note: '물건이 오가요' },
          { id: 'H', emoji: '🧑‍🤝‍🧑', label: '인적 교류', note: '사람이 오가요' },
        ],
        cards: [
          { emoji: '🥔', text: '강원도에서 기른 감자를 서울 마트에서 팔아요.', answer: 'M', hint: '오간 것은 사람인가요, 물건인가요?' },
          { emoji: '🚜', text: '도시 학생들이 농촌으로 체험 학습을 가요.', answer: 'H', hint: '누가 다른 지역으로 갔나요?' },
          { emoji: '🦑', text: '바닷가 마을에서 잡은 오징어를 내륙 시장에서 팔아요.', answer: 'M', hint: '바다에서 시장으로 옮겨진 것은 무엇인가요?' },
          { emoji: '🏥', text: '큰 병원에서 진료를 받으려고 다른 지역으로 가요.', answer: 'H', hint: '이동한 것은 사람인가요, 물건인가요?' },
          { emoji: '🎉', text: '자매결연을 맺은 두 마을이 축제에 서로 초대해요.', answer: 'H', hint: '두 마을 사이에 누가 오가나요?' },
        ],
      },
    ],
    open: '우리 집 물건이나 음식의 원산지를 찾아보세요. 어느 지역(나라)에서 왔나요? 지역끼리 서로 돕고 있다고 할 수 있을까요?',
  },

  // ---------- 6-1 (8) [6사08-02] 국회·행정부·법원과 권력 분립 ----------
  powers: {
    placeName: '국회·행정부·법원',
    sections: [
      {
        title: '어느 국가 기관이 하는 일일까요?',
        prompt: '나라의 일을 나누어 맡는 세 기관이에요. 어느 기관이 하는 일인지 골라요.',
        categories: [
          { id: 'L', emoji: '🏛️', label: '국회', note: '법을 만들어요' },
          { id: 'E', emoji: '🏢', label: '행정부', note: '법에 따라 나라 살림을 해요' },
          { id: 'J', emoji: '⚖️', label: '법원', note: '법에 따라 재판해요' },
        ],
        cards: [
          { emoji: '📜', text: '새로운 법을 만들거나 고쳐요.', answer: 'L', hint: '국민의 대표들이 모여 법을 정하는 곳은?' },
          { emoji: '💰', text: '정부가 낸 나라 살림 계획(예산안)을 살펴보고 확정해요.', answer: 'L', hint: '정부가 돈을 바르게 쓰는지 국민의 대표가 확인해요.' },
          { emoji: '👔', text: '대통령이 정부를 이끌며 나라 살림을 맡아요.', answer: 'E', hint: '법에 따라 실제로 나라 일을 하는 곳은?' },
          { emoji: '🚒', text: '교육·소방·도로처럼 국민 생활에 필요한 일을 해요.', answer: 'E', hint: '정책을 실제로 실천하는 곳은?' },
          { emoji: '🧑‍⚖️', text: '다툼이 생겼을 때 법에 따라 판결해요.', answer: 'J', hint: '재판을 하는 곳은?' },
          { emoji: '🔎', text: '국정 감사로 행정부가 일을 잘하는지 살펴요.', answer: 'L', hint: '정부를 감시하는 국민의 대표 기관은?' },
        ],
      },
      {
        title: '권력을 나누면 무엇이 좋을까요?',
        prompt: '세 기관이 서로 견제하고 균형을 이루는 모습인지, 권력이 한곳에 몰린 모습인지 골라요.',
        categories: [
          { id: 'B', emoji: '⚖️', label: '견제와 균형' },
          { id: 'X', emoji: '⚠️', label: '권력이 한곳에 몰렸어요' },
        ],
        cards: [
          { emoji: '✋', text: '대통령은 국회가 만든 법에 반대하면 다시 의논해 달라고 돌려보낼 수 있어요.', answer: 'B', hint: '한 기관의 결정을 다른 기관이 살펴볼 수 있나요?' },
          { emoji: '🤝', text: '대통령이 대법원장을 임명하려면 국회의 동의를 받아야 해요.', answer: 'B', hint: '두 기관이 함께 확인하는 모습인가요?' },
          { emoji: '👑', text: '한 사람이 법도 만들고, 나라 살림도 하고, 재판도 해요.', answer: 'X', hint: '잘못된 결정을 막아 줄 사람이 있을까요?' },
          { emoji: '📑', text: '행정부의 결정이 법에 맞지 않으면 법원에서 재판을 받을 수 있어요.', answer: 'B', hint: '법원이 행정부의 일을 살펴볼 수 있나요?' },
        ],
      },
    ],
    open: '국가 기관의 권력을 나누어 맡게 하는 까닭은 무엇일까요? 권력이 한곳에 몰리면 국민에게 어떤 일이 생길 수 있을까요?',
  },

  // ---------- 6-2 (11) [6사11-01] 가계와 기업, 근로자의 권리 ----------
  economy: {
    placeName: '가계와 기업, 근로자의 권리',
    sections: [
      {
        title: '가계일까요, 기업일까요?',
        prompt: '시장경제에서 가계와 기업이 하는 일이에요. 누가 하는 일인지 골라요.',
        categories: [
          { id: 'H', emoji: '🏠', label: '가계', note: '소비하고, 일하고 소득을 얻어요' },
          { id: 'F', emoji: '🏭', label: '기업', note: '생산하고, 이윤을 얻으려 해요' },
        ],
        cards: [
          { emoji: '👷', text: '회사에서 일하고 그 대가로 월급(소득)을 받아요.', answer: 'H', hint: '가족 구성원이 일해서 돈을 버는 모습이에요.' },
          { emoji: '🛍️', text: '필요한 물건을 사서 생활해요.', answer: 'H', hint: '물건을 사서 쓰는 쪽은?' },
          { emoji: '📦', text: '물건이나 서비스를 만들어 팔아요.', answer: 'F', hint: '생산을 맡는 쪽은?' },
          { emoji: '🤝', text: '일할 사람을 뽑고 임금을 줘요.', answer: 'F', hint: '사람을 고용하는 쪽은?' },
          { emoji: '📈', text: '더 많은 이윤을 얻으려고 새 상품을 개발해요.', answer: 'F', hint: '이윤을 얻으려고 노력하는 쪽은?' },
        ],
      },
      {
        title: '근로자의 권리가 지켜졌을까요?',
        prompt: '일터의 모습이에요. 법이 보장하는 근로자의 권리가 지켜졌는지 골라요.',
        categories: [
          { id: 'Y', emoji: '✅', label: '지켜졌어요' },
          { id: 'N', emoji: '❌', label: '지켜지지 않았어요' },
        ],
        cards: [
          { emoji: '☕', text: '일하는 중간에 정해진 휴게 시간을 주었어요.', answer: 'Y', hint: '근로자는 일하는 중간에 쉴 권리가 있어요.' },
          { emoji: '💸', text: '최저 임금보다 적은 돈을 임금으로 주었어요.', answer: 'N', hint: '나라에서 정한 가장 낮은 임금보다 적게 주어도 될까요?' },
          { emoji: '⛑️', text: '위험한 일을 할 때 안전모와 안전 장비를 주었어요.', answer: 'Y', hint: '안전하게 일할 권리가 지켜졌나요?' },
          { emoji: '📄', text: '일을 시작하면서 근로 계약서를 쓰지 않았어요.', answer: 'N', hint: '임금과 일하는 시간 같은 조건은 글로 적어 주어야 해요.' },
          { emoji: '🧑‍🤝‍🧑', text: '근로자들이 노동조합을 만들어 근로 조건을 함께 의논했어요.', answer: 'Y', hint: '근로자는 모여서 단체를 만들 권리가 있어요.' },
        ],
      },
      {
        title: '기업의 사회적 책임',
        prompt: '기업의 모습이에요. 사회에 대한 책임을 다하는 모습인지 골라요.',
        categories: [
          { id: 'G', emoji: '🌱', label: '책임을 다해요' },
          { id: 'B', emoji: '🚫', label: '책임을 다하지 않아요' },
        ],
        cards: [
          { emoji: '♻️', text: '오염 물질을 줄이는 시설을 갖추고 친환경 제품을 만들어요.', answer: 'G', hint: '환경을 지키는 노력인가요?' },
          { emoji: '🙈', text: '제품에 문제가 있다는 것을 알면서도 숨겨요.', answer: 'B', hint: '소비자에게 정직한 모습인가요?' },
          { emoji: '🎓', text: '지역 학생들을 위해 장학금을 내놓아요.', answer: 'G', hint: '지역 사회와 함께하는 모습인가요?' },
          { emoji: '📢', text: '제품의 효과를 실제보다 부풀려 광고해요.', answer: 'B', hint: '소비자가 속을 수 있지 않을까요?' },
        ],
      },
    ],
    open: '내가 기업을 세운다면 이윤과 함께 무엇을 꼭 지키고 싶나요? 근로자와 소비자, 환경을 생각해 적어 보세요.',
  },

  // ---------- 6-2 (11) [6사11-02] 경제성장과 그 문제 ----------
  growth: {
    placeName: '경제성장과 생활의 변화',
    sections: [
      {
        title: '경제성장으로 달라진 생활',
        prompt: '우리나라가 빠르게 경제성장을 하면서 생긴 변화예요. 좋아진 점인지, 생긴 문제인지 골라요.',
        categories: [
          { id: 'G', emoji: '👍', label: '좋아진 점' },
          { id: 'P', emoji: '⚠️', label: '생긴 문제' },
        ],
        cards: [
          { emoji: '🚗', text: '자동차와 가전제품을 쓰는 집이 많아졌어요.', answer: 'G', hint: '생활이 편리해졌나요?' },
          { emoji: '🏭', text: '공장 매연과 폐수로 공기와 물이 더러워졌어요.', answer: 'P', hint: '환경은 어떻게 되었나요?' },
          { emoji: '🏙️', text: '도시로 사람이 몰려 집이 부족하고 교통이 복잡해졌어요.', answer: 'P', hint: '사람이 한곳에 몰리면 어떤 어려움이 생길까요?' },
          { emoji: '🚄', text: '고속도로와 고속 철도가 생겨 먼 곳도 빨리 갈 수 있어요.', answer: 'G', hint: '이동이 어떻게 달라졌나요?' },
          { emoji: '⚖️', text: '돈을 많이 버는 사람과 적게 버는 사람의 차이가 커졌어요.', answer: 'P', hint: '모든 사람이 똑같이 넉넉해졌을까요?' },
        ],
      },
      {
        title: '문제와 해결 방안 짝짓기',
        prompt: '해결 방안을 읽고, 어떤 문제를 해결하려는 노력인지 골라요.',
        categories: [
          { id: 'E', emoji: '🌫️', label: '환경 오염' },
          { id: 'I', emoji: '⚖️', label: '빈부 격차' },
          { id: 'L', emoji: '🤝', label: '노사 갈등' },
          { id: 'C', emoji: '🏙️', label: '수도권·도시 과밀' },
        ],
        cards: [
          { emoji: '☀️', text: '태양광 같은 친환경 에너지를 쓰고, 오염 물질을 내보내는 양을 법으로 제한해요.', answer: 'E', hint: '공기와 물을 깨끗하게 하려는 노력이에요.' },
          { emoji: '🧺', text: '어려운 이웃을 돕는 복지 제도를 늘려요.', answer: 'I', hint: '형편이 어려운 사람을 돕는 노력이에요.' },
          { emoji: '🗣️', text: '회사와 노동조합이 대화와 협상으로 임금과 근로 조건을 정해요.', answer: 'L', hint: '기업과 근로자 사이의 다툼을 줄이는 노력이에요.' },
          { emoji: '🏛️', text: '공공 기관을 여러 지방으로 옮겨 지역을 고르게 발전시켜요.', answer: 'C', hint: '사람이 한곳에 몰리는 것을 줄이는 노력이에요.' },
        ],
      },
    ],
    open: '경제성장으로 생긴 문제 중 가장 먼저 해결해야 할 것은 무엇이라고 생각하나요? 까닭과 내가 할 수 있는 일도 적어 보세요.',
  },
} satisfies Partial<Record<ActivityId, SortSet>>);


/** 5학년 2학기 한국사: 유적·유물과 자료로 옛 사람들의 생활 추론하기 */
Object.assign(SORT_SETS, {
  // ---------- 5-2 (4) [6사04-01·02·03] 유적과 유물로 살펴본 옛 사람들의 생활 ----------
  prehistory: {
    placeName: '유물로 옛 생활 추론하기',
    sections: [
      {
        title: '어느 시대의 모습일까요?',
        prompt: '유물과 생활 모습을 보고 어느 시대인지 골라요.',
        categories: [
          { id: 'P', emoji: '🪨', label: '구석기 시대', note: '뗀석기, 사냥과 채집, 옮겨 다니며 살기' },
          { id: 'N', emoji: '🏺', label: '신석기 시대', note: '간석기와 토기, 농사 시작, 움집' },
          { id: 'B', emoji: '🗡️', label: '청동기 시대', note: '청동기, 지배자 등장, 고조선' },
        ],
        cards: [
          { emoji: '🪓', text: '돌을 깨뜨려 만든 주먹도끼로 사냥한 동물을 손질했어요.', answer: 'P', hint: '돌을 갈지 않고 깨뜨려 만든 도구(뗀석기)를 쓰던 때예요.', photo: { file: '250207 전곡선사박물관 28.jpg', author: 'Aspere', license: 'CC0', page: 'https://commons.wikimedia.org/wiki/File:250207_전곡선사박물관_28.jpg' } },
          { emoji: '⛺', text: '먹을거리를 찾아 옮겨 다니며 동굴이나 막집에서 살았어요.', answer: 'P', hint: '아직 농사를 짓지 않던 때예요.' },
          { emoji: '🏺', text: '빗살무늬 토기에 곡식을 담아 두었어요.', answer: 'N', hint: '토기를 처음 만들어 쓰기 시작한 때예요.', photo: { file: '빗살무늬토기.jpg', author: '국립중앙박물관', license: 'KOGL Type 1', page: 'https://commons.wikimedia.org/wiki/File:빗살무늬토기.jpg' } },
          { emoji: '🛖', text: '강가나 바닷가에 움집을 짓고 한곳에 머물러 살았어요.', answer: 'N', hint: '농사를 짓기 시작하면서 한곳에 정착했어요.' },
          { emoji: '🗿', text: '커다란 돌로 지배자의 무덤인 고인돌을 만들었어요.', answer: 'B', hint: '지배자가 나타난 때예요.' },
          { emoji: '🗡️', text: '고조선 사람들이 비파 모양의 청동 칼(비파형 동검)을 만들었어요.', answer: 'B', hint: '청동으로 무기를 만들던 때예요.', photo: { file: 'Liaoning-type bronze dagger.National Museum of Korea.jpg', author: 'Gary Lee Todd', license: 'CC BY-SA 4.0', page: 'https://commons.wikimedia.org/wiki/File:Liaoning-type_bronze_dagger.National_Museum_of_Korea.jpg' } },
        ],
      },
      {
        title: '이 유물로 무엇을 알 수 있을까요?',
        prompt: '유적과 유물을 보고, 그때 사람들의 생활이나 생각을 추론해요.',
        categories: [
          { id: 'F', emoji: '🌾', label: '농사를 지었어요' },
          { id: 'R', emoji: '👑', label: '힘센 지배자가 있었어요' },
          { id: 'U', emoji: '🙏', label: '불교를 믿었어요' },
          { id: 'X', emoji: '🌏', label: '다른 나라와 교류했어요' },
          { id: 'T', emoji: '🛠️', label: '뛰어난 기술이 있었어요' },
        ],
        cards: [
          { emoji: '🌙', text: '반달 모양 돌칼(반달 돌칼) — 곡식의 이삭을 따는 데 썼어요.', answer: 'F', hint: '이삭을 딴다는 것은 무엇을 길렀다는 뜻일까요?', photo: { file: '부여 송국리 유적 출토 반달돌칼.jpg', author: '국립중앙박물관', license: 'KOGL Type 1', page: 'https://commons.wikimedia.org/wiki/File:부여_송국리_유적_출토_반달돌칼.jpg' } },
          { emoji: '🗿', text: '고인돌 — 무게가 수십 톤이나 되는 돌을 옮겨 만든 무덤이에요.', answer: 'R', hint: '그 큰 돌을 옮기려면 많은 사람을 부릴 수 있는 누가 있어야 했을까요?', photo: { file: 'Ganghwa Bugeun-ri dolmen.jpg', author: 'ChongDae', license: 'CC BY-SA 3.0', page: 'https://commons.wikimedia.org/wiki/File:Ganghwa_Bugeun-ri_dolmen.jpg' } },
          { emoji: '👑', text: '신라 무덤에서 나온 화려한 금관', answer: 'R', hint: '금관을 쓴 사람은 어떤 사람이었을까요?', photo: { file: '천마총 금관.jpg', author: '국립중앙박물관', license: 'KOGL Type 1', page: 'https://commons.wikimedia.org/wiki/File:천마총_금관.jpg' } },
          { emoji: '🛕', text: '통일 신라 때 만든 불국사와 석굴암', answer: 'U', hint: '절과 부처님 조각을 정성껏 만든 까닭은?', photo: { file: 'Front view of Buddha at Seokguram.jpg', author: '문화재청', license: 'KOGL Type 1', page: 'https://commons.wikimedia.org/wiki/File:Front_view_of_Buddha_at_Seokguram.jpg' } },
          { emoji: '📚', text: '고려 사람들이 몽골의 침입을 부처님의 힘으로 이겨 내려고 만든 팔만대장경', answer: 'U', hint: '부처님의 가르침을 새긴 경판이에요.', photo: { file: 'Tripitaka Koreana.jpg', author: 'Arian Zwegers (편집: MrPanyGoff)', license: 'CC BY 2.0', page: 'https://commons.wikimedia.org/wiki/File:Tripitaka_Koreana.jpg' } },
          { emoji: '🍶', text: '신라 무덤에서 나온 서아시아 지역의 유리그릇', answer: 'X', hint: '먼 곳의 물건이 어떻게 신라까지 왔을까요?', photo: { file: '경주 98호 남분 유리병 및 잔.jpg', author: '국립중앙박물관', license: 'KOGL Type 1', page: 'https://commons.wikimedia.org/wiki/File:경주_98호_남분_유리병_및_잔.jpg' } },
          { emoji: '⛵', text: '고려의 국제 무역항 벽란도 — 아라비아 상인까지 드나들었어요.', answer: 'X', hint: '여러 나라 상인이 오간 항구예요.' },
          { emoji: '🖨️', text: '1377년 고려에서 금속 활자로 찍은 책 『직지』 — 지금 남아 있는 가장 오래된 금속 활자본이에요.', answer: 'T', hint: '금속으로 글자를 만들어 찍는 것은 어떤 능력을 보여 줄까요?', photo: { file: 'Jikji pages.jpg', author: '작자 미상 (프랑스 국립도서관 디지털화)', license: 'Public domain', page: 'https://commons.wikimedia.org/wiki/File:Jikji_pages.jpg' } },
          { emoji: '🏺', text: '무늬를 새기고 다른 색 흙을 채워 넣어 만든 고려 상감 청자', answer: 'T', hint: '고려 도공들의 솜씨를 보여 줘요.', photo: { file: '청자 상감 구름 학 무늬 매병 고려-靑磁象嵌雲鶴文梅甁 高麗-Maebyeong decorated with cranes and clouds MET DT4857.jpg', author: '메트로폴리탄 미술관', license: 'CC0', page: 'https://commons.wikimedia.org/wiki/File:청자_상감_구름_학_무늬_매병_고려-靑磁象嵌雲鶴文梅甁_高麗-Maebyeong_decorated_with_cranes_and_clouds_MET_DT4857.jpg' } },
        ],
      },
    ],
    open: '유물 하나를 골라, 그 유물을 쓰던 사람의 하루를 상상해 적어 보세요. 유물에서 어떤 근거를 찾았나요?',
  },

  // ---------- 5-2 (5) [6사05-01·02] 조선의 유교 문화와 달라지는 생활 ----------
  joseon: {
    placeName: '조선의 유교 문화와 생활 변화',
    sections: [
      {
        title: '조선 사람들의 생각과 생활',
        prompt: '조선 시대의 모습이에요. 어떤 생각이나 제도와 관련 있는지 골라요.',
        categories: [
          { id: 'H', emoji: '🙇', label: '효와 예절(유교)', note: '부모와 조상을 섬기고 예절을 지켜요' },
          { id: 'L', emoji: '📖', label: '유교 공부와 관리 선발' },
          { id: 'C', emoji: '🪜', label: '신분 제도' },
          { id: 'P', emoji: '🌧️', label: '백성을 위한 정치' },
        ],
        cards: [
          { emoji: '🕯️', text: '조상을 기리며 제사를 지내고 족보를 만들었어요.', answer: 'H', hint: '조상을 섬기는 것은 유교의 어떤 가르침일까요?' },
          { emoji: '📕', text: '효와 충을 그림으로 쉽게 알려 주는 『삼강행실도』를 펴냈어요.', answer: 'H', hint: '백성에게 무엇을 가르치려던 책일까요?', photo: { file: '삼강행실도.jpg', author: '문화재청', license: 'KOGL Type 1', page: 'https://commons.wikimedia.org/wiki/File:삼강행실도.jpg' } },
          { emoji: '🏫', text: '서원과 향교에서 유교 경전을 공부했어요.', answer: 'L', hint: '무엇을 공부하는 곳이었나요?', photo: { file: 'Korea-Andong-Dosan Seowon-02.jpg', author: 'Julie (Flickr)', license: 'CC BY-SA 2.0', page: 'https://commons.wikimedia.org/wiki/File:Korea-Andong-Dosan_Seowon-02.jpg' } },
          { emoji: '📝', text: '과거 시험을 보아 나라의 관리를 뽑았어요.', answer: 'L', hint: '관리가 되려면 무엇을 해야 했나요?' },
          { emoji: '👘', text: '양반, 중인, 상민, 천민으로 신분이 나뉘었어요.', answer: 'C', hint: '사람들을 나누던 제도예요.' },
          { emoji: '🧺', text: '신분에 따라 입는 옷과 할 수 있는 일이 달랐어요.', answer: 'C', hint: '무엇에 따라 생활이 달랐나요?' },
          { emoji: '🔤', text: '세종이 백성이 쉽게 익혀 쓰도록 훈민정음을 만들었어요.', answer: 'P', hint: '누구를 위해 만든 글자일까요?', photo: { file: 'Hunminjeongeum Haerye 03.jpg', author: '조선 (간송본 『훈민정음』 해례본 영인)', license: 'Public domain', page: 'https://commons.wikimedia.org/wiki/File:Hunminjeongeum_Haerye_03.jpg' } },
          { emoji: '🌧️', text: '비의 양을 재는 측우기를 만들어 농사에 도움을 주었어요.', answer: 'P', hint: '농사짓는 백성에게 어떤 도움이 되었을까요?', photo: { file: '공주 충청감영 측우기.jpg', author: '문화재청', license: 'KOGL Type 1', page: 'https://commons.wikimedia.org/wiki/File:공주_충청감영_측우기.jpg' } },
        ],
      },
      {
        title: '조선 후기와 개항기, 달라진 생활',
        prompt: '달라진 생활 모습이에요. 조선 후기의 변화인지, 개항 뒤 들어온 근대 문물인지 골라요.',
        categories: [
          { id: 'L', emoji: '🎭', label: '조선 후기의 변화', note: '서민 문화와 상업, 실학' },
          { id: 'M', emoji: '🚂', label: '개항기 근대 문물', note: '다른 나라와 문을 열고 들어온 것' },
        ],
        cards: [
          { emoji: '🥁', text: '서민들이 판소리와 탈놀이를 즐겼어요.', answer: 'L', hint: '서민들이 즐긴 문화가 꽃핀 때는?' },
          { emoji: '🖼️', text: '김홍도와 신윤복이 사람들의 생활 모습을 풍속화로 그렸어요.', answer: 'L', hint: '서민의 일상을 그림에 담던 때예요.', photo: { file: 'Danwon Ssireum.jpg', author: '김홍도 (1745~1806?)', license: 'Public domain', page: 'https://commons.wikimedia.org/wiki/File:Danwon_Ssireum.jpg' } },
          { emoji: '🏪', text: '곳곳에 시장(장시)이 늘고 상인들이 활발하게 물건을 팔았어요.', answer: 'L', hint: '상업이 발달하던 때예요.' },
          { emoji: '🏗️', text: '정약용 같은 실학자들이 백성의 생활에 도움이 되는 학문을 연구했어요.', answer: 'L', hint: '실제 생활에 쓸모 있는 학문을 연구한 때예요.' },
          { emoji: '🚂', text: '서울과 인천 사이에 경인선 철도가 놓여 기차가 다녔어요.', answer: 'M', hint: '기차는 다른 나라에서 들어온 새로운 문물이에요.' },
          { emoji: '💡', text: '전등이 켜지고 서울 거리에 전차가 다녔어요.', answer: 'M', hint: '전기를 쓰는 문물은 언제 들어왔을까요?' },
          { emoji: '🏫', text: '배재 학당, 이화 학당 같은 근대 학교가 세워졌어요.', answer: 'M', hint: '새로운 방식의 학교는 언제 생겼을까요?' },
        ],
      },
    ],
    open: '조선 시대 사람들의 생활 중 오늘날까지 이어져 오는 것은 무엇인가요? 달라진 것도 함께 적어 보세요.',
  },

  // ---------- 5-2 (6) [6사06-01·02] 식민 통치와 저항, 광복과 6·25 전쟁 ----------
  colonial: {
    placeName: '식민 통치와 저항, 광복과 전쟁',
    sections: [
      {
        title: '식민 통치와 그에 맞선 노력',
        prompt: '일제 강점기의 모습이에요. 일제의 수탈·탄압인지, 이에 맞선 저항인지 골라요.',
        categories: [
          { id: 'O', emoji: '⛓️', label: '일제의 수탈·탄압' },
          { id: 'R', emoji: '✊', label: '우리 민족의 저항' },
        ],
        cards: [
          { emoji: '📐', text: '토지 조사 사업으로 많은 농민이 땅을 빼앗겼어요.', answer: 'O', hint: '땅을 잃은 농민들의 생활은 어떻게 되었을까요?' },
          { emoji: '🍚', text: '많은 쌀을 일본으로 가져가 우리 농민은 먹을 것이 부족했어요.', answer: 'O', hint: '쌀이 어디로 갔나요?' },
          { emoji: '🚫', text: '학교에서 우리말 대신 일본어를 쓰게 하고, 이름을 일본식으로 바꾸게 했어요.', answer: 'O', hint: '우리말과 이름을 빼앗으려 한 까닭은 무엇일까요?' },
          { emoji: '🇰🇷', text: '1919년 전국 곳곳에서 태극기를 들고 “대한 독립 만세”를 외쳤어요.', answer: 'R', hint: '3·1 운동은 무엇을 바라는 외침이었나요?', photo: { file: 'The Proclamation of Korean Independence.jpg', author: '민족 대표 33인', license: 'Public domain', page: 'https://commons.wikimedia.org/wiki/File:The_Proclamation_of_Korean_Independence.jpg' } },
          { emoji: '🏛️', text: '중국 상하이에 대한민국 임시 정부를 세웠어요.', answer: 'R', hint: '독립운동을 이끌기 위해 세운 것이에요.' },
          { emoji: '⚔️', text: '독립군이 봉오동과 청산리에서 일본군과 싸워 크게 이겼어요.', answer: 'R', hint: '무장을 하고 맞서 싸운 모습이에요.' },
          { emoji: '📖', text: '조선어 학회가 우리말 사전을 만들려고 애썼어요.', answer: 'R', hint: '우리말을 지키려는 노력이에요.' },
          { emoji: '🧶', text: '“우리 물건을 쓰자”며 물산 장려 운동을 벌였어요.', answer: 'R', hint: '경제적으로 일제에 맞서려는 노력이에요.' },
        ],
      },
      {
        title: '광복과 6·25 전쟁이 바꾼 생활',
        prompt: '광복부터 6·25 전쟁까지의 모습이에요. 어느 때의 모습인지 골라요.',
        categories: [
          { id: 'L', emoji: '🎉', label: '광복과 정부 수립' },
          { id: 'W', emoji: '🔥', label: '6·25 전쟁 중의 생활' },
          { id: 'S', emoji: '💔', label: '전쟁이 남긴 아픔' },
        ],
        cards: [
          { emoji: '🎉', text: '1945년 8월 15일, 일제의 지배에서 벗어났어요.', answer: 'L', hint: '나라를 되찾은 날이에요.' },
          { emoji: '🏛️', text: '1948년 대한민국 정부가 세워졌어요.', answer: 'L', hint: '광복 뒤 새 나라를 세운 일이에요.' },
          { emoji: '⚠️', text: '1950년 북한의 남침으로 전쟁이 시작되었어요.', answer: 'W', hint: '6·25 전쟁이 시작된 일이에요.' },
          { emoji: '🎒', text: '많은 사람이 짐을 지고 남쪽으로 피란을 떠났어요.', answer: 'W', hint: '전쟁을 피해 떠나는 모습이에요.' },
          { emoji: '👨‍👩‍👧', text: '가족이 남과 북으로 헤어져 이산가족이 생겼어요.', answer: 'S', hint: '전쟁이 끝난 뒤에도 이어지는 아픔이에요.' },
          { emoji: '🚧', text: '1953년 정전 협정 뒤 남과 북 사이에 군사 분계선이 생겼어요.', answer: 'S', hint: '전쟁이 남긴 분단의 모습이에요.' },
        ],
      },
    ],
    open: '일제 강점기와 6·25 전쟁을 겪은 사람들의 이야기를 듣는다면 무엇을 묻고 싶나요? 그 일들이 오늘날 우리에게 남긴 것도 적어 보세요.',
  },
} satisfies Partial<Record<ActivityId, SortSet>>);

// 활동이 하나뿐이던 단원을 보강한 활동 (sortsMore.ts)
Object.assign(SORT_SETS, MORE_SORT_SETS);

export function sortCards(set: SortSet) {
  return set.sections.flatMap((s, si) => s.cards.map((c) => ({ ...c, section: si })));
}

/** 고른 무리가 맞는지 */
export function isRight(card: SortCard, label?: string): boolean {
  return !!label && label !== '-' && card.answer.includes(label);
}

/** 글자로 정해지는 순서 섞기: 같은 카드는 늘 같은 순서라 다시 열어도 그대로예요. */
function stableShuffle<T>(items: T[], seed: string): T[] {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0;
    const j = h % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** 이 카드에서 고를 수 있는 보기. 카드만의 보기는 정답 위치를 짐작하지 못하게 섞어요. */
export function cardChoices(set: SortSet, card: SortCard & { section: number }): SortCategory[] {
  return card.choices ? stableShuffle(card.choices, card.text) : set.sections[card.section].categories;
}

export function sortScore(set: SortSet, labels?: string): number {
  return sortCards(set).filter((c, i) => isRight(c, labels?.[i])).length;
}

export function sortTried(labels?: string): number {
  return [...(labels ?? '')].filter((c) => c !== '-').length;
}

export function categoryLabel(set: SortSet, cardIndex: number, id?: string): string {
  const card = sortCards(set)[cardIndex];
  const cat = card && cardChoices(set, card).find((c) => c.id === id);
  return cat ? `${cat.emoji} ${cat.label}` : '';
}
