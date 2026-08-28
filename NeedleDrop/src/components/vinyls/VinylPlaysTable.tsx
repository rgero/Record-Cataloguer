import { Box, Container, Grid, Pagination, Typography, useMediaQuery, useTheme } from "@mui/material"
import { useMemo, useState } from "react";

import type { PlayLog } from "@interfaces/PlayLog"
import { format } from "date-fns";

const VinylPlaysTable = ({playlogs} : {playlogs: PlayLog[]}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const data = playlogs.map((log) => ({
    date: log.date,
    listeners: log.listeners.map((listener) => listener.name).join(", "),
  }));
  
  const [page, setPage] = useState<number>(1);
  const itemsPerPage = 5;
  const rowHeight = 48; 

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [data]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  return (
    <Container disableGutters sx={{ width: { xs: "90%", lg: "50%" }, maxWidth: '100%' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', overflow: 'hidden' }}>
        <Grid
          container
          size={12}
          sx={{
            justifyContent: "space-between",
            pb: 1,
            mb: 1,
            borderBottom: '2px solid rgba(255,255,255,0.1)',
            flexWrap: 'nowrap'
          }}>
          <Grid size={6}>
            <Typography sx={{ fontWeight: "bold" }}>Date</Typography>
          </Grid>
          <Grid size={6} sx={{ textAlign: 'right' }}>
            <Typography sx={{ fontWeight: "bold" }}>Listeners</Typography>
          </Grid>
        </Grid>

        <Box sx={{ height: itemsPerPage * rowHeight, width: '100%' }}>
          {paginatedData.map((item) => (
            <Grid
              container
              key={item.date.toISOString()}
              sx={{
                alignItems: "center",
                justifyContent: "space-between",
                height: rowHeight,
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                flexWrap: 'nowrap',
                width: '100%'
              }}>
              <Grid size={6} sx={{ minWidth: 0 }}>
                <Typography
                  noWrap
                  sx={{
                    fontSize: '0.9rem',
                    pr: 2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: 'block',
                    width: '100%' 
                  }}
                  title={format(item.date, "yyyy-MM-dd")}
                >
                  {format(item.date, "yyyy-MM-dd")}
                </Typography>
              </Grid>
              <Grid size={6} sx={{ textAlign: 'right', flexShrink: 0 }}>
                <Typography sx={{ fontSize: '0.9rem' }}>
                  {item.listeners}
                </Typography>
              </Grid>
            </Grid>
          ))}
        </Box>

        <Box sx={{
          display: 'flex', 
          justifyContent: 'center',
          mt: 2,
          visibility: totalPages > 1 ? 'visible' : 'hidden',
          width: '100%',
          px: 1
        }}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={handlePageChange} 
            color="primary" 
            size="small"
            siblingCount={isMobile ? 0 : 1}
            boundaryCount={1}
            showFirstButton={isMobile}
            showLastButton={isMobile}
          />
        </Box>
      </Box>
    </Container>
  );
}

export default VinylPlaysTable
