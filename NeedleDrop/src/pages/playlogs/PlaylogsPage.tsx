import ColumnFilterButton from "@components/ui/tables/ColumnFilterButton";
import ColumnVisibilityButton from "@components/ui/tables/ColumnVisibilityButton";
import DataTablePage from "@components/ui/DataTablePage"
import PlayLogTable from "@components/playlog/PlayLogTable"
import { PlayLogTableColumnDef } from "@components/playlog/PlayLogTableColumnDef";
import SuspenseTableWrapper from "@components/ui/SuspenseTableWrapper";

const PlaylogsPage = () => {
  return (
    <DataTablePage
      title="Plays"
      headerActions={(
        <>
          <ColumnVisibilityButton
            columns={PlayLogTableColumnDef}
            settingsColumn="playlogs"
          />
          <ColumnFilterButton columns={PlayLogTableColumnDef} />
        </>
      )}
    >
      <SuspenseTableWrapper>
        <PlayLogTable/>
      </SuspenseTableWrapper>
    </DataTablePage>
  )
}

export default PlaylogsPage
