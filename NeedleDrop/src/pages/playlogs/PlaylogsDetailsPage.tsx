import { Navigate, useParams } from "react-router-dom";
import PlaylogForm from "@components/playlog/PlaylogForm";
import SuspenseFormWrapper from "@components/ui/SuspenseFormWrapper";
import { usePlaylogContext } from "@context/playlogs/PlaylogContext";
import toast from "react-hot-toast";
import { useEffect } from "react";

const PlaylogDetailsPage = () => {
  const { id } = useParams();
  const { isLoading, getPlaylogById } = usePlaylogContext();
  const playlog = id ? getPlaylogById(Number(id)) : null;

  useEffect(() => {
    if (id && !isLoading && !playlog) {
      toast.error("The requested playlog could not be found.", {
        id: "missing-play-error",
      });
    }
  }, [id, isLoading, playlog]);

  if (id && isLoading) {
    return <SuspenseFormWrapper />;
  }

  if (id && !playlog) {
    return <Navigate to="/plays" replace />;
  }

  return (
    <PlaylogForm playlog={playlog} />
  );
};

export default PlaylogDetailsPage;
