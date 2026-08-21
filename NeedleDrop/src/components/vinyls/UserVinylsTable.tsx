import VinylTableWrapper from "./ui/VinylTableWrapper";
import { useVinylContext } from "@context/vinyl/VinylContext";

const UserVinylsTable = () => {
  const { userVinyls } = useVinylContext();
  return <VinylTableWrapper vinyls={userVinyls} />
};

export default UserVinylsTable;