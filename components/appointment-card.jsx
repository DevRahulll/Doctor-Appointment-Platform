"use client"

import { generateVideoToken } from "@/actions/appointments";
import useFetch from "@/hooks/use-fetch";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react"
import { Card, CardContent } from "./ui/card";
import { Calendar, CheckCircle, Clock, Loader2, Stethoscope, User } from "lucide-react";
import { Badge } from "./ui/badge";
import { addAppointmentNotes, cancelAppointment, markAppointmentCompleted } from "@/actions/doctor";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";

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
    const {
        loading: cancelLoading,
        fn: submitCancel,
        data: cancelData,
    } = useFetch(cancelAppointment);
    const {
        loading: notesLoading,
        fn: submitNotes,
        data: notesData,
    } = useFetch(addAppointmentNotes);
    const {
        loading: completeLoading,
        fn: submitMarkCompleted,
        data: completeData,
    } = useFetch(markAppointmentCompleted);

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

    // Check if appointment can be marked as completed
    const canMarkCompleted = () => {
        if (userRole !== "DOCTOR" || appointment.status !== "SCHEDULED") {
            return false;
        }
        const now = new Date();
        const appointmentEndTime = new Date(appointment.endTime);
        return now >= appointmentEndTime;
    };

    // Handle cancel appointment
    const handleCancelAppointment = async () => {
        if (cancelLoading) return;

        if (
            window.confirm(
                "Are you sure you want to cancel this appointment? This action cannot be undone."
            )
        ) {
            const formData = new FormData();
            formData.append("appointmentId", appointment.id);
            await submitCancel(formData);
        }
    };

    // Handle mark as completed
    const handleMarkCompleted = async () => {
        if (completeLoading) return;

        // Check if appointment end time has passed
        const now = new Date();
        const appointmentEndTime = new Date(appointment.endTime);

        if (now < appointmentEndTime) {
            alert(
                "Cannot mark appointment as completed before the scheduled end time."
            );
            return;
        }

        if (
            window.confirm(
                "Are you sure you want to mark this appointment as completed? This action cannot be undone."
            )
        ) {
            const formData = new FormData();
            formData.append("appointmentId", appointment.id);
            await submitMarkCompleted(formData);
        }
    };

    // Handle save notes (doctor only)
    const handleSaveNotes = async () => {
        if (notesLoading || userRole !== "DOCTOR") return;

        const formData = new FormData();
        formData.append("appointmentId", appointment.id);
        formData.append("notes", notes);
        await submitNotes(formData);
    };

    // Handle join video call
    const handleJoinVideoCall = async () => {
        if (tokenLoading) return;

        setAction("video");

        const formData = new FormData();
        formData.append("appointmentId", appointment.id);
        await submitTokenRequest(formData);
    };


    // Determine other party information based on user role
    const otherParty =
        userRole === "DOCTOR" ? appointment.patient : appointment.doctor;

    const otherPartyLabel = userRole === "DOCTOR" ? "Patient" : "Doctor";
    const otherPartyIcon = userRole === "DOCTOR" ? <User /> : <Stethoscope />;

    // Determine if appointment is active (within 30 minutes of start time)
    const isAppointmentActive = () => {
        const now = new Date();
        const appointmentTime = new Date(appointment.startTime);
        const appointmentEndTime = new Date(appointment.endTime);

        // Can join 30 minutes before start until end time
        return (
            (appointmentTime.getTime() - now.getTime() <= 30 * 60 * 1000 &&
                now < appointmentTime) ||
            (now >= appointmentTime && now <= appointmentEndTime)
        );
    };

    // Handle successful operations
    useEffect(() => {
        if (cancelData?.success) {
            toast.success("Appointment cancelled successfully");
            setOpen(false);
            if (refetchAppointments) {
                refetchAppointments();
            } else {
                router.refresh();
            }
        }
    }, [cancelData, refetchAppointments, router]);

    useEffect(() => {
        if (completeData?.success) {
            toast.success("Appointment marked as completed");
            setOpen(false);
            if (refetchAppointments) {
                refetchAppointments();
            } else {
                router.refresh();
            }
        }
    }, [completeData, refetchAppointments, router]);

    useEffect(() => {
        if (notesData?.success) {
            toast.success("Notes saved successfully");
            setAction(null);
            if (refetchAppointments) {
                refetchAppointments();
            } else {
                router.refresh();
            }
        }
    }, [notesData, refetchAppointments, router]);

    useEffect(() => {
        if (tokenData?.success) {
            // Redirect to video call page with token and session ID
            router.push(
                `/video-call?sessionId=${tokenData.videoSessionId}&token=${tokenData.token}&appointmentId=${appointment.id}`
            );
        } else if (tokenData?.error) {
            setAction(null);
        }
    }, [tokenData, appointment.id, router]);

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

                        <div className="flex flex-col gap-2 self-end md:self-start">
                            <Badge
                                variant={'outline'}
                                className={
                                    appointment.status === "COMPLETED" ? "bg-emerald-900/20 border-emerald-900/30 text-emerald-400" : appointment.status === "CANCELLED" ? "bg-red-900/20 border-red-900/30 text-red-400" : "bg-amber-900/20 border-amber-900/30 text-amber-400"
                                }
                            >
                                {appointment.status}
                            </Badge>
                            <div className="flex gap-2 mt-2 flex-wrap">
                                {
                                    canMarkCompleted() && (
                                        <Button
                                            size="sm"
                                            onClick={handleMarkCompleted}
                                            disabled={completeLoading}
                                            className="bg-emerald-600 hover:bg-emerald-700"
                                        >
                                            {completeLoading ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                    Complete
                                                </>
                                            )}
                                        </Button>
                                    )}
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-emerald-900/30"
                                    onClick={() => setOpen(true)}
                                >
                                    View Details
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

                //appointment dialog
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-white">
                            Appointment Details
                        </DialogTitle>
                        <DialogDescription>
                            {appointment.status === "SCHEDULED"
                                ? "Manage your upcoming appointment"
                                : "View appointment information"}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        //other pary info

                    </div>
                </DialogContent>
            </Dialog>

        </>
    )
}

//todo