import { useEffect, useRef, useState } from 'react';
import SelectUiBody from '@/components/common/SelectUiBody';
import styled, { keyframes } from 'styled-components';

type Question = {
  title: string;
  description: string;
  options: Array<{ label: string }>;
  responseTemplate: (option: string) => string;
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
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; text: string }>>([]);
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

  const handleNext = () => {
    if (!selectedOption) return;

    setChatMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        text: currentQuestion.responseTemplate(selectedOption),
      },
    ]);

    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      console.log('설문 완료');
    }
  };

  return (
    <SelectUiBody
      title={currentQuestion.title}
      description={currentQuestion.description}
      nextButtonLabel={currentQuestionIndex < QUESTIONS.length - 1 ? '다음으로' : '완료'}
      onNext={handleNext}
      options={currentQuestion.options}
      onOptionButton={handleOptionButton}
      selectedOption={selectedOption}
    >
      <ChatContainer ref={chatContainerRef}>
        {chatMessages.map((message) => (
          <ChatBubble key={message.id}>{message.text}</ChatBubble>
        ))}
      </ChatContainer>
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

const ChatBubble = styled.div`
  display: inline-flex;
  padding: 10px 20px;
  justify-content: center;
  align-items: center;
  gap: 10px;

  border-radius: 10px;
  background: #EA8C98;

  color: #FFF;
  font-weight: 600;
  font-family: "Wanted Sans";
  font-size: 14px;
  font-style: normal;

  line-height: normal;

  animation: ${bubbleSlideUp} 0.35s ease-out forwards;
  opacity: 0;
`;

const ChatContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-end;
  gap: 0.75rem;
  overflow-y: auto;
  padding: 0 0.25rem;
`;
