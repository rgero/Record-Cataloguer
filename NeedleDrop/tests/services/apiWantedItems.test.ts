import { beforeEach, describe, expect, it, vi } from "vitest";
import { createWantedItem, getWantedItems } from "@services/apiWantedItems";

const { fromMock, selectMock, insertMock, singleMock, inMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
  selectMock: vi.fn(),
  insertMock: vi.fn(),
  singleMock: vi.fn(),
  inMock: vi.fn(),
}));

vi.mock("@services/supabase", () => ({
  default: {
    from: fromMock,
  },
}));

describe("apiWantedItems", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("stores length when creating a wanted item", async () => {
    const chain = { insert: insertMock, select: selectMock, single: singleMock };
    fromMock.mockReturnValue(chain);
    insertMock.mockReturnValue(chain);
    selectMock.mockReturnValue(chain);
    singleMock.mockResolvedValue({ data: { id: 1 }, error: null });

    await createWantedItem({
      artist: "Massive Attack",
      album: "Mezzanine",
      searcher: [],
      notes: "Keep sealed",
      length: 42,
      imageUrl: "cover.jpg",
      weight: "High",
      created_at: new Date(),
    });

    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({ length: 42 }));
  });

  it("hydrates a nullable length from the database", async () => {
    const wantedItemsChain = { select: selectMock };
    const usersChain = { select: selectMock, in: inMock };
    fromMock.mockReturnValueOnce(wantedItemsChain).mockReturnValueOnce(usersChain);
    selectMock
      .mockResolvedValueOnce({
        data: [{
          id: 1,
          artist: "Massive Attack",
          album: "Mezzanine",
          searcher: [],
          notes: null,
          length: null,
          imageUrl: null,
          created_at: "2026-01-01T00:00:00.000Z",
          weight: "High",
        }],
        error: null,
      })
      .mockResolvedValueOnce({ data: [] });

    const [wantedItem] = await getWantedItems();

    expect(wantedItem.length).toBeNull();
  });
});