/**
 * 분류하기 활동: 카드를 알맞은 무리로 나누고, 앱이 바로 확인합니다(틀리면 답 대신 힌트).
 *
 * 저장 형식(labels): 모든 카드의 고른 무리 ID를 차례로 이은 문자열. 아직 안 고른 카드는 '-'.
 * 무리 ID는 반드시 한 글자여야 합니다.
 */
import type { ActivityId } from '../activities';

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
  answer: string;
  /** 틀렸을 때 생각을 돕는 질문 */
  hint: string;
}

export interface SortSection {
  title: string;
  prompt: string;
  categories: SortCategory[];
  cards: SortCard[];
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

export function sortCards(set: SortSet) {
  return set.sections.flatMap((s, si) => s.cards.map((c) => ({ ...c, section: si })));
}

export function sortScore(set: SortSet, labels?: string): number {
  return sortCards(set).filter((c, i) => labels?.[i] === c.answer).length;
}

export function sortTried(labels?: string): number {
  return [...(labels ?? '')].filter((c) => c !== '-').length;
}

export function categoryLabel(set: SortSet, cardIndex: number, id?: string): string {
  const card = sortCards(set)[cardIndex];
  const cat = card && set.sections[card.section].categories.find((c) => c.id === id);
  return cat ? `${cat.emoji} ${cat.label}` : '';
}
