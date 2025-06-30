export interface MinecraftResponse {
  eula_blocked: boolean;
  expires_at: number;
  host: string;
  icon: string | null;
  ip_address: string | null;
  mods: MinecraftPluginMod[];
  motd: {
    clean: string;
    html: string;
    raw: string;
  };
  online: boolean;
  players: {
    list: MinecraftUser[];
    max: number;
    online: number;
  };
  plugins: MinecraftPluginMod[];
  port: number;
  retrieved_at: number;
  software: string | null;
  srv_record: {
    host: string;
    port: number;
  } | null;
  version: MinecraftVersion;
}

interface MinecraftNamed {
  name_clean: string;
  name_html: string;
  name_raw: string;
}

interface MinecraftVersion extends MinecraftNamed {
  protocol: number;
}

export interface MinecraftUser extends MinecraftNamed {
  uuid: string;
}

interface MinecraftPluginMod {
  name: string;
  version: string | null;
}