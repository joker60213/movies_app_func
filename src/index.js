import React from 'react'
import ReactDOM from 'react-dom/client'
import { Offline, Online } from 'react-detect-offline'

import App from './Components/App/App.jsx'
import NoInternet from './Components/UI/NoInternet/NoInternet.jsx'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <>
    <Online>
      <App />
    </Online>
    <Offline>
      <NoInternet />
    </Offline>
  </>
)
