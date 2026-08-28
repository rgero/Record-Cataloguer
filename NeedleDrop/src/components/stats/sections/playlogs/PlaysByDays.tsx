import type { Stats } from "@interfaces/Stats"
import StatsAccordion from "@components/stats/ui/StatsAccordion"
import TwoColumnPaginatedTable from "@components/ui/tables/TwoColumnPaginatedTable";

interface DayCountRow {
  name: string;
  count: number;
}

const PlaysByDays = ({stats, expanded, onToggle}: {stats: Stats, expanded: boolean, onToggle: (expanded: boolean) => void}) => {
  const rows: DayCountRow[] = Object.entries(stats.playsByDays).map(([name, count]) => ({ name, count }));

  return (
    <StatsAccordion title="Plays By Days" expanded={expanded} onChange={(_, isExpanded) => onToggle(isExpanded)}>
      <TwoColumnPaginatedTable
        data={rows}
        primaryKey="name"
        secondaryKey="count"
        primaryHeader="Day"
        secondaryHeader="Count"
        getRowKey={(item) => item.name}
        primaryColumnSize={10}
        paginate={false}
        containerSx={{ width: { sm: "80%", lg: "50%" }, maxWidth: '100%' }}
      />
    </StatsAccordion>
  );
}

export default PlaysByDays
