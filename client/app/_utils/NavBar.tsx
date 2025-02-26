"use client";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase/init";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import classNames from "classnames";
import { Button } from "@/app/_brutalComponents/";

const NavBar = () => {
  const [user] = useAuthState(auth);
  const pathname = usePathname();
  const router = useRouter();

  const NavLink = ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        className={classNames("px-4 font-bold transition-all", {
          "text-3xl": isActive,
          "hover:text-xl active:translate-y-1 active:shadow-none": !isActive,
        })}
      >
        {children}
      </Link>
    );
  };

  return (
    <nav className="w-full bg-white border-b-4 border-black p-4 z-10">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <Link href="/" className="text-2xl font-bold">
          {/* TODO: Add logo */}
        </Link>

        <div className="flex flex-row gap-4 items-center">
          <NavLink href="/">Home</NavLink>
          {user ? (
            <>
              <NavLink href="/profile">Profile</NavLink>
              <NavLink href="/chat">Chat</NavLink>
              <Button
                onClick={async () => {
                  await auth.signOut();
                  router.push("/login");
                }}
                buttonType="primary"
                size="lg"
                buttonText="Logout"
              />
            </>
          ) : (
            <NavLink href="/login">Login</NavLink>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
