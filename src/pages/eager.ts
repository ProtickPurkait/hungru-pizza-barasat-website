// Prerender: plain imports, so nothing suspends and every page is written as finished HTML.
import type { Pages } from "@/App";
import About from "./About";
import AreaPage from "./AreaPage";
import Builder from "./Builder";
import Contact from "./Contact";
import Home from "./Home";
import LegalPage from "./LegalPage";
import NotFound from "./NotFound";
import Projects from "./Projects";
import ServicePage from "./ServicePage";
import ServicesIndex from "./ServicesIndex";

export const eagerPages: Pages = { Home, ServicesIndex, ServicePage, Projects, Builder, AreaPage, About, Contact, LegalPage, NotFound };
