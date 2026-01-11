import { getPendingDoctos, getVerifiedDoctors } from '@/actions/admin'
import { TabsContent } from '@/components/ui/tabs'
import React from 'react'
import PendingDoctors from './_components/pending-doctors'

export default async function AdminPage() {
    //fetch all data in parallel
    const [pendingDoctorsData, verifiedDoctorsData] = await Promise.all([
        getPendingDoctos(),
        getVerifiedDoctors(),
    ])
    return (
        <>
            <TabsContent value="pending" className="border-none p-0">
                <PendingDoctors doctors={pendingDoctorsData.doctors || []} />
            </TabsContent>

            <TabsContent value="doctors" className="border-none p-0">
                <PendingDoctors doctors={verifiedDoctorsData.doctors || []} />
            </TabsContent>
        </>
    )
}
