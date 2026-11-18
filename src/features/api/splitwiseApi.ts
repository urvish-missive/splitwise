import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { Group, Expense, Settlement } from '@/types';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';

export const splitwiseApi = createApi({
  reducerPath: 'splitwiseApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Groups', 'Expenses', 'Settlements'],
  endpoints: (builder) => ({
    getGroups: builder.query<Group[], void>({
      queryFn: async () => {
        if (!isFirebaseConfigured || !db) {
          // Fall back to localStorage or seed
          try {
            const local = localStorage.getItem('splitwise_groups');
            return { data: local ? JSON.parse(local) : [] };
          } catch {
            return { data: [] };
          }
        }
        try {
          const groupsCol = collection(db, 'groups');
          const snapshot = await getDocs(groupsCol);
          const groups = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Group));
          return { data: groups };
        } catch (error: any) {
          return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        }
      },
      providesTags: ['Groups']
    }),

    getExpensesByGroup: builder.query<Expense[], string>({
      queryFn: async (groupId) => {
        if (!isFirebaseConfigured || !db) {
          try {
            const local = localStorage.getItem('splitwise_expenses');
            const all: Expense[] = local ? JSON.parse(local) : [];
            return { data: all.filter((e) => e.groupId === groupId) };
          } catch {
            return { data: [] };
          }
        }
        try {
          const q = query(
            collection(db, 'expenses'),
            where('groupId', '==', groupId),
            orderBy('date', 'desc')
          );
          const snapshot = await getDocs(q);
          const expenses = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Expense));
          return { data: expenses };
        } catch (error: any) {
          return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        }
      },
      providesTags: (result, error, groupId) => [{ type: 'Expenses', id: groupId }]
    }),

    getSettlementsByGroup: builder.query<Settlement[], string>({
      queryFn: async (groupId) => {
        if (!isFirebaseConfigured || !db) {
          try {
            const local = localStorage.getItem('splitwise_settlements');
            const all: Settlement[] = local ? JSON.parse(local) : [];
            return { data: all.filter((s) => s.groupId === groupId) };
          } catch {
            return { data: [] };
          }
        }
        try {
          const q = query(
            collection(db, 'settlements'),
            where('groupId', '==', groupId),
            orderBy('date', 'desc')
          );
          const snapshot = await getDocs(q);
          const settlements = snapshot.docs.map(
            (d) => ({ id: d.id, ...d.data() } as Settlement)
          );
          return { data: settlements };
        } catch (error: any) {
          return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        }
      },
      providesTags: (result, error, groupId) => [{ type: 'Settlements', id: groupId }]
    })
  })
});

export const {
  useGetGroupsQuery,
  useGetExpensesByGroupQuery,
  useGetSettlementsByGroupQuery
} = splitwiseApi;
