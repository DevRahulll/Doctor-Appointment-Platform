"use client"

import { generateVideoToken } from "@/actions/appointments";
import useFetch from "@/hooks/use-fetch";
import { format } from "date-fns/format";
import { useRouter } from "next/navigation";
import { useState } from "react"
import { Card, CardContent } from "./ui/card";
import { Calendar, Clock, Stethoscope, User } from "lucide-react";
import { Badge } from "./ui/badge";

export default function AppointmentCard({
    appointment,
    userRole,
    refetchAppointments,
}) {

    const [open, setOpen] = useState(false);
    const [action, setAction] = useState(null); // 'cancel', 'notes', 'video', or 'complete'
    const [notes, setNotes] = useState(appointment.notes || "");
    const router = useRouter();

    // UseFetch hooks for server actions
    const {
        loading: tokenLoading,
        fn: submitTokenRequest,
        data: tokenData,
    } = useFetch(generateVideoToken);

    const formatDateTime = (dateString) => {
        try {
            return format(new Date(dateString), "MMMM d, yyyy 'at' h:mm a");
        } catch (e) {
            return "Invalid date";
        }
    };

    const formatTime = (dateString) => {
        try {
            return format(new Date(dateString), "h:mm a");
        } catch (e) {
            return "Invalid time";
        }
    };

    //...


    // Determine other party information based on user role
    const otherParty =
        userRole === "DOCTOR" ? appointment.patient : appointment.doctor;

    const otherPartyLabel = userRole === "DOCTOR" ? "Patient" : "Doctor";
    const otherPartyIcon = userRole === "DOCTOR" ? <User /> : <Stethoscope />;

    return (
        <>
            <Card className="border-emerald-900/20 hover:border-emerald-700/30 transition-all">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <div className="bg-muted/20 rounded-full p-2 mt-1">
                                {otherPartyIcon}
                            </div>
                            <div>
                                <h3 className="font-medium text-white">
                                    {userRole === "DOCTOR"
                                        ? otherParty.name
                                        : `Dr. ${otherParty.name}`}
                                </h3>
                                {userRole === "DOCTOR" && (
                                    <p className="text-sm text-muted-foreground">
                                        {otherParty.email}
                                    </p>
                                )}
                                {userRole === "PATIENT" && (
                                    <p className="text-sm text-muted-foreground">
                                        {otherParty.specialty}
                                    </p>
                                )}
                                <div className="flex items-center mt-2 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    <span>Date</span>
                                </div>
                                <div className="flex items-center mt-1 text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4 mr-1" />
                                    <span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* <div className="flex flex-col gap-2 self-end md:self-start">
                            <Badge variant={"outline"} className={

                            }>
                                <p>appointment statusappointment status</p>
                                </Badge>
                        </div> */}

                    </div>
                </CardContent>
            </Card>
        </>
    )
}
