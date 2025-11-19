import { useCallback, useEffect, useRef, useState } from 'react';
import SelectUiBody from '@/components/common/SelectUiBody';
import Background from '@/components/common/Background';
import Button from '@/components/common/Button';
import MapboxRoute, { type Plans as PlansResponse } from '@/components/common/Map';
import styled, { keyframes } from 'styled-components';
import { postTraits, postPerpose, postPeople, postRecommend, postDay, postPlanner, getPlans } from '@/services/api-util';
import RecommendationOptions from '@/components/common/RecommendationOptions';

type Question = {
  title: string;
  description: string;
  options: Array<{ label: string }>;
};

type ChatMessage = {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
};

type Recommendation = {
  name: string;
  address: string;
  reason: string;
  latitude: number;
  longitude: number;
};

const QUESTIONS: Question[] = [
  {
    title: "어떤 나라 여행을 가고 싶으신가요?",
    description: "끌리는 여행지를 선택해주세요.",
    options: [
      { label: "중앙아시아" },
      { label: "동남아시아" },
      { label: "북아메리카" },
      { label: "남아메리카" },
      { label: "유럽" },
      { label: "아프리카" }
    ],
  },
  {
    title: "무엇을 즐기고 싶으신가요?",
    description: "이번 여행의 키워드를 알려주세요.",
    options: [
      { label: "미식" },
      { label: "카페" },
      { label: "자연" },
      { label: "문화" },
      { label: "축제" },
      { label: "휴식" }
    ],
  },
  {
    title: "누구와 함께 가시나요?",
    description: "동행 정보를 알려주세요.",
    options: [
      { label: "혼자" },
      { label: "친구와" },
      { label: "가족과" },
      { label: "연인과" }
    ],
  },
  {
    title: "여행 기간은 어떻게 생각하시나요?",
    description: "대략적인 일정만 알려주셔도 좋아요.",
    options: [
      { label: "당일치기" },
      { label: "이틀" },
      { label: "3일" },
      { label: "4일" },
      { label: "일주일" }
    ],
  },
];


export default function QuestionPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatMode, setIsChatMode] = useState(false);
  const [isAwaitingAssistant, setIsAwaitingAssistant] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isRecommendationView, setIsRecommendationView] = useState(false);
  const [isSurveyComplete, setIsSurveyComplete] = useState(false);
  const [highlightedRecommendation, setHighlightedRecommendation] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [recommendationSourceId, setRecommendationSourceId] = useState<string | null>(null);
  const [isRecommendationLoading, setIsRecommendationLoading] = useState(false);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);
  const [plannerPayload, setPlannerPayload] = useState<Recommendation | null>(null);
  const [plansData, setPlansData] = useState<PlansResponse | null>(null);
  const [isPlansLoading, setIsPlansLoading] = useState(false);
  const [plansError, setPlansError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const currentQuestion = QUESTIONS[currentQuestionIndex];

  useEffect(() => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [chatMessages, isAwaitingAssistant]);

  const handleOptionButton = (optionLabel: string) => {
    setSelectedOption(optionLabel);
  };

  const handleChatMode = () => {
    setChatMessages([]);
    setChatInput('');
    setIsAwaitingAssistant(false);
    setIsChatMode(true);
  };

  const handleBackToSelect = () => {
    setChatMessages([]);
    setChatInput('');
    setIsAwaitingAssistant(false);
    setIsChatMode(false);
  };

  const handleSendChatMessage = () => {
    const trimmed = chatInput.trim();
    if (!trimmed) return;

    if (isAwaitingAssistant) return;

    setIsAwaitingAssistant(true);
    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      text: trimmed,
      sender: 'user',
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput('');

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-assistant`,
          text: `"${trimmed}"에 맞는 여행 아이디어를 준비 중이에요.`,
          sender: 'assistant',
        },
      ]);
      setIsAwaitingAssistant(false);
    }, 350);
  };

  const handleChatInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (!isAwaitingAssistant) {
        handleSendChatMessage();
      }
    }
  };

  const RECOMMENDATION_LIMIT = 5;

  const loadRecommendations = async (id: string, limit: number = RECOMMENDATION_LIMIT) => {
    setIsRecommendationLoading(true);
    setRecommendationError(null);
    try {
      const res = await postRecommend(id, limit);
      const places = Array.isArray((res.data as { places?: Recommendation[] } | null)?.places)
        ? ((res.data as { places?: Recommendation[] })?.places as Recommendation[])
        : [];

      if (res.status === 200 && places.length > 0) {
        setRecommendations(places);
      } else {
        setRecommendations([]);
        setRecommendationError('추천 결과를 불러오지 못했어요. 다시 시도해 주세요.');
      }
    } catch (error) {
      setRecommendations([]);
      setRecommendationError('추천 요청 중 오류가 발생했습니다.');
    } finally {
      setIsRecommendationLoading(false);
    }
  };

  const fetchPlans = useCallback(async (id: string) => {
    setIsPlansLoading(true);
    setPlansError(null);
    try {
      const res = await getPlans(id);
      const data = res.data as PlansResponse | null;
      if (res.status === 200 && data && Array.isArray(data.daily_plans)) {
        setPlansData(data);
      } else {
        setPlansData(null);
        setPlansError('여행 플랜을 아직 받아오지 못했어요. 잠시 후 다시 시도해주세요.');
      }
    } catch (error) {
      setPlansData(null);
      setPlansError('여행 플랜을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsPlansLoading(false);
    }
  }, []);

  const handleRecommendationSelect = (place: Recommendation) => {
    setHighlightedRecommendation(place.name);
    setPlannerPayload(place);
  };

  const handleRecommendationRetry = () => {
    const sourceId = recommendationSourceId ?? apiRecordIdRef.current;
    if (sourceId) {
      loadRecommendations(sourceId);
    }
  };

const handleRecommendationNext = () => {
    if (!highlightedRecommendation || isAwaitingAssistant) return;

    const selectedPlace = recommendations.find((p) => p.name === highlightedRecommendation);
    if (!selectedPlace) return;

    setIsAwaitingAssistant(true);

    const userMessage: ChatMessage = {
      id: `${Date.now()}-recommendation-user`,
      text: selectedPlace.name,
      sender: 'user',
    };

    setChatMessages((prev) => [
      ...prev,
      userMessage,
      {
        id: `${Date.now()}-recommendation-assistant`,
        text: `${selectedPlace.name}을(를) 추천 리스트에 담아둘게요.`,
        sender: 'assistant',
      },
    ]);

    setTimeout(() => {
      // 추천 선택 후 다음 질문으로 이동합니다.
      setCurrentQuestionIndex((prev) => prev + 1); // ✨ 이 줄을 추가합니다.
      
      setIsRecommendationView(false);
      setIsAwaitingAssistant(false);
      setHighlightedRecommendation(null);
    }, 350);
  };

  const handleSurveyReset = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setChatMessages([]);
    setChatInput('');
    setIsChatMode(false);
    setIsAwaitingAssistant(false);
    setIsRecommendationView(false);
    setIsSurveyComplete(false);
    setHighlightedRecommendation(null);
    setRecommendations([]);
    setRecommendationSourceId(null);
    setRecommendationError(null);
    setIsRecommendationLoading(false);
    setPlannerPayload(null);
    setPlansData(null);
    setPlansError(null);
    setIsPlansLoading(false);
  };

  const handleShareClick = () => {
    // Placeholder: integrate real share flow later
    console.info('공유하기 기능은 아직 준비 중입니다.');
  };

const handleNext = () => {
    if (!selectedOption) return;
    if (isAwaitingAssistant) return;

    setIsAwaitingAssistant(true);

    const userMessage: ChatMessage = {
      id: `${Date.now()}-user-${Math.random()}`,
      text: selectedOption,
      sender: 'user',
    };

    setChatMessages((prev) => [...prev, userMessage]);

    // Set loading/error state if it's the first question
    if (currentQuestionIndex === 0) {
      setRecommendationError(null);
      setRecommendations([]);
      setIsRecommendationLoading(true);
    }

    // Call server according to the question index
    (async () => {
      let isNextStepNeeded = true;
      let shouldShowRecommendation = false;

      try {
        if (currentQuestionIndex === 0) {
          // places -> create traits
          const res = await postTraits(selectedOption);
          if (res.status === 200 || res.status === 201) {
            const id = res.data?.data?._id || res.data?.data?._id || res.data?._id || res.data?.id;
            if (id) {
              setChatMessages((prev) => [
                ...prev,
                {
                  id: `${Date.now()}-server-success`,
                  text: res.data.categories.short_description,
                  sender: 'assistant',
                },
              ]);
              // store id in ref/state for next calls
              setApiRecordId(id);
              setRecommendationSourceId(id);
              
              // 추천 로드 후 추천 화면을 띄우기 위해 플래그 설정
              shouldShowRecommendation = true;
              isNextStepNeeded = false; // 첫 질문에서는 바로 다음 질문으로 넘어가지 않고 추천 화면으로 전환
              
              await loadRecommendations(id); // loadRecommendations가 완료될 때까지 기다림
            } else {
              setChatMessages((prev) => [
                ...prev,
                {
                  id: `${Date.now()}-server-warn`,
                  text: '서버 응답에서 id를 찾을 수 없습니다.',
                  sender: 'assistant',
                },
              ]);
              setIsRecommendationLoading(false);
              setRecommendationError('추천 데이터를 준비할 수 없습니다. 다시 시도해주세요.');
            }
          } else {
            setChatMessages((prev) => [
              ...prev,
              {
                id: `${Date.now()}-server-error`,
                text: `장소 저장 중 오류(${res.status})가 발생했습니다.`,
                sender: 'assistant',
              },
            ]);
            setIsRecommendationLoading(false);
            setRecommendationError('여행지 추천을 불러오는 중 오류가 발생했습니다.');
          }
        } else if (currentQuestionIndex === 1) {
          // purpose/perpose
          const id = apiRecordIdRef.current;
          if (id) {
            const res = await postPerpose(selectedOption, id);
            if (res.status !== 200) {
              setChatMessages((prev) => [
                ...prev,
                {
                  id: `${Date.now()}-server-error`,
                  text: `목적 저장 중 오류(${res.status})가 발생했습니다.`,
                  sender: 'assistant',
                },
              ]);
            }
          }
        } else if (currentQuestionIndex === 2) {
          // people
          const id = apiRecordIdRef.current;
          if (id) {
            const res = await postPeople(id, selectedOption);
            if (res.status === 200) {
              setChatMessages((prev) => [
                ...prev,
                {
                  id: `${Date.now()}-server-success`,
                  text: '동행 정보가 서버에 저장되었습니다.',
                  sender: 'assistant',
                },
              ]);
            } else {
              setChatMessages((prev) => [
                ...prev,
                {
                  id: `${Date.now()}-server-error`,
                  text: `동행 저장 중 오류(${res.status})가 발생했습니다.`,
                  sender: 'assistant',
                },
              ]);
            }
          } else {
            setChatMessages((prev) => [
              ...prev,
              {
                id: `${Date.now()}-server-error`,
                text: '서버에 저장된 레코드가 없어 설문을 완전히 저장하지 못했습니다.',
                sender: 'assistant',
              },
            ]);
          }
        } else if (currentQuestionIndex === 3) {
          // day
          const id = apiRecordIdRef.current;
          if (id) {
            const res = await postDay(id, selectedOption);
            if (res.status === 200) {
              setChatMessages((prev) => [
                ...prev,
                {
                  id: `${Date.now()}-server-success`,
                  text: '여행 기간 정보가 서버에 저장되었습니다. 설문이 곧 마무리됩니다.',
                  sender: 'assistant',
                },
              ]);

              const plannerData = plannerPayloadRef.current;
              if (plannerData) {
                const plannerRes = await postPlanner(id, plannerData);
                if (plannerRes.status === 200) {
                  setChatMessages((prev) => [
                    ...prev,
                    {
                      id: `${Date.now()}-planner-success`,
                      text: `${plannerData.name} 기반으로 초안 플래너를 만들어뒀어요.`,
                      sender: 'assistant',
                    },
                  ]);
                  fetchPlans(id);
                } else {
                  setChatMessages((prev) => [
                    ...prev,
                    {
                      id: `${Date.now()}-planner-error`,
                      text: '플래너 생성 중 문제가 발생했어요. 나중에 다시 시도해주세요.',
                      sender: 'assistant',
                    },
                  ]);
                }
              } else {
                setChatMessages((prev) => [
                  ...prev,
                  {
                    id: `${Date.now()}-planner-missing`,
                    text: '추천 데이터를 찾지 못해 플래너를 생성하지 못했습니다.',
                    sender: 'assistant',
                  },
                ]);
              }
            } else {
              setChatMessages((prev) => [
                ...prev,
                {
                  id: `${Date.now()}-server-error`,
                  text: `여행 기간 저장 중 오류(${res.status})가 발생했습니다.`,
                  sender: 'assistant',
                },
              ]);
            }
          } else {
            setChatMessages((prev) => [
              ...prev,
              {
                id: `${Date.now()}-server-error`,
                text: '서버에 저장된 레코드가 없어 여행 기간을 저장하지 못했습니다.',
                sender: 'assistant',
              },
            ]);
          }
        }
      } catch (err) {
        setChatMessages((prev) => [
          ...prev,
          {
            id: `${Date.now()}-server-exception`,
            text: '서버 통신 중 오류가 발생했습니다.',
            sender: 'assistant',
          },
        ]);
        if (currentQuestionIndex === 0) {
          setIsRecommendationLoading(false);
          setRecommendationError('여행지 추천을 불러오는 중 오류가 발생했습니다.');
        }
      }
      finally {
        setIsAwaitingAssistant(false);
        setSelectedOption(null); // 옵션 선택 초기화

        if (shouldShowRecommendation) {
            // 첫 질문에 대한 응답을 받고 추천 로드까지 완료되면 추천 화면으로 전환
            setIsRecommendationView(true);
            setHighlightedRecommendation(null);
        } else if (isNextStepNeeded) {
          if (currentQuestionIndex < QUESTIONS.length - 1) {
            // 다음 질문으로 이동
            setCurrentQuestionIndex((prev) => prev + 1);
          } else {
            // 설문 완료 처리
            setIsSurveyComplete(true);
            setIsRecommendationView(false);
          }
        }
      }
    })();
  };

  const [apiRecordId, setApiRecordId] = useState<string | null>(null);
  const apiRecordIdRef = useRef<string | null>(null);
  const plannerPayloadRef = useRef<Recommendation | null>(null);

  // keep ref in sync so async closures read the latest id
  useEffect(() => {
    apiRecordIdRef.current = apiRecordId;
  }, [apiRecordId]);

  useEffect(() => {
    plannerPayloadRef.current = plannerPayload;
  }, [plannerPayload]);

  useEffect(() => {
    const id = apiRecordIdRef.current;
    if (isSurveyComplete && id && !plansData && !isPlansLoading) {
      fetchPlans(id);
    }
  }, [fetchPlans, isSurveyComplete, plansData, isPlansLoading]);

  const sharedTitle = isChatMode ? '챗봇과 대화하기' : currentQuestion.title;
  const sharedDescription = isChatMode ? 'AI 여행 플래너에게 바로 질문해보세요.' : currentQuestion.description;

  if (isSurveyComplete) {
    const finalPlaceName = plannerPayload?.name ?? '추천 여행지';
    const hasPlans = Boolean(plansData && plansData.daily_plans.length > 0);

    return (
      <Background>
        <FinalWrapper>
          <FinalHeader>
            <FinalBadge>어데가노!</FinalBadge>
            <FinalTitle>좋아요! 여행을 이제 떠나볼까요?</FinalTitle>
            <FinalDescription>
              {finalPlaceName}을(를) 중심으로 맞춤 일정을 구성했어요. 필요하면 아래에서 바로 조정해보세요.
            </FinalDescription>
          </FinalHeader>

          <FinalTopRow>
            <FinalMapCard>
              {isPlansLoading ? (
                <FinalMapStatus>여행 플랜을 불러오는 중이에요...</FinalMapStatus>
              ) : plansError ? (
                <FinalMapStatus>{plansError}</FinalMapStatus>
              ) : hasPlans && plansData ? (
                <MapboxRoute plans={plansData} />
              ) : (
                <FinalMapStatus>아직 지도에 표시할 플랜이 없어요.</FinalMapStatus>
              )}
            </FinalMapCard>
            
          </FinalTopRow>

          {hasPlans && plansData ? (
            <DaysSection>
              {plansData.daily_plans.map((dayPlan) => (
                <DayCard key={dayPlan.day}>
                  <DayHeader>
                    <DayLabel>{dayPlan.day}일차</DayLabel>
                    <DaySummary>{dayPlan.summary || `${dayPlan.day}일차 일정`}</DaySummary>
                  </DayHeader>
                  <DayTimeline>
                    {dayPlan.schedule.map((item, idx) => (
                      <TimelineItem key={`${dayPlan.day}-${idx}-${item.name}`}>
                        <TimelineIndex>{idx + 1}</TimelineIndex>
                        <TimelineBody>
                          <TimelineName>{item.name}</TimelineName>
                          <TimelineMeta>
                            {item.type}
                            {item.address ? ` · ${item.address}` : ''}
                            {item.visit_time ? ` · ${item.visit_time}` : ''}
                          </TimelineMeta>
                          {item.reason && <TimelineReason>{item.reason}</TimelineReason>}
                        </TimelineBody>
                      </TimelineItem>
                    ))}
                  </DayTimeline>
                </DayCard>
              ))}
            </DaysSection>
          ) : (
            <EmptyPlansState>
              <p>아직 일정을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.</p>
            </EmptyPlansState>
          )}

          <FinalActions>
            <Button label="공유하기" onClick={handleShareClick} />
            <SecondaryButton type="button" onClick={handleSurveyReset}>처음부터 다시하기</SecondaryButton>
          </FinalActions>
        </FinalWrapper>
      </Background>
    );
  }

  if (isRecommendationView) {
    return (
      <SelectUiBody
        title="여행지 추천 리스트"
        description="첫 번째 답변을 기반으로 어울리는 여행지들을 골라봤어요. 마음에 드는 곳을 선택해주세요."
        nextButtonLabel="다음으로"
        onNext={handleRecommendationNext}
        isNextDisabled={isAwaitingAssistant || !highlightedRecommendation}
      >
        {isRecommendationLoading ? (
          <RecommendationStatus>여행지를 불러오는 중이에요...</RecommendationStatus>
        ) : recommendationError ? (
          <RecommendationStatus>
            {recommendationError}
            {recommendationSourceId && (
              <RecommendationRetryButton type="button" onClick={handleRecommendationRetry}>
                다시 시도
              </RecommendationRetryButton>
            )}
          </RecommendationStatus>
        ) : recommendations.length === 0 ? (
          <RecommendationStatus>
            아직 추천 결과가 없어요.
            {recommendationSourceId && (
              <RecommendationRetryButton type="button" onClick={handleRecommendationRetry}>
                다시 불러오기
              </RecommendationRetryButton>
            )}
          </RecommendationStatus>
        ) : (
          <RecommendationOptions
            recommendations={recommendations}
            highlightedRecommendation={highlightedRecommendation}
            onRecommendationSelect={handleRecommendationSelect}
          />
        )}
      </SelectUiBody>
    );
  }

  return (
    <SelectUiBody
      title={sharedTitle}
      description={sharedDescription}
      nextButtonLabel={currentQuestionIndex < QUESTIONS.length - 1 ? '다음으로' : '완료'}
      onNext={isChatMode ? () => {} : handleNext}
      options={isChatMode ? undefined : currentQuestion.options}
      onOptionButton={isChatMode ? undefined : handleOptionButton}
      selectedOption={isChatMode ? null : selectedOption}
      onChatButtonClick={isChatMode ? undefined : handleChatMode}
      isNextDisabled={isAwaitingAssistant}
      isActionHidden={isAwaitingAssistant}
      actionArea={
        isChatMode
          ? (
            <>
              <ChatInputRow $isHidden={isAwaitingAssistant}>
                <ChatTextInput
                  placeholder="원하는 여행을 말해보세요"
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  onKeyDown={handleChatInputKeyDown}
                  readOnly={isAwaitingAssistant}
                />
                <ChatSendButton type="button" onClick={handleSendChatMessage} disabled={!chatInput.trim() || isAwaitingAssistant}>
                  전송
                </ChatSendButton>
              </ChatInputRow>
              <ChatBackButton type="button" onClick={handleBackToSelect}>
                선택형 설문으로 돌아가기
              </ChatBackButton>
            </>
          )
          : undefined
      }
    >
      {isChatMode ? (
        <ChatWindow ref={chatContainerRef}>
          {chatMessages.map((message) => (
            <ChatBubble key={message.id} $variant="chat" $isUser={message.sender === 'user'}>
              {message.text}
            </ChatBubble>
          ))}
          {isAwaitingAssistant && (
            <TypingIndicator>
              <TypingDot style={{ animationDelay: '0s' }} />
              <TypingDot style={{ animationDelay: '0.15s' }} />
              <TypingDot style={{ animationDelay: '0.3s' }} />
            </TypingIndicator>
          )}
        </ChatWindow>
      ) : (
        <ChatContainer ref={chatContainerRef}>
          {chatMessages.map((message) => (
            <ChatBubble key={message.id} $variant="chat" $isUser={message.sender === 'user'}>
              {message.text}
            </ChatBubble>
          ))}
          {isAwaitingAssistant && (
            <TypingIndicator>
              <TypingDot style={{ animationDelay: '0s' }} />
              <TypingDot style={{ animationDelay: '0.15s' }} />
              <TypingDot style={{ animationDelay: '0.3s' }} />
            </TypingIndicator>
          )}
        </ChatContainer>
      )}
    </SelectUiBody>
  );
}

const bubbleSlideUp = keyframes`
  from {
    transform: translateY(12px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const ChatBubble = styled.div<{ $variant?: 'survey' | 'chat'; $isUser?: boolean }>`
  display: inline-flex;
  padding: 10px 20px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 10px;
  width: fit-content;
  max-width: 82%;
  word-break: break-word;
  font-weight: 600;
  font-family: "Wanted Sans";
  font-size: 14px;
  line-height: normal;
  animation: ${bubbleSlideUp} 0.35s ease-out forwards;
  opacity: 0;
  align-self: ${({ $variant, $isUser }) =>
    $variant === 'chat' ? ($isUser ? 'flex-end' : 'flex-start') : 'flex-end'};
  background: ${({ $variant, $isUser }) =>
    $variant === 'chat'
      ? $isUser
        ? '#EA8C98'
        : '#FFFFFF'
      : '#EA8C98'};
  color: ${({ $variant, $isUser }) =>
    $variant === 'chat' && !$isUser ? '#333' : '#FFF'};
  border: ${({ $variant, $isUser }) =>
    $variant === 'chat' && !$isUser ? '1px solid rgba(0, 0, 0, 0.08)' : 'none'};
  box-shadow: ${({ $variant }) =>
    $variant === 'chat' ? '0 6px 16px rgba(0, 0, 0, 0.08)' : 'none'};
`;

const ChatContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  gap: 0.75rem;
  overflow-y: auto;
  padding: 0 0.25rem;
`;

const ChatWindow = styled(ChatContainer)`
  padding: 0;
`;

const TypingIndicator = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 15px;
  min-height: 19px;
  max-height: 38px;
  border-radius: 10px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  animation: ${bubbleSlideUp} 0.35s ease-out forwards;
  opacity: 0;
  align-self: flex-start;
  width: fit-content;
  max-width: 82%;
`;

const typingPulse = keyframes`
  0% { transform: translateY(0); opacity: 0.6; }
  50% { transform: translateY(-4px); opacity: 1; }
  100% { transform: translateY(0); opacity: 0.6; }
`;

const TypingDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ea8c98;
  animation: ${typingPulse} 0.8s ease-in-out infinite;
`;

const ChatInputRow = styled.div<{ $isHidden?: boolean }>`
  width: 100%;
  display: flex;
  gap: 0.75rem;
  transition: transform 0.32s ease, opacity 0.32s ease;
  transform: translateY(${({ $isHidden }) => ($isHidden ? '100%' : '0')});
  opacity: ${({ $isHidden }) => ($isHidden ? 0 : 1)};
  pointer-events: ${({ $isHidden }) => ($isHidden ? 'none' : 'auto')};

  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const ChatTextInput = styled.input`
  flex: 1;
  border-radius: 14px;
  border: 1px solid #dcdcdc;
  padding: 0 1rem;
  height: 52px;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.9);

  &:focus {
    outline: 2px solid #EA8C98;
  }

  @media (max-width: 600px) {
    height: 48px;
  }
`;

const ChatSendButton = styled.button`
  border: 0;
  border-radius: 14px;
  padding: 0 1.5rem;
  min-width: 110px;
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  background: #EA8C98;
  cursor: pointer;
  transition: background 0.2s ease;
  height: 52px;

  &:hover:not(:disabled) {
    background: #E07A87;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 600px) {
    width: 100%;
    height: 48px;
  }
`;

const ChatBackButton = styled.button`
  border: 0;
  background: transparent;
  color: #F1F1F1;
  font-size: 0.9rem;
  cursor: pointer;
  align-self: center;
  text-decoration: underline;
  transition: opacity 0.2s ease;
  margin-top: 0.25rem;

  &:hover,
  &:focus-visible {
    opacity: 0.8;
  }
`;

const RecommendationStatus = styled.div`
  width: 100%;
  min-height: 200px;
  border-radius: 18px;
  border: 1px dashed rgba(255, 255, 255, 0.4);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  padding: 2rem 1rem;
  text-align: center;
`;

const RecommendationRetryButton = styled.button`
  border: 0;
  border-radius: 999px;
  padding: 0.4rem 1.25rem;
  background: rgba(234, 140, 152, 0.85);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.85;
  }
`;

const FinalWrapper = styled.div`
  width: min(960px, 100%);
  margin: 0 auto;
  padding: 3rem 1.5rem 4rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const FinalHeader = styled.header`
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
`;

const FinalBadge = styled.span`
  display: inline-flex;
  align-self: flex-start;
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  background: rgba(255, 150, 170, 0.2);
  color: #ff9db0;
  font-weight: 700;
`;

const FinalTitle = styled.h1`
  margin: 0;
  font-size: clamp(1.8rem, 4vw, 2.4rem);
  font-weight: 700;
`;

const FinalDescription = styled.p`
  margin: 0;
  color: rgba(255, 255, 255, 0.85);
  font-size: 1rem;
`;

const FinalTopRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.25rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const FinalMapCard = styled.div`
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.15);
  padding: 1.25rem;
  min-height: 420px;
  display: flex;
  flex-direction: column;
`;

const FinalMapStatus = styled.div`
  flex: 1;
  border-radius: 18px;
  border: 1px dashed rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.95rem;
  text-align: center;
  padding: 1.5rem;
`;

const PlannerAdjustCard = styled.div`
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const PlannerPrompt = styled.span`
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
`;

const PlannerBubble = styled.div`
  border-radius: 18px;
  background: #fff;
  color: #333;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  strong {
    font-size: 1rem;
  }

  p {
    margin: 0;
    font-size: 0.9rem;
    color: #555;
  }
`;

const PlannerActionButton = styled.button`
  align-self: flex-start;
  border: 0;
  border-radius: 999px;
  padding: 0.45rem 1.25rem;
  background: #ea8c98;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
`;

const DaysSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const DayCard = styled.section`
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.08);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const DayHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

const DayLabel = styled.span`
  font-size: 1.1rem;
  font-weight: 700;
`;

const DaySummary = styled.span`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
`;

const DayTimeline = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const TimelineItem = styled.div`
  display: grid;
  grid-template-columns: 36px 1fr;
  gap: 0.75rem;
  align-items: flex-start;
`;

const TimelineIndex = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #ff7495;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
`;

const TimelineBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
`;

const TimelineName = styled.span`
  font-size: 1rem;
  font-weight: 600;
`;

const TimelineMeta = styled.span`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
`;

const TimelineReason = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
`;

const EmptyPlansState = styled.div`
  border-radius: 24px;
  border: 1px dashed rgba(255, 255, 255, 0.3);
  padding: 2rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.75);
`;

const FinalActions = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
`;

const SecondaryButton = styled.button`
  border: 0;
  border-radius: 999px;
  padding: 0 1.5rem;
  height: 52px;
  font-size: 1rem;
  font-weight: 600;
  color: #ea8c98;
  background: rgba(234, 140, 152, 0.12);
  cursor: pointer;
`;

