import React from 'react';
import styled from 'styled-components';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';


type Recommendation = {
  name: string;
  address: string;
  reason: string;
  latitude: number;
  longitude: number;
};

interface RecommendationOptionsProps {
  recommendations: Recommendation[];
  highlightedRecommendation: string | null;
  onRecommendationSelect: (place: Recommendation) => void;
}

const RecommendationOptions: React.FC<RecommendationOptionsProps> = ({
  recommendations,
  highlightedRecommendation,
  onRecommendationSelect,
}) => {
  return (
    <RecommendationGrid>
      {recommendations.map((place) => (
        <RecommendationCard
          key={place.name}
          $selected={highlightedRecommendation === place.name}
          onClick={() => onRecommendationSelect(place)}
        >
          <RecommendationWrapper>
            <MapContainer center={[place.latitude, place.longitude]} zoom={13} style={{ height: '100px', width: '100px', borderRadius:10, border:1, borderColor: "#ddd" }} zoomControl={false} scrollWheelZoom={false} >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[place.latitude, place.longitude]}/>
            </MapContainer>
          </RecommendationWrapper>
          <RecommendationWrapper>
            <RecommendationName>{place.name}</RecommendationName>
            <RecommendationCopy>{place.reason}</RecommendationCopy>
            <RecommendationAddress>{place.address}</RecommendationAddress>
          </RecommendationWrapper>
        </RecommendationCard>
      ))}
    </RecommendationGrid>
  );
};

const RecommendationGrid = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow-y: scroll;
  gap: 10px;
  
`;

const RecommendationCard = styled.button<{ $selected?: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;

  
  text-align: left;
  gap: 4px;
  
  background: transparent;
  border: 0;
  outline: none;
  padding: 8px;

  transition: background 0.25s ease;
  
  color: #000000;
  cursor: pointer;

  border-radius: 10px;

  ${(props)=>props.$selected && `
    background: rgba(255, 255, 255, 0.2); 
  `}
`;

const RecommendationWrapper = styled.button`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  gap: 4px;
  
  background: transparent;
  border: 0;
  outline: none;
  
  color: #000000;
  cursor: pointer;

`;

const RecommendationName = styled.h2`
  font-size: 22px;
  font-weight: 600;
  color: #EA8C98;
  margin: 0;
`;

const RecommendationAddress = styled.p`
  font-size: 0.9rem;
  color: #606060;
  margin: 0;
`;

const RecommendationCopy = styled.p`
  font-size: 0.95rem;
  line-height: 1.45;
  margin: 0;
  color: #000000;
`;

export default RecommendationOptions;
