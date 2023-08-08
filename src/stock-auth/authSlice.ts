import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../app/store";
import { sessionApi } from "../core/api/session";
import { UserContextState } from "../core/api/types/identity/UserContextState";
import LoadingStatus from "../core/loadingStatus";
import { setCookie } from "../core/utils/cookie";

const initialState: UserContextState = {
  user: null,
  isAuthenticated: false,
  authenticationMessage: null,
  status: LoadingStatus.LOADING,
  privilegeScopes: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: () => {
      return { ...initialState, status: LoadingStatus.NOT_AUTHENTICATED };
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(sessionApi.endpoints.login.matchPending, (state, action) => {
        // set is loading if you want
      })
      .addMatcher(
        sessionApi.endpoints.login.matchFulfilled,
        (state, action) => {
          if (action.payload.authenticated) {
            if (process.env.NODE_ENV === "development") {
              setCookie("JSESSIONID", action.payload.sessionId, null);
            }
            state.user = action.payload.user;
            state.isAuthenticated = action.payload.authenticated;
            state.authenticationMessage = null;
            state.status = LoadingStatus.IDLE;
          } else {
            state.authenticationMessage = "Login Failed";
            state.status = LoadingStatus.NOT_AUTHENTICATED;
          }
        }
      )
      .addMatcher(sessionApi.endpoints.login.matchRejected, (state, action) => {
        state.authenticationMessage = "Login Failed";
      })
      .addMatcher(
        sessionApi.endpoints.logout.matchPending,
        (state, action) => {}
      )
      .addMatcher(
        sessionApi.endpoints.logout.matchFulfilled,
        (state, action) => {
          state.user = null;
          state.isAuthenticated = false;
          state.authenticationMessage = null;
          state.status = LoadingStatus.IDLE;
        }
      )
      .addMatcher(
        sessionApi.endpoints.logout.matchRejected,
        (state, action) => {
          state.user = null;
          state.isAuthenticated = false;
          state.authenticationMessage = null;
          state.status = LoadingStatus.IDLE;
        }
      )
      .addMatcher(sessionApi.endpoints.login.matchPending, (state, action) => {
        state.status = LoadingStatus.LOADING;
      })
      .addMatcher(
        sessionApi.endpoints.getSession.matchFulfilled,
        (state, action) => {
          if (action.payload.authenticated) {
            if (process.env.NODE_ENV === "development") {
              setCookie("JSESSIONID", action.payload.sessionId, null);
            }
            state.user = action.payload.user;
            state.isAuthenticated = action.payload.authenticated;
            state.authenticationMessage = null;
            state.status = LoadingStatus.SUCCESS;
          } else {
            state.status = LoadingStatus.IDLE;
          }
        }
      )
      .addMatcher(
        sessionApi.endpoints.getStockManagementSession.matchFulfilled,
        (state, action) => {
          if (action.payload?.privileges) {
            state.privilegeScopes = action.payload.privileges;
          }
        }
      )
      .addMatcher(sessionApi.endpoints.login.matchRejected, (state, action) => {
        state.status = LoadingStatus.FAILED;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
export const selectUserContext = (state: RootState) => state.auth;
export const selectUserId = (state: RootState) => state.auth?.user?.uuid;
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated;
export const selectStatus = (state: RootState) => state.auth.status;
export const selectAuthenticationMessage = (state: RootState) =>
  state.auth.authenticationMessage;
export const selectPrivileges = (state: RootState) =>
  state.auth?.user?.privileges;
export const selectPrivilegeScopes = (state: RootState) =>
  state.auth?.privilegeScopes;
