"use client"
import { useParams } from 'next/navigation'
import React from 'react'

const SpecialityPage = async () => {
    const { specialty } = useParams();
    return (
        <div>Specialty: {specialty}</div>
    )
}

export default SpecialityPage