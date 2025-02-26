"use client";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase/init";
import Link from "next/link";
import { usePathname } from "next/navigation";
import classNames from "classnames";

const NavBar = () => {
  const [user] = useAuthState(auth);
  const pathname = usePathname();

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
        className={classNames(
          "border-4 border-black px-4 py-2 font-bold transition-all",
          {
            "bg-black text-white shadow-[4px_4px_0_0_#333] active:translate-y-1 active:shadow-none":
              isActive,
            "bg-white text-black shadow-[4px_4px_0_0_#000] hover:bg-gray-100 active:translate-y-1 active:shadow-none":
              !isActive,
          }
        )}
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
              <button
                onClick={() => auth.signOut()}
                className="border-4 border-black px-4 py-2 font-bold bg-white text-black shadow-[4px_4px_0_0_#000] hover:bg-gray-100 active:translate-y-1 active:shadow-none transition-all"
              >
                Logout
              </button>
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
