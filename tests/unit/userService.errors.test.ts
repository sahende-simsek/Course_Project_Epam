import * as userService from '../../src/auth/domain/userService';

jest.mock('../../src/auth/infra/prismaClient', () => ({
  __esModule: true,
  prisma: {
    user: {
      create: jest.fn(),
    },
  },
  default: {
    user: {
      create: jest.fn(),
    },
  },
}));

describe('userService error branches', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('throws conflict error when prisma returns P2002', async () => {
    const prisma = require('../../src/auth/infra/prismaClient').default;
    // Ensure findUnique is mocked in this test environment
    (prisma.user.findUnique as jest.Mock) = jest.fn().mockResolvedValue(null);
    (prisma.user.create as jest.Mock).mockRejectedValueOnce({ code: 'P2002' });

    await expect(userService.createUser('a@b.com', 'Password123!')).rejects.toMatchObject({ status: 409 });
  });
});
