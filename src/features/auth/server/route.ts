import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { deleteCookie, setCookie } from "hono/cookie";

import { loginSchema, registerSchema } from "../schemas";
import { createAdminClient, createSessionClient } from "@/lib/appwrite";
import { ID } from "node-appwrite";
import { AUTH_COOKIE } from "../constants";
import { sessionMiddleware } from "@/lib/session-middleware";
import { z } from "zod";

const app = new Hono()
  .get("/current", sessionMiddleware, (c) => {
    const user = c.get("user");

    return c.json({ data: user });
  })
  .post("/login", zValidator("json", loginSchema), async (c) => {
    const { email, password } = c.req.valid("json");

    const { account } = await createAdminClient();
    const session = await account.createEmailPasswordSession(email, password);

    setCookie(c, AUTH_COOKIE, session.secret, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 30,
    });

    return c.json({ success: true });
  })
  .post("/register", zValidator("json", registerSchema), async (c) => {
    const { name, email, password } = c.req.valid("json");

    const { account } = await createAdminClient();
    await account.create(ID.unique(), email, password, name);

    const session = await account.createEmailPasswordSession(email, password);

    setCookie(c, AUTH_COOKIE, session.secret, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 30,
    });

    return c.json({ success: true });
  })
  .post("/logout", sessionMiddleware, async (c) => {
    const account = c.get("account");

    deleteCookie(c, AUTH_COOKIE);
    await account.deleteSession("current");

    return c.json({ success: true });
  })

  .patch(
  "/profile",
  sessionMiddleware,
  zValidator("json", z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    description: z.string().optional(),
  })),
  async (c) => {
    const { account } = await createSessionClient();
    const { name, phone, description } = c.req.valid("json");

    try {
      // Update name if provided
      if (name) {
        await account.updateName(name);
      }

      // Skip phone update for now since it requires password
      // We'll handle phone updates differently
      if (phone) {
        const cleanPhone = phone.trim();
        
        if (cleanPhone !== "") {
          // Validate phone format
          if (!cleanPhone.startsWith('+')) {
            return c.json({ error: "Phone number must start with '+'" }, 400);
          }
          
          const formattedPhone = '+' + cleanPhone.slice(1).replace(/\D/g, '');
          
          if (formattedPhone.length < 8 || formattedPhone.length > 16) {
            return c.json({ error: "Phone number must be between 7-15 digits" }, 400);
          }
          
          // Store phone in user preferences instead of using updatePhone
          const currentUser = await account.get();
          const currentPrefs = currentUser.prefs || {};
          
          await account.updatePrefs({
            ...currentPrefs,
            phone: formattedPhone,
            description: description || currentPrefs.description,
          });
        }
      } else if (description !== undefined) {
        // Update only description
        const currentUser = await account.get();
        const currentPrefs = currentUser.prefs || {};
        
        await account.updatePrefs({
          ...currentPrefs,
          description,
        });
      }

      // Get updated user info
      const updatedUser = await account.get();

      return c.json({ 
        data: {
          ...updatedUser,
          phone: updatedUser.prefs?.phone || "", // Get phone from preferences
        }
      });
    } catch (error: unknown) {
      console.error("Profile update error:", error);
      
      if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
        const appwriteError = error as { code: number; message: string };
        
        if (appwriteError.code === 400 && appwriteError.message?.includes('phone')) {
          return c.json({ error: "Invalid phone number format. Please use format: +1234567890" }, 400);
        }
      }
      
      return c.json({ error: "Failed to update profile" }, 500);
    }
  }
);



export default app;
