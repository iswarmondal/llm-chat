"use client";

import { Button, Container, HeadingText } from "@/app/_brutalComponents";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSignInWithGoogle, useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/init";

export default function Page() {
  const router = useRouter();
  const [signInWithGoogle] = useSignInWithGoogle(auth);
  const [user] = useAuthState(auth);

  useEffect(() => {
    if (user) {
      router.push("/chat");
    }
  });

  const handleLogin = async () => {
    try {
      const result = await signInWithGoogle();
      // Check if user exists in Firestore after successful authentication
      if (result && result.user) {
        const { uid } = result.user;

        try {
          // Check if user document already exists
          const userDocRef = doc(db, "users", uid);
          const userDoc = await getDoc(userDocRef);

          // If user document doesn't exist, create it
          if (!userDoc.exists()) {
            await setDoc(userDocRef, {
              uid,
              email: result.user.email,
              displayName: result.user.displayName,
              photoURL: result.user.photoURL,
              createdAt: new Date(),
            });
            console.log("New user document created in Firestore");
          } else {
            console.log("User document already exists in Firestore");
          }
        } catch (firestoreError) {
          console.error(
            "Error creating/checking user document:",
            firestoreError
          );
        }
      }
      if (result && result !== null) {
        router.push("/chat");
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
