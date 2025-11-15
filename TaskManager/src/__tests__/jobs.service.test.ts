import jobRepository from "@/repositories/jobs/job.repository";
import jobService from "@/services/jobs/jobs.service";

jest.mock("@/repositories/job.repository", () => ({
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
}));

const mockedRepo = jobRepository as unknown as {
  findAll: jest.Mock;
  findOne: jest.Mock;
  create: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
};

describe("JobService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("list should call repository.findAll and return data", async () => {
    const sample = {
      data: [{ id: 1, title: "Title job", locations: ["Hồ Chí Minh: Phú Nhuận"] }],
      pagination: { page: 1, limit: 20, total: 1, total_pages: 1 },
    };
    mockedRepo.findAll.mockResolvedValue(sample);

    const result = await jobService.list({ page: 1, per_page: 20 } as any);

    expect(mockedRepo.findAll).toHaveBeenCalledWith({ page: 1, per_page: 20 });
    expect(result).toEqual(sample);
  });

  test("create should call repository.create and return created job", async () => {
    const payload = { title: "New job" };
    const created = { id: 2, title: "New job" };
    mockedRepo.create.mockResolvedValue(created);

    const result = await jobService.create({ jobData: payload as any });

    expect(mockedRepo.create).toHaveBeenCalledWith(payload);
    expect(result).toEqual(created);
  });

  test("findOne should throw when job not found", async () => {
    mockedRepo.findOne.mockResolvedValue(null);

    await expect(jobService.findOne({ jobId: 999 })).rejects.toThrow();
    expect(mockedRepo.findOne).toHaveBeenCalledWith(999);
  });

  test("delete should throw when repo returns null", async () => {
    mockedRepo.delete.mockResolvedValue(null);

    await expect(jobService.delete({ jobId: 123 })).rejects.toThrow();
    expect(mockedRepo.delete).toHaveBeenCalledWith(123);
  });
});
