import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router';
import Background from '@/components/common/Background'
import logo from '@/assets/images/logo.png'
import Button from '@/components/common/Button'

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Background>
      <ContentWrapper>
        <Logo src={logo} alt='logo'/>
        <ErrorCode>404</ErrorCode>
        <ErrorMessage>페이지를 찾을 수 없습니다</ErrorMessage>
        <Description>요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.</Description>
        <ButtonWrapper>
          <Button label='홈으로 돌아가기' onClick={() => navigate('/')}/>
        </ButtonWrapper>
      </ContentWrapper>
    </Background>
  )
}

const slideUpFadeIn = keyframes`
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const Logo = styled.img`
  width: 38%;
  max-width: 512px;
  min-width: 200px;
  height: auto;
  object-fit: contain;
  display: block;
  margin-bottom: 2rem;
  animation: ${slideUpFadeIn} 0.8s ease-out forwards;
  
  @media (max-width: 768px) {
    width: 60%;
    max-width: 400px;
    min-width: 180px;
    margin-bottom: 1.5rem;
  }
  
  @media (max-width: 480px) {
    width: 70%;
    max-width: 300px;
    min-width: 150px;
    margin-bottom: 1rem;
  }
`;

const ErrorCode = styled.h1`
  font-size: 8rem;
  font-weight: 700;
  color: #EA8C98;
  margin: 1rem 0;
  animation: ${slideUpFadeIn} 0.8s ease-out 0.2s forwards;
  opacity: 0;
  
  @media (max-width: 768px) {
    font-size: 6rem;
  }
  
  @media (max-width: 480px) {
    display: none;
  }
`;

const ErrorMessage = styled.h2`
  font-size: 2rem;
  font-weight: 600;
  color: #333;
  margin: 0.5rem 0;
  animation: ${fadeIn} 0.8s ease-out 0.6s forwards;
  opacity: 0;
  
  @media (max-width: 480px) {
    display: none;
  }
`;

const Description = styled.p`
  font-size: 1rem;
  color: #666;
  margin: 1rem 0 2rem 0;
  text-align: center;
  animation: ${fadeIn} 0.8s ease-out 0.6s forwards;
  opacity: 0;
  
  @media (max-width: 480px) {
    display: none;
  }
`;

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
  animation: ${fadeIn} 0.8s ease-out 0.8s forwards;
  opacity: 0;

`;

