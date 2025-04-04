import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

const initialState = {
    organization: null,
    zohoDomain: Cookies.get("zohoDomain") ? Cookies.get("zohoDomain") : null,
    loader: true,
};

const organizationSlice = createSlice({
    name: "organization",
    initialState,
    reducers: {
        setOrganization: (state, action) => {
            const { organization, zohoDomain } = action.payload;
            state.organization = organization;
            state.zohoDomain = zohoDomain;
            state.loader = false;

            // Store in localStorage and cookies
            localStorage.setItem("zohoDomain", zohoDomain);
            Cookies.set("zohoDomain", zohoDomain, { expires: 7, secure: true });
        },

        clearOrganization: (state) => {
            state.organization = null;
            state.zohoDomain = null;
            state.loader = true;

            // Remove from localStorage and cookies
            localStorage.removeItem("zohoDomain");
            Cookies.remove("zohoDomain");
        },
    },
});

export default organizationSlice;
export const { setOrganization, clearOrganization } = organizationSlice.actions;
