import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// isPublicRoutes stores the public routes that do not require authentication which are "/", "/sign-in", "/sign-up"
const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, request) => {
	// Check if the user is authenticated (auth() returns a promise that resolves to the user object)
	const user = auth();
	// Get the userId from the authenticated user
	const userId = (await user).userId;
	// Get the URL of the request
	const url = new URL(request.url);

	// If the user is authenticated and trying to access a public route and the URL is not "/" redirect to "/dashboard"
	// This is to prevent authenticated users from accessing the "/", "/sign-in" and "/sign-up" routes
	if (userId && isPublicRoute(request) && url.pathname !== "/") {
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}

	// Protect non-public routes
	// If the user is not authenticated and trying to access a non-public route, redirect to "/sign-in" (automatically adds the redirect URL to the sign-in page)
	if (!isPublicRoute(request)) {
		await auth.protect();
	}
});

// from docs: https://clerk.dev/docs/nextjs/middleware
export const config = {
	matcher: [
		// Skip Next.js internals and all static files, unless found in search params
		"/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
		// Always run for API routes
		"/(api|trpc)(.*)",
	],
};
