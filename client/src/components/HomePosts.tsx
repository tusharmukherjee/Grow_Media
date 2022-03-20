import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { homeBlogsDataStore } from '../features/PostSlice'

type user = {
    profileImg: string |undefined;
    username: string;
    email: string |undefined;
    bio: string |undefined;
    link: string |undefined;
    blogs: UsersBlog[];
}[]

type UserInfoType = {
    user: user
}

type UsersBlog = {
    blog_id: string;
    heading: string;
    content: string;
}

const HomePosts = () => {

const homeBlogsDataSelector: UserInfoType = useSelector(homeBlogsDataStore);

  return (
      <>
       <div className='col-start-2 col-span-6 grid grid-cols-8'> <div className='col-start-2 col-span-6 flex flex-col justify-center items-center'>
        {
            homeBlogsDataSelector?.user[0]?.blogs?.map((el:any) => {
                    <div className='bg-white grid grid-cols-8 items-center pt-8' key={Number(el.blog_id)}>
                        <Link to={`/read/${el.blog_id}`} className='bg-white col-start-2 col-span-6 grid grid-cols-5 grid-rows-6 h-52 mb-8 border rounded-md hover:drop-shadow' >
                                <div className='col-span-3 row-span-1 flex flex-row  items-center border-b-[0.5px]'>
                                    <div className='ml-3 rounded-full h-5 w-5 bg-orange-400'></div>
                                    <h1 className='ml-3'>{homeBlogsDataSelector?.user[0]?.username}</h1>
                                </div>
                                <div className='col-span-3 row-span-4  grid grid-rows-6 '>
                                    <h1 className=' text-xl row-start-1 row-span-3 pl-3 flex items-center'>{el.heading}</h1>
                                    <p className='text-base row-span-3 pl-3 flex items-center'>{el.content.slice(0,120) + "..."}</p>
                                </div>
                                <div className='col-start-4 col-span-2 row-start-1 row-span-6 flex justify-center items-center'>
                                    <div className=' bg-purple-700 w-[12rem] h-[8rem]'></div>
                                </div>
                                <div className=' row-span-1 grid grid-cols-2 w-56 items-center pl-3'>
                                    <div className='col-span-1 flex justify-center'>
                                        10 ♥
                                    </div>
                                    <div className='col-span-1 flex justify-center'>
                                        4 ▲▼
                                    </div>
                                </div> 
                        </Link>      
                    </div>
                }
  )}
                </div>
                </div>
    </>
)
}

export default HomePosts