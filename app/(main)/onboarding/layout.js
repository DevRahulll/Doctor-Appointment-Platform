import { getCurrentUser } from '@/actions/onboarding'
import { redirect } from 'next/navigation';
import React from 'react'

export const metadata = {
    title: "Onboarding - MediMeet",
    description: "Complete your profile to get started with MediMeet",
};

export default async function OnboardingLayout({ children }) {
    // get complete user profile
    const user = await getCurrentUser();

    //redirect user who completed the onboarding process
    if (user) {
        if (user.role === "PATIENT") {
            redirect("/doctors");
        } else if (user.role === "DOCTOR") {
            // Check verification status for doctors only
            if (user.verificationStatus === "VERIFIED") {
                redirect("/doctor");
            } else {
                redirect("/doctor/verification");
            }
        } else if (user.role === "ADMIN") {
            redirect("/admin");
        }
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Welcome to Medimeet
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Tell us how you want to use the platform
                    </p>
                </div>

                {children}
            </div>
        </div>
    )

}
