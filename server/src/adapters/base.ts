import { NormalizedJobInput, SearchCriteria } from '../types';

export interface SourceAdapter {
  name: string;
  fetch(criteria: SearchCriteria): Promise<NormalizedJobInput[]>;
}