import { PrismaClient } from '@prisma/client';

// During tests we may prefer a lightweight in-memory stub to avoid real DB dependency.
let prisma: any;
if (process.env.TEST_USE_INMEMORY === '1') {
	const users: Record<string, any> = {};
	const refreshTokens: Record<string, any> = {};
	const ideas: Record<string, any> = {};
	const attachments: Record<string, any> = {};
	const evaluations: Record<string, any> = {};
	let userCounter = 1;
	let refreshCounter = 1;
	let ideaCounter = 1;
	let attachmentCounter = 1;
	let evaluationCounter = 1;

	prisma = {
		user: {
			create: async ({ data }: any) => {
				const id = `u-${userCounter++}`;
				const role = data.role ?? 'SUBMITTER';
				const now = new Date();
				const rec = { id, email: data.email, passwordHash: data.passwordHash, role, createdAt: now, updatedAt: now };
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
				if (u) {
					Object.assign(u, data);
					u.updatedAt = new Date();
				}
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
		idea: {
			create: async ({ data }: any) => {
				const id = `idea-${ideaCounter++}`;
				const now = new Date();
				const rec = {
					id,
					title: data.title,
					description: data.description,
					category: data.category,
					status: data.status ?? 'SUBMITTED',
					authorId: data.authorId,
					createdAt: now,
					updatedAt: now,
				};
				ideas[id] = rec;
				return rec;
			},
			findMany: async ({ where, orderBy }: any = {}) => {
				let list = Object.values(ideas);
				if (where && where.authorId) {
					list = list.filter((i: any) => i.authorId === where.authorId);
				}
				if (orderBy && orderBy.createdAt === 'desc') {
					list = list.sort((a: any, b: any) => (b.createdAt as any) - (a.createdAt as any));
				}
				return list;
			},
			findUnique: async ({ where }: any) => {
				if (!where?.id) return null;
				return ideas[where.id] ?? null;
			},
			update: async ({ where, data }: any) => {
				const idea = ideas[where.id];
				if (!idea) return null;
				Object.assign(idea, data);
				idea.updatedAt = new Date();
				return idea;
			},
		},
		attachment: {
			deleteMany: async ({ where }: any) => {
				let count = 0;
				Object.keys(attachments).forEach((id) => {
					const att = attachments[id];
					if (!where || (where.ideaId && att.ideaId === where.ideaId)) {
						delete attachments[id];
						count++;
					}
				});
				return { count };
			},
			create: async ({ data }: any) => {
				const id = `att-${attachmentCounter++}`;
				const now = new Date();
				const rec = {
					id,
					ideaId: data.ideaId,
					filename: data.filename,
					url: data.url,
					mimetype: data.mimetype,
					size: data.size,
					createdAt: now,
				};
				attachments[id] = rec;
				return rec;
			},
		},
		evaluation: {
			create: async ({ data }: any) => {
				const id = `eval-${evaluationCounter++}`;
				const now = new Date();
				const rec = {
					id,
					ideaId: data.ideaId,
					evaluatorId: data.evaluatorId,
					comments: data.comments,
					decision: data.decision,
					createdAt: now,
				};
				evaluations[id] = rec;
				return rec;
			},
		},
	} as any;
} else {
	// Export a single Prisma client instance for the app to reuse.
	prisma = new PrismaClient();
}

export { prisma };
export default prisma;
