import type { LocationSettings } from "./tables/LocationSettings"
import type { PlaylogsSettings } from "./tables/PlaylogSettings"
import type { VinylSettings } from "./tables/VinylSettings"
import type { WantItemSettings } from "./tables/WantItemSettings"

interface ExpandedSections {
  vinyls: boolean,
  topArtists: boolean,
  locations: boolean,
  playlogs: boolean,
  topPlayDays: boolean
  playsByDays: boolean,
  playsByTimelineChart: boolean,
  playsByAlbum: boolean,
  playsByArtist: boolean
}

export interface SortModel {
  field: string,
  sort: "asc" | "desc"
}

export interface TableSortModels {
  locations: SortModel[],
  playlogs: SortModel[],
  vinyls: SortModel[],
  wantedItems: SortModel[]
}

export interface TableColumnOrderModels {
  locations: string[],
  playlogs: string[],
  vinyls: string[],
  wantedItems: string[]
}

export interface UserStatsExpandedSections extends ExpandedSections {
  userStats: boolean
};

export interface HouseStatsExpandedSections extends ExpandedSections {
  houseStats: boolean
}

export interface UserSettings {
  locations: LocationSettings,
  playlogs: PlaylogsSettings,
  vinyls: VinylSettings,
  wantedItems: WantItemSettings,
  currentStatsTab: string,
  userStatsSectionOrder: string[],
  userStatsExpandedSections: UserStatsExpandedSections,
  houseStatsSectionOrder: string[],
  houseStatsExpandedSections: HouseStatsExpandedSections,
  pricePerPlayValue: boolean
  sortModels: TableSortModels
  tableColumnOrders: TableColumnOrderModels
  statsStartDate: string
  pageSize: number
}