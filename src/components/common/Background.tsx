import styled from 'styled-components';
import character from '@/assets/images/character.png'

export default function Background({ children }: { children: React.ReactNode }) {
    return (
        <Body>
            <Container>
                {children}
            </Container>
            <Image src={character} alt="Character" />
            <GradientBackground />
        </Body>
    )
}

const Body = styled.div`
  background-color: #EEF0F4;
  position: fixed;
  width: 100%;
  height: 100vh;
`;

const Container = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 800px;
  
  min-height: 100%;
  height: 100%;
  margin: 0 auto;
  
  display: flex;
  align-items: center;
  justify-content: center;

  flex-direction: column;
  
  box-sizing: border-box;
  padding: 2rem 1.5rem;
  
  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
    justify-content: center;
  }
  
  @media (max-width: 480px) {
    padding: 1rem 0.75rem;
    justify-content: center;
  }
`;

const GradientBackground = styled.div`
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.00) 0%, #E5AFB6 100%);
  width: 100%;
  height: 100%;
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 0;
`;

const Image = styled.img`
  position: absolute;
  bottom: 0;
  right: 0;
  height: 70%;

  @media (max-width: 768px) {
    height: 50%;
  }

`