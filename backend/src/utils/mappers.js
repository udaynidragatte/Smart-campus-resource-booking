export function toResource(row) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    capacity: row.capacity,
    location: row.location,
    amenities: typeof row.amenities === "string" ? JSON.parse(row.amenities) : row.amenities,
    status: row.status,
    projectorStatus: row.projector_status,
    imageUrl: row.image_url,
    utilization: row.utilization
  };
}

export function toBooking(row) {
  return {
    id: row.id,
    userId: row.user_id,
    resourceId: row.resource_id,
    resourceName: row.resource_name,
    userName: row.user_name,
    userRole: row.user_role,
    startTime: row.start_time,
    endTime: row.end_time,
    purpose: row.purpose,
    status: row.status,
    priority: row.priority,
    qrPayload: row.qr_payload,
    adminNotes: row.admin_notes
  };
}
