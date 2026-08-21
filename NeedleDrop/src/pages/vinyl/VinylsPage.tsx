import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem, useMediaQuery, useTheme } from "@mui/material";

import ColumnFilterButton from "@components/ui/tables/ColumnFilterButton";
import ColumnVisibilityButton from "@components/ui/tables/ColumnVisibilityButton";
import DataTablePage from "@components/ui/DataTablePage";
import HearingDisabled from '@mui/icons-material/HearingDisabled';
import MoreHoriz from '@mui/icons-material/MoreHoriz';
import Person from '@mui/icons-material/Person';
import SuspenseTableWrapper from "@components/ui/SuspenseTableWrapper";
import UnplayedVinylsTable from "@components/vinyls/UnplayedVinylsTable";
import UserVinylsTable from "@components/vinyls/UserVinylsTable";
import VinylsTable from "@components/vinyls/VinylsTable";
import { useState } from "react";
import vinylColumns from "@components/vinyls/VinylsTableColumns";

const VinylsPage = () => {
  const [viewMode, setViewMode] = useState<"all" | "unplayed" | "user">("all");
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const showUnplayed = viewMode === "unplayed";
  const showUserVinyls = viewMode === "user";

  const toggleViewMode = (mode: "unplayed" | "user") => {
    setViewMode(viewMode === mode ? "all" : mode);
    setMenuAnchorEl(null);
  };

  return (
    <DataTablePage
      title={showUnplayed ? "Unplayed" : showUserVinyls ? "Vinyls (mine)" : "Vinyls"}
      headerActions={(
        <>
          {isMobile ? (
            <>
              <IconButton
                onClick={(event) => setMenuAnchorEl(event.currentTarget)}
                aria-label="Vinyl views"
                aria-controls={menuAnchorEl ? "vinyl-view-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={menuAnchorEl ? "true" : undefined}
              >
                <MoreHoriz />
              </IconButton>
              <Menu
                id="vinyl-view-menu"
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={() => setMenuAnchorEl(null)}
              >
                <MenuItem selected={showUnplayed} onClick={() => toggleViewMode("unplayed")}>
                  <ListItemIcon><HearingDisabled fontSize="small" /></ListItemIcon>
                  <ListItemText>{showUnplayed ? "Show all vinyls" : "Show unplayed only"}</ListItemText>
                </MenuItem>
                <MenuItem selected={showUserVinyls} onClick={() => toggleViewMode("user")}>
                  <ListItemIcon><Person fontSize="small" /></ListItemIcon>
                  <ListItemText>{showUserVinyls ? "Show all vinyls" : "Show your plays"}</ListItemText>
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <IconButton
                onClick={() => toggleViewMode("unplayed")}
                color={showUnplayed ? "primary" : "default"}
                title={showUnplayed ? "Showing unplayed only" : "Show unplayed only"}
              >
                <HearingDisabled />
              </IconButton>
              <IconButton
                onClick={() => toggleViewMode("user")}
                color={showUserVinyls ? "primary" : "default"}
                title={showUserVinyls ? "Showing your plays" : "Show your plays"}
              >
                <Person />
              </IconButton>
            </>
          )}
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
