import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { resolveAdminAnalyticsRouteProps } from "../../app/[tenant]/admin/analytics/route-contract.ts";
import { dashboardNavigation } from "../dashboards/sidebar/navigation.ts";

test("analytics route waits for params before returning component props", async () => {
  let resolveParams!: (params: { tenant: string }) => void;
  const params = new Promise<{ tenant: string }>((resolve) => {
    resolveParams = resolve;
  });
  let settled = false;
  const routeProps = resolveAdminAnalyticsRouteProps(params).then((props) => {
    settled = true;
    return props;
  });

  await Promise.resolve();
  assert.equal(settled, false);

  resolveParams({ tenant: "minerva" });
  assert.deepEqual(await routeProps, { tenant: "minerva" });
});

test("analytics is the first rendered dashboard sidebar link", () => {
  const html = renderToStaticMarkup(
    createElement(
      "nav",
      null,
      dashboardNavigation.map(({ title, url }) =>
        createElement("a", { href: url, key: title }, title),
      ),
    ),
  );

  assert.match(html, /^<nav><a href="\/admin\/analytics">Analytics<\/a>/);
  assert.equal(dashboardNavigation[0]?.url, "/admin/analytics");
});
