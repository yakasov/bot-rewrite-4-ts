import { FortniteTypes } from "../../src/types/responses/FortniteResponse";
import { MinecraftTypes } from "../../src/types/responses/MinecraftResponse";

export function mockResponse(
  type: "fortnite" | "minecraft" | "custom"
): Response {
  let response = null;
  if (type === "fortnite") {
    response = mockFortniteResponse();
  } else if (type === "minecraft") {
    response = mockMinecraftResponse();
  } else if (type === "custom") {
    response = {};
  }

  return {
    ok: true,
    status: 200,
    statusText: "OK",
    url: `https://mockapi.com/${type}`,
    json: async () => response,
    text: async () => JSON.stringify(response),
    headers: new Headers(),
  } as Response;
}

export function mockFortniteResponse(): FortniteTypes.Response {
  return {
    status: 200,
    data: {
      hash: "mockHash",
      date: "2023-10-01",
      vbuckIcon: "mockIcon",
      entries: [
        {
          regularPrice: 1000,
          finalPrice: 800,
          devName: "Mock Item",
          offerId: "mock-offer-id",
          inDate: "2023-10-01T00:00:00Z",
          outDate: "2023-10-08T00:00:00Z",
          giftable: true,
          refundable: false,
          sortPriority: 1,
          layoutId: "jam-tracks-layout-id",
          layout: {
            id: "jam-tracks-layout-id",
            name: "Jam Tracks",
            index: 0,
            rank: 0,
            showIneligibleOffers: "",
            useWidePreview: false,
            displayType: "",
          },
          tracks: [
            {
              title: "Song C",
              artist: "Artist C",
              id: "",
              devName: "",
              releaseYear: 0,
              bpm: 0,
              duration: 0,
              difficulty: {
                vocals: 0,
                guitar: 0,
                bass: 0,
                drums: 0,
                plasticBass: 0,
                plasticDrums: 0,
              },
              albumArt: "",
              added: "",
            },
          ],
        },
        {
          regularPrice: 1000,
          finalPrice: 800,
          devName: "Mock Item",
          offerId: "mock-offer-id",
          inDate: "2023-10-01T00:00:00Z",
          outDate: "2023-10-08T00:00:00Z",
          giftable: true,
          refundable: false,
          sortPriority: 1,
          layoutId: "mock-layout-id",
          layout: {
            id: "mock-layout-id",
            name: "Mock Layout",
            index: 0,
            rank: 0,
            showIneligibleOffers: "",
            useWidePreview: false,
            displayType: "",
          },
          brItems: [
            {
              type: {
                value: "emote",
                displayValue: "",
                backendValue: "",
              },
              name: "Mock Emote",
              images: {
                smallIcon: "mockEmoteSmallIcon.png",
                icon: "mockEmoteIcon.png",
              },
              id: "",
              description: "",
              rarity: {
                value: "common",
                displayValue: "Common",
                backendValue: "common",
              },
              added: "",
            },
          ],
        },
        {
          regularPrice: 1000,
          finalPrice: 800,
          devName: "Mock Item",
          offerId: "mock-offer-id",
          inDate: "2023-10-01T00:00:00Z",
          outDate: "2023-10-08T00:00:00Z",
          giftable: true,
          refundable: false,
          sortPriority: 1,
          layoutId: "mock-layout-id",
          layout: {
            id: "mock-layout-id",
            name: "Mock Layout",
            index: 0,
            rank: 0,
            showIneligibleOffers: "",
            useWidePreview: false,
            displayType: "",
          },
          brItems: [
            {
              type: {
                value: "emote",
                displayValue: "",
                backendValue: "",
              },
              name: "Get Griddy",
              images: {
                smallIcon: "mockEmoteSmallIcon.png",
                icon: "mockEmoteIcon.png",
              },
              id: "",
              description: "",
              rarity: {
                value: "common",
                displayValue: "Common",
                backendValue: "common",
              },
              added: "",
            },
          ],
        },
      ],
    },
  };
}

export function mockMinecraftResponse(): MinecraftTypes.Response {
  return {
    eula_blocked: false,
    expires_at: Date.now(),
    host: "mock.minecraft.server",
    icon: null,
    ip_address: "mock.minecraft.server",
    mods: [],
    motd: {
      clean: "Welcome to the Mock Minecraft Server!",
      html: "<p>Welcome to the Mock Minecraft Server!</p>",
      raw: "Welcome to the Mock Minecraft Server!",
    },
    online: true,
    players: {
      list: [
        {
          name_clean: "Player1",
          name_html: "Player1",
          name_raw: "Player1",
          uuid: "uuid-1",
        },
        {
          name_clean: "Player2",
          name_html: "Player2",
          name_raw: "Player2",
          uuid: "uuid-2",
        },
      ],
      max: 20,
      online: 2,
    },
    plugins: [],
    port: 25565,
    retrieved_at: Date.now(),
    software: "MockServer 1.0",
    srv_record: {
      host: "mock.minecraft.server",
      port: 25565,
    },
    version: {
      name_clean: "Mock Version 1.0",
      name_html: "Mock Version 1.0",
      name_raw: "Mock Version 1.0",
      protocol: 123,
    },
  };
}
