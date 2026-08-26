import { Navigate, useParams } from "react-router-dom";
import LocationForm from "@components/locations/LocationForm";
import SuspenseFormWrapper from "@components/ui/SuspenseFormWrapper";
import { useLocationContext } from "@context/location/LocationContext";
import toast from "react-hot-toast";
import { useEffect } from "react";

const LocationDetailsPage = () => {
  const { id } = useParams();
  const { isLoading, getLocationById } = useLocationContext();
  const location = id ? getLocationById(Number(id)) : null;

  useEffect(() => {
    if (id && !isLoading && !location) {
      toast.error("The requested location could not be found.", {
        id: "missing-location-error",
      });
    }
  }, [id, isLoading, location]);

  if (id && isLoading) {
    return <SuspenseFormWrapper />;
  }

  if (id && !location) {
    return <Navigate to="/locations" replace />;
  }

  return (
    <LocationForm location={location} />
  );
};

export default LocationDetailsPage;
