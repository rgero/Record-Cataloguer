import Empty from "@components/ui/Empty";
import ReactTable from "@components/ui/tables/ReactTable";
import { checkComplete } from "./utils/CheckComplete";
import { useVinylContext } from "@context/vinyl/VinylContext";
import vinylColumns from "./VinylsTableColumns";

const UserVinylsTable = () => {
  const { userVinyls } = useVinylContext();

  if (userVinyls.length === 0) {
    return <Empty title="You haven't played any vinyls yet!" />;
  }

  return (
    <ReactTable
      data={userVinyls}
      columns={vinylColumns}
      settingsColumn="vinyls"
      getRowSx={(row) => checkComplete(row)}
    />
  );
};

export default UserVinylsTable;