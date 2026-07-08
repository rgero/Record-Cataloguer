import ColumnFilterButton from "@components/ui/tables/ColumnFilterButton";
import ColumnVisibilityButton from "@components/ui/tables/ColumnVisibilityButton";
import DataTablePage from "@components/ui/DataTablePage";
import { IconButton } from "@mui/material";
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import SuspenseTableWrapper from "@components/ui/SuspenseTableWrapper";
import UnplayedVinylsTable from "@components/vinyls/UnplayedVinylsTable";
import VinylsTable from "@components/vinyls/VinylsTable";
import { useState } from "react";
import vinylColumns from "@components/vinyls/VinylsTableColumns";

const VinylsPage = () => {
  const [showUnplayed, setShowUnplayed] = useState(false);

  return (
    <DataTablePage
      title={showUnplayed ? "Unplayed Vinyls" : "Vinyls"}
      headerActions={(
        <>
          <IconButton 
            onClick={() => setShowUnplayed(!showUnplayed)}
            color={showUnplayed ? "primary" : "default"}
            title={showUnplayed ? "Showing unplayed only" : "Show all vinyls"}
          >
            <NewReleasesIcon />
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
        {showUnplayed ? <UnplayedVinylsTable /> : <VinylsTable />}
      </SuspenseTableWrapper>
    </DataTablePage>
  )
}

export default VinylsPage
