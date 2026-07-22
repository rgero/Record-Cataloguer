import { Box, Container, Typography, useTheme } from "@mui/material";

import ReactTable from "@components/ui/tables/ReactTable";
import { useVinylContext } from "@context/vinyl/VinylContext";
import vinylColumns from "./VinylsTableColumns";

const UnplayedVinylsTable = () => {
  const { unplayedVinyls } = useVinylContext();
  const theme = useTheme();

  if (unplayedVinyls.length === 0) {
    return (
      <Container
        disableGutters
        sx={{padding: 3, alignItems: 'center', justifyContent: 'center', display: 'flex'}}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: "90%",
            paddingY: 5,
            bgcolor: theme.palette.background.default,
          }}
        >
          <Typography>No Unplayed Vinyls!</Typography>
        </Box>
      </Container>

    )
  }

  return (
    <ReactTable
      data={unplayedVinyls}
      columns={vinylColumns}
      settingsColumn="vinyls"
    />
  );
};

export default UnplayedVinylsTable;