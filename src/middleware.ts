import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/login",
  },
})

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/customers/:path*",
    "/appointments/:path*",
    "/services/:path*",
    "/messages/:path*",
    "/finance/:path*",
    "/settings/:path*",
    "/api/:path*",
  ],
}
