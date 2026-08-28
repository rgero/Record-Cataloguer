import TwoColumnPaginatedTable from "@components/ui/tables/TwoColumnPaginatedTable";

type PaginatedSectionProps = {
  data: Record<string, number>;
  descriptor: string;
}

interface CountRow {
  name: string;
  count: number;
}

const PaginatedSection = ({data, descriptor}: PaginatedSectionProps) => {
  const rows: CountRow[] = Object.entries(data).map(([name, count]) => ({ name, count }));

  return (
    <TwoColumnPaginatedTable
      data={rows}
      primaryKey="name"
      secondaryKey="count"
      sortKey="count"
      primaryHeader={descriptor}
      secondaryHeader="Count"
      getRowKey={(item) => item.name}
      primaryColumnSize={10}
      containerSx={{ width: { sm: "80%", lg: "50%" }, maxWidth: '100%' }}
    />
  );
}

export default PaginatedSection;