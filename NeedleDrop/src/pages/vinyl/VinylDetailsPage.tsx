import { Navigate, useParams } from "react-router-dom";

import { Stack } from "@mui/material";
import SuspenseFormWrapper from "@components/ui/SuspenseFormWrapper";
import VinylForm from "@components/vinyls/VinylForm";
import VinylPlaysTable from "@components/vinyls/VinylPlaysTable";
import toast from "react-hot-toast";
import { useEffect } from "react";
import { usePlaylogContext } from "@context/playlogs/PlaylogContext";
import { useVinylContext } from "@context/vinyl/VinylContext";

const VinylDetailsPage = () => {
  const { id } = useParams();
  const { isLoading, getVinylById } = useVinylContext();
  const { getPlaylogsByAlbumId } = usePlaylogContext();
  const vinyl = id ? getVinylById(Number(id)) : null;

  const playlogs = id ? getPlaylogsByAlbumId(Number(id)) : [];

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
    <Stack spacing={4} sx={{ alignItems: "center", justifyContent: "center", paddingBottom: 10 }}>
      <VinylForm vinyl={vinyl} />
      <VinylPlaysTable playlogs={playlogs} />
    </Stack>
  );
};

export default VinylDetailsPage;
