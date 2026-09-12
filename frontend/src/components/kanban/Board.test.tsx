import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Board } from "./Board";

test("a first visit renders the three empty board columns", () => {
  const markup = renderToStaticMarkup(<Board />);
  const headings = [...markup.matchAll(/<h2[^>]*>(.*?)<\/h2>/g)].map((match) => match[1]);

  expect(headings).toEqual(["To Do", "In Progress", "Done"]);
  expect(markup).not.toContain("<article");
});
