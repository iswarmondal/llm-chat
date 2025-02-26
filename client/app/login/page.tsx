"use client";

import { Button, Container, HeadingText } from "@/app/_brutalComponents";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSignInWithGoogle, useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase/init";

export default function Page() {
  const router = useRouter();
  const [signInWithGoogle] = useSignInWithGoogle(auth);
  const [user] = useAuthState(auth);

  useEffect(() => {
    if (user) {
      router.push("/profile");
    }
  });

  const handleLogin = async () => {
    try {
      const result = await signInWithGoogle();
      if (result && result !== null) {
        router.push("/");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-[80vh]">
      <Container
        bgColor="yellow"
        shadowSize="lg"
        className="p-4 m-4 min-h-[40vh] w-[80vw] sm:w-[90vw] md:w-[60vw] lg:w-[40vw] flex flex-col justify-evenly items-center gap-4"
      >
        <HeadingText level={2} color="black">
          Login or Signup
        </HeadingText>

        <Button
          buttonText="Continue with Google"
          buttonType="secondary"
          size="full"
          onClick={handleLogin}
        />
      </Container>
    </div>
  );
}
