import type { PlayLog } from "@interfaces/PlayLog"
import TwoColumnPaginatedTable from "@components/ui/tables/TwoColumnPaginatedTable";
import { format } from "date-fns";

interface PlaylogRow {
  date: Date;
  listeners: string;
}

const VinylPlaysTable = ({playlogs} : {playlogs: PlayLog[]}) => {
  const data: PlaylogRow[] = playlogs.map((log) => ({
    date: log.date,
    listeners: log.listeners.map((listener) => listener.name).join(", "),
  }));

  return (
    <TwoColumnPaginatedTable
      data={data}
      primaryKey="date"
      secondaryKey="listeners"
      sortKey="date"
      primaryHeader="Date"
      secondaryHeader="Listeners"
      getRowKey={(item) => item.date.toISOString()}
      renderPrimary={(item) => format(item.date, "yyyy-MM-dd")}
      containerSx={{ width: { xs: "90%", lg: "45%" }, maxWidth: '100%' }}
    />
  );
}

export default VinylPlaysTable
