import jwt from 'jsonwebtoken';
import getConfig from '../../config';
import {
  createDraft,
  listDraftsForUser,
  getDraftForUser,
  updateDraft,
  deleteDraft,
  submitDraft,
} from '../domain/draftService';

function getUserIdFromAuth(req: Request): string | null {
  const auth = req.headers.get('authorization');
  if (!auth || !auth.startsWith('Bearer ')) return null;
  const token = auth.slice('Bearer '.length);
  try {
    const decoded: any = jwt.verify(token, getConfig.JWT_SECRET || 'dev-secret');
    return decoded?.sub ?? null;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  try {
    const userId = getUserIdFromAuth(req);
    if (!userId) {
      return new Response(
        JSON.stringify({ error: { code: 'unauthorized', message: 'Missing or invalid token' } }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (id) {
      const draft = await getDraftForUser(id, userId);
      if (!draft) {
        return new Response(
          JSON.stringify({ error: { code: 'not_found', message: 'Draft not found' } }),
          {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          },
        );
      }

      return new Response(JSON.stringify(draft), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const drafts = await listDraftsForUser(userId);
    return new Response(JSON.stringify(drafts), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    const status = err?.status || 400;
    const payload = { error: { code: String(err?.code || 'error'), message: err?.message || 'Bad Request' } };
    return new Response(JSON.stringify(payload), { status, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function POST(req: Request) {
  try {
    const userId = getUserIdFromAuth(req);
    if (!userId) {
      return new Response(
        JSON.stringify({ error: { code: 'unauthorized', message: 'Missing or invalid token' } }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    const body = await req.json();
    const { title, description, category, dynamicFieldValues } = body || {};

    const draft = await createDraft({
      ownerUserId: userId,
      title,
      description,
      category,
      dynamicFieldValues: dynamicFieldValues ?? {},
    });

    return new Response(JSON.stringify(draft), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    const status = err?.status || 400;
    const payload = { error: { code: String(err?.code || 'error'), message: err?.message || 'Bad Request' } };
    return new Response(JSON.stringify(payload), { status, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function PUT(req: Request) {
  try {
    const userId = getUserIdFromAuth(req);
    if (!userId) {
      return new Response(
        JSON.stringify({ error: { code: 'unauthorized', message: 'Missing or invalid token' } }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return new Response(
        JSON.stringify({ error: { code: 'validation_error', message: 'id query parameter is required' } }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    const body = await req.json();
    const { title, description, category, dynamicFieldValues } = body || {};

    const updated = await updateDraft({
      draftId: id,
      ownerUserId: userId,
      title,
      description,
      category,
      dynamicFieldValues,
    });

    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    const status = err?.status || 400;
    const payload = { error: { code: String(err?.code || 'error'), message: err?.message || 'Bad Request' } };
    return new Response(JSON.stringify(payload), { status, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function DELETE(req: Request) {
  try {
    const userId = getUserIdFromAuth(req);
    if (!userId) {
      return new Response(
        JSON.stringify({ error: { code: 'unauthorized', message: 'Missing or invalid token' } }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return new Response(
        JSON.stringify({ error: { code: 'validation_error', message: 'id query parameter is required' } }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    await deleteDraft(id, userId);

    return new Response(null, {
      status: 204,
    });
  } catch (err: any) {
    const status = err?.status || 400;
    const payload = { error: { code: String(err?.code || 'error'), message: err?.message || 'Bad Request' } };
    return new Response(JSON.stringify(payload), { status, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function POST_SUBMIT(req: Request) {
  try {
    const userId = getUserIdFromAuth(req);
    if (!userId) {
      return new Response(
        JSON.stringify({ error: { code: 'unauthorized', message: 'Missing or invalid token' } }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    const body = await req.json();
    const { draftId } = body || {};
    if (!draftId) {
      return new Response(
        JSON.stringify({ error: { code: 'validation_error', message: 'draftId is required' } }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    const result = await submitDraft({ draftId, ownerUserId: userId });

    return new Response(JSON.stringify(result.idea), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    const status = err?.status || 400;
    const payload = { error: { code: String(err?.code || 'error'), message: err?.message || 'Bad Request' } };
    return new Response(JSON.stringify(payload), { status, headers: { 'Content-Type': 'application/json' } });
  }
}
