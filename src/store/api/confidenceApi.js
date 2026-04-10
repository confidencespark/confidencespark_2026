import {createApi} from '@reduxjs/toolkit/query/react';
import {confidenceService} from '@lib/confidenceService';

/**
 * Confidence API - Supabase backend
 *
 * Uses confidenceService (Supabase) instead of Xano.
 * All endpoints use queryFn to call the service directly.
 */
export const confidenceApi = createApi({
  reducerPath: 'confidenceApi',
  baseQuery: () => ({data: null}), // Not used; each endpoint uses queryFn
  tagTypes: ['Session', 'Progress'],
  endpoints: builder => ({
    getStarted: builder.mutation({
      queryFn: async () => {
        try {
          const result = await confidenceService.getStarted();
          return {data: result ?? {ok: true}};
        } catch (e) {
          return {error: {status: 'CUSTOM_ERROR', error: e?.message || 'getStarted failed'}};
        }
      },
    }),
    editSituation: builder.mutation({
      queryFn: async (data) => {
        try {
          const result = await confidenceService.editSituation(data);
          return {data: result ?? {ok: true}};
        } catch (e) {
          return {error: {status: 'CUSTOM_ERROR', error: e?.message || 'editSituation failed'}};
        }
      },
    }),
    editMood: builder.mutation({
      queryFn: async (data) => {
        try {
          const result = await confidenceService.editMood(data);
          return {data: result ?? {ok: true}};
        } catch (e) {
          return {error: {status: 'CUSTOM_ERROR', error: e?.message || 'editMood failed'}};
        }
      },
    }),
    confidenceLookup: builder.mutation({
      queryFn: async ({situation_key, vibe_key}) => {
        try {
          const data = await confidenceService.confidenceLookup({situation_key, vibe_key});
          return {data: data ? [data] : []};
        } catch (e) {
          return {error: {status: 'CUSTOM_ERROR', error: e?.message || 'confidenceLookup failed'}};
        }
      },
    }),
  }),
});

export const {
  useGetStartedMutation,
  useEditSituationMutation,
  useEditMoodMutation,
  useConfidenceLookupMutation,
} = confidenceApi;
// ConfidenceSpark workspace batch
