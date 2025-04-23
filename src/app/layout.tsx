import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import AuthWrapper from "@/components/AuthWrapper";
import StateWrapper from "@/components/StateWrapper";
import AppWrapper from "@/components/AppWrapper";
import Navbar from "@/components/Navbar";

const font = Inter({
	weight: ["400", "500", "600", "700"],
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "OpenStack Classroom",
	description: "AI powered classroom management system",
	icons: [
		"/internal/favicon.svg"
	]
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={font.className + ' h-screen relative'}>
				<StateWrapper>
					<AppWrapper>
						<AuthWrapper>
							<div className="h-full w-full text-sm flex flex-col">
								<Navbar />
								<div className="flex-grow text-sm w-full flex justify-center overflow-y-auto">
									<div className="w-full">
										{children}
									</div>
								</div>
							</div>
						</AuthWrapper>
					</AppWrapper>
				</StateWrapper>
			</body>
		</html>
	);
}
