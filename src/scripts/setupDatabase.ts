import { setupDatabase } from "../database/setupDatabase";
import { DATABASE } from "../keys";

(async () => {
  if (
    !DATABASE.host ||
    !DATABASE.port ||
    !DATABASE.user ||
    !DATABASE.password ||
    !DATABASE.database
  ) {
    throw new Error("Cannot setup database without required .env information!");
  }

  try {
    await setupDatabase();
    console.log("Database setup completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Database setup failed:", error);
    process.exit(1);
  }
})();
