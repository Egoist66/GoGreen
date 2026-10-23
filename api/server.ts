import type { BunRequest } from "bun";
import Bun from 'bun'

interface User {
  id: string;
  name: string;
  email: string;
}

const users = new Map<string, User>();

Bun.serve({
  routes: {
    "/api/health": () => Response.json({ status: "ok" }),

    "/api/users": {
      GET: () => Response.json(Array.from(users.values())),

      POST: async (req) => {
        const body = await req.json();
        const user: User = {
          id: crypto.randomUUID(),
          name: body.name,
          email: body.email,
        };
        users.set(user.id, user);
        return Response.json(user, { status: 201 });
      },
    },

    "/api/users/:id": {
      GET: (req: BunRequest<"/api/users/:id">) => {
        const user = users.get(req.params.id);
        if (!user) {
          return Response.json({ error: "User not found" }, { status: 404 });
        }
        return Response.json(user);
      },

      PUT: async (req: BunRequest<"/api/users/:id">) => {
        const existing = users.get(req.params.id);
        if (!existing) {
          return Response.json({ error: "User not found" }, { status: 404 });
        }
        const body = await req.json();
        const updated = { ...existing, ...body, id: existing.id };
        users.set(existing.id, updated);
        return Response.json(updated);
      },

      DELETE: (req: BunRequest<"/api/users/:id">) => {
        const deleted = users.delete(req.params.id);
        if (!deleted) {
          return Response.json({ error: "User not found" }, { status: 404 });
        }
        return new Response(null, { status: 204 });
      },
    },
  },

  fetch() {
    return new Response("Not Found", { status: 404 });
  },

  error(err) {
    console.error(err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  },
});