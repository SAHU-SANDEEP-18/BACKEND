import React from 'react'
import { Link } from 'react-router'

const VerifyEmail = () => {
  return (
    <section className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[85vh] w-full max-w-5xl items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-[#31b8c6]/40 bg-zinc-900/70 p-8 shadow-2xl shadow-black/50 backdrop-blur">
          <h1 className="text-3xl font-bold text-[#31b8c6]">Verify your email</h1>
          <p className="mt-4 text-sm text-zinc-300">
            You have successfully registered. Please check your email for a verification link before you can log in.
          </p>
          <p className="mt-4 text-sm text-zinc-300">
            If you don&apos;t see the email, check your spam folder or try again later.
          </p>
          <Link
            to="/login"
            className="mt-8 inline-flex rounded-lg bg-[#31b8c6] px-4 py-3 font-semibold text-zinc-950 transition hover:bg-[#45c7d4]"
          >
            Go to login
          </Link>
        </div>
      </div>
    </section>
  )
}

export default VerifyEmail
