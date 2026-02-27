import { PrismaClient } from '@prisma/client';

// During tests we may prefer a lightweight in-memory stub to avoid real DB dependency.
let prisma: any;
if (process.env.TEST_USE_INMEMORY === '1') {
	const users: Record<string, any> = {};
	const refreshTokens: Record<string, any> = {};
	const ideas: Record<string, any> = {};
	const attachments: Record<string, any> = {};
	const evaluations: Record<string, any> = {};
	const drafts: Record<string, any> = {};
	const draftAttachments: Record<string, any> = {};
	const reviewStages: Record<string, any> = {};
	const stageReviews: Record<string, any> = {};
	let userCounter = 1;
	let refreshCounter = 1;
	let ideaCounter = 1;
	let attachmentCounter = 1;
	let evaluationCounter = 1;
	let draftCounter = 1;
	let draftAttachmentCounter = 1;
	let reviewStageCounter = 1;
	let stageReviewCounter = 1;

	prisma = {
		user: {
			create: async ({ data }: any) => {
				const id = `u-${userCounter++}`;
				const role = data.role ?? 'SUBMITTER';
				const now = new Date();
				const rec = { id, email: data.email, username: data.username ?? null, passwordHash: data.passwordHash, role, createdAt: now, updatedAt: now };
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
				const rec: any = {
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
			findMany: async ({ where, include, orderBy }: any = {}) => {
				let list: any[] = Object.values(ideas);
				if (where && where.authorId) {
					list = list.filter((i: any) => i.authorId === where.authorId);
				}
				if (orderBy && orderBy.createdAt === 'desc') {
					list = list.sort((a: any, b: any) => (b.createdAt as any) - (a.createdAt as any));
				}
				if (include && (include.attachments || include.evaluations)) {
					list = list.map((idea: any) => ({
						...idea,
						...(include.attachments
							? {
								attachments: Object.values(attachments).filter((att: any) => att.ideaId === idea.id),
							}
							: {}),
						...(include.evaluations
							? {
								evaluations: Object.values(evaluations).filter((ev: any) => ev.ideaId === idea.id),
							}
							: {}),
					}));
				}
				return list;
			},
			findUnique: async ({ where, include }: any) => {
				if (!where?.id) return null;
				const idea = ideas[where.id] ?? null;
				if (!idea) return null;
				if (include && (include.attachments || include.evaluations)) {
					return {
						...idea,
						...(include.attachments
							? {
								attachments: Object.values(attachments).filter((att: any) => att.ideaId === idea.id),
							}
							: {}),
						...(include.evaluations
							? {
								evaluations: Object.values(evaluations).filter((ev: any) => ev.ideaId === idea.id),
							}
							: {}),
					};
				}
				return idea;
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
			findMany: async ({ where }: any = {}) => {
				let list: any[] = Object.values(attachments);
				if (where && where.ideaId) {
					list = list.filter((att: any) => att.ideaId === where.ideaId);
				}
				return list;
			},
			deleteMany: async ({ where }: any) => {
				let count = 0;
				Object.keys(attachments).forEach((id) => {
					const att = attachments[id];
					let match = true;
					if (where) {
						if (where.id && att.id !== where.id) match = false;
						if (where.ideaId && att.ideaId !== where.ideaId) match = false;
					}
					if (match) {
						delete attachments[id];
						count++;
					}
				});
				return { count };
			},
			create: async ({ data }: any) => {
				const id = `att-${attachmentCounter++}`;
				const now = new Date();
				const rec: any = {
					id,
					ideaId: data.ideaId,
					filename: data.filename,
					url: data.url,
					mimetype: data.mimetype,
					size: data.size,
					content: data.content,
					createdAt: now,
				};
				attachments[id] = rec;
				return rec;
			},
			findUnique: async ({ where, include }: any) => {
				if (!where?.id) return null;
				const att = attachments[where.id] ?? null;
				if (!att) return null;
				if (include && include.idea) {
					return {
						...att,
						idea: ideas[att.ideaId] ?? null,
					};
				}
				return att;
			},
			update: async ({ where, data }: any) => {
				const att = attachments[where.id];
				if (!att) return null;
				Object.assign(att, data);
				return att;
			},
		},
		draft: {
			create: async ({ data }: any) => {
				const id = `draft-${draftCounter++}`;
				const now = new Date();
				const rec: any = {
					id,
					ownerUserId: data.ownerUserId,
					title: data.title,
					description: data.description,
					category: data.category,
					dynamicFieldValues: data.dynamicFieldValues ?? {},
					linkedIdeaId: data.linkedIdeaId ?? null,
					status: data.status ?? 'DRAFT',
					createdAt: now,
					updatedAt: now,
				};
				drafts[id] = rec;
				return rec;
			},
			findMany: async ({ where, include, orderBy }: any = {}) => {
				let list: any[] = Object.values(drafts);
				if (where && where.ownerUserId) {
					list = list.filter((d: any) => d.ownerUserId === where.ownerUserId);
				}
				if (orderBy && orderBy.updatedAt === 'desc') {
					list = list.sort((a: any, b: any) => (b.updatedAt as any) - (a.updatedAt as any));
				}
				if (include && include.attachments) {
					list = list.map((d: any) => ({
						...d,
						attachments: Object.values(draftAttachments).filter((att: any) => att.draftId === d.id),
					}));
				}
				return list;
			},
			findUnique: async ({ where, include }: any) => {
				const draft = drafts[where.id];
				if (!draft) return null;
				if (include && include.attachments) {
					return {
						...draft,
						attachments: Object.values(draftAttachments).filter((att: any) => att.draftId === draft.id),
					};
				}
				return draft;
			},
			findFirst: async ({ where, include }: any) => {
				const list: any[] = Object.values(drafts).filter((d: any) => {
					if (where.id && d.id !== where.id) return false;
					if (where.ownerUserId && d.ownerUserId !== where.ownerUserId) return false;
					return true;
				});
				const draft = list[0] ?? null;
				if (!draft) return null;
				if (include && include.attachments) {
					return {
						...draft,
						attachments: Object.values(draftAttachments).filter((att: any) => att.draftId === draft.id),
					};
				}
				return draft;
			},
			update: async ({ where, data }: any) => {
				const draft = drafts[where.id];
				if (!draft) return null;
				Object.assign(draft, data);
				draft.updatedAt = new Date();
				return draft;
			},
			delete: async ({ where }: any) => {
				const draft = drafts[where.id];
				if (!draft) return null;
				delete drafts[where.id];
				// also remove related draft attachments
				Object.keys(draftAttachments).forEach((id) => {
					if (draftAttachments[id].draftId === where.id) {
						delete draftAttachments[id];
					}
				});
				return draft;
			},
		},
		draftAttachment: {
			create: async ({ data }: any) => {
				const id = `da-${draftAttachmentCounter++}`;
				const now = new Date();
				const rec: any = {
					id,
					draftId: data.draftId,
					filename: data.filename,
					url: data.url,
					mimetype: data.mimetype,
					size: data.size,
					content: data.content,
					createdAt: now,
				};
				draftAttachments[id] = rec;
				return rec;
			},
			findMany: async ({ where }: any = {}) => {
				let list: any[] = Object.values(draftAttachments);
				if (where && where.draftId) {
					list = list.filter((att: any) => att.draftId === where.draftId);
				}
				return list;
			},
			findUnique: async ({ where, include }: any) => {
				if (!where?.id) return null;
				const att = draftAttachments[where.id] ?? null;
				if (!att) return null;
				if (include && include.draft) {
					return {
						...att,
						draft: drafts[att.draftId] ?? null,
					};
				}
				return att;
			},
			update: async ({ where, data }: any) => {
				const att = draftAttachments[where.id];
				if (!att) return null;
				Object.assign(att, data);
				return att;
			},
			delete: async ({ where }: any) => {
				const att = draftAttachments[where.id];
				if (!att) return null;
				delete draftAttachments[where.id];
				return att;
			},
			deleteMany: async ({ where }: any) => {
				let count = 0;
				Object.keys(draftAttachments).forEach((id) => {
					const att = draftAttachments[id];
					if (!where || (where.draftId && att.draftId === where.draftId)) {
						delete draftAttachments[id];
						count++;
					}
				});
				return { count };
			},
		},
		reviewStage: {
			create: async ({ data }: any) => {
				const id = `stage-${reviewStageCounter++}`;
				const now = new Date();
				const rec: any = {
					id,
					name: data.name,
					description: data.description,
					orderIndex: data.orderIndex,
					isBlind: !!data.isBlind,
					assignmentRule: data.assignmentRule,
					exitRule: data.exitRule,
					createdAt: now,
					updatedAt: now,
				};
				reviewStages[id] = rec;
				return rec;
			},
			findMany: async ({ orderBy }: any = {}) => {
				let list: any[] = Object.values(reviewStages);
				if (orderBy && orderBy.orderIndex === 'asc') {
					list = list.sort((a: any, b: any) => (a.orderIndex as any) - (b.orderIndex as any));
				}
				return list;
			},
		},
		stageReview: {
			create: async ({ data }: any) => {
				const id = `sr-${stageReviewCounter++}`;
				const now = new Date();
				const rec: any = {
					id,
					ideaId: data.ideaId,
					stageId: data.stageId,
					evaluatorUserId: data.evaluatorUserId,
					decision: data.decision,
					comments: data.comments ?? null,
					scoreOverall: data.scoreOverall ?? null,
					scoreBreakdown: data.scoreBreakdown ?? null,
					createdAt: now,
				};
				stageReviews[id] = rec;
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
