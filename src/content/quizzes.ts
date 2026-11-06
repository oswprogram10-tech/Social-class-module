/**
 * 지도에서 골라 답하는 탐구 질문 (자동 확인, 틀리면 답 대신 힌트)
 * 정답은 korea-data.ts 의 공식 통계와 맞춰 두었습니다.
 */
import type { ActivityId } from '../activities';
import { WORLDCLIMATE_ANSWERS } from './world-climate';
import { WORLDPOP_ANSWERS } from './world-pop';

export interface QuizQuestion {
  id: string;
  text: string;
  /** 정답 ID들 (도시·시도·나라 ID). 'choice' 문제는 보기 ID */
  answers: string[];
  hint: string;
  /** 보기에서 고르는 문제 */
  choices?: { id: string; label: string }[];
  /** 맞힌 뒤 보여 줄 설명 */
  explain?: string;
}

export interface QuizSet {
  questions: QuizQuestion[];
  /** 마지막 생각 쓰기 질문 */
  open: string;
}

export const QUIZZES: Partial<Record<ActivityId, QuizSet>> = {
  climate: {
    questions: [
      {
        id: 'c1',
        text: '1월 평균기온이 가장 높은 도시는 어디인가요?',
        answers: ['jeju'],
        hint: '달을 1월로 두고 기온을 비교해 보세요. 남쪽과 북쪽 중 어디가 더 따뜻할까요?',
        explain: '제주는 1월에도 평균 6.1℃예요. 남쪽 바다에 둘러싸여 겨울이 따뜻해요.',
      },
      {
        id: 'c2',
        text: '1월 평균기온이 가장 낮은 도시는 어디인가요?',
        answers: ['seoul'],
        hint: '1월 기온이 0℃보다 낮은 도시들을 먼저 찾아보세요. 그중 가장 낮은 곳은?',
        explain: '서울의 1월 평균기온은 -1.9℃로, 9개 도시 중 가장 추워요.',
      },
      {
        id: 'c3',
        text: '7월 강수량이 가장 많은 도시는 어디인가요?',
        answers: ['seoul'],
        hint: '달을 7월로 두고 “강수량”으로 바꿔 보세요. 원이 가장 큰 도시는?',
        explain: '서울의 7월 강수량은 414.4㎜예요. 장마와 집중호우가 여름에 몰려요.',
      },
      {
        id: 'c4',
        text: '1년 동안 내린 비(연 강수량)가 가장 적은 도시는 어디인가요?',
        answers: ['daegu'],
        hint: '도시를 눌러 기후 그래프의 “1년 강수량”을 비교해 보세요.',
        explain: '대구의 연 강수량은 1,080.8㎜로 가장 적어요. 산으로 둘러싸인 분지예요.',
      },
      {
        id: 'c5',
        text: '서울과 강릉은 위도가 비슷해요. 1월에 더 따뜻한 곳은 어디인가요?',
        answers: ['gangneung'],
        hint: '두 도시를 차례로 눌러 1월 기온을 비교해 보세요.',
        explain: '강릉은 1월 0.9℃, 서울은 -1.9℃예요. 태백산맥이 차가운 북서풍을 막아 주고 동해가 가까워요.',
      },
    ],
    open: '여름에 비가 많이 오는 까닭은 무엇일까요? 기후변화로 생길 수 있는 자연재해도 적어 보세요.',
  },
  population: {
    questions: [
      {
        id: 'p1',
        text: '1980년에 인구가 가장 많았던 시도는 어디인가요?',
        answers: ['seoul'],
        hint: '연도를 1980년으로 두고 가장 큰 원을 찾아보세요.',
        explain: '1980년 서울 인구는 약 836만 명으로 가장 많았어요.',
      },
      {
        id: 'p2',
        text: '2025년에 인구가 가장 많은 시도는 어디인가요?',
        answers: ['gyeonggi'],
        hint: '연도를 2025년으로 옮겨 보세요. 가장 큰 원이 바뀌었나요?',
        explain: '2025년 경기 인구는 약 1,397만 명으로, 서울보다 훨씬 많아요.',
      },
      {
        id: 'p3',
        text: '1980년부터 2025년 사이에 인구가 가장 많이 늘어난 시도는 어디인가요?',
        answers: ['gyeonggi'],
        hint: '연도를 바꾸며 어느 원이 가장 크게 자라는지 살펴보세요.',
        explain: '경기는 약 370만 명에서 약 1,397만 명으로 1,000만 명 넘게 늘었어요.',
      },
      {
        id: 'p4',
        text: '1980년보다 2025년에 인구가 줄어든 시도를 하나 찾아보세요.',
        answers: ['jeonnam', 'jeonbuk', 'gyeongbuk', 'gangwon', 'busan'],
        hint: '“늘고 줄기(색칠)” 지도로 바꿔 1980년과 2025년을 비교해 보세요. 붉은색으로 칠해진 곳은 어디인가요?',
        explain: '전남, 전북, 경북, 강원, 부산은 인구가 줄었어요. 일자리를 찾아 수도권과 대도시로 이동했어요.',
      },
      {
        id: 'p5',
        text: '2025년에 인구가 가장 적은 시도는 어디인가요?',
        answers: ['sejong'],
        hint: '연도를 2025년으로 두고 가장 작은 원을 찾아보세요.',
        explain: '세종은 약 39만 명이에요. 2012년에 새로 만들어진 행정 중심 도시라 인구가 빠르게 늘고 있어요.',
      },
    ],
    open: '수도권에 인구가 몰리면 어떤 문제가 생길까요? 해결 방법도 적어 보세요.',
  },
  globe: {
    questions: [
      {
        id: 'g1',
        text: '지구본이나 세계지도에서 대한민국을 찾아 누르세요.',
        answers: ['410'],
        hint: '아시아 대륙의 동쪽 끝, 북위 37° 근처를 찾아보세요.',
      },
      {
        id: 'g2',
        text: '우리나라 동쪽 바다 건너에 있는 섬나라를 찾아 누르세요.',
        answers: ['392'],
        hint: '대한민국에서 동쪽(오른쪽)으로 바다를 건너 보세요.',
      },
      {
        id: 'g3',
        text: '북위 약 40°, 서경 약 100° 근처에 있는 나라를 찾아 누르세요.',
        answers: ['840'],
        hint: '서경은 본초 자오선(경도 0°)의 서쪽이에요. 북아메리카 대륙을 살펴보세요.',
      },
      {
        id: 'g4',
        text: '남위 약 25°, 동경 약 135° 근처에 있는 나라를 찾아 누르세요.',
        answers: ['036'],
        hint: '남위는 적도의 남쪽이에요. 우리나라와 비슷한 경도에서 적도 아래로 내려가 보세요.',
      },
      {
        id: 'g5',
        text: '남위 약 10°, 서경 약 55° 근처에 있는 나라를 찾아 누르세요.',
        answers: ['076'],
        hint: '적도 바로 아래, 남아메리카 대륙을 살펴보세요.',
      },
      {
        id: 'g6',
        text: '메르카토르 세계지도에서는 그린란드가 아프리카 대륙만큼 커 보여요. 실제로는 어떨까요?',
        answers: ['africa'],
        choices: [
          { id: 'green', label: '그린란드가 더 넓어요' },
          { id: 'same', label: '둘이 비슷해요' },
          { id: 'africa', label: '아프리카가 훨씬 넓어요' },
        ],
        hint: '지구본을 돌려 그린란드와 아프리카를 같은 크기로 비교해 보세요. 세계지도는 북쪽·남쪽 끝으로 갈수록 크게 그려져요.',
        explain: '실제 넓이는 아프리카 대륙 약 3,037만 ㎢, 그린란드 약 217만 ㎢로 아프리카가 약 14배 넓어요.',
      },
    ],
    open: '지구본과 세계지도는 각각 어떤 좋은 점과 불편한 점이 있을까요?',
  },
  territory: {
    questions: [
      {
        id: 'r1',
        text: '남한에서 가장 높은 산을 찾아 누르세요.',
        answers: ['halla'],
        hint: '산 세 곳을 차례로 눌러 높이를 비교해 보세요.',
        explain: '한라산은 1,947m로 남한에서 가장 높은 산이에요. 제주도를 만든 화산이에요.',
      },
      {
        id: 'r2',
        text: '서울을 지나 서해로 흘러가는 강을 찾아 누르세요.',
        answers: ['han'],
        hint: '수도 서울은 지도에서 어디쯤 있나요? 그 가까이를 흐르는 강을 찾아보세요.',
        explain: '한강은 서울을 지나 서해로 흘러가요.',
      },
      {
        id: 'r3',
        text: '남한에서 가장 긴 강을 찾아 누르세요.',
        answers: ['nakdong'],
        hint: '강을 눌러 길이를 확인해 보세요. 경상도를 흐르는 강은?',
        explain: '낙동강은 약 510km로 남한에서 가장 긴 강이에요.',
      },
      {
        id: 'r4',
        text: '밀물과 썰물의 차이가 커서 넓은 갯벌이 드러나는 해안을 찾아 누르세요.',
        answers: ['westcoast'],
        hint: '해안 세 곳을 눌러 비교해 보세요. 갯벌이 넓은 곳은?',
        explain: '서해안은 밀물과 썰물의 차이가 커서 넓은 갯벌이 생겨요.',
      },
      {
        id: 'r5',
        text: '우리나라 가장 동쪽 끝에 있는 섬을 찾아 누르세요.',
        answers: ['dokdo'],
        hint: '지도의 가장 오른쪽(동쪽)을 살펴보세요. 울릉도보다 더 동쪽에 있어요.',
        explain: '독도는 경상북도 울릉군에 속한 우리 땅이에요. 맑은 날에는 울릉도에서 보여요.',
      },
      {
        id: 'r6',
        text: '우리나라의 큰 강들이 대부분 서해나 남해로 흐르는 까닭은 무엇일까요?',
        answers: ['eastHigh'],
        choices: [
          { id: 'eastHigh', label: '동쪽이 높고 서쪽이 낮은 땅 모양이라서' },
          { id: 'westRain', label: '서쪽에만 비가 와서' },
          { id: 'sea', label: '동해에는 바닷물이 없어서' },
        ],
        hint: '설악산 같은 높은 산들은 동쪽과 서쪽 중 어디에 많나요? 물은 높은 곳에서 낮은 곳으로 흘러요.',
        explain: '우리나라는 동쪽이 높고 서쪽이 낮아서(동고서저), 큰 강이 대부분 서해와 남해로 흘러가요.',
      },
    ],
    open: '국토 여행을 간다면 어떤 지형을 가 보고 싶나요? 독도를 지키기 위해 내가 할 수 있는 일도 적어 보세요.',
  },
  truesize: {
    questions: [
      {
        id: 't1',
        text: '대한민국을 북쪽 끝(북위 72°) 가까이 옮기면 메르카토르 지도에서 어떻게 보이나요?',
        answers: ['big'],
        choices: [
          { id: 'big', label: '원래보다 훨씬 크게 보여요' },
          { id: 'same', label: '크기가 그대로예요' },
          { id: 'small', label: '원래보다 작게 보여요' },
        ],
        hint: '대한민국을 고르고 “북쪽 끝으로” 단추를 눌러 보세요.',
        explain: '메르카토르 지도는 적도에서 멀어질수록 땅을 크게 늘려 그려요.',
      },
      {
        id: 't2',
        text: '그때 대한민국의 실제 넓이는 어떻게 되었나요?',
        answers: ['same'],
        choices: [
          { id: 'big', label: '실제로도 넓어졌어요' },
          { id: 'same', label: '실제 넓이는 그대로예요' },
          { id: 'small', label: '실제로 좁아졌어요' },
        ],
        hint: '아래 칸의 “실제 넓이” 숫자가 바뀌었는지 보세요.',
        explain: '나라를 옮겨도 실제 넓이는 같아요. 지도에서만 크기가 달라 보여요.',
      },
      {
        id: 't3',
        text: '그린란드를 적도로 옮기면 지도에서 어떻게 보이나요?',
        answers: ['small'],
        choices: [
          { id: 'big', label: '더 크게 보여요' },
          { id: 'same', label: '그대로예요' },
          { id: 'small', label: '훨씬 작게 보여요' },
        ],
        hint: '그린란드를 고르고 “적도로” 단추를 눌러 보세요.',
        explain: '그린란드는 북극 가까이 있어서 메르카토르 지도에서 실제보다 아주 크게 그려져 있었어요.',
      },
      {
        id: 't4',
        text: '그린란드와 콩고 민주 공화국 가운데 실제로 더 넓은 나라는?',
        answers: ['congo'],
        choices: [
          { id: 'greenland', label: '그린란드' },
          { id: 'congo', label: '콩고 민주 공화국' },
          { id: 'same', label: '정확히 똑같아요' },
        ],
        hint: '두 나라를 차례로 골라 “실제 넓이” 숫자를 비교해 보세요.',
        explain: '콩고 민주 공화국이 조금 더 넓어요. 그런데 메르카토르 지도에서는 그린란드가 훨씬 커 보이지요.',
      },
      {
        id: 't5',
        text: '메르카토르 지도에서 실제보다 가장 크게 그려지는 곳은 어디인가요?',
        answers: ['pole'],
        choices: [
          { id: 'equator', label: '적도 가까운 곳' },
          { id: 'pole', label: '북극·남극 가까운 곳' },
          { id: 'none', label: '모든 곳이 똑같아요' },
        ],
        hint: '나라를 적도와 북쪽 끝으로 옮겨 보며 언제 가장 커지는지 보세요.',
      },
    ],
    open: '메르카토르 지도만 보고 나라의 크기를 비교하면 어떤 오해가 생길까요? 나라의 넓이를 비교할 때는 어떤 자료를 함께 보면 좋을까요?',
  },
  landform: {
    questions: [
      {
        id: 'l1',
        text: '세계에서 가장 높은 산이 있는 산맥을 찾아 누르세요.',
        answers: ['himalaya'],
        hint: '“산지·산맥”만 골라 보세요. 아시아에 있는 산맥은 어디인가요?',
        explain: '히말라야산맥에는 세계에서 가장 높은 에베레스트산(약 8,849m)이 있어요.',
      },
      {
        id: 'l2',
        text: '빙하가 깎은 골짜기에 바닷물이 들어와 생긴, 좁고 긴 바다(피오르)를 찾아 누르세요.',
        answers: ['fjord'],
        hint: '“빙하 지형”만 골라 보세요. 바다와 맞닿은 곳은 어디인가요?',
        explain: '노르웨이의 피오르는 빙하가 깎은 깊은 골짜기에 바닷물이 들어와 생겼어요.',
      },
      {
        id: 'l3',
        text: '세계에서 가장 넓은 열대 우림 사이를 흐르는 강을 찾아 누르세요.',
        answers: ['amazon'],
        hint: '적도 가까이에 있는 “하천”을 찾아보세요.',
        explain: '아마존강은 열대 우림 사이를 흐르며, 사람들은 배를 타고 다녀요.',
      },
      {
        id: 'l4',
        text: '사막 한가운데를 흘러, 강 양옆에서만 초록빛 밭을 볼 수 있는 강을 찾아 누르세요.',
        answers: ['nile'],
        hint: '아프리카 북쪽의 넓은 사막 옆을 흐르는 강은 어디일까요?',
        explain: '나일강 덕분에 사막 속에서도 농사를 지을 수 있고, 옛 이집트 문명이 생겼어요.',
      },
      {
        id: 'l5',
        text: '땅속의 열(지열)로 대부분의 집을 데우는 곳을 찾아 누르세요.',
        answers: ['iceland'],
        hint: '“화산 지형”을 골라 보세요.',
        explain: '아이슬란드는 화산이 많아 땅속 열로 집을 데우고 전기도 만들어요.',
      },
      {
        id: 'l6',
        text: '몽골 초원의 유목민이 쉽게 뜯어서 옮길 수 있는 집(게르)에 사는 까닭은 무엇일까요?',
        answers: ['grass'],
        choices: [
          { id: 'grass', label: '가축에게 먹일 풀을 찾아 자주 옮겨 다녀서' },
          { id: 'flood', label: '강물이 자주 넘쳐서' },
          { id: 'cold', label: '1년 내내 눈이 쌓여 있어서' },
        ],
        hint: '몽골 초원을 눌러 사람들이 무엇을 기르며 사는지 읽어 보세요.',
        explain: '풀이 다 먹히면 다른 풀밭으로 옮겨야 해서, 옮기기 쉬운 집이 알맞아요.',
      },
    ],
    open: '가장 가 보고 싶은 지형 경관은 어디인가요? 그곳 사람들의 생활이 우리와 어떻게 다른지도 적어 보세요.',
  },
  worldclimate: {
    questions: [
      {
        id: 'k1',
        text: '1년 내내 덥고 비가 많이 오는 도시를 찾아 누르세요.',
        answers: WORLDCLIMATE_ANSWERS.hotWet,
        hint: '도시를 눌러 기후 그래프를 보세요. 기온 선이 1년 내내 높고, 강수량 막대가 큰 곳은?',
        explain: '싱가포르는 가장 추운 달도 26.8℃이고, 1년에 비가 2,113㎜나 와요. 적도 가까이에 있는 열대 기후예요.',
      },
      {
        id: 'k2',
        text: '1년 강수량이 가장 적은 도시를 찾아 누르세요.',
        answers: [WORLDCLIMATE_ANSWERS.driest],
        hint: '아래 표의 “1년 강수량”을 비교해 보세요.',
        explain: '카이로는 1년 강수량이 24.8㎜로, 서울의 7월 한 달 강수량(414.4㎜)의 17분의 1도 안 돼요. 건조 기후예요.',
      },
      {
        id: 'k3',
        text: '가장 따뜻한 달에도 평균 기온이 10℃가 안 되는 도시를 찾아 누르세요.',
        answers: WORLDCLIMATE_ANSWERS.coldSummer,
        hint: '표에서 “가장 더운 달” 기온을 살펴보세요. 북극에 가까운 곳은 어떨까요?',
        explain: '우트키아비크는 7월에도 평균 4.6℃예요. 이렇게 추우면 나무가 자라지 못해요. 한대 기후예요.',
      },
      {
        id: 'k4',
        text: '적도 바로 가까이에 있는데도 1년 내내 서늘한 도시를 찾아 누르세요.',
        answers: WORLDCLIMATE_ANSWERS.coolEquator,
        hint: '지도에서 적도(빨간 선) 가까이에 있는 도시를 눌러 보세요. 그 도시의 높이(해발 고도)는 얼마인가요?',
        explain: '키토는 적도 근처지만 해발 약 2,800m에 있어서 1년 내내 14℃ 안팎이에요. 고산 기후예요.',
      },
      {
        id: 'k5',
        text: '서울과 런던 중 가장 더운 달과 가장 추운 달의 기온 차(연교차)가 더 큰 곳은?',
        answers: [WORLDCLIMATE_ANSWERS.seoulVsLondon],
        choices: [
          { id: 'seoul', label: '서울' },
          { id: 'london', label: '런던' },
        ],
        hint: '두 도시를 차례로 눌러, 가장 더운 달 기온에서 가장 추운 달 기온을 빼 보세요.',
        explain: '서울은 28.0℃, 런던은 13.4℃ 차이가 나요. 둘 다 온대 기후지만 서울은 여름과 겨울의 차이가 훨씬 커요.',
      },
      {
        id: 'k6',
        text: '카이로 같은 건조 기후 지역의 전통 집이 벽은 두껍고 창은 작은 까닭은 무엇일까요?',
        answers: ['sun'],
        choices: [
          { id: 'sun', label: '강한 햇볕과 낮의 열기를 막으려고' },
          { id: 'rain', label: '많이 내리는 비를 막으려고' },
          { id: 'snow', label: '쌓인 눈의 무게를 버티려고' },
        ],
        hint: '카이로의 기후 그래프에서 강수량과 여름 기온을 다시 살펴보세요.',
        explain: '비는 거의 안 오고 햇볕이 강해요. 두꺼운 흙벽은 낮의 열이 안으로 들어오는 것을 늦춰 줘요.',
      },
    ],
    open: '내가 고른 기후 지역에 산다면 옷, 음식, 집을 어떻게 바꾸어야 할까요? 까닭도 적어 보세요.',
  },
  worldpop: {
    questions: [
      {
        id: 'w1',
        text: '세계에서 인구가 가장 많은 나라를 찾아 누르세요.',
        answers: [WORLDPOP_ANSWERS.most],
        hint: '“인구” 보기에서 가장 진한 색의 나라를 찾아보세요. 아시아 대륙을 살펴볼까요?',
        explain: '2023년 국제연합 추계로 인도가 약 14억 4천만 명으로 가장 많아요. 중국도 약 14억 2천만 명이에요.',
      },
      {
        id: 'w2',
        text: '세계 인구의 절반 넘게 사는 대륙은 어디인가요?',
        answers: ['AS'],
        choices: [
          { id: 'AS', label: '아시아' },
          { id: 'AF', label: '아프리카' },
          { id: 'EU', label: '유럽' },
          { id: 'NA', label: '북아메리카' },
        ],
        hint: '오른쪽 대륙별 막대그래프를 비교해 보세요.',
        explain: '아시아에 세계 인구의 약 59%가 살아요.',
      },
      {
        id: 'w3',
        text: '아프리카에서 인구가 가장 많은 나라를 찾아 누르세요.',
        answers: [WORLDPOP_ANSWERS.africaMost],
        hint: '아프리카 대륙에서 색이 가장 진한 나라를 찾아보세요. 서쪽 해안을 살펴볼까요?',
        explain: '나이지리아는 약 2억 3천만 명으로 아프리카에서 인구가 가장 많아요.',
      },
      {
        id: 'w4',
        text: '사람이 아주 드물게 사는(인구 밀도가 낮은) 나라를 하나 찾아 누르세요.',
        answers: WORLDPOP_ANSWERS.lowDensity,
        hint: '“인구 밀도” 보기로 바꿔 가장 연한 색의 넓은 나라를 찾아보세요. 사막이나 아주 추운 곳은 어떨까요?',
        explain: '사막, 추운 지역, 높은 산이 넓은 나라는 사람이 드물게 살아요.',
      },
      {
        id: 'w5',
        text: '우리나라(약 5,175만 명)보다 인구가 많은 아프리카 나라를 하나 찾아 누르세요.',
        answers: WORLDPOP_ANSWERS.africaMoreThanKorea,
        hint: '아프리카 나라를 눌러 인구를 우리나라와 비교해 보세요.',
        explain: '아프리카에는 우리나라보다 인구가 많은 나라가 7개나 있어요. 아프리카는 인구가 빠르게 늘고 있어요.',
      },
    ],
    open: '사람이 많이 모여 사는 곳과 드물게 사는 곳은 자연환경이 어떻게 다를까요?',
  },
};

/** 문제에 대한 학생 답이 맞았는지 */
export function isCorrect(q: QuizQuestion, answer?: string): boolean {
  return !!answer && q.answers.includes(answer);
}

/** 저장 형식: 문제 순서대로 쉼표로 구분한 답 */
export function parseAnswers(picks?: string): string[] {
  return (picks ?? '').split(',');
}

export function quizScore(set: QuizSet, picks?: string): number {
  const a = parseAnswers(picks);
  return set.questions.filter((q, i) => isCorrect(q, a[i])).length;
}
