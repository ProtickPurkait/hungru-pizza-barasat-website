// Browser: each page is its own chunk, so phones only download what they open.
import { lazy } from "react";
import type { Pages } from "@/App";

export const lazyPages: Pages = {
  Home: lazy(() => import("./Home")),
  ServicesIndex: lazy(() => import("./ServicesIndex")),
  ServicePage: lazy(() => import("./ServicePage")),
  Projects: lazy(() => import("./Projects")),
  Builder: lazy(() => import("./Builder")),
  AreaPage: lazy(() => import("./AreaPage")),
  About: lazy(() => import("./About")),
  Contact: lazy(() => import("./Contact")),
  LegalPage: lazy(() => import("./LegalPage")),
  NotFound: lazy(() => import("./NotFound")),
};
