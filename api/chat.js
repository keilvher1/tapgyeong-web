import { streamText, convertToModelMessages } from 'ai';

export const config = {
  runtime: 'edge',
};

const SYSTEM_PROMPT = `당신은 "탭경(TapGyeong)" 서비스의 AI 여행 코스 추천 도우미입니다.
경상북도 3개 도시(경주, 안동, 포항)의 관광 전문가로서, 사용자의 취향에 맞는 맞춤형 여행 코스를 추천해주세요.

## 주요 관광지 데이터:
**경주**: 석굴암, 불국사, 첨성대, 대릉원, 동궁과 월지(안압지), 경주 교촌마을, 황리단길, 보문관광단지
**안동**: 하회마을, 도산서원, 안동 찜닭골목, 월영교, 봉정사, 안동 하회탈 박물관, 맘모스빵집, 안동간고등어
**포항**: 호미곶, 죽도시장, 영일대 해수욕장, 포항 운하, 구룡포 일본인 가옥거리, 이가리 닻 전망대, 포항 과메기

## 추천 규칙:
1. 사용자의 여행 스타일(힐링, 문화탐방, 맛집투어, 액티비티 등)에 맞게 추천
2. 일정(당일치기, 1박2일, 2박3일)에 맞춰 코스 구성
3. 각 장소의 특징, 소요시간, 이동거리를 포함
4. 코스별 예상 비용, 꿀팁 포함
5. NFC 스탬프 수집 포인트도 안내
6. 답변은 한국어로, 이모지를 활용해 친근하게 작성
7. 각 코스를 시간순으로 정리해서 보기 쉽게 구성

항상 친근하고 전문적인 톤으로 답변하세요. 답변은 간결하지만 유용하게 작성하세요.`;

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await req.json();
    const { messages } = body;

    const modelMessages = await convertToModelMessages(messages);

    const result = streamText({
      model: 'openai/gpt-4o-mini',
      system: SYSTEM_PROMPT,
      messages: modelMessages,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('AI API Error:', error);
    return new Response(
      JSON.stringify({ error: 'AI 서비스에 일시적인 문제가 발생했습니다.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
