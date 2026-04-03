import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';

import Config from 'react-native-config';

const BASE_URL = Config.AUTH_API_URL;

/**
 * Auth API Service
 *
 * RTK Query API definition for Authentication & User endpoints.
 * Base URL: Xano Backend
 *
 * Endpoints:
 * - signUp / signIn: Account creation and login.
 * - forgotPassword / verifyOTP / resendOTP / resetPassword: Password recovery flow.
 * - getProfile / deleteAccount: User management.
 */
export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, {getState}) => {
      const token = getState().auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      // headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['User'],
  endpoints: builder => ({
    signUp: builder.mutation({
      query: userData => ({
        url: '/auth/signup',
        method: 'POST',
        body: userData,
      }),
    }),
    signIn: builder.mutation({
      query: credentials => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    forgotPassword: builder.mutation({
      query: data => ({
        url: '/sendEmail',
        method: 'POST',
        body: data,
      }),
    }),
    verifyOTP: builder.mutation({
      query: ({otp, email}) => ({
        url: `/confirm_otp_new?otp=${otp}&email=${encodeURIComponent(email)}`,
        method: 'GET', // since your API looks like GET with query params
      }),
    }),
    resetPassword: builder.mutation({
      query: resetData => ({
        url: '/update_password_new',
        method: 'PATCH',
        body: resetData,
      }),
    }),
    resendOTP: builder.mutation({
      query: email => ({
        url: '/auth/resend-otp',
        method: 'POST',
        body: {email},
      }),
    }),
    getUserProfile: builder.query({
      query: () => '/auth/profile',
      providesTags: ['User'],
    }),
    getProfile: builder.mutation({
      query: ({email}) => ({
        url: `/Get_user_by_email?email=${email}`,
        method: 'GET', // since your API looks like GET with query params
      }),
    }),
    deleteAccount: builder.mutation({
      query: ({email}) => ({
        url: `/user/delete/`,
        method: 'DELETE',
        body: {email},
      }),
    }),
  }),
});

export const {
  useSignUpMutation,
  useSignInMutation,
  useForgotPasswordMutation,
  useVerifyOTPMutation,
  useResetPasswordMutation,
  useResendOTPMutation,
  useGetUserProfileQuery,
  useGetProfileMutation,
  useDeleteAccountMutation,
} = authApi;
