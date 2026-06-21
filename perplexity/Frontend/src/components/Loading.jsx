import React from 'react'

const Loading = ({ message = 'Loading...' }) => {
  return (
    <section className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-100">
      <div className="mx-auto flex min-h-[85vh] w-full max-w-md items-center justify-center">
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-zinc-700/60 bg-zinc-900/80 p-8 shadow-2xl shadow-black/40">
          <div className="h-16 w-16 rounded-full border-4 border-t-transparent border-[#31b8c6] animate-spin" />
          <p className="text-base font-medium text-zinc-100">{message}</p>
        </div>
      </div>
    </section>
  )
}

export default Loading
