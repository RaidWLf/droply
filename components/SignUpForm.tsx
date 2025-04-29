"use client";

import { useForm } from "react-hook-form";
import { useSignUp } from "@clerk/nextjs";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { signUpSchema } from "@/zodSchemas/signUpSchema";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Divider } from "@heroui/divider";
import {
	Mail,
	Lock,
	AlertCircle,
	CheckCircle,
	Eye,
	EyeOff,
} from "lucide-react";

export default function SignUpForm() {
	// we are doing 2 things in this component
	// 1. Signup form submittion
	// 2. Handling the otp verification

	// signUp : is a function that is used to sign up the user
	// isLoaded : is a boolean that tells us if the signUp function is loaded or not
	// setActive : is a function that is used to set the active user
	const { signUp, isLoaded, setActive } = useSignUp();

	const [verifying, setVerifying] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// seting the authError to null
	// authError : is a string that tells us if there is an error in the sign up process
	// setAuthError : is a function that is used to set the authError
	const [authError, setAuthError] = useState<string | null>(null);

	// verification code is a string that is used to store the verification code
	// setVerificationCode : is a function that is used to set the verification code
	const [verificationCode, setVerificationCode] = useState<string>("");
	const [verificationError, setVerificationError] = useState<string | null>(
		null
	);

	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	// router : is a hook that is used to navigate to different pages
	const router = useRouter();

	// zodResolver : is a function that is used to validate the form data
	// signUpSchema : is a zod schema that is used to validate the form data
	// useForm : is a hook that is used to manage the form data
	// register : is a function that is used to register the form data
	// handleSubmit : is a function that is used to handle the form submission
	// formState : is an object that contains the form state
	// errors : is an object that contains the form errors
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<z.infer<typeof signUpSchema>>({
		resolver: zodResolver(signUpSchema),
		defaultValues: {
			email: "",
			password: "",
			confirmPassword: "",
		},
	});

	const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
		// if the signUp function is not loaded, return
		if (!isLoaded) return;

		// if the signUp function is loaded setIsSubmitting to true and setAuthError to null
		// this is used to show the loading state and catch any errors that occur during the sign up process
		setIsSubmitting(true);
		setAuthError(null);

		try {
			await signUp.create({
				emailAddress: data.email,
				password: data.password,
			});
			await signUp.prepareEmailAddressVerification({
				strategy: "email_code",
			});
			// setVerifying to true to show the otp field this is used to show the otp field
			setVerifying(true);
		} catch (error: any) {
			console.error("Error during sign up:", error);
			setAuthError(error.errors[0]?.message || "An error occurred");
		} finally {
			// finally setIsSubmitting to false to hide the loading state
			setIsSubmitting(false);
		}
	};
	const handleVerificationCodeSubmit = async (
		e: React.FormEvent<HTMLFormElement>
	) => {
		e.preventDefault();
		if (!isLoaded || !signUp) return;
		setIsSubmitting(true);
		setAuthError(null);
		try {
			const result = await signUp.attemptEmailAddressVerification({
				code: verificationCode,
			});

			if (result.status === "complete") {
				await setActive({
					session: result.createdSessionId,
				});
				router.push("/dashboard");
			}
		} catch (error: any) {
			console.error("Error during verification:", error);
			setVerificationError(
				error.errors[0]?.message || "An error occurred"
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	if (verifying) {
		return (
			<Card className="w-full max-w-md border border-default-200 bg-default-50 shadow-xl">
				<CardHeader className="flex flex-col gap-1 items-center pb-2">
					<h1 className="text-2xl font-bold text-default-900">
						Verify Your Email
					</h1>
					<p className="text-default-500 text-center">
						We've sent a verification code to your email
					</p>
				</CardHeader>

				<Divider />

				<CardBody className="py-6">
					{verificationError && (
						<div className="bg-danger-50 text-danger-700 p-4 rounded-lg mb-6 flex items-center gap-2">
							<AlertCircle className="h-5 w-5 flex-shrink-0" />
							<p>{verificationError}</p>
						</div>
					)}

					<form
						onSubmit={handleVerificationCodeSubmit}
						className="space-y-6"
					>
						<div className="space-y-2">
							<label
								htmlFor="verificationCode"
								className="text-sm font-medium text-default-900"
							>
								Verification Code
							</label>
							<Input
								id="verificationCode"
								type="text"
								placeholder="Enter the 6-digit code"
								value={verificationCode}
								onChange={(e) =>
									setVerificationCode(e.target.value)
								}
								className="w-full"
								autoFocus
							/>
						</div>

						<Button
							type="submit"
							color="primary"
							className="w-full"
							isLoading={isSubmitting}
						>
							{isSubmitting ? "Verifying..." : "Verify Email"}
						</Button>
					</form>

					<div className="mt-6 text-center">
						<p className="text-sm text-default-500">
							Didn't receive a code?{" "}
							<button
								onClick={async () => {
									if (signUp) {
										await signUp.prepareEmailAddressVerification(
											{
												strategy: "email_code",
											}
										);
									}
								}}
								className="text-primary hover:underline font-medium"
							>
								Resend code
							</button>
						</p>
					</div>
				</CardBody>
			</Card>
		);
	}

	return (
		<Card className="w-full max-w-md border border-default-200 bg-default-50 shadow-xl">
			<CardHeader className="flex flex-col gap-1 items-center pb-2">
				<h1 className="text-2xl font-bold text-default-900">
					Create Your Account
				</h1>
				<p className="text-default-500 text-center">
					Sign up to start managing your images securely
				</p>
			</CardHeader>

			<Divider />

			<CardBody className="py-6">
				{authError && (
					<div className="bg-danger-50 text-danger-700 p-4 rounded-lg mb-6 flex items-center gap-2">
						<AlertCircle className="h-5 w-5 flex-shrink-0" />
						<p>{authError}</p>
					</div>
				)}

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
					<div className="space-y-2">
						<label
							htmlFor="email"
							className="text-sm font-medium text-default-900"
						>
							Email
						</label>
						<Input
							id="email"
							type="email"
							placeholder="your.email@example.com"
							startContent={
								<Mail className="h-4 w-4 text-default-500" />
							}
							isInvalid={!!errors.email}
							errorMessage={errors.email?.message}
							{...register("email")}
							className="w-full"
						/>
					</div>

					<div className="space-y-2">
						<label
							htmlFor="password"
							className="text-sm font-medium text-default-900"
						>
							Password
						</label>
						<Input
							id="password"
							type={showPassword ? "text" : "password"}
							placeholder="••••••••"
							startContent={
								<Lock className="h-4 w-4 text-default-500" />
							}
							endContent={
								<Button
									isIconOnly
									variant="light"
									size="sm"
									onPress={() =>
										setShowPassword(!showPassword)
									}
									type="button"
								>
									{showPassword ? (
										<EyeOff className="h-4 w-4 text-default-500" />
									) : (
										<Eye className="h-4 w-4 text-default-500" />
									)}
								</Button>
							}
							isInvalid={!!errors.password}
							errorMessage={errors.password?.message}
							{...register("password")}
							className="w-full"
						/>
					</div>

					<div className="space-y-2">
						<label
							htmlFor="passwordConfirmation"
							className="text-sm font-medium text-default-900"
						>
							Confirm Password
						</label>
						<Input
							id="passwordConfirmation"
							type={showConfirmPassword ? "text" : "password"}
							placeholder="••••••••"
							startContent={
								<Lock className="h-4 w-4 text-default-500" />
							}
							endContent={
								<Button
									isIconOnly
									variant="light"
									size="sm"
									onPress={() =>
										setShowConfirmPassword(
											!showConfirmPassword
										)
									}
									type="button"
								>
									{showConfirmPassword ? (
										<EyeOff className="h-4 w-4 text-default-500" />
									) : (
										<Eye className="h-4 w-4 text-default-500" />
									)}
								</Button>
							}
							isInvalid={!!errors.confirmPassword}
							errorMessage={errors.confirmPassword?.message}
							{...register("confirmPassword")}
							className="w-full"
						/>
					</div>

					<div className="space-y-4">
						<div className="flex items-start gap-2">
							<CheckCircle className="h-5 w-5 text-primary mt-0.5" />
							<p className="text-sm text-default-600">
								By signing up, you agree to our Terms of Service
								and Privacy Policy
							</p>
						</div>
					</div>

					<Button
						type="submit"
						color="primary"
						className="w-full"
						isLoading={isSubmitting}
					>
						{isSubmitting
							? "Creating account..."
							: "Create Account"}
					</Button>
				</form>
			</CardBody>

			<Divider />

			<CardFooter className="flex justify-center py-4">
				<p className="text-sm text-default-600">
					Already have an account?{" "}
					<Link
						href="/sign-in"
						className="text-primary hover:underline font-medium"
					>
						Sign in
					</Link>
				</p>
			</CardFooter>
		</Card>
	);
}
