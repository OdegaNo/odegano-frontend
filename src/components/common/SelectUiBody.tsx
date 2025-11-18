import styled from 'styled-components';
import Background from '@/components/common/Background'

import Button from '@/components/common/Button'

import logo from '@/assets/images/logo.png'

interface SelectUiBodyProps {
  title: string;
  description: string;
  nextButtonLabel: string;
  onNext: () => void;
  options?: Array<{ label: string }>;
  onOptionButton?: (option: string) => void;
  children?: React.ReactNode;
  selectedOption?: string | null;
  onChatButtonClick?: () => void;
  actionArea?: React.ReactNode;
  contentFooter?: React.ReactNode;
  chatToggleLabel?: string;
  isNextDisabled?: boolean;
}

export default function SelectUiBody(
  props: SelectUiBodyProps
) {
  const handleOptionClick = (optionLabel: string) => {
    props.onOptionButton?.(optionLabel);
  };

  const disableNext =
    props.options && props.options.length > 0
      ? !props.selectedOption
      : false;

  const nextDisabled = props.isNextDisabled ?? disableNext;

  return (
    <Background>
      <ContentWrapper>
        <Header>
          <Logo src={logo} alt="Logo" />
          <Title>
            {props.title}
          </Title>
          <Description>
            {props.description}
          </Description>
        </Header>
        <Content>
          {props.children}
        </Content>
        {props.contentFooter}
        <ButtonWrapper>
          {props.actionArea ?? (
            <>
              {props.options &&
                <ChoiceOptionWrapper>
                  {props.options.map((option, index) => (
                    <ChoiceOptionButton
                      key={index}
                      onClick={() => handleOptionClick(option.label)}
                      selected={props.selectedOption === option.label}
                    >
                      {option.label}
                    </ChoiceOptionButton>
                  ))}
                </ChoiceOptionWrapper>
              }
              <Button
                label={props.nextButtonLabel}
                onClick={props.onNext}
                disabled={nextDisabled}
              />
              {props.onChatButtonClick && (
                <ChatToggleButton type="button" onClick={props.onChatButtonClick}>
                  {props.chatToggleLabel ?? '또는 챗봇이랑 대화하기'}
                </ChatToggleButton>
              )}
            </>
          )}
        </ButtonWrapper>
      </ContentWrapper>
    </Background>
  )
}


const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    gap: 1.25rem;
  }
  
  @media (max-width: 480px) {
    gap: 1rem;
  }
`;

const ButtonWrapper = styled.div`
  width: 100%;
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: stretch;
  gap: 1rem;
`;


const Logo = styled.img`
  width: 112px;
  height: auto;
  object-fit: contain;
  display: block;
  margin-bottom: 2rem;

`;

const Header = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column; 
`

const Title = styled.span`
  font-size: 3vh;
  font-weight: 600;
`

const Description = styled.div`
  font-size: 2vh;
  color: #666;
`

const Content = styled.div`
  width: 100%;
  height: 55vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`;

const ChatToggleButton = styled.button`
  border: 0;
  background: transparent;
  color: #F1F1F1;
  font-size: 14px;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
  transition: opacity 0.2s ease;

  &:hover,
  &:focus-visible {
    opacity: 0.8;
  }
`;

const ChoiceOptionWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
  overflow-x: auto;
  white-space: nowrap;
  padding-bottom: 4px;

  max-width: 100%;

  &::-webkit-scrollbar {
    height: 6px;
  }
`;

interface ChoiceOptionButtonProps {
  selected: boolean;
}

const ChoiceOptionButton = styled.button<ChoiceOptionButtonProps>`
  display: inline-flex;
  padding: 10px 20px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border: 0;
  border-radius: 10px;
  background: ${props => props.selected ? '#EA8C98' : '#F6D7DB'};


  color: ${props => props.selected ? '#FFF' : '#484848'};
  font-weight: ${props => props.selected ? '600' : '500'};
  font-family: "Wanted Sans";
  font-size: 14px;
  font-style: normal;
  
  line-height: normal;

  transition: 0.5s background;
`