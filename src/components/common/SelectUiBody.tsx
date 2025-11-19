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
  isActionHidden?: boolean;
  optionVariant?: 'chip' | 'card';
  contentMinHeight?: string;
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
  const optionVariant = props.optionVariant ?? 'chip';
  const contentMinHeight = props.contentMinHeight ?? '55vh';

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
        <Content $minHeight={contentMinHeight}>
          {props.children}
        </Content>
        {props.contentFooter}
        <ButtonWrapper $isHidden={props.isActionHidden}>
          {props.actionArea ?? (
            <>
              {props.options &&
                <ChoiceOptionWrapper $variant={optionVariant}>
                  {props.options.map((option, index) => (
                    <ChoiceOptionButton
                      key={index}
                      onClick={() => handleOptionClick(option.label)}
                      selected={props.selectedOption === option.label}
                      $variant={optionVariant}
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

const ButtonWrapper = styled.div<{ $isHidden?: boolean }>`
  width: 100%;
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: stretch;
  gap: 1rem;
  transition: opacity 0.32s ease, transform 0.32s ease;
  transform: translateY(${({ $isHidden }) => ($isHidden ? '70px' : '0')});
  opacity: ${({ $isHidden }) => ($isHidden ? 0 : 1)};
  pointer-events: ${({ $isHidden }) => ($isHidden ? 'none' : 'auto')};
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

const Content = styled.div<{ $minHeight: string }>`
  width: 100%;
  min-height: ${({ $minHeight }) => $minHeight};
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

interface ChoiceOptionWrapperProps {
  $variant: 'chip' | 'card';
}

const ChoiceOptionWrapper = styled.div<ChoiceOptionWrapperProps>`
  ${({ $variant }) => $variant === 'card'
    ? `
      display: flex;
      flex-direction: column;
      gap: 12px;
      width: 100%;
      max-height: 280px;
      overflow-y: auto;
      padding-right: 4px;
      scrollbar-width: thin;
    `
    : `
      display: flex;
      flex-direction: row;
      gap: 10px;
      overflow-x: auto;
      white-space: nowrap;
      padding-bottom: 4px;
      max-width: 100%;
    `}

  &::-webkit-scrollbar {
    ${({ $variant }) => ($variant === 'card' ? 'width: 6px;' : 'height: 6px;')}
  }

  &::-webkit-scrollbar-thumb {
    ${({ $variant }) => ($variant === 'card'
      ? 'background: rgba(255, 255, 255, 0.25); border-radius: 999px;'
      : 'background: rgba(0, 0, 0, 0.15); border-radius: 3px;')}
  }
`;

interface ChoiceOptionButtonProps {
  selected: boolean;
  $variant: 'chip' | 'card';
}

const ChoiceOptionButton = styled.button<ChoiceOptionButtonProps>`
  ${({ $variant, selected }) => $variant === 'card'
    ? `
      position: relative;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      width: 100%;
      padding: 1rem 1.5rem;
      border-radius: 16px;
      border: 1px solid ${selected ? '#EA8C98' : 'rgba(255, 255, 255, 0.22)'};
      background: ${selected ? 'rgba(234, 140, 152, 0.25)' : 'rgba(255, 255, 255, 0.08)'};
      box-shadow: ${selected ? '0 12px 26px rgba(234, 140, 152, 0.25)' : '0 8px 18px rgba(0, 0, 0, 0.15)'};
      color: #fff;
      font-weight: 600;
      font-family: "Wanted Sans";
      font-size: 0.95rem;
      line-height: 1.3;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease, border 0.2s ease, background 0.2s ease;
      text-align: left;

      &:hover {
        transform: translateY(-2px);
        border-color: #EA8C98;
      }

      &::before {
        content: '';
        width: 10px;
        height: 10px;
        border-radius: 50%;
        border: 2px solid ${selected ? '#EA8C98' : 'rgba(255, 255, 255, 0.4)'};
        background: ${selected ? '#EA8C98' : 'transparent'};
        flex-shrink: 0;
        transition: background 0.2s ease, border 0.2s ease;
      }

      @media (max-width: 600px) {
        font-size: 0.9rem;
        padding: 0.9rem 1.25rem;
      }
    `
    : `
      display: inline-flex;
      padding: 10px 20px;
      justify-content: center;
      align-items: center;
      gap: 10px;
      border: 0;
      border-radius: 10px;
      background: ${selected ? '#EA8C98' : '#F6D7DB'};
      color: ${selected ? '#FFF' : '#484848'};
      font-weight: ${selected ? '600' : '500'};
      font-family: "Wanted Sans";
      font-size: 14px;
      line-height: normal;
      transition: 0.3s background;
    `}
`