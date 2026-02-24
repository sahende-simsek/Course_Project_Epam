import { PrismaClient } from '@prisma/client';

// During tests we may prefer a lightweight in-memory stub to avoid real DB dependency.
let prisma: any;
if (process.env.TEST_USE_INMEMORY === '1') {
	const users: Record<string, any> = {};
	const refreshTokens: Record<string, any> = {};
	let userCounter = 1;
	let refreshCounter = 1;

	prisma = {
		user: {
			create: async ({ data }: any) => {
				const id = `u-${userCounter++}`;
				const rec = { id, email: data.email, passwordHash: data.passwordHash, createdAt: new Date() };
				users[id] = rec;
				users[data.email] = rec;
				return rec;
			},
			findUnique: async ({ where }: any) => {
				if (where.email) return users[where.email] ?? null;
				if (where.id) return users[where.id] ?? null;
				return null;
			},
			update: async ({ where, data }: any) => {
				const u = users[where.id];
				if (u) Object.assign(u, data);
				return u;
			},
			delete: async ({ where }: any) => {
				const u = users[where.id];
				if (u) {
					delete users[u.email];
					delete users[where.id];
				}
				return u;
			},
		},
		refreshToken: {
			create: async ({ data }: any) => {
				const id = `r-${refreshCounter++}`;
				const rec = { id, tokenId: data.tokenId ?? `t-${id}`, userId: data.userId, expiresAt: data.expiresAt, revoked: false };
				refreshTokens[rec.tokenId] = rec;
				return rec;
			},
			findUnique: async ({ where }: any) => {
				return refreshTokens[where.tokenId] ?? null;
			},
			update: async ({ where, data }: any) => {
				const byId = Object.values(refreshTokens).find((r: any) => r.id === where.id);
				if (byId) Object.assign(byId, data);
				return byId;
			},
			updateMany: async ({ where, data }: any) => {
				let count = 0;
				Object.values(refreshTokens).forEach((r: any) => {
					if ((where.tokenId && r.tokenId === where.tokenId) || (where.userId && r.userId === where.userId) || (where.id && r.id === where.id)) {
						Object.assign(r, data);
						count++;
					}
				});
				return { count };
			},
		},
	} as any;
} else {
	// Export a single Prisma client instance for the app to reuse.
	prisma = new PrismaClient();
}

export { prisma };
export default prisma;
