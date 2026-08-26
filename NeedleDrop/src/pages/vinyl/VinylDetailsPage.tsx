import { Navigate, useParams } from "react-router-dom";

import SuspenseFormWrapper from "@components/ui/SuspenseFormWrapper";
import VinylForm from "@components/vinyls/VinylForm";
import toast from "react-hot-toast";
import { useEffect } from "react";
import { useVinylContext } from "@context/vinyl/VinylContext";

const VinylDetailsPage = () => {
  const { id } = useParams();
  const { isLoading, getVinylById } = useVinylContext();
  const vinyl = id ? getVinylById(Number(id)) : null;

  useEffect(() => {
    if (id && !isLoading && !vinyl) {
      toast.error("The requested vinyl record could not be found.", {
        id: "missing-vinyl-error",
      });
    }
  }, [id, isLoading, vinyl]);

  if (!id) {
    return <VinylForm />;
  }

  if (isLoading) {
    return <SuspenseFormWrapper />;
  }

  if (!vinyl) {
    return <Navigate to="/vinyls" replace />;
  }

  return (
    <VinylForm vinyl={vinyl} />
  );
};

export default VinylDetailsPage;
