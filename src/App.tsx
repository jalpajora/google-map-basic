import React, { useState, useEffect, useMemo } from 'react';
// import logo from './logo.svg';
import './App.css';
import {
  GoogleMap,
  Marker,
  // DirectionsRenderer,
  // Circle,
  // MarkerClusterer,
  // Autocomplete,
  useLoadScript,
  // LoadScriptUrlOptions,
  InfoWindow,
} from '@react-google-maps/api';
// import AutoComplete from 'react-google-autocomplete';
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
  Suggestion,
} from 'use-places-autocomplete';

type LatLngLiteral = google.maps.LatLngLiteral;
type GeocoderResult = google.maps.GeocoderResult;
// const REACT_GOOGLE_MAP_API = process.env.REACT_GOOGLE_MAP_API;
const REACT_GOOGLE_MAP_API = 'AIzaSyCD4AHWO7Cc-Dm9nTzBjmpCfxKijBmqXu4';
// const center = { lat: 48.8584, lng: 2.2945 };

interface PinDetails {
  latLng: LatLngLiteral;
  result: GeocoderResult;
}

const MapInputAutoComplete: React.FC<{
  onComplete: (data: PinDetails) => void;
}> = ({ onComplete }) => {
  const {
    ready,
    value,
    suggestions: { data, loading, status },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    debounce: 500,
  });

  const handleSelect = async ({ description }: Suggestion) => {
    setValue(description, false);
    clearSuggestions();

    const results = await getGeocode({ address: description });
    const { lat, lng } = await getLatLng(results[0]);
    // results[0].address_components[0].long_name
    onComplete({
      latLng: { lat, lng },
      result: results[0],
    });
    // setOffice({ lat, lng });
  };

  console.log(data);
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    // Place a "string" to update the value of the input element
    setValue(e.target.value);
  };

  const renderSuggestions = () =>
    data.map((suggestion) => {
      const {
        place_id,
        structured_formatting: { main_text, secondary_text },
        description,
      } = suggestion;

      return (
        <li key={place_id} onClick={() => handleSelect(suggestion)}>
          <strong>{main_text}</strong> <small>{secondary_text}</small>
          <p>{description}</p>
        </li>
      );
    });

  return (
    <>
      <input
        type='text'
        placeholder='Search'
        value={value}
        onChange={handleChange}
      />
      {status === 'OK' && (
        <>
          <ul>{renderSuggestions()}</ul>
          <p>OK....</p>
        </>
      )}
    </>
  );
};

const Map: React.FC<{}> = () => {
  const [pin, setPin] = useState<LatLngLiteral>();
  const [pinDetails, setPinDetails] = useState<LatLngLiteral | null>();
  const [info, setInfo] = useState('');
  const [zoom, setZoom] = useState(5);
  const center = useMemo(
    () => pin || { lat: 14.4129931, lng: 120.9736786 },
    [pin]
  );

  // useMemo()
  // const originRef = useRef();
  // useEffect(() => {
  //   if (isLoaded) {
  //     const geocoder = new window.google.maps.Geocoder();
  //     geocoder.geocode(
  //       { address: '99 York St, Sydney, NSW' },
  //       function (results, status) {
  //         if (results) {
  //           console.log(results[0].geometry.location.lat());
  //           console.log(results[0].geometry.location.lng());
  //         } else {
  //           console.log('Nothing..');
  //         }
  //       }
  //     );
  //   }
  // }, [isLoaded]);

  // if (!isLoaded) {
  //   return null;
  // }

  useEffect(() => {
    if (pin) {
      setZoom(10);
    }
  }, [pin]);
  const handleAutoComplete = ({ latLng, result }: PinDetails) => {
    setPin(latLng);
    // results[0].address_components[0].long_name
    console.log(result);
    setInfo(result.formatted_address);
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div style={{ position: 'absolute', top: '0', zIndex: '1' }}>
        <MapInputAutoComplete onComplete={handleAutoComplete} />
        {/* <AutoComplete
          apiKey={REACT_GOOGLE_MAP_API}
          onPlaceSelected={(place) => console.log(place)}
        /> */}
        {/* <Autocomplete setAutocompleteCallback={() => {}}> */}
        {/* <input type='text' placeholder='Search' /> */}
        {/* </Autocomplete> */}
        {/* </AutoComplete> */}
      </div>
      <GoogleMap
        zoom={zoom}
        center={center}
        mapContainerClassName='map-container'
        // options={options}
        // onLoad={onLoad}
        // onZoomChanged
      >
        {pin && (
          <Marker
            position={pin}
            onClick={({ latLng }) => {
              console.log(latLng);
              if (latLng) {
                setPinDetails({
                  lat: latLng.lat(),
                  lng: latLng.lng(),
                });
              }
            }}
          >
            {pinDetails && (
              <InfoWindow
                onCloseClick={() => {
                  setPinDetails(null);
                }}
              >
                <div>{info}</div>
              </InfoWindow>
            )}
          </Marker>
        )}
      </GoogleMap>
    </div>
  );
};

function App() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: REACT_GOOGLE_MAP_API,
    libraries: ['places'],
  });

  return <div className='App'>{isLoaded && <Map />}</div>;
}

export default App;
