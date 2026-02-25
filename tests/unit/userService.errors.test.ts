import * as userService from '../../src/auth/domain/userService';

jest.mock('../../src/auth/infra/prismaClient', () => {
  const user = { create: jest.fn(), findUnique: jest.fn() };
  const prisma = { user };
  return {
    __esModule: true,
    prisma,
    default: prisma,
  };
});

describe('userService error branches', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('throws conflict error when prisma returns P2002', async () => {
    const { default: prisma } = require('../../src/auth/infra/prismaClient');
    (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);
    (prisma.user.create as jest.Mock).mockRejectedValueOnce({ code: 'P2002' });

    await expect(userService.createUser('a@b.com', 'Password123!')).rejects.toMatchObject({ status: 409 });
  });
});
