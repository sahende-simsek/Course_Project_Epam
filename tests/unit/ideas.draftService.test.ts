describe('draftService', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.TEST_USE_INMEMORY = '1';
  });

  afterEach(() => {
    delete process.env.TEST_USE_INMEMORY;
    jest.resetModules();
  });

  it('creates, lists, loads, updates, and deletes drafts for a user', async () => {
    const {
      createDraft,
      listDraftsForUser,
      getDraftForUser,
      updateDraft,
      deleteDraft,
    } = require('../../src/auth/domain/draftService');

    const ownerUserId = 'user-1';

    const created = await createDraft({
      ownerUserId,
      title: 'My idea',
      description: 'Initial desc',
      category: 'process-improvement',
      dynamicFieldValues: { foo: 'bar' },
    });

    expect(created).toHaveProperty('id');
    expect(created.status).toBe('DRAFT');

    const list = await listDraftsForUser(ownerUserId);
    expect(list.length).toBe(1);

    const fetched = await getDraftForUser(created.id, ownerUserId);
    expect(fetched).not.toBeNull();

    const updated = await updateDraft({
      draftId: created.id,
      ownerUserId,
      title: 'Updated',
    });
    expect(updated.title).toBe('Updated');

    await deleteDraft(created.id, ownerUserId);
    const afterDelete = await listDraftsForUser(ownerUserId);
    expect(afterDelete.length).toBe(0);
  });

  it('submits a draft and creates an idea', async () => {
    const { createDraft, submitDraft } = require('../../src/auth/domain/draftService');

    const ownerUserId = 'user-2';

    const created = await createDraft({
      ownerUserId,
      title: 'Submit this idea',
      description: 'Ready to submit',
      category: 'new-product',
      dynamicFieldValues: {},
    });

    const result = await submitDraft({ draftId: created.id, ownerUserId });

    expect(result).toHaveProperty('idea');
    expect(result.idea.title).toBe('Submit this idea');
    expect(result.idea.description).toBe('Ready to submit');
    expect(result.idea.category).toBe('new-product');
    expect(result.idea.authorId).toBe(ownerUserId);
  });

  it('ideaService validations and visibility rules behave as expected', async () => {
    const { createIdea, listIdeasForUser, getIdeaForUser } = require('../../src/auth/domain/ideaService');
    const { Role } = require('@prisma/client');

    await expect(
      createIdea({ authorId: '', title: 't', description: 'd', category: 'c' }),
    ).rejects.toMatchObject({ status: 401 });

    await expect(
      createIdea({ authorId: 'u-1', title: '', description: 'd', category: 'c' }),
    ).rejects.toMatchObject({ status: 400 });

    const idea1 = await createIdea({
      authorId: 'u-1',
      title: 'Idea 1',
      description: 'First',
      category: 'general',
    });

    const idea2 = await createIdea({
      authorId: 'u-2',
      title: 'Idea 2',
      description: 'Second',
      category: 'general',
    });

    await expect(
      listIdeasForUser('', Role.SUBMITTER),
    ).rejects.toMatchObject({ status: 401 });

    const submitterList = await listIdeasForUser('u-1', Role.SUBMITTER);
    expect(submitterList.map((i: any) => i.id)).toEqual([idea1.id]);

    const evaluatorList = await listIdeasForUser('eval-1', Role.EVALUATOR);
    const evaluatorIds = evaluatorList.map((i: any) => i.id).sort();
    expect(evaluatorIds).toEqual([idea1.id, idea2.id].sort());

    const evaluatorView = await getIdeaForUser(idea1.id, 'eval-1', Role.EVALUATOR);
    expect(evaluatorView.id).toBe(idea1.id);

    await expect(
      getIdeaForUser('', 'u-1', Role.SUBMITTER),
    ).rejects.toMatchObject({ status: 400 });

    await expect(
      getIdeaForUser('nonexistent-id', 'u-1', Role.SUBMITTER),
    ).rejects.toMatchObject({ status: 404 });

    await expect(
      getIdeaForUser(idea2.id, 'u-1', Role.SUBMITTER),
    ).rejects.toMatchObject({ status: 403 });
  });
});
