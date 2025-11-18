import { useEffect, useRef, useState } from 'react';
import SelectUiBody from '@/components/common/SelectUiBody';
import styled, { keyframes } from 'styled-components';
import { postTraits, postPerpose, postPeople } from '@/services/api-util';

type Question = {
  title: string;
  description: string;
  options: Array<{ label: string }>;
  responseTemplate: (option: string) => string;
};

type ChatMessage = {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
};

const QUESTIONS: Question[] = [
  {
    title: "어느 나라를 좋아하시나요?",
    description: "원하시는 나라의 느낌을 선택해주세요.",
    options: [
      { label: "중앙아시아" },
      { label: "동남아시아" },
      { label: "북아메리카" },
      { label: "남아메리카" },
      { label: "유럽" },
      { label: "아프리카" }
    ],
    responseTemplate: (option) => `${option} 느낌으로 기록해둘게요!`,
  },
  {
    title: "어떤 분위기의 여행을 찾고 계신가요?",
    description: "지금 끌리는 키워드를 골라주세요.",
    options: [
      { label: "식사" },
      { label: "디저트" },
      { label: "자연" },
      { label: "익스트림" },
      { label: "도심" },
      { label: "시골" },
      { label: "바다" }
    ],
    responseTemplate: (option) => `${option} 분위기 체크 완료!`,
  },
  {
    title: "누구와 함께 떠나시나요?",
    description: "동행을 알려주시면 더 정확해져요.",
    options: [
      { label: "혼자" },
      { label: "친구와" },
      { label: "가족과" },
      { label: "연인과" }
    ],
    responseTemplate: (option) => `${option} 여행으로 추천 준비할게요.`,
  },
];

export default function QuestionPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatMode, setIsChatMode] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const currentQuestion = QUESTIONS[currentQuestionIndex];

  useEffect(() => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [chatMessages]);

  const handleOptionButton = (optionLabel: string) => {
    setSelectedOption(optionLabel);
  };

  const handleChatMode = () => {
    setChatMessages([]);
    setChatInput('');
    setIsChatMode(true);
  };

  const handleBackToSelect = () => {
    setChatMessages([]);
    setChatInput('');
    setIsChatMode(false);
  };

  const handleSendChatMessage = () => {
    const trimmed = chatInput.trim();
    if (!trimmed) return;

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
          text: `“${trimmed}”에 맞는 여행 아이디어를 준비 중이에요.`,
          sender: 'assistant',
        },
      ]);
    }, 350);
  };

  const handleChatInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSendChatMessage();
    }
  };

  const handleNext = () => {
    if (!selectedOption) return;

    setChatMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        text: currentQuestion.responseTemplate(selectedOption),
        sender: 'assistant',
      },
    ]);

    // Call server according to the question index
    (async () => {
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
                  text: '서버에 장소 정보가 저장되었습니다.',
                  sender: 'assistant',
                },
              ]);
              // store id in ref/state for next calls
              setApiRecordId(id);
            } else {
              setChatMessages((prev) => [
                ...prev,
                {
                  id: `${Date.now()}-server-warn`,
                  text: '서버 응답에서 id를 찾을 수 없습니다.',
                  sender: 'assistant',
                },
              ]);
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
          }
        } else if (currentQuestionIndex === 1) {
          // purpose/perpose
          const id = apiRecordIdRef.current;
          if (id) {
            const res = await postPerpose(selectedOption, id);
            if (res.status === 200) {
              setChatMessages((prev) => [
                ...prev,
                {
                  id: `${Date.now()}-server-success`,
                  text: '목적이 서버에 저장되었습니다.',
                  sender: 'assistant',
                },
              ]);
            } else {
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
                  text: '동행 정보가 서버에 저장되었습니다. 설문이 완료되었습니다.',
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
      }
    })();

    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      // 끝
      setSelectedOption(null);
    }
  };

  const [apiRecordId, setApiRecordId] = useState<string | null>(null);
  const apiRecordIdRef = useRef<string | null>(null);

  // keep ref in sync so async closures read the latest id
  useEffect(() => {
    apiRecordIdRef.current = apiRecordId;
  }, [apiRecordId]);

  const sharedTitle = isChatMode ? '챗봇과 대화하기' : currentQuestion.title;
  const sharedDescription = isChatMode ? 'AI 여행 플래너에게 바로 질문해보세요.' : currentQuestion.description;

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
      actionArea={
        isChatMode
          ? (
            <>
              <ChatInputRow>
                <ChatTextInput
                  placeholder="원하는 여행을 말해보세요"
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  onKeyDown={handleChatInputKeyDown}
                />
                <ChatSendButton type="button" onClick={handleSendChatMessage} disabled={!chatInput.trim()}>
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
        </ChatWindow>
      ) : (
        <ChatContainer ref={chatContainerRef}>
          {chatMessages.map((message) => (
            <ChatBubble key={message.id} $variant="survey">
              {message.text}
            </ChatBubble>
          ))}
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

const ChatInputRow = styled.div`
  width: 100%;
  display: flex;
  gap: 0.75rem;

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
