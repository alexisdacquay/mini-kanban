import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Board } from "./Board";

test("a first visit renders the three empty board columns", () => {
  const markup = renderToStaticMarkup(<Board />);
  const headings = [...markup.matchAll(/<h2[^>]*>(.*?)<\/h2>/g)].map((match) => match[1]);

  expect(headings).toEqual(["To Do", "In Progress", "Done"]);
  expect(markup).not.toContain("<article");
});

test("the header exposes exactly three selectable themes", () => {
  const markup = renderToStaticMarkup(<Board />);
  const options = [...markup.matchAll(/<option[^>]*>(.*?)<\/option>/g)].map((match) => match[1]);

  expect(options).toEqual(["Cathode", "Daylight", "Midnight"]);
});
