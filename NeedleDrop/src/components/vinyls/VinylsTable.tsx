import VinylTableWrapper from "./ui/VinylTableWrapper";
import { useVinylContext } from "@context/vinyl/VinylContext";

const VinylsTable = () => {
  const { vinyls } = useVinylContext();
  return <VinylTableWrapper vinyls={vinyls}/>
};

export default VinylsTable;