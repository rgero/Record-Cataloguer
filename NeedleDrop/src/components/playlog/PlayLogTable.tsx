import { PlayLogTableColumnDef } from "./PlayLogTableColumnDef";
import ReactTable from "@components/ui/tables/ReactTable";
import { usePlaylogContext } from "@context/playlogs/PlaylogContext";

const PlaylogsTable = () => {
  const { playlogs } = usePlaylogContext();

  return (
    <ReactTable
      columns={PlayLogTableColumnDef}
      data={playlogs}
      settingsColumn="playlogs"
    />
  );
};

export default PlaylogsTable;