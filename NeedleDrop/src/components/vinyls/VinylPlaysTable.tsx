import { Stack, Typography } from "@mui/material";

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

  if (data.length === 0) {
    return null;
  }

  return (
    <Stack spacing={2} sx={{  width: { xs: "90%", lg: "60%" }, maxWidth: 600, display: "flex", alignItems: "center", marginTop: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: "bold", alignSelf: "flex-start" }}>Listen History</Typography>
      <TwoColumnPaginatedTable
        data={data}
        primaryKey="date"
        secondaryKey="listeners"
        sortKey="date"
        primaryHeader="Date"
        secondaryHeader="Listeners"
        getRowKey={(item) => item.date.toISOString()}
        renderPrimary={(item) => format(item.date, "yyyy-MM-dd")}
      />
    </Stack>
  );
}

export default VinylPlaysTable
