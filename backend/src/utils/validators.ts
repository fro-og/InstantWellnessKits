// check if coordinates are within New York state bounds
export const isWithinNewYork = (lat: number, lon: number): boolean => {
  const NY_BOUNDS = {
    minLat: 40.4,
    maxLat: 45.0,
    minLng: -79.8,
    maxLng: -71.8
  };
  
  return (
    lat >= NY_BOUNDS.minLat &&
    lat <= NY_BOUNDS.maxLat &&
    lon >= NY_BOUNDS.minLng &&
    lon <= NY_BOUNDS.maxLng
  );
};

export const validateCoordinates = (lat: number, lon: number): string | null => {
  if (isNaN(lat) || isNaN(lon)) {
    return 'Invalid coordinates: not a number';
  }
  
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return 'Invalid coordinates: out of range';
  }
  
  if (!isWithinNewYork(lat, lon)) {
    return 'Coordinates must be within New York state';
  }
  
  return null;
};