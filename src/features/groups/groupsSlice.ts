import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Group, GroupMember } from '@/types';
import { SEED_GROUPS } from '@/lib/seedData';

interface GroupsState {
  groups: Group[];
  selectedGroupId: string | null;
  searchQuery: string;
  categoryFilter: string;
}

const STORAGE_KEY = 'splitwise_groups';

const loadInitialGroups = (): Group[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load groups from storage', e);
  }
  return SEED_GROUPS;
};

const initialState: GroupsState = {
  groups: loadInitialGroups(),
  selectedGroupId: null,
  searchQuery: '',
  categoryFilter: 'all'
};

export const groupsSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    setGroups: (state, action: PayloadAction<Group[]>) => {
      state.groups = action.payload;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(action.payload));
    },
    addGroup: (state, action: PayloadAction<Group>) => {
      state.groups.unshift(action.payload);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.groups));
    },
    updateGroup: (state, action: PayloadAction<Group>) => {
      const idx = state.groups.findIndex((g) => g.id === action.payload.id);
      if (idx !== -1) {
        state.groups[idx] = action.payload;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.groups));
      }
    },
    deleteGroup: (state, action: PayloadAction<string>) => {
      state.groups = state.groups.filter((g) => g.id !== action.payload);
      if (state.selectedGroupId === action.payload) {
        state.selectedGroupId = null;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.groups));
    },
    addMemberToGroup: (
      state,
      action: PayloadAction<{ groupId: string; member: GroupMember }>
    ) => {
      const group = state.groups.find((g) => g.id === action.payload.groupId);
      if (group) {
        if (!group.memberIds.includes(action.payload.member.id)) {
          group.memberIds.push(action.payload.member.id);
          group.members.push(action.payload.member);
          group.updatedAt = new Date().toISOString();
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state.groups));
        }
      }
    },
    setSelectedGroupId: (state, action: PayloadAction<string | null>) => {
      state.selectedGroupId = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setCategoryFilter: (state, action: PayloadAction<string>) => {
      state.categoryFilter = action.payload;
    }
  }
});

export const {
  setGroups,
  addGroup,
  updateGroup,
  deleteGroup,
  addMemberToGroup,
  setSelectedGroupId,
  setSearchQuery,
  setCategoryFilter
} = groupsSlice.actions;

export default groupsSlice.reducer;
