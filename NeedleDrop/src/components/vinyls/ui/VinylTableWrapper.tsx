import Empty from "@components/ui/Empty";
import ReactTable from "@components/ui/tables/ReactTable";
import type { Vinyl } from "@interfaces/Vinyl";
import { checkComplete } from "../utils/CheckComplete";
import vinylColumns from "../VinylsTableColumns";

const VinylTableWrapper = ({vinyls, title} : {vinyls: Vinyl[], title?: string}) => {
  if (vinyls.length === 0) {
    return <Empty title={title || "No Vinyls added yet!"} />;
  }

  return (
    <ReactTable
      columns={vinylColumns}
      data={vinyls}
      settingsColumn="vinyls"
      getRowSx={(row) => checkComplete(row)}
    />
  );
}

export default VinylTableWrapper
