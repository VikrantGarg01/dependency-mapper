import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <SignIn 
        routing="path" 
        path="/signin" 
        signUpUrl="/signup"
        afterSignInUrl="/dashboard"  // <-- Add this line
        afterSignUpUrl="/dashboard"  // <-- Add this line
      />
    </div>
  )
}