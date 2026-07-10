import { Box, Chip, Typography } from '@mui/material';
import type { WantedItem, Weight } from '@interfaces/WantedItem';

import type { User } from '@interfaces/User';
import { createColumnHelper } from "@tanstack/react-table";
import { stripArticles } from '@utils/StripArticles';

const columnHelper = createColumnHelper<WantedItem>();

export const WantedItemTableColumnDef = [
  columnHelper.accessor('artist', {
    header: 'Artist',
    size: 250,
    // Custom sort function using your existing utility
    sortingFn: (rowA, rowB, columnId) => {
      const a = stripArticles(rowA.getValue(columnId));
      const b = stripArticles(rowB.getValue(columnId));
      return a.localeCompare(b);
    },
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('album', {
    header: 'Album',
    size: 250,
    sortingFn: (rowA, rowB, columnId) => {
      const a = stripArticles(rowA.getValue(columnId));
      const b = stripArticles(rowB.getValue(columnId));
      return a.localeCompare(b);
    },
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('imageUrl', {
    id: "imageUrl", // Need to add the ID here to disable the filter later.
    header: 'Cover',
    enableSorting: false,
    meta: {
      disableFilter: true,
    },
    size: 105,
    cell: ({ getValue }) => {
      const val = getValue();
      const imgSrc = val && val !== "" ? val : "/BlackBox.png";

      return (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <img
            src={imgSrc}
            alt="Album Cover"
            style={{
              width: 96,
              height: 96,
              objectFit: "cover",
              borderRadius: 4,
              display: 'block'
            }}
            onError={(e) => { (e.target as HTMLImageElement).src = "/BlackBox.png"; }}
          />
        </Box>
      );
    }
  }),
  columnHelper.accessor('searcher', {
    header: 'Searcher',
    // Logic from valueGetter moves here
    cell: ({ getValue }) => {
      const value = getValue() as User[];
      const names = (!value || !Array.isArray(value)) 
        ? '' 
        : value.map((u: User) => u.name).join(', ');

      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
          <Typography variant="body2">{names}</Typography>
        </Box>
      );
    },
  }),
  columnHelper.accessor('created_at', {
    header: 'Date Added',
    sortingFn: "datetime",
    meta: {
      filterVariant: 'date',
    },
    cell: info => info.getValue().toLocaleDateString(),
  }),
  columnHelper.accessor('weight', {
    header: 'Weight',
    size: 100,
    meta: {
      filterVariant: 'select',
      filterOptions: ['Low', 'Medium', 'High'],
    },
    // Custom sort for Low -> Medium -> High
    sortingFn: (rowA, rowB, columnId) => {
      const order: Record<Weight, number> = { Low: 1, Medium: 2, High: 3 };
      return order[rowA.getValue(columnId) as Weight] - order[rowB.getValue(columnId) as Weight];
    },
    cell: ({ getValue }) => {
      const value = getValue() as Weight;
      const colorMap = {
        Low: "default",
        Medium: "warning",
        High: "error",
      } as const;

      return (
        <Chip
          size="small"
          label={value.toUpperCase()}
          color={colorMap[value]}
        />
      );
    },
  }),
  columnHelper.accessor('notes', {
    header: 'Notes',
    cell: info => info.getValue(),
  }),
];