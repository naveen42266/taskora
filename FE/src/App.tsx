import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './pages';
import SignIn from './pages/signIn';
import SignUp from './pages/signUp';
import NewHome from './pages/new';
import NewSignIn from './pages/new/signIn';
import NewSignUp from './pages/new/signUp';
import NewFocus from './pages/new/focus';
import NewInsights from './pages/new/insights';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        {/* <Route index path='/' element={<Home />} />
        <Route path='/signIn' element={<SignIn />} />
        <Route path='/signUp' element={<SignUp />} /> */}
        <Route path='/' element={<NewHome />} />
        <Route path='/signIn' element={<NewSignIn />} />
        <Route path='/signUp' element={<NewSignUp />} />
        <Route path='/focus' element={<NewFocus />} />
        <Route path='/insights' element={<NewInsights />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

