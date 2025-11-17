import styled, { keyframes } from 'styled-components';

interface ButtonProps {
    label: string;
    disabled?: boolean;
    onClick?: () => void;
}

export default function Button({ label, disabled, onClick }: ButtonProps) {
    return (
        <ButtonContainer onClick={onClick} disabled={disabled}>
            {label}
        </ButtonContainer>
    )
}

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const ButtonContainer = styled.button<{ disabled?: boolean }>`
  padding: 20px;
  width: 100%;

  border-radius: 10px;
  
  border: 0;
  color: white;

  font-size: 1em;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  animation: ${fadeIn} 0.5s ease-out 0.4s forwards;
  opacity: 0;
  

  ${props => props.disabled ? `
    background: #F0ADB6;
    cursor: not-allowed;
  ` : `
    background: #EA8C98;
    
    &:hover {
      background: #e07a87;
    }
    
    @media (max-width: 768px) {
      padding: 18px;
      font-size: 0.95em;
    }
    
    @media (max-width: 480px) {
      padding: 16px;
      font-size: 0.9em;
      border-radius: 8px;
    }

  `}
  
`;
