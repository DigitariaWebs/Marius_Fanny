import { createAuthClient } from "better-auth/react";

/**
 * Authentication client for better-auth
 *
 * This client connects to the backend API auth endpoints.
 * The baseURL is constructed from VITE_API_URL environment variable
 * with "/api/auth" path appended automatically.
 *
 * Configuration:
 * - Set VITE_API_URL in .env file (e.g., http://localhost:3000)
 * - Defaults to http://localhost:3000 if not set
 * - Auth endpoints will be at: {baseURL}/api/auth/*
 *
 * Available methods:
 * - authClient.signIn.email() - Login with email/password
 * - authClient.signUp.email() - Register new user
 * - authClient.signOut() - Logout current user
 * - authClient.getSession() - Get current session
 */
export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
});
