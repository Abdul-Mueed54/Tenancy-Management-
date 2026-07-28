// db/index.ts
import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";

const expoDb = openDatabaseSync("tenencyManagement.db", {enableChangeListener: true});

export const db = drizzle(expoDb);