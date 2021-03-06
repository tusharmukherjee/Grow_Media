import { useEffect } from 'react';
import {BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import Navbar from './components/Navbar';
import Userhome from './components/Userhome';
import People from './components/searchComponents/People';
import Posts from './components/Posts';
import Searchposts from './components/Searchposts';
import Followingspost from './components/Followingspost';
import Editprofile from './components/Editprofile';
import About from './components/About';
import Addblog from './components/Addblog';

import Signup from './components/Signup';
import Login from './components/Login';
import HomePosts from './components/HomePosts';
import Readblog from './components/Readblog';
import { useLazyQuery } from '@apollo/client';
import { FROM_COOKIE } from './gqlQueries/queries/Explorequery';
import { useDispatch } from 'react-redux'
import { logIn, mobiledis, onlinedis } from './features/UserSlice'
import PrivateRoute from './PrivateRoute';
import Notfound from './components/Notfound';
import Appinfo from './components/Appinfo';

type verifyjwtFunc = {
  verifyjwtFunc:{
     user_id: number 
  }
}


function App() {

  const dispatchJwt = useDispatch();

  const [callLazy,{data}]=useLazyQuery<verifyjwtFunc>(FROM_COOKIE);

  useEffect(()=>{
    callLazy();
    if(data){
      dispatchJwt(logIn(data?.verifyjwtFunc))
    }
    (window.innerWidth < 640)? dispatchJwt(mobiledis(true)):dispatchJwt(mobiledis(false))
    dispatchJwt(onlinedis(navigator.onLine));
  },[data,callLazy,dispatchJwt])

  // return ( loading ? <div className='bg-teal-500 w-screen h-screen grid place-items-center'><div className=' h-32 w-32 border-white rounded-full border-t-[1rem] border-[1rem] border-t-teal-900 animate-spin ' ></div></div>:
        return (
          <Router>
              <Routes>
                <Route path='/' element={ <Signup/> }/>
                <Route path='/login' element={<Login/>}/>
                <Route path = '/' element={<><Navbar/></>}>
                  <Route path = "profile" element={ <Userhome/>}>
                    <Route path = ":profile_id" element={<> <PrivateRoute path='/profile/:profile_id'><HomePosts/></PrivateRoute> </>}/>
                    <Route path = "about/:profile_id" element={<> <PrivateRoute path='/about/:profile_id'><About/></PrivateRoute></>}/>
                  </Route>
                <Route path = "/read/:blog_id" element={<PrivateRoute path='/read/:blog_id'><Readblog/></PrivateRoute>}/>
                </Route>
                <Route path = '/' element={<><Navbar/> <div className=' status text-center bg-red-600 text-white'></div></>}>
                    <Route path = "/search/people/:searchquery" element={<><PrivateRoute path="/search/people"><People/></PrivateRoute></>}/>
                    <Route path = "/search/blogs/:searchquery" element={<><PrivateRoute path="/search/blogs"><Searchposts/></PrivateRoute></>}/>
                    <Route path = "/explore" element={<><PrivateRoute path="/explore"><Posts /></PrivateRoute></>}/>
                    <Route path = "/home" element={<><PrivateRoute path="/home"><Followingspost/></PrivateRoute></>}/>
                    <Route path = "/editprofile" element={<><PrivateRoute path="/editprofile"><Editprofile/></PrivateRoute></>}/>
                    <Route path = "/addblog" element={<><PrivateRoute path="/addblog"><Addblog/></PrivateRoute></>}/>
                    <Route path = "/appinfo" element={<><PrivateRoute path="/appinfo"><Appinfo/></PrivateRoute></>}/>
                </Route>
                <Route path='*' element={<Notfound/>} />
              </Routes>
        </Router>
        
        
  )
}

export default App;