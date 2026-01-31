import { createSlice, createAsyncThunk, createSelector } from "@reduxjs/toolkit";
import api from "../configs/api";


export const fetchWorkspaces = createAsyncThunk(
  "workspace/fetchWorkspaces",
  async ({ getToken }, { rejectWithValue }) => {
    try {
      if (!getToken) return [];
      
      const token = await getToken();
      const { data } = await api.get("/api/workspaces", {
        headers: { Authorization: `Bearer ${token}` },
      });

      return data.workspaces || [];
    } catch (error) {
      console.error("Fetch Workspaces Error:", error);
      return rejectWithValue(error?.response?.data?.message || "Failed to fetch workspaces");
    }
  }
);

const initialState = {
  workspaces: [],
  
  currentWorkspaceId: localStorage.getItem("last_workspace_id") || null,
  loading: false,
  initialized: false, 
  error: null,
};

const workspaceSlice = createSlice({
  name: "workspace",
  initialState,
  reducers: {
    setCurrentWorkspaceId: (state, action) => {
      state.currentWorkspaceId = action.payload;
    
      if (action.payload) {
        localStorage.setItem("last_workspace_id", action.payload);
      }
    },

    
    resetWorkspaces: (state) => {
      state.workspaces = [];
      state.currentWorkspaceId = null;
      state.loading = false;
      state.initialized = false;
      state.error = null;
      localStorage.removeItem("last_workspace_id");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkspaces.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWorkspaces.fulfilled, (state, action) => {
        state.workspaces = action.payload;
        state.loading = false;
        state.initialized = true;

        if (action.payload.length > 0) {
         
          const stillExists = action.payload.find(w => w.id === state.currentWorkspaceId);
          
          if (!stillExists) {
           
            state.currentWorkspaceId = action.payload[0].id;
            localStorage.setItem("last_workspace_id", action.payload[0].id);
          }
        } else {
          state.currentWorkspaceId = null;
        }
      })
      .addCase(fetchWorkspaces.rejected, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.error = action.payload;
      });
  },
});


const selectWorkspaces = (state) => state.workspace.workspaces;
const selectActiveId = (state) => state.workspace.currentWorkspaceId;


export const selectActiveWorkspace = createSelector(
  [selectWorkspaces, selectActiveId],
  (workspaces, activeId) => workspaces.find((w) => w.id === activeId) || null
);

export const { setCurrentWorkspaceId, resetWorkspaces } = workspaceSlice.actions;
export default workspaceSlice.reducer;