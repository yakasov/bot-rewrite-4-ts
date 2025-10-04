export interface MinecraftResponse {
  eula_blocked: boolean;
  expires_at: number;
  host: string;
  icon: string | null;
  ip_address: string | null;
  mods: PluginMod[];
  motd: {
    clean: string;
    html: string;
    raw: string;
  };
  online: boolean;
  players: {
    list: User[];
    max: number;
    online: number;
  };
  plugins: PluginMod[];
  port: number;
  retrieved_at: number;
  software: string | null;
  srv_record: {
    host: string;
    port: number;
  } | null;
  version: Version;
}

interface Named {
  name_clean: string;
  name_html: string;
  name_raw: string;
}

interface Version extends Named {
  protocol: number;
}

export interface User extends Named {
  uuid: string;
}

interface PluginMod {
  name: string;
  version: string | null;
}

export interface NeatResponse {
  host: string;
  ip: string | null;
  port: number;
  motd?: string;
  players: {
    count: string;
    online: string;
  };
  software: string | null;
  version: string;
  plugins: number;
  mods: number;
}
