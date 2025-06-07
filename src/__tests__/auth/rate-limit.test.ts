import { RateLimit, initRedis } from '@/lib/rate-limit'
import { Redis } from '@upstash/redis'
import { jest } from '@jest/globals'

// Define Redis function types
type RedisZAdd = (key: string, score: number, member: string) => Promise<number>;
type RedisZRemRangeByScore = (key: string, min: number, max: number) => Promise<number>;
type RedisZCard = (key: string) => Promise<number>;
type RedisExpire = (key: string, seconds: number) => Promise<number>;
type RedisDel = (key: string) => Promise<number>;

// Create mock Redis pipeline
type PipelineResult = [Error | null, unknown][];

const mockPipeline = {
  zadd: jest.fn(),
  zremrangebyscore: jest.fn(),
  zcard: jest.fn(),
  expire: jest.fn(),
  exec: jest.fn().mockImplementation(() => Promise.resolve([
    [null, 1],  // zadd result
    [null, 1],  // zremrangebyscore result
    [null, 0],  // zcard result
    [null, 1],   // expire result
  ]))
};

// Create mock Redis functions
const mockZAdd = jest.fn().mockImplementation(async () => 1);
const mockZRemRangeByScore = jest.fn().mockImplementation(async () => 1);
const mockZCard = jest.fn().mockImplementation(async () => 0);
const mockExpire = jest.fn().mockImplementation(async () => 1);
const mockDel = jest.fn().mockImplementation(async () => 1);

// Create mock Redis instance
const mockRedisInstance = {
  zadd: mockZAdd as unknown as RedisZAdd,
  zremrangebyscore: mockZRemRangeByScore as unknown as RedisZRemRangeByScore,
  zcard: mockZCard as unknown as RedisZCard,
  expire: mockExpire as unknown as RedisExpire,
  pipeline: jest.fn().mockReturnValue(mockPipeline),
  del: mockDel as unknown as RedisDel
} as unknown as Redis;

// Mock Redis constructor
jest.mock('@upstash/redis', () => ({
  Redis: jest.fn().mockImplementation(() => mockRedisInstance)
}));

// Mock the rate-limit module
jest.mock('@/lib/rate-limit', () => ({
  initRedis: jest.fn().mockReturnValue(mockRedisInstance),
  getRedis: jest.fn().mockReturnValue(mockRedisInstance),
  RateLimit: (jest.requireActual('@/lib/rate-limit') as typeof import('@/lib/rate-limit')).RateLimit
}));

// Initialize Redis with mock
initRedis();

describe('RateLimit', () => {
  let rateLimit: RateLimit;
  let now: number;
  let originalEnv: NodeJS.ProcessEnv;

  beforeAll(() => {
    originalEnv = { ...process.env };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    now = Math.floor(Date.now() / 1000) * 1000;
    jest.spyOn(Date, 'now').mockImplementation(() => now);
    rateLimit = new RateLimit({
      interval: 900, // 15 minutes
      maxRequests: 5
    });
  });

  describe('check', () => {
    it('should allow requests within limit', async () => {
      // Setup mocks
      mockZRemRangeByScore.mockImplementation(() => Promise.resolve(1));
      mockZCard.mockImplementation(() => Promise.resolve(3));

      const result = await rateLimit.check('test-key');
      
      // Verify results
      expect(mockZRemRangeByScore).toHaveBeenCalledWith(
        'rate-limit:test-key',
        0,
        Math.floor(now / 1000) - 900
      );
      expect(mockZCard).toHaveBeenCalledWith('rate-limit:test-key');
      expect(result).toEqual({
        success: true,
        remaining: 2,
        reset: Math.floor(now / 1000) + 900
      });
    });

    it('should block requests over limit', async () => {
      // Setup mocks
      mockZRemRangeByScore.mockImplementation(() => Promise.resolve(1));
      mockZCard.mockImplementation(() => Promise.resolve(5));

      const result = await rateLimit.check('test-key');

      // Verify results
      expect(result).toEqual({
        success: false,
        remaining: 0,
        reset: Math.floor(now / 1000) + 900
      });
    });

    it('should handle first request', async () => {
      // Setup mocks
      mockZRemRangeByScore.mockImplementation(() => Promise.resolve(1));
      mockZCard.mockImplementation(() => Promise.resolve(0));

      const result = await rateLimit.check('test-key');

      // Verify results
      expect(result).toEqual({
        success: true,
        remaining: 5,
        reset: Math.floor(now / 1000) + 900
      });
    });
  });

  describe('increment', () => {
    it('should increment counter', async () => {
      const pipeline = mockRedisInstance.pipeline();
      const mockExec = pipeline.exec as jest.Mock;
      mockExec.mockImplementationOnce(() => Promise.resolve([
        [null, 1],  // zadd result
        [null, 1],  // zremrangebyscore result
        [null, 3],  // zcard result - simulating 3 requests
        [null, 1]   // expire result
      ]));

      const result = await rateLimit.increment('test-key');
      expect(result).toBe(true);
      expect(mockRedisInstance.pipeline).toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    it('should reset counter', async () => {
      mockDel.mockImplementationOnce(() => Promise.resolve(1));

      const result = await rateLimit.reset('test-key');
      expect(result).toBe(true);
      expect(mockDel).toHaveBeenCalledWith('rate-limit:test-key');
    });
  });

  describe('sliding window', () => {
    it('should handle window sliding', async () => {
      const now = Math.floor(Date.now() / 1000) * 1000;
      jest.spyOn(Date, 'now').mockImplementation(() => now);

      // First check at current time
      mockZCard.mockImplementationOnce(() => Promise.resolve(0));
      mockZRemRangeByScore.mockImplementationOnce(() => Promise.resolve(1));
      
      let result = await rateLimit.check('test-key');
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(5);

      // Move time forward 5 minutes
      jest.spyOn(Date, 'now').mockImplementation(() => now + 300000); // 5 minutes in milliseconds
      
      // Simulate having 3 requests in the window
      mockZCard.mockImplementationOnce(() => Promise.resolve(3));
      mockZRemRangeByScore.mockImplementationOnce(() => Promise.resolve(1));
      
      result = await rateLimit.check('test-key');
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(2);
      expect(result.reset).toBe(Math.floor((now + 300000) / 1000) + 900); // Current time + interval
    });
  });

  describe('error handling', () => {
    it('should handle Redis errors gracefully', async () => {
      mockZRemRangeByScore.mockImplementationOnce(() => Promise.reject(new Error('Redis error')));

      const result = await rateLimit.check('test-key');
      expect(result.success).toBe(true); // Error case returns true for better UX
      expect(result.remaining).toBe(1);
    });
  });
});
