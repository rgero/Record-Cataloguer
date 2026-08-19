import type { PlayLog } from "@interfaces/PlayLog";
import {createColumnHelper} from '@tanstack/react-table'

const columnHelper = createColumnHelper<PlayLog>();

export const playlogColumns = [
  columnHelper.accessor("playNumber", {
    header: "#",
    meta: {
      filterVariant: "number",
    },
    cell: (info) => info.getValue()
  }),
  columnHelper.accessor("artist", {
    header: "Artist",
    cell: (info) => info.getValue()
  }),
  columnHelper.accessor("album", {
    header: "Album",
    cell: (info) => info.getValue()
  }),
  columnHelper.accessor("date", {
    header: "Date",
    meta: {
      filterVariant: "date",
    },
    cell: (info) => info.getValue().toLocaleDateString('en-CA')
  }),
  columnHelper.accessor("listeners", {
    header: "Listeners",
    cell: (info) => info.getValue()?.map(u => u.name).join(', ') ?? ''
  }),
  columnHelper.accessor('notes', {
    header: 'Notes',
    cell: info => info.getValue(),
  }),
]