import React,{useState,useRef} from 'react'
import "../style/createpost.scss"
import { usePost } from '../hook/usePost'
import { useNavigate } from 'react-router'


const CreatePost = () => {
    const [caption, setCaption] = useState("")
    const postImageInputFieldRef = useRef(null)
    const navigate = useNavigate()

    const {loading, handleCreatePost} = usePost()

    async function handeleSubmit(e){
        e.preventDefault()
        const file = postImageInputFieldRef.current.files[0]
        await handleCreatePost(file,caption)
        navigate("/")
    }

    if(loading){
        return (
            <main>
                <h1>creating Post...</h1>
            </main>
        )
    }

  return (
      <main className='create-post-page'>
        <div className="form-container">
            <h1>create post</h1>
            <form onSubmit={handeleSubmit}>
                <label className='post-image-label' htmlFor="postImage">select image</label>
                <input ref={postImageInputFieldRef} hidden type="file" name='postImage' id='postImage'/>
                <input
                    value={caption}
                    onChange={(e)=>{setCaption(e.target.value)}}
                type="text" name='caption' id='caption' placeholder='Enter an caption'/>
                <button className='button primary-button'>create post</button>
            </form>
        </div>
    </main>
  )
}

export default CreatePost