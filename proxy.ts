import { authkitMiddleware } from "@workos-inc/authkit-nextjs";

export default authkitMiddleware({
  middlewareAuth: {
    enabled: true,
    unauthenticatedPaths: ["/"],
  },
});

export const config = {
  matcher: [
    "/",
    "/:tenant*/checkin/:page*",
    "/:tenant*/admin/dashboards/:page*",
    "/:tenant*/forms/:page*",
    "/:tenant*/live/:page*",
    "/api/:route*",
  ],
};
