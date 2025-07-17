import { setupDatabase } from "../database/setupDatabase";
import { database } from "../keys";

(async () => {
  if (
    !database.host ||
    !database.port ||
    !database.user ||
    !database.password ||
    !database.database
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
