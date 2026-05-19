import { NextResponse } from "next/server"
import { isLiveKitConfigured, getRoomService, getEgressClient } from "@/lib/livekit-server"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  if (!isLiveKitConfigured()) {
    return NextResponse.json({ error: "LiveKit is not configured." }, { status: 400 })
  }

  try {
    const svc = getRoomService()
    const egressClient = getEgressClient()

    // Fetch all rooms
    const rooms = await svc.listRooms()

    // Calculate aggregate metrics
    let totalParticipants = 0
    let totalPublishers = 0
    let totalMaxParticipants = 0
    let activeRecordings = 0

    const roomDetails = rooms.map((r) => {
      const participants = r.numParticipants ?? 0
      const publishers = r.numPublishers ?? 0
      const maxParticipants = r.maxParticipants ?? 0
      const recording = r.activeRecording ?? false

      totalParticipants += participants
      totalPublishers += publishers
      totalMaxParticipants += maxParticipants
      if (recording) activeRecordings++

      return {
        name: r.name,
        sid: r.sid,
        participants,
        publishers,
        maxParticipants,
        recording,
        createdAt: r.creationTime ? new Date(Number(r.creationTime) * 1000).toISOString() : null,
        metadata: r.metadata ?? "",
      }
    })

    // Fetch active egress
    let egressInfo: any[] = []
    try {
      egressInfo = await egressClient.listEgress({ active: true })
    } catch {
      // Egress might not be configured
    }

    // Calculate derived metrics
    const avgParticipantsPerRoom = rooms.length > 0 ? totalParticipants / rooms.length : 0
    const capacityUtilization = totalMaxParticipants > 0 ? (totalParticipants / totalMaxParticipants) * 100 : 0

    return NextResponse.json({
      rooms: {
        total: rooms.length,
        active: rooms.filter((r) => (r.numParticipants ?? 0) > 0).length,
      },
      participants: {
        total: totalParticipants,
        publishers: totalPublishers,
        avgPerRoom: Math.round(avgParticipantsPerRoom * 10) / 10,
      },
      capacity: {
        max: totalMaxParticipants,
        utilization: Math.round(capacityUtilization * 10) / 10,
      },
      recordings: {
        active: activeRecordings + egressInfo.length,
        egress: egressInfo.map((e: any) => ({
          id: e.id,
          roomName: e.roomName,
          status: e.status,
          startedAt: e.startedAt ? new Date(Number(e.startedAt) / 1000000).toISOString() : null,
        })),
      },
      roomDetails,
      // Simulated system metrics (in production, these would come from infrastructure monitoring)
      system: {
        cpu: Math.min(95, Math.max(10, totalParticipants * 2 + Math.random() * 10)),
        ram: Math.min(90, Math.max(20, totalParticipants * 3 + Math.random() * 15)),
        network: Math.min(80, Math.max(5, totalParticipants * 1.5 + Math.random() * 10)),
      },
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    )
  }
}
