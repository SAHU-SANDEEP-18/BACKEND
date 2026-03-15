import {createPost, getFeed, likePost, unlikePost} from "../services/post.api"
import { useContext, useEffect } from "react"
import { PostContext } from "../post.context"

export const usePost =()=>{
    const context = useContext(PostContext)

    const {loading,setLoading,post,setPost,feed,setFeed} = context

    const handleGetFeed = async ()=>{
        setLoading(true)
        const data = await getFeed()
        setFeed(data.posts.reverse())
        setLoading(false)
    }

    const handleCreatePost = async(imageFile,caption)=>{
        setLoading(true)
        const data = await createPost(imageFile,caption)
        setFeed([data.post], ...feed)
        setLoading(false)
    }

    const handlelike = async (post)=>{
        const data = await likePost(post)
        await handleGetFeed()
    }

    const handleunlike = async (post)=>{
        const data = await unlikePost(post)
        await handleGetFeed()
    }

    useEffect(()=>{
        handleGetFeed()
    },[])

    return {loading, feed, post, handleGetFeed, handleCreatePost, handlelike, handleunlike}
}