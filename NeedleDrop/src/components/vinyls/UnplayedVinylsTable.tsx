import VinylTableWrapper from "./ui/VinylTableWrapper";
import { useVinylContext } from "@context/vinyl/VinylContext";

const UnplayedVinylsTable = () => {
  const { unplayedVinyls } = useVinylContext();
  return <VinylTableWrapper vinyls={unplayedVinyls} title="No unplayed vinyls!" />
};

export default UnplayedVinylsTable;