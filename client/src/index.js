import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import "./index.css"

import App from './App'
import UserContext from './context/UserContext';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import SupportPopupProvider from './wrapper/PopupProvider';

// This is the ID of the div in your index.html file

const rootElement = document.getElementById('root');

const root = createRoot(rootElement);

root.render(

    <UserContext>
    <SupportPopupProvider>
     <Provider store={store}>
        <HashRouter>
        {/* <div onContextMenu={(e)=>e.preventDefault()}> */}
          <App />
        {/* </div> */}
        </HashRouter>
     </Provider>
    </SupportPopupProvider>
      </UserContext> 
);