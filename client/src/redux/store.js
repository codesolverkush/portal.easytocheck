// // import {configureStore} from "@reduxjs/toolkit";
// // import authSlice from './reducers/auth';



// // const store = configureStore({
// //     reducer: {
// //         [authSlice.name] : authSlice.reducer
// //     }
// // })

// // export default store;


// import { configureStore } from '@reduxjs/toolkit';
// import {
//     persistStore,
//     persistReducer,
//     FLUSH,
//     REHYDRATE,
//     PAUSE,
//     PERSIST,
//     PURGE,
//     REGISTER,
// } from "redux-persist";
// import storage from "redux-persist/lib/storage";

// import authSlice from './reducers/auth';

// const persistConfig = {
//     key: "root",
//     version: 1,
//     storage,
// };

// const rootReducer = persistReducer(persistConfig, authSlice.reducer);

// const store = configureStore({
//     reducer: { auth: rootReducer },
//     middleware: (getDefaultMiddleware) =>
//         getDefaultMiddleware({
//             serializableCheck: {
//                 ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
//             },
//         }),
// });

// export let persistor = persistStore(store);
// export default store;



import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./reducers/auth";
import organizationSlice from "./reducers/organization";

const store = configureStore({
    reducer: {
        auth: authSlice.reducer,
        organization: organizationSlice.reducer, // Add organization reducer
    },
});

export default store;
