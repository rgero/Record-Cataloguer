import { Box, Grid, IconButton, List, ListItemButton, ListItemText, Paper, TextField } from '@mui/material';
import { Map, Marker, useApiIsLoaded, useMap } from '@vis.gl/react-google-maps';
import { useCallback, useEffect, useRef, useState } from 'react';

import OpenInNewIcon from '@mui/icons-material/OpenInNew';

interface AddressSearchMapProps {
  initialAddress: string | null;
  onAddressSelect: (address: string, lat: number, lng: number) => void;
  disabled: boolean;
  error?: boolean;
  helperText?: string;
}

export const AddressSearchMap = ({ initialAddress, onAddressSelect, disabled, error = false, helperText }: AddressSearchMapProps) => {
  const map = useMap();
  const apiIsLoaded = useApiIsLoaded();
  
  const [inputValue, setInputValue] = useState(initialAddress ?? "");
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompleteSuggestion[]>([]);
  const [coords, setCoords] = useState({ lat: 40.7128, lng: -74.0060 });

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionToken = useRef<google.maps.places.AutocompleteSessionToken | null>(null);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current !== null) {
        window.clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const getSessionToken = useCallback(() => {
    if (!sessionToken.current && window.google) {
      sessionToken.current = new window.google.maps.places.AutocompleteSessionToken();
    }
    return sessionToken.current;
  }, []);

  useEffect(() => {
    setInputValue(initialAddress ?? "");
  }, [initialAddress]);

  const fetchSuggestions = useCallback(async (text: string) => {
    if (!text || text.length < 3 || !apiIsLoaded || !window.google) {
      setSuggestions([]);
      return;
    }

    try {
      const token = getSessionToken();
      const { suggestions } = await window.google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input: text,
        sessionToken: token || undefined,
      });

      setSuggestions(suggestions);
    } catch (e) {
      console.error("New Places API Error:", e);
    }
  }, [apiIsLoaded, getSessionToken]);

  const handleSelect = async (suggestion: google.maps.places.AutocompleteSuggestion) => {
    const description = suggestion.placePrediction?.text.toString() || "";
    setInputValue(description);
    setSuggestions([]);

    if (apiIsLoaded && suggestion.placePrediction && window.google) {
      try {
        const place = await suggestion.placePrediction.toPlace();
        await place.fetchFields({ fields: ['location'] });
        
        if (place.location) {
          const newCoords = { 
            lat: place.location.lat(), 
            lng: place.location.lng() 
          };
          
          setCoords(newCoords);
          onAddressSelect(description, newCoords.lat, newCoords.lng);
          
          if (map) {
            map.panTo(newCoords);
            map.setZoom(17);
          }
        }
        sessionToken.current = null;
      } catch (error) {
        console.error("Selection/Geocoding error:", error);
      }
    }
  };

  useEffect(() => {
    if (initialAddress && apiIsLoaded && map && window.google) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: initialAddress }, (results, status) => {
        if (status === "OK" && results?.[0].geometry.location) {
          const loc = results[0].geometry.location;
          const newCoords = { lat: loc.lat(), lng: loc.lng() };
          setCoords(newCoords);
          map.setCenter(newCoords);
        }
      });
    }
  }, [initialAddress, apiIsLoaded, map]);

  if (!apiIsLoaded) return <div>Loading Google Maps...</div>;

  const handleOpenInMaps = () => {
    const encodedAddress = encodeURIComponent(inputValue);
    const url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  
  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <Grid
        container
        spacing={0}
        sx={{
          alignItems: "center",
          mb: 1
        }}>
        <Grid size={11}>
          <TextField
            fullWidth
            value={inputValue}
            disabled={disabled}
            error={error}
            helperText={helperText}
            autoComplete="off"
            onChange={(e) => {
              const nextValue = e.target.value;
              setInputValue(nextValue);

              if (searchTimeoutRef.current !== null) {
                window.clearTimeout(searchTimeoutRef.current);
              }

              searchTimeoutRef.current = window.setTimeout(() => {
                fetchSuggestions(nextValue);
              }, 300);
            }}
            placeholder="Start typing an address..."
          />
        </Grid>
        <Grid size={1}>
          <IconButton
            size="large" 
            color="primary"
            onClick={handleOpenInMaps}
          >
            <OpenInNewIcon />
          </IconButton>
        </Grid>
      </Grid>
      {suggestions.length > 0 && (
        <Paper sx={{ position: 'absolute', zIndex: 10, width: '100%', mt: 1, maxHeight: 250, overflow: 'auto' }}>
          <List>
            {suggestions.map((s, i) => (
              <ListItemButton key={i} onClick={() => handleSelect(s)}>
                <ListItemText primary={s.placePrediction?.text.toString()} />
              </ListItemButton>
            ))}
          </List>
        </Paper>
      )}
      <Box sx={{ height: '300px', width: '100%', mt: 2, borderRadius: 1, overflow: 'hidden', border: '1px solid #ccc' }}>
        <Map center={coords} defaultZoom={15} gestureHandling={'none'}>
          <Marker position={coords} />
        </Map>
      </Box>
    </Box>
  );
};