/* eslint-disable no-mixed-spaces-and-tabs */
import { PrismaClient, Role, type User, type RefreshToken, type Idea, type Attachment, type Evaluation } from '@prisma/client';

// During tests we may prefer a lightweight in-memory stub to avoid real DB dependency.
let prisma: PrismaClient | {
	user: {
	  create: ({ data }: { data: Pick<User, 'email' | 'passwordHash' | 'role'> }) => Promise<User>;
	  findUnique: ({ where }: { where: { email?: string; id?: string } }) => Promise<User | null>;
	  update: ({ where, data }: { where: { id: string }; data: Partial<User> }) => Promise<User | null>;
	  delete: ({ where }: { where: { id: string } }) => Promise<User | null>;
	};
	refreshToken: {
	  create: ({ data }: { data: Pick<RefreshToken, 'tokenId' | 'userId' | 'expiresAt'> }) => Promise<RefreshToken>;
	  findUnique: ({ where }: { where: { tokenId: string } }) => Promise<RefreshToken | null>;
	  update: ({ where, data }: { where: { id: string }; data: Partial<RefreshToken> }) => Promise<RefreshToken | undefined>;
	  updateMany: ({ where, data }: { where: { tokenId?: string; userId?: string; id?: string }; data: Partial<RefreshToken> }) => Promise<{ count: number }>;
	};
	idea: {
	  create: ({ data }: { data: Pick<Idea, 'title' | 'description' | 'category' | 'status' | 'authorId'> }) => Promise<Idea>;
	  findMany: ({ where, orderBy }?: { where?: { authorId?: string }; orderBy?: { createdAt?: 'desc' } }) => Promise<Idea[]>;
	  findUnique: ({ where }: { where: { id: string } }) => Promise<Idea | null>;
	  update: ({ where, data }: { where: { id: string }; data: Partial<Idea> }) => Promise<Idea | null>;
	};
	attachment: {
	  deleteMany: ({ where }: { where?: { ideaId?: string } }) => Promise<{ count: number }>;
	  create: ({ data }: { data: Pick<Attachment, 'ideaId' | 'filename' | 'url' | 'mimetype' | 'size'> }) => Promise<Attachment>;
	};
	evaluation: {
	  create: ({ data }: { data: Pick<Evaluation, 'ideaId' | 'evaluatorId' | 'comments' | 'decision'> }) => Promise<Evaluation>;
	};
};
if (process.env.TEST_USE_INMEMORY === '1') {
	const users: Record<string, User> = {};
	const refreshTokens: Record<string, RefreshToken> = {};
	const ideas: Record<string, Idea> = {};
	const attachments: Record<string, Attachment> = {};
	const evaluations: Record<string, Evaluation> = {};
	let userCounter = 1;
	let refreshCounter = 1;
	let ideaCounter = 1;
	let attachmentCounter = 1;
	let evaluationCounter = 1;

	prisma = {
		user: {
			create: async ({ data }: { data: Pick<User, 'email' | 'passwordHash' | 'role'> }) => {
				const id = `u-${userCounter++}`;
				const role = data.role ?? Role.SUBMITTER;
				const now = new Date();
				const rec: User = { id, email: data.email, passwordHash: data.passwordHash, role, createdAt: now, updatedAt: now, lastLoginAt: null };
				users[id] = rec;
				users[data.email] = rec;
				return rec;
			},
			findUnique: async ({ where }: { where: { email?: string; id?: string } }) => {
				if (where.email) return users[where.email] ?? null;
				if (where.id) return users[where.id] ?? null;
				return null;
			},
			update: async ({ where, data }: { where: { id: string }; data: Partial<User> }) => {
				const u = users[where.id];
				if (u) {
					Object.assign(u, data);
					u.updatedAt = new Date();
				}
				return u;
			},
			delete: async ({ where }: { where: { id: string } }) => {
				const u = users[where.id];
				if (u) {
					delete users[u.email];
					delete users[where.id];
				}
				return u;
			},
		},
		refreshToken: {
			create: async ({ data }: { data: Pick<RefreshToken, 'tokenId' | 'userId' | 'expiresAt'> }) => {
				const id = `r-${refreshCounter++}`;
				const rec: RefreshToken = { id, tokenId: data.tokenId ?? `t-${id}`, userId: data.userId, expiresAt: data.expiresAt, revoked: false, parentId: null, createdAt: new Date() };
				refreshTokens[rec.tokenId] = rec;
				return rec;
			},
			findUnique: async ({ where }: { where: { tokenId: string } }) => {
				return refreshTokens[where.tokenId] ?? null;
			},
			update: async ({ where, data }: { where: { id: string }; data: Partial<RefreshToken> }) => {
				const byId = Object.values(refreshTokens).find((r) => r.id === where.id);
				if (byId) Object.assign(byId, data);
				return byId;
			},
			updateMany: async ({ where, data }: { where: { tokenId?: string; userId?: string; id?: string }; data: Partial<RefreshToken> }) => {
				let count = 0;
				Object.values(refreshTokens).forEach((r) => {
					if ((where.tokenId && r.tokenId === where.tokenId) || (where.userId && r.userId === where.userId) || (where.id && r.id === where.id)) {
						Object.assign(r, data);
						count++;
					}
				});
				return { count };
			},
		},
		idea: {
			create: async ({ data }: { data: Pick<Idea, 'title' | 'description' | 'category' | 'status' | 'authorId'> }) => {
				const id = `idea-${ideaCounter++}`;
				const now = new Date();
				const rec: Idea = {
					id,
					title: data.title,
					description: data.description,
					category: data.category,
					status: data.status,
					authorId: data.authorId,
					createdAt: now,
					updatedAt: now,
				};
				ideas[id] = rec;
				return rec;
			},
			findMany: async ({ where, orderBy }: { where?: { authorId?: string }; orderBy?: { createdAt?: 'desc' } } = {}) => {
				let list = Object.values(ideas) as Idea[];
				if (where && where.authorId) {
					list = list.filter((i) => i.authorId === where.authorId);
				}
				if (orderBy && orderBy.createdAt === 'desc') {
					list = list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
				}
				return list;
			},
			findUnique: async ({ where }: { where: { id: string } }) => {
				if (!where?.id) return null;
				return ideas[where.id] ?? null;
			},
			update: async ({ where, data }: { where: { id: string }; data: Partial<Idea> }) => {
				const idea = ideas[where.id];
				if (!idea) return null;
				Object.assign(idea, data);
				idea.updatedAt = new Date();
				return idea;
			},
		},
		attachment: {
			deleteMany: async ({ where }: { where?: { ideaId?: string } }) => {
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
			create: async ({ data }: { data: Pick<Attachment, 'ideaId' | 'filename' | 'url' | 'mimetype' | 'size'> }) => {
				const id = `att-${attachmentCounter++}`;
				const now = new Date();
				const rec: Attachment = {
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
			create: async ({ data }: { data: Pick<Evaluation, 'ideaId' | 'evaluatorId' | 'comments' | 'decision'> }) => {
				const id = `eval-${evaluationCounter++}`;
				const now = new Date();
				const rec: Evaluation = {
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
	};
} else {
	// Export a single Prisma client instance for the app to reuse.
	prisma = new PrismaClient();
}

export { prisma };
export default prisma;
