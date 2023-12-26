import { HttpModule } from '@nestjs/axios';
import { Test } from '@nestjs/testing';
import { ImportBlingSalesProcessor } from 'apps/integrations/src/batch/processors/importBlingSalesProcessor';

describe('ImportBlingSalesProcessor - Test Suite', () => {
  let service: ImportBlingSalesProcessor;

  beforeEach(async () => {
    jest.clearAllMocks();

    const mockedModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [ImportBlingSalesProcessor],
    }).compile();

    service = mockedModule.get(ImportBlingSalesProcessor);
  });

  it('Should fetch all companies that have BLING integration', () => {
    // const getAllCompaniesSpy =
  });
});
