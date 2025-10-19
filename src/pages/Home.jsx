import React from 'react';
import Navbar from '../components/Navbar';

const Home = () => {
  return (
    <>
      <Navbar />
      <div className="container py-5">
        <h1 className="text-warning">Home Page</h1>
        <p className="text-white">Landing page placeholder - We'll build this next!</p>
      </div>
    </>
  );
};

export default Home;