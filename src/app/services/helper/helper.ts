import { Injectable } from '@angular/core';
import { Helper } from '../../domain/helper/helper';

@Injectable()
export class HelperService {
  getHelpers(): Promise<Helper[]> {
    // Replace with real HTTP call if needed
    return Promise.resolve([
      { username: 'alice', points: 120, acceptedRequests: 15 },
      { username: 'bob',   points: 95,  acceptedRequests: 12 },
      { username: 'carol', points: 80,  acceptedRequests: 10 },
      // ...
    ]);
  }
}
