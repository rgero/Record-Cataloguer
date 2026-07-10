import type { PlayLog } from "@interfaces/PlayLog";
import type { User } from '@interfaces/User';
import { createColumnHelper } from "@tanstack/react-table";
import { stripArticles } from '@utils/StripArticles';

const columnHelper = createColumnHelper<PlayLog>();

export const PlayLogTableColumnDef = [
  columnHelper.accessor("playNumber", {
    header: "#",
    size: 60,
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("date", {
    header: "Date",
    sortingFn: "datetime",
    // Standard Date formatting for the cell
    cell: (info) => info.getValue().toLocaleDateString(),
  }),
  columnHelper.accessor("artist", {
    header: "Artist",
    size: 250,
    // Custom sort logic using stripArticles
    sortingFn: (rowA, rowB, columnId) => {
      const a = stripArticles(rowA.getValue(columnId));
      const b = stripArticles(rowB.getValue(columnId));
      return a.localeCompare(b);
    },
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("album", {
    header: "Album",
    size: 250,
    sortingFn: (rowA, rowB, columnId) => {
      const a = stripArticles(rowA.getValue(columnId));
      const b = stripArticles(rowB.getValue(columnId));
      return a.localeCompare(b);
    },
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("listeners", {
    header: "Listeners",
    // Logic from valueGetter is moved here
    cell: (info) => {
      const value = info.getValue();
      return value?.map((u: User) => u.name).join(', ') ?? '';
    },
  }),
];