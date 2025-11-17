import styled, { keyframes } from 'styled-components';
import Background from '@/components/common/Background'
import image from '@/assets/images/map-3d-image.png'
import logo from '@/assets/images/logo.png'
import Button from '@/components/common/Button'

export default function Root() {
  return (
    <Background>
      <ContentWrapper>
        <Logo src={logo} alt='logo'/>
        <LandImage src={image} alt="land" />
        <ButtonWrapper>
          <Button label='시작하기'/>
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

const LandImage = styled.img`
  width: 60%;
  max-width: 350px;
  height: auto;
  object-fit: contain;
  animation: ${slideUpFadeIn} 0.8s ease-out forwards;
  
  @media (max-width: 768px) {
    width: 85%;
    max-width: 400px;
  }
  
  @media (max-width: 480px) {
    width: 90%;
    max-width: 320px;
  }

  @media (max-height: 500px) {
    display: none;
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
`;
