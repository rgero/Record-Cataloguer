import { Box, Container, Grid, Pagination, Typography, useMediaQuery, useTheme } from "@mui/material"
import type { SxProps, Theme } from "@mui/material";
import { useMemo, useState } from "react";

interface TwoColumnPaginatedTableProps<T> {
  data: T[];
  primaryKey: keyof T;
  secondaryKey: keyof T;
  sortKey?: keyof T;
  sortDirection?: "asc" | "desc";
  primaryHeader: string;
  secondaryHeader: string;
  getRowKey: (item: T) => string;
  renderPrimary?: (item: T) => string;
  primaryColumnSize?: number;
  containerSx?: SxProps<Theme>;
  paginate?: boolean;
}

// values may be Date or number; compare on a numeric representation
const toComparable = (value: unknown) => value instanceof Date ? value.getTime() : (value as number);

interface RowProps<T> {
  item: T;
  secondaryKey: keyof T;
  primaryContent: string;
  primaryColumnSize: number;
  secondaryColumnSize: number;
  rowHeight: number;
}

const Row = <T,>({ item, secondaryKey, primaryContent, primaryColumnSize, secondaryColumnSize, rowHeight }: RowProps<T>) => (
  <Grid
    container
    sx={{
      alignItems: "center",
      justifyContent: "space-between",
      height: rowHeight,
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      flexWrap: 'nowrap',
      width: '100%'
    }}>
    <Grid size={primaryColumnSize} sx={{ minWidth: 0 }}>
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
        title={primaryContent}
      >
        {primaryContent}
      </Typography>
    </Grid>
    <Grid size={secondaryColumnSize} sx={{ textAlign: 'right', flexShrink: 0 }}>
      <Typography sx={{ fontSize: '0.9rem' }}>
        {String(item[secondaryKey])}
      </Typography>
    </Grid>
  </Grid>
);

const TwoColumnPaginatedTable = <T,>({data, primaryKey, secondaryKey, sortKey, sortDirection = "desc", primaryHeader, secondaryHeader, getRowKey, renderPrimary, primaryColumnSize = 6, containerSx = { width: "100%" }, paginate = true}: TwoColumnPaginatedTableProps<T>) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const secondaryColumnSize = 12 - primaryColumnSize;

  const [page, setPage] = useState<number>(1);
  const itemsPerPage = paginate ? 5 : data.length;
  const rowHeight = 48; 

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    const direction = sortDirection === "asc" ? 1 : -1;
    return [...data].sort(
      (a, b) => (toComparable(a[sortKey]) - toComparable(b[sortKey])) * direction
    );
  }, [data, sortKey, sortDirection]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = paginate ? sortedData.slice((page - 1) * itemsPerPage, page * itemsPerPage) : sortedData;

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  return (
    <Container disableGutters sx={containerSx}>
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
          <Grid size={primaryColumnSize}>
            <Typography sx={{ fontWeight: "bold" }}>{primaryHeader}</Typography>
          </Grid>
          <Grid size={secondaryColumnSize} sx={{ textAlign: 'right' }}>
            <Typography sx={{ fontWeight: "bold" }}>{secondaryHeader}</Typography>
          </Grid>
        </Grid>

        <Box sx={{ height: itemsPerPage * rowHeight, width: '100%' }}>
          {paginatedData.map((item) => (
            <Row
              key={getRowKey(item)}
              item={item}
              secondaryKey={secondaryKey}
              primaryContent={renderPrimary ? renderPrimary(item) : String(item[primaryKey])}
              primaryColumnSize={primaryColumnSize}
              secondaryColumnSize={secondaryColumnSize}
              rowHeight={rowHeight}
            />
          ))}
        </Box>

        {paginate && (
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
        )}
      </Box>
    </Container>
  );
}

export default TwoColumnPaginatedTable
