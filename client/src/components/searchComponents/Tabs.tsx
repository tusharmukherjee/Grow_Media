import React from 'react';
import { Link, useParams } from 'react-router-dom';

const Tabs:React.FC = () => {
  const {searchquery} = useParams();
  return (
        <div className=' sm:col-start-1 sm:col-span-8 col-start-1 col-span-8 grid grid-cols-4 mb-8 sticky top-12 lg:z-50'>
          <Link to={`/search/blogs/${searchquery}`} className='col-span-2'>
            <div className=' active:bg-teal-500 active:text-white bg-white text-teal-600 py-1 border-r-[1px] border-b-[1px] flex justify-center items-center'>Blogs</div>
          </Link>
          <Link to={`/search/people/${searchquery}`} className='col-span-2'>
            <div className='active:bg-teal-500 active:text-white bg-white text-teal-600 py-1 border-r-[1px] border-b-[1px] flex justify-center items-center'>People</div>
          </Link>
        </div>
      
  );
};

export default Tabs;
