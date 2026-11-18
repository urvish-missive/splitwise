import { describe, it, expect } from 'vitest';
import groupsReducer, {
  addGroup,
  addMemberToGroup,
  deleteGroup
} from './groupsSlice';
import { Group } from '@/types';

describe('groupsSlice', () => {
  const initialGroup: Group = {
    id: 'g1',
    name: 'Road Trip',
    category: 'trip',
    inviteCode: 'ROA-1234',
    currency: 'USD',
    createdBy: 'u1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    memberIds: ['u1'],
    members: [{ id: 'u1', name: 'User 1' }]
  };

  it('handles addGroup', () => {
    const state = groupsReducer(
      { groups: [], selectedGroupId: null, searchQuery: '', categoryFilter: 'all' },
      addGroup(initialGroup)
    );
    expect(state.groups).toHaveLength(1);
    expect(state.groups[0].name).toBe('Road Trip');
  });

  it('handles addMemberToGroup', () => {
    const startState = {
      groups: [initialGroup],
      selectedGroupId: null,
      searchQuery: '',
      categoryFilter: 'all'
    };

    const state = groupsReducer(
      startState,
      addMemberToGroup({
        groupId: 'g1',
        member: { id: 'u2', name: 'User 2' }
      })
    );

    expect(state.groups[0].members).toHaveLength(2);
    expect(state.groups[0].memberIds).toContain('u2');
  });

  it('handles deleteGroup', () => {
    const startState = {
      groups: [initialGroup],
      selectedGroupId: 'g1',
      searchQuery: '',
      categoryFilter: 'all'
    };

    const state = groupsReducer(startState, deleteGroup('g1'));
    expect(state.groups).toHaveLength(0);
    expect(state.selectedGroupId).toBeNull();
  });
});
