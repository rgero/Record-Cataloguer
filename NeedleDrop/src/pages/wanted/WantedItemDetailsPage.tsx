import { Navigate, useParams } from "react-router-dom";
import WantItemForm from "@components/wanted/WantItemForm";
import SuspenseFormWrapper from "@components/ui/SuspenseFormWrapper";
import { useWantedItemContext } from "@context/wanted/WantedItemContext";
import toast from "react-hot-toast";
import { useEffect } from "react";

const WantedItemDetailsPage = () => {
  const { id } = useParams();
  const { isLoading, getWantedItemById } = useWantedItemContext();
  const wantedItem = id ? getWantedItemById(Number(id)) : null;

  useEffect(() => {
    if (id && !isLoading && !wantedItem) {
      toast.error("The requested wanted item could not be found.", {
        id: "missing-want-error",
      });
    }
  }, [id, isLoading, wantedItem]);

  if (id && isLoading) {
    return <SuspenseFormWrapper />;
  }

  if (id && !wantedItem) {
    return <Navigate to="/wantlist" replace />;
  }

  return (
    <WantItemForm wantedItem={wantedItem} />
  );
};

export default WantedItemDetailsPage;
