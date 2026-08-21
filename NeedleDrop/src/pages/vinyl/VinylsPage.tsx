import ColumnFilterButton from "@components/ui/tables/ColumnFilterButton";
import ColumnVisibilityButton from "@components/ui/tables/ColumnVisibilityButton";
import DataTablePage from "@components/ui/DataTablePage";
import HearingDisabled from '@mui/icons-material/HearingDisabled';
import { IconButton } from "@mui/material";
import Person from '@mui/icons-material/Person';
import SuspenseTableWrapper from "@components/ui/SuspenseTableWrapper";
import UnplayedVinylsTable from "@components/vinyls/UnplayedVinylsTable";
import UserVinylsTable from "@components/vinyls/UserVinylsTable";
import VinylsTable from "@components/vinyls/VinylsTable";
import { useState } from "react";
import vinylColumns from "@components/vinyls/VinylsTableColumns";

const VinylsPage = () => {
  const [viewMode, setViewMode] = useState<"all" | "unplayed" | "user">("all");
  const showUnplayed = viewMode === "unplayed";
  const showUserVinyls = viewMode === "user";

  return (
    <DataTablePage
      title={showUnplayed ? "Unplayed" : showUserVinyls ? "My Plays" : "Vinyls"}
      headerActions={(
        <>
          <IconButton 
            onClick={() => setViewMode(showUnplayed ? "all" : "unplayed")}
            color={showUnplayed ? "primary" : "default"}
            title={showUnplayed ? "Showing unplayed only" : "Show all vinyls"}
          >
            <HearingDisabled />
          </IconButton>
          <IconButton
            onClick={() => setViewMode(showUserVinyls ? "all" : "user")}
            color={showUserVinyls ? "primary" : "default"}
            title={showUserVinyls ? "Showing your plays" : "Show your plays"}
          >
            <Person />
          </IconButton>
          <ColumnVisibilityButton
            columns={vinylColumns}
            settingsColumn="vinyls"
          />
          <ColumnFilterButton columns={vinylColumns} />
        </>
      )}
    >
      <SuspenseTableWrapper>
        {showUnplayed ? <UnplayedVinylsTable /> : showUserVinyls ? <UserVinylsTable /> : <VinylsTable />}
      </SuspenseTableWrapper>
    </DataTablePage>
  )
}

export default VinylsPage
