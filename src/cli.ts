#!/usr/bin/env node

import { createProgram, UserFacingError } from "./program.js";

async function main(): Promise<void> {
  const program = await createProgram();
  await program.parseAsync(process.argv);
}

try {
  await main();
} catch (error) {
  if (error instanceof UserFacingError) {
    console.error(error.message);
    process.exitCode = 1;
  } else {
    throw error;
  }
}
