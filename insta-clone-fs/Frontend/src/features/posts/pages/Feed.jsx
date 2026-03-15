import React, { useEffect } from "react";
import "../style/feed.scss";
import Post from "../components/Post";
import { usePost } from "../hook/usePost";
import Nav from "../../shared/components/Nav";

const Feed = () => {
  const {feed,handleGetFeed,loading, handlelike, handleunlike} = usePost()

  useEffect(()=>{
    handleGetFeed()
  },[])

  if(loading || !feed){
    return (<main><h1>Loading...</h1></main>)
  }
  return (
    <main className="feed-page">
      <Nav/>
      <div className="feed">
        <div className="posts">
          {feed.map(post=>{
            return <Post key={post._id} user={post.user} post={post} loading={loading} handlelike={handlelike} handleunlike={handleunlike}/>
          })}
        </div>
      </div>
    </main>
  );
};

export default Feed;
