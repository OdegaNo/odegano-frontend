import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  * {
    font-family: "Wanted Sans", sans-serif;
  }

  body {
    padding: 0;
    margin: 0;
  }
  .leaflet-control-attribution{
    display: none;
  }
`;

export default GlobalStyle;

