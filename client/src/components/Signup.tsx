import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Rootpage from './Rootpage'
import { SIGN_UP_MUTATION } from '../gqlQueries/mutations/Allmutation'
import { useMutation } from '@apollo/client';

type mutationType = {
    user_id: Number
    username: String
    email: String
    password: String
}

type mutationVar = {
    input:{
        username:String;
        email: String;
        password: String;
    }
}

const Signup = () => {

    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [emailError, setEmailError] = useState<boolean>(false);

    const emailRegex = RegExp(
        /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
      );
    
    const navigate = useNavigate();

    const [addSignUpInfo,{loading}] = useMutation<{
        createUser: mutationType,
        input: mutationVar
    }>(SIGN_UP_MUTATION,
        {
            onCompleted:() => {
                navigate('/login');
            },
            onError:(error) => {
                console.log(error.message);
            },
            variables:{
                input:{
                    username,
                    email,
                    password
                }
            }
        }
    );

    if (loading) console.log("loading");

    const Sign_up_the_user = async() =>{
        if(email.trim().replace(/\s/g, '').match(emailRegex)){
            setEmailError(false);
            addSignUpInfo();
        }
        else{
            setEmailError(true);
            console.log("email not authorized")
        }
    }


  return (
    <main className='grid sm:grid-rows-6 sm:grid-cols-7 grid-cols-7 h-screen w-screen' >
        <section className=' sm:hidden sm:row-span-2 sm:col-span-7 w-screen h-full sm:rounded-b-full col-span-3 bg-teal-500 grid place-content-center '>
            <Rootpage/>
        </section>
        <section className='  sm:row-span-6 sm:col-span-7 w-screen h-full col-span-4 grid place-content-center '>
            <div className='  sm:z-0 sm:fixed sm:top-0 w-screen h-1/2 sm:rounded-b-full col-span-3 bg-teal-500 grid place-content-center'>
            </div>
            <div className=' bg-white border-[0.25px] h-auto w-auto border-gray-300 rounded-md shadow-md sm:z-10'>
                <div className=' grid place-content-center py-5 sm:gap-4'>
                    <h1 className=' font-light text-teal-500 sm:text-4xl text-2xl text-center mb-8 '>Sign Up</h1>
                    <div className=" my-5">
                        <input type="text" onChange={(e) => setUsername((e.target.value).trim().replace(/\s/g, ''))} placeholder='Username' className=' bg-gray-200 text-gray-900 sm:text-lg sm:h-12 sm:w-80 sm:mx-10 h-9 rounded-md outline-0 p-2' required/>
                    </div>
                    <div className=" my-5">
                        <input type="email" onChange={(e) => setEmail((e.target.value).trim().replace(/\s/g, ''))} placeholder='Email' className=' bg-gray-200 text-gray-900 sm:text-lg sm:h-12 sm:w-80 sm:mx-10 h-9 rounded-md outline-0 p-2' required/>
                    </div>
                    <div className=" my-5">
                        <input onKeyDownCapture={(e) => e.key === 'Enter' && Sign_up_the_user()} type="password" onChange={(e) => setPassword((e.target.value).trim())} placeholder='Password' className=' bg-gray-200 text-gray-900 sm:text-lg sm:h-12 sm:w-80 sm:mx-10 h-9 rounded-md outline-0 p-2' required/>
                    </div>
                    <div className=" sm:text-lg mt-5 flex justify-around">
                        <Link to="/login" className=' text-blue-700'>
                            <button>
                                Log in?
                            </button>
                        </Link>
                        <button onClick={() => Sign_up_the_user()} className=' bg-teal-500 rounded-md outline-0 hover:bg-teal-700 text-white py-1 px-2 '>
                            Sign Up
                        </button>
                    </div>
                    {(emailError)?(<><p className=' text-red-600 mt-5 sm:w-full text-center sm:text-lg text-sm' >Email not recognized</p></>):(<></>)}
                </div>
            </div>
        </section>
    </main>
  )
}

export default Signup