import { FortniteTypes } from "../../src/types/responses/FortniteResponse";
import { MinecraftTypes } from "../../src/types/responses/MinecraftResponse";

export function mockResponse(responseData: any): Response {
  return {
    ok: true,
    status: 200,
    statusText: "OK",
    url: "https://mockapi.com/",
    json: async () => responseData,
    text: async () => JSON.stringify(responseData),
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

export function mockFortniteFestivalResponse() {
  return {
    status: 200,
    data: {
      closer: {
        title: "Closer",
        artist: "The Chainsmokers ft. Halsey",
        releaseYear: 2016,
        cover:
          "https://cdn2.unrealengine.com/0kxmqfe5qntvocud-512x512-5af1b9420d1e.jpg",
        bpm: 95,
        duration: "4m 9s",
        difficulties: {
          vocals: 2,
          guitar: 2,
          bass: 1,
          drums: 2,
          "plastic-bass": 1,
          "plastic-drums": 1,
          "plastic-guitar": 1,
        },
        createdAt: "2024-12-26T04:08:19.835Z",
        lastFeatured: "2025-06-17T00:01:13.640Z",
        previewUrl:
          "https://p.scdn.co/mp3-preview/cefbf102efa3f75f152d65ac40290328dc7fc968?cid=ace3af5515b3429d8fbf1bb99bcd1310",
      },
      ittakestwo: {
        title: "It Takes Two",
        artist: "Rob Base & DJ EZ Rock",
        releaseYear: 1988,
        cover:
          "https://cdn2.unrealengine.com/5iidtymhwllhpgli-512x512-c4b5c50e531e.jpg",
        bpm: 112,
        duration: "4m 5s",
        difficulties: {
          vocals: 4,
          guitar: 0,
          bass: 0,
          drums: 2,
          "plastic-bass": 0,
          "plastic-drums": 3,
          "plastic-guitar": 0,
        },
        createdAt: "2024-12-26T04:08:19.835Z",
        lastFeatured: "2025-07-16T00:01:36.007Z",
        previewUrl:
          "https://p.scdn.co/mp3-preview/68b48f27419f714de23000b982dfb09f840f25c1?cid=ace3af5515b3429d8fbf1bb99bcd1310",
        featured: true,
      },
      metoo: {
        title: "Me Too",
        artist: "Meghan Trainor",
        releaseYear: 2016,
        cover:
          "https://cdn2.unrealengine.com/xdokxxv9x4hovbz6-512x512-d73c8e094b35.jpg",
        bpm: 124,
        duration: "3m 5s",
        difficulties: {
          vocals: 3,
          guitar: 1,
          bass: 1,
          drums: 4,
          "plastic-bass": 1,
          "plastic-drums": 3,
          "plastic-guitar": 1,
        },
        createdAt: "2024-12-26T04:08:19.835Z",
        lastFeatured: "2025-06-06T00:01:38.859Z",
        previewUrl:
          "https://p.scdn.co/mp3-preview/3edd9208dd6295b18f32c9be5dfcbd21290b913c?cid=ace3af5515b3429d8fbf1bb99bcd1310",
      },
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
