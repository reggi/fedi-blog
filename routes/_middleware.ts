import { Handler } from "$fresh/server.ts";
import { federation } from "../federation/mod.ts";
import { integrateHandler } from "@fedify/fedify/x/fresh";
import { getLogger } from "fresh_logging";

// This is the entry point to the Fedify middleware from the Fresh framework:
export const handler: Handler[] = [
  integrateHandler(federation, () => undefined),
  getLogger(),
];
