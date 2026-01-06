"use client";

import React, { useState } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { toast } from "sonner";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const LoginPage = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);
    toast.success("Logged in successfully", { richColors: true });

    if (res?.error) {
      toast.error("Invalid email or password", { richColors: true });
      return;
    }

    router.push("/trainings?type=cleaning");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f8f9fc] p-4">
      <div className="w-full max-w-[440px] bg-white rounded-xl p-10 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-center">
          <Image
            src="/logo-simple.svg"
            alt="Luna logo"
            width={34}
            height={34}
            priority
          />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-[28px] font-bold text-[#0f172a] mb-2 tracking-tight">
            Welcome back to Luna AI
          </h1>
          <p className="text-[#64748b] text-[15px]">
            Please enter your details to access your account.
          </p>
        </div>

        {error && (
          <p className="mb-4 text-sm text-red-500 text-center">{error}</p>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#334155] ml-1">
              Email
            </label>
            <Input
              type="email"
              required
              placeholder="Enter email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#334155] ml-1">
              Password
            </label>

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="cursor-pointer absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="size-5" />
                ) : (
                  <Eye className="size-5" />
                )}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between px-1">
            <label className="flex items-center gap-3 cursor-pointer group">
              <Checkbox className="flex items-center justify-center text-link size-5 cursor-pointer data-[state=checked]:bg-[#1a56ff] data-[state=checked]:border-[#1a56ff] data-[state=checked]:text-white" />
              <span className="text-[14px] font-medium text-[#475569] group-hover:text-[#1e293b] transition-colors">
                Remember me
              </span>
            </label>

            <Link
              href="/auth/forgot-password"
              className="cursor-pointer text-[14px] font-medium text-[#475569] hover:text-[#1a56ff] transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <Button type="submit" className="w-full text-sm cursor-pointer flex items-center gap-2" disabled={loading}>
            {loading && <Loader2 className="size-4 animate-spin"/>}
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">
              Or continue with
            </span>
          </div>
        </div>

        <Button 
          variant="outline" 
          className="w-full flex items-center gap-2 cursor-pointer"
          onClick={() => signIn("azure-ad", { callbackUrl: "/trainings?type=cleaning" })}
          type="button"
        >
          <svg className="h-5 w-5" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill="#f35325" d="M1 1h10v10H1z"/>
            <path fill="#81bc06" d="M12 1h10v10H12z"/>
            <path fill="#05a6f0" d="M1 12h10v10H1z"/>
            <path fill="#ffba08" d="M12 12h10v10H12z"/>
          </svg>
          Microsoft Entra ID
        </Button>
      </div>
    </div>
  );
};

export default LoginPage;
