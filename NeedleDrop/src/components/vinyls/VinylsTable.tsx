import Empty from "@components/ui/Empty";
import ReactTable from "@components/ui/tables/ReactTable";
import { checkComplete } from "./utils/CheckComplete";
import { useVinylContext } from "@context/vinyl/VinylContext";
import vinylColumns from "./VinylsTableColumns";

const VinylsTable = () => {
  const { vinyls } = useVinylContext();

  if (vinyls.length === 0) {
    return <Empty title="No Vinyls added yet!" />;
  }

  return (
    <ReactTable
      columns={vinylColumns}
      data={vinyls}
      settingsColumn="vinyls"
      getRowSx={(row) => checkComplete(row)}
    />
  );
};

export default VinylsTable;